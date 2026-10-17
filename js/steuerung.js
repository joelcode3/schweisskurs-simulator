// Ich-Perspektive: Umschauen per Ziehen, Gehen per WASD, Stationen per Knopf, Klick = benutzen.
import * as THREE from 'three';
import { RAUM, AUGENHOEHE, STATIONEN } from './world.js';

export function baueSteuerung(kamera, canvas, welt, beiKlick, beiHover) {
  let gier = 0;
  let nick = -0.12;
  let fahrt = null;
  let gesperrt = false;
  const tasten = new Set();
  const zeiger = new Map();
  let zieh = null;
  const raycaster = new THREE.Raycaster();
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
      let o = h.object;
      while (o && !o.userData.interaktiv) o = o.parent;
      if (o) return { obj: o, info: o.userData.interaktiv, punkt: h.point, abstand: h.distance };
      // Erstes nicht-interaktives Teil verdeckt alles dahinter
      if (!h.object.userData.umriss) return null;
    }
    return null;
  }

  // ---------- Zeiger ----------
  canvas.addEventListener('pointerdown', (e) => {
    if (gesperrt) return;
    canvas.setPointerCapture(e.pointerId);
    zeiger.set(e.pointerId, { x: e.clientX, y: e.clientY });
    zieh = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, t: performance.now(), weg: 0 };
  });
  canvas.addEventListener('pointermove', (e) => {
    if (zieh && zieh.id === e.pointerId && !gesperrt) {
      const dx = e.clientX - zieh.x;
      const dy = e.clientY - zieh.y;
      zieh.x = e.clientX;
      zieh.y = e.clientY;
      zieh.weg += Math.abs(dx) + Math.abs(dy);
      if (zieh.weg > 6) {
        canvas.classList.add('zieht');
        const f = e.pointerType === 'touch' ? 0.0065 : 0.0045;
        gier += dx * f;
        nick = THREE.MathUtils.clamp(nick + dy * f, -1.25, 1.1);
        fahrt = null;
      }
    } else if (e.pointerType === 'mouse' && !gesperrt) {
      const t = treffer(e.clientX, e.clientY);
      beiHover(t, e.clientX, e.clientY);
      canvas.classList.toggle('zeigt', !!t);
    }
  });
  function ende(e) {
    if (!zieh || zieh.id !== e.pointerId) return;
    canvas.classList.remove('zieht');
    const war = zieh;
    zieh = null;
    zeiger.delete(e.pointerId);
    if (gesperrt) return;
    if (war.weg < 10 && performance.now() - war.t < 600) {
      beiKlick(treffer(e.clientX, e.clientY));
    }
  }
  canvas.addEventListener('pointerup', ende);
  canvas.addEventListener('pointercancel', (e) => { zieh = null; zeiger.delete(e.pointerId); canvas.classList.remove('zieht'); });

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    tasten.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => tasten.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => tasten.clear());

  function kollidiert(x, z) {
    const r = 0.3;
    if (x < RAUM.xMin + r || x > RAUM.xMax - r || z < RAUM.zMin + r || z > RAUM.zMax - r) return true;
    for (const h of welt.hindernisse) {
      if (x > h.xMin - r && x < h.xMax + r && z > h.zMin - r && z < h.zMax + r) return true;
    }
    const dp = welt.dennisPosition();
    if (dp && Math.hypot(x - dp.x, z - dp.z) < 0.55) return true;
    return false;
  }

  return {
    get gesperrt() { return gesperrt; },
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
    update(dt) {
      if (fahrt) {
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
      } else if (!gesperrt) {
        let vor = 0;
        let seit = 0;
        if (tasten.has('w') || tasten.has('arrowup')) vor += 1;
        if (tasten.has('s') || tasten.has('arrowdown')) vor -= 1;
        if (tasten.has('a') || tasten.has('arrowleft')) seit -= 1;
        if (tasten.has('d') || tasten.has('arrowright')) seit += 1;
        if (vor || seit) {
          const v = 2.4 * dt / Math.hypot(vor, seit);
          const fx = -Math.sin(gier);
          const fz = -Math.cos(gier);
          const dx = (fx * vor - fz * seit) * v;
          const dz = (fz * vor + fx * seit) * v;
          const p = kamera.position;
          if (!kollidiert(p.x + dx, p.z)) p.x += dx;
          if (!kollidiert(p.x, p.z + dz)) p.z += dz;
        }
      }
      anwenden();
    },
  };
}
