import { $, $$, esc } from "../../core/dom.js";
export function buildVisitors({ T, rand, world, ghosts }) {
  const ghostMat = new T.MeshStandardMaterial({
    color: "#bfb38b",
    transparent: true,
    opacity: 0.1,
    depthWrite: false,
    roughness: 1,
  });
  for (let i = 0; i < 8; i++) {
    const group = new T.Group();
    const body = new T.Mesh(new T.CapsuleGeometry(0.2, 0.65, 4, 8), ghostMat);
    body.position.y = 0.9;
    const head = new T.Mesh(new T.SphereGeometry(0.15, 12, 8), ghostMat);
    head.position.y = 1.6;
    group.add(body, head);
    group.position.set(-6 + rand() * 12, 0, rand() * 5);
    group.userData = {
      x: group.position.x,
      z: group.position.z,
      phase: rand() * 7,
    };
    world.add(group);
    ghosts.push(group);
  }

  return {};
}
