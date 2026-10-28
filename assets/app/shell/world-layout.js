// Reserve real space for controls. No interface panel sits over the rendered room.
import { createLifetime } from "../core/lifecycle.js";
export function createWorldLayout() {
  const lifetime = createLifetime();
  const room = document.querySelector(".room-wrap");
  const original = [...room.children];
  const entry = document.createElement("div");
  entry.className = "mobile-world-entry";
  entry.innerHTML =
    '<div><b>Step inside Truthston.</b><small>A full-screen 3D experience. Best viewed sideways.</small></div><button class="primary" type="button">Enter the 3D world ↗</button>';
  room.before(entry);
  lifetime.listen(entry.querySelector("button"), "click", () =>
    document.querySelector('[data-mode="immersive"]').click(),
  );
  const toolbar = document.createElement("div"),
    context = document.createElement("div"),
    stage = document.createElement("div");
  toolbar.className = "world-toolbar";
  context.className = "world-context";
  stage.className = "world-stage";
  for (const selector of [".room-label", ".room-tools"]) {
    const node = room.querySelector(selector);
    if (node) toolbar.append(node);
  }
  for (const selector of [
    ".dj-room-controls",
    ".venue-controls",
    ".uptown-controls",
    ".ballpark-controls",
    ".store-room-actions",
    ".city-nav",
  ]) {
    const node = room.querySelector(selector);
    if (node) context.append(node);
  }
  for (const selector of ["#scene", "#ink", "#loading", "#tip", ".catalog"]) {
    const node = room.querySelector(selector);
    if (node) stage.append(node);
  }
  const stations = room.querySelector(".stations"),
    fullscreen = room.querySelector(".fullscreen-exit-bar");
  room.prepend(toolbar, context, stage);
  room.append(fullscreen, stations);
  const toggle = document.createElement("button");
  toggle.id = "world-menu-toggle";
  toggle.className = "tag";
  toggle.textContent = "Navigate";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "world-mobile-menu");
  room.querySelector(".room-tools").prepend(toggle);
  const menu = document.createElement("nav");
  menu.id = "world-mobile-menu";
  menu.hidden = true;
  menu.setAttribute("aria-label", "Immersive world navigation");
  const destinations = [
    [0, "Record Store"],
    [1, "DJ Booth"],
    [2, "Screening Room"],
    [5, "Merch Store"],
    [3, "Streets"],
    [6, "↑ WABN Radio"],
    [7, "↑ Studio ABN"],
  ];
  menu.innerHTML = `<div class="world-menu-heading"><b>WHERE TO?</b><button type="button" id="world-menu-close" aria-label="Close navigation">×</button></div><div class="world-destinations"><span class="world-floor-heading">FIRST FLOOR</span>${destinations.map(([id, name]) => `${id === 6 ? '<span class="world-floor-heading">SECOND FLOOR</span>' : ""}<button type="button" data-world-station="${id}">${name}</button>`).join("")}<button type="button" data-world-elevator>Elevator</button><a href="#record-shop/listen">Music archive</a></div><label class="world-landmark-picker">HOUSTON LANDMARK<select id="world-landmark"><option value="">Choose a landmark</option>${[...room.querySelectorAll("[data-city]")].map((button) => `<option value="${button.dataset.city}">${button.textContent}</option>`).join("")}</select></label><div class="world-menu-audio"><button type="button" id="world-audio-toggle">Play / pause music</button><button type="button" id="world-calm-toggle">Calm effects</button></div>`;
  room.append(menu);
  function closeMenu() {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
  lifetime.listen(toggle, "click", () => {
    menu.hidden = !menu.hidden;
    toggle.setAttribute("aria-expanded", String(!menu.hidden));
  });
  lifetime.listen(menu, "click", (event) => {
    const button = event.target.closest("button");
    if (button?.dataset.worldStation != null) {
      closeMenu();
      room
        .querySelector(`[data-station="${button.dataset.worldStation}"]`)
        ?.click();
    }
    if (button?.hasAttribute("data-world-elevator")) {
      closeMenu();
      room.querySelector("#store-elevator")?.click();
    }
    if (button?.id === "world-menu-close") closeMenu();
    if (button?.id === "world-audio-toggle")
      document.querySelector("#play").click();
    if (button?.id === "world-calm-toggle") room.querySelector("#calm").click();
    if (event.target.closest("a")) closeMenu();
  });
  lifetime.listen(menu, "change", (event) => {
    if (event.target.id !== "world-landmark" || !event.target.value) return;
    const value = event.target.value;
    closeMenu();
    room.querySelector('[data-station="3"]').click();
    room.querySelector(`[data-city="${value}"]`).click();
    event.target.value = "";
  });
  lifetime.listen(document, "truth-station", closeMenu);
  lifetime.listen(document, "fullscreenchange", closeMenu);
  lifetime.listen(document, "truth-fullscreen-change", closeMenu);
  const rotate = document.createElement("div");
  rotate.className = "world-orientation-hint";
  rotate.innerHTML =
    '<span>Turn your phone sideways for a wider view.</span><button type="button" aria-label="Dismiss rotation hint">×</button>';
  stage.append(rotate);
  lifetime.listen(rotate.querySelector("button"), "click", () => {
    rotate.hidden = true;
  });
  return {
    destroy() {
      lifetime.dispose();
      toggle.remove();
      menu.remove();
      rotate.remove();
      entry.remove();
      for (const node of original) room.append(node);
      toolbar.remove();
      context.remove();
      stage.remove();
    },
  };
}
