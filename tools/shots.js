// Renders one still "photo" per ?shot= value. Used by tools/render-images.mjs
// to make the placeholder images in /images until Besam's real photos arrive.
import {
  THREE, PALETTE, makeExcavator, makeTruck, makeLoader, makePile, makeGlassBuilding, makeRingedPlanet, makeTerrain,
} from '../js/models.js';

const shot = new URLSearchParams(location.search).get('shot') || 'excavator';
const W = 1600, H = 1000;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 800);

function sky(top, bottom) {
  const g = new THREE.SphereGeometry(400, 32, 16);
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 bottom; varying vec3 vP; void main(){ float h = smoothstep(-0.05,0.6,vP.y); gl_FragColor = vec4(mix(bottom, top, h),1.0); }',
  });
  scene.add(new THREE.Mesh(g, m));
}

function lights({ sunColor = 0xffc48a, sunPos = [-20, 25, 15], intensity = 3 } = {}) {
  scene.add(new THREE.HemisphereLight(0xaac4ff, 0x40160c, 0.8));
  const sun = new THREE.DirectionalLight(sunColor, intensity);
  sun.position.set(...sunPos);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, near: 1, far: 120 });
  scene.add(sun);
  const rim = new THREE.DirectionalLight(PALETTE.crimson, 1.6);
  rim.position.set(18, 6, -20);
  scene.add(rim);
}

const ground = () => { const t = makeTerrain({ seg: 90 }); scene.add(t); return t; };

const shots = {
  excavator() {
    sky(0x2a0c1f, 0xf08a4b);
    scene.fog = new THREE.Fog(0xd77a4b, 25, 110);
    lights({ sunPos: [-30, 14, 10] });
    ground();
    const ex = makeExcavator();
    ex.rotation.y = 0.5;
    ex.userData.animate(4.6);
    scene.add(ex);
    const p = makePile(PALETTE.murram, 3, 2.2, 3); p.position.set(4, 0, 4); scene.add(p);
    const t = makeTruck(); t.position.set(-6, 0, 5); t.rotation.y = 1.9; scene.add(t);
    camera.position.set(9, 3.2, 11); camera.lookAt(0, 1.8, 1.5);
  },
  loader() {
    sky(0x1d0a22, 0xe56b45);
    scene.fog = new THREE.Fog(0xc96a49, 20, 100);
    lights({ sunPos: [25, 16, 12] });
    ground();
    const l = makeLoader(); l.rotation.y = -0.6; l.userData.arms.rotation.x = 0.32; scene.add(l);
    const p = makePile(PALETTE.sand, 3.4, 2.4, 5); p.position.set(-5, 0, 5); scene.add(p);
    camera.position.set(7, 3, 9); camera.lookAt(0, 1.5, 1);
  },
  truck() {
    sky(0x170818, 0xff9a52);
    scene.fog = new THREE.Fog(0xe0844f, 30, 140);
    lights({ sunPos: [-40, 10, -10], intensity: 3.4 });
    ground();
    const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 300), new THREE.MeshStandardMaterial({ color: 0x1c1b1e, roughness: 0.9 }));
    road.rotation.x = -Math.PI / 2; road.position.y = 0.04; road.receiveShadow = true; scene.add(road);
    for (let i = -40; i < 40; i++) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.6), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
      d.rotation.x = -Math.PI / 2; d.position.set(0, 0.06, i * 4); scene.add(d);
    }
    [[-1.6, 2], [1.6, -12]].forEach(([x, z], i) => {
      const t = makeTruck({ color: i ? PALETTE.maroon : PALETTE.crimson });
      t.position.set(x, 0, z); t.rotation.y = i ? Math.PI : 0; scene.add(t);
    });
    camera.position.set(6, 2.2, 10); camera.lookAt(-1, 1.4, -2);
  },
  materials() {
    sky(0x231022, 0xf2a35e);
    scene.fog = new THREE.Fog(0xd98a58, 25, 110);
    lights({ sunPos: [-18, 20, 20] });
    ground();
    [[PALETTE.murram, -6, 0], [PALETTE.sand, 0, -1], [PALETTE.ballast, 6, 0], [PALETTE.murramLight, 12, -2]].forEach(([c, x, z], i) => {
      const p = makePile(c, 2.6, 2.1, i + 7); p.position.set(x, 0, z); scene.add(p);
    });
    const t = makeTruck(); t.position.set(-11, 0, 3); t.rotation.y = 0.9; t.userData.setTip(0.6); scene.add(t);
    camera.position.set(3, 4, 15); camera.lookAt(1, 1, 0);
  },
  earthworks() {
    sky(0x16091c, 0xd66a4a);
    scene.fog = new THREE.Fog(0xb85d45, 30, 130);
    lights({ sunPos: [-10, 30, 25] });
    ground();
    const ex = makeExcavator(); ex.position.set(-3, 0, 0); ex.rotation.y = 1.2; ex.userData.animate(1.2); scene.add(ex);
    const ex2 = makeExcavator(); ex2.position.set(5, 0, -4); ex2.rotation.y = -0.7; ex2.userData.animate(3.9); scene.add(ex2);
    const pit = new THREE.Mesh(new THREE.BoxGeometry(8, 0.1, 5), new THREE.MeshStandardMaterial({ color: 0x2a0f0a }));
    pit.position.set(1, 0.03, 3); scene.add(pit);
    for (let i = 0; i < 4; i++) { const p = makePile(PALETTE.murram, 1.6, 1.1, 20 + i); p.position.set(-9 + i * 2.5, 0, -7); scene.add(p); }
    camera.position.set(10, 6.5, 12); camera.lookAt(0.5, 0.8, 0);
  },
  glass() {
    sky(0x0e1630, 0xf29a6a);
    scene.fog = new THREE.Fog(0xd88f73, 30, 150);
    lights({ sunPos: [-25, 18, 22], sunColor: 0xffd2a8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x2b2228, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const b = makeGlassBuilding({ floors: 4, bays: 6 }); scene.add(b);
    const b2 = makeGlassBuilding({ floors: 7, bays: 3 }); b2.position.set(-12, 0, -6); scene.add(b2);
    camera.position.set(9, 3, 15); camera.lookAt(-1, 3.5, 0);
  },
  planet() {
    sky(0x05030a, 0x2a0b1c);
    const st = new THREE.BufferGeometry(); const a = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(300); a.set([v.x, v.y, v.z], i * 3); }
    st.setAttribute('position', new THREE.BufferAttribute(a, 3));
    scene.add(new THREE.Points(st, new THREE.PointsMaterial({ color: 0xffffff, size: 1.3, sizeAttenuation: false })));
    lights({ sunPos: [-30, 10, 20] });
    const p = makeRingedPlanet({ radius: 9, rocks: 2600 }); scene.add(p);
    camera.position.set(0, 6, 46); camera.lookAt(0, 0, 0);
  },
};

(shots[shot] || shots.excavator)();
renderer.render(scene, camera);
document.body.dataset.done = '1';
