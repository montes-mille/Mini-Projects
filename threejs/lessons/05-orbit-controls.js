// Lesson 5 — Camera Controls
// OrbitControls (from three's "addons") lets the user drag to rotate,
// scroll to zoom and right-drag to pan. Remember to call controls.update()
// every frame when damping (smooth easing) is enabled.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setup } from './setup.js';

export default function lesson(container) {
  const { scene, camera, renderer, tick } = setup(container);
  camera.position.set(6, 5, 8);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.5, 0);
  controls.maxPolarAngle = Math.PI / 2.05; // don't go below the floor

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 10, 3);
  scene.add(sun);

  // A GridHelper and AxesHelper make it easy to stay oriented.
  scene.add(new THREE.GridHelper(10, 10, 0x666666, 0x333333));
  scene.add(new THREE.AxesHelper(1.5)); // X = red, Y = green, Z = blue

  // A small "city" of random boxes to fly around.
  const material = new THREE.MeshStandardMaterial({ color: 0x8fb3ff });
  for (let i = 0; i < 40; i++) {
    const h = 0.3 + Math.random() * 2;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 0.6), material);
    box.position.set(
      Math.round((Math.random() - 0.5) * 8) + 0.5,
      h / 2,
      Math.round((Math.random() - 0.5) * 8) + 0.5,
    );
    scene.add(box);
  }

  tick(() => controls.update());
}
