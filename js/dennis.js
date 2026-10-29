// Dennis als Comic-Figur in der Werkstatt: steht in der Kaffeeecke, guckt zu, kommt rüber.
import * as THREE from 'three';
import { wegNach, ausweichen } from './wege.js';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, umriss } from './toon.js';

const HAUT = 0xefc3a6;
const HAUT_WUT = 0xe5503a;
const JACKE = 0x232528;
const HOSE = 0x2a2b30;
const HOODIE = 0x6d7177;
const HAAR = [0xd9b273, 0xc99d5f, 0xe6c48a, 0xbb8d52];
const GOLD = 0xd7b25c;
const RUCKSACK = 0x2b63c6;
const HEIM = new THREE.Vector3(-3.55, 0, 2.55);
// Wo Dennis zwischendurch rumsteht (abseits der Stationen, nicht im Weg)
const PLAETZE = [[-3.55, 2.55], [-2.1, 2.3], [1.8, 2.2], [-1.7, -1.8], [1.6, -0.3]];

export function baueDennis(scene) {
  const wurzel = new THREE.Group();
  wurzel.position.copy(HEIM);
  const platz = HEIM.clone();
  wurzel.scale.setScalar(0.93);
  scene.add(wurzel);
  const zufall = (() => { let s = 7; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();

  // Körper-Gruppe (für Hinlegen und Tanzen), darin Becken, Beine mit Knien, Oberkörper
  const koerper = new THREE.Group();
  wurzel.add(koerper);
  // Becken mit Gürtel verbindet Beine und Oberkörper
  const becken = teil(new THREE.CapsuleGeometry(0.12, 0.1, 6, 12), HOSE);
  becken.rotation.z = Math.PI / 2;
  becken.scale.set(1, 1, 0.75);
  becken.position.y = 0.9;
  koerper.add(becken);
  const guertel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 20, 1, true), toon(0x1a1a1a));
  guertel.scale.set(1, 1, 0.78);
  guertel.position.y = 0.05;
  const guertelSchnalle = setze(quader(0.045, 0.035, 0.012, 0x9aa0a6, { umriss: false }), 0, 0.05, 0.158);

  // Beine: kräftige Oberschenkel in kurzer schwarzer Arbeitshose, nackte dicke Waden mit Tattoos
  // (links Kiwi, rechts Penis, Betreiber-Wunsch), kurze graue Socken, Arbeitsschuhe
  function wadenTattoo(art) {
    return leinwandTextur(512, 256, (g, b, h) => {
      g.fillStyle = '#efc3a6'; g.fillRect(0, 0, b, h);
      // ein paar blonde Härchen
      g.strokeStyle = 'rgba(160, 110, 60, 0.35)'; g.lineWidth = 1.5;
      for (let i = 0; i < 160; i++) {
        const x = (i * 97) % b, y = 30 + ((i * 53) % (h - 50));
        g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y - 6); g.stroke();
      }
      // Tattoo auf der Wadenrückseite (u = 0,5), leicht nach außen gedreht
      g.save();
      g.translate(b * 0.5, h * 0.42);
      g.scale(1.4, 1.4);
      g.lineJoin = 'round'; g.lineCap = 'round';
      if (art === 'kiwi') {
        // halbe Kiwi: braune Schale, grünes Fruchtfleisch, helles Herz, schwarze Kerne
        g.fillStyle = '#7a5530'; g.beginPath(); g.ellipse(0, 0, 48, 40, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#6fbf3a'; g.beginPath(); g.ellipse(0, 0, 41, 33, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#f2f0c8'; g.beginPath(); g.ellipse(0, 0, 13, 10, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#111';
        for (let i = 0; i < 18; i++) {
          const w = (i / 18) * Math.PI * 2;
          g.beginPath(); g.ellipse(Math.cos(w) * 20, Math.sin(w) * 16, 3, 1.6, w, 0, Math.PI * 2); g.fill();
        }
        g.strokeStyle = '#4d7f26'; g.lineWidth = 1.5;
        for (let i = 0; i < 24; i++) { const w = (i / 24) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(w) * 14, Math.sin(w) * 11); g.lineTo(Math.cos(w) * 38, Math.sin(w) * 30); g.stroke(); }
        g.strokeStyle = '#111'; g.lineWidth = 4;
        g.beginPath(); g.ellipse(0, 0, 48, 40, 0, 0, Math.PI * 2); g.stroke();
        // kleines Blatt oben
        g.fillStyle = '#3f8f2a'; g.beginPath(); g.ellipse(26, -44, 14, 6, -0.6, 0, Math.PI * 2); g.fill(); g.lineWidth = 3; g.stroke();
      } else {
        // Comic-Penis als Tattoo (Strichzeichnung mit Hautton und Herzchen)
        g.rotate(-0.35);
        g.fillStyle = '#e8a58c'; g.strokeStyle = '#111'; g.lineWidth = 4;
        g.beginPath(); g.ellipse(-26, 22, 17, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        g.beginPath(); g.ellipse(4, 26, 17, 15, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        g.beginPath();
        g.moveTo(-26, 12); g.lineTo(-24, -42); g.quadraticCurveTo(-11, -50, 2, -42); g.lineTo(2, 12); g.closePath();
        g.fill(); g.stroke();
        g.fillStyle = '#d9788f';
        g.beginPath(); g.ellipse(-11, -48, 17, 12, 0, Math.PI, Math.PI * 2); g.lineTo(6, -46); g.lineTo(-28, -46); g.fill(); g.stroke();
        g.beginPath(); g.moveTo(-11, -58); g.lineTo(-11, -52); g.stroke();
        g.fillStyle = '#c8352a';
        for (const [x, y, s] of [[30, -30, 1], [40, -8, 0.7]]) {
          g.beginPath(); g.moveTo(x, y + 6 * s); g.bezierCurveTo(x - 12 * s, y - 4 * s, x - 4 * s, y - 12 * s, x, y - 4 * s);
          g.bezierCurveTo(x + 4 * s, y - 12 * s, x + 12 * s, y - 4 * s, x, y + 6 * s); g.fill();
        }
      }
      g.restore();
    });
  }
  // Wade als Drehkörper: unten schmal (Knöchel), oben dicker Wadenmuskel
  const wadenProfil = [[0.054, -0.41], [0.06, -0.36], [0.078, -0.28], [0.104, -0.18], [0.112, -0.11], [0.104, -0.05], [0.088, 0.0]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  const beine = [];
  const knie = [];
  for (const x of [-0.1, 0.1]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.88, 0);
    // dicke Oberschenkel in der kurzen Hose, Hosenbein endet über dem Knie
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.098, 0.2, 4, 12), HOSE), 0, -0.16, 0));
    huefte.add(setze(teil(new THREE.CylinderGeometry(0.106, 0.112, 0.07, 14, 1, true), HOSE, { mat: { side: THREE.DoubleSide } }), 0, -0.31, 0));
    huefte.add(setze(zylinder(0.113, 0.113, 0.012, 0x1a1b1f, { umriss: false }, 14), 0, -0.345, 0));
    // Beintasche außen
    huefte.add(setze(quader(0.02, 0.1, 0.09, 0x34363c, { umriss: 0.003 }), x > 0 ? 0.1 : -0.1, -0.2, 0));
    // nackter Oberschenkel-Rest zwischen Hosenbein und Knie
    huefte.add(setze(teil(new THREE.CylinderGeometry(0.09, 0.1, 0.08, 14), HAUT), 0, -0.375, 0));
    const k = new THREE.Group();
    k.position.y = -0.42;
    k.add(teil(new THREE.SphereGeometry(0.09, 14, 10), HAUT));
    const wadeMat = toon(0xffffff, { map: wadenTattoo(x < 0 ? 'kiwi' : 'penis') });
    const wade = teil(new THREE.LatheGeometry(wadenProfil, 24), 0, { material: wadeMat });
    // Tattoo leicht nach außen drehen, damit man es auch von der Seite sieht
    wade.rotation.y = x < 0 ? 0.45 : -0.45;
    k.add(wade);
    // kurze graue Socke mit Bündchen
    k.add(setze(zylinder(0.06, 0.058, 0.07, 0x8d9096, { umriss: 0.003 }, 14), 0, -0.375, 0));
    k.add(setze(zylinder(0.062, 0.062, 0.014, 0x6f7278, { umriss: false }, 14), 0, -0.343, 0));
    // Arbeitsschuh mit Sohle und runder Kappe
    const schuh = new THREE.Group();
    schuh.position.y = -0.42;
    schuh.add(setze(quader(0.12, 0.08, 0.22, 0x4a4038), 0, 0, 0.03));
    schuh.add(setze(kugel(0.06, 0x4a4038, {}, 12), 0, -0.01, 0.13));
    // Sohle rund statt eckiger Platte
    const sohle = teil(new THREE.CapsuleGeometry(0.06, 0.16, 4, 12), 0x2a2622, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2;
    sohle.scale.set(1, 1, 0.28);
    sohle.position.set(0, -0.05, 0.06);
    schuh.add(sohle);
    k.add(schuh);
    huefte.add(k);
    koerper.add(huefte);
    beine.push(huefte);
    knie.push(k);
  }

  // Oberkörper: schwarze Arbeitsjacke mit Reflexstreifen, graue Kapuze
  const rumpf = new THREE.Group();
  rumpf.position.y = 0.9;
  koerper.add(rumpf);
  // Gürtel hängt am Oberkörper, damit er beim Tanzen mitgeht
  rumpf.add(guertel);
  rumpf.add(guertelSchnalle);
  // Schultern füllen (keine Lücke unter dem Hals)
  const schultern = teil(new THREE.SphereGeometry(0.2, 16, 10), JACKE);
  schultern.scale.set(1.35, 0.5, 0.78);
  schultern.position.y = 0.72;
  rumpf.add(schultern);
  const jacke = teil(new THREE.CapsuleGeometry(0.2, 0.42, 6, 14), JACKE);
  jacke.position.y = 0.38;
  jacke.scale.set(1, 1, 0.74);
  rumpf.add(jacke);
  const reflexMat = new THREE.MeshBasicMaterial({ color: 0xd4d8dc });
  for (const y of [0.3, 0.5]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.203, 0.203, 0.022, 22, 1, true), reflexMat);
    band.position.y = y;
    band.scale.set(1, 1, 0.74);
    rumpf.add(band);
  }
  // Reißverschluss
  rumpf.add(setze(quader(0.012, 0.5, 0.01, 0x55585e, { umriss: false }), 0, 0.4, 0.15));
  // Jackenkragen (zwei Laschen) und darunter der graue Hoodie
  for (const seite of [-1, 1]) {
    rumpf.add(setze(quader(0.09, 0.08, 0.02, JACKE, { umriss: 0.004 }), 0.06 * seite, 0.8, 0.1, -0.25, 0.5 * seite, 0.35 * seite));
  }
  rumpf.add(setze(quader(0.07, 0.07, 0.02, HOODIE, { umriss: 0.003 }), 0, 0.76, 0.135, -0.15, 0, 0));
  // Reißverschluss-Zipper und Brusttasche
  rumpf.add(setze(quader(0.02, 0.035, 0.01, 0x8a8f96, { umriss: false }), 0, 0.72, 0.158));
  rumpf.add(setze(quader(0.1, 0.09, 0.015, 0x2b2d31, { umriss: 0.003 }), -0.085, 0.58, 0.148, 0, -0.25, 0));
  rumpf.add(setze(quader(0.105, 0.03, 0.02, 0x2b2d31, { umriss: 0.003 }), -0.085, 0.625, 0.152, 0, -0.25, 0));
  // Namensschild
  const schildTex = leinwandTextur(128, 40, (g, b, h) => {
    g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#111'; g.font = 'bold 28px Bangers, Impact, sans-serif'; g.textAlign = 'center';
    g.fillText('DENNIS', b / 2, 31);
  });
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.038), new THREE.MeshBasicMaterial({ map: schildTex }));
  schild.position.set(0.085, 0.6, 0.152);
  schild.rotation.y = 0.3;
  rumpf.add(schild);

  // Der blaue Rucksack (immer dabei): Korpus, Fronttasche, Seitentasche, Reißverschlüsse, Gurte
  const rucksack = new THREE.Group();
  const korpus = teil(new THREE.CapsuleGeometry(0.15, 0.22, 8, 16), RUCKSACK);
  korpus.scale.set(1.1, 1, 0.58);
  rucksack.add(korpus);
  const boden = teil(new THREE.CapsuleGeometry(0.13, 0.02, 6, 14), 0x1d3f86, { umriss: 0.004 });
  boden.scale.set(1.2, 0.6, 0.62);
  boden.position.y = -0.2;
  rucksack.add(boden);
  const tasche = teil(new THREE.CapsuleGeometry(0.11, 0.08, 8, 14), 0x5a8fe2);
  tasche.scale.set(1.05, 1, 0.42);
  tasche.position.set(0, -0.07, -0.075);
  rucksack.add(tasche);
  const zipMat = new THREE.MeshBasicMaterial({ color: 0xf2f4f7 });
  const zip1 = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.005, 4, 28, Math.PI), zipMat);
  zip1.position.set(0, 0.06, -0.088);
  rucksack.add(zip1);
  const zip2 = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.005, 4, 24, Math.PI), zipMat);
  zip2.position.set(0, -0.04, -0.12);
  rucksack.add(zip2);
  // Zipper-Anhänger
  for (const [x, y, z] of [[0.13, 0.03, -0.09], [-0.13, 0.03, -0.09], [0.095, -0.07, -0.122]]) {
    rucksack.add(setze(quader(0.014, 0.04, 0.008, 0x111111, { umriss: false }), x, y - 0.02, z));
  }
  // Logo-Feld (ohne Markennamen)
  rucksack.add(setze(quader(0.06, 0.022, 0.006, 0xffffff, { umriss: false }), 0.05, -0.15, -0.122));
  rucksack.add(setze(quader(0.016, 0.012, 0.007, RUCKSACK, { umriss: false }), 0.035, -0.15, -0.123));
  // Seitentasche mit Netz
  for (const seite of [-1, 1]) {
    const seiten = teil(new THREE.CapsuleGeometry(0.045, 0.08, 4, 10), 0x1d3f86, { umriss: 0.004 });
    seiten.scale.set(0.6, 1, 1);
    seiten.position.set(0.165 * seite, -0.1, 0);
    rucksack.add(seiten);
  }
  // Tragegriff oben
  rucksack.add(setze(teil(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), 0x1d3f86), 0, 0.27, 0));
  rucksack.position.set(0, 0.42, -0.23);
  rumpf.add(rucksack);
  // Schultergurte über die Schulter nach vorn, mit Brustgurt (flache Bänder)
  const gurtMat = toon(0x1d3f86);
  function band(punkte, breite) {
    const kurve = new THREE.CatmullRomCurve3(punkte.map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(kurve, 20, 1, 4);
    // Rohr flachdrücken: Querschnitt breit in x, dünn in Normalenrichtung
    const pos = geo.attributes.position;
    const mitte = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      const t = Math.floor(i / 5) / 20;
      kurve.getPointAt(Math.min(1, t), mitte);
      const dx = pos.getX(i) - mitte.x, dy = pos.getY(i) - mitte.y, dz = pos.getZ(i) - mitte.z;
      pos.setXYZ(i, mitte.x + dx * breite, mitte.y + dy * 0.008, mitte.z + dz * 0.008);
    }
    geo.computeVertexNormals();
    return teil(geo, 0, { material: gurtMat, umriss: 0.003 });
  }
  for (const seite of [-1, 1]) {
    const x = 0.1 * seite;
    rumpf.add(band([[x, 0.52, -0.17], [x, 0.74, -0.15], [x * 1.05, 0.835, -0.03], [x * 1.08, 0.8, 0.1], [x * 1.12, 0.66, 0.158], [x * 1.15, 0.42, 0.165]], 0.026));
    rumpf.add(setze(quader(0.045, 0.03, 0.012, 0x111111, { umriss: false }), x * 1.15, 0.41, 0.168));
  }
  rumpf.add(setze(quader(0.2, 0.014, 0.008, 0x1d3f86, { umriss: 0.003 }), 0, 0.52, 0.166));
  rumpf.add(setze(quader(0.035, 0.026, 0.012, 0x111111, { umriss: false }), 0, 0.52, 0.17));

  // Arme mit Ellbogen und Händen mit Fingern
  function arm(seite) {
    const schulter = new THREE.Group();
    schulter.position.set(0.27 * seite, 0.7, 0);
    schulter.add(kugel(0.068, JACKE, { umriss: 0.004 }, 10));
    schulter.add(setze(teil(new THREE.CapsuleGeometry(0.062, 0.2, 4, 10), JACKE), 0, -0.13, 0));
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.02, 12, 1, true), reflexMat);
    ring.position.y = -0.12;
    schulter.add(ring);
    const ellbogen = new THREE.Group();
    ellbogen.position.y = -0.26;
    ellbogen.add(kugel(0.058, JACKE, { umriss: 0.004 }, 10));
    ellbogen.add(setze(teil(new THREE.CapsuleGeometry(0.056, 0.18, 4, 10), JACKE), 0, -0.12, 0));
    const hand = new THREE.Group();
    // Ärmelbündchen
    hand.add(setze(zylinder(0.06, 0.06, 0.03, 0x1a1b1e, { umriss: 0.003 }, 12), 0, 0.045, 0));
    const handflaeche = teil(new THREE.CapsuleGeometry(0.038, 0.03, 4, 10), HAUT);
    handflaeche.scale.set(1.15, 1, 0.65);
    hand.add(handflaeche);
    for (let f = 0; f < 4; f++) {
      const finger = teil(new THREE.CapsuleGeometry(0.0115, 0.035, 4, 6), HAUT, { umriss: 0.002 });
      finger.position.set((-0.027 + f * 0.018) * seite, -0.05 + Math.abs(f - 1.5) * 0.005, 0.006);
      finger.rotation.x = 0.25;
      hand.add(finger);
    }
    const daumen = teil(new THREE.CapsuleGeometry(0.013, 0.03, 4, 8), HAUT, { umriss: 0.002 });
    daumen.position.set(0.038 * seite, -0.01, 0.022);
    daumen.rotation.set(0.4, 0, -0.6 * seite);
    hand.add(daumen);
    hand.position.y = -0.27;
    ellbogen.add(hand);
    schulter.add(ellbogen);
    rumpf.add(schulter);
    return { schulter, ellbogen, hand };
  }
  const links = arm(-1);
  const rechts = arm(1);
  // Armbanduhr am linken Handgelenk (für den Blick auf die Uhr vor der Mittagspause)
  const uhr = new THREE.Group();
  uhr.add(zylinder(0.047, 0.047, 0.03, 0x1d1d1f, { umriss: false }, 12));
  uhr.add(setze(zylinder(0.022, 0.022, 0.012, 0xc9cdd2, { umriss: 0.001 }, 12), 0, 0, 0.045, Math.PI / 2, 0, 0));
  uhr.position.set(0, -0.02, 0);
  links.hand.add(uhr);
  links.schulter.rotation.z = -0.1;
  rechts.schulter.rotation.z = 0.1;

  // Kaffeebecher in der rechten Hand
  const becher = new THREE.Group();
  becher.add(zylinder(0.045, 0.04, 0.1, 0xf4f0e6, {}, 14));
  becher.add(setze(teil(new THREE.TorusGeometry(0.026, 0.008, 6, 12), 0xf4f0e6), 0.05, 0, 0));
  becher.position.set(0, -0.3, 0.07);
  rechts.ellbogen.add(becher);
  const becherQ = new THREE.Quaternion();

  // Handy fürs Telefonieren (linke Hand am Ohr)
  const telefonHandy = new THREE.Group();
  telefonHandy.add(quader(0.07, 0.14, 0.012, 0x1d1d1f, { umriss: 0.002 }));
  telefonHandy.add(setze(quader(0.06, 0.12, 0.002, 0x3a6fb0, { umriss: false }), 0, 0, 0.007));
  telefonHandy.position.set(0.01, -0.06, 0.035);
  telefonHandy.rotation.set(0.2, 0, 0.1);
  telefonHandy.visible = false;
  links.hand.add(telefonHandy);
  let telefoniert = false;
  let geste = null;
  let getragen = null;
  const TELEFON = { s: [-2.0, -0.47, 0.3], e: [-1.82, 0, 0.8] }; // per Suche bestimmt: Handy am linken Ohr

  // Hula-Hoop-Reifen (nur beim Hula-Hoop sichtbar), kreist um die Hüfte
  const reifen = new THREE.Group();
  reifen.add(teil(new THREE.TorusGeometry(0.45, 0.016, 8, 48), 0xe84a9a, { umriss: 0.004 }));
  for (let i = 0; i < 8; i++) {
    const st = teil(new THREE.TorusGeometry(0.45, 0.0175, 8, 6, 0.12), 0xffffff, { umriss: false });
    st.rotation.z = (i / 8) * Math.PI * 2;
    reifen.add(st);
  }
  reifen.visible = false;
  wurzel.add(reifen);

  // Brotdose mit Tomate (für die Mittagspause), steht sonst auf dem Kaffeetisch
  const dose = new THREE.Group();
  dose.add(teil(new THREE.BoxGeometry(0.2, 0.07, 0.14), 0, { material: toon(0xf0f4f6, { transparent: true, opacity: 0.6 }), umriss: 0.004 }));
  dose.add(setze(teil(new THREE.TorusGeometry(0.06, 0.016, 6, 12, 2.2), 0xf2d23c, { umriss: 0.002 }), -0.03, -0.01, 0, Math.PI / 2, 0, 0.5));
  dose.position.set(0.02, -0.33, 0.12);
  dose.rotation.set(1.2, 0, 0);
  dose.visible = false;
  links.ellbogen.add(dose);
  const tomate = kugel(0.035, 0xd8352a, { umriss: 0.003 }, 12);
  tomate.add(setze(quader(0.02, 0.008, 0.02, 0x2f7d4f, { umriss: false }), 0, 0.035, 0));
  tomate.position.set(0, -0.32, 0.06);
  tomate.visible = false;
  rechts.ellbogen.add(tomate);

  // Besen zum Fegen (vor dem Körper, schwingt beim Fegen hin und her)
  const besenInHand = new THREE.Group();
  const besenDreh = new THREE.Group();
  besenDreh.add(setze(zylinder(0.014, 0.014, 1.3, 0xb27a42, {}, 8), 0, 0, 0));
  besenDreh.add(setze(quader(0.32, 0.06, 0.07, 0x7a4f2a), 0, -0.65, 0));
  besenDreh.add(setze(quader(0.3, 0.07, 0.06, 0x2a2a2a, { umriss: false }), 0, -0.71, 0));
  besenDreh.rotation.x = 0.45;
  besenDreh.position.set(0, 0.0, 0.32);
  besenInHand.add(besenDreh);
  besenInHand.position.y = 0.4;
  besenInHand.visible = false;
  rumpf.add(besenInHand);

  // Feuerlöscher in der Hand (wenn er löscht)
  const loescherHand = new THREE.Group();
  loescherHand.add(setze(zylinder(0.07, 0.07, 0.4, 0xc8352a, {}, 14), 0, -0.2, 0.05));
  loescherHand.add(setze(zylinder(0.012, 0.012, 0.2, 0x1d1d1f, {}, 6), 0.05, -0.05, 0.15, 1.2, 0, 0));
  loescherHand.visible = false;
  rechts.ellbogen.add(loescherHand);
  loescherHand.position.y = -0.3;

  // Kopf: schmal, Schnauzer, goldene Pilotenbrille, Locken
  const kopf = new THREE.Group();
  kopf.position.y = 0.98;
  rumpf.add(kopf);
  rumpf.add(setze(zylinder(0.055, 0.06, 0.12, HAUT, { umriss: 0.004 }), 0, 0.9, 0.0));
  const hautMats = [];
  function haut(geo, opt = {}) {
    const m = toon(HAUT);
    hautMats.push(m);
    return teil(geo, 0, { material: m, ...opt });
  }
  const schaedel = haut(new THREE.SphereGeometry(0.16, 22, 18));
  schaedel.scale.set(0.92, 1.16, 0.96);
  schaedel.position.y = 0.12;
  kopf.add(schaedel);
  // Kinn etwas nach vorn
  const kinn = haut(new THREE.SphereGeometry(0.07, 12, 10), { umriss: false });
  kinn.position.set(0, -0.0, 0.08);
  kinn.scale.set(1, 0.8, 1);
  kopf.add(kinn);
  kopf.add(setze(haut(new THREE.SphereGeometry(0.038, 10, 8)), -0.148, 0.11, -0.01));
  kopf.add(setze(haut(new THREE.SphereGeometry(0.038, 10, 8)), 0.148, 0.11, -0.01));
  const nase = haut(new THREE.SphereGeometry(0.03, 12, 10));
  nase.position.set(0, 0.105, 0.158);
  nase.scale.set(0.8, 1.15, 1.0);
  kopf.add(nase);
  // Augen
  const augen = [];
  for (const x of [-0.058, 0.058]) {
    const a = new THREE.Group();
    a.add(kugel(0.022, 0xffffff, { umriss: 0.003 }, 10));
    const pupille = kugel(0.012, 0x2f5f86, { umriss: false }, 8);
    pupille.position.z = 0.016;
    a.add(pupille);
    a.position.set(x, 0.155, 0.128);
    kopf.add(a);
    augen.push(a);
  }
  const brauen = [];
  for (const x of [-0.062, 0.062]) {
    const b = quader(0.064, 0.019, 0.024, 0xa87038, { umriss: false });
    b.position.set(x, 0.205, 0.145);
    kopf.add(b);
    brauen.push(b);
  }
  const mund = quader(0.05, 0.014, 0.02, 0x5a1a14, { umriss: false });
  mund.position.set(0, 0.035, 0.158);
  kopf.add(mund);
  // Schnauzer (Hufeisen)
  const schnauzer = teil(new THREE.TorusGeometry(0.048, 0.02, 8, 18, Math.PI), 0xc9904f, { umriss: 0.004 });
  schnauzer.position.set(0, 0.032, 0.15);
  schnauzer.scale.set(1.1, 0.95, 0.8);
  kopf.add(schnauzer);
  // Dreitagebart am Kinn
  const stoppeln = kugel(0.072, 0xd9a48a, { umriss: false }, 12);
  stoppeln.position.set(0, 0.0, 0.085);
  stoppeln.scale.set(1.02, 0.78, 1.0);
  kopf.add(stoppeln);
  // Goldene Pilotenbrille
  const brille = new THREE.Group();
  const goldMat = toon(GOLD);
  for (const x of [-0.058, 0.058]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.004, 5, 24), goldMat);
    ring.position.set(x, 0, 0);
    ring.scale.set(1.12, 0.92, 1);
    brille.add(ring);
    const glas = new THREE.Mesh(new THREE.CircleGeometry(0.038, 20), new THREE.MeshBasicMaterial({ color: 0xdff1ff, transparent: true, opacity: 0.25 }));
    glas.position.set(x, 0, -0.002);
    glas.scale.set(1.12, 0.92, 1);
    brille.add(glas);
    const buegel = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.15), goldMat);
    buegel.position.set(x * 1.75, 0.01, -0.075);
    brille.add(buegel);
  }
  for (const y of [0.012, 0.03]) {
    const steg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 0.004), goldMat);
    steg.position.y = y;
    brille.add(steg);
  }
  brille.position.set(0, 0.155, 0.158);
  kopf.add(brille);
  // Locken: viele kleine Kugeln, oben und hinten voluminös, Stirn frei
  const kugelGeo = new THREE.IcosahedronGeometry(1, 1);
  const lage = [];
  for (let i = 0; i < 600 && lage.length < 230; i++) {
    const t = zufall() * Math.PI * 2;
    const y = -0.35 + zufall() * 1.35;
    const r = Math.sqrt(Math.max(0, 1 - Math.min(1, y) ** 2));
    const d = new THREE.Vector3(Math.cos(t) * r, Math.min(1, y), Math.sin(t) * r).normalize();
    if (d.z > 0.35 && d.y < 0.62) continue;            // Gesicht und Stirn frei
    if (d.y < 0.05 && d.z > -0.2) continue;            // an den Seiten kurz
    if (d.y < -0.3) continue;
    const groesse = 0.022 + zufall() * 0.02;
    const abstand = 0.16 + (d.y > 0.4 ? 0.04 : 0.005) + zufall() * 0.045;
    lage.push([d.x * abstand * 0.95, 0.15 + d.y * abstand * 1.1, d.z * abstand, groesse]);
  }
  const haarMat = toon(0xffffff);
  const locken = new THREE.InstancedMesh(kugelGeo, haarMat, lage.length);
  const umrissLocken = new THREE.InstancedMesh(kugelGeo, undefined, lage.length);
  const m4 = new THREE.Matrix4();
  const farbe = new THREE.Color();
  lage.forEach(([x, y, z, g], i) => {
    m4.makeScale(g, g, g).setPosition(x, y, z);
    locken.setMatrixAt(i, m4);
    locken.setColorAt(i, farbe.setHex(HAAR[i % HAAR.length]));
    m4.makeScale(g * 1.18, g * 1.18, g * 1.18).setPosition(x, y, z);
    umrissLocken.setMatrixAt(i, m4);
  });
  locken.castShadow = true;
  umriss(locken, 0);
  const lockenUmriss = locken.children[0];
  locken.remove(lockenUmriss);
  umrissLocken.material = lockenUmriss.material;
  umrissLocken.raycast = () => {};
  kopf.add(umrissLocken);
  kopf.add(locken);
  // Schlaf-Zeichen (Z Z Z), steigen über dem Kopf auf
  const zTex = leinwandTextur(64, 64, (g) => {
    g.clearRect(0, 0, 64, 64);
    g.font = '400 56px Bangers, Impact, sans-serif';
    g.textAlign = 'center';
    g.lineWidth = 6;
    g.strokeStyle = '#111';
    g.strokeText('Z', 32, 54);
    g.fillStyle = '#ffffff';
    g.fillText('Z', 32, 54);
  });
  const zzz = [0, 1, 2].map(() => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthTest: false }));
    sp.visible = false;
    sp.renderOrder = 10;
    scene.add(sp);
    return sp;
  });

  // ---------- Verhalten ----------
  let blickZiel = null;
  let ziel = null;
  let zielAufloesen = null;
  let weg = []; // restliche Wegpunkte (um Wände herum, durch Türen)
  let tempo = 1.3;
  let stimmung = 'ruhig';
  let modus = 'normal'; // normal | tanzen | liegen
  let takt = null; // Funktion -> Beat-Position (Zahl) oder null
  let zeit = Math.random() * 10;
  let schluckTimer = 4;
  let schluck = 0;
  let schrittPhase = 0;
  let blinzeln = 2 + Math.random() * 3;
  let liegenAnteil = 0;
  let aufSofa = false;
  const SOFA_OBEN = 0.55; // Oberkörper hoch (rad)
  const SOFA_BEINE = 0.3; // Beine hoch (rad)
  const SOFA_HUEFTE = 0.52; // Höhe Hüftgelenk über dem Boden
  let sitzAnteil = 0;
  let essen = false;
  const hautFarbe = new THREE.Color(HAUT);
  const zielFarbe = new THREE.Color(HAUT);

  function winkelDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }
  const naeher = (ist, soll, k) => ist + (soll - ist) * k;

  const api = {
    wurzel,
    get position() { return wurzel.position; },
    get modus() { return modus; },
    kopfPosition() {
      const v = new THREE.Vector3();
      kopf.getWorldPosition(v);
      v.y += 0.12;
      return v;
    },
    schaue(ziel) { blickZiel = ziel; },
    stimmung(s) {
      stimmung = s;
      zielFarbe.setHex(s === 'wut' ? HAUT_WUT : s === 'sauer' ? 0xe8907a : HAUT);
    },
    // normal | tanzen | liegen; beimTanzen: Funktion, die die aktuelle Beat-Position liefert
    setzeModus(m, beat) {
      modus = m;
      if (beat !== undefined) takt = beat;
    },
    sichtbar(an) { wurzel.visible = an; },
    // Auf Sofa setzen/legen: Position und Blickrichtung direkt setzen
    platziere(x, y, z, drehung) {
      ziel = null;
      if (zielAufloesen) { const r = zielAufloesen; zielAufloesen = null; r(false); }
      wurzel.position.set(x, y, z);
      wurzel.rotation.y = drehung;
    },
    aufstehen(x, z) {
      modus = 'normal';
      aufSofa = false;
      wurzel.position.y = 0;
      if (x !== undefined) wurzel.position.set(x, 0, z);
      essen = false;
      dose.visible = false;
      tomate.visible = false;
    },
    besen(an) { besenInHand.visible = an; },
    feuerloescher(an) { loescherHand.visible = an; },
    // Auf dem Sofa schlafen: eingeknickte Haltung (Wurzel auf den Hintern setzen)
    sofa(an) { aufSofa = an; },
    telefon(an) { telefoniert = an; telefonHandy.visible = an; },
    // irgendein Ding in der linken Hand tragen (z. B. die Wäschetasche), null = loslassen
    trage(obj) {
      if (getragen && getragen.parent === links.hand) getragen.removeFromParent();
      getragen = obj;
      if (obj) { links.hand.add(obj); obj.position.set(0, -0.28, 0.06); obj.rotation.set(0, Math.PI / 2, 0); obj.scale.setScalar(1); obj.visible = true; }
    },
    // kurze Gesten als Vorzeichen: 'gaehnen' (Arme hoch, Mund weit auf), 'huefte' (Hand reibt hinten links die Hüfte), 'uhr'
    geste(name, dauer = 3) { geste = { name, start: zeit, dauer }; },
    get aktuelleGeste() { return geste && zeit - geste.start < geste.dauer ? geste.name : null; },
    get telefoniert() { return telefoniert; },
    _test: { links, kopf, TELEFON, telefonHandy },
    mittagspause(an) { dose.visible = an; tomate.visible = an; essen = an; },
    // Löst mit true auf, wenn er ankommt, mit false, wenn ein neues Ziel dazwischenkommt
    gehZu(x, z, schnell = 1.3) {
      if (zielAufloesen) zielAufloesen(false);
      tempo = schnell;
      weg = wegNach(wurzel.position, { x, z });
      const p = weg.shift();
      ziel = new THREE.Vector3(p.x, 0, p.z);
      return new Promise((res) => { zielAufloesen = res; });
    },
    // Falls das Laufen zu lange dauert (langsames Gerät): direkt hinstellen
    springZu(x, z) {
      wurzel.position.set(x, 0, z);
      ziel = null;
      const r = zielAufloesen;
      zielAufloesen = null;
      if (r) r(true);
    },
    // Zurück an seinen aktuellen Platz, Blick in die Werkstatt
    heim() {
      return api.gehZu(platz.x, platz.z, 1.2).then((da) => {
        if (da) wurzel.rotation.y = Math.atan2(-platz.x, -0.5 - platz.z);
        return da;
      });
    },
    istDaheim() {
      return wurzel.position.distanceTo(platz) < 0.2 && !ziel;
    },
    // Woanders hinstellen (zufälliger anderer Platz)
    neuerPlatz() {
      const frei = PLAETZE.filter(([x, z]) => Math.hypot(x - platz.x, z - platz.z) > 0.5);
      const [x, z] = frei[Math.floor(Math.random() * frei.length)];
      platz.set(x, 0, z);
      return api.heim();
    },
    update(dt) {
      zeit += dt;
      const k = Math.min(1, dt * 8);
      // Blinzeln
      blinzeln -= dt;
      const zu = blinzeln < 0.12 && blinzeln > 0;
      for (const a of augen) a.scale.y = zu || modus === 'schlafen' ? 0.12 : 1;
      rucksack.visible = modus !== 'schlafen';
      if (blinzeln <= 0) blinzeln = 2.5 + Math.random() * 4;

      // Laufen (nicht im Liegen)
      let laeuft = false;
      if (ziel && modus !== 'liegen') {
        const d = new THREE.Vector3().subVectors(ziel, wurzel.position);
        d.y = 0;
        const dist = d.length();
        if (dist < 0.05 && weg.length) {
          const p = weg.shift();
          ziel.set(p.x, 0, p.z);
        } else if (dist < 0.05) {
          ziel = null;
          const r = zielAufloesen;
          zielAufloesen = null;
          if (r) r(true);
        } else {
          laeuft = true;
          const schritt = Math.min(dist, tempo * dt);
          d.normalize();
          ausweichen(wurzel.position, d, dist + (weg.length ? 9 : 0));
          wurzel.position.addScaledVector(d, schritt);
          const soll = Math.atan2(d.x, d.z);
          wurzel.rotation.y += winkelDiff(soll, wurzel.rotation.y) * Math.min(1, dt * 10);
        }
      }

      // Hinlegen: Körper kippt auf den Rücken, Kopf Richtung -z
      const liegt = modus === 'liegen' || modus === 'schlafen';
      liegenAnteil = naeher(liegenAnteil, liegt ? 1 : 0, Math.min(1, dt * 3));
      sitzAnteil = naeher(sitzAnteil, modus === 'sitzen' ? 1 : 0, Math.min(1, dt * 4));
      koerper.rotation.x = -Math.PI / 2 * liegenAnteil;
      koerper.position.set(0, 0.16 * liegenAnteil - 0.32 * sitzAnteil, 0.9 * liegenAnteil);
      // Auf dem Sofa: in der Hüfte eingeknickt, Hintern auf dem Polster (Wurzel = Hintern),
      // Oberkörper schräg hoch zur einen Lehne, Beine schräg hoch zur anderen
      const sofaLiegen = aufSofa && modus === 'schlafen';
      // Hula-Hoop: Hüfte kreist, Reifen läuft mit
      const hula = modus === 'hula';
      reifen.visible = hula;
      if (hula) {
        const w = zeit * 11;
        koerper.position.x += Math.cos(w) * 0.035;
        koerper.position.z += Math.sin(w) * 0.035;
        reifen.position.set(Math.cos(w) * 0.09, 0.98 + Math.sin(w * 0.5) * 0.02, Math.sin(w) * 0.09);
        reifen.rotation.set(Math.PI / 2 + Math.sin(w) * 0.12, 0, Math.cos(w) * 0.12);
      }
      if (sofaLiegen) {
        koerper.rotation.x = -Math.PI / 2 + SOFA_OBEN;
        koerper.position.set(0, SOFA_HUEFTE - 0.88 * Math.sin(SOFA_OBEN), 0.88 * Math.cos(SOFA_OBEN));
      }
      // Schlafen: Z Z Z über dem Kopf
      const kp = api.kopfPosition();
      zzz.forEach((sp, i) => {
        sp.visible = modus === 'schlafen' && wurzel.visible;
        if (!sp.visible) return;
        const t = ((zeit * 0.45 + i / 3) % 1);
        sp.position.set(kp.x + 0.1 + t * 0.25, kp.y + 0.15 + t * 0.55, kp.z + Math.sin(t * 6 + i) * 0.05);
        const g = 0.12 + t * 0.14;
        sp.scale.set(g, g, g);
        sp.material.opacity = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      });

      const beat = modus === 'tanzen' && takt ? takt() : null;
      const tanzt = beat !== null && !laeuft && modus === 'tanzen';

      // Beine
      if (laeuft) {
        schrittPhase += dt * tempo * 6.5;
        const s = Math.sin(schrittPhase);
        beine[0].rotation.x = s * 0.55;
        beine[1].rotation.x = -s * 0.55;
        knie[0].rotation.x = Math.max(0, -s) * 0.7;
        knie[1].rotation.x = Math.max(0, s) * 0.7;
        rumpf.position.y = 0.9 + Math.abs(Math.cos(schrittPhase)) * 0.04;
      } else if (modus === 'sitzen') {
        for (let i = 0; i < 2; i++) {
          beine[i].rotation.x = naeher(beine[i].rotation.x, -1.5, k);
          knie[i].rotation.x = naeher(knie[i].rotation.x, 1.5, k);
        }
        rumpf.position.y = 0.9 + Math.sin(zeit * 1.8) * 0.004;
      } else if (hula) {
        for (let i = 0; i < 2; i++) {
          beine[i].rotation.x = -0.12;
          knie[i].rotation.x = 0.22;
        }
        rumpf.position.y = 0.9;
      } else if (sofaLiegen) {
        for (let i = 0; i < 2; i++) {
          beine[i].rotation.x = -(SOFA_OBEN + SOFA_BEINE);
          knie[i].rotation.x = i ? 0.12 : 0.25;
        }
        rumpf.position.y = 0.9 + Math.sin(zeit * 1.3) * 0.01;
      } else if (modus === 'schlafen') {
        for (let i = 0; i < 2; i++) {
          beine[i].rotation.x = naeher(beine[i].rotation.x, i ? -0.1 : -0.35, k);
          knie[i].rotation.x = naeher(knie[i].rotation.x, i ? 0.15 : 0.6, k);
        }
        rumpf.position.y = 0.9 + Math.sin(zeit * 1.3) * 0.01;
      } else if (modus === 'liegen') {
        // linkes Knie angewinkelt, Hand an der Hüfte
        beine[0].rotation.x = naeher(beine[0].rotation.x, -0.9, k);
        knie[0].rotation.x = naeher(knie[0].rotation.x, 1.5, k);
        beine[1].rotation.x = naeher(beine[1].rotation.x, -0.15, k);
        knie[1].rotation.x = naeher(knie[1].rotation.x, 0.25, k);
        rumpf.position.y = 0.9 + Math.sin(zeit * 6) * 0.004;
      } else if (tanzt) {
        const p = (beat % 1);
        const auf = Math.pow(Math.abs(Math.cos(p * Math.PI)), 3);
        const seite = Math.floor(beat) % 2 ? 1 : -1;
        beine[0].rotation.x = -0.2 - (seite < 0 ? 0.3 : 0) * auf;
        beine[1].rotation.x = -0.2 - (seite > 0 ? 0.3 : 0) * auf;
        knie[0].rotation.x = 0.35 + (seite < 0 ? 0.4 : 0) * auf;
        knie[1].rotation.x = 0.35 + (seite > 0 ? 0.4 : 0) * auf;
        rumpf.position.y = 0.86 + auf * 0.05;
        rumpf.rotation.z = seite * 0.08 * auf;
      } else {
        for (let i = 0; i < 2; i++) {
          beine[i].rotation.x = naeher(beine[i].rotation.x, 0, k);
          knie[i].rotation.x = naeher(knie[i].rotation.x, 0.04, k);
        }
        rumpf.position.y = 0.9 + Math.sin(zeit * 1.8) * 0.006;
        rumpf.rotation.z = naeher(rumpf.rotation.z, 0, k);
      }

      // Kopf zum Blickziel drehen
      let kopfSoll = 0;
      let kopfNick = 0;
      if (blickZiel && modus !== 'liegen' && modus !== 'schlafen') {
        const kp = api.kopfPosition();
        const dx = blickZiel.x - wurzel.position.x;
        const dz = blickZiel.z - wurzel.position.z;
        const welt = Math.atan2(dx, dz);
        const rel = winkelDiff(welt, wurzel.rotation.y);
        kopfSoll = THREE.MathUtils.clamp(rel, -1.1, 1.1);
        // Körper mitdrehen, wenn der Kopf nicht reicht
        if (!laeuft && (modus === 'normal' || modus === 'tanzen') && Math.abs(rel) > 1.0) wurzel.rotation.y += Math.sign(rel) * Math.min(Math.abs(rel) - 1.0, dt * 2.5);
        const horiz = Math.hypot(dx, dz);
        kopfNick = THREE.MathUtils.clamp(-Math.atan2(blickZiel.y - kp.y, horiz), -0.4, 0.4);
      } else if (modus === 'liegen') {
        kopfSoll = Math.sin(zeit * 0.7) * 0.5;
        kopfNick = -0.5;
      } else if (modus === 'schlafen') {
        kopfSoll = 0.5;
        kopfNick = -0.3;
      }
      if (tanzt) kopfNick += Math.pow(Math.abs(Math.cos((beat % 1) * Math.PI)), 3) * 0.3 - 0.1;
      const g = geste && zeit - geste.start < geste.dauer && modus === 'normal' && !telefoniert ? geste : null;
      // Hülle für Gesten: weich rein und raus
      const gk = g ? Math.min(1, (zeit - g.start) / 0.5, (g.start + g.dauer - zeit) / 0.5) : 0;
      if (g && g.name === 'gaehnen') kopfNick = kopfNick * (1 - gk) - 0.45 * gk;
      if (g && g.name === 'uhr') { kopfNick = kopfNick * (1 - gk) + 0.45 * gk; kopfSoll = kopfSoll * (1 - gk) - 0.3 * gk; }
      kopf.rotation.y += (kopfSoll - kopf.rotation.y) * Math.min(1, dt * 6);
      kopf.rotation.x += (kopfNick - kopf.rotation.x) * Math.min(1, dt * (tanzt ? 20 : 6));

      // Arme und Kaffee
      const wuetend = stimmung === 'wut';
      becher.visible = !(g && g.name === 'creme') && !wuetend && !tanzt && !essen && !besenInHand.visible && !loescherHand.visible && modus !== 'liegen' && modus !== 'schlafen' && modus !== 'sitzen' && modus !== 'hula';
      if (!besenInHand.visible) rumpf.rotation.y = 0;
      if (modus === 'schlafen') {
        links.schulter.rotation.set(-0.15, 0, 0.05);
        links.ellbogen.rotation.set(-0.5, 0, 0);
        rechts.schulter.rotation.set(-0.15, 0, -0.05);
        rechts.ellbogen.rotation.set(-0.5, 0, 0);
      } else if (modus === 'liegen') {
        links.schulter.rotation.set(-0.3, 0, -0.9);
        links.ellbogen.rotation.set(-1.9, 0, 0);
        rechts.schulter.rotation.set(-0.2 + Math.sin(zeit * 3) * 0.6, 0, 0.6);
        rechts.ellbogen.rotation.set(-0.6, 0, 0);
      } else if (modus === 'fegen') {
        const schwung = Math.sin(zeit * 5);
        besenDreh.rotation.z = schwung * 0.45;
        besenDreh.position.x = schwung * 0.12;
        rumpf.rotation.y = schwung * 0.15;
        links.schulter.rotation.set(-0.8, 0, -0.1 + schwung * 0.2);
        links.ellbogen.rotation.set(-0.5, 0, 0);
        rechts.schulter.rotation.set(-0.6, 0, 0.1 + schwung * 0.2);
        rechts.ellbogen.rotation.set(-0.7, 0, 0);
      } else if (besenInHand.visible) {
        besenDreh.rotation.z = 0;
        besenDreh.position.x = 0;
        rumpf.rotation.y = 0;
        links.schulter.rotation.set(-0.7, 0, -0.1);
        links.ellbogen.rotation.set(-0.5, 0, 0);
        rechts.schulter.rotation.set(-0.5, 0, 0.1);
        rechts.ellbogen.rotation.set(-0.7, 0, 0);
      } else if (modus === 'hula') {
        // Arme locker zur Seite, Hände wackeln mit
        const w = zeit * 11;
        links.schulter.rotation.set(-0.4, 0, -1.25 + Math.sin(w) * 0.1);
        links.ellbogen.rotation.set(-0.9, 0, 0);
        rechts.schulter.rotation.set(-0.4, 0, 1.25 - Math.sin(w) * 0.1);
        rechts.ellbogen.rotation.set(-0.9, 0, 0);
      } else if (essen) {
        // Brotdose links vor dem Bauch, Tomate rechts zum Mund
        const biss = Math.max(0, Math.sin(zeit * 2.2));
        links.schulter.rotation.set(-0.5, 0, -0.1);
        links.ellbogen.rotation.set(-1.2, 0, 0);
        rechts.schulter.rotation.set(-0.5 - biss * 0.6, 0.2, 0.1);
        rechts.ellbogen.rotation.set(-1.4 - biss * 0.6, 0, 0);
      } else if (tanzt) {
        const p = beat % 1;
        const hoch = Math.floor(beat / 2) % 2 === 0;
        const pump = Math.pow(Math.abs(Math.cos(p * Math.PI)), 2);
        links.schulter.rotation.set(hoch ? -2.7 - pump * 0.3 : -0.8, 0, -0.3);
        links.ellbogen.rotation.set(hoch ? -0.3 : -1.6 + pump * 0.4, 0, 0);
        rechts.schulter.rotation.set(!hoch ? -2.7 - pump * 0.3 : -0.8, 0, 0.3);
        rechts.ellbogen.rotation.set(!hoch ? -0.3 : -1.6 + pump * 0.4, 0, 0);
      } else if (g) {
        const m = (a, b) => a + (b - a) * gk;
        if (g.name === 'gaehnen') {
          // beide Arme hoch, strecken
          const w = Math.sin(zeit * 2) * 0.05;
          links.schulter.rotation.set(m(-0.1, -2.75 + w), 0, m(-0.12, -0.65));
          links.ellbogen.rotation.set(m(-0.15, -0.5), 0, 0);
          rechts.schulter.rotation.set(m(-0.25, -2.75 - w), 0, m(0.12, 0.65));
          rechts.ellbogen.rotation.set(m(-0.9, -0.5), 0, 0);
        } else if (g.name === 'huefte') {
          // linke Hand nach hinten an die Hüfte, reibt; leicht schief, Gesicht verzogen
          const reib = Math.sin(zeit * 9) * 0.12;
          links.schulter.rotation.set(m(-0.1, 0.75 + reib), 0, m(-0.12, -0.45));
          links.ellbogen.rotation.set(m(-0.15, -1.45), 0, 0);
          rechts.schulter.rotation.set(-0.25, 0, 0.12);
          rechts.ellbogen.rotation.set(-0.9, 0, 0);
          rumpf.rotation.z = -0.1 * gk;
        } else if (g.name === 'creme') {
          // beide Hände in die Locken, abwechselnd kneten
          const k1 = Math.sin(zeit * 8) * 0.18, k2 = Math.sin(zeit * 8 + 1.6) * 0.18;
          links.schulter.rotation.set(m(-0.1, -2.55 + k1), m(0, 0.25), m(-0.12, -0.95));
          links.ellbogen.rotation.set(m(-0.15, -1.75 + k2), 0, 0);
          rechts.schulter.rotation.set(m(-0.25, -2.55 + k2), m(0, -0.25), m(0.12, 0.95));
          rechts.ellbogen.rotation.set(m(-0.9, -1.75 + k1), 0, 0);
        } else {
          // Blick auf die Armbanduhr: linker Unterarm quer vor die Brust
          links.schulter.rotation.set(m(-0.1, -1.05), m(0, 0.55), m(-0.12, 0.1));
          links.ellbogen.rotation.set(m(-0.15, -1.75), 0, 0);
          rechts.schulter.rotation.set(-0.25, 0, 0.12);
          rechts.ellbogen.rotation.set(-0.9, 0, 0);
        }
      } else if (wuetend) {
        const z = Math.sin(zeit * 18) * 0.15;
        links.schulter.rotation.set(-2.4 + z, 0, -0.3);
        rechts.schulter.rotation.set(-2.4 - z, 0, 0.3);
        links.ellbogen.rotation.set(-0.5, 0, 0);
        rechts.ellbogen.rotation.set(-0.5, 0, 0);
      } else if (stimmung === 'sauer') {
        links.schulter.rotation.set(-0.3, 0, -0.35);
        links.ellbogen.rotation.set(-0.9, 0, 0);
        rechts.schulter.rotation.set(-1.0 + Math.sin(zeit * 9) * 0.35, 0, 0.25);
        rechts.ellbogen.rotation.set(-0.7, 0, 0);
      } else {
        const schwing = laeuft ? Math.sin(schrittPhase) * 0.45 : 0;
        links.schulter.rotation.set(-schwing, 0, -0.12);
        links.ellbogen.rotation.set(-0.15 - (laeuft ? 0.3 : 0), 0, 0);
        // Schluck Kaffee ab und zu
        schluckTimer -= dt;
        if (!laeuft && schluckTimer < 0) {
          schluck = 2.2;
          schluckTimer = 6 + Math.random() * 6;
        }
        schluck = Math.max(0, schluck - dt);
        const heben = schluck > 0 ? Math.sin((schluck / 2.2) * Math.PI) : 0;
        rechts.schulter.rotation.set(-0.25 - heben * 0.9 + schwing, heben * 0.3, 0.12 - heben * 0.2);
        rechts.ellbogen.rotation.set(-0.9 - heben * 1.3, 0, 0);
      }
      // telefoniert: linke Hand mit Handy am Ohr – immer, auch wenn er beim Gespräch sauer wird oder läuft
      if (telefoniert) {
        links.schulter.rotation.set(...TELEFON.s);
        links.ellbogen.rotation.set(...TELEFON.e);
      }

      // Becher bleibt aufrecht, egal wie der Arm steht; beim Schluck kippt er etwas zum Mund
      if (becher.visible) {
        // nur ein leichtes Ankippen zum Mund; Weltmatrix erst aktualisieren, sonst hinkt der Becher einen Frame hinterher
        const kipp = schluck > 0 ? Math.sin((schluck / 2.2) * Math.PI) * 0.35 : 0;
        rechts.ellbogen.updateWorldMatrix(true, false);
        rechts.ellbogen.getWorldQuaternion(becherQ).invert();
        becher.quaternion.copy(becherQ).multiply(wurzel.quaternion);
        becher.rotateX(-kipp);
      }

      // Gesicht
      const leidet = modus === 'liegen';
      const schlaeft = modus === 'schlafen';
      const brauWinkel = leidet ? -0.35 : ({ ruhig: 0, skeptisch: 0.25, sauer: 0.45, wut: 0.6, froh: -0.2 }[stimmung] ?? 0);
      brauen[0].rotation.z = -brauWinkel;
      brauen[1].rotation.z = brauWinkel;
      brauen[0].position.y = brauen[1].position.y = 0.205 - Math.abs(brauWinkel) * 0.02 + (stimmung === 'froh' ? 0.01 : 0);
      if (stimmung === 'skeptisch' && !leidet) brauen[1].position.y += 0.015;
      const mundAuf = schlaeft ? 0.014 + Math.max(0, Math.sin(zeit * 1.3)) * 0.012 : essen ? 0.014 + Math.max(0, Math.sin(zeit * 9)) * 0.02 : leidet ? 0.02 + Math.abs(Math.sin(zeit * 5)) * 0.03
        : tanzt ? 0.025
          : wuetend ? 0.03 + Math.abs(Math.sin(zeit * 14)) * 0.035 : stimmung === 'sauer' ? 0.02 + Math.abs(Math.sin(zeit * 10)) * 0.02 : 0.014;
      const gaehnt = g && g.name === 'gaehnen' ? gk : 0;
      mund.scale.set(stimmung === 'froh' || tanzt ? 1.3 : 1 + gaehnt * 0.4, (mundAuf + gaehnt * 0.06) / 0.014, 1);
      hautFarbe.lerp(zielFarbe, Math.min(1, dt * 4));
      for (const m of hautMats) m.color.copy(hautFarbe);
      kopf.position.x = wuetend ? Math.sin(zeit * 40) * 0.008 : 0;
    },
  };
  api.stimmung('ruhig');
  wurzel.rotation.y = Math.atan2(3.55 * 0.6, -2.55 - 1);
  return api;
}
