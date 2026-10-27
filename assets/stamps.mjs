// Presentation only. A rendered impression never grants an award or credits.
const designs = {
  abn: { shape: 'banner', color: '#a32d24', lines: ['ABN APPROVED'], top: 'ANGEL BY NATURE', bottom: 'TRUTHSTON · TEXAS' },
  truth: { shape: 'rectangle', color: '#292b28', lines: ['THE', 'TRUTH'] },
  maab: { shape: 'round', color: '#292b28', lines: ['GUERILLA', 'MAAB'] },
  street: { shape: 'octagon', color: '#68747d', metallic:'silver', lines: ['STREET', 'CERTIFIED'] },
  crate: { shape: 'square', color: '#92621d', lines: ['CRATE', 'DIGGER'] },
  chop: { shape: 'oval', color: '#7545ab', lines: ['CHOPPED', 'IN'] },
  project: { shape: 'ticket', color: '#fffaf0', paper:'#24342f', lines: ['PROJECT', 'COLLECTOR'] },
  trae: { shape: 'round', color: '#292b28', lines: ['TRAE THA', 'TRUTH'], top:'GUERILLA MAAB', bottom: 'TRUTHSTON · TEXAS' },
  '6-tre-g': { shape: 'octagon', color: '#292b28', lines: ['6 TRE G'], top:'GUERILLA MAAB', bottom: 'TRUTHSTON · TEXAS' },
  'dougie-d': { shape: 'rectangle', color: '#292b28', lines: ['DOUGIE', 'D'], top:'GUERILLA MAAB', bottom: 'TRUTHSTON · TEXAS' },
  roc: { shape: 'diamond', color: '#292b28', lines: ['ROC'], top:'GUERILLA MAAB', bottom: 'TRUTHSTON · TEXAS' }
};

const projectInk={color:'#a17423',metallic:'gold',top:'TRUTHSTON PROJECTS',bottom:'PROJECT SERIES'};
const screwedInk={color:'#7545ab',top:'SCREWED & CHOPPED',bottom:'TRUTHSTON · TEXAS'};
const eventInk={color:'#2c7250',top:'TRAE DAY',bottom:'COMMUNITY SERIES'};
Object.assign(designs,{
 'losing-control':{...projectInk,shape:'rectangle',lines:['LOSING','CONTROL']},
 'king-streets':{...projectInk,shape:'round',lines:['KING OF','THE STREETS']},
 'tha-truth-project':{...projectInk,shape:'square',lines:['THA','TRUTH']},
 restless:{...projectInk,shape:'ticket',lines:['RESTLESS']},
 'dj-screw':{...screwedInk,shape:'round',lines:['DJ','SCREW']},
 slabbed:{...screwedInk,shape:'rectangle',lines:['S.L.A.B.ED']},
 'rap-a-lot':{shape:'square',color:'#292b28',lines:['RAP-A-LOT'],top:'TRUTHSTON · TEXAS',bottom:'AFFILIATION SERIES'},
 'hustle-gang':{shape:'octagon',color:'#d55c23',lines:['HUSTLE','GANG'],top:'TRUTHSTON · TEXAS',bottom:'AFFILIATION SERIES'},
 'trae-day-houston':{...eventInk,shape:'round',lines:['HOUSTON'],bottom:'HOUSTON · TEXAS'},
 'trae-day-katy':{...eventInk,shape:'ticket',lines:['KATY'],bottom:'KATY · TEXAS'},
 'relief-gang':{shape:'round',color:'#167d9a',lines:['RELIEF','GANG'],top:'FOR THE PEOPLE',bottom:'COMMUNITY SERIES'},
 'relief-gang-service':{shape:'rectangle',color:'#167d9a',lines:['RELIEF GANG','SHOW UP'],top:'FOR THE PEOPLE',bottom:'COMMUNITY SERIES'},
 'angel-by-nature':{shape:'round',color:'#a32d24',lines:['ANGEL','BY NATURE'],top:'ABN · TRUTHSTON',bottom:'FOR THE PEOPLE'},
 'abn-vault':{shape:'square',color:'#fffaf0',paper:'#24342f',lines:['ABN','VAULT'],top:'TRUTHSTON · TEXAS',bottom:'MEMBER SERIES'}
});

// Family identities are deliberate: matching shape and ink for related collectibles.
for(const id of ['maab','trae','6-tre-g','dougie-d','roc'])Object.assign(designs[id],{shape:'round',color:'#292b28'});
for(const id of ['project','losing-control','king-streets','tha-truth-project','restless'])Object.assign(designs[id],{shape:'rectangle',color:'#a17423',metallic:'gold',paper:undefined});
for(const id of ['chop','dj-screw','slabbed'])Object.assign(designs[id],{shape:'oval',color:'#7545ab'});
for(const id of ['trae-day-houston','trae-day-katy'])Object.assign(designs[id],{shape:'round',color:'#2c7250'});
for(const id of ['relief-gang','relief-gang-service'])Object.assign(designs[id],{shape:'round',color:'#167d9a'});
Object.assign(designs['angel-by-nature'],{shape:'banner',lines:['ANGEL BY NATURE']});

Object.assign(designs['rap-a-lot'],{logo:'rap',bottom:'HOUSTON · TEXAS'});Object.assign(designs['hustle-gang'],{logo:'hustle',shape:'logo-seal',bottom:'HUSTLE GANG'});
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
function wear(seed) {
  let state = [...seed].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 47);
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  return Array.from({ length: 230 }, () => `<ellipse cx="${(8 + random()*224).toFixed(1)}" cy="${(8 + random()*224).toFixed(1)}" rx="${(.3 + random()*.9).toFixed(2)}" ry="${(.3 + random()*1.15).toFixed(2)}"/>`).join('');
}
export function renderStamp(id, { scope = 'book', name = 'Project Collector' } = {}) {
  const d = designs[id] || { ...designs.project, lines: [name] };
  const isMaab=['maab','trae','6-tre-g','dougie-d','roc'].includes(id);
  const uid = `stamp-${scope}-${id}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const gradient=d.metallic==='gold'?['#825217','#c7943f','#95621e']:['#46545f','#9ba9b1','#566571'];
  const logoFilter=d.logo==='hustle'?'1 0 0 0 0':'-.333 -.333 -.333 1 0';
  const logoDefs=d.logo?`<filter id="${uid}-logo-ink" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${logoFilter}"/></filter><mask id="${uid}-logo" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240">${d.logo==='hustle'?`<image href="assets/branding/hustle-gang-supplied.png" x="10" y="10" width="220" height="220" filter="url(#${uid}-logo-ink)"/>`:`<image href="assets/branding/rap-a-lot-logo.jpg" x="39" y="83" width="162" height="84" filter="url(#${uid}-logo-ink)"/>`}</mask>`:'';
  const round = d.shape === 'round' || d.shape === 'banner';
  let border;
  if (round) border = '<circle cx="120" cy="120" r="104" stroke-width="4"/><circle cx="120" cy="120" r="98" stroke-width="1.4"/>';
  else if (d.shape === 'oval') border = '<ellipse cx="120" cy="120" rx="109" ry="83" stroke-width="4"/><ellipse cx="120" cy="120" rx="102" ry="76" stroke-width="1.3"/>';
  else if (d.shape === 'diamond') border = '<path d="M120 12L229 120 120 228 11 120Z" stroke-width="4"/><path d="M120 22L219 120 120 218 21 120Z" stroke-width="1.3"/>';
  else if (d.shape === 'octagon') border = '<path d="M61 20H179L220 61V179L179 220H61L20 179V61Z" stroke-width="4"/><path d="M64 27H176L213 64V176L176 213H64L27 176V64Z" stroke-width="1.3"/>';
  else if (d.shape === 'ticket') border = '<path d="M18 45H222V94Q202 94 202 120Q202 146 222 146V195H18V146Q38 146 38 120Q38 94 18 94Z" stroke-width="4"/><path d="M47 53H193M47 187H193" stroke-width="1.3"/>';
  else { const y = d.shape === 'square' ? 22 : 45, h = d.shape === 'square' ? 196 : 150; border = `<rect x="18" y="${y}" width="204" height="${h}" rx="3" stroke-width="4"/><rect x="25" y="${y+7}" width="190" height="${h-14}" rx="1" stroke-width="1.3"/>`; }
  // Fine rim work and side flourishes keep the entire collection as detailed as the approval seal.
  let ornaments='';
  if(round){border+='<circle cx="120" cy="120" r="109" stroke-width=".85" stroke-dasharray="1 3"/>';}
  else if(d.shape==='oval'){border+='<ellipse cx="120" cy="120" rx="114" ry="88" stroke-width=".85" stroke-dasharray="1 3"/>';}
  if(round||d.shape==='oval'){
    const x=d.shape==='oval'?25:36;
    const leaf=`<path d="M${x+3} 148Q${x-9} 120 ${x+3} 93" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M${x} 137q-10 0-9-9q10 0 9 9M${x-3} 124q-9-3-6-11q9 3 6 11M${x-1} 111q-8-6-2-12q8 6 2 12M${x+2} 137q8-6 6-13q-8 4-6 13M${x} 123q9-5 8-12q-9 3-8 12"/>`;
    ornaments=leaf+`<g transform="translate(240 0) scale(-1 1)">${leaf}</g>`;
  }else{
    ornaments='<g fill="none" stroke="currentColor" stroke-width="1"><path d="M34 83V61H55M185 61H206V83M34 157V179H55M185 179H206V157"/><path d="M38 84V65H56M184 65H202V84M38 156V175H56M184 175H202V156"/></g><path d="M47 70l3 3-3 3-3-3zM193 70l3 3-3 3-3-3zM47 164l3 3-3 3-3-3zM193 164l3 3-3 3-3-3z"/>';
    if(d.shape==='octagon')ornaments='<g fill="none" stroke="currentColor" stroke-width="1"><path d="M48 58L59 47H78M162 47H181L192 58M48 182L59 193H78M162 193H181L192 182"/><circle cx="39" cy="120" r="2.5"/><circle cx="201" cy="120" r="2.5"/></g>';
  }
  if(isMaab){border='<circle cx="120" cy="120" r="112" stroke-width="4.5"/><circle cx="120" cy="120" r="106" stroke-width="1.8"/><circle cx="120" cy="120" r="77" stroke-width="3.5"/><circle cx="120" cy="120" r="72" stroke-width="1.3"/>';ornaments='<g fill="none" stroke="currentColor"><circle cx="26" cy="120" r="6.5" stroke-width="2"/><circle cx="26" cy="120" r="3.4" stroke-width="1"/><circle cx="214" cy="120" r="6.5" stroke-width="2"/><circle cx="214" cy="120" r="3.4" stroke-width="1"/></g><circle cx="26" cy="120" r="1.3"/><circle cx="214" cy="120" r="1.3"/>';}
  if(d.shape==='logo-seal'){border='';ornaments='';}
  const angelWings='<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M109 80C89 80 64 68 53 48C65 55 76 57 88 56L84 63L99 66L95 71L109 80Z"/><path d="M131 80C151 80 176 68 187 48C175 55 164 57 152 56L156 63L141 66L145 71L131 80Z"/><path d="M63 59L100 76M177 59L140 76"/><ellipse cx="120" cy="63" rx="11" ry="3"/></g>';
  const top = isMaab?'GUERILLA MAAB':d.top || 'TRUTHSTON · TEXAS', bottom = isMaab?'TRUTHSTON · TEXAS':d.bottom || 'IN THE STAMP BOOK';
  let text;
  if (round) text = `<text class="${isMaab?'stamp-title':'stamp-label'}" font-size="${isMaab?20:12.5}" letter-spacing="${isMaab?1.3:1.8}"><textPath href="#${uid}-top" startOffset="50%" text-anchor="middle">${escape(top)}</textPath></text><text class="${isMaab?'stamp-title':'stamp-label'}" font-size="${isMaab?17:11.5}" letter-spacing="1.6"><textPath href="#${uid}-bottom" startOffset="50%" text-anchor="middle">${escape(bottom)}</textPath></text>`;
  else { const ty = d.shape === 'diamond' ? 80 : d.shape === 'oval' ? 72 : 68, by = d.shape === 'diamond' ? 168 : 183; text = `<text x="120" y="${ty}" class="stamp-label" font-size="10" letter-spacing="1">${escape(top)}</text><text x="120" y="${by}" class="stamp-label" font-size="10" letter-spacing=".7">${escape(bottom)}</text>`; }
  if(d.shape==='logo-seal')text='';
  if (d.shape === 'banner') text += `${id==='angel-by-nature'?angelWings:'<g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M99 69H141M104 74H136M110 79H130"/></g>'}<g transform="translate(109 156) scale(.9)"><path d="M3 10h4v12H3zM9 21V10l5-8q1-2 3-1q2 1 1 4l-1 4h5q3 0 2 4l-2 7q-.5 2-3 2h-7q-2 0-3-1z"/></g><rect x="8" y="86" width="224" height="64" rx="3" fill="var(--paper,#eee6d3)" stroke="currentColor" stroke-width="4"/><rect x="13" y="91" width="214" height="54" rx="1" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="120" y="132" class="stamp-title" font-size="37" letter-spacing="-.4" textLength="202" lengthAdjust="spacingAndGlyphs">${escape(d.lines[0])}</text>`;
  else if(d.logo)text+=`<rect x="${d.shape==='logo-seal'?0:30}" y="${d.shape==='logo-seal'?0:76}" width="${d.shape==='logo-seal'?240:180}" height="${d.shape==='logo-seal'?240:100}" fill="currentColor" mask="url(#${uid}-logo)"/>`;
  else text += d.lines.map((line,i) => { const width=isMaab?110:round?140:d.shape==='oval'?164:d.shape==='octagon'?155:174;const size=d.lines.length===1?Math.min(isMaab?48:59,width/Math.max(3,line.length)*1.7):(isMaab?34:42);const fit=line.length>=5?` textLength="${width}" lengthAdjust="spacingAndGlyphs"`:'';return `<text x="120" y="${d.lines.length===1?139:i?151:112}" class="stamp-title" font-size="${size.toFixed(1)}"${fit}>${escape(line)}</text>`; }).join('');
  return `<svg class="ink-stamp-art" viewBox="0 0 240 240" aria-hidden="true" focusable="false" style="color:${d.color}"><defs>${logoDefs}<linearGradient id="${uid}-metal" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="${gradient[0]}"/><stop offset=".5" stop-color="${gradient[1]}"/><stop offset="1" stop-color="${gradient[2]}"/></linearGradient><path id="${uid}-top" d="M40 120A80 80 0 0 1 200 120"/><path id="${uid}-bottom" d="${isMaab?'M30 130A90 90 0 0 0 210 130':'M33 130A88 88 0 0 0 207 130'}"/><mask id="${uid}-wear"><rect width="240" height="240" fill="white"/><g fill="black">${wear(id)}</g></mask></defs>${d.paper?`<rect x="2" y="2" width="236" height="236" rx="5" fill="${d.paper}"/>`:''}<g text-anchor="middle" fill="${d.metallic?`url(#${uid}-metal)`: 'currentColor'}" mask="url(#${uid}-wear)"><g fill="none" stroke="currentColor">${border}</g>${ornaments}${text}</g></svg>`;
}
