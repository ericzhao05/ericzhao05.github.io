# Orbit navigation — build spec

Personal portfolio homepage. The entire homepage is a single 3D scene: Earth at the center, six section spheres orbiting it, and moons orbiting two of those spheres. It replaces both the hero and the nav bar. There is no scrolling page beneath it.

Every decision below marked **locked** is settled — implement it as written, do not propose alternatives. Everything else is yours to decide, and where the spec says *justify*, say why in your plan before you write code.

---

## 1. Stack — your call, with reasoning

Choose the stack and defend it in your plan before writing anything. The relevant tension: this is a single interactive scene with no other pages, so a full app framework may be dead weight — but the overlay content needs routing, focus management, and deep links, which is exactly what a framework gives you for free. Consider plain Three.js on Vite against React Three Fiber on Next.js and pick one. State the tradeoff you're accepting.

Locked regardless of choice:

- Three.js for the scene. Not a 2D canvas, not DOM transforms.
- Labels and overlay content are DOM, not textured planes, so they stay crisp and remain real links.
- TypeScript.

## 2. Scene composition — locked

**Earth** sits at the center, rotating slowly on a 23.4° tilted axis. Markers are children of the Earth mesh so they rotate with it.

**Six stars** on one shared elliptical orbit, evenly spaced:

| Star     | Moons |
|----------|-------|
| Resume   | —     |
| GitHub   | —     |
| LinkedIn | —     |
| Projects | 5     |
| Skills   | 6     |
| Contact  | —     |

There is no "Home" star. The orbit at rest *is* home.

**Orbit geometry.** Baseline tilt 25° from edge-on. The orbit is wide — roughly 3.5× Earth's radius on the major axis — so stars swing well clear to the sides and travel a long visual distance between front and back.

**Stars cross in front of Earth.** The near arc of the orbit passes across Earth's face, as in the reference sketch. This creates a legibility problem you must solve deliberately: a lit sphere against a bright textured Earth loses its silhouette. Solve it with a subtle darkened vignette on Earth's limb plus a thin rim light on each star that separates it from whatever is behind. Do not solve it by shrinking the orbit or by dimming Earth into a gray ball.

**Star appearance.** Each star is a sphere with its section icon floating just off the surface, facing the camera at all times — a billboarded plane holding an SVG-derived texture, offset along the camera-facing normal so it reads as sitting *on* the sphere rather than beside it. The icon must remain upright and legible at every orbital position. Icons stay monochrome; the sphere carries the color.

**Depth scaling.** Stars are smallest at the back of the orbit and largest at the front. This must be a real perspective effect from camera distance, not a manual scale multiplier — with a perspective camera and a wide orbit you get it for free, and it will look wrong if you fake it.

## 3. Moons — locked behavior, tunable count

Projects: Weight of the Cloud, HSRN NetBox automation, Hermes fitness agent, EzDSViewer, Arcampass.
Skills: C++, Python, React, Godot, AWS, Docker.

Moons are children of their parent star's transform, so they inherit its position and orbital motion. They rotate around their parent roughly 2× faster than the parent orbits Earth.

Two states:

- **Ambient** — only a subset renders, default 3 per parent, so roughly 6 moons are on screen at once. No labels. This keeps the scene legible while still signalling "there is more inside this one."
- **Focused** — after the camera flies to a star, the remaining moons fade in, all of them get labels, and all become clickable.

The ambient count is a tuning parameter, exposed in the dev panel (section 6). If ambient count equals the full set, the focus transition should still add labels and interactivity, so nothing breaks at the extremes.

## 4. Interaction — locked

**Idle.** The orbit drifts slowly and continuously. Motion model is velocity-based, not fixed-speed:

```
if (!dragging) {
  velocity += (baselineDrift - velocity) * WEIGHT;
  angle += velocity * deltaTime;
}
```

Normalize against delta time so the scene does not run at double speed on 120Hz displays. `WEIGHT` is the perceived mass of the system — low values feel enormous and slow to respond, high values feel light. Start at 0.035 and expose it in the dev panel.

**Drag.** Pointer drag writes directly into `velocity`. Releasing a flick coasts and decays back to the baseline drift rather than stopping dead. A hard flick should coast for two to three seconds.

**Click a star.** The camera flies to it. This is a single-page transition — no page navigation, no reload:

1. Orbital drift eases to a stop.
2. Camera tweens to a framing position near the target star, roughly 1.2 seconds, with an ease that decelerates hard at the end.
3. That star's remaining moons fade in with labels.
4. The section's content fades in as a DOM overlay.
5. The URL updates via History API to `/resume`, `/projects`, etc.

**Returning.** Escape, a close control, and the browser back button all reverse the transition and resume drift. All three must work.

**Click a moon.** Opens that project or skill's content in the same overlay, without leaving the focused star.

**Deep links.** Loading `/projects` directly skips the intro and opens in the focused state immediately. Do not animate a fly-in from a cold load — it delays content for no reason.

## 5. Art direction — locked, with room

Black background. A dense starfield fills the scene behind everything.

**Build the starfield data-driven.** The site owner intends to supply his own bright star sprites, so read the starfield from a config array of `{ texture, position, scale, brightness }` rather than hardcoding a particle system. Ship a reasonable procedural default so the scene works before those assets exist, and document how to drop them in.

Beyond black-plus-stars, the palette is yours — propose 4–6 named hex values and justify them. Two things to avoid, because they are the defaults every space-themed site arrives at rather than choices: a single acid-green or vermilion accent on black, and blue-white glow on everything. The subject grew up in Italy with a Chinese background and works on network infrastructure and games; there is a more specific answer available than generic sci-fi.

Type: pick a display face with real personality for star labels and section titles, and a monospace or technical face for orbital metadata — coordinates, years, stack tags. That data is genuinely data, so a technical face is honest there rather than decorative. Do not use numbered markers; nothing here is a sequence.

No lens flares, no bloom on everything, no gradient nebulae. If you use bloom at all, use it on one thing.

## 6. Dev tuning panel — locked

The site owner wants to feel these values, not guess them. Build a dev-only control panel, visible when the URL has `?dev` or on localhost, hidden in production, with live sliders for:

- Orbit tilt (0–60°)
- Orbit radius
- Baseline drift speed
- `WEIGHT` (the momentum feel)
- Ambient moons per parent (0–6)
- Star size
- Camera field of view

Add a button that copies the current values as a JSON config block, so a good combination found by feel can be pasted straight into the source as the new defaults.

## 7. Assets

**Earth model.** NASA's Earth glb, credited to NASA/VTAD:

```
https://assets.science.nasa.gov/content/dam/science/psd/solar/2023/09/e/Earth_1_12756.glb
```

Download and self-host it. Do not hotlink — that URL already moved once. At 12.32 MB it is far too heavy to ship as-is; almost all of it is texture, so mesh compression will not help. Re-encode:

```bash
npm i -g @gltf-transform/cli
gltf-transform optimize Earth_1_12756.glb earth.glb \
  --texture-compress webp --texture-size 2048
```

Compare 2048 against 1024 at the size Earth actually renders and use the smaller one if the difference is invisible. **Total asset budget for the scene is 3 MB.** If the optimized Earth alone approaches that, say so and propose building the planet from a sphere plus texture maps instead.

Credit line in the footer: `Earth model: NASA/VTAD`. Do not use the NASA insignia or worm logo anywhere.

**Marker placement.** Convert lat/lon with the standard equirectangular mapping, and verify the sign convention by dropping a test marker at (0, 0) — it must land in the Gulf of Guinea off West Africa. If it lands in the Pacific, flip the theta sign.

## 8. Non-negotiables

1. **A plain text nav exists in the header at all times.** The orbit is the experience, not the only route. A recruiter who will not wait for "Resume" to come around must not be stuck.
2. **Every star and moon is an `<a>` with a real href.** The scene is a presentation layer over working HTML navigation. With WebGL unavailable the site must still be fully navigable.
3. **`prefers-reduced-motion` freezes the orbit** into a deliberate, well-composed still with all six labels visible. Clicking still opens content — it just cuts instead of flying.
4. **Keyboard.** Arrow keys step between stars, Enter opens the focused one, Escape closes. Tab order follows orbit order. Visible focus rings on the DOM labels.
5. **Overlay focus management.** Opening an overlay moves focus into it and traps it; closing returns focus to the originating star's label.
6. **Mobile.** Below 640px: reduce orbit radius, tap to focus, ambient moons default to 0, cap device pixel ratio at 2, and disable the dev panel.
7. **Performance.** 60fps on a mid-range laptop. Pause the render loop when the tab is hidden. Scene code under 200 KB gzipped excluding Three.js.

## 9. Build order

Ship each phase working before starting the next. Stop after each and report.

1. Scene skeleton — Earth, six stars on a 25° orbit, correct lighting, no motion. Placeholder sphere for Earth is fine.
2. Motion — velocity model, drag, momentum, delta-time normalization.
3. Dev tuning panel. Build this early; every later phase is easier to tune with it.
4. Star icons, labels, and the front-crossing legibility treatment.
5. Camera fly-to, overlay, History API routing, Escape and back button.
6. Moons — ambient subset, focus expansion, moon click.
7. Real Earth asset, markers, starfield config.
8. Accessibility pass, reduced motion, mobile, plain-text nav fallback.

## 10. Acceptance

- A hard flick coasts two to three seconds before settling into drift.
- Stars stay clearly legible while crossing Earth's face.
- Section icons stay upright and readable at every orbital position.
- Back button reverses a fly-to. Loading `/projects` cold opens focused, with no fly-in.
- Tabbing reaches all six sections in orbit order with visible focus.
- Disabling JavaScript still leaves a navigable page.
- Every tuning slider changes the scene live with no reload.

## 11. Do not

- Do not add a scroll cue, a hero above the scene, or any content below the fold. The orbit is the whole page.
- Do not add a contact form. An email address is enough.
- Do not add sound.
- Do not fake the depth scaling with a manual multiplier.
- Do not hotlink the NASA asset.
- Do not carry over the old portfolio's generic project entries. The five listed projects are the set.