// Paket E3: Metall-Lieferung.
// Eisen Meyer hat sechs Meter lange Stangen oben am Feldweg neben der Hauptstraße abgeladen. Jonas (weiße Augenklappe, hat
// ohne Brille geflext) sagt Bescheid und bittet, das Eisen zu holen. Man braucht den Weidemann und einen Schlupf (schlupf.js,
// neu aus dem Regal oder alt von der Wand): Schlupf vorne an die Gabel hängen, hinfahren, über den Stangen die Gabel bewegen
// = Minispiel „Stangen ankoppeln“ (Mitte treffen). Das Bündel hängt dann quer unter der Gabel (6 m breit, dreht sich weg, wenn
// ein Ende irgendwo anstößt). Vor dem blauen Container hinter der Werkstatt: B = Minispiel „Stahl einsortieren“.
// Alter Schlupf: reißt, sobald man an der Werkstatt ankommt (schlupf.reisst), Stangen fallen, Dennis rastet aus. Dann geht es
// nur mit dem neuen weiter, und Dennis ist am Ende nicht mehr happy. Kein Zeitlimit; Jonas und Dennis fragen ab und zu nach.
import * as THREE from 'three';
import { toon, teil, quader, zylinder, setze, leinwandTextur } from './toon.js';
import { CONTAINER } from './platzhinten.js';
import { inHindernis } from './draussen.js';
import { gelaendeHoehe, FELDWEG } from './landschaft.js';
import { DENNIS, JONAS } from './texte.js';
import { ankoppelSpiel, einsortierSpiel } from './minispiele.js';
import { LADER_HILFE } from './fahrten.js';

// Lieferplatz: neben dem Feldweg kurz vor der Hauptstraße, Stangen liegen längs zum Weg (entlang x)
export const LIEFERPLATZ = { x: FELDWEG[FELDWEG.length - 2].x + 3.5, z: FELDWEG[FELDWEG.length - 2].z + 6.7 };
const LANG = 6.0, HALB = LANG / 2;
const SCHLINGE = 0.62; // Zinken bis Bündelmitte (m)
const GABEL_PUNKT = new THREE.Vector3(-0.2, -0.372, 0.6); // im Gabelträger: oben auf der linken Zinke (da hängt der Schlupf drüber)
const WERKSTATT_NAH = 15; // m um die Werkstatt: hier reißt der alte Schlupf

export function baueMetall(c) {
  const { welt, scene, fz, fahrten, kumpels, pritsche, hand, kamera, steuerung, ui, z, sag, dennisSagt, aerger, lob, fehler, sekunden, warte,
    reinkommen, rausgehen, ruhigeLage, handleisteZeigen, klonk, blip } = c;
  const A = (text, symbol, tun) => ({ text, symbol, tun });
  const jonas = kumpels.alle.jonas;
  const lader = fz.lader;
  const fz2 = fahrten.zustand;
  // phase: aus → jonasKommt → wartet (Jonas hat Bescheid gesagt) → offen (Auftrag angenommen) → fertig
  // stangen: liegt (am Boden: Lieferplatz oder wo sie runtergefallen sind) | haengt (am Schlupf unter der Gabel) | drin (Container)
  const mz = { phase: 'aus', stangen: 'weg', naechsterBesuch: 300 + Math.random() * 240, pannen: 0, anstoesse: 0, gier: 0, schief: false, versatz: 0,
    pendel: 0, pendelV: 0, schnellSeit: 0, gerissen: false, jonasDa: false, nachfrageAb: 0, dennisAb: 0, lauf: 0, schleifHinweis: 0, festHinweis: 0, kontakt: false };
  let anGabel = null; // der Schlupf, der gerade vorne an der Gabel hängt

  // ---------- Jonas: weiße Augenklappe (einfach, später austauschbar: jonas.augenklappe) ----------
  const klappe = new THREE.Group();
  {
    const WEISS = 0xf6f6f2;
    const pad = teil(new THREE.SphereGeometry(0.05, 14, 10), WEISS, { umriss: 0.003 });
    pad.scale.set(1, 0.82, 0.45); pad.position.set(0.062, 0.15, 0.15);
    klappe.add(pad);
    // Band schräg um den Kopf (über die Stirn, hinten tiefer)
    const band = new THREE.Group();
    band.add(setze(teil(new THREE.TorusGeometry(0.166, 0.008, 5, 30), WEISS, { umriss: false }), 0, 0, 0, Math.PI / 2, 0, 0));
    band.position.set(0, 0.165, 0); band.rotation.set(0.12, 0, -0.16);
    klappe.add(band);
    klappe.visible = false;
    jonas._test.kopf().add(klappe);
    jonas.augenklappe = klappe;
  }

  // ---------- Stangenbündel ----------
  const STAHL = { traeger: 0x6e6a64, vierkant: 0x7c7670, rund: 0x8a8680, flach: 0x5e5a56, winkel: 0x8a5a3a };
  function stange(typ, l) {
    const g = new THREE.Group(), f = STAHL[typ];
    if (typ === 'traeger') {
      g.add(setze(quader(l, 0.012, 0.1, f, { umriss: 0.002 }), 0, -0.064, 0)); g.add(setze(quader(l, 0.012, 0.1, f, { umriss: 0.002 }), 0, 0.064, 0));
      g.add(setze(quader(l, 0.12, 0.01, f, { umriss: false }), 0, 0, 0));
    } else if (typ === 'vierkant') g.add(quader(l, 0.08, 0.08, f, { umriss: 0.002 }));
    else if (typ === 'rund') g.add(setze(zylinder(0.04, 0.04, l, f, { umriss: 0.002 }, 10), 0, 0, 0, 0, 0, Math.PI / 2));
    else if (typ === 'flach') g.add(quader(l, 0.014, 0.07, f, { umriss: 0.0015 }));
    else { g.add(setze(quader(l, 0.01, 0.06, f, { umriss: 0.0015 }), 0, -0.025, 0)); g.add(setze(quader(l, 0.06, 0.01, f, { umriss: 0.0015 }), 0, 0, -0.025)); }
    return g;
  }
  // Lage im Bündel (Ruhe) – beim Runterfallen werden die Stangen einzeln verstreut
  const BUENDEL = [['traeger', 6.0, 0, -0.06, -0.13], ['traeger', 6.0, 0.05, -0.06, 0.0], ['vierkant', 5.2, 0.4, -0.08, 0.13], ['vierkant', 6.0, 0, 0.045, -0.1],
    ['rund', 4.4, 0.8, 0.045, 0.0], ['flach', 5.6, 0.2, 0.015, 0.11], ['winkel', 4.8, 0.6, 0.06, 0.11], ['flach', 6.0, 0, 0.105, -0.04]];
  const buendel = new THREE.Group();
  const stangen = BUENDEL.map(([typ, l, o, y, zz]) => { const s = stange(typ, l); s.userData.ruhe = new THREE.Vector3(o * 0.5, y, zz); s.position.copy(s.userData.ruhe); buendel.add(s); return s; });
  // zwei Stahlbänder und der Lieferschein-Anhänger
  const baender = new THREE.Group();
  {
    // Stahlband: dünnes, flaches Band eng ums Bündel (abgerundetes Rechteck um den Querschnitt), oben eine Verschlusshülse
    const Y0 = -0.135, Y1 = 0.145, Z0 = -0.175, Z1 = 0.175, R = 0.03;
    const ecke = (cy, cz, w0) => Array.from({ length: 5 }, (_, i) => { const w = w0 + (i / 4) * Math.PI / 2; return new THREE.Vector3(0, cy + Math.sin(w) * R, cz + Math.cos(w) * R); });
    const pfad = [...ecke(Y1 - R, Z1 - R, 0), ...ecke(Y1 - R, Z0 + R, Math.PI / 2), ...ecke(Y0 + R, Z0 + R, Math.PI), ...ecke(Y0 + R, Z1 - R, Math.PI * 1.5)];
    const kurve = new THREE.CatmullRomCurve3(pfad, true, 'catmullrom', 0.1);
    const bandMat = toon(0x34373c);
    for (const x of [-1.9, 1.9]) {
      const geo = new THREE.TubeGeometry(kurve, 64, 0.004, 4, true);
      const m = new THREE.Mesh(geo, bandMat); m.scale.set(4.5, 1, 1); m.position.x = x; // flach: 3,5 cm breit, 4 mm dick
      baender.add(m);
      baender.add(setze(quader(0.05, 0.012, 0.045, 0x55595e, { umriss: 0.001 }), x, Y1 + 0.004, 0.06)); // Verschlusshülse
      baender.add(setze(quader(0.004, 0.008, 0.03, 0x22252a, { umriss: false }), x + 0.012, Y1 + 0.01, 0.06)); // Prägung
    }
  }
  const anh = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: leinwandTextur(256, 150, (g, b, h) => {
    g.fillStyle = '#f4f0e0'; g.fillRect(0, 0, b, h); g.strokeStyle = '#1d1d1f'; g.lineWidth = 6; g.strokeRect(4, 4, b - 8, h - 8);
    g.textAlign = 'center';
    const zeile = (t, y, px, fett, farbe) => { let f = px; do { g.font = `${fett ? 'bold ' : ''}${f}px Arial`; f -= 1; } while (g.measureText(t).width > b - 34 && f > 10); g.fillStyle = farbe; g.fillText(t, b / 2, y); };
    zeile('EISEN MEYER', 54, 40, true, '#b3241c');
    zeile('Lieferung für Dennis', 92, 22, true, '#1d1d1f');
    zeile('8 Stangen à 6 m', 124, 20, false, '#1d1d1f');
    g.fillStyle = '#8a8f96'; g.beginPath(); g.arc(22, 22, 7, 0, Math.PI * 2); g.fill(); // Loch für den Draht
  }) }));
  anh.position.set(-2.35, 0.02, 0.19); anh.rotation.y = 0; anh.rotation.x = -0.25;
  baender.add(anh);
  buendel.add(baender);
  buendel.userData.interaktiv = { id: 'metallBuendel', name: 'Stahl von Eisen Meyer', station: null };
  buendel.visible = false;
  scene.add(buendel);
  welt.interaktiv?.push(buendel);
  // Kanthölzer am Lieferplatz
  const hoelzer = new THREE.Group();
  for (const x of [-2.2, 0, 2.2]) hoelzer.add(setze(quader(0.1, 0.1, 0.9, 0xb08a52, { umriss: 0.003 }), x, 0.05, 0));
  hoelzer.position.set(LIEFERPLATZ.x, gelaendeHoehe(LIEFERPLATZ.x, LIEFERPLATZ.z), LIEFERPLATZ.z);
  hoelzer.visible = false;
  scene.add(hoelzer);
  // (kein Zusatzteil an der Gabel: der Schlupf hängt einfach über der linken Zinke)
  const traverse = { visible: false };
  // gelieferte Stangen im Container (erst nach dem Einsortieren sichtbar): vorn auf den Armen des Kragarmregals
  const geliefert = new THREE.Group();
  {
    const K = CONTAINER, cx = (K.xMin + K.xMax) / 2, cz = (K.zMin + K.zMax) / 2, T = K.zMax - K.zMin;
    const KZ = T / 2 - 0.12 - 0.5 - 0.12, B0 = 0.165, vorn = cz + KZ - 0.74;
    const leg = (typ, y, dz, l = 5.8) => { const s = stange(typ, l); s.position.set(cx, B0 + y, vorn + dz); geliefert.add(s); };
    leg('traeger', 0.55 + 0.27, 0.06); leg('traeger', 0.55 + 0.27, 0.2);
    leg('vierkant', 1.05 + 0.24, 0.05); leg('rund', 1.05 + 0.24, 0.16); leg('vierkant', 1.05 + 0.24, 0.27);
    leg('flach', 1.55 + 0.09, 0.05); leg('winkel', 1.55 + 0.12, 0.15); leg('flach', 1.55 + 0.09, 0.25);
    geliefert.visible = false;
    scene.add(geliefert);
  }
  // grüne Markierungen: am Lieferplatz und vor dem Container
  const markMat = toon(0x4cdc5a, { transparent: true, opacity: 0.35, depthWrite: false, emissive: 0x2a8a30 });
  const platzMarke = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.9, 44), markMat);
  platzMarke.rotation.x = -Math.PI / 2; platzMarke.visible = false; scene.add(platzMarke);
  const ABLADE = { x: (CONTAINER.xMin + CONTAINER.xMax) / 2, z: CONTAINER.zMin - 1.5 };
  const abladeMarke = new THREE.Mesh(new THREE.PlaneGeometry(6.3, 2.4), markMat);
  abladeMarke.rotation.x = -Math.PI / 2; abladeMarke.position.set(ABLADE.x, 0.03, ABLADE.z); abladeMarke.visible = false; scene.add(abladeMarke);

  // ---------- Hilfen ----------
  const heading = () => lader.psi + (lader.knick || 0);
  const gabelPunkt = () => { lader.g.updateMatrixWorld(true); return lader.gabel.localToWorld(GABEL_PUNKT.clone()); };
  const norm = (w) => Math.atan2(Math.sin(w), Math.cos(w));
  const pritscheFrei = () => pritsche.pz.phase === 'aus' || pritsche.pz.phase === 'fertig';
  function hilfe(extra) { if (fz2.aktiv === lader) ui.fahrHilfe(extra ? `${LADER_HILFE} · ${extra}` : LADER_HILFE); }
  function buendelAmBoden(x, zz, ry, verstreut = false) {
    buendel.position.set(x, gelaendeHoehe(x, zz) + (verstreut ? 0.09 : 0.24), zz);
    buendel.rotation.set(0, ry, 0);
    baender.visible = !verstreut;
    stangen.forEach((s, i) => {
      if (!verstreut) { s.position.copy(s.userData.ruhe); s.rotation.set(0, 0, 0); return; }
      // kreuz und quer gefallen
      const r = ((i * 7919) % 13) / 13 - 0.5, q = ((i * 104729) % 17) / 17 - 0.5;
      s.position.set(r * 0.9, i < 4 ? 0 : 0.05, (i - 3.5) * 0.26 + q * 0.1);
      s.rotation.set(0, r * 0.5, 0);
    });
    buendel.visible = true;
    mz.stangen = 'liegt';
    platzMarke.position.set(x, gelaendeHoehe(x, zz) + 0.04, zz);
  }
  // hängt der Schlupf an der Gabel, wird er so lang gezogen, wie Platz bis zum Boden ist
  function schlupfAnGabel(sl) {
    if (hand.item?.obj === sl.obj) { hand.weg(); handleisteZeigen(); }
    sl.aufFahrzeug(lader.gabel, GABEL_PUNKT.clone(), new THREE.Euler(0, 0, 0), 0.7); // Schlaufe quer zur Zinke, oben drüber gelegt
    sl.obj.scale.x = 2.4; // breiter: liegt richtig über der Zinke (8 cm) und hängt beidseitig runter
    anGabel = sl;
    traverse.visible = true;
    klonk(0.2);
  }
  function schlupfAbnehmen() {
    if (!anGabel || mz.stangen === 'haengt') return;
    if (hand.item) { ui.hinweis(`Du hast schon ${hand.item.cfg.name} in der Hand.`, 2400); return; }
    const sl = anGabel;
    anGabel = null; traverse.visible = false;
    pritsche.nimmSchlupf(sl);
  }

  // ---------- Jonas ----------
  async function jonasKommt() {
    if (mz.phase !== 'aus') return false;
    if (c.sd && c.sd.id === 'jonas' && c.sd.kumpelDa) return false;
    mz.phase = 'jonasKommt';
    const lauf = ++mz.lauf;
    Object.assign(mz, { pannen: 0, anstoesse: 0, gerissen: false, schief: false });
    klappe.visible = true; mz.jonasDa = true;
    lader.gesperrt = true;
    hoelzer.visible = true;
    geliefert.visible = false;
    buendelAmBoden(LIEFERPLATZ.x, LIEFERPLATZ.z, 0);
    await reinkommen(jonas, 'feldweg');
    await Promise.race([jonas.gehZu(-1.9, 1.5, 1.1), warte(8000)]);
    if (lauf !== mz.lauf || mz.phase !== 'jonasKommt') return false;
    jonas.dreheZu(kamera.position);
    ui.jonasSagt(sag(JONAS.hallo), 5200);
    setTimeout(() => { if (lauf === mz.lauf) dennisSagt(sag(DENNIS.metall.jonas), true, { prio: 1 }); }, 5400);
    mz.phase = 'wartet';
    mz.nachfrageAb = sekunden() + 70;
    mz.dennisAb = sekunden() + 150 + Math.random() * 60;
    return true;
  }
  function annehmen() {
    if (mz.phase !== 'wartet') return;
    mz.phase = 'offen';
    ui.jonasSagt(JONAS.bitte[0], 4000);
    setTimeout(() => ui.jonasSagt(JONAS.bitte[1], 4600), 4200);
    setTimeout(() => ui.jonasSagt(JONAS.tipp[0], 5200), 9000);
    mz.nachfrageAb = sekunden() + 110 + Math.random() * 50;
    platzMarke.visible = true;
  }

  // ---------- Ankoppeln (am Bündel: Gabel bewegen oder B) ----------
  // steht der Weidemann so, dass die Gabel über den Stangen ist?
  function ueberStangen() {
    if (mz.stangen !== 'liegt' || !buendel.visible) return false;
    const g = gabelPunkt(), ry = buendel.rotation.y;
    const dx = g.x - buendel.position.x, dz = g.z - buendel.position.z;
    const laengs = dx * Math.cos(ry) - dz * Math.sin(ry), quer = dx * Math.sin(ry) + dz * Math.cos(ry);
    const winkel = Math.abs(Math.sin(heading() - ry)); // 1 = Weidemann fährt längs zu den Stangen (falsch), 0 = quer dazu
    return Math.abs(laengs) < 2.4 && Math.abs(quer) < 1.5 && winkel < 0.75;
  }
  async function ankoppeln() {
    if (mz.stangen !== 'liegt' || mz.spielt) return;
    if (!anGabel) { ui.hinweis('Ohne Schlupf an der Gabel kriegst du die Stangen nicht hoch.', 3000); return; }
    mz.spielt = true;
    fz2.pause = true; steuerung.sperre(true);
    const e = await ankoppelSpiel({ alt: anGabel.variante === 'alt' });
    nachAnkoppeln(e);
  }
  function nachAnkoppeln(e) {
    steuerung.sperre(false); fz2.pause = false; mz.spielt = false;
    if (e.abgebrochen) { hilfe('R/F: Stangen ankoppeln'); return; }
    if (mz.phase === 'wartet') mz.phase = 'offen';
    mz.schief = !!e.schief; mz.versatz = e.versatz || 0;
    // Gabel so hoch, dass das Bündel frei hängt
    for (let i = 0; i < 80 && gabelPunkt().y - gelaendeHoehe(lader.x, lader.z) < 1.15; i++) { lader.phi += 0.02; fz.anwenden(lader, 0); }
    mz.gier = norm(buendel.rotation.y - heading());
    if (mz.gier > Math.PI / 2) mz.gier -= Math.PI; else if (mz.gier < -Math.PI / 2) mz.gier += Math.PI;
    mz.stangen = 'haengt'; mz.pendel = 0; mz.pendelV = 0; mz.schnellSeit = 0;
    baender.visible = true;
    stangen.forEach((s) => { s.position.copy(s.userData.ruhe); s.rotation.set(0, 0, 0); });
    lader.schleppt = true;
    platzMarke.visible = false; abladeMarke.visible = true;
    klonk(0.4);
    haengen(0);
    hilfe('Vorsichtig zum Container hinter der Werkstatt (grün)');
    ui.hinweis(mz.schief ? 'Hängt schief. Langsam fahren, sonst rutscht das Bündel raus.' : 'Die Stangen hängen quer unter der Gabel: 6 m breit, langsam fahren.', 4200);
  }

  // ---------- Bündel hängt unter der Gabel ----------
  // Punkte entlang der Stangen (Welt), für Zusammenstöße
  const PROBEN = [-HALB, -2.2, -1.4, -0.7, 0.7, 1.4, 2.2, HALB];
  function stoesst(mx, mzz, ry) {
    const co = Math.cos(ry), si = Math.sin(ry);
    for (const s of PROBEN) {
      const px = mx + s * co, pz = mzz - s * si;
      if (!welt.draussen.fahrbar(px, pz)) return true;
      for (const h of welt.hindernisse) {
        if (h === lader.hindernis || h.niedrig || h.ohneFahrzeug || fz.paletten.some((q) => q.userData.hindernis === h)) continue;
        if (inHindernis(h, px, pz)) return true;
      }
    }
    return false;
  }
  function haengen(dt) {
    const g = gabelPunkt(), boden = gelaendeHoehe(g.x, g.z);
    const y = Math.max(boden + 0.2, g.y - SCHLINGE);
    buendel.position.set(g.x, y, g.z);
    // schief angekoppelt: hängt dauerhaft etwas schräg; dazu pendelt es beim Anfahren und Bremsen
    const neigung = THREE.MathUtils.clamp(mz.versatz * 0.9, -0.3, 0.3) + mz.pendel;
    const frei = Math.asin(Math.min(1, Math.max(0, (y - boden - 0.08)) / HALB));
    buendel.rotation.set(0, heading() + mz.gier, THREE.MathUtils.clamp(neigung, -frei, frei), 'YXZ');
    if (anGabel) anGabel.obj.scale.y = THREE.MathUtils.clamp((g.y - y + 0.2) / 0.8, 0.12, 1.1);
    return { g, y, boden, schleift: g.y - SCHLINGE < boden + 0.2 };
  }
  function schlupfFrei() {
    // ohne Last: Schlupf hängt runter, soweit Platz ist
    if (!anGabel || mz.stangen === 'haengt') return;
    const g = gabelPunkt(), boden = gelaendeHoehe(g.x, g.z);
    anGabel.obj.scale.y = THREE.MathUtils.clamp((g.y - boden - 0.03) / 0.8, 0.1, 0.75);
  }
  // Stangen fallen runter (Schlupf gerissen oder schief rausgerutscht)
  function fallen(grund) {
    const p = buendel.position.clone(), ry = buendel.rotation.y;
    buendelAmBoden(p.x, p.z, ry, true);
    lader.schleppt = false;
    abladeMarke.visible = false; platzMarke.visible = true;
    mz.pannen++;
    klonk(1); setTimeout(() => klonk(0.8), 180); setTimeout(() => klonk(0.6), 420);
    if (grund === 'riss') {
      mz.gerissen = true;
      const sl = anGabel;
      anGabel = null; traverse.visible = false;
      // der gerissene Schlupf liegt bei den Stangen (nicht mehr zu gebrauchen)
      sl.loesen(); scene.add(sl.obj);
      sl.obj.position.set(p.x + Math.sin(ry) * 0.9, gelaendeHoehe(p.x, p.z) + 0.03, p.z + Math.cos(ry) * 0.9);
      sl.obj.rotation.set(Math.PI / 2, 0, 0.7); sl.obj.scale.set(1, 0.45, 1);
      sl.zustand = 'gerissen';
      sl.obj.userData.interaktiv.name = 'Gerissener Schlupf';
      fz2.pause = true;
      lader.v = 0;
      Promise.resolve(fehler('metallGefallen')).then(() => {
        fz2.pause = false;
        if (mz.jonasDa) ui.jonasSagt(sag(JONAS.gerissen), 4200);
        setTimeout(() => ui.hinweis('Der alte Schlupf ist hin. Hol den neuen aus dem Regal und koppel die Stangen neu an.', 5000), 1500);
        hilfe('');
      });
    } else {
      aerger(3);
      ui.hinweis('Das Bündel hing schief und ist rausgerutscht. Neu ankoppeln (über die Stangen fahren, Gabel bewegen).', 4800);
      if (Math.hypot(lader.x, lader.z) < 60) setTimeout(() => dennisSagt(sag(DENNIS.metall.gerutscht), true, { prio: 1 }), 900);
      hilfe('R/F: Stangen ankoppeln');
    }
  }
  function imAbladePlatz() {
    const p = buendel.position;
    return mz.stangen === 'haengt' && Math.abs(p.x - ABLADE.x) < 0.9 && p.z < CONTAINER.zMin - 0.25 && p.z > CONTAINER.zMin - 3.0 && Math.abs(Math.sin(buendel.rotation.y)) < 0.3;
  }
  async function abladen() {
    if (!imAbladePlatz() || mz.spielt) return;
    mz.spielt = true;
    fz2.pause = true; steuerung.sperre(true);
    const e = await einsortierSpiel({ alt: anGabel?.variante === 'alt' });
    nachAbladen(e);
  }
  function nachAbladen(e) {
    steuerung.sperre(false); fz2.pause = false; mz.spielt = false;
    if (e.abgebrochen) { hilfe('B: Stahl einsortieren'); return; }
    mz.stangen = 'drin'; mz.phase = 'fertig';
    buendel.visible = false; geliefert.visible = true; abladeMarke.visible = false;
    lader.schleppt = false; lader.gesperrt = false;
    hilfe('');
    klonk(0.4);
    // Dennis: happy nur, wenn alles ohne Panne lief (neuer Schlupf, nichts gefallen, sauber einsortiert)
    const falsch = e.falsch || 0, klongs = e.klong || 0;
    setTimeout(() => {
      if (mz.pannen === 0 && falsch === 0 && klongs <= 1) lob(sag(DENNIS.metall.fertigGut), 8);
      else if (falsch > 0) { aerger(2); dennisSagt(sag(DENNIS.metall.falschSortiert), true, { prio: 1 }); }
      else dennisSagt(sag(DENNIS.metall.fertigNaja), true, { prio: 1 });
    }, 1800);
    setTimeout(() => {
      if (!mz.jonasDa) return;
      ui.jonasSagt(sag(JONAS.danke), 4500);
      setTimeout(async () => { await rausgehen(jonas, 'feldweg'); mz.jonasDa = false; klappe.visible = false; }, 5000);
    }, 6500);
  }

  // ---------- nach jedem Fahrschritt (fahrten.js) ----------
  const vorherNach = fz2.nachSchritt;
  fz2.nachSchritt = (f, neu, pose, dt) => {
    if (vorherNach) vorherNach(f, neu, pose, dt);
    if (f !== lader || mz.spielt) return;
    if (mz.stangen === 'liegt' && anGabel && ueberStangen()) {
      if (neu.has('r') || neu.has('f') || neu.has('b')) { ankoppeln(); return; }
    }
    if (mz.stangen !== 'haengt') return;
    if (neu.has('b')) { if (imAbladePlatz()) { abladen(); return; } ui.hinweis('Noch nicht vor dem Container (grüne Fläche, Stangen längs zum Container).', 2400); }
    // pendeln: Beschleunigung in Fahrtrichtung
    if (dt > 0) {
      const a = (f.v - pose.v) / dt;
      mz.pendelV += (-a * 0.012 - mz.pendel * 14 - mz.pendelV * 1.6) * dt;
      mz.pendel = THREE.MathUtils.clamp(mz.pendel + mz.pendelV * dt, -0.12, 0.12);
    }
    let h = haengen(dt);
    // Stangen stoßen irgendwo an: sie drehen sich weg (bis ca. 70°), sonst steht der Weidemann
    if (stoesst(h.g.x, h.g.z, heading() + mz.gier)) {
      let frei = null;
      for (let k = 1; k <= 5 && frei === null; k++) for (const r of [1, -1]) {
        const w = mz.gier + r * k * 0.035;
        if (Math.abs(w) < 1.25 && !stoesst(h.g.x, h.g.z, heading() + w)) { frei = w; break; }
      }
      if (!mz.kontakt) {
        mz.kontakt = true; mz.anstoesse++;
        klonk(Math.min(0.9, 0.3 + Math.abs(pose.v) * 0.25));
        if (Math.abs(pose.v) > 1.1 && sekunden() > (mz.anstossAb || 0)) { mz.anstossAb = sekunden() + 30; aerger(1); setTimeout(() => dennisSagt(sag(DENNIS.metall.anstoss), true, { prio: 1 }), 500); }
      }
      if (frei !== null) mz.gier = frei;
      else {
        Object.assign(lader, { x: pose.x, z: pose.z, psi: pose.psi, knick: pose.knick, v: 0 }); fz.anwenden(lader, 0);
        if (sekunden() > mz.festHinweis) { mz.festHinweis = sekunden() + 4; ui.hinweis('Die Stangen hängen fest (6 m breit). Zurücksetzen und anders anfahren.', 2600); }
      }
      h = haengen(0);
    } else {
      mz.kontakt = false;
      // frei: dreht langsam wieder quer zur Fahrtrichtung
      if (Math.abs(mz.gier) > 0.002) {
        const w = mz.gier - Math.sign(mz.gier) * Math.min(Math.abs(mz.gier), 0.35 * dt);
        if (!stoesst(h.g.x, h.g.z, heading() + w)) { mz.gier = w; h = haengen(0); }
      }
    }
    // schleift am Boden: nur Schritttempo
    if (h.schleift) {
      if (Math.abs(lader.v) > 0.7) lader.v = Math.sign(lader.v) * 0.7;
      if (sekunden() > mz.schleifHinweis) { mz.schleifHinweis = sekunden() + 6; ui.hinweis('Die Stangen schleifen am Boden. Gabel höher (R)!', 2400); }
    }
    // alter Schlupf: reißt, sobald man an der Werkstatt ankommt
    if (anGabel && anGabel.reisst(1) && Math.hypot(lader.x, lader.z) < WERKSTATT_NAH) { fallen('riss'); return; }
    // schief angekoppelt: zu schnell oder harter Stoß = rausgerutscht
    if (mz.schief) {
      mz.schnellSeit = Math.abs(lader.v) > 1.5 ? mz.schnellSeit + dt : Math.max(0, mz.schnellSeit - dt);
      const ruck = Math.abs(pose.v) > 1.2 && Math.abs(pose.v) - Math.abs(lader.v) > Math.max(1.0, 10 * dt);
      if (mz.schnellSeit > 1.6 || ruck) { fallen('rutscht'); return; }
    }
    if (fz2.aktiv === lader) hilfe(imAbladePlatz() ? 'B: Stahl einsortieren' : `Zum Container hinter der Werkstatt (${Math.round(Math.hypot(buendel.position.x - ABLADE.x, buendel.position.z - ABLADE.z))} m)`);
  };
  // mit dem Schlupf in der Hand einsteigen: bei laufendem Auftrag kommt er vorne an die Gabel
  const vorherEin = fz2.vorEinsteigen;
  fz2.vorEinsteigen = (f) => {
    if (f === lader && hand.item?.id === 'schlupf' && auftragLaeuft() && pritscheFrei() && !anGabel) { schlupfAnGabel(pritsche.schlupf); ui.hinweis('Schlupf hängt vorne an der Gabel.', 2600); return true; }
    return vorherEin ? vorherEin(f) : false;
  };
  const auftragLaeuft = () => mz.phase === 'wartet' || mz.phase === 'offen';

  // ---------- jedes Bild ----------
  let zeit = 0;
  function update(dt) {
    zeit += dt;
    markMat.opacity = 0.25 + Math.sin(zeit * 3) * 0.12;
    if (mz.stangen === 'haengt' && fz2.aktiv !== lader) haengen(0); else schlupfFrei();
    if (z.vorbei) return;
    const t = sekunden();
    if (mz.phase === 'aus' && t > mz.naechsterBesuch && ruhigeLage() && !fz2.aktiv && pritscheFrei()) { mz.naechsterBesuch = Infinity; jonasKommt(); }
    if (!auftragLaeuft()) return;
    // Hilfe im Weidemann
    if (fz2.aktiv === lader && mz.stangen === 'liegt' && pritscheFrei()) {
      const abst = Math.hypot(lader.x - buendel.position.x, lader.z - buendel.position.z);
      hilfe(!anGabel ? 'Kein Schlupf an der Gabel!' : ueberStangen() ? 'R/F (Gabel bewegen): Stangen ankoppeln' : abst > 9 ? `Stahl: ${Math.round(abst)} m` : 'Quer vor die Stangen fahren, Gabel drüber');
    }
    // Jonas fragt nach (nur wenn man in der Nähe ist), Dennis wundert sich
    if (mz.jonasDa && t > mz.nachfrageAb && !fz2.aktiv && Math.hypot(kamera.position.x - jonas.wurzel.position.x, kamera.position.z - jonas.wurzel.position.z) < 9) {
      mz.nachfrageAb = t + 100 + Math.random() * 60;
      jonas.dreheZu(kamera.position);
      ui.jonasSagt(mz.phase === 'wartet' ? JONAS.bitte[0] : sag(JONAS.nachfrage), 4200);
    }
    if (t > mz.dennisAb && ruhigeLage() && !(mz.stangen === 'haengt' && Math.hypot(lader.x, lader.z) < 40)) {
      mz.dennisAb = t + 150 + Math.random() * 90;
      dennisSagt(sag(DENNIS.metall.wo), false, { prio: 0 });
    }
  }

  // ---------- Menü (Klick) ----------
  function menue(id, obj) {
    if (id === 'kumpel-jonas' && mz.jonasDa) {
      if (mz.phase === 'wartet') return ['Jonas', 'Weiße Augenklappe. Das Eisen von Eisen Meyer liegt oben an der Straße.', [A('Okay, ich hol das Eisen', 'hand', annehmen), A('Was ist mit deinem Auge?', 'frage', () => ui.jonasSagt(sag(JONAS.auge), 4200))]];
      if (mz.phase === 'offen') return ['Jonas', 'Wartet auf den Stahl. Sieht gerade nur die Hälfte.', [A('Was soll ich nochmal machen?', 'frage', () => ui.jonasSagt(JONAS.tipp[0], 5200)), A('Was ist mit deinem Auge?', 'frage', () => ui.jonasSagt(sag(JONAS.auge), 4200))]];
      return ['Jonas', 'Weiße Augenklappe.', []];
    }
    if (id === 'metallBuendel') {
      if (mz.stangen === 'haengt') return ['Stahl von Eisen Meyer', 'Hängt am Schlupf unter der Gabel. Ab zum Container hinter der Werkstatt.', []];
      return ['Stahl von Eisen Meyer', 'Acht Stangen, sechs Meter lang. Viel zu schwer zum Tragen: Weidemann mit Schlupf an der Gabel, quer davor fahren, Gabel bewegen.', []];
    }
    if (id === 'schlupf') {
      const sl = [pritsche.schlupfNeu, pritsche.schlupfAlt].find((s) => { for (let o = obj; o; o = o.parent) if (o === s.obj) return true; return false; });
      if (sl && sl.zustand === 'gerissen') return ['Gerissener Schlupf', 'Mittendurch. Den kann man nur noch wegschmeißen.', []];
      if (sl && sl === anGabel) return [sl.obj.userData.interaktiv.name, mz.stangen === 'haengt' ? 'Hängt an der Gabel und trägt die Stangen.' : 'Hängt vorne an der Gabel.', mz.stangen === 'haengt' ? [] : [A('Abnehmen (in die Hand)', 'hand', schlupfAbnehmen)]];
      return null;
    }
    if (id === 'weidemann' && !lader.fahrer) {
      if (hand.item?.id === 'schlupf' && !anGabel && (auftragLaeuft() || !pritscheFrei())) {
        const a = [A('Schlupf vorne an die Gabel hängen', 'hand', () => { schlupfAnGabel(pritsche.schlupf); ui.hinweis('Schlupf hängt vorne an der Gabel. Jetzt einsteigen und zum Stahl fahren.', 3200); })];
        const p = pritscheFrei() ? null : pritsche.menue(id, obj);
        return ['Hoflader', 'Wohin mit dem Schlupf?', p ? [...a, ...p[2]] : a];
      }
      if (anGabel && !hand.item && mz.stangen !== 'haengt' && pritscheFrei()) return null; // normales Menü (einsteigen); Abnehmen über den Schlupf selbst
    }
    if (id === 'container' && mz.stangen === 'haengt') return ['Container', 'Hier kommt der Stahl rein. Mit dem Weidemann davor (grüne Fläche), dann B.', []];
    return null;
  }

  // ---------- Test (Testmenü) ----------
  function zuruecksetzen() {
    mz.lauf++;
    if (anGabel) { const sl = anGabel; anGabel = null; sl.anHaken(); }
    for (const sl of [pritsche.schlupfNeu, pritsche.schlupfAlt]) if (sl.zustand === 'gerissen') { sl.obj.userData.interaktiv.name = sl.variante === 'neu' ? 'Neuer Schlupf' : 'Alter Schlupf'; sl.zustand = 'fahrzeug'; sl.anHaken(); }
    traverse.visible = false;
    buendel.visible = false; hoelzer.visible = false; geliefert.visible = false; platzMarke.visible = false; abladeMarke.visible = false;
    lader.schleppt = false; lader.gesperrt = false;
    jonas.halt?.(); jonas.sichtbar(false); klappe.visible = false;
    Object.assign(mz, { phase: 'aus', stangen: 'weg', pannen: 0, anstoesse: 0, gier: 0, schief: false, versatz: 0, gerissen: false, jonasDa: false, spielt: false, kontakt: false });
    hilfe('');
  }
  // Auftrag läuft, Jonas steht in der Werkstatt, Stangen liegen am Lieferplatz
  function testStart() {
    if (fz2.aktiv) fahrten.test.aussteigen();
    zuruecksetzen();
    mz.phase = 'offen'; mz.jonasDa = true; klappe.visible = true; lader.gesperrt = true;
    jonas.wurzel.position.set(-1.9, 0, 1.5); jonas.sichtbar(true);
    hoelzer.visible = true; platzMarke.visible = true;
    buendelAmBoden(LIEFERPLATZ.x, LIEFERPLATZ.z, 0);
    mz.nachfrageAb = sekunden() + 60; mz.dennisAb = sekunden() + 120;
  }
  // Weidemann mit Schlupf an der Gabel quer vor den Stangen (Spieler sitzt drin)
  function testAmStahl(alt = false) {
    testStart();
    if (hand.item) { hand.weg(); handleisteZeigen(); }
    schlupfAnGabel(alt ? pritsche.schlupfAlt : pritsche.schlupfNeu);
    Object.assign(lader, { x: LIEFERPLATZ.x, z: LIEFERPLATZ.z - 2.6, psi: 0, knick: 0, v: 0 });
    fz.anwenden(lader, 0);
    fahrten.test.einsteigen(lader);
  }
  // Stangen hängen schon dran; ort: 'feldweg' (ein Stück vor dem Hof), 'hof', 'container' (kurz vor der grünen Fläche)
  function testHaengt(alt = false, ort = 'container') {
    testAmStahl(alt);
    nachAnkoppeln({ abgebrochen: false, versatz: 0, schief: false });
    const P = { feldweg: { x: 30, z: 10.2, psi: -Math.PI / 2 }, hof: { x: 19.5, z: 11.4, psi: -Math.PI / 2 }, container: { x: ABLADE.x, z: CONTAINER.zMin - 7.5, psi: 0 } }[ort];
    Object.assign(lader, { x: P.x, z: P.z, psi: P.psi, knick: 0, v: 0 });
    fz.anwenden(lader, 0);
    mz.gier = 0;
    haengen(0);
  }

  return { mz, update, menue, jonasKommt, annehmen, LIEFERPLATZ, ABLADE, get aktiv() { return mz.phase !== 'aus' && mz.phase !== 'fertig'; }, get jonasDa() { return mz.jonasDa; }, get anGabel() { return anGabel; },
    buendel,
    test: { zuruecksetzen, testStart, testAmStahl, testHaengt, ankoppeln, abladen, nachAnkoppeln, nachAbladen, imAbladePlatz, ueberStangen, stoesst, fallen, schlupfAnGabel } };
}
