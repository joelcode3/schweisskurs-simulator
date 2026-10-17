// Dennis-Auftritte: echte Videoclips aus clips/clips.json, sonst gezeichneter Platzhalter mit Brummelstimme.
import { dennisPortrait } from './gesicht.js';
import { brummeln, rumms, stimmeAbspielen } from './audio.js';
import { satzId } from './texte.js';

// Alle Clip-Arten. Reihenfolge = Reihenfolge im Dennis-Archiv.
export const KATEGORIEN = {
  begruessung:      'Begrüßung und Aufgabe erklären',
  tipp:             'Tipp, wenn man ihn fragt',
  ermahnung:        'Kleine Ermahnung (allgemein)',
  sauer:            'Richtig sauer (allgemein)',
  ausraster:        'Großer Ausraster (allgemein)',
  lob:              'Lob',
  fehler_brille:    'Ohne Schutzbrille geflext',
  fehler_handschuhe:'Ohne Handschuhe gearbeitet',
  fehler_gasflasche:'Ungespülte Gasflasche aufgeschnitten',
  fehler_helm:      'Ohne Schweißhelm geschweißt',
  fehler_masse:     'Masseklemme vergessen',
  fehler_strom:     'Stromstärke falsch eingestellt',
  fehler_naht:      'Schlechte Schweißnaht',
  fehler_schnitt:   'Schiefer Schnitt',
  fehler_schlacke:  'Schlacke nicht entfernt',
  fehler_kaffee:    'An seinen Kaffee gegangen',
  fehler_nerven:    'Ihn zu oft gefragt',
  fehler_kiwi:      'Kiwis geplündert',
  fehler_brotdose:  'In seine Brotdose gebissen',
  klo:              'Muss mal ganz dringend',
  huefte:           'Hüfte, hinten links',
  licht:            'Licht aus',
  musik:            'Musik aus beim Tanzen',
  ende_gut:         'Ende: Note 1 oder 2',
  ende_mittel:      'Ende: Note 3 oder 4',
  ende_schlecht:    'Ende: Note 5 oder 6',
  rausgeflogen:     'Rausgeflogen (Wut voll)',
  zwischendurch:    'Ohne Ton: guckt, trinkt Kaffee (für später)',
};

let clips = {};
let laufend = null; // schliessen() des gerade gezeigten Auftritts
let stimme = { aktiv: false, saetze: {} };
let video = null;
const ARCHIV_KEY = 'dennis-archiv-v1';

export async function ladeClips() {
  try {
    const r = await fetch(`clips/clips.json?v=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) clips = await r.json();
  } catch {
    clips = {};
  }
  try {
    const r = await fetch(`stimme/stimme.json?v=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) stimme = { aktiv: false, saetze: {}, ...(await r.json()) };
  } catch { /* ohne Aufnahmen: Brummelstimme */ }
  video = document.createElement('video');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.preload = 'auto';
}

// Muss in einem Klick aufgerufen werden, damit iPhone später Videos mit Ton abspielt.
export function videoFreischalten() {
  if (!video) return;
  video.muted = true;
  const erster = Object.values(clips).find((l) => Array.isArray(l) && l.length);
  video.src = erster ? `clips/${erster[0].datei}` : 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAAG1kYXQ=';
  const p = video.play();
  // Erst nach dem Start anhalten, sonst zählt das iPhone es nicht als Freigabe
  const anhalten = () => { video.pause(); video.muted = false; };
  if (p && p.then) p.then(anhalten, anhalten);
  else anhalten();
}

// Knopf über dem Video, falls der Browser das Abspielen blockiert (z. B. iPhone im Stromsparmodus)
function knopfUeberVideo(medien, text, beiTipp) {
  medien.querySelector('.video-knopf')?.remove();
  const b = document.createElement('button');
  b.type = 'button';
  b.className = text === 'Ton an' ? 'video-knopf ecke' : 'video-knopf';
  b.innerHTML = `<svg viewBox="0 0 24 24" class="ico"><path d="M7 5l12 7-12 7z"/></svg><span>${text}</span>`;
  b.addEventListener('click', (e) => { e.stopPropagation(); b.remove(); beiTipp(); });
  medien.appendChild(b);
}

function waehle(schluessel) {
  for (const k of schluessel) {
    const liste = clips[k];
    if (Array.isArray(liste) && liste.length) {
      return { kategorie: k, clip: liste[Math.floor(Math.random() * liste.length)] };
    }
  }
  return { kategorie: schluessel[0], clip: null };
}

export function buehneBelegt() {
  return !document.getElementById('dennis-buehne').classList.contains('versteckt');
}

export function hatClip(kategorie) {
  return Array.isArray(clips[kategorie]) && clips[kategorie].length > 0;
}

function archiv() {
  try { return new Set(JSON.parse(localStorage.getItem(ARCHIV_KEY) || '[]')); } catch { return new Set(); }
}
function insArchiv(k) {
  try {
    const a = archiv();
    a.add(k);
    localStorage.setItem(ARCHIV_KEY, JSON.stringify([...a]));
  } catch { /* privates Fenster */ }
}
export function archivListe() {
  const a = archiv();
  return Object.entries(KATEGORIEN).map(([k, name]) => ({ k, name, gesehen: a.has(k), anzahl: (clips[k] || []).length }));
}

const buehne = () => document.getElementById('dennis-buehne');

// stufe: leicht | mittel | voll | lob | info
export function auftritt({ schluessel, text, stufe = 'mittel', stimmung = 'sauer' }) {
  const el = buehne();
  const medien = document.getElementById('dennis-medien');
  const blase = document.getElementById('dennis-text');
  const weiter = document.getElementById('dennis-weiter');
  const { kategorie, clip } = waehle(schluessel);
  insArchiv(kategorie);

  el.className = stufe;
  if (video) { video.onerror = null; video.onloadedmetadata = null; }
  medien.innerHTML = '';
  blase.textContent = '';
  if (stufe === 'voll') rumms();

  return new Promise((fertig) => {
    let aus = false;
    let timer = null;
    let mundTimer = null;
    let tippTimer = null;
    let sprecher = null;
    // ersetzt = ein neuer Auftritt übernimmt die Bühne: dann nichts ausblenden oder anhalten
    function schliessen(ersetzt = false) {
      if (aus) return;
      aus = true;
      if (sprecher) sprecher.stopp();
      clearTimeout(timer);
      clearInterval(mundTimer);
      clearInterval(tippTimer);
      if (!ersetzt) {
        if (video) { video.pause(); video.onended = null; }
        el.classList.add('versteckt');
        weiter.onclick = null;
        laufend = null;
      }
      fertig();
    }
    if (laufend) laufend(true);
    laufend = schliessen;
    weiter.onclick = () => schliessen();
    weiter.textContent = stufe === 'voll' ? 'Ja, Dennis ...' : 'Weiter';

    const anzeigeText = clip?.text || text || '';
    if (clip) {
      video.onloadedmetadata = () => el.classList.toggle('hochkant', video.videoHeight > video.videoWidth);
      // Kann das Gerät den Clip nicht abspielen, zeigt es den gezeichneten Dennis
      video.onerror = () => {
        if (aus) return;
        el.classList.remove('hochkant');
        medien.innerHTML = dennisPortrait(stimmung);
        if (stufe === 'leicht' || stufe === 'lob' || stufe === 'info') timer = setTimeout(schliessen, Math.max(2600, anzeigeText.length * 55 + 1200));
      };
      video.src = `clips/${clip.datei}`;
      video.currentTime = clip.start || 0;
      video.muted = false;
      medien.appendChild(video);
      const raster = document.createElement('div');
      raster.className = 'raster';
      medien.appendChild(raster);
      blase.textContent = anzeigeText;
      const mitTon = () => { video.muted = false; video.play().catch(() => {}); };
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          if (aus) return;
          // Ton blockiert: stumm abspielen und Knopf für Ton anbieten
          video.muted = true;
          video.play().then(
            () => { if (!aus) knopfUeberVideo(medien, 'Ton an', () => { video.muted = false; }); },
            () => { if (!aus) knopfUeberVideo(medien, 'Dennis abspielen', mitTon); },
          );
        });
      }
      video.onended = () => {
        if (stufe === 'leicht' || stufe === 'lob' || stufe === 'info') timer = setTimeout(schliessen, 500);
      };
      if (clip.ende) {
        const pruefen = () => {
          if (aus) return;
          if (video.currentTime >= clip.ende) { video.pause(); video.onended && video.onended(); return; }
          requestAnimationFrame(pruefen);
        };
        requestAnimationFrame(pruefen);
      }
    } else {
      medien.innerHTML = dennisPortrait(stimmung) + '<div class="platzhalter-schild">Platzhalter, echter Clip folgt</div>';
      const mund = medien.querySelector('.mund');
      if (mund) mund.style.transformOrigin = '100px 98px';
      const datei = stimme.aktiv ? stimme.saetze[satzId(anzeigeText)] : null;
      const automatischZu = stufe === 'leicht' || stufe === 'lob' || stufe === 'info';
      const brummelnStatt = () => {
        const silben = Math.max(4, Math.round(anzeigeText.length / 5));
        const dauer = brummeln(silben, stufe === 'voll' ? 1 : stufe === 'mittel' ? 0.4 : 0);
        let auf = false;
        mundTimer = setInterval(() => {
          auf = !auf;
          if (mund) mund.style.transform = auf ? 'scaleY(1.35)' : 'scaleY(0.8)';
        }, 110);
        setTimeout(() => { clearInterval(mundTimer); if (mund) mund.style.transform = ''; }, (dauer || 1) * 1000);
        if (automatischZu) timer = setTimeout(schliessen, Math.max(2600, anzeigeText.length * 55 + 1200));
      };
      if (datei) {
        // Aufgenommene Stimme, der Mund folgt der Lautstärke
        stimmeAbspielen(`stimme/${datei}`).then((s) => {
          if (aus) { if (s) s.stopp(); return; }
          if (!s) { brummelnStatt(); return; }
          sprecher = s;
          const bewegen = () => {
            if (aus || sprecher !== s) return;
            const p = Math.min(1, s.pegel() * 6);
            if (mund) mund.style.transform = `scaleY(${0.7 + p * 1.1})`;
            requestAnimationFrame(bewegen);
          };
          requestAnimationFrame(bewegen);
          s.fertig.then(() => {
            if (sprecher === s) sprecher = null;
            if (mund) mund.style.transform = '';
            if (automatischZu && !aus) timer = setTimeout(schliessen, 700);
          });
        });
      } else {
        brummelnStatt();
      }
      // Text eintippen
      let i = 0;
      tippTimer = setInterval(() => {
        i += 2;
        blase.textContent = anzeigeText.slice(0, i);
        if (i >= anzeigeText.length) clearInterval(tippTimer);
      }, 28);
    }
    el.classList.remove('versteckt');
  });
}

// Für das Archiv: einen bestimmten Clip abspielen
export function spieleKategorie(k) {
  return auftritt({ schluessel: [k], text: KATEGORIEN[k], stufe: 'mittel', stimmung: 'ruhig' });
}
