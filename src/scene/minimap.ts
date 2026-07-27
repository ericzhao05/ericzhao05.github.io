import * as THREE from "three";
import { MINIMAP_LAYER } from "./orbit";

const SIZE = 220; // px, square
const MARGIN = 20;

// Dev-only top-down orthographic view of the orbit, drawn into the bottom-left
// corner via a scissored second render pass. Sees the scene's default layer plus
// the minimap-only orbit-path outline (MINIMAP_LAYER); it excludes the starfield
// (layer 1) so the orbit shape reads clearly from above.
export class Minimap {
  cam: THREE.OrthographicCamera;

  constructor() {
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    this.cam.position.set(0, 200, 0);
    this.cam.up.set(0, 0, -1); // so world +Z points down on screen consistently
    this.cam.lookAt(0, 0, 0);
    this.cam.layers.enable(MINIMAP_LAYER);

    const el = document.createElement("div");
    el.id = "minimap";
    el.innerHTML = `<span class="mm-label">TOP VIEW</span>`;
    document.body.appendChild(el);
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, fitRadius: number) {
    const h = fitRadius * 1.2;
    this.cam.left = -h;
    this.cam.right = h;
    this.cam.top = h;
    this.cam.bottom = -h;
    this.cam.updateProjectionMatrix();

    renderer.setScissorTest(true);
    renderer.setViewport(MARGIN, MARGIN, SIZE, SIZE);
    renderer.setScissor(MARGIN, MARGIN, SIZE, SIZE);
    renderer.render(scene, this.cam);
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  }
}
