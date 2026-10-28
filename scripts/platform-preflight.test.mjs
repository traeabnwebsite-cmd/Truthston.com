import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { platformPreflight } from "./platform-preflight.mjs";
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "truthston-preflight-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const put = async (path, value) => {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(
      join(root, path),
      typeof value === "string" ? value : JSON.stringify(value),
    );
  };
  await put("wrangler.jsonc", {
    name: "production",
    routes: [{ pattern: "truthston.com/*" }],
  });
  await put("wrangler.staging.jsonc", { name: "staging", routes: [] });
  await put("assets/content/site.json", {
    articles: [{ id: "published" }],
    photos: [],
    events: [],
    projects: [],
    products: [],
  });
  await put("content/editorial.json", {
    articles: [
      { id: "published", status: "published" },
      { id: "private", status: "draft" },
    ],
  });
  await put("assets/config/gallery-curation.json", {});
  await put("public/release-manifest.json", {
    current: { id: "current", prefix: "assets/releases/current" },
    retained: { id: "previous", prefix: "assets/releases/previous" },
  });
  for (const id of ["current", "previous"])
    for (const file of ["app/main.js", "styles/index.css"])
      await put("public/assets/releases/" + id + "/" + file, "");
  await put("public/assets/truthston.webmanifest", { icons: [] });
  return { root, put };
}
test("preflight separates editorial drafts, public inventory and actual service implementation", async (t) => {
  const { root } = await fixture(t);
  const r = await platformPreflight(root);
  assert.deepEqual(r.problems, []);
  assert.equal(r.content.articles.drafts, 1);
  assert.equal(r.content.articles.publishedSnapshot, 1);
  assert.equal(r.commercialLaunchReady, false);
  assert.equal(r.capabilities.billing, "not-configured");
});
test("preflight fails on shared environments, leaked master media and broken retained release", async (t) => {
  const { root, put } = await fixture(t);
  await put("wrangler.staging.jsonc", {
    name: "production",
    routes: [{ pattern: "truthston.com/*" }],
  });
  await put("public/assets/master.mp3", "private");
  await rm(join(root, "public/assets/releases/previous/app/main.js"));
  const r = await platformPreflight(root);
  assert.ok(r.problems.some((x) => x.includes("Staging")));
  assert.ok(r.problems.some((x) => x.includes("master.mp3")));
  assert.ok(r.problems.some((x) => x.includes("previous/app/main.js")));
});

test('cloud checkout need not contain the deliberately private local editorial database',async(t)=>{
 const {root}=await fixture(t);await rm(join(root,'content/editorial.json'));
 const r=await platformPreflight(root);assert.deepEqual(r.problems,[]);assert.equal(r.editorialSourceAvailable,false);assert.equal(r.content.articles.editorialTotal,null);assert.equal(r.content.articles.drafts,null);assert.equal(r.content.articles.publishedSnapshot,1);
});
