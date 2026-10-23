// Waldos grüner Segway: zwei große Räder, Trittbrett, Lenkstange mit Lenker. Fährt auf Wegpunkten (fahreZu), Waldo steht drauf.
import * as THREE from 'three';
import { quader, zylinder, setze, teil } from './toon.js';

export function baueSegway(scene) {
  const GRUEN = 0x3f9a3a, SCHW = 0x1d1d1f;
  const g = new THREE.Group();
  // Trittbrett mit grünen Kotflügeln über den Rädern
  g.add(setze(quader(0.5, 0.07, 0.24, SCHW, { umriss: 0.003 }), 0, 0.17, 0));
  g.add(setze(quader(0.46, 0.012, 0.2, 0x3a3c40, { umriss: false }), 0, 0.21, 0));
  const raeder = [];
  for (const sx of [-1, 1]) {
    const r = new THREE.Group();
    r.add(teil(new THREE.CylinderGeometry(0.2, 0.2, 0.09, 20), SCHW, { umriss: 0.003 }));
    r.add(setze(zylinder(0.12, 0.12, 0.095, 0x9aa0a6, { umriss: false }, 14), 0, 0, 0));
    r.rotation.z = Math.PI / 2;
    r.position.set(sx * 0.32, 0.2, 0);
    g.add(r);
    raeder.push(r);
    const kot = teil(new THREE.CylinderGeometry(0.23, 0.23, 0.11, 16, 1, true, Math.PI * 0.1, Math.PI * 0.8), GRUEN, { umriss: 0.002, mat: { side: THREE.DoubleSide } });
    kot.rotation.z = Math.PI / 2;
    kot.position.set(sx * 0.32, 0.2, 0);
    g.add(kot);
  }
  // Lenkstange und Lenker
  g.add(setze(zylinder(0.025, 0.03, 0.9, GRUEN, { umriss: 0.002 }, 10), 0, 0.66, 0.08, -0.08, 0, 0));
  g.add(setze(zylinder(0.02, 0.02, 0.5, SCHW, { umriss: 0.002 }, 8), 0, 1.1, 0.12, 0, 0, Math.PI / 2));
  for (const sx of [-1, 1]) g.add(setze(zylinder(0.026, 0.026, 0.1, 0x2a2a2e, { umriss: false }, 8), sx * 0.22, 1.1, 0.12, 0, 0, Math.PI / 2));
  g.add(setze(quader(0.08, 0.05, 0.03, 0x9ad94a, { umriss: false }), 0, 1.06, 0.14));
  // Waldo steht drauf (Füße auf dem Trittbrett)
  const anker = new THREE.Group();
  anker.position.set(0, 0.21, -0.02);
  g.add(anker);
  g.visible = false;
  scene.add(g);
  let ziel = null, tempo = 2.5, fertig = null;
  return {
    gruppe: g,
    anker,
    sichtbar(an) { g.visible = an; },
    setze(x, z, dreh = 0) { g.position.set(x, 0, z); g.rotation.y = dreh; },
    fahreZu(x, z, v = 2.8) {
      if (fertig) fertig(false);
      ziel = new THREE.Vector3(x, 0, z); tempo = v;
      return new Promise((r) => { fertig = r; });
    },
    update(dt) {
      if (!ziel) return;
      const d = new THREE.Vector3().subVectors(ziel, g.position);
      const rest = d.length();
      if (rest < 0.05) { ziel = null; const r = fertig; fertig = null; if (r) r(true); return; }
      const soll = Math.atan2(d.x, d.z);
      let diff = soll - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * Math.min(1, dt * 5);
      const s = Math.min(rest, tempo * dt);
      g.position.addScaledVector(d.normalize(), s);
      for (const r of raeder) r.rotation.x += s / 0.2;
    },
  };
}
