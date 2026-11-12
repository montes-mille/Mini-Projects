# three.js Tutorial & User Demo

A no-build three.js project: a step-by-step tutorial plus an interactive playground.

## Run it

ES modules don't load from `file://`, so serve the folder:

```bash
npx serve threejs          # or: python3 -m http.server -d threejs 8000
```

Then open `index.html`.

## What's inside

| File | Purpose |
| --- | --- |
| `index.html` | Landing page |
| `tutorial.html` | Six lessons, each with a live viewport and its source code |
| `lessons/01-hello-cube.js` | Scene, camera, renderer, mesh, render loop |
| `lessons/02-geometry-materials.js` | Built-in geometries and material options |
| `lessons/03-lights-shadows.js` | Light types and enabling shadows |
| `lessons/04-animation-groups.js` | Scene graph and delta-time animation (solar system) |
| `lessons/05-orbit-controls.js` | `OrbitControls`, grid and axes helpers |
| `lessons/06-raycasting.js` | Mouse picking with `Raycaster` |
| `lessons/setup.js` | Shared boilerplate used by lessons 2–6 |
| `demo.html` + `js/demo.js` | Full-screen playground: click to spawn shapes, select & edit them, change lighting (lil-gui panel) |

three.js `0.170.0` and lil-gui `0.20.0` load from jsDelivr via an import map in each HTML page.
To add a lesson, create `lessons/07-*.js` exporting `default function (container) {}`
and add a `<div class="viewport" data-lesson="07-...">` section to `tutorial.html`.
