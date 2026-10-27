export function createCmsApi({ getCsrf, fetcher = fetch }) {
  async function api(path, data, raw = false, offset = 0) {
    const res = await fetcher("/api/cms/" + path, {
      credentials: "same-origin",
      headers:
        data === undefined
          ? {}
          : {
              "Content-Type": raw
                ? "application/octet-stream"
                : "application/json",
              "X-CMS-CSRF": getCsrf(),
              ...(raw ? { "Upload-Offset": String(offset) } : {}),
            },
      ...(data === undefined
        ? {}
        : { method: "POST", body: raw ? data : JSON.stringify(data) }),
    });
    let result;
    try {
      result = await res.json();
    } catch {
      throw Error(
        "The publishing service is unavailable. Start the local preview launcher.",
      );
    }
    if (!res.ok) throw Error(result.error || "Publishing request failed.");
    return result;
  }
  return api;
}
