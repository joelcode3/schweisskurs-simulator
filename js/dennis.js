// Dennis als Comic-Figur in der Werkstatt: steht in der Kaffeeecke, guckt zu, kommt rüber.
import * as THREE from 'three';
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

export function baueDennis(scene) {
  const wurzel = new THREE.Group();
  wurzel.position.copy(HEIM);
  wurzel.scale.setScalar(0.93);
  scene.add(wurzel);
  const zufall = (() => { let s = 7; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();

  // Beine: schwarze Arbeitshose, Arbeitsschuhe
  const beine = [];
  for (const x of [-0.1, 0.1]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.9, 0);
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.074, 0.64, 4, 10), HOSE), 0, -0.42, 0));
    huefte.add(setze(quader(0.13, 0.1, 0.27, 0x4a4038), 0, -0.86, 0.05));
    wurzel.add(huefte);
    beine.push(huefte);
  }

  // Oberkörper: schwarze Arbeitsjacke mit Reflexstreifen, graue Kapuze
  const rumpf = new THREE.Group();
  rumpf.position.y = 0.9;
  wurzel.add(rumpf);
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
  // Kapuze vom Hoodie im Nacken und Kordeln
  const kapuze = teil(new THREE.TorusGeometry(0.12, 0.055, 8, 18), HOODIE);
  kapuze.position.set(0, 0.8, -0.04);
  kapuze.rotation.x = Math.PI / 2 - 0.25;
  rumpf.add(kapuze);
  for (const x of [-0.045, 0.045]) rumpf.add(setze(zylinder(0.007, 0.007, 0.2, 0xb9bcc0, { umriss: false }, 6), x, 0.66, 0.16));
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

  // Der blaue Rucksack (immer dabei)
  const rucksack = new THREE.Group();
  rucksack.add(teil(new THREE.CapsuleGeometry(0.15, 0.2, 6, 12), RUCKSACK));
  rucksack.children[0].scale.set(1.1, 1, 0.55);
  const tasche = teil(new THREE.CapsuleGeometry(0.11, 0.08, 6, 12), 0x5a8fe2);
  tasche.scale.set(1.05, 1, 0.4);
  tasche.position.set(0, -0.08, -0.07);
  rucksack.add(tasche);
  const zipMat = new THREE.MeshBasicMaterial({ color: 0xf2f4f7 });
  const zip1 = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.005, 4, 24, Math.PI), zipMat);
  zip1.position.set(0, 0.05, -0.085);
  rucksack.add(zip1);
  const zip2 = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.005, 4, 20, Math.PI), zipMat);
  zip2.position.set(0, -0.06, -0.115);
  rucksack.add(zip2);
  rucksack.add(setze(quader(0.05, 0.02, 0.005, 0xffffff, { umriss: false }), 0.06, -0.16, -0.112));
  rucksack.add(setze(teil(new THREE.TorusGeometry(0.035, 0.01, 6, 12, Math.PI), 0x1d3f86), 0, 0.27, 0));
  rucksack.position.set(0, 0.42, -0.22);
  rumpf.add(rucksack);
  for (const x of [-0.12, 0.12]) {
    rumpf.add(setze(quader(0.05, 0.02, 0.3, 0x1d3f86, { umriss: 0.004 }), x, 0.75, -0.02, 0.15, 0, 0));
    rumpf.add(setze(quader(0.05, 0.3, 0.02, 0x1d3f86, { umriss: 0.004 }), x, 0.58, 0.145, -0.1, 0, 0));
  }

  // Arme
  function arm(seite) {
    const schulter = new THREE.Group();
    schulter.position.set(0.27 * seite, 0.7, 0);
    schulter.add(setze(teil(new THREE.CapsuleGeometry(0.06, 0.42, 4, 10), JACKE), 0, -0.25, 0));
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.02, 12, 1, true), reflexMat);
    ring.position.y = -0.12;
    schulter.add(ring);
    const hand = kugel(0.06, HAUT);
    hand.position.y = -0.52;
    schulter.add(hand);
    rumpf.add(schulter);
    return { schulter, hand };
  }
  const links = arm(-1);
  const rechts = arm(1);
  links.schulter.rotation.z = -0.1;
  rechts.schulter.rotation.z = 0.1;

  // Kaffeebecher in der rechten Hand
  const becher = new THREE.Group();
  becher.add(zylinder(0.045, 0.04, 0.1, 0xf4f0e6, {}, 14));
  becher.add(setze(teil(new THREE.TorusGeometry(0.026, 0.008, 6, 12), 0xf4f0e6), 0.05, 0, 0));
  becher.position.set(0, -0.56, 0.08);
  rechts.schulter.add(becher);

  // Kopf: schmal, Schnauzer, goldene Pilotenbrille, Locken
  const kopf = new THREE.Group();
  kopf.position.y = 0.98;
  rumpf.add(kopf);
  rumpf.add(setze(zylinder(0.06, 0.07, 0.1, HAUT, { umriss: 0.005 }), 0, 0.92, 0.0));
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
    const b = quader(0.06, 0.013, 0.02, 0xb07a40, { umriss: false });
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
  // ---------- Verhalten ----------
  let blickZiel = null;
  let ziel = null;
  let zielAufloesen = null;
  let tempo = 1.3;
  let stimmung = 'ruhig';
  let zeit = Math.random() * 10;
  let schluckTimer = 4;
  let schluck = 0;
  let schrittPhase = 0;
  const hautFarbe = new THREE.Color(HAUT);
  const zielFarbe = new THREE.Color(HAUT);

  function winkelDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  const api = {
    wurzel,
    get position() { return wurzel.position; },
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
    gehZu(x, z, schnell = 1.3) {
      tempo = schnell;
      ziel = new THREE.Vector3(x, 0, z);
      return new Promise((res) => { zielAufloesen = res; });
    },
    // Falls das Laufen zu lange dauert (langsames Gerät): direkt hinstellen
    springZu(x, z) {
      wurzel.position.set(x, 0, z);
      ziel = null;
      const r = zielAufloesen;
      zielAufloesen = null;
      if (r) r();
    },
    heim() {
      return api.gehZu(HEIM.x, HEIM.z, 1.2).then(() => {
        wurzel.rotation.y = Math.atan2(-HEIM.x * 0.6, -HEIM.z - 1);
      });
    },
    istDaheim() {
      return wurzel.position.distanceTo(HEIM) < 0.2 && !ziel;
    },
    update(dt) {
      zeit += dt;
      // Laufen
      let laeuft = false;
      if (ziel) {
        const d = new THREE.Vector3().subVectors(ziel, wurzel.position);
        d.y = 0;
        const dist = d.length();
        if (dist < 0.05) {
          ziel = null;
          const r = zielAufloesen;
          zielAufloesen = null;
          if (r) r();
        } else {
          laeuft = true;
          const schritt = Math.min(dist, tempo * dt);
          d.normalize();
          wurzel.position.addScaledVector(d, schritt);
          const soll = Math.atan2(d.x, d.z);
          wurzel.rotation.y += winkelDiff(soll, wurzel.rotation.y) * Math.min(1, dt * 10);
        }
      }
      if (laeuft) {
        schrittPhase += dt * tempo * 6.5;
        const s = Math.sin(schrittPhase);
        beine[0].rotation.x = s * 0.55;
        beine[1].rotation.x = -s * 0.55;
        rumpf.position.y = 0.9 + Math.abs(Math.cos(schrittPhase)) * 0.04;
      } else {
        beine[0].rotation.x *= 0.8;
        beine[1].rotation.x *= 0.8;
        rumpf.position.y = 0.9 + Math.sin(zeit * 1.8) * 0.006;
      }

      // Kopf zum Blickziel drehen
      let kopfSoll = 0;
      let kopfNick = 0;
      if (blickZiel) {
        const kp = api.kopfPosition();
        const dx = blickZiel.x - wurzel.position.x;
        const dz = blickZiel.z - wurzel.position.z;
        const welt = Math.atan2(dx, dz);
        const rel = winkelDiff(welt, wurzel.rotation.y);
        kopfSoll = THREE.MathUtils.clamp(rel, -1.1, 1.1);
        // Körper mitdrehen, wenn der Kopf nicht reicht
        if (!laeuft && Math.abs(rel) > 1.0) wurzel.rotation.y += Math.sign(rel) * Math.min(Math.abs(rel) - 1.0, dt * 2.5);
        const horiz = Math.hypot(dx, dz);
        kopfNick = THREE.MathUtils.clamp(-Math.atan2(blickZiel.y - kp.y, horiz), -0.4, 0.4);
      }
      kopf.rotation.y += (kopfSoll - kopf.rotation.y) * Math.min(1, dt * 6);
      kopf.rotation.x += (kopfNick - kopf.rotation.x) * Math.min(1, dt * 6);

      // Arme und Kaffee
      const wuetend = stimmung === 'wut';
      becher.visible = !wuetend;
      if (wuetend) {
        const z = Math.sin(zeit * 18) * 0.15;
        links.schulter.rotation.set(-2.4 + z, 0, -0.3);
        rechts.schulter.rotation.set(-2.4 - z, 0, 0.3);
      } else if (stimmung === 'sauer') {
        links.schulter.rotation.set(-0.3, 0, -0.35);
        rechts.schulter.rotation.set(-1.3 + Math.sin(zeit * 9) * 0.35, 0, 0.25);
      } else {
        const schwing = laeuft ? Math.sin(schrittPhase) * 0.45 : 0;
        links.schulter.rotation.set(-schwing, 0, -0.12);
        // Schluck Kaffee ab und zu
        schluckTimer -= dt;
        if (!laeuft && schluckTimer < 0) {
          schluck = 2.2;
          schluckTimer = 6 + Math.random() * 6;
        }
        schluck = Math.max(0, schluck - dt);
        const heben = schluck > 0 ? Math.sin((schluck / 2.2) * Math.PI) : 0;
        rechts.schulter.rotation.set(-0.5 - heben * 1.9 + schwing, heben * 0.4, 0.12 - heben * 0.25);
      }

      // Gesicht
      const brauWinkel = { ruhig: 0, skeptisch: 0.25, sauer: 0.45, wut: 0.6, froh: -0.2 }[stimmung] ?? 0;
      brauen[0].rotation.z = -brauWinkel;
      brauen[1].rotation.z = brauWinkel;
      brauen[0].position.y = brauen[1].position.y = 0.205 - Math.abs(brauWinkel) * 0.02 + (stimmung === 'froh' ? 0.01 : 0);
      if (stimmung === 'skeptisch') brauen[1].position.y += 0.015;
      const mundAuf = wuetend ? 0.03 + Math.abs(Math.sin(zeit * 14)) * 0.035 : stimmung === 'sauer' ? 0.02 + Math.abs(Math.sin(zeit * 10)) * 0.02 : 0.014;
      mund.scale.set(stimmung === 'froh' ? 1.3 : 1, mundAuf / 0.014, 1);
      hautFarbe.lerp(zielFarbe, Math.min(1, dt * 4));
      for (const m of hautMats) m.color.copy(hautFarbe);
      kopf.position.x = wuetend ? Math.sin(zeit * 40) * 0.008 : 0;
    },
  };
  api.stimmung('ruhig');
  wurzel.rotation.y = Math.atan2(3.55 * 0.6, -2.55 - 1);
  return api;
}
