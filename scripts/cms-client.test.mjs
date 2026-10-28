import test from 'node:test';
import assert from 'node:assert/strict';
import {createCmsApi} from '../assets/cms/api.js';
import {createUploader} from '../assets/cms/uploads.js';
import {blankRecord} from '../assets/cms/editors/defaults.js';
test('CMS transport keeps same-origin credentials and current CSRF across JSON and binary writes',async()=>{
 const calls=[];let csrf='one';const api=createCmsApi({getCsrf:()=>csrf,fetcher:async(url,options)=>{calls.push({url,options});return{ok:true,json:async()=>({ok:true})}}});
 await api('session');csrf='two';await api('record',{record:{title:'x'}});const bytes=new Uint8Array([1,2]);await api('uploads/id/chunk',bytes,true,4);
 assert.equal(calls[0].options.credentials,'same-origin');assert.deepEqual(calls[0].options.headers,{});assert.equal(calls[1].options.headers['X-CMS-CSRF'],'two');assert.equal(calls[2].options.headers['Upload-Offset'],'4');assert.equal(calls[2].options.body,bytes);
});
test('CMS uploader sequences all chunks before complete and reports progress',async()=>{
 const calls=[],messages=[];const size=4*1024*1024+1;const result=await createUploader({say:v=>messages.push(v),api:async(path,data,raw,offset)=>{calls.push({path,data,raw,offset});return path==='uploads'?{id:'id'}:{fileId:'ready'}}})({name:'record.mp3',size,slice:(a,b)=>({a,b})},'audio');
 assert.deepEqual(calls.map(v=>v.path),['uploads','uploads/id/chunk','uploads/id/chunk','uploads/id/complete']);assert.equal(calls[2].offset,4*1024*1024);assert.deepEqual(result,{fileId:'ready'});assert.match(messages.at(-1),/Save this item/);
});
test('new product and project editor defaults remain drafts with no price or fabricated tracks',()=>{
 const product=blankRecord('products'),project=blankRecord('projects');assert.equal(product.status,'draft');assert.equal(product.priceCents,null);assert.equal(product.availability,'coming-soon');assert.equal(project.access,'member');assert.deepEqual(project.tracks,[]);
});
