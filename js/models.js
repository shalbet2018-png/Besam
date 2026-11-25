// Low-poly 3D models for the Besam Logistics background scene and rendered images.
// Everything is built from primitives in code, so there are no model files to load.
import * as THREE from './vendor/three.module.min.js';

export const PALETTE = {
  crimson: 0x821d11,
  green: 0x0f4c25,
  maroon: 0x2a0a0b,
  ink: 0x1d0814,
  steel: 0x2b2b31,
  steelLight: 0x6d6d78,
  glass: 0x9fd3e6,
  murram: 0x9a3d1c,
  murramLight: 0xc08a5a,
  sand: 0xad7d4e,
  ballast: 0x8a8a92,
  ground: 0x2a0a0b,
  amber: 0xd9a36a,
};

const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.75, metalness: 0.1, ...opts });

function box(w, h, d, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, seg, material) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material);
  m.castShadow = true;
  return m;
}

/* ---------------- Excavator ---------------- */
// Forward is +z. Call excavator.userData.animate(t) every frame.
export function makeExcavator() {
  const body = mat(PALETTE.crimson, { roughness: 0.5, metalness: 0.25 });
  const dark = mat(PALETTE.steel, { roughness: 0.9 });
  const metal = mat(PALETTE.steelLight, { metalness: 0.6, roughness: 0.4 });
  const glass = mat(PALETTE.glass, { roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.75 });
  const root = new THREE.Group();

  // Undercarriage: two tracks with rollers.
  for (const x of [-0.95, 0.95]) {
    const track = box(0.7, 0.62, 3.3, dark);
    track.position.set(x, 0.31, 0);
    root.add(track);
    for (let i = -1; i <= 1; i++) {
      const roller = cyl(0.22, 0.22, 0.74, 10, metal);
      roller.rotation.z = Math.PI / 2;
      roller.position.set(x, 0.3, i * 1.15);
      root.add(roller);
    }
  }
  const frame = box(1.3, 0.35, 1.6, dark);
  frame.position.y = 0.65;
  root.add(frame);

  // Upper house, slews on the frame.
  const upper = new THREE.Group();
  upper.position.y = 0.85;
  root.add(upper);
  const house = box(2.3, 0.85, 2.2, body);
  house.position.set(0, 0.45, -0.35);
  upper.add(house);
  const counter = box(2.3, 0.7, 0.55, dark);
  counter.position.set(0, 0.5, -1.55);
  upper.add(counter);
  const cab = box(0.95, 1.15, 1.05, body);
  cab.position.set(-0.62, 1.4, 0.3);
  upper.add(cab);
  const win = box(0.85, 0.75, 0.05, glass);
  win.position.set(-0.62, 1.55, 0.84);
  upper.add(win);
  const sideWin = box(0.05, 0.7, 0.8, glass);
  sideWin.position.set(-1.1, 1.55, 0.3);
  upper.add(sideWin);
  const stack = cyl(0.07, 0.07, 0.5, 8, dark);
  stack.position.set(0.75, 1.1, -1.1);
  upper.add(stack);
  const beacon = cyl(0.09, 0.09, 0.12, 8, new THREE.MeshStandardMaterial({ color: PALETTE.amber, emissive: PALETTE.amber, emissiveIntensity: 2 }));
  beacon.position.set(-0.62, 2.04, 0.3);
  upper.add(beacon);

  // Boom -> stick -> bucket chain, each a pivoting group.
  const boom = new THREE.Group();
  boom.position.set(0.35, 0.75, 0.6);
  upper.add(boom);
  const boomMesh = box(0.34, 0.42, 2.9, body);
  boomMesh.position.z = 1.45;
  boom.add(boomMesh);
  const ram = cyl(0.08, 0.08, 1.6, 8, metal);
  ram.rotation.x = Math.PI / 2;
  ram.position.set(0, -0.3, 0.9);
  boom.add(ram);

  const stick = new THREE.Group();
  stick.position.z = 2.9;
  boom.add(stick);
  const stickMesh = box(0.26, 0.32, 2.0, body);
  stickMesh.position.z = 1.0;
  stick.add(stickMesh);

  const bucket = new THREE.Group();
  bucket.position.z = 2.0;
  stick.add(bucket);
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.7, 12, 1, true, 0, Math.PI),
    mat(PALETTE.steel, { side: THREE.DoubleSide, metalness: 0.5 })
  );
  shell.rotation.z = Math.PI / 2;
  shell.position.set(0, 0, 0.35);
  shell.castShadow = true;
  bucket.add(shell);
  for (let i = -2; i <= 2; i++) {
    const tooth = box(0.07, 0.07, 0.22, metal);
    tooth.position.set(i * 0.14, -0.42, 0.75);
    bucket.add(tooth);
  }
  const scoop = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), mat(PALETTE.murram));
  scoop.position.set(0, -0.12, 0.35);
  scoop.scale.set(1, 0.6, 1);
  bucket.add(scoop);

  root.userData = {
    upper, boom, stick, bucket, scoop,
    // A dig-lift-swing-dump cycle, driven by time.
    animate(t) {
      const c = t * 0.55;
      const phase = (Math.sin(c) + 1) / 2; // 0 dig, 1 dump
      upper.rotation.y = -0.2 + phase * 1.2;
      boom.rotation.x = -0.25 - phase * 0.45 + Math.sin(c * 2) * 0.05;
      stick.rotation.x = 1.25 - phase * 0.55;
      bucket.rotation.x = 1.3 - phase * 1.4 + Math.max(0, Math.sin(c + 0.4)) * 0.4;
      scoop.visible = Math.cos(c) > -0.2 || phase < 0.8;
    },
  };
  root.userData.animate(0);
  return root;
}

/* ---------------- Tipper truck ---------------- */
export function makeTruck({ loaded = true, color = PALETTE.crimson } = {}) {
  const body = mat(color, { roughness: 0.45, metalness: 0.3 });
  const dark = mat(PALETTE.steel, { roughness: 0.9 });
  const metal = mat(PALETTE.steelLight, { metalness: 0.6, roughness: 0.4 });
  const glass = mat(PALETTE.glass, { roughness: 0.1, metalness: 0.5 });
  const light = new THREE.MeshStandardMaterial({ color: 0xfff2c2, emissive: 0xfff2c2, emissiveIntensity: 1.6 });
  const root = new THREE.Group();

  const chassis = box(1.5, 0.3, 5.2, dark);
  chassis.position.y = 0.75;
  root.add(chassis);

  const cab = box(1.9, 1.5, 1.4, body);
  cab.position.set(0, 1.6, 1.9);
  root.add(cab);
  const nose = box(1.9, 0.75, 0.5, body);
  nose.position.set(0, 1.15, 2.75);
  root.add(nose);
  const wind = box(1.6, 0.6, 0.05, glass);
  wind.position.set(0, 1.95, 2.61);
  wind.rotation.x = -0.12;
  root.add(wind);
  for (const x of [-0.65, 0.65]) {
    const lamp = box(0.32, 0.16, 0.05, light);
    lamp.position.set(x, 1.05, 3.01);
    root.add(lamp);
  }
  const grille = box(1.0, 0.35, 0.04, metal);
  grille.position.set(0, 1.12, 3.01);
  root.add(grille);

  // Tipping bed pivots at the back.
  const tip = new THREE.Group();
  tip.position.set(0, 0.95, -2.5);
  root.add(tip);
  const bedBase = box(2.0, 0.15, 3.6, body);
  bedBase.position.set(0, 0.1, 1.8);
  tip.add(bedBase);
  for (const x of [-0.95, 0.95]) {
    const side = box(0.1, 0.9, 3.6, body);
    side.position.set(x, 0.6, 1.8);
    tip.add(side);
  }
  const front = box(2.0, 1.1, 0.12, body);
  front.position.set(0, 0.7, 3.55);
  tip.add(front);
  const tail = box(2.0, 0.85, 0.1, dark);
  tail.position.set(0, 0.6, 0.05);
  tip.add(tail);
  if (loaded) {
    const heap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.9, 7), mat(PALETTE.murram));
    heap.scale.set(0.6, 1, 1.05);
    heap.position.set(0, 0.95, 1.8);
    heap.castShadow = true;
    tip.add(heap);
  }

  const wheels = [];
  for (const z of [2.0, -1.2, -2.3]) {
    for (const x of [-0.95, 0.95]) {
      const w = cyl(0.5, 0.5, 0.42, 14, dark);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.5, z);
      root.add(w);
      const hub = cyl(0.22, 0.22, 0.44, 8, metal);
      hub.rotation.z = Math.PI / 2;
      hub.position.copy(w.position);
      root.add(hub);
      wheels.push(w, hub);
    }
  }

  root.userData = {
    tip,
    wheels,
    setTip(a) { tip.rotation.x = -a; },
    spin(d) { wheels.forEach((w) => (w.rotation.x += d)); },
  };
  return root;
}

/* ---------------- Wheel loader (5-ton shovel) ---------------- */
export function makeLoader() {
  const body = mat(PALETTE.crimson, { roughness: 0.5, metalness: 0.25 });
  const dark = mat(PALETTE.steel, { roughness: 0.9 });
  const metal = mat(PALETTE.steelLight, { metalness: 0.6, roughness: 0.4 });
  const glass = mat(PALETTE.glass, { roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.8 });
  const root = new THREE.Group();
  const rear = box(1.8, 1.1, 2.0, body);
  rear.position.set(0, 1.25, -1.0);
  root.add(rear);
  const frontFrame = box(1.4, 0.7, 1.4, body);
  frontFrame.position.set(0, 1.0, 0.8);
  root.add(frontFrame);
  const cab = box(1.4, 1.3, 1.2, body);
  cab.position.set(0, 2.35, -0.3);
  root.add(cab);
  const cabGlass = box(1.3, 0.8, 1.22, glass);
  cabGlass.position.set(0, 2.45, -0.3);
  root.add(cabGlass);
  for (const z of [1.0, -1.2]) {
    for (const x of [-1.05, 1.05]) {
      const w = cyl(0.72, 0.72, 0.55, 14, dark);
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.72, z);
      root.add(w);
    }
  }
  const arms = new THREE.Group();
  arms.position.set(0, 1.4, 1.2);
  root.add(arms);
  for (const x of [-0.6, 0.6]) {
    const a = box(0.18, 0.25, 2.0, body);
    a.position.set(x, 0, 1.0);
    arms.add(a);
  }
  const bucket = box(2.3, 1.0, 0.9, metal);
  bucket.position.set(0, -0.3, 2.2);
  arms.add(bucket);
  root.userData = {
    arms,
    animate(t) { arms.rotation.x = -0.35 + Math.sin(t * 0.8) * 0.3; },
  };
  return root;
}

/* ---------------- Material piles ---------------- */
export function makePile(color, radius = 2, height = 1.4, seed = 1) {
  const geo = new THREE.ConeGeometry(radius, height, 9, 3);
  const pos = geo.attributes.position;
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) - 0.5;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getY(i) < height / 2 - 0.01) {
      pos.setX(i, pos.getX(i) * (1 + rnd() * 0.25));
      pos.setZ(i, pos.getZ(i) * (1 + rnd() * 0.25));
      pos.setY(i, pos.getY(i) + rnd() * 0.15);
    }
  }
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat(color, { roughness: 1 }));
  m.position.y = height / 2 - 0.05;
  m.castShadow = true;
  m.receiveShadow = true;
  const g = new THREE.Group();
  g.add(m);
  return g;
}

/* ---------------- Glass and aluminium building ---------------- */
export function makeGlassBuilding({ floors = 4, bays = 5 } = {}) {
  const root = new THREE.Group();
  const frameMat = mat(0xc9ccd4, { metalness: 0.85, roughness: 0.25 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7fb6cc, metalness: 0.2, roughness: 0.05, transmission: 0.2, transparent: true, opacity: 0.6, envMapIntensity: 1,
  });
  const core = box(bays * 1.6, floors * 1.8, 4, mat(0x1d1d22));
  core.position.y = (floors * 1.8) / 2;
  root.add(core);
  const W = bays * 1.6;
  for (let f = 0; f < floors; f++) {
    for (let b = 0; b < bays; b++) {
      const pane = box(1.5, 1.7, 0.05, glassMat);
      pane.position.set(-W / 2 + 0.8 + b * 1.6, 0.9 + f * 1.8, 2.03);
      root.add(pane);
    }
    const mullH = box(W + 0.1, 0.08, 0.12, frameMat);
    mullH.position.set(0, f * 1.8 + 0.02, 2.06);
    root.add(mullH);
  }
  for (let b = 0; b <= bays; b++) {
    const mullV = box(0.08, floors * 1.8, 0.12, frameMat);
    mullV.position.set(-W / 2 + b * 1.6, (floors * 1.8) / 2, 2.06);
    root.add(mullV);
  }
  const roof = box(W + 0.4, 0.25, 4.4, frameMat);
  roof.position.y = floors * 1.8 + 0.12;
  root.add(roof);
  // Stainless balustrade along a front deck.
  const deck = box(W + 1, 0.15, 1.6, mat(0x2a2a2f));
  deck.position.set(0, 0.07, 2.9);
  root.add(deck);
  const rail = cyl(0.04, 0.04, W + 1, 8, frameMat);
  rail.rotation.z = Math.PI / 2;
  rail.position.set(0, 1.05, 3.65);
  root.add(rail);
  for (let i = 0; i <= bays * 2; i++) {
    const post = cyl(0.03, 0.03, 1.0, 6, frameMat);
    post.position.set(-(W + 1) / 2 + i * ((W + 1) / (bays * 2)), 0.55, 3.65);
    root.add(post);
  }
  const railGlass = box(W + 1, 0.8, 0.03, glassMat);
  railGlass.position.set(0, 0.55, 3.6);
  root.add(railGlass);
  return root;
}

/* ---------------- Ringed planet ---------------- */
// A murram-coloured planet with a Saturn-like ring of tumbling rocks.
export function makeRingedPlanet({ radius = 9, rocks = 1400 } = {}) {
  const root = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(radius, 4);
  const pos = geo.attributes.position;
  const colors = [];
  const c1 = new THREE.Color(PALETTE.murram);
  const c2 = new THREE.Color(PALETTE.maroon);
  const c3 = new THREE.Color(PALETTE.murramLight);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const n = Math.sin(v.x * 7.1) * Math.cos(v.y * 5.3) + Math.sin(v.z * 9.7 + v.y * 3.1) * 0.6;
    const band = Math.sin(v.y * 14) * 0.5 + 0.5;
    v.multiplyScalar(radius * (1 + n * 0.015));
    pos.setXYZ(i, v.x, v.y, v.z);
    const c = c1.clone().lerp(c2, band * 0.55).lerp(c3, Math.max(0, n) * 0.4);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const planet = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  root.add(planet);

  // Thin glowing ring disc.
  const ringGeo = new THREE.RingGeometry(radius * 1.35, radius * 2.25, 128, 1);
  const ringMat = new THREE.MeshBasicMaterial({ color: PALETTE.crimson, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false });
  const disc = new THREE.Mesh(ringGeo, ringMat);
  disc.rotation.x = -Math.PI / 2;

  const ring = new THREE.Group();
  ring.add(disc);

  // Rock belt: instanced gravel, ballast and murram chunks.
  const rockGeo = new THREE.DodecahedronGeometry(0.18, 0);
  const rockMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 });
  const belt = new THREE.InstancedMesh(rockGeo, rockMat, rocks);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const tones = [PALETTE.ballast, PALETTE.murram, PALETTE.sand, PALETTE.crimson, PALETTE.green, PALETTE.murramLight];
  const col = new THREE.Color();
  for (let i = 0; i < rocks; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = radius * (1.4 + Math.pow(Math.random(), 0.8) * 0.85);
    p.set(Math.cos(a) * r, (Math.random() - 0.5) * 0.6, Math.sin(a) * r);
    e.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
    q.setFromEuler(e);
    const k = 0.4 + Math.random() * 1.8;
    s.set(k, k * (0.6 + Math.random() * 0.5), k);
    m4.compose(p, q, s);
    belt.setMatrixAt(i, m4);
    belt.setColorAt(i, col.set(tones[(Math.random() * tones.length) | 0]));
  }
  ring.add(belt);
  ring.rotation.set(0.42, 0, -0.28);
  root.add(ring);
  root.userData = { planet, ring, belt };
  return root;
}

/* ---------------- Terrain ---------------- */
export function makeTerrain({ size = 140, seg = 70 } = {}) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const colors = [];
  const a = new THREE.Color(PALETTE.ground);
  const b = new THREE.Color(0x4a1a10);
  const c = new THREE.Color(PALETTE.murram);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.sqrt(x * x + z * z);
    const hill = Math.sin(x * 0.11) * Math.cos(z * 0.09) * 1.2 + Math.sin(x * 0.31 + z * 0.17) * 0.35;
    const flat = Math.min(1, Math.max(0, (d - 16) / 18)); // flat working pad in the middle
    const y = hill * flat + Math.max(0, d - 45) * 0.12;
    pos.setY(i, y);
    const t = Math.min(1, Math.max(0, hill * 0.5 + 0.5));
    const k = a.clone().lerp(b, t).lerp(c, (1 - flat) * 0.35);
    colors.push(k.r, k.g, k.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }));
  m.receiveShadow = true;
  return m;
}

/* ---------------- Acacia-style tree ---------------- */
export function makeTree(scale = 1) {
  const g = new THREE.Group();
  const trunk = cyl(0.12, 0.2, 2.2, 6, mat(0x2a0a0b, { roughness: 1 }));
  trunk.position.y = 1.1;
  g.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), mat(PALETTE.green, { roughness: 0.9 }));
  crown.scale.set(1.5, 0.45, 1.5);
  crown.position.y = 2.4;
  crown.castShadow = true;
  g.add(crown);
  g.scale.setScalar(scale);
  return g;
}

export { THREE };
