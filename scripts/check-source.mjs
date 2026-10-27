import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
const root = resolve(import.meta.dirname, '..');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
if (Buffer.byteLength(html) >= 2 * 1024 * 1024) throw new Error('HTML exceeds 2 MB');
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new Script(match[1], { filename: 'index.html' });
for (const path of new Set([...html.matchAll(/(?:assets\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|svg|mp3))/g)].map(m => m[0]))) {
  if (!path.includes('..')) { try { await stat(resolve(root, path)); } catch (error) { if (path !== 'assets/audio/boss-ballin.mp3') throw error; console.log('Optional local preview MP3 absent; generated-beat fallback remains available.'); } }
}
console.log('HTML syntax, local asset paths and size checked.');
