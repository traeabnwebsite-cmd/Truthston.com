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
  // Giving table: stylised map and eight warm pin lights.
  box(3.2, 0.2, 2.3, wood, -5.8, 1.45, 3.5);
  for (const x of [-7, -4.6]) box(0.16, 1.5, 0.16, dark, x, 0.7, 3.5);
  const mapCanvas = document.createElement("canvas");
  mapCanvas.width = 512;
  mapCanvas.height = 384;
  const mx = mapCanvas.getContext("2d");
  mx.fillStyle = "#a99e72";
  mx.fillRect(0, 0, 512, 384);
  mx.strokeStyle = "#d4c69f";
  mx.lineWidth = 8;
  for (let i = 0; i < 12; i++) {
    mx.beginPath();
    mx.moveTo(i * 55 - 120, 0);
    mx.lineTo(i * 55 + 80, 384);
    mx.stroke();
    mx.beginPath();
    mx.moveTo(0, i * 45);
    mx.lineTo(512, i * 45 - 150);
    mx.stroke();
  }
  mx.strokeStyle = "#2c5a46";
  mx.lineWidth = 13;
  mx.beginPath();
  mx.moveTo(0, 160);
  mx.bezierCurveTo(200, 0, 200, 380, 512, 200);
  mx.stroke();
  const mp = new T.Mesh(
    new T.PlaneGeometry(2.9, 2.05),
    new T.MeshStandardMaterial({ map: new T.CanvasTexture(mapCanvas) }),
  );
  mp.rotation.x = -Math.PI / 2;
  mp.position.set(-5.8, 1.56, 3.5);
  world.add(mp);
  hit(mp, "Houston giving map and community ledger", () => giving());
  data.giving.forEach((p, i) => {
    const pin = new T.Mesh(
      new T.SphereGeometry(0.075, 12, 8),
      new T.MeshStandardMaterial({
        color: "#ffc469",
        emissive: "#d9902b",
        emissiveIntensity: 1,
      }),
    );
    pin.position.set(
      -7 + ((Number(p.x) || i * 10) / 100) * 2.5,
      1.68,
      2.5 + ((Number(p.y) || i * 10) / 100) * 2,
    );
    world.add(pin);
    hit(pin, p.name, () => giving(i));
  });
  label(
    "ALL HEART. ALL HOUSTON.",
    3.1,
    0.4,
    -5.8,
    1,
    4.68,
    "#ded0a9",
    "#31513a",
    72,
  );
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
