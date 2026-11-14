// Minispiele als 2D-Ansicht: Schneiden mit der Flex, Schweißen, Schlacke abklopfen.
import { dauer, klonk, blip, husten } from './audio.js';

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
  const toleranz = schweissen ? 24 : 40; // Flexen: großzügiger
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
      // Edding-Linie
      ctx.strokeStyle = 'rgba(40,90,230,0.95)';
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
  // Die Schlacke sitzt auf dem roten Ofen (Gasflasche), nicht auf einem Blech
  let platte = flaschenFlaeche(m, f);
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
    platte = flaschenFlaeche(m, f);
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

// Hula-Hoop: so schnell wie möglich abwechselnd A und D drücken (Handy: links/rechts tippen).
// Jeder Wechsel hält den Reifen oben, wird man zu langsam, rutscht er runter. Zwei Wechsel = eine Runde.
export const DENNIS_HULA_REKORD = 47;
export function hulaSpiel() {
  const { el, canvas, ctx, unten, masse: m } = vorbereiten('Hula-Hoop: Knackst du Dennis’ Rekord?',
    'Abwechselnd A und D drücken, so schnell du kannst! Handy: abwechselnd links und rechts tippen. Wirst du langsam, fällt der Reifen.');
  let bester = 0;
  try { bester = Number(localStorage.getItem('hula-rekord') || 0); } catch { /* egal */ }
  let phase = 0;
  let schwung = 0; // Wechsel pro Sekunde (geglättet), bestimmt wie schnell der Reifen kreist
  let halt = 100; // 0..100, bei 0 fällt der Reifen
  let schlaege = 0;
  let erwartet = null; // 'a' oder 'd'
  let laeuft = true;
  let gefallen = false;
  let gestartet = false;
  let fall = 0;
  let blitz = { seite: null, gut: false, t: 0 };
  let fertigAufloesen;
  const versprechen = new Promise((res) => { fertigAufloesen = res; });
  const runden = () => Math.floor(schlaege / 2);

  function seiteJetzt() { return erwartet; }
  function druck(taste) {
    if (!laeuft || gefallen) return;
    gestartet = true;
    if (erwartet === null || taste === erwartet) {
      schlaege++;
      halt = Math.min(100, halt + 6); // etwas schwerer (Paket M)
      schwung = schwung * 0.7 + 3;
      erwartet = taste === 'a' ? 'd' : 'a';
      blip(taste === 'a' ? 520 : 620, 0.04, 0.1);
      blitz = { seite: taste, gut: true, t: 0.12 };
    } else {
      halt -= 26;
      blitz = { seite: taste, gut: false, t: 0.2 };
    }
  }
  function taste(e) {
    if (e.repeat) return;
    const k = e.key.toLowerCase();
    if (k === 'a' || k === 'arrowleft') druck('a');
    else if (k === 'd' || k === 'arrowright') druck('d');
  }
  function tipp(e) {
    const r = canvas.getBoundingClientRect();
    druck(e.clientX - r.left < r.width / 2 ? 'a' : 'd');
  }
  window.addEventListener('keydown', taste);
  canvas.addEventListener('pointerdown', tipp);
  unten.appendChild(knopf('Aufhören', 'leise klein', () => schliessen()));

  function schliessen() {
    if (!laeuft) return;
    laeuft = false;
    window.removeEventListener('keydown', taste);
    canvas.removeEventListener('pointerdown', tipp);
    el.classList.add('versteckt');
    const r = runden();
    let neuerRekord = false;
    if (r > bester) { neuerRekord = true; try { localStorage.setItem('hula-rekord', String(r)); } catch { /* egal */ } }
    fertigAufloesen({ runden: r, neuerRekord, bester: Math.max(bester, r) });
  }

  let letzte = performance.now();
  function schleife(jetzt) {
    if (!laeuft) return;
    const dt = Math.min(0.05, (jetzt - letzte) / 1000);
    // Abrutschen nach echter Zeit, sonst wird es bei ruckelnder Grafik zu leicht
    const dtEcht = Math.min(0.3, (jetzt - letzte) / 1000);
    letzte = jetzt;
    if (!gefallen) {
      schwung = Math.max(0, schwung - dt * 2.5);
      phase += (2 + schwung * 2.2) * dt;
      // wird mit jeder Runde anstrengender
      if (gestartet) halt -= dtEcht * (36 + runden() * 1.5);
      if (halt <= 0) {
        gefallen = true;
        klonk(0.6);
        setTimeout(() => {
          unten.innerHTML = '';
          unten.appendChild(knopf('Weiter', '', () => schliessen()));
        }, 900);
      }
    } else {
      fall = Math.min(1, fall + dt * 2.5);
    }
    blitz.t = Math.max(0, blitz.t - dt);
    zeichnen();
    requestAnimationFrame(schleife);
  }

  function zeichnen() {
    const b = m.b, h = m.h;
    ctx.clearRect(0, 0, b, h);
    ctx.fillStyle = '#2a2620';
    ctx.fillRect(0, 0, b, h);
    const cx = b / 2;
    const gross = Math.min(b, h);
    const hueftY = h * 0.64;
    const kopfY = h * 0.33;
    const fussY = h * 0.86;
    const s = Math.sin(phase);
    const c = Math.cos(phase);
    const hueftX = cx - s * gross * 0.025;
    // Beine und Oberkörper (Comic-Silhouette)
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = gross * 0.07;
    ctx.beginPath(); ctx.moveTo(hueftX - gross * 0.04, hueftY); ctx.lineTo(cx - gross * 0.06, fussY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hueftX + gross * 0.04, hueftY); ctx.lineTo(cx + gross * 0.06, fussY); ctx.stroke();
    ctx.strokeStyle = '#2b3a55';
    ctx.lineWidth = gross * 0.055;
    ctx.beginPath(); ctx.moveTo(hueftX - gross * 0.04, hueftY); ctx.lineTo(cx - gross * 0.06, fussY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hueftX + gross * 0.04, hueftY); ctx.lineTo(cx + gross * 0.06, fussY); ctx.stroke();
    ctx.fillStyle = '#2b3a55';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(hueftX - gross * 0.08, kopfY + gross * 0.05, gross * 0.16, hueftY - kopfY - gross * 0.02, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#efc3a6';
    ctx.beginPath(); ctx.arc(hueftX, kopfY, gross * 0.05, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // Reifen: Ellipse um die Hüfte, sinkt bei wenig Halt, fällt am Ende runter
    const tief = (1 - halt / 100) * gross * 0.12 + fall * (fussY - hueftY);
    const rx = gross * 0.2;
    const ry = gross * 0.05 * (1 + fall);
    const rX = hueftX + s * gross * 0.06;
    const rY = hueftY + tief;
    ctx.lineWidth = gross * 0.018;
    for (const [von, bis, farbe] of [[Math.PI, Math.PI * 2, '#b8336f'], [0, Math.PI, '#e84a9a']]) {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = gross * 0.026;
      ctx.beginPath(); ctx.ellipse(rX, rY, rx, ry, c * 0.15 * (1 - fall), von, bis); ctx.stroke();
      ctx.strokeStyle = farbe;
      ctx.lineWidth = gross * 0.016;
      ctx.beginPath(); ctx.ellipse(rX, rY, rx, ry, c * 0.15 * (1 - fall), von, bis); ctx.stroke();
    }
    // Tasten-Hinweise links/rechts
    const seite = seiteJetzt();
    for (const [k, x] of [['a', b * 0.18], ['d', b * 0.82]]) {
      const aktiv = !gefallen && (seite === null || seite === k);
      const bl = blitz.t > 0 && blitz.seite === k;
      ctx.fillStyle = bl ? (blitz.gut ? '#6cbf5a' : '#e23b2e') : aktiv ? '#ffc81e' : '#3a3d44';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 4;
      const g = gross * 0.13 * (aktiv ? 1.12 : 1);
      ctx.beginPath(); ctx.roundRect(x - g / 2, h * 0.5 - g / 2, g, g, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#111';
      ctx.font = `bold ${Math.round(g * 0.55)}px Bangers, Impact, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(k.toUpperCase(), x, h * 0.5 + 2);
    }
    // Zähler und Halt-Balken
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.round(Math.min(gross * 0.07, 40))}px Bangers, Impact, sans-serif`;
    ctx.fillText(`${runden()} ${runden() === 1 ? 'Runde' : 'Runden'}`, cx, 190);
    ctx.font = `bold ${Math.round(gross * 0.032)}px Nunito, sans-serif`;
    ctx.fillStyle = runden() > DENNIS_HULA_REKORD ? '#6cbf5a' : '#ffc81e';
    ctx.fillText(`Dennis’ Rekord: ${DENNIS_HULA_REKORD}   Dein Rekord: ${Math.max(bester, runden())}`, cx, 132);
    const bb = Math.min(320, b * 0.5);
    balken(ctx, cx - bb / 2, 142, bb, 12, Math.max(0, halt) / 100, halt > 35 ? '#6cbf5a' : '#e23b2e');
    if (gefallen) {
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(gross * 0.09)}px Bangers, Impact, sans-serif`;
      ctx.fillText('Runtergefallen!', cx, h * 0.42);
    }
  }
  requestAnimationFrame(schleife);
  return versprechen;
}

// ---------------------------------------------------------------------------
// Gasflasche: Ventil aufdrehen, Spülen, Tür anzeichnen, Lackieren
// ---------------------------------------------------------------------------
function zeigerPos(canvas, e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function textMitte(ctx, t, x, y, groesse = 20, farbe = '#fff') {
  ctx.font = `bold ${groesse}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.75)';
  ctx.strokeText(t, x, y);
  ctx.fillStyle = farbe;
  ctx.fillText(t, x, y);
}
// gemeinsamer Rahmen: Größe, Schleife, Abbrechen/Weiter, Aufräumen
function spielRahmen(titel, text, { beiGroesse, schritt, zeichnen, events }) {
  const v = vorbereiten(titel, text);
  const { el, canvas, ctx, unten, masse: m } = v;
  let laeuft = true;
  let ergebnis = null;
  let aufloesen;
  const versprechen = new Promise((r) => { aufloesen = r; });
  let letzte = performance.now();
  function neuGroesse() {
    m.b = window.innerWidth; m.h = window.innerHeight;
    canvas.width = Math.round(m.b * m.dpr); canvas.height = Math.round(m.h * m.dpr);
    ctx.setTransform(m.dpr, 0, 0, m.dpr, 0, 0);
    beiGroesse(m);
  }
  beiGroesse(m);
  window.addEventListener('resize', neuGroesse);
  for (const [n, f] of Object.entries(events)) (n === 'keydown' || n === 'keyup' ? window : canvas).addEventListener(n, f);
  const api = {
    m, ctx, canvas, unten,
    schliessen(abgebrochen, daten = {}) {
      if (!laeuft) return;
      laeuft = false;
      window.removeEventListener('resize', neuGroesse);
      for (const [n, f] of Object.entries(events)) (n === 'keydown' || n === 'keyup' ? window : canvas).removeEventListener(n, f);
      el.classList.add('versteckt');
      aufloesen({ abgebrochen, ...daten, ...(ergebnis || {}) });
    },
    fertig(daten) {
      ergebnis = daten;
      unten.innerHTML = '';
      unten.appendChild(knopf('Weiter', '', () => api.schliessen(false)));
      blip(660, 0.12);
    },
    get istFertig() { return !!ergebnis; },
  };
  unten.appendChild(knopf('Abbrechen', 'leise klein', () => api.schliessen(true)));
  function schleife(jetzt) {
    if (!laeuft) return;
    const dt = Math.min(0.05, (jetzt - letzte) / 1000);
    letzte = jetzt;
    schritt(dt);
    ctx.clearRect(0, 0, m.b, m.h);
    zeichnen(dt);
    requestAnimationFrame(schleife);
  }
  requestAnimationFrame(schleife);
  return { api, versprechen };
}

// A) Restgas ablassen: Handrad mit der Maus linksrum drehen (aufdrehen), Gas zischt raus. Zu schnell = Dennis meckert.
export function ventilSpiel() {
  let mx = 0, my = 0, r = 100;
  let winkel = 0; // gezeichnete Drehung
  let offen = 0; // 0..1 (2,5 Umdrehungen)
  let druck = 100;
  let tempo = 0; // geglättete Drehgeschwindigkeit rad/s
  let zuSchnellZeit = 0;
  let zuSchnell = false;
  let warnung = 0;
  let zieht = null;
  let gas = null;
  const UMDREHUNGEN = 2.5;
  const MAX_TEMPO = 9;
  const gasWolken = [];
  const { api, versprechen } = spielRahmen('Restgas ablassen',
    'Handrad gedrückt halten und linksrum drehen (gegen den Uhrzeigersinn). Langsam! Warten, bis das Manometer auf null ist.', {
      beiGroesse(m) { mx = m.b / 2; my = m.h * 0.48; r = Math.min(m.b, m.h) * 0.2; },
      events: {
        pointerdown(e) { const p = zeigerPos(api.canvas, e); zieht = Math.atan2(p.y - my, p.x - mx); api.canvas.setPointerCapture?.(e.pointerId); },
        pointermove(e) {
          if (zieht === null || api.istFertig) return;
          const p = zeigerPos(api.canvas, e);
          const a = Math.atan2(p.y - my, p.x - mx);
          let d = a - zieht;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          zieht = a;
          // linksrum (gegen den Uhrzeiger) = auf
          if (d < 0) offen = Math.min(1, offen + -d / (Math.PI * 2 * UMDREHUNGEN));
          else offen = Math.max(0, offen - d / (Math.PI * 2 * UMDREHUNGEN) * 0.5);
          winkel += d;
          tempo += (Math.abs(d) / 0.016 - tempo) * 0.25;
        },
        pointerup() { zieht = null; },
        pointercancel() { zieht = null; },
      },
      schritt(dt) {
        tempo *= Math.pow(0.02, dt);
        if (tempo > MAX_TEMPO) {
          zuSchnellZeit += dt;
          warnung = 1;
          if (zuSchnellZeit > 0.7) zuSchnell = true;
        }
        warnung = Math.max(0, warnung - dt);
        druck = Math.max(0, druck - offen * 24 * dt);
        const zischt = offen > 0.02 && druck > 0;
        if (zischt && !gas) gas = dauer('gas', 0.7);
        if (gas) gas.staerke?.(Math.min(1, offen * (druck / 100) * 1.5));
        if (!zischt && gas) { gas.stopp(); gas = null; }
        if (zischt && Math.random() < offen * 0.8) gasWolken.push({ x: mx + (Math.random() - 0.5) * 20, y: my - r * 0.15, vx: (Math.random() - 0.5) * 80, vy: -60 - Math.random() * 90, t: 0 });
        for (let i = gasWolken.length - 1; i >= 0; i--) { const g = gasWolken[i]; g.t += dt; g.x += g.vx * dt; g.y += g.vy * dt; if (g.t > 1.4) gasWolken.splice(i, 1); }
        if (druck <= 0 && offen >= 0.98 && !api.istFertig) { if (gas) { gas.stopp(); gas = null; } api.fertig({ zuSchnell }); }
      },
      zeichnen() {
        const { ctx, m } = api;
        ctx.fillStyle = '#2a2622'; ctx.fillRect(0, 0, m.b, m.h);
        // Flaschenschulter von oben (rot) und Ventilkörper (Messing)
        ctx.fillStyle = '#b8352a'; ctx.beginPath(); ctx.arc(mx, my, r * 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(mx, my, r * 0.45, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // Handrad mit Speichen
        ctx.save(); ctx.translate(mx, my); ctx.rotate(winkel);
        ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.2 + 6; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#d23a2e'; ctx.lineWidth = r * 0.2; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.strokeStyle = '#111'; ctx.lineWidth = r * 0.13 + 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
          ctx.strokeStyle = '#d23a2e'; ctx.lineWidth = r * 0.13; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
          // Griffmulden auf dem Rad
          ctx.fillStyle = '#9a2a20'; ctx.beginPath(); ctx.arc(Math.cos(a + 0.6) * r, Math.sin(a + 0.6) * r, r * 0.05, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#c9a24a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
        // Pfeil: linksrum = auf
        ctx.strokeStyle = '#ffc81e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx, my, r * 1.35, -0.3, -1.6, true); ctx.stroke();
        const pa = -1.6; ctx.fillStyle = '#ffc81e'; ctx.beginPath();
        ctx.moveTo(mx + Math.cos(pa) * r * 1.35 - 14, my + Math.sin(pa) * r * 1.35); ctx.lineTo(mx + Math.cos(pa) * r * 1.35 + 6, my + Math.sin(pa) * r * 1.35 - 14); ctx.lineTo(mx + Math.cos(pa) * r * 1.35 + 6, my + Math.sin(pa) * r * 1.35 + 14); ctx.fill();
        textMitte(ctx, 'AUF', mx + Math.cos(-0.95) * r * 1.6, my + Math.sin(-0.95) * r * 1.6, 18, '#ffc81e');
        // Gaswolken
        for (const g of gasWolken) { ctx.fillStyle = `rgba(230,236,240,${0.35 * (1 - g.t / 1.4)})`; ctx.beginPath(); ctx.arc(g.x, g.y, 10 + g.t * 30, 0, Math.PI * 2); ctx.fill(); }
        // Manometer rechts
        const gx = Math.min(m.b - 90, mx + r * 2.4), gy = my - r * 0.4, gr = Math.max(46, r * 0.55);
        ctx.fillStyle = '#f2f0e6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.75 + (i / 10) * Math.PI * 1.5; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx + Math.cos(a) * gr * 0.75, gy + Math.sin(a) * gr * 0.75); ctx.lineTo(gx + Math.cos(a) * gr * 0.9, gy + Math.sin(a) * gr * 0.9); ctx.stroke(); }
        const za = Math.PI * 0.75 + (druck / 100) * Math.PI * 1.5;
        ctx.strokeStyle = '#c8352a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(za) * gr * 0.8, gy + Math.sin(za) * gr * 0.8); ctx.stroke();
        textMitte(ctx, 'Restdruck', gx, gy + gr + 24, 15);
        // Anzeigen
        const bb = Math.min(m.b * 0.6, 420);
        balken(ctx, mx - bb / 2, my + r * 2.05, bb, 12, offen, '#ffc81e');
        textMitte(ctx, offen >= 0.98 ? (druck > 0 ? 'Ganz auf. Gas zischt raus ...' : 'Kein Gas mehr drin.') : 'Ventil ' + Math.round(offen * 100) + ' % offen', mx, my + r * 2.05 - 10, 17);
        if (warnung > 0) textMitte(ctx, 'LANGSAM! Nicht so reißen!', mx, my - r * 1.75, 26, '#ff6a4a');
        if (zuSchnell) textMitte(ctx, 'Zu schnell aufgerissen. Dennis hat es gesehen.', mx, m.h - 120, 17, '#ffb0a0');
      },
    });
  return versprechen;
}

// B) Flasche spülen: bis zur Markierung füllen, schütteln (A/D oder links/rechts tippen), auskippen (Flasche umkippen)
export function spuelSpiel() {
  let f;
  let phase = 'fuellen';
  let stand = 0; // 0..1.05
  let haelt = false;
  let ueberlauf = false;
  let schuettel = 0; // 0..1
  let erwartet = null;
  let kipp = 0; // Grad, beim Auskippen
  let kippZiel = 0;
  let wackel = 0, wackelV = 0;
  let welle = 0;
  let zieh = null;
  let ton = null;
  let meldung = '', meldungZeit = 0;
  const tropfen = [];
  const meld = (t) => { meldung = t; meldungZeit = 1.8; };
  const BAND = [0.85, 0.97];
  function schuettelDruck(seite) {
    if (phase !== 'schuetteln') return;
    if (erwartet && seite !== erwartet) { meld('Abwechselnd!'); return; }
    erwartet = seite === 'l' ? 'r' : 'l';
    schuettel = Math.min(1, schuettel + 0.065);
    wackelV += seite === 'l' ? -5 : 5;
    blip(seite === 'l' ? 260 : 300, 0.04, 0.12);
    if (schuettel >= 1) { phase = 'auskippen'; meld('Gut durchgeschüttelt. Jetzt auskippen!'); }
  }
  const { api, versprechen } = spielRahmen('Flasche spülen', 'Wasser bis zur Markierung einfüllen, gut schütteln, dann auskippen. Das drückt die letzten Gasreste raus.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      pointerdown(e) {
        const p = zeigerPos(api.canvas, e);
        if (phase === 'fuellen') { haelt = true; }
        else if (phase === 'schuetteln') schuettelDruck(p.x < api.m.b / 2 ? 'l' : 'r');
        else if (phase === 'auskippen') { zieh = p.x; api.canvas.setPointerCapture?.(e.pointerId); }
      },
      pointermove(e) {
        if (phase !== 'auskippen' || zieh === null) return;
        const p = zeigerPos(api.canvas, e);
        kippZiel = Math.max(0, Math.min(150, (p.x - zieh) / (f.b * 0.35) * 150));
      },
      pointerup() {
        if (phase === 'fuellen' && haelt) {
          haelt = false;
          if (stand >= BAND[0]) { phase = 'schuetteln'; meld(ueberlauf ? 'Übergelaufen, aber voll ist voll.' : 'Voll! Jetzt schütteln.'); }
          else if (stand > 0.05) meld('Noch nicht voll genug. Bis zur Markierung!');
        }
        zieh = null;
      },
      pointercancel() { haelt = false; zieh = null; },
      keydown(e) {
        const k = e.key.toLowerCase();
        if (k === 'a' || k === 'arrowleft') schuettelDruck('l');
        if (k === 'd' || k === 'arrowright') schuettelDruck('r');
      },
    },
    schritt(dt) {
      meldungZeit = Math.max(0, meldungZeit - dt);
      welle += dt;
      // Wasserlaufen
      const laeuft = (phase === 'fuellen' && haelt) || (phase === 'auskippen' && kipp > 95 && stand > 0);
      if (laeuft && !ton) ton = dauer('wasser', 0.6);
      if (!laeuft && ton) { ton.stopp(); ton = null; }
      if (phase === 'fuellen' && haelt) {
        stand += dt * 0.25;
        if (stand > 1) { stand = 1; if (!ueberlauf) { ueberlauf = true; meld('Läuft über! Loslassen!'); } }
      }
      // Schütteln: Federpendel
      wackelV += -wackel * 60 * dt;
      wackelV *= Math.pow(0.15, dt);
      wackel += wackelV * dt;
      if (phase === 'auskippen') {
        if (zieh === null && stand > 0) kippZiel = Math.max(0, kippZiel - dt * 60);
        kipp += (kippZiel - kipp) * Math.min(1, dt * 6);
        if (kipp > 95 && stand > 0) {
          stand = Math.max(0, stand - dt * (kipp - 90) / 60 * 0.45);
          if (Math.random() < 0.8) tropfen.push({ t: 0, vx: 60 + Math.random() * 80, vy: -20 + Math.random() * 40 });
          if (stand <= 0) { phase = 'fertig'; meld('Leer. Kein Gas mehr drin.'); api.fertig({ ueberlauf }); }
        }
      }
      for (let i = tropfen.length - 1; i >= 0; i--) { const t = tropfen[i]; t.t += dt; t.vy += 900 * dt; if (t.t > 0.9) tropfen.splice(i, 1); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2a2622'; ctx.fillRect(0, 0, m.b, m.h);
      // Ablaufrinne
      ctx.fillStyle = '#4a5560'; ctx.fillRect(f.x, f.y + f.h * 0.98, f.b, 14);
      const fb = f.h * 0.42, fh = f.h * 0.86; // Flasche: Breite, Höhe
      const cx = f.x + f.b * 0.42, boden = f.y + f.h * 0.98;
      const winkel = (kipp * Math.PI) / 180 + wackel * 0.06;
      // beim Auskippen hebt man die Flasche an und dreht sie um die Mitte, das Ventil zeigt in die Rinne
      const heben = Math.min(1, kipp / 90) * fh * 0.32;
      const px = cx, py = boden - fh / 2 - heben;
      ctx.save();
      ctx.translate(0, -heben);
      ctx.translate(px, py + heben); ctx.rotate(winkel); ctx.translate(-px, -(py + heben));
      const x0 = cx - fb / 2, y0 = boden - fh;
      // Flaschenkörper (Schnittbild: man sieht das Wasser innen)
      ctx.fillStyle = '#c8402f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(x0, y0 + fh * 0.08, fb, fh * 0.92, fb * 0.32); ctx.fill(); ctx.stroke();
      const ix = x0 + fb * 0.12, iy = y0 + fh * 0.14, ib = fb * 0.76, ih = fh * 0.8;
      ctx.fillStyle = '#5a1a14'; ctx.beginPath(); ctx.roundRect(ix, iy, ib, ih, ib * 0.28); ctx.fill();
      // Wasser (Oberfläche bleibt waagerecht, gegen die Flaschendrehung)
      ctx.save();
      ctx.beginPath(); ctx.roundRect(ix, iy, ib, ih, ib * 0.28); ctx.clip();
      // Wasser sammelt sich immer unten: aufrecht am Boden, umgedreht am Hals
      const umg = (1 - Math.cos(winkel)) / 2;
      const st = Math.min(1, stand);
      const wy = iy + ih * ((1 - st) * (1 - umg) + st * umg);
      ctx.translate(ix + ib / 2, wy); ctx.rotate(-winkel); ctx.translate(-(ix + ib / 2), -wy);
      ctx.fillStyle = '#4aa3df';
      ctx.beginPath(); ctx.moveTo(ix - ib, wy);
      for (let i = 0; i <= 30; i++) { const xx = ix - ib + (i / 30) * ib * 3; ctx.lineTo(xx, wy + Math.sin(welle * 8 + i * 0.8) * (2 + Math.abs(wackelV) * 1.2)); }
      ctx.lineTo(ix + ib * 2, wy + ih * 3); ctx.lineTo(ix - ib, wy + ih * 3); ctx.fill();
      ctx.restore();
      // Markierung „voll“
      for (const b of BAND) { const yy = iy + ih * (1 - b); ctx.strokeStyle = '#ffc81e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ix - 4, yy); ctx.lineTo(ix + 18, yy); ctx.stroke(); }
      textMitte(ctx, 'voll', ix + 40, iy + ih * (1 - BAND[1]) + 14, 14, '#ffc81e');
      // Kragen und Ventil oben
      ctx.fillStyle = '#9aa1a8'; ctx.beginPath(); ctx.roundRect(cx - fb * 0.22, y0 - fh * 0.02, fb * 0.44, fh * 0.12, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c9a24a'; ctx.fillRect(cx - fb * 0.07, y0 - fh * 0.08, fb * 0.14, fh * 0.12); ctx.strokeRect(cx - fb * 0.07, y0 - fh * 0.08, fb * 0.14, fh * 0.12);
      ctx.restore();
      // Schlauch und Strahl beim Füllen
      if (phase === 'fuellen') {
        const sx = cx + fb * 0.6, sy = y0 - fh * 0.22;
        ctx.strokeStyle = '#2f7a3a'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(m.b, sy - 30); ctx.quadraticCurveTo(sx + 80, sy - 40, sx, sy); ctx.stroke();
        ctx.fillStyle = '#ffc81e'; ctx.fillRect(sx - 26, sy - 8, 30, 16);
        if (haelt) { ctx.strokeStyle = 'rgba(120,190,240,0.9)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(sx - 26, sy); ctx.quadraticCurveTo(cx + 10, sy, cx, y0 - fh * 0.06); ctx.stroke(); }
        if (ueberlauf && haelt) for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(120,190,240,0.8)'; ctx.beginPath(); ctx.arc(cx + (Math.random() - 0.5) * fb, y0 + Math.random() * fh * 0.4, 3 + Math.random() * 4, 0, Math.PI * 2); ctx.fill(); }
      }
      // Ausgekipptes Wasser
      const ax = px + Math.sin(winkel) * fh * 0.56, ay = py - Math.cos(winkel) * fh * 0.56;
      for (const t of tropfen) { ctx.fillStyle = 'rgba(120,190,240,0.85)'; ctx.beginPath(); ctx.arc(ax + (t.vx - 90) * t.t * 0.4, ay + t.vy * t.t, 5, 0, Math.PI * 2); ctx.fill(); }
      // Anleitung je Phase
      const tipp = { fuellen: 'Gedrückt halten = Wasser rein. Loslassen an der gelben Markierung.', schuetteln: 'Schütteln: abwechselnd A und D drücken (Handy: links und rechts tippen).', auskippen: 'Auskippen: Flasche greifen und nach rechts umkippen (ziehen).', fertig: 'Gespült!' }[phase];
      textMitte(ctx, tipp, m.b / 2, f.y - 18, 18, '#ffe9a8');
      if (phase === 'schuetteln') balken(ctx, f.x, f.y + f.h + 30, f.b, 12, schuettel, '#4aa3df');
      if (phase === 'auskippen' || phase === 'fertig') balken(ctx, f.x, f.y + f.h + 30, f.b, 12, 1 - stand, '#ffc81e');
      if (meldungZeit > 0) textMitte(ctx, meldung, m.b / 2, f.y + f.h * 0.15, 24);
    },
  });
  return versprechen;
}

// C) Ofentür anzeichnen: die gestrichelte Vorlage mit dem Edding nachfahren. Wie genau, zählt in die Note.
export function anzeichnenSpiel() {
  let f, platte;
  let vorlage = []; // Punkte der Vorlage
  let gedeckt = [];
  let striche = []; // gezeichnete Linien (Arrays von Punkten)
  let aktuell = null;
  let abstandSumme = 0, abstandZahl = 0;
  let zeiger = null;
  const TOL = 14;
  function vorlageBauen() {
    const x0 = f.x + f.b * 0.34, x1 = f.x + f.b * 0.66, y0 = f.y + f.h * 0.2, y1 = f.y + f.h * 0.8, rr = f.h * 0.08;
    const ecken = [];
    const bogen = (cx, cy, a0) => { for (let i = 0; i <= 8; i++) { const a = a0 + (i / 8) * Math.PI / 2; ecken.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } };
    bogen(x1 - rr, y0 + rr, -Math.PI / 2); bogen(x1 - rr, y1 - rr, 0); bogen(x0 + rr, y1 - rr, Math.PI / 2); bogen(x0 + rr, y0 + rr, Math.PI);
    ecken.push(ecken[0]);
    vorlage = [];
    for (let i = 1; i < ecken.length; i++) {
      const [ax, ay] = ecken[i - 1], [bx, by] = ecken[i];
      const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 4));
      for (let k = 0; k < n; k++) vorlage.push({ x: ax + (bx - ax) * (k / n), y: ay + (by - ay) * (k / n) });
    }
    gedeckt = vorlage.map(() => false);
  }
  function naechster(p) { let d = Infinity; for (const v of vorlage) d = Math.min(d, Math.hypot(v.x - p.x, v.y - p.y)); return d; }
  function anteil() { return gedeckt.filter(Boolean).length / gedeckt.length; }
  function qualitaet() {
    const mittel = abstandZahl ? abstandSumme / abstandZahl : 30;
    return Math.round(Math.max(0, Math.min(100, 108 - mittel * 7)));
  }
  function punkt(p) {
    aktuell.push(p);
    abstandSumme += Math.min(40, naechster(p));
    abstandZahl++;
    vorlage.forEach((v, i) => { if (!gedeckt[i] && Math.hypot(v.x - p.x, v.y - p.y) < TOL) gedeckt[i] = true; });
    if (anteil() >= 0.96 && !api.istFertig) api.fertig({ qualitaet: qualitaet() });
  }
  const { api, versprechen } = spielRahmen('Ofentür anzeichnen', 'Mit dem Edding die gestrichelte Vorlage nachfahren: gedrückt halten und ziehen. So genau wie möglich!', {
    beiGroesse(m) {
      const alt = f;
      f = flaeche(m);
      platte = flaschenFlaeche(m, f);
      vorlageBauen();
      if (alt) striche = striche.map((s) => s.map((p) => ({ x: f.x + (p.x - alt.x) * (f.b / alt.b), y: f.y + (p.y - alt.y) * (f.h / alt.h) })));
    },
    events: {
      pointerdown(e) { if (api.istFertig) return; aktuell = []; striche.push(aktuell); punkt(zeigerPos(api.canvas, e)); api.canvas.setPointerCapture?.(e.pointerId); },
      pointermove(e) {
        zeiger = zeigerPos(api.canvas, e);
        if (!aktuell || api.istFertig) return;
        const l = aktuell[aktuell.length - 1];
        const n = Math.max(1, Math.ceil(Math.hypot(zeiger.x - l.x, zeiger.y - l.y) / 4));
        for (let k = 1; k <= n; k++) punkt({ x: l.x + (zeiger.x - l.x) * (k / n), y: l.y + (zeiger.y - l.y) * (k / n) });
        if (Math.random() < 0.15) kratzerTon();
      },
      pointerup() { aktuell = null; },
      pointercancel() { aktuell = null; },
    },
    schritt() {},
    zeichnen() {
      const { ctx, m } = api;
      ctx.drawImage(platte, 0, 0, m.b, m.h);
      // Vorlage gestrichelt
      ctx.setLineDash([10, 9]); ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 3;
      ctx.beginPath(); vorlage.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath(); ctx.stroke();
      ctx.setLineDash([]);
      // Edding-Striche
      ctx.strokeStyle = '#1d3fa8'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const s of striche) { ctx.beginPath(); s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); if (s.length === 1) ctx.lineTo(s[0].x + 0.1, s[0].y); ctx.stroke(); }
      // Edding am Zeiger
      if (zeiger) {
        ctx.save(); ctx.translate(zeiger.x, zeiger.y); ctx.rotate(-0.7);
        ctx.fillStyle = '#1d3fa8'; ctx.fillRect(-4, -6, 8, 6);
        ctx.fillStyle = '#e8e8e8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillRect(-9, -70, 18, 64); ctx.strokeRect(-9, -70, 18, 64);
        ctx.fillStyle = '#1d3fa8'; ctx.fillRect(-10, -86, 20, 18); ctx.strokeRect(-10, -86, 20, 18);
        ctx.restore();
      }
      balken(ctx, f.x, f.y + f.h + 18, f.b, 10, anteil(), '#ffc81e');
      textMitte(ctx, `Genauigkeit: ${qualitaet()} %`, m.b / 2, f.y + f.h + 52, 16, '#ffe9a8');
    },
  });
  // Aufräumen-Knopf zum Wegwischen
  api.unten.appendChild(knopf('Wegwischen', 'leise klein', () => { if (api.istFertig) return; striche = []; aktuell = null; abstandSumme = 0; abstandZahl = 0; gedeckt = vorlage.map(() => false); }));
  return versprechen;
}
let kratzerZuletzt = 0;
function kratzerTon() { const t = performance.now(); if (t - kratzerZuletzt < 90) return; kratzerZuletzt = t; blip(1800 + Math.random() * 600, 0.02, 0.03); }

// E) Ofen lackieren: mit der Sprühdose über den Ofen fahren, bis alles schwarz ist. Zu lange auf einer Stelle = Lacknasen.
export function lackierSpiel() {
  let f;
  const SP = 44, ZE = 46; // Raster (Spalten, Zeilen)
  let lack = new Float32Array(SP * ZE);
  let maske = new Uint8Array(SP * ZE);
  let maskeZahl = 1;
  let nasen = []; // { i, laenge }
  let zeiger = null;
  let spruehen = false;
  let ton = null;
  const nebel = [];
  // Umriss des Ofens in Flächen-Koordinaten (u 0..1 Breite, v 0..1 Höhe)
  const U0 = 0.26, U1 = 0.74;
  // Der Ofen wie gebaut: stehende rote Gasflasche (runde Kuppeln oben und unten), Halsring, langes Ofenrohr oben,
  // Fußring mit drei schrägen Beinen, zwei Tragegriffe, Tür unten mit Holzgriff
  const KOERPER = { u0: 0.37, u1: 0.63, v0: 0.2, v1: 0.85, ru: 0.13, rv: 0.085 };
  const RECHTECKE = [
    [0.44, 0.56, 0.165, 0.215], // Halsring
    [0.475, 0.525, 0.015, 0.18], // Ofenrohr
    [0.465, 0.535, 0.0, 0.025], // Rohrkappe
    [0.4, 0.6, 0.83, 0.885], // Fußring
    [0.345, 0.372, 0.36, 0.44], [0.628, 0.655, 0.36, 0.44], // Tragegriffe
  ];
  const BEINE = [0.42, 0.5, 0.58].map((lu) => ({ lu, o: (lu - 0.5) * 1.4 }));
  function imKoerper(u, v) {
    const k = KOERPER;
    if (u < k.u0 || u > k.u1 || v < k.v0 || v > k.v1) return false;
    const cu = Math.min(Math.max(u, k.u0 + k.ru), k.u1 - k.ru), cv = Math.min(Math.max(v, k.v0 + k.rv), k.v1 - k.rv);
    return ((u - cu) / k.ru) ** 2 + ((v - cv) / k.rv) ** 2 <= 1;
  }
  function imOfen(u, v) {
    if (imKoerper(u, v)) return true;
    for (const [a, b, c, d] of RECHTECKE) if (u > a && u < b && v > c && v < d) return true;
    if (v > 0.875 && v < 0.985) for (const { lu, o } of BEINE) if (Math.abs(u - (lu + o * (v - 0.875) / 0.11 * 0.11)) < 0.014) return true;
    return false;
  }
  function zelle(i) { const c = i % SP, r = Math.floor(i / SP); return { u: U0 + (c + 0.5) / SP * (U1 - U0), v: (r + 0.5) / ZE }; }
  function bauen() { maskeZahl = 0; for (let i = 0; i < SP * ZE; i++) { const { u, v } = zelle(i); maske[i] = imOfen(u, v) ? 1 : 0; maskeZahl += maske[i]; } }
  bauen();
  const px = (u) => f.x + u * f.b;
  const py = (v) => f.y + v * f.h;
  function bedeckt() { let n = 0; for (let i = 0; i < SP * ZE; i++) if (maske[i] && lack[i] >= 1) n++; return n / maskeZahl; }
  function qualitaet() { return Math.round(Math.max(0, Math.min(100, bedeckt() * 100 - nasen.length * 7))); }
  const { api, versprechen } = spielRahmen('Ofen lackieren', 'Gedrückt halten = sprühen. Gleichmäßig über den ganzen Ofen fahren, bis alles mattschwarz ist. Nicht zu lange auf eine Stelle, sonst gibt es Lacknasen!', {
    beiGroesse(m) { f = flaeche(m); f = { x: f.x, y: f.y - m.h * 0.04, b: f.b, h: f.h * 1.18 }; },
    events: {
      pointerdown(e) { if (api.istFertig) return; spruehen = true; zeiger = zeigerPos(api.canvas, e); api.canvas.setPointerCapture?.(e.pointerId); },
      pointermove(e) { zeiger = zeigerPos(api.canvas, e); },
      pointerup() { spruehen = false; },
      pointercancel() { spruehen = false; },
    },
    schritt(dt) {
      if (spruehen && !ton) ton = dauer('gas', 0.5);
      if (!spruehen && ton) { ton.stopp(); ton = null; }
      if (spruehen && zeiger && !api.istFertig) {
        const R = f.b * 0.055;
        for (let i = 0; i < SP * ZE; i++) {
          if (!maske[i]) continue;
          const { u, v } = zelle(i);
          const d = Math.hypot(px(u) - zeiger.x, py(v) - zeiger.y);
          if (d > R) continue;
          const vorher = lack[i];
          lack[i] += dt * 2.6 * (1 - d / R);
          if (vorher < 3.2 && lack[i] >= 3.2 && !nasen.some((n) => Math.abs((n.i % SP) - (i % SP)) < 3 && Math.abs(Math.floor(n.i / SP) - Math.floor(i / SP)) < 4)) {
            nasen.push({ i, laenge: 0 });
          }
        }
        for (let k = 0; k < 4; k++) nebel.push({ x: zeiger.x + (Math.random() - 0.5) * R * 1.6, y: zeiger.y + (Math.random() - 0.5) * R * 1.6, t: 0 });
        if (bedeckt() >= 0.95) { spruehen = false; api.fertig({ qualitaet: qualitaet(), nasen: nasen.length }); }
      }
      for (const n of nasen) n.laenge = Math.min(1, n.laenge + dt * 0.8);
      for (let i = nebel.length - 1; i >= 0; i--) { nebel[i].t += dt; if (nebel[i].t > 0.5) nebel.splice(i, 1); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#3a3530'; ctx.fillRect(0, 0, m.b, m.h);
      // Abdeckpappe hinten
      ctx.fillStyle = '#b89a6a'; ctx.fillRect(px(0.2), py(-0.02), f.b * 0.6, f.h * 1.02);
      // Ofen roh (rot, rostige Flecken), dann der Lack darüber (weiche Kleckse je Rasterzelle, auf den Ofen beschnitten)
      const ofenPfad = () => {
        const k = KOERPER;
        ctx.beginPath();
        ctx.roundRect(px(k.u0), py(k.v0), (k.u1 - k.u0) * f.b, (k.v1 - k.v0) * f.h, [{ x: k.ru * f.b, y: k.rv * f.h }]);
        for (const [a, b, c, d] of RECHTECKE) ctx.rect(px(a), py(c), (b - a) * f.b, (d - c) * f.h);
        for (const { lu, o } of BEINE) {
          const ue = lu + o * 0.11;
          ctx.moveTo(px(lu - 0.014), py(0.875)); ctx.lineTo(px(lu + 0.014), py(0.875));
          ctx.lineTo(px(ue + 0.014), py(0.985)); ctx.lineTo(px(ue - 0.014), py(0.985)); ctx.closePath();
        }
      };
      ctx.save();
      ofenPfad();
      ctx.fillStyle = '#b8402e'; ctx.fill();
      ctx.clip();
      for (let i = 0; i < 26; i++) { ctx.fillStyle = 'rgba(110,45,25,0.35)'; ctx.beginPath(); ctx.arc(px(0.34 + ((i * 37) % 32) / 100), py(0.16 + ((i * 53) % 66) / 100), 6 + (i % 5) * 4, 0, Math.PI * 2); ctx.fill(); }
      // Deckung je Zelle ehrlich anzeigen: halb gesprüht = gesprenkelt, voll = mattschwarz
      const cw = (U1 - U0) / SP * f.b + 0.6, ch = f.h / ZE + 0.6;
      for (let i = 0; i < SP * ZE; i++) {
        if (!maske[i] || lack[i] <= 0) continue;
        const { u, v } = zelle(i);
        const a = Math.min(1, lack[i]);
        const sprenkel = a < 1 ? 0.75 + ((i * 7919) % 11) / 40 : 1;
        ctx.fillStyle = `rgba(22,22,24,${Math.min(0.97, a * a * sprenkel)})`;
        ctx.fillRect(px(u) - cw / 2, py(v) - ch / 2, cw, ch);
      }
      ctx.restore();
      ctx.save(); ofenPfad(); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
      // Konturen: Tür unten mit Scharnieren und Holzgriff, Mittelnaht der Flasche, Schweißraupen an Halsring, Fußring, Beinen, Rohr
      ctx.strokeStyle = 'rgba(0,0,0,0.65)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(px(0.42), py(0.58), f.b * 0.16, f.h * 0.2, 8); ctx.stroke();
      ctx.fillStyle = '#2a2a2c'; for (const v of [0.6, 0.74]) ctx.fillRect(px(0.412), py(v), f.b * 0.016, f.h * 0.035);
      ctx.fillStyle = '#9a6a3a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(px(0.555), py(0.64), f.b * 0.016, f.h * 0.085, 3); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px(0.37), py(0.5)); ctx.lineTo(px(0.63), py(0.5)); ctx.stroke();
      ctx.strokeStyle = 'rgba(170,170,170,0.55)';
      const raupe = (u0, u1, v) => { ctx.beginPath(); for (let u = u0; u < u1; u += 0.008) ctx.arc(px(u), py(v), 2.5, 0, Math.PI); ctx.stroke(); };
      raupe(0.44, 0.56, 0.212); raupe(0.4, 0.6, 0.832); raupe(0.475, 0.525, 0.168);
      // Lacknasen
      for (const n of nasen) {
        const { u, v } = zelle(n.i);
        const x = px(u), y = py(v), l = 12 + n.laenge * 30;
        ctx.fillStyle = '#0c0c0e';
        ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.lineTo(x + 3, y + l); ctx.arc(x, y + l, 4, 0, Math.PI); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 1, y + 4, 2, l * 0.6);
      }
      // Sprühnebel und Dose
      for (const n of nebel) { ctx.fillStyle = `rgba(30,30,30,${0.25 * (1 - n.t / 0.5)})`; ctx.beginPath(); ctx.arc(n.x, n.y, 3 + n.t * 10, 0, Math.PI * 2); ctx.fill(); }
      if (zeiger) {
        const x = zeiger.x + 70, y = zeiger.y + 30;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.35);
        ctx.fillStyle = '#1d1d1f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-20, -40, 40, 110, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffc81e'; ctx.fillRect(-20, -5, 40, 30);
        ctx.fillStyle = '#111'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('OFEN', 0, 9); ctx.fillText('LACK', 0, 21);
        ctx.fillStyle = '#e8e8e8'; ctx.fillRect(-9, -54, 18, 14); ctx.strokeRect(-9, -54, 18, 14);
        ctx.restore();
      }
      balken(ctx, f.x, f.y + f.h + 12, f.b, 10, bedeckt() / 0.95, '#ffc81e');
      textMitte(ctx, `Lackiert: ${Math.round(bedeckt() * 100)} %${nasen.length ? `  ·  Lacknasen: ${nasen.length}` : ''}`, m.b / 2, f.y + f.h + 44, 16, nasen.length ? '#ffb0a0' : '#ffe9a8');
    },
  });
  return versprechen;
}

// ---------------------------------------------------------------------------
// Nebenaufgabe: Bitsatz sortieren (Bits per Ziehen ins passende Fach)
// ---------------------------------------------------------------------------
export function bitsatzSpiel() {
  const ARTEN = [
    { id: 'PH', name: 'Kreuz PH', farbe: '#c9a24a' },
    { id: 'PZ', name: 'Pozi PZ', farbe: '#9aa1a8' },
    { id: 'TX', name: 'Torx TX', farbe: '#6f8fb8' },
    { id: 'SL', name: 'Schlitz', farbe: '#b87a4a' },
  ];
  const GROESSEN = [1, 2, 3];
  let f;
  let faecher = [];
  let bits = [];
  let zieht = null;
  let meldung = '', meldungZeit = 0;
  const meld = (t) => { meldung = t; meldungZeit = 1.6; };
  function anordnen() {
    faecher = [];
    const fb = f.b * 0.18, fh = f.h * 0.15;
    ARTEN.forEach((a, i) => GROESSEN.forEach((g, k) => {
      faecher.push({ art: a.id, groesse: g, x: f.x + f.b * 0.08 + i * (fb + f.b * 0.04), y: f.y + f.h * 0.05 + k * (fh + f.h * 0.03), b: fb, h: fh });
    }));
  }
  function verteilen() {
    bits = [];
    ARTEN.forEach((a) => GROESSEN.forEach((g) => {
      bits.push({ art: a.id, groesse: g, farbe: a.farbe, x: f.x + f.b * (0.06 + Math.random() * 0.88), y: f.y + f.h * (0.66 + Math.random() * 0.28), w: (Math.random() - 0.5) * 1.6, fertig: false });
    }));
  }
  function zeichneBit(ctx, b, x, y, w) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(w);
    // groß genug zum Erkennen: Bit wächst mit der Spielfläche (gezeichnet in 38er-Einheiten)
    const gr = Math.max(1.6, Math.min(2.6, f.b * 0.1 / 38));
    ctx.scale(gr, gr);
    const l = 38, d = 7;
    // Sechskantschaft
    ctx.fillStyle = b.farbe; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(-l / 2, -d / 2, l * 0.7, d, 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-l / 2 + 2, -d / 2 + 1, l * 0.6, 2);
    // Spitze je nach Art
    const sx = -l / 2 + l * 0.7;
    ctx.fillStyle = b.farbe;
    ctx.beginPath(); ctx.moveTo(sx, -d / 2); ctx.lineTo(sx + l * 0.3, -1.5); ctx.lineTo(sx + l * 0.3, 1.5); ctx.lineTo(sx, d / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
    if (b.art === 'PH' || b.art === 'PZ') { ctx.beginPath(); ctx.moveTo(sx + 4, 0); ctx.lineTo(sx + l * 0.3, 0); ctx.stroke(); if (b.art === 'PZ') { ctx.beginPath(); ctx.moveTo(sx + 6, -2); ctx.lineTo(sx + 6, 2); ctx.stroke(); } }
    if (b.art === 'TX') { ctx.beginPath(); ctx.arc(sx + l * 0.2, 0, 2.5, 0, Math.PI * 2); ctx.stroke(); }
    // Größe als Zahl auf dem Schaft
    ctx.fillStyle = '#111'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText(String(b.groesse), -l / 2 + 10, 3);
    ctx.restore();
  }
  window.__bitsatz = { get bits() { return bits; }, get faecher() { return faecher; } }; // nur für Tests
  const { api, versprechen } = spielRahmen('Bitsatz sortieren', 'Die Bits liegen wild durcheinander. Zieh jedes Bit in das passende Fach (Art und Größe stehen dran).', {
    beiGroesse(m) { const alt = f; f = flaeche(m); anordnen(); if (!alt) verteilen(); else for (const b of bits) { b.x = f.x + (b.x - alt.x) * (f.b / alt.b); b.y = f.y + (b.y - alt.y) * (f.h / alt.h); } },
    events: {
      pointerdown(e) {
        const p = zeigerPos(api.canvas, e);
        let best = null, bd = 55;
        for (const b of bits) { if (b.fertig) continue; const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < bd) { bd = d; best = b; } }
        if (best) { zieht = { b: best, dx: best.x - p.x, dy: best.y - p.y, startX: best.x, startY: best.y }; api.canvas.setPointerCapture?.(e.pointerId); klonk(0.08); }
      },
      pointermove(e) { if (!zieht) return; const p = zeigerPos(api.canvas, e); zieht.b.x = p.x + zieht.dx; zieht.b.y = p.y + zieht.dy; },
      pointerup() {
        if (!zieht) return;
        const b = zieht.b;
        const fach = faecher.find((q) => b.x > q.x && b.x < q.x + q.b && b.y > q.y && b.y < q.y + q.h);
        if (fach && fach.art === b.art && fach.groesse === b.groesse) {
          b.fertig = true; b.x = fach.x + fach.b / 2; b.y = fach.y + fach.h * 0.55; b.w = 0;
          klonk(0.2);
          if (bits.every((x) => x.fertig) && !api.istFertig) api.fertig({ fertig: true });
        } else if (fach) { meld(`Passt nicht: ${ARTEN.find((a) => a.id === fach.art).name} ${fach.groesse}`); b.x = zieht.startX; b.y = zieht.startY; blip(220, 0.08, 0.15); }
        zieht = null;
      },
      pointercancel() { zieht = null; },
    },
    schritt(dt) { meldungZeit = Math.max(0, meldungZeit - dt); },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#3a3530'; ctx.fillRect(0, 0, m.b, m.h);
      // Kassette (schwarz, offen)
      ctx.fillStyle = '#26282c'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(f.x, f.y, f.b, f.h * 0.6, 10); ctx.fill(); ctx.stroke();
      for (const q of faecher) {
        const a = ARTEN.find((x) => x.id === q.art);
        ctx.fillStyle = '#17181b'; ctx.fillRect(q.x, q.y, q.b, q.h);
        ctx.strokeStyle = '#4a4d52'; ctx.lineWidth = 2; ctx.strokeRect(q.x, q.y, q.b, q.h);
        const fs = Math.max(9, Math.min(15, q.b / 6.5));
        ctx.fillStyle = a.farbe; ctx.font = `bold ${fs}px system-ui`; ctx.textAlign = 'left';
        ctx.fillText(`${a.name} ${q.groesse}`, q.x + 4, q.y + fs + 3);
      }
      // Ablage unten (Regalbrett)
      ctx.fillStyle = '#8e8e86'; ctx.fillRect(f.x - 10, f.y + f.h * 0.62, f.b + 20, f.h * 0.38);
      for (const b of bits) if (b !== zieht?.b) zeichneBit(ctx, b, b.x, b.y, b.w);
      if (zieht) zeichneBit(ctx, zieht.b, zieht.b.x, zieht.b.y, 0);
      const n = bits.filter((b) => b.fertig).length;
      balken(ctx, f.x, f.y + f.h + 16, f.b, 10, n / bits.length, '#ffc81e');
      if (meldungZeit > 0) textMitte(ctx, meldung, m.b / 2, f.y + f.h * 0.7, 20, '#ffb0a0');
      if (api.istFertig) textMitte(ctx, 'Alles sortiert!', m.b / 2, f.y + f.h * 0.8, 26);
    },
  });
  return versprechen;
}

// ---------------------------------------------------------------------------
// Waldos Akkuschrauber reparieren: Schrauben raus, trocken wischen, Kontakte blank kratzen, zuschrauben
// ---------------------------------------------------------------------------
export function akkuschrauberSpiel() {
  let f;
  let phase = 'schrauben'; // schrauben | trocknen | kontakte | zu | fertig
  let schrauben = [];
  let tropfen = [];
  let rost = [];
  let zeiger = null, wischt = false;
  let zuSchrauben = [];
  let lupe, zungen = [], letzterKratzer = 0;
  const tipp = { schrauben: 'Gehäuse aufmachen: auf jede der 4 Schrauben klicken.', trocknen: 'Wasser drin! Mit dem Lappen über die Tropfen wischen (gedrückt halten).', kontakte: 'Die Akku-Kontakte (Lupe) sind grün angelaufen: mit gedrückter Maus über den Grünspan kratzen, bis sie wieder glänzen.', zu: 'Wieder zuschrauben: alle 4 Schrauben anklicken.', fertig: 'Läuft wieder!' };
  function bauen() {
    const cx = f.x + f.b * 0.5, cy = f.y + f.h * 0.45;
    schrauben = [[-0.2, -0.2], [0.18, -0.22], [-0.05, 0.12], [0.02, 0.38]].map(([dx, dy]) => ({ x: cx + dx * f.b, y: cy + dy * f.h, raus: false }));
    tropfen = Array.from({ length: 26 }, () => ({ x: cx + (Math.random() - 0.6) * f.b * 0.4, y: cy + (Math.random() - 0.5) * f.h * 0.35, r: 4 + Math.random() * 7, weg: false }));
    // Lupe auf den Akkuschacht: zwei breite Messingzungen voller Grünspan-Krusten
    lupe = { x: cx + f.b * 0.13, y: cy + f.h * 0.0, b: f.b * 0.3, h: f.h * 0.4 };
    zungen = [0.28, 0.62].map((u) => ({ x: lupe.x + lupe.b * u, y: lupe.y + lupe.h * 0.22, b: lupe.b * 0.2, h: lupe.h * 0.62 }));
    rost = [];
    for (const z of zungen) for (let i = 0; i < 6; i++) rost.push({ x: z.x + z.b * (0.15 + Math.random() * 0.7), y: z.y + z.h * (0.1 + i * 0.15), r: Math.min(z.b, z.h) * (0.22 + Math.random() * 0.14), hp: 1, form: Array.from({ length: 9 }, () => 0.7 + Math.random() * 0.5) });
  }
  function kratzen(p, menge) {
    let ok = false;
    for (const q of rost) if (q.hp > 0 && Math.hypot(q.x - p.x, q.y - p.y) < q.r + 10) { q.hp = Math.max(0, q.hp - menge); ok = true; }
    if (ok && Date.now() - letzterKratzer > 160) { letzterKratzer = Date.now(); kratzerTon(); }
    if (rost.every((q) => q.hp <= 0)) { phase = 'zu'; klonk(0.15); }
  }
  function klickAuf(p) {
    if (phase === 'schrauben' || phase === 'zu') {
      const s = schrauben.find((q) => Math.hypot(q.x - p.x, q.y - p.y) < 20 && (phase === 'schrauben' ? !q.raus : !zuSchrauben.includes(q)));
      if (!s) return;
      if (phase === 'schrauben') s.raus = true; else zuSchrauben.push(s);
      blip(900, 0.05, 0.1);
      if (phase === 'schrauben' && schrauben.every((q) => q.raus)) phase = 'trocknen';
      if (phase === 'zu' && zuSchrauben.length === 4) {
        phase = 'fertig';
        const d = dauer('flex', 0.35);
        setTimeout(() => d.stopp(), 900);
        api.fertig({ repariert: true });
      }
    } else if (phase === 'kontakte') kratzen(p, 0.35);
  }
  window.__akku = { get phase() { return phase; }, get schrauben() { return schrauben; }, get tropfen() { return tropfen; }, get rost() { return rost; } }; // nur für Tests
  const { api, versprechen } = spielRahmen('Akkuschrauber reparieren', 'Waldos Akkuschrauber lag im Regen. Aufschrauben, trocknen, Kontakte säubern, zuschrauben.', {
    beiGroesse(m) { f = flaeche(m); bauen(); },
    events: {
      pointerdown(e) { const p = zeigerPos(api.canvas, e); zeiger = p; wischt = true; klickAuf(p); },
      pointermove(e) { zeiger = zeigerPos(api.canvas, e); },
      pointerup() { wischt = false; },
      pointercancel() { wischt = false; },
    },
    schritt(dt) {
      if (phase === 'trocknen' && wischt && zeiger) {
        for (const t of tropfen) if (!t.weg && Math.hypot(t.x - zeiger.x, t.y - zeiger.y) < 34) t.weg = true;
        if (tropfen.every((t) => t.weg)) phase = 'kontakte';
      }
      if (phase === 'kontakte' && wischt && zeiger) kratzen(zeiger, dt * 2.2);
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#3a3530'; ctx.fillRect(0, 0, m.b, m.h);
      ctx.fillStyle = '#c99a5b'; ctx.fillRect(f.x - 20, f.y - 10, f.b + 40, f.h + 20);
      const cx = f.x + f.b * 0.5, cy = f.y + f.h * 0.45;
      const offen = phase !== 'schrauben' && phase !== 'fertig' && !(phase === 'zu' && zuSchrauben.length === 4);
      // Akkuschrauber von der Seite: Motorgehäuse, Griff, Akku, Bohrfutter
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.fillStyle = '#2f8f6a';
      ctx.beginPath(); ctx.roundRect(cx - f.b * 0.28, cy - f.h * 0.32, f.b * 0.42, f.h * 0.24, 20); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(cx - f.b * 0.12, cy - f.h * 0.1, f.b * 0.13, f.h * 0.42, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#26282c';
      ctx.beginPath(); ctx.roundRect(cx - f.b * 0.17, cy + f.h * 0.3, f.b * 0.24, f.h * 0.14, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9aa1a8';
      ctx.beginPath(); ctx.roundRect(cx + f.b * 0.14, cy - f.h * 0.27, f.b * 0.1, f.h * 0.14, 6); ctx.fill(); ctx.stroke();
      ctx.fillRect(cx + f.b * 0.24, cy - f.h * 0.215, f.b * 0.08, f.h * 0.03);
      // Schlamm und Wasser außen
      if (phase === 'schrauben') for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(90,65,40,0.55)'; ctx.beginPath(); ctx.arc(cx - f.b * 0.2 + i * f.b * 0.05, cy - f.h * 0.1 + (i % 3) * 12, 9, 0, Math.PI * 2); ctx.fill(); }
      if (offen) {
        // offenes Gehäuse: Motor, Platine, Kabel
        ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.roundRect(cx - f.b * 0.25, cy - f.h * 0.29, f.b * 0.36, f.h * 0.18, 14); ctx.fill();
        ctx.fillStyle = '#b87333'; ctx.beginPath(); ctx.arc(cx - f.b * 0.1, cy - f.h * 0.2, f.h * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2f7a3a'; ctx.fillRect(cx - f.b * 0.1, cy - f.h * 0.05, f.b * 0.09, f.h * 0.28); ctx.strokeRect(cx - f.b * 0.1, cy - f.h * 0.05, f.b * 0.09, f.h * 0.28);
        ctx.strokeStyle = '#c8352a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - f.b * 0.06, cy - f.h * 0.05); ctx.quadraticCurveTo(cx - f.b * 0.02, cy - f.h * 0.15, cx - f.b * 0.08, cy - f.h * 0.2); ctx.stroke();
        for (const t of tropfen) if (!t.weg) { ctx.fillStyle = 'rgba(120,190,240,0.9)'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(t.x - t.r * 0.3, t.y - t.r * 0.3, t.r * 0.25, 0, Math.PI * 2); ctx.fill(); }
      }
      if (offen && phase !== 'schrauben') {
        // Lupe: Linie vom Akkuschacht, runder Rahmen, darin die Kontakte groß
        const ax = cx - f.b * 0.05, ay = cy + f.h * 0.31;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(lupe.x, lupe.y + lupe.h * 0.8); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#1b1c1f'; ctx.beginPath(); ctx.roundRect(lupe.x, lupe.y, lupe.b, lupe.h, 18); ctx.fill();
        ctx.lineWidth = 6; ctx.strokeStyle = '#e8e2d0'; ctx.stroke(); ctx.lineWidth = 2; ctx.strokeStyle = '#111'; ctx.stroke();
        ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 14px system-ui'; ctx.textAlign = 'left'; ctx.fillText('Akku-Kontakte', lupe.x + 12, lupe.y + 22);
        ctx.fillStyle = '#2b2d31'; ctx.fillRect(lupe.x + lupe.b * 0.12, lupe.y + lupe.h * 0.16, lupe.b * 0.76, lupe.h * 0.74);
        for (const z of zungen) {
          // blankes Messing mit Glanzstreifen und Plus/Minus
          const g = ctx.createLinearGradient(z.x, 0, z.x + z.b, 0);
          g.addColorStop(0, '#b8892c'); g.addColorStop(0.45, '#f2d27a'); g.addColorStop(1, '#a87c26');
          ctx.fillStyle = g; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.roundRect(z.x, z.y, z.b, z.h, 5); ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#e8e2d0'; ctx.font = 'bold 16px system-ui'; ctx.textAlign = 'center';
        zungen.forEach((z, i) => ctx.fillText(i ? '-' : '+', z.x + z.b / 2, z.y + z.h + 18));
        // Grünspan: unregelmäßige Krusten mit hellen Kristallen, werden beim Kratzen blasser
        for (const q of rost) {
          if (q.hp <= 0) continue;
          ctx.globalAlpha = Math.min(1, q.hp * 1.4);
          ctx.fillStyle = '#4a8f74'; ctx.beginPath();
          q.form.forEach((k, i) => { const w = (i / q.form.length) * Math.PI * 2; const px = q.x + Math.cos(w) * q.r * k, py = q.y + Math.sin(w) * q.r * k; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#7cc2a2'; ctx.beginPath(); ctx.arc(q.x - q.r * 0.2, q.y - q.r * 0.15, q.r * 0.45, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#d8f0e2'; for (let i = 0; i < 4; i++) ctx.fillRect(q.x + Math.cos(i * 1.7) * q.r * 0.5, q.y + Math.sin(i * 2.3) * q.r * 0.5, 2, 2);
          ctx.globalAlpha = 1;
        }
        // Funkeln, wenn alles blank ist
        if (phase !== 'kontakte') for (const z of zungen) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; const sx = z.x + z.b * 0.6, sy = z.y + z.h * 0.3; ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy); ctx.moveTo(sx, sy - 8); ctx.lineTo(sx, sy + 8); ctx.stroke(); }
      }
      // Kratzer (Schraubendreher-Spitze) am Zeiger
      if (phase === 'kontakte' && zeiger) {
        ctx.save(); ctx.translate(zeiger.x, zeiger.y); ctx.rotate(-0.7);
        ctx.fillStyle = '#c9cdd2'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(6, -4); ctx.lineTo(6, -40); ctx.lineTo(-6, -40); ctx.lineTo(-6, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#d0302a'; ctx.beginPath(); ctx.roundRect(-10, -86, 20, 48, 6); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      // Schrauben
      for (const s of schrauben) {
        const sichtbar = phase === 'schrauben' ? !s.raus : phase === 'zu' || phase === 'fertig' ? zuSchrauben.includes(s) || phase === 'fertig' : false;
        if (sichtbar) { ctx.fillStyle = '#c9cdd2'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(s.x - 5, s.y); ctx.lineTo(s.x + 5, s.y); ctx.moveTo(s.x, s.y - 5); ctx.lineTo(s.x, s.y + 5); ctx.stroke(); }
        else if (phase === 'zu') { ctx.strokeStyle = 'rgba(255,200,30,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 11, 0, Math.PI * 2); ctx.stroke(); }
      }
      // Lappen am Zeiger beim Trocknen
      if (phase === 'trocknen' && zeiger) { ctx.fillStyle = '#d0305a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(zeiger.x - 24, zeiger.y - 16, 48, 32, 8); ctx.fill(); ctx.stroke(); }
      textMitte(ctx, tipp[phase], m.b / 2, f.y + f.h + 30, 18, '#ffe9a8');
    },
  });
  return versprechen;
}

// Flusensieb ausblasen: mit gedrückter Maus (Druckluftpistole) über die Fusseln fahren, bis alles weggepustet ist
export function siebSpiel() {
  let f, s;
  let zeiger = null;
  let druck = false;
  let ton = null;
  const fusseln = [];
  const flug = [];
  const r = (() => { let q = 91; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
  const { api, versprechen } = spielRahmen('Flusensieb ausblasen', 'Maus gedrückt halten = Druckluft. Über die Fusseln fahren, bis das Sieb sauber ist. Nicht ins Gesicht pusten!', {
    beiGroesse(m) {
      f = flaeche(m);
      s = { x: f.x + f.b * 0.18, y: f.y + f.h * 0.08, b: f.b * 0.64, h: f.h * 0.84 };
      if (!fusseln.length) for (let i = 0; i < 70; i++) fusseln.push({ u: 0.05 + r() * 0.9, v: 0.06 + r() * 0.88, g: 6 + r() * 12, w: r() * 6, farbe: ['#a59d91', '#8f877c', '#bdb3a4', '#c23a2e', '#2f5fa8'][Math.floor(r() * (r() < 0.9 ? 3 : 5))], weg: false });
    },
    events: {
      pointerdown(e) { druck = true; zeiger = zeigerPos(api.canvas, e); api.canvas.setPointerCapture?.(e.pointerId); },
      pointermove(e) { zeiger = zeigerPos(api.canvas, e); },
      pointerup() { druck = false; },
      pointercancel() { druck = false; },
    },
    schritt(dt) {
      const pustet = druck && !api.istFertig;
      if (pustet && !ton) ton = dauer('gas', 0.7);
      if (!pustet && ton) { ton.stopp(); ton = null; }
      if (pustet && zeiger) {
        for (const p of fusseln) {
          if (p.weg) continue;
          const x = s.x + p.u * s.b, y = s.y + p.v * s.h;
          if (Math.hypot(x - zeiger.x, y - zeiger.y) < 46) { p.weg = true; flug.push({ x, y, vx: (x - zeiger.x) * 6 + (r() - 0.5) * 200, vy: -200 - r() * 200, t: 0, g: p.g, farbe: p.farbe }); }
        }
      }
      for (let i = flug.length - 1; i >= 0; i--) { const q = flug[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 400 * dt; if (q.t > 1.2) flug.splice(i, 1); }
      const rest = fusseln.filter((p) => !p.weg).length;
      if (!api.istFertig && rest <= 2) { if (ton) { ton.stopp(); ton = null; } api.fertig({ sauber: true }); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#26282c'; ctx.fillRect(0, 0, m.b, m.h);
      // Rahmen und Netz
      ctx.fillStyle = '#9aa0a6'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(s.x - 18, s.y - 18, s.b + 36, s.h + 36, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e9ecef'; ctx.fillRect(s.x, s.y, s.b, s.h);
      ctx.strokeStyle = '#8f979e'; ctx.lineWidth = 1;
      for (let x = s.x; x < s.x + s.b; x += 7) { ctx.beginPath(); ctx.moveTo(x, s.y); ctx.lineTo(x, s.y + s.h); ctx.stroke(); }
      for (let y = s.y; y < s.y + s.h; y += 7) { ctx.beginPath(); ctx.moveTo(s.x, y); ctx.lineTo(s.x + s.b, y); ctx.stroke(); }
      ctx.fillStyle = '#7c838b'; ctx.fillRect(s.x + s.b * 0.35, s.y - 34, s.b * 0.3, 18);
      // Fusseln (flauschige Kleckse)
      const fussel = (x, y, g, w, farbe) => { ctx.fillStyle = farbe; ctx.beginPath(); for (let k = 0; k < 7; k++) { const a = w + k * 0.9; ctx.ellipse(x + Math.cos(a) * g * 0.5, y + Math.sin(a) * g * 0.35, g * 0.6, g * 0.4, a, 0, Math.PI * 2); } ctx.fill(); };
      for (const p of fusseln) if (!p.weg) fussel(s.x + p.u * s.b, s.y + p.v * s.h, p.g, p.w, p.farbe);
      for (const q of flug) { ctx.globalAlpha = Math.max(0, 1 - q.t); fussel(q.x, q.y, q.g, q.t * 9, q.farbe); ctx.globalAlpha = 1; }
      // Ausblaspistole am Zeiger
      if (zeiger) {
        ctx.save(); ctx.translate(zeiger.x, zeiger.y);
        ctx.fillStyle = '#2f5fa8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(14, 4, 70, 26, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#9aa1a8'; ctx.fillRect(-4, 10, 20, 10); ctx.strokeRect(-4, 10, 20, 10);
        ctx.fillStyle = '#2f5fa8'; ctx.beginPath(); ctx.roundRect(54, 26, 22, 44, 6); ctx.fill(); ctx.stroke();
        if (druck) for (let k = 0; k < 6; k++) { ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, 15); ctx.lineTo(-40 - Math.random() * 30, 15 + (Math.random() - 0.5) * 40); ctx.stroke(); }
        ctx.restore();
      }
      const rest = fusseln.filter((p) => !p.weg).length;
      balken(ctx, f.x, f.y + f.h + 30, f.b, 12, 1 - rest / fusseln.length, '#ffc81e');
      textMitte(ctx, api.istFertig ? 'Blitzsauber!' : 'Druckluft: Maus gedrückt halten und über die Fusseln fahren', m.b / 2, f.y - 18, 18, '#ffe9a8');
    },
  });
  return versprechen;
}

// Spanngurte (P6): zwei Gurte liegen verheddert auf dem Boden. Erst die Knoten lösen: Knoten anklicken und in Pfeilrichtung
// ziehen (falsche Richtung zieht ihn fester). Verdrehte Stellen (hochkant, gelbes X) anklicken = glattstreichen.
// Dann straff aufrollen: im Kreis um die Rolle ziehen, Tempo im grünen Bereich halten (zu schnell = Gurt rutscht und verdreht).
// Nach dem Hinwerfen der aufgerollten Gurte (verknotet) gibt es mehr Knoten.
export function spanngurtSpiel({ verknotet = false } = {}) {
  let f, mx, my;
  let gurt = 0; // 0 oder 1
  let w = 0; // aufgerollt 0..1
  let zieht = null;
  let verdreht = 0, knotenFehler = 0;
  let blitz = 0;
  let tempo = 0, zuSchnellZeit = 0, rutschSperre = 0;
  let meldung = '', meldungZeit = 0;
  const meld = (t) => { meldung = t; meldungZeit = 2; };
  const UMDREHUNGEN = 5;
  const GRUEN = [2.2, 8.5]; // rad/s
  const r = (() => { let q = verknotet ? 77 : 31; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
  let bahn = [], laenge = 0, dreher = [], knoten = [], greift = null;
  function neuerGurt() {
    // Gurt liegt in unregelmäßigen Schlaufen von der Rolle bis zur Ratsche
    const schleifen = gurt === 0 ? 5 : 4;
    const phase = r() * Math.PI;
    bahn = [];
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      const x = mx + 40 + t * f.b * 0.66 + Math.sin(t * Math.PI * schleifen + phase) * f.b * 0.06;
      const y = my + Math.cos(t * Math.PI * schleifen + phase) * f.h * 0.3 * (0.4 + 0.6 * t) * Math.min(1, t * 6) + Math.sin(t * 9) * 10;
      bahn.push([x, y]);
    }
    laenge = 0;
    bahn[0][2] = 0;
    for (let i = 1; i < bahn.length; i++) { laenge += Math.hypot(bahn[i][0] - bahn[i - 1][0], bahn[i][1] - bahn[i - 1][1]); bahn[i][2] = laenge; }
    dreher = [0.3, 0.6].map((q) => ({ s: q + (r() - 0.5) * 0.08, glatt: false, weg: false }));
    const nK = verknotet ? 3 : 1 + (gurt === 0 ? 1 : 0);
    knoten = [];
    for (let k = 0; k < nK; k++) knoten.push({ s: 0.2 + (k + 0.5) * 0.7 / nK + (r() - 0.5) * 0.05, richtung: r() * Math.PI * 2, fest: 1, offen: false, wackel: 0 });
    w = 0;
  }
  function punktBei(s) {
    const ziel = Math.max(0, s) * laenge;
    for (let i = 1; i < bahn.length; i++) if (bahn[i][2] >= ziel) {
      const a = bahn[i - 1], b = bahn[i], t = (ziel - a[2]) / Math.max(1e-6, b[2] - a[2]);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    return bahn[bahn.length - 1];
  }
  const knotenOffen = () => knoten.every((k) => k.offen);
  const { api, versprechen } = spielRahmen('Spanngurte entknoten und aufrollen', 'Erst die Knoten lösen: Knoten anklicken und in Pfeilrichtung ziehen. Verdrehte Stellen (gelbes X) anklicken. Dann im Kreis um die Rolle ziehen, Tempo im grünen Bereich halten.', {
    beiGroesse(m) {
      f = flaeche(m); mx = f.x + f.b * 0.2; my = f.y + f.h * 0.5;
      if (!bahn.length) neuerGurt();
    },
    events: {
      pointerdown(e) {
        if (api.istFertig) return;
        const p = zeigerPos(api.canvas, e);
        // Knoten greifen
        for (const k of knoten) {
          if (k.offen) continue;
          const [x, y] = punktBei(k.s - w);
          if (Math.hypot(p.x - x, p.y - y) < 32) { greift = { k, x0: p.x, y0: p.y }; api.canvas.setPointerCapture?.(e.pointerId); return; }
        }
        // verdrehte Stelle glattstreichen
        for (const d of dreher) {
          if (d.glatt || d.weg) continue;
          const [x, y] = punktBei(d.s - w);
          if (Math.hypot(p.x - x, p.y - y) < 30) { d.glatt = true; blip(760, 0.05); return; }
        }
        if (!knotenOffen()) { meld('Erst die Knoten lösen! So geht der Gurt nicht auf die Rolle.'); return; }
        zieht = Math.atan2(p.y - my, p.x - mx); api.canvas.setPointerCapture?.(e.pointerId);
      },
      pointermove(e) {
        if (api.istFertig) return;
        const p = zeigerPos(api.canvas, e);
        if (greift) {
          const dx = p.x - greift.x0, dy = p.y - greift.y0;
          if (Math.hypot(dx, dy) < 70) return;
          const k = greift.k;
          let dw = Math.atan2(dy, dx) - k.richtung;
          while (dw > Math.PI) dw -= Math.PI * 2;
          while (dw < -Math.PI) dw += Math.PI * 2;
          if (Math.abs(dw) < 0.9) {
            k.fest--;
            if (k.fest <= 0) { k.offen = true; blip(820, 0.07); meld(knotenOffen() ? 'Alle Knoten los. Jetzt aufrollen!' : 'Knoten auf!'); }
            else { blip(600, 0.05); meld('Lockerer. Nochmal ziehen!'); }
          } else {
            k.fest = Math.min(3, k.fest + 1); knotenFehler++; k.wackel = 0.5; klonk(0.3);
            meld('Falsche Richtung! Jetzt sitzt er noch fester.');
          }
          greift = null;
          return;
        }
        if (zieht === null) return;
        const a = Math.atan2(p.y - my, p.x - mx);
        let d = a - zieht;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        zieht = a;
        tempo += Math.abs(d) * 4; // wird in schritt() geglättet und abgebaut
        w = Math.min(1, w + Math.abs(d) / (Math.PI * 2 * UMDREHUNGEN));
        if (Math.random() < 0.1) blip(420 + Math.random() * 80, 0.02, 0.03);
        for (const dr of dreher) if (!dr.weg && w >= dr.s) { dr.weg = true; if (!dr.glatt) { verdreht++; blitz = 0.5; klonk(0.35); meld('Verdreht aufgerollt.'); } }
        if (w >= 1) {
          klonk(0.5);
          zieht = null;
          if (gurt === 0) { gurt = 1; neuerGurt(); blip(660, 0.08); meld('Gurt 1 fertig. Jetzt der blaue.'); }
          else api.fertig({ verdreht, knotenFehler });
        }
      },
      pointerup() { zieht = null; greift = null; },
      pointercancel() { zieht = null; greift = null; },
    },
    schritt(dt) {
      blitz = Math.max(0, blitz - dt);
      meldungZeit = Math.max(0, meldungZeit - dt);
      rutschSperre = Math.max(0, rutschSperre - dt);
      for (const k of knoten) k.wackel = Math.max(0, k.wackel - dt);
      // Tempo (rad/s) glätten: tempo sammelt Winkel * 4 je Bewegung, hier in rad/s umgerechnet
      tempo *= Math.pow(0.02, dt);
      const radS = tempo / 4 * 3.9;
      if (zieht !== null && radS > GRUEN[1]) {
        zuSchnellZeit += dt;
        if (zuSchnellZeit > 0.5 && rutschSperre <= 0) { verdreht++; blitz = 0.5; klonk(0.3); rutschSperre = 1.6; zuSchnellZeit = 0; meld('Zu schnell! Der Gurt rutscht und verdreht sich.'); }
      } else zuSchnellZeit = 0;
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(0, 0, m.b, m.h);
      // Betonboden mit Flecken
      ctx.fillStyle = '#9a968c'; ctx.fillRect(f.x, f.y, f.b, f.h);
      ctx.fillStyle = 'rgba(70,64,56,0.18)';
      for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(f.x + ((i * 97) % f.b), f.y + ((i * 53) % f.h), 30 + (i % 4) * 12, 14 + (i % 3) * 8, i, 0, Math.PI * 2); ctx.fill(); }
      const farbe = gurt === 0 ? '#e8742a' : '#2f6fd1';
      if (!api.istFertig) {
        const rest = 1 - w;
        const breite = 16;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const zug = (fb, b) => {
          ctx.strokeStyle = fb; ctx.lineWidth = b; ctx.beginPath();
          ctx.moveTo(mx, my);
          for (const q of bahn) { if (q[2] > rest * laenge) break; ctx.lineTo(q[0], q[1]); }
          const e = punktBei(rest); ctx.lineTo(e[0], e[1]);
          ctx.stroke();
        };
        zug('#111', breite + 5);
        zug(farbe, breite);
        ctx.setLineDash([6, 6]); zug('rgba(255,255,255,0.35)', 2); ctx.setLineDash([]);
        // verdrehte Stellen: Band steht hochkant (schmaler, dunkler Streifen) mit gelbem X
        for (const d of dreher) {
          if (d.weg || d.s < w) continue;
          const [x, y] = punktBei(d.s - w);
          if (d.glatt) { ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke(); continue; }
          ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.ellipse(x, y, 16, 6, 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y + 8); ctx.moveTo(x + 8, y - 8); ctx.lineTo(x - 8, y + 8); ctx.stroke();
        }
        // Knoten: dicker Wulst mit Schlaufen, Pfeil zeigt die Zugrichtung; je fester, desto röter
        for (const k of knoten) {
          if (k.offen) continue;
          const [x0, y0] = punktBei(k.s - w);
          const x = x0 + Math.sin(k.wackel * 40) * 4, y = y0;
          ctx.save(); ctx.translate(x, y);
          ctx.fillStyle = farbe; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(0, 0, 24, 18, 0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.ellipse(-6, -2, 12, 7, -0.6, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.ellipse(7, 3, 11, 7, 0.9, 0, Math.PI * 2); ctx.stroke();
          if (k.fest > 1) { ctx.strokeStyle = `rgba(224,57,43,${0.4 + k.fest * 0.2})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.stroke(); }
          // Pfeil
          ctx.rotate(k.richtung);
          ctx.strokeStyle = '#ffe9a8'; ctx.fillStyle = '#ffe9a8'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(70, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(80, 0); ctx.lineTo(66, -9); ctx.lineTo(66, 9); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        // Ratsche am Ende: Rahmen, Welle, Hebel mit rotem Griff; dahinter der Haken
        const e = punktBei(1 - w), e0 = punktBei(Math.max(0, 1 - w - 0.01));
        ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(Math.atan2(e[1] - e0[1], e[0] - e0[0]));
        ctx.fillStyle = '#8a9096'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-26, -16, 52, 32, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5a5d62'; ctx.beginPath(); ctx.arc(-10, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#c8352a'; ctx.fillRect(4, -7, 30, 14); ctx.strokeRect(4, -7, 30, 14);
        ctx.strokeStyle = '#7f858c'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(54, 0); ctx.arc(54, 10, 10, -Math.PI / 2, Math.PI / 2); ctx.stroke();
        ctx.restore();
      }
      // Rolle: wächst mit, Spirale
      const rr = 34 + (api.istFertig ? 26 : w * 26);
      ctx.fillStyle = gurt === 0 && !api.istFertig ? '#e8742a' : '#2f6fd1';
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(mx, my, rr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5;
      for (let k = 10; k < rr; k += 5) { ctx.beginPath(); ctx.arc(mx, my, k, 0, Math.PI * 2); ctx.stroke(); }
      if (blitz > 0) { ctx.strokeStyle = `rgba(224,57,43,${blitz * 2})`; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(mx, my, rr + 8, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(mx, my, 9, 0, Math.PI * 2); ctx.fill();
      if (!api.istFertig && knotenOffen()) {
        ctx.strokeStyle = 'rgba(255,233,168,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(mx, my, rr + 22, -0.4, Math.PI * 1.3); ctx.stroke();
      }
      // Tempo-Anzeige (Spannung) unter der Rolle: grüner Bereich = straff und sauber
      if (!api.istFertig) {
        const bx = mx - 70, by = my + 110, bb = 140, MAXV = 12;
        const radS = tempo / 4 * 3.9;
        ctx.fillStyle = '#26282c'; ctx.fillRect(bx, by, bb, 12);
        ctx.fillStyle = 'rgba(80,190,90,0.7)'; ctx.fillRect(bx + bb * GRUEN[0] / MAXV, by, bb * (GRUEN[1] - GRUEN[0]) / MAXV, 12);
        ctx.fillStyle = '#ffe9a8'; ctx.fillRect(bx + Math.min(bb, bb * radS / MAXV) - 2, by - 4, 4, 20);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bb, 12);
        textMitte(ctx, 'Tempo', mx, by + 30, 13, '#ffe9a8');
      }
      balken(ctx, f.x, f.y + f.h + 26, f.b, 12, (gurt + (api.istFertig ? 1 : w)) / 2, '#ffc81e');
      const offenN = knoten.filter((k) => !k.offen).length;
      const kopf = api.istFertig ? (verdreht ? `Aufgerollt. ${verdreht}x verdreht, sieht krumpelig aus.` : 'Sauber aufgerollt!')
        : offenN ? `Gurt ${gurt + 1} von 2: ${offenN} ${offenN === 1 ? 'Knoten' : 'Knoten'} lösen (anklicken, in Pfeilrichtung ziehen)` : `Gurt ${gurt + 1} von 2: im Kreis ziehen, Tempo im grünen Bereich`;
      textMitte(ctx, kopf, m.b / 2, f.y - 18, 18, '#ffe9a8');
      if (meldungZeit > 0) textMitte(ctx, meldung, m.b / 2, f.y + 34, 20, '#ffb0a0');
    },
  });
  return versprechen;
}

// Kackepumpe reinigen: blaue Tauchpumpe mit Schlauch, voller Gülle. Maus gedrückt = Wasserstrahl; frische Kleckse gehen schnell ab,
// eingetrocknete Krusten (dunkel) brauchen länger. Dabei Luft anhalten: beim Spritzen sinkt die Luft, ist sie leer, muss man würgen
// und kurz loslassen (Maus los = durchatmen). Wer zu oft würgt, hat es trotzdem geschafft, aber Dennis lacht.
export function pumpeSpiel() {
  let f, p;
  let zeiger = null;
  let druck = false;
  let ton = null;
  let luft = 1;
  let wuergt = 0; // Sekunden Würgen
  let gewuergt = 0;
  const kleckse = [];
  const tropfen = [];
  const r = (() => { let q = 47; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
  const { api, versprechen } = spielRahmen('Kackepumpe abwaschen', 'Maus gedrückt halten = Wasserstrahl. Alle Gülle-Kleckse wegspritzen, dunkle Krusten brauchen länger. Luft anhalten! Wird die Luft knapp: Maus loslassen und durchatmen.', {
    beiGroesse(m) {
      f = flaeche(m);
      // Pumpe mittig, Schlauch rechts daneben aufgerollt
      p = { x: f.x + f.b * 0.22, y: f.y + f.h * 0.08, b: f.b * 0.26, h: f.h * 0.82, sx: f.x + f.b * 0.66, sy: f.y + f.h * 0.52, sr: Math.min(f.b * 0.17, f.h * 0.38) };
      if (!kleckse.length) {
        for (let i = 0; i < 26; i++) {
          const aufSchlauch = i >= 16;
          const kruste = r() < 0.35;
          let u, v;
          if (aufSchlauch) { const w = r() * Math.PI * 2, d = 0.55 + r() * 0.45; u = Math.cos(w) * d; v = Math.sin(w) * d; }
          else { u = 0.08 + r() * 0.84; v = 0.06 + r() * 0.9; }
          kleckse.push({ aufSchlauch, u, v, g: 10 + r() * 16, w: r() * 6, kruste, hp: kruste ? 1.6 : 0.5, voll: kruste ? 1.6 : 0.5 });
        }
      }
    },
    events: {
      pointerdown(e) { druck = true; zeiger = zeigerPos(api.canvas, e); api.canvas.setPointerCapture?.(e.pointerId); },
      pointermove(e) { zeiger = zeigerPos(api.canvas, e); },
      pointerup() { druck = false; },
      pointercancel() { druck = false; },
    },
    schritt(dt) {
      if (wuergt > 0) wuergt = Math.max(0, wuergt - dt);
      const spritzt = druck && !api.istFertig && wuergt <= 0;
      if (spritzt && !ton) ton = dauer('wasser', 0.6);
      if (!spritzt && ton) { ton.stopp(); ton = null; }
      // Luft: beim Spritzen hält man sie an, losgelassen atmet man durch
      if (spritzt) luft -= dt / 6; else luft = Math.min(1, luft + dt / 1.6);
      if (luft <= 0 && !api.istFertig) { luft = 0.35; wuergt = 1.4; gewuergt++; husten(0.8, 2); }
      if (spritzt && zeiger) {
        for (const k of kleckse) {
          if (k.hp <= 0) continue;
          const { x, y } = lage(k);
          if (Math.hypot(x - zeiger.x, y - zeiger.y) < 38) {
            k.hp -= dt;
            if (r() < dt * 14) tropfen.push({ x, y, vx: (r() - 0.5) * 260, vy: -120 - r() * 160, t: 0, farbe: k.kruste ? '#4a3418' : '#7a5a2a' });
            if (k.hp <= 0) blip(300 + r() * 120, 0.03, 0.06);
          }
        }
      }
      for (let i = tropfen.length - 1; i >= 0; i--) { const q = tropfen[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt; if (q.t > 1) tropfen.splice(i, 1); }
      if (!api.istFertig && kleckse.every((k) => k.hp <= 0)) { if (ton) { ton.stopp(); ton = null; } api.fertig({ sauber: true, gewuergt }); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2c3a40'; ctx.fillRect(0, 0, m.b, m.h);
      // Duschwanne als Untergrund (Fliesen)
      ctx.fillStyle = '#d9e2e6'; ctx.fillRect(f.x, f.y, f.b, f.h);
      ctx.strokeStyle = '#b7c3c9'; ctx.lineWidth = 2;
      for (let x = f.x; x <= f.x + f.b; x += f.b / 8) { ctx.beginPath(); ctx.moveTo(x, f.y); ctx.lineTo(x, f.y + f.h); ctx.stroke(); }
      for (let y = f.y; y <= f.y + f.h; y += f.h / 5) { ctx.beginPath(); ctx.moveTo(f.x, y); ctx.lineTo(f.x + f.b, y); ctx.stroke(); }
      // Schlauch: schwarze Ringe
      ctx.strokeStyle = '#1d1d1f'; ctx.lineWidth = Math.max(10, p.sr * 0.16);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(p.sx + i * 6, p.sy - i * 5, p.sr * (1 - i * 0.12), p.sr * 0.8 * (1 - i * 0.12), 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(p.x + p.b, p.y + p.h * 0.75); ctx.quadraticCurveTo(p.sx - p.sr * 0.8, p.y + p.h * 0.95, p.sx - p.sr, p.sy); ctx.stroke();
      // Pumpe: blauer Körper, schwarzer Fuß, Bügelgriff
      ctx.lineWidth = 5; ctx.strokeStyle = '#111';
      ctx.fillStyle = '#2f5fa8'; ctx.beginPath(); ctx.roundRect(p.x, p.y + p.h * 0.12, p.b, p.h * 0.78, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4a7cc4'; ctx.fillRect(p.x + p.b * 0.12, p.y + p.h * 0.18, p.b * 0.12, p.h * 0.66);
      ctx.fillStyle = '#1d1d1f'; ctx.beginPath(); ctx.roundRect(p.x - 10, p.y + p.h * 0.86, p.b + 20, p.h * 0.12, 8); ctx.fill();
      ctx.strokeStyle = '#1d1d1f'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(p.x + p.b / 2, p.y + p.h * 0.14, p.b * 0.3, Math.PI, 0); ctx.stroke();
      // Gülle-Kleckse: frisch hellbraun und glänzend, Kruste dunkel und rissig; beim Abspritzen werden sie kleiner
      for (const k of kleckse) {
        if (k.hp <= 0) continue;
        const { x, y } = lage(k);
        const g = k.g * (0.35 + 0.65 * k.hp / k.voll);
        ctx.fillStyle = k.kruste ? '#4a3418' : '#7a5a2a';
        ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = k.w + i * 1.05; ctx.ellipse(x + Math.cos(a) * g * 0.45, y + Math.sin(a) * g * 0.3, g * 0.55, g * 0.4, a, 0, Math.PI * 2); } ctx.fill();
        if (k.kruste) { ctx.strokeStyle = '#2a1c0c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - g * 0.4, y); ctx.lineTo(x, y - g * 0.2); ctx.lineTo(x + g * 0.3, y + g * 0.15); ctx.stroke(); }
        else { ctx.fillStyle = 'rgba(255,240,200,0.35)'; ctx.beginPath(); ctx.ellipse(x - g * 0.2, y - g * 0.15, g * 0.18, g * 0.1, 0, 0, Math.PI * 2); ctx.fill(); }
      }
      for (const q of tropfen) { ctx.globalAlpha = Math.max(0, 1 - q.t); ctx.fillStyle = q.farbe; ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      // Brause am Zeiger mit Wasserstrahl
      if (zeiger) {
        ctx.save(); ctx.translate(zeiger.x, zeiger.y);
        if (druck && wuergt <= 0 && !api.istFertig) for (let k = 0; k < 10; k++) { ctx.strokeStyle = 'rgba(190,225,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, -30); ctx.lineTo((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 36); ctx.stroke(); }
        ctx.fillStyle = '#c9ced3'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(36, -36, 16, 11, -0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(46, -46); ctx.lineTo(90, -90); ctx.lineWidth = 10; ctx.strokeStyle = '#9aa1a8'; ctx.stroke();
        ctx.restore();
      }
      // Gestank-Schwaden und Würgen
      if (wuergt > 0) { ctx.fillStyle = `rgba(110,140,40,${0.25 * Math.min(1, wuergt)})`; ctx.fillRect(0, 0, m.b, m.h); textMitte(ctx, 'Würg! Erst mal durchatmen ...', m.b / 2, f.y + f.h / 2, 30, '#e8f5a0'); }
      const rest = kleckse.filter((k) => k.hp > 0).length;
      balken(ctx, f.x, f.y + f.h + 26, f.b * 0.62, 12, 1 - rest / kleckse.length, '#ffc81e');
      balken(ctx, f.x + f.b * 0.68, f.y + f.h + 26, f.b * 0.32, 12, luft, luft < 0.3 ? '#e04a3a' : '#7fc8f0');
      textMitte(ctx, 'Sauber', f.x + f.b * 0.31, f.y + f.h + 56, 15, '#ffe9a8');
      textMitte(ctx, 'Luft', f.x + f.b * 0.84, f.y + f.h + 56, 15, '#bfe6ff');
      textMitte(ctx, api.istFertig ? (gewuergt > 2 ? 'Sauber. Aber du bist grün im Gesicht.' : 'Blitzsauber!') : 'Wasser: Maus gedrückt halten und über die Kleckse fahren', m.b / 2, f.y - 18, 18, '#ffe9a8');
    },
  });
  function lage(k) {
    if (k.aufSchlauch) return { x: p.sx + k.u * p.sr, y: p.sy + k.v * p.sr * 0.8 };
    return { x: p.x + k.u * p.b, y: p.y + p.h * 0.12 + k.v * p.h * 0.78 };
  }
  return versprechen;
}

// Kaffee kochen: Pulver in den Filter löffeln (3 Löffel, so mag Dennis ihn), Wasser bis zur Markierung, Knopf an
export function kaffeeSpiel() {
  // Filterkaffeemaschine wie in echt:
  // 1. alten Filter mit nassem Kaffeesatz aus dem Korb ziehen und in den Mülleimer werfen
  // 2. neuen Papierfilter vom Stapel in den Korb ziehen
  // 3. Kaffeepulver: auf die Dose klicken = ein Löffel (3 mag Dennis), dann Korb zuklappen (auf den Korb klicken)
  // 4. Wasser: Kanne gedrückt halten = Wasser in den Tank, an der gelben Markierung loslassen
  // 5. Einschalten (grüner Knopf), Kaffee läuft durch
  let f, M = {};
  let phase = 'alt';
  let loeffel = 0, loeffelAnim = 0, wasser = 0, bruehen = 0, haelt = false, ton = null;
  let zieht = null, zx = 0, zy = 0; // gezogenes Teil: 'alt' | 'neu'
  let altImMuell = 0; // Animation
  let meldung = '', meldungZeit = 0;
  const meld = (t) => { meldung = t; meldungZeit = 1.8; };
  const ZIEL = [0.78, 0.92];
  const drin = (p, b) => p.x > b.x && p.x < b.x + b.b && p.y > b.y && p.y < b.y + b.h;
  const { api, versprechen } = spielRahmen('Kaffee kochen', 'Filterkaffee, wie Dennis ihn mag: alten Filter raus, neuen rein, drei Löffel Pulver, Wasser bis zur Markierung, einschalten.', {
    beiGroesse(m) {
      f = flaeche(m);
      const mm = { x: f.x + f.b * 0.38, y: f.y + f.h * 0.02, b: f.b * 0.3, h: f.h * 0.96 };
      M = {
        maschine: mm,
        korb: { x: mm.x + mm.b * 0.42, y: mm.y + mm.h * 0.14, b: mm.b * 0.5, h: mm.h * 0.2 },
        tank: { x: mm.x + mm.b * 0.06, y: mm.y + mm.h * 0.1, b: mm.b * 0.28, h: mm.h * 0.55 },
        knopf: { x: mm.x + mm.b * 0.2, y: mm.y + mm.h * 0.82, r: Math.min(f.b, f.h) * 0.045 },
        kanne: { x: mm.x + mm.b * 0.48, y: mm.y + mm.h * 0.66, b: mm.b * 0.44, h: mm.h * 0.26 },
        muell: { x: f.x + f.b * 0.02, y: f.y + f.h * 0.55, b: f.b * 0.16, h: f.h * 0.42 },
        stapel: { x: f.x + f.b * 0.2, y: f.y + f.h * 0.72, b: f.b * 0.13, h: f.h * 0.2 },
        dose: { x: f.x + f.b * 0.76, y: f.y + f.h * 0.5, b: f.b * 0.13, h: f.h * 0.38 },
        hahnKanne: { x: f.x + f.b * 0.76, y: f.y + f.h * 0.08, b: f.b * 0.18, h: f.h * 0.3 },
      };
    },
    events: {
      pointerdown(e) {
        const p = zeigerPos(api.canvas, e);
        if (phase === 'alt' && drin(p, M.korb)) { zieht = 'alt'; zx = p.x; zy = p.y; api.canvas.setPointerCapture?.(e.pointerId); }
        else if (phase === 'neu' && drin(p, M.stapel)) { zieht = 'neu'; zx = p.x; zy = p.y; api.canvas.setPointerCapture?.(e.pointerId); }
        else if (phase === 'pulver') {
          if (drin(p, { x: M.dose.x - 20, y: M.dose.y - 50, b: M.dose.b + 40, h: M.dose.h + 50 })) {
            loeffel++; loeffelAnim = 0.6; klonk(0.15);
            if (loeffel === 3) meld('Drei Löffel. Perfekt. Jetzt Korb zuklappen.');
            if (loeffel === 5) meld('Fünf?! Das wird Teer.');
          } else if (loeffel >= 1 && drin(p, M.korb)) { phase = 'wasser'; klonk(0.3); meld(loeffel < 3 ? 'Etwas dünn ... na gut.' : 'Jetzt Wasser in den Tank!'); }
        } else if (phase === 'wasser' && drin(p, M.hahnKanne)) haelt = true;
        else if (phase === 'knopf' && Math.hypot(p.x - M.knopf.x, p.y - M.knopf.y) < M.knopf.r * 1.6) { phase = 'bruehen'; blip(700, 0.1); }
        else if (phase === 'wasser') meld('Die Wasserkanne gedrückt halten.');
      },
      pointermove(e) { if (zieht) { const p = zeigerPos(api.canvas, e); zx = p.x; zy = p.y; } },
      pointerup() {
        if (zieht === 'alt') {
          if (drin({ x: zx, y: zy }, { x: M.muell.x - 20, y: M.muell.y - 60, b: M.muell.b + 40, h: M.muell.h + 60 })) { phase = 'neu'; altImMuell = 0.5; klonk(0.25); meld('Weg mit dem alten Satz.'); }
          else meld('Der alte Filter kommt in den Mülleimer (links).');
        } else if (zieht === 'neu') {
          if (drin({ x: zx, y: zy }, { x: M.korb.x - 30, y: M.korb.y - 30, b: M.korb.b + 60, h: M.korb.h + 60 })) { phase = 'pulver'; blip(600, 0.05); meld('Neuer Filter drin. Jetzt Pulver (Dose rechts).'); }
          else meld('Den Filter in den Korb oben an der Maschine ziehen.');
        }
        zieht = null;
        if (phase === 'wasser' && haelt) {
          haelt = false;
          if (wasser >= ZIEL[0]) { phase = 'knopf'; meld(wasser > 1 ? 'Übergelaufen. Egal.' : 'Genau richtig. Einschalten!'); }
          else if (wasser > 0.05) meld('Noch nicht genug Wasser.');
        }
      },
      pointercancel() { haelt = false; zieht = null; },
    },
    schritt(dt) {
      meldungZeit = Math.max(0, meldungZeit - dt);
      loeffelAnim = Math.max(0, loeffelAnim - dt);
      altImMuell = Math.max(0, altImMuell - dt);
      const laeuft = (phase === 'wasser' && haelt) || phase === 'bruehen';
      if (laeuft && !ton) ton = dauer('wasser', phase === 'bruehen' ? 0.4 : 0.6);
      if (!laeuft && ton) { ton.stopp(); ton = null; }
      if (phase === 'wasser' && haelt) wasser = Math.min(1.08, wasser + dt * 0.35);
      if (phase === 'bruehen') {
        bruehen += dt / 3;
        if (bruehen >= 1) { phase = 'fertig'; if (ton) { ton.stopp(); ton = null; } api.fertig({ loeffel, wasser }); }
      }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2a2622'; ctx.fillRect(0, 0, m.b, m.h);
      ctx.fillStyle = '#5a4630'; ctx.fillRect(0, f.y + f.h * 0.97, m.b, m.h); // Tischplatte
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      // Mülleimer (Treteimer) links
      const mu = M.muell;
      ctx.fillStyle = '#7d8a7a'; ctx.beginPath(); ctx.moveTo(mu.x, mu.y); ctx.lineTo(mu.x + mu.b, mu.y); ctx.lineTo(mu.x + mu.b * 0.9, mu.y + mu.h); ctx.lineTo(mu.x + mu.b * 0.1, mu.y + mu.h); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5f6b5c'; ctx.save(); ctx.translate(mu.x + mu.b, mu.y); ctx.rotate(phase === 'alt' && zieht ? -0.9 : altImMuell > 0 ? -0.9 * altImMuell * 2 : 0);
      ctx.beginPath(); ctx.roundRect(-mu.b - 6, -12, mu.b + 12, 14, 5); ctx.fill(); ctx.stroke(); ctx.restore();
      textMitte(ctx, 'MÜLL', mu.x + mu.b / 2, mu.y + mu.h * 0.55, 14, '#e8e4d8');
      // Filterstapel (Papierfilter in der Packung)
      const st = M.stapel;
      ctx.fillStyle = '#c8352a'; ctx.beginPath(); ctx.roundRect(st.x, st.y + st.h * 0.35, st.b, st.h * 0.65, 6); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 4; k++) { ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.moveTo(st.x + st.b * 0.1, st.y + k * 4); ctx.lineTo(st.x + st.b * 0.9, st.y + k * 4); ctx.lineTo(st.x + st.b * 0.7, st.y + st.h * 0.5 + k * 4); ctx.lineTo(st.x + st.b * 0.3, st.y + st.h * 0.5 + k * 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      textMitte(ctx, 'FILTER 1x4', st.x + st.b / 2, st.y + st.h * 0.82, 12, '#fff');
      // Kaffeedose rechts mit Löffel
      const d = M.dose;
      ctx.fillStyle = '#a8322a'; ctx.beginPath(); ctx.roundRect(d.x, d.y, d.b, d.h, 10); ctx.fill(); ctx.stroke();
      textMitte(ctx, 'KAFFEE', d.x + d.b / 2, d.y + d.h * 0.55, 14, '#f2c21c');
      const k = M.korb;
      const lt = loeffelAnim > 0 ? (0.6 - loeffelAnim) / 0.6 : 0;
      const lx = d.x + d.b / 2 + lt * (k.x + k.b / 2 - d.x - d.b / 2), ly = d.y - 20 - Math.sin(lt * Math.PI) * 80 + lt * (k.y - d.y + 20);
      ctx.strokeStyle = '#c9cdd2'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 50, ly - 30); ctx.stroke();
      ctx.fillStyle = '#c9cdd2'; ctx.beginPath(); ctx.ellipse(lx, ly, 16, 9, 0.5, 0, Math.PI * 2); ctx.fill();
      if (loeffelAnim > 0) { ctx.fillStyle = '#3a2414'; ctx.beginPath(); ctx.ellipse(lx, ly - 4, 12, 6, 0.5, 0, Math.PI * 2); ctx.fill(); }
      // Wasserkanne (zum Einfüllen) rechts oben
      const hk = M.hahnKanne;
      ctx.save(); ctx.translate(hk.x + hk.b / 2, hk.y + hk.h / 2); if (haelt) ctx.rotate(-0.6);
      ctx.fillStyle = 'rgba(200,225,240,0.35)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(-hk.b * 0.35, -hk.h * 0.4, hk.b * 0.7, hk.h * 0.8, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4aa3df'; ctx.fillRect(-hk.b * 0.33, -hk.h * 0.1, hk.b * 0.66, hk.h * 0.48);
      ctx.beginPath(); ctx.moveTo(-hk.b * 0.35, -hk.h * 0.38); ctx.lineTo(-hk.b * 0.55, -hk.h * 0.5); ctx.lineTo(-hk.b * 0.35, -hk.h * 0.2); ctx.stroke();
      ctx.restore();
      if (haelt) { ctx.strokeStyle = '#4aa3df'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(hk.x, hk.y + hk.h * 0.25); ctx.quadraticCurveTo(M.tank.x + M.tank.b, hk.y, M.tank.x + M.tank.b / 2, M.tank.y); ctx.stroke(); }
      // Kaffeemaschine: Gehäuse, Tank (Schnitt), Filterkorb oben, Warmhalteplatte, Glaskanne, Knopf
      const mm = M.maschine;
      ctx.fillStyle = '#1d1d1f'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.roundRect(mm.x, mm.y, mm.b, mm.h, 16); ctx.fill(); ctx.stroke();
      const t = M.tank;
      ctx.fillStyle = 'rgba(200,225,240,0.25)'; ctx.fillRect(t.x, t.y, t.b, t.h);
      ctx.fillStyle = '#4aa3df'; const wh = t.h * Math.min(1, wasser * (1 - (phase === 'bruehen' || phase === 'fertig' ? bruehen : 0)));
      ctx.fillRect(t.x, t.y + t.h - wh, t.b, wh);
      ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.strokeRect(t.x, t.y, t.b, t.h);
      for (const zz of ZIEL) { const y = t.y + t.h * (1 - zz); ctx.strokeStyle = '#ffc81e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(t.x - 6, y); ctx.lineTo(t.x + t.b * 0.4, y); ctx.stroke(); }
      // Filterkorb (offen, solange man am Filter arbeitet)
      ctx.fillStyle = '#2f3134'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(k.x, k.y); ctx.lineTo(k.x + k.b, k.y); ctx.lineTo(k.x + k.b * 0.72, k.y + k.h); ctx.lineTo(k.x + k.b * 0.28, k.y + k.h); ctx.closePath(); ctx.fill(); ctx.stroke();
      const filterForm = (x, y, b, h, satz) => {
        ctx.fillStyle = satz ? '#c9b78f' : '#f4ecd8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - b / 2, y); ctx.lineTo(x + b / 2, y); ctx.lineTo(x + b * 0.22, y + h); ctx.lineTo(x - b * 0.22, y + h); ctx.closePath(); ctx.fill(); ctx.stroke();
        if (satz) { ctx.fillStyle = '#2a1a0e'; ctx.beginPath(); ctx.moveTo(x - b * 0.36, y + h * 0.3); ctx.lineTo(x + b * 0.36, y + h * 0.3); ctx.lineTo(x + b * 0.2, y + h * 0.92); ctx.lineTo(x - b * 0.2, y + h * 0.92); ctx.closePath(); ctx.fill(); }
      };
      const kx = k.x + k.b / 2;
      if (phase === 'alt') filterForm(zieht === 'alt' ? zx : kx, zieht === 'alt' ? zy - k.h * 0.4 : k.y - 4, k.b * 0.9, k.h * 0.9, true);
      if (zieht === 'neu') filterForm(zx, zy - k.h * 0.4, k.b * 0.9, k.h * 0.9, false);
      if (['pulver', 'wasser', 'knopf', 'bruehen', 'fertig'].includes(phase)) {
        filterForm(kx, k.y - 4, k.b * 0.9, k.h * 0.9, false);
        const pv = Math.min(1, loeffel / 5);
        if (pv > 0) { ctx.fillStyle = '#3a2414'; ctx.beginPath(); ctx.moveTo(kx - k.b * 0.2 * (0.6 + pv), k.y + k.h * (0.85 - 0.5 * pv)); ctx.lineTo(kx + k.b * 0.2 * (0.6 + pv), k.y + k.h * (0.85 - 0.5 * pv)); ctx.lineTo(kx + k.b * 0.2, k.y + k.h * 0.85); ctx.lineTo(kx - k.b * 0.2, k.y + k.h * 0.85); ctx.closePath(); ctx.fill(); }
      }
      if (['wasser', 'knopf', 'bruehen', 'fertig'].includes(phase)) { ctx.fillStyle = '#1d1d1f'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.roundRect(k.x - 6, k.y - 16, k.b + 12, 14, 5); ctx.fill(); ctx.stroke(); } // Deckel zu
      if (phase !== 'alt' && phase !== 'neu') textMitte(ctx, `${loeffel} Löffel`, kx, k.y - 26, 15, '#ffe9a8');
      // Glaskanne auf der Warmhalteplatte
      const kn = M.kanne;
      ctx.fillStyle = '#3a3c40'; ctx.fillRect(kn.x - 6, kn.y + kn.h, kn.b + 12, 8);
      ctx.fillStyle = 'rgba(200,225,240,0.3)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(kn.x, kn.y, kn.b, kn.h, 12); ctx.fill(); ctx.stroke();
      const kaffee = phase === 'bruehen' || phase === 'fertig' ? bruehen : 0;
      if (kaffee > 0) { ctx.fillStyle = '#3a2414'; ctx.fillRect(kn.x + 4, kn.y + kn.h * (1 - kaffee * 0.8), kn.b - 8, kn.h * kaffee * 0.8 - 4); }
      if (phase === 'bruehen') for (let i = 0; i < 3; i++) { ctx.fillStyle = '#3a2414'; ctx.beginPath(); ctx.arc(kx, k.y + k.h + ((performance.now() / 6 + i * 25) % Math.max(1, kn.y - k.y - k.h)), 4, 0, Math.PI * 2); ctx.fill(); }
      // Einschaltknopf
      ctx.fillStyle = phase === 'knopf' ? '#3fbf4f' : phase === 'bruehen' || phase === 'fertig' ? '#ff6a3a' : '#555';
      ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.arc(M.knopf.x, M.knopf.y, M.knopf.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const tipp = {
        alt: 'Alten Filter mit Kaffeesatz aus dem Korb in den Mülleimer ziehen.',
        neu: 'Neuen Papierfilter vom Stapel in den Korb ziehen.',
        pulver: 'Auf die Dose klicken = ein Löffel Pulver. Dann auf den Korb klicken = zuklappen.',
        wasser: 'Wasserkanne gedrückt halten = Wasser in den Tank. An der gelben Markierung loslassen.',
        knopf: 'Grünen Knopf drücken.', bruehen: 'Läuft durch ...', fertig: 'Fertig. Ab zu Dennis!',
      }[phase];
      textMitte(ctx, tipp, m.b / 2, f.y - 18, 18, '#ffe9a8');
      if (meldungZeit > 0) textMitte(ctx, meldung, m.b / 2, f.y + f.h + 40, 22);
    },
  });
  return versprechen;
}

// Wasserrohrbruch: Rohrzange an die Verschraubung ansetzen, dann rechtsrum festdrehen, bis nichts mehr spritzt
export function rohrSpiel() {
  // Drei Schritte, damit es ein bisschen Spiel ist und nicht nur Halten:
  // 1. Teflonband ums Gewinde wickeln (3 Runden im Kreis um die Verschraubung ziehen, egal wie schnell)
  // 2. Rohrzange ansetzen (anklicken)
  // 3. Festdrehen (rechtsrum im Kreis); zu schnell = die Zange rutscht ab und muss neu angesetzt werden
  let f, mx, my, r;
  let phase = 'band';
  let band = 0; // 0..1 (3 Runden)
  let fest = 0; // 0..1 (1,5 Umdrehungen)
  let winkel = 0, abgerutscht = 0, rutscher = 0;
  let zieht = null, tempo = 0, rad = 0;
  const verlauf = []; // [Zeit, Winkel] der letzten 0,3 s
  let ton = dauer('wasser', 0.5);
  const tropfen = [];
  const { api, versprechen } = spielRahmen('Rohr abdichten', 'Erst Teflonband ums Gewinde wickeln (im Kreis ziehen), dann Rohrzange ansetzen (anklicken) und gefühlvoll rechtsrum festdrehen.', {
    beiGroesse(m) { f = flaeche(m); mx = m.b / 2; my = f.y + f.h * 0.5; r = Math.min(f.b, f.h) * 0.32; },
    events: {
      pointerdown(e) {
        const p = zeigerPos(api.canvas, e);
        if (phase === 'ansetzen') { if (Math.hypot(p.x - mx, p.y - my) < r * 0.6) { phase = 'drehen'; klonk(0.4); } return; }
        zieht = Math.atan2(p.y - my, p.x - mx); api.canvas.setPointerCapture?.(e.pointerId);
      },
      pointermove(e) {
        if (zieht === null || api.istFertig) return;
        const p = zeigerPos(api.canvas, e);
        const a = Math.atan2(p.y - my, p.x - mx);
        let d = a - zieht;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        zieht = a;
        if (phase === 'band') {
          band = Math.min(1, band + Math.abs(d) / (Math.PI * 6));
          if (Math.random() < 0.08) blip(900 + Math.random() * 300, 0.02, 0.03);
          if (band >= 1) { phase = 'ansetzen'; zieht = null; blip(660, 0.08); }
          return;
        }
        if (phase !== 'drehen' || d <= 0) return;
        tempo += d;
        // Drehtempo über die letzten ~0,25 s (echte Zeit): zu schnell = Zange rutscht ab
        const jetzt = performance.now();
        verlauf.push([jetzt, d]);
        while (verlauf.length && jetzt - verlauf[0][0] > 300) verlauf.shift();
        rad = verlauf.length > 3 ? verlauf.reduce((x, v) => x + v[1], 0) / 0.3 : 0;
        if (rad > 9) {
          verlauf.length = 0;
          phase = 'ansetzen'; zieht = null; abgerutscht++; rutscher = 1.2; rad = 0; tempo = 0; fest = Math.max(0, fest - 0.1);
          klonk(0.9); blip(180, 0.15, 0.15);
          return;
        }
        winkel += d;
        fest = Math.min(1, fest + d / (Math.PI * 3));
        if (Math.random() < 0.15) klonk(0.12);
        if (fest >= 1 && !api.istFertig) { if (ton) { ton.stopp(); ton = null; } klonk(0.6); api.fertig({ dicht: true, abgerutscht }); }
      },
      pointerup() { zieht = null; },
      pointercancel() { zieht = null; },
    },
    schritt(dt) {
      rutscher = Math.max(0, rutscher - dt);
      const staerke = (1 - fest) * (phase === 'band' ? 1 : 0.85);
      if (ton) ton.staerke?.(0.5 * staerke + 0.05);
      if (staerke > 0.02) for (let i = 0; i < 3 * staerke + 0.5; i++) tropfen.push({ x: mx + r * 0.05, y: my - r * 0.25, vx: (Math.random() - 0.3) * 500 * staerke, vy: -300 * staerke - Math.random() * 200, t: 0 });
      for (let i = tropfen.length - 1; i >= 0; i--) { const q = tropfen[i]; q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 900 * dt; if (q.t > 1) tropfen.splice(i, 1); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#3a4048'; ctx.fillRect(0, 0, m.b, m.h);
      // Rohr waagerecht mit Messing-Verschraubung (Sechskant) in der Mitte
      ctx.fillStyle = '#9aa1a8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
      ctx.fillRect(f.x, my - r * 0.16, f.b, r * 0.32); ctx.strokeRect(f.x, my - r * 0.16, f.b, r * 0.32);
      // Teflonband: weiße Wicklungen links neben der Mutter, je mehr gewickelt, desto mehr Lagen
      const lagen = Math.floor(band * 9);
      ctx.strokeStyle = '#f4f4f0'; ctx.lineWidth = 4;
      for (let k = 0; k < lagen; k++) { const x = mx - r * 0.42 - k * r * 0.045; ctx.beginPath(); ctx.moveTo(x, my - r * 0.17); ctx.lineTo(x - r * 0.03, my + r * 0.17); ctx.stroke(); }
      ctx.save(); ctx.translate(mx, my); ctx.rotate(winkel * 0.25);
      ctx.fillStyle = fest >= 1 ? '#d9b04a' : '#c9a24a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.beginPath();
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * r * 0.38, Math.sin(a) * r * 0.38); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
      for (const q of tropfen) { ctx.fillStyle = 'rgba(120,190,240,0.85)'; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); }
      if (phase === 'band' && zieht !== null) {
        // Bandrolle läuft mit
        const a = zieht; ctx.fillStyle = '#f4f4f0'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(mx + Math.cos(a) * r * 0.75, my + Math.sin(a) * r * 0.75, r * 0.12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      if (phase === 'drehen' || api.istFertig) {
        ctx.save(); ctx.translate(mx, my); ctx.rotate(winkel - Math.PI / 2);
        ctx.fillStyle = '#c8352a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.roundRect(r * 0.3, -r * 0.08, r * 1.0, r * 0.16, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5d6268'; ctx.beginPath(); ctx.roundRect(-r * 0.15, -r * 0.45, r * 0.5, r * 0.22, 6); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(-r * 0.15, r * 0.23, r * 0.5, r * 0.22, 6); ctx.fill(); ctx.stroke();
        ctx.restore();
      } else if (phase === 'ansetzen') {
        const puls = 0.5 + Math.sin(performance.now() / 200) * 0.5;
        ctx.strokeStyle = `rgba(255,200,30,${0.5 + puls * 0.5})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(mx, my, r * (0.5 + puls * 0.08), 0, Math.PI * 2); ctx.stroke();
      }
      balken(ctx, f.x, f.y + f.h + 30, f.b, 12, phase === 'band' ? band : fest, phase === 'band' ? '#f4f4f0' : '#ffc81e');
      const t = api.istFertig ? 'Dicht!' : rutscher > 0 ? 'Abgerutscht! Zu schnell. Neu ansetzen.' : phase === 'band' ? 'Teflonband wickeln: im Kreis um die Mutter ziehen'
        : phase === 'ansetzen' ? 'Klick auf die Verschraubung = Rohrzange ansetzen' : 'Rechtsrum drehen, gefühlvoll (nicht zu schnell)';
      textMitte(ctx, t, m.b / 2, f.y - 18, 18, rutscher > 0 ? '#ff9a8a' : '#ffe9a8');
    },
  });
  versprechen.then(() => { if (ton) { ton.stopp(); ton = null; } });
  return versprechen;
}

// Leiter runterholen per Räuberleiter: Jonny macht die Hände zur Stufe, man steht drauf und wackelt.
// A/D (oder links/rechts, Maus) gegenlenken; im ruhigen Bereich greift man nach der Leiter. Zu schief = runtergefallen, nochmal.
export function leiterSpiel() {
  let f;
  let a = 0.05, w = 0, greifen = 0, stuerze = 0, fallZeit = 0, zeit = 0;
  let lenk = 0, maus = null;
  const tasten = new Set();
  const r = (() => { let q = 7; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
  let stoss = 0, stossZiel = 0;
  const { api, versprechen } = spielRahmen('Räuberleiter', 'Jonny macht dir die Räuberleiter. Mit A/D (oder Maus links/rechts) das Gleichgewicht halten. Ruhig stehen = nach der Leiter greifen.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      keydown(e) { const k = e.key.toLowerCase(); if (['a', 'd', 'arrowleft', 'arrowright'].includes(k)) { tasten.add(k); e.preventDefault(); } },
      keyup(e) { tasten.delete(e.key.toLowerCase()); },
      pointermove(e) { maus = zeigerPos(api.canvas, e); },
      pointerdown(e) { maus = zeigerPos(api.canvas, e); },
    },
    schritt(dt) {
      zeit += dt;
      if (api.istFertig) return;
      if (fallZeit > 0) { fallZeit -= dt; if (fallZeit <= 0) { a = (r() - 0.5) * 0.1; w = 0; greifen = Math.max(0, greifen - 0.35); } return; }
      // Lenken: Tasten haben Vorrang, sonst Maus relativ zur Mitte
      const links = tasten.has('a') || tasten.has('arrowleft'), rechts = tasten.has('d') || tasten.has('arrowright');
      if (links || rechts) lenk = (rechts ? 1 : 0) - (links ? 1 : 0);
      else if (maus) lenk = Math.max(-1, Math.min(1, (maus.x - (f.x + f.b / 2)) / (f.b * 0.25)));
      else lenk = 0;
      // Jonny wackelt ab und zu (Stöße), Schwerkraft kippt weiter, Gegenlenken richtet auf
      if (zeit > stossZiel) { stoss = (r() - 0.5) * 2.4; stossZiel = zeit + 0.6 + r() * 1.2; }
      w += (Math.sin(a) * 3.4 + stoss - lenk * 3.0) * dt;
      w *= 1 - Math.min(1, dt * 0.9);
      a += w * dt;
      if (Math.abs(a) > 0.75) { stuerze++; fallZeit = 1.1; blip(140, 0.25, 0.2); return; }
      if (Math.abs(a) < 0.2) greifen += dt / 3.2;
      else greifen = Math.max(0, greifen - dt * 0.12);
      if (greifen >= 1) { greifen = 1; blip(880, 0.15); api.fertig({ stuerze }); }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#d8cdb5'; ctx.fillRect(0, 0, m.b, m.h);
      ctx.fillStyle = '#7d8a7a'; ctx.fillRect(0, f.y + f.h * 0.62, m.b, m.h); // Sockel
      const boden = f.y + f.h;
      ctx.fillStyle = '#8b8378'; ctx.fillRect(0, boden, m.b, m.h - boden);
      const cx = f.x + f.b / 2, s = f.h / 520;
      // Konsolen und Leiter oben an der Wand
      const ly = f.y + 30 * s;
      ctx.fillStyle = '#444'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      for (const dx of [-120, 120]) { ctx.fillRect(cx + dx * s - 6, ly, 12, 40 * s); ctx.strokeRect(cx + dx * s - 6, ly, 12, 40 * s); }
      const gehoben = api.istFertig ? -60 * s : -greifen * 10 * s;
      ctx.save(); ctx.translate(cx, ly + gehoben); ctx.rotate(-0.06);
      ctx.fillStyle = '#c9ced3'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(-190 * s, -8 * s, 380 * s, 12 * s, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(-190 * s, 18 * s, 380 * s, 12 * s, 6); ctx.fill(); ctx.stroke();
      for (let k = 0; k < 6; k++) { ctx.fillRect((-160 + k * 64) * s, 0, 8 * s, 22 * s); ctx.strokeRect((-160 + k * 64) * s, 0, 8 * s, 22 * s); }
      ctx.restore();
      // Jonny unten: Cap, Bart, Weste, verschränkte Hände als Stufe
      const jy = boden;
      ctx.lineWidth = 4; ctx.strokeStyle = '#111';
      ctx.fillStyle = '#1c1c1c'; ctx.fillRect(cx - 40 * s, jy - 95 * s, 30 * s, 95 * s); ctx.fillRect(cx + 10 * s, jy - 95 * s, 30 * s, 95 * s);
      ctx.fillStyle = '#f2f0ea'; ctx.beginPath(); ctx.roundRect(cx - 55 * s, jy - 230 * s, 110 * s, 140 * s, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#b08850'; ctx.fillRect(cx - 55 * s, jy - 225 * s, 35 * s, 130 * s); ctx.fillRect(cx + 20 * s, jy - 225 * s, 35 * s, 130 * s);
      ctx.fillStyle = '#e2b394'; ctx.beginPath(); ctx.arc(cx, jy - 260 * s, 32 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(cx, jy - 245 * s, 26 * s, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fill();
      ctx.fillStyle = '#3f6b3a'; ctx.beginPath(); ctx.arc(cx, jy - 272 * s, 30 * s, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.fillRect(cx - 4 * s, jy - 276 * s, 48 * s, 8 * s);
      // Hände als Stufe vor dem Bauch
      const hy = jy - 160 * s;
      ctx.fillStyle = '#e2b394'; ctx.beginPath(); ctx.ellipse(cx, hy, 34 * s, 14 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // man selbst: steht mit einem Fuß in Jonnys Händen und kippt um diesen Punkt
      const kippe = fallZeit > 0 ? Math.sign(a || 1) * (0.75 + (1.1 - fallZeit) * 1.4) : a;
      ctx.save(); ctx.translate(cx, hy - 8 * s); ctx.rotate(kippe);
      if (fallZeit > 0) ctx.translate(0, (1.1 - fallZeit) * 160 * s);
      ctx.fillStyle = '#2b4f86'; ctx.fillRect(-16 * s, -120 * s, 32 * s, 120 * s); ctx.strokeRect(-16 * s, -120 * s, 32 * s, 120 * s); // Beine
      ctx.fillStyle = '#c0392b'; ctx.beginPath(); ctx.roundRect(-34 * s, -250 * s, 68 * s, 135 * s, 14); ctx.fill(); ctx.stroke(); // Oberkörper
      ctx.fillStyle = '#e8b896'; ctx.beginPath(); ctx.arc(0, -282 * s, 30 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); // Kopf
      // Arme strecken sich zur Leiter, je weiter man greift
      const arm = Math.PI * (0.55 + greifen * 0.38); // von schräg zur Seite bis fast senkrecht nach oben
      for (const sx of [-1, 1]) {
        ctx.save(); ctx.translate(sx * 30 * s, -235 * s); ctx.rotate(-sx * arm);
        ctx.fillStyle = '#c0392b'; ctx.fillRect(-9 * s, 0, 18 * s, 95 * s); ctx.strokeRect(-9 * s, 0, 18 * s, 95 * s);
        ctx.fillStyle = '#e8b896'; ctx.beginPath(); ctx.arc(0, 100 * s, 11 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      // Gleichgewichtsanzeige: grüner Bereich in der Mitte, Zeiger = Neigung
      const bx = f.x + f.b * 0.2, bb = f.b * 0.6, by = boden + 26;
      ctx.fillStyle = '#5b5b5b'; ctx.fillRect(bx, by, bb, 14);
      ctx.fillStyle = '#4caf50'; ctx.fillRect(bx + bb / 2 - bb * (0.2 / 0.75) / 2, by, bb * (0.2 / 0.75), 14);
      ctx.fillStyle = '#ffc81e'; ctx.fillRect(bx + bb / 2 + (Math.max(-0.75, Math.min(0.75, a)) / 0.75) * bb / 2 - 4, by - 6, 8, 26);
      balken(ctx, bx, by + 30, bb, 10, greifen, '#ffc81e');
      const t = api.istFertig ? 'Hab sie! Runter damit.' : fallZeit > 0 ? 'Runtergefallen! Nochmal.' : Math.abs(a) < 0.2 ? 'Ruhig ... greifen ...' : 'Gegenlenken! (A/D oder Maus)';
      textMitte(ctx, t, m.b / 2, f.y - 4, 22, '#fff');
    },
  });
  return versprechen;
}

// Klo pömpeln (P7): seitlicher Schnitt durch ein Stand-WC. Unten aus der Schüssel geht der Siphon (dickes Rohr im Porzellan)
// erst runter, dann nach hinten hoch über die Schwelle und hinten runter in den Wandabfluss. Das Wasser steht bis fast oben,
// im Siphon steckt eine dicke Wurst mit Klopapier.
// 1. Ansetzen: Pömpel mit der Maus genau über das Abflussloch bringen und Maus drücken = Glocke sitzt dicht.
// 2. Pumpen: Maus gedrückt halten und hoch und runter ziehen. Jeder volle Hub (runter, dann hoch) schiebt die Wurst weiter.
//    Zu schnell runtergedrückt = es spritzt (Spritzer zählen). Zu weit seitlich = Glocke rutscht ab, neu ansetzen.
// Nach genug guten Hüben rutscht sie über die Schwelle und das Wasser läuft gurgelnd ab.
export function poempelSpiel() {
  let f, ablaufX, ablaufY, wasserY, schwelleY, bodenY;
  let px = 0, py = 0; // Mausposition
  let sitzt = false, startY = 0, tief = 0; // tief 0 (oben) .. 1 (ganz gedrückt)
  let unten = false, runterZeit = 0, letzteY = 0, tempo = 0;
  let pfropfen = 0; // 0..1: Weg der Wurst bis über die Schwelle
  let spritzer = 0, abgerutscht = 0, huebe = 0;
  let ablaufen = 0; // 0..1 nach dem Durchbruch
  const tropfen = [];
  let meldung = '', meldungZeit = 0;
  const meld = (t) => { meldung = t; meldungZeit = 2; };
  const ROHR = 44; // lichte Weite des Siphons
  let bahn = [], laenge = 0, sSchwelle = 0.6;
  function spritzen(n) {
    for (let i = 0; i < n; i++) tropfen.push({ x: ablaufX + (Math.random() - 0.5) * 60, y: wasserY, vx: (Math.random() - 0.5) * 260, vy: -220 - Math.random() * 260, t: 0 });
  }
  // Mittellinie des Siphons als weiche Kurve (Catmull-Rom), nach Bogenlänge abgetastet
  function bahnBauen() {
    // nach Vorlage (Schnittbild Stand-WC): Einlass unten in der Schüssel, schräg nach hinten hoch über die Schwelle,
    // hinten senkrecht runter, unten nach vorn, durch den Boden und im Boden zur Wand
    const Q = (u, v) => [f.x + u * f.b, f.y + v * f.h];
    const P = [Q(0.52, 0.64), Q(0.515, 0.68), Q(0.485, 0.71), Q(0.445, 0.68), Q(0.37, 0.57), Q(0.32, 0.47), Q(0.28, 0.43), Q(0.245, 0.46),
      Q(0.225, 0.56), Q(0.225, 0.70), Q(0.25, 0.80), Q(0.32, 0.845), Q(0.40, 0.855), Q(0.44, 0.88), Q(0.45, 0.95), Q(0.45, 1.1)];
    const cr = (p0, p1, p2, p3, t) => { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); };
    bahn = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let k = 0; k < 20; k++) { const t = k / 20; bahn.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]); }
    }
    bahn.push(P[P.length - 1].slice());
    laenge = 0; bahn[0][2] = 0;
    for (let i = 1; i < bahn.length; i++) { laenge += Math.hypot(bahn[i][0] - bahn[i - 1][0], bahn[i][1] - bahn[i - 1][1]); bahn[i][2] = laenge; }
    // höchster Punkt (Schwelle) als Anteil der Länge
    let best = 0; for (let i = 1; i < bahn.length * 0.6; i++) if (bahn[i][1] < bahn[best][1]) best = i;
    sSchwelle = bahn[best][2] / laenge;
  }
  function rohrPunkt(s) {
    const ziel = Math.max(0, Math.min(1, s)) * laenge;
    for (let i = 1; i < bahn.length; i++) if (bahn[i][2] >= ziel) {
      const a = bahn[i - 1], b = bahn[i], t = (ziel - a[2]) / Math.max(1e-6, b[2] - a[2]);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[1] - a[1], b[0] - a[0])];
    }
    const e = bahn[bahn.length - 1]; return [e[0], e[1], 0];
  }
  const { api, versprechen } = spielRahmen('Klo pömpeln', 'Pömpel genau über das Abflussloch bringen und Maus drücken (dicht ansetzen). Dann mit gedrückter Maus hoch und runter pumpen. Nicht zu hektisch, sonst spritzt es!', {
    beiGroesse(m) {
      f = flaeche(m);
      ablaufX = f.x + f.b * 0.52; ablaufY = f.y + f.h * 0.64; wasserY = f.y + f.h * 0.36; schwelleY = f.y + f.h * 0.49; bodenY = f.y + f.h * 0.94;
      bahnBauen();
      if (!px) { px = f.x + f.b * 0.72; py = wasserY - 40; }
    },
    events: {
      pointermove(e) {
        const p = zeigerPos(api.canvas, e);
        px = p.x; py = p.y;
        if (!sitzt || api.istFertig) return;
        if (Math.abs(px - ablaufX) > 45) { sitzt = false; abgerutscht++; spritzen(6); klonk(0.2); meld('Abgerutscht! Wieder genau über dem Loch ansetzen.'); return; }
        const neu = Math.max(0, Math.min(1, (py - startY) / 120));
        tempo = Math.max(tempo, Math.abs(p.y - letzteY));
        letzteY = p.y;
        if (!unten && neu > 0.8) {
          unten = true;
          const dauer = performance.now() - runterZeit;
          if (dauer < 170 || tempo > 40) { spritzer++; spritzen(14); klonk(0.3); meld('Zu hektisch! Es spritzt ...'); }
        }
        if (unten && neu < 0.2) {
          unten = false; huebe++;
          pfropfen = Math.min(1, pfropfen + 0.11 + Math.random() * 0.05);
          blip(220 + pfropfen * 160, 0.06, 0.2);
          runterZeit = performance.now(); tempo = 0;
          if (pfropfen >= 1) { ablaufen = 0.001; meld('Sie rutscht durch!'); }
        }
        tief = neu;
      },
      pointerdown(e) {
        if (api.istFertig || ablaufen) return;
        const p = zeigerPos(api.canvas, e);
        if (Math.abs(p.x - ablaufX) < 26 && p.y > wasserY - 80) {
          sitzt = true; startY = p.y; letzteY = p.y; tief = 0; unten = false; runterZeit = performance.now(); tempo = 0;
          blip(320, 0.05);
          meld('Sitzt dicht. Jetzt pumpen: runter und wieder hoch.');
        } else { spritzen(3); meld('Daneben. Genau über das Abflussloch!'); }
        api.canvas.setPointerCapture?.(e.pointerId);
      },
      pointerup() { sitzt = false; tief = 0; },
      pointercancel() { sitzt = false; tief = 0; },
    },
    schritt(dt) {
      meldungZeit = Math.max(0, meldungZeit - dt);
      tempo = Math.max(0, tempo - dt * 200);
      for (let i = tropfen.length - 1; i >= 0; i--) { const d = tropfen[i]; d.t += dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.t > 1.2) tropfen.splice(i, 1); }
      if (ablaufen && !api.istFertig) {
        ablaufen = Math.min(1, ablaufen + dt * 0.45);
        if (ablaufen >= 1) api.fertig({ spritzer, abgerutscht, huebe });
      }
    },
    zeichnen() {
      const { ctx, m } = api;
      const WASSER = 'rgba(150,130,80,0.85)', LEER = '#e4e1d8', PORZ = '#fbfbf8';
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(0, 0, m.b, m.h);
      // Fliesenwand und Boden
      ctx.fillStyle = '#e8e4da'; ctx.fillRect(f.x, f.y, f.b, f.h);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)'; ctx.lineWidth = 2;
      for (let x = f.x; x < f.x + f.b; x += 48) { ctx.beginPath(); ctx.moveTo(x, f.y); ctx.lineTo(x, bodenY); ctx.stroke(); }
      for (let y = f.y; y < bodenY; y += 48) { ctx.beginPath(); ctx.moveTo(f.x, y); ctx.lineTo(f.x + f.b, y); ctx.stroke(); }
      ctx.fillStyle = '#9a968c'; ctx.fillRect(f.x, bodenY, f.b, f.y + f.h - bodenY);
      const bx = ablaufX, oy = ablaufY, rimY = f.y + f.h * 0.3;
      ctx.save(); ctx.beginPath(); ctx.rect(f.x, f.y, f.b, f.h); ctx.clip();
      const X = (u) => f.x + u * f.b, Y = (v) => f.y + v * f.h;
      // Wand links und Boden (schraffiert)
      ctx.fillStyle = '#b9b6ae'; ctx.fillRect(f.x, bodenY, f.b, f.y + f.h - bodenY);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2;
      for (let x = f.x - f.h; x < f.x + f.b; x += 16) { ctx.beginPath(); ctx.moveTo(x, f.y + f.h); ctx.lineTo(x + (f.y + f.h - bodenY), bodenY); ctx.stroke(); }
      ctx.fillStyle = '#9e9b94'; ctx.fillRect(f.x, f.y, f.b * 0.04, f.h);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(f.x + f.b * 0.04, f.y); ctx.lineTo(f.x + f.b * 0.04, f.y + f.h); ctx.moveTo(f.x + f.b * 0.04, bodenY); ctx.lineTo(f.x + f.b, bodenY); ctx.stroke();
      // Spülkasten hinten oben
      ctx.fillStyle = PORZ; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(X(0.13), Y(0.0) + 4, X(0.37) - X(0.13), rimY - Y(0.0) - 14, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(120,190,230,0.55)'; ctx.fillRect(X(0.145), Y(0.08), X(0.355) - X(0.145), rimY - 22 - Y(0.08));
      // Porzellan-Körper: Rand oben, Schüsselbauch vorne, Standfuß, hinten der Sockel mit dem Siphon
      ctx.fillStyle = PORZ; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(X(0.15), rimY - 6);
      ctx.lineTo(X(0.86), rimY - 6);
      ctx.quadraticCurveTo(X(0.88), rimY + 10, X(0.85), rimY + 22);
      ctx.bezierCurveTo(X(0.84), Y(0.55), X(0.76), Y(0.72), X(0.68), Y(0.74));
      ctx.lineTo(X(0.68), bodenY);
      ctx.lineTo(X(0.17), bodenY);
      ctx.lineTo(X(0.17), Y(0.56));
      ctx.quadraticCurveTo(X(0.15), Y(0.4), X(0.15), rimY - 6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // Siphon: dicker Kanal im Porzellan, bis zur Schwelle mit Wasser gefüllt, dahinter leer
      ctx.lineCap = 'butt'; ctx.lineJoin = 'round';
      const kanal = (s0, s1, b, farbe) => { ctx.strokeStyle = farbe; ctx.lineWidth = b; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const [x, y] = rohrPunkt(s0 + (s1 - s0) * i / 120); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); };
      kanal(0, 1, ROHR + 8, '#111');
      kanal(0, 1, ROHR, LEER);
      const wasserBis = ablaufen ? sSchwelle * (1 - ablaufen * 0.25) : sSchwelle;
      kanal(0, wasserBis, ROHR, WASSER);
      // Schüssel-Mulde: vom Rand runter zum Einlass unten (genau so breit wie der Siphon)
      const h = ROHR / 2;
      const hinten = X(0.40), vorneM = X(0.82);
      const mulde = () => {
        ctx.beginPath();
        ctx.moveTo(hinten, rimY + 4);
        ctx.lineTo(vorneM, rimY + 4);
        ctx.bezierCurveTo(X(0.82), Y(0.55), X(0.68), Y(0.66), bx + h, oy);
        ctx.lineTo(bx + h, oy + 8);
        ctx.lineTo(bx - h, oy + 8);
        ctx.lineTo(bx - h, oy);
        ctx.bezierCurveTo(X(0.44), Y(0.55), X(0.42), Y(0.42), hinten, rimY + 4);
        ctx.closePath();
      };
      ctx.save(); mulde(); ctx.clip();
      ctx.fillStyle = LEER; ctx.fillRect(f.x, rimY, f.b, oy + 20 - rimY);
      const wy = wasserY + (schwelleY - wasserY) * Math.min(1, ablaufen * 1.2);
      ctx.fillStyle = WASSER; ctx.fillRect(f.x, wy + Math.sin(performance.now() / 300) * 2, f.b, oy + 20 - wy);
      if (ablaufen) { ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(bx, wy + 40, 18 + k * 14, performance.now() / 200 + k, performance.now() / 200 + k + 2); ctx.stroke(); } }
      ctx.restore();
      // Muldenwände nachziehen (unten offen: dort geht die Mulde nahtlos in den Siphon über)
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(vorneM, rimY + 4); ctx.bezierCurveTo(X(0.82), Y(0.55), X(0.68), Y(0.66), bx + h, oy); ctx.lineTo(bx + h + 2, oy + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(hinten, rimY + 4); ctx.bezierCurveTo(X(0.42), Y(0.42), X(0.44), Y(0.55), bx - h, oy); ctx.lineTo(bx - h - 2, oy + 6); ctx.stroke();
      // Klobrille als Schnitt oben auf dem Rand
      ctx.fillStyle = '#f4f2ea'; ctx.fillRect(hinten - 10, rimY - 20, vorneM - hinten + 40, 14); ctx.strokeRect(hinten - 10, rimY - 20, vorneM - hinten + 40, 14);
      // die Wurst: dick, liegt längs im Siphon (mit Klopapier), rutscht beim Pumpen Richtung Schwelle
      if (ablaufen < 0.6) {
        const sw = Math.min(0.92, 0.1 + pfropfen * (sSchwelle - 0.1) + ablaufen * 0.6);
        // Wurst: liegt gebogen im Rohr, runde Enden, Einschnürungen, Glanz, ein Fetzen Klopapier
        const lang = 120 / laenge, a0 = Math.max(0, sw - lang / 2), a1 = Math.min(1, sw + lang / 2);
        const zug = (b, farbe, d0 = a0, d1 = a1) => { ctx.strokeStyle = farbe; ctx.lineWidth = b; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 30; i++) { const [x, y] = rohrPunkt(d0 + (d1 - d0) * i / 30); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); } ctx.stroke(); };
        zug(ROHR - 2, '#111');
        zug(ROHR - 8, '#6b4a24');
        zug(ROHR - 22, '#7d5830', a0 + (a1 - a0) * 0.08, a1 - (a1 - a0) * 0.08);
        // Einschnürungen quer zur Wurst
        ctx.strokeStyle = 'rgba(35,20,8,0.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (const q of [0.22, 0.42, 0.62, 0.8]) {
          const [x, y, w] = rohrPunkt(a0 + (a1 - a0) * q), r = (ROHR - 10) / 2;
          ctx.beginPath(); ctx.moveTo(x - Math.sin(w) * r, y + Math.cos(w) * r);
          ctx.quadraticCurveTo(x + Math.cos(w) * 6, y + Math.sin(w) * 6, x + Math.sin(w) * r, y - Math.cos(w) * r); ctx.stroke();
        }
        // Glanzstreifen oben
        ctx.strokeStyle = 'rgba(255,230,190,0.45)'; ctx.lineWidth = 4;
        ctx.beginPath();
        for (let i = 0; i <= 12; i++) { const [x, y, w] = rohrPunkt(a0 + (a1 - a0) * (0.2 + i * 0.05)); const ox = Math.sin(w) * 8, oy2 = -Math.cos(w) * 8; if (i) ctx.lineTo(x + ox, y + oy2); else ctx.moveTo(x + ox, y + oy2); }
        ctx.stroke();
        const [tx, ty, tw] = rohrPunkt(a0 + (a1 - a0) * 0.7);
        ctx.save(); ctx.translate(tx, ty); ctx.rotate(tw);
        ctx.fillStyle = '#f2efe4'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(-8, -12); ctx.lineTo(10, -14); ctx.lineTo(14, -4); ctx.lineTo(-4, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      // Abflussloch-Markierung
      if (!sitzt && !ablaufen) { ctx.strokeStyle = 'rgba(255,200,30,0.95)'; ctx.setLineDash([6, 5]); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ablaufX, oy - 2, h + 2, 9, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
      // Pömpel: folgt der Maus; sitzt er, steht er auf dem Loch und geht mit dem Hub runter
      const gx = sitzt ? ablaufX : px;
      const gy = sitzt ? oy - 4 + tief * 16 : Math.min(py, oy - 4);
      const quetsch = sitzt ? 1 - tief * 0.35 : 1;
      ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.fillStyle = '#b27a42'; ctx.fillRect(gx - 7, gy - 250, 14, 230); ctx.strokeRect(gx - 7, gy - 250, 14, 230);
      ctx.fillStyle = '#c8352a';
      ctx.beginPath(); ctx.ellipse(gx, gy, 40 / quetsch, 32 * quetsch, 0, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      // Spritzer
      ctx.fillStyle = WASSER;
      for (const d of tropfen) { ctx.beginPath(); ctx.arc(d.x, d.y, 5, 0, Math.PI * 2); ctx.fill(); }
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      balken(ctx, f.x, f.y + f.h + 26, f.b, 12, ablaufen ? 1 : pfropfen, '#ffc81e');
      const kopf = api.istFertig ? (spritzer ? `Frei! ${spritzer}x gespritzt. Bäh.` : 'Frei! Sauber gepömpelt.') : ablaufen ? 'Es gurgelt ...' : sitzt ? 'Pumpen: Maus runter und wieder hoch ziehen (gleichmäßig)' : 'Pömpel über das gelbe Loch, dann Maus drücken';
      textMitte(ctx, kopf, m.b / 2, f.y - 18, 18, '#ffe9a8');
      if (meldungZeit > 0) textMitte(ctx, meldung, f.x + f.b * 0.75, f.y + 34, 20, '#ffb0a0');
    },
  });
  return versprechen;
}

// Torbens Finger verarzten (E1): Hand von oben, der Zeigefinger blutet.
// 1. Abtupfen: mit gedrückter Maus über das Blut wischen (Kompresse), es kommt immer etwas nach, also zügig.
// 2. Druck: Maus auf der Wunde gedrückt halten, bis die Blutung steht (zu früh loslassen = blutet wieder).
// 3. Verband: im Kreis um den Finger ziehen, vier Lagen. Zu schnell = Verband sitzt locker.
export function fingerSpiel() {
  let f, fx, fy; // Wunde (Fingermitte)
  let phase = 'tupfen';
  let px = 0, py = 0, maus = false;
  const blut = [];
  let nachTakt = 0, druck = 0, nachgeblutet = 0, druckGriff = false; // druckGriff: Maus wurde in der Druck-Phase neu gedrückt
  let lagen = 0, zieht = null, tempo = 0, locker = 0, lockerSperre = 0;
  let meldung = '', meldungZeit = 0;
  const meld = (t) => { meldung = t; meldungZeit = 2; };
  const LAGEN = 4;
  function neuesBlut(n = 1) {
    for (let i = 0; i < n; i++) blut.push({ x: fx + (Math.random() - 0.5) * 70, y: fy + (Math.random() - 0.2) * 90, r: 10 + Math.random() * 12, hp: 1 });
  }
  const { api, versprechen } = spielRahmen('Torbens Finger verarzten', 'Erst das Blut mit der Kompresse abtupfen (Maus gedrückt drüberwischen), dann auf die Wunde drücken (Maus halten), dann den Verband im Kreis herumwickeln. Nicht hetzen!', {
    beiGroesse(m) {
      f = flaeche(m);
      fx = f.x + f.b * 0.5; fy = f.y + f.h * 0.43;
      if (!blut.length && phase === 'tupfen') neuesBlut(7);
    },
    events: {
      pointerdown(e) {
        if (api.istFertig) return;
        const p = zeigerPos(api.canvas, e); px = p.x; py = p.y; maus = true;
        if (phase === 'wickeln') zieht = Math.atan2(p.y - fy, p.x - fx);
        if (phase === 'druecken') { druckGriff = true; if (Math.hypot(p.x - fx, p.y - fy) > 60) meld('Genau auf die Wunde drücken!'); }
        api.canvas.setPointerCapture?.(e.pointerId);
      },
      pointermove(e) {
        const p = zeigerPos(api.canvas, e); px = p.x; py = p.y;
        if (phase === 'wickeln' && maus && zieht !== null && !api.istFertig) {
          const a = Math.atan2(p.y - fy, p.x - fx);
          let d = a - zieht;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          zieht = a;
          tempo += Math.abs(d) * 4;
          lagen = Math.min(LAGEN, lagen + Math.abs(d) / (Math.PI * 2));
          if (lagen >= LAGEN) { blip(760, 0.1); api.fertig({ locker, nachgeblutet }); }
        }
      },
      pointerup() {
        maus = false; zieht = null;
        if (phase === 'druecken' && druckGriff && druck > 0 && druck < 1) { druck = 0; nachgeblutet++; neuesBlut(2); phase = 'tupfen'; meld('Zu früh losgelassen! Es blutet wieder.'); }
        druckGriff = false;
      },
      pointercancel() { maus = false; zieht = null; },
    },
    schritt(dt) {
      meldungZeit = Math.max(0, meldungZeit - dt);
      lockerSperre = Math.max(0, lockerSperre - dt);
      if (phase === 'tupfen') {
        nachTakt -= dt;
        if (nachTakt <= 0) { nachTakt = 1.3; if (blut.length < 12) neuesBlut(1); }
        if (maus) for (const b of blut) if (Math.hypot(px - b.x, py - b.y) < b.r + 26) b.hp -= dt * 2.4;
        for (let i = blut.length - 1; i >= 0; i--) if (blut[i].hp <= 0) { blut.splice(i, 1); if (Math.random() < 0.3) blip(500, 0.03, 0.05); }
        if (!blut.length) { phase = 'druecken'; druckGriff = false; meld('Sauber! Maus los, dann neu fest auf die Wunde drücken und halten.'); }
      } else if (phase === 'druecken') {
        if (maus && druckGriff && Math.hypot(px - fx, py - fy) < 60) druck = Math.min(1, druck + dt / 2.5);
        if (druck >= 1) { phase = 'wickeln'; maus = false; meld('Blutung steht. Jetzt den Verband im Kreis herumwickeln.'); blip(660, 0.08); }
      } else if (phase === 'wickeln') {
        tempo *= Math.pow(0.02, dt);
        const radS = tempo / 4 * 3.9;
        if (maus && radS > 9 && lockerSperre <= 0) { locker++; lockerSperre = 1.5; klonk(0.2); meld('Zu schnell! Der Verband sitzt locker.'); }
      }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(0, 0, m.b, m.h);
      // Werkstattboden als Unterlage
      ctx.fillStyle = '#9a968c'; ctx.fillRect(f.x, f.y, f.b, f.h);
      // Hand von oben (Handrücken). Erst alle Umrisse dick in Schwarz, dann alle Flächen in Hautfarbe darüber:
      // so ist die Hand eine zusammenhängende Form, die Finger gehen ohne Linie in den Handrücken über.
      const HAUT = '#efc3a6', HAUT_D = '#d9a184', HAUT_H = '#f7d6bf', ROT = '#f0b39a';
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      // Ärmel (dunkelgraues Shirt)
      ctx.fillStyle = '#45484e'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.roundRect(fx - 70, f.y + f.h * 0.95, 230, 60, 10); ctx.fill(); ctx.stroke();
      const basisY = f.y + f.h * 0.66;
      // Finger: [x, Basis-y, Länge, Breite, Drehung, verletzt]; Basis liegt tief im Handrücken
      const FINGER = [
        [fx + 136, basisY + 40, f.h * 0.27, 52, 0.2, false], // kleiner Finger
        [fx + 102, basisY + 8, f.h * 0.35, 56, 0.1, false], // Ringfinger
        [fx + 52, basisY, f.h * 0.4, 58, 0.03, false], // Mittelfinger
        [fx, basisY + 6, f.h * 0.36, 58, 0, true], // Zeigefinger (verletzt, geschwollen), Wunde bei fy
      ];
      const DAUMEN = [fx - 30, f.y + f.h * 0.84, f.h * 0.3, 60, -1.05];
      const fingerPfad = (x, y0, lang, w) => {
        ctx.beginPath();
        // der Ansatz reicht 50 px in den Handrücken hinein (wird dort von der Handfläche überdeckt): keine Kante am Übergang
        ctx.moveTo(-w / 2, 50);
        ctx.lineTo(-w / 2, -lang + w / 2);
        ctx.arc(0, -lang + w / 2, w / 2, Math.PI, 0);
        ctx.lineTo(w / 2, 50);
        ctx.closePath();
      };
      const handPfad = () => { ctx.beginPath(); ctx.ellipse(fx + 45, f.y + f.h * 0.8, 120, 88, 0, 0, Math.PI * 2); };
      const gelenkPfad = () => { ctx.beginPath(); ctx.roundRect(fx - 30, f.y + f.h * 0.84, 160, 70, 18); };
      const alleFormen = (je) => {
        je(gelenkPfad, null);
        je(handPfad, null);
        for (const [x, y0, lang, w, dreh, verletzt] of [...FINGER, [...DAUMEN, false]]) {
          const ww = verletzt ? w * 1.12 : w;
          je(() => fingerPfad(x, y0, lang, ww), [x, y0 + 30, dreh], verletzt);
        }
      };
      const mitLage = (lage, tun) => { ctx.save(); if (lage) { ctx.translate(lage[0], lage[1]); ctx.rotate(lage[2]); ctx.translate(0, -30); } tun(); ctx.restore(); };
      // 1. Umrisse
      ctx.strokeStyle = '#111'; ctx.lineWidth = 9;
      alleFormen((pfad, lage) => mitLage(lage, () => { pfad(); ctx.stroke(); }));
      // 2. Flächen (überdecken die inneren Umrisse): erst die Finger, dann Handrücken und Gelenk darüber (Fingeransätze verschwinden darunter)
      const flaechen = [];
      alleFormen((pfad, lage, verletzt) => flaechen.push([pfad, lage, verletzt]));
      for (const [pfad, lage, verletzt] of [...flaechen.slice(2), ...flaechen.slice(0, 2)]) mitLage(lage, () => { pfad(); ctx.fillStyle = verletzt ? ROT : HAUT; ctx.fill(); });
      // 3. Einzelheiten je Finger: Schatten, Licht, Gelenkfalten, Nagel
      for (const [x, y0, lang, w, dreh, verletzt] of [...FINGER, [...DAUMEN, false]]) {
        const ww = verletzt ? w * 1.12 : w;
        mitLage([x, y0 + 30, dreh], () => {
          ctx.strokeStyle = HAUT_D; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ww / 2 - 7, -10); ctx.lineTo(ww / 2 - 7, -lang + ww * 0.6); ctx.stroke();
          ctx.strokeStyle = HAUT_H; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-ww / 2 + 9, -20); ctx.lineTo(-ww / 2 + 9, -lang + ww * 0.7); ctx.stroke();
          ctx.strokeStyle = 'rgba(120,70,50,0.7)'; ctx.lineWidth = 2.2;
          for (const [q, n] of [[0.42, 3], [0.7, 2]]) {
            const y = -lang * q;
            for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(-ww * 0.3, y - i * 5); ctx.quadraticCurveTo(0, y - i * 5 - 4, ww * 0.3, y - i * 5); ctx.stroke(); }
          }
          const ny = -lang + ww * 0.58;
          ctx.fillStyle = verletzt ? '#4a2f5e' : '#f7d9cc'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.roundRect(-ww * 0.28, ny - ww * 0.36, ww * 0.56, ww * 0.56, [ww * 0.25, ww * 0.25, 6, 6]); ctx.fill(); ctx.stroke();
          if (!verletzt) { ctx.fillStyle = '#fff7f2'; ctx.fillRect(-ww * 0.22, ny - ww * 0.34, ww * 0.44, 5); }
          else { ctx.fillStyle = 'rgba(130,60,150,0.4)'; ctx.beginPath(); ctx.ellipse(0, ny + 8, ww * 0.55, ww * 0.55, 0, 0, Math.PI * 2); ctx.fill(); }
        });
      }
      // Knöchel auf dem Handrücken, Sehnen, Ader
      ctx.fillStyle = 'rgba(200,130,105,0.45)';
      for (const [x, y0, , , dreh] of FINGER) { ctx.beginPath(); ctx.ellipse(x + Math.sin(dreh) * 10, y0 + 22, 18, 9, dreh, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = 'rgba(150,95,75,0.45)'; ctx.lineWidth = 3;
      for (const [x, y0] of FINGER) { ctx.beginPath(); ctx.moveTo(x, y0 + 40); ctx.quadraticCurveTo(x + 8, f.y + f.h * 0.84, fx + 45 + (x - fx - 45) * 0.4, f.y + f.h * 0.93); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(90,120,170,0.35)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(fx + 20, f.y + f.h * 0.97); ctx.quadraticCurveTo(fx + 50, f.y + f.h * 0.86, fx + 95, f.y + f.h * 0.83); ctx.stroke();
      // Schnitt an der Fingerkuppe
      if (phase !== 'wickeln' || lagen < 1) { ctx.strokeStyle = '#8a1010'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx - 18, fy + 6); ctx.quadraticCurveTo(fx, fy - 4, fx + 16, fy - 2); ctx.stroke(); }
      // Blut
      for (const b of blut) { ctx.fillStyle = `rgba(178,20,20,${0.4 + b.hp * 0.55})`; ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (0.6 + b.hp * 0.4), 0, Math.PI * 2); ctx.fill(); }
      // Verbandlagen
      if (lagen > 0) {
        ctx.fillStyle = '#fbfbf8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        const hoch = 30 + Math.min(lagen, LAGEN) * 18;
        ctx.beginPath(); ctx.roundRect(fx - 27 - lagen * 1.5, fy - hoch / 2, 54 + lagen * 3, hoch, 12); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2;
        for (let k = 0; k < Math.floor(lagen * 3); k++) { const y = fy - hoch / 2 + 8 + k * (hoch - 16) / Math.max(1, Math.floor(lagen * 3) - 1); ctx.beginPath(); ctx.moveTo(fx - 26, y); ctx.lineTo(fx + 26, y + 6); ctx.stroke(); }
        if (locker) { ctx.strokeStyle = '#fbfbf8'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(fx + 30, fy + 10); ctx.quadraticCurveTo(fx + 70, fy + 30, fx + 60, fy + 70); ctx.stroke(); }
      }
      // Werkzeug am Mauszeiger: Kompresse (Tupfen/Drücken) oder Verbandrolle (Wickeln)
      if (!api.istFertig) {
        if (phase === 'wickeln') {
          ctx.strokeStyle = 'rgba(255,233,168,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(fx, fy, 70, -0.4, Math.PI * 1.3); ctx.stroke();
          ctx.fillStyle = '#fbfbf8'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.stroke();
        } else {
          ctx.fillStyle = maus ? '#f4f0e6' : 'rgba(250,250,245,0.85)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.roundRect(px - 24, py - 24, 48, 48, 6); ctx.fill(); ctx.stroke();
        }
      }
      if (phase === 'druecken') balken(ctx, fx - 100, f.y + 16, 200, 12, druck, '#5ac85a');
      const anteil = phase === 'tupfen' ? 0.05 : phase === 'druecken' ? 0.33 + druck * 0.33 : 0.66 + lagen / LAGEN * 0.34;
      balken(ctx, f.x, f.y + f.h + 26, f.b, 12, api.istFertig ? 1 : anteil, '#ffc81e');
      ctx.lineJoin = 'round'; ctx.miterLimit = 2;
      const kopf = api.istFertig ? (locker ? 'Verbunden. Sitzt ein bisschen locker.' : 'Sauber verbunden!')
        : phase === 'tupfen' ? `Blut abtupfen: Maus gedrückt drüberwischen (${blut.length} Flecken)` : phase === 'druecken' ? 'Auf die Wunde drücken und halten' : `Verband wickeln: im Kreis ziehen (${Math.floor(lagen)} von ${LAGEN} Lagen)`;
      textMitte(ctx, kopf, m.b / 2, f.y - 18, 18, '#ffe9a8');
      if (meldungZeit > 0) textMitte(ctx, meldung, m.b / 2, f.y + f.h - 20, 20, '#ffb0a0');
    },
  });
  return versprechen;
}

// E2b Pritsche bergen (mit dem Weidemann): Blick von vorn auf den umgekippten T5. Drei Schritte:
// 1. Anheben: W (oder Maus gedrückt) hebt die Gabel unter der Dachkante, S senkt. Zu schnell = es knirscht (Spiegel, Kühler).
// 2. Kippen: über dem Kipppunkt fällt der Wagen von selbst auf die Räder. S (oder rechte Maustaste) = mit der Gabel gegenhalten.
//    Kommt er zu hart auf, reißt die Ölwanne oder es knackt an der Achse.
// 3. Schlupf anbringen: die Schlaufe mit der Maus auf die Abschleppöse ziehen. Stoßstange, Spurstange oder Grill = kaputt.
// Ergebnis: { schaeden: ['Spiegel', …], abgebrochen }
export function pritscheSpiel() {
  let f;
  let phase = 'heben', winkel = 90, w = 0, gabel = 0, gabelV = 0, knirsch = 0, zeit = 0, meldung = '', meldungBis = 0;
  let maus = null, mausLinks = false, mausRechts = false, zieht = false, schlaufe = null;
  const tasten = new Set(), schaeden = [];
  const KIPP = 38; // Grad: darunter fällt er von selbst
  const sagen = (t, s = 2.2) => { meldung = t; meldungBis = zeit + s; };
  const schaden = (was, text) => { if (!schaeden.includes(was)) { schaeden.push(was); blip(140, 0.25, 0.2); sagen(text, 2.8); } };
  const ZIELE = [
    { id: 'oese', name: 'Abschleppöse', u: 0.8, v: 0.235, gut: true },
    { id: 'stossstange', name: 'Stoßstange', u: 0.42, v: 0.29 },
    { id: 'spurstange', name: 'Spurstange', u: 0.5, v: 0.1 },
    { id: 'grill', name: 'Kühlergrill', u: 0.5, v: 0.52 },
  ];
  document.body.dataset.vollbild = '1'; // deckt alles: 3D-Welt pausiert (main.js)
  const { api, versprechen } = spielRahmen('Pritsche bergen', 'Gabel vorsichtig anheben (W oder Maus gedrückt halten, S senkt), beim Kippen gegenhalten (S oder rechte Maustaste), dann den Schlupf auf die Abschleppöse ziehen. Grob = es geht noch mehr kaputt.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      keydown(e) { const k = e.key.toLowerCase(); if (['w', 's', 'arrowup', 'arrowdown'].includes(k)) { tasten.add(k); e.preventDefault(); } },
      keyup(e) { tasten.delete(e.key.toLowerCase()); },
      contextmenu(e) { e.preventDefault(); },
      pointerdown(e) {
        maus = zeigerPos(api.canvas, e);
        if (e.button === 2) mausRechts = true; else mausLinks = true;
        if (phase === 'schlupf' && schlaufe && Math.hypot(maus.x - schlaufe.x, maus.y - schlaufe.y) < 40) zieht = true;
      },
      pointermove(e) { maus = zeigerPos(api.canvas, e); if (zieht && schlaufe) { schlaufe.x = maus.x; schlaufe.y = maus.y; } },
      pointerup(e) {
        if (e.button === 2) mausRechts = false; else mausLinks = false;
        if (phase === 'schlupf' && zieht) {
          zieht = false;
          const t = ZIELE.map((z) => ({ z, d: Math.hypot(schlaufe.x - zx(z), schlaufe.y - zy(z)) })).sort((a, b) => a.d - b.d)[0];
          if (t.d < 34) {
            if (t.z.gut) { phase = 'fertig'; blip(880, 0.15); sagen('Schlupf sitzt an der Öse.', 3); api.fertig({ schaeden: [...schaeden] }); }
            else {
              if (t.z.id === 'stossstange') schaden('Stoßstange', 'Nicht an die Stoßstange! Die reißt doch ab. Ab an die Öse.');
              else if (t.z.id === 'spurstange') schaden('Spurstange', 'Die Spurstange! Jetzt ist die Lenkung krumm. An die Öse!');
              else schaden('Kühlergrill', 'Am Grill? Der bricht raus! An die Öse damit.');
              schlaufeZurueck();
            }
          } else schlaufeZurueck();
        }
      },
    },
    schritt(dt) {
      zeit += dt;
      if (api.istFertig) return;
      const hoch = tasten.has('w') || tasten.has('arrowup') || mausLinks;
      const runter = tasten.has('s') || tasten.has('arrowdown') || mausRechts;
      if (phase === 'heben') {
        // Gabel beschleunigt weich; Tempo zählt
        const soll = hoch ? 1 : runter ? -0.6 : 0;
        gabelV += (soll - gabelV) * Math.min(1, dt * 1.6);
        gabel = Math.max(0, gabel + gabelV * dt * 0.32);
        winkel = 90 - gabel * 60;
        if (gabelV > 0.72) { knirsch += dt; if (knirsch > 0.35) { knirsch = 0; schaden(schaeden.includes('Spiegel') ? 'Kühler' : 'Spiegel', schaeden.includes('Spiegel') ? 'Krrk! Der Kühler hat was abgekriegt. Langsamer!' : 'Knack! Der Spiegel ist ab. Langsamer heben!'); gabelV = 0.3; } }
        else knirsch = Math.max(0, knirsch - dt);
        if (winkel <= KIPP) { phase = 'kippen'; w = -gabelV * 22; sagen('Er kippt! Gegenhalten (S)!', 2); }
      } else if (phase === 'kippen') {
        // Schwerkraft zieht ihn auf die Räder (schneller, je weiter er ist), Gegenhalten bremst
        const zug = 26 + (KIPP - winkel) * 2.2;
        w -= zug * dt;
        if (runter) w = Math.min(w + 70 * dt, -9); // bremst, hält ihn aber nicht fest: er kippt immer weiter
        winkel += w * dt;
        if (winkel <= 0) {
          winkel = 0;
          const v = -w;
          if (v > 58) { schaden('Ölwanne', 'Rumms! Viel zu hart aufgesetzt, die Ölwanne ist gerissen.'); if (v > 85) schaden('Achse', 'Und die Achse hat auch was abgekriegt.'); }
          else if (v > 40) sagen('Etwas hart, aber hält.');
          else sagen('Sauber aufgesetzt!');
          klonk(Math.min(1, v / 80));
          phase = 'schlupf';
          schlaufeZurueck();
        }
      }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#bcd6e4'; ctx.fillRect(0, 0, m.b, m.h);
      const boden = f.y + f.h * 0.88;
      ctx.fillStyle = '#7fa04f'; ctx.fillRect(0, boden, m.b, m.h - boden);
      const s = f.h / 360;
      const W = 190 * s, H = 200 * s; // Wagen von vorn: Breite, Höhe (T5: ca. 1,9 m breit, knapp 2 m hoch)
      const px = f.x + f.b * 0.66, py = boden; // Drehpunkt: untere linke Kante (Räder Fahrerseite)
      if (phase !== 'schlupf' && phase !== 'fertig') {
        // Wagen von vorn: Drehpunkt = untere linke Kante (Räder Fahrerseite). Aufrecht: x 0…W, y -H…0. Liegt (a = 90°) nach links.
        const a = (winkel * Math.PI) / 180;
        const welt = (lx, ly) => ({ x: px + lx * Math.cos(a) + ly * Math.sin(a), y: py - lx * Math.sin(a) + ly * Math.cos(a) });
        const ecke = welt(W, -H * 0.96); // Dachkante Beifahrerseite: da drückt die Gabel
        // Weidemann von der Seite (wie im Spiel: Kabine auf dem Hinterwagen, Hubarm vom Turm vor der Kabine, Palettengabel).
        // Der Arm hat feste Länge: der Lader rollt beim Heben mit nach vorn.
        const LA = 185 * s, PIV = { x: 212, y: 168 }; // Arm-Drehpunkt in Lader-Einheiten (s)
        const gabelSpitze = { x: ecke.x - 3 * s, y: ecke.y + 5 * s };
        const traeger = { x: gabelSpitze.x - 80 * s, y: gabelSpitze.y - 12 * s };
        const dy = Math.min(LA * 0.97, Math.abs(boden - PIV.y * s - traeger.y));
        // nicht unter die Pritsche fahren: Vorderkante des Laders bleibt links von der Fahrerseite (bis 1 m Höhe)
        const linksUnten = px - Math.min(H, (100 * s) / Math.max(0.2, Math.cos(a))) * Math.sin(a) - 8 * s;
        const lx = Math.min(traeger.x - Math.sqrt(LA * LA - dy * dy) - PIV.x * s, linksUnten - 312 * s);
        zeichneLader(ctx, lx, boden, s, { x: traeger.x, y: traeger.y }, gabelSpitze, PIV);
        // Wagen
        ctx.save(); ctx.translate(px, py); ctx.rotate(-a);
        zeichneT5Front(ctx, W, H, schaeden);
        ctx.restore();
        // Joel steht rechts daneben und guckt (Cap, Bart, orange Weste)
        const jx = f.x + f.b * 0.92, jy = boden;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.fillStyle = '#1f2024'; ctx.fillRect(jx - 14 * s, jy - 60 * s, 28 * s, 60 * s); ctx.strokeRect(jx - 14 * s, jy - 60 * s, 28 * s, 60 * s);
        ctx.fillStyle = '#8a9aa8'; ctx.beginPath(); ctx.roundRect(jx - 20 * s, jy - 125 * s, 40 * s, 68 * s, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b0702a'; ctx.fillRect(jx - 20 * s, jy - 122 * s, 12 * s, 62 * s); ctx.fillRect(jx + 8 * s, jy - 122 * s, 12 * s, 62 * s);
        ctx.fillStyle = '#eebda0'; ctx.beginPath(); ctx.arc(jx, jy - 142 * s, 16 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#5a3a22'; ctx.beginPath(); ctx.arc(jx, jy - 136 * s, 13 * s, 0.1 * Math.PI, 0.9 * Math.PI); ctx.fill();
        ctx.fillStyle = '#2a2a2e'; ctx.beginPath(); ctx.arc(jx, jy - 148 * s, 16 * s, Math.PI, 0); ctx.fill(); ctx.fillRect(jx - 20 * s, jy - 150 * s, 22 * s, 5 * s);
        // Anzeigen: Hebetempo und Neigung
        const bx = f.x + f.b * 0.15, bb = f.b * 0.5, by = boden + 20;
        if (phase === 'heben') {
          ctx.fillStyle = '#5b5b5b'; ctx.fillRect(bx, by, bb, 14);
          ctx.fillStyle = '#4caf50'; ctx.fillRect(bx, by, bb * 0.72, 14);
          ctx.fillStyle = '#d0453a'; ctx.fillRect(bx + bb * 0.72, by, bb * 0.28, 14);
          ctx.fillStyle = '#ffc81e'; ctx.fillRect(bx + Math.max(0, Math.min(1, gabelV)) * bb - 4, by - 6, 8, 26);
          textMitte(ctx, 'Hebetempo', bx + bb / 2, by + 40, 16, '#fff');
        } else {
          ctx.fillStyle = '#5b5b5b'; ctx.fillRect(bx, by, bb, 14);
          ctx.fillStyle = '#4caf50'; ctx.fillRect(bx, by, bb * (40 / 100), 14);
          ctx.fillStyle = '#d0453a'; ctx.fillRect(bx + bb * (58 / 100), by, bb * (42 / 100), 14);
          ctx.fillStyle = '#ffc81e'; ctx.fillRect(bx + Math.min(1, -w / 100) * bb - 4, by - 6, 8, 26);
          textMitte(ctx, 'Fallgeschwindigkeit (S = gegenhalten)', bx + bb / 2, by + 40, 16, '#fff');
        }
      } else {
        // Schlupf anbringen: Front des T5 groß, Ziele, Schlaufe zum Ziehen
        const g = gross();
        ctx.save(); ctx.translate(g.x0, g.y0); zeichneT5Front(ctx, g.W, g.H, schaeden, true); ctx.restore();
        ctx.strokeStyle = '#b8bcc0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(zx(ZIELE[0]), zy(ZIELE[0]), 11, 0, Math.PI * 2); ctx.stroke(); // Öse
        ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(zx(ZIELE[0]), zy(ZIELE[0]), 14, 0, Math.PI * 2); ctx.stroke();
        for (const z of ZIELE) {
          const nah = schlaufe && Math.hypot(schlaufe.x - zx(z), schlaufe.y - zy(z)) < 34;
          ctx.strokeStyle = nah ? '#ffc81e' : 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]);
          ctx.beginPath(); ctx.arc(zx(z), zy(z), 26, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          textMitte(ctx, z.name, zx(z), zy(z) - 32, 14, '#fff');
        }
        // Schlupf: Gurt von unten links zur Schlaufe
        if (schlaufe) {
          ctx.strokeStyle = '#b8742e'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(f.x, f.y + f.h); ctx.quadraticCurveTo(f.x + 60, schlaufe.y + 80, schlaufe.x, schlaufe.y); ctx.stroke();
          ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(schlaufe.x, schlaufe.y, 16, 0, Math.PI * 2); ctx.stroke();
        }
        if (phase === 'schlupf') textMitte(ctx, 'Schlaufe mit der Maus auf die Abschleppöse ziehen', f.x + f.b / 2, f.y + f.h + 26, 18, '#fff');
      }
      if (schaeden.length) textMitte(ctx, `Schäden: ${schaeden.join(', ')}`, f.x + f.b / 2, f.y - 30, 18, '#ffb0a0');
      if (zeit < meldungBis) textMitte(ctx, meldung, f.x + f.b / 2, f.y - 4, 22, '#fff');
    },
  });
  // große Frontansicht (Schlupf-Phase): steht auf dem Boden, mittig
  function gross() { const H = f.h * 0.8, W = H * 0.95; return { W, H, x0: f.x + f.b / 2 - W / 2, y0: f.y + f.h * 0.88 }; }
  function zx(z) { const g = gross(); return g.x0 + z.u * g.W; }
  function zy(z) { const g = gross(); return g.y0 - z.v * g.H; }
  function schlaufeZurueck() { schlaufe = { x: f.x + f.b * 0.12, y: f.y + f.h * 0.8 }; }
  return versprechen.then((e) => { delete document.body.dataset.vollbild; return e; });
}

// VW T5 von vorn (Minispiel Pritsche): Ursprung unten links am Boden, x 0…W nach rechts, y 0…-H nach oben.
// Reifen mit Profil in dunklen Radhäusern, Stoßstange, Scheinwerfer, Grill mit Logo, schmalere Kabine mit Frontscheibe.
function zeichneT5Front(ctx, W, H, schaeden = [], gross = false) {
  const X = (u) => u * W, Y = (v) => -v * H, lw = gross ? 4 : 2.5;
  const poly = (pts, fill) => { ctx.beginPath(); pts.forEach(([u, v], i) => (i ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
  const rr = (u0, v0, u1, v1, r, fill, stroke = true) => { ctx.beginPath(); ctx.roundRect(X(u0), Y(v1), X(u1) - X(u0), Y(v0) - Y(v1), r * W); ctx.fillStyle = fill; ctx.fill(); if (stroke) ctx.stroke(); };
  ctx.strokeStyle = '#111'; ctx.lineWidth = lw; ctx.lineJoin = 'round';
  // Schatten unterm Wagen (nur wenn er steht), Unterboden
  if (gross) { ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(X(0.5), 0, W * 0.55, H * 0.03, 0, 0, Math.PI * 2); ctx.fill(); }
  // Reifen (vorn sieht man die Lauffläche): hoch, rund, mit Profilrillen
  for (const [u0, u1] of [[0.05, 0.21], [0.79, 0.95]]) {
    rr(u0, 0, u1, 0.32, 0.05, '#1d1d1f');
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = gross ? 3 : 1.5;
    for (let k = 1; k < 7; k++) { const v = k * 0.042; ctx.beginPath(); ctx.moveTo(X(u0 + 0.025), Y(v)); ctx.lineTo(X((u0 + u1) / 2), Y(v + 0.015)); ctx.lineTo(X(u1 - 0.025), Y(v)); ctx.stroke(); }
    ctx.strokeStyle = '#4a4a52'; ctx.beginPath(); ctx.moveTo(X((u0 + u1) / 2), Y(0.02)); ctx.lineTo(X((u0 + u1) / 2), Y(0.3)); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = lw;
  }
  // Karosserie unten bis zur (höheren) Haubenkante, darüber die schmalere Kabine mit kleinerer Frontscheibe
  poly([[0.0, 0.3], [1.0, 0.3], [1.0, 0.62], [0.97, 0.665], [0.03, 0.665], [0.0, 0.62]], '#c6cacd');
  for (const u0 of [0.03, 0.77]) { ctx.fillStyle = '#26282c'; ctx.beginPath(); ctx.roundRect(X(u0), Y(0.38), W * 0.2, H * 0.07, [W * 0.05, W * 0.05, 0, 0]); ctx.fill(); }
  poly([[0.05, 0.665], [0.95, 0.665], [0.9, 0.95], [0.84, 0.995], [0.16, 0.995], [0.1, 0.95]], '#c6cacd');
  poly([[0.11, 0.695], [0.89, 0.695], [0.855, 0.925], [0.145, 0.925]], '#9cc7e6');
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = gross ? 10 : 5; ctx.beginPath(); ctx.moveTo(X(0.22), Y(0.72)); ctx.lineTo(X(0.32), Y(0.9)); ctx.stroke();
  ctx.lineWidth = gross ? 5 : 2.5; ctx.beginPath(); ctx.moveTo(X(0.42), Y(0.72)); ctx.lineTo(X(0.47), Y(0.83)); ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = gross ? 3 : 1.5;
  for (const u of [0.3, 0.62]) { ctx.beginPath(); ctx.moveTo(X(u), Y(0.705)); ctx.lineTo(X(u + 0.17), Y(0.745)); ctx.stroke(); }
  ctx.lineWidth = lw;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = gross ? 2 : 1;
  for (let k = 0; k < 7; k++) { const w = k * 0.9; ctx.beginPath(); ctx.moveTo(X(0.78), Y(0.86)); ctx.lineTo(X(0.78 + Math.cos(w) * 0.08), Y(0.86 + Math.sin(w) * 0.05)); ctx.stroke(); }
  ctx.strokeStyle = '#111'; ctx.lineWidth = lw;
  rr(-0.07, 0.7, 0.01, 0.8, 0.02, '#1d1d1f');
  if (!schaeden.includes('Spiegel')) rr(0.99, 0.7, 1.07, 0.8, 0.02, '#1d1d1f');
  ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = gross ? 3 : 1.5; ctx.beginPath(); ctx.moveTo(X(0.04), Y(0.64)); ctx.lineTo(X(0.96), Y(0.64)); ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = lw;
  // Scheinwerfer rechteckig (höher), Blinker außen, Grill mit Chromleisten und VW-Logo
  rr(0.04, 0.48, 0.28, 0.575, 0.015, '#e8eef2');
  rr(0.72, 0.48, 0.96, 0.575, 0.015, '#e8eef2');
  for (const [u0, u1] of [[0.05, 0.1], [0.9, 0.95]]) rr(u0, 0.49, u1, 0.565, 0.01, '#f2a21c', false);
  rr(0.31, 0.46, 0.69, 0.58, 0.015, schaeden.includes('Kühlergrill') ? '#55575c' : '#1d1d1f');
  ctx.strokeStyle = '#b8bcc0'; ctx.lineWidth = gross ? 4 : 2;
  for (const v of [0.485, 0.52, 0.555]) { ctx.beginPath(); ctx.moveTo(X(0.34), Y(v)); ctx.lineTo(X(0.66), Y(v)); ctx.stroke(); }
  vwLogo(ctx, X(0.5), Y(0.52), W * 0.05, gross);
  if (schaeden.includes('Kühler')) { ctx.strokeStyle = '#7a7a7a'; ctx.lineWidth = gross ? 3 : 1.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X(0.36 + k * 0.08), Y(0.57)); ctx.lineTo(X(0.39 + k * 0.08), Y(0.47)); ctx.stroke(); } }
  ctx.strokeStyle = '#111'; ctx.lineWidth = lw;
  // Stoßstange (etwas tiefer: weniger Bodenfreiheit), Nebelscheinwerfer, Kennzeichen
  rr(-0.015, 0.2, 1.015, 0.33, 0.04, schaeden.includes('Stoßstange') ? '#6a6c70' : '#3a3c40');
  rr(0.32, 0.21, 0.68, 0.245, 0.01, '#1d1d1f', false);
  for (const u of [0.1, 0.9]) { ctx.fillStyle = '#d8dde0'; ctx.beginPath(); ctx.arc(X(u), Y(0.235), W * 0.022, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  rr(0.37, 0.265, 0.63, 0.315, 0.005, '#f4f4f0');
  ctx.fillStyle = '#2f5fa8'; ctx.fillRect(X(0.37), Y(0.315), W * 0.025, H * 0.05);
  // Beule am Kotflügel links (vom Umkippen)
  ctx.strokeStyle = '#8f959a'; ctx.lineWidth = gross ? 3 : 1.5; ctx.beginPath(); ctx.arc(X(0.12), Y(0.4), W * 0.05, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
}

// Weidemann-Hoflader von der Seite (Minispiel Pritsche), Blick nach rechts. lx = hinteres Ende, boden = Bodenlinie,
// traeger = Gabelträger (Ende des Hubarms), spitze = Gabelspitze, piv = Arm-Drehpunkt (relativ zu lx/boden).
function zeichneLader(ctx, lx, boden, s, traeger, spitze, piv) {
  const X = (x) => lx + x * s, Y = (y) => boden - y * s;
  const rr = (x0, y0, x1, y1, r, fill) => { ctx.beginPath(); ctx.roundRect(X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s, r * s); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(X(160), boden, 170 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
  // Hinterwagen: Motorhaube hinten (rund), Kabine drauf
  rr(0, 48, 150, 112, 16, '#d0261c');
  ctx.strokeStyle = '#7a1510'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(X(14 + k * 9), Y(62)); ctx.lineTo(X(14 + k * 9), Y(98)); ctx.stroke(); }
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  // Kabine: schwarzer Rahmen, große Scheiben, Dach, Rundumleuchte
  rr(44, 108, 142, 232, 6, '#1d1d1f');
  ctx.fillStyle = '#9fc3d8'; ctx.fillRect(X(52), Y(226), 38 * s, 108 * s); ctx.fillRect(X(96), Y(226), 40 * s, 108 * s);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(100), Y(140)); ctx.lineTo(X(122), Y(210)); ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  rr(38, 230, 148, 242, 4, '#2a2c30');
  ctx.fillStyle = '#f29a1c'; ctx.beginPath(); ctx.roundRect(X(60), Y(256), 14 * s, 14 * s, 3 * s); ctx.fill(); ctx.stroke();
  // Sitz und Lenkrad durch die Scheibe
  ctx.fillStyle = '#3a3c40'; ctx.fillRect(X(60), Y(175), 18 * s, 50 * s);
  ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(112), Y(150)); ctx.lineTo(X(126), Y(168)); ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  // Knickgelenk und Vorderwagen (niedrig), Turm für den Hubarm
  rr(148, 52, 176, 92, 4, '#45484d');
  rr(172, 50, 310, 98, 10, '#d0261c');
  ctx.beginPath(); ctx.moveTo(X(186), Y(96)); ctx.lineTo(X(piv.x - 14), Y(piv.y - 4)); ctx.lineTo(X(piv.x + 14), Y(piv.y - 4)); ctx.lineTo(X(240), Y(96)); ctx.closePath(); ctx.fillStyle = '#d0261c'; ctx.fill(); ctx.stroke();
  // Räder: Stollenreifen, graue Felge, Kotflügel
  for (const cx of [72, 252]) {
    ctx.fillStyle = '#1b1b1d'; ctx.beginPath(); ctx.arc(X(cx), Y(42), 42 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#34343a'; for (let k = 0; k < 12; k++) { const w = k / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(X(cx) + Math.cos(w) * 36 * s, Y(42) + Math.sin(w) * 36 * s, 5 * s, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8c8f94'; ctx.beginPath(); ctx.arc(X(cx), Y(42), 20 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a5e62'; ctx.beginPath(); ctx.arc(X(cx), Y(42), 7 * s, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 7 * s; ctx.strokeStyle = '#1d1d1f'; ctx.beginPath(); ctx.arc(X(cx), Y(42), 50 * s, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  }
  // Hubarm: geknickter roter Kastenarm vom Turm zum Gabelträger, grauer Hubzylinder darunter
  const P = { x: X(piv.x), y: Y(piv.y) };
  const dx = traeger.x - P.x, dy = traeger.y - P.y, L = Math.hypot(dx, dy);
  let nx = -dy / L, ny = dx / L; if (ny > 0) { nx = -nx; ny = -ny; } // Knick nach oben
  const knie = { x: P.x + dx * 0.55 + nx * 14 * s, y: P.y + dy * 0.55 + ny * 14 * s };
  const zyl0 = { x: X(282), y: Y(70) }, zyl1 = { x: P.x + dx * 0.45, y: P.y + dy * 0.45 };
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#111'; ctx.lineWidth = 11 * s; ctx.beginPath(); ctx.moveTo(zyl0.x, zyl0.y); ctx.lineTo(zyl1.x, zyl1.y); ctx.stroke();
  ctx.strokeStyle = '#8c8f94'; ctx.lineWidth = 7 * s; ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 20 * s; ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(knie.x, knie.y); ctx.lineTo(traeger.x, traeger.y); ctx.stroke();
  ctx.strokeStyle = '#d0261c'; ctx.lineWidth = 14 * s; ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.fillStyle = '#45484d'; ctx.beginPath(); ctx.arc(P.x, P.y, 7 * s, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
  // Gabelträger (Schnellwechsler) senkrecht, zwei Zinken waagerecht bis zur Spitze
  ctx.fillStyle = '#45484d'; ctx.fillRect(traeger.x - 5 * s, traeger.y - 40 * s, 10 * s, 62 * s); ctx.strokeRect(traeger.x - 5 * s, traeger.y - 40 * s, 10 * s, 62 * s);
  ctx.fillStyle = '#5a5e62'; ctx.beginPath(); ctx.moveTo(traeger.x, spitze.y - 2 * s); ctx.lineTo(spitze.x, spitze.y - 1 * s); ctx.lineTo(spitze.x, spitze.y + 3 * s); ctx.lineTo(traeger.x, spitze.y + 6 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillRect(traeger.x - 2 * s, spitze.y - 2 * s, 8 * s, 30 * s);
}

// VW-Logo (Kreis, V über W) für die Minispiel-Zeichnung
function vwLogo(ctx, x, y, r, gross) {
  ctx.save();
  ctx.fillStyle = '#e8eaec'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1f3c78'; ctx.beginPath(); ctx.arc(x, y, r * 0.84, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8eaec'; ctx.lineWidth = Math.max(1.2, r * 0.14); ctx.lineJoin = 'round';
  const P = (u, v) => [x + u * r, y + v * r];
  ctx.beginPath(); ctx.moveTo(...P(-0.47, -0.56)); ctx.lineTo(...P(-0.16, 0.2)); ctx.lineTo(...P(0, -0.16)); ctx.lineTo(...P(0.16, 0.2)); ctx.lineTo(...P(0.47, -0.56)); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(...P(-0.66, -0.2)); ctx.lineTo(...P(-0.32, 0.62)); ctx.lineTo(...P(0, 0.12)); ctx.lineTo(...P(0.32, 0.62)); ctx.lineTo(...P(0.66, -0.2)); ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// E3 Metall-Lieferung: Stangen ankoppeln (Mitte treffen) und im Container einsortieren
// ---------------------------------------------------------------------------
// Querschnitt eines Profils (Blick längs auf die Stange): traeger (Doppel-T), vierkant, rund, flach, winkel
function zeichneProfil(ctx, typ, x, y, g, farbe = '#7c7670') {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = farbe; ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(1.5, g * 0.07); ctx.lineJoin = 'round';
  const pfad = (pts) => { ctx.beginPath(); pts.forEach(([a, b], i) => (i ? ctx.lineTo(a * g, b * g) : ctx.moveTo(a * g, b * g))); ctx.closePath(); ctx.fill(); ctx.stroke(); };
  if (typ === 'traeger') pfad([[-0.5, -0.6], [0.5, -0.6], [0.5, -0.42], [0.09, -0.42], [0.09, 0.42], [0.5, 0.42], [0.5, 0.6], [-0.5, 0.6], [-0.5, 0.42], [-0.09, 0.42], [-0.09, -0.42], [-0.5, -0.42]]);
  else if (typ === 'vierkant') { pfad([[-0.42, -0.42], [0.42, -0.42], [0.42, 0.42], [-0.42, 0.42]]); ctx.fillStyle = '#2a2c30'; ctx.fillRect(-0.27 * g, -0.27 * g, 0.54 * g, 0.54 * g); ctx.strokeRect(-0.27 * g, -0.27 * g, 0.54 * g, 0.54 * g); }
  else if (typ === 'rund') { ctx.beginPath(); ctx.arc(0, 0, 0.44 * g, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.arc(0, 0, 0.29 * g, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
  else if (typ === 'flach') pfad([[-0.62, -0.1], [0.62, -0.1], [0.62, 0.1], [-0.62, 0.1]]);
  else pfad([[-0.5, -0.5], [-0.34, -0.5], [-0.34, 0.34], [0.5, 0.34], [0.5, 0.5], [-0.5, 0.5]]); // winkel
  ctx.restore();
}
const PROFIL_NAME = { traeger: 'Doppel-T-Träger', vierkant: 'Vierkantrohr', rund: 'Rundrohr', flach: 'Flachstahl', winkel: 'Winkelstahl' };
const PROFIL_FARBE = { traeger: '#6e6a64', vierkant: '#7c7670', rund: '#8a8680', flach: '#5e5a56', winkel: '#8a5a3a' };

// Weidemann von vorn (Minispiel Ankoppeln): cx = Mitte, hub 0…1 = Gabelträger-Höhe (ty = Höhe der Zinken in Pixeln über dem Boden)
function zeichneLaderVorn(ctx, cx, boden, s, ty) {
  const X = (x) => cx + x * s, Y = (y) => boden - y * s;
  const rr = (x0, y0, x1, y1, r, fill) => { ctx.beginPath(); ctx.roundRect(X(x0), Y(y1), (x1 - x0) * s, (y1 - y0) * s, r * s); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); };
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx, boden, 95 * s, 7 * s, 0, 0, Math.PI * 2); ctx.fill();
  // Kabine hinten (Rahmen, Scheibe, Dach, Rundumleuchte)
  rr(-52, 108, 52, 232, 6, '#1d1d1f');
  ctx.fillStyle = '#9fc3d8'; ctx.fillRect(X(-45), Y(226), 90 * s, 108 * s);
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(-30), Y(140)); ctx.lineTo(X(-12), Y(210)); ctx.stroke();
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  rr(-58, 230, 58, 242, 4, '#2a2c30');
  // Räder (Stollen von vorn), Vorderwagen, Hubturm
  for (const sx of [-1, 1]) {
    rr(sx * 62 - 16, 0, sx * 62 + 16, 84, 8, '#1b1b1d');
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 2;
    for (let k = 1; k < 8; k++) { ctx.beginPath(); ctx.moveTo(X(sx * 62 - 12), Y(k * 10)); ctx.lineTo(X(sx * 62), Y(k * 10 + 4)); ctx.lineTo(X(sx * 62 + 12), Y(k * 10)); ctx.stroke(); }
    ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
  }
  rr(-46, 40, 46, 98, 8, '#d0261c');
  rr(-22, 60, 6, 150, 4, '#d0261c');
  // Hubarm zum Gabelträger (verkürzt von vorn), Gabelträger mit zwei Zinken (Spitzen von vorn)
  const tY = boden - ty;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 20 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X(-8), Y(140)); ctx.lineTo(X(-8), tY - 6 * s); ctx.stroke();
  ctx.strokeStyle = '#d0261c'; ctx.lineWidth = 14 * s; ctx.stroke(); ctx.lineCap = 'butt';
  // Gabelträger (Rahmen mit Querstreben, Schnellwechsler-Platte in der Mitte) und zwei Zinken: senkrechter Schaft am Träger,
  // die Zinke selbst zeigt zum Betrachter (man sieht ihre Stirnseite, leicht angeschrägt)
  ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
  const R = (x0, y0, w, h, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(cx + x0 * s, tY - y0 * s, w * s, h * s, 1.5 * s); ctx.fill(); ctx.stroke(); };
  R(-45, 64, 90, 7, '#6c7075');                   // oberer Querträger
  R(-45, 20, 90, 7, '#6c7075');                   // unterer Querträger
  for (const sx of [-1, 1]) R(sx * 42 - 3.5, 66, 7, 50, '#6c7075'); // Seitenwangen
  R(-9, 60, 18, 40, '#45484d');                   // Schnellwechsler-Platte
  ctx.fillStyle = '#8a8d92'; ctx.beginPath(); ctx.arc(cx, tY - 52 * s, 3.2 * s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  for (const sx of [-1, 1]) {
    const zx = sx * 22;
    R(zx - 4, 62, 8, 60, '#5e6267');               // Zinkenschaft
    // Zinkenspitze von vorn: flaches Rechteck mit Fase, etwas heller
    ctx.fillStyle = '#7c8086'; ctx.beginPath();
    ctx.moveTo(cx + (zx - 5) * s, tY - 1 * s); ctx.lineTo(cx + (zx + 5) * s, tY - 1 * s); ctx.lineTo(cx + (zx + 5.5) * s, tY + 4 * s); ctx.lineTo(cx + (zx - 5.5) * s, tY + 4 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#9aa0a6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + (zx - 3.5) * s, tY + 0.5 * s); ctx.lineTo(cx + (zx + 3.5) * s, tY + 0.5 * s); ctx.stroke();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
  }
}

// 1) Ankoppeln: Die Stangen liegen quer vor dem Weidemann. Schlupf mittig ansetzen (Schwerpunkt!), anheben. Hängt das Bündel
// schief, absetzen und neu ansetzen. Ergebnis: { versatz (m), schief, versuche }.
export function ankoppelSpiel({ alt = false } = {}) {
  let f;
  // Stangen: Länge, Versatz der Mitte (m), Profil. Der Schwerpunkt liegt nie genau in der Mitte der längsten Stange.
  const zr = Math.random;
  const seite = zr() < 0.5 ? -1 : 1;
  const stangen = [
    { l: 6.0, o: 0, p: 'traeger', m: 3 }, { l: 6.0, o: 0.05 * seite, p: 'traeger', m: 3 },
    { l: 5.2, o: (0.35 + zr() * 0.1) * seite, p: 'vierkant', m: 1.6 }, { l: 6.0, o: 0, p: 'vierkant', m: 1.8 }, { l: 4.4, o: (0.75 + zr() * 0.1) * seite, p: 'rund', m: 1.2 },
    { l: 5.6, o: (0.15 + zr() * 0.1) * seite, p: 'flach', m: 0.8 }, { l: 4.8, o: (0.55 + zr() * 0.1) * seite, p: 'winkel', m: 0.9 }, { l: 6.0, o: 0, p: 'flach', m: 0.9 },
  ];
  const masse = stangen.reduce((a, q) => a + q.m * q.l, 0);
  const schwer = stangen.reduce((a, q) => a + q.m * q.l * q.o, 0) / masse; // Schwerpunkt (m von der Mitte)
  const GUT = 0.12, SCHLEIFT = 0.3, SEIL = 0.8, RUHE = 0.26; // m
  let sx = (zr() < 0.5 ? -1 : 1) * 1.6, ziel = sx; // Schlupf-Position (m von der Mitte)
  let hub = 0, wink = 0, winkV = 0, zeit = 0, versuche = 0, warHoch = false, meldung = '', meldungBis = 0, fertigSeit = 0;
  let maus = null, mausUnten = false;
  const tasten = new Set();
  const sagen = (t, sek = 2.4) => { meldung = t; meldungBis = zeit + sek; };
  document.body.dataset.vollbild = '1';
  const { api, versprechen } = spielRahmen('Stangen ankoppeln', 'Den Schlupf in die Mitte unter das Bündel schieben (Maus oder A/D), dann anheben (W oder Maus gedrückt halten). Hängt es schief: absetzen (S) und neu ansetzen. Die Stangen sind verschieden lang, der Schwerpunkt liegt nicht da, wo man denkt.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      keydown(e) {
        const k = e.key.toLowerCase();
        if (['w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) { tasten.add(k); e.preventDefault(); }
        if (k === ' ' && zustand() === 'schief' && hub > 0.97 && !api.istFertig) abschluss(true);
      },
      keyup(e) { tasten.delete(e.key.toLowerCase()); },
      pointerdown(e) { maus = zeigerPos(api.canvas, e); mausUnten = true; },
      pointermove(e) { maus = zeigerPos(api.canvas, e); },
      pointerup() { mausUnten = false; },
    },
    schritt(dt) {
      zeit += dt;
      if (api.istFertig) return;
      const M = f.b * 0.8 / 6.6;
      const amBoden = hub < 0.04;
      // Schlupf verschieben geht nur, solange das Bündel am Boden liegt
      if (amBoden) {
        if (maus && !mausUnten) ziel = THREE_clamp((maus.x - (f.x + f.b / 2)) / M, -2.6, 2.6);
        const lr = (tasten.has('d') || tasten.has('arrowright') ? 1 : 0) - (tasten.has('a') || tasten.has('arrowleft') ? 1 : 0);
        if (lr) ziel = THREE_clamp(ziel + lr * 1.1 * dt, -2.6, 2.6);
        sx += (ziel - sx) * Math.min(1, dt * 6);
      }
      const hoch = tasten.has('w') || tasten.has('arrowup') || mausUnten, runter = tasten.has('s') || tasten.has('arrowdown');
      const z = zustand();
      // schleift ein Ende, geht es nicht höher als halb
      const hubMax = z === 'schleift' ? 0.55 : 1;
      if (hoch) hub = Math.min(hubMax, hub + dt * 0.42);
      else if (runter) hub = Math.max(0, hub - dt * 0.6);
      if (hoch && z === 'schleift' && hub >= hubMax - 0.01 && zeit > meldungBis) { sagen('Ein Ende schleift am Boden. Absetzen (S) und weiter zur schweren Seite!'); blip(160, 0.2, 0.15); }
      if (hub > 0.35) warHoch = true;
      if (amBoden && warHoch) { warHoch = false; versuche++; }
      // Neigung: frei hängend d·0,9 rad, aber das tiefe Ende kann nicht unter den Boden
      const e = Math.max(0, 0.5 + hub * 1.0 - SEIL - RUHE);
      const d = schwer - sx;
      const frei = d * 0.9, grenze = Math.asin(Math.min(1, (e + 0.1) / 3));
      const soll = e <= 0 ? 0 : Math.sign(frei) * Math.min(Math.abs(frei), grenze);
      winkV += ((soll - wink) * 30 - winkV * 3.2) * dt;
      wink += winkV * dt;
      if (hub >= 0.985 && z !== 'schleift') {
        fertigSeit += dt;
        if (z === 'gut' && fertigSeit > 0.9) abschluss(false);
        else if (z === 'schief' && zeit > meldungBis) sagen('Hängt schief. Absetzen (S) und neu ansetzen, oder so lassen (Leertaste).', 1.2);
      } else fertigSeit = 0;
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#bcd6e4'; ctx.fillRect(0, 0, m.b, m.h);
      const boden = f.y + f.h * 0.9;
      // Hauptstraße hinten, Wiese, Feldweg vorn
      ctx.fillStyle = '#8fb565'; ctx.fillRect(0, boden - f.h * 0.34, m.b, f.h * 0.34);
      ctx.fillStyle = '#5a5d62'; ctx.fillRect(0, boden - f.h * 0.3, m.b, f.h * 0.06);
      ctx.strokeStyle = '#e8e8e0'; ctx.lineWidth = 2; ctx.setLineDash([22, 18]); ctx.beginPath(); ctx.moveTo(0, boden - f.h * 0.27); ctx.lineTo(m.b, boden - f.h * 0.27); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#7fa04f'; ctx.fillRect(0, boden, m.b, m.h - boden);
      ctx.fillStyle = '#a89468'; ctx.fillRect(0, boden, m.b, f.h * 0.05);
      const M = f.b * 0.8 / 6.6, cx = f.x + f.b / 2, s = M / 100; // 1 m = 100 Lader-Einheiten
      const X = (xm) => cx + xm * M;
      const trav = 0.5 + hub * 1.0; // Höhe der Zinken (m)
      // Weidemann hinter dem Bündel, fährt mit dem Schlupf mit
      zeichneLaderVorn(ctx, X(sx) + 0.22 * M, boden, s, trav * M);
      // Kanthölzer
      ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.fillStyle = '#b08a52';
      for (const kx of [-2.2, 0, 2.2]) { ctx.fillRect(X(kx) - 0.07 * M, boden - 0.12 * M, 0.14 * M, 0.12 * M); ctx.strokeRect(X(kx) - 0.07 * M, boden - 0.12 * M, 0.14 * M, 0.12 * M); }
      // hinterer Strang des Schlupfs (hinter den Stangen)
      zeichneSchlupfAnkoppeln(ctx, { X, M, sx, oben: boden - trav * M, by: boden - (RUHE + Math.max(0, trav - SEIL - RUHE)) * M, wink, alt, vorn: false });
      // Bündel: dreht sich um den Schlupf-Punkt
      const e = Math.max(0, trav - SEIL - RUHE);
      const by = boden - (RUHE + e) * M;
      ctx.save(); ctx.translate(X(sx), by); ctx.rotate(wink); ctx.translate(-X(sx), -by);
      stangen.forEach((q, i) => {
        const lage = i < 5 ? 0 : 1, k = i < 5 ? i : i - 5;
        const y = boden - (0.14 + lage * 0.15 + (k % 2) * 0.012) * M - e * M, dicke = (lage ? 0.09 : 0.14) * M;
        ctx.fillStyle = PROFIL_FARBE[q.p]; ctx.strokeStyle = '#111'; ctx.lineWidth = 2;
        const yy = y - dicke - (lage ? 0 : k * 0.004 * M) - (i % 3) * 0.03 * M * (lage ? 0 : 1);
        ctx.fillRect(X(q.o - q.l / 2), yy, q.l * M, dicke); ctx.strokeRect(X(q.o - q.l / 2), yy, q.l * M, dicke);
      });
      // Lieferschein-Anhänger
      ctx.fillStyle = '#f4f0e0'; ctx.fillRect(X(-2.6), boden - (0.2 + e) * M - 0.16 * M, 0.5 * M, 0.16 * M); ctx.strokeRect(X(-2.6), boden - (0.2 + e) * M - 0.16 * M, 0.5 * M, 0.16 * M);
      ctx.fillStyle = '#1d1d1f'; ctx.font = `bold ${Math.max(8, 0.075 * M)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillText('EISEN MEYER', X(-2.35), boden - (0.2 + e) * M - 0.055 * M);
      ctx.restore();
      // Schlupf: hängt über der linken Zinke, zwei ungleiche Stränge (einer verdreht) laufen vorn und hinten am Bündel runter,
      // unten liegt der Gurt flach und straff unter dem Bündel (keine Luft)
      zeichneSchlupfAnkoppeln(ctx, { X, M, sx, oben: boden - trav * M, by, wink, alt, vorn: true });
      // Wasserwaage
      const z = zustand(), grad = Math.round((wink * 180) / Math.PI * 10) / 10;
      const wx = f.x + f.b / 2, wy = f.y + 8;
      ctx.fillStyle = '#e8b820'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(wx - 110, wy, 220, 30, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d8f0c0'; ctx.beginPath(); ctx.roundRect(wx - 40, wy + 6, 80, 18, 9); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx - 9, wy + 6); ctx.lineTo(wx - 9, wy + 24); ctx.moveTo(wx + 9, wy + 6); ctx.lineTo(wx + 9, wy + 24); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(wx + THREE_clamp(-wink * 110, -30, 30), wy + 15, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      textMitte(ctx, hub < 0.3 ? 'liegt noch' : `${Math.abs(grad).toFixed(1)}° schief`, wx, wy + 52, 15, hub < 0.3 ? '#fff' : z === 'gut' ? '#b8f0a0' : '#ffb0a0');
      if (versuche) textMitte(ctx, `Versuche: ${versuche + 1}`, f.x + f.b - 60, f.y + 20, 14, '#fff');
      if (zeit < meldungBis) textMitte(ctx, meldung, f.x + f.b / 2, f.y - 6, 20, '#fff');
    },
  });
  function zustand() { const d = Math.abs(schwer - sx); return d < GUT ? 'gut' : d < SCHLEIFT ? 'schief' : 'schleift'; }
  function abschluss(schief) {
    blip(schief ? 440 : 880, 0.15);
    sagen(schief ? 'Na gut. Hängt schief, also schön langsam fahren.' : 'Sitzt in der Mitte und hängt gerade.', 4);
    api.fertig({ versatz: schwer - sx, schief, versuche: versuche + 1 });
  }
  return versprechen.then((e) => { delete document.body.dataset.vollbild; return e; });
}
const THREE_clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Schlupf im Minispiel Ankoppeln (Blick von vorn, Stangen liegen quer): oben über der Zinke, zwei Stränge nach unten.
// vorn: vorderer Strang über den Stangen bis zur Unterkante, unten flach drunter; sonst der hintere Strang (dunkler, kürzer).
function zeichneSchlupfAnkoppeln(ctx, { X, M, sx, oben, by, wink, alt, vorn }) {
  const hell = alt ? '#b8742e' : '#f2c21c', dunkel = alt ? '#7e4f20' : '#c89a10';
  const OBEN_B = 0.15 * M, UNTEN_B = 0.12 * M; // Bündel: Oberkante über, Unterkante unter dem Drehpunkt
  const x0 = X(sx);
  // Punkt am Bündel (gedreht um x0/by)
  const rot = (dx, dy) => ({ x: x0 + dx * Math.cos(wink) - dy * Math.sin(wink), y: by + dx * Math.sin(wink) + dy * Math.cos(wink) });
  const band = (pts, breiten, farbe) => {
    // Gurt als Fläche: Mittellinie pts, Breite je Punkt (Verdrehung = schmal)
    const l = [], r = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, n = Math.hypot(dx, dy) || 1, w = breiten[i] / 2;
      l.push({ x: pts[i].x - (dy / n) * w, y: pts[i].y + (dx / n) * w }); r.push({ x: pts[i].x + (dy / n) * w, y: pts[i].y - (dx / n) * w });
    }
    ctx.beginPath(); ctx.moveTo(l[0].x, l[0].y); for (const q of l.slice(1)) ctx.lineTo(q.x, q.y); for (const q of r.reverse()) ctx.lineTo(q.x, q.y); ctx.closePath();
    ctx.fillStyle = farbe; ctx.fill(); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.stroke();
  };
  const W = 0.09 * M;
  if (!vorn) {
    // hinterer Strang: von der Zinke etwas rechts versetzt runter bis hinter die Oberkante
    const t = rot(0.03 * M, -OBEN_B);
    band([{ x: x0 + 0.02 * M, y: oben + 0.01 * M }, { x: (x0 + t.x) / 2 + 0.035 * M, y: (oben + t.y) / 2 }, t], [W * 0.9, W * 0.85, W * 0.9], dunkel);
    // Gurt oben über der Zinke (Bogen)
    ctx.beginPath(); ctx.ellipse(x0, oben, 0.05 * M, 0.03 * M, 0, Math.PI, 0); ctx.lineWidth = 0.045 * M; ctx.strokeStyle = '#111'; ctx.stroke(); ctx.lineWidth = 0.03 * M; ctx.strokeStyle = dunkel; ctx.stroke();
    return;
  }
  // vorderer Strang: einmal verdreht (schmal), dann flach über die Stangen bis unten, unten flach drunter
  const t = rot(-0.025 * M, -OBEN_B - 0.01 * M), u = rot(-0.025 * M, UNTEN_B + 0.012 * M);
  const mitte = { x: (x0 - 0.02 * M + t.x) / 2 - 0.01 * M, y: (oben + t.y) / 2 };
  band([{ x: x0 - 0.02 * M, y: oben + 0.012 * M }, mitte, t, u], [W, W * 0.6, W, W], hell);
  // unten: flach unter dem Bündel (nur die Kante sichtbar)
  const a = rot(-0.07 * M, UNTEN_B + 0.012 * M), b = rot(0.06 * M, UNTEN_B + 0.012 * M);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 0.03 * M; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  ctx.strokeStyle = hell; ctx.lineWidth = 0.016 * M; ctx.stroke(); ctx.lineCap = 'butt';
}

// Schlupf im Minispiel Einsortieren: liegt eng um das Profil (Querschnitt), unten ohne Luft, zwei ungleiche Stränge zur Zinke
const PROFIL_UMRISS = { traeger: [0.5, 0.6], vierkant: [0.42, 0.42], rund: [0.44, 0.44], flach: [0.62, 0.1], winkel: [0.5, 0.5] };
function zeichneSchlupfEinsortieren(ctx, typ, px, py, gy, g, alt) {
  const hell = alt ? '#b8742e' : '#f2c21c';
  const [hw, hh] = PROFIL_UMRISS[typ], d = 0.05; // halbe Gurtstärke: liegt außen am Profil an
  ctx.beginPath();
  ctx.moveTo(px - 0.06 * g, gy);
  if (typ === 'rund') {
    const r = (hw + d) * g;
    ctx.lineTo(px - r, py - 0.05 * g);
    ctx.arc(px, py, r, Math.PI, 0, true);
  } else {
    const k = 0.07 * g; // kleine Ecke am Profil
    ctx.lineTo(px - (hw + d) * g, py - hh * 0.3 * g);
    ctx.lineTo(px - (hw + d) * g, py + (hh + d) * g - k);
    ctx.quadraticCurveTo(px - (hw + d) * g, py + (hh + d) * g, px - (hw + d) * g + k, py + (hh + d) * g);
    ctx.lineTo(px + (hw + d) * g - k, py + (hh + d) * g);
    ctx.quadraticCurveTo(px + (hw + d) * g, py + (hh + d) * g, px + (hw + d) * g, py + (hh + d) * g - k);
    ctx.lineTo(px + (hw + d) * g, py - hh * 0.4 * g);
  }
  ctx.lineTo(px + 0.2 * g, gy); // zweiter Strang etwas versetzt (nicht symmetrisch)
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = '#111'; ctx.lineWidth = g * 0.16; ctx.stroke();
  ctx.strokeStyle = hell; ctx.lineWidth = g * 0.1; ctx.stroke();
  // Verdrehung im linken Strang
  const vy = (gy + py - hh * 0.3 * g) / 2, vx = px - 0.06 * g + ((px - (hw + d) * g) - (px - 0.06 * g)) * ((vy - gy) / (py - hh * 0.3 * g - gy));
  ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(vx, vy, g * 0.035, g * 0.07, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.lineCap = 'butt';
}

// 2) Einsortieren: Blick von der Stirnseite in den Container. Jede Stange hängt am Schlupf unter der Gabel und pendelt.
// Höhe mit der Maus oder W/S einstellen, im richtigen Moment einschieben (Klick oder Leertaste). Unten Träger, Mitte Rohre,
// oben Flach- und Winkelstahl. Ergebnis: { falsch, klong }.
export function einsortierSpiel({ alt = false } = {}) {
  let f;
  const EBENE = { traeger: 0, vierkant: 1, rund: 1, flach: 2, winkel: 2 };
  const liste = ['traeger', 'vierkant', 'flach', 'traeger', 'rund', 'winkel', 'vierkant', 'flach'];
  const lager = [[], [], []]; // je Ebene: einsortierte Profile
  let nr = 0, hoehe = 0.5, soll = 0.5, zeit = 0, falsch = 0, klong = 0, meldung = '', meldungBis = 0;
  let schub = 0, schubZiel = null, zurueck = false, wackel = 0;
  let maus = null;
  const tasten = new Set();
  const sagen = (t, sek = 2.2) => { meldung = t; meldungBis = zeit + sek; };
  document.body.dataset.vollbild = '1';
  // Geometrie in Einheiten der Fläche (0…1 von unten nach oben)
  const ARM = [0.2, 0.47, 0.74], LUFT = 0.2, DICK = 0.03; // Oberkante der Arme, freie Höhe darüber, Armdicke
  const pendel = () => Math.sin(zeit * 2.3) * 0.045 + Math.sin(zeit * 3.7 + 1) * 0.012;
  const { api, versprechen } = spielRahmen('Stahl einsortieren', 'Jede Stange ins richtige Fach vom Kragarmregal: unten Träger, Mitte Rohre, oben Flach- und Winkelstahl. Höhe mit der Maus oder W/S, einschieben mit Klick oder Leertaste. Die Stange pendelt: nicht gegen die Arme stoßen.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      keydown(e) { const k = e.key.toLowerCase(); if (['w', 's', 'arrowup', 'arrowdown', ' '].includes(k)) { tasten.add(k); e.preventDefault(); } if (k === ' ') schieben(); },
      keyup(e) { tasten.delete(e.key.toLowerCase()); },
      pointermove(e) { maus = zeigerPos(api.canvas, e); soll = THREE_clamp((f.y + f.h - maus.y) / f.h, 0.12, 0.98); },
      pointerdown(e) { maus = zeigerPos(api.canvas, e); schieben(); },
    },
    schritt(dt) {
      zeit += dt; wackel = Math.max(0, wackel - dt);
      if (api.istFertig) { schub = Math.max(0, schub - dt * 3.2); if (schub <= 0) schubZiel = null; return; }
      const ws = (tasten.has('w') || tasten.has('arrowup') ? 1 : 0) - (tasten.has('s') || tasten.has('arrowdown') ? 1 : 0);
      if (ws) soll = THREE_clamp(soll + ws * 0.45 * dt, 0.12, 0.98);
      if (schubZiel === null) hoehe += (soll - hoehe) * Math.min(1, dt * 5);
      else if (!zurueck) {
        schub = Math.min(1, schub + dt * 2.6);
        if (schub >= 1) {
          if (schubZiel.ebene < 0) { zurueck = true; klong++; wackel = 0.5; klonk(0.6); sagen('Klong! Gegen den Arm gestoßen. Nochmal.'); }
          else {
            const typ = liste[nr], richtig = EBENE[typ] === schubZiel.ebene;
            lager[schubZiel.ebene].push(typ);
            klonk(0.25);
            if (!richtig) { falsch++; blip(160, 0.2, 0.15); sagen(`${PROFIL_NAME[typ]} gehört ${['nach unten', 'in die Mitte', 'nach oben'][EBENE[typ]]}. Liegt jetzt falsch.`, 2.6); }
            else blip(700, 0.06);
            nr++; zurueck = true;
            if (nr >= liste.length) { sagen(falsch || klong ? 'Alles drin. Na ja.' : 'Alles sauber einsortiert!', 4); api.fertig({ falsch, klong }); }
          }
        }
      } else { schub = Math.max(0, schub - dt * 3.2); if (schub <= 0) { schubZiel = null; zurueck = false; } }
    },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#bcd6e4'; ctx.fillRect(0, 0, m.b, m.h);
      const boden = f.y + f.h;
      ctx.fillStyle = '#b8ab8c'; ctx.fillRect(0, boden, m.b, m.h - boden);
      const Y = (v) => boden - v * f.h, cL = f.x + f.b * 0.42, cR = f.x + f.b * 0.99;
      // Container (Schnitt): Rückwand rechts = Werkstattseite, Dach, Boden; links offen
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.fillStyle = '#244a78'; ctx.fillRect(cL, Y(1.03), cR - cL, f.h * 0.04); ctx.strokeRect(cL, Y(1.03), cR - cL, f.h * 0.04);
      ctx.fillStyle = '#2f5f9a'; ctx.fillRect(cR - f.b * 0.02, Y(1.0), f.b * 0.02, f.h); ctx.strokeRect(cR - f.b * 0.02, Y(1.0), f.b * 0.02, f.h);
      ctx.fillStyle = '#1c2b3c'; ctx.fillRect(cL, Y(0.99), cR - cL - f.b * 0.02, f.h * 0.93);
      ctx.fillStyle = '#7a5a3a'; ctx.fillRect(cL, Y(0.06), cR - cL, f.h * 0.06); ctx.strokeRect(cL, Y(0.06), cR - cL, f.h * 0.06);
      // gelbes Fachbodenregal hinten (mit Kisten)
      const rX = cR - f.b * 0.02 - f.b * 0.11;
      ctx.fillStyle = '#e8b820';
      for (const x of [rX, rX + f.b * 0.1]) { ctx.fillRect(x, Y(0.9), f.b * 0.01, f.h * 0.84); ctx.strokeRect(x, Y(0.9), f.b * 0.01, f.h * 0.84); }
      for (const v of [0.12, 0.38, 0.64, 0.9]) { ctx.fillStyle = '#e8b820'; ctx.fillRect(rX, Y(v), f.b * 0.11, f.h * 0.02); ctx.strokeRect(rX, Y(v), f.b * 0.11, f.h * 0.02); }
      [['#b08a52', 0.14, 0.14], ['#8c8f94', 0.4, 0.1], ['#c8352a', 0.66, 0.12]].forEach(([c, v, h]) => { ctx.fillStyle = c; ctx.fillRect(rX + f.b * 0.02, Y(v + h), f.b * 0.07, f.h * h); ctx.strokeRect(rX + f.b * 0.02, Y(v + h), f.b * 0.07, f.h * h); });
      // Kragarmregal: Säule, Fuß, drei Arme nach links mit hochgebogener Spitze, Schilder
      const sX = rX - f.b * 0.05, armL = f.b * 0.26, g = f.h * 0.085;
      ctx.fillStyle = '#3a4a5a';
      ctx.fillRect(sX, Y(0.93), f.b * 0.022, f.h * 0.87); ctx.strokeRect(sX, Y(0.93), f.b * 0.022, f.h * 0.87);
      ctx.fillRect(sX - armL, Y(0.09), armL, f.h * 0.03); ctx.strokeRect(sX - armL, Y(0.09), armL, f.h * 0.03);
      const SCHILD = [['traeger'], ['vierkant', 'rund'], ['flach', 'winkel']], TEXT = ['Träger', 'Rohre', 'Flach, Winkel'];
      ARM.forEach((v, i) => {
        ctx.fillStyle = '#3a4a5a';
        ctx.fillRect(sX - armL, Y(v), armL, f.h * DICK); ctx.strokeRect(sX - armL, Y(v), armL, f.h * DICK);
        ctx.fillRect(sX - armL, Y(v + 0.035), f.b * 0.012, f.h * 0.035); ctx.strokeRect(sX - armL, Y(v + 0.035), f.b * 0.012, f.h * 0.035);
        // Schild an der Säule
        ctx.fillStyle = '#f4f0e0'; ctx.fillRect(sX + f.b * 0.026, Y(v + 0.14), f.b * 0.098, f.h * 0.11); ctx.strokeRect(sX + f.b * 0.026, Y(v + 0.14), f.b * 0.098, f.h * 0.11);
        SCHILD[i].forEach((t, k) => zeichneProfil(ctx, t, sX + f.b * (0.052 + k * 0.045), Y(v + 0.1), g * 0.36, PROFIL_FARBE[t]));
        ctx.fillStyle = '#1d1d1f'; ctx.font = `bold ${Math.max(9, f.h * 0.026)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.fillText(TEXT[i], sX + f.b * 0.075, Y(v + 0.045));
        // alter Bestand hinten an der Säule (blasser), davor die neu einsortierten Profile
        ctx.globalAlpha = 0.55; SCHILD[i].forEach((t, k) => zeichneProfil(ctx, t, sX - f.b * 0.018 - k * g * 0.2, Y(v) - (t === 'flach' ? 0.1 : t === 'traeger' ? 0.6 : 0.46) * g - (k ? g * 0.0 : 0), g, '#4a4640')); ctx.globalAlpha = 1;
        lager[i].forEach((t, k) => zeichneProfil(ctx, t, sX - f.b * 0.075 - k * g * 1.25, Y(v) - (t === 'flach' ? 0.1 : t === 'traeger' ? 0.6 : 0.46) * g, g, PROFIL_FARBE[t]));
      });
      // Gabel von links (Seitenansicht) mit Schlupf und der Stange im Querschnitt
      if (nr < liste.length || schubZiel) {
        const typ = liste[Math.min(nr, liste.length - 1)];
        const ruheX = f.x + f.b * 0.27, zielX = schubZiel && schubZiel.ebene >= 0 ? sX - f.b * 0.075 - lager[schubZiel.ebene].length * g * 1.25 : sX - armL - g * 0.75;
        const px = ruheX + (zielX - ruheX) * schub + (wackel ? Math.sin(zeit * 50) * 4 : 0);
        const hy = schubZiel ? schubZiel.h : hoehe + pendel();
        const py = Y(hy), gy = py - g * 1.9;
        // Weidemann von der Seite (wie im Minispiel Pritsche): Gabelträger kurz vor der Stange, Zinken bis unter den Schlupf
        const ls = f.h / 400, spitze = { x: px + g * 0.55, y: gy - 3 * ls };
        zeichneLader(ctx, f.x + f.b * 0.13 - 312 * ls + (px - ruheX) * 0.75, boden, ls, { x: px - g * 1.5, y: gy - 12 * ls }, spitze, { x: 212, y: 168 });
        // Schlupf eng um die Stange (unten keine Luft)
        if (!(schubZiel && zurueck && schubZiel.ebene >= 0)) zeichneSchlupfEinsortieren(ctx, typ, px, py, gy, g, alt);
        else { ctx.strokeStyle = '#111'; ctx.lineWidth = g * 0.16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px - 0.06 * g, gy); ctx.lineTo(px - 0.1 * g, gy + g * 0.9); ctx.lineTo(px + 0.2 * g, gy); ctx.stroke(); ctx.strokeStyle = alt ? '#b8742e' : '#f2c21c'; ctx.lineWidth = g * 0.1; ctx.stroke(); ctx.lineCap = 'butt'; }
        if (!(schubZiel && zurueck && schubZiel.ebene >= 0)) zeichneProfil(ctx, typ, px, py, g, PROFIL_FARBE[typ]);
        // Anzeige: was hängt gerade dran, wie viele noch
        if (nr < liste.length) {
          textMitte(ctx, `${PROFIL_NAME[liste[nr]]} (${nr + 1} von ${liste.length})`, f.x + f.b * 0.2, f.y - 8, 18, '#fff');
        }
      }
      if (falsch || klong) textMitte(ctx, `Falsch: ${falsch} · Angestoßen: ${klong}`, f.x + f.b * 0.2, f.y + 18, 14, '#ffb0a0');
      if (zeit < meldungBis) textMitte(ctx, meldung, f.x + f.b / 2, f.y - 34, 20, '#fff');
    },
  });
  // in welchem Fach ist die Stange gerade? (Unterkante über dem Arm, Oberkante unter dem nächsten Arm)
  function schieben() {
    if (api.istFertig || schubZiel !== null || nr >= liste.length) return;
    const h = hoehe + pendel(), halb = 0.05;
    let ebene = -1;
    ARM.forEach((v, i) => { if (h - halb > v + 0.005 && h + halb < v + LUFT + 0.03) ebene = i; });
    schubZiel = { ebene, h: ebene >= 0 ? h : h };
    schub = 0; zurueck = false;
  }
  return versprechen.then((e) => { delete document.body.dataset.vollbild; return e; });
}

// ---------------------------------------------------------------------------
// E4 Mettenden grillen: Feuerschale von oben. 1) Anzünden (Feuerzeug an die Anzünder halten, dann pusten bis die Glut passt),
// 2) Rost grob säubern (alte schwarze Wurst mit Schwung runterkicken, ohne die Mettenden mitzureißen), 3) Grillen (wenden,
// verschieben: Mitte heiß, Rand mild). Ergebnis: { wuerste: [{ zustand: roh|gut|verkohlt|asche, oben, unten }], fehler: [], glut }
// ---------------------------------------------------------------------------
export function grillSpiel({ anzahl = 3 } = {}) {
  let f, phase = 'anzuenden', zeit = 0, meldung = '', meldungBis = 0;
  let maus = null, mausUnten = false, zieht = null;
  const tasten = new Set(), fehler = [];
  const sagen = (t, s = 2.4) => { meldung = t; meldungBis = zeit + s; };
  const fehlerDazu = (was, t) => { if (!fehler.includes(was)) fehler.push(was); blip(150, 0.2, 0.15); sagen(t, 2.8); };
  // alles in Metern um die Mitte des Rosts (Radius 0,34)
  const ROST = 0.34;
  const anzuender = [{ x: -0.1, y: 0.06, an: 0 }, { x: 0.09, y: -0.08, an: 0 }, { x: 0.05, y: 0.12, an: 0 }];
  let glut = 0, gutSeit = 0, ueberpustet = false, flamme = 0;
  // Mettenden am Rand (beim Werfen hingefallen), die alte Wurst irgendwo in der Mitte
  const wuerste = Array.from({ length: Math.min(6, anzahl) }, (_, i) => {
    // nebeneinander am oberen Rand (Abstand ca. 25 cm, damit sie sich nicht überlappen)
    const w = -Math.PI / 2 + (i - (Math.min(6, anzahl) - 1) / 2) * 0.95;
    return { x: Math.cos(w) * 0.25, y: Math.sin(w) * 0.25, rot: w + Math.PI / 2, oben: 0, unten: 0, vx: 0, vy: 0, weg: false, dreh: 0 };
  });
  const alt = { x: 0.05, y: 0.04, rot: 0.3, vx: 0, vy: 0, weg: false, fallen: 0 };
  document.body.dataset.vollbild = '1';
  const { api, versprechen } = spielRahmen('Mettenden grillen', 'Erst anzünden: Feuerzeug (Maus) an die weißen Anzünder halten, dann pusten (Leertaste oder Maus halten), bis die Glut im grünen Bereich ist. Dann die alte Wurst mit Schwung vom Rost kicken. Dann grillen: Klick = wenden, ziehen = verschieben. Mitte heiß, Rand mild.', {
    beiGroesse(m) { f = flaeche(m); },
    events: {
      keydown(e) { const k = e.key.toLowerCase(); if ([' ', 'enter'].includes(k)) { tasten.add(k); e.preventDefault(); } if (k === 'enter' && phase === 'grillen') fertig(); },
      keyup(e) { tasten.delete(e.key.toLowerCase()); },
      pointerdown(e) {
        maus = zeigerPos(api.canvas, e); mausUnten = true;
        const p = welt(maus);
        if (phase === 'saeubern' && !alt.weg && Math.hypot(p.x - alt.x, p.y - alt.y) < 0.09) zieht = { ding: alt, dx: alt.x - p.x, dy: alt.y - p.y, spur: [{ x: p.x, y: p.y, t: zeit }], weit: 0 };
        if (phase === 'grillen') {
          const w = wuerste.filter((q) => !q.weg).map((q) => ({ q, d: Math.hypot(p.x - q.x, p.y - q.y) })).sort((a, b) => a.d - b.d)[0];
          if (w && w.d < 0.07) zieht = { ding: w.q, dx: w.q.x - p.x, dy: w.q.y - p.y, spur: [{ x: p.x, y: p.y, t: zeit }], weit: 0 };
        }
      },
      pointermove(e) {
        maus = zeigerPos(api.canvas, e);
        if (!zieht) return;
        const p = welt(maus), d = zieht.ding;
        const nx = p.x + zieht.dx, ny = p.y + zieht.dy;
        zieht.weit += Math.hypot(nx - d.x, ny - d.y);
        d.x = nx; d.y = ny;
        zieht.spur.push({ x: p.x, y: p.y, t: zeit }); if (zieht.spur.length > 6) zieht.spur.shift();
        if (phase === 'grillen') { const r = Math.hypot(d.x, d.y); if (r > ROST - 0.05) { d.x *= (ROST - 0.05) / r; d.y *= (ROST - 0.05) / r; } }
        if (phase === 'saeubern') schubsen(d);
      },
      pointerup() {
        mausUnten = false;
        if (!zieht) return;
        const z = zieht; zieht = null;
        if (phase === 'saeubern') {
          // Schwung aus den letzten Mausbewegungen
          const a = z.spur[0], b = z.spur[z.spur.length - 1], dt = Math.max(0.03, b.t - a.t);
          alt.vx = (b.x - a.x) / dt; alt.vy = (b.y - a.y) / dt;
          const v = Math.hypot(alt.vx, alt.vy);
          if (v > 3) { alt.vx *= 3 / v; alt.vy *= 3 / v; }
          if (v < 0.5 && Math.hypot(alt.x, alt.y) < ROST) sagen('Mehr Schwung! Richtig wegkicken.', 1.6);
        } else if (phase === 'grillen' && z.weit < 0.02) {
          // Klick ohne Ziehen: wenden
          const q = z.ding; [q.oben, q.unten] = [q.unten, q.oben]; q.dreh = 0.35; klonk(0.08);
        }
      },
    },
    schritt(dt) {
      zeit += dt;
      if (api.istFertig) return;
      flamme = Math.max(0, flamme - dt);
      if (phase === 'anzuenden') {
        const p = maus ? welt(maus) : null;
        for (const a of anzuender) if (a.an < 1 && p && Math.hypot(p.x - a.x, p.y - a.y) < 0.045) { a.an = Math.min(1, a.an + dt / 1.1); if (a.an >= 1) { klonk(0.15); sagen('Brennt!', 1); } }
        const brennen = anzuender.filter((a) => a.an >= 1).length;
        if (brennen >= 2) {
          const pusten = tasten.has(' ') || (mausUnten && brennen === 3);
          glut += (pusten ? 0.32 : -0.035) * dt * (brennen / 3 + 0.4);
          if (pusten) flamme = 0.2;
          if (glut > 1.0 && !ueberpustet) { ueberpustet = true; fehlerDazu('Asche aufgewirbelt', 'Zu doll gepustet! Die Asche fliegt überall hin.'); glut = 0.88; }
          glut = Math.max(0, Math.min(1.02, glut));
          const gruen = glut > 0.6 && glut < 0.86;
          gutSeit = gruen && !pusten ? gutSeit + dt : gruen ? gutSeit : 0;
          if (gutSeit > 1.2) { phase = 'saeubern'; sagen('Glut passt. Jetzt die alte Wurst runterkicken!', 3); blip(700, 0.08); }
        }
      } else if (phase === 'saeubern') {
        // alte Wurst rutscht mit Schwung weiter (Rost bremst), fällt über den Rand
        if (!zieht && !alt.weg) {
          alt.x += alt.vx * dt; alt.y += alt.vy * dt;
          alt.vx *= Math.pow(0.08, dt); alt.vy *= Math.pow(0.08, dt);
          schubsen(alt);
          if (Math.hypot(alt.x, alt.y) > ROST + 0.02) { alt.weg = true; alt.fallen = 0.01; klonk(0.3); sagen('Weg damit! Rost ist (grob) sauber.', 2.6); }
        }
        if (alt.fallen) alt.fallen += dt;
        for (const q of wuerste) if (!q.weg && (q.vx || q.vy)) {
          q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= Math.pow(0.05, dt); q.vy *= Math.pow(0.05, dt);
          if (Math.hypot(q.vx, q.vy) < 0.01) q.vx = q.vy = 0;
          if (Math.hypot(q.x, q.y) > ROST) { q.weg = true; fehlerDazu('Mettende in die Asche', 'Mist! Eine Mettende ist mit runtergefallen. Die liegt jetzt in der Asche.'); }
        }
        if (alt.weg && alt.fallen > 1.2) { phase = 'grillen'; sagen('Jetzt grillen. Klick = wenden, ziehen = verschieben.', 3.5); knopfFertig(); }
      } else if (phase === 'grillen') {
        const feuer = 0.6 + Math.min(1, glut) * 0.6;
        for (const q of wuerste) {
          if (q.weg) continue;
          q.dreh = Math.max(0, q.dreh - dt);
          const r = Math.hypot(q.x, q.y) / ROST;
          const hitze = (1.15 - r * 0.75) * feuer;
          q.unten += 0.075 * hitze * dt; q.oben += 0.01 * hitze * dt;
          if (q.unten > 1.2 && Math.random() < dt * 1.5) flamme = 0.25;
        }
        if (wuerste.every((q) => q.weg)) fertig();
      }
    },
    zeichnen() {
      const { ctx, m } = api;
      // Boden (Wiese), Feuerschale von oben, Asche/Glut, Rost
      ctx.fillStyle = '#6f9a48'; ctx.fillRect(0, 0, m.b, m.h);
      const cx = f.x + f.b / 2, cy = f.y + f.h / 2, S = f.h * 0.95 / (0.9); // px pro m
      const P = (x, y) => [cx + x * S, cy + y * S];
      ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
      ctx.fillStyle = '#2a2622'; ctx.beginPath(); ctx.arc(cx, cy, 0.45 * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Asche, Glut
      const g = phase === 'anzuenden' ? glut : Math.max(glut, 0.6);
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 0.38 * S);
      gr.addColorStop(0, g > 0.05 ? `rgba(${200 + 55 * g},${80 + 90 * g},40,1)` : '#77746f');
      gr.addColorStop(0.6, g > 0.05 ? `rgba(${120 + 80 * g},${50 + 30 * g},30,1)` : '#6a6763');
      gr.addColorStop(1, '#4a4743');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, 0.39 * S, 0, Math.PI * 2); ctx.fill();
      // Holzscheite
      for (const [x, y, w] of [[-0.12, -0.05, 0.4], [0.08, 0.1, -0.6], [0.02, -0.14, 1.3]]) {
        if (phase !== 'anzuenden') continue; // verbrannt, nur noch Glut
        ctx.save(); ctx.translate(...P(x, y)); ctx.rotate(w); ctx.fillStyle = g > 0.3 ? '#3a1d10' : '#1d1a18'; ctx.beginPath(); ctx.roundRect(-0.13 * S, -0.025 * S, 0.26 * S, 0.05 * S, 0.02 * S); ctx.fill(); ctx.stroke();
        if (g > 0.3) { ctx.strokeStyle = `rgba(255,${120 + 80 * g},40,0.9)`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-0.1 * S, 0); ctx.lineTo(0.08 * S, 0.01 * S); ctx.stroke(); ctx.strokeStyle = '#111'; ctx.lineWidth = 3; }
        ctx.restore();
      }
      // Anzünder (weiße Würfel), Flammen; nach dem Anzünden nur noch Glutstücke
      if (phase !== 'anzuenden') for (let i = 0; i < 16; i++) { const w = i * 2.39, rr = 0.05 + (i % 6) * 0.045; ctx.fillStyle = i % 3 ? '#ff6a1a' : '#ffb340'; ctx.beginPath(); ctx.arc(...P(Math.cos(w) * rr, Math.sin(w) * rr), (0.012 + (i % 4) * 0.004) * S, 0, Math.PI * 2); ctx.fill(); }
      if (phase === 'anzuenden') for (const a of anzuender) {
        const [x, y] = P(a.x, a.y);
        ctx.fillStyle = '#f4f4ee'; ctx.fillRect(x - 0.025 * S, y - 0.025 * S, 0.05 * S, 0.05 * S); ctx.strokeRect(x - 0.025 * S, y - 0.025 * S, 0.05 * S, 0.05 * S);
        if (a.an >= 1 || a.an > 0) flammeZeichnen(ctx, x, y, (a.an >= 1 ? 0.06 + g * 0.03 : a.an * 0.04) * S);
      }
      if (phase === 'anzuenden' && glut > 0.2) for (let i = 0; i < 6; i++) { const w = i / 6 * Math.PI * 2 + zeit; flammeZeichnen(ctx, ...P(Math.cos(w) * 0.16, Math.sin(w) * 0.16), (0.03 + glut * 0.05 + Math.sin(zeit * 9 + i) * 0.01) * S); }
      if (ueberpustet && phase === 'anzuenden') { ctx.fillStyle = 'rgba(160,155,150,0.5)'; for (let i = 0; i < 18; i++) { const w = i * 2.4 + zeit; ctx.beginPath(); ctx.arc(...P(Math.cos(w) * 0.3 * ((i % 5) / 5 + 0.3), Math.sin(w * 1.3) * 0.3 * ((i % 4) / 4 + 0.3)), 0.02 * S, 0, Math.PI * 2); ctx.fill(); } }
      // Rost (im Anzünden halb durchsichtig: hängt hoch an der Kette)
      ctx.globalAlpha = phase === 'anzuenden' ? 0.35 : 1;
      ctx.strokeStyle = '#2a2c30'; ctx.lineWidth = 0.012 * S;
      ctx.beginPath(); ctx.arc(cx, cy, ROST * S, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 0.007 * S;
      for (let i = -5; i <= 5; i++) { const x = i * 0.06, h = Math.sqrt(Math.max(0, ROST * ROST - x * x)); ctx.beginPath(); ctx.moveTo(...P(x, -h)); ctx.lineTo(...P(x, h)); ctx.stroke(); }
      // schwarze Krümel von alten Grillabenden
      ctx.fillStyle = '#1a1512'; for (let i = 0; i < 14; i++) { const w = i * 2.3, rr = 0.05 + (i % 5) * 0.05; ctx.beginPath(); ctx.arc(...P(Math.cos(w) * rr, Math.sin(w) * rr), 0.006 * S, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (flamme > 0 && phase === 'grillen') for (let i = 0; i < 4; i++) flammeZeichnen(ctx, ...P(Math.sin(zeit * 7 + i * 2) * 0.12, Math.cos(zeit * 5 + i) * 0.12), 0.05 * S);
      // alte Wurst
      if (phase !== 'anzuenden' || true) {
        if (!alt.weg || alt.fallen < 1.2) {
          const k = alt.weg ? Math.max(0.2, 1 - alt.fallen * 0.7) : 1;
          wurstZeichnen(ctx, ...P(alt.x, alt.y), alt.rot + alt.fallen * 3, S * k, { alt: true });
        }
      }
      // Mettenden
      // sichtbare Farbe: oben, aber eine stark angebrannte Unterseite sieht man am Rand mit (gemischt)
      for (const q of wuerste) if (!q.weg) wurstZeichnen(ctx, ...P(q.x, q.y), q.rot, S * (1 + q.dreh * 0.4), { gar: q.oben * 0.6 + q.unten * 0.4, unten: q.unten });
      // Garanzeige über jeder Wurst (oben/unten)
      if (phase === 'grillen') for (const q of wuerste) if (!q.weg) {
        const [x, y] = P(q.x, q.y);
        for (const [i, v] of [[0, q.oben], [1, q.unten]]) { ctx.fillStyle = garFarbe(v); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x - 7 + i * 14, y - 0.075 * S, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      }
      // Zeiger: Feuerzeug beim Anzünden
      if (phase === 'anzuenden' && maus) {
        ctx.fillStyle = '#c8352a'; ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(maus.x + 4, maus.y + 2, 16, 34, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8c8f94'; ctx.fillRect(maus.x + 4, maus.y - 4, 16, 7); ctx.strokeRect(maus.x + 4, maus.y - 4, 16, 7);
        flammeZeichnen(ctx, maus.x + 8, maus.y - 6, 14);
      }
      // Anzeigen
      const bx = f.x + f.b + 14 > m.b - 120 ? f.x - 70 : f.x + f.b + 14;
      if (phase === 'anzuenden') {
        const by = f.y + 10, bh = f.h - 20;
        ctx.fillStyle = '#5b5b5b'; ctx.fillRect(bx, by, 22, bh);
        ctx.fillStyle = '#4caf50'; ctx.fillRect(bx, by + bh * (1 - 0.86), 22, bh * 0.26);
        ctx.fillStyle = '#d0453a'; ctx.fillRect(bx, by, 22, bh * 0.08);
        ctx.fillStyle = '#ffc81e'; ctx.fillRect(bx - 4, by + bh * (1 - Math.min(1, glut)) - 3, 30, 6);
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, 22, bh);
        textMitte(ctx, 'Glut', bx + 11, by + bh + 22, 15, '#fff');
        const brennen = anzuender.filter((a) => a.an >= 1).length;
        textMitte(ctx, brennen < 2 ? `Anzünder: ${brennen} von 3 brennen` : 'Pusten: Leertaste (oder Maus halten)', f.x + f.b / 2, f.y + f.h + 26, 18, '#fff');
      } else if (phase === 'saeubern') textMitte(ctx, 'Alte Wurst greifen und mit Schwung vom Rost kicken', f.x + f.b / 2, f.y + f.h + 26, 18, '#fff');
      else if (phase === 'grillen') {
        textMitte(ctx, 'Klick = wenden · ziehen = verschieben · Enter = runternehmen', f.x + f.b / 2, f.y + f.h + 26, 18, '#fff');
        // Legende
        const lx = f.x + 10, ly = f.y + 14;
        [['roh', 0.2], ['gut', 1.05], ['verkohlt', 1.7]].forEach(([t, v], i) => { ctx.fillStyle = garFarbe(v); ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(lx, ly + i * 22, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.fillText(t, lx + 14, ly + i * 22 + 5); });
      }
      if (fehler.length) textMitte(ctx, `Pannen: ${fehler.join(', ')}`, f.x + f.b / 2, f.y - 30, 16, '#ffb0a0');
      if (zeit < meldungBis) textMitte(ctx, meldung, f.x + f.b / 2, f.y - 6, 20, '#fff');
    },
  });
  function welt(p) { const S = f.h * 0.95 / 0.9; return { x: (p.x - (f.x + f.b / 2)) / S, y: (p.y - (f.y + f.h / 2)) / S }; }
  // die alte Wurst schubst Mettenden an, die im Weg liegen
  function schubsen(d) {
    for (const q of wuerste) {
      if (q.weg) continue;
      const dx = q.x - d.x, dy = q.y - d.y, l = Math.hypot(dx, dy);
      if (l < 0.07 && l > 0) {
        const v = Math.max(0.6, Math.hypot(d.vx || 0, d.vy || 0));
        q.x = d.x + (dx / l) * 0.07; q.y = d.y + (dy / l) * 0.07;
        q.vx = (dx / l) * v * 0.8; q.vy = (dy / l) * v * 0.8;
        klonk(0.06);
      }
    }
  }
  let knopfDa = false;
  function knopfFertig() {
    if (knopfDa) return; knopfDa = true;
    api.unten.insertBefore(knopf('Runternehmen', '', fertig), api.unten.firstChild);
  }
  function zustandVon(q) {
    if (q.weg) return 'asche';
    const lo = Math.min(q.oben, q.unten), hi = Math.max(q.oben, q.unten);
    return hi > 1.45 ? 'verkohlt' : lo < 0.75 ? 'roh' : 'gut';
  }
  function fertig() {
    if (api.istFertig || phase !== 'grillen') return;
    const ergebnis = wuerste.map((q) => ({ zustand: zustandVon(q), oben: q.oben, unten: q.unten }));
    const n = (z) => ergebnis.filter((e) => e.zustand === z).length;
    sagen(`Gut: ${n('gut')} · roh: ${n('roh')} · verkohlt: ${n('verkohlt')}${n('asche') ? ` · in der Asche: ${n('asche')}` : ''}`, 6);
    api.fertig({ wuerste: ergebnis, fehler: [...fehler], glut });
  }
  return versprechen.then((e) => { delete document.body.dataset.vollbild; return e; });
}
// Garfarbe: roh rosa, gut braun, verkohlt schwarz
function garFarbe(v) {
  const stufen = [[0, [222, 130, 128]], [0.6, [196, 110, 80]], [1.0, [150, 82, 40]], [1.3, [92, 52, 28]], [1.7, [30, 22, 18]]];
  let a = stufen[0], b = stufen[stufen.length - 1];
  for (let i = 0; i < stufen.length - 1; i++) if (v >= stufen[i][0] && v <= stufen[i + 1][0]) { a = stufen[i]; b = stufen[i + 1]; break; }
  if (v > b[0]) a = b;
  const k = a === b ? 0 : (v - a[0]) / (b[0] - a[0]);
  return `rgb(${a[1].map((c, i) => Math.round(c + (b[1][i] - c) * k)).join(',')})`;
}
// Wurst von oben (gebogen, runde Enden): gar = Farbe der sichtbaren Seite, unten > 0,5 = Grillstreifen am Rand
function wurstZeichnen(ctx, x, y, rot, S, { alt = false, gar = 0, unten = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const L = 0.2 * S, D = 0.05 * S;
  ctx.lineCap = 'round';
  const bogen = () => { ctx.beginPath(); ctx.moveTo(-L / 2, D * 0.25); ctx.quadraticCurveTo(0, -D * 0.6, L / 2, D * 0.25); };
  ctx.strokeStyle = '#111'; ctx.lineWidth = D + 4; bogen(); ctx.stroke();
  ctx.strokeStyle = alt ? '#1f1611' : garFarbe(gar); ctx.lineWidth = D; bogen(); ctx.stroke();
  // Glanzlicht und Grillstreifen
  ctx.strokeStyle = alt ? 'rgba(120,80,50,0.5)' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = D * 0.18; ctx.beginPath(); ctx.moveTo(-L * 0.35, -D * 0.05); ctx.quadraticCurveTo(0, -D * 0.75, L * 0.35, -D * 0.05); ctx.stroke();
  if (!alt && unten > 0.5) { ctx.strokeStyle = `rgba(40,20,10,${Math.min(0.8, unten - 0.3)})`; ctx.lineWidth = 2; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * L * 0.16 - 3, -D * 0.25); ctx.lineTo(i * L * 0.16 + 3, D * 0.45); ctx.stroke(); } }
  if (alt) { ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 2; for (let i = -1; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * L * 0.18, -D * 0.3); ctx.lineTo(i * L * 0.18 + 4, -D * 0.05); ctx.stroke(); } }
  ctx.restore();
}
function flammeZeichnen(ctx, x, y, h) {
  if (h <= 0) return;
  ctx.save();
  ctx.fillStyle = 'rgba(255,170,40,0.9)'; ctx.beginPath(); ctx.moveTo(x - h * 0.45, y); ctx.quadraticCurveTo(x - h * 0.4, y - h * 0.6, x, y - h * 1.3); ctx.quadraticCurveTo(x + h * 0.4, y - h * 0.6, x + h * 0.45, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,140,0.95)'; ctx.beginPath(); ctx.moveTo(x - h * 0.2, y); ctx.quadraticCurveTo(x - h * 0.15, y - h * 0.4, x, y - h * 0.75); ctx.quadraticCurveTo(x + h * 0.15, y - h * 0.4, x + h * 0.2, y); ctx.closePath(); ctx.fill();
  ctx.restore();
}
