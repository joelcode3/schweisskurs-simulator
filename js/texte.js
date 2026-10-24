// Alles, was Dennis sagt. Reine Daten (auch von tools/saetze_export.mjs gelesen), keine Abhängigkeiten.
// Die Schlüssel sind die IDs für die Sprachaufnahmen in stimme/stimme.json – beim Umformulieren beibehalten.

export const DENNIS = {
  begruessung: 'Moin. Sag nix. Heute Nacht um vier ist mir ne Gehwegplatte auf den Benz gekracht. Also: Heute baust du einen Ofen aus der alten Gasflasche da drüben. Was zu tun ist, steht auf deinem Zettel. Halt dich an meine Regeln an der Wand. Ich bin heute eh schon gereizt.',
  benz: ['Guck da nicht hin. Mein Benz. Mein armer Benz.', 'Die Platte lag auf der Turnmatte. Wegen der Eicheln! Und dann kommt der Wind ...', 'Vier Uhr nachts. KRACH. Ich dachte, das Dach kommt runter.', 'Neue Motorhaube für den W123. Weißt du, was die kostet?!'],
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
  // er macht die Musik nach dem Wecken selbst aus
  musikMachIchAus: ['So. Ich mach das jetzt aus. Und dann ist erstmal Ruhe!', 'Gib her, ich mach das selber aus.'],
  // Musik wieder an, obwohl er gerade keine Lust hat
  musikWiederAn: ['Ich hab gesagt AUS! Bist du taub?!', 'Schon wieder?! Jetzt reicht’s aber!'],
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
    maske: [
      'Ohne Atemmaske lackieren?! Willst du dir die Lunge schwarz sprühen? Maske auf, die liegt im Regal!',
      'Halt! Lackdämpfe atmet man nicht ein! Atemmaske aus dem Regal, aber zack!',
    ],
    ventilDrinnen: [
      'BIST DU BEKLOPPT?! Gas in der Halle ablassen?! Raus mit der Flasche, VOR die Tür!',
      'HALT! Nicht hier drin aufdrehen! Hier wird geschweißt, Mensch! Die Flasche kommt RAUS!',
    ],
    ventilSchnell: [
      'Langsam mit dem Ventil! Wenn da noch Druck drauf ist, fliegt dir das um die Ohren!',
      'Nicht so reißen am Ventil! Gefühl, Mensch!',
    ],
    anzeichnen: [
      'Was ist das denn für ein Gekrakel? Danach schneidest du gleich?!',
      'Die Tür sieht ja aus wie von meinem Neffen gemalt. Und der ist drei.',
    ],
    lacknasen: [
      'Lacknasen! Nicht so lange auf eine Stelle halten, gleichmäßig!',
      'Der Ofen tropft ja. Das ist Lack, kein Honig!',
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
  lobAnzeichnen: ['Sauber angezeichnet. So wird das was.', 'Schöne Linie. Ruhige Hand hast du.'],
  lobLack: ['Gleichmäßig lackiert, keine Nasen. Sieht aus wie gekauft.', 'Mattschwarz und sauber. Schick!'],
  lobSchnitt: ['Sauberer Schnitt. Respekt.', 'Schnurgerade. Da kann man nicht meckern.', 'Der Schnitt sitzt. Gut gemacht.'],

  tipp: {
    ventil: 'Erst mal raus mit der Flasche! Restgas wird DRAUSSEN abgelassen, nicht hier drin. Flasche steht am Waschplatz.',
    ventilDraussen: 'Gut, draußen. Jetzt Ventil aufdrehen und das Restgas ablassen. Langsam!',
    zurueckWasch: 'Restgas ist raus. Jetzt die Flasche zurück zum Waschplatz und mit Wasser spülen.',
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
    lackierenMaske: 'Jetzt lackieren. Aber vorher die Atemmaske aus dem Regal auf! Die Dämpfe sind übel.',
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
    holen: ['Moment, die Wäsche liegt oben auf dem Trockner. Ich hol sie dir runter.', 'Warte, ich hol dir die Tasche vom Trockner. Da kommst du eh nicht ran.'],
    selbstHolen: ['Finger weg, die hol ich selber runter! Frag mich einfach.'],
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
  waldoBesuch: ['Waldo?! Was machst DU denn hier? Hier ist Schweißkurs, kein Wartezimmer!', 'Och nee, Besuch. Ausgerechnet heute. Waldo, nicht im Weg stehen!', 'Waldo! Kein Besuch während dem Kurs, das hab ich hundertmal gesagt!'],
  waldoMecker: ['Waldo, leg mal das Handy weg oder geh nach Hause!', 'Waldo, du sitzt hier nur rum und guckst aufs Handy. Mach das woanders!', 'Wenn du schon da bist, Waldo, dann fass wenigstens nix an.', 'Waldo, du krümelst mir die ganze Werkstatt voll!'],
  waldoDanke: ['Danke. Endlich Ruhe hier.', 'Gut so. Besuch nach Feierabend!'],
  pumpeWo: ['Was?! Der Tank ist SCHON WIEDER voll?! Wo ist die Pumpe?! Such mit!', 'Die Kackepumpe?! Oh nein, oh nein, die war doch ... such, such!'],
  pumpeGefunden: ['Hinterm Kompressor! Da hab ich sie zuletzt hingestellt!', 'Moment ... HINTERM KOMPRESSOR! Natürlich!'],
  pumpeWeg: ['Immer dieser Tank. Jede Woche das Gleiche.', 'Und bring die Pumpe diesmal sauber zurück, Waldo!'],
  sofaStreit: ['Waldo! Runter von meinem Sofa! Ich hab Mittagspause!', 'Das ist MEIN Sofa, Waldo. Hoch da!', 'Waldo, ich zähl bis drei. Eins ...'],
  sofaStreit2: ['Hast du mich nicht gehört?! RUNTER!', 'Mit deinen Krümeln auf meinem Sofa, ja?! Raus!', 'Ich schlaf gleich im Stehen, Waldo! Mach Platz!'],
  sofaDanke: ['Danke. Endlich Ruhe.', 'Na also. Geht doch. Danke dir.'],
  sofaRauswurf: ['So, jetzt reicht es! RAUS!', 'Ich zieh dich gleich am Bart vom Sofa! Raus jetzt!'],
  pumpeIstDa: ['Was ist das denn?! Waldo! Die Pumpe ist ja voller Scheiße!', 'Boah, wie das stinkt! Das Ding ist ja voll Gülle!'],
  pumpeMecker: ['Die Kackepumpe steht immer noch mitten im Weg. Das stinkt bis hier!', 'Mach mal einer die Pumpe sauber und räum sie weg. Ich riech das bis hier hin!'],
  pumpeSelbst: ['Muss ich hier ALLES selbst machen?! Jetzt hab ich Gülle an den Händen!', 'Bäh! Ich wasch die jetzt selbst ab. Danke für nix.'],
  pumpeSauber: ['Sauber abgewaschen und weggeräumt? Stark, danke dir!', 'Super. So gehört sich das. Danke!'],
  pumpeDreckigZurueck: ['Die ist doch noch dreckig! Erst abwaschen, dann hinstellen!', 'Nee, nee. Die stinkt. Erst in die Dusche damit!'],
  waldoKruemel: ['Waldo! Du krümelst mir die ganze Werkstatt voll!', 'Waldo, isst du schon wieder? Wir haben grad erst Mittag gemacht!', 'Waldo, du hast da was im Bart. Also ... eigentlich alles.'],
  jonnyBier: ['Jonny! Das ist MEIN Bier! Und das hier ist ein Schweißkurs!', 'Jonny, schon wieder ein Bier? Du störst hier den ganzen Kurs!', 'Und die leeren Flaschen räumst du nachher weg, klar?!'],
  jonnyKitzeln: ['Ey! Lass das! Hau ab, Jonny! Geh woanders spielen!', 'JONNY! Nicht kitzeln! Verschwinde!', 'Finger weg! Raus hier, du Spinner!'],
  jonnyPisst: ['JONNY?! PISST DU IN DEN OFEN?! Bist du komplett bescheuert?!', 'Das ist ein Ofen und kein Pissoir! Raus! Sofort!'],
  jonnyWeg: ['Endlich ist Ruhe. Jonny ist weg.', 'Sodbrennen, ja klar. Vom Bier, du Held.'],
  jonnyQuatschen: ['Nicht quatschen, arbeiten! Jonny, lass den in Ruhe!', 'Du bist hier zum Schweißen, nicht zum Labern!'],
  leiterKnall: ['Was knallt hier so?! Meine Wand! Mach das doch vernünftig!', 'Ey! Die Leiter wirft man nicht runter!'],
  leiterEndlich: ['Die Leiter ist WEG? Endlich! Danke dir!', 'Halleluja, die Leiter ist raus. Das feier ich.'],
  kuehlschrank: ['Finger weg, das ist kein Selbstbedienungsladen!', 'Da drin ist nix für dich. Erst arbeiten, dann Bier.'],
  // Telefonate: Dennis ruft selbst an (seine Seite des Gesprächs, Zeile für Zeile)
  telefon: [
    ['Lydia? Ich bin\'s. Hast du kurz?', 'Heute Nacht um vier: Wind, Turnmatte weg, Gehwegplatte durch die Plane. Direkt in die Motorhaube vom Benz.', 'Ja, IN die Motorhaube. Die steckt da drin wie ein Messer in der Butter.', 'Und jetzt? Neue Haube kostet ein Vermögen, gebraucht findest du keine in Weiß ...', 'Nee, ausbeulen geht da nicht mehr. ... Ja. Ich meld mich. Tschüss.'],
    ['Ja, guten Tag, Dennis hier. Ich hab einen Schaden zu melden.', 'Mercedes 123, weiß. Gehwegplatte auf die Motorhaube. Heute Nacht, Sturm.', 'Nee, die ist nicht runtergefallen. Die ist RUNTERGEWEHT. Von der Turnmatte.', 'Wieso fahrlässig?! Die Matte lag da wegen der Eicheln!', 'Teilkasko, ja. ... Wie, Selbstbeteiligung 500?! ... Ja, schicken Sie mir das Formular.'],
    ['Moin, Dennis hier. Ich will was bestellen. Haben Sie was zum Schreiben?', 'Flachstahl S235, 40 mal 5. Sechs Meter. Aber gesägt auf zweimal 2,98, nicht 3 Meter.', 'Nee, NICHT geschnitten mit der Schere. Gesägt. Rechtwinklig. Plus minus ein Millimeter.', 'Und bitte nicht verzundert. Und bitte nicht aus dem hinteren Regal, die sind krumm.', 'Wann kommt das? ... Vormittags. Aber nicht vor neun und nicht nach halb elf. Danke.'],
  ],
  bitsatzLob: ['Hast du etwa den Bitsatz sortiert? Ohne dass ich was sagen musste? Respekt!', 'Der Bitsatz ist sortiert! Das hat seit Jahren keiner gemacht. Danke!'],
  nichtMeineBranche: ['Nicht meine Branche.', 'Hmm ... Nee. Nicht meine Branche.'],
  akkuAufWerkbank: ['Waldo! Doch nicht auf MEINE Werkbank! Da tropft ja alles voll!', 'Ey! Ich hab gesagt, nicht meine Branche! Und jetzt liegt der Mist auf meiner Werkbank!'],
  akkuMecker: ['Der nasse Akkuschrauber liegt immer noch auf meiner Werkbank ...', 'Wann holt Waldo endlich seinen Schrott hier ab?!'],
  akkuLob: ['Du hast den Akkuschrauber wieder hingekriegt? Na guck mal an. Dann ist er wenigstens weg von meiner Werkbank.', 'Der surrt ja wieder! Nicht schlecht. Waldo schuldet dir ein Bier.'],
  tassenMecker: ['Wem gehören die ganzen Tassen hier?! Das ist doch kein Café!', 'Überall Tassen! Ab auf den Kühlschrank damit!', 'Ich hab gleich keine Tasse mehr, weil alle hier rumstehen!'],
  tassenSelbst: ['Muss ich die Tassen jetzt auch noch wegräumen?! Unglaublich.', 'Na toll. Tassen-Dienst. Ich mach das ja gern. NICHT.'],
  peitsche: {
    flucht: ['Hilfe! Nicht die Peitsche! Hahaha!', 'Neiiin! Ich bin unschuldig! Hahaha!', 'Ich hab nix gemacht! Lass mich!'],
    quieken: ['Aua! Hahaha!', 'Hihi! Nicht! Nicht!'],
    lacht: ['Okay, okay! Du hast gewonnen! Jetzt aber wieder an die Arbeit.', 'Haha, der Tag wird doch noch gut. Weiter jetzt!'],
    zuViel: ['Jetzt reicht\'s mit dem Quatsch!', 'Ey! Einmal ist lustig. Jetzt nervt\'s!'],
    sauer: ['Leg das Ding zurück in den Kofferraum. SOFORT.', 'Noch einmal und du fliegst. Mit Peitsche.'],
  },
  kettenhemd: ['Finger weg, das ist für den Mittelaltermarkt!', 'Das Kettenhemd geht dich gar nix an.'],
  muellAufgehoben: ['Oh, du räumst den Müll weg? Danke, Mann!', 'Endlich hebt mal einer den Kram auf. Sehr gut.'],
  einkauf: {
    eier: ['Lühmanns Landeier! Du bist ein Schatz. Morgen gibt es Rührei.', 'Oh, frische Eier! Hast du angeschrieben? Gut so.'],
    mettenden: ['Mettenden! Jetzt ist der Tag gerettet.', 'Für mich? Mettenden? Ich könnt dich knutschen. Mach ich aber nicht.'],
  },
  jeepHoch: ['Bist du wahnsinnig?! Lass sofort den Jeep runter!', 'Der Jeep ist doch keine Palette! Runter damit!'],
  tonnenUm: ['Die Tonnen! Alles voller Müll jetzt! Stell die wieder hin!', 'Ach du Scheiße, die Tonnen! Wer hat dir den Führerschein gegeben?!'],
  tonnenDanke: ['Gut. Und der ganze Müll auch wieder rein. Danke.', 'Na also. Tonnen stehen, Müll ist drin. Geht doch.'],
  tonnenSelbst: ['Jetzt sammel ich hier auch noch den Müll vom Hof. Super.', 'Tonnen aufstellen, Müll aufsammeln. Mein Traumjob.'],
  tasseDanke: ['Danke dir.', 'Ah, sehr gut. Danke!', 'Na also. Danke.', 'Danke, Tassen-Held.'],
  tassenVoll: ['Der Kühlschrank ist voll! Wer hat denn diese Woche Spüldienst?', 'Da passt nix mehr drauf. Guck mal auf den Zettel, wer spülen muss!'],
  spueldienstDanke: ['Endlich spült mal einer! Danke.', 'Na bitte, geht doch. Saubere Tassen!'],
  tassenAlle: ['Alle Tassen weg? Endlich mal Ordnung hier. Danke!', 'Sauber! Alle Tassen auf dem Kühlschrank. So mag ich das.'],
  tasseMitgebracht: ['Und noch eine Tasse. Bringt ihr die von zu Hause mit, oder was?!', 'Schon wieder eine Tasse mehr. Ich werd verrückt.'],
  husten: ['*HUST* *HUST* ... Jonny! Ich krieg hier keine Luft!', '*HUST HUST HUST* Muss das HIER drinnen sein?!', '*KCHH* *HUST* Jonny, ich ersticke gleich!'],
  hustenNochmal: ['*HUST* Ernsthaft jetzt! Raus mit der Kippe!', '*HUST* *KEUCH* Ich schmeiß dich gleich mitsamt Kippe raus!'],
  jonnyRaucht: ['Jonny! Da hängt ein Rauchen-verboten-Schild! Direkt neben dir!', 'Jonny, mach die Kippe aus! Hier steht Gas rum!', 'Und die Kippe NICHT in den Mülleimer, Jonny!'],
  // Fahrzeuge: in Dennis' Augen fahren grundsätzlich alle lebensgefährlich
  fahrenSpieler: ['Bist du lebensmüde?! Runter von der Karre!', 'Du fährst wie ein Henker! Pass auf meinen Hof auf!', 'Wer hat dir den Führerschein geschenkt?! Lebensgefährlich!', 'Langsam! Hier laufen Menschen rum! Also ich.'],
  fahrenAndere: ['Lebensgefährlich, wie der fährt. Ich guck da nicht hin.', 'Der fährt mir noch die Werkstatt um!', 'Jedes Mal das Gleiche. Irgendwann gibt es Tote.', 'Ich hör das doch! Langsam, verdammt!'],
  torbenDa: ['Torben! Wenn du schon da bist: Die Stahlträger!', 'Oh nein. Torben ist da. Versteckt die Fahrzeugschlüssel.', 'Torben! Fahr bloß nicht wieder irgendwo gegen!'],
  grillUm: ['WAS war das?! Hat Torben schon wieder den Grill umgefahren?!', 'Mein Grill! Torben! Stell den sofort wieder hin!'],
  grillSelbst: ['Muss ich den Grill jetzt auch noch selbst aufstellen?! Unglaublich.', 'So. Grill steht wieder. Ohne Hilfe. Wie immer.'],
  grillDanke: ['Danke, dass du den Grill aufgestellt hast. Einer muss ja.', 'Grill steht wieder? Gut. Torben kriegt Grillverbot.'],
  anstoss: ['RUMMS! Was machst du da draußen?!', 'Hab ich da gerade was scheppern gehört?!'],
  weidemannZu: ['Finger weg vom Hoflader! Den Schlüssel kriegst du, wenn du ihn brauchst.', 'Der Hoflader ist abgeschlossen. Und das bleibt erst mal so.'],
  // Vorzeichen: Gähnen (Kaffee wäre jetzt gut), Hüfte reiben, Blick auf die Uhr vor der Mittagspause
  gaehnen: ['Uaaaaah ... Ich bräucht jetzt nen Kaffee.', '*gähn* ... Die Nacht war zu kurz. Danke, Wind.', 'Uaah. Wenn mir jetzt einer nen Kaffee bringen würde ...'],
  kaffeeMuede: ['Genau DAS hab ich jetzt gebraucht. Du bist ein Schatz.', 'Kaffee, genau als ich wegpenne. Du hast es verstanden!'],
  huefteVorzeichen: ['Aua ... die Hüfte zwickt schon wieder. Hinten links.', 'Hmm. Meine Hüfte. Das fühlt sich gar nicht gut an.'],
  huefteVermieden: ['Gut, dass du fragst. Die zwickt schon den ganzen Morgen. Ich mach mal kurz Dehnübungen.', 'Ja, die Hüfte. Danke der Nachfrage. Ich setz mich gleich mal anders hin, dann geht das.'],
  huefteTrotzdem: ['Ich lieg hier mit kaputter Hüfte und muss trotzdem alles selber machen!', 'Mit DER Hüfte jetzt aufstehen?! Unglaublich!'],
  mittagBald: ['Schon so spät? Gleich ist Mittag.', 'Hm. Gleich Mittagspause. Wo ist meine Brotdose?'],
  // Nett sein zu Dennis (Menü an Dennis): entspannt freut er sich, gestresst wird er stinkig
  nett: {
    huefte: ['Die Hüfte? Geht so. Hinten links, wie immer. Nett, dass du fragst.', 'Der Orthopäde sagt, ich soll mich mehr bewegen. Ich sag: Ich schweiß den ganzen Tag!', 'Heute geht es eigentlich. Nur wenn ich mich bücke. Und wenn ich stehe.'],
    zuhoeren: ['Der W123, das ist ein Auto. Den fährst du, bis du umfällst. Wenn keiner ne Gehwegplatte drauf schmeißt.', 'Früher hab ich auf der Werft geschweißt. Dagegen ist das hier Kindergeburtstag.', 'Das Feine-Sahne-Konzert damals, ey. Ich war drei Tage heiser.', 'Eigentlich wollte ich nur einen Ofen für den Wohnwagen. Jetzt bauen hier alle Öfen.'],
    lydia: ['Lydia? Die ist super. Die hält mich aus. Das muss man erst mal schaffen.', 'Lydia sagt, ich soll weniger fluchen. Ich sag: Ich fluche nicht, ich erkläre laut.', 'Lydia will, dass ich den Benz verkaufe. Niemals. NIEMALS.'],
  },
  nettGestresst: ["Geh mir nicht auf'n Sack, ich hab zu tun!", 'Bin gestresst! Später!', 'Kann jetzt nicht!', 'Nicht jetzt! Mach lieber deine Arbeit!', 'Siehst du nicht, dass ich gerade voll unter Strom stehe?!'],
  nettNerven: ["Jetzt reicht's aber mit dem Gequatsche. Arbeite!", 'Hab ich dir doch gerade erst erzählt. Hörst du nicht zu?', 'Du laberst mir ein Ohr ab. Ran an die Flasche!'],
  // Ausraster, wenn es ihm zu viel wird (ab Wut 50, ausgelöst durch irgendeinen Ärger)
  zuViel: ["JETZT REICHT'S MIR ABER! Alle! Komplett!", 'Ich halt das hier nicht mehr aus! Was ist das hier für ein Zirkus?!', 'NOCH EIN DING und ich schmeiß alle raus!', 'Ich krieg gleich nen Hals! Echt jetzt!'],
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
  angehoben: ['Ey! Lass mich runter! Ich hab mein Bier hier drin!', 'Wooah! Was soll das denn?!'],
  spueldienst: ['Spüldienst? Ich? Na gut. Aber nur, weil du so lieb fragst.', 'Steht da echt mein Name? Na schön, gib her.'],
  quatschen: ['Na, Schweißer? Läuft bei dir?', 'Ich bin nur kurz hier. Seit drei Stunden.', 'Holz ist ehrlicher als Stahl. Sag ich nur.', 'Hast du mal Feuer? Nee, war Spaß. Hab selbst.', 'Dennis ist heute wieder voll in seinem Element, oder?'],
  leiter: ['Die Leiter? Die hol ich nächste Woche. Ganz sicher.', 'Welche Leiter? Ach DIE. Ja, irgendwann.', 'Der Camper ist weg, aber die Leiter ist noch gut. Die bleibt hier.'],
  bierJa: ['Na gut, eins geht immer!', 'Überredet. Ich hol mir eins.', 'Bier? Du musst nicht zweimal fragen.'],
  bierSelbst: ['Ich hol mir mal eben ein Bierchen.', 'Durst. Kurz zum Kühlschrank.', 'Ein Bier geht noch.'],
  sodbrennen: ['Uff. Sodbrennen. Ich glaub, ich geh nach Hause.', 'Oh Mann, mein Magen. Ich bin raus für heute.'],
  kitzeln: ['Kille kille, Dennis!', 'Dennis! Guck mal ... KITZEL!'],
  stoeren: ['Na, was schweißt du da? Zeig mal!', 'Ey, hast du schon gehört, was Waldo gestern gemacht hat?', 'Sieht schief aus. Aber was weiß ich, ich bin Zimmermann.'],
  beleidigt: ['Pff. Dann eben nicht.', 'Okay, ich merk schon, du bist beschäftigt.'],
  leiterHolen: ['Heute nehm ich die Leiter echt mit! Hilfst du mir? Ich komm da nicht ran.', 'Holst du mir mal die Leiter runter? Ich nehm sie heute mit. Ehrlich.'],
  leiterDanke: ['Danke! Die kommt jetzt endlich ins Auto.', 'Super, danke! Dennis wird sich freuen.'],
  leiterNix: ['Na gut. Dann nächste Woche.', 'Egal, die hängt da ja gut.'],
  leiterRaus: ['So, ab in den Camper damit. Bis gleich!', 'Die nehm ich jetzt mit. Bevor Dennis es sich anders überlegt.'],
  leiterKnall: ['Uff! Hätte man auch leiser machen können.', 'Ach du Scheiße. Ist sie noch ganz?'],
  raeuberleiter: ['Komm, ich mach dir die Räuberleiter. Rauf mit dir!', 'Fuß in meine Hände. Ich halt dich. Glaub ich.'],
  raeuberFall: ['Haha, beim zweiten Mal wird’s. Danke!', 'Wackelig, aber geschafft. Danke!'],
  feuer: ['Upsi. War ich das?', 'Die Kippe war doch aus! Glaub ich.'],
  hallo: ['Moin moin! Na, wird hier geschweißt? Ich guck nur mal.', 'Tach zusammen! Ich bin nur kurz hier. Ehrlich.'],
  bierNochNicht: ['Nee, ich bin doch gerade erst gekommen. Später vielleicht.', 'Jetzt noch nicht. Erst mal ankommen.'],
  raus: ['Ich guck mal kurz nach meinem Camper.', 'Bin mal kurz draußen, telefonieren.', 'Ich hol mir mal Kippen vom Kiosk.'],
  zurueck: ['Bin wieder da. Hab ich was verpasst?', 'So. Wo war ich?', 'Kiosk hatte zu. Egal.'],
  fahren: ['Ich dreh mal ne Runde mit dem Jeep.', 'Kurz Kippen holen. Mit dem Jeep, ist ja nicht weit.', 'Ich fahr mal den Hoflader um, der steht doof.'],
};

// Waldo (Kumpel, isst eigentlich immer)
export const WALDO = {
  angehoben: ['Äh. Hallo? Ich bin hier noch drin.', 'Ey, mein Handy! Fast runtergefallen!'],
  spueldienst: ['Hm? Spülen? Okay, okay. Ich nehm die mit.', 'Ich? Schon wieder? ... Na gut.'],
  quatschen: ['Mmh. Willst du auch was? Nee, ist meins.', 'Ich hab Hunger. Ich hab immer Hunger.', 'Feine Sahne live, das war so gut. Warst du dabei?', 'Schweißen macht hungrig. Auch vom Zugucken.'],
  pumpe: ['Dennis! DENNIS! Die Kackepumpe! Der Tank im Garten ist schon wieder voll! Ich muss umpumpen!', 'Dennis, schnell! Wo ist die Kackepumpe?! Der Tank läuft gleich über!'],
  pumpeNicht: ['Hier ist sie nicht!', 'Nix! Wo ist das Ding?!'],
  pumpeDanke: ['Hab sie! Danke! Ich muss los, sonst schwimmt der Garten!', 'JA! Gefunden! Bin weg!'],
  sofaRunter: ['Schon gut, schon gut, ich geh ja vom Sofa.'],
  tschuess: ['So, ich bin dann mal wieder weg.', 'Okay, ich lass euch mal.', 'Tschö. Viel Spaß noch beim Schweißen.'],
  rausgeschickt: ['Ja ja, ich geh ja schon.', 'Pff. Ich wollte eh grad los.'],
  kruemel: ['Was? Wo? ... Ach, das spar ich mir für später.', 'Das ist kein Krümel, das ist Vorrat.', 'Lass mal, der Bart isst mit.'],
  antwort: ['Ich krümel doch gar nicht. Mampf.', 'Ist doch nur ein Toast, Dennis!', 'Kann man auch wieder auffegen. Also du.'],
  akkuFrage: ['Dennis, der Akkuschrauber lag im Regen. Kannst du den reparieren?', 'Dennis! Mein Akkuschrauber geht nicht mehr. Lag die Nacht draußen. Machst du den heile?'],
  akkuTrotzdem: ['Ich leg ihn dir einfach mal auf die Werkbank, ja? Kannst ja mal gucken.', 'Ach komm, du kriegst das schon hin. Ich leg ihn dir hin.'],
  sofaNein: ['Ich sitz hier grad so gut.', 'Fünf Minuten noch, Dennis!', 'Das Sofa ist groß genug für zwei.'],
  sofaNein2: ['Mann, du bist heute wieder empfindlich.', 'Ich hab aber auch Mittag. Mampf.'],
  sofaGeschlichtet: ['Na gut, für dich. Ich geh ja schon.', 'Okay, okay. Schlaf schön, Dennis.'],
  sofaRaus: ['Ist ja gut! Nicht am Bart!', 'Pff. Ich komm nie wieder. Bis morgen.'],
  pumpeZurueck: ['Hier, die Pumpe. Danke fürs Leihen! Ist noch ein bisschen ... naja.', 'Pumpe zurück! Tank ist leer. Die Pumpe ... nicht so ganz.'],
};

// Torben (Kumpel, erledigt die schweren Sachen, fährt alles, was Räder hat)
export const TORBEN = {
  angehoben: ['Haha! Höher! Höher!', 'Okay, okay, das ist sogar für mich zu viel.'],
  hallo: ['Moin! Ich bin nur kurz da. Wo steht der Hoflader?', 'Na, ihr Schweißer? Ich dreh nur mal ne Runde.'],
  tschuess: ['So, ich bin wieder weg. Bis die Tage!', 'Tschö! Die Träger mach ich nächste Woche.'],
  quatschen: ['Stahlträger? Ja, die mach ich. Bald.', 'Der Jeep geht ab, wenn man ihn lässt. Glaub mir.', 'Ich fahr nie irgendwo gegen. Fast nie.'],
  entdrosseln: ['Weil du so lieb fragst: zwei Kabel umstecken, fertig. Jetzt geht der richtig ab!', 'Na gut. Aber du hast das nicht von mir. So, jetzt fährt der richtig!'],
  schonEntdrosselt: ['Der ist schon offen. Schneller geht nicht, sonst brennt der Motor durch.', 'Mehr geht nicht. Der ist schon entdrosselt.'],
  rums: ['Ups.', 'Das war vorher schon so.', 'Hat keiner gesehen, oder?'],
  fahren: ['Ich dreh mal ne Runde!', 'Mal gucken, was der Jeep heute schafft.', 'Ich stell mal den Hoflader um.'],
};

// Kumpels mit Spüldienst (Jonas, David, Joel): vorläufige Sätze, bis die Figuren eine eigene Rolle bekommen
export const KUMPEL = {
  hallo: ['Moin! Ich hol mir nur kurz nen Kaffee.', 'Na? Alles klar hier?'],
  quatschen: ['Läuft bei dir? Sieht gut aus.', 'Ich bin nur kurz hier, Kaffee holen.', 'Dennis guckt schon wieder so. Ich sag nix.'],
  spueldienst: ['Ja, ja, ich mach ja schon. Gib her.', 'Oh Mann. Okay, ich nehm die mit in die Küche.'],
};
