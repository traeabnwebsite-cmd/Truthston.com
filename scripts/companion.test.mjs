import test from 'node:test';
import assert from 'node:assert/strict';
import {createCompanionJourney} from '../assets/app/features/companion/journey.js';
import {createCompanionKnowledge} from '../assets/app/features/companion/knowledge.js';
import {createLifetime} from '../assets/app/core/lifecycle.js';
function fixture(wait=()=>Promise.resolve(),options={}){
 const classes=()=>{const values=new Set();return{add(...v){v.forEach(x=>values.add(x))},remove(...v){v.forEach(x=>values.delete(x))},contains:v=>values.has(v)}};
 const el=()=>({dataset:{},style:{},classList:classes(),setAttribute(){},removeAttribute(){},scrollIntoView(){},focus(){},textContent:''});const root=el(),home=el(),marker=el();const state={portalPhase:'arriving',portalToken:0,hidden:false,inWorld:false,worldSeat:false};
 const journey=createCompanionJourney({$:()=>marker,state,root,home,portalWait:wait,pose(){},appState:{station:0,calm:false},getWorld:()=>null,setMode(){},showThought(){},cancelSequence(){},closeChat(){},worldTools:el(),dockHome(){},attach(){},character:el(),go(){},cinema:{state:{}},constrainThought(){},...options});return{journey,state,home,root};
}
test('door entrance reaches outside; subsequent state updates retain the shared journey store',async()=>{const h=fixture();await h.journey.emerge();assert.equal(h.state.portalPhase,'outside');assert.equal(h.home.dataset.journey,'outside');assert.equal(h.root.classList.contains('portal-born'),false);assert.equal(h.home.classList.contains('door-open'),false);h.journey.setPortalState('resting');assert.equal(h.state.portalPhase,'resting');});
test('cancelling an entrance invalidates its pending animation; a hidden companion cannot enter the room',async()=>{let resume;const h=fixture(()=>new Promise(r=>resume=r));const work=h.journey.emerge();h.state.portalToken++;resume();await work;assert.equal(h.root.classList.contains('portal-born'),true);h.state.hidden=true;await h.journey.enterPortal(2);assert.equal(h.state.inWorld,false);});
test('local guide answers site questions without claiming a connected AI',()=>{const guide=createCompanionKnowledge({releases:[],state:{}});assert.match(guide.localAnswer('Where is the stamp book?').answer,/stamp/i);assert.match(guide.localAnswer('Where can I buy a bumpboxx?').answer,/DJ room/i);});
test('feature disposal removes listeners, timers and observers exactly once',async()=>{const lifetime=createLifetime(),target=new EventTarget();let calls=0,disconnects=0;lifetime.listen(target,'test',()=>calls++);lifetime.interval(()=>calls++,1000);lifetime.timeout(()=>calls++,10);lifetime.observe({observe(){},disconnect(){disconnects++}},{});target.dispatchEvent(new Event('test'));lifetime.dispose();lifetime.dispose();target.dispatchEvent(new Event('test'));await new Promise(r=>setTimeout(r,20));assert.equal(calls,1);assert.equal(disconnects,1);assert.equal(lifetime.disposed,true);});
test('persistent DOM handler ownership restores the previous handler on disposal',()=>{const target={onclick:()=>1},old=target.onclick,lifetime=createLifetime();lifetime.handler(target,'onclick',()=>2);assert.equal(target.onclick(),2);lifetime.dispose();assert.equal(target.onclick,old);});

test('entering a room waits for the world without forcing Standard mode',async()=>{let world=null,loads=0;const modes=[],travel=[];const h=fixture(()=>Promise.resolve(),{getWorld:()=>world,ensureWorld:async()=>{loads++;world={setGuideVisible(){},guideTravel:id=>travel.push(id)};},setMode:mode=>modes.push(mode)});h.state.portalPhase='outside';await h.journey.enterPortal(1);assert.equal(loads,1);assert.equal(h.state.inWorld,true);assert.ok(modes.every(mode=>mode==='immersive'));assert.deepEqual(travel,[1]);});

test('companion arrival in the current theater does not retravel and reset a selected movie',async()=>{
 const navigation=[],guide=[];
 const h=fixture(()=>Promise.resolve(),{appState:{station:2,calm:false},getWorld:()=>({setGuideVisible(){},guideTravel:id=>guide.push(id)}),go:id=>navigation.push(id)});
 h.state.portalPhase='outside';await h.journey.enterPortal(2);
 assert.equal(h.state.inWorld,true);assert.deepEqual(navigation,[]);assert.deepEqual(guide,[2]);
});
