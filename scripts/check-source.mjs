import { readFile, stat, readdir } from 'node:fs/promises';
import { resolve, relative, dirname, extname } from 'node:path';
import { parse } from 'acorn';
import { analyze } from 'eslint-scope';
const browserGlobals=new Set([...Object.getOwnPropertyNames(globalThis),'window','document','navigator','location','localStorage','sessionStorage','matchMedia','Image','Audio','ResizeObserver','MutationObserver','requestAnimationFrame','cancelAnimationFrame','innerWidth','innerHeight','scrollY','scrollX','devicePixelRatio','speechSynthesis','SpeechSynthesisUtterance','getComputedStyle','confirm','alert','FileReader']);
const root = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
if (Buffer.byteLength(html) >= 2 * 1024 * 1024) throw new Error('HTML exceeds 2 MB');
const checked = new Set();
const optional = new Set(['assets/audio/boss-ballin.mp3', 'release-data.js']);
function walk(node, visit) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;
    if (Array.isArray(value)) value.forEach(child => walk(child, visit));
    else if (value && typeof value === 'object') walk(value, visit);
  }
}
async function localFile(path) {
  const rel = relative(root, path).replaceAll('\\', '/');
  if (rel.startsWith('../')) throw new Error('Asset escapes repository: ' + rel);
  try { await stat(path); } catch (error) {
    if (!optional.has(rel)) throw new Error('Missing referenced asset: ' + rel, { cause: error });
    return false;
  }
  return true;
}
async function visit(spec, owner) {
  if (/^(?:https?:|data:|blob:|#)/.test(spec)) return;
  const path = spec.startsWith('/') ? resolve(root, '.' + spec) : resolve(dirname(owner), spec.split(/[?#]/)[0]);
  if (checked.has(path) || !await localFile(path)) return;
  checked.add(path);
  if (/\.(?:m?js|css)$/.test(path)) await inspect(await readFile(path, 'utf8'), path);
}
async function inspect(source, owner) {
  if (extname(owner) === '.css') {
    const css = source.replace(/url\(["']?data:[^)]*\)/g, '');
    for (const m of css.matchAll(/(?:@import\s+(?:url\()?|url\()\s*["']?([^"'\s);]+)/g)) await visit(m[1], owner);
    return;
  }
  const tree = parse(source, { ecmaVersion:'latest', sourceType:'module', allowAwaitOutsideFunction:true, ranges:true });
  const scopes=analyze(tree,{ecmaVersion:2022,sourceType:'module',ignoreEval:true});
  const unknown=[...new Set(scopes.globalScope.through.map(r=>r.identifier.name))].filter(name=>!browserGlobals.has(name));
  if(unknown.length)throw new Error('Unbound dependencies in '+relative(root,owner)+': '+unknown.join(', '));
  const imports = [];
  walk(tree, node => {
    if (node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration' || node.type === 'ExportAllDeclaration') {
      if (node.source) imports.push(node.source.value);
    }
    if (node.type === 'ImportExpression' && node.source.type === 'Literal') imports.push(node.source.value);
  });
  for (const spec of imports) await visit(spec, owner);
  // DOM image/audio paths are document-relative, even inside a feature module.
  for (const match of source.matchAll(/assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|svg|mp3|json)/g)) await visit('./' + match[0], resolve(root, 'index.html'));
}
for (const name of ['index.html','cms.html']) {
 const owner=resolve(root,name), page=await readFile(owner,'utf8');
 for (const m of page.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
  const src=m[1].match(/\bsrc=["']([^"']+)["']/),isModule=/type=["']module["']/.test(m[1]);
  if(src){
   if(!isModule && !/^https?:/.test(src[1])) parse(await readFile(resolve(dirname(owner),src[1]),'utf8'),{ecmaVersion:'latest',sourceType:'script'});
   await visit(src[1],owner);
  } else if(!/type=["']application\/ld\+json/.test(m[1])) await inspect(m[2],owner);
 }
 const markup=page.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 for(const m of markup.matchAll(/<(?:link|img)\b[^>]*(?:href|src)=["']([^"']+)["']/g)) await visit(m[1],owner);
 for(const m of page.matchAll(/<style>([\s\S]*?)<\/style>/g)) await inspect(m[1],resolve(root,'inline.css'));
}
async function modules(dir) {
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const path = resolve(dir,entry.name);
    if(entry.isDirectory()) await modules(path);
    else if(/\.m?js$/.test(path) && !checked.has(path)) { checked.add(path); await inspect(await readFile(path,'utf8'),path); }
  }
}
try { await modules(resolve(root,'assets/app')); } catch(error) { if(error.code!=='ENOENT') throw error; }
await visit('./assets/cms.js',resolve(root,'index.html'));
console.log(`HTML/module syntax and ${checked.size} referenced local files checked; optional overrides and private masters remain optional.`);
