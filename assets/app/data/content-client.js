export async function loadPublicContent({ fetcher = fetch } = {}) {
  let siteContent = {
    site: {},
    articles: [],
    photos: [],
    events: [],
    projects: [],
    products: [],
  };
  for (const endpoint of ["/api/content", "assets/content/site.json"]) {
    try {
      const res = await fetcher(endpoint, {
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) continue;
      const incoming = await res.json();
      if (incoming.schemaVersion !== 1) continue;
      siteContent = incoming;
      break;
    } catch {}
  }
  return siteContent;
}
export async function loadOptionalCatalog({
  fetcher = fetch,
  doc = document,
} = {}) {
  try {
    const response = await fetcher("release-data.js", {
      method: "HEAD",
      signal: AbortSignal.timeout(1200),
    });
    if (
      !response.ok ||
      !/(?:javascript|ecmascript)/i.test(
        response.headers.get("content-type") || "",
      )
    )
      return false;
    return await new Promise((resolve) => {
      const s = doc.createElement("script");
      s.src = "release-data.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      doc.head.append(s);
      setTimeout(() => resolve(false), 1200);
    });
  } catch {
    return false;
  }
}
