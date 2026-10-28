import { readFile, readdir } from "node:fs/promises";
import { resolve, dirname, relative } from "node:path";
import { parse } from "acorn";
const root = resolve(import.meta.dirname, ".."),
  graph = new Map();
async function inspect(path) {
  if (graph.has(path)) return;
  const text = await readFile(path, "utf8"),
    tree = parse(text, { ecmaVersion: "latest", sourceType: "module" }),
    edges = [];
  graph.set(path, edges);
  function walk(node) {
    if (!node || typeof node !== "object") return;
    let spec,
      dynamic = false;
    if (
      [
        "ImportDeclaration",
        "ExportNamedDeclaration",
        "ExportAllDeclaration",
      ].includes(node.type)
    )
      spec = node.source?.value;
    if (node.type === "ImportExpression") {
      spec = node.source.value;
      dynamic = true;
    }
    if (typeof spec === "string" && spec.startsWith("."))
      edges.push({
        path: resolve(dirname(path), spec.split(/[?#]/)[0]),
        dynamic,
      });
    for (const v of Object.values(node))
      if (Array.isArray(v)) v.forEach((x) => x?.type && walk(x));
      else if (v?.type) walk(v);
  }
  walk(tree);
  for (const edge of edges) await inspect(edge.path);
}
await inspect(resolve(root, "assets/app/main.js"));
await inspect(resolve(root, "assets/cms.js"));
const visiting = new Set(),
  visited = new Set();
function visit(path, stack = []) {
  if (visiting.has(path))
    throw Error(
      "Circular module dependency: " +
        [...stack, path].map((p) => relative(root, p)).join(" → "),
    );
  if (visited.has(path)) return;
  visiting.add(path);
  for (const e of graph.get(path) || []) visit(e.path, [...stack, path]);
  visiting.delete(path);
  visited.add(path);
}
for (const path of graph.keys()) visit(path);
const staticModules = new Set();
function staticVisit(path) {
  if (staticModules.has(path)) return;
  staticModules.add(path);
  for (const e of graph.get(path) || []) if (!e.dynamic) staticVisit(e.path);
}
staticVisit(resolve(root, "assets/app/main.js"));
if ([...staticModules].some((p) => p.includes("/app/world/")))
  throw Error("The ordinary application eagerly imports the 3D world");
const engine = await readFile(
  resolve(root, "assets/app/features/audio/engine.js"),
  "utf8",
);
if (/\bdocument\b|\bsceneAPI\b|\bWebGLRenderer\b/.test(engine))
  throw Error("Audio transport depends on UI/world");
const staging = JSON.parse(
  await readFile(resolve(root, "wrangler.staging.jsonc"), "utf8"),
);
if (staging.routes?.length || staging.name === "trae-tha-truth-preview")
  throw Error("Staging can overwrite the live Worker");
const pkg = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
if (!pkg.scripts["deploy:preview"].includes("--config wrangler.staging.jsonc"))
  throw Error("Preview deployment does not use isolated staging");
console.log(
  `${graph.size} application/CMS modules: no cycles, lazy 3D boundary, independent audio and isolated staging verified.`,
);
