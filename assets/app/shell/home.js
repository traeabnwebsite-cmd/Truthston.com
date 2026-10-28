import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createHomeSummary({
  siteContent,
  today,
  releases,
  data,
  rand,
}) {
  const lifetime = createLifetime();

  if (siteContent.site?.homeIntro) {
    const p = $(".subline p");
    p.replaceChildren(
      document.createTextNode(siteContent.site.homeIntro),
      document.createElement("br"),
      document.createTextNode(
        siteContent.site.homeInvitation || "Come inside. Dig a little deeper.",
      ),
    );
  }
  $("#current-year").textContent = today.getFullYear();
  $("#release-count").textContent = releases.length;
  const mmdd =
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");
  const matches = data.timeline.filter(
    (t) => String(t.date).slice(5, 10) === mmdd,
  );
  const moment =
    matches[0] || data.timeline[Math.floor(rand() * data.timeline.length)];
  $("#day-label").textContent = matches.length
    ? "03 / On this day"
    : "03 / From the archive";
  $("#day-title").textContent = moment?.title || "The story keeps going.";
  $("#day-text").textContent = moment
    ? `${moment.date} / ${matches.length ? "Today in the archive." : "An archive date, selected for this visit."}`
    : "Add dated moments to release-data.js.";

  lifetime.handler($(".close"), "onclick", () => $("#modal").close());
  lifetime.listen($("#modal"), "click", (e) => {
    if (e.target === $("#modal")) $("#modal").close();
  });

  // Account and rewards preview: device-local only. Replace these events with verified API awards in production.

  return {
    destroy() {
      lifetime.dispose();
    },
  };
}
