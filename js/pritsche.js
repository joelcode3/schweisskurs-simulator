// Paket E2b: Joels Pritsche abschleppen.
// Ablauf: Joel kommt in die Werkstatt und bittet um Hilfe. Man holt einen Schlupf (neu im Regal im unteren Fach oder alt an der Wand
// bei den Stahlträgern, mit Warnzettel), legt ihn auf den
// Weidemann (Hoflader anklicken) und steigt ein. Joel stellt sich außen auf den Tritt und fährt mit. An der umgekippten
// Pritsche (VW T5 an der großen Straße) springt er ab: B = Minispiel „Pritsche bergen“ (anheben, kippen, Schlupf an die
// Öse). Danach B = Abschleppen: Weidemann vorn, Pritsche am Schlupf hinten, Joel sitzt drin und lenkt. In der grün
// leuchtenden Bucht „PRITSCHE“ im Carport: B = abstellen. Schäden (Spiegel, Kühler, Ölwanne, Achse, Stoßstange …) ärgern
// Dennis, ein sauberer Job freut ihn.
import * as THREE from 'three';
import { toon, quader, zylinder, setze, leinwandTextur, zufall } from './toon.js';
import { RAUM } from './world.js';
import { BUCHTEN, CARPORT_PFOSTEN } from './platzhinten.js';
import { baueSchlupf } from './schlupf.js';
import { inHindernis } from './draussen.js';
import { gelaendeHoehe } from './landschaft.js';
import { DENNIS, JOEL } from './texte.js';
import { pritscheSpiel } from './minispiele.js';
import { LADER_HILFE } from './fahrten.js';

const T5_VORN = 2.55, T5_ACHSE_HINTEN = 1.35; // vom Mittelpunkt: Öse vorn, Hinterachse
const SEIL = 3.2;

export function bauePritsche(c) {
  const { welt, scene, fz, fahrten, kumpels, hand, kamera, steuerung, ui, z, sag, dennisSagt, aerger, lob, sekunden, warte,
    reinkommen, rausgehen, ruhigeLage, handleisteZeigen, klonk, blip } = c;
  const A = (text, symbol, tun) => ({ text, symbol, tun });
  const joel = kumpels.alle.joel;
  const t5 = welt.draussen.landschaft.t5;
  const modell = t5.userData.modell;
  const t5H = t5.userData.hindernis;
  const lader = fz.lader;
  const fz2 = fahrten.zustand;
  const pz = { phase: 'aus', naechsterBesuch: 480 + Math.random() * 300, schaeden: [], spurAb: 0, spur: 0 };
  const T5_START = { pos: t5.position.clone(), ry: t5.rotation.y };

  // ---------- Zwei Schlupfe (Baustein schlupf.js, auch für E3) ----------
  // neu: liegt im Regal (unteres Brett, vorn), alt: hängt an der Wand über den Stahlträgern, daneben ein Warnzettel.
  // In E2b funktionieren beide; der Unterschied (alter reißt) kommt in E3 (schlupf.reisst, belastbar).
  const schlupfNeu = baueSchlupf(scene, { variante: 'neu', station: 'regal' });
  schlupfNeu.setzeHaken(new THREE.Vector3(-4.68, 0.25 + 0.015 + 0.012, -0.72), new THREE.Euler(Math.PI / 2, 0, 0.1), 0.62); // liegt im unteren Fach (umgeschlagen), Länge nach hinten (-z)
  schlupfNeu.anHaken();
  {
    // Schild am Regalbrett: Platz des neuen Schlupfs (anklicken, um ihn zurückzulegen)
    const tex = leinwandTextur(160, 56, (g, b, h) => { g.fillStyle = '#f2c21c'; g.fillRect(0, 0, b, h); g.fillStyle = '#1d1d1f'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.fillText('SCHLUPF', b / 2, 39); });
    const schild = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.052), toon(0xffffff, { map: tex }));
    schild.position.set(-4.474, 0.212, -1.0); schild.rotation.y = Math.PI / 2;
    schild.userData.interaktiv = { id: 'schlupfPlatz', name: 'Platz für den Schlupf', station: 'regal' };
    scene.add(schild);
    welt.interaktiv?.push(schild);
  }
  const schlupfAlt = baueSchlupf(scene, { variante: 'alt' });
  const WAND_Z = RAUM.zMax - 0.03;
  {
    // Haken (Winkel aus Flachstahl) in der Wand, Schlupf hängt davor
    const haken = new THREE.Group();
    haken.add(setze(quader(0.04, 0.1, 0.03, 0x5a5e62, { umriss: 0.001 }), 0, 0, 0));
    haken.add(setze(quader(0.03, 0.025, 0.1, 0x5a5e62, { umriss: 0.001 }), 0, -0.04, -0.05));
    haken.position.set(4.35, 1.85, WAND_Z - 0.015);
    scene.add(haken);
    schlupfAlt.setzeHaken(new THREE.Vector3(4.35, 1.82, WAND_Z - 0.06), Math.PI);
    schlupfAlt.anHaken();
    // dreckiger Zettel daneben, mit Klebeband
    const tex = leinwandTextur(256, 192, (g, b, h) => {
      g.fillStyle = '#e9e1c8'; g.fillRect(0, 0, b, h);
      const r = zufall(31);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(${70 + r() * 30},${55 + r() * 20},${35 + r() * 15},${0.08 + r() * 0.22})`; g.beginPath(); g.ellipse(r() * b, r() * h, 4 + r() * 26, 3 + r() * 14, r() * 3, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = 'rgba(40,30,20,0.35)'; g.beginPath(); g.ellipse(190, 150, 34, 22, 0.4, 0, Math.PI * 2); g.fill(); // Ölfinger
      g.fillStyle = '#b3241c'; g.font = 'bold 34px Arial'; g.textAlign = 'center';
      g.fillText('Nicht mehr', b / 2, 56); g.fillText('benutzen!', b / 2, 96);
      g.fillStyle = '#1d1d1f'; g.font = 'bold 30px Arial'; g.fillText('Lebensgefährlich!', b / 2, 148);
      g.strokeStyle = '#b3241c'; g.lineWidth = 4; g.beginPath(); g.moveTo(40, 162); g.lineTo(216, 158); g.stroke();
    });
    const zettel = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.195), toon(0xffffff, { map: tex }));
    zettel.position.set(3.95, 1.5, WAND_Z - 0.005); zettel.rotation.set(0, Math.PI, 0.05);
    const klebe = setze(quader(0.08, 0.025, 0.003, 0xd8cfa8, { umriss: false }), 0, 0.095, 0.002, 0, 0, -0.1);
    zettel.add(klebe);
    zettel.userData.interaktiv = { id: 'schlupfZettel', name: 'Zettel', station: null };
    scene.add(zettel);
    welt.interaktiv?.push(zettel);
  }
  welt.interaktiv?.push(schlupfNeu.obj, schlupfAlt.obj);
  const SCHLUPFE = [schlupfNeu, schlupfAlt];
  let schlupf = schlupfNeu; // der gerade benutzte (in der Hand / auf dem Weidemann / gespannt)
  let alterKommentiert = false;
  const schlupfVon = (obj) => SCHLUPFE.find((s) => { for (let o = obj; o; o = o.parent) if (o === s.obj) return true; return false; });
  // Schlupf auf dem Weidemann: aufgerollt hinten auf dem Hinterwagen
  const SCHLUPF_AUF_LADER = new THREE.Vector3(0.0, 1.32, -1.5);
  const HAKEN_LADER = new THREE.Vector3(0, 0.55, -1.78); // Anhängekupplung hinten
  const OESE_T5 = new THREE.Vector3(0.55, 0.45, T5_VORN + 0.02); // im Modell (stehend)
  // Abschleppöse am T5 (rechts unter der Stoßstange)
  modell.add(setze(teil2(), OESE_T5.x, OESE_T5.y, OESE_T5.z));
  function teil2() { const g = new THREE.Group(); g.add(setze(zylinder(0.03, 0.03, 0.12, 0x8c8f94, { umriss: 0.001 }, 8), 0, 0, -0.05, Math.PI / 2, 0, 0)); const r = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12), toon(0x8c8f94)); r.position.z = 0.02; g.add(r); return g; }

  // ---------- grüne Markierung: Ziel (Bucht PRITSCHE), unterwegs auch an der Pritsche ----------
  const markMat = toon(0x4cdc5a, { transparent: true, opacity: 0.35, depthWrite: false, emissive: 0x2a8a30 });
  const bucht = BUCHTEN.pritsche;
  const zielMarke = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.6), markMat);
  zielMarke.rotation.x = -Math.PI / 2; zielMarke.position.set(bucht.x, 0.03, bucht.z); zielMarke.visible = false;
  scene.add(zielMarke);
  const t5Marke = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.2, 40), markMat);
  t5Marke.rotation.x = -Math.PI / 2; t5Marke.visible = false;
  scene.add(t5Marke);
  // Ölflecken (Ölwanne kaputt): unter der Pritsche und als Spur beim Schleppen
  const oelMat = toon(0x1d1a16, { transparent: true, opacity: 0.6, depthWrite: false });
  const oelFleck = new THREE.Mesh(new THREE.CircleGeometry(0.6, 14), oelMat);
  oelFleck.rotation.x = -Math.PI / 2; oelFleck.position.set(0, 0.02, 1.4); oelFleck.visible = false;
  t5.add(oelFleck);

  // ---------- Hilfen ----------
  const dir = (psi) => new THREE.Vector3(Math.sin(psi), 0, Math.cos(psi));
  const ladeHaken = () => lader.g.localToWorld(HAKEN_LADER.clone());
  const t5Oese = () => modell.localToWorld(OESE_T5.clone());
  function t5Hindernis() {
    const psi = t5.rotation.y, hx = 0.98, hz = 2.55;
    const ex = Math.abs(Math.cos(psi)) * hx + Math.abs(Math.sin(psi)) * hz, ez = Math.abs(Math.sin(psi)) * hx + Math.abs(Math.cos(psi)) * hz;
    Object.assign(t5H, { xMin: t5.position.x - ex, xMax: t5.position.x + ex, zMin: t5.position.z - ez, zMax: t5.position.z + ez, boxen: [{ x: t5.position.x, z: t5.position.z, psi, hx, hz }] });
  }
  function t5Boden() {
    // auf das Gelände: Höhe und Neigung aus vier Punkten
    const psi = t5.rotation.y, d = dir(psi), q = new THREE.Vector3(d.z, 0, -d.x), p = t5.position;
    const hv = gelaendeHoehe(p.x + d.x * 1.5, p.z + d.z * 1.5), hh = gelaendeHoehe(p.x - d.x * 1.5, p.z - d.z * 1.5);
    const hl = gelaendeHoehe(p.x + q.x * 0.8, p.z + q.z * 0.8), hr = gelaendeHoehe(p.x - q.x * 0.8, p.z - q.z * 0.8);
    t5.position.y = (hv + hh + hl + hr) / 4;
    t5.rotation.set(-Math.atan2(hv - hh, 3), psi, Math.atan2(hl - hr, 1.6), 'YXZ');
  }
  const istNah = (a, b, r) => Math.hypot(a.x - b.x, a.z - b.z) < r;
  function hilfe(extra) { if (fz2.aktiv === lader) ui.fahrHilfe(extra ? `${LADER_HILFE} · ${extra}` : LADER_HILFE); }

  // ---------- Joel ----------
  const joelBlick = new THREE.Vector3();
  function joelAufLader(an) {
    if (an) {
      joel.halt?.();
      lader.g.add(joel.wurzel);
      // seitlich auf dem Tritt: Körper zum Weidemann, hält sich mit beiden Händen fest, guckt nach vorn
      joel.wurzel.position.set(1.04, 0.39, -0.55);
      joel.wurzel.rotation.set(0, -Math.PI / 2 + 0.3, 0);
      joel.festhalten?.(true);
      joel.blickFest?.(joelBlick);
    } else {
      joel.festhalten?.(false);
      joel.blickFest?.(null);
      scene.attach(joel.wurzel);
      joel.wurzel.rotation.set(0, joel.wurzel.rotation.y, 0);
    }
  }
  function joelInT5(an) {
    if (an) {
      joel.halt?.();
      modell.add(joel.wurzel);
      joel.wurzel.position.set(0.42, 0.18, 1.15);
      joel.wurzel.rotation.set(0, 0, 0);
      joel.sitzen(0.5);
    } else {
      joel.sitzen(null);
      scene.attach(joel.wurzel);
      joel.wurzel.rotation.set(0, joel.wurzel.rotation.y, 0);
      joel.wurzel.position.y = 0;
    }
  }
  async function joelKommt() {
    if (pz.phase !== 'aus' && pz.phase !== 'fertig') return false;
    if (c.sd && c.sd.id === 'joel' && c.sd.kumpelDa) return false;
    pz.phase = 'joelKommt'; pz.schaeden = [];
    const lauf = (pz.lauf = (pz.lauf || 0) + 1); // zurückgesetzt (Testmenü) = abbrechen
    lader.gesperrt = true;
    await reinkommen(joel, 'feldweg');
    await Promise.race([joel.gehZu(-0.8, 1.2, 1.1), warte(8000)]);
    if (lauf !== pz.lauf || pz.phase !== 'joelKommt') return false;
    joel.dreheZu(kamera.position);
    ui.joelSagt(sag(JOEL.hallo), 5000);
    setTimeout(() => dennisSagt(sag(DENNIS.pritsche.joel), true, { prio: 1 }), 5200);
    pz.phase = 'wartet';
    return true;
  }
  function helfen() {
    if (pz.phase !== 'wartet') return;
    ui.joelSagt(JOEL.bitte[0], 4200);
    setTimeout(() => ui.joelSagt(JOEL.bitte[1], 4200), 4400);
    pz.phase = 'zumLader';
    pz.gehAb = 0;
  }

  // ---------- Schlupf auf den Weidemann (statt in der Hand einzusteigen) ----------
  fz2.vorEinsteigen = (f) => {
    if (f !== lader || hand.item?.id !== 'schlupf') return false;
    hand.weg();
    schlupf.aufFahrzeug(lader.g, SCHLUPF_AUF_LADER);
    handleisteZeigen();
    ui.hinweis('Schlupf liegt jetzt hinten auf dem Weidemann.', 2600);
    return true;
  };
  const schlupfDabei = () => schlupf.zustand === 'fahrzeug' && schlupf.obj.parent === lader.g;

  // ---------- Bergen, Abschleppen, Abstellen (im Weidemann mit B) ----------
  async function bergen() {
    if (pz.phase !== 'amT5') return;
    if (!schlupfDabei()) { ui.joelSagt(sag(JOEL.ohneSchlupf), 4200); return; }
    fz2.pause = true;
    steuerung.sperre(true);
    pz.phase = 'minispiel';
    const e = await pritscheSpiel();
    await nachSpiel(e);
  }
  // Ergebnis des Minispiels umsetzen (auch für Tests ohne Minispiel)
  async function nachSpiel(e) {
    steuerung.sperre(false);
    fz2.pause = false;
    if (e.abgebrochen) { pz.phase = 'amT5'; hilfe('B: Pritsche bergen'); return; }
    pz.schaeden = e.schaeden || [];
    await aufstellen();
    if (pz.schaeden.length) {
      aerger(3 * pz.schaeden.length);
      ui.joelSagt(sag(JOEL.schaden), 3800);
      setTimeout(() => dennisSagt(sag(DENNIS.pritsche.schaden), true, { prio: 1 }), 1500);
    } else {
      ui.joelSagt(sag(JOEL.gut), 3500);
      z.wut = Math.max(0, z.wut - 3);
      setTimeout(() => lob(sag(DENNIS.pritsche.geborgen)), 1500);
    }
    if (pz.schaeden.includes('Ölwanne')) oelFleck.visible = true;
    // Schlupf von der Kupplung zur Öse
    schlupf.spannen(ladeHaken, t5Oese, SEIL);
    pz.phase = 'bereit';
    hilfe('B: Abschleppen');
  }
  function aufstellen() {
    // weich auf die Räder rollen
    return new Promise((res) => {
      const r0 = modell.rotation.z, y0 = modell.position.y, t0 = performance.now();
      const schritt = (jetzt) => {
        const k = Math.min(1, (jetzt - t0) / 1100), e = k < 0.8 ? (k / 0.8) ** 2 : 1 - Math.sin(((k - 0.8) / 0.2) * Math.PI) * 0.03;
        modell.rotation.z = r0 * (1 - Math.min(1, e));
        modell.position.y = y0 * (1 - Math.min(1, e));
        if (k < 1) requestAnimationFrame(schritt);
        else { modell.rotation.z = 0; modell.position.y = 0; klonk(0.8); t5Hindernis(); res(); }
      };
      requestAnimationFrame(schritt);
    });
  }
  function abschleppen() {
    if (pz.phase !== 'bereit') return;
    pz.phase = 'schleppt';
    lader.schleppt = true;
    t5H.ohneFahrzeug = true;
    joelInT5(true);
    ui.joelSagt(sag(JOEL.abschleppen), 3800);
    zielMarke.visible = true; t5Marke.visible = false;
    hilfe('Langsam zum Carport, Bucht PRITSCHE (grün)');
  }
  function imZiel() {
    const p = t5.position, a = Math.abs(Math.sin(t5.rotation.y)); // längs zur Bucht = entlang x
    return Math.abs(p.x - bucht.x) < 0.9 && Math.abs(p.z - bucht.z) < 0.55 && a > 0.93;
  }
  function abstellen() {
    if (pz.phase !== 'schleppt' || !imZiel()) return;
    pz.phase = 'fertig';
    lader.schleppt = false;
    t5H.ohneFahrzeug = false;
    schlupf.loesen();
    schlupf.aufFahrzeug(lader.g, SCHLUPF_AUF_LADER);
    zielMarke.visible = false;
    t5Hindernis();
    klonk(0.4);
    hilfe('');
    joelInT5(false);
    const raus = t5.localToWorld(new THREE.Vector3(1.6, 0, 1.2));
    joel.wurzel.position.set(raus.x, 0, raus.z);
    joel.dreheZu(kamera.position);
    ui.joelSagt(sag(JOEL.abgestellt), 4500);
    if (pz.schaeden.length) setTimeout(() => dennisSagt(sag(DENNIS.pritsche.abgestelltSchaden), true, { prio: 1 }), 2500);
    else { z.wut = Math.max(0, z.wut - 6); setTimeout(() => lob(sag(DENNIS.pritsche.abgestellt)), 2500); }
    lader.gesperrt = false;
    setTimeout(async () => { await rausgehen(joel, 'hinten'); }, 6000);
  }

  // ---------- Anhänger: Pritsche folgt am Seil ----------
  const BOX = [[-0.95, 2.5], [0.95, 2.5], [-0.95, -2.45], [0.95, -2.45], [-0.95, 0], [0.95, 0], [0, 2.58], [0, -2.5]];
  function t5Frei(x, zz, psi) {
    const c0 = Math.cos(psi), s0 = Math.sin(psi);
    for (const [lx, lz] of BOX) {
      const px = x + lx * c0 + lz * s0, pz2 = zz - lx * s0 + lz * c0;
      if (!welt.draussen.fahrbar(px, pz2)) return false;
      for (const h of welt.hindernisse) {
        if (h === t5H || h === lader.hindernis || h.niedrig || fz.paletten.some((q) => q.userData.hindernis === h)) continue;
        if (inHindernis(h, px, pz2)) return false;
      }
    }
    return true;
  }
  fz2.nachSchritt = (f, neu, pose, dt) => {
    if (f !== lader) return;
    if (neu.has('b')) {
      if (pz.phase === 'amT5') bergen();
      else if (pz.phase === 'bereit') abschleppen();
      else if (pz.phase === 'schleppt') { if (imZiel()) abstellen(); else ui.hinweis('Noch nicht in der grünen Bucht.', 1800); }
    }
    if (pz.phase !== 'schleppt') return;
    // Weidemann darf nicht in die Pritsche (beim Schleppen zählt sie für ihn sonst nicht als Hindernis)
    const t5Box = { x: t5.position.x, z: t5.position.z, psi: t5.rotation.y, hx: 0.95, hz: 2.55 };
    if (fz.boxenVon(lader, lader.x, lader.z, lader.psi, lader.knick || 0).some((b) => fz.obbTiefe(b, t5Box) > 0.01)) {
      const vorher = fz.boxenVon(lader, pose.x, pose.z, pose.psi, pose.knick).some((b) => fz.obbTiefe(b, t5Box) > 0.01);
      if (!vorher) { Object.assign(lader, { x: pose.x, z: pose.z, psi: pose.psi, knick: pose.knick, v: 0 }); fz.anwenden(lader, 0); klonk(0.3); return; }
    }
    const H = ladeHaken(), psiT = t5.rotation.y, d = dir(psiT);
    const P = t5.position, F = new THREE.Vector3(P.x + d.x * T5_VORN, 0, P.z + d.z * T5_VORN);
    const abst = Math.hypot(H.x - F.x, H.z - F.z);
    // zu nah (rückwärts gegen die Pritsche): Weidemann darf nicht rein
    if (abst < 1.1) { Object.assign(lader, { x: pose.x, z: pose.z, psi: pose.psi, knick: pose.knick, v: 0 }); fz.anwenden(lader, 0); return; }
    if (abst <= SEIL) { schlupf.update(); return; }
    // Seil gespannt: Öse wird zum Haken gezogen, Hinterachse rollt nach (Joel lenkt)
    const k = (abst - SEIL) / abst;
    const Fn = new THREE.Vector3(F.x + (H.x - F.x) * k, 0, F.z + (H.z - F.z) * k);
    const R = new THREE.Vector3(P.x - d.x * T5_ACHSE_HINTEN, 0, P.z - d.z * T5_ACHSE_HINTEN);
    const psiN = Math.atan2(Fn.x - R.x, Fn.z - R.z);
    const dn = dir(psiN);
    const nx = Fn.x - dn.x * T5_VORN, nz = Fn.z - dn.z * T5_VORN;
    if (!t5Frei(nx, nz, psiN)) {
      // Pritsche hängt fest: Weidemann bleibt stehen
      Object.assign(lader, { x: pose.x, z: pose.z, psi: pose.psi, knick: pose.knick, v: 0 }); fz.anwenden(lader, 0);
      if (sekunden() > (pz.festHinweis || 0)) { pz.festHinweis = sekunden() + 4; ui.hinweis('Die Pritsche hängt fest. Anders lenken oder zurücksetzen.', 2200); klonk(0.3); }
      return;
    }
    t5.position.x = nx; t5.position.z = nz; t5.rotation.y = psiN;
    t5Boden();
    t5Hindernis();
    schlupf.update();
    // Ölspur
    if (oelFleck.visible) {
      pz.spur += Math.hypot(nx - P.x, nz - P.z);
      if (pz.spur > 1.4 && pz.spurAb < 80) {
        pz.spur = 0; pz.spurAb++;
        const s = new THREE.Mesh(new THREE.CircleGeometry(0.12 + Math.random() * 0.12, 9), oelMat);
        s.rotation.x = -Math.PI / 2; s.position.set(nx + dn.x * 1.4, gelaendeHoehe(nx, nz) + 0.02, nz + dn.z * 1.4);
        scene.add(s);
      }
    }
  };

  // ---------- jedes Bild ----------
  const markeZeit = { t: 0 };
  function update(dt) {
    markeZeit.t += dt;
    if (joel.wurzel.parent === lader.g) joelBlick.copy(lader.g.localToWorld(new THREE.Vector3(1.0, 1.6, 8)));
    markMat.opacity = 0.25 + Math.sin(markeZeit.t * 3) * 0.12;
    if (z.vorbei) return;
    const t = sekunden();
    if (pz.phase === 'aus' && t > pz.naechsterBesuch && ruhigeLage() && !fz2.aktiv) { pz.naechsterBesuch = Infinity; joelKommt(); }
    if (pz.phase === 'zumLader') {
      // Joel läuft zum Weidemann (auch wenn der woanders steht) und steigt außen auf, sobald er steht
      const ziel = lader.g.localToWorld(new THREE.Vector3(1.5, 0, -0.5));
      if (t > pz.gehAb) { pz.gehAb = t + 3; joel.gehZu(ziel.x, ziel.z, 1.3); }
      if (istNah(joel.wurzel.position, ziel, 1.4) && Math.abs(lader.v) < 0.2) {
        joelAufLader(true);
        ui.joelSagt(sag(JOEL.aufsteigen), 3000);
        pz.phase = 'unterwegs';
        t5Marke.position.set(t5.position.x, gelaendeHoehe(t5.position.x, t5.position.z) + 0.04, t5.position.z);
        t5Marke.visible = true;
      }
    }
    if (pz.phase === 'unterwegs') {
      if (Math.abs(lader.v) > 3.5 && t > (pz.fahrtSprueche || 0)) { pz.fahrtSprueche = t + 25; ui.joelSagt(sag(JOEL.fahrt), 3000); }
      const abst = Math.hypot(lader.x - t5.position.x, lader.z - t5.position.z);
      if (fz2.aktiv === lader && abst > 12) hilfe(`Pritsche: ${Math.round(abst)} m`);
      if (abst < 9 && Math.abs(lader.v) < 0.3) {
        joelAufLader(false);
        const p = t5.localToWorld(new THREE.Vector3(0, 0, -4.5));
        joel.wurzel.position.set(p.x, gelaendeHoehe(p.x, p.z), p.z);
        joel.dreheZu(t5.position);
        ui.joelSagt(sag(JOEL.angekommen), 3800);
        pz.phase = 'amT5';
        hilfe('B: Pritsche bergen');
      }
    }
    if (pz.phase === 'schleppt' && fz2.aktiv === lader) hilfe(imZiel() ? 'B: Pritsche hier abstellen' : `Zur grünen Bucht (${Math.round(Math.hypot(t5.position.x - bucht.x, t5.position.z - bucht.z))} m)`);
  }

  // ---------- Menü (Klick) ----------
  function menue(id, obj) {
    if (id === 'kumpel-joel' && pz.phase !== 'aus' && pz.phase !== 'fertig') {
      if (pz.phase === 'wartet') return ['Joel', 'Seine Pritsche liegt noch umgekippt an der großen Straße.', [A('Helfen (mit dem Weidemann hinfahren)', 'hand', helfen)]];
      return ['Joel', { zumLader: 'Wartet am Weidemann.', unterwegs: 'Steht außen auf dem Weidemann und hält sich fest.', amT5: 'Wartet an der Pritsche.', schleppt: 'Sitzt in der Pritsche und lenkt.' }[pz.phase] || 'Joel.', []];
    }
    if (id === 'schlupf') {
      const sl = schlupfVon(obj) || schlupf;
      const titel = sl.obj.userData.interaktiv.name;
      if (sl.zustand === 'haken') return [titel, sl.variante === 'neu' ? 'Neue Rundschlinge zum Abschleppen, noch sauber.' : 'Alte Rundschlinge, dreckig und ausgefranst. Daneben hängt ein Zettel.', [A('In die Hand nehmen', 'hand', () => {
        if (hand.item) { ui.hinweis(`Du hast schon ${hand.item.cfg.name} in der Hand.`, 2400); return; }
        schlupf = sl;
        sl.inHand();
        hand.nimm('schlupf', sl.obj);
        blip(520, 0.05);
        handleisteZeigen();
        if (pz.phase !== 'aus' && pz.phase !== 'fertig') ui.hinweis('Jetzt den Weidemann anklicken: der Schlupf kommt hinten drauf.', 3500);
        if (sl.variante === 'alt' && !alterKommentiert && pz.phase !== 'aus' && pz.phase !== 'fertig') {
          alterKommentiert = true;
          setTimeout(() => dennisSagt(sag(DENNIS.pritsche.alterSchlupf), true, { prio: 1 }), 900);
        }
      })]];
      if (sl.zustand === 'fahrzeug') return [titel, 'Liegt hinten auf dem Weidemann.', pz.phase === 'schleppt' || pz.phase === 'bereit' ? [] : [A(sl.variante === 'neu' ? 'Zurück ins Regal legen' : 'Zurück an den Haken hängen', 'hand', () => { sl.anHaken(); klonk(0.2); })]];
      return null;
    }
    if (id === 'schlupfPlatz') {
      const zurueck = hand.item?.id === 'schlupf' && schlupf === schlupfNeu;
      return ['Platz für den Schlupf', schlupfNeu.zustand === 'haken' ? 'Hier liegt der neue Schlupf.' : 'Hier gehört der neue Schlupf hin.', zurueck ? [A('Neuen Schlupf zurücklegen', 'hand', () => { hand.weg(); schlupfNeu.anHaken(); handleisteZeigen(); klonk(0.2); })] : []];
    }
    if (id === 'schlupfZettel') {
      const zurueck = hand.item?.id === 'schlupf' && schlupf === schlupfAlt;
      return ['Zettel', '„Nicht mehr benutzen! Lebensgefährlich!“ Dreckig, mit Ölfingern drauf.', zurueck ? [A('Alten Schlupf wieder aufhängen', 'hand', () => { hand.weg(); schlupfAlt.anHaken(); handleisteZeigen(); klonk(0.2); })] : []];
    }
    if (id === 'weidemann' && hand.item?.id === 'schlupf' && !lader.fahrer) {
      return ['Hoflader', 'Den Schlupf hinten drauflegen und einsteigen?', [
        A('Schlupf drauflegen und einsteigen', 'hand', () => fahrten.test.einsteigen(lader)),
        A('Nur den Schlupf drauflegen', 'hand', () => { fz2.vorEinsteigen(lader); }),
      ]];
    }
    if (id === 'vw_t5') {
      if (pz.phase === 'aus') return null;
      const text = { wartet: 'Joels Pritsche. Joel steht in der Werkstatt und braucht Hilfe.', zumLader: 'Joels Pritsche. Mit dem Weidemann herkommen.', unterwegs: 'Joels Pritsche. Näher ranfahren.',
        amT5: 'Im Weidemann davor stehen bleiben und B drücken: Pritsche bergen.', bereit: 'Steht wieder. Im Weidemann B drücken: Abschleppen.', schleppt: 'Hängt am Schlupf. Ab zur grünen Bucht im Carport.',
        fertig: pz.schaeden.length ? `Steht im Carport. Schäden: ${pz.schaeden.join(', ')}.` : 'Steht ordentlich im Carport.' }[pz.phase] || 'Joels Pritsche.';
      return [pz.phase === 'fertig' || pz.phase === 'bereit' || pz.phase === 'schleppt' ? 'VW T5 (Joels Pritsche)' : 'Umgekippter VW T5', text, []];
    }
    return null;
  }

  // ---------- Test (Testmenü) ----------
  function zuruecksetzen() {
    for (const sl of SCHLUPFE) { if (hand.item?.obj === sl.obj) { hand.weg(); handleisteZeigen(); } sl.loesen(); sl.anHaken(); }
    schlupf = schlupfNeu; alterKommentiert = false;
    if (joel.wurzel.parent !== scene) { joel.sitzen(null); scene.attach(joel.wurzel); }
    joel.sichtbar(false);
    modell.rotation.z = Math.PI / 2; modell.position.y = 0.92;
    t5.position.copy(T5_START.pos); t5.rotation.set(0, T5_START.ry, 0);
    t5Hindernis(); t5H.ohneFahrzeug = false;
    oelFleck.visible = false; zielMarke.visible = false; t5Marke.visible = false;
    lader.schleppt = false; lader.gesperrt = false;
    Object.assign(pz, { phase: 'aus', schaeden: [], spurAb: 0, spur: 0, lauf: (pz.lauf || 0) + 1 });
    joel.halt?.();
    hilfe('');
  }
  // Weidemann mit Joel und Schlupf direkt vor die Pritsche stellen (Spieler sitzt drin)
  function testAnDiePritsche() {
    if (fz2.aktiv) fahrten.test.aussteigen();
    zuruecksetzen();
    pz.phase = 'unterwegs'; lader.gesperrt = true;
    const p = t5.localToWorld(new THREE.Vector3(-4.5, 0, 0));
    Object.assign(lader, { x: p.x, z: p.z, psi: Math.atan2(t5.position.x - p.x, t5.position.z - p.z), knick: 0, v: 0 });
    fz.anwenden(lader, 0);
    joel.sichtbar(true);
    joelAufLader(true);
    schlupf.aufFahrzeug(lader.g, SCHLUPF_AUF_LADER);
    if (hand.item) { hand.weg(); handleisteZeigen(); }
    fahrten.test.einsteigen(lader);
  }
  // Pritsche steht schon und hängt am Schlupf, Weidemann davor (direkt abschleppen)
  async function testAbschleppen() {
    testAnDiePritsche();
    pz.phase = 'amT5';
    joelAufLader(false);
    modell.rotation.z = 0; modell.position.y = 0;
    // Weidemann vor die Öse, Blick weg von der Pritsche
    const d = dir(t5.rotation.y);
    const p = new THREE.Vector3(t5.position.x + d.x * (T5_VORN + SEIL + 1.4), 0, t5.position.z + d.z * (T5_VORN + SEIL + 1.4));
    Object.assign(lader, { x: p.x, z: p.z, psi: t5.rotation.y, knick: 0, v: 0 });
    fz.anwenden(lader, 0);
    t5Hindernis();
    schlupf.spannen(ladeHaken, t5Oese, SEIL);
    pz.phase = 'bereit';
    abschleppen();
  }
  // Pritsche hängt schon dran, Gespann kurz vor dem Carport
  function testVorDemCarport() {
    testAbschleppen();
    const ziel = new THREE.Vector3(bucht.x + 9, 0, bucht.z);
    Object.assign(lader, { x: ziel.x, z: ziel.z, psi: -Math.PI / 2, knick: 0, v: 0 });
    fz.anwenden(lader, 0);
    t5.position.set(ziel.x + 1.78 + SEIL - 0.2 + T5_VORN, 0, ziel.z); t5.rotation.y = -Math.PI / 2;
    t5Boden(); t5Hindernis(); schlupf.update();
  }

  return { pz, update, menue, joelKommt, helfen, get schlupf() { return schlupf; }, schlupfNeu, schlupfAlt,
    // Schlupf in der Hand an seinen Stammplatz zurück (Regal / Haken)
    schlupfZurueck() { if (hand.item?.id !== 'schlupf') return false; const sl = schlupfVon(hand.item.obj) || schlupf; hand.weg(); sl.anHaken(); handleisteZeigen(); klonk(0.2); return true; },
    test: { zuruecksetzen, testAnDiePritsche, testAbschleppen, testVorDemCarport, bergen, abstellen, imZiel, nachSpiel: (schaeden = []) => { pz.phase = 'minispiel'; return nachSpiel({ abgebrochen: false, schaeden }); } } };
}
