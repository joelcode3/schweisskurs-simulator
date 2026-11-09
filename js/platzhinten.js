// Platz hinter der Werkstatt (Paket E2a): Schotterfläche (organischer Rand), Weg vom alten Hoflader-Platz nach hinten,
// Schrottplatz direkt hinterm Haus mit schmalem Gang von der Hintertür (grüne Tür an der Rückwand) bis vorne ans Carport,
// dahinter das Carport mit drei beschrifteten Buchten (Paletten, Pritsche, Weidemann). Blauer Container an der Rückwand.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall, umriss as umrissLinie } from './toon.js';

// Hintertür in der Rückwand (z = -4): Öffnung x -3,45 … -2,35, 2,15 m hoch (dort hing früher der Hula-Hoop-Reifen)
export const HINTERTUER = { x0: -3.45, x1: -2.35, hoehe: 2.15, mitte: -2.9 };
// Schotterfläche (Welt x, z): Umriss mit organischen Rändern; fest = gerade Kante (an der Hauswand und an der Betonplatte).
// Läuft rechts am Haus entlang (dort parkte früher der Hoflader) bis an die Betonplatte vorne, hinterm Haus über
// Schrottplatz und Carport; links neben dem Carport (Welt -x) kein Schotter.
export const SCHOTTER_UMRISS = [
  [5.25, -4.12, true], [5.25, 4.0, true], [7.5, 4.0], [8.8, 2.6], [9.5, 0.2], [9.7, -3.5], [9.9, -8.5], [9.0, -13.0],
  [7.2, -17.0], [5.2, -21.0], [3.0, -23.2], [0.0, -23.5], [-3.5, -23.0], [-6.5, -22.5], [-6.7, -17.5], [-6.6, -12.2],
  [-8.8, -11.6], [-11.8, -11.4], [-13.0, -8.5], [-12.9, -5.8], [-12.2, -4.3], [-5.2, -4.12, true],
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
  { xMin: -12.2, xMax: -3.75, zMin: -10.7, zMax: -4.5 },
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
  for (const i of [0]) cp.add(setze(quader(1.6, 0.12, 0.14, 0x7a5a3a, { umriss: 0.003 }), -L / 2 + BB * (i + 0.5), 0.07, -D / 2 + 0.55));
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
  // Verlängerungskabel: lose in Schlaufen auf dem Boden, Schutzkontaktstecker an einem Ende, Kupplung mit Klappdeckel am
  // anderen (vorne in der Paletten-Bucht)
  {
    const g = new THREE.Group();
    const pkt = [[-1.1, 0.2], [-0.6, 0.45], [-0.1, 0.2], [0.1, -0.3], [-0.2, -0.6], [-0.6, -0.4], [-0.4, 0.0], [0.2, 0.1], [0.7, -0.1], [0.9, -0.5], [0.6, -0.75], [0.3, -0.5], [0.6, -0.2], [1.2, 0.1]];
    const kurve = new THREE.CatmullRomCurve3(pkt.map(([x, z], i) => new THREE.Vector3(x, 0.022 + (i === 7 || i === 12 ? 0.012 : 0), z)), false, 'centripetal');
    const kabel = new THREE.Mesh(new THREE.TubeGeometry(kurve, 220, 0.009, 6, false), toon(0x1d1d1f));
    kabel.castShadow = true;
    g.add(kabel);
    // Stecker
    const a0 = kurve.getPointAt(0), t0 = kurve.getTangentAt(0);
    const st = new THREE.Group();
    st.add(setze(zylinder(0.022, 0.016, 0.06, 0x1d1d1f, { umriss: 0.002 }, 12), 0, 0, -0.03, Math.PI / 2, 0, 0));
    st.add(setze(zylinder(0.03, 0.03, 0.02, 0x1d1d1f, { umriss: 0.002 }, 14), 0, 0, -0.07, Math.PI / 2, 0, 0));
    for (const sx of [-1, 1]) st.add(setze(zylinder(0.003, 0.003, 0.02, 0xc0c4c8, { umriss: false }, 6), sx * 0.01, 0, -0.09, Math.PI / 2, 0, 0));
    st.position.copy(a0); st.rotation.y = Math.atan2(t0.x, t0.z);
    g.add(st);
    // Kupplung
    const a1 = kurve.getPointAt(1), t1 = kurve.getTangentAt(1);
    const ku = new THREE.Group();
    ku.add(setze(zylinder(0.02, 0.03, 0.07, 0x1d1d1f, { umriss: 0.002 }, 12), 0, 0, 0.035, Math.PI / 2, 0, 0));
    ku.add(setze(zylinder(0.036, 0.036, 0.04, 0x1d1d1f, { umriss: 0.002 }, 14), 0, 0, 0.09, Math.PI / 2, 0, 0));
    ku.add(setze(zylinder(0.034, 0.034, 0.006, 0x3a3a3c, { umriss: false }, 14), 0, 0.02, 0.12, 0.6, 0, 0)); // Klappdeckel
    ku.position.copy(a1); ku.rotation.y = Math.atan2(t1.x, t1.z);
    g.add(ku);
    g.position.set(-L / 2 + 2.4, 0, D / 2 - 0.7);
    cp.add(g);
  }

  // ---------- Schrottplatz ----------
  const ROST = [0x8a4a2a, 0x7a3e22, 0x9a5a34, 0x6e5a4a, 0x5a4a40];
  const rost = () => ROST[Math.floor(r() * ROST.length)];
  // ---------- Belegung: keine Durchdringungen auf dem Schrottplatz ----------
  // Jedes Teil bekommt einen Kasten (Grundriss als gedrehtes Rechteck, dazu Höhe von–bis). Große Teile suchen sich einen
  // freien Platz am Boden; Teile in Haufen und Gitterboxen werden von unten nach oben aufgeschichtet: sie legen sich oben auf
  // das, was unter ihrem Grundriss schon liegt (nie hinein).
  function belegung() { return []; }
  const achsen = (yaw) => [[Math.cos(yaw), -Math.sin(yaw)], [Math.sin(yaw), Math.cos(yaw)]];
  function ueberlapp(a, b, rand = 0.005) {
    const ua = achsen(a.yaw), ub = achsen(b.yaw), dx = b.cx - a.cx, dz = b.cz - a.cz;
    for (const n of [...ua, ...ub]) {
      const ra = a.hx * Math.abs(ua[0][0] * n[0] + ua[0][1] * n[1]) + a.hz * Math.abs(ua[1][0] * n[0] + ua[1][1] * n[1]);
      const rb = b.hx * Math.abs(ub[0][0] * n[0] + ub[0][1] * n[1]) + b.hz * Math.abs(ub[1][0] * n[0] + ub[1][1] * n[1]);
      if (Math.abs(dx * n[0] + dz * n[1]) >= ra + rb + rand) return false;
    }
    return true;
  }
  const _box = new THREE.Box3();
  // Maße eines Objekts ohne Gier (lokal): Mitte und halbe Kanten
  function masse(obj) {
    const py = obj.position.clone(), ry = obj.rotation.y, eltern = obj.parent;
    if (eltern) eltern.remove(obj);
    obj.position.set(0, 0, 0); obj.rotation.y = 0; obj.updateMatrixWorld(true);
    _box.setFromObject(obj);
    obj.position.copy(py); obj.rotation.y = ry;
    if (eltern) eltern.add(obj);
    return { cx: (_box.min.x + _box.max.x) / 2, cz: (_box.min.z + _box.max.z) / 2, hx: (_box.max.x - _box.min.x) / 2, hz: (_box.max.z - _box.min.z) / 2, y0: _box.min.y, y1: _box.max.y };
  }
  // sf: Prüfkasten verkleinert (nicht ganz streng: Teile dürfen sich etwas ineinanderschieben, in Lücken legen)
  const eintrag = (m, x, z, yaw, sf = 1) => {
    const c = Math.cos(yaw), s = Math.sin(yaw);
    return { cx: x + m.cx * c + m.cz * s, cz: z - m.cx * s + m.cz * c, hx: m.hx * sf, hz: m.hz * sf, yaw };
  };
  // Legt obj an (x, z) mit Gier yaw. opt.suche: freien Platz am Boden suchen (Spirale); opt.stapel: oben auf Vorhandenes;
  // opt.drin(e): Grundriss erlaubt?; opt.maxY: höchste erlaubte Oberkante; opt.boden: Bodenhöhe. Gibt false zurück, wenn
  // kein Platz war (dann wird das Teil weggelassen).
  function platziere(reg, eltern, obj, x, z, yaw, opt = {}) {
    const m = masse(obj), boden = opt.boden ?? 0;
    const versuche = [];
    if (opt.suche) { for (let rr = 0; rr <= 2.4; rr += 0.12) for (let k = 0; k < (rr ? 14 : 1); k++) { const w = k / 14 * Math.PI * 2 + rr; versuche.push([x + Math.cos(w) * rr, z + Math.sin(w) * rr]); } }
    else versuche.push([x, z]);
    for (const [px, pz] of versuche) {
      const e = eintrag(m, px, pz, yaw, opt.sf ?? 1), voll = eintrag(m, px, pz, yaw);
      if (opt.drin && !opt.drin(voll)) continue;
      let y = boden;
      let frei = true;
      for (const o of reg) {
        // gegen große, feste Teile (Kicker, Mofa, Mischer …) zählt der volle Grundriss, und nichts sinkt in sie ein
        if (!ueberlapp(e, o)) continue;
        if (!opt.stapel || (o.hart && opt.nichtAufHart)) { frei = false; break; }
        y = Math.max(y, o.hart ? o.y1 : o.y1 - (opt.einsinken ?? 0) * (o.y1 - o.y0));
      }
      if (!frei) continue;
      const hoehe = m.y1 - m.y0;
      if (opt.maxY !== undefined && y + hoehe > opt.maxY) continue;
      obj.position.set(px, y - m.y0 + 0.003, pz); obj.rotation.y = yaw;
      eltern.add(obj);
      reg.push({ ...e, hart: !!opt.hart, y0: y, y1: y + hoehe + 0.003 });
      return true;
    }
    return false;
  }
  // Schrottplatz-Belegung (Welt); Grundriss muss in einem Schrott-Kasten liegen
  const schrottReg = belegung();
  // abgerundete Grundfläche je Kasten (Superellipse: eckig genug zum Füllen, aber ohne harte Ecken)
  const inRund = (px, pz, k) => {
    const mx = (k.xMin + k.xMax) / 2, mz = (k.zMin + k.zMax) / 2, ax = (k.xMax - k.xMin) / 2 - 0.02, az = (k.zMax - k.zMin) / 2 - 0.02;
    return (Math.abs(px - mx) / ax) ** 2.3 + (Math.abs(pz - mz) / az) ** 2.3 <= 1;
  };
  const imSchrott = (e) => {
    const [ux, uz] = achsen(e.yaw);
    const ecken = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([a, b]) => [e.cx + ux[0] * e.hx * a + uz[0] * e.hz * b, e.cz + ux[1] * e.hx * a + uz[1] * e.hz * b]);
    return ecken.every(([px, pz]) => SCHROTT_KAESTEN.some((k) => inRund(px, pz, k)));
  };
  // Leistung: alle Teile eines Gegenstands (Haufen, Gitterbox, Mofa …) mit gleichem Aussehen zu einem Mesh
  // zusammenfassen (sieht gleich aus, aber viel weniger Zeichenaufrufe). Anklickbar bleibt der Gegenstand als Ganzes.
  const _inv = new THREE.Matrix4(), _rel = new THREE.Matrix4();
  function schluessel(m) {
    if (m.isShaderMaterial) return 'u|' + m.uuid;
    return [m.type, m.color?.getHex(), m.map?.uuid || '', m.side, m.transparent, m.opacity, m.alphaTest, m.depthWrite].join('|');
  }
  function verschmelzen(geos) {
    let n = 0, ni = 0;
    for (const g of geos) { n += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; }
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = new Uint32Array(ni);
    let o = 0, oi = 0;
    for (const g of geos) {
      const c = g.attributes.position.count;
      pos.set(g.attributes.position.array, o * 3);
      if (g.attributes.normal) nor.set(g.attributes.normal.array, o * 3);
      if (g.attributes.uv) uv.set(g.attributes.uv.array.subarray(0, c * 2), o * 2);
      if (g.index) { const a = g.index.array; for (let k = 0; k < a.length; k++) idx[oi + k] = a[k] + o; oi += a.length; }
      else { for (let k = 0; k < c; k++) idx[oi + k] = k + o; oi += c; }
      o += c;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    m.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    m.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    m.setIndex(new THREE.BufferAttribute(idx, 1));
    m.computeBoundingSphere();
    return m;
  }
  function zusammenfassen(obj) {
    obj.updateMatrixWorld(true);
    _inv.copy(obj.matrixWorld).invert();
    const gruppen = new Map(), weg = [];
    obj.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material) || o.userData.einzeln) return;
      const k = schluessel(o.material);
      if (!gruppen.has(k)) gruppen.set(k, { mat: o.material, geos: [], schatten: o.castShadow, umriss: !!o.userData.umriss });
      const geo = o.geometry.index ? o.geometry.clone() : o.geometry.clone();
      _rel.multiplyMatrices(_inv, o.matrixWorld);
      geo.applyMatrix4(_rel);
      gruppen.get(k).geos.push(geo);
      weg.push(o);
    });
    for (const o of weg) if (o.parent) o.parent.remove(o);
    // leere Gruppen bleiben stehen (unsichtbar, stören nicht)
    for (const { mat, geos, schatten, umriss } of gruppen.values()) {
      const m = new THREE.Mesh(verschmelzen(geos), mat);
      m.castShadow = schatten && !umriss; m.receiveShadow = !umriss;
      if (umriss) m.userData.umriss = true;
      obj.add(m);
      for (const g of geos) g.dispose();
    }
  }
  let weggelassen = 0; const fehlend = [];
  // großes Teil am Boden hinlegen (sucht einen freien Platz in der Nähe)
  const legen = (obj, x, z, ry = r() * Math.PI * 2) => {
    if (!platziere(schrottReg, gruppe, obj, x, z, ry, { suche: true, drin: imSchrott, sf: 0.78, hart: true })) { weggelassen++; fehlend.push((obj.userData.interaktiv?.id || obj.children[0]?.userData?.interaktiv?.id || '?') + '@' + x.toFixed(1) + ',' + z.toFixed(1)); }
    else zusammenfassen(obj);
    return obj;
  };
  // fest an diese Stelle (Grundriss nur im Kasten, nicht in der Rundung), z. B. die Felgen-Box neben der Hintertür
  const imKastenEckig = (e) => {
    const [ux, uz] = achsen(e.yaw);
    return [[1, 1], [1, -1], [-1, 1], [-1, -1]].every(([a, b]) => { const px = e.cx + ux[0] * e.hx * a + uz[0] * e.hz * b, pz = e.cz + ux[1] * e.hx * a + uz[1] * e.hz * b; return SCHROTT_KAESTEN.some((k) => px > k.xMin && px < k.xMax && pz > k.zMin && pz < k.zMax); });
  };
  const legenFest = (obj, x, z, ry) => {
    if (!platziere(schrottReg, gruppe, obj, x, z, ry, { suche: true, drin: imKastenEckig, sf: 0.78, hart: true })) weggelassen++;
    else zusammenfassen(obj);
    return obj;
  };
  // obendrauf (z. B. Gitterbox auf Gitterbox): genau hier, auf das, was darunter steht
  const draufstellen = (obj, x, z, ry) => {
    if (!platziere(schrottReg, gruppe, obj, x, z, ry, { stapel: true, drin: imSchrott, hart: true })) weggelassen++;
    else zusammenfassen(obj);
    return obj;
  };
  // Rost-Materialien: Struktur statt Einheitsfarbe (Grundton, dunkle Narben, helle Flugrost-Flecken, Laufspuren)
  const rostMats = [['#8a4a2a', '#5a2c18', '#b8683a'], ['#6e5244', '#3e2c24', '#9a6a4a'], ['#7a3e22', '#4a2414', '#a85a2e'], ['#5e5a56', '#3a3634', '#8a5a3a'], ['#1e1d1c', '#0e0d0c', '#7a4a2a'], ['#262422', '#141210', '#8a5230']].map(([grund, dunkel, hell], k) => {
    const t = leinwandTextur(128, 128, (cg, b, h) => {
      cg.fillStyle = grund; cg.fillRect(0, 0, b, h);
      for (let i = 0; i < 140; i++) { cg.fillStyle = r() < 0.55 ? dunkel : hell; cg.globalAlpha = 0.25 + r() * 0.5; cg.beginPath(); cg.ellipse(r() * b, r() * h, 1 + r() * 7, 1 + r() * 4, r() * 3, 0, Math.PI * 2); cg.fill(); }
      cg.globalAlpha = 0.3; cg.fillStyle = dunkel;
      for (let i = 0; i < 10; i++) cg.fillRect(r() * b, r() * h * 0.5, 1 + r() * 2, 20 + r() * 50);
      cg.globalAlpha = 1;
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    const m = toon(0xffffff, { map: t, side: THREE.DoubleSide });
    m.userData.k = k;
    return m;
  });
  // ein Drittel der Teile schwarz (lackiert, Rost an den Kanten)
  const rm = () => rostMats[Math.floor(r() * rostMats.length)];
  const innenDunkel = toon(0x2a201a, { side: THREE.BackSide });
  // Rohr mit Wandstärke: Außenmantel, dunkle Innenseite, Ringflächen an den Enden; ab und zu ein Flansch
  function hohlrohr(l, R) {
    const g = new THREE.Group(), mat = rm();
    const aussen = new THREE.Mesh(new THREE.CylinderGeometry(R, R, l, 16, 1, true), mat); aussen.castShadow = true; g.add(aussen);
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(R * 0.8, R * 0.8, l, 16, 1, true), innenDunkel));
    for (const y of [-l / 2, l / 2]) { const ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.8, R, 16), mat); ring.rotation.x = Math.PI / 2; ring.position.y = y; g.add(ring); }
    if (r() < 0.3) { const fl = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.7, R * 1.7, 0.02, 16), mat); fl.position.y = l / 2 - 0.01; g.add(fl); for (let k = 0; k < 6; k++) { const w = k / 6 * 6.28; g.add(setze(zylinder(R * 0.12, R * 0.12, 0.03, 0x2a2622, { umriss: false }, 6), Math.cos(w) * R * 1.35, l / 2 - 0.01, Math.sin(w) * R * 1.35)); } }
    umrissLinie(aussen, 0.003);
    return g;
  }
  // Profil aus Formplatten (lokal: Länge entlang x), z. B. Doppel-T, U, L, Vierkantrohr
  function profil(art, l) {
    const g = new THREE.Group(), mat = rm();
    const platte = (b, h, y, z) => { const m = teil(new THREE.BoxGeometry(l, h, b), 0, { material: mat, umriss: 0.002 }); m.position.set(0, y, z); g.add(m); };
    if (art === 'I') { const H = 0.12 + r() * 0.1, B = H * 0.6, t = 0.012; platte(B, t, H / 2 - t / 2, 0); platte(B, t, -H / 2 + t / 2, 0); platte(t * 0.8, H - 2 * t, 0, 0); }
    else if (art === 'U') { const H = 0.1 + r() * 0.06, B = 0.05; platte(0.008, H, 0, 0); platte(B, 0.008, H / 2, B / 2); platte(B, 0.008, -H / 2, B / 2); }
    else if (art === 'L') { const S = 0.05 + r() * 0.04; platte(S, 0.006, 0, S / 2); platte(0.006, S, S / 2, 0); }
    else { // Vierkantrohr, hohl
      const S = 0.06 + r() * 0.05, t = 0.005;
      platte(S, t, S / 2, 0); platte(S, t, -S / 2, 0); platte(t, S, 0, S / 2); platte(t, S, 0, -S / 2);
      const innen = new THREE.Mesh(new THREE.BoxGeometry(l - 0.01, S - 2 * t, S - 2 * t), innenDunkel); g.add(innen);
    }
    // schräg abgetrennte Enden: kleiner Brennschnitt-Rand (dunkel)
    for (const sx of [-1, 1]) g.add(setze(quader(0.006, 0.02, 0.02, 0x1d1d1f, { umriss: false }), sx * l / 2, 0, 0));
    return g;
  }
  // gebogenes Blech (Kantteil): zwei Flächen im Winkel, mit Bohrungen
  function kantblech() {
    const g = new THREE.Group(), mat = rm(), b = 0.4 + r() * 0.6, t1 = 0.2 + r() * 0.3, t2 = 0.1 + r() * 0.2;
    const a = teil(new THREE.BoxGeometry(b, 0.006, t1), 0, { material: mat, umriss: 0.002 }); a.position.z = t1 / 2; g.add(a);
    const c = teil(new THREE.BoxGeometry(b, t2, 0.006), 0, { material: mat, umriss: 0.002 }); c.position.y = t2 / 2; g.add(c);
    for (let k = 0; k < 3; k++) g.add(setze(zylinder(0.012, 0.012, 0.008, 0x1d1d1f, { umriss: false }, 8), -b / 3 + k * b / 3, 0.002, t1 * 0.6));
    return g;
  }
  // plattgedrücktes Fass: gestauchter Zylinder mit Sicken und verbeultem Deckel
  function plattesFass() {
    const g = new THREE.Group(), mat = rm();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.85, 16), mat);
    m.scale.set(1, 1, 0.38); m.rotation.z = Math.PI / 2; m.castShadow = true; umrissLinie(m, 0.003); g.add(m);
    for (const x of [-0.15, 0.15]) { const s = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.012, 4, 16), mat); s.scale.set(1, 0.38, 1); s.rotation.y = Math.PI / 2; s.position.x = x; g.add(s); }
    return g;
  }
  // Schrotthaufen: nur Metall, aus erkennbaren Teilen (keine Klötze): unten plattgedrückte Fässer, Kantbleche und
  // Blechpakete als Kern, darauf Rohre mit Wandstärke, Doppel-T, U-Profile, Winkel, Vierkantrohre, Baustahlgitter,
  // Töpfe, Pfannen, Grillroste und Werkzeug kreuz und quer; Höhe nach Hügelform
  function altmetall(cx, cz, rx, rz, n, hoehe = 1.0) {
    const g = new THREE.Group();
    gruppe.add(g);
    const hoeheBei = (x, z) => Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2);
    // Lage im Haufen: zur Mitte hin dichter (dort wird er höher)
    const lage = () => { const w = r() * Math.PI * 2, d = Math.pow(r(), 0.75) * 0.95; return [Math.cos(w) * rx * d, Math.sin(w) * rz * d]; };
    const drauf = (teil, flach) => {
      const holder = new THREE.Group();
      teil.rotation.x = (r() - 0.5) * 0.5 * flach; teil.rotation.z = (r() - 0.5) * 0.5 * flach;
      holder.add(teil);
      for (let v = 0; v < 6; v++) {
        const [lx, lz] = lage();
        const maxY = hoehe * (0.3 + hoeheBei(lx, lz)) + 0.15;
        if (platziere(schrottReg, g, holder, cx + lx, cz + lz, r() * Math.PI * 2, { stapel: true, maxY, drin: (e) => imSchrott(e), sf: 0.72, einsinken: 0.15 })) return true;
      }
      return false;
    };
    // erst der Kern (Fässer, Kantbleche), dann Profile und Rohre, dann Kleinkram obendrauf und am Fuß
    for (let i = 0; i < Math.round(n * 0.2); i++) drauf(r() < 0.4 ? plattesFass() : kantblech(), 0.4);
    for (let i = 0; i < Math.round(n * 0.75); i++) {
      const art = r();
      let m;
      if (art < 0.28) { m = new THREE.Group(); const ro = hohlrohr(0.6 + r() * 1.6, 0.03 + r() * 0.07); ro.rotation.z = Math.PI / 2; m.add(ro); }
      else if (art < 0.48) { // rostiges Blech, leicht verbogen (zwei Hälften im flachen Winkel), mit Löchern
        m = new THREE.Group();
        const mat = rm(), b = 0.4 + r() * 0.9, t = 0.3 + r() * 0.7, k = (r() - 0.5) * 0.5;
        const a = teil(new THREE.BoxGeometry(b / 2, 0.006, t), 0, { material: mat, umriss: 0.002 }); a.position.x = -b / 4; m.add(a);
        const c = teil(new THREE.BoxGeometry(b / 2, 0.006, t), 0, { material: mat, umriss: 0.002 }); c.position.set(b / 4 * Math.cos(k), b / 4 * Math.sin(k), 0); c.rotation.z = k; m.add(c);
        for (let i = 0; i < 2; i++) m.add(setze(zylinder(0.015, 0.015, 0.008, 0x1d1d1f, { umriss: false }, 8), -b / 3, 0.002, (r() - 0.5) * t * 0.7));
      }
      else if (art < 0.6) m = profil('I', 0.8 + r() * 1.4);
      else if (art < 0.7) m = profil('U', 0.6 + r() * 1.2);
      else if (art < 0.8) m = profil('L', 0.6 + r() * 1.0);
      else if (art < 0.88) m = profil('Q', 0.6 + r() * 1.2);
      else if (art < 0.93) m = kantblech();
      else { // Baustahlgitter
        m = new THREE.Group();
        const mat = rm();
        for (let k = 0; k < 6; k++) m.add(setze(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.2, 5), mat), -0.5 + k * 0.2, 0, 0, Math.PI / 2, 0, 0));
        for (let k = 0; k < 6; k++) m.add(setze(new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.2, 5), mat), 0, 0.012, -0.5 + k * 0.2, 0, 0, Math.PI / 2));
      }
      drauf(m, 1);
    }
    for (let i = 0; i < Math.round(n * 0.25); i++) drauf(kleinteil(), 0.3);
    zusammenfassen(g);
    merke(g, 'schrott', 'Schrott', null);
  }
  // Altreifen-Stapel
  // Reifen mit echtem Querschnitt (Drehprofil): flache Lauffläche, Flanken, Wulst innen; Profilblöcke und Rillen
  const gummi = toon(0x1d1d1f, { side: THREE.DoubleSide }), gummiHell = toon(0x2e2e30);
  function reifen(R = 0.3, B = 0.17, trecker = false) {
    const g = new THREE.Group(), i = R * (trecker ? 0.62 : 0.68);
    const prof = [[i, -B * 0.42], [i + 0.012, -B * 0.5], [R * 0.9, -B * 0.5], [R - 0.012, -B * 0.46], [R, -B * 0.36], [R, B * 0.36], [R - 0.012, B * 0.46], [R * 0.9, B * 0.5], [i + 0.012, B * 0.5], [i, B * 0.42]].map(([x, y]) => new THREE.Vector2(x, y));
    const m = new THREE.Mesh(new THREE.LatheGeometry(prof, 32), gummi);
    m.castShadow = true; umrissLinie(m, 0.003); g.add(m);
    // Flankenschrift (helle Ringe) und Profil
    for (const y of [-B * 0.5 - 0.001, B * 0.5 + 0.001]) { const ring = new THREE.Mesh(new THREE.RingGeometry(R * 0.8, R * 0.83, 32), gummiHell); ring.rotation.x = -Math.PI / 2; ring.position.y = y; g.add(ring); }
    const n = trecker ? 22 : 30;
    for (let k = 0; k < n; k++) {
      const w = k / n * Math.PI * 2;
      if (trecker) { // Stollen schräg, abwechselnd links/rechts (Chevron)
        for (const sy of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.07, B * 0.45, 0.06), gummi); st.position.set(Math.cos(w) * (R + 0.03), sy * B * 0.22, Math.sin(w) * (R + 0.03)); st.rotation.set(0, -w, sy * 0.5); g.add(st); }
      } else { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.035, B * 0.7, 0.012), gummiHell); bl.position.set(Math.cos(w) * (R + 0.002), 0, Math.sin(w) * (R + 0.002)); bl.rotation.y = -w + Math.PI / 2; g.add(bl); }
    }
    return g;
  }
  function reifenStapel(x, z, n, liegt = false) {
    const g = new THREE.Group();
    for (let k = 0; k < n; k++) {
      const t = reifen(0.3 + (r() - 0.5) * 0.04, 0.16 + r() * 0.04);
      t.position.set((r() - 0.5) * 0.08, 0.09 + k * 0.19, (r() - 0.5) * 0.08); t.rotation.set((r() - 0.5) * 0.08, r() * 6, (r() - 0.5) * 0.08);
      g.add(t);
    }
    if (liegt) { g.rotation.z = Math.PI / 2; g.position.y = 0.4; }
    const h = new THREE.Group();
    h.add(g);
    return legen(h, x, z);
  }
  // großer Treckerreifen (1,6 m), liegt flach
  function treckerreifen(x, z) {
    const t = reifen(0.8, 0.5, true);
    const h = new THREE.Group(); h.add(t);
    merke(h, 'treckerreifen', 'Treckerreifen', null);
    return legen(h, x, z);
  }
  // kaputter alter Tischkicker: Holzkasten mit grünem Spielfeld, Mittellinie, Tore, Stangen mit Figuren (rot/blau),
  // Griffe; ein Bein fehlt (Kasten kippt auf die Ecke), eine Stange verbogen, eine fehlt, Seitenwand gesprungen, Zählwerk
  function kicker(x, z, ry) {
    const g = new THREE.Group(), HOLZ = 0x7a5232, L = 1.2, Bk = 0.7, H0 = 0.62, K = 0.24;
    const feldTex = leinwandTextur(256, 150, (cg, b, h) => {
      cg.fillStyle = '#3a8a3a'; cg.fillRect(0, 0, b, h);
      cg.strokeStyle = '#f0f0e8'; cg.lineWidth = 3; cg.strokeRect(6, 6, b - 12, h - 12);
      cg.beginPath(); cg.moveTo(b / 2, 6); cg.lineTo(b / 2, h - 6); cg.stroke();
      cg.beginPath(); cg.arc(b / 2, h / 2, 22, 0, Math.PI * 2); cg.stroke();
      cg.strokeRect(6, h / 2 - 30, 30, 60); cg.strokeRect(b - 36, h / 2 - 30, 30, 60);
      for (let i = 0; i < 30; i++) { cg.fillStyle = 'rgba(90,70,40,0.35)'; cg.fillRect(r() * b, r() * h, 3 + r() * 10, 2 + r() * 6); }
    });
    const kasten = new THREE.Group();
    const feld = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.06, Bk - 0.06), toon(0xffffff, { map: feldTex })); feld.rotation.x = -Math.PI / 2; feld.position.y = 0.02; kasten.add(feld);
    kasten.add(setze(quader(L, 0.02, Bk, HOLZ, { umriss: 0.002 }), 0, 0.01, 0));
    for (const sz of [-1, 1]) kasten.add(setze(quader(L, K, 0.03, HOLZ, { umriss: 0.003 }), 0, K / 2, sz * Bk / 2));
    for (const sx of [-1, 1]) {
      kasten.add(setze(quader(0.03, K, Bk, HOLZ, { umriss: 0.003 }), sx * L / 2, K / 2, 0));
      kasten.add(setze(quader(0.04, 0.08, 0.22, 0x1d1d1f, { umriss: false }), sx * (L / 2 + 0.001), 0.06, 0)); // Tor
    }
    kasten.add(setze(quader(0.3, 0.012, 0.04, 0xd8b23a, { umriss: false }), 0.25, K + 0.006, -Bk / 2)); // Zählwerk
    for (let k = 0; k < 5; k++) kasten.add(setze(zylinder(0.012, 0.012, 0.03, 0xf0f0e8, { umriss: false }, 8), 0.15 + k * 0.05, K + 0.02, -Bk / 2, Math.PI / 2, 0, 0));
    kasten.add(setze(quader(0.2, 0.006, 0.004, 0x1d1d1f, { umriss: false }), -0.3, K * 0.6, Bk / 2 + 0.017, 0, 0, 0.6)); // Riss
    // Stangen mit Figuren: 8 Stangen, eine fehlt (Index 5), eine verbogen (Index 2)
    const stangenX = [-0.5, -0.36, -0.2, -0.06, 0.06, 0.2, 0.36, 0.5], figuren = [1, 2, 3, 5, 5, 3, 2, 1];
    stangenX.forEach((sx, i) => {
      if (i === 5) return;
      const farbe = i % 2 ? 0x2f5fa8 : 0xc8382c, st = new THREE.Group();
      st.add(setze(zylinder(0.008, 0.008, Bk + 0.5, 0xc0c4c8, { umriss: false }, 8), 0, 0, 0, Math.PI / 2, 0, 0));
      st.add(setze(zylinder(0.022, 0.022, 0.11, 0x1d1d1f, { umriss: 0.001 }, 10), 0, 0, (i % 2 ? -1 : 1) * (Bk / 2 + 0.2), Math.PI / 2, 0, 0)); // Griff
      const n = figuren[i];
      for (let k = 0; k < n; k++) {
        const fz = (k - (n - 1) / 2) * (Bk - 0.12) / Math.max(1, n);
        const f = new THREE.Group();
        f.add(setze(kugel(0.018, 0xe8c8a0, { umriss: false }, 8), 0, 0.045, 0));
        f.add(setze(quader(0.03, 0.06, 0.035, farbe, { umriss: 0.001 }), 0, 0.0, 0));
        f.add(setze(quader(0.025, 0.08, 0.02, farbe, { umriss: false }), 0, -0.06, 0));
        f.position.z = fz; f.rotation.z = (r() - 0.5) * 1.2;
        st.add(f);
      }
      st.position.set(sx, 0.13, 0);
      if (i === 2) st.rotation.x = 0.12; // verbogen
      kasten.add(st);
    });
    kasten.position.y = H0;
    g.add(kasten);
    // Beine (eins fehlt), Querstreben
    for (const [lx, lz] of [[-1, -1], [-1, 1], [1, -1]]) g.add(setze(quader(0.07, H0, 0.07, HOLZ, { umriss: 0.003 }), lx * (L / 2 - 0.06), H0 / 2, lz * (Bk / 2 - 0.06)));
    g.add(setze(quader(0.04, 0.04, Bk - 0.12, HOLZ, { umriss: 0.002 }), -(L / 2 - 0.06), 0.15, 0));
    g.add(setze(quader(0.07, 0.4, 0.07, HOLZ, { umriss: 0.003 }), L / 2 + 0.3, 0.035, 0.1, 0, 0.4, Math.PI / 2)); // abgebrochenes Bein liegt daneben
    g.rotation.x = -0.08; g.rotation.z = -0.14; // kippt auf die fehlende Ecke
    const h = new THREE.Group(); h.add(g);
    merke(h, 'kicker', 'Kicker', null);
    return legen(h, x, z, ry);
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
  // kaputter Betonmischer: hohle Trommel mit Tiefe (orange, innen Betonkruste), drin liegt Schrott; Mischflügel innen,
  // Zahnkranz mit Zähnen, Ritzel, Lagerbock mit Achse, Kipphebel, Handrad, Rahmen mit Streben, Deichsel, ein Rad fehlt
  // (Achse steht auf einem Klotz), Motorkasten offen (Motor ausgebaut), Riemenschutz, Betonspritzer, Rost
  function betonmischer(x, z, ry) {
    const g = new THREE.Group(), OR = 0xd8792a, RAHMEN = 0x4e5256;
    const stab = (ax, ay, az, bx, by, bz, d = 0.025, f = RAHMEN) => {
      const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz), l = a.distanceTo(b);
      const m = zylinder(d, d, l, f, { umriss: 0.002 }, 8);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
      g.add(m);
    };
    // Fahrgestell: zwei Längsholme, Querrohre, Streben zum Lagerbock, Deichsel mit Griff
    for (const s of [-1, 1]) { stab(-0.6, 0.3, s * 0.28, 0.55, 0.3, s * 0.28, 0.028); stab(0.0, 0.3, s * 0.28, 0.1, 1.0, s * 0.3, 0.03); stab(0.45, 0.3, s * 0.28, 0.1, 0.95, s * 0.3, 0.022); }
    stab(-0.6, 0.3, -0.28, -0.6, 0.3, 0.28, 0.028); stab(0.5, 0.3, -0.28, 0.5, 0.3, 0.28, 0.028);
    stab(0.55, 0.3, 0, 0.95, 0.42, 0, 0.025); stab(0.95, 0.42, -0.1, 0.95, 0.42, 0.1, 0.02);
    // Achse und Rad: eins da, auf der anderen Seite fehlt es, die Achse liegt auf einem Ziegel
    stab(-0.55, 0.22, -0.38, -0.55, 0.22, 0.38, 0.02, 0x7a7e84);
    g.add(setze(teil(new THREE.TorusGeometry(0.16, 0.06, 8, 18), 0x1d1d1f, { umriss: 0.002 }), -0.55, 0.22, 0.4));
    g.add(setze(zylinder(0.1, 0.1, 0.06, 0x9a9da2, { umriss: 0.002 }, 14), -0.55, 0.22, 0.4, Math.PI / 2, 0, 0));
    for (let i = 0; i < 5; i++) { const w = i / 5 * 6.28; g.add(setze(zylinder(0.008, 0.008, 0.07, 0x3a3a3c, { umriss: false }, 6), -0.55 + Math.cos(w) * 0.06, 0.22 + Math.sin(w) * 0.06, 0.43, Math.PI / 2, 0, 0)); }
    g.add(setze(quader(0.24, 0.12, 0.12, 0xa8442a, { umriss: 0.002 }), -0.55, 0.1, -0.38)); // Ziegel statt Rad
    // Lagerbock oben mit Kippachse
    for (const s of [-1, 1]) g.add(setze(quader(0.1, 0.14, 0.04, RAHMEN, { umriss: 0.002 }), 0.1, 1.02, s * 0.32));
    stab(0.1, 1.05, -0.4, 0.1, 1.05, 0.4, 0.022, 0x7a7e84);
    // Trommel: hohl (Drehprofil), innen dunkel mit Betonkruste, Öffnung schräg nach oben
    const tr = new THREE.Group();
    const profil = [[0.0, -0.38], [0.2, -0.36], [0.33, -0.25], [0.37, -0.05], [0.37, 0.08], [0.3, 0.25], [0.22, 0.38], [0.2, 0.42]].map(([rr, y]) => new THREE.Vector2(rr, y));
    const aussen = new THREE.Mesh(new THREE.LatheGeometry(profil, 26), toon(OR, { side: THREE.FrontSide }));
    aussen.castShadow = true; tr.add(aussen);
    const innenProfil = profil.map((p) => new THREE.Vector2(Math.max(0, p.x - 0.02), p.y + (p.y < 0 ? 0.02 : 0)));
    const innen = new THREE.Mesh(new THREE.LatheGeometry(innenProfil, 26), toon(0x6e6a64, { side: THREE.BackSide }));
    tr.add(innen);
    tr.add(setze(teil(new THREE.TorusGeometry(0.205, 0.022, 8, 24), 0xb8601e, { umriss: 0.002 }), 0, 0.42, 0, Math.PI / 2, 0, 0)); // Rand
    // Betonkruste am Rand und innen, Rost außen, Delle
    // Betonkruste: unregelmäßiger grauer Belag innen am Rand (flach), keine Klötze
    for (let i = 0; i < 6; i++) { const w0 = r() * 6.28, kr = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.012, 4, 10, 0.5 + r() * 0.8), toon(0x8a867c)); kr.rotation.set(Math.PI / 2, 0, w0); kr.position.y = 0.4; kr.scale.set(1, 1, 0.5); tr.add(kr); }
    // Schweißnähte, Verstärkungsringe, Lippe dunkler
    for (const [y, rr] of [[-0.05, 0.372], [0.24, 0.302]]) tr.add(setze(teil(new THREE.TorusGeometry(rr, 0.008, 4, 28), 0xb8601e, { umriss: false }), 0, y, 0, Math.PI / 2, 0, 0));
    // Betonspritzer außen: flache, graue Flecken auf dem Bauch
    for (let i = 0; i < 7; i++) { const w = r() * 6.28, y = -0.25 + r() * 0.2; const f = new THREE.Mesh(new THREE.CircleGeometry(0.03 + r() * 0.04, 7), toon(0x9a968c, { side: THREE.DoubleSide })); f.position.set(Math.cos(w) * 0.352, y, Math.sin(w) * 0.352); f.lookAt(Math.cos(w) * 2, y, Math.sin(w) * 2); tr.add(f); }
    // Schrauben am Zahnkranz
    for (let k = 0; k < 12; k++) { const w = k / 12 * 6.28; tr.add(setze(zylinder(0.009, 0.009, 0.03, 0x7a7e84, { umriss: false }, 6), Math.cos(w) * 0.37, 0.005, Math.sin(w) * 0.37)); }
    // Typenschild
    tr.add(setze(quader(0.08, 0.05, 0.004, 0xc0c4c8, { umriss: false }), 0.0, 0.1, 0.345, 0, 0, 0));
    for (let i = 0; i < 8; i++) { const w = r() * 6.28, y = -0.2 + r() * 0.35; tr.add(setze(quader(0.07 + r() * 0.08, 0.05 + r() * 0.08, 0.008, 0x8a4a2a, { umriss: false }), Math.cos(w) * 0.375, y, Math.sin(w) * 0.375, 0, -w + Math.PI / 2, 0)); }
    tr.add(setze(quader(0.14, 0.1, 0.02, 0xa85818, { umriss: false }), 0.36, 0.0, 0.1, 0, 0.3, 0.2));
    // Mischflügel innen
    for (let i = 0; i < 3; i++) { const w = i / 3 * 6.28; tr.add(setze(quader(0.16, 0.012, 0.06, 0x7a7e84, { umriss: 0.001 }), Math.cos(w) * 0.24, 0.0, Math.sin(w) * 0.24, 0.6, -w, 0)); }
    // Zahnkranz mit Zähnen außen
    tr.add(setze(teil(new THREE.TorusGeometry(0.385, 0.022, 6, 32), 0x3a3a3c, { umriss: false }), 0, -0.02, 0, Math.PI / 2, 0, 0));
    for (let k = 0; k < 40; k++) { const w = k / 40 * 6.28; tr.add(setze(quader(0.018, 0.04, 0.02, 0x3a3a3c, { umriss: false }), Math.cos(w) * 0.41, -0.02, Math.sin(w) * 0.41, 0, -w, 0)); }
    // Schrott in der Trommel: Rohrstücke, Blech, Mutter, Schraubenschlüssel, alte Flasche
    const drin = new THREE.Group();
    drin.add(setze(zylinder(0.025, 0.025, 0.35, 0x7a3e22, { umriss: 0.002 }, 8), 0.02, -0.18, 0.04, 1.2, 0, 0.4));
    drin.add(setze(zylinder(0.03, 0.03, 0.28, 0x6e5a4a, { umriss: 0.002 }, 8), -0.06, -0.12, -0.05, 0.3, 1.0, 1.3));
    drin.add(setze(quader(0.18, 0.006, 0.14, 0x8a4a2a, { umriss: 0.001 }), 0.05, -0.22, -0.08, 0.5, 0.4, 0.2));
    drin.add(setze(quader(0.12, 0.08, 0.1, 0x5a5e62, { umriss: 0.002 }), -0.1, -0.24, 0.08, 0.2, 0.6, 0.1));
    { const w = werkzeug(); w.position.set(0.1, -0.06, 0.02); w.rotation.set(0.6, 0.3, 0.9); drin.add(w); }
    { const t = topf(); t.position.set(-0.05, -0.02, -0.06); t.rotation.set(0.9, 0.2, 0.4); t.scale.setScalar(0.8); drin.add(t); }
    drin.add(setze(zylinder(0.025, 0.025, 0.18, 0x5a3612, { umriss: 0.002 }, 10), 0.12, 0.05, -0.1, 0.8, 0, 0.5));
    tr.add(drin);
    tr.position.set(0.1, 1.05, 0); tr.rotation.z = -0.75;
    g.add(tr);
    // Trommelbügel: U-Bügel vom Lagerbock unter die Trommel, mit Lagerschale; Schmiernippel
    for (const sz of [-1, 1]) stab(0.1, 1.05, sz * 0.36, -0.12, 0.72, sz * 0.36, 0.022, RAHMEN);
    stab(-0.12, 0.72, -0.36, -0.12, 0.72, 0.36, 0.022, RAHMEN);
    g.add(setze(zylinder(0.05, 0.05, 0.06, 0x3a3a3c, { umriss: 0.001 }, 12), -0.12, 0.72, 0, Math.PI / 2, 0, 0));
    for (const sz of [-1, 1]) g.add(setze(zylinder(0.008, 0.008, 0.03, 0xd8b23a, { umriss: false }, 6), 0.1, 1.12, sz * 0.32));
    // Kurbel am Handrad
    stab(0.1, 1.05, 0.46, 0.1, 1.17, 0.5, 0.01, RAHMEN);
    g.add(setze(zylinder(0.016, 0.016, 0.07, 0x1d1d1f, { umriss: 0.001 }, 8), 0.1, 1.19, 0.54, Math.PI / 2, 0, 0));
    // Ritzel am Zahnkranz, Kipphebel und Handrad
    g.add(setze(zylinder(0.06, 0.06, 0.05, 0x3a3a3c, { umriss: 0.002 }, 12), -0.18, 0.72, 0.0, 0, 0, Math.PI / 2 - 0.75));
    stab(0.1, 1.05, 0.4, 0.5, 1.45, 0.42, 0.018, 0x7a7e84);
    g.add(setze(zylinder(0.025, 0.025, 0.12, 0x1d1d1f, { umriss: 0.001 }, 8), 0.5, 1.45, 0.48, Math.PI / 2, 0, 0));
    g.add(setze(teil(new THREE.TorusGeometry(0.14, 0.012, 6, 18), RAHMEN, { umriss: false }), 0.1, 1.05, 0.45));
    for (let k = 0; k < 4; k++) g.add(setze(zylinder(0.006, 0.006, 0.28, RAHMEN, { umriss: false }, 4), 0.1, 1.05, 0.45, 0, 0, k * Math.PI / 4));
    // Motorkasten: offen, Motor fehlt, nur Halterung und Kabelreste; Riemenschutz daneben
    const kasten = new THREE.Group();
    kasten.add(setze(quader(0.32, 0.02, 0.26, 0x2f6b3a, { umriss: 0.002 }), 0, 0, 0));
    for (const s of [-1, 1]) kasten.add(setze(quader(0.32, 0.2, 0.02, 0x2f6b3a, { umriss: 0.002 }), 0, 0.1, s * 0.13));
    kasten.add(setze(quader(0.02, 0.2, 0.26, 0x2f6b3a, { umriss: 0.002 }), -0.16, 0.1, 0));
    for (const s of [-1, 1]) kasten.add(setze(quader(0.2, 0.02, 0.03, 0x5a5e62, { umriss: false }), 0, 0.03, s * 0.06));
    for (let i = 0; i < 3; i++) kasten.add(setze(zylinder(0.004, 0.004, 0.16, [0xc8382c, 0x1d1d1f, 0x2f5fa8][i], { umriss: false }, 4), 0.05 + i * 0.03, 0.12, 0.05, 0.5, 0, 0.8));
    kasten.add(setze(quader(0.3, 0.02, 0.24, 0x2f6b3a, { umriss: 0.002 }), 0.02, 0.24, 0.14, -0.9, 0, 0.1)); // aufgeklappter Deckel
    kasten.position.set(-0.32, 0.36, 0);
    g.add(kasten);
    g.add(setze(quader(0.08, 0.3, 0.22, 0x5a5e62, { umriss: 0.002 }), -0.12, 0.55, -0.2, 0, 0, 0.5)); // Riemenschutz
    // Betonspritzer am Gestell und auf dem Boden
    for (let i = 0; i < 8; i++) g.add(setze(quader(0.03 + r() * 0.05, 0.012, 0.03 + r() * 0.04, 0x8a867c, { umriss: false }), (r() - 0.5) * 1.0, 0.318, (r() < 0.5 ? -1 : 1) * 0.28));
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.06 + r() * 0.08, 8), toon(0x9a968c)); f.rotation.x = -Math.PI / 2; f.position.set((r() - 0.5) * 1.2, 0.012, (r() - 0.5) * 0.8); g.add(f); }
    g.rotation.x = 0.06; // hängt etwas schief (Ziegel statt Rad)
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
    // Sitzbank: gepolstert, abgerundet, mit Naht und aufgeplatztem Bezug (gelber Schaum), Blechwanne darunter
    {
      const sb = new THREE.Group();
      const polster = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 6, 14), toon(0x1d1d1f));
      polster.rotation.z = Math.PI / 2; polster.scale.set(0.6, 1, 1.2); umrissLinie(polster, 0.002);
      sb.add(polster);
      sb.add(setze(teil(new THREE.TorusGeometry(0.09, 0.003, 4, 20), 0x5a5a5c, { umriss: false }), -0.14, 0.0, 0, 0, Math.PI / 2, 0));
      sb.add(setze(quader(0.42, 0.02, 0.17, 0x3a3a3c, { umriss: 0.002 }), 0, -0.045, 0)); // Wanne
      sb.add(setze(quader(0.08, 0.004, 0.05, 0xe8c85a, { umriss: false }), 0.05, 0.046, 0.03, 0, 0.4, 0)); // Riss, Schaum
      sb.add(setze(teil(new THREE.TorusGeometry(0.06, 0.006, 4, 10, Math.PI), 0x9a9da2, { umriss: false }), -0.24, 0.0, 0, 0, Math.PI / 2, -Math.PI / 2)); // Haltegriff
      sb.position.set(-0.33, 0.82, 0);
      g.add(sb);
      for (const sx of [-0.45, -0.2]) g.add(setze(zylinder(0.012, 0.012, 0.12, 0x3a3a3c, { umriss: false }, 6), sx, 0.73, 0));
    }
    // Kette, Fußrasten, Rücklicht mit Kennzeichenhalter (leer), Bremstrommeln, Gabelfedern, Tankdeckel, Auspuffrest
    for (const dy of [0.05, -0.05]) g.add(setze(zylinder(0.005, 0.005, 0.55, 0x3a3634, { umriss: false }, 4), -0.33, 0.32 + dy, 0.07, 0, 0, Math.PI / 2));
    for (const sz of [-1, 1]) g.add(setze(zylinder(0.012, 0.012, 0.12, 0x2a2a2c, { umriss: 0.001 }, 8), 0.0, 0.3, sz * 0.12, Math.PI / 2, 0, 0));
    g.add(setze(quader(0.05, 0.05, 0.1, 0xc8382c, { umriss: 0.001 }), -0.86, 0.68, 0));
    g.add(setze(quader(0.006, 0.09, 0.12, 0x9a9da2, { umriss: 0.001 }), -0.88, 0.58, 0));
    for (const px of [-0.6, 0.62]) g.add(setze(zylinder(0.07, 0.07, 0.05, 0x8c8f94, { umriss: 0.001 }, 14), px, 0.32, 0.04, Math.PI / 2, 0, 0));
    for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) g.add(setze(teil(new THREE.TorusGeometry(0.022, 0.004, 4, 10), 0x5a5e62, { umriss: false }), 0.56 - k * 0.025, 0.66 + k * 0.03, sz * 0.06, Math.PI / 2, 0, 0.3));
    g.add(setze(zylinder(0.025, 0.025, 0.015, 0xc0c4c8, { umriss: false }, 10), 0.28, 0.885, 0));
    g.add(setze(zylinder(0.022, 0.026, 0.4, 0x5a4a40, { umriss: 0.002 }, 10), -0.45, 0.24, -0.1, 0, 0, Math.PI / 2 - 0.15)); // Auspuffrest (Rost)
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
    // Sattel: gepolstert (runder Hinterteil, schmale Nase), Naht, Gestell mit Streben, Sattelkloben auf der Stütze
    {
      const sa = new THREE.Group();
      const hinten = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), toon(0x1d1d1f)); hinten.scale.set(0.07, 0.03, 0.085); hinten.position.x = -0.04; umrissLinie(hinten, 0.002); sa.add(hinten);
      const nase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.06, 0.15, 14), toon(0x1d1d1f)); nase.rotation.z = Math.PI / 2; nase.scale.set(0.5, 1, 1); nase.position.x = 0.07; umrissLinie(nase, 0.002); sa.add(nase);
      sa.add(setze(teil(new THREE.TorusGeometry(0.075, 0.003, 4, 20, Math.PI), 0x5a5a5c, { umriss: false }), -0.04, 0.0, 0, Math.PI / 2, 0, Math.PI / 2)); // Naht
      for (const sz of [-0.025, 0.025]) sa.add(setze(zylinder(0.004, 0.004, 0.2, 0x9a9da2, { umriss: false }, 6), 0.0, -0.035, sz, 0, 0, Math.PI / 2)); // Gestell
      for (const sz of [-0.05, 0.05]) sa.add(setze(teil(new THREE.TorusGeometry(0.03, 0.004, 4, 8, Math.PI), 0x9a9da2, { umriss: false }), -0.1, -0.045, sz, 0, 0, Math.PI)); // Federn
      sa.add(setze(quader(0.04, 0.025, 0.06, 0x7a7e84, { umriss: 0.001 }), 0.0, -0.05, 0)); // Kloben
      sa.position.set(-0.17, 0.9, 0); sa.rotation.z = 0.12;
      g.add(sa);
      g.add(setze(zylinder(0.012, 0.012, 0.1, 0x9a9da2, { umriss: 0.001 }, 8), -0.16, 0.83, 0, 0, 0, 0.2)); // Sattelstütze
    }
    // Antrieb: Kettenblatt mit Zähnen, Kurbeln, Pedale, Kette zum Ritzel; Nabe hinten
    {
      const KB = new THREE.Group();
      KB.add(teil(new THREE.TorusGeometry(0.075, 0.008, 4, 20), 0x7c7670, { umriss: false }));
      for (let k = 0; k < 24; k++) { const w = k / 24 * 6.28; KB.add(setze(quader(0.012, 0.012, 0.006, 0x7c7670, { umriss: false }), Math.cos(w) * 0.085, Math.sin(w) * 0.085, 0, 0, 0, w)); }
      for (let k = 0; k < 5; k++) KB.add(setze(quader(0.07, 0.01, 0.006, 0x7c7670, { umriss: false }), Math.cos(k * 1.256) * 0.035, Math.sin(k * 1.256) * 0.035, 0, 0, 0, k * 1.256));
      KB.position.set(-0.05, 0.36, 0.04); g.add(KB);
      g.add(setze(zylinder(0.025, 0.025, 0.1, 0x5a5e62, { umriss: false }, 10), -0.05, 0.36, 0, Math.PI / 2, 0, 0)); // Tretlager
      for (const [sz, w] of [[0.06, 0.4], [-0.06, 0.4 + Math.PI]]) {
        g.add(setze(quader(0.17, 0.018, 0.012, 0x9a9da2, { umriss: 0.001 }), -0.05 + Math.cos(w) * 0.085, 0.36 + Math.sin(w) * 0.085, sz, 0, 0, w));
        g.add(setze(quader(0.1, 0.02, 0.06, 0x2a2a2c, { umriss: 0.001 }), -0.05 + Math.cos(w) * 0.17, 0.36 + Math.sin(w) * 0.17, sz * 1.6));
      }
      for (const dy of [0.085, -0.085]) { const a = [-0.05, 0.36 + dy], b = [-0.52, 0.34 + dy * 0.45], l = Math.hypot(b[0] - a[0], b[1] - a[1]); g.add(setze(zylinder(0.004, 0.004, l, 0x3a3634, { umriss: false }, 4), (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.04, 0, 0, Math.PI / 2 - Math.atan2(b[1] - a[1], b[0] - a[0]))); }
      g.add(setze(zylinder(0.04, 0.04, 0.03, 0x7c7670, { umriss: false }, 12), -0.52, 0.34, 0.04, Math.PI / 2, 0, 0)); // Ritzel
    }
    // Schutzbleche, Gepäckträger, Rücklicht mit Reflektor, Ständer
    g.add(setze(teil(new THREE.TorusGeometry(0.36, 0.012, 4, 16, Math.PI * 0.6), 0xc0c4c8, { umriss: 0.001 }), -0.52, 0.34, 0, 0, 0, Math.PI * 0.35));
    g.add(setze(teil(new THREE.TorusGeometry(0.36, 0.012, 4, 16, Math.PI * 0.45), 0xc0c4c8, { umriss: 0.001 }), 0.52, 0.34, 0, 0, 0, Math.PI * 0.25));
    for (const sz of [-0.05, 0.05]) g.add(setze(zylinder(0.006, 0.006, 0.36, 0x7c7670, { umriss: false }, 6), -0.42, 0.72, sz, 0, 0, Math.PI / 2 + 0.05));
    g.add(setze(quader(0.36, 0.006, 0.12, 0x7c7670, { umriss: false }), -0.42, 0.73, 0, 0, 0, 0.05));
    for (const sz of [-0.05, 0.05]) g.add(setze(zylinder(0.005, 0.005, 0.42, 0x7c7670, { umriss: false }, 6), -0.56, 0.53, sz, 0, 0, 0.4));
    g.add(setze(quader(0.03, 0.04, 0.06, 0xc8382c, { umriss: 0.001 }), -0.62, 0.7, 0));
    g.add(setze(zylinder(0.008, 0.008, 0.3, 0x5a5e62, { umriss: false }, 6), -0.2, 0.2, -0.08, 0.5, 0, -0.3)); // Ständer
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
  // Autofeder (Schraubenfeder vom Fahrwerk): Draht als Wendel, Enden flach angeschliffen, rostig
  function autofeder() {
    const R = 0.06 + r() * 0.02, H = 0.28 + r() * 0.1, W = 6 + Math.floor(r() * 2);
    const pts = [];
    for (let i = 0; i <= W * 24; i++) {
      const t = i / (W * 24), w = t * W * Math.PI * 2;
      const yy = t < 0.06 ? t / 0.06 * 0.02 : t > 0.94 ? H - (1 - t) / 0.06 * 0.02 : 0.02 + (t - 0.06) / 0.88 * (H - 0.04);
      pts.push(new THREE.Vector3(Math.cos(w) * R, yy, Math.sin(w) * R));
    }
    const f = r() < 0.5 ? 0x7a3e22 : r() < 0.5 ? 0x5a5e62 : 0x8a4a2a;
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), W * 24, 0.011, 5, false), toon(f));
    m.castShadow = true;
    const g = new THREE.Group();
    m.position.y = -H / 2;
    g.add(m);
    return g;
  }
  function gitterbox(x, z, ry, oben = 0, inhalt = 'kleinteile', randFrei = false, fest = false) {
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
    // Inhalt aufschichten (ohne Durchdringung), innerhalb der Wände, bis knapp über den Rand (oder bündig, wenn eine
    // zweite Box draufkommt)
    const innenReg = belegung();
    const innenDrin = (e) => {
      const [ux, uz] = achsen(e.yaw);
      return [[1, 1], [1, -1], [-1, 1], [-1, -1]].every(([a, b]) => Math.abs(e.cx + ux[0] * e.hx * a + uz[0] * e.hz * b) < GB / 2 - 0.035 && Math.abs(e.cz + ux[1] * e.hx * a + uz[1] * e.hz * b) < GT / 2 - 0.035);
    };
    const oberkante = randFrei ? GH - 0.04 : GH + 0.12;
    const rein = (teil, kipp) => {
      const holder = new THREE.Group();
      teil.rotation.x = (r() - 0.5) * kipp; teil.rotation.z = (r() - 0.5) * kipp;
      holder.add(teil);
      for (let v = 0; v < 8; v++) if (platziere(innenReg, g, holder, (r() - 0.5) * (GB - 0.3), (r() - 0.5) * (GT - 0.3), r() * 6.28, { stapel: true, boden: FUSS + 0.075, maxY: oberkante, drin: innenDrin, sf: 0.7, einsinken: 0.25 })) return;
    };
    if (inhalt === 'federn') {
      // randvoll mit Autofedern, kreuz und quer
      for (let i = 0; i < 40; i++) rein(autofeder(), 2.2);
    } else if (inhalt === 'felgen') {
      // nur Stahlfelgen (schwarz, Rost), chaotisch reingeworfen: schief, verkantet, übereinander
      for (let i = 0; i < 14; i++) rein(felge(0x1d1d1f, true), 1.2);
    } else {
      // größere Einzelteile, durcheinander im ganzen Kasten verteilt (unten dichter, oben ein Haufen über den Rand)
      const teile = [0x8a4a2a, 0x7c7670, 0x9a9da2, 0x6e5a4a, 0x5a4a40, 0x7a3e22];
      const fb = () => teile[Math.floor(r() * teile.length)];
      const stueck = () => {
        const a = r(), f = fb();
        let m;
        if (a < 0.14) { // Zahnrad mit Bohrung
          m = new THREE.Group();
          const R = 0.07 + r() * 0.08;
          m.add(zylinder(R, R, 0.03, f, { umriss: 0.002 }, 18));
          m.add(setze(zylinder(R * 0.3, R * 0.3, 0.032, 0x2a2622, { umriss: false }, 10), 0, 0, 0));
          for (let k = 0; k < 16; k++) { const w = k / 16 * 6.28; m.add(setze(quader(0.02, 0.03, 0.02, f, { umriss: false }), Math.cos(w) * (R + 0.008), 0, Math.sin(w) * (R + 0.008), 0, -w, 0)); }
        } else if (a < 0.26) m = zylinder(0.03 + r() * 0.04, 0.03 + r() * 0.04, 0.2 + r() * 0.35, f, { umriss: 0.002 }, 10); // Rohrabschnitt, Welle
        else if (a < 0.38) { // Flansch mit Lochkreis
          m = new THREE.Group();
          const R = 0.08 + r() * 0.06;
          m.add(zylinder(R, R, 0.025, f, { umriss: 0.002 }, 18));
          m.add(setze(zylinder(R * 0.45, R * 0.45, 0.08, f, { umriss: 0.002 }, 14), 0, 0.04, 0));
          for (let k = 0; k < 6; k++) { const w = k / 6 * 6.28; m.add(setze(zylinder(0.01, 0.01, 0.027, 0x2a2622, { umriss: false }, 6), Math.cos(w) * R * 0.75, 0, Math.sin(w) * R * 0.75)); }
        } else if (a < 0.5) { // Winkel, Halterung
          m = new THREE.Group();
          const l = 0.15 + r() * 0.2;
          m.add(quader(l, 0.008, 0.06, f, { umriss: 0.002 }));
          m.add(setze(quader(0.008, l * 0.6, 0.06, f, { umriss: 0.002 }), -l / 2, l * 0.3, 0));
          for (const x of [-l * 0.2, l * 0.25]) m.add(setze(zylinder(0.008, 0.008, 0.01, 0x2a2622, { umriss: false }, 6), x, 0.005, 0));
        } else if (a < 0.6) m = quader(0.15 + r() * 0.25, 0.008, 0.1 + r() * 0.2, f, { umriss: 0.002 }); // Blechzuschnitt
        else if (a < 0.68) { // Kette
          m = new THREE.Group();
          for (let k = 0; k < 8; k++) m.add(setze(teil(new THREE.TorusGeometry(0.022, 0.006, 4, 8), 0x7c7670, { umriss: false }), k * 0.034, Math.sin(k) * 0.02, 0, k % 2 ? Math.PI / 2 : 0, 0, 0));
        } else if (a < 0.76) { // Kugellager groß
          m = new THREE.Group();
          m.add(teil(new THREE.TorusGeometry(0.07, 0.018, 6, 16), 0xc0c4c8, { umriss: 0.002 }));
          m.add(teil(new THREE.TorusGeometry(0.04, 0.012, 6, 14), 0x9a9da2, { umriss: false }));
        } else if (a < 0.84) { // Scharnier groß
          m = new THREE.Group();
          for (const sx of [-1, 1]) m.add(setze(quader(0.08, 0.006, 0.12, f, { umriss: 0.001 }), sx * 0.045, 0, 0, 0, 0, sx * 0.4));
          m.add(setze(zylinder(0.012, 0.012, 0.12, f, { umriss: false }, 8), 0, 0.01, 0, Math.PI / 2, 0, 0));
        } else if (a < 0.92) { // Schraubzwinge / Bügel
          m = new THREE.Group();
          m.add(quader(0.22, 0.02, 0.025, f, { umriss: 0.001 }));
          m.add(setze(quader(0.02, 0.1, 0.025, f, { umriss: 0.001 }), -0.1, 0.05, 0));
          m.add(setze(quader(0.02, 0.1, 0.025, f, { umriss: 0.001 }), 0.06, 0.05, 0));
          m.add(setze(zylinder(0.006, 0.006, 0.14, 0x9a9da2, { umriss: false }, 6), 0.06, 0.08, 0));
        } else { // Gussteil, Klotz
          m = quader(0.08 + r() * 0.1, 0.06 + r() * 0.08, 0.08 + r() * 0.1, 0x5a5e62, { umriss: 0.002 });
        }
        return m;
      };
      g.add(setze(quader(GB - 0.08, 0.03, GT - 0.08, 0x3a342e, { umriss: false }), 0, FUSS + 0.06, 0));
      for (let i = 0; i < 140; i++) rein(stueck(), 2.4);
    }
    const h = new THREE.Group();
    h.add(g);
    merke(h, 'gitterbox', 'Gitterbox', null);
    return oben ? draufstellen(h, x, z, ry) : fest ? legenFest(h, x, z, ry) : legen(h, x, z, ry);
  }

  // Haufen und Teile im Schrottplatz (der Gang bei x -3,5 … -2,3 bleibt frei): dicht an dicht, gehäuft
  gitterbox(-4.45, -4.95, 0.0, 0, 'felgen', false, true); // neben der Hintertür
  gitterbox(-6.0, -9.85, 0.05, 0, 'federn');
  kicker(-5.6, -6.6, 0.3);
  gitterbox(-7.6, -9.5, -0.04, 0, 'kleinteile', true); gitterbox(-7.6, -9.5, -0.04, 1);
  treckerreifen(-9.9, -9.4); // zuerst: braucht am meisten Platz
  felgenStapel(-10.6, -9.9, 6); felgenStapel(-10.05, -10.0, 4); felgenStapel(-5.6, -4.95, 5);
  reifenStapel(-10.9, -8.6, 5); reifenStapel(-10.85, -7.9, 3); reifenStapel(-10.6, -4.9, 2, true);
  fahrrad(-10.85, -6.2, 0.1, true, 0x2f5fa8);
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
  for (const [x, z] of [[-3.9, -5.3], [-4.0, -7.8], [-6.1, -10.35], [-8.9, -10.4], [-10.9, -5.6], [-11.0, -8.0], [-7.6, -4.7], [-3.95, -9.5], [-6.9, -10.2], [-10.5, -8.6]]) blechle(x, z);
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
    // kleiner Haufen Schrauben, Muttern und Scheiben am Rand zum Gang (aufgeschichtet, nichts steckt ineinander)
    const g = new THREE.Group();
    const reg = belegung();
    for (let i = 0; i < 70; i++) {
      const f = [0x9a9da2, 0x7c7670, 0x8a4a2a, 0xb79a3c][Math.floor(r() * 4)];
      let m;
      if (r() < 0.6) { m = new THREE.Group(); const l = 0.05 + r() * 0.06; m.add(setze(zylinder(0.006, 0.006, l, f, { umriss: false }, 6), l / 2, 0.006, 0, 0, 0, Math.PI / 2)); m.add(setze(zylinder(0.012, 0.012, 0.008, f, { umriss: false }, 6), l, 0.006, 0, 0, 0, Math.PI / 2)); }
      else m = zylinder(0.013, 0.013, 0.01, f, { umriss: false }, 6);
      const w = r() * Math.PI * 2, d = Math.pow(r(), 0.8) * 0.2;
      platziere(reg, g, m, Math.cos(w) * d, Math.sin(w) * d, r() * 6.28, { stapel: true, maxY: 0.02 + (0.22 - d) * 0.5 });
    }
    // als Ganzes auf den Schrottplatz
    legen(g, -3.95, -8.55, 0);
    merke(g, 'schrauben', 'Schraubenhaufen', null);
  }
  // weißer Stepper (Heimtrainer), kaputt auf dem Schrottplatz: steht schief, ein Pedal fehlt (liegt daneben), der andere
  // Hebel hängt durch, Display gesprungen. Lenker: Säule mit Gabelkopf, gebogener Bügel aus einem Rohr (Rundungen),
  // Schaumgriffe mit Endkappen, Pulssensoren aus Blech, Kabel zum Display, Konsole mit Tasten
  {
    const g = new THREE.Group(), WEISS = 0xf0eee8, GRAU = 0x5a5e62, weissMat = toon(WEISS);
    g.add(setze(quader(0.5, 0.06, 0.75, WEISS, { umriss: 0.003 }), 0, 0.05, 0));
    for (const sz of [-0.3, 0.3]) g.add(setze(quader(0.62, 0.04, 0.08, WEISS, { umriss: 0.002 }), 0, 0.03, sz));
    for (const sz of [-0.3, 0.3]) for (const sx of [-0.3, 0.3]) g.add(setze(zylinder(0.025, 0.025, 0.04, 0x2a2a2c, { umriss: false }, 8), sx, 0.02, sz, 0, 0, Math.PI / 2)); // Gummikappen
    // linker Hebel mit Pedal (durchgesackt), rechter Hebel ohne Pedal
    g.add(setze(quader(0.07, 0.05, 0.5, WEISS, { umriss: 0.002 }), -0.11, 0.12, 0.02, 0.18, 0, 0));
    { const p = new THREE.Group(); p.add(quader(0.15, 0.03, 0.3, GRAU, { umriss: 0.002 })); for (let k = 0; k < 7; k++) p.add(setze(quader(0.13, 0.006, 0.012, 0x2a2a2c, { umriss: false }), 0, 0.017, -0.12 + k * 0.04)); p.position.set(-0.11, 0.1, 0.12); p.rotation.x = 0.18; g.add(p); }
    g.add(setze(quader(0.07, 0.05, 0.5, WEISS, { umriss: 0.002 }), 0.11, 0.2, 0.02, -0.12, 0, 0));
    g.add(setze(zylinder(0.012, 0.012, 0.03, 0x8c8f94, { umriss: false }, 6), 0.11, 0.24, 0.2)); // Bolzen ohne Pedal
    for (const sx of [-1, 1]) {
      g.add(setze(zylinder(0.018, 0.018, 0.22, 0x1d1d1f, { umriss: 0.002 }, 10), sx * 0.11, 0.18, -0.24, 0.5, 0, 0)); // Zylinder
      g.add(setze(zylinder(0.008, 0.008, 0.1, 0xc0c4c8, { umriss: false }, 6), sx * 0.11, 0.25, -0.18, 0.5, 0, 0));
    }
    // Säule mit Verstellung
    g.add(setze(quader(0.07, 0.95, 0.07, WEISS, { umriss: 0.003 }), 0, 0.55, -0.34, -0.12, 0, 0));
    g.add(setze(zylinder(0.022, 0.022, 0.05, 0x2a2a2c, { umriss: false }, 10), 0, 0.5, -0.29, Math.PI / 2 - 0.12, 0, 0)); // Klemmknauf
    // Konsole: Gehäuse, gesprungenes Display, drei Tasten
    const dispTex = leinwandTextur(96, 48, (cg, b, h) => {
      cg.fillStyle = '#7a8a7a'; cg.fillRect(0, 0, b, h);
      cg.fillStyle = '#2a3a2a'; cg.font = 'bold 16px monospace'; cg.fillText('0:00', 8, 28);
      cg.strokeStyle = '#f0f0f0'; cg.lineWidth = 1.5; cg.beginPath(); cg.moveTo(60, 0); cg.lineTo(48, 20); cg.lineTo(70, 30); cg.lineTo(56, 48); cg.moveTo(48, 20); cg.lineTo(30, 26); cg.stroke();
    });
    const kon = new THREE.Group();
    kon.add(quader(0.2, 0.12, 0.06, WEISS, { umriss: 0.002 }));
    const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), toon(0xffffff, { map: dispTex })); disp.position.set(0, 0.015, 0.031); kon.add(disp);
    for (let k = 0; k < 3; k++) kon.add(setze(zylinder(0.008, 0.008, 0.006, [0xc8382c, 0x2f6b3a, 0x2f5fa8][k], { umriss: false }, 8), -0.04 + k * 0.04, -0.035, 0.032, Math.PI / 2, 0, 0));
    kon.position.set(0, 1.05, -0.4); kon.rotation.x = -0.5;
    g.add(kon);
    // Lenkerbügel: ein durchgehend gebogenes Rohr (U mit Rundungen, Enden leicht nach oben)
    const pfad = new THREE.CatmullRomCurve3([[-0.3, 0.06, 0.18], [-0.31, 0.0, 0.05], [-0.28, -0.02, -0.03], [-0.18, -0.02, -0.05], [0, -0.02, -0.06], [0.18, -0.02, -0.05], [0.28, -0.02, -0.03], [0.31, 0.0, 0.05], [0.3, 0.06, 0.18]].map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, 'centripetal');
    const buegel = new THREE.Mesh(new THREE.TubeGeometry(pfad, 48, 0.016, 8, false), weissMat);
    buegel.castShadow = true; umrissLinie(buegel, 0.002);
    const lk = new THREE.Group();
    lk.add(buegel);
    lk.add(setze(quader(0.08, 0.06, 0.06, WEISS, { umriss: 0.002 }), 0, -0.03, -0.06)); // Gabelkopf an der Säule
    for (const sx of [-1, 1]) {
      lk.add(setze(zylinder(0.026, 0.026, 0.12, 0x2a2a2c, { umriss: 0.001 }, 10), sx * 0.305, 0.04, 0.13, Math.PI / 2 - 0.45, 0, 0)); // Schaumgriff
      lk.add(setze(zylinder(0.028, 0.028, 0.012, 0x3a3a3c, { umriss: false }, 10), sx * 0.3, 0.065, 0.185, Math.PI / 2 - 0.45, 0, 0)); // Endkappe
      lk.add(setze(quader(0.035, 0.012, 0.07, 0xc0c4c8, { umriss: 0.001 }), sx * 0.29, 0.005, 0.0, 0, 0, 0)); // Pulssensor
      lk.add(setze(zylinder(0.003, 0.003, 0.25, 0x1d1d1f, { umriss: false }, 4), sx * 0.15, 0.02, -0.1, 0.3, 0, sx * 1.2)); // Kabel
    }
    lk.position.set(0, 1.0, -0.36); lk.rotation.set(0.15, 0, 0.18); // verbogen
    g.add(lk);
    // Schmutz, Rostflecken an den Schrauben
    for (let i = 0; i < 8; i++) g.add(setze(quader(0.02 + r() * 0.04, 0.02, 0.01, 0x8a7a62, { umriss: false }), (r() - 0.5) * 0.4, 0.09, 0.36));
    for (let i = 0; i < 5; i++) g.add(setze(quader(0.03, 0.03, 0.005, 0x8a4a2a, { umriss: false }), (r() - 0.5) * 0.45, 0.06, 0.377));
    g.rotation.z = 0.12; // steht schief
    const h = new THREE.Group(); h.add(g);
    merke(h, 'stepper', 'Stepper', null);
    legen(h, -6.85, -5.05, 0.5);
    // das abgefallene Pedal liegt daneben
    const pd = new THREE.Group(); pd.add(quader(0.15, 0.03, 0.3, GRAU, { umriss: 0.002 })); for (let k = 0; k < 7; k++) pd.add(setze(quader(0.13, 0.006, 0.012, 0x2a2a2c, { umriss: false }), 0, 0.017, -0.12 + k * 0.04));
    pd.position.y = 0.02; pd.rotation.z = 0.2;
    const ph = new THREE.Group(); ph.add(pd); legen(ph, -7.5, -4.8, 1.2);
  }
  // Gitterkisten voller Kleinteile (eine steht auf einer anderen)
  // (vor dem Container bleibt alles frei, dort muss man später ran) – diese Teile liegen mit beim großen Haufen
  felgenStapel(-9.6, -5.0, 4); gasflasche(-7.4, -10.1, 0x8c8f94, false);
  // zuletzt die Haufen: Profile und Rohre schichten sich um und auf das, was schon steht (große Teile: nur obendrauf, nie hinein)
  altmetall(-8.0, -7.9, 2.0, 1.8, 75, 1.0);
  altmetall(-6.3, -6.7, 1.1, 1.1, 50, 0.8);
  altmetall(-10.0, -5.6, 1.1, 0.9, 38, 0.7);
  if (weggelassen) console.info('[platzhinten] Schrott ohne Platz weggelassen:', weggelassen, fehlend.join(' '));
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
    // Innen: an der Rückwand drei gelbe Fachbodenregale mit größeren Teilen (Kisten mit Schraubenschlüsseln, Motor,
    // Hinterachse, Kanister); davor ein Kragarmregal mit den Metalllängen (5,85 m: passen gerade so rein)
    const GELB = 0xe8b820, BODEN0 = 0.165;
    const RT = 0.5, RH = 2.05, RB = 1.8, RZ = T / 2 - 0.12 - RT / 2;
    const regalAn = (cx) => {
      const rg = new THREE.Group();
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        rg.add(setze(quader(0.05, RH, 0.05, GELB, { umriss: 0.002 }), sx * (RB / 2 - 0.025), RH / 2, sz * (RT / 2 - 0.025)));
        for (let k = 0; k < 14; k++) rg.add(setze(quader(0.012, 0.025, 0.004, 0x1d1d1f, { umriss: false }), sx * (RB / 2 - 0.025), 0.15 + k * 0.13, sz * (RT / 2 - 0.025) - sz * 0.027)); // Lochung
      }
      for (const sx of [-1, 1]) for (const y of [0.4, 1.4]) rg.add(setze(quader(0.012, 0.6, 0.012, GELB, { umriss: false }), sx * (RB / 2 - 0.025), y, 0, 0.7, 0, 0)); // Diagonalen
      const ebenen = [0.12, 0.72, 1.32, 1.92];
      for (const y of ebenen) {
        for (const sz of [-1, 1]) rg.add(setze(quader(RB, 0.05, 0.03, GELB, { umriss: 0.002 }), 0, y, sz * (RT / 2 - 0.02)));
        rg.add(setze(quader(RB - 0.06, 0.02, RT - 0.04, 0x9a9da2, { umriss: 0.002 }), 0, y + 0.035, 0));
      }
      rg.position.set(cx, BODEN0, RZ);
      c.add(rg);
      return ebenen.map((y) => BODEN0 + y + 0.045);
    };
    const eb = [-2.0, 0, 2.0].map(regalAn);
    // Kiste (Eurobox) mit Schraubenschlüsseln, die herausschauen
    // Schraubenschlüssel (Ring-/Maulschlüssel) einzeln
    const schluesselTeil = (l) => {
      const sk = new THREE.Group();
      sk.add(setze(quader(0.022, l, 0.006, 0xc0c4c8, { umriss: 0.001 }), 0, l / 2, 0));
      sk.add(setze(teil(new THREE.TorusGeometry(0.02, 0.007, 4, 8, Math.PI * 1.4), 0xc0c4c8, { umriss: false }), 0, l + 0.012, 0, 0, 0, 0.9));
      sk.add(setze(teil(new THREE.TorusGeometry(0.016, 0.006, 4, 8), 0xc0c4c8, { umriss: false }), 0, -0.01, 0));
      return sk;
    };
    // Kiste (Eurobox) mit Schraubenschlüsseln kreuz und quer, schräg hingestellt; umgekippt: liegt auf der Seite,
    // Schlüssel davor verstreut
    const kiste = (x, y, z, farbe, umgekippt = false) => {
      const k = new THREE.Group();
      k.add(setze(quader(0.4, 0.02, 0.3, farbe, { umriss: 0.002 }), 0, 0.01, 0));
      for (const sz of [-1, 1]) k.add(setze(quader(0.4, 0.22, 0.015, farbe, { umriss: 0.002 }), 0, 0.11, sz * 0.145));
      for (const sx of [-1, 1]) k.add(setze(quader(0.015, 0.22, 0.3, farbe, { umriss: 0.002 }), sx * 0.195, 0.11, 0));
      const n = umgekippt ? 2 : 6 + Math.floor(r() * 4);
      for (let i = 0; i < n; i++) {
        const l = 0.16 + r() * 0.16, sk = schluesselTeil(l);
        sk.position.set(-0.15 + r() * 0.3, 0.03, (r() - 0.5) * 0.2);
        sk.rotation.set((r() - 0.5) * 1.0, r() * 6, (r() - 0.5) * 1.2);
        if (r() < 0.25) { sk.rotation.set(Math.PI / 2 - 0.2, r() * 6, 0); sk.position.y = 0.2; } // liegt quer obendrauf
        k.add(sk);
      }
      if (umgekippt) {
        k.rotation.set(-Math.PI / 2, 0, 0); // auf die Rückwand gekippt, Öffnung nach vorn
        k.position.set(x, y + 0.15, z + 0.05);
        for (let i = 0; i < 5; i++) { const sk = schluesselTeil(0.15 + r() * 0.15); sk.rotation.set(Math.PI / 2, r() * 6, 0); sk.position.set(x - 0.2 + r() * 0.45, y + 0.01, z - 0.12 - r() * 0.1); c.add(sk); }
      } else {
        k.position.set(x, y, z);
        k.rotation.set(0, (r() - 0.5) * 0.6, (r() - 0.5) * 0.12);
      }
      c.add(k);
    };
    kiste(-2.5, eb[0][1], RZ, 0x2f5fa8); kiste(-2.0, eb[0][1], RZ, 0xc8382c, true); kiste(-1.5, eb[0][1], RZ, 0x5a5e62);
    kiste(-2.4, eb[0][2], RZ, 0x5a5e62); kiste(-1.85, eb[0][2], RZ, 0x2f5fa8);
    kiste(1.6, eb[2][2], RZ, 0xc8382c); kiste(2.2, eb[2][3], RZ, 0x2f5fa8); kiste(-0.5, eb[1][3], RZ, 0x5a5e62);
    // Motor (Vierzylinder) auf dem untersten Boden des mittleren Regals
    {
      const mo = new THREE.Group(), GUSS = 0x6e6a64;
      mo.add(setze(quader(0.55, 0.3, 0.32, GUSS, { umriss: 0.003 }), 0, 0.2, 0)); // Block
      mo.add(setze(quader(0.53, 0.1, 0.26, 0x5a5650, { umriss: 0.002 }), 0, 0.4, 0)); // Kopf
      mo.add(setze(quader(0.5, 0.06, 0.2, 0x2a2a2c, { umriss: 0.002 }), 0, 0.48, 0)); // Ventildeckel
      mo.add(setze(zylinder(0.015, 0.015, 0.04, 0xd8b23a, { umriss: false }, 8), 0.1, 0.53, 0)); // Öldeckel
      mo.add(setze(quader(0.48, 0.08, 0.26, 0x3a3a3c, { umriss: 0.002 }), 0, 0.03, 0)); // Ölwanne
      for (let k = 0; k < 4; k++) mo.add(setze(zylinder(0.025, 0.025, 0.14, 0x7a7e84, { umriss: false }, 8), -0.18 + k * 0.12, 0.38, 0.19, Math.PI / 2 - 0.4, 0, 0)); // Krümmer
      mo.add(setze(zylinder(0.08, 0.08, 0.04, 0x3a3a3c, { umriss: 0.001 }, 14), 0.3, 0.2, 0, 0, 0, Math.PI / 2)); // Riemenscheibe
      mo.add(setze(zylinder(0.15, 0.15, 0.03, 0x5a5e62, { umriss: 0.001 }, 18), -0.3, 0.2, 0, 0, 0, Math.PI / 2)); // Schwungscheibe
      mo.add(setze(teil(new THREE.TorusGeometry(0.06, 0.008, 4, 12), 0x1d1d1f, { umriss: false }), 0.3, 0.3, 0.03, 0, Math.PI / 2, 0)); // Keilriemen
      mo.position.set(0, eb[1][0], RZ);
      c.add(mo);
    }
    // Hinterachse auf dem untersten Boden des rechten Regals: Achsrohr, Differenzial, Trommeln, Federaufnahmen
    {
      const ha = new THREE.Group();
      ha.add(setze(zylinder(0.04, 0.045, 1.6, 0x3a3634, { umriss: 0.002 }, 12), 0, 0.15, 0, 0, 0, Math.PI / 2));
      const diff = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), toon(0x3a3634)); diff.scale.set(0.8, 1, 1); diff.position.set(0.15, 0.15, 0); umrissLinie(diff, 0.002); ha.add(diff);
      ha.add(setze(zylinder(0.14, 0.14, 0.03, 0x5a5650, { umriss: 0.001 }, 16), 0.15, 0.15, -0.1, Math.PI / 2, 0, 0)); // Deckel
      ha.add(setze(zylinder(0.03, 0.035, 0.14, 0x5a5650, { umriss: 0.001 }, 10), 0.15, 0.15, 0.17, Math.PI / 2, 0, 0)); // Flansch
      for (const sx of [-1, 1]) {
        ha.add(setze(zylinder(0.12, 0.12, 0.08, 0x7a3e22, { umriss: 0.002 }, 16), sx * 0.8, 0.15, 0, 0, 0, Math.PI / 2)); // Trommel
        for (let k = 0; k < 5; k++) { const w = k / 5 * 6.28; ha.add(setze(zylinder(0.008, 0.008, 0.04, 0x9a9da2, { umriss: false }, 6), sx * 0.85, 0.15 + Math.cos(w) * 0.06, Math.sin(w) * 0.06, 0, 0, Math.PI / 2)); }
        ha.add(setze(quader(0.08, 0.04, 0.12, 0x3a3634, { umriss: 0.001 }), sx * 0.5, 0.2, 0)); // Federaufnahme
      }
      ha.position.set(2.0, eb[2][0] - 0.03, RZ);
      c.add(ha);
    }
    // Kanister und Ölflaschen
    for (const [x, f] of [[-0.6, 0xc8382c], [-0.25, 0x2f6b3a]]) c.add(setze(quader(0.18, 0.3, 0.28, f, { umriss: 0.002 }), x, eb[1][1] + 0.15, RZ));
    for (let k = 0; k < 5; k++) c.add(setze(zylinder(0.04, 0.04, 0.24, [0x1d1d1f, 0xd8b23a, 0x2f5fa8][k % 3], { umriss: 0.001 }, 10), 0.3 + k * 0.1, eb[1][2] + 0.12, RZ + 0.05));
    // etwas Müll und Metallteile auf dem Containerboden (vorn, vor den Regalfüßen)
    for (let i = 0; i < 12; i++) {
      const a = r();
      const t = a < 0.35 ? kleinteil() : a < 0.65 ? werkzeug() : (() => { const b = new THREE.Group(); b.add(teil(new THREE.BoxGeometry(0.15 + r() * 0.25, 0.006, 0.1 + r() * 0.2), 0, { material: rm(), umriss: 0.002 })); return b; })();
      t.position.set(-2.7 + r() * 5.4, BODEN0 + 0.012, -T / 2 + 0.3 + r() * 0.6);
      t.rotation.y = r() * 6;
      c.add(t);
    }
    { // Putzlappen
      const l = new THREE.Mesh(new THREE.CircleGeometry(0.12, 7), toon(0x9a3a2a, { side: THREE.DoubleSide }));
      l.rotation.x = -Math.PI / 2; l.scale.set(1.3, 0.8, 1); l.position.set(0.9, BODEN0 + 0.014, -T / 2 + 0.55); c.add(l);
    }
    // Kragarmregal davor: Säulen mit Fuß nach vorn, Arme mit hochgebogener Spitze, darauf die Längen
    const KZ = RZ - RT / 2 - 0.12, ARM = 0.75, KR = 0x3a4a5a;
    const armY = [0.55, 1.05, 1.55];
    for (const x of [-2.5, -0.85, 0.85, 2.5]) {
      c.add(setze(quader(0.12, 1.75, 0.14, KR, { umriss: 0.002 }), x, BODEN0 + 0.875, KZ));
      c.add(setze(quader(0.1, 0.1, ARM + 0.2, KR, { umriss: 0.002 }), x, BODEN0 + 0.05, KZ - (ARM + 0.2) / 2)); // Fuß
      for (const y of armY) {
        c.add(setze(quader(0.06, 0.06, ARM, KR, { umriss: 0.002 }), x, BODEN0 + y, KZ - ARM / 2 - 0.07));
        c.add(setze(quader(0.06, 0.08, 0.04, KR, { umriss: 0.001 }), x, BODEN0 + y + 0.06, KZ - ARM - 0.05)); // Spitze
      }
    }
    const LANG = 5.85;
    const STAHL = [0x6e6a64, 0x5e5a56, 0x7c7670, 0x8a5a3a];
    const auf = (y) => BODEN0 + y + 0.03;
    // unten: Doppel-T-Träger
    for (let i = 0; i < 4; i++) {
      const z = KZ - 0.15 - i * 0.16, f = STAHL[i % 4];
      const tr = new THREE.Group();
      tr.add(setze(quader(LANG, 0.012, 0.12, f, { umriss: 0.002 }), 0, 0.006, 0));
      tr.add(setze(quader(LANG, 0.012, 0.12, f, { umriss: 0.002 }), 0, 0.154, 0));
      tr.add(setze(quader(LANG, 0.14, 0.008, f, { umriss: false }), 0, 0.08, 0));
      tr.position.set((r() - 0.5) * 0.04, auf(armY[0]), z);
      c.add(tr);
    }
    // Mitte: Vierkantrohre und Rundrohre
    for (let i = 0; i < 5; i++) c.add(setze(quader(LANG, 0.08, 0.08, STAHL[(i + 1) % 4], { umriss: 0.002 }), (r() - 0.5) * 0.03, auf(armY[1]) + 0.04, KZ - 0.13 - i * 0.1));
    for (let i = 0; i < 6; i++) c.add(setze(zylinder(0.04, 0.04, LANG, STAHL[(i + 2) % 4], { umriss: 0.002 }, 10), (r() - 0.5) * 0.03, auf(armY[1]) + 0.12, KZ - 0.15 - i * 0.09, 0, 0, Math.PI / 2));
    // oben: Flachstahl und Winkel
    for (let i = 0; i < 8; i++) c.add(setze(quader(LANG - r() * 0.6, 0.012, 0.06, STAHL[i % 4], { umriss: 0.001 }), (r() - 0.5) * 0.3, auf(armY[2]) + 0.006 + (i % 3) * 0.012, KZ - 0.12 - i * 0.07, 0, (r() - 0.5) * 0.02, 0));
    merke(c, 'container', 'Container', null);
    hindernis(K.xMin, K.xMax, K.zMin, K.zMax);
  }

  return { gruppe, CARPORT, BUCHTEN, HINTERTUER, SCHROTT_KAESTEN, CARPORT_PFOSTEN };
}
