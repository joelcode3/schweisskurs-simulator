// Einstieg: Renderer, Werkstatt, Dennis, Steuerung und Startbildschirm verbinden.
import * as THREE from 'three';
import { baueWelt, STATIONEN } from './world.js';
import { baueDennis } from './dennis.js';
import { baueJonny } from './jonny.js';
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
const kamera = new THREE.PerspectiveCamera(70, 1, 0.05, 40);

const welt = baueWelt(scene);
const dennis = baueDennis(scene);
dennis.wurzel.userData.interaktiv = { id: 'dennis', name: 'Dennis', station: null };
const jonny = baueJonny(scene);
jonny.wurzel.userData.interaktiv = { id: 'jonny', name: 'Jonny', station: null };
welt.hindernisse.push({ xMin: jonny.position.x - 0.25, xMax: jonny.position.x + 0.25, zMin: jonny.position.z - 0.25, zMax: jonny.position.z + 0.25 });

const zielListe = scene.children;
const hand = baueHand(scene, kamera);
const steuerung = baueSteuerung(kamera, canvas, {
  hindernisse: welt.hindernisse,
  begehbar: welt.begehbar,
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

let letzte = performance.now();
let stationAlt = null;
function schleife(jetzt) {
  const dt = Math.min(0.05, (jetzt - letzte) / 1000);
  letzte = jetzt;
  steuerung.update(dt);
  dennis.schaue(kamera.position);
  dennis.update(dt);
  jonny.schauZu(kamera.position);
  jonny.update(dt);
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
  spiel = baueSpiel({ welt, dennis, jonny, steuerung, kamera, hand });
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
window.__werkstatt = { kamera, steuerung, dennis, jonny, welt, hand, get spiel() { return spiel; } };
