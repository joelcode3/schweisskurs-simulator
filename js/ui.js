// Bedienoberfläche: Auftragszettel, Puls-Anzeige (Dennis' Wut), Ausrüstung, Aktionsmenü, Dialoge.
import { SYMBOL, dennisMini } from './gesicht.js';
import { STATIONEN } from './world.js';
import { dauer, blip } from './audio.js';

const $ = (id) => document.getElementById(id);

export function zeigeHud(an) {
  $('hud').classList.toggle('versteckt', !an);
  document.body.classList.toggle('laeuft', an);
}

export function aufgabenZeigen(liste) {
  const ol = $('aufgaben');
  let aktivGesetzt = false;
  let nebenErster = true;
  ol.innerHTML = liste.map((a) => {
    let klasse = '';
    if (a.fertig) klasse = 'fertig';
    // offene Nebenaufgaben sind alle gleichzeitig dran (jede für sich); beim Ofen nur der erste offene Schritt
    else if (a.neben || (!aktivGesetzt && !a.mehr)) { klasse = 'aktiv'; if (!a.neben) aktivGesetzt = true; }
    // Nebenaufgaben (z. B. Dennis' Wäsche) blau und mit Trennlinie
    if (a.neben) { klasse += ' neben'; if (nebenErster) { klasse += ' neben-start'; nebenErster = false; } }
    if (a.sammel) klasse += ' sammel';
    if (a.spaet) klasse = 'neben spaet';
    if (a.neben && a.id && AUFGABE_SYMBOL[a.id]) return `<li class="${klasse}"><span class="box">${a.fertig ? SYMBOL.haken : ''}</span><span class="li-symbol">${AUFGABE_SYMBOL[a.id]}</span><span>${a.text}</span></li>`;
    if (a.mehr) klasse = 'mehr';
    return `<li class="${klasse}"><span class="box">${a.fertig ? SYMBOL.haken : ''}</span><span>${a.text}</span></li>`;
  }).join('');
}

$('zettel-kopf').addEventListener('click', () => $('zettel').classList.toggle('zu'));
if (window.innerHeight < 500 || window.innerWidth < 600) $('zettel').classList.add('zu');

// Dennis-Puls: die Wut (0-100) wird als Herzfrequenz angezeigt, 60 = tiefenentspannt, 180 = Ausraster.
// Intern bleibt alles Wut; nur die Anzeige rechnet um.
export const pulsAusWut = (wut) => Math.round(60 + Math.max(0, Math.min(100, wut)) * 1.2);
const PULS = { ziel: 78, wert: 78, wut: 15, t: 0, schlagStart: 0, x: 0, spalten: null, letzte: 0, zitter: 0, naechsterZitter: 0, extra: 1 };
function pulsFarbe(p) { return p < 95 ? '#5cff6a' : p < 130 ? '#ffd23a' : p < 160 ? '#ff8a2a' : '#ff3b2e'; }
export function wutZeigen(wert, stimmung) {
  PULS.wut = Math.max(0, Math.min(100, wert));
  PULS.ziel = pulsAusWut(wert);
  $('wut-gesicht').innerHTML = dennisMini(stimmung);
  const stufe = wert >= 85 ? 'kurz vorm Platzen' : wert >= 60 ? 'stinksauer' : wert >= 35 ? 'genervt' : wert >= 12 ? 'skeptisch' : 'tiefenentspannt';
  $('wut-stufe').textContent = stufe;
}
// EKG-Kurve: eine Spalte pro Pixel, ein Schreibstrahl läuft von links nach rechts und überschreibt die alte Kurve
// (mit kleiner Lücke davor) wie am Monitor im Krankenhaus. Je höher der Puls, desto schneller, höher und unruhiger.
function ekgHoehe(s, dauer, wut) {
  // s = Sekunden seit Schlagbeginn; bei schnellem Puls wird der Schlag zeitlich gestaucht
  const k = Math.min(1, dauer / 0.75);
  const g = (m, b, a) => a * Math.exp(-(((s - m * k) / (b * k)) ** 2));
  const hoch = 0.62 + wut / 100 * 0.38;
  return g(0.09, 0.025, 0.12) + g(0.165, 0.008, -0.12) + g(0.19, 0.011, hoch) + g(0.215, 0.01, -0.28 * hoch) + g(0.38, 0.045, 0.2 + wut / 100 * 0.12);
}
function pulsMalen(jetzt) {
  requestAnimationFrame(pulsMalen);
  const c = $('puls-kurve');
  if (!c || !c.offsetParent) { PULS.letzte = jetzt; return; }
  const dt = Math.min(0.1, (jetzt - (PULS.letzte || jetzt)) / 1000);
  PULS.letzte = jetzt;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const B = Math.round(c.clientWidth * dpr), H = Math.round(c.clientHeight * dpr);
  if (c.width !== B || c.height !== H) { c.width = B; c.height = H; PULS.spalten = new Float32Array(B).fill(NaN); PULS.x = 0; }
  // angezeigter Wert läuft dem Ziel nach und zittert ein bisschen wie ein echter Monitor
  PULS.wert += (PULS.ziel - PULS.wert) * Math.min(1, dt * 1.5);
  PULS.naechsterZitter -= dt;
  if (PULS.naechsterZitter <= 0) { PULS.naechsterZitter = 0.9 + Math.random() * 0.6; PULS.zitter = Math.round((Math.random() - 0.5) * (2 + PULS.wut / 25)); }
  const anzeige = Math.max(55, Math.round(PULS.wert + PULS.zitter));
  const farbe = pulsFarbe(PULS.wert);
  const dauer = 60 / Math.max(50, PULS.wert);
  const w = $('puls-wert');
  if (w.dataset.p !== String(anzeige)) { w.dataset.p = anzeige; $('puls-zahl').textContent = anzeige; }
  if (w.dataset.f !== farbe) { w.dataset.f = farbe; w.style.setProperty('--puls-farbe', farbe); }
  const dauerTxt = dauer.toFixed(2) + 's';
  if (w.dataset.d !== dauerTxt) { w.dataset.d = dauerTxt; w.style.setProperty('--puls-dauer', dauerTxt); }
  // Schreibstrahl weiterschieben und neue Spalten berechnen (Geschwindigkeit steigt etwas mit dem Puls)
  const tempo = (55 + PULS.wut * 0.35) * dpr;
  const neu = tempo * dt;
  const sp = PULS.spalten;
  for (let i = 0; i < Math.max(1, Math.round(neu)); i++) {
    PULS.t += dt / Math.max(1, Math.round(neu));
    let s = PULS.t - PULS.schlagStart;
    if (s >= dauer * PULS.extra) {
      // wütend: ab und zu ein Extraschlag (früher dran), damit es unruhig aussieht
      PULS.schlagStart = PULS.t;
      PULS.extra = PULS.wut > 55 && Math.random() < (PULS.wut - 55) / 120 ? 0.6 + Math.random() * 0.2 : 1;
      s = 0;
    }
    const unruhe = (Math.random() - 0.5) * 0.04 * (1 + PULS.wut / 40);
    sp[Math.floor(PULS.x) % B] = ekgHoehe(s, dauer, PULS.wut) + unruhe;
    PULS.x = (PULS.x + 1) % B;
  }
  const g = c.getContext('2d');
  g.clearRect(0, 0, B, H);
  // Raster
  g.strokeStyle = 'rgba(70, 160, 100, 0.16)';
  g.lineWidth = 1;
  g.beginPath();
  const raster = 8 * dpr;
  for (let x = 0; x < B; x += raster) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
  for (let y = H / 2 % raster; y < H; y += raster) { g.moveTo(0, y + 0.5); g.lineTo(B, y + 0.5); }
  g.stroke();
  // Kurve (Lücke direkt vor dem Schreibstrahl)
  const mitte = H * 0.64, hub = H * 0.56;
  const kopf = Math.floor(PULS.x);
  const luecke = 10 * dpr;
  g.strokeStyle = farbe;
  g.lineWidth = 1.8 * dpr;
  g.lineJoin = 'round';
  g.shadowColor = farbe;
  g.shadowBlur = 4 * dpr;
  g.beginPath();
  let an = false;
  for (let x = 0; x < B; x++) {
    const abst = (x - kopf + B) % B;
    if (abst < luecke || Number.isNaN(sp[x])) { an = false; continue; }
    const y = mitte - sp[x] * hub;
    if (an) g.lineTo(x, y); else { g.moveTo(x, y); an = true; }
  }
  g.stroke();
  // heller Punkt am Schreibstrahl
  const letzte = sp[(kopf - 1 + B) % B];
  if (!Number.isNaN(letzte)) {
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(kopf - 1, mitte - letzte * hub, 1.8 * dpr, 0, Math.PI * 2);
    g.fill();
  }
  g.shadowBlur = 0;
}
requestAnimationFrame(pulsMalen);
export function wutWackeln() {
  const w = $('wut');
  w.classList.remove('wackelt');
  void w.offsetWidth;
  w.classList.add('wackelt');
}

export function ausruestungZeigen(ppe) {
  const teile = [['brille', 'Schutzbrille'], ['handschuhe', 'Handschuhe'], ['helm', 'Schweißhelm'], ['maske', 'Atemmaske']];
  $('ausruestung').innerHTML = teile.map(([k, name]) => `<div class="ausr ${ppe[k] ? 'an' : ''}" ${ppe[k] ? `data-k="${k}"` : ''} title="${name}${ppe[k] ? ' (an, klicken zum Abnehmen)' : ' (fehlt)'}">${SYMBOL[k]}</div>`).join('');
}

export function stationenZeigen(aktuell, beiWahl) {
  const nav = $('stationen');
  const liste = [...Object.entries(STATIONEN).filter(([id]) => id !== 'eingang'), ['dennis', { name: 'Dennis' }]];
  nav.innerHTML = liste.map(([id, s]) => `<button type="button" class="station-knopf ${id === aktuell ? 'hier' : ''}" data-id="${id}">${SYMBOL.ort}<span>${s.name}</span></button>`).join('');
  nav.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => beiWahl(b.dataset.id)));
}

let hinweisTimer = null;
export function hinweis(text, ms = 2600) {
  const h = $('hinweis');
  h.textContent = text;
  h.classList.add('sichtbar');
  clearTimeout(hinweisTimer);
  hinweisTimer = setTimeout(() => h.classList.remove('sichtbar'), ms);
}

export function hoverName(text, x, y) {
  const el = $('hover-name');
  if (!text) { el.classList.remove('sichtbar'); return; }
  el.textContent = text;
  el.style.transform = `translate(${x + 16}px, ${y + 14}px)`;
  el.classList.add('sichtbar');
}

// Aktionsmenü: [{ text, symbol, tun }]
let menueSchliessen = null;
export function aktionsMenue(titel, info, aktionen) {
  const el = $('aktionen');
  el.innerHTML = `<div class="aktionen-titel">${titel}</div>${info ? `<div class="aktionen-info">${info}</div>` : ''}`;
  for (const a of aktionen) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'aktion';
    b.innerHTML = `${SYMBOL[a.symbol] || SYMBOL.hand}<span>${a.text}</span>`;
    b.addEventListener('click', () => { schliesseMenue(); blip(700, 0.05, 0.15); a.tun(); });
    el.appendChild(b);
  }
  const zu = document.createElement('button');
  zu.type = 'button';
  zu.className = 'aktion abbrechen';
  zu.textContent = 'Nichts tun';
  zu.addEventListener('click', schliesseMenue);
  el.appendChild(zu);
  el.classList.remove('versteckt');
  menueSchliessen = () => el.classList.add('versteckt');
}
export function schliesseMenue() {
  if (menueSchliessen) menueSchliessen();
  menueSchliessen = null;
}
export function menueOffen() {
  return !$('aktionen').classList.contains('versteckt');
}

function dialog(html) {
  const d = $('dialog');
  d.innerHTML = `<div class="dialog-karte">${html}</div>`;
  d.classList.remove('versteckt');
  return d;
}
export function dialogZu() {
  $('dialog').classList.add('versteckt');
  $('dialog').innerHTML = '';
}

// Gedrückt halten, bis der Balken voll ist
export function haltenDialog({ titel, text, knopf, sekunden = 2.5, geraeusch }) {
  return new Promise((fertig) => {
    const d = dialog(`<h2>${titel}</h2><p>${text}</p>
      <button type="button" class="halten-knopf" id="halten"><div class="fuellung"></div><span>${knopf}</span></button>
      <div class="dialog-knoepfe"><button type="button" class="knopf leise klein" id="halten-abbruch">Abbrechen</button></div>`);
    const btn = d.querySelector('#halten');
    const fuell = btn.querySelector('.fuellung');
    let wert = 0;
    let gedrueckt = false;
    let ton = null;
    let letzte = 0;
    let aktiv = true;
    function schleife(t) {
      if (!aktiv) return;
      const dt = letzte ? (t - letzte) / 1000 : 0;
      letzte = t;
      if (gedrueckt) wert = Math.min(1, wert + dt / sekunden);
      fuell.style.width = `${wert * 100}%`;
      if (wert >= 1) return ende(true);
      requestAnimationFrame(schleife);
    }
    requestAnimationFrame(schleife);
    function an(e) { e.preventDefault(); gedrueckt = true; if (!ton && geraeusch) ton = dauer(geraeusch); }
    function aus() { gedrueckt = false; if (ton) { ton.stopp(); ton = null; } }
    btn.addEventListener('pointerdown', an);
    btn.addEventListener('pointerup', aus);
    btn.addEventListener('pointerleave', aus);
    btn.addEventListener('pointercancel', aus);
    d.querySelector('#halten-abbruch').addEventListener('click', () => ende(false));
    function ende(ok) {
      aktiv = false;
      aus();
      dialogZu();
      if (ok) blip(880, 0.1);
      fertig(ok);
    }
  });
}

export function stromDialog(aktuell) {
  return new Promise((fertig) => {
    let a = aktuell;
    const d = dialog(`<h2>Schweißgerät</h2>
      <p class="klein">Elektrodenschweißen. Elektrode 2,5 mm, Blech der Flasche ca. 3 mm.<br>Faustregel: ca. 30 bis 40 Ampere pro Millimeter Elektrode.</p>
      <div class="geraet">
        <div class="geraet-anzeige" id="strom-anz">${a} A</div>
        <div class="geraet-knoepfe">
          <button type="button" data-d="-10">-10</button><button type="button" data-d="-5">-5</button>
          <button type="button" data-d="5">+5</button><button type="button" data-d="10">+10</button>
        </div>
      </div>
      <div class="dialog-knoepfe"><button type="button" class="knopf" id="strom-ok">Übernehmen</button></div>`);
    d.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => {
      a = Math.max(20, Math.min(200, a + Number(b.dataset.d)));
      d.querySelector('#strom-anz').textContent = `${a} A`;
      blip(500 + a * 3, 0.04, 0.12);
    }));
    d.querySelector('#strom-ok').addEventListener('click', () => { dialogZu(); fertig(a); });
  });
}

export function infoDialog(titel, html, knoepfe = [{ text: 'Alles klar' }]) {
  return new Promise((fertig) => {
    const d = dialog(`<h2>${titel}</h2>${html}<div class="dialog-knoepfe">${knoepfe.map((k, i) => `<button type="button" class="knopf ${k.klasse || ''}" data-i="${i}">${k.text}</button>`).join('')}</div>`);
    d.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { dialogZu(); fertig(Number(b.dataset.i)); }));
  });
}

// Eine Sprechblase rechts für alles, was Dennis nebenbei sagt (verschwindet von selbst)
let blasenTimer = null;
export function blaseRechts(text, ms = 4000, art = 'normal') {
  const el = $('lobblase');
  el.querySelector('span').textContent = text;
  el.querySelector('b').textContent = art === 'lob' ? 'DENNIS (zufrieden)' : 'DENNIS';
  el.className = art;
  $('lob-gesicht').innerHTML = dennisMini(art === 'lob' ? 'froh' : art === 'sauer' ? 'sauer' : 'ruhig');
  void el.offsetWidth;
  el.classList.add('neu');
  clearTimeout(blasenTimer);
  blasenTimer = setTimeout(() => el.classList.add('versteckt'), ms);
}
export function sprechzeile(text, ms, sauer = false) { blaseRechts(text, ms, sauer ? 'sauer' : 'normal'); }
export function lobZeigen(text) { blaseRechts(text, 5000, 'lob'); }
// Jonny spricht: gleiche Blase rechts, mit seinem Namen und einem kleinen Gesicht (Cap, Bart, Brille)
const JONNY_MINI = '<circle cx="20" cy="22" r="14" fill="#eebda0" stroke="#111" stroke-width="2"/><path d="M8 26 Q20 42 32 26 Q30 36 20 37 Q10 36 8 26z" fill="#4e321d" stroke="#111" stroke-width="1.5"/><path d="M6 16 Q20 2 34 16 Z" fill="#7d8a5c" stroke="#111" stroke-width="2"/><circle cx="15" cy="21" r="4" fill="none" stroke="#c9a13b" stroke-width="1.5"/><circle cx="25" cy="21" r="4" fill="none" stroke="#c9a13b" stroke-width="1.5"/>';
const WALDO_MINI = '<circle cx="20" cy="21" r="14" fill="#e9b896" stroke="#111" stroke-width="2"/><path d="M6 22 Q20 46 34 22 Q32 38 20 39 Q8 38 6 22z" fill="#3a261a" stroke="#111" stroke-width="1.5"/><path d="M6 15 Q20 1 34 15 Z" fill="#cdb894" stroke="#111" stroke-width="2"/><rect x="14" y="30" width="3" height="2" fill="#d9a35a"/><rect x="23" y="33" width="3" height="2" fill="#d9a35a"/>';
export function waldoSagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'WALDO';
  $('lob-gesicht').innerHTML = WALDO_MINI;
}
// Torben (vorläufiges Gesicht: kurze Haare, Stoppelbart, orange Weste)
const TORBEN_MINI = '<circle cx="20" cy="22" r="14" fill="#eebda0" stroke="#111" stroke-width="2"/><path d="M7 17 Q20 3 33 17 Q28 10 20 10 Q12 10 7 17z" fill="#9a7444" stroke="#111" stroke-width="1.5"/><path d="M10 28 Q20 38 30 28" fill="none" stroke="#b08a68" stroke-width="3"/><circle cx="15" cy="21" r="1.8" fill="#111"/><circle cx="25" cy="21" r="1.8" fill="#111"/><path d="M6 40 L14 34 L26 34 L34 40z" fill="#e8741e" stroke="#111" stroke-width="1.5"/>';
export function torbenSagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'TORBEN';
  $('lob-gesicht').innerHTML = TORBEN_MINI;
}
// David (F3): blonde Haare oben, Seiten kurz, grauer Hoodie
const DAVID_MINI = '<circle cx="20" cy="22" r="13" fill="#f0c4a6" stroke="#111" stroke-width="2"/><path d="M8 18 Q12 6 22 7 Q32 8 33 17 Q28 11 21 12 Q14 12 8 18z" fill="#eee0b6" stroke="#111" stroke-width="1.5"/><path d="M16 30 Q20 32 24 30" fill="none" stroke="#c9a870" stroke-width="2.5"/><circle cx="15" cy="21" r="1.8" fill="#111"/><circle cx="25" cy="21" r="1.8" fill="#111"/><path d="M6 40 L13 34 L27 34 L34 40z" fill="#8d8f94" stroke="#111" stroke-width="1.5"/>';
export function davidSagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'DAVID';
  $('lob-gesicht').innerHTML = DAVID_MINI;
}
// Joel (E2b): Cap, voller brauner Bart, orange Weste
const JOEL_MINI = '<circle cx="20" cy="22" r="13" fill="#eebda0" stroke="#111" stroke-width="2"/><path d="M8 27 Q20 44 32 27 Q30 37 20 38 Q10 37 8 27z" fill="#5a3a22" stroke="#111" stroke-width="1.5"/><path d="M6 16 Q20 2 34 16 Z" fill="#2a2a2e" stroke="#111" stroke-width="2"/><circle cx="15" cy="21" r="1.8" fill="#111"/><circle cx="25" cy="21" r="1.8" fill="#111"/><path d="M6 40 L13 34 L27 34 L34 40z" fill="#b0702a" stroke="#111" stroke-width="1.5"/>';
export function joelSagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'JOEL';
  $('lob-gesicht').innerHTML = JOEL_MINI;
}
// Jonas (E3): lange dunkle Haare, Stoppeln, weiße Augenklappe
const JONAS_MINI = '<path d="M5 30 Q2 8 20 6 Q38 8 35 30 L31 30 L31 18 L9 18 L9 30z" fill="#2a1c12" stroke="#111" stroke-width="1.5"/><circle cx="20" cy="22" r="12" fill="#eebda0" stroke="#111" stroke-width="2"/><path d="M9 26 Q20 38 31 26 Q29 34 20 35 Q11 34 9 26z" fill="#3a2a1c" opacity="0.55"/><path d="M7 14 L33 20" stroke="#f4f4f0" stroke-width="2"/><ellipse cx="25" cy="21" rx="5" ry="4" fill="#f8f8f4" stroke="#111" stroke-width="1.5"/><circle cx="15" cy="21" r="1.8" fill="#111"/><path d="M15 29 Q20 31 25 29" stroke="#111" stroke-width="1.5" fill="none"/>';
export function jonasSagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'JONAS';
  $('lob-gesicht').innerHTML = JONAS_MINI;
}
// Fahrhilfe unten: Tasten beim Fahren
export function fahrHilfe(text) {
  const el = $('fahrhilfe');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('versteckt', !text);
}
export function jonnySagt(text, ms = 4500) {
  blaseRechts(text, ms, 'normal');
  $('lobblase').querySelector('b').textContent = 'JONNY';
  $('lob-gesicht').innerHTML = JONNY_MINI;
}

// Lautstärke-Leiste unten links
export function lautstaerkeLeiste(beiAenderung) {
  const el = $('ton');
  const knopf = el.querySelector('button');
  const regler = el.querySelector('input');
  let stumm = false;
  let wert = 0.8;
  try {
    const g = JSON.parse(localStorage.getItem('ton') || 'null');
    if (g) { stumm = !!g.stumm; wert = g.wert ?? 0.8; }
  } catch { /* egal */ }
  function zeigen() {
    regler.value = Math.round(wert * 100);
    regler.style.setProperty('--wert', `${stumm ? 0 : Math.round(wert * 100)}%`);
    knopf.innerHTML = stumm || wert === 0 ? SYMBOL.stumm : SYMBOL.laut;
    knopf.title = stumm ? 'Ton an' : 'Ton aus';
    beiAenderung(stumm ? 0 : wert);
    try { localStorage.setItem('ton', JSON.stringify({ stumm, wert })); } catch { /* egal */ }
  }
  knopf.addEventListener('click', () => { stumm = !stumm; zeigen(); });
  regler.addEventListener('input', () => { wert = regler.value / 100; stumm = false; zeigen(); });
  for (const e of ['pointerdown', 'keydown']) el.addEventListener(e, (ev) => ev.stopPropagation());
  zeigen();
}

// Band oben: Arbeitspause, solange Dennis auf dem Klo ist
export function pauseZeigen(an, text = '') {
  const el = $('pause');
  if (!el) return;
  el.querySelector('span').textContent = text;
  el.classList.toggle('versteckt', !an);
}

// Warnsymbole unten rechts (Feuer, Wasser), blinken, solange etwas los ist
const WARN_SYMBOL = {
  feuer: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 2 4 3 4-1-3 0-6 0-9z"/></svg>',
  klo: '<svg viewBox="0 0 24 24" class="ico"><path d="M6 3h7v6H6z"/><path d="M4 11h14a5 5 0 0 1-5 5h-1l1 5H8l1-5a5 5 0 0 1-5-5z"/></svg>',
  wasser: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/><path d="M9 14a3 3 0 0 0 3 3"/></svg>',
};
// Aufgaben-Leiste unten rechts (ersetzt die alten Warn-Kacheln): je offene Aufgabe ein Icon mit rotem Ring,
// der sich füllt (anteil 0..1). Voll = Dennis macht es selbst. liste: [{ id, titel, anteil, dringend }]
const AUFGABE_SYMBOL = {
  ...WARN_SYMBOL,
  dreck: '<svg viewBox="0 0 24 24" class="ico"><path d="M15 3l-4 9"/><path d="M7 12h8l2 9H5z"/><path d="M8 16v4M11 16v4M14 16v4"/></svg>',
  pumpe: '<svg viewBox="0 0 24 24" class="ico"><rect x="6" y="7" width="8" height="13" rx="2"/><path d="M7 7a3 3 0 0 1 6 0"/><path d="M14 16c3 0 5 1 5 3s-2 2-4 2"/></svg>',
  gurte: '<svg viewBox="0 0 24 24" class="ico"><circle cx="8" cy="12" r="5"/><circle cx="8" cy="12" r="2"/><path d="M13 12c3 0 3 4 6 4h2"/><rect x="17" y="14" width="5" height="4" rx="1"/></svg>',
  flaschen: '<svg viewBox="0 0 24 24" class="ico"><path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3z"/><path d="M8 13h8"/></svg>',
  erstehilfe: '<svg viewBox="0 0 24 24" class="ico"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M9 6V4h6v2"/><path d="M12 10v6M9 13h6"/></svg>',
  // A1: Mülltonnen (umgekippte Tonne), Grill (Feuerschale mit Dreibein), Hüfte (Rücken mit Schmerz-Strahlen),
  // Wäsche (Waschmaschine mit Bullauge), Leiter
  tonnen: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 14l12-6 3 6-12 6z"/><path d="M15 7l2-1 3 6-2 1"/><path d="M8 13l7-3.5M9.5 16l7-3.5"/><path d="M3 21h18"/></svg>',
  grill: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 3L5 21M12 3l7 18M12 3v8"/><path d="M7 14h10a5 3 0 0 1-10 0z"/><path d="M9 11h6"/></svg>',
  huefte: '<svg viewBox="0 0 24 24" class="ico"><circle cx="9" cy="5" r="2"/><path d="M9 7v6l-3 7M9 13l4 2 1 5"/><path d="M9 9l-3 3"/><path d="M15 10l3-1M15 13h4M15 16l3 1"/></svg>',
  waesche: '<svg viewBox="0 0 24 24" class="ico"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4.5"/><path d="M9.5 13.5c1 1 2 1 3 0s2-1 2.5 0"/><path d="M7 6h3M16 6h1"/></svg>',
  leiter: '<svg viewBox="0 0 24 24" class="ico"><path d="M8 3L5 21M16 3l3 18"/><path d="M7.5 7h9M7 11h10M6.3 15h11.4M5.6 19h12.8"/></svg>',
  akku: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 8h10v6H4z"/><path d="M14 10h5M14 12h5"/><path d="M7 14l-1 6h4l1-6"/></svg>',
  pritsche: '<svg viewBox="0 0 24 24" class="ico"><path d="M2 15V9h7l2 3h11v3z"/><circle cx="6" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  metall: '<svg viewBox="0 0 24 24" class="ico"><path d="M3 7h18M3 12h18M3 17h18"/><path d="M5 5v4M19 15v4"/></svg>',
  mettende: '<svg viewBox="0 0 24 24" class="ico"><path d="M5 15c3-6 11-6 14 0"/><path d="M4 18h16"/><path d="M8 21l1-3M16 21l-1-3"/></svg>',
  tassen: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 9h11v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M15 11h2a2 2 0 0 1 0 4h-2"/><path d="M8 3v3M11 3v3"/></svg>',
};
// Klick auf ein Aufgaben-Icon: spiel.js zeigt, wo die Sache ist
let aufgabeKlick = null;
export function beiAufgabeKlick(f) { aufgabeKlick = f; }
export function aufgabenIcons(liste) {
  const el = $('warnungen');
  if (!el) return;
  const da = new Set(liste.map((a) => a.id));
  for (const k of [...el.querySelectorAll('.aufgabe')]) if (!da.has(k.dataset.id)) k.remove();
  const U = 2 * Math.PI * 25;
  for (const a of liste) {
    let k = el.querySelector(`.aufgabe[data-id="${a.id}"]`);
    if (!k) {
      k = document.createElement('div');
      k.className = `aufgabe ${a.id}`;
      k.dataset.id = a.id;
      k.title = 'Klick: wo ist das?';
      k.addEventListener('click', () => { if (aufgabeKlick) aufgabeKlick(a.id); });
      k.innerHTML = `<svg viewBox="0 0 56 56" class="ring"><circle cx="28" cy="28" r="25" class="ring-hg"/><circle cx="28" cy="28" r="25" class="ring-voll" stroke-dasharray="${U}" stroke-dashoffset="${U}"/></svg>${AUFGABE_SYMBOL[a.id] || ''}<span class="aufgabe-text">${a.titel}</span>`;
      el.appendChild(k);
    }
    const anteil = Math.max(0, Math.min(1, a.anteil));
    k.querySelector('.ring-voll').setAttribute('stroke-dashoffset', String(U * (1 - anteil)));
    // erst gelb, ab drei Vierteln rot, in den letzten 10 s blinkt das Icon (ohne Ton)
    k.classList.toggle('gelb', anteil < 0.75);
    k.classList.toggle('blinkt', a.rest != null && a.rest <= 10 && anteil < 1);
    k.classList.toggle('dringend', !!a.dringend);
    k.classList.toggle('voll', anteil >= 1);
  }
}
export function warnung(art, an) {
  return; // ersetzt durch aufgabenZeigen (Paket B); bleibt, damit alte Aufrufe nichts kaputt machen
  const el = $('warnungen');
  if (!el) return;
  let w = el.querySelector(`[data-art="${art}"]`);
  if (an && !w) {
    w = document.createElement('div');
    w.className = `warnung ${art}`;
    w.dataset.art = art;
    w.innerHTML = WARN_SYMBOL[art] || '';
    el.appendChild(w);
  } else if (!an && w) w.remove();
}
