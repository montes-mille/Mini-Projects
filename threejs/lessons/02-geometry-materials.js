// Lesson 2 — Geometries & Materials
// three.js ships many built-in shapes. The same geometry can look very
// different depending on the material you give it.
import * as THREE from 'three';
import { setup } from './setup.js';

export default function lesson(container) {
  const { scene, camera, tick } = setup(container);
  camera.position.set(0, 0, 7);

  // Standard (PBR) materials react to light, so add some.
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(3, 4, 5);
  scene.add(sun);

  const shapes = [
    [new THREE.BoxGeometry(1, 1, 1),            new THREE.MeshStandardMaterial({ color: 0x4f9dff })],
    [new THREE.SphereGeometry(0.65, 32, 16),    new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.2, metalness: 0.5 })],
    [new THREE.ConeGeometry(0.6, 1.2, 32),      new THREE.MeshStandardMaterial({ color: 0xffd166, flatShading: true })],
    [new THREE.TorusGeometry(0.5, 0.2, 16, 64), new THREE.MeshStandardMaterial({ color: 0x06d6a0, wireframe: true })],
    [new THREE.TorusKnotGeometry(0.4, 0.14, 128, 16), new THREE.MeshNormalMaterial()],
  ];

  const meshes = shapes.map(([geometry, material], i) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = (i - (shapes.length - 1) / 2) * 1.8; // spread along X
    scene.add(mesh);
    return mesh;
  });

  tick((dt) => {
    for (const m of meshes) {
      m.rotation.x += dt * 0.5;
      m.rotation.y += dt * 0.8;
    }
  });
}
