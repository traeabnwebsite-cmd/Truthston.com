import { $, $$, esc } from "../../core/dom.js";
export function buildMerchRoom({
  mat,
  box,
  T,
  dark,
  world,
  hit,
  commerce,
  abnTexture,
  label,
  twin,
  wood,
}) {
  const rackSteel = mat("#b1bbb7", { metalness: 0.65, roughness: 0.4 });
  for (const x of [2.7, 5.7]) {
    box(0.07, 2.8, 0.07, rackSteel, x, 1.4, 1.55);
    box(0.65, 0.07, 1.5, rackSteel, x, 0.12, 1.55);
    for (const z of [0.88, 2.22]) {
      const wheel = new T.Mesh(new T.SphereGeometry(0.09, 10, 8), dark);
      wheel.position.set(x, 0.08, z);
      world.add(wheel);
    }
  }
  box(3.1, 0.07, 0.07, rackSteel, 4.2, 2.8, 1.55);
  function hangingTee(x, z, color, yaw) {
    const shape = new T.Shape();
    shape.moveTo(-0.16, 0.49);
    shape.lineTo(-0.4, 0.4);
    shape.lineTo(-0.54, 0.12);
    shape.lineTo(-0.33, 0.02);
    shape.lineTo(-0.23, 0.22);
    shape.lineTo(-0.23, -0.55);
    shape.lineTo(0.23, -0.55);
    shape.lineTo(0.23, 0.22);
    shape.lineTo(0.33, 0.02);
    shape.lineTo(0.54, 0.12);
    shape.lineTo(0.4, 0.4);
    shape.lineTo(0.16, 0.49);
    shape.quadraticCurveTo(0, 0.3, -0.16, 0.49);
    const shirt = new T.Mesh(
      new T.ExtrudeGeometry(shape, {
        depth: 0.045,
        bevelEnabled: true,
        bevelSize: 0.015,
        bevelThickness: 0.015,
        bevelSegments: 1,
        steps: 1,
      }),
      mat(color, { roughness: 1 }),
    );
    shirt.position.set(x, 2.05, z);
    shirt.rotation.y = yaw;
    world.add(shirt);
    hit(shirt, "Browse ABN apparel", commerce.merch);
    const logo = new T.Mesh(
      new T.PlaneGeometry(0.33, 0.18),
      new T.MeshBasicMaterial({ map: abnTexture }),
    );
    logo.position.set(x, 2.15, z + 0.065);
    world.add(logo);
    for (const side of [-1, 1]) {
      const h = box(0.32, 0.025, 0.025, rackSteel, x + side * 0.12, 2.56, z);
      h.rotation.z = side * 0.42;
    }
    box(0.025, 0.16, 0.025, rackSteel, x, 2.72, z);
  }
  ["#24332d", "#b34934", "#d5c7a6", "#2b3130", "#315d48"].forEach((color, i) =>
    hangingTee(2.9 + i * 0.64, 1.55 + (i % 2) * 0.13, color, (i - 2) * 0.035),
  );
  const merchSign = label(
    "APPAREL / THE MERCH STORE",
    3.6,
    0.45,
    4.2,
    3.33,
    1.55,
    "#efdfbd",
    "#843c2b",
    90,
  );
  hit(merchSign, "Enter the merch store", commerce.merch);
  const merchPick = new T.Mesh(
    new T.BoxGeometry(3.8, 3.5, 1.9),
    new T.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  merchPick.position.set(4.2, 1.75, 1.5);
  world.add(merchPick);
  hit(merchPick, "Enter the ABN merch store", commerce.merch);
  twin("Enter the ABN merch store", commerce.merch);
  box(3.8, 1.1, 0.9, wood, 4.4, 0.55, -0.5);
  for (let i = 0; i < 5; i++)
    box(
      0.65,
      0.07,
      0.55,
      mat(i % 2 ? "#2b4435" : "#d4c7a7"),
      2.9 + i * 0.72,
      1.14,
      -0.5,
    );
  for (const x of [3, 4.4, 5.8]) {
    const cap = new T.Mesh(
      new T.SphereGeometry(0.27, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(x === 4.4 ? "#ae412f" : "#2c503d"),
    );
    cap.position.set(x, 1.25, -0.5);
    world.add(cap);
    const bill = box(0.42, 0.04, 0.38, mat("#2e4837"), x, 1.26, -0.2);
    hit(bill, "Browse ABN caps and accessories", commerce.merch);
  }
  label(
    "CAPS / TEES / EVERYDAY GOODS",
    3.6,
    0.38,
    4.4,
    0.65,
    -0.01,
    "#ead9b4",
    "#2d4c3c",
    80,
  );

  // A separate, enclosed screening lounge beyond the shop's east wall.

  return {};
}
