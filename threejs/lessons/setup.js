// Shared boilerplate used by lessons 2-6.
// It does exactly what Lesson 1 does by hand: create a scene, camera and
// renderer, keep them sized to the container, and run an animation loop.
// Rendering pauses while the viewport is scrolled out of view.
import * as THREE from 'three';

export function setup(container, { background = 0x111318, fov = 60 } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.set(0, 1.5, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  new ResizeObserver(resize).observe(container);
  resize();

  const clock = new THREE.Clock();
  let onFrame = () => {};
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; })
    .observe(container);

  renderer.setAnimationLoop(() => {
    const dt = clock.getDelta();
    if (!visible) return;
    onFrame(dt, clock.elapsedTime);
    renderer.render(scene, camera);
  });

  return {
    scene,
    camera,
    renderer,
    // Register a function to run every frame: (deltaSeconds, elapsedSeconds)
    tick(fn) { onFrame = fn; },
  };
}
