import test from 'node:test';
import assert from 'node:assert/strict';
import {createAudioEngine} from '../assets/app/features/audio/engine.js';
function fixture({missing=false}={}) {
 const param=()=>({value:0,setTargetAtTime(v){this.value=v},setValueAtTime(v){this.value=v},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
 const node=()=>({gain:param(),playbackRate:param(),positionX:param(),positionY:param(),positionZ:param(),connect(){},disconnect(){},start(when,offset){this.started=[when,offset]},stop(){this.stopped=true}});
 const buffer={duration:120,sampleRate:100,numberOfChannels:1,getChannelData:()=>new Float32Array(12000)};
 const context={currentTime:10,sampleRate:100,destination:node(),createGain:node,createPanner:node,createBufferSource:node,createAnalyser:()=>({...node(),getByteFrequencyData(a){a.fill(0)}}),createDynamicsCompressor:()=>({...node(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()}),createBuffer:(ch,length,sr)=>({duration:length/sr,sampleRate:sr,numberOfChannels:ch,getChannelData:()=>new Float32Array(length)}),decodeAudioData:async()=>buffer,resume:async()=>{},close:async()=>{context.closed=true}};
 const events=[];const audio=createAudioEngine({contextFactory:()=>context,fetchAudio:async()=>({ok:!missing,arrayBuffer:async()=>new ArrayBuffer(1)}),recordActivity:(...x)=>events.push(x)});
 return{audio,context,events};
}
test('two copies start at the same audio clock with B one beat ahead; pitch preserves the playhead',async()=>{
 const{audio,context}=fixture();assert.equal(audio.ctx,undefined);await audio.play();assert.equal(audio.analyser.fftSize,2048);assert.equal(audio.decks[0].node.started[0],audio.decks[1].node.started[0]);assert.ok(Math.abs(audio.decks[1].offset-audio.decks[0].offset-60/64.6)<1e-9);
 context.currentTime=15;const before=audio.position();audio.setDeckPitch(0,.75);assert.equal(audio.position(),before);context.currentTime+=2;assert.equal(audio.position(),before+1.5);await audio.play();assert.equal(audio.playing,false);await audio.destroy();assert.equal(context.closed,true);
});
test('manual cuts use equal-power gains and report activity; reverse scratch creates reversed audio',async()=>{
 const{audio,events}=fixture();await audio.play();audio.setCrossfade(1,true);assert.ok(audio.decks[0].out.gain.value<1e-10);assert.equal(audio.decks[1].out.gain.value,1);assert.equal(events[0][0],'cut');audio.scratchVoice(0,1,-1);assert.notEqual(audio.decks[0].scratchVoice.buffer,audio.buffer);assert.equal(audio.decks[0].scratchVoice.buffer.duration,.22);await audio.destroy();
});
test('missing private master generates original audio; subscription cleanup stops notifications',async()=>{
 const{audio}=fixture({missing:true});let updates=0;const off=audio.subscribe(()=>updates++);await audio.play();assert.equal(audio.providedTrack,false);assert.equal(audio.buffer.duration,12);assert.ok(updates>0);off();const count=updates;audio.setCrossfade(-1);assert.equal(updates,count);await audio.destroy();
});
