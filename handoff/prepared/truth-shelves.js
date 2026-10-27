function sleeveAt(idx,x,y,z,size,ry=0){const r=releases[idx];if(!r)return null;const m=new T.MeshStandardMaterial({map:textures[idx],roughness:.72,emissive:'#d9902b',emissiveIntensity:0,side:T.DoubleSide});const s=new T.Mesh(new T.PlaneGeometry(size,size),m);s.position.set(x,y,z);s.rotation.y=ry;s.userData={release:r,base:s.position.clone(),normal:new T.Vector3(Math.sin(ry),0,Math.cos(ry)),sleeve:true};world.add(s);sleeves.push(s);hit(s,r.title+' / '+r.year,()=>release(r));return s}
// 64 full-face sleeves across the back wall; every displayed artwork is different.
for(let row=0;row<4;row++){box(11.8,.14,.65,wood,-1.7,1.05+row*.91,-5.25);for(let col=0;col<16;col++)sleeveAt(row*16+col,-7.35+col*.73,1.49+row*.91,-5.15,.68)}for(let i=0;i<6;i++)box(.1,3.85,.68,wood,-7.65+i*2.38,2.6,-5.25);
// The archive continues around the left wall and the front-right wall instead of repeating covers.
for(let row=0;row<4;row++){box(.55,.12,10.1,wood,-8.15,1.0+row*.95,.15);for(let col=0;col<8;col++)sleeveAt(64+row*8+col,-8.15,1.5+row*.95,-4.55+col*1.28,.84,Math.PI/2)}
for(let row=0;row<4;row++){box(.55,.12,5.5,wood,8.15,1.02+row*.95,2.65);for(let col=0;col<6;col++)sleeveAt(96+row*6+col,8.12,1.49+row*.95,.48+col*.86,.74,-Math.PI/2)}
// The final 18 distinct releases sit in the three foreground bins.
for(let crate=0;crate<3;crate++){const x=-4.9+crate*2.2,z=-.4;box(1.9,1.35,1.5,wood,x,.65,z);box(1.76,.09,1.3,dark,x,1.36,z);label(['HOUSTON','MIXTAPES','DEEP CUTS'][crate],1.55,.38,x,.8,z+.76,'#25271e','#c4b28d',95);for(let j=0;j<6;j++){const s=sleeveAt(120+crate*6+j,x,1.7,-.9+j*.21,1.3);if(s)s.rotation.x=-.12}}
canvas.dataset.shelfAudit=JSON.stringify({displayed:sleeves.length,distinctArtwork:new Set(sleeves.map(s=>s.userData.release.cover)).size});
