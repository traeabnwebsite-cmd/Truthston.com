import test from 'node:test';
import assert from 'node:assert/strict';
import {skylineReference,skylinePosition} from '../assets/skyline-layout.mjs';
test('downtown identities preserve actual north/east relationships and one Enterprise Plaza',()=>{
 const chase=skylinePosition('JPMorgan Chase Tower'),heritage=skylinePosition('Heritage Plaza'),chevron=skylinePosition('1500 Louisiana');
 assert.ok(chase.x>heritage.x&&chase.z>heritage.z);
 assert.ok(heritage.z>chevron.z);
 assert.equal(skylineReference.filter(v=>/Enterprise|1100 Louisiana/.test(v.name)).length,1);
 assert.throws(()=>skylinePosition('Unknown tower'));
});
test('named tower plots are distinct, spread across blocks and do not overlap',()=>{
 const plots=skylineReference.map(v=>skylinePosition(v.name));
 assert.ok(Math.max(...plots.map(v=>v.x))-Math.min(...plots.map(v=>v.x))>100);
 assert.ok(Math.max(...plots.map(v=>v.z))-Math.min(...plots.map(v=>v.z))>90);
 for(let a=0;a<plots.length;a++)for(let b=a+1;b<plots.length;b++){
  const p=plots[a],q=plots[b];
  assert.ok(!(Math.abs(p.x-q.x)<(p.w+q.w)/2&&Math.abs(p.z-q.z)<(p.d+q.d)/2),p.name+' overlaps '+q.name);
 }
});
