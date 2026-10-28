import { chronologicalReleases } from "../../features/store/catalog-policy.js";
export function buildCrates({
  T,
  renderer,
  world,
  releases: sourceReleases,
  sleeves,
  hit,
  release,
  box,
  wood,
  dark,
  canvas,
  store,
}) {
  const releases = chronologicalReleases(sourceReleases);
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
  abnMark(2, 0, 5.84, -5.8);
  const loader = new T.TextureLoader();
  function sleeve(index, x, y, z, size, yaw = 0, buy = false) {
    const r = releases[index];
    if (!r) return;
    const texture = loader.load(r.cover);
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = 8;
    const mesh = new T.Mesh(
      new T.PlaneGeometry(size, size),
      new T.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        emissive: "#d9902b",
        emissiveIntensity: 0,
        side: T.DoubleSide,
      }),
    );
    mesh.position.set(x, y, z);
    mesh.rotation.y = yaw;
    mesh.userData = {
      release: r,
      base: mesh.position.clone(),
      normal: new T.Vector3(Math.sin(yaw), 0, Math.cos(yaw)),
      sleeve: true,
    };
    world.add(mesh);
    sleeves.push(mesh);
    hit(mesh, r.title + " / " + r.year, () =>
      buy ? store?.selectRelease(r) : release(r),
    );
  }
  // The back wall is an ordered record archive. ABN sits in its own clear band above it.
  for (let row = 0; row < 6; row++) {
    const y = 4.8 - row * 0.7;
    box(12.5, 0.075, 0.36, wood, -1.65, y - 0.34, -5.58);
    for (let col = 0; col < 19; col++)
      sleeve(row * 19 + col, -7.5 + col * 0.65, y, -5.38, 0.56);
  }
  for (const side of [-1, 1])
    for (let row = 0; row < 3; row++) {
      const y = 1.3 + row * 0.95;
      box(0.38, 0.075, 2.2, wood, side * 8.08, y - 0.4, -4);
      for (let col = 0; col < 2; col++)
        sleeve(
          114 + (side < 0 ? 0 : 6) + row * 2 + col,
          side * 7.98,
          y,
          -4.6 + col * 1.2,
          0.7,
          (-side * Math.PI) / 2,
          side > 0,
        );
    }
  // Two low, unlabelled browsing fixtures leave the center and elevator approach unobstructed.
  for (const x of [-3.1, 2.4]) {
    box(1.7, 1, 0.85, wood, x, 0.5, -0.7);
    box(1.55, 0.07, 0.72, dark, x, 1.04, -0.7);
    for (let i = 0; i < 5; i++)
      box(1.35, 0.035, 0.055, wood, x, 1.1 + i * 0.025, -0.95 + i * 0.12);
  }
  canvas.dataset.shelfAudit = JSON.stringify({
    displayed: sleeves.length,
    distinctArtwork: new Set(sleeves.map((s) => s.userData.release.cover)).size,
    fullCatalog: releases.length,
    layout:
      "full chronological back wall, side shelves and two low browsing racks",
  });
  return { abnTexture, abnMark };
}
