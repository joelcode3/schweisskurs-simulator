// Ich-Perspektive: Computer = Mauszeiger ist gefangen (Pointer Lock) und steht fest in der Bildmitte, Umschauen durch
// Mausbewegung ohne Klicken, Klick = benutzen, was in der Mitte ist. Menüs, Dialoge und Minispiele geben die Maus frei,
// danach wird sie wieder gefangen; Esc = Maus frei (z. B. für die Knöpfe oben). Touch = Wischen. Gehen per WASD.
import * as THREE from 'three';
import { AUGENHOEHE, STATIONEN } from './world.js';
import { inHindernis } from './draussen.js';

export function baueSteuerung(kamera, canvas, welt, beiKlick, beiHover) {
  let gier = 0;
  let nick = -0.12;
  let fahrt = null;
  let gesperrt = false;
  let tempoFaktor = 1;
  let geht = false;
  // Fahrmodus: ein Fahrzeug übernimmt WASD, die Kamera sitzt im Fahrerhaus und dreht sich mit
  let fahrer = null;
  const tasten = new Set();
  // seit dem letzten Bild neu gedrückte Tasten (damit auch ein ganz kurzer Druck ankommt, z. B. E zum Aussteigen)
  const neu = new Set();
  const zeiger = new Map();
  let zieh = null;
  const raycaster = new THREE.Raycaster();
  // Linien (Nähte, Gurte, Kabel) nur bei direktem Treffer zählen: Standard wäre 1 m Abstand, dann „gewinnt“ z. B. die Wäschetasche alles drumherum
  raycaster.params.Line.threshold = 0.02;
  raycaster.far = 6;

  function richtungAus(gierW, nickW) {
    return new THREE.Vector3(-Math.sin(gierW) * Math.cos(nickW), Math.sin(nickW), -Math.cos(gierW) * Math.cos(nickW));
  }
  function winkelZu(von, ziel) {
    const d = new THREE.Vector3().subVectors(ziel, von);
    return { gier: Math.atan2(-d.x, -d.z), nick: Math.atan2(d.y, Math.hypot(d.x, d.z)) };
  }
  function anwenden() {
    const r = richtungAus(gier, nick);
    kamera.lookAt(kamera.position.clone().add(r));
  }
  function kurz(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d;
  }

  function fahreZu(pos, blick, dauer = 0.9) {
    const start = { pos: kamera.position.clone(), gier, nick };
    const w = winkelZu(new THREE.Vector3(...pos), new THREE.Vector3(...blick));
    const ziel = { pos: new THREE.Vector3(...pos), gier: kurz(gier, w.gier), nick: w.nick };
    const weg = start.pos.distanceTo(ziel.pos);
    const d = Math.max(0.35, Math.min(dauer, 0.3 + weg * 0.22));
    return new Promise((res) => { fahrt = { start, ziel, t: 0, d, res }; });
  }

  function dreheZu(punkt, dauer = 0.45) {
    const w = winkelZu(kamera.position, punkt);
    const start = { pos: kamera.position.clone(), gier, nick };
    const ziel = { pos: kamera.position.clone(), gier: kurz(gier, w.gier), nick: THREE.MathUtils.clamp(w.nick, -0.6, 0.4) };
    return new Promise((res) => { fahrt = { start, ziel, t: 0, d: dauer, res }; });
  }

  function station() {
    let beste = null;
    let bestD = 1.4;
    for (const [id, s] of Object.entries(STATIONEN)) {
      const d = Math.hypot(kamera.position.x - s.pos[0], kamera.position.z - s.pos[2]);
      if (d < bestD) { bestD = d; beste = id; }
    }
    return beste;
  }

  function treffer(x, y) {
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, kamera);
    const hits = raycaster.intersectObjects(welt.alleZiele(), true);
    for (const h of hits) {
      // unsichtbare Dinge (z. B. Figuren, die gerade nicht da sind) zählen nicht
      let sichtbar = true;
      for (let q = h.object; q; q = q.parent) if (!q.visible) { sichtbar = false; break; }
      if (!sichtbar) continue;
      let o = h.object;
      while (o && !o.userData.interaktiv) o = o.parent;
      if (o) return { obj: o, info: o.userData.interaktiv, punkt: h.point, abstand: h.distance };
      // Erstes nicht-interaktives Teil verdeckt alles dahinter: als Fläche zurückgeben (zum Ablegen)
      if (!h.object.userData.umriss && !h.object.isSprite) {
        const normale = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 1, 0);
        return { obj: null, info: null, punkt: h.point, normale, abstand: h.distance };
      }
    }
    return null;
  }

  // ---------- Maus gefangen in der Bildmitte (Pointer Lock) ----------
  const mitMaus = window.matchMedia('(pointer: fine)').matches && 'requestPointerLock' in canvas;
  const EMPFINDLICH = 0.0024; // Drehung pro Pixel Mausbewegung
  let gefangen = false;
  let wiederFangen = false; // Maus wurde für ein Fenster freigegeben: danach automatisch wieder fangen
  let hoverTakt = 0;
  const tipp = document.createElement('div');
  tipp.id = 'maus-tipp';
  tipp.className = 'versteckt';
  tipp.textContent = 'Ins Bild klicken: Umschauen mit der Maus. Esc: Maus wieder frei.';
  document.body.appendChild(tipp);
  function fensterOffen() {
    for (const id of ['aktionen', 'dialog', 'minispiel', 'start-einfach', 'start']) {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('versteckt')) return true;
    }
    const b = document.getElementById('dennis-buehne');
    return !!(b && !b.classList.contains('versteckt') && document.getElementById('dennis-weiter')?.offsetParent);
  }
  function mitte() {
    const r = canvas.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function fangen() {
    if (!mitMaus || gefangen || fensterOffen()) return;
    try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch { /* Browser will nicht */ }
  }
  document.addEventListener('pointerlockchange', () => {
    const jetzt = document.pointerLockElement === canvas;
    if (gefangen && !jetzt) {
      // losgelassen: wegen eines Fensters (dann gleich wieder fangen) oder per Esc (dann erst beim nächsten Klick ins Bild)
      wiederFangen = fensterOffen();
      beiHover(null, 0, 0);
    }
    gefangen = jetzt;
    canvas.classList.toggle('gefangen', gefangen);
  });
  // Mausbewegung dreht die Sicht (nur gefangen)
  document.addEventListener('mousemove', (e) => {
    if (!gefangen || gesperrt || fahrt) return;
    gier -= e.movementX * EMPFINDLICH;
    nick = THREE.MathUtils.clamp(nick - e.movementY * EMPFINDLICH, -1.25, 1.1);
  });
  // nach einem Klick auf einen Fensterknopf (Menü zu, Minispiel fertig): Maus wieder fangen
  document.addEventListener('click', () => {
    if (!wiederFangen) return;
    setTimeout(() => { if (wiederFangen && !fensterOffen()) { wiederFangen = false; fangen(); } }, 0);
  }, true);
  function mausUpdate(dt) {
    if (!mitMaus) return;
    const offen = fensterOffen();
    // Fenster geht auf: Maus freigeben, damit man die Knöpfe anklicken kann
    if (gefangen && offen) { wiederFangen = true; document.exitPointerLock(); }
    tipp.classList.toggle('versteckt', gefangen || offen || wiederFangen);
    // Name von dem, was in der Bildmitte ist
    if (gefangen && !offen) {
      hoverTakt -= dt;
      if (hoverTakt <= 0) {
        hoverTakt = 0.12;
        const m = mitte();
        const t = treffer(m.x, m.y);
        beiHover(t && t.info ? t : null, m.x, m.y);
      }
    }
  }

  // ---------- Zeiger ----------
  canvas.addEventListener('pointerdown', (e) => {
    if (mitMaus && e.pointerType === 'mouse' && !gefangen) { fangen(); return; }
    if (gesperrt) return;
    if (!gefangen) { try { canvas.setPointerCapture(e.pointerId); } catch { /* egal */ } }
    zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
    zieh = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), weg: 0 };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (gefangen) return;
    if (zieh && zieh.id === e.pointerId && !gesperrt) {
      const dx = e.clientX - zieh.x;
      const dy = e.clientY - zieh.y;
      zieh.x = e.clientX;
      zieh.y = e.clientY;
      zieh.weg += Math.abs(dx) + Math.abs(dy);
      if (zieh.weg > 6) {
        canvas.classList.add('zieht');
        const f = e.pointerType === 'touch' ? 0.0085 : 0.007;
        gier += dx * f;
        nick = THREE.MathUtils.clamp(nick + dy * f, -1.25, 1.1);
        fahrt = null;
      }
    } else if (e.pointerType === 'mouse' && !gesperrt) {
      const t = treffer(e.clientX, e.clientY);
      beiHover(t && t.info ? t : null, e.clientX, e.clientY);
      canvas.classList.toggle('zeigt', !!(t && t.info));
    }
  });
  function ende(e) {
    if (!zieh || zieh.id !== e.pointerId) return;
    canvas.classList.remove('zieht');
    const war = zieh;
    zieh = null;
    zeiger.delete(e.pointerId);
    if (gesperrt) return;
    if (gefangen) {
      if (performance.now() - war.t < 600) { const m = mitte(); beiKlick(treffer(m.x, m.y)); }
    } else if (war.weg < 10 && performance.now() - war.t < 600) {
      beiKlick(treffer(e.clientX, e.clientY));
    }
  }
  canvas.addEventListener('pointerup', ende);
  canvas.addEventListener('pointercancel', (e) => { zieh = null; zeiger.delete(e.pointerId); canvas.classList.remove('zieht'); });

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    tasten.add(e.key.toLowerCase());
    if (!e.repeat) neu.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => tasten.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => tasten.clear());

  // Neue Position gesperrt? Steckt man schon in etwas drin (z. B. Dennis ist dicht herangekommen),
  // darf man sich trotzdem bewegen, solange man nicht noch tiefer hineinläuft.
  function kollidiert(x, z) {
    const r = 0.3;
    const p = kamera.position;
    // Werkstatt, Bad und offene WC-Tür sind begehbar
    // steht man schon an einer Stelle, die eigentlich zu eng ist (z. B. nach dem Aussteigen), darf man sich frei herausbewegen
    if (!welt.begehbar(x, z, r)) return welt.begehbar(p.x, p.z, r) || !welt.begehbar(x, z, 0.05);
    const drin = (h, px, pz) => inHindernis(h, px, pz, r);
    for (const h of welt.hindernisse) {
      if (h.niedrig) continue;
      if (drin(h, x, z) && !drin(h, p.x, p.z)) return true;
    }
    const dp = welt.dennisPosition();
    if (dp) {
      const neu = Math.hypot(x - dp.x, z - dp.z);
      if (neu < 0.55 && neu < Math.hypot(p.x - dp.x, p.z - dp.z)) return true;
    }
    for (const fp of welt.figuren ? welt.figuren() : []) {
      const neu = Math.hypot(x - fp.x, z - fp.z);
      if (neu < 0.45 && neu < Math.hypot(p.x - fp.x, p.z - fp.z)) return true;
    }
    return false;
  }

  return {
    get gesperrt() { return gesperrt; },
    treffer, // auch für Tests
    sperre(an) { gesperrt = an; if (an) { tasten.clear(); zieh = null; canvas.classList.remove('zieht', 'zeigt'); } },
    fahreZu,
    dreheZu,
    station,
    zuStation(id) {
      const s = STATIONEN[id];
      return fahreZu(s.pos, s.blick);
    },
    setze(pos, blick) {
      kamera.position.set(...pos);
      const w = winkelZu(new THREE.Vector3(...pos), new THREE.Vector3(...blick));
      gier = w.gier;
      nick = w.nick;
      anwenden();
    },
    blickRichtung() { return richtungAus(gier, nick); },
    set tempo(f) { tempoFaktor = f; },
    // ctrl.steuern(tasten, dt) -> { dpsi, auge: Vector3 } ; null = wieder zu Fuß
    fahrModus(ctrl, blickPsi) {
      fahrer = ctrl;
      if (ctrl && fahrt) { const r = fahrt.res; fahrt = null; r(); }
      if (ctrl && blickPsi !== undefined) { gier = blickPsi + Math.PI; nick = -0.12; }
      if (!ctrl) kamera.position.y = AUGENHOEHE;
    },
    get faehrt() { return !!fahrer; },
    get gefangen() { return gefangen; },
    fangen,
    get geht() { return geht || !!fahrt; },
    update(dt) {
      mausUpdate(dt);
      if (fahrt && !fahrer) {
        fahrt.t += dt;
        const k = Math.min(1, fahrt.t / fahrt.d);
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        kamera.position.lerpVectors(fahrt.start.pos, fahrt.ziel.pos, e);
        gier = fahrt.start.gier + (fahrt.ziel.gier - fahrt.start.gier) * e;
        nick = fahrt.start.nick + (fahrt.ziel.nick - fahrt.start.nick) * e;
        // leichtes Wippen beim Gehen
        if (fahrt.start.pos.distanceTo(fahrt.ziel.pos) > 0.3) kamera.position.y = AUGENHOEHE + Math.sin(k * Math.PI * 6) * 0.02;
        if (k >= 1) {
          const r = fahrt.res;
          fahrt = null;
          kamera.position.y = AUGENHOEHE;
          r();
        }
      } else if (fahrer) {
        const r = fahrer.steuern(gesperrt ? new Set() : tasten, dt, gesperrt ? new Set() : neu);
        gier += r.dpsi;
        kamera.position.copy(r.auge);
        geht = false;
      } else if (!gesperrt) {
        let vor = 0;
        let seit = 0;
        if (tasten.has('w') || tasten.has('arrowup')) vor += 1;
        if (tasten.has('s') || tasten.has('arrowdown')) vor -= 1;
        if (tasten.has('a') || tasten.has('arrowleft')) seit -= 1;
        if (tasten.has('d') || tasten.has('arrowright')) seit += 1;
        geht = !!(vor || seit);
        if (vor || seit) {
          const v = 2.4 * tempoFaktor * dt / Math.hypot(vor, seit);
          const fx = -Math.sin(gier);
          const fz = -Math.cos(gier);
          const dx = (fx * vor - fz * seit) * v;
          const dz = (fz * vor + fx * seit) * v;
          const p = kamera.position;
          const xOk = !kollidiert(p.x + dx, p.z);
          if (xOk) p.x += dx;
          const zOk = !kollidiert(p.x, p.z + dz);
          if (zOk) p.z += dz;
          // auf Paletten steigen: Augenhöhe folgt dem Untergrund
          if (welt.bodenHoehe) {
            const soll = AUGENHOEHE + welt.bodenHoehe(p.x, p.z);
            p.y += (soll - p.y) * Math.min(1, dt * 10);
          }
          // an einer Türkante hängen geblieben: sanft zur Türmitte rutschen
          if (!zOk && Math.abs(dz) > 1e-4 && welt.tuerMitte) {
            const m = welt.tuerMitte(p.x, p.z);
            if (m !== null && Math.abs(m - p.x) > 0.01) {
              const sx = Math.sign(m - p.x) * Math.min(Math.abs(m - p.x), Math.abs(dz) + Math.abs(dx));
              if (!kollidiert(p.x + sx, p.z)) p.x += sx;
            }
          }
        }
      }
      neu.clear();
      anwenden();
    },
  };
}
