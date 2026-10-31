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

// Spanngurte aufrollen: zwei Gurte liegen in Schlaufen auf dem Boden. Im Kreis um die Rolle ziehen = aufrollen (der Gurt wird
// eingezogen, die Ratsche kommt näher). Verdrehte Stellen (dunkles X) vorher anklicken = glattziehen, sonst wird die Rolle verdreht.
export function spanngurtSpiel() {
  let f, mx, my;
  let gurt = 0; // 0 oder 1
  let w = 0; // aufgerollt 0..1
  let zieht = null;
  let verdreht = 0;
  let blitz = 0;
  const UMDREHUNGEN = 5;
  const r = (() => { let q = 31; return () => { q = (q * 1664525 + 1013904223) >>> 0; return q / 4294967296; }; })();
  let bahn = [];
  let laenge = 0;
  let dreher = [];
  function neuerGurt() {
    // Gurt liegt in losen Schlaufen von der Rolle bis zur Ratsche
    const schleifen = gurt === 0 ? 5 : 4;
    const phase = r() * Math.PI;
    bahn = [];
    for (let i = 0; i <= 400; i++) {
      const t = i / 400;
      const x = mx + 40 + t * f.b * 0.66 + Math.sin(t * Math.PI * schleifen + phase) * f.b * 0.06;
      const y = my + Math.cos(t * Math.PI * schleifen + phase) * f.h * 0.3 * (0.4 + 0.6 * t) * Math.min(1, t * 6) + Math.sin(t * 9) * 10;
      bahn.push([x, y]);
    }
    // Bogenlänge je Punkt
    laenge = 0;
    bahn[0][2] = 0;
    for (let i = 1; i < bahn.length; i++) { laenge += Math.hypot(bahn[i][0] - bahn[i - 1][0], bahn[i][1] - bahn[i - 1][1]); bahn[i][2] = laenge; }
    dreher = [0.3, 0.55, 0.8].map((q) => ({ s: q + (r() - 0.5) * 0.08, glatt: false, weg: false }));
    w = 0;
  }
  function punktBei(s) {
    const ziel = s * laenge;
    for (let i = 1; i < bahn.length; i++) if (bahn[i][2] >= ziel) {
      const a = bahn[i - 1], b = bahn[i], t = (ziel - a[2]) / Math.max(1e-6, b[2] - a[2]);
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    return bahn[bahn.length - 1];
  }
  const { api, versprechen } = spielRahmen('Spanngurte aufrollen', 'Im Kreis um die Rolle ziehen = aufrollen. Verdrehte Stellen (dunkles X) vorher anklicken, damit sie glatt auf die Rolle gehen. Zwei Gurte.', {
    beiGroesse(m) {
      f = flaeche(m); mx = f.x + f.b * 0.2; my = f.y + f.h * 0.5;
      if (!bahn.length) neuerGurt();
    },
    events: {
      pointerdown(e) {
        if (api.istFertig) return;
        const p = zeigerPos(api.canvas, e);
        // verdrehte Stelle angeklickt?
        for (const d of dreher) {
          if (d.glatt || d.weg) continue;
          const [x, y] = punktBei(d.s - w);
          if (Math.hypot(p.x - x, p.y - y) < 30) { d.glatt = true; blip(760, 0.05); return; }
        }
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
        w = Math.min(1, w + Math.abs(d) / (Math.PI * 2 * UMDREHUNGEN));
        if (Math.random() < 0.1) blip(420 + Math.random() * 80, 0.02, 0.03);
        for (const dr of dreher) if (!dr.weg && w >= dr.s) { dr.weg = true; if (!dr.glatt) { verdreht++; blitz = 0.5; klonk(0.35); } }
        if (w >= 1) {
          klonk(0.5);
          zieht = null;
          if (gurt === 0) { gurt = 1; neuerGurt(); blip(660, 0.08); }
          else api.fertig({ verdreht });
        }
      },
      pointerup() { zieht = null; },
      pointercancel() { zieht = null; },
    },
    schritt(dt) { blitz = Math.max(0, blitz - dt); },
    zeichnen() {
      const { ctx, m } = api;
      ctx.fillStyle = '#2a2c30'; ctx.fillRect(0, 0, m.b, m.h);
      // Betonboden mit Flecken
      ctx.fillStyle = '#9a968c'; ctx.fillRect(f.x, f.y, f.b, f.h);
      ctx.fillStyle = 'rgba(70,64,56,0.18)';
      for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.ellipse(f.x + ((i * 97) % f.b), f.y + ((i * 53) % f.h), 30 + (i % 4) * 12, 14 + (i % 3) * 8, i, 0, Math.PI * 2); ctx.fill(); }
      if (!api.istFertig) {
        // restlicher Gurt: wird entlang seiner Schlaufen in die Rolle gezogen (der Rest rutscht nach)
        const rest = 1 - w;
        const breite = 16;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const zug = (farbe, b) => {
          ctx.strokeStyle = farbe; ctx.lineWidth = b; ctx.beginPath();
          ctx.moveTo(mx, my);
          for (const q of bahn) { if (q[2] > rest * laenge) break; ctx.lineTo(q[0], q[1]); }
          const e = punktBei(rest); ctx.lineTo(e[0], e[1]);
          ctx.stroke();
        };
        zug('#111', breite + 5);
        zug(gurt === 0 ? '#e8742a' : '#2f6fd1', breite);
        // Mittelnaht
        ctx.setLineDash([6, 6]); zug('rgba(255,255,255,0.35)', 2); ctx.setLineDash([]);
        // verdrehte Stellen wandern mit
        for (const d of dreher) {
          if (d.weg || d.s < w) continue;
          const [x, y] = punktBei(d.s - w);
          if (d.glatt) { ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke(); continue; }
          ctx.fillStyle = '#3a2410'; ctx.beginPath(); ctx.ellipse(x, y, 16, 11, 0.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y + 8); ctx.moveTo(x + 8, y - 8); ctx.lineTo(x - 8, y + 8); ctx.stroke();
        }
        // Ratsche am Ende
        const e = punktBei(1 - w), e0 = punktBei(Math.max(0, 1 - w - 0.01));
        ctx.save(); ctx.translate(e[0], e[1]); ctx.rotate(Math.atan2(e[1] - e0[1], e[0] - e0[0]));
        ctx.fillStyle = '#8a9096'; ctx.strokeStyle = '#111'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-26, -16, 52, 32, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#c8352a'; ctx.fillRect(-20, -7, 30, 14); ctx.strokeRect(-20, -7, 30, 14);
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
      // Kurbel-Hinweis: Pfeil im Kreis
      if (!api.istFertig) {
        ctx.strokeStyle = 'rgba(255,233,168,0.8)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(mx, my, rr + 22, -0.4, Math.PI * 1.3); ctx.stroke();
      }
      balken(ctx, f.x, f.y + f.h + 26, f.b, 12, (gurt + (api.istFertig ? 1 : w)) / 2, '#ffc81e');
      textMitte(ctx, api.istFertig ? (verdreht ? `Aufgerollt. ${verdreht}x verdreht, sieht krumpelig aus.` : 'Sauber aufgerollt!') : `Gurt ${gurt + 1} von 2: im Kreis ziehen, X vorher anklicken`, m.b / 2, f.y - 18, 18, '#ffe9a8');
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
