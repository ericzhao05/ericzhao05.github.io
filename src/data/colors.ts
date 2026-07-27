// Palette — fusion "A'": Matrix-green systems layer + mineral-pigment stars.
// See docs/superpowers/specs/2026-07-26-orbit-nav-design.md §2.

export const COLORS = {
  ink: "#000000", // pure black sky
  phosphor: "#00FF66", // systems layer: HUD, telemetry, rim, glow
  phosphorDim: "#1C7A44",
  lapis: "#2E4EA4",
  cinnabar: "#CE3B23",
  ochre: "#D89A34",
  celadon: "#6FA893",
  amethyst: "#9C6FA8",
  gold: "#C9A24B",
  bone: "#E9E1CE",
} as const;

export type ColorToken = keyof typeof COLORS;
