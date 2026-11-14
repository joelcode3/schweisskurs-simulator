// Paket E4: Mettenden grillen.
// Mettenden (3 Stück) oder einzelne Würste aus Peters Hofladen auf den Grill werfen (Treffer aufs Rost zählt) oder mit der
// Wurst in der Hand die Feuerschale anklicken. Dann Feuerschale anklicken = Minispiel „Mettenden grillen“ (grillSpiel):
// anzünden, alte Wurst runterkicken, grillen. Danach glüht die Feuerschale ein paar Minuten, die Würste liegen gegrillt auf
// dem Rost, und wer gerade da ist (Dennis, Jonny, Waldo, Torben, David, Kumpels) kommt schnell rüber und fragt nach einer.
// Figur anklicken = Mettende geben. Kein Zeitlimit; Dennis freut sich nach dem Ergebnis oder meckert.
import * as THREE from 'three';
import { toon, teil, kugel, setze } from './toon.js';
import { wurstModell } from './landschaft.js';
import { DENNIS, JONNY, WALDO, TORBEN, DAVID, KUMPEL } from './texte.js';
import { grillSpiel } from './minispiele.js';

const MAX = 6;
// Plätze auf dem Rost (lokal in der Feuerschale), nicht dort, wo die alte Wurst liegt (x 0,05 / z 0,08)
const PLAETZE = [[-0.17, -0.1, 0.4], [-0.05, -0.2, -0.2], [0.14, -0.12, 0.9], [-0.2, 0.08, 1.4], [0.2, 0.12, -0.7], [-0.06, 0.22, 0.1]];
// Farbe nach Garzustand (wie im Minispiel)
const FARBE = { roh: 0xde8280, gut: 0x965228, verkohlt: 0x2a1c14 };

export function baueGrillen(c) {
  const { welt, scene, fz, fahrten, hand, kamera, steuerung, ui, z, sag, dennisSagt, aerger, lob, sekunden, warte, handleisteZeigen, klonk,
    gaeste, dennisAnGrill } = c;
  const A = (text, symbol, tun) => ({ text, symbol, tun });
  const grill = fahrten.grill; // Feuerschale (Gruppe)
  const fz2 = fahrten.zustand;
  const alteWurst = grill.userData.alteWurst;
  const ROST_Y = grill.userData.ROST_Y;
  // phase: leer | liegt (rohe Würste drauf) | gegrillt (Gäste dürfen kommen)
  const gz = { phase: 'leer', wuerste: [], glutBis: 0, ergebnis: null, gaesteDa: [], spielt: false };

  // ---------- Glut und Flammen in der Feuerschale (nach dem Anzünden ein paar Minuten) ----------
  // Flammen als weiche, leuchtende Zungen (Sprites mit Verlauf, additiv gemischt), jede flackert und wiegt sich für sich;
  // darunter Glutbett mit Glutstücken, Funken steigen auf, Rauch als weiche Schwaden
  const feuer = new THREE.Group();
  const leinwand = (b, h, malen) => { const c = document.createElement('canvas'); c.width = b; c.height = h; malen(c.getContext('2d'), b, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glutTex = leinwand(256, 256, (g, b, h) => {
    const r = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    const gr = g.createRadialGradient(b / 2, h / 2, 0, b / 2, h / 2, b / 2);
    gr.addColorStop(0, '#ffb04a'); gr.addColorStop(0.55, '#d8501a'); gr.addColorStop(0.85, '#5a2a18'); gr.addColorStop(1, 'rgba(40,30,25,0)');
    g.fillStyle = gr; g.fillRect(0, 0, b, h);
    for (let i = 0; i < 70; i++) { const w = r(i) * 6.28, d = r(i + 50) * b * 0.42; g.fillStyle = i % 3 ? 'rgba(40,20,12,0.55)' : 'rgba(255,220,120,0.8)'; g.beginPath(); g.ellipse(b / 2 + Math.cos(w) * d, h / 2 + Math.sin(w) * d, 4 + r(i + 9) * 10, 3 + r(i + 7) * 7, r(i + 3) * 3, 0, Math.PI * 2); g.fill(); }
  });
  const glutMat = new THREE.MeshBasicMaterial({ map: glutTex, transparent: true, opacity: 0.95, depthWrite: false });
  const glutScheibe = new THREE.Mesh(new THREE.CircleGeometry(0.32, 32), glutMat);
  glutScheibe.rotation.x = -Math.PI / 2; glutScheibe.position.y = 0.215; feuer.add(glutScheibe);
  // Flammenzunge: unten breit und hell, oben spitz, mit weichem Rand und leichtem Knick
  const flammTex = (seed) => leinwand(64, 128, (g, b, h) => {
    const k = Math.sin(seed * 7.1) * 6;
    const pfad = (s) => { g.beginPath(); g.moveTo(b / 2, h * 0.04); g.bezierCurveTo(b * 0.5 + k, h * 0.32, b * (0.5 + 0.42 * s), h * 0.55, b * (0.5 + 0.34 * s), h * 0.82); g.quadraticCurveTo(b / 2, h * 1.0, b * (0.5 - 0.34 * s), h * 0.82); g.bezierCurveTo(b * (0.5 - 0.42 * s), h * 0.55, b * 0.5 + k * 0.5, h * 0.3, b / 2, h * 0.04); };
    g.filter = 'blur(3px)';
    let gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,80,20,0)'); gr.addColorStop(0.35, 'rgba(255,90,20,0.75)'); gr.addColorStop(1, 'rgba(255,140,40,0.9)');
    g.fillStyle = gr; pfad(1); g.fill();
    gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0.3, 'rgba(255,200,60,0)'); gr.addColorStop(0.7, 'rgba(255,215,90,0.9)'); gr.addColorStop(1, 'rgba(255,250,210,1)');
    g.fillStyle = gr; pfad(0.55); g.fill();
  });
  const flammTexe = [flammTex(1), flammTex(2), flammTex(3)];
  const flammen = [];
  for (let i = 0; i < 13; i++) {
    const w = i * 2.4, r = i < 3 ? 0.03 : 0.07 + (i % 4) * 0.045;
    const mat = new THREE.SpriteMaterial({ map: flammTexe[i % 3], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
    const fl = new THREE.Sprite(mat);
    fl.center.set(0.5, 0.02); // wächst vom Boden nach oben
    fl.userData = { x: Math.cos(w) * r, z: Math.sin(w) * r, h: i < 3 ? 0.42 : 0.24 + (i % 3) * 0.06, b: i < 3 ? 0.2 : 0.13, ph: i * 1.7, f: 6 + (i % 5) * 1.3 };
    fl.position.set(fl.userData.x, 0.21, fl.userData.z);
    feuer.add(fl); flammen.push(fl);
  }
  // Funken: kleine helle Punkte, die aufsteigen, seitlich driften und verglühen
  const FUNKEN = 40, funkPos = new Float32Array(FUNKEN * 3), funkDaten = [];
  for (let i = 0; i < FUNKEN; i++) funkDaten.push({ t: Math.random(), x: 0, z: 0, vx: 0, vz: 0 });
  const funkGeo = new THREE.BufferGeometry(); funkGeo.setAttribute('position', new THREE.BufferAttribute(funkPos, 3));
  const funkTex = leinwand(32, 32, (g, b, h) => { const gr = g.createRadialGradient(b / 2, h / 2, 0, b / 2, h / 2, b / 2); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.4, 'rgba(255,190,80,0.9)'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, b, h); });
  const funkMat = new THREE.PointsMaterial({ map: funkTex, color: 0xffffff, size: 0.035, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const funken = new THREE.Points(funkGeo, funkMat); funken.frustumCulled = false; feuer.add(funken);
  // Rauch: weiche graue Schwaden
  const rauchTex = leinwand(64, 64, (g, b, h) => { const gr = g.createRadialGradient(b / 2, h / 2, 0, b / 2, h / 2, b / 2); gr.addColorStop(0, 'rgba(200,200,200,0.8)'); gr.addColorStop(1, 'rgba(200,200,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, b, h); });
  const rauch = [];
  for (let i = 0; i < 10; i++) { const k = new THREE.Sprite(new THREE.SpriteMaterial({ map: rauchTex, transparent: true, depthWrite: false, opacity: 0.3 })); k.userData.t = i / 10; feuer.add(k); rauch.push(k); }
  const rauchMat = rauch[0].material;
  const licht = new THREE.PointLight(0xff8a3a, 0, 4, 1.5); licht.position.y = 0.5; feuer.add(licht);
  feuer.visible = false;
  grill.add(feuer);

  // ---------- Würste auf dem Rost ----------
  function wurstMesh(zustand) {
    const w = wurstModell();
    w.traverse((o) => { if (o.isMesh && o.material && o.material.map) { o.material = o.material.clone(); o.material.color = new THREE.Color(zustand === 'roh' ? 0xffffff : FARBE[zustand]); } });
    w.scale.setScalar(1.05);
    return w;
  }
  function wurstAufRost(zustand = 'roh') {
    if (gz.wuerste.length >= MAX) return false;
    const [x, zz, ry] = PLAETZE[gz.wuerste.length];
    const m = wurstMesh(zustand);
    m.position.set(x, ROST_Y + 0.03, zz); m.rotation.y = ry;
    m.userData.interaktiv = { id: 'grillwurst', name: 'Mettende auf dem Grill', station: null };
    grill.add(m);
    welt.interaktiv?.push(m);
    gz.wuerste.push({ m, zustand });
    return true;
  }
  function wuersteFaerben() {
    gz.wuerste.forEach((w) => w.m.traverse((o) => { if (o.isMesh && o.material?.map) o.material.color = new THREE.Color(w.zustand === 'roh' ? 0xffffff : FARBE[w.zustand]); }));
  }
  function wurstWeg(w) {
    w.m.removeFromParent();
    const i = welt.interaktiv?.indexOf(w.m); if (i >= 0) welt.interaktiv.splice(i, 1);
    gz.wuerste.splice(gz.wuerste.indexOf(w), 1);
  }
  const anzahlIn = (id) => (id === 'mettenden' ? 3 : 1);

  // ---------- Werfen: landet die Wurst auf dem Rost? (hand.js fragt jeden Flugschritt) ----------
  const _g = new THREE.Vector3();
  // vor = Position im Flugschritt davor: wer zwischen zwei Schritten durch die Rost-Ebene fällt, landet auch drauf
  function faengt(p, v, vor) {
    if (fz2.grill !== 'steht') return false;
    grill.getWorldPosition(_g);
    const ry = _g.y + ROST_Y;
    const d = Math.hypot(p.x - _g.x, p.z - _g.z), h = p.y - ry;
    if (d < 0.36 && h > -0.08 && h < 0.5) return true; // etwas großzügig: knapp drüber zählt auch
    if (vor && vor.y > ry && p.y <= ry) {
      const k = (vor.y - ry) / (vor.y - p.y), x = vor.x + (p.x - vor.x) * k, zz = vor.z + (p.z - vor.z) * k;
      if (Math.hypot(x - _g.x, zz - _g.z) < 0.38) return true;
    }
    return d < 1.0 ? 'frei' : false; // über der Schale nicht am Hindernis-Kasten abprallen
  }
  function wurf(id, richtung) {
    let vor = null;
    hand.wirf(richtung, (gid, obj) => {
      klonk(0.25);
      if (Math.hypot(obj.position.x - grill.position.x, obj.position.z - grill.position.z) < 6) {
        ui.hinweis('Daneben. Aufheben und nochmal.', 2400);
        if (Math.random() < 0.6) setTimeout(() => dennisSagt(sag(DENNIS.grillen.daneben), true, { prio: 0 }), 600);
      }
    }, null, (p, v, obj) => {
      const r = faengt(p, v, vor);
      vor = p.clone();
      if (r !== true) return r;
      obj.removeFromParent();
      drauf(id);
      return true;
    });
    handleisteZeigen();
  }
  function drauf(id) {
    const n = anzahlIn(id);
    let ok = 0;
    for (let i = 0; i < n; i++) if (wurstAufRost('roh')) ok++;
    klonk(0.2);
    if (gz.phase === 'leer' || gz.phase === 'gegrillt' && gz.wuerste.every((w) => w.zustand === 'roh')) gz.phase = 'liegt';
    if (gz.phase === 'gegrillt') gz.phase = 'liegt';
    ui.hinweis(ok < n ? `Rost ist voll (${MAX}). Der Rest fällt in die Asche.` : `${gz.wuerste.length} Mettende${gz.wuerste.length > 1 ? 'n' : ''} auf dem Rost. Feuerschale anklicken: grillen.`, 3400);
    if (!gz.draufGesagt) { gz.draufGesagt = true; setTimeout(() => dennisSagt(sag(DENNIS.grillen.drauf), false, { prio: 1 }), 900); }
  }
  // mit der Wurst in der Hand auf die Feuerschale klicken: einfach drauflegen
  function drauflegen() {
    const id = hand.item?.id;
    if (id !== 'mettenden' && id !== 'wurst') return false;
    if (fz2.grill !== 'steht') { ui.hinweis('Die Feuerschale liegt um. Erst wieder aufstellen.', 2600); return true; }
    const obj = hand.weg(); obj?.removeFromParent();
    handleisteZeigen();
    drauf(id);
    return true;
  }

  // ---------- Minispiel ----------
  async function grillen() {
    if (gz.spielt || !gz.wuerste.some((w) => w.zustand === 'roh')) return;
    gz.spielt = true;
    steuerung.sperre(true);
    const roh = gz.wuerste.filter((w) => w.zustand === 'roh');
    const e = await grillSpiel({ anzahl: roh.length });
    nachSpiel(e, roh);
  }
  function nachSpiel(e, roh = gz.wuerste.filter((w) => w.zustand === 'roh')) {
    steuerung.sperre(false);
    gz.spielt = false;
    if (e.abgebrochen) return;
    alteWurst.visible = false;
    feuer.visible = true; gz.glutBis = sekunden() + 240;
    (e.wuerste || []).forEach((r, i) => { const w = roh[i]; if (!w) return; if (r.zustand === 'asche') wurstWeg(w); else w.zustand = r.zustand; });
    wuersteFaerben();
    gz.ergebnis = e;
    gz.phase = gz.wuerste.length ? 'gegrillt' : 'leer';
    const n = (s) => (e.wuerste || []).filter((w) => w.zustand === s).length;
    // Reaktion aufs Anzünden mit Bremsenreiniger (Feuerball = Ärger, Stichflamme = Spaß)
    if (e.anzuenden === 'zuviel') { aerger(3); dennisSagt(sag(DENNIS.grillen.feuerball), true, { prio: 1 }); }
    else if (e.anzuenden === 'gut' && Math.random() < 0.6) dennisSagt(sag(DENNIS.grillen.wusch), false, { prio: 0 });
    setTimeout(() => {
      if (n('asche')) dennisSagt(sag(DENNIS.grillen.asche), true, { prio: 1 });
      if (n('gut') && !n('verkohlt') && !n('roh') && !(e.fehler || []).length) lob(sag(DENNIS.grillen.fertigGut), 5);
      else if (n('verkohlt') >= n('gut') && n('verkohlt')) { aerger(2); dennisSagt(sag(DENNIS.grillen.fertigVerkohlt), true, { prio: 1 }); }
      else if (n('roh') >= n('gut') && n('roh')) dennisSagt(sag(DENNIS.grillen.fertigRoh), true, { prio: 1 });
      else if (n('gut')) lob(sag(DENNIS.grillen.fertigGut), 2);
    }, e.anzuenden === 'zuviel' || e.anzuenden === 'gut' ? 4500 : 900);
    if (gz.phase === 'gegrillt') { gz.gegrilltSeit = sekunden(); gz.rufenAb = sekunden() + 2.5; gz.bedient = new Set(); }
  }

  // ---------- Gäste: wer da ist, kommt schnell rüber und fragt nach einer Mettende ----------
  // Platz rund um die Feuerschale (außerhalb ihres Hindernis-Kastens), Blick zur Schale
  const RUND = [[0, 1.3], [1.2, 0.6], [-1.2, 0.6], [1.15, -0.75], [-1.15, -0.75], [0, -1.25], [0.6, 1.25]];
  async function gaesteRufen() {
    if (!gz.bedient) gz.bedient = new Set();
    const liste = gaeste().filter((g) => g.frei());
    let k = 0;
    for (const g of liste) {
      if (gz.gaesteDa.some((x) => x.g.id === g.id) || gz.bedient.has(g.id)) continue;
      gz.bedient.add(g.id);
      const [dx, dz] = RUND[k++ % RUND.length];
      const eintrag = { g, ziel: { x: grill.position.x + dx, z: grill.position.z + dz }, vorher: g.figur.wurzel.position.clone(), seit: sekunden(), gefragt: false, bekommen: false };
      gz.gaesteDa.push(eintrag);
      g.belegen(true);
      kommt(eintrag, k * 0.7);
    }
  }
  async function kommt(e, verzug) {
    await warte(verzug * 1000);
    const { g } = e;
    await Promise.race([g.gehZu(e.ziel.x, e.ziel.z, 1.7), warte(14000)]);
    if (!gz.gaesteDa.includes(e)) return;
    g.figur.wurzel.rotation.y = Math.atan2(grill.position.x - g.figur.wurzel.position.x, grill.position.z - g.figur.wurzel.position.z);
    e.seit = sekunden(); e.gefragt = true;
    g.sagt(sag(g.texte.frage));
  }
  async function geben(e) {
    if (e.bekommen) return;
    const best = ['gut', 'verkohlt', 'roh'].map((s) => gz.wuerste.find((w) => w.zustand === s)).find(Boolean);
    e.bekommen = true;
    if (!best) { e.g.sagt(sag(e.g.texte.keine)); return gehtWeg(e); }
    const zustand = best.zustand;
    wurstWeg(best);
    klonk(0.1);
    if (e.g.id !== 'dennis' || zustand !== 'gut') e.g.sagt(sag(e.g.texte[zustand]));
    if (e.g.id === 'dennis') {
      if (zustand === 'gut') lob(sag(DENNIS.grillen.bekommtGut), 6);
      else if (zustand === 'roh') aerger(4);
      else aerger(1);
    } else if (zustand === 'gut') z.wut = Math.max(0, z.wut - 1);
    if (!gz.wuerste.length) gz.phase = 'leer';
    await warte(3500);
    gehtWeg(e);
  }
  async function gehtWeg(e) {
    const i = gz.gaesteDa.indexOf(e); if (i >= 0) gz.gaesteDa.splice(i, 1);
    await Promise.race([e.g.zurueck(e.vorher), warte(14000)]);
    e.g.belegen(false);
  }

  // ---------- jedes Bild ----------
  let zeit = 0;
  function update(dt) {
    zeit += dt;
    const t = sekunden();
    // Feuer flackert, Rauch steigt; nach 4 min nur noch Glut, dann aus
    if (feuer.visible) {
      const rest = gz.glutBis - t;
      const stark = Math.max(0, Math.min(1, rest / 120));
      flammen.forEach((fl) => {
        const u = fl.userData;
        // Flackern aus zwei Frequenzen und etwas Zufall, die Zunge wiegt sich seitlich
        const fla = 0.75 + 0.18 * Math.sin(zeit * u.f + u.ph) + 0.1 * Math.sin(zeit * u.f * 2.3 + u.ph * 3) + (Math.random() - 0.5) * 0.08;
        fl.scale.set(u.b * stark * (0.9 + 0.1 * Math.sin(zeit * 5 + u.ph)), u.h * stark * fla, 1);
        fl.position.set(u.x + Math.sin(zeit * 2.1 + u.ph) * 0.015, 0.205, u.z + Math.cos(zeit * 1.7 + u.ph) * 0.015);
        fl.material.rotation = Math.sin(zeit * 3 + u.ph) * 0.12;
        fl.material.opacity = 0.65 + 0.3 * fla * stark;
        fl.visible = stark > 0.05;
      });
      funkDaten.forEach((d, i) => {
        d.t += dt * (0.5 + (i % 5) * 0.12);
        if (d.t > 1) { d.t = 0; d.x = (Math.random() - 0.5) * 0.3; d.z = (Math.random() - 0.5) * 0.3; d.vx = (Math.random() - 0.5) * 0.25; d.vz = (Math.random() - 0.5) * 0.25; }
        funkPos[i * 3] = d.x + d.vx * d.t + Math.sin(zeit * 4 + i) * 0.02; funkPos[i * 3 + 1] = 0.25 + d.t * (0.6 + stark * 0.8); funkPos[i * 3 + 2] = d.z + d.vz * d.t;
      });
      funkGeo.attributes.position.needsUpdate = true;
      funkMat.opacity = 0.9 * Math.max(0.2, stark);
      glutMat.opacity = Math.min(1, 0.55 + 0.4 * Math.max(0, Math.min(1, rest / 240)) + Math.sin(zeit * 3) * 0.05);
      glutMat.color.setRGB(1, 0.85 + Math.sin(zeit * 2.3) * 0.1, 0.8);
      licht.intensity = (0.6 + Math.sin(zeit * 11) * 0.15) * Math.max(0.15, stark) * 3;
      rauch.forEach((k, i) => { k.userData.t = (k.userData.t + dt * 0.22) % 1; const u = k.userData.t; k.position.set(Math.sin(u * 5 + i) * 0.15, 0.75 + u * 1.8, Math.cos(u * 4 + i) * 0.15); k.scale.setScalar(0.25 + u * 0.9); k.material.opacity = 0.32 * Math.sin(u * Math.PI); });
      if (rest <= 0) feuer.visible = false;
    }
    // Grill umgefahren: alles in der Asche
    if (fz2.grill === 'um' && gz.wuerste.length) {
      while (gz.wuerste.length) wurstWeg(gz.wuerste[0]);
      gz.phase = 'leer'; feuer.visible = false;
      setTimeout(() => dennisSagt(sag(DENNIS.grillen.asche), true, { prio: 1 }), 1200);
    }
    // wer in den ersten 2 Minuten nach dem Grillen da und frei ist, kommt rüber (alle 4 s nachsehen)
    if (gz.phase === 'gegrillt' && t - gz.gegrilltSeit < 120 && t > gz.rufenAb) { gz.rufenAb = t + 4; gaesteRufen(); }
    // Gäste warten höchstens 40 s auf eine Mettende
    // (zu lange gewartet: geht still wieder; „keine“ sagt nur, wer wirklich leer ausgeht)
    for (const e of [...gz.gaesteDa]) if (e.gefragt && !e.bekommen && t - e.seit > 40) { e.bekommen = true; if (!gz.wuerste.length) e.g.sagt(sag(e.g.texte.keine)); gehtWeg(e); }
  }

  // ---------- Menü ----------
  function menue(id, obj) {
    const gast = gz.gaesteDa.find((e) => e.g.id === id && e.gefragt && !e.bekommen);
    if (gast) {
      const name = gast.g.name;
      return [name, gz.wuerste.length ? `Will eine Mettende vom Grill. Noch ${gz.wuerste.length} auf dem Rost.` : 'Will eine Mettende, aber der Rost ist leer.', [A(gz.wuerste.length ? 'Mettende geben' : 'Sorry, alle weg', 'hand', () => geben(gast))]];
    }
    if (id === 'grillwurst') {
      const w = gz.wuerste.find((q) => { for (let o = obj; o; o = o.parent) if (o === q.m) return true; return false; });
      const text = { roh: 'Roh. Feuerschale anklicken: grillen.', gut: 'Schön braun gegrillt.', verkohlt: 'Schwarz. Eher Holzkohle als Wurst.' }[w?.zustand] || '';
      return ['Mettende auf dem Grill', text, []];
    }
    if (id === 'feuerschale' && fz2.grill === 'steht') {
      const roh = gz.wuerste.filter((w) => w.zustand === 'roh').length;
      const a = [];
      if (hand.item?.id === 'mettenden' || hand.item?.id === 'wurst') a.push(A('Auf den Rost legen', 'hand', drauflegen));
      if (roh) a.push(A(`Grillen (${roh} Mettende${roh > 1 ? 'n' : ''})`, 'hand', grillen));
      const text = feuer.visible ? `Glüht noch. Auf dem Rost: ${gz.wuerste.length || 'nichts mehr'}.`
        : roh ? `${roh} rohe Mettende${roh > 1 ? 'n' : ''} auf dem Rost. Anzünden und grillen!`
          : 'Kalte Asche, oben auf dem Rost eine schwarze, uralte Bratwurst. Mettenden aus dem Hofladen draufwerfen und grillen!';
      return ['Feuerschale', text, a];
    }
    return null;
  }

  // ---------- Test ----------
  function zuruecksetzen() {
    for (const e of [...gz.gaesteDa]) { gz.gaesteDa.splice(gz.gaesteDa.indexOf(e), 1); e.g.belegen(false); }
    while (gz.wuerste.length) wurstWeg(gz.wuerste[0]);
    alteWurst.visible = true; feuer.visible = false;
    Object.assign(gz, { phase: 'leer', ergebnis: null, spielt: false, draufGesagt: false, bedient: new Set(), gegrilltSeit: -1e9 });
  }
  function testDrauf(n = 3) { zuruecksetzen(); for (let i = 0; i < n; i++) wurstAufRost('roh'); gz.phase = 'liegt'; }
  function testFertig(zustaende = ['gut', 'gut', 'verkohlt']) {
    testDrauf(zustaende.length);
    nachSpiel({ abgebrochen: false, wuerste: zustaende.map((s) => ({ zustand: s })), fehler: [], glut: 0.75 });
  }

  return { gz, update, menue, wurf, drauflegen, grillen, faengt, istWurst: (id) => id === 'mettenden' || id === 'wurst',
    test: { zuruecksetzen, testDrauf, testFertig, nachSpiel, gaesteRufen } };
}
