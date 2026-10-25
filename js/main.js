// Einstieg: Renderer, Werkstatt, Dennis, Steuerung und Startbildschirm verbinden.
import * as THREE from 'three';
import { baueWelt, STATIONEN } from './world.js';
import { baueDennis } from './dennis.js';
import { baueJonny } from './jonny.js';
import { baueWaldo } from './waldo.js';
import { baueTorben } from './torben.js';
import { baueKumpels } from './kumpels.js';
import { baueSegway } from './segway.js';
import { baueFahrzeuge } from './fahrzeuge.js';
import { gelaendeHoehe } from './landschaft.js';
import { baueSteuerung } from './steuerung.js';
import { baueSpiel } from './spiel.js';
import { baueHand } from './hand.js';
import { ladeClips, videoFreischalten } from './clips.js';
import { audioStart, setzeLautstaerke, klick, jingle } from './audio.js';
import { setzeVideoLautstaerke } from './clips.js';
import { dennisMini } from './gesicht.js';
import * as ui from './ui.js';

const canvas = document.getElementById('welt');
const handy = matchMedia('(pointer: coarse)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !handy || devicePixelRatio < 2, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, handy ? 1.5 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(70, 1, 0.05, 1500);
// leichter Dunst in der Ferne (die Landschaft ist groß)
scene.fog = new THREE.Fog(0xcfe3ee, 260, 1150);

const welt = baueWelt(scene);
const dennis = baueDennis(scene);
dennis.wurzel.userData.interaktiv = { id: 'dennis', name: 'Dennis', station: null };
const jonny = baueJonny(scene);
jonny.wurzel.userData.interaktiv = { id: 'jonny', name: 'Jonny', station: null };
const waldo = baueWaldo(scene);
waldo.wurzel.userData.interaktiv = { id: 'waldo', name: 'Waldo', station: null };
const torben = baueTorben(scene);
const kumpels = baueKumpels(scene);
const segway = baueSegway(scene);
const fz = baueFahrzeuge(scene, welt);
welt.hindernisse.push({ xMin: jonny.position.x - 0.25, xMax: jonny.position.x + 0.25, zMin: jonny.position.z - 0.25, zMax: jonny.position.z + 0.25 });

const zielListe = scene.children;
const hand = baueHand(scene, kamera);
const steuerung = baueSteuerung(kamera, canvas, {
  hindernisse: welt.hindernisse,
  begehbar: welt.begehbar,
  tuerMitte: (x, z) => welt.tuerMitte(x, z),
  bodenHoehe: (x, z) => fz.bodenHoehe(x, z) + gelaendeHoehe(x, z),
  alleZiele: () => zielListe,
  dennisPosition: () => dennis.position,
}, (t) => spiel && spiel.klick(t), (t, x, y) => ui.hoverName(t ? t.info.name : '', x, y));

const s = STATIONEN.eingang;
steuerung.setze(s.pos, s.blick);

let spiel = null;

function groesse() {
  const b = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(b, h, false);
  kamera.aspect = b / h;
  // Auf schmalen Bildschirmen etwas weiter gucken
  kamera.fov = b / h < 1 ? 85 : 70;
  kamera.updateProjectionMatrix();
  hand.groesse(b / h);
}
window.addEventListener('resize', groesse);
groesse();

// ---------- Leistung (gegen Ruckeln) ----------
// 1. kleine Teile (Schrauben, Knöpfe, Krümel …) und Umrisse werfen keinen Schatten
// 2. Schatten nur jedes zweite Bild neu berechnen
// 3. weit entfernte Kleinteile und Umrisslinien nicht zeichnen (über Layer, damit Spiel-Sichtbarkeit unberührt bleibt)
// 4. alle Materialien gleich beim Start vorbereiten (sonst hakt es, wenn z. B. Waldo zum ersten Mal reinkommt)
const FIGUREN = new Set([dennis.wurzel, jonny.wurzel, waldo.wurzel, torben.wurzel, ...Object.values(kumpels.alle || {}).map((k) => k.wurzel)]);
const fernTeile = []; // { gruppe, lokal (Mitte), radius, teile: [mesh], aus: bool }
function leistungVorbereiten() {
  const _s = new THREE.Sphere(), _v = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    if (o.userData.umriss) { o.castShadow = false; return; }
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const r = o.geometry.boundingSphere.radius * o.getWorldScale(_v).x;
    if (r < 0.06) o.castShadow = false;
  });
  for (const g of scene.children) {
    if (!g.isGroup || FIGUREN.has(g)) continue;
    const box = new THREE.Box3().setFromObject(g);
    if (box.isEmpty()) continue;
    box.getBoundingSphere(_s);
    const teile = [];
    g.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      if (o.userData.umriss || o.geometry.boundingSphere.radius * o.getWorldScale(_v).x < 0.25) teile.push(o);
    });
    if (teile.length > 20) fernTeile.push({ gruppe: g, lokal: g.worldToLocal(_s.center.clone()), radius: _s.radius, teile, aus: false });
  }
}
let fernTakt = 0;
const _fv = new THREE.Vector3();
function fernUpdate() {
  if (++fernTakt % 15) return;
  for (const f of fernTeile) {
    // Mitte in Gruppenkoordinaten gemerkt: Fahrzeuge nehmen sie mit
    const mitte = f.gruppe.localToWorld(_fv.copy(f.lokal));
    const weit = kamera.position.distanceTo(mitte) - f.radius > 45;
    if (weit === f.aus) continue;
    f.aus = weit;
    for (const t of f.teile) { if (weit) t.layers.disable(0); else t.layers.enable(0); }
  }
}
function materialienVorbereiten() {
  const versteckt = [];
  scene.traverse((o) => { if (!o.visible) { versteckt.push(o); o.visible = true; } });
  try { renderer.compile(scene, kamera); } catch (e) { /* egal */ }
  for (const o of versteckt) o.visible = false;
}
leistungVorbereiten();
materialienVorbereiten();
renderer.shadowMap.autoUpdate = false;
let schattenTakt = 0;

let letzte = performance.now();
let stationAlt = null;
function schleife(jetzt) {
  const dt = Math.min(0.05, (jetzt - letzte) / 1000);
  letzte = jetzt;
  steuerung.update(dt);
  {
    const ab = Math.hypot(kamera.position.x - dennis.position.x, kamera.position.z - dennis.position.z);
    dennis.schaue(ab < 3.2 && dennis.modus !== 'tanzen' ? kamera.position : null);
  }
  dennis.update(dt);
  jonny.schauZu(kamera.position);
  jonny.update(dt);
  waldo.schauZu(kamera.position);
  waldo.update(dt);
  torben.schauZu(kamera.position);
  torben.update(dt);
  kumpels.update(dt, kamera.position);
  fz.update(dt);
  segway.update(dt);
  welt.update(dt);
  if (spiel) {
    spiel.update(dt);
    const st = steuerung.station();
    if (st !== stationAlt) {
      stationAlt = st;
      ui.stationenZeigen(st, (id) => spiel.stationWaehlen(id));
    }
  }
  hand.update(dt, steuerung.geht, dennis.position, welt.hindernisse);
  fernUpdate();
  if (++schattenTakt % 2 === 0) renderer.shadowMap.needsUpdate = true;
  renderer.render(scene, kamera);
  hand.render(renderer);
  requestAnimationFrame(schleife);
}
requestAnimationFrame(schleife);

// ---------- Start ----------
const clipsGeladen = ladeClips();
ui.lautstaerkeLeiste((v) => { setzeLautstaerke(v); setzeVideoLautstaerke(v); });

let gestartet = false;
async function spielStarten() {
  if (gestartet) return;
  gestartet = true;
  audioStart();
  videoFreischalten();
  const mitSchloss = !document.getElementById('start').classList.contains('versteckt');
  if (mitSchloss) document.getElementById('tuer').classList.add('offen');
  await Promise.all([clipsGeladen, new Promise((r) => setTimeout(r, mitSchloss ? 1200 : 0))]);
  document.getElementById('start').classList.add('versteckt');
  document.getElementById('start-einfach').classList.add('versteckt');
  spiel = baueSpiel({ welt, dennis, jonny, waldo, torben, kumpels, fz, segway, steuerung, kamera, hand });
  ui.zeigeHud(true);
  stationAlt = undefined;
  spiel.intro();
}

// Aktuell: einfacher Start per Knopf
document.getElementById('start-los').addEventListener('click', spielStarten);

// Für später: Zahlenschloss an der Werkstatttür: nur mit dem richtigen Code geht sie auf
const CODE = '1312';
const raeder = [...document.querySelectorAll('#schloss .rad')];
document.getElementById('plakat-gesicht').innerHTML = dennisMini('ruhig');
raeder.forEach((rad) => rad.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (gestartet) return;
  audioStart();
  const r = rad.getBoundingClientRect();
  const hoch = e.clientY < r.top + r.height / 2;
  rad.textContent = String((Number(rad.textContent) + (hoch ? 1 : 9)) % 10);
  klick();
  if (raeder.map((x) => x.textContent).join('') === CODE) {
    document.getElementById('schloss').classList.add('auf');
    document.getElementById('schloss-tipp').textContent = 'Klick! Die Tür geht auf ...';
    jingle(true);
    spielStarten();
  }
}));

// Für Tests im Browser
window.__werkstatt = { renderer, scene, kamera, steuerung, dennis, jonny, waldo, torben, kumpels, fz, segway, welt, hand, get spiel() { return spiel; } };
