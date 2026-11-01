// Fahrbare Fahrzeuge draußen: der rosa Mini-Jeep (Elektromotor, gedrosselt auf Schrittgeschwindigkeit, Torben kann ihn
// entdrosseln) und der rote Hoflader (Knicklenker: Vorder- und Hinterwagen knicken im Gelenk, Hubarm mit Palettengabel).
// Ein paar Europaletten stehen rum, die man mit der Gabel aufnehmen, umherfahren und wieder absetzen kann.
// Fahren kann der Spieler (Steuerung über fahrerTasten) oder eine Figur (fahreRoute, mit eigenem Fahrstil).
import * as THREE from 'three';
import { quader, setze, zufall, teil, leinwandTextur, toon } from './toon.js';
import { inHindernis } from './draussen.js';
import { gelaendeHoehe, RING } from './landschaft.js';

// auf der Ringstraße (Hauptstraße)?
const aufRing = (x, z) => Math.abs(Math.hypot(x - RING.x, z - RING.z) - RING.r) < RING.breite / 2 + 0.3;

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
  // Stapel und einzelne Paletten im Hof; dazu einzelne, die verstreut herumliegen (Paket G: einsammeln)
  for (const [x, z, ry, n] of [[6.0, -3.0, 1.57, 3], [8.6, -3.0, 1.6, 1], [-9.8, 12.0, 1.5, 2],
    [11, 10, 0.4, 1], [16, -6, 2.1, 1], [4, 14, 1.1, 1], [-6, 18, 2.6, 1], [20, 2, 0.9, 1], [12, -10, 1.8, 1]]) {
    for (let k = 0; k < n; k++) {
      const p = palette();
      p.position.set(x + (r() - 0.5) * 0.06, k * 0.144, z + (r() - 0.5) * 0.06);
      p.rotation.y = ry + (r() - 0.5) * 0.06;
      palettenBox(p);
    }
  }
  // ---------- Palettenplatz hinter der Werkstatt mit Schild „Paletten“ (Paket G) ----------
  const PALETTEN_PLATZ = { x: -1, z: -7, hx: 2.0, hz: 1.5 };
  {
    const schild = new THREE.Group();
    const tex = leinwandTextur(256, 96, (g, b, h) => {
      g.fillStyle = '#f4efe0'; g.fillRect(0, 0, b, h);
      g.strokeStyle = '#1d1d1f'; g.lineWidth = 6; g.strokeRect(4, 4, b - 8, h - 8);
      g.fillStyle = '#1d1d1f'; g.font = 'bold 44px Bangers, Impact, sans-serif'; g.textAlign = 'center'; g.fillText('PALETTEN', b / 2, 64);
    });
    // Brett: Vorderseite mit Schrift (zeigt vom Haus weg), Rückseite einfach Holz
    schild.add(setze(quader(1.2, 0.46, 0.03, 0x9a7a52, { umriss: 0.003 }), 0, 1.25, 0));
    const vorn = teil(new THREE.PlaneGeometry(1.14, 0.42), 0, { material: toon(0xffffff, { map: tex }), umriss: false });
    vorn.position.set(0, 1.25, -0.017); vorn.rotation.y = Math.PI;
    schild.add(vorn);
    for (const x of [-0.45, 0.45]) schild.add(setze(quader(0.07, 1.04, 0.07, 0x7a5a3a, { umriss: 0.003 }), x, 0.52, 0.05));
    schild.position.set(PALETTEN_PLATZ.x - PALETTEN_PLATZ.hx - 0.4, 0, PALETTEN_PLATZ.z + PALETTEN_PLATZ.hz);
    schild.userData.interaktiv = { id: 'palettenSchild', name: 'Schild: Paletten', station: null };
    if (welt.interaktiv) welt.interaktiv.push(schild);
    scene.add(schild);
  }
  // Paletten, die auf dem Platz stehen (nicht gerade an der Gabel)
  function palettenAmPlatz() {
    return paletten.filter((p) => p.parent === scene && Math.abs(p.position.x - PALETTEN_PLATZ.x) < PALETTEN_PLATZ.hx && Math.abs(p.position.z - PALETTEN_PLATZ.z) < PALETTEN_PLATZ.hz).length;
  }
  const PAL_H = 0.144;
  // liegt (x, z) auf der Grundfläche der Palette p? (gedreht, ohne Weltmatrix: geht auch direkt nach dem Verschieben)
  function aufPalette(p, x, z, rand = 0) {
    const dx = x - p.position.x, dz = z - p.position.z, c = Math.cos(p.rotation.y), sn = Math.sin(p.rotation.y);
    return Math.abs(dx * c - dz * sn) < 0.4 + rand && Math.abs(dx * sn + dz * c) < 0.6 + rand;
  }
  function stuetzHoehe(x, z, ohne) {
    // Oberkante der höchsten Palette unter (x, z), sonst Boden
    let h = 0;
    for (const p of paletten) {
      if ((Array.isArray(ohne) ? ohne.includes(p) : p === ohne) || p.parent !== scene) continue;
      if (aufPalette(p, x, z, 0.02)) h = Math.max(h, p.position.y + PAL_H);
    }
    return h;
  }
  // Ecken und Mitte einer Palette (Welt), für die Auflage
  function palettenPunkte(p, x = p.position.x, z = p.position.z, ry = p.rotation.y) {
    const c = Math.cos(ry), sn = Math.sin(ry);
    return [[0, 0], [-0.36, -0.56], [0.36, -0.56], [-0.36, 0.56], [0.36, 0.56]].map(([lx, lz]) => ({ x: x + lx * c + lz * sn, z: z - lx * sn + lz * c }));
  }
  // worauf eine Palette zu liegen kommt: höchste Oberkante unter einer ihrer Ecken (nie halb in einer anderen)
  function auflage(p, ohne) {
    return Math.max(...palettenPunkte(p).map((q) => stuetzHoehe(q.x, q.z, ohne)));
  }
  // Schwerkraft: jede Palette liegt auf dem Boden oder auf der Palette darunter (nichts schwebt), von unten nach oben
  function palettenSetzen() {
    const liegend = paletten.filter((p) => p.parent === scene).sort((a, b) => a.position.y - b.position.y);
    liegend.forEach((p, i) => {
      const unter = liegend.slice(0, i);
      p.position.y = auflage(p, paletten.filter((q) => !unter.includes(q)));
      p.rotation.x = 0; p.rotation.z = 0;
      palettenBox(p);
    });
  }
  // Stapel über einer Palette (alles, was darauf liegt, auch schief gestapelt)
  function stapelUeber(p) {
    const s = [p];
    for (let neu = true; neu;) {
      neu = false;
      for (const q of paletten) {
        if (s.includes(q) || q.parent !== scene) continue;
        if (s.some((u) => q.position.y > u.position.y + 0.1 && palettenPunkte(q).some((pt) => aufPalette(u, pt.x, pt.z, 0.02)))) { s.push(q); neu = true; }
      }
    }
    return s.sort((a, b) => a.position.y - b.position.y);
  }

  palettenSetzen();

  // ---------- Fahrzeuge ----------
  const jeepG = T.jeep.gruppe;
  const jeep = {
    art: 'jeep', name: 'Mini-Jeep', g: jeepG, hindernis: T.jeep.hindernis,
    x: jeepG.position.x, z: jeepG.position.z, psi: jeepG.rotation.y, v: 0, lenk: 0,
    radstand: 1.2, maxLenk: 0.55, gedrosselt: true,
    // Fahrersitz links (Sitzfläche 0,7 m, Füße auf dem Wagenboden bei 0,2 m), Augenhöhe eines sitzenden Erwachsenen
    sitz: new THREE.Vector3(-0.24, 0.7, -0.36), auge: new THREE.Vector3(-0.24, 1.5, -0.3),
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
  // befreien: hängt ein Fahrzeug fest und man gibt weiter Gas, zählen Hindernisse kurz nicht (nur der Geländerand)
  let befreien = false;
  // Kollision (Paket P5): andere Fahrzeuge als gedrehte Kästen (genau, kein Durchrutschen zwischen Eckpunkten), Paletten
  // als gedrehte Grundflächen. Jeep: keine Palette. Hoflader: über EINE einzelne Palette darf er drüber, über Stapel nicht
  // (die Gabel vorne fährt ohnehin unter die Palette, die Kabine stößt an).
  const fzHindernisse = () => new Set(alle.map((g) => g.hindernis));
  const palHindernisse = () => new Set(paletten.map((q) => q.userData.hindernis));
  function boxenVon(f, x, z, psi, knick = 0) {
    const b = (w, cz, hx, hz) => ({ x: x + Math.sin(w) * cz, z: z + Math.cos(w) * cz, psi: w, hx, hz });
    return f.art === 'jeep' ? [b(psi, -0.03, 0.6, 1.03)] : [b(psi, -0.865, 0.66, 0.8), b(psi + knick, 0.66, 0.66, 0.52)];
  }
  // Überlappung zweier gedrehter Kästen (Trennachsen): 0 = berühren sich nicht, sonst wie tief sie ineinander stecken
  function obbTiefe(a, b) {
    let min = Infinity;
    for (const w of [a.psi, a.psi + Math.PI / 2, b.psi, b.psi + Math.PI / 2]) {
      const ax = Math.sin(w), az = Math.cos(w);
      const r = (o) => o.hz * Math.abs(Math.sin(o.psi) * ax + Math.cos(o.psi) * az) + o.hx * Math.abs(Math.cos(o.psi) * ax - Math.sin(o.psi) * az);
      const ueber = r(a) + r(b) - Math.abs((a.x - b.x) * ax + (a.z - b.z) * az);
      if (ueber <= 0) return 0;
      min = Math.min(min, ueber);
    }
    return min;
  }
  // tiefste Überlappung des Fahrzeugs f (in der Pose boxen) mit einem anderen Fahrzeug
  function fahrzeugTiefe(f, boxen, ohneFz) {
    let t = 0, wer = null;
    for (const g of alle) {
      if (g === f || g === ohneFz || !g.g.visible || g.aufGabel) continue;
      for (const a of boxen) for (const b of boxenVon(g, g.x, g.z, g.psi, g.knick || 0)) {
        const d = obbTiefe(a, b);
        if (d > t) { t = d; wer = g; }
      }
    }
    return { t, wer };
  }
  function punktFrei(x, z, f, spieler, ohne, fzH, palH) {
    if (!welt.draussen.fahrbar(x, z)) { treffer = 'rand'; return false; }
    if (befreien) return true;
    for (const h of welt.hindernisse) {
      if (h === f.hindernis || fzH.has(h) || palH.has(h) || (ohne && ohne.has(h))) continue;
      if (inHindernis(h, x, z)) { treffer = h; return false; }
    }
    // Paletten: Jeep gar nicht, Hoflader nur über eine einzelne
    const hoch = Math.round(stuetzHoehe(x, z, ohne ? paletten.filter((q) => ohne.has(q.userData.hindernis)) : null) / PAL_H);
    if (f.art === 'jeep' ? hoch >= 1 : hoch >= 2) { treffer = 'palette'; return false; }
    for (const p of spieler) if (Math.hypot(x - p.x, z - p.z) < 0.45) { treffer = 'figur'; return false; }
    return true;
  }
  // ohneFz: dieses Fahrzeug zählt nicht (z. B. der Jeep, den der Hoflader gerade schiebt)
  function frei(f, x, z, psi, knick, spieler, ohne, ohneFz) {
    treffer = null;
    const fzH = fzHindernisse(), palH = palHindernisse();
    const ok = (lx, lz, w) => {
      const c = Math.cos(w), sn = Math.sin(w);
      return punktFrei(x + lx * c + lz * sn, z - lx * sn + lz * c, f, spieler, ohne, fzH, palH);
    };
    if (f.art === 'jeep') { if (!f.punkte.every(([lx, lz]) => ok(lx, lz, psi))) return false; }
    else if (!f.hinten.every(([lx, lz]) => ok(lx, lz, psi)) || !f.vorne.every(([lx, lz]) => ok(lx, lz, psi + knick))) return false;
    if (befreien) return true;
    // andere Fahrzeuge: nie (tiefer) hinein; steckt man schon drin (z. B. nach einer Figuren-Fahrt), nur heraus
    const neu = fahrzeugTiefe(f, boxenVon(f, x, z, psi, knick), ohneFz);
    if (neu.t > 0.001) {
      const alt = fahrzeugTiefe(f, boxenVon(f, f.x, f.z, f.psi, f.knick || 0), ohneFz);
      if (neu.t >= alt.t - 1e-4) { treffer = neu.wer.hindernis; return false; }
    }
    return true;
  }

  // Hindernisse, in denen das Fahrzeug gerade schon steckt (z. B. Grill umgefahren und größer geworden, vom Lader geschoben):
  // die zählen für den nächsten Schritt nicht, damit man immer wieder herausfahren kann
  function steckt(f, ohne) {
    const set = new Set(ohne || []);
    const pts = f.art === 'jeep' ? f.punkte.map(([a, b]) => [a, b, f.psi]) : [...f.hinten.map(([a, b]) => [a, b, f.psi]), ...f.vorne.map(([a, b]) => [a, b, f.psi + f.knick])];
    for (const [lx, lz, w] of pts) {
      const c = Math.cos(w), sn = Math.sin(w);
      const px = f.x + lx * c + lz * sn, pz = f.z - lx * sn + lz * c;
      for (const h of welt.hindernisse) if (h !== f.hindernis && inHindernis(h, px, pz)) set.add(h);
    }
    return set.size ? set : ohne;
  }

  // gedrehter Kasten um ein Fahrzeugteil (Mitte cz vor dem Bezugspunkt, halbe Breite/Länge)
  function box(f, psi, cz, hx, hz) { return { x: f.x + Math.sin(psi) * cz, z: f.z + Math.cos(psi) * cz, psi, hx, hz }; }
  function anwenden(f, dWeg) {
    if (f.aufGabel) return;
    // auf dem Gelände: Höhe und Neigung (vorne/hinten, links/rechts) aus dem Boden unter den Rädern
    const lang = f.art === 'jeep' ? 0.8 : 1.0, breit = 0.5;
    const sn = Math.sin(f.psi), cs = Math.cos(f.psi);
    // der Hoflader fährt über einzelne Paletten: die Räder stehen dann oben drauf
    const boden = (x, z) => gelaendeHoehe(x, z) + (f.art === 'lader' ? stuetzHoehe(x, z) : 0);
    const hv = boden(f.x + sn * lang, f.z + cs * lang), hh = boden(f.x - sn * lang, f.z - cs * lang);
    const hl = boden(f.x + cs * breit, f.z - sn * breit), hr = boden(f.x - cs * breit, f.z + sn * breit);
    f.g.position.set(f.x, (hv + hh + hl + hr) / 4, f.z);
    f.g.rotation.set(-Math.atan2(hv - hh, 2 * lang), f.psi, Math.atan2(hl - hr, 2 * breit), 'YXZ');
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
  function schritt(f, dt, gas, lenkSoll, vMax, spieler, frei_ = false) {
    befreien = frei_;
    // entdrosselt zieht der Jeep in gut 1,5 s auf Höchstgeschwindigkeit
    const beschl = f.art === 'jeep' ? (f.gedrosselt ? 2.5 : 7.5) : 2.2;
    const sollV = gas * vMax;
    const dv = sollV - f.v;
    // Bremsen (Gegengas) packt kräftig zu: Jeep 12 m/s², Hoflader 8 m/s²
    const bremst = Math.sign(sollV) !== Math.sign(f.v) && Math.abs(f.v) > 0.05;
    const bremsKraft = f.art === 'jeep' ? 12 : 8;
    f.v += THREE.MathUtils.clamp(dv, -(bremst ? bremsKraft : beschl) * dt, (bremst ? bremsKraft : beschl) * dt);
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
      if (frei(f, x, z, psi, 0, spieler, steckt(f))) { f.x = x; f.z = z; f.psi = psi; anwenden(f, weg); }
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
      const drin = steckt(f);
      let ok = frei(f, J.x, J.z, psi, gNeu, spieler, drin);
      // steht der Jeep im Weg (und fährt nicht gerade der Spieler damit): wegschieben, wenn er Platz hat.
      // Geschoben wird in die Richtung, in die sich der vordere Teil bewegt, und so weit, dass sich nichts überlappt.
      if (!ok && treffer === jeep.hindernis && jeep.fahrer !== 'spieler' && !jeep.aufGabel && frei(f, J.x, J.z, psi, gNeu, spieler, drin, jeep)) {
        const neuB = boxenVon(f, J.x, J.z, psi, gNeu), altB = boxenVon(f, f.x, f.z, f.psi, f.knick);
        const dx = neuB[1].x - altB[1].x, dz = neuB[1].z - altB[1].z, len = Math.hypot(dx, dz) || 0.01;
        ok = false;
        for (const k of [1, 1.5, 2.5, 4]) {
          const nx = jeep.x + (dx / len) * (len * k + 0.01), nz = jeep.z + (dz / len) * (len * k + 0.01);
          const jb = boxenVon(jeep, nx, nz, jeep.psi);
          if (neuB.some((a) => jb.some((b) => obbTiefe(a, b) > 0.001))) continue;
          if (!frei(jeep, nx, nz, jeep.psi, 0, spieler, steckt(jeep), f)) continue;
          const w = Math.hypot(nx - jeep.x, nz - jeep.z);
          jeep.x = nx; jeep.z = nz; anwenden(jeep, w);
          jeep.geschoben = true;
          ok = true;
          break;
        }
        if (!ok) treffer = jeep.hindernis;
      }
      if (ok) { f.x = J.x; f.z = J.z; f.psi = psi; f.knick = gNeu; anwenden(f, weg); }
      else { rums = Math.abs(f.v) > 0.6; f.v = 0; anwenden(f, 0); }
    }
    befreien = false;
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
        for (const p of lader.last) { scene.attach(p); p.rotation.x = 0; p.rotation.z = 0; }
        // sauber stapeln: liegt darunter eine Palette und passt es ungefähr, rutscht der ganze Stapel genau auf sie;
        // sonst stehen die getragenen Paletten wenigstens genau übereinander
        const unten0 = lader.last[0];
        let basis = null, basisH = -1;
        for (const q of paletten) {
          if (lader.last.includes(q) || q.parent !== scene || !aufPalette(q, unten0.position.x, unten0.position.z, 0.05)) continue;
          if (q.position.y > basisH) { basisH = q.position.y; basis = q; }
        }
        const dWinkel = basis ? Math.abs(winkelDiff(unten0.rotation.y, basis.rotation.y)) % Math.PI : 9;
        const passt = basis && Math.hypot(basis.position.x - unten0.position.x, basis.position.z - unten0.position.z) < 0.35 && Math.min(dWinkel, Math.PI - dWinkel) < 0.35;
        const ziel = passt ? basis : unten0;
        for (const p of lader.last) { p.position.x = ziel.position.x; p.position.z = ziel.position.z; p.rotation.y = ziel.rotation.y; }
        lader.last.forEach((p, i) => { p.position.y = 10 + i; }); // erst nach oben, dann fällt alles von unten nach oben an seinen Platz
        palettenSetzen();
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
          // der ganze Stapel darüber kommt mit (beliebig hoch, auch schief gestapelte), nichts bleibt in der Luft hängen
          lader.last = stapelUeber(p);
          for (const q of lader.last) { lader.gabel.attach(q); Object.assign(q.userData.hindernis, AUS); }
          palettenSetzen();
          ereignis = lader.last.length > 1 ? 'aufgenommenMehrere' : 'aufgenommen';
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
  // hindernisse(): Punkte { x, z, r } (Leute, andere Fahrzeuge), vor denen angehalten wird; nach 12 s Warten wird abgebrochen
  async function fahreRoute(f, route, stil, { beiRums, spielerPos, hindernisse, abbruch } = {}) {
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
    let s = 0, v = Math.max(0, f.v), zeit = 0, stoss = 0, wartet = 0;
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
      const hs = hindernisse ? hindernisse() : sp ? [{ x: sp.x, z: sp.z, r: 1.6 }] : [];
      const vorn = punkt(s + 1.4), mitte = punkt(s + 0.4);
      const imWeg = hs.some((h) => Math.min(Math.hypot(vorn.x - h.x, vorn.z - h.z), Math.hypot(mitte.x - h.x, mitte.z - h.z)) < (stil.knapp ? Math.min(h.r, 0.9) : h.r));
      if (imWeg) {
        soll = 0;
        wartet += dt;
        if (wartet > 12) { f.v = 0; return false; }
      } else wartet = 0;
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
    jeep, lader, paletten, alle, palettenAmPlatz, PALETTEN_PLATZ, palettenSetzen, boxenVon, obbTiefe,
    // Höhe, auf der man an (x, z) steht (Paletten), für die Kamera
    bodenHoehe: (x, z) => stuetzHoehe(x, z),
    schritt, gabel, anwenden, fahreRoute, einparken, mitAnfahrt, verstecken, figurRein, figurRaus,
    frei: (f) => frei(f, f.x, f.z, f.psi, f.knick || 0, []),
    // Jeep entdrosseln (Torben)
    entdrosseln() { jeep.gedrosselt = false; },
    // entdrosselt auf der Hauptstraße (Ringstraße) geht noch mehr: 17 m/s
    vMax(f) { return f.art === 'jeep' ? (f.gedrosselt ? 1.4 : aufRing(f.x, f.z) ? 17 : 11) : 4.2; },
    zeitraffer: 1, // nur für Tests
    update(dt) {
      dt *= this.zeitraffer;
      const l = warteListe;
      warteListe = [];
      for (const res of l) res(dt);
    },
  };
}
