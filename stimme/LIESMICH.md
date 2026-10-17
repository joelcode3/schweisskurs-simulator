# Dennis-Stimme

Ohne Aufnahmen spricht Dennis im Spiel mit einer Brummelstimme (nur Sprechblase).
Liegt zu einem Satz eine Aufnahme hier im Ordner, spielt das Spiel sie ab und der
gezeichnete Mund bewegt sich dazu. Echte Video-Clips (Ordner `clips/`) haben Vorrang.

## Ablauf

1. `node tools/stimme.mjs liste` schreibt alle Sätze nach `SAETZE.md` und `saetze.csv`
   (Dateiname = ID des Satzes, z. B. `fehler.brille.1.mp3`).
2. Für jeden Satz eine MP3 mit genau diesem Namen hier ablegen
   (echte Aufnahmen von Dennis oder mit seinem Einverständnis erzeugte KI-Stimme).
3. `node tools/stimme.mjs eintragen` trägt alle vorhandenen Dateien in `stimme.json` ein.

Fehlt zu einem Satz die Datei, bleibt es dort bei der Brummelstimme.
Die Texte selbst stehen in `js/texte.js`. Beim Umformulieren die Schlüssel beibehalten,
sonst passt die Aufnahme nicht mehr.

## Wichtig

Stimmproben von Dennis (Rohaufnahmen zum Anlernen einer KI-Stimme) gehören **nicht** in
dieses Repository: Es ist öffentlich, und mit den Proben könnte jeder seine Stimme nachmachen.
