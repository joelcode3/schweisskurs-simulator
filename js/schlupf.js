// Schlupf (Abschleppseil / Rundschlinge), eigener Baustein für E2b (Pritsche abschleppen) und später E3 (Metall-Lieferung).
// Varianten: 'alt' (dreckig, verblasst orange, ausgefranst) und 'neu' (sauber, leuchtend gelb). Zustände:
//   haken     – hängt aufgerollt an einem Haken (Position frei wählbar), anklickbar
//   hand      – in der Hand des Spielers (hand.js, Eintrag 'schlupf'; das Objekt ist das aufgerollte Modell)
//   fahrzeug  – liegt aufgerollt auf einem Fahrzeug (z. B. hinten auf dem Weidemann), fährt mit
//   gespannt  – als Seil zwischen zwei Punkten (Funktionen, die Weltpunkte liefern), hängt durch, wenn es locker ist
// Kein Spielablauf hier drin: wer den Schlupf benutzt, ruft die Zustände auf.
import * as THREE from 'three';
import { toon, teil, quader, setze } from './toon.js';

const FARBEN = {
  alt: { gurt: 0xb8742e, dunkel: 0x6e4a2a, naht: 0x3a2a1a, dreck: 0x5a4a38 },
  neu: { gurt: 0xf2c21c, dunkel: 0xc89a10, naht: 0x1d1d1f, dreck: null },
};

export function baueSchlupf(scene, { variante = 'alt', name } = {}) {
  const F = FARBEN[variante] || FARBEN.alt;
  const gurtMat = toon(F.gurt), dunkelMat = toon(F.dunkel);
  // ---------- aufgerolltes Modell (Haken, Hand, Fahrzeug) ----------
  const rolle = new THREE.Group();
  {
    // flacher Gurt in mehreren Lagen gewickelt, eine Schlaufe hängt raus, Etikett
    for (let k = 0; k < 5; k++) rolle.add(setze(teil(new THREE.TorusGeometry(0.13 + k * 0.012, 0.02, 4, 22), 0, { material: k % 2 ? dunkelMat : gurtMat, umriss: 0.002 }), 0, 0, (k - 2) * 0.008));
    const schlaufe = teil(new THREE.TorusGeometry(0.07, 0.016, 4, 14, Math.PI * 1.5), 0, { material: gurtMat, umriss: 0.002 });
    schlaufe.position.set(0.02, -0.19, 0.01); schlaufe.rotation.z = Math.PI * 0.75;
    rolle.add(schlaufe);
    rolle.add(setze(quader(0.05, 0.06, 0.006, variante === 'neu' ? 0x2f5fa8 : 0x7a7a6a, { umriss: false }), 0.12, -0.1, 0.03, 0, 0, 0.5)); // Etikett
    if (F.dreck) for (let i = 0; i < 8; i++) { const w = i / 8 * Math.PI * 2; rolle.add(setze(quader(0.03, 0.02, 0.005, F.dreck, { umriss: false }), Math.cos(w) * 0.15, Math.sin(w) * 0.15, 0.025, 0, 0, w)); }
  }
  rolle.userData.interaktiv = { id: 'schlupf', name: name || (variante === 'neu' ? 'Neuer Schlupf' : 'Schlupf (Abschleppseil)'), station: null };
  scene.add(rolle);

  // ---------- gespanntes Seil ----------
  const seil = new THREE.Group();
  scene.add(seil);
  seil.visible = false;
  let seilMesh = null, endA = null, endB = null, seilLaenge = 3;
  const schlaufeA = setze(teil(new THREE.TorusGeometry(0.06, 0.016, 4, 12), 0, { material: gurtMat, umriss: 0.002 }), 0, 0, 0);
  const schlaufeB = schlaufeA.clone();
  seil.add(schlaufeA, schlaufeB);

  const api = {
    variante,
    obj: rolle,
    zustand: 'haken',
    haken: null,
    // an einen Haken hängen (Weltposition, Blickrichtung)
    setzeHaken(pos, ry = 0) { api.haken = { pos: pos.clone(), ry }; rolle.userData.wand = { pos: pos.clone(), rot: new THREE.Euler(0, ry, 0) }; },
    anHaken() {
      api.loesen();
      scene.add(rolle);
      if (api.haken) { rolle.position.copy(api.haken.pos); rolle.rotation.set(0, api.haken.ry, 0); }
      rolle.scale.setScalar(1);
      rolle.visible = true;
      api.zustand = 'haken';
    },
    // in der Hand: hand.js übernimmt das Objekt (hand.nimm('schlupf', schlupf.obj)); hier nur vermerken
    inHand() { api.loesen(); api.zustand = 'hand'; },
    // aufgerollt auf ein Fahrzeug legen (Gruppe des Fahrzeugs, lokale Lage)
    aufFahrzeug(gruppe, lokal = new THREE.Vector3(), rot = new THREE.Euler(Math.PI / 2, 0, 0)) {
      api.loesen();
      gruppe.add(rolle);
      rolle.position.copy(lokal); rolle.rotation.copy(rot); rolle.scale.setScalar(1);
      rolle.visible = true;
      api.zustand = 'fahrzeug';
    },
    // zwischen zwei Punkten spannen: a(), b() liefern Weltpunkte; laenge = Seillänge (durchhängen, wenn locker)
    spannen(a, b, laenge = 3) {
      rolle.removeFromParent();
      endA = a; endB = b; seilLaenge = laenge;
      seil.visible = true;
      api.zustand = 'gespannt';
      api.update();
    },
    loesen() {
      if (api.zustand === 'gespannt') { seil.visible = false; endA = endB = null; }
    },
    // Abstand der Enden (für den, der zieht)
    abstand() { return endA && endB ? endA().distanceTo(endB()) : 0; },
    update() {
      if (api.zustand !== 'gespannt' || !endA) return;
      const a = endA(), b = endB(), d = a.distanceTo(b);
      // durchhängen: je lockerer, desto tiefer (Parabel), gespannt fast gerade
      const locker = Math.max(0, seilLaenge - d);
      const tief = Math.min(1.2, Math.sqrt(Math.max(0, locker * seilLaenge)) * 0.45) + 0.02;
      const pts = [];
      for (let i = 0; i <= 16; i++) {
        const t = i / 16, p = a.clone().lerp(b, t);
        p.y -= tief * 4 * t * (1 - t);
        p.y = Math.max(p.y, 0.03);
        pts.push(p);
      }
      if (seilMesh) { seilMesh.geometry.dispose(); seil.remove(seilMesh); }
      // flacher Gurt: als dünnes Rohr (von der Seite sieht man ihn eh schmal)
      seilMesh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 5, false), gurtMat);
      seilMesh.castShadow = true;
      seil.add(seilMesh);
      schlaufeA.position.copy(a); schlaufeB.position.copy(b);
      schlaufeA.lookAt(b); schlaufeB.lookAt(a);
    },
  };
  return api;
}
