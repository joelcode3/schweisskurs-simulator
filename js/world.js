// Die Werkstatt: Raum, Möbel, Werkzeuge, Gasflasche.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall, umriss } from './toon.js';
import { baueDraussen } from './draussen.js';
import { baueCarport } from './carport.js';
import { gelaendeHoehe } from './landschaft.js';

export const RAUM = { xMin: -5, xMax: 5, zMin: -4, zMax: 4, hoehe: 3.9 };
// Bad hinter der WC-Tür (vorne rechts), begehbar
export const BAD = { xMin: 0.7, xMax: 3.9, zMin: 4.0, zMax: 6.8, hoehe: 2.6 };
const KLO_TUER = { xMin: 0.975, xMax: 1.825, hoehe: 2.05 };
export const AUGENHOEHE = 1.65;

// Stationen: Kameraposition und Blickziel
export const STATIONEN = {
  eingang:  { name: 'Eingang',     pos: [0, AUGENHOEHE, 3.0],    blick: [0, 1.1, -2] },
  draussen: { name: 'Draußen',     pos: [-0.75, AUGENHOEHE, 4.95], blick: [-0.55, 0.45, 6.1] },
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
    const h = { xMin, xMax, zMin, zMax };
    hindernisse.push(h);
    return h;
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

  // Wände: alter Putz, unten grüngrau gestrichen, Putz bröckelt stellenweise (Ziegel schauen raus),
  // Risse, Wasserflecken. Jede Wand hat ihre eigene Leinwand (ca. 160 Pixel pro Meter).
  const PX = 160;
  const SOCKEL = 1.25; // Höhe des gestrichenen Sockels in Metern
  function wandMalen(g, b, h, saat, unten = 0) {
    const r = zufall(saat);
    const m = (y) => h - (y - unten) * PX; // Meter über Boden -> Pixel-Zeile
    g.fillStyle = '#e3d6ba'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#6f7b77'; g.fillRect(0, m(SOCKEL), b, SOCKEL * PX);
    g.fillStyle = '#3a3f3d'; g.fillRect(0, m(SOCKEL) - 4, b, 6);
    for (let i = 0; i < b * h / 260; i++) {
      g.fillStyle = `rgba(90,80,60,${r() * 0.07})`;
      g.fillRect(r() * b, r() * h, 3 + r() * 8, 3 + r() * 8);
    }
    // Wasserflecken von oben
    for (let i = 0; i < 3; i++) {
      const x = r() * b, lang = (0.8 + r() * 1.6) * PX;
      const gr = g.createLinearGradient(0, 0, 0, lang);
      gr.addColorStop(0, 'rgba(120,95,60,0.28)'); gr.addColorStop(1, 'rgba(120,95,60,0)');
      g.fillStyle = gr; g.fillRect(x, 0, 30 + r() * 60, lang);
    }
    // Putzschäden: Ziegel und Mörtel unter abgebröckeltem Putz
    for (let i = 0; i < Math.round(b / PX * 0.7); i++) {
      const cx = r() * b, cy = m(0.4 + r() * (RAUM.hoehe - 0.8));
      const rx = 30 + r() * 70, ry = 20 + r() * 45;
      const pkt = [];
      for (let k = 0; k < 11; k++) { const w = (k / 11) * Math.PI * 2; const f = 0.6 + r() * 0.5; pkt.push([cx + Math.cos(w) * rx * f, cy + Math.sin(w) * ry * f]); }
      const pfad = () => { g.beginPath(); pkt.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
      // heller Rand vom Putz
      g.save(); g.translate(2, 3); pfad(); g.fillStyle = '#f2e9d6'; g.fill(); g.restore();
      g.save(); pfad(); g.clip();
      g.fillStyle = '#b9b2a2'; g.fillRect(cx - rx * 1.2, cy - ry * 1.2, rx * 2.4, ry * 2.4);
      const zh = 11, zb = 38;
      for (let y = Math.floor((cy - ry * 1.2) / zh) * zh; y < cy + ry * 1.2; y += zh) {
        const versatz = (Math.floor(y / zh) % 2) * zb / 2;
        for (let x = Math.floor((cx - rx * 1.2) / zb) * zb - versatz; x < cx + rx * 1.2; x += zb) {
          const t = 150 + r() * 40;
          g.fillStyle = `rgb(${t},${t * 0.48},${t * 0.36})`;
          g.fillRect(x + 1.5, y + 1.5, zb - 3, zh - 3);
        }
      }
      // Schatten unter der Putzkante oben
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(cx - rx * 1.2, cy - ry * 1.2, rx * 2.4, 6);
      g.restore();
      pfad(); g.strokeStyle = 'rgba(60,50,40,0.75)'; g.lineWidth = 2.5; g.stroke();
      // ein paar lose Bröckchen drumherum
      g.fillStyle = 'rgba(150,140,120,0.8)';
      for (let k = 0; k < 6; k++) g.fillRect(cx + (r() - 0.5) * rx * 2.6, cy + (r() - 0.5) * ry * 2.6, 3 + r() * 5, 3 + r() * 4);
    }
    // Risse
    g.strokeStyle = 'rgba(55,48,40,0.55)'; g.lineWidth = 1.6;
    for (let i = 0; i < Math.round(b / PX * 0.8); i++) {
      let x = r() * b, y = r() * h;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 7; k++) { x += (r() - 0.5) * 40; y += 8 + r() * 22; g.lineTo(x, y); }
      g.stroke();
    }
  }
  // loch: [u0, u1, v0, v1] in Anteilen der Wand (v von oben) – dort ist die Wand durchsichtig ausgeschnitten (Fenster)
  const wandStueck = (b, x, z, ry, saat, hoehe = RAUM.hoehe, unten = 0, loch = null) => {
    const tex = leinwandTextur(Math.round(b * PX), Math.round(hoehe * PX), (g, bb, hh) => {
      wandMalen(g, bb, hh, saat, unten);
      if (loch) g.clearRect(loch[0] * bb, loch[2] * hh, (loch[1] - loch[0]) * bb, (loch[3] - loch[2]) * hh);
    });
    const w = new THREE.Mesh(new THREE.PlaneGeometry(b, hoehe), toon(0xffffff, loch ? { map: tex, alphaTest: 0.5, side: THREE.DoubleSide } : { map: tex }));
    w.position.set(x, unten + hoehe / 2, z);
    w.rotation.y = ry;
    w.receiveShadow = true;
    scene.add(w);
  };
  wandStueck(10, 0, RAUM.zMin, 0, 11);
  // Vorderwand mit Öffnung für die WC-Tür
  // links vom Tor, zwischen Tor und WC-Tür, Sturz über dem Tor (das Tor steht offen, dahinter ist draußen)
  const TOR_L = -0.85 - 1.3, TOR_R = -0.85 + 1.3, TOR_HOEHE = 3.0;
  wandStueck(TOR_L - RAUM.xMin, (RAUM.xMin + TOR_L) / 2, RAUM.zMax, Math.PI, 12);
  wandStueck(KLO_TUER.xMin - TOR_R, (TOR_R + KLO_TUER.xMin) / 2, RAUM.zMax, Math.PI, 17);
  wandStueck(TOR_R - TOR_L, -0.85, RAUM.zMax, Math.PI, 18, RAUM.hoehe - TOR_HOEHE, TOR_HOEHE);
  wandStueck(RAUM.xMax - KLO_TUER.xMax, (KLO_TUER.xMax + RAUM.xMax) / 2, RAUM.zMax, Math.PI, 15);
  wandStueck(KLO_TUER.xMax - KLO_TUER.xMin, (KLO_TUER.xMin + KLO_TUER.xMax) / 2, RAUM.zMax, Math.PI, 16, RAUM.hoehe - KLO_TUER.hoehe, KLO_TUER.hoehe);
  // linke Wand mit echtem Fensterloch (z 0,82–2,38, Höhe 1,47–2,43): man kann rein- und rausgucken
  wandStueck(8, RAUM.xMin, 0, Math.PI / 2, 13, RAUM.hoehe, 0, [(4 - 2.38) / 8, (4 - 0.82) / 8, (RAUM.hoehe - 2.43) / RAUM.hoehe, (RAUM.hoehe - 1.47) / RAUM.hoehe]);
  wandStueck(8, RAUM.xMax, 0, -Math.PI / 2, 14);

  // Decke: heller Putz, ohne Balken (MeshBasic, damit sie von unten nicht dunkel wirkt)
  const deckenTex = leinwandTextur(512, 512, (g, b, h) => {
    g.fillStyle = '#ece6d8'; g.fillRect(0, 0, b, h);
    const r = zufall(41);
    for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(120,105,80,${r() * 0.06})`; g.fillRect(r() * b, r() * h, 3 + r() * 9, 3 + r() * 9); }
    for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(140,120,90,0.12)'; g.beginPath(); g.ellipse(r() * b, r() * h, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, Math.PI * 2); g.fill(); }
  }, [3, 3]);
  const decke = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), new THREE.MeshBasicMaterial({ map: deckenTex, color: 0xd9d3c5 }));
  decke.rotation.x = Math.PI / 2;
  decke.position.y = RAUM.hoehe;
  scene.add(decke);

  // Leuchtstoffröhren
  const roehrenMat = new THREE.MeshBasicMaterial({ color: 0xfffbea });
  for (const [x, z] of [[-2.5, -1.5], [2.5, -1.5], [-2.5, 1.8], [2.5, 1.8]]) {
    // Lampen hängen an Ketten auf ca. 3,25 m
    const haengeY = 3.25;
    const gehaeuse = quader(1.3, 0.06, 0.2, 0xd8d8d8, { wirft: false });
    setze(gehaeuse, x, haengeY, z);
    scene.add(gehaeuse);
    const r = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.08), roehrenMat);
    r.position.set(x, haengeY - 0.045, z);
    scene.add(r);
    for (const dx of [-0.55, 0.55]) scene.add(setze(zylinder(0.006, 0.006, RAUM.hoehe - haengeY, 0x555555, { umriss: false, wirft: false }, 5), x + dx, (RAUM.hoehe + haengeY) / 2, z));
  }

  // Zwei gelbe Stromverteiler-Würfel hängen an Kabeln tief von der Decke (Dennis stößt sich den Kopf)
  const steckdosenTex = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#f2c21c'; g.fillRect(0, 0, b, h);
    g.strokeStyle = '#8a6a00'; g.lineWidth = 3; g.strokeRect(2, 2, b - 4, h - 4);
    // eine Schutzkontakt-Steckdose pro Seite
    const x = 64, y = 64;
    g.fillStyle = '#e9e9e4'; g.beginPath(); g.arc(x, y, 46, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#333'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#c8c8c0'; g.beginPath(); g.arc(x, y, 31, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.arc(x - 13, y, 6, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x + 13, y, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9aa0a6'; g.fillRect(x - 4, y - 31, 8, 8); g.fillRect(x - 4, y + 23, 8, 8);
  });
  const steckdosenMat = toon(0xffffff, { map: steckdosenTex });
  const stromWuerfel = [];
  for (const [x, z] of [[2.6, 1.0], [-2.9, -1.4]]) {
    const pendel = new THREE.Group();
    pendel.position.set(x, RAUM.hoehe, z);
    const kabelLaenge = RAUM.hoehe - 1.93;
    pendel.add(setze(zylinder(0.012, 0.012, kabelLaenge, 0x1d1d1f, { umriss: false, wirft: false }, 6), 0, -kabelLaenge / 2, 0));
    const w = teil(new THREE.BoxGeometry(0.18, 0.18, 0.18), 0, { material: steckdosenMat, umriss: 0.003 });
    w.position.y = -kabelLaenge - 0.09;
    pendel.add(w);
    pendel.add(setze(zylinder(0.025, 0.032, 0.03, 0x1d1d1f, { umriss: 0.002 }, 8), 0, -kabelLaenge + 0.015, 0));
    scene.add(pendel);
    merke(pendel, 'stromwuerfel', 'Stromverteiler', null);
    stromWuerfel.push({ pendel, x, z, schwung: 0, t: 0 });
  }
  animiert.push((dt) => {
    for (const s of stromWuerfel) {
      if (s.schwung <= 0.001) continue;
      s.t += dt;
      s.schwung *= Math.pow(0.35, dt);
      s.pendel.rotation.x = Math.sin(s.t * 3.2) * s.schwung;
      s.pendel.rotation.z = Math.cos(s.t * 2.7) * s.schwung * 0.6;
    }
  });

  // Fenster links
  const fenster = new THREE.Group();
  const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshBasicMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }));
  glas.raycast = () => {};
  fenster.add(glas);
  const rahmenTeile = [[1.7, 0.08, 0, 0.52], [1.7, 0.08, 0, -0.52], [0.08, 1.1, -0.82, 0], [0.08, 1.1, 0.82, 0], [0.05, 1.0, 0, 0], [1.6, 0.05, 0, 0]];
  for (const [b, h, x, y] of rahmenTeile) {
    const r = quader(b, h, 0.06, 0xf0f0ea, { wirft: false });
    r.position.set(x, y, 0.02);
    fenster.add(r);
  }
  setze(fenster, RAUM.xMin + 0.01, 1.95, 1.6, 0, Math.PI / 2, 0);
  scene.add(fenster);

  // Eingang vorne: breites grünes Scheunentor (zwei Flügel, Bretter, helle Z-Streben, Bänder), Rauchen-verboten-Schild
  const tuer = new THREE.Group();
  const torGruen = 0x2f6b3a;
  const bretter = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#2f6b3a'; g.fillRect(0, 0, b, h);
    const r = zufall(21);
    for (let x = 0; x < b; x += 32) {
      g.fillStyle = `rgba(0,0,0,${0.05 + r() * 0.08})`; g.fillRect(x, 0, 32, h);
      g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x, 0, 3, h);
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(x + 6 + r() * 20, r() * h, 2, 20 + r() * 50); }
    }
    // abgeplatzte Farbe
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(120,90,60,0.6)'; g.beginPath(); g.ellipse(r() * b, r() * h, 3 + r() * 8, 2 + r() * 5, r() * 3, 0, Math.PI * 2); g.fill(); }
  }, [1.5, 1.5]);
  const brettMat = toon(0xffffff, { map: bretter });
  const TOR_B = 1.3, TOR_H = 3.0;
  let fluegelRechts = null, handSchildFertig = null;
  // Schlupftür im linken Flügel (von draußen gesehen rechts der Mitte), lokal x -0,9 … -0,1, 2,05 m hoch
  const TUER_X0 = -0.9, TUER_X1 = -0.1, TUER_H = 2.05;
  for (const seite of [-1, 1]) {
    const fluegel = new THREE.Group();
    const mitte = seite * TOR_B / 2;
    const brett = (x0, x1, y0, y1) => fluegel.add(setze(teil(new THREE.BoxGeometry(x1 - x0, y1 - y0, 0.07), 0, { material: brettMat, umriss: 0.004 }), (x0 + x1) / 2 - mitte, (y0 + y1) / 2, 0));
    const strebe = (bb, hh, x, y, rz = 0) => fluegel.add(setze(quader(bb, hh, 0.04, 0x2a6234, { umriss: 0.003 }), x, y, 0.05, 0, 0, rz));
    const strebeAussen = (bb, hh, x, y, rz = 0) => fluegel.add(setze(quader(bb, hh, 0.04, 0x2a6234, { umriss: 0.003 }), x, y, -0.05, 0, 0, rz));
    if (seite === 1) {
      brett(0, TOR_B, 0, TOR_H);
      for (const st of [strebe, strebeAussen]) {
        st(TOR_B, 0.12, 0, 0.12); st(TOR_B, 0.12, 0, TOR_H / 2); st(TOR_B, 0.12, 0, TOR_H - 0.12);
        st(0.12, TOR_H, -TOR_B / 2 + 0.06, TOR_H / 2); st(0.12, TOR_H, TOR_B / 2 - 0.06, TOR_H / 2);
        const diag = Math.hypot(TOR_B - 0.24, TOR_H / 2 - 0.24);
        const w = Math.atan2(TOR_H / 2 - 0.24, TOR_B - 0.24);
        st(diag, 0.11, 0, TOR_H * 0.31, w); st(diag, 0.11, 0, TOR_H * 0.69, w);
      }
    } else {
      // Flügel mit Ausschnitt für die Tür: links, rechts daneben und oben drüber
      brett(-TOR_B, TUER_X0, 0, TOR_H);
      brett(TUER_X1, 0, 0, TOR_H);
      brett(TUER_X0, TUER_X1, TUER_H, TOR_H);
      const l0 = -TOR_B - mitte, l1 = TUER_X0 - mitte, r0 = TUER_X1 - mitte, r1 = -mitte;
      for (const st of [strebe, strebeAussen]) {
        st(TOR_B, 0.12, 0, TOR_H - 0.12);
        st(TOR_B, 0.1, 0, TUER_H + 0.05);
        for (const [a0, a1] of [[l0, l1], [r0, r1]]) { st(a1 - a0, 0.12, (a0 + a1) / 2, 0.12); st(a1 - a0, 0.12, (a0 + a1) / 2, TOR_H / 2); }
        st(0.12, TOR_H, l0 + 0.06, TOR_H / 2); st(0.12, TOR_H, r1 - 0.06, TOR_H / 2);
        st(0.08, TUER_H, l1 - 0.04, TUER_H / 2); st(0.08, TUER_H, r0 + 0.04, TUER_H / 2);
        const dg = Math.hypot(TUER_X1 - TUER_X0 - 0.1, TOR_H - TUER_H - 0.2);
        st(dg, 0.1, (TUER_X0 + TUER_X1) / 2 - mitte, (TUER_H + TOR_H) / 2, -Math.atan2(TOR_H - TUER_H - 0.2, TUER_X1 - TUER_X0 - 0.1));
      }
      // die Schlupftür: eigene Bretter, Z-Strebe, schwarze Bänder, Drückergarnitur; steht offen nach draußen
      const tuerDreh = new THREE.Group();
      // Band an der Außenseite der Tür (zur Torecke hin), Drücker zur Tormitte
      tuerDreh.position.set(TUER_X0 - mitte, 0, 0);
      const blatt = new THREE.Group();
      const tb = TUER_X1 - TUER_X0 - 0.02;
      blatt.add(setze(teil(new THREE.BoxGeometry(tb, TUER_H - 0.02, 0.06), 0, { material: brettMat, umriss: 0.004 }), -tb / 2, TUER_H / 2, 0));
      for (const z of [0.045, -0.045]) {
        const bs = (bb, hh, x, y, rz = 0) => blatt.add(setze(quader(bb, hh, 0.03, 0x2a6234, { umriss: 0.003 }), x, y, z, 0, 0, rz));
        bs(tb, 0.1, -tb / 2, 0.15); bs(tb, 0.1, -tb / 2, TUER_H / 2); bs(tb, 0.1, -tb / 2, TUER_H - 0.15);
        const dz = Math.hypot(tb - 0.1, TUER_H / 2 - 0.25);
        bs(dz, 0.09, -tb / 2, TUER_H * 0.28, Math.atan2(TUER_H / 2 - 0.25, tb - 0.1)); bs(dz, 0.09, -tb / 2, TUER_H * 0.72, Math.atan2(TUER_H / 2 - 0.25, tb - 0.1));
      }
      for (const y of [0.3, TUER_H - 0.3]) {
        blatt.add(setze(quader(0.32, 0.05, 0.075, 0x1d1d1f, { umriss: 0.002 }), -0.16, y, 0));
        blatt.add(setze(zylinder(0.022, 0.022, 0.1, 0x1d1d1f, {}, 8), 0.0, y, 0));
      }
      for (const z of [0.06, -0.06]) {
        blatt.add(setze(quader(0.04, 0.18, 0.012, 0x8a8f96, { umriss: 0.0015 }), -tb + 0.08, 1.0, z));
        blatt.add(setze(zylinder(0.012, 0.012, 0.11, 0x8a8f96, { umriss: 0.0015 }, 8), -tb + 0.12, 1.04, z * 1.3, 0, 0, Math.PI / 2));
      }
      blatt.rotation.y = Math.PI;
      tuerDreh.add(blatt);
      tuerDreh.rotation.y = Math.PI * 0.47;
      fluegel.add(tuerDreh);
      // kleines handgeschriebenes Schild, mit einem Nagel neben die Tür gehauen (Außenseite)
      const handTex = leinwandTextur(256, 160, (g, b, h) => {
        g.fillStyle = '#d8c39a'; g.fillRect(0, 0, b, h);
        const r = zufall(77);
        for (let y = 0; y < h; y += 5) { g.fillStyle = `rgba(110,80,45,${0.06 + r() * 0.08})`; g.fillRect(0, y, b, 2); }
        g.fillStyle = '#1d1d1f'; g.textAlign = 'center';
        g.font = 'bold 46px Caveat, "Comic Sans MS", cursive';
        g.save(); g.translate(b / 2, 66); g.rotate(-0.05); g.fillText('Schweisskurs,', 0, 0); g.restore();
        g.save(); g.translate(b / 2 + 6, 122); g.rotate(-0.03); g.fillText('nicht stören!', 0, 0); g.restore();
      });
      const handSchild = new THREE.Group();
      handSchild.add(setze(quader(0.3, 0.19, 0.012, 0xc9b087, { umriss: 0.002 }), 0, 0, 0));
      const hsBild = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), new THREE.MeshBasicMaterial({ map: handTex }));
      hsBild.position.z = -0.007;
      hsBild.rotation.y = Math.PI;
      handSchild.add(hsBild);
      handSchild.add(setze(zylinder(0.008, 0.006, 0.02, 0x8a8f96, { umriss: 0.001 }, 8), 0, 0.07, -0.012, Math.PI / 2, 0, 0));
      // hängt rechts neben der Tür auf dem anderen Flügel (links steht die offene Tür davor)
      handSchild.position.set(0.32 - TOR_B / 2, 1.62, -0.085);
      handSchild.rotation.z = 0.06;
      handSchildFertig = handSchild;
    }
    // schwarze Langbänder an der Außenkante (innen und außen)
    // am Flügel mit der Schlupftür endet das untere Band an der Türkante (ragt nicht in den Durchgang)
    for (const y of [0.45, TOR_H - 0.45]) for (const z of [0.08, -0.08]) {
      const kurz = seite === -1 && y < TUER_H;
      const aussen = seite * TOR_B / 2, innen = kurz ? TUER_X0 - mitte - 0.02 : seite * (TOR_B / 2 - 0.6);
      fluegel.add(setze(quader(Math.abs(aussen - innen), 0.06, 0.02, 0x1d1d1f, { umriss: 0.002 }), (aussen + innen) / 2, y, z));
    }
    for (const y of [0.45, TOR_H - 0.45]) fluegel.add(setze(zylinder(0.03, 0.03, 0.12, 0x1d1d1f, {}, 8), seite * (TOR_B / 2 + 0.01), y, 0.04));
    // Tor bleibt zu: Flügel stehen geschlossen in der Öffnung
    fluegel.position.x = mitte;
    tuer.add(fluegel);
    if (seite === 1) fluegelRechts = fluegel;
  }
  fluegelRechts.add(handSchildFertig);
  // Riegel über beide Flügel (Tor ist zu)
  tuer.add(setze(quader(0.5, 0.07, 0.05, torGruen, { umriss: 0.002 }), TOR_B * 0.3, 1.6, 0.13));
  tuer.add(setze(quader(2 * TOR_B + 0.2, 0.12, 0.1, torGruen), 0, TOR_H + 0.06, 0.0));
  // Rauchen-verboten-Schild
  const verbotTex = leinwandTextur(256, 320, (g) => {
    g.fillStyle = '#fbfaf5'; g.fillRect(0, 0, 256, 320);
    g.strokeStyle = '#222'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 316);
    // Zigarette mit Glut und Rauch
    g.fillStyle = '#f4f0e6'; g.strokeStyle = '#111'; g.lineWidth = 4;
    g.fillRect(48, 120, 130, 26); g.strokeRect(48, 120, 130, 26);
    g.fillStyle = '#d9a35a'; g.fillRect(48, 120, 36, 26); g.strokeRect(48, 120, 36, 26);
    g.fillStyle = '#e2531e'; g.fillRect(178, 120, 14, 26);
    g.strokeStyle = '#555'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(186, 112); g.bezierCurveTo(170, 90, 205, 80, 188, 56); g.stroke();
    // roter Ring mit Balken
    g.strokeStyle = '#d0201a'; g.lineWidth = 22;
    g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(128 - 69, 128 - 69); g.lineTo(128 + 69, 128 + 69); g.stroke();
    g.fillStyle = '#111'; g.font = 'bold 34px Arial'; g.textAlign = 'center';
    g.fillText('RAUCHEN', 128, 270); g.fillText('VERBOTEN', 128, 304);
    // altes Blechschild: Rostflecken, Rostfahnen unter den Schrauben, abgeplatzter Lack an den Ecken
    const rost = (x, y, rx, ry, a) => { g.fillStyle = `rgba(${140 + Math.random() * 40},${60 + Math.random() * 25},20,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, Math.random() * 3, 0, Math.PI * 2); g.fill(); };
    for (const [x, y] of [[14, 14], [242, 14], [14, 306], [242, 306]]) {
      for (let i = 0; i < 6; i++) rost(x + (Math.random() - 0.5) * 18, y + (Math.random() - 0.5) * 18, 4 + Math.random() * 9, 3 + Math.random() * 7, 0.55);
      g.fillStyle = 'rgba(130,60,20,0.35)'; g.fillRect(x - 3, y, 6, 40 + Math.random() * 40);
    }
    for (let i = 0; i < 26; i++) rost(Math.random() * 256, Math.random() * 320, 1 + Math.random() * 5, 1 + Math.random() * 4, 0.35 + Math.random() * 0.3);
    g.fillStyle = 'rgba(120,55,20,0.25)'; g.fillRect(0, 300, 256, 20);
    // Schrauben
    for (const [x, y] of [[14, 14], [242, 14], [14, 306], [242, 306]]) { g.fillStyle = '#6b6f75'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#333'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.stroke(); }
  });
  // vor den Streben auf ein Blech geschraubt (vorher verdeckte die schräge Strebe die Schrift)
  const rauchBlech = setze(quader(0.44, 0.545, 0.008, 0x8a8478, { umriss: 0.002 }), 0, 2.12, 0.115);
  fluegelRechts.add(rauchBlech);
  const rauchSchild = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.525), new THREE.MeshBasicMaterial({ map: verbotTex }));
  rauchSchild.position.set(0, 2.12, 0.1205);
  fluegelRechts.add(rauchSchild);
  setze(tuer, -0.85, 0, RAUM.zMax - 0.05, 0, Math.PI, 0);
  scene.add(tuer);

  // ---------- Draußen (js/draussen.js) ----------
  const draussen = baueDraussen(scene, { merke, hindernis, RAUM });
  if (draussen.update) animiert.push(draussen.update);
  // Carport mit Wohnwagen und Dennis' Benz auf der Wiese (js/carport.js)
  const carport = baueCarport(scene, { merke, hindernis });

  // Feuerlöscher an der rechten Wand zwischen Schweißplatz und Waschplatz
  const loescher = new THREE.Group();
  loescher.add(setze(zylinder(0.09, 0.09, 0.5, FARBE.rot), 0, 0.25, 0));
  loescher.add(setze(kugel(0.09, FARBE.rot), 0, 0.5, 0));
  loescher.add(setze(zylinder(0.025, 0.025, 0.08, FARBE.schwarz), 0, 0.6, 0));
  loescher.add(setze(quader(0.12, 0.025, 0.03, FARBE.schwarz), 0.04, 0.65, 0));
  setze(loescher, RAUM.xMax - 0.14, 0.9, -1.0, 0, -Math.PI / 2, 0);
  scene.add(loescher);
  scene.add(setze(quader(0.14, 0.04, 0.22, 0x444444), RAUM.xMax - 0.1, 0.88, -1.0));
  merke(loescher, 'feuerloescher', 'Feuerlöscher', null);
  objekte.feuerloescher = loescher;
  loescher.userData.wand = { pos: loescher.position.clone(), rot: loescher.rotation.clone() };

  // Erste-Hilfe-Kasten neben dem Feuerlöscher
  const ersteHilfe = new THREE.Group();
  ersteHilfe.add(quader(0.34, 0.26, 0.11, 0x1f8a4c));
  ersteHilfe.add(setze(quader(0.07, 0.17, 0.005, 0xffffff, { umriss: false }), 0, 0, 0.056));
  ersteHilfe.add(setze(quader(0.17, 0.07, 0.005, 0xffffff, { umriss: false }), 0, 0, 0.056));
  ersteHilfe.add(setze(quader(0.08, 0.02, 0.03, 0x14301f), 0, 0.14, 0.02));
  setze(ersteHilfe, RAUM.xMax - 0.06, 1.45, -1.55, 0, -Math.PI / 2, 0);
  scene.add(ersteHilfe);
  merke(ersteHilfe, 'ersteHilfe', 'Erste-Hilfe-Kasten', null);

  // Hula-Hoop-Reifen an der Rückwand zwischen Regal und Werkbank
  const reifen = baueReifen();
  setze(reifen, -2.9, 1.55, RAUM.zMin + 0.06);
  scene.add(reifen);
  scene.add(setze(zylinder(0.008, 0.008, 0.08, 0x7a7a7a, {}, 6), -2.9, 1.98, RAUM.zMin + 0.03, Math.PI / 2, 0, 0));
  merke(reifen, 'hulahup', 'Hula-Hoop-Reifen', null);
  reifen.userData.liegend = true;
  objekte.hulahup = reifen;
  reifen.userData.wand = { pos: reifen.position.clone(), rot: reifen.rotation.clone() };

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

  // Rohrzange an der Werkzeugwand: roter, schmaler werdender Doppel-T-Griff mit Aufhängeloch,
  // Stahlgehäuse mit Fenster für die gerändelte Stellmutter, feste Backe unten, Hakenbacke oben, beide mit Zähnen
  const zange = new THREE.Group();
  const rot = 0xc8352a;
  const ext = (form, tiefe, farbe, fase = 0.003) => {
    const geo = new THREE.ExtrudeGeometry(form, { depth: tiefe, bevelEnabled: fase > 0, bevelThickness: fase, bevelSize: fase, bevelSegments: 2, curveSegments: 10 });
    geo.translate(0, 0, -tiefe / 2);
    return teil(geo, farbe, { umriss: 0.003 });
  };
  // Griff
  const griff = new THREE.Shape();
  griff.moveTo(-0.016, -0.29);
  griff.quadraticCurveTo(-0.017, -0.312, 0, -0.313);
  griff.quadraticCurveTo(0.017, -0.312, 0.016, -0.29);
  griff.lineTo(0.021, 0.05);
  griff.lineTo(-0.021, 0.05);
  griff.closePath();
  const loch = new THREE.Path();
  loch.absarc(0, -0.292, 0.006, 0, Math.PI * 2, true);
  griff.holes.push(loch);
  zange.add(ext(griff, 0.014, rot));
  // Doppel-T: vertiefte Mittelstege auf beiden Seiten
  for (const sz of [-1, 1]) {
    const steg = quader(0.016, 0.3, 0.004, 0x8a1f17, { umriss: false });
    zange.add(setze(steg, 0, -0.12, sz * 0.0095));
  }
  // Gehäuse mit Fenster
  const geh = new THREE.Shape();
  geh.moveTo(-0.028, 0.04);
  geh.lineTo(0.036, 0.04);
  geh.lineTo(0.036, 0.135);
  geh.lineTo(-0.048, 0.135);
  geh.lineTo(-0.048, 0.118);
  geh.quadraticCurveTo(-0.03, 0.105, -0.028, 0.04);
  const zFenster = new THREE.Path();
  zFenster.moveTo(-0.004, 0.058);
  zFenster.lineTo(0.03, 0.058);
  zFenster.lineTo(0.03, 0.117);
  zFenster.lineTo(-0.004, 0.117);
  zFenster.closePath();
  geh.holes.push(zFenster);
  zange.add(ext(geh, 0.026, FARBE.stahl));
  // Zähne (Sägezahn-Leiste), dir = 1 nach oben, -1 nach unten
  const zaehne = (x0, x1, y, dir) => {
    const f = new THREE.Shape();
    const n = 7;
    const w = (x1 - x0) / n;
    f.moveTo(x0, y);
    for (let i = 0; i < n; i++) {
      f.lineTo(x0 + i * w + w * 0.75, y + dir * 0.007);
      f.lineTo(x0 + (i + 1) * w, y);
    }
    f.lineTo(x1, y - dir * 0.004);
    f.lineTo(x0, y - dir * 0.004);
    f.closePath();
    return ext(f, 0.024, 0x6c7178, 0);
  };
  zange.add(zaehne(-0.048, 0.0, 0.137, 1));
  // Gewindeschaft der Hakenbacke
  zange.add(setze(zylinder(0.0075, 0.0075, 0.2, FARBE.stahlHell, { umriss: 0.002 }, 10), 0.013, 0.15, 0));
  for (let i = 0; i < 11; i++) zange.add(setze(zylinder(0.0092, 0.0092, 0.0025, 0x7b8188, { umriss: false }, 10), 0.013, 0.14 + i * 0.0085, 0));
  // Hakenbacke
  const haken = new THREE.Shape();
  haken.moveTo(0.004, 0.2);
  haken.lineTo(0.026, 0.2);
  haken.lineTo(0.026, 0.262);
  haken.quadraticCurveTo(0.026, 0.27, 0.016, 0.27);
  haken.lineTo(-0.052, 0.27);
  haken.quadraticCurveTo(-0.058, 0.262, -0.052, 0.236);
  haken.lineTo(0.004, 0.236);
  haken.closePath();
  zange.add(ext(haken, 0.024, FARBE.stahlHell));
  zange.add(zaehne(-0.052, 0.002, 0.234, -1));
  // Stellmutter (gerändelt) im Fenster
  zange.add(setze(zylinder(0.016, 0.016, 0.05, 0x9aa0a6, { umriss: 0.002 }, 16), 0.013, 0.0875, 0));
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    zange.add(setze(quader(0.003, 0.05, 0.004, 0x5d6268, { umriss: false }), 0.013 + Math.cos(a) * 0.016, 0.0875, Math.sin(a) * 0.016, 0, -a, 0));
  }
  // Niete und Feder am Gehäuse
  for (const [x, y] of [[-0.016, 0.05], [0.026, 0.05]]) for (const sz of [-1, 1]) zange.add(setze(zylinder(0.004, 0.004, 0.003, 0x4a4e54, { umriss: false }, 8), x, y, sz * 0.0165, Math.PI / 2, 0, 0));
  zange.add(setze(zylinder(0.003, 0.003, 0.05, 0x3a3d42, { umriss: false }, 6), 0.033, 0.0875, 0.01));
  setze(zange, 1.32, 1.6, RAUM.zMin + 0.06, 0, 0, 0.25);
  zange.scale.setScalar(1.15);
  scene.add(zange);
  merke(zange, 'rohrzange', 'Rohrzange', null);
  objekte.rohrzange = zange;
  zange.userData.wand = { pos: zange.position.clone(), rot: zange.rotation.clone() };
  zange.userData.liegend = true; // abgelegt flach hinlegen, nicht aufrecht hinstellen

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

  // Dein Handy auf der Werkbank
  const handyGr = new THREE.Group();
  handyGr.add(quader(0.075, 0.009, 0.15, 0x1a1a1c, { umriss: 0.002 }));
  const displayTex = leinwandTextur(64, 128, (g) => {
    const gr = g.createLinearGradient(0, 0, 64, 128);
    gr.addColorStop(0, '#2f5fa8'); gr.addColorStop(1, '#8a3fb0');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 128);
    g.fillStyle = '#fff'; g.font = 'bold 16px Arial'; g.textAlign = 'center'; g.fillText('12:47', 32, 30);
    g.fillStyle = '#5cbf4a'; g.beginPath(); g.arc(32, 80, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 14px Arial'; g.fillText('3', 32, 85);
  });
  const display = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.135), new THREE.MeshBasicMaterial({ map: displayTex }));
  display.rotation.x = -Math.PI / 2;
  display.position.y = 0.0055;
  handyGr.add(display);
  setze(handyGr, 1.0, 0.905, -2.62, 0, -0.4, 0);
  scene.add(handyGr);
  merke(handyGr, 'handy', 'Dein Handy', 'werkbank');
  objekte.handy = handyGr;

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

  // Spanngurte (Paket C): bei einem Ereignis liegen zwei Gurte in Schlaufen vor dem Regal auf dem Boden (anklickbar),
  // aufgerollt kommen sie unten ins Regal
  const gurtBand = (pts, farbe) => {
    const pos = [], idx = [];
    for (let i = 0; i < pts.length; i++) {
      const a0 = pts[Math.max(0, i - 1)], a1 = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(a1[1] - a0[1]), nz = a1[0] - a0[0];
      const l = Math.hypot(nx, nz) || 1; nx = nx / l * 0.025; nz = nz / l * 0.025;
      const y = 0.006 + (pts[i][2] || 0);
      pos.push(pts[i][0] + nx, y, pts[i][1] + nz, pts[i][0] - nx, y, pts[i][1] - nz);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return teil(g, farbe, { umriss: false, mat: { side: THREE.DoubleSide } });
  };
  const schlaufen = (x0, z0, dreh, schleifen) => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const t = i / 120;
      // Gurt läuft in losen Schlaufen über den Boden; wo er sich kreuzt, liegt er etwas höher
      const x = t * 1.1 + Math.sin(t * Math.PI * schleifen) * 0.18;
      const z = Math.cos(t * Math.PI * schleifen) * 0.22 * (1 - t * 0.4);
      const hoch = Math.max(0, Math.cos(t * Math.PI * schleifen)) * 0.008;
      pts.push([x0 + x * Math.cos(dreh) - z * Math.sin(dreh), z0 + x * Math.sin(dreh) + z * Math.cos(dreh), hoch]);
    }
    return pts;
  };
  const ratsche = (farbe) => {
    const r = new THREE.Group();
    r.add(setze(quader(0.09, 0.03, 0.06, 0x8a9096, { umriss: 0.002 }), 0, 0.018, 0));
    r.add(setze(quader(0.07, 0.012, 0.03, farbe, { umriss: 0.001 }), 0, 0.038, 0));
    r.add(setze(quader(0.03, 0.01, 0.05, 0x5a5d62, { umriss: 0.001 }), 0.05, 0.012, 0));
    return r;
  };
  const gurteBoden = new THREE.Group();
  for (const [x0, z0, dreh, sl, farbe] of [[-3.95, -0.25, 0.4, 5, 0xe8742a], [-3.75, 0.25, -0.5, 4, 0x2f6fd1]]) {
    const pts = schlaufen(x0, z0, dreh, sl);
    gurteBoden.add(gurtBand(pts, farbe));
    const e = pts[pts.length - 1];
    gurteBoden.add(setze(ratsche(0xc8352a), e[0], 0, e[1], 0, -dreh, 0));
  }
  gurteBoden.visible = false;
  scene.add(gurteBoden);
  merke(gurteBoden, 'spanngurte', 'Spanngurte', null);
  objekte.gurteBoden = gurteBoden;
  // aufgerollt: zwei Rollen auf dem unteren Regalbrett
  const gurteRegal = new THREE.Group();
  for (const [z, farbe] of [[-0.09, 0xe8742a], [0.08, 0x2f6fd1]]) {
    // Rolle steht hochkant (Achse quer zum Regal), oben drauf die Ratsche
    const rolle = teil(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 20), farbe, { umriss: 0.002 });
    rolle.rotation.x = Math.PI / 2;
    rolle.position.set(0, 0, z);
    gurteRegal.add(rolle);
    gurteRegal.add(setze(zylinder(0.02, 0.02, 0.052, 0x1d1d1f, { umriss: false }, 10), 0, 0, z, Math.PI / 2, 0, 0));
    gurteRegal.add(setze(ratsche(0xc8352a), 0, 0.072, z, 0, Math.PI / 2, 0));
  }
  setze(gurteRegal, -4.7, 0.25 + 0.015 + 0.075, -0.6);
  gurteRegal.visible = false;
  scene.add(gurteRegal);
  objekte.gurteRegal = gurteRegal;

  // Bitsatz (schwarze Kassette, offen) im Regal: Bits liegen wild durcheinander, nach dem Sortieren ordentlich in Reihen
  const bitsatz = new THREE.Group();
  bitsatz.add(setze(quader(0.24, 0.025, 0.16, 0x26282c, { umriss: 0.002 }), 0, 0.0125, 0));
  const deckel = setze(quader(0.24, 0.16, 0.012, 0x26282c, { umriss: 0.002 }), 0, 0.09, -0.085, -0.25, 0, 0);
  bitsatz.add(deckel);
  bitsatz.add(setze(quader(0.1, 0.03, 0.002, 0xc8352a, { umriss: false }), 0, 0.1, -0.075, -0.25, 0, 0));
  const BITFARBEN = [0xc9a24a, 0x9aa1a8, 0x6f8fb8, 0xb87a4a];
  const bitsWild = new THREE.Group(), bitsOrdentlich = new THREE.Group();
  const bitGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.025, 6);
  for (let i = 0; i < 12; i++) {
    const farbe = BITFARBEN[i % 4];
    const w = teil(bitGeo, farbe, { umriss: false });
    w.position.set((Math.random() - 0.5) * 0.34, 0.03 + (i < 6 ? 0 : -0.02), (Math.random() - 0.5) * 0.2);
    w.rotation.set(Math.PI / 2, Math.random() * 3, Math.random() * 3);
    bitsWild.add(w);
    const o = teil(bitGeo, farbe, { umriss: false });
    o.position.set(-0.08 + (i % 4) * 0.05, 0.028, -0.04 + Math.floor(i / 4) * 0.04);
    o.rotation.set(0, 0, Math.PI / 2);
    bitsOrdentlich.add(o);
  }
  bitsOrdentlich.visible = false;
  bitsatz.add(bitsWild, bitsOrdentlich);
  setze(bitsatz, -4.68, 0.765, -0.62, 0, Math.PI / 2 - 0.25, 0);
  scene.add(bitsatz);
  merke(bitsatz, 'bitsatz', 'Bitsatz', 'regal');
  objekte.bitsatz = bitsatz;

  // Waldos Akkuschrauber (grün, lag im Regen: nass und schlammig); erst unsichtbar, Waldo bringt ihn
  const akku = new THREE.Group();
  const AKKU_GRUEN = 0x2f8f6a;
  akku.add(setze(zylinder(0.035, 0.035, 0.16, AKKU_GRUEN, { umriss: 0.003 }, 12), 0, 0.17, 0, 0, 0, Math.PI / 2));
  akku.add(setze(quader(0.045, 0.13, 0.05, AKKU_GRUEN, { umriss: 0.003 }), -0.03, 0.09, 0, 0, 0, -0.15));
  akku.add(setze(quader(0.09, 0.05, 0.07, 0x26282c, { umriss: 0.003 }), -0.035, 0.025, 0));
  akku.add(setze(zylinder(0.022, 0.026, 0.05, 0x9aa1a8, { umriss: 0.002 }, 10), 0.1, 0.17, 0, 0, 0, Math.PI / 2));
  akku.add(setze(zylinder(0.004, 0.004, 0.04, 0xc9cdd2, { umriss: false }, 6), 0.14, 0.17, 0, 0, 0, Math.PI / 2));
  akku.add(setze(quader(0.012, 0.02, 0.02, 0xc8352a, { umriss: 0.001 }), -0.008, 0.13, 0));
  const akkuDreck = new THREE.Group();
  for (let i = 0; i < 9; i++) akkuDreck.add(setze(kugel(0.008 + Math.random() * 0.006, i % 3 ? 0x9cc7e6 : 0x6b4a2a, { umriss: false }, 6), (Math.random() - 0.5) * 0.14, 0.05 + Math.random() * 0.14, 0.03 * (Math.random() < 0.5 ? -1 : 1)));
  akku.add(akkuDreck);
  akku.visible = false;
  scene.add(akku);
  merke(akku, 'akkuschrauber', 'Akkuschrauber', 'werkbank');
  objekte.akkuschrauber = akku;
  akku.userData.dreck = akkuDreck;

  // Schwere Stahlträger (Doppel-T, rostig) liegen in der Ecke vorne rechts auf Kanthölzern, ohne Funktion
  const traeger = new THREE.Group();
  const rostTex = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#4b4f55'; g.fillRect(0, 0, b, h);
    const r = zufall(55);
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(${140 + r() * 40},${70 + r() * 20},${30 + r() * 15},${0.25 + r() * 0.4})`;
      g.beginPath(); g.ellipse(r() * b, r() * h, 3 + r() * 14, 2 + r() * 6, r() * 3, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, 2, b, 2);
  }, [4, 1]);
  const rostMat = toon(0xffffff, { map: rostTex });
  function doppelT(laenge) {
    const t = new THREE.Group();
    const stahl = (bb, hh, tt, x, y) => t.add(setze(teil(new THREE.BoxGeometry(bb, hh, tt), 0, { material: rostMat, umriss: 0.004 }), x, y, 0));
    stahl(laenge, 0.022, 0.2, 0, 0.011);
    stahl(laenge, 0.022, 0.2, 0, 0.189);
    stahl(laenge, 0.156, 0.016, 0, 0.1);
    return t;
  }
  for (const x of [-0.9, 0.9]) traeger.add(setze(quader(0.12, 0.1, 0.75, 0x9a7444), x, 0.05, 0));
  for (const z of [-0.24, 0, 0.24]) {
    const t = doppelT(2.6);
    t.position.set(0, 0.1, z);
    traeger.add(t);
  }
  const oben = doppelT(2.4);
  oben.position.set(0.1, 0.3, -0.12);
  oben.rotation.y = 0.06;
  traeger.add(oben);
  // Kreide-Markierung
  const kreide = leinwandTextur(128, 32, (g) => { g.fillStyle = '#4b4f55'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#f2f0ea'; g.font = 'bold 22px Arial'; g.fillText('HEB 200', 8, 24); });
  const kreideSchild = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshBasicMaterial({ map: kreide }));
  kreideSchild.position.set(0.3, 0.4, 0.1 - 0.12 - 0.009);
  kreideSchild.rotation.y = Math.PI;
  traeger.add(kreideSchild);
  setze(traeger, 3.55, 0, RAUM.zMax - 0.5, 0, 0, 0);
  scene.add(traeger);
  merke(traeger, 'traeger', 'Stahlträger', null);
  objekte.traeger = traeger;
  hindernis(2.2, 4.9, RAUM.zMax - 0.9, RAUM.zMax);

  // Kleiner weißer Kühlschrank in Dennis' Pausenecke (neben dem Kaffeetisch), Bier drin
  const kuehl = new THREE.Group();
  // hohles Gehäuse: Wände, Boden, Deckel (vorne offen), innen hellgrau
  const KW = 0xf4f4f0, KI = 0xe4e8ea;
  kuehl.add(setze(quader(0.46, 0.04, 0.48, KW), 0, 0.02, 0));
  kuehl.add(setze(quader(0.46, 0.04, 0.48, KW), 0, 0.82, 0));
  for (const sx of [-1, 1]) kuehl.add(setze(quader(0.03, 0.84, 0.48, KW), sx * 0.215, 0.42, 0));
  kuehl.add(setze(quader(0.46, 0.84, 0.03, KW), 0, 0.42, -0.225));
  kuehl.add(setze(quader(0.39, 0.75, 0.01, KI, { umriss: false }), 0, 0.42, -0.205));
  for (const sx of [-1, 1]) kuehl.add(setze(quader(0.01, 0.75, 0.43, KI, { umriss: false }), sx * 0.196, 0.42, 0.0));
  kuehl.add(setze(quader(0.39, 0.01, 0.43, KI, { umriss: false }), 0, 0.045, 0.0));
  kuehl.add(setze(quader(0.39, 0.01, 0.43, KI, { umriss: false }), 0, 0.795, 0.0));
  // Gemüsefach unten, darüber zwei Glasböden
  kuehl.add(setze(quader(0.37, 0.1, 0.36, 0xdfe9ee, { umriss: 0.0015, wirft: false, mat: { transparent: true, opacity: 0.6 } }), 0, 0.105, -0.02));
  for (const y of [0.17, 0.46]) kuehl.add(setze(quader(0.38, 0.008, 0.4, 0xcfe3ea, { umriss: 0.0015, wirft: false, mat: { transparent: true, opacity: 0.55 } }), 0, y, -0.01));
  // Bierflaschen (braun, Kronkorken, Etikett) unten und in der Mitte
  const bierFlasche = (x, y, z) => {
    const f = new THREE.Group();
    f.add(setze(zylinder(0.028, 0.028, 0.15, 0x6b3a14, { umriss: 0.0015 }, 10), 0, 0.075, 0));
    f.add(setze(zylinder(0.012, 0.026, 0.05, 0x6b3a14, { umriss: 0.0015 }, 10), 0, 0.175, 0));
    f.add(setze(zylinder(0.013, 0.013, 0.012, 0xc9a52a, { umriss: 0.001 }, 10), 0, 0.205, 0));
    f.add(setze(zylinder(0.0285, 0.0285, 0.06, 0xe8dcae, { umriss: false }, 10), 0, 0.07, 0));
    f.position.set(x, y, z);
    kuehl.add(f);
  };
  for (let i = 0; i < 5; i++) bierFlasche(-0.14 + i * 0.07, 0.175, -0.1 + (i % 2) * 0.07);
  for (let i = 0; i < 3; i++) bierFlasche(-0.14 + i * 0.065, 0.465, -0.12);
  // Dose „Dennis' Matjes“ (flach, oval, mit Aufschrift) oben und ein Senfglas
  const matjesTex = leinwandTextur(128, 64, (g, b, h) => {
    g.fillStyle = '#e7d9a8'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#1f4f7a'; g.fillRect(0, 0, b, 14); g.fillRect(0, h - 10, b, 10);
    g.fillStyle = '#1f4f7a'; g.font = 'bold 15px sans-serif'; g.textAlign = 'center';
    g.fillText("DENNIS'", b / 2, 32); g.fillText('MATJES', b / 2, 49);
  });
  const dose = new THREE.Group();
  const doseKoerper = teil(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 24), 0, { material: toon(0xffffff, { map: matjesTex }), umriss: 0.0015 });
  doseKoerper.scale.set(1, 1, 0.62);
  dose.add(doseKoerper);
  const doseDeckel = teil(new THREE.CylinderGeometry(0.074, 0.074, 0.004, 24), 0xb8bcc2, { umriss: false });
  doseDeckel.scale.set(1, 1, 0.62);
  doseDeckel.position.y = 0.019;
  dose.add(doseDeckel);
  dose.add(setze(quader(0.03, 0.003, 0.012, 0xd0d4d8, { umriss: false }), 0.045, 0.022, 0));
  dose.position.set(0.09, 0.485, 0.03);
  dose.rotation.y = -0.4;
  kuehl.add(dose);
  kuehl.add(setze(zylinder(0.03, 0.03, 0.08, 0xe0b830, { umriss: 0.0015 }, 12), 0.13, 0.215, 0.08));
  kuehl.add(setze(zylinder(0.031, 0.031, 0.02, 0x2a2a2a, { umriss: 0.001 }, 12), 0.13, 0.265, 0.08));
  const kTuer = new THREE.Group();
  kTuer.add(setze(quader(0.44, 0.8, 0.04, 0xf7f7f3, { umriss: 0.003 }), 0.22, 0, 0.02));
  kTuer.add(setze(quader(0.025, 0.25, 0.03, 0xb8bcc2, { umriss: 0.002 }), 0.4, 0.15, 0.05));
  kTuer.add(setze(quader(0.08, 0.025, 0.004, 0x2f5fa8, { umriss: false }), 0.1, 0.32, 0.042));
  // Türinnenseite: Dichtung und zwei Ablagen mit Flaschen
  kTuer.add(setze(quader(0.4, 0.74, 0.006, 0xe8ecee, { umriss: false }), 0.22, 0, -0.003));
  for (const y of [-0.25, 0.05]) {
    kTuer.add(setze(quader(0.36, 0.06, 0.006, 0xd4dadd, { umriss: 0.0012 }), 0.22, y, -0.065));
    kTuer.add(setze(quader(0.36, 0.006, 0.06, 0xd4dadd, { umriss: false }), 0.22, y - 0.03, -0.035));
  }
  for (let i = 0; i < 4; i++) {
    const f = new THREE.Group();
    f.add(setze(zylinder(0.024, 0.024, 0.13, i === 3 ? 0x2f6b2a : 0x6b3a14, { umriss: 0.0015 }, 10), 0, 0.065, 0));
    f.add(setze(zylinder(0.011, 0.022, 0.04, i === 3 ? 0x2f6b2a : 0x6b3a14, { umriss: 0.0015 }, 10), 0, 0.15, 0));
    f.add(setze(zylinder(0.012, 0.012, 0.01, 0xc9a52a, { umriss: false }, 8), 0, 0.175, 0));
    f.position.set(0.1 + i * 0.075, -0.275, -0.035);
    kTuer.add(f);
  }
  kTuer.add(setze(quader(0.08, 0.1, 0.04, 0xf2efe4, { umriss: 0.0015 }), 0.14, 0.07, -0.035));
  kTuer.add(setze(zylinder(0.022, 0.022, 0.12, 0xe7442f, { umriss: 0.0015 }, 10), 0.3, 0.08, -0.035));
  kTuer.position.set(-0.22, 0.43, 0.24);
  kuehl.add(kTuer);
  for (const sx of [-0.18, 0.18]) for (const sz of [-0.18, 0.18]) kuehl.add(setze(zylinder(0.02, 0.02, 0.03, 0x333333, { umriss: false }, 8), sx, 0.015, sz));
  setze(kuehl, -4.66, 0, 2.42, 0, Math.PI / 2, 0);
  scene.add(kuehl);
  merke(kuehl, 'kuehlschrank', 'Kühlschrank', null);
  objekte.kuehlschrank = kuehl;
  hindernis(-4.92, -4.4, 2.17, 2.67);
  let kuehlAuf = false;
  animiert.push((dt) => {
    const zielW = kuehlAuf ? -1.6 : 0;
    kTuer.rotation.y += (zielW - kTuer.rotation.y) * Math.min(1, dt * 6);
  });
  // leere Bierflaschen, die Jonny rumliegen lässt
  const leereFlaschen = [];
  function leereFlasche(x, z) {
    const f = new THREE.Group();
    f.add(zylinder(0.03, 0.03, 0.15, 0x6b3a14, { umriss: 0.002 }, 10));
    f.add(setze(zylinder(0.012, 0.03, 0.06, 0x6b3a14, { umriss: 0.002 }, 10), 0, 0.1, 0));
    f.add(setze(zylinder(0.0305, 0.0305, 0.06, 0xf2e6c4, { umriss: false }, 10), 0, -0.01, 0));
    // liegt umgekippt auf dem Boden
    setze(f, x, 0.03, z, Math.PI / 2, Math.random() * Math.PI, 0);
    f.rotation.order = 'YXZ';
    scene.add(f);
    merke(f, 'leereflasche', 'Leere Bierflasche', null);
    leereFlaschen.push(f);
    return f;
  }

  // Waldos Kackepumpe (Tauchpumpe mit aufgerolltem Schlauch), versteckt hinter dem Kompressor
  const kackPumpe = new THREE.Group();
  kackPumpe.add(setze(zylinder(0.09, 0.1, 0.26, 0x2f5fa8, {}, 16), 0, 0.13, 0));
  kackPumpe.add(setze(zylinder(0.1, 0.1, 0.03, 0x1d1d1f, {}, 16), 0, 0.015, 0));
  kackPumpe.add(setze(teil(new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), 0x1d1d1f, { umriss: 0.002 }), 0, 0.27, 0));
  for (let i = 0; i < 3; i++) kackPumpe.add(setze(teil(new THREE.TorusGeometry(0.16, 0.022, 6, 20), 0x1d1d1f, { umriss: 0.002 }), 0.22, 0.03 + i * 0.04, 0.0, Math.PI / 2, 0, 0));
  kackPumpe.add(setze(quader(0.05, 0.04, 0.005, 0xf2c21c, { umriss: false }), 0, 0.15, 0.1));
  setze(kackPumpe, -4.5, 0, -2.85);
  scene.add(kackPumpe);
  objekte.kackPumpe = kackPumpe;
  kackPumpe.userData.wand = { pos: kackPumpe.position.clone(), rot: kackPumpe.rotation.clone() };
  merke(kackPumpe, 'kackpumpe', 'Kackepumpe', null);
  // dreckig zurückgebracht: Güllekleckse, Laufspuren, Stinkewolken, Fliegen
  const pumpeDreck = new THREE.Group();
  {
    const r = zufall(91);
    const guelle = [0x4a3418, 0x5c4220, 0x3a2a12];
    for (let i = 0; i < 16; i++) {
      const w = r() * Math.PI * 2, y = 0.03 + r() * 0.24;
      const k = kugel(0.018 + r() * 0.022, guelle[i % 3], { umriss: false }, 7);
      k.scale.set(1.2, 0.6 + r() * 0.5, 0.5);
      k.position.set(Math.sin(w) * 0.098, y, Math.cos(w) * 0.098);
      k.rotation.y = w;
      pumpeDreck.add(k);
    }
    for (let i = 0; i < 6; i++) {
      const w = r() * Math.PI * 2, l = 0.06 + r() * 0.08;
      pumpeDreck.add(setze(zylinder(0.006, 0.01, l, 0x4a3418, { umriss: false }, 5), Math.sin(w) * 0.101, 0.26 - l / 2 - r() * 0.05, Math.cos(w) * 0.101));
    }
    for (let i = 0; i < 6; i++) { const k = kugel(0.025, 0x4a3418, { umriss: false }, 7); k.scale.set(1.2, 0.35, 1); k.position.set(0.1 + r() * 0.2, 0.05 + (i % 3) * 0.04, (r() - 0.5) * 0.3); pumpeDreck.add(k); }
    // Pfütze drunter
    const pf = kugel(0.2, 0x4f3a1c, { umriss: false }, 12);
    pf.scale.set(1.3, 0.03, 1);
    pf.position.set(0.05, 0.002, 0);
    pumpeDreck.add(pf);
    // Stinkewolken (grüne Schlängel) und Fliegen
    const stinke = [];
    for (let i = 0; i < 3; i++) {
      const pts = [];
      for (let k = 0; k < 6; k++) pts.push(new THREE.Vector3(Math.sin(k * 1.4 + i) * 0.03, 0.32 + k * 0.05, 0));
      const t = teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.006, 5, false), 0x7fa83a, { umriss: false });
      t.position.set((i - 1) * 0.07, 0, (i % 2) * 0.03);
      pumpeDreck.add(t);
      stinke.push(t);
    }
    const fliegen = [];
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group();
      f.add(kugel(0.007, 0x111111, { umriss: false }, 5));
      for (const sx of [-1, 1]) { const fl = kugel(0.006, 0xd8e4ee, { umriss: false }, 5); fl.scale.set(1.4, 0.2, 0.8); fl.position.set(sx * 0.007, 0.004, 0); f.add(fl); }
      f.userData.phase = r() * 10;
      pumpeDreck.add(f);
      fliegen.push(f);
    }
    animiert.push((dt) => {
      if (!pumpeDreck.visible || !kackPumpe.visible) return;
      const t = performance.now() / 1000;
      fliegen.forEach((f, i) => { const p = t * (2.2 + i * 0.4) + f.userData.phase; f.position.set(Math.sin(p) * 0.18, 0.35 + Math.sin(p * 1.7) * 0.08, Math.cos(p * 1.3) * 0.18); f.children[1].visible = f.children[2].visible = Math.sin(t * 60 + i) > 0; });
      stinke.forEach((s, i) => { s.position.y = ((t * 0.08 + i * 0.05) % 0.12); s.rotation.y = t * 0.5 + i; });
    });
  }
  pumpeDreck.visible = false;
  kackPumpe.add(pumpeDreck);

  // Johnnys Alu-Leiter (Kofferraumleiter von einem alten Camper) hängt an der rechten Wand:
  // zwei schmale Holme, 6 geriffelte Sprossen, oben zum Wohnmobil-Dach hin gebogen, Gummifüße, zwei Wandhaken
  const leiter = new THREE.Group();
  {
    const alu = 0xc4c9ce;
    const LH = 1.75, B = 0.34;
    for (const sx of [-1, 1]) {
      const holm = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * B / 2, 0, 0.0), new THREE.Vector3(sx * B / 2, LH * 0.5, 0.0), new THREE.Vector3(sx * B / 2, LH, 0.0),
        new THREE.Vector3(sx * B / 2, LH + 0.1, -0.03), new THREE.Vector3(sx * B / 2, LH + 0.15, -0.12), new THREE.Vector3(sx * B / 2, LH + 0.14, -0.2),
      ]);
      leiter.add(teil(new THREE.TubeGeometry(holm, 48, 0.016, 10, false), alu, { umriss: 0.003 }));
      // Gummifuß und Endkappe
      leiter.add(setze(zylinder(0.021, 0.024, 0.04, 0x1d1d1f, { umriss: 0.002 }, 10), sx * B / 2, 0.0, 0));
      leiter.add(setze(zylinder(0.019, 0.019, 0.03, 0x1d1d1f, { umriss: 0.002 }, 10), sx * B / 2, LH + 0.14, -0.2, Math.PI / 2, 0, 0));
    }
    for (let i = 0; i < 6; i++) {
      const y = 0.22 + i * 0.29;
      leiter.add(setze(zylinder(0.017, 0.017, B, alu, { umriss: 0.002 }, 10), 0, y, 0, 0, 0, Math.PI / 2));
      // Riffelung als Ringe
      for (let k = 0; k < 7; k++) leiter.add(setze(zylinder(0.019, 0.019, 0.006, 0x9aa0a6, { umriss: false, wirft: false }, 10), -0.12 + k * 0.04, y, 0, 0, 0, Math.PI / 2));
      // Nietköpfe
      for (const sx of [-1, 1]) leiter.add(setze(kugel(0.009, 0x8d949b, { umriss: false }, 8), sx * (B / 2 + 0.017), y, 0));
    }
    // Aufkleber vom Camper
    const klebTex = leinwandTextur(128, 48, (g) => { g.fillStyle = '#f2c21c'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#111'; g.font = 'bold 18px Arial'; g.fillText('max 100 kg', 8, 30); });
    const kleber = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.02), new THREE.MeshBasicMaterial({ map: klebTex }));
    kleber.position.set(-B / 2, 0.9, 0.017);
    leiter.add(kleber);
  }
  // an der Wand: Biegung zeigt zur Wand, hängt an zwei Haken
  // hängt quer, hoch oben und leicht schräg an der Wand, die Biegung zeigt zur Wand, liegt auf zwei Konsolen
  const leiterNeigung = 0.12;
  leiter.position.set(RAUM.xMax - 0.22, 3.12, -0.55);
  leiter.rotation.set(Math.PI / 2 - leiterNeigung, -Math.PI / 2, 0, 'XYZ');
  scene.add(leiter);
  for (const dz of [0.35, 1.45]) scene.add(setze(quader(0.26, 0.035, 0.04, 0x5d6268, { umriss: 0.002 }), RAUM.xMax - 0.13, 3.12 - 0.19 + dz * Math.sin(leiterNeigung), -0.55 + dz));
  merke(leiter, 'leiter', 'Johnnys Leiter', null);
  objekte.leiter = leiter;

  // Pömpel (Saugglocke) steht oben im Regal
  const poempel = new THREE.Group();
  poempel.add(setze(zylinder(0.014, 0.014, 0.5, 0xb27a42, { umriss: 0.002 }, 8), 0, 0.33, 0));
  const glocke = teil(new THREE.SphereGeometry(0.075, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xc8352a, { mat: { side: THREE.DoubleSide }, umriss: 0.003 });
  glocke.rotation.x = Math.PI;
  glocke.position.y = 0.075;
  poempel.add(glocke);
  poempel.add(setze(zylinder(0.02, 0.02, 0.03, 0x8a1f17, { umriss: false }, 10), 0, 0.085, 0));
  setze(poempel, -4.62, 1.765, 0.0);
  scene.add(poempel);
  merke(poempel, 'poempel', 'Pömpel', null);
  poempel.userData.liegend = true;
  objekte.poempel = poempel;
  poempel.userData.wand = { pos: poempel.position.clone(), rot: poempel.rotation.clone() };

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

  // Atemmaske (Einweg-Staubmaske FFP3: weißes Vlies, Nasenbügel, rotes Ausatemventil, zwei gelbe Gummibänder) liegt im Regal neben der Brille
  const maske = new THREE.Group();
  const vlies = teil(new THREE.SphereGeometry(0.065, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), 0xf2f0ea, { mat: { side: THREE.DoubleSide }, umriss: 0.003 });
  vlies.scale.set(1.15, 1.2, 0.85);
  vlies.rotation.x = Math.PI / 2;
  maske.add(vlies);
  // Dichtrand innen und Prägenaht über die Mitte
  maske.add(setze(teil(new THREE.TorusGeometry(0.066, 0.0035, 5, 32), 0xe2ded2, { umriss: false }), 0, 0, 0.002));
  maske.add(setze(quader(0.003, 0.11, 0.003, 0xdcd8cc, { umriss: false }), 0, 0, 0.074, -0.05, 0, 0));
  // Nasenbügel (Alu) oben auf dem Vlies
  const nasenBuegel = new THREE.CatmullRomCurve3([[-0.03, 0.06, 0.035], [0, 0.068, 0.048], [0.03, 0.06, 0.035]].map((q) => new THREE.Vector3(...q)));
  maske.add(teil(new THREE.TubeGeometry(nasenBuegel, 10, 0.0035, 4, false), 0xb8bcc2, { umriss: 0.001 }));
  // rotes Ausatemventil mit Lamellen
  maske.add(setze(zylinder(0.022, 0.022, 0.012, 0xc8352a, { umriss: 0.002 }, 16), 0, -0.02, 0.072, Math.PI / 2, 0, 0));
  for (let i = 0; i < 3; i++) maske.add(setze(quader(0.026, 0.003, 0.003, 0x7a1a14, { umriss: false }), 0, -0.026 + i * 0.006, 0.079));
  // zwei flache gelbe Gummibänder: an den Seiten mit Metallklammern festgetackert, hinten als lockere Schlaufe,
  // die nach unten aufs Regalbrett hängt
  const unten = -0.066;
  for (const [y, weit] of [[0.032, 0.12], [-0.036, 0.15]]) {
    const pkt = [[-0.074, y, 0.006], [-0.088, (y + unten) / 2, -0.035], [-0.075, unten, -weit * 0.7], [0, unten, -weit], [0.075, unten, -weit * 0.7], [0.088, (y + unten) / 2, -0.035], [0.074, y, 0.006]];
    const band = new THREE.Group();
    const tube = teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pkt.map((q) => new THREE.Vector3(...q))), 48, 0.0042, 6, false), 0xe8b42a, { umriss: 0.0012 });
    band.add(tube);
    maske.add(band);
    for (const sx of [-1, 1]) maske.add(setze(quader(0.004, 0.012, 0.008, 0xc9cdd2, { umriss: 0.001 }), sx * 0.074, y, 0.008));
  }
  setze(maske, -4.62, 1.345, -1.15, 0, Math.PI / 2, 0);
  scene.add(maske);
  merke(maske, 'maske', 'Atemmaske', 'regal');
  objekte.maske = maske;

  // Schweißerhandschuhe: flach nebeneinander auf dem Regalbrett, Finger zur Wand
  const handschuhe = new THREE.Group();
  for (const seite of [-1, 1]) {
    const h = baueHandschuh(seite);
    h.rotation.set(-Math.PI / 2 + 0.06, 0, seite * 0.15);
    h.position.set(seite * 0.07, 0.016, 0.13);
    handschuhe.add(h);
  }
  setze(handschuhe, -4.66, 1.28, -0.55, 0, Math.PI / 2, 0);
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
  // Rohr unter dem Hahn (hier platzt es bei Frost)
  const hahnRohr = new THREE.Group();
  hahnRohr.add(zylinder(0.025, 0.025, 0.5, FARBE.stahlHell, {}, 10));
  // dicke Messing-Verschraubung: hier platzt es und hier wird repariert
  hahnRohr.add(setze(zylinder(0.055, 0.055, 0.1, FARBE.messing, {}, 6), 0, -0.05, 0));
  hahnRohr.add(setze(zylinder(0.045, 0.045, 0.03, 0x8a6a22, {}, 6), 0, 0.02, 0));
  const leckRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffc81e }));
  leckRing.rotation.y = Math.PI / 2;
  leckRing.position.set(-0.04, -0.05, 0);
  leckRing.visible = false;
  hahnRohr.add(leckRing);
  const rohrKlick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.45), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  rohrKlick.position.set(-0.1, -0.02, 0);
  hahnRohr.add(rohrKlick);
  hahnRohr.position.set(4.93, 0.95, 1.6);
  scene.add(hahnRohr);
  merke(hahnRohr, 'wasserhahn', 'Wasserrohr am Hahn', null);
  objekte.wasserhahn = hahnRohr;
  // Pfütze (wächst, solange es spritzt)
  const pfuetze = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x5aa6e6, transparent: true, opacity: 0.55, depthWrite: false }));
  pfuetze.rotation.x = -Math.PI / 2;
  pfuetze.position.set(4.3, 0.006, 1.6);
  pfuetze.scale.setScalar(0.01);
  pfuetze.visible = false;
  scene.add(pfuetze);
  hindernis(4.35, 5, 1.1, 2.1);

  // Schlauch an der Wand: Halter oben, lange Schlaufen nach unten, Spritzpistole hängt unten dran
  const schlauch = new THREE.Group();
  const schlauchMat = toon(0x3c9a3a);
  schlauch.add(setze(quader(0.18, 0.1, 0.12, 0x3a3d42), 0, 0.42, 0));
  for (const [dx, dz, b, h] of [[-0.04, 0.02, 0.13, 0.42], [0.03, 0.04, 0.15, 0.48], [0.0, 0.06, 0.12, 0.38]]) {
    const pkt = [];
    for (let i = 0; i < 24; i++) {
      const w = (i / 24) * Math.PI * 2;
      pkt.push(new THREE.Vector3(Math.sin(w) * b + dx, 0.4 - (1 - Math.cos(w)) * h, dz + Math.sin(w * 2) * 0.01));
    }
    const kurve = new THREE.CatmullRomCurve3(pkt, true);
    schlauch.add(teil(new THREE.TubeGeometry(kurve, 64, 0.022, 8, true), 0, { material: schlauchMat, umriss: 0.004 }));
  }
  // loses Ende mit Spritzpistole
  const ende = new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.38, 0.08), new THREE.Vector3(0.2, 0.0, 0.1), new THREE.Vector3(0.22, -0.45, 0.1), new THREE.Vector3(0.2, -0.62, 0.1)]);
  schlauch.add(teil(new THREE.TubeGeometry(ende, 32, 0.02, 8, false), 0, { material: schlauchMat, umriss: 0.004 }));
  const pistole = new THREE.Group();
  pistole.add(setze(quader(0.05, 0.16, 0.05, 0xe2531e), 0, -0.08, 0));
  pistole.add(setze(zylinder(0.022, 0.018, 0.16, 0x3a3d42, {}, 10), 0, -0.13, 0.08, Math.PI / 2, 0, 0));
  pistole.add(setze(quader(0.015, 0.06, 0.03, 0x111111), 0, -0.1, 0.04));
  setze(pistole, 0.2, -0.62, 0.1);
  schlauch.add(pistole);
  schlauch.userData.pistole = pistole;
  // unsichtbare Klickfläche über dem ganzen Schlauch (sonst trifft man durch die Schlaufen die Wand)
  const klickFlaeche = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.25, 0.2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  klickFlaeche.position.set(0.05, -0.15, 0.06);
  schlauch.add(klickFlaeche);
  setze(schlauch, RAUM.xMax - 0.08, 1.45, 2.45, 0, -Math.PI / 2, 0);
  scene.add(schlauch);
  merke(schlauch, 'schlauch', 'Wasserschlauch', 'wasch');
  objekte.schlauch = schlauch;
  schlauch.userData.wand = { pos: schlauch.position.clone(), rot: schlauch.rotation.clone() };

  // Eimer
  const eimer = new THREE.Group();
  eimer.add(setze(zylinder(0.15, 0.12, 0.3, FARBE.blau, {}, 18), 0, 0.15, 0));
  eimer.add(setze(teil(new THREE.TorusGeometry(0.14, 0.008, 6, 20, Math.PI), 0x888888), 0, 0.3, 0));
  setze(eimer, 4.4, 0, 0.75);
  scene.add(eimer);
  hindernis(4.2, 4.6, 0.55, 0.95);

  // ---------- Waschmaschine mit Trockner obendrauf (im Bad, rechts neben der Tür) ----------
  function waschAnzeige() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 48;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.userData = { c, zeig(text, farbe = '#7dff8a') {
      const g = c.getContext('2d');
      g.fillStyle = '#10161a'; g.fillRect(0, 0, 128, 48);
      g.fillStyle = farbe; g.font = 'bold 30px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(text, 64, 26);
      t.needsUpdate = true;
    } };
    t.userData.zeig('--:--');
    return t;
  }
  function waschGeraet(y, mitSieb) {
    const g = new THREE.Group();
    g.add(setze(quader(0.6, 0.84, 0.6, 0xf1f1ee), 0, 0.42, 0));
    // Bedienblende oben
    g.add(setze(quader(0.012, 0.13, 0.58, 0xdedfdc, { umriss: 0.002 }), -0.305, 0.76, 0));
    const anzeige = waschAnzeige();
    const display = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.06), new THREE.MeshBasicMaterial({ map: anzeige }));
    display.rotation.y = -Math.PI / 2;
    display.position.set(-0.313, 0.77, 0.05);
    g.add(display);
    const knopf = setze(zylinder(0.035, 0.035, 0.03, 0xb8bcc2, { umriss: 0.002 }, 16), -0.325, 0.77, -0.17, 0, 0, Math.PI / 2);
    knopf.add(setze(quader(0.006, 0.032, 0.012, 0x333333, { umriss: false }), 0, 0.016, 0.018));
    g.add(knopf);
    for (let i = 0; i < 3; i++) g.add(setze(quader(0.012, 0.02, 0.035, 0x9aa0a6, { umriss: false }), -0.315, 0.77, 0.17 + i * 0.045));
    // Bullauge mit Trommel
    const ring = teil(new THREE.TorusGeometry(0.17, 0.028, 10, 32), 0xc9cdd2, { umriss: 0.003 });
    ring.rotation.y = Math.PI / 2;
    ring.position.set(-0.315, 0.38, 0);
    g.add(ring);
    const trommel = new THREE.Group();
    trommel.position.set(-0.3, 0.38, 0);
    // Scheibe: einfach blau (vor dem Ring, damit nichts durchschimmert)
    const glas = new THREE.Mesh(new THREE.CircleGeometry(0.165, 32), new THREE.MeshBasicMaterial({ color: 0x3b74b8 }));
    glas.rotation.y = -Math.PI / 2;
    glas.position.x = -0.012;
    trommel.add(glas);
    const waesche = new THREE.Group();
    for (const [i, c] of [0x2f5fa8, 0x1d1d1f, 0x8a8f96, 0xc8352a, 0x3c7a3a].entries()) {
      const k = new THREE.Mesh(new THREE.CircleGeometry(0.05 + (i % 2) * 0.02, 10), new THREE.MeshBasicMaterial({ color: c }));
      k.rotation.y = -Math.PI / 2;
      const w = i * 1.3;
      k.position.set(-0.014 - i * 0.0005, Math.sin(w) * 0.08 - 0.04, Math.cos(w) * 0.08);
      waesche.add(k);
    }
    waesche.visible = false;
    trommel.add(waesche);
    // Wasser (nur Waschmaschine)
    const wasser = new THREE.Mesh(new THREE.CircleGeometry(0.155, 28, Math.PI, Math.PI), new THREE.MeshBasicMaterial({ color: 0x6fb5e8, transparent: true, opacity: 0.55 }));
    wasser.rotation.y = -Math.PI / 2;
    wasser.position.x = -0.017;
    wasser.visible = false;
    trommel.add(wasser);
    g.add(trommel);
    g.add(setze(quader(0.02, 0.07, 0.03, 0xb8bcc2, { umriss: 0.002 }), -0.33, 0.38, -0.2));
    let sieb = null;
    if (mitSieb) {
      // Flusensieb unten in der Tür-Öffnung, schaut ein Stück raus
      sieb = new THREE.Group();
      // Kunststoffrahmen mit Griffmulde oben, feines Netz (Gitter-Textur), Fusselschicht als Filzmatte mit Flocken
      const siebGrau = 0x9aa0a6;
      sieb.add(setze(quader(0.03, 0.022, 0.25, siebGrau, { umriss: 0.002 }), 0, 0.075, 0));
      sieb.add(setze(quader(0.03, 0.016, 0.25, siebGrau, { umriss: 0.002 }), 0, -0.072, 0));
      for (const sz of [-1, 1]) sieb.add(setze(quader(0.03, 0.15, 0.016, siebGrau, { umriss: 0.002 }), 0, 0, sz * 0.117));
      sieb.add(setze(quader(0.03, 0.15, 0.008, siebGrau, { umriss: 0.0015 }), 0, 0, 0));
      const griff = setze(quader(0.024, 0.03, 0.09, 0x7c838b, { umriss: 0.002 }), 0, 0.1, 0);
      sieb.add(griff);
      sieb.add(setze(quader(0.026, 0.012, 0.05, 0x5d6268, { umriss: false }), 0, 0.1, 0));
      const netzTex = leinwandTextur(128, 96, (g, b, h) => {
        g.fillStyle = '#e9ecef'; g.fillRect(0, 0, b, h);
        g.strokeStyle = '#8f979e'; g.lineWidth = 1;
        for (let x = 0; x < b; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
        for (let y = 0; y < h; y += 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
      });
      const netzMat = new THREE.MeshBasicMaterial({ map: netzTex, side: THREE.DoubleSide });
      const netz = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.13), netzMat);
      netz.rotation.y = -Math.PI / 2;
      sieb.add(netz);
      const fussel = [];
      const filzTex = leinwandTextur(128, 96, (g, b, h) => {
        const r = zufall(17);
        g.fillStyle = '#8f877c'; g.fillRect(0, 0, b, h);
        for (let i = 0; i < 400; i++) { g.strokeStyle = `rgba(${150 + r() * 60},${140 + r() * 55},${130 + r() * 50},0.6)`; g.lineWidth = 1; const x = r() * b, y = r() * h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - 0.5) * 12, y + (r() - 0.5) * 12, x + (r() - 0.5) * 16, y + (r() - 0.5) * 10); g.stroke(); }
        g.fillStyle = '#c23a2e'; g.fillRect(30, 40, 4, 2); g.fillStyle = '#2f5fa8'; g.fillRect(80, 60, 5, 2);
      });
      const filz = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.12), new THREE.MeshBasicMaterial({ map: filzTex, side: THREE.DoubleSide }));
      filz.rotation.y = -Math.PI / 2;
      filz.position.x = -0.006;
      sieb.add(filz);
      fussel.push(filz);
      for (let i = 0; i < 6; i++) {
        const f = kugel(0.014 + (i % 3) * 0.006, 0xa59d91, { umriss: false }, 8);
        f.scale.set(0.5, 0.7, 1.4);
        f.position.set(-0.01, (i % 3 - 1) * 0.035, -0.08 + i * 0.032);
        sieb.add(f);
        fussel.push(f);
      }
      sieb.position.set(-0.29, 0.13, 0);
      sieb.userData.sauber = (ja) => { for (const f of fussel) f.visible = !ja; };
      g.add(sieb);
      // Schacht für das Sieb: dunkles Fach mit Rand; ist das Sieb draußen, sieht man das leere Loch
      g.add(setze(quader(0.012, 0.17, 0.27, 0x111214, { umriss: false }), -0.315, 0.13, 0));
      for (const sy of [-1, 1]) g.add(setze(quader(0.016, 0.012, 0.29, 0x8a9096, { umriss: false }), -0.318, 0.13 + sy * 0.09, 0));
    }
    g.position.set(BAD.xMax - 0.33, y, BAD.zMin + 0.5);
    scene.add(g);
    return { g, trommel, waesche, wasser, anzeige: anzeige.userData, knopf, sieb };
  }
  const wm = waschGeraet(0, false);
  const tr = waschGeraet(0.845, true);
  wm.anzeige.zeig('40°');
  merke(wm.g, 'waschmaschine', 'Waschmaschine', null);
  merke(tr.g, 'trockner', 'Trockner', null);
  objekte.waschmaschine = wm;
  objekte.trockner = tr;
  hindernis(BAD.xMax - 0.65, BAD.xMax, BAD.zMin, BAD.zMin + 0.82);
  let geraetZeit = 0;
  animiert.push((dt) => {
    geraetZeit += dt;
    for (const d of [wm, tr]) {
      if (!d.laeuft) { d.g.position.x = BAD.xMax - 0.33; continue; }
      d.trommel.children[1].rotation.x += dt * (d === wm ? 5 : 3.5);
      d.g.position.x = BAD.xMax - 0.33 + Math.sin(geraetZeit * 37) * 0.003;
    }
    wm.wasser.visible = !!wm.laeuft;
  });

  // Druckluft-Kompressor (50 l) in der Ecke rechts neben dem Regal: liegender Kessel mit Schweißnähten, Motor mit Lüfterhaube,
  // Zylinder mit Kühlrippen, Luftfilter, Druckschalter mit Ein/Aus, zwei Manometer, Druckminderer, Schnellkupplung,
  // Spiralschlauch mit Ausblaspistole, Räder, Gummifüße, Ablassventil, Typenschild
  const kompressor = new THREE.Group();
  const kRot = 0xd03a2c;
  const kessel = setze(zylinder(0.17, 0.17, 0.56, kRot, {}, 24), 0, 0.3, 0, 0, 0, Math.PI / 2);
  kompressor.add(kessel);
  for (const sx of [-1, 1]) {
    const kappe = setze(kugel(0.17, kRot, {}, 20), sx * 0.28, 0.3, 0);
    kappe.scale.set(0.38, 1, 1);
    kompressor.add(kappe);
    // Schweißnaht am Übergang
    kompressor.add(setze(teil(new THREE.TorusGeometry(0.171, 0.006, 6, 28), 0xa82a20, { umriss: false }), sx * 0.27, 0.3, 0, 0, Math.PI / 2, 0));
  }
  // Typenschild
  const schildTex = leinwandTextur(128, 64, (g) => {
    g.fillStyle = '#e9e6dc'; g.fillRect(0, 0, 128, 64);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 18px Arial'; g.fillText('50 L', 8, 24);
    g.font = '13px Arial'; g.fillText('max. 8 bar', 8, 44); g.fillText('230 V  1,5 kW', 8, 58);
    g.fillStyle = '#d03a2c'; g.fillRect(96, 8, 24, 24);
  });
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ map: schildTex }));
  schild.position.set(0.02, 0.3, 0.1715 + 0.001);
  kompressor.add(schild);
  // Räder mit Felge an einem Ende, Gummifüße am anderen, Schiebebügel
  for (const sz of [-1, 1]) {
    const rad = setze(zylinder(0.07, 0.07, 0.04, 0x1d1d1f, {}, 18), -0.24, 0.07, sz * 0.15, Math.PI / 2, 0, 0);
    kompressor.add(rad);
    kompressor.add(setze(zylinder(0.035, 0.035, 0.045, 0xb8bcc2, { umriss: 0.002 }, 12), -0.24, 0.07, sz * 0.15, Math.PI / 2, 0, 0));
    kompressor.add(setze(quader(0.04, 0.14, 0.03, 0x3a3d42), 0.24, 0.07, sz * 0.09));
    kompressor.add(setze(zylinder(0.025, 0.03, 0.02, 0x1d1d1f, {}, 10), 0.24, 0.01, sz * 0.09));
  }
  kompressor.add(setze(zylinder(0.012, 0.012, 0.32, 0x1d1d1f, {}, 8), -0.24, 0.07, 0, Math.PI / 2, 0, 0));
  const buegel = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.42, -0.12), new THREE.Vector3(0.42, 0.62, -0.12), new THREE.Vector3(0.44, 0.66, 0), new THREE.Vector3(0.42, 0.62, 0.12), new THREE.Vector3(0.3, 0.42, 0.12),
  ]);
  kompressor.add(teil(new THREE.TubeGeometry(buegel, 24, 0.012, 8, false), 0x2a2c30, { umriss: 0.002 }));
  // Grundplatte, Motor mit Lüfterhaube und Lüftungsschlitzen
  kompressor.add(setze(quader(0.4, 0.02, 0.22, 0x3a3d42), -0.02, 0.475, 0));
  const motor = setze(zylinder(0.075, 0.075, 0.2, 0x26282c, {}, 18), -0.12, 0.56, 0, 0, 0, Math.PI / 2);
  kompressor.add(motor);
  for (let i = 0; i < 6; i++) kompressor.add(setze(quader(0.012, 0.004, 0.11, 0x111214, { umriss: false }), -0.2 + i * 0.03, 0.637, 0));
  const haube = setze(zylinder(0.085, 0.085, 0.05, 0x2f3236, {}, 18), -0.245, 0.56, 0, 0, 0, Math.PI / 2);
  kompressor.add(haube);
  for (let i = 0; i < 5; i++) kompressor.add(setze(quader(0.004, 0.11, 0.008, 0x111214, { umriss: false }), -0.271, 0.56, -0.04 + i * 0.02));
  // Zylinder mit Kühlrippen und Zylinderkopf
  kompressor.add(setze(zylinder(0.045, 0.05, 0.08, 0xa7adb3, {}, 14), 0.06, 0.53, 0));
  for (let i = 0; i < 6; i++) kompressor.add(setze(zylinder(0.065, 0.065, 0.006, 0xc3c8cd, { umriss: 0.0015 }, 16), 0.06, 0.575 + i * 0.016, 0));
  kompressor.add(setze(quader(0.11, 0.035, 0.11, 0x8d949b), 0.06, 0.68, 0));
  // Luftfilter (schwarze Dose) und Druckrohr zum Kessel
  kompressor.add(setze(zylinder(0.035, 0.035, 0.04, 0x1d1d1f, {}, 14), 0.06, 0.68, 0.085, Math.PI / 2, 0, 0));
  const druckrohr = new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.68, -0.03), new THREE.Vector3(0.17, 0.62, -0.06), new THREE.Vector3(0.18, 0.5, -0.07), new THREE.Vector3(0.19, 0.47, -0.07)]);
  kompressor.add(teil(new THREE.TubeGeometry(druckrohr, 16, 0.008, 6, false), 0xb87333, { umriss: 0.0015 }));
  // Druckschalter-Kasten mit rotem Ein/Aus-Knopf
  kompressor.add(setze(quader(0.08, 0.09, 0.07, 0x1d1d1f), 0.2, 0.53, 0.02));
  kompressor.add(setze(zylinder(0.018, 0.018, 0.025, 0xe02b20, { umriss: 0.002 }, 12), 0.2, 0.585, 0.02));
  // zwei Manometer (Kessel- und Arbeitsdruck) mit Zeigern
  const manoTex = leinwandTextur(64, 64, (g) => {
    g.fillStyle = '#f7f5ee'; g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#d03a2c'; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 24, -0.6, 0.4); g.stroke();
    g.strokeStyle = '#1d1d1f'; g.lineWidth = 2;
    for (let i = 0; i <= 8; i++) { const w = Math.PI * 0.75 + i * Math.PI * 1.5 / 8; g.beginPath(); g.moveTo(32 + Math.cos(w) * 22, 32 + Math.sin(w) * 22); g.lineTo(32 + Math.cos(w) * 27, 32 + Math.sin(w) * 27); g.stroke(); }
    g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.cos(-0.3) * 20, 32 + Math.sin(-0.3) * 20); g.stroke();
  });
  for (const [x, y] of [[0.29, 0.52], [0.29, 0.43]]) {
    kompressor.add(setze(zylinder(0.032, 0.032, 0.02, 0xb8bcc2, { umriss: 0.002 }, 16), x, y, 0.0, 0, 0, Math.PI / 2));
    const zifferblatt = new THREE.Mesh(new THREE.CircleGeometry(0.027, 20), new THREE.MeshBasicMaterial({ map: manoTex }));
    zifferblatt.rotation.y = Math.PI / 2;
    zifferblatt.position.set(x + 0.0105, y, 0);
    kompressor.add(zifferblatt);
  }
  // Druckminderer (Drehknopf) und Messing-Schnellkupplung
  kompressor.add(setze(zylinder(0.022, 0.022, 0.03, 0x1d1d1f, { umriss: 0.002 }, 10), 0.3, 0.475, -0.06, 0, 0, Math.PI / 2));
  kompressor.add(setze(zylinder(0.012, 0.014, 0.05, FARBE.messing, { umriss: 0.002 }, 8), 0.31, 0.43, 0.06, 0, 0, Math.PI / 2));
  // Ablassventil unten
  kompressor.add(setze(zylinder(0.008, 0.008, 0.04, FARBE.messing, {}, 8), 0.1, 0.12, 0));
  // Spiralschlauch (blau) hängt am Bügel, unten die gelbe Ausblaspistole
  const spirale = [];
  for (let i = 0; i <= 80; i++) { const w = i * 0.5; spirale.push(new THREE.Vector3(0.44 + Math.cos(w) * 0.045, 0.6 - i * 0.0055, 0.05 + Math.sin(w) * 0.045)); }
  kompressor.add(teil(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spirale), 200, 0.007, 6, false), 0x2f6fd0, { umriss: 0.0015 }));
  const zuleitung = new THREE.CatmullRomCurve3([new THREE.Vector3(0.335, 0.43, 0.06), new THREE.Vector3(0.39, 0.5, 0.06), new THREE.Vector3(0.44, 0.6, 0.05)]);
  kompressor.add(teil(new THREE.TubeGeometry(zuleitung, 12, 0.007, 6, false), 0x2f6fd0, { umriss: 0.0015 }));
  const blaspistole = new THREE.Group();
  blaspistole.add(setze(quader(0.03, 0.09, 0.025, 0xe2c21e, { umriss: 0.002 }), 0, 0, 0));
  blaspistole.add(setze(quader(0.012, 0.03, 0.02, 0x1d1d1f, { umriss: false }), 0.018, 0.005, 0));
  blaspistole.add(setze(zylinder(0.005, 0.005, 0.12, 0x9aa3ab, {}, 8), 0, 0.06, 0.05, Math.PI / 2 - 0.3, 0, 0));
  setze(blaspistole, 0.44, 0.13, 0.05);
  kompressor.add(blaspistole);
  // in der Ecke rechts neben dem Regal, Bedienseite zum Raum
  setze(kompressor, -4.45, 0, -2.3, 0, 0, 0);
  scene.add(kompressor);
  merke(kompressor, 'kompressor', 'Kompressor (Druckluft)', null);
  objekte.kompressor = kompressor;
  hindernis(-4.85, -3.95, -2.55, -2.05);

  // Dennis' blaue Einkaufstasche (wie die große von IKEA): gewebte Plane, gelbe Gurtbänder, flache Henkel, Wäsche drin
  const tasche = new THREE.Group();
  const gewebe = leinwandTextur(128, 128, (g, b, h) => {
    g.fillStyle = '#1d5fc4'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < b; i += 4) {
      g.fillStyle = i % 8 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,40,0.12)';
      g.fillRect(i, 0, 2, h);
      g.fillRect(0, i, b, 2);
    }
  }, [3, 2]);
  {
    // Korpus: unten 55 x 37 cm, oben etwas weiter, 35 cm hoch, oben offen
    // weiche Plane statt Kasten: Ecken rund (Radius 6 cm), Seiten leicht ausgebeult, unten etwas eingesackt
    const geo = new THREE.BoxGeometry(0.55, 0.35, 0.37, 14, 8, 10);
    const pos = geo.attributes.position;
    const HW = 0.275, HD = 0.185, R = 0.06;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), z = pos.getZ(i);
      const y = pos.getY(i);
      const t = (y + 0.175) / 0.35;
      // senkrechte Kanten abrunden
      const ax = Math.abs(x) - (HW - R), az = Math.abs(z) - (HD - R);
      if (ax > 0 && az > 0) { const l = Math.hypot(ax, az); x = Math.sign(x) * (HW - R + (ax / l) * R); z = Math.sign(z) * (HD - R + (az / l) * R); }
      // Bauch: Seitenmitte wölbt sich etwas nach außen
      const bx = 1 - (z / HD) ** 2, bz = 1 - (x / HW) ** 2;
      x *= 1 + bx * 0.035 * Math.sin(t * Math.PI);
      z *= 1 + bz * 0.06 * Math.sin(t * Math.PI);
      // unten eingezogen (Boden sackt), oben etwas weiter
      const unten = Math.max(0, 1 - t / 0.12);
      x *= (1 + t * 0.05) * (1 - unten * 0.06);
      z *= (1 + t * 0.07) * (1 - unten * 0.08);
      pos.setXYZ(i, x, y - unten * 0.006, z + Math.sin(x * 9) * 0.004 * t);
    }
    geo.translate(0, 0.175, 0);
    geo.computeVertexNormals();
    // Deckel-Flächen (Gruppe 2 = +y) weglassen: Tasche ist oben offen
    const plane = toon(0xffffff, { map: gewebe });
    const aussen = new THREE.Mesh(geo, [plane, plane, new THREE.MeshBasicMaterial({ visible: false }), plane, plane, plane]);
    tasche.add(aussen);
    const innenMat = new THREE.MeshBasicMaterial({ color: 0x0f2f66, side: THREE.BackSide });
    const innen = new THREE.Mesh(geo, [innenMat, innenMat, new THREE.MeshBasicMaterial({ visible: false }), innenMat, innenMat, innenMat]);
    innen.scale.setScalar(0.995);
    tasche.add(innen);
    // Comic-Kanten
    umriss(aussen, 0.004);
    // Saum oben
    // Saum oben als runder Wulst entlang der abgerundeten Öffnung
    {
      const sw = HW * 1.05, sd = HD * 1.07, sr = R;
      const rand = new THREE.Shape();
      rand.moveTo(-sw + sr, -sd); rand.lineTo(sw - sr, -sd); rand.quadraticCurveTo(sw, -sd, sw, -sd + sr);
      rand.lineTo(sw, sd - sr); rand.quadraticCurveTo(sw, sd, sw - sr, sd); rand.lineTo(-sw + sr, sd);
      rand.quadraticCurveTo(-sw, sd, -sw, sd - sr); rand.lineTo(-sw, -sd + sr); rand.quadraticCurveTo(-sw, -sd, -sw + sr, -sd);
      const kurve = new THREE.CatmullRomCurve3(rand.getSpacedPoints(64).map((q) => new THREE.Vector3(q.x, 0.345, q.y)), true);
      tasche.add(teil(new THREE.TubeGeometry(kurve, 96, 0.011, 8, true), 0x174e9e, { umriss: 0.002 }));
    }
  }
  const gurtGelb = 0xf2c21c;
  // flacher, gebogener Gurt-Henkel (Bogen aus Band)
  function henkel(rx, ry, breite) {
    const f = new THREE.Shape();
    f.absellipse(0, 0, rx + breite / 2, ry + breite / 2, 0, Math.PI, false);
    f.absellipse(0, 0, rx - breite / 2, ry - breite / 2, Math.PI, 0, true);
    const geo = new THREE.ExtrudeGeometry(f, { depth: 0.004, bevelEnabled: false, curveSegments: 20 });
    geo.translate(0, 0, -0.002);
    return teil(geo, gurtGelb, { umriss: 0.0025 });
  }
  for (const sz of [-1, 1]) {
    const seite = new THREE.Group();
    // senkrechte Gurtbänder mit Naht
    for (const sx of [-0.13, 0.13]) {
      seite.add(setze(quader(0.036, 0.34, 0.004, gurtGelb, { umriss: 0.002 }), sx, 0.17, 0));
      seite.add(setze(quader(0.002, 0.33, 0.005, 0xb88a0a, { umriss: false }), sx - 0.011, 0.17, 0.0005));
      seite.add(setze(quader(0.002, 0.33, 0.005, 0xb88a0a, { umriss: false }), sx + 0.011, 0.17, 0.0005));
      seite.add(setze(quader(0.04, 0.012, 0.007, 0x2a2a2a, { umriss: 0.002 }), sx, 0.26, 0.002));
    }
    // kurzer Henkel und langer Schultergurt
    const kurz = henkel(0.13, 0.15, 0.034);
    kurz.position.y = 0.34;
    kurz.rotation.x = -0.32;
    seite.add(kurz);
    const lang = henkel(0.13, 0.3, 0.03);
    lang.position.set(0, 0.34, 0.006);
    lang.rotation.x = -0.6;
    seite.add(lang);
    seite.position.z = sz * 0.2;
    if (sz < 0) seite.rotation.y = Math.PI;
    tasche.add(seite);
  }
  // Gurt unter dem Boden
  for (const sx of [-0.13, 0.13]) tasche.add(setze(quader(0.036, 0.004, 0.38, gurtGelb, { umriss: 0.002 }), sx, -0.002, 0));
  // Wäsche: zerknautschte Kleidungsstücke, ein Ärmel und ein Hosenbein hängen raus
  function knautsch(geo, staerke, saat) {
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = Math.sin(v.x * 31 + saat) * Math.cos(v.z * 27 + saat * 2) + Math.sin(v.y * 23 + saat * 3) * 0.6;
      v.multiplyScalar(1 + n * staerke);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const stoff = (geo, farbe) => teil(geo, farbe, { umriss: 0.003 });
  const tWaesche = new THREE.Group();
  // grauer Hoodie (Haufen + Kapuze + raushängender Ärmel mit Bündchen)
  const hoodie = stoff(knautsch(new THREE.SphereGeometry(0.15, 20, 14), 0.12, 1), 0x8e939a);
  hoodie.scale.set(1.35, 0.55, 1.0);
  hoodie.position.set(-0.09, 0.33, 0.02);
  tWaesche.add(hoodie);
  const kapuze = stoff(knautsch(new THREE.SphereGeometry(0.07, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), 0.1, 4), 0x7f848b);
  kapuze.position.set(-0.2, 0.38, -0.05);
  kapuze.rotation.set(-0.8, 0.4, 0.3);
  tWaesche.add(kapuze);
  const aermelKurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0.34, 0.08), new THREE.Vector3(-0.03, 0.38, 0.17), new THREE.Vector3(-0.02, 0.36, 0.215),
    new THREE.Vector3(-0.01, 0.28, 0.235), new THREE.Vector3(0.0, 0.18, 0.235),
  ]);
  tWaesche.add(stoff(knautsch(new THREE.TubeGeometry(aermelKurve, 24, 0.034, 10, false), 0.06, 2), 0x8e939a));
  tWaesche.add(setze(stoff(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 12), 0x6f747a), 0.0, 0.175, 0.235));
  // Jeans: Haufen + Hosenbein über die Schmalseite, mit Saum
  const jeans = stoff(knautsch(new THREE.SphereGeometry(0.13, 18, 12), 0.13, 7), 0x35577f);
  jeans.scale.set(1.0, 0.5, 1.0);
  jeans.position.set(0.1, 0.35, -0.03);
  tWaesche.add(jeans);
  const beinKurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.16, 0.36, 0.0), new THREE.Vector3(0.26, 0.4, 0.01), new THREE.Vector3(0.3, 0.36, 0.015),
    new THREE.Vector3(0.315, 0.25, 0.02), new THREE.Vector3(0.315, 0.14, 0.02),
  ]);
  const bein = stoff(knautsch(new THREE.TubeGeometry(beinKurve, 24, 0.048, 10, false), 0.05, 3), 0x35577f);
  tWaesche.add(bein);
  tWaesche.add(setze(stoff(new THREE.CylinderGeometry(0.046, 0.046, 0.025, 12), 0x5a7aa3), 0.315, 0.135, 0.02));
  tWaesche.add(setze(quader(0.004, 0.2, 0.006, 0xd8a24a, { umriss: false }), 0.318, 0.24, 0.068));
  // schwarzes Shirt, weißes Handtuch mit Streifen, rote Socke
  const shirt = stoff(knautsch(new THREE.SphereGeometry(0.11, 16, 10), 0.15, 9), 0x232326);
  shirt.scale.set(1.3, 0.35, 0.9);
  shirt.position.set(0.02, 0.38, -0.08);
  tWaesche.add(shirt);
  const tuch = stoff(knautsch(new THREE.BoxGeometry(0.2, 0.05, 0.14, 6, 2, 4), 0.06, 5), 0xf2efe6);
  tuch.position.set(0.1, 0.39, 0.08);
  tuch.rotation.set(0.15, 0.4, -0.12);
  tWaesche.add(tuch);
  tWaesche.add(setze(quader(0.205, 0.052, 0.018, 0x3a7ac2, { umriss: false }), 0.1, 0.39, 0.08, 0.15, 0.4, -0.12));
  const sockeKurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.37, -0.12), new THREE.Vector3(-0.22, 0.39, -0.19), new THREE.Vector3(-0.23, 0.33, -0.215),
    new THREE.Vector3(-0.23, 0.26, -0.215), new THREE.Vector3(-0.2, 0.235, -0.22),
  ]);
  tWaesche.add(stoff(new THREE.TubeGeometry(sockeKurve, 20, 0.022, 8, false), 0xc23a2e));
  tWaesche.add(setze(stoff(new THREE.CylinderGeometry(0.023, 0.023, 0.02, 10), 0xf4f0e6), -0.205, 0.37, -0.12, 0.3, 0, 0));
  tasche.add(tWaesche);
  tasche.userData.waesche = tWaesche;
  scene.add(tasche);
  // liegt anfangs oben auf dem Trockner; runterholen kann nur Dennis
  tasche.position.set(BAD.xMax - 0.36, 1.71, BAD.zMin + 0.48);
  tasche.rotation.set(0, 0.3, 0);
  tasche.userData.trocknerPlatz = { pos: tasche.position.clone(), rot: tasche.rotation.clone() };
  merke(tasche, 'waeschetasche', 'Wäschetasche', null);
  objekte.waeschetasche = tasche;

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
  objekte.hammer = hammer;
  const buerste = new THREE.Group();
  buerste.add(setze(quader(0.22, 0.02, 0.035, FARBE.holz), 0, 0, 0));
  buerste.add(setze(quader(0.12, 0.025, 0.03, 0xb0b0b0), -0.04, -0.02, 0));
  setze(buerste, 2.62, 0.87, -2.55, 0, 0.2, 0);
  scene.add(buerste);

  // ---------- Kaffeeecke ----------
  const kaffeeTisch = new THREE.Group();
  kaffeeTisch.add(setze(quader(1.2, 0.05, 0.5, FARBE.holz), 0, 0.78, 0));
  for (const [x, z] of [[-0.55, -0.2], [0.55, -0.2], [-0.55, 0.2], [0.55, 0.2]]) {
    kaffeeTisch.add(setze(quader(0.04, 0.78, 0.04, FARBE.stahlDunkel), x, 0.39, z));
  }
  const maschine = new THREE.Group();
  maschine.add(setze(quader(0.22, 0.32, 0.24, 0x1f1f1f), 0, 0.16, 0));
  maschine.add(setze(quader(0.16, 0.04, 0.12, 0x333333), 0, 0.3, 0.1));
  maschine.add(setze(kugel(0.012, 0xff3b30, { umriss: false, mat: { emissive: 0xff2010 } }), 0.07, 0.25, 0.121));
  maschine.add(setze(zylinder(0.06, 0.05, 0.12, 0x333333, {}, 12), 0, 0.06, 0.1));
  setze(maschine, -0.15, 0.805, -0.05);
  kaffeeTisch.add(maschine);
  setze(kaffeeTisch, -4.45, 0, 3.35, 0, Math.PI / 2, 0);
  scene.add(kaffeeTisch);
  hindernis(-4.75, -4.15, 2.7, 3.95);

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

  // Dennis' Brotdose auf dem Kaffeetisch
  const brotdose = new THREE.Group();
  brotdose.add(teil(new THREE.BoxGeometry(0.2, 0.07, 0.14), 0, { material: toon(0xf0f4f6, { transparent: true, opacity: 0.6 }), umriss: 0.004 }));
  brotdose.add(setze(quader(0.21, 0.015, 0.15, 0xc8352a, { umriss: 0.003 }), 0, 0.042, 0));
  brotdose.add(setze(kugel(0.03, 0xd8352a, { umriss: 0.002 }, 10), 0.06, -0.005, 0.02));
  brotdose.add(setze(teil(new THREE.TorusGeometry(0.06, 0.016, 6, 12, 2.2), 0xf2d23c, { umriss: 0.002 }), -0.03, -0.02, 0, Math.PI / 2, 0, 0.5));
  setze(brotdose, -4.45, 0.84, 2.95, 0, 0.4, 0);
  scene.add(brotdose);
  merke(brotdose, 'brotdose', 'Dennis’ Brotdose', null);
  objekte.brotdose = brotdose;

  // Holz-Skulptur (langer Penis, bemaltes Brett) oben an der Wand über der Soundbox und dem Fenster
  const skulpturTex = leinwandTextur(1024, 320, (g) => {
    g.clearRect(0, 0, 1024, 320);
    g.lineJoin = 'round';
    g.lineCap = 'round';
    const holz = '#e6ad45';
    const kontur = '#2b1d10';
    // Schnur zum Nagel
    g.strokeStyle = '#d8cba8'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(955, 70); g.lineTo(985, 6); g.stroke();
    // Umriss (dick, dunkel), dann Füllung
    function form(farbe, extra) {
      g.strokeStyle = farbe; g.fillStyle = farbe;
      g.lineWidth = 92 + extra;
      g.beginPath(); g.moveTo(250, 230); g.bezierCurveTo(480, 200, 700, 150, 910, 110); g.stroke();
      g.beginPath(); g.ellipse(150, 238, 86 + extra / 2, 70 + extra / 2, -0.2, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(255, 262, 66 + extra / 2, 52 + extra / 2, 0.1, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(935, 100, 62 + extra / 2, 50 + extra / 2, -0.25, 0, Math.PI * 2); g.fill();
    }
    form(kontur, 14);
    form(holz, 0);
    // Eichel etwas rötlicher, mit Kerbe
    g.fillStyle = '#e07a4e';
    g.beginPath(); g.ellipse(945, 97, 50, 40, -0.25, 0, Math.PI * 2); g.fill();
    g.strokeStyle = kontur; g.lineWidth = 6;
    g.beginPath(); g.moveTo(900, 70); g.quadraticCurveTo(890, 105, 905, 140); g.stroke();
    g.beginPath(); g.moveTo(970, 92); g.lineTo(990, 98); g.stroke();
    // rote Flecken und Holzstriche
    g.fillStyle = '#d8553a';
    for (const [x, y, w] of [[420, 205, 60], [600, 168, 70], [760, 136, 50], [330, 228, 40]]) { g.beginPath(); g.ellipse(x, y, w, 12, -0.18, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = kontur; g.lineWidth = 5;
    for (const [x, y] of [[360, 200], [520, 180], [680, 150], [830, 120], [470, 228], [640, 196]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 36, y - 6); g.stroke(); }
    // Punkte auf den Kugeln
    g.fillStyle = kontur;
    for (let i = 0; i < 26; i++) {
      const a = i * 2.39;
      const r = 20 + (i * 37 % 45);
      const cx = i % 2 ? 150 : 255;
      const cy = i % 2 ? 245 : 268;
      g.beginPath(); g.arc(cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.55, 4, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = kontur; g.lineWidth = 5;
    g.beginPath(); g.moveTo(205, 205); g.quadraticCurveTo(212, 250, 200, 300); g.stroke();
  });
  const skulptur = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.47), new THREE.MeshBasicMaterial({ map: skulpturTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide }));
  const skulpturHalter = new THREE.Group();
  skulpturHalter.add(skulptur);
  skulptur.rotation.z = 0.1;
  // über dem Fenster (das Fenster sitzt direkt über der Box)
  setze(skulpturHalter, RAUM.xMin + 0.04, 2.84, 1.35, 0, Math.PI / 2, 0);
  scene.add(skulpturHalter);

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
  besen.userData.liegend = true;
  objekte.besen = besen;
  besen.userData.wand = { pos: besen.position.clone(), rot: besen.rotation.clone() };

  // Lichtschalter neben der Tür
  const schalter = new THREE.Group();
  schalter.add(quader(0.08, 0.08, 0.02, 0xf4f0e6, { umriss: 0.003 }));
  const wippe = quader(0.04, 0.04, 0.015, 0xe8e2d0, { umriss: 0.002 });
  wippe.position.z = 0.012;
  schalter.add(wippe);
  setze(schalter, 0.72, 1.1, RAUM.zMax - 0.012, 0, Math.PI, 0);
  scene.add(schalter);
  merke(schalter, 'licht', 'Lichtschalter', null);

  // WC-Tür vorne rechts: dreht sich ins Bad (offen, außer Dennis ist drin), Schild zur Werkstatt
  const klo = new THREE.Group();
  const kloBlatt = new THREE.Group();
  kloBlatt.add(setze(quader(0.83, 2.03, 0.05, 0xd9d4c4), 0.425, 1.025, 0));
  for (const sz of [-1, 1]) kloBlatt.add(setze(zylinder(0.022, 0.022, 0.12, 0xc9c9c9, {}, 10), 0.75, 1.0, sz * 0.05, Math.PI / 2, 0, 0));
  // WC-Schild zur Werkstatt hin: Schrift und Männchen/Weibchen
  const wcTex = leinwandTextur(256, 160, (g, b, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, b, h);
    g.strokeStyle = '#1d1d1f'; g.lineWidth = 8; g.strokeRect(4, 4, b - 8, h - 8);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 84px Arial'; g.textAlign = 'center'; g.fillText('WC', 78, 112);
    function figur(x, rock) {
      g.beginPath(); g.arc(x, 44, 13, 0, Math.PI * 2); g.fill();
      if (rock) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x - 22, 110); g.lineTo(x + 22, 110); g.closePath(); g.fill(); }
      else g.fillRect(x - 13, 60, 26, 50);
      g.fillRect(x - 10, 108, 7, 28); g.fillRect(x + 3, 108, 7, 28);
    }
    g.fillStyle = '#2f5fa8'; figur(180, false);
    g.fillStyle = '#c8352a'; figur(224, true);
  });
  const wcSchild = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.225), new THREE.MeshBasicMaterial({ map: wcTex }));
  wcSchild.position.set(0.425, 1.62, -0.03);
  wcSchild.rotation.y = Math.PI;
  kloBlatt.add(wcSchild);
  klo.add(kloBlatt);
  // Zarge
  klo.add(setze(quader(0.95, 0.06, 0.12, 0x3b3b3b), 0.425, 2.08, 0));
  for (const x of [-0.02, 0.87]) klo.add(setze(quader(0.04, 2.08, 0.12, 0x3b3b3b), x, 1.04, 0));
  setze(klo, KLO_TUER.xMin, 0, RAUM.zMax - 0.01, 0, 0, 0);
  scene.add(klo);
  merke(kloBlatt, 'kloTuer', 'WC-Tür', null);
  let kloOffen = true;
  animiert.push((dt) => {
    const ziel = kloOffen ? -1.5 : 0;
    kloBlatt.rotation.y += (ziel - kloBlatt.rotation.y) * Math.min(1, dt * 6);
  });

  // ---------- Bad: Schachbrett-Boden, Fliesen, Fenster, Klo, Dusche, Waschbecken, Waschmaschine und Trockner ----------
  const badBoden = leinwandTextur(256, 256, (g) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      g.fillStyle = (x + y) % 2 ? '#1d1d1f' : '#f2f0ea';
      g.fillRect(x * 32, y * 32, 32, 32);
    }
    g.strokeStyle = 'rgba(120,120,120,0.5)'; g.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  }, [(BAD.xMax - BAD.xMin) / 2.4, (BAD.zMax - BAD.zMin) / 2.4]);
  const badBodenMesh = new THREE.Mesh(new THREE.PlaneGeometry(BAD.xMax - BAD.xMin, BAD.zMax - BAD.zMin), toon(0xffffff, { map: badBoden }));
  badBodenMesh.rotation.x = -Math.PI / 2;
  badBodenMesh.position.set((BAD.xMin + BAD.xMax) / 2, 0.001, (BAD.zMin + BAD.zMax) / 2);
  badBodenMesh.receiveShadow = true;
  scene.add(badBodenMesh);
  // Fliesen bis 1,4 m, darüber heller Putz mit ein paar Stockflecken
  function badWandMalen(g, b, h, saat, unten = 0) {
    const r = zufall(saat);
    g.fillStyle = '#ece8df'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(90,100,80,0.12)'; g.beginPath(); g.ellipse(r() * b, r() * h * 0.4, 20 + r() * 40, 10 + r() * 25, 0, 0, Math.PI * 2); g.fill(); }
    const fliesenOben = h - (1.4 - unten) * PX;
    if (fliesenOben < h) {
      const f = 0.15 * PX;
      for (let y = h; y > fliesenOben - 0.5; y -= f) for (let x = 0; x < b; x += f) {
        g.fillStyle = r() < 0.05 ? '#d6dde0' : '#f7f8f6'; g.fillRect(x + 1, y - f + 1, f - 2, f - 2);
      }
      g.strokeStyle = '#9aa3a8'; g.lineWidth = 2;
      for (let x = 0; x < b; x += f) { g.beginPath(); g.moveTo(x, Math.max(0, fliesenOben)); g.lineTo(x, h); g.stroke(); }
      for (let y = h; y > fliesenOben - 0.5; y -= f) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
      g.fillStyle = '#7f8a8f'; g.fillRect(0, fliesenOben - 4, b, 5);
    }
  }
  const badWand = (b, x, z, ry, saat, hoehe = BAD.hoehe, unten = 0) => {
    const tex = leinwandTextur(Math.round(b * PX), Math.round(hoehe * PX), (g, bb, hh) => badWandMalen(g, bb, hh, saat, unten));
    const w = new THREE.Mesh(new THREE.PlaneGeometry(b, hoehe), toon(0xffffff, { map: tex }));
    w.position.set(x, unten + hoehe / 2, z);
    w.rotation.y = ry;
    w.receiveShadow = true;
    scene.add(w);
  };
  badWand(KLO_TUER.xMin - BAD.xMin, (BAD.xMin + KLO_TUER.xMin) / 2, BAD.zMin + 0.002, 0, 31);
  badWand(BAD.xMax - KLO_TUER.xMax, (KLO_TUER.xMax + BAD.xMax) / 2, BAD.zMin + 0.002, 0, 32);
  badWand(KLO_TUER.xMax - KLO_TUER.xMin, (KLO_TUER.xMin + KLO_TUER.xMax) / 2, BAD.zMin + 0.002, 0, 33, BAD.hoehe - KLO_TUER.hoehe, KLO_TUER.hoehe);
  badWand(BAD.zMax - BAD.zMin, BAD.xMin, (BAD.zMin + BAD.zMax) / 2, Math.PI / 2, 34);
  badWand(BAD.zMax - BAD.zMin, BAD.xMax, (BAD.zMin + BAD.zMax) / 2, -Math.PI / 2, 35);
  badWand(BAD.xMax - BAD.xMin, (BAD.xMin + BAD.xMax) / 2, BAD.zMax, Math.PI, 36);
  const badDecke = new THREE.Mesh(new THREE.PlaneGeometry(BAD.xMax - BAD.xMin, BAD.zMax - BAD.zMin), toon(0xe8e4da));
  badDecke.rotation.x = Math.PI / 2;
  badDecke.position.set((BAD.xMin + BAD.xMax) / 2, BAD.hoehe, (BAD.zMin + BAD.zMax) / 2);
  scene.add(badDecke);
  // Deckenlampe
  scene.add(setze(zylinder(0.16, 0.12, 0.08, 0xfffbea, { umriss: 0.003, wirft: false }, 18), 2.3, BAD.hoehe - 0.04, 5.4));
  const badLicht = new THREE.PointLight(0xfff2dc, 4, 6, 1.6);
  badLicht.position.set(2.3, BAD.hoehe - 0.3, 5.4);
  scene.add(badLicht);
  // Fenster (Milchglas) in der Rückwand
  const badFenster = new THREE.Group();
  badFenster.add(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.6), new THREE.MeshBasicMaterial({ color: 0xdfeef4 })));
  for (const [bb, hh, x, y] of [[0.78, 0.06, 0, 0.32], [0.78, 0.06, 0, -0.32], [0.06, 0.7, -0.37, 0], [0.06, 0.7, 0.37, 0], [0.04, 0.6, 0, 0]]) badFenster.add(setze(quader(bb, hh, 0.05, 0xf4f4ef, { wirft: false }), x, y, 0.02));
  badFenster.add(setze(quader(0.82, 0.04, 0.14, 0xf4f4ef, { wirft: false }), 0, -0.36, 0.06));
  setze(badFenster, 2.3, 1.75, BAD.zMax - 0.01, 0, Math.PI, 0);
  scene.add(badFenster);

  // Toilette in der hinteren linken Ecke, schaut zur Tür
  const toilette = new THREE.Group();
  const porzellan = 0xf7f7f3;
  toilette.add(setze(zylinder(0.15, 0.12, 0.36, porzellan, {}, 20), 0, 0.18, 0.04));
  const schuessel = setze(zylinder(0.2, 0.16, 0.08, porzellan, {}, 22), 0, 0.37, 0.06);
  schuessel.scale.set(0.9, 1, 1.15);
  toilette.add(schuessel);
  const kloWasser = new THREE.Mesh(new THREE.CircleGeometry(0.14, 20), new THREE.MeshBasicMaterial({ color: 0x9cc9e0 }));
  kloWasser.rotation.x = -Math.PI / 2;
  kloWasser.scale.set(0.9, 1.15, 1);
  kloWasser.position.set(0, 0.38, 0.06);
  toilette.add(kloWasser);
  const kloBrille = teil(new THREE.TorusGeometry(0.15, 0.025, 8, 24), 0xffffff, { umriss: 0.002 });
  kloBrille.rotation.x = Math.PI / 2;
  kloBrille.scale.set(0.9, 1.15, 1);
  kloBrille.position.set(0, 0.42, 0.06);
  toilette.add(kloBrille);
  toilette.add(setze(quader(0.36, 0.03, 0.4, 0xffffff), 0, 0.62, -0.17, -1.45, 0, 0));
  toilette.add(setze(quader(0.4, 0.38, 0.17, porzellan), 0, 0.62, -0.25));
  toilette.add(setze(quader(0.42, 0.03, 0.19, porzellan), 0, 0.825, -0.25));
  toilette.add(setze(zylinder(0.03, 0.03, 0.015, 0xc9cdd2, { umriss: 0.002 }, 12), 0, 0.845, -0.25));
  // Klorolle an der Wand
  toilette.add(setze(zylinder(0.055, 0.055, 0.1, 0xffffff, { umriss: 0.002 }, 14), -0.32, 0.7, -0.05, 0, 0, Math.PI / 2));
  setze(toilette, 1.2, 0, BAD.zMax - 0.35, 0, Math.PI, 0);
  scene.add(toilette);
  // Bild über dem Klo (Foto vom Betreiber: assets/bad-bild.jpg), Holzrahmen; fehlt das Foto, bleibt der Rahmen leer
  const badBild = new THREE.Group();
  // Profilrahmen: dunkles Holz außen, goldene Zierleiste, Passepartout, Glas mit Lichtreflex, Nagel und Aufhängeschnur
  const rahmenHolzTex = leinwandTextur(64, 256, (g, b, h) => {
    g.fillStyle = '#5a3a1e'; g.fillRect(0, 0, b, h);
    const r = zufall(61);
    for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(${30 + r() * 30},${18 + r() * 15},8,0.5)`; g.lineWidth = 1 + r() * 2; const x = r() * b; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, h * 0.3, x - 6, h * 0.6, x + 3, h); g.stroke(); }
  });
  const rahmenHolzMat = toon(0xffffff, { map: rahmenHolzTex });
  const rahmenLeiste = (bb, hh, x, y) => badBild.add(setze(teil(new THREE.BoxGeometry(bb, hh, 0.045), 0, { material: rahmenHolzMat, umriss: 0.003, wirft: false }), x, y, 0));
  rahmenLeiste(0.56, 0.06, 0, 0.42); rahmenLeiste(0.56, 0.06, 0, -0.42);
  rahmenLeiste(0.06, 0.9, -0.25, 0); rahmenLeiste(0.06, 0.9, 0.25, 0);
  // abgeschrägte Innenkante (gold)
  for (const [bb, hh, x, y] of [[0.44, 0.018, 0, 0.383], [0.44, 0.018, 0, -0.383], [0.018, 0.78, -0.211, 0], [0.018, 0.78, 0.211, 0]]) badBild.add(setze(quader(bb, hh, 0.03, 0xc9a13b, { umriss: 0.0015, wirft: false }), x, y, 0.012));
  // Eckverzierungen
  for (const [x, y] of [[-0.25, 0.42], [0.25, 0.42], [-0.25, -0.42], [0.25, -0.42]]) badBild.add(setze(kugel(0.018, 0xc9a13b, { umriss: 0.0015, wirft: false }, 10), x, y, 0.025));
  // Passepartout und Rückwand
  const passepartout = new THREE.Mesh(new THREE.PlaneGeometry(0.405, 0.75), new THREE.MeshBasicMaterial({ color: 0xf6f1e4 }));
  passepartout.position.z = 0.004;
  badBild.add(passepartout);
  const badBildMat = new THREE.MeshBasicMaterial({ color: 0xf4f0e6 });
  const badBildFoto = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.6), badBildMat);
  badBildFoto.position.z = 0.006;
  badBild.add(badBildFoto);
  // feine Linie ums Foto
  const fotoLinie = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.335, 0.605)), new THREE.LineBasicMaterial({ color: 0x9a8f78 }));
  fotoLinie.position.z = 0.007;
  badBild.add(fotoLinie);
  // Glas: schräger Lichtreflex
  const glasReflexMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, depthWrite: false });
  for (const [x, w] of [[-0.08, 0.06], [0.0, 0.025]]) {
    const reflex = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), glasReflexMat);
    reflex.position.set(x, 0, 0.012);
    reflex.rotation.z = -0.5;
    reflex.scale.y = 0.85;
    badBild.add(reflex);
  }
  // Messingschild unten
  badBild.add(setze(quader(0.12, 0.025, 0.006, 0xc9a13b, { umriss: 0.001, wirft: false }), 0, -0.4, 0.026));
  // Nagel und Schnur
  badBild.add(setze(zylinder(0.007, 0.007, 0.02, 0x5d6268, { umriss: false, wirft: false }, 8), 0, 0.58, -0.005, Math.PI / 2, 0, 0));
  for (const sx of [-1, 1]) badBild.add(setze(quader(0.2, 0.004, 0.004, 0x3a3a3a, { umriss: false, wirft: false }), sx * 0.09, 0.51, -0.018, 0, 0, sx * -0.75));
  badBild.rotation.z = 0.02;
  new THREE.TextureLoader().load('assets/bad-bild.jpg', (t) => { t.colorSpace = THREE.SRGBColorSpace; badBildMat.map = t; badBildMat.color.set(0xffffff); badBildMat.needsUpdate = true; }, undefined, () => {});
  setze(badBild, 1.2, 1.55, BAD.zMax - 0.03, 0, Math.PI, 0.025);
  scene.add(badBild);
  // Kackwurst: dick, geringelt, an den Enden spitz zulaufend, Knubbel und Risse, schwimmt im Wasser
  const wurst = new THREE.Group();
  {
    const pkt = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const w = t * Math.PI * 2.6;
      const rr = 0.085 - t * 0.055;
      pkt.push(new THREE.Vector3(Math.cos(w) * rr * 0.95, 0.01 + t * 0.045 + Math.sin(t * 9) * 0.004, Math.sin(w) * rr * 1.15));
    }
    const kurve = new THREE.CatmullRomCurve3(pkt);
    const SEG = 160, RAD = 12;
    const geo = new THREE.TubeGeometry(kurve, SEG, 1, RAD, false);
    // Radius entlang der Wurst: Enden spitz, Mitte dick, unregelmäßige Wülste
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      const mitte = kurve.getPointAt(t);
      const ende = Math.min(1, t / 0.12, (1 - t) / 0.16);
      const dick = 0.026 * Math.pow(Math.max(0, ende), 0.6) * (1 + Math.sin(t * 47) * 0.12 + Math.sin(t * 13 + 1) * 0.08);
      for (let j = 0; j <= RAD; j++) {
        const k = i * (RAD + 1) + j;
        v.fromBufferAttribute(pos, k).sub(mitte);
        const knubbel = 1 + Math.sin(j * 2.3 + i * 0.9) * 0.07;
        v.multiplyScalar(dick * knubbel);
        pos.setXYZ(k, mitte.x + v.x, mitte.y + v.y, mitte.z + v.z);
      }
    }
    geo.computeVertexNormals();
    const kackTex = leinwandTextur(256, 32, (g, b, h) => {
      g.fillStyle = '#6b4320'; g.fillRect(0, 0, b, h);
      const r = zufall(91);
      for (let i = 0; i < 180; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,34,14,0.55)' : 'rgba(140,96,52,0.45)'; g.fillRect(r() * b, r() * h, 2 + r() * 6, 1 + r() * 3); }
      // Querrisse
      g.strokeStyle = 'rgba(40,22,8,0.8)'; g.lineWidth = 1.5;
      for (let x = 6; x < b; x += 10 + r() * 12) { g.beginPath(); g.moveTo(x, r() * 6); g.lineTo(x + (r() - 0.5) * 4, h - r() * 6); g.stroke(); }
      // Maiskörner
      g.fillStyle = '#e8c33a';
      for (let i = 0; i < 6; i++) g.fillRect(r() * b, r() * h, 4, 3);
    }, [4, 1]);
    const kack = teil(geo, 0, { material: toon(0xffffff, { map: kackTex }), umriss: 0.003 });
    wurst.add(kack);
    // zwei kleinere Brocken daneben
    for (const [x, z, s] of [[0.07, -0.06, 0.018], [-0.075, 0.07, 0.014]]) {
      const b = kugel(s, 0x5e3a1b, { umriss: 0.002 }, 10);
      b.scale.set(1.6, 0.8, 1);
      b.position.set(x, 0.008, z);
      b.rotation.y = x * 10;
      wurst.add(b);
    }
    // Fetzen Klopapier
    const papier = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.05), new THREE.MeshBasicMaterial({ color: 0xf4f2ea, side: THREE.DoubleSide }));
    papier.rotation.set(-Math.PI / 2 + 0.2, 0, 0.6);
    papier.position.set(-0.05, 0.012, -0.07);
    wurst.add(papier);
  }
  wurst.position.set(0, 0.405, 0.06);
  wurst.visible = false;
  toilette.add(wurst);
  merke(toilette, 'toilette', 'Toilette', null);
  objekte.toilette = toilette;
  hindernis(0.95, 1.5, BAD.zMax - 0.7, BAD.zMax);
  // Pfütze bei Verstopfung
  const kloPfuetzeTex = leinwandTextur(256, 256, (g) => {
    const r = zufall(73);
    g.clearRect(0, 0, 256, 256);
    g.filter = 'blur(4px)';
    g.fillStyle = 'rgba(196,178,70,1)';
    // Hauptlache vor dem Klo, dazu Ausläufer und Spritzer
    for (let i = 0; i < 9; i++) {
      const w = r() * Math.PI * 2, d = r() * 55;
      const rr = 18 + r() * 40;
      g.beginPath(); g.ellipse(128 + Math.cos(w) * d, 110 + Math.sin(w) * d * 0.7, rr, rr * (0.45 + r() * 0.5), r() * 3, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(60 + r() * 140, 180 + r() * 50, 6 + r() * 14, 4 + r() * 8, r() * 3, 0, Math.PI * 2); g.fill(); }
    g.filter = 'none';
    g.fillStyle = 'rgba(255,255,230,0.35)';
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(100 + r() * 60, 90 + r() * 40, 8 + r() * 12, 2 + r() * 3, r() * 3, 0, Math.PI * 2); g.fill(); }
  });
  const kloPfuetze = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: kloPfuetzeTex, transparent: true, opacity: 0.75, depthWrite: false }));
  kloPfuetze.rotation.x = -Math.PI / 2;
  kloPfuetze.position.set(1.4, 0.006, BAD.zMax - 0.9);
  kloPfuetze.visible = false;
  scene.add(kloPfuetze);

  // Dusche hinten rechts: Wanne, Glaswände mit Rahmen, Brausestange mit Kopf und Schlauch
  const dusche = new THREE.Group();
  dusche.add(setze(quader(0.9, 0.08, 0.9, porzellan), 0, 0.04, 0));
  dusche.add(setze(zylinder(0.04, 0.04, 0.01, 0x9aa3ab, { umriss: false }, 12), 0, 0.085, 0));
  const glasMat = new THREE.MeshBasicMaterial({ color: 0xcfe8f2, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide });
  const glasVorne = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.9), glasMat);
  glasVorne.position.set(0, 1.03, -0.45);
  dusche.add(glasVorne);
  const glasSeite = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.9), glasMat);
  glasSeite.rotation.y = Math.PI / 2;
  glasSeite.position.set(-0.45, 1.03, 0);
  dusche.add(glasSeite);
  for (const [bb, hh, tt, x, y, zz] of [[0.92, 0.03, 0.03, 0, 1.98, -0.45], [0.03, 0.03, 0.92, -0.45, 1.98, 0], [0.03, 1.9, 0.03, -0.45, 1.03, -0.45]]) dusche.add(setze(quader(bb, hh, tt, 0xb8bcc2, { umriss: 0.002 }), x, y, zz));
  dusche.add(setze(zylinder(0.012, 0.012, 1.0, 0xc9cdd2, {}, 8), 0.43, 1.5, 0.1));
  dusche.add(setze(zylinder(0.06, 0.04, 0.03, 0xc9cdd2, { umriss: 0.002 }, 14), 0.38, 1.95, 0.1, 0, 0, 0.6));
  const brauseSchlauch = new THREE.CatmullRomCurve3([new THREE.Vector3(0.43, 1.0, 0.1), new THREE.Vector3(0.38, 0.75, 0.14), new THREE.Vector3(0.42, 0.55, 0.12), new THREE.Vector3(0.43, 0.9, 0.08), new THREE.Vector3(0.4, 1.92, 0.1)]);
  dusche.add(teil(new THREE.TubeGeometry(brauseSchlauch, 30, 0.008, 6, false), 0xb8bcc2, { umriss: 0.0015 }));
  dusche.add(setze(zylinder(0.03, 0.03, 0.06, 0xc9cdd2, { umriss: 0.002 }, 10), 0.43, 1.05, 0.1, 0, 0, Math.PI / 2));
  setze(dusche, BAD.xMax - 0.45, 0, BAD.zMax - 0.45, 0, 0, 0);
  scene.add(dusche);
  merke(dusche, 'dusche', 'Dusche', null);
  objekte.dusche = dusche;
  hindernis(BAD.xMax - 0.92, BAD.xMax, BAD.zMax - 0.92, BAD.zMax);

  // Waschbecken an der linken Wand mit Spiegel und Hahn
  const becken2 = new THREE.Group();
  const beckenSchale = setze(zylinder(0.24, 0.18, 0.16, porzellan, {}, 22), 0, 0.82, 0);
  beckenSchale.scale.set(1, 1, 0.8);
  becken2.add(beckenSchale);
  const beckenGrund = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), new THREE.MeshBasicMaterial({ color: 0xdde4e6 }));
  beckenGrund.rotation.x = -Math.PI / 2;
  beckenGrund.scale.set(1, 0.8, 1);
  beckenGrund.position.y = 0.901;
  becken2.add(beckenGrund);
  becken2.add(setze(zylinder(0.05, 0.07, 0.72, porzellan, {}, 14), 0, 0.37, -0.06));
  becken2.add(setze(zylinder(0.015, 0.015, 0.14, 0xc9cdd2, { umriss: 0.002 }, 8), 0, 0.97, -0.15));
  becken2.add(setze(zylinder(0.012, 0.012, 0.1, 0xc9cdd2, { umriss: 0.002 }, 8), 0, 1.03, -0.1, Math.PI / 2, 0, 0));
  becken2.add(setze(quader(0.05, 0.015, 0.06, 0xc9cdd2, { umriss: 0.002 }), 0, 1.05, -0.17));
  const badSpiegel = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.65), new THREE.MeshBasicMaterial({ color: 0xbfd6dd }));
  badSpiegel.position.set(0, 1.6, -0.215);
  becken2.add(badSpiegel);
  becken2.add(setze(quader(0.54, 0.69, 0.02, 0x9aa3ab, { umriss: 0.002, wirft: false }), 0, 1.6, -0.228));
  becken2.add(setze(quader(0.5, 0.02, 0.1, 0xf4f4ef, { umriss: 0.002 }), 0, 1.25, -0.17));
  setze(becken2, BAD.xMin + 0.23, 0, 5.35, 0, Math.PI / 2, 0);
  scene.add(becken2);
  merke(becken2, 'waschbecken', 'Waschbecken', null);
  objekte.waschbecken = becken2;

  // Dennis' Lockencreme auf der Ablage unter dem Spiegel: Tiegel mit Etikett, daneben Tube und Kamm
  const cremeTex = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#f7efe0'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#7a3fa0'; g.fillRect(0, 0, b, 10); g.fillRect(0, h - 10, b, 10);
    g.fillStyle = '#5a2a7a'; g.font = 'bold 20px Bangers, Impact, sans-serif'; g.textAlign = 'center';
    g.fillText('CURL KING', b / 2, 32); g.font = '13px Arial'; g.fillText('Lockencreme  250 ml', b / 2, 50);
    g.strokeStyle = '#7a3fa0'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(20 + i * 7, 32, 6, 0, Math.PI * 1.6); g.stroke(); }
  });
  const cremeDose = new THREE.Group();
  const cremeTiegel = teil(new THREE.CylinderGeometry(0.042, 0.04, 0.05, 20), 0, { material: toon(0xffffff, { map: cremeTex }), umriss: 0.002 });
  cremeTiegel.position.y = 0.025;
  cremeDose.add(cremeTiegel);
  cremeDose.add(setze(zylinder(0.045, 0.045, 0.02, 0x7a3fa0, { umriss: 0.002 }, 20), 0, 0.06, 0));
  cremeDose.add(setze(zylinder(0.03, 0.03, 0.004, 0xc9a13b, { umriss: false }, 16), 0, 0.071, 0));
  scene.add(setze(cremeDose, BAD.xMin + 0.07, 1.265, 5.27));
  merke(cremeDose, 'creme', 'Lockencreme', null);
  objekte.creme = cremeDose;
  cremeDose.userData.start = { pos: cremeDose.position.clone(), rot: cremeDose.rotation.clone() };
  const cremeTube = new THREE.Group();
  const cremeTubeKoerper = teil(new THREE.CylinderGeometry(0.018, 0.025, 0.13, 12), 0xf7efe0, { umriss: 0.002 });
  cremeTubeKoerper.scale.z = 0.5;
  cremeTube.add(setze(cremeTubeKoerper, 0, 0.065, 0));
  cremeTube.add(setze(zylinder(0.012, 0.012, 0.025, 0x7a3fa0, { umriss: 0.002 }, 10), 0, 0.142, 0));
  scene.add(setze(cremeTube, BAD.xMin + 0.07, 1.265, 5.42, 0, 0, 0.12));
  const badKamm = new THREE.Group();
  badKamm.add(setze(quader(0.012, 0.012, 0.16, 0x1d1d1f, { umriss: 0.0015 }), 0, 0.012, 0));
  for (let i = 0; i < 14; i++) badKamm.add(setze(quader(0.012, 0.022, 0.003, 0x1d1d1f, { umriss: false }), 0, -0.004, -0.07 + i * 0.01));
  scene.add(setze(badKamm, BAD.xMin + 0.11, 1.282, 5.36, 0, 0.3, Math.PI / 2));

  // Schwarze enge Latexunterhose am Haken an der linken Badwand (glänzend, Bund mit Naht, Beinausschnitte mit Rand)
  const hosenHaken = new THREE.Group();
  hosenHaken.add(setze(quader(0.02, 0.07, 0.04, 0xc9a13b, { umriss: 0.002 }), 0, 0, 0));
  const hosenHakenBogen = new THREE.CatmullRomCurve3([new THREE.Vector3(0.01, 0.0, 0), new THREE.Vector3(0.07, -0.02, 0), new THREE.Vector3(0.09, 0.02, 0), new THREE.Vector3(0.08, 0.045, 0)]);
  hosenHaken.add(teil(new THREE.TubeGeometry(hosenHakenBogen, 16, 0.007, 8, false), 0xc9a13b, { umriss: 0.0015 }));
  hosenHaken.add(setze(kugel(0.01, 0xc9a13b, { umriss: 0.0015 }, 8), 0.08, 0.05, 0));
  setze(hosenHaken, BAD.xMin + 0.01, 1.7, 5.85);
  scene.add(hosenHaken);
  const latex = new THREE.Group();
  {
    const latexMat = toon(0x17171a);
    // Silhouette (vorne): oben breit, Beinausschnitte als Bögen, schmaler Schritt
    const hosenForm = new THREE.Shape();
    hosenForm.moveTo(-0.16, 0.0);
    hosenForm.lineTo(0.16, 0.0);
    hosenForm.lineTo(0.15, -0.06);
    hosenForm.bezierCurveTo(0.1, -0.08, 0.05, -0.15, 0.035, -0.22);
    hosenForm.lineTo(-0.035, -0.22);
    hosenForm.bezierCurveTo(-0.05, -0.15, -0.1, -0.08, -0.15, -0.06);
    hosenForm.closePath();
    const hosenGeo = new THREE.ExtrudeGeometry(hosenForm, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 5, curveSegments: 24 });
    hosenGeo.translate(0, 0, -0.015);
    // leicht gewölbt wie ein Körper
    const hosenPos = hosenGeo.attributes.position;
    for (let i = 0; i < hosenPos.count; i++) {
      const x = hosenPos.getX(i), y = hosenPos.getY(i), zz = hosenPos.getZ(i);
      hosenPos.setZ(i, zz * (1 + 0.9 * Math.max(0, 1 - Math.abs(x) / 0.17)) - Math.pow(x / 0.17, 2) * 0.03 + (y < -0.12 ? 0.01 : 0));
    }
    hosenGeo.computeVertexNormals();
    const latexKoerper = new THREE.Mesh(hosenGeo, latexMat);
    latexKoerper.castShadow = true;
    latex.add(latexKoerper);
    umriss(latexKoerper, 0.003);
    // Bund: etwas dicker, mattere Kante mit Prägung
    const latexBund = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.028, 0.072), new THREE.MeshPhongMaterial({ color: 0x151518, specular: 0x555a60, shininess: 60 }));
    latexBund.position.set(0, -0.012, 0);
    latex.add(latexBund);
    umriss(latexBund, 0.0025);
    const latexPraegeTex = leinwandTextur(256, 32, (g, b, h) => { g.fillStyle = '#151518'; g.fillRect(0, 0, b, h); g.fillStyle = '#3a3d42'; g.font = 'bold 18px Arial'; g.textAlign = 'center'; g.fillText('LATEX', b / 2, 23); });
    const latexPraege = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.016), new THREE.MeshBasicMaterial({ map: latexPraegeTex }));
    latexPraege.position.set(0, -0.012, 0.0365);
    latex.add(latexPraege);
    // Ränder an den Beinausschnitten (schmale Wülste)
    for (const sx of [-1, 1]) {
      const latexRand = new THREE.CatmullRomCurve3([new THREE.Vector3(sx * 0.15, -0.06, 0.03), new THREE.Vector3(sx * 0.1, -0.085, 0.036), new THREE.Vector3(sx * 0.055, -0.15, 0.036), new THREE.Vector3(sx * 0.037, -0.215, 0.03)]);
      latex.add(new THREE.Mesh(new THREE.TubeGeometry(latexRand, 20, 0.004, 6, false), latexMat));
    }
    // Glanzlichter
    const latexGlanz = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
    for (const [x, y, w, hh, r] of [[-0.06, -0.06, 0.012, 0.09, 0.25], [0.07, -0.05, 0.008, 0.06, -0.3], [0.0, -0.17, 0.006, 0.04, 0]]) {
      const latexGl = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), latexGlanz);
      latexGl.position.set(x, y, 0.05);
      latexGl.rotation.z = r;
      latex.add(latexGl);
    }
  }
  // hängt mit dem Bund am Haken, Vorderseite zum Raum, leicht schräg
  setze(latex, BAD.xMin + 0.06, 1.74, 5.93, 0, Math.PI / 2, -0.12);
  scene.add(latex);
  merke(latex, 'latexhose', 'Latexunterhose', null);
  hindernis(BAD.xMin, BAD.xMin + 0.48, 5.1, 5.6);

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
  objekte.figur = figur;
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

  // Feuer: flackernde Comic-Flammen, leuchtende Zungen, Glut, Rauch zur Decke, Ruß bleibt danach
  const feuer = new THREE.Group();
  const flammen = [];
  const flammenMats = [0xd8321a, 0xff5a1f, 0xff9a1f, 0xffd23a].map((c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.92, depthWrite: false }));
  for (let i = 0; i < 14; i++) {
    const innen = i >= 9;
    const geo = new THREE.ConeGeometry(innen ? 0.04 : 0.055 + (i % 3) * 0.018, innen ? 0.24 : 0.38, 7);
    geo.translate(0, innen ? 0.12 : 0.19, 0);
    const f = new THREE.Mesh(geo, flammenMats[innen ? 3 : i % 3]);
    f.userData.phase = i * 1.3;
    const r = innen ? 0.03 : 0.07 + (i % 2) * 0.04;
    f.userData.x = Math.sin(i * 2.1) * r;
    f.userData.z = Math.cos(i * 2.1) * r;
    f.userData.neig = innen ? 0.05 : 0.18;
    feuer.add(f);
    flammen.push(f);
  }
  // weiche Flammenzungen (Sprites, additiv)
  const zungenTex = leinwandTextur(64, 128, (g) => {
    const gr = g.createRadialGradient(32, 92, 2, 32, 80, 60);
    gr.addColorStop(0, 'rgba(255,250,200,1)');
    gr.addColorStop(0.25, 'rgba(255,200,60,0.95)');
    gr.addColorStop(0.55, 'rgba(255,100,20,0.6)');
    gr.addColorStop(1, 'rgba(200,30,10,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(32, 2);
    g.bezierCurveTo(56, 50, 62, 90, 32, 126);
    g.bezierCurveTo(2, 90, 8, 50, 32, 2);
    g.fill();
  });
  const zungen = [];
  for (let i = 0; i < 10; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zungenTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.userData = { t: i / 10, x: Math.sin(i * 2.7) * 0.08, z: Math.cos(i * 2.7) * 0.08 };
    feuer.add(sp);
    zungen.push(sp);
  }
  // Glut: kleine Funken, die hochfliegen
  const punktTex = leinwandTextur(32, 32, (g) => {
    const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 32, 32);
  });
  const glut = [];
  for (let i = 0; i < 14; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: punktTex, color: i % 2 ? 0xffb030 : 0xff6a20, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    sp.userData = { t: i / 14, x: 0, z: 0, wx: Math.sin(i * 1.9) * 0.15, wz: Math.cos(i * 3.1) * 0.15 };
    sp.scale.setScalar(0.025);
    feuer.add(sp);
    glut.push(sp);
  }
  // Glühende Pappe oben im Eimer
  const glutBett = new THREE.Mesh(new THREE.CircleGeometry(0.16, 16), new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.9 }));
  glutBett.rotation.x = -Math.PI / 2;
  glutBett.position.y = -0.02;
  feuer.add(glutBett);
  const feuerLicht = new THREE.PointLight(0xff7a2a, 0, 4, 1.5);
  feuerLicht.position.y = 0.4;
  feuer.add(feuerLicht);
  feuer.position.set(1.55, 0.45, -3.3);
  feuer.scale.setScalar(1.7);
  feuer.visible = false;
  scene.add(feuer);
  // Rauch steigt zur Decke (in Weltkoordinaten)
  const rauch = new THREE.Group();
  rauch.visible = false;
  scene.add(rauch);
  const rauchTex = leinwandTextur(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 4, 32, 32, 30);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)');
    gr.addColorStop(0.6, 'rgba(255,255,255,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  });
  const qualm = [];
  for (let i = 0; i < 12; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: rauchTex, color: 0x3a3634, transparent: true, depthWrite: false }));
    sp.userData = { t: i / 12, wx: Math.sin(i * 2.3) * 0.25, wz: Math.cos(i * 1.7) * 0.15 };
    rauch.add(sp);
    qualm.push(sp);
  }
  // Ruß: wächst, solange es brennt, und bleibt danach (Decke und Wand über dem Eimer)
  const russTex = leinwandTextur(128, 128, (g) => {
    const r = zufall(77);
    for (let i = 0; i < 26; i++) {
      const x = 64 + (r() - 0.5) * 50, y = 64 + (r() - 0.5) * 50, rad = 18 + r() * 34;
      const gr = g.createRadialGradient(x, y, 1, x, y, rad);
      gr.addColorStop(0, 'rgba(20,16,14,0.35)');
      gr.addColorStop(1, 'rgba(20,16,14,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    }
  });
  const russMat = new THREE.MeshBasicMaterial({ map: russTex, transparent: true, opacity: 0, depthWrite: false });
  const russDecke = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), russMat);
  russDecke.rotation.x = Math.PI / 2;
  russDecke.position.set(1.55, RAUM.hoehe - 0.012, -3.15);
  scene.add(russDecke);
  const russWand = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.4), russMat);
  russWand.position.set(1.55, 2.4, RAUM.zMin + 0.015);
  scene.add(russWand);
  let russ = 0;
  let feuerZeit = 0;
  animiert.push((dt) => {
    if (rauch.visible) {
      // Rauch zieht nach dem Löschen noch kurz ab
      let sichtbar = false;
      for (const sp of qualm) {
        const u = sp.userData;
        u.t += dt * 0.22;
        if (u.t >= 1) { if (feuer.visible) u.t -= 1; else { sp.material.opacity = 0; continue; } }
        sichtbar = true;
        const h = 0.9 + u.t * (RAUM.hoehe - 1.0);
        const breit = u.t > 0.8 ? (u.t - 0.8) * 4 : 0;
        sp.position.set(1.55 + u.wx * u.t + Math.sin(feuerZeit + u.t * 6) * 0.05 + breit * u.wx * 2, h, -3.3 + u.wz * u.t + breit * 0.3);
        sp.scale.setScalar(0.35 + u.t * 1.1);
        sp.material.opacity = Math.sin(Math.min(1, u.t) * Math.PI) * 0.55;
      }
      if (!sichtbar) rauch.visible = false;
    }
    if (!feuer.visible) return;
    feuerZeit += dt;
    russ = Math.min(1, russ + dt * 0.035);
    russMat.opacity = russ * 0.9;
    for (const f of flammen) {
      const p = f.userData.phase;
      const h = 0.8 + Math.sin(feuerZeit * 9 + p) * 0.25 + Math.sin(feuerZeit * 17 + p * 2) * 0.12;
      f.scale.set(1 + Math.sin(feuerZeit * 13 + p) * 0.08, h, 1);
      f.position.set(f.userData.x + Math.sin(feuerZeit * 5 + p) * 0.02, 0, f.userData.z);
      f.rotation.set(Math.sin(feuerZeit * 4 + p) * f.userData.neig, 0, Math.cos(feuerZeit * 3 + p) * f.userData.neig);
    }
    for (const sp of zungen) {
      const u = sp.userData;
      u.t = (u.t + dt * 1.6) % 1;
      sp.position.set(u.x * (1 - u.t) + Math.sin(feuerZeit * 7 + u.x * 40) * 0.02, 0.08 + u.t * 0.42, u.z * (1 - u.t));
      sp.scale.set(0.18 * (1 - u.t * 0.6), 0.34 * (1 - u.t * 0.4), 1);
      sp.material.opacity = Math.sin(u.t * Math.PI) * 0.85;
    }
    for (const sp of glut) {
      const u = sp.userData;
      u.t += dt * 0.7;
      if (u.t >= 1) u.t -= 1;
      sp.position.set(u.wx * u.t + Math.sin(feuerZeit * 11 + u.wz * 30) * 0.03, 0.1 + u.t * 0.9, u.wz * u.t);
      sp.material.opacity = 1 - u.t;
    }
    glutBett.material.opacity = 0.75 + Math.sin(feuerZeit * 15) * 0.2;
    feuerLicht.intensity = 4 + Math.sin(feuerZeit * 23) * 1.2 + Math.sin(feuerZeit * 7.3) * 0.6;
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
  // Wasser: blaue Tropfen von a nach b (Schlauch, Leck)
  const tropfenTex = leinwandTextur(32, 32, (g) => {
    const v = g.createRadialGradient(16, 16, 2, 16, 16, 15);
    v.addColorStop(0, 'rgba(220,240,255,1)');
    v.addColorStop(0.5, 'rgba(110,180,255,0.9)');
    v.addColorStop(1, 'rgba(110,180,255,0)');
    g.fillStyle = v;
    g.beginPath(); g.arc(16, 16, 15, 0, Math.PI * 2); g.fill();
  });
  const tropfenMat = new THREE.SpriteMaterial({ map: tropfenTex, transparent: true, depthWrite: false });
  const tropfen = [];
  function wasser(von, nach, anzahl = 8, streuung = 0.4) {
    for (let i = 0; i < anzahl; i++) {
      const sp = new THREE.Sprite(tropfenMat);
      sp.position.copy(von);
      const v = new THREE.Vector3().subVectors(nach, von).multiplyScalar(1.6 + Math.random() * 0.4);
      v.add(new THREE.Vector3((Math.random() - 0.5) * streuung, Math.random() * streuung * 0.5 + 1.2, (Math.random() - 0.5) * streuung));
      sp.userData = { v, t: 0 };
      sp.scale.setScalar(0.035 + Math.random() * 0.03);
      scene.add(sp);
      tropfen.push(sp);
    }
  }
  animiert.push((dt) => {
    for (let i = tropfen.length - 1; i >= 0; i--) {
      const w = tropfen[i];
      w.userData.t += dt;
      w.userData.v.y -= 9.81 * dt;
      w.position.addScaledVector(w.userData.v, dt);
      if (w.position.y < 0.02) { nass(w.position.x, w.position.z); scene.remove(w); tropfen.splice(i, 1); } else if (w.userData.t > 2) { scene.remove(w); tropfen.splice(i, 1); }
    }
  });
  // Pfützen: entstehen, wo Wasser auf den Boden fällt, wachsen schnell, trocknen langsam
  const pfuetzen = [];
  // unregelmäßige Pfützen: ein paar Klecks-Formen als Textur, zufällig gedreht
  const pfuetzenMats = [1, 2, 3].map((saat) => {
    const z = zufall(saat * 7);
    const t = leinwandTextur(128, 128, (g) => {
      g.clearRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(90,166,230,1)';
      g.filter = 'blur(3px)';
      for (let i = 0; i < 7; i++) {
        const w = z() * Math.PI * 2;
        const r = 14 + z() * 28;
        g.beginPath();
        g.ellipse(64 + Math.cos(w) * z() * 30, 64 + Math.sin(w) * z() * 30, r, r * (0.5 + z() * 0.5), z() * 3, 0, Math.PI * 2);
        g.fill();
      }
    });
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  });
  function nass(x, z) {
    if (x < RAUM.xMin || x > RAUM.xMax || z < RAUM.zMin || z > RAUM.zMax) return;
    let p = pfuetzen.find((q) => Math.hypot(q.position.x - x, q.position.z - z) < q.userData.r + 0.25);
    if (!p && pfuetzen.length < 30) {
      p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), pfuetzenMats[pfuetzen.length % 3]);
      p.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
      p.position.set(x, 0.004 + pfuetzen.length * 0.0002, z);
      p.userData.r = 0.05;
      p.scale.setScalar(0.05);
      scene.add(p);
      pfuetzen.push(p);
    }
    if (!p) return;
    p.userData.r = Math.min(1.1, Math.sqrt(p.userData.r * p.userData.r + 0.0035));
    p.scale.set(p.userData.r, p.userData.r, 1);
  }
  animiert.push((dt) => {
    for (let i = pfuetzen.length - 1; i >= 0; i--) {
      const p = pfuetzen[i];
      p.userData.r -= dt * 0.006;
      if (p.userData.r < 0.03) { scene.remove(p); pfuetzen.splice(i, 1); continue; }
      p.scale.set(p.userData.r, p.userData.r, 1);
    }
  });
  let leckAn = false;
  let leckTakt = 0;
  animiert.push((dt) => {
    leckRing.visible = leckAn;
    if (leckAn) leckRing.scale.setScalar(1 + Math.sin(performance.now() / 150) * 0.15);
    if (leckAn) {
      leckTakt += dt;
      while (leckTakt > 0.03) {
        leckTakt -= 0.03;
        wasser(new THREE.Vector3(4.9, 0.9, 1.6), new THREE.Vector3(4.2 + (Math.random() - 0.5) * 0.4, 1.0, 1.6 + (Math.random() - 0.5) * 0.9), 2, 0.6);
      }
      pfuetze.visible = true;
      pfuetze.scale.setScalar(Math.min(1.5, pfuetze.scale.x + dt * 0.05));
    } else if (pfuetze.visible) {
      pfuetze.scale.setScalar(Math.max(0.01, pfuetze.scale.x - dt * 0.02));
      if (pfuetze.scale.x <= 0.011) pfuetze.visible = false;
    }
  });

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

  // Dennis' Klemmbrett mit Notizen, liegt auf dem Sofa
  const klemmbrett = new THREE.Group();
  // Handschrift: Caveat (Google Font), leicht schief, wechselnde Stiftfarbe, Erledigtes durchgestrichen
  function notizenMalen(g, b, h) {
    const r = zufall(31);
    g.fillStyle = '#fbfaf3'; g.fillRect(0, 0, b, h);
    g.strokeStyle = '#9ec3e6'; g.lineWidth = 2;
    for (let y = 92; y < h; y += 46) { g.beginPath(); g.moveTo(14, y); g.lineTo(b - 14, y); g.stroke(); }
    g.strokeStyle = '#e8a0a0'; g.beginPath(); g.moveTo(52, 0); g.lineTo(52, h); g.stroke();
    // Kaffeefleck
    g.strokeStyle = 'rgba(140, 95, 50, 0.25)'; g.lineWidth = 5;
    g.beginPath(); g.arc(430, 630, 34, 0.3, 5.6); g.stroke();
    let zeile = 0;
    for (const n of NOTIZEN) {
      const teile = Array.isArray(n.t) ? n.t : [n.t];
      teile.forEach((t, j) => {
        const y = 84 + zeile * 46;
        const x = 64 + (j ? 26 : 0) + (r() - 0.5) * 8;
        g.save();
        g.translate(x, y);
        g.rotate((r() - 0.5) * 0.05);
        g.fillStyle = n.rot ? '#b3261e' : r() < 0.25 ? '#16306e' : '#1f3f8a';
        g.font = `${n.fett ? 700 : 500} ${46 + Math.round((r() - 0.5) * 4)}px Caveat, "Segoe Print", "Bradley Hand", cursive`;
        g.fillText(t, 0, 0);
        const breite = g.measureText(t).width;
        if (n.durch) {
          // krakelig durchgestrichen
          g.strokeStyle = '#1f3f8a'; g.lineWidth = 3;
          g.beginPath();
          g.moveTo(-6, -13);
          for (let i = 1; i <= 6; i++) g.lineTo(-6 + (breite + 12) * i / 6, -13 + (r() - 0.5) * 6);
          g.stroke();
        }
        g.restore();
        zeile++;
      });
      if (n.haken) {
        g.strokeStyle = '#2b7a2b'; g.lineWidth = 4;
        const y = 84 + (zeile - 1) * 46;
        g.beginPath(); g.moveTo(22, y - 14); g.lineTo(30, y - 4); g.lineTo(44, y - 26); g.stroke();
      }
    }
  }
  const notizTex = leinwandTextur(512, 692, notizenMalen);
  // Schrift kommt erst aus dem Netz: danach neu malen
  if (document.fonts?.load) {
    Promise.all([document.fonts.load('500 46px Caveat'), document.fonts.load('700 46px Caveat')])
      .then(() => { notizenMalen(notizTex.userData.ctx, 512, 692); notizTex.needsUpdate = true; })
      .catch(() => {});
  }
  klemmbrett.add(quader(0.23, 0.012, 0.32, 0x8a5a2e));
  const blatt = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.27), new THREE.MeshBasicMaterial({ map: notizTex }));
  blatt.rotation.x = -Math.PI / 2;
  blatt.position.set(0, 0.0075, 0.015);
  klemmbrett.add(blatt);
  klemmbrett.add(setze(quader(0.1, 0.02, 0.04, 0xb8bcc2), 0, 0.014, -0.135));
  setze(klemmbrett, -3.75, 0.49, 3.5, 0, 0.5, 0);
  scene.add(klemmbrett);
  merke(klemmbrett, 'klemmbrett', 'Dennis’ Klemmbrett', null);
  klemmbrett.userData.start = { pos: klemmbrett.position.clone(), rot: klemmbrett.rotation.clone() };
  objekte.klemmbrett = klemmbrett;

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
    // draußen und auf dem Boden drinnen: dort, wo man sie abgestellt hat (flaschePlatz), sie bleibt da liegen
    draussen: { pos: [-0.55, 0.335, 6.1], rot: [0, 0.4, 0], station: null },
    boden:    { pos: [0, 0.335, 0], rot: [0, 0.4, 0], station: null },
  };
  function flaschePlatz(ort, p) {
    const o = flaschenOrte[ort];
    if (!o || !p || o.station) return;
    o.pos = [p.x, p.y + 0.335, p.z];
    o.rot = [0, Math.random() * Math.PI * 2, 0];
  }
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

  // ---------- Benutzte Kaffeetassen: stehen überall rum, gehören auf den Kühlschrank ----------
  const tassen = [];
  const TASSEN_FARBEN = [[0xf4f0e6, 0x2f5fa8], [0x2f5fa8, 0xf4f0e6], [0xc8352a, 0xf4f0e6], [0x3f7a35, 0xf2c21c], [0xf2c21c, 0x1d1d1f], [0x1d1d1f, 0xf4f0e6], [0xe98bb8, 0xf4f0e6], [0x8a5a2a, 0xf4f0e6]];
  // mögliche Abstellplätze (x, z, Strahl-Start): nie auf dem Boden, sondern auf Möbeln und Kram
  const TASSEN_PLAETZE = [
    [1.2, 6.69, 1.2],     // Bad: Spülkasten
    // Regal nur vorne an der Kante und nicht über Augenhöhe (oben/hinten sieht und trifft man sie nicht)
    [-4.56, -0.4, 1.2],   // Regal Mitte
    [-4.56, -1.0, 1.2],   // Regal Mitte, andere Seite
    [-2.34, 3.55, 1.0],   // Sofa: Armlehne
    [-4.06, 3.6, 1.0],    // Sofa: andere Armlehne
    [3.1, 3.48, 1.0],     // Stahlträger
    [4.0, 3.42, 1.0],     // Stahlträger
    [4.93, -1.55, 1.75],  // Erste-Hilfe-Kasten
    [-0.95, -3.1, 2.3],   // Werkbank
    [0.85, -3.15, 2.3],   // Werkbank
    [3.75, -3.2, 2.3],    // Schweißtisch-Ecke
  ];
  const strahl = new THREE.Raycaster();
  strahl.camera = new THREE.PerspectiveCamera(); // nötig, sonst stolpert der Strahl über Sprites (Rauch, Wolken)
  function oberflaecheBei(x, z, start = 2.3) {
    strahl.set(new THREE.Vector3(x, start, z), new THREE.Vector3(0, -1, 0));
    // Tassen, Figuren (Dennis, Jonny, Waldo), Unsichtbares, Umrisse und Sprites zählen nicht als Abstellfläche
    const figur = ['dennis', 'jonny', 'waldo'];
    const ignor = (o) => {
      if (o.isSprite || o.isLine || o.isPoints || o.userData.umriss) return true;
      for (let p = o; p; p = p.parent) if (!p.visible || tassen.includes(p) || figur.includes(p.userData.interaktiv?.id)) return true;
      return false;
    };
    for (const h of strahl.intersectObjects(scene.children, true)) if (!ignor(h.object)) return h.point.y;
    return 0;
  }
  function tasseBauen(i) {
    const [farbe, druck] = TASSEN_FARBEN[i % TASSEN_FARBEN.length];
    const t = new THREE.Group();
    t.add(setze(zylinder(0.042, 0.038, 0.1, farbe, { umriss: 0.002 }, 14), 0, 0.05, 0));
    t.add(setze(teil(new THREE.TorusGeometry(0.026, 0.008, 6, 12), farbe, { umriss: 0.0015 }), 0.048, 0.055, 0));
    // eingetrockneter Kaffeerest und brauner Rand
    t.add(setze(zylinder(0.036, 0.036, 0.004, 0x3a2414, { umriss: false }, 14), 0, 0.075, 0));
    t.add(setze(teil(new THREE.TorusGeometry(0.037, 0.003, 4, 16), 0x5a3a20, { umriss: false }), 0, 0.085, 0, Math.PI / 2, 0, 0));
    // Aufdruck (Streifen oder Punkt)
    if (i % 2) t.add(setze(zylinder(0.0425, 0.0405, 0.018, druck, { umriss: false }, 14), 0, 0.06, 0));
    else t.add(setze(kugel(0.012, druck, { umriss: false }, 6), 0, 0.055, -0.039));
    // unsichtbare, etwas größere Klickfläche: die Tasse ist klein, sonst geht der Klick leicht daneben
    const huelle = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    huelle.position.y = 0.05;
    huelle.castShadow = false;
    t.add(huelle);
    t.userData.aufgeraeumt = false;
    merke(t, 'tasse', 'Kaffeetasse', null);
    tassen.push(t);
    return t;
  }
  function tasseHinstellen(t, x, z, start) {
    scene.add(t);
    t.visible = true;
    t.position.set(x, oberflaecheBei(x, z, start) + 0.001, z);
    t.rotation.set(0, Math.random() * Math.PI * 2, 0);
    t.userData.ruhe = undefined;
  }
  function freierPlatz(naheBei) {
    const belegt = (x, z) => tassen.some((t) => t.parent === scene && t.visible && !t.userData.aufgeraeumt && Math.hypot(t.position.x - x, t.position.z - z) < 0.12);
    const wackel = () => (Math.random() - 0.5) * 0.04;
    let liste = TASSEN_PLAETZE.filter(([x, z]) => !belegt(x, z)).map(([x, z, y]) => [x + wackel(), z + wackel(), y]);
    if (naheBei) liste.sort((a, b) => Math.hypot(a[0] - naheBei.x, a[1] - naheBei.z) - Math.hypot(b[0] - naheBei.x, b[1] - naheBei.z));
    else liste.sort(() => Math.random() - 0.5);
    if (liste[0]) return liste[0];
    // alles voll: neben eine Tasse auf Werkbank oder Schweißtisch
    const [x, z, y] = TASSEN_PLAETZE[[9, 10, 11][Math.floor(Math.random() * 3)]];
    return [x + (Math.random() - 0.5) * 0.5, z + wackel(), y];
  }
  // auf dem Kühlschrank: 4 x 3 Plätze, dann ist er voll (bis jemand mit Spüldienst alles abholt)
  const kuehlOben = 0.845;
  const KUEHL_PLAETZE = 12;
  const tassenOben = () => tassen.filter((x) => x.userData.aufgeraeumt);
  function tasseAufKuehlschrank(t) {
    const belegt = new Set(tassenOben().map((x) => x.userData.kuehlPlatz));
    let i = 0;
    while (belegt.has(i) && i < KUEHL_PLAETZE) i++;
    if (i >= KUEHL_PLAETZE) return false;
    const lx = -0.16 + (i % 4) * 0.105, lz = -0.13 + Math.floor(i / 4) * 0.13;
    scene.add(t);
    t.visible = true;
    // Kühlschrank ist um 90° gedreht: lokale x/z vertauscht
    t.position.set(-4.66 + lz, kuehlOben, 2.42 - lx);
    t.rotation.set(0, Math.PI / 2 + (Math.random() - 0.5) * 0.4, 0);
    if (t.userData.ruhe) t.scale.copy(t.userData.ruhe.skala);
    t.userData.aufgeraeumt = true;
    t.userData.kuehlPlatz = i;
    return true;
  }
  // Spüldienst holt alles vom Kühlschrank: die Tassen verschwinden (in die Küche)
  function tassenAbholen() {
    const weg = tassenOben();
    for (const t of weg) { scene.remove(t); tassen.splice(tassen.indexOf(t), 1); }
    return weg.length;
  }
  // kleiner Zettel an der Wand über dem Kühlschrank: „Spüldienst diese Woche: …“
  const zettelLeinwand = document.createElement('canvas');
  zettelLeinwand.width = 256; zettelLeinwand.height = 192;
  const zettelTex = new THREE.CanvasTexture(zettelLeinwand);
  zettelTex.colorSpace = THREE.SRGBColorSpace;
  function setzeSpueldienst(name) {
    const g = zettelLeinwand.getContext('2d');
    g.fillStyle = '#f6f1df'; g.fillRect(0, 0, 256, 192);
    g.strokeStyle = 'rgba(80,120,200,0.35)'; g.lineWidth = 2;
    for (let y = 44; y < 192; y += 30) { g.beginPath(); g.moveTo(8, y); g.lineTo(248, y); g.stroke(); }
    g.fillStyle = "#14286a"; g.textAlign = "center";
    g.font = '700 38px Caveat, "Segoe Print", "Bradley Hand", cursive';
    g.fillText('Spüldienst', 128, 60); g.fillText('diese Woche:', 128, 100);
    g.fillStyle = '#b2241c'; g.font = '700 52px Caveat, "Segoe Print", "Bradley Hand", cursive';
    g.fillText(name, 128, 158);
    zettelTex.needsUpdate = true;
  }
  const zettel = new THREE.Group();
  const zettelBlatt = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.225), new THREE.MeshBasicMaterial({ map: zettelTex }));
  zettel.add(zettelBlatt);
  zettel.add(setze(quader(0.08, 0.025, 0.002, 0xe8e2c8, { umriss: false }), 0, 0.11, 0.002, 0, 0, 0.12));
  zettel.add(setze(quader(0.3, 0.225, 0.004, 0x000000, { umriss: false }), 0, 0, -0.004));
  setze(zettel, RAUM.xMin + 0.03, 1.13, 2.56, 0, Math.PI / 2, 0.04);
  scene.add(zettel);
  merke(zettel, 'spuelzettel', 'Zettel: Spüldienst', null);
  objekte.spuelzettel = zettel;
  setzeSpueldienst('Jonas');
  if (document.fonts) document.fonts.ready.then(() => setzeSpueldienst(zettel.userData.name || 'Jonas'));
  let tassenGestellt = false;
  function tassenVerteilen(anzahl = 7) {
    if (tassenGestellt) return;
    tassenGestellt = true;
    scene.updateMatrixWorld(true);
    for (let i = 0; i < anzahl; i++) { const [x, z, y] = freierPlatz(); tasseHinstellen(tasseBauen(i), x, z, y); }
  }

  return {
    bitsatzOrdnen() { bitsWild.visible = false; bitsOrdentlich.visible = true; },
    akkuAufWerkbank() { scene.add(akku); akku.position.set(1.08, 0.905, -2.72); akku.rotation.set(0, -0.6, 0); akku.scale.setScalar(1); akku.visible = true; },
    akkuRepariert() { akkuDreck.visible = false; },
    tassen,
    tassenVerteilen,
    tasseAufKuehlschrank,
    tassenAbholen,
    kuehlschrankVoll: () => tassenOben().length >= KUEHL_PLAETZE,
    tassenOben: () => tassenOben().length,
    setzeSpueldienst(name) { zettel.userData.name = name; setzeSpueldienst(name); },
    neueTasse(bei) {
      if (tassen.filter((t) => !t.userData.aufgeraeumt).length >= 12) return null;
      const t = tasseBauen(tassen.length);
      const [x, z, y] = freierPlatz(bei);
      tasseHinstellen(t, x, z, y);
      return t;
    },
    interaktiv,
    hindernisse,
    objekte,
    zeigeStrom,
    setzeFlasche,
    flaschePlatz,
    klemmeMasse,
    licht,
    kiwisZeigen(n) { kiwis.forEach((k, i) => { k.visible = i < n; }); },
    boxTakt(f) { boxBeat = f; },
    dreckHin,
    dreckWeg() { for (const d of dreck) scene.remove(d); dreck.length = 0; dreckMitte = null; },
    // kleine graue Staubwolke beim Fegen (steigt auf, wird größer und blasser)
    staub(x, z) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xb8b0a2, transparent: true, opacity: 0.35, depthWrite: false }));
      m.position.set(x + (Math.random() - 0.5) * 0.4, 0.06, z + (Math.random() - 0.5) * 0.4);
      scene.add(m);
      let t = 0;
      const f = (dt) => { t += dt; m.position.y += dt * 0.25; m.scale.setScalar(1 + t * 2.2); m.material.opacity = Math.max(0, 0.35 * (1 - t / 0.9)); if (t > 0.9) { scene.remove(m); animiert.splice(animiert.indexOf(f), 1); } };
      animiert.push(f);
    },
    // Fegen mit dem Besen: Dreck im Kehrbereich (Punkt p, Radius r) wird in Richtung (rx, rz) geschoben und wird weniger.
    // Rückgabe: wie viel gerade gekehrt wurde (für Staub und Geräusch)
    kehre(p, rx, rz, r, dt) {
      let menge = 0;
      for (let i = dreck.length - 1; i >= 0; i--) {
        const d = dreck[i];
        const ab = Math.hypot(d.position.x - p.x, d.position.z - p.z);
        if (ab > r) continue;
        d.position.x += rx * dt * 0.35; d.position.z += rz * dt * 0.35;
        const s = d.scale.x - dt * 0.8;
        menge += dt;
        if (s < 0.12) { scene.remove(d); dreck.splice(i, 1); } else d.scale.setScalar(s);
      }
      if (!dreck.length) dreckMitte = null;
      return menge;
    },
    get dreckMitte() { return dreckMitte; },
    besenSichtbar(an) { besen.visible = an; },
    BESEN: { x: -4.35, z: 2.05 },
    get dreck() { return dreck.length; },
    KLO: { x: 1.4, z: 3.55 },
    KLO_DRIN: { x: 1.4, z: 4.75 },
    BAD,
    // Ist (x, z) mit Abstand r frei begehbar? Werkstatt, Bad oder die offene WC-Tür dazwischen
    begehbar(x, z, r) {
      const drin = (q, rr) => x > q.xMin + rr && x < q.xMax - rr && z > q.zMin + rr && z < q.zMax - rr;
      if (drin(RAUM, r) || drin(BAD, r)) return true;
      if (draussen.begehbar(x, z, r)) return true;
      return kloOffen && x > KLO_TUER.xMin + 0.15 && x < KLO_TUER.xMax - 0.15 && z > RAUM.zMax - 0.7 && z < BAD.zMin + 0.7;
    },
    istDraussen: (x, z) => draussen.istDraussen(x, z),
    draussen,
    carport,
    imBad(x, z) { return x > BAD.xMin && x < BAD.xMax && z > BAD.zMin && z < BAD.zMax; },
    kloTuer(offen) { kloOffen = offen; },
    // Steht (x, z) in der WC-Tür oder kurz davor/dahinter? Dann darf die Tür nicht zugehen
    inKloTuer(x, z) { return x > KLO_TUER.xMin - 0.35 && x < KLO_TUER.xMax + 0.35 && z > RAUM.zMax - 0.75 && z < BAD.zMin + 0.75; },
    // Beim Durchgehen durch die WC-Tür: Richtung Türmitte (x), damit man nicht an der Kante hängen bleibt
    // Türmitte für WC-Tür oder Schlupftür im Tor (-0,68 bis -0,02): man rutscht beim Durchgehen zur Mitte statt an der Kante zu hängen
    tuerMitte(x, z) {
      if (x > -1.25 && x < 0.55 && z > RAUM.zMax - 1.0 && z < RAUM.zMax + 1.1) return -0.35;
      return this.kloTuerMitte(x, z);
    },
    kloTuerMitte(x, z) { return kloOffen && x > KLO_TUER.xMin - 0.5 && x < KLO_TUER.xMax + 0.5 && z > RAUM.zMax - 1.0 && z < BAD.zMin + 1.0 ? (KLO_TUER.xMin + KLO_TUER.xMax) / 2 : null; },
    kuehlschrank(auf) { kuehlAuf = auf; },
    leereFlasche,
    flascheWeg(f) {
      scene.remove(f);
      const i = leereFlaschen.indexOf(f);
      if (i >= 0) leereFlaschen.splice(i, 1);
      const j = interaktiv.indexOf(f);
      if (j >= 0) interaktiv.splice(j, 1);
    },
    get leereFlaschen() { return leereFlaschen.length; },
    // Stromwürfel: welcher ist nah an (x, z)? anstossen() lässt ihn pendeln
    stromWuerfelBei(x, z, r) { return stromWuerfel.find((s) => Math.hypot(s.x - x, s.z - z) < r) || null; },
    anstossen(s) { s.schwung = 0.35; s.t = 0; },
    cremeZurueck(obj) {
      scene.add(obj);
      obj.position.copy(obj.userData.start.pos);
      obj.rotation.copy(obj.userData.start.rot);
      if (obj.userData.ruhe) obj.scale.copy(obj.userData.ruhe.skala);
      obj.visible = true;
    },
    get kloOffen() { return kloOffen; },
    kloVerstopft(an) {
      kloWasser.material.color.set(an ? 0x9a8a50 : 0x9cc9e0);
      kloWasser.position.y = an ? 0.415 : 0.38;
      kloPfuetze.visible = an;
      wurst.visible = an;
    },
    FEUER: { x: 1.55, z: -3.3, vorX: 1.55, vorZ: -2.45 },
    LOESCHER: { x: 4.35, z: -1.0 },
    feuer(an) { feuer.visible = an; feuerLicht.intensity = an ? 4 : 0; if (an) rauch.visible = true; },
    get brennt() { return feuer.visible; },
    pulver,
    wasser,
    leck(an) { leckAn = an; },
    get leckt() { return leckAn; },
    LECK: { x: 4.93, z: 1.6, vorX: 4.05, vorZ: 1.6 },
    ROHRZANGE: { x: 1.32, z: -3.3 },
    loescherSichtbar(an) { loescher.visible = an; },
    pumpeDreckig(an) { pumpeDreck.visible = an; },
    get pumpeIstDreckig() { return pumpeDreck.visible; },
    // Ding wieder an seinen festen Platz (Wandhalter) hängen
    zurueckAnDieWand(obj) {
      scene.add(obj);
      obj.position.copy(obj.userData.wand.pos);
      obj.rotation.copy(obj.userData.wand.rot);
      if (obj.userData.ruhe) obj.scale.copy(obj.userData.ruhe.skala);
      obj.visible = true;
    },
    flaschenOrtBei(p, mitBeinen) {
      if (p.x > -1.25 && p.x < 1.25 && p.z > -3.4 && p.z < -2.4 && p.y > 0.8) return 'werkbank';
      if (p.x > 2.25 && p.x < 3.95 && p.z > -3.5 && p.z < -2.4 && p.y > 0.75) return mitBeinen ? 'schweiss' : 'schweiss';
      if (mitBeinen && p.x > 2.3 && p.x < 4.0 && p.z > -2.5 && p.z < -1.4) return 'schweiss';
      if (p.x > 3.2 && p.z > 0.6 && p.z < 2.9) return 'wasch';
      // überall auf den Boden: draußen (Gelände) oder drinnen in Werkstatt/Bad
      if (!mitBeinen && draussen.istDraussen(p.x, p.z) && p.y - gelaendeHoehe(p.x, p.z) < 0.4) return 'draussen';
      if (!mitBeinen && p.y < 0.3 && (this.begehbar(p.x, p.z, 0.2))) return 'boden';
      return null;
    },
    // Freier Boden für die Hüfte (liegend ca. 2,3 m lang, Kopf Richtung Werkstattmitte)
    HUEFTE_PLATZ: { x: -1.6, z: 1.1, dreh: -Math.PI / 2 },
    HULA_PLATZ: { x: -2.9, z: -3.2 },
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

// Lederhandschuh (Stulpe unten bei y = 0, Finger oben), flach wie ein echter Handschuh
export function baueHandschuh(seite) {
  const h = new THREE.Group();
  const leder = 0xa8743d;
  const flach = 0.32;
  // Stulpe: kurz, flach, leicht ausgestellt
  const stulpe = teil(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 12), 0xc38f52, { umriss: 0.002 });
  stulpe.scale.z = flach;
  stulpe.position.y = 0.05;
  h.add(stulpe);
  const handteil = teil(new THREE.BoxGeometry(0.075, 0.09, 0.03), leder, { umriss: 0.002 });
  handteil.position.y = 0.145;
  h.add(handteil);
  for (let f = 0; f < 4; f++) {
    const finger = teil(new THREE.CapsuleGeometry(0.008, 0.045 - Math.abs(f - 1.5) * 0.008, 3, 6), leder, { umriss: 0.0015 });
    finger.scale.z = 0.8;
    finger.position.set(-0.027 + f * 0.018, 0.215 - Math.abs(f - 1.5) * 0.006, 0);
    h.add(finger);
  }
  const daumen = teil(new THREE.CapsuleGeometry(0.009, 0.035, 3, 6), leder, { umriss: 0.0015 });
  daumen.scale.z = 0.8;
  daumen.position.set(0.048 * seite, 0.13, 0);
  daumen.rotation.z = -0.7 * seite;
  h.add(daumen);
  return h;
}

// Hula-Hoop-Reifen: senkrecht (für die Wand), Kreis in der x-y-Ebene
export function baueReifen() {
  const g = new THREE.Group();
  const r = 0.45;
  g.add(teil(new THREE.TorusGeometry(r, 0.016, 8, 48), 0xe84a9a, { umriss: 0.004 }));
  // ein paar weiße Klebestreifen
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const st = teil(new THREE.TorusGeometry(r, 0.0175, 8, 6, 0.12), 0xffffff, { umriss: false });
    st.rotation.z = a;
    g.add(st);
  }
  return g;
}

export const NOTIZEN = [
  { t: 'Lydia anrufen', durch: true, haken: true },
  { t: 'Hüfte hinten links!!', rot: true, fett: true },
  { t: 'Heringe essen', durch: true },
  { t: 'Orthopäde Di 8:15' },
  { t: 'Zahnarzt Mi 14:30', durch: true },
  { t: 'Hautarzt Fr 9:00' },
  { t: 'TK-Pizza einkaufen' },
  { t: 'Sexy abmelden' },
  { t: ['neue Motorhaube für Benz', 'organisieren'] },
  { t: 'Konzerttickets verkaufen' },
  { t: 'Urlaub einreichen' },
  { t: '40-Grad-Wäsche!!', fett: true },
]
