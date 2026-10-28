import { $, $$, esc } from "../../core/dom.js";
export function buildTransco({ world, rand, T, renderer, mat, box }) {
  const transcoStart = world.children.length;
  const transcoX = -45,
    transcoZ = -91;
  // The reference tower has dense silver mullions, blue glass and a few warm offices.
  // Its narrow vertical recesses continue through the setbacks; the crown is a low hipped roof.
  const tcCanvas = document.createElement("canvas"),
    tcEmission = document.createElement("canvas");
  tcCanvas.width = tcEmission.width = 1024;
  tcCanvas.height = tcEmission.height = 2048;
  const tc = tcCanvas.getContext("2d"),
    te = tcEmission.getContext("2d"),
    tcGradient = tc.createLinearGradient(0, 0, 1024, 1900);
  tcGradient.addColorStop(0, "#456b7c");
  tcGradient.addColorStop(0.35, "#345666");
  tcGradient.addColorStop(0.65, "#203f4d");
  tcGradient.addColorStop(1, "#132f3b");
  tc.fillStyle = tcGradient;
  tc.fillRect(0, 0, 1024, 2048);
  te.fillStyle = "#000";
  te.fillRect(0, 0, 1024, 2048);
  for (let row = 0; row < 64; row++)
    for (let col = 0; col < 28; col++) {
      const x = (col * 1024) / 28,
        y = row * 32;
      tc.fillStyle = (col + row) % 7 === 0 ? "#7897a0" : "#426775";
      tc.globalAlpha = 0.25;
      tc.fillRect(x + 3, y + 2, 31, 27);
      if (rand() > 0.965) {
        te.fillStyle = "#f7d8a1";
        te.fillRect(x + 4, y + 4, 28, 23);
      }
    }
  tc.globalAlpha = 1;
  tc.strokeStyle = "#a6b8bb";
  tc.lineWidth = 2.5;
  for (let col = 0; col <= 28; col++) {
    const x = (col * 1024) / 28;
    tc.beginPath();
    tc.moveTo(x, 0);
    tc.lineTo(x, 2048);
    tc.stroke();
  }
  tc.strokeStyle = "#8fa8b2";
  tc.lineWidth = 1.5;
  for (let row = 0; row <= 64; row++) {
    tc.beginPath();
    tc.moveTo(0, row * 32);
    tc.lineTo(1024, row * 32);
    tc.stroke();
  }
  te.globalCompositeOperation = "screen";
  te.globalAlpha = 0.65;
  te.drawImage(tcCanvas, 0, 0);
  te.globalAlpha = 1;
  te.globalCompositeOperation = "source-over";
  const tcMap = new T.CanvasTexture(tcCanvas),
    tcEmit = new T.CanvasTexture(tcEmission);
  for (const t of [tcMap, tcEmit]) {
    t.colorSpace = T.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  const tcSkin = mat("#dae5e9", {
      map: tcMap,
      emissiveMap: tcEmit,
      emissive: "#9cb9cb",
      emissiveIntensity: 0.24,
      metalness: 0.32,
      roughness: 0.38,
    }),
    tcRecess = mat("#143039", { metalness: 0.45, roughness: 0.35 }),
    tcTrim = mat("#97adb5", { metalness: 0.5, roughness: 0.35 });
  box(10, 0.55, 9, tcTrim, transcoX, 0.3, transcoZ);
  box(7.8, 39.5, 6.9, tcSkin, transcoX, 20.3, transcoZ);
  box(6.85, 43.1, 6.1, tcSkin, transcoX, 22.1, transcoZ);
  box(5.75, 47.1, 5.2, tcSkin, transcoX, 24.1, transcoZ);
  box(4.85, 48.8, 4.5, tcSkin, transcoX, 24.95, transcoZ);
  // Recessed dark slots establish the tower's recognisable narrow fluted silhouette.
  for (const side of [-1, 1])
    for (const [bottom, top, width, depth] of [
      [0.8, 40.05, 7.8, 6.9],
      [40.05, 43.65, 6.85, 6.1],
      [43.65, 47.65, 5.75, 5.2],
      [47.65, 49.35, 4.85, 4.5],
    ]) {
      for (const [dx, limit] of [
        [-2.95, 37.8],
        [-2.3, 42],
        [-1.65, 47.6],
        [-0.98, 48.4],
        [0, 48.4],
        [0.98, 48.4],
        [1.65, 47.6],
        [2.3, 42],
        [2.95, 37.8],
      ]) {
        const end = Math.min(top, limit),
          h = end - bottom;
        if (h <= 0 || Math.abs(dx) > width / 2 - 0.2) continue;
        box(
          0.2,
          h,
          0.045,
          tcRecess,
          transcoX + dx,
          bottom + h / 2,
          transcoZ + side * (depth / 2 + 0.035),
        );
        box(
          0.04,
          h,
          0.055,
          tcTrim,
          transcoX + dx + 0.14,
          bottom + h / 2,
          transcoZ + side * (depth / 2 + 0.045),
        );
      }
      for (const [dz, limit] of [
        [-2.45, 37.8],
        [-1.7, 42],
        [-0.9, 47.6],
        [0, 48.4],
        [0.9, 47.6],
        [1.7, 42],
        [2.45, 37.8],
      ]) {
        const end = Math.min(top, limit),
          h = end - bottom;
        if (h <= 0 || Math.abs(dz) > depth / 2 - 0.2) continue;
        box(
          0.045,
          h,
          0.2,
          tcRecess,
          transcoX + side * (width / 2 + 0.035),
          bottom + h / 2,
          transcoZ + dz,
        );
        box(
          0.055,
          h,
          0.04,
          tcTrim,
          transcoX + side * (width / 2 + 0.045),
          bottom + h / 2,
          transcoZ + dz + 0.14,
        );
      }
    }
  // Dark beacon lantern and a shallow four-sided crown, rather than stacked cone tiers.
  box(4.25, 1.05, 3.95, tcTrim, transcoX, 49.85, transcoZ);
  for (const side of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      box(
        0.68,
        0.6,
        0.045,
        tcRecess,
        transcoX - 1.43 + j * 0.95,
        49.9,
        transcoZ + side * 2.0,
      );
      box(
        0.045,
        0.6,
        0.62,
        tcRecess,
        transcoX + side * 2.15,
        49.9,
        transcoZ - 1.28 + j * 0.85,
      );
    }
  }
  const tcRoof = new T.Mesh(
    new T.ConeGeometry(3.13, 0.95, 4),
    mat("#7b8e96", { metalness: 0.36, roughness: 0.5 }),
  );
  tcRoof.rotation.y = Math.PI / 4;
  tcRoof.scale.z = 0.94;
  tcRoof.position.set(transcoX, 50.85, transcoZ);
  world.add(tcRoof);
  box(0.045, 0.3, 0.045, tcTrim, transcoX, 51.45, transcoZ);
  const beacon = new T.Mesh(
    new T.SphereGeometry(0.08, 8, 6),
    new T.MeshBasicMaterial({ color: "#e8e2b8" }),
  );
  beacon.position.set(transcoX, 51.62, transcoZ);
  world.add(beacon);
  // Stone entry pavilion and podium give the tower a grounded base at street level.
  box(10.8, 0.16, 9.5, mat("#a5aca6"), transcoX, 0.02, transcoZ);
  for (const side of [-1, 1]) {
    box(4, 0.16, 1.8, tcTrim, transcoX, 0.8, transcoZ + side * 4.2);
    for (let j = 0; j < 6; j++)
      box(
        0.55,
        0.65,
        0.05,
        tcRecess,
        transcoX - 1.65 + j * 0.66,
        0.65,
        transcoZ + side * 3.53,
      );
    for (const dx of [-2, 2])
      box(0.11, 0.8, 0.11, tcTrim, transcoX + dx, 0.4, transcoZ + side * 4.4);
  }

  const transcoDistrict = new T.Group();
  world.children.slice(transcoStart).forEach((o) => transcoDistrict.add(o));
  world.add(transcoDistrict);
  transcoDistrict.position.set(-250, 0, -276);
  transcoDistrict.scale.z = -1;
  // Architectural materials are drawn locally; reference photographs guide geometry, not pasted billboard facades.

  return {};
}
