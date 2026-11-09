# Details zum Spiel

Verschoben aus CLAUDE.md (unverändert, nach Themen sortiert). Nur den passenden Abschnitt lesen; Änderungen hier pflegen.

## Spielidee, Start, Ende, Anzeige
- Mini-Game im Browser, Ich-Perspektive, Comic-Stil (Three.js, Toon-Materialien, schwarze Umrisse).
- Auftrag: Ofen aus einer alten Propan-Gasflasche bauen. Fehler machen Dennis wütend (Wutanzeige 0–100,
  bei 100 fliegt man raus). Am Ende Schulnote 1–6.
- Dennis ist der echte Schweißkurslehrer eines Kumpels. Er ist mit den Videos einverstanden,
  das Spiel ist **nur für Kumpels** (Seite hat `noindex`).
- Stationen: Regal (Brille, Handschuhe flach auf dem Brett), Waschplatz (Flasche, Schlauch), Werkbank (blauer Edding, Flex, Handy),
  Schweißplatz (Gerät, Masseklemme, Helm, Hammer), Kaffeeecke (Dennis, Tasse „CHEF“).
- Fertiger Ofen (Vorbild-Foto vom Betreiber): stehende Gasflasche, mattschwarz lackiert, Tür unten an der Seite
  mit Holzgriff, langes Ofenrohr oben (statt Ventil), drei schräge Beine am Fußring, zwei seitliche Tragegriffe.
  Mit Beinen steht er vor dem Schweißtisch auf dem Boden.
- Start aktuell: einfache Karte mit „Kurs starten“, danach direkt Dennis' Begrüßung (#start-einfach).
- FÜR SPÄTER gemerkt (Betreiber): Startbildschirm Werkstatt von außen, Plakat „Heute: Gasflaschen-Ofen schweißen mit Dennis“
  (Foto assets/dennis-plakat.jpg, kommt später), Tür mit Zahlenschloss, Code **1312**. Ist fertig gebaut (#start, Klasse
  `versteckt`); zum Aktivieren `versteckt` dort entfernen und #start-einfach ausblenden.
  Kein Dennis-Modus, kein Dennis-Archiv mehr. Keine Hintergrundmusik (Betreiber: erstmal nicht).
- Bewertung am Ende mit freigestelltem Foto im Comic-Look: assets/ende-bestanden.webp (Daumen hoch, Note 1–4),
  assets/ende-nichtbestanden.webp (Mittelfinger, Note 5–6 und Rausschmiss).
- Bedienung: Hat ein Ding nur eine Aktion, wird sie beim Klick direkt ausgeführt (kein Menü). Box und Licht schalten
  sofort beim Klick (ohne Hinlaufen). Abbrechen-Knöpfe hell mit dunkler Schrift.
- Anzeige-Regeln (Betreiber): Videos NUR bei Ausrastern (Fehlerstufe voll, Rausschmiss, schlechte Note am Ende = Rausschmiss-Video),
  rechts am Rand, ohne Wegklicken. Alles andere (auch Tipps, Abgabe, Lob, Ende gut) nur als Sprechblase. „Was los??“ nur Ton, keine Blase. Alle Sprechblasen (Nebensachen, Lob) rechts am Rand, verschwinden von selbst.
  Mute-Knopf und Lautstärkeregler unten links (gespeichert im Browser).
  Begrüßung am Anfang bleibt als großes Fenster. Stations-Knöpfe nur auf Touch-Geräten.
- clips.json enthält nur noch ausraster-1..4 und rausgeflogen-1 (alle anderen Listen leer, Betreiber-Wunsch).
- Fokus: Desktop-Version (Betreiber-Wunsch), Handy-Ansicht erstmal zweitrangig.
- Fehlerstufen: leicht (Ermahnung, Dennis guckt), mittel (kommt rüber, sauer), voll (rennt rüber, Ausraster).

## Dennis: Aussehen
- Aussehen Dennis (nach Fotos): schlank, blond-rötliche Locken (oben/hinten voluminös), goldene Pilotenbrille,
  Schnauzer, leichter Dreitagebart, schwarze Arbeitsjacke mit Kragen und Reflexstreifen, darunter grauer Hoodie (keine Kordeln), kurze
  schwarze Arbeitshose (über dem Knie), dicke nackte Waden mit Tattoos auf der Rückseite (links Kiwi, rechts Penis, leicht nach
  außen gedreht, `wadenTattoo` in dennis.js), kurze graue Socken, **hässlicher blauer Rucksack** (ausdrücklich gewünscht). Keine roten Wangen, kein Gehörschutz, keine Mütze, kein grauer Ring am Hals.
- Dennis hält seinen Becher immer aufrecht (Weltmatrix vor dem Ausrichten aktualisieren, beim Schluck nur leicht angekippt), Schuhsohlen rund (keine eckigen Platten).

## Dennis: Verhalten, Nebenbei-Interaktionen, Sprache
- Nebenbei-Interaktionen: Kaffee kochen und Dennis bringen (Wut sinkt, ab dem 3. meckert er), Kiwis (1. und 2. erlaubt:
  kein Spruch, nur Bissgeräusch; ab 3. sauer), Brotdose (abbeißen = Ausraster), große Soundbox (Techno, Dennis tanzt),
  Lichtschalter (Dennis meckert), Besen (Dreck nach Schneiden/Schweißen, zählt in die Note; fegen = Besen in der Hand, E halten),
  Hüfte (Dennis humpelt einmal pro Spiel auf freien Boden in der Raummitte, legt sich hin und jammert, bis man ihm aufhilft),
  Klo-Pause zwischendurch (frühestens nach 100 s, WC-Tür vorne rechts mit WC-Schild). Dennis sagt erst Bescheid,
  dann rennt er raus; solange er weg ist: Arbeitspause (gelbes Band oben, Arbeitsschritte gesperrt). Geht man zu Dennis hin und bleibt
  stehen: „Was los??“ (stimme/baustellenfeeling.mp3, 1 s, nicht im Liegen, nicht wenn er selbst kommt, max. alle 40 s). Mittagspause: einmal pro Spiel setzt er sich aufs Sofa (vorne links), isst aus der Brotdose eine Tomate
  (stimme/tomate.mp3), legt sich dann ~22 s schlafen (Z Z Z). Wecken = Wut. Kiwis liegen lose auf dem Kaffeetisch.
  (stimme/tomate.mp3 kommt sofort, wenn er die Brotdose auspackt). Auf dem Sofa liegt er mit Kopf und Waden auf den Lehnen.
  Dreck: nach 18 s meckert Dennis (+4 Wut), nach 32 s holt er den Besen und fegt selbst (stimme/muell.mp3, +8 Wut, Note -2).
  Sprüche haben meist mehrere Varianten (Listen in texte.js, `sag()` wählt zufällig).
  Beim Hula-Hoop sagt Dennis nur „hello fresh“, sonst nichts (Wichtiges wartet, Nebensächliches fällt weg).
  Wasserschlauch (lange Schlaufen mit Spritzpistole, unsichtbare Klickfläche drüber): in die Hand nehmen, E gedrückt halten = Dauerstrahl, Pfützen wo das Wasser landet (Dennis treffen = sauer, sonst meckert er; löscht auch Feuer),
  G = zurückhängen, reicht nur ca. 5 m vom Waschplatz.
  Wasserrohrbruch (Frost): einmal pro Spiel nach ca. 3–5 min spritzt das Rohr am Waschplatz (Pfütze, Wasser-Symbol unten
  rechts). Rohrzange von der Werkzeugwand holen,
  auf das Rohr klicken (Leckstelle: Messing-Verschraubung mit pulsierendem gelbem Ring, große Klickfläche) (oder E in der Nähe), festziehen. Nach ca. 22 s
  macht Dennis es selbst und ist stinkig (+12 Wut). Rohrzange detailliert (roter Doppel-T-Griff, Gehäuse mit Stellmutter,
  Hakenbacke mit Zähnen), wird flach hingelegt (userData.liegend). Leckstelle: Messing-Verschraubung mit pulsierendem gelbem Ring.
  Dennis steht nicht immer vor dem Sofa: alle 30–55 s wechselt er zu einem anderen Platz (PLAETZE in dennis.js).
  Tanzen (Box an): nur dann und immer wieder stimme/murmeln-8.mp3 (95281C52…), sonst sagt er beim Tanzen nichts.
  Hüfte: erster Hilferuf beim Hinlegen, Hilferuf-Blasen bleiben ca. 8 s.
  Holzfigur anfassen: Ton stimme/murmeln-9.mp3 (= ansprechen2.MOV vom 17.10., Betreiber-Wunsch; naehe-2a.mp3 ist ein anderer
  Clip gleichen Namens und wird nicht mehr benutzt).
  Sprach-Reihenfolge: Dennis spricht nie gleichzeitig. Warteschlange mit Wichtigkeit: von uns provoziert (2) vor Ereignis
  (Klo, Feuer, Hüfte = 1) vor nebenbei (Was los, Jammern, Nähe-Sprüche, Tanz-Spruch = 0); Nebensächliches wird für
  Wichtiges ausgeblendet. Lautstärke: je näher, desto lauter, aber überall noch hörbar.
  Werfen: eigene Sprüche je Ding (Werkzeug, Edding, Schutzausrüstung, Reifen, Notizen, Besen, Löscher).
  Handy: Ton/Text abwechselnd handy1, handy2, handy1, ...
  Hula-Hoop: Reifen hängt an der Rückwand zwischen Regal und Werkbank. Dennis holt ihn sich alle 1,5–2,5 min (oder man
  bringt ihn: Reifen in die Hand, auf Dennis klicken), macht Hula-Hoop und sagt dabei stimme/murmeln-10.mp3 (hello_fresh,
  nur noch dafür), hängt ihn danach zurück. Minispiel am Reifen: „Dennis’ Rekord knacken“ (A/D bzw. links/rechts tippen im Takt,
  Rekord 47 Runden, eigener Rekord im Browser gespeichert; Dennis kommentiert, wenn er zuguckt). Spielprinzip: so schnell
  wie möglich abwechselnd A/D (zu langsam = Reifen fällt; +7 je richtiger Taste, -22 bei falscher, Abrutschen
  32 + 1,2 je Runde pro Sekunde nach echter Zeit; für Dennis' 47 braucht man über 8 Tasten pro Sekunde). Schlacke-Minispiel auf rotem Ofen-Untergrund, Flexen großzügiger.
  Nähe-Sprüche: kommt man in Dennis' Nähe, sagt er ab und zu etwas (stimme/naehe-1a/1b = ansprechen1/11 wenn entspannt,
  naehe-2b/2c = ansprechen22/22222 ab Wut 35, dann auch weiter weg hörbar). Je näher, desto lauter.
  Ärgern (Kaffee, Kiwi, Brotdose): Ton stimme/aergern-1 (ärgernleicht1), dann aergern-2, dann abwechselnd.
  Abgeworfen/getroffen: Ton stimme/abwerfen-1.mp3 + Blase (kein Video).
  Schläft Dennis oder ist er auf dem Klo, merkt er nichts (Kiwis, Brotdose, Tasse, Werfen, Handy, Figur ohne Wut).
  Sprache (Aufnahme oder Gebrabbel): je näher der Spieler, desto lauter; Aufnahmen werden vorgeladen, Blase und Ton
  starten gleichzeitig; schließt das Dennis-Fenster (Weiter), blendet sein Gebrabbel aus.
  Alle Töne mit kurzem Ein- und Ausblenden. Poster (assets/poster.jpg) mit Klebeband über der Kaffeeecke.
- Kaffee: 1. senkt Wut (-20), 3 hintereinander (seit letztem Klo) = sofort aufs Klo + etwas Wut. Milch (Tüte auf dem
  Kaffeetisch, breit, mit Brotdose) = „Ist da Milch drin? GIFT!!“ + Klo + Wut. Auf dem Klo: laut stimme/klo-1 oder klo-2 (abwechselnd, Ton aus IMG_3472/IMG_6967), danach Klospülung.
  Musik an, während Dennis Mittagspause macht oder schläft: er steht auf und ist sauer (+14 Wut). Danach geht er zur Box und macht sie selbst aus (DENNIS.musikMachIchAus), 3–4 min kein Tanzen (z.keinTanzBis); macht man sie in der Zeit wieder an: +5 und alle 8 s +3, bis er sie ausmacht (DENNIS.musikWiederAn, dennisMachtMusikAus). Reguläres Klo (nicht ausgelöst) senkt die Wut (-10).
  Fegen senkt Wut (-8), Aufhelfen nach Hüfte (-12, Dennis freut sich).
- Dennis aufhelfen (Hüfte) nur mit leeren Händen (Ausnahme: Kaffee, Wäschetasche, Sieb, die man nicht hinlegen kann).
- Kaffee kann man werfen (Q) und fallen lassen (G); dann ist er weg (neuen kochen), Dennis meckert, wenn er es sieht.
- Hüfte: erst still hinlegen, dann rufen und jammern. Schlauch: nur die Spritzpistole kommt in die Hand (Wasser aus der Düse),
  Pfützen unregelmäßig (Klecks-Texturen).

## Wut-Mechanik
- Wut-Mechanik (spiel.js `wutUndVorzeichen`, `nettSein`): Wut sinkt von selbst, wenn 20 s kein neuer Ärger kam, 1 Punkt alle
  10 s (auch die Startwut 15). Gute Arbeit freut ihn mehr: Lob bei sauberem Anzeichnen/Schnitt/Naht/Lack −10, bei Spitzenqualität
  −12 (sonst Lob −5). Vorzeichen: Dennis gähnt alle 100–160 s (Geste, Mund weit auf, ab und zu DENNIS.gaehnen); 40 s danach wirkt
  Kaffee besser (−10 extra, DENNIS.kaffeeMuede). Vor der Hüfte reibt er sich ~28 s die Hüfte hinten links (Geste 'huefte',
  DENNIS.huefteVorzeichen); wer jetzt „Nach der Hüfte fragen“ wählt, kommt ihm zuvor (Hüfte fällt aus, −8, DENNIS.huefteVermieden).
  Vor der Mittagspause schaut er ~20 s auf die Armbanduhr (Geste 'uhr', DENNIS.mittagBald) – Zeit, Sofa freizumachen/Musik aus.
  Gesten: dennis.geste(name, dauer). Überlappende Ereignisse: in den ersten 4 min nie, danach alle 20 s neu gewürfelt (bis 55 %):
  Feuer/Wasserrohrbruch auch während Hüfte (liegt) oder Mittagspause, Klo/Mittag/Hüfte/Waldo-Besuch auch während anderer Ereignisse
  (ruhigeLage()). Feuer und Wasserrohrbruch bleiben mit 90 s Abstand. Muss Dennis mit kaputter Hüfte aufstehen: +6, DENNIS.huefteTrotzdem.
  Nett sein (Menü an Dennis): „Nach der Hüfte fragen“, „Zuhören“, „Über Lydia reden“ (DENNIS.nett.*). Wut unter 40: −5 und er
  erzählt; ab 40 (sauer): +4, DENNIS.nettGestresst. Dasselbe Thema innerhalb 60 s oder irgendwas innerhalb 15 s: +3, DENNIS.nettNerven.

## Dennis telefoniert
- Dennis RUFT SELBST AN, alle 3–4 min (erstes Mal nach 2–3 min) und geht dafür raus vor die Werkstatt (kein Klingeln, keine
  Wähltöne; linke Hand mit Handy am Ohr, danach wieder rein; dennisLaufZu springt bei sehr langsamen Geräten ans Ziel;
  TELEFON-Pose per Suche bestimmt). Gespräche (DENNIS.telefon, der Reihe nach gemischt): Lydia (Motorhauben-Dilemma),
  Versicherung (Schaden an der Motorhaube), Metallhändler (Bestellung mit sehr genauen Details). Fehler/Ärger beenden das Telefonat.

## Werkstatt: Optik, Einrichtung, Dinge
- Werkstatt-Optik: Deckenhöhe 3,9 m (RAUM.hoehe), helle Putzdecke (MeshBasic), KEINE Holzbalken (Betreiber), Leuchtstoffröhren an Ketten auf 3,25 m. Wände mit eigener Leinwand je Wand
  (`wandMalen`): Putz, grüngrauer Sockel bis 1,25 m, Putz bröckelt stellenweise (Ziegel sichtbar), Risse, Wasserflecken.
  KEINE Graffiti und Zahlen (Betreiber: wieder weg). Eingang vorne: breites Scheunentor komplett grün (2 Flügel, Z-Streben,
  nur die Scharniere/Bänder schwarz) mit Rauchen-verboten-Schild; Lichtschalter zwischen Tor und WC-Tür.
  Das Tor ist ZU; im linken Flügel (leicht aus der Mitte) eine normale grüne Schlupftür, Band an der Außenkante (zur Torecke),
  steht offen nach außen, Durchgang nur dort (DURCHGANG x -0,68 bis -0,02). Neben der Tür auf dem anderen Flügel klein ein
  handgeschriebenes Pappschild „Schweisskurs, nicht stören!“ mit Nagel (Caveat). Jonny/Waldo gehen durch die Schlupftür (-0,35 | 3,55).
- Holzfigur (Baumstamm mit geschnitztem Hintern, ~70 cm) steht zwischen Box und Besen.
- Bemalte Holz-Skulptur (langer Penis, nach Foto vom Betreiber) hängt über dem Fenster über der Soundbox.
- Dennis' Klemmbrett (liegt auf dem Sofa): Klick = in die Hand, groß vor dem Gesicht (Hand fasst unten rechts an, `griff` in HALTUNG),
  alles lesbar. Handschrift (Google Font Caveat, leicht schief, Kaffeefleck), Erledigtes durchgestrichen. NOTIZEN (world.js):
  Lydia anrufen (durch, Haken), Hüfte hinten links!! (rot), Heringe essen (durch), Orthopäde, Zahnarzt (durch), Hautarzt,
  TK-Pizza einkaufen, Sexy abmelden, neue Motorhaube für Benz organisieren, Konzerttickets verkaufen, Urlaub einreichen,
  40-Grad-Wäsche!! (kein „Fußmatte waschen“ mehr).
- Erste-Hilfe-Kasten neben dem Feuerlöscher. Klospülung = assets/klospuelung.mp3 (Ton aus dem Video vom Betreiber, mit Ausblenden).
- Zwei kleine gelbe Stromverteiler-Würfel (18 cm, genau eine Steckdose pro Seite, KEIN eingesteckter Stecker) hängen an Kabeln tief von der Decke (Unterkante 1,75 m, bei
  (2,6 | 1,0) und (-2,9 | -1,4), seit Paket A; Dennis stößt erst nach 120 s an). Läuft Dennis dagegen: pendelt, Klonk, Spruch (DENNIS.stromwuerfel, max. alle 35 s).
- Johnnys Leiter (Alu-Kofferraumleiter vom Camper, 6 Sprossen, oben gebogen) hängt quer, hoch und leicht schräg an der rechten
  Wand auf zwei Konsolen. Dennis regt sich alle 2,5–4 min darüber auf (DENNIS.leiter) und beim Anklicken.
- Feuer und Wasserrohrbruch mit mindestens 90 s Abstand (z.letztesEreignis). Waschmaschine/Trockner: Scheibe schlicht blau.
- Geworfene/fallen gelassene längliche Dinge liegen flach (userData.liegend: Rohrzange, Pömpel, Besen, Hula-Hoop-Reifen).
- Kühlschrank (klein, weiß, hohl mit Glasböden, Gemüsefach, Bierflaschen, Dose „DENNIS' MATJES“, Senf; Tür innen mit Ablagen
  und Flaschen) in der Pausenecke neben dem Kaffeetisch.
- Atemmaske (Einweg-Staubmaske FFP3, Betreiber-Wahl C: weißes Vlies, Nasenbügel, rotes Ventil, zwei flache gelbe Gummibänder
  mit Metallklammern, hinten als lockere Schlaufe) steht im Regal neben der Brille, 4. Symbol in der Ausrüstung. Lackieren ohne
  Maske = Fehler maske (mittel, +15).
- Stahlträger (HEB 200, rostig) liegen vorne rechts zwischen Waschplatz und Bad-Tür, ohne Funktion. Anklicken oder in der Nähe
  (max. alle 45 s): Dennis „Schwere Stahlträger sind Torbens Job!“.

## Kaffeetassen und Spüldienst
- Kaffeetassen: zu Spielbeginn 7 benutzte Tassen (bunt, Kaffeerest) zufällig verteilt, NIE auf dem Boden: Spülkasten im Bad,
  Regal (nur vorne auf dem mittleren Brett), Sofa-Armlehnen, Stahlträger, Erste-Hilfe-Kasten, Werkbank, Schweißtisch (TASSEN_PLAETZE mit Strahl-
  Starthöhe, Linien/Umrisse zählen nicht als Fläche). In die Hand, Klick auf den Kühlschrank (oder E davor) = oben abstellen
  (4 x 3 Plätze, dann VOLL), Wut -2 und Dennis ist pro Tasse kurz dankbar (DENNIS.tasseDanke); für alle weg gibt es nichts extra.
  Es tauchen immer wieder neue Tassen auf (alle 45–90 s, bei 0 offenen nach 12–22 s, max. 9 offene), aufgeräumt ist nie alles.
  Kühlschrank voll: es passt keine mehr drauf (DENNIS.tassenVoll). Zettel über dem Kühlschrank „Spüldienst diese Woche: NAME“
  (Name je Spiel zufällig: Jonas, David, Waldo, Joel, Jonny; `sd` in spiel.js, welt.setzeSpueldienst). Ist der Spüldienst da,
  kann man ihn bitten, die Tassen zu spülen: er holt alle vom Kühlschrank und bringt sie in die Küche (hinten raus),
  Dennis freut sich (−3, DENNIS.spueldienstDanke). Jonas/David/Joel kommen dafür alle 2,5–4 min kurz auf einen Kaffee
  vorbei (KUMPEL in texte.js), Jonny kommt danach zurück, Waldos Besuch endet damit.
  Ab 3 offenen Tassen meckert Dennis alle 80–130 s (+2) oder
  räumt 2 Tassen selbst weg (+4, DENNIS.tassenSelbst). Jonny/Waldo bringen beim Kommen mit 40 % eine Tasse mit.
  Tassen haben eine unsichtbare größere Klickfläche; im Regal stehen sie nur vorne auf dem mittleren Brett (sonst nicht sichtbar).

## Bad
- Bad (begehbar) hinter der WC-Tür vorne rechts (BAD in world.js, x 0,7–3,9, z 4,0–6,8): Schachbrett-Boden, Fliesen bis 1,4 m,
  Milchglasfenster, Klo (hinten links), Dusche (hinten rechts), Waschbecken mit Spiegel, Waschmaschine + Trockner (vorne rechts).
  WC-Tür offen, nur zu während Dennis drin ist. Bild über dem Klo: assets/bad-bild.jpg (Foto vom Betreiber, Dennis oben ohne mit Handy, Holzrahmen).
  Verstopfung: nach Dennis' Klo einmal pro Spiel mit 30 % Wahrscheinlichkeit; Pömpel steht oben im Regal, in die Hand, aufs Klo
  klicken (Wut -10). Nach 70 s macht Dennis es selbst (+8 Wut).
- Lockencreme „CURL KING“ (Tiegel) auf der Ablage unter dem Spiegel im Bad (daneben Tube und Kamm): in die Hand, auf Dennis
  klicken = er cremt die Locken, Wut -12 (höchstens alle 90 s), Creme kommt zurück aufs Regal.
- Schwarze Latexunterhose hängt an einem Messinghaken an der linken Badwand (zwischen Waschbecken und Klo), Anklicken = Spruch.
- Bad blockiert: steht man im Bad, wenn Dennis zur Klo-Pause an der WC-Tür ankommt, hat er sich eingeschissen: Wut 100,
  sofort Rausschmiss mit eigenem Text (DENNIS.eingeschissen / eingeschissenRaus).
- Verstopftes Klo: große detaillierte Kackwurst schwimmt (Tube mit wechselndem Radius, Risse, Maiskörner, Klopapierfetzen),
  gelbliche unregelmäßige Pfütze davor. Bilderrahmen über dem Klo: Profilrahmen mit Goldleiste, Passepartout, Glasreflex, Nagel.

## Nebenaufgaben und Ereignisse
- Nebenaufgabe 40-Grad-Wäsche (Dennis helfen, freut ihn: Wut -15, bei zu heiß nur -5): Klemmbrett in der Hand, E = übernehmen.
  Dennis kommt, gibt die blaue Einkaufstasche (wie IKEA: gewebte Plane, gelbe Gurtbänder, flache Henkel; darin
  grauer Hoodie mit raushängendem Ärmel, Jeans mit Hosenbein, schwarzes Shirt, Handtuch, rote Socke) mit Wäsche und erklärt in 4 Blasen den Ablauf. Waschmaschine im Bad
  (vorne rechts), Trockner obendrauf, beide mit Anzeige (Restzeit/ENDE) und drehender Trommel.
  Temperatur wählbar 30/40/60/90 (über 40 = Fehler, Dennis merkt es spätestens beim Rausholen). Waschen 50 s, Trocknen 35 s.
  Flusensieb (unten in der Trocknertür, voller Fusseln) ausbauen, am Kompressor (Ecke rechts neben dem Regal, 50-l-Kessel mit
  Motor, Kühlrippen, Manometern, Spiralschlauch und Ausblaspistole) mit Druckluft ausblasen,
  wieder einsetzen. Trockner mit dreckigem Sieb starten = Dennis meckert (+5). Trockene Wäsche zu Dennis bringen.
  In der Aufgabenliste als blaue Nebenaufgaben unter einer Trennlinie (`neben: true`).
- Feuer (Comic-Flammen, Flammenzungen, Glut, Rauch zur Decke; Rußfleck an Decke und Wand wächst und bleibt): einmal pro Spiel (nach dem Flexen bald) brennt der Mülleimer neben der Werkbank, Feuer-Symbol unten rechts,
  Dennis wartet ca. 16 s, bevor er selbst löscht. Vor dem Flexen nur mit
  anderem Grund: Johnny hat seine Kippe reingeschnippt (eigene Sprüche). Dennis ruft (Blase rechts),
  holt den Feuerlöscher (rechte Wand zwischen Schweißplatz und Waschplatz) und löscht selbst, wird sauer. Löscht man selbst: Lob, Wut sinkt. Hält man den Löscher
  und tut nichts, drängelt Dennis (Wut steigt).
- Bitsatz (Nebenaufgabe, wird NICHT angekündigt, muss man selbst finden): offene schwarze Kassette im Regal (mittleres Brett),
  Bits durcheinander. Menü „Bitsatz sortieren“ = Minispiel (12 Bits: Kreuz PH, Pozi PZ, Torx TX, Schlitz je Größe 1–3 per
  Ziehen ins passende Fach, Bits groß gezeichnet, wachsen mit der Fläche), danach ordentlich, Lob, Wut -8, erscheint als erledigte Nebenaufgabe.
- Waldos nasser Akkuschrauber (einmal pro Spiel nach 2,5–4,5 min, nur wenn Jonny nicht da ist): Waldo kommt mit dem Schrauber,
  fragt Dennis, Dennis: „Nicht meine Branche.“ Waldo legt ihn trotzdem auf Dennis' Werkbank, Dennis regt sich auf (+5),
  meckert später bis zu 2-mal. Reparieren (Menü am Schrauber) = Minispiel: 4 Schrauben raus, Wasser mit Lappen wegwischen,
  grüne Akku-Kontakte blank kratzen (Lupe mit zwei Messingzungen voller Grünspan-Krusten, mit gedrückter Maus wegkratzen),
  zuschrauben. Danach Lob, Wut -8. Nebenaufgabe in der Liste. waldo.trage(obj).

## Arbeitsablauf, Minispiele, Note
- Ofen abgeben: fertigen Ofen anklicken = hochheben (HALTUNG ofen), zu Dennis tragen, auf Dennis klicken; er wird neben Dennis
  abgestellt, dann Bewertung. Ohne Ofen in der Hand sagt Dennis „bring ihn her“.
- Restgas NUR DRAUSSEN: Flasche hochheben, rausgehen, auf den Boden klicken (Ort 'draussen', Station draussen vor dem Tor).
  Ventil drinnen aufdrehen = Fehler ventilDrinnen (voll, +30, Dennis rastet aus). Danach zurück zum Waschplatz zum Spülen.
  Aufgabenliste: nach draußen tragen, draußen Ventil auf, zurück zum Waschplatz, spülen, ...
- Gasflasche als Minispiele (minispiele.js, gemeinsamer `spielRahmen`): Restgas = Handrad linksrum drehen (ventilSpiel,
  Manometer läuft runter, zu schnell = Fehler ventilSchnell), Spülen = bis zur gelben Markierung füllen (halten), schütteln
  (A/D bzw. links/rechts tippen), Flasche nach rechts umkippen (ziehen), Anzeichnen = gestrichelte Tür mit dem Edding
  nachfahren (Genauigkeit z.anzeichnenQ, unter 50 % Fehler, ab 90 % Lob, Wegwischen-Knopf), Lackieren = mit der Sprühdose
  über den Ofen (gezeichnet wie gebaut: stehende rote Gasflasche mit Kuppeln, Halsring, langem Ofenrohr, Fußring mit drei
  schrägen Beinen, Tragegriffen, Tür unten mit Scharnieren und Holzgriff) fahren bis 95 % schwarz (zu lange auf einer Stelle = Lacknase, z.lackQ, ab 3 Nasen Fehler, ohne Nasen Lob).
  Schweißgerät einstellen und Tragen bleiben wie bisher (Betreiber-Wahl A, B, C, E).
- Note: Arbeit (Verarbeitung = Mittel aus Anzeichnen, Schnitt, Nähten, Lack) max. 75 Punkte + Dennis' Laune max. 25 (100 minus Mittel aus höchster Wut und Wut am Ende)
  - 1,5 je Fehler (max. 15) - Werkstatt (dreckig 4, Dennis gefegt 2). Note 1 ab 85, 2 ab 72, 3 ab 58, 4 ab 45, 5 ab 30.
  Die Aufschlüsselung steht im Ende-Fenster.

## Hand-System und Steuerung
- Hand-System (`js/hand.js`): Werkzeug, Ausrüstung, Feuerlöscher, Besen, Figur, Handy kann man aufheben (Hand im Bild),
  auf ebene Flächen legen (Klick), fallen lassen (G), werfen (Q), benutzen/anziehen (E). Leiste unten zeigt, was man hält.
  Edding/Flex/Hammer müssen in der Hand sein zum Anzeichnen/Schneiden/Schlacke. Gasflasche: „Hochheben“, langsamer gehen,
  per Klick auf Werkbank/Schweißtisch/Waschplatz abstellen. Ausrüstung im HUD anklicken = abnehmen (in die Hand).
  Reaktionen: Werfen (Ermahnung), Dennis treffen (Ausraster), Figur anfassen/werfen, Handy (1. Mal Blase + stimme/hand.handy.mp3,
  danach Wut + stimme/hand.handyNochmal.mp3, Ton aus handy1/handy2.MOV),
  Löscher auf Dennis (Ausraster), Löscher sinnlos (Ermahnung), laufende Flex auf Dennis (sauer).
- Umschauen am Computer (Paket A, 30.10., neuer Betreiber-Wunsch I38, ersetzt das frühere Rand-Drehen): Pointer Lock. Klick ins Bild
  fängt die Maus (dieser Klick benutzt nichts), Zeiger unsichtbar, Punkt in der Mitte; Mausbewegung dreht (0,0024 rad/px), Klick =
  benutzen, was in der Bildmitte ist (treffer(mitte)), Name der Sache in der Mitte als Hover-Name. Öffnet sich ein Menü/Dialog/
  Minispiel/Dennis-Fenster (fensterOffen), wird die Maus freigegeben; der nächste Klick auf einen Knopf fängt sie wieder (wiederFangen,
  click-Listener im Capture). Esc ist kein Bedienelement mehr (Browser gibt frei, nächster Klick ins Bild fängt wieder).
  P1 (1.11.): Rechtsklick wechselt Umschauen <-> Cursor (cursorModus in steuerung.js: Maus frei, Hover/Klick an der Zeigerposition,
  Ziehen dreht wie früher); im Cursor-Modus fängt kein Linksklick. Beim Öffnen eines Fensters wird freigegeben, danach nur im
  Umschauen-Modus wieder gefangen. Rechtsklick bei offenem Fenster/Minispiel wirkt nicht. Kein Browser-Kontextmenü auf dem Bild.
  Touch: Wischen wie bisher.

## Jonny
- Jonny (js/jonny.js, nach Fotos): so groß wie Dennis, etwas breiter, lange braune Haare, Vollbart, grüne Cap mit Schirm nach
  vorn, runde goldene Brille (kein Nasenring), weißes KURZärmliges Hemd oben offen bis zur Brustmitte, darunter zugeknöpft (Brust und Hals durchgehend, Haare nur
  auf der Brust, Hals ohne Haare), hellbraune Cord-Weste eng an Brust und Schultern bis an den Hals, Hemd/Weste/Körper als
  saubere Hüllen (`huelle`, `aufHuelle` in jonny.js, R(y)/T(y) = Rumpfform), große Hände (dicke Finger mit zwei Gliedern, Nägel, Daumen), Arme richtig verschränkt (links unten, rechts darüber),
  kein Gürtel, dünner, flacher Bauch, sehr kurze schwarze Arbeitshose mit
  Zollstock und Stift, weiße Socken, grüne Sneaker, goldener Ring. Kann laufen (gehZu). Heim: Tor-Ecke (0,45 | 3,2).
- Hosenstall leicht offen, das dicke, runde Ende einer alten Möhre guckt schräg nach unten raus (Farbe Leberwurst, unrund,
  Furchen, Härchen; Betreiber 3.11.). Nur Jonny (`A.moehre`, Torben/Kumpels nicht).
  Bier: Flasche in der linken Faust (Finger um den Flaschenbauch, offene Finger ausgeblendet), Trinkzug alle 5 s weich zum Mund
  (BIER_UNTEN/BIER_MUND in jonny.js, per Suche bestimmt, Kopf geht leicht in den Nacken, guckt dabei geradeaus).
  Verhalten (spiel.js, Objekt jz): raucht zwischendurch; holt sich alle 70–130 s ein Bier aus dem Kühlschrank (oder lässt sich
  über das Menü sofort überreden), trinkt, lässt leere Flasche liegen (anklicken = wegräumen, Wut -2); Dennis nervt das (+3).
  Ab 4 Bier: Sodbrennen, geht nach Hause (durchs Tor, weg für den Rest des Spiels); vorher mit 15 % pinkelt er in den Ofen
  (Dennis +10). Kitzelt Dennis alle 2–3,5 min (Dennis: Ton stimme/aergern-2.mp3 = ärgernleicht2, schickt ihn weg, +4).
  Einmal pro Spiel will er die Leiter abholen: stellt sich drunter, Spieler klickt die Leiter = runterholen (Leiter weg, Wut -10,
  Dennis jubelt), sonst nach 45 s „nächste Woche“. Störenfried: kommt zum Spieler an Werkbank/Schweißplatz und quatscht;
  „Antworten“ = Fehler (+5, Dennis sauer), ignorieren/15 s warten = Jonny beleidigt. aerger(n) = Wut ohne Fehler, max. 99.
  Jonny geht alle 2–3,5 min raus (Camper/Kiosk, jonnyRaus/jonnyRein, jz.draussen) und kommt nach 70–130 s wieder.
  Am Spielanfang ist Jonny NICHT da, er kommt nach 50–100 s rein (JONNY.hallo); beim ersten Besuch trinkt er kein Bier
  (jz.ersterBesuch, Überreden = „später“). Raucht er, hustet Dennis bis zu 2-mal extra laut (audio.js `husten`, DENNIS.husten,
  Wut +3 je Husten).
  Jonny und Waldo sind selten gleichzeitig da: Waldo kommt meist nur, wenn Jonny draußen ist (85 %), Jonny kommt erst
  zurück, wenn Waldo weg ist (85 %), und geht nicht raus, solange Waldo da ist. Kippen-Feuer nur, wenn Jonny da ist.

## Waldo
- Waldo (js/waldo.js, nach Fotos): kleiner (Skala 0,85), breit, Gesicht länglich mit hoher Stirn (Cap weit hinten), im Profil mit Tiefe
  (Schädel tiefer, kräftiger Brauenbogen, Nase steht deutlich vor, Bart/Kinn/Schnurrbart weiter vorn), gerade
  dicke Brauen dicht über den Augen, leicht tiefliegende graubraune Augen mit Lidern, lange gerade Nase mit runder Spitze,
  Bart beginnt hoch auf den Wangen (keine Bartbüschel-Kugeln mehr), große Hände (Fingerglieder, Nägel, Daumen). Handy mit
  beiden Händen vor der Brust, Bildschirm zu den Augen gedreht (lookAt), Kopf gesenkt, Daumen wischt, Feed scrollt
  (HANDY_R/HANDY_L per Suche bestimmt). Kurze dunkle Haare (ganzer Hinterkopf bis Nacken, gehen hinter
  den Ohren und über die Koteletten nahtlos in den Bart über, gleiche Farbe/Textur), langer voller braun-dunkler Vollbart mit
  vielen Essensresten (Krümel, Salat, Tomate, Käse, Sesam, Mayo), beige Cap, dunkelroter Pulli OHNE Logo mit geradem Saum
  (Betreiber), weite, lockere kurze graue Jogginghose mit ZWEI getrennten, leicht nach außen gestellten Hosenbeinen und runder Schrittpartie
  ohne Querstrich (sah sonst wie ein Rock aus), meliert, viele Löcher mit Fäden, Risse, Fransen, sauberer gerippter
  Gummibund direkt unter dem Pulli, KEIN Gürtel, Kordel, Taschen, Flecken), breite Beine OHNE Haare mit Knie und Wade,
  weiße Söckchen, beige Sneaker. Sitzt normal nach vorn (Sofa: z 3,42, Höhe 0,52; Träger: z 3,36, Höhe 0,57), Oberschenkel
  leicht abfallend, Füße auf dem Boden (Neigung aus der Sitzhöhe berechnet).
  Anfangs NICHT da. Besuch alle 1,5–3 min: kommt durchs Tor, stellt sich hin (Handy) oder setzt sich aufs Sofa / auf die
  Stahlträger und guckt aufs Handy, bleibt 50–90 s. Dennis mag keinen Besuch (+3 beim Kommen, alle 30–50 s Gemecker +2).
  Menü: Quatschen, Krümel, „Sagen, dass Dennis keinen Besuch will“ (geht, Wut -4). Sofa-Streit: sitzt Waldo zur Mittagspause
  auf dem Sofa, streiten Dennis und Waldo (bis 3 Runden); Klick auf Waldo = „Streit schlichten“ (Waldo geht, Wut -6, Dennis
  dankt), sonst wirft Dennis ihn raus (+8). Danach geht die Mittagspause normal weiter.
  Kackepumpe (einmal pro Spiel, 70 %): rennt rein, Tank im Garten voll; Dennis und Waldo suchen hektisch (Regal, Werkbank),
  finden sie hinter dem Kompressor (blaue Tauchpumpe), Waldo rennt raus. Spieler ist solange kurz blockiert.
  Pumpe zurück: 100–160 s später bringt Waldo sie dreckig zurück (Güllekleckse, Pfütze, grüne Stinkewolken, Fliegen) und
  stellt sie mitten in den Weg (-0,7 | 0,9). Spieler: in die Hand (Menü Kackepumpe), im Bad in der Dusche oder am Waschbecken
  abwaschen (Klick oder E, Halten-Dialog), dann Klick auf den Kompressor = zurückstellen (Wut -8, Lob). Dreckig hinstellen
  geht nicht (Dennis meckert). Nach 50 s meckert Dennis (+3), nach 120 s macht er es selbst (+8). wz.pumpe: daheim | weg |
  imWeg | sauber | zurueck.

## Torben und Platzhalter-Kumpels
- Torben (js/torben.js): VORLÄUFIGE Figur (Aussehen kommt noch vom Betreiber), gleiches Grundgerüst wie Jonny (baueJonny mit
  opts.aussehen: kurze dunkelblonde Haare, Stoppelbart, keine Brille/Cap/Brusthaar, orange Weste, blaue Hose). Kommt alle
  2,5–4 min zu Fuß den Feldweg hoch, steht beim Hoflader (5,6 | 6,2), fährt 1–2 Mal, geht nach 2–3 min wieder. Menü: Quatschen,
  „Lieb fragen: Jeep entdrosseln?“. Texte in TORBEN (texte.js), Sprechblase ui.torbenSagt.
- Platzhalter-Kumpels (js/kumpels.js): Uwe, Steffen, Jonas, David, Joel – noch OHNE Aufgabe, im Spiel unsichtbar (Ausnahme:
  wer Spüldienst hat, kommt ab und zu vorbei). Vorläufiges
  Aussehen (baueJonny mit eigenen Farben/Merkmalen), echtes Aussehen kommt vom Betreiber. Ansehen: Seite mit ?kumpels öffnen,
  dann stehen alle draußen in einer Reihe (z 9). Anklicken: „Platzhalter. Hat noch keinen Job im Spiel.“

## Draußen: Hof, Gebäude
- Draußen (js/draussen.js, `baueDraussen`): rotes Backsteingebäude mit flachem Satteldach aus schwarzem Wellblech (Giebel vorne/
  hinten, Regenrinnen, Fallrohre), Bad als Anbau mit flachem Dach und Milchglasfenster, Fenster links außen. Kaputte Betonfläche
  vor der Werkstatt (Fugen, Risse mit Unkraut, ausgebrochene Stellen mit Schotter, lose Brocken), Wiese, Bäume, Horizont
  (Hügel + Waldrand), Himmel mit Wolken (Kamera-Sichtweite 1500, Nebel ab 260 m, siehe Landschaft). Mülltonnen (grau, blau, braun, detailliert, OHNE
  Schilder, Müllsack daneben) links vom Tor, kein großes Fassadenschild mehr, roter Hoflader OHNE Logo/Schrift (detailliert:
  Kühlergrill, Gegengewicht, Knicklenkung, Kabine mit Sitz/Joystick, Rundumleuchte, Stollenreifen, Hubzylinder) mit Palettengabel
  im Carport hinterm Haus (Paket E2a, früher rechts neben der Werkstatt), rosa Mini-Jeep (Wrangler-Look, ohne Dach, Elektro-Kinderauto), Feuerschale (flach, graue Asche mit Häufchen, verkohlte Holzreste) mit Dreibein, Kette,
  rundem Grillrost und alter schwarzer Bratwurst. Begehbar: draußen überall innerhalb der Ringstraße (imKreis in landschaft.js),
  in die Werkstatt nur durch die Schlupftür, Bad-Anbau ausgespart. Würfe draußen prallen an der Hauswand und am Geländerand ab
  (hand.js AUSSEN = GELAENDE).

## Platz hinten (Paket E2a)
- js/platzhinten.js (`bauePlatzHinten`, aus draussen.js aufgerufen): Schotterfläche als ein Umriss (SCHOTTER_UMRISS) mit
  organischen Rändern und weichem Übergang (lose, durchsichtige Schotterflecken, kleine Grasbüschel). Läuft rechts am Haus
  entlang (wo früher der Hoflader parkte) bis an die Betonplatte vorne (dort kann man langfahren), hinterm Haus über
  Schrottplatz und Carport; neben dem Carport auf der Wohnwagen-Seite kein Schotter. Festgefahrene Spuren zum Carport.
- Carport (CARPORT x -6 … -1,4, z -21,6 … -11,1) hinter der Werkstatt, dazwischen der Schrottplatz (Reihenfolge vom Haus weg:
  Werkstatt, Schrottplatz, Carport; Betreiber 9.11.). Längs gestellt, offen zur Seite (Welt +x, Schilder dort) und nach
  hinten, Schotterboden (kein Beton). Holzpfosten auf Stahl-Pfostenträgern, Pfetten, Sparren, Wellplatten-Dach (vorne hoch,
  hinten tief, liegt auf den Sparren), Stirnbrett, Regenrinne mit Fallrohr, Kopfbänder vorne und hinten, Lampe mit Kabel,
  Radstopper nur in der Paletten-Bucht (in der Weidemann-Bucht stieß die Gabel daran), Ölfleck. Schilder hängen an Ketten unter der Pfette. Buchten vom Haus weg:
  PALETTEN, PRITSCHE (ganz leer, dort muss man später durchfahren können, E2b), WEIDEMANN. Herumliegender Kram (nicht in der
  Pritschen-Bucht): 2 Tassen (eine auf dem Palettenstapel), leere Bierflasche, Farbdosen (eine umgekippt, Pfütze), Autobatterie,
  ein schwarzes Verlängerungskabel in Schlaufen (Stecker, Kupplung mit Klappdeckel), Farbdosen mit Etikett, Falz, Läufern und Pinsel. Liegende Teile werden beim Hinlegen angehoben, bis sie aufliegen (legen()). WEIDEMANN (BUCHTEN, CARPORT_PFOSTEN). Der Gang von der Hintertür endet vorne am Carport.
  Anklickbar: Schild Paletten (palettenSchild), Dach (carportHinten), Schrotthaufen (schrott), Gitterboxen (gitterbox).
- Hoflader steht zu Spielbeginn vorwärts eingeparkt in der Bucht „Weidemann“ (Schnauze nach hinten). Figuren setzen erst
  rückwärts heraus (fz.rueckwaerts, fahrten.js LADER_RUECK, Heck schwenkt nach hinten), fahren dann vorwärts zum Weg rechts
  am Haus (LADER_RAUS); zurück denselben Weg und vorwärts in die Bucht (LADER_REIN + mitAnfahrt).
- Paletten: alter Platz (x -1, z -7) samt freistehendem Schild ist weg. Die beiden Stapel vom alten Platz neben der Werkstatt
  (3er und einzelne) stehen jetzt in der Bucht „Paletten“; PALETTEN_PLATZ = diese Bucht. Was am Start schon dort steht, zählt
  nicht als gebracht (z.palettenRekord wird beim Start gesetzt).
- Schrottplatz zwischen Werkstatt und Carport (SCHROTT_KAESTEN, Hindernisse für Spieler, Fahrzeuge und Wege), dicht gehäuft,
  nur Metall (keine Erde): Haufen mit Kern aus zerdrückten Blechkisten, darauf Bleche, Rohre, Vierkant, Träger, Winkel,
  Baustahlgitter, Töpfe, Pfannen, Grillroste, rostiges Werkzeug (kleinteil()); Kleinkram am Fuß. Gitterboxen randvoll mit
  Kleinteilen (Schrauben mit Sechskantkopf, Muttern, Scheiben, Federn, Kugellager, Zahnräder, Winkel, Scharniere, Ketten; eine
  gestapelt; größere Einzelteile wie Zahnräder, Flansche, Wellen, Winkel, Ketten, Lager, Zwingen, keine durchgehende Füllung),
  eine Gitterbox nur mit schwarzen, rostigen Stahlfelgen (fest neben der Hintertür) und eine voller Autofedern, chaotisch drin. Kaputter Betonmischer
  (hohle Trommel mit Tiefe, innen Betonkruste und Schrott, Zahnkranz, Kipphebel, Handrad, Motor ausgebaut, ein Rad fehlt, Ziegel),
  umgefallener Standventilator (Flügel ab), Mofa ohne Motor (Kabelreste), Felgen- und Altreifenstapel, kaputte Fahrräder (Lenker
  mit Vorbau, Griffen, Bremshebeln, Klingel), Satellitenschüssel, Gasflaschen, Heizkörper, Waschmaschine, Autotüren, Motorblock,
  Badewanne, Motorhaube, Auspuff, kleine Bleche, Nummernschild („DE-NN 77“), kleiner Schraubenhaufen. Anklickbar: schrott,
  gitterbox, betonmischer, ventilator, mofa, schrauben, stepper (weißer Stepper, kaputt: Pedal ab, Lenker verbogen, Display
  gesprungen), treckerreifen (1,6 m), kicker (kaputter Tischkicker). Haufen aus erkennbaren Teilen mit Rost-Struktur (hohle
  Rohre, Doppel-T, U, Winkel, Vierkantrohr, Bleche, Kantbleche, plattgedrückte Fässer), ein Teil schwarz. Reifen mit Querschnitt
  und Profil (reifen()). Grundfläche abgerundet (Superellipse in den Schrott-Kästen).
  Belegung (platziere): jedes Teil hat einen Prüfkasten; große Teile suchen einen freien Platz, Haufen- und Gitterbox-Teile
  schichten sich auf; nicht ganz streng (Prüfkasten verkleinert, Teile sinken etwas ein, Betreiber-Wunsch). Danach werden die
  Teile jedes Gegenstands zu wenigen Meshes zusammengefasst (zusammenfassen(), Leistung: ca. 2.900 statt 7.100 Zeichenaufrufe). Freier Gang von der Hintertür (x ≈ -2,9) bis vorne ans Carport.
- Blauer 20-Fuß-Container (CONTAINER x -1,6 … 4,46, z -6,6 … -4,1) Rücken an Rücken an der Rückwand, von hinten gesehen links
  neben der Hintertür (Gang bleibt frei). Längsseite zum Hof ganz offen. Innen an der Rückwand drei gelbe Fachbodenregale
  (Kisten mit Schraubenschlüsseln, Vierzylinder-Motor, Hinterachse, Kanister, Ölflaschen), davor ein Kragarmregal mit den
  Metalllängen (5,85 m: Doppel-T, Vierkant, Rundrohre, Flachstahl). Noch ohne Funktion (später Metall einladen). Anklickbar
  (container), Hindernis, in wege.js.
  Vor der offenen Seite liegt kein Schrott (frei für später).
- Hintertür (HINTERTUER x -3,45 … -2,35, 2,15 m): grüne Brettertür an der Rückwand, steht offen nach draußen; dort hing früher der
  Hula-Hoop. Reifen hängt jetzt an der rechten Wand zwischen Erste-Hilfe-Kasten und Spüle (HULA_WAND_Z, HULA_PLATZ).
  wege.js: Ziele hinterm Haus (z < -3,5) gehen durch die Hintertür, sonst durchs Tor; Figuren zum Hoflader laufen selbst
  dorthin (kein fester Weg durchs Tor mehr). Testmenü T94: vor die Hintertür springen.

## Carport, Wohnwagen, Benz
- Dennis' Wohnwagen (js/carport.js, `baueCarport`): links auf der Wiese neben der Betonfläche unter einer Eiche ein großes Carport
  (Holz, Wellplatten-Dach) mit Wohnwagen (Deichsel zur Werkstatt hin), kleiner Holzterrasse OHNE Geländer (kleines altes
  Zweisitzer-Sofa mit Decke und Kissen, Bierkiste als Tisch, Aschenbecher), Lichterkette davor. Auf dem
  Carport-Dach alte blaue Turnmatten mit Gehwegplatten beschwert (gegen Eicheln-Lärm), Eicheln im Gras. SEITLICH am großen
  Carport (gegenüber der Terrasse) ein schief angebautes kleines Carport mit blauer Plane als Dach (Loch drin), darunter Dennis'
  weißer Mercedes W123 (detailliert: Radläufe, Radkappen, Türfugen, Chromleisten, Spiegel, Wischer, geriffelte Rückleuchten,
  Kennzeichen, Auspuff, Antenne; Details siehe Paket B) mit Gehwegplatte IN der Motorhaube (Delle, Risse). Eine Turnmatte liegt heruntergeweht im Gras. Geschichte: heute Nacht um 4 bei
  Wind passiert, deshalb ist Dennis heute gereizt (Wut startet bei 15, Begrüßung erwähnt es). Anklicken: Benz (Dennis stöhnt,
  DENNIS.benz), Wohnwagen, Carport, Turnmatte.

## Fahrzeuge
- Fahrzeuge (js/fahrzeuge.js Physik/Paletten, js/fahrten.js Spiel-Logik): Mini-Jeep und Hoflader sind fahrbar (Klick = Einsteigen
  und fahren, Hände müssen frei sein). Steuerung: W/S fahren, A/D lenken bzw. knicken, R/F Gabel hoch/runter, Leertaste hupen,
  E aussteigen (Fahrhilfe oben eingeblendet). Kamera sitzt im Fahrerhaus und dreht mit. Nur Computer (keine Touch-Knöpfe).
  Jeep: Elektromotor, gedrosselt Schritttempo (1,4 m/s); Torben lieb fragen (Menü an Torben) = entdrosselt (11 m/s).
  Hoflader nach Fotos vom Weidemann 1280 (ohne Schriftzug): Knicklenker (Gelenk z = 0, Formel Knicklenkung), Hinterwagen mit
  runder roter Motorhaube und schwarzen Lüftungsfenstern, Kabine auf dem Hinterwagen (grauer Rahmen, rundum Glas, Dach 2,25 m,
  Sitz 1,05 m, Arbeitsscheinwerfer), schwarze Kotflügel, graue Felgen; Vorderwagen mit Turm (etwas rechts), roter geknickter
  Hubarm, graue Hub- und Kippzylinder, die sich mitbewegen (hydraulik()), Schnellwechsler mit Gabelträger und kurzen Zinken
  (0,8 m, x ±0,2). Gabel bleibt beim Heben waagerecht.
  Mini-Jeep: großes Spaßauto (1,9 × 1,06 m), offene Wanne mit Fußraum, zwei Schalensitze, Armaturenbrett, Lenkrad links,
  Überrollbügel (ohne seitliche Schrägstangen), Scheibe, runde Kotflügel, KEINE Trittbretter, Reserverad, Kennzeichen „PINK 1“. Abgeschlossen-Logik vorbereitet: LADER_SCHLUESSEL_STECKT in fahrten.js (zum Testen true;
  später gibt Dennis den Schlüssel raus, wenn man etwas damit erledigen muss, sonst DENNIS.weidemannZu).
  Europaletten (3er-Stapel und einzelne im Hof) mit der Gabel aufnehmen (Zinken rein, heben), herumfahren, absetzen (auch stapeln).
  Fahrbar: überall innerhalb der Ringstraße und auf ihr (draussen.fahrbar), nicht in die Werkstatt, nicht durch die Schlupftür.
  Figuren fahren auf festen, weichen Bahnen (fahreRoute, Catmull-Rom), Parkplätze mit Anfahrt (mitAnfahrt). Alle 2–3,5 min dreht
  Jonny oder Waldo eine Runde (Jonny auch mal weg zum Kiosk und zurück). Fahrstile: Jonny normal, Waldo langsam und schlingernd
  (Handy), Torben rasant (Jeep 7 m/s) und rumst mit dem Hoflader gegen den Grill (Feuerschale kippt um) oder die Mülltonnen.
  Grill um: Feuerschale anklicken = wieder aufstellen (Wut -6, Lob), sonst stellt Dennis ihn nach 75 s selbst auf (+8).
  In Dennis' Augen fahren alle lebensgefährlich (DENNIS.fahrenSpieler/fahrenAndere, +1 bis +2 Wut, anstoss bei Rums).

## Paket B (draußen/Fahrzeuge, Benz-Neubau)
- Paket B (draußen/Fahrzeuge): Gelände viel größer (GELAENDE in draussen.js: x -25…13, z -9…17, rund ums Haus, um Carport,
  Wohnwagen und Benz; Bäume und Carport-Teile als einzelne Hindernisse). Feldweg = Band entlang einer Kurve (FELDWEG-Punkte,
  schließt rechts an die Betonfläche an), alle Wege der Figuren/Fahrzeuge/Segway folgen ihm. Fenster links: echtes Loch in Innen-
  und Außenwand (Laibung), Glas durchsichtig. Müllsack als Sack (Lathe mit Beulen, Knoten). Weidemann: runde Motorhaube hinten
  (Extrude-Profil), rundes Heck-Gegengewicht. Jeep: runder (rundQuader in toon.js, Kotflügel als Bögen), ohne seitliche Schrägstangen und
  ohne Trittbretter, rosa Karosserie mit Bodenfreiheit (ab 0,2 m), darunter schmale dunkle Bodenwanne (Füße gucken nicht raus), entdrosselt 11 m/s mit ca. 1,5 s Beschleunigung. Hupen: audio.js `hupe`
  (Jeep „möp möp“, Lader Doppelton-Tellerhupe). E neben einem Fahrzeug (Hände frei) = einsteigen. Aussteigen mit Abstand zum eigenen Fahrzeug,
  aus zu engen Stellen kann man sich immer herausbewegen. Fahrzeuge haben gedrehte Hindernis-Kästen (inHindernis, boxen), dadurch
  kommt man dicht vorbei und durch Lücken. Paletten: niedrig (Fußgänger laufen drüber, Augenhöhe steigt), der Lader nimmt ganze
  Stapel (bis 5) auf und setzt sie zusammen ab. Lader schiebt den Jeep (wenn Platz) und hebt ihn mit der Gabel an, auch mit Fahrer
  (Fahrt der Figur endet dann, sie parkt neu ein; DENNIS.jeepHoch, *.angehoben). Spieler fährt Grill um (wie Torben) oder die
  Mülltonnen (kippen, Müll liegt rum; Klick = aufstellen, Wut -4, sonst Dennis nach 75 s, +8; DENNIS.tonnen*).
  Benz: andersrum (Front zur Werkstatt), runder, Kennzeichen „SE XY 238H“ (H-Kennzeichen, Plaketten statt Bindestrich), Auspuff
  komplett (Rohr, Mitteltopf, Endtopf, Halter), tiefer Kofferraum (Teppich, Verkleidung, Radkästen, Dichtung, Ersatzrad,
  Warndreieck, Verbandskasten, Schwanenhals-Scharniere; Deckel per Klick auf/zu, welt.carport.kofferraum). Darin Kettenhemd
  (DENNIS.kettenhemd) und Peitsche (aufnehmbar, E = knallen, audio `peitschenKnall`; auf Dennis klicken = jagen: er schlägt
  Haken, 1.–2. Mal Spaß Wut -6, zu oft/innerhalb 60 s/ab Wut 55: +8, DENNIS.peitsche.*). Deichsel detailliert (Haube, Faltenbalg,
  Kupplung mit Griff, Handbremse, Abreißseil, Spiralkabel, Stützrad mit Kurbel, Gaskasten). Bierkasten mit Griffmulden, Rippen,
  Etikett, 17 Flaschen, Brettchen mit Aschenbecher und offener Flasche.
  Nachbesserungen: Jeep-Karosserie mit Bodenfreiheit (Wagenboden 0,2 m, Sitz 0,7 m, keine schwarze Platte drunter, Füße bleiben
  im Wagen). Benz-Kabine nach Fotos vom W123 neu (Seitenprofil-Glashaus, schräge Front-/Heckscheibe, A-/B-/C-Säulen, Dreiecksfenster,
  Chromrahmen). Müll: muellTeil(art) in draussen.js (Bananenschale, Pizzakarton, Dose, Flasche, Chipstüte, Becher, Zeitung,
  Karton), ein paar liegen immer bei den Tonnen, beim Umfahren viel mehr. Heruntergewehte Turnmatte liegt flach im Gras an der
  Rückseite vom Carport (begeh- und befahrbar).
  Benz komplett neu nach den W123-Fotos des Betreibers: Seitenprofil-Karosserie (profilKoerper in carport.js: Kern + zwei Schalen
  mit sauber ausgeschnittenen weißen Radläufen, Kanten abgerundet), langes Dach, Scheiben durchsichtig wie die Werkstattfenster,
  Innenraum mit dunkelblauen Sitzen, Armaturenbrett, Lenkrad; Haube und Kofferraumdeckel flach (keine Wulst), dünne schwarze
  Seitenleiste mit Chrom, W123-Scheinwerfer (kräftiger Chromrand, helle Streuscheibe mit Reflektoren als Textur, Blinker um die Ecke), Rückleuchten flach (eine geriffelte Textur-Fläche rot/orange/weiß/rot mit Chromrahmen), keine Nebelscheinwerfer,
  Kennzeichen vorne auf Halter unter der Stoßstange. Haube = eigenes Blech mit Delle, zackigem Loch, Blechlappen, Knicken,
  abgeplatztem Lack, Motorraum darunter; Gehwegplatte steckt drin, abgebrochene Ecke daneben. Plane: verblichen mit Gewebe-
  textur, ums Loch runtergedrückt, eingerissen (Schlitze), lange verdrehte Fetzen und Fäden. Bananenschale realistisch (4 Lappen
  außen gelb mit Flecken, innen creme). Wohnwagen-Korpus rund (Profil mit runden Ecken, Kanten gefast). Rumliegenden Müll an den
  Tonnen kann man aufheben (Wut -2, DENNIS.muellAufgehoben), nach 3–5 min liegt wieder was rum.

## Landschaft
- Landschaft (js/landschaft.js, `baueLandschaft`, aus draussen.js aufgerufen): Ringstraße RING (Mitte -110|20, Radius 245,
  7,5 m breit, Leitpfosten alle 50 m, Bäume am Rand; entdrosselter Jeep ca. 2,3 min pro Runde). Innerhalb des Rings überall
  begeh-/befahrbar (imKreis), außen nur ca. 5 m hinter die Straße. Gelände mit Hügeln (gelaendeHoehe/HUEGEL, flach an Werkstatt,
  Feldweg, Hof, T5); Kamera, Würfe und Fahrzeuge (Höhe + Neigung) folgen dem Boden. Feldweg (FELDWEG, jetzt in landschaft.js) läuft in
  Kurven ca. 130 m bis zur Hauptstraße, Büsche/Bäume am Rand. Am Ende: Dennis' Briefkasten (Post: Werbung, Mahnung, Karte von
  Lydia) und Schilder „DENNIS REICH – Kein Zutritt!“, „(Fahrradfahrer werden geduldet)“, „Privatweg“, „Vorsicht! Freilaufender
  Dennis“ (beidseitig lesbar). Lühmanns Hof (HOF) am Straßenrand: Schotterparkplatz, SB-Laden (Holzhütte, begehbar: Regal mit
  Landeiern, Kühlschrank mit Mettenden, Tisch mit Anschreibeliste und Vertrauenskasse) – nehmen = anschreiben (z.angeschrieben),
  in die Hand (HALTUNG eier/mettenden), Dennis bringen = Wut -8 (höchstens alle 90 s, DENNIS.einkauf.*). Peters Kühe (4, grasen und
  laufen, Gehege mit Holzzaun, Raufe, Trog, Schild) und grünes Hühnermobil (Satteldach, Räder, Legenester, Rampe) mit 9 Hühnern im
  Netzzaun. Schilder „Lühmanns Landeier“ mit Pfeil an der Straße. Umgekippter VW T5 Doppelkabine mit Pritsche (T5, innen am Ring,
  liegt auf der Seite; Kabine hellgrau, Alu-Bordwände mit Sicken, Werkzeugkiste, VW-Logo, Heckträger mit Leuchten, Stahlfelgen),
  Scherben, geschlängelte Reifenspuren von der Straße durch die Wiese. Himmel/Horizont/Nebel für die große Sichtweite (Kamera 1500).

## Paket A (Bugliste Projektchat)
- Paket G Paletten (Projektchat 30.10., I53): 6 zusätzliche einzelne Paletten verstreut auf dem Hof (fahrzeuge.js), Palettenplatz
  hinter der Werkstatt (PALETTEN_PLATZ x -1, z -7, ±2,0/±1,5 m) mit Schild „PALETTEN“ (Vorderseite vom Haus weg, anklickbar
  'palettenSchild': zeigt den Stand). Mit dem Hoflader dort abgesetzt (Gabel-Ereignis abgesetzt) zählt fahrten.palettenGezaehlt:
  je neue Palette Wut -3, Hinweis „x von 12“, Lob beim ersten und jeder 3.; alle 12 = großes Lob, Wut -8. Note: je gestapelte
  Palette 1 Punkt, höchstens 6 (Gesamt höchstens 100). Tipp beim ersten Einsteigen in den Hoflader.
- Paket H Hintergrundgeräusche (Projektchat 30.10., I55): audio.js `umweltUpdate(dt, s)` (5x pro Sekunde aus main.js): alles live erzeugt,
  nach Entfernung und Richtung (Stereo-Panner nach Blickrichtung) geregelt, in der Werkstatt auf 30 %, im Bad 15 %. Vögel: überall,
  vier Rufe (tschilp, Triller, Amsel-Pfiff, Meise), alle 0,6–4 s. Diesel: tuckernder Sägezahn mit Zylindertakt am Hoflader, hörbar bis 16 m,
  im Hoflader selbst konstant, Drehzahl steigt mit der Geschwindigkeit. E-Motor: Heulton des Jeeps, nur in Bewegung, Tonhöhe nach Tempo.
  Hühner: Gluck-Folgen und gelegentliches „Gaaack“ vom Hühnermobil (bis 40 m). Kühe: Muh bei Peter (bis 55 m, alle 9–23 s).
  Lautstärkeregler (Master) gilt für alles. Im Test nur gemessen (Pegel), nicht gehört.
  P2 (1.11.): Werkstattgeräusche (Flex, Schweißen, Techno-Musik, Klospülung) laufen über den Bus `werk` (audio.js, `werkLautstaerke` aus
  `umweltUpdate`): draußen ab 3 m leiser (quadratisch), über 12 m Entfernung von der Werkstatt stumm; Klonken (spiel.js `werkstattLaut`) gleich.
  Während eines Ausraster-Videos (auftritt mit Clip, Stufe voll) sind alle Spielgeräusche aus (`spielTonStumm`), nur der Videoton läuft;
  laufende Dennis-Sätze werden vorher ausgeblendet. Dennis spricht nie zwei Aufnahmen gleichzeitig: `stimmeAbspielen` blendet eine alte
  Dennis-Stimme aus, Gemurmel (`ortsTon`, `nurWennStill`) startet nur, wenn niemand spricht; Klospülung ist Gruppe 'effekt'.
  Nicht abgedeckt: Gebrabbel (`brummeln`) ohne Aufnahme überlappt nicht geprüft.
  B3 (Entscheidung Betreiber 1.11.): Tanzen macht nicht automatisch wütender, ist aber kein Schlupfloch: `normalOderTanzt()` (spiel.js)
  für Wut-Quellen mit Zustandsabfrage (Jonnys Bier, Akkuschrauber-Mecker, Waldo-Mecker, Dreck/Fegen), und beim Tanzen unterbricht jeder
  Satz mit prio > 0 das Tanzen (statt wegzufallen). Früher (Doku): Tanzen hatte keinen Wut-Effekt, Tanzen hat keinen Wut-Effekt (Wut sinkt normal); Ärger gibt es nur,
  wenn Musik in der Mittagspause angeht oder er sie ausgemacht hat und man sie wieder anmacht. Nicht geändert, Entscheidung beim Betreiber.
- Paket F Hofladen und Essen (Projektchat 30.10., I46/I48/I54, Vorschau): Peters Kühlschrank im SB-Laden (landschaft.js) hat eine Tür (Klick:
  „Tür öffnen“, schwenkt auf, Innenlicht), vier Gitterregale wie in der Werkstatt, unten Käse (4 Keile + Laib im roten Wachs), darüber
  Mettenden; offen: „Mettenden nehmen“, „Käse nehmen“, „Tür zumachen“ (landschaft.kuehlschrank.auf/istAuf, spiel.js Menü 'sb_mettenden').
  Neues Hand-Ding 'kaese' (kaeseModell: Emmentaler-Keil mit Löchern). Mettenden neu (wurstModell): dicke, rötliche, gebogene Wurst mit
  runden Enden, die Packung (mettendenModell) hat drei davon, Folienhaube, Schweißnaht, Etikett mit Preis. Kollision/Ladung fällt
  (fahrten.js ladungFaellt): Eier -> leerer Karton plus aufgeplatzte Eier am Boden (eierKaputtModell, nicht aufhebbar, „Wegräumen“);
  Mettenden -> drei einzelne Würste (id 'wurst'), aufhebbar, Dennis gegeben nur Wut -3 (Hand 'wurst'). Neue Sätze dennis479–482
  (einkauf.kaese/wurst).
- Paket E Bad (Projektchat 30.10., I42–I44, Vorschau): Badfenster mit echtem Durchblick: Loch in der Bad-Innenwand (badWand mit loch)
  und in der Außenwand (draussen.js, vier Wandstücke um BAD_FENSTER x 1,95–2,65, y 1,45–2,05), Rahmen/Laibung/Sprossenkreuz/Griff,
  klares Glas (Klicks gehen durch), Fensterbänke innen und außen; das alte Milchglasfenster ist weg. Waschplatz in der Werkstatt:
  Edelstahl-Wanne 22 cm tief im Unterschrank (Rahmenplatte, Wände, geneigt wirkender Boden, Ablauf mit Messingring und Gitter,
  Überlauf-Schlitz), Armatur mit Bogen-Auslauf über der Wannenmitte, Hebel rot/blau. Bad-Waschbecken: Drehkörper mit Wandstärke
  (echte Innenseite), Ablauf mit Chromring und Kreuz, Überlauf-Loch.
- Paket D Haltung Figuren (Projektchat 30.10., I40/I41, Vorschau): Segway (segway.js): Trittbrett tiefer (0,36 m), Lenksäule und Lenker
  weiter vorn (z 0,2 / 0,16, Lenker 1,12 m hoch); Waldo steht hinten (anker z -0,1) hinter der Säule. Neue Waldo-Haltung 'fahren'
  (FAHREN_R/L: beide Hände am Lenker, Winkel per Suche eingepasst, Abstand unter 5 cm); spiel.js setzt sie beim Kommen und Wegfahren
  mit dem Segway und danach wieder 'handy'. Jonny (jonny.js leiterHalten(an), LEITER_L): beim Leitertragen greift der Arm auf der Leiterseite
  (x -0,27) an die Leiter, der andere hängt locker; danach wieder verschränkt. Testen: wz.beschaeftigt/naechsterBesuch setzen,
  sonst überschreibt der Spielablauf Waldos Haltung.
- Paket C Spanngurte (Projektchat 30.10., I33, aufgesetzt auf B): ab ca. 3–5 Min., nur wenn Spieler und Dennis in der Werkstatt sind
  und Jonny oder Waldo da ist: der schmeißt zwei Spanngurte vor das Regal (world.js gurteBoden, anklickbar 'spanngurte'), Dennis
  meckert (DENNIS.spanngurt.boden, Wut +3). Aufrollen = Minispiel spanngurtSpiel (im Kreis ziehen, der Gurt wird entlang seiner
  Schlaufen eingezogen; verdrehte Stellen vorher anklicken), zwei Gurte. Dann hat man die Rollen in der Hand (HALTUNG gurte) und
  klickt aufs Regal (unter 1 m um REGAL): Rollen liegen unten im Regal (gurteRegal), Dennis freut sich (Wut -6, bei mehr als 1
  Verdreher nur -2 und Spruch). Icon mit Ring 90 s (GURT_FRIST), dann rollt Dennis selbst (dennisRolltGurte, Wut +6).
  Nach 4 Min. sind die Gurte wieder „unterwegs“, nächstes Mal nach 5–8 Min.
- Paket B Aufgaben-Icons (Projektchat 30.10., I36): unten rechts (#warnungen) je offene Nebenaufgabe ein rundes Icon mit rotem Ring,
  der sich füllt (ui.aufgabenIcons, spiel.js aufgabenUpdate alle 0,2 s); voll = Dennis macht es selbst (bestehende Abläufe):
  Feuer 16 s (dennisLoescht), Rohrbruch 22 s (dennisRepariert, z.leckSeit), Fegen 32 s (dennisFegt), Klo verstopft 70 s (dennisPoempelt),
  Kackepumpe 120 s (dennisPumpeSelbst), Tassen: ab 3 herumstehenden Tassen 100 s (tassenFrist -> dennisRaeumtTassen, vorher Zufall).
  Feuer/Rohr blinken (dringend). Die alten Warn-Kacheln (ui.warnung) sind damit ersetzt. Nicht dabei, weil Dennis sie nicht selbst
  macht: Wäsche, Akkuschrauber, Bitsatz, Müll, Leiter.
- Paket M Minispiele (Projektchat 29.10.): Müll an den Tonnen kommt nach dem Aufheben nicht mehr komplett und gleich wieder,
  sondern einzeln alle 1–2,5 Min. (fahrten.js muellNachschub: neue Sorte, neue Stelle). Hula-Hoop etwas schwerer (Halt +6 statt +7,
  Abfall 36 + 1,5 je Runde, Fehltaste -26). Neues Minispiel pumpeSpiel (minispiele.js) statt Halten-Dialog: Wasserstrahl über
  Gülle-Kleckse, Krusten brauchen länger, Luft-Balken beim Spritzen, leer = Würgen (husten), loslassen = durchatmen.
  Zurücklegen per Taste R / Knopf „An seinen Platz“ ist seit P1 (1.11.) entfernt (Betreiber-Wunsch B13).
  Milch: Tüte 1,5x größer und vorne auf dem Kaffeetisch (stand hinter der Kaffeemaschine), Hinweis beim ersten Kaffee.
  Rohrbruch-Minispiel war schon in P7.
- Paket O Kühe (Projektchat 29.10., nach Fotos des Betreibers abgenommen): Holstein-Kuh aus wenigen geformten Teilen
  (forme(): Kugel Punkt für Punkt verformt). Rumpf mit geradem Rücken, Widerrist, Hüfthöckern, eckigem Becken, leicht hängendem
  Bauch; kurzer schlanker Hals; großer Kopf (schwarz, weiße Blesse = dieselbe Kopfform schmal und oben etwas höher, dunkles Maul,
  kräftige Backen), kleine schwarze Ohren aus dem Kopf heraus mit gelber Ohrmarke, keine Hörner. Großes helles Euter, Beine aus
  geformten Gliedern (Hinterbeine mit Sprunggelenk-Knick), Schwanz als Tube, Ansatzhöhe am Rumpf nachgemessen (obenBei).
  Grasen: kopf.rotation.x (Ruhe -0,3). Testen: Kleinteile weit weg sind ausgeblendet (fernUpdate alle 15 Bilder), nach dem
  Umsetzen der Kamera einige Sekunden warten.
- Paket T Texte (Projektchat 29.10.): Briefkasten: Werbung, dicker Stapel GEZ-Forderungen, Postkarte von Lydia. Kettenhemd gehört zu Dennis'
  Kinky-Partys/Fetisch-Abend (DENNIS.kettenhemd, Text geändert, Nummern dennis445/446 bleiben). Peitsche heißt jetzt Gerte (Anzeigename,
  intern bleibt der Schlüssel `peitsche`): Klatschgeräusch statt Knall (audio gertenKlatsch), Dennis freut sich (flucht-Texte neu gefasst),
  klappt nur 2x (Wut je -6); 3. Mal: er schimpft einmal (zuViel + sauer, Wut +4), danach nur noch Hinweis (z.jagdSchluss). Modell sieht noch wie
  eine Peitsche aus (Optik offen). Tassen sind kein Werkzeug: Wurf einer Tasse hat eigene Sätze (DENNIS.wurf.tasse, dennis467/468) und den
  Fehlernamen „Tasse geworfen“. Schild am Hühnermobil entfernt.
- Paket D Dennis draußen (Projektchat 29.10., B13/B18/B19/B29): spiel.js spielerNah(): Dennis bekommt nur etwas mit, wenn der Spieler
  unter 14 m entfernt ist und im selben Bereich (Werkstatt/Bad/draußen, wege.js bereich) oder unter 5 m (Tor). dennisSiehts() nutzt das:
  weit weg oder durch die Wand keine Kommentare, Wut oder Ausraster-Videos (Wurf in die Ferne, Handy, Kiwi, Brotdose, Meckern).
  Werkstatt-Klonken (spiel.js klonk) wird draußen leiser (werkstattLaut(): ab 6 m von der Mitte linear bis 20 m, dann still);
  der Aufprall eines Wurfs bleibt voll hörbar.
- Paket F Figuren (Projektchat 29.10.): wege.js plant draußen auch um Jeep und Hoflader herum (setzeDynamisch, main.js
  meldet die Fahrzeuge an; Fahrzeug, in dem Start/Ziel liegt, zählt nicht). ausweichen(): wer läuft (Dennis, Jonny, Waldo),
  lenkt seitlich an anderen Figuren und dem Spieler vorbei (setzeFiguren); kurz vor dem Ziel nicht mehr. Waldo läuft Sitzplätze
  (Sofa, Träger) von vorne an und wird dann genau hingesetzt. Linker Torflügel: unteres Band endet an der Schlupftür.
- Paket S Stabilität (Projektchat 29.10.): Hauptschleife abgesichert (main.js: nächstes Bild zuerst angefordert, jeder Schritt in
  sicher(), ein Fehler friert nichts mehr ein). Absturz beim Jeep-Anheben (Hinweistext las lader.last) behoben. Ermahnungen und
  Meckern sperren die Steuerung nicht mehr, nur Ausraster (stufe voll); Notausgang nach 12/20 s. Festes unsichtbares
  Jonny-Hindernis an der Tür entfernt, stattdessen Kollision mit allen anwesenden Figuren (welt.figuren). Fahrzeuge: nach 1,5 s
  Gas ohne Bewegung ruckelt man sich frei (schritt(..., befreien)). Hinlaufen beim Klick nur bei freiem Weg (wegFrei), sonst nur
  hindrehen (kein Landen im Kuhgehege). Dennis-Videos ohne Standbild und Abspiel-Knopf: sofort, notfalls stumm (Ton beim nächsten
  Klick), sonst gezeichneter Dennis.
- Paket P6 Optik (Projektchat 24.10.): Feuerschale tief mit kurzen Füßen (Schale 0,38 m, Rost 0,7 m). Rauchverbot-Schild auf
  Blech vor den Streben, höher, mit Rost und Schrauben. Schilder nur von der Straße lesbar, Rückseite Holz (Betreiber), Pfahl endet
  unter der Tafel. Landeier-Schild: eins, gegenüber der Parkplatz-Einfahrt hinter dem anderen Fahrbahnrand, quer zur Straße, Pfeil zeigt von beiden Seiten zum Hof (SCHILD_Z, PFEIL_VORNE). Blaue Tonne: Deckel weiter offen, Kartons quellen
  darunter raus. Müll an den Tonnen einzeln aufheben (muellStueck, MUELL_NAMEN; alles weg = Lob, Wut -2). Eierkarton/Mettenden
  detailliert (eierKartonModell, mettendenModell in landschaft.js, auch in der Hand). T5-Pritsche: Riffelboden, Zurrösen, Träger,
  Rungen, Verschlüsse, Ladung (Schaltafel, Kanister, Spanngurt); Spuren breiter/dunkler mit Profilrillen und Grasbüscheln. Ferne
  Büsche stehen auf dem Boden. Bierkasten: Eckpfosten, Rippenband, Füße, Grifflöcher, Flaschen mit Etiketten/Goldfolie, Brett auf
  dem Rand mit Kronkorken und Feuerzeug. Benz-Auspuff durchgehend (Krümmer, Mitteltopf, Endtopf, Endrohr, Gummihalter).
  Wohnwagen-Deichsel: V-Holme treffen sich am Knotenblech, Querträger, Stützrad am Holm. Fegen: Besen in die Hand, E halten und
  über den Dreck gehen (welt.kehre, Staub welt.staub, hand.fegeSchwung), ersetzt den Halten-Dialog.
- Paket P7 (Projektchat 24./25.10.): Leistung (main.js): kleine Teile (unter 6 cm) und Umrisse werfen keinen Schatten, Schatten nur
  jedes 2. Bild neu (shadowMap.autoUpdate false), weit entfernte Kleinteile/Umrisse (über 45 m, je Gruppe) per Layer aus, alle
  Materialien beim Start vorkompiliert (gegen Hakeln beim ersten Auftauchen). Draw-Calls in der Werkstatt ca. 1870 auf 600.
  Rohrbruch-Minispiel: erst Teflonband wickeln (im Kreis), dann Zange ansetzen, gefühlvoll drehen (über 9 rad/s = abgerutscht).
  Kaffee-Minispiel als Filterkaffeemaschine: alten Filter mit Satz in den Müll ziehen, neuen Filter vom Stapel in den Korb,
  Pulver (3 Löffel), Korb zu, Wasserkanne gedrückt halten bis zur Markierung, Knopf. Jonnys Hemd nur noch oben offen
  (hemdOffen ab 0,38, darunter 5 Knöpfe).
- Paket P5 (Projektchat 24.10.): Klickstrahl zählt Linien nur bei direktem Treffer (raycaster.params.Line.threshold 0,02 in
  steuerung.js; vorher 1 m: die Wäschetasche fing alle Klicks auf Waschmaschine, Trockner und Sieb ab, Linien am Klo die Tasse auf
  dem Spülkasten). Damit sind Maschinen wieder anklickbar, das Sieb ist auch vor der Aufgabe herausnehmbar, die Tasse auf dem
  Spülkasten aufhebbar. Wäschetasche weich: runde Ecken, ausgebeulte Seiten, runder Saum.
- Paket P4 (Projektchat 24.10.): Fahrzeuge kommen aus Hindernissen, in denen sie schon stecken, immer heraus (steckt() in
  fahrzeuge.js: z. B. nach Grill/Tonnen umfahren, nach Schieben). Figuren halten beim Fahren vor Leuten und dem anderen Fahrzeug
  (fahreRoute-Option hindernisse, nach 12 s Warten Abbruch). Jeep: Scheibenrahmen unten mit Scharnieren, Armaturenbrett auf rosa
  Spritzwand bis an die Haube. Ladefläche: Eier/Mettenden auf den Jeep klicken (bis 4 Plätze); Querbeschleunigung oder Bremsen
  über 8 m/s² oder Rums = fällt runter, Eier kaputt (eierKaputt, wegräumen). Bremsen: Jeep 12, Lader 8 m/s². Entdrosselt auf der
  Ringstraße 17 m/s. Grill und Tonnen kippen weich um (kippe()). Kollisionsgeräusch audio.js aufprall(). Weidemann-Hupe:
  Doppelton-Tellerhupe (415/523 Hz, zwei Stöße). E neben dem Fahrzeug (Abstand zum Fahrzeug-Rechteck unter 1,3 m) = einsteigen;
  derselbe E-Druck steigt nicht gleich wieder aus.
- Paket P3 (Projektchat 24.10.): Gasflasche überall auf den Boden stellbar (Ort 'boden' drinnen, 'draussen' im Gelände; bleibt genau
  dort, welt.flaschePlatz), Restgas nur draußen. Schlupftür: an der Torwand rutscht man zur Türmitte (welt.tuerMitte). Leiter
  runterholen frei wählbar: Räuberleiter mit Jonny (leiterSpiel: Gleichgewicht mit A/D/Maus, ruhig = greifen, zu schief = runter)
  oder mit dem Besen runterstupsen (laut, +4 Wut, Fehler „Leiter runtergeknallt“). Danach trägt Jonny sie auf der Schulter den
  Feldweg runter (jonnyTraegtLeiterRaus) und kommt später ohne wieder.
- Paket P1 (Projektchat 24.10.): Figuren laufen nie durch Wände (js/wege.js: wegNach/bereich, Werkstatt/Bad/draußen über Schlupftür
  und WC-Tür, draußen um Werkstatt und Bad-Anbau herum). Segway parkt links vor dem Tor (SEGWAY_PARK -1,9 | 6,4), nie am Bad oder
  drinnen. Waldo auf dem Terrassen-Sofa: Füße auf der Holzterrasse (waldo.haltung(h, hoehe, boden), DRAUSSEN.sofa.boden 0,18).
  Jonny kitzelt nur direkt an Dennis (läuft ihm bis zu 3-mal hinterher). Unsichtbare Dinge sind nicht anklickbar (kein Name im Leeren).
  Außenmauer im Badbereich ausgespart (sonst Mauer in der WC-Türöffnung). Jonnys Hände runder und größer (Ballen, lange kräftige Finger, Nägel), bei verschränkten Armen greifen sie um den Unterarm (Handgelenk abgeknickt, haendeGerade() für andere Haltungen).
- Paket P2 (Projektchat 24.10.): Ausraster-Videos nur bei Spieler-Auslösung (fehler/wutPlus), nicht bei aerger() (Jonny, Waldo usw.).
  Handy beim Telefonieren immer am Ohr (auch wenn er sauer wird). Weit draußen (über 18 m) fällt Werkstatt-Gemecker meist aus
  (weitDraussenLassen: Tassen, Akkuschrauber, Waldo, Leiter). Jonnys Werkstück-Sprüche erst nach der ersten Naht. Über die
  Fahrweise meckert Dennis beim gedrosselten Jeep nicht (Hoflader immer).
- Paket A (Bugliste Projektchat): Bad-Tür (nicht drin festhängen, schließt nicht, wenn man drin steht; welt.inKloTuer/
  kloTuerMitte), Waldo steht vom Sofa nach vorn auf, Trockner: Sieb direkt rausnehmen (dreckig wieder einsetzen geht), Sieb mit
  dunklem Schacht dahinter, Wäschetasche liegt oben auf dem Trockner und NUR Dennis holt sie runter (DENNIS.waesche.holen),
  Sieb ausblasen / Kaffee kochen / Rohrbruch als Minispiele (siebSpiel, kaffeeSpiel, rohrSpiel), Werkzeug per Klick zurück an
  die Wand, Feuerlöscher sprüht nur solange E gedrückt, Lockencreme-Geste, Dennis guckt nur aus der Nähe und nicht beim Tanzen
  zum Spieler, Stromwürfel versetzt ((2,6 | 1,0), (-2,9 | -1,4)), Waldo kommt von hinten oder auf grünem Segway (js/segway.js),
  Jonny/Waldo gehen sichtbar raus an verschiedene Orte (DRAUSSEN in spiel.js: hinten, feldweg, terrasse = Dennis' Sofa),
  Jonny trinkt an wechselnden Plätzen (BIER_PLAETZE), Bier-auf-Geräusch, mehr Kippenrauch, Waldos Handy-Töne weg.
  Ausraster-Video (vielleichtAusraster): ab Wut 50, nur wenn gerade etwas passiert ist, nicht wenn die Wut sinkt, mind. 75 s
  Abstand, Videos vorgeladen ohne Standbild.

## Clips
- Comic-Look wird beim Zuschneiden ins Video gerechnet (Glätten, weniger Farbstufen, schwarze Konturen),
  im Spiel kommen Rasterpunkte, Comic-Rahmen und Sprechblase dazu. Hochkant-Clips bekommen einen hohen Rahmen.
- Ausraster: `ausraster-1..4.mp4` (neu vom Betreiber, zufällig bei schlimmen Fehlern), `rausgeflogen-1.mp4`
  (ausraster_rauschmiss, nur beim Rausschmiss). Videos starten sofort, Dennis läuft währenddessen her; Clips werden vorgeladen.
- Bisher außerdem: `ermahnung-1.mp4` (guckt vom Rechner hoch, schüttelt den Kopf),
  `ermahnung-2.mp4` (Hoodie draußen, redet, guckt skeptisch), `sauer-1.mp4` (an der Werkbank, dreht sich um, laut),
  `lob-1.mp4` (Kursraum, lächelt), `zwischendurch-1/2.mp4` (Helm, Warnweste, blauer Rucksack, Brotdose – noch ungenutzt).
  Zuordnung nur nach Bild und Lautstärke geraten (Ton nicht transkribierbar) – Betreiber fragen, was Dennis sagt.

## Offene Themen
- Hügel sind sanft (max. ca. 9 m). Falls der Betreiber steilere/höhere will: HUEGEL in landschaft.js.
- Landschaft ggf. weiter ausbauen (Betreiber-Ideen: mehr am Straßenrand, Verkehr auf der Hauptstraße o. Ä. – noch nicht bestellt).
- Torben und die Kumpels (Uwe, Steffen, Jonas, David, Joel) brauchen noch ihr echtes Aussehen (Fotos/Beschreibung vom Betreiber).
- Weidemann-Schlüssel: LADER_SCHLUESSEL_STECKT = true zum Testen; später gibt Dennis den Schlüssel nur für Aufgaben raus.
- Sprachaufnahmen der Jungs (dennisN/jonnyN/waldoN/torbenN/kumpelN laut stimme/zuordnung.csv) einbauen, sobald sie kommen;
  Abspielen über die Zuordnung auflösen (siehe Abschnitt Stimme).
- Plakat-Foto (assets/dennis-plakat.jpg) für den späteren Startbildschirm mit Zahlenschloss (Code 1312) fehlt noch.
- Handy-Video von Dennis einbauen (Betreiber hat Video), sobald geschickt.
- Weitere Clips von Dennis (Begrüßung, Lob, Tipps, Ende, spezielle Fehler).
- Weitere Projekte (Grill, Werkzeugwagen), weitere Fehler, ggf. MAG-Schweißen.

- Hotfix Ausraster-Videos (v20261101-4): `auftritt()` in clips.js nimmt pro Auftritt ein frisches `<video>`-Element (kein
  wiederverwendetes vorgeladenes mehr), bis zu 6 Abspielversuche (ab dem 2. stumm, Ton beim nächsten Klick/Taste), Start auch bei `canplay`;
  erst danach der gezeichnete Dennis. `vorladen()` wärmt nur noch den Zwischenspeicher.

- P4 Figuren (1.11.): Wege in der Werkstatt (wege.js `innenWeg`, `freierPunkt`, main.js `setzeInnen(welt.hindernisse)`): Figuren laufen um Möbel
  und Stahlträger herum (Ecken-Dijkstra wie draußen) und Ziele in Möbeln werden herausgeschoben (Johnny stand in der Werkbank, Dennis lief
  durch die Träger). Bierkasten (world.js `bierKasten`, x -1,95 | z 3,62, links neben dem Sofa, 20 Fächer): leere Flaschen von Jonny aufheben
  (Menü) und auf den Kasten klicken (spiel.js `flascheInKasten`, Wut -1); Aufgaben-Icon „Flaschen“ ab 3 offenen Flaschen, nach 110 s
  räumt Dennis zwei selbst (`dennisRaeumtFlaschen`, DENNIS.flaschenSelbst = dennis485/486, Wut +3). Die alte Sofort-Aktion „Wegräumen“ gibt es nicht
  mehr. Waldo setzt sich nach dem Zurückbringen der dreckigen Pumpe aufs Sofa (`waldoPlatzNehmen`), statt sofort hinter die Werkstatt zu gehen.
  WALDO.spanngurt (waldo42) war in texte.js nicht angelegt: ergänzt.

- P5 Fahrzeuge und Paletten (1.11.), fahrzeuge.js: Paletten haben Schwerkraft (`palettenSetzen`: von unten nach oben auf Boden oder
  Palette darunter, Auflage über Ecken und Mitte, nichts schwebt oder steckt halb in einer anderen). Aufnehmen nimmt den ganzen Stapel
  darüber mit (`stapelUeber`, beliebig hoch, alle 12 gehen). Absetzen auf eine Palette (unter 0,35 m und Winkel passt): der Stapel rutscht
  genau auf sie, sonst stehen die getragenen genau übereinander. Kollision: andere Fahrzeuge als gedrehte Kästen mit Trennachsen-Test
  (`boxenVon`, `obbTiefe`, `fahrzeugTiefe`): nie tiefer hinein, wer schon drinsteckt, darf nur heraus. Hoflader schiebt den Jeep in
  Fahrtrichtung des Vorderwagens, nur so weit, dass nichts überlappt. Paletten: Jeep fährt über keine, Hoflader über eine einzelne
  (Räder steigen darauf, `anwenden` nimmt die Palettenhöhe), Stapel ab 2 blockieren (auch die Kabine vorne; die Gabel fährt hinein).
  Für E2 (Pritsche): weiteres Fahrzeug in `alle` mit `art`, `boxenVon`-Fall und Punkten ergänzen.

- P6 Spanngurte (1.11., Vorschau): Gurte am Boden detaillierter (world.js: unregelmäßige, sich kreuzende Schlaufen, zwei
  hochkant verdrehte Stellen, J-Haken an beiden Enden, Ratsche mit Welle und Hebel, kurzes Gurtstück; Knoten nur „verknotet“).
  Jonny/Waldo gehen zum Regal und werfen ein Knäuel sichtbar hin (spiel.js `gurteHinwerfen`, `gurtKnaeuelFliegt`). Aufgerollte Gurte
  sind werfbar (Q): landen verknotet dort, wo sie aufschlagen (`gurteWerfen`, DENNIS.spanngurt.geworfen = dennis487/488).
  Minispiel neu (`spanngurtSpiel({ verknotet })`): Knoten in Pfeilrichtung aufziehen (falsche Richtung = fester), verdrehte Stellen
  anklicken, dann im Kreis aufrollen mit Tempo-Anzeige (zu schnell = verdreht). Verknotet: 3 Knoten je Gurt, sonst 2 bzw. 1.

- P7 Klo und Pömpel (1.11., Vorschau): Minispiel `poempelSpiel` (Querschnitt Klo + S-Rohr mit Pfropfen): Pömpel über das gelbe
  Abflussloch, Maus drücken = dicht, gedrückt runter/hoch = ein Hub schiebt den Pfropfen; zu hektisch = Spritzer, seitlich = abgerutscht.
  Ab 3 Spritzern ekelt sich Dennis (DENNIS.verstopft.gespritzt = dennis489/490, Wut +3). Pömpel zurück: irgendwo aufs Regal klicken.
  Spüle am Waschplatz ist anklickbar (world.js `objekte.spuele`), dort kann man die Kackepumpe auch abwaschen.
- E1 Torben und der Stahlträger (1.11., Vorschau), spiel.js Abschnitt „E1“ (`TU`, `torbenUnfall`, `torbenVerarzten`): einmal pro Spiel
  nach 6–10 min, nur wenn der Spieler in der Werkstatt ist und alles ruhig ist. Torben fragt Dennis, beide tragen den oberen Träger
  (world.js `objekte.traegerOben`) Richtung Tor, Dennis lässt los (Hüfte), der Träger landet auf Torbens Hand, Torben liegt. Dennis rennt
  panisch herum (z.dennisRaeumt = true, damit nichts anderes passiert). Aufgabe „Torben verarzten“ (90 s): Erste-Hilfe-Kasten nehmen
  (Menü), auf Torben klicken, Minispiel `fingerSpiel` (abtupfen, drücken, Verband wickeln). Sonst verbindet Dennis ihn (Wut +10).
  Danach 70 s Torben auf dem Sofa, ab dann dauerhaft weißer Verband an der rechten Hand (`torbenVerbandAn`). Der Träger bleibt liegen.

- F3 David (3.11., Vorschau): js/david.js (Parameter), js/davidteile.js (Hoodie, Hose, Stiefel, Kopf, Haltungen, Hund Coco),
  Abläufe in spiel.js Abschnitt „F3: David“ (`dv`, davidKommt/Geht/Gassi/Rohrzange/Loescher/Tischgestell/RauchtMitJonny). David ist
  weiterhin in kumpels.js (Spüldienst-Kumpel); kommt er als Spüldienst, gibt es keinen David-Besuch gleichzeitig und umgekehrt.
  Jonas hat noch keine eigene Figur: Rauchen nur mit Jonny. Testmenü T86–T93.
  SOLL-LISTE David (bei jeder Änderung komplett gegen Screenshots vorne/seitlich/hinten prüfen):
  1. Größe wie Jonny, schlank, normale Proportionen.
  2. Haare: oben hellblond und etwas länger, nach vorn/rechts gestylt; Seiten und Hinterkopf kurz und dunkler blond.
  3. Blonde Stoppeln nur am Kinn und über dem Mund (kein Vollbart), schmale helle Brauen, blaue Augen, schiefes Grinsen.
  4. Silberkette am Hals, Ring rechts, goldene Uhr links.
  5. Grauer Hoodie: Kapuze hinten, Kordeln mit Metallösen, Bauchtasche, Bündchen an Hüfte und Handgelenken.
  6. Lange schwarze Zimmererhose mit Knietaschen und Beintaschen (rechts Zollstock).
  7. Dicke schwarze Arbeitsstiefel mit Schnürung und Profilsohle.
  8. Coco: schwarzer Labrador mit rotem Halsband, folgt David, wedelt.
- F1 Torben neu (3.11., Vorschau): neue Figur nach Fotos des Betreibers, Aussehen/Teile in js/torben.js (Parameter) und js/torbenteile.js
  (lange Hose, Gürtel, Werkzeugtasche, Spaghetti, Wurf); jonny.js bekommt dafür optionale Parameter (`aussehen.torben`, `groesse`,
  `torso`, `hueft`, `vform`, `tshirt`, `weste:false` ...), Jonny/Waldo/Kumpels bleiben unverändert. Größe ca. 56 %, kürzerer Oberkörper,
  lange dicke Beine, V-Form, dicke Unterarme mit Adern, eigene Hände (baueHand: drei Glieder, Daumen, Nägel, `userData.krumm(0..1)`).
  Immer Spaghetti in der linken Hand (wackeln), alle 8 bis 16 s isst er daraus (Hand zum Mund, Strang hängt raus, Schlürfen).
  Choleriker (fahrten.js `torbenWuetet(grund, art)`): wirft Werkzeug/Tasse/Flasche/Spaghetti nur zur Seite oder auf den Boden, nie auf den
  Spieler (`wurfZiel` hält 2,2 m Abstand zum Spieler und 1,4 m zur Flugbahn). Auslöser: zweimal kurz hintereinander „Quatschen“ (25 s),
  Jeep schon entdrosselt (60 %), Rums mit Jeep/Lader (40 %), nach Ankunft (50 %, Dennis meckert). Dennis meckert nach dem Wurf mit
  45 s Abklingzeit (Wut +3). Geräusche live: `schluerfen`, `torbenWurfTon` (audio.js). Während Unfall und Fahren sind Spaghetti/Tasche
  aus (`posenSperre`). Sätze: TORBEN.wut (torben25-29), TORBEN.essen (torben30-31), DENNIS.torbenWirft (dennis498-501).
- Testmenü (1.11.): `?test` an die Adresse hängen (https://joelcode3.github.io/schweisskurs-simulator/?test), nach „Kurs starten“
  erscheint rechts das Menü (einklappbar, Gruppen aufklappbar). Unter Pointer-Lock erst Rechtsklick (Cursor), dann klicken.
  Jeder Eintrag hat eine FESTE Nummer (T01 …), die sich nie verschiebt; neue Einträge bekommen die nächste freie Nummer (zuletzt T93).
  Ofen-Bau „Stand springen“ setzt den Stand VOR dem Schritt
  (alles davor erledigt, Flasche am Platz, man steht dort); der Schritt wird dann normal im Spiel gemacht.
  Status (1.11.): GRÜN = läuft gerade (Ereignis/Nebenaufgabe aktiv oder Minispiel offen, auch wenn im Spiel gestartet; dazu alles,
  was über den Knopf gestartet wurde, bis es fertig ist). GRAU = geht gerade nicht, darunter steht warum (z. B. „Jonny ist nicht da
  (erst T50)“, „Schon passiert, Torben hat seinen Verband“). Einmalige Sachen haben dann einen Knopf „zurücksetzen“
  (T22 Wäsche, T24 Bitsatz, T31 Jonnys Leiter, T39 Torben-Unfall, T42 Mittag, T43 Hüfte, T55 Kiwis, T78 Jeep).
  Neue Knöpfe: `knopf(nr, text, tun, { laeuft, sperre, reset })` in js/testmenue.js.
  Die 404 beim Start ist das Plakat-Foto assets/dennis-plakat.jpg (kommt noch, mit Absicht nicht da).
  Nr | Gruppe | Eintrag
  T01 | Minispiele (direkt) | Anzeichnen
  T02 | Minispiele (direkt) | Schneiden (Flex)
  T03 | Minispiele (direkt) | Schweißen
  T04 | Minispiele (direkt) | Schlacke klopfen
  T05 | Minispiele (direkt) | Lackieren
  T06 | Minispiele (direkt) | Restgas ablassen (Ventil)
  T07 | Minispiele (direkt) | Flasche spülen
  T08 | Minispiele (direkt) | Bitsatz sortieren
  T09 | Minispiele (direkt) | Akkuschrauber reparieren
  T10 | Minispiele (direkt) | Flusensieb ausblasen
  T11 | Minispiele (direkt) | Kaffee kochen
  T12 | Minispiele (direkt) | Rohrbruch reparieren
  T13 | Minispiele (direkt) | Räuberleiter (Jonnys Leiter)
  T14 | Minispiele (direkt) | Hula-Hoop
  T15 | Minispiele (direkt) | Kackepumpe putzen
  T16 | Minispiele (direkt) | Spanngurte entknoten
  T17 | Minispiele (direkt) | Klo pömpeln
  T18 | Minispiele (direkt) | Finger verarzten (Torben)
  T19 | Nebenaufgaben | Klo verstopft
  T20 | Nebenaufgaben | Feuer
  T21 | Nebenaufgaben | Wasserrohrbruch
  T22 | Nebenaufgaben | Wäsche übernehmen
  T23 | Nebenaufgaben | Akkuschrauber (Waldo bringt ihn)
  T24 | Nebenaufgaben | Bitsatz sortieren
  T25 | Nebenaufgaben | Tassen verteilen
  T26 | Nebenaufgaben | Spüldienst (Kumpel-Besuch)
  T27 | Nebenaufgaben | Kackepumpe (Waldo sucht sie)
  T28 | Nebenaufgaben | Kackepumpe dreckig zurück
  T29 | Nebenaufgaben | Mülltonnen umfahren
  T30 | Nebenaufgaben | Grill umfahren
  T31 | Nebenaufgaben | Jonnys Leiter
  T32 | Nebenaufgaben | Spanngurte hinwerfen
  T33 | Nebenaufgaben | Spanngurte aufrollen (im Spiel)
  T34 | Nebenaufgaben | Jonnys Bier (leere Flasche)
  T35 | Nebenaufgaben | Leere Flaschen hinlegen (3)
  T36 | Nebenaufgaben | Ladung fällt vom Jeep
  T37 | Nebenaufgaben | Hofladen: Eier nehmen
  T38 | Nebenaufgaben | Hofladen: Mettenden nehmen
  T39 | Nebenaufgaben | Torben-Unfall (Träger, Finger)
  T40 | Ereignisse | Dennis telefoniert
  T41 | Ereignisse | Dennis Klo-Pause
  T42 | Ereignisse | Mittagspause
  T43 | Ereignisse | Hüfte (Dennis liegt)
  T44 | Ereignisse | Kaffee kochen (im Spiel)
  T45 | Ereignisse | Dennis Hula-Hoop
  T46 | Ereignisse | Torben kommt
  T47 | Ereignisse | Kumpel-Besuch
  T48 | Ereignisse | Waldo-Besuch
  T49 | Ereignisse | Sofa-Streit (Waldo)
  T50 | Ereignisse | Jonny kommt rein
  T51 | Ereignisse | Jonny geht raus
  T52 | Ereignisse | Jonny kitzelt Dennis
  T53 | Ereignisse | Jonny stört
  T54 | Ereignisse | Jonny Sodbrennen
  T55 | Ereignisse | Kiwi essen
  T56 | Wut und Zeit | Wut auf 0
  T57 | Wut und Zeit | Wut auf 30
  T58 | Wut und Zeit | Wut auf 60
  T59 | Wut und Zeit | Wut auf 90
  T60 | Wut und Zeit | Zeit + 5 Minuten
  T61 | Wut und Zeit | Zeit + 15 Minuten
  T62 | Ofen-Bau: Stand springen | Schritt 1: Flasche nach draußen tragen
  T63 | Ofen-Bau: Stand springen | Schritt 2: Restgas ablassen (Ventil)
  T64 | Ofen-Bau: Stand springen | Schritt 3: Zurück zum Waschplatz
  T65 | Ofen-Bau: Stand springen | Schritt 4: Flasche spülen
  T66 | Ofen-Bau: Stand springen | Schritt 5: Zur Werkbank tragen
  T67 | Ofen-Bau: Stand springen | Schritt 6: Ofentür anzeichnen
  T68 | Ofen-Bau: Stand springen | Schritt 7: Ofentür ausschneiden
  T69 | Ofen-Bau: Stand springen | Schritt 8: Zum Schweißplatz tragen
  T70 | Ofen-Bau: Stand springen | Schritt 9: Schweißgerät einstellen
  T71 | Ofen-Bau: Stand springen | Schritt 10: Scharniere und Griffe schweißen
  T72 | Ofen-Bau: Stand springen | Schritt 11: Beine schweißen
  T73 | Ofen-Bau: Stand springen | Schritt 12: Ofenrohr schweißen
  T74 | Ofen-Bau: Stand springen | Schritt 13: Schlacke abklopfen
  T75 | Ofen-Bau: Stand springen | Schritt 14: Ofen lackieren
  T76 | Ofen-Bau: Stand springen | Schritt 15: Ofen bei Dennis abgeben
  T77 | Ofen-Bau: Stand springen | Schutzausrüstung anziehen (alles)
  T78 | Fahrzeuge | Jeep entdrosseln (Torben)
  T79 | Fahrzeuge | Jeep wieder drosseln
  T80 | Ereignisse | Torben wütet (wirft zufällig)
  T81 | Ereignisse | Torben wirft Werkzeug
  T82 | Ereignisse | Torben wirft Tasse
  T83 | Ereignisse | Torben wirft Flasche
  T84 | Ereignisse | Torben wirft Spaghetti
  T85 | Ereignisse | Torben isst Spaghetti
  T86 | Ereignisse | David kommt (ohne Coco)
  T87 | Ereignisse | David kommt mit Coco
  T88 | Ereignisse | David nimmt die Rohrzange
  T89 | Ereignisse | David prüft den Feuerlöscher
  T90 | Ereignisse | David fragt nach Tischgestell
  T91 | Ereignisse | David raucht mit Jonny
  T92 | Ereignisse | David geht mit Coco Gassi
  T93 | Ereignisse | David geht wieder

## Offene Fäden und Ungetestetes (Übergabe 1.11.2026)
- Ausraster-Videos: #54 (frisches Video-Element, bis zu 6 Versuche, canplay) ist nur eine Absicherung. Die Ursache ist unklar, im Test lief
  alles (WebM statt H.264, Chromium kann hier kein H.264). Der Betreiber prüft im echten Browser (Browser und Anzeige erfragen: schwarz,
  gezeichneter Dennis oder nichts). Das Problem besteht laut Betreiber schon länger. Brotdose und „Dennis abgeworfen“ sind stufe voll,
  aber nebensache (nur Sprechblase, seit Commit 72a4e0a): gewollt? Der Betreiber muss entscheiden. Pages-Abruf ist von hier gesperrt.
- Pointer-Lock/Rechtsklick-Umschalten (Paket A, P1) ist im echten Browser ungetestet (Headless testet nur den Ablauf, nicht das Gefühl).
- P1 (1.11.): leere Bierflasche von Jonny kann in die Hand genommen und geworfen werden (hand.js `bierflasche`, Dennis meckert: dennis483/484
  `wurf.bierflasche.1/.2`, ohne Aufnahme). Mit etwas in der Hand bietet die Flasche keine Aktion an (immer nur EINE Sache).
- Hoflader-Fahrt zum Palettenplatz ist nicht komplett getestet.
- Hintergrundgeräusche (Paket H): nur Pegel gemessen, nicht nach Gehör beurteilt.
- Jonnys Hand ist an der Leiter noch offen (greift nicht richtig).
- Wasserhahn ohne Wasser (kein Strahl).
- Die Gerte sieht noch wie eine Peitsche aus.
- Aufgaben-Icons (Paket B) nur teilweise: Wäsche, Akkuschrauber, Bitsatz, Müll und Leiter fehlen noch.
- Geänderte Satzwortlaute ohne Neuaufnahme: dennis434–436 und dennis442–446 (die Aufnahmen passen nicht mehr zum Text).
- E2a Platz hinten (9.11.): Optik nur per Screenshot geprüft; Hoflader-Fahrt von Waldo (raus, Runde, rein) im Test gelaufen, siehe
  PR. Spieler fährt den Hoflader selbst in die Bucht: nicht ausprobiert (Kollision mit den Pfosten sollte greifen).
- Test-Tricks: Waldos/Jonnys Timer stören Tests (`wz.beschaeftigt = true; wz.naechsterBesuch = 1e9`); kleine Teile in der Ferne
  erscheinen erst nach ca. 9 s (`fernUpdate`); `setPointerCapture` unter Pointer-Lock in try/catch; JS-Syntax prüfen mit
  `node --input-type=module --check < datei.js`.
- Bekannt, aber (noch) nicht in der Projektliste: Betreiber-Wunsch Hotfix-Rückmeldung zu den Videos; Unsicherheit bei den
  Zuordnungen der Clips (siehe „Clips“, Ton nicht transkribierbar).

