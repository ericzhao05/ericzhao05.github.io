import * as THREE from "three";
import type { OrbitSystem } from "./orbit";
import type { Star } from "./star";
import type { Moon } from "./moon";
import { config } from "../config";

const _v = new THREE.Vector3();

interface StarLabel {
  el: HTMLAnchorElement;
  star: Star;
  opacity: number;
}
interface MoonLabel {
  el: HTMLAnchorElement;
  moon: Moon;
  parent: Star;
  opacity: number;
}

// Labels are DOM (crisp, real links) projected onto the 3D star/moon positions.
export class LabelManager {
  layer: HTMLDivElement;
  starLabels: StarLabel[] = [];
  moonLabels: MoonLabel[] = [];

  constructor(
    orbit: OrbitSystem,
    private onSelectStar: (s: Star) => void,
    private onSelectMoon: (m: Moon, parent: Star) => void
  ) {
    this.layer = document.createElement("div");
    this.layer.id = "labels-layer";
    document.body.appendChild(this.layer);

    orbit.stars.forEach((star) => {
      const el = document.createElement("a");
      el.className = "orbit-label";
      el.href = star.section.href;
      el.setAttribute("aria-label", star.section.label);
      el.innerHTML = `<span class="name">${star.section.label}</span><span class="meta">${star.section.meta}</span>`;
      el.addEventListener("click", (e) => {
        e.preventDefault();
        this.onSelectStar(star);
      });
      this.layer.appendChild(el);
      this.starLabels.push({ el, star, opacity: 1 });

      star.moons.forEach((moon) => {
        const mel = document.createElement("a");
        mel.className = "orbit-label moon";
        mel.href = moon.data.href;
        mel.tabIndex = -1;
        mel.innerHTML = `<span class="name">${moon.data.label}</span><span class="meta">${moon.data.meta ?? ""}</span>`;
        mel.addEventListener("click", (e) => {
          if (moon.data.href === "#") e.preventDefault();
          this.onSelectMoon(moon, star);
        });
        this.layer.appendChild(mel);
        this.moonLabels.push({ el: mel, moon, parent: star, opacity: 0 });
      });
    });
  }

  update(
    camera: THREE.PerspectiveCamera,
    earthRadius: number,
    w: number,
    h: number,
    focused: Star | null,
    dt: number
  ) {
    const camDist = camera.position.length(); // Earth at origin
    const pxPerUnit =
      h / 2 / (Math.tan(THREE.MathUtils.degToRad(config.fov) / 2) * camDist);
    const earthPx = earthRadius * pxPerUnit;

    for (const L of this.starLabels) {
      // When a section is focused the overlay carries its title, so hide all
      // star labels (including the focused one, whose label would overlap the
      // enlarged icon).
      const visible = !focused;
      const target = visible ? 1 : 0;
      L.opacity += (target - L.opacity) * Math.min(1, dt * 8);
      this.place(L.el, L.star.worldPosition, camera, w, h, earthPx, L.opacity, 26);
    }

    for (const M of this.moonLabels) {
      const visible = focused === M.parent;
      const target = visible ? 1 : 0;
      M.opacity += (target - M.opacity) * Math.min(1, dt * 8);
      M.el.tabIndex = M.opacity > 0.6 ? 0 : -1;
      this.place(M.el, M.moon.worldPosition, camera, w, h, earthPx, M.opacity, 16);
    }
  }

  private place(
    el: HTMLElement,
    worldPos: THREE.Vector3,
    camera: THREE.PerspectiveCamera,
    w: number,
    h: number,
    earthPx: number,
    opacity: number,
    yOffset: number
  ) {
    _v.copy(worldPos).project(camera);
    const behindCamera = _v.z > 1;
    const x = (_v.x * 0.5 + 0.5) * w;
    const y = (-_v.y * 0.5 + 0.5) * h;

    // Occlusion: if this point is farther than Earth and projects within Earth's
    // disk, it's behind the planet — hide the label.
    const dist = camera.position.distanceTo(worldPos);
    const cx = w / 2;
    const cy = h / 2;
    const occluded =
      dist > camera.position.length() &&
      Math.hypot(x - cx, y - cy) < earthPx * 0.92;

    const o = behindCamera || occluded ? 0 : opacity;
    el.style.opacity = String(o);
    el.style.visibility = o < 0.02 ? "hidden" : "visible";
    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y + yOffset}px)`;
  }
}
