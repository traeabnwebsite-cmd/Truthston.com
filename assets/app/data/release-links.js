import { catalogIdentities } from "./catalog-identities.js";
const legacy = new Map(catalogIdentities.map((r) => [r.legacyIndex, r.id]));
export function releaseHash(release) {
  return "#release/" + encodeURIComponent(release.id);
}
export function resolveReleaseLink(releases, hash) {
  const canonical = hash.match(/^#release\/([^/]+)$/);
  if (canonical) {
    let id;
    try {
      id = decodeURIComponent(canonical[1]);
    } catch {
      return null;
    }
    return releases.find((r) => r.id === id) || null;
  }
  const numeric = hash.match(/^#release=(\d+)$/);
  if (!numeric) return null;
  const index = Number(numeric[1]);
  return (
    releases.find((r) => r.id === legacy.get(index)) || releases[index] || null
  );
}
