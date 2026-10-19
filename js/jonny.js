// Jonny als Comic-Figur (nach Fotos vom Betreiber): etwa so groß wie Dennis, etwas breiter, lange braune Haare,
// Vollbart, olivgrüne Cap verkehrt herum, runde goldene Brille, Nasenring, weißes Shirt mit offenem Kragen und
// haariger Brust, hellbraune Zimmermannsweste (Cord, Perlmuttknöpfe), sehr kurze schwarze Arbeitshose mit Zollstock
// und Stift in der Seitentasche, weiße Socken, grüne Sneaker mit drei weißen Streifen, goldener Ring.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur } from './toon.js';

const HAUT = 0xeebda0;
const HAAR = 0x5a3a22;
const BART = 0x4e321d;
const CAP = 0x7d8a5c;
const SHIRT = 0xf4f2ec;
const WESTE = 0xb98d5c;
const HOSE = 0x1f2024;
const SCHUH = 0x2f7d4f;
const GOLD = 0xd7b25c;
// Wo Jonny rumsteht: an der Tor-Ecke (raucht dort, obwohl das Schild hängt)
const PLATZ = new THREE.Vector3(0.45, 0, 3.2);

export function baueJonny(scene) {
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
  const becken = teil(new THREE.CapsuleGeometry(0.135, 0.12, 6, 12), HOSE);
  becken.rotation.z = Math.PI / 2;
  becken.scale.set(1, 1, 0.78);
  becken.position.y = 0.9;
  koerper.add(becken);
  const beine = [];
  for (const x of [-0.11, 0.11]) {
    const huefte = new THREE.Group();
    huefte.position.set(x, 0.88, 0);
    // kurzes Hosenbein (endet weit über dem Knie)
    huefte.add(setze(teil(new THREE.CylinderGeometry(0.108, 0.118, 0.17, 14), HOSE), 0, -0.07, 0));
    huefte.add(setze(zylinder(0.12, 0.12, 0.012, 0x141518, { umriss: false }, 14), 0, -0.155, 0));
    // nackter Oberschenkel, Knie, Wade (leicht behaart)
    huefte.add(setze(teil(new THREE.CapsuleGeometry(0.085, 0.2, 4, 12), HAUT), 0, -0.27, 0));
    const k = new THREE.Group();
    k.position.y = -0.42;
    k.add(teil(new THREE.SphereGeometry(0.08, 12, 10), HAUT));
    k.add(setze(teil(new THREE.CapsuleGeometry(0.072, 0.22, 4, 12), HAUT), 0, -0.17, 0));
    // weiße Tennissocke mit Bündchen
    k.add(setze(zylinder(0.06, 0.058, 0.12, 0xf7f7f4, { umriss: 0.003 }, 14), 0, -0.34, 0));
    k.add(setze(zylinder(0.062, 0.062, 0.02, 0xe4e4df, { umriss: false }, 14), 0, -0.29, 0));
    // grüner Sneaker: Sohle weiß, drei weiße Streifen, Schnürung
    const schuh = new THREE.Group();
    schuh.position.y = -0.43;
    const oben = teil(new THREE.CapsuleGeometry(0.058, 0.16, 4, 12), SCHUH, { umriss: 0.004 });
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
  // Gürtel
  const guertel = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.035, 20, 1, true), toon(0x2a2018));
  guertel.scale.set(1, 1, 0.8);
  guertel.position.y = 0.97;
  koerper.add(guertel);

  // ---------- Oberkörper: weißes Shirt, hellbraune Cordweste mit Knöpfen ----------
  const rumpf = new THREE.Group();
  rumpf.position.y = 0.92;
  koerper.add(rumpf);
  const shirt = teil(new THREE.CapsuleGeometry(0.225, 0.38, 6, 14), SHIRT);
  shirt.position.y = 0.36;
  shirt.scale.set(1.05, 1, 0.78);
  rumpf.add(shirt);
  const schultern = teil(new THREE.SphereGeometry(0.22, 16, 10), SHIRT);
  schultern.scale.set(1.38, 0.52, 0.8);
  schultern.position.y = 0.68;
  rumpf.add(schultern);
  // offener Kragen mit Brusthaar
  const brustTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#eebda0'; g.fillRect(0, 0, 64, 64);
    g.strokeStyle = '#4e321d'; g.lineWidth = 1.5;
    const r = (() => { let s = 5; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();
    for (let i = 0; i < 90; i++) { const x = 6 + r() * 52, y = 10 + r() * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y - 3, x + (r() - 0.5) * 6, y - 6); g.stroke(); }
  });
  const ausschnitt = new THREE.Mesh(new THREE.CircleGeometry(0.075, 3), new THREE.MeshBasicMaterial({ map: brustTex }));
  ausschnitt.rotation.z = -Math.PI / 2;
  ausschnitt.scale.set(1, 0.9, 1);
  ausschnitt.position.set(0, 0.69, 0.178);
  rumpf.add(ausschnitt);
  // Weste: zwei Vorderteile mit Lücke in der Mitte, Rückenteil, Cord-Rillen, Knöpfe
  const cordTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#b98d5c'; g.fillRect(0, 0, 64, 64);
    for (let x = 0; x < 64; x += 4) { g.fillStyle = 'rgba(90,60,30,0.35)'; g.fillRect(x, 0, 1.5, 64); }
  }, [3, 3]);
  const westeMat = toon(0xffffff, { map: cordTex });
  for (const s of [-1, 1]) {
    const teilWeste = teil(new THREE.CapsuleGeometry(0.2, 0.34, 6, 12, 1), 0, { material: westeMat, umriss: 0.004 });
    teilWeste.scale.set(0.62, 1, 0.82);
    teilWeste.position.set(s * 0.115, 0.36, 0.01);
    rumpf.add(teilWeste);
    for (let i = 0; i < 4; i++) rumpf.add(setze(zylinder(0.012, 0.012, 0.006, 0xf2efe6, { umriss: 0.0015 }, 10), s * 0.055, 0.22 + i * 0.075, 0.176, Math.PI / 2, 0, 0));
    // Revers
    rumpf.add(setze(quader(0.05, 0.22, 0.02, WESTE, { umriss: 0.003 }), s * 0.085, 0.58, 0.16, 0, 0, s * -0.25));
  }
  // Aufnäher an der Weste
  const patchTex = leinwandTextur(64, 64, (g) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#111'; g.beginPath(); g.moveTo(10, 50); g.lineTo(24, 18); g.lineTo(32, 34); g.lineTo(40, 14); g.lineTo(54, 50); g.fill(); });
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.06), new THREE.MeshBasicMaterial({ map: patchTex }));
  patch.position.set(-0.13, 0.42, 0.172);
  patch.rotation.y = -0.25;
  rumpf.add(patch);

  // ---------- Arme: Hemdsärmel, Hände; Arme verschränkt wie auf dem Foto ----------
  function arm(seite) {
    const schulter = new THREE.Group();
    schulter.position.set(0.29 * seite, 0.66, 0);
    schulter.add(kugel(0.07, SHIRT, { umriss: 0.004 }, 10));
    schulter.add(setze(teil(new THREE.CapsuleGeometry(0.066, 0.2, 4, 10), SHIRT), 0, -0.13, 0));
    const ellbogen = new THREE.Group();
    ellbogen.position.y = -0.27;
    ellbogen.add(kugel(0.06, SHIRT, { umriss: 0.004 }, 10));
    ellbogen.add(setze(teil(new THREE.CapsuleGeometry(0.058, 0.17, 4, 10), SHIRT), 0, -0.12, 0));
    const hand = new THREE.Group();
    const flaeche = teil(new THREE.CapsuleGeometry(0.04, 0.03, 4, 10), HAUT);
    flaeche.scale.set(1.15, 1, 0.65);
    hand.add(flaeche);
    for (let f = 0; f < 4; f++) {
      const finger = teil(new THREE.CapsuleGeometry(0.012, 0.035, 4, 6), HAUT, { umriss: 0.002 });
      finger.position.set((-0.027 + f * 0.018) * seite, -0.05, 0.006);
      hand.add(finger);
    }
    // goldener Ring rechts
    if (seite > 0) hand.add(setze(teil(new THREE.TorusGeometry(0.014, 0.004, 6, 12), GOLD, { umriss: false }), 0.009, -0.045, 0.006, Math.PI / 2, 0, 0));
    hand.position.y = -0.26;
    ellbogen.add(hand);
    schulter.add(ellbogen);
    rumpf.add(schulter);
    return { schulter, ellbogen, hand };
  }
  const links = arm(-1);
  const rechts = arm(1);
  function armeVerschraenkt() {
    for (const [a, s] of [[links, -1], [rechts, 1]]) {
      a.schulter.rotation.set(-0.35, 0, s * 0.18);
      a.ellbogen.rotation.set(-1.75, 0, s * -1.2);
    }
  }
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
  const rauch = [0, 1, 2].map((i) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: rauchTex, transparent: true, depthWrite: false })); sp.visible = false; sp.userData.t = i / 3; scene.add(sp); return sp; });

  // ---------- Kopf: breites Gesicht, Vollbart, runde Brille, Nasenring, lange Haare, Cap verkehrt herum ----------
  const kopf = new THREE.Group();
  kopf.position.y = 0.95;
  rumpf.add(kopf);
  rumpf.add(setze(zylinder(0.065, 0.07, 0.12, HAUT, { umriss: 0.004 }), 0, 0.88, 0));
  const schaedel = teil(new THREE.SphereGeometry(0.165, 22, 18), HAUT);
  schaedel.scale.set(0.98, 1.12, 0.98);
  schaedel.position.y = 0.12;
  kopf.add(schaedel);
  for (const x of [-0.16, 0.16]) kopf.add(setze(teil(new THREE.SphereGeometry(0.036, 10, 8), HAUT), x, 0.1, -0.01));
  const nase = teil(new THREE.SphereGeometry(0.032, 12, 10), HAUT);
  nase.position.set(0, 0.1, 0.162);
  nase.scale.set(0.9, 1.1, 1.0);
  kopf.add(nase);
  // Nasenring (links)
  kopf.add(setze(teil(new THREE.TorusGeometry(0.011, 0.0025, 6, 14), 0xc9cdd2, { umriss: false }), -0.022, 0.075, 0.172, 0, 0.5, 0));
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
  for (const x of [-0.062, 0.062]) kopf.add(setze(quader(0.066, 0.02, 0.024, BART, { umriss: false }), x, 0.2, 0.148));
  // Vollbart: Wangen und Kinn, Schnurrbart
  const bartGeo = new THREE.SphereGeometry(0.15, 18, 14, -Math.PI * 0.2, Math.PI * 1.4, Math.PI * 0.5, Math.PI * 0.38);
  const bart = teil(bartGeo, BART, { umriss: 0.004 });
  bart.scale.set(1.05, 1.1, 1.08);
  bart.position.set(0, 0.06, 0.012);
  kopf.add(bart);
  const kinnBart = teil(new THREE.SphereGeometry(0.085, 14, 10), BART, { umriss: 0.004 });
  kinnBart.scale.set(1.2, 1.0, 0.95);
  kinnBart.position.set(0, -0.03, 0.08);
  kopf.add(kinnBart);
  const schnurrbart = teil(new THREE.CapsuleGeometry(0.018, 0.06, 4, 8), BART, { umriss: 0.003 });
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
  const goldMat = toon(GOLD);
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
  kopf.add(brille);
  // lange braune Haare: hinten und an den Seiten bis zur Schulter (Strähnen)
  const haarMat = toon(HAAR);
  const hinten = teil(new THREE.CapsuleGeometry(0.15, 0.16, 6, 14), 0, { material: haarMat, umriss: 0.004 });
  hinten.scale.set(1.12, 1, 0.6);
  hinten.position.set(0, 0.02, -0.085);
  kopf.add(hinten);
  for (let i = 0; i < 14; i++) {
    const w = -1.6 + (i / 13) * 3.2;
    const straehne = teil(new THREE.CapsuleGeometry(0.022, 0.2 + zufall() * 0.06, 4, 6), 0, { material: haarMat, umriss: 0.002 });
    straehne.position.set(Math.sin(w) * 0.16, -0.02, -Math.cos(w) * 0.12 - 0.02);
    straehne.rotation.set(-0.15, 0, Math.sin(w) * 0.25);
    kopf.add(straehne);
  }
  // olivgrüne Cap verkehrt herum (Schirm hinten), mit Verschluss
  const cap = new THREE.Group();
  const kuppel = teil(new THREE.SphereGeometry(0.172, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), CAP, { umriss: 0.004 });
  kuppel.scale.set(1.02, 0.78, 1.02);
  cap.add(kuppel);
  const schirm = teil(new THREE.CylinderGeometry(0.15, 0.15, 0.014, 20, 1, false, Math.PI * 0.75, Math.PI * 0.5), CAP, { umriss: 0.003 });
  schirm.scale.set(1, 1, 1.15);
  schirm.position.set(0, 0.0, -0.06);
  schirm.rotation.x = 0.18;
  cap.add(schirm);
  cap.add(setze(kugel(0.014, CAP, { umriss: 0.002 }, 8), 0, 0.135, 0));
  cap.add(setze(quader(0.05, 0.012, 0.008, 0x5d6340, { umriss: false }), 0, 0.03, -0.172));
  cap.position.set(0, 0.2, -0.005);
  cap.rotation.x = -0.12;
  kopf.add(cap);

  // ---------- Verhalten ----------
  let zeit = Math.random() * 10;
  let blinzeln = 3;
  let raucht = false;
  let blickZiel = null;
  const api = {
    wurzel,
    get position() { return wurzel.position; },
    kopfPosition() { const v = new THREE.Vector3(); kopf.getWorldPosition(v); v.y += 0.12; return v; },
    rauchen(an) {
      raucht = an;
      kippe.visible = an;
      for (const r of rauch) r.visible = an;
      if (an) {
        rechts.schulter.rotation.set(-0.2, 0, 0.15);
        rechts.ellbogen.rotation.set(-1.9, 0, -0.5);
      } else armeVerschraenkt();
    },
    schauZu(punkt) { blickZiel = punkt; },
    update(dt) {
      zeit += dt;
      // atmen, leicht wippen
      rumpf.scale.y = 1 + Math.sin(zeit * 1.6) * 0.008;
      koerper.rotation.y = Math.sin(zeit * 0.4) * 0.04;
      // Kopf zum Spieler drehen (begrenzt)
      if (blickZiel) {
        const lokal = wurzel.worldToLocal(blickZiel.clone());
        const ziel = THREE.MathUtils.clamp(Math.atan2(lokal.x, lokal.z), -0.9, 0.9);
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
        const p = new THREE.Vector3();
        kopf.getWorldPosition(p);
        for (const r of rauch) {
          r.userData.t = (r.userData.t + dt * 0.35) % 1;
          const t = r.userData.t;
          r.position.set(p.x + Math.sin(zeit + t * 5) * 0.05, p.y + 0.05 + t * 0.6, p.z + 0.1);
          r.scale.setScalar(0.06 + t * 0.2);
          r.material.opacity = (1 - t) * 0.6;
        }
      }
    },
  };
  return api;
}
