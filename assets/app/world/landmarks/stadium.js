import { buildAstrodome } from "./astrodome.js";
import { $, $$, esc } from "../../core/dom.js";
export function buildStadiumDistrict({
  world,
  mat,
  T,
  box,
  asphalt,
  paper,
  label,
  dark,
  concrete,
  wood,
  venueSphere,
  beam,
  loadVenueMark,
  scene,
}) {
  const stadiumDistrictStart = world.children.length;
  // Reliant Park district. North is +Z after district placement; campus arrangement references Kirby/Fannin access and the adjacent Astrodome.
  // Building dimensions and street distances are compressed for this animated prototype.
  const stadiumX = -95,
    stadiumZ = 66;
  const stadiumConcrete = mat("#b1b6b9"),
    stadiumCore = mat("#d1cabc"),
    stadiumGlass = mat("#2c5559", {
      metalness: 0.42,
      roughness: 0.3,
      emissive: "#9fc6d2",
      emissiveIntensity: 0.12,
    });
  const roofWhite = mat("#e2e7e9", {
      roughness: 0.74,
      metalness: 0.08,
      side: T.DoubleSide,
    }),
    roofSteel = mat("#c7d0d5", { metalness: 0.55, roughness: 0.45 }),
    seatBlue = mat("#27495f"),
    seatRed = mat("#753c40");
  box(93, 0.16, 105, mat("#68716b"), -89, -0.16, 68);
  // Kirby to the west, Fannin to the east, McNee to the north, and the South Loop beyond the south lots.
  const campusRoadFootprints = [];
  function campusRoad(x, z, w, d, name) {
    campusRoadFootprints.push({
      x: x - 15,
      z: -334 - z,
      w,
      d,
      name,
      legacy: true,
    });
    box(w, 0.09, d, asphalt, x, -0.055, z);
    const along = d > w;
    for (let i = 0; i < (along ? d : w) / 5; i++) {
      box(
        along ? 0.075 : 2,
        0.012,
        along ? 2 : 0.075,
        paper,
        along ? x : x - w / 2 + 2 + i * 5,
        0.005,
        along ? z - d / 2 + 2 + i * 5 : z,
      );
    }
    if (name) {
      const sx = x + (along ? w / 2 + 1.3 : 0),
        sz = z + (along ? 0 : d / 2 + 1.3);
      label(name, 6, 0.65, sx, 3.3, sz, "#e3e8d8", "#285b49", 85);
      box(0.07, 3.3, 0.07, dark, sx, 1.65, sz);
    }
  }
  campusRoad(-128, 67, 8, 118, "KIRBY DR");
  campusRoad(-44, 67, 8, 118, "FANNIN ST");
  campusRoad(-86, 11, 92, 7, "MCNEE RD");
  campusRoad(-86, 123, 110, 12, "SOUTH LOOP / I-610");
  campusRoad(-155, 110, 54, 5, "WESTRIDGE ST");
  campusRoad(-90, 34.5, 77, 4, "N STADIUM DR");
  campusRoad(-91, 98, 77, 5, "RELIANT PARKWAY");
  // Connections to the rest of the model: frontage streets and continuous access pavement.

  for (const x of [-122.8, -49.2]) box(2, 0.1, 110, concrete, x, 0.02, 67);
  function parkingLot(x, z, w, d, color) {
    box(w, 0.08, d, asphalt, x, -0.045, z);
    for (let row = 0; row < Math.floor(d / 7); row++)
      for (let col = 0; col < Math.floor(w / 2.2); col++) {
        const xx = x - w / 2 + 1 + col * 2.2,
          zz = z - d / 2 + 2 + row * 7;
        box(0.035, 0.012, 4.3, mat("#bbb9a9"), xx, 0.01, zz);
        if ((col + row * 3) % 7 === 0) {
          const parked = box(
            1.35,
            0.45,
            3.2,
            mat(["#35444a", "#9b9d95", "#4f3e3f", "#717963"][(row + col) % 4], {
              metalness: 0.3,
            }),
            xx + 1,
            0.35,
            zz,
          );
          box(1.05, 0.28, 1.5, mat("#21343d"), xx + 1, 0.7, zz);
        }
      }
    label(
      color + " LOT",
      5,
      0.6,
      x,
      2.8,
      z + d / 2,
      "#eee8d5",
      color === "BLUE" ? "#315973" : "#6b383a",
      90,
    );
    box(0.08, 2.8, 0.08, dark, x, 1.4, z + d / 2);
  }
  parkingLot(-113, 67, 16, 61, "BLUE");
  parkingLot(-91, 89, 25, 14, "BLUE");
  parkingLot(-94, 40, 30, 7, "RED");
  parkingLot(-58, 85, 19, 18, "ORANGE");
  // Nearby streets, crosswalks, an east-side rail stop, and low neighborhood blocks ground the campus.
  for (const x of [-128, -44])
    for (const z of [11, 98, 123]) {
      for (const dz of [-6, 6])
        for (let j = 0; j < 6; j++)
          box(0.65, 0.015, 1.4, mat("#c7cbc1"), x - 3 + j * 1.2, 0.025, z + dz);
      box(0.12, 5.8, 0.12, roofSteel, x + 5, 2.9, z - 5);
      box(5, 0.12, 0.12, roofSteel, x + 2.6, 5.8, z - 5);
      box(1, 0.35, 0.28, mat("#9f863c"), x + 1.1, 5.5, z - 5);
      for (let j = 0; j < 3; j++)
        box(
          0.16,
          0.16,
          0.02,
          new T.MeshBasicMaterial({ color: j === 2 ? "#70ba8e" : "#3a3830" }),
          x + 0.8 + j * 0.28,
          5.5,
          z - 4.85,
        );
    }
  // Fannin rail alignment and the Stadium Park / Astrodome stop (simplified, no agency marks).
  box(4, 0.08, 110, mat("#6c7878"), -37, 0.01, 66);
  for (const x of [-38.4, -37.6, -36.4, -35.6])
    box(0.055, 0.04, 110, roofSteel, x, 0.08, 66);
  box(1.6, 0.4, 14, concrete, -37, 0.2, 69);
  box(2.6, 0.12, 15, roofSteel, -37, 2.8, 69);
  for (const z of [63, 69, 75]) box(0.09, 2.6, 0.09, roofSteel, -37, 1.5, z);
  label(
    "STADIUM PARK / ASTRODOME",
    10,
    0.7,
    -36.8,
    3,
    77,
    "#eef2ed",
    "#365967",
    82,
  );
  // Extend the local street network around broad parking grounds; surrounding buildings stay subordinate.
  campusRoad(-149, 68, 7, 140, "S MAIN ST");
  campusRoad(-126, 140, 140, 7, "");
  campusRoad(-18, 67, 7, 140, "");
  for (const [x, z, w, d, h] of [
    [-139, 24, 8, 10, 4],
    [-139, 51, 8, 13, 5],
    [-139, 85, 8, 11, 4],
    [-139, 98, 8, 10, 4],
    [-28, 25, 8, 17, 6],
    [-28, 52, 8, 12, 4],
    [-28, 88, 8, 17, 5],
    [-78, 148, 23, 6, 4],
  ]) {
    box(w, h, d, mat("#8e938e"), x, h / 2, z);
    box(w + 0.25, 0.2, d + 0.25, mat("#aeb8b6"), x, h + 0.1, z);
    for (let j = 0; j < Math.floor(w / 2); j++)
      box(
        1.1,
        h * 0.45,
        0.03,
        stadiumGlass,
        x - w / 2 + 1 + j * 2,
        h * 0.6,
        z + d / 2 + 0.02,
      );
    box(2, 0.7, 2, mat("#738586"), x, h + 0.55, z);
  }
  for (const x of [-134, -30])
    for (let z = 16; z < 122; z += 9) {
      box(0.13, 2, 0.13, wood, x, 1, z);
      const tree = new T.Mesh(
        new T.IcosahedronGeometry(1.35, 1),
        mat("#3c5e4c"),
      );
      tree.scale.set(1.4, 0.8, 1.1);
      tree.position.set(x, 2.7, z);
      world.add(tree);
    }
  // NRG Center north of the stadium, arena toward the southeast, historic Astrodome immediately east.
  box(39, 3.2, 15, mat("#9caaa9"), -77, 1.6, 23);
  box(40, 0.25, 15.6, roofWhite, -77, 3.3, 23);
  for (let i = 0; i < 14; i++)
    box(0.12, 0.1, 15.5, roofSteel, -96 + i * 2.9, 3.48, 23);
  label("RELIANT CENTER", 17, 0.75, -77, 2.6, 30.58, "#dee4e2", "#344c59", 95);
  box(23, 3.5, 13, mat("#8c999a"), -64, 1.75, 108.5);
  box(24, 0.35, 14, roofWhite, -64, 3.65, 108.5);
  const { domeX, domeZ } = buildAstrodome({
    mat,
    T,
    world,
    box,
    venueSphere,
    roofSteel,
    stadiumConcrete,
    label,
  });
  // Soft contact shadows keep the large structures attached to their plazas.
  const contactCanvas = document.createElement("canvas");
  contactCanvas.width = contactCanvas.height = 128;
  const contactInk = contactCanvas.getContext("2d"),
    contactGradient = contactInk.createRadialGradient(64, 64, 15, 64, 64, 64);
  contactGradient.addColorStop(0, "rgba(0,9,17,.65)");
  contactGradient.addColorStop(0.65, "rgba(0,9,17,.33)");
  contactGradient.addColorStop(1, "rgba(0,9,17,0)");
  contactInk.fillStyle = contactGradient;
  contactInk.fillRect(0, 0, 128, 128);
  const contactTexture = new T.CanvasTexture(contactCanvas);
  for (const [x, z, w, d] of [
    [stadiumX, stadiumZ, 39, 52],
    [domeX, domeZ, 27, 27],
  ]) {
    const shadow = new T.Mesh(
      new T.PlaneGeometry(w, d),
      new T.MeshBasicMaterial({
        map: contactTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.01, z);
    world.add(shadow);
  }
  // Rounded podium and separate corner cores give the stadium its broad, unmistakable profile.
  function roundedRect(shape, x, y, w, h, r) {
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
  }
  function ringMesh(w, d, iw, id, r, y, h, m) {
    const sh = new T.Shape();
    roundedRect(sh, -w / 2, -d / 2, w, d, r);
    const hole = new T.Path();
    roundedRect(hole, -iw / 2, -id / 2, iw, id, Math.min(r, iw / 3));
    sh.holes.push(hole);
    const o = new T.Mesh(
      new T.ExtrudeGeometry(sh, {
        depth: h,
        bevelEnabled: false,
        curveSegments: 16,
      }),
      m,
    );
    o.rotation.x = -Math.PI / 2;
    o.position.set(stadiumX, y, stadiumZ);
    o.receiveShadow = true;
    world.add(o);
    return o;
  }
  ringMesh(29, 42, 22, 34, 4, 0.1, 0.7, stadiumConcrete);
  ringMesh(27.4, 40, 23, 35, 4, 0.8, 5.6, stadiumConcrete);
  // Silver horizontal cladding and blue-gray glazed concourses.
  for (const side of [-1, 1]) {
    box(0.18, 5.1, 28, stadiumGlass, stadiumX + side * 13.74, 3.6, stadiumZ);
    for (let j = 0; j < 9; j++)
      box(
        0.24,
        0.065,
        29,
        roofSteel,
        stadiumX + side * 13.85,
        1.2 + j * 0.57,
        stadiumZ,
      );
    for (let j = 0; j < 19; j++)
      box(
        0.24,
        5.2,
        0.05,
        roofSteel,
        stadiumX + side * 13.85,
        3.6,
        stadiumZ - 13.5 + j * 1.5,
      );
  }
  for (const side of [-1, 1]) {
    box(21, 5.9, 0.16, stadiumGlass, stadiumX, 3.7, stadiumZ + side * 20.03);
    for (let j = 0; j < 11; j++)
      box(
        21,
        0.055,
        0.2,
        roofSteel,
        stadiumX,
        0.9 + j * 0.55,
        stadiumZ + side * 20.14,
      );
    for (let j = 0; j < 17; j++)
      box(
        0.055,
        6,
        0.2,
        roofSteel,
        stadiumX - 10 + j * 1.25,
        3.7,
        stadiumZ + side * 20.14,
      );
    for (const dx of [-11.7, 11.7]) {
      box(3.3, 8, 4.4, stadiumCore, stadiumX + dx, 4, stadiumZ + side * 16.6);
      for (let j = 0; j < 6; j++)
        box(
          1,
          0.28,
          0.025,
          dark,
          stadiumX + dx,
          1.4 + j * 0.8,
          stadiumZ + side * 18.82,
        );
    }
  }
  // Main entrances: recessed paired doors, glazing mullions, broad canopy, stairs and an accessible approach.
  for (const side of [-1, 1]) {
    const z = stadiumZ + side * 20.45;
    for (const y of [1.9, 3.4, 4.9])
      box(20.7, 0.15, 0.32, stadiumConcrete, stadiumX, y, z);
    box(5.5, 0.28, 2.5, roofWhite, stadiumX, 2.55, stadiumZ + side * 21.2);
    for (const dx of [-2.4, 2.4])
      box(
        0.12,
        2.4,
        0.12,
        roofSteel,
        stadiumX + dx,
        1.2,
        stadiumZ + side * 22.1,
      );
    for (let j = 0; j < 4; j++) {
      box(
        0.96,
        2,
        0.07,
        stadiumGlass,
        stadiumX - 1.5 + j,
        1.1,
        stadiumZ + side * 20.7,
      );
      box(
        0.06,
        2.1,
        0.12,
        roofSteel,
        stadiumX - 2 + j,
        1.1,
        stadiumZ + side * 20.75,
      );
      box(
        0.045,
        0.4,
        0.08,
        roofWhite,
        stadiumX - 1.25 + j,
        1.1,
        stadiumZ + side * 20.79,
      );
    }
    for (let step = 0; step < 4; step++)
      box(
        7,
        0.1,
        1.4,
        stadiumConcrete,
        stadiumX,
        0.05 + step * 0.1,
        stadiumZ + side * (22.7 - step * 0.27),
      );
    for (const dx of [-3.6, 3.6])
      beam(
        new T.Vector3(stadiumX + dx, 0.7, stadiumZ + side * 23.2),
        new T.Vector3(stadiumX + dx, 1.1, stadiumZ + side * 21.8),
        0.025,
        roofSteel,
      );
    for (let j = 0; j < 7; j++)
      box(
        0.07,
        0.65,
        0.07,
        roofSteel,
        stadiumX - 4.2 + j * 1.4,
        0.33,
        stadiumZ + side * 23.8,
      );
  }
  // Tiered blue seating wraps all four sides; narrow cream circulation aisles break up the bowl.
  for (let j = 0; j < 20; j++) {
    const u = j / 19,
      iw = 10.8 + u * 10.6,
      id = 23 + u * 9.7,
      y = 0.85 + u * 5.3;
    ringMesh(
      iw + 0.43,
      id + 0.43,
      iw,
      id,
      2.9,
      y,
      0.3,
      j === 8 || j === 14 ? stadiumConcrete : seatBlue,
    );
  }
  for (const z of [-1, 1])
    box(15, 0.55, 0.7, seatRed, stadiumX, 4.3, stadiumZ + z * 15.7);
  for (const side of [-1, 1])
    for (const z of [-10, 0, 10]) {
      const aisle = box(
        5.6,
        0.055,
        0.24,
        stadiumConcrete,
        stadiumX + side * 8.1,
        3.5,
        stadiumZ + z,
      );
      aisle.rotation.z = side * 0.46;
    }
  // Field texture: yard lines, hash marks, numbers, end zones and midfield lettering.
  const fieldCanvas = document.createElement("canvas");
  fieldCanvas.width = 768;
  fieldCanvas.height = 1536;
  const fc = fieldCanvas.getContext("2d");
  fc.fillStyle = "#2d693f";
  fc.fillRect(0, 0, 768, 1536);
  for (let j = 0; j < 24; j++) {
    fc.fillStyle = j % 2 ? "#37784b" : "#326e43";
    fc.fillRect(0, j * 64, 768, 64);
  }
  fc.fillStyle = "#15394c";
  fc.fillRect(0, 0, 768, 128);
  fc.fillRect(0, 1408, 768, 128);
  fc.strokeStyle = "#f1eee3";
  fc.lineWidth = 3;
  fc.strokeRect(26, 18, 716, 1500);
  fc.textAlign = "center";
  fc.textBaseline = "middle";
  fc.fillStyle = "#f1eee3";
  fc.font = "700 56px sans-serif";
  fc.fillText("HOUSTON", 384, 66);
  fc.save();
  fc.translate(384, 1470);
  fc.rotate(Math.PI);
  fc.fillText("HOUSTON", 0, 0);
  fc.restore();
  for (let j = 0; j <= 20; j++) {
    const y = 128 + j * 64;
    fc.beginPath();
    fc.moveTo(26, y);
    fc.lineTo(742, y);
    fc.stroke();
    if (j % 2 === 0 && j > 0 && j < 20) {
      fc.font = "bold 26px sans-serif";
      const n = j <= 10 ? j * 5 : (20 - j) * 5;
      fc.fillText(String(n), 104, y - 12);
      fc.fillText(String(n), 664, y - 12);
    }
    for (let k = 1; k < 5; k++)
      for (const x of [300, 468]) fc.fillRect(x, y + k * 12, 15, 3);
  }
  fc.font = "900 48px sans-serif";
  const ft = new T.CanvasTexture(fieldCanvas);
  ft.colorSpace = T.SRGBColorSpace;
  const field = new T.Mesh(
    new T.PlaneGeometry(10.5, 24),
    mat("#ffffff", { map: ft, roughness: 1 }),
  );
  field.scale.x = -1;
  field.rotation.x = -Math.PI / 2;
  field.position.set(stadiumX, 0.72, stadiumZ);
  world.add(field);
  loadVenueMark("texans", (im) => {
    fc.save();
    fc.shadowColor = "#ffffff";
    fc.shadowBlur = 4;
    fc.drawImage(im, 248, 630, 272, 272);
    fc.restore();
    ft.needsUpdate = true;
  });
  for (const dz of [-12.2, 12.2]) {
    const yellow = mat("#e7c748");
    box(0.07, 2.3, 0.07, yellow, stadiumX, 1.85, stadiumZ + dz);
    box(2.5, 0.07, 0.07, yellow, stadiumX, 3, stadiumZ + dz);
    for (const dx of [-1.25, 1.25])
      box(0.055, 2.4, 0.055, yellow, stadiumX + dx, 4.2, stadiumZ + dz);
  }
  // Continuous supertrusses run north/south, above the sidelines. Diagonals stay joined to their chords.
  for (const side of [-1, 1]) {
    const x = stadiumX + side * 12.9;
    for (const y of [7.8, 10.2])
      beam(
        new T.Vector3(x, y, stadiumZ - 23),
        new T.Vector3(x, y, stadiumZ + 23),
        0.12,
        roofSteel,
      );
    for (let j = 0; j < 23; j++) {
      const z = stadiumZ - 23 + j * 2;
      beam(
        new T.Vector3(x, 7.8, z),
        new T.Vector3(x, 10.2, z + 1),
        0.07,
        roofSteel,
      );
      beam(
        new T.Vector3(x, 10.2, z + 1),
        new T.Vector3(x, 7.8, z + 2),
        0.07,
        roofSteel,
      );
    }
    for (const z of [-17, 17]) {
      beam(
        new T.Vector3(x, 7.8, stadiumZ + z),
        new T.Vector3(x + side * 1.9, 0.5, stadiumZ + z),
        0.2,
        stadiumConcrete,
      );
    }
    box(0.22, 0.18, 46, mat("#8b989f", { metalness: 0.7 }), x, 10.34, stadiumZ);
  }
  // Two white fabric panels split at midfield and slide toward the end zones, as the real mechanism does.
  const roofPanels = [];
  let roofOpen = 0,
    roofTarget = 0;
  function curvedRoof(width, depth) {
    const g = new T.PlaneGeometry(width, depth, 36, 12);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i),
        z = -pos.getY(i);
      const rise = 1.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2));
      pos.setXYZ(i, x, 10.45 + rise + 0.035 * Math.cos(z * 2.5), z);
    }
    g.computeVertexNormals();
    const roof = new T.Mesh(g, roofWhite);
    roof.castShadow = true;
    roof.receiveShadow = true;
    const vertices = [];
    for (const end of [-1, 1])
      for (let j = 0; j < 36; j++) {
        const a = -width / 2 + (j * width) / 36,
          b = a + width / 36,
          ya = 10.45 + 1.2 * Math.sqrt(Math.max(0, 1 - (a / (width / 2)) ** 2)),
          yb = 10.45 + 1.2 * Math.sqrt(Math.max(0, 1 - (b / (width / 2)) ** 2)),
          z = (end * depth) / 2;
        vertices.push(
          a,
          ya,
          z,
          b,
          yb,
          z,
          a,
          ya - 0.48,
          z,
          b,
          yb,
          z,
          b,
          yb - 0.48,
          z,
          a,
          ya - 0.48,
          z,
        );
      }
    const fasciaGeometry = new T.BufferGeometry();
    fasciaGeometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(vertices, 3),
    );
    fasciaGeometry.computeVertexNormals();
    roof.add(new T.Mesh(fasciaGeometry, roofWhite));
    return roof;
  }
  for (const side of [-1, 1]) {
    const group = new T.Group();
    group.position.set(stadiumX, 0, stadiumZ + side * 6.05);
    const panel = curvedRoof(26, 12.08);
    group.add(panel);
    for (let j = 0; j < 7; j++) {
      const z = -6 + j * 2;
      const pts = [];
      for (let k = 0; k <= 24; k++) {
        const x = -13 + (k * 26) / 24;
        pts.push(
          new T.Vector3(
            x,
            10.47 + 1.2 * Math.sqrt(Math.max(0, 1 - (x / 13) ** 2)),
            z,
          ),
        );
      }
      group.add(
        new T.Line(
          new T.BufferGeometry().setFromPoints(pts),
          new T.LineBasicMaterial({ color: "#bbc6cc" }),
        ),
      );
    }
    for (const dx of [-12.9, 12.9]) {
      const rail = new T.Mesh(new T.BoxGeometry(0.3, 0.35, 12), roofSteel);
      rail.position.set(dx, 10.22, 0);
      group.add(rail);
    }
    world.add(group);
    roofPanels.push({ group, side });
  }
  // Stationary roof skirts and end decks receive the retracted panels.
  for (const side of [-1, 1]) {
    box(3, 0.3, 44, roofWhite, stadiumX + side * 14.2, 9.7, stadiumZ);
    const fixed = curvedRoof(26, 10.4);
    fixed.position.set(stadiumX, -0.25, stadiumZ + side * 17.3);
    world.add(fixed);
  }
  // Front sign follows the supplied Reliant-Stadium_3.jpg: white lowercase letters and colored square emblem.
  const signCanvas = document.createElement("canvas");
  signCanvas.width = 2048;
  signCanvas.height = 288;
  const signInk = signCanvas.getContext("2d");
  signInk.font = "600 192px Arial, sans-serif";
  signInk.textBaseline = "middle";
  const leftWord = "reliant",
    rightWord = "stadium",
    leftWidth = signInk.measureText(leftWord).width,
    rightWidth = signInk.measureText(rightWord).width,
    emblemWidth = 170,
    totalWidth = leftWidth + rightWidth + emblemWidth + 40,
    startSign = (2048 - totalWidth) / 2;
  signInk.shadowColor = "#1a2528";
  signInk.shadowOffsetX = 5;
  signInk.shadowOffsetY = 7;
  signInk.shadowBlur = 4;
  signInk.fillStyle = "#fcfcf7";
  signInk.fillText(leftWord, startSign, 161);
  signInk.fillText(rightWord, startSign + leftWidth + emblemWidth + 40, 161);
  const emblemX = startSign + leftWidth + 20,
    emblemY = 43,
    tile = 29;
  const emblemTiles = [
    [2, 0, "#d61886"],
    [1, 1, "#ad1c83"],
    [2, 1, "#662276"],
    [0, 2, "#5e277d"],
    [1, 2, "#196c9c"],
    [2, 2, "#c32489"],
    [3, 2, "#a2c83a"],
    [1, 3, "#54a63c"],
    [2, 3, "#00a7bb"],
    [3, 3, "#759e28"],
    [4, 3, "#e3d527"],
    [2, 4, "#0099c1"],
    [3, 4, "#345586"],
    [4, 4, "#edcf26"],
  ];
  for (const [x, y, color] of emblemTiles) {
    signInk.fillStyle = color;
    signInk.fillRect(
      emblemX + x * tile,
      emblemY + y * tile,
      tile - 4,
      tile - 4,
    );
  }
  const signTexture = new T.CanvasTexture(signCanvas);
  signTexture.colorSpace = T.SRGBColorSpace;
  const signMaterial = new T.MeshStandardMaterial({
    map: signTexture,
    transparent: true,
    alphaTest: 0.08,
    roughness: 0.6,
    emissive: "#ffffff",
    emissiveMap: signTexture,
    emissiveIntensity: 0.24,
  });
  for (const side of [-1, 1]) {
    box(
      22,
      1.75,
      0.24,
      mat("#8d9c9e", { metalness: 0.38, roughness: 0.55 }),
      stadiumX,
      7.05,
      stadiumZ + side * 20.22,
    );
    const board = new T.Mesh(new T.PlaneGeometry(20, 2.81), signMaterial);
    board.scale.x = -1;
    board.position.set(stadiumX, 7.1, stadiumZ + side * 20.37);
    if (side < 0) board.rotation.y = Math.PI;
    world.add(board);
    const screen = label(
      "HOUSTON / HOME FIELD",
      14,
      1.45,
      stadiumX,
      6.3,
      stadiumZ + side * 16.3,
      "#e2e8ed",
      "#203e54",
      90,
    );
    screen.scale.x = -1;
    if (side > 0) screen.rotation.y = Math.PI;
    screen.material.emissive = new T.Color("#93b8c9");
    screen.material.emissiveIntensity = 0.5;
  }
  // Individual blue seats use two instanced draws for the complete bowl.
  const seatPlacements = [];
  for (let row = 0; row < 20; row++) {
    const u = row / 19,
      hx = (10.8 + u * 10.6) / 2 + 0.2,
      hz = (23 + u * 9.7) / 2 + 0.2,
      r = 2.9,
      y = 1.22 + u * 5.3;
    for (const side of [-1, 1]) {
      for (let z = -hz + r; z < hz - r; z += 0.38)
        seatPlacements.push([side * hx, y, z, (side * Math.PI) / 2]);
      for (let x = -hx + r; x < hx - r; x += 0.38)
        seatPlacements.push([x, y, side * hz, side > 0 ? 0 : Math.PI]);
    }
    for (const xs of [-1, 1])
      for (const zs of [-1, 1])
        for (let j = 0; j < 12; j++) {
          const a = ((j / 12) * Math.PI) / 2,
            x = xs * (hx - r + r * Math.cos(a)),
            z = zs * (hz - r + r * Math.sin(a));
          seatPlacements.push([
            x,
            y,
            z,
            Math.atan2(x - xs * (hx - r), z - zs * (hz - r)),
          ]);
        }
  }
  const seatCushions = new T.InstancedMesh(
      new T.BoxGeometry(0.27, 0.075, 0.24),
      seatBlue,
      seatPlacements.length,
    ),
    seatBacks = new T.InstancedMesh(
      new T.BoxGeometry(0.27, 0.22, 0.065),
      seatBlue,
      seatPlacements.length,
    ),
    seatDummy = new T.Object3D();
  seatPlacements.forEach(([x, y, z, a], i) => {
    seatDummy.position.set(stadiumX + x, y, stadiumZ + z);
    seatDummy.rotation.set(0, a, 0);
    seatDummy.updateMatrix();
    seatCushions.setMatrixAt(i, seatDummy.matrix);
    seatDummy.position.y += 0.12;
    seatDummy.position.x += Math.sin(a) * 0.1;
    seatDummy.position.z += Math.cos(a) * 0.1;
    seatDummy.updateMatrix();
    seatBacks.setMatrixAt(i, seatDummy.matrix);
    const c = new T.Color(
      i % 13 === 0 ? "#426d85" : i % 5 === 0 ? "#375b72" : "#23445d",
    );
    seatCushions.setColorAt(i, c);
    seatBacks.setColorAt(i, c);
  });
  world.add(seatCushions, seatBacks);
  const fieldFill = new T.PointLight("#d4e7ff", 35, 36, 2);
  fieldFill.position.set(stadiumX, 15, stadiumZ);
  scene.add(fieldFill);
  // Tree-lined plazas, pedestrian paths, tall parking lights and perimeter fencing.
  for (const z of [stadiumZ - 23, stadiumZ + 23]) {
    box(31, 0.12, 3, concrete, stadiumX, 0.02, z);
    for (const dx of [-13, -8, 8, 13]) {
      box(0.12, 2, 0.12, wood, stadiumX + dx, 1, z);
      const crown = new T.Mesh(new T.IcosahedronGeometry(1, 1), mat("#365a42"));
      crown.scale.set(1.3, 0.7, 1);
      crown.position.set(stadiumX + dx, 2.2, z);
      world.add(crown);
    }
  }
  for (const x of [-119, -52])
    for (const z of [38, 64, 91]) {
      box(0.12, 12, 0.12, roofSteel, x, 6, z);
      box(
        1.3,
        0.2,
        1.3,
        new T.MeshBasicMaterial({ color: "#cfdef1" }),
        x,
        12,
        z,
      );
    }

  const stadiumDistrict = new T.Group();
  world.children
    .slice(stadiumDistrictStart)
    .forEach((o) => stadiumDistrict.add(o));
  stadiumDistrict.add(fieldFill);
  world.add(stadiumDistrict);
  stadiumDistrict.position.set(-15, 0, -334);
  stadiumDistrict.scale.z = -1;

  return {
    stadiumZ,
    roofSteel,
    campusRoadFootprints,
    contactTexture,
    roofPanels,
    get roofOpen() {
      return roofOpen;
    },
    set roofOpen(value) {
      roofOpen = value;
    },
    get roofTarget() {
      return roofTarget;
    },
    set roofTarget(value) {
      roofTarget = value;
    },
  };
}
