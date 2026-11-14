# Schweißkurs mit Dennis – Notizen für Claude

## Zusammenarbeit
- **Immer auf Deutsch antworten** und den Betreiber **duzen**, einfach und Schritt für Schritt (der Betreiber ist kein Entwickler).
- **Keine Emojis** – weder im Spiel (Symbole als SVG-Linien-Icons) noch in Antworten.
- Änderungen als Pull Request; der Betreiber merged selbst. Jedes größere Update bekommt einen EIGENEN neuen Pull Request
  (Betreiber-Wunsch): ist der letzte PR noch offen, einen neuen Zweig (Name vom Arbeitszweig abgeleitet, z. B. `…-draussen`)
  von `origin/main` anlegen. Nur kleine Nachbesserungen zum offenen PR kommen in diesen PR.
  Hängt ein neues Update vom noch offenen PR ab, den neuen Zweig auf dessen Stand aufsetzen und im PR vermerken: erst den alten mergen.
- Projektchat (Session session_0136irctrTCA3M7n4aU75GVP, pflegt die Projektliste) schickt To-dos: OHNE Go des Betreibers umsetzen
  (Betreiber-Wunsch). Nach jedem erstellten Pull Request dem Projektchat per send_message Bescheid geben (Link + was drin ist).
- Immer nur EIN Paket auf einmal (Betreiber-Wunsch, Limit sparen): nach jedem Paket (PR gemeldet bzw. Vorschau geschickt)
  stoppen und warten, bis der Projektchat „weiter <Paketname>“ schickt. Nie selbst das nächste Paket anfangen.
  Der Betreiber wählt pro Paket das Modell (/model).
- Dauerhafte Arbeitsregeln (Betreiber/Projektchat, Stand 9.11.):
  - Bei ALLEN Paketen zuerst Vorschau (Screenshots, nummeriert 01, 02 …) an den Betreiber, PR erst nach Abnahme.
  - Pakete einzeln; nach jedem Paket stoppen, bis der Projektchat „weiter <Paket>“ schickt (außer der Betreiber sagt „durchziehen“).
  - Je Paket eigener Zweig und eigener PR. Pro Paket die Modellempfehlung (Opus oder Sonnet) nennen.
  - Optik und neue Minispiele: erst Vorschau (Screenshots) an den Betreiber, PR erst nach Abnahme.
  - PR-Meldung an den Projektchat: Link, Kurzliste, neue Sätze mit Nummern und Schlüsseln.
  - Konflikte: main in den Zweig mergen (kein Rebase, kein Force-Push), beide Seiten behalten, Version hochzählen, kurz testen.
    Bei PR-Ketten die Merge-Reihenfolge angeben.
  - Ehrlich melden, was nicht getestet oder weggelassen wurde.
  - iPhone/Touch komplett außen vor, nur Computer-Ansicht testen.
  - „todo …“ und „bug …“ gehen über den Projektchat (er pflegt die Projektliste), nicht selbst umsetzen ohne Go.
- Anzeige „version_NN“ unten links neben der Lautstärke (`#versionsnr` in index.html): NN = Nummer des eigenen PR. Bei JEDEM PR setzen
  (Nummer erst nach dem Anlegen bekannt: kurzer Folge-Commit). Die technische Version `?v=JJJJMMTT-n` bleibt davon unabhängig.
- Testmenü für den Betreiber: Adresse mit `?test` (https://joelcode3.github.io/schweisskurs-simulator/?test), rechts ein einklappbares
  Menü (js/testmenue.js) mit Direktstart aller Minispiele, Nebenaufgaben und Ereignisse sowie Wut/Zeit. JEDES neue Minispiel und
  Ereignis bekommt dort einen Knopf (Betreiber-Wunsch 1.11.).
- Vor jedem PR im Browser testen (nur Computer-Ansicht, Web hat Prio; iPhone erstmal nicht, Betreiber 24.10.), Playwright mit vorinstalliertem Chromium.
- Optisches: erst Vorschau (Screenshot) an den Betreiber, PR erst nach Abnahme (Projektchat 24.10.).


## Inhalt (Kurzübersicht)
**Details stehen in `docs/details.md` – nur den passenden Abschnitt lesen, wenn er gebraucht wird; Änderungen dort pflegen.**
- Spielidee: Ich-Perspektive, Comic-Stil, Ofen aus Propan-Gasflasche bauen, Wutanzeige 0–100, Note 1–6; nur für Kumpels (`noindex`). → „Spielidee, Start, Ende, Anzeige“
- Anzeige: Videos NUR bei Ausrastern, sonst Sprechblasen rechts; Fokus Desktop. → „Spielidee …“
- Dennis: Aussehen nach Fotos, Verhalten, Nebenbei-Interaktionen, Sprach-Warteschlange (prio 0/1/2). → „Dennis: …“
- Wut-Mechanik und Nett-sein, Telefonate. → „Wut-Mechanik“, „Dennis telefoniert“
- Werkstatt, Bad, Kaffeetassen/Spüldienst. → gleichnamige Abschnitte
- Nebenaufgaben und Ereignisse (Wäsche, Feuer, Bitsatz, Akkuschrauber). → „Nebenaufgaben und Ereignisse“
- Arbeitsablauf, Minispiele, Notenformel. → „Arbeitsablauf, Minispiele, Note“
- Hand-System, Umschauen/Steuerung. → „Hand-System und Steuerung“
- Figuren: Jonny, Waldo, Torben, Platzhalter-Kumpels. → je eigener Abschnitt
- Draußen: Hof, Platz hinten (Carport mit Buchten, Schrottplatz, Hintertür), Pritsche abschleppen (E2b), Metall-Lieferung (E3), Mettenden grillen (E4), Carport/Wohnwagen/Benz, Fahrzeuge, Landschaft, Pakete A/B. → gleichnamige Abschnitte
- Clips (Zuordnung der Videos) und Offene Themen. → „Clips“, „Offene Themen“

## Projektliste (liste/)
- `liste/` = Projektmanagement-Seite „hüfte hinten links – das spiel“ (To-Dos, Ideen, Utopisch (noch), Bugs) für den Betreiber
  und seine Kumpels, ohne Konto. Link: https://joelcode3.github.io/schweisskurs-simulator/liste/ , Zugang mit Code (Start: 1312).
- Daten liegen im Supabase-Projekt des Campingplatzes (Tabelle `asmus_eintraege`, nur über Funktionen `asmus_*` mit Code,
  SQL in joelcode3/WCH-web-app-test `supabase/update-8.sql`). Code ändern: Table Editor → `asmus_einstellungen`.
- Gepflegt vom Projektchat (täglicher Abgleich). Nachrichten „todo …“ und „bug …“ im Programmierchat sind nur Notizen dafür.

## Dateien
- `index.html`, `css/style.css`
- `js/main.js` Einstieg · `js/world.js` Werkstatt + Gasflasche · `js/draussen.js` Hof · `js/carport.js` Wohnwagen/Benz · `js/fahrzeuge.js` + `js/fahrten.js` Fahren · `js/landschaft.js` Landschaft · `js/platzhinten.js` Platz hinter der Werkstatt (Schotter, Carport, Schrott) · `js/pritsche.js` E2b Pritsche abschleppen (Joel) · `js/schlupf.js` Schlupf/Abschleppseil (Baustein, auch E3) · `js/metall.js` E3 Metall-Lieferung (Jonas) · `js/grillen.js` E4 Mettenden grillen · `js/jonny.js` Jonny · `js/waldo.js` Waldo · `js/torben.js` Torben · `js/kumpels.js` Platzhalter-Kumpels · `js/torbenteile.js` Torben-Teile · `js/david.js` + `js/davidteile.js` David und Hund Coco · `js/dennis.js` 3D-Dennis · `js/wege.js` Wegfindung der Figuren (Türen, um Werkstatt/Bad herum; in jedem gehZu)
- `js/steuerung.js` Kamera/Gehen/Klicks · `js/spiel.js` Ablauf, Fehler, Texte, Note
- `js/minispiele.js` Schneiden, Schweißen, Schlacke · `js/clips.js` Dennis-Auftritte + Archiv
- `js/testmenue.js` Testmenü (`?test`) · `js/hand.js` Dinge in der Hand (Haltung, Ablegen, Werfen mit Physik) · `js/ui.js` HUD/Dialoge · `js/audio.js` Geräusche (live erzeugt) · `js/gesicht.js` Comic-Gesicht + Icons
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
- Chromium in der Testumgebung kann kein H.264 abspielen: zum Testen das Video per `page.route` als WebM ausliefern.

## Stimme
- Alle Dennis-Sätze stehen in `js/texte.js` (IDs = Dateinamen der Aufnahmen), `spiel.js` nutzt nur diese.
- `stimme/stimme.json` + `stimme/<id>.mp3`: Aufnahmen pro Satz, Mund bewegt sich nach Lautstärke.
  Pflege mit `node tools/stimme.mjs liste|eintragen`, siehe `stimme/LIESMICH.md`.
- Die Jungs sprechen ALLE Sätze ein. Dateinamen kurz: dennis1 … dennis540 (530–540 Mettenden grillen, 516–529 Metall-Lieferung, 505–515 Pritsche, 502–504 David, 498–501 Torben wirft, 491–497 Torben-Unfall, 489–490 Pömpel gespritzt, 487–488 Gurte geworfen, 485–486 Flaschen räumen, 483–484 Bierflasche werfen, 469–475 Spanngurt, 476–478 Paletten, 479–482 Hofladen), jonny1 … jonny62 (58–62 Mettende), waldo1 … waldo47 (43–47 Mettende), torben1 … torben36 (25–31 wütet/isst, 32–36 Mettende), kumpel1 … kumpel12 (KUMPEL, 8–12 Mettende), david1 … david23 (DAVID, 19–23 Mettende), joel1 … joel15 (JOEL), jonas1 … jonas10 (JONAS) (Endung
  .mp3/.m4a/.wav, Groß-/Kleinschreibung egal). Zuordnung Kurzname -> Satz-ID steht in stimme/zuordnung.csv (vom Projektchat).
  Nummern sind fest und verschieben sich NIE; neue Sätze bekommen die nächste freie Nummer (dennis367 …) und eine neue Zeile.
  Schlüssel in texte.js NIE umbenennen, neue Sätze nur ergänzen. IDs: Dennis wie alleSaetze(), telefon.G.Z = Gespräch G,
  Zeile Z, jonny./waldo./torben. = Schlüssel aus JONNY/WALDO/TORBEN (Torben-Dateien: torben1 …). Nicht enthalten (Hinweistexte): kloOhneAufsicht, schlauch.zuKurz.
  Wenn die Dateien kommen: Abspielen über die Zuordnung auflösen, Jonny/Waldo genauso wie Dennis (alleSaetze() sammelt bisher
  nur DENNIS und löst verschachtelte Listen wie telefon nicht auf).
- KI-Stimmklon ist in dieser Umgebung nicht möglich (huggingface.co gesperrt). Stimmproben nie ins Repo (öffentlich).

## Stand der Pull Requests (9.11.2026)
- Alles bis #70 gemergt. In Arbeit: E4 Mettenden grillen (Zweig e4-mettenden-grillen). Neue Zweige immer von `origin/main`.
- Versionsnummer zuletzt `v=20261114-1`. Testmenü bis T114, nächste freie T115.
- Nächste freie Satz-Nummern (aus stimme/zuordnung.csv): dennis541, jonny63, waldo48, torben37, kumpel13, david24, joel16, jonas11.
- Projektchat-Session: `session_0136irctrTCA3M7n4aU75GVP` (seit 9.11., Projektchat Nr. 4).
- Offene Fäden und Ungetestetes: `docs/details.md`, Abschnitt „Offene Fäden und Ungetestetes“ (zuerst lesen, wenn ein neuer Chat startet).
