// Image identities, not article titles, own gallery uniqueness.
export async function loadGalleryCuration({ fetcher = fetch } = {}) {
  try {
    const response = await fetcher("assets/config/gallery-curation.json", {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.schemaVersion === 1) return data;
    }
  } catch {}
  return {
    identities: {},
    hashIdentities: {},
    preferredIds: [],
    excludedIds: [],
  };
}
function assetIdentity(photo) {
  const source = photo.fullSrc || photo.src;
  if (!source) return "";
  try {
    const url = new URL(source, "https://gallery.local/");
    for (const name of [...url.searchParams.keys()])
      if (/^(?:utm_|w$|h$|width$|height$|quality$|q$|fit$)/.test(name))
        url.searchParams.delete(name);
    return url.href;
  } catch {
    return source;
  }
}
export function uniqueGalleryPhotos(photos, curation = {}) {
  const excluded = new Set(curation.excludedIds || []),
    preferred = new Set(curation.preferredIds || []),
    groups = new Map();
  for (const photo of photos) {
    if (!photo || excluded.has(photo.id) || !assetIdentity(photo)) continue;
    const hash = photo.contentHash || curation.contentHashes?.[photo.id];
    const identity =
      curation.identities?.[photo.id] ||
      curation.hashIdentities?.[hash] ||
      (hash ? "sha256:" + hash : "asset:" + assetIdentity(photo));
    const prior = groups.get(identity);
    if (!prior || (preferred.has(photo.id) && !preferred.has(prior.id)))
      groups.set(identity, photo);
  }
  return [...groups.values()];
}
