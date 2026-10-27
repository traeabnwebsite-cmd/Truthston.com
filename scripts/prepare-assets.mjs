import { mkdir, cp, copyFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'public');
// Only this generated folder is replaced. Research, handoffs, environment files and Git metadata stay private.
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await copyFile(resolve(root, 'index.html'), resolve(destination, 'index.html'));
await copyFile(resolve(root, 'cms.html'), resolve(destination, 'cms.html'));
// A missing optional script must not receive the SPA HTML fallback and be parsed as JavaScript.
try {
  await copyFile(resolve(root, 'release-data.js'), resolve(destination, 'release-data.js'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  await writeFile(resolve(destination, 'release-data.js'), '// Optional catalog override absent; use the embedded and public research catalog.\n');
}
await cp(resolve(root, 'assets'), resolve(destination, 'assets'), { recursive: true, filter: path => !path.endsWith('.md') && !path.endsWith('.mp3') });
console.log('Deployment files prepared: index.html, cms.html and public assets only; MP3 masters excluded. No front-end compilation.');
