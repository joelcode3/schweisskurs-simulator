// Waldo als Comic-Figur (nach Fotos vom Betreiber): kleiner als Dennis und Jonny, breit gebaut, kurze dunkle Haare,
// großer dunkler Vollbart mit Essensresten, beige Cap, dunkelroter Pulli mit weißem Bandlogo (Feine Sahne Fischfilet),
// kurze zerfetzte graue Jogginghose (Löcher, ausgefranster Saum, Kordel), behaarte Beine, weiße Söckchen, beige Sneaker.
// Hält meist einen Toast in der Hand und beißt ab und zu ab.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall as zufallsFolge } from './toon.js';

const HAUT = 0xe9b896;
const HAAR = 0x2e2018;
const BART = 0x1f130b;
const CAP = 0xcdb894;
const PULLI = 0x7a1f26;
const JOGGER = 0x9a9ea3;
const SNEAKER = 0xd9c7a3;
// Wo Waldo rumsteht: vorne rechts zwischen Bad-Tür und Stahlträgern, isst
// Waldo ist anfangs nicht da; er kommt durchs Tor rein (TOR) und geht dort wieder raus
const TOR = new THREE.Vector3(-0.85, 0, 3.55);

export function baueWaldo(scene) {
  const wurzel = new THREE.Group();
  wurzel.position.copy(TOR);
  wurzel.visible = false;
  wurzel.rotation.y = Math.PI * 1.15;
  // kleiner als Dennis (0,93) und Jonny (0,95)
  wurzel.scale.setScalar(0.85);
  scene.add(wurzel);
  const zufall = zufallsFolge(57);

  const koerper = new THREE.Group();
  wurzel.add(koerper);

  // ---------- Jogginghose: grau meliert, kurz, zerfetzt (Löcher, Risse, Fransen), weit, mit Nähten und Taschen ----------
  const joggerTex = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#9a9ea3'; g.fillRect(0, 0, b, h);
    const r = zufallsFolge(31);
    // meliert (Garn)
    for (let i = 0; i < 4000; i++) { const v = 120 + r() * 70; g.fillStyle = `rgba(${v},${v + 3},${v + 6},0.4)`; g.fillRect(r() * b, r() * h, 2, 1); }
    // Steppnaht seitlich und am Saum
    g.strokeStyle = 'rgba(70,74,79,0.8)'; g.lineWidth = 1.5; g.setLineDash([4, 3]);
    for (const x of [64, 192]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.beginPath(); g.moveTo(0, h - 10); g.lineTo(b, h - 10); g.stroke();
    g.setLineDash([]);
    // Löcher: Haut schaut durch, weiße Fäden spannen sich drüber, dunkler Rand
    for (const [x, y, rx, ry] of [[40, 120, 18, 10], [150, 80, 12, 8], [120, 190, 20, 9], [215, 150, 10, 14], [80, 50, 8, 6]]) {
      g.fillStyle = '#e9b896'; g.beginPath(); g.ellipse(x, y, rx, ry, r() * 0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y - 2, rx, ry * 0.8, 0, Math.PI, Math.PI * 2); g.stroke();
      g.strokeStyle = '#f4f4f0'; g.lineWidth = 1.3;
      for (let k = 0; k < 5; k++) { const yy = y - ry * 0.6 + k * ry * 0.3; g.beginPath(); g.moveTo(x - rx * 0.9, yy); g.quadraticCurveTo(x, yy + 3, x + rx * 0.9, yy + (r() - 0.5) * 4); g.stroke(); }
      for (let k = 0; k < 18; k++) { const w = (k / 18) * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(w) * rx, y + Math.sin(w) * ry); g.lineTo(x + Math.cos(w) * (rx + 3 + r() * 4), y + Math.sin(w) * (ry + 2 + r() * 4)); g.stroke(); }
      g.strokeStyle = '#6d7176'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.stroke();
    }
    // Flecken (Kaffee, Ketchup, Öl)
    for (const [x, y, c] of [[30, 30, 'rgba(90,60,40,0.3)'], [170, 30, 'rgba(160,40,30,0.3)'], [200, 220, 'rgba(40,40,40,0.25)']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, 10 + r() * 8, 6 + r() * 5, r() * 3, 0, Math.PI * 2); g.fill(); }
  });
  const joggerMat = toon(0xffffff, { map: joggerTex });
  const becken = teil(new THREE.CapsuleGeometry(0.165, 0.14, 6, 14), 0, { material: joggerMat });
  becken.rotation.z = Math.PI / 2;
  becken.scale.set(1, 1, 0.84);
  becken.position.y = 0.9;
  koerper.add(becken);
  // breiter Bund mit Gummizug (Rippen), Kordel mit Metallenden
  const bund = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.275, 0.06, 26, 1, true), toon(0x868a8f));
  bund.scale.set(1, 1, 0.84);
  bund.position.y = 0.99;
  koerper.add(bund);
  for (let i = 0; i < 26; i++) {
    const w = (i / 26) * Math.PI * 2;
    koerper.add(setze(quader(0.004, 0.055, 0.004, 0x6d7176, { umriss: false, wirft: false }), Math.sin(w) * 0.276, 0.99, Math.cos(w) * 0.276 * 0.84, 0, w, 0));
  }
  for (const s of [-1, 1]) {
    const kordel = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.012, 0.99, 0.232), new THREE.Vector3(s * 0.04, 0.93, 0.238), new THREE.Vector3(s * 0.025, 0.84, 0.234)]);
    koerper.add(teil(new THREE.TubeGeometry(kordel, 10, 0.0055, 5, false), 0xf2f2ee, { umriss: 0.001 }));
    koerper.add(setze(zylinder(0.008, 0.007, 0.025, 0xb8bcc2, { umriss: false }, 6), s * 0.025, 0.83, 0.234));
  }
  // Eingriffstaschen vorne (schräge Kante)
  for (const s of [-1, 1]) koerper.add(setze(quader(0.012, 0.13, 0.01, 0x7a7e83, { umriss: false }), s * 0.19, 0.88, 0.19, 0.2, s * 0.6, s * 0.35));
  const beine = [];
  for (const x of [-0.14, 0.14]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.88, 0);
    // weites, kurzes Hosenbein (endet kurz über dem Knie)
    const bein = teil(new THREE.CylinderGeometry(0.135, 0.15, 0.22, 18), 0, { material: joggerMat });
    bein.position.y = -0.1;
    huefte.add(bein);
    // Riss an einer Seite: Lasche klappt raus
    huefte.add(setze(quader(0.05, 0.07, 0.008, JOGGER, { umriss: 0.0015 }), x > 0 ? 0.13 : -0.13, -0.17, 0.06, 0.2, x > 0 ? 1.2 : -1.2, x > 0 ? -0.4 : 0.4));
    // ausgefranster Saum: Fetzen, Lappen und lange Fäden
    for (let i = 0; i < 24; i++) {
      const w = (i / 24) * Math.PI * 2;
      const lang = 0.015 + zufall() * 0.06;
      const fetzen = quader(0.02 + zufall() * 0.025, lang, 0.006, i % 3 ? JOGGER : 0x80848a, { umriss: 0.0012 });
      fetzen.position.set(Math.sin(w) * 0.148, -0.21 - lang / 2, Math.cos(w) * 0.148);
      fetzen.rotation.set((zufall() - 0.5) * 0.4, w, (zufall() - 0.5) * 0.3);
      huefte.add(fetzen);
    }
    for (let i = 0; i < 14; i++) {
      const w = zufall() * Math.PI * 2;
      huefte.add(setze(zylinder(0.0016, 0.0016, 0.05 + zufall() * 0.07, 0xf2f2ee, { umriss: false, wirft: false }, 3), Math.sin(w) * 0.147, -0.25 - zufall() * 0.03, Math.cos(w) * 0.147, (zufall() - 0.5) * 0.5, 0, (zufall() - 0.5) * 0.5));
    }
    // nackte, kräftige, stark behaarte Beine mit Knie und Wade
    const beinTex = leinwandTextur(128, 128, (g) => {
      g.fillStyle = '#e9b896'; g.fillRect(0, 0, 128, 128);
      const r = zufallsFolge(x > 0 ? 3 : 4);
      g.lineCap = 'round';
      for (let i = 0; i < 520; i++) { const px = r() * 128, py = r() * 128; g.strokeStyle = r() < 0.6 ? 'rgba(40,26,16,0.75)' : 'rgba(70,46,28,0.6)'; g.lineWidth = 1 + r() * 0.6; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 2, py + 3, px + 1 + r() * 2, py + 6 + r() * 3); g.stroke(); }
      // Mückenstich, blauer Fleck
      g.fillStyle = 'rgba(200,80,70,0.5)'; g.beginPath(); g.arc(40, 80, 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(90,80,140,0.25)'; g.beginPath(); g.ellipse(90, 30, 8, 6, 0, 0, Math.PI * 2); g.fill();
    });
    const beinMat = toon(0xffffff, { map: beinTex });
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.108, 0.12, 4, 14), 0, { material: beinMat }), 0, -0.3, 0));
    const k = new THREE.Group();
    k.position.y = -0.42;
    k.add(teil(new THREE.SphereGeometry(0.1, 14, 10), 0, { material: beinMat }));
    // Kniescheibe
    k.add(setze(teil(new THREE.SphereGeometry(0.045, 10, 8), 0, { material: beinMat }), 0, 0.01, 0.07));
    // kräftige Wade als Drehkörper
    const wade = teil(new THREE.LatheGeometry([[0.06, -0.36], [0.066, -0.31], [0.088, -0.22], [0.108, -0.13], [0.112, -0.07], [0.1, -0.02], [0.092, 0.0]].map(([rr, y]) => new THREE.Vector2(rr, y)), 22), 0, { material: beinMat });
    k.add(wade);
    // Knöchel
    for (const sx of [-1, 1]) k.add(setze(kugel(0.016, HAUT, { umriss: false }, 8), sx * 0.055, -0.345, 0.0));
    // weiße Sneakersöckchen mit Bündchen
    k.add(setze(zylinder(0.07, 0.068, 0.05, 0xf7f7f4, { umriss: 0.003 }, 16), 0, -0.37, 0));
    k.add(setze(zylinder(0.072, 0.072, 0.012, 0xe2e2dd, { umriss: false }, 16), 0, -0.35, 0));
    // beige Sneaker: Obermaterial mit Nähten, Kappe, weiße Sohle mit Profilrand, Schnürung, Fersenlasche, Lüftungslöcher
    const schuh = new THREE.Group();
    schuh.position.y = -0.44;
    const oben = teil(new THREE.CapsuleGeometry(0.07, 0.17, 4, 14), SNEAKER, { umriss: 0.004 });
    oben.rotation.x = Math.PI / 2;
    oben.scale.set(1.05, 1, 0.75);
    oben.position.set(0, 0.0, 0.05);
    schuh.add(oben);
    const kappe = setze(kugel(0.06, 0xcbb894, { umriss: 0.002 }, 12), 0, -0.005, 0.16);
    kappe.scale.set(1.15, 0.7, 0.8);
    schuh.add(kappe);
    const sohle = teil(new THREE.CapsuleGeometry(0.074, 0.18, 4, 14), 0xf4f4ef, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2;
    sohle.scale.set(1.08, 1, 0.32);
    sohle.position.set(0, -0.048, 0.05);
    schuh.add(sohle);
    schuh.add(setze(quader(0.15, 0.006, 0.3, 0xb8b8b2, { umriss: false }), 0, -0.035, 0.05));
    for (let i = 0; i < 5; i++) schuh.add(setze(quader(0.05, 0.007, 0.01, 0xf4f0e6, { umriss: false }), 0, 0.05 - i * 0.004, 0.02 + i * 0.022, 0.3, 0, 0));
    for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) schuh.add(setze(zylinder(0.004, 0.004, 0.004, 0x8d7a58, { umriss: false }, 6), sx * 0.06, 0.02, 0.02 + i * 0.03, 0, 0, Math.PI / 2));
    schuh.add(setze(quader(0.035, 0.05, 0.012, 0xb8a27a, { umriss: 0.0015 }), 0, 0.035, -0.05));
    k.add(schuh);
    huefte.add(k);
    koerper.add(huefte);
    beine.push(huefte);
  }

  // ---------- Oberkörper: breit, dunkelroter Pulli mit Bandlogo ----------
  const rumpf = new THREE.Group();
  rumpf.position.y = 0.95;
  koerper.add(rumpf);
  const logoTex = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#7a1f26'; g.fillRect(0, 0, b, h);
    const r = zufallsFolge(9);
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(40,0,5,${r() * 0.12})`; g.fillRect(r() * b, r() * h, 2, 2); }
  });
  const pulliMat = toon(0xffffff, { map: logoTex });
  const pulli = teil(new THREE.CapsuleGeometry(0.25, 0.32, 6, 20), 0, { material: pulliMat });
  pulli.position.y = 0.33;
  pulli.scale.set(1.08, 1, 0.85);
  pulli.rotation.y = 0;
  rumpf.add(pulli);

  const schultern = teil(new THREE.SphereGeometry(0.24, 16, 10), PULLI);
  schultern.scale.set(1.4, 0.55, 0.85);
  schultern.position.y = 0.62;
  rumpf.add(schultern);
  // Rippbund unten
  const ripp = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.05, 22, 1, true), toon(0x6a1a20));
  ripp.scale.set(1.08, 1, 0.85);
  ripp.position.y = 0.06;
  rumpf.add(ripp);

  // ---------- Arme: Hände in die Hüften, eine Hand hält einen Toast ----------
  function arm(seite) {
    const schulter = new THREE.Group();
    schulter.position.set(0.32 * seite, 0.6, 0);
    schulter.add(kugel(0.08, PULLI, { umriss: 0.004 }, 10));
    schulter.add(setze(teil(new THREE.CapsuleGeometry(0.075, 0.19, 4, 10), PULLI), 0, -0.12, 0));
    const ellbogen = new THREE.Group();
    ellbogen.position.y = -0.25;
    ellbogen.add(kugel(0.068, PULLI, { umriss: 0.004 }, 10));
    ellbogen.add(setze(teil(new THREE.CapsuleGeometry(0.066, 0.15, 4, 10), PULLI), 0, -0.11, 0));
    ellbogen.add(setze(zylinder(0.07, 0.066, 0.04, 0x6a1a20, { umriss: 0.003 }, 12), 0, -0.21, 0));
    const hand = new THREE.Group();
    const flaeche = teil(new THREE.CapsuleGeometry(0.045, 0.03, 4, 10), HAUT);
    flaeche.scale.set(1.15, 1, 0.7);
    hand.add(flaeche);
    for (let f = 0; f < 4; f++) {
      const finger = teil(new THREE.CapsuleGeometry(0.0135, 0.035, 4, 6), HAUT, { umriss: 0.002 });
      finger.position.set((-0.03 + f * 0.02) * seite, -0.052, 0.006);
      hand.add(finger);
    }
    hand.position.y = -0.27;
    ellbogen.add(hand);
    schulter.add(ellbogen);
    rumpf.add(schulter);
    return { schulter, ellbogen, hand };
  }
  const links = arm(-1);
  const rechts = arm(1);
  // linke Hand in die Hüfte
  links.schulter.rotation.set(0.15, 0, -0.55);
  links.ellbogen.rotation.set(0, 0, 1.6);
  // Toast (Panini mit Grillstreifen) in der rechten Hand
  const toast = new THREE.Group();
  const brotTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#d9a35a'; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#6b4320'; g.lineWidth = 5;
    for (let i = -64; i < 128; i += 14) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 40, 64); g.stroke(); }
  });
  const brot = teil(new THREE.BoxGeometry(0.11, 0.025, 0.1), 0, { material: toon(0xffffff, { map: brotTex }), umriss: 0.002 });
  toast.add(brot);
  toast.add(setze(quader(0.1, 0.012, 0.09, 0xf2d23c, { umriss: false }), 0, -0.014, 0.003));
  toast.add(setze(quader(0.105, 0.01, 0.095, 0x3c7a3a, { umriss: false }), 0.003, -0.02, 0.0));
  toast.position.set(0, -0.06, 0.05);
  toast.rotation.set(1.2, 0, 0.2);
  rechts.hand.add(toast);
  function toastHalten(beissen) {
    rechts.schulter.rotation.set(beissen ? -0.75 : -0.35, 0, 0.12);
    rechts.ellbogen.rotation.set(beissen ? -2.1 : -1.5, 0, -0.35);
  }
  toastHalten(false);

  // ---------- Kopf: breit, kurze dunkle Haare, riesiger Vollbart mit Krümeln, beige Cap ----------
  const kopf = new THREE.Group();
  kopf.position.y = 0.88;
  rumpf.add(kopf);
  rumpf.add(setze(zylinder(0.08, 0.09, 0.1, HAUT, { umriss: 0.004 }), 0, 0.8, 0));
  const schaedel = teil(new THREE.SphereGeometry(0.17, 22, 18), HAUT);
  schaedel.scale.set(1.05, 1.08, 1.0);
  schaedel.position.y = 0.12;
  kopf.add(schaedel);
  for (const x of [-0.175, 0.175]) kopf.add(setze(teil(new THREE.SphereGeometry(0.038, 10, 8), HAUT), x, 0.1, -0.01));
  const nase = teil(new THREE.SphereGeometry(0.034, 12, 10), 0xe2a684);
  nase.position.set(0, 0.105, 0.17);
  nase.scale.set(1, 1.05, 1.0);
  kopf.add(nase);
  const augen = [];
  for (const x of [-0.06, 0.06]) {
    const a = new THREE.Group();
    a.add(kugel(0.02, 0xffffff, { umriss: 0.003 }, 10));
    const pupille = kugel(0.012, 0x4a3a2a, { umriss: false }, 8);
    pupille.position.z = 0.014;
    a.add(pupille);
    a.position.set(x, 0.155, 0.142);
    kopf.add(a);
    augen.push(a);
  }
  for (const x of [-0.064, 0.064]) kopf.add(setze(quader(0.052, 0.016, 0.02, 0x3a2618, { umriss: false }), x, 0.198, 0.152, 0, 0, x > 0 ? 0.12 : -0.12));
  // kurze dunkle Haare an den Seiten und hinten
  const haarSeite = teil(new THREE.SphereGeometry(0.176, 18, 12, Math.PI * 0.9, Math.PI * 1.2, Math.PI * 0.25, Math.PI * 0.35), HAAR, { umriss: 0.003 });
  haarSeite.scale.set(1.05, 1.08, 1.0);
  haarSeite.position.y = 0.12;
    kopf.add(haarSeite);
  // großer Vollbart: Wangen, langes Kinn, Schnurrbart
  const bartTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#1f130b'; g.fillRect(0, 0, 64, 64);
    const r = zufallsFolge(12);
    g.lineWidth = 1;
    for (let i = 0; i < 260; i++) { const px = r() * 64, py = r() * 64; g.strokeStyle = r() < 0.7 ? 'rgba(70,46,30,0.7)' : 'rgba(10,6,3,0.8)'; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + (r() - 0.5) * 6, py + 5, px + (r() - 0.5) * 5, py + 10 + r() * 4); g.stroke(); }
  }, [2, 2]);
  const bartMat = toon(0xffffff, { map: bartTex });
  const bart = teil(new THREE.SphereGeometry(0.16, 18, 14, -Math.PI * 0.2, Math.PI * 1.4, Math.PI * 0.5, Math.PI * 0.4), 0, { material: bartMat, umriss: 0.004 });
  bart.scale.set(1.08, 1.12, 1.08);
  bart.position.set(0, 0.06, 0.015);
  kopf.add(bart);
  const kinnBart = teil(new THREE.CapsuleGeometry(0.095, 0.1, 6, 14), 0, { material: bartMat, umriss: 0.004 });
  kinnBart.scale.set(1.25, 1, 0.85);
  kinnBart.position.set(0, -0.07, 0.085);
  kinnBart.rotation.x = 0.25;
  kopf.add(kinnBart);
  const schnurrbart = teil(new THREE.CapsuleGeometry(0.02, 0.08, 4, 8), 0, { material: bartMat, umriss: 0.003 });
  schnurrbart.rotation.z = Math.PI / 2;
  schnurrbart.position.set(0, 0.06, 0.168);
  kopf.add(schnurrbart);
  // Bart-Strähnen: viele kleine, nach unten zeigende Büschel auf Wangen und Kinn (wirkt dicht und zottelig)
  {
    const buschelGeo = new THREE.ConeGeometry(0.014, 0.05, 5);
    buschelGeo.rotateX(Math.PI);
    const lagen = [];
    for (let i = 0; i < 260 && lagen.length < 150; i++) {
      const w = (zufall() - 0.5) * Math.PI * 1.25;
      const y = -0.13 + zufall() * 0.2;
      // Oberfläche grob: Wangen (Kugel) oben, Kinn (länglich) unten
      const rad = y > 0 ? 0.165 : 0.12 + (y + 0.13) * 0.3;
      const x = Math.sin(w) * rad * 1.1;
      const zz = Math.cos(w) * rad * (y > 0 ? 1.0 : 0.95) + (y > 0 ? 0.015 : 0.06);
      if (y > 0.05 && Math.abs(x) < 0.07) continue; // Mund und Schnurrbart frei
      lagen.push([x, y, zz, w]);
    }
    const buschel = new THREE.InstancedMesh(buschelGeo, toon(0xffffff), lagen.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sk = new THREE.Vector3(), f = new THREE.Color();
    lagen.forEach(([x, y, zz, w], i) => {
      e.set(-0.3 + (zufall() - 0.5) * 0.5, w, (zufall() - 0.5) * 0.6);
      q.setFromEuler(e);
      const g = 0.8 + zufall() * 0.7;
      sk.set(g, g * (1 + zufall() * 0.6), g);
      m.compose(new THREE.Vector3(x, y, zz), q, sk);
      buschel.setMatrixAt(i, m);
      buschel.setColorAt(i, f.setHex(zufall() < 0.75 ? 0x24160d : 0x3d2817));
    });
    kopf.add(buschel);
  }
  const mund = new THREE.Mesh(new THREE.CircleGeometry(0.022, 12, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x5a1a14 }));
  mund.position.set(0, 0.04, 0.178);
  kopf.add(mund);
  // Essensreste im Bart: Brotkrümel, ein Stück Salat, ein Klecks Mayo
  for (let i = 0; i < 9; i++) {
    const kr = quader(0.01 + zufall() * 0.008, 0.008, 0.008, i % 3 ? 0xd9a35a : 0xb07a3a, { umriss: false });
    kr.position.set((zufall() - 0.5) * 0.17, -0.05 + zufall() * 0.1, 0.16 + zufall() * 0.02);
    kr.rotation.set(zufall() * 3, zufall() * 3, zufall() * 3);
    kopf.add(kr);
  }
  for (let i = 0; i < 10; i++) {
    const kr = quader(0.006 + zufall() * 0.008, 0.006, 0.007, 0xc98f48, { umriss: false });
    kr.position.set((zufall() - 0.5) * 0.2, -0.12 + zufall() * 0.12, 0.13 + zufall() * 0.03);
    kr.rotation.set(zufall() * 3, zufall() * 3, zufall() * 3);
    kopf.add(kr);
  }
  // Salatblatt, Tomatenstück, Käsefetzen, Sesam, Mayo-Kleckse, ein Stück Brotkruste
  kopf.add(setze(quader(0.03, 0.004, 0.02, 0x5aa83a, { umriss: 0.001 }), 0.04, -0.03, 0.18, 0.4, 0.3, 0.6));
  kopf.add(setze(quader(0.018, 0.012, 0.006, 0xd8352a, { umriss: 0.001 }), -0.06, -0.06, 0.155, 0.2, -0.4, 0.3));
  kopf.add(setze(quader(0.022, 0.003, 0.016, 0xf2c94a, { umriss: 0.001 }), 0.02, -0.1, 0.16, 0.5, 0, -0.4));
  for (let i = 0; i < 8; i++) kopf.add(setze(kugel(0.003, 0xf4ecd0, { umriss: false }, 4), (zufall() - 0.5) * 0.14, -0.1 + zufall() * 0.12, 0.17 + zufall() * 0.012));
  for (const [x, y] of [[-0.03, 0.01], [0.055, -0.07], [-0.01, -0.12]]) {
    const mayo = kugel(0.008, 0xf6f1d8, { umriss: false }, 6);
    mayo.scale.set(1.3, 0.7, 0.6);
    mayo.position.set(x, y, 0.178);
    kopf.add(mayo);
  }
  kopf.add(setze(quader(0.03, 0.01, 0.01, 0x8a5a26, { umriss: 0.001 }), -0.08, -0.02, 0.15, 0, -0.6, 0.5));
  // beige Cap nach vorne, mit kleinem Logo
  const cap = new THREE.Group();
  const kuppel = teil(new THREE.SphereGeometry(0.18, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { umriss: 0.004 });
  kuppel.scale.set(1.03, 0.72, 1.03);
  cap.add(kuppel);
  const schirm = teil(new THREE.CylinderGeometry(0.155, 0.155, 0.014, 20, 1, false, -Math.PI * 0.25, Math.PI * 0.5), CAP, { umriss: 0.003 });
  schirm.scale.set(1, 1, 1.2);
  schirm.position.set(0, 0.0, 0.07);
  schirm.rotation.x = -0.12;
  cap.add(schirm);
  cap.add(setze(kugel(0.014, CAP, { umriss: 0.002 }, 8), 0, 0.13, 0));
  cap.add(setze(quader(0.05, 0.03, 0.006, 0x2f5fa8, { umriss: false }), 0, 0.07, 0.172, -0.35, 0, 0));
  cap.position.set(0, 0.21, 0.0);
  cap.rotation.x = 0.06;
  kopf.add(cap);

  // Handy (Bildschirm leuchtet), Waldo guckt ständig drauf
  const handy = new THREE.Group();
  handy.add(quader(0.075, 0.14, 0.012, 0x1d1d1f, { umriss: 0.002 }));
  const bildschirm = new THREE.Mesh(new THREE.PlaneGeometry(0.064, 0.125), new THREE.MeshBasicMaterial({ color: 0x8fd0ff }));
  bildschirm.position.z = 0.0065;
  handy.add(bildschirm);
  handy.position.set(0, -0.07, 0.04);
  handy.rotation.set(-1.2, 0, 0);
  handy.visible = false;
  rechts.hand.add(handy);
  // die Kackepumpe (Tauchpumpe mit Schlauch), wenn er sie gefunden hat
  const pumpeInHand = new THREE.Group();
  pumpeInHand.add(setze(zylinder(0.07, 0.08, 0.2, 0x2f5fa8, { umriss: 0.003 }, 14), 0, -0.12, 0));
  pumpeInHand.add(setze(zylinder(0.03, 0.03, 0.03, 0x1d1d1f, { umriss: 0.002 }, 10), 0, -0.005, 0));
  pumpeInHand.add(setze(teil(new THREE.TorusGeometry(0.1, 0.02, 6, 16), 0x1d1d1f, { umriss: 0.002 }), 0.0, -0.12, 0.1, 0, Math.PI / 2, 0));
  pumpeInHand.position.set(0, -0.05, 0.05);
  pumpeInHand.visible = false;
  links.hand.add(pumpeInHand);

  // ---------- Verhalten ----------
  let zeit = Math.random() * 10;
  let blinzeln = 2;
  let blickZiel = null;
  let ziel = null;
  let zielFertig = null;
  let tempo = 1.1;
  let schritt = 0;
  let haltung = 'stehen'; // stehen | sitzen | handy | rennen | suchen
  let sitzHoehe = 0;
  const api = {
    wurzel,
    TOR,
    get position() { return wurzel.position; },
    get da() { return wurzel.visible; },
    schauZu(punkt) { blickZiel = punkt; },
    sichtbar(an) { wurzel.visible = an; },
    gehZu(x, z, t = 1.1) {
      if (zielFertig) zielFertig(false);
      ziel = new THREE.Vector3(x, 0, z);
      tempo = t;
      return new Promise((r) => { zielFertig = r; });
    },
    dreheZu(p) { wurzel.rotation.y = Math.atan2(p.x - wurzel.position.x, p.z - wurzel.position.z); },
    haltung(h, hoehe = 0.46) {
      haltung = h;
      sitzHoehe = hoehe;
      handy.visible = h === 'handy' || h === 'sitzen';
      toast.visible = h === 'stehen';
    },
    pumpe(an) { pumpeInHand.visible = an; },
    update(dt) {
      if (!wurzel.visible) return;
      zeit += dt;
      rumpf.scale.y = 1 + Math.sin(zeit * 1.4) * 0.01;
      if (ziel) {
        const d = new THREE.Vector3().subVectors(ziel, wurzel.position);
        d.y = 0;
        const rest = d.length();
        if (rest < 0.05) {
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
      const sitzt = haltung === 'sitzen' && !ziel;
      // Beine: laufen, rennen oder sitzen
      const schwung = ziel ? Math.sin(schritt) * (tempo > 2 ? 0.8 : 0.5) : 0;
      for (const [i, b] of beine.entries()) {
        const zielH = sitzt ? -1.5 : (i ? -schwung : schwung);
        b.rotation.x += (zielH - b.rotation.x) * Math.min(1, dt * 10);
        const knie = b.children.find((c) => c.position.y === -0.42);
        if (knie) knie.rotation.x = sitzt ? 1.5 : Math.max(0, i ? schwung : -schwung) * 0.7;
      }
      const zielY = sitzt ? sitzHoehe - 0.88 * 0.85 : 0;
      wurzel.position.y += (zielY - wurzel.position.y) * Math.min(1, dt * 6);
      // Arme und Kopf je nach Haltung
      if (haltung === 'rennen' || haltung === 'suchen') {
        const w = Math.sin(zeit * (haltung === 'rennen' ? 14 : 6));
        rechts.schulter.rotation.set(w * 0.8 - 0.2, 0, 0.2);
        rechts.ellbogen.rotation.set(-1.0, 0, 0);
        links.schulter.rotation.set(-w * 0.8 - 0.2, 0, -0.2);
        links.ellbogen.rotation.set(-1.0, 0, 0);
        kopf.rotation.x = haltung === 'suchen' ? 0.25 + Math.sin(zeit * 3) * 0.15 : 0;
        kopf.rotation.y = haltung === 'suchen' ? Math.sin(zeit * 2.2) * 0.7 : 0;
      } else if (handy.visible) {
        // Handy vor der Brust, Kopf runter, Daumen wischt
        rechts.schulter.rotation.set(-0.5, 0, 0.1);
        rechts.ellbogen.rotation.set(-1.7, 0, -0.35);
        links.schulter.rotation.set(sitzt ? -0.5 : 0.15, 0, sitzt ? -0.1 : -0.55);
        links.ellbogen.rotation.set(sitzt ? -1.2 : 0, 0, sitzt ? 0.3 : 1.6);
        kopf.rotation.x += (0.38 - kopf.rotation.x) * Math.min(1, dt * 4);
        bildschirm.material.color.setHSL(0.56, 0.7, 0.72 + Math.sin(zeit * 3) * 0.05);
      } else {
        // steht, isst Toast, guckt umher
        links.schulter.rotation.set(0.15, 0, -0.55);
        links.ellbogen.rotation.set(0, 0, 1.6);
        const takt = zeit % 7;
        const beisst = takt < 1.0;
        toastHalten(beisst);
        mund.scale.y = takt > 1 && takt < 3 ? 0.5 + Math.abs(Math.sin(zeit * 12)) * 0.8 : 1;
        kopf.rotation.x *= 0.9;
        if (blickZiel && !beisst) {
          const lokal = wurzel.worldToLocal(blickZiel.clone());
          const zw = THREE.MathUtils.clamp(Math.atan2(lokal.x, lokal.z), -0.9, 0.9);
          kopf.rotation.y += (zw - kopf.rotation.y) * Math.min(1, dt * 3);
        }
      }
      blinzeln -= dt;
      for (const a of augen) a.scale.y = blinzeln < 0.12 ? 0.15 : 1;
      if (blinzeln < 0) blinzeln = 2.5 + Math.random() * 3;
    },
  };
  return api;
}
