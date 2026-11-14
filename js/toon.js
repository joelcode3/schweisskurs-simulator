// Comic-Look: Toon-Materialien mit harten Lichtstufen und schwarze Umrisslinien.
import * as THREE from 'three';

const stufen = new Uint8Array([70, 150, 215, 255]);
const verlauf = new THREE.DataTexture(stufen, stufen.length, 1, THREE.RedFormat);
verlauf.minFilter = THREE.NearestFilter;
verlauf.magFilter = THREE.NearestFilter;
verlauf.needsUpdate = true;

export function toon(farbe, extra = {}) {
  return new THREE.MeshToonMaterial({ color: farbe, gradientMap: verlauf, ...extra });
}

// Umriss = Rückseiten-Hülle, entlang der Normalen etwas aufgeblasen.
const umrissCache = new Map();
function umrissMaterial(dicke) {
  if (!umrissCache.has(dicke)) {
    umrissCache.set(dicke, new THREE.ShaderMaterial({
      uniforms: { dicke: { value: dicke } },
      vertexShader: `
        uniform float dicke;
        void main() {
          vec3 p = position + normal * dicke;
          #ifdef USE_INSTANCING
            p = (instanceMatrix * vec4(p, 1.0)).xyz;
          #endif
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `void main() { gl_FragColor = vec4(0.07, 0.06, 0.06, 1.0); }`,
      side: THREE.BackSide,
    }));
  }
  return umrissCache.get(dicke);
}

export function umriss(mesh, dicke = 0.012) {
  const u = new THREE.Mesh(mesh.geometry, umrissMaterial(dicke));
  u.raycast = () => {};
  u.userData.umriss = true;
  mesh.add(u);
  return mesh;
}

// Kurzschreibweise für ein Bauteil mit Toon-Material, Schatten und Umriss.
export function teil(geo, farbe, opt = {}) {
  const mat = opt.material || toon(farbe, opt.mat);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = opt.wirft ?? true;
  mesh.receiveShadow = opt.empfaengt ?? true;
  if (opt.umriss !== false) umriss(mesh, opt.umriss ?? 0.012);
  return mesh;
}

export function quader(b, h, t, farbe, opt) {
  return teil(new THREE.BoxGeometry(b, h, t), farbe, opt);
}

export function zylinder(rOben, rUnten, h, farbe, opt, seg = 18) {
  return teil(new THREE.CylinderGeometry(rOben, rUnten, h, seg), farbe, opt);
}

export function kugel(r, farbe, opt, seg = 18) {
  return teil(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), farbe, opt);
}

export function setze(obj, x, y, z, rx = 0, ry = 0, rz = 0) {
  obj.position.set(x, y, z);
  obj.rotation.set(rx, ry, rz);
  return obj;
}

export function leinwandTextur(b, h, malen, wiederholen) {
  const c = document.createElement('canvas');
  c.width = b;
  c.height = h;
  const g = c.getContext('2d');
  malen(g, b, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (wiederholen) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(wiederholen[0], wiederholen[1]);
  }
  t.userData = { canvas: c, ctx: g };
  return t;
}

// Kleiner deterministischer Zufall, damit die Werkstatt immer gleich aussieht.
export function zufall(saat = 1) {
  let s = saat >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// Quader mit abgerundeten Kanten (r = Kantenradius): Rechteck mit runden Ecken, mit Fase/Rundung an den Stirnseiten
// ausgeformt. Maße wie quader(b, h, t), Mitte im Ursprung.
const rundCache = new Map();
export function rundQuader(b, h, t, farbe, opt, r = 0.05) {
  const schluessel = [b, h, t, r].join('|');
  let geo = rundCache.get(schluessel);
  if (!geo) {
    const bev = Math.min(r, t * 0.45, b * 0.45, h * 0.45);
    const w = b / 2 - bev, hh = h / 2 - bev, rr = Math.max(0.001, Math.min(r - bev * 0.5, w * 0.95, hh * 0.95));
    const s = new THREE.Shape();
    s.moveTo(-w + rr, -hh);
    s.lineTo(w - rr, -hh); s.quadraticCurveTo(w, -hh, w, -hh + rr);
    s.lineTo(w, hh - rr); s.quadraticCurveTo(w, hh, w - rr, hh);
    s.lineTo(-w + rr, hh); s.quadraticCurveTo(-w, hh, -w, hh - rr);
    s.lineTo(-w, -hh + rr); s.quadraticCurveTo(-w, -hh, -w + rr, -hh);
    geo = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, t - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 5 });
    geo.translate(0, 0, -(t - 2 * bev) / 2);
    rundCache.set(schluessel, geo);
  }
  return teil(geo, farbe, opt);
}

// Lenkrad mit Lenksäule: mitte = Mitte des Lenkrads, saeule = Punkt, wo die Säule im Armaturenbrett verschwindet (beide lokal).
// Das Lenkrad steht senkrecht zur Säule, also zum Fahrer hin geneigt (oben weiter weg, unten näher am Bauch) wie im echten Auto.
export function lenkrad(mitte, saeule, r = 0.17, farbe = 0x1d1d1f, dicke = 0.02) {
  const g = new THREE.Group();
  const achse = mitte.clone().sub(saeule), l = achse.length();
  const n = achse.clone().normalize();
  const rad = new THREE.Group();
  rad.add(teil(new THREE.TorusGeometry(r, dicke, 6, 24), farbe, { umriss: 0.001 }));
  rad.add(teil(new THREE.CylinderGeometry(r * 0.22, r * 0.22, dicke * 1.6, 12), farbe, { umriss: false }).rotateX(Math.PI / 2));
  for (const w of [0, Math.PI * 0.85, Math.PI * 1.15]) { const sp = teil(new THREE.BoxGeometry(dicke * 0.9, r, dicke * 0.7), farbe, { umriss: false }); sp.position.set(Math.sin(w) * r / 2, -Math.cos(w) * r / 2, 0); sp.rotation.z = w; rad.add(sp); }
  rad.position.copy(mitte);
  rad.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n.clone().negate());
  g.add(rad);
  const s = teil(new THREE.CylinderGeometry(dicke * 1.2, dicke * 1.5, l, 8), farbe, { umriss: false });
  s.position.copy(saeule).add(mitte).multiplyScalar(0.5);
  s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
  g.add(s);
  return g;
}
