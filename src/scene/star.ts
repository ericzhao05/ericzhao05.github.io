import * as THREE from "three";
import type { Section } from "../data/sections";
import { COLORS } from "../data/colors";
import { ICONS } from "../data/icons";
import { svgTexture } from "./textures";
import { Moon } from "./moon";

const _camLocal = new THREE.Vector3();

// A star: a colored sphere with a billboarded icon on its camera-facing side and
// a phosphor rim light that separates it from whatever is behind (spec §2).
export class Star {
  group = new THREE.Group();
  core: THREE.Mesh;
  icon: THREE.Sprite;
  moons: Moon[] = [];
  readonly color: THREE.Color;
  private baseSize: number; // geometry built at this size; slider scales the group

  constructor(public section: Section, starSize: number) {
    this.baseSize = starSize;
    this.color = new THREE.Color(COLORS[section.color]);

    // Core sphere.
    this.core = new THREE.Mesh(
      new THREE.SphereGeometry(starSize, 32, 24),
      new THREE.MeshStandardMaterial({
        color: this.color,
        roughness: 0.42,
        metalness: 0.05,
        emissive: this.color.clone().multiplyScalar(0.18),
      })
    );
    this.core.userData.star = this; // for raycasting
    this.group.add(this.core);

    // Phosphor rim light — a back-side fresnel shell, additive.
    const rim = new THREE.Mesh(
      new THREE.SphereGeometry(starSize * 1.2, 32, 24),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: { uColor: { value: new THREE.Color(COLORS.phosphor) } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vView;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vN; varying vec3 vView;
          uniform vec3 uColor;
          void main() {
            float f = pow(1.0 - max(dot(vN, -vView), 0.0), 3.2);
            gl_FragColor = vec4(uColor * f, f * 0.85);
          }`,
      })
    );
    this.group.add(rim);

    // Billboarded icon (Sprite = always camera-facing and upright).
    this.icon = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: svgTexture(ICONS[section.icon] ?? ICONS.projects),
        transparent: true,
        depthTest: true,
        depthWrite: false,
      })
    );
    const s = starSize * 1.15;
    this.icon.scale.set(s, s, s);
    this.group.add(this.icon);

    // Moons (children of this star's group → inherit orbital motion).
    if (section.moons) {
      section.moons.forEach((m, i) => {
        const moon = new Moon(m, i, section.moons!.length, this.color, starSize);
        this.moons.push(moon);
        this.group.add(moon.holder);
      });
    }
  }

  // The size slider (and optional depth multiplier) scale the whole group
  // uniformly, keeping the icon, rim, and moon orbits consistent. Geometry stays
  // at baseSize.
  setDisplay(starSize: number, depthFactor = 1) {
    this.group.scale.setScalar((starSize / this.baseSize) * depthFactor);
  }

  update(camera: THREE.Camera, dt: number, moonSpeed: number) {
    // Keep the icon sitting on the camera-facing surface of the sphere. Local
    // space is unscaled, so offset by baseSize.
    _camLocal.copy(camera.position);
    this.group.worldToLocal(_camLocal);
    _camLocal.normalize().multiplyScalar(this.baseSize * 1.12);
    this.icon.position.copy(_camLocal);

    for (const moon of this.moons) moon.update(dt, moonSpeed);
  }

  get worldPosition(): THREE.Vector3 {
    return this.group.getWorldPosition(new THREE.Vector3());
  }
}
