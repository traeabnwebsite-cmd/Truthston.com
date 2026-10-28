import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createExperienceMode({
  appState,
  getWorld,
  getWorldLoader,
  enterImmersive = () => {},
}) {
  const lifetime = createLifetime();

  function setMode(m) {
    appState.mode = m;
    const loading = $("#loading");
    if (loading)
      loading.style.display =
        m === "immersive" && !getWorld() ? "grid" : "none";
    document.body.classList.toggle("flat", m !== "immersive");
    $$("[data-mode]").forEach((b) =>
      b.classList.toggle("active", b.dataset.mode === m),
    );
    if (m === "reduced") setCalm(true);
    if (m === "immersive" && !getWorld()) document.body.classList.add("flat");
    syncWorld();
    document.dispatchEvent(new Event("truth-mode"));
  }
  function syncWorld() {
    if (
      appState.mode !== "immersive" ||
      document.body.classList.contains("account-view") ||
      document.body.classList.contains("room-panel-view")
    ) {
      getWorld()?.suspend();
      return;
    }
    if (getWorld()) getWorld().resume();
    else getWorldLoader()?.load();
  }

  function setCalm(v) {
    appState.calm = v;
    document.body.classList.toggle("calm", v);
    $("#calm").setAttribute("aria-pressed", v);
  }
  setCalm(appState.calm);
  $$("[data-mode]").forEach((b) =>
    lifetime.handler(b, "onclick", () => {
      setMode(b.dataset.mode);
      if (
        b.dataset.mode === "immersive" &&
        matchMedia(
          "(max-width: 760px), (pointer: coarse), (max-height: 550px) and (max-width: 1000px)",
        ).matches
      )
        void enterImmersive();
    }),
  );
  lifetime.handler($("#calm"), "onclick", () => setCalm(!appState.calm));
  lifetime.listen(
    matchMedia("(prefers-reduced-motion: reduce)"),
    "change",
    (e) => {
      if (e.matches) {
        setCalm(true);
        setMode("reduced");
      }
    },
  );

  return {
    select: setMode,
    syncWorld,
    setCalm,
    destroy() {
      lifetime.dispose();
    },
  };
}
