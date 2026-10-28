import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createWorldInput({
  canvas,
  view,
  appState,
  pointer,
  ray,
  camera,
  interact,
  rand,
}) {
  const lifetime = createLifetime();
  lifetime.listen(canvas, "keydown", (e) => {
    if (
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "+",
        "=",
        "-",
        "_",
      ].includes(e.key)
    ) {
      e.preventDefault();
      view.streetJourney = null;
      if (e.key === "ArrowLeft") view.angleGoal += Math.PI / 12;
      if (e.key === "ArrowRight") view.angleGoal -= Math.PI / 12;
      if (e.key === "ArrowUp")
        view.elevationGoal = Math.min(
          appState.station === 3 ? 850 : 12,
          view.elevationGoal + 2,
        );
      if (e.key === "ArrowDown")
        view.elevationGoal = Math.max(2, view.elevationGoal - 2);
      if (e.key === "+" || e.key === "=")
        view.radiusGoal = Math.max(5, view.radiusGoal * 0.88);
      if (e.key === "-" || e.key === "_")
        view.radiusGoal = Math.min(650, view.radiusGoal * 1.12);
    }
  });
  let down = false,
    dragged = false,
    px = 0,
    py = 0;
  function pick(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(interact, false)[0]?.object;
  }
  lifetime.listen(canvas, "pointerdown", (e) => {
    down = true;
    dragged = false;
    px = e.clientX;
    py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  lifetime.listen(canvas, "pointermove", (e) => {
    if (down) {
      const dx = e.clientX - px,
        dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
      view.streetJourney = null;
      view.angleGoal -= dx * 0.008;
      view.elevationGoal = Math.max(
        2,
        Math.min(
          appState.station === 3 ? 650 : 12,
          view.elevationGoal + dy * (appState.station === 3 ? 0.12 : 0.02),
        ),
      );
      px = e.clientX;
      py = e.clientY;
      $("#tip").style.display = "none";
      return;
    }
    view.hovering = pick(e);
    canvas.style.cursor = view.hovering ? "pointer" : "grab";
    const tip = $("#tip");
    tip.style.display = view.hovering ? "block" : "none";
    if (view.hovering) {
      tip.textContent = view.hovering.userData.text;
      const r = canvas.getBoundingClientRect();
      tip.style.left = Math.min(e.clientX - r.left + 12, r.width - 245) + "px";
      tip.style.top = Math.max(55, e.clientY - r.top - 40) + "px";
    }
  });
  lifetime.listen(canvas, "pointerup", (e) => {
    down = false;
    if (!dragged) pick(e)?.userData.fn?.();
  });
  lifetime.listen(canvas, "pointercancel", () => (down = false));
  lifetime.listen(canvas, "pointerleave", () => {
    view.hovering = null;
    $("#tip").style.display = "none";
  });
  const ink = $("#ink"),
    ix = ink.getContext("2d"),
    drops = [];
  lifetime.listen($(".room-wrap"), "pointermove", (e) => {
    if (appState.calm || appState.mode !== "immersive") return;
    const r = ink.getBoundingClientRect();
    drops.push({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      life: 1,
      vx: (rand() - 0.5) * 2,
      vy: (rand() - 0.5) * 2,
    });
    if (drops.length > 80) drops.shift();
  });

  return {
    ink,
    ix,
    drops,
    destroy() {
      lifetime.dispose();
    },
  };
}
