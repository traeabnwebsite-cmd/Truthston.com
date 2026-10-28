import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
import { createFullscreenSession } from "./fullscreen-session.js";
export function createFullscreen({ toast }) {
  const lifetime = createLifetime();
  const session = createFullscreenSession();
  let disposed = false,
    htmlOverflow = "",
    lastOrientation = innerWidth > innerHeight;

  const roomElement = $(".room-wrap"),
    fullscreenButton = $("#fullscreen"),
    fullscreenExit = $("#fullscreen-exit"),
    fullscreenBar = $(".fullscreen-exit-bar");
  let fullscreenScroll = { x: 0, y: 0 },
    fullscreenOverflow = "",
    fullscreenReturnFocus = null,
    fullscreenWasActive = false,
    fullscreenBusy = false;
  const fullscreenOverlays = [
    $("#modal"),
    $("#toast"),
    $(".accessible"),
    $(".room-caption"),
  ].map((node) => {
    const anchor = document.createComment("fullscreen return point");
    node.before(anchor);
    return { node, anchor };
  });
  const nativeFullscreenElement = () =>
    document.fullscreenElement || document.webkitFullscreenElement || null;
  const nativeRoomActive = () => {
    const element = nativeFullscreenElement();
    return (
      element === roomElement ||
      Boolean(element && roomElement.contains(element))
    );
  };
  const fullscreenActive = () => session.active || nativeRoomActive();
  function resizeViewport() {
    if (disposed) return;
    const next = innerWidth > innerHeight;
    if (next !== lastOrientation) {
      session.rotate();
      lastOrientation = next;
    }
    roomElement.style.setProperty(
      "--immersive-height",
      `${window.visualViewport?.height || innerHeight}px`,
    );
    roomElement.style.setProperty(
      "--immersive-width",
      `${window.visualViewport?.width || innerWidth}px`,
    );
    if (session.active) syncFullscreen();
  }
  function placeFullscreenOverlays(active) {
    for (const { node, anchor } of fullscreenOverlays) {
      const destination = active ? roomElement : anchor.parentNode;
      if (node.parentNode === destination) continue;
      const open = node.tagName === "DIALOG" && node.open,
        focus = document.activeElement;
      if (open) node.close();
      if (active) destination.append(node);
      else anchor.after(node);
      if (open) {
        node.showModal();
        if (focus && node.contains(focus)) focus.focus({ preventScroll: true });
      }
    }
  }
  function syncFullscreen() {
    if (disposed) return;
    const active = session.sync(nativeRoomActive());
    roomElement.classList.toggle(
      "fullscreen-fallback",
      active && !nativeRoomActive(),
    );
    document.documentElement.classList.toggle("world-fullscreen", active);
    document.body.classList.toggle("world-fullscreen", active);
    if (active) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    roomElement.classList.toggle("fullscreen-active", active);
    fullscreenButton.setAttribute("aria-pressed", String(active));
    fullscreenButton.setAttribute(
      "aria-label",
      active ? "Exit record store fullscreen" : "Enter record store fullscreen",
    );
    fullscreenButton.textContent = active
      ? "⛶ Exit fullscreen"
      : "⛶ Fullscreen";
    fullscreenBar.hidden = !active;
    placeFullscreenOverlays(active);
    if (!active && fullscreenWasActive) {
      document.body.style.overflow = fullscreenOverflow;
      document.documentElement.style.overflow = htmlOverflow;
      window.scrollTo(fullscreenScroll.x, fullscreenScroll.y);
      lifetime.frame(() => {
        if (!$("#modal").open) {
          const focus = fullscreenReturnFocus?.isConnected
            ? fullscreenReturnFocus
            : fullscreenButton;
          focus.focus({ preventScroll: true });
        }
      });
    }
    fullscreenWasActive = active;
    document.dispatchEvent(
      new CustomEvent("truth-fullscreen-change", { detail: { active } }),
    );
  }
  async function leaveFullscreen() {
    if (fullscreenBusy) return;
    fullscreenBusy = true;
    session.leave();
    try {
      if (nativeRoomActive()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        if (exit) await exit.call(document);
      }
      roomElement.classList.remove("fullscreen-fallback");
      syncFullscreen();
    } catch {
      toast("Use Escape or your browser fullscreen control to return.");
      syncFullscreen();
    } finally {
      fullscreenBusy = false;
    }
  }
  async function enterFullscreen({ native = true } = {}) {
    if (fullscreenBusy || disposed) return;
    if (session.active && nativeRoomActive()) return;
    fullscreenBusy = true;
    if (!session.active) {
      fullscreenScroll = { x: window.scrollX, y: window.scrollY };
      fullscreenOverflow = document.body.style.overflow;
      htmlOverflow = document.documentElement.style.overflow;
      fullscreenReturnFocus = document.activeElement;
    }
    session.begin();
    resizeViewport();
    try {
      const request =
        roomElement.requestFullscreen || roomElement.webkitRequestFullscreen;
      if (!request || !native) throw new Error("Fullscreen unavailable");
      if (roomElement.requestFullscreen)
        await request.call(roomElement, { navigationUI: "hide" });
      else await request.call(roomElement);
    } catch {
      session.fallback();
    } finally {
      syncFullscreen();
      fullscreenBusy = false;
    }
  }
  lifetime.handler(fullscreenButton, "onclick", () =>
    fullscreenActive() ? leaveFullscreen() : enterFullscreen(),
  );
  lifetime.handler(fullscreenExit, "onclick", leaveFullscreen);
  lifetime.listen(document, "fullscreenchange", syncFullscreen);
  lifetime.listen(document, "webkitfullscreenchange", syncFullscreen);
  lifetime.listen(document, "keydown", (e) => {
    if (e.key !== "Escape" || !fullscreenActive() || $("#modal").open) return;
    e.preventDefault();
    leaveFullscreen();
  });
  lifetime.listen(window, "resize", resizeViewport);
  lifetime.listen(window, "orientationchange", () => {
    session.rotate();
    resizeViewport();
  });
  if (window.screen?.orientation)
    lifetime.listen(window.screen.orientation, "change", () => {
      session.rotate();
      resizeViewport();
    });
  if (window.visualViewport)
    lifetime.listen(window.visualViewport, "resize", resizeViewport);
  // A rotation can cause a browser to drop native fullscreen. The next user
  // gesture can legally restore it, while the fixed immersive surface stays put.
  lifetime.listen(roomElement, "pointerdown", (event) => {
    if (event.target.closest?.("#fullscreen,#fullscreen-exit")) return;
    if (
      session.active &&
      !nativeRoomActive() &&
      roomElement.requestFullscreen &&
      !fullscreenBusy
    )
      void enterFullscreen();
  });
  resizeViewport();
  syncFullscreen();
  // Keep keyboard focus within CSS fullscreen; dialogs retain their native focus handling.
  lifetime.listen(document, "keydown", (e) => {
    if (
      e.key !== "Tab" ||
      !roomElement.classList.contains("fullscreen-fallback") ||
      $("#modal").open
    )
      return;
    const buttons = [
      ...roomElement.querySelectorAll(
        "button,a[href],input,select,textarea,[tabindex]",
      ),
    ].filter(
      (el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length,
    );
    if (!buttons.length) return;
    const first = buttons[0],
      last = buttons[buttons.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first ||
        !roomElement.contains(document.activeElement))
    ) {
      e.preventDefault();
      last.focus();
    } else if (
      !e.shiftKey &&
      (document.activeElement === last ||
        !roomElement.contains(document.activeElement))
    ) {
      e.preventDefault();
      first.focus();
    }
  });

  return {
    enter: enterFullscreen,
    leave: leaveFullscreen,
    isActive: fullscreenActive,
    destroy() {
      disposed = true;
      session.leave();
      document.documentElement.classList.remove("world-fullscreen");
      document.body.classList.remove("world-fullscreen");
      document.documentElement.style.overflow = htmlOverflow;
      lifetime.dispose();
      roomElement.classList.remove("fullscreen-fallback", "fullscreen-active");
      fullscreenBar.hidden = true;
      placeFullscreenOverlays(false);
      fullscreenOverlays.forEach(({ anchor }) => anchor.remove());
      document.body.style.overflow = fullscreenOverflow;
    },
  };
}
