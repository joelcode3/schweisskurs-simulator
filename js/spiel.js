// Spielablauf: Zustand, Aktionen, Fehler, Dennis-Reaktionen, Bewertung.
import * as THREE from 'three';
import { STATIONEN, AUGENHOEHE } from './world.js';
import { auftritt, hatClip, buehneBelegt } from './clips.js';
import { pfadSpiel, schlackeSpiel } from './minispiele.js';
import { blip, kratzen, jingle, klonk, technoAn, technoAus, technoBeat, klospuelung, mampfen, klick as schalterKlick, stimmeAbspielen } from './audio.js';
import * as ui from './ui.js';
import { DENNIS } from './texte.js';

const zufallAus = (liste) => liste[Math.floor(Math.random() * liste.length)];

// Fehler: Stufe, Wutpunkte, Clip-Kategorie, Platzhalter-Sprüche
const FEHLER = {
  brille: {
    stufe: 'mittel', wut: 20, clip: 'fehler_brille', name: 'Ohne Schutzbrille geflext',
    texte: DENNIS.fehler.brille,
  },
  handschuhe: {
    stufe: 'leicht', wut: 8, clip: 'fehler_handschuhe', name: 'Ohne Handschuhe gearbeitet',
    texte: DENNIS.fehler.handschuhe,
  },
  schweissenHandschuhe: {
    stufe: 'mittel', wut: 15, clip: 'fehler_handschuhe', name: 'Ohne Handschuhe geschweißt',
    texte: DENNIS.fehler.schweissenHandschuhe,
  },
  gasflasche: {
    stufe: 'voll', wut: 45, clip: 'fehler_gasflasche', name: 'Ungespülte Gasflasche aufgeschnitten',
    texte: DENNIS.fehler.gasflasche,
  },
  helm: {
    stufe: 'voll', wut: 40, clip: 'fehler_helm', name: 'Ohne Schweißhelm geschweißt',
    texte: DENNIS.fehler.helm,
  },
  masse: {
    stufe: 'leicht', wut: 8, clip: 'fehler_masse', name: 'Masseklemme vergessen',
    texte: DENNIS.fehler.masse,
  },
  strom: {
    stufe: 'leicht', wut: 10, clip: 'fehler_strom', name: 'Stromstärke falsch eingestellt',
    texte: DENNIS.fehler.stromHoch,
  },
  naht: {
    stufe: 'leicht', wut: 8, clip: 'fehler_naht', name: 'Schlechte Schweißnaht',
    texte: DENNIS.fehler.naht,
  },
  schnitt: {
    stufe: 'leicht', wut: 6, clip: 'fehler_schnitt', name: 'Schiefer Schnitt',
    texte: DENNIS.fehler.schnitt,
  },
  schlacke: {
    stufe: 'leicht', wut: 6, clip: 'fehler_schlacke', name: 'Schlacke nicht entfernt',
    texte: DENNIS.fehler.schlacke,
  },
  schlackeBrille: {
    stufe: 'mittel', wut: 15, clip: 'fehler_brille', name: 'Schlacke ohne Brille geklopft',
    texte: DENNIS.fehler.schlackeBrille,
  },
  kaffee: {
    stufe: 'mittel', wut: 20, clip: 'fehler_kaffee', name: 'An Dennis’ Kaffee gegangen',
    texte: DENNIS.fehler.kaffee,
  },
  kiwi: {
    stufe: 'mittel', wut: 12, clip: 'fehler_kiwi', name: 'Dennis’ Kiwis geplündert',
    texte: DENNIS.fehler.kiwi,
  },
  brotdose: {
    stufe: 'voll', wut: 30, clip: 'fehler_brotdose', name: 'In Dennis’ Brotdose gebissen',
    texte: DENNIS.fehler.brotdose,
  },
  kaffeeZuviel: {
    stufe: 'leicht', wut: 5, clip: 'fehler_kaffee', name: 'Dennis mit Kaffee abgefüllt',
    texte: [DENNIS.kaffee.genug],
  },
  licht: {
    stufe: 'leicht', wut: 4, clip: 'licht', nurZeichnung: true, name: 'Licht ausgemacht',
    texte: [DENNIS.licht],
  },
  huefte: {
    stufe: 'leicht', wut: 3, clip: 'huefte', nurZeichnung: true, name: 'Dennis am Boden liegen lassen',
    texte: DENNIS.huefte.jammern,
  },
  nerven: {
    stufe: 'leicht', wut: 6, clip: 'fehler_nerven', name: 'Dennis zu oft gefragt',
    texte: DENNIS.fehler.nerven,
  },
};
const STUFEN_CLIP = { leicht: 'ermahnung', mittel: 'sauer', voll: 'ausraster' };
const STUFEN_STIMMUNG = { leicht: 'skeptisch', mittel: 'sauer', voll: 'wut' };

const LOB = DENNIS.lob;

const NAEHTE = {
  scharniere: { name: 'Scharniere und Griffe', form: 'zwei', text: 'Zwei kurze Nähte. Gleichmäßig von links nach rechts ziehen, zwischendurch absetzen.' },
  beine: { name: 'Beine', form: 'kreisKlein', text: 'Rund um das Bein. Ruhig und gleichmäßig führen (für alle drei Beine).' },
  rohr: { name: 'Ofenrohr', form: 'kreis', text: 'Einmal komplett rundherum. Nicht hetzen, nicht trödeln.' },
};

export function baueSpiel({ welt, dennis, steuerung, kamera, dennisModus }) {
  const z = {
    ppe: { brille: false, handschuhe: false, helm: false },
    ventilAuf: false,
    gespuelt: false,
    ort: 'wasch',
    angezeichnet: false,
    geschnitten: false,
    schnittQ: null,
    strom: 140,
    stromGesetzt: false,
    stromGemeldet: false,
    masse: false,
    naehte: { scharniere: null, beine: null, rohr: null },
    schlackeWeg: false,
    lackiert: false,
    wut: 0,
    wutMax: 0,
    fehler: [],
    fragen: 0,
    start: performance.now(),
    beschaeftigt: false,
    kaffeeInHand: false,
    kaffees: 0,
    kiwisGegessen: 0,
    musik: false,
    licht: true,
    lichtAusSeit: 0,
    lichtGemeckert: 0,
    huefte: 'nie',
    nebenDennis: 0,
    mittag: 'nie',
    dennisFegt: false,
    dennisHatGefegt: false,
    dreckSeit: 0,
    baustelleZuletzt: -999,
    jammerTimer: 0,
    vorbei: false,
  };
  const multi = dennisModus ? 2 : 1;

  function alleNaehte() { return Object.values(z.naehte).every((q) => q !== null); }
  function irgendeineNaht() { return Object.values(z.naehte).some((q) => q !== null); }

  function aufgaben() {
    return [
      { text: 'Restgas ablassen (Ventil auf)', fertig: z.ventilAuf },
      { text: 'Flasche mit Wasser spülen', fertig: z.gespuelt },
      { text: 'Flasche zur Werkbank bringen', fertig: z.ort !== 'wasch' },
      { text: 'Ofentür anzeichnen', fertig: z.angezeichnet },
      { text: 'Ofentür ausschneiden', fertig: z.geschnitten },
      { text: 'Flasche zum Schweißplatz bringen', fertig: z.ort === 'schweiss' },
      { text: 'Schweißgerät einstellen', fertig: z.stromGesetzt },
      { text: 'Scharniere und Griffe anschweißen', fertig: z.naehte.scharniere !== null },
      { text: 'Beine anschweißen', fertig: z.naehte.beine !== null },
      { text: 'Ofenrohr anschweißen', fertig: z.naehte.rohr !== null },
      { text: 'Schlacke abklopfen', fertig: alleNaehte() && z.schlackeWeg },
      { text: 'Ofen schwarz lackieren', fertig: z.lackiert },
      { text: 'Ofen bei Dennis abgeben', fertig: z.vorbei },
    ];
  }

  function aktualisieren() {
    ui.aufgabenZeigen(aufgaben());
    ui.ausruestungZeigen(z.ppe);
    ui.wutZeigen(z.wut, stimmungAusWut());
    welt.objekte.flasche.zeige(z);
    welt.setzeFlasche(z.ort, z.naehte.beine !== null);
  }

  function stimmungAusWut() {
    return z.wut >= 70 ? 'wut' : z.wut >= 40 ? 'sauer' : z.wut >= 12 ? 'skeptisch' : 'ruhig';
  }

  // ---------- Dennis kommt rüber ----------
  function platzVorSpieler(abstand) {
    const vorne = steuerung.blickRichtung();
    vorne.y = 0;
    vorne.normalize();
    const p = kamera.position;
    const frei = (x, zz) => x > -4.6 && x < 4.6 && zz > -3.6 && zz < 3.6
      && !welt.hindernisse.some((h) => x > h.xMin - 0.3 && x < h.xMax + 0.3 && zz > h.zMin - 0.3 && zz < h.zMax + 0.3);
    const a = { x: p.x + vorne.x * abstand, z: p.z + vorne.z * abstand };
    if (frei(a.x, a.z)) return a;
    const zuDennis = new THREE.Vector3(dennis.position.x - p.x, 0, dennis.position.z - p.z).normalize();
    const b = { x: p.x + zuDennis.x * abstand, z: p.z + zuDennis.z * abstand };
    if (frei(b.x, b.z)) return b;
    // seitlich probieren
    for (const w of [Math.PI / 2, -Math.PI / 2, Math.PI]) {
      const v = vorne.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), w);
      const c = { x: p.x + v.x * abstand, z: p.z + v.z * abstand };
      if (frei(c.x, c.z)) return c;
    }
    return b;
  }

  async function dennisKommt(tempo) {
    if (dennis.modus === 'liegen') {
      await steuerung.dreheZu(dennis.kopfPosition(), 0.35);
      return;
    }
    const nah = Math.hypot(dennis.position.x - kamera.position.x, dennis.position.z - kamera.position.z);
    if (nah < 1.9 && nah > 0.8) {
      await steuerung.dreheZu(dennis.kopfPosition(), 0.35);
      return;
    }
    const ziel = platzVorSpieler(1.15);
    const ankunft = dennis.gehZu(ziel.x, ziel.z, tempo);
    let zuSpaet = false;
    await Promise.race([ankunft, new Promise((r) => setTimeout(() => { zuSpaet = true; r(); }, 3500))]);
    if (zuSpaet) {
      const p = dennis.position;
      dennis.springZu(ziel.x, ziel.z);
      dennis.wurzel.rotation.y = Math.atan2(kamera.position.x - p.x, kamera.position.z - p.z);
    }
    await steuerung.dreheZu(dennis.kopfPosition(), 0.35);
  }

  async function fehler(id, extraText) {
    const f = FEHLER[id];
    ui.schliesseMenue();
    z.beschaeftigt = true;
    steuerung.sperre(true);
    const plus = f.wut * multi;
    z.wut = Math.min(100, z.wut + plus);
    z.wutMax = Math.max(z.wutMax, z.wut);
    z.fehler.push(f.name);
    ui.wutZeigen(z.wut, STUFEN_STIMMUNG[f.stufe]);
    ui.wutWackeln();
    dennis.stimmung(STUFEN_STIMMUNG[f.stufe]);
    if (f.stufe === 'voll') {
      document.getElementById('welt').animate(
        [{ transform: 'translate(0,0)' }, { transform: 'translate(-12px,6px)' }, { transform: 'translate(10px,-8px)' }, { transform: 'translate(-6px,4px)' }, { transform: 'translate(0,0)' }],
        { duration: 450 },
      );
    }
    if (f.stufe !== 'leicht') await dennisKommt(f.stufe === 'voll' ? 3.6 : 2.4);
    const text = extraText || zufallAus(f.texte);
    await auftritt({ schluessel: f.nurZeichnung ? [f.clip] : [f.clip, STUFEN_CLIP[f.stufe]], text, stufe: f.stufe, stimmung: STUFEN_STIMMUNG[f.stufe] });
    if (z.wut >= 100) {
      await rausgeflogen();
      return;
    }
    dennis.stimmung(stimmungAusWut() === 'wut' ? 'sauer' : 'ruhig');
    if (!dennis.istDaheim()) dennis.heim();
    aktualisieren();
    steuerung.sperre(false);
    z.beschaeftigt = false;
  }

  async function lob(text) {
    z.beschaeftigt = true;
    z.wut = Math.max(0, z.wut - 5);
    dennis.stimmung('froh');
    jingle(true);
    await auftritt({ schluessel: ['lob'], text: text || zufallAus(LOB), stufe: 'lob', stimmung: 'froh' });
    dennis.stimmung('ruhig');
    aktualisieren();
    z.beschaeftigt = false;
  }

  // ---------- Aktionen ----------
  function gehZuStation(id) {
    if (steuerung.station() === id) return Promise.resolve();
    return steuerung.zuStation(id);
  }

  async function ventilAufdrehen() {
    const ok = await ui.haltenDialog({ titel: 'Restgas ablassen', text: 'Ventil langsam aufdrehen und das restliche Gas entweichen lassen. Draußen wäre besser, aber Dennis hat das Tor aufgemacht.', knopf: 'Gedrückt halten', sekunden: 2.5, geraeusch: 'gas' });
    if (!ok) return;
    z.ventilAuf = true;
    welt.objekte.flasche.ventil.rotation.z += Math.PI * 3;
    ui.hinweis('Zischt nicht mehr. Restgas ist raus.');
    aktualisieren();
  }

  async function spuelen() {
    if (z.ort !== 'wasch') { ui.hinweis('Die Flasche muss dafür zum Waschplatz.'); return; }
    if (!z.ventilAuf) { ui.hinweis('Das Ventil ist noch zu. Da kommt kein Wasser rein.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Flasche spülen', text: 'Randvoll mit Wasser füllen, schütteln, auskippen. Das drückt die letzten Gasreste raus.', knopf: 'Wasser marsch (halten)', sekunden: 3, geraeusch: 'wasser' });
    if (!ok) return;
    z.gespuelt = true;
    ui.hinweis('Gespült und ausgekippt. Jetzt ist kein Gas mehr drin.');
    aktualisieren();
  }

  async function tragen(ziel) {
    z.ort = ziel;
    blip(400, 0.08);
    aktualisieren();
    await gehZuStation(ziel);
  }

  async function anzeichnen() {
    if (z.ort !== 'werkbank') { ui.hinweis('Erst die Flasche auf die Werkbank legen.'); return; }
    if (z.angezeichnet) { ui.hinweis('Ist schon angezeichnet.'); return; }
    kratzen();
    z.angezeichnet = true;
    ui.hinweis('Mit Speckstein eine Tür angezeichnet.');
    aktualisieren();
  }

  async function schneiden() {
    if (z.ort !== 'werkbank') { ui.hinweis('Erst die Flasche auf die Werkbank legen.'); return; }
    if (z.geschnitten) { ui.hinweis('Die Tür ist schon raus.'); return; }
    if (!z.angezeichnet) { ui.hinweis('Erst anzeichnen, sonst wird das krumm.'); return; }
    if (!z.gespuelt) return fehler('gasflasche');
    if (!z.ppe.brille) return fehler('brille');
    if (!z.ppe.handschuhe) return fehler('handschuhe');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await pfadSpiel({ art: 'schneiden', form: 'rechteck', titel: 'Tür ausschneiden', text: 'Am gelben Punkt ansetzen, gedrückt halten und die Kreidelinie entlangfahren.' });
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.geschnitten = true;
    z.schnittQ = e.qualitaet;
    welt.dreckHin(0, -2.2, 5);
    z.dreckSeit = sekundenSeitStart();
    aktualisieren();
    if (e.qualitaet < 55) await fehler('schnitt');
    else if (e.qualitaet >= 88) await lob(DENNIS.lobSchnitt);
  }

  async function stromEinstellen() {
    const a = await ui.stromDialog(z.strom);
    if (a !== z.strom) z.stromGemeldet = false;
    z.strom = a;
    z.stromGesetzt = true;
    welt.zeigeStrom(a);
    aktualisieren();
  }

  function masseUmschalten() {
    z.masse = !z.masse;
    welt.klemmeMasse(z.masse);
    klonk(0.4);
    ui.hinweis(z.masse ? 'Masseklemme sitzt am Schweißtisch.' : 'Masseklemme abgemacht.');
  }

  async function schweissen(teil) {
    if (z.ort !== 'schweiss') { ui.hinweis('Die Flasche muss erst zum Schweißplatz.'); return; }
    if (!z.geschnitten) { ui.hinweis('Erst die Tür ausschneiden.'); return; }
    if (z.naehte[teil] !== null) { ui.hinweis('Ist schon dran.'); return; }
    if (!z.masse) return fehler('masse');
    if (!z.ppe.helm) return fehler('helm');
    if (!z.ppe.handschuhe) return fehler('schweissenHandschuhe');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const n = NAEHTE[teil];
    const e = await pfadSpiel({ art: 'schweissen', form: n.form, titel: `${n.name} anschweißen`, text: n.text, strom: z.strom, helm: z.ppe.helm });
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.naehte[teil] = e.qualitaet;
    z.schlackeWeg = false;
    welt.dreckHin(3.1, -2.1, 2);
    z.dreckSeit = sekundenSeitStart();
    aktualisieren();
    if (teil === 'beine') await steuerung.zuStation('schweiss');
    if (e.strom !== 'ok' && !z.stromGemeldet) {
      z.stromGemeldet = true;
      const text = zufallAus(e.strom === 'hoch' ? DENNIS.fehler.stromHoch : DENNIS.fehler.stromNiedrig);
      await fehler('strom', text);
    } else if (e.qualitaet < 50) {
      await fehler('naht');
    } else if (e.qualitaet >= 82) {
      await lob();
    }
  }

  async function schlackeKlopfen() {
    if (z.ort !== 'schweiss' || !irgendeineNaht()) { ui.hinweis('Da ist noch keine Naht zum Abklopfen.'); return; }
    if (z.schlackeWeg) { ui.hinweis('Ist schon blank.'); return; }
    if (!z.ppe.brille) return fehler('schlackeBrille');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await schlackeSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (e.fertig) {
      z.schlackeWeg = true;
      ui.hinweis(alleNaehte() ? 'Alle Nähte blank. Jetzt noch lackieren.' : 'Blank. Fehlen aber noch Nähte.');
      aktualisieren();
    }
  }

  async function lackieren() {
    if (!alleNaehte() || !z.schlackeWeg) { ui.hinweis('Erst alles fertig schweißen und die Schlacke abklopfen.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Ofen lackieren', text: 'Hitzefester Ofenlack, mattschwarz. Gleichmäßig aus 20 cm Abstand sprühen.', knopf: 'Sprühen (halten)', sekunden: 3, geraeusch: 'gas' });
    if (!ok) return;
    z.lackiert = true;
    ui.hinweis('Schick! Ab zu Dennis damit.');
    aktualisieren();
  }

  function naechsterTipp() {
    const t = DENNIS.tipp;
    if (!z.ventilAuf) return t.ventil;
    if (!z.gespuelt) return t.spuelen;
    if (z.ort === 'wasch') return t.werkbank;
    if (!z.angezeichnet) return t.anzeichnen;
    if (!z.geschnitten) return z.ppe.brille && z.ppe.handschuhe ? t.schneiden : t.schneidenAusruestung;
    if (z.ort !== 'schweiss') return t.schweissplatz;
    if (!z.stromGesetzt) return t.strom;
    if (!alleNaehte()) {
      if (!z.masse && !z.ppe.helm) return t.schweissenMasseHelm;
      if (!z.masse) return t.schweissenMasse;
      if (!z.ppe.helm) return t.schweissenHelm;
      return t.schweissen;
    }
    if (!z.schlackeWeg) return t.schlacke;
    if (!z.lackiert) return t.lackieren;
    return t.fertig;
  }

  async function dennisFragen() {
    z.fragen++;
    if (z.fragen > 3 && z.fragen % 3 === 1) return fehler('nerven');
    dennis.stimmung('ruhig');
    await auftritt({ schluessel: ['tipp'], text: naechsterTipp(), stufe: 'info', stimmung: 'ruhig' });
  }

  async function abgeben() {
    if (!alleNaehte()) {
      await auftritt({ schluessel: ['tipp'], text: DENNIS.nichtFertig, stufe: 'info', stimmung: 'skeptisch' });
      return;
    }
    if (!z.schlackeWeg) {
      await fehler('schlacke');
      return;
    }
    if (!z.lackiert) {
      await auftritt({ schluessel: ['tipp'], text: DENNIS.nichtLackiert, stufe: 'info', stimmung: 'skeptisch' });
      return;
    }
    await ende();
  }

  // ---------- Klicks auf Objekte ----------
  async function hinZu(info, obj) {
    if (info.station) {
      await gehZuStation(info.station);
      return;
    }
    const ziel = new THREE.Vector3();
    obj.getWorldPosition(ziel);
    const p = kamera.position;
    const d = Math.hypot(ziel.x - p.x, ziel.z - p.z);
    if (d > 2.2) {
      const richtung = new THREE.Vector3(p.x - ziel.x, 0, p.z - ziel.z).normalize();
      const stand = [ziel.x + richtung.x * 1.3, AUGENHOEHE, ziel.z + richtung.z * 1.3];
      await steuerung.fahreZu(stand, [ziel.x, ziel.y + (info.id === 'dennis' ? 1.5 : 0), ziel.z]);
    }
  }

  // ---------- Kaffeeecke, Box, Licht, Besen, Hüfte ----------
  async function kaffeeKochen() {
    const ok = await ui.haltenDialog({ titel: 'Kaffee kochen', text: 'Schwarz, stark, in Dennis’ Becher. So wie er ihn mag.', knopf: 'Brühen (halten)', sekunden: 2, geraeusch: 'wasser' });
    if (!ok) return;
    z.kaffeeInHand = true;
    ui.hinweis('Kaffee in der Hand. Ab zu Dennis damit.');
  }

  async function kaffeeGeben() {
    z.kaffeeInHand = false;
    z.kaffees++;
    if (z.kaffees >= 3) return fehler('kaffeeZuviel');
    z.wut = Math.max(0, z.wut - (z.kaffees === 1 ? 15 : 8));
    await lob(z.kaffees === 1 ? DENNIS.kaffee.danke : DENNIS.kaffee.nochmal);
  }

  async function kiwiEssen() {
    if (z.kiwisGegessen >= 6) { ui.hinweis('Keine Kiwis mehr da.'); return; }
    z.kiwisGegessen++;
    welt.kiwisZeigen(6 - z.kiwisGegessen);
    mampfen();
    if (z.kiwisGegessen === 1) {
      await auftritt({ schluessel: ['lob'], text: DENNIS.kiwi.erste, stufe: 'info', stimmung: 'froh' });
    } else if (z.kiwisGegessen === 2) {
      await auftritt({ schluessel: ['tipp'], text: DENNIS.kiwi.zweite, stufe: 'info', stimmung: 'skeptisch' });
    } else {
      await fehler('kiwi', z.kiwisGegessen >= 6 ? DENNIS.kiwi.leer : undefined);
    }
  }

  function musikUmschalten() {
    z.musik = !z.musik;
    schalterKlick();
    if (z.musik) {
      technoAn();
      welt.boxTakt(technoBeat);
      ui.hinweis('Bumm. Bumm. Bumm.');
    } else {
      const tanzte = dennis.modus === 'tanzen';
      technoAus();
      welt.boxTakt(null);
      if (tanzte && !buehneBelegt()) auftritt({ schluessel: ['musik'], text: DENNIS.musikAus, stufe: 'leicht', stimmung: 'skeptisch' });
    }
  }

  function lichtUmschalten() {
    z.licht = !z.licht;
    schalterKlick();
    welt.licht(z.licht);
    z.lichtAusSeit = 0;
  }

  async function fegen() {
    if (!welt.dreck) { ui.hinweis('Ist schon sauber.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Fegen', text: 'Schleifstaub und Zunder zusammenkehren.', knopf: 'Fegen (halten)', sekunden: 2.5, geraeusch: 'gas' });
    if (!ok) return;
    welt.dreckWeg();
    z.gefegt = true;
    ui.hinweis('Boden ist sauber.');
    if (!buehneBelegt()) auftritt({ schluessel: ['lob'], text: DENNIS.fegen, stufe: 'lob', stimmung: 'froh' });
  }

  // ---------- Dennis fegt selbst, wenn der Dreck zu lange liegt ----------
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  async function dennisFegt() {
    z.dennisFegt = true;
    const abbruch = () => {
      dennis.besen(false);
      dennis.setzeModus('normal');
      welt.besenSichtbar(true);
      z.dennisFegt = false;
    };
    if (!(await dennis.gehZu(welt.BESEN.x, welt.BESEN.z, 1.3))) return abbruch();
    welt.besenSichtbar(false);
    dennis.besen(true);
    const m = welt.dreckMitte;
    if (!m) return abbruch();
    if (!(await dennis.gehZu(m.x, m.z + 0.55, 1.2))) return abbruch();
    dennis.wurzel.rotation.y = Math.PI;
    dennis.setzeModus('fegen');
    const ton = await ortsTon('stimme/muell.mp3');
    await warte(5200);
    if (ton) ton.stopp();
    if (dennis.modus !== 'fegen') return abbruch();
    welt.dreckWeg();
    z.dennisHatGefegt = true;
    dennis.setzeModus('normal');
    if (!(await dennis.gehZu(welt.BESEN.x, welt.BESEN.z, 1.3))) return abbruch();
    abbruch();
    dennis.heim();
  }

  // ---------- Murmeln: Originaltöne, lauter je näher man ist ----------
  const MURMELN = [1, 2, 3, 4, 5, 6, 7].map((n) => `stimme/murmeln-${n}.mp3`);
  let murmelTon = null;
  let naechstesMurmeln = 20;
  let letzterMurmel = -1;
  function lautstaerkeNachAbstand() {
    const d = Math.hypot(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
    return Math.max(0, Math.min(1, (5.5 - d) / 4.5)) * 1.1;
  }
  async function ortsTon(url) {
    const t = await stimmeAbspielen(url);
    if (!t) return null;
    t.lautstaerke(lautstaerkeNachAbstand());
    murmelTon = t;
    t.fertig.then(() => { if (murmelTon === t) murmelTon = null; });
    return t;
  }
  async function murmeln() {
    let n;
    do { n = Math.floor(Math.random() * MURMELN.length); } while (n === letzterMurmel && MURMELN.length > 1);
    letzterMurmel = n;
    await ortsTon(MURMELN[n]);
  }

  async function mittagspause() {
    z.mittag = 'gerade';
    z.beschaeftigt = true;
    welt.objekte.brotdose.visible = false;
    dennis.mittagspause(true);
    await dennisKommt(1.1);
    await auftritt({ schluessel: ['tomate'], text: DENNIS.tomate, stufe: 'info', stimmung: 'froh' });
    z.beschaeftigt = false;
    z.mittag = 'erledigt';
    await dennis.heim();
    dennis.mittagspause(false);
    welt.objekte.brotdose.visible = true;
  }

  async function aufhelfen() {
    z.huefte = 'erledigt';
    z.beschaeftigt = true;
    dennis.setzeModus('normal');
    await new Promise((r) => setTimeout(r, 900));
    z.wut = Math.max(0, z.wut - 5);
    await auftritt({ schluessel: ['lob'], text: DENNIS.huefte.danke, stufe: 'mittel', stimmung: 'froh' });
    z.beschaeftigt = false;
    aktualisieren();
    dennis.heim();
  }

  function menueFuer(id) {
    const A = (text, symbol, tun) => ({ text, symbol, tun });
    switch (id) {
      case 'brille':
      case 'handschuhe':
      case 'helm': {
        const namen = { brille: 'Schutzbrille', handschuhe: 'Schweißerhandschuhe', helm: 'Schweißhelm' };
        return [namen[id], 'Gehört zur Schutzausrüstung.', [A(id === 'handschuhe' ? 'Anziehen' : 'Aufsetzen', id, () => {
          z.ppe[id] = true;
          welt.objekte[id].removeFromParent();
          blip(660, 0.08);
          ui.hinweis(`${namen[id]}: ${id === 'handschuhe' ? 'angezogen' : 'aufgesetzt'}.`);
          aktualisieren();
        })]];
      }
      case 'flasche': {
        const a = [];
        if (z.ort === 'wasch') {
          if (!z.ventilAuf) a.push(A('Ventil aufdrehen, Restgas ablassen', 'ventil', ventilAufdrehen));
          if (!z.gespuelt) a.push(A('Mit Wasser spülen', 'wasser', spuelen));
          a.push(A('Zur Werkbank tragen', 'tragen', () => tragen('werkbank')));
        } else if (z.ort === 'werkbank') {
          if (!z.angezeichnet) a.push(A('Tür anzeichnen (Speckstein)', 'stift', anzeichnen));
          if (!z.geschnitten) a.push(A('Tür ausschneiden (Flex)', 'funke', schneiden));
          if (z.geschnitten) a.push(A('Zum Schweißplatz tragen', 'tragen', () => tragen('schweiss')));
          if (!z.gespuelt) a.push(A('Zurück zum Waschplatz tragen', 'tragen', () => tragen('wasch')));
        } else {
          for (const [k, n] of Object.entries(NAEHTE)) if (z.naehte[k] === null) a.push(A(`${n.name} anschweißen`, 'funke', () => schweissen(k)));
          if (irgendeineNaht() && !z.schlackeWeg) a.push(A('Schlacke abklopfen', 'hammer', schlackeKlopfen));
          if (alleNaehte() && z.schlackeWeg && !z.lackiert) a.push(A('Mit Ofenlack schwarz lackieren', 'funke', lackieren));
        }
        const info = z.ort === 'wasch'
          ? `Propanflasche 11 kg, angeblich leer. ${z.ventilAuf ? 'Ventil offen.' : 'Ventil zu.'} ${z.gespuelt ? 'Gespült.' : 'Nicht gespült.'}`
          : z.ort === 'werkbank' ? (z.geschnitten ? 'Tür ist raus.' : z.angezeichnet ? 'Tür ist angezeichnet.' : 'Liegt bereit.') : 'Liegt auf dem Schweißtisch.';
        return ['Gasflasche', info, a];
      }
      case 'flex':
        return ['Winkelschleifer', 'Mit Trennscheibe. Dreht mit 11.000 Umdrehungen.', z.ort === 'werkbank' && !z.geschnitten ? [A('Tür ausschneiden', 'funke', schneiden)] : []];
      case 'speckstein':
        return ['Speckstein', 'Zum Anzeichnen auf Metall.', z.ort === 'werkbank' && !z.angezeichnet ? [A('Tür anzeichnen', 'stift', anzeichnen)] : []];
      case 'schlauch':
        return ['Wasserschlauch', '', z.ort === 'wasch' && !z.gespuelt ? [A('Flasche spülen', 'wasser', spuelen)] : []];
      case 'geraet':
        return ['Schweißgerät', `Elektrodenschweißen. Eingestellt: ${z.strom} A.`, [A('Stromstärke einstellen', 'regler', stromEinstellen)]];
      case 'masse':
        return ['Masseklemme', z.masse ? 'Sitzt am Tisch.' : 'Liegt auf dem Boden.', [A(z.masse ? 'Abklemmen' : 'An den Schweißtisch klemmen', 'klemme', masseUmschalten)]];
      case 'halter': {
        const a = [];
        if (z.ort === 'schweiss' && z.geschnitten) for (const [k, n] of Object.entries(NAEHTE)) if (z.naehte[k] === null) a.push(A(`${n.name} anschweißen`, 'funke', () => schweissen(k)));
        return ['Elektrodenhalter', z.ort === 'schweiss' ? 'Elektrode ist eingespannt.' : 'Noch nichts zum Schweißen da.', a];
      }
      case 'hammer':
        return ['Schlackenhammer', 'Für die Schlacke auf den Nähten.', irgendeineNaht() && !z.schlackeWeg ? [A('Schlacke abklopfen', 'hammer', schlackeKlopfen)] : []];
      case 'kaffee':
        return ['Kaffeetasse', 'Steht CHEF drauf. Riecht gut.', [A('Einen Schluck nehmen', 'tasse', () => fehler('kaffee'))]];
      case 'feuerloescher':
        return ['Feuerlöscher', 'Gut zu wissen, wo der hängt.', []];
      case 'kaffeemaschine':
        return ['Kaffeemaschine', z.kaffeeInHand ? 'Du hast schon einen Kaffee in der Hand.' : 'Dennis’ ganzer Stolz.', z.kaffeeInHand ? [] : [A('Kaffee für Dennis kochen', 'tasse', kaffeeKochen)]];
      case 'kiwi':
        return ['Kiwis', z.kiwisGegessen >= 6 ? 'Leer.' : `Noch ${6 - z.kiwisGegessen} Kiwis. Gehören Dennis.`, z.kiwisGegessen >= 6 ? [] : [A('Eine Kiwi nehmen und essen', 'hand', kiwiEssen)]];
      case 'brotdose':
        return ['Brotdose', 'Steht DENNIS drauf. Mit Edding.', [
          A('Reinschauen', 'auge', () => ui.hinweis('Vollkornbrot mit Käse und ein Apfel. Riecht nach Mittagspause.')),
          A('Einmal abbeißen', 'hand', () => { mampfen(); return fehler('brotdose'); }),
        ]];
      case 'box':
        return ['Soundbox', 'Ziemlich groß. Ziemlich laut.', [A(z.musik ? 'Ausschalten' : 'Anschalten', 'funke', musikUmschalten)]];
      case 'licht':
        return ['Lichtschalter', '', [A(z.licht ? 'Licht ausschalten' : 'Licht einschalten', 'hand', lichtUmschalten)]];
      case 'besen':
        return ['Besen', welt.dreck ? 'Der Boden könnte es vertragen.' : 'Alles sauber.', [A('Fegen', 'hand', fegen)]];
      case 'dennis': {
        if (dennis.modus === 'liegen') return ['Dennis', 'Liegt auf dem Boden und hält sich die Hüfte.', [A('Dennis aufhelfen', 'hand', aufhelfen)]];
        const a = [A('Fragen, was als Nächstes dran ist', 'frage', dennisFragen)];
        if (alleNaehte()) a.unshift(A('Ofen abgeben', 'abgeben', abgeben));
        if (z.kaffeeInHand) a.unshift(A('Kaffee geben', 'tasse', kaffeeGeben));
        return ['Dennis', 'Dein Schweißkurslehrer.', a];
      }
      default:
        return null;
    }
  }

  async function klick(treffer) {
    if (z.vorbei || z.beschaeftigt) return;
    if (ui.menueOffen()) { ui.schliesseMenue(); return; }
    if (!treffer) return;
    const { info, obj } = treffer;
    steuerung.sperre(true);
    await hinZu(info, obj);
    steuerung.sperre(false);
    const m = menueFuer(info.id);
    if (!m) return;
    const [titel, text, aktionen] = m;
    if (!aktionen.length) { ui.hinweis(`${titel}: ${text || 'Gerade nichts zu tun.'}`); return; }
    ui.aktionsMenue(titel, text, aktionen);
  }

  async function stationWaehlen(id) {
    if (z.vorbei || z.beschaeftigt) return;
    ui.schliesseMenue();
    steuerung.sperre(true);
    if (id === 'dennis') {
      await hinZu({ id: 'dennis' }, dennis.wurzel);
      steuerung.sperre(false);
      const [t, i, a] = menueFuer('dennis');
      ui.aktionsMenue(t, i, a);
    } else {
      await steuerung.zuStation(id);
      steuerung.sperre(false);
    }
  }

  // ---------- Anfang und Ende ----------
  async function intro() {
    z.beschaeftigt = true;
    steuerung.sperre(true);
    aktualisieren();
    await new Promise((r) => setTimeout(r, 400));
    await dennisKommt(1.6);
    await auftritt({ schluessel: ['begruessung'], text: DENNIS.begruessung, stufe: 'mittel', stimmung: 'ruhig' });
    // Kurz vorm Ende: muss dringend aufs Klo
    dennis.stimmung('skeptisch');
    auftritt({ schluessel: ['klo'], text: DENNIS.klo, stufe: 'leicht', stimmung: 'skeptisch' });
    steuerung.sperre(false);
    await Promise.race([dennis.gehZu(welt.KLO.x, welt.KLO.z, 3.4), new Promise((r) => setTimeout(r, 4500))]);
    dennis.sichtbar(false);
    await new Promise((r) => setTimeout(r, 2200));
    klospuelung();
    await new Promise((r) => setTimeout(r, 2800));
    dennis.springZu(welt.KLO.x, welt.KLO.z);
    dennis.sichtbar(true);
    dennis.stimmung('ruhig');
    steuerung.sperre(true);
    await dennisKommt(2.2);
    await auftritt({ schluessel: ['begruessung'], text: DENNIS.zurueck, stufe: 'mittel', stimmung: 'ruhig' });
    dennis.heim();
    steuerung.sperre(false);
    z.beschaeftigt = false;
  }

  function note() {
    const qs = [z.schnittQ ?? 0, ...Object.values(z.naehte).map((q) => q ?? 0)];
    const qualitaet = qs.reduce((a, b) => a + b, 0) / qs.length;
    const punkte = qualitaet * 0.65 + (100 - z.wutMax) * 0.35 - z.fehler.length * 2 - (welt.dreck ? 4 : 0) - (z.dennisHatGefegt ? 2 : 0);
    const n = punkte >= 88 ? 1 : punkte >= 76 ? 2 : punkte >= 63 ? 3 : punkte >= 50 ? 4 : punkte >= 35 ? 5 : 6;
    return { n, qualitaet: Math.round(qualitaet), punkte: Math.round(punkte) };
  }

  async function ende() {
    z.vorbei = true;
    z.beschaeftigt = true;
    steuerung.sperre(true);
    aktualisieren();
    const { n, qualitaet } = note();
    const kat = n <= 2 ? 'ende_gut' : n <= 4 ? 'ende_mittel' : 'ende_schlecht';
    const texte = { ende_gut: DENNIS.ende.gut, ende_mittel: DENNIS.ende.mittel, ende_schlecht: DENNIS.ende.schlecht };
    const stimmung = n <= 2 ? 'froh' : n <= 4 ? 'skeptisch' : 'sauer';
    dennis.stimmung(stimmung);
    await dennisKommt(1.6);
    jingle(n <= 4);
    await auftritt({ schluessel: [kat], text: texte[kat], stufe: n >= 5 ? 'voll' : 'mittel', stimmung });
    const minuten = Math.round((performance.now() - z.start) / 60000);
    const naehte = Object.entries(NAEHTE).map(([k, nn]) => `<li><span>${nn.name}</span><b>${z.naehte[k]} %</b></li>`).join('');
    const wahl = await ui.infoDialog('Kurs bestanden?', `
      <div class="note" style="color:${n <= 2 ? '#2b7a2b' : n <= 4 ? '#b5641b' : '#b3170d'}">Note ${n}</div>
      <ul class="wertung-liste">
        <li><span>Schnitt</span><b>${z.schnittQ} %</b></li>${naehte}
        <li><span>Verarbeitung gesamt</span><b>${qualitaet} %</b></li>
        <li><span>Höchste Dennis-Wut</span><b>${Math.round(z.wutMax)} %</b></li>
        <li><span>Werkstatt</span><b>${welt.dreck ? 'dreckig' : z.dennisHatGefegt ? 'Dennis musste fegen' : 'gefegt'}</b></li>
        <li><span>Zeit</span><b>${minuten} Min.</b></li>
      </ul>
      ${z.fehler.length ? `<p><b>Fehler (${z.fehler.length}):</b></p><ul class="fehler-liste">${z.fehler.map((f) => `<li>${f}</li>`).join('')}</ul>` : '<p><b>Kein einziger Fehler. Dennis ist sprachlos.</b></p>'}`,
    [{ text: 'Nochmal' }, { text: 'Dennis-Archiv', klasse: 'leise' }]);
    if (wahl === 1) location.hash = '#archiv';
    location.reload();
  }

  async function rausgeflogen() {
    z.vorbei = true;
    dennis.stimmung('wut');
    await auftritt({ schluessel: ['rausgeflogen', 'ausraster'], text: DENNIS.rausgeflogen, stufe: 'voll', stimmung: 'wut' });
    jingle(false);
    const wahl = await ui.infoDialog('Rausgeflogen!', `<p>Dennis ist der Kragen geplatzt.</p>
      <ul class="fehler-liste">${z.fehler.map((f) => `<li>${f}</li>`).join('')}</ul>
      <p class="klein">Tipp: Die Regeln an der Wand hinter der Werkbank lesen.</p>`,
    [{ text: 'Nochmal versuchen', klasse: 'rot' }, { text: 'Dennis-Archiv', klasse: 'leise' }]);
    if (wahl === 1) location.hash = '#archiv';
    location.reload();
  }

  // Dennis guckt misstrauisch, wenn gleich was schiefgehen könnte
  function beobachten() {
    if (z.beschaeftigt || z.vorbei || dennis.modus === 'liegen') return;
    const st = steuerung.station();
    let riskant = false;
    if (st === 'werkbank' && z.ort === 'werkbank' && !z.geschnitten && (!z.gespuelt || !z.ppe.brille)) riskant = true;
    if (st === 'schweiss' && z.ort === 'schweiss' && (!z.ppe.helm || !z.masse)) riskant = true;
    const s = riskant ? 'skeptisch' : stimmungAusWut() === 'wut' ? 'sauer' : 'ruhig';
    dennis.stimmung(s);
  }

  let letztePos = null;
  const sekundenSeitStart = () => (performance.now() - z.start) / 1000;

  return {
    zustand: z,
    klick,
    stationWaehlen,
    intro,
    aktualisieren,
    update(dt) {
      beobachten();
      if (z.vorbei) return;
      // Tanzen, wenn die Box läuft und Dennis Zeit hat
      const sollTanzen = z.musik && !z.beschaeftigt && !z.dennisFegt && dennis.istDaheim() && dennis.modus !== 'liegen';
      if (sollTanzen && dennis.modus === 'normal') dennis.setzeModus('tanzen', technoBeat);
      if (!sollTanzen && dennis.modus === 'tanzen') dennis.setzeModus('normal');
      // Licht aus: Dennis meckert nach kurzer Zeit
      if (!z.licht) {
        z.lichtAusSeit += dt;
        if (z.lichtAusSeit > 2.5 && !z.beschaeftigt && !buehneBelegt()) {
          z.lichtAusSeit = -8;
          z.lichtGemeckert++;
          if (z.lichtGemeckert === 1) auftritt({ schluessel: ['licht'], text: DENNIS.licht, stufe: 'leicht', stimmung: 'skeptisch' });
          else fehler('licht');
        }
      }
      // Neben Dennis stehen bleiben: Baustellenfeeling (nicht im Liegen, höchstens alle 40 s)
      const abstand = Math.hypot(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
      const steht = letztePos ? kamera.position.distanceTo(letztePos) < 0.002 : false;
      letztePos = kamera.position.clone();
      z.nebenDennis = abstand < 1.8 && steht && dennis.modus !== 'liegen' && !z.beschaeftigt ? z.nebenDennis + dt : 0;
      if (z.nebenDennis > 1.2 && sekundenSeitStart() - z.baustelleZuletzt > 40 && !buehneBelegt()) {
        z.baustelleZuletzt = sekundenSeitStart();
        z.nebenDennis = 0;
        auftritt({ schluessel: ['baustellenfeeling'], text: DENNIS.baustellenfeeling, stufe: 'info', stimmung: 'froh' });
      }
      // Dennis fegt selbst, wenn der Dreck über 45 s liegen bleibt
      if (welt.dreck && !z.dennisFegt && sekundenSeitStart() - z.dreckSeit > 45 && !z.beschaeftigt && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt()) {
        dennisFegt();
      }
      // Murmeln in der Nähe (nicht während Dennis spricht oder weg ist)
      if (murmelTon) {
        if (buehneBelegt() && !z.dennisFegt) { murmelTon.stopp(); murmelTon = null; } else murmelTon.lautstaerke(lautstaerkeNachAbstand());
      } else if (sekundenSeitStart() > naechstesMurmeln && !z.beschaeftigt && !buehneBelegt() && dennis.wurzel.visible && lautstaerkeNachAbstand() > 0.15) {
        naechstesMurmeln = sekundenSeitStart() + 15 + Math.random() * 20;
        murmeln();
      }
      // Mittagspause: Dennis kommt mit Brotdose rüber und isst eine Tomate (einmal pro Spiel)
      if (z.mittag === 'nie' && sekundenSeitStart() > 140 && !z.beschaeftigt && !z.dennisFegt && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.03) {
        mittagspause();
      }
      // Hüfte: einmal pro Spiel legt sich Dennis hin und jammert, bis man ihm aufhilft
      const sekunden = (performance.now() - z.start) / 1000;
      if (z.huefte === 'nie' && sekunden > 75 && !z.beschaeftigt && !z.dennisFegt && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.04) {
        z.huefte = 'liegt';
        z.jammerTimer = 14;
        dennis.setzeModus('liegen');
        auftritt({ schluessel: ['huefte'], text: DENNIS.huefte.start, stufe: 'leicht', stimmung: 'sauer' });
      }
      if (z.huefte === 'liegt' && dennis.modus === 'liegen') {
        z.jammerTimer -= dt;
        if (z.jammerTimer <= 0 && !z.beschaeftigt && !buehneBelegt()) {
          z.jammerTimer = 12;
          z.wut = Math.min(100, z.wut + 3 * multi);
          z.wutMax = Math.max(z.wutMax, z.wut);
          if (!z.fehler.includes(FEHLER.huefte.name)) z.fehler.push(FEHLER.huefte.name);
          ui.wutZeigen(z.wut, stimmungAusWut());
          ui.wutWackeln();
          auftritt({ schluessel: ['huefte'], text: zufallAus(DENNIS.huefte.jammern), stufe: 'leicht', stimmung: 'sauer' });
          if (z.wut >= 100) { z.beschaeftigt = true; rausgeflogen(); }
        }
      }
    },
  };
}

export function hatEchteClips() {
  return hatClip('begruessung') || hatClip('ausraster');
}
