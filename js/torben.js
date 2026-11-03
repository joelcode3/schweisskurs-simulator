// Torben (F1, nach Fotos vom Betreiber): gleiches Grundgerüst wie Jonny, aber eigene Figur: etwa 65 Prozent so groß, breiter kräftiger
// Oberkörper, kurzer Hals, stämmige Beine, dicke Unterarme mit Adern, große Hände mit kurzen Fingern, dunkelbraune kurze Haare oben
// leicht gewellt (keine Mütze), eisblaue Augen, kräftige dunkle Brauen, rötlich-sandfarbener Oberlippenbart, Stoppeln am Kinn,
// goldener Nasenstecker, Ohrringe, enges weißes T-Shirt mit ordentlich Flecken, lange sandbraune Arbeitshose mit Farbspritzern und
// Seitentaschen, schwarzer Gürtel mit runder goldener Schnalle, schwarze Schuhe, weiße Socken, schwarze Werkzeugtasche mit gelben
// Details über der Schulter, gekochte Spaghetti in der Hand (Teile und Verhalten in torbenteile.js).
import * as THREE from 'three';
import { baueJonny } from './jonny.js';
import { schluerfen, torbenWurfTon, aufprall } from './audio.js';
import { TORBEN } from './texte.js';
import * as ui from './ui.js';

// Wo Torben rumsteht, wenn er da ist: draußen beim Hoflader
export const TORBEN_PLATZ = new THREE.Vector3(5.6, 0, 6.2);

export function baueTorben(scene) {
  const torben = baueJonny(scene, {
    platz: TORBEN_PLATZ,
    aussehen: {
      torben: true,
      brille: false, langeHaare: false, bart: 'stoppel', nurKinn: true, cap: false, brusthaar: false, weste: false, tshirt: true,
      groesse: 0.56, torso: 0.86, hueft: 1.30, breit: 1.18, tief: 1.28, halsKurz: true, armDick: 1.28, handGross: 1.12, fingerKurz: 0.72, adern: true, entschlossen: true, ernst: true,
      farben: {
        HAUT: 0xeab99e, HAAR: 0x3a281c, BART: 0xa88060, SCHNURR: 0x8c5e38, BRAUE: 0x2c1c12, AUGE: 0x9cc8ee,
        SHIRT: 0xf0ede6, HOSE: 0xb98a52, SCHUH: 0x141416,
      },
    },
    // Geräusche (live erzeugt): Schlürfen beim Spaghetti-Essen, Wurf und Aufprall
    beiSchluerfen: () => schluerfen(),
    beiEssen: () => { if (Math.random() < 0.3) ui.torbenSagt(TORBEN.essen[Math.floor(Math.random() * TORBEN.essen.length)], 2500); },
    beiWurf: (art) => torbenWurfTon(art),
    beiAufprall: (art, n) => { if (art === 'spaghetti') klatschen(); else aufprall(n === 0 ? 0.7 : 0.4); },
  });
  torben.wurzel.userData.interaktiv = { id: 'torben', name: 'Torben', station: null };
  torben.sichtbar(false);
  return torben;
}

function klatschen() { aufprall(0.35); }
