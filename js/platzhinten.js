// Platz hinter der Werkstatt (Paket E2a): Schotterfläche (organischer Rand), Weg vom alten Hoflader-Platz nach hinten,
// Schrottplatz direkt hinterm Haus mit schmalem Gang von der Hintertür (grüne Tür an der Rückwand) bis vorne ans Carport,
// dahinter das Carport mit drei beschrifteten Buchten (Paletten, Pritsche, Weidemann). Blauer Container an der Rückwand.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, setze, leinwandTextur, zufall } from './toon.js';

// Hintertür in der Rückwand (z = -4): Öffnung x -3,45 … -2,35, 2,15 m hoch (dort hing früher der Hula-Hoop-Reifen)
export const HINTERTUER = { x0: -3.45, x1: -2.35, hoehe: 2.15, mitte: -2.9 };
// Schotterfläche (Welt x, z): Umriss mit organischen Rändern; fest = gerade Kante (an der Hauswand und an der Betonplatte).
// Läuft rechts am Haus entlang (dort parkte früher der Hoflader) bis an die Betonplatte vorne, hinterm Haus über
// Schrottplatz und Carport; links neben dem Carport (Welt -x) kein Schotter.
export const SCHOTTER_UMRISS = [
  [5.25, -4.12, true], [5.25, 4.0, true], [7.5, 4.0], [8.8, 2.6], [9.5, 0.2], [9.7, -3.5], [9.9, -8.5], [9.0, -13.0],
  [7.2, -17.0], [5.2, -21.0], [3.0, -23.2], [0.0, -23.5], [-3.5, -23.0], [-6.5, -22.5], [-6.7, -17.5], [-6.6, -12.2],
  [-8.8, -11.2], [-11.0, -11.0], [-11.9, -8.5], [-11.9, -5.8], [-11.2, -4.3], [-5.2, -4.12, true],
];
// Carport: Reihenfolge vom Haus weg Werkstatt, Schrottplatz, Carport (Betreiber 9.11.); längs gestellt, drei Buchten
// hintereinander (vom Haus weg): Paletten, Pritsche, Weidemann. Offen zur Seite (Welt +x, Schilder dort) und nach hinten
// (Welt -x), Schotterboden (kein Beton). Der Gang von der Hintertür endet vorne am Carport. Gebaut wird es lokal
// (Länge entlang lokal x, Öffnung lokal +z) und gedreht:
// lokal (X, Z) -> Welt (CX + Z, CZ - X).
export const CARPORT = { x0: -6.0, x1: -1.4, z0: -21.6, z1: -11.1, hoehe: 3.2 };
const CL = CARPORT.z1 - CARPORT.z0, CD = CARPORT.x1 - CARPORT.x0;
const CX = (CARPORT.x0 + CARPORT.x1) / 2, CZ = (CARPORT.z0 + CARPORT.z1) / 2;
const BB = CL / 3;
const zuWelt = (X, Z) => ({ x: CX + Z, z: CZ - X });
const bucht = (i) => ({ x: CX, z: CZ - (-CL / 2 + BB * (i + 0.5)), hx: CD / 2, hz: BB / 2 - 0.15 });
export const BUCHTEN = { paletten: bucht(0), pritsche: bucht(1), weidemann: bucht(2) };
// Pfosten (Welt), für Hindernisse und Wege
export const CARPORT_PFOSTEN = [0, 1, 2, 3].flatMap((i) => [CD / 2, -CD / 2].map((Z) => zuWelt(-CL / 2 + i * BB, Z)));
// Schrottplatz: Kästen, in denen Schrott liegt (Figuren und Fahrzeuge kommen da nicht durch). Dazwischen bleibt der
// Gang von der Hintertür (x ≈ -2,9) zwischen Schrott und Container frei bis zur Fahrspur (z -12,4 … -9,8), die direkt zum Carport führt.
// Blauer 20-Fuß-Container Rücken an Rücken an der Rückwand, rechts von der Hintertür (von hinten gesehen links davon),
// Längsseite zum Hof ganz offen; innen Metalllängen bis 6 m (Paket E2a, noch ohne Funktion)
export const CONTAINER = { xMin: -1.6, xMax: 4.46, zMin: -6.6, zMax: -4.1, hoehe: 2.59 };
export const SCHROTT_KAESTEN = [
  { xMin: -11.2, xMax: -3.75, zMin: -10.5, zMax: -4.5 },
  { xMin: -1.95, xMax: 2.6, zMin: -10.4, zMax: -8.6 },
]

export function bauePlatzHinten(scene, { merke, hindernis }) {
  const r = zufall(808);
  const gruppe = new THREE.Group();
  gruppe.name = 'platzHinten';
  scene.add(gruppe);

  // ---------- Schotter (wie der Parkplatz am Hof: graue Körnung, ein paar dunkle Flecken, Grasbüschel am Rand) ----------
  const schotterTex = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#958f82'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 3400; i++) { const v = 105 + r() * 95; g.fillStyle = `rgb(${v},${v - 4},${v - 13})`; g.fillRect(r() * b, r() * h, 2, 2); }
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(70,60,40,0.16)'; g.beginPath(); g.ellipse(r() * b, r() * h, 18 + r() * 30, 8 + r() * 14, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 25; i++) { g.fillStyle = 'rgba(80,120,50,0.55)'; const x = r() * b, y = r() * h; for (let k = 0; k < 6; k++) g.fillRect(x + (r() - 0.5) * 6, y + (r() - 0.5) * 6, 1, 3); }
  });
  schotterTex.wrapS = schotterTex.wrapT = THREE.RepeatWrapping;
  const schotterMat = toon(0xffffff, { map: schotterTex });
  schotterTex.repeat.set(0.25, 0.25);
  // Umriss mit wackligen Rändern (feste Kanten bleiben gerade); Shape in x/-z, flach hingelegt
  const umriss = [];
  SCHOTTER_UMRISS.forEach(([x0, z0, fest], i) => {
    const [x1, z1] = SCHOTTER_UMRISS[(i + 1) % SCHOTTER_UMRISS.length];
    const l = Math.hypot(x1 - x0, z1 - z0), n = fest ? 1 : Math.max(2, Math.ceil(l / 0.6));
    const nx = -(z1 - z0) / l, nz = (x1 - x0) / l;
    for (let k = 0; k < n; k++) {
      const t = k / n, w = fest || k === 0 ? 0 : (Math.sin(i * 7.3 + k * 1.7) * 0.22 + (r() - 0.5) * 0.3);
      umriss.push({ x: x0 + (x1 - x0) * t + nx * w, z: z0 + (z1 - z0) * t + nz * w, fest: !!fest });
    }
  });
  const innen = (x, z) => {
    let drin = false;
    for (let i = 0, j = umriss.length - 1; i < umriss.length; j = i++) {
      const a = umriss[i], b = umriss[j];
      if ((a.z > z) !== (b.z > z) && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) drin = !drin;
    }
    return drin;
  };
  {
    const form = new THREE.Shape(umriss.map((p) => new THREE.Vector2(p.x, -p.z)));
    const m = new THREE.Mesh(new THREE.ShapeGeometry(form), schotterMat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = 0.008;
    m.receiveShadow = true;
    gruppe.add(m);
  }
  // fließender Übergang zum Rasen: lose Schotterflecken nach außen, immer durchsichtiger; Grasbüschel im Schotter
  const fleckMats = [0.7, 0.5, 0.3].map((o) => toon(0xffffff, { map: schotterTex, transparent: true, opacity: o, depthWrite: false }));
  const buschel = toon(0x5d8a3a);
  umriss.forEach((p, i) => {
    if (p.fest) return;
    const q = umriss[(i + 1) % umriss.length];
    const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
    let nx = -(q.z - p.z) / l, nz = (q.x - p.x) / l;
    if (innen(p.x + nx * 0.4, p.z + nz * 0.4)) { nx = -nx; nz = -nz; }
    for (let k = 0; k < 3; k++) {
      const d = 0.1 + k * 0.35 + r() * 0.25, rr = 0.35 - k * 0.07 + r() * 0.2;
      const f = new THREE.Mesh(new THREE.CircleGeometry(rr, 9), fleckMats[k]);
      f.rotation.x = -Math.PI / 2;
      f.position.set(p.x + nx * d + (q.x - p.x) * r(), 0.006 - k * 0.0005, p.z + nz * d + (q.z - p.z) * r());
      f.scale.set(1, 0.6 + r() * 0.6, 1);
      gruppe.add(f);
    }
    if (r() < 0.5) {
      // flaches Grasbüschel (mehrere kleine Halme), eher außen am Rand
      const d = 0.05 + r() * 0.5, bx = p.x + nx * d + (q.x - p.x) * r(), bz = p.z + nz * d + (q.z - p.z) * r();
      for (let k = 0; k < 4; k++) {
        const b = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09 + r() * 0.06, 4), buschel);
        b.position.set(bx + (r() - 0.5) * 0.12, 0.05, bz + (r() - 0.5) * 0.12);
        b.rotation.set((r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5);
        gruppe.add(b);
      }
    }
  });
  // Fahrspuren im Schotter (dunkler, festgefahren): den Weg runter und zum Carport
  const spur = (x0, z0, x1, z1) => {
    const l = Math.hypot(x1 - x0, z1 - z0);
    for (const s of [-0.55, 0.55]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, l), toon(0x7d776b, { transparent: true, opacity: 0.5, depthWrite: false }));
      m.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0));
      const nx = (z1 - z0) / l, nz = -(x1 - x0) / l;
      m.position.set((x0 + x1) / 2 + nx * s, 0.011, (z0 + z1) / 2 + nz * s);
      gruppe.add(m);
    }
  };
  spur(7.6, 3.6, 8.8, -7.5);
  spur(8.8, -7.5, 6.4, -14.5);
  spur(6.4, -14.5, 3.5, -18.6);
  spur(3.5, -18.6, -1.2, BUCHTEN.weidemann.z);

  // ---------- Carport: Holzpfosten mit Stahlfüßen, Pfetten, Sparren, Wellplatten-Dach (vorne hoch, hinten tief),
  // Stirnbrett, Regenrinne mit Fallrohr, Kopfbänder, Lampe, Radstopper, Schilder unter der Pfette; Schotterboden ----------
  // lokal gebaut: Länge entlang x (-L/2 … L/2), Tiefe entlang z, vorne (offen, Schilder) bei +z; dann gedreht
  const HOLZ = 0x8a6440, HOLZ_D = 0x6e4f33, STAHL_V = 0x8c8f94;
  const cp = new THREE.Group();
  cp.position.set(CX, 0, CZ);
  cp.rotation.y = Math.PI / 2;
  gruppe.add(cp);
  const L = CL, D = CD;
  const pfostenX = [0, 1, 2, 3].map((i) => -L / 2 + i * BB);
  const hVorne = CARPORT.hoehe, hHinten = CARPORT.hoehe - 0.35;
  const PF = 0.2; // Pfettenhöhe
  for (const x of pfostenX) for (const [z, h] of [[D / 2, hVorne - PF], [-D / 2, hHinten - PF]]) {
    cp.add(setze(quader(0.14, h - 0.12, 0.14, HOLZ, { umriss: 0.004 }), x, 0.12 + (h - 0.12) / 2, z));
    // H-Pfostenträger aus Stahl, einbetoniert
    cp.add(setze(quader(0.2, 0.02, 0.2, STAHL_V, { umriss: 0.002 }), x, 0.02, z));
    for (const s of [-1, 1]) cp.add(setze(quader(0.01, 0.2, 0.16, STAHL_V, { umriss: 0.002 }), x + s * 0.075, 0.12, z));
    cp.add(setze(zylinder(0.012, 0.012, 0.18, 0x3a3a3c, { umriss: false }, 6), x, 0.15, z, 0, 0, Math.PI / 2));
  }
  for (const p of CARPORT_PFOSTEN) hindernis(p.x - 0.16, p.x + 0.16, p.z - 0.16, p.z + 0.16);
  // Pfetten (liegen auf den Pfosten), Stirnbrett vorne
  cp.add(setze(quader(L + 0.5, PF, 0.14, HOLZ_D, { umriss: 0.004 }), 0, hVorne - PF / 2, D / 2));
  cp.add(setze(quader(L + 0.5, PF, 0.14, HOLZ_D, { umriss: 0.004 }), 0, hHinten - PF / 2, -D / 2));
  // Dachneigung: vorne (lokal +z) hoch, hinten tief; Sparren liegen auf den Pfetten, Dach auf den Sparren
  const neigung = Math.atan2(hVorne - hHinten, D); // Drehung um x: -neigung hebt +z an
  const SP = 0.14, ueber = 0.35;
  const tiefe = D / Math.cos(neigung) + 2 * ueber;
  const hoeheBeiZ = (z) => hHinten + (z + D / 2) * Math.tan(neigung);
  for (let k = 0; k <= 9; k++) {
    const x = -L / 2 - 0.2 + k * (L + 0.4) / 9;
    cp.add(setze(quader(0.08, SP, tiefe, HOLZ, { umriss: 0.003 }), x, hoeheBeiZ(0) + SP / 2, 0, -neigung, 0, 0));
  }
  const wellTex = leinwandTextur(256, 64, (g, b, h) => {
    for (let x = 0; x < b; x++) { const v = 150 + Math.sin(x / b * Math.PI * 16) * 30; g.fillStyle = `rgb(${v * 0.72},${v * 0.8},${v * 0.74})`; g.fillRect(x, 0, 1, h); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(60,70,50,0.25)'; g.fillRect(r() * b, r() * h, 2 + r() * 8, 1 + r() * 3); }
    // Moos und Laub am unteren Rand
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${70 + r() * 40},${100 + r() * 40},40,0.5)`; g.fillRect(r() * b, h - 6 - r() * 10, 2 + r() * 5, 2 + r() * 4); }
  });
  wellTex.wrapS = wellTex.wrapT = THREE.RepeatWrapping;
  wellTex.repeat.set((L + 0.8) / 2, 1);
  const dach = new THREE.Mesh(new THREE.BoxGeometry(L + 0.8, 0.04, tiefe + 0.1), toon(0xffffff, { map: wellTex }));
  dach.position.set(0, hoeheBeiZ(0) + SP + 0.02, 0);
  dach.rotation.x = -neigung;
  dach.castShadow = true; dach.receiveShadow = true;
  cp.add(dach);
  merke(dach, 'carportHinten', 'Carport hinterm Haus', null);
  // Stirnbrett vorne am Dachrand (deckt die Sparrenköpfe ab)
  const zVorn = D / 2 + ueber * Math.cos(neigung), yVorn = hoeheBeiZ(0) + (D / 2 + ueber) * Math.sin(neigung);
  cp.add(setze(quader(L + 0.85, 0.22, 0.04, 0xa07850, { umriss: 0.003 }), 0, yVorn + 0.03, zVorn + 0.02, -neigung, 0, 0));
  // Regenrinne hinten (am tiefen Rand) mit Fallrohr an der Ecke
  const zHint = -D / 2 - ueber * Math.cos(neigung), yHint = hoeheBeiZ(0) - (D / 2 + ueber) * Math.sin(neigung);
  cp.add(setze(zylinder(0.07, 0.07, L + 0.8, 0x7a7e82, { umriss: 0.002 }, 10), 0, yHint - 0.02, zHint - 0.06, 0, 0, Math.PI / 2));
  cp.add(setze(zylinder(0.045, 0.045, yHint, 0x7a7e82, { umriss: 0.002 }, 10), L / 2 + 0.25, yHint / 2, zHint - 0.06));
  cp.add(setze(zylinder(0.045, 0.06, 0.25, 0x7a7e82, { umriss: 0.002 }, 10), L / 2 + 0.35, 0.1, zHint - 0.06, 0, 0, -1.1));
  // Kopfbänder (schräge Streben) vorne und hinten
  for (const [z, h] of [[D / 2, hVorne - PF], [-D / 2, hHinten - PF]]) for (const x of pfostenX) for (const s of [-1, 1]) {
    if ((x === pfostenX[0] && s < 0) || (x === pfostenX[3] && s > 0)) continue;
    cp.add(setze(quader(0.08, 0.62, 0.08, HOLZ, { umriss: 0.003 }), x + s * 0.22, h - 0.22, z, 0, 0, -s * 0.78));
  }
  // Lampe unter dem Dach in der mittleren Bucht, Kabel an der Pfette entlang
  cp.add(setze(quader(0.3, 0.08, 0.12, 0xe8e4da, { umriss: 0.002 }), 0, hoeheBeiZ(0.6) - 0.06, 0.6));
  cp.add(setze(quader(0.26, 0.02, 0.09, 0xfff4c0, { umriss: false }), 0, hoeheBeiZ(0.6) - 0.105, 0.6));
  cp.add(setze(zylinder(0.006, 0.006, L, 0x1d1d1f, { umriss: false }, 4), 0, hVorne - PF - 0.02, D / 2 - 0.1, 0, 0, Math.PI / 2));
  // Radstopper (Holzbalken) hinten in den Buchten Paletten und Weidemann (die Pritschen-Bucht bleibt frei zum Durchfahren),
  // Ölfleck in der Weidemann-Bucht
  for (const i of [0, 2]) cp.add(setze(quader(1.6, 0.12, 0.14, 0x7a5a3a, { umriss: 0.003 }), -L / 2 + BB * (i + 0.5), 0.07, -D / 2 + 0.55));
  {
    const fleck = new THREE.Mesh(new THREE.CircleGeometry(0.55, 14), toon(0x2a2622, { transparent: true, opacity: 0.55, depthWrite: false }));
    fleck.rotation.x = -Math.PI / 2; fleck.scale.set(1.3, 0.8, 1);
    fleck.position.set(-L / 2 + BB * 2.5 + 0.2, 0.013, 0.2);
    cp.add(fleck);
  }
  // Schilder unter der vorderen Pfette (zwei Ketten), je Bucht eins
  const schild = (text, i, id, name) => {
    const tex = leinwandTextur(320, 96, (g, b, h) => {
      g.fillStyle = '#f4efe0'; g.fillRect(0, 0, b, h);
      g.strokeStyle = '#1d1d1f'; g.lineWidth = 6; g.strokeRect(4, 4, b - 8, h - 8);
      g.fillStyle = '#1d1d1f'; g.font = 'bold 50px Bangers, Impact, sans-serif'; g.textAlign = 'center'; g.fillText(text, b / 2, 66);
    });
    const s = new THREE.Group();
    s.add(setze(quader(1.5, 0.46, 0.03, 0x9a7a52, { umriss: 0.003 }), 0, 0, 0));
    const vorn = teil(new THREE.PlaneGeometry(1.44, 0.42), 0, { material: toon(0xffffff, { map: tex }), umriss: false });
    vorn.position.z = 0.017;
    s.add(vorn);
    for (const x of [-0.6, 0.6]) s.add(setze(zylinder(0.006, 0.006, 0.18, 0x5a5a5c, { umriss: false }, 4), x, 0.32, 0));
    s.position.set(-L / 2 + BB * (i + 0.5), hVorne - PF - 0.45, D / 2 + 0.02);
    cp.add(s);
    if (id) merke(s, id, name, null);
    return s;
  };
  schild('PALETTEN', 0, 'palettenSchild', 'Schild: Paletten');
  schild('PRITSCHE', 1, null);
  schild('WEIDEMANN', 2, null);
  // Kram, der im Carport rumliegt (nicht in der Pritschen-Bucht: die bleibt frei zum Durchfahren). Lokal: X entlang
  // des Carports (Bucht i: -L/2 + BB*i … +BB), Z quer (+D/2 = offene Seite)
  const kram = (obj, X, Z, ry = 0) => { obj.position.set(X, obj.position.y, Z); obj.rotation.y = ry; cp.add(obj); return obj; };
  const tasse = (farbe) => {
    const g = new THREE.Group();
    g.add(setze(zylinder(0.045, 0.04, 0.095, farbe, { umriss: 0.002 }, 14), 0, 0.048, 0));
    g.add(setze(zylinder(0.038, 0.038, 0.004, 0x3a2418, { umriss: false }, 12), 0, 0.09, 0)); // Kaffeerest
    g.add(setze(teil(new THREE.TorusGeometry(0.026, 0.008, 6, 12, Math.PI), farbe, { umriss: false }), 0.045, 0.05, 0, 0, 0, -Math.PI / 2));
    return g;
  };
  // Tasse oben auf dem Palettenstapel, eine zweite am vorderen Pfosten der Weidemann-Bucht
  {
    const t = tasse(0xe8e4da);
    // Welt -> lokal: X = CZ - z, Z = x - CX
    const P = BUCHTEN.paletten;
    kram(t, CZ - (P.z - 0.55), (P.x - 1.0) - CX + 0.1, 0.4);
    t.position.y = 3 * 0.144 + 0.005;
  }
  kram(tasse(0x2f5fa8), -L / 2 + 2 * BB + 0.25, D / 2 - 0.3, 1.2);
  // leere Bierflasche, umgekippt, in der Paletten-Bucht
  {
    const g = new THREE.Group();
    const f = new THREE.Group();
    f.add(setze(zylinder(0.032, 0.032, 0.17, 0x5a3612, { umriss: 0.002 }, 12), 0, 0.085, 0));
    f.add(setze(zylinder(0.014, 0.03, 0.05, 0x5a3612, { umriss: 0.002 }, 12), 0, 0.195, 0));
    f.add(setze(zylinder(0.013, 0.013, 0.05, 0x5a3612, { umriss: 0.002 }, 10), 0, 0.245, 0));
    f.add(setze(quader(0.065, 0.07, 0.002, 0xe8d8a8, { umriss: false }), 0, 0.09, 0.032));
    f.rotation.z = Math.PI / 2; f.position.y = 0.032;
    g.add(f);
    kram(g, -L / 2 + 0.6, D / 2 - 0.9, 0.7);
  }
  // Farbdosen (eine umgekippt, mit Lack-Pfütze) hinten in der Weidemann-Bucht: Blechdose mit Falzrändern, Etikett mit
  // Farbfeld und Schrift, Deckel mit Farbrand, Läufer an der Seite, Drahthenkel mit Griff; ein Pinsel liegt auf einer Dose
  {
    const etikett = (farbe, text) => leinwandTextur(256, 64, (g, b, h) => {
      g.fillStyle = '#f2efe6'; g.fillRect(0, 0, b, h);
      g.fillStyle = farbe; g.fillRect(0, 0, b * 0.42, h);
      g.fillStyle = '#1d1d1f'; g.font = 'bold 22px Arial, sans-serif'; g.fillText(text, b * 0.46, 28);
      g.font = '13px Arial, sans-serif'; g.fillText('2,5 L  seidenmatt', b * 0.46, 48);
      g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 2; g.strokeRect(1, 1, b - 2, h - 2);
      for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(110,80,50,0.25)'; g.fillRect(r() * b, r() * h, 2 + r() * 8, 1 + r() * 4); }
    });
    const dose = (farbe, text, h = 0.2) => {
      const g = new THREE.Group(), R = 0.09, hex = '#' + farbe.toString(16).padStart(6, '0');
      g.add(setze(zylinder(R, R, h, 0xc8c2b4, { umriss: 0.003 }, 20), 0, h / 2, 0));
      const et = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.002, R + 0.002, h * 0.6, 20, 1, true), toon(0xffffff, { map: etikett(hex, text) }));
      et.position.y = h * 0.47; g.add(et);
      for (const y of [0.004, h - 0.004]) g.add(setze(teil(new THREE.TorusGeometry(R, 0.005, 4, 20), 0xa8a49a, { umriss: false }), 0, y, 0, Math.PI / 2, 0, 0)); // Falz
      g.add(setze(zylinder(R - 0.006, R - 0.006, 0.01, 0xb8b4aa, { umriss: 0.002 }, 20), 0, h + 0.004, 0)); // Deckel
      g.add(setze(teil(new THREE.TorusGeometry(R - 0.012, 0.006, 4, 20), farbe, { umriss: false }), 0, h + 0.008, 0, Math.PI / 2, 0, 0)); // Farbrand
      for (let i = 0; i < 4; i++) { // Läufer
        const w = r() * Math.PI * 2, l = 0.03 + r() * 0.08;
        g.add(setze(quader(0.012, l, 0.004, farbe, { umriss: false }), Math.sin(w) * (R + 0.003), h - l / 2, Math.cos(w) * (R + 0.003), 0, w, 0));
      }
      g.add(setze(teil(new THREE.TorusGeometry(R + 0.005, 0.0035, 4, 16, Math.PI), 0x8c8f94, { umriss: false }), 0, h - 0.02, 0, 0, 0, 0)); // Henkel
      g.add(setze(zylinder(0.008, 0.008, 0.05, 0x3a3a3c, { umriss: false }, 6), 0, h - 0.02 + R + 0.005, 0, 0, 0, Math.PI / 2)); // Griff
      return g;
    };
    const X0 = L / 2 - 0.45, Z0 = -D / 2 + 0.35;
    kram(dose(0x2f6b3a, 'LACK grün'), X0, Z0, 0.3);
    const rot = kram(dose(0xc8382c, 'LACK rot'), X0 - 0.22, Z0 + 0.05, 1.1);
    kram(dose(0xf2f0e8, 'Wandfarbe', 0.15), X0 - 0.05, Z0 + 0.22, 2.0);
    // Pinsel quer über der roten Dose
    {
      const p = new THREE.Group();
      p.add(setze(quader(0.18, 0.02, 0.03, 0xa07850, { umriss: 0.001 }), -0.05, 0, 0));
      p.add(setze(quader(0.04, 0.03, 0.05, 0x8c8f94, { umriss: 0.001 }), 0.06, 0, 0));
      p.add(setze(quader(0.05, 0.025, 0.05, 0xc8382c, { umriss: 0.001 }), 0.105, 0, 0));
      p.position.set(0, 0.2 + 0.03, 0); p.rotation.y = 0.4;
      rot.add(p);
    }
    const um = dose(0x2f5fa8, 'LACK blau');
    um.children.forEach((c) => { c.position.y -= 0.1; });
    um.rotation.z = Math.PI / 2; um.position.y = 0.095;
    const h = new THREE.Group(); h.add(um); kram(h, X0 - 0.5, Z0 + 0.35, 0.6);
    const deckel = setze(zylinder(0.084, 0.084, 0.01, 0xb8b4aa, { umriss: 0.002 }, 20), X0 - 0.25, 0.006, Z0 + 0.62, 0.05, 0, 0.04);
    cp.add(deckel);
    const pfuetze = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), toon(0x2f5fa8));
    pfuetze.rotation.x = -Math.PI / 2; pfuetze.scale.set(1.5, 0.8, 1);
    pfuetze.position.set(X0 - 0.78, 0.012, Z0 + 0.4);
    cp.add(pfuetze);
  }
  // Autobatterie hinten in der Paletten-Bucht
  {
    const g = new THREE.Group();
    g.add(setze(quader(0.28, 0.19, 0.175, 0x1d1d1f, { umriss: 0.003 }), 0, 0.095, 0));
    g.add(setze(quader(0.28, 0.02, 0.175, 0x2a2a2c, { umriss: 0.002 }), 0, 0.2, 0));
    g.add(setze(zylinder(0.012, 0.014, 0.025, 0xc8382c, { umriss: false }, 8), 0.1, 0.22, 0.05));
    g.add(setze(zylinder(0.012, 0.014, 0.025, 0x3a3a3c, { umriss: false }, 8), -0.1, 0.22, 0.05));
    g.add(setze(quader(0.1, 0.05, 0.002, 0xd8b23a, { umriss: false }), 0, 0.12, 0.089));
    kram(g, -L / 2 + 0.55, -D / 2 + 0.4, 0.2);
  }
  // Spanngurte: zwei Stück lang ausgerollt und durcheinander auf dem Boden, je mit Ratsche und zwei Haken
  // (vorne in der Paletten-Bucht)
  {
    const gurt = (farbe, punkte, ratscheBei) => {
      const g = new THREE.Group();
      const kurve = new THREE.CatmullRomCurve3(punkte.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
      const n = 60, pts = kurve.getSpacedPoints(n);
      for (let i = 0; i < n; i++) {
        const a = pts[i], b = pts[i + 1], l = a.distanceTo(b);
        // überkreuzende Stellen liegen etwas höher
        const y = 0.014 + (Math.sin(i * 0.9) > 0.95 ? 0.006 : 0);
        g.add(setze(quader(0.05, 0.003, l + 0.004, farbe, { umriss: false }), (a.x + b.x) / 2, y, (a.z + b.z) / 2, 0, Math.atan2(b.x - a.x, b.z - a.z), 0));
      }
      const haken = (p, t) => {
        const hk = new THREE.Group();
        hk.add(setze(quader(0.06, 0.01, 0.05, 0x8c8f94, { umriss: 0.001 }), 0, 0.006, 0));
        hk.add(setze(teil(new THREE.TorusGeometry(0.025, 0.006, 4, 10, Math.PI * 1.3), 0x8c8f94, { umriss: false }), 0, 0.008, 0.04, Math.PI / 2, 0, 0));
        hk.position.set(p.x, 0, p.z); hk.rotation.y = Math.atan2(t.x, t.z);
        g.add(hk);
      };
      haken(pts[0], kurve.getTangentAt(0).negate());
      haken(pts[n], kurve.getTangentAt(1));
      // Ratsche: Bügel, Griff, Welle
      const rp = kurve.getPointAt(ratscheBei), rt = kurve.getTangentAt(ratscheBei);
      const ra = new THREE.Group();
      ra.add(setze(quader(0.07, 0.035, 0.16, 0x9a9da2, { umriss: 0.002 }), 0, 0.02, 0));
      ra.add(setze(quader(0.05, 0.02, 0.1, 0x3a3a3c, { umriss: 0.001 }), 0, 0.045, -0.06));
      ra.add(setze(zylinder(0.015, 0.015, 0.09, 0x7a7e84, { umriss: false }, 8), 0, 0.025, 0.03, 0, 0, Math.PI / 2));
      ra.position.set(rp.x, 0, rp.z); ra.rotation.y = Math.atan2(rt.x, rt.z);
      g.add(ra);
      return g;
    };
    const X = -L / 2 + 2.4, Z = D / 2 - 0.7;
    const g1 = gurt(0xe06a1a, [[-1.0, 0.1], [-0.4, 0.35], [0.1, 0.0], [0.5, -0.4], [0.2, -0.7], [-0.3, -0.5], [0.4, 0.1], [1.1, 0.3]], 0.62);
    const g2 = gurt(0x2f5fa8, [[-0.8, -0.6], [-0.2, -0.2], [0.3, 0.3], [0.0, 0.55], [-0.5, 0.4], [0.2, -0.1], [0.9, -0.5]], 0.3);
    g1.position.set(X, 0.004, Z); g2.position.set(X + 0.1, 0, Z - 0.1);
    cp.add(g1, g2);
  }

  // ---------- Schrottplatz ----------
  const ROST = [0x8a4a2a, 0x7a3e22, 0x9a5a34, 0x6e5a4a, 0x5a4a40];
  const rost = () => ROST[Math.floor(r() * ROST.length)];
  // hinlegen; ragt etwas in den Boden (z. B. schräg liegend), wird es angehoben, bis es aufliegt
  const legen = (obj, x, z, ry = r() * Math.PI * 2) => {
    obj.position.set(x, obj.position.y, z); obj.rotation.y = ry; gruppe.add(obj);
    obj.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(obj);
    if (bb.min.y < 0) obj.position.y -= bb.min.y - 0.005;
    return obj;
  };
  // Schrotthaufen: nur Metall. Innen ein Kern aus zerdrückten Blechkisten, verbogenen Blechen und Kleinteilen (füllt den
  // Haufen, damit nichts in der Luft hängt), darüber Bleche, Rohre, Vierkant, Träger, Winkel, Gitter, Töpfe, Pfannen,
  // Grillroste und rostiges Werkzeug kreuz und quer; Höhe nach Hügelform
  function altmetall(cx, cz, rx, rz, n, hoehe = 1.0) {
    const g = new THREE.Group();
    const hoeheBei = (x, z) => Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2);
    // Kern: zerdrückte Kisten und Blechpakete, nach innen höher
    for (let i = 0; i < Math.round(n * 0.45); i++) {
      let x, z;
      do { x = (r() - 0.5) * rx * 1.7; z = (r() - 0.5) * rz * 1.7; } while (hoeheBei(x, z) <= 0.15);
      const hh = hoeheBei(x, z) * hoehe * 0.75;
      const m = quader(0.3 + r() * 0.5, Math.max(0.12, hh * (0.6 + r() * 0.5)), 0.3 + r() * 0.5, rost(), { umriss: 0.003 });
      m.position.set(x, m.geometry.parameters.height / 2 * 0.8, z);
      m.rotation.set((r() - 0.5) * 0.4, r() * Math.PI, (r() - 0.5) * 0.4);
      g.add(m);
    }
    // Kleinkram am Fuß des Haufens
    for (let i = 0; i < Math.round(n * 0.4); i++) {
      const w = r() * Math.PI * 2, d = 0.75 + r() * 0.3;
      const m = kleinteil();
      m.position.set(Math.cos(w) * rx * d, 0.02, Math.sin(w) * rz * d);
      m.rotation.y = r() * 6;
      g.add(m);
    }
    for (let i = 0; i < n; i++) {
      const art = r();
      let x, z;
      do { x = (r() - 0.5) * rx * 2; z = (r() - 0.5) * rz * 2; } while (hoeheBei(x, z) <= 0.02);
      const y = hoeheBei(x, z) * hoehe * (0.55 + r() * 0.5) + 0.03;
      let m;
      if (art < 0.25) m = quader(0.4 + r() * 1.0, 0.02, 0.3 + r() * 0.7, rost(), { umriss: 0.003 }); // Blech
      else if (art < 0.42) m = zylinder(0.03 + r() * 0.05, 0.03 + r() * 0.05, 0.8 + r() * 1.6, rost(), { umriss: 0.003 }, 8); // Rohr
      else if (art < 0.56) m = quader(0.08, 0.08, 1.0 + r() * 1.4, rost(), { umriss: 0.003 }); // Vierkant
      else if (art < 0.66) m = quader(0.12, 0.2, 0.8 + r() * 1.6, 0x6a5a50, { umriss: 0.003 }); // Träger
      else if (art < 0.76) { // Winkel
        m = new THREE.Group();
        const l = 0.6 + r() * 1.0, f = rost();
        m.add(setze(quader(l, 0.06, 0.008, f, { umriss: 0.002 }), 0, 0.03, 0));
        m.add(setze(quader(l, 0.008, 0.06, f, { umriss: 0.002 }), 0, 0, 0.03));
      } else if (art < 0.84) { // Baustahlgitter
        m = new THREE.Group();
        const f = rost();
        for (let k = 0; k < 5; k++) m.add(setze(zylinder(0.006, 0.006, 1.0, f, { umriss: false }, 4), -0.4 + k * 0.2, 0, 0, Math.PI / 2, 0, 0));
        for (let k = 0; k < 5; k++) m.add(setze(zylinder(0.006, 0.006, 1.0, f, { umriss: false }, 4), 0, 0, -0.4 + k * 0.2, 0, 0, Math.PI / 2));
      } else if (art < 0.88) m = quader(0.15 + r() * 0.25, 0.1 + r() * 0.2, 0.15 + r() * 0.25, rost(), { umriss: 0.003 }); // Klotz, Kasten
      else m = kleinteil(); // Topf, Pfanne, Grillrost, Werkzeug
      m.position.set(x, y, z);
      m.rotation.set((r() - 0.5) * 0.9 + (art >= 0.25 && art < 0.42 ? Math.PI / 2 : 0), r() * Math.PI, (r() - 0.5) * 0.7);
      g.add(m);
      if (art >= 0.88) { m.rotation.x *= 0.5; m.rotation.z *= 0.5; }
    }
    g.position.set(cx, 0, cz);
    gruppe.add(g);
    merke(g, 'schrott', 'Schrott', null);
  }
  // Altreifen-Stapel
  function reifenStapel(x, z, n, liegt = false) {
    const g = new THREE.Group();
    for (let k = 0; k < n; k++) {
      const t = setze(teil(new THREE.TorusGeometry(0.3, 0.1, 8, 20), 0x1d1d1f, { umriss: 0.003 }), (r() - 0.5) * 0.08, 0.1 + k * 0.2, (r() - 0.5) * 0.08, Math.PI / 2 + (r() - 0.5) * 0.1, 0, (r() - 0.5) * 0.1);
      g.add(t);
    }
    if (liegt) { g.rotation.z = Math.PI / 2; g.position.y = 0.4; }
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z);
  }
  // Autotür mit Fensterrahmen, schräg angelehnt
  function autotuer(x, z, ry, farbe) {
    const g = new THREE.Group();
    g.add(setze(quader(1.0, 0.6, 0.06, farbe, { umriss: 0.003 }), 0, 0.3, 0));
    g.add(setze(quader(0.9, 0.05, 0.05, farbe, { umriss: 0.002 }), 0.02, 0.95, 0));
    g.add(setze(quader(0.05, 0.38, 0.05, farbe, { umriss: 0.002 }), -0.45, 0.78, 0));
    g.add(setze(quader(0.05, 0.4, 0.05, farbe, { umriss: 0.002 }), 0.44, 0.76, 0, 0, 0, -0.35));
    g.add(setze(quader(0.14, 0.03, 0.04, 0x8c8f94, { umriss: false }), 0.3, 0.45, 0.04)); // Griff
    for (let i = 0; i < 4; i++) g.add(setze(quader(0.05 + r() * 0.12, 0.03 + r() * 0.1, 0.005, 0x8a4a2a, { umriss: false }), (r() - 0.5) * 0.8, 0.1 + r() * 0.4, 0.035));
    g.rotation.x = -0.35;
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z, ry);
  }
  // Motorblock mit Zylinderkopf, Ölwanne, Riemenscheibe
  function motorblock(x, z, ry) {
    const g = new THREE.Group();
    g.add(setze(quader(0.6, 0.4, 0.42, 0x6e6a64, { umriss: 0.004 }), 0, 0.3, 0));
    g.add(setze(quader(0.62, 0.12, 0.34, 0x5a5650, { umriss: 0.003 }), 0, 0.56, 0));
    g.add(setze(quader(0.5, 0.1, 0.36, 0x3a3a3c, { umriss: 0.003 }), 0, 0.06, 0));
    g.add(setze(zylinder(0.13, 0.13, 0.05, 0x3a3a3c, { umriss: 0.002 }, 16), 0.33, 0.3, 0, 0, 0, Math.PI / 2));
    for (let i = 0; i < 4; i++) g.add(setze(zylinder(0.025, 0.025, 0.1, 0x8a4a2a, { umriss: false }, 6), -0.22 + i * 0.15, 0.66, 0.08));
    return legen(g, x, z, ry);
  }
  // alte Badewanne (emailliert, Rost am Rand)
  function badewanne(x, z, ry) {
    const g = new THREE.Group();
    g.add(setze(quader(1.6, 0.5, 0.06, 0xe8e4da, { umriss: 0.003 }), 0, 0.3, 0.35));
    g.add(setze(quader(1.6, 0.5, 0.06, 0xe8e4da, { umriss: 0.003 }), 0, 0.3, -0.35));
    for (const sx of [-1, 1]) g.add(setze(quader(0.06, 0.5, 0.76, 0xe8e4da, { umriss: 0.003 }), sx * 0.8, 0.3, 0));
    g.add(setze(quader(1.6, 0.05, 0.76, 0xd8d2c4, { umriss: 0.002 }), 0, 0.08, 0));
    for (const sx of [-0.65, 0.65]) for (const sz of [-0.28, 0.28]) g.add(setze(kugelFuss(), sx, 0.03, sz));
    for (let i = 0; i < 6; i++) g.add(setze(quader(0.08 + r() * 0.15, 0.06, 0.07, 0x8a4a2a, { umriss: false }), (r() - 0.5) * 1.5, 0.52, (r() < 0.5 ? -1 : 1) * 0.35));
    g.rotation.z = 0.12;
    return legen(g, x, z, ry);
  }
  function kugelFuss() { return teil(new THREE.SphereGeometry(0.05, 8, 6), 0x3a3a3c, { umriss: false }); }
  // Motorhaube (verbeult, schräg)
  function motorhaube(x, z, ry, farbe) {
    const g = new THREE.Group();
    const m = setze(quader(1.3, 0.04, 1.0, farbe, { umriss: 0.003 }), 0, 0.35, 0, 0.5, 0, 0.12);
    g.add(m);
    for (let i = 0; i < 5; i++) g.add(setze(quader(0.1 + r() * 0.2, 0.005, 0.1 + r() * 0.2, 0x8a4a2a, { umriss: false }), (r() - 0.5) * 1.1, 0.37 + (r() - 0.5) * 0.1, (r() - 0.5) * 0.8, 0.5, 0, 0.12));
    return legen(g, x, z, ry);
  }
  // Auspuff mit Topf
  function auspuff(x, z, ry) {
    const g = new THREE.Group();
    g.add(setze(zylinder(0.03, 0.03, 1.6, 0x5a4a40, { umriss: 0.002 }, 8), 0, 0.05, 0, 0, 0, Math.PI / 2));
    g.add(setze(zylinder(0.11, 0.11, 0.5, 0x6e5a4a, { umriss: 0.003 }, 12), 0.3, 0.11, 0, 0, 0, Math.PI / 2));
    return legen(g, x, z, ry);
  }
  // ---------- Kleinteile: Töpfe, Pfannen, Grillroste, rostiges Werkzeug ----------
  function topf() {
    const g = new THREE.Group(), R = 0.11 + r() * 0.06, H = 0.1 + r() * 0.08, f = r() < 0.5 ? 0x9a9da2 : rost();
    g.add(setze(teil(new THREE.CylinderGeometry(R, R * 0.95, H, 16, 1, true), f, { mat: { side: THREE.DoubleSide }, umriss: 0.002 }), 0, H / 2, 0));
    g.add(setze(zylinder(R * 0.95, R * 0.95, 0.008, f, { umriss: false }, 16), 0, 0.004, 0));
    for (const s of [-1, 1]) g.add(setze(teil(new THREE.TorusGeometry(0.025, 0.006, 4, 8, Math.PI), 0x3a3a3c, { umriss: false }), s * (R + 0.01), H - 0.02, 0, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0));
    return g;
  }
  function pfanne() {
    const g = new THREE.Group(), R = 0.12 + r() * 0.05;
    g.add(setze(teil(new THREE.CylinderGeometry(R, R * 0.85, 0.045, 16, 1, true), 0x2a2a2c, { mat: { side: THREE.DoubleSide }, umriss: 0.002 }), 0, 0.022, 0));
    g.add(setze(zylinder(R * 0.85, R * 0.85, 0.006, 0x3a3a3c, { umriss: false }, 16), 0, 0.003, 0));
    g.add(setze(quader(0.2, 0.02, 0.03, 0x1d1d1f, { umriss: 0.001 }), R + 0.09, 0.035, 0, 0, 0, 0.15));
    return g;
  }
  function grillrost() {
    const g = new THREE.Group(), f = rost(), R = 0.22 + r() * 0.1;
    g.add(setze(teil(new THREE.TorusGeometry(R, 0.008, 4, 24), f, { umriss: false }), 0, 0.01, 0, Math.PI / 2, 0, 0));
    for (let k = -4; k <= 4; k++) { const z = k * R / 5, l = 2 * Math.sqrt(Math.max(0, R * R - z * z)); g.add(setze(zylinder(0.004, 0.004, l, f, { umriss: false }, 4), 0, 0.01, z, 0, 0, Math.PI / 2)); }
    return g;
  }
  function werkzeug() {
    const g = new THREE.Group(), a = r(), f = rost();
    if (a < 0.33) { // Hammer
      g.add(setze(quader(0.28, 0.025, 0.03, 0x7a5a3a, { umriss: 0.001 }), 0, 0.015, 0));
      g.add(setze(quader(0.04, 0.035, 0.1, f, { umriss: 0.001 }), 0.14, 0.02, 0));
    } else if (a < 0.66) { // Maulschlüssel
      g.add(setze(quader(0.22, 0.01, 0.025, f, { umriss: 0.001 }), 0, 0.006, 0));
      for (const s of [-1, 1]) g.add(setze(teil(new THREE.TorusGeometry(0.022, 0.008, 4, 8, Math.PI * 1.4), f, { umriss: false }), s * 0.12, 0.006, 0, Math.PI / 2, 0, s > 0 ? 0.6 : 3.7));
    } else { // Zange
      for (const s of [-1, 1]) g.add(setze(quader(0.2, 0.01, 0.018, f, { umriss: 0.001 }), 0, 0.006 + (s > 0 ? 0.01 : 0), s * 0.015, 0, s * 0.15, 0));
      g.add(setze(zylinder(0.01, 0.01, 0.025, 0x3a3a3c, { umriss: false }, 6), 0.06, 0.012, 0));
    }
    return g;
  }
  function kleinteil() {
    const a = r();
    return a < 0.25 ? topf() : a < 0.45 ? pfanne() : a < 0.65 ? grillrost() : werkzeug();
  }
  // kaputter Betonmischer: Trommel (orange, verbeult, schief), Rahmen, ein Rad fehlt, Motorkasten offen, Handrad
  function betonmischer(x, z, ry) {
    const g = new THREE.Group(), OR = 0xd8792a;
    // Rahmen
    for (const s of [-1, 1]) g.add(setze(quader(1.2, 0.05, 0.05, 0x5a5e62, { umriss: 0.002 }), 0, 0.32, s * 0.28));
    g.add(setze(quader(0.05, 0.05, 0.6, 0x5a5e62, { umriss: 0.002 }), -0.55, 0.32, 0));
    g.add(setze(quader(0.05, 0.75, 0.05, 0x5a5e62, { umriss: 0.002 }), 0.1, 0.68, 0.28));
    g.add(setze(quader(0.05, 0.75, 0.05, 0x5a5e62, { umriss: 0.002 }), 0.1, 0.68, -0.28));
    // Rad (nur noch eins) und Stütze auf der anderen Seite
    g.add(setze(teil(new THREE.TorusGeometry(0.17, 0.06, 8, 16), 0x1d1d1f, { umriss: 0.002 }), -0.55, 0.2, 0.36));
    g.add(setze(zylinder(0.07, 0.07, 0.04, 0x9a9da2, { umriss: false }, 12), -0.55, 0.2, 0.36, Math.PI / 2, 0, 0));
    g.add(setze(quader(0.05, 0.3, 0.05, 0x5a5e62, { umriss: 0.002 }), 0.55, 0.15, 0));
    // Trommel: Bauch, Konus, Öffnung, Ring
    const tr = new THREE.Group();
    tr.add(setze(zylinder(0.36, 0.3, 0.32, OR, { umriss: 0.004 }, 18), 0, 0, 0));
    tr.add(setze(zylinder(0.22, 0.36, 0.26, OR, { umriss: 0.004 }, 18), 0, 0.29, 0));
    tr.add(setze(teil(new THREE.TorusGeometry(0.22, 0.02, 6, 18), 0xb8601e, { umriss: false }), 0, 0.42, 0, Math.PI / 2, 0, 0));
    tr.add(setze(zylinder(0.3, 0.2, 0.18, OR, { umriss: 0.004 }, 18), 0, -0.25, 0));
    tr.add(setze(teil(new THREE.TorusGeometry(0.37, 0.025, 6, 24), 0x3a3a3c, { umriss: false }), 0, 0.02, 0, Math.PI / 2, 0, 0)); // Zahnkranz
    for (let i = 0; i < 6; i++) tr.add(setze(quader(0.08 + r() * 0.1, 0.05 + r() * 0.08, 0.01, 0x8a4a2a, { umriss: false }), Math.sin(i) * 0.3, (r() - 0.5) * 0.3, Math.cos(i) * 0.3, 0, i, 0)); // Rost
    tr.add(setze(quader(0.12, 0.07, 0.02, 0xa85818, { umriss: false }), 0.33, 0.05, 0.1, 0, 0.3, 0)); // Delle
    tr.position.set(0.15, 0.95, 0); tr.rotation.z = -0.9;
    g.add(tr);
    // Motorkasten (Deckel fehlt) und Handrad
    g.add(setze(quader(0.28, 0.22, 0.24, 0x2f6b3a, { umriss: 0.003 }), -0.35, 0.47, 0));
    g.add(setze(quader(0.18, 0.12, 0.14, 0x3a3a3c, { umriss: 0.002 }), -0.35, 0.52, 0));
    g.add(setze(teil(new THREE.TorusGeometry(0.12, 0.012, 4, 14), 0x5a5e62, { umriss: false }), 0.1, 1.0, 0.36));
    g.rotation.x = 0.12; // hängt schief (Rad fehlt)
    const h = new THREE.Group(); h.add(g);
    merke(h, 'betonmischer', 'Betonmischer', null);
    return legen(h, x, z, ry);
  }
  // alter Standventilator, umgefallen: runder Fuß, Stange, Motor, Schutzgitter, drei Flügel (einer abgebrochen)
  function ventilator(x, z, ry) {
    const g = new THREE.Group(), WEISS = 0xe4e0d6;
    g.add(setze(zylinder(0.2, 0.22, 0.04, WEISS, { umriss: 0.002 }, 18), 0, 0.02, 0));
    g.add(setze(zylinder(0.015, 0.015, 1.0, 0xc0c4c8, { umriss: 0.002 }, 8), 0, 0.52, 0));
    const kopf = new THREE.Group();
    kopf.add(setze(zylinder(0.07, 0.08, 0.16, WEISS, { umriss: 0.002 }, 12), 0, 0, -0.06, Math.PI / 2, 0, 0)); // Motor
    for (const zz of [0.05, 0.13]) kopf.add(setze(teil(new THREE.TorusGeometry(0.22, 0.005, 4, 24), 0xc0c4c8, { umriss: false }), 0, 0, zz));
    for (let i = 0; i < 12; i++) kopf.add(setze(zylinder(0.0025, 0.0025, 0.22, 0xc0c4c8, { umriss: false }, 4), Math.sin(i / 12 * Math.PI * 2) * 0.11, Math.cos(i / 12 * Math.PI * 2) * 0.11, 0.13, 0, 0, -i / 12 * Math.PI * 2));
    for (let i = 0; i < 3; i++) {
      const w = i / 3 * Math.PI * 2, l = i === 2 ? 0.08 : 0.17;
      kopf.add(setze(quader(0.08, l, 0.008, 0x8fb8d0, { umriss: 0.001 }), Math.sin(w) * l / 2, Math.cos(w) * l / 2, 0.09, 0.2, 0, -w));
    }
    kopf.add(setze(quader(0.06, 0.06, 0.04, 0x3a3a3c, { umriss: false }), 0, 0.09, -0.12)); // Schalter
    kopf.position.set(0, 1.08, 0);
    g.add(kopf);
    g.add(setze(zylinder(0.004, 0.004, 0.8, 0x1d1d1f, { umriss: false }, 4), 0.1, 0.4, 0.05, 0, 0, 0.3)); // Kabel
    g.rotation.z = Math.PI / 2 - 0.15; // umgefallen
    const h = new THREE.Group(); h.add(g);
    merke(h, 'ventilator', 'Ventilator', null);
    return legen(h, x, z, ry);
  }
  // kaputtes Mofa ohne Motor: Rohrrahmen, Speichenräder, Gabel, Lenker mit Griffen und Spiegel, Tank, Sattel,
  // Schutzbleche, Seitenständer; wo der Motor war, ist ein Loch mit Kabelresten
  function mofa(x, z, ry) {
    const g = new THREE.Group(), BLAU = 0x3a6aa8;
    const rad = (px) => {
      const rr = new THREE.Group();
      rr.add(teil(new THREE.TorusGeometry(0.27, 0.045, 8, 22), 0x1d1d1f, { umriss: 0.002 }));
      rr.add(teil(new THREE.TorusGeometry(0.23, 0.01, 4, 22), 0x9a9da2, { umriss: false }));
      for (let i = 0; i < 12; i++) rr.add(setze(zylinder(0.003, 0.003, 0.46, 0xc0c4c8, { umriss: false }, 4), 0, 0, 0, 0, 0, i / 12 * Math.PI));
      rr.add(setze(zylinder(0.04, 0.04, 0.08, 0x7a7e84, { umriss: false }, 10), 0, 0, 0, Math.PI / 2, 0, 0));
      rr.position.set(px, 0.32, 0);
      g.add(rr);
    };
    rad(-0.6); rad(0.62);
    const rohr = (ax, ay, bx, by, d = 0.025, f = BLAU) => { const l = Math.hypot(bx - ax, by - ay); g.add(setze(zylinder(d, d, l, f, { umriss: 0.002 }, 8), (ax + bx) / 2, (ay + by) / 2, 0, 0, 0, -Math.atan2(bx - ax, by - ay))); };
    rohr(0.45, 0.85, -0.1, 0.38, 0.035); rohr(-0.1, 0.38, -0.55, 0.72, 0.03); rohr(-0.1, 0.38, -0.6, 0.32, 0.02, 0x7a7e84); // Rahmen, Schwinge
    for (const s of [-1, 1]) { const gb = setze(zylinder(0.016, 0.016, 0.62, 0x9a9da2, { umriss: 0.002 }, 8), 0.54, 0.6, s * 0.06, 0, 0, 0.3); g.add(gb); } // Gabel
    g.add(setze(quader(0.3, 0.12, 0.16, BLAU, { umriss: 0.003 }), 0.28, 0.82, 0)); // Tank
    g.add(setze(quader(0.36, 0.07, 0.18, 0x1d1d1f, { umriss: 0.003 }), -0.35, 0.8, 0)); // Sattel
    g.add(setze(zylinder(0.012, 0.012, 0.25, 0x3a3a3c, { umriss: false }, 6), -0.35, 0.68, 0)); // Sattelstütze
    g.add(setze(teil(new THREE.TorusGeometry(0.3, 0.02, 4, 12, Math.PI * 0.7), BLAU, { umriss: 0.002 }), 0.62, 0.32, 0, 0, 0, 0.6)); // Schutzblech vorne
    g.add(setze(teil(new THREE.TorusGeometry(0.3, 0.02, 4, 12, Math.PI * 0.6), BLAU, { umriss: 0.002 }), -0.6, 0.32, 0, 0, 0, 1.4)); // hinten
    // Lenker
    g.add(setze(zylinder(0.014, 0.014, 0.6, 0x9a9da2, { umriss: 0.002 }, 8), 0.45, 0.98, 0, Math.PI / 2, 0, 0));
    for (const s of [-1, 1]) {
      g.add(setze(zylinder(0.02, 0.02, 0.11, 0x1d1d1f, { umriss: 0.001 }, 8), 0.45, 0.98, s * 0.3, Math.PI / 2, 0, 0));
      g.add(setze(quader(0.1, 0.01, 0.02, 0x3a3a3c, { umriss: false }), 0.4, 1.0, s * 0.25, 0, -0.4 * s, 0));
    }
    g.add(setze(zylinder(0.005, 0.005, 0.18, 0x3a3a3c, { umriss: false }, 4), 0.42, 1.08, 0.2, 0, 0, 0.2)); // Spiegelstange
    g.add(setze(zylinder(0.04, 0.04, 0.01, 0x9fb8c8, { umriss: 0.001 }, 10), 0.4, 1.17, 0.2, Math.PI / 2, 0, 0)); // Spiegel
    g.add(setze(zylinder(0.06, 0.05, 0.08, 0xc0c4c8, { umriss: 0.002 }, 12), 0.62, 0.92, 0, 0, 0, Math.PI / 2)); // Scheinwerfer
    // Kabelreste, wo der Motor fehlt
    for (let i = 0; i < 3; i++) g.add(setze(zylinder(0.004, 0.004, 0.18, [0xc8382c, 0x1d1d1f, 0xd8b23a][i], { umriss: false }, 4), -0.05 + i * 0.03, 0.3, 0.03, 0.4, 0, 0.3 + i * 0.3));
    for (let i = 0; i < 4; i++) g.add(setze(quader(0.05 + r() * 0.08, 0.03, 0.005, 0x8a4a2a, { umriss: false }), 0.1 + (r() - 0.5) * 0.4, 0.75 + r() * 0.1, 0.081));
    // Seitenständer, Mofa lehnt leicht
    g.add(setze(zylinder(0.012, 0.012, 0.32, 0x3a3a3c, { umriss: false }, 6), -0.15, 0.15, -0.12, -0.5, 0, 0));
    g.rotation.x = 0.18;
    const h = new THREE.Group(); h.add(g);
    merke(h, 'mofa', 'Mofa', null);
    return legen(h, x, z, ry);
  }
  // Felgenstapel: Stahlfelgen übereinander (mit Mittelloch und Lüftungslöchern)
  function felgenStapel(x, z, n) {
    const g = new THREE.Group();
    for (let k = 0; k < n; k++) {
      const f = new THREE.Group();
      f.add(teil(new THREE.CylinderGeometry(0.29, 0.29, 0.2, 20, 1, true), r() < 0.5 ? 0x8c8f94 : 0x6a5a50, { mat: { side: THREE.DoubleSide }, umriss: 0.004 }));
      f.add(setze(teil(new THREE.TorusGeometry(0.3, 0.025, 6, 20), 0x7a7e84, { umriss: false }), 0, 0.1, 0, Math.PI / 2, 0, 0));
      f.add(setze(zylinder(0.27, 0.27, 0.02, 0x7c7f84, { umriss: 0.002 }, 20), 0, 0.02, 0));
      f.add(setze(zylinder(0.07, 0.07, 0.025, 0x2a2a2c, { umriss: false }, 12), 0, 0.025, 0));
      for (let i = 0; i < 6; i++) { const w = i / 6 * Math.PI * 2; f.add(setze(zylinder(0.035, 0.035, 0.025, 0x3a3a3c, { umriss: false }, 8), Math.cos(w) * 0.17, 0.025, Math.sin(w) * 0.17)); }
      f.position.set((r() - 0.5) * 0.06, 0.1 + k * 0.205, (r() - 0.5) * 0.06);
      f.rotation.set((r() - 0.5) * 0.06, r() * 3, (r() - 0.5) * 0.06);
      g.add(f);
    }
    return legen(g, x, z);
  }
  // kaputtes Fahrrad: Rahmen, ein Rad verbogen (Acht), Lenker schief; liegt auf der Seite oder lehnt
  function fahrrad(x, z, ry, liegt, farbe) {
    const g = new THREE.Group();
    const rad = (px, acht) => {
      const rr = new THREE.Group();
      rr.add(teil(new THREE.TorusGeometry(0.33, 0.022, 6, 26), 0x1d1d1f, { umriss: false }));
      rr.add(teil(new THREE.TorusGeometry(0.3, 0.008, 4, 26), 0xb0b4b8, { umriss: false }));
      for (let i = 0; i < 8; i++) rr.add(setze(zylinder(0.004, 0.004, 0.6, 0xc0c4c8, { umriss: false }, 4), 0, 0, 0, 0, 0, i / 8 * Math.PI));
      rr.position.set(px, 0.34, 0);
      if (acht) { rr.rotation.y = 0.35; rr.scale.set(1, 0.85, 1); }
      g.add(rr);
    };
    rad(-0.52, false); rad(0.52, true);
    const rohr = (ax, ay, bx, by, d = 0.022) => {
      const l = Math.hypot(bx - ax, by - ay);
      g.add(setze(zylinder(d, d, l, farbe, { umriss: 0.002 }, 8), (ax + bx) / 2, (ay + by) / 2, 0, 0, 0, -Math.atan2(bx - ax, by - ay)));
    };
    rohr(-0.52, 0.34, -0.05, 0.36); rohr(-0.05, 0.36, -0.15, 0.82); rohr(-0.15, 0.78, 0.38, 0.78); rohr(-0.05, 0.36, 0.38, 0.78);
    rohr(-0.52, 0.34, -0.15, 0.78, 0.015); rohr(0.38, 0.78, 0.52, 0.34, 0.018);
    g.add(setze(quader(0.24, 0.05, 0.1, 0x1d1d1f, { umriss: 0.002 }), -0.17, 0.88, 0)); // Sattel
    // Lenker: Vorbau aus dem Steuerrohr, geschwungener Lenkerbügel (etwas verdreht), Griffe, Bremshebel mit Zügen, Klingel
    {
      const lk = new THREE.Group();
      lk.add(setze(zylinder(0.016, 0.016, 0.16, 0x9a9da2, { umriss: 0.002 }, 8), 0, 0.08, 0)); // Vorbau senkrecht
      lk.add(setze(zylinder(0.014, 0.014, 0.09, 0x9a9da2, { umriss: 0.002 }, 8), -0.04, 0.16, 0, 0, 0, Math.PI / 2)); // Vorbau waagerecht
      for (const s of [-1, 1]) {
        lk.add(setze(zylinder(0.011, 0.011, 0.16, 0x9a9da2, { umriss: 0.002 }, 8), -0.08, 0.17, s * 0.08, Math.PI / 2, 0, 0)); // Mittelteil
        lk.add(setze(zylinder(0.011, 0.011, 0.18, 0x9a9da2, { umriss: 0.002 }, 8), -0.14, 0.19, s * 0.21, Math.PI / 2 - s * 0.6, 0.5 * s, 0)); // geschwungen nach hinten
        lk.add(setze(zylinder(0.017, 0.017, 0.1, 0x1d1d1f, { umriss: 0.002 }, 8), -0.21, 0.2, s * 0.29, Math.PI / 2, 0, 0)); // Griff
        lk.add(setze(quader(0.1, 0.012, 0.02, 0x3a3a3c, { umriss: 0.001 }), -0.16, 0.22, s * 0.25, 0, -0.5 * s, 0)); // Bremshebel
        lk.add(setze(zylinder(0.004, 0.004, 0.3, 0x1d1d1f, { umriss: false }, 4), -0.02, 0.07, s * 0.12, 0.5 * s, 0, 0.4)); // Bremszug
      }
      lk.add(setze(zylinder(0.022, 0.022, 0.015, 0xc0c4c8, { umriss: 0.001 }, 12), -0.12, 0.19, 0.14, 0, 0, 0)); // Klingel
      lk.position.set(0.38, 0.78, 0);
      lk.rotation.y = 0.35; // verdreht
      g.add(lk);
    }
    g.position.y = 0;
    g.rotation.set(liegt ? -Math.PI / 2 : 0.12, 0, 0);
    const h = new THREE.Group();
    h.add(g);
    if (liegt) g.position.set(0, 0, 0.5);
    return legen(h, x, z, ry);
  }
  // Satellitenschüssel: verbeulter Teller mit Arm und LNB, schräg auf den Boden gekippt
  function schuessel(x, z, ry) {
    const g = new THREE.Group();
    const teller = teil(new THREE.SphereGeometry(0.62, 22, 8, 0, Math.PI * 2, 0, 0.62), 0xd8d6d0, { mat: { side: THREE.DoubleSide }, umriss: 0.004 });
    teller.rotation.x = Math.PI; // Öffnung nach oben
    teller.position.y = 0.62;
    g.add(teller);
    g.add(setze(zylinder(0.015, 0.015, 0.6, 0x8c8f94, { umriss: 0.002 }, 6), 0, 0.3, 0.18, 0.55, 0, 0)); // Arm
    g.add(setze(quader(0.07, 0.07, 0.14, 0x3a3a3c, { umriss: 0.002 }), 0, 0.56, 0.32)); // LNB
    g.add(setze(zylinder(0.03, 0.03, 0.18, 0x7a7e84, { umriss: 0.002 }, 8), 0, 0.02, 0, Math.PI / 2, 0, 0)); // Halterung
    g.rotation.set(-1.0, 0, 0.25);
    g.position.y = 0.28;
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z, ry);
  }
  // alte Gasflaschen (grau, rot, eine liegt), mit Schutzkragen
  function gasflasche(x, z, farbe, liegt) {
    const g = new THREE.Group();
    g.add(setze(zylinder(0.15, 0.15, 0.62, farbe, { umriss: 0.004 }, 16), 0, 0.31, 0));
    g.add(setze(teil(new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), farbe, { umriss: 0.004 }), 0, 0.62, 0));
    g.add(setze(zylinder(0.09, 0.09, 0.14, farbe, { mat: { side: THREE.DoubleSide }, umriss: 0.003 }, 12), 0, 0.82, 0));
    g.add(setze(zylinder(0.025, 0.025, 0.08, 0xb79a3c, { umriss: 0.002 }, 8), 0, 0.8, 0));
    g.add(setze(zylinder(0.155, 0.155, 0.06, 0x3a3a3c, { umriss: 0.003 }, 16), 0, 0.03, 0));
    if (liegt) { g.rotation.z = Math.PI / 2; g.position.y = 0.15; }
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z);
  }
  // rostiges Ölfass
  function fass(x, z, liegt) {
    const g = new THREE.Group();
    g.add(setze(zylinder(0.29, 0.29, 0.88, 0x7a3e22, { umriss: 0.004 }, 18), 0, 0, 0));
    for (const y of [-0.15, 0.15]) g.add(setze(teil(new THREE.TorusGeometry(0.295, 0.012, 4, 22), 0x5a3018, { umriss: false }), 0, y, 0, Math.PI / 2, 0, 0));
    if (liegt) { g.rotation.z = Math.PI / 2; g.position.y = 0.29; } else g.position.y = 0.44;
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z);
  }
  // alter Heizkörper (Rippen), an den Schrott gelehnt
  function heizkoerper(x, z, ry) {
    const g = new THREE.Group();
    for (let i = 0; i < 12; i++) g.add(setze(quader(0.06, 0.6, 0.1, 0xd8d2c4, { umriss: 0.002 }), -0.36 + i * 0.065, 0.35, 0));
    g.add(setze(zylinder(0.025, 0.025, 0.82, 0xc8c2b4, { umriss: 0.002 }, 8), 0, 0.08, 0, 0, 0, Math.PI / 2));
    g.add(setze(zylinder(0.025, 0.025, 0.82, 0xc8c2b4, { umriss: 0.002 }, 8), 0, 0.62, 0, 0, 0, Math.PI / 2));
    g.rotation.x = -0.3;
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z, ry);
  }
  // alte Waschmaschine ohne Tür
  function waschmaschine(x, z, ry) {
    const g = new THREE.Group();
    g.add(setze(quader(0.6, 0.85, 0.6, 0xe4e0d6, { umriss: 0.004 }), 0, 0.425, 0));
    g.add(setze(zylinder(0.2, 0.2, 0.02, 0x2a2a2c, { umriss: false }, 20), 0, 0.42, 0.301, Math.PI / 2, 0, 0));
    g.add(setze(quader(0.6, 0.1, 0.02, 0xc8c2b4, { umriss: 0.002 }), 0, 0.78, 0.305));
    for (let i = 0; i < 5; i++) { g.add(setze(quader(0.04 + r() * 0.06, 0.03 + r() * 0.05, 0.005, 0x8a4a2a, { umriss: false }), (r() - 0.5) * 0.5, 0.1 + r() * 0.7, 0.304)); }
    g.rotation.z = 0.06;
    return legen(g, x, z, ry);
  }

  // einzelne Stahlfelge (für die Felgen-Gitterbox): Felgenbett, Hörner, Schüssel mit Lüftungslöchern, Mittelloch, Rost
  function felge(farbe, rostig) {
    const f = new THREE.Group();
    f.add(teil(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 22, 1, true), farbe, { mat: { side: THREE.DoubleSide }, umriss: 0.003 }));
    for (const y of [-0.09, 0.09]) f.add(setze(teil(new THREE.TorusGeometry(0.275, 0.018, 6, 22), farbe, { umriss: false }), 0, y, 0, Math.PI / 2, 0, 0));
    f.add(setze(zylinder(0.24, 0.24, 0.015, farbe, { umriss: 0.002 }, 22), 0, 0.03, 0));
    f.add(setze(zylinder(0.06, 0.06, 0.02, 0x3a3a3c, { umriss: false }, 12), 0, 0.035, 0));
    for (let i = 0; i < 5; i++) { const w = i / 5 * Math.PI * 2; f.add(setze(zylinder(0.012, 0.012, 0.02, 0x8c8f94, { umriss: false }, 6), Math.cos(w) * 0.09, 0.04, Math.sin(w) * 0.09)); }
    for (let i = 0; i < 6; i++) { const w = i / 6 * Math.PI * 2 + 0.3; f.add(setze(quader(0.07, 0.02, 0.035, 0x0a0a0a, { umriss: false }), Math.cos(w) * 0.17, 0.035, Math.sin(w) * 0.17, 0, -w, 0)); }
    if (rostig) for (let i = 0; i < 9; i++) {
      const w = r() * Math.PI * 2;
      f.add(setze(quader(0.04 + r() * 0.07, 0.03 + r() * 0.05, 0.005, ROST[Math.floor(r() * 3)], { umriss: false }), Math.cos(w) * 0.262, (r() - 0.5) * 0.14, Math.sin(w) * 0.262, 0, -w + Math.PI / 2, 0));
    }
    return f;
  }
  // Gitterbox (Stahl-Gitterkiste wie im Lager), randvoll mit Kleinteilen: Schrauben, Muttern, Federn, Lager, Winkel
  const gitterTex = leinwandTextur(128, 128, (g, b, h) => {
    g.clearRect(0, 0, b, h);
    g.strokeStyle = '#8c8f94'; g.lineWidth = 3;
    for (let x = 2; x < b; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 2; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
  });
  gitterTex.wrapS = gitterTex.wrapT = THREE.RepeatWrapping;
  function gitterbox(x, z, ry, oben = 0, inhalt = 'kleinteile') {
    const g = new THREE.Group();
    const GB = 1.24, GT = 0.835, GH = 0.97, FUSS = 0.12;
    const wand = (w, h, px, pz, wry) => {
      const t = gitterTex.clone(); t.needsUpdate = true; t.repeat.set(w / 0.5, h / 0.5);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon(0xffffff, { map: t, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
      m.position.set(px, FUSS + h / 2, pz); m.rotation.y = wry; g.add(m);
    };
    wand(GB, GH - FUSS, 0, GT / 2, 0); wand(GB, GH - FUSS, 0, -GT / 2, 0);
    wand(GT, GH - FUSS, GB / 2, 0, Math.PI / 2); wand(GT, GH - FUSS, -GB / 2, 0, Math.PI / 2);
    const STAHL_G = 0x6e7276;
    // Rahmen: Bodenwanne, Eckpfosten, oberer Rahmen, Füße
    g.add(setze(quader(GB, 0.05, GT, 0x5a5e62, { umriss: 0.002 }), 0, FUSS + 0.025, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      g.add(setze(quader(0.04, GH - FUSS, 0.04, STAHL_G, { umriss: 0.002 }), sx * GB / 2, FUSS + (GH - FUSS) / 2, sz * GT / 2));
      g.add(setze(quader(0.1, FUSS, 0.1, STAHL_G, { umriss: 0.002 }), sx * (GB / 2 - 0.05), FUSS / 2, sz * (GT / 2 - 0.05)));
    }
    for (const sz of [-1, 1]) g.add(setze(quader(GB, 0.035, 0.035, STAHL_G, { umriss: 0.002 }), 0, GH, sz * GT / 2));
    for (const sx of [-1, 1]) g.add(setze(quader(0.035, 0.035, GT, STAHL_G, { umriss: 0.002 }), sx * GB / 2, GH, 0));
    // Klappe vorne (halbhoch, etwas dunkler) und gelbes Schild
    g.add(setze(quader(0.3, 0.16, 0.01, 0xd8b23a, { umriss: 0.002 }), 0.3, GH - 0.2, GT / 2 + 0.01));
    if (inhalt === 'felgen') {
      // nur Stahlfelgen (schwarz, Rost), chaotisch reingeworfen: schief, verkantet, übereinander
      for (let i = 0; i < 7; i++) {
        const f = felge(0x1d1d1f, true);
        const lage = Math.floor(i / 3);
        f.position.set((r() - 0.5) * (GB - 0.65), FUSS + 0.08 + lage * 0.2 + r() * 0.08, (r() - 0.5) * (GT - 0.65));
        f.rotation.set((r() - 0.5) * 1.6, r() * 6, (r() - 0.5) * 1.6);
        g.add(f);
      }
    } else {
      // Kleinteile-Masse (durchs Gitter sichtbar) und obendrauf einzelne Teile: Schrauben mit Sechskantkopf, Muttern,
      // Unterlegscheiben, Federn, Kugellager, Zahnräder, Winkel, Bleche, Scharniere, Ketten
      const fuellTex = leinwandTextur(256, 256, (cg, b, h) => {
        cg.fillStyle = '#3e342e'; cg.fillRect(0, 0, b, h);
        const farben = ['#8a4a2a', '#7c7670', '#9a9da2', '#6e5a4a', '#b79a3c', '#2a2622', '#c0c4c8'];
        for (let i = 0; i < 1400; i++) {
          cg.fillStyle = farben[Math.floor(r() * farben.length)];
          const x = r() * b, y = r() * h, t = r();
          if (t < 0.35) { cg.beginPath(); cg.arc(x, y, 2 + r() * 3, 0, Math.PI * 2); cg.fill(); cg.fillStyle = '#2a2622'; cg.beginPath(); cg.arc(x, y, 1, 0, Math.PI * 2); cg.fill(); }
          else if (t < 0.7) { cg.save(); cg.translate(x, y); cg.rotate(r() * 3); cg.fillRect(-1, -5, 2.5, 10); cg.fillRect(-2.5, -6, 5, 2); cg.restore(); }
          else cg.fillRect(x, y, 2 + r() * 6, 2 + r() * 4);
        }
      });
      const fuell = new THREE.Mesh(new THREE.BoxGeometry(GB - 0.08, GH - FUSS - 0.12, GT - 0.08), toon(0xffffff, { map: fuellTex }));
      fuell.position.y = FUSS + 0.05 + (GH - FUSS - 0.12) / 2; g.add(fuell);
      const teile = [0x8a4a2a, 0x7c7670, 0x9a9da2, 0x6e5a4a, 0xb79a3c, 0xc0c4c8];
      for (let i = 0; i < 110; i++) {
        const art = r(), f = teile[Math.floor(r() * teile.length)];
        let m;
        if (art < 0.22) { // Schraube mit Sechskantkopf
          m = new THREE.Group();
          const l = 0.06 + r() * 0.1;
          m.add(setze(zylinder(0.008, 0.008, l, f, { umriss: false }, 6), 0, l / 2, 0));
          m.add(setze(zylinder(0.017, 0.017, 0.012, f, { umriss: false }, 6), 0, l, 0));
        } else if (art < 0.36) m = zylinder(0.02, 0.02, 0.014, f, { umriss: false }, 6); // Mutter
        else if (art < 0.46) m = teil(new THREE.TorusGeometry(0.018, 0.006, 4, 10), f, { umriss: false }); // Scheibe
        else if (art < 0.54) { // Feder: gestapelte Windungen
          m = new THREE.Group();
          for (let k = 0; k < 6; k++) m.add(setze(teil(new THREE.TorusGeometry(0.018, 0.0035, 4, 10), f, { umriss: false }), 0, k * 0.01, 0, Math.PI / 2 + 0.15, 0, 0));
        } else if (art < 0.62) { // Kugellager
          m = new THREE.Group();
          m.add(teil(new THREE.TorusGeometry(0.04, 0.01, 6, 14), 0xc0c4c8, { umriss: false }));
          m.add(teil(new THREE.TorusGeometry(0.022, 0.007, 6, 12), 0x9a9da2, { umriss: false }));
        } else if (art < 0.7) { // Zahnrad
          m = new THREE.Group();
          const R = 0.035 + r() * 0.03;
          m.add(zylinder(R, R, 0.015, f, { umriss: false }, 14));
          for (let k = 0; k < 10; k++) m.add(setze(quader(0.012, 0.015, 0.012, f, { umriss: false }), Math.cos(k / 10 * 6.28) * (R + 0.005), 0, Math.sin(k / 10 * 6.28) * (R + 0.005), 0, -k / 10 * 6.28, 0));
        } else if (art < 0.8) { // Winkel
          m = new THREE.Group();
          m.add(quader(0.07, 0.004, 0.02, f, { umriss: false }));
          m.add(setze(quader(0.004, 0.05, 0.02, f, { umriss: false }), -0.035, 0.025, 0));
        } else if (art < 0.88) m = quader(0.05 + r() * 0.1, 0.006, 0.03 + r() * 0.06, f, { umriss: false }); // Blechstück
        else if (art < 0.94) { // Scharnier
          m = new THREE.Group();
          for (const sx of [-1, 1]) m.add(setze(quader(0.035, 0.003, 0.05, f, { umriss: false }), sx * 0.02, 0, 0, 0, 0, sx * 0.3));
          m.add(setze(zylinder(0.005, 0.005, 0.05, f, { umriss: false }, 6), 0, 0.004, 0, Math.PI / 2, 0, 0));
        } else { // Kettenstück
          m = new THREE.Group();
          for (let k = 0; k < 5; k++) m.add(setze(teil(new THREE.TorusGeometry(0.014, 0.004, 4, 8), 0x7c7670, { umriss: false }), k * 0.022, 0, 0, k % 2 ? Math.PI / 2 : 0, 0, 0));
        }
        const rx = (r() - 0.5) * (GB - 0.15), rz = (r() - 0.5) * (GT - 0.15);
        m.position.set(rx, GH - 0.09 + r() * 0.05 + (1 - Math.hypot(rx / GB, rz / GT) * 2) * 0.05, rz);
        m.rotation.set(r() * 3, r() * 3, r() * 3);
        g.add(m);
      }
    }
    g.position.y = oben;
    const h = new THREE.Group();
    h.add(g);
    merke(h, 'gitterbox', 'Gitterbox', null);
    return legen(h, x, z, ry);
  }

  // Haufen und Teile im Schrottplatz (der Gang bei x -3,5 … -2,3 bleibt frei): dicht an dicht, gehäuft
  altmetall(-8.0, -7.9, 2.2, 2.0, 70, 1.4);
  altmetall(-6.3, -6.7, 1.1, 1.1, 34, 0.9);
  altmetall(-10.0, -5.6, 1.1, 0.9, 24, 0.7);
  felgenStapel(-10.6, -9.9, 6); felgenStapel(-10.05, -10.0, 4); felgenStapel(-4.25, -4.95, 5);
  reifenStapel(-10.9, -8.6, 5); reifenStapel(-10.85, -7.9, 3); reifenStapel(-6.9, -4.95, 4); reifenStapel(-10.6, -4.9, 2, true);
  fahrrad(-10.85, -6.2, 0.1, true, 0x2f5fa8);
  fahrrad(-10.8, -9.3, 0.2, true, 0xc8382c);
  fahrrad(-4.2, -7.4, Math.PI / 2, false, 0x2f6b3a);
  schuessel(-8.2, -5.2, 0.8);
  gasflasche(-4.3, -9.0, 0x8c8f94, false); gasflasche(-4.7, -9.3, 0xc8382c, false); gasflasche(-4.3, -9.6, 0x8c8f94, true);
  gasflasche(-6.3, -4.85, 0x8c8f94, false); gasflasche(-9.5, -10.1, 0x6a8a5a, true);
  heizkoerper(-8.6, -4.85, 0.1);
  waschmaschine(-9.0, -10.1, 0.3);
  autotuer(-4.3, -8.2, Math.PI / 2, 0x3a6aa8); autotuer(-7.6, -5.0, 0.1, 0xc8382c);
  motorblock(-5.1, -9.2, 0.6);
  badewanne(-9.9, -7.6, 1.5);
  motorhaube(-8.9, -9.3, 2.9, 0x2f6b3a);
  auspuff(-7.4, -5.2, 0.2);
  // Betonmischer, Ventilator, Mofa und lose Kleinteile (Töpfe, Pfannen, Grillroste, Werkzeug) am Rand zum Gang
  betonmischer(-7.0, -8.9, 0.1);
  ventilator(-9.9, -5.0, 0.2);
  mofa(-4.7, -5.95, 0.05);
  for (const [x, z] of [[-3.95, -6.6], [-4.0, -8.9], [-4.05, -9.9], [-6.6, -10.3], [-8.2, -10.35], [-10.9, -7.4], [-9.4, -5.6], [-5.6, -10.3]]) {
    const k = kleinteil();
    legen(k, x, z);
  }
  // kleine Bleche, Nummernschild, kleiner Schraubenhaufen
  function blechle(x, z) {
    const m = quader(0.15 + r() * 0.3, 0.006, 0.1 + r() * 0.25, rost(), { umriss: 0.002 });
    m.position.y = 0.014; m.rotation.set((r() - 0.5) * 0.1, 0, (r() - 0.5) * 0.1);
    const h = new THREE.Group(); h.add(m);
    return legen(h, x, z);
  }
  for (const [x, z] of [[-3.9, -5.3], [-4.0, -7.8], [-6.1, -10.35], [-8.9, -10.4], [-10.9, -5.6], [-11.0, -8.0], [-7.6, -4.7], [-3.95, -9.5], [0.0, -8.4], [-1.7, -8.5]]) blechle(x, z);
  {
    const tex = leinwandTextur(260, 56, (g, b, h) => {
      g.fillStyle = '#f2f0e8'; g.fillRect(0, 0, b, h);
      g.strokeStyle = '#1d1d1f'; g.lineWidth = 3; g.strokeRect(2, 2, b - 4, h - 4);
      g.fillStyle = '#2a4aa8'; g.fillRect(3, 3, 22, h - 6);
      g.fillStyle = '#1d1d1f'; g.font = 'bold 34px Arial, sans-serif'; g.fillText('DE-NN 77', 34, 41);
      for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(120,70,40,0.45)'; g.fillRect(r() * b, r() * h, 3 + r() * 10, 2 + r() * 6); }
    });
    const schild = new THREE.Group();
    schild.add(quader(0.52, 0.003, 0.11, 0xd8d4c8, { umriss: 0.001 }));
    const vorn = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.105), toon(0xffffff, { map: tex }));
    vorn.rotation.x = -Math.PI / 2; vorn.position.y = 0.002;
    schild.add(vorn);
    schild.position.y = 0.016; schild.rotation.z = 0.08;
    const h = new THREE.Group(); h.add(schild);
    legen(h, -7.25, -10.38, 0.05);
  }
  {
    // kleiner Haufen Schrauben, Muttern und Scheiben am Rand zum Gang
    const g = new THREE.Group();
    for (let i = 0; i < 60; i++) {
      const w = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.22, f = [0x9a9da2, 0x7c7670, 0x8a4a2a, 0xb79a3c][Math.floor(r() * 4)];
      let m;
      if (r() < 0.6) { m = new THREE.Group(); const l = 0.05 + r() * 0.06; m.add(setze(zylinder(0.006, 0.006, l, f, { umriss: false }, 6), 0, l / 2, 0)); m.add(setze(zylinder(0.012, 0.012, 0.008, f, { umriss: false }, 6), 0, l, 0)); }
      else m = zylinder(0.013, 0.013, 0.01, f, { umriss: false }, 6);
      m.position.set(Math.cos(w) * d, 0.01 + (0.22 - d) * 0.35 * r(), Math.sin(w) * d);
      m.rotation.set(Math.PI / 2 + (r() - 0.5), r() * 6, (r() - 0.5));
      g.add(m);
    }
    g.position.set(-3.95, 0, -8.55);
    gruppe.add(g);
    merke(g, 'schrauben', 'Schraubenhaufen', null);
  }
  // Gitterkisten voller Kleinteile (eine steht auf einer anderen)
  gitterbox(-6.0, -9.85, 0.05); gitterbox(-7.6, -9.9, -0.04); gitterbox(-6.0, -9.85, 0.05, 0.97);
  gitterbox(-5.3, -4.95, 0.0, 0, 'felgen');
  // hinter dem Container (zwischen Container und Carport), mit Abstand zur offenen Containerseite
  altmetall(0.3, -9.5, 1.9, 0.75, 28, 0.7);
  reifenStapel(2.3, -9.9, 4); felgenStapel(-1.6, -9.9, 4); gasflasche(-1.6, -9.0, 0x8c8f94, false);
  gitterbox(1.2, -9.95, 0.03);
  for (const k of SCHROTT_KAESTEN) hindernis(k.xMin, k.xMax, k.zMin, k.zMax);

  // ---------- Blauer Container mit Metalllängen ----------
  {
    const K = CONTAINER, B = K.xMax - K.xMin, T = K.zMax - K.zMin, H = K.hoehe;
    const BLAU = 0x2f5f9a, BLAU_D = 0x244a78;
    const c = new THREE.Group();
    c.position.set((K.xMin + K.xMax) / 2, 0, (K.zMin + K.zMax) / 2);
    gruppe.add(c);
    // Trapezblech: senkrechte Sicken als Textur
    const sickenTex = leinwandTextur(256, 64, (g, b, h) => {
      g.fillStyle = '#2f5f9a'; g.fillRect(0, 0, b, h);
      for (let x = 0; x < b; x += 16) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x, 0, 5, h); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 8, 0, 3, h); }
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${120 + r() * 60},${60 + r() * 30},30,${0.25 + r() * 0.3})`; g.fillRect(r() * b, r() * h, 2 + r() * 6, 1 + r() * 5); }
    });
    sickenTex.wrapS = sickenTex.wrapT = THREE.RepeatWrapping;
    const blech = (b, h, rep) => { const t = sickenTex.clone(); t.needsUpdate = true; t.repeat.set(rep, 1); return toon(0xffffff, { map: t, side: THREE.DoubleSide }); };
    // Rückwand (an der Werkstatt), Stirnwände, Dach, Boden
    const wand = (w, h, x, y, z, ry, rep) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), blech(w, h, rep)); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; c.add(m); };
    wand(B - 0.1, H - 0.2, 0, H / 2, T / 2 - 0.03, 0, 10);
    for (const sx of [-1, 1]) wand(T - 0.1, H - 0.2, sx * (B / 2 - 0.03), H / 2, 0, Math.PI / 2, 4);
    c.add(setze(quader(B, 0.06, T, BLAU_D, { umriss: 0.003 }), 0, H - 0.03, 0)); // Dach
    c.add(setze(quader(B - 0.1, 0.03, T - 0.1, 0x7a5a3a, { umriss: false }), 0, 0.15, 0)); // Holzboden
    // Rahmen: Eckpfosten, Ober- und Untergurt an der offenen Seite und hinten
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.add(setze(quader(0.16, H, 0.16, BLAU_D, { umriss: 0.003 }), sx * (B / 2 - 0.08), H / 2, sz * (T / 2 - 0.08)));
    for (const sz of [-1, 1]) for (const y of [0.07, H - 0.1]) c.add(setze(quader(B, 0.14, 0.12, BLAU_D, { umriss: 0.003 }), 0, y, sz * (T / 2 - 0.06)));
    for (const sx of [-1, 1]) for (const y of [0.07, H - 0.1]) c.add(setze(quader(0.12, 0.14, T, BLAU_D, { umriss: 0.003 }), sx * (B / 2 - 0.06), y, 0));
    // Eckbeschläge (grau)
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [0.08, H - 0.08]) c.add(setze(quader(0.18, 0.12, 0.18, 0x8c8f94, { umriss: 0.002 }), sx * (B / 2 - 0.09), y, sz * (T / 2 - 0.09)));
    // Kanthölzer quer als Auflage, darauf Metalllängen (5,85 m: passen gerade so rein)
    const LANG = 5.85;
    for (const x of [-2.3, -0.8, 0.8, 2.3]) c.add(setze(quader(0.1, 0.1, T - 0.4, 0x8a6440, { umriss: 0.002 }), x, 0.22, 0));
    const STAHL = [0x6e6a64, 0x5e5a56, 0x7c7670, 0x8a5a3a];
    let y0 = 0.27;
    // Lage 1: Doppel-T-Träger
    for (let i = 0; i < 4; i++) {
      const z = -T / 2 + 0.45 + i * 0.32, f = STAHL[i % 4];
      const tr = new THREE.Group();
      tr.add(setze(quader(LANG, 0.012, 0.12, f, { umriss: 0.002 }), 0, 0.006, 0));
      tr.add(setze(quader(LANG, 0.012, 0.12, f, { umriss: 0.002 }), 0, 0.154, 0));
      tr.add(setze(quader(LANG, 0.14, 0.008, f, { umriss: false }), 0, 0.08, 0));
      tr.position.set((r() - 0.5) * 0.04, y0, z);
      c.add(tr);
    }
    y0 += 0.17;
    // Lage 2: Vierkantrohre
    for (let i = 0; i < 9; i++) c.add(setze(quader(LANG, 0.08, 0.08, STAHL[(i + 1) % 4], { umriss: 0.002 }), (r() - 0.5) * 0.03, y0 + 0.04, -T / 2 + 0.4 + i * 0.16));
    y0 += 0.09;
    // Lage 3: Rundrohre
    for (let i = 0; i < 12; i++) c.add(setze(zylinder(0.045, 0.045, LANG, STAHL[(i + 2) % 4], { umriss: 0.002 }, 10), (r() - 0.5) * 0.03, y0 + 0.045, -T / 2 + 0.38 + i * 0.12, 0, 0, Math.PI / 2));
    y0 += 0.1;
    // Lage 4: Flachstahl und Winkel, nicht ganz so ordentlich
    for (let i = 0; i < 10; i++) c.add(setze(quader(LANG - r() * 0.8, 0.012, 0.06, STAHL[i % 4], { umriss: 0.001 }), (r() - 0.5) * 0.4, y0 + 0.01 + i * 0.012, -T / 2 + 0.5 + r() * (T - 1.0), 0, (r() - 0.5) * 0.04, 0));
    merke(c, 'container', 'Container', null);
    hindernis(K.xMin, K.xMax, K.zMin, K.zMax);
  }

  return { gruppe, CARPORT, BUCHTEN, HINTERTUER, SCHROTT_KAESTEN, CARPORT_PFOSTEN };
}
