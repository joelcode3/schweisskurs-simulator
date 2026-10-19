// Alles, was Dennis sagt. Reine Daten (auch von tools/saetze_export.mjs gelesen), keine Abhängigkeiten.
// Die Schlüssel sind die IDs für die Sprachaufnahmen in stimme/stimme.json – beim Umformulieren beibehalten.

export const DENNIS = {
  begruessung: 'Moin! Heute baust du einen Ofen aus der alten Gasflasche da drüben. Was zu tun ist, steht auf deinem Zettel. Und halt dich an meine Regeln an der Wand. Wenn du Mist baust, merk ich das. Ich merk alles.',
  klo: 'Warte kurz! Ich muss mal ganz dringend. Solange ich weg bin, wird NICHT gearbeitet. Keine Aufsicht, keine Arbeit!',
  kloZurueck: ['Ahh. Jetzt geht’s mir besser. Weitermachen!', 'So. Erleichtert. Wo waren wir?', 'Puh. Das war knapp. Weiter geht’s!'],
  kloOhneAufsicht: 'Ohne Aufsicht wird nicht gearbeitet. Warte, bis Dennis vom Klo zurück ist.',
  feuer: {
    ruf: ['FEUER!! Im Mülleimer! Wer hat da Funken reinfliegen lassen?!', 'Es brennt! Der Mülleimer brennt!', 'FEUER! Guck doch mal, wo deine Funken hinfliegen!'],
    sauer: ['Wer passt hier eigentlich auf?! Beim Flexen guckt man, wo die Funken hinfliegen!', 'Muss ich hier alles selber löschen?! Das nächste Mal machst du das!', 'Super. Jetzt riecht die ganze Werkstatt verkohlt. Aufpassen!'],
    selbst: 'Gut reagiert! Genau so.',
    duHastIhn: ['Lösch das! Du hast doch den Feuerlöscher!', 'Worauf wartest du? Draufhalten!', 'Nicht gucken, löschen!'],
    rufJohnny: ['FEUER!! Johnny, hast du schon wieder deine Kippe in den Mülleimer geschnippt?!', 'Johnny! Deine Kippe! Der Mülleimer brennt!', 'Es brennt! Das war wieder Johnny mit seiner Kippe!'],
    sauerJohnny: ['Johnny! Geraucht wird DRAUSSEN! Und du stehst daneben und guckst zu, oder was?!', 'Und du guckst nur zu, wie es brennt?! Danke auch!', 'Johnny raucht, und ich darf löschen. Toll.'],
  },
  besenInDerHand: ['Fegst du jetzt, oder hältst du den Besen nur fest?', 'Der Besen fegt nicht von alleine, weißt du?', 'Na? Willst du mit dem Besen tanzen oder fegen?'],
  hand: {
    handy: 'Handy weg! Hier wird gearbeitet, nicht gedaddelt!',
    handyWerfen: ['Na super. Display kaputt? Selber schuld.', 'Das Handy fliegt?! Na, dann ist es wenigstens weg.', 'Haha, Handy kaputt. Endlich wird gearbeitet.'],
    handyNochmal: 'Schon wieder das Handy?! Das kriegst du nach Feierabend wieder!',
    figur: ['Finger weg von meiner Skulptur! Die hat drei Wochenenden gedauert!', 'Fass meinen Holzhintern nicht an!', 'Die Skulptur bleibt, wo sie ist! Hände weg!'],
    werfen: 'Werkzeug wird nicht geworfen! Hast du sie noch alle?',
    figurWerfen: ['MEINE SKULPTUR! Bist du wahnsinnig?!', 'Wer wirft denn bitte eine Skulptur?! Das ist Kunst!', 'Meine Holzfigur! Wenn da was abgebrochen ist ...'],
    flascheWerfen: ['Wirf bloß nicht mit der Gasflasche!', 'Die Gasflasche wirft man nicht, nie!', 'Bist du irre? Doch nicht die Gasflasche!'],
    getroffen: 'AUA! Hast du mich gerade abgeworfen?! Raus hier!',
    gespruehrt: ['HÖR SOFORT AUF! Ich bin doch kein Feuer!', 'Spinnst du?! Ich bin voll mit Pulver!', 'Ich brenn doch gar nicht! AUFHÖREN!'],
    flexLaeuft: ['Mach die Flex aus, wenn du nix schneidest!', 'Flex aus! Die ist kein Spielzeug!', 'Wenn du nix schneidest, bleibt die Flex aus!'],
    flexAufDennis: ['Zeig nicht mit der laufenden Flex auf mich!', 'Flex weg von mir! Sofort!', 'Die Scheibe zeigt nicht auf Menschen! Nie!'],
    loeschen: ['Gut reagiert! Genau so.', 'Sauber gelöscht. Respekt.', 'Schnell reagiert. So muss das.'],
    loescherSpielen: ['Der Feuerlöscher ist kein Spielzeug! Den muss ich jetzt neu befüllen lassen!', 'Hör auf, mit dem Löscher rumzuspielen!', 'Der Löscher ist für Feuer, nicht für Spaß!'],
  },
  wurf: {
    kaffee: ['Mein KAFFEE! Wirfst du jetzt mit Kaffee?!', 'Der Kaffee war für MICH! Und jetzt liegt er auf dem Boden!'],
    werkzeug: ['Werkzeug wird nicht geworfen! Hast du sie noch alle?', 'Ey! Werkzeug fliegt hier nicht durch die Gegend!', 'Das ist Werkzeug, kein Wurfgeschoss!'],
    edding: ['Ey! Der Edding fliegt nicht, der malt!', 'Der Edding ist zum Anzeichnen da, nicht zum Werfen!'],
    ausruestung: ['Die Schutzausrüstung schmeißt man nicht durch die Gegend! Die brauchst du noch!', 'Schutzausrüstung wirft man nicht! Die schützt DICH!'],
    reifen: ['Mein Hula-Hoop-Reifen! Der ist fürs Training, nicht zum Werfen!', 'Ey, mein Reifen! Der ist heilig!'],
    notizen: ['Ey man, meine Notizen! Ohne die kann ich nicht leben!', 'Mein Klemmbrett! Da steht alles drauf, was ich heute noch muss!', 'Nicht meine Notizen! Wo soll ich mir denn sonst Lydia aufschreiben?!'],
    besen: ['Den Besen nimmt man zum Fegen, nicht als Speer!', 'Besen werfen? Das ist hier kein Hexentreffen!'],
    loescher: ['Den Feuerlöscher wirft man nicht! Und wenn’s dann brennt, was dann?!', 'Der Löscher fliegt nicht! Der rettet hier Leben!'],
  },
  musikPause: [
    'Ey! Ich mach Pause! Mach die Mucke aus!',
    'Geht’s noch?! Ich will hier in Ruhe liegen!',
    'Techno in meiner Mittagspause? Du hast sie doch nicht mehr alle!',
  ],
  schlauch: {
    nass: ['EY! Spinnst du?! Jetzt bin ich nass!', 'Hör auf mich nasszuspritzen! Sofort!', 'Ich hab schon geduscht, danke!'],
    rumspritzen: ['Hör auf hier rumzuspritzen! Das ist eine Werkstatt, kein Freibad!', 'Wasser ist zum Spülen da, nicht zum Spielen!', 'Jetzt ist alles nass. Super gemacht.'],
    zuKurz: 'Der Schlauch reicht nicht weiter. Er ist wieder an der Wand.',
  },
  leck: {
    ruf: ['Wasserrohrbruch! Am Waschplatz! Schnell, die Rohrzange!', 'Das Rohr ist geplatzt! Frost! Rohrzange holen, zack!', 'Wasser! Überall Wasser! Hol die Rohrzange von der Wand!'],
    duHastSie: ['Du hast doch die Rohrzange! Mach das Rohr dicht!', 'Na los, Rohrzange ansetzen!'],
    stinkig: ['Muss ich hier wirklich ALLES selber machen?! Jetzt ist alles nass!', 'Super. Ich steh im Wasser, und du guckst zu. Danke!', 'Nächstes Mal holst du die Rohrzange, klar?!'],
    gut: ['Dicht! Gut gemacht, Klempner.', 'Sauber abgedichtet. Respekt.', 'Rohr dicht. Du kannst ja doch was.'],
  },
  dreck: {
    meckern: ['Fegst du das noch weg, oder soll das da liegen bleiben?', 'Guck mal auf den Boden. Fällt dir was auf?', 'Der Dreck fegt sich nicht von alleine weg!'],
    selbst: ['Muss ich hier alles selber fegen?! Unglaublich!', 'Ich fege jetzt. Und das merk ich mir!', 'Super. Der Chef fegt. Wie immer.'],
  },
  hula: {
    gebrochen: ['WAS?! Mehr als 47?! ... Das zählt nicht, ich hatte heute Hüfte!', 'Das gibt’s nicht! Neuer Rekord?! Nochmal, ich will das sehen!', 'Mehr als ich?! ... Ich war heute nicht in Form.'],
    knapp: ['Nicht schlecht. Aber an meine 47 kommst du nicht ran.', 'Schon ganz ordentlich. Aber 47 ist 47.', 'Gar nicht übel. Üb noch ein bisschen.'],
    schwach: ['Pff. Mein Rekord sind 47 Runden. Üben!', 'Das war ja gar nix. 47, mein Freund. 47!', 'Hüfte locker lassen! So wird das nix.'],
  },
  geweckt: ['Hä? Was is’n?! Ich hab Pause!', 'Ey! Ich hab gerade so schön geträumt!', 'Lass mich schlafen! Mittagspause ist heilig!'],

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
    danke: ['Danke, den hab ich jetzt gebraucht.', 'Ahh, Kaffee. Du bist ein Guter.', 'Schwarz, wie es sich gehört. Danke!'],
    nochmal: ['Noch einer? Na gut. Aber dann ist Schluss.', 'Noch ein Kaffee? Du willst mich wohl einschleimen.', 'Na gut, einer geht noch.'],
    genug: 'Drei Kaffee?! Oh nein ... ich muss SOFORT aufs Klo!',
    milch: 'Ist da Milch drin? GIFT!!',
    nichtsInDerHand: 'Und wo ist der Kaffee?',
    weg: ['Lässt du meinen Kaffee einfach fallen?!', 'Schade um den guten Kaffee.'],
  },
  kiwi: {
    erste: 'Klar, nimm dir eine. Vitamine!',
    zweite: 'Noch eine? ... Na gut. Aber die sind abgezählt.',
    leer: 'Alle weg?! Das waren meine Kiwis für die ganze Woche!',
  },
  baustellenfeeling: 'Was los??',
  tomate: 'Mittagspause! Brotdose, Tomaten, Bananen ... *mampf*',
  licht: ['Hallo?! Wer hat das Licht ausgemacht? Ich seh nix!', 'LICHT AN! Hier wird geschweißt, nicht gekuschelt!', 'Ey! Ich seh meine eigene Hand nicht mehr!'],
  huefte: {
    start: ['Aaah! Meine Hüfte! Hinten links! Ich muss mich kurz hinlegen ...', 'Uff, die Hüfte! Hinten links schon wieder ...', 'Autsch! Hüfte! Ich muss mal kurz auf den Boden ...'],
    jammern: [
      'Aua ... hinten links ... Kann mir mal einer helfen?',
      'Hallo?! Ich lieg hier immer noch!',
      'Meine Hüfte! Hilf mir doch mal hoch!',
      'Das ist das Wetter. Immer hinten links. Hilf mir mal!',
    ],
    danke: ['Danke dir! Ohne dich läg ich da noch. Und erzähl das keinem.', 'Puh, danke. Das bleibt unter uns, klar?', 'Danke! Du hast was gut bei mir. Ein bisschen.'],
  },
  fegen: ['Na guck. Ordnung ist das halbe Schweißen.', 'Sauber! So sieht eine Werkstatt aus.', 'Geht doch. Besen ist dein Freund.'],

  lob: [
    'Gute Arbeit.',
    'Jo. Passt.',
    'Sauber. Geht doch.',
    'Na also. Da kann man nicht meckern.',
    'Hätte ich nicht besser gemacht. Fast.',
  ],
  lobSchnitt: ['Sauberer Schnitt. Respekt.', 'Schnurgerade. Da kann man nicht meckern.', 'Der Schnitt sitzt. Gut gemacht.'],

  tipp: {
    ventil: 'Erst mal das Restgas ablassen. Ventil an der Flasche aufdrehen, die steht am Waschplatz.',
    spuelen: 'Jetzt die Flasche mit Wasser spülen. Schlauch hängt an der Wand. Ohne Spülen fasst die keiner an!',
    werkbank: 'Flasche rüber auf die Werkbank.',
    anzeichnen: 'Mit dem blauen Edding die Tür anzeichnen. Liegt auf der Werkbank.',
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
  nichtFertig: ['Das ist doch noch kein Ofen. Mach erst fertig!', 'Fertig? Da fehlt ja noch die Hälfte!', 'Nee nee. Erst alles anschweißen, dann reden wir.'],
  waesche: {
    anleitung: [
      'Ach, du machst meine Wäsche? Super! Hier, die blaue Tasche.',
      'Die Waschmaschine steht im Bad, hinter der WC-Tür. 40 Grad! Nicht mehr, sonst passt mir nix mehr.',
      'Wenn sie fertig ist, kommt alles in den Trockner obendrauf. Aber vorher das Flusensieb rausziehen, das ist immer dicht.',
      'Das Sieb am Kompressor mit Druckluft ausblasen, wieder rein, dann Trockner an. Und dann bringst du mir die Wäsche.',
    ],
    heiss: ['Wie heiß?! Meine Hoodies sind jetzt Kindergröße!', 'Hab ich nicht 40 Grad gesagt?! Das läuft doch alles ein!'],
    kalt: ['30 Grad? Das wird doch nicht sauber. Na ja, besser als zu heiß.'],
    sieb: ['Halt! Erst das Flusensieb sauber machen! Sonst fängt der Trockner Feuer!', 'Flusensieb! Raus damit und ausblasen, sonst brennt die Bude!'],
    danke: ['Ah, frische Wäsche! Riecht ja wie neu. Danke dir, echt.', 'Trocken und warm! Du bist ein Schatz. Das vergess ich dir nicht.'],
    dankeHalb: ['Danke. Auch wenn mein Hoodie jetzt kneift.'],
  },
  stromwuerfel: ['Aua! Man, wer hängt die Scheißdinger immer so tief?!', 'AU! Schon wieder dieser Würfel! Wer hat den so tief gehängt?!', 'Mein Kopf! Irgendwann reiß ich die Dinger ab!', 'Wer hängt denn Steckdosen auf Kopfhöhe?! Ehrlich!'],
  creme: {
    danke: ['Ah, meine Lockencreme! Du verstehst mich. Jetzt sitzt die Frisur wieder.', 'Locken-Notfall gelöst. Danke! Jetzt bin ich gleich viel entspannter.', 'Ein bisschen Creme in die Locken ... ahh. Besser.'],
    schonDrin: ['Danke, aber ich hab grad erst gecremt. Sonst fettet das.', 'Nee, lass mal, zu viel Creme ist auch nicht gut für die Locken.'],
  },
  latexhose: ['Finger weg! Die ist ... zum Trocknen da.', 'Was guckst du so? Die hängt da nur zum Trocknen!', 'Die gehört Torben. Glaub ich.'],
  eingeschissen: ['RAUS DA! RAUS! Ich muss ... oh nein. OH NEIN. Zu spät. ZU SPÄT!!', 'Was machst du im Bad?! Ich muss DRINGEND ... ach du Scheiße. Wortwörtlich.', 'Ich hab doch gesagt, ich muss! Jetzt ist es passiert! Die ganze Hose!'],
  eingeschissenRaus: ['Ich hab mir wegen dir in die Hose geschissen! In MEINE kurze Hose! RAUS! Und komm nie wieder!', 'Eingeschissen! Wegen DIR! Das wars, du fliegst! Pack deine Sachen!'],
  leiter: ['Hängt die Leiter von Johnny immer noch da?! Der soll die endlich abholen!', 'Johnny! Deine Camper-Leiter! Seit Monaten hängt die hier rum!', 'Ich schmeiß die Leiter bald auf den Schrott. Johnny holt die ja eh nie ab.', 'Wer braucht denn eine Leiter für einen Camper, den es gar nicht mehr gibt? Johnny!'],
  waldoKruemel: ['Waldo! Du krümelst mir die ganze Werkstatt voll!', 'Waldo, isst du schon wieder? Wir haben grad erst Mittag gemacht!', 'Waldo, du hast da was im Bart. Also ... eigentlich alles.'],
  jonnyRaucht: ['Jonny! Da hängt ein Rauchen-verboten-Schild! Direkt neben dir!', 'Jonny, mach die Kippe aus! Hier steht Gas rum!', 'Und die Kippe NICHT in den Mülleimer, Jonny!'],
  traeger: ['Halt! Nicht anfassen! Schwere Stahlträger sind Torbens Job!', 'Finger weg von den Trägern! Das macht Torben.', 'Die Träger lässt du liegen. Das ist Torbens Job, nicht deiner!'],
  verstopft: {
    hilfe: ['Oh oh. Das Klo ist verstopft. Hilf mir mal! Der Pömpel steht oben auf dem Regal.', 'Mist, Klo ist dicht! Hol mal den Pömpel, oben im Regal. Ich geh da nicht nochmal rein.'],
    danke: ['Läuft wieder! Danke, du bist ein Held.', 'Respekt. Das macht nicht jeder. Danke!'],
    selbst: ['Na super. Dann mach ich das halt selbst.', 'Keiner hilft mir. Dann pömpel ich eben selber.'],
    sauer: ['Nächstes Mal holst du den Pömpel, klar?!', 'Das war ekelhaft. Und du hast nur zugeguckt!'],
  },
  ofenBringen: ['Schön! Dann bring ihn mal her, ich will ihn in die Hand nehmen.', 'Na dann her damit! Hochheben und zu mir bringen.', 'Bring ihn rüber, dann gucken wir.'],
  nichtLackiert: ['Und lackieren? So rostet der dir doch weg. Ofenlack drauf, dann reden wir.', 'Ohne Lack nehm ich den nicht. Schwarz muss er sein!', 'Lackieren fehlt noch. Ofenlack, mattschwarz!'],

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

// Jonny (Zimmermann, Kumpel von Dennis)
export const JONNY = {
  quatschen: ['Na, Schweißer? Läuft bei dir?', 'Ich bin nur kurz hier. Seit drei Stunden.', 'Holz ist ehrlicher als Stahl. Sag ich nur.', 'Hast du mal Feuer? Nee, war Spaß. Hab selbst.', 'Dennis ist heute wieder voll in seinem Element, oder?'],
  leiter: ['Die Leiter? Die hol ich nächste Woche. Ganz sicher.', 'Welche Leiter? Ach DIE. Ja, irgendwann.', 'Der Camper ist weg, aber die Leiter ist noch gut. Die bleibt hier.'],
  feuer: ['Upsi. War ich das?', 'Die Kippe war doch aus! Glaub ich.'],
};

// Waldo (Kumpel, isst eigentlich immer)
export const WALDO = {
  quatschen: ['Mmh. Willst du auch was? Nee, ist meins.', 'Ich hab Hunger. Ich hab immer Hunger.', 'Feine Sahne live, das war so gut. Warst du dabei?', 'Schweißen macht hungrig. Auch vom Zugucken.'],
  kruemel: ['Was? Wo? ... Ach, das spar ich mir für später.', 'Das ist kein Krümel, das ist Vorrat.', 'Lass mal, der Bart isst mit.'],
  antwort: ['Ich krümel doch gar nicht. Mampf.', 'Ist doch nur ein Toast, Dennis!', 'Kann man auch wieder auffegen. Also du.'],
};
