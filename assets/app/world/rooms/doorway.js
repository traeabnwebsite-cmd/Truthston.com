export const SHOP_DOOR = Object.freeze({
  width: 2.6,
  height: 3.7,
  frameWidth: 2.9,
  frameHeight: 3.95,
  signY: 4.35,
});
// Every public room entrance uses the same physical opening and frame.
export function buildShopDoor({
  T,
  world,
  box,
  mat,
  label,
  hit,
  wood,
  x,
  z,
  y = 0,
  facing = 0,
  title,
  action,
  closed = false,
  double = false,
  color = "#294c3b",
  doorMaterial,
}) {
  const start = world.children.length,
    d = SHOP_DOOR;
  const metal = mat("#b69a63", { metalness: 0.5, roughness: 0.45 });
  for (const side of [-1, 1])
    box(
      0.15,
      d.frameHeight,
      0.26,
      wood,
      side * (d.width / 2 + 0.075),
      d.frameHeight / 2,
      0,
    );
  box(d.frameWidth, 0.25, 0.26, wood, 0, d.height + 0.125, 0);
  box(d.frameWidth, 0.05, 0.32, mat("#bca780"), 0, 0.025, 0);
  const pivot = new T.Group();
  if (closed && !double) {
    pivot.position.set(-d.width / 2, 0, 0.025);
    const leaf = new T.Mesh(
      new T.BoxGeometry(d.width, d.height, 0.1),
      doorMaterial || mat(color),
    );
    leaf.position.set(d.width / 2, d.height / 2, 0);
    pivot.add(leaf);
    hit(leaf, title, action);
    const handle = new T.Mesh(new T.SphereGeometry(0.065, 12, 8), metal);
    handle.position.set(d.width - 0.2, 1.7, 0.13);
    pivot.add(handle);
    hit(handle, title, action);
    world.add(pivot);
  } else if (closed) {
    for (const side of [-1, 1]) {
      const leaf = box(
        d.width / 2 - 0.015,
        d.height,
        0.1,
        doorMaterial || mat(color, { metalness: 0.45, roughness: 0.4 }),
        (side * d.width) / 4,
        d.height / 2,
        0.025,
      );
      hit(leaf, title, action);
      const handle = box(0.045, 0.35, 0.08, metal, side * 0.12, 1.7, 0.13);
      hit(handle, title, action);
    }
  } else {
    const portal = new T.Mesh(
      new T.PlaneGeometry(d.width, d.height),
      new T.MeshBasicMaterial({
        color: "#d9902b",
        transparent: true,
        opacity: 0.025,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    portal.position.set(0, d.height / 2, 0.12);
    world.add(portal);
    hit(portal, title, action);
  }
  const sign = label(
    title,
    d.frameWidth,
    0.5,
    0,
    d.signY,
    0.16,
    "#eee0bf",
    color,
    85,
  );
  hit(sign, title, action);
  const group = new T.Group();
  for (const object of world.children.slice(start)) group.add(object);
  group.position.set(x, y, z);
  group.rotation.y = facing;
  group.name = "shop-door-" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  group.userData.shopDoor = {
    title,
    width: d.width,
    height: d.height,
    frameWidth: d.frameWidth,
    frameHeight: d.frameHeight,
  };
  world.add(group);
  return { group, pivot };
}
