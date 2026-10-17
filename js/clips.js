// Dennis-Auftritte: echte Videoclips aus clips/clips.json, sonst gezeichneter Platzhalter mit Brummelstimme.
import { dennisPortrait } from './gesicht.js';
import { brummeln, rumms } from './audio.js';

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
  ende_gut:         'Ende: Note 1 oder 2',
  ende_mittel:      'Ende: Note 3 oder 4',
  ende_schlecht:    'Ende: Note 5 oder 6',
  rausgeflogen:     'Rausgeflogen (Wut voll)',
  zwischendurch:    'Ohne Ton: guckt, trinkt Kaffee (für später)',
};

let clips = {};
let video = null;
const ARCHIV_KEY = 'dennis-archiv-v1';

export async function ladeClips() {
  try {
    const r = await fetch(`clips/clips.json?v=${Date.now()}`, { cache: 'no-store' });
    if (r.ok) clips = await r.json();
  } catch {
    clips = {};
  }
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
  if (p && p.catch) p.catch(() => {});
  video.pause();
  video.muted = false;
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
    function schliessen() {
      if (aus) return;
      aus = true;
      clearTimeout(timer);
      clearInterval(mundTimer);
      clearInterval(tippTimer);
      if (video) { video.pause(); video.onended = null; }
      el.classList.add('versteckt');
      weiter.onclick = null;
      fertig();
    }
    weiter.onclick = schliessen;
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
      const p = video.play();
      if (p && p.catch) {
        p.catch(() => {
          // Autoplay mit Ton blockiert: stumm abspielen, Text zeigt den Inhalt
          video.muted = true;
          video.play().catch(() => {});
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
      const silben = Math.max(4, Math.round(anzeigeText.length / 5));
      const dauer = brummeln(silben, stufe === 'voll' ? 1 : stufe === 'mittel' ? 0.4 : 0);
      const mund = medien.querySelector('.mund');
      let auf = false;
      mundTimer = setInterval(() => {
        auf = !auf;
        if (mund) {
          mund.style.transformOrigin = '100px 96px';
          mund.style.transform = auf ? 'scaleY(1.35)' : 'scaleY(0.8)';
        }
      }, 110);
      setTimeout(() => { clearInterval(mundTimer); if (mund) mund.style.transform = ''; }, (dauer || 1) * 1000);
      // Text eintippen
      let i = 0;
      tippTimer = setInterval(() => {
        i += 2;
        blase.textContent = anzeigeText.slice(0, i);
        if (i >= anzeigeText.length) clearInterval(tippTimer);
      }, 28);
      if (stufe === 'leicht' || stufe === 'lob' || stufe === 'info') {
        timer = setTimeout(schliessen, Math.max(2600, anzeigeText.length * 55 + 1200));
      }
    }
    el.classList.remove('versteckt');
  });
}

// Für das Archiv: einen bestimmten Clip abspielen
export function spieleKategorie(k) {
  return auftritt({ schluessel: [k], text: KATEGORIEN[k], stufe: 'mittel', stimmung: 'ruhig' });
}
