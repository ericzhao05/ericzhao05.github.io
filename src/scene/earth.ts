import * as THREE from "three";
import { COLORS } from "../data/colors";

export interface EarthRig {
  group: THREE.Group; // tilted axis; rotates slowly
  mesh: THREE.Mesh;
  markers: THREE.Group; // children of the mesh — rotate with Earth
  radius: number;
  setTexture: (tex: THREE.Texture) => void;
}

// Placeholder Earth: a shaded sphere with a procedural land/ocean feel until the
// real NASA asset lands (spec §7 / build phase 7). Includes a fresnel limb
// vignette shell so stars crossing the face keep their silhouette (spec §2).
export function createEarth(radius = 1): EarthRig {
  const group = new THREE.Group();
  group.rotation.z = THREE.MathUtils.degToRad(23.4); // axial tilt

  const geo = new THREE.SphereGeometry(radius, 64, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(COLORS.lapis).multiplyScalar(0.7),
    roughness: 0.85,
    metalness: 0.0,
    emissive: new THREE.Color(COLORS.lapis).multiplyScalar(0.06),
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Limb vignette: a slightly larger front-side shell that is opaque only at
  // grazing angles (the limb), darkening Earth's edge so a lit star reads
  // against it. Fresnel via a tiny ShaderMaterial.
  const vignette = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.015, 64, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uPower: { value: 3.0 }, uStrength: { value: 0.85 } },
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
        uniform float uPower; uniform float uStrength;
        void main() {
          float f = 1.0 - max(dot(vN, vView), 0.0);
          float a = pow(f, uPower) * uStrength;
          gl_FragColor = vec4(0.0, 0.02, 0.01, a);
        }`,
    })
  );
  mesh.add(vignette);

  const markers = new THREE.Group();
  mesh.add(markers);

  const setTexture = (tex: THREE.Texture) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.emissive.set(0x000000);
    mat.needsUpdate = true;
  };

  return { group, mesh, markers, radius, setTexture };
}

// lat/lon (degrees) -> position on the sphere. Standard equirectangular mapping.
// Verified by dropping a marker at (0,0): must land in the Gulf of Guinea. If it
// lands in the Pacific, flip the sign on theta (spec §7).
export function latLonToVec3(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
