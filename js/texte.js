// Alles, was Dennis sagt. Reine Daten (auch von tools/saetze_export.mjs gelesen), keine Abhängigkeiten.
// Die Schlüssel sind die IDs für die Sprachaufnahmen in stimme/stimme.json – beim Umformulieren beibehalten.

export const DENNIS = {
  begruessung: 'Moin! Heute baust du einen Ofen aus der alten Gasflasche da drüben. Was zu tun ist, steht auf deinem Zettel. Und halt dich an meine Regeln an der Wand ...',
  klo: 'Ähm ... Moment. Geht gleich weiter. Ich muss mal ganz dringend!',
  zurueck: 'So. Wo war ich? Ach ja: Wenn du Mist baust, merk ich das. Ich merk alles.',

  fehler: {
    brille: [
      'Ohne Brille an die Flex?! Willst du blind werden? Brille auf, aber zack!',
      'Wo ist deine Brille? Ein Funke im Auge und du kannst Feierabend machen. Für immer.',
    ],
    handschuhe: [
      'Handschuhe! Die Dinger liegen da nicht zur Deko.',
      'Mit nackten Fingern? Die brauchst du noch.',
    ],
    schweissenHandschuhe: [
      'Ohne Handschuhe schweißen?! Das gibt Verbrennungen bis zum Ellenbogen! Handschuhe an!',
    ],
    gasflasche: [
      'STOPP! STOPP! STOPP! Die Flasche ist nicht gespült! Da ist noch Gas drin! Willst du die ganze Halle in die Luft jagen?!',
      'BIST DU WAHNSINNIG?! Ungespülte Gasflasche und dann die Flex dran?! Raus mit dem Ding und erst SPÜLEN!',
    ],
    helm: [
      'OHNE HELM?! Du guckst direkt in den Lichtbogen! Morgen früh denkst du, jemand hat dir Sand in die Augen gekippt! HELM RUNTER!',
      'HALT! Helm! Verblitzte Augen sind kein Spaß, das tut tagelang weh!',
    ],
    masse: [
      'Da passiert nix? Logisch. Ohne Masse kein Lichtbogen. Klemme dran!',
      'Masseklemme. MASSE. Steht sogar an der Wand.',
    ],
    stromHoch: [
      'Viel zu viel Strom! Für eine 2,5er Elektrode? Du brennst ja Löcher rein! Runter damit, so um die 80 Ampere.',
    ],
    stromNiedrig: [
      'Viel zu wenig Strom! Damit klebt die Elektrode doch dauernd fest. Dreh hoch, so um die 80 Ampere!',
    ],
    naht: [
      'Was ist das denn? Das sieht aus wie Taubenkacke. Gleichmäßig, nicht hektisch!',
      'Die Naht hält vielleicht bis zur Tür. Ruhiger führen!',
    ],
    schnitt: [
      'Schief wie ein Kuhschwanz. Die Tür musst du jetzt passend schleifen.',
      'Gerade heißt gerade. Nicht so ungefähr.',
    ],
    schlacke: [
      'Und die Schlacke? Soll ich die wegklopfen? Hammer nehmen!',
    ],
    schlackeBrille: [
      'Schlacke klopfen ohne Brille? Die Splitter fliegen dir direkt ins Auge! Brille auf!',
    ],
    kaffee: [
      'FINGER WEG VON MEINEM KAFFEE! Steht CHEF drauf. Kannst du lesen?',
      'Hast du gerade aus MEINER Tasse getrunken?!',
    ],
    kiwi: [
      'MEINE KIWIS! Die sind abgezählt! Finger weg!',
      'Schon wieder eine Kiwi?! Kauf dir deine eigenen!',
    ],
    brotdose: [
      'Ist das MEINE Brotdose?! Da ist mein Mittagessen drin! Leg die sofort zurück!',
    ],
    nerven: [
      'Guck auf deinen Zettel! Ich sag das nicht nochmal.',
      'Schon wieder du? Steht alles auf dem Zettel.',
    ],
  },

  kaffee: {
    danke: 'Oh. Für mich? ... Danke. Du darfst bleiben.',
    nochmal: 'Noch einer? Na gut. Aber dann ist Schluss.',
    genug: 'Willst du mich vergiften? Ich hab genug Kaffee, ich zitter schon!',
    nichtsInDerHand: 'Und wo ist der Kaffee?',
  },
  kiwi: {
    erste: 'Klar, nimm dir eine. Vitamine!',
    zweite: 'Noch eine? ... Na gut. Aber die sind abgezählt.',
    leer: 'Alle weg?! Das waren meine Kiwis für die ganze Woche!',
  },
  baustellenfeeling: 'Was los??',
  tomate: '*mampf* ... Mittagspause. Tomate muss sein.',
  licht: 'Hallo?! Wer hat das Licht ausgemacht? Ich seh nix!',
  musikAus: 'Ey! Das war mein Lied!',
  huefte: {
    start: 'Aaah! Meine Hüfte! Hinten links! Ich muss mich kurz hinlegen ...',
    jammern: [
      'Aua ... hinten links ... Kann mir mal einer helfen?',
      'Hallo?! Ich lieg hier immer noch!',
      'Meine Hüfte! Hilf mir doch mal hoch!',
      'Das ist das Wetter. Immer hinten links. Hilf mir mal!',
    ],
    danke: 'Danke. ... Und erzähl das keinem.',
  },
  fegen: 'Na guck. Ordnung ist das halbe Schweißen.',

  lob: [
    'Jo. Passt.',
    'Sauber. Geht doch.',
    'Na also. Da kann man nicht meckern.',
    'Hätte ich nicht besser gemacht. Fast.',
  ],
  lobSchnitt: 'Sauberer Schnitt. Respekt.',

  tipp: {
    ventil: 'Erst mal das Restgas ablassen. Ventil an der Flasche aufdrehen, die steht am Waschplatz.',
    spuelen: 'Jetzt die Flasche mit Wasser spülen. Schlauch hängt an der Wand. Ohne Spülen fasst die keiner an!',
    werkbank: 'Flasche rüber auf die Werkbank.',
    anzeichnen: 'Mit dem Speckstein die Tür anzeichnen. Liegt auf der Werkbank.',
    schneiden: 'Jetzt mit der Flex die Tür ausschneiden. Sauber auf der Linie!',
    schneidenAusruestung: 'Tür ausschneiden. Aber vorher Brille und Handschuhe aus dem Regal, klar?',
    schweissplatz: 'Ab zum Schweißplatz mit dem Ding.',
    strom: 'Schweißgerät einstellen. 2,5er Elektrode, also so 70 bis 100 Ampere.',
    schweissenMasseHelm: 'Jetzt wird geschweißt. Aber erst: Masse dran und Helm auf!',
    schweissenMasse: 'Jetzt wird geschweißt. Aber erst: Masse dran!',
    schweissenHelm: 'Jetzt wird geschweißt. Aber erst: Helm auf!',
    schweissen: 'Scharniere, Beine und Rohr anschweißen. Ruhige Hand!',
    schlacke: 'Schlacke abklopfen. Hammer liegt auf dem Tisch. Brille auf!',
    lackieren: 'Jetzt noch schwarz lackieren. Ofenlack, nicht irgendwas!',
    fertig: 'Fertig? Dann gib her, ich guck mir das an.',
  },
  nichtFertig: 'Das ist doch noch kein Ofen. Mach erst fertig!',
  nichtLackiert: 'Und lackieren? So rostet der dir doch weg. Ofenlack drauf, dann reden wir.',

  ende: {
    gut: 'Hm. Zeig mal her. ... Ja. Das ist ein Ofen. Ein richtig guter sogar. Den stell ich mir in die Werkstatt.',
    mittel: 'Na ja. Brennt bestimmt. Irgendwie. Nächstes Mal sauberer, dann wird das was.',
    schlecht: 'Was soll das sein? Ein Ofen? Das ist eine Gefahr für die Allgemeinheit. Nochmal von vorne!',
  },
  rausgeflogen: 'DAS REICHT! RAUS! Raus aus meiner Werkstatt! Komm wieder, wenn du gelernt hast, wie man sich benimmt!',
};

// Alle Sätze flach mit ID, z. B. { id: 'fehler.brille.1', text: '...' }
export function alleSaetze() {
  const liste = [];
  (function sammeln(wert, pfad) {
    if (typeof wert === 'string') liste.push({ id: pfad, text: wert });
    else if (Array.isArray(wert)) wert.forEach((t, i) => liste.push({ id: `${pfad}.${i + 1}`, text: t }));
    else for (const [k, v] of Object.entries(wert)) sammeln(v, pfad ? `${pfad}.${k}` : k);
  })(DENNIS, '');
  return liste;
}

// Text -> ID, damit zu jedem gezeigten Satz die passende Aufnahme gefunden wird
const idZuText = new Map(alleSaetze().map((s) => [s.text, s.id]));
export function satzId(text) {
  return idZuText.get(text) || null;
}
