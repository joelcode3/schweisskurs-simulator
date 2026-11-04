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
  schulter.position.set(0.198 * seite, 0.6 * KY, 0);
  // Schulter flach statt Kugel: der Ärmel setzt mit leicht abfallender Naht an
  const delta = teil(new THREE.SphereGeometry(0.062, 16, 12), 0, H);
  delta.scale.set(0.95, 0.55, 0.95);
  delta.position.y = -0.02;
  schulter.add(delta);
  // langer, etwas weiter Ärmel (Oberarm)
  schulter.add(teil(lathe([[0.058, -0.29], [0.061, -0.2], [0.065, -0.1], [0.068, -0.02], [0.06, 0.01]]), 0, H));
  const ellbogen = new THREE.Group();
  ellbogen.position.y = -0.27;
  ellbogen.add(teil(new THREE.SphereGeometry(0.06, 14, 12), 0, H));
  // Unterarm: Ärmel mit Falten, unten Bündchen am Handgelenk
  ellbogen.add(teil(lathe([[0.046, -0.22], [0.054, -0.2], [0.058, -0.15], [0.056, -0.11], [0.06, -0.06], [0.059, -0.01], [0.056, 0.01]]), 0, H));
  ellbogen.add(setze(zylinder(0.042, 0.045, 0.04, HOODIE_D, { umriss: 0.002 }, 16), 0, -0.235, 0));
  const { hand, finger } = baueHand(seite, F.HAUT, true);
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
  // Konturen statt runder Tonne: Brustmuskeln vorne, Schulterblätter hinten, flachere Flanken, leichte Taille
  {
    const ps = hemdMesh.geometry.attributes.position;
    const g2 = (a, b) => Math.exp(-(a * a) - (b * b));
    for (let i = 0; i < ps.count; i++) {
      let x = ps.getX(i), y = ps.getY(i) / KY, z = ps.getZ(i);
      const ax = Math.abs(x);
      if (z > 0) {
        z += 0.02 * g2((ax - 0.075) / 0.06, (y - 0.5) / 0.08);           // Brust
        z -= 0.006 * g2(x / 0.02, (y - 0.42) / 0.12);                      // Brustbein-Rinne
        z += 0.006 * g2((ax - 0.05) / 0.06, (y - 0.18) / 0.08);            // Bauch leicht
      } else {
        z += 0.01 * g2((ax - 0.085) / 0.06, (y - 0.52) / 0.09);            // Schulterblätter
        z += 0.004 * g2(x / 0.02, (y - 0.4) / 0.2);                        // Wirbelsäulen-Rinne
      }
      // Flanken flacher und Taille etwas schmaler
      const flanke = ax / Math.max(0.001, Math.hypot(x, z));
      x *= 1 - 0.05 * flanke * g2(0, (y - 0.12) / 0.14);

      ps.setXYZ(i, x, y * KY, z);
    }
    hemdMesh.geometry.computeVertexNormals();
  }
  const ring = (h, plus, y, mat) => {
    let rx = 0, rz = 0;
    for (const yy of [y - h / 2, y, y + h / 2]) { rx = Math.max(rx, R(yy, 0)); rz = Math.max(rz, R(yy, 0) * T(yy)); }
    const m = teil(new THREE.CylinderGeometry(1, 1, h, 40, 1, true), 0, { material: mat, umriss: 0.002 });
    m.scale.set(rx + plus, 1, rz + plus);
    m.position.y = y;
    return m;
  };
  // Hoodie geht bis über den Hosenbund, unten Bündchen
  // er hängt über dem Hosenbund: unten etwas weiter, Bündchen liegt auf der Hose (Hosenbund verschwindet darunter)
  {
    const unten = new THREE.LatheGeometry([[0.0, -0.115], [1.22, -0.115], [1.23, -0.095], [1.16, -0.06], [1.06, -0.02], [1.0, 0.02], [0.98, 0.05]].map(([r, y]) => new THREE.Vector2(r, y)), 40);
    let rx = 0, rz = 0;
    for (const yy of [-0.04, 0, 0.04]) { rx = Math.max(rx, R(yy, 0)); rz = Math.max(rz, R(yy, 0) * T(yy)); }
    const m = teil(unten, 0, { material: toon(0xffffff, { map: hoodieTextur(), side: THREE.DoubleSide }), umriss: 0.003 });
    m.scale.set(rx + 0.012, 1, rz + 0.012);
    rumpf.add(m);
    // Bündchen (gerippt): dunklerer Ring unten
    const b = teil(new THREE.CylinderGeometry(1.235, 1.24, 0.035, 40, 1, true), 0, { material: toon(HOODIE_D, { side: THREE.DoubleSide }), umriss: 0.002 });
    b.scale.set(rx + 0.013, 1, rz + 0.013);
    b.position.y = -0.1;
    rumpf.add(b);
    for (let i = 0; i < 40; i++) {
      const w = (i / 40) * Math.PI * 2;
      rumpf.add(setze(quader(0.003, 0.03, 0.003, 0x66686d, noUmr), Math.sin(w) * (rx + 0.013) * 1.245, -0.1, Math.cos(w) * (rz + 0.013) * 1.245, 0, w, 0));
    }
  }
  // Bauchtasche (Känguru-Tasche): liegt auf dem Bauch (folgt der Körperform), Eingriffe schräg an den Seiten, Naht oben
  const aufBauch = (x, y, d) => { const rx = R(y, 0.012), rz = rx * T(y) + 0.004; const th = Math.asin(THREE.MathUtils.clamp(x / rx, -1, 1)); return new THREE.Vector3(rx * Math.sin(th), y, rz * Math.cos(th) + d); };
  {
    const sh = new THREE.Shape();
    sh.moveTo(-0.115, 0.0); sh.lineTo(0.115, 0.0); sh.lineTo(0.08, 0.13); sh.lineTo(-0.08, 0.13); sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 8);
    const ps = g.attributes.position;
    for (let i = 0; i < ps.count; i++) { const p = aufBauch(ps.getX(i), ps.getY(i), 0.006 + 0.006 * Math.sin((ps.getY(i) / 0.13) * Math.PI)); ps.setXYZ(i, p.x, p.y, p.z); }
    g.computeVertexNormals();
    rumpf.add(teil(g, 0, { material: toon(0xffffff, { map: hoodieTextur(), side: THREE.DoubleSide }), umriss: 0.0018 }));
    const rand = sh.getPoints().map((q) => aufBauch(q.x, q.y, 0.008 + 0.006 * Math.sin((q.y / 0.13) * Math.PI)));
    rumpf.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([...rand, rand[0]], false, 'catmullrom', 0), 60, 0.0026, 4, false), toon(HOODIE_D)));
  }
  // Kapuze: liegt flach auf dem oberen Rücken (folgt der Rückenform), mit umgenähtem Rand; um den Hals ein Stoffkragen,
  // der vorne offen ist (dort kommen die Kordeln raus)
  {
    const hoodMat = toon(0xffffff, { map: hoodieTextur(), side: THREE.DoubleSide });
    // Umriss der liegenden Kapuze (Schildform), x = seitlich, y = Höhe im Rumpf
    const sh = new THREE.Shape();
    const oy = 0.72 * KY, uy = 0.47 * KY;
    sh.moveTo(-0.12, oy); sh.quadraticCurveTo(-0.15, oy - 0.08, -0.12, uy + 0.07); sh.quadraticCurveTo(-0.06, uy, 0, uy);
    sh.quadraticCurveTo(0.06, uy, 0.12, uy + 0.07); sh.quadraticCurveTo(0.15, oy - 0.08, 0.12, oy); sh.lineTo(-0.12, oy);
    const aufRuecken = (x, y, d) => { const rx = R(y, 0.012), rz = rx * T(y) + 0.004; const th = Math.asin(THREE.MathUtils.clamp(x / rx, -1, 1)); return new THREE.Vector3(rx * Math.sin(th) * 1.0, y, -(rz * Math.cos(th) + d)); };
    const g = new THREE.ShapeGeometry(sh, 16);
    const ps = g.attributes.position;
    for (let i = 0; i < ps.count; i++) {
      const x = ps.getX(i), y = ps.getY(i);
      // in der Mitte etwas aufgebauscht
      const bausch = 0.012 + 0.02 * Math.max(0, 1 - Math.abs(x) / 0.13) * Math.max(0, Math.sin(((y - uy) / (oy - uy)) * Math.PI));
      const p = aufRuecken(x, y, bausch);
      ps.setXYZ(i, p.x, p.y, p.z);
    }
    g.computeVertexNormals();
    rumpf.add(teil(g, 0, { material: hoodMat, umriss: 0.002 }));
    // umgenähter Rand als Wulst entlang des Umrisses, und Mittelnaht
    const rand = sh.getSpacedPoints(60).map((q) => aufRuecken(q.x, q.y, 0.016));
    rumpf.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rand, false), 80, 0.008, 6, false), HOODIE_D, { umriss: 0.0015 }));
    const naht = [];
    for (let i = 0; i <= 10; i++) { const y = oy - (i / 10) * (oy - uy - 0.005); naht.push(aufRuecken(0, y, 0.012 + 0.02 * Math.sin(((y - uy) / (oy - uy)) * Math.PI) + 0.002)); }
    rumpf.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(naht), 20, 0.0022, 4, false), toon(0x5c5e63)));
    // Kapuzen-Wulst: dicker Stoffrand um den Hals, läuft vorne als V zusammen (dort kommen die Kordeln raus)
    const hals = [];
    for (let i = 0; i <= 24; i++) {
      const w = -Math.PI * 0.82 + (i / 24) * Math.PI * 1.64; // 0 = hinten
      const r = 0.098 + 0.006 * Math.cos(w);
      hals.push(new THREE.Vector3(Math.sin(w) * r, 0.735 * KY + 0.02 * Math.cos(w) * 0.5 + 0.012, -Math.cos(w) * r * 0.95));
    }
    // vorne die beiden Enden zur Brustmitte runterziehen (V)
    const vL = [new THREE.Vector3(-0.05, 0.69 * KY, 0.11), new THREE.Vector3(-0.012, 0.645 * KY, 0.125)];
    const vR = [new THREE.Vector3(0.05, 0.69 * KY, 0.11), new THREE.Vector3(0.012, 0.645 * KY, 0.125)];
    const pfad = [...vL.slice().reverse(), ...hals, ...vR];
    rumpf.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pfad), 90, 0.022, 10, false), 0, { material: hoodMat, umriss: 0.0022 }));
    // Innenseite der Kapuzenöffnung (etwas dunkler) sichtbar am V
    const innen = teil(new THREE.CircleGeometry(0.03, 3), HOODIE_D, noUmr);
    innen.position.set(0, 0.675 * KY, 0.118); innen.rotation.x = -0.35; innen.scale.set(1, 1.3, 1);
    rumpf.add(innen);
    // Kordeln mit Metallösen
    for (const sx of [-1, 1]) {
      rumpf.add(setze(teil(new THREE.TorusGeometry(0.007, 0.0026, 6, 10), 0xc8c8cc, noUmr), sx * 0.03, 0.665 * KY, 0.128));
      const kord = teil(new THREE.CylinderGeometry(0.0035, 0.0035, 0.13, 6), 0xd8d8dc, noUmr);
      kord.position.set(sx * 0.032, 0.605 * KY, 0.13);
      kord.rotation.set(0.12, 0, sx * 0.04);
      rumpf.add(kord);
      rumpf.add(setze(zylinder(0.006, 0.006, 0.018, 0xb8b8bc, noUmr, 6), sx * 0.035, 0.535 * KY, 0.138));
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
  // Haare: sehr kurz, hellblond, eng am Kopf (keine Kappe), leichter Seitenscheitel links, oben minimal mehr Volumen nach rechts
  kopf.traverse((o) => { if (o.isMesh && o.material === haarMat) o.visible = false; });
  // Haar-Schale genau in Schädelform (nicht gedreht, sonst sinkt sie vorne in den Kopf); der Haaransatz kommt aus der Textur:
  // vorne hoch über der Stirn, an den Seiten über den Ohren, hinten tief im Nacken (alles darunter durchsichtig)
  // Haaransatz über die Form: Punkte unterhalb der Linie werden in den Kopf gezogen (unsichtbar)
  // vorne über der Stirn, an den Seiten über den Ohren, hinten tief im Nacken
  const haarTex = leinwandTextur(256, 128, (g, b, h) => {
    g.fillStyle = '#ecdaa6'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 3200; i++) {
      const x = rnd() * b, y = rnd() * h;
      g.strokeStyle = rnd() < 0.5 ? 'rgba(252,244,212,0.6)' : 'rgba(170,140,86,0.4)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2.5, y + 2); g.stroke();
    }
  });
  const hg = new THREE.SphereGeometry(0.165, 64, 40, 0, Math.PI * 2, 0, Math.PI * 0.75);
  {
    const ps = hg.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < ps.count; i++) {
      v.fromBufferAttribute(ps, i).divideScalar(0.165);
      const vorn = v.z, seite = Math.abs(v.x);
      // Linie: Stirn bei Höhe 0.42, Schläfen 0.32, über dem Ohr 0.25, Nacken -0.55
      const grenze = vorn > 0 ? 0.25 + 0.17 * vorn + 0.06 * Math.max(0, seite - 0.5) : 0.25 + 1.3 * vorn;
      if (v.y < grenze) { ps.setXYZ(i, ps.getX(i) * 0.9, ps.getY(i) * 0.9, ps.getZ(i) * 0.9); }
    }
    hg.computeVertexNormals();
  }
  const haar = teil(hg, 0, { material: toon(0xffffff, { map: haarTex }), umriss: 0.0025 });
  haar.scale.set(0.9 * 1.03, 1.18 * 1.025, 0.96 * 1.035);
  haar.position.set(0, 0.12, -0.002);
  kopf.add(haar);
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
  // Mund: dünne Lippen, leicht schiefes Lächeln (rechter Mundwinkel höher); die Standard-Lippe aus jonny.js ausblenden
  kopf.traverse((o) => { if (o.isMesh && o.geometry?.type === 'CapsuleGeometry' && o.material?.color?.getHex?.() === 0xc27c6c) o.visible = false; });
  {
    const pts = [[-0.032, 0.036], [-0.015, 0.031], [0.004, 0.031], [0.02, 0.034], [0.034, 0.042]].map(([x, y]) => new THREE.Vector3(x, y, 0.1655 - Math.abs(x) * 0.35));
    kopf.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.0024, 6, false), toon(0x7a3c36)));
    // Unterlippe als schmaler, heller Bogen
    const ul = pts.map((p) => new THREE.Vector3(p.x * 0.75, p.y - 0.008, p.z - 0.002));
    kopf.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ul), 16, 0.003, 6, false), toon(0xc98a7a)));
  }
  // Stoppeln: blond, an Kinn und über dem Mund (kein Vollbart)
  {
    const tex = leinwandTextur(256, 128, (g, b, h) => {
      // Dreitagebart: Oberlippe, ums Kinn, Kieferlinie bis zu den Ohren und die unteren Wangen; Lippen und Nase frei
      for (let i = 0; i < 16000; i++) {
        const u = rnd(), v = 0.18 + rnd() * 0.82;
        const mitte = Math.abs(u - 0.5);
        let dichte = 0;
        if (v > 0.28 && v < 0.42 && mitte < 0.16) dichte = 0.75;                 // Oberlippe
        if (v >= 0.42 && v < 0.55 && mitte < 0.09) dichte = 0;                   // Mund
        if (v >= 0.52) dichte = 0.8 * Math.min(1, (0.5 - mitte) / 0.12);         // Kinn, Kiefer bis hoch zu den Ohren
        if (v > 0.3 && v < 0.52 && mitte > 0.16) dichte = Math.max(dichte, 0.55 * Math.min(1, (v - 0.3) / 0.12) * Math.min(1, (0.5 - mitte) / 0.1)); // untere Wangen
        if (v < 0.28 && mitte < 0.13) dichte = 0;                                // Nase
        if (rnd() > dichte * 0.62) continue;
        g.fillStyle = rnd() < 0.6 ? 'rgba(176,140,86,0.95)' : 'rgba(140,108,66,0.9)';
        g.fillRect(u * b, v * h, 1.4, 1.4);
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
    links.schulter.rotation.set(0.08, 0, -0.16); links.ellbogen.rotation.set(-0.35, 0, 0.08);
    rechts.schulter.rotation.set(zange.visible ? -0.15 : 0.08, 0, 0.16); rechts.ellbogen.rotation.set(zange.visible ? -0.7 : -0.25, 0, -0.05);
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
  const fell = 0x1a1a1d, fellHell = 0x2c2c31, nase = 0x0b0b0c;
  const F = (geo, farbe = fell, u = 0.004) => teil(geo, farbe, { umriss: u });
  const lathe = (pts, seg = 16) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const wurzel = new THREE.Group();
  wurzel.scale.setScalar(0.95);
  scene.add(wurzel);
  const koerper = new THREE.Group();
  koerper.position.y = 0.4;
  wurzel.add(koerper);
  // Rumpf: tiefe Brust, schlanker Bauch (Taille), kräftige Hinterhand (Labrador)
  const rumpfG = lathe([[0.0, -0.3], [0.08, -0.29], [0.115, -0.24], [0.12, -0.15], [0.105, -0.04], [0.115, 0.06], [0.135, 0.16], [0.13, 0.24], [0.1, 0.3], [0.0, 0.32]], 20);
  const rumpf = F(rumpfG, fell, 0.006);
  rumpf.rotation.x = Math.PI / 2;
  rumpf.scale.set(0.9, 1, 1.05);
  koerper.add(rumpf);
  // Brust tiefer als der Bauch
  const brust = F(new THREE.SphereGeometry(0.12, 16, 12), fell, false);
  brust.scale.set(0.85, 1.05, 1); brust.position.set(0, -0.04, 0.18);
  koerper.add(brust);
  // Hals (leicht nach oben) und Kopf
  const hals = F(lathe([[0.085, 0], [0.08, 0.06], [0.07, 0.14], [0.065, 0.17]], 14), fell, 0.004);
  hals.position.set(0, 0.04, 0.26); hals.rotation.x = 0.75;
  koerper.add(hals);
  const kopf = new THREE.Group();
  kopf.position.set(0, 0.16, 0.37);
  koerper.add(kopf);
  const schaedel = F(new THREE.SphereGeometry(0.09, 18, 14), fell, 0.005);
  schaedel.scale.set(0.95, 0.88, 1.05);
  kopf.add(schaedel);
  // breite Labrador-Schnauze mit Stop, Lefzen hängen etwas
  const schnauze = F(new THREE.CylinderGeometry(0.045, 0.058, 0.11, 14), fell, 0.004);
  schnauze.rotation.x = Math.PI / 2; schnauze.position.set(0, -0.03, 0.1); schnauze.scale.set(1.05, 1, 0.9);
  kopf.add(schnauze);
  for (const sx of [-1, 1]) {
    const lefze = F(new THREE.SphereGeometry(0.03, 10, 8), fell, false);
    lefze.scale.set(0.8, 1, 1.4); lefze.position.set(sx * 0.03, -0.055, 0.12);
    kopf.add(lefze);
  }
  kopf.add(setze(F(new THREE.SphereGeometry(0.024, 12, 10), nase, false), 0, -0.012, 0.158));
  for (const sx of [-1, 1]) kopf.add(setze(kugel(0.006, 0x2a2a2a, { umriss: false }, 6), sx * 0.01, -0.012, 0.18));
  // Augen: braun mit Glanzpunkt, Brauen-Wulst
  for (const sx of [-1, 1]) {
    kopf.add(setze(kugel(0.015, 0x3d2516, { umriss: false }, 10), sx * 0.04, 0.02, 0.07));
    kopf.add(setze(kugel(0.005, 0xf4f4f4, { umriss: false }, 6), sx * 0.043, 0.026, 0.083));
    const wulst = F(new THREE.SphereGeometry(0.022, 10, 8), fell, false);
    wulst.scale.set(1.2, 0.5, 0.8); wulst.position.set(sx * 0.04, 0.038, 0.065);
    kopf.add(wulst);
  }
  // Schlappohren: dreieckig, hängen seitlich runter, wackeln beim Laufen
  const ohren = [];
  for (const sx of [-1, 1]) {
    const piv = new THREE.Group();
    piv.position.set(sx * 0.072, 0.045, -0.01);
    const o = F(new THREE.SphereGeometry(0.05, 12, 10), fellHell, 0.003);
    o.scale.set(0.3, 1.15, 0.85); o.position.set(sx * 0.012, -0.05, 0.0); o.rotation.z = sx * 0.15;
    piv.add(o);
    kopf.add(piv);
    ohren.push(piv);
  }
  const zunge = teil(new THREE.CapsuleGeometry(0.02, 0.035, 4, 8), 0xd8607a, { umriss: false });
  zunge.scale.set(1, 1, 0.3); zunge.position.set(0, -0.075, 0.13); zunge.rotation.x = 0.35;
  kopf.add(zunge);
  // rotes Halsband mit Marke
  const band = teil(new THREE.TorusGeometry(0.074, 0.011, 6, 20), 0xc8352a, { umriss: false });
  band.position.set(0, 0.1, 0.31); band.rotation.x = Math.PI / 2 - 0.75;
  koerper.add(band);
  koerper.add(setze(zylinder(0.012, 0.012, 0.004, 0xd7b25c, { umriss: false }, 10), 0, 0.03, 0.36, Math.PI / 2 - 0.4, 0, 0));
  // Beine mit Gelenken: Schulter/Hüfte -> Ellbogen/Knie -> Pfote; hinten mit Sprunggelenk (abgewinkelt)
  const beine = [];
  const bein = (x, z, hinten) => {
    const oben = new THREE.Group();
    oben.position.set(x, -0.02, z);
    // Oberarm/Oberschenkel: kräftig, oben dicker (hinten: Keule)
    oben.add(setze(F(lathe([[0.03, -0.16], [0.04, -0.1], [hinten ? 0.06 : 0.05, -0.03], [hinten ? 0.065 : 0.055, 0.02]], 12), fell, 0.003), 0, 0, 0));
    const unten = new THREE.Group();
    unten.position.y = -0.16;
    oben.add(unten);
    unten.add(F(new THREE.SphereGeometry(0.031, 10, 8), fell, false));
    unten.add(setze(F(lathe([[0.022, -0.16], [0.025, -0.1], [0.03, 0]], 10), fell, 0.003), 0, 0, 0));
    // Pfote mit Zehenballen
    const pfote = new THREE.Group();
    pfote.position.y = -0.17;
    unten.add(pfote);
    const p = F(new THREE.SphereGeometry(0.033, 12, 8), fell, 0.003);
    p.scale.set(1, 0.55, 1.3); p.position.set(0, -0.005, 0.015);
    pfote.add(p);
    for (const zx of [-0.016, -0.005, 0.006, 0.017]) pfote.add(setze(kugel(0.01, fellHell, { umriss: false }, 6), zx, -0.006, 0.048));
    // Grundhaltung: hinten Knie nach hinten und Sprunggelenk nach vorn (Hundebein), vorne fast gerade
    const ruheO = hinten ? 0.35 : -0.08, ruheU = hinten ? -0.55 : 0.12;
    oben.rotation.x = ruheO; unten.rotation.x = ruheU; pfote.rotation.x = -(ruheO + ruheU);
    koerper.add(oben);
    beine.push({ oben, unten, pfote, ruheO, ruheU, hinten });
  };
  bein(-0.07, 0.2, false); bein(0.07, 0.2, false); bein(-0.075, -0.2, true); bein(0.075, -0.2, true);
  // Rute: dick am Ansatz (Otterrute), läuft spitz zu, in drei Gliedern (schwingt weich)
  const rute = new THREE.Group();
  rute.position.set(0, 0.06, -0.3);
  koerper.add(rute);
  const ruteGlieder = [];
  let elt = rute;
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    if (i) g.position.y = 0.085;
    g.add(setze(F(new THREE.CapsuleGeometry(0.028 - i * 0.007, 0.06, 4, 8), fell, 0.003), 0, 0.04, 0));
    elt.add(g);
    ruteGlieder.push(g);
    elt = g;
  }
  rute.rotation.x = -2.0;

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
      // Gangart: diagonal (vorne links mit hinten rechts), Knie beugen sich beim Vorschwingen, Pfoten bleiben parallel zum Boden
      beine.forEach((b, i) => {
        const ph = schritt + (i === 0 || i === 3 ? 0 : Math.PI);
        const sw = geht ? Math.sin(ph) * 0.45 : 0;
        const beug = geht ? Math.max(0, Math.cos(ph)) * 0.6 : 0;
        b.oben.rotation.x = b.ruheO + sw;
        b.unten.rotation.x = b.ruheU + (b.hinten ? -beug : beug);
        b.pfote.rotation.x = -(b.oben.rotation.x + b.unten.rotation.x);
      });
      koerper.position.y = 0.4 + (geht ? Math.abs(Math.sin(schritt)) * 0.015 : Math.sin(zeit * 2) * 0.003);
      koerper.rotation.z = geht ? Math.sin(schritt) * 0.03 : 0;
      // Rute wedelt weich (Glieder versetzt)
      ruteGlieder.forEach((g, i) => { g.rotation.z = Math.sin(zeit * (geht ? 9 : 12) - i * 0.8) * (0.35 + i * 0.12); });
      ohren.forEach((o, i) => { o.rotation.x = geht ? Math.sin(schritt * 2 + i) * 0.15 : 0; });
      kopf.rotation.x = geht ? 0.12 : Math.sin(zeit * 0.7) * 0.06;
      zunge.visible = geht || Math.sin(zeit * 0.3) > 0;
      // hecheln
      rumpf.scale.x = 0.9 + Math.sin(zeit * 9) * 0.01;
    },
  };
  return api;
}
