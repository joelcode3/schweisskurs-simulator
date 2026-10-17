# Dennis-Clips

Hier liegen die Videos von Dennis als `.mp4` (kurz, 3–10 Sekunden, verkleinert).
Welcher Clip wann kommt, steht in `clips.json`.

## Aufbau von clips.json

Jede Art von Moment hat eine Liste. Gibt es mehrere Clips, wählt das Spiel zufällig einen aus.
Ist eine Liste leer, zeigt das Spiel den gezeichneten Platzhalter.

```json
{
  "fehler_gasflasche": [
    { "datei": "gasflasche-1.mp4", "text": "Bist du wahnsinnig?!" }
  ],
  "lob": [
    { "datei": "lob-1.mp4", "text": "Jo, passt." },
    { "datei": "lob-2.mp4" }
  ]
}
```

- `datei`: Dateiname im Ordner `clips/`
- `text` (freiwillig): Untertitel in der Sprechblase. Ohne Text steht dort, was im Spiel passiert ist.
- `start` / `ende` (freiwillig): Sekunden, falls nur ein Teil des Videos laufen soll.

Fehlt ein spezieller Fehler-Clip (z. B. `fehler_masse`), nimmt das Spiel automatisch einen
allgemeinen: `ermahnung` (kleiner Fehler), `sauer` (mittel) oder `ausraster` (schlimm).

## Arten

| Schlüssel | Wann |
|---|---|
| begruessung | Spielstart, Dennis erklärt die Aufgabe |
| tipp | Spieler fragt Dennis, was dran ist |
| ermahnung / sauer / ausraster | allgemeine Reaktionen je nach Schwere |
| lob | gute Naht / guter Schnitt |
| fehler_brille, fehler_handschuhe, fehler_gasflasche, fehler_helm, fehler_masse, fehler_strom, fehler_naht, fehler_schnitt, fehler_schlacke, fehler_kaffee, fehler_nerven | bestimmte Fehler |
| ende_gut / ende_mittel / ende_schlecht | Abgabe mit Note 1–2 / 3–4 / 5–6 |
| rausgeflogen | Wutanzeige voll |
| zwischendurch | (noch nicht benutzt) Dennis guckt, trinkt Kaffee |

## Videos vorbereiten

`tools/clip_schneiden.sh roh.mov 00:01:20 6 clips/gasflasche-1.mp4`
schneidet ab 1:20 sechs Sekunden heraus, verkleinert auf 640 Pixel Breite und speichert
eine handyfreundliche MP4-Datei (H.264 + AAC).
