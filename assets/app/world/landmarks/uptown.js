import { $, $$, esc } from "../../core/dom.js";
export function buildUptown({
  mat,
  rand,
  T,
  world,
  box,
  cityBox,
  cityPaving,
  cityBark,
  urbanDummy,
  wood,
  cityBlack,
  urbanAmber,
  cityRoof,
  venueGlass,
  label,
  planBuildings,
}) {
  const uptownStone = mat("#b9b5a5", { roughness: 0.9 }),
    uptownSilver = mat("#c4d0d4", { metalness: 0.7, roughness: 0.3 });
  // Hines Waterwall: north-facing semicircle, dark cascade, limestone piers and shallow reflecting basin.
  const wwX = -295,
    wwZ = -204.5,
    wwR = 4.2,
    wwH = 3.7;
  const wc = document.createElement("canvas");
  wc.width = 512;
  wc.height = 1024;
  const wq = wc.getContext("2d");
  wq.fillStyle = "#344d52";
  wq.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 2600; i++) {
    wq.fillStyle = i % 3 ? "#adc2bc66" : "#ecf0db77";
    wq.fillRect(
      rand() * 512,
      rand() * 1024,
      0.4 + rand() * 1.6,
      4 + rand() * 50,
    );
  }
  const waterTexture = new T.CanvasTexture(wc);
  waterTexture.colorSpace = T.SRGBColorSpace;
  waterTexture.wrapT = T.RepeatWrapping;
  waterTexture.repeat.y = 2;
  const cascadeMat = mat("#bdcccc", {
    map: waterTexture,
    metalness: 0.2,
    roughness: 0.4,
    side: T.DoubleSide,
    emissive: "#829d9e",
    emissiveIntensity: 0.15,
  });
  for (const [radius, material] of [
    [wwR, uptownStone],
    [wwR - 0.13, cascadeMat],
  ]) {
    const wall = new T.Mesh(
      new T.CylinderGeometry(
        radius,
        radius,
        wwH,
        64,
        1,
        true,
        Math.PI / 2,
        Math.PI,
      ),
      material,
    );
    wall.position.set(wwX, wwH / 2, wwZ);
    world.add(wall);
  }
  for (const y of [0.15, wwH]) {
    const rim = new T.Mesh(
      new T.TorusGeometry(wwR, 0.13, 8, 64, Math.PI),
      uptownStone,
    );
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(wwX, y, wwZ);
    world.add(rim);
  }
  for (const side of [-1, 1]) {
    box(
      0.55,
      wwH + 0.2,
      0.65,
      uptownStone,
      wwX + side * wwR,
      (wwH + 0.2) / 2,
      wwZ,
    );
    box(0.8, 0.16, 0.9, uptownStone, wwX + side * wwR, wwH + 0.2, wwZ);
  }
  const basin = new T.Mesh(
    new T.CircleGeometry(4.05, 64),
    mat("#688d91", { metalness: 0.45, roughness: 0.25 }),
  );
  basin.rotation.x = -Math.PI / 2;
  basin.position.set(wwX, 0.08, wwZ - 0.8);
  basin.scale.y = 0.65;
  world.add(basin);
  box(9.6, 0.1, 6, uptownStone, wwX, -0.02, wwZ);
  box(8.8, 0.04, 5.4, mat("#607f80"), wwX, 0.045, wwZ);
  // The park's twin oak allées and pale walking paths run from the tower to the fountain.
  for (const x of [-304, -286])
    cityBox(1.1, 0.06, 22, cityPaving, x, 0.03, -200);
  for (const z of [-191, -211])
    cityBox(19, 0.06, 1.1, cityPaving, -295, 0.03, z);
  const oakLocations = [];
  for (let row = 0; row < 2; row++)
    for (const side of [-1, 1])
      for (let j = 0; j < 7; j++) {
        const x = -295 + side * (6.4 + row * 2),
          z = -192 - j * 2.7;
        cityBox(0.16, 1.4, 0.16, cityBark, x, 0.7, z);
        oakLocations.push([x, z]);
      }
  const oakCrowns = new T.InstancedMesh(
    new T.IcosahedronGeometry(1, 2),
    mat("#315a44", { roughness: 1 }),
    oakLocations.length,
  );
  oakLocations.forEach(([x, z], i) => {
    urbanDummy.position.set(x, 1.95, z);
    urbanDummy.scale.set(1.35, 0.85, 1.3);
    urbanDummy.rotation.set(0, i * 0.73, 0);
    urbanDummy.updateMatrix();
    oakCrowns.setMatrixAt(i, urbanDummy.matrix);
  });
  world.add(oakCrowns);
  for (const side of [-1, 1])
    for (const z of [-194, -200, -207]) {
      cityBox(1.5, 0.15, 0.45, wood, -295 + side * 4.7, 0.5, z);
      for (const dx of [-0.5, 0.5])
        cityBox(0.08, 0.45, 0.3, cityBlack, -295 + side * 4.7 + dx, 0.22, z);
    }
  // Two stainless arches span Post Oak near the West Alabama approach, with slender curved streetlights.
  const archZ = -151,
    archX = -280;
  for (const offset of [-0.38, 0.38]) {
    const path = new T.QuadraticBezierCurve3(
      new T.Vector3(archX - 6.2, 0.15, archZ + offset),
      new T.Vector3(archX, 11.1, archZ + offset),
      new T.Vector3(archX + 6.2, 0.15, archZ + offset),
    );
    world.add(
      new T.Mesh(new T.TubeGeometry(path, 64, 0.105, 10, false), uptownSilver),
    );
    for (const side of [-1, 1])
      box(
        0.6,
        0.18,
        0.7,
        uptownStone,
        archX + side * 6.2,
        0.07,
        archZ + offset,
      );
  }
  for (const z of [-138, -169]) {
    const x = archX + 5.4;
    box(0.07, 8.2, 0.07, uptownSilver, x, 4.1, z);
    const arm = new T.QuadraticBezierCurve3(
      new T.Vector3(x, 5.8, z),
      new T.Vector3(x - 1, 8.7, z),
      new T.Vector3(x - 6, 8.4, z),
    );
    world.add(
      new T.Mesh(new T.TubeGeometry(arm, 24, 0.07, 8, false), uptownSilver),
    );
    box(0.9, 0.06, 0.3, urbanAmber, x - 6, 8.4, z);
  }
  // Galleria frontage west of the tower and the two immediate towers across West Alabama.
  cityBox(32, 6, 12, uptownStone, -346, 3, -170);
  cityBox(28, 0.2, 6, cityRoof, -346, 6.12, -170);
  for (let j = 0; j < 12; j++)
    cityBox(1.6, 2.6, 0.12, venueGlass, -359 + j * 2.35, 2.6, -163.94);
  label("THE GALLERIA", 19, 1, -346, 4.9, -163.8, "#303b3f", "#e1d9c4", 100);
  function uptownNeighbor(x, z, w, d, h, name) {
    planBuildings.push({ x, z, w, d });
    cityBox(w, h, d, uptownStone, x, h / 2, z);
    for (const side of [-1, 1]) {
      for (let j = 0; j < Math.floor(w / 1.05); j++)
        cityBox(
          0.65,
          h - 1.2,
          0.05,
          venueGlass,
          x - w / 2 + 0.6 + j * 1.05,
          h / 2,
          z + side * (d / 2 + 0.04),
        );
      for (let floor = 1; floor < h; floor += 0.85)
        cityBox(
          w,
          0.09,
          0.08,
          uptownStone,
          x,
          floor,
          z + side * (d / 2 + 0.08),
        );
    }
    cityBox(w + 0.25, 0.3, d + 0.25, cityRoof, x, h + 0.15, z);
    const sign = label(
      name,
      w - 0.5,
      0.7,
      x,
      1.2,
      z - d / 2 - 0.13,
      "#eee9d9",
      "#364648",
      80,
    );
    sign.rotation.y = Math.PI;
  }
  uptownNeighbor(-338, -146, 12, 13, 19, "WESTIN GALLERIA");
  uptownNeighbor(-296, -146, 10, 13, 18, "GALLERIA TOWER I");

  // Shared shop facades: masonry, lit display windows, recessed doors, own-label shop signs and upper floors.

  return { waterTexture };
}
