// Lesson 4 — Animation & the Scene Graph
// Objects can be nested inside Groups. A child's position, rotation and
// scale are relative to its parent, so rotating the parent carries the child.
// Here: a sun spins, a planet orbits the sun, and a moon orbits the planet.
import * as THREE from 'three';
import { setup } from './setup.js';

export default function lesson(container) {
  const { scene, camera, tick } = setup(container, { background: 0x05060a });
  camera.position.set(0, 5, 8);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.15));
  const sunLight = new THREE.PointLight(0xffffff, 60, 0, 1.5);
  scene.add(sunLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xffcc33 }),
  );
  scene.add(sun);

  // An empty Group acts as an invisible "arm" that rotates around the sun.
  const earthOrbit = new THREE.Group();
  scene.add(earthOrbit);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 16),
    new THREE.MeshStandardMaterial({ color: 0x2f7cff }),
  );
  earth.position.x = 3.5; // distance from the sun
  earthOrbit.add(earth);

  const moonOrbit = new THREE.Group();
  earth.add(moonOrbit); // the moon's orbit is a child of the earth

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 8),
    new THREE.MeshStandardMaterial({ color: 0xbbbbbb }),
  );
  moon.position.x = 0.8;
  moonOrbit.add(moon);

  // Draw the earth's orbit path as a thin ring.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(3.48, 3.52, 128),
    new THREE.MeshBasicMaterial({ color: 0x444a5a, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  scene.add(ring);

  // Use delta time (seconds since last frame) so speed is the same
  // on 60 Hz and 144 Hz screens.
  tick((dt) => {
    sun.rotation.y += dt * 0.2;
    earthOrbit.rotation.y += dt * 0.5;
    earth.rotation.y += dt * 2;
    moonOrbit.rotation.y += dt * 2.5;
  });
}
