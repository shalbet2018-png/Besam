// The fixed 3D background: a working Besam yard under a ringed murram planet.
// The camera flies through the scene as the visitor scrolls.
import {
  THREE, PALETTE, makeExcavator, makeTruck, makeLoader, makePile, makeRingedPlanet, makeTerrain,
} from './models.js';

export function startScene(canvas) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.innerWidth < 760;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.shadowMap.enabled = !small;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x1a0710, 0.012);

  const camera = new THREE.PerspectiveCamera(small ? 62 : 50, window.innerWidth / window.innerHeight, 0.1, 600);

  // Light: warm low sun, crimson rim, cool sky fill.
  scene.add(new THREE.HemisphereLight(0x9fb4ff, 0x3a120c, 0.7));
  const sun = new THREE.DirectionalLight(0xffc48a, 2.6);
  sun.position.set(-25, 30, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
  scene.add(sun);
  const rim = new THREE.DirectionalLight(PALETTE.crimson, 2.2);
  rim.position.set(20, 8, -25);
  scene.add(rim);

  // Stars.
  const starGeo = new THREE.BufferGeometry();
  const starCount = small ? 600 : 1500;
  const sp = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 250 + Math.random() * 150;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.random() * Math.PI * 0.45;
    sp.set([r * Math.cos(th) * Math.sin(ph), r * Math.cos(ph) * 0.9 + 10, r * Math.sin(th) * Math.sin(ph)], i * 3);
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffe9f0, size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
  scene.add(stars);

  // Planet with its rock ring, hanging over the yard.
  const planet = makeRingedPlanet({ radius: 16, rocks: small ? 700 : 1800 });
  planet.position.set(38, 42, -95);
  planet.traverse((o) => { if (o.material) o.material.fog = false; });
  scene.add(planet);

  // The yard.
  const terrain = makeTerrain({ seg: small ? 40 : 70 });
  scene.add(terrain);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(13.2, 15.6, 96),
    new THREE.MeshStandardMaterial({ color: 0x1c1a1d, roughness: 0.95 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  road.receiveShadow = true;
  scene.add(road);
  // Dashed centre line.
  const dashes = new THREE.Group();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.9), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
    d.rotation.x = -Math.PI / 2;
    d.rotation.z = -a;
    d.position.set(Math.cos(a) * 14.4, 0.05, Math.sin(a) * 14.4);
    dashes.add(d);
  }
  scene.add(dashes);

  const excavator = makeExcavator();
  excavator.position.set(-2.5, 0, 0.5);
  excavator.rotation.y = 0.6;
  scene.add(excavator);

  const loader = makeLoader();
  loader.position.set(6, 0, -5);
  loader.rotation.y = -2.3;
  loader.scale.setScalar(0.9);
  scene.add(loader);

  const piles = [
    [PALETTE.murram, 3.2, 2.4, 4.5, 5.5],
    [PALETTE.sand, 2.4, 1.8, 8.5, 1.5],
    [PALETTE.ballast, 2.2, 1.6, -7.5, -6],
    [PALETTE.murramLight, 1.8, 1.2, -9, 3],
    [PALETTE.sand, 2.8, 1.9, 1, -9],
  ];
  piles.forEach(([c, r, h, x, z], i) => {
    const p = makePile(c, r, h, i + 2);
    p.position.set(x, 0, z);
    scene.add(p);
  });

  const trucks = [0, 1, 2].map((i) => {
    const t = makeTruck({ loaded: i !== 1, color: i === 2 ? PALETTE.maroon : PALETTE.crimson });
    t.scale.setScalar(0.85);
    scene.add(t);
    return { mesh: t, offset: (i / 3) * Math.PI * 2 };
  });

  // Floating dust.
  const dustCount = small ? 250 : 600;
  const dGeo = new THREE.BufferGeometry();
  const dp = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) dp.set([(Math.random() - 0.5) * 60, Math.random() * 14, (Math.random() - 0.5) * 60], i * 3);
  dGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffb08a, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false }));
  scene.add(dust);

  // Camera keyframes across the page scroll (0..1): [position, lookAt].
  const keys = [
    [[9, 5.5, 15], [-6.5, 2.4, -1]],   // hero: the excavator at work, framed to the right
    [[-16, 7, 10], [0, 1.5, 0]],       // services: orbit the yard
    [[-6, 2.6, -18], [4, 2, 0]],       // trucks pass low
    [[18, 14, -6], [0, 0, 0]],         // rise over the yard
    [[4, 22, 30], [20, 30, -80]],      // look up at the ringed planet
    [[0, 9, 26], [0, 2, 0]],           // settle back for contact
  ];
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), lA = new THREE.Vector3(), lB = new THREE.Vector3();
  const camPos = new THREE.Vector3(...keys[0][0]);
  const camLook = new THREE.Vector3(...keys[0][1]);
  const target = new THREE.Vector3(), targetLook = new THREE.Vector3();
  const ease = (x) => x * x * (3 - 2 * x);

  let scrollP = 0;
  const readScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  readScroll();
  window.addEventListener('scroll', readScroll, { passive: true });

  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function cameraFor(p) {
    const f = p * (keys.length - 1);
    const i = Math.min(keys.length - 2, Math.floor(f));
    const k = ease(f - i);
    vA.set(...keys[i][0]); vB.set(...keys[i + 1][0]);
    lA.set(...keys[i][1]); lB.set(...keys[i + 1][1]);
    target.copy(vA).lerp(vB, k);
    targetLook.copy(lA).lerp(lB, k);
  }

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let t = 0;
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { clock.getDelta(); loop(); }
  });

  function update(dt) {
    t += dt;
    excavator.userData.animate(t);
    loader.userData.animate(t + 1.5);
    trucks.forEach(({ mesh, offset }) => {
      const a = t * 0.12 + offset;
      const r = 14.4 + (offset > 3 ? 0.6 : -0.6);
      mesh.position.set(Math.cos(a) * r, 0.02, Math.sin(a) * r);
      mesh.rotation.y = -a; // tangent of the circle
      mesh.userData.spin(dt * 2.4);
    });
    planet.userData.planet.rotation.y += dt * 0.03;
    planet.userData.ring.rotation.y += dt * 0.05;
    dust.rotation.y += dt * 0.02;
    stars.rotation.y += dt * 0.002;

    cameraFor(scrollP);
    target.x += mouse.x * 0.8;
    target.y += -mouse.y * 0.4;
    const lerp = 1 - Math.pow(0.001, dt);
    camPos.lerp(target, lerp);
    camLook.lerp(targetLook, lerp);
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  }

  function loop() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    update(reduceMotion ? 0 : dt);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }

  // First frame, then reveal the canvas.
  update(0.016);
  renderer.render(scene, camera);
  canvas.classList.add('ready');
  loop();
}
