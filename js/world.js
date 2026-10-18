// Die Werkstatt: Raum, Möbel, Werkzeuge, Gasflasche.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall, umriss } from './toon.js';

export const RAUM = { xMin: -5, xMax: 5, zMin: -4, zMax: 4, hoehe: 3.2 };
export const AUGENHOEHE = 1.65;

// Stationen: Kameraposition und Blickziel
export const STATIONEN = {
  eingang:  { name: 'Eingang',     pos: [0, AUGENHOEHE, 3.0],    blick: [0, 1.1, -2] },
  regal:    { name: 'Regal',       pos: [-3.1, AUGENHOEHE, -0.6], blick: [-4.7, 1.15, -0.6] },
  wasch:    { name: 'Waschplatz',  pos: [2.9, AUGENHOEHE, 1.6],   blick: [4.6, 0.75, 1.6] },
  werkbank: { name: 'Werkbank',    pos: [0, AUGENHOEHE, -0.8],    blick: [0, 1.0, -2.9] },
  schweiss: { name: 'Schweißplatz', pos: [3.0, AUGENHOEHE, -1.1],  blick: [3.1, 0.92, -3.0] },
};

const FARBE = {
  holz: 0xb27a42,
  holzDunkel: 0x7a4f2a,
  stahl: 0x5f666e,
  stahlHell: 0x9aa3ab,
  stahlDunkel: 0x34383e,
  gelb: 0xf2b51c,
  rot: 0xc8352a,
  flasche: 0xc23a2e,
  messing: 0xc9a13b,
  gruen: 0x2f7d4f,
  blau: 0x2f5fa8,
  schwarz: 0x1d1d1f,
  leder: 0xa8743d,
};

export const NAHT = { schlacke: 0x5a524a, sauber: 0xb4bac0, frisch: 0xff9a3a };

export function baueWelt(scene) {
  const interaktiv = [];
  const hindernisse = [];
  const objekte = {};
  const animiert = [];

  function merke(obj, id, name, station) {
    obj.userData.interaktiv = { id, name, station };
    interaktiv.push(obj);
    return obj;
  }
  function hindernis(xMin, xMax, zMin, zMax) {
    hindernisse.push({ xMin, xMax, zMin, zMax });
  }

  // ---------- Licht ----------
  scene.background = new THREE.Color(0x2a2620);
  const himmel = new THREE.HemisphereLight(0xfff2dc, 0x4a4238, 1.6);
  scene.add(himmel);
  const sonne = new THREE.DirectionalLight(0xfff0d0, 2.2);
  sonne.position.set(-6, 7, 3);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(1024, 1024);
  sonne.shadow.camera.left = -7;
  sonne.shadow.camera.right = 7;
  sonne.shadow.camera.top = 6;
  sonne.shadow.camera.bottom = -6;
  sonne.shadow.camera.near = 1;
  sonne.shadow.camera.far = 20;
  sonne.shadow.bias = -0.0015;
  scene.add(sonne);
  const fuell = new THREE.PointLight(0xffe2b0, 6, 9, 1.6);
  fuell.position.set(1.5, 2.8, -1.5);
  scene.add(fuell);

  // ---------- Raum ----------
  const boden = leinwandTextur(512, 512, (g, b, h) => {
    g.fillStyle = '#8c8880';
    g.fillRect(0, 0, b, h);
    const r = zufall(7);
    for (let i = 0; i < 2600; i++) {
      const v = 110 + r() * 60;
      g.fillStyle = `rgba(${v},${v - 4},${v - 10},0.25)`;
      g.fillRect(r() * b, r() * h, 2 + r() * 3, 2 + r() * 3);
    }
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(40,34,28,${0.08 + r() * 0.12})`;
      g.beginPath();
      g.ellipse(r() * b, r() * h, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = 'rgba(40,36,30,0.35)';
    g.lineWidth = 3;
    g.strokeRect(0, 0, b, h);
  }, [5, 4]);
  const bodenMesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), toon(0xffffff, { map: boden }));
  bodenMesh.rotation.x = -Math.PI / 2;
  bodenMesh.receiveShadow = true;
  scene.add(bodenMesh);

  // gelbe Sicherheitsmarkierung um den Schweißplatz
  const markierung = leinwandTextur(64, 64, (g) => {
    for (let i = -64; i < 128; i += 16) {
      g.fillStyle = '#f2c21c';
      g.beginPath();
      g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 8 + 64, 64); g.lineTo(i + 64, 64);
      g.fill();
    }
  }, [12, 1]);
  const markMat = toon(0xffffff, { map: markierung, color: 0xffffff });
  const streifen = (b, t, x, z, ry) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(b, t), markMat);
    s.rotation.set(-Math.PI / 2, 0, ry);
    s.position.set(x, 0.003, z);
    s.receiveShadow = true;
    scene.add(s);
  };
  streifen(3.0, 0.1, 3.5, -1.9, 0);
  streifen(2.1, 0.1, 2.05, -2.95, Math.PI / 2);

  const wand = leinwandTextur(512, 256, (g, b, h) => {
    g.fillStyle = '#e8dcc2';
    g.fillRect(0, 0, b, h);
    g.fillStyle = '#6f7b77';
    g.fillRect(0, h * 0.62, b, h * 0.38);
    g.fillStyle = '#3a3f3d';
    g.fillRect(0, h * 0.62 - 4, b, 6);
    const r = zufall(3);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(90,80,60,${r() * 0.07})`;
      g.fillRect(r() * b, r() * h, 3 + r() * 8, 3 + r() * 8);
    }
  }, [3, 1]);
  const wandMat = toon(0xffffff, { map: wand });
  const wandStueck = (b, x, z, ry) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(b, RAUM.hoehe), wandMat);
    w.position.set(x, RAUM.hoehe / 2, z);
    w.rotation.y = ry;
    w.receiveShadow = true;
    scene.add(w);
  };
  wandStueck(10, 0, RAUM.zMin, 0);
  wandStueck(10, 0, RAUM.zMax, Math.PI);
  wandStueck(8, RAUM.xMin, 0, Math.PI / 2);
  wandStueck(8, RAUM.xMax, 0, -Math.PI / 2);

  const decke = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), toon(0x6d665c));
  decke.rotation.x = Math.PI / 2;
  decke.position.y = RAUM.hoehe;
  scene.add(decke);

  // Leuchtstoffröhren
  const roehrenMat = new THREE.MeshBasicMaterial({ color: 0xfffbea });
  for (const [x, z] of [[-2.5, -1.5], [2.5, -1.5], [-2.5, 1.8], [2.5, 1.8]]) {
    const gehaeuse = quader(1.3, 0.06, 0.2, 0xd8d8d8, { wirft: false });
    setze(gehaeuse, x, RAUM.hoehe - 0.05, z);
    scene.add(gehaeuse);
    const r = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.08), roehrenMat);
    r.position.set(x, RAUM.hoehe - 0.095, z);
    scene.add(r);
  }

  // Fenster links
  const fenster = new THREE.Group();
  const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ color: 0xbfe3f2 }));
  fenster.add(glas);
  const rahmenTeile = [[1.7, 0.08, 0, 0.52], [1.7, 0.08, 0, -0.52], [0.08, 1.1, -0.82, 0], [0.08, 1.1, 0.82, 0], [0.05, 1.0, 0, 0], [1.6, 0.05, 0, 0]];
  for (const [b, h, x, y] of rahmenTeile) {
    const r = quader(b, h, 0.06, 0xf0f0ea, { wirft: false });
    r.position.set(x, y, 0.02);
    fenster.add(r);
  }
  setze(fenster, RAUM.xMin + 0.01, 1.95, 1.6, 0, Math.PI / 2, 0);
  scene.add(fenster);

  // Tür vorne
  const tuer = new THREE.Group();
  tuer.add(setze(quader(1.0, 2.1, 0.06, 0x7d5733), 0, 1.05, 0));
  tuer.add(setze(quader(1.12, 0.07, 0.08, 0x3b3b3b), 0, 2.13, 0));
  tuer.add(setze(zylinder(0.025, 0.025, 0.14, 0xc9c9c9, {}, 10), 0.36, 1.05, -0.06, Math.PI / 2, 0, 0));
  tuer.add(setze(quader(0.04, 0.04, 0.12, 0xc9c9c9), 0.36, 1.05, -0.08, 0, 0, 0));
  setze(tuer, -1.6, 0, RAUM.zMax - 0.03, 0, Math.PI, 0);
  scene.add(tuer);

  // Feuerlöscher neben der Tür
  const loescher = new THREE.Group();
  loescher.add(setze(zylinder(0.09, 0.09, 0.5, FARBE.rot), 0, 0.25, 0));
  loescher.add(setze(kugel(0.09, FARBE.rot), 0, 0.5, 0));
  loescher.add(setze(zylinder(0.025, 0.025, 0.08, FARBE.schwarz), 0, 0.6, 0));
  loescher.add(setze(quader(0.12, 0.025, 0.03, FARBE.schwarz), 0.04, 0.65, 0));
  setze(loescher, -2.3, 0.9, RAUM.zMax - 0.14);
  scene.add(loescher);
  scene.add(setze(quader(0.22, 0.04, 0.14, 0x444444), -2.3, 0.88, RAUM.zMax - 0.1));
  merke(loescher, 'feuerloescher', 'Feuerlöscher', null);

  // ---------- Plakate ----------
  function plakat(b, h, malen, x, y, z, ry) {
    const t = leinwandTextur(Math.round(b * 400), Math.round(h * 400), malen);
    const p = teil(new THREE.PlaneGeometry(b, h), 0xffffff, { material: toon(0xffffff, { map: t }), umriss: false, wirft: false });
    setze(p, x, y, z, 0, ry, 0);
    scene.add(p);
    return p;
  }
  plakat(0.9, 1.15, (g, b, h) => {
    g.fillStyle = '#fbf6e9';
    g.fillRect(0, 0, b, h);
    g.strokeStyle = '#111';
    g.lineWidth = 10;
    g.strokeRect(5, 5, b - 10, h - 10);
    g.fillStyle = '#c8352a';
    g.fillRect(5, 5, b - 10, 70);
    g.fillStyle = '#fff';
    g.font = 'bold 44px Bangers, Impact, sans-serif';
    g.textAlign = 'center';
    g.fillText("DENNIS' REGELN", b / 2, 58);
    g.fillStyle = '#111';
    g.textAlign = 'left';
    g.font = 'bold 30px Nunito, Arial, sans-serif';
    const regeln = ['1. Brille auf!', '2. Handschuhe an!', '3. Flasche SPÜLEN!', '4. Helm runter!', '5. Masse dran!', '6. Schlacke weg!', '7. Finger weg', '    vom Kaffee!'];
    regeln.forEach((r, i) => g.fillText(r, 30, 125 + i * 44));
  }, -1.25, 1.85, RAUM.zMin + 0.01, 0);

  plakat(0.7, 0.7, (g, b, h) => {
    g.fillStyle = '#f2c21c';
    g.fillRect(0, 0, b, h);
    g.strokeStyle = '#111';
    g.lineWidth = 14;
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(b / 2, 40);
    g.lineTo(b - 40, h - 60);
    g.lineTo(40, h - 60);
    g.closePath();
    g.stroke();
    g.fillStyle = '#111';
    g.fillRect(b / 2 - 9, 95, 18, 85);
    g.beginPath();
    g.arc(b / 2, 205, 11, 0, Math.PI * 2);
    g.fill();
    g.font = 'bold 34px Bangers, Impact, sans-serif';
    g.textAlign = 'center';
    g.fillText('SICHERHEIT ZUERST', b / 2, h - 18);
  }, 2.0, 1.9, RAUM.zMin + 0.01, 0);

  // ---------- Werkbank ----------
  const werkbank = new THREE.Group();
  werkbank.add(setze(quader(2.3, 0.08, 0.8, FARBE.holz), 0, 0.86, 0));
  for (const [x, z] of [[-1.05, -0.33], [1.05, -0.33], [-1.05, 0.33], [1.05, 0.33]]) {
    werkbank.add(setze(quader(0.07, 0.82, 0.07, FARBE.stahlDunkel), x, 0.41, z));
  }
  werkbank.add(setze(quader(2.15, 0.04, 0.7, FARBE.holzDunkel), 0, 0.22, 0));
  // Schraubstock
  const stock = new THREE.Group();
  stock.add(setze(quader(0.22, 0.08, 0.16, FARBE.blau), 0, 0.04, 0));
  stock.add(setze(quader(0.05, 0.12, 0.18, FARBE.blau), -0.07, 0.14, 0));
  stock.add(setze(quader(0.05, 0.12, 0.18, FARBE.blau), 0.06, 0.14, 0));
  stock.add(setze(zylinder(0.012, 0.012, 0.3, FARBE.stahlHell, {}, 8), 0.2, 0.12, 0, 0, 0, Math.PI / 2));
  setze(stock, -0.9, 0.9, 0.18);
  werkbank.add(stock);
  setze(werkbank, 0, 0, -2.9);
  scene.add(werkbank);
  hindernis(-1.2, 1.2, -3.35, -2.45);

  // Lochwand mit Werkzeug
  const lochwand = leinwandTextur(256, 128, (g, b, h) => {
    g.fillStyle = '#c99d64';
    g.fillRect(0, 0, b, h);
    g.fillStyle = 'rgba(60,40,20,0.55)';
    for (let x = 8; x < b; x += 14) for (let y = 8; y < h; y += 14) {
      g.beginPath(); g.arc(x, y, 2, 0, Math.PI * 2); g.fill();
    }
  });
  const wandPlatte = teil(new THREE.BoxGeometry(2.2, 0.8, 0.03), 0xffffff, { material: toon(0xffffff, { map: lochwand }) });
  setze(wandPlatte, 0.45, 1.55, RAUM.zMin + 0.02);
  scene.add(wandPlatte);
  const haengend = [
    [quader(0.04, 0.3, 0.02, FARBE.stahlHell), -0.35, 1.6],
    [quader(0.04, 0.25, 0.02, FARBE.stahlHell), -0.25, 1.62],
    [quader(0.035, 0.36, 0.02, FARBE.rot), -0.1, 1.55],
    [quader(0.05, 0.34, 0.025, FARBE.holz), 0.15, 1.55],
    [quader(0.14, 0.05, 0.03, FARBE.stahlDunkel), 0.15, 1.73],
    [quader(0.03, 0.4, 0.02, FARBE.gelb), 0.4, 1.53],
    [quader(0.2, 0.18, 0.02, FARBE.stahlDunkel), 0.75, 1.6],
    [quader(0.04, 0.26, 0.02, FARBE.blau), 1.1, 1.6],
    [quader(0.04, 0.22, 0.02, FARBE.blau), 1.2, 1.63],
  ];
  for (const [m, x, y] of haengend) {
    setze(m, x, y, RAUM.zMin + 0.05);
    scene.add(m);
  }

  // Winkelschleifer
  const flex = new THREE.Group();
  flex.add(setze(zylinder(0.036, 0.04, 0.26, 0x23806b, {}, 14), 0.1, 0, 0, 0, 0, Math.PI / 2));
  flex.add(setze(zylinder(0.03, 0.03, 0.06, FARBE.schwarz, {}, 12), 0.25, 0, 0, 0, 0, Math.PI / 2));
  flex.add(setze(quader(0.08, 0.07, 0.07, FARBE.stahl), -0.06, 0, 0));
  flex.add(setze(zylinder(0.065, 0.065, 0.008, 0x7a6f66, {}, 24), -0.08, -0.045, 0));
  flex.add(setze(zylinder(0.072, 0.072, 0.03, FARBE.stahlHell, {}, 20), -0.08, -0.02, 0));
  flex.add(setze(zylinder(0.012, 0.012, 0.1, FARBE.schwarz, {}, 8), -0.06, 0, 0.08, Math.PI / 2, 0, 0));
  setze(flex, 0.72, 0.98, -2.82, 0, 0.5, 0);
  scene.add(flex);
  merke(flex, 'flex', 'Winkelschleifer', 'werkbank');
  objekte.flex = flex;

  // Blauer Edding zum Anzeichnen
  const edding = new THREE.Group();
  edding.add(setze(zylinder(0.011, 0.011, 0.11, 0x1f4fd1, { umriss: 0.003 }, 10), 0, 0, 0, 0, 0, Math.PI / 2));
  edding.add(setze(zylinder(0.012, 0.012, 0.04, 0x163a9c, { umriss: 0.003 }, 10), 0.07, 0, 0, 0, 0, Math.PI / 2));
  edding.add(setze(quader(0.03, 0.012, 0.004, 0xffffff, { umriss: false }), -0.01, 0, 0.011));
  setze(edding, -0.5, 0.913, -2.65, 0, 0.3, 0);
  scene.add(edding);
  merke(edding, 'edding', 'Blauer Edding (Anzeichnen)', 'werkbank');
  objekte.edding = edding;

  // ---------- Regal ----------
  const regal = new THREE.Group();
  for (const [x, z] of [[-0.2, -0.7], [0.2, -0.7], [-0.2, 0.7], [0.2, 0.7]]) {
    regal.add(setze(quader(0.04, 2.1, 0.04, FARBE.blau), x, 1.05, z));
  }
  for (const y of [0.25, 0.75, 1.25, 1.75]) {
    regal.add(setze(quader(0.44, 0.03, 1.44, 0x9a9a92), 0, y, 0));
  }
  // Deko: Dosen, Kartons
  const deko = [
    [zylinder(0.07, 0.07, 0.16, 0x2f7d4f), 0, 0.85, -0.5],
    [zylinder(0.07, 0.07, 0.16, 0xd9a21c), 0, 0.85, -0.32],
    [quader(0.3, 0.22, 0.34, 0xb88a52), 0, 0.37, -0.4],
    [quader(0.3, 0.18, 0.3, 0xa8794a), 0, 0.35, 0.35],
    [quader(0.24, 0.12, 0.3, 0x335c99), 0, 0.82, 0.38],
    [quader(0.28, 0.2, 0.3, 0xb88a52), 0, 1.86, -0.3],
    [zylinder(0.05, 0.05, 0.22, 0xc8352a), 0, 1.87, 0.35],
  ];
  for (const [m, x, y, z] of deko) regal.add(setze(m, x, y, z));
  setze(regal, -4.7, 0, -0.6);
  scene.add(regal);
  hindernis(-5, -4.4, -1.4, 0.2);

  // Elektroden-Packung mit Aufschrift
  const elTex = leinwandTextur(128, 64, (g, b, h) => {
    g.fillStyle = '#f2c21c'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#111'; g.font = 'bold 22px Arial'; g.fillText('Elektroden', 8, 28);
    g.font = 'bold 18px Arial'; g.fillText('2,5 mm', 8, 52);
  });
  const elPack = teil(new THREE.BoxGeometry(0.06, 0.08, 0.32), 0xffffff, { material: toon(0xffffff, { map: elTex }) });
  setze(elPack, -4.55, 1.31, -0.25);
  scene.add(elPack);

  // Helles Brett im Regal für Brille und Handschuhe
  scene.add(setze(quader(0.42, 0.012, 1.2, 0xe8e2d0, { wirft: false }), -4.66, 1.272, -0.6));

  // Schutzbrille: gebogene klare Scheibe mit Nasenausschnitt, gelber Rahmen oben, zwei Bügel
  const brille = new THREE.Group();
  const R = 0.09;
  const umrissForm = new THREE.Shape();
  umrissForm.moveTo(-0.075, 0.024);
  umrissForm.quadraticCurveTo(0, 0.032, 0.075, 0.024);
  umrissForm.quadraticCurveTo(0.088, 0.0, 0.07, -0.022);
  umrissForm.quadraticCurveTo(0.04, -0.03, 0.016, -0.024);
  umrissForm.quadraticCurveTo(0, -0.006, -0.016, -0.024);
  umrissForm.quadraticCurveTo(-0.04, -0.03, -0.07, -0.022);
  umrissForm.quadraticCurveTo(-0.088, 0.0, -0.075, 0.024);
  const biegen = (x, y) => new THREE.Vector3(R * Math.sin(x / R), y, R * Math.cos(x / R) - R);
  const scheibenGeo = new THREE.ShapeGeometry(umrissForm, 16);
  const scheibenPos = scheibenGeo.attributes.position;
  for (let i = 0; i < scheibenPos.count; i++) {
    const v = biegen(scheibenPos.getX(i), scheibenPos.getY(i));
    scheibenPos.setXYZ(i, v.x, v.y, v.z);
  }
  scheibenGeo.computeVertexNormals();
  const scheibe = new THREE.Mesh(scheibenGeo, new THREE.MeshToonMaterial({ color: 0xcfeeff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  brille.add(scheibe);
  // Rahmen: Linie entlang des Umrisses (oben dick, unten dünn)
  const rand = umrissForm.getPoints(40).map((p) => biegen(p.x, p.y));
  const randKurve = new THREE.CatmullRomCurve3(rand, true);
  brille.add(teil(new THREE.TubeGeometry(randKurve, 80, 0.0035, 5, true), 0xf2c21c, { umriss: false }));
  const obenKurve = new THREE.CatmullRomCurve3([-0.078, -0.04, 0, 0.04, 0.078].map((x) => biegen(x, 0.024 + 0.008 * Math.cos(x * 20))));
  brille.add(teil(new THREE.TubeGeometry(obenKurve, 30, 0.007, 6), 0xf2c21c, { umriss: 0.003 }));
  // Bügel nach hinten, aufgeklappt
  for (const seite of [-1, 1]) {
    const ende = biegen(0.08 * seite, 0.015);
    const buegel = teil(new THREE.BoxGeometry(0.007, 0.012, 0.13), 0xf2c21c, { umriss: 0.002 });
    buegel.position.set(ende.x, ende.y - 0.004, ende.z - 0.065);
    buegel.rotation.y = -0.08 * seite;
    brille.add(buegel);
    const spitze = teil(new THREE.BoxGeometry(0.007, 0.03, 0.012), 0x1a1a1a, { umriss: false });
    spitze.position.set(ende.x - 0.006 * seite, ende.y - 0.016, ende.z - 0.128);
    spitze.rotation.x = 0.4;
    brille.add(spitze);
  }
  // Nasenauflage
  brille.add(setze(quader(0.018, 0.01, 0.01, 0x8a8f96, { umriss: false }), 0, -0.012, -0.006));
  setze(brille, -4.55, 1.335, -0.85, 0.12, Math.PI / 2 + 0.35, 0);
  brille.scale.setScalar(1.6);
  scene.add(brille);
  merke(brille, 'brille', 'Schutzbrille', 'regal');
  objekte.brille = brille;

  // Schweißerhandschuhe: lange braune Lederhandschuhe mit Stulpe, aufrecht nebeneinander
  const handschuhe = new THREE.Group();
  function handschuh(seite) {
    const h = new THREE.Group();
    const leder = 0xa8743d;
    const stulpe = teil(new THREE.CylinderGeometry(0.055, 0.045, 0.14, 12), 0xc38f52, { umriss: 0.004 });
    stulpe.position.y = 0.07;
    h.add(stulpe);
    const naht = teil(new THREE.TorusGeometry(0.047, 0.005, 4, 14), 0x6b4522, { umriss: false });
    naht.rotation.x = Math.PI / 2;
    naht.position.y = 0.14;
    h.add(naht);
    const handteil = teil(new THREE.CapsuleGeometry(0.045, 0.06, 4, 10), leder, { umriss: 0.004 });
    handteil.scale.set(1.1, 1, 0.6);
    handteil.position.y = 0.2;
    h.add(handteil);
    for (let f = 0; f < 4; f++) {
      const finger = teil(new THREE.CapsuleGeometry(0.012, 0.045, 4, 6), leder, { umriss: 0.003 });
      finger.position.set(-0.033 + f * 0.022, 0.285 - Math.abs(f - 1.5) * 0.008, 0);
      h.add(finger);
    }
    const daumen = teil(new THREE.CapsuleGeometry(0.015, 0.04, 4, 6), leder, { umriss: 0.003 });
    daumen.position.set(0.06 * seite, 0.21, 0);
    daumen.rotation.z = -0.7 * seite;
    h.add(daumen);
    return h;
  }
  handschuhe.add(setze(handschuh(-1), -0.075, 0, 0, 0, 0, 0.1));
  handschuhe.add(setze(handschuh(1), 0.075, 0, 0, 0, 0, -0.1));
  setze(handschuhe, -4.62, 1.28, -0.38, 0, Math.PI / 2, 0);
  scene.add(handschuhe);
  merke(handschuhe, 'handschuhe', 'Schweißerhandschuhe', 'regal');
  objekte.handschuhe = handschuhe;

  // ---------- Waschplatz ----------
  const becken = new THREE.Group();
  becken.add(setze(quader(0.55, 0.75, 0.9, FARBE.stahlHell), 0, 0.375, 0));
  becken.add(setze(quader(0.45, 0.04, 0.8, 0x6b737b, { umriss: false }), 0.02, 0.751, 0));
  becken.add(setze(zylinder(0.02, 0.02, 0.35, FARBE.stahlHell, {}, 10), 0.24, 1.0, 0));
  becken.add(setze(zylinder(0.018, 0.018, 0.18, FARBE.stahlHell, {}, 10), 0.16, 1.17, 0, 0, 0, Math.PI / 2));
  becken.add(setze(zylinder(0.03, 0.03, 0.03, FARBE.rot, {}, 10), 0.24, 1.2, 0));
  setze(becken, 4.67, 0, 1.6);
  scene.add(becken);
  hindernis(4.35, 5, 1.1, 2.1);

  // Schlauch an der Wand
  const schlauch = new THREE.Group();
  schlauch.add(setze(teil(new THREE.TorusGeometry(0.17, 0.022, 8, 28), 0x3c9a3a), 0, 0, 0));
  schlauch.add(setze(teil(new THREE.TorusGeometry(0.14, 0.022, 8, 28), 0x3c9a3a), 0, -0.01, 0.03));
  schlauch.add(setze(zylinder(0.02, 0.02, 0.12, FARBE.stahl, {}, 8), 0, 0.2, -0.02));
  setze(schlauch, RAUM.xMax - 0.06, 1.45, 2.45, 0, Math.PI / 2, 0);
  scene.add(schlauch);
  merke(schlauch, 'schlauch', 'Wasserschlauch', 'wasch');

  // Eimer
  const eimer = new THREE.Group();
  eimer.add(setze(zylinder(0.15, 0.12, 0.3, FARBE.blau, {}, 18), 0, 0.15, 0));
  eimer.add(setze(teil(new THREE.TorusGeometry(0.14, 0.008, 6, 20, Math.PI), 0x888888), 0, 0.3, 0));
  setze(eimer, 4.4, 0, 0.75);
  scene.add(eimer);
  hindernis(4.2, 4.6, 0.55, 0.95);

  // ---------- Schweißplatz ----------
  const tisch = new THREE.Group();
  tisch.add(setze(quader(1.5, 0.06, 0.85, FARBE.stahlDunkel), 0, 0.82, 0));
  for (const [x, z] of [[-0.68, -0.36], [0.68, -0.36], [-0.68, 0.36], [0.68, 0.36]]) {
    tisch.add(setze(quader(0.06, 0.8, 0.06, FARBE.stahl), x, 0.4, z));
  }
  tisch.add(setze(quader(1.4, 0.04, 0.06, FARBE.stahl), 0, 0.15, 0.36));
  setze(tisch, 3.1, 0, -2.95);
  scene.add(tisch);
  hindernis(2.3, 3.9, -3.45, -2.45);

  // Schweißvorhang (rot, durchscheinend)
  const vorhangMat = toon(0xc0301f, { transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.8), vorhangMat);
    v.position.set(2.15, 1.05, -3.75 + i * 0.4);
    v.rotation.y = Math.PI / 2 + (i % 2 ? 0.08 : -0.08);
    scene.add(v);
  }
  scene.add(setze(zylinder(0.015, 0.015, 1.3, FARBE.stahl, {}, 6), 2.15, 1.97, -3.35, Math.PI / 2, 0, 0));

  // Schweißgerät auf Wagen
  const geraet = new THREE.Group();
  geraet.add(setze(quader(0.5, 0.04, 0.4, FARBE.stahlDunkel), 0, 0.45, 0));
  for (const [x, z] of [[-0.22, -0.17], [0.22, -0.17], [-0.22, 0.17], [0.22, 0.17]]) {
    geraet.add(setze(quader(0.03, 0.45, 0.03, FARBE.stahl), x, 0.225, z));
  }
  for (const x of [-0.2, 0.2]) geraet.add(setze(zylinder(0.05, 0.05, 0.04, FARBE.schwarz, {}, 12), x, 0.05, 0.17, Math.PI / 2, 0, 0));
  geraet.add(setze(quader(0.44, 0.34, 0.32, FARBE.rot), 0, 0.64, 0));
  geraet.add(setze(quader(0.3, 0.04, 0.05, FARBE.schwarz), 0, 0.83, 0));
  const anzeigeTex = leinwandTextur(128, 64, () => {});
  const anzeige = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.08), new THREE.MeshBasicMaterial({ map: anzeigeTex }));
  anzeige.position.set(-0.08, 0.7, 0.161);
  geraet.add(anzeige);
  geraet.add(setze(zylinder(0.035, 0.035, 0.03, FARBE.schwarz, {}, 14), 0.12, 0.7, 0.17, Math.PI / 2, 0, 0));
  geraet.add(setze(zylinder(0.018, 0.018, 0.03, 0x111111, {}, 10), -0.1, 0.55, 0.17, Math.PI / 2, 0, 0));
  geraet.add(setze(zylinder(0.018, 0.018, 0.03, 0x111111, {}, 10), 0.1, 0.55, 0.17, Math.PI / 2, 0, 0));
  setze(geraet, 4.45, 0, -2.95, 0, -Math.PI / 2, 0);
  scene.add(geraet);
  merke(geraet, 'geraet', 'Schweißgerät', 'schweiss');
  objekte.geraet = geraet;
  hindernis(4.2, 4.7, -3.25, -2.65);

  function zeigeStrom(ampere) {
    const g = anzeigeTex.userData.ctx;
    g.fillStyle = '#0f1d10';
    g.fillRect(0, 0, 128, 64);
    g.fillStyle = '#7dff6a';
    g.font = 'bold 44px Courier New, monospace';
    g.textAlign = 'center';
    g.fillText(`${ampere}A`, 64, 48);
    anzeigeTex.needsUpdate = true;
  }
  zeigeStrom(140);

  // Kabel
  function kabel(punkte, farbe) {
    const kurve = new THREE.CatmullRomCurve3(punkte.map((p) => new THREE.Vector3(...p)));
    const k = teil(new THREE.TubeGeometry(kurve, 40, 0.012, 6), farbe, { umriss: 0.006 });
    scene.add(k);
    return k;
  }
  kabel([[4.3, 0.55, -2.95], [4.1, 0.05, -2.6], [3.85, 0.05, -2.4], [3.75, 0.86, -2.62]], 0x161616);
  const masseKabelPunkte = (ende) => [[4.3, 0.6, -3.05], [4.15, 0.05, -2.75], [3.9, 0.02, -2.2], ende];
  let masseKabel = kabel(masseKabelPunkte([3.85, 0.04, -2.05]), 0x161616);

  // Elektrodenhalter auf dem Tisch
  const halter = new THREE.Group();
  halter.add(setze(zylinder(0.025, 0.025, 0.18, FARBE.schwarz, {}, 10), 0, 0, 0, 0, 0, Math.PI / 2));
  halter.add(setze(quader(0.06, 0.03, 0.04, 0x7a7a7a), -0.11, 0, 0));
  halter.add(setze(zylinder(0.004, 0.004, 0.25, 0x8e8170, {}, 6), -0.2, 0, 0.04, Math.PI / 2, 0.6, 0));
  setze(halter, 3.68, 0.875, -2.68, 0, 0.3, 0);
  scene.add(halter);
  merke(halter, 'halter', 'Elektrodenhalter', 'schweiss');

  // Masseklemme
  const masse = new THREE.Group();
  masse.add(setze(quader(0.12, 0.025, 0.035, FARBE.rot), 0, 0.015, 0, 0, 0, 0.15));
  masse.add(setze(quader(0.12, 0.025, 0.035, FARBE.rot), 0, -0.015, 0, 0, 0, -0.15));
  masse.add(setze(quader(0.04, 0.05, 0.04, 0x8b8b8b), -0.06, 0, 0));
  setze(masse, 3.85, 0.04, -2.05, 0, 0.4, 0);
  scene.add(masse);
  merke(masse, 'masse', 'Masseklemme', 'schweiss');
  objekte.masse = masse;

  // Schweißhelm: gewölbte Schale, Sichtfenster mit Rahmen, Kopfband mit Drehrad, Flammen-Aufkleber.
  // Hängt an einem Haken an der Wand neben dem Schweißtisch.
  const helm = new THREE.Group();
  // Schale: vordere Hälfte eines gestreckten Ellipsoids, oben breiter, unten zum Kinn hin schmaler
  const schaleGeo = new THREE.SphereGeometry(1, 24, 16, 0, Math.PI, 0, Math.PI);
  const sp = schaleGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const y = sp.getY(i);
    const breite = y < 0 ? 1 + y * 0.25 : 1;
    sp.setX(i, sp.getX(i) * breite);
  }
  schaleGeo.computeVertexNormals();
  const schale = teil(schaleGeo, 0x26282c, { mat: { side: THREE.DoubleSide }, umriss: 0.004 });
  schale.scale.set(0.115, 0.155, 0.13);
  helm.add(schale);
  // Kante rundherum
  const kante = teil(new THREE.TorusGeometry(1, 0.06, 6, 30, Math.PI), 0x111214, { umriss: false });
  kante.scale.set(0.115, 0.155, 0.115);
  kante.rotation.z = -Math.PI / 2;
  kante.rotation.y = Math.PI / 2;
  helm.add(kante);
  // Sichtfenster mit Rahmen
  helm.add(setze(quader(0.12, 0.075, 0.03, 0x15161a, { umriss: 0.003 }), 0, 0.03, 0.12, -0.15, 0, 0));
  helm.add(setze(quader(0.095, 0.05, 0.01, 0x2f6b3a, { mat: { emissive: 0x0c2a12 }, umriss: false }), 0, 0.03, 0.137, -0.15, 0, 0));
  // Flammen-Aufkleber
  const flammeTex = leinwandTextur(128, 128, (g) => {
    g.clearRect(0, 0, 128, 128);
    g.fillStyle = '#ff7a1a';
    g.beginPath();
    g.moveTo(20, 120); g.quadraticCurveTo(10, 60, 50, 30); g.quadraticCurveTo(45, 70, 70, 60);
    g.quadraticCurveTo(80, 20, 110, 10); g.quadraticCurveTo(100, 70, 110, 120); g.closePath(); g.fill();
    g.fillStyle = '#ffd23a';
    g.beginPath();
    g.moveTo(40, 120); g.quadraticCurveTo(40, 85, 60, 75); g.quadraticCurveTo(62, 95, 80, 85); g.quadraticCurveTo(90, 100, 90, 120); g.closePath(); g.fill();
  });
  for (const seite of [-1, 1]) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), new THREE.MeshBasicMaterial({ map: flammeTex, transparent: true, side: THREE.DoubleSide }));
    f.position.set(0.085 * seite, -0.06, 0.08);
    f.rotation.y = seite * 0.9;
    helm.add(f);
  }
  // Kopfband innen mit Drehrad hinten
  const kopfband = teil(new THREE.TorusGeometry(0.095, 0.008, 4, 24), 0x111111, { umriss: false });
  kopfband.rotation.x = Math.PI / 2;
  kopfband.position.set(0, 0.04, 0.01);
  helm.add(kopfband);
  helm.add(setze(zylinder(0.022, 0.022, 0.02, 0x111111, { umriss: 0.003 }, 12), 0, 0.04, -0.105, Math.PI / 2, 0, 0));
  // Seitliche Drehgelenke
  for (const seite of [-1, 1]) helm.add(setze(zylinder(0.018, 0.018, 0.015, 0x444444, { umriss: 0.003 }, 10), 0.105 * seite, 0.04, 0.02, 0, 0, Math.PI / 2));
  setze(helm, 3.45, 1.4, -3.82, 0, 0, 0);
  helm.scale.setScalar(1.25);
  scene.add(helm);
  // Wandhaken
  scene.add(setze(zylinder(0.01, 0.01, 0.12, 0x7a7a7a, {}, 8), 3.45, 1.57, -3.94, Math.PI / 2, 0, 0));
  scene.add(setze(quader(0.06, 0.06, 0.01, 0x7a7a7a), 3.45, 1.57, -3.995));
  merke(helm, 'helm', 'Schweißhelm', 'schweiss');
  objekte.helm = helm;

  // Schlackenhammer und Drahtbürste
  const hammer = new THREE.Group();
  hammer.add(setze(zylinder(0.012, 0.012, 0.26, 0x2a5fb0, {}, 8), 0, 0, 0, 0, 0, Math.PI / 2));
  hammer.add(setze(quader(0.025, 0.025, 0.16, FARBE.stahlHell), -0.13, 0, 0));
  setze(hammer, 2.68, 0.865, -2.7, 0, -0.3, 0);
  scene.add(hammer);
  merke(hammer, 'hammer', 'Schlackenhammer', 'schweiss');
  const buerste = new THREE.Group();
  buerste.add(setze(quader(0.22, 0.02, 0.035, FARBE.holz), 0, 0, 0));
  buerste.add(setze(quader(0.12, 0.025, 0.03, 0xb0b0b0), -0.04, -0.02, 0));
  setze(buerste, 2.62, 0.87, -2.55, 0, 0.2, 0);
  scene.add(buerste);

  // ---------- Kaffeeecke ----------
  const kaffeeTisch = new THREE.Group();
  kaffeeTisch.add(setze(quader(0.7, 0.05, 0.5, FARBE.holz), 0, 0.78, 0));
  for (const [x, z] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) {
    kaffeeTisch.add(setze(quader(0.04, 0.78, 0.04, FARBE.stahlDunkel), x, 0.39, z));
  }
  const maschine = new THREE.Group();
  maschine.add(setze(quader(0.22, 0.32, 0.24, 0x1f1f1f), 0, 0.16, 0));
  maschine.add(setze(quader(0.16, 0.04, 0.12, 0x333333), 0, 0.3, 0.1));
  maschine.add(setze(kugel(0.012, 0xff3b30, { umriss: false, mat: { emissive: 0xff2010 } }), 0.07, 0.25, 0.121));
  maschine.add(setze(zylinder(0.06, 0.05, 0.12, 0x333333, {}, 12), 0, 0.06, 0.1));
  setze(maschine, -0.15, 0.805, -0.05);
  kaffeeTisch.add(maschine);
  setze(kaffeeTisch, -4.45, 0, 3.4, 0, Math.PI / 2, 0);
  scene.add(kaffeeTisch);
  hindernis(-4.75, -4.15, 3.0, 3.8);

  const tasseTex = leinwandTextur(128, 64, (g, b, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#c8352a'; g.font = 'bold 34px Bangers, Impact, sans-serif'; g.textAlign = 'center';
    g.fillText('CHEF', b / 2, 44);
  });
  const tasse = new THREE.Group();
  const tasseKoerper = teil(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), 0xffffff, { material: toon(0xffffff, { map: tasseTex }) });
  tasse.add(tasseKoerper);
  tasse.add(setze(teil(new THREE.TorusGeometry(0.028, 0.008, 6, 14), 0xffffff), 0.05, 0, 0, 0, 0, 0));
  tasse.add(setze(zylinder(0.04, 0.04, 0.005, 0x4a2a12, { umriss: false }), 0, 0.045, 0));
  setze(tasse, -4.35, 0.855, 3.1, 0, -2.2, 0);
  scene.add(tasse);
  merke(tasse, 'kaffee', 'Dennis’ Kaffeetasse', null);
  objekte.tasse = tasse;

  // Kaffeemaschine anklickbar machen
  merke(maschine, 'kaffeemaschine', 'Kaffeemaschine', null);

  // Kiwis lose auf dem Kaffeetisch
  const kiwiSchale = new THREE.Group();
  const kiwis = [];
  const kiwiMat = toon(0x7a5a2e);
  for (const [x, y, z] of [[-0.06, 0.042, -0.08], [0.02, 0.042, -0.1], [0.07, 0.042, -0.02], [-0.03, 0.042, 0.05], [0.05, 0.042, 0.09]]) {
    const k = teil(new THREE.SphereGeometry(0.032, 10, 8), 0, { material: kiwiMat, umriss: 0.003 });
    k.scale.set(1, 0.85, 1.25);
    k.position.set(x, y - 0.015, z);
    k.rotation.y = x * 20;
    kiwiSchale.add(k);
    kiwis.push(k);
  }
  // eine halbe, aufgeschnittene Kiwi obendrauf
  const halbe = new THREE.Group();
  halbe.add(teil(new THREE.SphereGeometry(0.03, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0, { material: kiwiMat, umriss: 0.003 }));
  const schnitt = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#7fb83a'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e9f2c4'; g.beginPath(); g.arc(32, 32, 10, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1a1a1a';
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; g.beginPath(); g.ellipse(32 + Math.cos(a) * 15, 32 + Math.sin(a) * 15, 2, 1, a, 0, Math.PI * 2); g.fill(); }
  });
  const flaeche = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), new THREE.MeshBasicMaterial({ map: schnitt }));
  flaeche.rotation.x = Math.PI / 2;
  flaeche.position.y = -0.001;
  halbe.add(flaeche);
  halbe.rotation.x = Math.PI;
  halbe.position.set(-0.08, 0.03, 0.1);
  kiwiSchale.add(halbe);
  kiwis.push(halbe);
  setze(kiwiSchale, -4.3, 0.805, 3.4);
  scene.add(kiwiSchale);
  merke(kiwiSchale, 'kiwi', 'Dennis’ Kiwis', null);

  // Getränkekiste mit Dennis' Brotdose
  const kiste = new THREE.Group();
  kiste.add(setze(quader(0.4, 0.3, 0.3, 0x2f6a3a), 0, 0.15, 0));
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j += 2) kiste.add(setze(zylinder(0.03, 0.03, 0.1, 0x3a2412, {}, 8), i * 0.12, 0.33, j * 0.06));
  setze(kiste, -4.62, 0, 2.55, 0, Math.PI / 2, 0);
  scene.add(kiste);
  hindernis(-4.85, -4.45, 2.3, 2.8);
  const brotdose = new THREE.Group();
  brotdose.add(teil(new THREE.BoxGeometry(0.2, 0.07, 0.14), 0, { material: toon(0xf0f4f6, { transparent: true, opacity: 0.6 }), umriss: 0.004 }));
  brotdose.add(setze(quader(0.21, 0.015, 0.15, 0xc8352a, { umriss: 0.003 }), 0, 0.042, 0));
  brotdose.add(setze(kugel(0.03, 0xd8352a, { umriss: 0.002 }, 10), 0.06, -0.005, 0.02));
  brotdose.add(setze(teil(new THREE.TorusGeometry(0.06, 0.016, 6, 12, 2.2), 0xf2d23c, { umriss: 0.002 }), -0.03, -0.02, 0, Math.PI / 2, 0, 0.5));
  setze(brotdose, -4.62, 0.43, 2.55, 0, 0.4, 0);
  scene.add(brotdose);
  merke(brotdose, 'brotdose', 'Dennis’ Brotdose', null);
  objekte.brotdose = brotdose;

  // Große Soundbox (Standlautsprecher)
  const box = new THREE.Group();
  box.add(setze(quader(0.42, 1.05, 0.42, 0x151517), 0, 0.525, 0));
  box.add(setze(quader(0.36, 0.98, 0.012, 0x232327, { umriss: false }), 0, 0.53, 0.212));
  const membranen = [];
  for (const [y, r] of [[0.28, 0.13], [0.6, 0.13], [0.86, 0.045]]) {
    box.add(setze(zylinder(r + 0.015, r + 0.015, 0.02, 0x3a3a3e, { umriss: 0.003 }, 24), 0, y, 0.215, Math.PI / 2, 0, 0));
    const m = teil(new THREE.ConeGeometry(r, 0.05, 24, 1, true), 0x2b2b2f, { mat: { side: THREE.DoubleSide }, umriss: false });
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, y, 0.215);
    box.add(m);
    box.add(setze(zylinder(r * 0.3, r * 0.3, 0.02, 0x0e0e10, { umriss: false }, 16), 0, y, 0.205, Math.PI / 2, 0, 0));
    membranen.push(m);
  }
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x441010 });
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.012, 12), ledMat);
  led.position.set(0.14, 0.98, 0.22);
  box.add(led);
  box.add(setze(quader(0.1, 0.02, 0.005, 0xc8352a, { umriss: false }), 0, 0.98, 0.22));
  setze(box, -4.66, 0, 1.0, 0, Math.PI / 2, 0);
  scene.add(box);
  merke(box, 'box', 'Soundbox', null);
  hindernis(-4.9, -4.42, 0.75, 1.25);
  let boxBeat = null;
  animiert.push(() => {
    const b = boxBeat ? boxBeat() : null;
    const puls = b === null ? 0 : Math.pow(1 - (b % 1), 4);
    for (const m of membranen) m.scale.set(1, 1 + puls * 1.5, 1);
    ledMat.color.setHex(b === null ? 0x441010 : 0xff3020);
  });

  // Besen an der Wand
  const besen = new THREE.Group();
  besen.add(setze(zylinder(0.014, 0.014, 1.3, FARBE.holz, {}, 8), 0, 0.75, 0));
  besen.add(setze(quader(0.32, 0.06, 0.07, 0x7a4f2a), 0, 0.08, 0));
  besen.add(setze(quader(0.3, 0.07, 0.06, 0x2a2a2a, { umriss: false }), 0, 0.02, 0));
  setze(besen, -4.88, 0, 2.05, 0.18, Math.PI / 2, 0);
  scene.add(besen);
  merke(besen, 'besen', 'Besen', null);

  // Lichtschalter neben der Tür
  const schalter = new THREE.Group();
  schalter.add(quader(0.08, 0.08, 0.02, 0xf4f0e6, { umriss: 0.003 }));
  const wippe = quader(0.04, 0.04, 0.015, 0xe8e2d0, { umriss: 0.002 });
  wippe.position.z = 0.012;
  schalter.add(wippe);
  setze(schalter, -0.85, 1.1, RAUM.zMax - 0.012, 0, Math.PI, 0);
  scene.add(schalter);
  merke(schalter, 'licht', 'Lichtschalter', null);

  // Klotür vorne rechts
  const klo = new THREE.Group();
  klo.add(setze(quader(0.85, 2.05, 0.05, 0xd9d4c4), 0, 1.025, 0));
  klo.add(setze(quader(0.95, 0.06, 0.07, 0x3b3b3b), 0, 2.08, 0));
  klo.add(setze(zylinder(0.022, 0.022, 0.12, 0xc9c9c9, {}, 10), 0.3, 1.0, -0.05, Math.PI / 2, 0, 0));
  const wcTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#2f5fa8'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#fff'; g.font = 'bold 64px Arial'; g.textAlign = 'center'; g.fillText('WC', b / 2, 86);
  });
  const wcSchild = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), new THREE.MeshBasicMaterial({ map: wcTex }));
  wcSchild.position.set(0, 1.6, -0.03);
  wcSchild.rotation.y = Math.PI;
  klo.add(wcSchild);
  setze(klo, 1.4, 0, RAUM.zMax - 0.03, 0, Math.PI, 0);
  scene.add(klo);

  // Poster mit Klebeband, leicht schräg, über der Kaffeeecke
  const posterTex = new THREE.TextureLoader().load('assets/poster.jpg');
  posterTex.colorSpace = THREE.SRGBColorSpace;
  const poster = new THREE.Group();
  poster.add(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 1.1), new THREE.MeshBasicMaterial({ color: 0xf6f3ea })));
  const foto = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.0), new THREE.MeshBasicMaterial({ map: posterTex }));
  foto.position.z = 0.002;
  poster.add(foto);
  const klebeMat = new THREE.MeshBasicMaterial({ color: 0xe9dcae, transparent: true, opacity: 0.85 });
  for (const [x, y, r] of [[-0.29, 0.53, 0.7], [0.29, 0.53, -0.6], [-0.29, -0.53, -0.7], [0.29, -0.53, 0.65]]) {
    const band = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.045), klebeMat);
    band.position.set(x, y, 0.004);
    band.rotation.z = r;
    poster.add(band);
  }
  setze(poster, RAUM.xMin + 0.012, 1.85, 3.25, 0, Math.PI / 2, 0.06);
  scene.add(poster);

  // Dreck auf dem Boden (Schleifstaub, Funken) – wird mit dem Besen weggefegt
  const dreckTex = leinwandTextur(128, 128, (g) => {
    g.clearRect(0, 0, 128, 128);
    const r = zufall(19);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(${40 + r() * 30},${32 + r() * 20},${25 + r() * 15},${0.3 + r() * 0.5})`;
      const a = r() * Math.PI * 2, d = r() * 55;
      g.fillRect(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 1 + r() * 4, 1 + r() * 4);
    }
  });
  const dreckMat = new THREE.MeshBasicMaterial({ map: dreckTex, transparent: true, depthWrite: false });
  const dreck = [];
  let dreckMitte = null;
  function dreckHin(cx, cz, anzahl) {
    dreckMitte = { x: cx, z: cz };
    for (let i = 0; i < anzahl; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), dreckMat);
      d.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI);
      d.position.set(cx + (Math.random() - 0.5) * 1.6, 0.004 + dreck.length * 0.0002, cz + (Math.random() - 0.5) * 0.8);
      scene.add(d);
      dreck.push(d);
    }
  }

  // Altes Sofa neben der Kaffeeecke (Dennis' Mittagspause)
  const sofa = new THREE.Group();
  const SOFA_STOFF = 0x6b5a3a;
  sofa.add(setze(quader(1.6, 0.25, 0.75, 0x4a3d28), 0, 0.2, 0));
  for (const x of [-0.39, 0.39]) {
    const kissen = quader(0.76, 0.14, 0.62, SOFA_STOFF);
    kissen.position.set(x, 0.39, 0.04);
    sofa.add(kissen);
  }
  sofa.add(setze(quader(1.6, 0.5, 0.18, SOFA_STOFF), 0, 0.55, -0.3, -0.12, 0, 0));
  for (const x of [-0.86, 0.86]) sofa.add(setze(quader(0.14, 0.42, 0.75, 0x5a4a30), x, 0.42, 0));
  for (const [x, z] of [[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.3], [0.75, 0.3]]) sofa.add(setze(zylinder(0.03, 0.025, 0.08, 0x2a2018, {}, 8), x, 0.04, z));
  // Flicken und Decke
  sofa.add(setze(quader(0.18, 0.012, 0.16, 0x8a3a2a, { umriss: 0.002 }), 0.45, 0.466, 0.1, 0, 0.3, 0));
  const sofaDecke = teil(new THREE.BoxGeometry(0.5, 0.04, 0.55), 0x2f5f86, { umriss: 0.003 });
  sofaDecke.position.set(-0.55, 0.48, 0.0);
  sofaDecke.rotation.y = 0.2;
  sofa.add(sofaDecke);
  setze(sofa, -3.2, 0, RAUM.zMax - 0.45);
  sofa.rotation.y = Math.PI;
  scene.add(sofa);
  hindernis(-4.05, -2.35, 3.15, 4.0);

  // Milchtüte auf dem Kaffeetisch
  const milchTex = leinwandTextur(64, 128, (g, b, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#2f5fa8'; g.fillRect(0, 0, b, 34);
    g.fillStyle = '#2f5fa8'; g.font = 'bold 18px Arial'; g.textAlign = 'center'; g.fillText('MILCH', b / 2, 80);
  });
  const milch = new THREE.Group();
  milch.add(teil(new THREE.BoxGeometry(0.07, 0.17, 0.07), 0, { material: toon(0xffffff, { map: milchTex }), umriss: 0.003 }));
  const giebel = teil(new THREE.CylinderGeometry(0.0001, 0.05, 0.05, 4, 1), 0xffffff, { umriss: 0.003 });
  giebel.rotation.y = Math.PI / 4;
  giebel.position.y = 0.11;
  milch.add(giebel);
  setze(milch, -4.6, 0.89, 3.62);
  scene.add(milch);
  merke(milch, 'milch', 'Milch', null);

  // Holzschnitzfigur: Baumstamm mit geschnitztem Hintern (ca. 70 cm), steht auf dem Boden in Dennis' Ecke
  const figur = new THREE.Group();
  const HOLZ = 0xc08a4a;
  const holzMat = toon(HOLZ);
  const holz = (geo, x, y, z, rx = 0, ry = 0, rz = 0) => setze(teil(geo, 0, { material: holzMat, umriss: 0.005 }), x, y, z, rx, ry, rz);
  // Oberteil (Rücken, oben gerade abgesägt)
  figur.add(holz(new THREE.CylinderGeometry(0.115, 0.125, 0.26, 18), 0, 0.57, 0));
  figur.add(setze(zylinder(0.112, 0.112, 0.006, 0xd9b27a, { umriss: false }, 18), 0, 0.703, 0));
  // Hintern: zwei Backen nach hinten (lokal -z)
  for (const x of [-0.06, 0.06]) {
    const backe = holz(new THREE.SphereGeometry(0.1, 16, 12), x, 0.42, -0.045);
    backe.scale.set(0.95, 1.05, 1.05);
    figur.add(backe);
  }
  // Beine: zwei Stämme, leicht gespreizt, unten gerade abgesägt
  for (const x of [-0.065, 0.065]) {
    figur.add(holz(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 14), x * 1.15, 0.19, 0.0, 0, 0, x > 0 ? -0.06 : 0.06));
    figur.add(setze(zylinder(0.062, 0.062, 0.006, 0x9a8a3a, { umriss: false }, 14), x * 1.3, 0.004, 0));
  }
  // Schnitzspuren
  for (let i = 0; i < 6; i++) figur.add(setze(quader(0.004, 0.08, 0.004, 0x8a5a2a, { umriss: false }), Math.sin(i) * 0.1, 0.55 + (i % 3) * 0.04, Math.cos(i) * 0.1 + 0.01));
  setze(figur, -4.6, 0, 1.62, 0, -Math.PI / 2, 0);
  scene.add(figur);
  merke(figur, 'figur', 'Holzfigur', null);
  hindernis(-4.8, -4.4, 1.42, 1.82);

  // Mülleimer neben der Werkbank (kann durch Funken Feuer fangen)
  const eimerM = new THREE.Group();
  eimerM.add(teil(new THREE.CylinderGeometry(0.2, 0.17, 0.5, 18, 1, true), 0x5f666e, { mat: { side: THREE.DoubleSide }, umriss: 0.005 }));
  eimerM.children[0].position.y = 0.25;
  eimerM.add(setze(zylinder(0.17, 0.17, 0.01, 0x2a2a2a, { umriss: false }, 18), 0, 0.01, 0));
  eimerM.add(setze(zylinder(0.18, 0.18, 0.02, 0x3a2e22, { umriss: false }, 18), 0, 0.42, 0));
  for (let i = 0; i < 4; i++) eimerM.add(setze(quader(0.08, 0.06, 0.05, 0xc9b48a, { umriss: 0.002 }), Math.sin(i * 1.7) * 0.08, 0.45, Math.cos(i * 1.7) * 0.08, i, i * 0.7, 0.3));
  setze(eimerM, 1.55, 0, -3.3);
  scene.add(eimerM);
  merke(eimerM, 'muelleimer', 'Mülleimer', null);
  hindernis(1.32, 1.78, -3.55, -3.05);

  // Feuer: flackernde Flammen + Licht
  const feuer = new THREE.Group();
  const flammen = [];
  const flammenMats = [0xff5a1f, 0xff9a1f, 0xffd23a].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, depthWrite: false }));
  for (let i = 0; i < 9; i++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.06 + (i % 3) * 0.02, 0.35, 8), flammenMats[i % 3]);
    f.userData.phase = i * 1.3;
    f.userData.x = Math.sin(i * 2.1) * 0.09;
    f.userData.z = Math.cos(i * 2.1) * 0.09;
    feuer.add(f);
    flammen.push(f);
  }
  const feuerLicht = new THREE.PointLight(0xff7a2a, 0, 4, 1.5);
  feuerLicht.position.y = 0.4;
  feuer.add(feuerLicht);
  feuer.position.set(1.55, 0.45, -3.3);
  feuer.scale.setScalar(1.7);
  feuer.visible = false;
  scene.add(feuer);
  let feuerZeit = 0;
  animiert.push((dt) => {
    if (!feuer.visible) return;
    feuerZeit += dt;
    for (const f of flammen) {
      const p = f.userData.phase;
      const h = 0.8 + Math.sin(feuerZeit * 9 + p) * 0.25 + Math.sin(feuerZeit * 17 + p * 2) * 0.12;
      f.scale.set(1, h, 1);
      f.position.set(f.userData.x + Math.sin(feuerZeit * 5 + p) * 0.02, 0.17 * h, f.userData.z);
    }
    feuerLicht.intensity = 4 + Math.sin(feuerZeit * 23) * 1.2;
  });

  // Löschpulver-Wolke
  const wolkenTex = leinwandTextur(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  });
  const wolken = [];
  function pulver(von, nach) {
    for (let i = 0; i < 26; i++) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: wolkenTex, transparent: true, depthWrite: false }));
      sp.position.copy(von);
      const d = new THREE.Vector3().subVectors(nach, von);
      sp.userData = { v: d.multiplyScalar(0.9 + Math.random() * 0.6).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.6, (Math.random() - 0.5) * 0.8)), t: -i * 0.04 };
      sp.scale.setScalar(0.1);
      sp.visible = false;
      scene.add(sp);
      wolken.push(sp);
    }
  }
  animiert.push((dt) => {
    for (let i = wolken.length - 1; i >= 0; i--) {
      const w = wolken[i];
      w.userData.t += dt;
      if (w.userData.t < 0) continue;
      w.visible = true;
      w.position.addScaledVector(w.userData.v, dt);
      w.userData.v.multiplyScalar(0.94);
      const s = 0.15 + w.userData.t * 1.2;
      w.scale.set(s, s, s);
      w.material.opacity = Math.max(0, 1 - w.userData.t / 1.6);
      if (w.userData.t > 1.6) { scene.remove(w); wolken.splice(i, 1); }
    }
  });

  // Licht an/aus
  const lichtWerte = { himmel: himmel.intensity, sonne: sonne.intensity, fuell: fuell.intensity };
  function licht(an) {
    himmel.intensity = an ? lichtWerte.himmel : 0.12;
    sonne.intensity = an ? lichtWerte.sonne : 0.35;
    fuell.intensity = an ? lichtWerte.fuell : 0;
    roehrenMat.color.setHex(an ? 0xfffbea : 0x3a3a38);
    wippe.rotation.x = an ? 0 : 0.5;
  }

  // ---------- Gasflasche ----------
  const flasche = baueFlasche();
  scene.add(flasche.gruppe);
  merke(flasche.gruppe, 'flasche', 'Gasflasche', null);
  objekte.flasche = flasche;

  // Lage der Flasche je nach Ort
  const flaschenOrte = {
    wasch:    { pos: [4.05, 0.335, 1.95], rot: [0, -0.4, 0], station: 'wasch' },
    werkbank: { pos: [0.05, 1.05, -2.85], rot: [0, 0.0, Math.PI / 2], station: 'werkbank' },
    schweiss: { pos: [3.05, 1.185, -2.95], rot: [0, -Math.PI / 2, 0], station: 'schweiss' },
  };
  const ofenPlatz = { xMin: 2.9, xMax: 3.4, zMin: -2.3, zMax: -1.75 };
  function setzeFlasche(ort, beine) {
    const o = flaschenOrte[ort];
    const g = flasche.gruppe;
    g.position.set(...o.pos);
    g.rotation.set(...o.rot);
    // Mit Beinen ist der Ofen zu hoch für den Tisch: dann steht er davor auf dem Boden
    const aufBoden = ort === 'schweiss' && beine;
    if (aufBoden) {
      g.position.set(3.15, 0.335 + 0.56, -2.0);
      g.rotation.set(0, -Math.PI / 2, 0);
    }
    STATIONEN.schweiss.pos = aufBoden ? [3.0, AUGENHOEHE, -0.15] : [3.0, AUGENHOEHE, -1.1];
    STATIONEN.schweiss.blick = aufBoden ? [3.1, 1.05, -2.3] : [3.1, 0.92, -3.0];
    const i = hindernisse.indexOf(ofenPlatz);
    if (aufBoden && i < 0) hindernisse.push(ofenPlatz);
    if (!aufBoden && i >= 0) hindernisse.splice(i, 1);
    g.userData.interaktiv.station = o.station;
    // Masseklemme liegt sonst neben dem Tisch
  }
  setzeFlasche('wasch');

  function klemmeMasse(an) {
    scene.remove(masseKabel);
    if (an) {
      setze(masse, 3.62, 0.9, -2.72, 0, 0.9, 0.2);
      masseKabel = kabel(masseKabelPunkte([3.62, 0.88, -2.72]), 0x161616);
    } else {
      setze(masse, 3.85, 0.04, -2.05, 0, 0.4, 0);
      masseKabel = kabel(masseKabelPunkte([3.85, 0.04, -2.05]), 0x161616);
    }
  }

  return {
    interaktiv,
    hindernisse,
    objekte,
    zeigeStrom,
    setzeFlasche,
    klemmeMasse,
    licht,
    kiwisZeigen(n) { kiwis.forEach((k, i) => { k.visible = i < n; }); },
    boxTakt(f) { boxBeat = f; },
    dreckHin,
    dreckWeg() { for (const d of dreck) scene.remove(d); dreck.length = 0; dreckMitte = null; },
    get dreckMitte() { return dreckMitte; },
    besenSichtbar(an) { besen.visible = an; },
    BESEN: { x: -4.35, z: 2.05 },
    get dreck() { return dreck.length; },
    KLO: { x: 1.4, z: 3.55 },
    FEUER: { x: 1.55, z: -3.3, vorX: 1.55, vorZ: -2.45 },
    LOESCHER: { x: -2.3, z: 3.35 },
    feuer(an) { feuer.visible = an; feuerLicht.intensity = an ? 4 : 0; },
    get brennt() { return feuer.visible; },
    pulver,
    loescherSichtbar(an) { loescher.visible = an; },
    SOFA: { x: -3.2, z: RAUM.zMax - 0.45, sitzZ: RAUM.zMax - 0.5, vorneZ: RAUM.zMax - 1.15 },
    update(dt) {
      for (const a of animiert) a(dt);
    },
  };
}

// Gasflasche mit allen Ausbaustufen (Tür, Scharniere, Beine, Rohr, Nähte)
function baueFlasche() {
  const gruppe = new THREE.Group();
  const R = 0.15;
  const profil = [
    [0, -0.3075], [0.1, -0.3075], [0.135, -0.295], [0.15, -0.26], [0.15, 0.2], [0.142, 0.24],
    [0.118, 0.272], [0.075, 0.296], [0.035, 0.305], [0, 0.3075],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const koerper = teil(new THREE.LatheGeometry(profil, 32), FARBE.flasche, { umriss: 0.008 });
  gruppe.add(koerper);
  // Fußring und Schutzkragen
  const fussring = teil(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 24, 1, true), FARBE.flasche, { mat: { side: THREE.DoubleSide }, umriss: 0.006 });
  gruppe.add(setze(fussring, 0, -0.31, 0));
  const kragen = teil(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 20, 1, true, 0.5, Math.PI * 1.6), FARBE.flasche, { mat: { side: THREE.DoubleSide }, umriss: 0.006 });
  setze(kragen, 0, 0.33, 0);
  gruppe.add(kragen);
  // Ventil
  const ventil = new THREE.Group();
  ventil.add(setze(zylinder(0.018, 0.02, 0.06, FARBE.messing, {}, 10), 0, 0.33, 0));
  ventil.add(setze(zylinder(0.01, 0.01, 0.04, FARBE.messing, {}, 8), 0.03, 0.335, 0, 0, 0, Math.PI / 2));
  const rad = setze(teil(new THREE.TorusGeometry(0.028, 0.007, 6, 16), 0x2a2a2a), 0, 0.37, 0, Math.PI / 2, 0, 0);
  ventil.add(rad);
  gruppe.add(ventil);

  // Aufkleber
  const etikett = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#111'; g.font = 'bold 30px Arial'; g.textAlign = 'center';
    g.fillText('PROPAN 11 kg', b / 2, 42);
  });
  const etikettMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.002, R + 0.002, 0.07, 24, 1, true, -Math.PI / 2 - 0.6, 1.2),
    toon(0xffffff, { map: etikett, side: THREE.DoubleSide }),
  );
  etikettMesh.position.y = 0.12;
  gruppe.add(etikettMesh);

  // Tür: unten an der Seite (lokal +X). Liegt die Flasche auf der Werkbank, zeigt sie nach oben,
  // steht sie auf dem Schweißtisch, zeigt sie nach vorn.
  const tBreite = 1.25;
  const t0 = Math.PI / 2 - tBreite / 2;
  const tHoehe = 0.24;
  const tY = -0.1;
  const markTex = leinwandTextur(256, 256, (g, b, h) => {
    g.clearRect(0, 0, b, h);
    g.strokeStyle = '#1f4fd1';
    g.lineWidth = 9;
    g.setLineDash([]);
    g.strokeRect(10, 10, b - 20, h - 20);
  });
  const markierung = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.003, R + 0.003, tHoehe, 16, 1, true, t0, tBreite),
    new THREE.MeshBasicMaterial({ map: markTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
  );
  markierung.position.y = tY;
  markierung.visible = false;
  gruppe.add(markierung);

  const loch = new THREE.Mesh(
    new THREE.CylinderGeometry(R + 0.0015, R + 0.0015, tHoehe, 16, 1, true, t0, tBreite),
    new THREE.MeshBasicMaterial({ color: 0x0b0b0b, side: THREE.DoubleSide }),
  );
  loch.position.y = tY;
  loch.visible = false;
  gruppe.add(loch);

  const lackMats = [koerper.material, fussring.material, kragen.material];
  const dunkelMats = [];
  const scharnierPunkt = new THREE.Vector3(Math.sin(t0) * R, tY, Math.cos(t0) * R);
  const tuerDreh = new THREE.Group();
  tuerDreh.position.copy(scharnierPunkt);
  const tuer = teil(new THREE.CylinderGeometry(R + 0.006, R + 0.006, tHoehe, 16, 1, true, t0, tBreite), FARBE.flasche, { mat: { side: THREE.DoubleSide }, umriss: 0.005 });
  tuer.position.set(-scharnierPunkt.x, 0, -scharnierPunkt.z);
  tuerDreh.add(tuer);
  lackMats.push(tuer.material);
  // Holzgriff an der Tür
  const griffWinkel = t0 + tBreite - 0.22;
  const knauf = zylinder(0.011, 0.011, 0.08, 0xd9b98a, { umriss: 0.004 }, 10);
  knauf.position.set(Math.sin(griffWinkel) * (R + 0.04) - scharnierPunkt.x, -0.02, Math.cos(griffWinkel) * (R + 0.04) - scharnierPunkt.z);
  knauf.rotation.set(Math.PI / 2, 0, 0);
  knauf.rotation.order = 'YXZ';
  knauf.rotation.y = griffWinkel;
  tuerDreh.add(knauf);
  tuerDreh.visible = false;
  gruppe.add(tuerDreh);

  const nahtMats = [];
  function nahtMat() {
    const m = toon(NAHT.schlacke);
    nahtMats.push(m);
    return m;
  }
  function dunkel(farbe) {
    const m = toon(farbe);
    m.userData.grund = farbe;
    dunkelMats.push(m);
    return m;
  }

  // Scharniere an der Tür und zwei Tragegriffe an den Seiten
  const scharniere = new THREE.Group();
  for (const dy of [-0.07, 0.07]) {
    const s = new THREE.Group();
    s.add(teil(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 10), 0, { material: dunkel(FARBE.stahlHell) }));
    s.add(setze(teil(new THREE.BoxGeometry(0.012, 0.05, 0.03), 0, { material: nahtMat() }), 0.0, 0, 0.018));
    s.position.set(scharnierPunkt.x + 0.008, tY + dy, scharnierPunkt.z + 0.008);
    scharniere.add(s);
  }
  for (const seite of [-1, 1]) {
    const g = new THREE.Group();
    const mat = dunkel(FARBE.stahlDunkel);
    g.add(setze(teil(new THREE.BoxGeometry(0.014, 0.08, 0.014), 0, { material: mat, umriss: 0.004 }), 0, 0, 0.055 * seite));
    for (const dy of [-0.035, 0.035]) g.add(setze(teil(new THREE.BoxGeometry(0.014, 0.014, 0.06), 0, { material: mat, umriss: 0.004 }), 0, dy, 0.028 * seite));
    g.add(setze(teil(new THREE.BoxGeometry(0.02, 0.09, 0.008), 0, { material: nahtMat() }), 0, 0, 0.002 * seite));
    g.position.set(0, 0.16, (R - 0.004) * seite);
    scharniere.add(g);
  }
  scharniere.visible = false;
  gruppe.add(scharniere);

  // Drei schräge Beine am Fußring
  const beine = new THREE.Group();
  for (let k = 0; k < 3; k++) {
    const winkel = Math.PI + (k * Math.PI * 2) / 3;
    const aussen = new THREE.Group();
    aussen.position.set(Math.cos(winkel) * 0.105, -0.33, Math.sin(winkel) * 0.105);
    aussen.rotation.y = -winkel;
    const innen = new THREE.Group();
    innen.rotation.z = 0.28;
    innen.add(setze(teil(new THREE.CylinderGeometry(0.016, 0.016, 0.6, 10), 0, { material: dunkel(0x2e3033) }), 0, -0.3, 0));
    const naht = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 12), nahtMat());
    naht.rotation.x = Math.PI / 2;
    innen.add(naht);
    aussen.add(innen);
    beine.add(aussen);
  }
  beine.visible = false;
  gruppe.add(beine);

  // Ofenrohr oben, wo vorher das Ventil saß
  const rohr = new THREE.Group();
  rohr.add(setze(teil(new THREE.CylinderGeometry(0.055, 0.055, 0.65, 18), 0, { material: dunkel(0x2e3033) }), 0, 0.625, 0));
  const rohrNaht = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.009, 6, 18), nahtMat());
  rohrNaht.rotation.x = Math.PI / 2;
  rohrNaht.position.y = 0.3;
  rohr.add(rohrNaht);
  rohr.visible = false;
  gruppe.add(rohr);

  const LACK = 0x2b2c2f;
  return {
    gruppe,
    ventil: rad,
    zeige(zustand) {
      markierung.visible = zustand.angezeichnet && !zustand.geschnitten;
      loch.visible = zustand.geschnitten;
      tuerDreh.visible = zustand.geschnitten;
      tuerDreh.rotation.y = !zustand.geschnitten ? 0 : zustand.naehte.scharniere !== null ? -0.35 : -1.9;
      scharniere.visible = zustand.naehte.scharniere !== null;
      beine.visible = zustand.naehte.beine !== null;
      rohr.visible = zustand.naehte.rohr !== null;
      ventil.visible = !rohr.visible;
      kragen.visible = !rohr.visible;
      etikettMesh.visible = !zustand.lackiert;
      for (const m of lackMats) m.color.setHex(zustand.lackiert ? LACK : FARBE.flasche);
      for (const m of dunkelMats) m.color.setHex(zustand.lackiert ? LACK : m.userData.grund);
      const farbe = zustand.lackiert ? LACK : zustand.schlackeWeg ? NAHT.sauber : NAHT.schlacke;
      for (const m of nahtMats) m.color.setHex(farbe);
    },
  };
}
