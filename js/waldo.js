// Waldo als Comic-Figur (nach Fotos vom Betreiber): kleiner als Dennis und Jonny, breit gebaut, kurze dunkle Haare,
// großer dunkler Vollbart mit Essensresten, beige Cap, dunkelroter Pulli mit weißem Bandlogo (Feine Sahne Fischfilet),
// kurze zerfetzte graue Jogginghose (Löcher, ausgefranster Saum, Kordel), behaarte Beine, weiße Söckchen, beige Sneaker.
// Hält meist einen Toast in der Hand und beißt ab und zu ab.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall as zufallsFolge } from './toon.js';

const HAUT = 0xe9b896;
const HAAR = 0x2e2018;
const BART = 0x3a261a;
const CAP = 0xcdb894;
const PULLI = 0x7a1f26;
const JOGGER = 0x9a9ea3;
const SNEAKER = 0xd9c7a3;
// Wo Waldo rumsteht: vorne rechts zwischen Bad-Tür und Stahlträgern, isst
const PLATZ = new THREE.Vector3(2.6, 0, 2.75);

export function baueWaldo(scene) {
  const wurzel = new THREE.Group();
  wurzel.position.copy(PLATZ);
  wurzel.rotation.y = Math.PI * 1.15;
  // kleiner als Dennis (0,93) und Jonny (0,95)
  wurzel.scale.setScalar(0.85);
  scene.add(wurzel);
  const zufall = zufallsFolge(57);

  const koerper = new THREE.Group();
  wurzel.add(koerper);

  // ---------- Jogginghose: grau, kurz, zerfetzt ----------
  const joggerTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#9a9ea3'; g.fillRect(0, 0, b, h);
    const r = zufallsFolge(31);
    // meliert
    for (let i = 0; i < 900; i++) { const v = 130 + r() * 50; g.fillStyle = `rgba(${v},${v + 3},${v + 6},0.35)`; g.fillRect(r() * b, r() * h, 1.5, 1.5); }
    // Löcher mit ausgefransten weißen Fäden
    for (const [x, y, rx, ry] of [[34, 70, 11, 7], [92, 40, 8, 6], [70, 100, 13, 6]]) {
      g.fillStyle = '#e9b896'; g.beginPath(); g.ellipse(x, y, rx, ry, r() * 0.6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#f2f2ee'; g.lineWidth = 1.2;
      for (let k = 0; k < 14; k++) { const w = (k / 14) * Math.PI * 2; g.beginPath(); g.moveTo(x + Math.cos(w) * rx, y + Math.sin(w) * ry); g.lineTo(x + Math.cos(w) * (rx - 4 - r() * 4), y + Math.sin(w) * (ry - 3 - r() * 3)); g.stroke(); }
      g.strokeStyle = '#6d7176'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.stroke();
    }
    // Flecken
    g.fillStyle = 'rgba(80,70,60,0.25)'; g.beginPath(); g.ellipse(20, 30, 9, 5, 0.4, 0, Math.PI * 2); g.fill();
  });
  const joggerMat = toon(0xffffff, { map: joggerTex });
  const becken = teil(new THREE.CapsuleGeometry(0.15, 0.13, 6, 12), 0, { material: joggerMat });
  becken.rotation.z = Math.PI / 2;
  becken.scale.set(1, 1, 0.82);
  becken.position.y = 0.9;
  koerper.add(becken);
  // Bund mit Gummizug und Kordel
  const bund = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.255, 0.05, 22, 1, true), toon(0x8a8e93));
  bund.scale.set(1, 1, 0.82);
  bund.position.y = 0.99;
  koerper.add(bund);
  for (const s of [-1, 1]) {
    const kordel = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.015, 0.99, 0.21), new THREE.Vector3(s * 0.03, 0.93, 0.215), new THREE.Vector3(s * 0.02, 0.86, 0.212)]);
    koerper.add(teil(new THREE.TubeGeometry(kordel, 8, 0.005, 5, false), 0xf2f2ee, { umriss: false }));
    koerper.add(setze(zylinder(0.008, 0.006, 0.02, 0xd9d9d4, { umriss: false }, 6), s * 0.02, 0.85, 0.212));
  }
  for (const x of [-0.125, 0.125]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.88, 0);
    // weites, kurzes Hosenbein
    const bein = teil(new THREE.CylinderGeometry(0.12, 0.135, 0.2, 16), 0, { material: joggerMat });
    bein.position.y = -0.09;
    huefte.add(bein);
    // ausgefranster Saum: Fetzen und Fäden hängen runter
    for (let i = 0; i < 16; i++) {
      const w = (i / 16) * Math.PI * 2;
      const lang = 0.02 + zufall() * 0.05;
      const fetzen = quader(0.025 + zufall() * 0.02, lang, 0.006, i % 3 ? JOGGER : 0x868a8f, { umriss: 0.0015 });
      fetzen.position.set(Math.sin(w) * 0.133, -0.19 - lang / 2, Math.cos(w) * 0.133);
      fetzen.rotation.y = w;
      fetzen.rotation.x = (zufall() - 0.5) * 0.3;
      huefte.add(fetzen);
    }
    for (let i = 0; i < 8; i++) {
      const w = zufall() * Math.PI * 2;
      huefte.add(setze(zylinder(0.0015, 0.0015, 0.04 + zufall() * 0.05, 0xf2f2ee, { umriss: false, wirft: false }, 3), Math.sin(w) * 0.13, -0.22 - zufall() * 0.03, Math.cos(w) * 0.13, (zufall() - 0.5) * 0.4, 0, (zufall() - 0.5) * 0.4));
    }
    // Seitentasche
    huefte.add(setze(quader(0.015, 0.08, 0.07, 0x8a8e93, { umriss: 0.002 }), x > 0 ? 0.13 : -0.13, -0.06, 0.02));
    // nackte, kräftige, behaarte Beine
    const beinTex = leinwandTextur(64, 64, (g) => {
      g.fillStyle = '#e9b896'; g.fillRect(0, 0, 64, 64);
      const r = zufallsFolge(x > 0 ? 3 : 4);
      g.strokeStyle = 'rgba(58,38,26,0.6)'; g.lineWidth = 1;
      for (let i = 0; i < 120; i++) { const px = r() * 64, py = r() * 64; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 2, py - 4); g.stroke(); }
    });
    const beinMat = toon(0xffffff, { map: beinTex });
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.095, 0.14, 4, 12), 0, { material: beinMat }), 0, -0.29, 0));
    const k = new THREE.Group();
    k.position.y = -0.42;
    k.add(teil(new THREE.SphereGeometry(0.09, 12, 10), 0, { material: beinMat }));
    k.add(setze(teil(new THREE.CapsuleGeometry(0.082, 0.2, 4, 12), 0, { material: beinMat }), 0, -0.16, 0));
    // weiße Sneakersöckchen
    k.add(setze(zylinder(0.066, 0.064, 0.05, 0xf7f7f4, { umriss: 0.003 }, 14), 0, -0.36, 0));
    // beige Sneaker: Obermaterial, weiße Sohle, Schnürung, Fersenlasche
    const schuh = new THREE.Group();
    schuh.position.y = -0.43;
    const oben = teil(new THREE.CapsuleGeometry(0.064, 0.16, 4, 12), SNEAKER, { umriss: 0.004 });
    oben.rotation.x = Math.PI / 2;
    oben.scale.set(1.05, 1, 0.75);
    oben.position.set(0, 0.0, 0.05);
    schuh.add(oben);
    const sohle = teil(new THREE.CapsuleGeometry(0.068, 0.17, 4, 12), 0xf4f4ef, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2;
    sohle.scale.set(1.08, 1, 0.32);
    sohle.position.set(0, -0.045, 0.05);
    schuh.add(sohle);
    for (let i = 0; i < 4; i++) schuh.add(setze(quader(0.045, 0.006, 0.01, 0xf4f0e6, { umriss: false }), 0, 0.045, 0.04 + i * 0.022, 0.3, 0, 0));
    schuh.add(setze(quader(0.03, 0.04, 0.01, 0xb8a27a, { umriss: 0.0015 }), 0, 0.03, -0.045));
    k.add(schuh);
    huefte.add(k);
    koerper.add(huefte);
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
  // Bandlogo vorne auf der Brust (weiß): Schriftzug in drei Zeilen, darunter ein Fisch
  const bandTex = leinwandTextur(256, 220, (g, b) => {
    g.clearRect(0, 0, b, 220);
    g.fillStyle = '#f4f2ec'; g.textAlign = 'center';
    g.font = 'bold 50px Impact, "Arial Black", sans-serif';
    g.fillText('FEINE', b / 2, 52); g.fillText('SAHNE', b / 2, 104);
    g.font = 'bold 40px Impact, "Arial Black", sans-serif';
    g.fillText('FISCHFILET', b / 2, 150);
    g.strokeStyle = '#f4f2ec'; g.lineWidth = 6;
    g.beginPath(); g.ellipse(b / 2 - 10, 188, 40, 15, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(b / 2 + 28, 188); g.lineTo(b / 2 + 56, 172); g.lineTo(b / 2 + 56, 204); g.closePath(); g.stroke();
    g.fillStyle = '#f4f2ec'; g.beginPath(); g.arc(b / 2 - 34, 184, 5, 0, Math.PI * 2); g.fill();
  });
  const bandLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.17), new THREE.MeshBasicMaterial({ map: bandTex, transparent: true }));
  bandLogo.position.set(0, 0.42, 0.218);
  rumpf.add(bandLogo);
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
  for (const x of [-0.064, 0.064]) kopf.add(setze(quader(0.07, 0.024, 0.024, HAAR, { umriss: false }), x, 0.2, 0.152, 0, 0, x > 0 ? 0.08 : -0.08));
  // kurze dunkle Haare an den Seiten und hinten
  const haarSeite = teil(new THREE.SphereGeometry(0.176, 18, 12, Math.PI * 0.9, Math.PI * 1.2, Math.PI * 0.25, Math.PI * 0.35), HAAR, { umriss: 0.003 });
  haarSeite.scale.set(1.05, 1.08, 1.0);
  haarSeite.position.y = 0.12;
    kopf.add(haarSeite);
  // großer Vollbart: Wangen, langes Kinn, Schnurrbart
  const bartTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#3a261a'; g.fillRect(0, 0, 64, 64);
    const r = zufallsFolge(12);
    g.strokeStyle = 'rgba(90,60,40,0.7)'; g.lineWidth = 1;
    for (let i = 0; i < 80; i++) { const px = r() * 64, py = r() * 64; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 3, py + 4, px + (r() - 0.5) * 4, py + 9); g.stroke(); }
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
  kopf.add(setze(quader(0.025, 0.004, 0.018, 0x5aa83a, { umriss: false }), 0.04, -0.03, 0.18, 0.4, 0.3, 0.6));
  kopf.add(setze(kugel(0.009, 0xf4f0d8, { umriss: false }, 6), -0.03, 0.01, 0.185));
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

  // ---------- Verhalten ----------
  let zeit = Math.random() * 10;
  let blinzeln = 2;
  let blickZiel = null;
  return {
    wurzel,
    get position() { return wurzel.position; },
    schauZu(punkt) { blickZiel = punkt; },
    update(dt) {
      zeit += dt;
      rumpf.scale.y = 1 + Math.sin(zeit * 1.4) * 0.01;
      // alle paar Sekunden vom Toast abbeißen und kauen
      const takt = zeit % 7;
      const beisst = takt < 1.0;
      toastHalten(beisst);
      mund.scale.y = takt > 1 && takt < 3 ? 0.5 + Math.abs(Math.sin(zeit * 12)) * 0.8 : 1;
      if (blickZiel && !beisst) {
        const lokal = wurzel.worldToLocal(blickZiel.clone());
        const ziel = THREE.MathUtils.clamp(Math.atan2(lokal.x, lokal.z), -0.9, 0.9);
        kopf.rotation.y += (ziel - kopf.rotation.y) * Math.min(1, dt * 3);
      }
      blinzeln -= dt;
      for (const a of augen) a.scale.y = blinzeln < 0.12 ? 0.15 : 1;
      if (blinzeln < 0) blinzeln = 2.5 + Math.random() * 3;
    },
  };
}
