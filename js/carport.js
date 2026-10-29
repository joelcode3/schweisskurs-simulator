// Auf der Wiese neben der Betonfläche: großes Carport unter einer Eiche, darunter ein Wohnwagen mit kleiner Holzterrasse und
// Lichterkette. Hinten am Wohnwagen hat Dennis ein kleines, wackliges Carport mit blauer Plane angebaut, darunter sein ein und
// alles: ein weißer Mercedes 123. Auf dem großen Carport liegen alte Turnmatten, beschwert mit Gehwegplatten (gegen die lauten
// Eicheln). Heute Nacht um 4 hat der Wind eine Matte runtergeweht, und die Gehwegplatte ist durch die Plane in die Motorhaube.
import * as THREE from 'three';
import { toon, teil, quader, rundQuader, zylinder, kugel, setze, leinwandTextur, zufall } from './toon.js';

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
  // liegt flach im Gras an der Rückseite vom Carport (man kann drüberlaufen und -fahren), etwas verrutscht, Ecke umgeknickt
  const weg = new THREE.Group();
  weg.add(setze(teil(new THREE.BoxGeometry(1.0, 0.06, 1.7), 0, { material: matteMat, umriss: 0.004 }), 0, 0.03, 0));
  weg.add(setze(teil(new THREE.BoxGeometry(0.4, 0.05, 0.4), 0, { material: matteMat, umriss: 0.003 }), 0.3, 0.075, 0.65, 0, 0.1, 0));
  for (const sz of [-0.6, 0.6]) for (const sx of [-1, 1]) weg.add(setze(teil(new THREE.TorusGeometry(0.05, 0.012, 4, 10, Math.PI), 0x1d1d1f, { umriss: false }), sx * 0.5, 0.03, sz, 0, Math.PI / 2, 0));
  weg.position.set(-1.4, 0, GZ1 + 1.5); weg.rotation.y = 1.2;
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
  // Korpus im Seitenprofil mit stark gerundeten Ecken (vorne/hinten oben rund wie bei alten Wohnwagen), Kanten zur Seite
  // ebenfalls abgerundet; Textur (Streifen) läuft rundherum
  {
    // (Form um die Fasenbreite kleiner, damit die Außenmaße stimmen und Fenster/Tür außen sitzen)
    const bs = 0.084, ro = 0.42, ru = 0.12, z0 = -WL / 2 + bs, z1 = WL / 2 - bs, y0 = WY + bs, y1 = WY + WH - bs;
    const form = new THREE.Shape();
    form.moveTo(z0 + ru, y0);
    form.lineTo(z1 - ru, y0); form.quadraticCurveTo(z1, y0, z1, y0 + ru);
    form.lineTo(z1, y1 - ro); form.quadraticCurveTo(z1, y1, z1 - ro, y1);
    form.lineTo(z0 + ro, y1); form.quadraticCurveTo(z0, y1, z0, y1 - ro);
    form.lineTo(z0, y0 + ru); form.quadraticCurveTo(z0, y0, z0 + ru, y0);
    const bev = 0.14;
    const geo = new THREE.ExtrudeGeometry(form, { depth: WB - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bs, bevelSegments: 5, curveSegments: 12 });
    geo.translate(0, 0, -(WB - 2 * bev) / 2);
    geo.rotateY(-Math.PI / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getZ(i) + WL / 2) / WL, (pos.getY(i) - WY) / WH);
    const korpus = teil(geo, 0, { material: wwMat, umriss: 0.005 });
    ww.add(korpus);
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
  // Deichsel: V-Rahmen aus verzinktem Profil, Deichselhaube, Auflaufbremse mit Faltenbalg, Kugelkopfkupplung mit Griff,
  // Handbremshebel mit Abreißseil, Stecker-Kabel, Stützrad mit Kurbel und Klemme, Gasflaschenkasten mit Deckel und Schloss
  const VERZINKT = 0xa9aeb3, DUNKELGRAU = 0x3a3c40;
  const DZ = WL / 2; // Vorderkante Wohnwagen
  // V-Holme vom Rahmen (Ecke) bis zur Spitze, wo sie sich am Kupplungsrohr treffen (keine Lücke)
  const V0 = { x: 0.8, z: DZ - 0.2 }, V1 = { x: 0.06, z: DZ + 1.0 };
  for (const sx of [-1, 1]) {
    const dx = sx * (V1.x - V0.x), dz = V1.z - V0.z, l = Math.hypot(dx, dz);
    const d = quader(0.07, 0.12, l + 0.06, VERZINKT, { umriss: 0.003 });
    d.position.set(sx * (V0.x + V1.x) / 2, WY - 0.06, (V0.z + V1.z) / 2); d.rotation.y = Math.atan2(dx, dz); ww.add(d);
    for (let k = 0; k < 5; k++) { const t = 0.12 + k * 0.18; ww.add(setze(zylinder(0.012, 0.012, 0.075, 0x6e7177, { umriss: false }, 6), sx * (V0.x + (V1.x - V0.x) * t), WY - 0.06, V0.z + dz * t, 0, 0, Math.PI / 2)); } // Schraubenköpfe
  }
  // Knotenblech an der Spitze, Querträger am Aufbau, Anschraubwinkel zum Rahmen
  ww.add(setze(quader(0.26, 0.14, 0.2, VERZINKT, { umriss: 0.003 }), 0, WY - 0.06, V1.z - 0.04));
  ww.add(setze(quader(1.5, 0.09, 0.07, VERZINKT, { umriss: 0.003 }), 0, WY - 0.06, DZ - 0.02));
  for (const sx of [-1, 1]) ww.add(setze(quader(0.16, 0.16, 0.16, VERZINKT, { umriss: 0.002 }), sx * V0.x, WY - 0.05, V0.z + 0.02));
  // Deichselhaube (cremefarbenes Kunststoff-Dreieck über dem V)
  const haubeForm = new THREE.Shape();
  haubeForm.moveTo(-0.5, 0); haubeForm.lineTo(0.5, 0); haubeForm.quadraticCurveTo(0.42, 0.55, 0.12, 0.98); haubeForm.lineTo(-0.12, 0.98); haubeForm.quadraticCurveTo(-0.42, 0.55, -0.5, 0);
  const haubeGeo = new THREE.ExtrudeGeometry(haubeForm, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 });
  haubeGeo.rotateX(Math.PI / 2);
  const haube = teil(haubeGeo, 0xe4dfd2, { umriss: 0.003 });
  haube.position.set(0, WY + 0.12, DZ + 0.06);
  ww.add(haube);
  // Auflaufbremse: Rohr mit schwarzem Faltenbalg, davor die Kugelkopfkupplung mit Griff und Verschleißanzeige
  ww.add(setze(zylinder(0.045, 0.045, 0.5, DUNKELGRAU, { umriss: 0.002 }, 12), 0, WY - 0.03, DZ + 1.07, Math.PI / 2, 0, 0));
  for (let k = 0; k < 6; k++) ww.add(setze(teil(new THREE.TorusGeometry(0.05, 0.012, 6, 14), 0x1d1d1f, { umriss: false }), 0, WY - 0.03, DZ + 1.0 + k * 0.03));
  ww.add(setze(zylinder(0.035, 0.035, 0.2, VERZINKT, { umriss: 0.002 }, 10), 0, WY - 0.03, DZ + 1.38, Math.PI / 2, 0, 0));
  const kupplung = new THREE.Group();
  kupplung.add(setze(quader(0.11, 0.09, 0.2, 0xc8352a, { umriss: 0.003 }), 0, 0.02, 0));
  kupplung.add(setze(teil(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), DUNKELGRAU, { umriss: 0.002 }), 0, -0.03, 0.06, Math.PI, 0, 0));
  const griff = new THREE.Group();
  griff.add(setze(quader(0.04, 0.03, 0.26, 0xc8352a, { umriss: 0.002 }), 0, 0, -0.1));
  griff.add(setze(quader(0.07, 0.035, 0.05, 0x1d1d1f, { umriss: 0.002 }), 0, 0.005, -0.22));
  griff.position.set(0, 0.08, 0.06); griff.rotation.x = 0.12;
  kupplung.add(griff);
  kupplung.add(setze(quader(0.03, 0.015, 0.02, 0x3fa34a, { umriss: false }), 0.058, 0.03, 0.02));
  kupplung.position.set(0, WY - 0.03, DZ + 1.55);
  ww.add(kupplung);
  // Handbremshebel (gebogen, mit Griff) und rotes Abreißseil in einer Schlaufe
  const hebel = new THREE.Group();
  hebel.add(setze(quader(0.035, 0.42, 0.03, 0x1d1d1f, { umriss: 0.002 }), 0, 0.2, 0));
  hebel.add(setze(zylinder(0.022, 0.022, 0.1, 0x2a2c30, { umriss: 0.002 }, 8), 0, 0.42, 0, 0, 0, Math.PI / 2));
  hebel.position.set(0.12, WY - 0.02, DZ + 0.92); hebel.rotation.x = 0.75;
  ww.add(hebel);
  const seil = new THREE.CatmullRomCurve3([[0.12, WY + 0.08, DZ + 1.02], [0.2, WY - 0.12, DZ + 1.15], [0.16, WY - 0.2, DZ + 1.32], [0.06, WY - 0.08, DZ + 1.45]].map((q) => new THREE.Vector3(...q)));
  ww.add(teil(new THREE.TubeGeometry(seil, 20, 0.006, 4, false), 0xc8352a, { umriss: false }));
  // 13-poliger Stecker am Spiralkabel, hängt am Halter
  const kabel = [];
  for (let k = 0; k <= 40; k++) { const t = k / 40; kabel.push(new THREE.Vector3(-0.14 + Math.cos(t * 30) * 0.025, WY + 0.04 - t * 0.28 - Math.sin(t * Math.PI) * 0.05, DZ + 0.95 + t * 0.32 + Math.sin(t * 30) * 0.025)); }
  ww.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(kabel), 120, 0.005, 4, false), 0x1d1d1f, { umriss: false }));
  ww.add(setze(zylinder(0.032, 0.03, 0.08, 0x1d1d1f, { umriss: 0.002 }, 12), -0.14, WY - 0.28, DZ + 1.29, Math.PI / 2 - 0.4, 0, 0));
  // Stützrad: Rohr mit Klemme, Kurbel oben, kleines Rad unten in der Gabel
  const SZ = DZ + 0.7, SX = V0.x + (V1.x - V0.x) * ((SZ - V0.z) / (V1.z - V0.z)) + 0.08; // direkt außen am rechten Holm
  ww.add(setze(zylinder(0.035, 0.035, 0.6, VERZINKT, { umriss: 0.002 }, 10), SX, 0.42, SZ));
  ww.add(setze(zylinder(0.028, 0.028, 0.32, 0xd8dbde, { umriss: false }, 10), SX, 0.16, SZ));
  ww.add(setze(quader(0.1, 0.08, 0.1, VERZINKT, { umriss: 0.002 }), SX, WY - 0.06, SZ));
  ww.add(setze(zylinder(0.012, 0.012, 0.16, 0x1d1d1f, { umriss: false }, 6), SX + 0.09, WY - 0.06, SZ, 0, 0, Math.PI / 2));
  ww.add(setze(quader(0.14, 0.02, 0.02, 0x1d1d1f, { umriss: 0.001 }), SX + 0.06, 0.75, SZ));
  ww.add(setze(zylinder(0.015, 0.015, 0.08, 0x1d1d1f, { umriss: false }, 6), SX + 0.13, 0.79, SZ));
  ww.add(setze(quader(0.08, 0.1, 0.03, VERZINKT, { umriss: 0.002 }), SX, 0.06, SZ - 0.04));
  ww.add(setze(quader(0.08, 0.1, 0.03, VERZINKT, { umriss: 0.002 }), SX, 0.06, SZ + 0.04));
  ww.add(setze(zylinder(0.065, 0.065, 0.045, 0x1d1d1f, { umriss: 0.002 }, 14), SX, 0.065, SZ, 0, 0, Math.PI / 2));
  ww.add(setze(zylinder(0.03, 0.03, 0.05, 0xc9cdd2, { umriss: false }, 10), SX, 0.065, SZ, 0, 0, Math.PI / 2));
  // Gasflaschenkasten mit Deckelfuge, Schloss und Lüftungsschlitzen
  ww.add(setze(quader(1.1, 0.5, 0.45, 0xe4dfd2, { umriss: 0.003 }), 0, WY + 0.25, DZ + 0.3));
  ww.add(setze(quader(1.12, 0.06, 0.47, 0xd2cbbb, { umriss: 0.002 }), 0, WY + 0.5, DZ + 0.3));
  ww.add(setze(quader(1.1, 0.01, 0.005, 0x9a958a, { umriss: false }), 0, WY + 0.44, DZ + 0.53));
  ww.add(setze(zylinder(0.018, 0.018, 0.012, 0xc9cdd2, { umriss: false }, 10), 0, WY + 0.35, DZ + 0.53, Math.PI / 2, 0, 0));
  for (let k = 0; k < 4; k++) ww.add(setze(quader(0.16, 0.012, 0.005, 0x6e6a60, { umriss: false }), -0.35, WY + 0.12 + k * 0.035, DZ + 0.53));
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
  // Bierkasten als Tisch: grüner Kunststoffkasten mit Griffmulden, Rippen und Aufkleber, 20 Flaschen (ein paar fehlen),
  // obendrauf ein Brettchen mit Aschenbecher und einer offenen Flasche
  const kasten = new THREE.Group();
  const KG = 0x2f6b3a, KG_D = 0x24552d;
  const KH = 0.31, KL = 0.41, KBr = 0.31;
  kasten.add(setze(quader(KL, 0.02, KBr, KG_D, { umriss: 0.002 }), 0, 0.01, 0));
  for (const sz of [-1, 1]) kasten.add(setze(quader(KL, KH, 0.016, KG, { umriss: 0.003 }), 0, KH / 2, sz * (KBr / 2 - 0.008)));
  for (const sx of [-1, 1]) kasten.add(setze(quader(0.016, KH, KBr, KG, { umriss: 0.003 }), sx * (KL / 2 - 0.008), KH / 2, 0));
  // Griffmulden (Stirnseiten), senkrechte Rippen und umlaufender Rand
  for (const sx of [-1, 1]) {
    kasten.add(setze(quader(0.004, 0.045, 0.13, 0x10200f, { umriss: false }), sx * (KL / 2 + 0.001), KH - 0.06, 0));
    for (const sz of [-0.11, 0.11]) kasten.add(setze(quader(0.012, KH - 0.08, 0.02, KG_D, { umriss: false }), sx * (KL / 2 + 0.005), KH / 2 - 0.02, sz));
  }
  for (const sz of [-1, 1]) for (const x of [-0.14, -0.05, 0.05, 0.14]) kasten.add(setze(quader(0.02, KH - 0.08, 0.012, KG_D, { umriss: false }), x, KH / 2 - 0.02, sz * (KBr / 2 + 0.005)));
  kasten.add(setze(rundQuader(KL + 0.02, 0.022, KBr + 0.02, KG_D, { umriss: 0.002 }, 0.008), 0, KH - 0.011, 0));
  // abgerundete Eckpfosten, umlaufendes Rippenband, Füße unten
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    kasten.add(setze(zylinder(0.018, 0.018, KH, KG, { umriss: 0.002 }, 8), sx * (KL / 2 - 0.006), KH / 2, sz * (KBr / 2 - 0.006)));
    kasten.add(setze(quader(0.05, 0.014, 0.05, KG_D, { umriss: 0.001 }), sx * (KL / 2 - 0.03), 0.007, sz * (KBr / 2 - 0.03)));
  }
  kasten.add(setze(rundQuader(KL + 0.012, 0.018, KBr + 0.012, KG_D, { umriss: 0.0015 }, 0.006), 0, 0.07, 0));
  // Griffloch als Durchbruch mit Steg (statt nur dunklem Strich)
  for (const sx of [-1, 1]) {
    kasten.add(setze(rundQuader(0.01, 0.05, 0.15, 0x0b160a, { umriss: false }, 0.004), sx * (KL / 2 + 0.002), KH - 0.06, 0));
    kasten.add(setze(rundQuader(0.022, 0.018, 0.16, KG, { umriss: 0.0015 }, 0.006), sx * (KL / 2 + 0.004), KH - 0.028, 0));
  }
  const etikett = leinwandTextur(128, 64, (g, b, h) => { g.fillStyle = '#f2e6c4'; g.fillRect(0, 0, b, h); g.fillStyle = '#b2241c'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('PILS', b / 2, 40); g.fillStyle = '#2f6b3a'; g.fillRect(0, 50, b, 6); });
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.075), new THREE.MeshBasicMaterial({ map: etikett }));
  schild.position.set(0, KH / 2 - 0.03, KBr / 2 + 0.012);
  kasten.add(schild);
  // Gefache und Flaschen (4 x 5), drei Plätze leer
  for (let k = 1; k < 4; k++) kasten.add(setze(quader(0.006, 0.12, KBr - 0.03, KG_D, { umriss: false }), -KL / 2 + k * KL / 4 - 0.0, KH - 0.07, 0));
  const flasche = (x, y, z, offen) => {
    const f = new THREE.Group();
    f.add(setze(zylinder(0.03, 0.03, 0.16, 0x5a2f10, { umriss: 0.0015 }, 10), 0, 0.08, 0));
    f.add(setze(zylinder(0.013, 0.029, 0.05, 0x5a2f10, { umriss: 0.0015 }, 10), 0, 0.185, 0));
    f.add(setze(zylinder(0.013, 0.013, 0.04, 0x5a2f10, { umriss: 0.0015 }, 10), 0, 0.23, 0));
    if (!offen) f.add(setze(zylinder(0.015, 0.015, 0.01, 0xc9a52a, { umriss: false }, 10), 0, 0.255, 0));
    f.add(setze(zylinder(0.0305, 0.0305, 0.06, 0xe8dcae, { umriss: false }, 10), 0, 0.08, 0));
    f.add(setze(zylinder(0.031, 0.031, 0.012, 0xb2241c, { umriss: false }, 10), 0, 0.1, 0)); // rotes Band aufs Etikett
    f.add(setze(zylinder(0.0145, 0.0185, 0.03, 0xe8dcae, { umriss: false }, 10), 0, 0.2, 0)); // Halsetikett
    if (!offen) f.add(setze(zylinder(0.0142, 0.0142, 0.022, 0xd8b440, { umriss: false }, 10), 0, 0.243, 0)); // Goldfolie
    f.position.set(x, y, z);
    return f;
  };
  const leer = new Set([3, 8, 17]);
  for (let i = 0; i < 20; i++) if (!leer.has(i)) kasten.add(flasche(-KL / 2 + 0.05 + (i % 5) * 0.077, 0.02, -KBr / 2 + 0.045 + Math.floor(i / 5) * 0.074));
  // Brettchen obendrauf mit Aschenbecher (Kippen drin) und einer offenen Flasche
  // Brett liegt oben auf dem Rand (vorher steckte es im Kasten), mit zwei Leisten drunter gegen Verrutschen
  const BY = KH + 0.012;
  kasten.add(setze(teil(new THREE.BoxGeometry(0.48, 0.022, 0.36), 0, { material: holzMat, umriss: 0.002 }), 0, BY + 0.011, 0, 0, 0.04, 0));
  for (const sx of [-1, 1]) kasten.add(setze(teil(new THREE.BoxGeometry(0.025, 0.02, 0.3), 0, { material: holzMat, umriss: 0.001 }), sx * (KL / 2 + 0.018), BY - 0.008, 0, 0, 0.04, 0));
  kasten.add(setze(zylinder(0.045, 0.035, 0.035, 0xd8d2c4, { umriss: 0.001 }, 14), 0.1, BY + 0.04, 0.06));
  for (let k = 0; k < 3; k++) kasten.add(setze(zylinder(0.004, 0.004, 0.03, k ? 0xf2f2ee : 0xd89a4a, { umriss: false }, 5), 0.1 + (k - 1) * 0.012, BY + 0.057, 0.06 + (k % 2) * 0.01, 1.2, k, 0));
  kasten.add(flasche(-0.1, BY + 0.022, -0.05, true));
  // Kronkorken und ein Feuerzeug auf dem Brett, Kondenswasser-Ring
  kasten.add(setze(zylinder(0.015, 0.015, 0.004, 0xc9a52a, { umriss: false }, 10), 0.02, BY + 0.024, -0.1, 0.2, 0, 0.1));
  kasten.add(setze(rundQuader(0.025, 0.012, 0.07, 0xc8352a, { umriss: 0.001 }, 0.005), -0.02, BY + 0.028, 0.11, 0, 0.6, 0));
  kasten.add(setze(teil(new THREE.RingGeometry(0.03, 0.036, 16), 0x5a4a30, { umriss: false, mat: { transparent: true, opacity: 0.5 } }), -0.18, BY + 0.0225, 0.08, -Math.PI / 2, 0, 0));
  kasten.position.set(0.35, 0.18, -0.7);
  kasten.rotation.y = Math.PI / 2;
  terr.add(kasten);
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
  // Benz steht andersrum (Front zur Werkstatt): die Motorhaube liegt jetzt am anderen Ende, das Loch in der Plane darüber
  const BENZ_Z = AZ0 - 4.7 / 2 - 0.1;
  const LOCH = { x: -0.05, z: BENZ_Z - (4.7 / 2 - 0.68), r: 0.42 };
  const PZ = (AZ0 + AZ1) / 2; // Mitte der Plane
  // Plane: verblichenes, verdrecktes Gewebe mit Verstärkungsfäden, Laub und Wasserflecken
  const planeTex = leinwandTextur(256, 512, (g, b, h) => {
    g.fillStyle = '#2f6fd0'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 2500; i++) { const v = r(); g.fillStyle = v < 0.5 ? 'rgba(20,50,120,0.18)' : 'rgba(120,170,230,0.15)'; g.fillRect(r() * b, r() * h, 2, 2); }
    g.strokeStyle = 'rgba(15,40,100,0.35)'; g.lineWidth = 1;
    for (let x = 0; x < b; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(200,215,230,0.08)'; g.beginPath(); g.ellipse(r() * b, r() * h, 20 + r() * 40, 15 + r() * 30, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,50,30,0.25)'; g.beginPath(); g.ellipse(r() * b, r() * h, 4 + r() * 16, 3 + r() * 10, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 12; i++) { g.fillStyle = r() < 0.5 ? '#7a5a2a' : '#5a6a2a'; g.beginPath(); g.ellipse(r() * b, r() * h, 5, 3, r() * 3, 0, Math.PI * 2); g.fill(); }
  });
  const planeMat = toon(0xffffff, { map: planeTex, side: THREE.DoubleSide });
  // Höhe der Plane: hängt zwischen den Latten durch, um das Loch herum tief runtergedrückt und eingerissen
  const lochRand = (w) => LOCH.r * (0.8 + 0.22 * Math.sin(w * 5 + 1) + 0.12 * Math.sin(w * 13) + 0.07 * Math.sin(w * 29));
  const planeY = (x, z) => {
    const u = x / (AX + 0.25), v = (z - PZ) / ((AZ0 - AZ1) / 2 + 0.25);
    const d = Math.hypot(x - LOCH.x, z - LOCH.z);
    return -0.18 * (1 - u * u) * (1 - v * v) + Math.sin(x * 9 + z * 5) * 0.012 - 0.16 * Math.exp(-((d / 0.55) ** 2));
  };
  const planeGeo = new THREE.PlaneGeometry(2 * AX + 0.5, AZ0 - AZ1 + 0.5, 40, 70).toNonIndexed();
  planeGeo.rotateX(-Math.PI / 2);
  const pp = planeGeo.attributes.position, puv = planeGeo.attributes.uv;
  const P = [], UV = [];
  // Risse: vom Loch laufen zwei Schlitze weg, dort fehlt ein schmaler Streifen
  const schlitze = [[0.6, 0.55], [2.6, 0.75], [4.3, 0.45]];
  for (let i = 0; i < pp.count; i += 3) {
    let cx = 0, cz = 0;
    for (let k = 0; k < 3; k++) { cx += pp.getX(i + k); cz += pp.getZ(i + k) + PZ; }
    cx /= 3; cz /= 3;
    const w = Math.atan2(cz - LOCH.z, cx - LOCH.x), d = Math.hypot(cx - LOCH.x, cz - LOCH.z);
    if (d < lochRand(w)) continue;
    if (schlitze.some(([sw, sl]) => Math.abs(Math.sin(w - sw)) * d < 0.025 && Math.cos(w - sw) > 0 && d < LOCH.r + sl)) continue;
    for (let k = 0; k < 3; k++) {
      const x = pp.getX(i + k), z = pp.getZ(i + k) + PZ;
      P.push(x, planeY(x, z), z - PZ);
      UV.push(puv.getX(i + k), puv.getY(i + k));
    }
  }
  const planeNeu = new THREE.BufferGeometry();
  planeNeu.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  planeNeu.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  planeNeu.computeVertexNormals();
  const planeMesh = teil(planeNeu, 0, { material: planeMat, umriss: false });
  planeMesh.position.set(0, AH + 0.12, PZ);
  anbau.add(planeMesh);
  // Ösen am Rand
  for (let k = 0; k < 10; k++) anbau.add(setze(teil(new THREE.TorusGeometry(0.02, 0.006, 4, 8), 0xc9cdd2, { umriss: false }), (k % 2 ? 1 : -1) * (AX + 0.24), AH + 0.1, AZ0 - Math.floor(k / 2) * 1.2, Math.PI / 2, 0, 0));
  // Fetzen am Lochrand: lange, schmale, verdrehte Streifen, die schlaff runterhängen; dazu ausgefranste Fäden
  for (let k = 0; k < 11; k++) {
    const w = k / 11 * Math.PI * 2 + r() * 0.3;
    const rr = lochRand(w) * 1.02;
    const x0 = LOCH.x + Math.cos(w) * rr, z0 = LOCH.z + Math.sin(w) * rr;
    const lang = 0.2 + r() * 0.5, breit = 0.06 + r() * 0.12;
    const g = new THREE.PlaneGeometry(breit, lang, 1, 8);
    g.translate(0, -lang / 2, 0);
    const gp = g.attributes.position;
    for (let i = 0; i < gp.count; i++) {
      const t = -gp.getY(i) / lang;
      gp.setZ(i, Math.sin(t * Math.PI * 0.5) * 0.12 * (k % 2 ? 1 : -1) + t * t * 0.05);
      gp.setX(i, gp.getX(i) * (1 - t * 0.5) + Math.sin(t * 3 + k) * 0.02);
    }
    g.computeVertexNormals();
    const f = new THREE.Mesh(g, planeMat);
    f.position.set(x0, AH + 0.12 + planeY(x0, z0), z0);
    f.rotation.set(0, -w + Math.PI / 2, 0);
    f.rotateX(-0.15 + r() * 0.3);
    anbau.add(f);
    for (let n = 0; n < 2; n++) {
      const fl = 0.08 + r() * 0.18;
      const faden = zylinder(0.002, 0.002, fl, 0x5a8ad8, { umriss: false, wirft: false }, 3);
      faden.position.set(x0 + (r() - 0.5) * 0.06, AH + 0.12 + planeY(x0, z0) - fl / 2, z0 + (r() - 0.5) * 0.06);
      faden.rotation.set((r() - 0.5) * 0.4, 0, (r() - 0.5) * 0.4);
      anbau.add(faden);
    }
  }

  // ---------- weißer Mercedes W123 (Limousine, nach Fotos), Gehwegplatte steckt in der Motorhaube ----------
  // Aufbau im Seitenprofil (z vorne +, y oben): ein schmaler Kern (Motorraum, Innenraumboden, Kofferraumboden) und zwei
  // seitliche Karosserie-Schalen mit sauber ausgeschnittenen, weißen Radläufen; Kanten leicht abgerundet.
  const benz = new THREE.Group();
  const WEISS = 0xf2f0ea, CHROM = 0xc9cdd2, BLAU_SITZ = 0x22345e, DUNKEL = 0x2a2c30;
  const L = 4.72, B = 1.78;
  const VA = 1.42, HA = -1.38, RAD = 0.33, BOGEN = 0.4; // Achsen, Rad, Radlauf
  const KO_Z1 = -1.36, KO_Z0 = -2.29; // Kofferraum: vorne (Rückbank-Wand) bis hinten (Heckwand innen)
  const profilKoerper = (zeichne, breite, x, farbe, opt = {}, rund = 0.035) => {
    const s = new THREE.Shape();
    zeichne(s);
    const bev = Math.min(rund, breite * 0.4);
    const geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.002, breite - 2 * bev), bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 14 });
    geo.translate(0, 0, -(breite - 2 * bev) / 2);
    geo.rotateY(-Math.PI / 2);
    const m = teil(geo, farbe, opt);
    m.position.x = x;
    return m;
  };
  // Oberkante vorne/hinten (Haube, Front, Heck) – gemeinsam für Kern und Schalen
  const vorneHinten = (s) => {
    s.lineTo(-2.3, 0.24); s.lineTo(-2.36, 0.32); s.lineTo(-2.37, 0.62); s.quadraticCurveTo(-2.37, 0.86, -2.31, 0.875);
  };
  const front = (s) => { s.lineTo(1.0, 0.865); s.lineTo(2.12, 0.85); s.quadraticCurveTo(2.35, 0.84, 2.36, 0.66); s.lineTo(2.36, 0.4); s.lineTo(2.3, 0.22); };
  // Seitenschalen mit Radläufen
  const schale = (s) => {
    s.moveTo(2.3, 0.22);
    s.lineTo(VA + BOGEN, 0.24); s.lineTo(VA + BOGEN, RAD); s.absarc(VA, RAD, BOGEN, 0, Math.PI, false);
    s.lineTo(VA - BOGEN, 0.26); s.lineTo(HA + BOGEN, 0.26); s.lineTo(HA + BOGEN, RAD); s.absarc(HA, RAD, BOGEN, 0, Math.PI, false);
    s.lineTo(HA - BOGEN, 0.24);
    vorneHinten(s);
    s.lineTo(KO_Z1, 0.885); s.lineTo(0.98, 0.88);
    front(s);
  };
  for (const sx of [-1, 1]) benz.add(profilKoerper(schale, 0.28, sx * (B / 2 - 0.14), WEISS, { umriss: 0.004 }, 0.07));
  // Kern zwischen den Rädern: Motorhaube, Armaturenbrett-Wand, Innenraumboden, Kofferraumboden, Heckwand
  benz.add(profilKoerper((s) => {
    s.moveTo(2.3, 0.22); s.lineTo(-2.3, 0.24);
    vorneHinten(s);
    s.lineTo(-2.29, 0.875); s.lineTo(KO_Z0, 0.5); s.lineTo(KO_Z1, 0.5); s.lineTo(KO_Z1, 0.86); s.lineTo(KO_Z1 + 0.06, 0.86);
    s.lineTo(KO_Z1 + 0.06, 0.55); s.lineTo(0.8, 0.55); s.lineTo(0.8, 0.8); s.lineTo(0.98, 0.86);
    // Motorraum (oben offen, die Haube ist ein eigenes Blech)
    s.lineTo(1.0, 0.72); s.lineTo(2.33, 0.72); s.lineTo(2.36, 0.4); s.lineTo(2.3, 0.22);
  }, 1.24, 0, WEISS, { umriss: 0.003 }, 0.02));
  // Fugen der Motorhaube (vorne, hinten, seitlich), dünne schwarze Seitenleiste mit Chrom, Türfugen, Griffe
  benz.add(setze(quader(B - 0.3, 0.004, 0.012, DUNKEL, { umriss: false }), 0, 0.868, 0.99));
  for (const sx of [-1, 1]) {
    benz.add(setze(quader(0.012, 0.004, 1.3, DUNKEL, { umriss: false }), sx * (B / 2 - 0.13), 0.862, 1.63));
    const x = sx * (B / 2 + 0.002);
    // Seitenleiste in drei Stücken, unterbrochen an den Radläufen (läuft nicht über den Radkasten)
    for (const [z0, z1] of [[VA + BOGEN + 0.04, L / 2 - 0.15], [HA + BOGEN + 0.04, VA - BOGEN - 0.04], [-L / 2 + 0.15, HA - BOGEN - 0.04]]) {
      benz.add(setze(quader(0.012, 0.016, z1 - z0, 0x1d1d1f, { umriss: false }), x, 0.6, (z0 + z1) / 2));
      benz.add(setze(quader(0.012, 0.004, z1 - z0, CHROM, { umriss: false }), x, 0.61, (z0 + z1) / 2));
    }
    for (const z of [0.98, -0.04, -1.02]) benz.add(setze(quader(0.006, 0.6, 0.006, DUNKEL, { umriss: false }), x, 0.58, z));
    benz.add(setze(quader(0.006, 0.006, 2.0, DUNKEL, { umriss: false }), x, 0.29, -0.03));
    for (const z of [0.3, -0.75]) benz.add(setze(rundQuader(0.025, 0.03, 0.12, CHROM, { umriss: 0.001 }, 0.012), x, 0.79, z));
    benz.add(setze(quader(0.012, 0.03, 2.05, CHROM, { umriss: false }), x * 0.995, 0.29, -0.03)); // Chrom-Schweller
  }
  // Innenraum: dunkelblaue Sitze, Teppich, Türverkleidungen, Armaturenbrett, Lenkrad (durch die Scheiben zu sehen)
  benz.add(setze(quader(1.2, 0.01, 2.0, 0x1b2440, { umriss: false }), 0, 0.556, -0.25));
  for (const sx of [-1, 1]) benz.add(setze(quader(0.012, 0.3, 2.15, BLAU_SITZ, { umriss: false }), sx * 0.605, 0.73, -0.2));
  benz.add(setze(rundQuader(1.2, 0.12, 0.34, DUNKEL, { umriss: 0.002 }, 0.04), 0, 0.86, 0.82));
  benz.add(setze(teil(new THREE.TorusGeometry(0.17, 0.016, 6, 18), 0x1d1d1f, { umriss: false }), 0.33, 1.0, 0.58, -1.1, 0, 0));
  benz.add(setze(zylinder(0.02, 0.02, 0.3, 0x1d1d1f, { umriss: false }, 6), 0.33, 0.92, 0.7, -1.1, 0, 0));
  for (const sx of [-1, 1]) {
    benz.add(setze(rundQuader(0.46, 0.12, 0.5, BLAU_SITZ, { umriss: 0.002 }, 0.05), sx * 0.32, 0.63, 0.22));
    benz.add(setze(rundQuader(0.46, 0.6, 0.13, BLAU_SITZ, { umriss: 0.002 }, 0.05), sx * 0.32, 0.97, -0.05, -0.15, 0, 0));
    benz.add(setze(rundQuader(0.26, 0.18, 0.1, BLAU_SITZ, { umriss: 0.002 }, 0.04), sx * 0.32, 1.36, -0.12, -0.15, 0, 0));
  }
  benz.add(setze(rundQuader(1.16, 0.13, 0.5, BLAU_SITZ, { umriss: 0.002 }, 0.05), 0, 0.63, -0.78));
  benz.add(setze(rundQuader(1.16, 0.56, 0.14, BLAU_SITZ, { umriss: 0.002 }, 0.05), 0, 0.92, -1.12, -0.22, 0, 0));
  // Kofferraum: Deckel mit Scharnier an der Heckscheibe (geht auf), flach (keine Wulst)
  const kofferDeckel = new THREE.Group();
  kofferDeckel.add(setze(rundQuader(B - 0.06, 0.03, 1.02, WEISS, { umriss: 0.003 }, 0.012), 0, -0.012, -0.51));
  kofferDeckel.add(setze(quader(0.16, 0.03, 0.012, CHROM, { umriss: false }), 0, -0.03, -1.02));
  kofferDeckel.add(setze(zylinder(0.018, 0.018, 0.012, CHROM, { umriss: false }, 10), 0, -0.06, -1.025, Math.PI / 2, 0, 0));
  kofferDeckel.position.set(0, 0.9, -1.33);
  benz.add(kofferDeckel);
  // Innenleben: Teppich, Verkleidung, Gummidichtung um die Öffnung, Schlossbügel, Lämpchen
  const TEPPICH = 0x2a2622, VERKL = 0x4a4a4c;
  const KM = (KO_Z0 + KO_Z1) / 2, KTIEF = KO_Z1 - KO_Z0;
  benz.add(setze(quader(1.2, 0.012, KTIEF, TEPPICH, { umriss: false }), 0, 0.506, KM));
  for (const sx of [-1, 1]) benz.add(setze(quader(0.012, 0.36, KTIEF, VERKL, { umriss: false }), sx * 0.6, 0.69, KM));
  for (const z of [KO_Z0 + 0.008, KO_Z1 - 0.008]) benz.add(setze(quader(1.2, 0.36, 0.012, VERKL, { umriss: false }), 0, 0.69, z));
  for (const sx of [-1, 1]) benz.add(setze(quader(0.025, 0.02, KTIEF + 0.1, 0x1d1d1f, { umriss: false }), sx * 0.62, 0.885, KM));
  for (const z of [KO_Z0 - 0.02, KO_Z1 + 0.02]) benz.add(setze(quader(1.26, 0.02, 0.025, 0x1d1d1f, { umriss: false }), 0, 0.885, z));
  benz.add(setze(teil(new THREE.TorusGeometry(0.025, 0.006, 4, 10, Math.PI), CHROM, { umriss: false }), 0, 0.89, KO_Z0 + 0.02));
  benz.add(setze(quader(0.08, 0.025, 0.02, 0xfff3c4, { umriss: false }), -0.45, 0.84, KO_Z1 - 0.02));
  // Ersatzrad flach in der Ecke, Warndreieck-Box, Verbandskasten
  const ersatz = new THREE.Group();
  ersatz.add(teil(new THREE.CylinderGeometry(0.28, 0.28, 0.17, 20), 0x1d1d1f, { umriss: 0.002 }));
  ersatz.add(setze(zylinder(0.17, 0.17, 0.175, 0xb8bcc2, { umriss: false }, 14), 0, 0, 0));
  ersatz.position.set(-0.3, 0.6, KO_Z1 - 0.32);
  benz.add(ersatz);
  benz.add(setze(quader(0.46, 0.06, 0.09, 0xc8352a, { umriss: 0.002 }), 0.2, 0.54, KO_Z0 + 0.1));
  benz.add(setze(quader(0.22, 0.09, 0.14, 0xf2f2ee, { umriss: 0.002 }), 0.42, 0.555, KO_Z1 - 0.12));
  benz.add(setze(quader(0.04, 0.02, 0.04, 0xc8352a, { umriss: false }), 0.42, 0.605, KO_Z1 - 0.12));
  benz.add(setze(quader(0.05, 0.02, 0.012, 0xc8352a, { umriss: false }), 0.42, 0.605, KO_Z1 - 0.12, 0, Math.PI / 2, 0));
  // Deckel innen: graues Innenblech mit Versteifungen, Schwanenhals-Scharniere
  kofferDeckel.add(setze(quader(B - 0.16, 0.012, 0.92, 0x8a8d90, { umriss: false }), 0, -0.034, -0.5));
  for (const x of [-0.45, 0, 0.45]) kofferDeckel.add(setze(quader(0.05, 0.02, 0.85, 0x6e7177, { umriss: false }), x, -0.045, -0.5));
  for (const sx of [-1, 1]) {
    const hals = new THREE.CatmullRomCurve3([[sx * 0.55, -0.04, -0.12], [sx * 0.55, -0.2, -0.02], [sx * 0.55, -0.27, 0.1]].map((q) => new THREE.Vector3(...q)));
    kofferDeckel.add(teil(new THREE.TubeGeometry(hals, 12, 0.014, 5, false), 0x3a3c40, { umriss: 0.001 }));
  }
  // Kettenhemd: graues Ringgeflecht, ausgebreitet, Ärmel etwas hochgeschlagen
  const ringTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#4a4d52'; g.fillRect(0, 0, b, h);
    for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? 4 : 0; x < b; x += 8) {
      g.strokeStyle = '#b8bcc2'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.8; g.beginPath(); g.arc(x - 0.6, y - 0.6, 2.6, Math.PI, Math.PI * 1.6); g.stroke();
    }
  }, [2, 2]);
  const ringMat = toon(0xffffff, { map: ringTex });
  const kettenhemd = new THREE.Group();
  kettenhemd.add(setze(teil(new THREE.BoxGeometry(0.42, 0.016, 0.5), 0, { material: ringMat, umriss: 0.002 }), 0, 0, 0));
  for (const sx of [-1, 1]) kettenhemd.add(setze(teil(new THREE.BoxGeometry(0.28, 0.014, 0.13), 0, { material: ringMat, umriss: 0.002 }), sx * 0.3, 0.004, 0.17, 0, sx * 0.5, 0));
  kettenhemd.add(setze(teil(new THREE.TorusGeometry(0.07, 0.015, 6, 14), 0, { material: ringMat, umriss: 0.001 }), 0, 0.012, 0.25, Math.PI / 2, 0, 0));
  kettenhemd.position.set(0.25, 0.518, -1.78);
  kettenhemd.rotation.y = 0.2;
  benz.add(kettenhemd);
  // Peitsche: Griff mit Lederwicklung und Knauf, lange geflochtene Schnur in Schlaufen
  const peitsche = new THREE.Group();
  peitsche.add(setze(zylinder(0.016, 0.02, 0.28, 0x2a1a10, { umriss: 0.0015 }, 8), 0, 0, 0, 0, 0, Math.PI / 2));
  for (let k = 0; k < 6; k++) peitsche.add(setze(teil(new THREE.TorusGeometry(0.019, 0.004, 4, 10), 0x4a2a18, { umriss: false }), -0.1 + k * 0.035, 0, 0, 0, Math.PI / 2, 0));
  peitsche.add(setze(kugel(0.024, 0x1d1d1f, { umriss: 0.0015 }, 8), -0.15, 0, 0));
  const schnur = [];
  for (let k = 0; k <= 60; k++) { const t = k / 60; const w = t * Math.PI * 3.2; const rr = 0.16 - t * 0.05; schnur.push(new THREE.Vector3(0.14 + rr + Math.cos(w + Math.PI) * rr, 0.004 + t * 0.012, Math.sin(w + Math.PI) * rr)); }
  peitsche.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(schnur), 100, 0.007, 5, false), 0x1d1d1f, { umriss: 0.001 }));
  peitsche.position.set(-0.32, 0.53, -2.12);
  peitsche.rotation.y = -0.4;
  benz.add(peitsche);
  // Scheiben wie die Werkstattfenster: hell und durchsichtig, man sieht Sitze und Lenkrad
  const glas = new THREE.MeshBasicMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide });
  const spiegelGlas = toon(0x3a4a58);
  // Kabine: langes, flaches Dach, schräge Front- und Heckscheibe, dünne A-Säulen, schmale B-Säule, breite C-Säule mit
  // kleinem Dreiecksfenster davor, Chromrahmen um alle Scheiben
  const kab = new THREE.Group();
  const PROFIL = [[0.98, 0.0], [0.38, 0.53], [-0.95, 0.54], [-1.33, 0.0]]; // (z, y) über der Gürtellinie
  const glasHaus = profilKoerper((s) => { PROFIL.forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y))); }, B - 0.28, 0, 0, { material: glas, umriss: false }, 0);
  glasHaus.raycast = () => {};
  kab.add(glasHaus);
  const stab = (a, b, x, breite, dicke, farbe, opt = { umriss: 0.002 }) => {
    const A = new THREE.Vector3(x, a[1], a[0]), Bv = new THREE.Vector3(x, b[1], b[0]);
    const m = quader(breite, dicke, A.distanceTo(Bv), farbe, opt);
    m.position.copy(A).add(Bv).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), Bv.clone().sub(A).normalize());
    return m;
  };
  kab.add(setze(rundQuader(B - 0.2, 0.05, 1.4, WEISS, { umriss: 0.003 }, 0.025), 0, 0.55, -0.285));
  for (const sx of [-1, 1]) {
    const xs = sx * (B / 2 - 0.13);
    kab.add(stab(PROFIL[0], PROFIL[1], xs, 0.06, 0.05, WEISS)); // A-Säule
    kab.add(stab([-0.03, 0.0], [-0.07, 0.53], xs, 0.07, 0.06, WEISS)); // B-Säule
    kab.add(profilKoerper((s) => { s.moveTo(-1.33, 0); s.lineTo(-0.95, 0.54); s.lineTo(-0.8, 0.54); s.lineTo(-1.06, 0); }, 0.06, xs, WEISS, { umriss: 0.002 }, 0.01)); // C-Säule
    kab.add(stab([-0.86, 0.02], [-0.8, 0.5], xs + sx * 0.005, 0.02, 0.02, CHROM, { umriss: false })); // Steg vorm Dreiecksfenster
    kab.add(stab([0.38, 0.51], [-0.95, 0.52], xs + sx * 0.03, 0.015, 0.02, CHROM, { umriss: false }));
    kab.add(stab([0.95, 0.01], [-1.3, 0.01], xs + sx * 0.035, 0.015, 0.02, CHROM, { umriss: false }));
    kab.add(stab(PROFIL[0], PROFIL[1], xs + sx * 0.035, 0.012, 0.015, CHROM, { umriss: false }));
  }
  // Front- und Heckscheibe: Chromrahmen oben und unten
  for (const p of PROFIL) kab.add(setze(quader(B - 0.3, 0.02, 0.025, CHROM, { umriss: false }), 0, p[1] + (p[1] > 0.1 ? -0.01 : 0.01), p[0]));
  kab.position.set(0, 0.88, 0);
  benz.add(kab);
  // Stoßstangen: Chrom mit schwarzer Gummileiste, um die Ecken gezogen
  for (const z of [L / 2 + 0.04, -L / 2 - 0.05]) {
    benz.add(setze(rundQuader(B + 0.02, 0.13, 0.12, CHROM, { umriss: 0.003 }, 0.05), 0, 0.4, z));
    benz.add(setze(quader(B + 0.03, 0.035, 0.11, 0x1d1d1f, { umriss: false }), 0, 0.41, z));
    for (const sx of [-1, 1]) benz.add(setze(rundQuader(0.1, 0.13, 0.32, CHROM, { umriss: 0.002 }, 0.04), sx * (B / 2 - 0.02), 0.4, z - Math.sign(z) * 0.13));
  }
  // Kühlergrill: hoher Chromrahmen mit waagerechten Lamellen und Mittelsteg, Stern auf der Haube
  benz.add(setze(rundQuader(0.46, 0.36, 0.05, CHROM, { umriss: 0.002 }, 0.03), 0, 0.64, L / 2 - 0.015));
  for (let k = 0; k < 8; k++) benz.add(setze(quader(0.38, 0.012, 0.02, 0x3a3c40, { umriss: false }), 0, 0.5 + k * 0.038, L / 2 + 0.012));
  benz.add(setze(quader(0.018, 0.3, 0.03, CHROM, { umriss: false }), 0, 0.64, L / 2 + 0.018));
  benz.add(setze(zylinder(0.012, 0.012, 0.05, CHROM, { umriss: false }, 6), 0, 0.88, L / 2 - 0.06));
  benz.add(setze(teil(new THREE.TorusGeometry(0.035, 0.007, 6, 16), CHROM, { umriss: 0.001 }), 0, 0.93, L / 2 - 0.06));
  for (let k = 0; k < 3; k++) benz.add(setze(quader(0.006, 0.035, 0.006, CHROM, { umriss: false }), Math.cos(k * 2.094 + Math.PI / 2) * 0.017, 0.93 + Math.sin(k * 2.094 + Math.PI / 2) * 0.017, L / 2 - 0.06, 0, 0, k * 2.094));
  // Scheinwerfer wie beim W123: breite Rechteck-Einheit mit kräftigem Chromrand, helle Streuscheibe mit sichtbaren
  // Reflektoren dahinter (großes Abblend-, kleines Fernlicht), außen der orangefarbene Blinker um die Ecke
  const scheinwerferTex = leinwandTextur(256, 128, (g, b, h) => {
    g.fillStyle = '#eef3f5'; g.fillRect(0, 0, b, h);
    for (const [cx, rr] of [[86, 52], [204, 36]]) {
      const v = g.createRadialGradient(cx - 8, h / 2 - 10, 4, cx, h / 2, rr);
      v.addColorStop(0, '#ffffff'); v.addColorStop(0.35, '#dfe6ea'); v.addColorStop(0.75, '#a9b6be'); v.addColorStop(1, '#d6dde1');
      g.fillStyle = v; g.beginPath(); g.arc(cx, h / 2, rr, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff8d8'; g.beginPath(); g.arc(cx, h / 2, rr * 0.18, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(120,140,150,0.45)'; g.lineWidth = 2;
    for (let y = 10; y < h; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
    for (let x = 12; x < b; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = '#b8c2c8'; g.fillRect(150, 0, 5, h);
  });
  for (const sx of [-1, 1]) {
    const x = sx * 0.54;
    benz.add(setze(rundQuader(0.48, 0.25, 0.05, CHROM, { umriss: 0.003 }, 0.02), x, 0.66, L / 2 + 0.035));
    const glasScheinw = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.2), new THREE.MeshBasicMaterial({ map: scheinwerferTex }));
    glasScheinw.position.set(x, 0.66, L / 2 + 0.062);
    if (sx > 0) glasScheinw.scale.x = -1; // Fernlicht jeweils innen
    benz.add(glasScheinw);
    benz.add(setze(rundQuader(0.12, 0.2, 0.16, 0xf29a14, { umriss: 0.002 }, 0.04), sx * (B / 2 - 0.06), 0.66, L / 2 + 0.0));
    benz.add(setze(quader(0.1, 0.17, 0.01, 0xffb43a, { umriss: false }), sx * (B / 2 - 0.06), 0.66, L / 2 + 0.082));
  }
  // Rückleuchten: flach im Blech, eine geriffelte Fläche (rot, orange Blinker, weißer Rückfahrscheinwerfer, rot) mit Chromrahmen
  const ruecklichtTex = leinwandTextur(256, 112, (g, b, h) => {
    const felder = [['#b32a20', 0, 0.52], ['#e8901c', 0.52, 0.74], ['#eeeeea', 0.74, 0.88], ['#b32a20', 0.88, 1]];
    for (const [f, a0, a1] of felder) { g.fillStyle = f; g.fillRect(a0 * b, 0, (a1 - a0) * b, h); }
    g.fillStyle = '#8a1f18'; g.fillRect(0, h * 0.55, b * 0.52, h * 0.45);
    for (let y = 6; y < h; y += 9) { g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, y, b, 3); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y - 3, b, 2); }
    g.fillStyle = '#c9cdd2'; for (const a of [0.52, 0.74, 0.88]) g.fillRect(a * b - 2, 0, 4, h);
  });
  for (const sx of [-1, 1]) {
    benz.add(setze(quader(0.66, 0.15, 0.01, CHROM, { umriss: 0.002 }), sx * 0.52, 0.7, -L / 2 - 0.055));
    const rl = new THREE.Mesh(new THREE.PlaneGeometry(0.63, 0.12), toon(0xffffff, { map: ruecklichtTex }));
    rl.position.set(sx * 0.52, 0.7, -L / 2 - 0.062); rl.rotation.y = Math.PI;
    if (sx < 0) rl.scale.x = -1; // Blinker und Rückfahrlicht jeweils innen
    benz.add(rl);
  }
  // Räder mit Chrom-Radkappen (Ring, Schlitze, Stern in der Mitte), passend in den weißen Radläufen
  for (const z of [VA, HA]) for (const sx of [-1, 1]) {
    const x = sx * (B / 2 - 0.14);
    benz.add(setze(zylinder(RAD, RAD, 0.2, 0x1d1d1f, { umriss: 0.003 }, 22), x, RAD, z, 0, 0, Math.PI / 2));
    benz.add(setze(zylinder(0.21, 0.21, 0.205, 0xd6d9dd, { umriss: false }, 18), x, RAD, z, 0, 0, Math.PI / 2));
    benz.add(setze(teil(new THREE.TorusGeometry(0.17, 0.012, 6, 20), 0x8a8f96, { umriss: false }), x + sx * 0.104, RAD, z, 0, Math.PI / 2, 0));
    for (let k = 0; k < 10; k++) {
      const w = k / 10 * Math.PI * 2;
      benz.add(setze(quader(0.006, 0.05, 0.016, 0x5a5d62, { umriss: false }), x + sx * 0.104, RAD + Math.sin(w) * 0.12, z + Math.cos(w) * 0.12, w, 0, 0));
    }
    benz.add(setze(zylinder(0.05, 0.05, 0.21, 0xa0a4aa, { umriss: false }, 12), x + sx * 0.005, RAD, z, 0, 0, Math.PI / 2));
  }
  // Außenspiegel (Chrom) an der Türecke, Scheibenwischer an der Frontscheibe
  for (const sx of [-1, 1]) {
    const sp = new THREE.Group();
    sp.add(setze(zylinder(0.012, 0.012, 0.1, CHROM, { umriss: false }, 6), sx * 0.05, 0, 0, 0, 0, Math.PI / 2));
    sp.add(setze(rundQuader(0.05, 0.1, 0.15, CHROM, { umriss: 0.002 }, 0.02), sx * 0.11, 0.02, 0));
    sp.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.08, 0.13), spiegelGlas), sx * 0.11, 0.02, -0.077));
    sp.position.set(sx * (B / 2 - 0.05), 0.97, 0.86);
    benz.add(sp);
    const wi = quader(0.5, 0.012, 0.012, 0x1d1d1f, { umriss: false });
    wi.position.set(sx * 0.3 - 0.05, 0.905, 0.9); wi.rotation.z = sx * 0.1;
    benz.add(wi);
  }
  const schildTex = leinwandTextur(512, 112, (g, b, h) => {
    g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#1f4fa8'; g.fillRect(0, 0, 52, h);
    g.fillStyle = '#f2c21c'; for (let k = 0; k < 12; k++) { const w = k / 12 * Math.PI * 2; g.beginPath(); g.arc(26 + Math.cos(w) * 15, 38 + Math.sin(w) * 15, 2.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#f4f4ef'; g.font = 'bold 28px Arial'; g.textAlign = 'center'; g.fillText('D', 26, 96);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 76px "DIN Alternate", "Arial Narrow", Arial'; g.textAlign = 'left';
    g.fillText('SE', 66, 86);
    // Plaketten (HU und Stadt) statt Bindestrich
    g.fillStyle = '#3a8fd6'; g.beginPath(); g.arc(178, 40, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#d8d2c4'; g.beginPath(); g.arc(178, 76, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1d1d1f';
    const rest = 'XY 238H';
    let fs = 76; g.font = `bold ${fs}px "DIN Alternate", "Arial Narrow", Arial`;
    while (g.measureText(rest).width > b - 214 && fs > 40) { fs -= 2; g.font = `bold ${fs}px "DIN Alternate", "Arial Narrow", Arial`; }
    g.fillText(rest, 204, 86);
    g.strokeStyle = '#1d1d1f'; g.lineWidth = 6; g.strokeRect(3, 3, b - 6, h - 6);
  });
  // Kennzeichen vorne auf dem Halter unter der Stoßstange, hinten zwischen den Rückleuchten (sitzen am Blech, nicht in der Luft)
  for (const [z, y, ry] of [[L / 2 + 0.035, 0.27, 0], [-L / 2 - 0.022, 0.52, Math.PI]]) {
    const halter = quader(0.55, 0.13, 0.03, 0x1d1d1f, { umriss: 0.001 });
    halter.position.set(0, y, z - (ry ? -0.01 : 0.01) * 1.5);
    benz.add(halter);
    const k = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), new THREE.MeshBasicMaterial({ map: schildTex }));
    k.position.set(0, y, z + (ry ? -0.006 : 0.006)); k.rotation.y = ry;
    benz.add(k);
  }
  // Auspuff: Rohr vom Motor unter dem Wagen nach hinten, Mitteltopf, Endtopf quer unter dem Heck, Endrohr, Gummihalter
  const AUS = 0x5a5d62, AUS_D = 0x3f4246;
  // durchgehend verbunden: Krümmer aus dem Motorraum runter, Rohr unter dem Wagen, Mitteltopf (Rohr läuft hindurch),
  // Endtopf quer unter dem Heck mit Einlass rechts und Auslass links, Endrohr; Gummihalter vom Wagenboden zu Rohr und Töpfen
  const ET = { z: -L / 2 + 0.5, x0: -0.5, x1: 0.15, y: 0.2 };
  const vorn = new THREE.CatmullRomCurve3([[-0.25, 0.62, L / 2 - 0.85], [-0.27, 0.42, L / 2 - 1.0], [-0.3, 0.24, L / 2 - 1.35], [-0.3, 0.2, L / 2 - 1.9], [-0.3, 0.2, 0.0], [-0.3, 0.2, -0.8], [-0.12, 0.2, -L / 2 + 0.95], [0.1, ET.y, ET.z + 0.12], [ET.x1 - 0.06, ET.y, ET.z]].map((q) => new THREE.Vector3(...q)));
  benz.add(teil(new THREE.TubeGeometry(vorn, 80, 0.03, 8, false), AUS, { umriss: 0.001 }));
  // Flansch am Krümmer
  benz.add(setze(zylinder(0.05, 0.05, 0.02, AUS_D, { umriss: 0.001 }, 10), -0.26, 0.5, L / 2 - 0.95, 0.7, 0, 0));
  // Mitteltopf: das Rohr läuft mittig durch, Übergangskegel vorne und hinten
  benz.add(setze(zylinder(0.075, 0.075, 0.5, AUS_D, { umriss: 0.002 }, 12), -0.3, 0.2, -0.3, Math.PI / 2, 0, 0));
  for (const dz of [-0.28, 0.28]) benz.add(setze(zylinder(dz > 0 ? 0.075 : 0.03, dz > 0 ? 0.03 : 0.075, 0.06, AUS_D, { umriss: 0.001 }, 12), -0.3, 0.2, -0.3 + dz, Math.PI / 2, 0, 0));
  const endtopf = zylinder(0.09, 0.09, ET.x1 - ET.x0, AUS_D, { umriss: 0.002 }, 14);
  endtopf.scale.set(1, 1, 0.7);
  endtopf.position.set((ET.x0 + ET.x1) / 2, ET.y, ET.z);
  endtopf.rotation.z = Math.PI / 2;
  benz.add(endtopf);
  for (const x of [ET.x0, ET.x1]) benz.add(setze(zylinder(0.093, 0.093, 0.015, 0x2f3236, { umriss: 0.001 }, 14), x, ET.y, ET.z, 0, 0, Math.PI / 2)); // Bördelränder
  // Auslass: aus der linken Stirnseite, Bogen nach hinten, Endrohr mit Blende ragt unter der Stoßstange raus
  const hinten = new THREE.CatmullRomCurve3([[ET.x0 + 0.02, ET.y, ET.z], [ET.x0 - 0.08, ET.y + 0.005, ET.z - 0.04], [-0.55, ET.y + 0.01, ET.z - 0.2], [-0.55, ET.y + 0.02, -L / 2 - 0.02]].map((q) => new THREE.Vector3(...q)));
  benz.add(teil(new THREE.TubeGeometry(hinten, 30, 0.03, 8, false), AUS, { umriss: 0.001 }));
  benz.add(setze(zylinder(0.038, 0.034, 0.12, 0x8a8f96, { umriss: 0.001 }, 10), -0.55, ET.y + 0.02, -L / 2 - 0.05, Math.PI / 2, 0, 0));
  benz.add(setze(zylinder(0.03, 0.03, 0.002, 0x1d1d1f, { umriss: false }, 10), -0.55, ET.y + 0.02, -L / 2 - 0.111, Math.PI / 2, 0, 0)); // Rohröffnung
  // Gummihalter (schwarze Ringe) vom Wagenboden runter zu Rohr und Töpfen
  for (const [x, z, y0] of [[-0.3, 0.6, 0.2], [-0.3, -0.9, 0.2], [ET.x0 + 0.08, ET.z, ET.y + 0.06], [ET.x1 - 0.08, ET.z, ET.y + 0.06], [-0.55, -L / 2 + 0.15, ET.y + 0.02]]) {
    benz.add(setze(zylinder(0.008, 0.008, 0.34 - y0, 0x5a5d62, { umriss: false }, 5), x, (0.34 + y0) / 2 + 0.02, z));
    benz.add(setze(teil(new THREE.TorusGeometry(0.022, 0.008, 5, 10), 0x1d1d1f, { umriss: false }), x, y0 + 0.035, z, 0, Math.PI / 2, 0));
  }
  // Antenne hinten rechts, Tankdeckel
  benz.add(setze(zylinder(0.004, 0.004, 0.7, 0x1d1d1f, { umriss: false }, 4), 0.8, 1.2, -L / 2 + 0.6, -0.2, 0, 0));
  benz.add(setze(zylinder(0.07, 0.07, 0.01, WEISS, { umriss: 0.002 }, 14), B / 2 + 0.006, 0.76, -L / 2 + 0.75, 0, 0, Math.PI / 2));

  // Motorhaube als eigenes Blech über dem Motorraum: an der Einschlagstelle tief eingedellt, in der Mitte aufgerissen
  // (zackiges Loch, Blechlappen nach innen gebogen), drumherum Knicke, abgeplatzter Lack; die Gehwegplatte steckt schräg drin
  const HZ = L / 2 - 0.68, HX = 0.05; // Einschlag (Mitte)
  const HAUBE = { x0: -0.62, x1: 0.62, z0: 0.99, z1: 2.27, y: 0.862 };
  const delle = (x, z) => {
    const d = Math.hypot(x - HX, (z - HZ) * 0.92);
    const w = Math.atan2(z - HZ, x - HX);
    return -0.13 * Math.exp(-((d / 0.26) ** 2)) - 0.02 * Math.exp(-((d / 0.5) ** 2)) + 0.012 * Math.sin(w * 7) * Math.exp(-d / 0.22) * Math.min(1, d / 0.12);
  };
  const lochR = (w) => 0.1 * (1 + 0.35 * Math.sin(w * 5 + 0.7) + 0.2 * Math.sin(w * 11));
  {
    const geo = new THREE.PlaneGeometry(HAUBE.x1 - HAUBE.x0, HAUBE.z1 - HAUBE.z0, 48, 48).toNonIndexed();
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const P = [];
    const mz = (HAUBE.z0 + HAUBE.z1) / 2;
    for (let i = 0; i < p.count; i += 3) {
      let cx = 0, cz = 0;
      for (let k = 0; k < 3; k++) { cx += p.getX(i + k); cz += p.getZ(i + k) + mz; }
      cx /= 3; cz /= 3;
      const w = Math.atan2(cz - HZ, cx - HX);
      if (Math.hypot(cx - HX, cz - HZ) < lochR(w)) continue;
      for (let k = 0; k < 3; k++) { const x = p.getX(i + k), z = p.getZ(i + k) + mz; P.push(x, HAUBE.y + delle(x, z) + 0.025 * (1 - (x / 0.62) ** 2) - 0.06 * Math.max(0, (z - 2.08) / 0.19) ** 2, z); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.computeVertexNormals();
    benz.add(teil(g, WEISS, { umriss: false, mat: { side: THREE.DoubleSide } }));
  }
  // Motorraum unter dem Loch: dunkel, Motorblock, Ventildeckel, Schläuche
  benz.add(setze(quader(1.2, 0.01, 1.25, 0x1d1d1f, { umriss: false }), 0, 0.725, 1.63));
  benz.add(setze(rundQuader(0.55, 0.16, 0.7, 0x4a4d52, { umriss: 0.002 }, 0.03), 0.05, 0.64 + 0.08, 1.6));
  benz.add(setze(rundQuader(0.3, 0.05, 0.6, 0x8a8f96, { umriss: 0.002 }, 0.02), 0.05, 0.81, 1.6));
  benz.add(setze(quader(1.24, 0.14, 0.04, WEISS, { umriss: 0.002 }), 0, 0.79, L / 2 - 0.05)); // Schlossträger vorne
  // Blechlappen am Lochrand, nach innen gebogen; Knicklinien und abgeplatzter Lack (graue Grundierung) an der Delle
  for (let k = 0; k < 9; k++) {
    const w = k / 9 * Math.PI * 2 + 0.2;
    const r0 = lochR(w);
    const x = HX + Math.cos(w) * r0, z = HZ + Math.sin(w) * r0;
    const lap = new THREE.Mesh(new THREE.PlaneGeometry(0.05 + r() * 0.04, 0.07 + r() * 0.05), toon(WEISS, { side: THREE.DoubleSide }));
    lap.position.set(x - Math.cos(w) * 0.02, HAUBE.y + delle(x, z) - 0.035, z - Math.sin(w) * 0.02);
    lap.rotation.set(0, -w + Math.PI / 2, 0); lap.rotateX(0.9 + r() * 0.5);
    benz.add(lap);
  }
  for (let k = 0; k < 14; k++) {
    const w = k / 14 * Math.PI * 2 + r() * 0.3;
    const d = 0.13 + r() * 0.22;
    const x = HX + Math.cos(w) * d, z = HZ + Math.sin(w) * d;
    const knick = quader(0.12 + r() * 0.12, 0.003, 0.006, k % 3 ? 0x7a7c80 : 0x3a3c40, { umriss: false });
    knick.position.set(x, HAUBE.y + delle(x, z) + 0.004, z);
    knick.rotation.y = -w;
    benz.add(knick);
    if (k % 2) { const lack = kugel(0.025 + r() * 0.03, 0x9a9c98, { umriss: false }, 6); lack.scale.y = 0.15; lack.position.set(x + 0.03, HAUBE.y + delle(x + 0.03, z) + 0.001, z); benz.add(lack); }
  }
  const steinplatte = platte(HX + 0.02, HAUBE.y - 0.05, HZ, 0.62, -0.3);
  benz.add(steinplatte);
  // abgebrochene Ecke der Platte auf der Haube, Splitter auf der Haube und am Boden
  benz.add(setze(quader(0.14, 0.05, 0.1, 0x8f8d86, { umriss: 0.002 }), HX + 0.38, HAUBE.y + delle(HX + 0.38, HZ + 0.2) + 0.02, HZ + 0.2, 0.1, 0.7, 0.15));
  for (let k = 0; k < 7; k++) {
    const x = (r() - 0.5) * 1.1, z = HZ + (r() - 0.5) * 1.0, boden = k >= 4;
    benz.add(setze(quader(0.03 + r() * 0.04, 0.02, 0.03 + r() * 0.03, 0x8f8d86, { umriss: 0.001 }), boden ? x * 1.6 : x, boden ? 0.012 : HAUBE.y + delle(x, z) + 0.012, boden ? z + 0.6 : z, r(), r() * 3, r()));
  }
  benz.position.set(0, 0, BENZ_Z);
  benz.rotation.y = Math.PI;
  anbau.add(benz);
  anbau.position.set(-GX - AX - 0.04, 0, 0.05);
  platz.add(anbau);

  // Gruppe in die Welt: neben der Betonfläche, der Benz zeigt Richtung Werkstatt
  platz.position.set(-15.2, 0, 7.4);
  platz.rotation.y = -Math.PI / 2;
  scene.add(platz);
  // Klickbare Teile
  merke(benz, 'benz', 'Mercedes 123', null);
  merke(kofferDeckel, 'kofferraum', 'Kofferraum', null);
  merke(kettenhemd, 'kettenhemd', 'Kettenhemd', null);
  merke(peitsche, 'peitsche', 'Gerte', null);
  // Kofferraum auf/zu (weich), Peitsche/Kettenhemd erst klickbar, wenn offen
  let kofferAuf = false, kofferWinkel = 0;
  const kofferAnimation = () => {
    const soll = kofferAuf ? 1.15 : 0;
    kofferWinkel += (soll - kofferWinkel) * 0.15;
    kofferDeckel.rotation.x = kofferWinkel;
    if (Math.abs(soll - kofferWinkel) > 0.002) requestAnimationFrame(kofferAnimation);
  };
  peitsche.userData.start = { pos: peitsche.position.clone(), rot: peitsche.rotation.clone(), eltern: benz };
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
  // (lokal -> Welt: x = -15,2 - z, z = 7,4 + x) – einzeln, damit man um alles herumlaufen und -fahren kann
  hindernis(-17.45, -12.95, 6.3, 8.5); // Wohnwagen
  hindernis(-13.0, -11.6, 6.95, 7.85); // Deichsel
  for (const wx of [-12.3, -15.2, -18.1]) for (const wz of [5.7, 9.1]) hindernis(wx - 0.15, wx + 0.15, wz - 0.15, wz + 0.15); // Carport-Pfosten
  hindernis(-15.1, -13.75, 8.5, 9.3); // Sofa auf der Terrasse
  hindernis(-14.65, -14.15, 9.45, 9.95); // Bierkasten
  hindernis(-17.65, -12.85, 3.5, 5.3); // Benz
  for (const wx of [-17.7, -15.2, -12.7]) hindernis(wx - 0.12, wx + 0.12, 3.05, 3.3); // Pfosten vom Anbau
  hindernis(-19.8, -18.8, 8.1, 9.1); // Eiche
  return {
    benz, wohnwagen: ww, kettenhemd, peitsche,
    get kofferAuf() { return kofferAuf; },
    kofferraum(auf) { kofferAuf = auf; requestAnimationFrame(kofferAnimation); },
  };
}
