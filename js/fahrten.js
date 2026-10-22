// Fahren im Spiel: Der Spieler steigt in den Mini-Jeep oder den Hoflader (Schlüssel steckt vorerst), Jonny, Waldo und
// Torben drehen ab und zu eine Runde oder fahren weg und kommen wieder. Torben fährt rasant und rumst mit dem Hoflader gern
// irgendwo gegen (Grill umgefahren: aufstellen, bevor Dennis es selbst machen muss). In Dennis' Augen fahren alle lebensgefährlich.
import * as THREE from 'three';
import { AUGENHOEHE } from './world.js';
import { DENNIS, JONNY, TORBEN } from './texte.js';
import { blip, klonk } from './audio.js';
import * as ui from './ui.js';
import { TORBEN_PLATZ } from './torben.js';

// Vorerst steckt der Schlüssel im Hoflader (Betreiber: später gibt Dennis ihn raus, wenn man etwas damit erledigen muss)
export const LADER_SCHLUESSEL_STECKT = true;

const TUER_INNEN = { x: -0.35, z: 3.0 }, TUER_AUSSEN = { x: -0.35, z: 5.0 };
const FELDWEG_FERN = { x: 30, z: 10.6 };
// Runden über den Hof (Routen enden kurz vor der Anfahrt zum Parkplatz, siehe fz.mitAnfahrt)
const RUNDE_JEEP = [{ x: 4.4, z: 7.5 }, { x: 6.2, z: 8.8 }, { x: 5.0, z: 10.9 }, { x: -2.5, z: 11.2 }, { x: -8.5, z: 10.2 }, { x: -9.5, z: 6.8 }, { x: -6.5, z: 6.2 },
  { x: -2.0, z: 6.4 }, { x: -0.6, z: 8.6 }, { x: -0.2, z: 10.6 }];
const RUNDE_LADER = [{ x: 7.3, z: 4.8 }, { x: 7.6, z: 8.0 }, { x: 5.0, z: 11.0 }, { x: -2.0, z: 11.3 }, { x: -8.5, z: 10.0 }, { x: -9.5, z: 6.6 }, { x: -6.5, z: 6.3 },
  { x: -2.0, z: 6.5 }, { x: -0.8, z: 9.6 }, { x: 4.6, z: 10.7 }, { x: 8.3, z: 8.6 }, { x: 8.9, z: 4.0 }, { x: 8.9, z: 0.0 }, { x: 8.0, z: -1.6 }];
// weg vom Hof und zurück
const WEG = { jeep: [{ x: 4.4, z: 7.5 }, { x: 6.5, z: 9.2 }, { x: 9.5, z: 10.6 }, FELDWEG_FERN], lader: [{ x: 7.3, z: 4.8 }, { x: 7.6, z: 8.5 }, { x: 9.5, z: 10.6 }, FELDWEG_FERN] };
const ZURUECK = { jeep: [{ x: 9.0, z: 10.6 }, { x: 4.0, z: 11.3 }, { x: -0.6, z: 11.0 }], lader: [{ x: 9.0, z: 10.6 }, { x: 8.4, z: 8.6 }, { x: 8.9, z: 4.0 }, { x: 8.9, z: 0.0 }, { x: 8.0, z: -1.6 }] };
// Fahrstile
const STIL = {
  jonny: { jeep: { v: 1.3, wackeln: 0.15 }, lader: { v: 2.0, wackeln: 0.1 } },
  waldo: { jeep: { v: 1.0, wackeln: 0.35 }, lader: { v: 1.6, wackeln: 0.3 } },
  torben: { jeep: { v: 7.0, wackeln: 0.5, lenkFaktor: 3.4, knapp: true }, lader: { v: 3.8, wackeln: 0.35, knapp: true } },
};

export function baueFahrten(c) {
  const { fz, welt, scene, dennis, jonny, waldo, torben, steuerung, kamera, hand, z, jz, wz, sag, dennisSagt, aerger, lob, sekunden, warte, dennisFrei } = c;
  const A = (text, symbol, tun) => ({ text, symbol, tun });
  const T = welt.draussen.fahrzeuge;
  const sitzVon = { jonny: (an) => jonny.sitzen(an ? 0.5 : null), torben: (an) => torben.sitzen(an ? 0.5 : null), waldo: (an) => waldo.haltung(an ? 'sitzen' : 'stehen', 0.5) };
  const figurVon = { jonny, waldo, torben };
  const sagVon = { jonny: ui.jonnySagt, waldo: ui.waldoSagt, torben: ui.torbenSagt };
  const fz2 = { aktiv: null, meckerAb: 0, rumsAb: 0, ersteFahrt: true, npc: false,
    naechsteFahrt: 150 + Math.random() * 60, grill: 'steht', grillSeit: 0,
    torben: { da: false, naechsterBesuch: 110 + Math.random() * 80, bisWeg: 0, naechsteFahrt: 0, unterwegs: false } };

  // ---------- Spieler fährt ----------
  function fussgaenger() {
    const l = [];
    if (dennis.wurzel.visible) l.push(dennis.position);
    for (const f of [jonny, waldo, torben]) if (f.wurzel.visible && f.wurzel.parent === scene) l.push(f.position);
    return l;
  }
  function einsteigen(f) {
    if (f.fahrer) return ui.hinweis('Da sitzt gerade jemand drin.');
    if (hand.item) return ui.hinweis('Erst die Hände frei machen, dann einsteigen.');
    f.fahrer = 'spieler';
    fz2.aktiv = f;
    steuerung.fahrModus({ steuern: (tasten, dt, neu) => steuern(f, tasten, dt, neu) }, f.art === 'lader' ? f.psi : f.psi);
    ui.fahrHilfe(f.art === 'lader'
      ? 'W/S fahren · A/D knicken · R/F Gabel hoch/runter · Leertaste hupen · E aussteigen'
      : `W/S fahren · A/D lenken · Leertaste hupen · E aussteigen${f.gedrosselt ? ' · (gedrosselt: nur Schritttempo)' : ''}`);
    blip(f.art === 'lader' ? 120 : 520, 0.25, 0.12);
    if (sekunden() > fz2.meckerAb) {
      fz2.meckerAb = sekunden() + 35 + Math.random() * 15;
      setTimeout(() => dennisSagt(sag(DENNIS.fahrenSpieler), true, { prio: 0 }), 1200);
      if (fz2.ersteFahrt) { fz2.ersteFahrt = false; aerger(2); }
    }
  }
  function aussteigen() {
    const f = fz2.aktiv;
    if (!f) return;
    // neben dem Fahrersitz aussteigen (links), sonst rechts, sonst hinten
    for (const [lx, lz] of [[1.0, f.sitz.z], [-1.0, f.sitz.z], [0, -1.6], [0, f.art === 'lader' ? 2.6 : 1.4]]) {
      const p = f.g.localToWorld(new THREE.Vector3(lx, 0, lz));
      const imWeg = welt.hindernisse.some((h) => h !== f.hindernis && p.x > h.xMin - 0.3 && p.x < h.xMax + 0.3 && p.z > h.zMin - 0.3 && p.z < h.zMax + 0.3);
      if (welt.begehbar(p.x, p.z, 0.3) && !imWeg) {
        f.fahrer = null;
        f.v = 0;
        fz2.aktiv = null;
        steuerung.fahrModus(null);
        const vorn = new THREE.Vector3(Math.sin(f.psi), 0, Math.cos(f.psi));
        steuerung.setze([p.x, AUGENHOEHE, p.z], [p.x + vorn.x * 3, 1.2, p.z + vorn.z * 3]);
        ui.fahrHilfe('');
        fz.anwenden(f, 0);
        return;
      }
    }
    ui.hinweis('Hier kommst du nicht raus. Fahr ein Stück weiter.');
  }
  function steuern(f, tasten, dt, neu) {
    const gas = (tasten.has('w') || tasten.has('arrowup') ? 1 : 0) - (tasten.has('s') || tasten.has('arrowdown') ? 1 : 0);
    const lenk = (tasten.has('a') || tasten.has('arrowleft') ? 1 : 0) - (tasten.has('d') || tasten.has('arrowright') ? 1 : 0);
    if (f.art === 'lader') {
      const hub = (tasten.has('r') ? 1 : 0) - (tasten.has('f') ? 1 : 0);
      const ereignis = fz.gabel(dt, hub);
      if (ereignis) { klonk(0.35); ui.hinweis(ereignis === 'aufgenommen' ? 'Palette auf der Gabel.' : 'Palette abgesetzt.'); }
    }
    const { dpsi, rums } = fz.schritt(f, dt, gas, lenk, fz.vMax(f), fussgaenger());
    if (rums) {
      klonk(0.5);
      if (sekunden() > fz2.rumsAb) { fz2.rumsAb = sekunden() + 20; aerger(1); setTimeout(() => dennisSagt(sag(DENNIS.anstoss), true, { prio: 1 }), 600); }
    }
    // beim Fahren meckert Dennis ab und zu
    if (Math.abs(f.v) > 0.4 && sekunden() > fz2.meckerAb) { fz2.meckerAb = sekunden() + 35 + Math.random() * 15; dennisSagt(sag(DENNIS.fahrenSpieler), true, { prio: 0 }); }
    if (neu.has(' ')) { blip(f.art === 'jeep' ? 880 : 330, 0.35, 0.2); blip(f.art === 'jeep' ? 1100 : 415, 0.35, 0.15); }
    if (neu.has('e')) setTimeout(aussteigen, 0);
    return { dpsi, auge: f.g.localToWorld(f.auge.clone()) };
  }

  // ---------- Grill (Feuerschale mit Dreibein) umgefahren ----------
  const grill = T.feuerstelle;
  const grillAufrecht = { pos: grill.position.clone(), rot: grill.rotation.clone(), h: { ...T.feuerHindernis } };
  function grillUm() {
    if (fz2.grill !== 'steht') return;
    fz2.grill = 'um';
    fz2.grillSeit = sekunden();
    grill.rotation.set(1.42, grillAufrecht.rot.y, 0.12);
    grill.position.set(grillAufrecht.pos.x, 0.12, grillAufrecht.pos.z + 0.3);
    Object.assign(T.feuerHindernis, { xMin: -5.1, xMax: -3.5, zMin: 7.6, zMax: 9.7 });
    klonk(0.7);
    setTimeout(() => { aerger(3); dennisSagt(sag(DENNIS.grillUm), true, { prio: 1 }); }, 1500);
  }
  function grillAuf() {
    grill.position.copy(grillAufrecht.pos);
    grill.rotation.copy(grillAufrecht.rot);
    Object.assign(T.feuerHindernis, grillAufrecht.h);
    fz2.grill = 'steht';
  }
  async function dennisStelltGrillAuf() {
    z.dennisRaeumt = true;
    dennis.stimmung('sauer');
    dennisSagt(sag(DENNIS.grillSelbst), true, { prio: 1 });
    for (const p of [TUER_INNEN, TUER_AUSSEN, { x: -4.3, z: 6.6 }]) await Promise.race([dennis.gehZu(p.x, p.z, 1.6), warte(9000)]);
    if (fz2.grill === 'um') { klonk(0.5); grillAuf(); aerger(8); }
    for (const p of [TUER_AUSSEN, TUER_INNEN]) await Promise.race([dennis.gehZu(p.x, p.z, 1.6), warte(9000)]);
    z.dennisRaeumt = false;
    dennis.stimmung('ruhig');
    dennis.heim();
  }
  // Tonnen wackeln, wenn jemand dagegen fährt
  function tonnenWackeln() {
    klonk(0.6);
    const t0 = performance.now();
    const tick = () => {
      const k = (performance.now() - t0) / 900;
      T.tonnen.rotation.z = k < 1 ? Math.sin(k * 20) * 0.05 * (1 - k) : 0;
      if (k < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  // ---------- Figuren fahren ----------
  function parkt(f) { return !f.fahrer && Math.hypot(f.x - f.park.x, f.z - f.park.z) < 1.0 && f.g.visible; }
  function einstiegPunkt(f) { return f.g.localToWorld(new THREE.Vector3(f.art === 'lader' ? 1.0 : 1.05, 0, f.sitz.z)); }
  async function geheWeg(figur, punkte, tempo = 1.3) {
    for (const p of punkte) if (!(await Promise.race([figur.gehZu(p.x, p.z, tempo), warte(12000).then(() => false)]))) return false;
    return true;
  }
  async function figurFaehrt(wer, f, { weg = false, drinnen = true } = {}) {
    const figur = figurVon[wer];
    const stil = STIL[wer][f.art];
    fz2.npc = true;
    const ein = einstiegPunkt(f);
    if (wer === 'waldo') waldo.haltung('stehen');
    if (drinnen) await geheWeg(figur, [TUER_INNEN, TUER_AUSSEN]);
    await geheWeg(figur, [ein]);
    if (f.fahrer || !parkt(f)) {
      // jemand war schneller (der Spieler)
      if (drinnen) await geheWeg(figur, [TUER_AUSSEN, TUER_INNEN]);
      fz2.npc = false;
      return false;
    }
    fz.figurRein(f, figur, sitzVon[wer]);
    blip(f.art === 'lader' ? 120 : 520, 0.25, 0.1);
    if (Math.random() < 0.7) sagVon[wer](sag(wer === 'torben' ? TORBEN.fahren : JONNY.fahren));
    setTimeout(() => { aerger(1); dennisSagt(sag(DENNIS.fahrenAndere), true, { prio: 0 }); }, 2500);
    const opt = {
      spielerPos: () => (fz2.aktiv ? null : kamera.position),
      beiRums: (was) => {
        if (was === 'grill') grillUm();
        else tonnenWackeln();
        if (wer === 'torben') setTimeout(() => ui.torbenSagt(sag(TORBEN.rums)), 700);
      },
    };
    if (weg) {
      await fz.fahreRoute(f, WEG[f.art], stil, opt);
      fz.verstecken(f, true);
      figur.wurzel.visible = false;
      await warte((50 + Math.random() * 40) * 1000);
      f.x = FELDWEG_FERN.x; f.z = FELDWEG_FERN.z; f.psi = -Math.PI / 2; f.knick = 0;
      fz.verstecken(f, false);
      figur.wurzel.visible = true;
      await fz.fahreRoute(f, fz.mitAnfahrt(f, ZURUECK[f.art]), stil, opt);
    } else {
      let route = f.art === 'jeep' ? RUNDE_JEEP : RUNDE_LADER;
      // Torben rumst mit dem Hoflader: Grill (wenn er steht) oder die Mülltonnen
      if (wer === 'torben' && f.art === 'lader') {
        route = [...route];
        const i = route.findIndex((p) => p.x === -6.5);
        route.splice(i + 1, 0, fz2.grill === 'steht' && Math.random() < 0.7 ? { x: -4.3, z: 6.75, rums: 'grill', v: 0.7 } : { x: -4.0, z: 5.62, rums: 'tonnen', v: 0.7 });
      }
      await fz.fahreRoute(f, fz.mitAnfahrt(f, route), stil, opt);
    }
    await fz.einparken(f);
    const aus = einstiegPunkt(f);
    fz.figurRaus(f, figur, sitzVon[wer], aus.x, aus.z);
    blip(200, 0.15, 0.08);
    fz2.npc = false;
    if (wer === 'jonny') { await geheWeg(jonny, [TUER_AUSSEN, TUER_INNEN]); await jonny.heim(); }
    if (wer === 'waldo') { await geheWeg(waldo, [TUER_AUSSEN, TUER_INNEN, { x: 2.6, z: 2.75 }]); waldo.haltung('handy'); wz.ort = 'stehen'; }
    if (wer === 'torben') await geheWeg(torben, [TORBEN_PLATZ]);
    return true;
  }

  // ---------- Torben kommt ab und zu vorbei (zu Fuß den Feldweg hoch) ----------
  async function torbenKommt() {
    const tb = fz2.torben;
    tb.da = true;
    tb.unterwegs = true;
    torben.sichtbar(true);
    torben.wurzel.position.set(26, 0, 10.6);
    await geheWeg(torben, [{ x: 9.0, z: 10.6 }, TORBEN_PLATZ], 1.5);
    ui.torbenSagt(sag(TORBEN.hallo));
    setTimeout(() => dennisSagt(sag(DENNIS.torbenDa), true, { prio: 0 }), 2500);
    tb.bisWeg = sekunden() + 120 + Math.random() * 60;
    tb.naechsteFahrt = sekunden() + 15 + Math.random() * 15;
    tb.unterwegs = false;
  }
  async function torbenGeht() {
    const tb = fz2.torben;
    tb.unterwegs = true;
    ui.torbenSagt(sag(TORBEN.tschuess));
    await geheWeg(torben, [{ x: 9.0, z: 10.6 }, { x: 26, z: 10.6 }], 1.5);
    torben.sichtbar(false);
    tb.da = false;
    tb.unterwegs = false;
    tb.naechsterBesuch = sekunden() + 150 + Math.random() * 90;
  }

  function update() {
    if (z.vorbei) return;
    const t = sekunden();
    // Grill liegt: nach 75 s macht Dennis es selbst
    if (fz2.grill === 'um' && t - fz2.grillSeit > 75 && !z.dennisRaeumt && dennisFrei()) dennisStelltGrillAuf();
    const tb = fz2.torben;
    if (!tb.da && !tb.unterwegs && t > tb.naechsterBesuch && !fz2.npc) torbenKommt();
    if (tb.da && !tb.unterwegs && !fz2.npc) {
      if (t > tb.bisWeg) torbenGeht();
      else if (t > tb.naechsteFahrt) {
        tb.naechsteFahrt = t + 30 + Math.random() * 30;
        const f = Math.random() < 0.55 ? fz.jeep : fz.lader;
        if (parkt(f)) { tb.unterwegs = true; figurFaehrt('torben', f, { drinnen: false, weg: f.art === 'jeep' && Math.random() < 0.25 }).finally(() => { tb.unterwegs = false; }); }
      }
    }
    // Jonny oder Waldo drehen ab und zu eine Runde oder fahren kurz weg
    if (!fz2.npc && t > fz2.naechsteFahrt) {
      fz2.naechsteFahrt = t + 120 + Math.random() * 90;
      const f = Math.random() < 0.65 ? fz.jeep : fz.lader;
      if (!parkt(f)) return;
      const jonnyFrei = jz.da && !jz.draussen && !jz.beschaeftigt && jz.stoertSeit < 0 && jonny.wurzel.visible;
      const waldoFrei = waldo.wurzel.visible && wz.ort && !wz.beschaeftigt && !wz.streit;
      if (jonnyFrei && (!waldoFrei || Math.random() < 0.6)) {
        jz.beschaeftigt = true;
        jonny.rauchen(false); z.jonnyRaucht = false;
        figurFaehrt('jonny', f, { weg: f.art === 'jeep' && Math.random() < 0.5 }).finally(() => { jz.beschaeftigt = false; });
      } else if (waldoFrei) {
        wz.beschaeftigt = true;
        figurFaehrt('waldo', f).finally(() => { wz.beschaeftigt = false; });
      }
    }
  }

  function menue(id) {
    switch (id) {
      case 'minijeep': {
        const f = fz.jeep;
        if (f.fahrer && f.fahrer !== 'spieler') return ['Mini-Jeep', 'Da sitzt gerade jemand drin.', []];
        return ['Mini-Jeep', f.gedrosselt ? 'Rosa Elektro-Jeep in Kindergröße. Gedrosselt: fährt nur Schritttempo. Torben wüsste, wie man das ändert.' : 'Rosa Elektro-Jeep. Entdrosselt. Der geht jetzt richtig ab.',
          [A('Einsteigen und fahren', 'hand', () => einsteigen(f))]];
      }
      case 'weidemann': {
        const f = fz.lader;
        if (f.fahrer && f.fahrer !== 'spieler') return ['Hoflader', 'Da sitzt gerade jemand drin.', []];
        if (!LADER_SCHLUESSEL_STECKT) return ['Hoflader', 'Abgeschlossen. Den Schlüssel hat Dennis.', [A('Trotzdem probieren', 'hand', () => dennisSagt(sag(DENNIS.weidemannZu), true, { prio: 2 }))]];
        return ['Hoflader', 'Roter Hoflader, Knicklenker mit Palettengabel. Der Schlüssel steckt.', [A('Einsteigen und fahren', 'hand', () => einsteigen(f))]];
      }
      case 'feuerschale':
        if (fz2.grill === 'um') return ['Feuerschale', 'Umgefahren. Asche überall. Dennis wird das nicht gefallen.', [A('Wieder aufstellen', 'hand', () => {
          grillAuf();
          klonk(0.4);
          z.wut = Math.max(0, z.wut - 6);
          lob(sag(DENNIS.grillDanke));
        })]];
        return null;
      case 'torben':
        return ['Torben', 'Erledigt die schweren Sachen. Fährt alles, was Räder hat.', [
          A('Quatschen', 'frage', () => ui.torbenSagt(sag(TORBEN.quatschen))),
          A('Lieb fragen: Jeep entdrosseln?', 'hand', () => {
            if (fz.jeep.gedrosselt) { fz.entdrosseln(); ui.torbenSagt(sag(TORBEN.entdrosseln), 6000); blip(700, 0.1); }
            else ui.torbenSagt(sag(TORBEN.schonEntdrosselt));
          }),
        ]];
      default:
        return null;
    }
  }

  return {
    menue,
    update,
    get faehrt() { return !!fz2.aktiv; },
    zustand: fz2,
    // nur für Tests
    test: { einsteigen, aussteigen, figurFaehrt, torbenKommt, torbenGeht, grillUm, grillAuf, dennisStelltGrillAuf },
  };
}
