// Minispiele als 2D-Ansicht: Schneiden mit der Flex, Schweißen, Schlacke abklopfen.
import { dauer, klonk, blip } from './audio.js';

export const STROM_OK = [70, 100];

function vorbereiten(titel, text) {
  const el = document.getElementById('minispiel');
  const canvas = document.getElementById('minispiel-canvas');
  const oben = document.getElementById('minispiel-oben');
  const unten = document.getElementById('minispiel-unten');
  el.classList.remove('versteckt');
  oben.innerHTML = `<h3>${titel}</h3><p>${text}</p>`;
  unten.innerHTML = '';
  const ctx = canvas.getContext('2d');
  const masse = { b: 0, h: 0, dpr: 1 };
  function groesse() {
    masse.dpr = Math.min(window.devicePixelRatio || 1, 2);
    masse.b = window.innerWidth;
    masse.h = window.innerHeight;
    canvas.width = Math.round(masse.b * masse.dpr);
    canvas.height = Math.round(masse.h * masse.dpr);
    ctx.setTransform(masse.dpr, 0, 0, masse.dpr, 0, 0);
  }
  groesse();
  return { el, canvas, ctx, oben, unten, masse, groesse };
}

function knopf(text, klasse, beiKlick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `knopf ${klasse}`;
  b.textContent = text;
  b.addEventListener('click', beiKlick);
  return b;
}

// Arbeitsfläche passend zum Bildschirm
function flaeche(m) {
  const b = Math.min(m.b * 0.84, 900);
  const h = Math.min(m.h * 0.56, b * 0.62);
  return { x: (m.b - b) / 2, y: (m.h - h) / 2 + m.h * 0.03, b, h };
}

function pfadPunkte(form, f) {
  const roh = [];
  if (form === 'rechteck') {
    const x0 = f.x + f.b * 0.28, x1 = f.x + f.b * 0.72, y0 = f.y + f.h * 0.22, y1 = f.y + f.h * 0.78;
    roh.push([x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0 + 0.001]);
  } else if (form === 'linie') {
    roh.push([f.x + f.b * 0.14, f.y + f.h * 0.5], [f.x + f.b * 0.86, f.y + f.h * 0.5]);
  } else if (form === 'zwei') {
    // zwei Scharnier-Nähte: links und rechts, verbunden über einen Sprung (wird nicht gewertet)
    roh.push([f.x + f.b * 0.12, f.y + f.h * 0.5], [f.x + f.b * 0.42, f.y + f.h * 0.5]);
    roh.push(null);
    roh.push([f.x + f.b * 0.58, f.y + f.h * 0.5], [f.x + f.b * 0.88, f.y + f.h * 0.5]);
  } else {
    const r = form === 'kreisKlein' ? f.h * 0.26 : f.h * 0.38;
    const cx = f.x + f.b / 2, cy = f.y + f.h / 2;
    for (let i = 0; i <= 64; i++) {
      const a = -Math.PI / 2 + (i / 64) * Math.PI * 2;
      roh.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  // fein abtasten
  const pkt = [];
  let s = 0;
  let sprungNach = false;
  for (let i = 0; i < roh.length; i++) {
    if (roh[i] === null) { sprungNach = true; continue; }
    if (!pkt.length || sprungNach) {
      pkt.push({ x: roh[i][0], y: roh[i][1], s, sprung: sprungNach });
      sprungNach = false;
      continue;
    }
    const a = pkt[pkt.length - 1];
    const [bx, by] = roh[i];
    const len = Math.hypot(bx - a.x, by - a.y);
    const n = Math.max(1, Math.ceil(len / 3));
    for (let k = 1; k <= n; k++) {
      s += len / n;
      pkt.push({ x: a.x + (bx - a.x) * (k / n), y: a.y + (by - a.y) * (k / n), s });
    }
  }
  return pkt;
}

function stahlPlatte(m, f) {
  const c = document.createElement('canvas');
  c.width = Math.round(m.b * m.dpr);
  c.height = Math.round(m.h * m.dpr);
  const g = c.getContext('2d');
  g.scale(m.dpr, m.dpr);
  g.fillStyle = '#26282c';
  g.fillRect(0, 0, m.b, m.h);
  const grad = g.createLinearGradient(0, f.y, 0, f.y + f.h);
  grad.addColorStop(0, '#9aa1a8');
  grad.addColorStop(0.5, '#7e858c');
  grad.addColorStop(1, '#666c73');
  g.fillStyle = grad;
  g.fillRect(f.x, f.y, f.b, f.h);
  for (let i = 0; i < 500; i++) {
    g.strokeStyle = `rgba(255,255,255,${Math.random() * 0.06})`;
    const y = f.y + Math.random() * f.h;
    g.beginPath();
    g.moveTo(f.x + Math.random() * f.b * 0.3, y);
    g.lineTo(f.x + f.b * (0.4 + Math.random() * 0.6), y + (Math.random() - 0.5) * 2);
    g.stroke();
  }
  g.strokeStyle = '#111';
  g.lineWidth = 4;
  g.strokeRect(f.x, f.y, f.b, f.h);
  return c;
}

function flaschenFlaeche(m, f) {
  const c = document.createElement('canvas');
  c.width = Math.round(m.b * m.dpr);
  c.height = Math.round(m.h * m.dpr);
  const g = c.getContext('2d');
  g.scale(m.dpr, m.dpr);
  g.fillStyle = '#2a2622';
  g.fillRect(0, 0, m.b, m.h);
  const grad = g.createLinearGradient(0, f.y, 0, f.y + f.h);
  grad.addColorStop(0, '#7d1f17');
  grad.addColorStop(0.25, '#c8402f');
  grad.addColorStop(0.5, '#e06049');
  grad.addColorStop(0.75, '#c03a2b');
  grad.addColorStop(1, '#6e1a13');
  g.fillStyle = grad;
  g.beginPath();
  g.roundRect(f.x, f.y, f.b, f.h, f.h * 0.12);
  g.fill();
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(60,20,10,${Math.random() * 0.15})`;
    g.beginPath();
    g.arc(f.x + Math.random() * f.b, f.y + Math.random() * f.h, 2 + Math.random() * 8, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = '#111';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(f.x, f.y, f.b, f.h, f.h * 0.12);
  g.stroke();
  return c;
}

function zeichnePfad(ctx, pkt, von = 0) {
  ctx.beginPath();
  for (let i = von; i < pkt.length; i++) {
    const p = pkt[i];
    if (i === von || p.sprung) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

function balken(ctx, x, y, b, h, anteil, farbe) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x - 2, y - 2, b + 4, h + 4);
  ctx.fillStyle = farbe;
  ctx.fillRect(x, y, b * Math.max(0, Math.min(1, anteil)), h);
}

// ---------------------------------------------------------------------------
// Schneiden / Schweißen: Werkzeug entlang einer Linie führen
// ---------------------------------------------------------------------------
export function pfadSpiel({ art, form, titel, text, strom = 80, helm = true }) {
  const schweissen = art === 'schweissen';
  const { el, canvas, ctx, unten, masse: m } = vorbereiten(titel, text);
  let f = flaeche(m);
  let pkt = pfadPunkte(form, f);
  let hintergrund = schweissen ? stahlPlatte(m, f) : flaschenFlaeche(m, f);
  const L = pkt[pkt.length - 1].s;
  const idealTempo = L / (form === 'kreis' ? 7.5 : 6.5); // px pro Sekunde
  const toleranz = schweissen ? 24 : 26;
  const stromZustand = strom < STROM_OK[0] ? 'niedrig' : strom > STROM_OK[1] ? 'hoch' : 'ok';

  let idx = 0;
  let gedrueckt = false;
  let zeiger = null;
  let touch = false;
  let lichtbogen = false;
  let zuendZeit = 0;
  let klebt = false;
  let tempoGlatt = 0;
  let letzteS = 0;
  let qSumme = 0;
  let qGewicht = 0;
  const zaehler = { zuSchnell: 0, zuLangsam: 0, daneben: 0, gesamt: 0 };
  const raupe = [];
  const funken = [];
  const kratzer = [];
  const loecher = [];
  let fertig = false;
  let meldung = '';
  let meldungZeit = 0;
  let geraeusch = null;
  let laeuft = true;
  let ergebnis = null;
  let letzteZeit = performance.now();

  function meld(t) { meldung = t; meldungZeit = 1.6; }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const off = e.pointerType === 'touch' ? 55 : 0;
    return { x: e.clientX - r.left, y: e.clientY - r.top - off };
  }
  function runter(e) {
    if (fertig) return;
    canvas.setPointerCapture(e.pointerId);
    touch = e.pointerType === 'touch';
    zeiger = pos(e);
    gedrueckt = true;
    zuendZeit = 0;
    klebt = false;
    if (!geraeusch) geraeusch = dauer(schweissen ? 'schweissen' : 'flex');
  }
  function bewegen(e) { zeiger = pos(e); if (!touch && e.pointerType === 'mouse') touch = false; }
  function hoch() {
    gedrueckt = false;
    lichtbogen = false;
    klebt = false;
    if (geraeusch) { geraeusch.stopp(); geraeusch = null; }
  }
  canvas.addEventListener('pointerdown', runter);
  canvas.addEventListener('pointermove', bewegen);
  canvas.addEventListener('pointerup', hoch);
  canvas.addEventListener('pointercancel', hoch);
  function neuGroesse() {
    // Fortschritt relativ übernehmen
    const anteil = pkt[idx].s / L;
    const alt = f;
    m.dpr = Math.min(window.devicePixelRatio || 1, 2);
    m.b = window.innerWidth; m.h = window.innerHeight;
    canvas.width = Math.round(m.b * m.dpr); canvas.height = Math.round(m.h * m.dpr);
    ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    f = flaeche(m);
    pkt = pfadPunkte(form, f);
    hintergrund = schweissen ? stahlPlatte(m, f) : flaschenFlaeche(m, f);
    const sx = f.b / alt.b, sy = f.h / alt.h;
    const umrechnen = (o) => { o.x = f.x + (o.x - alt.x) * sx; o.y = f.y + (o.y - alt.y) * sy; };
    raupe.forEach(umrechnen); kratzer.forEach(umrechnen); loecher.forEach(umrechnen);
    const neuL = pkt[pkt.length - 1].s;
    idx = pkt.findIndex((p) => p.s >= anteil * neuL);
    if (idx < 0) idx = pkt.length - 1;
  }
  window.addEventListener('resize', neuGroesse);

  const abbrechenKnopf = knopf('Abbrechen', 'leise klein', () => beenden(true));
  unten.appendChild(abbrechenKnopf);

  function beenden(abgebrochen) {
    if (ergebnis) return;
    hoch();
    fertig = true;
    const roh = qGewicht ? qSumme / qGewicht : 0;
    const faktor = schweissen && stromZustand !== 'ok' ? 0.72 : 1;
    const qualitaet = Math.round(Math.max(0, Math.min(1, roh * faktor)) * 100);
    const n = Math.max(1, zaehler.gesamt);
    ergebnis = {
      abgebrochen,
      qualitaet,
      strom: stromZustand,
      zuSchnell: zaehler.zuSchnell / n,
      zuLangsam: zaehler.zuLangsam / n,
      daneben: zaehler.daneben / n,
    };
    if (abgebrochen) return aufraeumen();
    unten.innerHTML = '';
    unten.appendChild(knopf('Weiter', '', aufraeumen));
  }

  let fertigAufloesen;
  const versprechen = new Promise((res) => { fertigAufloesen = res; });
  function aufraeumen() {
    laeuft = false;
    window.removeEventListener('resize', neuGroesse);
    canvas.removeEventListener('pointerdown', runter);
    canvas.removeEventListener('pointermove', bewegen);
    canvas.removeEventListener('pointerup', hoch);
    canvas.removeEventListener('pointercancel', hoch);
    el.classList.add('versteckt');
    fertigAufloesen(ergebnis);
  }

  function schritt(dt) {
    if (!gedrueckt || !zeiger || fertig) return;
    // Zünden / Kleben
    if (schweissen) {
      if (klebt) return;
      zuendZeit += dt;
      if (zuendZeit < 0.15) return;
      lichtbogen = true;
      if (stromZustand === 'niedrig' && Math.random() < dt * 0.5) {
        klebt = true;
        lichtbogen = false;
        meld('Elektrode klebt! Loslassen und neu ansetzen.');
        if (geraeusch) { geraeusch.stopp(); geraeusch = null; }
        return;
      }
    }
    // Nächsten Punkt auf dem Pfad suchen (nur vorwärts, kleines Fenster, nicht über einen Sprung)
    const abstand = (i) => Math.hypot(zeiger.x - pkt[i].x, zeiger.y - pkt[i].y);
    let best = idx;
    let bestD = abstand(idx);
    for (let i = Math.max(0, idx - 3); i < idx; i++) bestD = Math.min(bestD, abstand(i));
    let sprungIdx = -1;
    for (let i = idx + 1; i < pkt.length; i++) {
      if (pkt[i].sprung) { sprungIdx = i; break; }
      if (i > idx + 24) break;
      const d = abstand(i);
      if (d < bestD) { bestD = d; best = i; }
    }
    if (sprungIdx < 0) sprungIdx = pkt.findIndex((p, i) => i > idx && p.sprung);
    const amNahtEnde = sprungIdx > 0 && pkt[idx].s >= pkt[sprungIdx - 1].s - 2;
    if (amNahtEnde && abstand(sprungIdx) < toleranz) { best = sprungIdx; bestD = abstand(sprungIdx); }
    if (bestD > toleranz && (idx === 0 || amNahtEnde)) {
      // Noch nicht angesetzt: keine Strafe, nur Hinweis
      lichtbogen = false;
      if (meldungZeit <= 0) meld(amNahtEnde ? 'Absetzen und an der zweiten Naht neu ansetzen.' : 'Am leuchtenden Punkt ansetzen.');
      return;
    }
    const daneben = bestD > toleranz;
    if (daneben) {
      zaehler.daneben += dt;
      zaehler.gesamt += dt;
      qGewicht += dt * idealTempo * 0.5;
      if (!schweissen) {
        kratzer.push({ x: zeiger.x, y: zeiger.y, a: Math.random() * Math.PI });
        if (kratzer.length % 8 === 0) meld('Daneben! Bleib auf der Linie.');
      } else {
        if (Math.random() < 0.5) loecher.push({ x: zeiger.x + (Math.random() - 0.5) * 10, y: zeiger.y + (Math.random() - 0.5) * 10, r: 2 + Math.random() * 3, spritzer: true });
        if (Math.random() < dt * 2) meld('Neben der Naht!');
      }
      funkenSpruehen(zeiger.x, zeiger.y, 2);
      if (geraeusch) geraeusch.staerke(0.3);
      return;
    }
    if (best > idx) {
      const sprung = pkt[best].sprung;
      const ds = sprung ? 0 : pkt[best].s - pkt[idx].s;
      idx = best;
      const tempo = ds / Math.max(dt, 0.001);
      if (!letzteS && !sprung) tempoGlatt = idealTempo;
      tempoGlatt = tempoGlatt * 0.85 + tempo * 0.15;
      const nahe = Math.max(0, 1 - Math.max(0, bestD - 5) / (toleranz - 5));
      let wert = nahe;
      let breite = 1;
      if (schweissen) {
        const v = tempoGlatt / idealTempo;
        let tw = 1;
        if (v > 1.6) { tw = Math.max(0.2, 1 - (v - 1.6) * 0.8); zaehler.zuSchnell += dt; }
        if (v < 0.5) { tw = Math.max(0.35, v / 0.5); zaehler.zuLangsam += dt; }
        breite = Math.max(0.45, Math.min(1.8, 1 / Math.max(0.4, v)));
        wert *= tw;
        if (stromZustand === 'hoch' && Math.random() < 0.08) loecher.push({ x: pkt[idx].x + (Math.random() - 0.5) * 8, y: pkt[idx].y + (Math.random() - 0.5) * 8, r: 3 + Math.random() * 3 });
        if (v > 1.9 && Math.random() < 0.25) loecher.push({ x: pkt[idx].x, y: pkt[idx].y, r: 2, pore: true });
        raupe.push({ x: pkt[idx].x, y: pkt[idx].y, b: breite, alter: 0, q: wert });
      } else {
        raupe.push({ x: pkt[idx].x, y: pkt[idx].y, b: 1, alter: 0, q: wert });
      }
      qSumme += wert * ds;
      qGewicht += ds;
      zaehler.gesamt += dt;
      letzteS = pkt[idx].s;
    } else if (schweissen && lichtbogen) {
      // Stillstand mit Lichtbogen = zu langsam, brennt durch
      tempoGlatt *= 0.9;
      zaehler.zuLangsam += dt;
      zaehler.gesamt += dt;
      qGewicht += dt * idealTempo * 0.35;
      if (raupe.length) raupe[raupe.length - 1].b = Math.min(2.2, raupe[raupe.length - 1].b + dt * 1.5);
      if (Math.random() < dt * (stromZustand === 'hoch' ? 3 : 1.2)) {
        loecher.push({ x: pkt[idx].x + (Math.random() - 0.5) * 6, y: pkt[idx].y + (Math.random() - 0.5) * 6, r: 3 + Math.random() * 4 });
        meld('Zu langsam, das brennt durch!');
      }
    } else {
      tempoGlatt *= 0.9;
    }
    if (geraeusch) geraeusch.staerke(Math.min(1, tempoGlatt / idealTempo));
    funkenSpruehen(pkt[idx].x, pkt[idx].y, schweissen ? (stromZustand === 'hoch' ? 6 : 3) : 5);
    if (pkt[idx].s >= L - 2) beenden(false);
  }

  function funkenSpruehen(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = schweissen ? Math.random() * Math.PI * 2 : Math.PI * 0.15 + Math.random() * 0.6;
      const v = schweissen ? 80 + Math.random() * 220 : 250 + Math.random() * 350;
      funken.push({ x, y, vx: Math.cos(a) * v * (schweissen ? 1 : -1), vy: Math.sin(a) * v - (schweissen ? 60 : 0), t: 0, max: 0.25 + Math.random() * 0.35 });
    }
  }

  function zeichnen(dt) {
    ctx.clearRect(0, 0, m.b, m.h);
    ctx.drawImage(hintergrund, 0, 0, m.b, m.h);

    if (!schweissen) {
      // Kreidelinie
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 4;
      ctx.setLineDash([14, 9]);
      zeichnePfad(ctx, pkt);
      ctx.setLineDash([]);
      // Kratzer
      ctx.strokeStyle = 'rgba(40,30,25,0.7)';
      ctx.lineWidth = 2;
      for (const k of kratzer) {
        ctx.beginPath();
        ctx.moveTo(k.x - Math.cos(k.a) * 6, k.y - Math.sin(k.a) * 6);
        ctx.lineTo(k.x + Math.cos(k.a) * 6, k.y + Math.sin(k.a) * 6);
        ctx.stroke();
      }
      // Schnitt
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#120c0a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      raupe.forEach((r, i) => (i ? ctx.lineTo(r.x, r.y) : ctx.moveTo(r.x, r.y)));
      ctx.stroke();
      const spitze = raupe.slice(-12);
      ctx.strokeStyle = 'rgba(255,150,40,0.9)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      spitze.forEach((r, i) => (i ? ctx.lineTo(r.x, r.y) : ctx.moveTo(r.x, r.y)));
      ctx.stroke();
      // Startpunkt
      if (idx === 0) {
        ctx.fillStyle = '#ffc81e';
        ctx.beginPath();
        ctx.arc(pkt[0].x, pkt[0].y, 10 + Math.sin(performance.now() / 150) * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else {
      // Fuge
      ctx.strokeStyle = '#2b2e33';
      ctx.lineWidth = 6;
      zeichnePfad(ctx, pkt);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      zeichnePfad(ctx, pkt);
      // Raupe
      for (const r of raupe) {
        r.alter += dt;
        const k = Math.min(1, r.alter / 2.5);
        const heiss = 1 - k;
        const w = 9 * r.b;
        const grau = Math.round(110 - (1 - r.q) * 40);
        ctx.fillStyle = `rgb(${Math.round(grau + heiss * 145)},${Math.round(grau - 8 + heiss * 60)},${Math.round(grau - 20 + heiss * 0)})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, w * 0.55, w, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(30,25,20,${0.35 + k * 0.2})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x - w * 0.2, r.y, w * 0.8, -1.1, 1.1);
        ctx.stroke();
      }
      for (const l of loecher) {
        ctx.fillStyle = l.spritzer ? '#4d4943' : '#0e0c0b';
        ctx.beginPath();
        ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Funken
    ctx.lineCap = 'round';
    for (let i = funken.length - 1; i >= 0; i--) {
      const s = funken[i];
      s.t += dt;
      if (s.t > s.max) { funken.splice(i, 1); continue; }
      s.vy += 900 * dt;
      const x2 = s.x + s.vx * dt * 2;
      const y2 = s.y + s.vy * dt * 2;
      ctx.strokeStyle = `rgba(255,${200 - s.t * 300},60,${1 - s.t / s.max})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }

    // Werkzeug
    if (zeiger && !fertig) {
      const zx = zeiger.x, zy = zeiger.y;
      if (!schweissen) {
        const dreh = performance.now() / 20;
        ctx.save();
        ctx.translate(zx, zy);
        ctx.fillStyle = 'rgba(120,110,100,0.85)';
        ctx.beginPath();
        ctx.arc(0, 0, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.stroke();
        if (gedrueckt) {
          ctx.strokeStyle = 'rgba(40,40,40,0.6)';
          for (let i = 0; i < 6; i++) {
            const a = dreh + (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
            ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30);
            ctx.stroke();
          }
        }
        // Schutzhaube + Gehäuse
        ctx.fillStyle = '#9aa3ab';
        ctx.beginPath();
        ctx.arc(0, 0, 38, Math.PI * 0.95, Math.PI * 2.05);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#23806b';
        ctx.fillRect(20, -16, 120, 32);
        ctx.strokeRect(20, -16, 120, 32);
        ctx.restore();
      } else {
        // Elektrodenhalter
        ctx.strokeStyle = '#8e8170';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(zx, zy);
        ctx.lineTo(zx + 60, zy + 70);
        ctx.stroke();
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.moveTo(zx + 64, zy + 76);
        ctx.lineTo(zx + 150, zy + 170);
        ctx.stroke();
      }
    }

    // Helm: alles dunkelgrün, nur der Lichtbogen leuchtet
    if (schweissen && helm && !fertig) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = lichtbogen ? 'rgb(70,140,62)' : 'rgb(28,64,32)';
      ctx.fillRect(0, 0, m.b, m.h);
      ctx.restore();
      if (lichtbogen && zeiger) {
        const p = pkt[idx];
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 70);
        g.addColorStop(0, 'rgba(255,255,240,1)');
        g.addColorStop(0.15, 'rgba(220,255,200,0.9)');
        g.addColorStop(1, 'rgba(120,255,120,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 70, 0, Math.PI * 2);
        ctx.fill();
      }
      // schwache Führungslinie, damit man die Naht findet
      ctx.strokeStyle = 'rgba(160,255,140,0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      zeichnePfad(ctx, pkt, idx);
      ctx.setLineDash([]);
      if (idx === 0 && !lichtbogen) {
        ctx.fillStyle = 'rgba(180,255,160,0.8)';
        ctx.beginPath();
        ctx.arc(pkt[0].x, pkt[0].y, 8 + Math.sin(performance.now() / 150) * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (schweissen && lichtbogen && !fertig) {
      const p = pkt[idx];
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(0, 0, m.b, m.h);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Anzeigen
    const bx = f.x, by = f.y + f.h + 18, bb = f.b;
    balken(ctx, bx, by, bb, 10, pkt[idx].s / L, '#ffc81e');
    ctx.font = '700 13px Nunito, sans-serif';
    ctx.fillStyle = '#ddd';
    ctx.textAlign = 'left';
    ctx.fillText('Fortschritt', bx, by + 26);
    const q = qGewicht ? Math.round((qSumme / qGewicht) * 100) : 100;
    ctx.textAlign = 'right';
    ctx.fillText(`Sauberkeit ${q} %`, bx + bb, by + 26);
    if (schweissen) {
      // Tempo-Anzeige
      const tx = bx + bb / 2 - 110, ty = by + 36, tb = 220;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(tx - 2, ty - 2, tb + 4, 16);
      ctx.fillStyle = '#c0392b'; ctx.fillRect(tx, ty, tb * 0.25, 12);
      ctx.fillStyle = '#5cbf4a'; ctx.fillRect(tx + tb * 0.25, ty, tb * 0.45, 12);
      ctx.fillStyle = '#e67e22'; ctx.fillRect(tx + tb * 0.7, ty, tb * 0.3, 12);
      const v = Math.min(2.2, tempoGlatt / idealTempo);
      const nx = tx + Math.min(tb, (v / 2.2) * tb);
      ctx.fillStyle = '#fff';
      ctx.fillRect(nx - 2, ty - 5, 4, 22);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ddd';
      ctx.fillText('langsam        Tempo        schnell', tx + tb / 2, ty + 30);
      ctx.textAlign = 'left';
      ctx.fillText(`Gerät: ${strom} A`, bx, ty + 30);
    }
    if (meldungZeit > 0) {
      meldungZeit -= dt;
      ctx.font = '400 30px Bangers, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#111';
      ctx.strokeText(meldung, m.b / 2, f.y - 14);
      ctx.fillStyle = '#ffc81e';
      ctx.fillText(meldung, m.b / 2, f.y - 14);
    }
    if (fertig && ergebnis && !ergebnis.abgebrochen) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, m.b, m.h);
      ctx.font = '400 64px Bangers, Impact, sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#111';
      const t = `${schweissen ? 'Naht' : 'Schnitt'}: ${ergebnis.qualitaet} %`;
      ctx.strokeText(t, m.b / 2, m.h / 2);
      ctx.fillStyle = ergebnis.qualitaet >= 75 ? '#7ee06a' : ergebnis.qualitaet >= 50 ? '#ffc81e' : '#ff6a5a';
      ctx.fillText(t, m.b / 2, m.h / 2);
      ctx.font = '700 16px Nunito, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(urteil(ergebnis, schweissen), m.b / 2, m.h / 2 + 34);
    }
  }

  function schleife(jetzt) {
    if (!laeuft) return;
    const dt = Math.min(0.05, (jetzt - letzteZeit) / 1000);
    letzteZeit = jetzt;
    schritt(dt);
    zeichnen(dt);
    requestAnimationFrame(schleife);
  }
  requestAnimationFrame(schleife);
  return versprechen;
}

function urteil(e, schweissen) {
  if (!schweissen) return e.qualitaet >= 80 ? 'Sauber geschnitten.' : e.qualitaet >= 55 ? 'Geht so, etwas krumm.' : 'Ziemlich schief.';
  const teile = [];
  if (e.strom === 'niedrig') teile.push('Strom zu niedrig');
  if (e.strom === 'hoch') teile.push('Strom zu hoch');
  if (e.zuSchnell > 0.25) teile.push('zu schnell');
  if (e.zuLangsam > 0.25) teile.push('zu langsam');
  if (e.daneben > 0.2) teile.push('oft neben der Naht');
  if (!teile.length) return e.qualitaet >= 80 ? 'Schöne gleichmäßige Raupe.' : 'Hält, aber schön ist anders.';
  return teile.join(', ');
}

// ---------------------------------------------------------------------------
// Schlacke abklopfen
// ---------------------------------------------------------------------------
export function schlackeSpiel() {
  const { el, canvas, ctx, unten, masse: m } = vorbereiten('Schlacke abklopfen', 'Tippe auf die grauen Krusten, bis die Nähte blank sind.');
  let f = flaeche(m);
  let platte = stahlPlatte(m, f);
  const stuecke = [];
  const teilchen = [];
  const anzahl = 14;
  function verteilen() {
    stuecke.length = 0;
    for (let i = 0; i < anzahl; i++) {
      const x = f.x + f.b * (0.1 + (0.8 * (i + 0.5)) / anzahl);
      const y = f.y + f.h * 0.5 + (Math.random() - 0.5) * 8;
      const ecken = [];
      const r = Math.min(f.b / anzahl * 0.62, 30);
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        ecken.push([Math.cos(a) * r * (0.7 + Math.random() * 0.4), Math.sin(a) * r * 0.75 * (0.7 + Math.random() * 0.4)]);
      }
      stuecke.push({ x, y, r, ecken, hp: 2, wackel: 0, weg: false });
    }
  }
  verteilen();
  let laeuft = true;
  let fertigAufloesen;
  const versprechen = new Promise((res) => { fertigAufloesen = res; });
  let letzte = performance.now();
  let hammer = null;

  function klick(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    hammer = { x, y, t: 0 };
    let getroffen = false;
    for (const s of stuecke) {
      if (s.weg) continue;
      if (Math.hypot(x - s.x, y - s.y) < s.r * 1.25) {
        s.hp--;
        s.wackel = 0.25;
        getroffen = true;
        klonk(0.5);
        for (let i = 0; i < 6; i++) teilchen.push({ x: s.x, y: s.y, vx: (Math.random() - 0.5) * 300, vy: -Math.random() * 300, t: 0, g: 3 + Math.random() * 4 });
        if (s.hp <= 0) s.weg = true;
        break;
      }
    }
    if (!getroffen) klonk(0.2);
    if (stuecke.every((s) => s.weg)) {
      blip(660, 0.12);
      setTimeout(() => {
        unten.innerHTML = '';
        unten.appendChild(knopf('Weiter', '', () => schliessen(false)));
      }, 300);
    }
  }
  canvas.addEventListener('pointerdown', klick);
  unten.appendChild(knopf('Abbrechen', 'leise klein', () => schliessen(true)));
  function neuGroesse() {
    m.b = window.innerWidth; m.h = window.innerHeight;
    canvas.width = Math.round(m.b * m.dpr); canvas.height = Math.round(m.h * m.dpr);
    ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    const alt = f;
    f = flaeche(m);
    platte = stahlPlatte(m, f);
    for (const s of stuecke) { s.x = f.x + (s.x - alt.x) * (f.b / alt.b); s.y = f.y + (s.y - alt.y) * (f.h / alt.h); }
  }
  window.addEventListener('resize', neuGroesse);

  function schliessen(abgebrochen) {
    laeuft = false;
    canvas.removeEventListener('pointerdown', klick);
    window.removeEventListener('resize', neuGroesse);
    el.classList.add('versteckt');
    fertigAufloesen({ abgebrochen, fertig: stuecke.every((s) => s.weg) });
  }

  function schleife(jetzt) {
    if (!laeuft) return;
    const dt = Math.min(0.05, (jetzt - letzte) / 1000);
    letzte = jetzt;
    ctx.clearRect(0, 0, m.b, m.h);
    ctx.drawImage(platte, 0, 0, m.b, m.h);
    // blanke Naht
    ctx.strokeStyle = '#b8bec4';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(f.x + f.b * 0.1, f.y + f.h * 0.5);
    ctx.lineTo(f.x + f.b * 0.9, f.y + f.h * 0.5);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(80,80,80,0.5)';
    ctx.lineWidth = 1.5;
    for (let x = f.x + f.b * 0.1; x < f.x + f.b * 0.9; x += 7) {
      ctx.beginPath();
      ctx.arc(x, f.y + f.h * 0.5, 8, -1, 1);
      ctx.stroke();
    }
    for (const s of stuecke) {
      if (s.weg) continue;
      s.wackel = Math.max(0, s.wackel - dt);
      const w = Math.sin(s.wackel * 60) * s.wackel * 12;
      ctx.save();
      ctx.translate(s.x + w, s.y);
      ctx.fillStyle = s.hp === 2 ? '#5a524a' : '#6f665c';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      s.ecken.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (s.hp < 2) {
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-s.r * 0.5, -s.r * 0.2);
        ctx.lineTo(0, s.r * 0.1);
        ctx.lineTo(s.r * 0.4, -s.r * 0.3);
        ctx.stroke();
      }
      ctx.restore();
    }
    for (let i = teilchen.length - 1; i >= 0; i--) {
      const p = teilchen[i];
      p.t += dt;
      if (p.t > 0.8) { teilchen.splice(i, 1); continue; }
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.fillStyle = '#5a524a';
      ctx.fillRect(p.x, p.y, p.g, p.g);
    }
    if (hammer) {
      hammer.t += dt;
      const a = hammer.t < 0.12 ? -0.9 + hammer.t * 8 : 0.06;
      ctx.save();
      ctx.translate(hammer.x, hammer.y);
      ctx.rotate(a);
      ctx.fillStyle = '#2a5fb0';
      ctx.fillRect(-6, 0, 12, 110);
      ctx.fillStyle = '#9aa3ab';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.fillRect(-40, -12, 80, 18);
      ctx.strokeRect(-40, -12, 80, 18);
      ctx.restore();
      if (hammer.t > 0.5) hammer = null;
    }
    const rest = stuecke.filter((s) => !s.weg).length;
    balken(ctx, f.x, f.y + f.h + 18, f.b, 10, 1 - rest / anzahl, '#ffc81e');
    requestAnimationFrame(schleife);
  }
  requestAnimationFrame(schleife);
  return versprechen;
}
