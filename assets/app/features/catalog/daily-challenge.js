import { $ } from "../../core/dom.js";
export function createDailyChallenge({
  today,
  releases,
  appState,
  earn,
  toast,
}) {
  const dayKey = today.toLocaleDateString("en-CA");
  let stamped = false;
  try {
    const saved = JSON.parse(localStorage.getItem("truth-stamps") || "{}");
    appState.stamps = saved.count || 0;
    stamped = saved.day === dayKey;
  } catch {}
  const target =
    releases[
      (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) %
        releases.length
    ];
  $("#challenge").textContent = `Find the tape from ${target.year}.`;
  $("#stamps").textContent = appState.stamps + " HUNTS COMPLETED";
  return {
    tryComplete(r) {
      if (Number(r.year) === Number(target.year) && !stamped) {
        appState.stamps++;
        stamped = true;
        try {
          localStorage.setItem(
            "truth-stamps",
            JSON.stringify({ count: appState.stamps, day: dayKey }),
          );
        } catch {}
        $("#stamps").textContent = appState.stamps + " HUNTS COMPLETED";
        earn(15);
        toast("FOUND IT. A fresh stamp for the collection.");
      }
    },
  };
}
