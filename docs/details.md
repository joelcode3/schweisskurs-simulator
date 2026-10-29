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
- Umschauen am Computer: Maus an den Bildrand fahren (ohne Klicken), je näher am Rand desto schneller (steuerung.js `randDrehen`,
  Rand 26 % links/rechts, 20 % oben/unten, bis 3,6 bzw. 2,0 rad/s, Zeiger wird zum Pfeil). Ziehen: 0,007 (Maus) / 0,0085 (Touch). Kein Pointer Lock/Einrasten (Betreiber: doof). Ziehen geht weiterhin.
  Nicht drehen, solange ein Menü/Dialog/Minispiel/Dennis-Fenster offen ist.

## Jonny
- Jonny (js/jonny.js, nach Fotos): so groß wie Dennis, etwas breiter, lange braune Haare, Vollbart, grüne Cap mit Schirm nach
  vorn, runde goldene Brille (kein Nasenring), weißes KURZärmliges Hemd oben offen bis zur Brustmitte, darunter zugeknöpft (Brust und Hals durchgehend, Haare nur
  auf der Brust, Hals ohne Haare), hellbraune Cord-Weste eng an Brust und Schultern bis an den Hals, Hemd/Weste/Körper als
  saubere Hüllen (`huelle`, `aufHuelle` in jonny.js, R(y)/T(y) = Rumpfform), große Hände (dicke Finger mit zwei Gliedern, Nägel, Daumen), Arme richtig verschränkt (links unten, rechts darüber),
  kein Gürtel, dünner, flacher Bauch, sehr kurze schwarze Arbeitshose mit
  Zollstock und Stift, weiße Socken, grüne Sneaker, goldener Ring. Kann laufen (gehZu). Heim: Tor-Ecke (0,45 | 3,2).
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
  rechts neben der Werkstatt, rosa Mini-Jeep (Wrangler-Look, ohne Dach, Elektro-Kinderauto), Feuerschale (flach, graue Asche mit Häufchen, verkohlte Holzreste) mit Dreibein, Kette,
  rundem Grillrost und alter schwarzer Bratwurst. Begehbar: draußen überall innerhalb der Ringstraße (imKreis in landschaft.js),
  in die Werkstatt nur durch die Schlupftür, Bad-Anbau ausgespart. Würfe draußen prallen an der Hauswand und am Geländerand ab
  (hand.js AUSSEN = GELAENDE).

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
- Paket T Texte (Projektchat 29.10.): Briefkasten: Werbung, dicker Stapel GEZ-Forderungen, Postkarte von Lydia. Kettenhemd gehört zu Dennis'
  Kinky-Partys/Fetisch-Abend (DENNIS.kettenhemd, Text geändert, Nummern dennis445/446 bleiben). Peitsche heißt jetzt Gerte (Anzeigename,
  intern bleibt der Schlüssel `peitsche`): Klatschgeräusch statt Knall (audio gertenKlatsch), Dennis freut sich (flucht-Texte neu gefasst),
  klappt nur 2x (Wut je -6); 3. Mal: er schimpft einmal (zuViel + sauer, Wut +4), danach nur noch Hinweis (z.jagdSchluss). Modell sieht noch wie
  eine Peitsche aus (Optik offen). Tassen sind kein Werkzeug: Wurf einer Tasse hat eigene Sätze (DENNIS.wurf.tasse, dennis467/468) und den
  Fehlernamen „Tasse geworfen“. Schild am Hühnermobil entfernt.
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
