// Bedienoberfläche: Auftragszettel, Wutanzeige, Ausrüstung, Aktionsmenü, Dialoge.
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
  ol.innerHTML = liste.map((a) => {
    let klasse = '';
    if (a.fertig) klasse = 'fertig';
    else if (!aktivGesetzt) { klasse = 'aktiv'; aktivGesetzt = true; }
    return `<li class="${klasse}"><span class="box">${a.fertig ? SYMBOL.haken : ''}</span><span>${a.text}</span></li>`;
  }).join('');
}

$('zettel-kopf').addEventListener('click', () => $('zettel').classList.toggle('zu'));
if (window.innerHeight < 500 || window.innerWidth < 600) $('zettel').classList.add('zu');

export function wutZeigen(wert, stimmung) {
  // Verlauf immer über die ganze Balkenbreite: grün links, rot rechts
  const w = Math.max(1, Math.min(100, wert));
  $('wut-fuellung').style.width = `${Math.min(100, wert)}%`;
  $('wut-fuellung').style.backgroundSize = `${10000 / w}% 100%`;
  $('wut-gesicht').innerHTML = dennisMini(stimmung);
  const stufe = wert >= 85 ? 'kurz vorm Platzen' : wert >= 60 ? 'stinksauer' : wert >= 35 ? 'genervt' : wert >= 12 ? 'skeptisch' : 'entspannt';
  $('wut-stufe').textContent = stufe;
}
export function wutWackeln() {
  const w = $('wut');
  w.classList.remove('wackelt');
  void w.offsetWidth;
  w.classList.add('wackelt');
}

export function ausruestungZeigen(ppe) {
  const teile = [['brille', 'Schutzbrille'], ['handschuhe', 'Handschuhe'], ['helm', 'Schweißhelm']];
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
