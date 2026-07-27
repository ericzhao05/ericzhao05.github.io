import * as THREE from "three";
import type { MoonItem } from "../data/sections";

// A moon orbits its parent star. It is a child of the star's group, so it
// inherits the star's position and orbital motion (spec §3).
export class Moon {
  holder = new THREE.Object3D();
  mesh: THREE.Mesh;
  angle: number;
  private orbitR: number;
  private tilt: number;
  private targetOpacity = 1;
  private mat: THREE.MeshStandardMaterial;

  constructor(
    public data: MoonItem,
    index: number,
    total: number,
    parentColor: THREE.Color,
    starRadius: number
  ) {
    this.angle = (index / total) * Math.PI * 2;
    this.orbitR = starRadius * (2.1 + (index % 2) * 0.5);
    this.tilt = ((index % 3) - 1) * 0.32;

    this.mat = new THREE.MeshStandardMaterial({
      color: parentColor.clone().lerp(new THREE.Color(0xffffff), 0.35),
      roughness: 0.6,
      metalness: 0.0,
      emissive: parentColor.clone().multiplyScalar(0.12),
      transparent: true,
      opacity: 1,
    });
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(starRadius * 0.28, 20, 16),
      this.mat
    );
    this.holder.add(this.mesh);
  }

  setVisible(v: boolean) {
    this.targetOpacity = v ? 1 : 0;
  }

  update(dt: number, speed: number) {
    // ~2x the parent's orbital rate (parent rate applied at orbit level).
    this.angle += speed * dt;
    const x = Math.cos(this.angle) * this.orbitR;
    const z = Math.sin(this.angle) * this.orbitR;
    const y = Math.sin(this.angle) * this.orbitR * this.tilt;
    this.holder.position.set(x, y, z);

    // Fade toward target opacity; hide fully when invisible so it stops
    // receiving raycasts.
    this.mat.opacity += (this.targetOpacity - this.mat.opacity) * Math.min(1, dt * 6);
    this.mesh.visible = this.mat.opacity > 0.02;
  }

  get worldPosition(): THREE.Vector3 {
    return this.mesh.getWorldPosition(new THREE.Vector3());
  }
}
