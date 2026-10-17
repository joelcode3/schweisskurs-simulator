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
