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
export function dauer(art, lautst = 1) {
  if (!ctx) return { stopp() {}, staerke() {} };
  const t = ctx.currentTime;
  const aus = ctx.createGain();
  // sofort da (sehr kurzes Einblenden, kein Verzögerungsgefühl)
  aus.gain.setValueAtTime(0, t);
  aus.gain.linearRampToValueAtTime(lautst, t + 0.02);
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
      aus.gain.linearRampToValueAtTime(0, j + 0.1);
      for (const k of knoten) k.stop(j + 0.15);
      if (knoten.intervall) clearInterval(knoten.intervall);
    },
  };
}

// Platzhalter-Stimme für Dennis, solange keine echten Clips da sind: Brummeln in Silben.
// Gebrabbel ohne Aufnahme: gedämpfte Posaune wie die Erwachsenen bei den Peanuts ("wah-wah-wah")
// Rückgabe: { dauer, stopp(ausblenden), lautstaerke(v) }
export function brummeln(silben = 8, wut = 0, lautst = 1) {
  if (!ctx) return { dauer: 0, stopp() {}, lautstaerke() {} };
  const bus = ctx.createGain();
  bus.gain.value = lautst;
  bus.connect(master);
  const quellen = [];
  let t = ctx.currentTime + 0.02;
  const start = t;
  const woerter = Math.max(2, Math.ceil(silben * 0.7));
  // Wah-Kurve: Dämpfer geht auf und wieder zu
  const kurve = (lo, hi) => Float32Array.from({ length: 24 }, (_, i) => lo + (hi - lo) * Math.pow(Math.sin(Math.PI * i / 23), 1.5));
  for (let i = 0; i < woerter; i++) {
    const lang = (0.14 + Math.random() * 0.12) * (1 - wut * 0.2);
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    const grund = (140 + wut * 45) * (0.86 + Math.random() * 0.28);
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
    o.connect(f1).connect(f2).connect(g).connect(bus);
    o.start(t);
    o.stop(t + lang + 0.06);
    quellen.push(o);
    t += lang + (0.03 + Math.random() * 0.1) * (1 - wut * 0.5);
  }
  const dauer = t - start;
  let aus = false;
  return {
    dauer,
    lautstaerke(v) { if (!aus) bus.gain.setTargetAtTime(v, ctx.currentTime, 0.02); },
    stopp(ausblenden = 0.25) {
      if (aus) return;
      aus = true;
      const j = ctx.currentTime;
      bus.gain.cancelScheduledValues(j);
      bus.gain.setValueAtTime(bus.gain.value, j);
      bus.gain.linearRampToValueAtTime(0, j + ausblenden);
      for (const o of quellen) { try { o.stop(j + ausblenden + 0.05); } catch { /* schon aus */ } }
    },
  };
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
export async function stimmeAbspielen(url, lautst = 1.1) {
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
  g.gain.value = lautst;
  quelle.connect(analyse).connect(g).connect(master);
  const daten = new Uint8Array(analyse.fftSize);
  const fertig = new Promise((res) => { quelle.onended = res; });
  quelle.start();
  return {
    dauer: puffer.duration,
    fertig,
    lautstaerke(v) { g.gain.setTargetAtTime(v, ctx.currentTime, 0.02); },
    pegel() {
      analyse.getByteTimeDomainData(daten);
      let summe = 0;
      for (const v of daten) summe += ((v - 128) / 128) ** 2;
      return Math.sqrt(summe / daten.length);
    },
    stopp(ausblenden = 0.2) {
      const j = ctx.currentTime;
      g.gain.cancelScheduledValues(j);
      g.gain.setValueAtTime(g.gain.value, j);
      g.gain.linearRampToValueAtTime(0, j + ausblenden);
      try { quelle.stop(j + ausblenden + 0.02); } catch { /* schon zu Ende */ }
    },
  };
}
// Aufnahmen vorab laden, damit Ton und Sprechblase gleichzeitig kommen
export function stimmenVorladen(urls) {
  if (!ctx) return;
  for (const u of urls) ladeStimme(u).catch(() => stimmPuffer.delete(u));
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

// Klospülung: Hebel, rauschendes Wasser mit Gluckern, danach leises Nachlaufen
export function klospuelung(lautst = 1) {
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  const bus = ctx.createGain();
  bus.gain.value = 0.5 * lautst;
  bus.connect(master);
  // Hebel: kurzes Klacken
  const k = rauschQuelle();
  const kf = ctx.createBiquadFilter();
  kf.type = 'bandpass';
  kf.frequency.value = 2500;
  kf.Q.value = 3;
  const kg = ctx.createGain();
  huelle(kg, t, 0.002, 0.01, 0.05, 0.6);
  k.connect(kf).connect(kg).connect(bus);
  k.start(t);
  k.stop(t + 0.1);
  // Wasserschwall: Rauschen, tiefer werdend, schwankende Lautstärke (Strudel)
  const w = rauschQuelle();
  const wf = ctx.createBiquadFilter();
  wf.type = 'bandpass';
  wf.Q.value = 0.8;
  wf.frequency.setValueAtTime(1400, t + 0.15);
  wf.frequency.exponentialRampToValueAtTime(500, t + 3.2);
  const wg = ctx.createGain();
  wg.gain.setValueAtTime(0.0001, t + 0.1);
  wg.gain.exponentialRampToValueAtTime(0.9, t + 0.45);
  wg.gain.setValueAtTime(0.9, t + 2.0);
  wg.gain.exponentialRampToValueAtTime(0.0001, t + 3.6);
  const strudel = ctx.createOscillator();
  strudel.frequency.value = 6;
  const sg = ctx.createGain();
  sg.gain.value = 0.25;
  const mod = ctx.createGain();
  mod.gain.value = 0.75;
  strudel.connect(sg).connect(mod.gain);
  w.connect(wf).connect(wg).connect(mod).connect(bus);
  w.start(t + 0.1);
  w.stop(t + 3.7);
  strudel.start(t + 0.1);
  strudel.stop(t + 3.7);
  // Gluckern: kurze steigende Blubber-Töne
  for (let i = 0; i < 14; i++) {
    const b = t + 0.8 + Math.random() * 2.6;
    const o = ctx.createOscillator();
    o.type = 'sine';
    const f0 = 220 + Math.random() * 260;
    o.frequency.setValueAtTime(f0, b);
    o.frequency.exponentialRampToValueAtTime(f0 * 2.4, b + 0.06);
    const g = ctx.createGain();
    huelle(g, b, 0.005, 0.02, 0.05, 0.12 + Math.random() * 0.1);
    o.connect(g).connect(bus);
    o.start(b);
    o.stop(b + 0.1);
  }
  // Spülkasten läuft nach: leises hohes Zischen
  const n = rauschQuelle();
  const nf = ctx.createBiquadFilter();
  nf.type = 'bandpass';
  nf.frequency.value = 3200;
  nf.Q.value = 1.5;
  const ng = ctx.createGain();
  huelle(ng, t + 2.8, 0.4, 1.6, 0.8, 0.12);
  n.connect(nf).connect(ng).connect(bus);
  n.start(t + 2.8);
  n.stop(t + 5.8);
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

// Husten: kurze, kräftige Rauschstöße mit Brust-Resonanz (laut = Dennis hustet demonstrativ)
export function husten(lautst = 1, stoesse = 3) {
  if (!ctx) return;
  let t = ctx.currentTime + 0.02;
  for (let i = 0; i < stoesse; i++) {
    const q = rauschQuelle();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 420 + Math.random() * 160;
    f.Q.value = 1.1;
    const g = ctx.createGain();
    huelle(g, t, 0.012, 0.05, 0.16, lautst * (i === 0 ? 1 : 0.8));
    q.connect(f).connect(g).connect(master);
    // tiefer „Kehl“-Anteil
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.18);
    const og = ctx.createGain();
    huelle(og, t, 0.01, 0.03, 0.14, lautst * 0.18);
    o.connect(og).connect(master);
    q.start(t); q.stop(t + 0.3);
    o.start(t); o.stop(t + 0.25);
    t += 0.24 + Math.random() * 0.12;
  }
}

// Bierflasche öffnen: Kronkorken-Plopp und kurzes Zischen
export function bierAuf(lautst = 0.7) {
  if (!ctx) return;
  const t = ctx.currentTime;
  // Plopp: kurzer, tief fallender Ton
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(900, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.06);
  huelle(g, t, 0.002, 0.01, 0.08, lautst);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.15);
  // Kronkorken klickt
  const k = ctx.createOscillator();
  const kg = ctx.createGain();
  k.type = 'triangle';
  k.frequency.value = 3200;
  huelle(kg, t + 0.01, 0.001, 0.005, 0.04, lautst * 0.35);
  k.connect(kg).connect(master);
  k.start(t + 0.01);
  k.stop(t + 0.08);
  // Zischen (Kohlensäure)
  const q = rauschQuelle();
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 4500;
  const zg = ctx.createGain();
  huelle(zg, t + 0.04, 0.01, 0.12, 0.45, lautst * 0.45);
  q.connect(f).connect(zg).connect(master);
  q.start(t + 0.04);
  q.stop(t + 0.7);
}

// Hupen: Jeep = helle Spielzeug-Doppelhupe („möp möp“), Hoflader = tiefes, kräftiges Zweiklang-Horn
export function hupe(art = 'jeep', lautst = 0.5) {
  if (!ctx) return;
  const t = ctx.currentTime;
  // Jeep „möp möp“; Weidemann: kräftige Doppelton-Tellerhupe (zwei kurze, schnarrende Stöße wie beim echten Hoflader)
  const toene = art === 'jeep' ? [[0, 0.16, [740, 932]], [0.22, 0.2, [740, 932]]] : [[0, 0.32, [415, 523]], [0.42, 0.42, [415, 523]]];
  for (const [ab, lang, frequenzen] of toene) {
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = art === 'jeep' ? 2600 : 2200;
    f.Q.value = 2;
    huelle(g, t + ab, 0.015, lang - 0.05, 0.06, lautst * (art === 'jeep' ? 0.35 : 0.3));
    g.connect(master);
    f.connect(g);
    for (const hz of frequenzen) {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.setValueAtTime(hz * (art === 'jeep' ? 1.04 : 1), t + ab);
      o.frequency.exponentialRampToValueAtTime(hz, t + ab + 0.05);
      // leichtes Flattern wie bei einer echten Membran
      const lfo = ctx.createOscillator();
      const lg = ctx.createGain();
      lfo.frequency.value = art === 'jeep' ? 28 : 55; // Tellerhupe schnarrt
      lg.gain.value = hz * 0.01;
      lfo.connect(lg).connect(o.frequency);
      o.connect(f);
      o.start(t + ab); lfo.start(t + ab);
      o.stop(t + ab + lang + 0.1); lfo.stop(t + ab + lang + 0.1);
    }
  }
}

// Gertenklatsch: kurzes Pfeifen durch die Luft, dann ein klatschender, nicht zu heller Schlag (kein Peitschenknall)
export function gertenKlatsch(lautst = 0.8) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const zisch = rauschQuelle();
  const zf = ctx.createBiquadFilter(); zf.type = 'bandpass'; zf.frequency.setValueAtTime(900, t); zf.frequency.exponentialRampToValueAtTime(3500, t + 0.12); zf.Q.value = 1.5;
  const zg = ctx.createGain(); huelle(zg, t, 0.04, 0.05, 0.04, lautst * 0.12);
  zisch.connect(zf).connect(zg).connect(master);
  zisch.start(t); zisch.stop(t + 0.2);
  const knall = rauschQuelle();
  const kf = ctx.createBiquadFilter(); kf.type = 'bandpass'; kf.frequency.value = 1100; kf.Q.value = 0.7;
  const kg = ctx.createGain(); huelle(kg, t + 0.13, 0.002, 0.012, 0.09, lautst * 1.1);
  knall.connect(kf).connect(kg).connect(master);
  knall.start(t + 0.13); knall.stop(t + 0.32);
  // dumpfes Patschen darunter
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(190, t + 0.13); o.frequency.exponentialRampToValueAtTime(70, t + 0.24);
  const og = ctx.createGain(); huelle(og, t + 0.13, 0.002, 0.01, 0.1, lautst * 0.5);
  o.connect(og).connect(master); o.start(t + 0.13); o.stop(t + 0.35);
}

// Zusammenstoß mit dem Fahrzeug: dumpfer Schlag, Knirschen und etwas Blechscheppern (staerke 0…1)
export function aufprall(staerke = 0.6) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const v = Math.max(0.15, Math.min(1, staerke));
  // dumpfer Schlag
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(95, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.28);
  huelle(g, t, 0.003, 0.03, 0.3, 0.7 * v);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + 0.45);
  // Knirschen (gefiltertes Rauschen)
  const q = rauschQuelle();
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass'; f.frequency.value = 700 + Math.random() * 400; f.Q.value = 0.9;
  const gr = ctx.createGain();
  huelle(gr, t, 0.002, 0.05, 0.25, 0.55 * v);
  q.connect(f).connect(gr).connect(master);
  q.start(t);
  // Scheppern: ein paar kurze Metalltöne hinterher
  for (let i = 0; i < 3; i++) setTimeout(() => klonk(0.25 * v * (1 - i * 0.25)), 40 + i * 70 + Math.random() * 40);
}
