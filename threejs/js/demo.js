// User Demo — an interactive three.js playground.
// Combines every tutorial lesson: meshes & materials (2), lights & shadows (3),
// animation (4), OrbitControls (5) and raycasting (6), plus a lil-gui panel.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

// ---------------------------------------------------------------- setup ----
const app = document.getElementById('app');
const statusEl = document.getElementById('status');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b2030);
scene.fog = new THREE.Fog(0x1b2030, 25, 60);

const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(9, 7, 11);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 3;
controls.maxDistance = 40;

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --------------------------------------------------------------- lights ----
const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x3b2f2a, 0.8);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -15, right: 15, top: 15, bottom: -15, far: 60 });
scene.add(sun, sun.target);

// ---------------------------------------------------------------- floor ----
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x2c3345, roughness: 0.9 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(30, 30, 0x55607a, 0x3a4256);
grid.position.y = 0.01;
scene.add(grid);

// ---------------------------------------------------------------- shapes ---
const GEOMETRIES = {
  Cube: () => new THREE.BoxGeometry(1, 1, 1),
  Sphere: () => new THREE.SphereGeometry(0.6, 48, 24),
  Cone: () => new THREE.ConeGeometry(0.6, 1.2, 48),
  Cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1.2, 48),
  Torus: () => new THREE.TorusGeometry(0.5, 0.2, 24, 64),
  'Torus knot': () => new THREE.TorusKnotGeometry(0.45, 0.16, 128, 24),
  Icosahedron: () => new THREE.IcosahedronGeometry(0.65, 0),
};

const shapes = []; // every spawned mesh

function spawn(type, position, color) {
  const geometry = GEOMETRIES[type]();
  geometry.computeBoundingBox();
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.1 }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = type;
  // Lift so the shape rests on the floor; then drop it in from above.
  mesh.userData.restY = -geometry.boundingBox.min.y;
  mesh.userData.vy = 0;
  mesh.userData.spin = settings.spin ? (Math.random() - 0.5) * 2 : 0;
  mesh.position.set(position.x, 6 + Math.random() * 2, position.z);
  scene.add(mesh);
  shapes.push(mesh);
  updateStatus();
  return mesh;
}

function remove(mesh) {
  if (!mesh) return;
  if (mesh === selected) select(null);
  scene.remove(mesh);
  mesh.geometry.dispose(); // free GPU memory
  mesh.material.dispose();
  shapes.splice(shapes.indexOf(mesh), 1);
  updateStatus();
}

function randomColor() {
  return new THREE.Color().setHSL(Math.random(), 0.65, 0.55);
}

// ------------------------------------------------------------- selection ---
let selected = null;
const selectionBox = new THREE.BoxHelper(undefined, 0xffd166);
selectionBox.visible = false;
scene.add(selectionBox);

// Values the "Selected" GUI folder edits.
const edit = { color: '#ffffff', roughness: 0.4, metalness: 0.1, wireframe: false, scale: 1, delete: () => remove(selected) };

function select(mesh) {
  selected = mesh;
  selectionBox.visible = !!mesh;
  if (mesh) {
    selectionBox.setFromObject(mesh);
    edit.color = '#' + mesh.material.color.getHexString();
    edit.roughness = mesh.material.roughness;
    edit.metalness = mesh.material.metalness;
    edit.wireframe = mesh.material.wireframe;
    edit.scale = mesh.scale.x;
    selectedFolder.title(`Selected: ${mesh.name}`);
    selectedFolder.show();
    selectedFolder.controllersRecursive().forEach((c) => c.updateDisplay());
  } else {
    selectedFolder.hide();
  }
  updateStatus();
}

function updateStatus() {
  statusEl.textContent = `${shapes.length} shape${shapes.length === 1 ? '' : 's'}` +
    (selected ? ` · selected: ${selected.name}` : '');
}

// ----------------------------------------------------------------- input ---
// Only treat it as a click if the pointer barely moved (otherwise it was an orbit drag).
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const down = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (e) => down.set(e.clientX, e.clientY));
renderer.domElement.addEventListener('pointerup', (e) => {
  if (down.distanceTo(new THREE.Vector2(e.clientX, e.clientY)) > 5) return;

  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);

  const hitShape = raycaster.intersectObjects(shapes)[0];
  if (hitShape) return select(hitShape.object);

  const hitFloor = raycaster.intersectObject(floor)[0];
  if (hitFloor) {
    const color = settings.randomColor ? randomColor() : new THREE.Color(settings.color);
    select(spawn(settings.shape, hitFloor.point, color));
  }
});

addEventListener('keydown', (e) => {
  if (e.target.closest?.('.lil-gui')) return; // typing in the panel
  if (e.key === 'Delete' || e.key === 'Backspace') remove(selected);
  if (e.key === 'Escape') select(null);
});

// ------------------------------------------------------------------- GUI ---
const settings = {
  shape: 'Cube',
  randomColor: true,
  color: '#4f9dff',
  spin: true,
  sunIntensity: sun.intensity,
  timeOfDay: 0.35, // 0 = sunrise, 0.5 = noon, 1 = sunset
  ambient: hemi.intensity,
  shadows: true,
  grid: true,
  autoRotate: false,
  rain: () => {
    for (let i = 0; i < 15; i++) {
      const types = Object.keys(GEOMETRIES);
      spawn(types[Math.floor(Math.random() * types.length)],
        new THREE.Vector3((Math.random() - 0.5) * 16, 0, (Math.random() - 0.5) * 16),
        randomColor());
    }
  },
  clear: () => [...shapes].forEach(remove),
  screenshot: () => {
    const a = document.createElement('a');
    a.href = renderer.domElement.toDataURL('image/png');
    a.download = 'threejs-demo.png';
    a.click();
  },
};

const gui = new GUI({ title: 'Playground' });

const spawnFolder = gui.addFolder('Spawn');
spawnFolder.add(settings, 'shape', Object.keys(GEOMETRIES)).name('Shape on click');
spawnFolder.add(settings, 'randomColor').name('Random colour');
spawnFolder.addColor(settings, 'color').name('Colour');
spawnFolder.add(settings, 'spin').name('Spin new shapes');
spawnFolder.add(settings, 'rain').name('🌧 Make it rain');
spawnFolder.add(settings, 'clear').name('🗑 Clear all');

const selectedFolder = gui.addFolder('Selected');
selectedFolder.addColor(edit, 'color').name('Colour')
  .onChange((v) => selected?.material.color.set(v));
selectedFolder.add(edit, 'roughness', 0, 1, 0.01).name('Roughness')
  .onChange((v) => { if (selected) selected.material.roughness = v; });
selectedFolder.add(edit, 'metalness', 0, 1, 0.01).name('Metalness')
  .onChange((v) => { if (selected) selected.material.metalness = v; });
selectedFolder.add(edit, 'wireframe').name('Wireframe')
  .onChange((v) => { if (selected) selected.material.wireframe = v; });
selectedFolder.add(edit, 'scale', 0.3, 3, 0.05).name('Scale')
  .onChange((v) => {
    if (!selected) return;
    selected.scale.setScalar(v);
    selected.userData.vy = 0;
    selected.position.y = selected.userData.restY * v;
  });
selectedFolder.add(edit, 'delete').name('Delete');
selectedFolder.hide();

const worldFolder = gui.addFolder('World');
worldFolder.add(settings, 'timeOfDay', 0, 1, 0.01).name('Time of day').onChange(updateSun);
worldFolder.add(settings, 'sunIntensity', 0, 5, 0.1).name('Sun').onChange(updateSun);
worldFolder.add(settings, 'ambient', 0, 3, 0.05).name('Ambient')
  .onChange((v) => { hemi.intensity = v; });
worldFolder.add(settings, 'shadows').name('Shadows')
  .onChange((v) => { sun.castShadow = v; });
worldFolder.add(settings, 'grid').name('Grid')
  .onChange((v) => { grid.visible = v; });
worldFolder.add(settings, 'autoRotate').name('Auto-rotate camera')
  .onChange((v) => { controls.autoRotate = v; });
worldFolder.add(settings, 'screenshot').name('📷 Screenshot');

if (innerWidth < 700) gui.close();

// Move the sun across the sky and warm its colour near sunrise/sunset.
function updateSun() {
  const angle = settings.timeOfDay * Math.PI;
  sun.position.set(Math.cos(angle) * 20, Math.sin(angle) * 18 + 1, 6);
  const warmth = 1 - Math.sin(angle); // 0 at noon, 1 at the horizon
  sun.color.setHSL(0.1, warmth * 0.8, 0.5 + (1 - warmth) * 0.5);
  sun.intensity = settings.sunIntensity * (0.3 + 0.7 * Math.sin(angle));
}
updateSun();

// ------------------------------------------------------------ animation ---
const GRAVITY = -25;
const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05); // clamp after tab switches

  for (const m of shapes) {
    const floorY = m.userData.restY * m.scale.y;
    if (m.position.y > floorY || m.userData.vy > 0) {
      // Simple falling + bouncing physics.
      m.userData.vy += GRAVITY * dt;
      m.position.y += m.userData.vy * dt;
      if (m.position.y <= floorY) {
        m.position.y = floorY;
        m.userData.vy = Math.abs(m.userData.vy) > 2 ? -m.userData.vy * 0.45 : 0;
      }
    }
    m.rotation.y += m.userData.spin * dt;
  }

  if (selected) selectionBox.setFromObject(selected);
  controls.update();
  renderer.render(scene, camera);
});

// Start with a few shapes so the scene isn't empty.
['Cube', 'Sphere', 'Torus knot', 'Cone', 'Icosahedron'].forEach((type, i) => {
  const a = (i / 5) * Math.PI * 2;
  spawn(type, new THREE.Vector3(Math.cos(a) * 3, 0, Math.sin(a) * 3), randomColor());
});
