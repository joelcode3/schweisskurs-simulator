// Alle Geräusche werden live erzeugt (keine Audiodateien nötig).
let ctx = null;
let master = null;
let rausch = null;
let lautstaerke = 0.8;
export function setzeLautstaerke(v) {
  lautstaerke = v;
  if (master) master.gain.setTargetAtTime(v * 0.875, ctx.currentTime, 0.03);
}

export function audioStart() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = lautstaerke * 0.875;
    master.connect(ctx.destination);
    const len = ctx.sampleRate * 2;
    rausch = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = rausch.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
}

function rauschQuelle() {
  const q = ctx.createBufferSource();
  q.buffer = rausch;
  q.loop = true;
  q.loopStart = Math.random();
  return q;
}

function huelle(gain, t, a, h, r, wert = 1) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(wert, t + a);
  gain.gain.setValueAtTime(wert, t + a + h);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + a + h + r);
}

export function blip(hoch = 880, lang = 0.08, lautst = 0.25) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(hoch, t);
  o.frequency.exponentialRampToValueAtTime(hoch * 1.5, t + lang);
  huelle(g, t, 0.005, lang * 0.5, lang * 0.5, lautst);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + lang + 0.05);
}

export function klonk(lautst = 0.6) {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (const [f, v] of [[620, 1], [1480, 0.5], [2650, 0.3]]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f * (0.95 + Math.random() * 0.1);
    huelle(g, t, 0.002, 0.01, 0.25, lautst * v);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.35);
  }
  const q = rauschQuelle();
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 2500;
  const g = ctx.createGain();
  huelle(g, t, 0.001, 0.01, 0.05, lautst * 0.6);
  q.connect(f).connect(g).connect(master);
  q.start(t);
  q.stop(t + 0.1);
}

export function kratzen() {
  if (!ctx) return;
  const t = ctx.currentTime;
  for (let i = 0; i < 4; i++) {
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3000 + Math.random() * 1500;
    f.Q.value = 2;
    const g = ctx.createGain();
    huelle(g, t + i * 0.16, 0.02, 0.08, 0.04, 0.35);
    q.connect(f).connect(g).connect(master);
    q.start(t + i * 0.16);
    q.stop(t + i * 0.16 + 0.2);
  }
}

// Dauergeräusche: Flex, Schweißen, Gas, Wasser. Rückgabe: { stopp(), staerke(x) }
export function dauer(art) {
  if (!ctx) return { stopp() {}, staerke() {} };
  const t = ctx.currentTime;
  const aus = ctx.createGain();
  aus.gain.setValueAtTime(0.0001, t);
  aus.gain.exponentialRampToValueAtTime(1, t + 0.15);
  aus.connect(master);
  const knoten = [];
  let staerkeGain = null;

  if (art === 'flex') {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = 190;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 23;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 6;
    lfo.connect(lfoG).connect(o.frequency);
    const og = ctx.createGain();
    og.gain.value = 0.08;
    o.connect(og).connect(aus);
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 4200;
    f.Q.value = 0.8;
    staerkeGain = ctx.createGain();
    staerkeGain.gain.value = 0.05;
    q.connect(f).connect(staerkeGain).connect(aus);
    knoten.push(o, lfo, q);
  } else if (art === 'schweissen') {
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 1800;
    const knister = ctx.createGain();
    knister.gain.value = 0;
    q.connect(f).connect(knister).connect(aus);
    // zufälliges Knistern
    const intervall = setInterval(() => {
      if (!ctx) return;
      const jetzt = ctx.currentTime;
      knister.gain.cancelScheduledValues(jetzt);
      knister.gain.setValueAtTime(0.05 + Math.random() * 0.35 * (staerkeGain ? staerkeGain.gain.value : 1), jetzt);
      knister.gain.exponentialRampToValueAtTime(0.03, jetzt + 0.04);
    }, 35);
    staerkeGain = ctx.createGain();
    staerkeGain.gain.value = 1;
    const brumm = ctx.createOscillator();
    brumm.type = 'square';
    brumm.frequency.value = 100;
    const bg = ctx.createGain();
    bg.gain.value = 0.02;
    brumm.connect(bg).connect(aus);
    knoten.push(q, brumm);
    knoten.intervall = intervall;
  } else if (art === 'gas' || art === 'wasser') {
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = art === 'gas' ? 'highpass' : 'lowpass';
    f.frequency.value = art === 'gas' ? 3500 : 900;
    const g = ctx.createGain();
    g.gain.value = art === 'gas' ? 0.18 : 0.4;
    q.connect(f).connect(g).connect(aus);
    if (art === 'wasser') {
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 7;
      const lg = ctx.createGain();
      lg.gain.value = 300;
      lfo.connect(lg).connect(f.frequency);
      knoten.push(lfo);
    }
    knoten.push(q);
  }
  for (const k of knoten) k.start(t);
  return {
    staerke(x) {
      if (art === 'flex' && staerkeGain) staerkeGain.gain.setTargetAtTime(0.05 + x * 0.25, ctx.currentTime, 0.05);
      if (art === 'schweissen' && staerkeGain) staerkeGain.gain.value = x;
    },
    stopp() {
      const j = ctx.currentTime;
      aus.gain.cancelScheduledValues(j);
      aus.gain.setValueAtTime(aus.gain.value, j);
      aus.gain.exponentialRampToValueAtTime(0.0001, j + 0.12);
      for (const k of knoten) k.stop(j + 0.15);
      if (knoten.intervall) clearInterval(knoten.intervall);
    },
  };
}

// Platzhalter-Stimme für Dennis, solange keine echten Clips da sind: Brummeln in Silben.
// Gebrabbel ohne Aufnahme: gedämpfte Posaune wie die Erwachsenen bei den Peanuts ("wah-wah-wah")
export function brummeln(silben = 8, wut = 0) {
  if (!ctx) return 0;
  let t = ctx.currentTime + 0.05;
  const start = t;
  const woerter = Math.max(2, Math.ceil(silben * 0.7));
  // Wah-Kurve: Dämpfer geht auf und wieder zu
  const kurve = (lo, hi) => Float32Array.from({ length: 24 }, (_, i) => lo + (hi - lo) * Math.pow(Math.sin(Math.PI * i / 23), 1.5));
  for (let i = 0; i < woerter; i++) {
    const lang = (0.14 + Math.random() * 0.12) * (1 - wut * 0.2);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const grund = (195 + wut * 50) * (0.86 + Math.random() * 0.28);
    o.frequency.setValueAtTime(grund, t);
    o.frequency.linearRampToValueAtTime(grund * 1.12, t + lang * 0.5);
    o.frequency.linearRampToValueAtTime(grund * 0.92, t + lang);
    const offen = kurve(500, 2400 + wut * 800);
    const f1 = ctx.createBiquadFilter();
    const f2 = ctx.createBiquadFilter();
    for (const f of [f1, f2]) {
      f.type = 'lowpass';
      f.Q.value = 2.5 + wut * 2;
      f.frequency.setValueCurveAtTime(offen, t, lang);
    }
    const g = ctx.createGain();
    huelle(g, t, 0.025, lang - 0.05, 0.04, 0.55 + wut * 0.35);
    o.connect(f1).connect(f2).connect(g).connect(master);
    o.start(t);
    o.stop(t + lang + 0.06);
    t += lang + (0.03 + Math.random() * 0.1) * (1 - wut * 0.5);
  }
  return t - start;
}

export function rumms() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(140, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.3);
  huelle(g, t, 0.005, 0.05, 0.35, 0.9);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.5);
}

export function jingle(gut = true) {
  if (!ctx) return;
  const noten = gut ? [523, 659, 784, 1046] : [392, 370, 349, 262];
  noten.forEach((f, i) => {
    const t = ctx.currentTime + i * 0.13;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = f;
    huelle(g, t, 0.01, 0.08, 0.2, 0.3);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.4);
  });
}

// Gesprochene Dennis-Sätze (Aufnahmen aus stimme/). Rückgabe: { fertig, pegel(), stopp() } oder null.
const stimmPuffer = new Map();
async function ladeStimme(url) {
  if (!stimmPuffer.has(url)) {
    stimmPuffer.set(url, fetch(url).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
      return r.arrayBuffer();
    }).then((d) => new Promise((ok, fehler) => ctx.decodeAudioData(d, ok, fehler))));
  }
  return stimmPuffer.get(url);
}
export async function stimmeAbspielen(url) {
  if (!ctx) return null;
  let puffer;
  try {
    puffer = await ladeStimme(url);
  } catch {
    stimmPuffer.delete(url);
    return null;
  }
  const quelle = ctx.createBufferSource();
  quelle.buffer = puffer;
  const analyse = ctx.createAnalyser();
  analyse.fftSize = 512;
  const g = ctx.createGain();
  g.gain.value = 1.1;
  quelle.connect(analyse).connect(g).connect(master);
  const daten = new Uint8Array(analyse.fftSize);
  const fertig = new Promise((res) => { quelle.onended = res; });
  quelle.start();
  return {
    dauer: puffer.duration,
    fertig,
    lautstaerke(v) { g.gain.setTargetAtTime(v, ctx.currentTime, 0.05); },
    pegel() {
      analyse.getByteTimeDomainData(daten);
      let summe = 0;
      for (const v of daten) summe += ((v - 128) / 128) ** 2;
      return Math.sqrt(summe / daten.length);
    },
    stopp() { try { quelle.stop(); } catch { /* schon zu Ende */ } },
  };
}

// Techno aus der Box: 128 BPM, Kick, Offbeat-Hihat, Clap, Bass. Wird live erzeugt.
let techno = null;
export function technoAn() {
  if (!ctx || techno) return;
  const spb = 60 / 128;
  const bus = ctx.createGain();
  bus.gain.value = 0.5;
  bus.connect(master);
  const start = ctx.currentTime + 0.05;
  let naechste = start;
  let schritt = 0;
  const bassNoten = [55, 55, 65.41, 55, 55, 73.42, 55, 49];
  function kick(t) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    huelle(g, t, 0.002, 0.02, 0.25, 1);
    o.connect(g).connect(bus);
    o.start(t);
    o.stop(t + 0.32);
  }
  function rauschen(t, typ, freq, lautst, lang) {
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = typ;
    f.frequency.value = freq;
    const g = ctx.createGain();
    huelle(g, t, 0.001, 0.005, lang, lautst);
    q.connect(f).connect(g).connect(bus);
    q.start(t);
    q.stop(t + lang + 0.05);
  }
  function bass(t, freq) {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = 6;
    f.frequency.setValueAtTime(900, t);
    f.frequency.exponentialRampToValueAtTime(180, t + spb / 4);
    const g = ctx.createGain();
    huelle(g, t, 0.005, spb / 8, spb / 8, 0.28);
    o.connect(f).connect(g).connect(bus);
    o.start(t);
    o.stop(t + spb / 4 + 0.05);
  }
  const iv = setInterval(() => {
    while (naechste < ctx.currentTime + 0.2) {
      const s = schritt % 16;
      if (s % 4 === 0) kick(naechste);
      if (s % 4 === 2) rauschen(naechste, 'highpass', 7000, 0.22, 0.05);
      if (s === 4 || s === 12) rauschen(naechste, 'bandpass', 1500, 0.45, 0.12);
      if (s % 2 === 1) bass(naechste, bassNoten[(schritt >> 1) % 8]);
      naechste += spb / 4;
      schritt++;
    }
  }, 40);
  techno = { iv, bus, start, spb };
}
export function technoAus() {
  if (!techno) return;
  clearInterval(techno.iv);
  const j = ctx.currentTime;
  techno.bus.gain.setValueAtTime(techno.bus.gain.value, j);
  techno.bus.gain.exponentialRampToValueAtTime(0.0001, j + 0.3);
  techno = null;
}
// Aktuelle Position im Takt (1.0 = ein Schlag) oder null, wenn aus
export function technoBeat() {
  if (!techno) return null;
  return Math.max(0, (ctx.currentTime - techno.start) / techno.spb);
}

export function klospuelung() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const q = rauschQuelle();
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.setValueAtTime(2500, t);
  f.frequency.exponentialRampToValueAtTime(300, t + 2.5);
  const g = ctx.createGain();
  huelle(g, t, 0.15, 1.2, 1.4, 0.35);
  q.connect(f).connect(g).connect(master);
  q.start(t);
  q.stop(t + 3);
}

export function mampfen() {
  if (!ctx) return;
  for (let i = 0; i < 4; i++) {
    const t = ctx.currentTime + i * 0.22;
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 900 + Math.random() * 600;
    const g = ctx.createGain();
    huelle(g, t, 0.01, 0.04, 0.08, 0.3);
    q.connect(f).connect(g).connect(master);
    q.start(t);
    q.stop(t + 0.2);
  }
}

export function klick() {
  blip(1500, 0.03, 0.15);
}
