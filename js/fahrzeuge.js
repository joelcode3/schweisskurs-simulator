// Fahrbare Fahrzeuge draußen: der rosa Mini-Jeep (Elektromotor, gedrosselt auf Schrittgeschwindigkeit, Torben kann ihn
// entdrosseln) und der rote Hoflader (Knicklenker: Vorder- und Hinterwagen knicken im Gelenk, Hubarm mit Palettengabel).
// Ein paar Europaletten stehen rum, die man mit der Gabel aufnehmen, umherfahren und wieder absetzen kann.
// Fahren kann der Spieler (Steuerung über fahrerTasten) oder eine Figur (fahreRoute, mit eigenem Fahrstil).
import * as THREE from 'three';
import { quader, setze, zufall } from './toon.js';
import { inHindernis } from './draussen.js';

const richt = (psi) => new THREE.Vector3(Math.sin(psi), 0, Math.cos(psi));
const winkelDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
const AUS = { xMin: 1e9, xMax: 1e9, zMin: 1e9, zMax: 1e9 };

// Gabel: Drehwinkel des Hubarms (0 = so wie gebaut, Gabel knapp über dem Boden)
const PHI_MIN = -0.02, PHI_MAX = 1.1;

export function baueFahrzeuge(scene, welt) {
  const T = welt.draussen.fahrzeuge;
  const r = zufall(515);

  // ---------- Europaletten (1,2 × 0,8 m, 14,4 cm hoch) ----------
  const paletten = [];
  function palette() {
    const p = new THREE.Group();
    const HOLZ = 0xc9a46a, HOLZ_D = 0xa8844e;
    for (let k = 0; k < 5; k++) p.add(setze(quader(0.8, 0.022, 0.1 + (k % 2) * 0.04, k % 2 ? HOLZ : HOLZ_D, { umriss: 0.002 }), 0, 0.133, -0.55 + k * 0.275));
    for (const x of [-0.35, 0, 0.35]) {
      p.add(setze(quader(0.1, 0.022, 1.2, HOLZ_D, { umriss: 0.002 }), x, 0.111, 0));
      for (const z of [-0.55, 0, 0.55]) p.add(setze(quader(0.1, 0.078, x === 0 ? 0.145 : 0.1, 0xb59158, { umriss: 0.002 }), x, 0.061, z));
      p.add(setze(quader(0.1, 0.022, 1.2, HOLZ, { umriss: 0.002 }), x, 0.011, 0));
    }
    // eingebranntes Zeichen auf dem Mittelklotz
    p.add(setze(quader(0.06, 0.03, 0.002, 0x3a2a18, { umriss: false }), 0, 0.06, 0.6));
    // niedrig: Fußgänger steigen drüber (stehen dann obendrauf), Fahrzeuge nicht
    p.userData.hindernis = { ...AUS, niedrig: true };
    welt.hindernisse.push(p.userData.hindernis);
    scene.add(p);
    paletten.push(p);
    return p;
  }
  function palettenBox(p) {
    // achsparalleles Rechteck um die (gedrehte) Palette, für das Hindernis
    const c = Math.abs(Math.cos(p.rotation.y)), s = Math.abs(Math.sin(p.rotation.y));
    const hx = 0.4 * c + 0.6 * s, hz = 0.4 * s + 0.6 * c;
    Object.assign(p.userData.hindernis, { xMin: p.position.x - hx, xMax: p.position.x + hx, zMin: p.position.z - hz, zMax: p.position.z + hz });
  }
  // Stapel und einzelne Paletten im Hof
  for (const [x, z, ry, n] of [[6.0, -3.0, 1.57, 3], [8.6, -3.0, 1.6, 1], [-9.8, 12.0, 1.5, 2]]) {
    for (let k = 0; k < n; k++) {
      const p = palette();
      p.position.set(x + (r() - 0.5) * 0.06, k * 0.144, z + (r() - 0.5) * 0.06);
      p.rotation.y = ry + (r() - 0.5) * 0.06;
      palettenBox(p);
    }
  }
  function stuetzHoehe(x, z, ohne) {
    // Oberkante der höchsten Palette unter (x, z), sonst Boden
    let h = 0;
    for (const p of paletten) {
      if ((Array.isArray(ohne) ? ohne.includes(p) : p === ohne) || p.parent !== scene) continue;
      const lokal = p.worldToLocal(new THREE.Vector3(x, p.position.y, z));
      if (Math.abs(lokal.x) < 0.42 && Math.abs(lokal.z) < 0.62) h = Math.max(h, p.position.y + 0.144);
    }
    return h;
  }

  // ---------- Fahrzeuge ----------
  const jeepG = T.jeep.gruppe;
  const jeep = {
    art: 'jeep', name: 'Mini-Jeep', g: jeepG, hindernis: T.jeep.hindernis,
    x: jeepG.position.x, z: jeepG.position.z, psi: jeepG.rotation.y, v: 0, lenk: 0,
    radstand: 1.2, maxLenk: 0.55, gedrosselt: true,
    // Fahrersitz links (Sitzfläche 0,5 m), Augenhöhe eines sitzenden Erwachsenen
    sitz: new THREE.Vector3(-0.24, 0.5, -0.36), auge: new THREE.Vector3(-0.24, 1.32, -0.3),
    // Umriss für Zusammenstöße (lokal): Ecken und Mitten
    punkte: [[-0.62, 0.98], [0.62, 0.98], [-0.62, -1.02], [0.62, -1.02], [-0.62, 0], [0.62, 0], [0, 1.02], [0, -1.08]],
    park: { x: jeepG.position.x, z: jeepG.position.z, psi: jeepG.rotation.y },
    raeder: T.jeep.raeder, radR: 0.24, fahrer: null,
  };
  const laderG = T.lader.gruppe;
  const lader = {
    art: 'lader', name: 'Hoflader', g: laderG, hindernis: T.lader.hindernis,
    x: laderG.position.x, z: laderG.position.z, psi: laderG.rotation.y, v: 0, knick: 0, phi: 0,
    Lr: 0.75, Lf: 0.75, maxKnick: 0.7, schluessel: true, last: null,
    // Sitz in der Kabine (Oberkante 1,05 m), genug Kopffreiheit bis zum Dach (2,25 m)
    sitz: new THREE.Vector3(0, 1.05, -0.6), auge: new THREE.Vector3(0, 1.86, -0.52),
    hinten: [[-0.68, -1.64], [0.68, -1.64], [-0.68, -0.85], [0.68, -0.85], [-0.68, -0.05], [0.68, -0.05], [0, -1.68]],
    vorne: [[-0.68, 0.12], [0.68, 0.12], [-0.68, 1.18], [0.68, 1.18], [0, 1.2]],
    park: { x: laderG.position.x, z: laderG.position.z, psi: laderG.rotation.y },
    raeder: T.lader.raeder, radR: 0.38, fahrer: null,
    vorneG: T.lader.vorne, hub: T.lader.hub, gabel: T.lader.gabel,
  };
  const alle = [jeep, lader];
  // Fahrer-Anker: hier sitzt eine Figur (Wurzel mit Sitzhöhe 0,5)
  for (const f of alle) {
    f.anker = new THREE.Group();
    f.anker.position.set(f.sitz.x, f.sitz.y - 0.5, f.sitz.z);
    f.g.add(f.anker);
  }

  // letzter Treffer (welches Hindernis hat gebremst?) – für Grill/Tonnen umfahren und Jeep schieben
  let treffer = null;
  function punktFrei(x, z, f, spieler, ohne) {
    if (!welt.draussen.fahrbar(x, z)) { treffer = 'rand'; return false; }
    for (const h of welt.hindernisse) {
      if (h === f.hindernis || (ohne && ohne.has(h))) continue;
      if (f.last && f.last.some((p) => h === p.userData.hindernis)) continue;
      if (inHindernis(h, x, z)) { treffer = h; return false; }
    }
    for (const p of spieler) if (Math.hypot(x - p.x, z - p.z) < 0.45) { treffer = 'figur'; return false; }
    return true;
  }
  // Paletten zählen beim Lader vorne nicht (die Gabel fährt drunter)
  function frei(f, x, z, psi, knick, spieler, ohne) {
    treffer = null;
    const ok = (lx, lz, bx, bz, w) => {
      const c = Math.cos(w), s = Math.sin(w);
      return punktFrei(bx + lx * c + lz * s, bz - lx * s + lz * c, f, spieler, ohne);
    };
    if (f.art === 'jeep') return f.punkte.every(([lx, lz]) => ok(lx, lz, x, z, psi));
    if (!f.hinten.every(([lx, lz]) => ok(lx, lz, x, z, psi))) return false;
    const pal = new Set(paletten.map((p) => p.userData.hindernis));
    const vorneFrei = (lx, lz) => {
      const w = psi + knick, c = Math.cos(w), s = Math.sin(w);
      const px = x + lx * c + lz * s, pz = z - lx * s + lz * c;
      if (!welt.draussen.fahrbar(px, pz)) { treffer = 'rand'; return false; }
      for (const h of welt.hindernisse) {
        if (h === f.hindernis || pal.has(h) || (ohne && ohne.has(h))) continue;
        if (inHindernis(h, px, pz)) { treffer = h; return false; }
      }
      for (const p of spieler) if (Math.hypot(px - p.x, pz - p.z) < 0.45) { treffer = 'figur'; return false; }
      return true;
    };
    return f.vorne.every(([lx, lz]) => vorneFrei(lx, lz));
  }

  // gedrehter Kasten um ein Fahrzeugteil (Mitte cz vor dem Bezugspunkt, halbe Breite/Länge)
  function box(f, psi, cz, hx, hz) { return { x: f.x + Math.sin(psi) * cz, z: f.z + Math.cos(psi) * cz, psi, hx, hz }; }
  function anwenden(f, dWeg) {
    if (f.aufGabel) return;
    f.g.position.set(f.x, 0, f.z);
    f.g.rotation.y = f.psi;
    for (const rad of f.raeder) rad.rotation.x += dWeg / f.radR;
    if (f.art === 'jeep') for (const l of T.jeep.lenkung) l.rotation.y = f.lenk;
    else {
      f.vorneG.rotation.y = f.knick;
      f.hub.rotation.x = -f.phi;
      f.gabel.rotation.x = f.phi;
      T.lader.hydraulik();
    }
    // Hindernis = Rechteck um das ganze Fahrzeug (für Fußgänger und die anderen Fahrzeuge)
    const pts = f.art === 'jeep' ? f.punkte.map(([a, b]) => [a, b, f.psi]) : [...f.hinten.map(([a, b]) => [a, b, f.psi]), ...f.vorne.map(([a, b]) => [a, b, f.psi + f.knick])];
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const [lx, lz, w] of pts) {
      const c = Math.cos(w), s = Math.sin(w);
      const px = f.x + lx * c + lz * s, pz = f.z - lx * s + lz * c;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); z0 = Math.min(z0, pz); z1 = Math.max(z1, pz);
    }
    if (f.g.visible) Object.assign(f.hindernis, { xMin: x0 + 0.05, xMax: x1 - 0.05, zMin: z0 + 0.05, zMax: z1 - 0.05, boxen: f.art === 'jeep'
      ? [box(f, f.psi, -0.03, 0.6, 1.03)]
      : [box(f, f.psi, -0.865, 0.66, 0.8), box(f, f.psi + f.knick, 0.66, 0.66, 0.52)] });
  }
  for (const f of alle) anwenden(f, 0);

  // Ein Zeitschritt: gas -1…1, lenkSoll -1…1 (Jeep: Lenkeinschlag, Lader: Knickgeschwindigkeit)
  // Rückgabe: Drehung des Fahrerhauses (für die Kamera) und ob es gerumst hat
  function schritt(f, dt, gas, lenkSoll, vMax, spieler) {
    // entdrosselt zieht der Jeep in gut 1,5 s auf Höchstgeschwindigkeit
    const beschl = f.art === 'jeep' ? (f.gedrosselt ? 2.5 : 7.5) : 2.2;
    const sollV = gas * vMax;
    const dv = sollV - f.v;
    const bremst = Math.sign(sollV) !== Math.sign(f.v) && Math.abs(f.v) > 0.05;
    f.v += THREE.MathUtils.clamp(dv, -(bremst ? 6 : beschl) * dt, (bremst ? 6 : beschl) * dt);
    if (!gas && Math.abs(f.v) < 0.05) f.v = 0;
    const psiAlt = f.psi;
    let rums = false;
    if (f.art === 'jeep') {
      const soll = lenkSoll * f.maxLenk;
      f.lenk += THREE.MathUtils.clamp(soll - f.lenk, -2.5 * dt, 2.5 * dt);
      const weg = f.v * dt;
      const psi = f.psi + weg * Math.tan(f.lenk) / f.radstand;
      const d = richt(f.psi + (psi - f.psi) / 2);
      const x = f.x + d.x * weg, z = f.z + d.z * weg;
      if (frei(f, x, z, psi, 0, spieler)) { f.x = x; f.z = z; f.psi = psi; anwenden(f, weg); }
      else { rums = Math.abs(f.v) > 0.6; f.v = 0; anwenden(f, 0); }
    } else {
      // Knicklenker: Hinterachse fährt geradeaus, das Gelenk knickt, der Hinterwagen dreht sich nach (Formel Knicklenkung)
      const g = f.knick;
      const gNeu = THREE.MathUtils.clamp(g + lenkSoll * 0.9 * dt, -f.maxKnick, f.maxKnick);
      const dg = gNeu - g;
      const weg = f.v * dt;
      const dpsi = (weg * Math.sin(g) + f.Lf * dg) / (f.Lr * Math.cos(g) + f.Lf);
      const R = new THREE.Vector3(f.x, 0, f.z).addScaledVector(richt(f.psi), -f.Lr).addScaledVector(richt(f.psi), weg);
      const psi = f.psi + dpsi;
      const J = R.addScaledVector(richt(psi), f.Lr);
      let ok = frei(f, J.x, J.z, psi, gNeu, spieler);
      // steht der Jeep im Weg (und fährt nicht gerade der Spieler damit): wegschieben, wenn er Platz hat
      if (!ok && treffer === jeep.hindernis && jeep.fahrer !== 'spieler' && !jeep.aufGabel && frei(f, J.x, J.z, psi, gNeu, spieler, new Set([jeep.hindernis]))) {
        const dx = J.x - f.x, dz = J.z - f.z;
        if (frei(jeep, jeep.x + dx, jeep.z + dz, jeep.psi, 0, spieler, new Set([f.hindernis]))) {
          jeep.x += dx; jeep.z += dz; anwenden(jeep, Math.hypot(dx, dz));
          jeep.geschoben = true;
          ok = true;
        } else treffer = jeep.hindernis;
      }
      if (ok) { f.x = J.x; f.z = J.z; f.psi = psi; f.knick = gNeu; anwenden(f, weg); }
      else { rums = Math.abs(f.v) > 0.6; f.v = 0; anwenden(f, 0); }
    }
    return { dpsi: f.psi - psiAlt, rums, treffer: rums || !f.v ? treffer : null };
  }

  // ---------- Gabel heben/senken, Paletten aufnehmen und absetzen ----------
  const _v = new THREE.Vector3();
  function zinkenMitte() { return lader.gabel.localToWorld(_v.copy(T.lader.zinke)).clone(); }
  function gabel(dt, richtung) {
    if (!richtung) return null;
    let ereignis = null;
    const phiNeu = THREE.MathUtils.clamp(lader.phi + richtung * 0.45 * dt, PHI_MIN, PHI_MAX);
    if (lader.last) {
      // beim Senken: steht der unterste Stapel auf, wird alles abgesetzt (Paletten bleiben aufeinander)
      lader.g.updateMatrixWorld(true);
      const unten = lader.last[0];
      const wp = unten.getWorldPosition(new THREE.Vector3());
      const stuetz = stuetzHoehe(wp.x, wp.z, lader.last);
      if (richtung < 0 && wp.y <= stuetz + 0.01) {
        const dy = stuetz - wp.y;
        for (const p of lader.last) {
          scene.attach(p);
          p.position.y += dy;
          p.rotation.x = 0; p.rotation.z = 0;
          palettenBox(p);
        }
        ereignis = lader.last.length > 1 ? 'abgesetztMehrere' : 'abgesetzt';
        lader.last = null;
      }
    }
    if (jeep.aufGabel) {
      // Jeep absetzen, sobald die Räder unten sind
      lader.g.updateMatrixWorld(true);
      const wp = jeep.g.getWorldPosition(new THREE.Vector3());
      if (richtung < 0 && wp.y <= 0.01) {
        scene.attach(jeep.g);
        jeep.g.position.y = 0;
        const e = new THREE.Euler().setFromQuaternion(jeep.g.quaternion, 'YXZ');
        jeep.g.rotation.set(0, e.y, 0);
        jeep.x = jeep.g.position.x; jeep.z = jeep.g.position.z; jeep.psi = e.y; jeep.v = 0;
        jeep.aufGabel = false;
        anwenden(jeep, 0);
        ereignis = 'jeepAb';
      }
    }
    lader.phi = phiNeu;
    anwenden(lader, 0);
    lader.g.updateMatrixWorld(true);
    if (!lader.last && !jeep.aufGabel && richtung > 0) {
      // Zinken stecken in einer Palette und berühren beim Heben die Deckbretter: Palette hängt an der Gabel,
      // mit allem, was obendrauf gestapelt ist
      const m = zinkenMitte();
      const fRicht = lader.psi + lader.knick;
      for (const p of paletten) {
        if (p.parent !== scene) continue;
        const lokal = p.worldToLocal(m.clone());
        const wDiff = Math.abs(winkelDiff(fRicht, p.rotation.y)) % (Math.PI / 2);
        const gerade = Math.min(wDiff, Math.PI / 2 - wDiff) < 0.45;
        if (gerade && Math.abs(lokal.x) < 0.42 && Math.abs(lokal.z) < 0.62 && lokal.y > 0.02 && lokal.y < 0.135) {
          const stapel = paletten.filter((q) => q !== p && q.parent === scene && Math.hypot(q.position.x - p.position.x, q.position.z - p.position.z) < 0.35 && q.position.y > p.position.y + 0.1)
            .sort((a, b) => a.position.y - b.position.y).slice(0, 4);
          lader.last = [p, ...stapel];
          for (const q of lader.last) { lader.gabel.attach(q); Object.assign(q.userData.hindernis, AUS); }
          ereignis = stapel.length ? 'aufgenommenMehrere' : 'aufgenommen';
          break;
        }
      }
      // oder unter dem Jeep: der wird angehoben (auch wenn jemand drinsitzt)
      if (!lader.last && jeep.fahrer !== 'spieler' && jeep.g.visible) {
        const lokal = jeep.g.worldToLocal(m.clone());
        if (Math.abs(lokal.x) < 0.5 && Math.abs(lokal.z) < 0.85 && lokal.y < 0.35) {
          lader.gabel.attach(jeep.g);
          jeep.aufGabel = true;
          jeep.v = 0;
          Object.assign(jeep.hindernis, AUS, { boxen: null });
          ereignis = 'jeepAuf';
        }
      }
    }
    return ereignis;
  }

  // ---------- Figuren fahren lassen (Route mit Wegpunkten, Fahrstil) ----------
  // stil: { v (Höchstgeschwindigkeit), wackeln (0…1), lenkFaktor, anstoss: Ziel, an dem es rumsen soll }
  function figurRein(f, figur, sitz) {
    f.fahrer = figur;
    figur.halt?.();
    f.anker.add(figur.wurzel);
    figur.wurzel.position.set(0, 0, 0);
    figur.wurzel.rotation.set(0, 0, 0);
    sitz(true);
  }
  function figurRaus(f, figur, sitz, x, z) {
    f.fahrerName = null;
    scene.attach(figur.wurzel);
    figur.wurzel.position.set(x, 0, z);
    figur.wurzel.rotation.set(0, figur.wurzel.rotation.y, 0);
    sitz(false);
    f.fahrer = null;
  }
  // Fährt die Route ab: weiche Bahn durch alle Wegpunkte (die Routen sind so gelegt, dass nichts im Weg steht).
  // Wegpunkt { x, z, v?, rums? } – v = Tempo-Faktor, rums = hier gegen etwas fahren (Rückmeldung über beiRums)
  async function fahreRoute(f, route, stil, { beiRums, spielerPos, abbruch } = {}) {
    // Bahn beginnt in Fahrtrichtung (kein Drehen auf der Stelle)
    const start = new THREE.Vector3(f.x, 0, f.z);
    const pts = [start, start.clone().addScaledVector(richt(f.psi), 0.8), ...route.map((p) => new THREE.Vector3(p.x, 0, p.z))];
    const kurve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const L = kurve.getLength();
    // Bogenlänge jedes Wegpunkts (für Tempo und Rums)
    const marken = route.map((p) => {
      let best = 0, bestD = Infinity;
      for (let k = 0; k <= 400; k++) { const q = kurve.getPointAt(k / 400); const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bestD) { bestD = d; best = k / 400 * L; } }
      return { ...p, s: best, erledigt: false };
    });
    const punkt = (s) => kurve.getPointAt(THREE.MathUtils.clamp(s / L, 0, 1));
    const richtung = (s0, s1) => { const a = punkt(s0), b = punkt(s1); return Math.atan2(b.x - a.x, b.z - a.z); };
    let s = 0, v = Math.max(0, f.v), zeit = 0, stoss = 0;
    f.geschoben = false;
    while (s < L - 0.02) {
      if (abbruch && abbruch()) return false;
      const dt = await naechsterSchritt();
      // jemand hat das Fahrzeug angehoben oder weggeschoben: warten, bis es wieder unten ist, dann ist die Runde vorbei
      if (f.aufGabel) { f.v = 0; continue; }
      if (f.geschoben) { f.geschoben = false; f.v = 0; return false; }
      zeit += dt;
      // Tempo: Fahrstil, langsamer in engen Kurven, an Rums-Stellen und am Ende; vor dem Spieler anhalten
      const krumm = Math.abs(winkelDiff(richtung(s, s + 1), richtung(s + 1, s + 2)));
      let soll = stil.v * (1 - Math.min(0.7, krumm * 1.6));
      for (const m of marken) if (m.v && Math.abs(m.s - s) < 2.5) soll = Math.min(soll, stil.v * m.v);
      soll = Math.min(soll, Math.max(0.6, (L - s) * 1.2));
      const sp = spielerPos ? spielerPos() : null;
      if (sp) {
        const vorn = punkt(s + 1.4);
        if (Math.hypot(vorn.x - sp.x, vorn.z - sp.z) < (stil.knapp ? 0.9 : 1.6)) soll = 0;
      }
      if (stoss > 0) { stoss -= dt; soll = 0; }
      v += THREE.MathUtils.clamp(soll - v, -6 * dt, (f.art === 'jeep' ? 4 : 2.2) * dt);
      const weg = v * dt;
      s = Math.min(L, s + weg);
      // Pose aus der Bahn: Jeep = Punkt + Fahrtrichtung, Lader = Gelenk auf der Bahn, Hinter- und Vorderwagen folgen ihr
      const p = punkt(s);
      const wackel = (stil.wackeln || 0) * Math.sin(zeit * 2.3) * 0.12;
      if (f.art === 'jeep') {
        const psi = richtung(Math.max(0, s - 0.3), s + 0.3);
        const psi2 = richtung(s + 0.3, s + 1.0);
        f.lenk = THREE.MathUtils.clamp(winkelDiff(psi, psi2) * 1.6, -f.maxLenk, f.maxLenk);
        f.psi = psi + wackel;
      } else {
        const hinten = richtung(Math.max(0, s - f.Lr), s);
        const vorne = richtung(s, s + f.Lf);
        f.psi = hinten + wackel * 0.5;
        f.knick = THREE.MathUtils.clamp(winkelDiff(hinten, vorne), -f.maxKnick, f.maxKnick);
      }
      f.x = p.x; f.z = p.z; f.v = v;
      anwenden(f, weg);
      // gegen etwas fahren: kurzer Stoß
      for (const m of marken) if (m.rums && !m.erledigt && s >= m.s - 0.1) { m.erledigt = true; stoss = 0.6; v = 0; if (beiRums) beiRums(m.rums); }
      if (zeit > 180) break;
    }
    f.v = 0;
    return true;
  }
  // zurück auf den Parkplatz: genau hinstellen (weich)
  // Anfahrt zum Parkplatz: 2,5 m davor in Parkrichtung, damit das Fahrzeug gerade reinfährt
  function mitAnfahrt(f, route) {
    const d = richt(f.park.psi);
    return [...route, { x: f.park.x - d.x * 2.5, z: f.park.z - d.z * 2.5 }, { x: f.park.x - d.x * 0.3, z: f.park.z - d.z * 0.3 }];
  }
  async function einparken(f) {
    while (f.aufGabel) await naechsterSchritt();
    const start = { x: f.x, z: f.z, psi: f.psi, knick: f.knick || 0 };
    for (let t = 0; t < 1; ) {
      t += (await naechsterSchritt()) / 1.2;
      const k = Math.min(1, t), e = k * k * (3 - 2 * k);
      f.x = start.x + (f.park.x - start.x) * e;
      f.z = start.z + (f.park.z - start.z) * e;
      f.psi = start.psi + winkelDiff(start.psi, f.park.psi) * e;
      if (f.art === 'lader') f.knick = start.knick * (1 - e);
      f.v = 0;
      anwenden(f, 0);
    }
  }
  let warteListe = [];
  function naechsterSchritt() { return new Promise((res) => warteListe.push(res)); }
  // weg vom Hof (nach rechts den Feldweg runter) und unsichtbar; später zurück
  function verstecken(f, an) { f.g.visible = !an; if (an) Object.assign(f.hindernis, AUS, { boxen: null }); else anwenden(f, 0); }

  return {
    jeep, lader, paletten, alle,
    // Höhe, auf der man an (x, z) steht (Paletten), für die Kamera
    bodenHoehe: (x, z) => stuetzHoehe(x, z),
    schritt, gabel, anwenden, fahreRoute, einparken, mitAnfahrt, verstecken, figurRein, figurRaus,
    frei: (f) => frei(f, f.x, f.z, f.psi, f.knick || 0, []),
    // Jeep entdrosseln (Torben)
    entdrosseln() { jeep.gedrosselt = false; },
    vMax(f) { return f.art === 'jeep' ? (f.gedrosselt ? 1.4 : 11) : 4.2; },
    zeitraffer: 1, // nur für Tests
    update(dt) {
      dt *= this.zeitraffer;
      const l = warteListe;
      warteListe = [];
      for (const res of l) res(dt);
    },
  };
}
