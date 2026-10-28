import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolveRollbackRevision } from "./rollback-revision.mjs";
import {
  readCodeTree,
  writeCodeSnapshot,
  versionHTML,
} from "./asset-release.mjs";
import { mkdir, cp, copyFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const destination = resolve(root, "public");
// Only this generated folder is replaced. Research, handoffs, environment files and Git metadata stay private.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await copyFile(resolve(root, "index.html"), resolve(destination, "index.html"));
await copyFile(resolve(root, "cms.html"), resolve(destination, "cms.html"));
// A missing optional script must not receive the SPA HTML fallback and be parsed as JavaScript.
try {
  await copyFile(
    resolve(root, "release-data.js"),
    resolve(destination, "release-data.js"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  await writeFile(
    resolve(destination, "release-data.js"),
    "// Optional catalog override absent; use the embedded and public research catalog.\n",
  );
}
await cp(resolve(root, "assets"), resolve(destination, "assets"), {
  recursive: true,
  filter: (path) => !path.endsWith(".md") && !path.endsWith(".mp3"),
});
console.log(
  "Deployment files prepared: index.html, cms.html and public assets only; MP3 masters excluded. No front-end compilation.",
);

// Version code as one native-module tree. Images and private media are never duplicated.
const release = await writeCodeSnapshot(
  await readCodeTree(resolve(root, "assets")),
  destination,
);
const rollbackRef =
  process.env.TRUTHSTON_ROLLBACK_REF ||
  "a834ca2a0d2521fc708d313c7fad0004f327e956";
const revision = resolveRollbackRevision(root, rollbackRef);
const paths = execFileSync(
  "git",
  ["ls-tree", "-r", "--name-only", revision, "assets"],
  { cwd: root, encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter((p) => /\.(m?js|css)$/.test(p));
const previousFiles = new Map(
  paths.map((path) => [
    path.slice(7),
    execFileSync("git", ["show", revision + ":" + path], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    }),
  ]),
);
const previous = previousFiles.size
  ? await writeCodeSnapshot(previousFiles, destination)
  : null;
for (const name of ["index.html", "cms.html"])
  await writeFile(
    resolve(destination, name),
    versionHTML(
      await readFile(resolve(destination, name), "utf8"),
      release.prefix,
    ),
  );
await writeFile(
  resolve(destination, "release-manifest.json"),
  JSON.stringify(
    { current: release, retained: previous, rollbackRevision: revision },
    null,
    2,
  ) + "\n",
);
await writeFile(
  resolve(destination, "_headers"),
  `/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/cms
  Cache-Control: no-cache
/cms.html
  Cache-Control: no-cache
/assets/app/*
  Cache-Control: no-cache
/assets/content/*
  Cache-Control: no-cache
/assets/releases/*
  Cache-Control: public, max-age=31536000, immutable
`,
);
console.log(
  "Versioned native modules:",
  release.id,
  "; retained rollback code:",
  previous?.id || "none",
);
