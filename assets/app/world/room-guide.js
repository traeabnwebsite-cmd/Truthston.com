import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createRoomGuide({
  companionSeat,
  sceneAPI,
  T,
  scene,
  hit,
  twin,
  appState,
  camera,
  canvas,
}) {
  let roomGuide = null;
  const guideRoutes = {
    0: [
      [-8.2, 0, 2.6],
      [-6.1, 0, 2.6],
      [-1.1, 0, 2.6],
    ],
    1: [
      [-8.9, 0, 2.6],
      [-10.2, 0, 2.0],
      [-10.2, 0, -2.8],
      [-14.5, 0, -2.8],
    ],
    2: [
      [8.85, 0, -2],
      [10.3, 0, -2],
      [10.9, 0, 0],
      [15.0, 0, 0],
      companionSeat.anchor.toArray(),
    ],
    4: [
      [-8.2, 0, 2.6],
      [-6, 0, 2.4],
      [-4.5, 0, 2.2],
    ],
    5: [
      [-8.2, 0, 2.6],
      [-2, 0, 3.4],
      [2.5, 0, 2.8],
    ],
  };
  sceneAPI.installGuide = (options) => {
    const texture = new T.CanvasTexture(options.canvas);
    texture.colorSpace = T.SRGBColorSpace;
    texture.minFilter = T.LinearFilter;
    texture.generateMipmaps = false;
    const guide = new T.Mesh(
      new T.PlaneGeometry(1.72, 2.3),
      new T.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.06,
        side: T.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    guide.visible = false;
    guide.layers.enable(1);
    scene.add(guide);
    hit(guide, "Talk to the companion", options.onSelect);
    twin("Talk to the companion in the room", options.onSelect);
    roomGuide = {
      mesh: guide,
      texture,
      options,
      visible: false,
      route: [],
      start: 0,
      seated: false,
      station: 0,
    };
  };
  sceneAPI.setGuideVisible = (value) => {
    if (roomGuide) {
      roomGuide.visible = value;
      roomGuide.mesh.visible = value;
    }
  };
  sceneAPI.guideTravel = (i) => {
    if (!roomGuide) return;
    const points = guideRoutes[i];
    roomGuide.station = i;
    if (!points) {
      roomGuide.visible = false;
      roomGuide.mesh.visible = false;
      roomGuide.options.onPosition(0, 0, false);
      return;
    }
    roomGuide.visible = true;
    roomGuide.mesh.visible = true;
    roomGuide.seated = false;
    roomGuide.route = points.map((p) => new T.Vector3(...p));
    roomGuide.start = performance.now();
    roomGuide.mesh.scale.set(1, 1, 1);
    roomGuide.options.onArrive(false);
  };
  function updateRoomGuide(ts) {
    if (!roomGuide || !roomGuide.visible) return;
    const g = roomGuide,
      m = g.mesh;
    g.texture.needsUpdate = true;
    if (g.route.length) {
      const duration = g.station === 2 ? 6000 : 3500,
        u = appState.calm
          ? 1
          : Math.max(0, Math.min(1, (ts - g.start) / duration)),
        segment = Math.min(
          g.route.length - 2,
          Math.floor(u * (g.route.length - 1)),
        ),
        f = Math.min(1, u * (g.route.length - 1) - segment),
        point = new T.Vector3().lerpVectors(
          g.route[segment],
          g.route[segment + 1],
          f,
        );
      m.position.copy(point);
      m.position.y =
        1.15 +
        (u < 1 && !appState.calm ? Math.abs(Math.sin(ts * 0.007)) * 0.025 : 0);
      if (u === 1) {
        g.route = [];
        if (g.station === 2) {
          g.seated = true;
          m.scale.set(0.86, 0.9, 1);
          m.position.copy(companionSeat.anchor);
          m.position.y = companionSeat.spriteCenterY;
          g.options.onArrive(true);
        } else g.options.onArrive(false);
      }
    }
    m.quaternion.copy(camera.quaternion);
    const foot = m.position.clone();
    foot.y -= g.seated ? 1.0 : 1.08;
    const projected = foot.project(camera),
      rect = canvas.getBoundingClientRect(),
      visible =
        projected.z > -1 &&
        projected.z < 1 &&
        Math.abs(projected.x) < 1.04 &&
        Math.abs(projected.y) < 1.1 &&
        appState.station !== 3 &&
        appState.mode === "immersive";
    g.options.onPosition(
      rect.left + ((projected.x + 1) * rect.width) / 2,
      rect.top + ((1 - projected.y) * rect.height) / 2,
      visible,
    );
  }

  // Project the live YouTube iframe onto the four corners of the actual theater screen.

  return {
    update: updateRoomGuide,
    destroy() {
      if (roomGuide) {
        scene.remove(roomGuide.mesh);
        roomGuide.texture.dispose();
        roomGuide.mesh.geometry.dispose();
        roomGuide.mesh.material.dispose();
        roomGuide = null;
      }
    },
  };
}
