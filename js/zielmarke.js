// Ablage-Markierung (Paket 4, Bug 4): dezenter grüner, pulsierender Ring am Boden bzw. auf der Fläche, wo das Ding hin
// muss, das man gerade in der Hand hat, dazu ein kleiner schwebender Pfeil nach unten. Einheitlicher Baustein: jede
// Ablagestelle ist eine Regel, die entweder null (gerade nicht dran) oder die Zielposition (Welt) liefert.
// Die Regeln fragen selbst ab, ob das passende Ding in der Hand ist; so leuchtet nur, was gerade gebraucht wird.
import * as THREE from 'three';

const GRUEN = 0x5fd35f;

function baueMarke() {
  const g = new THREE.Group();
  const mat = (o) => new THREE.MeshBasicMaterial({ color: GRUEN, transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 40), mat(0.7));
  ring.rotation.x = -Math.PI / 2;
  const innen = new THREE.Mesh(new THREE.CircleGeometry(0.17, 40), mat(0.14));
  innen.rotation.x = -Math.PI / 2;
  innen.position.y = -0.001;
  // Pfeil: flacher Kegel mit Spitze nach unten, schwebt über dem Ring
  const pfeil = new THREE.Group();
  const kegel = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 4), mat(0.8));
  kegel.rotation.x = Math.PI;
  const stiel = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.07, 0.025), mat(0.8));
  stiel.position.y = 0.075;
  pfeil.add(kegel, stiel);
  g.add(innen, ring, pfeil);
  for (const m of [ring, innen, kegel, stiel]) { m.castShadow = false; m.receiveShadow = false; m.renderOrder = 5; }
  g.userData = { ring, innen, pfeil, mats: [ring.material, innen.material, kegel.material, stiel.material], basis: [0.7, 0.14, 0.8, 0.8] };
  g.visible = false;
  return g;
}

export function baueZielMarken(scene) {
  const regeln = [];
  const marken = [];
  let t = 0;
  return {
    // regel: () => THREE.Vector3 | null ; groesse: Ringradius-Faktor (z. B. 2 für Waschmaschine)
    regel(name, fn, groesse = 1) { regeln.push({ name, fn, groesse }); },
    aktive() { return regeln.filter((r) => { try { return !!r.fn(); } catch { return false; } }).map((r) => r.name); },
    update(dt) {
      t += dt;
      let n = 0;
      for (const r of regeln) {
        let pos = null;
        try { pos = r.fn(); } catch { pos = null; }
        if (!pos) continue;
        if (!marken[n]) { marken[n] = baueMarke(); scene.add(marken[n]); }
        const m = marken[n++];
        m.visible = true;
        m.position.set(pos.x, pos.y + 0.01, pos.z);
        // ruhiges Pulsieren (ca. 1 Schlag pro Sekunde), Pfeil wippt
        const puls = 0.5 + 0.5 * Math.sin(t * 5);
        const s = r.groesse * (0.92 + puls * 0.12);
        m.userData.ring.scale.setScalar(s);
        m.userData.innen.scale.setScalar(s);
        m.userData.pfeil.position.y = 0.3 + Math.sin(t * 3) * 0.04;
        m.userData.pfeil.rotation.y = t * 1.2;
        m.userData.mats.forEach((mt, i) => { mt.opacity = m.userData.basis[i] * (0.55 + puls * 0.45); });
      }
      for (let i = n; i < marken.length; i++) marken[i].visible = false;
    },
  };
}
