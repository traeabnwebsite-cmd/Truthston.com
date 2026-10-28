// Project the iframe rectangle onto the four visible screen corners.
export function screenTransform(p, width = 960, height = 540) {
  if (
    p.length !== 4 ||
    !p.every((v) => Number.isFinite(v.x) && Number.isFinite(v.y)) ||
    width <= 0 ||
    height <= 0
  )
    return null;
  let dx1 = p[1].x - p[2].x,
    dx2 = p[3].x - p[2].x,
    dx3 = p[0].x - p[1].x + p[2].x - p[3].x,
    dy1 = p[1].y - p[2].y,
    dy2 = p[3].y - p[2].y,
    dy3 = p[0].y - p[1].y + p[2].y - p[3].y,
    g = 0,
    j = 0,
    den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) > 0.001) {
    g = (dx3 * dy2 - dx2 * dy3) / den;
    j = (dx1 * dy3 - dx3 * dy1) / den;
  }
  const a = p[1].x - p[0].x + g * p[1].x,
    b = p[3].x - p[0].x + j * p[3].x,
    c = p[0].x,
    d = p[1].y - p[0].y + g * p[1].y,
    e = p[3].y - p[0].y + j * p[3].y,
    f = p[0].y;
  return `matrix3d(${a / width},${d / width},0,${g / width},${b / height},${e / height},0,${j / height},0,0,1,0,${c},${f},0,1)`;
}
