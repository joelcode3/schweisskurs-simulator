// Waldo als Comic-Figur (nach Fotos vom Betreiber): kleiner als Dennis und Jonny, breit gebaut, kurze dunkle Haare,
// langer, voller braun-dunkler Vollbart mit Essensresten, beige Cap, dunkelroter Pulli (ohne Logo),
// kurze zerfetzte graue Jogginghose (Löcher, ausgefranster Saum, Gummibund mit Kordel), weiße Söckchen, beige Sneaker.
// Hält meist einen Toast in der Hand und beißt ab und zu ab.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall as zufallsFolge } from './toon.js';

const HAUT = 0xe9b896;
const HAAR = 0x3a2416;
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
  // Hosenoberteil (Gesäß/Hüfte) als leicht ausgestellter Zylinder, damit Bund und Beine sauber anschließen
  const becken = teil(new THREE.CylinderGeometry(0.245, 0.27, 0.16, 32), 0, { material: joggerMat });
  becken.scale.set(1.08, 1, 0.82);
  becken.position.y = 0.8;
  koerper.add(becken);
  // Gummibund (fein gerippt) direkt unter dem Pullisaum, mit Kordel und Metallenden
  const bundTex = leinwandTextur(256, 32, (g, b, h) => {
    g.fillStyle = '#a3a7ac'; g.fillRect(0, 0, b, h);
    for (let x = 0; x < b; x += 4) { g.fillStyle = 'rgba(80,84,90,0.35)'; g.fillRect(x, 0, 1.5, h); }
    g.fillStyle = 'rgba(70,74,79,0.6)'; g.fillRect(0, 0, b, 2); g.fillRect(0, h - 2, b, 2);
  }, [4, 1]);
  const bund = teil(new THREE.CylinderGeometry(0.247, 0.247, 0.05, 32), 0, { material: toon(0xffffff, { map: bundTex }), umriss: 0.003 });
  bund.scale.set(1.08, 1, 0.82);
  bund.position.y = 0.895;
  koerper.add(bund);
  for (const s of [-1, 1]) {
    const kordel = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.012, 0.9, 0.206), new THREE.Vector3(s * 0.035, 0.86, 0.212), new THREE.Vector3(s * 0.028, 0.79, 0.214)]);
    koerper.add(teil(new THREE.TubeGeometry(kordel, 10, 0.005, 5, false), 0xf2f2ee, { umriss: 0.001 }));
    koerper.add(setze(zylinder(0.007, 0.006, 0.022, 0xb8bcc2, { umriss: false }, 6), s * 0.028, 0.778, 0.214));
  }
  // Eingriffstaschen vorne (schräge Kante)
  for (const s of [-1, 1]) koerper.add(setze(quader(0.01, 0.12, 0.008, 0x7a7e83, { umriss: false }), s * 0.2, 0.8, 0.165, 0.15, s * 0.75, s * 0.35));
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
      for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(200,140,110,${r() * 0.15})`; g.fillRect(r() * 128, r() * 128, 4, 4); }
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
  // gerader Pullisaum (fällt locker über den Hosenbund)
  const saum = teil(new THREE.CylinderGeometry(0.25, 0.258, 0.2, 32), 0, { material: pulliMat });
  saum.scale.set(1.08, 1, 0.85);
  saum.position.y = 0.06;
  rumpf.add(saum);

  const schultern = teil(new THREE.SphereGeometry(0.24, 16, 10), PULLI);
  schultern.scale.set(1.4, 0.55, 0.85);
  schultern.position.y = 0.62;
  rumpf.add(schultern);

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

  // ---------- Kopf (nach Fotos): breites, rundes Gesicht, volle Wangen, gerade dicke Brauen, braune Augen, breite Nase,
  // kurze dunkle Haare an Seiten und Hinterkopf, die über die Koteletten nahtlos in einen vollen dunklen Bart übergehen ----------
  const kopf = new THREE.Group();
  kopf.position.y = 0.88;
  rumpf.add(kopf);
  rumpf.add(setze(zylinder(0.085, 0.095, 0.12, HAUT, { umriss: 0.004 }), 0, 0.8, 0));
  // Teil einer Kugel zuschneiden: behält Dreiecke, deren Mitte behalten(x, y, z) erfüllt
  function zuschnitt(geo, behalten) {
    const g = geo.toNonIndexed();
    const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
    const P = [], N = [], U = [];
    for (let i = 0; i < pos.count; i += 3) {
      let cx = 0, cy = 0, cz = 0;
      for (let k = 0; k < 3; k++) { cx += pos.getX(i + k); cy += pos.getY(i + k); cz += pos.getZ(i + k); }
      if (!behalten(cx / 3, cy / 3, cz / 3)) continue;
      for (let k = 0; k < 3; k++) { P.push(pos.getX(i + k), pos.getY(i + k), pos.getZ(i + k)); N.push(nor.getX(i + k), nor.getY(i + k), nor.getZ(i + k)); U.push(uv.getX(i + k), uv.getY(i + k)); }
    }
    const n = new THREE.BufferGeometry();
    n.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    n.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    n.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
    return n;
  }
  const schaedel = teil(new THREE.SphereGeometry(0.17, 26, 20), HAUT);
  schaedel.scale.set(1.07, 1.04, 1.0);
  schaedel.position.y = 0.12;
  kopf.add(schaedel);
  // volle Wangen
  for (const sx of [-1, 1]) kopf.add(setze(teil(new THREE.SphereGeometry(0.06, 12, 10), HAUT, { umriss: false }), sx * 0.09, 0.115, 0.115));
  for (const x of [-0.18, 0.18]) {
    const ohr = teil(new THREE.SphereGeometry(0.036, 10, 8), HAUT, { umriss: 0.002 });
    ohr.scale.set(0.55, 1.15, 0.85);
    ohr.position.set(x, 0.12, -0.01);
    kopf.add(ohr);
  }
  const nase = teil(new THREE.SphereGeometry(0.034, 14, 10), 0xe4a886, { umriss: 0.002 });
  nase.position.set(0, 0.11, 0.172);
  nase.scale.set(1.2, 1.05, 1.0);
  kopf.add(nase);
  kopf.add(setze(teil(new THREE.CylinderGeometry(0.014, 0.02, 0.06, 8), 0xe4a886, { umriss: false }), 0, 0.14, 0.165, -0.25, 0, 0));
  for (const sx of [-1, 1]) kopf.add(setze(kugel(0.006, 0x8a4a3a, { umriss: false }, 6), sx * 0.014, 0.095, 0.188));
  const augen = [];
  for (const x of [-0.062, 0.062]) {
    const a = new THREE.Group();
    const weiss = kugel(0.019, 0xffffff, { umriss: 0.0025 }, 12);
    weiss.scale.set(1.15, 0.85, 0.7);
    a.add(weiss);
    const iris = kugel(0.0105, 0x5a3a22, { umriss: false }, 10);
    iris.position.z = 0.011;
    a.add(iris);
    const pupille = kugel(0.005, 0x111111, { umriss: false }, 6);
    pupille.position.z = 0.017;
    a.add(pupille);
    // Oberlid (leicht müder Blick)
    a.add(setze(quader(0.046, 0.008, 0.012, 0xd99d7c, { umriss: false }), 0, 0.014, 0.008, 0.2, 0, 0));
    a.position.set(x, 0.158, 0.163);
    kopf.add(a);
    augen.push(a);
  }
  // dicke, gerade dunkle Brauen
  for (const x of [-0.066, 0.066]) kopf.add(setze(teil(new THREE.CapsuleGeometry(0.011, 0.045, 3, 6), HAAR, { umriss: 0.0015 }), x, 0.195, 0.165, 0, 0, Math.PI / 2 + (x > 0 ? -0.06 : 0.06)));
  // Bart und Haare teilen sich dieselben Farben, damit der Übergang (Koteletten, hinter den Ohren, Nacken) nahtlos ist
  function haarTextur(saat, laenge, dichte, hell) {
    return leinwandTextur(128, 128, (g) => {
      g.fillStyle = '#34200f'; g.fillRect(0, 0, 128, 128);
      const r = zufallsFolge(saat);
      g.lineCap = 'round';
      for (let i = 0; i < dichte; i++) {
        const px = r() * 128, py = r() * 128;
        const t = r();
        g.strokeStyle = t < 0.5 ? `rgba(84,54,30,${hell})` : t < 0.58 ? `rgba(120,80,46,${hell * 0.6})` : 'rgba(22,12,6,0.7)';
        g.lineWidth = 0.9 + r() * 0.8;
        g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + (r() - 0.5) * laenge * 0.5, py + laenge * 0.5, px + (r() - 0.5) * laenge * 0.5, py + laenge * (0.8 + r() * 0.4)); g.stroke();
      }
    }, [2, 2]);
  }
  const haarMat = toon(0xffffff, { map: haarTextur(21, 6, 700, 0.45) });
  const bartMat = toon(0xffffff, { map: haarTextur(12, 14, 650, 0.7) });
  // kurze Haare: ganzer Hinterkopf bis in den Nacken, an den Seiten über und hinter den Ohren,
  // vorne von der Cap verdeckt; vor den Ohren gehen sie in die Koteletten über
  const haarGeo = zuschnitt(new THREE.SphereGeometry(0.176, 36, 26, 0, Math.PI * 2, Math.PI * 0.12, Math.PI * 0.7), (x, y, z) => z < 0.02 || (Math.abs(x) > 0.15 && y > -0.02 && z < 0.09));
  const haar = teil(haarGeo, 0, { material: haarMat, umriss: 0.003 });
  haar.scale.set(1.08, 1.05, 1.03);
  haar.position.y = 0.12;
  kopf.add(haar);
  // Vollbart (wie auf den Fotos: lang, voll, mittelbraun bis dunkel): Schale über Kiefer und Wangen mit klarer,
  // schräger Wangenlinie; vor den Ohren hoch bis zu den Haaren, unter den Ohren nach hinten bis in die Nackenhaare
  const bartGeo = zuschnitt(new THREE.SphereGeometry(0.168, 36, 26, 0, Math.PI * 2, Math.PI * 0.36, Math.PI * 0.6), (x, y, z) => {
    if (z < -0.06) return false;                       // hinten übernehmen die Nackenhaare
    if (z < 0.0 && y > -0.06) return false;            // Ohren bleiben frei
    const vorne = Math.max(0, z) / 0.168;              // 0 an den Seiten, 1 vorne
    return y < 0.06 - vorne * 0.1;                     // Wangenlinie: an den Seiten hoch, vorne bis unter die Nase
  });
  const bart = teil(bartGeo, 0, { material: bartMat, umriss: 0.004 });
  bart.scale.set(1.12, 1.08, 1.12);
  bart.position.set(0, 0.12, 0.012);
  kopf.add(bart);
  // volles Kinn (Bart hängt gut 10 cm unters Kinn)
  const kinnBart = teil(new THREE.SphereGeometry(0.12, 18, 14), 0, { material: bartMat, umriss: 0.004 });
  kinnBart.scale.set(1.12, 1.05, 0.9);
  kinnBart.position.set(0, -0.03, 0.07);
  kopf.add(kinnBart);
  const kinnSpitze = teil(new THREE.SphereGeometry(0.08, 14, 10), 0, { material: bartMat, umriss: 0.004 });
  kinnSpitze.scale.set(1.05, 1.4, 0.8);
  kinnSpitze.position.set(0, -0.13, 0.1);
  kopf.add(kinnSpitze);
  // Schnurrbart (dicht, über der Lippe, geht seitlich in den Bart)
  const schnurr = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.07, 0.045, 0.15), new THREE.Vector3(-0.035, 0.075, 0.178), new THREE.Vector3(0, 0.072, 0.185), new THREE.Vector3(0.035, 0.075, 0.178), new THREE.Vector3(0.07, 0.045, 0.15)]);
  kopf.add(teil(new THREE.TubeGeometry(schnurr, 20, 0.019, 8, false), 0, { material: bartMat, umriss: 0.003 }));
  // Unterlippe schaut etwas raus
  const mund = teil(new THREE.CapsuleGeometry(0.008, 0.03, 3, 6), 0xb5605a, { umriss: false });
  mund.rotation.z = Math.PI / 2;
  mund.position.set(0, 0.045, 0.18);
  kopf.add(mund);
  // ein paar abstehende Barthaare an der Kontur (wirkt dicht, aber sauber)
  {
    const geoH = new THREE.IcosahedronGeometry(0.02, 0);
    const lagen = [];
    for (let i = 0; i < 45; i++) {
      const w = (zufall() - 0.5) * Math.PI * 0.7;
      const y = -0.17 + zufall() * 0.13;
      lagen.push([Math.sin(w) * (0.12 + (y + 0.17) * 0.25), y, Math.cos(w) * 0.12 + 0.06]);
    }
    const flusen = new THREE.InstancedMesh(geoH, toon(0x4a2e1a), lagen.length);
    const m = new THREE.Matrix4();
    lagen.forEach(([x, y, zz], i) => {
      m.compose(new THREE.Vector3(x, y, zz), new THREE.Quaternion().setFromEuler(new THREE.Euler(zufall(), zufall(), zufall())), new THREE.Vector3(0.6, 1.3, 0.6).multiplyScalar(0.6 + zufall() * 0.5));
      flusen.setMatrixAt(i, m);
    });
    kopf.add(flusen);
  }
  // Essensreste im Bart (Gruppe etwas vor die Bartoberfläche)
  const essen = new THREE.Group();
  essen.position.set(0, -0.01, 0.03);
  kopf.add(essen);
  // Essensreste im Bart: Brotkrümel, ein Stück Salat, ein Klecks Mayo
  for (let i = 0; i < 9; i++) {
    const kr = quader(0.01 + zufall() * 0.008, 0.008, 0.008, i % 3 ? 0xd9a35a : 0xb07a3a, { umriss: false });
    kr.position.set((zufall() - 0.5) * 0.17, -0.05 + zufall() * 0.1, 0.16 + zufall() * 0.02);
    kr.rotation.set(zufall() * 3, zufall() * 3, zufall() * 3);
    essen.add(kr);
  }
  for (let i = 0; i < 10; i++) {
    const kr = quader(0.006 + zufall() * 0.008, 0.006, 0.007, 0xc98f48, { umriss: false });
    kr.position.set((zufall() - 0.5) * 0.2, -0.12 + zufall() * 0.12, 0.13 + zufall() * 0.03);
    kr.rotation.set(zufall() * 3, zufall() * 3, zufall() * 3);
    essen.add(kr);
  }
  // Salatblatt, Tomatenstück, Käsefetzen, Sesam, Mayo-Kleckse, ein Stück Brotkruste
  essen.add(setze(quader(0.03, 0.004, 0.02, 0x5aa83a, { umriss: 0.001 }), 0.04, -0.03, 0.18, 0.4, 0.3, 0.6));
  essen.add(setze(quader(0.018, 0.012, 0.006, 0xd8352a, { umriss: 0.001 }), -0.06, -0.06, 0.155, 0.2, -0.4, 0.3));
  essen.add(setze(quader(0.022, 0.003, 0.016, 0xf2c94a, { umriss: 0.001 }), 0.02, -0.1, 0.16, 0.5, 0, -0.4));
  for (let i = 0; i < 8; i++) essen.add(setze(kugel(0.003, 0xf4ecd0, { umriss: false }, 4), (zufall() - 0.5) * 0.14, -0.1 + zufall() * 0.12, 0.17 + zufall() * 0.012));
  for (const [x, y] of [[-0.03, 0.01], [0.055, -0.07], [-0.01, -0.12]]) {
    const mayo = kugel(0.008, 0xf6f1d8, { umriss: false }, 6);
    mayo.scale.set(1.3, 0.7, 0.6);
    mayo.position.set(x, y, 0.178);
    essen.add(mayo);
  }
  essen.add(setze(quader(0.03, 0.01, 0.01, 0x8a5a26, { umriss: 0.001 }), -0.08, -0.02, 0.15, 0, -0.6, 0.5));
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
      // im Sitzen: Oberschenkel nach vorn, leicht abfallend, so dass die Unterschenkel senkrecht auf den Boden reichen
      const neigung = sitzt ? Math.asin(THREE.MathUtils.clamp((sitzHoehe - 0.42) / 0.357, 0, 1)) : 0;
      // Beine: laufen, rennen oder sitzen
      const schwung = ziel ? Math.sin(schritt) * (tempo > 2 ? 0.8 : 0.5) : 0;
      for (const [i, b] of beine.entries()) {
        const zielH = sitzt ? -(Math.PI / 2 - neigung) : (i ? -schwung : schwung);
        b.rotation.x += (zielH - b.rotation.x) * Math.min(1, dt * 10);
        const knie = b.children.find((c) => c.position.y === -0.42);
        if (knie) knie.rotation.x = sitzt ? Math.PI / 2 - neigung : Math.max(0, i ? schwung : -schwung) * 0.7;
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
