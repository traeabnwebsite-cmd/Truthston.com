import { $ } from "../../core/dom.js";
import { screenTransform } from "./projection.js";
export function createTheaterScreen({
  T,
  scene,
  screen,
  renderer,
  appState,
  camera,
  canvas,
  sun,
  roomAmbient,
  theatreLights,
  screenLight,
}) {
  const cinemaDepthMask = new T.Mesh(
    screen.geometry,
    new T.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      side: T.DoubleSide,
    }),
  );
  cinemaDepthMask.position.copy(screen.position);
  cinemaDepthMask.position.x -= 0.02;
  cinemaDepthMask.quaternion.copy(screen.quaternion);
  cinemaDepthMask.renderOrder = -1000;
  cinemaDepthMask.visible = false;
  cinemaDepthMask.layers.set(1);
  scene.add(cinemaDepthMask);
  let theaterLightsLevel = 0,
    theaterDim = false;
  const setCinemaLights = (value) => {
    theaterDim = value;
    screen.visible = !value;
    cinemaDepthMask.visible = value;
    if (value) {
      scene.background = null;
      renderer.setClearColor("#0b120e", 0);
    } else {
      renderer.setClearColor("#0b120e", 1);
      if (appState.station === 2) scene.background = new T.Color("#20251f");
    }
  };

  function updateTheater(dt) {
    const desired = theaterDim && appState.station === 2 ? 1 : 0;
    theaterLightsLevel +=
      (desired - theaterLightsLevel) *
      (appState.calm ? 1 : Math.min(1, dt * 1.6));
    if (appState.station === 2) {
      sun.intensity = 3 * (1 - theaterLightsLevel) + 0.1 * theaterLightsLevel;
      roomAmbient.intensity =
        2.6 * (1 - theaterLightsLevel) + 0.2 * theaterLightsLevel;
      theatreLights.forEach(
        (l) =>
          (l.intensity =
            16 * (1 - theaterLightsLevel) + 0.65 * theaterLightsLevel),
      );
      screenLight.intensity =
        22 * (1 - theaterLightsLevel) + 11 * theaterLightsLevel;
      screenLight.color.set(theaterLightsLevel > 0.3 ? "#adc9f1" : "#93aaa0");
    }
    const host = $("#room-cinema");
    if (
      !host ||
      host.hidden ||
      appState.station !== 2 ||
      appState.mode !== "immersive"
    )
      return;
    const { width: w, height: h } = screen.geometry.parameters;
    const points = [
      [-w / 2, h / 2],
      [w / 2, h / 2],
      [w / 2, -h / 2],
      [-w / 2, -h / 2],
    ].map(([x, y]) =>
      new T.Vector3(x, y, 0).applyMatrix4(screen.matrixWorld).project(camera),
    );
    if (points.some((p) => p.z <= -1 || p.z >= 1) || camera.position.x > 18.2) {
      host.style.visibility = "hidden";
      return;
    }
    host.style.visibility = "visible";
    const rect = canvas.getBoundingClientRect(),
      p = points.map((v) => ({
        x: ((v.x + 1) * rect.width) / 2,
        y: ((1 - v.y) * rect.height) / 2,
      }));
    const transform = screenTransform(p);
    if (!transform) {
      host.style.visibility = "hidden";
      return;
    }
    host.style.transform = transform;
    host.dataset.screenAttached = "true";
  }
  return {
    setCinemaLights,
    update: updateTheater,
    destroy() {
      scene.remove(cinemaDepthMask);
      cinemaDepthMask.material.dispose();
    },
  };
}
