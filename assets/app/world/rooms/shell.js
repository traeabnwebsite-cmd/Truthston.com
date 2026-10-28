export function buildShopShell({ box, mat, wood, dark }) {
  const wall = mat("#b9ad94"),
    trim = mat("#383e35");
  box(17, 0.25, 13, wood, 0, -0.15, 0);
  for (let i = 0; i < 17; i++) box(0.018, 0.01, 13, dark, -8 + i, -0.018, 0);
  // Full-height walls and a real ceiling; only the actual doorways are open.
  box(13.85, 6.6, 0.22, wall, -1.575, 3.3, -6);
  box(0.55, 6.6, 0.22, wall, 8.225, 3.3, -6);
  box(2.6, 2.9, 0.22, wall, 6.65, 5.15, -6);
  // The left wall has elevator (-0.4) and DJ (2.6) doorways.
  box(0.22, 6.6, 4.3, wall, -8.5, 3.3, -3.85);
  box(0.22, 6.6, 0.4, wall, -8.5, 3.3, 1.1);
  box(0.22, 2.9, 2.6, wall, -8.5, 5.15, -0.4);
  box(0.22, 6.6, 2.1, wall, -8.5, 3.3, 4.95);
  box(0.22, 2.9, 2.6, wall, -8.5, 5.15, 2.6);
  // Screening faces the DJ doorway; merch takes the other right-wall bay.
  box(0.22, 6.6, 4.3, wall, 8.5, 3.3, -3.85);
  box(0.22, 6.6, 0.4, wall, 8.5, 3.3, 1.1);
  box(0.22, 6.6, 2.1, wall, 8.5, 3.3, 4.95);
  for (const z of [-0.4, 2.6]) box(0.22, 2.9, 2.6, wall, 8.5, 5.15, z);
  // Leave the right-hand stairwell open to the second floor.
  box(14, 0.16, 13, trim, -1.5, 6.65, 0);
  for (const x of [-5, -1, 3]) box(0.08, 0.18, 12.5, dark, x, 6.48, 0);
  box(16.8, 0.16, 0.2, dark, 0, 0.12, -5.83);
}
