// Widen the vertical field of view on narrow screens without stretching scene geometry.
export function responsiveFieldOfView(base, aspect, maxFov = 90) {
  const ratio = Math.max(0.25, Number(aspect) || 1);
  return Math.min(
    maxFov,
    (2 *
      Math.atan(Math.tan((base * Math.PI) / 360) / Math.min(1, ratio / 1.25)) *
      180) /
      Math.PI,
  );
}

// Keep shop orbits inside the closed side/back walls and below the ceiling.
// The front remains a cutaway for the original wide entrance view.
export function constrainShopOrbit(position, target, station) {
  if (![0, 5, 8, 9].includes(station)) return position;
  let scale = 1;
  for (const [axis, min, max] of [
    ["x", -7.95, 7.95],
    ["z", -4.95, Infinity],
    ["y", -Infinity, 6.1],
  ]) {
    const delta = position[axis] - target[axis];
    if (position[axis] < min && delta < 0)
      scale = Math.min(scale, (min - target[axis]) / delta);
    if (position[axis] > max && delta > 0)
      scale = Math.min(scale, (max - target[axis]) / delta);
  }
  if (scale < 1)
    for (const axis of ["x", "y", "z"])
      position[axis] =
        target[axis] + (position[axis] - target[axis]) * Math.max(0, scale);
  return position;
}
