import { $, $$, esc } from "../core/dom.js";
import { createLifetime } from "../core/lifecycle.js";
export function createCommunityPages({ data, modal, today, twin }) {
  const lifetime = createLifetime();

  function timeline(year) {
    const items = data.timeline.filter(
      (t) =>
        Number(String(t.date).slice(0, 4)) === year || Number(t.year) === year,
    );
    modal(
      `<span class="eyebrow">THE BACK DOOR / TRUTHSTON, TEXAS</span><h2>${year || "Every year. A chapter."}</h2>${year ? `<p>${items.length ? items.map((t) => esc(t.title)).join("<br>") : "No archive entries for this year yet."}</p>` : ""}<div class="year-grid">${Array.from({ length: today.getFullYear() - 1979 }, (_, i) => `<button data-year="${1980 + i}">${1980 + i}</button>`).join("")}</div>`,
    );
    $$("[data-year]").forEach(
      (b) => (b.onclick = () => timeline(+b.dataset.year)),
    );
  }
  for (let y = 1980; y <= today.getFullYear(); y++)
    twin("Houston street year " + y, () => timeline(y));
  function giving(i) {
    modal(
      `<span class="eyebrow">THE GIVING WING / COMMUNITY FIRST</span><h2>${i === undefined ? "More than music." : esc(data.giving[i].name)}</h2><p>${i === undefined ? "A city is only as strong as the people who show up for it." : esc(data.giving[i].description)}</p><div class="map" aria-label="Stylised Houston map">${data.giving.map((p, k) => `<button class="pin" style="left:${Number(p.x) || 15 + k * 8}%;top:${Number(p.y) || 20 + k * 6}%" data-pin="${k}" aria-label="${esc(p.name)}">${k + 1}</button>`).join("")}</div><p>COMMUNITY LEDGER · DEMONSTRATION<br>${data.giving.length} map pins / 3 community initiatives / No live totals</p>`,
    );
    $$("[data-pin]").forEach((b) => (b.onclick = () => giving(+b.dataset.pin)));
  }
  data.giving.forEach((p, i) =>
    twin(p.name + " community pin " + (i + 1), () => giving(i)),
  );
  twin("Community ledger", () => giving());
  return {
    timeline,
    giving,
    destroy() {
      lifetime.dispose();
    },
  };
}
