import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {uniqueGalleryPhotos} from '../assets/app/features/editorial/gallery.js';
const site=JSON.parse(await readFile(new URL('../assets/content/site.json',import.meta.url))),curation=JSON.parse(await readFile(new URL('../assets/config/gallery-curation.json',import.meta.url)));
test('curated archive has66 distinct photographs with no repeated source identities',()=>{const photos=uniqueGalleryPhotos(site.photos,curation);assert.equal(photos.length,66);const identities=photos.map(p=>curation.identities[p.id]);assert.equal(new Set(identities).size,66);assert.ok(photos.every(p=>!curation.excludedIds.includes(p.id)));});
test('unpublishing a preferred frame retains one available version',()=>{const canonical=curation.preferredIds.find(id=>Object.values(curation.identities).filter(v=>v===curation.identities[id]).length>1);const photos=uniqueGalleryPhotos(site.photos.filter(p=>p.id!==canonical),curation);assert.equal(photos.length,66);});
test('new exact upload duplicates match archived image hashes and URL variants do not repeat',()=>{const original=site.photos.find(p=>curation.preferredIds.includes(p.id));const clone={id:'new-upload',src:'assets/uploads/new.png',contentHash:curation.contentHashes[original.id]};assert.equal(uniqueGalleryPhotos([clone,original],curation).length,1);assert.equal(uniqueGalleryPhotos([{id:'a',src:'photo.jpg?w=120'},{id:'b',src:'photo.jpg?w=800'}]).length,1);});
