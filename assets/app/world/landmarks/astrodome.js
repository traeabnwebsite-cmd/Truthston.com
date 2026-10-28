export function buildAstrodome({
  mat,
  T,
  world,
  box,
  venueSphere,
  roofSteel,
  stadiumConcrete,
  label,
}) {
  const domeX = -66,
    domeZ = 66;
  const domeSkin = mat("#8b9d9b", { metalness: 0.22, roughness: 0.78 }),
    domeStone = mat("#b5bcb4"),
    domeDark = mat("#263f42", { metalness: 0.45, roughness: 0.35 });
  const domeBase = new T.Mesh(
    new T.CylinderGeometry(10.2, 10.45, 4.8, 96),
    domeSkin,
  );
  domeBase.position.set(domeX, 2.4, domeZ);
  world.add(domeBase);
  for (const y of [0.35, 1, 4.35, 4.8]) {
    const ring = new T.Mesh(new T.TorusGeometry(10.28, 0.08, 6, 96), domeStone);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(domeX, y, domeZ);
    world.add(ring);
  }
  // Continuous high glazing band, concrete ribs, and four cylindrical circulation towers.
  const domeWindows = new T.Mesh(
    new T.CylinderGeometry(10.25, 10.25, 1.05, 96, 1, true),
    domeDark,
  );
  domeWindows.position.set(domeX, 4.1, domeZ);
  world.add(domeWindows);
  for (let j = 0; j < 96; j++) {
    const a = (j / 96) * Math.PI * 2,
      x = domeX + Math.cos(a) * 10.3,
      z = domeZ + Math.sin(a) * 10.3;
    const rib = box(0.105, 4.45, 0.13, domeStone, x, 2.5, z);
    rib.rotation.y = -a;
  }
  for (let j = 0; j < 4; j++) {
    const a = Math.PI / 4 + (j * Math.PI) / 2,
      x = domeX + Math.cos(a) * 10.75,
      z = domeZ + Math.sin(a) * 10.75,
      tower = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 5.4, 32), domeStone);
    tower.position.set(x, 2.7, z);
    world.add(tower);
    const roofRing = new T.Mesh(
      new T.TorusGeometry(1.15, 0.1, 6, 32),
      domeStone,
    );
    roofRing.rotation.x = Math.PI / 2;
    roofRing.position.set(x, 5.43, z);
    world.add(roofRing);
    const darkTop = new T.Mesh(new T.CircleGeometry(1.05, 32), domeDark);
    darkTop.rotation.x = -Math.PI / 2;
    darkTop.position.set(x, 5.41, z);
    world.add(darkTop);
    for (let k = 0; k < 5; k++) {
      const window = box(0.6, 0.28, 0.03, domeDark, x, 1 + k * 0.75, z + 1.203);
    }
  }
  const domeRoofCanvas = document.createElement("canvas");
  domeRoofCanvas.width = 1024;
  domeRoofCanvas.height = 512;
  const dr = domeRoofCanvas.getContext("2d");
  dr.fillStyle = "#bbc8c3";
  dr.fillRect(0, 0, 1024, 512);
  for (let row = 0; row < 24; row++)
    for (let col = 0; col < 96; col++) {
      dr.fillStyle =
        row > 18 ? "#a7b5b2" : (row + col) % 3 ? "#b0cac6" : "#91b4b2";
      dr.fillRect(
        (col * 1024) / 96 + 1,
        (row * 512) / 24 + 1,
        1024 / 96 - 2,
        512 / 24 - 2,
      );
    }
  dr.fillStyle = "#b7bfba";
  dr.fillRect(0, 410, 1024, 102);
  for (let j = 0; j < 96; j++) {
    dr.fillStyle = j % 12 === 0 ? "#e0e3dc" : "#c7d2cb";
    dr.fillRect((j * 1024) / 96, 0, j % 12 === 0 ? 3 : 1, 512);
  }
  const domeRoofTexture = new T.CanvasTexture(domeRoofCanvas);
  domeRoofTexture.colorSpace = T.SRGBColorSpace;
  const domeRoof = venueSphere(
    10.35,
    0.31,
    mat("#ffffff", { map: domeRoofTexture, metalness: 0.18, roughness: 0.65 }),
    domeX,
    4.8,
    domeZ,
  );
  const cupola = new T.Mesh(
    new T.CylinderGeometry(0.8, 1, 0.22, 48),
    domeStone,
  );
  cupola.position.set(domeX, 8.04, domeZ);
  world.add(cupola);
  box(0.07, 0.6, 0.07, roofSteel, domeX, 8.45, domeZ);
  // Broad entries, stairs and pedestrian ring sit between the towers, as in the aerial reference.
  for (const side of [-1, 1]) {
    box(5, 0.14, 2.4, stadiumConcrete, domeX, 0.07, domeZ + side * 11.1);
    box(3.5, 1.1, 0.22, domeDark, domeX, 0.7, domeZ + side * 10.27);
    for (let j = 0; j < 5; j++)
      box(
        0.08,
        1.1,
        0.25,
        domeStone,
        domeX - 1.6 + j * 0.8,
        0.7,
        domeZ + side * 10.3,
      );
    box(4, 0.18, 1.5, domeStone, domeX, 1.5, domeZ + side * 10.8);
  }
  label(
    "ASTRODOME",
    6.8,
    0.55,
    domeX,
    3,
    domeZ + 10.32,
    "#e0e6dd",
    "#385353",
    90,
  );

  return { domeX, domeZ };
}
