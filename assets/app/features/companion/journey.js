import { $ as query, $$, esc } from "../../core/dom.js";
export function createCompanionJourney({
  $ = query,
  state,
  lifetime,
  root,
  home,
  portalWait,
  pose,
  appState,
  getWorld,
  setMode,
  showThought,
  cancelSequence,
  closeChat,
  worldTools,
  dockHome,
  attach,
  character,
  go,
  cinema,
  constrainThought,
}) {
  function setPortalState(phase) {
    state.portalPhase = phase;
    root.dataset.journey = phase;
    home.dataset.journey = phase;
    if (phase !== "outside")
      $("#companion-portal-marker").setAttribute("aria-expanded", "false");
    $("#companion-portal-marker").setAttribute(
      "aria-label",
      state.inWorld
        ? "Call the companion back upstairs"
        : "Companion doorway. Choose where to meet him.",
    );
    $("#companion-portal-marker span").textContent = state.inWorld
      ? "CALL HIM BACK"
      : "CALL TRAE OUT";
  }
  async function emerge() {
    const token = ++state.portalToken;
    setPortalState("arriving");
    root.classList.add("portal-born");
    home.classList.add("door-present");
    await portalWait(650);
    if (token !== state.portalToken) return;
    home.classList.add("door-open");
    await portalWait(1000);
    if (token !== state.portalToken) return;
    root.classList.remove("portal-born");
    root.classList.add("portal-emerging");
    pose(0);
    await portalWait(1900);
    if (token !== state.portalToken) return;
    home.classList.remove("door-open");
    pose(3);
    await portalWait(700);
    if (token !== state.portalToken) return;
    home.classList.remove("door-present");
    root.classList.remove("portal-emerging");
    setPortalState("outside");
    pose(0);
    if (appState.station === 2 && !state.inWorld) enterPortal(2);
  }
  async function enterPortal(destination = 0) {
    if (state.hidden) return;
    if (["entering", "arriving"].includes(state.portalPhase)) return;
    if (!getWorld()) {
      setMode("standard");
      showThought(
        "The room is in Standard mode. You can still chat and explore the archive.",
        "crate",
      );
      return;
    }
    const token = ++state.portalToken;
    cancelSequence();
    closeChat();
    $("#companion-portal-menu").hidden = true;
    $("#companion-bubble").hidden = true;
    state.inWorld = false;
    getWorld().setGuideVisible?.(false);
    root.classList.remove("companion-in-world");
    worldTools.hidden = true;
    dockHome();
    home.classList.add("door-present", "door-open");
    setPortalState("entering");
    pose(4);
    await portalWait(650);
    if (token !== state.portalToken) return;
    root.classList.add("portal-entering");
    await portalWait(800);
    if (token !== state.portalToken) return;
    home.classList.remove("door-open");
    await portalWait(550);
    if (token !== state.portalToken) return;
    home.classList.remove("door-present");
    root.classList.remove("portal-entering");
    state.inWorld = true;
    state.homeDocked = false;
    setPortalState("inside");
    root.classList.add("companion-in-world");
    attach();
    character.setAttribute("aria-hidden", "true");
    character.tabIndex = -1;
    setMode("immersive");
    go(destination);
    getWorld().guideTravel?.(destination);
    worldTools.hidden = false;
    $(".room-wrap").scrollIntoView({
      behavior: appState.calm ? "auto" : "smooth",
      block: "start",
    });
  }
  async function returnFromWorld() {
    if (state.portalPhase === "entering") return;
    state.portalToken++;
    state.inWorld = false;
    if (appState.station === 2) go(0);
    state.worldSeat = false;
    state.rig?.cinema?.(false, false);
    getWorld()?.setGuideVisible?.(false);
    root.classList.remove("companion-in-world", "portal-entering");
    character.removeAttribute("aria-hidden");
    character.tabIndex = 0;
    worldTools.hidden = true;
    dockHome();
    $(".intro").scrollIntoView({
      behavior: appState.calm ? "auto" : "smooth",
      block: "start",
    });
    emerge();
  }
  function guideArrived(seated) {
    state.worldSeat = seated;
    state.rig?.cinema?.(seated, Boolean(cinema.state?.playing));
    if (!seated) pose(3);
  }
  function guidePosition(x, y, visible) {
    if (!state.inWorld) return;
    root.style.position = "fixed";
    root.style.left = x - 66 + "px";
    root.style.top = y - 176 + "px";
    root.style.bottom = "auto";
    root.style.visibility = visible ? "visible" : "hidden";
    constrainThought();
  }
  return {
    setPortalState,
    emerge,
    enterPortal,
    returnFromWorld,
    guideArrived,
    guidePosition,
  };
}
