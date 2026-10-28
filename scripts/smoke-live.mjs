// Read-only deployment smoke. Never mutates staff/member/payment state.
import assert from "node:assert/strict";
const origin = new URL(process.argv[2] || "https://www.truthston.com/");
if (
  !["http:", "https:"].includes(origin.protocol) ||
  origin.username ||
  origin.password
)
  throw Error("Use an HTTP(S) origin without credentials.");
async function get(path, options = {}) {
  return fetch(new URL(path, origin), {
    redirect: "error",
    signal: AbortSignal.timeout(20000),
    ...options,
  });
}
const healthResponse = await get("/api/health");
assert.equal(healthResponse.status, 200);
const health = await healthResponse.json();
const manifestResponse = await get("/release-manifest.json");
assert.equal(manifestResponse.status, 200);
const manifest = await manifestResponse.json();
assert.match(manifest.current.id, /^[a-f0-9]{20}$/);
if (health.release) assert.equal(health.release, manifest.current.id);
const html = await (await get("/")).text();
assert.ok(html.includes(manifest.current.prefix), "HTML/code release mismatch");
const checks = [];
for (const release of [manifest.current, manifest.retained].filter(Boolean)) {
  const path = "/" + release.prefix + "/app/main.js";
  const r = await get(path, { method: "HEAD" });
  assert.equal(r.status, 200, path);
  checks.push({ path, status: r.status });
}
for (const path of [
  "/api/member/credits",
  "/api/cms",
  "/media/not-a-real-paid-track.mp3",
]) {
  const r = await get(path);
  assert.equal(r.status, 503, path);
  checks.push({ path, status: r.status });
}
assert.equal(
  (await get("/assets/missing-truthston-audit-file.js")).status,
  404,
);
const app = await (await get("/assets/truthston.webmanifest")).json();
for (const icon of app.icons || [])
  assert.equal((await get(icon.src, { method: "HEAD" })).status, 200, icon.src);
console.log(
  JSON.stringify(
    {
      origin: origin.origin,
      release: manifest.current.id,
      sourceRevision: manifest.sourceRevision || null,
      retained: manifest.retained?.id || null,
      health,
      checks,
      result: "pass",
    },
    null,
    2,
  ),
);
