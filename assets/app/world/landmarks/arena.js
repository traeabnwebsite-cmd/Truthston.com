import { $, $$, esc } from "../../core/dom.js";
export function buildArena({
  world,
  mat,
  box,
  concrete,
  venueGlass,
  limestone,
  T,
  canvas,
  label,
  renderer,
  loadVenueMark,
}) {
  const arenaStart = world.children.length;
  // Toyota Center: broad limestone podium, red steel/glass corner atrium and flat silver elliptical roof.
  const arenaX = 34,
    arenaZ = -32,
    arenaStone = mat("#baad94"),
    arenaRed = mat("#9e4b3f"),
    arenaMetal = mat("#aeb6b7", { metalness: 0.5, roughness: 0.5 });
  box(27, 0.15, 25, concrete, arenaX, 0.02, arenaZ);
  box(24, 0.38, 20, arenaStone, arenaX, 0.22, arenaZ);
  for (const side of [-1, 1]) {
    box(24, 4.5, 0.45, arenaStone, arenaX, 2.25, arenaZ + side * 9.8);
    box(0.45, 4.5, 20, arenaStone, arenaX + side * 11.8, 2.25, arenaZ);
  }
  for (const side of [-1, 1]) {
    box(24, 0.3, 0.18, arenaRed, arenaX, 1.1, arenaZ + side * 10.05);
    box(24, 0.22, 0.18, arenaRed, arenaX, 3.8, arenaZ + side * 10.05);
    for (let j = 0; j < 14; j++)
      box(
        0.7,
        0.9,
        0.045,
        venueGlass,
        arenaX - 10.6 + j * 1.63,
        3.1,
        arenaZ + side * 10.17,
      );
  }
  // Recessed, glowing main entrance wraps around the front-west corner in the supplied aerial.
  box(14, 2.65, 0.22, venueGlass, arenaX - 3, 1.55, arenaZ + 10.2);
  box(0.22, 2.65, 8, venueGlass, arenaX - 12.2, 1.55, arenaZ + 5.9);
  for (let j = 0; j < 17; j++)
    box(
      0.07,
      2.75,
      0.28,
      arenaRed,
      arenaX - 9.8 + j * 0.82,
      1.55,
      arenaZ + 10.32,
    );
  for (let j = 0; j < 9; j++)
    box(0.28, 2.75, 0.07, arenaRed, arenaX - 12.32, 1.55, arenaZ + 2 + j * 0.9);
  for (const y of [0.55, 1.55, 2.75]) {
    box(14, 0.09, 0.28, arenaRed, arenaX - 3, y, arenaZ + 10.33);
    box(0.28, 0.09, 8, arenaRed, arenaX - 12.33, y, arenaZ + 5.9);
  }
  box(15, 0.15, 2.2, arenaMetal, arenaX - 3, 3.1, arenaZ + 10.6);
  for (const x of [-9, -5, -1, 3]) {
    box(1.5, 1.9, 0.06, venueGlass, arenaX + x, 1.15, arenaZ + 10.47);
    box(0.06, 1.9, 0.09, arenaMetal, arenaX + x, 1.15, arenaZ + 10.52);
    box(0.07, 0.3, 0.06, limestone, arenaX + x + 0.3, 1.1, arenaZ + 10.6);
  }
  // Stadium roof graphic follows the real red roof wordmark and emblem, on its silver metal plane.
  const arenaCanvas = document.createElement("canvas");
  arenaCanvas.width = arenaCanvas.height = 1024;
  const ac = arenaCanvas.getContext("2d");
  ac.fillStyle = "#b9c0bf";
  ac.fillRect(0, 0, 1024, 1024);
  ac.strokeStyle = "#8b9698";
  ac.lineWidth = 1;
  for (let j = 0; j < 80; j++) {
    const a = (j / 80) * Math.PI * 2;
    ac.beginPath();
    ac.moveTo(512, 512);
    ac.lineTo(512 + Math.cos(a) * 720, 512 + Math.sin(a) * 720);
    ac.stroke();
  }
  ac.strokeStyle = "#aa4038";
  ac.lineWidth = 9;
  ac.beginPath();
  ac.ellipse(512, 318, 90, 54, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.beginPath();
  ac.ellipse(512, 318, 30, 54, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.beginPath();
  ac.ellipse(512, 306, 68, 23, 0, 0, Math.PI * 2);
  ac.stroke();
  ac.fillStyle = "#ab4039";
  ac.textAlign = "center";
  ac.font = "600 87px Arial";
  ac.fillText("TOYOTA", 512, 458);
  ac.font = "500 73px Arial";
  ac.fillText("CENTER", 512, 547);
  const arTex = new T.CanvasTexture(arenaCanvas);
  arTex.colorSpace = T.SRGBColorSpace;
  const roofTop = mat("#ffffff", {
    map: arTex,
    metalness: 0.35,
    roughness: 0.58,
  });
  const arenaRoof = new T.Group();
  arenaRoof.name = "Toyota Center complete exterior roof";
  arenaRoof.position.set(arenaX, 5.05, arenaZ);
  world.add(arenaRoof);
  // Solid podium deck closes the corners; the broad oval above it is a shallow curved metal shell.
  const arenaDeck = new T.Mesh(new T.BoxGeometry(24, 0.24, 20), arenaMetal);
  arenaDeck.position.y = -0.43;
  arenaDeck.castShadow = arenaDeck.receiveShadow = true;
  arenaRoof.add(arenaDeck);
  const roofPositions = [],
    roofUvs = [],
    roofIndices = [],
    roofRings = 12,
    roofSegments = 96;
  for (let ring = 0; ring <= roofRings; ring++) {
    const r = ring / roofRings;
    for (let segment = 0; segment <= roofSegments; segment++) {
      const t = (segment / roofSegments) * Math.PI * 2,
        x = Math.cos(t) * 11.6 * r,
        z = Math.sin(t) * 9.2 * r;
      roofPositions.push(x, 0.58 * (1 - r * r), z);
      roofUvs.push(0.5 + x / 23.2, 0.5 - z / 18.4);
    }
  }
  for (let ring = 0; ring < roofRings; ring++)
    for (let segment = 0; segment < roofSegments; segment++) {
      const a = ring * (roofSegments + 1) + segment,
        b = a + roofSegments + 1;
      roofIndices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const roofGeometry = new T.BufferGeometry();
  roofGeometry.setAttribute(
    "position",
    new T.Float32BufferAttribute(roofPositions, 3),
  );
  roofGeometry.setAttribute("uv", new T.Float32BufferAttribute(roofUvs, 2));
  roofGeometry.setIndex(roofIndices);
  roofGeometry.computeVertexNormals();
  roofTop.side = T.DoubleSide;
  const arenaShell = new T.Mesh(roofGeometry, roofTop);
  arenaShell.castShadow = arenaShell.receiveShadow = true;
  arenaRoof.add(arenaShell);
  const arenaFascia = new T.Mesh(
    new T.CylinderGeometry(11.6, 11.6, 0.48, 96, 1, true),
    arenaMetal,
  );
  arenaFascia.scale.z = 9.2 / 11.6;
  arenaFascia.position.y = -0.24;
  arenaRoof.add(arenaFascia);
  const lip = new T.Mesh(new T.TorusGeometry(11.6, 0.085, 8, 96), arenaMetal);
  lip.rotation.x = Math.PI / 2;
  lip.scale.y = 9.2 / 11.6;
  lip.position.y = 0.025;
  arenaRoof.add(lip);
  canvas.dataset.arenaRoof = "closed";

  for (const side of [-1, 1])
    for (let j = 0; j < 5; j++)
      box(
        0.8,
        0.45,
        1.1,
        arenaMetal,
        arenaX + side * 11,
        4.76,
        arenaZ - 7 + j * 3.3,
      );
  label(
    "TOYOTA CENTER",
    10,
    0.7,
    arenaX - 3,
    3.55,
    arenaZ + 10.45,
    "#eee3ce",
    "#8d4236",
    100,
  );
  // Pedestrian plaza, broad front steps, bollards and an attached parking mass on the southeast block.
  for (let j = 0; j < 3; j++)
    box(
      14,
      0.1,
      1.4,
      limestone,
      arenaX - 3,
      0.05 + j * 0.1,
      arenaZ + 11 + j * 0.3,
    );
  for (let j = 0; j < 9; j++)
    box(
      0.08,
      0.55,
      0.08,
      arenaMetal,
      arenaX - 10 + j * 1.8,
      0.3,
      arenaZ + 12.1,
    );

  // Hardwood court and team marks are visible through an architectural cutaway view.
  const courtCanvas = document.createElement("canvas");
  courtCanvas.width = 1536;
  courtCanvas.height = 820;
  const cq = courtCanvas.getContext("2d");
  cq.fillStyle = "#c89960";
  cq.fillRect(0, 0, 1536, 820);
  for (let row = 0; row < 42; row++) {
    cq.fillStyle =
      row % 3 === 0 ? "#d3aa75" : row % 3 === 1 ? "#c99e69" : "#dbb37d";
    cq.fillRect(0, row * 20, 1536, 19);
    cq.strokeStyle = "#a57c4855";
    cq.lineWidth = 1;
    for (let x = (row % 2) * 110; x < 1536; x += 220)
      cq.strokeRect(x, row * 20, 220, 20);
  }
  cq.fillStyle = "#b62032";
  for (const x of [35, 1250]) cq.fillRect(x, 260, 250, 300);
  cq.strokeStyle = "#f6e5bf";
  cq.lineWidth = 4;
  cq.strokeRect(35, 35, 1466, 750);
  cq.beginPath();
  cq.moveTo(768, 35);
  cq.lineTo(768, 785);
  cq.stroke();
  for (const side of [-1, 1]) {
    const x = side < 0 ? 35 : 1501,
      freeX = side < 0 ? 285 : 1251;
    cq.strokeRect(side < 0 ? 35 : 1251, 260, 250, 300);
    cq.beginPath();
    cq.arc(freeX, 410, 100, 0, Math.PI * 2);
    cq.stroke();
    cq.beginPath();
    cq.arc(
      x,
      410,
      310,
      side < 0 ? -Math.PI / 2 : Math.PI / 2,
      side < 0 ? Math.PI / 2 : Math.PI * 1.5,
    );
    cq.stroke();
  }
  cq.fillStyle = "#b62032";
  cq.beginPath();
  cq.arc(768, 410, 155, 0, Math.PI * 2);
  cq.fill();
  cq.strokeStyle = "#f6e5bf";
  cq.lineWidth = 3;
  cq.stroke();
  cq.save();
  cq.translate(82, 410);
  cq.rotate(-Math.PI / 2);
  cq.fillStyle = "#f5e8c8";
  cq.textAlign = "center";
  cq.font = "900 45px Arial";
  cq.fillText("HOUSTON", 0, 0);
  cq.restore();
  cq.save();
  cq.translate(1454, 410);
  cq.rotate(Math.PI / 2);
  cq.fillStyle = "#f5e8c8";
  cq.textAlign = "center";
  cq.font = "900 45px Arial";
  cq.fillText("ROCKETS", 0, 0);
  cq.restore();
  const courtTexture = new T.CanvasTexture(courtCanvas);
  courtTexture.colorSpace = T.SRGBColorSpace;
  courtTexture.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );
  const courtMesh = new T.Mesh(
    new T.PlaneGeometry(18, 9.6),
    mat("#ffffff", { map: courtTexture, roughness: 0.55 }),
  );
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.position.set(arenaX, 0.58, arenaZ);
  world.add(courtMesh);
  // Red seating tiers and two backboards frame the hardwood.
  for (let row = 0; row < 7; row++) {
    const h = 0.65 + row * 0.43;
    for (const side of [-1, 1]) {
      box(
        20,
        0.12,
        0.35,
        arenaRed,
        arenaX,
        h,
        arenaZ + side * (5.4 + row * 0.49),
      );
      box(
        0.35,
        0.12,
        9,
        arenaRed,
        arenaX + side * (9.7 + row * 0.27),
        h,
        arenaZ,
      );
    }
  }
  for (const side of [-1, 1]) {
    const x = arenaX + side * 8.6;
    box(0.08, 1.9, 0.08, arenaMetal, x, 1.5, arenaZ);
    box(
      0.08,
      0.9,
      1.5,
      mat("#c7d9db", { transparent: true, opacity: 0.55 }),
      x,
      2.45,
      arenaZ,
    );
    const hoop = new T.Mesh(
      new T.TorusGeometry(0.22, 0.025, 6, 20),
      mat("#dd5b2a"),
    );
    hoop.rotation.x = Math.PI / 2;
    hoop.position.set(x - side * 0.3, 2.18, arenaZ);
    world.add(hoop);
  }
  const rocketBannerCanvas = document.createElement("canvas");
  rocketBannerCanvas.width = 512;
  rocketBannerCanvas.height = 768;
  const rb = rocketBannerCanvas.getContext("2d");
  rb.fillStyle = "#a9142c";
  rb.fillRect(0, 0, 512, 768);
  const rocketBannerTexture = new T.CanvasTexture(rocketBannerCanvas);
  rocketBannerTexture.colorSpace = T.SRGBColorSpace;
  const rocketBannerMat = new T.MeshBasicMaterial({ map: rocketBannerTexture });
  for (const side of [-1, 1]) {
    const banner = new T.Mesh(new T.PlaneGeometry(1.35, 2.05), rocketBannerMat);
    banner.position.set(arenaX + side * 9, 2.9, arenaZ + 10.5);
    world.add(banner);
  }
  loadVenueMark("rockets", (im) => {
    cq.drawImage(im, 638, 280, 260, 260);
    courtTexture.needsUpdate = true;
    rb.drawImage(im, 45, 100, 422, 422);
    rb.fillStyle = "#fff";
    rb.font = "900 53px Arial";
    rb.textAlign = "center";
    rb.fillText("ROCKETS", 256, 630);
    rocketBannerTexture.needsUpdate = true;
  });

  const arenaDistrict = new T.Group();
  world.children.slice(arenaStart).forEach((o) => arenaDistrict.add(o));
  world.add(arenaDistrict);
  arenaDistrict.position.set(41, 0, -143);
  // One continuous city plan. +Z is north, +X east. District distances are compressed, relative positions retained.
  // References: Reliant Park campus map; MLB park directions; Toyota Center directions; Hines Williams Tower location.

  return { arenaRoof, lip };
}
