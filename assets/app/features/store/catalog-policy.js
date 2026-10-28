export const releasePrices = Object.freeze({
  album: 1599,
  single: 199,
  mixtape: 599,
  ep: 399,
});

export function releaseKind(release) {
  const type = String(release.type || release.category || "").toLowerCase();
  if (/single/.test(type)) return "single";
  if (/\bep\b|extended play/.test(type)) return "ep";
  if (/mixtape/.test(type)) return "mixtape";
  return "album";
}
export const priceForRelease = (release) => releasePrices[releaseKind(release)];
export const releaseKey = (release) =>
  release.cmsProjectId || `${release.title}|${release.year}`;
export function chronologicalReleases(releases) {
  const date = (r) =>
    String(r.date || r.best_date || `${r.year || "9999"}-01-01`);
  return [...releases].sort(
    (a, b) => date(a).localeCompare(date(b)) || a.title.localeCompare(b.title),
  );
}
export const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;
export function radioCollections(releases) {
  const sorted = chronologicalReleases(releases);
  return [
    {
      id: "rotation",
      name: "The ABN Rotation",
      note: "Across the catalog. Every era, in order.",
      releases: sorted,
    },
    {
      id: "mixtapes",
      name: "Mixtape Motion",
      note: "The tapes. The streets. The foundation.",
      releases: sorted.filter((r) => releaseKind(r) === "mixtape"),
    },
    {
      id: "albums",
      name: "Album Sessions",
      note: "Full projects, from the beginning.",
      releases: sorted.filter((r) => releaseKind(r) === "album"),
    },
    {
      id: "singles",
      name: "Singles & Signals",
      note: "Singles and EPs from across the years.",
      releases: sorted.filter((r) => ["single", "ep"].includes(releaseKind(r))),
    },
  ];
}
