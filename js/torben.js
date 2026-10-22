// Torben: vorläufige Figur (Aussehen kommt noch vom Betreiber). Gleiches Grundgerüst wie Jonny, aber eigenes Aussehen:
// kurze dunkelblonde Haare, Dreitagebart, keine Brille, keine Cap, dunkelgraues Shirt, orange Warnweste, blaue Arbeitshose.
import * as THREE from 'three';
import { baueJonny } from './jonny.js';

// Wo Torben rumsteht, wenn er da ist: draußen beim Hoflader
export const TORBEN_PLATZ = new THREE.Vector3(5.6, 0, 6.2);

export function baueTorben(scene) {
  const torben = baueJonny(scene, {
    platz: TORBEN_PLATZ,
    aussehen: {
      brille: false, langeHaare: false, bart: 'stoppel', cap: false, brusthaar: false,
      farben: { HAAR: 0x9a7444, BART: 0xb08a68, SHIRT: 0x45484e, WESTE: 0xe8741e, HOSE: 0x2c3e66, SCHUH: 0x4a3524 },
    },
  });
  torben.wurzel.userData.interaktiv = { id: 'torben', name: 'Torben', station: null };
  torben.sichtbar(false);
  return torben;
}
