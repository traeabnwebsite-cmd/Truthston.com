import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname, posix } from "node:path";
import { createHash } from "node:crypto";
export async function readCodeTree(root) {
  const files = new Map();
  async function walk(dir, relative = "") {
    for (const entry of (await readdir(dir, { withFileTypes: true })).sort(
      (a, b) => a.name.localeCompare(b.name),
    )) {
      const name = relative ? relative + "/" + entry.name : entry.name;
      if (entry.isDirectory()) await walk(resolve(dir, entry.name), name);
      else if (/\.(m?js|css)$/.test(name))
        files.set(name, await readFile(resolve(dir, entry.name), "utf8"));
    }
  }
  await walk(root);
  return files;
}
export function releaseHash(files) {
  const hash = createHash("sha256");
  for (const [name, source] of [...files].sort(([a], [b]) =>
    a.localeCompare(b),
  ))
    hash.update(name + "\0" + source + "\0");
  return hash.digest("hex").slice(0, 20);
}
export async function writeCodeSnapshot(files, publicRoot) {
  const id = releaseHash(files),
    prefix = "assets/releases/" + id;
  for (const [name, source] of files) {
    let output = source;
    if (name.endsWith(".css"))
      output = source.replace(
        /url\(\s*(["']?)(.*?)\1\s*\)/g,
        (whole, quote, url) => {
          if (
            /^(?:data:|https?:|\/|#)/.test(url) ||
            /\.css(?:[?#]|$)/.test(url)
          )
            return whole;
          const absolute = posix.normalize(
            posix.join("assets", posix.dirname(name), url),
          );
          if (!absolute.startsWith("assets/"))
            throw Error("CSS asset escaped public assets");
          return 'url("/' + absolute + '")';
        },
      );
    const path = resolve(publicRoot, prefix, name);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, output);
  }
  return { id, prefix, files: files.size };
}
export function versionHTML(html, prefix) {
  return html.replace(
    /\b(src|href)=(['"])(assets\/[^'"?]+\.(?:m?js|css))(?:\?[^'"]*)?\2/g,
    (_, attribute, quote, path) =>
      `${attribute}=${quote}${prefix}/${path.slice(7)}${quote}`,
  );
}
