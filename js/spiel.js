// Spielablauf: Zustand, Aktionen, Fehler, Dennis-Reaktionen, Bewertung.
import * as THREE from 'three';
import { STATIONEN, AUGENHOEHE } from './world.js';
import { auftritt, hatClip, buehneBelegt } from './clips.js';
import { pfadSpiel, schlackeSpiel, hulaSpiel, DENNIS_HULA_REKORD } from './minispiele.js';
import { blip, kratzen, jingle, klonk, brummeln, dauer as dauerTon, technoAn, technoAus, technoBeat, klospuelung, mampfen, klick as schalterKlick, stimmeAbspielen, stimmenVorladen } from './audio.js';
import * as ui from './ui.js';
import { DENNIS, satzId } from './texte.js';
import { SYMBOL } from './gesicht.js';

const zufallAus = (liste) => liste[Math.floor(Math.random() * liste.length)];
// Text aus einer Liste zufällig wählen (oder den einzelnen Text nehmen): mehr Abwechslung bei Dennis
const sag = (x) => (Array.isArray(x) ? zufallAus(x) : x);

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
    stufe: 'mittel', wut: 20, nebensache: true, clip: 'fehler_kaffee', name: 'An Dennis’ Kaffee gegangen',
    texte: DENNIS.fehler.kaffee,
  },
  kiwi: {
    stufe: 'mittel', wut: 12, nebensache: true, clip: 'fehler_kiwi', name: 'Dennis’ Kiwis geplündert',
    texte: DENNIS.fehler.kiwi,
  },
  brotdose: {
    stufe: 'voll', wut: 30, nebensache: true, clip: 'fehler_brotdose', name: 'In Dennis’ Brotdose gebissen',
    texte: DENNIS.fehler.brotdose,
  },
  kaffeeZuviel: {
    stufe: 'leicht', wut: 8, nebensache: true, clip: 'fehler_kaffee', name: 'Dennis mit Kaffee abgefüllt',
    texte: [DENNIS.kaffee.genug],
  },
  milch: {
    stufe: 'leicht', wut: 10, nebensache: true, clip: 'fehler_kaffee', name: 'Milch in Dennis’ Kaffee',
    texte: [DENNIS.kaffee.milch],
  },
  feuer: {
    stufe: 'mittel', wut: 12, nebensache: true, clip: 'ermahnung', name: 'Feuer im Mülleimer nicht gelöscht',
    texte: [...DENNIS.feuer.sauer, ...DENNIS.feuer.sauerJohnny],
  },
  geweckt: {
    stufe: 'leicht', wut: 6, nebensache: true, clip: 'ermahnung', name: 'Dennis aus dem Mittagsschlaf geweckt',
    texte: DENNIS.geweckt,
  },
  licht: {
    stufe: 'leicht', wut: 4, nebensache: true, clip: 'licht', nurZeichnung: true, name: 'Licht ausgemacht',
    texte: DENNIS.licht,
  },
  huefte: {
    stufe: 'leicht', wut: 3, nebensache: true, clip: 'huefte', nurZeichnung: true, name: 'Dennis am Boden liegen lassen',
    texte: DENNIS.huefte.jammern,
  },
  handy: {
    stufe: 'leicht', wut: 6, nebensache: true, clip: 'ermahnung', name: 'Am Handy gedaddelt',
    texte: [DENNIS.hand.handy],
  },
  figur: {
    stufe: 'leicht', wut: 5, nebensache: true, ton: 'stimme/murmeln-9.mp3', clip: 'ermahnung', name: 'Dennis’ Skulptur angefasst',
    texte: DENNIS.hand.figur,
  },
  werfen: {
    stufe: 'leicht', wut: 6, nebensache: true, clip: 'ermahnung', name: 'Mit Werkzeug geworfen',
    texte: [DENNIS.hand.werfen],
  },
  figurWerfen: {
    stufe: 'mittel', wut: 20, nebensache: true, clip: 'sauer', name: 'Dennis’ Skulptur durch die Gegend geworfen',
    texte: DENNIS.hand.figurWerfen,
  },
  getroffen: {
    stufe: 'voll', wut: 35, nebensache: true, ton: 'stimme/abwerfen-1.mp3', clip: 'ausraster', name: 'Dennis abgeworfen',
    texte: [DENNIS.hand.getroffen],
  },
  gespruehrt: {
    stufe: 'voll', wut: 30, clip: 'ausraster', name: 'Dennis mit dem Feuerlöscher eingesprüht',
    texte: DENNIS.hand.gespruehrt,
  },
  loescherSpielen: {
    stufe: 'leicht', wut: 8, nebensache: true, clip: 'ermahnung', name: 'Feuerlöscher sinnlos leer gesprüht',
    texte: DENNIS.hand.loescherSpielen,
  },
  flexAufDennis: {
    stufe: 'mittel', wut: 15, clip: 'sauer', name: 'Mit laufender Flex auf Dennis gezeigt',
    texte: DENNIS.hand.flexAufDennis,
  },
  musikPause: {
    stufe: 'mittel', wut: 14, nebensache: true, clip: 'sauer', name: 'Musik angemacht, während Dennis Pause macht',
    texte: DENNIS.musikPause,
  },
  nassgespritzt: {
    stufe: 'mittel', wut: 15, nebensache: true, clip: 'sauer', name: 'Dennis nassgespritzt',
    texte: DENNIS.schlauch.nass,
  },
  rumspritzen: {
    stufe: 'leicht', wut: 4, nebensache: true, clip: 'ermahnung', name: 'Mit dem Schlauch rumgespritzt',
    texte: DENNIS.schlauch.rumspritzen,
  },
  nerven: {
    stufe: 'leicht', wut: 6, clip: 'fehler_nerven', name: 'Dennis zu oft gefragt',
    texte: DENNIS.fehler.nerven,
  },
};
const ARGERN_BEI = ['kaffee', 'kiwi', 'brotdose'];
const KLO_TOENE = ['stimme/klo-1.mp3', 'stimme/klo-2.mp3'];
// Was Dennis sagt, wenn man etwas wirft (je nach Ding)
const WURF_ART = {
  flex: 'werkzeug', hammer: 'werkzeug', rohrzange: 'werkzeug', edding: 'edding',
  brille: 'ausruestung', handschuhe: 'ausruestung', helm: 'ausruestung',
  hulahup: 'reifen', klemmbrett: 'notizen', besen: 'besen', feuerloescher: 'loescher',
};
const ARGERN_TOENE = ['stimme/aergern-1.mp3', 'stimme/aergern-2.mp3'];
const STUFEN_CLIP = { leicht: 'ermahnung', mittel: 'sauer', voll: 'ausraster' };
const STUFEN_STIMMUNG = { leicht: 'skeptisch', mittel: 'sauer', voll: 'wut' };

const LOB = DENNIS.lob;

const NAEHTE = {
  scharniere: { name: 'Scharniere und Griffe', form: 'zwei', text: 'Zwei kurze Nähte. Gleichmäßig von links nach rechts ziehen, zwischendurch absetzen.' },
  beine: { name: 'Beine', form: 'kreisKlein', text: 'Rund um das Bein. Ruhig und gleichmäßig führen (für alle drei Beine).' },
  rohr: { name: 'Ofenrohr', form: 'kreis', text: 'Einmal komplett rundherum. Nicht hetzen, nicht trödeln.' },
};

export function baueSpiel({ welt, dennis, steuerung, kamera, hand }) {
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
    kaffeeMilch: false,
    kaffeesSeitKlo: 0,
    aufKlo: false,
    kaffees: 0,
    kiwisGegessen: 0,
    kiwisWeg: 0,
    aergern: 0,
    musik: false,
    licht: true,
    lichtAusSeit: 0,
    lichtGemeckert: 0,
    huefte: 'nie',
    nebenDennis: 0,
    mittag: 'nie',
    feuer: 'nie',
    feuerAb: 200,
    dennisLoescht: false,
    klo: 'nie',
    dennisFegt: false,
    dennisHatGefegt: false,
    dreckSeit: 0,
    baustelleZuletzt: -999,
    jammerTimer: 0,
    vorbei: false,
  };
  const multi = 1;

  function alleNaehte() { return Object.values(z.naehte).every((q) => q !== null); }
  function irgendeineNaht() { return Object.values(z.naehte).some((q) => q !== null); }

  function aufgaben() {
    return [
      { text: 'Restgas ablassen (Ventil auf)', fertig: z.ventilAuf },
      { text: 'Flasche mit Wasser spülen', fertig: z.gespuelt },
      { text: 'Flasche zur Werkbank tragen', fertig: z.ort === 'werkbank' || z.geschnitten },
      { text: 'Ofentür anzeichnen', fertig: z.angezeichnet },
      { text: 'Ofentür ausschneiden', fertig: z.geschnitten },
      { text: 'Flasche zum Schweißplatz tragen', fertig: z.ort === 'schweiss' || irgendeineNaht() },
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
    if (z.ort !== 'hand' && z.ort !== 'abgegeben') welt.setzeFlasche(z.ort, z.naehte.beine !== null);
    hand.handschuhe(z.ppe.handschuhe);
    handleisteZeigen();
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

  async function fehler(id, extraText, { ton: tonVorgabe = null } = {}) {
    const f = FEHLER[id];
    ui.schliesseMenue();
    z.beschaeftigt = true;
    if (dennis.modus === 'tanzen') dennis.setzeModus('normal');
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
    if (!dennis.wurzel.visible) {
      dennis.springZu(welt.KLO.x, welt.KLO.z);
      dennis.sichtbar(true);
    }
    if ((dennis.modus === 'sitzen' || dennis.modus === 'schlafen') && id !== 'geweckt') {
      mittagGeweckt = true;
      dennis.aufstehen(welt.SOFA.x, welt.SOFA.vorneZ);
      welt.objekte.brotdose.visible = true;
      z.mittag = 'erledigt';
    }
    // Video/Blase startet sofort, Dennis läuft währenddessen schon los
    const kommt = f.stufe !== 'leicht' ? dennisKommt(f.stufe === 'voll' ? 3.6 : 2.4) : Promise.resolve();
    const text = extraText || zufallAus(f.texte);
    // An Kaffee, Kiwis, Brotdose: Originalton ärgernleicht1, dann 2, dann abwechselnd
    let ton = null;
    if (tonVorgabe) ton = tonVorgabe;
    else if (ARGERN_BEI.includes(id)) ton = ARGERN_TOENE[z.aergern++ % ARGERN_TOENE.length];
    else if (f.ton) ton = f.ton;
    // Video nur beim richtigen Ausraster, sonst Sprechblase mit Ton
    if (f.nebensache || f.stufe !== 'voll') await Promise.all([kommt, dennisSagt(text, f.stufe !== 'leicht', { ton })]);
    else {
      nebenbeiStoppen();
      await Promise.all([kommt, auftritt({ schluessel: f.nurZeichnung ? [f.clip] : [f.clip, STUFEN_CLIP[f.stufe]], text, stufe: f.stufe, stimmung: STUFEN_STIMMUNG[f.stufe], seite: true })]);
    }
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

  // Nebensachen: Sprechblase rechts, gleichzeitig Originalton (falls vorhanden) oder Gebrabbel.
  // Lautstärke nach Abstand zu Dennis. Beim Tanzen sagt er nichts (außer mit beimTanzen).
  let stimmen = null;
  async function stimmenLaden() {
    if (stimmen) return;
    try { stimmen = (await (await fetch('stimme/stimme.json')).json()).saetze || {}; } catch { stimmen = {}; }
    stimmenVorladen([...Object.values(stimmen).map((d) => `stimme/${d}`), ...MURMELN, TANZ_RUF, HULA_TON, ...ARGERN_TOENE, ...KLO_TOENE, ...NAEHE_1, ...NAEHE_2, 'stimme/murmeln-9.mp3', 'stimme/hand.handy.mp3', 'stimme/hand.handyNochmal.mp3', 'stimme/abwerfen-1.mp3', 'stimme/muell.mp3', 'assets/klospuelung.mp3']);
  }
  let stimmeJetzt = null;
  function sprechLautstaerke() {
    return lautstaerkeNachAbstand(8);
  }
  // Alles, was Dennis sagt, kommt nacheinander, nie gleichzeitig. Wichtigkeit (prio):
  //   2 = von uns provoziert (Fehler, Reaktionen), 1 = Ereignis (Klo, Feuer, Hüfte), 0 = nebenbei (Was los, Jammern, Mittag)
  // Wichtiges kommt zuerst; läuft gerade etwas Nebensächliches (auch Gemurmel), wird es kurz ausgeblendet.
  const sprechListe = [];
  let sprechAktiv = null;
  let sprichtGerade = false;
  function nebenbeiStoppen() {
    if (murmelTon && !murmelTon.hula) { murmelTon.stopp(0.2); murmelTon = null; }
    if (sprechAktiv && sprechAktiv.prio === 0) { if (stimmeJetzt) stimmeJetzt.stopp(0.2); sprechAktiv.abbrechen(); }
  }
  function dennisSagt(text, sauer = false, optionen = {}) {
    return new Promise((fertig) => {
      const e = { text, sauer, optionen, prio: optionen.prio ?? 2, zeit: performance.now(), fertig };
      e.abbruch = new Promise((r) => { e.abbrechen = r; });
      sprechListe.push(e);
      if (e.prio > 0) nebenbeiStoppen();
      sprechSchleife();
    });
  }
  async function sprechSchleife() {
    if (sprichtGerade) return;
    sprichtGerade = true;
    while (sprechListe.length) {
      sprechListe.sort((a, b) => b.prio - a.prio || a.zeit - b.zeit);
      const e = sprechListe.shift();
      // Nebensächliches, das zu lange warten musste, fällt weg
      if (e.prio === 0 && performance.now() - e.zeit > 6000) { e.fertig(); continue; }
      sprechAktiv = e;
      try { await sprechen(e); } catch { /* weiter */ }
      sprechAktiv = null;
      e.fertig();
    }
    sprichtGerade = false;
  }
  // Ruhe für Gemurmel/Nähe-Sprüche: nichts in der Warteschlange und niemand spricht
  const ruhig = () => !sprichtGerade && !sprechListe.length && !stimmeJetzt;

  async function sprechen(e) {
    const { text, sauer } = e;
    const { minMs = 0, beimTanzen = false, ton = null } = e.optionen;
    if (dennis.modus === 'tanzen' && !beimTanzen) return;
    // Beim Hula-Hoop nur „hello fresh“: Nebensächliches fällt weg, Wichtiges wartet
    if (z.hula) {
      if (e.prio < 2) return;
      for (let i = 0; i < 60 && z.hula; i++) await warte(200);
    }
    await stimmenLaden();
    // Gemurmel (Nähe, Tanz, Fegen): Wichtiges blendet es aus, Nebensächliches wartet
    if (murmelTon && e.prio > 0 && !murmelTon.hula) { murmelTon.stopp(0.2); murmelTon = null; }
    if (murmelTon) await Promise.race([murmelTon.fertig, warte(7000)]);
    // Läuft gerade ein Video von Dennis (mit Ton), erst danach sprechen
    for (let i = 0; i < 60 && buehneBelegt(); i++) await warte(200);
    const datei = ton || (stimmen[satzId(text)] ? `stimme/${stimmen[satzId(text)]}` : null);
    let dauer = Math.max(2200, text.length * 55 + 1000, minMs);
    let t = null;
    if (datei) t = await stimmeAbspielen(datei, sprechLautstaerke());
    if (t) {
      dauer = Math.max(minMs, 1600, t.dauer * 1000 + 600);
    } else {
      t = brummeln(Math.max(3, Math.round(text.length / 6)), sauer ? 0.5 : 0, sprechLautstaerke());
      dauer = Math.max(dauer, t.dauer * 1000 + 500);
      t.fertig = warte(t.dauer * 1000 + 100);
    }
    stimmeJetzt = t;
    if (e.optionen.blase !== false) ui.sprechzeile(text, dauer, sauer);
    await Promise.race([t.fertig, warte(15000), e.abbruch]);
    if (stimmeJetzt === t) stimmeJetzt = null;
    await warte(250);
  }

  async function lob(text) {
    z.beschaeftigt = true;
    z.wut = Math.max(0, z.wut - 5);
    dennis.stimmung('froh');
    jingle(true);
    ui.lobZeigen(text || zufallAus(LOB));
    await new Promise((r) => setTimeout(r, 600));
    dennis.stimmung('ruhig');
    aktualisieren();
    z.beschaeftigt = false;
  }

  // ---------- Aktionen ----------
  // Dennis auf dem Klo = keine Aufsicht = Arbeitspause
  function ohneAufsicht() {
    if (!z.aufKlo) return false;
    ui.hinweis(DENNIS.kloOhneAufsicht, 3200);
    return true;
  }
  function gehZuStation(id) {
    if (steuerung.station() === id) return Promise.resolve();
    return steuerung.zuStation(id);
  }

  async function ventilAufdrehen() {
    if (ohneAufsicht()) return;
    const ok = await ui.haltenDialog({ titel: 'Restgas ablassen', text: 'Ventil langsam aufdrehen und das restliche Gas entweichen lassen. Draußen wäre besser, aber Dennis hat das Tor aufgemacht.', knopf: 'Gedrückt halten', sekunden: 2.5, geraeusch: 'gas' });
    if (!ok) return;
    z.ventilAuf = true;
    welt.objekte.flasche.ventil.rotation.z += Math.PI * 3;
    ui.hinweis('Zischt nicht mehr. Restgas ist raus.');
    aktualisieren();
  }

  async function spuelen() {
    if (ohneAufsicht()) return;
    if (z.ort !== 'wasch') { ui.hinweis('Die Flasche muss dafür zum Waschplatz.'); return; }
    if (!z.ventilAuf) { ui.hinweis('Das Ventil ist noch zu. Da kommt kein Wasser rein.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Flasche spülen', text: 'Randvoll mit Wasser füllen, schütteln, auskippen. Das drückt die letzten Gasreste raus.', knopf: 'Wasser marsch (halten)', sekunden: 3, geraeusch: 'wasser' });
    if (!ok) return;
    z.gespuelt = true;
    ui.hinweis('Gespült und ausgekippt. Jetzt ist kein Gas mehr drin.');
    aktualisieren();
  }

  async function anzeichnen() {
    if (ohneAufsicht()) return;
    if (z.ort !== 'werkbank') { ui.hinweis('Erst die Flasche auf die Werkbank legen.'); return; }
    if (z.angezeichnet) { ui.hinweis('Ist schon angezeichnet.'); return; }
    if (hand.item?.id !== 'edding') { ui.hinweis('Nimm den blauen Edding in die Hand (liegt auf der Werkbank).'); return; }
    kratzen();
    z.angezeichnet = true;
    ui.hinweis('Mit dem Edding eine Tür angezeichnet.');
    aktualisieren();
  }

  async function schneiden() {
    if (ohneAufsicht()) return;
    if (z.ort !== 'werkbank') { ui.hinweis('Erst die Flasche auf die Werkbank legen.'); return; }
    if (z.geschnitten) { ui.hinweis('Die Tür ist schon raus.'); return; }
    if (!z.angezeichnet) { ui.hinweis('Erst anzeichnen, sonst wird das krumm.'); return; }
    if (hand.item?.id !== 'flex') { ui.hinweis('Nimm die Flex in die Hand.'); return; }
    if (!z.gespuelt) return fehler('gasflasche');
    if (!z.ppe.brille) return fehler('brille');
    if (!z.ppe.handschuhe) return fehler('handschuhe');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await pfadSpiel({ art: 'schneiden', form: 'rechteck', titel: 'Tür ausschneiden', text: 'Am gelben Punkt ansetzen, gedrückt halten und die blaue Linie entlangfahren.' });
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.geschnitten = true;
    z.schnittQ = e.qualitaet;
    welt.dreckHin(0, -2.2, 5);
    z.dreckSeit = sekundenSeitStart();
    if (z.feuer === 'nie') z.feuerAb = Math.min(z.feuerAb, sekundenSeitStart() + 15 + Math.random() * 25);
    aktualisieren();
    if (e.qualitaet < 55) await fehler('schnitt');
    else if (e.qualitaet >= 88) await lob(sag(DENNIS.lobSchnitt));
  }

  async function stromEinstellen() {
    if (ohneAufsicht()) return;
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
    if (ohneAufsicht()) return;
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
    if (ohneAufsicht()) return;
    if (z.ort !== 'schweiss' || !irgendeineNaht()) { ui.hinweis('Da ist noch keine Naht zum Abklopfen.'); return; }
    if (z.schlackeWeg) { ui.hinweis('Ist schon blank.'); return; }
    if (hand.item?.id !== 'hammer') { ui.hinweis('Nimm den Schlackenhammer in die Hand.'); return; }
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
    if (ohneAufsicht()) return;
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
    await dennisSagt(naechsterTipp(), false, { minMs: 6000 });
  }

  async function abgeben() {
    if (!alleNaehte()) {
      await dennisSagt(sag(DENNIS.nichtFertig));
      return;
    }
    if (!z.schlackeWeg) {
      await fehler('schlacke');
      return;
    }
    if (!z.lackiert) {
      await dennisSagt(sag(DENNIS.nichtLackiert));
      return;
    }
    if (hand.item?.id !== 'ofen') {
      await dennisSagt(sag(DENNIS.ofenBringen));
      return;
    }
    await ofenUebergeben();
    await ende();
  }

  // Fertigen Ofen hochheben und zu Dennis tragen
  function ofenHochheben() {
    if (hand.item) { ui.hinweis('Für den Ofen brauchst du beide Hände. Erst ablegen.'); return; }
    hand.nimm('ofen', welt.objekte.flasche.gruppe);
    z.ortVorher = z.ort;
    z.ort = 'hand';
    klonk(0.3);
    aktualisieren();
    ui.hinweis('Schwer! Jetzt zu Dennis tragen und auf ihn klicken.', 3200);
  }

  // Ofen vor Dennis auf den Boden stellen
  async function ofenUebergeben() {
    const ofen = hand.loslassen();
    z.ort = 'abgegeben';
    const d = dennis.wurzel.position;
    const p = kamera.position;
    const r = Math.hypot(p.x - d.x, p.z - d.z) || 1;
    // Neben Dennis abstellen (leicht zum Spieler hin), damit er nicht verdeckt wird
    const vx = (p.x - d.x) / r, vz = (p.z - d.z) / r;
    ofen.position.set(d.x + vx * 0.35 - vz * 0.75, 0.335 + 0.56, d.z + vz * 0.35 + vx * 0.75);
    ofen.rotation.set(0, Math.atan2(p.x - d.x, p.z - d.z), 0);
    klonk(0.6);
    handleisteZeigen();
    await warte(500);
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
    if (hand.item) { ui.hinweis('Leg erst ab, was du in der Hand hast.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Kaffee kochen', text: 'Schwarz, stark, in Dennis’ Becher. So wie er ihn mag.', knopf: 'Brühen (halten)', sekunden: 2, geraeusch: 'wasser' });
    if (!ok) return;
    z.kaffeeInHand = true;
    z.kaffeeMilch = false;
    hand.nimm('kaffee', hand.becher);
    handleisteZeigen();
    ui.hinweis('Kaffee in der Hand. Ab zu Dennis damit.');
  }

  function milchRein() {
    z.kaffeeMilch = true;
    blip(500, 0.06);
    ui.hinweis('Schuss Milch rein. Sieht gleich viel freundlicher aus.');
  }

  async function wutPlus(f) {
    z.wut = Math.min(100, z.wut + f.wut * multi);
    z.wutMax = Math.max(z.wutMax, z.wut);
    if (!z.fehler.includes(f.name)) z.fehler.push(f.name);
    ui.wutZeigen(z.wut, stimmungAusWut());
    ui.wutWackeln();
    if (z.wut >= 100) { z.beschaeftigt = true; await rausgeflogen(); return true; }
    return false;
  }

  async function kaffeeGeben() {
    const milch = z.kaffeeMilch;
    z.kaffeeInHand = false;
    hand.weg();
    handleisteZeigen();
    z.kaffeeMilch = false;
    z.kaffees++;
    z.kaffeesSeitKlo++;
    if (milch) {
      if (await wutPlus(FEHLER.milch)) return;
      kloPause(DENNIS.kaffee.milch, false);
      return;
    }
    if (z.kaffeesSeitKlo >= 3) {
      if (await wutPlus(FEHLER.kaffeeZuviel)) return;
      kloPause(DENNIS.kaffee.genug, false);
      return;
    }
    if (z.kaffees === 1) z.wut = Math.max(0, z.wut - 20);
    dennis.stimmung('froh');
    jingle(true);
    aktualisieren();
    ui.lobZeigen(z.kaffeesSeitKlo === 1 ? sag(DENNIS.kaffee.danke) : sag(DENNIS.kaffee.nochmal));
    dennis.stimmung('ruhig');
  }

  // Kriegt Dennis gerade mit, was man macht? (nicht beim Schlafen, nicht auf dem Klo)
  function dennisSiehts() {
    return dennis.wurzel.visible && dennis.modus !== 'schlafen' && !z.aufKlo;
  }

  async function kiwiEssen() {
    if (z.kiwisWeg >= 6) { ui.hinweis('Keine Kiwis mehr da.'); return; }
    z.kiwisWeg++;
    welt.kiwisZeigen(6 - z.kiwisWeg);
    mampfen();
    if (!dennisSiehts()) { ui.hinweis('Heimlich eine Kiwi gegessen. Dennis hat nix gemerkt.'); return; }
    z.kiwisGegessen++;
    // die ersten beiden erlaubt Dennis: kein Spruch, nur das Bissgeräusch
    if (z.kiwisGegessen <= 2) {
      ui.hinweis(z.kiwisGegessen === 1 ? 'Lecker. Dennis nickt.' : 'Noch eine. Dennis zieht die Augenbraue hoch.');
    } else {
      await fehler('kiwi', z.kiwisWeg >= 6 ? DENNIS.kiwi.leer : undefined);
    }
  }

  function musikUmschalten() {
    z.musik = !z.musik;
    schalterKlick();
    if (z.musik) {
      technoAn();
      welt.boxTakt(technoBeat);
      ui.hinweis('Bumm. Bumm. Bumm.');
      // Musik an, während Dennis Mittagspause macht oder schläft: er wird wach und sauer
      if (z.mittag === 'gerade' && (dennis.modus === 'sitzen' || dennis.modus === 'schlafen')) {
        mittagGeweckt = true;
        dennis.aufstehen(welt.SOFA.x, welt.SOFA.vorneZ);
        dennis.mittagspause(false);
        welt.objekte.brotdose.visible = true;
        z.mittag = 'erledigt';
        fehler('musikPause').then(() => dennis.heim());
      }
    } else {
      technoAus();
      welt.boxTakt(null);
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
    z.wut = Math.max(0, z.wut - 8);
    aktualisieren();
    ui.hinweis('Boden ist sauber.');
    ui.lobZeigen(sag(DENNIS.fegen));
  }

  // ---------- Dennis fegt selbst, wenn der Dreck zu lange liegt ----------
  const warte = (ms) => new Promise((r) => setTimeout(r, ms));
  function nebenDing(obj) {
    const p = new THREE.Vector3();
    obj.getWorldPosition(p);
    return { x: THREE.MathUtils.clamp(p.x, -4.35, 4.35), z: THREE.MathUtils.clamp(p.z, -3.35, 3.35) };
  }
  async function dennisFegt() {
    const besen = welt.objekte.besen;
    if (hand.item?.id === 'besen') {
      z.dreckSeit = sekundenSeitStart();
      dennisSagt(sag(DENNIS.besenInDerHand), false, { prio: 1 });
      return;
    }
    z.dennisFegt = true;
    const abbruch = () => {
      dennis.besen(false);
      dennis.setzeModus('normal');
      welt.zurueckAnDieWand(besen);
      z.dennisFegt = false;
    };
    const bp = nebenDing(besen);
    if (!(await dennis.gehZu(bp.x, bp.z, 1.3))) return abbruch();
    if (hand.item?.id === 'besen') return abbruch();
    besen.visible = false;
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
    if (!(await wutPlus({ wut: 8, name: 'Dennis musste selbst fegen' }))) dennisSagt(sag(DENNIS.dreck.selbst), true, { prio: 1 });
    dennis.setzeModus('normal');
    if (!(await dennis.gehZu(welt.BESEN.x, welt.BESEN.z, 1.3))) return abbruch();
    abbruch();
    dennis.heim();
  }

  // ---------- Murmeln: Originaltöne, lauter je näher man ist ----------
  const MURMELN = []; // keine Zufalls-Murmler mehr: ansprechen2 kommt nur noch bei der Holzfigur
  // Sprüche, wenn man in Dennis' Nähe kommt: 1 = entspannt (nah zu hören), 2 = gereizt (auch weiter weg zu hören)
  const NAEHE_1 = ['stimme/naehe-1a.mp3', 'stimme/naehe-1b.mp3']; // ansprechen1, ansprechen11
  const NAEHE_2 = ['stimme/naehe-2b.mp3', 'stimme/naehe-2c.mp3']; // ansprechen22, 22222 (ansprechen2 nur bei der Holzfigur)
  let naechsterNaehe = 30;
  // Nur beim Tanzen (Box an): immer mal wieder dieser Spruch, sonst sagt er beim Tanzen nichts
  const TANZ_RUF = 'stimme/murmeln-8.mp3';
  let naechsterTanzRuf = 0;
  let murmelTon = null;
  let naechstesMurmeln = 20;
  let letzterMurmel = -1;
  // Je näher, desto lauter; auch in der hintersten Ecke noch hörbar (größere Reichweite = lauter aus der Ferne)
  function lautstaerkeNachAbstand(reichweite = 5.5) {
    const d = Math.hypot(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
    const boden = reichweite >= 8 ? 0.3 : 0.2;
    return Math.max(boden, Math.min(1.15, 1.6 / (d + 0.4)));
  }
  async function ortsTon(url, reichweite = 5.5) {
    const t = await stimmeAbspielen(url, lautstaerkeNachAbstand(reichweite));
    if (!t) return null;
    t.reichweite = reichweite;
    murmelTon = t;
    t.fertig.then(() => { if (murmelTon === t) murmelTon = null; });
    return t;
  }
  async function murmeln() {
    if (!MURMELN.length) return;
    let n;
    do { n = Math.floor(Math.random() * MURMELN.length); } while (n === letzterMurmel && MURMELN.length > 1);
    letzterMurmel = n;
    const t = await ortsTon(MURMELN[n]);
    if (t) t.murmeln = true;
  }

  // Klo: regulär ("Warte kurz!", danach entspannter) oder von uns ausgelöst (Kaffee, Milch). Blockiert nichts.
  async function kloPause(text = DENNIS.klo, regulaer = true) {
    if (regulaer) z.klo = 'erledigt';
    if (dennis.modus !== 'normal') dennis.aufstehen();
    // erst Bescheid sagen (Dennis bleibt kurz stehen), dann rennt er raus
    await dennisSagt(text, !regulaer, { prio: regulaer ? 1 : 2 });
    z.aufKlo = true;
    ui.pauseZeigen(true, 'Dennis ist auf dem Klo: Arbeitspause, bis er zurück ist');
    await Promise.race([dennis.gehZu(welt.KLO.x, welt.KLO.z, regulaer ? 3.4 : 4.2), warte(6000)]);
    dennis.sichtbar(false);
    // Geräusch vom Klo (laut, abwechselnd die beiden Aufnahmen vom Betreiber)
    await warte(2500);
    if (!dennis.wurzel.visible) stimmeAbspielen(KLO_TOENE[(z.kloTon = (z.kloTon || 0) + 1) % KLO_TOENE.length], 1.4);
    await warte(3500 + Math.random() * 4000);
    if (!dennis.wurzel.visible) {
      // Spülung als Aufnahme (assets/klospuelung.mp3), sonst live erzeugt
      const sp = await stimmeAbspielen('assets/klospuelung.mp3', Math.max(0.35, lautstaerkeNachAbstand()));
      if (!sp) klospuelung(Math.max(0.35, lautstaerkeNachAbstand()));
      await warte(2500);
    }
    if (!dennis.wurzel.visible) {
      dennis.springZu(welt.KLO.x, welt.KLO.z);
      dennis.sichtbar(true);
    }
    z.aufKlo = false;
    ui.pauseZeigen(false);
    z.kaffeesSeitKlo = 0;
    if (regulaer) {
      z.wut = Math.max(0, z.wut - 10);
      aktualisieren();
      dennisSagt(sag(DENNIS.kloZurueck), false, { prio: 1 });
    }
    await Promise.race([dennis.heim(), warte(9000)]);
  }

  // Mittagspause: aufs Sofa, Brotdose, Tomate, dann kurzer Mittagsschlaf. Blockiert nichts.
  let mittagGeweckt = false;
  async function mittagspause() {
    z.mittag = 'gerade';
    mittagGeweckt = false;
    const S = welt.SOFA;
    welt.objekte.brotdose.visible = false;
    dennis.mittagspause(true);
    const angekommen = await Promise.race([dennis.gehZu(S.x, S.vorneZ, 1.2), warte(7000).then(() => false)]);
    const abbruch = () => {
      dennis.aufstehen(S.x, S.vorneZ);
      welt.objekte.brotdose.visible = true;
      z.mittag = 'erledigt';
      dennis.heim();
    };
    if (z.mittag !== 'gerade') return;
    if (!angekommen && dennis.position.distanceTo(new THREE.Vector3(S.x, 0, S.vorneZ)) > 0.3) dennis.springZu(S.x, S.vorneZ);
    dennis.platziere(S.x, 0, S.sitzZ, Math.PI);
    dennis.setzeModus('sitzen');
    const essStart = performance.now();
    // Brotdose auf: sofort der Originalton (Brotdose, Tomaten, Bananen)
    await dennisSagt(DENNIS.tomate, false, { prio: 1 });
    await warte(Math.max(1500, 8000 - (performance.now() - essStart)));
    if (z.mittag !== 'gerade' || mittagGeweckt) return;
    dennis.mittagspause(false);
    welt.objekte.brotdose.visible = true;
    // hinlegen und schlafen
    // Hintern auf dem Polster, Kopf zur rechten Lehne, Füße auf der linken Lehne
    dennis.platziere(S.x + 0.03, 0, S.z - 0.02, -Math.PI / 2);
    dennis.sofa(true);
    dennis.setzeModus('schlafen');
    const schlafStart = performance.now();
    while (performance.now() - schlafStart < 22000) {
      await warte(300);
      if (mittagGeweckt || z.mittag !== 'gerade') return;
    }
    abbruch();
  }

  async function wecken() {
    mittagGeweckt = true;
    const S = welt.SOFA;
    dennis.aufstehen(S.x, S.vorneZ);
    welt.objekte.brotdose.visible = true;
    z.mittag = 'erledigt';
    await fehler('geweckt');
    dennis.heim();
  }

  // ---------- Hula-Hoop: Dennis holt sich ab und zu den Reifen (oder man bringt ihn) ----------
  const HULA_TON = 'stimme/murmeln-10.mp3'; // „hello fresh“, nur noch beim Hula-Hoop
  function reifenAnDerWand() {
    const r = welt.objekte.hulahup;
    return r.parent && r.visible && hand.item?.id !== 'hulahup' && r.position.distanceTo(r.userData.wand.pos) < 0.05;
  }
  // Minispiel: selbst Hula-Hoop machen und Dennis' Rekord knacken
  async function hulaRekord() {
    if (z.hula) { ui.hinweis('Dennis hat den Reifen gerade.'); return; }
    const r = welt.objekte.hulahup;
    if (hand.item?.id === 'hulahup') { hand.weg(); handleisteZeigen(); } else r.visible = false;
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await hulaSpiel();
    welt.zurueckAnDieWand(r);
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (e.runden > DENNIS_HULA_REKORD) {
      jingle(true);
      if (dennisSiehts()) { z.wut = Math.max(0, z.wut - 5); aktualisieren(); dennisSagt(sag(DENNIS.hula.gebrochen)); }
      else ui.hinweis(`${e.runden} Runden! Neuer Rekord. Schade, dass Dennis es nicht gesehen hat.`, 3500);
    } else if (dennisSiehts() && e.runden > 0) {
      dennisSagt(e.runden >= 30 ? sag(DENNIS.hula.knapp) : sag(DENNIS.hula.schwach));
    } else {
      ui.hinweis(`${e.runden} Runden. Dein Rekord: ${e.bester}.`);
    }
  }

  async function hulaHoop(selbstHolen = true) {
    z.hula = true;
    const r = welt.objekte.hulahup;
    if (selbstHolen) {
      const W = welt.HULA_PLATZ;
      const da = await Promise.race([dennis.gehZu(W.x, W.z, 1.3), warte(8000).then(() => null)]);
      if (da === false || !reifenAnDerWand()) { z.hula = false; dennis.heim(); return; }
      r.visible = false;
    } else {
      r.removeFromParent();
    }
    dennis.wurzel.rotation.y = Math.atan2(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
    dennis.setzeModus('hula');
    const ton = await ortsTon(HULA_TON);
    if (ton) ton.hula = true;
    await warte(Math.max(5500, (ton?.dauer || 0) * 1000 + 1200));
    if (dennis.modus === 'hula') dennis.setzeModus('normal');
    // Reifen zurück an die Wand
    const W = welt.HULA_PLATZ;
    await Promise.race([dennis.gehZu(W.x, W.z, 1.3), warte(8000)]);
    welt.zurueckAnDieWand(r);
    z.hula = false;
    z.naechsterHula = sekundenSeitStart() + 90 + Math.random() * 60;
    dennis.heim();
  }

  // ---------- Feuer im Mülleimer ----------
  let feuerTon = null;
  // Grund: nach dem Flexen Funken, vorher hat Johnny seine Kippe reingeschnippt
  function feuerStart() {
    z.feuer = 'brennt';
    z.feuerGrund = z.geschnitten ? 'funken' : 'kippe';
    z.feuerSeit = sekundenSeitStart();
    welt.feuer(true);
    feuerTon = dauerTon('schweissen');
    feuerTon.staerke(0.35);
    ui.hinweis('Es brennt! Der Mülleimer neben der Werkbank!');
    ui.warnung('feuer', true);
    // Dennis lässt es eine Weile brennen, bevor er selbst löscht (ist trotzdem nicht begeistert)
    setTimeout(() => { if (z.feuer === 'brennt') dennisLoescht(); }, 16000);
  }
  function feuerAus() {
    z.feuer = 'aus';
    ui.warnung('feuer', false);
    welt.feuer(false);
    if (feuerTon) { feuerTon.stopp(); feuerTon = null; }
  }
  async function dennisLoescht() {
    if (z.dennisLoescht || z.feuer !== 'brennt') return;
    z.dennisLoescht = true;
    dennisSagt(z.feuerGrund === 'kippe' ? sag(DENNIS.feuer.rufJohnny) : sag(DENNIS.feuer.ruf), true, { prio: 1 });
    // aus Pause, Klo, Schlaf oder Liegen raus
    if (dennis.modus === 'sitzen' || dennis.modus === 'schlafen') { mittagGeweckt = true; z.mittag = 'erledigt'; welt.objekte.brotdose.visible = true; }
    if (dennis.modus !== 'normal') dennis.aufstehen(dennis.position.x, dennis.position.z);
    if (!dennis.wurzel.visible) { dennis.springZu(welt.KLO.x, welt.KLO.z); dennis.sichtbar(true); }
    dennis.besen(false);
    const F = welt.FEUER;
    const loescher = welt.objekte.feuerloescher;
    if (hand.item?.id === 'feuerloescher') {
      // Spieler hält den Löscher: Dennis drängelt, die Wut steigt, bis gelöscht ist
      dennisSagt(sag(DENNIS.feuer.duHastIhn), true);
      while (z.feuer === 'brennt' && hand.item?.id === 'feuerloescher') {
        await warte(9000);
        if (z.feuer !== 'brennt') break;
        if (await wutPlus({ wut: 5, name: 'Feuer brennen lassen' })) return;
        dennisSagt(sag(DENNIS.feuer.duHastIhn), true);
      }
      if (z.feuer !== 'brennt') { z.dennisLoescht = false; dennis.heim(); return; }
    }
    const L = nebenDing(loescher);
    await Promise.race([dennis.gehZu(L.x, L.z, 3.2), warte(6000)]);
    if (hand.item?.id === 'feuerloescher') { z.dennisLoescht = false; return dennisLoescht(); }
    if (z.feuer !== 'brennt') { z.dennisLoescht = false; dennis.heim(); return; }
    loescher.visible = false;
    dennis.feuerloescher(true);
    await Promise.race([dennis.gehZu(F.vorX, F.vorZ, 3.2), warte(7000)]);
    dennis.wurzel.rotation.y = Math.PI;
    const von = dennis.position.clone().add(new THREE.Vector3(0, 0.9, -0.3));
    welt.pulver(von, new THREE.Vector3(F.x, 0.6, F.z));
    const zisch = dauerTon('gas');
    await warte(1300);
    zisch.stopp();
    feuerAus();
    await warte(800);
    dennis.stimmung('sauer');
    if (!(await wutPlus(FEHLER.feuer))) dennisSagt(z.feuerGrund === 'kippe' ? sag(DENNIS.feuer.sauerJohnny) : sag(DENNIS.feuer.sauer), true);
    await warte(2500);
    const W = welt.LOESCHER;
    await Promise.race([dennis.gehZu(W.x, W.z, 1.6), warte(9000)]);
    dennis.feuerloescher(false);
    welt.zurueckAnDieWand(loescher);
    z.dennisLoescht = false;
    dennis.stimmung('ruhig');
    dennis.heim();
  }

  // Hüfte: Dennis humpelt auf freien Boden und legt sich dort hin (nicht unters Sofa)
  async function hueftePlatt() {
    z.huefte = 'geht';
    // erst still hinhumpeln und hinlegen, dann rufen und jammern
    const P = welt.HUEFTE_PLATZ;
    const da = await Promise.race([dennis.gehZu(P.x, P.z, 0.8), warte(9000).then(() => null)]);
    if (z.huefte !== 'geht') return;
    if (da === false) { z.huefte = 'nie'; return; }
    if (da === null) dennis.springZu(P.x, P.z);
    dennis.wurzel.rotation.y = P.dreh;
    dennis.setzeModus('liegen');
    z.huefte = 'liegt';
    z.jammerTimer = 16;
    await warte(900);
    dennisSagt(sag(DENNIS.huefte.start), true, { prio: 1 });
    dennisSagt(DENNIS.huefte.jammern[0], true, { minMs: 8000, prio: 1 });
  }

  async function aufhelfen() {
    z.huefte = 'erledigt';
    z.beschaeftigt = true;
    dennis.setzeModus('normal');
    await new Promise((r) => setTimeout(r, 900));
    z.wut = Math.max(0, z.wut - 12);
    dennis.stimmung('froh');
    jingle(true);
    ui.lobZeigen(sag(DENNIS.huefte.danke));
    setTimeout(() => { if (!z.beschaeftigt) dennis.stimmung('ruhig'); }, 4000);
    z.beschaeftigt = false;
    aktualisieren();
    dennis.heim();
  }

  // ---------- Dinge in der Hand ----------
  const AUFNEHMBAR = ['brille', 'handschuhe', 'helm', 'flex', 'edding', 'hammer', 'feuerloescher', 'besen', 'figur', 'handy', 'klemmbrett', 'hulahup', 'rohrzange', 'schlauch'];
  const ANZIEHBAR = ['brille', 'handschuhe', 'helm'];
  let handyMal = 0;

  function handleisteZeigen() {
    const el = document.getElementById('handleiste');
    if (!el) return;
    steuerung.tempo = hand.schwer ? 0.6 : 1;
    const it = hand.item;
    if (!it) { el.classList.add('versteckt'); el.innerHTML = ''; return; }
    const cfg = it.cfg;
    const knoepfe = [];
    if (ANZIEHBAR.includes(it.id)) knoepfe.push(['anziehen', cfg.tragen || 'Anziehen', 'E']);
    else if (cfg.benutzen) knoepfe.push(['benutzen', cfg.benutzen, 'E']);
    if (it.id === 'flasche') knoepfe.push(['', 'Klick auf Werkbank, Schweißtisch oder Waschplatz = abstellen', '']);
    else if (it.id === 'ofen') knoepfe.push(['', 'Klick auf Dennis = abgeben, Klick auf Schweißplatz = abstellen', '']);
    else if (!cfg.nichtAblegen) knoepfe.push(['', 'Klick auf Fläche = ablegen', '']);
    if (!cfg.nichtWerfen) knoepfe.push(['werfen', 'Werfen', 'Q']);
    if (!cfg.nichtAblegen && it.id !== 'flasche' && it.id !== 'ofen') knoepfe.push(['fallen', 'Fallen lassen', 'G']);
    if (it.id === 'schlauch') knoepfe.push(['fallen', 'Zurückhängen', 'G']);
    el.innerHTML = `<div class="hand-name">${SYMBOL.hand}<span>${cfg.name}</span></div>${knoepfe.map(([k, t, taste]) => (k
      ? `<button type="button" data-k="${k}">${taste ? `<kbd>${taste}</kbd>` : ''}${t}</button>`
      : `<span class="hand-tipp">${t}</span>`)).join('')}`;
    el.querySelectorAll('[data-k]').forEach((b) => {
      if (it.id === 'schlauch' && b.dataset.k === 'benutzen') {
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); handAktion('benutzen'); });
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, spritzStopp);
      } else b.addEventListener('click', () => handAktion(b.dataset.k));
    });
    el.classList.remove('versteckt');
  }

  function handAktion(k) {
    if (z.vorbei || z.beschaeftigt || !hand.item) return;
    if (k === 'anziehen') anziehen();
    else if (k === 'benutzen') benutzen();
    else if (k === 'werfen') werfen();
    else if (k === 'fallen') fallenLassen();
  }

  function aufnehmen(id, obj) {
    if (id === 'schlauch' && !hand.item) {
      // nur die Spritzpistole kommt in die Hand, der Schlauch bleibt an der Wand
      welt.objekte.schlauch.userData.pistole.visible = false;
      hand.nimm('schlauch', hand.spritze);
      blip(520, 0.05);
      handleisteZeigen();
      return;
    }
    if (hand.item) { ui.hinweis(`Du hast schon ${hand.item.cfg.name} in der Hand. Erst ablegen (auf eine Fläche klicken) oder fallen lassen (G).`, 3200); return; }
    obj.userData.interaktiv.station = null;
    hand.nimm(id, obj);
    blip(520, 0.05);
    handleisteZeigen();
    if (id === 'figur' && dennisSiehts()) fehler('figur');
    if (id === 'handy') handyReaktion();
  }

  async function handyReaktion() {
    if (!dennisSiehts()) return;
    handyMal++;
    // Ton und Text abwechselnd: handy1, handy2, handy1, ... (ab dem 2. Mal mit Wut)
    const erster = handyMal % 2 === 1;
    const text = erster ? DENNIS.hand.handy : DENNIS.hand.handyNochmal;
    const ton = erster ? 'stimme/hand.handy.mp3' : 'stimme/hand.handyNochmal.mp3';
    if (handyMal === 1) { dennisSagt(text, true, { ton }); return; }
    await fehler('handy', text, { ton });
  }

  function anziehen() {
    const id = hand.item.id;
    hand.weg();
    z.ppe[id] = true;
    blip(660, 0.08);
    const namen = { brille: 'Schutzbrille aufgesetzt.', handschuhe: 'Handschuhe angezogen.', helm: 'Schweißhelm aufgesetzt.' };
    ui.hinweis(namen[id]);
    aktualisieren();
  }

  // Ausrüstung wieder abnehmen: kommt in die Hand
  function abnehmen(id) {
    if (z.vorbei || z.beschaeftigt || !z.ppe[id]) return;
    if (hand.item) { ui.hinweis('Hände voll. Erst ablegen, dann abnehmen.'); return; }
    z.ppe[id] = false;
    hand.nimm(id, welt.objekte[id]);
    welt.objekte[id].userData.interaktiv.station = null;
    blip(440, 0.06);
    aktualisieren();
  }
  document.getElementById('ausruestung').addEventListener('click', (e) => {
    const k = e.target.closest('[data-k]')?.dataset.k;
    if (k) abnehmen(k);
  });

  // Schaut man ungefähr auf Dennis?
  function blickAufDennis(maxAbstand = 3) {
    if (!dennis.wurzel.visible) return false;
    const zu = dennis.kopfPosition().clone().sub(kamera.position);
    const d = zu.length();
    return d < maxAbstand && zu.normalize().dot(steuerung.blickRichtung()) > 0.85;
  }

  async function benutzen() {
    const id = hand.item.id;
    if (id === 'feuerloescher') return spruehen();
    if (id === 'besen') return fegen();
    if (id === 'handy') { ui.hinweis('3 neue Nachrichten. Alle unwichtig.'); return handyReaktion(); }
    if (id === 'hulahup') { ui.hinweis('Klick auf Dennis, dann gibst du ihm den Reifen.'); return; }
    if (id === 'schlauch') return spritzen();
    if (id === 'rohrzange') {
      const L = welt.LECK;
      if (z.leck === 'spritzt' && Math.hypot(kamera.position.x - L.x, kamera.position.z - L.z) < 3) return reparieren();
      ui.hinweis(z.leck === 'spritzt' ? 'Geh näher an den Waschplatz, dann kannst du das Rohr abdichten.' : 'Hier ist nichts zu reparieren.');
      return;
    }
    if (id === 'flex') {
      if (ohneAufsicht()) return;
      const ton = dauerTon('flex');
      await warte(1300);
      ton.stopp();
      if (blickAufDennis(3.5)) return fehler('flexAufDennis');
      if (dennisSiehts()) dennisSagt(sag(DENNIS.hand.flexLaeuft));
    }
  }

  // ziel: 'feuer', 'dennis' oder leer (dann zählt, wohin man guckt)
  // ---------- Wasserschlauch: rumspritzen ----------
  function schlauchZurueck() {
    hand.weg();
    welt.objekte.schlauch.userData.pistole.visible = true;
    handleisteZeigen();
  }
  // Düsenspitze der Spritzpistole vor der Kamera (passt zur Haltung in hand.js)
  const DUESE = new THREE.Vector3(0.2, -0.15, -0.72);
  // Dauerstrahl, solange E (oder der Knopf unten) gedrückt ist
  let spritzLauf = null;
  function spritzen() {
    if (spritzLauf || hand.item?.id !== 'schlauch') return;
    spritzLauf = { ton: dauerTon('wasser', 0.7), dauer: 0, feuer: 0, takt: 0 };
  }
  function spritzStopp() {
    if (!spritzLauf) return;
    spritzLauf.ton.stopp();
    spritzLauf = null;
  }
  function spritzUpdate(dt) {
    if (!spritzLauf) return;
    if (hand.item?.id !== 'schlauch' || z.beschaeftigt || z.vorbei) { spritzStopp(); return; }
    const sl = spritzLauf;
    sl.dauer += dt;
    const vorne = steuerung.blickRichtung();
    kamera.updateMatrixWorld();
    const von = kamera.localToWorld(DUESE.clone());
    sl.takt += dt;
    while (sl.takt > 0.012) {
      sl.takt -= 0.012;
      welt.wasser(von, von.clone().add(vorne.clone().multiplyScalar(3.2)), 2, 0.2);
    }
    // Feuer: kurz draufhalten löscht es
    const F = welt.FEUER;
    const zumFeuer = new THREE.Vector3(F.x, 0.6, F.z).sub(kamera.position);
    if (z.feuer === 'brennt' && Math.hypot(zumFeuer.x, zumFeuer.z) < 4.5 && zumFeuer.normalize().dot(vorne) > 0.7) {
      sl.feuer += dt;
      if (sl.feuer > 0.8) {
        feuerAus();
        z.wut = Math.max(0, z.wut - 5);
        aktualisieren();
        jingle(true);
        ui.lobZeigen(sag(DENNIS.hand.loeschen));
      }
      return;
    }
    if (blickAufDennis(4.5)) { spritzStopp(); fehler('nassgespritzt'); return; }
    if (sl.dauer > 1.5 && dennisSiehts() && sekundenSeitStart() - (z.spritzGemeckert || -99) > 10) {
      z.spritzGemeckert = sekundenSeitStart();
      // meckern, ohne den Strahl zu unterbrechen
      wutPlus(FEHLER.rumspritzen);
      dennisSagt(sag(DENNIS.schlauch.rumspritzen), false);
    }
  }

  // ---------- Wasserrohrbruch (Frost): Rohrzange holen und abdichten ----------
  let leckTon = null;
  function leckStart() {
    z.leck = 'spritzt';
    welt.leck(true);
    ui.warnung('wasser', true);
    leckTon = dauerTon('wasser', 0.35);
    ui.hinweis('Wasserrohrbruch am Waschplatz! Rohrzange von der Werkzeugwand holen!', 4000);
    dennisSagt(sag(DENNIS.leck.ruf), true, { prio: 1 });
    setTimeout(() => { if (z.leck === 'spritzt') dennisRepariert(); }, 22000);
  }
  function leckAus() {
    z.leck = 'dicht';
    welt.leck(false);
    ui.warnung('wasser', false);
    if (leckTon) { leckTon.stopp(); leckTon = null; }
  }
  async function reparieren() {
    if (ohneAufsicht()) return;
    const ok = await ui.haltenDialog({ titel: 'Rohr abdichten', text: 'Rohrzange ansetzen und die Verschraubung festziehen.', knopf: 'Festziehen (halten)', sekunden: 2 });
    if (!ok || z.leck !== 'spritzt') return;
    klonk(0.6);
    leckAus();
    z.wut = Math.max(0, z.wut - 5);
    aktualisieren();
    jingle(true);
    ui.lobZeigen(sag(DENNIS.leck.gut));
  }
  async function dennisRepariert() {
    if (z.dennisRepariert || z.leck !== 'spritzt') return;
    z.dennisRepariert = true;
    if (dennis.modus === 'sitzen' || dennis.modus === 'schlafen') { mittagGeweckt = true; z.mittag = 'erledigt'; welt.objekte.brotdose.visible = true; }
    if (dennis.modus !== 'normal') dennis.aufstehen(dennis.position.x, dennis.position.z);
    if (!dennis.wurzel.visible) { dennis.springZu(welt.KLO.x, welt.KLO.z); dennis.sichtbar(true); }
    const zange = welt.objekte.rohrzange;
    // Spieler hält die Zange: Dennis drängelt, bis abgedichtet ist
    while (z.leck === 'spritzt' && hand.item?.id === 'rohrzange') {
      dennisSagt(sag(DENNIS.leck.duHastSie), true);
      await warte(9000);
      if (z.leck !== 'spritzt') break;
      if (await wutPlus({ wut: 4, name: 'Wasser laufen lassen' })) return;
    }
    if (z.leck !== 'spritzt') { z.dennisRepariert = false; dennis.heim(); return; }
    const Z = nebenDing(zange);
    await Promise.race([dennis.gehZu(Z.x, Z.z, 3), warte(8000)]);
    if (hand.item?.id === 'rohrzange') { z.dennisRepariert = false; return dennisRepariert(); }
    if (z.leck !== 'spritzt') { z.dennisRepariert = false; dennis.heim(); return; }
    zange.visible = false;
    const L = welt.LECK;
    await Promise.race([dennis.gehZu(L.vorX, L.vorZ, 3), warte(8000)]);
    dennis.wurzel.rotation.y = Math.PI / 2;
    for (let i = 0; i < 4; i++) { klonk(0.4); await warte(600); }
    leckAus();
    if (!(await wutPlus({ wut: 12, name: 'Wasserrohrbruch Dennis überlassen' }))) dennisSagt(sag(DENNIS.leck.stinkig), true);
    await warte(2500);
    const W = welt.ROHRZANGE;
    await Promise.race([dennis.gehZu(W.x, W.z, 1.6), warte(9000)]);
    welt.zurueckAnDieWand(zange);
    z.dennisRepariert = false;
    dennis.heim();
  }

  async function spruehen(ziel) {
    const F = welt.FEUER;
    const feuerPos = new THREE.Vector3(F.x, 0.6, F.z);
    const vorne = steuerung.blickRichtung();
    const von = kamera.position.clone().add(vorne.clone().multiplyScalar(0.5));
    von.y -= 0.35;
    const zisch = dauerTon('gas');
    setTimeout(() => zisch.stopp(), 1300);
    const zumFeuer = feuerPos.clone().sub(kamera.position);
    const feuerNah = z.feuer === 'brennt' && Math.hypot(zumFeuer.x, zumFeuer.z) < 3.2;
    if (!ziel) ziel = feuerNah && zumFeuer.normalize().dot(vorne) > 0.75 ? 'feuer' : blickAufDennis(3.5) ? 'dennis' : '';
    if (ziel === 'dennis') {
      welt.pulver(von, dennis.kopfPosition().clone());
      return fehler('gespruehrt');
    }
    if (ziel === 'feuer' && feuerNah) {
      welt.pulver(von, feuerPos);
      await warte(1200);
      feuerAus();
      z.wut = Math.max(0, z.wut - 5);
      aktualisieren();
      dennis.stimmung('froh');
      jingle(true);
      ui.lobZeigen(sag(DENNIS.hand.loeschen));
      return;
    }
    welt.pulver(von, von.clone().add(vorne.multiplyScalar(2.5)));
    if (dennisSiehts()) await fehler('loescherSpielen');
  }

  function werfen() {
    const it = hand.item;
    if (it.cfg.nichtWerfen) {
      if (it.id === 'flasche' || it.id === 'ofen') dennisSagt(sag(DENNIS.hand.flascheWerfen), true);
      else ui.hinweis('Den Kaffee wirfst du besser nicht.');
      return;
    }
    const id = it.id;
    let getroffen = false;
    hand.wirf(steuerung.blickRichtung(), (gid, obj) => {
      klonk(gid === 'figur' || gid === 'feuerloescher' ? 0.8 : 0.4);
    }, () => {
      getroffen = true;
      fehler('getroffen');
    });
    handleisteZeigen();
    setTimeout(() => {
      if (getroffen || !dennisSiehts() || z.vorbei) return;
      if (id === 'figur') fehler('figurWerfen');
      else if (id === 'handy') dennisSagt(sag(DENNIS.hand.handyWerfen));
      else fehler('werfen', sag(DENNIS.wurf[WURF_ART[id]] || DENNIS.wurf.werkzeug));
    }, 700);
  }

  function fallenLassen() {
    const it = hand.item;
    if (it.id === 'schlauch') return schlauchZurueck();
    if (it.cfg.nichtAblegen) { ui.hinweis('Den bringst du besser Dennis.'); return; }
    if (it.id === 'ofen') { ui.hinweis('Den Ofen nicht fallen lassen! Zu Dennis bringen oder am Schweißplatz abstellen.'); return; }
    if (it.id === 'flasche') { ui.hinweis('Die Flasche nicht einfach fallen lassen. Auf Werkbank, Schweißtisch oder Waschplatz klicken.'); return; }
    hand.fallenLassen(steuerung.blickRichtung());
    klonk(0.3);
    handleisteZeigen();
  }

  // Gasflasche hochheben und woanders hinstellen
  function flascheHochheben() {
    if (hand.item) { ui.hinweis('Für die Flasche brauchst du beide Hände. Erst ablegen.'); return; }
    hand.nimm('flasche', welt.objekte.flasche.gruppe);
    z.ortVorher = z.ort;
    z.ort = 'hand';
    klonk(0.3);
    aktualisieren();
    ui.hinweis('Schwer! Jetzt auf die Werkbank, den Schweißtisch oder den Waschplatz klicken.', 3200);
  }
  async function flascheAbstellen(punkt) {
    const beine = z.naehte.beine !== null;
    let ort = punkt ? welt.flaschenOrtBei(punkt, beine) : null;
    if (ort && (irgendeineNaht() || beine) && ort !== 'schweiss') ort = null;
    if (!ort) { ui.hinweis('Da passt die Flasche nicht hin. Werkbank, Schweißtisch oder Waschplatz.'); return; }
    hand.loslassen();
    z.ort = ort;
    klonk(0.5);
    aktualisieren();
    steuerung.sperre(true);
    await gehZuStation(ort);
    steuerung.sperre(false);
  }

  // Klick, während man etwas in der Hand hat. true = erledigt
  async function klickMitHand(treffer) {
    const it = hand.item;
    const info = treffer.info;
    if (it.id === 'ofen') {
      if (info?.id === 'dennis') {
        if (dennis.modus !== 'normal' || z.aufKlo || z.dennisLoescht || z.dennisFegt) { ui.hinweis('Dennis hat gerade keine Hand frei. Gleich nochmal.'); return true; }
        steuerung.sperre(true);
        await hinZu(info, treffer.obj);
        steuerung.sperre(false);
        await abgeben();
        return true;
      }
      if (treffer.abstand > 4) { ui.hinweis('Zu weit weg. Geh näher ran.'); return true; }
      if (welt.flaschenOrtBei(treffer.punkt || kamera.position, true) !== 'schweiss') { ui.hinweis('Bring den Ofen zu Dennis. Oder stell ihn am Schweißplatz wieder ab.'); return true; }
      await flascheAbstellen(treffer.punkt);
      return true;
    }
    if (it.id === 'flasche') {
      if (treffer.abstand > 4) { ui.hinweis('Zu weit weg. Geh näher ran.'); return true; }
      await flascheAbstellen(treffer.punkt);
      return true;
    }
    if (info) {
      const ziel = info.id;
      if (it.id === 'feuerloescher' && (ziel === 'muelleimer' || ziel === 'dennis')) {
        steuerung.sperre(true);
        await hinZu(info, treffer.obj);
        await steuerung.dreheZu(ziel === 'dennis' ? dennis.kopfPosition() : new THREE.Vector3(welt.FEUER.x, 0.6, welt.FEUER.z), 0.3);
        steuerung.sperre(false);
        await spruehen(ziel === 'dennis' ? 'dennis' : 'feuer');
        return true;
      }
      if (it.id === 'rohrzange' && ziel === 'wasserhahn') {
        await hinZu(info, treffer.obj);
        if (z.leck === 'spritzt') await reparieren(); else ui.hinweis('Das Rohr ist dicht.');
        return true;
      }
      if (it.id === 'kaffee' && ziel === 'dennis' && dennis.modus === 'normal') { await hinZu(info, treffer.obj); await kaffeeGeben(); return true; }
      if (it.id === 'hulahup' && ziel === 'dennis') {
        if (dennis.modus !== 'normal' || z.dennisLoescht || z.dennisFegt || z.aufKlo) { ui.hinweis('Dennis hat gerade keine Zeit für Hula-Hoop.'); return true; }
        await hinZu(info, treffer.obj);
        hand.weg();
        handleisteZeigen();
        hulaHoop(false);
        return true;
      }
      const passt = { edding: z.ort === 'werkbank' && !z.angezeichnet, flex: z.ort === 'werkbank' && !z.geschnitten, hammer: irgendeineNaht() && !z.schlackeWeg };
      if (ziel === 'flasche' && passt[it.id]) {
        await hinZu(info, treffer.obj);
        if (it.id === 'edding') await anzeichnen();
        else if (it.id === 'flex') await schneiden();
        else await schlackeKlopfen();
        return true;
      }
      if (AUFNEHMBAR.includes(ziel)) { aufnehmen(ziel, treffer.obj); return true; }
      return false;
    }
    // Fläche: hinlegen
    if (it.cfg.nichtAblegen) { ui.hinweis('Den Kaffee bringst du Dennis.'); return true; }
    if (treffer.abstand > 3) { ui.hinweis('Zu weit weg zum Ablegen.'); return true; }
    if (!treffer.normale || treffer.normale.y < 0.6) { ui.hinweis('Da hält nichts. Leg es auf eine ebene Fläche.'); return true; }
    const r = steuerung.blickRichtung();
    hand.lege(treffer.punkt, Math.atan2(r.x, r.z));
    klonk(0.25);
    handleisteZeigen();
    return true;
  }

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.repeat) return;
    if (!document.getElementById('dialog').classList.contains('versteckt')) return;
    const k = e.key.toLowerCase();
    if (k === 'e') handAktion(hand.item && ANZIEHBAR.includes(hand.item.id) ? 'anziehen' : 'benutzen');
    else if (k === 'q') handAktion('werfen');
    else if (k === 'g') handAktion('fallen');
  });
  window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() === 'e') spritzStopp(); });
  window.addEventListener('blur', spritzStopp);

  function menueFuer(id) {
    const A = (text, symbol, tun) => ({ text, symbol, tun });
    switch (id) {
      case 'brille':
      case 'handschuhe':
      case 'helm': {
        const namen = { brille: 'Schutzbrille', handschuhe: 'Schweißerhandschuhe', helm: 'Schweißhelm' };
        return [namen[id], 'Gehört zur Schutzausrüstung.', [
          A(id === 'handschuhe' ? 'Anziehen' : 'Aufsetzen', id, () => {
            z.ppe[id] = true;
            welt.objekte[id].removeFromParent();
            blip(660, 0.08);
            ui.hinweis(`${namen[id]}: ${id === 'handschuhe' ? 'angezogen' : 'aufgesetzt'}.`);
            aktualisieren();
          }),
          A('In die Hand nehmen', 'hand', () => aufnehmen(id, welt.objekte[id])),
        ]];
      }
      case 'flasche': {
        const a = [];
        if (z.ort === 'wasch') {
          if (!z.ventilAuf) a.push(A('Ventil aufdrehen, Restgas ablassen', 'ventil', ventilAufdrehen));
          if (!z.gespuelt) a.push(A('Mit Wasser spülen', 'wasser', spuelen));
          a.push(A('Hochheben und tragen', 'tragen', flascheHochheben));
        } else if (z.ort === 'werkbank') {
          if (!z.angezeichnet) a.push(A('Tür anzeichnen (Edding)', 'stift', anzeichnen));
          if (!z.geschnitten) a.push(A('Tür ausschneiden (Flex)', 'funke', schneiden));
          a.push(A('Hochheben und tragen', 'tragen', flascheHochheben));
        } else {
          for (const [k, n] of Object.entries(NAEHTE)) if (z.naehte[k] === null) a.push(A(`${n.name} anschweißen`, 'funke', () => schweissen(k)));
          if (irgendeineNaht() && !z.schlackeWeg) a.push(A('Schlacke abklopfen', 'hammer', schlackeKlopfen));
          if (alleNaehte() && z.schlackeWeg && !z.lackiert) a.push(A('Mit Ofenlack schwarz lackieren', 'funke', lackieren));
          if (!irgendeineNaht()) a.push(A('Hochheben und tragen', 'tragen', flascheHochheben));
          if (z.lackiert) a.push(A('Hochheben und zu Dennis bringen', 'tragen', ofenHochheben));
        }
        const info = z.ort === 'wasch'
          ? `Propanflasche 11 kg, angeblich leer. ${z.ventilAuf ? 'Ventil offen.' : 'Ventil zu.'} ${z.gespuelt ? 'Gespült.' : 'Nicht gespült.'}`
          : z.ort === 'werkbank' ? (z.geschnitten ? 'Tür ist raus.' : z.angezeichnet ? 'Tür ist angezeichnet.' : 'Liegt bereit.') : z.lackiert ? 'Fertig lackiert. Bring ihn zu Dennis.'
            : z.naehte.beine !== null ? 'Steht auf seinen Beinen vor dem Schweißtisch.' : 'Liegt auf dem Schweißtisch.';
        return [irgendeineNaht() ? 'Ofen' : 'Gasflasche', info, a];
      }
      case 'flex':
        return ['Winkelschleifer', 'Mit Trennscheibe. Dreht mit 11.000 Umdrehungen.', [A('In die Hand nehmen', 'hand', () => aufnehmen('flex', welt.objekte.flex))]];
      case 'edding':
        return ['Edding', 'Blau, wasserfest.', [A('In die Hand nehmen', 'hand', () => aufnehmen('edding', welt.objekte.edding))]];
      case 'schlauch':
        return ['Wasserschlauch', 'Gartenschlauch mit Spritzdüse.', [
          ...(z.ort === 'wasch' && !z.gespuelt ? [A('Flasche spülen', 'wasser', spuelen)] : []),
          A('In die Hand nehmen', 'hand', () => aufnehmen('schlauch', welt.objekte.schlauch)),
        ]];
      case 'rohrzange':
        return ['Rohrzange', 'Für Wasserrohre und alles, was klemmt.', [A('In die Hand nehmen', 'hand', () => aufnehmen('rohrzange', welt.objekte.rohrzange))]];
      case 'wasserhahn':
        return ['Wasserrohr', z.leck === 'spritzt' ? 'Es spritzt! Hol die Rohrzange von der Werkzeugwand.' : 'Hält hoffentlich. Im Winter friert es gern mal ein.', []];
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
        return ['Schlackenhammer', 'Für die Schlacke auf den Nähten.', [A('In die Hand nehmen', 'hand', () => aufnehmen('hammer', welt.objekte.hammer))]];
      case 'kaffee':
        return ['Kaffeetasse', 'Steht CHEF drauf. Riecht gut.', [A('Einen Schluck nehmen', 'tasse', () => (dennisSiehts() ? fehler('kaffee') : ui.hinweis('Heimlich ein Schluck. Kalt und bitter. Dennis hat nix gemerkt.')))]];
      case 'figur':
        return ['Holzfigur', 'Handgeschnitzt. Dennis’ ganzer Stolz. Frag besser nicht.', [A('In die Hand nehmen', 'hand', () => aufnehmen('figur', welt.objekte.figur))]];
      case 'feuerloescher':
        return ['Feuerlöscher', 'Pulverlöscher, 6 kg.', [A('In die Hand nehmen', 'hand', () => aufnehmen('feuerloescher', welt.objekte.feuerloescher))]];
      case 'klemmbrett':
        return ['Dennis’ Klemmbrett', 'Eine Liste in Dennis’ Handschrift.', [A('In die Hand nehmen', 'hand', () => aufnehmen('klemmbrett', welt.objekte.klemmbrett))]];
      case 'hulahup':
        return ['Hula-Hoop-Reifen', `Gehört Dennis. Sein Rekord: ${DENNIS_HULA_REKORD} Runden.`, [
          A('Dennis’ Rekord knacken (Minispiel)', 'funke', hulaRekord),
          A('In die Hand nehmen', 'hand', () => aufnehmen('hulahup', welt.objekte.hulahup)),
        ]];
      case 'ersteHilfe':
        return ['Erste-Hilfe-Kasten', 'Pflaster, Verband, Brandgel. Hoffentlich brauchst du den nicht.', []];
      case 'handy':
        return ['Dein Handy', '3 neue Nachrichten.', [A('In die Hand nehmen', 'hand', () => aufnehmen('handy', welt.objekte.handy))]];
      case 'muelleimer':
        if (z.feuer === 'brennt') return ['Mülleimer', 'Es brennt! Feuerlöscher holen, der hängt rechts an der Wand zwischen Schweißplatz und Waschplatz.', []];
        return ['Mülleimer', 'Voll mit Pappe und Schleifstaub. Brennt bestimmt gut.', []];
      case 'milch':
        return ['Milch', z.kaffeeInHand ? (z.kaffeeMilch ? 'Ist schon Milch drin.' : 'Dennis trinkt schwarz. Oder?') : 'Erst einen Kaffee kochen.', z.kaffeeInHand && !z.kaffeeMilch ? [A('Milch in den Kaffee', 'tasse', milchRein)] : []];
      case 'kaffeemaschine':
        return ['Kaffeemaschine', z.kaffeeInHand ? 'Du hast schon einen Kaffee in der Hand.' : 'Dennis’ ganzer Stolz.', z.kaffeeInHand ? [] : [A('Kaffee für Dennis kochen', 'tasse', kaffeeKochen)]];
      case 'kiwi':
        return ['Kiwis', z.kiwisWeg >= 6 ? 'Leer.' : `Noch ${6 - z.kiwisWeg} Kiwis. Gehören Dennis.`, z.kiwisWeg >= 6 ? [] : [A('Eine Kiwi nehmen und essen', 'hand', kiwiEssen)]];
      case 'brotdose':
        return ['Brotdose', 'Steht DENNIS drauf. Mit Edding.', [
          A('Reinschauen', 'auge', () => ui.hinweis('Eine Tomate und eine Banane. Riecht nach Mittagspause.')),
          A('Einmal abbeißen', 'hand', () => { mampfen(); return dennisSiehts() ? fehler('brotdose') : ui.hinweis('Heimlich abgebissen. Dennis hat nix gemerkt.'); }),
        ]];
      case 'box':
        return ['Soundbox', 'Ziemlich groß. Ziemlich laut.', [A(z.musik ? 'Ausschalten' : 'Anschalten', 'funke', musikUmschalten)]];
      case 'licht':
        return ['Lichtschalter', '', [A(z.licht ? 'Licht ausschalten' : 'Licht einschalten', 'hand', lichtUmschalten)]];
      case 'besen':
        return ['Besen', welt.dreck ? 'Der Boden könnte es vertragen.' : 'Alles sauber.', [A('Fegen', 'hand', fegen), A('In die Hand nehmen', 'hand', () => aufnehmen('besen', welt.objekte.besen))]];
      case 'dennis': {
        if (dennis.modus === 'liegen') return ['Dennis', 'Liegt auf dem Boden und hält sich die Hüfte.', [A('Dennis aufhelfen', 'hand', aufhelfen)]];
        if (dennis.modus === 'schlafen') return ['Dennis', 'Schläft. Schnarcht leise.', [A('Wecken', 'hand', wecken)]];
        if (dennis.modus === 'sitzen') return ['Dennis', 'Isst gerade. Lass ihn.', []];
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
    if (z.vorbei) return;
    // Schalter (Box, Licht) reagieren sofort, ohne erst hinzulaufen
    const schalter = treffer?.info && (treffer.info.id === 'box' || treffer.info.id === 'licht');
    if (schalter && !steuerung.gesperrt && !ui.menueOffen()) {
      if (treffer.info.id === 'box') musikUmschalten(); else lichtUmschalten();
      return;
    }
    if (z.beschaeftigt) return;
    if (ui.menueOffen()) { ui.schliesseMenue(); return; }
    if (!treffer) return;
    const { info, obj } = treffer;
    if (obj && !obj.visible) {
      if (info.id === 'dennis') ui.hinweis('Dennis ist gerade auf dem Klo.');
      return;
    }
    if (hand.item && (await klickMitHand(treffer))) return;
    if (!info) return;
    steuerung.sperre(true);
    await hinZu(info, obj);
    steuerung.sperre(false);
    const m = menueFuer(info.id);
    if (!m) return;
    const [titel, text, aktionen] = m;
    if (!aktionen.length) { ui.hinweis(`${titel}: ${text || 'Gerade nichts zu tun.'}`); return; }
    // Nur eine Möglichkeit: direkt ausführen, kein Menü
    if (aktionen.length === 1) { aktionen[0].tun(); return; }
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
    stimmenLaden();
    z.beschaeftigt = true;
    steuerung.sperre(true);
    aktualisieren();
    await new Promise((r) => setTimeout(r, 400));
    await dennisKommt(1.6);
    await auftritt({ schluessel: ['begruessung'], text: DENNIS.begruessung, stufe: 'mittel', stimmung: 'ruhig' });
    dennis.heim();
    steuerung.sperre(false);
    z.beschaeftigt = false;
  }

  function note() {
    const qs = [z.schnittQ ?? 0, ...Object.values(z.naehte).map((q) => q ?? 0)];
    const qualitaet = qs.reduce((a, b) => a + b, 0) / qs.length;
    // Arbeit zählt 75 Punkte, Dennis' Laune 25 (Mittel aus höchster Wut und Wut am Ende), dazu Abzüge
    const wut = (z.wutMax + z.wut) / 2;
    const teile = {
      arbeit: qualitaet * 0.75,
      laune: (100 - wut) * 0.25,
      fehler: -Math.min(15, z.fehler.length * 1.5),
      werkstatt: -((welt.dreck ? 4 : 0) + (z.dennisHatGefegt ? 2 : 0)),
    };
    const punkte = teile.arbeit + teile.laune + teile.fehler + teile.werkstatt;
    const n = punkte >= 85 ? 1 : punkte >= 72 ? 2 : punkte >= 58 ? 3 : punkte >= 45 ? 4 : punkte >= 30 ? 5 : 6;
    return { n, qualitaet: Math.round(qualitaet), punkte: Math.round(punkte), teile, wut: Math.round(wut) };
  }

  async function ende() {
    z.vorbei = true;
    z.beschaeftigt = true;
    steuerung.sperre(true);
    aktualisieren();
    const { n, qualitaet, punkte, teile, wut } = note();
    const pkt = (x) => `${x > 0 ? '+' : ''}${Math.round(x)}`;
    const kat = n <= 2 ? 'ende_gut' : n <= 4 ? 'ende_mittel' : 'ende_schlecht';
    const texte = { ende_gut: DENNIS.ende.gut, ende_mittel: DENNIS.ende.mittel, ende_schlecht: DENNIS.ende.schlecht };
    const stimmung = n <= 2 ? 'froh' : n <= 4 ? 'skeptisch' : 'sauer';
    dennis.stimmung(stimmung);
    if (z.ort !== 'abgegeben') await dennisKommt(1.6);
    jingle(n <= 4);
    if (n >= 5) await auftritt({ schluessel: [kat, 'rausgeflogen', 'ausraster'], text: texte[kat], stufe: 'voll', stimmung, seite: true });
    else await dennisSagt(texte[kat], false, { minMs: 4500 });
    const minuten = Math.round((performance.now() - z.start) / 60000);
    const naehte = Object.entries(NAEHTE).map(([k, nn]) => `<li><span>${nn.name}</span><b>${z.naehte[k]} %</b></li>`).join('');
    const bestanden = n <= 4;
    await ui.infoDialog(bestanden ? 'Bestanden!' : 'Nicht bestanden!', `
      <img class="ende-foto" src="assets/ende-${bestanden ? 'bestanden' : 'nichtbestanden'}.webp" alt="">
      <div class="note" style="color:${n <= 2 ? '#2b7a2b' : n <= 4 ? '#b5641b' : '#b3170d'}">Note ${n}</div>
      <ul class="wertung-liste">
        <li><span>Schnitt</span><b>${z.schnittQ} %</b></li>${naehte}
        <li><span>Verarbeitung gesamt</span><b>${qualitaet} %</b></li>
        <li><span>Dennis-Wut am Ende</span><b>${Math.round(z.wut)} %</b></li>
        <li><span>Höchste Dennis-Wut</span><b>${Math.round(z.wutMax)} %</b></li>
        <li><span>Werkstatt</span><b>${welt.dreck ? 'dreckig' : z.dennisHatGefegt ? 'Dennis musste fegen' : 'gefegt'}</b></li>
        <li><span>Zeit</span><b>${minuten} Min.</b></li>
      </ul>
      <p><b>So kommt die Note zustande (${punkte} von 100 Punkten):</b></p>
      <ul class="wertung-liste">
        <li><span>Arbeit (${qualitaet} % Verarbeitung, max. 75)</span><b>${pkt(teile.arbeit)}</b></li>
        <li><span>Dennis’ Laune (Wut im Schnitt ${wut} %, max. 25)</span><b>${pkt(teile.laune)}</b></li>
        <li><span>Fehler (je 1,5, höchstens 15)</span><b>${pkt(teile.fehler)}</b></li>
        <li><span>Werkstatt</span><b>${pkt(teile.werkstatt)}</b></li>
      </ul>
      <p class="klein">Note 1 ab 85, 2 ab 72, 3 ab 58, 4 ab 45 Punkten (bestanden), 5 ab 30, darunter 6.</p>
      ${z.fehler.length ? `<p><b>Fehler (${z.fehler.length}):</b></p><ul class="fehler-liste">${z.fehler.map((f) => `<li>${f}</li>`).join('')}</ul>` : '<p><b>Kein einziger Fehler. Dennis ist sprachlos.</b></p>'}`,
    [{ text: 'Nochmal' }]);
    location.reload();
  }

  async function rausgeflogen() {
    z.vorbei = true;
    dennis.stimmung('wut');
    await auftritt({ schluessel: ['rausgeflogen', 'ausraster'], text: DENNIS.rausgeflogen, stufe: 'voll', stimmung: 'wut' });
    jingle(false);
    await ui.infoDialog('Rausgeflogen!', `<img class="ende-foto" src="assets/ende-nichtbestanden.webp" alt="">
      <p>Dennis ist der Kragen geplatzt.</p>
      <ul class="fehler-liste">${z.fehler.map((f) => `<li>${f}</li>`).join('')}</ul>
      <p class="klein">Tipp: Die Regeln an der Wand hinter der Werkbank lesen.</p>`,
    [{ text: 'Nochmal versuchen', klasse: 'rot' }]);
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
  let letzteDennisPos = null;
  let zuletztGelaufen = -99;
  let dennisZuletztGelaufen = 0;
  const sekundenSeitStart = () => (performance.now() - z.start) / 1000;

  return {
    zustand: z,
    klick,
    test: { hueftePlatt, mittagspause, kloPause }, // nur für Tests (Playwright)
    stationWaehlen,
    intro,
    aktualisieren,
    update(dt) {
      beobachten();
      spritzUpdate(dt);
      if (z.vorbei) return;
      // Tanzen, wenn die Box läuft und Dennis Zeit hat
      const sollTanzen = z.musik && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && dennis.istDaheim() && dennis.modus !== 'liegen';
      if (sollTanzen && dennis.modus === 'normal') dennis.setzeModus('tanzen', technoBeat);
      if (!sollTanzen && dennis.modus === 'tanzen') dennis.setzeModus('normal');
      // Licht aus: Dennis meckert nach kurzer Zeit
      if (!z.licht) {
        z.lichtAusSeit += dt;
        if (z.lichtAusSeit > 2.5 && !z.beschaeftigt && !buehneBelegt()) {
          z.lichtAusSeit = -8;
          z.lichtGemeckert++;
          if (z.lichtGemeckert === 1) dennisSagt(sag(DENNIS.licht), true);
          else fehler('licht');
        }
      }
      // Neben Dennis stehen bleiben: Baustellenfeeling (nicht im Liegen, höchstens alle 40 s)
      const abstand = Math.hypot(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
      const steht = letztePos ? kamera.position.distanceTo(letztePos) < 0.002 : false;
      letztePos = kamera.position.clone();
      if (!steht) zuletztGelaufen = sekundenSeitStart();
      const dennisSteht = letzteDennisPos ? dennis.position.distanceTo(letzteDennisPos) < 0.002 : false;
      letzteDennisPos = dennis.position.clone();
      if (!dennisSteht) dennisZuletztGelaufen = sekundenSeitStart();
      // nur wenn wir hingegangen sind (gerade noch gelaufen) und Dennis schon eine Weile stand
      const hingegangen = sekundenSeitStart() - zuletztGelaufen < 4 && zuletztGelaufen - dennisZuletztGelaufen > 1.5;
      const passt = abstand < 1.9 && steht && hingegangen && dennis.modus === 'normal' && dennis.wurzel.visible && !z.beschaeftigt;
      if (!passt) z.nebenDennis = 0;
      else if (!z.nebenDennis) z.nebenDennis = sekundenSeitStart();
      if (z.nebenDennis && sekundenSeitStart() - z.nebenDennis > 1.0 && sekundenSeitStart() - z.baustelleZuletzt > 40 && !buehneBelegt() && ruhig() && !murmelTon) {
        z.baustelleZuletzt = sekundenSeitStart();
        z.nebenDennis = 0;
        dennisSagt(DENNIS.baustellenfeeling, false, { prio: 0, blase: false });
      }
      // Dreck: nach 18 s meckert Dennis (etwas Wut), nach 32 s fegt er selbst und ist sauer
      if (welt.dreck && !z.dreckGemeckert && sekundenSeitStart() - z.dreckSeit > 18 && dennisSiehts() && !z.beschaeftigt && !z.hula) {
        z.dreckGemeckert = true;
        wutPlus({ wut: 4, name: 'Dreck liegen lassen' });
        dennisSagt(sag(DENNIS.dreck.meckern), true, { prio: 1 });
      }
      if (!welt.dreck) z.dreckGemeckert = false;
      if (welt.dreck && !z.dennisFegt && !z.dennisLoescht && sekundenSeitStart() - z.dreckSeit > 32 && !z.beschaeftigt && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt()) {
        dennisFegt();
      }
      // Murmeln in der Nähe (nicht während Dennis spricht oder weg ist)
      // Gemurmel nur, wenn Dennis nichts anderes zu tun hat (nicht beim Schlafen, Löschen, Hüfte, Mittag, Klo, Fegen)
      const dennisFrei = dennis.modus === 'normal' && !z.dennisLoescht && !z.dennisFegt && !z.aufKlo
        && z.mittag !== 'gerade' && z.huefte !== 'geht' && z.huefte !== 'liegt';
      if (stimmeJetzt) stimmeJetzt.lautstaerke(sprechLautstaerke());
      if (murmelTon) {
        const weg = (buehneBelegt() && !z.dennisFegt) || (murmelTon.murmeln && !dennisFrei) || (murmelTon.tanz && dennis.modus !== 'tanzen') || (murmelTon.hula && dennis.modus !== 'hula');
        if (weg) { murmelTon.stopp(); murmelTon = null; } else murmelTon.lautstaerke(lautstaerkeNachAbstand(murmelTon.reichweite));
      }
      // In der Nähe: zufällig ein Spruch, je nach Laune aus Liste 1 (entspannt) oder 2 (gereizt)
      const gereizt = z.wut >= 35;
      const liste = gereizt ? NAEHE_2 : NAEHE_1;
      const reichweite = gereizt ? 8 : 4.5;
      if (liste.length && !murmelTon && ruhig() && dennisFrei && dennis.wurzel.visible && !z.beschaeftigt && !buehneBelegt()
        && sekundenSeitStart() > naechsterNaehe && abstand < reichweite - 1.2 && Math.random() < dt * 0.5) {
        naechsterNaehe = sekundenSeitStart() + 20 + Math.random() * 20;
        naechstesMurmeln = Math.max(naechstesMurmeln, sekundenSeitStart() + 10);
        ortsTon(liste[Math.floor(Math.random() * liste.length)], reichweite).then((t) => { if (t) t.murmeln = true; });
      }
      // Tanzen: gleich beim Anschalten und dann immer mal wieder der Tanz-Spruch
      if (dennis.modus !== 'tanzen') naechsterTanzRuf = 0;
      else if (!murmelTon && ruhig() && sekundenSeitStart() >= naechsterTanzRuf && !buehneBelegt()) {
        naechsterTanzRuf = sekundenSeitStart() + 9 + Math.random() * 8;
        ortsTon(TANZ_RUF).then((t) => { if (t) t.tanz = true; });
      }
      if (!murmelTon && ruhig() && sekundenSeitStart() > naechstesMurmeln && !z.beschaeftigt && !buehneBelegt() && dennis.wurzel.visible && dennisFrei && lautstaerkeNachAbstand() > 0.15) {
        naechstesMurmeln = sekundenSeitStart() + 15 + Math.random() * 20;
        murmeln();
      }
      // Feuer im Mülleimer: einmal pro Spiel, nach dem Flexen bald, sonst irgendwann
      if (z.feuer === 'nie' && sekundenSeitStart() > z.feuerAb && !z.beschaeftigt && !z.aufKlo && !z.dennisFegt && z.mittag !== 'gerade' && dennis.modus === 'normal' && !buehneBelegt()) feuerStart();
      // Wasserrohrbruch (Frost): einmal pro Spiel, irgendwann
      if (!z.leckAb) z.leckAb = 160 + Math.random() * 140;
      if (!z.leck && sekundenSeitStart() > z.leckAb && !z.beschaeftigt && !z.aufKlo && z.feuer !== 'brennt' && !z.hula && dennis.modus === 'normal' && !buehneBelegt()) leckStart();
      // Der Schlauch reicht nicht durch die ganze Werkstatt
      if (hand.item?.id === 'schlauch' && Math.hypot(kamera.position.x - 4.6, kamera.position.z - 1.8) > 5.2) {
        spritzStopp();
    schlauchZurueck();
        ui.hinweis(DENNIS.schlauch.zuKurz);
      }
      // Klo-Pause: einmal pro Spiel, nicht gleich am Anfang
      if (z.klo === 'nie' && !z.aufKlo && sekundenSeitStart() > 100 && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && z.mittag !== 'gerade' && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.03) {
        kloPause();
      }
      // Mittagspause: Dennis kommt mit Brotdose rüber und isst eine Tomate (einmal pro Spiel)
      if (z.mittag === 'nie' && sekundenSeitStart() > 140 && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !z.aufKlo && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.03) {
        mittagspause();
      }
      // Hula-Hoop ab und zu (Reifen hängt an der Wand)
      if (!z.naechsterHula) z.naechsterHula = 60 + Math.random() * 40;
      if (!z.hula && sekundenSeitStart() > z.naechsterHula && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !z.aufKlo && z.mittag !== 'gerade' && z.huefte !== 'geht' && z.huefte !== 'liegt' && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && !z.musik && reifenAnDerWand()) {
        z.naechsterHula = sekundenSeitStart() + 90 + Math.random() * 60;
        hulaHoop(true);
      }
      // Ab und zu stellt sich Dennis woanders hin (nicht immer vor dem Sofa)
      if (!z.naechsterPlatz) z.naechsterPlatz = sekundenSeitStart() + 25 + Math.random() * 20;
      if (sekundenSeitStart() > z.naechsterPlatz && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !z.aufKlo && z.mittag !== 'gerade' && z.huefte !== 'geht' && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && !z.musik) {
        z.naechsterPlatz = sekundenSeitStart() + 30 + Math.random() * 25;
        dennis.neuerPlatz();
      }
      // Hüfte: einmal pro Spiel legt sich Dennis hin und jammert, bis man ihm aufhilft
      const sekunden = (performance.now() - z.start) / 1000;
      if (z.huefte === 'nie' && sekunden > 75 && dennis.modus === 'normal' && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.04) {
        hueftePlatt();
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
          dennisSagt(zufallAus(DENNIS.huefte.jammern), true, { minMs: 8000, prio: 0 });
          if (z.wut >= 100) { z.beschaeftigt = true; rausgeflogen(); }
        }
      }
    },
  };
}

export function hatEchteClips() {
  return hatClip('begruessung') || hatClip('ausraster');
}
