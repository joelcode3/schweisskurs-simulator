// Gezeichnetes Comic-Gesicht von Dennis (Platzhalter, bis echte Clips da sind) und Symbole.

const HAUT = { ruhig: '#efc3a6', skeptisch: '#efc3a6', froh: '#efc3a6', sauer: '#ee9a80', wut: '#e5503a' };
const HAAR = ['#d9b273', '#c99d5f', '#e6c48a', '#bb8d52'];

// Locken als Kreise auf einer Ellipse (deterministisch)
function locken(cx, cy, rx, ry, anzahl, rMin, rMax, vonW, bisW) {
  let s = 11;
  const z = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  let out = '';
  for (let i = 0; i < anzahl; i++) {
    const w = vonW + (bisW - vonW) * (i / (anzahl - 1)) + (z() - 0.5) * 0.15;
    const f = 0.75 + z() * 0.3;
    const x = cx + Math.cos(w) * rx * f;
    const y = cy + Math.sin(w) * ry * f;
    const r = rMin + z() * (rMax - rMin);
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${HAAR[i % HAAR.length]}"/>`;
  }
  return out;
}

function brauen(stimmung, cx, y, abstand, laenge) {
  const w = { ruhig: 0, skeptisch: 8, froh: -10, sauer: 18, wut: 26 }[stimmung] ?? 0;
  const links = `M${cx - abstand - laenge} ${y - w * 0.15} L${cx - abstand} ${y + w * 0.45}`;
  const rechtsHoch = stimmung === 'skeptisch' ? -8 : 0;
  const rechts = `M${cx + abstand} ${y + w * 0.45 + rechtsHoch} L${cx + abstand + laenge} ${y - w * 0.15 + rechtsHoch}`;
  return `<path d="${links}"/><path d="${rechts}"/>`;
}

export function dennisPortrait(stimmung = 'ruhig') {
  const haut = HAUT[stimmung] || HAUT.ruhig;
  const cx = 100;
  const wut = stimmung === 'wut';
  const strahlen = wut || stimmung === 'sauer'
    ? Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2;
      const r1 = 46;
      const r2 = 120;
      return `<path d="M${cx + Math.cos(a) * r1} ${66 + Math.sin(a) * r1} L${cx + Math.cos(a + 0.07) * r2} ${66 + Math.sin(a + 0.07) * r2} L${cx + Math.cos(a - 0.07) * r2} ${66 + Math.sin(a - 0.07) * r2}Z" fill="${wut ? '#ff6a3d' : '#ffb03a'}" opacity="0.55"/>`;
    }).join('')
    : '';
  const dampf = wut
    ? `<g class="dampf" fill="#fff" stroke="#111" stroke-width="2.5">
         <circle cx="44" cy="70" r="7"/><circle cx="34" cy="60" r="9"/><circle cx="22" cy="48" r="11"/>
         <circle cx="156" cy="70" r="7"/><circle cx="166" cy="60" r="9"/><circle cx="178" cy="48" r="11"/>
       </g>`
    : '';
  let mund;
  if (wut) {
    mund = `<g class="mund"><path d="M84 96 Q100 90 116 96 Q114 116 100 117 Q86 116 84 96Z" fill="#5a1a14" stroke="#111" stroke-width="3"/>
      <path d="M88 96 Q100 92 112 96 L110 100 Q100 97 90 100Z" fill="#fff"/></g>`;
  } else if (stimmung === 'sauer') {
    mund = `<g class="mund"><ellipse cx="100" cy="101" rx="9" ry="7" fill="#5a1a14" stroke="#111" stroke-width="3"/></g>`;
  } else if (stimmung === 'froh') {
    mund = `<g class="mund"><path d="M87 97 Q100 110 113 97 Z" fill="#fff" stroke="#111" stroke-width="3" stroke-linejoin="round"/></g>`;
  } else {
    mund = `<g class="mund"><path d="M91 100 Q100 98 109 100" fill="none" stroke="#111" stroke-width="3.5" stroke-linecap="round"/></g>`;
  }
  const augenY = 68;
  const pupille = stimmung === 'skeptisch' ? 2.5 : 0;
  const augen = wut
    ? `<circle cx="87" cy="${augenY}" r="6.5" fill="#fff" stroke="#111" stroke-width="2.5"/><circle cx="113" cy="${augenY}" r="6.5" fill="#fff" stroke="#111" stroke-width="2.5"/>
       <circle cx="87" cy="${augenY}" r="2" fill="#111"/><circle cx="113" cy="${augenY}" r="2" fill="#111"/>`
    : `<ellipse cx="87" cy="${augenY}" rx="4.5" ry="5" fill="#fff" stroke="#111" stroke-width="2.5"/><ellipse cx="113" cy="${augenY}" rx="4.5" ry="5" fill="#fff" stroke="#111" stroke-width="2.5"/>
       <circle cx="${87 + pupille}" cy="${augenY + 0.5}" r="2.6" fill="#2f5f86"/><circle cx="${113 + pupille}" cy="${augenY + 0.5}" r="2.6" fill="#2f5f86"/>`;
  return `<svg class="platzhalter" viewBox="0 0 200 125" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="125" fill="${wut ? '#ffd23a' : stimmung === 'froh' ? '#bfe8a8' : '#ffe27a'}"/>
    ${strahlen}
    <path d="M50 125 Q58 106 100 104 Q142 106 150 125Z" fill="#232528" stroke="#111" stroke-width="3"/>
    <path d="M56 117 L144 117" stroke="#d4d8dc" stroke-width="3"/>
    <path d="M74 110 L70 125 M126 110 L130 125" stroke="#2b63c6" stroke-width="7"/>
    <path d="M80 104 Q100 116 120 104 Q118 98 100 99 Q82 98 80 104Z" fill="#6d7177" stroke="#111" stroke-width="2.5"/>
    <path d="M95 106 L94 118 M105 106 L106 118" stroke="#d4d8dc" stroke-width="1.6"/>
    <g stroke="#111" stroke-width="2.5">${locken(100, 52, 44, 36, 26, 9, 13, Math.PI * 0.92, Math.PI * 2.08)}</g>
    <ellipse cx="66" cy="74" rx="6" ry="9" fill="${haut}" stroke="#111" stroke-width="3"/>
    <ellipse cx="134" cy="74" rx="6" ry="9" fill="${haut}" stroke="#111" stroke-width="3"/>
    <path d="M68 58 Q68 34 100 34 Q132 34 132 58 L131 86 Q128 114 100 114 Q72 114 69 86Z" fill="${haut}" stroke="#111" stroke-width="3.5"/>
    <g stroke="#111" stroke-width="2">${locken(100, 40, 30, 12, 9, 7, 10, Math.PI * 1.05, Math.PI * 1.95)}</g>
    <path d="M86 106 Q100 112 114 106 Q110 114 100 114 Q90 114 86 106Z" fill="#d9a48a" opacity="0.7"/>
    ${augen}
    <g fill="none" stroke="#c9a13b" stroke-width="2.4">
      <path d="M75 61 Q87 58 98 61 Q98 75 87 77 Q76 75 75 61Z"/>
      <path d="M102 61 Q113 58 125 61 Q124 75 113 77 Q102 75 102 61Z"/>
      <path d="M98 61 L102 61 M96 57 Q100 55 104 57 M75 62 L68 66 M125 62 L132 66"/>
    </g>
    <g stroke="#b07a40" stroke-width="3.5" stroke-linecap="round">${brauen(stimmung, 100, 53, 5, 16)}</g>
    <path d="M97 70 Q94 84 98 87 Q103 88 104 84" fill="${haut}" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
    ${mund}
    <path d="M82 99 Q86 89 100 91 Q114 89 118 99 Q116 104 112 103 Q108 95 100 96 Q92 95 88 103 Q84 104 82 99Z" fill="#c9904f" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
    ${dampf}
  </svg>`;
}

export function dennisMini(stimmung = 'ruhig') {
  const haut = HAUT[stimmung] || HAUT.ruhig;
  const w = { ruhig: 0, skeptisch: 3, froh: -3, sauer: 5, wut: 7 }[stimmung] ?? 0;
  const mund = stimmung === 'wut'
    ? '<ellipse cx="20" cy="31" rx="4" ry="3" fill="#5a1a14" stroke="#111" stroke-width="1.3"/>'
    : stimmung === 'sauer'
      ? '<ellipse cx="20" cy="31" rx="2.5" ry="2" fill="#5a1a14" stroke="#111" stroke-width="1.3"/>'
      : '';
  return `<rect width="40" height="40" rx="8" fill="${stimmung === 'wut' ? '#e23b2e' : stimmung === 'sauer' ? '#ffb03a' : '#ffd94a'}"/>
    <g stroke="#111" stroke-width="1">${locken(20, 14, 13, 9, 14, 3.2, 4.6, Math.PI * 0.9, Math.PI * 2.1)}</g>
    <path d="M11 16 Q11 9 20 9 Q29 9 29 16 L29 25 Q28 35 20 35 Q12 35 11 25Z" fill="${haut}" stroke="#111" stroke-width="1.8"/>
    <g fill="none" stroke="#c9a13b" stroke-width="1.2"><rect x="12" y="17" width="7" height="6" rx="2.5"/><rect x="21" y="17" width="7" height="6" rx="2.5"/><path d="M19 18.5 L21 18.5"/></g>
    <circle cx="15.5" cy="20" r="1.2" fill="#111"/><circle cx="24.5" cy="20" r="1.2" fill="#111"/>
    <path d="M12 ${15 - w * 0.2} L18 ${15.5 + w * 0.4} M28 ${15 - w * 0.2} L22 ${15.5 + w * 0.4}" stroke="#b07a40" stroke-width="1.8" stroke-linecap="round"/>
    ${mund}
    <path d="M14 30 Q16 26 20 27 Q24 26 26 30 Q24 31 23 29.5 Q20 28.5 17 29.5 Q16 31 14 30Z" fill="#c9904f" stroke="#111" stroke-width="1"/>`;
}

// Linien-Symbole (keine Emojis)
export const SYMBOL = {
  brille: '<svg viewBox="0 0 32 32" class="ico"><path d="M3 13h26M5 13v5a4 4 0 0 0 4 4h3a4 4 0 0 0 4-4 4 4 0 0 0 4 4h3a4 4 0 0 0 4-4v-5"/></svg>',
  handschuhe: '<svg viewBox="0 0 32 32" class="ico"><path d="M10 29V17l-3-5a2 2 0 0 1 3-2l2 3V6a2 2 0 0 1 4 0v6-8a2 2 0 0 1 4 0v8-6a2 2 0 0 1 4 0v12c0 4-2 7-4 8v3"/></svg>',
  maske: '<svg viewBox="0 0 32 32" class="ico"><path d="M8 13c1-5 15-5 16 0c1 7-3 13-8 13s-9-6-8-13z"/><path d="M12 9.5c2-1 6-1 8 0"/><circle cx="16" cy="19" r="2.6"/><path d="M8 13C4 13 3 17 3 19M24 13c4 0 5 4 5 6M8.5 19C5 20 4 23 4 25M23.5 19c3.5 1 4.5 4 4.5 6"/></svg>',
  helm: '<svg viewBox="0 0 32 32" class="ico"><path d="M5 18c0-8 5-13 11-13s11 5 11 13v6H5z"/><rect x="11" y="13" width="10" height="5" rx="1"/><path d="M5 24h22"/></svg>',
  hand: '<svg viewBox="0 0 24 24" class="ico"><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5V3.5a1.5 1.5 0 0 1 3 0V10V4.5a1.5 1.5 0 0 1 3 0V11v-3a1.5 1.5 0 0 1 3 0v6c0 4-3 7-7 7s-6-2-8-5l-2-3a1.5 1.5 0 0 1 2.5-1.5L7 14"/></svg>',
  werkzeug: '<svg viewBox="0 0 24 24" class="ico"><path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.7-6.7a4 4 0 0 1-5-5L13 5z"/><path d="M3 21l6-6"/></svg>',
  tragen: '<svg viewBox="0 0 24 24" class="ico"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  funke: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></svg>',
  wasser: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/></svg>',
  ventil: '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="7"/><path d="M12 5v14M5 12h14"/></svg>',
  stift: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/></svg>',
  regler: '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="8"/><path d="M12 12l4-4"/></svg>',
  klemme: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 8l10 3M4 16l10-3M14 11v2M14 12h6"/></svg>',
  hammer: '<svg viewBox="0 0 24 24" class="ico"><path d="M14 4l6 6-3 3-6-6zM11 9L3 17l3 3 8-8"/></svg>',
  frage: '<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.5"/></svg>',
  abgeben: '<svg viewBox="0 0 24 24" class="ico"><path d="M5 12l5 5L20 7"/></svg>',
  tasse: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/></svg>',
  auge: '<svg viewBox="0 0 24 24" class="ico"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  ort: '<svg viewBox="0 0 24 24" class="ico"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  haken: '<svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7"/></svg>',
  laut: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  stumm: '<svg viewBox="0 0 24 24" class="ico"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" class="ico"><path d="M7 5l12 7-12 7z"/></svg>',
};
