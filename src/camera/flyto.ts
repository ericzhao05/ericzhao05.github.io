import * as THREE from "three";
import { config } from "../config";
import type { Star } from "../scene/star";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const FLY_DURATION = 1.2; // seconds (spec §4)

export class CameraRig {
  camera: THREE.PerspectiveCamera;
  mode: "idle" | "focused" = "idle";
  private focusStar: Star | null = null;

  private tweening = false;
  private t = 0;
  private fromPos = new THREE.Vector3();
  private toPos = new THREE.Vector3();
  private fromLook = new THREE.Vector3();
  private toLook = new THREE.Vector3();
  private curLook = new THREE.Vector3();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(config.fov, aspect, 0.1, 200);
    this.camera.position.copy(this.idlePos());
    this.curLook.set(0, 0, 0);
    this.camera.lookAt(this.curLook);
  }

  idlePos(target = new THREE.Vector3()): THREE.Vector3 {
    // Framing is based on the base orbit radius only — NOT the oval stretch — so
    // tuning ovalness reshapes the orbit without the camera receding.
    const fitFrac = 0.58;
    const d =
      config.orbitRadius /
      (fitFrac * Math.tan(THREE.MathUtils.degToRad(config.fov) / 2));
    return target.set(0, 0, Math.max(4, d));
  }

  private framing(star: Star, pos: THREE.Vector3, look: THREE.Vector3) {
    const s = star.worldPosition;
    look.copy(s);
    // Approach the star from its outward (away-from-Earth) side, so Earth always
    // sits *behind* the star and never occludes it — even for far-side stars.
    // Bias slightly toward the camera's +Z so front and back framings feel alike.
    const outward = s.clone().normalize();
    outward.z += 0.5;
    outward.normalize();
    pos.copy(s).addScaledVector(outward, 1.7);
    pos.y += 0.3; // star sits a touch below center, clear of the overlay
  }

  focus(star: Star, instant = false) {
    this.mode = "focused";
    this.focusStar = star;
    this.fromPos.copy(this.camera.position);
    this.fromLook.copy(this.curLook);
    this.framing(star, this.toPos, this.toLook);
    if (instant) {
      this.camera.position.copy(this.toPos);
      this.curLook.copy(this.toLook);
      this.tweening = false;
    } else {
      this.t = 0;
      this.tweening = true;
    }
  }

  toIdle(instant = false) {
    this.mode = "idle";
    this.focusStar = null;
    this.fromPos.copy(this.camera.position);
    this.fromLook.copy(this.curLook);
    this.idlePos(this.toPos);
    this.toLook.set(0, 0, 0);
    if (instant) {
      this.camera.position.copy(this.toPos);
      this.curLook.copy(this.toLook);
      this.tweening = false;
    } else {
      this.t = 0;
      this.tweening = true;
    }
  }

  get isFlying() {
    return this.tweening;
  }

  update(dt: number) {
    // Keep FOV live for the dev panel.
    if (this.camera.fov !== config.fov) {
      this.camera.fov = config.fov;
      this.camera.updateProjectionMatrix();
    }

    if (this.tweening) {
      this.t += dt / FLY_DURATION;
      const k = easeOutCubic(Math.min(1, this.t));
      this.camera.position.lerpVectors(this.fromPos, this.toPos, k);
      this.curLook.lerpVectors(this.fromLook, this.toLook, k);
      if (this.t >= 1) this.tweening = false;
    } else if (this.mode === "idle") {
      // Track config changes (radius/fov sliders) live.
      this.camera.position.copy(this.idlePos());
      this.curLook.set(0, 0, 0);
    } else if (this.focusStar) {
      // Re-frame the (now stationary) focused star each frame.
      this.framing(this.focusStar, this.toPos, this.toLook);
      this.camera.position.lerp(this.toPos, Math.min(1, dt * 4));
      this.curLook.lerp(this.toLook, Math.min(1, dt * 4));
    }

    this.camera.lookAt(this.curLook);
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
