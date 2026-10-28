// Original ABN spaces informed by real broadcast and large-format recording rooms.
// References and the translated design decisions are documented in review/STUDIO-REFERENCES.md.
export function buildBroadcastRooms({
  T,
  world,
  box,
  mat,
  label,
  hit,
  twin,
  store,
}) {
  const floorY = 8.35;
  const oak = mat("#815a36"),
    walnut = mat("#492e22"),
    fabric = mat("#353b42"),
    charcoal = mat("#141a22"),
    metal = mat("#555c64", { metalness: 0.65, roughness: 0.35 }),
    leather = mat("#24282b", { roughness: 0.6 }),
    ivory = mat("#d8d3c3"),
    amber = mat("#edb86e", { emissive: "#edb86e", emissiveIntensity: 0.8 }),
    blue = mat("#247cba", { emissive: "#247cba", emissiveIntensity: 0.7 });
  const emissive = (color) =>
    mat(color, { emissive: color, emissiveIntensity: 0.65 });
  const add = (geometry, material, x, y, z) => {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    world.add(mesh);
    return mesh;
  };
  function rod(a, b, radius = 0.025, material = metal) {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b),
      delta = end.clone().sub(start);
    const mesh = add(
      new T.CylinderGeometry(radius, radius, delta.length(), 8),
      material,
      ...start.clone().add(end).multiplyScalar(0.5).toArray(),
    );
    mesh.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return mesh;
  }
  function screen(w, h, x, y, z, draw) {
    const c = document.createElement("canvas");
    c.width = 1536;
    c.height = Math.round((1536 * h) / w);
    const ctx = c.getContext("2d");
    draw(ctx, c.width, c.height);
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    const mesh = add(
      new T.PlaneGeometry(w, h),
      new T.MeshBasicMaterial({ map: texture, toneMapped: false }),
      x,
      y,
      z,
    );
    box(w + 0.12, h + 0.12, 0.12, charcoal, x, y, z - 0.07);
    return mesh;
  }
  function text(ctx, string, x, y, size, color = "#e7edf0", align = "left") {
    ctx.fillStyle = color;
    ctx.font = `700 ${size}px Arial`;
    ctx.textAlign = align;
    ctx.fillText(string, x, y);
  }
  function light(x, z, tint) {
    const lamp = new T.PointLight(tint, 28, 15, 2);
    lamp.position.set(x, 12.9, z);
    world.add(lamp);
    box(2.5, 0.08, 0.5, ivory, x, 13.2, z);
    box(2.3, 0.04, 0.42, emissive(tint), x, 13.14, z);
  }
  function shell(x, radio) {
    box(15, 0.3, 12, walnut, x, 8.2, 0);
    for (let i = 0; i < 22; i++)
      box(15, 0.008, 0.018, oak, x, floorY + 0.008, -5.7 + i * 0.53);
    box(15, 5.5, 0.22, radio ? mat("#666b70") : mat("#8c7359"), x, 11.1, -6);
    for (const side of [-1, 1]) {
      const sx = x + side * 7.5;
      // The corridor and elevator openings retain physical doorway clearance.
      if ((x === 0 && side === 1) || (x === 20 && side === -1)) {
        box(0.22, 5.5, 8, fabric, sx, 11.1, -2);
        box(0.22, 5.5, 1.5, fabric, sx, 11.1, 5.25);
        box(0.22, 2, 2.5, fabric, sx, 12.85, 3.25);
      } else if (x === 0 && side === -1) {
        box(0.22, 5.5, 4.3, fabric, sx, 11.1, -3.85);
        box(0.22, 5.5, 5.1, fabric, sx, 11.1, 3.45);
        box(0.22, 2.1, 2.6, fabric, sx, 12.8, -0.4);
      } else box(0.22, 5.5, 12, fabric, sx, 11.1, 0);
      box(0.16, 0.16, 11.8, walnut, sx - side * 0.15, floorY + 0.13, 0);
      for (const z of [-4.6, -2.9, -1.2, 0.5]) {
        box(0.18, 2.4, 1.2, charcoal, sx - side * 0.15, 11, z);
        for (let i = 0; i < 5; i++)
          box(
            0.12,
            2.35,
            0.055,
            oak,
            sx - side * 0.27,
            11,
            z - 0.46 + i * 0.23,
          );
      }
    }
    // Floating ceiling clouds leave the camera-side cutaway open.
    for (const z of [-3.8, -0.5, 2.8])
      box(10, 0.15, 1.65, charcoal, x, 13.65, z);
    light(x - 3, -2.3, radio ? "#e0ecff" : "#ffd7a2");
    light(x + 3, 1.8, "#e7e5dc");
    box(14.7, 0.035, 0.035, radio ? blue : amber, x, 12.8, -5.78);
  }
  function chair(x, z, rotation = 0) {
    const start = world.children.length;
    add(new T.CylinderGeometry(0.4, 0.38, 0.12, 20), leather, 0, 0.53, 0);
    const back = box(0.75, 0.78, 0.16, leather, 0, 1.05, -0.32);
    back.rotation.x = -0.12;
    rod([0, 0.12, 0], [0, 0.48, 0], 0.065);
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      rod([0, 0.14, 0], [Math.cos(a) * 0.4, 0.09, Math.sin(a) * 0.4], 0.035);
      add(
        new T.SphereGeometry(0.065, 8, 6),
        charcoal,
        Math.cos(a) * 0.4,
        0.065,
        Math.sin(a) * 0.4,
      );
    }
    for (const s of [-1, 1]) {
      rod([s * 0.4, 0.58, 0], [s * 0.4, 0.85, 0], 0.025);
      box(0.1, 0.06, 0.45, leather, s * 0.4, 0.87, -0.03);
    }
    const group = new T.Group();
    world.children.slice(start).forEach((o) => group.add(o));
    group.position.set(x, floorY, z);
    group.rotation.y = rotation;
    world.add(group);
  }
  function speaker(x, y, z, large = false) {
    const w = large ? 1.5 : 0.65,
      h = large ? 2.6 : 1,
      depth = large ? 0.65 : 0.48;
    box(w, h, depth, large ? walnut : charcoal, x, y, z);
    for (const offset of large ? [-0.78, 0.1, 0.85] : [-0.22, 0.25]) {
      const r = large
        ? offset === 0.1
          ? 0.16
          : 0.39
        : offset < 0
          ? 0.2
          : 0.085;
      const rim = add(
        new T.CylinderGeometry(r, r, 0.06, 24),
        metal,
        x,
        y + offset,
        z + depth / 2 + 0.035,
      );
      rim.rotation.x = Math.PI / 2;
      const cone = add(
        new T.CylinderGeometry(r * 0.83, r * 0.68, 0.07, 24),
        charcoal,
        x,
        y + offset,
        z + depth / 2 + 0.075,
      );
      cone.rotation.x = Math.PI / 2;
      const dome = add(
        new T.SphereGeometry(r * 0.29, 12, 8),
        leather,
        x,
        y + offset,
        z + depth / 2 + 0.11,
      );
      dome.scale.z = 0.35;
    }
  }
  function mic(x, z, flip = 1) {
    const y = floorY + 0.94;
    box(0.16, 0.1, 0.16, metal, x, y, z);
    rod([x, y, z], [x + 0.35 * flip, y + 0.65, z - 0.12], 0.035, charcoal);
    rod(
      [x + 0.35 * flip, y + 0.65, z - 0.12],
      [x + 0.76 * flip, y + 0.54, z + 0.12],
      0.035,
      charcoal,
    );
    rod(
      [x + 0.03, y + 0.02, z + 0.025],
      [x + 0.39 * flip, y + 0.66, z - 0.1],
      0.013,
    );
    const body = add(
      new T.CylinderGeometry(0.085, 0.085, 0.35, 16),
      charcoal,
      x + 0.8 * flip,
      y + 0.48,
      z + 0.16,
    );
    body.rotation.z = 0.8 * flip;
    box(0.23, 0.18, 0.2, ivory, x + 0.77 * flip, y + 0.38, z + 0.18);
    label(
      "WABN",
      0.2,
      0.1,
      x + 0.77 * flip,
      y + 0.39,
      z + 0.285,
      "#243141",
      "#e9e4d9",
      38,
    );
    const curve = new T.CatmullRomCurve3([
      new T.Vector3(x + 0.8 * flip, y + 0.28, z + 0.16),
      new T.Vector3(x + 0.6 * flip, y + 0.02, z + 0.1),
      new T.Vector3(x, y - 0.2, z),
    ]);
    add(new T.TubeGeometry(curve, 12, 0.012, 5, false), charcoal, 0, 0, 0);
  }
  function consoleTexture(ctx, w, h, radio = false) {
    ctx.fillStyle = radio ? "#273540" : "#5f6668";
    ctx.fillRect(0, 0, w, h);
    const channels = radio ? 12 : 48,
      channelW = (w * 0.79) / channels;
    for (let i = 0; i < channels; i++) {
      const x = 14 + i * channelW;
      ctx.fillStyle = i % 8 === 0 ? "#20272b" : "#41494c";
      ctx.fillRect(x, 8, channelW - 2, h - 16);
      for (let r = 0; r < 6; r++) {
        ctx.fillStyle = ["#b6b6aa", "#4479a0", "#9a4d4b", "#4a917f"][r % 4];
        ctx.beginPath();
        ctx.arc(
          x + channelW * 0.48,
          h * 0.13 + r * h * 0.072,
          Math.max(2, channelW * 0.15),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#10171c";
      ctx.fillRect(
        x + channelW * 0.42,
        h * 0.61,
        Math.max(2, channelW * 0.13),
        h * 0.29,
      );
      ctx.fillStyle = ivory.color.getStyle();
      ctx.fillRect(
        x + channelW * 0.16,
        h * (0.65 + (i % 5) * 0.04),
        channelW * 0.67,
        h * 0.035,
      );
      ctx.fillStyle = ["#5fc493", "#d9b35f", "#d86655"][i % 3];
      ctx.fillRect(x + 3, h * 0.05, channelW - 7, h * 0.025);
    }
    ctx.fillStyle = "#18242a";
    ctx.fillRect(w * 0.82, 15, w * 0.16, h * 0.37);
    text(
      ctx,
      radio ? "WABN" : "STUDIO ABN",
      w * 0.9,
      h * 0.12,
      Math.max(12, w * 0.012),
      "#bdced3",
      "center",
    );
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = "#10191c";
      ctx.fillRect(w * (0.84 + i * 0.016), h * 0.17, w * 0.009, h * 0.14);
      ctx.fillStyle = "#57c893";
      ctx.fillRect(
        w * (0.84 + i * 0.016),
        h * (0.2 + (i % 3) * 0.02),
        w * 0.009,
        h * (0.1 - (i % 3) * 0.02),
      );
    }
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = "#b8bdb4";
      ctx.beginPath();
      ctx.arc(
        w * (0.85 + (i % 2) * 0.07),
        h * (0.51 + Math.floor(i / 2) * 0.23),
        w * 0.018,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  function deskSurface(w, d, x, y, z, radio = false) {
    const panel = screen(w, d, x, y, z, (ctx, cw, ch) =>
      consoleTexture(ctx, cw, ch, radio),
    );
    // screen() creates a vertical backing; keep only the textured plane for this horizontal panel.
    const backing = world.children.at(-1);
    world.remove(backing);
    backing.geometry.dispose();
    panel.rotation.x = -Math.PI / 2;
    return panel;
  }
  shell(0, true);
  // Wide interview desk, five seated positions, and no equipment floating above the tabletop.
  const shape = new T.Shape();
  shape.moveTo(-3.8, -1.5);
  shape.quadraticCurveTo(-4.3, -1.5, -4.3, -0.8);
  shape.lineTo(-4.3, 1.1);
  shape.quadraticCurveTo(-4.3, 1.7, -3.5, 1.7);
  shape.lineTo(3.5, 1.7);
  shape.quadraticCurveTo(4.3, 1.7, 4.3, 1.1);
  shape.lineTo(4.3, -0.8);
  shape.quadraticCurveTo(4.3, -1.5, 3.8, -1.5);
  shape.closePath();
  const table = add(
    new T.ExtrudeGeometry(shape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSize: 0.06,
      bevelThickness: 0.035,
      bevelSegments: 3,
      steps: 1,
    }),
    charcoal,
    0,
    floorY + 0.84,
    -1.1,
  );
  table.rotation.x = -Math.PI / 2;
  table.scale.set(0.67, 0.67, 1);
  for (const x of [-1.95, 1.95]) {
    box(0.22, 0.82, 1.1, metal, x, floorY + 0.41, -1.1);
    box(1.1, 0.08, 1.5, charcoal, x, floorY + 0.04, -1.1);
  }
  for (const [x, z, rotation] of [
    [-1.75, -3, 0],
    [0, -3, 0],
    [1.75, -3, 0],
    [-1.65, 0.85, Math.PI],
    [1.65, 0.85, Math.PI],
  ])
    chair(x, z, rotation);
  for (const [x, z, flip] of [
    [-2.1, -1.8, 1],
    [-0.7, -1.8, 1],
    [1.2, -1.8, 1],
    [-2.1, -0.35, 1],
    [1.5, -0.35, -1],
  ])
    mic(x, z, flip);
  deskSurface(1.2, 0.65, -1.4, floorY + 0.99, -0.75, true);
  const radioScreen = screen(6.8, 2.1, 0, 11.5, -5.78, (ctx, w, h) => {
    ctx.fillStyle = "#102b43";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#163852";
    for (let i = 0; i < 28; i++) ctx.fillRect(i * 60, 0, 2, h);
    text(ctx, "WABN", w / 2, h * 0.55, h * 0.47, "#f5ede0", "center");
    text(
      ctx,
      "RADIO  /  THE VOICE OF THE STREETS",
      w / 2,
      h * 0.79,
      h * 0.065,
      "#73caec",
      "center",
    );
  });
  hit(radioScreen, "Open WABN Radio playlists", () => store.navigate("radio"));
  hit(table, "Listen to WABN Radio", () => store.navigate("radio"));
  twin("Open WABN Radio playlists", () => store.navigate("radio"));
  label("ON AIR", 1.05, 0.28, 0, 13.05, -5.76, "#ffb6ab", "#5d171b", 60);
  for (const x of [-5.25, 5.25]) {
    box(2.25, 3.65, 0.32, charcoal, x, 10.55, -5.6);
    for (const y of [9.1, 10.15, 11.15, 12.15])
      box(2.15, 0.08, 0.7, walnut, x, y, -5.25);
    for (let i = 0; i < 7; i++)
      box(
        0.12,
        0.52,
        0.28,
        mat(["#bb6f39", "#868d91", "#c3b28e", "#3b7296"][i % 4]),
        x - 0.8 + i * 0.24,
        10.44,
        -5.26,
      );
    speaker(x, 11.65, -5.15);
  }
  for (const [x, z] of [
    [-1, -1],
    [1.1, -0.8],
  ]) {
    const monitor = screen(0.82, 0.53, x, floorY + 1.24, z, (ctx, w, h) => {
      ctx.fillStyle = "#0b1c29";
      ctx.fillRect(0, 0, w, h);
      text(ctx, "WABN / PLAYOUT", w * 0.06, h * 0.2, h * 0.09);
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = i === 1 ? "#3c8db5" : "#243b48";
        ctx.fillRect(w * 0.05, h * (0.3 + i * 0.1), w * 0.9, h * 0.07);
      }
    });
    monitor.rotation.y = x < 0 ? 0.2 : -0.2;
    rod([x, floorY + 0.96, z], [x, floorY + 1.05, z], 0.045);
  }
  // Boom-mounted camera and soft light are above seated head height.
  rod([-6, 12.9, -1], [-4.5, 12.9, -1], 0.035);
  box(0.5, 0.32, 0.35, charcoal, -4.4, 12.85, -1);
  add(
    new T.CylinderGeometry(0.11, 0.11, 0.18, 16),
    metal,
    -4.4,
    12.85,
    -0.73,
  ).rotation.x = Math.PI / 2;
  // Studio ABN: console-centered control room with an actual glazed vocal booth behind it.
  shell(20, false);
  for (const x of [14, 26]) {
    box(2.2, 4.35, 0.35, oak, x, 10.7, -5.65);
    for (let i = 0; i < 9; i++)
      box(0.09, 4.1, 0.15, walnut, x - 0.9 + i * 0.225, 10.7, -5.4);
  }
  const boothWall = mat("#675d53");
  box(8.3, 1.05, 0.2, boothWall, 20, 8.87, -3.95);
  box(8.3, 1.2, 0.2, boothWall, 20, 13.25, -3.95);
  for (const x of [16.05, 23.95]) box(0.4, 3.5, 0.2, walnut, x, 11.05, -3.95);
  for (const y of [9.45, 12.65]) box(7.5, 0.13, 0.32, metal, 20, y, -3.88);
  const glass = box(
    7.4,
    3.05,
    0.035,
    mat("#afced5", {
      transparent: true,
      opacity: 0.22,
      roughness: 0.12,
      metalness: 0.2,
      depthWrite: false,
    }),
    20,
    11.05,
    -3.9,
  );
  glass.castShadow = false;
  const glareMaterial = new T.MeshBasicMaterial({
    color: "#dbeff4",
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });
  for (const x of [17.1, 17.35]) {
    const glare = add(
      new T.PlaneGeometry(0.055, 2.8),
      glareMaterial,
      x,
      11.05,
      -3.865,
    );
    glare.rotation.z = -0.28;
  }
  box(5, 0.012, 1.3, charcoal, 20, floorY + 0.012, -5.15);
  for (let i = 0; i < 9; i++)
    box(0.52, 2.5, 0.1, fabric, 16.8 + i * 0.8, 10.5, -5.75);
  rod([22.1, floorY, -5.1], [22.1, 10.1, -5.1], 0.035);
  for (const d of [-0.38, 0.38])
    rod([22.1, 8.47, -5.1], [22.1 + d, floorY + 0.02, -5.1 + 0.25], 0.025);
  add(new T.CylinderGeometry(0.1, 0.1, 0.42, 16), metal, 22.1, 10.25, -5.1);
  const filter = add(
    new T.CylinderGeometry(0.23, 0.23, 0.025, 24),
    charcoal,
    22.1,
    10.22,
    -4.83,
  );
  filter.rotation.x = Math.PI / 2;
  rod([22.1, 9.8, -5.1], [22.1, 10.22, -4.83], 0.018);
  label("STUDIO ABN", 2.1, 0.34, 20, 13.25, -3.78, "#efdebb", "#4e3a29", 64);
  label("RECORDING", 1.2, 0.22, 23.1, 12.93, -3.76, "#edb4ab", "#542c26", 45);
  const consoleStart = world.children.length;
  box(9.8, 0.28, 2.8, walnut, 20, 9.1, 0.1);
  box(9.4, 0.6, 2.55, charcoal, 20, 8.72, 0.1);
  const ssl = deskSurface(9.3, 2.5, 20, 9.27, 0.1);
  // Physical controls use instancing so detail does not become hundreds of draw calls.
  const faders = new T.InstancedMesh(
    new T.BoxGeometry(0.085, 0.035, 0.07),
    ivory,
    48,
  );
  const knobs = new T.InstancedMesh(
    new T.CylinderGeometry(0.022, 0.025, 0.04, 8),
    metal,
    288,
  );
  const matrix = new T.Matrix4();
  for (let channel = 0; channel < 48; channel++) {
    const x =
      20 -
      9.3 / 2 +
      ((14 + channel * ((1536 * 0.79) / 48) + ((1536 * 0.79) / 48) * 0.48) /
        1536) *
        9.3;
    matrix.makeTranslation(
      x,
      9.31,
      0.1 - 1.25 + (0.65 + (channel % 5) * 0.04) * 2.5,
    );
    faders.setMatrixAt(channel, matrix);
    for (let row = 0; row < 6; row++) {
      matrix.makeTranslation(x, 9.31, 0.1 - 1.25 + (0.13 + row * 0.072) * 2.5);
      knobs.setMatrixAt(channel * 6 + row, matrix);
    }
  }
  world.add(faders, knobs);
  hit(ssl, "Explore Studio ABN", () => store.navigate("studio"));
  twin("Explore Studio ABN", () => store.navigate("studio"));
  box(9.6, 0.25, 0.55, charcoal, 20, 9.48, -1.15);
  // A single detailed meter bridge texture replaces hundreds of tiny individual meter meshes.
  screen(8.9, 0.4, 20, 9.53, -0.85, (ctx, w, h) => {
    ctx.fillStyle = "#14211c";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 48; i++) {
      const x = 12 + (i * (w - 24)) / 48;
      ctx.fillStyle = "#1d3830";
      ctx.fillRect(x, 10, 20, h - 20);
      ctx.fillStyle = i % 7 === 0 ? "#d3be60" : "#61b689";
      ctx.fillRect(
        x,
        h * (0.2 + (i % 5) * 0.1),
        15,
        h * (0.65 - (i % 5) * 0.1),
      );
    }
  });
  screen(2.4, 1.15, 20, 10.28, -1.4, (ctx, w, h) => {
    ctx.fillStyle = "#17212b";
    ctx.fillRect(0, 0, w, h);
    text(ctx, "ABN / SESSION 001", 30, 40, 22);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = ["#428b86", "#4776a0", "#9871ac"][i % 3];
      ctx.fillRect(w * 0.12, h * (0.16 + i * 0.077), w * 0.83, h * 0.057);
      ctx.strokeStyle = "#bbd2ce";
      ctx.beginPath();
      for (let j = 0; j < 100; j++) {
        const x = w * (0.14 + j * 0.0078),
          y = h * (0.187 + i * 0.077) + Math.sin(j * 3 + i) * h * 0.018;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  });
  const consoleGroup = new T.Group();
  for (const object of world.children.slice(consoleStart)) {
    object.position.x -= 20;
    consoleGroup.add(object);
  }
  consoleGroup.position.x = 20;
  consoleGroup.scale.set(0.7, 1, 0.82);
  world.add(consoleGroup);
  for (const x of [14.6, 25.4]) speaker(x, 11, -4.5, true);
  for (const x of [16.85, 23.15]) {
    box(0.12, 0.6, 0.12, metal, x, 9.6, -1.3);
    speaker(x, 10, -1.3);
  }
  chair(20, 2.4, Math.PI);
  rod([20, 9.45, -1.4], [20, 9.8, -1.4], 0.05);
  for (const x of [14.3, 25.7]) {
    box(1.35, 1.3, 1.5, walnut, x, 9.0, 1.4);
    screen(1.16, 1.06, x, 9.02, 2.17, (ctx, w, h) => {
      ctx.fillStyle = "#171e22";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 7; i++) {
        const y = 8 + (i * h) / 7;
        ctx.fillStyle = i % 2 ? "#424a4f" : "#252e35";
        ctx.fillRect(8, y, w - 16, h / 7 - 5);
        for (let j = 0; j < 5; j++) {
          ctx.fillStyle = j === 0 ? "#ddb06b" : "#9da9a7";
          ctx.beginPath();
          ctx.arc(45 + j * w * 0.19, y + h * 0.055, h * 0.018, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#68d39d";
        ctx.fillRect(w * 0.82, y + 15, w * 0.1, h * 0.028);
      }
    });
  }
  // Rear lounge remains outside the central engineer-to-console path.
  box(3.2, 0.55, 1.1, leather, 24.5, 8.7, 4.65);
  box(3.2, 0.65, 0.22, leather, 24.5, 9.2, 5.1);
  for (const x of [22.95, 26.05]) box(0.2, 0.85, 1.15, leather, x, 8.95, 4.65);
  box(1.2, 0.08, 0.7, walnut, 24.5, 8.83, 3.55);
  // Connected corridor stays clear between both rooms.
  box(5, 0.3, 2.5, walnut, 10, 8.2, 3.25);
  box(5, 4, 0.2, fabric, 10, 10.3, 2);
  box(5, 4, 0.2, fabric, 10, 10.3, 4.5);
  return { floorY, radioScreen, console: ssl };
}
