// Dinge in der Hand: aufheben, im Bild zeigen, ablegen, werfen (mit einfacher Physik).
// Was man hält, wird in einer eigenen kleinen Szene vor der Kamera gezeichnet (kein Durchstecken durch Wände).
import * as THREE from 'three';
import { toon, teil, quader, zylinder, kugel, setze, leinwandTextur } from './toon.js';
import { RAUM, BAD } from './world.js';
import { GELAENDE, gelaendeHoehe } from './landschaft.js';

// Haltung in der Hand: Position vor der Kamera, Drehung, Größe, beidhändig, schwer
// Wurfgrenzen draußen auf dem Hof
const AUSSEN = GELAENDE;

const HALTUNG = {
  brille: { pos: [0.18, -0.15, -0.45], rot: [0.25, 0.4, 0], skala: 0.55, name: 'Schutzbrille', tragen: 'Aufsetzen' },
  handschuhe: { pos: [0.25, -0.24, -0.55], rot: [0.3, 0.5, 0], skala: 0.7, name: 'Handschuhe', tragen: 'Anziehen' },
  maske: { pos: [0.2, -0.18, -0.48], rot: [0.2, 0.3, 0], skala: 1.2, name: 'Atemmaske', tragen: 'Aufsetzen' },
  helm: { pos: [0.28, -0.26, -0.62], rot: [0.1, -0.5, 0], skala: 0.8, name: 'Schweißhelm', tragen: 'Aufsetzen' },
  flex: { pos: [0.26, -0.22, -0.6], rot: [0.25, -Math.PI / 2 + 0.25, 0], name: 'Winkelschleifer', benutzen: 'Anwerfen' },
  edding: { pos: [0.2, -0.15, -0.42], rot: [0.5, 0.9, 0.3], skala: 1.0, name: 'Edding' },
  hammer: { pos: [0.25, -0.2, -0.5], rot: [0.3, 1.2, 0.4], name: 'Schlackenhammer' },
  feuerloescher: { pos: [0.36, -0.42, -0.8], rot: [0.05, -0.3, 0], skala: 0.75, name: 'Feuerlöscher', benutzen: 'Sprühen', schwer: true },
  besen: { pos: [0.32, -0.85, -0.85], rot: [0.35, 0, -0.15], name: 'Besen', benutzen: 'Fegen' },
  figur: { pos: [0, -0.6, -0.9], rot: [0.05, Math.PI, 0], name: 'Holzfigur', beidhaendig: true, schwer: true },
  handy: { pos: [0.15, -0.14, -0.38], rot: [0.9, 0, 0], skala: 1.2, name: 'Dein Handy', benutzen: 'Aufs Handy gucken' },
  flasche: { pos: [0, -0.5, -1.05], rot: [0.3, 0, 0], name: 'Gasflasche', beidhaendig: true, schwer: true, nichtWerfen: true },
  ofen: { pos: [0.4, -0.8, -1.2], rot: [-0.2, Math.PI / 2, 0], name: 'Fertiger Ofen', beidhaendig: true, schwer: true, nichtWerfen: true, benutzen: 'Zu Dennis bringen (auf Dennis klicken)' },
  klemmbrett: { pos: [-0.03, 0.0, -0.4], rot: [Math.PI / 2 - 0.08, 0, 0], griff: [0.15, -0.17, 0.02], name: 'Dennis’ Klemmbrett' },
  waeschetasche: { pos: [0.42, -0.78, -0.95], rot: [0.1, 0.5, 0], griff: [-0.02, 0.58, -0.08], name: 'Dennis’ Wäschetasche', nichtWerfen: true, nichtAblegen: true, ablegenHinweis: 'Die Wäsche kommt in die Maschine (oder zu Dennis).' },
  sieb: { pos: [0.16, -0.18, -0.48], rot: [0.2, 1.3, 0.2], skala: 1.3, name: 'Flusensieb', nichtWerfen: true, nichtAblegen: true, ablegenHinweis: 'Das Sieb gehört in den Trockner. Dreckig erst am Kompressor ausblasen.' },
  hulahup: { pos: [0.3, -0.5, -1.05], rot: [0.35, 1.1, 0], skala: 0.85, name: 'Hula-Hoop-Reifen', benutzen: 'Dennis bringen' },
  creme: { pos: [0.18, -0.16, -0.42], rot: [0.2, 0.4, 0], skala: 1.5, name: 'Lockencreme', benutzen: 'Dennis geben (auf Dennis klicken)' },
  poempel: { pos: [0.22, -0.45, -0.62], rot: [0.35, 0, -0.25], name: 'Pömpel', benutzen: 'Pömpeln' },
  tasse: { pos: [0.2, -0.2, -0.45], rot: [0.1, 2.0, 0], skala: 1.3, name: 'Benutzte Kaffeetasse', benutzen: 'Auf den Kühlschrank stellen' },
  kackpumpe: { pos: [0.3, -0.5, -0.85], rot: [0.15, 0.6, 0], skala: 0.85, name: 'Kackepumpe', benutzen: 'Abwaschen (Bad) / zurückstellen (Kompressor)' },
  rohrzange: { pos: [0.24, -0.22, -0.52], rot: [0.4, 0.3, -0.9], name: 'Rohrzange', benutzen: 'Reparieren' },
  schlauch: { pos: [0.2, -0.2, -0.55], rot: [0.1, 0.12, 0], skala: 1.2, name: 'Wasserschlauch', benutzen: 'Spritzen (halten)', nichtWerfen: true, nichtAblegen: true },
  peitsche: { pos: [0.24, -0.3, -0.55], rot: [0.5, 0.4, -0.3], skala: 1.2, name: 'Peitsche', benutzen: 'Knallen lassen' },
  kaffee: { pos: [0.2, -0.17, -0.45], rot: [0.1, 2.2, 0], skala: 1.3, name: 'Kaffee für Dennis', nichtAblegen: true, ablegenHinweis: 'Den Kaffee bringst du Dennis. Oder weg damit (Q oder G).' },
};

export function baueHand(scene, kamera) {
  const handSzene = new THREE.Scene();
  handSzene.add(new THREE.HemisphereLight(0xfff2dc, 0x4a4238, 2.2));
  const licht = new THREE.DirectionalLight(0xfff0d0, 1.6);
  licht.position.set(-1, 2, 1);
  handSzene.add(licht);
  const handKam = new THREE.PerspectiveCamera(70, 1, 0.01, 10);
  const halter = new THREE.Group();
  handSzene.add(halter);

  // Hände (rechts, bei beidhändig auch links)
  const hautMat = toon(0xefc3a6);
  const handschuhMat = toon(0xa8743d);
  function baueHandModell(seite) {
    const g = new THREE.Group();
    const flaeche = teil(new THREE.BoxGeometry(0.075, 0.03, 0.085), 0, { material: hautMat, umriss: 0.003 });
    g.add(flaeche);
    for (let f = 0; f < 4; f++) {
      const finger = teil(new THREE.CapsuleGeometry(0.009, 0.045, 4, 6), 0, { material: hautMat, umriss: 0.002 });
      finger.rotation.x = Math.PI / 2 - 0.5;
      finger.position.set(-0.027 + f * 0.018, 0.005, -0.06);
      g.add(finger);
    }
    const daumen = teil(new THREE.CapsuleGeometry(0.01, 0.035, 4, 6), 0, { material: hautMat, umriss: 0.002 });
    daumen.position.set(-0.045 * seite, 0.012, -0.015);
    daumen.rotation.set(Math.PI / 2, 0, 0.6 * seite);
    g.add(daumen);
    const aermel = teil(new THREE.CylinderGeometry(0.05, 0.055, 0.25, 12), 0x2b3a55, { umriss: 0.003 });
    aermel.rotation.x = Math.PI / 2;
    aermel.position.z = 0.16;
    g.add(aermel);
    g.userData.haut = [flaeche, daumen, ...g.children.filter((c, i) => i >= 1 && i <= 4)];
    return g;
  }
  const rechts = baueHandModell(1);
  const links = baueHandModell(-1);
  handSzene.add(rechts, links);
  rechts.visible = links.visible = false;

  let item = null;
  let wackel = 0;
  const fliegend = [];

  // Spritzpistole vom Gartenschlauch (nur in der Hand; der Schlauch selbst bleibt an der Wand)
  const spritze = new THREE.Group();
  spritze.add(setze(quader(0.04, 0.13, 0.05, 0xe2531e), 0, -0.05, 0.02, 0.25, 0, 0));
  spritze.add(setze(zylinder(0.02, 0.016, 0.17, 0x3a3d42, {}, 12), 0, 0.02, -0.06, Math.PI / 2, 0, 0));
  spritze.add(setze(zylinder(0.024, 0.024, 0.02, 0xe2531e, {}, 12), 0, 0.02, -0.15, Math.PI / 2, 0, 0));
  spritze.add(setze(quader(0.012, 0.06, 0.025, 0x111111), 0, -0.03, -0.02, 0.4, 0, 0));
  spritze.add(setze(zylinder(0.016, 0.016, 0.12, 0x3c9a3a, {}, 8), 0, -0.14, 0.06, 0.6, 0, 0));

  // Kaffeebecher (nur in der Hand, nicht in der Werkstatt)
  const becher = new THREE.Group();
  const tex = leinwandTextur(128, 64, (g, b) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, b, 64);
    g.fillStyle = '#c8352a'; g.font = 'bold 34px Bangers, Impact, sans-serif'; g.textAlign = 'center'; g.fillText('CHEF', b / 2, 44);
  });
  becher.add(teil(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 18), 0xffffff, { material: toon(0xffffff, { map: tex }) }));
  becher.add(setze(teil(new THREE.TorusGeometry(0.028, 0.008, 6, 14), 0xffffff), 0.05, 0, 0));
  const kaffeeOberflaeche = zylinder(0.04, 0.04, 0.005, 0x4a2a12, { umriss: false });
  kaffeeOberflaeche.position.y = 0.045;
  becher.add(kaffeeOberflaeche);
  // Dampf
  for (let i = 0; i < 3; i++) {
    const d = kugel(0.012, 0xffffff, { umriss: false, mat: { transparent: true, opacity: 0.5 } }, 6);
    d.position.set((i - 1) * 0.015, 0.08 + i * 0.03, 0);
    d.userData.dampf = i;
    becher.add(d);
  }

  // Flache Werkzeuge (Rohrzange) auf die Seite legen statt aufrecht hinstellen
  function flachLegen(obj, drehungY) {
    obj.rotation.set(Math.PI / 2, drehungY, 0, 'YXZ');
  }
  function bodenAbstand(obj) {
    const alt = obj.position.clone();
    obj.position.set(0, 0, 0);
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj, true);
    obj.position.copy(alt);
    obj.updateMatrixWorld(true);
    return -box.min.y;
  }

  const api = {
    HALTUNG,
    get item() { return item; },
    get schwer() { return !!(item && item.cfg.schwer); },
    becher,
    spritze,
    handschuhe(an) {
      for (const h of [rechts, links]) for (const m of h.userData.haut) m.material = an ? handschuhMat : hautMat;
    },
    // Ding aus der Werkstatt in die Hand nehmen
    nimm(id, obj) {
      const cfg = HALTUNG[id];
      if (!obj.userData.ruhe) obj.userData.ruhe = { rot: obj.rotation.clone(), skala: obj.scale.clone() };
      obj.userData.versatz = undefined;
      obj.removeFromParent();
      halter.add(obj);
      obj.position.set(...cfg.pos);
      obj.rotation.set(...cfg.rot, 'XYZ');
      obj.scale.copy(obj.userData.ruhe.skala).multiplyScalar(cfg.skala || 1);
      obj.visible = true;
      item = { id, obj, cfg };
      rechts.visible = true;
      links.visible = !!cfg.beidhaendig;
      wackel = 0.25;
    },
    // Ding ist weg (angezogen, abgegeben): nicht mehr in der Hand, nicht in der Werkstatt
    weg() {
      if (!item) return null;
      const obj = item.obj;
      obj.removeFromParent();
      item = null;
      rechts.visible = links.visible = false;
      return obj;
    },
    // In die Werkstatt zurück, Position übernimmt der Aufrufer (z. B. Gasflasche)
    loslassen() {
      if (!item) return null;
      const obj = api.weg();
      obj.rotation.copy(obj.userData.ruhe.rot);
      obj.scale.copy(obj.userData.ruhe.skala);
      scene.add(obj);
      return obj;
    },
    // Auf eine Fläche legen (punkt = Treffer auf der Oberseite)
    lege(punkt, drehungY) {
      if (!item) return null;
      const obj = api.weg();
      obj.rotation.copy(obj.userData.ruhe.rot);
      if (drehungY !== undefined) obj.rotation.y = drehungY;
      if (obj.userData.liegend) flachLegen(obj, drehungY || 0);
      obj.scale.copy(obj.userData.ruhe.skala);
      scene.add(obj);
      obj.position.set(punkt.x, punkt.y + bodenAbstand(obj) + 0.002, punkt.z);
      return obj;
    },
    // Werfen: fliegt in Blickrichtung, prallt ab, bleibt auf dem Boden liegen
    wirf(richtung, beiLanden, beiTreffer) {
      if (!item) return;
      const id = item.id;
      const schwer = !!item.cfg.schwer;
      const obj = api.weg();
      obj.rotation.copy(obj.userData.ruhe.rot);
      obj.scale.copy(obj.userData.ruhe.skala);
      scene.add(obj);
      const start = kamera.position.clone().addScaledVector(richtung, 0.45);
      start.y -= 0.25;
      obj.position.copy(start);
      const v = richtung.clone().multiplyScalar(schwer ? 4 : 7);
      v.y += 2.4;
      fliegend.push({ id, obj, v, boden: bodenAbstand(obj), dreh: new THREE.Vector3(Math.random() * 8, Math.random() * 8, 0), getroffen: false, ruhig: 0, beiLanden, beiTreffer });
    },
    // Fallen lassen vor die Füße
    fallenLassen(richtung) {
      if (!item) return null;
      const p = kamera.position.clone().addScaledVector(new THREE.Vector3(richtung.x, 0, richtung.z).normalize(), 0.6);
      p.y = 0;
      return api.lege(p);
    },
    groesse(aspekt) {
      handKam.aspect = aspekt;
      handKam.updateProjectionMatrix();
    },
    update(dt, gehtGerade, dennisPos, hindernisse) {
      // Wippen beim Gehen
      if (item) {
        wackel = Math.max(0, wackel - dt);
        const t = performance.now() / 1000;
        const b = gehtGerade ? Math.sin(t * 9) * 0.012 : Math.sin(t * 1.6) * 0.004;
        const cfg = item.cfg;
        item.obj.position.set(cfg.pos[0], cfg.pos[1] + b - wackel * 0.3, cfg.pos[2]);
        const gr = cfg.griff || [0, 0, 0]; // wo die Hand anfasst (z. B. Klemmbrett unten rechts, damit man alles lesen kann)
        rechts.position.set((cfg.beidhaendig ? 0.22 : cfg.pos[0] + 0.02) + gr[0], cfg.pos[1] - 0.04 + gr[1] + b - wackel * 0.3, cfg.pos[2] + 0.08 + gr[2]);
        rechts.rotation.set(0.2, -0.2, 0.3);
        links.position.set(-0.22, cfg.pos[1] - 0.04 + b - wackel * 0.3, cfg.pos[2] + 0.08);
        links.rotation.set(0.2, 0.2, -0.3);
        if (item.id === 'kaffee') for (const d of becher.children) if (d.userData.dampf !== undefined) d.position.y = 0.08 + ((t * 0.08 + d.userData.dampf * 0.03) % 0.09);
      }
      // Flugbahnen
      for (let i = fliegend.length - 1; i >= 0; i--) {
        const f = fliegend[i];
        f.v.y -= 9.81 * dt;
        f.obj.position.addScaledVector(f.v, dt);
        f.obj.rotation.x += f.dreh.x * dt;
        f.obj.rotation.z += f.dreh.y * dt;
        const p = f.obj.position;
        // Wände
        const r = 0.15;
        // im Bad an den Badwänden abprallen, sonst an den Werkstattwänden
        const imHaus = p.x > RAUM.xMin - 0.1 && p.x < RAUM.xMax + 0.1 && p.z > RAUM.zMin - 0.1 && p.z < RAUM.zMax + 0.1;
        const imBad = p.x > BAD.xMin - 0.1 && p.x < BAD.xMax + 0.1 && p.z > BAD.zMin - 0.1 && p.z < BAD.zMax + 0.1;
        const draussen = f.draussen ?? (f.draussen = !imHaus && !imBad);
        // draußen geworfen: an der Hauswand abprallen statt durchzufliegen
        if (draussen && imHaus && p.y < RAUM.hoehe) {
          const dx = Math.min(p.x - (RAUM.xMin - 0.1), RAUM.xMax + 0.1 - p.x), dz = Math.min(p.z - (RAUM.zMin - 0.1), RAUM.zMax + 0.1 - p.z);
          if (dx < dz) { f.v.x *= -0.4; p.x = p.x < 0 ? RAUM.xMin - 0.12 : RAUM.xMax + 0.12; } else { f.v.z *= -0.4; p.z = p.z < 0 ? RAUM.zMin - 0.12 : RAUM.zMax + 0.12; }
        }
        const q = draussen ? AUSSEN : p.x > BAD.xMin && p.x < BAD.xMax && p.z > BAD.zMin ? BAD : RAUM;
        if (p.x < q.xMin + r || p.x > q.xMax - r) { f.v.x *= -0.4; p.x = THREE.MathUtils.clamp(p.x, q.xMin + r, q.xMax - r); }
        if (p.z < q.zMin + r || p.z > q.zMax - r) { f.v.z *= -0.4; p.z = THREE.MathUtils.clamp(p.z, q.zMin + r, q.zMax - r); }
        // Möbel (grob als Kästen bis 0.9 m Höhe)
        if (p.y < 0.95) {
          for (const h of hindernisse) {
            if (p.x > h.xMin && p.x < h.xMax && p.z > h.zMin && p.z < h.zMax) {
              f.v.x *= -0.3;
              f.v.z *= -0.3;
              p.addScaledVector(f.v, dt * 2);
            }
          }
        }
        // Dennis getroffen?
        if (!f.getroffen && dennisPos && Math.hypot(p.x - dennisPos.x, p.z - dennisPos.z) < 0.4 && p.y > 0.2 && p.y < 1.9) {
          f.getroffen = true;
          f.v.x *= -0.3;
          f.v.z *= -0.3;
          if (f.beiTreffer) f.beiTreffer(f.id);
        }
        // Boden
        const grund = f.boden + (f.draussen ? gelaendeHoehe(p.x, p.z) : 0);
        if (p.y <= grund) {
          p.y = grund;
          if (Math.abs(f.v.y) > 1.2) {
            f.v.y *= -0.35;
            f.v.x *= 0.6;
            f.v.z *= 0.6;
            f.dreh.multiplyScalar(0.5);
          } else {
            f.v.set(0, 0, 0);
            f.ruhig += dt;
          }
        }
        if (f.ruhig > 0.1) {
          // liegen lassen: auf die Seite gekippt wäre schöner, aufrecht ist eindeutiger
          f.obj.rotation.copy(f.obj.userData.ruhe.rot);
          f.obj.rotation.y += Math.random() * Math.PI;
          if (f.obj.userData.liegend) flachLegen(f.obj, Math.random() * Math.PI * 2);
          f.obj.position.y = bodenAbstand(f.obj);
          fliegend.splice(i, 1);
          if (f.beiLanden) f.beiLanden(f.id, f.obj);
        }
      }
    },
    render(renderer) {
      if (!item) return;
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(handSzene, handKam);
      renderer.autoClear = true;
    },
  };
  return api;
}
