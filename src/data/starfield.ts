// Data-driven starfield (spec §5). Read from a config array so the owner can drop
// in his own bright star sprites later. Ships a procedural default so the scene
// works before those assets exist.
//
// To add custom sprites: push entries with a `texture` URL (put files in public/
// and reference e.g. "/stars/my-star.png"). Entries without a texture render as
// procedural round points.

export interface StarSpriteConfig {
  texture?: string; // optional sprite URL; omit for procedural point
  position: [number, number, number];
  scale: number;
  brightness: number; // 0–1
}

// Owner-supplied bright stars go here.
export const CUSTOM_STARS: StarSpriteConfig[] = [];

// Procedural default: a dense shell of points around the scene.
export function proceduralStarfield(count = 3000, radius = 60): {
  positions: Float32Array;
  brightness: Float32Array;
  sizes: Float32Array;
  phase: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const brightness = new Float32Array(count);
  const sizes = new Float32Array(count);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Uniform on a sphere shell, pushed to a spread of distances.
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = radius * (0.5 + Math.random() * 0.5);
    const s = Math.sqrt(1 - u * u);
    positions[i * 3] = r * s * Math.cos(theta);
    positions[i * 3 + 1] = r * s * Math.sin(theta);
    positions[i * 3 + 2] = r * u;
    // Skewed distribution: many faint, a scattering of bright shiny ones.
    const b = Math.pow(Math.random(), 2.4);
    const hero = Math.random() < 0.06 ? 1.6 : 1; // occasional bright star
    brightness[i] = (0.4 + b * 0.6) * hero;
    sizes[i] = (0.9 + b * 3.6) * hero;
    phase[i] = Math.random() * Math.PI * 2;
  }
  return { positions, brightness, sizes, phase };
}
