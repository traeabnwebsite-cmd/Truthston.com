import { formatPrice, priceForRelease } from "./catalog-policy.js";
export const artistAliases = {
  "Trae tha Truth": ["trae tha truth", "trae the truth", "trae"],
  "6 Tre G": ["6 tre g", "6treg", "6 tre", "six tre g"],
  "Guerilla Maab": ["guerilla maab", "guerrilla maab", "g maab"],
  "Dougie D": ["dougie d", "dougied"],
  ABN: ["abn", "a b n", "assholes by nature", "asshole by nature"],
};
export const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function answerReign(question, database, releases = []) {
  const text = normalize(question);
  if (!text)
    return {
      text: "What are you looking for? Ask me about a release, tracklist, artist, or price.",
      records: [],
    };
  if (/^(hi|hey|hello|what s up|who are you)$/.test(text))
    return {
      text: "Hey, I’m Reign. I run the ABN checkout. Ask me about Trae, 6 Tre G, Guerilla Maab, Dougie D or ABN—or let’s find your next record.",
      records: [],
    };
  if (/\b(price|prices|cost|buy|purchase|checkout|pay|free)\b/.test(text)) {
    const match = releases.find((r) => text.includes(normalize(r.title)));
    return {
      text: match
        ? `${match.title} is listed at ${formatPrice(priceForRelease(match))} for paid launch. Right now it’s free-preview mode: your crate can be saved, and no payment is collected.`
        : "Albums are $15.99, mixtapes $5.99, EPs $3.99, and singles $1.99 at paid launch. Everything is free for now while memberships and checkout are being connected. Bring your selected releases to my counter.",
      records: [],
    };
  }
  if (/\b(radio|wabn)\b/.test(text))
    return {
      text: "WABN Radio is upstairs. Choose The ABN Rotation, Mixtape Motion, Album Sessions, or Singles & Signals. Connected tracks play free; the full vault is still being connected.",
      records: [],
    };
  const records = database.records || [];
  const artist = Object.entries(artistAliases).find(([, aliases]) =>
    aliases.some((alias) => ` ${text} `.includes(` ${normalize(alias)} `)),
  )?.[0];
  const artistMatches = (record) =>
    !artist ||
    (record.artists || [record.artist]).some((name) =>
      artistAliases[artist].some((alias) =>
        normalize(name).includes(normalize(alias)),
      ),
    );
  let candidates = records.filter(artistMatches);
  const stop = new Set(
    "tell me about the a an what when was is are by of do you have any can find give information music for album albums mixtape mixtapes ep single singles release releases track tracks tracklist list songs song please show know all every discography and on from did come out latest first year".split(
      " ",
    ),
  );
  let remainder = text;
  if (artist)
    for (const alias of [...artistAliases[artist]].sort(
      (a, b) => b.length - a.length,
    ))
      remainder = remainder.replace(normalize(alias), " ");
  const terms = remainder
    .split(/\s+/)
    .filter((word) => word && !stop.has(word));
  const scored = candidates
    .map((record) => {
      const title = normalize(record.title),
        tracks = normalize((record.tracks || []).join(" "));
      const score =
        (title === terms.join(" ") ? 100 : 0) +
        terms.reduce(
          (sum, term) =>
            sum + (title.includes(term) ? 4 : tracks.includes(term) ? 1 : 0),
          0,
        );
      return { record, score };
    })
    .filter(
      (row) =>
        !terms.length ||
        terms.every((term) =>
          normalize(
            row.record.title + " " + (row.record.tracks || []).join(" "),
          ).includes(term),
        ),
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.record.date).localeCompare(String(b.record.date)),
    );
  if (!scored.length)
    return {
      text: `I don’t have a sourced match for that in my current catalog${artist ? " for " + artist : ""}. Try a release title or artist name. I won’t make up a tracklist; this database grows as the team reconciles the vault.`,
      records: [],
    };
  if (/\blatest\b/.test(text))
    scored.sort((a, b) =>
      String(b.record.date).localeCompare(String(a.record.date)),
    );
  const matches = scored
    .slice(0, terms.length ? 3 : 8)
    .map((row) => row.record);
  const lead = matches[0];
  if (terms.length && matches[0] && scored[0].score >= terms.length * 4) {
    return {
      text: `${lead.title} — ${lead.artist}. Catalog date: ${lead.date || "not recorded"}. ${lead.type || "Release"}.${lead.label ? " Label/rights credit: " + lead.label + "." : ""}${lead.tracks?.length ? "\n\nTracklist:\n" + lead.tracks.map((track, i) => `${i + 1}. ${track}`).join("\n") : " The tracklist is not in my database yet."}`,
      records: matches.slice(0, 1),
    };
  }
  return {
    text: `${artist ? "Here’s what I have indexed for " + artist : "Here are the closest catalog matches"}: ${scored.length} matching release records. These can include editions and features. I’m showing ${matches.length}${/latest/.test(text) ? " with the latest catalog dates first" : " in catalog-date order"}. Ask for a specific title to see its tracklist. Coverage is still being reconciled with the vault.`,
    records: matches,
  };
}
