// Jonny als Comic-Figur (nach Fotos vom Betreiber): etwa so groß wie Dennis, etwas breiter, lange braune Haare,
// Vollbart, olivgrüne grüne Cap mit Schirm nach vorn, runde goldene Brille, weißes kurzärmliges Hemd weit offen mit viel
// Brusthaar, hellbraune Zimmermannsweste (Cord, Perlmuttknöpfe) bis über die Schultern, sehr kurze schwarze Arbeitshose mit Zollstock
// und Stift in der Seitentasche, weiße Socken, grüne Sneaker mit drei weißen Streifen, goldener Ring.
import * as THREE from 'three';
import { wegNach } from './wege.js';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur } from './toon.js';

const HAUT = 0xeebda0;
const HAAR = 0x5a3a22;
const BART = 0x4e321d;
const CAP = 0x5f7d3e;
const SHIRT = 0xf4f2ec;
const WESTE = 0xb98d5c;
const HOSE = 0x1f2024;
const SCHUH = 0x2f7d4f;
const GOLD = 0xd7b25c;
// Wo Jonny rumsteht: an der Tor-Ecke (raucht dort, obwohl das Schild hängt)
const PLATZ_JONNY = new THREE.Vector3(0.45, 0, 3.2);

// opts.aussehen überschreibt Farben und Merkmale (Torben nutzt dieselbe Figur mit anderem Aussehen)
export function baueJonny(scene, opts = {}) {
  const A = { brille: true, langeHaare: true, bart: 'voll', cap: true, ...(opts.aussehen || {}) };
  const F = { HAUT, HAAR, BART, CAP, SHIRT, WESTE, HOSE, SCHUH, GOLD, ...(A.farben || {}) };
  const PLATZ = opts.platz ? opts.platz.clone() : PLATZ_JONNY.clone();
  const wurzel = new THREE.Group();
  wurzel.position.copy(PLATZ);
  // schaut in die Werkstatt (Rücken zum Tor)
  wurzel.rotation.y = Math.PI * 1.08;
  wurzel.scale.setScalar(0.95);
  scene.add(wurzel);
  const zufall = (() => { let s = 23; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();

  const koerper = new THREE.Group();
  wurzel.add(koerper);

  // ---------- Beine: sehr kurze schwarze Arbeitshose, nackte Beine, weiße Socken, grüne Sneaker ----------
  const becken = teil(new THREE.CapsuleGeometry(0.135, 0.12, 6, 12), F.HOSE);
  becken.rotation.z = Math.PI / 2;
  becken.scale.set(1, 1, 0.78);
  becken.position.y = 0.9;
  koerper.add(becken);
  const beine = [];
  for (const x of [-0.11, 0.11]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.88, 0);
    // kurzes Hosenbein (endet weit über dem Knie)
    huefte.add(setze(teil(new THREE.CylinderGeometry(0.108, 0.118, 0.17, 14), F.HOSE), 0, -0.07, 0));
    huefte.add(setze(zylinder(0.12, 0.12, 0.012, 0x141518, { umriss: false }, 14), 0, -0.155, 0));
    // nackter Oberschenkel, Knie, Wade (leicht behaart)
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.085, 0.2, 4, 12), F.HAUT), 0, -0.27, 0));
    const k = new THREE.Group();
    k.position.y = -0.42;
    k.add(teil(new THREE.SphereGeometry(0.08, 12, 10), F.HAUT));
    k.add(setze(teil(new THREE.CapsuleGeometry(0.072, 0.22, 4, 12), F.HAUT), 0, -0.17, 0));
    // weiße Tennissocke mit Bündchen
    k.add(setze(zylinder(0.06, 0.058, 0.12, 0xf7f7f4, { umriss: 0.003 }, 14), 0, -0.34, 0));
    k.add(setze(zylinder(0.062, 0.062, 0.02, 0xe4e4df, { umriss: false }, 14), 0, -0.29, 0));
    // grüner Sneaker: Sohle weiß, drei weiße Streifen, Schnürung
    const schuh = new THREE.Group();
    schuh.position.y = -0.43;
    const oben = teil(new THREE.CapsuleGeometry(0.058, 0.16, 4, 12), F.SCHUH, { umriss: 0.004 });
    oben.rotation.x = Math.PI / 2;
    oben.scale.set(1.05, 1, 0.75);
    oben.position.set(0, 0.0, 0.05);
    schuh.add(oben);
    const sohle = teil(new THREE.CapsuleGeometry(0.062, 0.17, 4, 12), 0xf4f4ef, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2;
    sohle.scale.set(1.08, 1, 0.3);
    sohle.position.set(0, -0.04, 0.05);
    schuh.add(sohle);
    for (let i = 0; i < 3; i++) {
      for (const sx of [-1, 1]) schuh.add(setze(quader(0.006, 0.05, 0.012, 0xffffff, { umriss: false }), sx * 0.062, 0.005, 0.03 + i * 0.022, -0.5, 0, 0));
    }
    for (let i = 0; i < 3; i++) schuh.add(setze(quader(0.04, 0.006, 0.01, 0xffffff, { umriss: false }), 0, 0.04, 0.06 + i * 0.025, 0.3, 0, 0));
    k.add(schuh);
    huefte.add(k);
    koerper.add(huefte);
    beine.push({ huefte, k });
  }
  // Seitentasche rechts mit gelbem Zollstock und Zimmermannsbleistift
  const tasche = new THREE.Group();
  tasche.add(quader(0.03, 0.11, 0.1, 0x2a2b30, { umriss: 0.003 }));
  tasche.add(setze(quader(0.02, 0.15, 0.035, 0xf2c21c, { umriss: 0.002 }), 0.005, 0.06, -0.015));
  for (let i = 0; i < 4; i++) tasche.add(setze(quader(0.021, 0.002, 0.02, 0x111111, { umriss: false }), 0.005, 0.0 + i * 0.03, -0.015));
  tasche.add(setze(zylinder(0.006, 0.006, 0.16, 0xc8352a, { umriss: 0.0015 }, 6), 0.005, 0.07, 0.025));
  tasche.position.set(0.235, 0.82, 0.0);
  koerper.add(tasche);
  // ---------- Oberkörper: weißes, kurzärmliges Hemd weit offen mit viel Brusthaar, hellbraune Cord-Zimmermannsweste ----------
  const rumpf = new THREE.Group();
  rumpf.position.y = 0.92;
  koerper.add(rumpf);
  // Rumpfform: schlanker, flacher Bauch, Brust etwas breiter, oben runde Schultern bis zum Hals.
  // R(y) = halbe Breite, T(y) = Tiefe/Breite; y in Rumpfhöhe (0 = Hosenbund, 0,76 = Schulterkuppe)
  const glatt = (a, b, y) => { const t = THREE.MathUtils.clamp((y - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function R(y, plus = 0) {
    const r = 0.19 + plus;
    if (y > 0.56) return r * Math.sqrt(Math.max(0, 1 - ((y - 0.56) / r) ** 2));
    return 0.165 + plus + (0.19 - 0.165) * glatt(0.1, 0.45, y);
  }
  const T = (y) => 0.54 + 0.08 * glatt(0.15, 0.45, y);
  // Hülle um den Rumpf: Gitter aus Winkel (0 = vorne) und Höhe; offen(y) = halbe Breite der Öffnung vorne.
  // So bleiben Kanten (Hemd- und Westenöffnung) glatt und sauber.
  function huelle(plus, tiefePlus, y0, y1, offen, segU = 56, segV = 30) {
    const P = [], U = [], I = [];
    for (let j = 0; j <= segV; j++) {
      const y = y0 + (y1 - y0) * (j / segV);
      const rx = Math.max(0.001, R(y, plus));
      const rz = rx * T(y) + tiefePlus;
      const w = offen ? offen(y) : 0;
      const t0 = w > 0 ? Math.min(1.3, Math.asin(Math.min(0.999, w / rx))) : 0.0005;
      for (let i = 0; i <= segU; i++) {
        const th = t0 + (Math.PI * 2 - 2 * t0) * (i / segU);
        P.push(rx * Math.sin(th), y, rz * Math.cos(th));
        U.push(i / segU, j / segV);
      }
    }
    for (let j = 0; j < segV; j++) for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + segU + 1;
      I.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    g.setIndex(I);
    g.computeVertexNormals();
    return g;
  }
  // Punkt auf einer Hülle (für Kanten, Knöpfe, Taschen): x seitlich, y Höhe, d Abstand nach außen
  function aufHuelle(plus, tiefePlus, x, y, d = 0) {
    const rx = R(y, plus), rz = rx * T(y) + tiefePlus;
    const th = Math.asin(THREE.MathUtils.clamp(x / rx, -1, 1));
    const nx = Math.sin(th) * rz, nz = Math.cos(th) * rx, nl = Math.hypot(nx, nz);
    return { p: new THREE.Vector3(rx * Math.sin(th) + (nx / nl) * d, y, rz * Math.cos(th) + (nz / nl) * d), rot: Math.atan2(nx, nz) };
  }
  // Körper (Haut) unter dem offenen Hemd; der Hals sitzt direkt darauf, Brust und Hals gehen durchgehend ineinander über
  rumpf.add(teil(huelle(0, 0, -0.04, 0.76, null), F.HAUT, { umriss: 0.003 }));
  rumpf.add(setze(teil(new THREE.CylinderGeometry(0.066, 0.078, 0.26, 18), F.HAUT, { umriss: 0.003 }), 0, 0.79, -0.005));
  // Hemd: weit offen bis ganz oben (oben ganz auseinander, unten noch zwei Knöpfe zu)
  const hemdOffen = (y) => (y < 0.16 ? 0 : 0.012 + (y - 0.16) * 0.3);
  const H_PLUS = 0.008, H_T = 0.004;
  const hemdMat = toon(F.SHIRT, { side: THREE.DoubleSide });
  rumpf.add(teil(huelle(H_PLUS, H_T, -0.03, 0.735, hemdOffen), 0, { material: hemdMat, umriss: 0.002 }));
  // viel Brusthaar: nur auf der Brust im offenen Hemd, zum Bauch hin ein schmaler Streifen; Hals bleibt frei
  {
    const haarGeo = new THREE.CapsuleGeometry(0.0026, 0.013, 2, 4);
    const lage = [];
    const zr = (() => { let q = 77; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
    for (let i = 0; i < (A.brusthaar === false ? 0 : 3000) && lage.length < 750; i++) {
      const y = 0.18 + zr() * 0.48;
      const breite = Math.min(hemdOffen(y) - 0.006, y > 0.42 ? 0.15 : 0.02 + (y - 0.18) * 0.4);
      if (breite <= 0) continue;
      const x = (zr() * 2 - 1) * breite;
      if (y < 0.36 && zr() < 0.45) continue;
      if (y > 0.6 && zr() < (y - 0.6) * 12) continue; // dünnt zum Hals hin aus
      const o = aufHuelle(0, 0, x, y, 0.002);
      lage.push([o.p.x, y, o.p.z, o.rot]);
    }
    const haare = new THREE.InstancedMesh(haarGeo, toon(0x3e2818), lage.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler();
    lage.forEach(([x, y, zz, rot], i) => {
      eu.set(1.1 + (zr() - 0.5) * 0.8, rot, (zr() - 0.5) * 1.6);
      q.setFromEuler(eu);
      m.compose(new THREE.Vector3(x, y, zz), q, new THREE.Vector3(1, 0.7 + zr() * 0.8, 1));
      haare.setMatrixAt(i, m);
    });
    rumpf.add(haare);
  }
  // Hemdkanten (Knopfleiste), Kragen, Knöpfe unten
  for (const s of [-1, 1]) {
    const pts = [];
    for (let y = 0.16; y <= 0.735; y += 0.025) pts.push(aufHuelle(H_PLUS, H_T, s * Math.min(hemdOffen(y), R(y, H_PLUS) * Math.sin(1.3)), y, 0.002).p);
    rumpf.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.006, 6, false), 0xe9e6de, { umriss: 0.001 }));
    // Kragenecke klappt nach außen auf die Schulter
    const k = aufHuelle(H_PLUS, H_T, s * 0.13, 0.67, 0.006);
    rumpf.add(setze(quader(0.07, 0.09, 0.008, F.SHIRT, { umriss: 0.002 }), k.p.x, k.p.y, k.p.z, -0.45, k.rot, s * -0.5));
  }
  for (let i = 0; i < 2; i++) { const b = aufHuelle(H_PLUS, H_T, 0, 0.04 + i * 0.07, 0.003); rumpf.add(setze(zylinder(0.006, 0.006, 0.004, 0xd9d4c4, { umriss: false }, 8), b.p.x, b.p.y, b.p.z, Math.PI / 2, 0, 0)); }
  // Kragensteg hinten um den Hals
  rumpf.add(setze(teil(new THREE.CylinderGeometry(0.084, 0.09, 0.045, 20, 1, true, Math.PI * 0.45, Math.PI * 1.1), 0, { material: hemdMat, umriss: 0.002 }), 0, 0.735, -0.004));

  // Weste (helles Cord): liegt eng an Brust und Bauch, geht über die Schultern bis an den Hals, vorne offen;
  // die Arme kommen seitlich heraus, die Ärmel liegen darüber
  const cordTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#' + F.WESTE.toString(16).padStart(6, '0'); g.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 4) { g.fillStyle = 'rgba(90,60,30,0.38)'; g.fillRect(x, 0, 1.6, 64); g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(x + 2, 0, 1, 64); }
  }, [14, 3]);
  const westeMat = toon(0xffffff, { map: cordTex, side: THREE.DoubleSide });
  const westeOffen = (y) => 0.06 + (y - 0.06) * 0.13;
  const W_PLUS = 0.02, W_T = 0.01, W_Y0 = 0.06, W_Y1 = 0.71;
  rumpf.add(teil(huelle(W_PLUS, W_T, W_Y0, W_Y1, westeOffen), 0, { material: westeMat, umriss: 0.003 }));
  // Paspel an Vorderkanten, Saum und Halsausschnitt
  const PASPEL = 0x8d6a40;
  const kantenPunkt = (s, y) => aufHuelle(W_PLUS, W_T, s * Math.min(westeOffen(y), R(y, W_PLUS) * Math.sin(1.3)), y, 0.003).p;
  for (const s of [-1, 1]) {
    const pts = [];
    for (let y = W_Y0; y <= W_Y1 + 0.001; y += 0.026) pts.push(kantenPunkt(s, y));
    rumpf.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.0065, 6, false), PASPEL, { umriss: false }));
    for (let i = 0; i < 4; i++) {
      const y = 0.12 + i * 0.075;
      const b = aufHuelle(W_PLUS, W_T, s * (westeOffen(y) + 0.016), y, 0.004);
      rumpf.add(setze(zylinder(0.011, 0.011, 0.006, 0xf2efe6, { umriss: 0.0015 }, 10), b.p.x, b.p.y, b.p.z, Math.PI / 2, 0, -b.rot));
    }
    // Brusttasche mit Klappe und untere Tasche (Paspeltaschen)
    for (const [y, br] of [[0.48, 0.075], [0.2, 0.085]]) {
      const t = aufHuelle(W_PLUS, W_T, s * 0.13, y, 0.003);
      rumpf.add(setze(quader(br, 0.013, 0.008, PASPEL, { umriss: false }), t.p.x, t.p.y, t.p.z, 0, t.rot, 0));
    }
    const kl = aufHuelle(W_PLUS, W_T, s * 0.13, 0.465, 0.006);
    rumpf.add(setze(quader(0.075, 0.03, 0.006, 0xa97e4f, { umriss: 0.0015 }), kl.p.x, kl.p.y, kl.p.z, 0, kl.rot, 0));
  }
  for (const [y, plus, tiefe, r] of [[W_Y0, W_PLUS, W_T, 0.0065], [W_Y1, W_PLUS, W_T, 0.0065]]) {
    const rx = R(y, plus), rz = rx * T(y) + tiefe, t0 = Math.min(1.3, Math.asin(Math.min(0.999, westeOffen(y) / rx)));
    const pts = [];
    for (let i = 0; i <= 40; i++) { const th = t0 + (Math.PI * 2 - 2 * t0) * (i / 40); pts.push(new THREE.Vector3((rx + 0.002) * Math.sin(th), y, (rz + 0.002) * Math.cos(th))); }
    rumpf.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, r, 6, false), PASPEL, { umriss: false }));
  }
  // Aufnäher an der Weste
  const patchTex = leinwandTextur(64, 64, (g) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111'; g.beginPath(); g.moveTo(10, 50); g.lineTo(24, 18); g.lineTo(32, 34); g.lineTo(40, 14); g.lineTo(54, 50); g.fill(); });
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.05), new THREE.MeshBasicMaterial({ map: patchTex }));
  const pp = aufHuelle(W_PLUS, W_T, -0.14, 0.33, 0.004);
  patch.position.copy(pp.p);
  patch.rotation.y = pp.rot;
  rumpf.add(patch);

  // ---------- Arme: kurze Hemdsärmel, nackte behaarte Unterarme; Arme verschränkt wie auf dem Foto ----------
  const armHaarTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#eebda0'; g.fillRect(0, 0, 64, 64);
    const r = (() => { let q = 8; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
    g.strokeStyle = 'rgba(78,50,29,0.55)'; g.lineWidth = 1;
    for (let i = 0; i < 140; i++) { const x = r() * 64, y = r() * 64; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1, y + 4); g.stroke(); }
  });
  const armHaut = toon(0xffffff, { map: armHaarTex });
  function arm(seite) {
    const schulter = new THREE.Group();
    schulter.position.set(0.27 * seite, 0.62, 0);
    schulter.add(kugel(0.066, F.SHIRT, { umriss: 0.004 }, 10));
    // kurzer Ärmel mit Umschlag
    schulter.add(setze(teil(new THREE.CylinderGeometry(0.07, 0.078, 0.13, 12), F.SHIRT), 0, -0.07, 0));
    schulter.add(setze(zylinder(0.08, 0.08, 0.02, 0xe6e3dc, { umriss: 0.002 }, 12), 0, -0.13, 0));
    schulter.add(setze(teil(new THREE.CapsuleGeometry(0.056, 0.12, 4, 10), 0, { material: armHaut }), 0, -0.19, 0));
    const ellbogen = new THREE.Group();
    ellbogen.position.y = -0.27;
    ellbogen.add(teil(new THREE.SphereGeometry(0.052, 10, 8), 0, { material: armHaut }));
    ellbogen.add(setze(teil(new THREE.CapsuleGeometry(0.05, 0.16, 4, 10), 0, { material: armHaut }), 0, -0.11, 0));
    const hand = new THREE.Group();
    // Hand: runder, kräftiger Handballen, dicke Knöchel, große Finger mit zwei Gliedern und Nägeln, Daumen (gut erkennbar)
    const flaeche = teil(new THREE.SphereGeometry(0.058, 14, 10), F.HAUT, { umriss: 0.003 });
    flaeche.scale.set(1.0, 0.95, 0.46);
    flaeche.position.set(0, -0.03, 0.002);
    hand.add(flaeche);
    // Übergang vom Handgelenk (sonst sitzt der Ballen wie ein Klotz am Arm)
    hand.add(setze(teil(new THREE.CapsuleGeometry(0.036, 0.02, 4, 10), F.HAUT, { umriss: 0.0025 }), 0, 0.012, 0));
    // offene Finger (beim Bierhalten ausgeblendet, dann hält eine Faust die Flasche)
    const finger = new THREE.Group();
    hand.add(finger);
    for (let f = 0; f < 4; f++) {
      const x = (-0.037 + f * 0.0245) * seite;
      const lang = [0.05, 0.06, 0.056, 0.043][f]; // kräftige, lange Finger (große Hände)
      const neig = [0.06, 0.02, -0.02, -0.07][f] * seite; // leicht gespreizt
      const g = new THREE.Group();
      g.position.set(x, -0.075, 0.006);
      g.rotation.set(0.3, 0, neig); // locker eingekrümmt, nicht steif gestreckt
      finger.add(g);
      g.add(teil(new THREE.SphereGeometry(0.0175, 10, 8), 0xe2ab8c, { umriss: 0.0015 })); // Knöchel
      const glied1 = teil(new THREE.CapsuleGeometry(0.0168, lang, 4, 10), F.HAUT, { umriss: 0.0025 });
      glied1.position.set(0, -lang / 2 - 0.006, 0);
      g.add(glied1);
      // zweites Glied leicht eingekrümmt, mit Nagel an der Kuppe
      const k = new THREE.Group();
      k.position.set(0, -lang - 0.012, 0);
      k.rotation.x = 0.75;
      g.add(k);
      const glied2 = teil(new THREE.CapsuleGeometry(0.0158, lang * 0.7, 4, 10), F.HAUT, { umriss: 0.0025 });
      glied2.position.y = -lang * 0.35 - 0.004;
      k.add(glied2);
      const nagel = teil(new THREE.SphereGeometry(0.0105, 8, 6), 0xf4d8c8, { umriss: 0.001 });
      nagel.scale.set(1, 1.2, 0.35);
      nagel.position.set(0, -lang * 0.7 - 0.004, -0.013);
      k.add(nagel);
    }
    const daumen1 = teil(new THREE.CapsuleGeometry(0.019, 0.045, 4, 10), F.HAUT, { umriss: 0.0025 });
    daumen1.position.set(0.056 * seite, -0.038, 0.018);
    daumen1.rotation.set(0.3, 0, -0.75 * seite);
    finger.add(daumen1);
    const daumen2 = teil(new THREE.CapsuleGeometry(0.0175, 0.034, 4, 10), F.HAUT, { umriss: 0.0025 });
    daumen2.position.set(0.082 * seite, -0.078, 0.028);
    daumen2.rotation.set(0.5, 0, -0.3 * seite);
    finger.add(daumen2);
    const dNagel = teil(new THREE.SphereGeometry(0.0085, 8, 6), 0xf4d8c8, { umriss: 0.001 });
    dNagel.scale.set(1, 1.2, 0.35);
    dNagel.position.set(0.089 * seite, -0.096, 0.042);
    dNagel.rotation.set(0.5, 0, -0.3 * seite);
    finger.add(dNagel);
    // goldener Ring rechts
    if (seite > 0) hand.add(setze(teil(new THREE.TorusGeometry(0.016, 0.0045, 6, 14), F.GOLD, { umriss: false }), 0.012, -0.112, 0.006, Math.PI / 2, 0, 0));
    hand.position.y = -0.25;
    ellbogen.add(hand);
    schulter.add(ellbogen);
    rumpf.add(schulter);
    return { schulter, ellbogen, hand, finger };
  }
  const links = arm(-1);
  const rechts = arm(1);
  function armeVerschraenkt() {
    // richtig verschränkt: linker Unterarm unten, rechter darüber und etwas weiter vorn, Hände liegen am anderen Oberarm
    links.schulter.rotation.set(-0.3, 0, -0.16);
    links.ellbogen.rotation.set(-1.6, 0, 1.38);
    rechts.schulter.rotation.set(-0.48, 0, 0.16);
    rechts.ellbogen.rotation.set(-1.95, 0, -1.38);
    // Handgelenke abgeknickt: die Finger greifen um den anderen Oberarm statt quer vor der Brust zu stehen
    links.hand.rotation.set(0.35, 0, -0.85);
    rechts.hand.rotation.set(0.35, 0, 0.85);
  }
  // für alle anderen Haltungen (Kitzeln, Rauchen, Bier) Handgelenke wieder gerade
  function haendeGerade() { links.hand.rotation.set(0, 0, 0); rechts.hand.rotation.set(0, 0, 0); }
  armeVerschraenkt();
  // Kippe in der rechten Hand (nur beim Rauchen)
  const kippe = new THREE.Group();
  kippe.add(setze(zylinder(0.006, 0.006, 0.07, 0xf4f0e6, { umriss: false }, 6), 0, 0, 0, 0, 0, Math.PI / 2));
  kippe.add(setze(zylinder(0.0065, 0.0065, 0.02, 0xd9a35a, { umriss: false }, 6), -0.03, 0, 0, 0, 0, Math.PI / 2));
  const glut = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), new THREE.MeshBasicMaterial({ color: 0xff5a1f }));
  glut.position.x = 0.036;
  kippe.add(glut);
  kippe.position.set(0.02, -0.07, 0.03);
  kippe.visible = false;
  rechts.hand.add(kippe);
  // Rauchwölkchen
  const rauchTex = leinwandTextur(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(230,230,230,0.8)'); gr.addColorStop(1, 'rgba(230,230,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
  const rauch = Array.from({ length: 16 }, (_, i) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: rauchTex, transparent: true, depthWrite: false })); sp.visible = false; sp.userData.t = i / 16; sp.userData.dx = (Math.random() - 0.5) * 0.2; scene.add(sp); return sp; });

  // Bierflasche (braun, Etikett, Kronkorken) in der linken Faust: die Finger liegen um den Flaschenbauch
  const bier = new THREE.Group();
  const glas = toon(0x5a2e0e, { transparent: true, opacity: 0.92 });
  bier.add(teil(new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16), 0, { material: glas, umriss: 0.002 }));
  bier.add(setze(teil(new THREE.CylinderGeometry(0.012, 0.03, 0.05, 16), 0, { material: glas, umriss: 0.002 }), 0, 0.1, 0));
  bier.add(setze(teil(new THREE.CylinderGeometry(0.0125, 0.0125, 0.035, 12), 0, { material: glas, umriss: 0.002 }), 0, 0.14, 0));
  bier.add(setze(zylinder(0.014, 0.014, 0.008, 0xd9b44a, { umriss: 0.001 }, 12), 0, 0.161, 0));
  bier.add(setze(zylinder(0.0305, 0.0305, 0.06, 0xf2e6c4, { umriss: false }, 16), 0, -0.02, 0));
  bier.add(setze(zylinder(0.0306, 0.0306, 0.012, 0xc8352a, { umriss: false }, 16), 0, -0.02, 0));
  bier.add(setze(zylinder(0.0128, 0.0128, 0.012, 0xf2e6c4, { umriss: false }, 12), 0, 0.128, 0));
  // Faust: vier gekrümmte Finger vorne um die Flasche, Daumen von der anderen Seite drüber
  const faust = new THREE.Group();
  for (let f = 0; f < 4; f++) {
    const y = 0.035 - f * 0.024;
    const ring = teil(new THREE.TorusGeometry(0.041, 0.0135, 8, 14, Math.PI * 1.15), F.HAUT, { umriss: 0.002 });
    ring.rotation.set(Math.PI / 2, 0, -Math.PI * 0.05);
    ring.position.y = y;
    faust.add(ring);
    // Fingerkuppe mit Nagel am Ende
    const w = -Math.PI * 0.05 + Math.PI * 1.15;
    faust.add(setze(quader(0.012, 0.014, 0.004, 0xf4d8c8, { umriss: 0.001 }), Math.cos(w) * 0.05, y, -Math.sin(w) * 0.05, 0, w + Math.PI / 2, 0));
  }
  const daumenF = teil(new THREE.CapsuleGeometry(0.015, 0.05, 4, 8), F.HAUT, { umriss: 0.0025 });
  daumenF.position.set(-0.035, 0.05, 0.03);
  daumenF.rotation.set(0.3, 0, 1.1);
  faust.add(daumenF);
  // Handrücken außen an der Flasche
  faust.add(setze(teil(new THREE.BoxGeometry(0.03, 0.1, 0.075), F.HAUT, { umriss: 0.003 }), -0.05, 0.0, -0.01));
  bier.add(faust);
  bier.visible = false;
  wurzel.add(bier);
  // Bierhalten: Arm unten (Flasche vor dem Bauch) und am Mund (Flasche schräg nach oben); Werte werden gemischt
  const BIER_UNTEN = { s: [-0.35, 0.1, -0.12], e: [-1.3, 0, 0.35], kipp: 0.15 };
  const BIER_MUND = { s: [-1.98, 0.77, 0.19], e: [-1.04, 0, 0.03], kipp: 1.2 }; // per Suche bestimmt: Flaschenhals am Mund
  let trinkPhase = 0; // 0 = unten, 1 = am Mund
  let fixPhase = null; // nur für Tests
  const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _e = new THREE.Euler();
  // Pinkelstrahl (nur ganz selten sichtbar)
  const strahlMat = new THREE.MeshBasicMaterial({ color: 0xe8d23a, transparent: true, opacity: 0.85 });
  const strahl = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.86, 0.2), new THREE.Vector3(0, 0.9, 0.7), new THREE.Vector3(0, 0.0, 1.0)), 20, 0.008, 5, false), strahlMat);
  strahl.visible = false;
  wurzel.add(strahl);

  // ---------- Kopf: breites Gesicht, Vollbart, runde Brille, lange Haare, grüne Cap mit Schirm ----------
  const kopf = new THREE.Group();
  kopf.position.y = 0.9;
  rumpf.add(kopf);
  const schaedel = teil(new THREE.SphereGeometry(0.165, 22, 18), F.HAUT);
  schaedel.scale.set(0.98, 1.12, 0.98);
  schaedel.position.y = 0.12;
  kopf.add(schaedel);
  for (const x of [-0.16, 0.16]) kopf.add(setze(teil(new THREE.SphereGeometry(0.036, 10, 8), F.HAUT), x, 0.1, -0.01));
  const nase = teil(new THREE.SphereGeometry(0.032, 12, 10), F.HAUT);
  nase.position.set(0, 0.1, 0.162);
  nase.scale.set(0.9, 1.1, 1.0);
  kopf.add(nase);
  // Augen, blau
  const augen = [];
  for (const x of [-0.06, 0.06]) {
    const a = new THREE.Group();
    a.add(kugel(0.022, 0xffffff, { umriss: 0.003 }, 10));
    const pupille = kugel(0.012, 0x4f86b8, { umriss: false }, 8);
    pupille.position.z = 0.016;
    a.add(pupille);
    a.position.set(x, 0.15, 0.135);
    kopf.add(a);
    augen.push(a);
  }
  for (const x of [-0.062, 0.062]) kopf.add(setze(quader(0.066, 0.02, 0.024, F.BART, { umriss: false }), x, 0.2, 0.148));
  // Vollbart: Wangen und Kinn, Schnurrbart
  const bartGeo = new THREE.SphereGeometry(0.15, 18, 14, -Math.PI * 0.2, Math.PI * 1.4, Math.PI * 0.5, Math.PI * 0.38);
  const bart = teil(bartGeo, F.BART, { umriss: 0.004 });
  bart.scale.set(1.05, 1.1, 1.08);
  bart.position.set(0, 0.06, 0.012);
  kopf.add(bart);
  const kinnBart = teil(new THREE.SphereGeometry(0.085, 14, 10), F.BART, { umriss: 0.004 });
  kinnBart.scale.set(1.2, 1.0, 0.95);
  kinnBart.position.set(0, -0.03, 0.08);
  kopf.add(kinnBart);
  if (A.bart === 'stoppel') {
    // nur Dreitagebart: Bart flach an die Haut, kein Kinnbart
    bart.scale.set(1.0, 1.0, 1.0); bart.position.set(0, 0.06, 0.0);
    kinnBart.scale.set(1.0, 0.7, 0.7); kinnBart.position.set(0, -0.0, 0.07);
  }
  const schnurrbart = teil(new THREE.CapsuleGeometry(0.018, 0.06, 4, 8), F.BART, { umriss: 0.003 });
  schnurrbart.rotation.z = Math.PI / 2;
  schnurrbart.position.set(0, 0.055, 0.162);
  kopf.add(schnurrbart);
  // Mund (lacht), Zähne
  const mund = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5a1a14 }));
  mund.position.set(0, 0.035, 0.168);
  kopf.add(mund);
  kopf.add(setze(quader(0.045, 0.008, 0.004, 0xf4f0e0, { umriss: false }), 0, 0.03, 0.17));
  // runde goldene Brille
  const brille = new THREE.Group();
  const goldMat = toon(F.GOLD);
  for (const x of [-0.06, 0.06]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.0035, 5, 24), goldMat);
    ring.position.x = x;
    brille.add(ring);
    const glas = new THREE.Mesh(new THREE.CircleGeometry(0.037, 20), new THREE.MeshBasicMaterial({ color: 0xe6f3ff, transparent: true, opacity: 0.22 }));
    glas.position.set(x, 0, -0.002);
    brille.add(glas);
    brille.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.15), goldMat), x * 1.72, 0.008, -0.075));
  }
  brille.add(setze(new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.003, 4, 10, Math.PI), goldMat), 0, 0.008, 0));
  brille.position.set(0, 0.15, 0.162);
  if (A.brille) kopf.add(brille);
  // lange braune Haare: hinten und an den Seiten bis zur Schulter (Strähnen)
  const haarMat = toon(F.HAAR);
  const hinten = teil(new THREE.CapsuleGeometry(0.15, 0.16, 6, 14), 0, { material: haarMat, umriss: 0.004 });
  hinten.scale.set(1.12, 1, 0.6);
  hinten.position.set(0, 0.02, -0.085);
  kopf.add(hinten);
  if (!A.langeHaare) {
    // kurze Haare: flache Kappe oben, hinten kurz
    hinten.scale.set(1.08, 0.55, 0.55); hinten.position.set(0, 0.1, -0.06);
    const oben = teil(new THREE.SphereGeometry(0.172, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), 0, { material: haarMat, umriss: 0.004 });
    oben.scale.set(1.0, 0.9, 1.02); oben.position.set(0, 0.14, -0.01); oben.rotation.x = -0.15;
    kopf.add(oben);
  }
  for (let i = 0; i < (A.langeHaare ? 14 : 0); i++) {
    const w = -1.6 + (i / 13) * 3.2;
    const straehne = teil(new THREE.CapsuleGeometry(0.022, 0.2 + zufall() * 0.06, 4, 6), 0, { material: haarMat, umriss: 0.002 });
    straehne.position.set(Math.sin(w) * 0.16, -0.02, -Math.cos(w) * 0.12 - 0.02);
    straehne.rotation.set(-0.15, 0, Math.sin(w) * 0.25);
    kopf.add(straehne);
  }
  // grüne Cap, Schirm nach vorn, hinten Verschluss
  const cap = new THREE.Group();
  const kuppel = teil(new THREE.SphereGeometry(0.172, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), F.CAP, { umriss: 0.004 });
  kuppel.scale.set(1.02, 0.78, 1.02);
  cap.add(kuppel);
  const schirm = teil(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 20, 1, false, -Math.PI * 0.27, Math.PI * 0.54), F.CAP, { umriss: 0.003 });
  schirm.scale.set(1, 1, 1.15);
  schirm.position.set(0, 0.005, 0.075);
  schirm.rotation.x = -0.12;
  cap.add(schirm);
  cap.add(setze(kugel(0.014, F.CAP, { umriss: 0.002 }, 8), 0, 0.135, 0));
  cap.add(setze(quader(0.05, 0.012, 0.008, 0x5d6340, { umriss: false }), 0, 0.03, -0.172));
  cap.position.set(0, 0.2, -0.005);
  cap.rotation.x = 0.05;
  if (A.cap) kopf.add(cap);

  // ---------- Verhalten ----------
  let zeit = Math.random() * 10;
  let blinzeln = 3;
  let raucht = false;
  let blickZiel = null;
  let ziel = null;
  let zielFertig = null;
  let weg = []; // restliche Wegpunkte (um Wände herum, durch Türen)
  let tempo = 1.1;
  let schritt = 0;
  let kitzelt = false;
  let trinkt = false;
  let sitzHoehe = null; // null = steht, sonst Sitzhöhe über dem Boden (z. B. im Fahrzeug)
  const api = {
    wurzel,
    get position() { return wurzel.position; },
    kopfPosition() { const v = new THREE.Vector3(); kopf.getWorldPosition(v); v.y += 0.12; return v; },
    rauchen(an) {
      raucht = an;
      kippe.visible = an;
      for (const r of rauch) r.visible = an && wurzel.visible;
      if (an) {
        haendeGerade();
        rechts.schulter.rotation.set(-0.2, 0, 0.15);
        rechts.ellbogen.rotation.set(-1.9, 0, -0.5);
      } else armeVerschraenkt();
    },
    schauZu(punkt) { blickZiel = punkt; },
    heimPlatz: PLATZ.clone(),
    gehZu(x, z, t = 1.1) {
      if (zielFertig) zielFertig(false);
      weg = wegNach(wurzel.position, { x, z });
      const p = weg.shift();
      ziel = new THREE.Vector3(p.x, 0, p.z);
      tempo = t;
      return new Promise((r) => { zielFertig = r; });
    },
    // Laufen abbrechen (z. B. beim Einsteigen ins Fahrzeug)
    halt() { ziel = null; weg = []; const r = zielFertig; zielFertig = null; if (r) r(false); },
    heim() { return api.gehZu(PLATZ.x, PLATZ.z).then(() => { wurzel.rotation.y = Math.PI * 1.08; }); },
    get geht() { return !!ziel; },
    dreheZu(p) { wurzel.rotation.y = Math.atan2(p.x - wurzel.position.x, p.z - wurzel.position.z); },
    sichtbar(an) { wurzel.visible = an; for (const r of rauch) r.visible = an && raucht; },
    bier(an) { bier.visible = an; links.finger.visible = !an; if (an) haendeGerade(); if (!an) { kopf.rotation.x = 0; trinkPhase = 0; if (!kitzelt) armeVerschraenkt(); } },
    _test: { bierFlasche: () => bier, mund: () => mund, kopf: () => kopf, BIER_MUND, BIER_UNTEN, fix(k) { fixPhase = k; } },
    trinken(an) { trinkt = an; },
    kitzeln(an) {
      kitzelt = an;
      if (an) haendeGerade(); else armeVerschraenkt();
    },
    pinkeln(an) { strahl.visible = an; },
    // hinsetzen (Höhe der Sitzfläche über dem Boden) oder mit null wieder aufstehen
    sitzen(hoehe) { sitzHoehe = hoehe; if (hoehe === null) koerper.position.y = 0; },
    update(dt) {
      zeit += dt;
      // Laufen: zum Ziel drehen und hingehen, Beine schwingen
      if (ziel) {
        const d = new THREE.Vector3().subVectors(ziel, wurzel.position);
        d.y = 0;
        const rest = d.length();
        if (rest < 0.05 && weg.length) {
          const p = weg.shift();
          ziel.set(p.x, 0, p.z);
        } else if (rest < 0.05) {
          ziel = null;
          const r = zielFertig; zielFertig = null;
          if (r) r(true);
        } else {
          const soll = Math.atan2(d.x, d.z);
          let diff = soll - wurzel.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          wurzel.rotation.y += diff * Math.min(1, dt * 8);
          wurzel.position.addScaledVector(d.normalize(), Math.min(rest, tempo * dt));
          schritt += dt * tempo * 7;
        }
      }
      const schwung = ziel ? Math.sin(schritt) * 0.5 : 0;
      if (sitzHoehe !== null) {
        // sitzen: Oberschenkel nach vorn, Unterschenkel nach unten, Becken auf der Sitzfläche
        for (const b of beine) { b.huefte.rotation.x = -Math.PI / 2 + 0.1; b.k.rotation.x = Math.PI / 2 - 0.1; }
        koerper.position.y = (sitzHoehe + 0.06) / 0.95 - 0.9;
      } else {
        beine[0].huefte.rotation.x += (schwung - beine[0].huefte.rotation.x) * Math.min(1, dt * 10);
        beine[1].huefte.rotation.x += (-schwung - beine[1].huefte.rotation.x) * Math.min(1, dt * 10);
        beine[0].k.rotation.x = Math.max(0, -schwung) * 0.6;
        beine[1].k.rotation.x = Math.max(0, schwung) * 0.6;
      }
      // Kitzeln: beide Arme nach vorn, Finger zappeln
      if (kitzelt) {
        for (const [a, s] of [[links, -1], [rechts, 1]]) {
          a.schulter.rotation.set(-1.2 + Math.sin(zeit * 25 + s) * 0.15, 0, s * 0.1);
          a.ellbogen.rotation.set(-0.4, 0, 0);
        }
      }
      // Bier trinken: alle 5 s ein Schluck – Arm hebt die Flasche weich zum Mund, kippt sie, Kopf geht leicht in den Nacken
      if (bier.visible) {
        const takt = zeit % 5;
        const soll = trinkt && !kitzelt ? (takt < 0.7 ? takt / 0.7 : takt < 2.2 ? 1 : takt < 2.9 ? 1 - (takt - 2.2) / 0.7 : 0) : 0;
        trinkPhase += (soll - trinkPhase) * Math.min(1, dt * 8);
        if (fixPhase !== null) trinkPhase = fixPhase;
        const k = trinkPhase * trinkPhase * (3 - 2 * trinkPhase);
        if (!kitzelt) {
          const m = (a, b) => a + (b - a) * k;
          links.schulter.rotation.set(m(BIER_UNTEN.s[0], BIER_MUND.s[0]), m(BIER_UNTEN.s[1], BIER_MUND.s[1]), m(BIER_UNTEN.s[2], BIER_MUND.s[2]));
          links.ellbogen.rotation.set(m(BIER_UNTEN.e[0], BIER_MUND.e[0]), m(BIER_UNTEN.e[1], BIER_MUND.e[1]), m(BIER_UNTEN.e[2], BIER_MUND.e[2]));
        }
        kopf.rotation.x = -0.28 * k;
        // Flasche sitzt in der Faust, Ausrichtung im Raum: aufrecht, beim Trinken mit dem Hals zum Mund gekippt
        wurzel.updateMatrixWorld(true);
        links.hand.localToWorld(_v.set(0, -0.075, 0.035));
        bier.position.copy(wurzel.worldToLocal(_v));
        bier.quaternion.setFromEuler(_e.set(-(BIER_UNTEN.kipp + (BIER_MUND.kipp - BIER_UNTEN.kipp) * k), 0, 0));
      }
      // atmen, leicht wippen
      rumpf.scale.y = 1 + Math.sin(zeit * 1.6) * 0.008;
      koerper.rotation.y = Math.sin(zeit * 0.4) * 0.04;
      // Kopf zum Spieler drehen (begrenzt)
      if (blickZiel) {
        const lokal = wurzel.worldToLocal(blickZiel.clone());
        // beim Trinken guckt er geradeaus (Flasche am Mund)
        const ziel = trinkPhase > 0.02 ? 0 : THREE.MathUtils.clamp(Math.atan2(lokal.x, lokal.z), -0.9, 0.9);
        kopf.rotation.y += (ziel - kopf.rotation.y) * Math.min(1, dt * 3);
      }
      blinzeln -= dt;
      const zu = blinzeln < 0.12;
      for (const a of augen) a.scale.y = zu ? 0.15 : 1;
      if (blinzeln < 0) blinzeln = 2.5 + Math.random() * 3;
      if (raucht) {
        // alle paar Sekunden ziehen: Arm zum Mund
        const zug = (zeit % 6) < 1.2;
        const zielE = zug ? -2.45 : -1.9;
        rechts.ellbogen.rotation.x += (zielE - rechts.ellbogen.rotation.x) * Math.min(1, dt * 4);
        glut.material.color.set(zug ? 0xffb030 : 0xff5a1f);
        // dicker Qualm: steigt von der Kippe auf, nach jedem Zug pustet er eine Wolke aus dem Mund
        const p = new THREE.Vector3();
        kippe.getWorldPosition(p);
        const mundP = new THREE.Vector3();
        kopf.getWorldPosition(mundP);
        const puste = (zeit % 6) > 1.2 && (zeit % 6) < 2.6;
        for (const [i, r] of rauch.entries()) {
          r.userData.t = (r.userData.t + dt * 0.28) % 1;
          const t = r.userData.t;
          const ausMund = puste && i % 2 === 0;
          const q = ausMund ? mundP : p;
          r.position.set(q.x + r.userData.dx * t * 3 + Math.sin(zeit * 0.8 + i) * 0.08 * t, q.y + (ausMund ? 0.02 : 0.03) + t * 1.3, q.z + Math.cos(zeit * 0.6 + i) * 0.08 * t);
          r.scale.setScalar((ausMund ? 0.14 : 0.08) + t * 0.5);
          r.material.opacity = (1 - t) * (ausMund ? 0.8 : 0.65);
        }
      }
    },
  };
  return api;
}
