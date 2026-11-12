// Lesson 3 — Lights & Shadows
// Lights give a scene depth. Shadows must be switched on in three places:
// the renderer, the light that casts them, and each mesh (cast / receive).
import * as THREE from 'three';
import { setup } from './setup.js';

export default function lesson(container) {
  const { scene, camera, renderer, tick } = setup(container);
  camera.position.set(0, 3, 6);
  camera.lookAt(0, 0, 0);

  renderer.shadowMap.enabled = true; // (1) renderer

  // A soft fill light from everywhere, so shadows are never pitch black.
  scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x2a1f14, 0.6));

  // A coloured point light that orbits the scene.
  const lamp = new THREE.PointLight(0xffb347, 40, 20);
  lamp.castShadow = true; // (2) light
  lamp.shadow.mapSize.set(1024, 1024);
  scene.add(lamp);

  // A small glowing ball so we can see where the light is.
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.08),
    new THREE.MeshBasicMaterial({ color: 0xffb347 }),
  );
  lamp.add(bulb); // children move with their parent

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshStandardMaterial({ color: 0x3a3f4b }),
  );
  floor.rotation.x = -Math.PI / 2; // planes face +Z by default; lay it flat
  floor.receiveShadow = true;      // (3) mesh receives
  scene.add(floor);

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.6, 0.2, 160, 24),
    new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.35 }),
  );
  knot.position.y = 1.1;
  knot.castShadow = true;          // (3) mesh casts
  scene.add(knot);

  tick((dt, t) => {
    lamp.position.set(Math.cos(t) * 2.5, 2.2, Math.sin(t) * 2.5);
    knot.rotation.y += dt * 0.4;
  });
}
