// Platz hinter der Werkstatt (Paket E2a): Schotterfläche, Weg vom alten Hoflader-Platz nach hinten, Carport mit drei
// beschrifteten Buchten (Paletten, Weidemann, Pritsche) und dazwischen ein Schrottplatz mit schmalem Gang von der
// Hintertür (grüne Tür an der Rückwand) bis zur Fahrspur, die zum Carport führt.
// Blick von hinten auf die Werkstatt: das Carport steht rechts neben dem Schrottplatz (Welt -x).
import * as THREE from 'three';
import { toon, teil, quader, zylinder, setze, leinwandTextur, zufall } from './toon.js';

// Hintertür in der Rückwand (z = -4): Öffnung x -3,45 … -2,35, 2,15 m hoch (dort hing früher der Hula-Hoop-Reifen)
export const HINTERTUER = { x0: -3.45, x1: -2.35, hoehe: 2.15, mitte: -2.9 };
// Schotter hinter dem Haus und der Weg rechts am Haus entlang (dort parkte früher der Hoflader)
export const SCHOTTER = { x0: -17.0, x1: 10.4, z0: -26.0, z1: -4.1 };
export const SCHOTTER_WEG = { x0: 5.6, x1: 10.0, z0: -4.1, z1: 3.8 };
// Carport: Reihenfolge vom Haus weg Werkstatt, Schrottplatz, Carport (Betreiber 9.11.); längs gestellt, drei Buchten
// hintereinander (vom Haus weg): Pritsche, Paletten, Weidemann. Offen zum Gang (Welt +x, Schilder an dieser Seite) und
// nach hinten (Welt -x). Der Gang von der Hintertür endet direkt am Carport. Gebaut wird es lokal (Länge entlang lokal x, Öffnung lokal +z) und gedreht:
// lokal (X, Z) -> Welt (CX + Z, CZ - X).
export const CARPORT = { x0: -6.0, x1: -1.4, z0: -21.6, z1: -11.1, hoehe: 3.2 };
const CL = CARPORT.z1 - CARPORT.z0, CD = CARPORT.x1 - CARPORT.x0;
const CX = (CARPORT.x0 + CARPORT.x1) / 2, CZ = (CARPORT.z0 + CARPORT.z1) / 2;
const BB = CL / 3;
const zuWelt = (X, Z) => ({ x: CX + Z, z: CZ - X });
const bucht = (i) => ({ x: CX, z: CZ - (-CL / 2 + BB * (i + 0.5)), hx: CD / 2, hz: BB / 2 - 0.15 });
export const BUCHTEN = { pritsche: bucht(0), paletten: bucht(1), weidemann: bucht(2) };
// Pfosten (Welt), für Hindernisse und Wege
export const CARPORT_PFOSTEN = [0, 1, 2, 3].flatMap((i) => [CD / 2, -CD / 2].map((Z) => zuWelt(-CL / 2 + i * BB, Z)));
// Schrottplatz: Kästen, in denen Schrott liegt (Figuren und Fahrzeuge kommen da nicht durch). Dazwischen bleibt der
// Gang von der Hintertür (x ≈ -2,9) zwischen Schrott und Container frei bis zur Fahrspur (z -12,4 … -9,8), die direkt zum Carport führt.
// Blauer 20-Fuß-Container Rücken an Rücken an der Rückwand, rechts von der Hintertür (von hinten gesehen links davon),
// Längsseite zum Hof ganz offen; innen Metalllängen bis 6 m (Paket E2a, noch ohne Funktion)
export const CONTAINER = { xMin: -1.6, xMax: 4.46, zMin: -6.6, zMax: -4.1, hoehe: 2.59 };
export const SCHROTT_KAESTEN = [
  { xMin: -14.8, xMax: -3.75, zMin: -10.4, zMax: -4.5 },
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
  const flaeche = (f, y) => {
    const t = schotterTex.clone();
    t.needsUpdate = true;
    t.repeat.set((f.x1 - f.x0) / 4, (f.z1 - f.z0) / 4);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.x1 - f.x0, f.z1 - f.z0), toon(0xffffff, { map: t }));
    m.rotation.x = -Math.PI / 2;
    m.position.set((f.x0 + f.x1) / 2, y, (f.z0 + f.z1) / 2);
    m.receiveShadow = true;
    gruppe.add(m);
  };
  flaeche(SCHOTTER, 0.008);
  flaeche(SCHOTTER_WEG, 0.009);
  // Fahrspuren im Schotter (dunkler, festgefahren): den Weg runter, hinterm Haus entlang zum Carport
  const spur = (x0, z0, x1, z1) => {
    const l = Math.hypot(x1 - x0, z1 - z0);
    for (const s of [-0.55, 0.55]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, l), toon(0x7d776b, { transparent: true, opacity: 0.55 }));
      m.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0));
      const nx = (z1 - z0) / l, nz = -(x1 - x0) / l;
      m.position.set((x0 + x1) / 2 + nx * s, 0.011, (z0 + z1) / 2 + nz * s);
      gruppe.add(m);
    }
  };
  spur(7.8, 3.2, 8.6, -7.5);
  spur(8.6, -7.5, 4.5, -15.0);
  spur(4.5, -15.0, CARPORT.x1 + 0.2, BUCHTEN.weidemann.z);
  // Rand: ein paar Grasbüschel und Steine, wo der Schotter an die Wiese stößt
  const buschel = toon(0x5d8a3a);
  for (let i = 0; i < 90; i++) {
    const seite = Math.floor(r() * 3);
    const x = seite === 0 ? SCHOTTER.x0 + r() * 0.5 : seite === 1 ? SCHOTTER.x1 - r() * 0.5 : SCHOTTER.x0 + r() * (SCHOTTER.x1 - SCHOTTER.x0);
    const z = seite === 2 ? SCHOTTER.z0 + r() * 0.5 : SCHOTTER.z0 + r() * (SCHOTTER.z1 - SCHOTTER.z0);
    const b = new THREE.Mesh(new THREE.ConeGeometry(0.08 + r() * 0.07, 0.18 + r() * 0.15, 5), buschel);
    b.position.set(x, 0.08, z);
    gruppe.add(b);
  }

  // ---------- Carport: Holzpfosten, Pfetten, Wellplatten-Dach (leicht nach hinten geneigt), Betonplatten, Schilder ----------
  // lokal gebaut: Länge entlang x (-L/2 … L/2), Tiefe entlang z, vorne (offen, Schilder) bei +z; dann gedreht
  const HOLZ = 0x8a6440, HOLZ_D = 0x6e4f33;
  const cp = new THREE.Group();
  cp.position.set(CX, 0, CZ);
  cp.rotation.y = Math.PI / 2;
  gruppe.add(cp);
  const L = CL, D = CD;
  const pfostenX = [0, 1, 2, 3].map((i) => -L / 2 + i * BB);
  const hVorne = CARPORT.hoehe, hHinten = CARPORT.hoehe - 0.35;
  for (const x of pfostenX) for (const [z, h] of [[D / 2, hVorne], [-D / 2, hHinten]]) {
    cp.add(setze(quader(0.14, h, 0.14, HOLZ, { umriss: 0.004 }), x, h / 2, z));
    cp.add(setze(quader(0.3, 0.08, 0.3, 0x8f8d86, { umriss: 0.002 }), x, 0.04, z)); // Fuß
  }
  for (const p of CARPORT_PFOSTEN) hindernis(p.x - 0.16, p.x + 0.16, p.z - 0.16, p.z + 0.16);
  // Pfetten vorne und hinten, Sparren quer
  cp.add(setze(quader(L + 0.5, 0.2, 0.14, HOLZ_D, { umriss: 0.004 }), 0, hVorne - 0.1, D / 2));
  cp.add(setze(quader(L + 0.5, 0.2, 0.14, HOLZ_D, { umriss: 0.004 }), 0, hHinten - 0.1, -D / 2));
  const tiefe = D + 0.6, neigung = Math.atan2(hVorne - hHinten, D);
  for (let k = 0; k <= 9; k++) {
    const x = -L / 2 - 0.2 + k * (L + 0.4) / 9;
    cp.add(setze(quader(0.08, 0.14, tiefe, HOLZ, { umriss: 0.003 }), x, (hVorne + hHinten) / 2 + 0.07, 0, neigung, 0, 0));
  }
  // Dach: Wellplatten (graugrün)
  const wellTex = leinwandTextur(256, 64, (g, b, h) => {
    for (let x = 0; x < b; x++) { const v = 150 + Math.sin(x / b * Math.PI * 16) * 30; g.fillStyle = `rgb(${v * 0.72},${v * 0.8},${v * 0.74})`; g.fillRect(x, 0, 1, h); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(60,70,50,0.25)'; g.fillRect(r() * b, r() * h, 2 + r() * 8, 1 + r() * 3); }
  });
  wellTex.wrapS = wellTex.wrapT = THREE.RepeatWrapping;
  wellTex.repeat.set((L + 0.8) / 2, 1);
  const dach = new THREE.Mesh(new THREE.BoxGeometry(L + 0.8, 0.04, tiefe + 0.2), toon(0xffffff, { map: wellTex }));
  dach.position.set(0, (hVorne + hHinten) / 2 + 0.17, 0);
  dach.rotation.x = neigung;
  dach.castShadow = true; dach.receiveShadow = true;
  cp.add(dach);
  merke(dach, 'carportHinten', 'Carport hinterm Haus', null);
  // Kopfbänder (schräge Streben) an den Pfosten vorne
  for (const x of pfostenX) for (const s of [-1, 1]) {
    if ((x === pfostenX[0] && s < 0) || (x === pfostenX[3] && s > 0)) continue;
    cp.add(setze(quader(0.08, 0.6, 0.08, HOLZ, { umriss: 0.003 }), x + s * 0.24, hVorne - 0.42, D / 2, 0, 0, -s * 0.78));
  }
  // Betonplatte unter dem Carport, weiße Trennstriche zwischen den Buchten
  const platte = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.4, D + 0.4), toon(0xa8a49a));
  platte.rotation.x = -Math.PI / 2;
  platte.position.set(0, 0.014, 0);
  platte.receiveShadow = true;
  cp.add(platte);
  for (const x of pfostenX.slice(1, 3)) cp.add(setze(quader(0.1, 0.01, D - 0.3, 0xece8dc, { umriss: false }), x, 0.02, 0));
  // Schilder oben an der vorderen Pfette (zum Schrottplatz hin), je Bucht eins
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
    s.position.set(-L / 2 + BB * (i + 0.5), hVorne - 0.42, D / 2 + 0.1);
    s.rotation.x = -0.08;
    cp.add(s);
    if (id) merke(s, id, name, null);
    return s;
  };
  schild('PRITSCHE', 0, null);
  schild('PALETTEN', 1, 'palettenSchild', 'Schild: Paletten');
  schild('WEIDEMANN', 2, null);
  // hinten in der Pritschen-Bucht (am Hausende): ein altes Kanister-Regal (nur Deko)
  {
    const regal = new THREE.Group();
    for (const x of [-0.45, 0.45]) for (const z of [-0.18, 0.18]) regal.add(setze(quader(0.05, 1.4, 0.05, 0x6a6e72, { umriss: 0.002 }), x, 0.7, z));
    for (const y of [0.15, 0.7, 1.25]) regal.add(setze(quader(0.96, 0.03, 0.42, 0x7a7e82, { umriss: 0.002 }), 0, y, 0));
    for (const [x, y, f] of [[-0.25, 0.32, 0xc8382c], [0.15, 0.32, 0x2f6b3a], [-0.1, 0.87, 0x2f5fa8], [0.28, 1.42, 0xd8b23a]]) regal.add(setze(quader(0.24, 0.32, 0.16, f, { umriss: 0.003 }), x, y, 0));
    regal.position.set(-L / 2 + 0.6, 0, -D / 2 + 0.35);
    cp.add(regal);
    const m = zuWelt(-L / 2 + 0.6, -D / 2 + 0.35);
    hindernis(m.x - 0.25, m.x + 0.25, m.z - 0.5, m.z + 0.5);
  }

  // ---------- Schrottplatz ----------
  const ROST = [0x8a4a2a, 0x7a3e22, 0x9a5a34, 0x6e5a4a, 0x5a4a40];
  const rost = () => ROST[Math.floor(r() * ROST.length)];
  const legen = (obj, x, z, ry = r() * Math.PI * 2) => { obj.position.set(x, obj.position.y, z); obj.rotation.y = ry; gruppe.add(obj); return obj; };
  // Schrotthaufen: aufgeschütteter Hügel (rostige Erde), darauf Bleche, Rohre, Vierkant, Träger, Winkel, Gitter und
  // Kleinkram kreuz und quer übereinander gehäuft; Höhe nach der Hügelform
  const erdeMat = toon(0x6a4a34);
  function altmetall(cx, cz, rx, rz, n, hoehe = 1.0) {
    const g = new THREE.Group();
    const huegel = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), erdeMat);
    huegel.scale.set(rx * 1.05, hoehe * 0.55, rz * 1.05);
    huegel.receiveShadow = true;
    g.add(huegel);
    const hoeheBei = (x, z) => Math.max(0, 1 - (x / rx) ** 2 - (z / rz) ** 2);
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
      } else if (art < 0.92) m = quader(0.15 + r() * 0.25, 0.1 + r() * 0.2, 0.15 + r() * 0.25, rost(), { umriss: 0.003 }); // Klotz, Kasten
      else m = zylinder(0.12 + r() * 0.1, 0.12 + r() * 0.1, 0.05, rost(), { umriss: 0.003 }, 12); // Scheibe, Deckel
      m.position.set(x, y, z);
      m.rotation.set((r() - 0.5) * 0.9 + (art >= 0.25 && art < 0.42 ? Math.PI / 2 : 0), r() * Math.PI, (r() - 0.5) * 0.7);
      g.add(m);
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
    g.add(setze(zylinder(0.014, 0.014, 0.5, 0x8c8f94, { umriss: 0.002 }, 6), 0.42, 0.98, 0, Math.PI / 2, 0.5, 0)); // Lenker schief
    g.position.y = liegt ? 0.03 : 0;
    g.rotation.set(liegt ? Math.PI / 2 : 0.12, 0, 0);
    const h = new THREE.Group();
    h.add(g);
    if (liegt) g.position.set(0, 0.03, 0.34);
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

  // Haufen und Teile im Schrottplatz (der Gang bei x -3,5 … -2,3 bleibt frei): dicht an dicht, gehäuft
  altmetall(-12.4, -7.6, 2.2, 2.4, 70, 1.4);
  altmetall(-8.2, -8.4, 2.0, 1.7, 60, 1.2);
  altmetall(-5.6, -6.2, 1.5, 1.4, 40, 0.9);
  altmetall(-9.6, -5.4, 1.4, 0.8, 26, 0.7);
  felgenStapel(-10.4, -9.9, 6); felgenStapel(-9.85, -10.0, 4); felgenStapel(-4.25, -4.95, 5); felgenStapel(-4.85, -5.0, 3);
  felgenStapel(-14.2, -5.0, 5);
  reifenStapel(-13.4, -10.0, 5); reifenStapel(-12.8, -9.95, 3); reifenStapel(-6.9, -4.95, 4); reifenStapel(-11.3, -5.0, 2, true);
  fahrrad(-13.9, -6.4, 0.4, true, 0x2f5fa8);
  fahrrad(-7.0, -9.9, 2.6, true, 0xc8382c);
  fahrrad(-4.2, -7.4, Math.PI / 2, false, 0x2f6b3a);
  fahrrad(-10.8, -7.0, 1.1, true, 0xd8b23a);
  schuessel(-8.2, -5.2, 0.8);
  schuessel(-14.0, -8.6, -0.5);
  gasflasche(-4.3, -9.0, 0x8c8f94, false); gasflasche(-4.7, -9.3, 0xc8382c, false); gasflasche(-4.3, -9.6, 0x8c8f94, true);
  gasflasche(-6.3, -4.85, 0x8c8f94, false); gasflasche(-11.6, -10.0, 0x6a8a5a, true); gasflasche(-7.6, -10.0, 0xc8382c, false);
  fass(-12.2, -5.0, false); fass(-14.3, -9.6, true); fass(-5.6, -9.8, false); fass(-6.15, -9.85, false);
  heizkoerper(-13.0, -10.1, 0.2);
  waschmaschine(-9.2, -9.9, 0.3);
  autotuer(-4.3, -8.2, Math.PI / 2, 0x3a6aa8); autotuer(-7.6, -5.0, 0.1, 0xc8382c);
  motorblock(-5.1, -9.2, 0.6);
  badewanne(-12.9, -5.5, 0.1);
  motorhaube(-10.9, -9.6, 2.9, 0x2f6b3a);
  auspuff(-8.9, -4.9, 0.2); auspuff(-14.4, -7.3, 1.5);
  // hinter dem Container (zwischen Container und Carport), mit Abstand zur offenen Containerseite
  altmetall(0.3, -9.5, 1.9, 0.75, 28, 0.7);
  reifenStapel(2.3, -9.9, 4); felgenStapel(-1.6, -9.9, 4); gasflasche(-1.6, -9.0, 0x8c8f94, false);
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
