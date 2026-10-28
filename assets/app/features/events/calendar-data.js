const iso = (date) => date.toISOString().slice(0, 10);
export function validDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(+date) && iso(date) === value;
}
export function houstonToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function shiftDay(key, amount) {
  if (!validDateKey(key)) throw new RangeError("Invalid calendar date");
  const date = new Date(key + "T12:00:00Z");
  date.setUTCDate(date.getUTCDate() + amount);
  return iso(date);
}
export function shiftMonth(month, amount) {
  if (!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month))
    throw new RangeError("Invalid calendar month");
  const date = new Date(month + "-01T12:00:00Z");
  date.setUTCMonth(date.getUTCMonth() + amount);
  return iso(date).slice(0, 7);
}
export function monthGrid(month) {
  const first = month + "-01";
  if (!validDateKey(first)) throw new RangeError("Invalid calendar month");
  const start = new Date(first + "T12:00:00Z").getUTCDay(),
    last = shiftDay(shiftMonth(month, 1) + "-01", -1),
    count = Number(last.slice(-2)),
    cells = Array.from(
      { length: Math.ceil((start + count) / 7) * 7 },
      (_, i) =>
        i < start || i >= start + count
          ? null
          : month + "-" + String(i - start + 1).padStart(2, "0"),
    );
  return Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7),
  );
}
export function calendarEvents(events) {
  return events
    .filter(
      (e) =>
        validDateKey(e.startDate) &&
        validDateKey(e.endDate || e.startDate) &&
        (e.endDate || e.startDate) >= e.startDate,
    )
    .map((e) => ({ ...e, endDate: e.endDate || e.startDate }))
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        String(a.title).localeCompare(String(b.title)),
    );
}
export function eventsForDay(events, key) {
  return calendarEvents(events).filter(
    (e) => e.startDate <= key && e.endDate >= key,
  );
}
export function dateLabel(key, options = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(key + "T12:00:00Z"));
}
const icalText = (value) =>
  String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\r", "")
    .replaceAll("\n", "\\n")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,");
function foldLine(line) {
  let rows = [],
    row = "",
    bytes = 0;
  const encoder = new TextEncoder();
  for (const char of line) {
    const n = encoder.encode(char).length;
    if (bytes + n > 75) {
      rows.push(row);
      row = " ";
      bytes = 1;
    }
    row += char;
    bytes += n;
  }
  rows.push(row);
  return rows.join(String.fromCharCode(13, 10));
}
export function eventToICS(event, now = new Date()) {
  const e = calendarEvents([event])[0];
  if (!e) throw new RangeError("Event needs valid dates");
  const uid =
    String(e.id || e.title).replace(/[^a-z0-9_.-]/gi, "-") + "@truthston.com";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Truthston.com//Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + uid,
    "DTSTAMP:" +
      now
        .toISOString()
        .replaceAll(/[-:]/g, "")
        .replace(/\.\d{3}/, ""),
    "DTSTART;VALUE=DATE:" + e.startDate.replaceAll("-", ""),
    "DTEND;VALUE=DATE:" + shiftDay(e.endDate, 1).replaceAll("-", ""),
    "SUMMARY:" + icalText(e.title),
    "LOCATION:" + icalText(e.venue),
    "DESCRIPTION:" + icalText(e.description),
    ...(e.sourceUrl ? ["URL:" + icalText(e.sourceUrl)] : []),
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ]
    .map(foldLine)
    .join("\r\n");
}
