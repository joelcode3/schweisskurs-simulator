// Auf der Wiese neben der Betonfläche: großes Carport unter einer Eiche, darunter ein Wohnwagen mit kleiner Holzterrasse und
// Lichterkette. Hinten am Wohnwagen hat Dennis ein kleines, wackliges Carport mit blauer Plane angebaut, darunter sein ein und
// alles: ein weißer Mercedes 123. Auf dem großen Carport liegen alte Turnmatten, beschwert mit Gehwegplatten (gegen die lauten
// Eicheln). Heute Nacht um 4 hat der Wind eine Matte runtergeweht, und die Gehwegplatte ist durch die Plane in die Motorhaube.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall } from './toon.js';

export function baueCarport(scene, { merke, hindernis }) {
  const r = zufall(808);
  const platz = new THREE.Group();
  // lokal: Wohnwagen längs z (Deichsel -z), Tür/Terrasse +x, Dennis' Anbau mit dem Benz seitlich daneben (-x)
  // Welt: Gruppe bei (-15,2 | 7,4), um -90° gedreht
  const HOLZ = 0x8a6a44, HOLZ_D = 0x6a4f32;
  const plankenTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#9a7650'; g.fillRect(0, 0, b, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(40,25,10,0.5)'; g.fillRect(0, y, b, 2); for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(60,40,20,${r() * 0.2})`; g.fillRect(r() * b, y + 3 + r() * 10, 20 + r() * 40, 1); } }
  }, [2, 2]);
  const holzMat = toon(0xffffff, { map: plankenTex });

  // ---------- großes Carport (Holz, Wellplatten-Dach) ----------
  const GH = 2.9; // Dachhöhe
  const GX = 1.7, GZ0 = -2.9, GZ1 = 2.9;
  for (const x of [-GX, GX]) for (const z of [GZ0, 0, GZ1]) {
    platz.add(setze(quader(0.12, GH, 0.12, HOLZ, { umriss: 0.004 }), x, GH / 2, z));
    platz.add(setze(quader(0.3, 0.06, 0.3, 0x8f8d86, { umriss: 0.002 }), x, 0.03, z));
  }
  for (const x of [-GX, GX]) platz.add(setze(quader(0.14, 0.2, GZ1 - GZ0 + 0.4, HOLZ_D, { umriss: 0.004 }), x, GH - 0.1, 0));
  for (let k = 0; k <= 6; k++) platz.add(setze(quader(2 * GX + 0.4, 0.12, 0.08, HOLZ, { umriss: 0.003 }), 0, GH + 0.04, GZ0 - 0.1 + k * (GZ1 - GZ0 + 0.2) / 6));
  // Kopfbänder (schräge Streben)
  for (const x of [-GX, GX]) for (const z of [GZ0, GZ1]) {
    const s = quader(0.08, 0.6, 0.08, HOLZ, { umriss: 0.002 });
    s.position.set(x, GH - 0.3, z + (z < 0 ? 0.2 : -0.2));
    s.rotation.x = z < 0 ? -0.75 : 0.75;
    platz.add(s);
  }
  const wellTex = leinwandTextur(64, 16, (g, b, h) => {
    const v = g.createLinearGradient(0, 0, b, 0);
    v.addColorStop(0, '#c8cfc6'); v.addColorStop(0.5, '#eef2ea'); v.addColorStop(1, '#c8cfc6');
    for (let x = 0; x < b; x += 16) { g.fillStyle = v; g.save(); g.translate(x, 0); g.fillRect(0, 0, 16, h); g.restore(); }
    g.fillStyle = 'rgba(90,110,80,0.15)'; for (let i = 0; i < 6; i++) g.fillRect(r() * b, r() * h, 6, 3);
  }, [12, 6]);
  const dach = teil(new THREE.BoxGeometry(2 * GX + 0.5, 0.03, GZ1 - GZ0 + 0.5), 0, { material: toon(0xffffff, { map: wellTex, transparent: true, opacity: 0.92 }), umriss: 0.003 });
  dach.position.y = GH + 0.115;
  platz.add(dach);
  // alte Turnmatten (blau, mit Griffschlaufen), beschwert mit Gehwegplatten; eine fehlt (runtergeweht)
  const matteMat = toon(0x2f5fa8);
  const platte = (x, y, z, rx = 0, rz = 0) => {
    const p = quader(0.4, 0.05, 0.4, 0x8f8d86, { umriss: 0.003 });
    p.position.set(x, y, z); p.rotation.set(rx, r() * 0.4, rz);
    for (let i = 0; i < 3; i++) p.add(setze(quader(0.06 + r() * 0.08, 0.052, 0.01, 0x6e6c66, { umriss: false }), (r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3, 0, r() * 3, 0));
    return p;
  };
  const matte = (x, z, ry) => {
    const m = new THREE.Group();
    m.add(teil(new THREE.BoxGeometry(1.0, 0.08, 2.0), 0, { material: matteMat, umriss: 0.004 }));
    for (const sz of [-0.7, 0.7]) for (const sx of [-1, 1]) m.add(setze(teil(new THREE.TorusGeometry(0.05, 0.012, 4, 10, Math.PI), 0x1d1d1f, { umriss: false }), sx * 0.5, 0, sz, 0, Math.PI / 2, 0));
    m.position.set(x, GH + 0.17, z); m.rotation.y = ry;
    return m;
  };
  platz.add(matte(-0.9, -1.4, 0.05), matte(0.75, -1.45, -0.04), matte(-0.85, 1.5, 0.02));
  platz.add(platte(-0.9, GH + 0.24, -1.6), platte(0.7, GH + 0.24, -1.2), platte(-0.8, GH + 0.24, 1.3), platte(-0.95, GH + 0.24, 2.0));
  // hier lag die vierte Matte: nur noch ein paar Eicheln und Dreck auf dem Dach
  // die runtergewehte Matte liegt verknickt neben dem Carport auf der Wiese
  const weg = new THREE.Group();
  weg.add(setze(teil(new THREE.BoxGeometry(1.0, 0.08, 1.1), 0, { material: matteMat, umriss: 0.004 }), 0, 0.05, 0));
  weg.add(setze(teil(new THREE.BoxGeometry(1.0, 0.08, 0.9), 0, { material: matteMat, umriss: 0.004 }), 0, 0.3, 0.6, 0.6, 0, 0));
  weg.position.set(GX + 1.4, 0, 1.9); weg.rotation.y = 0.5;
  platz.add(weg);
  // Eicheln überall (auf den Matten, auf dem Dach, im Gras)
  const eichel = () => {
    const e = new THREE.Group();
    const k = kugel(0.014, 0x8a5a2a, { umriss: false }, 6); k.scale.set(0.8, 1.2, 0.8); e.add(k);
    e.add(setze(kugel(0.012, 0x6a4a2a, { umriss: false }, 6), 0, 0.012, 0));
    return e;
  };
  for (let i = 0; i < 40; i++) {
    const e = eichel();
    if (i < 22) e.position.set((r() - 0.5) * 3.2, GH + 0.22, (r() - 0.5) * 5.4);
    else e.position.set((r() - 0.5) * 7, 0.015, (r() - 0.5) * 9);
    e.rotation.set(Math.PI / 2, r() * 3, 0);
    platz.add(e);
  }

  // ---------- Wohnwagen (alt, weiß mit braunen Streifen) ----------
  const ww = new THREE.Group();
  const WL = 4.4, WB = 2.1, WH = 1.95, WY = 0.45; // Länge, Breite, Höhe, Bodenhöhe
  const seitenTex = leinwandTextur(512, 256, (g, b, h) => {
    g.fillStyle = '#f1ece0'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#7a4a26'; g.fillRect(0, h * 0.62, b, h * 0.07);
    g.fillStyle = '#c8803a'; g.fillRect(0, h * 0.71, b, h * 0.035);
    g.fillStyle = 'rgba(90,110,60,0.25)'; for (let i = 0; i < 40; i++) g.fillRect(r() * b, h * (0.8 + r() * 0.2), 2 + r() * 10, 2 + r() * 6); // Moos/Dreck unten
    g.fillStyle = 'rgba(80,70,50,0.12)'; for (let i = 0; i < 12; i++) g.fillRect(r() * b, 0, 2, h * (0.2 + r() * 0.5)); // Laufspuren
  });
  const wwMat = toon(0xffffff, { map: seitenTex });
  const korpus = teil(new THREE.BoxGeometry(WB, WH, WL, 1, 1, 1), 0, { material: wwMat, umriss: 0.005 });
  korpus.position.y = WY + WH / 2;
  ww.add(korpus);
  // runde Dachkanten
  for (const sx of [-1, 1]) {
    const kante = teil(new THREE.CylinderGeometry(0.16, 0.16, WL, 10, 1, false, 0, Math.PI / 2), 0xf1ece0, { umriss: 0.003 });
    kante.rotation.x = Math.PI / 2;
    kante.rotation.y = sx > 0 ? 0 : -Math.PI / 2;
    kante.position.set(sx * (WB / 2 - 0.16), WY + WH - 0.16, 0);
    ww.add(kante);
  }
  ww.add(setze(quader(WB - 0.3, 0.06, WL - 0.1, 0xe4dfd2, { umriss: 0.002 }), 0, WY + WH + 0.0, 0));
  ww.add(setze(quader(0.6, 0.12, 0.6, 0xe4dfd2, { umriss: 0.003 }), 0, WY + WH + 0.08, 0.6));
  ww.add(setze(quader(0.5, 0.04, 0.5, 0x9cb8c8, { umriss: false }), 0, WY + WH + 0.15, 0.6));
  // Fenster (getönt, Rahmen), Tür mit Fenster und Griff, Lüftungsgitter
  const fensterMat = toon(0x4a5a64);
  const fenster = (x, z, b, h, y = WY + 1.25, ry = 0) => {
    const f = new THREE.Group();
    f.add(setze(quader(b + 0.08, h + 0.08, 0.04, 0xd8d2c4, { umriss: 0.002 }), 0, 0, 0));
    f.add(setze(new THREE.Mesh(new THREE.BoxGeometry(b, h, 0.05), fensterMat), 0, 0, 0.005));
    f.add(setze(quader(b, 0.03, 0.06, 0xd8d2c4, { umriss: false }), 0, h * 0.15, 0.01));
    f.position.set(x, y, z); f.rotation.y = ry;
    ww.add(f);
  };
  fenster(WB / 2 + 0.01, 1.3, 1.0, 0.55, WY + 1.25, Math.PI / 2);
  fenster(WB / 2 + 0.01, -1.4, 0.7, 0.5, WY + 1.25, Math.PI / 2);
  fenster(-WB / 2 - 0.01, 0.2, 1.4, 0.55, WY + 1.25, -Math.PI / 2);
  fenster(0, WL / 2 + 0.01, 1.4, 0.6, WY + 1.25, 0);
  fenster(0, -WL / 2 - 0.01, 1.2, 0.45, WY + 1.3, Math.PI);
  const tuerW = new THREE.Group();
  tuerW.add(setze(quader(0.62, 1.75, 0.04, 0xece6d8, { umriss: 0.003 }), 0, 0, 0));
  tuerW.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.45, 0.045), fensterMat), 0, 0.45, 0.002));
  tuerW.add(setze(quader(0.04, 0.12, 0.06, 0x8a8f96, { umriss: 0.001 }), -0.24, -0.05, 0.03));
  tuerW.position.set(WB / 2 + 0.02, WY + 0.95, -0.15); tuerW.rotation.y = Math.PI / 2;
  ww.add(tuerW);
  for (let k = 0; k < 4; k++) ww.add(setze(quader(0.01, 0.02, 0.22, 0x8a8f96, { umriss: false }), WB / 2 + 0.02, WY + 0.3 + k * 0.04, -1.9));
  // Rücklichter, Kennzeichenhalter hinten
  for (const sx of [-1, 1]) ww.add(setze(quader(0.18, 0.12, 0.03, 0xc8352a, { umriss: 0.002 }), sx * 0.8, WY + 0.25, -WL / 2 - 0.02));
  ww.add(setze(quader(0.52, 0.12, 0.02, 0xf4f4ef, { umriss: 0.002 }), 0, WY + 0.25, -WL / 2 - 0.02));
  // Fahrgestell: Achse mit Rädern und Radkasten, Deichsel mit Gaskasten, Stützrad, Kurbelstützen
  ww.add(setze(quader(1.8, 0.12, WL - 0.2, 0x2a2c30, { umriss: 0.003 }), 0, WY - 0.06, 0));
  for (const sx of [-1, 1]) {
    ww.add(setze(zylinder(0.3, 0.3, 0.18, 0x1d1d1f, { umriss: 0.003 }, 18), sx * (WB / 2 - 0.05), 0.3, -0.1, 0, 0, Math.PI / 2));
    ww.add(setze(zylinder(0.15, 0.15, 0.19, 0xc9cdd2, { umriss: false }, 12), sx * (WB / 2 - 0.05), 0.3, -0.1, 0, 0, Math.PI / 2));
    ww.add(setze(quader(0.04, 0.12, 0.8, 0xe4dfd2, { umriss: 0.002 }), sx * (WB / 2 + 0.02), WY + 0.08, -0.1));
    for (const z of [-WL / 2 + 0.3, WL / 2 - 0.3]) ww.add(setze(zylinder(0.03, 0.04, WY, 0x5a5d62, { umriss: 0.002 }, 8), sx * 0.75, WY / 2, z));
  }
  for (const sx of [-1, 1]) { const d = quader(0.08, 0.1, 1.4, 0x2a2c30, { umriss: 0.003 }); d.position.set(sx * 0.35, WY - 0.05, WL / 2 + 0.6); d.rotation.y = -sx * 0.25; ww.add(d); }
  ww.add(setze(zylinder(0.05, 0.05, 0.15, 0x1d1d1f, { umriss: 0.002 }, 10), 0, WY - 0.05, WL / 2 + 1.3, Math.PI / 2, 0, 0));
  ww.add(setze(zylinder(0.03, 0.03, 0.45, 0x8a8f96, { umriss: 0.002 }, 8), 0.1, 0.25, WL / 2 + 1.1));
  ww.add(setze(zylinder(0.07, 0.07, 0.04, 0x1d1d1f, { umriss: 0.002 }, 12), 0.1, 0.07, WL / 2 + 1.1, 0, 0, Math.PI / 2));
  ww.add(setze(quader(1.1, 0.5, 0.45, 0xe4dfd2, { umriss: 0.003 }), 0, WY + 0.25, WL / 2 + 0.3));
  ww.add(setze(quader(1.05, 0.04, 0.42, 0xd2cbbb, { umriss: false }), 0, WY + 0.52, WL / 2 + 0.3));
  // Deichsel zeigt zur anderen Seite (-z): Wohnwagen längs gespiegelt
  ww.scale.z = -1;
  platz.add(ww);

  // ---------- kleine Holzterrasse vor der Tür mit Stufe, Klappstühlen und Lichterkette ----------
  const terr = new THREE.Group();
  terr.add(setze(teil(new THREE.BoxGeometry(1.8, 0.18, 2.6), 0, { material: holzMat, umriss: 0.004 }), 0, 0.09, 0));
  terr.add(setze(teil(new THREE.BoxGeometry(0.4, 0.09, 1.0), 0, { material: holzMat, umriss: 0.003 }), 1.1, 0.045, 0));
  // kleines altes Zweisitzer-Sofa am Terrassenende, davor ein Getränkekasten als Tisch
  const sofa = new THREE.Group();
  const SOFA = 0x7a5a3a, SOFA_D = 0x5e4430;
  sofa.add(setze(quader(1.3, 0.22, 0.7, SOFA_D, { umriss: 0.003 }), 0, 0.2, 0));
  for (const sx of [-1, 1]) {
    sofa.add(setze(quader(0.54, 0.14, 0.56, SOFA, { umriss: 0.003 }), sx * 0.28, 0.38, 0.05, 0, 0, sx * 0.02));
    sofa.add(setze(quader(0.14, 0.42, 0.7, SOFA, { umriss: 0.003 }), sx * 0.62, 0.4, 0));
    sofa.add(setze(quader(0.54, 0.4, 0.16, SOFA, { umriss: 0.003 }), sx * 0.28, 0.62, -0.28, -0.15, 0, 0));
  }
  sofa.add(setze(quader(0.6, 0.5, 0.06, 0x2f5f86, { umriss: 0.002 }), 0.2, 0.55, 0.05, -1.25, 0, 0.15)); // Wolldecke
  sofa.add(setze(quader(0.3, 0.26, 0.12, 0xc8352a, { umriss: 0.002 }), -0.35, 0.55, -0.14, -0.3, 0.2, 0)); // Kissen
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) sofa.add(setze(zylinder(0.03, 0.025, 0.09, 0x2a2018, { umriss: false }, 8), sx * 0.58, 0.045, sz * 0.28));
  // Rücken zur Wohnwagenwand, guckt raus auf die Wiese; Tür bleibt frei
  sofa.position.set(-0.45, 0.18, -0.68);
  sofa.rotation.y = Math.PI / 2;
  terr.add(sofa);
  terr.add(setze(quader(0.3, 0.3, 0.4, 0x2f6b3a, { umriss: 0.003 }), 0.35, 0.33, -0.7));
  for (let i = 0; i < 6; i++) terr.add(setze(zylinder(0.03, 0.03, 0.08, 0x6b3a14, { umriss: false }, 8), 0.29 + Math.floor(i / 3) * 0.12, 0.52, -0.82 + (i % 3) * 0.12));
  terr.add(setze(zylinder(0.03, 0.025, 0.05, 0xd8d2c4, { umriss: 0.001 }, 10), 0.42, 0.505, -0.55)); // Aschenbecher
  terr.position.set(WB / 2 + 0.9, 0, -0.1);
  platz.add(terr);
  // Lichterkette in Bögen zwischen den Carport-Pfosten vor der Terrasse
  const birneMat = new THREE.MeshBasicMaterial({ color: 0xffe08a });
  const kabelPunkte = [];
  const lx = GX + 0.05;
  for (const [z0, z1] of [[GZ0, 0], [0, GZ1]]) for (let k = 0; k <= 12; k++) { const t = k / 12; kabelPunkte.push(new THREE.Vector3(lx, 2.45 - Math.sin(t * Math.PI) * 0.35, z0 + (z1 - z0) * t)); }
  platz.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(kabelPunkte), 80, 0.006, 4, false), 0x1d1d1f, { umriss: false }));
  for (let k = 1; k < kabelPunkte.length - 1; k += 1) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), birneMat);
    b.scale.set(1, 1.3, 1);
    b.position.copy(kabelPunkte[k]); b.position.y -= 0.05;
    platz.add(b);
  }

  // ---------- Dennis' wackliges Anbau-Carport seitlich am großen (gegenüber der Terrasse): Latten, schiefe Pfosten, blaue Plane ----------
  const anbau = new THREE.Group();
  const AZ0 = 2.5, AZ1 = AZ0 - 5.0, AX = 1.25, AH = 2.15;
  // außen eigene schiefe Pfosten, innen an die Pfosten vom großen Carport geschraubt
  const pfosten = [[-AX, AZ0, 0], [-AX, AZ1, -0.06], [-AX, (AZ0 + AZ1) / 2, 0.04]];
  for (const [x, z, schief] of pfosten) { const p = quader(0.08, AH, 0.08, HOLZ_D, { umriss: 0.003 }); p.position.set(x, AH / 2, z); p.rotation.z = schief; anbau.add(p); }
  for (const z of [AZ0, AZ1]) anbau.add(setze(quader(0.1, 0.3, 0.06, HOLZ_D, { umriss: 0.002 }), AX + 0.03, AH - 0.1, z));
  for (const x of [-AX, AX]) anbau.add(setze(quader(0.08, 0.1, AZ0 - AZ1 + 0.3, HOLZ_D, { umriss: 0.002 }), x, AH, (AZ0 + AZ1) / 2, 0.02, 0, 0));
  for (let k = 0; k <= 4; k++) anbau.add(setze(quader(2 * AX + 0.3, 0.05, 0.06, HOLZ, { umriss: 0.002 }), 0, AH + 0.06, AZ0 - k * (AZ0 - AZ1) / 4, 0, 0, (r() - 0.5) * 0.04));
  // Spanngurt und Kabelbinder (Dennis-Bauweise)
  anbau.add(setze(quader(0.04, 0.4, 0.01, 0xf2a21c, { umriss: false }), AX + 0.05, AH - 0.15, AZ0));
  // Plane: hängt durch, Loch über der Motorhaube, Fetzen hängen runter
  const LOCH = { x: 0.1, z: AZ0 - 0.65, r: 0.42 };
  const planeGeo = new THREE.PlaneGeometry(2 * AX + 0.5, AZ0 - AZ1 + 0.5, 24, 40).toNonIndexed();
  planeGeo.rotateX(-Math.PI / 2);
  const pp = planeGeo.attributes.position;
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i), z = pp.getZ(i);
    const u = x / (AX + 0.25), v = z / ((AZ0 - AZ1) / 2 + 0.25);
    pp.setY(i, -0.18 * (1 - u * u) * (1 - v * v) + Math.sin(x * 9 + z * 5) * 0.012);
  }
  const P = [];
  for (let i = 0; i < pp.count; i += 3) {
    let cx = 0, cz = 0;
    for (let k = 0; k < 3; k++) { cx += pp.getX(i + k); cz += pp.getZ(i + k); }
    cx /= 3; cz /= 3;
    if (Math.hypot(cx - LOCH.x, cz + (AZ0 + AZ1) / 2 - LOCH.z) < LOCH.r * (0.85 + 0.3 * Math.sin(Math.atan2(cz, cx) * 5))) continue;
    for (let k = 0; k < 3; k++) P.push(pp.getX(i + k), pp.getY(i + k), pp.getZ(i + k));
  }
  const planeNeu = new THREE.BufferGeometry();
  planeNeu.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  planeNeu.computeVertexNormals();
  const planeMat = toon(0x2f6fd0, { side: THREE.DoubleSide });
  const planeMesh = teil(planeNeu, 0, { material: planeMat, umriss: false });
  planeMesh.position.set(0, AH + 0.12, (AZ0 + AZ1) / 2);
  anbau.add(planeMesh);
  // Ösen am Rand und zerrissene Fetzen am Loch
  for (let k = 0; k < 10; k++) anbau.add(setze(teil(new THREE.TorusGeometry(0.02, 0.006, 4, 8), 0xc9cdd2, { umriss: false }), (k % 2 ? 1 : -1) * (AX + 0.24), AH + 0.1, AZ0 - Math.floor(k / 2) * 1.2, Math.PI / 2, 0, 0));
  for (let k = 0; k < 5; k++) {
    const w = k / 5 * Math.PI * 2 + 0.3;
    const fetzen = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.35), planeMat);
    fetzen.position.set(LOCH.x + Math.cos(w) * LOCH.r * 0.9, AH - 0.05, LOCH.z + Math.sin(w) * LOCH.r * 0.9);
    fetzen.rotation.set(-0.3 + r() * 0.6, w + Math.PI / 2, (r() - 0.5) * 0.4);
    anbau.add(fetzen);
  }

  // ---------- weißer Mercedes 123 (Limousine), Gehwegplatte steckt in der Motorhaube ----------
  const benz = new THREE.Group();
  const WEISS = 0xf2f0ea, CHROM = 0xc9cdd2;
  const L = 4.7, B = 1.78;
  // Karosserie unten, Motorhaube, Kofferraum, Kabine mit Scheiben und Säulen
  benz.add(setze(quader(B, 0.5, L, WEISS, { umriss: 0.005 }), 0, 0.58, 0));
  benz.add(setze(quader(B - 0.04, 0.08, 1.45, WEISS, { umriss: 0.003 }), 0, 0.87, L / 2 - 0.8));
  benz.add(setze(quader(B - 0.04, 0.1, 1.0, WEISS, { umriss: 0.003 }), 0, 0.88, -L / 2 + 0.55));
  const glas = toon(0x3a4a58);
  const kab = new THREE.Group();
  kab.add(setze(quader(B - 0.18, 0.06, 1.9, WEISS, { umriss: 0.003 }), 0, 0.55, 0));
  kab.add(setze(new THREE.Mesh(new THREE.BoxGeometry(B - 0.22, 0.48, 1.86), glas), 0, 0.27, 0));
  for (const z of [-0.95, -0.05, 0.9]) for (const sx of [-1, 1]) kab.add(setze(quader(0.06, 0.52, z === -0.05 ? 0.08 : 0.1, WEISS, { umriss: 0.002 }), sx * (B / 2 - 0.12), 0.27, z, 0, 0, sx * 0.06));
  // Front- und Heckscheibe schräg
  const front = new THREE.Mesh(new THREE.BoxGeometry(B - 0.24, 0.55, 0.04), glas); front.position.set(0, 0.25, 1.1); front.rotation.x = -0.55; kab.add(front);
  const heck = new THREE.Mesh(new THREE.BoxGeometry(B - 0.24, 0.5, 0.04), glas); heck.position.set(0, 0.25, -1.08); heck.rotation.x = 0.6; kab.add(heck);
  kab.position.set(0, 0.88, -0.15);
  benz.add(kab);
  // Chromstoßstangen mit Gummi, Kühlergrill mit Stern, breite Scheinwerfer, Blinker, Rückleuchten
  for (const z of [L / 2 + 0.04, -L / 2 - 0.04]) {
    benz.add(setze(quader(B + 0.04, 0.12, 0.08, CHROM, { umriss: 0.003 }), 0, 0.42, z));
    benz.add(setze(quader(B + 0.05, 0.04, 0.09, 0x1d1d1f, { umriss: false }), 0, 0.42, z));
  }
  benz.add(setze(quader(0.42, 0.3, 0.05, CHROM, { umriss: 0.003 }), 0, 0.68, L / 2 + 0.01));
  for (let k = 0; k < 7; k++) benz.add(setze(quader(0.36, 0.015, 0.02, 0x3a3c40, { umriss: false }), 0, 0.57 + k * 0.035, L / 2 + 0.035));
  benz.add(setze(teil(new THREE.TorusGeometry(0.045, 0.008, 6, 16), CHROM, { umriss: 0.001 }), 0, 0.88, L / 2 - 0.02, Math.PI / 2 - 0.3, 0, 0));
  for (let k = 0; k < 3; k++) benz.add(setze(quader(0.006, 0.045, 0.006, CHROM, { umriss: false }), Math.cos(k * 2.094 + Math.PI / 2) * 0.022, 0.88 + Math.sin(k * 2.094 + Math.PI / 2) * 0.022, L / 2 - 0.02, 0, 0, k * 2.094));
  for (const sx of [-1, 1]) {
    benz.add(setze(quader(0.48, 0.2, 0.04, 0xf4f4ef, { umriss: 0.002 }), sx * 0.58, 0.68, L / 2 + 0.01));
    benz.add(setze(quader(0.16, 0.18, 0.045, 0xf2a21c, { umriss: false }), sx * 0.76, 0.68, L / 2 + 0.015));
    benz.add(setze(quader(0.5, 0.2, 0.04, 0xc8352a, { umriss: 0.002 }), sx * 0.58, 0.72, -L / 2 - 0.01));
    benz.add(setze(quader(0.012, 0.03, 3.4, CHROM, { umriss: false }), sx * (B / 2 + 0.005), 0.62, 0.1));
    benz.add(setze(quader(0.03, 0.03, 0.12, CHROM, { umriss: false }), sx * (B / 2 + 0.01), 0.78, 0.35));
    benz.add(setze(quader(0.03, 0.03, 0.12, CHROM, { umriss: false }), sx * (B / 2 + 0.01), 0.78, -0.65));
  }
  // Räder mit Chrom-Radkappen
  for (const z of [L / 2 - 0.85, -L / 2 + 0.9]) for (const sx of [-1, 1]) {
    benz.add(setze(zylinder(0.33, 0.33, 0.2, 0x1d1d1f, { umriss: 0.003 }, 20), sx * (B / 2 - 0.08), 0.33, z, 0, 0, Math.PI / 2));
    benz.add(setze(zylinder(0.2, 0.2, 0.21, CHROM, { umriss: false }, 16), sx * (B / 2 - 0.08), 0.33, z, 0, 0, Math.PI / 2));
    benz.add(setze(zylinder(0.06, 0.06, 0.22, 0x8a8f96, { umriss: false }, 10), sx * (B / 2 - 0.08), 0.33, z, 0, 0, Math.PI / 2));
  }
  // Details: Radläufe, Türfugen, Fensterrahmen, Gummileisten, Spiegel, Wischer, Kennzeichen, Auspuff, Antenne, Tankdeckel
  const DUNKEL = 0x2a2c30;
  for (const z of [L / 2 - 0.85, -L / 2 + 0.9]) for (const sx of [-1, 1]) {
    const lauf = teil(new THREE.TorusGeometry(0.37, 0.028, 6, 18, Math.PI), DUNKEL, { umriss: false });
    lauf.position.set(sx * (B / 2 + 0.005), 0.33, z); lauf.rotation.y = Math.PI / 2;
    benz.add(lauf);
    // Radkappe mit Ring und Schlitzen
    benz.add(setze(teil(new THREE.TorusGeometry(0.17, 0.012, 6, 20), 0x8a8f96, { umriss: false }), sx * (B / 2 + 0.03), 0.33, z, 0, Math.PI / 2, 0));
    for (let k = 0; k < 10; k++) {
      const w = k / 10 * Math.PI * 2;
      benz.add(setze(quader(0.006, 0.05, 0.016, 0x5a5d62, { umriss: false }), sx * (B / 2 + 0.03), 0.33 + Math.sin(w) * 0.12, z + Math.cos(w) * 0.12, w, 0, 0));
    }
  }
  for (const sx of [-1, 1]) {
    const x = sx * (B / 2 + 0.004);
    // Türfugen (vorne, Mitte, hinten) und Unterkante
    for (const z of [0.78, -0.08, -0.98]) benz.add(setze(quader(0.006, 0.5, 0.008, DUNKEL, { umriss: false }), x, 0.6, z));
    for (const z of [0.78, -0.08, -0.98]) benz.add(setze(quader(0.006, 0.5, 0.008, DUNKEL, { umriss: false }), x * 0.93, 1.13, z - 0.15, sx * 0.06, 0, 0));
    // schwarze Gummi-Schutzleiste und Chrom-Schweller
    benz.add(setze(quader(0.02, 0.05, L - 0.3, DUNKEL, { umriss: false }), sx * (B / 2 + 0.01), 0.68, 0));
    benz.add(setze(quader(0.015, 0.04, 2.0, CHROM, { umriss: false }), sx * (B / 2 + 0.005), 0.37, -0.1));
    // Chromrahmen um die Seitenscheiben und Dachrinne
    benz.add(setze(quader(0.02, 0.025, 1.95, CHROM, { umriss: false }), sx * (B / 2 - 0.12), 1.38, -0.15));
    benz.add(setze(quader(0.02, 0.02, 2.0, CHROM, { umriss: false }), sx * (B / 2 - 0.05), 0.91, -0.15));
    // Außenspiegel (Chrom, mit Glas)
    const sp = new THREE.Group();
    sp.add(setze(zylinder(0.012, 0.012, 0.1, CHROM, { umriss: false }, 6), sx * 0.05, 0, 0, 0, 0, Math.PI / 2));
    sp.add(setze(quader(0.05, 0.1, 0.15, CHROM, { umriss: 0.002 }), sx * 0.11, 0.02, 0));
    sp.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.08, 0.13), glas), sx * 0.11, 0.02, -0.077 + 0.077 * 0));
    sp.position.set(sx * (B / 2 - 0.05), 1.0, 0.86);
    benz.add(sp);
    // Rückleuchten geriffelt: rot, orange, weiß
    for (let k = 0; k < 5; k++) benz.add(setze(quader(0.5, 0.012, 0.045, 0x8a2a20, { umriss: false }), sx * 0.58, 0.64 + k * 0.035, -L / 2 - 0.02));
    benz.add(setze(quader(0.14, 0.2, 0.042, 0xf2a21c, { umriss: false }), sx * 0.4, 0.72, -L / 2 - 0.015));
    benz.add(setze(quader(0.1, 0.2, 0.042, 0xf4f4ef, { umriss: false }), sx * 0.29, 0.72, -L / 2 - 0.015));
    // Scheinwerfer mit Chromrahmen und Teilung, Nebelleuchte unter der Stoßstange
    benz.add(setze(quader(0.52, 0.24, 0.03, CHROM, { umriss: false }), sx * 0.58, 0.68, L / 2 - 0.005));
    benz.add(setze(quader(0.008, 0.2, 0.05, 0x9aa0a6, { umriss: false }), sx * 0.5, 0.68, L / 2 + 0.02));
    benz.add(setze(zylinder(0.05, 0.05, 0.04, 0xf4f4ef, { umriss: 0.001 }, 12), sx * 0.6, 0.3, L / 2 + 0.02, Math.PI / 2, 0, 0));
    // Scheibenwischer
    const wi = quader(0.5, 0.012, 0.012, 0x1d1d1f, { umriss: false });
    wi.position.set(sx * 0.32 - 0.05, 0.94, 0.98); wi.rotation.z = sx * 0.12; wi.rotation.x = -0.3;
    benz.add(wi);
  }
  // Grill mit Chromrahmen und senkrechtem Mittelsteg, Stern oben drauf
  benz.add(setze(quader(0.48, 0.36, 0.035, CHROM, { umriss: 0.002 }), 0, 0.69, L / 2 - 0.005));
  benz.add(setze(quader(0.02, 0.3, 0.05, CHROM, { umriss: false }), 0, 0.68, L / 2 + 0.04));
  benz.add(setze(zylinder(0.012, 0.012, 0.05, CHROM, { umriss: false }, 6), 0, 0.86, L / 2 - 0.02));
  // Kennzeichen vorne und hinten
  const schildTex = leinwandTextur(256, 56, (g, b, h) => {
    g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#1f4fa8'; g.fillRect(0, 0, 28, h);
    g.fillStyle = '#f2c21c'; for (let k = 0; k < 8; k++) { const w = k / 8 * Math.PI * 2; g.fillRect(14 + Math.cos(w) * 8 - 1, 20 + Math.sin(w) * 8 - 1, 2, 2); }
    g.fillStyle = '#f4f4ef'; g.font = 'bold 14px Arial'; g.fillText('D', 9, 48);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 40px Arial'; g.fillText('STD DW 123', 36, 44);
    g.strokeStyle = '#1d1d1f'; g.lineWidth = 3; g.strokeRect(1, 1, b - 2, h - 2);
  });
  for (const [z, ry] of [[L / 2 + 0.09, 0], [-L / 2 - 0.09, Math.PI]]) {
    const k = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), new THREE.MeshBasicMaterial({ map: schildTex }));
    k.position.set(0, z > 0 ? 0.3 : 0.56, z); k.rotation.y = ry;
    benz.add(k);
  }
  // Auspuff, Antenne, Tankdeckel
  benz.add(setze(zylinder(0.035, 0.035, 0.3, 0x5a5d62, { umriss: 0.001 }, 10), -0.55, 0.22, -L / 2 - 0.05, Math.PI / 2, 0, 0));
  benz.add(setze(zylinder(0.004, 0.004, 0.7, 0x1d1d1f, { umriss: false }, 4), 0.8, 1.2, -L / 2 + 0.6, -0.2, 0, 0));
  benz.add(setze(zylinder(0.07, 0.07, 0.01, WEISS, { umriss: 0.002 }, 14), B / 2 + 0.006, 0.76, -L / 2 + 0.75, 0, 0, Math.PI / 2));
  // die Gehwegplatte: steckt schräg in der eingedrückten Motorhaube, Risse und abgeplatzter Lack drumherum
  const HZ = L / 2 - 0.7;
  const delle = kugel(0.36, 0xd9d6ce, { umriss: false }, 14);
  delle.scale.set(1.15, 0.12, 1);
  delle.position.set(0.08, 0.9, HZ);
  benz.add(delle);
  const steinplatte = platte(0.08, 0.88, HZ, 0.55, -0.25);
  benz.add(steinplatte);
  for (let k = 0; k < 9; k++) {
    const w = k / 9 * Math.PI * 2;
    const riss = quader(0.22 + r() * 0.15, 0.005, 0.008, 0x3a3c40, { umriss: false });
    riss.position.set(0.08 + Math.cos(w) * 0.3, 0.915, HZ + Math.sin(w) * 0.3);
    riss.rotation.y = -w;
    benz.add(riss);
  }
  for (let k = 0; k < 7; k++) benz.add(setze(quader(0.05 + r() * 0.06, 0.004, 0.04, 0x8a8a84, { umriss: false }), 0.08 + (r() - 0.5) * 0.8, 0.915, HZ + (r() - 0.5) * 0.7, 0, r() * 3, 0));
  // Splitter der Platte auf der Haube und am Boden
  for (let k = 0; k < 6; k++) benz.add(setze(quader(0.04 + r() * 0.05, 0.03, 0.04, 0x8f8d86, { umriss: 0.001 }), (r() - 0.5) * 1.4, k < 3 ? 0.93 : 0.015, HZ + (r() - 0.5) * 1.0 + (k < 3 ? 0 : 0.6), r(), r() * 3, r()));
  benz.position.set(0, 0, AZ0 - L / 2 - 0.15 + 0.05);
  anbau.add(benz);
  anbau.position.set(-GX - AX - 0.04, 0, 0.05);
  platz.add(anbau);

  // Gruppe in die Welt: neben der Betonfläche, der Benz zeigt Richtung Werkstatt
  platz.position.set(-15.2, 0, 7.4);
  platz.rotation.y = -Math.PI / 2;
  scene.add(platz);
  // Klickbare Teile
  merke(benz, 'benz', 'Mercedes 123', null);
  merke(ww, 'wohnwagen', 'Wohnwagen', null);
  merke(dach, 'carport', 'Carport', null);
  merke(weg, 'turnmatte', 'Turnmatte', null);

  // Eiche über dem Carport
  const eiche = new THREE.Group();
  eiche.add(setze(zylinder(0.32, 0.5, 4.2, 0x5a3e26, { umriss: 0.006 }, 12), 0, 2.1, 0));
  for (const [ax, ay, az, rr] of [[1.2, 3.8, 0.4, 0.28], [-1.0, 3.6, -0.6, 0.25], [0.3, 4.0, -1.2, 0.22]]) {
    const ast = zylinder(0.12, rr, 2.4, 0x5a3e26, { umriss: 0.004 }, 8);
    ast.position.set(ax * 0.5, ay, az * 0.5);
    ast.rotation.set(az * 0.5, 0, -ax * 0.5);
    eiche.add(ast);
  }
  const laub = [0x3a6a2c, 0x4a7a35, 0x2f5a24];
  for (let k = 0; k < 9; k++) {
    const kr = teil(new THREE.IcosahedronGeometry(1.5 + r() * 0.9, 1), laub[k % 3], { umriss: 0.012 });
    kr.position.set((r() - 0.5) * 4.5, 4.6 + r() * 2.2, (r() - 0.5) * 4.5);
    eiche.add(kr);
  }
  eiche.position.set(-19.3, 0, 8.6);
  scene.add(eiche);

  // Hindernisse (Weltkoordinaten): großes Carport mit Wohnwagen und Terrasse, Anbau mit Benz, Eiche, Matte
  hindernis(-18.2, -11.4, 5.6, 10.7); // Carport + Wohnwagen (Deichsel zur Werkstatt) + Terrasse
  hindernis(-17.9, -12.4, 3.0, 5.7); // Anbau mit dem Benz
  hindernis(-19.8, -18.8, 8.1, 9.1); // Eiche
  return { benz, wohnwagen: ww };
}
