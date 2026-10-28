import { buildBroadcastRooms } from "./broadcast-rooms.js";
export function buildStoreExpansion({
  T,
  world,
  box,
  mat,
  wood,
  dark,
  paper,
  label,
  hit,
  twin,
  go,
  store,
  commerce,
}) {
  const cream = mat("#d5c19a"),
    red = mat("#87382e"),
    brass = mat("#ba9555", { metalness: 0.45 });
  // Checkout belongs at the back; the front entrance and former Giving area stay clear.
  const cx = 0,
    cz = -3.4;
  const counter = box(4.2, 1.1, 1.05, wood, cx, 0.55, cz);
  const counterTop = box(4.45, 0.12, 1.2, dark, cx, 1.16, cz);
  counter.name = "rear-checkout-counter";
  counterTop.name = "rear-checkout-countertop";
  for (const surface of [counter, counterTop])
    hit(surface, "Checkout with Reign", () => store.navigate("checkout"));
  const badge = label(
    "REIGN",
    1.2,
    0.25,
    cx,
    0.7,
    cz + 0.54,
    "#e9d7ae",
    "#493927",
    70,
  );
  hit(badge, "Meet Reign at checkout", () => store.navigate("checkout"));
  twin("Meet Reign at checkout", () => store.navigate("checkout"));
  box(0.7, 0.43, 0.18, dark, cx + 0.9, 1.5, cz + 0.05);
  label(
    "$0.00",
    0.58,
    0.2,
    cx + 0.9,
    1.52,
    cz + 0.16,
    "#a7edab",
    "#18291e",
    38,
  );
  box(0.75, 0.1, 0.48, dark, cx + 0.9, 1.27, cz + 0.18);
  const texture = new T.TextureLoader().load(
    "assets/branding/reign-companion-v1.png",
  );
  texture.colorSpace = T.SRGBColorSpace;
  const reign = new T.Mesh(
    new T.PlaneGeometry(1.67, 2.5),
    new T.MeshBasicMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.2,
      side: T.DoubleSide,
      depthWrite: true,
      toneMapped: false,
    }),
  );
  reign.position.set(cx + 0.15, 1.25, cz - 0.68);
  world.add(reign);
  hit(reign, "Talk to Reign", () => store.navigate("checkout"));
  function elevator(y) {
    const start = world.children.length;
    box(2.6, 4.2, 0.25, mat("#4b5049"), 6.9, y + 2.1, 2.55);
    box(0.2, 4.2, 2.6, mat("#4b5049"), 5.55, y + 2.1, 3.75);
    box(0.2, 4.2, 2.6, mat("#4b5049"), 8.25, y + 2.1, 3.75);
    for (const x of [6.27, 7.53]) {
      const door = box(
        1.23,
        3.1,
        0.1,
        mat("#92988f", { metalness: 0.65, roughness: 0.4 }),
        x,
        y + 1.55,
        5.08,
      );
      hit(door, "Enter elevator", () => store.openElevator());
    }
    box(2.8, 0.16, 0.3, dark, 6.9, y + 3.18, 5.08);
    const button = box(0.18, 0.3, 0.08, brass, 5.36, y + 1.5, 5.1);
    hit(button, "Select elevator floor", () => store.openElevator());
    const shaft = new T.Group();
    for (const object of world.children.slice(start)) {
      object.position.x -= 6.9;
      object.position.z -= 5.08;
      shaft.add(object);
    }
    shaft.rotation.y = Math.PI / 2;
    shaft.position.set(-8.3, 0, -0.4);
    shaft.name =
      y === 0 ? "shop-elevator-left-wall" : "upstairs-elevator-left-wall";
    world.add(shaft);
  }
  elevator(0);
  twin("Enter elevator", () => store.openElevator());
  const liftSign = label(
    "ELEVATOR / RADIO · STUDIO",
    2.65,
    0.3,
    -8.15,
    3.65,
    -0.4,
    "#ead8ae",
    "#4b5049",
    70,
  );
  liftSign.rotation.y = Math.PI / 2;
  hit(liftSign, "Select elevator floor", () => store.openElevator());
  // A distinct closed merch entrance in the reserved bay on the right wall.
  const merchDoor = box(0.12, 3.7, 2.5, mat("#294c3b"), 8.3, 1.85, -0.4);
  hit(merchDoor, "Enter apparel and merch shop", commerce.merch);
  for (const z of [-1.75, 0.95]) box(0.26, 3.95, 0.14, wood, 8.25, 1.97, z);
  box(0.26, 0.16, 2.85, wood, 8.25, 3.95, -0.4);
  box(0.18, 0.12, 0.12, brass, 8.17, 1.7, 0.5);
  const merchSign = label(
    "APPAREL / MERCH",
    2.7,
    0.5,
    8.15,
    4.43,
    -0.4,
    "#eee0bf",
    "#294c3b",
    85,
  );
  merchSign.rotation.y = -Math.PI / 2;
  hit(merchSign, "Enter apparel and merch shop", commerce.merch);
  twin("Enter apparel and merch shop", commerce.merch);
  const stairSign = null;
  // Upstairs rooms are cutaways on a dedicated scene layer, connected by an actual corridor.
  const upstairsStart = world.children.length;
  buildBroadcastRooms({ T, world, box, mat, label, hit, twin, store });
  elevator(8.35);
  box(4.2, 0.3, 3, wood, -8.2, 8.2, -0.4);
  world.children
    .slice(upstairsStart)
    .forEach((object) => object.traverse((child) => child.layers.set(2)));
  return { reign, stairSign };
}
