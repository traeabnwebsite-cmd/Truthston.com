import { createLifetime } from "../../core/lifecycle.js";
export async function buildCompanionIllustration(canvas, options) {
  const lifetime = createLifetime();
  const source = new Image();
  source.src = "assets/companion/trae-companion-atlas.png";
  try {
    await source.decode();
  } catch {
    return null;
  }
  canvas.width = 384;
  canvas.height = 512;
  const q = canvas.getContext("2d");
  const cinemaArt = new Image();
  cinemaArt.src = "assets/companion/trae-cinema-atlas.png";
  let seated = false,
    eating = false,
    lookingBack = false;
  let pose = 0,
    near = false,
    typing = false,
    dragging = false,
    until = 0,
    phase = 0,
    last = 0,
    lastDraw = 0,
    firstFrame = true,
    raf,
    turnStart = -10000,
    turning = false,
    coverImage = new Image(),
    lastCover = "";
  function spin() {
    if (!options.still()) {
      turnStart = performance.now();
      turning = true;
    }
  }
  function setPose(n) {
    pose = n;
    if (n === 4 || n === 7) spin();
    const cover = options.cover();
    if (n === 6 && lastCover !== cover) {
      lastCover = cover;
      coverImage.src = cover;
    }
  }
  // Anchors use the approved atlas cell coordinates; glints follow the actual rendered pose.
  const jewelryGlints = [
    [
      [203, 214],
      [326, 341],
      [143, 122],
    ],
    [
      [204, 214],
      [312, 341],
      [139, 135],
    ],
    [
      [203, 213],
      [309, 341],
      [135, 135],
    ],
    [
      [174, 214],
      [303, 196],
      [117, 110],
    ],
    [
      [267, 296],
      [149, 97],
    ],
    [
      [185, 179],
      [129, 98],
    ],
    [
      [190, 204],
      [118, 243],
      [155, 101],
    ],
    [
      [191, 186],
      [303, 207],
      [136, 97],
    ],
  ];
  const smileGlints = { 3: [185, 124], 5: [194, 106], 7: [204, 117] };
  let sparkleTime = 0,
    smileTime = 0,
    previousPose = -1;
  function glint(x, y, t, size = 18) {
    if (t < 0 || t > 1.15) return;
    const glow = Math.sin((Math.PI * t) / 1.15);
    q.save();
    q.translate(x, y);
    q.rotate(t * 0.55);
    q.globalAlpha = glow;
    q.shadowColor = "#bde8ff";
    q.shadowBlur = 12 * glow;
    q.fillStyle = "#fff";
    const r = size * (0.4 + 0.6 * glow);
    q.beginPath();
    q.moveTo(0, -r);
    q.lineTo(r * 0.16, -r * 0.16);
    q.lineTo(r, 0);
    q.lineTo(r * 0.16, r * 0.16);
    q.lineTo(0, r);
    q.lineTo(-r * 0.16, r * 0.16);
    q.lineTo(-r, 0);
    q.lineTo(-r * 0.16, -r * 0.16);
    q.closePath();
    q.fill();
    q.restore();
  }
  function part(n, x, y, w, h, dx = x, dy = y) {
    q.drawImage(
      source,
      (n % 4) * 384 + x,
      (n > 3 ? 512 : 0) + y,
      w,
      h,
      dx,
      dy,
      w,
      h,
    );
  }
  function draw(ts) {
    if (document.hidden) return;
    raf = lifetime.frame(draw);
    if (options.hidden?.()) return;
    if (ts - lastDraw < 33) return;
    const dt = Math.min(0.06, (ts - last) / 1000 || 0.03);
    last = ts;
    lastDraw = ts;
    const moving = dragging || ts < until,
      still = options.still();
    phase += dt * (moving ? 17 : 2);
    let n = pose;
    if (near && n < 4 && !typing) n = 3;
    if (typing && n < 4) n = 0;
    if (turning) {
      const u = Math.max(0, (ts - turnStart) / 800);
      if (u >= 1) turning = false;
      else n = [0, 2, 4, 1, pose][Math.min(4, Math.floor(u * 5))];
    }
    q.clearRect(0, 0, 384, 512);
    q.save();
    if (!still)
      q.translate(
        0,
        moving ? Math.abs(Math.sin(phase)) * -5 : Math.sin(ts * 0.0015) * -2,
      );
    // Keep each approved pose intact. No segmented limbs or head crops while dragging/typing.
    if (seated && cinemaArt.complete && cinemaArt.naturalWidth) {
      const cellW = cinemaArt.naturalWidth / 2,
        cellH = cinemaArt.naturalHeight / 2,
        k = lookingBack ? 2 : eating && !still ? Math.floor(ts / 850) % 2 : 0;
      const bounds = [
          [224, 18, 624, 598],
          [133, 20, 565, 598],
          [228, 0, 634, 561],
          [167, 0, 565, 562],
        ][k],
        sw = bounds[2] - bounds[0],
        sh = bounds[3] - bounds[1],
        scale = 470 / sh,
        dw = sw * scale;
      q.drawImage(
        cinemaArt,
        (k % 2) * cellW + bounds[0],
        Math.floor(k / 2) * cellH + bounds[1],
        sw,
        sh,
        (384 - dw) / 2,
        30,
        dw,
        470,
      );
    } else part(n, 0, 0, 384, 512);
    if (!still && !seated) {
      sparkleTime += dt;
      if (n !== previousPose) smileTime = 0;
      smileTime += dt;
      const beat = sparkleTime % 6.5;
      jewelryGlints[n].forEach(([x, y], i) =>
        glint(x, y, beat - 0.7 - i * 0.65),
      );
      const smile = smileGlints[n];
      if (smile) glint(...smile, (smileTime % 4.5) - 0.25, 15);
    }
    previousPose = n;

    if (n === 6 && coverImage.complete && coverImage.naturalWidth) {
      q.save();
      q.translate(281, 226);
      q.rotate(0.39);
      q.drawImage(coverImage, -35, -35, 70, 70);
      q.restore();
    }
    q.restore();
    if (firstFrame) {
      firstFrame = false;
      options.ready();
    }
  }
  raf = lifetime.frame(draw);
  lifetime.listen(document, "visibilitychange", () => {
    lifetime.cancelFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = lifetime.frame(draw);
    }
  });
  return {
    destroy() {
      lifetime.dispose();
    },
    cinema(s, p, back = false) {
      seated = s;
      eating = p;
      lookingBack = back;
    },
    pose: setPose,
    spin,
    pointer(x, y, value) {
      near = value;
    },
    walk(value) {
      dragging = value;
      until = performance.now() + 180;
    },
    typing(value) {
      typing = value;
    },
  };
}
