// Dennis-Stimme verwalten.
//   node tools/stimme.mjs liste      -> stimme/SAETZE.md und stimme/saetze.csv (alle Sätze mit Dateinamen)
//   node tools/stimme.mjs eintragen  -> trägt vorhandene Aufnahmen stimme/<id>.mp3 in stimme/stimme.json ein
import { readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alleSaetze } from '../js/texte.js';

const ordner = join(dirname(fileURLToPath(import.meta.url)), '..', 'stimme');
const saetze = alleSaetze();
const befehl = process.argv[2];

if (befehl === 'liste') {
  const zeilen = saetze.map((s) => `| \`${s.id}.mp3\` | ${s.text.replace(/\|/g, '/')} |`);
  writeFileSync(join(ordner, 'SAETZE.md'), `# Alle Sätze von Dennis (${saetze.length})

Jede Aufnahme als MP3 mit genau diesem Dateinamen in den Ordner \`stimme/\` legen,
danach \`node tools/stimme.mjs eintragen\` ausführen.

| Datei | Text |
|---|---|
${zeilen.join('\n')}
`);
  const csv = ['datei;text', ...saetze.map((s) => `${s.id}.mp3;"${s.text.replace(/"/g, '""')}"`)];
  writeFileSync(join(ordner, 'saetze.csv'), `${csv.join('\n')}\n`);
  console.log(`${saetze.length} Sätze nach stimme/SAETZE.md und stimme/saetze.csv geschrieben.`);
} else if (befehl === 'eintragen') {
  const vorhanden = new Set(readdirSync(ordner).filter((f) => /\.(mp3|m4a|ogg|wav)$/.test(f)));
  const eintraege = {};
  const fehlen = [];
  for (const s of saetze) {
    const datei = [...vorhanden].find((f) => f.replace(/\.[^.]+$/, '') === s.id);
    if (datei) eintraege[s.id] = datei;
    else fehlen.push(s.id);
  }
  writeFileSync(join(ordner, 'stimme.json'), `${JSON.stringify({ aktiv: Object.keys(eintraege).length > 0, saetze: eintraege }, null, 2)}\n`);
  console.log(`${Object.keys(eintraege).length} von ${saetze.length} Sätzen haben eine Aufnahme.`);
  if (fehlen.length) console.log(`Ohne Aufnahme (Brummelstimme): ${fehlen.join(', ')}`);
} else {
  console.log('Aufruf: node tools/stimme.mjs liste | eintragen');
  process.exit(existsSync(ordner) ? 1 : 2);
}
