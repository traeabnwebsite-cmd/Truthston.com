import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { platformCapabilities } from "../cloudflare/capabilities.mjs";
import { uniqueGalleryPhotos } from "../assets/app/features/editorial/gallery.js";

export async function platformPreflight(
  root = resolve(import.meta.dirname, ".."),
) {
  const json = async (path) =>
    JSON.parse(await readFile(resolve(root, path), "utf8"));
  const [production, staging, published, editorial, curation] =
    await Promise.all([
      json("wrangler.jsonc"),
      json("wrangler.staging.jsonc"),
      json("assets/content/site.json"),
      json("content/editorial.json"),
      json("assets/config/gallery-curation.json"),
    ]);
  const problems = [];
  if (staging.name === production.name || staging.routes?.length)
    problems.push("Staging can overwrite or route the production site.");
  for (const key of ["d1_databases", "r2_buckets"]) {
    const identities = (config) =>
      (config[key] || [])
        .map((x) => x.database_id || x.bucket_name)
        .filter(Boolean);
    const live = new Set(identities(production));
    if (identities(staging).some((x) => live.has(x)))
      problems.push(`Staging shares production ${key}.`);
  }
  const content = Object.fromEntries(
    ["articles", "photos", "events", "projects", "products"].map((k) => [
      k,
      {
        publishedSnapshot: (published[k] || []).length,
        editorialTotal: (editorial[k] || []).length,
        drafts: (editorial[k] || []).filter((x) => x.status === "draft").length,
      },
    ]),
  );
  content.photos.uniqueGallery = uniqueGalleryPhotos(
    published.photos || [],
    curation,
  ).length;
  let packageInfo = null;
  try {
    const manifest = await json("public/release-manifest.json");
    const forbidden = [];
    async function scan(folder) {
      for (const entry of await readdir(folder, { withFileTypes: true })) {
        const path = resolve(folder, entry.name);
        if (entry.isSymbolicLink())
          forbidden.push(relative(resolve(root, "public"), path));
        else if (entry.isDirectory()) await scan(path);
        else if (
          /\.(mp3|flac|wav|ogg|env|sqlite|db)$/i.test(entry.name) ||
          (/\.(m4a|aac)$/i.test(entry.name) &&
            relative(resolve(root, "public"), path) !==
              "assets/audio/boss-ballin-preview.m4a") ||
          ["editorial.json", "wrangler.jsonc"].includes(entry.name)
        )
          forbidden.push(relative(resolve(root, "public"), path));
      }
    }
    await scan(resolve(root, "public"));
    if (forbidden.length)
      problems.push(
        "Private-source files in public package: " + forbidden.join(", "),
      );
    for (const release of [manifest.current, manifest.retained].filter(
      Boolean,
    )) {
      for (const path of ["app/main.js", "styles/index.css"]) {
        try {
          await stat(resolve(root, "public", release.prefix, path));
        } catch {
          problems.push(`Missing release asset: ${release.id}/${path}`);
        }
      }
    }
    const webmanifest = await json("public/assets/truthston.webmanifest");
    for (const icon of webmanifest.icons || [])
      try {
        await stat(resolve(root, "public", icon.src.replace(/^\//, "")));
      } catch {
        problems.push("Missing app icon: " + icon.src);
      }
    packageInfo = {
      current: manifest.current.id,
      retained: manifest.retained?.id || null,
      privateFileLeaks: forbidden.length,
    };
  } catch (error) {
    if (error.code === "ENOENT")
      problems.push(
        "Prepared public package is missing. Run npm run prepare:assets.",
      );
    else throw error;
  }
  const configuredBindings = (config) => ({
    database: (config.d1_databases || []).map((x) => x.binding),
    privateStorage: (config.r2_buckets || []).map((x) => x.binding),
  });
  return {
    schemaVersion: 1,
    completionSpec: "docs/COMPLETION-BUILD-SPEC.md",
    commercialLaunchReady: false,
    capabilities: platformCapabilities,
    content,
    environments: {
      production: {
        worker: production.name,
        bindings: configuredBindings(production),
      },
      staging: {
        worker: staging.name,
        bindings: configuredBindings(staging),
        routes: staging.routes || [],
      },
    },
    package: packageInfo,
    problems,
    pending: [
      "Real member/staff identity and verified transactional email",
      "Isolated D1/private R2 and cloud CMS",
      "Authorized private media and provider billing",
      "Verified stamp earning and funded reward fulfillment",
      "Physical iOS/Android acceptance and operational launch rehearsal",
    ],
  };
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  const report = await platformPreflight();
  console.log(JSON.stringify(report, null, 2));
  if (report.problems.length) process.exitCode = 1;
}
