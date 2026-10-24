// Spielablauf: Zustand, Aktionen, Fehler, Dennis-Reaktionen, Bewertung.
import * as THREE from 'three';
import { STATIONEN, AUGENHOEHE } from './world.js';
import { FELDWEG } from './draussen.js';
import { setze } from './toon.js';
import { auftritt, hatClip, buehneBelegt } from './clips.js';
import { pfadSpiel, schlackeSpiel, hulaSpiel, DENNIS_HULA_REKORD, ventilSpiel, spuelSpiel, anzeichnenSpiel, lackierSpiel, bitsatzSpiel, akkuschrauberSpiel, siebSpiel, kaffeeSpiel, rohrSpiel } from './minispiele.js';
import { bierAuf, blip, kratzen, jingle, klonk, brummeln, dauer as dauerTon, technoAn, technoAus, technoBeat, klospuelung, mampfen, klick as schalterKlick, stimmeAbspielen, stimmenVorladen, husten, peitschenKnall } from './audio.js';
import * as ui from './ui.js';
import { DENNIS, JONNY, WALDO, KUMPEL, satzId } from './texte.js';
import { SYMBOL } from './gesicht.js';
import { baueFahrten } from './fahrten.js';

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
  maske: {
    stufe: 'mittel', wut: 15, clip: 'fehler_brille', name: 'Ohne Atemmaske lackiert',
    texte: DENNIS.fehler.maske,
  },
  ventilDrinnen: {
    stufe: 'voll', wut: 30, clip: 'fehler_gasflasche', name: 'Gas in der Werkstatt abgelassen',
    texte: DENNIS.fehler.ventilDrinnen,
  },
  ventilSchnell: {
    stufe: 'leicht', wut: 6, clip: 'fehler_gasflasche', name: 'Ventil zu schnell aufgerissen',
    texte: DENNIS.fehler.ventilSchnell,
  },
  anzeichnen: {
    stufe: 'leicht', wut: 5, clip: 'fehler_schnitt', name: 'Tür krakelig angezeichnet',
    texte: DENNIS.fehler.anzeichnen,
  },
  lacknasen: {
    stufe: 'leicht', wut: 5, clip: 'fehler_naht', name: 'Lacknasen am Ofen',
    texte: DENNIS.fehler.lacknasen,
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
  waescheHeiss: {
    stufe: 'leicht', wut: 10, nebensache: true, name: 'Dennis’ Wäsche zu heiß gewaschen',
    texte: DENNIS.waesche.heiss,
  },
  waescheSieb: {
    stufe: 'leicht', wut: 5, nebensache: true, name: 'Trockner mit dreckigem Flusensieb',
    texte: DENNIS.waesche.sieb,
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
  kaffee: 'kaffee',
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

export function baueSpiel({ welt, dennis, jonny, waldo, torben, kumpels, fz, segway, steuerung, kamera, hand }) {
  const z = {
    ppe: { brille: false, handschuhe: false, helm: false, maske: false },
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
    wut: 15, // Dennis ist heute gereizt (Gehwegplatte auf dem Benz, nachts um 4)
    wutMax: 15,
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
    waesche: 'nie', // nie, tasche, laeuft, gewaschen, nass, trocknet, trocken, zuDennis, erledigt
    waescheGrad: 40,
    waescheZeit: 0,
    sieb: 'drin', // drin (dreckig), hand, sauber (in der Hand), eingesetzt
    verstopft: 'nie', // nie, ja, dennis, erledigt
    vorbei: false,
  };
  const multi = 1;

  function alleNaehte() { return Object.values(z.naehte).every((q) => q !== null); }
  function irgendeineNaht() { return Object.values(z.naehte).some((q) => q !== null); }

  function aufgaben() {
    return [
      { text: 'Flasche nach draußen tragen', fertig: z.ventilAuf || z.ort === 'draussen' },
      { text: 'Draußen Restgas ablassen (Ventil auf)', fertig: z.ventilAuf },
      { text: 'Zurück zum Waschplatz tragen', fertig: z.gespuelt || (z.ventilAuf && z.ort === 'wasch') },
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
      ...(z.bitsatz === 'sortiert' ? [{ text: 'Bitsatz im Regal sortiert', fertig: true, neben: true }] : []),
      ...(z.akku ? [{ text: 'Waldos Akkuschrauber reparieren', fertig: z.akku === 'repariert', neben: true }] : []),
      ...(z.waesche === 'nie' ? [] : [
        { text: 'Für Dennis: Wäsche bei 40 Grad waschen', fertig: !['holt', 'tasche', 'laeuft'].includes(z.waesche), neben: true },
        { text: 'Flusensieb ausblasen (Kompressor) und wieder einsetzen', fertig: z.sieb === 'eingesetzt', neben: true },
        { text: 'Wäsche trocknen und Dennis bringen', fertig: z.waesche === 'erledigt', neben: true },
      ]),
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
    telefonAuflegen();
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
    if (f.stufe === 'voll') z.letzterAusraster = sekundenSeitStart();
    else vielleichtAusraster();
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

  // Lob: senkt die Wut (Standard 5, richtig gute Arbeit bis 12)
  async function lob(text, minus = 5) {
    z.beschaeftigt = true;
    z.wut = Math.max(0, z.wut - minus);
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
    // Restgas nur draußen ablassen! Drinnen gibt es sofort Ärger
    if (z.ort !== 'draussen') return fehler('ventilDrinnen');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await ventilSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.ventilAuf = true;
    welt.objekte.flasche.ventil.rotation.z += Math.PI * 3;
    ui.hinweis('Zischt nicht mehr. Restgas ist raus.');
    aktualisieren();
    if (e.zuSchnell) await fehler('ventilSchnell');
  }

  async function spuelen() {
    if (ohneAufsicht()) return;
    if (z.ort !== 'wasch') { ui.hinweis('Die Flasche muss dafür zum Waschplatz.'); return; }
    if (!z.ventilAuf) { ui.hinweis('Das Ventil ist noch zu. Da kommt kein Wasser rein.'); return; }
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await spuelSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.gespuelt = true;
    ui.hinweis('Gespült und ausgekippt. Jetzt ist kein Gas mehr drin.');
    aktualisieren();
  }

  async function anzeichnen() {
    if (ohneAufsicht()) return;
    if (z.ort !== 'werkbank') { ui.hinweis('Erst die Flasche auf die Werkbank legen.'); return; }
    if (z.angezeichnet) { ui.hinweis('Ist schon angezeichnet.'); return; }
    if (hand.item?.id !== 'edding') { ui.hinweis('Nimm den blauen Edding in die Hand (liegt auf der Werkbank).'); return; }
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await anzeichnenSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    kratzen();
    z.angezeichnet = true;
    z.anzeichnenQ = e.qualitaet;
    ui.hinweis(`Tür angezeichnet. Genauigkeit ${e.qualitaet} %.`);
    aktualisieren();
    if (e.qualitaet < 50) await fehler('anzeichnen');
    else if (e.qualitaet >= 90) await lob(sag(DENNIS.lobAnzeichnen), e.qualitaet >= 97 ? 12 : 10);
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
    else if (e.qualitaet >= 88) await lob(sag(DENNIS.lobSchnitt), e.qualitaet >= 95 ? 12 : 10);
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
      await lob(undefined, e.qualitaet >= 92 ? 12 : 10);
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
    // Lackdämpfe: ohne Atemmaske gibt es Ärger
    if (!z.ppe.maske) return fehler('maske');
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await lackierSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.lackiert = true;
    z.lackQ = e.qualitaet;
    ui.hinweis(e.nasen ? `Lackiert, aber ${e.nasen} Lacknasen. Ab zu Dennis damit.` : 'Schick! Ab zu Dennis damit.');
    aktualisieren();
    if (e.nasen >= 3) await fehler('lacknasen');
    else if (!e.nasen) await lob(sag(DENNIS.lobLack), e.qualitaet >= 97 ? 12 : 10);
  }

  function naechsterTipp() {
    const t = DENNIS.tipp;
    if (!z.ventilAuf) return z.ort === 'draussen' ? t.ventilDraussen : t.ventil;
    if (!z.gespuelt) return z.ort === 'wasch' ? t.spuelen : t.zurueckWasch;
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
    if (!z.lackiert) return z.ppe.maske ? t.lackieren : t.lackierenMaske;
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
    // Mit Werkzeug in der Hand geht das nicht. Nur Dinge, die man nicht einfach hinlegen kann (Kaffee, Wäsche, Sieb), darf man halten.
    if (hand.item && !['kaffee', 'waeschetasche', 'sieb'].includes(hand.item.id)) { ui.hinweis('Für den Ofen brauchst du beide Hände. Erst ablegen.'); return; }
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


  // ---------- Nebenaufgabe: Dennis' 40-Grad-Wäsche ----------
  const WASCH_DAUER = 50;
  const TROCKEN_DAUER = 35;
  function wm() { return welt.objekte.waschmaschine; }
  function tr() { return welt.objekte.trockner; }
  function klemmbrettZurueck() {
    const kb = hand.loslassen();
    if (!kb) return;
    kb.position.copy(kb.userData.start.pos);
    kb.rotation.copy(kb.userData.start.rot);
  }
  async function waescheUebernehmen() {
    if (z.waesche !== 'nie') { ui.hinweis(z.waesche === 'holt' ? 'Dennis holt die Wäsche schon.' : 'Die Wäsche machst du schon.'); return; }
    if (!dennisSiehts() || dennis.modus !== 'normal' || z.dennisLoescht || z.dennisFegt || z.hula || z.dennisRaeumt) { ui.hinweis('Dennis ist gerade beschäftigt. Gleich nochmal.'); return; }
    // man bleibt frei beweglich: Dennis holt die Tasche oben vom Trockner und bringt sie
    z.waesche = 'holt';
    z.dennisRaeumt = true;
    klemmbrettZurueck();
    handleisteZeigen();
    aktualisieren();
    dennis.stimmung('froh');
    dennisSagt(sag(DENNIS.waesche.holen), false, { prio: 1 });
    const tasche = welt.objekte.waeschetasche;
    const T = welt.objekte.trockner.g.position;
    for (const p of [{ x: 1.4, z: 3.4 }, welt.KLO_DRIN, { x: T.x - 0.75, z: T.z }]) await Promise.race([dennis.gehZu(p.x, p.z, 1.5), warte(8000)]);
    dennis.trage(tasche);
    klonk(0.25);
    for (const p of [welt.KLO_DRIN, { x: 1.4, z: 3.4 }]) await Promise.race([dennis.gehZu(p.x, p.z, 1.5), warte(8000)]);
    await dennisKommt(1.6);
    // Hände frei? Sonst kurz warten, notfalls stellt er die Tasche vor einem ab
    for (let i = 0; i < 20 && hand.item; i++) { if (i === 0) ui.hinweis('Mach die Hände frei, Dennis gibt dir die Wäschetasche.'); await warte(500); }
    dennis.trage(null);
    z.waesche = 'tasche';
    if (!hand.item) {
      hand.nimm('waeschetasche', tasche);
      tasche.userData.waesche.visible = true;
    } else {
      dennis.wurzel.parent.add(tasche);
      tasche.position.set(dennis.position.x + 0.5, 0, dennis.position.z + 0.3);
      tasche.rotation.set(0, 0, 0);
      tasche.visible = true;
    }
    klonk(0.3);
    aktualisieren();
    z.dennisRaeumt = false;
    for (const satz of DENNIS.waesche.anleitung) await dennisSagt(satz, false, { prio: 1, minMs: 5200 });
    dennis.stimmung('ruhig');
    dennis.heim();
  }
  async function waescheStarten(grad) {
    if (hand.item?.id !== 'waeschetasche' || z.waesche !== 'tasche') return;
    ui.schliesseMenue();
    hand.weg();
    welt.objekte.waeschetasche.visible = false;
    z.waesche = 'laeuft';
    z.waescheGrad = grad;
    z.waescheZeit = WASCH_DAUER;
    wm().laeuft = true;
    wm().waesche.visible = true;
    wm().knopf.rotation.x = (grad - 40) / 30;
    blip(700, 0.08);
    aktualisieren();
    ui.hinweis(`Waschmaschine läuft (${grad} Grad). Dauert ein bisschen.`, 3200);
    if (grad > 40) {
      await warte(1200);
      if (dennisSiehts()) await fehler('waescheHeiss');
      else z.waescheHeimlich = true;
    } else if (grad < 40 && dennisSiehts()) dennisSagt(sag(DENNIS.waesche.kalt), false, { prio: 1 });
  }
  function waescheRaus() {
    if (hand.item) { ui.hinweis('Für die nasse Wäsche brauchst du beide Hände frei.'); return; }
    z.waesche = 'nass';
    wm().waesche.visible = false;
    wm().anzeige.zeig('--:--');
    hand.nimm('waeschetasche', welt.objekte.waeschetasche);
    welt.objekte.waeschetasche.userData.waesche.visible = true;
    klonk(0.3);
    aktualisieren();
    ui.hinweis('Nasse Wäsche in der Tasche. Ab in den Trockner obendrauf.', 3000);
  }
  function siebRaus() {
    if (hand.item) { ui.hinweis('Erst die Hände frei machen.'); return; }
    hand.nimm('sieb', tr().sieb);
    z.sieb = 'hand';
    blip(480, 0.05);
    aktualisieren();
    ui.hinweis('Voller Fusseln! Am Kompressor (Ecke rechts neben dem Regal) mit Druckluft ausblasen.', 3200);
  }
  function siebRein(dreckig = false) {
    const sieb = hand.weg();
    tr().g.add(sieb);
    sieb.position.set(-0.29, 0.13, 0);
    sieb.rotation.set(0, 0, 0);
    sieb.scale.set(1, 1, 1);
    z.sieb = dreckig ? 'drin' : 'eingesetzt';
    klonk(0.25);
    aktualisieren();
    ui.hinweis(dreckig ? 'Dreckiges Sieb wieder reingesteckt. Für den Trockner muss es aber erst sauber sein.' : 'Sieb sitzt. Jetzt kann der Trockner laufen.');
  }
  async function siebAusblasen() {
    if (hand.item?.id !== 'sieb' || z.sieb !== 'hand') return;
    z.beschaeftigt = true;
    steuerung.sperre(true);
    const e = await siebSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    const k = welt.objekte.kompressor.position;
    welt.pulver(new THREE.Vector3(k.x + 0.6, 1.0, k.z + 0.2), new THREE.Vector3(k.x + 1.8, 1.4, k.z + 0.6));
    hand.item.obj.userData.sauber(true);
    z.sieb = 'sauber';
    aktualisieren();
    ui.hinweis('Blitzsauber. Zurück in den Trockner damit.');
  }
  async function trocknerStarten() {
    if (hand.item?.id !== 'waeschetasche' || z.waesche !== 'nass') return;
    if (z.sieb !== 'eingesetzt') {
      if (!z.siebGemeckert && dennisSiehts()) { z.siebGemeckert = true; await fehler('waescheSieb'); }
      else ui.hinweis('Erst das Flusensieb ausbauen, am Kompressor ausblasen und wieder einsetzen.', 3200);
      return;
    }
    hand.weg();
    welt.objekte.waeschetasche.visible = false;
    z.waesche = 'trocknet';
    z.waescheZeit = TROCKEN_DAUER;
    tr().laeuft = true;
    tr().waesche.visible = true;
    blip(700, 0.08);
    aktualisieren();
    ui.hinweis('Trockner läuft.', 2500);
  }
  function trockenRaus() {
    if (hand.item) { ui.hinweis('Erst die Hände frei machen.'); return; }
    z.waesche = 'zuDennis';
    tr().waesche.visible = false;
    tr().anzeige.zeig('--:--');
    hand.nimm('waeschetasche', welt.objekte.waeschetasche);
    welt.objekte.waeschetasche.userData.waesche.visible = true;
    klonk(0.3);
    aktualisieren();
    ui.hinweis('Warm und trocken. Jetzt zu Dennis bringen.', 3000);
  }
  async function waescheGeben() {
    hand.weg();
    welt.objekte.waeschetasche.visible = false;
    z.waesche = 'erledigt';
    handleisteZeigen();
    const heiss = z.waescheGrad > 40;
    z.wut = Math.max(0, z.wut - (heiss ? 5 : 15));
    dennis.stimmung('froh');
    jingle(true);
    aktualisieren();
    await dennisSagt(sag(heiss ? DENNIS.waesche.dankeHalb : DENNIS.waesche.danke), false, { prio: 1, minMs: 4000 });
    dennis.stimmung('ruhig');
  }
  function waescheUpdate(dt) {
    for (const [d, lauf, fertig, text] of [[wm(), 'laeuft', 'gewaschen', 'Waschmaschine ist fertig! Wäsche raus und in den Trockner.'], [tr(), 'trocknet', 'trocken', 'Trockner ist fertig! Wäsche raus und zu Dennis bringen.']]) {
      if (z.waesche !== lauf) continue;
      z.waescheZeit -= dt;
      const sek = Math.max(0, Math.ceil(z.waescheZeit));
      const anzeige = `0:${String(sek).padStart(2, '0')}`;
      if (d.anzeige.letzte !== anzeige) { d.anzeige.letzte = anzeige; d.anzeige.zeig(anzeige); }
      if (z.waescheZeit <= 0) {
        z.waesche = fertig;
        d.laeuft = false;
        d.anzeige.zeig('ENDE', '#ffd23a');
        d.anzeige.letzte = '';
        blip(988, 0.15, 0.3);
        setTimeout(() => blip(988, 0.15, 0.3), 260);
        setTimeout(() => blip(1318, 0.25, 0.3), 520);
        ui.hinweis(text, 4000);
        aktualisieren();
        // zu heiß gewaschen, ohne dass Dennis es gesehen hat: merkt er beim Rausholen
        if (fertig === 'gewaschen' && z.waescheHeimlich) { z.waescheHeimlich = false; fehler('waescheHeiss'); }
      }
    }
  }


  // Einkaufen bei Lühmann: nimmt man, schreibt an, Dennis freut sich, wenn man ihm was mitbringt
  function einkaufen(art) {
    if (hand.item) { ui.hinweis(`Du hast schon ${hand.item.cfg.name} in der Hand.`); return; }
    const obj = new THREE.Group();
    if (art === 'eier') {
      obj.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.13), new THREE.MeshToonMaterial({ color: 0xb8a888 })), 0, 0, 0));
      for (let i = 0; i < 10; i++) obj.add(setze(new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshToonMaterial({ color: i % 3 ? 0xd9b48a : 0xf2ead8 })), -0.12 + (i % 5) * 0.06, 0.045, -0.03 + Math.floor(i / 5) * 0.06));
    } else {
      obj.add(setze(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.22), new THREE.MeshToonMaterial({ color: 0xe8dcb8 })), 0, 0, 0));
      for (let j = 0; j < 3; j++) obj.add(setze(new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), new THREE.MeshToonMaterial({ color: 0x8a2a1a })), -0.04 + j * 0.04, 0.03, 0, Math.PI / 2, 0, 0));
    }
    obj.userData.interaktiv = { id: art, name: art === 'eier' ? 'Landeier' : 'Mettenden', station: null };
    hand.nimm(art, obj);
    handleisteZeigen();
    const eintrag = art === 'eier' ? '10 Eier' : '3 Mettenden';
    z.angeschrieben = z.angeschrieben ? `${z.angeschrieben}, ${eintrag}` : eintrag;
    blip(660, 0.06);
    ui.hinweis(`Angeschrieben: ${eintrag}. Lühmann kennt uns.`, 3000);
  }

  // ---------- Peitsche aus dem Benz-Kofferraum: Dennis damit durch die Gegend jagen ----------
  // Ein-, zweimal ist das ein Spaß (Wut sinkt), zu oft oder zu schnell hintereinander oder wenn er eh schon sauer ist: Ärger
  async function dennisJagen() {
    if (z.jagd || dennis.modus !== 'normal' || z.aufKlo || !dennis.wurzel.visible || z.beschaeftigt || z.dennisRaeumt) { ui.hinweis('Gerade nicht.'); return; }
    const t = sekundenSeitStart();
    const zuViel = (z.jagdZahl || 0) >= 2 || t - (z.jagdZuletzt ?? -999) < 60 || z.wut >= 55;
    z.jagdZahl = (z.jagdZahl || 0) + 1;
    z.jagdZuletzt = t;
    z.jagd = true;
    peitschenKnall();
    dennis.stimmung(zuViel ? 'sauer' : 'ruhig');
    dennisSagt(sag(zuViel ? DENNIS.peitsche.zuViel : DENNIS.peitsche.flucht), zuViel, { prio: 2 });
    // Dennis schlägt Haken weg vom Spieler, man knallt hinterher
    for (let i = 0; i < 4 && !z.vorbei; i++) {
      const p = kamera.position, d = dennis.position;
      let dx = d.x - p.x, dz = d.z - p.z;
      const l = Math.hypot(dx, dz) || 1;
      dx /= l; dz /= l;
      let ziel = null;
      for (const w of [(Math.random() - 0.5) * 1.4, 0.9, -0.9, 1.6, -1.6, Math.PI]) {
        const c = Math.cos(w), sn = Math.sin(w);
        const nx = d.x + (dx * c - dz * sn) * 2.2, nz = d.z + (dx * sn + dz * c) * 2.2;
        if (welt.begehbar(nx, nz, 0.4) && !welt.hindernisse.some((h) => !h.niedrig && nx > h.xMin - 0.3 && nx < h.xMax + 0.3 && nz > h.zMin - 0.3 && nz < h.zMax + 0.3)) { ziel = { x: nx, z: nz }; break; }
      }
      if (ziel) await Promise.race([dennis.gehZu(ziel.x, ziel.z, 3.2), warte(2500)]);
      else await warte(700);
      peitschenKnall(0.6);
      if (i === 1 && !zuViel) dennisSagt(sag(DENNIS.peitsche.quieken), false, { prio: 0 });
    }
    if (zuViel) { aerger(8); await dennisSagt(sag(DENNIS.peitsche.sauer), true, { prio: 2 }); }
    else { z.wut = Math.max(0, z.wut - 6); aktualisieren(); await dennisSagt(sag(DENNIS.peitsche.lacht), false, { prio: 1 }); }
    z.jagd = false;
    dennis.stimmung('ruhig');
    dennis.heim();
  }

  // ---------- Lockencreme: Dennis cremt sich die Locken ein und beruhigt sich ----------
  async function cremeGeben() {
    const creme = hand.weg();
    handleisteZeigen();
    dennis.stimmung('froh');
    // kurz in die Haare greifen (Hand hoch), dann Creme zurück ans Waschbecken
    const zuletzt = z.cremeZuletzt ?? -999;
    z.cremeZuletzt = sekundenSeitStart();
    const genug = sekundenSeitStart() - zuletzt < 90;
    // er schmiert sie sich sichtbar in die Locken
    dennis.geste('creme', 4.5);
    await dennisSagt(sag(genug ? DENNIS.creme.schonDrin : DENNIS.creme.danke), false, { prio: 2, minMs: 3500 });
    if (!genug) {
      z.wut = Math.max(0, z.wut - 12);
      aktualisieren();
      jingle(true);
    }
    welt.cremeZurueck(creme);
    dennis.stimmung('ruhig');
  }

  // ---------- Stahlträger in der Ecke: Torbens Job ----------
  function traegerAnfassen() {
    z.traegerZuletzt = sekundenSeitStart();
    if (!dennisSiehts()) { ui.hinweis('Keinen Millimeter bewegt. Viel zu schwer.'); return; }
    dennisSagt(sag(DENNIS.traeger), true, { prio: 2 });
  }

  // ---------- Verstopftes Klo: Pömpel oben aus dem Regal holen ----------
  async function kloVerstopft() {
    z.verstopft = 'ja';
    z.verstopftSeit = sekundenSeitStart();
    welt.kloVerstopft(true);
    ui.warnung('klo', true);
    ui.hinweis('Das Klo ist verstopft! Den Pömpel oben aus dem Regal holen und im Bad aufs Klo klicken.', 4500);
    dennis.stimmung('skeptisch');
    await dennisSagt(sag(DENNIS.verstopft.hilfe), true, { prio: 1, minMs: 5000 });
    dennis.heim();
  }
  function verstopfungWeg() {
    z.verstopft = 'erledigt';
    welt.kloVerstopft(false);
    ui.warnung('klo', false);
  }
  async function poempeln() {
    if (z.verstopft !== 'ja') { ui.hinweis('Das Klo läuft. Nichts zu pömpeln.'); return; }
    const ok = await ui.haltenDialog({ titel: 'Klo frei pömpeln', text: 'Pömpel fest aufs Abflussloch drücken und kräftig pumpen. Nicht spritzen!', knopf: 'Pumpen (halten)', sekunden: 3, geraeusch: 'wasser' });
    if (!ok || z.verstopft !== 'ja') return;
    verstopfungWeg();
    const sp = await stimmeAbspielen('assets/klospuelung.mp3', 0.8);
    if (!sp) klospuelung(0.8);
    z.wut = Math.max(0, z.wut - 10);
    aktualisieren();
    jingle(true);
    dennis.stimmung('froh');
    dennisSagt(sag(DENNIS.verstopft.danke), false, { prio: 1, minMs: 4000 });
  }
  async function dennisPoempelt() {
    z.verstopft = 'dennis';
    if (!dennis.wurzel.visible) { dennis.springZu(welt.KLO.x, welt.KLO.z); dennis.sichtbar(true); }
    dennisSagt(sag(DENNIS.verstopft.selbst), true, { prio: 1 });
    await Promise.race([dennis.gehZu(welt.KLO.x, welt.KLO.z, 3.2), warte(6000)]);
    await Promise.race([dennis.gehZu(welt.KLO_DRIN.x, welt.KLO_DRIN.z, 2.4), warte(2500)]);
    dennis.sichtbar(false);
    await warte(4000);
    verstopfungWeg();
    klospuelung(0.6);
    dennis.springZu(welt.KLO_DRIN.x, welt.KLO_DRIN.z);
    dennis.sichtbar(true);
    await wutPlus({ wut: 8, name: 'Verstopftes Klo Dennis überlassen' });
    dennisSagt(sag(DENNIS.verstopft.sauer), true, { prio: 1 });
    await Promise.race([dennis.gehZu(welt.KLO.x, welt.KLO.z, 2.4), warte(2500)]);
    dennis.heim();
  }
  function haendeWaschen() {
    const ton = dauerTon('wasser', 0.5);
    setTimeout(() => ton.stopp(), 1500);
    ui.hinweis('Hände gewaschen. Dennis wäre stolz.');
  }
  async function kloSpuelen() {
    const sp = await stimmeAbspielen('assets/klospuelung.mp3', 0.8);
    if (!sp) klospuelung(0.8);
  }


  // ---------- Kommen und Gehen draußen: sichtbar über den Hof, hinter die Werkstatt, den Feldweg runter oder auf Dennis' Terrasse ----------
  const DRAUSSEN = {
    tuerInnen: { x: -0.35, z: 3.2 }, tuerAussen: { x: -0.35, z: 5.0 },
    wege: {
      // hinten: um die Werkstatt herum und hinten über die Wiese weg (Küche im Wohnhaus dahinter)
      hinten: [{ x: 0.2, z: 7.4 }, { x: 4.6, z: 7.7 }, { x: 7.6, z: 4.6 }, { x: 8.6, z: -1.0 }, { x: 8.2, z: -6.2 }, { x: 4.0, z: -9.5 }, { x: 2.0, z: -16 }],
      feldweg: [{ x: 2.0, z: 10.0 }, ...FELDWEG.slice(0, 8)],
      terrasse: [{ x: -6.2, z: 6.3 }, { x: -10.6, z: 11.0 }, { x: -14.4, z: 10.7 }, { x: -14.42, z: 9.25 }],
    },
    // Dennis' Sofa auf der Wohnwagen-Terrasse (Blick nach +z)
    sofa: { x: -14.42, z: 8.95, hoehe: 0.63, boden: 0.18 }, // boden = Holzterrasse
  };
  async function lauf(figur, punkte, tempo = 1.1) {
    for (const p of punkte) if (!(await Promise.race([figur.gehZu(p.x, p.z, tempo), warte(15000).then(() => false)]))) return false;
    return true;
  }
  function sitzt(figur, an) {
    if (figur === waldo) waldo.haltung(an ? 'sitzen' : 'handy', DRAUSSEN.sofa.hoehe, DRAUSSEN.sofa.boden);
    else figur.sitzen(an ? DRAUSSEN.sofa.hoehe : null);
  }
  // von irgendwo draußen rein in die Werkstatt
  async function reinkommen(figur, von, tempo = 1.1) {
    if (von === 'terrasse') {
      sitzt(figur, false);
      await lauf(figur, [...DRAUSSEN.wege.terrasse].reverse().slice(1), tempo);
    } else {
      const weg = [...DRAUSSEN.wege[von]].reverse();
      figur.wurzel.position.set(weg[0].x, 0, weg[0].z);
      figur.sichtbar(true);
      await lauf(figur, weg.slice(1), tempo);
    }
    await lauf(figur, [DRAUSSEN.tuerAussen, DRAUSSEN.tuerInnen], tempo);
  }
  // raus und irgendwohin; auf der Terrasse setzt man sich und chillt, sonst ist man irgendwann weg
  async function rausgehen(figur, wohin, tempo = 1.1) {
    await lauf(figur, [DRAUSSEN.tuerInnen, DRAUSSEN.tuerAussen, ...DRAUSSEN.wege[wohin]], tempo);
    if (wohin === 'terrasse') {
      const S = DRAUSSEN.sofa;
      await Promise.race([figur.gehZu(S.x, S.z, 0.8), warte(5000)]);
      figur.wurzel.rotation.y = 0;
      sitzt(figur, true);
    } else figur.sichtbar(false);
  }
  const zufallsZiel = () => ['hinten', 'feldweg', 'terrasse'][Math.floor(Math.random() * 3)];

  // ---------- Jonny: Bier, Kitzeln, Leiter abholen, Störenfried, Sodbrennen ----------
  // Jonny ist am Anfang noch nicht da, er kommt erst nach ein, zwei Minuten (beim ersten Besuch ohne Bier)
  const jz = { da: false, ersterBesuch: true, beschaeftigt: false, biere: 0, naechstesBier: 70 + Math.random() * 50, naechstesKitzeln: 110 + Math.random() * 80,
    leiterAb: 170 + Math.random() * 90, leiter: 'nie', naechstesStoeren: 90 + Math.random() * 60, stoertSeit: -1,
    // ab und zu ist Jonny draußen (Camper, Kiosk); Waldo kommt meist nur, wenn Jonny weg ist
    draussen: true, naechstesRaus: 100 + Math.random() * 80, zurueckAb: 50 + Math.random() * 50 };
  jonny.sichtbar(false);
  welt.tassenVerteilen(7);
  // Spüldienst: wechselt je Spiel (Zettel über dem Kühlschrank). Wer dran ist, nimmt auf Bitte alle Tassen vom Kühlschrank
  // mit in die Küche, dann ist wieder Platz. Jonas, David und Joel kommen dafür ab und zu kurz vorbei.
  const SPUELDIENST = { jonas: 'Jonas', david: 'David', waldo: 'Waldo', joel: 'Joel', jonny: 'Jonny' };
  const sd = { id: Object.keys(SPUELDIENST)[Math.floor(Math.random() * 5)], unterwegs: false, kumpelDa: false, kumpelAb: 90 + Math.random() * 60, tasseNeuAb: 50 + Math.random() * 40 };
  welt.setzeSpueldienst(SPUELDIENST[sd.id]);
  // Dennis ärgert sich über Jonny: Wut steigt etwas, ist aber kein Fehler des Spielers (höchstens bis 99);
  // Ausraster-Videos gibt es nur, wenn der Spieler selbst etwas ausgelöst hat (fehler/wutPlus)
  function aerger(n) {
    z.wut = Math.min(99, z.wut + n);
    z.wutMax = Math.max(z.wutMax, z.wut);
    ui.wutZeigen(z.wut, stimmungAusWut());
    ui.wutWackeln();
  }
  // Wird es ihm zu viel (Wut ab 50, gerade Ärger dazugekommen), rastet er aus (Video). Nicht, wenn er sich gerade beruhigt
  // (Wut in den letzten ~30 s gesunken), und höchstens alle 75 s.
  function vielleichtAusraster() {
    const t = sekundenSeitStart();
    if (z.vorbei || z.wut < 50 || z.wut >= 100 || t - (z.letzterAusraster ?? -999) < 75) return;
    const frueher = (z.wutVerlauf || []).find((v) => t - v.t >= 25 && t - v.t <= 40);
    if (frueher && z.wut < frueher.wut) return;
    if (z.beschaeftigt || buehneBelegt() || !hatClip('ausraster') || dennis.modus === 'schlafen' || z.aufKlo) return;
    z.letzterAusraster = t;
    nebenbeiStoppen();
    dennis.stimmung('wut');
    auftritt({ schluessel: ['ausraster'], text: sag(DENNIS.zuViel), stufe: 'voll', stimmung: 'wut', seite: true }).then(() => {
      if (!z.vorbei) dennis.stimmung(stimmungAusWut() === 'wut' ? 'sauer' : 'ruhig');
    });
  }
  const KUEHLSCHRANK_VOR = { x: -4.05, z: 2.42 };
  const BOX_VOR = { x: -4.05, z: 1.0 }; // vor der Soundbox (Box steht bei -4,66 | 1,0)
  async function jonnyBier(ueberredet) {
    if (!jz.da || jz.beschaeftigt) return;
    if (jz.ersterBesuch) { if (ueberredet) ui.jonnySagt(sag(JONNY.bierNochNicht)); return; }
    jz.beschaeftigt = true;
    jonny.rauchen(false); z.jonnyRaucht = false;
    ui.jonnySagt(sag(ueberredet ? JONNY.bierJa : JONNY.bierSelbst));
    await Promise.race([jonny.gehZu(KUEHLSCHRANK_VOR.x, KUEHLSCHRANK_VOR.z, 1.3), warte(9000)]);
    jonny.dreheZu(welt.objekte.kuehlschrank.position);
    welt.kuehlschrank(true);
    klonk(0.2);
    await warte(900);
    jonny.bier(true);
    bierAuf();
    await warte(500);
    welt.kuehlschrank(false);
    jz.biere++;
    if (dennisSiehts() && dennis.modus === 'normal') {
      aerger(3);
      dennisSagt(sag(DENNIS.jonnyBier), true, { prio: 1 });
    }
    // zum Trinken mal hier, mal da hinstellen
    const BIER_PLAETZE = [null, { x: 2.5, z: 2.55 }, { x: -1.0, z: 0.9 }, { x: -2.6, z: 1.4 }, { x: 3.4, z: -0.6 }, { x: -0.8, z: -1.6 }];
    const bp = BIER_PLAETZE[Math.floor(Math.random() * BIER_PLAETZE.length)];
    if (bp) { await Promise.race([jonny.gehZu(bp.x, bp.z, 1.1), warte(9000)]); jonny.dreheZu(kamera.position); }
    else await Promise.race([jonny.heim(), warte(9000)]);
    jonny.trinken(true);
    await warte(22000);
    jonny.trinken(false);
    jonny.bier(false);
    // leere Flasche bleibt irgendwo bei ihm liegen (Unordnung)
    const p = jonny.position;
    welt.leereFlasche(p.x + (Math.random() - 0.5) * 0.9, p.z - 0.3 - Math.random() * 0.4);
    if (bp) await Promise.race([jonny.heim(), warte(9000)]);
    jz.beschaeftigt = false;
    if (jz.biere >= 4) jonnySodbrennen();
  }
  async function jonnyRaus() {
    if (!jz.da || jz.beschaeftigt) return;
    jz.beschaeftigt = true;
    jonny.rauchen(false); z.jonnyRaucht = false;
    ui.jonnySagt(sag(JONNY.raus));
    jz.da = false;
    jz.draussen = true;
    jz.draussenOrt = zufallsZiel();
    await rausgehen(jonny, jz.draussenOrt);
    // auf der Terrasse raucht er eine
    if (jz.draussenOrt === 'terrasse') jonny.rauchen(true);
    jz.ersterBesuch = false;
    if (jz.naechstesBier === Infinity) jz.naechstesBier = sekundenSeitStart() + 40 + Math.random() * 40;
    jz.zurueckAb = sekundenSeitStart() + 70 + Math.random() * 60;
    jz.beschaeftigt = false;
  }
  async function jonnyRein() {
    if (jz.da || !jz.draussen || jz.beschaeftigt) return;
    jz.beschaeftigt = true;
    jz.draussen = false;
    jonny.rauchen(false);
    // beim ersten Mal kommt er den Feldweg hoch, später von dort, wo er gerade war
    await reinkommen(jonny, jz.draussenOrt || 'feldweg');
    jz.draussenOrt = null;
    jz.da = true;
    ui.jonnySagt(sag(jz.ersterBesuch ? JONNY.hallo : JONNY.zurueck));
    if (jz.ersterBesuch) jz.naechstesBier = Infinity;
    await Promise.race([jonny.heim(), warte(10000)]);
    besuchBringtTasse(jonny);
    jz.naechstesRaus = sekundenSeitStart() + 120 + Math.random() * 90;
    jz.beschaeftigt = false;
  }
  async function jonnySodbrennen() {
    if (!jz.da || jz.beschaeftigt) return;
    jz.beschaeftigt = true;
    ui.jonnySagt(sag(JONNY.sodbrennen), 5000);
    await warte(2500);
    // ganz selten pinkelt er vorher in den Ofen (egal wie weit der ist)
    if (Math.random() < 0.15 && !z.vorbei) {
      const o = new THREE.Vector3();
      welt.objekte.flasche.gruppe.getWorldPosition(o);
      await Promise.race([jonny.gehZu(o.x + 0.9, o.z + 0.5, 1.0), warte(12000)]);
      jonny.dreheZu(o);
      jonny.pinkeln(true);
      const ton = dauerTon('wasser', 0.25);
      await warte(1500);
      if (dennis.wurzel.visible) {
        aerger(10);
        dennis.stimmung('wut');
        dennisSagt(sag(DENNIS.jonnyPisst), true, { prio: 2, minMs: 4000 });
      }
      await warte(2500);
      ton.stopp();
      jonny.pinkeln(false);
      z.ofenAngepinkelt = true;
    }
    await rausgehen(jonny, 'feldweg', 1.0);
    jz.da = false;
    jz.draussen = false;
    jz.beschaeftigt = false;
    if (dennisSiehts() && !z.vorbei) dennisSagt(sag(DENNIS.jonnyWeg), false, { prio: 0 });
  }
  async function jonnyKitzelt() {
    if (!jz.da || jz.beschaeftigt) return;
    jz.beschaeftigt = true;
    // schleicht sich von hinten an; ist Dennis inzwischen weitergelaufen, hinterher (höchstens 3 Anläufe)
    const d = dennis.position;
    const nah = () => Math.hypot(jonny.position.x - d.x, jonny.position.z - d.z) < 0.85;
    for (let i = 0; i < 3 && !nah(); i++) {
      const r = dennis.wurzel.rotation.y;
      await Promise.race([jonny.gehZu(d.x - Math.sin(r) * 0.55, d.z - Math.cos(r) * 0.55, 1.4), warte(9000)]);
    }
    // gekitzelt wird nur direkt an Dennis
    if (nah() && dennis.modus === 'normal' && dennis.wurzel.visible && !z.vorbei) {
      jonny.dreheZu(dennis.position);
      jonny.kitzeln(true);
      ui.jonnySagt(sag(JONNY.kitzeln), 2500);
      await warte(1300);
      dennis.stimmung('sauer');
      aerger(4);
      await dennisSagt(sag(DENNIS.jonnyKitzeln), true, { prio: 2, ton: 'stimme/aergern-2.mp3' });
      jonny.kitzeln(false);
    }
    await Promise.race([jonny.heim(), warte(9000)]);
    dennis.stimmung('ruhig');
    jz.beschaeftigt = false;
  }
  async function jonnyLeiterHolen() {
    if (!jz.da || jz.beschaeftigt || jz.leiter !== 'nie') return;
    jz.beschaeftigt = true;
    jz.leiter = 'wartet';
    await Promise.race([jonny.gehZu(4.0, 0.3, 1.1), warte(10000)]);
    jonny.dreheZu(welt.objekte.leiter.position);
    ui.jonnySagt(sag(JONNY.leiterHolen), 6000);
    for (let i = 0; i < 45 && jz.leiter === 'wartet'; i++) await warte(1000);
    if (jz.leiter === 'wartet') {
      jz.leiter = 'nix';
      ui.jonnySagt(sag(JONNY.leiterNix));
      if (dennisSiehts()) setTimeout(() => dennisSagt(sag(DENNIS.leiter), true, { prio: 1 }), 2500);
    }
    await Promise.race([jonny.heim(), warte(10000)]);
    jz.beschaeftigt = false;
  }
  async function leiterRunterreichen() {
    if (jz.leiter !== 'wartet') return;
    const ok = await ui.haltenDialog({ titel: 'Leiter runterholen', text: 'Leiter von den Konsolen heben und Jonny in die Hand drücken.', knopf: 'Hochheben (halten)', sekunden: 2 });
    if (!ok || jz.leiter !== 'wartet') return;
    jz.leiter = 'weg';
    welt.objekte.leiter.visible = false;
    klonk(0.6);
    ui.jonnySagt(sag(JONNY.leiterDanke));
    z.wut = Math.max(0, z.wut - 10);
    aktualisieren();
    jingle(true);
    setTimeout(() => dennisSagt(sag(DENNIS.leiterEndlich), false, { prio: 1 }), 2500);
  }
  async function jonnyStoert() {
    if (!jz.da || jz.beschaeftigt) return;
    jz.beschaeftigt = true;
    const p = kamera.position;
    const r = steuerung.blickRichtung();
    // stellt sich seitlich neben den Spieler
    await Promise.race([jonny.gehZu(p.x + r.z * 0.8 + r.x * 0.4, p.z - r.x * 0.8 + r.z * 0.4, 1.3), warte(9000)]);
    jonny.dreheZu(p);
    // Sprüche übers Werkstück („Was schweißt du da?“, „Sieht schief aus“) erst, wenn schon geschweißt wurde
    ui.jonnySagt(sag(irgendeineNaht() ? JONNY.stoeren : JONNY.stoeren.filter((t) => !/schwei|schief/i.test(t))), 6000);
    jz.stoertSeit = sekundenSeitStart();
    for (let i = 0; i < 15 && jz.stoertSeit > 0; i++) await warte(1000);
    if (jz.stoertSeit > 0) {
      jz.stoertSeit = -1;
      ui.jonnySagt(sag(JONNY.beleidigt));
    }
    await Promise.race([jonny.heim(), warte(9000)]);
    jz.beschaeftigt = false;
  }
  async function jonnyAntworten() {
    jz.stoertSeit = -1;
    ui.jonnySagt(sag(JONNY.quatschen));
    if (dennisSiehts()) {
      await warte(1500);
      await wutPlus({ wut: 5, name: 'Mit Jonny gequatscht statt gearbeitet' });
      dennisSagt(sag(DENNIS.jonnyQuatschen), true, { prio: 2 });
    }
  }
  // ---------- Waldo: kommt zu Besuch (Handy), sitzt auf Sofa oder Trägern; einmal sucht er mit Dennis die Kackepumpe ----------
  const wz = { beschaeftigt: false, ort: null, naechsterBesuch: 60 + Math.random() * 60, bleibtBis: 0, naechsterMecker: 0,
    pumpeAb: Math.random() < 0.7 ? 220 + Math.random() * 200 : Infinity,
    // Kackepumpe: daheim (hinterm Kompressor) | weg (Waldo hat sie) | imWeg (dreckig zurück) | sauber | zurueck
    pumpe: 'daheim', pumpeZurueckAb: Infinity, pumpeSeit: 0, pumpeGemeckert: false, streit: false,
    // einmal pro Spiel: Waldo bringt seinen Akkuschrauber, der im Regen lag
    akkuAb: 150 + Math.random() * 120 };
  // hier stellt Waldo die dreckige Pumpe hin: mitten im Weg
  const PUMPE_IM_WEG = { x: -0.7, z: 0.9 };
  const WALDO_ORTE = [
    { ort: 'stehen', x: 2.6, z: 2.75, haltung: 'handy' },
    { ort: 'traeger', x: 3.2, z: 3.36, haltung: 'sitzen', hoehe: 0.57, rot: Math.PI },
    { ort: 'sofa', x: -3.58, z: 3.42, haltung: 'sitzen', hoehe: 0.52, rot: Math.PI },
    { ort: 'mitte', x: -1.2, z: -0.4, haltung: 'handy' },
  ];
  async function waldoBesuch() {
    if (waldoDa() || wz.beschaeftigt) return;
    wz.beschaeftigt = true;
    const moeglich = WALDO_ORTE.filter((o) => o.ort !== 'sofa' || (z.mittag !== 'gerade' && dennis.modus !== 'sitzen' && dennis.modus !== 'schlafen'));
    const o = moeglich[Math.floor(Math.random() * moeglich.length)];
    waldo.haltung('handy');
    await waldoKommt();
    await Promise.race([waldo.gehZu(o.x, o.z, 1.0), warte(20000)]);
    waldo.wurzel.rotation.y = o.rot ?? Math.PI * 1.1;
    waldo.haltung(o.haltung, o.hoehe);
    besuchBringtTasse(waldo);
    wz.ort = o.ort;
    wz.bleibtBis = sekundenSeitStart() + 50 + Math.random() * 40;
    wz.naechsterMecker = sekundenSeitStart() + 30;
    if (dennisSiehts() && !z.vorbei) {
      aerger(3);
      dennisSagt(sag(DENNIS.waldoBesuch), true, { prio: 1 });
    }
    wz.beschaeftigt = false;
  }
  // Segway-Parkplatz draußen links vor dem Tor (nicht am Bad, nie in der Werkstatt: das mag Dennis nicht)
  const SEGWAY_PARK = { x: -1.9, z: 6.4 };
  // Waldo ist in der Werkstatt (sichtbar und nicht draußen auf der Terrasse)
  const waldoDa = () => waldo.da && !wz.draussenOrt;
  // Waldo kommt: sitzt er noch auf Dennis' Terrasse, von dort; sonst zu Fuß von hinter der Werkstatt oder mit dem grünen Segway
  async function waldoKommt(tempo = 1.1, zuFuss = false) {
    if (wz.draussenOrt === 'terrasse') { await reinkommen(waldo, 'terrasse', tempo); wz.draussenOrt = null; return; }
    wz.draussenOrt = null;
    if (!zuFuss && Math.random() < 0.45) {
      // mit dem Segway den Feldweg hoch, vor der Werkstatt parken
      wz.segway = true;
      segway.setze(FELDWEG[7].x, FELDWEG[7].z, -Math.PI / 2);
      segway.sichtbar(true);
      segway.anker.add(waldo.wurzel);
      waldo.wurzel.position.set(0, 0, 0);
      waldo.wurzel.rotation.set(0, 0, 0);
      waldo.sichtbar(true);
      for (const p of [...FELDWEG.slice(0, 7).reverse(), { x: 2.0, z: 9.6 }, SEGWAY_PARK]) await Promise.race([segway.fahreZu(p.x, p.z, 3.2), warte(15000)]);
      dennis.wurzel.parent.attach(waldo.wurzel);
      waldo.wurzel.position.y = 0;
      waldo.wurzel.rotation.set(0, waldo.wurzel.rotation.y, 0);
      await lauf(waldo, [DRAUSSEN.tuerAussen, DRAUSSEN.tuerInnen], tempo);
      return;
    }
    await reinkommen(waldo, 'hinten', tempo);
  }
  // Waldo geht: mit dem Segway weg (wenn er damit kam), sonst irgendwohin, auch mal auf Dennis' Terrasse
  async function waldoWeg(tempo = 1.1) {
    if (wz.segway) {
      wz.segway = false;
      await lauf(waldo, [DRAUSSEN.tuerInnen, DRAUSSEN.tuerAussen], tempo);
      const S = segway.gruppe.position;
      await Promise.race([waldo.gehZu(S.x, S.z, tempo), warte(6000)]);
      segway.anker.add(waldo.wurzel);
      waldo.wurzel.position.set(0, 0, 0);
      waldo.wurzel.rotation.set(0, 0, 0);
      for (const p of [{ x: 2.0, z: 9.6 }, ...FELDWEG.slice(0, 8)]) await Promise.race([segway.fahreZu(p.x, p.z, 3.2), warte(15000)]);
      segway.sichtbar(false);
      dennis.wurzel.parent.attach(waldo.wurzel);
      waldo.sichtbar(false);
      return;
    }
    wz.draussenOrt = zufallsZiel();
    await rausgehen(waldo, wz.draussenOrt, tempo);
  }
  // vom Sofa oder von den Trägern erst nach vorne aufstehen (nicht durch die Lehne laufen)
  async function waldoAufstehen() {
    const sass = wz.ort === 'sofa' || wz.ort === 'traeger';
    waldo.haltung('handy');
    if (sass) await Promise.race([waldo.gehZu(waldo.position.x, 2.75, 0.9), warte(4000)]);
  }
  async function waldoGeht(text) {
    if (!waldoDa() || wz.beschaeftigt) return;
    wz.beschaeftigt = true;
    if (text) ui.waldoSagt(text);
    await waldoAufstehen();
    wz.ort = null;
    await waldoWeg();
    wz.naechsterBesuch = sekundenSeitStart() + 90 + Math.random() * 90;
    wz.beschaeftigt = false;
  }
  async function kackePumpe() {
    if (waldoDa() || wz.beschaeftigt) return;
    wz.beschaeftigt = true;
    wz.pumpeAb = Infinity;
    waldo.haltung('rennen');
    await waldoKommt(3.2, true);
    z.beschaeftigt = true;
    const d = dennis.position;
    await Promise.race([waldo.gehZu(d.x + 0.7, d.z + 0.5, 3.2), warte(8000)]);
    waldo.dreheZu(dennis.position);
    waldo.haltung('stehen');
    ui.waldoSagt(sag(WALDO.pumpe), 4500);
    await warte(2500);
    dennis.stimmung('sauer');
    await dennisSagt(sag(DENNIS.pumpeWo), true, { prio: 2, minMs: 3000 });
    // beide suchen hektisch: Dennis am Regal, Waldo an der Werkbank
    waldo.haltung('suchen');
    await Promise.all([Promise.race([dennis.gehZu(-3.9, -0.6, 2.6), warte(7000)]), Promise.race([waldo.gehZu(0.8, -2.2, 2.6), warte(7000)])]);
    ui.waldoSagt(sag(WALDO.pumpeNicht), 2500);
    await warte(1800);
    await dennisSagt(sag(DENNIS.pumpeGefunden), true, { prio: 2 });
    await Promise.all([Promise.race([dennis.gehZu(-3.6, -1.85, 2.6), warte(7000)]), Promise.race([waldo.gehZu(-3.7, -2.95, 2.6), warte(9000)])]);
    waldo.dreheZu(welt.objekte.kackPumpe.position);
    await warte(700);
    welt.objekte.kackPumpe.visible = false;
    waldo.pumpe(true);
    wz.pumpe = 'weg';
    wz.pumpeZurueckAb = sekundenSeitStart() + 100 + Math.random() * 60;
    klonk(0.4);
    ui.waldoSagt(sag(WALDO.pumpeDanke), 3000);
    await warte(1200);
    waldo.haltung('rennen');
    await waldoWeg(3.4);
    waldo.pumpe(false);
    z.beschaeftigt = false;
    dennis.stimmung('ruhig');
    dennisSagt(sag(DENNIS.pumpeWeg), false, { prio: 1 });
    dennis.heim();
    wz.naechsterBesuch = sekundenSeitStart() + 120 + Math.random() * 60;
    wz.beschaeftigt = false;
  }
  // Waldo bringt die Pumpe dreckig zurück und stellt sie mitten in den Weg
  async function waldoPumpeZurueck() {
    if (waldoDa() || wz.beschaeftigt) return;
    wz.beschaeftigt = true;
    wz.pumpeZurueckAb = Infinity;
    waldo.haltung('stehen');
    waldo.pumpe(true);
    await waldoKommt(1.2);
    await Promise.race([waldo.gehZu(PUMPE_IM_WEG.x + 0.35, PUMPE_IM_WEG.z + 0.35, 1.2), warte(12000)]);
    const p = welt.objekte.kackPumpe;
    welt.zurueckAnDieWand(p);
    p.position.set(PUMPE_IM_WEG.x, 0, PUMPE_IM_WEG.z);
    welt.pumpeDreckig(true);
    waldo.pumpe(false);
    klonk(0.3);
    wz.pumpe = 'imWeg';
    wz.pumpeSeit = sekundenSeitStart();
    wz.pumpeGemeckert = false;
    ui.waldoSagt(sag(WALDO.pumpeZurueck), 4000);
    ui.hinweis('Waldo hat die Kackepumpe dreckig mitten in den Weg gestellt. Im Bad abwaschen (Dusche oder Waschbecken), dann zurück hinter den Kompressor.', 6000);
    await warte(1800);
    if (dennisSiehts() && !z.vorbei) { aerger(3); dennisSagt(sag(DENNIS.pumpeIstDa), true, { prio: 1 }); }
    await waldoWeg(1.3);
    waldo.haltung('handy');
    wz.naechsterBesuch = Math.max(wz.naechsterBesuch, sekundenSeitStart() + 90);
    wz.beschaeftigt = false;
  }
  function pumpeInDerHand() { return hand.item?.id === 'kackpumpe'; }
  async function pumpeWaschen() {
    if (!welt.pumpeIstDreckig) { ui.hinweis('Die ist schon sauber. Jetzt zurück hinter den Kompressor (auf den Kompressor klicken).', 3500); return; }
    const ok = await ui.haltenDialog({ titel: 'Kackepumpe abwaschen', text: 'Gülle runterspülen und abschrubben. Luft anhalten!', knopf: 'Abspülen (halten)', sekunden: 3, geraeusch: 'wasser' });
    if (!ok || !welt.pumpeIstDreckig) return;
    welt.pumpeDreckig(false);
    if (wz.pumpe === 'imWeg') wz.pumpe = 'sauber';
    blip(700, 0.06);
    ui.hinweis('Sauber! Jetzt zurück hinter den Kompressor stellen (auf den Kompressor klicken).', 4000);
  }
  function pumpeZurueckstellen() {
    if (welt.pumpeIstDreckig) {
      if (dennisSiehts()) dennisSagt(sag(DENNIS.pumpeDreckigZurueck), true, { prio: 2 });
      else ui.hinweis('Die ist noch voller Gülle. Erst im Bad abwaschen (Dusche oder Waschbecken).', 3500);
      return;
    }
    const p = hand.weg();
    welt.zurueckAnDieWand(p);
    wz.pumpe = 'zurueck';
    klonk(0.25);
    handleisteZeigen();
    z.wut = Math.max(0, z.wut - 8);
    aktualisieren();
    jingle(true);
    dennis.stimmung('froh');
    ui.lobZeigen(sag(DENNIS.pumpeSauber));
    setTimeout(() => { if (!z.beschaeftigt) dennis.stimmung('ruhig'); }, 4000);
  }
  // keiner kümmert sich: Dennis wäscht sie selbst ab und ist sauer
  async function dennisPumpeSelbst() {
    wz.pumpe = 'dennis';
    const p = welt.objekte.kackPumpe;
    z.beschaeftigt = true;
    dennis.stimmung('sauer');
    await Promise.race([dennis.gehZu(p.position.x + 0.4, p.position.z, 1.4), warte(8000)]);
    p.visible = false;
    aerger(8);
    await dennisSagt(sag(DENNIS.pumpeSelbst), true, { prio: 2, minMs: 3000 });
    welt.pumpeDreckig(false);
    welt.zurueckAnDieWand(p);
    wz.pumpe = 'zurueck';
    z.beschaeftigt = false;
    dennis.stimmung('ruhig');
    dennis.heim();
  }
  function pumpeUpdate() {
    if (wz.pumpe !== 'imWeg' && wz.pumpe !== 'sauber') return;
    if (pumpeInDerHand() || z.vorbei) return;
    const t = sekundenSeitStart() - wz.pumpeSeit;
    const dennisFrei = dennis.modus === 'normal' && dennis.wurzel.visible && !z.aufKlo && !z.hula && !z.beschaeftigt && !buehneBelegt() && z.mittag !== 'gerade';
    if (!wz.pumpeGemeckert && t > 50 && dennisFrei && ruhig()) {
      wz.pumpeGemeckert = true;
      aerger(3);
      dennisSagt(sag(DENNIS.pumpeMecker), true, { prio: 1 });
    }
    if (t > 120 && dennisFrei) dennisPumpeSelbst();
  }
  // Mittagspause, aber Waldo sitzt auf dem Sofa: Streit, der Spieler kann schlichten
  async function sofaStreit() {
    wz.beschaeftigt = true;
    wz.streit = true;
    dennis.stimmung('sauer');
    ui.hinweis('Streit ums Sofa! Klick auf Waldo, um zu schlichten.', 5000);
    await dennisSagt(sag(DENNIS.sofaStreit), true, { prio: 2 });
    for (let runde = 0; runde < 3 && wz.streit === true; runde++) {
      ui.waldoSagt(sag(runde ? WALDO.sofaNein2 : WALDO.sofaNein), 3500);
      for (let i = 0; i < 12 && wz.streit === true; i++) await warte(300);
      if (wz.streit !== true || runde === 2) break;
      await dennisSagt(sag(DENNIS.sofaStreit2), true, { prio: 2 });
    }
    const geschlichtet = wz.streit === 'geschlichtet';
    wz.streit = false;
    wz.beschaeftigt = false;
    if (geschlichtet) {
      waldoGeht(sag(WALDO.sofaGeschlichtet));
      z.wut = Math.max(0, z.wut - 6);
      aktualisieren();
      setTimeout(() => ui.lobZeigen(sag(DENNIS.sofaDanke)), 1200);
    } else {
      aerger(8);
      dennisSagt(sag(DENNIS.sofaRauswurf), true, { prio: 2 });
      waldoGeht(sag(WALDO.sofaRaus));
    }
    await warte(2200);
  }
  // ---------- Kaffeetassen: stehen überall rum, gehören auf den Kühlschrank ----------
  function offeneTassen() { return welt.tassen.filter((t) => !t.userData.aufgeraeumt && t.parent && t.visible && hand.item?.obj !== t); }
  function tasseWegraeumen() {
    if (hand.item?.id !== 'tasse') return;
    if (welt.kuehlschrankVoll()) {
      ui.hinweis(`Der Kühlschrank ist voll. Spüldienst hat diese Woche ${SPUELDIENST[sd.id]} (Zettel über dem Kühlschrank).`, 4200);
      if (dennisSiehts() && ruhig()) dennisSagt(sag(DENNIS.tassenVoll), false, { prio: 0 });
      return;
    }
    const t = hand.weg();
    welt.tasseAufKuehlschrank(t);
    klonk(0.15);
    handleisteZeigen();
    z.wut = Math.max(0, z.wut - 2);
    aktualisieren();
    // pro Tasse ist Dennis kurz dankbar (für alle zusammen gibt es nichts extra, es kommen eh immer neue)
    if (dennisSiehts()) dennisSagt(sag(DENNIS.tasseDanke), false, { prio: 0 });
    else ui.hinweis('Tasse weggeräumt.', 1800);
  }
  // Dennis räumt selbst ein paar Tassen weg und ist genervt
  async function dennisRaeumtTassen() {
    z.dennisRaeumt = true;
    dennis.stimmung('sauer');
    dennisSagt(sag(DENNIS.tassenSelbst), true, { prio: 1 });
    const k = welt.objekte.kuehlschrank.position;
    for (let n = 0; n < 2; n++) {
      const liste = offeneTassen().filter((t) => !welt.istDraussen(t.position.x, t.position.z));
      if (!liste.length || dennis.modus !== 'normal' || z.vorbei || welt.kuehlschrankVoll()) break;
      const d = dennis.position;
      liste.sort((a, b) => Math.hypot(a.position.x - d.x, a.position.z - d.z) - Math.hypot(b.position.x - d.x, b.position.z - d.z));
      const t = liste[0];
      await Promise.race([dennis.gehZu(t.position.x + 0.35, t.position.z + 0.2, 1.4), warte(9000)]);
      if (!t.parent || t.userData.aufgeraeumt || hand.item?.obj === t) continue;
      t.visible = false;
      klonk(0.12);
      await Promise.race([dennis.gehZu(k.x + 0.6, k.z + 0.1, 1.4), warte(9000)]);
      welt.tasseAufKuehlschrank(t);
      klonk(0.15);
    }
    aerger(4);
    z.dennisRaeumt = false;
    dennis.stimmung('ruhig');
    dennis.heim();
  }
  function tassenUpdate() {
    if (z.vorbei) return;
    const t = sekundenSeitStart();
    // irgendwo taucht immer wieder eine benutzte Tasse auf: aufgeräumt ist hier nie alles
    if (t > sd.tasseNeuAb) {
      const offen = offeneTassen().length;
      sd.tasseNeuAb = t + (offen === 0 ? 12 + Math.random() * 10 : 45 + Math.random() * 45);
      if (offen < 9) welt.neueTasse();
    }
    spueldienstUpdate();
    if (z.dennisRaeumt) return;
    if (z.tassenMeckerAb === undefined) z.tassenMeckerAb = 75 + Math.random() * 40;
    if (t < z.tassenMeckerAb) return;
    const offen = offeneTassen().length;
    const dennisFrei = dennis.modus === 'normal' && dennis.wurzel.visible && !z.aufKlo && !z.hula && !z.beschaeftigt && !buehneBelegt() && z.mittag !== 'gerade' && !z.dennisFegt && !z.dennisLoescht;
    if (offen < 3 || !dennisFrei || !ruhig()) return;
    z.tassenMeckerAb = t + 80 + Math.random() * 50;
    if (weitDraussenLassen()) return;
    if (welt.kuehlschrankVoll()) { aerger(2); dennisSagt(sag(DENNIS.tassenVoll), true, { prio: 0 }); }
    else if (Math.random() < 0.5) dennisRaeumtTassen();
    else { aerger(2); dennisSagt(sag(DENNIS.tassenMecker), true, { prio: 0 }); }
  }
  // Spüldienst: geht zum Kühlschrank, nimmt alle Tassen mit (Küche im Wohnhaus hinten), Dennis freut sich
  async function spueldienstErledigen(figur, sagt) {
    if (sd.unterwegs) return false;
    sd.unterwegs = true;
    sagt();
    const k = welt.objekte.kuehlschrank.position;
    const hin = { x: k.x + 0.7, z: k.z + 0.2 };
    await Promise.race([figur.gehZu(hin.x, hin.z, 1.1), warte(12000)]);
    // nicht angekommen (unterbrochen oder sehr langsames Gerät): noch einmal, sonst direkt hinstellen
    if (Math.hypot(figur.wurzel.position.x - hin.x, figur.wurzel.position.z - hin.z) > 0.4) {
      await Promise.race([figur.gehZu(hin.x, hin.z, 1.1), warte(10000)]);
      if (Math.hypot(figur.wurzel.position.x - hin.x, figur.wurzel.position.z - hin.z) > 0.4) figur.wurzel.position.set(hin.x, 0, hin.z);
    }
    figur.dreheZu(k);
    await warte(900);
    const n = welt.tassenAbholen();
    klonk(0.12); setTimeout(() => klonk(0.1), 180); setTimeout(() => klonk(0.12), 380);
    ui.hinweis(`${SPUELDIENST[sd.id]} nimmt ${n} ${n === 1 ? 'Tasse' : 'Tassen'} mit in die Küche. Auf dem Kühlschrank ist wieder Platz.`, 3800);
    if (dennisSiehts()) {
      z.wut = Math.max(0, z.wut - 3);
      aktualisieren();
      setTimeout(() => dennisSagt(sag(DENNIS.spueldienstDanke), false, { prio: 1 }), 1400);
    }
    sd.unterwegs = false;
    return true;
  }
  async function jonnySpuelt() {
    if (jz.beschaeftigt || sd.unterwegs) return;
    jz.beschaeftigt = true;
    jz.stoertSeit = -1;
    await spueldienstErledigen(jonny, () => ui.jonnySagt(sag(JONNY.spueldienst)));
    await rausgehen(jonny, 'hinten');
    await warte(35000);
    if (!z.vorbei) { await reinkommen(jonny, 'hinten'); await Promise.race([jonny.heim(), warte(10000)]); }
    jz.beschaeftigt = false;
  }
  async function waldoSpuelt() {
    if (wz.beschaeftigt || sd.unterwegs) return;
    wz.beschaeftigt = true;
    await waldoAufstehen();
    wz.ort = null;
    await spueldienstErledigen(waldo, () => ui.waldoSagt(sag(WALDO.spueldienst)));
    await waldoWeg();
    wz.naechsterBesuch = sekundenSeitStart() + 90 + Math.random() * 90;
    wz.beschaeftigt = false;
  }
  const kumpelSagt = (text) => ui.hinweis(`${SPUELDIENST[sd.id]}: „${text}“`, 3800);
  async function kumpelSpuelt() {
    const f = kumpels.alle[sd.id];
    if (!(await spueldienstErledigen(f, () => kumpelSagt(sag(KUMPEL.spueldienst))))) return;
    await rausgehen(f, 'hinten');
    sd.kumpelDa = false;
    sd.kumpelAb = sekundenSeitStart() + 120 + Math.random() * 60;
  }
  // Jonas, David oder Joel (wer Spüldienst hat) kommt ab und zu kurz auf einen Kaffee vorbei
  function spueldienstUpdate() {
    if (!kumpels || !kumpels.alle[sd.id] || sd.kumpelDa || sd.unterwegs) return;
    const t = sekundenSeitStart();
    if (t < sd.kumpelAb) return;
    sd.kumpelAb = t + 150 + Math.random() * 90;
    kumpelBesuch();
  }
  async function kumpelBesuch() {
    const f = kumpels.alle[sd.id];
    sd.kumpelDa = true;
    await reinkommen(f, Math.random() < 0.5 ? 'hinten' : 'feldweg');
    await Promise.race([f.gehZu(-3.2, 1.7, 1.1), warte(10000)]);
    f.dreheZu(kamera.position);
    kumpelSagt(sag(KUMPEL.hallo));
    const ende = sekundenSeitStart() + 60 + Math.random() * 40;
    while (sekundenSeitStart() < ende && !z.vorbei) {
      await warte(1000);
      if (sd.unterwegs || !sd.kumpelDa) return; // Spüldienst läuft: der geht danach selbst
    }
    await rausgehen(f, Math.random() < 0.5 ? 'hinten' : 'feldweg');
    sd.kumpelDa = false;
  }
  // Jonny oder Waldo bringen ab und zu eine Tasse mit und stellen sie irgendwo ab
  function besuchBringtTasse(wer) {
    if (Math.random() > 0.4) return;
    const t = welt.neueTasse(wer.position);
    if (t && dennisSiehts() && Math.random() < 0.5) setTimeout(() => dennisSagt(sag(DENNIS.tasseMitgebracht), true, { prio: 0 }), 1500);
  }
  // Dennis läuft hin; dauert es viel zu lange (langsames Gerät), steht er danach direkt dort.
  // false nur, wenn ihn etwas anderes unterbrochen hat (neues Ziel, hinsetzen ...)
  async function dennisLaufZu(x, zz, tempo) {
    const weit = Math.hypot(dennis.position.x - x, dennis.position.z - zz);
    const ok = await Promise.race([dennis.gehZu(x, zz, tempo), warte(3000 + (weit / tempo) * 2000).then(() => 'spaet')]);
    if (ok === 'spaet') { dennis.springZu(x, zz); return true; }
    return ok;
  }
  // ---------- Dennis ruft zwischendurch selbst an (Handy am Ohr, steht still, brabbelt) ----------
  const telefonReihe = [];
  // nach dem Telefonieren wieder rein (nur wenn er noch draußen ist und nichts anderes ihn geholt hat)
  async function telefonRein() {
    if (dennis.modus === 'normal' && welt.istDraussen(dennis.position.x, dennis.position.z)) {
      for (const p of [{ x: -0.35, z: 5.0 }, { x: -0.35, z: 3.0 }]) {
        if (!(await dennisLaufZu(p.x, p.z, 1.4))) break;
      }
    }
    z.dennisDraussen = false;
    if (dennis.modus === 'normal') dennis.heim();
  }
  async function dennisTelefoniert() {
    z.telefon = true;
    // zum Telefonieren geht er raus vor die Werkstatt
    z.dennisDraussen = true;
    for (const p of [{ x: -0.35, z: 3.0 }, { x: -0.35, z: 5.0 }, { x: -1.6 + Math.random() * 2.4, z: 6.4 + Math.random() * 1.2 }]) {
      if (!(await dennisLaufZu(p.x, p.z, 1.3)) || dennis.modus !== 'normal') break;
    }
    dennis.telefon(true);
    // wählen und warten, bis jemand rangeht (ohne Piepen: die Handy-Töne klangen wie Waldos Handy)
    await warte(3500);
    if (!dennis.telefoniert || dennis.modus !== 'normal' || z.vorbei) {
      dennis.telefon(false);
      await telefonRein();
      z.telefon = false;
      z.naechstesTelefon = sekundenSeitStart() + 60;
      return;
    }
    // jedes Gespräch erst wieder, wenn alle anderen dran waren
    if (!telefonReihe.length) telefonReihe.push(...DENNIS.telefon.map((_, i) => i).sort(() => Math.random() - 0.5));
    const satz = DENNIS.telefon[telefonReihe.shift()];
    for (const zeile of satz) {
      if (!dennis.telefoniert || dennis.modus !== 'normal' || z.vorbei) break;
      await dennisSagt(zeile, false, { prio: 0, minMs: 3200 });
      await warte(900 + Math.random() * 800);
    }
    dennis.telefon(false);
    await telefonRein();
    z.telefon = false;
    z.naechstesTelefon = sekundenSeitStart() + 180 + Math.random() * 60;
  }
  function telefonUpdate() {
    const t = sekundenSeitStart();
    if (z.naechstesTelefon === undefined) z.naechstesTelefon = 120 + Math.random() * 60;
    if (z.telefon || z.vorbei || t < z.naechstesTelefon) return;
    const frei = dennis.modus === 'normal' && dennis.wurzel.visible && !dennis.geht && !z.aufKlo && !z.hula && !z.beschaeftigt && !z.dennisRaeumt
      && !buehneBelegt() && z.mittag !== 'gerade' && !z.dennisFegt && !z.dennisLoescht && z.feuer !== 'brennt' && z.leck !== 'spritzt';
    if (!frei || !ruhig()) { z.naechstesTelefon = t + 8; return; }
    dennisTelefoniert();
  }
  // Ärger, Fehler oder Wegrennen beendet das Telefonat sofort
  function telefonAuflegen() { if (dennis.telefoniert) dennis.telefon(false); }
  // ---------- Nebenaufgabe Bitsatz (muss man selbst entdecken) ----------
  async function bitsatzSortieren() {
    if (z.bitsatz === 'sortiert') return;
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await bitsatzSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.bitsatz = 'sortiert';
    welt.bitsatzOrdnen();
    z.wut = Math.max(0, z.wut - 8);
    aktualisieren();
    jingle(true);
    await lob(sag(DENNIS.bitsatzLob));
  }
  // ---------- Waldos nasser Akkuschrauber ----------
  async function waldoAkkuschrauber() {
    if (waldoDa() || wz.beschaeftigt) return;
    wz.beschaeftigt = true;
    wz.akkuAb = Infinity;
    const akku = welt.objekte.akkuschrauber;
    waldo.haltung('stehen');
    waldo.trage(akku);
    await waldoKommt(1.2);
    const d = dennis.position;
    await Promise.race([waldo.gehZu(d.x + 0.7, d.z + 0.5, 1.3), warte(14000)]);
    waldo.dreheZu(dennis.position);
    dennis.schaue(waldo.position);
    ui.waldoSagt(sag(WALDO.akkuFrage), 4500);
    await warte(2600);
    dennis.stimmung('skeptisch');
    await dennisSagt(sag(DENNIS.nichtMeineBranche), false, { prio: 2, minMs: 2200 });
    ui.waldoSagt(sag(WALDO.akkuTrotzdem), 3500);
    await Promise.race([waldo.gehZu(0.85, -2.2, 1.3), warte(14000)]);
    waldo.dreheZu(new THREE.Vector3(0.85, 0, -3));
    await warte(500);
    waldo.trage(null);
    welt.akkuAufWerkbank();
    klonk(0.3);
    z.akku = 'liegt';
    z.akkuSeit = sekundenSeitStart();
    z.akkuMecker = 0;
    aktualisieren();
    if (!z.vorbei) { aerger(5); dennis.stimmung('sauer'); dennisSagt(sag(DENNIS.akkuAufWerkbank), true, { prio: 2 }); }
    ui.hinweis('Waldos nasser Akkuschrauber liegt jetzt auf Dennis\' Werkbank. Vielleicht kriegst du ihn wieder hin?', 5000);
    await waldoWeg(1.3);
    wz.naechsterBesuch = Math.max(wz.naechsterBesuch, sekundenSeitStart() + 90);
    wz.beschaeftigt = false;
  }
  async function akkuReparieren() {
    if (z.akku !== 'liegt') return;
    steuerung.sperre(true);
    z.beschaeftigt = true;
    const e = await akkuschrauberSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.akku = 'repariert';
    welt.akkuRepariert();
    z.wut = Math.max(0, z.wut - 8);
    aktualisieren();
    jingle(true);
    await lob(sag(DENNIS.akkuLob));
  }
  function akkuUpdate() {
    if (z.akku !== 'liegt' || z.vorbei || z.akkuMecker >= 2) return;
    const t = sekundenSeitStart();
    if (t - z.akkuSeit < 60 + z.akkuMecker * 70) return;
    if (dennis.modus !== 'normal' || z.aufKlo || z.beschaeftigt || !ruhig() || !dennisSiehts()) return;
    if (weitDraussenLassen()) { z.akkuSeit += 40; return; }
    z.akkuMecker++;
    aerger(2);
    dennisSagt(sag(DENNIS.akkuMecker), true, { prio: 0 });
  }
  function waldoUpdate() {
    akkuUpdate();
    tassenUpdate();
    telefonUpdate();
    if (dennis.telefoniert && (dennis.modus !== 'normal' || z.beschaeftigt)) telefonAuflegen();
    pumpeUpdate();
    if (wz.beschaeftigt || z.vorbei) return;
    const t = sekundenSeitStart();
    const dennisFrei = dennis.modus === 'normal' && dennis.wurzel.visible && !z.aufKlo && !z.hula && !z.dennisFegt && !z.dennisLoescht && !z.beschaeftigt && !buehneBelegt() && z.feuer !== 'brennt' && z.leck !== 'spritzt';
    if (!waldoDa()) {
      if (t > wz.pumpeAb && dennisFrei) { kackePumpe(); return; }
      if (wz.pumpe === 'weg' && t > wz.pumpeZurueckAb && dennisFrei) { waldoPumpeZurueck(); return; }
      if (t > wz.akkuAb && dennisFrei && !jz.da) { waldoAkkuschrauber(); return; }
      if (t > wz.naechsterBesuch) {
        // ist Jonny da, kommt Waldo meist später (die beiden sind selten gleichzeitig hier)
        if (jz.da && Math.random() > 0.15) wz.naechsterBesuch = t + 20;
        else if (!ruhigeLage() && !z.ueberlappOk) wz.naechsterBesuch = t + 20;
        else waldoBesuch();
      }
      return;
    }
    if (t > wz.bleibtBis) { waldoGeht(sag(WALDO.tschuess)); return; }
    if (t > wz.naechsterMecker && dennisSiehts() && ruhig() && !z.beschaeftigt && dennis.modus === 'normal') {
      wz.naechsterMecker = t + 30 + Math.random() * 20;
      if (weitDraussenLassen()) return;
      aerger(2);
      dennisSagt(sag(DENNIS.waldoMecker), true, { prio: 0 });
    }
  }
  function jonnyUpdate() {
    if (z.vorbei || jz.beschaeftigt) return;
    const t = sekundenSeitStart();
    if (!jz.da) {
      // zurück, sobald Waldo weg ist (nur selten sind beide gleichzeitig da)
      if (jz.draussen && t > jz.zurueckAb) {
        if (waldoDa() && Math.random() > 0.15) jz.zurueckAb = t + 15;
        else jonnyRein();
      }
      return;
    }
    if (z.beschaeftigt) return;
    if (t > jz.naechstesRaus && !waldoDa()) { jonnyRaus(); return; }
    const dennisFrei = dennis.modus === 'normal' && dennis.wurzel.visible && !z.aufKlo && !z.hula && !z.dennisFegt && !z.dennisLoescht && !buehneBelegt();
    if (jz.leiter === 'nie' && t > jz.leiterAb) { jonnyLeiterHolen(); return; }
    if (t > jz.naechstesBier) { jz.naechstesBier = t + 70 + Math.random() * 60; jonnyBier(false); return; }
    if (dennisFrei && t > jz.naechstesKitzeln) { jz.naechstesKitzeln = t + 120 + Math.random() * 90; jonnyKitzelt(); return; }
    const st = steuerung.station();
    if ((st === 'werkbank' || st === 'schweiss') && t > jz.naechstesStoeren) { jz.naechstesStoeren = t + 100 + Math.random() * 60; jonnyStoert(); }
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
    z.beschaeftigt = true;
    steuerung.sperre(true);
    const e = await kaffeeSpiel();
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen) return;
    z.kaffeeStaerke = e.loeffel;
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
    vielleichtAusraster();
    return false;
  }

  // Kaffee weggeworfen oder fallen gelassen: Becher ist leer, man kann neuen kochen
  function kaffeeWeg() {
    z.kaffeeInHand = false;
    z.kaffeeMilch = false;
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
    // hat er gerade gegähnt, wirkt der Kaffee besser
    const muede = sekundenSeitStart() < (z.muedeBis ?? 0);
    if (muede) { z.wut = Math.max(0, z.wut - 10); z.muedeBis = 0; }
    dennis.stimmung('froh');
    jingle(true);
    aktualisieren();
    ui.lobZeigen(muede ? sag(DENNIS.kaffeeMuede) : z.kaffeesSeitKlo === 1 ? sag(DENNIS.kaffee.danke) : sag(DENNIS.kaffee.nochmal));
    dennis.stimmung('ruhig');
  }

  // Kriegt Dennis gerade mit, was man macht? (nicht beim Schlafen, nicht auf dem Klo)
  function dennisSiehts() {
    return dennis.wurzel.visible && dennis.modus !== 'schlafen' && !z.aufKlo;
  }
  // Spieler ist weit draußen (mehr als ca. 18 m von der Werkstatt): Werkstatt-Ärger kommt dann seltener (meist ausgelassen)
  function weitDraussenLassen() {
    const p = kamera.position;
    return welt.istDraussen(p.x, p.z) && Math.hypot(p.x, p.z) > 18 && Math.random() < 0.7;
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
        // er macht die Musik selbst aus und hat danach ein paar Minuten keine Lust zu tanzen
        z.keinTanzBis = sekundenSeitStart() + 180 + Math.random() * 60;
        fehler('musikPause').then(() => dennisMachtMusikAus(false));
      } else if (sekundenSeitStart() < (z.keinTanzBis || 0)) {
        // wieder an, obwohl er gerade keine Lust hat: sauer, bis er sie selbst ausmacht
        dennisMachtMusikAus(true);
      }
    } else {
      technoAus();
      welt.boxTakt(null);
    }
  }

  // Dennis geht zur Box und macht die Musik aus; nochmal=true: der Spieler hat sie wieder angemacht (meckern, Wut)
  async function dennisMachtMusikAus(nochmal) {
    if (z.musikAusGang) return;
    z.musikAusGang = true;
    if (nochmal) { aerger(5); dennisSagt(sag(DENNIS.musikWiederAn), true, { prio: 2 }); }
    else dennisSagt(sag(DENNIS.musikMachIchAus), true, { prio: 2 });
    // warten, bis er frei ist (Ausraster, Aufstehen), dann hin; solange die Musik läuft, steigt die Wut
    for (let i = 0; i < 30 && (z.beschaeftigt || dennis.modus !== 'normal' || buehneBelegt()) && z.musik && !z.vorbei; i++) {
      await warte(1000);
      if (nochmal && i % 8 === 7) aerger(3);
    }
    const B = BOX_VOR;
    if (z.musik && !z.vorbei) {
      await Promise.race([dennis.gehZu(B.x, B.z, 2.4), warte(9000)]);
      if (z.musik) { dennis.wurzel.rotation.y = -Math.PI / 2; musikUmschalten(); } // Blick zur Box (-x)
    }
    z.musikAusGang = false;
    if (!z.vorbei) await Promise.race([dennis.heim(), warte(9000)]);
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
    // Steht man selbst im Bad, wenn Dennis ankommt: zu spät, eingeschissen, sofort Rausschmiss
    if (welt.imBad(kamera.position.x, kamera.position.z) && !z.vorbei) {
      z.aufKlo = false;
      ui.pauseZeigen(false);
      z.wut = 100;
      z.wutMax = 100;
      z.fehler.push('Bad blockiert, als Dennis dringend musste');
      ui.wutZeigen(100, 'wut');
      dennis.stimmung('wut');
      await dennisSagt(sag(DENNIS.eingeschissen), true, { prio: 2, minMs: 3500 });
      z.beschaeftigt = true;
      await rausgeflogen(sag(DENNIS.eingeschissenRaus));
      return;
    }
    // durch die WC-Tür ins Bad, Tür zu (außer man steht selbst im Bad)
    await Promise.race([dennis.gehZu(welt.KLO_DRIN.x, welt.KLO_DRIN.z, 2.4), warte(2500)]);
    if (!welt.imBad(kamera.position.x, kamera.position.z) && !welt.inKloTuer(kamera.position.x, kamera.position.z)) welt.kloTuer(false);
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
    welt.kloTuer(true);
    if (!dennis.wurzel.visible) {
      dennis.springZu(welt.KLO_DRIN.x, welt.KLO_DRIN.z);
      dennis.sichtbar(true);
      await Promise.race([dennis.gehZu(welt.KLO.x, welt.KLO.z, 2.4), warte(2500)]);
    }
    z.aufKlo = false;
    // ganz viel Pech: einmal pro Spiel ist danach das Klo verstopft
    if (z.verstopft === 'nie' && Math.random() < 0.3) {
      ui.pauseZeigen(false);
      z.kaffeesSeitKlo = 0;
      await kloVerstopft();
      return;
    }
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
    if (waldoDa() && wz.ort === 'sofa') {
      dennis.schaue(waldo.position);
      await sofaStreit();
      if (z.mittag !== 'gerade') return;
    }
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
    z.letztesEreignis = sekundenSeitStart();
    z.feuer = 'brennt';
    z.feuerGrund = z.geschnitten ? 'funken' : 'kippe';
    if (z.feuerGrund === 'kippe') { jonny.rauchen(false); z.jonnyRaucht = false; z.jonnyNaechsteKippe = sekundenSeitStart() + 90; setTimeout(() => ui.jonnySagt(sag(JONNY.feuer)), 6000); }
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
    if (z.huefte === 'liegt') { z.huefte = 'erledigt'; aerger(6); setTimeout(() => dennisSagt(sag(DENNIS.huefteTrotzdem), true, { prio: 1 }), 1500); }
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
    // Mit Werkzeug in der Hand geht das nicht. Kaffee, Wäschetasche und Sieb darf man dabei halten.
    if (hand.item && !['kaffee', 'waeschetasche', 'sieb'].includes(hand.item.id)) { ui.hinweis(`Mit ${hand.item.cfg.name} in der Hand? Erst ablegen (auf eine Fläche klicken) oder fallen lassen (G), dann Dennis aufhelfen.`, 3800); return; }
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
  const AUFNEHMBAR = ['brille', 'handschuhe', 'helm', 'flex', 'edding', 'hammer', 'feuerloescher', 'besen', 'figur', 'handy', 'klemmbrett', 'hulahup', 'rohrzange', 'schlauch', 'poempel', 'creme', 'kackpumpe', 'tasse', 'maske', 'peitsche'];
  const ANZIEHBAR = ['brille', 'handschuhe', 'helm', 'maske'];
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
    else if (it.id === 'klemmbrett') { if (z.waesche === 'nie') knoepfe.push(['benutzen', 'Aufgabe übernehmen: 40-Grad-Wäsche', 'E']); }
    else if (it.id === 'sieb') knoepfe.push(['benutzen', z.sieb === 'hand' ? 'Am Kompressor ausblasen' : 'In den Trockner (Klick auf Trockner)', 'E']);
    else if (cfg.benutzen) knoepfe.push(['benutzen', cfg.benutzen, 'E']);
    if (it.id === 'flasche') knoepfe.push(['', 'Klick auf Werkbank, Schweißtisch oder Waschplatz = abstellen', '']);
    else if (it.id === 'ofen') knoepfe.push(['', 'Klick auf Dennis = abgeben, Klick auf Schweißplatz = abstellen', '']);
    else if (it.id === 'waeschetasche') knoepfe.push(['', z.waesche === 'tasche' ? 'Klick auf Waschmaschine' : z.waesche === 'nass' ? 'Klick auf Trockner' : 'Klick auf Dennis = abgeben', '']);
    else if (!cfg.nichtAblegen) knoepfe.push(['', 'Klick auf Fläche = ablegen', '']);
    if (!cfg.nichtWerfen) knoepfe.push(['werfen', 'Werfen', 'Q']);
    if (!cfg.nichtAblegen && it.id !== 'flasche' && it.id !== 'ofen') knoepfe.push(['fallen', 'Fallen lassen', 'G']);
    if (it.id === 'schlauch') knoepfe.push(['fallen', 'Zurückhängen', 'G']);
    if (it.id === 'kaffee') knoepfe.push(['fallen', 'Fallen lassen', 'G']);
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
    if (id === 'klemmbrett' && z.waesche === 'nie') ui.hinweis('Ganz unten: 40-Grad-Wäsche. E drücken = Aufgabe übernehmen, Dennis erklärt dir alles.', 4500);
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
    const namen = { brille: 'Schutzbrille aufgesetzt.', handschuhe: 'Handschuhe angezogen.', helm: 'Schweißhelm aufgesetzt.', maske: 'Atemmaske aufgesetzt.' };
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
    if (id === 'feuerloescher') return loeschStart();
    if (id === 'besen') return fegen();
    if (id === 'handy') { ui.hinweis('3 neue Nachrichten. Alle unwichtig.'); return handyReaktion(); }
    if (id === 'hulahup') { ui.hinweis('Klick auf Dennis, dann gibst du ihm den Reifen.'); return; }
    if (id === 'schlauch') return spritzen();
    if (id === 'klemmbrett') return waescheUebernehmen();
    if (id === 'creme') { ui.hinweis('Die ist für Dennis. Klick auf Dennis, dann gibst du sie ihm.'); return; }
    if (id === 'peitsche') { peitschenKnall(); return; }
    if (id === 'tasse') {
      const k = welt.objekte.kuehlschrank.position;
      if (Math.hypot(kamera.position.x - k.x, kamera.position.z - k.z) < 2.3) return tasseWegraeumen();
      ui.hinweis('Die Tassen kommen auf den Kühlschrank in der Pausenecke (auf den Kühlschrank klicken).', 3500);
      return;
    }
    if (id === 'kackpumpe') {
      const nah = (o) => Math.hypot(kamera.position.x - o.position.x, kamera.position.z - o.position.z) < 2.2;
      if (nah(welt.objekte.dusche) || nah(welt.objekte.waschbecken)) return pumpeWaschen();
      if (nah(welt.objekte.kompressor)) return pumpeZurueckstellen();
      ui.hinweis(welt.pumpeIstDreckig ? 'Ab ins Bad: in der Dusche oder am Waschbecken abwaschen.' : 'Zurück hinter den Kompressor (auf den Kompressor klicken).', 3500);
      return;
    }
    if (id === 'poempel') {
      const t = welt.objekte.toilette.position;
      if (Math.hypot(kamera.position.x - t.x, kamera.position.z - t.z) < 2.2) return poempeln();
      ui.hinweis(z.verstopft === 'ja' ? 'Ab ins Bad damit, aufs Klo klicken.' : 'Gerade ist nichts verstopft.');
      return;
    }
    if (id === 'sieb') {
      const k = welt.objekte.kompressor.position;
      if (z.sieb === 'hand' && Math.hypot(kamera.position.x - k.x, kamera.position.z - k.z) < 2.5) return siebAusblasen();
      ui.hinweis(z.sieb === 'hand' ? 'Geh zum Kompressor in der Ecke rechts neben dem Regal.' : 'Klick auf den Trockner, dann setzt du das Sieb ein.');
      return;
    }
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

  // ---------- Feuerlöscher: Pulver, solange E gedrückt ist ----------
  let loeschLauf = null;
  function loeschStart() {
    if (loeschLauf || hand.item?.id !== 'feuerloescher') return;
    loeschLauf = { ton: dauerTon('gas'), dauer: 0, feuer: 0, takt: 0, gemeckert: false };
  }
  function loeschStopp() {
    if (!loeschLauf) return;
    loeschLauf.ton.stopp();
    loeschLauf = null;
  }
  function loeschUpdate(dt) {
    if (!loeschLauf) return;
    if (hand.item?.id !== 'feuerloescher' || z.beschaeftigt || z.vorbei) { loeschStopp(); return; }
    const l = loeschLauf;
    l.dauer += dt;
    const vorne = steuerung.blickRichtung();
    const von = kamera.position.clone().add(vorne.clone().multiplyScalar(0.5));
    von.y -= 0.35;
    l.takt += dt;
    if (l.takt > 0.12) { l.takt = 0; welt.pulver(von, von.clone().add(vorne.clone().multiplyScalar(2.5))); }
    const F = welt.FEUER;
    const zumFeuer = new THREE.Vector3(F.x, 0.6, F.z).sub(kamera.position);
    if (z.feuer === 'brennt' && Math.hypot(zumFeuer.x, zumFeuer.z) < 3.4 && zumFeuer.normalize().dot(vorne) > 0.72) {
      l.feuer += dt;
      if (l.feuer > 0.9) {
        feuerAus();
        z.wut = Math.max(0, z.wut - 5);
        aktualisieren();
        dennis.stimmung('froh');
        jingle(true);
        ui.lobZeigen(sag(DENNIS.hand.loeschen));
      }
      return;
    }
    if (blickAufDennis(3.5)) { loeschStopp(); fehler('gespruehrt'); return; }
    if (l.dauer > 1.0 && !l.gemeckert && z.feuer !== 'brennt' && dennisSiehts()) { l.gemeckert = true; fehler('loescherSpielen'); }
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
    z.letztesEreignis = sekundenSeitStart();
    z.leck = 'spritzt';
    welt.leck(true);
    ui.warnung('wasser', true);
    leckTon = dauerTon('wasser', 0.35);
    ui.hinweis('Wasserrohrbruch am Waschplatz! Rohrzange von der Werkzeugwand holen!', 4000);
    dennisSagt(sag(DENNIS.leck.ruf), true, { prio: 1 });
    // nach 22 s macht Dennis es selbst (nicht, während man gerade selbst am Rohr dreht)
    const dennisMachts = () => { if (z.leck !== 'spritzt') return; if (z.rohrSpiel) setTimeout(dennisMachts, 5000); else dennisRepariert(); };
    setTimeout(dennisMachts, 22000);
  }
  function leckAus() {
    z.leck = 'dicht';
    welt.leck(false);
    ui.warnung('wasser', false);
    if (leckTon) { leckTon.stopp(); leckTon = null; }
  }
  async function reparieren() {
    if (ohneAufsicht()) return;
    z.beschaeftigt = true;
    steuerung.sperre(true);
    z.rohrSpiel = true;
    const e = await rohrSpiel();
    z.rohrSpiel = false;
    steuerung.sperre(false);
    z.beschaeftigt = false;
    if (!e || e.abgebrochen || z.leck !== 'spritzt') return;
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
    if (z.huefte === 'liegt') { z.huefte = 'erledigt'; aerger(6); setTimeout(() => dennisSagt(sag(DENNIS.huefteTrotzdem), true, { prio: 1 }), 1500); }
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
    if (id === 'kaffee') kaffeeWeg();
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
    if (it.id === 'kaffee') {
      kaffeeWeg();
      hand.fallenLassen(steuerung.blickRichtung());
      klonk(0.3);
      handleisteZeigen();
      if (dennisSiehts()) dennisSagt(sag(DENNIS.kaffee.weg), false);
      return;
    }
    if (it.cfg.nichtAblegen) { ui.hinweis(it.cfg.ablegenHinweis || 'Den bringst du besser Dennis.'); return; }
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
    ui.hinweis('Schwer! Jetzt auf die Werkbank, den Schweißtisch, den Waschplatz oder draußen auf den Boden klicken.', 3600);
  }
  async function flascheAbstellen(punkt) {
    const beine = z.naehte.beine !== null;
    let ort = punkt ? welt.flaschenOrtBei(punkt, beine) : null;
    if (ort && (irgendeineNaht() || beine) && ort !== 'schweiss') ort = null;
    if (!ort) { ui.hinweis('Da passt die Flasche nicht hin. Werkbank, Schweißtisch, Waschplatz oder draußen auf den Boden.'); return; }
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
    if (it.obj?.userData.wand && treffer.punkt && treffer.punkt.distanceTo(it.obj.userData.wand.pos) < 0.6 && (!info || info.id === it.id)) {
      const o = hand.weg();
      welt.zurueckAnDieWand(o);
      klonk(0.3);
      handleisteZeigen();
      ui.hinweis(`${it.cfg.name} hängt wieder an der Wand.`);
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
      if (it.id === 'peitsche' && ziel === 'dennis') { dennisJagen(); return true; }
      if ((it.id === 'eier' || it.id === 'mettenden') && ziel === 'dennis') {
        if (dennis.modus !== 'normal' || z.aufKlo) { ui.hinweis('Dennis hat gerade keine Hand frei.'); return true; }
        await hinZu(info, treffer.obj);
        hand.weg();
        handleisteZeigen();
        const zuOft = sekundenSeitStart() - (z.einkaufZuletzt ?? -999) < 90;
        z.einkaufZuletzt = sekundenSeitStart();
        if (!zuOft) { z.wut = Math.max(0, z.wut - 8); aktualisieren(); }
        dennisSagt(sag(it.id === 'eier' ? DENNIS.einkauf.eier : DENNIS.einkauf.mettenden), false, { prio: 2 });
        return true;
      }
      if (it.id === 'creme' && ziel === 'dennis') {
        if (dennis.modus !== 'normal' || z.aufKlo) { ui.hinweis('Dennis hat gerade keine Hand frei.'); return true; }
        await hinZu(info, treffer.obj);
        await cremeGeben();
        return true;
      }
      if (it.id === 'tasse' && ziel === 'kuehlschrank') { await hinZu(info, treffer.obj); tasseWegraeumen(); return true; }
      if (it.id === 'kackpumpe' && (ziel === 'dusche' || ziel === 'waschbecken')) { await hinZu(info, treffer.obj); await pumpeWaschen(); return true; }
      if (it.id === 'kackpumpe' && ziel === 'kompressor') { await hinZu(info, treffer.obj); pumpeZurueckstellen(); return true; }
      if (it.id === 'poempel' && ziel === 'toilette') { await hinZu(info, treffer.obj); await poempeln(); return true; }
      if (it.id === 'sieb' && ziel === 'kompressor') { await hinZu(info, treffer.obj); await siebAusblasen(); return true; }
      if (it.id === 'sieb' && ziel === 'trockner') {
        await hinZu(info, treffer.obj);
        if (z.sieb === 'sauber') siebRein();
        else siebRein(true);
        return true;
      }
      if (it.id === 'waeschetasche' && (ziel === 'waschmaschine' || ziel === 'trockner')) return false;
      if (it.id === 'waeschetasche' && ziel === 'dennis') {
        if (z.waesche !== 'zuDennis') { ui.hinweis(z.waesche === 'nass' ? 'Die ist noch nass. Erst in den Trockner.' : 'Die Wäsche muss erst gewaschen werden.'); return true; }
        if (dennis.modus !== 'normal' || z.aufKlo) { ui.hinweis('Dennis hat gerade keine Hand frei.'); return true; }
        await hinZu(info, treffer.obj);
        await waescheGeben();
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
    if (it.cfg.nichtAblegen) { ui.hinweis(it.cfg.ablegenHinweis || 'Den Kaffee bringst du Dennis.'); return true; }
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
    if (fahrten.faehrt) return;
    const k = e.key.toLowerCase();
    if (k === 'e' && !hand.item && !z.vorbei && !z.beschaeftigt && fahrten.einsteigenInDerNaehe()) return;
    if (k === 'e') handAktion(hand.item && ANZIEHBAR.includes(hand.item.id) ? 'anziehen' : 'benutzen');
    else if (k === 'q') handAktion('werfen');
    else if (k === 'g') handAktion('fallen');
  });
  window.addEventListener('keyup', (e) => { if (e.key.toLowerCase() === 'e') { spritzStopp(); loeschStopp(); } });
  window.addEventListener('blur', () => { spritzStopp(); loeschStopp(); });

  function menueFuer(id, obj = null) {
    const A = (text, symbol, tun) => ({ text, symbol, tun });
    const ausFahrten = fahrten.menue(id);
    if (ausFahrten) return ausFahrten;
    // Platzhalter-Kumpels (noch ohne Aufgabe)
    if (id.startsWith('kumpel-')) {
      const name = obj?.userData.interaktiv.name || 'Kumpel';
      if (id.slice(7) !== sd.id || !sd.kumpelDa) return [name, 'Platzhalter. Hat noch keinen Job im Spiel.', []];
      const a = [A('Quatschen', 'frage', () => kumpelSagt(sag(KUMPEL.quatschen)))];
      if (welt.tassenOben() && !sd.unterwegs) a.push(A('Bitten, die Tassen zu spülen (Spüldienst)', 'tasse', kumpelSpuelt));
      return [name, 'Hat diese Woche Spüldienst (steht auf dem Zettel über dem Kühlschrank).', a];
    }
    switch (id) {
      case 'brille':
      case 'handschuhe':
      case 'helm':
      case 'maske': {
        const namen = { brille: 'Schutzbrille', handschuhe: 'Schweißerhandschuhe', helm: 'Schweißhelm', maske: 'Atemmaske' };
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
        if (z.ort === 'draussen') {
          if (!z.ventilAuf) a.push(A('Ventil aufdrehen, Restgas ablassen', 'ventil', ventilAufdrehen));
          a.push(A('Hochheben und tragen', 'tragen', flascheHochheben));
        } else if (z.ort === 'wasch') {
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
        const info = z.ort === 'draussen' ? `Steht draußen vor der Werkstatt. ${z.ventilAuf ? 'Ventil offen, Restgas ist raus.' : 'Ventil zu. Hier darf das Gas raus.'}`
          : z.ort === 'wasch'
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
      case 'waschmaschine': {
        const a = [];
        if (z.waesche === 'tasche' && hand.item?.id === 'waeschetasche') {
          for (const g of [30, 40, 60, 90]) a.push(A(`Wäsche rein, ${g} Grad starten`, 'wasser', () => waescheStarten(g)));
        }
        if (z.waesche === 'gewaschen') a.push(A('Nasse Wäsche rausnehmen', 'hand', waescheRaus));
        const info = z.waesche === 'laeuft' ? `Läuft noch (${z.waescheGrad} Grad).` : z.waesche === 'gewaschen' ? 'Fertig gewaschen.' : z.waesche === 'tasche' ? 'Tür auf, Wäsche rein, Temperatur wählen.' : 'Steht DENNIS drauf. Mit Edding.';
        if (z.waesche === 'tasche' && hand.item?.id !== 'waeschetasche') return ['Waschmaschine', 'Hol erst die Wäschetasche.', []];
        return ['Waschmaschine', info, a];
      }
      case 'waeschetasche':
        if (z.waesche === 'nie') return ['Wäschetasche', 'Liegt oben auf dem Trockner.', [A('Runterholen', 'hand', () => dennisSagt(sag(DENNIS.waesche.selbstHolen), true, { prio: 2 }))]];
        if (z.waesche === 'tasche' && !hand.item) return ['Wäschetasche', '', [A('In die Hand nehmen', 'hand', () => { hand.nimm('waeschetasche', welt.objekte.waeschetasche); welt.objekte.waeschetasche.userData.waesche.visible = true; handleisteZeigen(); })]];
        return null;
      case 'trockner': {
        const a = [];
        // Sieb ausbauen geht immer sofort (ohne Menü), wenn die Hände frei sind und keine trockene Wäsche wartet
        if (z.sieb === 'drin' && !hand.item && z.waesche !== 'trocken') return ['Trockner', '', [A('Flusensieb ausbauen', 'hand', siebRaus)]];
        if (z.sieb === 'drin' && !hand.item) a.push(A('Flusensieb ausbauen', 'hand', siebRaus));
        if (z.waesche === 'nass' && hand.item?.id === 'waeschetasche') a.push(A('Wäsche rein, Trockner starten', 'funke', trocknerStarten));
        if (z.waesche === 'trocken') a.push(A('Trockene Wäsche rausnehmen', 'hand', trockenRaus));
        const info = z.waesche === 'trocknet' ? 'Läuft noch.' : z.sieb === 'drin' ? 'Das Flusensieb unten in der Tür ist voller Fusseln.' : z.sieb === 'eingesetzt' ? 'Flusensieb ist sauber.' : 'Das Flusensieb fehlt.';
        return ['Trockner', info, a];
      }
      case 'kompressor':
        return ['Kompressor', z.sieb === 'hand' ? 'Druckluft. Damit kriegst du das Sieb sauber.' : 'Druckluft, 8 bar. Brummt laut.', z.sieb === 'hand' && hand.item?.id === 'sieb' ? [A('Flusensieb ausblasen', 'funke', siebAusblasen)] : []];
      case 'klemmbrett':
        return ['Dennis’ Klemmbrett', 'Eine Liste in Dennis’ Handschrift.', [A('In die Hand nehmen', 'hand', () => aufnehmen('klemmbrett', welt.objekte.klemmbrett))]];
      case 'hulahup':
        return ['Hula-Hoop-Reifen', `Gehört Dennis. Sein Rekord: ${DENNIS_HULA_REKORD} Runden.`, [
          A('Dennis’ Rekord knacken (Minispiel)', 'funke', hulaRekord),
          A('In die Hand nehmen', 'hand', () => aufnehmen('hulahup', welt.objekte.hulahup)),
        ]];
      case 'kloTuer':
        if (z.aufKlo) return ['WC-Tür', 'Besetzt! Dennis ist drin.', []];
        return ['WC-Tür', '', [A(welt.kloOffen ? 'Tür zumachen' : 'Tür aufmachen', 'hand', () => {
          if (welt.kloOffen && welt.inKloTuer(kamera.position.x, kamera.position.z)) { ui.hinweis('Du stehst in der Tür. Erst ein Stück weg.'); return; }
          welt.kloTuer(!welt.kloOffen); klonk(0.3);
        })]];
      case 'toilette':
        if (z.verstopft === 'ja') return ['Toilette', 'Verstopft! Das Wasser steht bis oben. Pömpel holen (oben im Regal).', []];
        return ['Toilette', 'Riecht nach Dennis.', [A('Spülen', 'wasser', kloSpuelen)]];
      case 'dusche':
        return ['Dusche', 'Jetzt nicht. Erst wird gearbeitet.', []];
      case 'waschbecken':
        return ['Waschbecken', 'Mit Spiegel. Siehst müde aus.', [A('Hände waschen', 'wasser', haendeWaschen)]];
      case 'waldo':
        if (wz.streit === true) return ['Waldo', 'Streitet mit Dennis ums Sofa.', [A('Streit schlichten', 'hand', () => { wz.streit = 'geschlichtet'; })]];
        return ['Waldo', wz.ort ? 'Guckt aufs Handy. Im Bart hängt noch das Frühstück.' : 'Hat es eilig.', [
          A('Quatschen', 'frage', () => ui.waldoSagt(sag(WALDO.quatschen))),
          A('Auf die Krümel im Bart hinweisen', 'frage', () => ui.waldoSagt(sag(WALDO.kruemel))),
          ...(sd.id === 'waldo' && welt.tassenOben() && !wz.beschaeftigt && !sd.unterwegs ? [A('Bitten, die Tassen zu spülen (Spüldienst)', 'tasse', waldoSpuelt)] : []),
          ...(wz.beschaeftigt ? [] : [A('Sagen, dass Dennis keinen Besuch will', 'hand', () => {
            waldoGeht(sag(WALDO.rausgeschickt));
            if (dennisSiehts()) { z.wut = Math.max(0, z.wut - 4); aktualisieren(); setTimeout(() => dennisSagt(sag(DENNIS.waldoDanke), false, { prio: 1 }), 2500); }
          })]),
        ]];
      case 'jonny': {
        if (jz.stoertSeit > 0) return ['Jonny', 'Steht neben dir und will quatschen.', [A('Antworten', 'frage', jonnyAntworten), A('Ignorieren', 'hand', () => { jz.stoertSeit = -1; ui.jonnySagt(sag(JONNY.beleidigt)); })]];
        const a = [A('Quatschen', 'frage', () => ui.jonnySagt(sag(JONNY.quatschen)))];
        if (!jz.beschaeftigt) a.push(A('Zu einem Bier überreden', 'tasse', () => jonnyBier(true)));
        if (sd.id === 'jonny' && welt.tassenOben() && !jz.beschaeftigt && !sd.unterwegs) a.push(A('Bitten, die Tassen zu spülen (Spüldienst)', 'tasse', jonnySpuelt));
        if (jz.leiter === 'nie' || jz.leiter === 'nix') a.push(A('Nach der Leiter fragen', 'frage', () => {
          ui.jonnySagt(sag(JONNY.leiter));
          if (dennisSiehts()) setTimeout(() => dennisSagt(sag(DENNIS.leiter), true, { prio: 1 }), 2500);
        }));
        return ['Jonny', 'Zimmermann. Steht gern rum. Raucht gern. Trinkt gern.', a];
      }
      case 'spuelzettel':
        return ['Zettel: Spüldienst', `Spüldienst diese Woche: ${SPUELDIENST[sd.id]}. Ist der Kühlschrank voll mit Tassen, ${SPUELDIENST[sd.id]} ansprechen, wenn er da ist.`, []];
      case 'kuehlschrank':
        return ['Kühlschrank', 'Bier, Bier, Senf, Bier. Gehört Dennis. Jonny bedient sich trotzdem.', [A('Reinschauen', 'auge', () => { welt.kuehlschrank(true); setTimeout(() => welt.kuehlschrank(false), 1800); if (dennisSiehts()) dennisSagt(sag(DENNIS.kuehlschrank), false, { prio: 2 }); })]];
      case 'bitsatz':
        if (z.bitsatz === 'sortiert') return ['Bitsatz', 'Ordentlich sortiert. Jedes Bit in seinem Fach.', []];
        return ['Bitsatz', 'Total durcheinander, die Hälfte liegt neben der Kassette.', [A('Bitsatz sortieren', 'werkzeug', bitsatzSortieren)]];
      case 'akkuschrauber':
        if (z.akku === 'repariert') return ['Akkuschrauber', 'Surrt wieder. Waldo kann ihn abholen.', []];
        return ['Akkuschrauber', 'Waldos Akkuschrauber. Nass, schlammig, macht keinen Mucks mehr.', [A('Reparieren', 'werkzeug', akkuReparieren)]];
      case 'tasse':
        if (obj?.userData.aufgeraeumt) return ['Kaffeetasse', 'Steht ordentlich auf dem Kühlschrank.', []];
        return ['Kaffeetasse', 'Benutzt, mit eingetrocknetem Kaffeerest. Gehört auf den Kühlschrank.', [A('In die Hand nehmen', 'hand', () => aufnehmen('tasse', obj))]];
      case 'leereflasche':
        return ['Leere Bierflasche', 'Von Jonny. Natürlich.', [A('Wegräumen', 'hand', () => {
          welt.flascheWeg(obj);
          klonk(0.2);
          z.wut = Math.max(0, z.wut - 2);
          aktualisieren();
          ui.hinweis('Weggeräumt. Dennis nickt anerkennend.');
        })]];
      case 'leiter':
        if (jz.leiter === 'wartet') return ['Johnnys Leiter', 'Jonny steht drunter und kommt nicht ran.', [A('Leiter für Jonny runterholen', 'hand', leiterRunterreichen)]];
        return ['Johnnys Leiter', 'Alu-Leiter von einem alten Camper. Hängt hier schon ewig.', [A('Anfassen', 'hand', () => {
          z.leiterZuletzt = sekundenSeitStart();
          if (dennisSiehts()) dennisSagt(sag(DENNIS.leiter), true, { prio: 2 });
          else ui.hinweis('Hängt fest. Und ist nicht deine.');
        })]];
      case 'stromwuerfel':
        return ['Stromverteiler', 'Gelber Würfel mit Steckdosen an jeder Seite. Hängt ziemlich tief.', [A('Anstupsen', 'hand', () => {
          const w = welt.stromWuerfelBei(kamera.position.x, kamera.position.z, 3);
          if (w) welt.anstossen(w);
          klonk(0.3);
        })]];
      case 'kackpumpe':
        if (wz.pumpe === 'daheim' || wz.pumpe === 'zurueck') return ['Kackepumpe', 'Waldos Tauchpumpe für den Tank im Garten. Steht hier hinterm Kompressor.', []];
        return ['Kackepumpe', welt.pumpeIstDreckig ? 'Voller Gülle. Stinkt fürchterlich, Fliegen schwirren rum.' : 'Sauber abgewaschen. Gehört hinter den Kompressor.', [A('In die Hand nehmen', 'hand', () => aufnehmen('kackpumpe', welt.objekte.kackPumpe))]];
      case 'creme':
        return ['Lockencreme', 'Dennis’ Lockencreme. Ohne die sitzt nix.', [A('In die Hand nehmen', 'hand', () => aufnehmen('creme', welt.objekte.creme))]];
      case 'latexhose':
        return ['Latexunterhose', 'Schwarz, eng, glänzend. Hängt am Haken. Frag lieber nicht.', [A('Lieber nicht anfassen', 'hand', () => {
          if (dennisSiehts()) dennisSagt(sag(DENNIS.latexhose), false, { prio: 2 });
          else ui.hinweis('Du lässt sie lieber hängen.');
        })]];
      case 'traeger':
        return ['Stahlträger', 'HEB 200, je gut 160 kg. Liegen hier rum.', [A('Anfassen', 'hand', traegerAnfassen)]];
      case 'poempel':
        return ['Pömpel', 'Saugglocke mit Holzstiel. Für alles, was nicht abläuft.', [A('In die Hand nehmen', 'hand', () => aufnehmen('poempel', welt.objekte.poempel))]];
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
        const a = [A('Fragen, was als Nächstes dran ist', 'frage', dennisFragen),
          A('Nach der Hüfte fragen', 'frage', () => nettSein('huefte')),
          A('Zuhören (er erzählt was)', 'frage', () => nettSein('zuhoeren')),
          A('Über Lydia reden', 'frage', () => nettSein('lydia'))];
        if (alleNaehte()) a.unshift(A('Ofen abgeben', 'abgeben', abgeben));
        if (z.kaffeeInHand) a.unshift(A('Kaffee geben', 'tasse', kaffeeGeben));
        return ['Dennis', 'Dein Schweißkurslehrer.', a];
      }
      // ---------- Landschaft: Lühmanns Hof, Schilder, Briefkasten, umgekippter T5 ----------
      case 'sb_eier':
        return ['Lühmanns Landeier', 'Frische Eier vom Hof. Wir dürfen anschreiben.', [A('10 Eier nehmen und anschreiben', 'hand', () => einkaufen('eier'))]];
      case 'sb_mettenden':
        return ['Kühlschrank', 'Mettenden, geräuchert. Dennis liebt die.', [A('Mettenden nehmen und anschreiben', 'hand', () => einkaufen('mettenden'))]];
      case 'sb_liste':
        return ['Anschreibeliste', `Auf der Liste stehen schon: Dennis 10 Eier, Dennis 4 Mettenden, Waldo 2 Mettenden, Jonny 6 Eier${z.angeschrieben ? `, und von dir: ${z.angeschrieben}` : ''}.`, []];
      case 'sb_kasse':
        return ['Vertrauenskasse', 'Bezahlen müssen wir nicht, wir schreiben an. Lühmann kennt uns.', []];
      case 'kuh':
        return ['Peters Kuh', sag(['Muuuh. Guckt dich an und kaut weiter.', 'Schwarzbunt und sehr entspannt.', 'Interessiert sich nur für Gras.']), [A('Streicheln', 'hand', () => { ui.hinweis('Die Kuh schnaubt zufrieden.'); blip(160, 0.25, 0.12); })]];
      case 'huhn':
        return ['Peters Huhn', 'Pickt im Gras. Legt vermutlich Lühmanns Landeier.', []];
      case 'huehnermobil':
        return ['Hühnermobil', 'Peters grüner Hühnerstall auf Rädern. Wird alle paar Tage weitergezogen.', []];
      case 'schild_landeier':
        return ['Schild', 'Lühmanns Landeier – da lang.', []];
      case 'schild_reich':
        return ['Schild', 'DENNIS REICH – Kein Zutritt! Selbst in den Boden gehauen.', []];
      case 'schild_rad':
        return ['Schild', '(Fahrradfahrer werden geduldet)', []];
      case 'schild_privat':
        return ['Schild', 'Privatweg. Befahren auf eigene Gefahr.', []];
      case 'schild_vorsicht':
        return ['Schild', 'Vorsicht! Freilaufender Dennis.', []];
      case 'briefkasten':
        return ['Dennis’ Briefkasten', z.briefGelesen ? 'Leer. Die Werbung hast du schon rausgeholt.' : 'Das Fähnchen ist oben. Da ist Post drin.', z.briefGelesen ? [] : [A('Reingucken', 'auge', () => { z.briefGelesen = true; ui.hinweis('Drin: Werbung vom Baumarkt, eine Mahnung vom Ordnungsamt wegen der Schilder und eine Postkarte von Lydia.', 6000); })]];
      case 'vw_t5':
        return ['Umgekippter VW T5', 'Doppelkabine mit Pritsche, liegt auf der Seite. Die Reifenspuren in der Wiese erzählen den Rest. Keiner verletzt, aber der Wagen ist hin.', []];
      case 'kofferraum': {
        const k = welt.carport;
        return ['Kofferraum', k.kofferAuf ? 'Offen. Drin liegen ein Kettenhemd und eine Peitsche. Fragen wir nicht.' : 'Der Kofferraum vom Benz. Nicht abgeschlossen.',
          [A(k.kofferAuf ? 'Zumachen' : 'Aufmachen', 'hand', () => { k.kofferraum(!k.kofferAuf); klonk(0.3); })]];
      }
      case 'kettenhemd':
        if (dennisSiehts() && ruhig() && sekundenSeitStart() - (z.kettenhemdZuletzt ?? -99) > 60) { z.kettenhemdZuletzt = sekundenSeitStart(); setTimeout(() => dennisSagt(sag(DENNIS.kettenhemd), false, { prio: 0 }), 500); }
        return ['Kettenhemd', 'Ein echtes Kettenhemd. Schwer. Riecht nach Mittelaltermarkt.', []];
      case 'peitsche':
        if (!welt.carport.kofferAuf && obj?.parent === welt.carport.benz) return ['Peitsche', 'Liegt im Kofferraum. Erst aufmachen.', []];
        return ['Peitsche', 'Lange geflochtene Lederpeitsche. Was macht die in Dennis\' Kofferraum?', [A('In die Hand nehmen', 'hand', () => aufnehmen('peitsche', obj))]];
      case 'benz':
        if (dennisSiehts() && ruhig() && sekundenSeitStart() - (z.benzZuletzt ?? -99) > 40) { z.benzZuletzt = sekundenSeitStart(); aerger(1); setTimeout(() => dennisSagt(sag(DENNIS.benz), true, { prio: 0 }), 600); }
        return ['Mercedes 123', 'Dennis\' ein und alles: weißer W123. In der Motorhaube steckt eine Gehwegplatte, die Plane darüber hat ein Loch. Passiert heute Nacht um 4.', []];
      case 'wohnwagen':
        return ['Wohnwagen', 'Alter Wohnwagen unterm Carport, mit kleiner Holzterrasse und Lichterkette. Die Tür ist zu.', []];
      case 'carport':
        return ['Carport', 'Auf dem Dach liegen alte Turnmatten, beschwert mit Gehwegplatten. Damit die Eicheln nicht so laut prasseln. Eine Matte fehlt.', []];
      case 'turnmatte':
        return ['Turnmatte', 'Vom Carport-Dach geweht. Die Gehwegplatte, die drauf lag, ist jetzt im Benz.', []];
      case 'muelltonnen':
        return ['Mülltonnen', 'Restmüll, Papier, Bio. Die blaue geht nicht mehr zu.', []];
      case 'weidemann':
        return ['Hoflader', 'Roter Hoflader mit geschlossener Kabine und Palettengabel. Schlüssel steckt nicht.', []];
      case 'minijeep':
        return ['Mini-Jeep', 'Rosa Elektro-Jeep in Kindergröße. Wem der wohl gehört?', []];
      case 'feuerschale':
        return ['Feuerschale', 'Kalte graue Asche, oben auf dem Rost eine schwarze, uralte Bratwurst.', []];
      default:
        return null;
    }
  }

  async function klick(treffer) {
    if (z.vorbei) return;
    if (fahrten.faehrt) { ui.hinweis('Erst aussteigen (E).'); return; }
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
    const m = menueFuer(info.id, obj);
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
    const qs = [z.anzeichnenQ ?? 0, z.schnittQ ?? 0, ...Object.values(z.naehte).map((q) => q ?? 0), z.lackQ ?? 0];
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
        <li><span>Anzeichnen</span><b>${z.anzeichnenQ ?? 0} %</b></li>
        <li><span>Schnitt</span><b>${z.schnittQ} %</b></li>${naehte}
        <li><span>Lack</span><b>${z.lackQ ?? 0} %</b></li>
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

  async function rausgeflogen(text = DENNIS.rausgeflogen) {
    z.vorbei = true;
    dennis.stimmung('wut');
    await auftritt({ schluessel: ['rausgeflogen', 'ausraster'], text, stufe: 'voll', stimmung: 'wut' });
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

  // ---------- Wut baut sich ab, Vorzeichen (Gähnen, Hüfte, Uhr), überlappende Ereignisse ----------
  // Läuft gerade kein anderes Ereignis?
  function ruhigeLage() {
    return z.feuer !== 'brennt' && z.leck !== 'spritzt' && z.huefte !== 'liegt' && z.huefte !== 'geht' && z.huefte !== 'vorzeichen'
      && z.mittag !== 'gerade' && z.mittag !== 'vorzeichen' && !z.aufKlo && z.verstopft !== 'ja' && !waldoDa();
  }
  function wutUndVorzeichen(dt) {
    const t = sekundenSeitStart();
    // Wut sinkt von selbst: kommt 20 s lang kein neuer Ärger dazu, alle 10 s um 1 Punkt
    if (z.wut > (z.wutVorher ?? z.wut) + 0.01) z.letzterAerger = t;
    if (t - (z.letzterAerger ?? 0) > 20 && z.wut > 0) {
      if (z.abbauSeit === undefined) z.abbauSeit = t;
      if (t - z.abbauSeit >= 10) {
        z.abbauSeit = t;
        z.wut = Math.max(0, z.wut - 1);
        ui.wutZeigen(z.wut, stimmungAusWut());
      }
    } else z.abbauSeit = undefined;
    z.wutVorher = z.wut;
    if (t - (z.wutVerlaufZuletzt ?? -99) >= 5) {
      z.wutVerlaufZuletzt = t;
      (z.wutVerlauf = z.wutVerlauf || []).push({ t, wut: z.wut });
      while (z.wutVerlauf.length && t - z.wutVerlauf[0].t > 60) z.wutVerlauf.shift();
    }
    // Überlappende Ereignisse: in den ersten 4 Minuten nie, danach immer öfter (alle 20 s neu gewürfelt, höchstens 55 %)
    if (t > (z.ueberlappWurf ?? 0)) {
      z.ueberlappWurf = t + 20;
      z.ueberlappOk = t > 240 && Math.random() < Math.min(0.55, (t - 240) / 600);
    }
    const kannGeste = dennis.modus === 'normal' && dennis.wurzel.visible && !z.beschaeftigt && !dennis.telefoniert && !z.hula && !z.dennisFegt && !z.dennisLoescht;
    // Vorzeichen-Gesten: Hüfte reiben bzw. auf die Uhr schauen, alle paar Sekunden
    if ((z.huefte === 'vorzeichen' || z.mittag === 'vorzeichen') && kannGeste && t > (z.naechsteGeste ?? 0)) {
      z.naechsteGeste = t + 6;
      dennis.geste(z.huefte === 'vorzeichen' ? 'huefte' : 'uhr', 3.5);
    }
    // Gähnen: alle 100–160 s; danach 40 s lang wirkt Kaffee besser
    if (z.naechstesGaehnen === undefined) z.naechstesGaehnen = 70 + Math.random() * 40;
    if (t > z.naechstesGaehnen && kannGeste && !buehneBelegt()) {
      z.naechstesGaehnen = t + 100 + Math.random() * 60;
      z.muedeBis = t + 40;
      dennis.geste('gaehnen', 3.2);
      brummeln(2, 0, 0.6);
      if (ruhig() && Math.random() < 0.6) setTimeout(() => dennisSagt(sag(DENNIS.gaehnen), false, { prio: 0 }), 1400);
      // ein zweites Mal gähnen, wenn noch kein Kaffee kam
      setTimeout(() => { if (sekundenSeitStart() < (z.muedeBis ?? 0) && dennis.modus === 'normal') dennis.geste('gaehnen', 3); }, 18000);
    }
  }
  // Nett sein: entspannt (unter „sauer“) sinkt die Wut, gestresst wird er stinkig; nicht beliebig oft
  function nettSein(was) {
    const t = sekundenSeitStart();
    if (!dennisSiehts()) return;
    z.nett = z.nett || {};
    // Hüfte fragen, während er sie sich reibt: man kommt ihm zuvor, das Ereignis fällt aus
    if (was === 'huefte' && z.huefte === 'vorzeichen') {
      z.huefte = 'vermieden';
      z.nett.zuletzt = t; z.nett.huefte = t;
      z.wut = Math.max(0, z.wut - 8);
      aktualisieren();
      dennis.stimmung('froh');
      ui.lobZeigen(sag(DENNIS.huefteVermieden));
      setTimeout(() => dennis.stimmung('ruhig'), 4000);
      return;
    }
    // Spam: dasselbe Thema innerhalb von 60 s oder irgendwas innerhalb von 15 s nervt
    if (t - (z.nett[was] ?? -999) < 60 || t - (z.nett.zuletzt ?? -999) < 15) {
      z.nett.zuletzt = t;
      aerger(3);
      dennisSagt(sag(DENNIS.nettNerven), true, { prio: 2 });
      return;
    }
    z.nett[was] = t; z.nett.zuletzt = t;
    if (z.wut >= 40) {
      aerger(4);
      dennisSagt(sag(DENNIS.nettGestresst), true, { prio: 2 });
      return;
    }
    z.wut = Math.max(0, z.wut - 5);
    aktualisieren();
    dennisSagt(sag(DENNIS.nett[was]), false, { prio: 2, minMs: 5500 });
  }

  // ---------- Fahrzeuge: selbst fahren, Jonny/Waldo/Torben fahren rum (js/fahrten.js) ----------
  const fahrten = baueFahrten({
    fz, welt, scene: dennis.wurzel.parent, dennis, jonny, waldo, torben, steuerung, kamera, hand, z, jz, wz, sag, dennisSagt, aerger, lob,
    sekunden: sekundenSeitStart, warte,
    dennisFrei: () => dennis.modus === 'normal' && dennis.wurzel.visible && !z.aufKlo && !z.hula && !z.beschaeftigt && !buehneBelegt()
      && z.mittag !== 'gerade' && !z.dennisFegt && !z.dennisLoescht && !z.dennisRaeumt,
  });

  return {
    zustand: z,
    klick,
    test: { get z() { return z; }, dennisJagen, fahrten, nettSein, wutUndVorzeichen, ruhigeLage, bitsatzSortieren, waldoAkkuschrauber, akkuReparieren, tasseWegraeumen, dennisRaeumtTassen, sd, kumpelBesuch, jonnySpuelt, waldoSpuelt, kumpelSpuelt, dennisTelefoniert, flascheHochheben, flascheAbstellen, ventilAufdrehen, spuelen, anzeichnen, lackieren, hueftePlatt, mittagspause, kloPause, wz, waldoBesuch, kackePumpe, waldoPumpeZurueck, sofaStreit, jonnyRaus, jonnyRein, aufnehmen, pumpeWaschen, pumpeZurueckstellen, jz, jonnyBier, jonnyKitzelt, jonnyLeiterHolen, jonnyStoert, jonnySodbrennen }, // nur für Tests (Playwright)
    stationWaehlen,
    intro,
    aktualisieren,
    update(dt) {
      beobachten();
      spritzUpdate(dt);
      loeschUpdate(dt);
      if (z.vorbei) return;
      fahrten.update();
      wutUndVorzeichen(dt);
      waescheUpdate(dt);
      jonnyUpdate();
      waldoUpdate();
      // in die Nähe der Stahlträger: Dennis ruft (höchstens alle 45 s)
      const tr = welt.objekte.traeger.position;
      if (!welt.imBad(kamera.position.x, kamera.position.z) && Math.hypot(kamera.position.x - tr.x, kamera.position.z - tr.z) < 1.9 && sekundenSeitStart() - (z.traegerZuletzt ?? -99) > 45 && dennisSiehts() && !z.beschaeftigt && ruhig()) {
        z.traegerZuletzt = sekundenSeitStart();
        dennisSagt(sag(DENNIS.traeger), true, { prio: 1 });
      }
      if (z.verstopft === 'ja' && sekundenSeitStart() - z.verstopftSeit > 70 && !z.beschaeftigt && dennis.modus === 'normal' && !z.aufKlo && !z.dennisLoescht && !z.dennisFegt && !z.hula && !buehneBelegt()) dennisPoempelt();
      // Tanzen, wenn die Box läuft und Dennis Zeit hat
      const sollTanzen = z.musik && !z.musikAusGang && sekundenSeitStart() >= (z.keinTanzBis || 0) && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && dennis.istDaheim() && dennis.modus !== 'liegen';
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
      // Jonny raucht zwischendurch an der Tor-Ecke (obwohl das Schild direkt daneben hängt)
      if (z.jonnyRauchtBis === undefined) { z.jonnyRauchtBis = 0; z.jonnyNaechsteKippe = 40 + Math.random() * 40; }
      if (!z.jonnyRaucht && jz.da && !jz.beschaeftigt && sekundenSeitStart() > z.jonnyNaechsteKippe) {
        z.jonnyRaucht = true;
        z.jonnyRauchtBis = sekundenSeitStart() + 18 + Math.random() * 10;
        z.hustenAb = sekundenSeitStart() + 3 + Math.random() * 2;
        z.hustenMal = 0;
        jonny.rauchen(true);
      } else if (z.jonnyRaucht && z.hustenMal < 2 && sekundenSeitStart() > z.hustenAb && dennis.wurzel.visible && !z.aufKlo
        && dennis.modus !== 'schlafen' && dennis.modus !== 'liegen' && dennis.modus !== 'hula' && !z.vorbei) {
        // Dennis hustet extra laut und demonstrativ, weil Jonny drinnen raucht
        z.hustenMal++;
        z.hustenAb = sekundenSeitStart() + 8 + Math.random() * 5;
        husten(1.5, 3 + Math.floor(Math.random() * 2));
        dennis.stimmung('sauer');
        aerger(3);
        dennisSagt(sag(z.hustenMal === 1 ? DENNIS.husten : DENNIS.hustenNochmal), true, { prio: 1 });
      } else if (z.jonnyRaucht && sekundenSeitStart() > z.jonnyRauchtBis) {
        z.jonnyRaucht = false;
        z.jonnyNaechsteKippe = sekundenSeitStart() + 60 + Math.random() * 60;
        jonny.rauchen(false);
        // manchmal ruft Dennis rüber
        if (dennisSiehts() && ruhig() && !z.beschaeftigt && Math.random() < 0.5) dennisSagt(sag(DENNIS.jonnyRaucht), true, { prio: 0 });
      }
      // Dennis läuft gegen einen tief hängenden Stromwürfel
      if (dennis.wurzel.visible && dennis.modus !== 'liegen' && dennis.modus !== 'sitzen' && dennis.modus !== 'schlafen') {
        const w = sekundenSeitStart() > 120 ? welt.stromWuerfelBei(dennis.position.x, dennis.position.z, 0.26) : null;
        if (w && sekundenSeitStart() - (w.zuletzt ?? -99) > 6) {
          w.zuletzt = sekundenSeitStart();
          welt.anstossen(w);
          klonk(0.35);
          if (sekundenSeitStart() - (z.wuerfelSpruch ?? -99) > 60 && ruhig()) {
            z.wuerfelSpruch = sekundenSeitStart();
            dennisSagt(sag(DENNIS.stromwuerfel), true, { prio: 1 });
          }
        }
      }
      // Zwischendurch regt sich Dennis über Johnnys Leiter auf (alle 2,5–4 min, nur wenn es ruhig ist)
      if (z.leiterZuletzt === undefined) z.leiterZuletzt = sekundenSeitStart() - 60 * Math.random();
      if (jz.leiter !== 'weg' && sekundenSeitStart() - z.leiterZuletzt > 150 + (z.leiterZufall ?? 60) && dennisSiehts() && dennis.modus === 'normal' && !z.beschaeftigt && ruhig() && !buehneBelegt()) {
        z.leiterZuletzt = sekundenSeitStart();
        z.leiterZufall = Math.random() * 90;
        if (!weitDraussenLassen()) dennisSagt(sag(DENNIS.leiter), true, { prio: 0 });
      }
      // Feuer und Wasserrohrbruch nie kurz hintereinander: mindestens 90 s Abstand
      const ereignisPause = sekundenSeitStart() - (z.letztesEreignis ?? -999) > 90;
      const dennisBereit = (dennis.modus === 'normal' && z.mittag !== 'gerade') || (z.ueberlappOk && (dennis.modus === 'liegen' || z.mittag === 'gerade'));
      if (z.feuer === 'nie' && sekundenSeitStart() > z.feuerAb && (z.geschnitten || jz.da) && ereignisPause && !z.beschaeftigt && !z.aufKlo && !z.dennisFegt && dennisBereit && (ruhigeLage() || z.ueberlappOk) && !buehneBelegt()) feuerStart();
      // Wasserrohrbruch (Frost): einmal pro Spiel, irgendwann
      if (!z.leckAb) z.leckAb = 160 + Math.random() * 140;
      if (!z.leck && sekundenSeitStart() > z.leckAb && ereignisPause && !z.beschaeftigt && !z.aufKlo && z.feuer !== 'brennt' && !z.hula && dennisBereit && (ruhigeLage() || z.ueberlappOk) && !buehneBelegt()) leckStart();
      // Der Schlauch reicht nicht durch die ganze Werkstatt
      if (hand.item?.id === 'schlauch' && Math.hypot(kamera.position.x - 4.6, kamera.position.z - 1.8) > 5.2) {
        spritzStopp();
    schlauchZurueck();
        ui.hinweis(DENNIS.schlauch.zuKurz);
      }
      // Klo-Pause: einmal pro Spiel, nicht gleich am Anfang
      if (z.klo === 'nie' && !z.aufKlo && sekundenSeitStart() > 100 && (ruhigeLage() || z.ueberlappOk) && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && z.mittag !== 'gerade' && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.03) {
        kloPause();
      }
      // Mittagspause: Dennis kommt mit Brotdose rüber und isst eine Tomate (einmal pro Spiel)
      if (z.mittag === 'nie' && sekundenSeitStart() > 140 && (ruhigeLage() || z.ueberlappOk) && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !z.aufKlo && dennis.modus === 'normal' && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.03) {
        // erst ein paar Mal auf die Uhr schauen, dann Mittagspause
        z.mittag = 'vorzeichen';
        z.vorzeichenBis = sekundenSeitStart() + 20;
        z.naechsteGeste = 0;
        if (ruhig()) dennisSagt(sag(DENNIS.mittagBald), false, { prio: 0 });
      }
      if (z.mittag === 'vorzeichen' && sekundenSeitStart() > z.vorzeichenBis && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !z.aufKlo && dennis.modus === 'normal' && !buehneBelegt()) {
        z.mittag = 'nie';
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
      if (z.huefte === 'nie' && sekunden > 75 && (ruhigeLage() || z.ueberlappOk) && dennis.modus === 'normal' && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && dennis.istDaheim() && !buehneBelegt() && Math.random() < dt * 0.04) {
        // erst reibt er sich eine Weile die Hüfte: Wer jetzt nachfragt, kommt ihm zuvor
        z.huefte = 'vorzeichen';
        z.huefteVorBis = sekunden + 28;
        z.naechsteGeste = 0;
        if (ruhig()) setTimeout(() => dennisSagt(sag(DENNIS.huefteVorzeichen), true, { prio: 0 }), 1200);
      }
      if (z.huefte === 'vorzeichen' && sekunden > z.huefteVorBis && dennis.modus === 'normal' && !z.beschaeftigt && !z.dennisFegt && !z.dennisLoescht && !buehneBelegt()) {
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
