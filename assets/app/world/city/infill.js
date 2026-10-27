import { $, $$, esc } from "../../core/dom.js";
export function buildCityInfill({
  T,
  renderer,
  mat,
  protectedBlocks,
  skylineBounds,
  rectIntersects,
  planRoads,
  planBuildings,
  planCurves,
  cityBox,
  urbanContact,
  cityPaving,
  cityRoof,
  cityCurb,
  cityBlack,
  sxMin,
  sxMax,
  szMin,
  szMax,
  rand,
  gridX,
  gridZ,
  asphalt,
  cityPaint,
  cityLeaves,
  cityBark,
  urbanDummy,
  world,
  urbanAmber,
  urbanBatches,
  unitCityBox,
  canvas,
  skylineTowerFootprints,
  skylineInventory,
}) {
  const shopMaterials = [];
  for (let theme = 0; theme < 8; theme++) {
    const c = document.createElement("canvas"),
      e = document.createElement("canvas");
    c.width = e.width = 512;
    c.height = e.height = 512;
    const q = c.getContext("2d"),
      eq = e.getContext("2d");
    q.fillStyle = [
      "#865d4d",
      "#a69a85",
      "#6e7d80",
      "#8f795c",
      "#6e6662",
      "#88665d",
      "#84918e",
      "#616d78",
    ][theme];
    q.fillRect(0, 0, 512, 512);
    eq.fillStyle = "#000";
    eq.fillRect(0, 0, 512, 512);
    q.strokeStyle = "#28353b55";
    q.lineWidth = 2;
    for (let y = 0; y < 512; y += 18) {
      q.beginPath();
      q.moveTo(0, y);
      q.lineTo(512, y);
      q.stroke();
      for (let x = ((y / 18) % 2) * 20; x < 512; x += 40)
        q.strokeRect(x, y, 40, 18);
    }
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 5; col++) {
        const x = 15 + col * 101,
          y = 20 + row * 104;
        q.fillStyle = "#203943";
        q.fillRect(x, y, 75, 76);
        q.fillStyle = "#a2b5b6";
        q.fillRect(x + 36, y, 3, 76);
        q.fillRect(x, y + 36, 75, 3);
        if ((row + col + theme) % 3 !== 0) {
          eq.fillStyle = (row + col) % 3 ? "#a5733b" : "#d8b77f";
          eq.fillRect(x + 3, y + 3, 68, 70);
        }
      }
    q.fillStyle = "#1c393c";
    q.fillRect(0, 416, 512, 96);
    eq.fillStyle = "#a68b52";
    eq.fillRect(10, 445, 490, 58);
    q.fillStyle = ["#a14c37", "#35584b", "#284d60"][theme % 3];
    q.fillRect(0, 418, 512, 30);
    q.fillStyle = "#f1e6cf";
    q.font = "bold 21px Arial";
    q.textAlign = "center";
    q.fillText(
      [
        "HOUSTON MADE",
        "CORNER MARKET",
        "RECORDS & TAPES",
        "COFFEE / OPEN LATE",
        "THIRD COAST",
        "BARBER SHOP",
        "BAYOU GOODS",
        "HOUSTON SUPPLY",
      ][theme],
      256,
      440,
    );
    for (let j = 0; j < 5; j++) {
      q.fillStyle = "#142e33";
      q.fillRect(16 + j * 100, 454, 78, 53);
      q.fillStyle = "#d3bd81";
      q.fillRect(24 + j * 100, 462, 9, 40);
    }
    const t = new T.CanvasTexture(c),
      et = new T.CanvasTexture(e);
    t.colorSpace = et.colorSpace = T.SRGBColorSpace;
    t.anisotropy = et.anisotropy = Math.min(
      4,
      renderer.capabilities.getMaxAnisotropy(),
    );
    shopMaterials.push(
      mat("#ddd8cf", {
        map: t,
        emissiveMap: et,
        emissive: "#ffd198",
        emissiveIntensity: 0.45,
        roughness: 0.8,
      }),
    );
  }
  function distanceSegment(x, z, a, b) {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      u = Math.max(
        0,
        Math.min(
          1,
          ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1),
        ),
      );
    return Math.hypot(x - a.x - dx * u, z - a.z - dz * u);
  }
  function parcelClear(r, allowDowntown = false) {
    if (
      protectedBlocks.some(
        (b) =>
          !(allowDowntown && b === skylineBounds) && rectIntersects(r, b, 1),
      )
    )
      return false;
    if (planRoads.some((b) => rectIntersects(r, b, 1.8))) return false;
    if (planBuildings.some((b) => rectIntersects(r, b, 1.2))) return false;
    const rad = Math.hypot(r.w, r.d) / 2;
    return !planCurves.some(
      (c) => distanceSegment(r.x, r.z, c.a, c.b) < c.width / 2 + rad + 1,
    );
  }
  function cityBuilding(x, z, w, d, h, theme, allowDowntown = false) {
    const r = { x, z, w, d, generated: true };
    if (!parcelClear(r, allowDowntown)) return false;
    planBuildings.push(r);
    cityBox(w + 3, 0.015, d + 3, urbanContact, x, 0.049, z);
    cityBox(w + 1, 0.12, d + 1, cityPaving, x, -0.02, z);
    cityBox(w, h, d, shopMaterials[theme % 8], x, h / 2, z);
    cityBox(w + 0.15, 0.18, d + 0.15, cityRoof, x, h + 0.09, z);
    cityBox(w - 0.5, 0.22, 0.14, cityCurb, x, h + 0.25, z + d / 2 - 0.15);
    cityBox(1.3, 0.45, 1.4, cityBlack, x + 0.5, h + 0.42, z);
    return true;
  }
  let downtownInfill = 0;
  for (let x = sxMin + 6; x < sxMax - 6; x += 12)
    for (let z = szMin + 6; z < szMax - 6; z += 13) {
      if (
        cityBuilding(
          x,
          z,
          5.8,
          6.6,
          3.5 + rand() * 3.5,
          (downtownInfill + 2) % 8,
          true,
        )
      )
        downtownInfill++;
    }

  // Dense parcels fill each street block. Rejected plots become setback space, never road obstructions.
  for (let ix = 0; ix < gridX.length - 1; ix++)
    for (let iz = 0; iz < gridZ.length - 1; iz++) {
      const xa = gridX[ix] + 5,
        xb = gridX[ix + 1] - 5,
        za = gridZ[iz] + 5,
        zb = gridZ[iz + 1] - 5;
      if (xb - xa < 7 || zb - za < 7) continue;
      const nx = Math.max(1, Math.floor((xb - xa) / 12)),
        nz = Math.max(1, Math.floor((zb - za) / 12));
      for (let a = 0; a < nx; a++)
        for (let b = 0; b < nz; b++) {
          const dx = (xb - xa) / nx,
            dz = (zb - za) / nz,
            x = xa + dx * (a + 0.5),
            z = za + dz * (b + 0.5),
            downtown = x > -60 && x < 55 && z < -100 && z > -165;
          cityBuilding(
            x,
            z,
            Math.min(11, dx - 2),
            Math.min(12, dz - 2),
            downtown ? 12 + rand() * 14 : 3 + rand() * 7,
            (ix + iz + a + b) % 8,
          );
        }
    }
  // Small street-facing shops close the leftover perimeter slots immediately beside each venue.
  for (const [x, z, w, d, h] of [
    [50, -120, 8, 10, 6],
    [50, -145, 8, 9, 5],
    [109, -126, 8, 10, 7],
    [77, -153, 9, 6, 5],
    [48, -176, 8, 11, 7],
    [103, -175, 8, 11, 6],
    [75, -201, 10, 8, 6],
    [-264, -185, 10, 12, 8],
    [-310, -227, 12, 8, 5],
    [-308, -148, 10, 9, 5],
    [-173, -351, 8, 10, 4],
    [-173, -378, 8, 10, 5],
    [-173, -421, 8, 12, 5],
    [-173, -450, 8, 10, 4],
    [-12, -356, 8, 12, 5],
    [-12, -391, 8, 12, 5],
    [-12, -430, 8, 12, 4],
  ])
    cityBuilding(x, z, w, d, h, Math.floor(rand() * 8));
  // A low Galleria mass west of the Waterwall establishes the actual Uptown relationship.
  for (const [x, z, w, d, h] of [
    [-346, -187, 32, 31, 6],
    [-345, -178, 22, 15, 8],
  ]) {
    cityBox(w, h, d, shopMaterials[1], x, h / 2, z);
    cityBox(w + 0.3, 0.24, d + 0.3, cityRoof, x, h + 0.12, z);
  }
  // Vacant freeway-edge parcels become marked parking courts rather than blank terrain.
  const parkingBody = mat("#45535a", { metalness: 0.25, roughness: 0.6 }),
    parkingWindow = mat("#1f353e");
  let surfaceLots = 0;
  for (let ix = 0; ix < gridX.length - 1; ix++)
    for (let iz = 0; iz < gridZ.length - 1; iz++) {
      const xa = gridX[ix] + 5,
        xb = gridX[ix + 1] - 5,
        za = gridZ[iz] + 5,
        zb = gridZ[iz + 1] - 5;
      for (let x = xa + 4; x < xb - 3; x += 9)
        for (let z = za + 5; z < zb - 4; z += 11) {
          const r = { x, z, w: 7.5, d: 9 };
          if (
            protectedBlocks.some((b) => rectIntersects(r, b, 0.7)) ||
            planRoads.some((b) => rectIntersects(r, b, 1)) ||
            planBuildings.some((b) => rectIntersects(r, b, 1))
          )
            continue;
          if (
            planCurves.some(
              (c) =>
                c.a.y < 1.4 &&
                distanceSegment(x, z, c.a, c.b) < c.width / 2 + 6,
            )
          )
            continue;
          cityBox(7.5, 0.05, 9, asphalt, x, -0.035, z);
          for (let j = 0; j < 4; j++) {
            cityBox(0.045, 0.012, 4, cityPaint, x - 3 + j * 2, 0.008, z - 1.8);
            if ((ix + iz + j) % 4 === 0) {
              cityBox(
                1.35,
                0.5,
                3.2,
                parkingBody,
                x - 2 + j * 2,
                0.35,
                z - 1.8,
              );
              cityBox(
                1.05,
                0.3,
                1.45,
                parkingWindow,
                x - 2 + j * 2,
                0.75,
                z - 1.6,
              );
            }
          }
          surfaceLots++;
        }
    }
  // Trees, lamp standards, stop bars and parked cars belong on the sidewalks and setbacks.
  const treePositions = [];
  for (const r of planRoads) {
    if (r.d > r.w) {
      for (let z = r.z - r.d / 2 + 5; z < r.z + r.d / 2 - 4; z += 16)
        for (const side of [-1, 1]) {
          const x = r.x + side * (r.w / 2 + 2.3);
          if (
            !planBuildings.some((b) =>
              rectIntersects({ x, z, w: 3, d: 3 }, b, 0.2),
            )
          )
            treePositions.push([x, z]);
        }
    }
  }
  const leavesGeo = new T.IcosahedronGeometry(1, 1),
    treeCrowns = new T.InstancedMesh(
      leavesGeo,
      cityLeaves,
      treePositions.length,
    );
  treePositions.forEach(([x, z], i) => {
    cityBox(0.18, 2.2, 0.18, cityBark, x, 1.1, z);
    urbanDummy.position.set(x, 2.7, z);
    urbanDummy.rotation.set(0, i, 0);
    urbanDummy.scale.set(1.55, 0.8, 1.25);
    urbanDummy.updateMatrix();
    treeCrowns.setMatrixAt(i, urbanDummy.matrix);
  });
  world.add(treeCrowns);
  for (const r of planRoads.filter((r) => r.d > 25 && r.w < 12)) {
    for (let z = r.z - r.d / 2 + 8; z < r.z + r.d / 2 - 6; z += 28) {
      const x = r.x + r.w / 2 + 0.65;
      cityBox(0.07, 5, 0.07, cityBlack, x, 2.5, z);
      cityBox(1, 0.07, 0.1, cityBlack, x - 0.45, 5, z);
      cityBox(0.55, 0.06, 0.25, urbanAmber, x - 0.8, 5, z);
    }
  }
  // Flush repeated geometry into instanced draws; background density does not create thousands of draw calls.
  for (const [material, matrices] of urbanBatches) {
    const mesh = new T.InstancedMesh(unitCityBox, material, matrices.length);
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.receiveShadow = true;
    mesh.computeBoundingSphere();
    world.add(mesh);
  }
  const campusBuildings = [
    [-95, 66, 31.4, 46],
    [-77, 23, 40, 15.6],
    [-64, 108.5, 24, 14],
    [-66, 66, 24, 24],
    [-139, 24, 8, 10],
    [-139, 51, 8, 13],
    [-139, 85, 8, 11],
    [-139, 98, 8, 10],
    [-28, 25, 8, 17],
    [-28, 52, 8, 12],
    [-28, 88, 8, 17],
    [-78, 148, 23, 6],
  ].map(([x, z, w, d]) => ({ x: x - 15, z: -334 - z, w, d }));
  const campusConflicts = campusBuildings.filter((b) =>
    planRoads.some((r) => rectIntersects(b, r, 0.02)),
  ).length;
  const conflicts = planBuildings.filter(
    (b) => b.generated && planRoads.some((r) => rectIntersects(b, r, 0.05)),
  ).length;
  canvas.dataset.cityAudit = JSON.stringify({
    parcels: planBuildings.length,
    streets: planRoads.length,
    parkingCourts: surfaceLots,
    generatedRoadConflicts: conflicts,
    campusRoadConflicts: campusConflicts,
    skylineRoadConflicts: skylineTowerFootprints.filter((b) =>
      planRoads.some((r) => rectIntersects(b, r, 0.05)),
    ).length,
    namedSkylineBuildings: skylineInventory.length,
    downtownInfill,
    skylineFreewayConflictNames: skylineTowerFootprints
      .filter((b) =>
        planCurves.some(
          (c) =>
            distanceSegment(b.x, b.z, c.a, c.b) <
            c.width / 2 + Math.hypot(b.w, b.d) / 2,
        ),
      )
      .map((b) => b.name),
    skylineFreewayConflicts: skylineTowerFootprints.filter((b) =>
      planCurves.some(
        (c) =>
          distanceSegment(b.x, b.z, c.a, c.b) <
          c.width / 2 + Math.hypot(b.w, b.d) / 2,
      ),
    ).length,
  });
  console.info(
    "Houston city plan: " +
      planBuildings.length +
      " building parcels, " +
      planRoads.length +
      " connected street segments; " +
      conflicts +
      " generated building / road conflicts.",
  );

  // The room is a cutaway indoors. Outside, the same footprint has a complete street-facing shop front.

  return {};
}
