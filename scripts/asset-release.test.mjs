import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  releaseHash,
  writeCodeSnapshot,
  versionHTML,
} from "./asset-release.mjs";
test("native imports stay together in a content-addressed tree; CSS images stay at their public path", async () => {
  const dir = await mkdtemp(join(tmpdir(), "truthston-release-"));
  try {
    const files = new Map([
      ["app/main.js", "import './child.js';"],
      ["app/child.js", "export const value=1;"],
      [
        "styles/base.css",
        "@import './other.css';body{background:url('../hero/house.png')}",
      ],
      ["styles/other.css", "body{color:black}"],
    ]);
    const current = await writeCodeSnapshot(files, dir);
    assert.equal(
      await readFile(join(dir, current.prefix, "app/main.js"), "utf8"),
      files.get("app/main.js"),
    );
    assert.match(
      await readFile(join(dir, current.prefix, "styles/base.css"), "utf8"),
      /url\("\/assets\/hero\/house.png"\)/,
    );
    const html = versionHTML(
      '<script type="module" src="assets/app/main.js?v=old"></script><img src="assets/hero/house.png">',
      current.prefix,
    );
    assert.match(html, new RegExp(current.prefix + "/app/main.js"));
    assert.match(html, /src="assets\/hero\/house.png"/);
    const same = releaseHash(new Map([...files].reverse()));
    assert.equal(current.id, same);
    files.set("app/child.js", "export const value=2;");
    const next = await writeCodeSnapshot(files, dir);
    assert.notEqual(current.id, next.id);
    assert.ok(
      await readFile(join(dir, current.prefix, "app/child.js"), "utf8"),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { resolveRollbackRevision } from "./rollback-revision.mjs";
test("shallow builds retrieve the exact rollback commit and reject missing ambiguous refs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "truthston-shallow-"));
  const origin = join(dir, "origin"),
    clone = join(dir, "clone");
  const git = (cwd, ...args) =>
    execFileSync("git", args, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  try {
    git(dir, "init", origin);
    git(origin, "config", "user.email", "test@example.invalid");
    git(origin, "config", "user.name", "Build test");
    await writeFile(join(origin, "asset"), "old");
    git(origin, "add", ".");
    git(origin, "commit", "-m", "rollback");
    const old = git(origin, "rev-parse", "HEAD");
    await writeFile(join(origin, "asset"), "new");
    git(origin, "commit", "-am", "current");
    const current = git(origin, "rev-parse", "HEAD");
    git(dir, "clone", "--depth", "1", "file://" + origin, clone);
    assert.throws(() => git(clone, "cat-file", "-e", old));
    assert.equal(resolveRollbackRevision(clone, old), old);
    assert.equal(git(clone, "rev-parse", "HEAD"), current);
    assert.equal(await readFile(join(clone, "asset"), "utf8"), "new");
    assert.throws(
      () => resolveRollbackRevision(clone, "missing-ref"),
      /full 40-character/,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
