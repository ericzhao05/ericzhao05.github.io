import { config } from "../config";

const DRAG_K = 0.006; // radians per pixel of horizontal drag
const CLICK_MOVE_PX = 6; // movement under this = a click, not a drag

// Velocity-based orbital motion (spec §4). Idle drift eases toward a baseline;
// dragging writes into velocity; releasing a flick coasts and decays back to
// drift. Frame-rate normalized so 120Hz displays don't run double speed.
export class Motion {
  angle = 0;
  velocity = 0;
  dragging = false;
  frozen = false; // prefers-reduced-motion

  private dragDelta = 0;
  private lastX = 0;
  private downX = 0;
  private downY = 0;
  private moved = 0;
  private onClick?: (x: number, y: number) => void;

  attach(el: HTMLElement, onClick: (x: number, y: number) => void) {
    this.onClick = onClick;
    el.addEventListener("pointerdown", this.down);
    window.addEventListener("pointermove", this.move);
    window.addEventListener("pointerup", this.up);
  }

  private down = (e: PointerEvent) => {
    if (this.frozen) return;
    this.dragging = true;
    this.lastX = e.clientX;
    this.downX = e.clientX;
    this.downY = e.clientY;
    this.moved = 0;
  };

  private move = (e: PointerEvent) => {
    if (!this.dragging) return;
    const dx = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.dragDelta += dx * DRAG_K;
    this.moved += Math.abs(dx) + Math.abs(e.clientY - this.downY);
  };

  private up = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    const dist = Math.hypot(e.clientX - this.downX, e.clientY - this.downY);
    if (dist < CLICK_MOVE_PX) this.onClick?.(e.clientX, e.clientY);
  };

  // Ease drift toward a stop (used when a section is focused).
  easeToStop(dt: number) {
    this.velocity += (0 - this.velocity) * lerpFactor(0.06, dt);
    this.angle += this.velocity * dt;
  }

  update(dt: number) {
    if (this.frozen) return;
    if (this.dragging) {
      this.angle += this.dragDelta;
      this.velocity = this.dragDelta / Math.max(dt, 0.001);
      this.dragDelta = 0;
    } else {
      const baseline = config.driftSpeed;
      this.velocity += (baseline - this.velocity) * lerpFactor(config.weight, dt);
      this.angle += this.velocity * dt;
    }
  }
}

// Convert a per-60fps-frame lerp weight into a delta-time-normalized factor.
function lerpFactor(weightPerFrame: number, dt: number): number {
  return 1 - Math.pow(1 - weightPerFrame, dt * 60);
}
