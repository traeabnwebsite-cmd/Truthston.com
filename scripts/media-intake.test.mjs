import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validateMediaManifest } from "./validate-media-manifest.mjs";
function wav() {
  const b = Buffer.alloc(84);
  b.write("RIFF");
  b.writeUInt32LE(76, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(8000, 24);
  b.writeUInt32LE(16000, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36);
  b.writeUInt32LE(40, 40);
  return b;
}
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "truthston-intake-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, "one.wav"), wav());
  await writeFile(join(root, "two.wav"), wav());
  return root;
}
const manifest = () => ({
  schemaVersion: 1,
  publish: false,
  project: {
    id: "test-project",
    title: "Test release",
    tracks: [
      { id: "track-one", title: "One", trackNumber: 1, localPath: "one.wav" },
      { id: "track-two", title: "Two", trackNumber: 2, localPath: "two.wav" },
    ],
  },
});
test("batch intake verifies checksums and order without publishing; retries preserve asset identities", async (t) => {
  const root = await fixture(t),
    a = await validateMediaManifest(manifest(), root),
    b = await validateMediaManifest(manifest(), root);
  assert.equal(a.valid, true);
  assert.equal(a.publishable, false);
  assert.equal(a.summary.verifiedFiles, 2);
  assert.equal(a.tracks[0].asset.decoded, false);
  assert.deepEqual(a.tracks, b.tracks);
  assert.equal(a.warnings.length, 1);
});
test("intake retains good rows while reporting missing files, repeated IDs and broken track order", async (t) => {
  const root = await fixture(t),
    m = manifest();
  m.project.tracks[1] = {
    id: "track-one",
    title: "Bad",
    trackNumber: 9,
    localPath: "missing.wav",
  };
  const r = await validateMediaManifest(m, root);
  assert.equal(r.valid, false);
  assert.ok(r.tracks[0].asset);
  assert.equal(r.tracks[1].errors.length, 3);
});
test("intake rejects traversal, absolute/provider URLs, symlinks, fake signatures and oversize files", async (t) => {
  const root = await fixture(t);
  await symlink(join(root, "one.wav"), join(root, "link.wav"));
  await writeFile(join(root, "fake.mp3"), "this is not an mp3");
  for (const path of [
    "../one.wav",
    "/tmp/one.wav",
    "https://open.spotify.com/a",
    "link.wav",
    "fake.mp3",
  ]) {
    const m = manifest();
    m.project.tracks[1].localPath = path;
    const r = await validateMediaManifest(m, root);
    assert.equal(r.valid, false, path);
  }
  assert.equal(
    (await validateMediaManifest(manifest(), root, { maxBytes: 10 })).valid,
    false,
  );
});
