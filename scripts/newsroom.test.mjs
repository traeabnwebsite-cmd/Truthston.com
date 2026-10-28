import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {storyCopy,storyParagraphs} from '../assets/app/features/editorial/story-copy.js';
const site=JSON.parse(await readFile(new URL('../assets/content/site.json',import.meta.url),'utf8'));
test('published newsroom entries contain readable original copy and dated source attribution',()=>{assert.ok(site.articles.length>=20);for(const a of site.articles){assert.ok(a.body.split(/\s+/).length>=100,a.id+' is only a research note');assert.ok(storyParagraphs(a).length>=3,a.id+' needs paragraphs');assert.notEqual(a.body,a.summary);assert.ok(a.sourceName&&/^https:\/\//.test(a.sourceUrl),a.id+' lacks attribution');assert.ok(a.date);}});
test('newsroom photo references have full-frame source files, rather than only pre-cropped thumbnails',async()=>{const photos=new Map(site.photos.map(p=>[p.id,p]));for(const a of site.articles){if(!a.imageId)continue;const photo=photos.get(a.imageId);assert.ok(photo?.fullSrc,a.id);await access(new URL('../'+photo.fullSrc,import.meta.url));}});
test('story renderer includes every paragraph, escapes HTML and only truncates when explicitly requested',()=>{const a={body:'One paragraph.\n\nSecond <script>bad()</script>.\n\nLast paragraph.'};const full=storyCopy(a);assert.ok(full.includes('Last paragraph.'));assert.ok(full.includes('&lt;script&gt;'));assert.ok(!full.includes('<script>'));assert.equal((full.match(/<p>/g)||[]).length,3);assert.ok(!storyCopy(a,{limit:2}).includes('Last paragraph.'));});
