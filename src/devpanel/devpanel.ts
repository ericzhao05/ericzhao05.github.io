import { config, DEFAULTS, isDevEnabled, type OrbitConfig } from "../config";

interface Slider {
  key: keyof OrbitConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: Slider[] = [
  { key: "tiltX", label: "Tilt X° (out of plane)", min: -180, max: 180, step: 1 },
  { key: "tiltY", label: "Tilt Y° (in plane)", min: -180, max: 180, step: 1 },
  { key: "tiltZ", label: "Tilt Z° (roll)", min: -180, max: 180, step: 1 },
  { key: "orbitRadius", label: "Orbit radius", min: 0.8, max: 10, step: 0.05 },
  { key: "ovalRatio", label: "Ovalness", min: 1, max: 3, step: 0.02 },
  { key: "ovalDir", label: "Oval direction°", min: -180, max: 180, step: 1 },
  { key: "earthSize", label: "Earth size", min: 0.3, max: 6, step: 0.05 },
  { key: "driftSpeed", label: "Drift speed (± = dir)", min: -10, max: 10, step: 0.1 },
  { key: "weight", label: "WEIGHT", min: 0.005, max: 0.2, step: 0.005 },
  { key: "ambientMoons", label: "Ambient moons", min: 0, max: 6, step: 1 },
  { key: "starSize", label: "Star size", min: 0.1, max: 0.8, step: 0.01 },
  { key: "depthScale", label: "Depth scale", min: 0, max: 1.5, step: 0.05 },
  { key: "fov", label: "Camera FOV°", min: 20, max: 80, step: 1 },
];

// Five guesses at the reference sketch: big Earth, wide tilted oval, a large star
// at the front crossing Earth's face, a small one at the back. They vary how the
// front/back drama is produced (depth multiplier vs FOV vs Earth size vs tilt).
const PRESETS: { name: string; config: Partial<OrbitConfig> }[] = [
  {
    name: "① Reference",
    config: { tiltX: 24, tiltY: 0, tiltZ: -12, orbitRadius: 6, ovalRatio: 1.7, ovalDir: 0, earthSize: 2.8, driftSpeed: 0.25, weight: 0.06, ambientMoons: 3, starSize: 0.5, depthScale: 1.3, fov: 58 },
  },
  {
    name: "② Big Front",
    config: { tiltX: 22, tiltY: 0, tiltZ: -10, orbitRadius: 5.5, ovalRatio: 1.6, ovalDir: 0, earthSize: 2.6, driftSpeed: 0.3, weight: 0.07, ambientMoons: 3, starSize: 0.55, depthScale: 1.5, fov: 64 },
  },
  {
    name: "③ Grand Earth",
    config: { tiltX: 20, tiltY: 0, tiltZ: -14, orbitRadius: 7, ovalRatio: 1.8, ovalDir: 0, earthSize: 3.6, driftSpeed: 0.2, weight: 0.06, ambientMoons: 3, starSize: 0.6, depthScale: 1.25, fov: 55 },
  },
  {
    name: "④ Flat Sweep",
    config: { tiltX: 12, tiltY: 0, tiltZ: -8, orbitRadius: 6.5, ovalRatio: 1.9, ovalDir: 0, earthSize: 2.7, driftSpeed: 0.35, weight: 0.08, ambientMoons: 3, starSize: 0.5, depthScale: 1.35, fov: 60 },
  },
  {
    name: "⑤ Cinematic",
    config: { tiltX: 26, tiltY: 0, tiltZ: -16, orbitRadius: 6, ovalRatio: 1.65, ovalDir: 0, earthSize: 3, driftSpeed: 0.25, weight: 0.065, ambientMoons: 3, starSize: 0.52, depthScale: 1.2, fov: 70 },
  },
  // ---- Five more, all cinematic (wide FOV, big Earth, strong front/back drama) ----
  {
    name: "⑥ Cine · Wide",
    config: { tiltX: 24, tiltY: 0, tiltZ: -14, orbitRadius: 6, ovalRatio: 1.7, ovalDir: 0, earthSize: 3.2, driftSpeed: 0.3, weight: 0.06, ambientMoons: 3, starSize: 0.55, depthScale: 1.35, fov: 76 },
  },
  {
    name: "⑦ Cine · Reverse",
    config: { tiltX: 22, tiltY: 0, tiltZ: 12, orbitRadius: 6.2, ovalRatio: 1.8, ovalDir: 0, earthSize: 3, driftSpeed: -0.35, weight: 0.06, ambientMoons: 3, starSize: 0.55, depthScale: 1.3, fov: 70 },
  },
  {
    name: "⑧ Cine · Deep",
    config: { tiltX: 26, tiltY: 0, tiltZ: -18, orbitRadius: 6.5, ovalRatio: 1.9, ovalDir: 0, earthSize: 2.8, driftSpeed: 0.4, weight: 0.07, ambientMoons: 3, starSize: 0.6, depthScale: 1.5, fov: 72 },
  },
  {
    name: "⑨ Cine · Edge",
    config: { tiltX: 10, tiltY: 0, tiltZ: -8, orbitRadius: 7, ovalRatio: 2, ovalDir: 0, earthSize: 3.4, driftSpeed: 0.25, weight: 0.06, ambientMoons: 3, starSize: 0.58, depthScale: 1.4, fov: 74 },
  },
  {
    name: "⑩ Cine · Fast",
    config: { tiltX: 28, tiltY: 0, tiltZ: -20, orbitRadius: 5.8, ovalRatio: 1.65, ovalDir: 0, earthSize: 3, driftSpeed: 1.2, weight: 0.05, ambientMoons: 3, starSize: 0.54, depthScale: 1.25, fov: 78 },
  },
];

// Dev-only tuning panel (spec §6). Live sliders, copy-JSON, a JSON paste box, and
// preset buttons — all gated to localhost / ?dev.
export function initDevPanel(onChange: (key: keyof OrbitConfig) => void) {
  if (!isDevEnabled()) return;

  const root = document.getElementById("devpanel-root") as HTMLDivElement;
  root.classList.add("on");
  root.innerHTML = `<div class="dev-title">Tuning · ?dev</div>`;

  const inputs = new Map<keyof OrbitConfig, HTMLInputElement>();
  const vals = new Map<keyof OrbitConfig, HTMLElement>();

  for (const s of SLIDERS) {
    const row = document.createElement("div");
    row.className = "dev-row";
    const value = config[s.key];
    row.innerHTML = `
      <label>${s.label}</label>
      <span class="val" id="val-${s.key}">${fmt(value, s.step)}</span>
      <input type="range" min="${s.min}" max="${s.max}" step="${s.step}" value="${value}" />`;
    const input = row.querySelector("input")!;
    const val = row.querySelector(".val") as HTMLElement;
    inputs.set(s.key, input);
    vals.set(s.key, val);
    input.addEventListener("input", () => {
      const v = parseFloat(input.value);
      (config[s.key] as number) = v;
      val.textContent = fmt(v, s.step);
      onChange(s.key);
    });
    root.appendChild(row);
  }

  // Reflect the current config object back into every slider + label, and fire
  // side-effecting onChange handlers.
  function refreshUI() {
    for (const s of SLIDERS) {
      inputs.get(s.key)!.value = String(config[s.key]);
      vals.get(s.key)!.textContent = fmt(config[s.key], s.step);
      onChange(s.key);
    }
  }

  // Apply a (partial) config: any field NOT present falls back to its default.
  function applyConfig(obj: Partial<Record<keyof OrbitConfig, unknown>>) {
    const next: OrbitConfig = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as (keyof OrbitConfig)[]) {
      const v = obj[key];
      if (typeof v === "number" && isFinite(v)) next[key] = v;
    }
    Object.assign(config, next);
    refreshUI();
  }

  const copy = mkButton(root, "Copy config JSON");
  copy.addEventListener("click", async () => {
    const json = JSON.stringify({ ...config }, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      copy.textContent = "Copied ✓";
    } catch {
      copy.textContent = "Copy failed — see console";
      console.log(json);
    }
    setTimeout(() => (copy.textContent = "Copy config JSON"), 1400);
  });

  // JSON paste box.
  const pasteWrap = document.createElement("div");
  pasteWrap.className = "dev-paste";
  pasteWrap.innerHTML = `
    <label>Paste config JSON</label>
    <textarea rows="4" placeholder='{ "earthSize": 3, "ovalRatio": 1.8 }'></textarea>
    <div class="dev-paste-row">
      <button class="dev-copy dev-apply">Apply JSON</button>
      <span class="dev-paste-msg"></span>
    </div>`;
  root.appendChild(pasteWrap);
  const textarea = pasteWrap.querySelector("textarea")!;
  const msg = pasteWrap.querySelector(".dev-paste-msg") as HTMLElement;
  pasteWrap.querySelector(".dev-apply")!.addEventListener("click", () => {
    try {
      const obj = JSON.parse(textarea.value);
      if (typeof obj !== "object" || obj === null) throw new Error("not an object");
      applyConfig(obj);
      msg.textContent = "applied ✓";
      msg.style.color = "var(--phosphor)";
    } catch (e) {
      msg.textContent = "invalid JSON";
      msg.style.color = "var(--cinnabar, #ce3b23)";
    }
    setTimeout(() => (msg.textContent = ""), 1800);
  });

  const reset = mkButton(root, "Reset to defaults");
  reset.style.marginTop = "0.35rem";
  reset.style.background = "transparent";
  reset.style.color = "var(--phosphor)";
  reset.style.border = "1px solid var(--phosphor-dim)";
  reset.addEventListener("click", () => applyConfig({}));

  buildPresetPanel(applyConfig);
}

function buildPresetPanel(apply: (o: Partial<OrbitConfig>) => void) {
  const panel = document.createElement("div");
  panel.id = "preset-panel";
  panel.innerHTML = `<div class="preset-title">Presets</div>`;
  for (const p of PRESETS) {
    const b = document.createElement("button");
    b.className = "preset-btn";
    b.textContent = p.name;
    b.addEventListener("click", () => apply(p.config));
    panel.appendChild(b);
  }
  document.body.appendChild(panel);
}

function mkButton(root: HTMLElement, label: string): HTMLButtonElement {
  const b = document.createElement("button");
  b.className = "dev-copy";
  b.textContent = label;
  root.appendChild(b);
  return b;
}

const fmt = (v: number, step: number) =>
  step >= 1 ? String(Math.round(v)) : v.toFixed(step >= 0.1 ? 2 : 3);
