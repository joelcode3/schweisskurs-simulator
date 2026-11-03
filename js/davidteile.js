// David (F3, nach Fotos vom Betreiber): Teile, die nur David hat, auf der gemeinsamen Figur aus jonny.js:
// grauer Hoodie (Kapuze, Kordeln, Bauchtasche), lange schwarze Zimmererhose mit Knietaschen, dicke schwarze Arbeitsstiefel,
// blonde Haare (oben länger und hell, Seiten kurz und dunkler), blonder Stoppelbart nur am Kinn und über dem Mund,
// Silberkette, Ring, goldene Uhr. Dazu Haltungen: Rohrzange in der Hand, Feuerlöscher prüfen, Zigarette drehen.
// Coco (schwarzer Labrador) ist ein eigenes Objekt (baueCoco), das David folgt.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur } from './toon.js';
import { hosenbein, armTextur, baueHand } from './torbenteile.js';

const rnd = (() => { let q = 9137; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
const HOODIE = 0x8d8f94, HOODIE_D = 0x76787d, HOSE = 0x1b1c1f, STIEFEL = 0x151517;
const noUmr = { umriss: false };

// Hoodie-Stoff: leicht meliert, ein paar Staubflecken (Zimmerer)
function hoodieTextur() {
  return leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#8d8f94'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 1600; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'; g.fillRect(rnd() * b, rnd() * h, 1, 1); }
    for (let i = 0; i < 6; i++) {
      const x = rnd() * b, y = 40 + rnd() * 80, r = 4 + rnd() * 6;
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(210,205,190,0.35)'); gr.addColorStop(1, 'rgba(210,205,190,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  });
}

export function davidArm(seite, { rumpf, F, KY = 1 }) {
  const hoodieMat = toon(0xffffff, { map: hoodieTextur() });
  const H = { material: hoodieMat, umriss: 0.003 };
  const lathe = (pts, seg = 18) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const schulter = new THREE.Group();
  schulter.position.set(0.215 * seite, 0.6 * KY, 0);
  const delta = teil(new THREE.SphereGeometry(0.07, 14, 12), 0, H);
  delta.scale.set(1, 0.8, 1);
  schulter.add(delta);
  // langer, etwas weiter Ärmel (Oberarm)
  schulter.add(teil(lathe([[0.058, -0.29], [0.061, -0.2], [0.065, -0.1], [0.068, -0.02], [0.06, 0.01]]), 0, H));
  const ellbogen = new THREE.Group();
  ellbogen.position.y = -0.27;
  ellbogen.add(teil(new THREE.SphereGeometry(0.06, 14, 12), 0, H));
  // Unterarm: Ärmel mit Falten, unten Bündchen am Handgelenk
  ellbogen.add(teil(lathe([[0.046, -0.22], [0.054, -0.2], [0.058, -0.15], [0.056, -0.11], [0.06, -0.06], [0.059, -0.01], [0.056, 0.01]]), 0, H));
  ellbogen.add(setze(zylinder(0.042, 0.045, 0.04, HOODIE_D, { umriss: 0.002 }, 16), 0, -0.235, 0));
  const { hand, finger } = baueHand(seite, F.HAUT);
  hand.scale.setScalar(0.92);
  hand.position.y = -0.255;
  // Handgelenk-Haut zwischen Bündchen und Hand
  hand.add(setze(teil(new THREE.CylinderGeometry(0.036, 0.038, 0.03, 14), 0, { material: toon(0xffffff, { map: armTextur(F.HAUT) }), umriss: 0.002 }), 0, 0.012, 0));
  if (seite < 0) {
    // goldene Uhr links
    hand.add(setze(teil(new THREE.TorusGeometry(0.039, 0.006, 6, 18), 0xd7b25c, noUmr), 0, 0.006, 0, Math.PI / 2, 0, 0));
    hand.add(setze(quader(0.028, 0.006, 0.026, 0xd7b25c, { umriss: 0.0015 }), 0, 0.006, -0.042));
  }
  ellbogen.add(hand);
  schulter.add(ellbogen);
  rumpf.add(schulter);
  return { schulter, ellbogen, hand, finger };
}

// Rohrzange (für die Hand): roter Griff, Backen aus Stahl
function rohrzangeModell() {
  const g = new THREE.Group();
  g.add(setze(zylinder(0.012, 0.014, 0.26, 0xc8352a, { umriss: 0.0015 }, 10), 0, -0.05, 0));
  g.add(setze(quader(0.03, 0.06, 0.02, 0x6c7078, { umriss: 0.0015 }), 0, 0.1, 0));
  g.add(setze(quader(0.07, 0.022, 0.022, 0x6c7078, { umriss: 0.0015 }), 0.025, 0.135, 0));
  g.add(setze(quader(0.06, 0.02, 0.022, 0x8a8f96, { umriss: 0.0015 }), 0.02, 0.105, 0));
  g.add(setze(zylinder(0.014, 0.014, 0.02, 0x9aa0a8, { umriss: false }, 10), 0, 0.075, 0, Math.PI / 2, 0, 0));
  return g;
}

export function davidErweitern(c) {
  const { wurzel, koerper, rumpf, kopf, beine, links, rechts, F, A, R, T, huelle, aufHuelle, haarMat, becken, hemdMesh, KY, HUEFT, schaedel, nase, augen, opts } = c;

  // ---------- Hoodie: Rumpf in grauem Stoff, Bund über der Hüfte, Bauchtasche, Kapuze, Kordeln ----------
  hemdMesh.material = toon(0xffffff, { map: hoodieTextur(), side: THREE.DoubleSide });
  const ring = (h, plus, y, mat) => {
    let rx = 0, rz = 0;
    for (const yy of [y - h / 2, y, y + h / 2]) { rx = Math.max(rx, R(yy, 0)); rz = Math.max(rz, R(yy, 0) * T(yy)); }
    const m = teil(new THREE.CylinderGeometry(1, 1, h, 40, 1, true), 0, { material: mat, umriss: 0.002 });
    m.scale.set(rx + plus, 1, rz + plus);
    m.position.y = y;
    return m;
  };
  // Hoodie geht bis über den Hosenbund, unten Bündchen
  rumpf.add(ring(0.1, 0.012, -0.06, toon(HOODIE, { side: THREE.DoubleSide })));
  rumpf.add(ring(0.035, 0.016, -0.11, toon(HOODIE_D, { side: THREE.DoubleSide })));
  // Bauchtasche (Känguru-Tasche) vorne
  {
    const p = aufHuelle(0.012, 0.004, 0, 0.08, 0.006);
    const sh = new THREE.Shape();
    sh.moveTo(-0.11, -0.06); sh.lineTo(0.11, -0.06); sh.lineTo(0.08, 0.06); sh.lineTo(-0.08, 0.06); sh.closePath();
    const t = teil(new THREE.ExtrudeGeometry(sh, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }), HOODIE, { umriss: 0.002 });
    t.position.set(p.p.x, p.p.y, p.p.z - 0.004);
    rumpf.add(t);
  }
  // Kapuze: liegt hinten im Nacken, Rand um den Hals
  {
    const kap = teil(new THREE.SphereGeometry(0.13, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), 0, { material: toon(HOODIE, { side: THREE.DoubleSide }), umriss: 0.003 });
    kap.scale.set(1.05, 0.55, 0.85);
    kap.rotation.x = -1.9;
    kap.position.set(0, 0.72 * KY, -0.11);
    rumpf.add(kap);
    const kragen = teil(new THREE.TorusGeometry(0.086, 0.03, 10, 26), HOODIE, { umriss: 0.002 });
    kragen.rotation.x = Math.PI / 2 - 0.2;
    kragen.position.set(0, 0.76 * KY, -0.01);
    rumpf.add(kragen);
    // Kordeln mit Metallösen
    for (const sx of [-1, 1]) {
      rumpf.add(setze(teil(new THREE.TorusGeometry(0.008, 0.0028, 6, 10), 0xc8c8cc, noUmr), sx * 0.04, 0.705 * KY, 0.1));
      const kord = teil(new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 6), 0xd8d8dc, noUmr);
      kord.position.set(sx * 0.042, 0.64 * KY, 0.104);
      kord.rotation.set(0.12, 0, sx * 0.04);
      rumpf.add(kord);
      rumpf.add(setze(zylinder(0.006, 0.006, 0.018, 0xb8b8bc, noUmr, 6), sx * 0.045, 0.572 * KY, 0.112));
    }
  }

  // ---------- Hose: lange schwarze Zimmererhose, Knietaschen, Zollstocktasche; dicke Arbeitsstiefel ----------
  becken.scale.set(0.8, 0.5, 0.6);
  becken.position.y = HUEFT - 0.07;
  const hosenMat = toon(HOSE);
  for (const [i, b] of beine.entries()) {
    const seite = i === 0 ? -1 : 1;
    const hf = b.huefte, k = b.k;
    hf.children[0].visible = false; hf.children[1].visible = false; hf.children[2].visible = false;
    const [knie, wade, , , schuh] = k.children;
    knie.visible = false; wade.visible = false; schuh.visible = false;
    hf.scale.set(1.0, 1.08, 1.0);
    hf.add(setze(teil(hosenbein(0.108, 0.098, 0.46, 2 + i * 3, false, true), 0, { material: hosenMat, umriss: 0.003 }), 0, -0.212, 0));
    k.add(setze(teil(new THREE.SphereGeometry(0.097, 12, 10), 0, { material: hosenMat, umriss: false }), 0, 0, 0));
    k.add(setze(teil(hosenbein(0.098, 0.09, 0.33, 7 + i * 2, true), 0, { material: hosenMat, umriss: 0.003 }), 0, -0.165, 0));
    // Knietasche (Kniepolster) vorne
    const kt = teil(new THREE.SphereGeometry(1, 16, 12), 0x232428, { umriss: 0.002 });
    kt.scale.set(0.07, 0.085, 0.03);
    kt.position.set(0, -0.03, 0.085);
    k.add(kt);
    k.add(setze(quader(0.11, 0.006, 0.01, 0x3a3c42, noUmr), 0, 0.045, 0.11));
    // seitliche Beintasche mit Zollstock (rechts) bzw. Reißverschluss (links)
    const t = new THREE.Group();
    const bt = teil(new THREE.SphereGeometry(1, 16, 12), 0x202126, { umriss: 0.002 });
    bt.scale.set(0.02, 0.09, 0.07);
    t.add(bt);
    if (seite > 0) t.add(setze(quader(0.016, 0.13, 0.03, 0xf2c21c, { umriss: 0.0015 }), 0.004, 0.08, -0.02));
    else t.add(setze(quader(0.004, 0.12, 0.004, 0xb8a050, noUmr), 0.021 * seite, 0, 0.02));
    t.position.set(0.108 * seite, -0.2, 0.0);
    hf.add(t);
    // dicker schwarzer Arbeitsstiefel: hoher Schaft, Schnürung, Profilsohle, Zehenkappe
    const st = new THREE.Group();
    st.position.y = -0.42;
    st.add(setze(zylinder(0.075, 0.08, 0.13, STIEFEL, { umriss: 0.004 }, 16), 0, 0.03, 0.0));
    const vorne = teil(new THREE.CapsuleGeometry(0.072, 0.15, 4, 12), STIEFEL, { umriss: 0.004 });
    vorne.rotation.x = Math.PI / 2; vorne.scale.set(1.12, 1, 0.8); vorne.position.set(0, -0.02, 0.06);
    st.add(vorne);
    const sohle = teil(new THREE.CapsuleGeometry(0.078, 0.17, 4, 12), 0x2e2f33, { umriss: 0.004 });
    sohle.rotation.x = Math.PI / 2; sohle.scale.set(1.15, 1, 0.34); sohle.position.set(0, -0.07, 0.06);
    st.add(sohle);
    for (let j = 0; j < 5; j++) st.add(setze(quader(0.05, 0.005, 0.008, 0x6a6c72, noUmr), 0, 0.075 - j * 0.03, 0.078 + (j > 2 ? (j - 2) * 0.018 : 0), 0.25, 0, 0));
    st.add(setze(zylinder(0.081, 0.081, 0.012, 0x2a2b30, noUmr, 16), 0, 0.09, 0));
    k.add(st);
    // Hosensaum fällt über den Stiefelschaft
    k.add(setze(zylinder(0.092, 0.092, 0.014, 0x111214, noUmr, 16), 0, -0.33, 0));
  }

  // ---------- Kopf: schmales, langes Gesicht, blaue Augen, blonde Haare (oben lang, Seiten kurz), Stoppeln an Kinn und Oberlippe ----------
  schaedel.scale.set(0.9, 1.18, 0.96);
  nase.scale.set(0.7, 1.05, 0.9);
  nase.position.set(0, 0.095, 0.164);
  // Seiten und Hinterkopf: kurz und dunkler (Fade), oben: hellblond, länger, nach oben und leicht zur Seite gestrichen
  const seitenMat = toon(0xa08a66);
  // kurze Seiten: Kappe, die vorne über der Stirn endet (Haaransatz), hinten bis in den Nacken
  const seiten = teil(new THREE.SphereGeometry(0.17, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), 0, { material: seitenMat, umriss: 0.003 });
  seiten.scale.set(0.94, 1.12, 1.0); seiten.position.set(0, 0.125, -0.012); seiten.rotation.x = -0.32;
  kopf.add(seiten);
  // oben: hellblond, etwas länger: eine zweite, etwas größere Kappe nur über dem Oberkopf (liegt auf den kurzen Seiten auf),
  // vorne etwas hochgestellt und nach rechts gekämmt
  const obenMat = toon(0xeee0b6);
  const oben = teil(new THREE.SphereGeometry(0.18, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.3), 0, { material: obenMat, umriss: 0.0025 });
  oben.scale.set(0.95, 1.08, 1.0); oben.position.set(0.004, 0.103, 0.0); oben.rotation.set(-0.08, 0, -0.05);
  kopf.add(oben);
  for (const [x, y, z, sx, sy, sz, rx, rz] of [
    [0.0, 0.285, 0.1, 0.075, 0.028, 0.05, 0.5, -0.25], [0.045, 0.28, 0.085, 0.06, 0.024, 0.05, 0.5, -0.45], [-0.045, 0.278, 0.09, 0.055, 0.022, 0.045, 0.45, -0.1],
  ]) {
    const t = teil(new THREE.SphereGeometry(1, 14, 10), 0, { material: obenMat, umriss: 0.002 });
    t.scale.set(sx, sy, sz); t.position.set(x, y, z); t.rotation.set(rx, 0, rz);
    kopf.add(t);
  }
  // Brauen hellblond, schmal
  for (const sx of [-1, 1]) {
    const br = teil(new THREE.BoxGeometry(0.06, 0.012, 0.02), 0xc9a870, noUmr);
    br.position.set(sx * 0.06, 0.196, 0.15); br.rotation.z = sx * -0.08;
    kopf.add(br);
  }
  // Augen etwas tiefer liegend: Lidschatten oben
  for (const x of [-0.06, 0.06]) {
    const lid = teil(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xd8a88e, noUmr);
    lid.scale.set(0.026, 0.01, 0.02); lid.position.set(x, 0.163, 0.142);
    kopf.add(lid);
  }
  for (const a of augen) a.children[1].scale.setScalar(1.1);
  // schiefes Grinsen: Mundwinkel rechts etwas hoch
  kopf.add(setze(teil(new THREE.CapsuleGeometry(0.006, 0.022, 4, 6), 0xb87466, noUmr), 0.033, 0.037, 0.165, 0, 0, Math.PI / 2 - 0.5));
  // Stoppeln: blond, an Kinn und über dem Mund (kein Vollbart)
  {
    const tex = leinwandTextur(256, 128, (g, b, h) => {
      for (let i = 0; i < 9000; i++) {
        const u = 0.25 + rnd() * 0.5, v = 0.2 + rnd() * 0.8;
        const mitte = Math.abs(u - 0.5);
        let ok = false;
        if (v > 0.3 && v < 0.43 && mitte < 0.15) ok = true;          // Oberlippe
        if (v > 0.6 && mitte < 0.16 - (v - 0.6) * 0.05) ok = true;    // Kinn
        if (!ok || rnd() > 0.7) continue;
        g.fillStyle = rnd() < 0.6 ? 'rgba(176,140,86,0.95)' : 'rgba(140,108,66,0.9)';
        g.fillRect(u * b, v * h, 1.6, 1.6);
      }
    });
    const stoppel = new THREE.Mesh(new THREE.SphereGeometry(0.1665, 40, 20, Math.PI / 2 - 1.3, 2.6, 1.5, 1.2), toon(0xffffff, { map: tex, alphaTest: 0.5, side: THREE.DoubleSide }));
    stoppel.scale.set(0.9 * 1.005, 1.18 * 1.005, 0.96 * 1.005);
    stoppel.position.set(0, 0.12, 0);
    kopf.add(stoppel);
  }
  // Silberkette am Hals (über dem Hoodie-Kragen sichtbar)
  rumpf.add(setze(teil(new THREE.TorusGeometry(0.075, 0.0025, 5, 30), 0xd8d8de, noUmr), 0, 0.76 * KY, 0.03, Math.PI / 2 - 0.45, 0, 0));
  // Ring rechts
  rechts.hand.add(setze(teil(new THREE.TorusGeometry(0.016, 0.004, 6, 14), 0xd8d8de, noUmr), -0.011, -0.1, 0.002, Math.PI / 2, 0, 0));

  // ---------- Dinge in der Hand ----------
  const zange = rohrzangeModell();
  zange.position.set(0, -0.08, 0.035);
  zange.visible = false;
  rechts.hand.add(zange);
  // Zigarette drehen: Blättchen (links), Tabakbeutel (links), fertige Zigarette
  const blatt = quader(0.06, 0.002, 0.03, 0xf6f4ee, noUmr);
  blatt.position.set(0, -0.085, 0.045); blatt.visible = false;
  links.hand.add(blatt);
  const beutel = quader(0.08, 0.02, 0.06, 0x2e5a8a, { umriss: 0.0015 });
  beutel.position.set(0, -0.06, 0.06); beutel.visible = false;
  rechts.hand.add(beutel);

  const smooth = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  let haltung = 'ruhe', t0 = 0, zeit = 0, fertig = null;
  function ruhe() {
    links.hand.rotation.set(0, 0.9, 0); rechts.hand.rotation.set(0, -0.9, 0);
    links.hand.userData.krumm(0.35); rechts.hand.userData.krumm(zange.visible ? 0.9 : 0.35);
    links.schulter.rotation.set(0.05, 0, -0.1); links.ellbogen.rotation.set(-0.25, 0, 0.05);
    rechts.schulter.rotation.set(zange.visible ? -0.15 : 0.05, 0, 0.1); rechts.ellbogen.rotation.set(zange.visible ? -0.7 : -0.25, 0, -0.05);
  }
  function starte(h, dauer) {
    haltung = h; t0 = zeit;
    return new Promise((r) => { fertig = r; if (dauer) setTimeout(() => { if (haltung === h) { haltung = 'ruhe'; ruhe(); const f = fertig; fertig = null; if (f) f(true); } }, dauer); });
  }
  function update(dt, st) {
    zeit += dt;
    const t = zeit - t0;
    if (haltung === 'drehen') {
      // beide Hände vor der Brust, die rechte rollt das Blättchen hin und her
      blatt.visible = true; beutel.visible = t < 1.4;
      links.schulter.rotation.set(-0.75, 0.25, -0.1); links.ellbogen.rotation.set(-1.25, 0, 0.4);
      rechts.schulter.rotation.set(-0.75, -0.25, 0.1); rechts.ellbogen.rotation.set(-1.25 + Math.sin(t * 9) * 0.07, 0, -0.4);
      links.hand.userData.krumm(0.55); rechts.hand.userData.krumm(0.55 + Math.sin(t * 9) * 0.1);
      kopf.rotation.x = 0.28;
      if (t > 2.4) { // anlecken
        rechts.schulter.rotation.x = -1.3; rechts.ellbogen.rotation.x = -1.9;
      }
    } else if (haltung === 'loescher') {
      // nach vorn gebeugt, Kopf runter, zeigt mit der rechten Hand auf das Prüfschild
      rumpf.rotation.x = 0.25 + Math.sin(t * 2) * 0.02;
      kopf.rotation.x = 0.35;
      rechts.schulter.rotation.set(-0.9, 0, 0.05); rechts.ellbogen.rotation.set(-0.5, 0, 0);
      rechts.hand.userData.krumm(0.6);
    } else if (haltung === 'zangeWand') {
      // Arm hoch zur Wand (Zange abnehmen oder zurückhängen)
      const k = smooth(t / 0.6) * (t < 1.3 ? 1 : 1 - smooth((t - 1.3) / 0.6));
      rechts.schulter.rotation.set(-0.15 - k * 2.0, 0, 0.1); rechts.ellbogen.rotation.set(-0.7 + k * 0.4, 0, 0);
    } else if (haltung === 'zangeAnsehen') {
      // Zange vor dem Gesicht drehen und begutachten
      rechts.schulter.rotation.set(-1.1, -0.2, 0.1); rechts.ellbogen.rotation.set(-1.3, 0, 0);
      rechts.hand.rotation.set(0, -0.9 + Math.sin(t * 2.5) * 0.6, 0);
      kopf.rotation.x = 0.1;
    }
    if (haltung !== 'drehen' && haltung !== 'loescher' && haltung !== 'zangeAnsehen') kopf.rotation.x *= Math.max(0, 1 - dt * 5);
    if (haltung !== 'loescher') rumpf.rotation.x *= Math.max(0, 1 - dt * 5);
  }
  const api = {
    // Rohrzange in der rechten Hand an/aus
    rohrzange(an) { zange.visible = an; ruhe(); },
    get hatRohrzange() { return zange.visible; },
    async zangeWand() { await starte('zangeWand', 2000); },
    async zangeAnsehen(ms = 2600) { await starte('zangeAnsehen', ms); },
    async loescherPruefen(ms = 3200) { await starte('loescher', ms); },
    // Zigarette drehen (ca. 3 s), danach hat er die Kippe (rauchen(true) aus jonny.js)
    async drehen() { await starte('drehen', 3000); blatt.visible = false; beutel.visible = false; },
    get haltung() { return haltung; },
  };
  ruhe();
  return { ruhe, update, api, posen: {} };
}

// ---------- Coco: schwarzer Labrador, läuft David hinterher, wedelt ----------
export function baueCoco(scene) {
  const fell = 0x18181b, fellHell = 0x2a2a2e;
  const wurzel = new THREE.Group();
  wurzel.scale.setScalar(0.95);
  scene.add(wurzel);
  const koerper = new THREE.Group();
  koerper.position.y = 0.38;
  wurzel.add(koerper);
  const rumpf = teil(new THREE.CapsuleGeometry(0.13, 0.36, 6, 14), fell, { umriss: 0.006 });
  rumpf.rotation.x = Math.PI / 2; rumpf.scale.set(0.92, 1, 1.0);
  koerper.add(rumpf);
  // Brust etwas tiefer
  koerper.add(setze(teil(new THREE.SphereGeometry(0.13, 14, 10), fell, { umriss: false }), 0, -0.03, 0.17));
  // Hals und Kopf
  const kopf = new THREE.Group();
  kopf.position.set(0, 0.14, 0.3);
  koerper.add(kopf);
  kopf.add(setze(teil(new THREE.CylinderGeometry(0.075, 0.1, 0.18, 12), fell, { umriss: 0.005 }), 0, -0.06, -0.05, 0.6, 0, 0));
  const schaedel = teil(new THREE.SphereGeometry(0.1, 16, 12), fell, { umriss: 0.005 });
  schaedel.scale.set(0.95, 0.9, 1.05);
  kopf.add(schaedel);
  const schnauze = teil(new THREE.CapsuleGeometry(0.055, 0.08, 4, 10), fell, { umriss: 0.004 });
  schnauze.rotation.x = Math.PI / 2; schnauze.position.set(0, -0.03, 0.11);
  kopf.add(schnauze);
  kopf.add(setze(kugel(0.025, 0x0a0a0a, { umriss: false }, 10), 0, -0.015, 0.18));
  for (const sx of [-1, 1]) {
    kopf.add(setze(kugel(0.016, 0x3a2414, { umriss: false }, 8), sx * 0.045, 0.025, 0.085));
    kopf.add(setze(kugel(0.006, 0xf4f4f4, { umriss: false }, 6), sx * 0.048, 0.03, 0.1));
    const ohr = teil(new THREE.CapsuleGeometry(0.035, 0.07, 4, 8), fellHell, { umriss: 0.003 });
    ohr.scale.set(1, 1, 0.35); ohr.position.set(sx * 0.09, -0.02, -0.01); ohr.rotation.z = sx * 0.25;
    kopf.add(ohr);
  }
  // Zunge (hängt beim Laufen raus)
  const zunge = teil(new THREE.CapsuleGeometry(0.02, 0.04, 4, 8), 0xd8607a, { umriss: false });
  zunge.scale.set(1, 1, 0.3); zunge.position.set(0, -0.08, 0.15); zunge.rotation.x = 0.3;
  kopf.add(zunge);
  // rotes Halsband
  kopf.add(setze(teil(new THREE.TorusGeometry(0.083, 0.012, 6, 18), 0xc8352a, { umriss: false }), 0, -0.1, -0.08, Math.PI / 2 + 0.6, 0, 0));
  // Beine
  const beine = [];
  for (const [x, z] of [[-0.075, 0.18], [0.075, 0.18], [-0.075, -0.18], [0.075, -0.18]]) {
    const b = new THREE.Group();
    b.position.set(x, -0.05, z);
    b.add(setze(teil(new THREE.CapsuleGeometry(0.035, 0.24, 4, 8), fell, { umriss: 0.004 }), 0, -0.16, 0));
    b.add(setze(teil(new THREE.SphereGeometry(0.04, 10, 8), fell, { umriss: 0.003 }), 0, -0.31, 0.015));
    koerper.add(b);
    beine.push(b);
  }
  // Rute
  const rute = new THREE.Group();
  rute.position.set(0, 0.04, -0.26);
  rute.add(setze(teil(new THREE.CapsuleGeometry(0.025, 0.22, 4, 8), fell, { umriss: 0.003 }), 0, 0.11, 0));
  rute.rotation.x = -0.9;
  koerper.add(rute);

  let ziel = null, zeit = 0, schritt = 0, folgt = null, tempo = 1.3;
  const api = {
    wurzel,
    get position() { return wurzel.position; },
    sichtbar(an) { wurzel.visible = an; },
    folge(figur) { folgt = figur; },
    gehZu(x, z) { ziel = new THREE.Vector3(x, 0, z); },
    update(dt) {
      zeit += dt;
      if (!wurzel.visible) return;
      // folgt David: hält etwa 0,9 m Abstand seitlich hinter ihm
      if (folgt) {
        const f = folgt.wurzel;
        const sx = Math.sin(f.rotation.y), sz = Math.cos(f.rotation.y);
        ziel = new THREE.Vector3(f.position.x - sx * 0.7 + sz * 0.5, 0, f.position.z - sz * 0.7 - sx * 0.5);
        tempo = folgt.geht ? 1.6 : 1.2;
        // zu weit weg (z. B. David wurde versetzt): Coco springt hinterher
        if (wurzel.position.distanceTo(ziel) > 6) wurzel.position.copy(ziel);
      }
      let geht = false;
      if (ziel) {
        const d = new THREE.Vector3().subVectors(ziel, wurzel.position); d.y = 0;
        const rest = d.length();
        if (rest > 0.12) {
          geht = true;
          d.normalize();
          const soll = Math.atan2(d.x, d.z);
          let diff = soll - wurzel.rotation.y;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          wurzel.rotation.y += diff * Math.min(1, dt * 6);
          wurzel.position.addScaledVector(d, Math.min(rest, tempo * dt * (rest > 2 ? 1.6 : 1)));
          schritt += dt * 11;
        } else if (folgt) {
          // steht: guckt zu David
          const f = folgt.wurzel.position;
          wurzel.rotation.y += (Math.atan2(f.x - wurzel.position.x, f.z - wurzel.position.z) - wurzel.rotation.y) * Math.min(1, dt * 2);
        }
      }
      const s = geht ? Math.sin(schritt) * 0.5 : 0;
      beine[0].rotation.x = s; beine[3].rotation.x = s; beine[1].rotation.x = -s; beine[2].rotation.x = -s;
      koerper.position.y = 0.38 + (geht ? Math.abs(Math.sin(schritt)) * 0.02 : 0);
      rute.rotation.z = Math.sin(zeit * (geht ? 10 : 14)) * 0.5;
      kopf.rotation.x = geht ? 0.15 : Math.sin(zeit * 0.7) * 0.06;
      zunge.visible = geht || Math.sin(zeit * 0.3) > 0;
      // hecheln
      rumpf.scale.x = 0.92 + Math.sin(zeit * 9) * 0.01;
    },
  };
  return api;
}
