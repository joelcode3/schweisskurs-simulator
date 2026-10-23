// Draußen vor der Werkstatt: rotes Backsteingebäude mit flachem Satteldach (schwarzes Wellblech), kaputte Betonfläche,
// Wiese mit Bäumen, Horizont, Mülltonnen, roter Weidemann-Hoflader mit Palettengabel, rosa Mini-Jeep, Feuerschale mit
// Dreibein, Grillrost und alter Bratwurst, Schild „Nicht stören – Schweißkurs!“.
import * as THREE from 'three';
import { toon, teil, quader, rundQuader, zylinder, kugel, setze, leinwandTextur, zufall } from './toon.js';
import { FELDWEG, baueLandschaft, imKreis } from './landschaft.js';

// Begehbare Flächen draußen (Rechtecke): rund um die Werkstatt, Carport, Wohnwagen und Benz. Das Bad-Häuschen vorne
// rechts ist ausgespart, die Werkstatt selbst sowieso.
export { GELAENDE, FELDWEG } from './landschaft.js';
const BAD_HAUS = { xMin: 0.55, xMax: 4.05, zMin: 3.9, zMax: 6.95 };
const DURCHGANG = { xMin: -0.68, xMax: -0.02, zMin: 3.4, zMax: 4.7 }; // Schlupftür im Tor
const WEG_BREITE = 2.4;
const wegKurve = new THREE.CatmullRomCurve3(FELDWEG.map((p) => new THREE.Vector3(p.x, 0, p.z)), false, 'centripetal');
const wegPunkte = wegKurve.getSpacedPoints(700);

// Liegt (x, z) in einem Hindernis (mit Rand)? Normale Hindernisse sind achsparallele Kästen; Fahrzeuge haben zusätzlich
// gedrehte Kästen (boxen: { x, z, psi, hx, hz }), damit man dicht an ihnen vorbei- und durch Lücken fahren kann.
export function inHindernis(h, x, z, rand = 0) {
  if (!(x > h.xMin - rand && x < h.xMax + rand && z > h.zMin - rand && z < h.zMax + rand)) return false;
  if (!h.boxen) return true;
  return h.boxen.some((b) => {
    const dx = x - b.x, dz = z - b.z, c = Math.cos(b.psi), s = Math.sin(b.psi);
    return Math.abs(dx * c - dz * s) < b.hx + rand && Math.abs(dx * s + dz * c) < b.hz + rand;
  });
}

// Müllteile (für den Müll um die Tonnen und den, der beim Umfahren rausfliegt)
const pizzaTex = leinwandTextur(128, 128, (g, b, h) => {
  g.fillStyle = '#c9a26a'; g.fillRect(0, 0, b, h);
  g.strokeStyle = '#a8824e'; g.lineWidth = 3; g.strokeRect(6, 6, b - 12, h - 12);
  g.fillStyle = '#b2241c'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('PIZZA', b / 2, 58);
  g.fillStyle = '#2f6b3a'; g.font = 'italic 14px Georgia'; g.fillText('Bella Napoli', b / 2, 80);
  for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(120,80,20,0.25)'; g.beginPath(); g.ellipse(20 + i * 28, 100 - i * 9, 9, 6, 0, 0, Math.PI * 2); g.fill(); }
});
const dosenTex = leinwandTextur(64, 32, (g, b, h) => { g.fillStyle = '#c8352a'; g.fillRect(0, 0, b, h); g.fillStyle = '#f4f4ef'; g.fillRect(0, 12, b, 8); g.fillStyle = '#1d1d1f'; g.font = 'bold 9px Arial'; g.fillText('COLA', 18, 19); });
const bananeAussen = leinwandTextur(32, 128, (g, b, h) => {
  const v = g.createLinearGradient(0, 0, 0, h);
  v.addColorStop(0, '#d8b43a'); v.addColorStop(0.75, '#ecc94a'); v.addColorStop(0.92, '#9a7a2a'); v.addColorStop(1, '#3a2a14');
  g.fillStyle = v; g.fillRect(0, 0, b, h);
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(90,55,20,${0.3 + Math.random() * 0.5})`; g.beginPath(); g.ellipse(Math.random() * b, Math.random() * h * 0.9, 1 + Math.random() * 3, 1 + Math.random() * 4, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(120,140,40,0.25)'; g.fillRect(0, 0, b, 10);
});
const bananeInnen = leinwandTextur(32, 128, (g, b, h) => {
  g.fillStyle = '#f2e7c2'; g.fillRect(0, 0, b, h);
  g.strokeStyle = 'rgba(190,160,100,0.45)'; g.lineWidth = 1;
  for (let x = 3; x < b; x += 5) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 3, h); g.stroke(); }
  g.fillStyle = 'rgba(150,110,50,0.35)'; for (let i = 0; i < 8; i++) g.fillRect(Math.random() * b, Math.random() * h, 3, 6);
  g.fillStyle = '#6a4a20'; g.fillRect(0, h - 8, b, 8);
});
export function muellTeil(art) {
  const m = new THREE.Group();
  if (art === 'banane') {
    // Bananenschale: braune Stielspitze, kurzer Schalenrest, von dem 4 lange, gebogene Lappen sternförmig auseinanderfallen;
    // außen gelb mit braunen Flecken und dunkler Spitze, innen hell cremefarben mit Fasern
    const lappen = (w, lang, innenOben) => {
      const n = 10, pos = [], uv = [], idx = [];
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const breite = 0.034 * Math.sin(Math.min(1, t * 1.4 + 0.25) * Math.PI) + 0.006;
        const bieg = Math.sin(t * 2.2) * 0.06; // leicht seitlich gebogen
        const x = t * lang, z = bieg, y = 0.006 + 0.03 * Math.pow(Math.max(0, 0.25 - t), 1) * 4 + (t > 0.8 ? (t - 0.8) * 0.06 : 0);
        for (const sx of [-1, 1]) { pos.push(x, y + (1 - Math.abs(sx)) * 0.0, z + sx * breite); uv.push(sx < 0 ? 0 : 1, t); }
        if (i < n) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      const grp = new THREE.Group();
      const innen = new THREE.Mesh(g, toon(0xffffff, { map: bananeInnen, side: THREE.FrontSide }));
      const aussen = new THREE.Mesh(g, toon(0xffffff, { map: bananeAussen, side: THREE.BackSide }));
      grp.add(innen, aussen);
      if (!innenOben) grp.rotation.x = Math.PI; // umgeklappter Lappen: gelbe Seite oben
      const halter = new THREE.Group();
      halter.add(grp);
      if (!innenOben) grp.position.y = 0.012;
      halter.rotation.y = w;
      return halter;
    };
    [[0.3, 0.17, true], [1.75, 0.15, true], [3.3, 0.16, false], [4.9, 0.13, true]].forEach(([w, l, io]) => m.add(lappen(w, l, io)));
    const rest = teil(new THREE.CylinderGeometry(0.02, 0.026, 0.05, 10), 0xe2c24a, { umriss: 0.001 });
    rest.rotation.z = Math.PI / 2 - 0.4; rest.position.set(-0.025, 0.022, 0);
    m.add(rest);
    m.add(setze(zylinder(0.008, 0.012, 0.045, 0x5a3a14, { umriss: 0.001 }, 6), -0.065, 0.04, 0, 0, 0, Math.PI / 2 - 0.6));
    m.add(setze(kugel(0.009, 0x3a2410, { umriss: false }, 6), -0.087, 0.052, 0));
  } else if (art === 'pizza') {
    // Pizzakarton, Deckel halb auf, drin Krümel und ein vergessener Rand
    const kart = toon(0xffffff, { map: pizzaTex });
    m.add(setze(quader(0.34, 0.035, 0.34, 0xc9a26a, { umriss: 0.002 }), 0, 0.018, 0));
    const deckel = new THREE.Group();
    deckel.add(setze(teil(new THREE.BoxGeometry(0.34, 0.006, 0.34), 0, { material: kart, umriss: 0.002 }), 0, 0, -0.17));
    deckel.position.set(0, 0.037, 0.17); deckel.rotation.x = -0.7;
    m.add(deckel);
    const rand = teil(new THREE.TorusGeometry(0.1, 0.014, 6, 12, Math.PI * 0.6), 0xd8a050, { umriss: 0.001 });
    rand.rotation.x = Math.PI / 2; rand.position.set(0.03, 0.04, -0.02);
    m.add(rand);
  } else if (art === 'dose') {
    m.add(setze(teil(new THREE.CylinderGeometry(0.033, 0.033, 0.08, 10), 0, { material: toon(0xffffff, { map: dosenTex }), umriss: 0.001 }), 0, 0.03, 0, Math.PI / 2, 0, 0.3));
    m.children[0].scale.set(1, 0.6, 1); // zerdrückt
  } else if (art === 'flasche') {
    m.add(setze(zylinder(0.035, 0.035, 0.2, 0xa8d4e6, { umriss: 0.001, mat: { transparent: true, opacity: 0.7 } }, 10), 0, 0.035, 0, Math.PI / 2, 0, 0));
    m.add(setze(zylinder(0.015, 0.015, 0.03, 0x2f5fa8, { umriss: false }, 8), 0, 0.035, 0.115, Math.PI / 2, 0, 0));
  } else if (art === 'chips') {
    const tuete = kugel(0.09, 0x2f8f4a, { umriss: 0.002 }, 8);
    tuete.scale.set(1, 0.25, 1.3); tuete.position.y = 0.02;
    m.add(tuete);
    m.add(setze(quader(0.18, 0.01, 0.02, 0xc9cdd2, { umriss: false }), 0, 0.03, 0.12));
  } else if (art === 'becher') {
    m.add(setze(zylinder(0.04, 0.03, 0.1, 0xf2f0ea, { umriss: 0.001 }, 10), 0, 0.04, 0, Math.PI / 2, 0, 0));
    m.add(setze(zylinder(0.04, 0.04, 0.01, 0x1d1d1f, { umriss: false }, 10), 0, 0.04, 0.055, Math.PI / 2, 0, 0));
  } else if (art === 'zeitung') {
    for (let k = 0; k < 3; k++) m.add(setze(quader(0.28, 0.004, 0.2, k ? 0xe8e4d8 : 0xd8d4c8, { umriss: 0.001 }), (k - 1) * 0.03, 0.003 + k * 0.004, (k - 1) * 0.02, 0, k * 0.3, 0));
  } else {
    // zerknüllter Karton
    m.add(setze(quader(0.16, 0.06, 0.12, 0xb08a5a, { umriss: 0.002 }), 0, 0.03, 0, 0.2, 0.3, 0.1));
  }
  // etwas größer als echt, damit man es im Spiel erkennt
  m.scale.setScalar(art === 'pizza' || art === 'zeitung' ? 1.2 : 1.6);
  return m;
}
export const MUELL_ARTEN = ['banane', 'pizza', 'dose', 'flasche', 'chips', 'becher', 'zeitung', 'karton'];

export function baueDraussen(scene, { merke, hindernis, RAUM }) {
  const r = zufall(303);

  // ---------- Himmel und Horizont ----------
  const himmelTex = leinwandTextur(64, 512, (g, b, h) => {
    const v = g.createLinearGradient(0, 0, 0, h);
    v.addColorStop(0, '#4f8fd0'); v.addColorStop(0.42, '#8ec1ea'); v.addColorStop(0.5, '#dbeef8'); v.addColorStop(1, '#dbeef8');
    g.fillStyle = v; g.fillRect(0, 0, b, h);
  });
  const himmel = new THREE.Mesh(new THREE.SphereGeometry(1300, 32, 16), new THREE.MeshBasicMaterial({ map: himmelTex, side: THREE.BackSide, fog: false }));
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
    s.position.set(-110 + Math.sin(w) * 900, 260 + r() * 150, 20 + Math.cos(w) * 900);
    s.scale.set(280 + r() * 170, 140 + r() * 60, 1);
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
  const horizont = new THREE.Mesh(new THREE.CylinderGeometry(1000, 1000, 190, 96, 1, true), new THREE.MeshBasicMaterial({ map: horizontTex, side: THREE.BackSide, transparent: true, depthWrite: false, fog: false }));
  horizont.position.set(-110, 47, 20);
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
  // Wiese mit Hügeln, Hauptstraße, Lühmanns Hof usw. (js/landschaft.js)
  const landschaft = baueLandschaft(scene, { merke, hindernis, grasTex });

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
  // Seitenwände; links mit Fensterloch (passt zum Fenster innen), mit Laibung, damit man durchgucken kann
  const FENSTER_LOCH = { z0: 0.82, z1: 2.38, y0: 1.47, y1: 2.43 };
  for (const seite of [-1, 1]) {
    const z0 = RAUM.zMin - 0.08, z1 = RAUM.zMax + 0.08;
    const form = new THREE.Shape();
    form.moveTo(z0, 0); form.lineTo(z1, 0); form.lineTo(z1, TRAUFE); form.lineTo(z0, TRAUFE); form.closePath();
    if (seite < 0) {
      const l = new THREE.Path();
      l.moveTo(FENSTER_LOCH.z0, FENSTER_LOCH.y0); l.lineTo(FENSTER_LOCH.z0, FENSTER_LOCH.y1); l.lineTo(FENSTER_LOCH.z1, FENSTER_LOCH.y1); l.lineTo(FENSTER_LOCH.z1, FENSTER_LOCH.y0); l.closePath();
      form.holes.push(l);
    }
    const w = new THREE.Mesh(new THREE.ShapeGeometry(form), steinMat);
    w.position.set(seite * (RAUM.xMax + 0.08), 0, 0);
    // Form-x = Welt-z: links um -90°, rechts gespiegelt
    w.rotation.y = -Math.PI / 2;
    if (seite > 0) { w.rotation.y = Math.PI / 2; w.scale.x = -1; }
    w.receiveShadow = true;
    scene.add(w);
  }
  // Laibung (Mauerdicke) rund ums Fensterloch
  {
    const L = FENSTER_LOCH, x = RAUM.xMin - 0.04;
    const putz = toon(0xd8d2c4, { side: THREE.DoubleSide });
    for (const y of [L.y0, L.y1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, L.z1 - L.z0), putz); m.rotation.set(-Math.PI / 2, 0, 0); m.position.set(x, y, (L.z0 + L.z1) / 2); scene.add(m); }
    for (const z of [L.z0, L.z1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, L.y1 - L.y0), putz); m.position.set(x, (L.y0 + L.y1) / 2, z); scene.add(m); }
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
  for (const [b, h, x, y] of [[1.7, 0.08, 0, 0.51], [1.7, 0.08, 0, -0.51], [0.08, 1.1, -0.81, 0], [0.08, 1.1, 0.81, 0]]) fensterAussen.add(setze(quader(b, h, 0.05, 0xf0f0ea, { umriss: 0.003 }), x, y, 0));
  const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.96), new THREE.MeshBasicMaterial({ color: 0x9cc7e6, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
  glas.raycast = () => {};
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
  // Müllsack: praller, unten breit aufliegender Sack mit Beulen und Falten, oben zusammengerafft und verknotet (zwei Zipfel)
  const sackGeo = new THREE.LatheGeometry([[0.0, 0], [0.17, 0.005], [0.24, 0.05], [0.27, 0.14], [0.26, 0.25], [0.21, 0.36], [0.12, 0.44], [0.05, 0.49], [0.035, 0.52]]
    .map(([x, y]) => new THREE.Vector2(x, y)), 28);
  const sp = sackGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i);
    const w = Math.atan2(z, x);
    // Beulen vom Inhalt, senkrechte Falten zur Raffung hin
    const beule = 1 + Math.sin(w * 3 + 0.7) * 0.07 * Math.sin(y * 6) + Math.sin(w * 5 + y * 9) * 0.04;
    const falte = 1 + Math.sin(w * 14) * 0.05 * Math.max(0, (y - 0.3) / 0.22);
    sp.setX(i, x * beule * falte); sp.setZ(i, z * beule * falte);
  }
  sackGeo.computeVertexNormals();
  const sack = new THREE.Group();
  sack.add(teil(sackGeo, 0x1d1d1f, { umriss: 0.003, mat: { side: THREE.DoubleSide } }));
  // Glanzlichter (Plastik) und Knoten mit zwei Zipfeln
  for (const [x, y, z] of [[0.12, 0.3, 0.18], [-0.16, 0.2, 0.16]]) sack.add(setze(quader(0.05, 0.12, 0.004, 0x5a5d62, { umriss: false }), x, y, z, 0, Math.atan2(x, z), 0.2));
  sack.add(setze(kugel(0.04, 0x1d1d1f, { umriss: 0.002 }, 8), 0, 0.54, 0));
  for (const sx of [-1, 1]) {
    const zipfel = teil(new THREE.ConeGeometry(0.035, 0.12, 6), 0x1d1d1f, { umriss: 0.002 });
    zipfel.position.set(sx * 0.05, 0.6, 0.01); zipfel.rotation.z = -sx * 0.9;
    sack.add(zipfel);
  }
  sack.position.set(-0.5, 0, 0.18);
  sack.rotation.y = 0.6;
  tonnen.add(sack);
  // ein bisschen Müll liegt immer rum (Bananenschale, Dose, Becher)
  for (const [art, x, z, w] of [['banane', -0.75, 0.75, 0.6], ['dose', 1.9, 0.6, 1.2], ['becher', -0.3, 0.95, 2.1], ['zeitung', 1.6, 1.0, 0.3], ['pizza', 2.3, 0.95, 0.5], ['banane', 2.6, 0.5, 2.0]]) {
    const t = muellTeil(art); t.position.set(x, 0, z); t.rotation.y = w; t.userData.liegeMuell = true; tonnen.add(t);
  }
  setze(tonnen, -4.6, 0, RAUM.zMax + 0.6, 0, 0, 0);
  scene.add(tonnen);
  merke(tonnen, 'muelltonnen', 'Mülltonnen', null);
  const tonnenHindernis = hindernis(-5.3, -2.85, RAUM.zMax, RAUM.zMax + 1.1);

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
  // runde Motorhaube hinten (Seitenprofil mit großen Radien, Kanten abgerundet), statt eckiger Kästen
  const haubeProfil = new THREE.Shape();
  haubeProfil.moveTo(-0.95, 0.67);
  haubeProfil.lineTo(-0.95, 1.2);
  haubeProfil.quadraticCurveTo(-0.95, 1.34, -1.12, 1.35);
  haubeProfil.lineTo(-1.3, 1.34);
  haubeProfil.quadraticCurveTo(-1.6, 1.32, -1.63, 1.02);
  haubeProfil.lineTo(-1.64, 0.8);
  haubeProfil.quadraticCurveTo(-1.64, 0.67, -1.5, 0.67);
  haubeProfil.closePath();
  const haubeGeo = new THREE.ExtrudeGeometry(haubeProfil, { depth: 0.86, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 5, curveSegments: 16 });
  haubeGeo.translate(0, 0, -0.43);
  haubeGeo.rotateY(-Math.PI / 2);
  const motorHaube = teil(haubeGeo, ROT, { umriss: 0.005 });
  lader.add(motorHaube);
  for (const sx of [-1, 1]) {
    lader.add(setze(quader(0.02, 0.36, 0.28, SCHW, { umriss: 0.002 }), sx * 0.505, 1.03, -1.22));
    for (let k = 0; k < 5; k++) lader.add(setze(quader(0.024, 0.012, 0.26, 0x34363a, { umriss: false }), sx * 0.505, 0.9 + k * 0.065, -1.22));
  }
  // Heck: abgerundetes Gegengewicht unter der Haube
  const heckGewicht = teil(new THREE.CapsuleGeometry(0.15, 0.72, 6, 14), ROT, { umriss: 0.004 });
  heckGewicht.rotation.z = Math.PI / 2;
  heckGewicht.scale.set(1, 1, 0.7);
  heckGewicht.position.set(0, 0.55, -1.6);
  lader.add(heckGewicht);
  for (const sx of [-1, 1]) {
    lader.add(setze(quader(0.12, 0.08, 0.02, 0xc8352a, { umriss: 0.001 }), sx * 0.34, 0.84, -1.72));
    lader.add(setze(quader(0.06, 0.08, 0.02, 0xf2a21c, { umriss: false }), sx * 0.24, 0.84, -1.72));
  }
  lader.add(setze(quader(0.3, 0.1, 0.02, SCHW, { umriss: false }), 0, 0.84, -1.72));
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
  // tief liegender Boden: die Füße der Fahrer stehen im Fußraum und gucken unten nicht raus
  // rosa Karosserie mit Bodenfreiheit: Wagenboden auf 0,2 m, die Fahrer sitzen etwas höher, damit die Füße darauf stehen
  jeep.add(setze(quader(JB - 0.1, 0.025, JL - 0.3, 0x3a3c40, { umriss: 0.002 }), 0, 0.205, -0.02));
  // Wanne: Seitenwände (vorne bis zur Haube, hinten bis zum Heck), Heckwand, Ladefläche hinter den Sitzen
  for (const sx of [-1, 1]) {
    jeep.add(setze(rundQuader(0.07, 0.4, 1.25, ROSA, { umriss: 0.004 }, 0.035), sx * (JB / 2 - 0.035), 0.38, -0.3));
    // Türausschnitt (dunkle Kante) und Haltegriff
    jeep.add(setze(quader(0.065, 0.025, 0.55, ROSA_D, { umriss: false }), sx * (JB / 2 - 0.03), 0.57, -0.2));
    jeep.add(setze(teil(new THREE.TorusGeometry(0.05, 0.01, 5, 10, Math.PI), SCHWARZ, { umriss: false }), sx * (JB / 2 - 0.08), 0.6, 0.1, 0, Math.PI / 2, 0));
  }
  jeep.add(setze(rundQuader(JB - 0.02, 0.4, 0.08, ROSA, { umriss: 0.004 }, 0.04), 0, 0.38, -JL / 2 + 0.07));
  jeep.add(setze(quader(JB - 0.14, 0.03, 0.4, 0x3a3c40, { umriss: false }), 0, 0.38, -0.72));
  // Motorhaube (vorne höher als die Wanne), Lüftungsschlitze, Haubenverschlüsse
  jeep.add(setze(rundQuader(JB - 0.02, 0.46, 0.64, ROSA, { umriss: 0.004 }, 0.12), 0, 0.43, 0.62));
  jeep.add(setze(rundQuader(JB - 0.2, 0.03, 0.5, ROSA_D, { umriss: 0.002 }, 0.04), 0, 0.665, 0.62));
  for (let k = 0; k < 6; k++) jeep.add(setze(quader(0.012, 0.005, 0.22, 0x8a4a6a, { umriss: false }), -0.2 + k * 0.08, 0.683, 0.72));
  for (const sx of [-1, 1]) jeep.add(setze(quader(0.04, 0.06, 0.03, SCHWARZ, { umriss: false }), sx * (JB / 2 - 0.02), 0.6, 0.82));
  // Kühlergrill mit 7 Schlitzen, runde Scheinwerfer, Blinker, Stoßstange mit Abschlepphaken, Kennzeichen
  jeep.add(setze(rundQuader(JB - 0.14, 0.3, 0.05, SCHWARZ, { umriss: 0.003 }, 0.05), 0, 0.5, JL / 2 - 0.02));
  for (let i = 0; i < 7; i++) jeep.add(setze(quader(0.05, 0.22, 0.02, ROSA, { umriss: false }), -0.27 + i * 0.09, 0.5, JL / 2 + 0.005));
  for (const sx of [-1, 1]) {
    jeep.add(setze(zylinder(0.085, 0.085, 0.05, 0x1d1d1f, { umriss: 0.002 }, 16), sx * 0.38, 0.53, JL / 2 + 0.0, Math.PI / 2, 0, 0));
    jeep.add(setze(zylinder(0.068, 0.068, 0.055, 0xfff6c8, { umriss: false }, 16), sx * 0.38, 0.53, JL / 2 + 0.01, Math.PI / 2, 0, 0));
    jeep.add(setze(quader(0.07, 0.04, 0.02, 0xf2a21c, { umriss: false }), sx * 0.38, 0.4, JL / 2 + 0.01));
    jeep.add(setze(teil(new THREE.TorusGeometry(0.03, 0.01, 5, 10), 0xc9cdd2, { umriss: false }), sx * 0.3, 0.22, JL / 2 + 0.1));
  }
  jeep.add(setze(rundQuader(JB + 0.06, 0.1, 0.12, SCHWARZ, { umriss: 0.003 }, 0.045), 0, 0.27, JL / 2 + 0.04));
  jeep.add(setze(rundQuader(JB + 0.06, 0.1, 0.12, SCHWARZ, { umriss: 0.003 }, 0.045), 0, 0.27, -JL / 2 - 0.02));
  const schildJ = leinwandTextur(128, 32, (g, b, h) => { g.fillStyle = '#f4f4ef'; g.fillRect(0, 0, b, h); g.fillStyle = '#1f4fa8'; g.fillRect(0, 0, 14, h); g.fillStyle = '#1d1d1f'; g.font = 'bold 20px Arial'; g.fillText('PINK 1', 20, 24); g.strokeRect(1, 1, b - 2, h - 2); });
  const kz = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.065), new THREE.MeshBasicMaterial({ map: schildJ }));
  kz.position.set(0, 0.36, -JL / 2 - 0.085); kz.rotation.y = Math.PI;
  jeep.add(kz);
  // Rückleuchten
  for (const sx of [-1, 1]) jeep.add(setze(quader(0.08, 0.12, 0.02, 0xc8352a, { umriss: 0.001 }), sx * 0.42, 0.45, -JL / 2 + 0.02));
  // ausgestellte Kotflügel über allen Rädern
  // runde, ausgestellte Kotflügel als Bögen über den Rädern
  for (const z of [JL / 2 - 0.42, -JL / 2 + 0.38]) for (const sx of [-1, 1]) {
    const bogen = teil(new THREE.CylinderGeometry(JR + 0.07, JR + 0.07, 0.22, 20, 1, true, Math.PI * 0.08, Math.PI * 0.84), ROSA, { umriss: 0.003, mat: { side: THREE.DoubleSide } });
    bogen.rotation.z = Math.PI / 2;
    bogen.position.set(sx * (JB / 2 + 0.03), JR, z);
    jeep.add(bogen);
    const rand = teil(new THREE.TorusGeometry(JR + 0.075, 0.018, 6, 20, Math.PI * 0.84), ROSA_D, { umriss: 0.002 });
    rand.rotation.set(0, Math.PI / 2, Math.PI * 0.08);
    rand.position.set(sx * (JB / 2 + 0.14), JR, z);
    jeep.add(rand);
  }
  // Armaturenbrett mit Tacho, Lenkrad auf der Fahrerseite (links), Schalthebel
  jeep.add(setze(rundQuader(JB - 0.12, 0.16, 0.16, 0x2a2c30, { umriss: 0.003 }, 0.05), 0, 0.76, 0.24));
  for (const sx of [-0.24, 0.0]) jeep.add(setze(zylinder(0.04, 0.04, 0.01, 0xf4f4ef, { umriss: false }, 12), sx, 0.8, 0.165, Math.PI / 2, 0, 0));
  jeep.add(setze(zylinder(0.018, 0.018, 0.28, SCHWARZ, { umriss: false }, 8), -0.24, 0.8, 0.1, 1.0, 0, 0));
  jeep.add(setze(teil(new THREE.TorusGeometry(0.12, 0.016, 6, 16), SCHWARZ, { umriss: 0.001 }), -0.24, 0.87, -0.01, -1.0, 0, 0));
  jeep.add(setze(zylinder(0.012, 0.012, 0.2, 0x8a8f96, { umriss: false }, 6), 0.0, 0.52, -0.05, 0.3, 0, 0));
  jeep.add(setze(kugel(0.03, SCHWARZ, { umriss: false }, 8), 0.0, 0.62, -0.08));
  // zwei Schalensitze (Sitzfläche + Lehne)
  for (const sx of [-0.24, 0.24]) {
    jeep.add(setze(rundQuader(0.38, 0.09, 0.4, 0x2f3136, { umriss: 0.002 }, 0.04), sx, 0.66, -0.36));
    jeep.add(setze(rundQuader(0.34, 0.42, 0.3, 0x2f3136, { umriss: 0.002 }, 0.03), sx, 0.42, -0.42));
    jeep.add(setze(rundQuader(0.38, 0.46, 0.09, 0x2f3136, { umriss: 0.002 }, 0.04), sx, 0.92, -0.58, -0.15, 0, 0));
    jeep.add(setze(rundQuader(0.28, 0.12, 0.09, 0x45474d, { umriss: false }, 0.035), sx, 1.08, -0.6, -0.15, 0, 0));
  }
  // Windschutzscheibe mit Rahmen (umgeklappt geht nicht, steht), Überrollbügel, Spiegel
  const scheibeG = new THREE.Group();
  scheibeG.add(setze(quader(JB - 0.04, 0.05, 0.05, ROSA, { umriss: 0.003 }), 0, 0.42, 0));
  for (const sx of [-1, 1]) scheibeG.add(setze(quader(0.05, 0.42, 0.05, ROSA, { umriss: 0.003 }), sx * (JB / 2 - 0.04), 0.21, 0));
  scheibeG.add(setze(new THREE.Mesh(new THREE.PlaneGeometry(JB - 0.14, 0.36), new THREE.MeshBasicMaterial({ color: 0xcfe6f4, transparent: true, opacity: 0.45, side: THREE.DoubleSide })), 0, 0.21, 0));
  scheibeG.position.set(0, 0.82, 0.33); scheibeG.rotation.x = -0.22;
  jeep.add(scheibeG);
  for (const sx of [-1, 1]) {
    jeep.add(setze(zylinder(0.028, 0.028, 0.62, SCHWARZ, { umriss: 0.002 }, 8), sx * (JB / 2 - 0.06), 0.88, -0.72));
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

  // ---------- Feldweg (Ausfahrt vom Hof): Band entlang der Kurve, zwei Fahrspuren mit Gras in der Mitte, weiche Ränder ----------
  const wegTex = leinwandTextur(64, 512, (g, b, h) => {
    g.fillStyle = '#8f8a78'; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? 'rgba(60,55,45,0.35)' : 'rgba(200,195,180,0.35)'; g.fillRect(r() * b, r() * h, 1 + r() * 3, 1 + r() * 3); }
    // Grasstreifen in der Mitte und Gras an den Rändern (ausgefranst)
    for (let y = 0; y < h; y += 2) {
      const m = 4 + Math.sin(y * 0.11) * 1.5 + r() * 2;
      g.fillStyle = '#5f8a3c'; g.fillRect(b / 2 - m, y, m * 2, 2);
      const rl = 5 + r() * 4, rr = 5 + r() * 4;
      g.fillStyle = '#6f9a45'; g.fillRect(0, y, rl, 2); g.fillRect(b - rr, y, rr, 2);
    }
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(60,110,40,0.7)'; g.fillRect(b / 2 + (r() - 0.5) * 14, r() * h, 1, 3); }
  });
  wegTex.wrapS = wegTex.wrapT = THREE.RepeatWrapping;
  {
    const n = wegPunkte.length;
    const pos = [], uv = [], idx = [];
    let laenge = 0;
    for (let i = 0; i < n; i++) {
      const p = wegPunkte[i], q = wegPunkte[Math.min(n - 1, i + 1)], o = wegPunkte[Math.max(0, i - 1)];
      const t = new THREE.Vector3().subVectors(q, o).normalize();
      const nx = -t.z, nz = t.x;
      if (i) laenge += p.distanceTo(wegPunkte[i - 1]);
      for (const sx of [-1, 1]) { pos.push(p.x + nx * sx * WEG_BREITE / 2, 0.012, p.z + nz * sx * WEG_BREITE / 2); uv.push(sx < 0 ? 0 : 1, laenge / 6); }
      if (i < n - 1) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const feldweg = new THREE.Mesh(geo, toon(0xffffff, { map: wegTex, side: THREE.DoubleSide }));
    feldweg.receiveShadow = true;
    scene.add(feldweg);
  }

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
    hindernis(x - 0.3 * s, x + 0.3 * s, z - 0.3 * s, z + 0.3 * s);
  }

  return {
    landschaft,
    update: landschaft.update,
    // Ist (x, z) draußen mit Abstand r begehbar? Überall innerhalb der Ringstraße (und ein paar Meter dahinter),
    // nur nicht in der Werkstatt und im Bad-Anbau; in die Werkstatt geht es nur durch die Schlupftür
    begehbar(x, z, rr) {
      if (x > DURCHGANG.xMin && x < DURCHGANG.xMax && z > DURCHGANG.zMin && z < DURCHGANG.zMax) return true;
      if (x > BAD_HAUS.xMin - rr && x < BAD_HAUS.xMax + rr && z < BAD_HAUS.zMax + rr && z > 3.0) return false;
      if (x > RAUM.xMin - 0.08 - rr && x < RAUM.xMax + 0.08 + rr && z > RAUM.zMin - 0.08 - rr && z < RAUM.zMax + 0.08 + rr) return false;
      return imKreis(x, z, rr);
    },
    istDraussen(x, z) { return z > RAUM.zMax + 0.1 || x > RAUM.xMax + 0.1 || x < RAUM.xMin - 0.1 || z < RAUM.zMin - 0.1; },
    // Darf ein Fahrzeug hier stehen? Draußen rund ums Haus und auf dem Feldweg, nicht durch die Schlupftür, nicht in den Bad-Anbau
    fahrbar(x, z) {
      if (x > BAD_HAUS.xMin && x < BAD_HAUS.xMax && z < BAD_HAUS.zMax && z > 3.0) return false;
      if (x > RAUM.xMin - 0.25 && x < RAUM.xMax + 0.25 && z > RAUM.zMin - 0.25 && z < RAUM.zMax + 0.25) return false;
      return imKreis(x, z);
    },
    fahrzeuge: {
      jeep: { gruppe: jeep, raeder: jeepRaeder, lenkung: jeepLenkung, hindernis: jeepHindernis },
      lader: { gruppe: lader, vorne: vorderwagen, hub, gabel, raeder: laderRaeder, hindernis: laderHindernis, hydraulik, zinke: new THREE.Vector3(0, -0.4, 0.53) },
      feuerstelle, feuerHindernis, tonnen, tonnenHindernis,
    },
  };
}
