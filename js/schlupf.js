// Schlupf (Abschleppseil / Rundschlinge), eigener Baustein für E2b (Pritsche abschleppen) und später E3 (Metall-Lieferung).
// Varianten: 'alt' (dreckig, verblasst orange, ausgefranst) und 'neu' (sauber, leuchtend gelb). Zustände:
//   haken     – hängt zusammengelegt an einem Haken oder liegt an seinem Platz (Position frei wählbar), anklickbar
//   hand      – in der Hand des Spielers (hand.js, Eintrag 'schlupf'; das Objekt ist das zusammengelegte Modell)
//   fahrzeug  – liegt zusammengelegt auf einem Fahrzeug (z. B. hinten auf dem Weidemann), fährt mit
//   gespannt  – als Seil zwischen zwei Punkten (Funktionen, die Weltpunkte liefern), hängt durch, wenn es locker ist
// Kein Spielablauf hier drin: wer den Schlupf benutzt, ruft die Zustände auf.
// Datenmodell für E3 schon da: variante ('neu'/'alt'), belastbar (Anteil der Nennlast, die er sicher hält), verschleiss
// (0 = neu, 1 = durch), reisst(last) sagt, ob er bei dieser Last reißt. In E2b reißen beide nicht (Pritsche ist leicht genug).
import * as THREE from 'three';
import { toon, teil, setze, leinwandTextur } from './toon.js';

const FARBEN = {
  alt: { gurt: 0xb8742e, dunkel: 0x6e4a2a, naht: 0x3a2a1a, dreck: 0x5a4a38 },
  neu: { gurt: 0xf2c21c, dunkel: 0xc89a10, naht: 0x1d1d1f, dreck: null },
};

const DATEN = {
  neu: { belastbar: 1.0, verschleiss: 0, beschreibung: 'Neue Rundschlinge, noch sauber und knallgelb.' },
  alt: { belastbar: 0.35, verschleiss: 0.85, beschreibung: 'Alte Rundschlinge, dreckig und ausgefranst.' },
};

export function baueSchlupf(scene, { variante = 'alt', name, station = null } = {}) {
  const F = FARBEN[variante] || FARBEN.alt;
  // Gurtmaterial mit Textur: neu sauber mit Webstreifen, alt verblasst mit Dreck- und Ölflecken (nur Flecken, keine Anbauteile)
  const r = (() => { let x = variante === 'neu' ? 7 : 3; return () => (x = (x * 9301 + 49297) % 233280) / 233280; })();
  const hex = (c) => '#' + c.toString(16).padStart(6, '0');
  const gurtTextur = (grund) => leinwandTextur(256, 32, (g, b, h) => {
    g.fillStyle = hex(grund); g.fillRect(0, 0, b, h);
    g.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 3; y < h; y += 6) g.fillRect(0, y, b, 1.5); // Webstruktur
    if (F.dreck) for (let i = 0; i < 26; i++) {
      g.fillStyle = i % 4 === 0 ? 'rgba(25,20,15,0.55)' : `rgba(${60 + r() * 30},${48 + r() * 20},${32 + r() * 12},${0.35 + r() * 0.35})`;
      g.beginPath(); g.ellipse(r() * b, r() * h, 3 + r() * 12, 2 + r() * 7, r() * 3, 0, Math.PI * 2); g.fill();
    }
  }, [3, 1]);
  const gurtMat = toon(0xffffff, { map: gurtTextur(F.gurt) }), dunkelMat = toon(0xffffff, { map: gurtTextur(F.dunkel) });
  // ---------- Modell (Haken, Hand, Fahrzeug): zusammengelegter Rundschlupf, hängt lang nach unten ----------
  // Ursprung = Aufhängepunkt oben; mehrere flache Gurtschlaufen hängen ungleich lang herunter (ca. 0,8 m), schmal.
  // Liegend (Regal, Weidemann) wird das Ganze flach hingelegt (und dabei einmal umgeschlagen = kürzer, skala).
  const rolle = new THREE.Group();
  {
    for (let k = 0; k < 5; k++) {
      const L = 0.74 + r() * 0.14, w = 0.055 + r() * 0.04, dz = (k - 2) * 0.006, dx = (r() - 0.5) * 0.03;
      const pts = [
        new THREE.Vector3(0, 0, dz),
        new THREE.Vector3(w * 0.4, -0.05, dz),
        new THREE.Vector3(w * 0.5 + dx * 0.5, -L * 0.5, dz + 0.004),
        new THREE.Vector3(w * 0.4 + dx, -L * 0.94, dz),
        new THREE.Vector3(dx, -L, dz),
        new THREE.Vector3(-w * 0.4 + dx, -L * 0.94, dz),
        new THREE.Vector3(-w * 0.5 + dx * 0.5, -L * 0.5, dz - 0.004),
        new THREE.Vector3(-w * 0.4, -0.05, dz),
      ];
      const kurve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
      const m = teil(new THREE.TubeGeometry(kurve, 48, 0.022, 6, true), 0, { material: k % 2 ? dunkelMat : gurtMat, umriss: 0.002 });
      m.scale.z = 0.3; // flacher Gurt
      rolle.add(m);
    }
  }
  rolle.userData.interaktiv = { id: 'schlupf', name: name || (variante === 'neu' ? 'Neuer Schlupf' : 'Alter Schlupf'), station };
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
    ...DATEN[variante === 'neu' ? 'neu' : 'alt'],
    // E3: reißt er bei dieser Last (1 = Nennlast)? Alter Schlupf nur bis ca. ein Drittel.
    reisst(last) { return last > api.belastbar; },
    obj: rolle,
    zustand: 'haken',
    haken: null,
    // Stammplatz (Haken oder Regalbrett): Weltposition, Blickrichtung (Zahl) oder ganze Drehung (Euler, z. B. liegend)
    setzeHaken(pos, ry = 0, laenge = 1) {
      const rot = ry instanceof THREE.Euler ? ry.clone() : new THREE.Euler(0, ry, 0);
      api.haken = { pos: pos.clone(), rot, laenge }; rolle.userData.wand = { pos: pos.clone(), rot: rot.clone() };
    },
    anHaken() {
      api.loesen();
      scene.add(rolle);
      rolle.scale.setScalar(1);
      if (api.haken) { rolle.position.copy(api.haken.pos); rolle.rotation.copy(api.haken.rot); rolle.scale.y = api.haken.laenge; }
      rolle.visible = true;
      api.zustand = 'haken';
    },
    // in der Hand: hand.js übernimmt das Objekt (hand.nimm('schlupf', schlupf.obj)); hier nur vermerken
    inHand() { api.loesen(); api.zustand = 'hand'; },
    // aufgerollt auf ein Fahrzeug legen (Gruppe des Fahrzeugs, lokale Lage)
    aufFahrzeug(gruppe, lokal = new THREE.Vector3(), rot = new THREE.Euler(Math.PI / 2, 0, Math.PI), laenge = 0.6) {
      api.loesen();
      gruppe.add(rolle);
      rolle.position.copy(lokal); rolle.rotation.copy(rot); rolle.scale.set(1, laenge, 1);
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
