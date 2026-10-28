import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createExperienceMode({ appState, getWorld, getWorldLoader }) {
  const lifetime = createLifetime();

  function setMode(m) {
    appState.mode = m;
    document.body.classList.toggle("flat", m !== "immersive");
    $$("[data-mode]").forEach((b) =>
      b.classList.toggle("active", b.dataset.mode === m),
    );
    if (m === "reduced") setCalm(true);
    if(m==='immersive' && !getWorld())document.body.classList.add('flat');
    syncWorld();
  }
  function syncWorld(){
    if(appState.mode!=='immersive'||document.body.classList.contains('account-view')){getWorld()?.suspend();return;}
    if(getWorld())getWorld().resume();else getWorldLoader()?.load();
  }

  function setCalm(v) {
    appState.calm = v;
    document.body.classList.toggle("calm", v);
    $("#calm").setAttribute("aria-pressed", v);
  }
  setCalm(appState.calm);
  $$("[data-mode]").forEach((b) =>
    lifetime.handler(b, "onclick", () => setMode(b.dataset.mode)),
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
