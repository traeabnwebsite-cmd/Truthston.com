// Dry-run intake only: no upload, extraction, publication or entitlement creation.
import { open, readFile, realpath, lstat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import { resolve, relative, isAbsolute, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
const safeId = (value) =>
  typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,119}$/.test(value);
const signature = (bytes, ext) =>
  ext === ".wav"
    ? bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WAVE"
    : ext === ".flac"
      ? bytes.toString("ascii", 0, 4) === "fLaC"
      : ext === ".mp3"
        ? bytes.toString("ascii", 0, 3) === "ID3" ||
          (bytes[0] === 255 && (bytes[1] & 224) === 224)
        : [".m4a", ".aac"].includes(ext) &&
          bytes.toString("ascii", 4, 8) === "ftyp";
async function inspectFile(root, path, maxBytes) {
  if (
    typeof path !== "string" ||
    !path ||
    isAbsolute(path) ||
    path.split(/[\\/]/).includes("..") ||
    path.includes("\\") ||
    path.includes("\0") ||
    /^[a-z]+:/i.test(path)
  )
    throw Error("Use a relative file path inside the selected project folder.");
  const resolvedRoot = await realpath(root),
    requested = resolve(resolvedRoot, path),
    rel = relative(resolvedRoot, requested);
  if (rel.startsWith(".." + sep) || isAbsolute(rel))
    throw Error("File is outside the selected project folder.");
  let current = resolvedRoot;
  for (const part of rel.split(sep)) {
    current = resolve(current, part);
    if ((await lstat(current)).isSymbolicLink())
      throw Error("Symbolic links are not accepted for media intake.");
  }
  const actual = await realpath(requested);
  if (relative(resolvedRoot, actual) !== rel)
    throw Error("File resolves outside its declared path.");
  const file = await open(actual, "r");
  let bytes, size;
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size === 0 || info.size > maxBytes)
      throw Error("File must be nonempty and within the intake size limit.");
    size = info.size;
    bytes = Buffer.alloc(16);
    await file.read(bytes, 0, 16, 0);
  } finally {
    await file.close();
  }
  const extension = extname(path).toLowerCase();
  if (!signature(bytes, extension))
    throw Error(
      "Unsupported audio type or file signature does not match its extension.",
    );
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(actual)) hash.update(chunk);
  return {
    path,
    bytes: size,
    sha256: hash.digest("hex"),
    extension,
    decoded: false,
  };
}
export async function validateMediaManifest(
  manifest,
  root,
  { maxTracks = 1000, maxBytes = 2 * 1024 ** 3 } = {},
) {
  const errors = [],
    warnings = [],
    tracks = [],
    project = manifest?.project;
  if (manifest?.schemaVersion !== 1) errors.push("Unsupported schemaVersion.");
  if (
    !project ||
    !safeId(project.id) ||
    typeof project.title !== "string" ||
    !project.title.trim()
  )
    errors.push("Project requires a stable ID and title.");
  if (
    !Array.isArray(project?.tracks) ||
    !project.tracks.length ||
    project.tracks.length > maxTracks
  )
    errors.push("Provide a bounded nonempty ordered track list.");
  if (errors.length)
    return { valid: false, publishable: false, errors, warnings, tracks };
  const ids = new Set(),
    numbers = new Set(),
    hashes = new Map();
  for (const [index, track] of project.tracks.entries()) {
    const row = {
      id: track?.id || null,
      trackNumber: track?.trackNumber || null,
      title: track?.title || "",
      errors: [],
      asset: null,
    };
    if (!safeId(track?.id) || ids.has(track.id))
      row.errors.push("Track ID is invalid or duplicated.");
    else ids.add(track.id);
    if (
      !Number.isInteger(track?.trackNumber) ||
      track.trackNumber !== index + 1 ||
      numbers.has(track.trackNumber)
    )
      row.errors.push("Track numbers must be unique and ordered from1.");
    else numbers.add(track.trackNumber);
    if (typeof track?.title !== "string" || !track.title.trim())
      row.errors.push("Track title is required.");
    try {
      row.asset = await inspectFile(root, track?.localPath, maxBytes);
      const prior = hashes.get(row.asset.sha256);
      if (prior)
        warnings.push(
          `Identical bytes in tracks ${prior} and ${track.id}; review editions before merging.`,
        );
      else hashes.set(row.asset.sha256, track.id);
    } catch (error) {
      row.errors.push(
        error.code === "ENOENT" ? "Source file is missing." : error.message,
      );
    }
    tracks.push(row);
  }
  if (tracks.some((row) => row.errors.length))
    errors.push(
      "One or more track rows need correction. Other successful rows are retained in this report.",
    );
  return {
    schemaVersion: 1,
    projectId: project.id,
    valid: !errors.length,
    publishable: false,
    errors,
    warnings,
    tracks,
    summary: {
      tracks: tracks.length,
      verifiedFiles: tracks.filter((t) => t.asset).length,
      bytes: tracks.reduce((sum, t) => sum + (t.asset?.bytes || 0), 0),
    },
    next: "Staff review, artwork/metadata reconciliation, authorized-use settings, decoding/renditions and private storage are still required before publishing. This dry run grants no access.",
  };
}
if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  if (!process.argv[2] || !process.argv[3])
    throw Error(
      "Usage: node scripts/validate-media-manifest.mjs manifest.json project-folder",
    );
  const manifest = JSON.parse(await readFile(process.argv[2], "utf8"));
  const report = await validateMediaManifest(
    manifest,
    resolve(process.argv[3]),
  );
  console.log(JSON.stringify(report, null, 2));
  if (!report.valid) process.exitCode = 1;
}
