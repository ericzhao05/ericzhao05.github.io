import * as THREE from "three";

// Key + fill lighting. Sun-like key from the upper right, low ambient so the
// unlit sides read dark (space), and a faint cool fill so silhouettes never
// crush to pure black.
export function createLighting(): THREE.Group {
  const group = new THREE.Group();

  const key = new THREE.DirectionalLight(0xfff1dd, 2.1);
  key.position.set(5, 3, 4);
  group.add(key);

  const fill = new THREE.DirectionalLight(0x2e4ea4, 0.35);
  fill.position.set(-4, -1, 2);
  group.add(fill);

  group.add(new THREE.AmbientLight(0x22303a, 0.5));

  return group;
}
