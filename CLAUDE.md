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
  Schnauzer, leichter Dreitagebart, schwarze Arbeitsjacke mit Kragen und Reflexstreifen, darunter grauer Hoodie (keine Kordeln), schwarze
  Arbeitshose, **hässlicher blauer Rucksack** (ausdrücklich gewünscht). Keine roten Wangen, kein Gehörschutz, keine Mütze, kein grauer Ring am Hals.
- Nebenbei-Interaktionen: Kaffee kochen und Dennis bringen (Wut sinkt, ab dem 3. meckert er), Kiwis (1. ok,
  2. skeptisch, ab 3. sauer), Brotdose (abbeißen = Ausraster), große Soundbox (Techno, Dennis tanzt),
  Lichtschalter (Dennis meckert), Besen (Dreck nach Schneiden/Schweißen, zählt in die Note),
  Hüfte (Dennis humpelt einmal pro Spiel auf freien Boden in der Raummitte, legt sich hin und jammert, bis man ihm aufhilft),
  Klo-Pause zwischendurch (frühestens nach 100 s, WC-Tür vorne rechts mit WC-Schild). Dennis sagt erst Bescheid,
  dann rennt er raus; solange er weg ist: Arbeitspause (gelbes Band oben, Arbeitsschritte gesperrt). Geht man zu Dennis hin und bleibt
  stehen: „Was los??“ (stimme/baustellenfeeling.mp3, 1 s, nicht im Liegen, nicht wenn er selbst kommt, max. alle 40 s). Mittagspause: einmal pro Spiel setzt er sich aufs Sofa (vorne links), isst aus der Brotdose eine Tomate
  (stimme/tomate.mp3), legt sich dann ~22 s schlafen (Z Z Z). Wecken = Wut. Kiwis liegen lose auf dem Kaffeetisch.
  (stimme/tomate.mp3 kommt sofort, wenn er die Brotdose auspackt). Auf dem Sofa liegt er mit Kopf und Waden auf den Lehnen.
  Liegt Dreck > 45 s, holt Dennis den Besen und fegt selbst (stimme/muell.mp3, Note -2).
  Dennis steht nicht immer vor dem Sofa: alle 30–55 s wechselt er zu einem anderen Platz (PLAETZE in dennis.js).
  Tanzen (Box an): nur dann und immer wieder stimme/murmeln-8.mp3 (95281C52…), sonst sagt er beim Tanzen nichts.
  Hüfte: erster Hilferuf beim Hinlegen, Hilferuf-Blasen bleiben ca. 8 s.
  Murmeln (nur wenn Dennis frei ist, nicht beim Tanzen/Schlafen/Löschen/Hüfte/Mittag/Klo/Fegen/Hula): nur stimme/murmeln-9.mp3
  (ansprechen2), zufällig alle 15–35 s, nur Ton, Lautstärke nach Abstand.
  Hula-Hoop: Reifen hängt an der Rückwand zwischen Regal und Werkbank. Dennis holt ihn sich alle 1,5–2,5 min (oder man
  bringt ihn: Reifen in die Hand, auf Dennis klicken), macht Hula-Hoop und sagt dabei stimme/murmeln-10.mp3 (hello_fresh,
  nur noch dafür), hängt ihn danach zurück.
  Schläft Dennis oder ist er auf dem Klo, merkt er nichts (Kiwis, Brotdose, Tasse, Werfen, Handy, Figur ohne Wut).
  Sprache (Aufnahme oder Gebrabbel): je näher der Spieler, desto lauter; Aufnahmen werden vorgeladen, Blase und Ton
  starten gleichzeitig; schließt das Dennis-Fenster (Weiter), blendet sein Gebrabbel aus.
  Alle Töne mit kurzem Ein- und Ausblenden. Poster (assets/poster.jpg) mit Klebeband über der Kaffeeecke.
- Kaffee: 1. senkt Wut (-20), 3 hintereinander (seit letztem Klo) = sofort aufs Klo + etwas Wut. Milch (Tüte auf dem
  Kaffeetisch, breit, mit Brotdose) = „Ist da Milch drin? GIFT!!“ + Klo + Wut. Nach dem Klo: Klospülung. Reguläres Klo (nicht ausgelöst) senkt die Wut (-10).
  Fegen senkt Wut (-8), Aufhelfen nach Hüfte (-12, Dennis freut sich).
- Holzfigur (Baumstamm mit geschnitztem Hintern, ~70 cm) steht zwischen Box und Besen.
- Bemalte Holz-Skulptur (langer Penis, nach Foto vom Betreiber) hängt über dem Fenster über der Soundbox.
- Dennis' Klemmbrett (liegt auf dem Sofa): aufheben, E = lesen. Notizen in NOTIZEN (world.js): Lydia anrufen, Hüfte hinten
  links, Heringe essen, Arzttermine, TK-Pizza einkaufen, Sexy abmelden, Fußmatte waschen.
- Erste-Hilfe-Kasten neben dem Feuerlöscher. Klospülung = assets/klospuelung.mp3 (Ton aus dem Video vom Betreiber, mit Ausblenden).
- Feuer: einmal pro Spiel (nach dem Flexen bald) brennt der Mülleimer neben der Werkbank. Vor dem Flexen nur mit
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
- Bedienung: Hat ein Ding nur eine Aktion, wird sie beim Klick direkt ausgeführt (kein Menü). Box und Licht schalten
  sofort beim Klick (ohne Hinlaufen). Abbrechen-Knöpfe hell mit dunkler Schrift.
- Dennis hält seinen Becher immer aufrecht, Schuhsohlen rund (keine eckigen Platten).
- Anzeige-Regeln (Betreiber): Videos nur für Arbeitssicherheit und Aufgaben, rechts am Rand, ohne Wegklicken,
  verschwinden von selbst. Alle Sprechblasen (Nebensachen, Lob) rechts am Rand, verschwinden von selbst.
  Mute-Knopf und Lautstärkeregler unten links (gespeichert im Browser).
  Begrüßung am Anfang bleibt als großes Fenster. Stations-Knöpfe nur auf Touch-Geräten.
- Fokus: Desktop-Version (Betreiber-Wunsch), Handy-Ansicht erstmal zweitrangig.
- Fehlerstufen: leicht (Ermahnung, Dennis guckt), mittel (kommt rüber, sauer), voll (rennt rüber, Ausraster).

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
- Versionsnummer `?v=JJJJMMTT-n` an `css/style.css` und `js/main.js` in `index.html` bei jeder Änderung hochzählen.
- Fehlt ein Clip, zeigt das Spiel ein gezeichnetes Dennis-Gesicht mit Gebrabbel und Sprechblase.
- Gebrabbel (Sätze ohne Aufnahme, `brummeln` in audio.js): gedämpfte Posaune wie bei den Peanuts (Betreiber-Wahl C).
- `window.__werkstatt` ist nur für Tests (Playwright) gedacht.

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
