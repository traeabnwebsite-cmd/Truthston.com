import { $, $$, esc } from "../../core/dom.js";
export function buildCrates({
  T,
  renderer,
  world,
  label,
  releases,
  sleeves,
  hit,
  release,
  box,
  wood,
  dark,
  canvas,
}) {
  const abnTexture = new T.TextureLoader().load(
    "assets/branding/abn-angel-by-nature-official.png",
  );
  abnTexture.colorSpace = T.SRGBColorSpace;
  abnTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  function abnMark(w, x, y, z) {
    const logo = new T.Mesh(
      new T.PlaneGeometry(w, (w * 281) / 512),
      new T.MeshBasicMaterial({ map: abnTexture }),
    );
    logo.position.set(x, y, z);
    world.add(logo);
    return logo;
  }
  abnMark(2.4, -5.1, 5.7, -5.72);
  label("ABN RECORDS", 4.1, 0.95, -1.4, 5.8, -5.72, "#ebd5a7", "#893222", 140);
  label(
    "CDs & TAPES / HOUSTON, TX",
    6.2,
    0.5,
    -2.2,
    4.9,
    -5.72,
    "#cfbc91",
    "#23291e",
    46,
  );
  label(
    "INDEPENDENT SPIRIT. HOUSTON SOUL.",
    4.2,
    0.45,
    -2.2,
    0.45,
    -5.7,
    "#c0a879",
    "#292b20",
    40,
  );
  const texLoader = new T.TextureLoader();
  const textures = releases.map((r) => {
    const t = texLoader.load(r.cover, undefined, undefined, () => {
      const fallback = texLoader.load(r.art);
      fallback.colorSpace = T.SRGBColorSpace;
      sleeves
        .filter((s) => s.userData.release === r)
        .forEach((s) => {
          s.material.map = fallback;
          s.material.needsUpdate = true;
        });
    });
    t.colorSpace = T.SRGBColorSpace;
    return t;
  });
  function sleeveAt(idx, x, y, z, size, ry = 0) {
    const r = releases[idx];
    if (!r) return null;
    const m = new T.MeshStandardMaterial({
      map: textures[idx],
      roughness: 0.72,
      emissive: "#d9902b",
      emissiveIntensity: 0,
      side: T.DoubleSide,
    });
    const s = new T.Mesh(new T.PlaneGeometry(size, size), m);
    s.position.set(x, y, z);
    s.rotation.y = ry;
    s.userData = {
      release: r,
      base: s.position.clone(),
      normal: new T.Vector3(Math.sin(ry), 0, Math.cos(ry)),
      sleeve: true,
    };
    world.add(s);
    sleeves.push(s);
    hit(s, r.title + " / " + r.year, () => release(r));
    return s;
  }
  // 64 full-face sleeves across the back wall; every displayed artwork is different.
  for (let row = 0; row < 4; row++) {
    box(11.8, 0.14, 0.65, wood, -1.7, 1.05 + row * 0.91, -5.25);
    for (let col = 0; col < 16; col++)
      sleeveAt(
        row * 16 + col,
        -7.35 + col * 0.73,
        1.49 + row * 0.91,
        -5.15,
        0.68,
      );
  }
  for (let i = 0; i < 6; i++)
    box(0.1, 3.85, 0.68, wood, -7.65 + i * 2.38, 2.6, -5.25);
  // The archive continues around the left wall and the front-right wall instead of repeating covers.
  for (let row = 0; row < 4; row++) {
    box(0.55, 0.12, 6.7, wood, -8.15, 1.0 + row * 0.95, -2.05);
    box(0.55, 0.12, 1.3, wood, -8.15, 1.0 + row * 0.95, 4.5);
    for (let col = 0; col < 8; col++) {
      const idx = 64 + row * 8 + col;
      if (col === 5 || col === 6)
        sleeveAt(
          idx,
          -20.58,
          1.5 + row * 0.95,
          -4.2 + (col - 5) * 1.3,
          0.84,
          Math.PI / 2,
        );
      else
        sleeveAt(
          idx,
          -8.15,
          1.5 + row * 0.95,
          -4.55 + col * 1.28,
          0.84,
          Math.PI / 2,
        );
    }
  }
  for (let row = 0; row < 4; row++) {
    box(0.55, 0.12, 5.5, wood, 8.15, 1.02 + row * 0.95, 2.65);
    for (let col = 0; col < 6; col++)
      sleeveAt(
        96 + row * 6 + col,
        8.12,
        1.49 + row * 0.95,
        0.48 + col * 0.86,
        0.74,
        -Math.PI / 2,
      );
  }
  // The final 18 distinct releases sit in the three foreground bins.
  for (let crate = 0; crate < 3; crate++) {
    const x = -4.9 + crate * 2.2,
      z = -0.4;
    box(1.9, 1.35, 1.5, wood, x, 0.65, z);
    box(1.76, 0.09, 1.3, dark, x, 1.36, z);
    label(
      ["HOUSTON", "MIXTAPES", "DEEP CUTS"][crate],
      1.55,
      0.38,
      x,
      0.8,
      z + 0.76,
      "#25271e",
      "#c4b28d",
      95,
    );
    for (let j = 0; j < 6; j++) {
      const s = sleeveAt(120 + crate * 6 + j, x, 1.7, -0.9 + j * 0.21, 1.3);
      if (s) s.rotation.x = -0.12;
    }
  }
  canvas.dataset.shelfAudit = JSON.stringify({
    displayed: sleeves.length,
    distinctArtwork: new Set(sleeves.map((s) => s.userData.release.cover)).size,
  });

  // The two-deck console is moved intact into a dedicated DJ room.

  return { abnTexture, abnMark };
}
