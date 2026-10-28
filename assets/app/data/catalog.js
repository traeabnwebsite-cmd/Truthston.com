import { catalogIdentities } from "./catalog-identities.js";
// Keeps numeric deep links and title:year preview identities unchanged.
export function prepareCatalog({
  supplied,
  embeddedVault,
  siteContent,
  sample,
  cover,
}) {
  const identities = new Map(catalogIdentities.map((r) => [r.legacyKey, r]));
  supplied = structuredClone(supplied);
  const data = Array.isArray(supplied)
    ? { ...sample, releases: supplied }
    : { ...sample, ...supplied };
  data.releases = (data.releases || sample.releases).filter(
    (r) => r && r.title,
  );
  if (!data.releases.length) data.releases = sample.releases;
  for (const project of siteContent.projects || []) {
    const entry = {
      title: project.title,
      year: Number(project.date?.slice(0, 4)),
      date: project.date,
      type: project.type,
      cover: project.cover,
      tracks: project.tracks.map((t) => t.title),
      audioTracks: project.tracks,
      cmsProjectId: project.id,
      id: identities.get(project.legacyKey)?.id || project.id,
      access: project.access,
    };
    const i = data.releases.findIndex(
      (r) => r.title + "|" + r.year === project.legacyKey,
    );
    if (i >= 0) data.releases[i] = { ...data.releases[i], ...entry };
    else data.releases.unshift(entry);
  }
  const releases = data.releases;
  releases.forEach((r, i) => {
    const identity =
      identities.get(r.title + "|" + r.year) ||
      catalogIdentities.find((v) => v.cover && v.cover === r.cover);
    r.id ||=
      identity?.id ||
      r.cmsProjectId ||
      "local-" + encodeURIComponent(r.title + "|" + r.year);
    r.trackIds ||= r.audioTracks?.map((t) => t.id) || identity?.trackIds || [];
    r.art = cover(r.title, i);
    r.cover = r.cover || r.art;
    r.tracks = Array.isArray(r.tracks) ? r.tracks : [];
  });
  return { data, releases };
}
