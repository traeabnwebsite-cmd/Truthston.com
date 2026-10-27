import { $, $$, esc } from "../../core/dom.js";
export function buildBridge({
  world,
  box,
  mat,
  concrete,
  wood,
  label,
  T,
  dark,
}) {
  const bridgeStart = world.children.length;
  // BE SOMEONE railway bridge: steel plate girder, ballast, rails and rivets over the road.
  const bridgeZ = -57;
  box(36, 0.65, 4.4, mat("#4b4537"), 6.65, 7.3, bridgeZ);
  box(36, 1.35, 0.3, mat("#47493a"), 6.65, 8.05, bridgeZ + 2.2);
  box(36, 0.7, 0.2, mat("#353d34"), 6.65, 7.9, bridgeZ - 2.2);
  for (const x of [-9, 22.3]) {
    box(1.35, 7, 3.8, mat("#858175"), x, 3.5, bridgeZ);
    box(3, 0.6, 4.8, concrete, x, 6.9, bridgeZ);
  }
  for (let i = 0; i < 30; i++) {
    box(0.09, 0.9, 0.1, mat("#797965"), -10.8 + i * 1.2, 8.05, bridgeZ + 2.39);
    box(0.26, 0.09, 4, wood, -10.8 + i * 1.2, 7.7, bridgeZ);
  }
  for (const z of [bridgeZ - 0.8, bridgeZ + 0.8])
    box(35, 0.14, 0.13, mat("#8a8d83", { metalness: 0.7 }), 6.65, 7.85, z);
  const be = label(
    "BE SOMEONE",
    17.5,
    1.25,
    6.65,
    8.05,
    bridgeZ + 2.48,
    "#77d2c1",
    "#454c3c",
    150,
  );
  be.material.emissive = new T.Color("#62a494");
  be.material.emissiveIntensity = 0.23;
  // Railway approaches connect both ends of the lettered span to a complete elevated corridor.
  const railSteel = mat("#808c90", { metalness: 0.7, roughness: 0.52 }),
    ballast = mat("#585e5a"),
    railConcrete = mat("#87928f");
  for (const [left, right] of [
    [-154, -11.35],
    [24.65, 160],
  ]) {
    const len = right - left,
      cx = (left + right) / 2;
    box(len, 0.62, 4.4, railConcrete, cx, 7.3, bridgeZ);
    box(len, 0.12, 3.9, ballast, cx, 7.67, bridgeZ);
    for (const z of [bridgeZ - 0.8, bridgeZ + 0.8])
      box(len, 0.14, 0.13, railSteel, cx, 7.85, z);
    for (const z of [bridgeZ - 2.12, bridgeZ + 2.12]) {
      box(len, 0.55, 0.14, railConcrete, cx, 7.92, z);
      box(len, 0.055, 0.055, railSteel, cx, 8.35, z);
    }
    for (let x = left + 0.65; x < right; x += 1.2)
      box(0.25, 0.08, 3.3, wood, x, 7.75, bridgeZ);
    for (let x = left + 4; x < right - 3; x += 14) {
      for (const dz of [-1.5, 1.5])
        box(0.85, 6.9, 0.9, railConcrete, x, 3.45, bridgeZ + dz);
      box(2.4, 0.5, 5.2, railConcrete, x, 6.85, bridgeZ);
      for (const dz of [-2.12, 2.12])
        box(0.055, 0.5, 0.055, railSteel, x, 8.15, bridgeZ + dz);
    }
  }
  // Long railway embankments descend continuously from the raised bridge to grade.
  const railEmbankment = mat("#48574b");
  for (const side of [-1, 1]) {
    const start = side < 0 ? -154 : 160;
    for (let i = 0; i < 20; i++) {
      const x = start + side * (i * 5 + 2.5),
        y = 11.7 - (i + 0.5) * 0.57;
      box(5, Math.max(0.3, y), 5.2, railEmbankment, x, y / 2 - 4.4, bridgeZ);
      const deck = box(5.06, 0.24, 4.2, ballast, x, y + 0.1 - 4.4, bridgeZ);
      deck.rotation.z = -side * Math.atan(0.114);
      for (const dz of [-0.8, 0.8]) {
        const rail = box(
          5.06,
          0.14,
          0.13,
          railSteel,
          x,
          y + 0.28 - 4.4,
          bridgeZ + dz,
        );
        rail.rotation.z = -side * Math.atan(0.114);
      }
    }
  }
  const bridgeGroup = new T.Group();
  world.children.slice(bridgeStart).forEach((o) => bridgeGroup.add(o));
  world.add(bridgeGroup);
  bridgeGroup.position.y = 4.4;
  for (const x of [-9, 22.3])
    box(1.35, 4.4, 3.8, railConcrete, x, 2.2, bridgeZ);
  for (const [left, right] of [
    [-154, -11.35],
    [24.65, 160],
  ])
    for (let x = left + 4; x < right - 3; x += 14)
      for (const dz of [-1.5, 1.5])
        box(0.85, 4.4, 0.9, railConcrete, x, 2.2, bridgeZ + dz);
  // Green freeway direction board, deliberately separated from the bridge lettering.
  for (const x of [-4, 17.3]) box(0.13, 6.3, 0.13, dark, x, 3.15, -78);
  box(21.3, 0.16, 0.15, dark, 6.65, 6.3, -78);
  label(
    "I-45 SOUTH   /   DOWNTOWN  ↓",
    9,
    1.2,
    6.65,
    5.8,
    -77.85,
    "#e1e8cf",
    "#23594b",
    85,
  );
  // Window maps supply hundreds of lit offices without hundreds of draw calls.
  // Blue-hour facades retain their masonry/glass colors. Only occupied windows emit light.

  return {};
}
