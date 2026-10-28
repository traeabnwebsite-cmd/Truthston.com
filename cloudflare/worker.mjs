import { companionResponse } from "./companion.mjs";
import { platformCapabilities } from "./capabilities.mjs";
/// <reference path="../worker-configuration.d.ts" />
// Deployment shell. Consumer auth, payments and premium delivery are deliberately unconfigured.
// No browser-submitted stamp count or balance is accepted as an authoritative reward.
/** @param {unknown} value @param {number} status @param {Record<string,string>} extraHeaders */
function json(value, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders,
    },
  });
}
export default {
  /** @param {Request} request @param {Env} env */
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/content") {
      if (!["GET", "HEAD"].includes(request.method))
        return json({ error: "Method not allowed" }, 405, {
          Allow: "GET, HEAD",
        });
      return env.ASSETS.fetch(
        new Request(new URL("/assets/content/site.json", url), {
          method: request.method,
        }),
      );
    }
    if (/^\/api\/(cms|projects)(\/|$)/.test(url.pathname))
      return json(
        {
          error:
            "Production publishing and catalog delivery are not configured. Use the local team console.",
        },
        503,
      );
    if (url.pathname === "/api/companion")
      return companionResponse(request, env);
    if (url.pathname === "/api/health") {
      if (!["GET", "HEAD"].includes(request.method))
        return json({ error: "Method not allowed" }, 405, {
          Allow: "GET, HEAD",
        });
      let release = null;
      try {
        const manifest = await env.ASSETS.fetch(
          new Request(new URL("/release-manifest.json", url)),
        );
        if (manifest.ok) {
          const value = await manifest.json();
          if (
            value &&
            typeof value === "object" &&
            "current" in value &&
            value.current &&
            typeof value.current === "object" &&
            "id" in value.current &&
            typeof value.current.id === "string" &&
            /^[a-f0-9]{20}$/.test(value.current.id)
          )
            release = value.current.id;
        }
      } catch {
        /* Static/release diagnostics may be unavailable; do not fabricate a release. */
      }
      const response = json({
        service: "trae-tha-truth",
        mode: env.SITE_MODE || "prototype",
        memberships: "not-configured",
        payments: "not-configured",
        release,
        capabilities: platformCapabilities,
      });
      return request.method === "HEAD"
        ? new Response(null, response)
        : response;
    }
    if (
      /^\/api\/(member|auth|checkout|webhooks|media|rewards)(\/|$)/.test(
        url.pathname,
      ) ||
      url.pathname.startsWith("/media/")
    ) {
      return json(
        { error: "Membership service is not configured in this prototype." },
        503,
      );
    }
    if (url.pathname.startsWith("/api/"))
      return json({ error: "Not found" }, 404);
    return env.ASSETS.fetch(request);
  },
};
