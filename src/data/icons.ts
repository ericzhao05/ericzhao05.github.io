// Monochrome SVG icons for each star. Drawn on a transparent field; the sphere
// carries the color (spec §2). 64x64 viewBox, stroke-based so they stay crisp
// when rasterised to a CanvasTexture.

const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#E9E1CE" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

export const ICONS: Record<string, string> = {
  resume: wrap(
    `<rect x="16" y="10" width="32" height="44" rx="3"/><line x1="24" y1="24" x2="40" y2="24"/><line x1="24" y1="32" x2="40" y2="32"/><line x1="24" y1="40" x2="34" y2="40"/>`
  ),
  projects: wrap(
    `<rect x="12" y="14" width="18" height="18" rx="2"/><rect x="34" y="14" width="18" height="18" rx="2"/><rect x="12" y="34" width="18" height="18" rx="2"/><rect x="34" y="34" width="18" height="18" rx="2"/>`
  ),
  skills: wrap(
    `<rect x="20" y="20" width="24" height="24" rx="3"/><line x1="26" y1="14" x2="26" y2="20"/><line x1="38" y1="14" x2="38" y2="20"/><line x1="26" y1="44" x2="26" y2="50"/><line x1="38" y1="44" x2="38" y2="50"/><line x1="14" y1="26" x2="20" y2="26"/><line x1="14" y1="38" x2="20" y2="38"/><line x1="44" y1="26" x2="50" y2="26"/><line x1="44" y1="38" x2="50" y2="38"/>`
  ),
  github: wrap(
    `<path d="M32 12c-9 0-16 7-16 16 0 7 4.6 13 11 15 0.8 0.2 1.1-0.3 1.1-0.8v-3c-4.5 1-5.4-2-5.4-2-0.7-1.9-1.8-2.4-1.8-2.4-1.5-1 0.1-1 0.1-1 1.6 0.1 2.5 1.7 2.5 1.7 1.4 2.5 3.8 1.8 4.7 1.4 0.1-1.1 0.6-1.8 1-2.2-3.6-0.4-7.4-1.8-7.4-8 0-1.8 0.6-3.2 1.7-4.4-0.2-0.4-0.7-2.1 0.2-4.3 0 0 1.4-0.4 4.5 1.7a15 15 0 0 1 8 0c3-2.1 4.4-1.7 4.4-1.7 0.9 2.2 0.3 3.9 0.2 4.3 1 1.2 1.7 2.6 1.7 4.4 0 6.2-3.8 7.6-7.4 8 0.6 0.5 1.1 1.5 1.1 3v4.4c0 0.5 0.3 1 1.1 0.8 6.4-2 11-8 11-15 0-9-7-16-16-16z"/>`
  ),
  linkedin: wrap(
    `<rect x="12" y="12" width="40" height="40" rx="4"/><line x1="22" y1="28" x2="22" y2="42"/><circle cx="22" cy="21" r="1.6" fill="#E9E1CE" stroke="none"/><path d="M30 42V33c0-3 2-5 5-5s5 2 5 5v9"/><line x1="30" y1="28" x2="30" y2="42"/>`
  ),
  contact: wrap(
    `<rect x="12" y="16" width="40" height="32" rx="3"/><path d="M14 19 32 34 50 19"/>`
  ),
};
