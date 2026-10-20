# Schweißkurs mit Dennis – Notizen für Claude

## Zusammenarbeit
- **Immer auf Deutsch antworten**, einfach und Schritt für Schritt (der Betreiber ist kein Entwickler).
- **Keine Emojis** – weder im Spiel (Symbole als SVG-Linien-Icons) noch in Antworten.
- Änderungen als Pull Request auf dem vorgegebenen Arbeitszweig; der Betreiber merged selbst.
- Vor jedem PR im Browser testen (Computer- und iPhone-Ansicht), Playwright mit vorinstalliertem Chromium.

## Das Spiel
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
- Aussehen Dennis (nach Fotos): schlank, blond-rötliche Locken (oben/hinten voluminös), goldene Pilotenbrille,
  Schnauzer, leichter Dreitagebart, schwarze Arbeitsjacke mit Kragen und Reflexstreifen, darunter grauer Hoodie (keine Kordeln), kurze
  schwarze Arbeitshose (über dem Knie), dicke nackte Waden mit Tattoos auf der Rückseite (links Kiwi, rechts Penis, leicht nach
  außen gedreht, `wadenTattoo` in dennis.js), kurze graue Socken, **hässlicher blauer Rucksack** (ausdrücklich gewünscht). Keine roten Wangen, kein Gehörschutz, keine Mütze, kein grauer Ring am Hals.
- Start aktuell: einfache Karte mit „Kurs starten“, danach direkt Dennis' Begrüßung (#start-einfach).
- FÜR SPÄTER gemerkt (Betreiber): Startbildschirm Werkstatt von außen, Plakat „Heute: Gasflaschen-Ofen schweißen mit Dennis“
  (Foto assets/dennis-plakat.jpg, kommt später), Tür mit Zahlenschloss, Code **1312**. Ist fertig gebaut (#start, Klasse
  `versteckt`); zum Aktivieren `versteckt` dort entfernen und #start-einfach ausblenden.
  Kein Dennis-Modus, kein Dennis-Archiv mehr. Keine Hintergrundmusik (Betreiber: erstmal nicht).
- Bewertung am Ende mit freigestelltem Foto im Comic-Look: assets/ende-bestanden.webp (Daumen hoch, Note 1–4),
  assets/ende-nichtbestanden.webp (Mittelfinger, Note 5–6 und Rausschmiss).
- Nebenbei-Interaktionen: Kaffee kochen und Dennis bringen (Wut sinkt, ab dem 3. meckert er), Kiwis (1. und 2. erlaubt:
  kein Spruch, nur Bissgeräusch; ab 3. sauer), Brotdose (abbeißen = Ausraster), große Soundbox (Techno, Dennis tanzt),
  Lichtschalter (Dennis meckert), Besen (Dreck nach Schneiden/Schweißen, zählt in die Note),
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
  Musik an, während Dennis Mittagspause macht oder schläft: er steht auf und ist sauer (+14 Wut). Reguläres Klo (nicht ausgelöst) senkt die Wut (-10).
  Fegen senkt Wut (-8), Aufhelfen nach Hüfte (-12, Dennis freut sich).
- Holzfigur (Baumstamm mit geschnitztem Hintern, ~70 cm) steht zwischen Box und Besen.
- Bemalte Holz-Skulptur (langer Penis, nach Foto vom Betreiber) hängt über dem Fenster über der Soundbox.
- Dennis' Klemmbrett (liegt auf dem Sofa): Klick = in die Hand, groß vor dem Gesicht (Hand fasst unten rechts an, `griff` in HALTUNG),
  alles lesbar. Handschrift (Google Font Caveat, leicht schief, Kaffeefleck), Erledigtes durchgestrichen. NOTIZEN (world.js):
  Lydia anrufen (durch, Haken), Hüfte hinten links!! (rot), Heringe essen (durch), Orthopäde, Zahnarzt (durch), Hautarzt,
  TK-Pizza einkaufen, Sexy abmelden, neue Motorhaube für Benz organisieren, Konzerttickets verkaufen, Urlaub einreichen,
  40-Grad-Wäsche!! (kein „Fußmatte waschen“ mehr).
- Nebenaufgabe 40-Grad-Wäsche (Dennis helfen, freut ihn: Wut -15, bei zu heiß nur -5): Klemmbrett in der Hand, E = übernehmen.
  Dennis kommt, gibt die blaue Einkaufstasche (wie IKEA: gewebte Plane, gelbe Gurtbänder, flache Henkel; darin
  grauer Hoodie mit raushängendem Ärmel, Jeans mit Hosenbein, schwarzes Shirt, Handtuch, rote Socke) mit Wäsche und erklärt in 4 Blasen den Ablauf. Waschmaschine im Bad
  (vorne rechts), Trockner obendrauf, beide mit Anzeige (Restzeit/ENDE) und drehender Trommel.
  Temperatur wählbar 30/40/60/90 (über 40 = Fehler, Dennis merkt es spätestens beim Rausholen). Waschen 50 s, Trocknen 35 s.
  Flusensieb (unten in der Trocknertür, voller Fusseln) ausbauen, am Kompressor (Ecke rechts neben dem Regal, 50-l-Kessel mit
  Motor, Kühlrippen, Manometern, Spiralschlauch und Ausblaspistole) mit Druckluft ausblasen,
  wieder einsetzen. Trockner mit dreckigem Sieb starten = Dennis meckert (+5). Trockene Wäsche zu Dennis bringen.
  In der Aufgabenliste als blaue Nebenaufgaben unter einer Trennlinie (`neben: true`).
- Erste-Hilfe-Kasten neben dem Feuerlöscher. Klospülung = assets/klospuelung.mp3 (Ton aus dem Video vom Betreiber, mit Ausblenden).
- Feuer (Comic-Flammen, Flammenzungen, Glut, Rauch zur Decke; Rußfleck an Decke und Wand wächst und bleibt): einmal pro Spiel (nach dem Flexen bald) brennt der Mülleimer neben der Werkbank, Feuer-Symbol unten rechts,
  Dennis wartet ca. 16 s, bevor er selbst löscht. Vor dem Flexen nur mit
  anderem Grund: Johnny hat seine Kippe reingeschnippt (eigene Sprüche). Dennis ruft (Blase rechts),
  holt den Feuerlöscher (rechte Wand zwischen Schweißplatz und Waschplatz) und löscht selbst, wird sauer. Löscht man selbst: Lob, Wut sinkt. Hält man den Löscher
  und tut nichts, drängelt Dennis (Wut steigt).
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
- Dennis aufhelfen (Hüfte) nur mit leeren Händen (Ausnahme: Kaffee, Wäschetasche, Sieb, die man nicht hinlegen kann).
- Kaffee kann man werfen (Q) und fallen lassen (G); dann ist er weg (neuen kochen), Dennis meckert, wenn er es sieht.
- Werkstatt-Optik: Deckenhöhe 3,9 m (RAUM.hoehe), helle Putzdecke (MeshBasic), KEINE Holzbalken (Betreiber), Leuchtstoffröhren an Ketten auf 3,25 m. Wände mit eigener Leinwand je Wand
  (`wandMalen`): Putz, grüngrauer Sockel bis 1,25 m, Putz bröckelt stellenweise (Ziegel sichtbar), Risse, Wasserflecken.
  KEINE Graffiti und Zahlen (Betreiber: wieder weg). Eingang vorne: breites Scheunentor komplett grün (2 Flügel, Z-Streben,
  nur die Scharniere/Bänder schwarz) mit Rauchen-verboten-Schild; Lichtschalter zwischen Tor und WC-Tür.
- Bad (begehbar) hinter der WC-Tür vorne rechts (BAD in world.js, x 0,7–3,9, z 4,0–6,8): Schachbrett-Boden, Fliesen bis 1,4 m,
  Milchglasfenster, Klo (hinten links), Dusche (hinten rechts), Waschbecken mit Spiegel, Waschmaschine + Trockner (vorne rechts).
  WC-Tür offen, nur zu während Dennis drin ist. Bild über dem Klo: assets/bad-bild.jpg (Foto vom Betreiber, Dennis oben ohne mit Handy, Holzrahmen).
  Verstopfung: nach Dennis' Klo einmal pro Spiel mit 30 % Wahrscheinlichkeit; Pömpel steht oben im Regal, in die Hand, aufs Klo
  klicken (Wut -10). Nach 70 s macht Dennis es selbst (+8 Wut).
- Zwei kleine gelbe Stromverteiler-Würfel (18 cm, genau eine Steckdose pro Seite, ein Stecker mit Kabel) hängen an Kabeln tief von der Decke (Unterkante 1,75 m, bei
  (-0,9 | 2,35) und (0 | -1,05)). Läuft Dennis dagegen: pendelt, Klonk, Spruch (DENNIS.stromwuerfel, max. alle 35 s).
- Johnnys Leiter (Alu-Kofferraumleiter vom Camper, 6 Sprossen, oben gebogen) hängt quer, hoch und leicht schräg an der rechten
  Wand auf zwei Konsolen. Dennis regt sich alle 2,5–4 min darüber auf (DENNIS.leiter) und beim Anklicken.
- Lockencreme „CURL KING“ (Tiegel) auf der Ablage unter dem Spiegel im Bad (daneben Tube und Kamm): in die Hand, auf Dennis
  klicken = er cremt die Locken, Wut -12 (höchstens alle 90 s), Creme kommt zurück aufs Regal.
- Schwarze Latexunterhose hängt an einem Messinghaken an der linken Badwand (zwischen Waschbecken und Klo), Anklicken = Spruch.
- Bad blockiert: steht man im Bad, wenn Dennis zur Klo-Pause an der WC-Tür ankommt, hat er sich eingeschissen: Wut 100,
  sofort Rausschmiss mit eigenem Text (DENNIS.eingeschissen / eingeschissenRaus).
- Verstopftes Klo: große detaillierte Kackwurst schwimmt (Tube mit wechselndem Radius, Risse, Maiskörner, Klopapierfetzen),
  gelbliche unregelmäßige Pfütze davor. Bilderrahmen über dem Klo: Profilrahmen mit Goldleiste, Passepartout, Glasreflex, Nagel.
- Feuer und Wasserrohrbruch mit mindestens 90 s Abstand (z.letztesEreignis). Waschmaschine/Trockner: Scheibe schlicht blau.
- Geworfene/fallen gelassene längliche Dinge liegen flach (userData.liegend: Rohrzange, Pömpel, Besen, Hula-Hoop-Reifen).
- Jonny (js/jonny.js, nach Fotos): so groß wie Dennis, etwas breiter, lange braune Haare, Vollbart, grüne Cap mit Schirm nach
  vorn, runde goldene Brille (kein Nasenring), weißes KURZärmliges Hemd bis oben offen (Brust und Hals durchgehend, Haare nur
  auf der Brust, Hals ohne Haare), hellbraune Cord-Weste eng an Brust und Schultern bis an den Hals, Hemd/Weste/Körper als
  saubere Hüllen (`huelle`, `aufHuelle` in jonny.js, R(y)/T(y) = Rumpfform), große Hände (dicke Finger mit zwei Gliedern, Nägel, Daumen), Arme richtig verschränkt (links unten, rechts darüber),
  kein Gürtel, dünner, flacher Bauch, sehr kurze schwarze Arbeitshose mit
  Zollstock und Stift, weiße Socken, grüne Sneaker, goldener Ring. Kann laufen (gehZu). Heim: Tor-Ecke (0,45 | 3,2).
  Verhalten (spiel.js, Objekt jz): raucht zwischendurch; holt sich alle 70–130 s ein Bier aus dem Kühlschrank (oder lässt sich
  über das Menü sofort überreden), trinkt, lässt leere Flasche liegen (anklicken = wegräumen, Wut -2); Dennis nervt das (+3).
  Ab 4 Bier: Sodbrennen, geht nach Hause (durchs Tor, weg für den Rest des Spiels); vorher mit 15 % pinkelt er in den Ofen
  (Dennis +10). Kitzelt Dennis alle 2–3,5 min (Dennis: Ton stimme/aergern-2.mp3 = ärgernleicht2, schickt ihn weg, +4).
  Einmal pro Spiel will er die Leiter abholen: stellt sich drunter, Spieler klickt die Leiter = runterholen (Leiter weg, Wut -10,
  Dennis jubelt), sonst nach 45 s „nächste Woche“. Störenfried: kommt zum Spieler an Werkbank/Schweißplatz und quatscht;
  „Antworten“ = Fehler (+5, Dennis sauer), ignorieren/15 s warten = Jonny beleidigt. aerger(n) = Wut ohne Fehler, max. 99.
  Jonny geht alle 2–3,5 min raus (Camper/Kiosk, jonnyRaus/jonnyRein, jz.draussen) und kommt nach 70–130 s wieder.
  Jonny und Waldo sind selten gleichzeitig da: Waldo kommt meist nur, wenn Jonny draußen ist (85 %), Jonny kommt erst
  zurück, wenn Waldo weg ist (85 %), und geht nicht raus, solange Waldo da ist. Kippen-Feuer nur, wenn Jonny da ist.
- Kühlschrank (klein, weiß, Bier drin) in der Pausenecke neben dem Kaffeetisch.
- Waldo (js/waldo.js, nach Fotos): kleiner (Skala 0,85), breit, kurze dunkle Haare (ganzer Hinterkopf bis Nacken, gehen hinter
  den Ohren und über die Koteletten nahtlos in den Bart über, gleiche Farbe/Textur), langer voller braun-dunkler Vollbart mit
  vielen Essensresten (Krümel, Salat, Tomate, Käse, Sesam, Mayo), beige Cap, dunkelroter Pulli OHNE Logo mit geradem Saum
  (Betreiber), weite, detaillierte kurze graue Jogginghose (meliert, Löcher mit Fäden, Risse, Fransen, sauberer gerippter
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
- Stahlträger (HEB 200, rostig) liegen vorne rechts zwischen Waschplatz und Bad-Tür, ohne Funktion. Anklicken oder in der Nähe
  (max. alle 45 s): Dennis „Schwere Stahlträger sind Torbens Job!“.
- Bedienung: Hat ein Ding nur eine Aktion, wird sie beim Klick direkt ausgeführt (kein Menü). Box und Licht schalten
  sofort beim Klick (ohne Hinlaufen). Abbrechen-Knöpfe hell mit dunkler Schrift.
- Dennis hält seinen Becher immer aufrecht, Schuhsohlen rund (keine eckigen Platten).
- Ofen abgeben: fertigen Ofen anklicken = hochheben (HALTUNG ofen), zu Dennis tragen, auf Dennis klicken; er wird neben Dennis
  abgestellt, dann Bewertung. Ohne Ofen in der Hand sagt Dennis „bring ihn her“.
- Note: Arbeit (Verarbeitung) max. 75 Punkte + Dennis' Laune max. 25 (100 minus Mittel aus höchster Wut und Wut am Ende)
  - 1,5 je Fehler (max. 15) - Werkstatt (dreckig 4, Dennis gefegt 2). Note 1 ab 85, 2 ab 72, 3 ab 58, 4 ab 45, 5 ab 30.
  Die Aufschlüsselung steht im Ende-Fenster.
- clips.json enthält nur noch ausraster-1..4 und rausgeflogen-1 (alle anderen Listen leer, Betreiber-Wunsch).
- Hüfte: erst still hinlegen, dann rufen und jammern. Schlauch: nur die Spritzpistole kommt in die Hand (Wasser aus der Düse),
  Pfützen unregelmäßig (Klecks-Texturen).
- Anzeige-Regeln (Betreiber): Videos NUR bei Ausrastern (Fehlerstufe voll, Rausschmiss, schlechte Note am Ende = Rausschmiss-Video),
  rechts am Rand, ohne Wegklicken. Alles andere (auch Tipps, Abgabe, Lob, Ende gut) nur als Sprechblase. „Was los??“ nur Ton, keine Blase. Alle Sprechblasen (Nebensachen, Lob) rechts am Rand, verschwinden von selbst.
  Mute-Knopf und Lautstärkeregler unten links (gespeichert im Browser).
  Begrüßung am Anfang bleibt als großes Fenster. Stations-Knöpfe nur auf Touch-Geräten.
- Fokus: Desktop-Version (Betreiber-Wunsch), Handy-Ansicht erstmal zweitrangig.
- Fehlerstufen: leicht (Ermahnung, Dennis guckt), mittel (kommt rüber, sauer), voll (rennt rüber, Ausraster).

## Projektliste (liste/)
- `liste/` = Projektmanagement-Seite „hüfte hinten links – das spiel“ (To-Dos, Ideen, Utopisch (noch), Bugs) für den Betreiber
  und seine Kumpels, ohne Konto. Link: https://joelcode3.github.io/schweisskurs-simulator/liste/ , Zugang mit Code (Start: 1312).
- Daten liegen im Supabase-Projekt des Campingplatzes (Tabelle `asmus_eintraege`, nur über Funktionen `asmus_*` mit Code,
  SQL in joelcode3/WCH-web-app-test `supabase/update-8.sql`). Code ändern: Table Editor → `asmus_einstellungen`.
- Gepflegt vom Projektchat (täglicher Abgleich). Nachrichten „todo …“ und „bug …“ im Programmierchat sind nur Notizen dafür.

## Dateien
- `index.html`, `css/style.css`
- `js/main.js` Einstieg · `js/world.js` Werkstatt + Gasflasche · `js/dennis.js` 3D-Dennis
- `js/steuerung.js` Kamera/Gehen/Klicks · `js/spiel.js` Ablauf, Fehler, Texte, Note
- `js/minispiele.js` Schneiden, Schweißen, Schlacke · `js/clips.js` Dennis-Auftritte + Archiv
- `js/hand.js` Dinge in der Hand (Haltung, Ablegen, Werfen mit Physik) · `js/ui.js` HUD/Dialoge · `js/audio.js` Geräusche (live erzeugt) · `js/gesicht.js` Comic-Gesicht + Icons
- `vendor/three.module.min.js` (Three.js r170, lokal, keine CDN-Abhängigkeit)
- `clips/clips.json` + `clips/*.mp4` – Dennis-Videos, siehe `clips/LIESMICH.md`
- `tools/clip_schneiden.sh` – Rohvideo zuschneiden, verkleinern, iPhone-HDR umrechnen und Comic-Look anwenden (ffmpeg)

## Technik
- Statische Seite, GitHub Pages. Lokal testen: `python3 -m http.server` im Projektordner.
- Versionsnummer `?v=JJJJMMTT-n` in `index.html` bei jeder Änderung überall hochzählen (css, main.js UND alle Einträge der
  Importmap für die Module), sonst lädt der Browser alte world.js/spiel.js usw. aus dem Speicher.
- Fehlt ein Clip, zeigt das Spiel ein gezeichnetes Dennis-Gesicht mit Gebrabbel und Sprechblase.
- Gebrabbel (Sätze ohne Aufnahme, `brummeln` in audio.js): gedämpfte Posaune wie bei den Peanuts (Betreiber-Wahl C).
- `window.__werkstatt` ist nur für Tests (Playwright) gedacht.
- Clips: zu jedem `clips/x.mp4` gibt es `clips/x.jpg` (erstes Bild, als Vorschau gegen gelben Rahmen/Ruckeln).
  Nach neuen Clips erzeugen: `ffmpeg -ss 0 -i clips/x.mp4 -frames:v 1 -vf "scale='min(480,iw)':-2" -q:v 7 clips/x.jpg`.

## Clips
- Comic-Look wird beim Zuschneiden ins Video gerechnet (Glätten, weniger Farbstufen, schwarze Konturen),
  im Spiel kommen Rasterpunkte, Comic-Rahmen und Sprechblase dazu. Hochkant-Clips bekommen einen hohen Rahmen.
- Chromium in der Testumgebung kann kein H.264 abspielen: zum Testen das Video per `page.route` als WebM ausliefern.
- Ausraster: `ausraster-1..4.mp4` (neu vom Betreiber, zufällig bei schlimmen Fehlern), `rausgeflogen-1.mp4`
  (ausraster_rauschmiss, nur beim Rausschmiss). Videos starten sofort, Dennis läuft währenddessen her; Clips werden vorgeladen.
- Bisher außerdem: `ermahnung-1.mp4` (guckt vom Rechner hoch, schüttelt den Kopf),
  `ermahnung-2.mp4` (Hoodie draußen, redet, guckt skeptisch), `sauer-1.mp4` (an der Werkbank, dreht sich um, laut),
  `lob-1.mp4` (Kursraum, lächelt), `zwischendurch-1/2.mp4` (Helm, Warnweste, blauer Rucksack, Brotdose – noch ungenutzt).
  Zuordnung nur nach Bild und Lautstärke geraten (Ton nicht transkribierbar) – Betreiber fragen, was Dennis sagt.

## Stimme
- Alle Dennis-Sätze stehen in `js/texte.js` (IDs = Dateinamen der Aufnahmen), `spiel.js` nutzt nur diese.
- `stimme/stimme.json` + `stimme/<id>.mp3`: Aufnahmen pro Satz, Mund bewegt sich nach Lautstärke.
  Pflege mit `node tools/stimme.mjs liste|eintragen`, siehe `stimme/LIESMICH.md`.
- KI-Stimmklon ist in dieser Umgebung nicht möglich (huggingface.co gesperrt). Stimmproben nie ins Repo (öffentlich).

## Offene Themen
- Handy-Video von Dennis einbauen (Betreiber hat Video), sobald geschickt.
- Weitere Clips von Dennis (Begrüßung, Lob, Tipps, Ende, spezielle Fehler).
- Weitere Projekte (Grill, Werkzeugwagen), weitere Fehler, ggf. MAG-Schweißen.
