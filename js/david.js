// David (F3, nach Fotos vom Betreiber): Zimmerer, so groß wie Jonny, schlank, blonde Haare (oben länger, Seiten kurz),
// blonde Stoppeln an Kinn und Oberlippe, grauer Hoodie, lange schwarze Zimmererhose, dicke schwarze Arbeitsstiefel.
// Gleiches Grundgerüst wie Jonny; eigene Teile und Haltungen in davidteile.js. Hat manchmal Coco (schwarzer Labrador) dabei.
import { davidArm, davidErweitern } from './davidteile.js';

export const DAVID_OPTS = {
  aussehen: {
    brille: false, langeHaare: false, bart: 'stoppel', nurKinn: true, cap: false, brusthaar: false, weste: false, tshirt: true,
    eigeneBrauen: true, ernst: true, halsKurz: true, groesse: 1.0, torso: 0.98, hueft: 0.94, vform: false,
    farben: { HAUT: 0xf0c4a6, HAAR: 0x9c8462, BART: 0xc9a870, SHIRT: 0x8d8f94, HOSE: 0x1b1c1f, SCHUH: 0x151517, AUGE: 0x7fb0d8 },
  },
  armBau: davidArm,
  erweitern: davidErweitern,
};
