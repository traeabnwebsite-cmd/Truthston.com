import { $, $$, esc } from "../../core/dom.js";
export function buildGivingRoom({
  box,
  wood,
  dark,
  T,
  world,
  hit,
  giving,
  data,
  label,
  mat,
  paper,
}) {
  // Relief Gang will have its own room. Keep only the shared shop decor here;
  // the record store must not contain the former Giving table, map or board.
  // Lamps, rug, poster and doorway accents.
  box(7, 0.025, 3.7, mat("#753e2c"), -0.7, 0.005, 3.8);
  for (let i = 0; i < 10; i++)
    box(6.7, 0.008, 0.025, paper, -0.7, 0.025, 2.1 + i * 0.36);
  for (const x of [-5, 1, 6]) {
    box(0.025, 1.1, 0.025, dark, x, 6.6, -2.3);
    const lamp = new T.Mesh(
      new T.ConeGeometry(0.44, 0.25, 24, 1, true),
      mat("#b58339", { side: T.DoubleSide }),
    );
    lamp.position.set(x, 5.95, -2.3);
    world.add(lamp);
    const bulb = new T.Mesh(
      new T.SphereGeometry(0.13, 12, 8),
      new T.MeshBasicMaterial({ color: "#ffcf7b" }),
    );
    bulb.position.set(x, 5.8, -2.3);
    world.add(bulb);
  }
  const poster = label(
    "FOR THE PEOPLE",
    2,
    0.9,
    -8.32,
    5.65,
    0,
    "#d6c49a",
    "#9c3c29",
    90,
  );
  poster.rotation.y = Math.PI / 2;
  label("THE VAULT", 2, 0.5, 0, 4.6, -5.5, "#a59470", "#20251b", 100);

  return {};
}
