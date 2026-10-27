import { $, $$, esc } from "../../core/dom.js";
export function buildBallpark({
  world,
  mat,
  T,
  box,
  concrete,
  architecturalBrick,
  limestone,
  copperGreen,
  venueArch,
  venueGlass,
  loadVenueMark,
  label,
  dark,
  renderer,
}) {
  const ballparkStart = world.children.length;
  // Daikin Park / Union Station: brick-and-limestone perimeter, copper roofs, clock tower and three arched roof sections.
  const parkX = 41,
    parkZ = -76,
    parkSteel = mat("#53897f", { metalness: 0.45, roughness: 0.5 }),
    parkSeats = mat("#284c43"),
    parkRoofMat = mat("#dddcc9", { roughness: 0.8, side: T.DoubleSide });
  box(29, 0.18, 29, concrete, parkX, 0.02, parkZ);
  for (const side of [-1, 1]) {
    box(1.6, 5.4, 25, architecturalBrick, parkX + side * 12.6, 2.7, parkZ);
    box(1.72, 0.22, 25.1, limestone, parkX + side * 12.6, 1.3, parkZ);
    box(1.72, 0.24, 25.1, limestone, parkX + side * 12.6, 3.7, parkZ);
    box(2.4, 0.2, 25.3, copperGreen, parkX + side * 12.6, 5.5, parkZ);
    for (let j = 0; j < 11; j++) {
      const z = parkZ - 10.8 + j * 2.15;
      venueArch(
        1.3,
        2.2,
        parkX + side * 13.42,
        0.55,
        z,
        venueGlass,
        side > 0 ? Math.PI / 2 : -Math.PI / 2,
      );
      box(0.18, 1.6, 0.8, limestone, parkX + side * 13.45, 4.35, z);
    }
  }
  for (const side of [-1, 1]) {
    box(24, 4.5, 1.5, architecturalBrick, parkX, 2.25, parkZ + side * 12.4);
    for (const y of [1.2, 3.6])
      box(24, 0.18, 1.6, limestone, parkX, y, parkZ + side * 12.4);
    for (let j = 0; j < 12; j++) {
      venueArch(
        1.3,
        2.4,
        parkX - 11 + j * 2,
        0.4,
        parkZ + side * 13.18,
        venueGlass,
        side < 0 ? Math.PI : 0,
      );
    }
  }
  // Square corner towers with copper cornices; the southwest tower carries a real clock face.
  for (const side of [-1, 1])
    for (const end of [-1, 1]) {
      const x = parkX + side * 11.7,
        z = parkZ + end * 11.7,
        h = side < 0 && end < 0 ? 8.1 : 6.5;
      box(2.4, h, 2.4, architecturalBrick, x, h / 2, z);
      for (const y of [1.4, 3.5, h - 0.4])
        box(2.55, 0.25, 2.55, limestone, x, y, z);
      box(2.9, 0.25, 2.9, copperGreen, x, h + 0.2, z);
      const clockCanvas = document.createElement("canvas");
      clockCanvas.width = clockCanvas.height = 128;
      const ck = clockCanvas.getContext("2d");
      ck.fillStyle = "#c3c8b4";
      ck.beginPath();
      ck.arc(64, 64, 59, 0, Math.PI * 2);
      ck.fill();
      ck.strokeStyle = "#365b50";
      ck.lineWidth = 8;
      ck.stroke();
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI) / 6;
        ck.lineWidth = 3;
        ck.beginPath();
        ck.moveTo(64 + Math.sin(a) * 45, 64 + Math.cos(a) * 45);
        ck.lineTo(64 + Math.sin(a) * 51, 64 + Math.cos(a) * 51);
        ck.stroke();
      }
      ck.lineWidth = 5;
      ck.beginPath();
      ck.moveTo(64, 29);
      ck.lineTo(64, 64);
      ck.lineTo(88, 77);
      ck.stroke();
      const texture = new T.CanvasTexture(clockCanvas);
      texture.colorSpace = T.SRGBColorSpace;
      const clock = new T.Mesh(
        new T.PlaneGeometry(1.5, 1.5),
        new T.MeshStandardMaterial({ map: texture, transparent: true }),
      );
      clock.position.set(x, h - 1.3, z + end * 1.22);
      if (end < 0) clock.rotation.y = Math.PI;
      world.add(clock);
    }
  // Union Station is the lower limestone frontage on Crawford, on the west side.
  box(2, 2.7, 17, limestone, parkX - 13.6, 1.35, parkZ - 2);
  for (let j = 0; j < 7; j++)
    venueArch(
      1.55,
      2.15,
      parkX - 14.62,
      0.2,
      parkZ - 9 + j * 2.3,
      venueGlass,
      -Math.PI / 2,
    );
  for (const z of [-7, 4]) {
    const awning = box(1.6, 0.15, 3, copperGreen, parkX - 14.5, 2.8, parkZ + z);
    awning.rotation.z = -0.15;
    for (const dz of [-1.2, 1.2])
      box(0.07, 2.7, 0.07, parkSteel, parkX - 14.8, 1.35, parkZ + z + dz);
  }
  // Proper baseball diamond, infield arc, mound, bases, batter boxes and striped outfield.
  const baseballCanvas = document.createElement("canvas");
  baseballCanvas.width = baseballCanvas.height = 1024;
  const bc = baseballCanvas.getContext("2d");
  bc.fillStyle = "#315c3e";
  bc.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26; i++) {
    bc.fillStyle = i % 2 ? "#438348" : "#397644";
    bc.fillRect(i * 40, 0, 40, 1024);
  }
  bc.fillStyle = "#ae7951";
  bc.beginPath();
  bc.moveTo(512, 870);
  bc.arc(512, 870, 390, -Math.PI * 0.76, -Math.PI * 0.24);
  bc.closePath();
  bc.fill();
  bc.beginPath();
  bc.moveTo(512, 870);
  bc.lineTo(724, 658);
  bc.lineTo(512, 446);
  bc.lineTo(300, 658);
  bc.closePath();
  bc.lineWidth = 28;
  bc.strokeStyle = "#b68053";
  bc.stroke();
  bc.fillStyle = "#3f7d45";
  bc.fill();
  bc.fillStyle = "#b98254";
  bc.beginPath();
  bc.arc(512, 659, 30, 0, Math.PI * 2);
  bc.fill();
  bc.beginPath();
  bc.arc(512, 870, 48, 0, Math.PI * 2);
  bc.fill();
  bc.fillStyle = "#f0e7cc";
  for (const [x, y] of [
    [512, 870],
    [724, 658],
    [512, 446],
    [300, 658],
  ]) {
    bc.save();
    bc.translate(x, y);
    bc.rotate(Math.PI / 4);
    bc.fillRect(-7, -7, 14, 14);
    bc.restore();
  }
  bc.fillRect(502, 654, 20, 5);
  bc.strokeStyle = "#ece7d6";
  bc.lineWidth = 3;
  bc.beginPath();
  bc.moveTo(80, 440);
  bc.lineTo(512, 870);
  bc.lineTo(944, 440);
  bc.stroke();
  bc.strokeRect(479, 852, 17, 38);
  bc.strokeRect(529, 852, 17, 38);
  bc.font = "700 35px Arial";
  bc.textAlign = "center";
  bc.fillStyle = "#e0d8bd";
  bc.fillText("HOUSTON", 512, 120);
  const baseballTexture = new T.CanvasTexture(baseballCanvas);
  baseballTexture.colorSpace = T.SRGBColorSpace;
  const baseballField = new T.Mesh(
    new T.PlaneGeometry(19, 21),
    mat("#ffffff", { map: baseballTexture, roughness: 1 }),
  );
  baseballField.rotation.set(-Math.PI / 2, 0, Math.PI);
  baseballField.position.set(parkX, 0.35, parkZ);
  world.add(baseballField);
  loadVenueMark("astros", (im) => {
    bc.drawImage(im, 422, 210, 180, 180);
    baseballTexture.needsUpdate = true;
  });
  // U-shaped seating tiers face home plate; the outfield stays an open lawn and high green wall.
  for (let row = 0; row < 14; row++) {
    const u = row / 13,
      h = 0.65 + u * 3.3,
      rx = 9 + u * 2.4,
      rz = 9 + u * 2;
    const pts = [
      new T.Vector3(parkX - rx, h, parkZ + 6),
      new T.Vector3(parkX - rx, h, parkZ - 5),
      new T.Vector3(parkX - rx * 0.7, h, parkZ - rz),
      new T.Vector3(parkX + rx * 0.7, h, parkZ - rz),
      new T.Vector3(parkX + rx, h, parkZ - 5),
      new T.Vector3(parkX + rx, h, parkZ + 6),
    ];
    const path = new T.CatmullRomCurve3(pts);
    const strip = new T.Mesh(
      new T.TubeGeometry(path, 96, 0.14, 4, false),
      row === 8 ? limestone : parkSeats,
    );
    world.add(strip);
  }
  box(21, 2.3, 0.25, parkSeats, parkX, 1.35, parkZ + 10.5);
  for (let j = 0; j < 5; j++)
    box(3.3, 0.3, 3.4, parkSeats, parkX - 9.3, 1.3 + j * 0.46, parkZ + 7.4);
  label(
    "CRAWFORD BOXES",
    5,
    0.45,
    parkX - 8,
    3.6,
    parkZ + 9.5,
    "#ede3c9",
    "#254d41",
    65,
  );
  const score = label(
    "HOUSTON  /  HOME FIELD",
    9,
    2.4,
    parkX + 4,
    4.8,
    parkZ + 10.6,
    "#f6d897",
    "#183b36",
    83,
  );
  score.rotation.y = Math.PI;
  score.material.emissive = new T.Color("#e1bd73");
  score.material.emissiveIntensity = 0.35;
  // The train and its track, an unmistakable ballpark detail, sit high along the outfield wall.
  box(10, 0.18, 0.5, parkSteel, parkX - 4, 4.3, parkZ + 11.2);
  box(1.7, 0.65, 0.7, mat("#383a35"), parkX - 6, 4.7, parkZ + 11.2);
  box(0.7, 0.9, 0.8, architecturalBrick, parkX - 5, 4.9, parkZ + 11.2);
  box(0.18, 0.8, 0.18, dark, parkX - 6.5, 5.2, parkZ + 11.2);
  for (const x of [-6.5, -5.6, -4.8]) {
    const wheel = new T.Mesh(
      new T.CylinderGeometry(0.22, 0.22, 0.85, 12),
      dark,
    );
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(parkX + x, 4.45, parkZ + 11.2);
    world.add(wheel);
  }
  box(1.5, 0.65, 0.8, mat("#b77832"), parkX - 3.5, 4.75, parkZ + 11.2);
  // Three cream fabric barrel roofs and mint-green latticed arch trusses telescope over the outfield.
  const ballparkPanels = [];
  let ballparkOpen = 1,
    ballparkTarget = 1;
  const daikinCanvas = document.createElement("canvas");
  daikinCanvas.width = 2048;
  daikinCanvas.height = 672;
  const dk = daikinCanvas.getContext("2d");
  dk.fillStyle = "#e6e5d9";
  dk.fillRect(0, 0, 2048, 672);
  dk.strokeStyle = "#b8c0bb";
  dk.lineWidth = 2;
  for (let x = 0; x < 2048; x += 64) {
    dk.beginPath();
    dk.moveTo(x, 0);
    dk.lineTo(x, 672);
    dk.stroke();
  }
  dk.save();
  dk.translate(170, 180);
  dk.fillStyle = "#00a1de";
  dk.beginPath();
  dk.moveTo(0, 0);
  dk.lineTo(350, 0);
  dk.lineTo(0, 260);
  dk.closePath();
  dk.fill();
  dk.fillStyle = "#152e45";
  dk.beginPath();
  dk.moveTo(0, 0);
  dk.lineTo(130, 0);
  dk.lineTo(0, 97);
  dk.closePath();
  dk.fill();
  dk.restore();
  dk.fillStyle = "#008ac4";
  dk.textAlign = "left";
  dk.textBaseline = "middle";
  dk.font = "italic 900 250px Arial, sans-serif";
  dk.fillText("DAIKIN", 490, 285, 1380);
  dk.font = "700 112px Arial, sans-serif";
  dk.fillStyle = "#263f4d";
  dk.fillText("P A R K", 510, 455, 1280);
  const daikinTexture = new T.CanvasTexture(daikinCanvas);
  daikinTexture.colorSpace = T.SRGBColorSpace;
  daikinTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const daikinRoofMat = mat("#ffffff", {
    map: daikinTexture,
    roughness: 0.78,
    side: T.DoubleSide,
  });

  for (let panel = 0; panel < 3; panel++) {
    const group = new T.Group(),
      width = 25.5,
      depth = 8.4,
      base = 7.8 + panel * 0.75;
    const geo = new T.PlaneGeometry(width, depth, 48, 8),
      pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i),
        z = -pa.getY(i);
      pa.setXYZ(
        i,
        x,
        base + 3.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2)),
        z,
      );
    }
    geo.computeVertexNormals();
    group.add(new T.Mesh(geo, panel === 1 ? daikinRoofMat : parkRoofMat));
    for (const end of [-1, 1]) {
      const top = [],
        bottom = [];
      for (let j = 0; j <= 24; j++) {
        const x = -width / 2 + (j * width) / 24,
          y = base + 3.2 * Math.sqrt(Math.max(0, 1 - (x / (width / 2)) ** 2));
        top.push(new T.Vector3(x, y, (end * depth) / 2));
        bottom.push(new T.Vector3(x, y - 1.1, (end * depth) / 2));
      }
      for (const points of [top, bottom])
        group.add(
          new T.Mesh(
            new T.TubeGeometry(
              new T.CatmullRomCurve3(points),
              48,
              0.055,
              5,
              false,
            ),
            parkSteel,
          ),
        );
      for (let j = 0; j < 24; j++) {
        const a = top[j],
          b = bottom[j + 1],
          v = b.clone().sub(a),
          beamMesh = new T.Mesh(
            new T.CylinderGeometry(0.035, 0.035, v.length(), 5),
            parkSteel,
          );
        beamMesh.position.copy(a).add(b).multiplyScalar(0.5);
        beamMesh.quaternion.setFromUnitVectors(
          new T.Vector3(0, 1, 0),
          v.normalize(),
        );
        group.add(beamMesh);
      }
    }
    group.position.set(parkX, 0, parkZ + 8.8 + panel * 0.35);
    world.add(group);
    ballparkPanels.push({ group, panel });
  }
  for (const side of [-1, 1]) {
    box(0.25, 0.18, 27, parkSteel, parkX + side * 12.8, 7.6, parkZ);
    for (let j = 0; j < 10; j++)
      box(
        0.15,
        3,
        0.15,
        parkSteel,
        parkX + side * 12.8,
        6.1,
        parkZ - 11.5 + j * 2.55,
      );
  }
  const parkSign = label(
    "DAIKIN PARK",
    11,
    0.9,
    parkX - 14.66,
    4.2,
    parkZ,
    "#e3e9dc",
    "#315d55",
    95,
  );
  parkSign.rotation.y = -Math.PI / 2;

  const ballparkDistrict = new T.Group();
  world.children.slice(ballparkStart).forEach((o) => ballparkDistrict.add(o));
  world.add(ballparkDistrict);
  ballparkDistrict.position.set(39, 0, -49);

  return {
    parkZ,
    ballparkPanels,
    get ballparkOpen() {
      return ballparkOpen;
    },
    set ballparkOpen(value) {
      ballparkOpen = value;
    },
    get ballparkTarget() {
      return ballparkTarget;
    },
    set ballparkTarget(value) {
      ballparkTarget = value;
    },
  };
}
