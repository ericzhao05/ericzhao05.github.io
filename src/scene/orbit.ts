import * as THREE from "three";
import { Star } from "./star";
import { SECTIONS } from "../data/sections";
import { config } from "../config";
import { COLORS } from "../data/colors";

const _wp = new THREE.Vector3();
const PATH_SEGMENTS = 128;
export const MINIMAP_LAYER = 2; // orbit path shows only in the top-down minimap

// Positions six stars on one shared circular orbit that lives in a flat plane
// (local XZ). The plane's orientation is set by three independent rotations on
// the orbit group (tiltX/Y/Z), so the owner can aim the orbit anywhere. Depth
// (front bigger / back smaller) is a real perspective effect from the z spread;
// an optional depthScale adds extra multiplier on top (spec §2, off by default).
export class OrbitSystem {
  group = new THREE.Group();
  stars: Star[] = [];
  private path: THREE.LineLoop;

  constructor() {
    for (const section of SECTIONS) {
      const star = new Star(section, config.starSize);
      this.stars.push(star);
      this.group.add(star.group);
    }

    // Orbit-path outline — rendered only in the minimap so the main scene stays
    // clean. Inherits the group rotation, so it shows the true tilted ellipse.
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array((PATH_SEGMENTS + 1) * 3), 3)
    );
    this.path = new THREE.LineLoop(
      geo,
      new THREE.LineBasicMaterial({ color: new THREE.Color(COLORS.phosphor) })
    );
    this.path.layers.set(MINIMAP_LAYER);
    this.group.add(this.path);
  }

  // Flat local position on the elliptical ring (plane tilt comes from the group
  // rotation; ovalRatio squashes the minor axis, ovalDir rotates it in-plane).
  positionAt(angle: number, target = new THREE.Vector3()): THREE.Vector3 {
    // Base radius stays fixed on the minor axis; ovalRatio (≥1) stretches the two
    // ends outward along the major axis.
    const a = config.orbitRadius * config.ovalRatio;
    const b = config.orbitRadius;
    const px = a * Math.cos(angle);
    const pz = b * Math.sin(angle);
    const dir = THREE.MathUtils.degToRad(config.ovalDir);
    const c = Math.cos(dir);
    const s = Math.sin(dir);
    return target.set(px * c - pz * s, 0, px * s + pz * c);
  }

  private updatePath() {
    const pos = this.path.geometry.getAttribute("position") as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i <= PATH_SEGMENTS; i++) {
      this.positionAt((i / PATH_SEGMENTS) * Math.PI * 2, v);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
  }

  angleOf(i: number, baseAngle: number): number {
    return baseAngle + (i / this.stars.length) * Math.PI * 2;
  }

  update(baseAngle: number, camera: THREE.Camera, dt: number) {
    const d = THREE.MathUtils.degToRad;
    this.group.rotation.set(d(config.tiltX), d(config.tiltY), d(config.tiltZ));
    this.updatePath();

    const moonSpeed = config.driftSpeed * 2; // moons orbit ~2× parent rate (§3)
    const camDist = camera.position.length(); // orbit centered at origin
    const R = config.orbitRadius;

    this.stars.forEach((star, i) => {
      this.positionAt(this.angleOf(i, baseAngle), star.group.position);

      // Extra depth scaling by feel: +1 at the front, −1 at the back.
      let depthFactor = 1;
      if (config.depthScale > 0) {
        star.group.getWorldPosition(_wp);
        const near = (camDist - camera.position.distanceTo(_wp)) / R;
        depthFactor = 1 + config.depthScale * THREE.MathUtils.clamp(near, -1, 1);
      }
      star.setDisplay(config.starSize, depthFactor);
      star.update(camera, dt, moonSpeed);
    });
  }
}
