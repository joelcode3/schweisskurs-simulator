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
        attribute vec3 umrissNormal;
        void main() {
          vec3 p = position + umrissNormal * dicke;
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

// Für den Umriss gemittelte Normalen pro Eckpunkt (alle Flächen, die sich an einer Position treffen): so bleibt die
// aufgeblasene Hülle an Kanten geschlossen und liegt eng am Teil. Mit den harten Flächennormalen (Quader!) fielen die
// Hüllen-Flächen an jeder Kante auseinander, der schwarze Rand sah aus, als hätte er Abstand zum Teil.
function umrissNormalen(geo) {
  if (geo.attributes.umrissNormal) return;
  const pos = geo.attributes.position, n = pos.count, idx = geo.index;
  const schl = new Array(n), summe = new Map();
  for (let i = 0; i < n; i++) schl[i] = `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  const dreiecke = idx ? idx.count / 3 : n / 3;
  for (let t = 0; t < dreiecke; t++) {
    const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
    a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2);
    ab.subVectors(b, a); ac.subVectors(c, a); ab.cross(ac); // Länge = doppelte Fläche (große Flächen zählen mehr)
    if (ab.lengthSq() < 1e-14) continue;
    ab.normalize(); // jede angrenzende Fläche gleich stark, sonst kippt die Hülle an kleinen Fasen weg
    for (const i of [i0, i1, i2]) { const k = schl[i]; const v = summe.get(k); if (v) { if (!v.some((w) => w.dot(ab) > 0.999)) v.push(ab.clone()); } else summe.set(k, [ab.clone()]); }
  }
  const nor = geo.attributes.normal, arr = new Float32Array(n * 3), m = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const liste = summe.get(schl[i]);
    m.set(0, 0, 0);
    if (liste) for (const w of liste) m.add(w);
    if (m.lengthSq() < 1e-8) { if (nor) m.fromBufferAttribute(nor, i); else m.set(0, 1, 0); }
    m.normalize();
    arr[i * 3] = m.x; arr[i * 3 + 1] = m.y; arr[i * 3 + 2] = m.z;
  }
  geo.setAttribute('umrissNormal', new THREE.BufferAttribute(arr, 3));
}

export function umriss(mesh, dicke = 0.012) {
  umrissNormalen(mesh.geometry);
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

// Bierflasche (0,33 l, braun): gedrehtes Glasprofil mit Schulter und Hals, Wulst am Mund, Bauch- und Halsetikett,
// Glanzstreifen; mit Kronkorken (gezackter Rand) oder leer ohne. Ursprung = Mitte des Bauchs (wie die alten Flaschen).
let bierEtikett = null;
export function bierflasche({ korken = true, glasMat = null } = {}) {
  const f = new THREE.Group();
  const prof = [[0, -0.075], [0.026, -0.075], [0.03, -0.071], [0.03, 0.045], [0.028, 0.062], [0.021, 0.08], [0.014, 0.098],
    [0.0125, 0.112], [0.0125, 0.148], [0.0142, 0.151], [0.0142, 0.157], [0.0115, 0.158], [0, 0.158]].map(([x, y]) => new THREE.Vector2(x, y));
  const glas = glasMat || toon(0x5a2e0e, { transparent: true, opacity: 0.93 });
  f.add(teil(new THREE.LatheGeometry(prof, 18), 0, { material: glas, umriss: 0.002 }));
  if (!bierEtikett) bierEtikett = leinwandTextur(256, 64, (g, b, h) => {
    g.fillStyle = '#f2e6c4'; g.fillRect(0, 0, b, h);
    g.fillStyle = '#c8352a'; g.fillRect(0, 0, b, 10); g.fillRect(0, h - 10, b, 10);
    g.fillStyle = '#1d1d1f'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const x of [64, 192]) { g.fillText('PILS', x, h / 2 + 1); g.strokeStyle = '#b08a2a'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, h / 2, 40, 17, 0, 0, Math.PI * 2); g.stroke(); }
  });
  const etikett = new THREE.Mesh(new THREE.CylinderGeometry(0.0306, 0.0306, 0.058, 18, 1, true), toon(0xffffff, { map: bierEtikett }));
  etikett.position.y = -0.015; f.add(etikett);
  const hals = new THREE.Mesh(new THREE.CylinderGeometry(0.0131, 0.0136, 0.026, 14, 1, true), toon(0xc8352a));
  hals.position.y = 0.128; f.add(hals);
  f.add(setze(new THREE.Mesh(new THREE.CylinderGeometry(0.0131, 0.0131, 0.004, 14, 1, true), toon(0xd9b44a)), 0, 0.139, 0));
  const glanz = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false }));
  glanz.position.set(-0.012, 0.0, 0.027); glanz.rotation.y = -0.4; f.add(glanz);
  if (korken) {
    f.add(setze(zylinder(0.0148, 0.0148, 0.007, 0xd9b44a, { umriss: 0.001 }, 21), 0, 0.161, 0));
    for (let k = 0; k < 21; k++) { const w = (k / 21) * Math.PI * 2; f.add(setze(quader(0.003, 0.006, 0.002, 0xb8952f, { umriss: false }), Math.cos(w) * 0.0152, 0.159, Math.sin(w) * 0.0152, 0, -w, 0)); }
  }
  return f;
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
