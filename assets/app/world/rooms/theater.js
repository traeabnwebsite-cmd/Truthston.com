import { $, $$, esc } from "../../core/dom.js";
export function buildTheaterRoom({
  world,
  mat,
  box,
  paper,
  wood,
  label,
  hit,
  go,
  T,
  scene,
  cinema,
  roomAmbient,
  sun,
}) {
  const theaterScreen = { width: 9, height: 5.0625, y: 4.05, z: -0.8 };
  const theaterMeshStart = world.children.length;
  const theaterSeats = [];
  const theatreWall = mat("#292c29"),
    velvet = mat("#643629"),
    chairMat = mat("#5c382a");
  box(10.5, 0.25, 12, mat("#242b25"), 13.75, -0.15, 0);
  box(10.5, 6.7, 0.24, theatreWall, 13.75, 3.25, -6);
  box(10.5, 6.7, 0.24, theatreWall, 13.75, 3.25, 6);
  box(0.24, 1.52, 12, theatreWall, 19, 0.76, 0);
  box(0.24, 0.16, 12, theatreWall, 19, 6.66, 0);
  box(0.24, 5.07, 0.7, theatreWall, 19, 4.05, -5.65);
  box(0.24, 5.07, 2.3, theatreWall, 19, 4.05, 4.85);
  box(0.24, 6.7, 6, theatreWall, 8.5, 3.25, 3);
  box(10.5, 0.16, 12, mat("#20251f"), 13.75, 6.65, 0);
  box(0.45, 0.06, 2.6, paper, 8.5, 0.015, -2);
  for (const z of [-3.35, -0.65]) box(0.4, 3.8, 0.12, wood, 8.5, 1.9, z);
  box(0.4, 0.14, 2.8, wood, 8.5, 3.85, -2);
  const entranceSign = label(
    "SCREENING ROOM",
    2.55,
    0.5,
    8.32,
    4.25,
    -2,
    "#f0d6a1",
    "#753b2c",
    95,
  );
  entranceSign.rotation.y = -Math.PI / 2;
  hit(entranceSign, "Enter the separate screening room", () => go(2));
  const entrance = new T.Mesh(
    new T.PlaneGeometry(2.55, 3.65),
    new T.MeshBasicMaterial({
      color: "#d9902b",
      transparent: true,
      opacity: 0.045,
      side: T.DoubleSide,
      depthWrite: false,
    }),
  );
  entrance.rotation.y = -Math.PI / 2;
  entrance.position.set(8.32, 1.85, -2);
  world.add(entrance);
  hit(entrance, "Enter the screening room", () => go(2));
  const returnSign = label(
    "BACK TO THE RECORD SHOP",
    2.55,
    0.45,
    8.72,
    4.25,
    -2,
    "#d9bd8a",
    "#263d30",
    60,
  );
  returnSign.rotation.y = Math.PI / 2;
  hit(returnSign, "Return to the record shop", () => go(0));
  // Burgundy acoustic panels, aisle lighting and two rows of low lounge seats.
  for (const z of [-5.83, 5.83])
    for (let i = 0; i < 6; i++)
      box(0.85, 4, 0.1, i % 2 ? velvet : mat("#3c3c30"), 9.5 + i * 1.6, 2.6, z);
  for (const x of [12.5, 15])
    for (const z of [-3.5, -1.3, 1.3, 3.5]) {
      const upholstery = mat("#572d2a", { roughness: 0.95 }),
        trim = mat("#171c1a");
      box(1.18, 0.3, 1.26, upholstery, x, 0.54, z);
      box(0.24, 1.1, 1.26, upholstery, x - 0.49, 1.12, z);
      box(0.12, 0.85, 1.12, velvet, x - 0.345, 1.16, z);
      for (const dz of [-0.7, 0.7]) {
        box(1.22, 0.25, 0.18, trim, x, 0.82, z + dz);
        box(0.95, 0.09, 0.2, upholstery, x + 0.05, 0.965, z + dz);
        const cup = new T.Mesh(new T.TorusGeometry(0.075, 0.015, 6, 16), trim);
        cup.rotation.x = Math.PI / 2;
        cup.position.set(x + 0.33, 1.015, z + dz);
        world.add(cup);
      }
      box(0.7, 0.26, 0.94, trim, x, 0.2, z);
      box(0.42, 0.08, 1.02, trim, x + 0.75, 0.12, z);
      theaterSeats.push({
        x,
        z,
        seatTop: 0.69,
        anchor: new T.Vector3(x - 0.18, 0, z),
        spriteCenterY: 1.18,
      });
    }
  const companionSeat = theaterSeats.find((s) => s.x === 15 && s.z === -1.3);

  const theatreLights = [];
  for (const z of [-5.5, 5.5]) {
    box(
      9.3,
      0.035,
      0.035,
      new T.MeshBasicMaterial({ color: "#b77e36" }),
      13.75,
      0.12,
      z,
    );
    const glow = new T.PointLight("#e8a861", 16, 12, 2);
    glow.position.set(13.5, 4.8, z);
    scene.add(glow);
    theatreLights.push(glow);
  }
  const screenLight = new T.PointLight("#93aaa0", 22, 12, 2);
  screenLight.position.set(17.5, 4, 0);
  scene.add(screenLight);
  // A clean, recessed movie screen. No legacy CRT labels or wall-mounted video menu.
  const screenFrame = mat("#101714", { metalness: 0.32, roughness: 0.46 });
  for (const y of [
    theaterScreen.y - theaterScreen.height / 2 - 0.06,
    theaterScreen.y + theaterScreen.height / 2 + 0.06,
  ])
    box(
      0.3,
      0.12,
      theaterScreen.width + 0.24,
      screenFrame,
      18.45,
      y,
      theaterScreen.z,
    );
  for (const z of [
    theaterScreen.z - theaterScreen.width / 2 - 0.06,
    theaterScreen.z + theaterScreen.width / 2 + 0.06,
  ])
    box(
      0.3,
      theaterScreen.height,
      0.12,
      screenFrame,
      18.45,
      theaterScreen.y,
      z,
    );
  const screen = new T.Mesh(
    new T.PlaneGeometry(theaterScreen.width, theaterScreen.height),
    new T.MeshBasicMaterial({ color: "#111b17" }),
  );
  screen.position.set(18.21, theaterScreen.y, theaterScreen.z);
  screen.rotation.y = -Math.PI / 2;
  world.add(screen);
  hit(screen, "Choose a film from the theater menu", () => cinema.open(0));
  world.children
    .slice(theaterMeshStart)
    .forEach((o) => o.traverse((child) => child.layers.enable(1)));
  theatreLights.forEach((l) => l.layers.enable(1));
  screenLight.layers.enable(1);
  roomAmbient.layers.enable(1);
  sun.layers.enable(1);
  // An actual opening in the back wall leads into the night street.

  return { companionSeat, theatreLights, screenLight, screen };
}
