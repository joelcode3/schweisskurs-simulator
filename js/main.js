// Einstieg: Renderer, Werkstatt, Dennis, Steuerung und Startbildschirm verbinden.
import * as THREE from 'three';
import { baueWelt, STATIONEN } from './world.js';
import { baueDennis } from './dennis.js';
import { baueSteuerung } from './steuerung.js';
import { baueSpiel } from './spiel.js';
import { ladeClips, videoFreischalten, archivListe, spieleKategorie } from './clips.js';
import { audioStart, setzeLautstaerke } from './audio.js';
import { setzeVideoLautstaerke } from './clips.js';
import { SYMBOL } from './gesicht.js';
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

const zielListe = scene.children;
const steuerung = baueSteuerung(kamera, canvas, {
  hindernisse: welt.hindernisse,
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
  welt.update(dt);
  if (spiel) {
    spiel.update(dt);
    const st = steuerung.station();
    if (st !== stationAlt) {
      stationAlt = st;
      ui.stationenZeigen(st, (id) => spiel.stationWaehlen(id));
    }
  }
  renderer.render(scene, kamera);
  requestAnimationFrame(schleife);
}
requestAnimationFrame(schleife);

// ---------- Start ----------
const clipsGeladen = ladeClips();
ui.lautstaerkeLeiste((v) => { setzeLautstaerke(v); setzeVideoLautstaerke(v); });

document.getElementById('start-los').addEventListener('click', async () => {
  audioStart();
  videoFreischalten();
  await clipsGeladen;
  document.getElementById('start').classList.add('versteckt');
  spiel = baueSpiel({ welt, dennis, steuerung, kamera, dennisModus: document.getElementById('dennis-modus').checked });
  ui.zeigeHud(true);
  stationAlt = undefined;
  spiel.intro();
});

async function archivZeigen() {
  audioStart();
  videoFreischalten();
  await clipsGeladen;
  const liste = archivListe();
  const html = `<p class="klein">Alle Dennis-Momente. Gesehene sind freigeschaltet.</p><ul class="archiv-liste">${liste.map((e) => `
    <li class="${e.gesehen ? '' : 'gesperrt'}"><span>${e.gesehen ? e.name : 'Noch nicht gesehen'}</span>
    ${e.gesehen ? `<button type="button" class="knopf klein leise" data-k="${e.k}" title="Abspielen">${SYMBOL.play}</button>` : ''}</li>`).join('')}</ul>`;
  const d = document.getElementById('dialog');
  d.innerHTML = `<div class="dialog-karte"><h2>Dennis-Archiv</h2>${html}<div class="dialog-knoepfe"><button type="button" class="knopf" id="archiv-zu">Zurück</button></div></div>`;
  d.classList.remove('versteckt');
  d.querySelector('#archiv-zu').addEventListener('click', () => ui.dialogZu());
  d.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => spieleKategorie(b.dataset.k)));
}
document.getElementById('start-archiv').addEventListener('click', archivZeigen);
if (location.hash === '#archiv') {
  history.replaceState(null, '', location.pathname);
  archivZeigen();
}

// Für Tests im Browser
window.__werkstatt = { kamera, steuerung, dennis, welt, get spiel() { return spiel; } };
