// Lesson 6 — Mouse Picking with a Raycaster
// To find what is under the mouse, shoot a ray from the camera through the
// pointer position and ask which objects it hits. Pointer coordinates must
// be converted to "normalized device coordinates": -1..+1 on both axes.
import * as THREE from 'three';
import { setup } from './setup.js';

export default function lesson(container) {
  const { scene, camera, renderer, tick } = setup(container);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(2, 3, 4);
  scene.add(sun);

  const BASE = new THREE.Color(0x3a4a6b);
  const HOVER = new THREE.Color(0xff9f1c);

  // A 7 x 4 grid of spheres, each with its own material so we can recolour it.
  const spheres = [];
  for (let x = -3; x <= 3; x++) {
    for (let y = -1.5; y <= 1.5; y++) {
      const s = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 32, 16),
        new THREE.MeshStandardMaterial({ color: BASE }),
      );
      s.position.set(x * 1.1, y * 1.1, 0);
      scene.add(s);
      spheres.push(s);
    }
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10); // start off-screen
  let hovered = null;

  renderer.domElement.addEventListener('pointermove', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // Y is flipped
  });
  renderer.domElement.addEventListener('pointerleave', () => pointer.set(10, 10));

  // Clicking a sphere makes it "pop" upward.
  renderer.domElement.addEventListener('click', () => {
    if (hovered) hovered.userData.pop = 1;
  });

  tick((dt) => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(spheres)[0]; // nearest first
    hovered = hit ? hit.object : null;
    renderer.domElement.style.cursor = hovered ? 'pointer' : '';

    for (const s of spheres) {
      // Smoothly blend colour and scale toward their target values.
      const target = s === hovered ? HOVER : BASE;
      s.material.color.lerp(target, Math.min(1, dt * 10));
      const scale = s === hovered ? 1.25 : 1;
      s.scale.setScalar(THREE.MathUtils.lerp(s.scale.x, scale, Math.min(1, dt * 10)));

      const pop = s.userData.pop || 0;
      s.position.z = Math.sin(pop * Math.PI) * 1.5;
      s.userData.pop = Math.max(0, pop - dt * 1.5);
    }
  });
}
