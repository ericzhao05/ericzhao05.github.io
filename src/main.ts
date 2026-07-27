import "./styles/main.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";

import * as THREE from "three";
import { COLORS } from "./data/colors";
import { config, isMobile, isDevEnabled, prefersReducedMotion } from "./config";
import { Minimap } from "./scene/minimap";
import { createEarth } from "./scene/earth";
import { OrbitSystem } from "./scene/orbit";
import { createStarfield } from "./scene/starfield";
import { createLighting } from "./scene/lighting";
import { LabelManager } from "./scene/labels";
import { CameraRig } from "./camera/flyto";
import { Motion } from "./motion/drift";
import { Overlay } from "./overlay/overlay";
import { Router } from "./router/router";
import { initDevPanel } from "./devpanel/devpanel";
import { initKeyboard } from "./a11y/keyboard";
import type { Star } from "./scene/star";
import type { Moon } from "./scene/moon";

// ---------- Mobile / reduced-motion defaults (spec §8.3 / §8.6) ----------
const reduced = prefersReducedMotion();
if (isMobile()) {
  config.ambientMoons = 0;
  config.orbitRadius = 1.55;
}

// ---------- Renderer ----------
const root = document.getElementById("scene-root")!;
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap DPR (§8.6)
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
root.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.ink);

// ---------- Scene graph ----------
const earth = createEarth(1);
scene.add(earth.group);

const orbit = new OrbitSystem();
scene.add(orbit.group);

// Starfield on layer 1 so the top-down minimap can exclude it.
const starfield = createStarfield();
starfield.traverse((o) => o.layers.set(1));
scene.add(starfield);
scene.add(createLighting());

const rig = new CameraRig(window.innerWidth / window.innerHeight);
rig.camera.layers.enable(1); // main camera sees the starfield too

const minimap = isDevEnabled() ? new Minimap() : null;

// ---------- State ----------
const motion = new Motion();
motion.frozen = reduced;
const overlay = new Overlay();
let focusedStar: Star | null = null;

function setMoonStates() {
  for (const star of orbit.stars) {
    star.moons.forEach((moon, i) => {
      const show = focusedStar === star ? true : i < config.ambientMoons;
      moon.setVisible(show);
    });
  }
}

// ---------- Focus / unfocus ----------
function starForSectionId(id: string): Star | undefined {
  return orbit.stars.find((s) => s.section.id === id);
}

function focusStar(star: Star, instant: boolean, origin: HTMLElement | null) {
  focusedStar = star;
  rig.focus(star, instant || reduced);
  overlay.openSection(star.section, origin, () => router.go(null));
  setMoonStates();
}

function unfocus() {
  focusedStar = null;
  overlay.close();
  rig.toIdle(reduced);
  setMoonStates();
}

// ---------- Router ----------
const router = new Router((section) => {
  if (section) {
    const star = starForSectionId(section.id);
    if (star) {
      const origin = labels.starLabels.find((l) => l.star === star)?.el ?? null;
      focusStar(star, false, origin);
    }
  } else {
    unfocus();
  }
});

// ---------- Labels & selection ----------
const labels = new LabelManager(
  orbit,
  (star) => router.go(star.section),
  (moon: Moon, parent: Star) => {
    if (focusedStar !== parent) router.go(parent.section);
    overlay.openSection(parent.section, null, () => router.go(null));
    overlay.showMoon(parent.section, moon.data);
  }
);

initKeyboard(labels.starLabels.map((l) => l.el));

// Click on a star/moon sphere in the 3D scene (drag-vs-click handled by Motion).
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
motion.attach(renderer.domElement, (x, y) => {
  ndc.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(ndc, rig.camera);
  const hits = raycaster.intersectObjects(orbit.group.children, true);
  for (const hit of hits) {
    let o: THREE.Object3D | null = hit.object;
    while (o) {
      if (o.userData.star) {
        router.go((o.userData.star as Star).section);
        return;
      }
      o = o.parent;
    }
  }
});

// ---------- Dev panel ----------
initDevPanel((key) => {
  if (key === "ambientMoons") setMoonStates();
});

// ---------- Deep link bootstrap (cold load opens focused, no fly-in, §4) ----------
// Position stars once so instant framing has correct world positions.
orbit.update(motion.angle, rig.camera, 0);
const initial = router.bootstrap();
if (initial) {
  const star = starForSectionId(initial.id);
  if (star) {
    const origin = labels.starLabels.find((l) => l.star === star)?.el ?? null;
    focusStar(star, true, origin);
  }
} else {
  setMoonStates();
}

// ---------- Render loop ----------
const clock = new THREE.Clock();
let running = true;

function frame() {
  if (!running) return;
  const dt = Math.min(clock.getDelta(), 0.05);

  if (!motion.frozen) {
    if (focusedStar) motion.easeToStop(dt);
    else motion.update(dt);
  }

  orbit.update(motion.angle, rig.camera, dt);
  earth.group.scale.setScalar(config.earthSize); // live Earth size
  earth.mesh.rotation.y += dt * 0.03; // slow Earth spin
  rig.update(dt);
  const earthR = earth.radius * config.earthSize;
  labels.update(rig.camera, earthR, window.innerWidth, window.innerHeight, focusedStar, dt);

  renderer.render(scene, rig.camera);
  minimap?.render(renderer, scene, config.orbitRadius * Math.max(1, config.ovalRatio));
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// ---------- Lifecycle ----------
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  rig.resize(window.innerWidth / window.innerHeight);
});

// Pause the loop when the tab is hidden (spec §8.7).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    running = false;
  } else if (!running) {
    running = true;
    clock.getDelta(); // discard the gap
    requestAnimationFrame(frame);
  }
});
