import { $, $$, esc } from "../../core/dom.js";
export function createCompanionPromotions({
  state,
  lifetime,
  actions,
  constrainThought,
  cancelSequence,
  pose,
  later,
  still,
  releases,
  root,
}) {
  function showThought(text, action) {
    if (state.hidden) return;
    $("#companion-cta span").textContent = text;
    $("#companion-cta").setAttribute(
      "aria-label",
      text + " " + actions[action][0],
    );
    $("#companion-cta small").textContent = actions[action][0] + " ↗";
    $("#companion-cta").onclick = () => act(action);
    $("#companion-bubble").hidden = false;
    constrainThought();
    clearTimeout(showThought.timer);
    showThought.timer = lifetime.timeout(
      () => ($("#companion-bubble").hidden = true),
      12000,
    );
  }
  function perform(kind) {
    cancelSequence();
    state.poseLockUntil = performance.now() + 14500;
    $("#companion-bubble").hidden = true;
    if (kind === "boom") {
      pose(4, true);
      later(
        () => {
          pose(5);
          showThought(
            "Bring your own Bumpboxx. Find yours in the DJ booth.",
            "boom",
          );
        },
        still() ? 0 : 1200,
      );
      later(() => pose(4), 11000);
      later(() => pose(0), 13500);
    } else if (kind === "record") {
      state.activeProject =
        releases[(state.projectIndex++ * 7) % releases.length];
      pose(6);
      showThought(
        "From the backpack: " +
          state.activeProject.title +
          ". Dig into the project.",
        "record",
      );
      later(() => pose(0), 13000);
    } else if (kind === "merch") {
      pose(7, true);
      showThought(
        "Wear the truth. Explore the ABN collection in the merch shop.",
        "merch",
      );
      later(() => pose(3), 13000);
    } else {
      pose(7);
      showThought(
        "Join the site. Build your Stamp Book and keep up with future member drops.",
        "member",
      );
      later(() => pose(0), 13000);
    }
  }
  function act(key) {
    if (!actions[key]) return;
    $("#companion-bubble").hidden = true;
    root.classList.remove("companion-near");
    actions[key][1]();
  }
  return { showThought, perform, act };
}
