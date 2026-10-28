import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareCatalog} from '../assets/app/data/catalog.js';
import {loadPublicContent,loadOptionalCatalog} from '../assets/app/data/content-client.js';
import {createRouter,routeIntent} from '../assets/app/core/router.js';
import {embeddedVault} from '../assets/app/data/fallback-catalog.js';
const sample={releases:[{title:'Sample',year:2000,tracks:[]}],timeline:[],giving:[]};
const cover=t=>'generated:'+t;
test('catalog extraction preserves138 numeric links, covers, and title/year identities',()=>{
 const {releases}=prepareCatalog({supplied:structuredClone(embeddedVault),siteContent:{projects:[]},sample,cover});
 assert.equal(releases.length,138);assert.equal(releases[0].title,'Tha Truth');assert.equal(releases[0].year,2015);assert.match(releases[0].cover,/^assets\/covers\//);assert.ok(releases.every(r=>Array.isArray(r.tracks)));
});
test('CMS project reconciliation retains legacy position and adds new projects first',()=>{
 const source=[{title:'Existing',year:2020,cover:'old.jpg',tracks:[]}];
 const projects=[{id:'p1',title:'Existing',date:'2020-01-01',legacyKey:'Existing|2020',cover:'new.jpg',tracks:[{title:'Track',audio:'private'}]},{id:'p2',title:'New',date:'2026-01-01',tracks:[]}];
 const {releases}=prepareCatalog({supplied:source,siteContent:{projects},sample,cover});
 assert.equal(releases.length,2);assert.equal(releases[0].title,'New');assert.equal(releases[1].cmsProjectId,'p1');assert.deepEqual(releases[1].tracks,['Track']);assert.equal(releases[1].cover,'new.jpg');
});
test('public content falls back after API failure; HTML never executes as optional catalog JS',async()=>{
 const calls=[];const content=await loadPublicContent({fetcher:async url=>{calls.push(url);if(url==='/api/content')throw Error('offline');return{ok:true,json:async()=>({schemaVersion:1,articles:[{id:'a'}]})}}});
 assert.deepEqual(calls,['/api/content','assets/content/site.json']);assert.equal(content.articles[0].id,'a');
 const loaded=await loadOptionalCatalog({fetcher:async()=>({ok:true,headers:new Headers({'content-type':'text/html'})}),doc:{createElement(){throw Error('must not execute HTML')}}});assert.equal(loaded,false);
 const empty=await loadPublicContent({fetcher:async()=>{throw Error('offline')}});assert.deepEqual(empty.articles,[]);
});
test('router preserves existing public, account and Bumpboxx hashes',()=>{
 assert.equal(routeIntent('#account/stamp-book').accountPath,'stamp-book');assert.equal(routeIntent('#article/id-123').editorial,true);assert.equal(routeIntent('#shop/bumpboxx').shopping,true);assert.equal(routeIntent('#release=8').editorial,false);
});
test('router owns exactly one hash listener and supports explicit teardown',async()=>{
 const listeners=new Set(),views=[];const win={location:{hash:'#account/stamp-book'},addEventListener(_,f){listeners.add(f)},removeEventListener(_,f){listeners.delete(f)},scrollTo(){}};
 const elements=new Map();const query=key=>{if(!elements.has(key))elements.set(key,{hidden:false,focus(){}});return elements.get(key)};
 const doc={body:{classList:{toggle(){}}}};const router=createRouter({win,doc,query,queryAll:()=>[],account:{open:path=>views.push(path)},commerce:{open(){}},editorial:{open(){}}});
 router.start();router.start();assert.equal(listeners.size,1);await router.route();assert.deepEqual(views,['stamp-book']);assert.equal(query('#account-page').hidden,false);assert.equal(query('#editorial-page').hidden,true);router.destroy();assert.equal(listeners.size,0);
});
test('catalog preparation does not mutate imported release data across application remounts',()=>{const supplied={releases:[{title:'A',year:2000,tracks:['One']}]};const before=structuredClone(supplied);const options={supplied,embeddedVault:{},siteContent:{projects:[]},sample:{},cover:()=>'/cover.png'};prepareCatalog(options);prepareCatalog(options);assert.deepEqual(supplied,before);});
