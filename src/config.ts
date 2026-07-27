// Live-tunable scene config. The dev panel (spec §6) mutates this object in
// place; every consumer reads from it each frame so slider changes are live.

export interface OrbitConfig {
  // Orbit-plane orientation as three independent rotations (degrees) applied to
  // the whole orbit group. tiltX tips the plane out of horizontal (the classic
  // "tilt from edge-on"); tiltY spins stars within the plane; tiltZ rolls the
  // ellipse in the screen plane.
  tiltX: number;
  tiltY: number;
  tiltZ: number;
  orbitRadius: number; // semi-major radius in Earth radii
  ovalRatio: number; // major-axis stretch (1 = circle, >1 pushes the ends out)
  ovalDir: number; // orientation of the oval's major axis (deg, in-plane)
  earthSize: number; // scale of the central Earth
  driftSpeed: number; // baseline angular drift (rad/s)
  weight: number; // WEIGHT — perceived mass of the momentum system
  ambientMoons: number; // moons rendered per parent before focus (0–6)
  starSize: number; // base star sphere radius
  depthScale: number; // extra front/back size multiplier (0 = pure perspective)
  fov: number; // camera field of view (deg)
}

// Owner-tuned preset (2026-07-27) + oval defaults.
export const DEFAULTS: OrbitConfig = {
  tiltX: 11,
  tiltY: -170,
  tiltZ: -17,
  orbitRadius: 6.5,
  ovalRatio: 1.4, // gentle oval — ends pushed out; 1 = circle
  ovalDir: 0,
  earthSize: 2,
  driftSpeed: 0.4,
  weight: 0.085,
  ambientMoons: 3,
  starSize: 0.37,
  depthScale: 1.2, // owner opted into the manual depth multiplier (see design doc)
  fov: 65,
};

// Mutable singleton shared across modules.
export const config: OrbitConfig = { ...DEFAULTS };

export const isMobile = () =>
  window.matchMedia("(max-width: 640px)").matches;

export const isDevEnabled = () =>
  new URLSearchParams(location.search).has("dev") ||
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
