import { $, $$, esc } from "../../core/dom.js";
import {
  houstonToday,
  validDateKey,
  shiftDay,
  shiftMonth,
  monthGrid,
  calendarEvents,
  eventsForDay,
  dateLabel,
  eventToICS,
} from "./calendar-data.js";
export function createEventCalendar({
  events,
  title = "Mark the date.",
  intro = "Shows, community days, releases and moments to be there for.",
  now = () => new Date(),
}) {
  const entries = calendarEvents(events);
  let today = houstonToday(now());
  const downloads = new Set();
  let selected = today,
    month = today.slice(0, 7),
    category = "All";
  const filtered = () =>
    entries.filter((e) => category === "All" || e.category === category);
  function eventCard(event) {
    const past = event.endDate < today;
    return `<article class="calendar-event"><span class="calendar-event-type">${esc(event.category || "Event")} · ${past ? "PAST DATE" : "UPCOMING"}</span><h3>${esc(event.title)}</h3><p>${esc(event.startDate === event.endDate ? dateLabel(event.startDate) : dateLabel(event.startDate) + " — " + dateLabel(event.endDate))}<br>${esc(event.venue || "Location to be announced")}</p>${event.description ? `<p>${esc(event.description)}</p>` : ""}<div class="calendar-event-links"><button data-calendar-save="${esc(event.id)}">Add to calendar ↓</button>${/^https?:\/\//.test(event.sourceUrl || "") ? `<a href="${esc(event.sourceUrl)}" target="_blank" rel="noopener noreferrer">${esc(event.sourceName || "Event details")} ↗</a>` : ""}</div></article>`;
  }
  function render() {
    today = houstonToday(now());
    const visible = filtered(),
      days = eventsForDay(visible, selected),
      next = visible.filter((e) => e.endDate >= today).slice(0, 3),
      monthTitle = dateLabel(month + "-01", { day: undefined }),
      lastEvent = entries.at(-1),
      categories = [
        "All",
        ...new Set(entries.map((e) => e.category).filter(Boolean)),
      ];
    return `<section class="calendar-page" aria-label="Events calendar"><div class="editorial-hero"><div><span class="journal-kicker">THE DATES / HOUSTON & BEYOND</span><h1>${esc(title)}</h1><p>${esc(intro)}</p></div><div class="calendar-timezone">HOUSTON TIME<small>America / Chicago</small></div></div><div class="calendar-toolbar"><div class="calendar-month-controls"><button data-calendar-shift="-1" aria-label="Previous month">←</button><h2 id="calendar-month" aria-live="polite">${esc(monthTitle)}</h2><button data-calendar-shift="1" aria-label="Next month">→</button><button id="calendar-today">Today</button></div><div class="calendar-pickers"><label>JUMP TO MONTH<input type="month" id="calendar-jump" value="${month}" aria-label="Choose calendar month"></label><label>EVENT TYPE<select id="calendar-category">${categories.map((c) => `<option value="${esc(c)}" ${c === category ? "selected" : ""}>${esc(c === "All" ? "All events" : c)}</option>`).join("")}</select></label></div></div><div class="calendar-layout"><div class="calendar-month"><table class="event-month-grid"><caption class="accessible">${esc(monthTitle)} event calendar. Use arrow keys to move between dates.</caption><thead><tr>${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<th scope="col">${d}</th>`).join("")}</tr></thead><tbody>${monthGrid(
      month,
    )
      .map(
        (week) =>
          `<tr>${week
            .map((key) => {
              if (!key)
                return '<td class="calendar-blank" aria-hidden="true"></td>';
              const matches = eventsForDay(visible, key);
              return `<td class="${key === selected ? "is-selected " : ""}${key === today ? "is-today" : ""}"><button data-calendar-day="${key}" tabindex="${key === selected ? 0 : -1}" aria-label="${esc(dateLabel(key, { weekday: "long" }))}; ${matches.length ? matches.length + " event" + (matches.length === 1 ? "" : "s") : "no events"}" aria-pressed="${key === selected}" ${key === today ? 'aria-current="date"' : ""}><span class="calendar-day-number">${Number(key.slice(-2))}</span>${
                matches.length
                  ? `<span class="calendar-count">${matches.length}</span><span class="calendar-cell-events">${matches
                      .slice(0, 2)
                      .map((e) => `<span>${esc(e.title)}</span>`)
                      .join("")}</span>`
                  : ""
              }</button></td>`;
            })
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table><p class="calendar-legend"><i></i> Published event date <span>Today: ${esc(dateLabel(today))}</span></p>${lastEvent ? `<button class="calendar-archive" id="calendar-latest" data-date="${lastEvent.startDate}">Browse the latest published date · ${esc(dateLabel(lastEvent.startDate))} ↗</button>` : ""}</div><aside class="calendar-agenda"><div class="calendar-selected-heading"><span class="journal-kicker">SELECTED DATE</span><h2>${esc(dateLabel(selected, { year: undefined }))}</h2></div><div aria-live="polite">${days.length ? days.map(eventCard).join("") : '<p class="calendar-empty">No events have been published for this date.</p>'}</div><section class="calendar-next"><span class="journal-kicker">NEXT UP</span>${next.length ? next.map((e) => `<button class="calendar-upcoming" data-calendar-open="${e.startDate}"><small>${esc(dateLabel(e.startDate))}</small><b>${esc(e.title)}</b><span>${esc(e.venue || "")}</span></button>`).join("") : "<p>No upcoming dates have been published.</p>"}</section></aside></div></section>`;
  }
  function bind(rerender) {
    const show = (key, focus = false) => {
      selected = key;
      month = key.slice(0, 7);
      rerender();
      if (focus) $(`[data-calendar-day="${key}"]`)?.focus();
    };
    $$("[data-calendar-shift]").forEach(
      (b) =>
        (b.onclick = () =>
          show(shiftMonth(month, Number(b.dataset.calendarShift)) + "-01")),
    );
    $("#calendar-today").onclick = () => show(houstonToday(now()));
    $("#calendar-jump").onchange = (e) => {
      if (validDateKey(e.target.value + "-01")) show(e.target.value + "-01");
    };
    $("#calendar-category").onchange = (e) => {
      category = e.target.value;
      rerender();
    };
    $$("[data-calendar-day]").forEach((b) => {
      b.onclick = () => show(b.dataset.calendarDay, true);
      b.onkeydown = (e) => {
        const moves = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: -7,
          ArrowDown: 7,
        };
        if (e.key in moves) {
          e.preventDefault();
          show(shiftDay(b.dataset.calendarDay, moves[e.key]), true);
        }
      };
    });
    $$("[data-calendar-open]").forEach(
      (b) => (b.onclick = () => show(b.dataset.calendarOpen)),
    );
    if ($("#calendar-latest"))
      $("#calendar-latest").onclick = (e) => show(e.currentTarget.dataset.date);
    $$("[data-calendar-save]").forEach(
      (b) =>
        (b.onclick = () => {
          const event = entries.find((e) => e.id === b.dataset.calendarSave),
            url = URL.createObjectURL(
              new Blob([eventToICS(event, now())], {
                type: "text/calendar;charset=utf-8",
              }),
            ),
            link = document.createElement("a");
          downloads.add(url);
          link.href = url;
          link.download = "truthston-" + event.id + ".ics";
          link.click();
          setTimeout(() => {
            URL.revokeObjectURL(url);
            downloads.delete(url);
          }, 1000);
        }),
    );
  }
  return { render, bind, destroy() {} };
}
