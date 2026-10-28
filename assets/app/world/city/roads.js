import { $, $$, esc } from "../../core/dom.js";
export function buildCityRoads({
  campusRoadFootprints,
  T,
  glowMat,
  contactTexture,
  mat,
  skylineTowerFootprints,
  asphalt,
  label,
  world,
}) {
  const planRoads = [...campusRoadFootprints],
    planBuildings = [],
    planCurves = [],
    urbanBatches = new Map(),
    urbanDummy = new T.Object3D();
  const urbanAmber = glowMat("#e4c691", 0.5);
  const urbanContact = new T.MeshBasicMaterial({
    map: contactTexture,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
  });
  const unitCityBox = new T.BoxGeometry(1, 1, 1),
    cityCurb = mat("#8b9694"),
    cityPaint = mat("#d5d4c4"),
    cityYellow = mat("#d4b760"),
    cityRoof = mat("#7e898d", { roughness: 0.9 }),
    cityBark = mat("#45433c"),
    cityLeaves = mat("#294f40"),
    cityPaving = mat("#525c5b"),
    cityBlack = mat("#19252b");
  function cityBox(w, h, d, m, x, y, z, ry = 0) {
    let b = urbanBatches.get(m);
    if (!b) {
      b = [];
      urbanBatches.set(m, b);
    }
    urbanDummy.position.set(x, y, z);
    urbanDummy.rotation.set(0, ry, 0);
    urbanDummy.scale.set(w, h, d);
    urbanDummy.updateMatrix();
    b.push(urbanDummy.matrix.clone());
  }
  function rectIntersects(a, b, margin = 0) {
    return (
      Math.abs(a.x - b.x) < (a.w + b.w) / 2 + margin &&
      Math.abs(a.z - b.z) < (a.d + b.d) / 2 + margin
    );
  }
  const sxMin =
      Math.min(...skylineTowerFootprints.map((b) => b.x - b.w / 2)) - 8,
    sxMax = Math.max(...skylineTowerFootprints.map((b) => b.x + b.w / 2)) + 8,
    szMin = Math.min(...skylineTowerFootprints.map((b) => b.z - b.d / 2)) - 8,
    szMax = Math.max(...skylineTowerFootprints.map((b) => b.z + b.d / 2)) + 8;
  const skylineBounds = {
    x: (sxMin + sxMax) / 2,
    z: (szMin + szMax) / 2,
    w: sxMax - sxMin,
    d: szMax - szMin,
  };
  const protectedBlocks = [
    skylineBounds,
    { x: -106, z: -403, w: 160, d: 168 },
    { x: -296, z: -187, w: 29, d: 50 },
    { x: -346, z: -184, w: 42, d: 48 },
    { x: -310, z: -146, w: 70, d: 18 },
    { x: 80, z: -125, w: 33, d: 32 },
    { x: 75, z: -175, w: 29, d: 27 },
    { x: 5, z: -44, w: 55, d: 104 },
  ];
  const existingFootprints = [
    { x: 80, z: -125, w: 23, d: 21 },
    { x: 75, z: -175, w: 24, d: 20 },
    { x: -295, z: -185, w: 9, d: 8 },
  ];
  for (const f of [...existingFootprints, ...skylineTowerFootprints])
    planBuildings.push(f);
  // Every ground street records its footprint before any surrounding parcel is populated.
  function cityStreet(
    x1,
    z1,
    x2,
    z2,
    width = 5,
    name = "",
    sidewalk = true,
    parcelClipped = false,
  ) {
    const dx = x2 - x1,
      dz = z2 - z1,
      len = Math.hypot(dx, dz),
      along = Math.abs(dz) > Math.abs(dx),
      cx = (x1 + x2) / 2,
      cz = (z1 + z2) / 2,
      a = Math.atan2(dx, dz);
    if (!parcelClipped) {
      let cuts = [
        [
          along ? Math.min(z1, z2) : Math.min(x1, x2),
          along ? Math.max(z1, z2) : Math.max(x1, x2),
        ],
      ];
      const fixed = along ? cx : cz;
      let changed = false;
      for (const b of [...skylineTowerFootprints, ...existingFootprints]) {
        if (
          Math.abs(fixed - (along ? b.x : b.z)) >=
          (width + (along ? b.w : b.d)) / 2 + 1.2
        )
          continue;
        const lo = (along ? b.z : b.x) - (along ? b.d : b.w) / 2 - 1.2,
          hi = (along ? b.z : b.x) + (along ? b.d : b.w) / 2 + 1.2;
        cuts = cuts.flatMap(([a, c]) => {
          if (hi <= a || lo >= c) return [[a, c]];
          changed = true;
          const out = [];
          if (lo > a) out.push([a, lo]);
          if (hi < c) out.push([hi, c]);
          return out;
        });
      }
      if (changed) {
        for (const [a, b] of cuts)
          if (b - a > 2)
            along
              ? cityStreet(fixed, a, fixed, b, width, name, sidewalk, true)
              : cityStreet(a, fixed, b, fixed, width, name, sidewalk, true);
        return;
      }
    }
    if (len < 1) return;
    const r = {
      x: cx,
      z: cz,
      w: along ? width : len,
      d: along ? len : width,
      name,
      x1,
      z1,
      x2,
      z2,
      width,
      sidewalk,
    };
    planRoads.push(r);
    cityBox(width, 0.09, len, asphalt, cx, -0.045, cz, a);
    if (name) {
      const sx = x1 + dx * 0.17 + Math.cos(a) * (width / 2 + 1),
        sz = z1 + dz * 0.17 - Math.sin(a) * (width / 2 + 1);
      cityBox(0.065, 3, 0.065, cityBlack, sx, 1.5, sz);
      const sign = label(name, 4.4, 0.5, sx, 3.1, sz, "#e6e8d8", "#285748", 70);
      sign.rotation.y = a;
    }
  }
  // Ground grid clips at complete landmark blocks instead of running through buildings.
  function gridStreet(fixed, lo, hi, along) {
    let cuts = [[lo, hi]];
    for (const b of protectedBlocks) {
      const cross = along ? b.x : b.z,
        span = along ? b.w : b.d,
        center = along ? b.z : b.x,
        extent = along ? b.d : b.w;
      if (Math.abs(fixed - cross) > span / 2 + 3) continue;
      const start = center - extent / 2 - 3,
        end = center + extent / 2 + 3;
      cuts = cuts.flatMap(([a, c]) => {
        if (end <= a || start >= c) return [[a, c]];
        const out = [];
        if (start > a) out.push([a, start]);
        if (end < c) out.push([end, c]);
        return out;
      });
    }
    for (const [a, b] of cuts)
      if (b - a > 4)
        along
          ? cityStreet(fixed, a, fixed, b, 5)
          : cityStreet(a, fixed, b, fixed, 5);
  }
  const gridX = [
      -410, -380, -350, -324, -280, -250, -220, -190, -164, -143, -115, -87,
      -59, -29, -5, 25, 62, 98, 130, 160,
    ],
    gridZ = [
      -540, -510, -490, -460, -435, -410, -385, -360, -334, -308, -282, -256,
      -230, -207, -191, -159, -144, -106, -80, -40, 10, 40,
    ];
  for (const x of gridX) gridStreet(x, -555, 60, true);
  for (const z of gridZ) gridStreet(z, -430, 180, false);
  // Downtown blocks and connected venue perimeter streets.
  for (let x = Math.floor(sxMin / 20) * 20; x <= sxMax + 8; x += 20)
    cityStreet(x, szMin - 5, x, szMax + 5, 4);
  for (let z = Math.floor(szMin / 20) * 20; z <= szMax + 8; z += 20)
    cityStreet(sxMin - 5, z, sxMax + 5, z, 4);
  cityStreet(62, -159, 62, -101, 5, "CRAWFORD ST");
  cityStreet(98, -159, 98, -101, 5, "HAMILTON ST");
  cityStreet(60, -106, 100, -106, 5, "PRESTON ST");
  cityStreet(60, -144, 100, -144, 5, "TEXAS AVE");
  cityStreet(58, -210, 58, -155, 5, "LA BRANCH ST");
  cityStreet(98, -210, 98, -155, 5, "JACKSON ST");
  cityStreet(49, -159, 100, -159, 5, "POLK ST");
  cityStreet(49, -191, 100, -191, 5, "BELL ST");
  cityStreet(49, -207, 100, -207, 5, "LEELAND ST");
  // Reliant Park perimeter and routes extending into the Medical Center and the South Loop.
  for (const x of [-190, -22]) cityStreet(x, -490, x, -316, 6);
  for (const z of [-316, -490])
    cityStreet(
      -190,
      z,
      -22,
      z,
      6,
      z === -316 ? "OLD SPANISH TRAIL" : "SOUTH LOOP FRONTAGE",
    );
  for (const [x, a, b] of [
    [-143, -342, -316],
    [-143, -490, -460],
    [-59, -342, -316],
    [-59, -490, -460],
    [-164, -331, -316],
    [-164, -490, -471],
  ])
    cityStreet(
      x,
      a,
      x,
      b,
      8,
      x === -143 ? "KIRBY DR" : x === -59 ? "FANNIN ST" : "S MAIN ST",
    );
  cityStreet(-143, -316, -143, -230, 8, "KIRBY DR");
  cityStreet(-59, -316, -59, -230, 8, "FANNIN ST");
  // Uptown: tower, Waterwall park, Galleria to the west, Post Oak and Sage on either side.
  cityStreet(-324, -230, -324, -132, 7, "SAGE RD");
  cityStreet(-280, -230, -280, -132, 8, "POST OAK BLVD");
  cityStreet(-380, -132, -250, -132, 8, "WESTHEIMER RD");
  cityStreet(-380, -159, -250, -159, 7, "WEST ALABAMA ST");
  cityStreet(-380, -217, -250, -217, 6, "HIDALGO ST");
  cityStreet(-410, -230, 60, -230, 8, "RICHMOND AVE");
  cityStreet(-29, 12, 25, 12, 6, "RECORD SHOP");
  // Preserve the complete archive-street approach, its cross street, and the shop service lot.
  planRoads.push(
    { x: 0, z: -57, w: 520, d: 7, rail: true },
    { x: 6.65, z: -56.5, w: 21, d: 97 },
    { x: 6.65, z: -41, w: 95, d: 16 },
  );
  planBuildings.push(
    { x: 0, z: 22, w: 29, d: 25 },
    { x: -12.5, z: -15, w: 18, d: 15 },
    { x: 0, z: 0, w: 18, d: 13 },
    { x: 14, z: 0, w: 12, d: 13 },
  );
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 6; i++) {
      if (i === 2 || (!side && (i === 0 || i === 4)) || (side && i === 3))
        continue;
      planBuildings.push({
        x: side ? 23.5 : -10.2,
        z: -16 - i * 12,
        w: 9.1,
        d: 8,
      });
    }
  // Broad, joined freeway surfaces: multi-lane decks, concrete barriers, shoulders, piers and entrance ramps.
  function freeway(points, width, name, lanes = 3) {
    const curve = new T.CatmullRomCurve3(
        points.map((p) => new T.Vector3(...p)),
        false,
        "centripetal",
      ),
      samples = curve.getPoints(
        Math.max(80, Math.ceil(curve.getLength() / 2.5)),
      ),
      verts = [],
      uv = [],
      indices = [];
    for (let i = 0; i < samples.length; i++) {
      const p = samples[i],
        t = curve.getTangent(i / (samples.length - 1)),
        n = new T.Vector3(-t.z, 0, t.x).normalize();
      for (const side of [-1, 1]) {
        const q = p.clone().addScaledVector(n, (side * width) / 2);
        verts.push(q.x, q.y, q.z);
        uv.push((side + 1) / 2, i / 7);
      }
      if (i < samples.length - 1) {
        const j = i * 2;
        indices.push(j, j + 2, j + 1, j + 1, j + 2, j + 3);
      }
      if (i > 0) planCurves.push({ a: samples[i - 1], b: p, width: width + 3 });
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const m = asphalt.clone();
    m.side = T.DoubleSide;
    const road = new T.Mesh(geo, m);
    road.receiveShadow = true;
    world.add(road);
    for (let i = 1; i < samples.length; i++) {
      const p = samples[i - 1],
        q = samples[i],
        t = q.clone().sub(p),
        len = t.length(),
        n = new T.Vector3(-t.z, 0, t.x).normalize(),
        yaw = Math.atan2(t.x, t.z),
        mid = p.clone().add(q).multiplyScalar(0.5);
      const archiveMerge =
        mid.y < 1 && mid.x > -6 && mid.x < 19 && mid.z < -40 && mid.z > -92;
      for (const side of [-1, 1])
        if (!archiveMerge)
          cityBox(
            0.25,
            0.7,
            len + 0.08,
            cityCurb,
            mid.x + n.x * side * (width / 2 - 0.15),
            mid.y + 0.32,
            mid.z + n.z * side * (width / 2 - 0.15),
            yaw,
          );
      if (!archiveMerge)
        cityBox(
          0.22,
          0.55,
          len + 0.08,
          cityCurb,
          mid.x,
          mid.y + 0.26,
          mid.z,
          yaw,
        );
      if (i % 2 === 0)
        for (const side of [-1, 1])
          for (let lane = 1; lane < lanes; lane++) {
            const offset = side * ((width / 2 / lanes) * lane);
            cityBox(
              0.065,
              0.014,
              1.8,
              cityPaint,
              mid.x + n.x * offset,
              mid.y + 0.025,
              mid.z + n.z * offset,
              yaw,
            );
          }
      if (i % 10 === 0 && mid.y > 1.5) {
        for (const side of [-1, 1]) {
          const xx = mid.x + n.x * side * (width / 2 - 1),
            zz = mid.z + n.z * side * (width / 2 - 1);
          if (
            !planRoads.some((r) =>
              rectIntersects({ x: xx, z: zz, w: 1.5, d: 1.5 }, r, 0.6),
            ) &&
            !planBuildings.some((b) =>
              rectIntersects({ x: xx, z: zz, w: 1.5, d: 1.5 }, b, 0.5),
            )
          )
            cityBox(0.8, mid.y, 1.1, cityCurb, xx, mid.y / 2, zz, yaw);
        }
      }
      if (i % 13 === 0) {
        cityBox(0.09, 5, 0.09, cityCurb, mid.x, mid.y + 2.7, mid.z);
        cityBox(2.1, 0.08, 0.08, cityCurb, mid.x, mid.y + 5.2, mid.z);
        for (const side of [-1, 1])
          cityBox(
            0.55,
            0.07,
            0.3,
            urbanAmber,
            mid.x + side * 0.8,
            mid.y + 5.18,
            mid.z,
          );
      }
    }
    if (name) {
      const p = curve.getPoint(0.55);
      label(name, 12, 1.35, p.x, p.y + 4.1, p.z, "#eef1db", "#225948", 85);
    }
    return curve;
  }
  freeway(
    [
      [-440, 5.3, -40],
      [-300, 5.3, -40],
      [-150, 5.3, -40],
      [0, 5.3, -40],
      [190, 5.3, -40],
    ],
    14,
    "I-10 / KATY FREEWAY",
  );
  freeway(
    [
      [65, 0.13, 70],
      [52, 0.13, 5],
      [36, 0.13, -28],
      [6.65, 0.13, -46],
      [6.65, 0.13, -72],
      [-92, 0.13, -110],
      [-105, 0.13, -175],
      [-98, 0.13, -235],
      [-35, 0.13, -265],
      [43, 0.13, -285],
      [180, 0.13, -340],
    ],
    16,
    "I-45 / GULF FREEWAY",
  );
  freeway(
    [
      [112, 4.3, 40],
      [112, 4.3, -100],
      [112, 4.3, -195],
      [85, 4.3, -268],
      [-60, 4.3, -285],
      [-230, 4.3, -285],
      [-325, 4.3, -278],
      [-440, 4.3, -350],
    ],
    16,
    "I-69 / US 59 / SOUTHWEST FREEWAY",
  );
  freeway(
    [
      [-370, 3.1, 90],
      [-370, 3.1, -160],
      [-370, 3.1, -390],
      [-340, 3.1, -500],
      [-200, 3.1, -510],
      [-40, 3.1, -510],
      [100, 3.1, -490],
      [165, 3.1, -400],
      [165, 3.1, -220],
      [165, 3.1, 90],
      [-100, 3.1, 90],
      [-370, 3.1, 90],
    ],
    16,
    "I-610 / SOUTH LOOP",
  );
  freeway(
    [
      [18, 0.12, -242],
      [0, 0.12, -310],
      [0, 0.12, -420],
      [0, 0.12, -560],
    ],
    13,
    "SH 288 / SOUTH FREEWAY",
  );
  // Ramps change height gradually and meet the through lanes rather than ending in midair.
  freeway(
    [
      [65, 0.13, -8],
      [57, 1, -20],
      [43, 3.2, -34],
      [8, 5.3, -40],
      [-30, 5.3, -40],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-105, 0.13, -191],
      [-94, 1.5, -226],
      [-70, 4.3, -270],
      [-25, 4.3, -285],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-143, 0.08, -480],
      [-150, 1.5, -498],
      [-180, 3.1, -510],
      [-220, 3.1, -510],
    ],
    4.2,
    "",
    1,
  );
  freeway(
    [
      [-59, 0.08, -480],
      [-51, 1.3, -496],
      [-24, 3.1, -510],
      [12, 3.1, -510],
    ],
    4.2,
    "",
    1,
  );
  // Finish the junctions: sidewalks stop at cross streets, and lane dashes leave intersections clear.
  for (const r of planRoads) {
    if (r.x1 === undefined) continue;
    const dx = r.x2 - r.x1,
      dz = r.z2 - r.z1,
      len = Math.hypot(dx, dz),
      a = Math.atan2(dx, dz),
      nx = Math.cos(a),
      nz = -Math.sin(a);
    function covered(x, z) {
      return planRoads.some(
        (other) =>
          other !== r &&
          !other.rail &&
          rectIntersects({ x, z, w: 0.9, d: 0.9 }, other, 0.12),
      );
    }
    if (r.sidewalk)
      for (let t = 0.6; t < len; t += 1.2) {
        const u = t / len;
        for (const side of [-1, 1]) {
          const x = r.x1 + dx * u + nx * side * (r.width / 2 + 0.7),
            z = r.z1 + dz * u + nz * side * (r.width / 2 + 0.7);
          if (!covered(x, z))
            cityBox(1.4, 0.13, 1.2, cityCurb, x, -0.005, z, a);
        }
      }
    for (let t = 2; t < len - 1; t += 5) {
      const u = t / len,
        x = r.x1 + dx * u,
        z = r.z1 + dz * u;
      const crossing = planRoads.some(
        (o) =>
          o !== r &&
          !o.rail &&
          o.d > o.w !== r.d > r.w &&
          rectIntersects({ x, z, w: 0.4, d: 0.4 }, o, 1.4),
      );
      if (!crossing) cityBox(0.075, 0.012, 2, cityPaint, x, 0.016, z, a);
    }
  }
  // The Waterwall's lawn is an intentional park rather than empty terrain.
  cityBox(23, 0.08, 26, mat("#385b48"), -295, -0.02, -200);
  cityBox(3, 0.09, 22, cityCurb, -295, 0.015, -200);
  // Immediate Transco neighbors: the Waterwall, Galleria complex and Post Oak street arches.
  // Relative placement follows Hines / Uptown / Simon references; distances remain compressed.

  return {
    planRoads,
    planBuildings,
    planCurves,
    urbanBatches,
    urbanDummy,
    urbanAmber,
    urbanContact,
    unitCityBox,
    cityCurb,
    cityPaint,
    cityRoof,
    cityBark,
    cityLeaves,
    cityPaving,
    cityBlack,
    cityBox,
    rectIntersects,
    sxMin,
    sxMax,
    szMin,
    szMax,
    skylineBounds,
    protectedBlocks,
    gridX,
    gridZ,
  };
}
