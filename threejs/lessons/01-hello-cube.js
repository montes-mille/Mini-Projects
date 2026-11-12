// Lesson 1 — Hello, Cube
// Every three.js app needs three things: a Scene (what to draw),
// a Camera (where we look from) and a Renderer (draws it onto a <canvas>).
import * as THREE from 'three';

export default function lesson(container) {
  // 1. The scene is a container for every object, light and camera.
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111318);

  // 2. A perspective camera: field of view (degrees), aspect ratio, near, far.
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 4; // move back so the cube is in front of us

  // 3. The renderer creates a <canvas> and draws with WebGL.
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // A Mesh = Geometry (shape) + Material (appearance).
  // MeshNormalMaterial needs no lights, which makes it great for a first test.
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshNormalMaterial(),
  );
  scene.add(cube);

  // Keep the canvas and camera matched to the container size.
  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  new ResizeObserver(resize).observe(container);
  resize();

  // The render loop: runs ~60 times per second.
  renderer.setAnimationLoop((time) => {
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;
    renderer.render(scene, camera);
  });
}
