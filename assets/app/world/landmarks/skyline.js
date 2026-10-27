import { $, $$, esc } from "../../core/dom.js";
export async function buildSkyline({
  rand,
  T,
  renderer,
  mat,
  box,
  world,
  dark,
  glowMat,
  canvas,
  twin,
  modal,
}) {
  function towerMaterial(base, lit = "#ffd08b", options = {}) {
    const c = document.createElement("canvas"),
      ec = document.createElement("canvas");
    c.width = ec.width = 512;
    c.height = ec.height = 2048;
    const q = c.getContext("2d"),
      eq = ec.getContext("2d");
    q.fillStyle = base;
    q.fillRect(0, 0, 512, 2048);
    eq.fillStyle = "#000";
    eq.fillRect(0, 0, 512, 2048);
    for (let row = 0; row < 92; row++) {
      const floorGlow = rand() > 0.48;
      for (let col = 0; col < 26; col++) {
        const x = col * 19.7 + 3,
          y = row * 22.25 + 4,
          occupied = rand() > (floorGlow ? 0.42 : 0.84);
        q.fillStyle = occupied ? "#bdaf8c" : options.unlit || "#294657";
        q.globalAlpha = occupied ? 0.48 : 0.32;
        q.fillRect(x, y, 13, 12);
        if (occupied) {
          eq.fillStyle = (row + col) % 11 === 0 ? "#e2d8bf" : lit;
          eq.globalAlpha = 0.5 + rand() * 0.4;
          eq.fillRect(x, y, 13, 12);
        }
      }
    }
    q.globalAlpha = 0.25;
    q.fillStyle = options.mullion || "#8295a1";
    for (let x = 0; x < 512; x += 19.7) q.fillRect(x, 0, 1, 2048);
    for (let y = 0; y < 2048; y += 22.25) q.fillRect(0, y, 512, 1);
    q.globalAlpha = eq.globalAlpha = 1;
    const t = new T.CanvasTexture(c),
      et = new T.CanvasTexture(ec);
    for (const map of [t, et]) {
      map.colorSpace = T.SRGBColorSpace;
      map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    return mat("#ffffff", {
      map: t,
      emissiveMap: et,
      emissive: "#ffd39a",
      emissiveIntensity: 0.7,
      metalness: options.metalness ?? 0.32,
      roughness: 0.35,
    });
  }
  const blueGlass = towerMaterial("#163f48", "#ffdda0", {
      mullion: "#6f8da7",
      metalness: 0.4,
    }),
    grayGlass = towerMaterial("#465a6a", "#fff0c6", {
      mullion: "#b3bbc0",
      unlit: "#2a3d4c",
    }),
    bronzeGlass = towerMaterial("#3b3739", "#f7d394", {
      mullion: "#7f7068",
      unlit: "#302c31",
    }),
    heritageGlass = towerMaterial("#354d60", "#ffe6b1", { mullion: "#8394a1" }),
    roseGlass = towerMaterial("#796a65", "#ffe4b2", {
      mullion: "#b19b8c",
      unlit: "#453d43",
      metalness: 0.18,
    }),
    transcoGlass = towerMaterial("#3a5265", "#ffebc4", {
      mullion: "#bdc7cf",
      unlit: "#273c4b",
    }),
    granite = mat("#b2b5b5", { roughness: 0.9 }),
    transcoSilver = mat("#adb8c0", { metalness: 0.32, roughness: 0.5 });
  function tower(w, h, d, m, x, z) {
    return box(w, h, d, m, x, h / 2, z);
  }
  // Downtown landmarks: Chase Tower's chamfered footprint, the curved glass tower,
  // Heritage Plaza's stepped crown, TC Energy Center's gables and Pennzoil's sloped twins.
  const { skylinePosition } = await import("../../../skyline-layout.mjs");
  const primarySkyline = [];
  let skylineStart = world.children.length;
  function captureSkyline(name, x, z) {
    const ref = skylinePosition(name),
      group = new T.Group();
    group.name = name;
    world.children.slice(skylineStart).forEach((o) => group.add(o));
    group.position.set(ref.x - x, 0, ref.z - z);
    world.add(group);
    primarySkyline.push({ ...ref, skyline: true });
    skylineStart = world.children.length;
  }
  const chaseSkin = towerMaterial("#71838a", "#f3d9aa", {
    mullion: "#aeb8bb",
    unlit: "#304653",
  });
  const chaseShape = new T.Shape();
  chaseShape.moveTo(-4, -3);
  chaseShape.lineTo(2, -3);
  chaseShape.lineTo(4, -1);
  chaseShape.lineTo(4, 3);
  chaseShape.lineTo(-4, 3);
  chaseShape.closePath();
  const chase = new T.Mesh(
    new T.ExtrudeGeometry(chaseShape, { depth: 45, bevelEnabled: false }),
    [granite, chaseSkin],
  );
  const chasePos = chase.geometry.attributes.position,
    chaseUV = chase.geometry.attributes.uv,
    chaseNormal = chase.geometry.attributes.normal;
  for (let i = 0; i < chasePos.count; i++)
    chaseUV.setXY(
      i,
      Math.abs(chaseNormal.getX(i)) > 0.5
        ? (chasePos.getY(i) + 3) / 6
        : (chasePos.getX(i) + 4) / 8,
      chasePos.getZ(i) / 45,
    );
  chaseUV.needsUpdate = true;
  chase.rotation.x = -Math.PI / 2;
  chase.position.set(5, 0, -123);
  world.add(chase);
  for (let i = 0; i < 9; i++)
    box(0.075, 45, 0.04, granite, 1.2 + i * 0.87, 22.5, -119.96);
  captureSkyline("JPMorgan Chase Tower", 5, -123);
  const wells = new T.Mesh(new T.CylinderGeometry(4.7, 4.7, 43.8, 48), [
    blueGlass,
    mat("#698a8e", { metalness: 0.6, roughness: 0.35 }),
    dark,
  ]);
  wells.scale.z = 0.7;
  wells.position.set(-7, 21.9, -127);
  world.add(wells); // Curved tower bands follow the actual facade instead of floating across its curved face.
  const glassBand = mat("#8195a5", { metalness: 0.45, roughness: 0.48 });
  for (let i = 0; i < 25; i++) {
    const band = new T.Mesh(
      new T.CylinderGeometry(4.715, 4.715, 0.045, 32, 1, true),
      glassBand,
    );
    band.scale.z = 0.7;
    band.position.set(-7, 1 + i * 1.7, -127);
    world.add(band);
  }
  captureSkyline("Wells Fargo Plaza", -7, -127);
  tower(8.6, 29, 7, heritageGlass, -20, -113);
  // Heritage Plaza: each light strip sits on its own recessed tier's front fascia.
  // Keep the strip below the top edge and move it BACK with the receding crown.
  const crownStone = mat("#99928b", { roughness: 0.94 }),
    crownTrim = glowMat("#eed7a6", 0.44);
  for (let i = 0; i < 6; i++) {
    const width = 8.8 - i * 1.14,
      depth = 7 - i * 0.8,
      centerY = 29.3 + i * 0.75;
    box(width, 0.75, depth, crownStone, -20, centerY, -113);
    box(
      width - 0.16,
      0.045,
      0.028,
      crownTrim,
      -20,
      centerY + 0.28,
      -113 + depth / 2 + 0.017,
    );
  }
  box(2.95, 0.12, 2.9, crownStone, -20, 33.48, -113);
  captureSkyline("Heritage Plaza", -20, -113);
  tower(8, 28, 6, roseGlass, 21, -121);
  const gable = new T.Shape();
  gable.moveTo(-4, 28);
  gable.lineTo(4, 28);
  gable.lineTo(4, 30);
  gable.lineTo(3, 30);
  gable.lineTo(3, 31.5);
  gable.lineTo(2, 31.5);
  gable.lineTo(2, 33);
  gable.lineTo(0, 36);
  gable.lineTo(-2, 33);
  gable.lineTo(-2, 31.5);
  gable.lineTo(-3, 31.5);
  gable.lineTo(-3, 30);
  gable.lineTo(-4, 30);
  gable.closePath();
  const gabledCrown = new T.Mesh(
    new T.ExtrudeGeometry(gable, { depth: 6, bevelEnabled: false }),
    mat("#a38c81", { roughness: 0.88 }),
  );
  gabledCrown.position.set(21, 0, -124);
  world.add(gabledCrown);
  captureSkyline("TC Energy Center", 21, -121);
  for (let i = 0; i < 2; i++) {
    const shape = new T.Shape();
    shape.moveTo(-3, 0);
    shape.lineTo(3, 0);
    shape.lineTo(3, 18);
    shape.lineTo(-3, 24);
    shape.closePath();
    const tw = new T.Mesh(
      new T.ExtrudeGeometry(shape, { depth: 4, bevelEnabled: false }),
      bronzeGlass,
    );
    const tp = tw.geometry.attributes.position,
      tu = tw.geometry.attributes.uv;
    for (let j = 0; j < tp.count; j++)
      tu.setXY(j, (tp.getX(j) + 3) / 6, tp.getY(j) / 24);
    tu.needsUpdate = true;
    tw.position.set(32 + i * 6.6, 0, -122 - i * 4);
    world.add(tw);
  }

  captureSkyline("Pennzoil Place", 35.3, -124);
  // Named completion pass against the owner's west-facing skyline reference.
  // Coordinates preserve the compressed downtown parcels, not surveyed real-world distances.
  const skylineTowerFootprints = [...primarySkyline],
    skylineInventory = [...primarySkyline];
  function namedSkyline(name, x, z, w, d, build) {
    const first = world.children.length;
    build();
    const group = new T.Group();
    group.name = name;
    world.children.slice(first).forEach((o) => group.add(o));
    const ref = skylinePosition(name);
    group.position.set(ref.x - x, 0, ref.z - z);
    world.add(group);
    skylineTowerFootprints.push({ ...ref, skyline: true });
    skylineInventory.push({ ...ref });
    return group;
  }
  const paleOffice = towerMaterial("#9b9d93", "#ffe1a4", {
      mullion: "#ddd7be",
      unlit: "#4b5860",
      metalness: 0.15,
    }),
    champagneOffice = towerMaterial("#766e56", "#ffe2a5", {
      mullion: "#b8a98c",
      unlit: "#3f4547",
      metalness: 0.18,
    }),
    inkOffice = towerMaterial("#25323b", "#e4c784", {
      mullion: "#79888f",
      unlit: "#1c303e",
    }),
    freshGlass = towerMaterial("#31586b", "#dfd9b9", {
      mullion: "#a4bdc6",
      unlit: "#27495e",
      metalness: 0.5,
    });
  namedSkyline("One Shell Plaza", -6, -112, 8, 7, () => {
    tower(8, 32, 7, paleOffice, -6, -112);
    for (let i = 0; i < 16; i++)
      box(0.09, 32, 0.04, granite, -9.8 + i * 0.51, 16, -108.48);
    box(7.6, 0.55, 6.6, granite, -6, 32.27, -112);
    box(3.1, 0.8, 2.8, dark, -6, 32.9, -112);
  });
  namedSkyline("CenterPoint Energy Plaza", -41.5, -126, 6, 7, () => {
    tower(6, 25, 7, inkOffice, -41.5, -126);
    box(5.4, 1.8, 6.4, mat("#88989d"), -41.5, 25.9, -126);
    for (const dx of [-2.1, 2.1]) {
      box(0.28, 4, 0.28, granite, -41.5 + dx, 28, -126);
      box(0.75, 0.15, 0.75, glowMat("#ffe4b4", 0.3), -41.5 + dx, 30.1, -126);
    }
  });
  namedSkyline("1600 Smith Street", -25, -138.9, 8, 3.6, () => {
    tower(8, 26, 3.6, bronzeGlass, -25, -138.9);
    for (let j = 0; j < 3; j++)
      box(
        7.6 - j * 1.3,
        0.7,
        3.3 - j * 0.45,
        mat("#8c776a"),
        -25,
        26.35 + j * 0.7,
        -138.9,
      );
    box(3.3, 0.15, 1.8, glowMat("#e8d8bb", 0.25), -25, 28.15, -138.9);
  });
  namedSkyline("Enterprise Plaza / 1100 Louisiana", 21, -111, 8, 6, () => {
    tower(8, 31, 6, roseGlass, 21, -111);
    for (let level = 0; level < 4; level++)
      box(
        7.6 - level * 0.9,
        0.8,
        5.7 - level * 0.55,
        roseGlass,
        21,
        31.4 + level * 0.8,
        -111,
      );
    for (const side of [-1, 1])
      box(0.14, 31, 0.14, mat("#ac9690"), 21 + side * 3.75, 15.5, -107.99);
  });
  namedSkyline("609 Main at Texas", 55, -122, 7, 8, () => {
    tower(7, 30, 8, freshGlass, 55, -122);
    const shape = new T.Shape();
    shape.moveTo(-3.5, 30);
    shape.lineTo(3.5, 30);
    shape.lineTo(3.5, 35);
    shape.lineTo(-3.5, 32);
    shape.closePath();
    const crown = new T.Mesh(
      new T.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false }),
      freshGlass,
    );
    crown.position.set(55, 0, -126);
    world.add(crown);
    for (const side of [-1, 1])
      box(0.1, 30, 0.05, transcoSilver, 55 + side * 3.4, 15, -117.98);
  });
  namedSkyline("Texas Tower", 7, -146, 6, 8, () => {
    tower(6, 31.5, 8, freshGlass, 7, -146);
    box(5.4, 1.2, 7.4, grayGlass, 7, 32.1, -146);
    box(5.6, 0.15, 7.6, transcoSilver, 7, 32.78, -146);
    for (let j = 0; j < 10; j++)
      box(0.045, 31, 0.035, transcoSilver, 4.2 + j * 0.62, 15.5, -141.98);
  });
  namedSkyline("1500 Louisiana", 39, -111, 9, 8, () => {
    const curved = new T.Mesh(new T.CylinderGeometry(4.5, 4.5, 26.5, 48), [
      grayGlass,
      granite,
      dark,
    ]);
    curved.scale.z = 8 / 9;
    curved.position.set(39, 13.25, -111);
    world.add(curved);
    for (let j = 0; j < 22; j++) {
      const band = new T.Mesh(
        new T.CylinderGeometry(4.51, 4.51, 0.1, 48, 1, true),
        transcoSilver,
      );
      band.scale.z = 8 / 9;
      band.position.set(39, 1 + j * 1.18, -111);
      world.add(band);
    }
    box(5.5, 0.6, 5.8, granite, 39, 26.8, -111);
  });
  namedSkyline("1400 Smith Street", 55, -145, 7, 9, () => {
    tower(7, 23, 9, inkOffice, 55, -145);
    for (let j = 0; j < 4; j++)
      box(
        6.8 - j * 0.8,
        0.7,
        8.8 - j * 0.8,
        inkOffice,
        55,
        23.35 + j * 0.7,
        -145,
      );
    for (const x of [52, 58])
      box(0.09, 24, 0.06, mat("#78878a"), x, 12, -140.47);
  });
  canvas.dataset.skylineInventory = JSON.stringify(skylineInventory);
  twin("Downtown skyline building guide", () =>
    modal(
      '<span class="eyebrow">TRUTHSTON / HOUSTON SKYLINE</span><h2>The city, accounted for.</h2><p>Named landmark interpretations in the compressed downtown model.</p><ol>' +
        skylineInventory.map((v) => "<li>" + esc(v.name) + "</li>").join("") +
        "</ol>",
    ),
  );

  // Downtown buildings now use geographic reference placements rather than anonymous rows.
  // The curved glass crown has a restrained perimeter light, rather than floating rectangular bands.
  const wellsCrown = new T.Mesh(
    new T.TorusGeometry(4.68, 0.045, 6, 64),
    glowMat("#e8e8ce", 0.45),
  );
  wellsCrown.rotation.x = Math.PI / 2;
  wellsCrown.scale.y = 0.7;
  wellsCrown.position.set(-7, 43.84, -127);
  world.add(wellsCrown);
  const wellsRef = skylinePosition("Wells Fargo Plaza");
  wellsCrown.position.x += wellsRef.x + 7;
  wellsCrown.position.z += wellsRef.z + 127;
  // Transco / Williams Tower stands apart in the Uptown vignette, with setbacks and a beacon crown.

  return { skylineTowerFootprints, skylineInventory };
}
