import { buildShopDoor } from "./doorway.js";
import { $, $$, esc } from "../../core/dom.js";
export function buildDJRoom({
  world,
  box,
  wood,
  dark,
  paper,
  hit,
  dj,
  T,
  mat,
  red,
  label,
  scene,
  go,
  twin,
  abnMark,
  rand,
  commerce,
}) {
  const djEquipmentStart = world.children.length;
  box(6.2, 0.22, 2.8, wood, 4, 1.45, 1.5);
  for (const x of [1.2, 6.8])
    for (const z of [0.3, 2.7]) box(0.15, 1.45, 0.15, dark, x, 0.7, z);
  const table = box(6.1, 0.09, 2.7, paper, 4, 1.6, 1.5);
  hit(table, "DJ booth — open turntable", dj.open);
  const disc = new T.Mesh(
    new T.CylinderGeometry(0.6, 0.6, 0.05, 64),
    mat("#111711", { metalness: 0.2 }),
  );
  disc.position.set(3.08, 1.84, 1.6);
  world.add(disc);
  hit(disc, "Drag the platter in the DJ booth", dj.open);
  const discLabel = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 0.06, 32), red);
  discLabel.position.copy(disc.position);
  discLabel.position.y += 0.02;
  world.add(discLabel);
  const silverDeck = mat("#a7aea5", { metalness: 0.5, roughness: 0.44 });
  for (const x of [3.08, 4.92]) {
    box(1.4, 0.14, 1.62, silverDeck, x, 1.72, 1.6);
    box(0.05, 0.04, 0.73, dark, x + 0.53, 1.84, 1.55);
    box(0.06, 0.04, 0.18, paper, x + 0.53, 1.87, 1.55);
    box(0.08, 0.05, 0.85, silverDeck, x + 0.38, 1.91, 1.4);
  }
  const discB = disc.clone(),
    discLabelB = discLabel.clone();
  discB.position.x = 4.92;
  discLabelB.position.x = 4.92;
  world.add(discB, discLabelB);
  hit(discB, "Deck B — open DJ mixer", dj.open);
  const mixerBody = box(0.36, 0.22, 1.25, dark, 4, 1.82, 1.6);
  hit(mixerBody, "Crossfader and pitch controls", dj.open);
  box(0.27, 0.025, 0.035, paper, 4, 1.95, 1.96);
  box(0.05, 0.035, 0.08, red, 3.9, 1.98, 1.96);
  label("THE DJ BOOTH", 4.3, 0.5, 4, 1, 2.96, "#dbc79c", "#2d3928", 68);
  for (const x of [1.45, 6.55]) {
    box(0.65, 1.1, 0.6, dark, x, 2.15, 1);
    for (const y of [1.9, 2.35]) {
      const o = new T.Mesh(
        new T.CylinderGeometry(0.18, 0.18, 0.05, 24),
        mat("#857556"),
      );
      o.rotation.x = Math.PI / 2;
      o.position.set(x, y, 1.34);
      world.add(o);
    }
  }
  const djEquipment = new T.Group();
  world.children.slice(djEquipmentStart).forEach((o) => djEquipment.add(o));
  world.add(djEquipment);
  djEquipment.position.set(-18.5, 0, -2);
  // Dedicated west-wing DJ room, reached through the shop's left wall.
  const djWall = mat("#282c2c"),
    djFrame = mat("#454e49", { metalness: 0.35, roughness: 0.6 });
  box(12.4, 0.24, 12.3, mat("#35372f"), -14.75, -0.12, 0.15);
  box(0.24, 6.7, 12.3, djWall, -21, 3.25, 0.15);
  box(12.5, 6.7, 0.24, djWall, -14.75, 3.25, -6);
  box(12.5, 6.7, 0.24, djWall, -14.75, 3.25, 6.3);
  box(12.5, 0.2, 12.3, djWall, -14.75, 6.6, 0.15);
  const foamCanvas = document.createElement("canvas");
  foamCanvas.width = foamCanvas.height = 256;
  const fq = foamCanvas.getContext("2d");
  fq.fillStyle = "#343a38";
  fq.fillRect(0, 0, 256, 256);
  fq.strokeStyle = "#464d4922";
  for (let j = 0; j < 256; j += 3) {
    fq.beginPath();
    fq.moveTo(j, 0);
    fq.lineTo(j, 256);
    fq.stroke();
    fq.beginPath();
    fq.moveTo(0, j);
    fq.lineTo(256, j);
    fq.stroke();
  }
  const foamTexture = new T.CanvasTexture(foamCanvas);
  foamTexture.colorSpace = T.SRGBColorSpace;
  const foam = mat("#b1bbb3", { map: foamTexture, roughness: 1 });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 9; col++) {
      const x = -20.1 + col * 1.35;
      box(1.15, 1.65, 0.2, foam, x, 1.1 + row * 1.9, -5.74);
      for (let rib = 0; rib < 4; rib++)
        box(
          0.04,
          1.65,
          0.08,
          djWall,
          x - 0.4 + rib * 0.27,
          1.1 + row * 1.9,
          -5.58,
        );
    }
    for (const side of [-1, 1])
      for (let col = 0; col < 6; col++) {
        const z = -4.7 + col * 1.9;
        if (side > 0 && z > -1.9 && z < 4.1) continue;
        box(
          0.2,
          1.65,
          1.65,
          foam,
          side < 0 ? -20.76 : -8.72,
          1.1 + row * 1.9,
          z,
        );
      }
  }
  for (const z of [-5.5, 5.85])
    box(
      11.6,
      0.035,
      0.035,
      new T.MeshBasicMaterial({ color: "#ba8c48" }),
      -14.75,
      0.14,
      z,
    );
  box(6.8, 0.018, 4.2, mat("#71392e"), -14.5, 0.02, -0.05);
  const djGlow = new T.PointLight("#f4c38e", 65, 18, 2);
  djGlow.position.set(-14.4, 5.8, 2);
  scene.add(djGlow);
  buildShopDoor({
    T,
    world,
    box,
    mat,
    label,
    hit,
    wood,
    x: -8.27,
    z: 2.6,
    facing: Math.PI / 2,
    title: "DJ BOOTH",
    action: () => go(1),
    color: "#81392d",
  });
  const djBack = label(
    "BACK TO THE RECORD SHOP",
    2.7,
    0.45,
    -8.75,
    4.43,
    2.6,
    "#e7d4aa",
    "#2e493b",
    70,
  );
  djBack.rotation.y = -Math.PI / 2;
  hit(djBack, "Return to the record shop", () => go(0));
  twin("Enter the DJ booth", () => go(1));
  const djMark = abnMark(2.3, -14.5, 4.6, -5.53);
  label("THE DJ BOOTH", 4, 0.65, -14.5, 5.62, -5.5, "#eddbc0", "#7d3729", 95);
  function productPoster(path, x, w = 2.4) {
    const texture = new T.TextureLoader().load(path);
    texture.colorSpace = T.SRGBColorSpace;
    const image = new T.Mesh(
      new T.PlaneGeometry(w, w * 0.79),
      new T.MeshBasicMaterial({ map: texture }),
    );
    image.position.set(x, 4.4, -5.5);
    world.add(image);
  }
  productPoster("assets/branding/bumpboxx-blue-camo.jpeg", -10.7);
  function makeBumpbox(title, x, y, z, scale, color, style, photo) {
    const start = world.children.length;
    let bodyMat = mat(color, { roughness: 0.6 });
    if (style === "camo") {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const q = c.getContext("2d");
      q.fillStyle = "#6b7479";
      q.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 35; i++) {
        q.fillStyle = ["#28a7d0", "#444e58", "#9ca8b0"][i % 3];
        q.beginPath();
        const a = rand() * 256,
          b = rand() * 256;
        q.moveTo(a, b);
        q.lineTo(a + 20 + rand() * 40, b - 8);
        q.lineTo(a + 35, b + 28);
        q.lineTo(a - 15, b + 42);
        q.closePath();
        q.fill();
      }
      const tx = new T.CanvasTexture(c);
      tx.colorSpace = T.SRGBColorSpace;
      bodyMat = mat("#ffffff", { map: tx, roughness: 0.7 });
    }
    const body = box(3.5, 1.8, 0.7, bodyMat, 0, 0.9, 0);
    const edge = mat("#1d2626"),
      ring = mat(style === "camo" ? "#249ec8" : "#576361", {
        metalness: 0.4,
        roughness: 0.6,
      });
    for (const side of [-1, 1]) {
      box(0.12, 1.9, 0.8, edge, side * 1.72, 0.9, 0);
      box(0.1, 0.35, 0.1, djFrame, side * 1.22, 2.05, 0);
    }
    box(
      2.7,
      0.12,
      0.15,
      style === "camo" ? edge : mat("#bdc7c5", { metalness: 0.65 }),
      0,
      2.23,
      0,
    );
    const spots =
      style === "red"
        ? [
            [-0.83, 0.53, 0.4],
            [0.83, 0.53, 0.4],
            [-0.83, 1.33, 0.4],
            [0.83, 1.33, 0.4],
          ]
        : [
            [-1, 0.78, 0.56],
            [1, 0.78, 0.56],
            [0, 0.45, 0.22],
          ];
    for (const [xx, yy, r] of spots) {
      const outer = new T.Mesh(new T.CylinderGeometry(r, r, 0.06, 40), ring);
      outer.rotation.x = Math.PI / 2;
      outer.position.set(xx, yy, 0.39);
      world.add(outer);
      const inner = new T.Mesh(
        new T.CylinderGeometry(r * 0.82, r * 0.82, 0.07, 40),
        edge,
      );
      inner.rotation.x = Math.PI / 2;
      inner.position.set(xx, yy, 0.44);
      world.add(inner);
      const hub = new T.Mesh(
        new T.SphereGeometry(r * 0.27, 16, 10),
        mat("#3b4847"),
      );
      hub.scale.z = 0.25;
      hub.position.set(xx, yy, 0.49);
      world.add(hub);
    }
    label(
      "b",
      0.45,
      0.62,
      0,
      1.1,
      0.39,
      "#20a4dd",
      style === "red" ? "#a62c2a" : "#273236",
      140,
    );
    label(
      "bumpboxx",
      1.6,
      0.22,
      0,
      1.62,
      0.39,
      "#ecede4",
      style === "red" ? "#a62c2a" : "#273236",
      80,
    );
    hit(body, title, () => commerce.bumpboxDisplay(title, photo));
    twin(title, () => commerce.bumpboxDisplay(title, photo));
    const group = new T.Group();
    world.children.slice(start).forEach((o) => group.add(o));
    group.position.set(x, y, z);
    group.scale.setScalar(scale);
    world.add(group);
    return group;
  }
  for (const x of [-18.3, -14.5, -10.7]) {
    box(3.1, 1.05, 1.2, wood, x, 0.52, -4.8);
    box(2.95, 0.1, 1.1, djFrame, x, 1.09, -4.8);
  }
  makeBumpbox(
    "Bumpboxx / ABN red display",
    -18.3,
    1.16,
    -4.8,
    0.7,
    "#ae2a2e",
    "red",
    null,
  );
  makeBumpbox(
    "Bumpboxx / gray display",
    -14.5,
    1.16,
    -4.8,
    0.75,
    "#404b4e",
    "gray",
    "assets/branding/bumpboxx-flare.jpeg",
  );
  makeBumpbox(
    "Bumpboxx / blue camo display",
    -10.7,
    1.16,
    -4.8,
    0.7,
    "#627686",
    "camo",
    "assets/branding/bumpboxx-blue-camo.jpeg",
  );
  // Apparel and accessory fixtures replace the old booth in the record shop.

  return { disc, discLabel, discB, discLabelB };
}
