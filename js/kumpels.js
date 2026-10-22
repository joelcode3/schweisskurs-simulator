// Platzhalter für weitere Kumpels: Uwe, Steffen, Jonas, David, Joel. Haben noch keine Aufgabe im Spiel und sind deshalb
// erst mal unsichtbar. Aussehen ist vorläufig (gleiches Grundgerüst wie Jonny, nur andere Farben und Merkmale), bis der
// Betreiber Fotos oder eine Beschreibung schickt. Zum Ansehen: Seite mit ?kumpels aufrufen, dann stehen alle draußen in einer Reihe.
import * as THREE from 'three';
import { baueJonny } from './jonny.js';

export const KUMPELS = {
  uwe: { name: 'Uwe', aussehen: { brille: true, langeHaare: false, bart: 'voll', cap: false, brusthaar: false,
    farben: { HAAR: 0x8f8f8f, BART: 0x9a9a9a, SHIRT: 0x5a7a9a, WESTE: 0x3a4a3a, HOSE: 0x3a3a40, SCHUH: 0x2a2a2a } } },
  steffen: { name: 'Steffen', aussehen: { brille: false, langeHaare: false, bart: 'stoppel', cap: true, brusthaar: false,
    farben: { HAAR: 0x3a2a1a, BART: 0x4a3a2a, CAP: 0x1f3f7a, SHIRT: 0xd8d2c4, WESTE: 0x6a2f2f, HOSE: 0x23324f, SCHUH: 0xe8e8e8 } } },
  jonas: { name: 'Jonas', aussehen: { brille: false, langeHaare: true, bart: 'stoppel', cap: false, brusthaar: false,
    farben: { HAAR: 0x2a1c12, BART: 0x3a2a1c, SHIRT: 0x2f2f33, WESTE: 0x4f6b3a, HOSE: 0x5a4a3a, SCHUH: 0x8a3a2a } } },
  david: { name: 'David', aussehen: { brille: true, langeHaare: false, bart: 'stoppel', cap: true, brusthaar: false,
    farben: { HAAR: 0xc9a46a, BART: 0xb08a58, CAP: 0xc8352a, SHIRT: 0xf2f0ea, WESTE: 0x2a2a2e, HOSE: 0x6a7a4a, SCHUH: 0x3a5a8a } } },
  joel: { name: 'Joel', aussehen: { brille: false, langeHaare: false, bart: 'voll', cap: true, brusthaar: false,
    farben: { HAAR: 0x5a3a22, BART: 0x5a3a22, CAP: 0x2a2a2e, SHIRT: 0x8a9aa8, WESTE: 0xb0702a, HOSE: 0x1f2024, SCHUH: 0x5f7d3e } } },
};

export function baueKumpels(scene) {
  const zeigen = new URLSearchParams(location.search).has('kumpels');
  const alle = {};
  Object.entries(KUMPELS).forEach(([id, k], i) => {
    // vorerst in einer Reihe draußen auf dem Hof (nur sichtbar mit ?kumpels)
    const platz = new THREE.Vector3(-6 + i * 1.6, 0, 9.0);
    const figur = baueJonny(scene, { platz, aussehen: k.aussehen });
    figur.wurzel.rotation.y = 0;
    figur.wurzel.userData.interaktiv = { id: `kumpel-${id}`, name: k.name, station: null };
    figur.sichtbar(zeigen);
    alle[id] = figur;
  });
  return {
    alle,
    update(dt, blick) {
      for (const f of Object.values(alle)) {
        if (!f.wurzel.visible) continue;
        f.schauZu(blick);
        f.update(dt);
      }
    },
  };
}
