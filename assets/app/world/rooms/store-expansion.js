import { buildShopDoor } from "./doorway.js";
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
    const steel = mat("#4b5049");
    box(0.25, 4.5, 2.9, steel, -10.9, y + 2.25, -0.4);
    for (const z of [-1.85, 1.05]) box(2.6, 4.5, 0.2, steel, -9.6, y + 2.25, z);
    buildShopDoor({
      T,
      world,
      box,
      mat,
      label,
      hit,
      wood,
      x: -8.3,
      z: -0.4,
      y,
      facing: Math.PI / 2,
      title: "ELEVATOR",
      action: () => store.openElevator(),
      closed: true,
      double: true,
      color: "#92988f",
    });
  }
  elevator(0);
  twin("Enter elevator", () => store.openElevator());
  buildShopDoor({
    T,
    world,
    box,
    mat,
    label,
    hit,
    wood,
    x: 8.27,
    z: -0.4,
    facing: -Math.PI / 2,
    title: "APPAREL / MERCH",
    action: commerce.merch,
    closed: true,
    color: "#294c3b",
  });
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
