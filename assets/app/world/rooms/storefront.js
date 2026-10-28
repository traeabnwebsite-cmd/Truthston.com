import { buildShopDoor } from "./doorway.js";
import { $, $$, esc } from "../../core/dom.js";
export function buildStorefront({
  world,
  box,
  concrete,
  limestone,
  mat,
  architecturalBrick,
  roofSteel,
  hit,
  go,
  abnMark,
  label,
  glowMat,
  T,
  twin,
}) {
  const shopExteriorStart = world.children.length;
  box(29, 0.08, 18, concrete, 0, -0.03, 25);
  for (let i = 0; i < 7; i++)
    box(0.05, 0.012, 4.8, limestone, -12 + i * 4, 0.025, 22);
  box(18, 0.35, 14, mat("#6a6b5e"), 0, 6.9, 0);
  box(18, 1.1, 0.45, architecturalBrick, 0, 6.12, 6.65);
  for (const x of [-8.7, 8.7]) {
    box(0.5, 6.1, 13.5, architecturalBrick, x, 3, 0);
    box(0.7, 0.2, 13.8, limestone, x, 6.15, 0);
  }
  for (const x of [-7.2, 7.2])
    box(3, 5.8, 0.45, architecturalBrick, x, 2.9, 6.7);
  box(11.8, 1.7, 0.4, architecturalBrick, 0, 4.95, 6.7);
  box(11.7, 0.22, 0.5, limestone, 0, 4.05, 6.7);
  const storefrontGlass = mat("#274b4e", {
    metalness: 0.4,
    roughness: 0.25,
    transparent: true,
    opacity: 0.7,
    emissive: "#af9156",
    emissiveIntensity: 0.15,
  });
  for (const x of [-4.2, 4.2]) {
    box(4.6, 3.1, 0.08, storefrontGlass, x, 2.05, 6.92);
    for (const y of [0.5, 2, 3.55])
      box(4.7, 0.055, 0.12, roofSteel, x, y, 6.98);
    for (const dx of [-2.3, 0, 2.3])
      box(0.055, 3.15, 0.12, roofSteel, x + dx, 2.05, 6.98);
  }
  buildShopDoor({
    T,
    world,
    box,
    mat,
    label,
    hit,
    wood: roofSteel,
    x: 0,
    z: 6.96,
    title: "ENTER ABN",
    action: () => go(0),
    closed: true,
    double: true,
    color: "#274b4e",
    doorMaterial: storefrontGlass,
  });
  const shopAwning = box(12, 0.12, 2.2, mat("#8b3e2e"), 0, 4.04, 7.35);
  shopAwning.rotation.x = 0.08;
  abnMark(2.1, -6.2, 5.08, 6.98);
  label(
    "ABN RECORDS, CDs AND TAPES",
    11.5,
    1.05,
    1.2,
    5.08,
    6.96,
    "#f0ddbc",
    "#843528",
    75,
  );
  label(
    "THA TRUTH & NOTHING BUT THA TRUTH",
    11.8,
    0.45,
    0,
    3.78,
    8.45,
    "#ead9b5",
    "#314f42",
    48,
  );
  box(19, 0.18, 3, concrete, 0, -0.01, 8.4);
  for (let j = 0; j < 9; j++)
    box(0.018, 0.014, 2.7, mat("#6e7770"), -8 + j * 2, 0.09, 8.4);
  for (const x of [-7.8, 7.8]) {
    box(0.08, 2, 0.08, roofSteel, x, 1, 7.4);
    box(1.1, 0.08, 0.8, glowMat("#edc68d", 0.6), x, 2.03, 7.4);
  }
  // Brick rear elevation and a lit back door identify the shop when returning from the city.
  for (const x of [-2, 8.3])
    box(x < 0 ? 12 : 0.9, 5.5, 0.16, architecturalBrick, x, 2.75, -6.25);
  label(
    "RECORD SHOP / BACK DOOR",
    4,
    0.6,
    5.7,
    4.65,
    -6.38,
    "#e4c896",
    "#304b3c",
    74,
  ).rotation.y = Math.PI;
  const shopExterior = new T.Group();
  world.children.slice(shopExteriorStart).forEach((o) => shopExterior.add(o));
  world.add(shopExterior);
  shopExterior.visible = false;
  twin("Record shop front entrance", () => go(0));

  // Functional city viewpoints keep the geographically separated landmarks easy to find.

  return { shopExterior };
}
