import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareCatalog} from '../assets/app/data/catalog.js';
import {loadPublicContent,loadOptionalCatalog} from '../assets/app/data/content-client.js';
import {createRouter,routeIntent} from '../assets/app/core/router.js';
import {embeddedVault} from '../assets/app/data/fallback-catalog.js';
import {priceForRelease, chronologicalReleases, radioCollections} from '../assets/app/features/store/catalog-policy.js';
import {answerReign} from '../assets/app/features/store/reign-knowledge.js';
import {responsiveFieldOfView} from '../assets/app/world/framing.js';
const sample={releases:[{title:'Sample',year:2000,tracks:[]}],timeline:[],giving:[]};
const cover=t=>'generated:'+t;
test('content navigation preserves both native and mobile fallback room fullscreen',async()=>{
 for(const native of [true,false]) {
  const classes=new Map(),opened=[];
  const room={classList:{contains:name=>!native && name==='fullscreen-fallback'}};
  let exits=0;
  const doc={fullscreenElement:native?room:null,exitFullscreen:async()=>{exits++},body:{classList:{toggle:(name,value)=>classes.set(name,value)}}};
  const win={location:{hash:'#radio'},scrollTo(){},addEventListener(){},removeEventListener(){}};
  const panels=new Map();const query=key=>{if(key==='.room-wrap')return room;if(!panels.has(key))panels.set(key,{hidden:false,focus(){}});return panels.get(key)};
  const router=createRouter({win,doc,query,queryAll:()=>[],account:{open(){}},commerce:{open(){}},editorial:{open(){}},store:{open:path=>opened.push(path)}});
  await router.route();assert.equal(exits,0);assert.equal(classes.get('account-view'),false);assert.equal(classes.get('room-panel-view'),true);assert.deepEqual(opened,['radio']);
  win.location.hash='#record-shop';await router.route();assert.equal(classes.get('room-panel-view'),false);assert.equal(query('#record-store-page').hidden,true);
 }
});
test('portrait framing widens the field of view while keeping geometry proportions unchanged',()=>{
 assert.equal(responsiveFieldOfView(43,1.8),43);assert.ok(responsiveFieldOfView(43,.6)>43);assert.ok(responsiveFieldOfView(43,.2)<=90);
});
test('store pricing distinguishes albums, mixtapes, singles and EPs; display sorting preserves deep-link indices',()=>{
 const source=[{title:'Later',year:2020,date:'2020-10-01',type:'Studio Album'},{title:'Earlier',year:2001,type:'Mixtape'},{title:'Spring',year:2020,date:'2020-03-01',type:'EP'},{title:'Song',year:2021,type:'Single'}];
 assert.deepEqual(source.map(priceForRelease),[1599,599,399,199]);
 const sorted=chronologicalReleases(source);assert.deepEqual(sorted.map(r=>r.title),['Earlier','Spring','Later','Song']);assert.equal(source[0].title,'Later');assert.equal(source.indexOf(sorted[0]),1);
 assert.equal(radioCollections(source).find(c=>c.id==='mixtapes').releases.length,1);
});
test('Reign answers from source records and declines unknown release claims',()=>{
 const record={title:'Losing Composure',artist:'Trae tha Truth',artists:['Trae tha Truth'],date:'2003-09-09',type:'Studio Album',tracks:['Intro','Beware'],sourceUrl:'https://music.apple.com/'};
 const answer=answerReign('Tell me about Losing Composure',{records:[record]});assert.match(answer.text,/2003-09-09/);assert.match(answer.text,/1\. Intro/);assert.deepEqual(answer.records,[record]);
 const missing=answerReign('Guerilla Maab imaginary missing album',{records:[record]});assert.match(missing.text,/don’t have a sourced match/);assert.equal(missing.records.length,0);
 assert.match(answerReign('What are the prices?',{records:[]}).text,/\$15\.99/);
});
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

test('canonical release links survive new releases and metadata edits; old numeric links keep their original project',async()=>{
 const {catalogIdentities}=await import('../assets/app/data/catalog-identities.js');
 const {releaseHash,resolveReleaseLink}=await import('../assets/app/data/release-links.js');
 const first={id:catalogIdentities[0].id,title:'Updated title'},newRelease={id:'new-project'};
 const records=[newRelease,first];assert.equal(resolveReleaseLink(records,releaseHash(first)),first);assert.equal(resolveReleaseLink(records,'#release=0'),first);
 assert.equal(resolveReleaseLink(records,'#release/missing'),null);assert.equal(resolveReleaseLink(records,'#release/%ZZ'),null);
 assert.equal(new Set(catalogIdentities.map(r=>r.id)).size,138);
});
