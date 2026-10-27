// Public architectural reference coordinates; north is +Z, east is +X.
// Relative downtown geography is retained. Other Houston districts remain compressed.
export const skylineReference = [
 ['JPMorgan Chase Tower',29.760556,-95.363889,8,6],
 ['Wells Fargo Plaza',29.7584396,-95.368263,9.4,6.6],
 ['Heritage Plaza',29.75861,-95.37055,8.8,7],
 ['TC Energy Center',29.7605,-95.3666,8,6],
 ['Pennzoil Place',29.7603,-95.3657,13.2,8],
 ['One Shell Plaza',29.7591,-95.3677,8,7],
 ['Enterprise Plaza / 1100 Louisiana',29.75768,-95.36906,8,6],
 ['CenterPoint Energy Plaza',29.757214,-95.367962,6,7],
 ['1600 Smith Street',29.75518,-95.37275,8,3.6],
 ['609 Main at Texas',29.7594,-95.3624,7,8],
 ['Texas Tower',29.76089,-95.36339,6,8],
 ['1500 Louisiana',29.7547,-95.37115,9,8],
 ['1400 Smith Street',29.75554,-95.37182,7,9]
].map(([name,lat,lon,w,d])=>({name,lat,lon,w,d}));
export function skylinePosition(name) {
 const p=skylineReference.find(v=>v.name===name);
 if(!p)throw new Error('Unknown skyline reference: '+name);
 return {...p,x:(p.lon+95.3676)*96640*.15,z:-175+(p.lat-29.7581)*111320*.15};
}
