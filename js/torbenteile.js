// Torben (F1): alles, was nur Torben hat und die gemeinsame Figur aus jonny.js erweitert:
// lange hellbraune Arbeitshose mit Seitentaschen, Gürtel, T-Shirt mit Flecken, Haare, Nasenstecker und Ohrringe,
// Werkzeugtasche über der Schulter (wippt beim Gehen), gekochte Spaghetti in der Hand (zwischendurch isst er daraus)
// und der Choleriker-Wurf (Werkzeug, Tasse, Flasche, Spaghetti; nur zur Seite oder auf den Boden, nie auf den Spieler).
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur } from './toon.js';

const rnd = (() => { let q = 4711; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();

// Weißes, enges T-Shirt mit ordentlich Flecken (Dreck, Schmutz, Schweiß); u = Umfang (0 = vorne Mitte, 0,5 = hinten), v = Höhe
export function torbenShirtTextur() {
  return leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#f0ede6'; g.fillRect(0, 0, b, h);
    const fleck = (u, v, r, farbe, a = 1, sx = 1, sy = 1) => {
      // vorne ist u = 0 und u = 1 (Naht): Flecken an der Naht doppelt zeichnen
      for (const du of [0, -1, 1]) {
        g.save();
        g.translate((u + du) * b, (1 - v) * h);
        g.scale(sx, sy);
        const gr = g.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
        gr.addColorStop(0, farbe.replace('A', String(a)));
        gr.addColorStop(0.65, farbe.replace('A', String(a * 0.55)));
        gr.addColorStop(1, farbe.replace('A', '0'));
        g.fillStyle = gr;
        g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
        g.restore();
      }
    };
    // Schweißränder unter den Armen, dezent
    for (const u of [0.25, 0.75]) fleck(u, 0.7, 30, 'rgba(214,196,140,A)', 0.4, 1.0, 1.6);
    // wenige, kleine Dreckflecken (Öl, Staub)
    const dreck = [[0.04, 0.42, 14, 'rgba(78,64,50,A)', 0.55], [0.93, 0.26, 12, 'rgba(70,58,46,A)', 0.5], [0.42, 0.35, 15, 'rgba(84,70,54,A)', 0.45],
      [0.6, 0.55, 12, 'rgba(96,80,60,A)', 0.4], [0.12, 0.62, 10, 'rgba(100,82,60,A)', 0.4]];
    for (const [u, v, r, f, a] of dreck) fleck(u, v, r, f, a, 1.2, 0.8);
    for (let i = 0; i < 14; i++) fleck(rnd(), 0.1 + rnd() * 0.7, 2 + rnd() * 3.5, 'rgba(90,74,58,A)', 0.4 + rnd() * 0.3);
  });
}

// Hellbraune Arbeitshose mit Farbspritzern und Dreck (u = Umfang, v = Länge)
// Hosenbein als Lathe mit Falten: leichte Ausbuchtungen, Quetschfalten am Knie, Stauchung über dem Schuh, Bund etwas ausgebeult
function hosenbein(r0, r1, h, saat, knie = false) {
  const q = (() => { let z = saat; return () => { z = (z * 1664525 + 1013904223) >>> 0; return z / 4294967296; }; })();
  const pts = [];
  const N = 22;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let r = r0 + (r1 - r0) * t;
    r *= 1 + 0.045 * Math.sin(t * 9 + saat) + 0.03 * Math.sin(t * 23 + saat * 2);
    if (knie && t > 0.78) r *= 1 + 0.07 * Math.sin((t - 0.78) * 60); // Stauchfalten über dem Schuh
    pts.push(new THREE.Vector2(r, -t * h));
  }
  const g = new THREE.LatheGeometry(pts.slice().reverse(), 28);
  const pos = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const w = Math.atan2(v.z, v.x), t = -v.y / h;
    // unrund und mit Längsfalten, die sich nach unten verschieben (Stoff hängt schief)
    const f = 1 + 0.05 * Math.sin(3 * w + t * 5 + saat) + 0.035 * Math.sin(5 * w - t * 8) + 0.025 * Math.sin(8 * w + t * 12 + q());
    v.x *= f; v.z *= f;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.translate(0, h / 2, 0);
  g.computeVertexNormals();
  return g;
}

function hosenTextur(farbe) {
  const hex = '#' + farbe.toString(16).padStart(6, '0');
  return leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = hex; g.fillRect(0, 0, b, h);
    // nur Stoff: feine Längsstruktur und etwas Falten, keine Flecken
    g.strokeStyle = 'rgba(90,64,34,0.07)'; g.lineWidth = 1;
    for (let x = 0; x < b; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.strokeStyle = 'rgba(80,56,30,0.22)'; g.lineWidth = 3;
    for (const y of [0.1, 0.18, 0.3, 0.52, 0.6, 0.74, 0.86]) { g.beginPath(); g.moveTo(0, y * h); g.quadraticCurveTo(b * 0.5, (y + 0.03) * h, b, y * h); g.stroke(); }
  });
}

// Ein Spaghetti-Strang: weiche, gebogene Röhre, die in einer Richtung hängt
function strangGeo(laenge, kruemmung, phase, dicke = 0.0048) {
  const pts = [];
  const n = 8;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(new THREE.Vector3(Math.sin(t * 5 + phase) * kruemmung * t, -t * laenge, Math.cos(t * 4.3 + phase * 1.7) * kruemmung * 0.7 * t));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, dicke, 5, false);
}
const NUDEL = 0xf0d98c, NUDEL2 = 0xe6c670;

// Fliegende Gegenstände (Werkzeug, Tasse, Flasche, Spaghetti)
function wurfModell(art) {
  const g = new THREE.Group();
  if (art === 'tasse') {
    g.add(setze(zylinder(0.042, 0.036, 0.09, 0xf4f1e8, { umriss: 0.002 }, 14), 0, 0, 0));
    g.add(setze(teil(new THREE.TorusGeometry(0.026, 0.006, 6, 12, Math.PI), 0xf4f1e8, { umriss: false }), 0.045, 0, 0, 0, 0, -Math.PI / 2));
    g.add(setze(zylinder(0.043, 0.043, 0.012, 0x2a79b8, { umriss: false }, 14), 0, 0.02, 0));
  } else if (art === 'flasche') {
    const glas = toon(0x5a2e0e, { transparent: true, opacity: 0.92 });
    g.add(teil(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 14), 0, { material: glas, umriss: 0.002 }));
    g.add(setze(teil(new THREE.CylinderGeometry(0.012, 0.03, 0.05, 14), 0, { material: glas, umriss: 0.002 }), 0, 0.1, 0));
    g.add(setze(zylinder(0.0305, 0.0305, 0.05, 0xf2e6c4, { umriss: false }, 14), 0, -0.02, 0));
  } else if (art === 'spaghetti') {
    for (let i = 0; i < 9; i++) {
      const m = teil(strangGeo(0.12 + rnd() * 0.08, 0.05, i * 1.3, 0.0055), i % 2 ? NUDEL : NUDEL2, { umriss: false });
      m.position.set((rnd() - 0.5) * 0.03, 0.05, (rnd() - 0.5) * 0.03);
      m.rotation.set((rnd() - 0.5) * 1.2, rnd() * 6, (rnd() - 0.5) * 1.2);
      g.add(m);
    }
  } else {
    // Hammer
    g.add(setze(zylinder(0.016, 0.014, 0.3, 0xa66a2b, { umriss: 0.002 }, 8), 0, 0, 0));
    g.add(setze(quader(0.11, 0.045, 0.045, 0x6c7078, { umriss: 0.002 }), 0, 0.15, 0));
  }
  return g;
}


// ---------- Arme und Hände (nur Torben): durchgehende, kräftige Teile ohne Lücken ----------
function armTextur(haut) {
  const hex = '#' + haut.toString(16).padStart(6, '0');
  return leinwandTextur(64, 64, (g) => {
    g.fillStyle = hex; g.fillRect(0, 0, 64, 64);
    const r = (() => { let q = 12; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
    // feine Härchen
    g.strokeStyle = 'rgba(96,66,44,0.4)'; g.lineWidth = 0.8;
    for (let i = 0; i < 90; i++) { const x = r() * 64, y = r() * 64; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 0.8, y + 3.2); g.stroke(); }
    // Adern längs über den Unterarm, dezent
    g.lineCap = 'round';
    for (const [x0, w] of [[10, 0.5], [34, -0.4], [52, 0.3]]) {
      g.strokeStyle = 'rgba(86,112,140,0.5)'; g.lineWidth = 1.9;
      g.beginPath(); g.moveTo(x0, 0);
      for (let y = 8; y <= 64; y += 8) g.lineTo(x0 + Math.sin(y * 0.2 + w * 6) * 2.6 + w * y * 0.08, y);
      g.stroke();
      g.strokeStyle = 'rgba(190,150,140,0.35)'; g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(x0 - 1.6, 0);
      for (let y = 8; y <= 64; y += 8) g.lineTo(x0 - 1.6 + Math.sin(y * 0.2 + w * 6) * 2.6 + w * y * 0.08, y);
      g.stroke();
    }
  });
}

const FINGER = [ // Zeigefinger (neben dem Daumen) bis kleiner Finger: x, Radius, Gliedlängen
  { x: 0.033, r: 0.0142, l: [0.030, 0.021, 0.018] },
  { x: 0.011, r: 0.0146, l: [0.033, 0.023, 0.019] },
  { x: -0.011, r: 0.0138, l: [0.030, 0.021, 0.018] },
  { x: -0.032, r: 0.0122, l: [0.024, 0.016, 0.015] },
];

function baueHand(seite, haut) {
  const hand = new THREE.Group();
  const U = { umriss: 0.0022 };
  const kugelS = (rx, ry, rz, x, y, z) => { const m = teil(new THREE.SphereGeometry(1, 16, 12), haut, U); m.scale.set(rx, ry, rz); m.position.set(x, y, z); return m; };
  const flach = new THREE.Group();
  hand.add(flach);
  // Handgelenk, Handteller, Daumen- und Kleinfingerballen, Knöchel
  flach.add(setze(teil(new THREE.CylinderGeometry(0.043, 0.046, 0.05, 14), haut, U), 0, -0.006, 0));
  flach.add(kugelS(0.054, 0.058, 0.027, 0, -0.048, 0));
  flach.add(kugelS(0.03, 0.038, 0.021, 0.03 * seite, -0.042, 0.011));
  flach.add(kugelS(0.022, 0.042, 0.02, -0.04 * seite, -0.046, 0.006));
  for (const f of FINGER) flach.add(kugelS(f.r * 1.08, f.r * 1.05, f.r * 1.0, f.x * seite, -0.094, -0.008));
  // Adern auf dem Handrücken
  for (const [x0, x1] of [[0.03, 0.016], [0.0, 0.006], [-0.028, -0.012]]) {
    const k = new THREE.CatmullRomCurve3([[x0 * seite, -0.088, -0.0225], [x0 * 0.7 * seite, -0.06, -0.0262], [x1 * seite, -0.022, -0.0245]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    flach.add(new THREE.Mesh(new THREE.TubeGeometry(k, 10, 0.0021, 4, false), toon(0x8f9cb2)));
  }
  const segs = []; // [Gruppe, Basisbeugung, Faktor]
  const fingerGr = new THREE.Group();
  hand.add(fingerGr);
  const nagelFarbe = 0xf0d4c4;
  for (const f of FINGER) {
    let eltern = new THREE.Group();
    eltern.position.set(f.x * seite, -0.094, 0);
    fingerGr.add(eltern);
    const gruppen = [];
    for (let i = 0; i < 3; i++) {
      const L = f.l[i] * 0.95, r = f.r * [1, 0.93, 0.85][i];
      const g = new THREE.Group();
      eltern.add(g);
      if (i) g.position.y = -f.l[i - 1] * 0.95;
      g.add(setze(teil(new THREE.CapsuleGeometry(r, L, 4, 10), haut, U), 0, -L / 2, 0));
      g.add(kugel(r * 1.03, haut, { umriss: false }, 8)); // Gelenkkugel: keine Lücke beim Beugen
      if (i === 2) {
        const n = teil(new THREE.SphereGeometry(1, 8, 6), nagelFarbe, { umriss: false });
        n.scale.set(r * 0.78, L * 0.5, 0.0035); n.position.set(0, -L * 0.62, -r * 0.9);
        g.add(n);
      }
      gruppen.push(g);
      eltern = g;
    }
    segs.push(gruppen);
  }
  // Daumen: zwei Glieder, nach außen und leicht nach vorn
  const dBasis = new THREE.Group();
  dBasis.position.set(0.04 * seite, -0.055, 0.008);
  dBasis.rotation.set(-0.25, 0, -0.7 * seite);
  fingerGr.add(dBasis);
  const dl = [0.032, 0.026], dr = [0.0165, 0.015];
  let dEltern = dBasis;
  const dGr = [];
  for (let i = 0; i < 2; i++) {
    const g = new THREE.Group();
    dEltern.add(g);
    if (i) g.position.y = -dl[0] * 0.95;
    g.add(setze(teil(new THREE.CapsuleGeometry(dr[i], dl[i], 4, 10), haut, U), 0, -dl[i] / 2, 0));
    g.add(kugel(dr[i] * 1.03, haut, { umriss: false }, 8));
    if (i === 1) {
      const n = teil(new THREE.SphereGeometry(1, 8, 6), nagelFarbe, { umriss: false });
      n.scale.set(dr[i] * 0.8, dl[i] * 0.5, 0.0035); n.position.set(0, -dl[i] * 0.6, -dr[i] * 0.9);
      g.add(n);
    }
    dGr.push(g);
    dEltern = g;
  }
  // 0 = offen, 1 = Faust (Fingerbeugung zur Handfläche, die in +z liegt)
  hand.userData.krumm = (k) => {
    for (const g of segs) { g[0].rotation.x = -(0.1 + 1.25 * k); g[1].rotation.x = -(0.16 + 1.5 * k); g[2].rotation.x = -(0.1 + 1.0 * k); }
    dGr[0].rotation.x = -(0.1 + 0.55 * k); dGr[1].rotation.x = -(0.1 + 0.7 * k);
    dBasis.rotation.set(-0.25 - 0.5 * k, 0.45 * k * seite, -(0.7 - 0.35 * k) * seite);
  };
  hand.userData.krumm(0.25);
  return { hand, finger: fingerGr };
}

export function torbenArm(seite, { rumpf, F, KY = 1 }) {
  const mat = toon(0xffffff, { map: armTextur(F.HAUT) });
  const ARMUMRISS = { material: mat, umriss: 0.003 };
  const schulter = new THREE.Group();
  schulter.position.set(0.262 * seite, 0.622 * KY, 0);
  // Schultergelenk (Deltamuskel) und kurzer T-Shirt-Ärmel, eng am Oberarm
  const delta = kugel(0.078, F.SHIRT, { umriss: 0.004 }, 14);
  delta.scale.set(1.0, 0.9, 1.0);
  delta.position.y = -0.016;
  schulter.add(delta);
  const lathe = (pts, seg = 18) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  // Oberarm: Bizeps und Trizeps kräftig, zum Ellbogen schmaler
  schulter.add(teil(lathe([[0.056, -0.275], [0.063, -0.25], [0.072, -0.17], [0.076, -0.09], [0.072, -0.03], [0.056, 0]]), 0, ARMUMRISS));
  schulter.add(setze(teil(new THREE.CylinderGeometry(0.082, 0.086, 0.15, 18), F.SHIRT, { umriss: 0.003 }), 0, -0.075, 0));
  schulter.add(setze(teil(new THREE.TorusGeometry(0.0865, 0.004, 6, 20), 0xdedad0, { umriss: false }), 0, -0.149, 0, Math.PI / 2, 0, 0));
  const ellbogen = new THREE.Group();
  ellbogen.position.y = -0.27;
  ellbogen.add(teil(new THREE.SphereGeometry(0.063, 14, 12), 0, ARMUMRISS));
  // Unterarm: dick unter dem Ellbogen, zum Handgelenk schmal, mit Adern
  ellbogen.add(teil(lathe([[0.043, -0.255], [0.05, -0.2], [0.063, -0.12], [0.071, -0.05], [0.069, -0.01], [0.06, 0]]), 0, ARMUMRISS));
  const { hand, finger } = baueHand(seite, F.HAUT);
  hand.position.y = -0.25;
  if (seite < 0) {
    // Lederband am linken Handgelenk
    hand.add(setze(teil(new THREE.TorusGeometry(0.039, 0.0045, 6, 18), 0x6a4528, { umriss: false }), 0, -0.002, 0, Math.PI / 2, 0, 0));
  }
  ellbogen.add(hand);
  schulter.add(ellbogen);
  rumpf.add(schulter);
  return { schulter, ellbogen, hand, finger };
}

export function torbenErweitern(c) {
  const { wurzel, koerper, rumpf, kopf, beine, links, rechts, F, A, R, T, huelle, aufHuelle, haarMat, becken, scene, opts, mund, hemdMesh, KY, HUEFT } = c;
  const GOLD = F.GOLD;
  const noUmr = { umriss: false };

  // ---------- Hose: lang, hellbraun, Flecken, aufgesetzte Seitentaschen ----------
  // Becken tief unter dem Gürtel verstecken: über dem Gürtel ist nur noch das weiße Shirt
  becken.scale.set(1.12, 0.5, 0.6);
  becken.position.y = HUEFT - 0.07;
  const hosenMat = toon(F.HOSE);
  for (const [i, b] of beine.entries()) {
    const seite = i === 0 ? -1 : 1;
    const hf = b.huefte, k = b.k;
    // Haut und kurze Hose der gemeinsamen Figur ausblenden, die Socke bleibt sichtbar
    hf.children[0].visible = false; hf.children[1].visible = false; hf.children[2].visible = false;
    const [knie, wade, , , schuh] = k.children;
    knie.visible = false; wade.visible = false; schuh.visible = false;
    hf.scale.set(1.1, 1.19, 1.1);
    hf.add(setze(teil(hosenbein(0.122, 0.106, 0.46, 1 + i * 3), 0, { material: hosenMat, umriss: 0.003 }), 0, -0.2, 0));
    k.add(setze(teil(new THREE.SphereGeometry(0.104, 12, 10), 0, { material: hosenMat, umriss: false }), 0, 0, 0));
    k.add(setze(teil(hosenbein(0.106, 0.096, 0.3, 5 + i * 2, true), 0, { material: hosenMat, umriss: 0.003 }), 0, -0.15, 0));
    // Saum
    k.add(setze(zylinder(0.096, 0.096, 0.014, 0x8e7048, { umriss: false }, 16), 0, -0.296, 0));
    // schwarzer Schuh mit weißer Sohle (keine Streifen)
    const sch = new THREE.Group();
    sch.position.y = -0.43;
    const oben = teil(new THREE.CapsuleGeometry(0.062, 0.16, 4, 12), 0x141416, { umriss: 0.004 });
    oben.rotation.x = Math.PI / 2; oben.scale.set(1.08, 1, 0.78); oben.position.set(0, 0.0, 0.05);
    sch.add(oben);
    const sohle = teil(new THREE.CapsuleGeometry(0.066, 0.17, 4, 12), 0x2a2a2c, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2; sohle.scale.set(1.1, 1, 0.3); sohle.position.set(0, -0.04, 0.05);
    sch.add(sohle);
    for (let j = 0; j < 3; j++) sch.add(setze(quader(0.044, 0.006, 0.01, 0xcfcfcf, noUmr), 0, 0.045, 0.06 + j * 0.025, 0.3, 0, 0));
    k.add(sch);
    // aufgesetzte Seitentasche außen am Oberschenkel, Klappe und Werkzeug
    const t = new THREE.Group();
    t.add(quader(0.04, 0.21, 0.17, 0x8a6034, { umriss: 0.003 }));
    t.add(setze(quader(0.045, 0.06, 0.175, 0x6f4a28, { umriss: 0.003 }), 0.001 * seite, 0.075, 0));
    t.add(setze(kugel(0.011, GOLD, noUmr, 8), 0.024 * seite, 0.062, 0.05));
    if (seite > 0) {
      // Schraubendreher (gelb-schwarz) und Zollstock schauen raus
      t.add(setze(zylinder(0.014, 0.014, 0.07, 0xf2c21c, { umriss: 0.0015 }, 8), 0.004, 0.13, 0.03));
      t.add(setze(zylinder(0.008, 0.008, 0.05, 0x202226, { umriss: false }, 8), 0.004, 0.17, 0.03));
      t.add(setze(quader(0.012, 0.09, 0.03, 0xf2c21c, { umriss: 0.0015 }), 0.004, 0.14, -0.03));
    } else {
      // Rohrzange mit roten Griffen
      t.add(setze(zylinder(0.011, 0.011, 0.1, 0xc8352a, { umriss: 0.0015 }, 8), 0.004, 0.13, 0.02, 0, 0, 0.1));
      t.add(setze(zylinder(0.011, 0.011, 0.1, 0xc8352a, { umriss: 0.0015 }, 8), 0.004, 0.13, -0.02, 0, 0, -0.1));
    }
    t.position.set(0.122 * seite, -0.17, 0.02);
    hf.add(t);
  }

  // ---------- Gürtel: schwarz, goldene Schnalle ----------
  rumpf.add(teil(huelle(0.024, 0.018, -0.07, 0.035, null, 48, 4), 0, { material: toon(0x131417, { side: THREE.DoubleSide }), umriss: 0.002 }));
  const sn = aufHuelle(0.024, 0.018, 0, -0.018, 0.012);
  {
    const d = zylinder(0.042, 0.042, 0.012, GOLD, { umriss: 0.002 }, 20);
    d.position.copy(sn.p);
    d.rotation.order = 'YXZ';
    d.rotation.set(Math.PI / 2, sn.rot, 0);
    rumpf.add(d);
  }
  {
    const d = zylinder(0.03, 0.03, 0.014, 0x8a6a2a, noUmr, 20);
    d.position.copy(sn.p);
    d.rotation.order = 'YXZ';
    d.rotation.set(Math.PI / 2, sn.rot, 0);
    rumpf.add(d);
  }
  // T-Shirt-Halsbündchen
  rumpf.add(setze(teil(new THREE.TorusGeometry(0.083, 0.011, 6, 22), 0xe6e1d4, noUmr), 0, 0.738 * KY, -0.004, Math.PI / 2, 0, 0));

  // ---------- Gesicht: Nasenstecker, Ohrringe ----------
  kopf.add(setze(kugel(0.0085, GOLD, noUmr, 8), 0.027, 0.09, 0.186));
  for (const x of [-0.186, 0.186]) {
    kopf.add(setze(teil(new THREE.TorusGeometry(0.016, 0.0034, 6, 14), GOLD, noUmr), x, 0.07, -0.01, 0, Math.PI / 2, 0));
    kopf.add(setze(teil(new THREE.TorusGeometry(0.0115, 0.0028, 6, 12), GOLD, noUmr), x, 0.128, -0.006, 0, Math.PI / 2, 0));
  }
  // Stoppeln: dunkle Punkte auf einem dünnen Kugelstück über Kinn und Kieferlinie (kein dicker Bart), Mund und Oberlippe bleiben frei
  {
    const tex = leinwandTextur(256, 128, (g, b, h) => {
      for (let i = 0; i < 9000; i++) {
        const x = rnd() * b, y = rnd() * h, u = x / b, v = y / h;
        const mitte = Math.abs(u - 0.5);
        // Dichte: unten (Kinn, Kiefer) hoch, oben (Wangen) und um den Mund niedrig
        let dichte = Math.min(1, 0.25 + v * 0.9) * Math.min(1, 1.9 - mitte * 2.2);
        if (mitte < 0.13 && v > 0.28 && v < 0.62) dichte = 0; // Mund und Lippen
        if (mitte < 0.2 && v < 0.3) dichte *= 0.55; // über der Oberlippe nur wenig
        if (rnd() > dichte * 0.85) continue;
        g.fillStyle = rnd() < 0.7 ? 'rgba(70,48,34,0.95)' : 'rgba(110,78,52,0.9)';
        g.fillRect(x, y, 1.6, 1.6);
      }
    });
    const stoppel = new THREE.Mesh(new THREE.SphereGeometry(0.1665, 40, 20, Math.PI / 2 - 1.3, 2.6, 1.5, 1.2), toon(0xffffff, { map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    stoppel.scale.set(0.985, 1.125, 0.985);
    stoppel.position.set(0, 0.12, 0);
    kopf.add(stoppel);
    kopf.scale.setScalar(0.94);
    // Augen: schwarze Pupillen, dunkle Oberlider (entschlossener Blick)
    for (const x of [-0.06, 0.06]) {
      kopf.add(setze(kugel(0.0065, 0x0e0e10, { umriss: false }, 8), x, 0.15, 0.1625));
      const lid = teil(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x6a4a3a, { umriss: false });
      lid.scale.set(0.027, 0.012, 0.02); lid.position.set(x, 0.162, 0.141); lid.rotation.z = x < 0 ? 0.12 : -0.12;
      kopf.add(lid);
    }
  }
  // ---------- Haare: dunkelbraun, kurz, oben länger und leicht gewellt ----------
  const wellen = [[0, 0.275, 0.02], [0.07, 0.272, 0.0], [-0.07, 0.272, 0.0], [0.03, 0.262, 0.08], [-0.05, 0.262, 0.09], [0.1, 0.25, 0.07], [-0.11, 0.25, 0.06],
    [0.0, 0.248, 0.13], [0.09, 0.235, 0.12], [-0.09, 0.235, 0.12], [0.05, 0.28, -0.06], [-0.05, 0.278, -0.06], [0.13, 0.22, 0.0], [-0.13, 0.22, 0.0], [0.0, 0.255, -0.12]];
  for (const [x, y, z] of wellen) {
    const b = teil(new THREE.SphereGeometry(0.052, 10, 8), 0, { material: haarMat, umriss: 0.003 });
    b.scale.set(1, 0.62, 1.5);
    b.position.set(x, y, z);
    b.rotation.set(0.35 + rnd() * 0.3, rnd() * 1.2 - 0.6, rnd() * 0.8 - 0.4);
    kopf.add(b);
  }

  for (const [x, y, z, r] of [[0, 0.12, -0.11, 0.13], [0.09, 0.1, -0.09, 0.1], [-0.09, 0.1, -0.09, 0.1], [0, 0.02, -0.1, 0.1]]) {
    const b = teil(new THREE.SphereGeometry(r, 12, 10), 0, { material: haarMat, umriss: 0.003 });
    b.scale.set(1, 0.9, 0.8);
    b.position.set(x, y, z);
    kopf.add(b);
  }

  // ---------- Werkzeugtasche: schwarz mit gelben Details, groß und rund, flacher Riemen über die Schulter, wippt beim Gehen ----------
  // Schulterpartie: flacher Übergang vom Hals zu den Armen (keine Kugelschultern)
  const joch = teil(new THREE.SphereGeometry(1, 24, 14), F.SHIRT, { umriss: 0.003 });
  joch.scale.set(0.262, 0.07 * KY, 0.096);
  joch.position.set(0, 0.672 * KY, -0.002);
  rumpf.add(joch);
  {
    // Riemen als flaches Band: Auftreffpunkte per Strahl auf Shirt und Schulterpartie, so verschwindet er nirgends im Stoff
    wurzel.updateMatrixWorld(true);
    const rc = new THREE.Raycaster();
    const inv = new THREE.Matrix4();
    const schnitt = (o, d) => {
      rumpf.updateWorldMatrix(true, false);
      inv.copy(rumpf.matrixWorld).invert();
      rc.set(rumpf.localToWorld(o.clone()), d.clone().transformDirection(rumpf.matrixWorld));
      const h = rc.intersectObjects([hemdMesh, joch], false)[0];
      if (!h) return null;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld).transformDirection(inv);
      if (n.dot(d) > 0) n.negate();
      return { p: rumpf.worldToLocal(h.point.clone()), n };
    };
    const lin = [[-0.19, 0.34], [-0.12, 0.42], [-0.04, 0.5], [0.03, 0.57], [0.085, 0.63], [0.115, 0.67]];
    const treffer = [];
    for (const [x, y] of lin) { const h = schnitt(new THREE.Vector3(x, y * KY, 1), new THREE.Vector3(0, 0, -1)); if (h) treffer.push(h); }
    for (const z of [0.06, 0.03, 0, -0.03, -0.06]) { const h = schnitt(new THREE.Vector3(0.125, 1.4, z), new THREE.Vector3(0, -1, 0)); if (h) treffer.push(h); }
    for (const [x, y] of lin.slice().reverse()) { const h = schnitt(new THREE.Vector3(x, y * KY, -1), new THREE.Vector3(0, 0, 1)); if (h) treffer.push(h); }
    const OFF = 0.009;
    const kurve = new THREE.CatmullRomCurve3(treffer.map((h) => h.p.clone().addScaledVector(h.n, OFF)));
    const N = 110, pts = kurve.getSpacedPoints(N);
    const nrm = (t) => { const f = t * (treffer.length - 1), i0 = Math.floor(f), i1 = Math.min(treffer.length - 1, i0 + 1); return treffer[i0].n.clone().lerp(treffer[i1].n, f - i0).normalize(); };
    const pos = [], idx = [], pos2 = [];
    for (let i = 0; i <= N; i++) {
      const P = pts[i], Tg = pts[Math.min(N, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
      const Nn = nrm(i / N);
      const Bn = new THREE.Vector3().crossVectors(Tg, Nn).normalize();
      const t = i / N, w = 0.028 + 0.012 * Math.exp(-(((t - 0.5) / 0.1) ** 2));
      const Q = P.clone().addScaledVector(Nn, 0.0015), Q2 = P.clone().addScaledVector(Nn, 0.004);
      pos.push(Q.x + Bn.x * w, Q.y + Bn.y * w, Q.z + Bn.z * w, Q.x - Bn.x * w, Q.y - Bn.y * w, Q.z - Bn.z * w);
      pos2.push(Q2.x + Bn.x * 0.0038, Q2.y + Bn.y * 0.0038, Q2.z + Bn.z * 0.0038, Q2.x - Bn.x * 0.0038, Q2.y - Bn.y * 0.0038, Q2.z - Bn.z * 0.0038);
      if (i < N) { const a0 = i * 2; idx.push(a0, a0 + 1, a0 + 2, a0 + 1, a0 + 3, a0 + 2); }
    }
    const geo = (p) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
    rumpf.add(new THREE.Mesh(geo(pos), toon(0x17181b, { side: THREE.DoubleSide })));
    rumpf.add(new THREE.Mesh(geo(pos2), toon(0xf2c21c, { side: THREE.DoubleSide })));
  }
  // Tasche: hängt links hinten an der Hüfte, höher als zuvor, leicht schräg; pendelt um den Aufhängepunkt
  const taschenGruppe = new THREE.Group();
  taschenGruppe.position.set(-0.222, 0.36 * KY, -0.03);
  const tb = new THREE.Group();
  taschenGruppe.add(tb);
  const runde = (b, h, r) => {
    const sh = new THREE.Shape();
    sh.moveTo(-b / 2 + r, -h / 2); sh.lineTo(b / 2 - r, -h / 2); sh.quadraticCurveTo(b / 2, -h / 2, b / 2, -h / 2 + r);
    sh.lineTo(b / 2, h / 2 - r); sh.quadraticCurveTo(b / 2, h / 2, b / 2 - r, h / 2); sh.lineTo(-b / 2 + r, h / 2);
    sh.quadraticCurveTo(-b / 2, h / 2, -b / 2, h / 2 - r); sh.lineTo(-b / 2, -h / 2 + r); sh.quadraticCurveTo(-b / 2, -h / 2, -b / 2 + r, -h / 2);
    return sh;
  };
  const weich = (b, h, r, tief, bev, farbe, umr = 0.003) => {
    const g = new THREE.ExtrudeGeometry(runde(b, h, r), { depth: tief, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 });
    g.center();
    g.rotateY(Math.PI / 2); // Breite wird zur Tiefe (vorne/hinten), Dicke zeigt zur Seite
    return teil(g, farbe, { umriss: umr });
  };
  const bag = new THREE.Group();
  bag.position.set(-0.07, -0.2, -0.1);
  tb.add(bag);
  bag.add(weich(0.4, 0.3, 0.07, 0.1, 0.03, 0x17181b)); // Hauptfach
  bag.add(setze(weich(0.404, 0.304, 0.071, 0.012, 0.004, 0xf2c21c, false), 0, 0, 0)); // gelbe Paspel rund um die Mittelnaht
  bag.add(setze(weich(0.36, 0.11, 0.045, 0.1, 0.034, 0x1e1f23), 0, 0.105, 0)); // Deckelklappe oben
  bag.add(setze(weich(0.3, 0.17, 0.05, 0.03, 0.02, 0x202126), -0.075, -0.045, 0)); // Außentasche
  bag.add(setze(weich(0.3, 0.172, 0.05, 0.004, 0.003, 0xf2c21c, false), -0.103, -0.045, 0)); // Naht der Außentasche
  // Reißverschluss quer über die Außentasche und Zuglaschen
  bag.add(setze(quader(0.006, 0.012, 0.26, 0xf2c21c, { umriss: false }), -0.105, -0.0, 0));
  for (const z of [-0.07, 0.07]) bag.add(setze(quader(0.012, 0.045, 0.014, 0xf2c21c, { umriss: 0.0015 }), -0.11, -0.025, z));
  // Werkzeug schaut aus dem Fach (Hammerstiel, Schraubendreher, Zollstock)
  bag.add(setze(zylinder(0.012, 0.012, 0.18, 0xa66a2b, { umriss: 0.0015 }, 8), -0.04, 0.2, 0.08, 0, 0, 0.2));
  bag.add(setze(quader(0.05, 0.03, 0.03, 0x6c7078, { umriss: 0.0015 }), -0.0, 0.29, 0.1));
  bag.add(setze(zylinder(0.011, 0.011, 0.1, 0xf2c21c, { umriss: 0.0015 }, 8), -0.04, 0.21, -0.06, 0, 0, -0.15));
  bag.add(setze(zylinder(0.006, 0.006, 0.07, 0x9aa0a8, { umriss: 0.0015 }, 6), -0.04, 0.26, -0.065, 0, 0, -0.15));
  // Henkel oben und Riemenösen
  bag.add(setze(teil(new THREE.TorusGeometry(0.07, 0.009, 6, 12, Math.PI), 0x111214, { umriss: false }), 0, 0.16, 0, 0, Math.PI / 2, 0));
  for (const z of [-0.15, 0.15]) bag.add(setze(quader(0.03, 0.05, 0.03, 0x111214, { umriss: 0.0015 }), 0.052, 0.15, z));
  // leicht schräg: unten nach hinten und außen
  tb.rotation.set(-0.16, 0, -0.24);
  rumpf.add(taschenGruppe);
  c.tasche = { gruppe: taschenGruppe, tb, y0: taschenGruppe.position.y, rz0: -0.24, rx0: -0.16 };

  // ---------- Spaghetti in der linken Hand ----------
  const spag = new THREE.Group();
  spag.position.set(0, -0.07, 0.04);
  links.hand.add(spag);
  const straenge = [];
  for (let i = 0; i < 12; i++) {
    const piv = new THREE.Group();
    piv.position.set((rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.02, (rnd() - 0.5) * 0.05);
    const m = teil(strangGeo(0.12 + rnd() * 0.13, 0.015 + rnd() * 0.025, rnd() * 6, 0.0062), i % 3 ? NUDEL : NUDEL2, noUmr);
    piv.add(m);
    piv.userData = { ph: rnd() * 6, sp: 1.3 + rnd() * 1.4 };
    spag.add(piv);
    straenge.push(piv);
  }
  // ein Büschel schaut oben aus der Faust
  for (let i = 0; i < 4; i++) {
    const m = teil(strangGeo(0.05 + rnd() * 0.04, 0.02, rnd() * 6, 0.0055), NUDEL, noUmr);
    m.rotation.z = Math.PI + (rnd() - 0.5) * 1.2;
    m.position.set((rnd() - 0.5) * 0.04, 0.02, (rnd() - 0.5) * 0.04);
    spag.add(m);
  }
  // der Strang, der beim Essen aus dem Mund hängt (hängt immer senkrecht)
  const mundStrang = new THREE.Group();
  mundStrang.position.set(0, 0.02, 0.17);
  mundStrang.add(teil(strangGeo(0.2, 0.025, 1.7, 0.0055), NUDEL, noUmr));
  mundStrang.visible = false;
  kopf.add(mundStrang);

  // Arm-Pose per Suche: Hand (Griffpunkt) an einen Zielpunkt im Rumpf-Koordinatensystem bringen
  const GRIFF = new THREE.Vector3(0, -0.07, 0.04);
  function armPose(arm, ziel, fest = {}) {
    const E = arm.ellbogen.position.clone(), H = arm.hand.position.clone(), S = arm.schulter.position.clone();
    const eu = new THREE.Euler(), eu2 = new THREE.Euler(), p = new THREE.Vector3();
    const probe = (sx, sy, sz, ex, ez) => {
      p.copy(GRIFF).add(H).applyEuler(eu2.set(ex, 0, ez)).add(E).applyEuler(eu.set(sx, sy, sz)).add(S);
      return p.distanceTo(ziel);
    };
    let best = [-0.5, 0, 0, -1, 0], bd = 9;
    for (let sx = -3.0; sx <= 0.4; sx += 0.2) for (let sy = -0.6; sy <= 1.0; sy += 0.2) for (let sz = -0.9; sz <= 1.0; sz += 0.2) for (let ex = -2.5; ex <= -0.2; ex += 0.2) {
      const d = probe(sx, sy, sz, ex, 0) + 0.015 * (Math.abs(sy) + Math.abs(sz));
      if (d < bd) { bd = d; best = [sx, sy, sz, ex, 0]; }
    }
    for (let it = 0; it < 4; it++) {
      const st = 0.1 / (it + 1);
      for (let sx = best[0] - 0.2; sx <= best[0] + 0.2; sx += st) for (let sy = best[1] - 0.2; sy <= best[1] + 0.2; sy += st) for (let sz = best[2] - 0.2; sz <= best[2] + 0.2; sz += st) for (let ex = best[3] - 0.2; ex <= best[3] + 0.2; ex += st) {
        const d = probe(sx, sy, sz, ex, 0) + 0.015 * (Math.abs(sy) + Math.abs(sz));
        if (d < bd) { bd = d; best = [sx, sy, sz, ex, 0]; }
      }
    }
    return { s: [best[0], best[1], best[2]], e: [best[3], 0, 0], fehler: bd };
  }
  // Mund (Rumpf-Koordinaten) und Haltung vor dem Bauch
  const mundP = new THREE.Vector3(0, 0.04, 0.19).add(kopf.position);
  const POSE_UNTEN = armPose(links, new THREE.Vector3(-0.16, 0.3, (R(0.3, 0.02) * T(0.3) + 0.012) + 0.16));
  const POSE_MUND = armPose(links, new THREE.Vector3(-0.02, mundP.y - 0.02, mundP.z + 0.05));
  c.posen = { POSE_UNTEN, POSE_MUND };

  // Rechter Arm: locker hängend, Hand vor dem Oberschenkel
  const RECHTS_RUHE = { s: [0.08, 0, 0.17], e: [-0.4, 0, -0.08] };

  // ---------- Zustände ----------
  let spagAn = true;     // hat Spaghetti in der Hand (Pose aktiv, wenn nicht gesperrt)
  let gesperrt = false;  // andere Pose (Tragen, Liegen, Fahren ...): Arme nicht anfassen
  let essenT = -1;       // Essen läuft: Zeit seit Start
  let essenFertig = null;
  let naechstesEssen = 6 + rnd() * 6;
  let zeit = 0;
  let werfT = -1, werfFn = null, werfFertig = null, werfSeite = 0;
  const fliegend = [];
  const q1 = new THREE.Quaternion();

  function ruhe() {
    // Arme in Ruhehaltung (Spaghetti vor dem Bauch, rechter Arm locker) oder ohne Spaghetti beide locker
    // Handflächen zeigen zum Körper, Finger locker gebogen; links Faust um die Spaghetti
    links.hand.rotation.set(0, 0.95, 0); rechts.hand.rotation.set(0, -1.1, 0);
    links.hand.userData.krumm(spagAn ? 0.8 : 0.3); rechts.hand.userData.krumm(0.3);
    if (spagAn) { links.schulter.rotation.set(...POSE_UNTEN.s); links.ellbogen.rotation.set(...POSE_UNTEN.e); }
    else { links.schulter.rotation.set(0.08, 0, -0.17); links.ellbogen.rotation.set(-0.4, 0, 0.08); }
    rechts.schulter.rotation.set(...RECHTS_RUHE.s);
    rechts.ellbogen.rotation.set(...RECHTS_RUHE.e);
  }
  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const mixV = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

  function werfenStarten(art, ziel, opt = {}) {
    if (werfT >= 0) return Promise.resolve(false);
    return new Promise((res) => {
      werfT = 0;
      werfFertig = res;
      werfSeite = opt.seite || 0;
      werfFn = { art, ziel, opt, losgelassen: false };
    });
  }
  function objektLos(art, ziel, opt) {
    const m = wurfModell(art);
    scene.add(m);
    const p0 = new THREE.Vector3();
    rechts.hand.getWorldPosition(p0);
    p0.y += 0.02;
    m.position.copy(p0);
    const d = new THREE.Vector3(ziel.x - p0.x, 0, ziel.z - p0.z);
    const dist = Math.max(0.5, d.length());
    const t = (opt.boden ? 0.38 : 0.55) + dist * 0.07;
    const v = new THREE.Vector3(d.x / t, 0, d.z / t);
    const hoehe = art === 'tasse' ? 0.05 : 0.04;
    v.y = (hoehe - p0.y + 0.5 * 9.8 * t * t) / t;
    fliegend.push({ m, v, spin: new THREE.Vector3((rnd() - 0.5) * 14, (rnd() - 0.5) * 10, (rnd() - 0.5) * 14), art, prallt: 0, ruhe: 0, alter: 0, aufgeschlagen: false });
  }

  function update(dt, st) {
    zeit += dt;
    const sperre = gesperrt || !wurzel.visible;
    // Werkzeugtasche wippt beim Gehen und schwingt etwas nach
    {
      const t = c.tasche;
      const wipp = st.geht ? Math.sin(st.schritt * 1.0) : 0;
      t.tb.rotation.z += (t.rz0 + wipp * 0.16 - t.tb.rotation.z) * Math.min(1, dt * 9);
      t.tb.rotation.x += (t.rx0 + (st.geht ? Math.cos(st.schritt * 1.0) * 0.1 : 0) - t.tb.rotation.x) * Math.min(1, dt * 9);
      t.gruppe.position.y = t.y0 + (st.geht ? Math.abs(Math.sin(st.schritt * 1.0)) * 0.01 : 0);
      // die schwere Tasche zieht ihn nach vorn: beim Gehen deutlich, im Stehen leicht gebückt
      const beuge = (st.geht ? 0.24 : 0.09) + (essenT >= 0 ? -0.06 : 0);
      rumpf.rotation.x += (beuge - rumpf.rotation.x) * Math.min(1, dt * 4);
    }
    // Spaghetti: hängen senkrecht (weltfest), wackeln leicht
    spag.visible = spagAn && !sperre;
    if (spag.visible) {
      links.hand.getWorldQuaternion(q1);
      spag.quaternion.copy(q1.invert());
      const heftig = st.geht ? 2.2 : 1;
      for (const s of straenge) {
        s.rotation.x = Math.sin(zeit * s.userData.sp + s.userData.ph) * 0.09 * heftig;
        s.rotation.z = Math.cos(zeit * s.userData.sp * 0.8 + s.userData.ph) * 0.09 * heftig;
      }
    }
    if (mundStrang.visible) {
      kopf.getWorldQuaternion(q1);
      mundStrang.quaternion.copy(q1.invert());
    }
    // Essen: alle paar Sekunden Hand zum Mund, Strang hängt raus, schlürfen
    if (!sperre && spagAn && werfT < 0) {
      if (essenT < 0) {
        naechstesEssen -= dt;
        if (naechstesEssen <= 0 && !st.geht) { essenT = 0; }
        else if (naechstesEssen <= 0) naechstesEssen = 2;
      }
    } else if (essenT >= 0) { essenT = -1; mundStrang.visible = false; if (essenFertig) { essenFertig(false); essenFertig = null; } }
    if (essenT >= 0) {
      essenT += dt;
      const t = essenT;
      // 0..0.9 Hand hoch, 0.9..1.5 Strang rein (schlürfen), 1.5..2.6 kauen, 2.6..3.4 Hand runter
      const k = t < 0.9 ? smooth(t / 0.9) : t < 2.6 ? 1 : 1 - smooth((t - 2.6) / 0.8);
      links.schulter.rotation.set(...mixV(POSE_UNTEN.s, POSE_MUND.s, k));
      links.ellbogen.rotation.set(...mixV(POSE_UNTEN.e, POSE_MUND.e, k));
      mundStrang.visible = t > 0.7 && t < 1.6;
      if (mundStrang.visible) mundStrang.scale.y = t < 0.9 ? 1 : Math.max(0.02, 1 - (t - 0.9) / 0.7);
      kopf.rotation.x = t > 0.9 && t < 1.6 ? 0.12 : t > 1.6 && t < 2.6 ? Math.sin((t - 1.6) * 14) * 0.05 : 0;
      if (t > 0.95 && !essenT_gehoert) { essenT_gehoert = true; opts?.beiSchluerfen?.(); opts?.beiEssen?.(); }
      if (t >= 3.4) {
        essenT = -1; essenT_gehoert = false; mundStrang.visible = false; kopf.rotation.x = 0;
        naechstesEssen = 8 + rnd() * 8;
        ruhe();
        if (essenFertig) { essenFertig(true); essenFertig = null; }
      }
    }
    // Wurf: Ausholen, Schleudern, Loslassen, Zurück
    if (werfT >= 0) {
      werfT += dt;
      const t = werfT, w = werfFn;
      // 0..0.7 Wut (Zittern, Faust hoch), 0.7..1.05 Ausholen, 1.05..1.25 Wurf, 1.25..2.0 Nachwirken
      if (t < 0.7) {
        koerper.rotation.y = Math.sin(t * 40) * 0.05;
        rechts.hand.userData.krumm(1);
        rechts.schulter.rotation.set(-0.9 + Math.sin(t * 30) * 0.08, 0, 0.2);
        rechts.ellbogen.rotation.set(-1.6, 0, 0);
        kopf.rotation.x = 0.1;
      } else if (t < 1.05) {
        const k = smooth((t - 0.7) / 0.35);
        rechts.schulter.rotation.set(-0.9 + k * 2.2, 0, 0.2 + k * 0.3);
        rechts.ellbogen.rotation.set(-1.6 + k * 0.6, 0, 0);
      } else if (t < 1.25) {
        const k = smooth((t - 1.05) / 0.2);
        rechts.schulter.rotation.set(1.3 - k * 3.3, 0, 0.5 - k * 0.3);
        rechts.ellbogen.rotation.set(-1.0 + k * 0.7, 0, 0);
        if (k > 0.55 && !w.losgelassen) {
          w.losgelassen = true;
          rechts.hand.userData.krumm(0.05);
          objektLos(w.art, w.ziel, w.opt);
          if (w.art === 'spaghetti') { spagAn = false; w.nudelWeg = true; }
          opts?.beiWurf?.(w.art);
        }
      } else if (t < 2.0) {
        rechts.schulter.rotation.set(-2.0 + smooth((t - 1.25) / 0.75) * 2.1, 0, 0.3);
        rechts.ellbogen.rotation.set(-0.3, 0, 0);
        kopf.rotation.x = 0.05;
        koerper.rotation.y = 0;
      } else {
        werfT = -1; kopf.rotation.x = 0; koerper.rotation.y = 0;
        // neue Spaghetti: Torben kocht ... nein, er hat noch einen Rest in der Tasche
        if (!spagAn && w.nudelWeg) setTimeout(() => { spagAn = true; if (!gesperrt) ruhe(); }, 4000);
        ruhe();
        const r = werfFertig; werfFertig = null; werfFn = null; if (r) r(true);
      }
    }
    // Flugbahnen
    for (let i = fliegend.length - 1; i >= 0; i--) {
      const f = fliegend[i];
      f.alter += dt;
      if (!f.aufgeschlagen || f.ruhe < 1) {
        f.v.y -= 9.8 * dt;
        f.m.position.addScaledVector(f.v, dt);
        f.m.rotation.x += f.spin.x * dt; f.m.rotation.y += f.spin.y * dt; f.m.rotation.z += f.spin.z * dt;
        const boden = f.art === 'spaghetti' ? 0.02 : 0.05;
        if (f.m.position.y < boden) {
          f.m.position.y = boden;
          if (Math.abs(f.v.y) > 1.2 && f.prallt < 2) {
            f.v.y *= -0.32; f.v.x *= 0.6; f.v.z *= 0.6; f.spin.multiplyScalar(0.5); f.prallt++;
            opts?.beiAufprall?.(f.art, f.prallt);
          } else {
            f.v.set(0, 0, 0); f.spin.set(0, 0, 0); f.ruhe = 1; f.aufgeschlagen = true;
            if (f.prallt === 0) opts?.beiAufprall?.(f.art, 0);
            if (f.art === 'spaghetti') { f.m.scale.y = 0.3; }
            // flach hinlegen
            f.m.rotation.x = f.art === 'spaghetti' ? 0 : Math.PI / 2 * (rnd() < 0.5 ? 1 : 0);
          }
        }
      }
      if (f.alter > 14) { const k = Math.max(0, 1 - (f.alter - 14) / 2); f.m.scale.setScalar(k); if (k <= 0) { scene.remove(f.m); fliegend.splice(i, 1); } }
    }
  }
  let essenT_gehoert = false;

  const api = {
    // Spaghetti an/aus (z. B. beim Tragen und Liegen aus)
    spaghetti(an) { spagAn = an; ruhe(); },
    get hatSpaghetti() { return spagAn; },
    // Andere Pose übernimmt die Arme (Tragen, Liegen, Fahren): hier nichts mehr anfassen
    posenSperre(an) { gesperrt = an; if (an) { essenT = -1; mundStrang.visible = false; kopf.rotation.x = 0; } else ruhe(); },
    essen() {
      if (essenT >= 0 || gesperrt || !spagAn || werfT >= 0) return Promise.resolve(false);
      essenT = 0;
      return new Promise((r) => { essenFertig = r; });
    },
    get isst() { return essenT >= 0; },
    get gesperrt() { return gesperrt; },
    werfen: werfenStarten,
    get wirft() { return werfT >= 0; },
    get fliegende() { return fliegend; },
  };
  ruhe();
  return { ruhe, update, api, posen: c.posen, tasche: c.tasche };
}
