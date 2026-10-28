import { $, $$, esc } from "../../core/dom.js";
export function createVenueMaterials({ T, rand, mat, world }) {
  function masonryMaterial(color) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const q = c.getContext("2d");
    q.fillStyle = "#6c665e";
    q.fillRect(0, 0, 256, 256);
    const base = new T.Color(color);
    for (let row = 0; row < 24; row++)
      for (let col = -1; col < 11; col++) {
        const tint = base.clone().multiplyScalar(0.84 + rand() * 0.28);
        q.fillStyle = "#" + tint.getHexString();
        q.fillRect(col * 26 + (row % 2) * 13, row * 11, 25, 10);
      }
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(3, 2);
    return mat("#ffffff", { map: t, roughness: 0.94 });
  }
  const architecturalBrick = masonryMaterial("#8f5140"),
    limestone = mat("#c6bba2"),
    copperGreen = mat("#497a71", { metalness: 0.42, roughness: 0.62 }),
    venueGlass = mat("#254c53", {
      metalness: 0.7,
      roughness: 0.2,
      emissive: "#a0b4a1",
      emissiveIntensity: 0.08,
    });
  function venueArch(width, height, x, y, z, m, ry = 0) {
    const sh = new T.Shape();
    sh.moveTo(-width / 2, 0);
    sh.lineTo(width / 2, 0);
    sh.lineTo(width / 2, height - width / 2);
    sh.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
    sh.lineTo(-width / 2, 0);
    const mesh = new T.Mesh(new T.ShapeGeometry(sh, 20), m);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    world.add(mesh);
    return mesh;
  }
  function venueSphere(r, yScale, m, x, y, z) {
    const o = new T.Mesh(
      new T.SphereGeometry(r, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2),
      m,
    );
    o.scale.y = yScale;
    o.position.set(x, y, z);
    world.add(o);
    return o;
  }

  return {
    architecturalBrick,
    limestone,
    copperGreen,
    venueGlass,
    venueArch,
    venueSphere,
  };
}
