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
- Stationen: Regal (Brille, Handschuhe), Waschplatz (Flasche, Schlauch), Werkbank (Speckstein, Flex),
  Schweißplatz (Gerät, Masseklemme, Helm, Hammer), Kaffeeecke (Dennis, Tasse „CHEF“).
- Fertiger Ofen (Vorbild-Foto vom Betreiber): stehende Gasflasche, mattschwarz lackiert, Tür unten an der Seite
  mit Holzgriff, langes Ofenrohr oben (statt Ventil), drei schräge Beine am Fußring, zwei seitliche Tragegriffe.
  Mit Beinen steht er vor dem Schweißtisch auf dem Boden.
- Aussehen Dennis (nach Fotos): schlank, blond-rötliche Locken (oben/hinten voluminös), goldene Pilotenbrille,
  Schnauzer, leichter Dreitagebart, schwarze Arbeitsjacke mit Kragen und Reflexstreifen, darunter grauer Hoodie (nur Kordeln sichtbar), schwarze
  Arbeitshose, **hässlicher blauer Rucksack** (ausdrücklich gewünscht). Keine roten Wangen, kein Gehörschutz, keine Mütze, kein grauer Ring am Hals.
- Fehlerstufen: leicht (Ermahnung, Dennis guckt), mittel (kommt rüber, sauer), voll (rennt rüber, Ausraster).

## Dateien
- `index.html`, `css/style.css`
- `js/main.js` Einstieg · `js/world.js` Werkstatt + Gasflasche · `js/dennis.js` 3D-Dennis
- `js/steuerung.js` Kamera/Gehen/Klicks · `js/spiel.js` Ablauf, Fehler, Texte, Note
- `js/minispiele.js` Schneiden, Schweißen, Schlacke · `js/clips.js` Dennis-Auftritte + Archiv
- `js/ui.js` HUD/Dialoge · `js/audio.js` Geräusche (live erzeugt) · `js/gesicht.js` Comic-Gesicht + Icons
- `vendor/three.module.min.js` (Three.js r170, lokal, keine CDN-Abhängigkeit)
- `clips/clips.json` + `clips/*.mp4` – Dennis-Videos, siehe `clips/LIESMICH.md`
- `tools/clip_schneiden.sh` – Rohvideo zuschneiden, verkleinern, iPhone-HDR umrechnen und Comic-Look anwenden (ffmpeg)

## Technik
- Statische Seite, GitHub Pages. Lokal testen: `python3 -m http.server` im Projektordner.
- Versionsnummer `?v=JJJJMMTT-n` an `css/style.css` und `js/main.js` in `index.html` bei jeder Änderung hochzählen.
- Fehlt ein Clip, zeigt das Spiel ein gezeichnetes Dennis-Gesicht mit Brummelstimme und Sprechblase.
- `window.__werkstatt` ist nur für Tests (Playwright) gedacht.

## Clips
- Comic-Look wird beim Zuschneiden ins Video gerechnet (Glätten, weniger Farbstufen, schwarze Konturen),
  im Spiel kommen Rasterpunkte, Comic-Rahmen und Sprechblase dazu. Hochkant-Clips bekommen einen hohen Rahmen.
- Chromium in der Testumgebung kann kein H.264 abspielen: zum Testen das Video per `page.route` als WebM ausliefern.
- Bisher: `ermahnung-1.mp4` (guckt vom Rechner hoch, schüttelt den Kopf), `ausraster-1.mp4` (dreht sich um und brüllt),
  `ermahnung-2.mp4` (Hoodie draußen, redet, guckt skeptisch), `sauer-1.mp4` (an der Werkbank, dreht sich um, laut),
  `lob-1.mp4` (Kursraum, lächelt), `zwischendurch-1/2.mp4` (Helm, Warnweste, blauer Rucksack, Brotdose – noch ungenutzt).
  Zuordnung nur nach Bild und Lautstärke geraten (Ton nicht transkribierbar) – Betreiber fragen, was Dennis sagt.

## Stimme
- Alle Dennis-Sätze stehen in `js/texte.js` (IDs = Dateinamen der Aufnahmen), `spiel.js` nutzt nur diese.
- `stimme/stimme.json` + `stimme/<id>.mp3`: Aufnahmen pro Satz, Mund bewegt sich nach Lautstärke.
  Pflege mit `node tools/stimme.mjs liste|eintragen`, siehe `stimme/LIESMICH.md`.
- KI-Stimmklon ist in dieser Umgebung nicht möglich (huggingface.co gesperrt). Stimmproben nie ins Repo (öffentlich).

## Offene Themen
- Weitere Clips von Dennis (Begrüßung, Lob, Tipps, Ende, spezielle Fehler).
- Weitere Projekte (Grill, Werkzeugwagen), weitere Fehler, ggf. MAG-Schweißen.
