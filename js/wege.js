// Wege für die Figuren: nie durch Wände. Werkstatt, Bad und draußen sind über Türen verbunden
// (Schlupftür im Tor, WC-Tür); draußen geht es außen um Werkstatt und Bad-Anbau herum.
import { RAUM, BAD } from './world.js';

const TUER_INNEN = { x: -0.35, z: 3.2 }, TUER_AUSSEN = { x: -0.35, z: 5.0 };
const WC_WERKSTATT = { x: 1.4, z: 3.4 }, WC_BAD = { x: 1.4, z: 4.6 };
// Hindernisse draußen (Mauern mit etwas Abstand) und Eckpunkte drumherum
const KAESTEN = [
  { xMin: RAUM.xMin - 0.45, xMax: RAUM.xMax + 0.45, zMin: RAUM.zMin - 0.45, zMax: RAUM.zMax + 0.4 },
  { xMin: BAD.xMin - 0.45, xMax: BAD.xMax + 0.45, zMin: RAUM.zMax, zMax: BAD.zMax + 0.45 },
];
const ECKEN = [];
for (const k of KAESTEN) for (const x of [k.xMin - 0.35, k.xMax + 0.35]) for (const z of [k.zMin - 0.35, k.zMax + 0.35]) ECKEN.push({ x, z });

export function bereich(x, z) {
  if (x > BAD.xMin && x < BAD.xMax && z > RAUM.zMax && z < BAD.zMax) return 'bad';
  if (x > RAUM.xMin - 0.1 && x < RAUM.xMax + 0.1 && z > RAUM.zMin - 0.1 && z < RAUM.zMax + 0.1) return 'werkstatt';
  return 'draussen';
}

// Schneidet die Strecke a-b einen Kasten? (Liang-Barsky)
function schneidet(a, b, k) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dz = b.z - a.z;
  for (const [p, q] of [[-dx, a.x - k.xMin], [dx, k.xMax - a.x], [-dz, a.z - k.zMin], [dz, k.zMax - a.z]]) {
    if (Math.abs(p) < 1e-9) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 1e-6;
}
// Bewegliche Hindernisse draußen (Jeep, Hoflader): main.js meldet sie an; Rechtecke mit etwas Abstand
let dynamisch = () => [];
export function setzeDynamisch(f) { dynamisch = f; }
const abst = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const drin = (p, k) => p.x > k.xMin && p.x < k.xMax && p.z > k.zMin && p.z < k.zMax;

// Draußen von a nach b: kürzester Weg über die Ecken um Häuser und Fahrzeuge (Dijkstra, wenige Knoten).
// Ein Fahrzeug, in dem Start oder Ziel liegt (z. B. Einsteigen), zählt nicht.
function aussenWeg(a, b) {
  const dyn = dynamisch().map((h) => ({ xMin: h.xMin - 0.35, xMax: h.xMax + 0.35, zMin: h.zMin - 0.35, zMax: h.zMax + 0.35 }))
    .filter((k) => !drin(a, k) && !drin(b, k));
  const kaesten = [...KAESTEN, ...dyn];
  const frei = (p, q) => !kaesten.some((k) => schneidet(p, q, k));
  const imKasten = (p) => kaesten.some((k) => drin(p, k));
  if (frei(a, b) || KAESTEN.some((k) => drin(a, k) || drin(b, k))) return [b];
  const ecken = [...ECKEN];
  for (const k of dyn) for (const x of [k.xMin - 0.3, k.xMax + 0.3]) for (const z of [k.zMin - 0.3, k.zMax + 0.3]) ecken.push({ x, z });
  const knoten = [a, ...ecken.filter((e) => !imKasten(e)), b];
  const n = knoten.length, dist = new Array(n).fill(Infinity), vor = new Array(n).fill(-1), fertig = new Array(n).fill(false);
  dist[0] = 0;
  for (;;) {
    let i = -1;
    for (let k = 0; k < n; k++) if (!fertig[k] && (i < 0 || dist[k] < dist[i])) i = k;
    if (i < 0 || dist[i] === Infinity || i === n - 1) break;
    fertig[i] = true;
    for (let k = 0; k < n; k++) {
      if (fertig[k] || !frei(knoten[i], knoten[k])) continue;
      const d = dist[i] + abst(knoten[i], knoten[k]);
      if (d < dist[k]) { dist[k] = d; vor[k] = i; }
    }
  }
  if (vor[n - 1] < 0) return [b];
  const weg = [];
  for (let k = n - 1; k > 0; k = vor[k]) weg.unshift(knoten[k]);
  return weg;
}

// Andere Figuren (und der Spieler): wer läuft, weicht aus, statt durchzugehen. main.js meldet die Positionen an.
let andere = () => [];
export function setzeFiguren(f) { andere = f; }
// d = normierte Laufrichtung (wird angepasst): steht jemand bis 0,9 m voraus und seitlich näher als 0,5 m,
// lenkt man seitlich weg (zur Seite, auf der mehr Platz ist)
// rest = Abstand bis zum Ziel: wer hinter dem Ziel steht (oder genau dort), stört nicht
export function ausweichen(pos, d, rest = Infinity) {
  for (const o of andere()) {
    if (o === pos) continue;
    const ox = o.x - pos.x, oz = o.z - pos.z;
    const vor = ox * d.x + oz * d.z;
    if (vor <= 0.05 || vor > 0.9 || vor > rest + 0.2) continue;
    const seit = ox * -d.z + oz * d.x; // >0: steht auf der Seite (-d.z, d.x)
    if (Math.abs(seit) > 0.5) continue;
    const w = (seit > 0 ? -1 : 1) * 0.9; // weg von ihr drehen (+w dreht zur Seite (-d.z, d.x) hin)
    const c = Math.cos(w), sn = Math.sin(w);
    const nx = d.x * c - d.z * sn, nz = d.x * sn + d.z * c;
    d.x = nx; d.z = nz;
    return d;
  }
  return d;
}

// Wegpunkte von (von) nach (nach), ohne den Startpunkt
export function wegNach(von, nach) {
  const a = { x: von.x, z: von.z }, b = { x: nach.x, z: nach.z };
  const ba = bereich(a.x, a.z), bb = bereich(b.x, b.z);
  if (ba === bb) return ba === 'draussen' ? aussenWeg(a, b) : [b];
  const weg = [];
  let hier = a, wo = ba;
  const hin = (p) => { if (abst(hier, p) > 0.12) weg.push(p); hier = p; };
  // erst raus in die Werkstatt, dann weiter
  if (wo === 'bad') { hin(WC_BAD); hin(WC_WERKSTATT); wo = 'werkstatt'; }
  if (wo === 'draussen') { for (const p of aussenWeg(hier, TUER_AUSSEN)) hin(p); hin(TUER_INNEN); wo = 'werkstatt'; }
  if (bb === 'bad') { hin(WC_WERKSTATT); hin(WC_BAD); }
  if (bb === 'draussen') { hin(TUER_INNEN); hin(TUER_AUSSEN); for (const p of aussenWeg(hier, b)) hin(p); return weg; }
  hin(b);
  if (!weg.length || abst(weg[weg.length - 1], b) > 0.01) weg.push(b);
  return weg;
}
