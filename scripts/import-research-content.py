"""Create the initial editorial archive from the owner's vault. Never overwrite CMS edits."""
import json,hashlib,re,shutil,argparse
from pathlib import Path
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--vault',default='/Users/brandonhughes/Documents/Trae Website');args=parser.parse_args();vault=Path(args.vault)
target=ROOT/'content/editorial.json'
if target.exists():raise SystemExit('Editorial store already exists; import does not overwrite CMS edits.')
def load(n):return json.loads((vault/'research/catalog'/n).read_text())
def uid(prefix,s):return prefix+'-'+hashlib.sha256(s.encode()).hexdigest()[:14]
def slug(s):return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')[:120]
photos=[];by_url={};seen={}
for name in ['images_commons.json','images_platform.json','images_press.json']:
 for row in load(name):
  if name=='images_press.json' and row.get('class')!='photo':continue
  source=vault/row['local']
  if not source.exists():continue
  digest=hashlib.sha256(source.read_bytes()).hexdigest()
  if digest in seen:
   if row.get('article_url'):by_url[row['article_url']]=seen[digest]
   continue
  key=uid('photo',row['local']);seen[digest]=key;ext=source.suffix.lower();full='assets/gallery/full/'+key+ext;thumb='assets/gallery/thumbs/'+key+ext
  shutil.copy2(source,ROOT/full)
  thumbnail=vault/'images/_thumbs/web'/str(Path(row['local']).relative_to('images'))
  shutil.copy2(thumbnail if thumbnail.exists() else source,ROOT/thumb)
  title=row.get('headline') or row.get('desc') or row.get('kind') or row.get('title','Trae Tha Truth')
  date=row.get('date',row.get('date_taken',''))[:10]
  if date.startswith('undated'):date=''
  collection='Community' if set(row.get('tags',[]))&{'relief-gang','philanthropy','trae-day','angel-by-nature'} else 'Portraits' if name!='images_press.json' else 'Music & moments'
  source_url=row.get('article_url') or row.get('page') or row.get('page_url') or ''
  photos.append({'id':key,'version':1,'title':title,'caption':title,'alt':title,'date':date,'precision':row.get('date_precision') or ('day' if len(date)==10 else 'month' if len(date)==7 else 'year' if len(date)==4 else 'unknown'),'collection':collection,'credit':row.get('author') or row.get('outlet') or row.get('source') or 'ABN photo archive','license':row.get('license',''),'sourceUrl':source_url,'src':thumb,'fullSrc':full,'status':'published','featured':name=='images_commons.json','provenance':'Owner research vault; owner confirmed acquired photos usable','originalPath':row['local']})
  if row.get('article_url'):by_url[row['article_url']]=key
news=load('news.json');articles=[]
for row in news:
 tags=row.get('tags',[]);hold=bool(set(tags)&{'legal','shooting','family'}) or row.get('precision')=='approx' or 'retirement' in row['headline'].lower()
 section='Community' if set(tags)&{'philanthropy','relief-gang','trae-day','angel-by-nature'} else 'Music' if 'music' in tags else 'Houston'
 key=uid('story',row['date']+'|'+row['url']+'|'+row['headline']);summary=row.get('summary','').strip()
 articles.append({'id':key,'version':1,'title':row['headline'],'slug':slug(row['headline']),'date':row['date'],'precision':row.get('precision','day'),'section':section,'summary':summary,'body':summary,'byline':'ABN Journal / Archive desk','sourceName':row['outlet'],'sourceUrl':row['url'],'sourceDate':row['date'],'imageId':by_url.get(row['url'],''),'kind':'Archive brief','status':'draft' if hold else 'published','featured':False,'verified':False,'tags':tags,'publishAt':None,'researchNotes':'Imported from news.json; original date precision retained. '+('Editorial review required before publication.' if hold else 'Research-vault summary; source link retained.')})
# Freshly checked reporting, written as short original briefs rather than copied articles.
latest=[
 {'url':'https://thesource.com/2026/09/25/trae-tha-truth-mozzy-still-tapped-in/','title':'Still tapped in. Still moving forward.','date':'2026-09-25','source':'The Source','section':'Music','summary':'Trae Tha Truth and Mozzy reconnect on Still Tapped In, a 12-track collaboration that brings their shared perspective back to the record.','body':'Trae Tha Truth and Mozzy have released Still Tapped In. The Source reported the release on September 25, 2026, describing a 12-track project grounded in perseverance, faith and personal experience.\n\nThe collaboration includes appearances from Kalan.FrFr and Killa Twan. Read Shawn Grant’s report for the release details and track discussion.','featured':True},
 {'url':'https://www.hot97.com/news/trae-tha-truth-brings-aid-supplies-to-gary-indiana/','title':'Showing up, wherever the need is.','date':'2026-08-24','source':'HOT 97','section':'Community','summary':'Food, supplies and hands-on help: a dated report follows Trae’s relief work with storm-hit communities in northwest Indiana.','body':'HOT 97 reported on August 24, 2026 that Trae Tha Truth traveled to northwest Indiana to assist communities recovering from severe storms. The report describes work alongside Operation BBQ Relief, including meals and help clearing debris.\n\nThe coverage follows an effort that reached several communities and expanded into Gary. The original report includes local perspectives on the response.','featured':True},
 {'url':'https://defendernetwork.com/entertainment/trae-day-celebrates-19-years-of-community-impact/','title':'A week for Houston. A tradition that keeps growing.','date':'2026-07-15','source':'Defender Network','section':'Community','summary':'The 2026 Trae Day calendar brought another week of community events to Houston, with service at the center.','body':'Defender Network’s July 2026 coverage looked at Trae Day’s community tradition and the July 16–22 event week. The report describes free resources and family activities built around giving back.\n\nThis is a recap of the 2026 celebration, not an announcement of future dates. Visit the original reporting for the calendar and interview.','featured':False}
]
for n in latest:
 existing=next((a for a in articles if a['sourceUrl']==n['url']),None)
 if not existing:existing={'id':uid('story',n['url']),'version':1};articles.append(existing)
 existing.update({'title':n['title'],'slug':slug(n['title']),'date':n['date'],'precision':'day','sourceDate':n['date'],'sourceName':n['source'],'sourceUrl':n['url'],'section':n['section'],'summary':n['summary'],'body':n['body'],'byline':'ABN Journal / News desk','imageId':by_url.get(n['url'],''),'kind':'News brief','status':'published','featured':n['featured'],'verified':True,'tags':[],'publishAt':None,'researchNotes':'Source page and publication date checked October 27, 2026. Original summary, source linked.'})
# Use an explicitly captioned archive image when the new report has no matching stored photo.
indiana=next((p['id'] for p in photos if 'gary' in p['title'].lower()),'')
for a in articles:
 if a['sourceName']=='HOT 97' and 'indiana' in a['sourceUrl']:a['imageId']=indiana
projects=[]
s=(ROOT/'index.html').read_text();start=s.index('const embeddedVault=')+len('const embeddedVault=');catalog,_=json.JSONDecoder().raw_decode(s[start:])
for r in catalog['releases']:
 projects.append({'id':uid('project',r['title']+'|'+str(r['year'])),'version':1,'title':r['title'],'legacyKey':r['title']+'|'+str(r['year']),'date':r.get('date',str(r['year'])),'type':r.get('type','Project'),'cover':r.get('cover',''),'coverFileId':'','description':'','access':'member','djEligible':False,'status':'draft','tracks':[{'id':uid('track',r['title']+'|'+str(i)),'title':t if isinstance(t,str) else t.get('title',''),'fileId':'','bpm':None} for i,t in enumerate(r.get('tracks',[]),1)],'researchNotes':'Existing website catalog reference. Attach real audio before publishing from CMS.'})
photos.sort(key=lambda p:p.get('date',''),reverse=True)
state={'schemaVersion':1,'revision':1,'updatedAt':datetime.now(timezone.utc).isoformat(),'site':{'newsroomName':'The ABN Journal','newsroomTagline':'The music. The city. The mission.','eventsTitle':'Where the truth shows up.','eventsIntro':'New releases, community dates and the moments that bring us together.','galleryTitle':'A life in the frame.','galleryIntro':'On stage. In the city. With the people. Photographs from the ABN archive.','homeIntro':'A life in the music. A city in every groove.','homeInvitation':'Come inside. Dig a little deeper.'},'articles':articles,'photos':photos,'projects':projects,'events':[
 {'id':'event-trae-day-2026','version':1,'title':'Trae Day 2026 / A week for the city','startDate':'2026-07-16','endDate':'2026-07-22','category':'Community','venue':'Houston, Texas','description':'The July 16–22 community week documented in Defender Network’s 2026 coverage. This event has ended.','sourceUrl':latest[2]['url'],'sourceName':'Defender Network','status':'published','imageId':next((p['id'] for p in photos if '2026' in p['date'] and 'trae day' in p['title'].lower()),''),'linkLabel':'Read the 2026 coverage'},
 {'id':'event-still-tapped-in-release','version':1,'title':'Still Tapped In / Release day','startDate':'2026-09-25','endDate':'2026-09-25','category':'Music','venue':'Release archive','description':'Release date recorded in The Source’s coverage of the collaborative project.','sourceUrl':latest[0]['url'],'sourceName':'The Source','status':'published','imageId':by_url.get(latest[0]['url'],''),'linkLabel':'Read the release report'}
 ],'audit':[{'id':'initial-import','at':datetime.now(timezone.utc).isoformat(),'action':'research-import','detail':{'vaultNews':len(news),'photos':len(photos),'projects':len(projects)},'actor':'Local team console'}]}
state['products']=json.loads((ROOT/'assets/config/merch-seed.json').read_text())
target.parent.mkdir(exist_ok=True);target.write_text(json.dumps(state,ensure_ascii=False,indent=2))
print(f'Imported {len(articles)} articles ({sum(a["status"]=="published" for a in articles)} published briefs), {len(photos)} unique photos, {len(projects)} draft project references.')
