# Orbit Navigation — Design

**Date:** 2026-07-26
**Status:** Approved, ready for implementation planning
**Baseline spec:** [`orbit-nav-spec.md`](../../../orbit-nav-spec.md) — the locked build spec. This
document does **not** restate it. It records the decisions the spec left open
("your call, with reasoning" / "justify") plus a few behavioral deltas resolved
during brainstorming. Where this doc and the spec agree, the spec governs; where
this doc resolves something the spec left open, this doc governs.

---

## 1. Stack — resolved

**Plain Three.js on Vite, TypeScript. No app framework.**

- Router: hand-rolled over the History API — six routes (`/resume`, `/github`,
  `/linkedin`, `/projects`, `/skills`, `/contact`) plus a deep-link resolver that
  opens the focused state directly on cold load.
- GitHub Pages deep links: a `404.html` that re-serves the app (SPA fallback), so
  loading `/projects` directly resolves client-side.

**Why, and the tradeoff accepted.** The spec frames the tension as "a framework
gives routing / focus management / deep links for free." On this project that
benefit is largely neutralized: the site deploys to GitHub Pages (static host,
custom domain `ericzhao05.com`), so Next.js would run in static-export mode —
disabling its server routing — and deep links still need the `404.html` fallback
regardless of framework. Meanwhile the asset budget is tight (3 MB assets,
< 200 KB scene code gzipped excluding Three.js), and this is a single interactive
scene with no other pages, so React + a reconciler is weight spent on an
imperative animation loop that doesn't want it. The routing this app actually
needs is small and well-scoped.

**Accepted cost:** focus trapping and routing are written by hand rather than
inherited from a framework. Both are small, self-contained modules (see §5).

## 2. Palette — resolved (fusion "A′")

Concept: **Matrix green is the *systems* layer; mineral pigments are the *stars*.**
The Matrix isn't green stars — it's a green machine (terminal rain, telemetry, CRT
glow). That maps onto the subject's network-infrastructure work. The six stars
keep distinct mineral pigments that both Renaissance Italy and imperial China
ground from stone — the one thread that genuinely joins the subject's two
backgrounds, and it keeps the six sections visually distinguishable (a single
green would collapse them, which is the cliché the spec §5 locks out).

| Token             | Hex       | Role                                                        |
|-------------------|-----------|-------------------------------------------------------------|
| `ink`             | `#000000` | Pure-black sky background (owner preference, 2026-07-27)    |
| `phosphor`        | `#00FF66` | Systems layer: HUD, telemetry, dev panel, star rim, glow   |
| `phosphor-dim`    | `#1C7A44` | Muted telemetry / secondary green                          |
| `lapis`           | `#2E4EA4` | Resume star                                                 |
| `cinnabar`        | `#CE3B23` | GitHub star                                                 |
| `ochre`           | `#D89A34` | LinkedIn star                                               |
| `celadon`         | `#6FA893` | Projects star                                               |
| `amethyst`        | `#9C6FA8` | Skills star                                                 |
| `gold`            | `#C9A24B` | Contact star                                                |
| `bone`            | `#E9E1CE` | Label / body text                                           |

Notes: cinnabar is one of six pigments, never a lone accent on black — it dodges
the spec's warned cliché. Green is confined to the machine layer and the rim-light
that solves the front-crossing legibility problem (spec §2), not sprayed on
everything. Star colors are the source of truth for the section theming used in
overlays and the plain-text nav.

## 3. Type — resolved

- **Display** (star labels, section titles): **Space Grotesk** (500 / 700).
- **Technical / telemetry** (coordinates, years, stack tags, dev panel):
  **IBM Plex Mono** (400 / 500) — IBM's face, an honest nod to the infra world.

Both self-hosted as subset `woff2` (no hotlinking, per spec §7 discipline; counts
toward the code/asset budget, not the 3 MB scene budget). No numbered markers
anywhere (spec §5).

## 4. Behavioral deltas (resolving spec ambiguities)

**External stars (Resume, GitHub, LinkedIn).** On click: fly-to + a DOM overlay
card with a short blurb and an outbound button (opens GitHub/LinkedIn in a new
tab; opens the resume). The star's `<a href>` is the real external URL so no-JS
users navigate straight there (satisfies spec non-negotiable §8.2). This keeps the
single-page fly-to feel consistent across all six stars.

**Resume.** Self-hosted `resume.pdf` in the repo; the `/resume` overlay links to /
embeds it. Replaceable without code changes.

**Orbit orientation (owner change, 2026-07-27).** The single "tilt from edge-on"
control was replaced with three independent plane rotations (tiltX/tiltY/tiltZ)
so the owner can aim the orbit plane freely. Default tiltX=25 reproduces the
baseline face-crossing ellipse.

**Depth scale (owner change, 2026-07-27).** A `depthScale` dev slider adds an
explicit front-bigger/back-smaller multiplier on top of the perspective effect.
This intentionally deviates from spec §2/§11 ("no manual depth multiplier"), at
the owner's request. It defaults to 0 so the shipped/default look remains pure
perspective; the owner can dial in extra drama by feel.

**Earth surface markers.** No personal-location markers. The lat/lon →
equirectangular machinery from spec §7 is retained **only** as a dev-only
sign-convention test (a temporary marker at `(0,0)` that must land in the Gulf of
Guinea), then disabled. Earth carries no content pins.

## 5. Module structure

Each unit has one purpose, a narrow interface, and is independently reasoned about.

- `index.html` — static shell: always-present **plain-text header nav** (spec
  §8.1), the `<a href>` links for every star/moon (spec §8.2), overlay mount
  points, `<noscript>` navigable content. Everything below is progressive
  enhancement over this.
- `scene/` — `earth.ts`, `orbit.ts`, `star.ts` (sphere + billboarded icon +
  rim-light), `moon.ts`, `starfield.ts` (data-driven from a `{texture, position,
  scale, brightness}[]` config with a procedural default), `lighting.ts`, `vignette.ts`.
- `motion/` — velocity model, drag-to-velocity, momentum decay, delta-time
  normalization (spec §4). Owns `angle` / `velocity`.
- `router/` — History API push/pop, deep-link resolver, `404.html` fallback glue.
- `overlay/` — section content rendering, focus trap, focus return, Escape/close.
- `devpanel/` — sliders (spec §6), gated on `?dev` or localhost, "copy JSON
  config" button. Built early (phase 3) so later phases tune by feel.
- `a11y/` — arrow-key star stepping, Enter/Escape, tab order = orbit order,
  focus rings, `prefers-reduced-motion` still composition.
- `data/` — sections, projects (5, per spec), skills (6), starfield config,
  color tokens. Placeholder content where noted in §6.
- `camera/` — fly-to tween (~1.2s, hard decel), reverse transition.

## 6. Content to be supplied (placeholdered)

Build proceeds with placeholders; these are filled before launch:
GitHub + LinkedIn URLs, the five project write-ups + links (Weight of the Cloud,
HSRN NetBox automation, Hermes fitness agent, EzDSViewer, Arcampass), six skill
blurbs (C++, Python, React, Godot, AWS, Docker), `resume.pdf`, and the owner's
own bright star sprites for the starfield (procedural default ships meanwhile).

## 7. Build order

Follows spec §9 verbatim (skeleton → motion → dev panel → icons/labels/legibility
→ camera/overlay/routing → moons → real Earth asset/markers/starfield → a11y/
reduced-motion/mobile/fallback). Each phase ships working and is reported before
the next begins.

## 8. Acceptance & non-negotiables

Governed entirely by spec §8 and §10 — no changes. Key checks: hard flick coasts
2–3s; stars legible crossing Earth's face; icons upright at every position; back
button reverses fly-to; `/projects` cold-loads focused with no fly-in; tab reaches
all six in orbit order; JS-disabled page still navigable; every dev slider live.
