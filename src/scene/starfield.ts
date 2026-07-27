import * as THREE from "three";
import {
  CUSTOM_STARS,
  proceduralStarfield,
  type StarSpriteConfig,
} from "../data/starfield";
import { COLORS } from "../data/colors";

// Data-driven starfield (spec §5): procedural points by default, plus any
// owner-supplied bright sprites from CUSTOM_STARS.
export function createStarfield(): THREE.Group {
  const group = new THREE.Group();

  // Procedural points.
  const { positions, brightness, sizes, phase } = proceduralStarfield();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aBright", new THREE.BufferAttribute(brightness, 1));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(COLORS.bone) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      attribute float aBright; attribute float aSize; attribute float aPhase;
      varying float vBright;
      uniform float uPixelRatio; uniform float uTime;
      void main() {
        // Gentle twinkle so brighter stars shimmer.
        float tw = 0.75 + 0.25 * sin(uTime * 2.2 + aPhase);
        vBright = aBright * tw;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aSize * uPixelRatio * (60.0 / -mv.z) * (0.85 + 0.15 * tw);
      }`,
    fragmentShader: /* glsl */ `
      varying float vBright;
      uniform vec3 uColor;
      void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        // Bright sharp core + soft halo = "shiny".
        float core = smoothstep(0.5, 0.0, r);
        float halo = smoothstep(0.5, 0.15, r);
        float a = (core * core + halo * 0.35) * vBright;
        gl_FragColor = vec4(uColor * (1.0 + core * 0.6), a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.onBeforeRender = () => {
    mat.uniforms.uTime.value = performance.now() / 1000;
  };
  group.add(points);

  // Owner sprites (none by default).
  for (const s of CUSTOM_STARS) group.add(makeSprite(s));

  return group;
}

function makeSprite(cfg: StarSpriteConfig): THREE.Sprite {
  const loader = new THREE.TextureLoader();
  const map = cfg.texture ? loader.load(cfg.texture) : null;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: map ?? undefined,
      color: new THREE.Color(COLORS.bone),
      transparent: true,
      opacity: cfg.brightness,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  sprite.position.set(...cfg.position);
  sprite.scale.setScalar(cfg.scale);
  return sprite;
}
