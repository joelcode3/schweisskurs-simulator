// Die große Landschaft rund um Dennis' Werkstatt: der Feldweg führt ein ganzes Stück raus bis zur großen Hauptstraße,
// die als riesiger Kreis um alles herum läuft (Leitpfosten, Bäume am Rand). Innerhalb des Kreises kann man überall hin,
// es gibt Hügel zum Hochfahren. Am Feldweg-Ende stehen Dennis' Briefkasten und seine Schilder. Neben der Straße ein kleiner
// Parkplatz mit Lühmanns SB-Laden (Landeier, Mettenden – wir dürfen anschreiben), Peters Kühen im Gehege und dem grünen
// Hühnermobil mit Peters Hühnern. Irgendwo innen neben der Straße liegt ein umgekippter VW T5 Doppelkabine mit Pritsche,
// Reifenspuren führen von der Straße durch die Wiese zu ihm.
import * as THREE from 'three';
import { toon, teil, quader, rundQuader, zylinder, kugel, setze, leinwandTextur, zufall } from './toon.js';

// ---------- Maße ----------
// Ringstraße: Mittelpunkt, Radius (Straßenmitte), Breite. Mit dem entdrosselten Jeep gut 2 Minuten für eine Runde.
export const RING = { x: -110, z: 20, r: 245, breite: 7.5 };
// nach außen darf man nur ein paar Meter neben die Straße
export const RAND_AUSSEN = RING.r + RING.breite / 2 + 5;
export const GELAENDE = { xMin: RING.x - RAND_AUSSEN, xMax: RING.x + RAND_AUSSEN, zMin: RING.z - RAND_AUSSEN, zMax: RING.z + RAND_AUSSEN };
// Feldweg: schließt an die Betonfläche an, läuft in Kurven über die Wiese bis zur Hauptstraße (FELDWEG[0] am Hof)
export const FELDWEG = [[7.3, 9.4], [9.8, 10.3], [12.6, 11.5], [16.5, 12.4], [20.5, 11.2], [24.2, 9.4], [28.5, 9.9], [33, 11.8], [39, 12.6], [46, 11.4],
  [58, 10.5], [70, 7.6], [84, 11.8], [98, 13.5], [111, 10.2], [122, 9.8], [131.2, 10.5]].map(([x, z]) => ({ x, z }));
// Lühmanns Hof (Parkplatz am Straßenrand) und der umgekippte T5: Winkel auf dem Ring
const HOF_WINKEL = 0.55, T5_WINKEL = -0.95;
const ringPunkt = (w, abstand = 0) => ({ x: RING.x + Math.cos(w) * (RING.r - abstand), z: RING.z + Math.sin(w) * (RING.r - abstand) });
export const HOF = ringPunkt(HOF_WINKEL, RING.breite / 2 + 6);
export const T5 = ringPunkt(T5_WINKEL, RING.breite / 2 + 16);

// ---------- Gelände: Hügel innerhalb des Rings, flach am Hof, an Wegen, Straße, Parkplatz und Unfallstelle ----------
const HUEGEL = [[-60, -85, 7, 32], [-150, 70, 9, 42], [25, 95, 5, 24], [-205, -40, 6, 38], [65, -55, 4.5, 22], [-95, 150, 6, 30],
  [-30, -160, 5, 30], [-230, 110, 4, 28], [-140, -120, 6, 34], [-40, 60, 3, 18]];
const FLACH = [{ x: -5, z: 5, r: 60, rand: 25 }, { x: HOF.x, z: HOF.z, r: 32, rand: 14 }, { x: T5.x, z: T5.z, r: 26, rand: 12 }];
const wegKurve = new THREE.CatmullRomCurve3(FELDWEG.map((p) => new THREE.Vector3(p.x, 0, p.z)), false, 'centripetal');
const wegProben = wegKurve.getSpacedPoints(90);
const glatt = (d, a, b) => (d <= a ? 0 : d >= b ? 1 : ((t) => t * t * (3 - 2 * t))((d - a) / (b - a)));
export function gelaendeHoehe(x, z) {
  const dRing = Math.hypot(x - RING.x, z - RING.z);
  if (dRing > RING.r - 10) return 0;
  let m = glatt(RING.r - dRing, 10, 22);
  for (const f of FLACH) { m *= glatt(Math.hypot(x - f.x, z - f.z), f.r, f.r + f.rand); if (!m) return 0; }
  if (x > -10 && z > -20 && z < 40) {
    let best = Infinity;
    for (const q of wegProben) { const d = (q.x - x) ** 2 + (q.z - z) ** 2; if (d < best) best = d; }
    m *= glatt(Math.sqrt(best), 6, 16);
    if (!m) return 0;
  }
  let h = 0.35 * Math.sin(x * 0.045) * Math.sin(z * 0.038) + 0.35;
  for (const [hx, hz, hh, hr] of HUEGEL) h += hh * Math.exp(-(((x - hx) ** 2 + (z - hz) ** 2) / (hr * hr)));
  return h * m;
}
// Steigung (für Fahrzeuge): Höhenunterschied über eine Strecke
export function gelaendeNormale(x, z) {
  const e = 0.6;
  return new THREE.Vector3(gelaendeHoehe(x - e, z) - gelaendeHoehe(x + e, z), 2 * e, gelaendeHoehe(x, z - e) - gelaendeHoehe(x, z + e)).normalize();
}

// Ist (x, z) innerhalb des befahr-/begehbaren Bereichs (innen alles, außen nur bis kurz hinter die Straße)?
export function imKreis(x, z, rand = 0) { return Math.hypot(x - RING.x, z - RING.z) < RAND_AUSSEN - rand; }

// ---------- Eierkarton und Mettenden (Laden und in der Hand gleich): detailliert ----------
let eierEtikett = null, mettEtikett = null;
export function eierKartonModell() {
  const k = new THREE.Group();
  const pappe = 0xb9ab8e, pappeD = 0xa59777;
  // Unterteil: Pappschale mit 10 Mulden (2 x 5), Rand oben
  k.add(setze(quader(0.3, 0.045, 0.13, pappe, { umriss: 0.002 }), 0, 0.0225, 0));
  k.add(setze(quader(0.31, 0.008, 0.14, pappeD, { umriss: 0.001 }), 0, 0.047, 0));
  for (let i = 0; i < 10; i++) {
    const x = -0.12 + (i % 5) * 0.06, z = -0.03 + Math.floor(i / 5) * 0.06;
    k.add(setze(zylinder(0.027, 0.02, 0.03, pappeD, { umriss: false }, 10), x, 0.04, z)); // Mulde
    const ei = kugel(0.021, [0xd9b48a, 0xe8cfa8, 0xf2ead8, 0xcfa478][i % 4], { umriss: 0.001 }, 10);
    ei.scale.set(1, 1.3, 1); ei.position.set(x, 0.072, z);
    k.add(ei);
    // Sprenkel auf den braunen Eiern
    if (i % 2 === 0) for (let j = 0; j < 3; j++) k.add(setze(kugel(0.0025, 0x6a4a2a, { umriss: false }, 4), x + Math.cos(j * 2.1 + i) * 0.019, 0.07 + j * 0.008, z + Math.sin(j * 2.1 + i) * 0.019));
  }
  // aufgeklappter Deckel mit Etikett
  if (!eierEtikett) eierEtikett = leinwandTextur(128, 48, (g, b, h) => { g.fillStyle = '#b9ab8e'; g.fillRect(0, 0, b, h); g.fillStyle = '#f4efe0'; g.fillRect(8, 6, b - 16, h - 12); g.fillStyle = '#2f5a3a'; g.font = '800 15px Arial'; g.textAlign = 'center'; g.fillText('Lühmanns', b / 2, 22); g.font = '600 12px Arial'; g.fillText('10 Landeier', b / 2, 37); });
  const deckel = new THREE.Group();
  deckel.add(setze(quader(0.3, 0.01, 0.13, pappe, { umriss: 0.002 }), 0, 0, -0.065));
  deckel.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: eierEtikett })), 0, 0.0055, -0.065, -Math.PI / 2, 0, Math.PI));
  deckel.position.set(0, 0.05, -0.065);
  deckel.rotation.x = -1.9;
  k.add(deckel);
  return k;
}
export function mettendenModell() {
  const p = new THREE.Group();
  // Pappschale, darüber Folie, drei gebogene Mettenden mit abgebundenen Enden, Etikett
  p.add(setze(quader(0.14, 0.012, 0.24, 0xe8dcb8, { umriss: 0.001 }), 0, 0.006, 0));
  for (let j = 0; j < 3; j++) {
    const x = -0.043 + j * 0.043;
    const kurve = new THREE.CatmullRomCurve3([new THREE.Vector3(x - 0.006, 0, -0.1), new THREE.Vector3(x + 0.006, 0.006, -0.03), new THREE.Vector3(x + 0.006, 0.006, 0.03), new THREE.Vector3(x - 0.006, 0, 0.1)]);
    const w = teil(new THREE.TubeGeometry(kurve, 14, 0.017, 10, false), 0x7a2618, { umriss: 0.0015 });
    w.position.y = 0.03;
    p.add(w);
    for (const zz of [-0.1, 0.1]) {
      p.add(setze(kugel(0.012, 0x5a1a10, { umriss: false }, 6), x - 0.006, 0.03, zz));
      p.add(setze(zylinder(0.004, 0.004, 0.012, 0xe8e0c8, { umriss: false }, 4), x - 0.006, 0.03, zz + Math.sign(zz) * 0.014, Math.PI / 2, 0, 0)); // Bindfaden
    }
    // Fettsprenkel
    for (let k = 0; k < 5; k++) p.add(setze(kugel(0.003, 0xd8a090, { umriss: false }, 4), x + 0.006 * Math.sin(k), 0.046, -0.07 + k * 0.035));
  }
  p.add(setze(quader(0.145, 0.05, 0.245, 0xe8f4f8, { umriss: 0.001, mat: { transparent: true, opacity: 0.22 } }), 0, 0.028, 0)); // Folie
  if (!mettEtikett) mettEtikett = leinwandTextur(96, 48, (g, b, h) => { g.fillStyle = '#f4efe0'; g.fillRect(0, 0, b, h); g.fillStyle = '#c8352a'; g.fillRect(0, 0, b, 12); g.fillStyle = '#1d1d1f'; g.font = '800 13px Arial'; g.textAlign = 'center'; g.fillText('Mettenden', b / 2, 28); g.font = '600 10px Arial'; g.fillText('3 St. · geräuchert', b / 2, 42); });
  p.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.04), new THREE.MeshBasicMaterial({ map: mettEtikett })), 0.02, 0.054, 0.05, -Math.PI / 2, 0, 0));
  return p;
}

export function baueLandschaft(scene, { merke, hindernis, grasTex }) {
  const r = zufall(4242);
  const zuWelt = (gruppe, lx, lz) => new THREE.Vector3(lx, 0, lz).applyMatrix4(gruppe.matrixWorld);
  // gedrehtes Hindernis (Kasten in den lokalen Koordinaten einer Gruppe)
  function drehHindernis(gruppe, lx, lz, hx, hz) {
    gruppe.updateMatrixWorld(true);
    const c = zuWelt(gruppe, lx, lz), psi = gruppe.rotation.y;
    const ex = Math.abs(Math.cos(psi)) * hx + Math.abs(Math.sin(psi)) * hz, ez = Math.abs(Math.sin(psi)) * hx + Math.abs(Math.cos(psi)) * hz;
    const h = hindernis(c.x - ex, c.x + ex, c.z - ez, c.z + ez);
    h.boxen = [{ x: c.x, z: c.z, psi, hx, hz }];
    return h;
  }

  // ---------- Wiese mit Hügeln (nur im Ring), dahinter flache Wiese bis zum Horizont ----------
  {
    const groesse = 2 * (RING.r + 40), seg = 200;
    const geo = new THREE.PlaneGeometry(groesse, groesse, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + RING.x, z = p.getZ(i) + RING.z;
      p.setY(i, gelaendeHoehe(x, z) - 0.012);
    }
    geo.computeVertexNormals();
    // Hügel sichtbar machen: Hänge dunkler, Kuppen heller (Vertex-Farben auf die Gras-Textur)
    const nrm = geo.attributes.normal, farben = [];
    for (let i = 0; i < p.count; i++) {
      const steil = 1 - nrm.getY(i), hoch = Math.min(1, p.getY(i) / 9);
      const f = Math.max(0.6, 1 - steil * 2.2) * (0.94 + hoch * 0.12);
      farben.push(f, f * (1 + hoch * 0.03), f * (0.97 - hoch * 0.05));
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(farben, 3));
    const tex = grasTex.clone();
    tex.needsUpdate = true;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(groesse / 3.3, groesse / 3.3);
    const wiese = new THREE.Mesh(geo, toon(0xffffff, { map: tex, vertexColors: true }));
    wiese.position.set(RING.x, 0, RING.z);
    wiese.receiveShadow = true;
    scene.add(wiese);
    const tex2 = grasTex.clone();
    tex2.needsUpdate = true;
    tex2.wrapS = tex2.wrapT = THREE.RepeatWrapping;
    tex2.repeat.set(600, 600);
    const weit = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), toon(0xffffff, { map: tex2 }));
    weit.rotation.x = -Math.PI / 2;
    weit.position.set(RING.x, -0.06, RING.z);
    scene.add(weit);
  }

  // ---------- Hauptstraße: Asphalt-Ring mit Randlinien und gestrichelter Mittellinie ----------
  const strasseTex = leinwandTextur(64, 256, (g, b, h) => {
    g.fillStyle = '#4a4c50'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 1500; i++) { const v = 50 + r() * 50; g.fillStyle = `rgba(${v},${v},${v + 4},0.5)`; g.fillRect(r() * b, r() * h, 1, 1); }
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,20,22,0.25)'; g.fillRect(r() * b, r() * h, 6 + r() * 10, 3 + r() * 20); } // Flickstellen
    g.fillStyle = '#e8e8e2'; g.fillRect(3, 0, 2, h); g.fillRect(b - 5, 0, 2, h);
    g.fillRect(b / 2 - 1, 0, 2, h / 2);
  });
  strasseTex.wrapS = strasseTex.wrapT = THREE.RepeatWrapping;
  {
    const n = 720, pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const w = i / n * Math.PI * 2;
      for (const s of [-1, 1]) {
        const rr = RING.r + s * RING.breite / 2;
        pos.push(RING.x + Math.cos(w) * rr, 0.02, RING.z + Math.sin(w) * rr);
        uv.push(s < 0 ? 0 : 1, (w * RING.r) / 12);
      }
      if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const strasse = new THREE.Mesh(geo, toon(0xffffff, { map: strasseTex, side: THREE.DoubleSide }));
    strasse.receiveShadow = true;
    scene.add(strasse);
    // Bankett (Schotterstreifen) beidseitig
    for (const s of [-1, 1]) {
      const g2 = new THREE.RingGeometry(RING.r + s * (RING.breite / 2) + (s < 0 ? -0.9 : 0), RING.r + s * (RING.breite / 2) + (s < 0 ? 0 : 0.9), 360, 1);
      g2.rotateX(-Math.PI / 2);
      const bank = new THREE.Mesh(g2, toon(0x9a947f));
      bank.position.set(RING.x, 0.012, RING.z);
      scene.add(bank);
    }
  }

  // ---------- Leitpfosten alle 50 m auf beiden Seiten (weiß, schwarzer Streifen, Reflektor) ----------
  {
    const pfosten = [];
    const umfang = 2 * Math.PI * RING.r;
    for (let k = 0; k < Math.floor(umfang / 50); k++) {
      const w = (k * 50) / RING.r;
      for (const s of [-1, 1]) pfosten.push({ w, rr: RING.r + s * (RING.breite / 2 + 0.6), s });
    }
    const teile = [[new THREE.BoxGeometry(0.12, 1.0, 0.1), 0xf4f4ef, 0.5], [new THREE.BoxGeometry(0.125, 0.18, 0.105), 0x1d1d1f, 0.82], [new THREE.BoxGeometry(0.05, 0.1, 0.11), 0xf2a21c, 0.82]];
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sk = new THREE.Vector3(1, 1, 1);
    for (const [geo, farbe, y] of teile) {
      const inst = new THREE.InstancedMesh(geo, toon(farbe), pfosten.length);
      pfosten.forEach((p, i) => {
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -p.w);
        m.compose(new THREE.Vector3(RING.x + Math.cos(p.w) * p.rr, y, RING.z + Math.sin(p.w) * p.rr), q, sk);
        inst.setMatrixAt(i, m);
      });
      inst.castShadow = false;
      scene.add(inst);
    }
  }

  // ---------- Bäume und Büsche (am Straßenrand, am Feldweg, auf der Wiese) ----------
  // weit weg: als Instanzen (Stamm + Krone), nah am Weg: mit Umriss wie die übrigen Bäume
  const fernBaeume = [];
  const naheBaeume = [];
  const frei = (x, z, abstand) => FLACH.slice(1).every((f) => Math.hypot(x - f.x, z - f.z) > f.r + abstand)
    && Math.hypot(x - FELDWEG[FELDWEG.length - 1].x, z - FELDWEG[FELDWEG.length - 1].z) > 18;
  for (let i = 0; i < 70; i++) {
    const w = r() * Math.PI * 2;
    const s = r() < 0.4 ? -1 : 1;
    const rr = RING.r + s * (RING.breite / 2 + 7 + r() * 14);
    const x = RING.x + Math.cos(w) * rr, z = RING.z + Math.sin(w) * rr;
    if (frei(x, z, 6)) fernBaeume.push({ x, z, s: 0.9 + r() * 0.8, busch: r() < 0.25 });
  }
  for (let i = 0; i < 40; i++) {
    const w = r() * Math.PI * 2, d = 40 + r() * (RING.r - 70);
    const x = RING.x + Math.cos(w) * d, z = RING.z + Math.sin(w) * d;
    if (Math.hypot(x + 5, z - 5) > 75 && frei(x, z, 8) && wegAbstand(x, z) > 10) fernBaeume.push({ x, z, s: 0.9 + r() * 0.9, busch: r() < 0.3 });
  }
  function wegAbstand(x, z) { let best = Infinity; for (const q of wegProben) best = Math.min(best, Math.hypot(q.x - x, q.z - z)); return best; }
  // am Feldweg: hin und wieder ein Busch oder Baum
  for (let i = 3; i < wegProben.length - 3; i += 6 + Math.floor(r() * 5)) {
    const p = wegProben[i], t = wegKurve.getTangentAt(i / (wegProben.length - 1));
    const s = r() < 0.5 ? -1 : 1, ab = 3.2 + r() * 3;
    const x = p.x - t.z * s * ab, z = p.z + t.x * s * ab;
    if (x < 14) continue;
    naheBaeume.push({ x, z, s: 0.7 + r() * 0.6, busch: r() < 0.55 });
  }
  const blatt = [0x3f7a35, 0x4f8a3e, 0x356a2c, 0x5a8f3a];
  for (const b of naheBaeume) {
    const g = new THREE.Group();
    if (b.busch) {
      for (let k = 0; k < 4; k++) g.add(setze(teil(new THREE.IcosahedronGeometry(0.7 * b.s + r() * 0.3, 1), blatt[k % 4], { umriss: 0.008 }), (r() - 0.5) * 1.2 * b.s, 0.5 * b.s + r() * 0.3, (r() - 0.5) * 1.2 * b.s));
    } else {
      g.add(setze(zylinder(0.14 * b.s, 0.22 * b.s, 2.6 * b.s, 0x6a4a2e, { umriss: 0.005 }, 8), 0, 1.3 * b.s, 0));
      for (let k = 0; k < 4; k++) g.add(setze(teil(new THREE.IcosahedronGeometry((1.0 + r() * 0.5) * b.s, 1), blatt[k % 4], { umriss: 0.01 }), (r() - 0.5) * 1.4 * b.s, (2.7 + r() * 1.1) * b.s, (r() - 0.5) * 1.4 * b.s));
    }
    g.position.set(b.x, gelaendeHoehe(b.x, b.z), b.z);
    g.rotation.y = r() * 6;
    scene.add(g);
    const rr = b.busch ? 0.6 * b.s : 0.28 * b.s;
    hindernis(b.x - rr, b.x + rr, b.z - rr, b.z + rr);
  }
  {
    const staemme = fernBaeume.filter((b) => !b.busch);
    const stamm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.28, 3, 7), toon(0x6a4a2e), staemme.length);
    const kronen = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.5, 1), toon(0xffffff), fernBaeume.length * 3);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), farbe = new THREE.Color();
    staemme.forEach((b, i) => { m.compose(new THREE.Vector3(b.x, gelaendeHoehe(b.x, b.z) + 1.5 * b.s, b.z), q, new THREE.Vector3(b.s, b.s, b.s)); stamm.setMatrixAt(i, m); });
    let k = 0;
    for (const b of fernBaeume) {
      const y0 = gelaendeHoehe(b.x, b.z);
      for (let j = 0; j < 3; j++) {
        const sc = b.s * (b.busch ? 0.55 : 1) * (0.8 + r() * 0.4);
        q.setFromEuler(new THREE.Euler(r(), r() * 6, r()));
        // Büsche sitzen auf dem Boden (vorher schwebten sie teils und sahen aus wie Kronen ohne Stamm)
        const yk = b.busch ? y0 + sc * 1.5 * 0.55 : y0 + 3.4 * b.s + r() * b.s;
        m.compose(new THREE.Vector3(b.x + (r() - 0.5) * 1.6 * b.s, yk, b.z + (r() - 0.5) * 1.6 * b.s), q, new THREE.Vector3(sc, sc * (b.busch ? 0.75 : 1), sc));
        kronen.setMatrixAt(k, m);
        kronen.setColorAt(k, farbe.setHex(blatt[(j + Math.floor(b.x)) & 3]));
        k++;
      }
      // nur Bäume innerhalb des befahrbaren Bereichs sind Hindernisse
      if (imKreis(b.x, b.z)) { const rr = b.busch ? 0.7 * b.s : 0.3 * b.s; hindernis(b.x - rr, b.x + rr, b.z - rr, b.z + rr); }
    }
    kronen.count = k;
    scene.add(stamm, kronen);
  }

  // ---------- Feldweg-Ende an der Hauptstraße: Dennis' Briefkasten und seine Schilder ----------
  const ende = FELDWEG[FELDWEG.length - 1];
  let holzRueck = null;
  const schildTafel = (zeilen, b = 1.2, h = 0.6, farbe = '#f4efe0', schrift = '#1d1d1f') => {
    const tex = leinwandTextur(Math.round(b * 256), Math.round(h * 256), (g, bb, hh) => {
      g.fillStyle = farbe; g.fillRect(0, 0, bb, hh);
      for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(80,60,40,${r() * 0.12})`; g.fillRect(r() * bb, r() * hh, 2 + r() * 14, 1 + r() * 3); }
      g.strokeStyle = schrift; g.lineWidth = 6; g.strokeRect(8, 8, bb - 16, hh - 16);
      g.fillStyle = schrift; g.textAlign = 'center';
      const gesamt = zeilen.reduce((a, z) => a + z[1] * 1.15, 0);
      let y = (hh - gesamt) / 2;
      for (const [text, groesse, fett] of zeilen) {
        y += groesse;
        let fs = groesse; g.font = `${fett ? '800' : '600'} ${fs}px "Arial Black", Arial, sans-serif`;
        while (g.measureText(text).width > bb - 40 && fs > 12) { fs -= 2; g.font = `${fett ? '800' : '600'} ${fs}px "Arial Black", Arial, sans-serif`; }
        g.fillText(text, bb / 2, y);
        y += groesse * 0.15;
      }
    });
    const s = new THREE.Group();
    s.add(setze(quader(b + 0.04, h + 0.04, 0.04, 0x6a4f32, { umriss: 0.003 }), 0, 0, -0.025));
    const tafel = new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map: tex }));
    tafel.position.z = 0.001;
    s.add(tafel);
    // Rückseite: nur Holz (Bretter), lesbar ist das Schild nur von der Straße aus (Betreiber)
    if (!holzRueck) holzRueck = leinwandTextur(128, 64, (g, bb, hh) => { g.fillStyle = '#8a6a44'; g.fillRect(0, 0, bb, hh); for (let y = 0; y < hh; y += 16) { g.fillStyle = 'rgba(40,25,10,0.35)'; g.fillRect(0, y, bb, 2); } for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,40,20,${r() * 0.25})`; g.fillRect(r() * bb, r() * hh, 6 + r() * 30, 1); } });
    const rueck = new THREE.Mesh(new THREE.PlaneGeometry(b + 0.04, h + 0.04), new THREE.MeshBasicMaterial({ map: holzRueck }));
    rueck.rotation.y = Math.PI; rueck.position.z = -0.051;
    s.add(rueck);
    return s;
  };
  // Schild an einem schiefen, in den Boden gehauenen Pfahl
  const pfahlSchild = (zeilen, x, z, blick, hoehe = 1.3, b, h, farbe, schrift) => {
    const g = new THREE.Group();
    // Pfahl endet unter der Tafel (sonst verdeckt er hinten die Schrift); kurzes Brett als Halter
    const ph = hoehe - (h || 0.6) / 2 + 0.05;
    g.add(setze(quader(0.09, ph + 0.3, 0.09, 0x7a5a3a, { umriss: 0.003 }), 0, (ph + 0.3) / 2 - 0.3, -0.025));
    g.add(setze(quader(0.24, 0.07, 0.07, 0x6a4f32, { umriss: 0.002 }), 0, ph - 0.01, -0.025));
    const t = schildTafel(zeilen, b, h, farbe, schrift);
    t.position.y = hoehe;
    g.add(t);
    g.position.set(x, 0, z);
    g.rotation.set((r() - 0.5) * 0.12, blick, (r() - 0.5) * 0.15);
    scene.add(g);
    hindernis(x - 0.2, x + 0.2, z - 0.2, z + 0.2);
    return g;
  };
  // Blick der Schilder: zur Straße hin (Richtung Ringmittelpunkt weg = nach außen)
  const nachAussen = Math.atan2(ende.x - RING.x, ende.z - RING.z);
  const quer = { x: Math.cos(nachAussen), z: -Math.sin(nachAussen) };
  const s1 = pfahlSchild([['DENNIS REICH', 72, true], ['Kein Zutritt!', 46, false]], ende.x - 3 + quer.x * 3.2, ende.z + quer.z * 3.2 + 0.3, nachAussen, 1.45, 1.5, 0.75, '#b2241c', '#f4efe0');
  merke(s1, 'schild_reich', 'Schild: Dennis Reich');
  const s2 = pfahlSchild([['(Fahrradfahrer', 40, false], ['werden geduldet)', 40, false]], ende.x - 3.6 + quer.x * 4.6, ende.z + quer.z * 4.6, nachAussen + 0.2, 1.0, 1.0, 0.45);
  merke(s2, 'schild_rad', 'Schild: Fahrradfahrer');
  const s3 = pfahlSchild([['Privatweg', 50, true], ['Befahren auf eigene Gefahr', 30, false]], ende.x - 3 - quer.x * 3.4, ende.z - quer.z * 3.4, nachAussen - 0.15, 1.3, 1.2, 0.55, '#f2c21c');
  merke(s3, 'schild_privat', 'Schild: Privatweg');
  const s4 = pfahlSchild([['VORSICHT!', 52, true], ['Freilaufender Dennis', 34, false]], ende.x - 9 - quer.x * 2.6, ende.z - quer.z * 2.6, nachAussen + 0.1, 1.2, 1.1, 0.55, '#f4efe0', '#b2241c');
  merke(s4, 'schild_vorsicht', 'Schild: Vorsicht');
  // Briefkasten: Pfosten mit rundem Blechkasten, Fähnchen, Name drauf
  {
    const bk = new THREE.Group();
    bk.add(setze(quader(0.1, 1.1, 0.1, 0x6a4f32, { umriss: 0.003 }), 0, 0.55, 0));
    const kasten = new THREE.Group();
    kasten.add(setze(quader(0.32, 0.22, 0.5, 0x2f5a3a, { umriss: 0.003 }), 0, 0, 0));
    const deckel = teil(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 16, 1, false, -Math.PI / 2, Math.PI), 0x2f5a3a, { umriss: 0.003 });
    deckel.rotation.x = Math.PI / 2; deckel.position.y = 0.11;
    kasten.add(deckel);
    kasten.add(setze(quader(0.3, 0.3, 0.01, 0x24452c, { umriss: 0.002 }), 0, 0.06, 0.255));
    const fahne = new THREE.Group();
    fahne.add(setze(quader(0.02, 0.28, 0.02, 0xc8352a, { umriss: 0.001 }), 0, 0.14, 0));
    fahne.add(setze(quader(0.012, 0.09, 0.12, 0xc8352a, { umriss: 0.001 }), 0, 0.24, 0.06));
    fahne.position.set(0.17, 0.0, -0.05); fahne.rotation.x = -0.3;
    kasten.add(fahne);
    const nameTex = leinwandTextur(128, 32, (g, b, h) => { g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, b, h); g.fillStyle = '#f4efe0'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.fillText('DENNIS', b / 2, 24); });
    const name = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.09), new THREE.MeshBasicMaterial({ map: nameTex }));
    name.rotation.y = Math.PI / 2; name.position.set(0.162, 0.02, 0);
    kasten.add(name);
    const name2 = name.clone(); name2.rotation.y = -Math.PI / 2; name2.position.x = -0.162;
    kasten.add(name2);
    kasten.position.y = 1.2;
    bk.add(kasten);
    bk.position.set(ende.x - 1.2 - quer.x * 2.2, 0, ende.z - quer.z * 2.2);
    bk.rotation.set(0, nachAussen + Math.PI / 2, 0.06);
    scene.add(bk);
    merke(bk, 'briefkasten', 'Dennis’ Briefkasten');
    hindernis(bk.position.x - 0.25, bk.position.x + 0.25, bk.position.z - 0.25, bk.position.z + 0.25);
  }

  // ---------- Lühmanns Hof: Parkplatz, SB-Laden, Kuhgehege, Hühnermobil, Schild an der Straße ----------
  // lokal: x entlang der Straße, z von der Straße weg ins Innere
  const hof = new THREE.Group();
  hof.position.set(HOF.x, 0, HOF.z);
  hof.rotation.y = Math.atan2(RING.x - HOF.x, RING.z - HOF.z);
  scene.add(hof);
  hof.updateMatrixWorld(true);
  // Parkplatz: Schotter mit Pflasterrand, Parkbuchten
  const schotterTex = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#9a9488'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 3000; i++) { const v = 110 + r() * 90; g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.fillRect(r() * b, r() * h, 2, 2); }
    for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(70,60,40,0.18)'; g.beginPath(); g.ellipse(r() * b, r() * h, 20 + r() * 30, 8 + r() * 16, r() * 3, 0, Math.PI * 2); g.fill(); }
  }, [4, 3]);
  const parkplatz = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), toon(0xffffff, { map: schotterTex }));
  parkplatz.rotation.x = -Math.PI / 2;
  parkplatz.position.set(0, 0.015, 0.5);
  hof.add(parkplatz);
  for (let k = 0; k < 5; k++) hof.add(setze(quader(0.12, 0.02, 4.5, 0xe8e4d6, { umriss: false }), -8 + k * 3, 0.03, 2.8));
  // SB-Laden: Holzhütte mit Satteldach, offener Tür, Schild; innen Regal mit Eierkartons, Kühlschrank mit Mettenden,
  // Tisch mit Anschreibeliste und Vertrauenskasse
  const laden = new THREE.Group();
  laden.position.set(-3, 0, 10.5);
  hof.add(laden);
  const LB = 5, LT = 4, LH = 2.5;
  const brettTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#9a6a3a'; g.fillRect(0, 0, b, h);
    for (let x = 0; x < b; x += 16) { g.fillStyle = 'rgba(40,20,10,0.55)'; g.fillRect(x, 0, 2, h); for (let i = 0; i < 5; i++) { g.fillStyle = `rgba(70,40,20,${r() * 0.25})`; g.fillRect(x + 3 + r() * 10, r() * h, 1, 10 + r() * 30); } }
  }, [2, 1]);
  const brettMat = toon(0xffffff, { map: brettTex, side: THREE.DoubleSide });
  const wand = (b, x, z, ry) => { const w = teil(new THREE.BoxGeometry(b, LH, 0.1), 0, { material: brettMat, umriss: 0.004 }); w.position.set(x, LH / 2, z); w.rotation.y = ry; laden.add(w); };
  wand(LB, 0, LT / 2, 0); // hinten
  wand(LT, -LB / 2, 0, Math.PI / 2); wand(LT, LB / 2, 0, Math.PI / 2);
  const TUER = 1.1;
  wand((LB - TUER) / 2, -(LB + TUER) / 4, -LT / 2, 0); wand((LB - TUER) / 2, (LB + TUER) / 4, -LT / 2, 0);
  laden.add(setze(teil(new THREE.BoxGeometry(TUER, 0.5, 0.1), 0, { material: brettMat, umriss: 0.003 }), 0, LH - 0.25, -LT / 2));
  laden.add(setze(quader(LB - 0.1, 0.02, LT - 0.1, 0x8a7a62, { umriss: false }), 0, 0.02, 0)); // Bretterboden
  // Satteldach (rote Ziegel), Giebeldreiecke
  const ziegelTex = leinwandTextur(64, 64, (g, b, h) => { g.fillStyle = '#9a3a28'; g.fillRect(0, 0, b, h); for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(40,10,5,0.5)'; g.fillRect(0, y, b, 2); for (let x = (y / 8) % 2 ? 0 : 8; x < b; x += 16) g.fillRect(x, y, 2, 8); } }, [4, 3]);
  for (const s of [-1, 1]) {
    const d = teil(new THREE.BoxGeometry(LB + 0.5, 0.08, LT / 2 + 0.55), 0, { material: toon(0xffffff, { map: ziegelTex }), umriss: 0.004 });
    d.position.set(0, LH + 0.42, s * (LT / 4 + 0.08)); d.rotation.x = s * 0.42;
    laden.add(d);
  }
  for (const s of [-1, 1]) {
    const giebel = new THREE.Shape(); giebel.moveTo(-LT / 2, 0); giebel.lineTo(LT / 2, 0); giebel.lineTo(0, 0.85); giebel.closePath();
    const gm = new THREE.Mesh(new THREE.ShapeGeometry(giebel), brettMat);
    gm.rotation.y = Math.PI / 2; gm.position.set(s * LB / 2, LH, 0);
    laden.add(gm);
  }
  const ladenSchild = schildTafel([['Lühmanns Landeier', 56, true], ['SB-Laden · immer offen', 34, false]], 2.4, 0.6, '#f4efe0', '#2f5a3a');
  ladenSchild.position.set(0, LH + 0.28, -LT / 2 - 0.08); ladenSchild.rotation.y = Math.PI;
  laden.add(ladenSchild);
  // Regal mit Eierkartons (hinten)
  const regal = new THREE.Group();
  for (const y of [0.4, 0.9, 1.4]) regal.add(setze(quader(1.8, 0.04, 0.45, 0xc9a46a, { umriss: 0.002 }), 0, y, 0));
  for (const sx of [-1, 1]) regal.add(setze(quader(0.05, 1.6, 0.45, 0xa8844e, { umriss: 0.002 }), sx * 0.9, 0.8, 0));
  const eierKarton = eierKartonModell;
  for (const y of [0.42, 0.92]) for (let i = 0; i < 5; i++) { const k = eierKarton(); k.position.set(-0.7 + i * 0.34, y, 0); regal.add(k); }
  regal.position.set(-0.9, 0, LT / 2 - 0.35);
  laden.add(regal);
  merke(regal, 'sb_eier', 'Lühmanns Landeier');
  // Kühlschrank (Glastür) mit Mettenden
  const kuehl = new THREE.Group();
  kuehl.add(setze(quader(0.7, 1.7, 0.6, 0xe8e8e2, { umriss: 0.003 }), 0, 0.85, 0));
  kuehl.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(0.58, 1.4), new THREE.MeshBasicMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.3 })), 0, 0.9, -0.305));
  for (const y of [0.4, 0.8, 1.2]) {
    kuehl.add(setze(quader(0.6, 0.02, 0.5, 0xd0d4d8, { umriss: false }), 0, y, 0));
    for (let i = 0; i < 4; i++) {
      const p = mettendenModell();
      p.position.set(-0.21 + i * 0.14, y + 0.01, 0);
      kuehl.add(p);
    }
  }
  kuehl.add(setze(quader(0.6, 0.1, 0.01, 0xc8352a, { umriss: false }), 0, 1.6, -0.305));
  kuehl.position.set(LB / 2 - 0.5, 0, LT / 2 - 0.45);
  laden.add(kuehl);
  merke(kuehl, 'sb_mettenden', 'Kühlschrank mit Mettenden');
  // Tisch mit Anschreibeliste (Klemmbrett mit Stift an der Schnur) und Vertrauenskasse
  const tisch = new THREE.Group();
  tisch.add(setze(quader(1.0, 0.04, 0.5, 0xa8844e, { umriss: 0.002 }), 0, 0.85, 0));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tisch.add(setze(quader(0.04, 0.85, 0.04, 0x8a6a3a, { umriss: false }), sx * 0.45, 0.425, sz * 0.2));
  const listeTex = leinwandTextur(128, 160, (g, b, h) => {
    g.fillStyle = '#f6f1df'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 15px Caveat, cursive'; g.fillText('Anschreiben:', 8, 18);
    g.strokeStyle = 'rgba(80,120,200,0.4)'; for (let y = 28; y < h; y += 16) { g.beginPath(); g.moveTo(4, y); g.lineTo(b - 4, y); g.stroke(); }
    g.fillStyle = '#1f3f8a'; g.font = '14px Caveat, cursive';
    ['Dennis 10 Eier', 'Dennis 4 Mettenden', 'Peter -', 'Waldo 2 Mettenden', 'Dennis 10 Eier', 'Jonny 6 Eier'].forEach((t, i) => g.fillText(t, 10, 42 + i * 16));
  });
  const liste = new THREE.Group();
  liste.add(setze(quader(0.24, 0.012, 0.32, 0x8a6a3a, { umriss: 0.002 }), 0, 0, 0));
  const blatt2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.27), new THREE.MeshBasicMaterial({ map: listeTex }));
  blatt2.rotation.x = -Math.PI / 2; blatt2.position.y = 0.007;
  liste.add(blatt2);
  liste.position.set(-0.2, 0.876, 0); liste.rotation.y = 0.15;
  tisch.add(liste);
  const kasse = new THREE.Group();
  kasse.add(setze(quader(0.22, 0.16, 0.16, 0x3a6a8a, { umriss: 0.002 }), 0, 0.08, 0));
  kasse.add(setze(quader(0.1, 0.01, 0.02, 0x1d1d1f, { umriss: false }), 0, 0.165, 0));
  kasse.position.set(0.3, 0.87, 0.05);
  tisch.add(kasse);
  tisch.position.set(-LB / 2 + 0.8, 0, -0.4); tisch.rotation.y = Math.PI / 2;
  laden.add(tisch);
  merke(liste, 'sb_liste', 'Anschreibeliste');
  merke(kasse, 'sb_kasse', 'Vertrauenskasse');
  // Hindernisse der Hütte (Wände, Regal, Kühlschrank, Tisch)
  laden.updateMatrixWorld(true);
  const ladenH = (lx, lz, hx, hz) => {
    const c = new THREE.Vector3(lx, 0, lz).applyMatrix4(laden.matrixWorld), psi = hof.rotation.y;
    const ex = Math.abs(Math.cos(psi)) * hx + Math.abs(Math.sin(psi)) * hz, ez = Math.abs(Math.sin(psi)) * hx + Math.abs(Math.cos(psi)) * hz;
    const h = hindernis(c.x - ex, c.x + ex, c.z - ez, c.z + ez);
    h.boxen = [{ x: c.x, z: c.z, psi, hx, hz }];
  };
  ladenH(0, LT / 2, LB / 2 + 0.05, 0.08); ladenH(-LB / 2, 0, 0.08, LT / 2); ladenH(LB / 2, 0, 0.08, LT / 2);
  ladenH(-(LB + TUER) / 4, -LT / 2, (LB - TUER) / 4, 0.08); ladenH((LB + TUER) / 4, -LT / 2, (LB - TUER) / 4, 0.08);
  ladenH(-0.9, LT / 2 - 0.35, 0.95, 0.25); ladenH(LB / 2 - 0.5, LT / 2 - 0.45, 0.37, 0.32); ladenH(-LB / 2 + 0.8, -0.4, 0.27, 0.52);

  // Kuhgehege (Holzzaun) mit Peters Kühen
  const GEHEGE = { x0: -26, x1: -10, z0: 6, z1: 24 };
  {
    const zaun = new THREE.Group();
    const lx = GEHEGE.x1 - GEHEGE.x0, lz = GEHEGE.z1 - GEHEGE.z0;
    const seiten = [[GEHEGE.x0, GEHEGE.z0, GEHEGE.x1, GEHEGE.z0], [GEHEGE.x1, GEHEGE.z0, GEHEGE.x1, GEHEGE.z1], [GEHEGE.x1, GEHEGE.z1, GEHEGE.x0, GEHEGE.z1], [GEHEGE.x0, GEHEGE.z1, GEHEGE.x0, GEHEGE.z0]];
    for (const [ax, az, bx, bz] of seiten) {
      const l = Math.hypot(bx - ax, bz - az), n = Math.ceil(l / 2.5);
      for (let i = 0; i <= n; i++) zaun.add(setze(quader(0.1, 1.3, 0.1, 0x7a5a3a, { umriss: 0.002 }), ax + (bx - ax) * i / n, 0.65, az + (bz - az) * i / n, 0, 0, (r() - 0.5) * 0.06));
      for (const y of [0.5, 1.05]) {
        const latte = quader(l, 0.1, 0.04, 0x9a7a52, { umriss: 0.002 });
        latte.position.set((ax + bx) / 2, y, (az + bz) / 2); latte.rotation.y = -Math.atan2(bz - az, bx - ax);
        zaun.add(latte);
      }
    }
    // Futterraufe mit Heu und Wassertrog
    zaun.add(setze(quader(1.6, 0.6, 0.9, 0x6a4a2e, { umriss: 0.003 }), GEHEGE.x0 + 2, 0.3, GEHEGE.z1 - 2));
    zaun.add(setze(teil(new THREE.SphereGeometry(0.6, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), 0xd8c070, { umriss: 0.003 }), GEHEGE.x0 + 2, 0.55, GEHEGE.z1 - 2));
    zaun.add(setze(quader(1.6, 0.4, 0.6, 0x8a8f96, { umriss: 0.003 }), GEHEGE.x1 - 2.5, 0.2, GEHEGE.z0 + 1.5));
    zaun.add(setze(quader(1.5, 0.02, 0.5, 0x5a8ab0, { umriss: false }), GEHEGE.x1 - 2.5, 0.38, GEHEGE.z0 + 1.5));
    hof.add(zaun);
    const schild = schildTafel([['Peters Kühe', 50, true], ['Nicht füttern!', 34, false]], 1.2, 0.5);
    schild.position.set((GEHEGE.x0 + GEHEGE.x1) / 2, 1.0, GEHEGE.z0 - 0.08); schild.rotation.y = Math.PI;
    hof.add(schild);
    for (const [ax, az, bx, bz] of seiten) drehHindernis(hof, (ax + bx) / 2, (az + bz) / 2, Math.max(0.1, Math.abs(bx - ax) / 2), Math.max(0.1, Math.abs(bz - az) / 2));
    void lx; void lz;
  }
  const kuehe = [];
  const kuhTex = (braun) => leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, b, h);
    g.fillStyle = braun ? '#7a4a2a' : '#1d1d1f';
    for (let i = 0; i < 7; i++) { g.beginPath(); const cx = r() * b, cy = r() * h; for (let k = 0; k < 9; k++) { const w = k / 9 * Math.PI * 2, rr = (14 + r() * 18); const px = cx + Math.cos(w) * rr, py = cy + Math.sin(w) * rr * 0.8; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.fill(); }
  });
  for (let i = 0; i < 4; i++) {
    const kuh = new THREE.Group();
    const fell = toon(0xffffff, { map: kuhTex(i === 2) });
    // Rund statt eckig: alles aus Ellipsoiden und verjüngten Zylindern
    const ell = (rx, ry, rz, farbe, x, y, z, opt = {}) => {
      const m = teil(new THREE.SphereGeometry(1, 20, 14), farbe, { umriss: 0.004, ...opt });
      m.scale.set(rx, ry, rz); m.position.set(x, y, z);
      return m;
    };
    const rosa = 0xe8a8a0, dunkel = i === 2 ? 0x7a4a2a : 0x1d1d1f;
    // Rumpf: Tonne mit kräftiger Brust und rundem Hinterteil
    kuh.add(ell(0.4, 0.43, 0.95, 0, 0, 1.05, 0, { material: fell }));
    kuh.add(ell(0.37, 0.4, 0.5, 0, 0, 1.08, 0.5, { material: fell }));
    kuh.add(ell(0.38, 0.4, 0.45, 0, 0, 1.08, -0.5, { material: fell }));
    // Euter mit Zitzen
    kuh.add(ell(0.17, 0.12, 0.2, rosa, 0, 0.62, -0.45));
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) kuh.add(setze(zylinder(0.015, 0.02, 0.07, rosa, { umriss: false }, 6), sx * 0.06, 0.53, -0.45 + sz * 0.07));
    // Kopf an einem Hals, am Halsansatz drehbar (Grasen)
    const kopf = new THREE.Group();
    kopf.add(setze(zylinder(0.17, 0.21, 0.55, 0, { material: fell, umriss: 0.004 }, 14), 0, 0, 0.2, Math.PI / 2 - 0.35, 0, 0));
    kopf.add(ell(0.2, 0.22, 0.3, 0, 0, -0.1, 0.5, { material: fell }));
    kopf.add(ell(0.15, 0.13, 0.16, rosa, 0, -0.17, 0.74));
    for (const sx of [-1, 1]) {
      kopf.add(ell(0.03, 0.025, 0.02, 0x7a4a48, sx * 0.06, -0.15, 0.89, { umriss: false }));
      kopf.add(ell(0.13, 0.04, 0.07, dunkel, sx * 0.27, 0.12, 0.38, { rotation: 0 }));
      kopf.children[kopf.children.length - 1].rotation.z = sx * 0.35;
      kopf.add(ell(0.032, 0.036, 0.03, 0x141414, sx * 0.14, 0.06, 0.62, { umriss: false }));
      const horn = zylinder(0.012, 0.03, 0.14, 0xe8e0c8, { umriss: 0.002 }, 8);
      setze(horn, sx * 0.14, 0.27, 0.4, 0, 0, -sx * 0.7);
      kopf.add(horn);
    }
    kopf.position.set(0, 1.22, 0.85);
    kuh.add(kopf);
    // Beine: oben kräftig, unten dünn, dunkle Hufe
    const beine = [];
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const b = new THREE.Group();
      b.add(setze(zylinder(0.1, 0.07, 0.42, 0xf4f2ec, { umriss: 0.003 }, 10), 0, -0.2, 0));
      b.add(setze(zylinder(0.055, 0.05, 0.32, 0xf4f2ec, { umriss: 0.003 }, 10), 0, -0.55, 0));
      b.add(setze(zylinder(0.06, 0.07, 0.08, 0x2a2622, { umriss: 0.002 }, 10), 0, -0.73, 0));
      b.position.set(sx * 0.23, 0.78, sz * 0.58);
      kuh.add(b);
      beine.push(b);
    }
    const schwanz = new THREE.Group();
    schwanz.add(setze(zylinder(0.02, 0.014, 0.7, 0xf4f2ec, { umriss: 0.002 }, 6), 0, -0.35, 0));
    schwanz.add(ell(0.05, 0.1, 0.05, dunkel, 0, -0.78, 0, { umriss: false }));
    schwanz.position.set(0, 1.4, -0.92);
    kuh.add(schwanz);
    const start = { x: GEHEGE.x0 + 3 + r() * (GEHEGE.x1 - GEHEGE.x0 - 6), z: GEHEGE.z0 + 3 + r() * (GEHEGE.z1 - GEHEGE.z0 - 6) };
    kuh.position.set(start.x, 0, start.z);
    kuh.rotation.y = r() * 6;
    hof.add(kuh);
    merke(kuh, 'kuh', 'Peters Kuh');
    kuehe.push({ g: kuh, kopf, beine, schwanz, ziel: null, warte: r() * 5, t: r() * 10 });
  }
  // Hühnermobil (grüner Stall auf Rädern, Rampe) mit Peters Hühnern, Hühnernetz drumherum
  const huehner = [];
  const HM = { x: 12, z: 15, r: 6 };
  {
    const hm = new THREE.Group();
    const GRUEN = 0x3f7a35;
    // Fahrgestell (verzinkter Rahmen), grüner Stallkasten mit senkrechten Sicken, flaches Satteldach mit Überstand
    hm.add(setze(quader(4.4, 0.16, 1.9, 0xa9aeb3, { umriss: 0.003 }), 0, 0.7, 0));
    const sickenTex = leinwandTextur(128, 64, (g, b, h) => { g.fillStyle = '#3f7a35'; g.fillRect(0, 0, b, h); for (let x = 0; x < b; x += 8) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 3, 0, 2, h); } }, [6, 1]);
    hm.add(setze(teil(new THREE.BoxGeometry(4.2, 1.5, 2.2), 0, { material: toon(0xffffff, { map: sickenTex }), umriss: 0.005 }), 0, 1.53, 0));
    for (const s of [-1, 1]) {
      const d = quader(4.6, 0.07, 1.42, 0x2a4a26, { umriss: 0.004 });
      d.position.set(0, 2.5, s * 0.62); d.rotation.x = s * 0.38;
      hm.add(d);
      const giebel = new THREE.Shape(); giebel.moveTo(-1.1, 0); giebel.lineTo(1.1, 0); giebel.lineTo(0, 0.45); giebel.closePath();
      const gm = new THREE.Mesh(new THREE.ShapeGeometry(giebel), toon(GRUEN, { side: THREE.DoubleSide }));
      gm.rotation.y = Math.PI / 2; gm.position.set(s * 2.1, 2.28, 0);
      hm.add(gm);
    }
    hm.add(setze(quader(4.6, 0.08, 0.1, 0x2a4a26, { umriss: 0.003 }), 0, 2.74, 0)); // First
    // Legenester an der Seite (Klappe) und Lüftungsklappe
    hm.add(setze(quader(1.6, 0.4, 0.35, 0x356a2c, { umriss: 0.003 }), -0.8, 1.35, -1.27));
    hm.add(setze(quader(1.6, 0.06, 0.42, 0x2a4a26, { umriss: 0.002 }), -0.8, 1.58, -1.29, 0.3, 0, 0));
    for (const sx of [-1.4, 1.4]) for (const sz of [-1, 1]) {
      hm.add(setze(zylinder(0.35, 0.35, 0.18, 0x1d1d1f, { umriss: 0.003 }, 16), sx, 0.35, sz * 1.15, Math.PI / 2, 0, 0));
      hm.add(setze(zylinder(0.18, 0.18, 0.19, 0xc9cdd2, { umriss: false }, 12), sx, 0.35, sz * 1.15, Math.PI / 2, 0, 0));
    }
    for (let k = 0; k < 4; k++) hm.add(setze(quader(0.5, 0.35, 0.02, 0x9cc7e6, { umriss: 0.002 }), -1.5 + k * 1.0, 1.75, 1.11));
    hm.add(setze(quader(0.5, 0.45, 0.02, 0x1d1d1f, { umriss: 0.002 }), 1.2, 0.95, 1.11));
    const rampe = quader(0.5, 0.04, 1.3, 0x8a6a3a, { umriss: 0.002 });
    rampe.position.set(1.2, 0.4, 1.7); rampe.rotation.x = 0.55;
    hm.add(rampe);
    hm.add(setze(quader(0.08, 0.08, 1.4, 0x5a5d62, { umriss: 0.002 }), -2.6, 0.55, 0, 0, Math.PI / 2, 0));
    const hmSchild = schildTafel([['Peters Hühner', 44, true]], 1.2, 0.3, '#f4efe0', '#2f5a2a');
    hmSchild.position.set(-0.6, 2.05, 1.12);
    hm.add(hmSchild);
    hm.position.set(HM.x, 0, HM.z - 3.5);
    hof.add(hm);
    merke(hm, 'huehnermobil', 'Hühnermobil');
    drehHindernis(hof, HM.x, HM.z - 3.5, 2.3, 1.3);
    // Hühnernetz (Pfähle mit Netz) im Kreis
    const netzTex = leinwandTextur(64, 64, (g, b, h) => { g.clearRect(0, 0, b, h); g.strokeStyle = 'rgba(240,240,230,0.9)'; g.lineWidth = 2; for (let x = 0; x <= b; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); } }, [24, 1]);
    const netz = new THREE.Mesh(new THREE.CylinderGeometry(HM.r + 1, HM.r + 1, 1.1, 40, 1, true), new THREE.MeshBasicMaterial({ map: netzTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    netz.position.set(HM.x, 0.55, HM.z);
    hof.add(netz);
    for (let k = 0; k < 16; k++) { const w = k / 16 * Math.PI * 2; hof.add(setze(zylinder(0.025, 0.025, 1.2, 0xe8e0c8, { umriss: false }, 6), HM.x + Math.cos(w) * (HM.r + 1), 0.6, HM.z + Math.sin(w) * (HM.r + 1))); }
    for (let k = 0; k < 48; k++) { const w = k / 48 * Math.PI * 2; drehHindernis(hof, HM.x + Math.cos(w) * (HM.r + 1), HM.z + Math.sin(w) * (HM.r + 1), 0.16, 0.16); }
    for (let i = 0; i < 9; i++) {
      const huhn = new THREE.Group();
      const farbe = [0x8a4a1e, 0xf2ece0, 0x6a3a14, 0xc9a46a][i % 4];
      const k = kugel(0.16, farbe, { umriss: 0.003 }, 10); k.scale.set(0.9, 0.85, 1.25); k.position.y = 0.28; huhn.add(k);
      const kopf = new THREE.Group();
      kopf.add(kugel(0.08, farbe, { umriss: 0.002 }, 8));
      kopf.add(setze(teil(new THREE.ConeGeometry(0.025, 0.07, 6), 0xf2a21c, { umriss: 0.001 }), 0, -0.01, 0.09, Math.PI / 2, 0, 0));
      kopf.add(setze(quader(0.02, 0.07, 0.07, 0xc8352a, { umriss: false }), 0, 0.08, 0.01));
      kopf.add(setze(quader(0.015, 0.05, 0.03, 0xc8352a, { umriss: false }), 0, -0.07, 0.06));
      for (const sx of [-1, 1]) kopf.add(setze(kugel(0.012, 0x1d1d1f, { umriss: false }, 4), sx * 0.05, 0.02, 0.05));
      kopf.position.set(0, 0.45, 0.16);
      huhn.add(kopf);
      huhn.add(setze(quader(0.04, 0.16, 0.14, farbe, { umriss: 0.002 }), 0, 0.36, -0.2, -0.5, 0, 0));
      for (const sx of [-1, 1]) huhn.add(setze(zylinder(0.01, 0.01, 0.16, 0xf2a21c, { umriss: false }, 4), sx * 0.05, 0.08, 0));
      const w = r() * Math.PI * 2, d = r() * (HM.r - 1);
      huhn.position.set(HM.x + Math.cos(w) * d, 0, HM.z + Math.sin(w) * d);
      hof.add(huhn);
      merke(huhn, 'huhn', 'Peters Huhn');
      huehner.push({ g: huhn, kopf, ziel: null, warte: r() * 3, t: r() * 10 });
    }
  }
  // Schild „Lühmanns Landeier": gegenüber der Parkplatz-Einfahrt, 1,5 m hinter dem anderen Fahrbahnrand, quer zur Straße
  // (Autofahrer aus beiden Richtungen sehen es), der Pfeil zeigt auf beiden Seiten über die Straße zum Eierhaus
  const PFEIL_VORNE = -1;
  const SCHILD_Z = -(6 + RING.breite + 1.5); // Hof liegt 6 m vom Fahrbahnrand (HOF), lokal -z = zur Straße und drüber
  const schildSeite = (pfeil) => leinwandTextur(384, 128, (g, b, h) => {
    g.fillStyle = '#f4efe0'; g.fillRect(0, 0, b, h);
    g.strokeStyle = '#2f5a3a'; g.lineWidth = 8; g.strokeRect(6, 6, b - 12, h - 12);
    g.fillStyle = '#2f5a3a'; g.font = '800 44px "Arial Black", Arial'; g.textAlign = 'center'; g.fillText('Lühmanns', b / 2 - pfeil * 30, 56); g.fillText('Landeier', b / 2 - pfeil * 30, 104);
    g.save(); g.translate(pfeil > 0 ? b - 50 : 50, h / 2); g.scale(pfeil, 1);
    g.beginPath(); g.moveTo(-26, -14); g.lineTo(4, -14); g.lineTo(4, -30); g.lineTo(30, 0); g.lineTo(4, 30); g.lineTo(4, 14); g.lineTo(-26, 14); g.closePath(); g.fillStyle = '#c8352a'; g.fill();
    g.restore();
    for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#d9b48a' : '#ffffff'; g.beginPath(); g.ellipse(30 + i * 22 + (pfeil < 0 ? b - 120 : 0), h - 24, 8, 11, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#8a6a3a'; g.lineWidth = 2; g.stroke(); }
  });
  {
    const s = new THREE.Group();
    // Pfosten enden unter der Tafel (Unterkante 1,18 m), damit sie die Schrift nicht verdecken
    for (const sx of [-0.7, 0.7]) s.add(setze(quader(0.08, 1.2, 0.08, 0x6a4f32, { umriss: 0.003 }), sx, 0.6, 0));
    s.add(setze(quader(1.84, 0.64, 0.03, 0x6a4f32, { umriss: 0.002 }), 0, 1.5, 0));
    // Vorderseite (lokal +z) und Rückseite (-z); Pfeilrichtung je Seite so, dass er zum Hof zeigt
    s.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.6), new THREE.MeshBasicMaterial({ map: schildSeite(PFEIL_VORNE) })), 0, 1.5, 0.017));
    s.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.6), new THREE.MeshBasicMaterial({ map: schildSeite(-PFEIL_VORNE) })), 0, 1.5, -0.017, 0, Math.PI, 0));
    s.position.set(0, 0, SCHILD_Z);
    s.rotation.y = Math.PI / 2; // quer zur Straße
    hof.add(s);
    merke(s, 'schild_landeier', 'Schild: Lühmanns Landeier');
    drehHindernis(hof, 0, SCHILD_Z, 0.15, 0.8);
  }
  void merke;

  // ---------- Umgekippter VW T5 Doppelkabine mit Pritsche, Reifenspuren von der Straße ----------
  const t5 = baueT5();
  const t5Gruppe = new THREE.Group();
  t5Gruppe.add(t5);
  // auf der Fahrerseite liegend, quer zur Straße
  t5.rotation.z = Math.PI / 2;
  t5.position.y = 0.97;
  t5Gruppe.position.set(T5.x, 0, T5.z);
  const zurStrasse = Math.atan2(RING.x - T5.x, RING.z - T5.z) + Math.PI;
  t5Gruppe.rotation.y = zurStrasse + 1.9;
  scene.add(t5Gruppe);
  merke(t5Gruppe, 'vw_t5', 'Umgekippter VW T5');
  drehHindernis(t5Gruppe, 0, 0, 1.1, 2.75);
  // Scherben und Teile auf der Wiese
  for (let i = 0; i < 18; i++) {
    const w = r() * Math.PI * 2, d = 2 + r() * 4;
    const x = T5.x + Math.cos(w) * d, z = T5.z + Math.sin(w) * d;
    scene.add(setze(quader(0.04 + r() * 0.12, 0.01, 0.04 + r() * 0.1, [0xbfe3f2, 0x1d1d1f, 0xc8352a, 0xc9cdd2][i % 4], { umriss: false }), x, 0.02, z, 0, r() * 3, 0));
  }
  // Reifenspuren: von der Straße (schwarze Bremsspuren) in Schlangenlinien durch die Wiese bis zum Auto
  {
    const wStart = T5_WINKEL - 0.16;
    const pkt = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const w = wStart + (T5_WINKEL - wStart) * t;
      const ab = (RING.breite / 2 - 1.2) * (1 - t) * 0 + t * (RING.breite / 2 + 15) - 1.5 * (1 - t);
      const p = ringPunkt(w, ab);
      const schl = Math.sin(t * Math.PI * 3) * 2.2 * t;
      pkt.push(new THREE.Vector3(p.x + Math.cos(w) * schl * 0.2 - Math.sin(w) * schl, 0, p.z + Math.sin(w) * schl * 0.2 + Math.cos(w) * schl));
    }
    const kurve = new THREE.CatmullRomCurve3(pkt);
    const proben = kurve.getSpacedPoints(160);
    for (const seite of [-0.8, 0.8]) {
      const pos = [], idx = [], farben = [];
      proben.forEach((p, i) => {
        const t = kurve.getTangentAt(i / (proben.length - 1));
        const nx = -t.z, nz = t.x;
        const aufStrasse = Math.abs(Math.hypot(p.x - RING.x, p.z - RING.z) - RING.r) < RING.breite / 2;
        // breite, dunkle Rinnen (aufgewühlte Erde), auf der Straße schwarzer Gummiabrieb
        for (const s of [-1, 1]) pos.push(p.x + nx * (seite + s * 0.17), aufStrasse ? 0.025 : 0.035 + gelaendeHoehe(p.x, p.z), p.z + nz * (seite + s * 0.17));
        const c = aufStrasse ? [0.05, 0.05, 0.06] : [0.22, 0.15, 0.08];
        farben.push(...c, ...c);
        if (i < proben.length - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.Float32BufferAttribute(farben, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false })));
    }
    // Rillen vom Reifenprofil in der Erde und ausgerissene Grasbüschel am Spurrand
    for (let i = 4; i < proben.length; i += 2) {
      const p = proben[i], t = kurve.getTangentAt(i / (proben.length - 1));
      if (Math.abs(Math.hypot(p.x - RING.x, p.z - RING.z) - RING.r) < RING.breite / 2 + 0.5) continue;
      const nx = -t.z, nz = t.x, h = gelaendeHoehe(p.x, p.z), w = Math.atan2(t.x, t.z);
      for (const seite of [-0.8, 0.8]) scene.add(setze(quader(0.26, 0.006, 0.035, 0x3a2814, { umriss: false, wirft: false }), p.x + nx * seite, h + 0.04, p.z + nz * seite, 0, w + Math.PI / 2 + 0.35, 0));
      if (i % 6 === 0) for (const seite of [-1.05, 1.05]) { const b = kugel(0.09 + r() * 0.06, 0x4a6a2a, { umriss: 0.0015 }, 6); b.scale.set(1, 0.45, 1.3); b.position.set(p.x + nx * seite * (1 + r() * 0.3), h + 0.04, p.z + nz * seite * (1 + r() * 0.3)); b.rotation.y = r() * 3; scene.add(b); }
    }
    // aufgewühlte Erdbrocken entlang der Spur
    for (let i = 30; i < proben.length; i += 9) { const p = proben[i]; scene.add(setze(kugel(0.12 + r() * 0.12, 0x5a4428, { umriss: 0.002 }, 6), p.x + (r() - 0.5) * 2, 0.04, p.z + (r() - 0.5) * 2)); }
  }

  // ---------- Animation: Kühe grasen und laufen langsam, Hühner picken und trippeln ----------
  const _v = new THREE.Vector3();
  function update(dt) {
    for (const k of kuehe) {
      k.t += dt;
      if (!k.ziel) {
        k.warte -= dt;
        k.kopf.rotation.x = 0.85 * Math.min(1, Math.max(0, Math.sin(k.t * 0.4) + 0.6)); // grasen: Kopf nach unten kippen
        k.schwanz.rotation.z = Math.sin(k.t * 2.2) * 0.3;
        if (k.warte < 0) k.ziel = new THREE.Vector3(GEHEGE.x0 + 2.5 + r() * (GEHEGE.x1 - GEHEGE.x0 - 5), 0, GEHEGE.z0 + 2.5 + r() * (GEHEGE.z1 - GEHEGE.z0 - 5));
      } else {
        _v.subVectors(k.ziel, k.g.position); _v.y = 0;
        const d = _v.length();
        if (d < 0.2) { k.ziel = null; k.warte = 6 + r() * 12; continue; }
        const soll = Math.atan2(_v.x, _v.z);
        let diff = soll - k.g.rotation.y; while (diff > Math.PI) diff -= Math.PI * 2; while (diff < -Math.PI) diff += Math.PI * 2;
        k.g.rotation.y += diff * Math.min(1, dt * 1.5);
        if (Math.abs(diff) < 0.5) k.g.position.addScaledVector(_v.normalize(), Math.min(d, 0.6 * dt));
        k.kopf.rotation.x -= k.kopf.rotation.x * Math.min(1, dt * 3);
        k.beine.forEach((b, i) => { b.rotation.x = Math.sin(k.t * 4 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * 0.3; });
      }
    }
    for (const h of huehner) {
      h.t += dt;
      if (!h.ziel) {
        h.warte -= dt;
        h.kopf.position.y = 0.45 - (Math.sin(h.t * 9) > 0.6 ? 0.18 : 0); // picken
        if (h.warte < 0) { const w = r() * Math.PI * 2, d = r() * (HM.r - 0.8); h.ziel = new THREE.Vector3(HM.x + Math.cos(w) * d, 0, HM.z + Math.sin(w) * d); }
      } else {
        _v.subVectors(h.ziel, h.g.position); _v.y = 0;
        const d = _v.length();
        if (d < 0.1) { h.ziel = null; h.warte = 1 + r() * 4; continue; }
        h.g.rotation.y = Math.atan2(_v.x, _v.z);
        h.g.position.addScaledVector(_v.normalize(), Math.min(d, 1.2 * dt));
        h.kopf.position.y = 0.45 + Math.abs(Math.sin(h.t * 14)) * 0.03;
        h.g.position.y = Math.abs(Math.sin(h.t * 14)) * 0.02;
      }
    }
  }

  return { update, hof, laden, t5: t5Gruppe, kuehe, huehner, ende };
}

// VW T5 Doppelkabine mit Pritsche (nach Fotos vom Betreiber: Kabine hellgrau, Alu-Bordwände mit Sicken und VW-Logo hinten,
// Rückleuchten unten am Heckträger, schwarze Stoßstangen, Stahlfelgen); stehend gebaut, x = Breite, z = Länge, vorne +z
function baueT5() {
  const t = new THREE.Group();
  const LACK = 0xc6cacd, LACK_D = 0xaeb3b7, SCHW = 0x1d1d1f; // Kabine hellgrau (Betreiber-Wunsch)
  const scheibe = new THREE.MeshBasicMaterial({ color: 0x9cc7e6, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
  const W = 1.9, LGES = 5.3;
  // Rahmen, Achsen
  t.add(setze(quader(1.1, 0.18, LGES - 0.6, 0x2a2c30, { umriss: 0.003 }), 0, 0.42, 0));
  // Fahrerhaus (Doppelkabine) vorne: kurze, schräge Haube, große Frontscheibe, 4 Türen
  const KZ0 = 0.1, KZ1 = LGES / 2;
  t.add(setze(rundQuader(W, 0.75, KZ1 - KZ0, LACK, { umriss: 0.005 }, 0.1), 0, 0.85, (KZ0 + KZ1) / 2));
  const kab = new THREE.Shape();
  kab.moveTo(KZ0, 1.2); kab.lineTo(KZ0, 1.95); kab.lineTo(1.75, 1.95); kab.lineTo(2.15, 1.32); kab.lineTo(KZ1, 1.22); kab.lineTo(KZ1, 1.2); kab.closePath();
  const kabGeo = new THREE.ExtrudeGeometry(kab, { depth: W - 0.16, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 3 });
  kabGeo.translate(0, 0, -(W - 0.16) / 2); kabGeo.rotateY(-Math.PI / 2);
  t.add(teil(kabGeo, LACK, { umriss: 0.005 }));
  // Scheiben: Front (schräg), Seiten (zwei je Seite), hinten
  const front = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.2, 0.72), scheibe);
  front.position.set(0, 1.64, 1.97); front.rotation.x = -0.99;
  t.add(front);
  for (const sx of [-1, 1]) {
    for (const [z0, z1] of [[0.2, 0.95], [1.05, 1.72]]) {
      const s = new THREE.Mesh(new THREE.PlaneGeometry(z1 - z0, 0.5), scheibe);
      s.position.set(sx * (W / 2 + 0.07), 1.62, (z0 + z1) / 2); s.rotation.y = Math.PI / 2;
      t.add(s);
    }
    for (const z of [1.0, 0.15, 1.8]) t.add(setze(quader(0.01, 0.75, 0.01, 0x5a5d62, { umriss: false }), sx * (W / 2 + 0.005), 0.85, z));
    t.add(setze(quader(0.04, 0.03, 0.14, SCHW, { umriss: false }), sx * (W / 2 + 0.01), 1.1, 0.75));
    t.add(setze(quader(0.04, 0.03, 0.14, SCHW, { umriss: false }), sx * (W / 2 + 0.01), 1.1, 1.6));
    // Spiegel
    t.add(setze(rundQuader(0.06, 0.24, 0.14, SCHW, { umriss: 0.002 }, 0.03), sx * (W / 2 + 0.18), 1.45, 2.0));
  }
  t.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(W - 0.4, 0.45), scheibe), 0, 1.65, KZ0 - 0.07, 0, Math.PI, 0));
  // Front: Grill mit VW-Logo, Scheinwerfer, Stoßstange
  t.add(setze(rundQuader(W - 0.05, 0.75, 0.2, LACK, { umriss: 0.004 }, 0.08), 0, 0.85, KZ1 - 0.02));
  t.add(setze(quader(1.0, 0.18, 0.04, SCHW, { umriss: 0.002 }), 0, 1.0, KZ1 + 0.08));
  for (let k = 0; k < 3; k++) t.add(setze(quader(0.9, 0.02, 0.045, LACK_D, { umriss: false }), 0, 0.95 + k * 0.05, KZ1 + 0.085));
  t.add(setze(teil(new THREE.TorusGeometry(0.08, 0.012, 6, 18), 0xe8eaec, { umriss: false }), 0, 1.0, KZ1 + 0.11));
  for (const sx of [-1, 1]) t.add(setze(rundQuader(0.38, 0.2, 0.06, 0xe8eef2, { umriss: 0.002 }, 0.04), sx * 0.7, 1.02, KZ1 + 0.06));
  t.add(setze(rundQuader(W + 0.04, 0.3, 0.2, 0x3a3c40, { umriss: 0.003 }, 0.08), 0, 0.5, KZ1 + 0.12));
  t.add(setze(quader(1.2, 0.1, 0.02, 0x111214, { umriss: false }), 0, 0.46, KZ1 + 0.225));
  // Pritsche: Ladefläche mit Alu-Bordwänden (eine Seite aufgesprungen, verbogen)
  const PZ0 = -LGES / 2, PZ1 = 0.0;
  t.add(setze(quader(W, 0.08, PZ1 - PZ0, 0x8a8f96, { umriss: 0.003 }), 0, 0.85, (PZ0 + PZ1) / 2));
  const bord = (b, x, z, ry) => { const m = quader(b, 0.42, 0.04, 0xc8ccd0, { umriss: 0.003 }); m.position.set(x, 1.1, z); m.rotation.y = ry; for (let k = 0; k < 5; k++) { const rip = quader(b - 0.04, 0.015, 0.05, 0xa8aeb4, { umriss: false }); rip.position.set(0, -0.15 + k * 0.075, 0); m.add(rip); } for (const sx of [-1, 1]) { const ecke = quader(0.06, 0.44, 0.06, 0xb0b6bc, { umriss: 0.002 }); ecke.position.set(sx * (b / 2 - 0.03), 0, 0); m.add(ecke); } t.add(m); return m; };
  bord(W, 0, PZ1 - 0.02, 0);
  bord(PZ1 - PZ0, W / 2 - 0.02, (PZ0 + PZ1) / 2, Math.PI / 2);
  const offen = bord(PZ1 - PZ0, -W / 2 - 0.25, (PZ0 + PZ1) / 2, Math.PI / 2);
  offen.rotation.z = -1.2; offen.position.y = 0.8;
  const hinten = bord(W, 0, PZ0 + 0.02, 0);
  hinten.rotation.x = 0.4;
  // Pritschen-Details: Riffelblech-Boden mit Zurrösen, Längsrahmen darunter, Eckrungen, Bordwandverschlüsse, Scharniere,
  // verrutschte Ladung (Schaltafel, Kanister, Spanngurt)
  {
    const PL = PZ1 - PZ0, PM = (PZ0 + PZ1) / 2;
    const riffelB = leinwandTextur(64, 64, (g, b, h) => { g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, b, h); g.strokeStyle = '#7a8086'; g.lineWidth = 3; for (let y = 4; y < h; y += 10) for (let x = (y / 10) % 2 ? 0 : 6; x < b; x += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 4); g.stroke(); } }, [4, 6]);
    t.add(setze(teil(new THREE.BoxGeometry(W - 0.1, 0.012, PL - 0.1), 0, { material: toon(0xffffff, { map: riffelB }), umriss: false }), 0, 0.896, PM));
    for (const sx of [-1, 1]) {
      t.add(setze(quader(0.08, 0.14, PL, SCHW, { umriss: 0.002 }), sx * 0.55, 0.74, PM)); // Längsträger
      for (let k = 0; k < 4; k++) t.add(setze(teil(new THREE.TorusGeometry(0.025, 0.007, 5, 10), 0x5a5d62, { umriss: false }), sx * (W / 2 - 0.12), 0.91, PZ0 + 0.25 + k * (PL - 0.5) / 3, Math.PI / 2, 0, 0)); // Zurrösen
    }
    for (let k = 0; k < 5; k++) t.add(setze(quader(W - 0.15, 0.07, 0.06, SCHW, { umriss: false }), 0, 0.77, PZ0 + 0.15 + k * (PL - 0.3) / 4)); // Querträger
    // Eckrungen (Alu-Profile) und Mittelrunge an der stehenden Seite
    for (const [x, zz] of [[W / 2 - 0.02, PZ0 + 0.03], [W / 2 - 0.02, PZ1 - 0.03], [-W / 2 + 0.02, PZ1 - 0.03], [-W / 2 + 0.02, PZ0 + 0.03], [W / 2 - 0.02, PM]]) t.add(setze(quader(0.06, 0.46, 0.06, 0xb0b5ba, { umriss: 0.002 }), x, 1.12, zz));
    // Bordwandverschlüsse (Spannhebel) und Scharniere unten an der stehenden Seitenwand
    for (const zz of [PZ0 + 0.4, PZ1 - 0.4]) {
      t.add(setze(quader(0.03, 0.12, 0.1, 0x3a3c40, { umriss: 0.0015 }), W / 2 + 0.01, 1.22, zz));
      t.add(setze(zylinder(0.012, 0.012, 0.14, 0x3a3c40, { umriss: false }, 6), W / 2 + 0.03, 1.17, zz, Math.PI / 2, 0, 0));
    }
    for (let k = 0; k < 4; k++) t.add(setze(zylinder(0.018, 0.018, 0.1, 0x5a5d62, { umriss: 0.001 }, 8), W / 2 + 0.005, 0.9, PZ0 + 0.3 + k * (PL - 0.6) / 3, Math.PI / 2, 0, 0));
    // Ladung: verrutschte Schaltafel (gelb), umgekippter Kanister, loser Spanngurt
    t.add(setze(quader(0.9, 0.025, 1.6, 0xe2b33a, { umriss: 0.002 }), -0.15, 0.93, PM + 0.2, 0.06, 0.35, -0.12));
    const kan = new THREE.Group();
    kan.add(setze(rundQuader(0.28, 0.36, 0.16, 0xc8352a, { umriss: 0.002 }, 0.03), 0, 0.18, 0));
    kan.add(setze(zylinder(0.03, 0.03, 0.06, 0x1d1d1f, { umriss: false }, 8), 0.08, 0.38, 0));
    kan.add(setze(quader(0.14, 0.03, 0.04, 0xc8352a, { umriss: 0.001 }), -0.04, 0.38, 0));
    setze(kan, 0.45, 0.9, PZ0 + 0.6, 0, 0.8, Math.PI / 2);
    t.add(kan);
    const gurtK = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.6, 0.91, PZ0 + 0.3), new THREE.Vector3(-0.2, 0.93, PZ0 + 0.9), new THREE.Vector3(0.1, 0.92, PZ0 + 0.6), new THREE.Vector3(0.4, 0.94, PZ0 + 1.3)]);
    t.add(teil(new THREE.TubeGeometry(gurtK, 24, 0.012, 4, false), 0xf26a1b, { umriss: false }));
  }
  // VW-Logo auf der hinteren Bordwand, „TDI" daneben
  const logoTex = leinwandTextur(64, 64, (g, b, h) => {
    g.clearRect(0, 0, b, h); g.fillStyle = '#c9cdd2'; g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#3a3c40'; g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 26, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(16, 14); g.lineTo(26, 40); g.lineTo(32, 26); g.lineTo(38, 40); g.lineTo(48, 14); g.stroke();
    g.beginPath(); g.moveTo(20, 34); g.lineTo(26, 54); g.lineTo(32, 42); g.lineTo(38, 54); g.lineTo(44, 34); g.stroke();
  });
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }));
  logo.position.set(0, 0.02, -0.025); logo.rotation.y = Math.PI;
  hinten.add(logo);
  // Alu-Werkzeugkiste (Riffelblech) direkt hinter der Kabine
  const riffel = leinwandTextur(64, 64, (g, b, h) => { g.fillStyle = '#c9cdd2'; g.fillRect(0, 0, b, h); g.strokeStyle = '#9aa0a6'; g.lineWidth = 2; for (let y = 4; y < h; y += 10) for (let x = (y / 10) % 2 ? 0 : 6; x < b; x += 12) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6, y + 4); g.stroke(); } }, [3, 2]);
  t.add(setze(teil(new THREE.BoxGeometry(W - 0.2, 0.45, 0.6), 0, { material: toon(0xffffff, { map: riffel }), umriss: 0.003 }), 0, 1.12, PZ1 - 0.36));
  // Rückleuchten, Anhängerkupplung
  // Heckträger unter der Pritsche mit Rückleuchten (rot/orange), Kennzeichenhalter und Anhängerkupplung
  t.add(setze(quader(W - 0.1, 0.12, 0.1, SCHW, { umriss: 0.003 }), 0, 0.5, PZ0 + 0.05));
  for (const sx of [-1, 1]) {
    t.add(setze(quader(0.3, 0.1, 0.06, 0x2a2c30, { umriss: 0.002 }), sx * 0.72, 0.5, PZ0 + 0.0));
    t.add(setze(quader(0.17, 0.08, 0.02, 0xc8352a, { umriss: false }), sx * 0.75, 0.5, PZ0 - 0.035));
    t.add(setze(quader(0.07, 0.08, 0.02, 0xf2a21c, { umriss: false }), sx * 0.61, 0.5, PZ0 - 0.035));
  }
  t.add(setze(quader(0.52, 0.12, 0.02, 0x3a3c40, { umriss: false }), 0, 0.5, PZ0 - 0.04));
  t.add(setze(zylinder(0.03, 0.03, 0.25, 0x3a3c40, { umriss: 0.002 }, 8), 0, 0.42, PZ0 - 0.12, Math.PI / 2, 0, 0));
  t.add(setze(kugel(0.05, 0x3a3c40, { umriss: 0.002 }, 8), 0, 0.47, PZ0 - 0.24));
  // Räder (mit Radläufen)
  for (const z of [1.55, -1.45]) for (const sx of [-1, 1]) {
    t.add(setze(zylinder(0.36, 0.36, 0.24, SCHW, { umriss: 0.003 }, 20), sx * (W / 2 - 0.1), 0.36, z, 0, 0, Math.PI / 2));
    t.add(setze(zylinder(0.22, 0.22, 0.25, 0xd0d3d6, { umriss: false }, 14), sx * (W / 2 - 0.1), 0.36, z, 0, 0, Math.PI / 2));
    for (let k = 0; k < 6; k++) { const w = k / 6 * Math.PI * 2; t.add(setze(zylinder(0.03, 0.03, 0.26, 0x6e7177, { umriss: false }, 8), sx * (W / 2 - 0.1), 0.36 + Math.sin(w) * 0.13, z + Math.cos(w) * 0.13, 0, 0, Math.PI / 2)); }
    t.add(setze(teil(new THREE.CylinderGeometry(0.46, 0.46, 0.3, 18, 1, true, Math.PI * 0.1, Math.PI * 0.8), SCHW, { umriss: 0.002, mat: { side: THREE.DoubleSide } }), sx * (W / 2 - 0.08), 0.36, z, 0, 0, Math.PI / 2));
  }
  // Schäden: Beulen im Dach, gesplitterte Frontscheibe (Risse), abgerissener Spiegel
  for (let k = 0; k < 10; k++) {
    const w = k / 10 * Math.PI * 2;
    const riss = quader(0.3 + (k % 3) * 0.1, 0.008, 0.008, 0xffffff, { umriss: false });
    riss.position.set(0.3 + Math.cos(w) * 0.12, 1.62 + Math.sin(w) * 0.08, 1.98 - Math.sin(w) * 0.06);
    riss.rotation.set(-0.99, 0, w);
    t.add(riss);
  }
  for (let k = 0; k < 5; k++) { const b = kugel(0.18 + k * 0.03, LACK_D, { umriss: false }, 8); b.scale.y = 0.25; b.position.set(-0.4 + k * 0.25, 1.95, 0.6 + (k % 2) * 0.6); t.add(b); }
  // schwarze Seitenschutzleisten, Schweller
  for (const sx of [-1, 1]) t.add(setze(quader(0.04, 0.12, KZ1 - KZ0 - 0.3, SCHW, { umriss: false }), sx * (W / 2 + 0.01), 0.58, (KZ0 + KZ1) / 2));
  return t;
}
