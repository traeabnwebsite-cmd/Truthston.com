import { archiveYearRows } from "./archive-layout.js";
import { buildShopDoor } from "../rooms/doorway.js";
import { $, $$, esc } from "../../core/dom.js";
export function buildStreet({
  box,
  wood,
  paper,
  T,
  world,
  mat,
  hit,
  go,
  label,
  rand,
  dark,
  scene,
  canvas,
  red,
  getWorld,
  twin,
  today,
  timeline,
}) {
  const streetCenter = 6.65;
  const { pivot: doorPivot } = buildShopDoor({
    T,
    world,
    box,
    mat,
    label,
    hit,
    wood,
    x: 6.65,
    z: -5.65,
    title: "STEP OUTSIDE / TRUTHSTON",
    action: () => go(3),
    closed: true,
    color: "#334b35",
  });
  const exteriorStart = world.children.length;
  // Houston city set: landmark silhouettes based on real architecture; distances are compressed for a cinematic prototype.
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 2048;
  skyCanvas.height = 1024;
  const sx = skyCanvas.getContext("2d"),
    sg = sx.createLinearGradient(0, 0, 0, 1024);
  sg.addColorStop(0, "#071e50");
  sg.addColorStop(0.48, "#124e8b");
  sg.addColorStop(0.75, "#326f95");
  sg.addColorStop(0.91, "#ae8a7b");
  sg.addColorStop(1, "#d4a06f");
  sx.fillStyle = sg;
  sx.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 85; i++) {
    const x = rand() * 2048,
      y = 100 + rand() * 650,
      rx = 70 + rand() * 180,
      ry = 4 + rand() * 14;
    const cloud = sx.createRadialGradient(x, y, 0, x, y, rx);
    cloud.addColorStop(0, "rgba(219,183,177,.055)");
    cloud.addColorStop(1, "rgba(164,182,200,0)");
    sx.save();
    sx.translate(x, y);
    sx.scale(1, ry / rx);
    sx.fillStyle = cloud;
    sx.fillRect(-rx, -rx, rx * 2, rx * 2);
    sx.restore();
  }
  const streetSky = new T.CanvasTexture(skyCanvas);
  streetSky.colorSpace = T.SRGBColorSpace;
  const asphaltCanvas = document.createElement("canvas");
  asphaltCanvas.width = asphaltCanvas.height = 512;
  const ax = asphaltCanvas.getContext("2d");
  ax.fillStyle = "#303538";
  ax.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 30000; i++) {
    ax.fillStyle = rand() > 0.5 ? "#7d817d" : "#10191b";
    ax.globalAlpha = rand() * 0.2;
    ax.fillRect(rand() * 512, rand() * 512, 1.5, 1.5);
  }
  ax.globalAlpha = 0.3;
  ax.strokeStyle = "#101817";
  for (let i = 0; i < 14; i++) {
    ax.beginPath();
    let x = rand() * 512,
      y = rand() * 512;
    ax.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (rand() - 0.5) * 30;
      y += rand() * 20;
      ax.lineTo(x, y);
    }
    ax.stroke();
  }
  const roadTex = new T.CanvasTexture(asphaltCanvas);
  roadTex.wrapS = roadTex.wrapT = T.RepeatWrapping;
  roadTex.repeat.set(3, 13);
  roadTex.colorSpace = T.SRGBColorSpace;
  box(1500, 0.12, 1500, mat("#34433f"), -80, -0.28, -220);
  const asphalt = mat("#767f7f", {
      map: roadTex,
      roughness: 0.55,
      metalness: 0.16,
    }),
    concrete = mat("#797971");
  box(21, 0.15, 97, asphalt, 6.65, -0.12, -56.5);
  box(95, 0.15, 16, asphalt, 6.65, -0.13, -41);
  for (const x of [-4.9, 18.2]) {
    box(2.1, 0.25, 97, concrete, x, 0.015, -56.5);
    box(0.18, 0.32, 97, mat("#aca58a"), x + (x < 6 ? 1 : -1), 0.03, -56.5);
    for (let i = 0; i < 37; i++)
      box(2.1, 0.007, 0.018, dark, x, 0.145, -9 - i * 2.6);
  }
  for (const x of [6.5, 6.8])
    box(0.08, 0.012, 34, mat("#c8a353"), x, -0.035, -26);
  for (const x of [1.7, 11.6])
    for (let i = 0; i < 26; i++) {
      if (i > 6 && i < 10) continue;
      box(0.1, 0.014, 1.8, paper, x, -0.035, -12 - i * 4);
    }
  for (const z of [-31.5])
    for (let i = 0; i < 13; i++)
      box(0.9, 0.015, 0.45, paper, -2.5 + i * 1.55, -0.025, z);
  for (const x of [-1.3, 14.5])
    for (let i = 0; i < 12; i++)
      box(2, 0.012, 0.055, mat("#9c9e8e"), x, -0.02, -15 - i * 7);
  const streetGlow = new T.HemisphereLight("#8daccb", "#242b2c", 1);
  scene.add(streetGlow);
  function glowMat(c, intensity = 0.6) {
    return mat(c, {
      emissive: c,
      emissiveIntensity: intensity,
      roughness: 0.5,
    });
  }
  function beam(a, b, r, m) {
    const v = new T.Vector3().subVectors(b, a);
    const mesh = new T.Mesh(new T.CylinderGeometry(r, r, v.length(), 8), m);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize());
    world.add(mesh);
    return mesh;
  }
  // Truthston city gateway. Supports sit on the sidewalk shoulders, clear of traffic.
  const gatewaySteel = mat("#9aa6a6", { metalness: 0.65, roughness: 0.42 });
  for (const x of [-4.6, 17.9]) {
    box(0.25, 9.8, 0.25, gatewaySteel, x, 4.9, -24.5);
    box(0.8, 0.18, 0.8, concrete, x, 0.15, -24.5);
  }
  box(22.5, 0.2, 0.22, gatewaySteel, 6.65, 9.4, -24.5);
  const welcomeCanvas = document.createElement("canvas");
  welcomeCanvas.width = 2048;
  welcomeCanvas.height = 320;
  const wx = welcomeCanvas.getContext("2d");
  wx.fillStyle = "#214f43";
  wx.fillRect(0, 0, 2048, 320);
  wx.strokeStyle = "#e9ddbb";
  wx.lineWidth = 6;
  wx.strokeRect(14, 14, 2020, 292);
  wx.fillStyle = "#e9ddbb";
  wx.textAlign = "center";
  wx.font = "bold 44px Arial";
  wx.fillText("WELCOME TO", 1024, 76);
  wx.font = "900 130px Impact, Arial, sans-serif";
  wx.fillText("TRUTHSTON, TEXAS", 1024, 230);
  const welcomeTexture = new T.CanvasTexture(welcomeCanvas);
  welcomeTexture.colorSpace = T.SRGBColorSpace;
  const welcomeSign = new T.Mesh(
    new T.PlaneGeometry(16, 2.5),
    new T.MeshBasicMaterial({ map: welcomeTexture, side: T.DoubleSide }),
  );
  welcomeSign.position.set(6.65, 8.35, -24.34);
  welcomeSign.userData.truthstonWelcome = true;
  world.add(welcomeSign);
  canvas.dataset.cityWelcome = "Welcome to Truthston, Texas";
  // Low commercial strips, service alleys, brickwork and street-level windows.
  for (let side = 0; side < 2; side++)
    for (let i = 0; i < 6; i++) {
      const x = side ? 23.5 : -10.2,
        z = -16 - i * 12;
      if (i === 2 || (!side && (i === 0 || i === 4)) || (side && i === 3))
        continue;
      const h = 3.3 + rand() * 2.7,
        w = 7 + rand() * 2;
      box(w, h, 8, mat(["#715747", "#5c5d50", "#504c43"][i % 3]), x, h / 2, z);
      const face = side ? 19.65 : -6.3;
      for (let c = 0; c < 5; c++) {
        box(
          0.045,
          1.7,
          0.8,
          mat("#172b30", {
            metalness: 0.6,
            roughness: 0.3,
            emissive: "#706445",
            emissiveIntensity: 0.22,
          }),
          face,
          1.45,
          z - 3 + c * 1.45,
        );
        box(0.1, 0.12, 1.1, paper, face, 2.35, z - 3 + c * 1.45);
      }
      for (let row = 0; row < 9; row++)
        box(0.04, 0.025, 7.9, mat("#403b32"), face, row * 0.38 + 0.15, z);
      const aw = box(
        1.1,
        0.1,
        7.8,
        mat(i % 2 ? "#345246" : "#793d29"),
        side ? 19.2 : -5.9,
        2.7,
        z,
      );
      aw.rotation.z = side ? -0.09 : 0.09;
      const shop = label(
        [
          "HOUSTON MADE",
          "OPEN LATE",
          "THIRD COAST",
          "CORNER STORE",
          "ALL HEART",
          "BAYOU CITY",
        ][i],
        6,
        0.65,
        face + (side ? -0.1 : 0.1),
        h - 0.5,
        z,
        "#ddc8a2",
        "#273d34",
        72,
      );
      shop.rotation.y = side ? -Math.PI / 2 : Math.PI / 2;
      box(1.6, 0.6, 1.6, mat("#65716b"), x, h + 0.3, z);
      for (let j = 0; j < 8; j++)
        box(0.04, 0.05, 1.5, dark, x - 0.6 + j * 0.17, h + 0.62, z);
    }
  // Horizontal signal heads and green street-name signs at the cross street.
  for (const x of [-4.5, 17.8]) {
    box(0.13, 7, 0.13, dark, x, 3.5, -32);
    const direction = x < 6 ? 1 : -1;
    box(8, 0.12, 0.12, dark, x + direction * 3.9, 6.9, -32);
    for (const off of [2.2, 5.4]) {
      const xx = x + direction * off;
      box(1.25, 0.44, 0.3, mat("#ac882f"), xx, 6.65, -32);
      for (let k = 0; k < 3; k++) {
        const lamp = new T.Mesh(
          new T.CircleGeometry(0.12, 16),
          new T.MeshBasicMaterial({ color: k === 2 ? "#70d5a2" : "#332a22" }),
        );
        lamp.position.set(xx - 0.39 + k * 0.39, 6.65, -31.83);
        world.add(lamp);
      }
    }
    const st = label(
      x < 6 ? "TRAVIS ST" : "TEXAS AVE",
      3.3,
      0.55,
      x + direction * 1.6,
      5.7,
      -31.8,
      "#e2e9d5",
      "#235847",
      75,
    );
  }
  // Weathered utility poles and overhead lines along the sidewalks.
  for (const x of [-5.6, 18.9])
    for (let i = 0; i < 7; i++) {
      const z = -12 - i * 13;
      box(0.15, 7.8, 0.15, wood, x, 3.9, z);
      box(2, 0.1, 0.12, wood, x, 7.25, z);
      if (i < 6)
        for (const dx of [-0.65, 0, 0.65]) {
          const curve = new T.QuadraticBezierCurve3(
            new T.Vector3(x + dx, 7.3, z),
            new T.Vector3(x + dx, 6.7, z - 6.5),
            new T.Vector3(x + dx, 7.3, z - 13),
          );
          world.add(
            new T.Line(
              new T.BufferGeometry().setFromPoints(curve.getPoints(12)),
              new T.LineBasicMaterial({ color: "#242a2b" }),
            ),
          );
        }
    }
  // Amber light pools and restrained wet-road highlights, no flashing.
  for (let i = 0; i < 7; i++)
    for (const side of [-1, 1]) {
      const x = 6.65 + side * 10.7,
        z = -15 - i * 14;
      box(0.09, 6, 0.09, dark, x, 3, z);
      beam(
        new T.Vector3(x, 6, z),
        new T.Vector3(x - side * 1.1, 6.15, z),
        0.06,
        dark,
      );
      box(
        0.6,
        0.1,
        0.3,
        new T.MeshBasicMaterial({ color: "#ffd495" }),
        x - side * 1.2,
        6.1,
        z,
      );
      if (i < 3) {
        const light = new T.PointLight("#ffc17c", 23, 16, 2);
        light.position.set(x - side * 1.2, 5.7, z);
        scene.add(light);
      }
      const pool = new T.Mesh(
        new T.PlaneGeometry(2.4, 7),
        new T.MeshBasicMaterial({
          color: "#c8965e",
          transparent: true,
          opacity: 0.045,
          depthWrite: false,
        }),
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(x - side * 1.7, -0.025, z);
      world.add(pool);
    }
  // Small Houston street details: live-oak silhouettes, curbside bins, hydrants.
  for (const x of [-5.3, 18.6])
    for (const z of [-23, -56, -83]) {
      box(0.24, 2.4, 0.24, wood, x, 1.2, z);
      for (let i = 0; i < 3; i++) {
        const crown = new T.Mesh(
          new T.IcosahedronGeometry(1.4, 1),
          mat("#2d4838"),
        );
        crown.scale.set(1.4, 0.65, 1);
        crown.position.set(x + (i - 1) * 0.6, 2.6 + rand() * 0.5, z);
        world.add(crown);
      }
      box(0.45, 0.8, 0.45, dark, x, 0.4, z + 2);
    }
  for (const z of [-27, -62]) {
    box(0.2, 0.65, 0.2, red, -4.2, 0.45, z);
    box(0.5, 0.16, 0.2, red, -4.2, 0.6, z);
  }
  // Parked sedans with long, low proportions and chrome wheels; no logos or copyrighted vehicle meshes.
  function car(x, z, color, flip = false) {
    const g = new T.Group();
    function part(w, h, d, m, xx, yy, zz) {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(xx, yy, zz);
      g.add(o);
      return o;
    }
    const paint = mat(color, { metalness: 0.55, roughness: 0.32 });
    part(1.85, 0.48, 4.4, paint, 0, 0.65, 0);
    part(
      1.65,
      0.5,
      2.1,
      mat("#253d45", { metalness: 0.75, roughness: 0.2 }),
      0,
      1.08,
      0.1,
    );
    part(1.7, 0.08, 2, paint, 0, 1.36, 0.1);
    part(
      1.92,
      0.13,
      0.12,
      mat("#b1b3a7", { metalness: 0.8, roughness: 0.2 }),
      0,
      0.48,
      2.2,
    );
    for (const xx of [-0.9, 0.9])
      for (const zz of [-1.35, 1.35]) {
        const tire = new T.Mesh(
          new T.CylinderGeometry(0.33, 0.33, 0.23, 16),
          dark,
        );
        tire.rotation.z = Math.PI / 2;
        tire.position.set(xx, 0.37, zz);
        g.add(tire);
        const hub = new T.Mesh(
          new T.CylinderGeometry(0.21, 0.21, 0.25, 12),
          mat("#b4b8b0", { metalness: 0.9, roughness: 0.2 }),
        );
        hub.rotation.z = Math.PI / 2;
        hub.position.copy(tire.position);
        g.add(hub);
      }
    for (const xx of [-0.62, 0.62]) {
      part(
        0.36,
        0.14,
        0.04,
        new T.MeshBasicMaterial({ color: "#fff1c4" }),
        xx,
        0.7,
        -2.23,
      );
      part(
        0.4,
        0.12,
        0.04,
        new T.MeshBasicMaterial({ color: "#b63325" }),
        xx,
        0.7,
        2.23,
      );
    }
    g.position.set(x, 0, z);
    if (flip) g.rotation.y = Math.PI;
    world.add(g);
  }
  // Three commissioned vehicles in a marked service lot directly behind the record shop.
  function customVehicle(kind, x, z, yaw) {
    const g = new T.Group(),
      black = mat("#0b1016", { metalness: 0.55, roughness: 0.25 }),
      glass = mat("#122d3b", { metalness: 0.8, roughness: 0.16 }),
      chrome = mat("#8d9da7", { metalness: 0.9, roughness: 0.2 }),
      rubber = mat("#12171b", { roughness: 0.95 }),
      white = mat("#f1f0e8", { metalness: 0.4, roughness: 0.3 }),
      burgundy = mat("#76273f", {
        metalness: 0.32,
        roughness: 0.38,
        emissive: "#64172f",
        emissiveIntensity: 0.14,
      }),
      amber = mat("#e8a62a", { metalness: 0.6, roughness: 0.25 }),
      led = new T.MeshBasicMaterial({ color: "#d9f3ff" }),
      tail = new T.MeshBasicMaterial({ color: "#df343e" });
    function part(w, h, d, m, xx, yy, zz) {
      const o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
      o.position.set(xx, yy, zz);
      o.castShadow = o.receiveShadow = true;
      g.add(o);
      return o;
    }
    function poly(points, m) {
      const geo = new T.BufferGeometry();
      const vv = [];
      for (let i = 1; i < points.length - 1; i++)
        vv.push(...points[0], ...points[i], ...points[i + 1]);
      geo.setAttribute("position", new T.Float32BufferAttribute(vv, 3));
      geo.computeVertexNormals();
      const o = new T.Mesh(geo, m);
      o.material.side = T.DoubleSide;
      g.add(o);
      return o;
    }
    function prism(outline, width, m) {
      for (const side of [-1, 1])
        poly(
          outline.map(([z, y]) => [(side * width) / 2, y, z]),
          m,
        );
      for (let i = 0; i < outline.length; i++) {
        const a = outline[i],
          b = outline[(i + 1) % outline.length];
        poly(
          [
            [-width / 2, a[1], a[0]],
            [width / 2, a[1], a[0]],
            [width / 2, b[1], b[0]],
            [-width / 2, b[1], b[0]],
          ],
          m,
        );
      }
    }
    function wheels(axle, r, track, hubStyle) {
      for (const xx of [-track, track])
        for (const zz of [-axle, axle]) {
          const tire = new T.Mesh(
            new T.CylinderGeometry(r, r, 0.28, 20),
            rubber,
          );
          tire.rotation.z = Math.PI / 2;
          tire.position.set(xx, r + 0.03, zz);
          g.add(tire);
          const hub = new T.Mesh(
            new T.CylinderGeometry(
              r * 0.69,
              r * 0.69,
              0.3,
              hubStyle === 0 ? 7 : 20,
            ),
            hubStyle === 0 ? black : chrome,
          );
          hub.rotation.z = Math.PI / 2;
          hub.position.copy(tire.position);
          g.add(hub);
          for (let j = 0; j < 6; j++) {
            const a = (j / 6) * Math.PI * 2;
            const spoke = part(
              0.315,
              0.055,
              r * 1.1,
              black,
              xx,
              r + 0.03 + Math.sin(a) * r * 0.22,
              zz + Math.cos(a) * r * 0.22,
            );
            spoke.rotation.x = a;
          }
        }
    }
    if (kind === "cyber") {
      prism(
        [
          [-2.85, 0.67],
          [-2.85, 1.14],
          [-2.35, 1.34],
          [2.65, 1.34],
          [2.85, 1.08],
          [2.85, 0.67],
        ],
        2.17,
        burgundy,
      );
      prism(
        [
          [-2.8, 1.14],
          [-2.35, 1.34],
          [-0.7, 2.12],
          [2.68, 1.38],
          [2.82, 1.13],
        ],
        2.15,
        white,
      );
      poly(
        [
          [-1.015, 1.38, -2.27],
          [1.015, 1.38, -2.27],
          [1.015, 2.1, -0.7],
          [-1.015, 2.1, -0.7],
        ],
        glass,
      );
      for (const side of [-1, 1]) {
        poly(
          [
            [side * 1.087, 1.4, -2.13],
            [side * 1.087, 2.04, -0.7],
            [side * 1.087, 1.71, 0.85],
            [side * 1.087, 1.4, 0.85],
          ],
          glass,
        );
        part(0.04, 0.43, 0.055, white, side * 1.1, 1.63, -0.34);
        part(0.035, 0.04, 0.48, black, side * 1.1, 1.4, 0.24);
        for (const zz of [-1.7, 1.7]) {
          const arch = part(0.11, 0.63, 1.3, black, side * 1.09, 0.77, zz);
          arch.rotation.z = side * 0.05;
        }
        part(0.18, 0.14, 0.4, black, side * 1.23, 1.53, -1.1);
      }
      part(1.9, 0.07, 0.05, led, 0, 1.22, -2.84);
      part(1.9, 0.07, 0.05, tail, 0, 1.22, 2.85);
      part(1.8, 0.06, 1.65, black, 0, 1.39, 1.8);
      for (let j = 0; j < 14; j++)
        part(1.8, 0.025, 0.015, chrome, 0, 1.43, 1 + j * 0.12);
      wheels(1.72, 0.49, 1.04, 0);
    } else if (kind === "silverado") {
      part(2.12, 0.63, 5.95, black, 0, 1.02, 0);
      part(1.98, 0.4, 1.8, black, 0, 1.5, -2.05);
      part(1.97, 0.82, 2.8, black, 0, 1.73, -0.1);
      part(1.93, 0.12, 2.85, black, 0, 2.2, -0.1);
      const wind = part(1.76, 0.69, 0.055, glass, 0, 1.82, -1.52);
      wind.rotation.x = -0.19;
      part(1.8, 0.66, 0.05, glass, 0, 1.82, 1.34);
      for (const side of [-1, 1]) {
        for (const dz of [-0.83, 0.56])
          part(0.04, 0.65, 1.18, glass, side * 1.002, 1.82, dz);
        part(0.06, 0.78, 0.12, black, side * 1.02, 1.82, -0.13);
        part(0.1, 0.08, 0.25, chrome, side * 1.08, 1.47, -0.55);
        part(0.1, 0.08, 0.25, chrome, side * 1.08, 1.47, 0.83);
        part(0.23, 0.19, 0.37, black, side * 1.21, 1.75, -1.11);
        part(0.08, 0.09, 4.1, chrome, side * 1.06, 0.65, 0.25);
      }
      part(1.85, 0.12, 1.5, rubber, 0, 1.32, 2.13);
      for (const xx of [-1.02, 1.02])
        part(0.16, 0.51, 1.65, black, xx, 1.5, 2.1);
      part(2.11, 0.53, 0.15, black, 0, 1.49, 2.93);
      part(1.72, 0.53, 0.05, rubber, 0, 1.24, -3.01);
      for (let j = 0; j < 5; j++)
        part(1.7, 0.035, 0.06, chrome, 0, 1.03 + j * 0.1, -3.05);
      part(2.09, 0.16, 0.2, black, 0, 0.82, -2.98);
      for (const side of [-1, 1]) {
        part(0.38, 0.055, 0.07, led, side * 0.82, 1.56, -3.08);
        part(0.055, 0.39, 0.07, led, side * 1, 1.39, -3.08);
        part(0.25, 0.23, 0.07, led, side * 0.82, 1.2, -3.08);
        part(0.12, 0.44, 0.045, tail, side * 0.91, 1.42, 3.02);
      }
      // Small embossed bowtie in the grille, matching the requested Chevrolet identity.
      part(0.42, 0.1, 0.03, chrome, 0, 1.3, -3.1);
      part(0.21, 0.23, 0.035, chrome, 0, 1.3, -3.12);
      wheels(1.92, 0.51, 1.02, 1);
    } else {
      prism(
        [
          [-2.5, 0.38],
          [-2.45, 0.65],
          [-0.85, 0.94],
          [1.8, 0.91],
          [2.45, 0.67],
          [2.45, 0.38],
        ],
        2.03,
        amber,
      );
      prism(
        [
          [-1.05, 0.89],
          [-0.22, 1.34],
          [1.12, 1.31],
          [1.65, 0.89],
        ],
        1.65,
        glass,
      );
      part(1.3, 0.055, 1.15, amber, 0, 1.36, 0.45);
      for (const side of [-1, 1]) {
        poly(
          [
            [side * 1.03, 0.61, -0.8],
            [side * 0.88, 0.87, -0.25],
            [side * 0.92, 0.87, 1.3],
            [side * 1.04, 0.5, 1.48],
          ],
          black,
        );
        part(0.14, 0.04, 0.75, black, side * 1.025, 0.89, 0.5);
        const lamp = part(0.56, 0.045, 0.19, led, side * 0.65, 0.68, -2.37);
        lamp.rotation.y = side * 0.22;
        part(0.15, 0.14, 0.32, amber, side * 1.12, 1.02, -0.2);
        part(0.66, 0.07, 0.04, tail, side * 0.6, 0.76, 2.45);
      }
      for (let j = 0; j < 7; j++)
        part(1.15, 0.025, 0.07, black, 0, 0.98, 1.1 + j * 0.12);
      part(1.8, 0.05, 0.36, black, 0, 0.49, -2.51);
      part(1.8, 0.07, 0.27, black, 0, 0.43, 2.44);
      wheels(1.48, 0.35, 0.99, 1);
    }
    g.position.set(x, 0, z);
    g.rotation.y = yaw;
    world.add(g);
    const names = {
      cyber: "Cybertruck / burgundy lower body, white upper body",
      silverado: "2026 Chevrolet Silverado / black",
      lambo: "Lamborghini / amber",
    };
    const pickBox = new T.Mesh(
      new T.BoxGeometry(2.7, 2.4, 6.2),
      new T.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    pickBox.position.y = 1.1;
    g.add(pickBox);
    hit(pickBox, names[kind], () => getWorld()?.cityView("cars"));
    twin(names[kind], () => {
      go(3);
      getWorld()?.cityView("cars");
    });
    return g;
  }
  // A continuous paved service apron connects the parked lineup to the street.
  box(17, 0.12, 14, asphalt, -12.5, -0.04, -15);
  box(8, 0.1, 4, asphalt, -3.5, -0.035, -10);
  for (let i = 0; i < 4; i++)
    box(0.06, 0.015, 7, mat("#b5bcb2"), -19.6 + i * 4.6, 0.035, -15.5);
  customVehicle("cyber", -17.2, -15.5, 0.12);
  customVehicle("silverado", -12.6, -15.5, 0.12);
  customVehicle("lambo", -8, -15.5, 0.12);
  const lotLight = new T.PointLight("#ffe5ce", 45, 21, 2);
  lotLight.position.set(-12.5, 6, -14);
  scene.add(lotLight);
  car(-2.2, -59, "#b4aa90");
  car(15.6, -74, "#42594b", true);

  // Archive years hang over the street on continuous catenary cables, with short vertical hangers.
  const yearRows = archiveYearRows;
  for (let row = 0; row < yearRows.length; row++) {
    const z = yearRows[row],
      y = 6.2;
    for (const x of [-5.5, 18.8]) {
      box(0.08, y, 0.08, dark, x, y / 2, z);
      box(0.18, 0.12, 0.18, concrete, x, y, z);
    }
    const curve = new T.QuadraticBezierCurve3(
      new T.Vector3(-5.5, y, z),
      new T.Vector3(6.65, y - 1.35, z),
      new T.Vector3(18.8, y, z),
    );
    world.add(
      new T.Line(
        new T.BufferGeometry().setFromPoints(curve.getPoints(32)),
        new T.LineBasicMaterial({ color: "#7d8989" }),
      ),
    );
    for (let j = 0; j < 6; j++) {
      const year = 1980 + row * 6 + j;
      if (year > today.getFullYear()) break;
      const u = (j + 0.5) / 6,
        pt = curve.getPoint(u),
        sign = label(
          String(year),
          1.55,
          0.72,
          pt.x,
          pt.y - 0.58,
          z,
          "#eee1bc",
          row % 2 ? "#335c51" : "#314b54",
          120,
        );
      for (const dx of [-0.51, 0.51])
        beam(
          new T.Vector3(pt.x + dx, pt.y, z),
          new T.Vector3(pt.x + dx, pt.y - 0.3, z),
          0.014,
          dark,
        );
      sign.userData.archiveYear = year;
      sign.name = "archive-year-" + year;
      hit(sign, "Houston / " + year, () => timeline(year));
    }
  }

  world.children
    .slice(exteriorStart)
    .forEach((object) => object.traverse((child) => child.layers.set(3)));
  return { doorPivot, streetSky, asphalt, concrete, streetGlow, glowMat, beam };
}
