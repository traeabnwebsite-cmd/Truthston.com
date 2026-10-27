import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateStampAward as evaluate, rewardPeriod, policy } from './membership-policy.mjs';
const member={id:'member_1',status:'active',emailVerified:true}, now=100000;
const fact=(kind,i,extra={})=>({memberId:member.id,key:'receipt_'+i,verified:true,verifiedAt:now-1000,source:kind==='listen'?'playback':kind==='cut'?'dj':'exploration',kind,...extra});
const run=(key,evidence,extra={})=>evaluate({member,stampKey:key,evidence,now,...extra});
test('activity awards require verified members and server evidence, not client totals',()=>{
 assert.equal(run('the-truth',[],{member:{...member,emailVerified:false}}).eligible,false);
 assert.equal(run('the-truth',[fact('listen',1,{seconds:1000})]).eligible,false);
 assert.equal(run('the-truth',Array.from({length:4},(_,i)=>fact('listen',i,{seconds:15,sessionAuthorized:true,forwardPlayback:true,audible:true,visible:true,verified:false}))).eligible,false);
});
test('listening counts bounded unique authorized audible intervals; other members and seeks do not count',()=>{
 const e=Array.from({length:4},(_,i)=>fact('listen',i,{seconds:15,sessionAuthorized:true,forwardPlayback:true,audible:true,visible:true}));
 assert.equal(run('the-truth',e).credits,40);assert.equal(run('the-truth',[e[0],e[0],e[0],e[0]]).eligible,false);
 for(const change of [{memberId:'other'},{forwardPlayback:false},{audible:false},{verifiedAt:now+1}])assert.equal(run('the-truth',e.map(v=>({...v,...change}))).eligible,false);
});
test('crate and city milestones require distinct subjects with qualifying dwell',()=>{
 const e=Array.from({length:5},(_,i)=>fact('dig',i,{subjectId:'release_'+i,seconds:8}));assert.equal(run('crate-digger',e).credits,50);
 assert.equal(run('crate-digger',e.map(v=>({...v,subjectId:'same'}))).eligible,false);
 assert.equal(run('crate-digger',e.map(v=>({...v,seconds:7}))).eligible,false);
 assert.equal(run('street-certified',e.slice(0,4).map(v=>({...v,kind:'city',seconds:5}))).credits,30);
});
test('DJ cuts exclude automatic playback and disabled sessions',()=>{
 const e=Array.from({length:4},(_,i)=>fact('cut',i,{manual:true,sessionAuthorized:true,playing:true}));assert.equal(run('chopped-in',e).credits,25);
 assert.equal(run('chopped-in',e.map(v=>({...v,manual:false}))).eligible,false);
});
test('official approval is separate from purchases and has a scoped approving role',()=>{
 const e=[fact('official_grant',1,{source:'staff',stampKey:'abn-approved',actorId:'staff_1',approvalId:'approval_1',actorRoles:['maab_approver']})];assert.equal(run('abn-approved',e).eligible,false);
 assert.equal(run('abn-approved',e.map(v=>({...v,actorRoles:['abn_approver']}))).credits,0);
});
test('project download stamps have separate idempotent identities and no invented credit amount',()=>{
 const make=id=>run('project-collector',[fact('project_download',id,{source:'download',subjectId:id,entitlementChecked:true,deliveryStarted:true,credits:10000})],{project:{id,title:id,downloadEligible:true}});
 assert.equal(make('p1').stampId,'project:p1');assert.equal(make('p1').credits,0);assert.equal(make('p1').eventKey,make('p1').eventKey);assert.notEqual(make('p1').eventKey,make('p2').eventKey);
});
test('daily accounting follows Houston calendar boundaries including daylight saving',()=>{
 assert.equal(rewardPeriod(Date.parse('2026-10-27T04:59:59Z')),'2026-10-26');assert.equal(rewardPeriod(Date.parse('2026-10-27T05:00:00Z')),'2026-10-27');
 assert.equal(rewardPeriod(Date.parse('2026-12-27T05:30:00Z')),'2026-12-26');assert.equal(policy.creditsHaveCashValue,false);
});
