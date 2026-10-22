// Draußen vor der Werkstatt: rotes Backsteingebäude mit flachem Satteldach (schwarzes Wellblech), kaputte Betonfläche,
// Wiese mit Bäumen, Horizont, Mülltonnen, roter Weidemann-Hoflader mit Palettengabel, rosa Mini-Jeep, Feuerschale mit
// Dreibein, Grillrost und alter Bratwurst, Schild „Nicht stören – Schweißkurs!“.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur, zufall } from './toon.js';

// Begehbare Flächen draußen (Rechtecke). Das Bad-Häuschen vorne rechts ist ausgespart.
const VORPLATZ = { xMin: -17, xMax: 9.5, zMin: 4.25, zMax: 12.5 };
const SEITE = { xMin: 5.35, xMax: 9.5, zMin: -3.5, zMax: 4.6 };
const BAD_HAUS = { xMin: 0.55, xMax: 4.05, zMin: 3.9, zMax: 6.95 };
// Durchgang durchs offene Tor
// Feldweg nach rechts weg vom Hof (nur für Fahrzeuge)
const AUSFAHRT = { xMin: 9.0, xMax: 32, zMin: 9.5, zMax: 11.8 };
const DURCHGANG = { xMin: -0.68, xMax: -0.02, zMin: 3.4, zMax: 4.7 }; // Schlupftür im Tor

export function baueDraussen(scene, { merke, hindernis, RAUM }) {
  const r = zufall(303);

  // ---------- Himmel und Horizont ----------
  const himmelTex = leinwandTextur(64, 512, (g, b, h) => {
    const v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, '#4f8fd0'); v.addColorStop(0.42, '#8ec1ea'); v.addColorStop(0.5, '#dbeef8'); v.addColorStop(1, '#dbeef8');
    g.fillStyle = v; g.fillRect(0, 0, b, h);
  });
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), new THREE.MeshBasicMaterial({ map: himmelTex, side: THREE.BackSide, fog: false }));
  himmel.raycast = () => {};
  scene.add(himmel);
  // Wolken (flache Kleckse) am Himmel
  const wolkeTex = leinwandTextur(256, 128, (g) => {
    g.fillStyle = 'rgba(255,255,255,0.95)';
    for (const [x, y, rr] of [[70, 80, 40], [120, 64, 50], [175, 78, 38], [100, 90, 34], [150, 92, 36]]) { g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); }
  });
  for (let i = 0; i < 9; i++) {
    const w = i / 9 * Math.PI * 2 + r() * 0.4;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: wolkeTex, transparent: true, depthWrite: false, fog: false }));
    s.position.set(Math.sin(w) * 80, 24 + r() * 14, Math.cos(w) * 80);
    s.scale.set(26 + r() * 16, 13 + r() * 6, 1);
    s.raycast = () => {};
    scene.add(s);
  }
  // Horizont: Hügel und Waldrand rundherum
  const horizontTex = leinwandTextur(2048, 128, (g, b, h) => {
    g.clearRect(0, 0, b, h);
    g.fillStyle = '#8fb3a6';
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= b; x += 16) g.lineTo(x, 70 - Math.sin(x / 160) * 18 - Math.sin(x / 47) * 6);
    g.lineTo(b, h); g.fill();
    g.fillStyle = '#4f7a52';
    g.beginPath(); g.moveTo(0, h);
    for (let x = 0; x <= b; x += 6) g.lineTo(x, 96 - Math.abs(Math.sin(x / 9)) * 10 - Math.sin(x / 90) * 8 - (r() * 6));
    g.lineTo(b, h); g.fill();
  });
  const horizont = new THREE.Mesh(new THREE.CylinderGeometry(85, 85, 16, 64, 1, true), new THREE.MeshBasicMaterial({ map: horizontTex, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  horizont.position.y = 4;
  horizont.raycast = () => {};
  scene.add(horizont);

  // ---------- Wiese ----------
  const grasTex = leinwandTextur(256, 256, (g, b, h) => {
    g.fillStyle = '#6f9a45'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 2200; i++) {
      const t = r();
      g.strokeStyle = t < 0.5 ? 'rgba(60,110,40,0.7)' : t < 0.85 ? 'rgba(130,170,80,0.6)' : 'rgba(180,170,90,0.5)';
      g.lineWidth = 1;
      const x = r() * b, y = r() * h;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 3 - r() * 4); g.stroke();
    }
    for (let i = 0; i < 30; i++) { g.fillStyle = r() < 0.5 ? '#f4f0d0' : '#f2d23c'; g.beginPath(); g.arc(r() * b, r() * h, 1.5, 0, Math.PI * 2); g.fill(); }
  }, [60, 60]);
  const wiese = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), toon(0xffffff, { map: grasTex }));
  wiese.rotation.x = -Math.PI / 2;
  wiese.position.y = -0.01;
  wiese.receiveShadow = true;
  scene.add(wiese);

  // ---------- Betonfläche vor der Werkstatt (rissig, Stücke rausgebrochen, Unkraut in den Fugen) ----------
  const BETON = { x0: -7.5, x1: 7.5, z0: 4.0, z1: 10.5 };
  const betonTex = leinwandTextur(1024, 448, (g, b, h) => {
    g.fillStyle = '#a3a19a'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 2500; i++) { const v = 120 + r() * 70; g.fillStyle = `rgba(${v},${v},${v - 6},0.25)`; g.fillRect(r() * b, r() * h, 2 + r() * 3, 2 + r() * 3); }
    // Ölflecken, Wasserränder
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(50,45,40,0.15)'; g.beginPath(); g.ellipse(r() * b, r() * h, 20 + r() * 40, 12 + r() * 25, r() * 3, 0, Math.PI * 2); g.fill(); }
    // Platten-Fugen
    g.strokeStyle = 'rgba(60,58,55,0.8)'; g.lineWidth = 3;
    for (let x = 0; x < b; x += 205) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y < h; y += 150) { g.beginPath(); g.moveTo(0, y); g.lineTo(b, y); g.stroke(); }
    // ausgebrochene Stellen mit Schotter
    for (let i = 0; i < 9; i++) {
      const cx = r() * b, cy = r() * h, rx = 18 + r() * 34, ry = 12 + r() * 22;
      const pts = []; for (let k = 0; k < 9; k++) { const w = k / 9 * Math.PI * 2; const f = 0.6 + r() * 0.5; pts.push([cx + Math.cos(w) * rx * f, cy + Math.sin(w) * ry * f]); }
      g.beginPath(); pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = '#6e6a62'; g.fill(); g.strokeStyle = 'rgba(40,38,35,0.9)'; g.lineWidth = 2; g.stroke();
      g.save(); g.clip();
      for (let k = 0; k < 60; k++) { const v = 90 + r() * 90; g.fillStyle = `rgb(${v},${v - 5},${v - 12})`; g.beginPath(); g.arc(cx + (r() - 0.5) * rx * 2, cy + (r() - 0.5) * ry * 2, 1.5 + r() * 2.5, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    // Risse mit Unkraut
    for (let i = 0; i < 16; i++) {
      let x = r() * b, y = r() * h;
      g.strokeStyle = 'rgba(35,33,30,0.85)'; g.lineWidth = 1.5 + r() * 1.5;
      g.beginPath(); g.moveTo(x, y);
      const pts = [];
      for (let k = 0; k < 10; k++) { x += (r() - 0.5) * 40; y += (r() - 0.3) * 30; g.lineTo(x, y); pts.push([x, y]); }
      g.stroke();
      for (const [px, py] of pts) if (r() < 0.25) { g.strokeStyle = '#5f8f3a'; g.lineWidth = 1.5; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 10, py - 4 - r() * 8); g.stroke(); } }
    }
  });
  const beton = new THREE.Mesh(new THREE.PlaneGeometry(BETON.x1 - BETON.x0, BETON.z1 - BETON.z0), toon(0xffffff, { map: betonTex }));
  beton.rotation.x = -Math.PI / 2;
  beton.position.set((BETON.x0 + BETON.x1) / 2, 0.004, (BETON.z0 + BETON.z1) / 2);
  beton.receiveShadow = true;
  scene.add(beton);
  // ein paar lose Betonbrocken
  for (let i = 0; i < 8; i++) {
    const s = quader(0.08 + r() * 0.12, 0.04 + r() * 0.04, 0.06 + r() * 0.1, 0x8f8d86, { umriss: 0.002 });
    s.position.set(BETON.x0 + 1 + r() * 13, 0.03, 5 + r() * 5);
    s.rotation.set(r() * 0.4, r() * 3, r() * 0.4);
    scene.add(s);
  }

  // ---------- Backstein-Fassade ----------
  const backstein = leinwandTextur(512, 512, (g, b, h) => {
    g.fillStyle = '#8e8a82'; g.fillRect(0, 0, b, h); // Fugen
    const zh = 18, zb = 60; // Steinhöhe/-breite in Pixeln (512 px = 2 m)
    for (let y = 0; y < h; y += zh) {
      const versatz = (Math.floor(y / zh) % 2) * zb / 2;
      for (let x = -versatz; x < b; x += zb) {
        const t = r();
        const R = 150 + t * 50, G = 60 + t * 20 + r() * 10, B = 45 + t * 15;
        g.fillStyle = `rgb(${R},${G},${B})`;
        g.fillRect(x + 2, y + 2, zb - 4, zh - 4);
        if (r() < 0.2) { g.fillStyle = 'rgba(40,20,15,0.25)'; g.fillRect(x + 2, y + 2, zb - 4, zh - 4); }
        if (r() < 0.12) { g.fillStyle = 'rgba(255,220,200,0.12)'; g.fillRect(x + 4, y + 4, zb * 0.4, 4); }
      }
    }
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(30,25,20,0.08)'; g.beginPath(); g.ellipse(r() * b, r() * h, 40, 80, 0, 0, Math.PI * 2); g.fill(); }
  });
  backstein.wrapS = backstein.wrapT = THREE.RepeatWrapping;
  backstein.repeat.set(0.5, 0.5);
  const steinMat = toon(0xffffff, { map: backstein });
  const steinMatSeite = toon(0xffffff, { map: backstein, side: THREE.DoubleSide });
  const T0 = -0.85 - 1.3, T1 = -0.85 + 1.3, TH = 3.0; // Toröffnung
  const TRAUFE = RAUM.hoehe + 0.02, FIRST = RAUM.hoehe + 0.85;
  function giebelWand(mitTor) {
    const s = new THREE.Shape();
    const x0 = RAUM.xMin - 0.08, x1 = RAUM.xMax + 0.08;
    s.moveTo(x0, 0);
    if (mitTor) { s.lineTo(T0, 0); s.lineTo(T0, TH); s.lineTo(T1, TH); s.lineTo(T1, 0); }
    s.lineTo(x1, 0); s.lineTo(x1, TRAUFE); s.lineTo(0, FIRST); s.lineTo(x0, TRAUFE); s.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), steinMat);
    m.receiveShadow = true;
    return m;
  }
  const vorne = giebelWand(true);
  vorne.position.z = RAUM.zMax + 0.08;
  scene.add(vorne);
  const hinten = giebelWand(false);
  hinten.rotation.y = Math.PI;
  hinten.position.z = RAUM.zMin - 0.08;
  scene.add(hinten);
  for (const seite of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(RAUM.zMax - RAUM.zMin + 0.16, TRAUFE), steinMat);
    w.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? TRAUFE : RAUM.zMax - RAUM.zMin + 0.16); });
    w.position.set(seite * (RAUM.xMax + 0.08), TRAUFE / 2, 0);
    w.rotation.y = seite * Math.PI / 2;
    scene.add(w);
  }
  // Laibung im Tor (Mauerdicke) und Sturz
  const laibung = (b, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(b, h), steinMatSeite); m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); };
  laibung(0.1, TH, T0, TH / 2, RAUM.zMax + 0.03, Math.PI / 2);
  laibung(0.1, TH, T1, TH / 2, RAUM.zMax + 0.03, -Math.PI / 2);
  const sturz = new THREE.Mesh(new THREE.PlaneGeometry(T1 - T0, 0.1), steinMatSeite);
  sturz.rotation.x = Math.PI / 2; sturz.position.set(-0.85, TH, RAUM.zMax + 0.03);
  scene.add(sturz);
  // Fenster außen an der linken Wand (wie innen)
  const fensterAussen = new THREE.Group();
  fensterAussen.add(setze(quader(1.7, 1.1, 0.05, 0xf0f0ea, { umriss: 0.003 }), 0, 0, 0));
  const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.96), new THREE.MeshBasicMaterial({ color: 0x9cc7e6 }));
  glas.position.z = 0.03;
  fensterAussen.add(glas);
  fensterAussen.add(setze(quader(0.05, 1.0, 0.04, 0xf0f0ea, { umriss: false }), 0, 0, 0.04));
  fensterAussen.add(setze(quader(1.8, 0.08, 0.14, 0x8e8a82, { umriss: 0.002 }), 0, -0.6, 0.06));
  setze(fensterAussen, RAUM.xMin - 0.1, 1.95, 1.6, 0, -Math.PI / 2, 0);
  scene.add(fensterAussen);

  // Bad-Häuschen (Anbau vorne rechts), flaches schwarzes Dach
  const BADH = 2.75;
  const badWand = (b, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(b, BADH), steinMat);
    m.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? BADH : b); });
    m.position.set(x, BADH / 2, z); m.rotation.y = ry; scene.add(m);
  };
  badWand(BAD_HAUS.zMax - 4.0, BAD_HAUS.xMin + 0.07, (4.0 + BAD_HAUS.zMax) / 2, -Math.PI / 2);
  badWand(BAD_HAUS.zMax - 4.0, BAD_HAUS.xMax - 0.07, (4.0 + BAD_HAUS.zMax) / 2, Math.PI / 2);
  badWand(BAD_HAUS.xMax - BAD_HAUS.xMin - 0.14, (BAD_HAUS.xMin + BAD_HAUS.xMax) / 2, BAD_HAUS.zMax - 0.05, 0);
  scene.add(setze(quader(BAD_HAUS.xMax - BAD_HAUS.xMin + 0.2, 0.12, BAD_HAUS.zMax - 4.0 + 0.2, 0x26282c, { umriss: 0.004 }), (BAD_HAUS.xMin + BAD_HAUS.xMax) / 2, BADH + 0.06, (4.0 + BAD_HAUS.zMax) / 2));
  // kleines Milchglasfenster am Anbau
  scene.add(setze(quader(0.6, 0.45, 0.05, 0xf0f0ea, { umriss: 0.002 }), BAD_HAUS.xMax - 1.1, 1.85, BAD_HAUS.zMax - 0.03));
  const milch = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.36), new THREE.MeshBasicMaterial({ color: 0xdfe8ee }));
  milch.position.set(BAD_HAUS.xMax - 1.1, 1.85, BAD_HAUS.zMax + 0.0);
  scene.add(milch);

  // ---------- Dach: flaches Satteldach aus schwarzem Wellblech ----------
  const wellTex = leinwandTextur(128, 32, (g, b, h) => {
    g.fillStyle = '#2a2c30'; g.fillRect(0, 0, b, h);
    for (let x = 0; x < b; x += 16) {
      const v = g.createLinearGradient(x, 0, x + 16, 0);
      v.addColorStop(0, '#1b1c1f'); v.addColorStop(0.5, '#45484e'); v.addColorStop(1, '#1b1c1f');
      g.fillStyle = v; g.fillRect(x, 0, 16, h);
    }
    for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(120,70,40,0.25)'; g.fillRect(r() * b, r() * h, 3 + r() * 6, 2); }
  }, [1, 1]);
  const dachLang = RAUM.zMax - RAUM.zMin + 0.7;
  const halb = RAUM.xMax + 0.45;
  const neigung = Math.atan2(FIRST - TRAUFE + 0.06, halb);
  const breite = Math.hypot(halb, FIRST - TRAUFE + 0.06);
  for (const seite of [-1, 1]) {
    const t = wellTex.clone();
    t.needsUpdate = true;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(dachLang * 4, 1);
    t.rotation = Math.PI / 2;
    const platte = teil(new THREE.BoxGeometry(breite, 0.05, dachLang), 0, { material: toon(0xffffff, { map: t }), umriss: 0.004 });
    platte.position.set(seite * halb / 2, (TRAUFE - 0.06 + FIRST + 0.02) / 2 + 0.02, 0);
    platte.rotation.z = -seite * neigung;
    scene.add(platte);
  }
  // Firstblech und Ortgangbretter
  scene.add(setze(quader(0.3, 0.06, dachLang, 0x1d1d1f, { umriss: 0.003 }), 0, FIRST + 0.06, 0));
  for (const z of [RAUM.zMax + 0.36, RAUM.zMin - 0.36]) for (const seite of [-1, 1]) {
    const brett = quader(breite, 0.14, 0.04, 0x1d1d1f, { umriss: 0.003 });
    brett.position.set(seite * halb / 2, (TRAUFE + FIRST) / 2 + 0.0, z);
    brett.rotation.z = -seite * neigung;
    scene.add(brett);
  }
  // Regenrinnen mit Fallrohr
  for (const seite of [-1, 1]) {
    scene.add(setze(zylinder(0.06, 0.06, dachLang, 0x5a5d62, { umriss: 0.002 }, 10), seite * (halb + 0.02), TRAUFE - 0.12, 0, Math.PI / 2, 0, 0));
    scene.add(setze(zylinder(0.045, 0.045, TRAUFE, 0x5a5d62, { umriss: 0.002 }, 10), seite * (RAUM.xMax + 0.2), TRAUFE / 2 - 0.1, RAUM.zMax + 0.2));
  }

  // ---------- Mülltonnen (grau, blau, braun): 240-Liter-Tonnen mit Deckel, Scharnierleiste, Griff, Rädern, Rippen ----------
  const tonnen = new THREE.Group();
  const schmutzTex = leinwandTextur(64, 128, (g, b, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(60,50,40,${0.05 + r() * 0.1})`; const x = r() * b; g.fillRect(x, h * (0.4 + r() * 0.6), 2 + r() * 3, h); }
    for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(r() * b, r() * h, 3, 1); }
  });
  for (const [i, farbe, deckelFarbe] of [[0, 0x4a4d52, 0x33363a], [1, 0x2f5fa8, 0x244c88], [2, 0x6b4a2a, 0x523820]]) {
    const t = new THREE.Group();
    const mat = toon(farbe, { map: schmutzTex });
    // Korpus: unten schmaler, oben breiter (Pyramidenstumpf)
    const korpus = teil(new THREE.CylinderGeometry(0.4, 0.33, 0.92, 4, 1), 0, { material: mat, umriss: 0.004 });
    korpus.rotation.y = Math.PI / 4;
    korpus.scale.set(1, 1, 1.22);
    korpus.position.y = 0.52;
    t.add(korpus);
    // umlaufender Rand oben, Kammaufnahme vorne, senkrechte Verstärkungsrippen
    t.add(setze(quader(0.6, 0.06, 0.72, farbe, { umriss: 0.003 }), 0, 0.97, 0));
    t.add(setze(quader(0.46, 0.08, 0.05, deckelFarbe, { umriss: 0.002 }), 0, 0.88, 0.36));
    for (const x of [-0.16, 0, 0.16]) t.add(setze(quader(0.04, 0.6, 0.02, deckelFarbe, { umriss: false }), x, 0.5, 0.315 + 0.05 * (0.5 - 0.2)));
    for (const sx of [-1, 1]) t.add(setze(quader(0.02, 0.7, 0.05, deckelFarbe, { umriss: false }), sx * 0.27, 0.55, 0.0));
    // Deckel mit Griffkante vorne und Scharnieren hinten
    const deckel = new THREE.Group();
    deckel.add(setze(quader(0.62, 0.05, 0.74, deckelFarbe, { umriss: 0.003 }), 0, 0.025, 0.37));
    deckel.add(setze(quader(0.56, 0.02, 0.6, deckelFarbe, { umriss: false }), 0, 0.06, 0.37));
    deckel.add(setze(quader(0.4, 0.05, 0.04, deckelFarbe, { umriss: 0.002 }), 0, 0.0, 0.75));
    deckel.position.set(0, 1.0, -0.37);
    if (i === 1) deckel.rotation.x = -0.18; // blaue Tonne: Deckel geht nicht zu, Kartons quellen raus
    t.add(deckel);
    for (const sx of [-0.2, 0.2]) t.add(setze(quader(0.08, 0.06, 0.06, deckelFarbe, { umriss: 0.002 }), sx, 0.99, -0.38));
    // Schiebegriff hinten und Achse mit Rädern
    t.add(setze(zylinder(0.022, 0.022, 0.56, 0x1d1d1f, { umriss: 0.002 }, 8), 0, 0.92, -0.43, 0, 0, Math.PI / 2));
    for (const sx of [-0.25, 0.25]) t.add(setze(quader(0.04, 0.12, 0.08, deckelFarbe, { umriss: false }), sx, 0.88, -0.4));
    t.add(setze(zylinder(0.015, 0.015, 0.62, 0x8a8f96, { umriss: false }, 6), 0, 0.11, -0.3, 0, 0, Math.PI / 2));
    for (const sx of [-1, 1]) {
      t.add(setze(zylinder(0.11, 0.11, 0.06, 0x1d1d1f, { umriss: 0.003 }, 16), sx * 0.3, 0.11, -0.3, 0, 0, Math.PI / 2));
      t.add(setze(zylinder(0.05, 0.05, 0.065, 0x6e7177, { umriss: false }, 10), sx * 0.3, 0.11, -0.3, 0, 0, Math.PI / 2));
    }
    // Fuß vorne
    t.add(setze(quader(0.4, 0.06, 0.08, deckelFarbe, { umriss: 0.002 }), 0, 0.03, 0.26));
    t.position.set(i * 0.72, 0, 0);
    t.rotation.y = (r() - 0.5) * 0.2;
    tonnen.add(t);
  }
  // Kartons quellen aus der blauen Tonne, Müllbeutel neben der grauen
  tonnen.add(setze(quader(0.24, 0.16, 0.22, 0xb08a5a, { umriss: 0.002 }), 0.72, 1.14, 0.2, 0.35, 0.4, 0.1));
  tonnen.add(setze(quader(0.2, 0.02, 0.3, 0xc49a68, { umriss: 0.002 }), 0.62, 1.12, 0.3, 0.6, 0.1, 0.4));
  const sack = kugel(0.22, 0x1d1d1f, { umriss: 0.003 }, 12);
  sack.scale.set(1, 0.85, 0.9);
  sack.position.set(-0.45, 0.19, 0.15);
  tonnen.add(sack);
  tonnen.add(setze(zylinder(0.02, 0.05, 0.1, 0x1d1d1f, { umriss: 0.002 }, 8), -0.45, 0.42, 0.15));
  setze(tonnen, -4.6, 0, RAUM.zMax + 0.6, 0, 0, 0);
  scene.add(tonnen);
  merke(tonnen, 'muelltonnen', 'Mülltonnen', null);
  hindernis(-5.3, -2.85, RAUM.zMax, RAUM.zMax + 1.1);

  // ---------- roter Hoflader (nach Fotos vom Weidemann 1280, ohne Schriftzug): Knicklenker, Kabine auf dem Hinterwagen,
  // mittiger Hubarm vor der Kabine mit grauen Hub- und Kippzylindern, Schnellwechsler mit Palettengabel ----------
  // Ursprung = Knickgelenk (z = 0); Hinterwagen z < 0 (Motorhaube, Kabine), Vorderwagen z > 0 (dreht im Gelenk)
  const ROT = 0xd0261c, GRAU = 0x6c7075, GRAU_D = 0x45484d, SCHW = 0x1d1d1f;
  const lader = new THREE.Group();
  const vorderwagen = new THREE.Group();
  lader.add(vorderwagen);
  // Stück zwischen zwei Punkten (Balken entlang z, Zylinder entlang y), für Arm und Hydraulik
  const _a = new THREE.Vector3(), _b = new THREE.Vector3();
  function strecke(obj, a, b, achse) {
    _a.copy(a); _b.copy(b);
    const d = _b.clone().sub(_a);
    obj.position.copy(_a).addScaledVector(d, 0.5);
    obj.quaternion.setFromUnitVectors(achse, d.clone().normalize());
    obj.scale.set(1, 1, 1);
    if (achse.y) obj.scale.y = d.length(); else obj.scale.z = d.length();
    return obj;
  }
  const Y = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1);
  const balken = (b, h, farbe) => quader(b, h, 1, farbe, { umriss: 0.004 });
  // Räder: grobe Stollenreifen, graue Felgen mit Nabe und Radmuttern
  const stollenTex = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#1b1b1d'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#34343a';
    for (let x = 0; x < b; x += 26) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 14, 0); g.lineTo(x + 26, h / 2); g.lineTo(x + 14, h); g.lineTo(x, h); g.lineTo(x + 12, h / 2); g.closePath(); g.fill(); }
  }, [2, 1]);
  const reifenMat = toon(0xffffff, { map: stollenTex });
  const laderRaeder = [];
  const RR = 0.42, SPUR = 0.52;
  function rad(eltern, z) {
    for (const sx of [-1, 1]) {
      const r = new THREE.Group();
      r.add(teil(new THREE.CylinderGeometry(RR, RR, 0.3, 24), 0, { material: reifenMat, umriss: 0.004 }));
      r.add(setze(zylinder(RR - 0.03, RR - 0.03, 0.305, SCHW, { umriss: false }, 24), 0, 0, 0));
      r.add(setze(zylinder(0.25, 0.25, 0.31, 0xc9ccd0, { umriss: 0.002 }, 18), 0, 0, 0));
      r.add(setze(zylinder(0.11, 0.11, 0.32, 0x8a8d92, { umriss: false }, 12), 0, 0, 0));
      for (let k = 0; k < 6; k++) { const w = k / 6 * Math.PI * 2; r.add(setze(zylinder(0.013, 0.013, 0.325, 0xe0e2e5, { umriss: false }, 6), Math.cos(w) * 0.15, 0, Math.sin(w) * 0.15)); }
      r.rotation.z = Math.PI / 2;
      r.position.set(sx * SPUR, RR, z);
      eltern.add(r);
      laderRaeder.push(r);
      // schwarzer Kotflügel als gebogene Schale über dem Rad
      const kot = teil(new THREE.CylinderGeometry(RR + 0.07, RR + 0.07, 0.34, 20, 1, true, Math.PI * 0.08, Math.PI * 0.84), SCHW, { umriss: 0.003, mat: { side: THREE.DoubleSide } });
      kot.rotation.z = Math.PI / 2;
      kot.position.set(sx * SPUR, RR, z);
      eltern.add(kot);
    }
    eltern.add(setze(quader(1.0, 0.14, 0.16, GRAU_D, { umriss: 0.003 }), 0, RR, z));
  }
  // --- Hinterwagen: Rahmen, Achse, Motorhaube hinten (rund, schwarze Lüftungsfenster), Heck mit Leuchten ---
  lader.add(setze(quader(0.72, 0.34, 1.35, ROT, { umriss: 0.005 }), 0, 0.56, -0.78));
  rad(lader, -0.75);
  lader.add(setze(quader(1.0, 0.62, 0.58, ROT, { umriss: 0.005 }), 0, 0.98, -1.26));
  const hutze = teil(new THREE.CylinderGeometry(0.29, 0.29, 1.0, 16, 1, false, 0, Math.PI), ROT, { umriss: 0.004 });
  hutze.rotation.z = Math.PI / 2; hutze.rotation.y = Math.PI / 2;
  hutze.scale.set(1, 1, 0.45);
  hutze.position.set(0, 1.29, -1.26);
  lader.add(hutze);
  for (const sx of [-1, 1]) {
    lader.add(setze(quader(0.02, 0.36, 0.28, SCHW, { umriss: 0.002 }), sx * 0.505, 1.03, -1.22));
    for (let k = 0; k < 5; k++) lader.add(setze(quader(0.024, 0.012, 0.26, 0x34363a, { umriss: false }), sx * 0.505, 0.9 + k * 0.065, -1.22));
  }
  lader.add(setze(quader(1.02, 0.3, 0.14, ROT, { umriss: 0.004 }), 0, 0.55, -1.6));
  for (const sx of [-1, 1]) {
    lader.add(setze(quader(0.12, 0.08, 0.02, 0xc8352a, { umriss: 0.001 }), sx * 0.36, 0.6, -1.675));
    lader.add(setze(quader(0.06, 0.08, 0.02, 0xf2a21c, { umriss: false }), sx * 0.26, 0.6, -1.675));
  }
  lader.add(setze(quader(0.3, 0.1, 0.02, SCHW, { umriss: false }), 0, 0.58, -1.675));
  lader.add(setze(zylinder(0.03, 0.03, 0.06, SCHW, { umriss: false }, 8), 0.3, 0.44, -1.67, Math.PI / 2, 0, 0));
  // Knickgelenk
  lader.add(setze(zylinder(0.1, 0.1, 0.36, 0x5a5d62, { umriss: 0.003 }, 12), 0, 0.56, 0.0));
  // --- Kabine (grauer Rahmen, rundum Glas, dunkles Dach mit Arbeitsscheinwerfern), Sitz, Lenkrad, Joystick ---
  const kabine = new THREE.Group();
  const K0 = -0.98, K1 = -0.06, KB = 0.98, KU = 0.78, KO = 2.25;
  const kabinenGlas = new THREE.MeshToonMaterial({ color: 0xa8cde6, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  kabine.add(setze(quader(KB, 0.06, K1 - K0, GRAU_D, { umriss: 0.003 }), 0, KU, (K0 + K1) / 2));
  // untere graue Seitenteile und Front
  for (const sx of [-1, 1]) kabine.add(setze(quader(0.04, 0.42, K1 - K0, GRAU, { umriss: 0.003 }), sx * (KB / 2), KU + 0.21, (K0 + K1) / 2));
  kabine.add(setze(quader(KB, 0.24, 0.04, GRAU, { umriss: 0.003 }), 0, KU + 0.12, K1));
  // Säulen, Dachrahmen, Türrahmen links
  for (const sx of [-1, 1]) for (const z of [K0, K1]) kabine.add(setze(quader(0.06, KO - KU, 0.06, GRAU_D, { umriss: 0.003 }), sx * (KB / 2), (KU + KO) / 2, z));
  kabine.add(setze(quader(0.05, KO - KU - 0.45, 0.04, GRAU_D, { umriss: 0.002 }), KB / 2 + 0.01, (KU + 0.45 + KO) / 2, (K0 + K1) / 2 + 0.05));
  kabine.add(setze(quader(0.03, 0.12, 0.03, 0x8a8f96, { umriss: false }), KB / 2 + 0.03, 1.4, -0.3));
  // Scheiben
  const scheiben = [
    [new THREE.PlaneGeometry(K1 - K0 - 0.06, KO - KU - 0.45), [KB / 2 + 0.005, (KU + 0.43 + KO) / 2, (K0 + K1) / 2], [0, Math.PI / 2, 0]],
    [new THREE.PlaneGeometry(K1 - K0 - 0.06, KO - KU - 0.45), [-KB / 2 - 0.005, (KU + 0.43 + KO) / 2, (K0 + K1) / 2], [0, Math.PI / 2, 0]],
    [new THREE.PlaneGeometry(KB - 0.06, KO - KU - 0.26), [0, (KU + 0.24 + KO) / 2, K1 + 0.005], [0, 0, 0]],
    [new THREE.PlaneGeometry(KB - 0.06, 0.8), [0, KO - 0.45, K0 - 0.005], [0, 0, 0]],
  ];
  for (const [geo, pos, rot] of scheiben) { const m = new THREE.Mesh(geo, kabinenGlas); m.position.set(...pos); m.rotation.set(...rot); m.renderOrder = 2; kabine.add(m); }
  kabine.add(setze(quader(KB + 0.08, 0.08, K1 - K0 + 0.1, 0x2f3236, { umriss: 0.004 }), 0, KO + 0.04, (K0 + K1) / 2));
  for (const sx of [-1, 1]) {
    // Arbeitsscheinwerfer vorne und hinten auf dem Dach, Außenspiegel an Bügeln
    for (const z of [K1 + 0.02, K0 - 0.02]) {
      kabine.add(setze(quader(0.12, 0.1, 0.08, SCHW, { umriss: 0.002 }), sx * 0.36, KO + 0.12, z));
      kabine.add(setze(quader(0.09, 0.07, 0.01, 0xfff6c8, { umriss: false }), sx * 0.36, KO + 0.12, z + (z > K0 ? 0.045 : -0.045)));
    }
    kabine.add(setze(zylinder(0.01, 0.01, 0.2, SCHW, { umriss: false }, 6), sx * (KB / 2 + 0.08), 1.95, K1 + 0.02, 0, 0, Math.PI / 2));
    kabine.add(setze(quader(0.03, 0.18, 0.1, SCHW, { umriss: 0.002 }), sx * (KB / 2 + 0.19), 1.9, K1 + 0.02));
  }
  kabine.add(setze(zylinder(0.045, 0.055, 0.08, 0xf2a21c, { umriss: 0.002 }, 10), -0.3, KO + 0.12, (K0 + K1) / 2));
  // Sitz (Oberkante 1,05 m), Lenksäule mit Lenkrad, Joystick rechts, Trittstufe links
  kabine.add(setze(quader(0.44, 0.1, 0.44, SCHW, { umriss: 0.002 }), 0, 1.0, -0.6));
  kabine.add(setze(quader(0.3, 0.22, 0.3, GRAU_D, { umriss: 0.002 }), 0, 0.88, -0.6));
  kabine.add(setze(quader(0.44, 0.56, 0.1, SCHW, { umriss: 0.002 }), 0, 1.33, -0.86, -0.12, 0, 0));
  kabine.add(setze(zylinder(0.03, 0.04, 0.55, GRAU_D, { umriss: false }, 8), 0, 1.08, -0.16, -0.55, 0, 0));
  kabine.add(setze(teil(new THREE.TorusGeometry(0.15, 0.018, 6, 18), SCHW, { umriss: 0.001 }), 0, 1.36, -0.28, -1.0, 0, 0));
  kabine.add(setze(zylinder(0.012, 0.012, 0.18, SCHW, { umriss: false }, 6), -0.28, 1.12, -0.42, 0.25, 0, 0));
  kabine.add(setze(kugel(0.03, SCHW, { umriss: false }, 8), -0.3, 1.21, -0.4));
  kabine.add(setze(quader(0.18, 0.03, 0.22, SCHW, { umriss: 0.002 }), 0.62, 0.52, -0.45));
  lader.add(kabine);
  // --- Vorderwagen: Rahmen, Achse, Turm für den Hubarm (etwas rechts, damit man vorbeischauen kann) ---
  vorderwagen.add(setze(quader(0.66, 0.34, 1.05, ROT, { umriss: 0.005 }), 0, 0.56, 0.58));
  rad(vorderwagen, 0.75);
  const BX = -0.12;
  const HUB_P = new THREE.Vector3(BX, 1.38, 0.3);
  vorderwagen.add(setze(quader(0.26, 0.88, 0.34, ROT, { umriss: 0.004 }), BX, 0.94, 0.3));
  vorderwagen.add(setze(zylinder(0.07, 0.07, 0.34, 0x8a8d92, { umriss: 0.002 }, 10), BX, 1.38, 0.3, 0, 0, Math.PI / 2));
  vorderwagen.add(setze(quader(0.3, 0.04, 0.2, 0xf2c21c, { umriss: false }), BX, 1.0, 0.475));
  // Hubarm am Drehpunkt: zwei rote Kastenteile (geknickt), Hydraulikschläuche, gelbes Warnschild
  const hub = new THREE.Group();
  hub.position.copy(HUB_P);
  vorderwagen.add(hub);
  const T_REL = new THREE.Vector3(0, -0.93, 1.15); // Werkzeugträger relativ zum Drehpunkt (Gabel unten)
  const KNICK = new THREE.Vector3(0, 0.1, 0.6);
  hub.add(strecke(balken(0.2, 0.22, ROT), new THREE.Vector3(0, 0, -0.08), KNICK, Z));
  hub.add(strecke(balken(0.18, 0.2, ROT), KNICK, T_REL.clone().add(new THREE.Vector3(0, 0.12, -0.04)), Z));
  hub.add(setze(quader(0.21, 0.12, 0.004, 0xf2c21c, { umriss: false }), 0, 0.05, 0.35, -0.1, Math.PI / 2, 0));
  for (const sx of [-1, 1]) {
    const schlauch = new THREE.CatmullRomCurve3([new THREE.Vector3(sx * 0.06, 0.13, -0.05), new THREE.Vector3(sx * 0.06, 0.22, 0.55), new THREE.Vector3(sx * 0.06, -0.3, 0.95), T_REL.clone().add(new THREE.Vector3(sx * 0.12, 0.3, 0))]);
    hub.add(teil(new THREE.TubeGeometry(schlauch, 24, 0.012, 5, false), SCHW, { umriss: false }));
  }
  // Schnellwechsler und Palettengabel (Gabelträger mit Rahmen, kurze Zinken bei x ±0,2)
  const gabel = new THREE.Group();
  gabel.position.copy(T_REL);
  hub.add(gabel);
  gabel.add(setze(quader(0.24, 0.3, 0.1, GRAU_D, { umriss: 0.003 }), 0, 0.08, -0.02));
  gabel.add(setze(zylinder(0.04, 0.04, 0.3, 0x8a8d92, { umriss: false }, 8), 0, 0.12, -0.04, 0, 0, Math.PI / 2));
  gabel.add(setze(quader(0.82, 0.07, 0.06, GRAU, { umriss: 0.003 }), 0, 0.2, 0.08));
  gabel.add(setze(quader(0.82, 0.07, 0.06, GRAU, { umriss: 0.003 }), 0, -0.3, 0.08));
  for (const sx of [-1, 1]) gabel.add(setze(quader(0.06, 0.57, 0.06, GRAU, { umriss: 0.003 }), sx * 0.38, -0.05, 0.08));
  gabel.add(setze(quader(0.14, 0.5, 0.05, GRAU_D, { umriss: 0.002 }), 0, -0.05, 0.06));
  for (const sx of [-0.2, 0.2]) {
    gabel.add(setze(quader(0.08, 0.6, 0.05, GRAU, { umriss: 0.003 }), sx, -0.12, 0.13));
    gabel.add(setze(quader(0.08, 0.05, 0.8, GRAU, { umriss: 0.003 }), sx, -0.4, 0.53));
    gabel.add(setze(quader(0.08, 0.02, 0.1, GRAU, { umriss: false }), sx, -0.39, 0.96, 0.18, 0, 0));
  }
  // Hub- und Kippzylinder (grau, mit blanker Kolbenstange): werden bei jeder Armbewegung neu ausgerichtet
  const hubZyl = zylinder(0.055, 0.055, 1, GRAU, { umriss: 0.003 }, 10);
  const hubStange = zylinder(0.03, 0.03, 1, 0xdfe3e7, { umriss: 0.002 }, 8);
  const kippZyl = zylinder(0.045, 0.045, 1, GRAU, { umriss: 0.003 }, 10);
  const kippStange = zylinder(0.025, 0.025, 1, 0xdfe3e7, { umriss: 0.002 }, 8);
  vorderwagen.add(hubZyl, hubStange, kippZyl, kippStange);
  const HUB_A = new THREE.Vector3(BX, 0.62, 0.62), KIPP_A = new THREE.Vector3(BX, 1.62, 0.36);
  const _m = new THREE.Vector3(), _n = new THREE.Vector3();
  function hydraulik() {
    hub.updateMatrix(); gabel.updateMatrix();
    // Hubzylinder: vom Rahmen zur Armmitte; Kippzylinder: vom Turm oben zum Gabelträger oben
    _m.set(0, -0.32, 0.72).applyMatrix4(hub.matrix);
    const mitte1 = HUB_A.clone().lerp(_m, 0.55);
    strecke(hubZyl, HUB_A, mitte1, Y); strecke(hubStange, mitte1, _m, Y);
    _n.set(0, 0.22, -0.02).applyMatrix4(gabel.matrix).applyMatrix4(hub.matrix);
    const mitte2 = KIPP_A.clone().lerp(_n, 0.55);
    strecke(kippZyl, KIPP_A, mitte2, Y); strecke(kippStange, mitte2, _n, Y);
  }
  hydraulik();
  setze(lader, 7.0, 0, 1.4, 0, 0.15, 0);
  scene.add(lader);
  merke(lader, 'weidemann', 'Hoflader', null);
  const laderHindernis = hindernis(6.2, 7.85, -0.1, 3.1);

  const profilTex = leinwandTextur(128, 32, (g, b, h) => { g.fillStyle = '#1b1b1d'; g.fillRect(0, 0, b, h); g.fillStyle = '#323236'; for (let x = 0; x < b; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 10, h / 2); g.lineTo(x, h); g.lineTo(x + 5, h / 2); g.fill(); } }, [3, 1]);
  // ---------- rosa Mini-Jeep (großes Elektro-Spaßauto im Wrangler-Look, ohne Dach, zwei Sitze) ----------
  // offene Wanne mit Fußraum, damit Erwachsene drin sitzen können (Beine unter dem Armaturenbrett, nicht durch die Haube)
  const ROSA = 0xf08cc0, ROSA_D = 0xd46fa4, SCHWARZ = 0x1d1d1f;
  const JL = 1.9, JB = 1.06, JR = 0.24; // Länge, Breite, Radradius
  const jeep = new THREE.Group();
  // Unterboden, Bodenblech im Fußraum
  jeep.add(setze(quader(JB - 0.16, 0.08, JL - 0.3, 0x2a2c30, { umriss: 0.003 }), 0, 0.16, 0));
  jeep.add(setze(quader(JB - 0.14, 0.03, 1.15, 0x3a3c40, { umriss: false }), 0, 0.215, -0.3));
  // Wanne: Seitenwände (vorne bis zur Haube, hinten bis zum Heck), Heckwand, Ladefläche hinter den Sitzen
  for (const sx of [-1, 1]) {
    jeep.add(setze(quader(0.06, 0.36, 1.25, ROSA, { umriss: 0.004 }), sx * (JB / 2 - 0.03), 0.4, -0.3));
    // Türausschnitt (dunkle Kante) und Haltegriff
    jeep.add(setze(quader(0.065, 0.025, 0.55, ROSA_D, { umriss: false }), sx * (JB / 2 - 0.03), 0.57, -0.2));
    jeep.add(setze(teil(new THREE.TorusGeometry(0.05, 0.01, 5, 10, Math.PI), SCHWARZ, { umriss: false }), sx * (JB / 2 - 0.08), 0.6, 0.1, 0, Math.PI / 2, 0));
    // Trittbrett
    jeep.add(setze(quader(0.1, 0.03, 0.75, SCHWARZ, { umriss: 0.002 }), sx * (JB / 2 + 0.03), 0.2, -0.2));
  }
  jeep.add(setze(quader(JB - 0.06, 0.36, 0.06, ROSA, { umriss: 0.004 }), 0, 0.4, -JL / 2 + 0.06));
  jeep.add(setze(quader(JB - 0.14, 0.03, 0.4, 0x3a3c40, { umriss: false }), 0, 0.38, -0.72));
  // Motorhaube (vorne höher als die Wanne), Lüftungsschlitze, Haubenverschlüsse
  jeep.add(setze(quader(JB - 0.04, 0.3, 0.62, ROSA, { umriss: 0.004 }), 0, 0.5, 0.62));
  jeep.add(setze(quader(JB - 0.1, 0.03, 0.6, ROSA_D, { umriss: 0.002 }), 0, 0.665, 0.62));
  for (let k = 0; k < 6; k++) jeep.add(setze(quader(0.012, 0.005, 0.22, 0x8a4a6a, { umriss: false }), -0.2 + k * 0.08, 0.683, 0.72));
  for (const sx of [-1, 1]) jeep.add(setze(quader(0.04, 0.06, 0.03, SCHWARZ, { umriss: false }), sx * (JB / 2 - 0.02), 0.6, 0.82));
  // Kühlergrill mit 7 Schlitzen, runde Scheinwerfer, Blinker, Stoßstange mit Abschlepphaken, Kennzeichen
  jeep.add(setze(quader(JB - 0.14, 0.3, 0.04, SCHWARZ, { umriss: 0.003 }), 0, 0.5, JL / 2 - 0.02));
  for (let i = 0; i < 7; i++) jeep.add(setze(quader(0.05, 0.22, 0.02, ROSA, { umriss: false }), -0.27 + i * 0.09, 0.5, JL / 2 + 0.005));
  for (const sx of [-1, 1]) {
    jeep.add(setze(zylinder(0.085, 0.085, 0.05, 0x1d1d1f, { umriss: 0.002 }, 16), sx * 0.38, 0.53, JL / 2 + 0.0, Math.PI / 2, 0, 0));
    jeep.add(setze(zylinder(0.068, 0.068, 0.055, 0xfff6c8, { umriss: false }, 16), sx * 0.38, 0.53, JL / 2 + 0.01, Math.PI / 2, 0, 0));
    jeep.add(setze(quader(0.07, 0.04, 0.02, 0xf2a21c, { umriss: false }), sx * 0.38, 0.4, JL / 2 + 0.01));
    jeep.add(setze(teil(new THREE.TorusGeometry(0.03, 0.01, 5, 10), 0xc9cdd2, { umriss: false }), sx * 0.3, 0.22, JL / 2 + 0.1));
  }
  jeep.add(setze(quader(JB + 0.06, 0.09, 0.12, SCHWARZ, { umriss: 0.003 }), 0, 0.27, JL / 2 + 0.04));
  jeep.add(setze(quader(JB + 0.06, 0.09, 0.12, SCHWARZ, { umriss: 0.003 }), 0, 0.27, -JL / 2 - 0.02));
  const schildJ = leinwandTextur(128, 32, (g, b, h) => { g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, b, h); g.fillStyle = '#1f4fa8'; g.fillRect(0, 0, 14, h); g.fillStyle = '#1d1d1f'; g.font = 'bold 20px Arial'; g.fillText('PINK 1', 20, 24); g.strokeRect(1, 1, b - 2, h - 2); });
  const kz = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.065), new THREE.MeshBasicMaterial({ map: schildJ }));
  kz.position.set(0, 0.36, -JL / 2 - 0.085); kz.rotation.y = Math.PI;
  jeep.add(kz);
  // Rückleuchten
  for (const sx of [-1, 1]) jeep.add(setze(quader(0.08, 0.12, 0.02, 0xc8352a, { umriss: 0.001 }), sx * 0.42, 0.45, -JL / 2 + 0.02));
  // ausgestellte Kotflügel über allen Rädern
  for (const z of [JL / 2 - 0.42, -JL / 2 + 0.38]) for (const sx of [-1, 1]) {
    jeep.add(setze(quader(0.18, 0.05, 0.56, ROSA, { umriss: 0.003 }), sx * (JB / 2 + 0.02), 0.52, z));
    jeep.add(setze(quader(0.04, 0.12, 0.56, ROSA_D, { umriss: 0.002 }), sx * (JB / 2 + 0.1), 0.47, z));
  }
  // Armaturenbrett mit Tacho, Lenkrad auf der Fahrerseite (links), Schalthebel
  jeep.add(setze(quader(JB - 0.12, 0.13, 0.14, 0x2a2c30, { umriss: 0.003 }), 0, 0.64, 0.24));
  for (const sx of [-0.24, 0.0]) jeep.add(setze(zylinder(0.04, 0.04, 0.01, 0xf4f4ef, { umriss: false }, 12), sx, 0.67, 0.165, Math.PI / 2, 0, 0));
  jeep.add(setze(zylinder(0.018, 0.018, 0.28, SCHWARZ, { umriss: false }, 8), -0.24, 0.66, 0.1, 1.0, 0, 0));
  jeep.add(setze(teil(new THREE.TorusGeometry(0.12, 0.016, 6, 16), SCHWARZ, { umriss: 0.001 }), -0.24, 0.73, -0.01, -1.0, 0, 0));
  jeep.add(setze(zylinder(0.012, 0.012, 0.2, 0x8a8f96, { umriss: false }, 6), 0.0, 0.32, -0.05, 0.3, 0, 0));
  jeep.add(setze(kugel(0.03, SCHWARZ, { umriss: false }, 8), 0.0, 0.42, -0.08));
  // zwei Schalensitze (Sitzfläche + Lehne)
  for (const sx of [-0.24, 0.24]) {
    jeep.add(setze(quader(0.38, 0.08, 0.4, 0x2f3136, { umriss: 0.002 }), sx, 0.46, -0.36));
    jeep.add(setze(quader(0.38, 0.1, 0.12, 0x2f3136, { umriss: 0.002 }), sx, 0.38, -0.36));
    jeep.add(setze(quader(0.38, 0.46, 0.08, 0x2f3136, { umriss: 0.002 }), sx, 0.72, -0.58, -0.15, 0, 0));
    jeep.add(setze(quader(0.28, 0.12, 0.085, 0x45474d, { umriss: false }), sx, 0.88, -0.6, -0.15, 0, 0));
  }
  // Windschutzscheibe mit Rahmen (umgeklappt geht nicht, steht), Überrollbügel, Spiegel
  const scheibeG = new THREE.Group();
  scheibeG.add(setze(quader(JB - 0.04, 0.05, 0.05, ROSA, { umriss: 0.003 }), 0, 0.42, 0));
  for (const sx of [-1, 1]) scheibeG.add(setze(quader(0.05, 0.42, 0.05, ROSA, { umriss: 0.003 }), sx * (JB / 2 - 0.04), 0.21, 0));
  scheibeG.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(JB - 0.14, 0.36), new THREE.MeshBasicMaterial({ color: 0xcfe6f4, transparent: true, opacity: 0.45, side: THREE.DoubleSide })), 0, 0.21, 0));
  scheibeG.position.set(0, 0.66, 0.33); scheibeG.rotation.x = -0.22;
  jeep.add(scheibeG);
  for (const sx of [-1, 1]) {
    jeep.add(setze(zylinder(0.028, 0.028, 0.62, SCHWARZ, { umriss: 0.002 }, 8), sx * (JB / 2 - 0.06), 0.88, -0.72));
    jeep.add(setze(zylinder(0.024, 0.024, 0.55, SCHWARZ, { umriss: 0.002 }, 8), sx * (JB / 2 - 0.06), 1.0, -0.47, Math.PI / 2 - 0.35, 0, 0));
    jeep.add(setze(quader(0.1, 0.07, 0.02, SCHWARZ, { umriss: 0.001 }), sx * (JB / 2 + 0.06), 0.82, 0.32));
  }
  jeep.add(setze(zylinder(0.028, 0.028, JB - 0.12, SCHWARZ, { umriss: 0.002 }, 8), 0, 1.19, -0.72, 0, 0, Math.PI / 2));
  // Räder mit grobem Profil, weiße Felgen; die Vorderräder sitzen in Lenk-Gruppen; Reserverad hinten
  const jeepRaeder = [], jeepLenkung = [];
  for (const z of [-JL / 2 + 0.38, JL / 2 - 0.42]) for (const sx of [-1, 1]) {
    const rad = new THREE.Group();
    rad.add(teil(new THREE.CylinderGeometry(JR, JR, 0.18, 20), 0, { material: toon(0xffffff, { map: profilTex }), umriss: 0.003 }));
    rad.add(setze(zylinder(0.13, 0.13, 0.19, 0xe9e9e4, { umriss: false }, 14), 0, 0, 0));
    for (let k = 0; k < 5; k++) { const w = k / 5 * Math.PI * 2; rad.add(setze(zylinder(0.012, 0.012, 0.195, 0x9aa0a6, { umriss: false }, 6), Math.cos(w) * 0.07, 0, Math.sin(w) * 0.07)); }
    rad.rotation.z = Math.PI / 2;
    jeepRaeder.push(rad);
    if (z > 0) {
      const lenk = new THREE.Group();
      lenk.position.set(sx * (JB / 2 + 0.02), JR, z);
      lenk.add(rad);
      jeep.add(lenk);
      jeepLenkung.push(lenk);
    } else {
      rad.position.set(sx * (JB / 2 + 0.02), JR, z);
      jeep.add(rad);
    }
  }
  const reserve = new THREE.Group();
  reserve.add(teil(new THREE.CylinderGeometry(0.21, 0.21, 0.15, 20), 0, { material: toon(0xffffff, { map: profilTex }), umriss: 0.003 }));
  reserve.add(setze(zylinder(0.11, 0.11, 0.16, 0xe9e9e4, { umriss: false }, 12), 0, 0, 0));
  reserve.rotation.x = Math.PI / 2;
  reserve.position.set(0, 0.52, -JL / 2 - 0.08);
  jeep.add(reserve);
  setze(jeep, 2.6, 0, 8.6, 0, Math.PI - 0.5, 0);
  scene.add(jeep);
  merke(jeep, 'minijeep', 'Mini-Jeep', null);
  const jeepHindernis = hindernis(1.75, 3.45, 7.75, 9.45);

  // ---------- Feuerschale mit Dreibein, rundem Grillrost und alter schwarzer Bratwurst ----------
  const feuerstelle = new THREE.Group();
  const schale = teil(new THREE.SphereGeometry(0.45, 24, 10, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), 0x2a2622, { mat: { side: THREE.DoubleSide }, umriss: 0.004 });
  schale.scale.y = 0.5; // flache Schale
  schale.position.y = 0.6;
  feuerstelle.add(schale);
  feuerstelle.add(setze(teil(new THREE.TorusGeometry(0.44, 0.02, 6, 32), 0x3a2a1e, { umriss: 0.002 }), 0, 0.57, 0, Math.PI / 2, 0, 0));
  // Rost und Rostflecken auf der Schale
  // Fuß
  for (let i = 0; i < 3; i++) { const w = i / 3 * Math.PI * 2; const fuss = zylinder(0.015, 0.015, 0.5, 0x2a2622, { umriss: 0.002 }, 6); fuss.position.set(Math.cos(w) * 0.2, 0.2, Math.sin(w) * 0.2); fuss.rotation.set(Math.sin(w) * 0.35, 0, -Math.cos(w) * 0.35); feuerstelle.add(fuss); }
  // Asche und verkohlte Holzscheite
  // graue Asche mit kleinen Häufchen, verkohlte Holzreste
  const asche = kugel(0.36, 0x77746f, { umriss: false }, 16); asche.scale.set(1, 0.08, 1); asche.position.y = 0.415; feuerstelle.add(asche);
  for (let i = 0; i < 9; i++) { const h = kugel(0.05 + r() * 0.05, i % 3 ? 0x8a8681 : 0x5f5c58, { umriss: false }, 8); h.scale.set(1, 0.4, 1); h.position.set((r() - 0.5) * 0.45, 0.43, (r() - 0.5) * 0.45); feuerstelle.add(h); }
  for (let i = 0; i < 3; i++) feuerstelle.add(setze(zylinder(0.03, 0.03, 0.3, 0x1d1a18, { umriss: 0.002 }, 7), (r() - 0.5) * 0.2, 0.45, (r() - 0.5) * 0.2, Math.PI / 2, r() * 3, 0.1));
  // Dreibein mit Kette
  const spitze = 1.75;
  for (let i = 0; i < 3; i++) {
    const w = i / 3 * Math.PI * 2 + 0.3;
    const fuss = new THREE.Vector3(Math.cos(w) * 0.75, 0, Math.sin(w) * 0.75);
    const oben = new THREE.Vector3(0, spitze, 0);
    const l = fuss.distanceTo(oben);
    const bein = zylinder(0.016, 0.018, l, 0x1d1d1f, { umriss: 0.002 }, 8);
    bein.position.copy(fuss).add(oben).multiplyScalar(0.5);
    bein.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), oben.clone().sub(fuss).normalize());
    feuerstelle.add(bein);
  }
  feuerstelle.add(setze(teil(new THREE.TorusGeometry(0.03, 0.008, 6, 10), 0x1d1d1f, { umriss: false }), 0, spitze - 0.02, 0));
  const ROST_Y = 0.92;
  for (let i = 0; i < 14; i++) feuerstelle.add(setze(teil(new THREE.TorusGeometry(0.018, 0.005, 4, 8), 0x3a3c40, { umriss: false }), 0, spitze - 0.06 - i * 0.055, 0, 0, i % 2 ? Math.PI / 2 : 0, 0));
  // drei Ketten zum Rost
  for (let i = 0; i < 3; i++) {
    const w = i / 3 * Math.PI * 2;
    const a = new THREE.Vector3(0, spitze - 0.82, 0), b = new THREE.Vector3(Math.cos(w) * 0.33, ROST_Y, Math.sin(w) * 0.33);
    const kette = zylinder(0.005, 0.005, a.distanceTo(b), 0x3a3c40, { umriss: false }, 4);
    kette.position.copy(a).add(b).multiplyScalar(0.5);
    kette.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    feuerstelle.add(kette);
  }
  // runder Grillrost: Ring mit Stäben
  feuerstelle.add(setze(teil(new THREE.TorusGeometry(0.34, 0.012, 6, 32), 0x3a3c40, { umriss: 0.002 }), 0, ROST_Y, 0, Math.PI / 2, 0, 0));
  for (let i = -5; i <= 5; i++) { const x = i * 0.06; const l = 2 * Math.sqrt(Math.max(0, 0.34 ** 2 - x * x)); feuerstelle.add(setze(zylinder(0.006, 0.006, l, 0x3a3c40, { umriss: false }, 5), x, ROST_Y, 0, Math.PI / 2, 0, 0)); }
  // alte, schwarz verkohlte Bratwurst mit Rissen
  const wurstKurve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.1, 0, -0.02), new THREE.Vector3(-0.03, 0, 0.02), new THREE.Vector3(0.05, 0, 0.01), new THREE.Vector3(0.11, 0, -0.03)]);
  const wurst = teil(new THREE.TubeGeometry(wurstKurve, 16, 0.028, 10, false), 0x1f1611, { umriss: 0.002 });
  wurst.position.set(0.05, ROST_Y + 0.025, 0.08);
  feuerstelle.add(wurst);
  for (const sx of [-1, 1]) feuerstelle.add(setze(kugel(0.028, 0x1f1611, { umriss: 0.002 }, 8), 0.05 + sx * 0.105 + (sx > 0 ? 0.005 : 0), ROST_Y + 0.025, 0.08 + (sx > 0 ? -0.03 : -0.02)));
  for (let i = 0; i < 4; i++) feuerstelle.add(setze(quader(0.012, 0.004, 0.02, 0x7a4a2a, { umriss: false }), 0.0 + i * 0.035, ROST_Y + 0.047, 0.09 - (i % 2) * 0.01, 0, 0.4, 0));
  setze(feuerstelle, -4.3, 0, 8.0, 0, 0, 0);
  scene.add(feuerstelle);
  merke(feuerstelle, 'feuerschale', 'Feuerschale', null);
  const feuerHindernis = hindernis(-5.1, -3.5, 7.2, 8.8);

  // ---------- Feldweg nach rechts (Ausfahrt vom Hof): zwei Fahrspuren mit Gras in der Mitte ----------
  const wegTex = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#8f8a78'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,55,45,0.35)' : 'rgba(200,195,180,0.35)'; g.fillRect(r() * b, r() * h, 2 + r() * 3, 2 + r() * 3); }
    g.fillStyle = '#5f8a3c'; g.fillRect(0, h * 0.4, b, h * 0.2);
  }, [12, 1]);
  const feldweg = new THREE.Mesh(new THREE.PlaneGeometry(80, 2.2), toon(0xffffff, { map: wegTex }));
  feldweg.rotation.x = -Math.PI / 2;
  feldweg.position.set(9.0 + 40, 0.012, (AUSFAHRT.zMin + AUSFAHRT.zMax) / 2);
  scene.add(feldweg);

  // ---------- Bäume auf der Wiese ----------
  const blatt = [0x3f7a35, 0x4f8a3e, 0x356a2c];
  for (const [x, z, s] of [[-8.5, 15, 1.2], [-3.5, 18, 1.4], [4.5, 16.5, 1.1], [10.5, 13.5, 1.3], [-12, 13.8, 1.25], [13.5, 6.5, 1.15], [14, -2, 1.3], [-9.5, -1.5, 1.1], [8, 22, 1.5], [-6, 24, 1.6]]) {
    const baum = new THREE.Group();
    baum.add(setze(zylinder(0.16 * s, 0.24 * s, 2.4 * s, 0x6a4a2e, { umriss: 0.005 }, 10), 0, 1.2 * s, 0));
    for (let k = 0; k < 5; k++) {
      const kr = teil(new THREE.IcosahedronGeometry((1.0 + r() * 0.5) * s, 1), blatt[k % 3], { umriss: 0.01 });
      kr.position.set((r() - 0.5) * 1.6 * s, (2.6 + r() * 1.3) * s, (r() - 0.5) * 1.6 * s);
      baum.add(kr);
    }
    baum.position.set(x, 0, z);
    baum.rotation.y = r() * 6;
    scene.add(baum);
  }

  return {
    // Ist (x, z) draußen mit Abstand r begehbar?
    begehbar(x, z, rr) {
      const drin = (q, m) => x > q.xMin + m && x < q.xMax - m && z > q.zMin + m && z < q.zMax - m;
      if (x > BAD_HAUS.xMin - rr && x < BAD_HAUS.xMax + rr && z < BAD_HAUS.zMax + rr && z > 3.0) return false;
      return drin(VORPLATZ, rr) || drin(SEITE, rr) || (x > DURCHGANG.xMin && x < DURCHGANG.xMax && z > DURCHGANG.zMin && z < DURCHGANG.zMax);
    },
    istDraussen(x, z) { return z > RAUM.zMax + 0.1 || x > RAUM.xMax + 0.1; },
    // Darf ein Fahrzeug hier stehen? Draußen auf dem Hof, nicht durch die Schlupftür, nicht in den Bad-Anbau
    fahrbar(x, z) {
      const drin = (q) => x > q.xMin && x < q.xMax && z > q.zMin && z < q.zMax;
      if (x > BAD_HAUS.xMin && x < BAD_HAUS.xMax && z < BAD_HAUS.zMax && z > 3.0) return false;
      return (drin(VORPLATZ) && z > RAUM.zMax + 0.15) || (drin(SEITE) && x > RAUM.xMax + 0.15) || drin(AUSFAHRT);
    },
    fahrzeuge: {
      jeep: { gruppe: jeep, raeder: jeepRaeder, lenkung: jeepLenkung, hindernis: jeepHindernis },
      lader: { gruppe: lader, vorne: vorderwagen, hub, gabel, raeder: laderRaeder, hindernis: laderHindernis, hydraulik, zinke: new THREE.Vector3(0, -0.4, 0.53) },
      feuerstelle, feuerHindernis, tonnen,
    },
  };
}
