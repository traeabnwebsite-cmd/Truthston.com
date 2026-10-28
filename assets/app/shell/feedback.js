import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createFeedback({ appState, getWorld }) {
  const lifetime = createLifetime();

  function toast(t) {
    $("#toast").textContent = t;
    $("#toast").style.display = "block";
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => ($("#toast").style.display = "none"), 3500);
  }
  function earn(n) {
    const old = appState.score;
    appState.score = Math.min(100, appState.score + n);
    $("#meter").style.width = appState.score + "%";
    $("#percent").textContent = appState.score + "%";
    $(".meter").setAttribute("aria-valuenow", appState.score);
    const labels = [
      "The back door is open.",
      "Amber lights are on.",
      "The giving wing glows green.",
      "The vault is lit. Houston forever.",
    ];
    for (let i = 0; i < 4; i++)
      if (old < (i + 1) * 25 && appState.score >= (i + 1) * 25) {
        $("#unlock").textContent = labels[i];
        toast(labels[i]);
        getWorld()?.unlock(i);
      }
  }
  function modal(html) {
    delete $("#modal").dataset.gallery;
    $("#modal-body").innerHTML = html;
    if (!$("#modal").open) $("#modal").showModal();
  }
  return {
    toast,
    earn,
    modal,
    destroy() {
      lifetime.dispose();
      clearTimeout(toast.timer);
      $("#toast").style.display = "none";
    },
  };
}
