"""Disk-backed local team CMS. Production adapters must enforce real staff identity/roles."""
import copy,hashlib,json,os,re,shutil,threading,uuid
from contextlib import contextmanager
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlparse
try: import fcntl
except ImportError: fcntl=None

class CmsError(Exception):
    def __init__(self,message,status=400):self.status=status;super().__init__(message)

def now_iso():return datetime.now(timezone.utc).isoformat()
def valid_url(value):
    if not value:return ''
    u=urlparse(str(value))
    if u.scheme not in ('https','http') or not u.netloc or u.username or u.password:raise CmsError('Use a complete http or https URL.')
    return str(value)
def clean_text(value,limit=2000):
    if not isinstance(value,str):raise CmsError('Text field has an invalid value.')
    if len(value)>limit:raise CmsError('Text field is too long.')
    return value.strip()
def valid_date(value,precision='day',required=False):
    if not value:
        if required:raise CmsError('Add a date before publishing.')
        return ''
    fmt={'day':'%Y-%m-%d','month':'%Y-%m','year':'%Y','approx':'%Y-%m','unknown':'%Y-%m-%d'}.get(precision)
    try:datetime.strptime(value,fmt)
    except (ValueError,TypeError):raise CmsError('Date does not match its precision.')
    return value

def public_snapshot(state,now=None):
    instant=now or now_iso()
    def visible(r):return (r.get('status')=='published' or (r.get('status')=='scheduled' and r.get('publishAt') and r['publishAt']<=instant))
    out={'schemaVersion':1,'revision':state.get('revision',1),'updatedAt':state.get('updatedAt'),'site':copy.deepcopy(state.get('site',{}))}
    fields={
      'articles':['id','slug','title','date','precision','section','summary','body','byline','sourceName','sourceUrl','sourceDate','imageId','kind','featured','verified'],
      'photos':['id','title','caption','alt','date','precision','collection','credit','license','sourceUrl','src','fullSrc','featured','contentHash'],
      'events':['id','title','startDate','endDate','category','venue','description','sourceName','sourceUrl','imageId','linkLabel'],
      'products':['id','title','description','category','kind','color','image','imageId','priceCents','currency','sizes','availability','stock','checkoutUrl','featured']}
    for collection,allow in fields.items():
        out[collection]=[{key:r.get(key) for key in allow} for r in state.get(collection,[]) if visible(r)]
    out['projects']=[]
    for p in state.get('projects',[]):
        if not visible(p):continue
        entry={key:p.get(key) for key in ['id','title','legacyKey','date','type','description','cover','access','djEligible']}
        entry['tracks']=[{'id':t['id'],'title':t['title'],'bpm':t.get('bpm'),'audioUrl':f'/api/projects/{p["id"]}/tracks/{t["id"]}/audio' if p.get('access')=='public' and t.get('fileId') else None} for t in p.get('tracks',[])]
        out['projects'].append(entry)
    return out

class CmsStore:
    def __init__(self,root,mirrors=()):
        self.root=Path(root).resolve();self.mirrors=[Path(x).resolve() for x in mirrors if Path(x).resolve()!=self.root]
        self.path=self.root/'content/editorial.json';self.private=self.root/'.local-media';self.private.mkdir(exist_ok=True);self.thread_lock=threading.RLock()
        self.upload_dir=self.private/'uploads';self.upload_dir.mkdir(exist_ok=True)
        if not self.path.exists():
            public=self.root/'assets/content/site.json'
            state=json.loads(public.read_text()) if public.exists() else {'schemaVersion':1,'revision':1,'site':{},'articles':[],'photos':[],'projects':[],'events':[],'products':[]}
            state['audit']=[]
            for kind in ['articles','photos','projects','events','products']:
                for r in state.get(kind,[]):r.update(status='published',version=1)
            self.path.parent.mkdir(exist_ok=True);self.path.write_text(json.dumps(state,ensure_ascii=False,indent=2))
        with self.lock():self._publish(self._read())
    @contextmanager
    def lock(self):
        with self.thread_lock:
            with open(self.private/'cms.lock','a') as handle:
                if fcntl:fcntl.flock(handle,fcntl.LOCK_EX)
                try:yield
                finally:
                    if fcntl:fcntl.flock(handle,fcntl.LOCK_UN)
    def _read(self):return json.loads(self.path.read_text())
    def state(self):
        with self.lock():return self._read()
    def public(self):
        with self.lock():return public_snapshot(self._read())
    def _atomic(self,path,data):
        path.parent.mkdir(parents=True,exist_ok=True);tmp=path.with_name(path.name+'.'+uuid.uuid4().hex+'.tmp');tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2));os.replace(tmp,path)
    def _publish(self,state):
        view=public_snapshot(state)
        for root in [self.root]+self.mirrors:
            if root!=self.root and not (root/'index.html').exists():continue
            self._atomic(root/'assets/content/site.json',view)
            if root!=self.root:self._atomic(root/'content/editorial.json',state)
    def _asset(self,file_id):
        if not isinstance(file_id,str) or not re.fullmatch(r'[a-f0-9]{32}',file_id):raise CmsError('Unknown uploaded file.',404)
        meta=self.upload_dir/(file_id+'.json')
        if not meta.exists():raise CmsError('Uploaded file not found.',404)
        info=json.loads(meta.read_text())
        if not info.get('complete'):raise CmsError('This upload has not finished.',409)
        return info,self.upload_dir/(file_id+'.bin')
    def asset(self,file_id):
        with self.lock():return self._asset(file_id)
    def _publish_image(self,file_id):
        info,path=self._asset(file_id)
        if info['kind']!='photo':raise CmsError('Choose an uploaded photo for this image.')
        relative='assets/uploads/'+file_id+info['extension']
        for root in [self.root]+self.mirrors:
            target=root/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,target)
        return relative
    def _validate(self,collection,r,state):
        if collection not in ['articles','photos','events','projects','products']:raise CmsError('Unknown content collection.')
        if not isinstance(r,dict):raise CmsError('Record must be an object.')
        r=copy.deepcopy(r)
        if r.get('status') not in ['draft','published','scheduled']:raise CmsError('Choose draft, published or scheduled.')
        for field in ['title','summary','body','description','caption','alt','credit','byline','venue','linkLabel','researchNotes','sourceName']:
            if field in r:r[field]=clean_text(r[field],16000 if field=='body' else 2400)
        if not r.get('title'):raise CmsError('A title is required.')
        if len(r['title'])>250:raise CmsError('Keep the title under 250 characters.')
        for field in ['sourceUrl','checkoutUrl']:
            if field in r:r[field]=valid_url(r[field])
        for field in ['src','fullSrc','image','cover']:
            if r.get(field) and not (re.fullmatch(r'assets/[A-Za-z0-9_./-]+',r[field]) and '..' not in Path(r[field]).parts) and not re.fullmatch(r'/api/cms/assets/[a-f0-9]{32}',r[field]):raise CmsError('Choose an image from the media library or upload a photo.')
        live=r['status']!='draft'
        if r['status']=='scheduled':
            try:dt=datetime.fromisoformat(r.get('publishAt','').replace('Z','+00:00'))
            except (ValueError,TypeError):raise CmsError('Add a valid scheduled publication time.')
            if dt.tzinfo is None:raise CmsError('Scheduled time must include a timezone.')
            r['publishAt']=dt.astimezone(timezone.utc).isoformat()
        else:r['publishAt']=None
        if collection=='articles':
            r['date']=valid_date(r.get('date',''),r.get('precision','day'),live)
            if r.get('precision') not in ['day','month','year','approx','unknown']:raise CmsError('Choose a valid date precision.')
            r['slug']=re.sub(r'[^a-z0-9]+','-',str(r.get('slug') or r['title']).lower()).strip('-')[:120]
            if live and (not r.get('body') or not r.get('summary')):raise CmsError('Add an article summary and body before publishing.')
            if r.get('kind') in ['News brief','Archive brief'] and live and (not r.get('sourceUrl') or not r.get('sourceName')):raise CmsError('Sourced briefs need an outlet and source URL.')
            r['verified']=bool(r.get('verified',False))
        elif collection=='photos':
            if live and not r.get('alt'):raise CmsError('Add descriptive alt text before publishing.')
            r['date']=valid_date(r.get('date',''),r.get('precision','day'))
            if r.get('fileId'):
                info,_=self._asset(r['fileId']);r['contentHash']=info['sha256']
                if live:r['src']=r['fullSrc']=self._publish_image(r['fileId'])
                else:r['src']=r['fullSrc']='/api/cms/assets/'+r['fileId']
            else:
                image_path=(self.root/str(r.get('fullSrc') or r.get('src') or '')).resolve()
                if image_path.is_relative_to(self.root/'assets') and image_path.is_file():
                    r['contentHash']=hashlib.sha256(image_path.read_bytes()).hexdigest()
                else:r.pop('contentHash',None)
            if live and not r.get('src'):raise CmsError('Choose or upload an image.')
        elif collection=='events':
            r['startDate']=valid_date(r.get('startDate',''),'day',live);r['endDate']=valid_date(r.get('endDate',''),'day') or r['startDate']
            if r['startDate'] and r['endDate']<r['startDate']:raise CmsError('End date must be on or after the start date.')
        elif collection=='products':
            price=r.get('priceCents');stock=r.get('stock')
            if price is not None and (not isinstance(price,int) or isinstance(price,bool) or price<0):raise CmsError('Price must be a nonnegative number of cents, or empty.')
            if stock is not None and (not isinstance(stock,int) or isinstance(stock,bool) or stock<0):raise CmsError('Stock must be a nonnegative whole number, or empty.')
            if r.get('availability') not in ['coming-soon','available','sold-out']:raise CmsError('Choose a valid availability.')
            if r.get('currency','USD')!='USD':raise CmsError('This store currently uses USD.')
            if not isinstance(r.get('sizes',[]),list) or any(not isinstance(size,str) or len(size)>40 for size in r.get('sizes',[])):raise CmsError('Sizes must be short text values.')
            if live and r.get('availability')=='available' and not r.get('checkoutUrl'):raise CmsError('Available products need a real checkout or official product link.')
            if r.get('imageFileId'):
                self._asset(r['imageFileId']);r['image']=self._publish_image(r['imageFileId']) if live else '/api/cms/assets/'+r['imageFileId']
        elif collection=='projects':
            r['date']=valid_date(r.get('date',''),'day' if len(r.get('date',''))==10 else 'year',live)
            if r.get('access') not in ['public','member','purchase']:raise CmsError('Choose public, member or purchase access.')
            tracks=r.get('tracks',[])
            if not isinstance(tracks,list) or len(tracks)>100:raise CmsError('A project can have up to 100 tracks.')
            used=set()
            for t in tracks:
                if not isinstance(t,dict) or not clean_text(t.get('title',''),250):raise CmsError('Every track needs a title.')
                if not re.fullmatch(r'[A-Za-z0-9_.-]{1,120}',str(t.get('id',''))):t['id']='track-'+uuid.uuid4().hex[:12]
                if t['id'] in used:raise CmsError('Track IDs must be unique within a project.')
                used.add(t['id'])
                if t.get('bpm') is not None and (not isinstance(t['bpm'],(int,float)) or isinstance(t['bpm'],bool) or not 30<=t['bpm']<=240):raise CmsError('BPM must be between 30 and 240, or empty.')
                if t.get('fileId'):
                    info,_=self._asset(t['fileId'])
                    if info['kind']!='audio':raise CmsError('A track must use an MP3 audio upload.')
                elif live:raise CmsError('Attach an MP3 to every track before publishing.')
            if live and not tracks:raise CmsError('Add at least one MP3 track before publishing.')
            if r.get('coverFileId'):
                self._asset(r['coverFileId']);r['cover']=self._publish_image(r['coverFileId']) if live else '/api/cms/assets/'+r['coverFileId']
            if live and not r.get('cover'):raise CmsError('Add project artwork before publishing.')
        return r
    def save(self,collection,record,expected_version=0):
        with self.lock():
            if not isinstance(record,dict):raise CmsError('Record must be an object.')
            state=self._read();items=state.setdefault(collection,[]) if collection in ['articles','photos','events','projects','products'] else None
            if items is None:raise CmsError('Unknown collection.')
            current=next((r for r in items if r['id']==record.get('id')),None)
            if current and expected_version!=current.get('version',1):raise CmsError('This item changed in another editor. Reload before saving.',409)
            if not current and record.get('id') and expected_version:raise CmsError('Content record no longer exists.',409)
            r=self._validate(collection,record,state)
            r['id']=current['id'] if current else collection[:-1]+'-'+uuid.uuid4().hex[:16];r['version']=(current.get('version',1) if current else 0)+1;r['updatedAt']=now_iso()
            if current:items[items.index(current)]=r
            else:items.insert(0,r)
            self._write(state,'save:'+collection,{'id':r['id'],'title':r['title'],'status':r['status']})
            return r
    def save_site(self,site,expected_revision):
        with self.lock():
            state=self._read()
            if expected_revision!=state['revision']:raise CmsError('Site content changed. Reload before saving.',409)
            allowed=['newsroomName','newsroomTagline','eventsTitle','eventsIntro','galleryTitle','galleryIntro','homeIntro','homeInvitation']
            state['site']={k:clean_text(site.get(k,state['site'].get(k,'')),500) for k in allowed};self._write(state,'save:site',{})
            return state['site']
    def _write(self,state,action,detail):
        state['revision']+=1;state['updatedAt']=now_iso();state.setdefault('audit',[]).append({'id':uuid.uuid4().hex,'at':state['updatedAt'],'actor':'Local team console','action':action,'detail':detail});state['audit']=state['audit'][-500:]
        history=self.private/'history';history.mkdir(exist_ok=True);shutil.copy2(self.path,history/(str(state['revision'])+'-'+uuid.uuid4().hex[:6]+'.json'))
        self._atomic(self.path,state);self._publish(state)
    def begin_upload(self,name,size,kind):
        if kind not in ['audio','photo']:raise CmsError('Upload an MP3 or a JPEG, PNG or WebP photo.')
        if not isinstance(size,int) or size<1 or size>(300 if kind=='audio' else 30)*1024*1024:raise CmsError('File is empty or exceeds the local upload size limit.')
        name=clean_text(name,250);key=uuid.uuid4().hex
        info={'id':key,'name':name,'kind':kind,'size':size,'offset':0,'complete':False,'createdAt':now_iso()}
        with self.lock():self._atomic(self.upload_dir/(key+'.json'),info);(self.upload_dir/(key+'.bin')).touch()
        return info
    def upload_chunk(self,key,offset,body):
        if not re.fullmatch(r'[a-f0-9]{32}',key):raise CmsError('Upload not found.',404)
        with self.lock():
            p=self.upload_dir/(key+'.json')
            if not p.exists():raise CmsError('Upload not found.',404)
            info=json.loads(p.read_text())
            if info['complete'] or offset!=info['offset']:raise CmsError('Upload offset conflict. Retry from the returned offset.',409)
            if not body or len(body)>4*1024*1024 or offset+len(body)>info['size']:raise CmsError('Invalid upload chunk.')
            with open(self.upload_dir/(key+'.bin'),'ab') as f:f.write(body)
            info['offset']+=len(body);self._atomic(p,info);return info
    def finish_upload(self,key):
        if not re.fullmatch(r'[a-f0-9]{32}',key):raise CmsError('Upload not found.',404)
        with self.lock():
            p=self.upload_dir/(key+'.json')
            if not p.exists():raise CmsError('Upload not found.',404)
            info=json.loads(p.read_text());path=self.upload_dir/(key+'.bin')
            if info['offset']!=info['size'] or path.stat().st_size!=info['size']:raise CmsError('Upload is incomplete.',409)
            with path.open('rb') as f:head=f.read(16)
            if info['kind']=='audio':
                if not (head.startswith(b'ID3') or len(head)>1 and head[0]==255 and head[1]&224==224):raise CmsError('This file is not a recognizable MP3.')
                mime,ext='audio/mpeg','.mp3'
            elif head.startswith(b'\xff\xd8\xff'):mime,ext='image/jpeg','.jpg'
            elif head.startswith(b'\x89PNG\r\n\x1a\n'):mime,ext='image/png','.png'
            elif head.startswith(b'RIFF') and head[8:12]==b'WEBP':mime,ext='image/webp','.webp'
            else:raise CmsError('Upload a JPEG, PNG or WebP image. SVG/HTML files are not accepted.')
            digest=hashlib.sha256()
            with open(path,'rb') as f:
                for data in iter(lambda:f.read(1024*1024),b''):digest.update(data)
            info.update(complete=True,mime=mime,extension=ext,sha256=digest.hexdigest());self._atomic(p,info)
            return info
    def public_audio(self,project_id,track_id):
        with self.lock():
            p=next((p for p in public_snapshot(self._read())['projects'] if p['id']==project_id),None)
            if not p:raise CmsError('Project not found.',404)
            if p.get('access')!='public':raise CmsError('Member audio delivery is not connected in this local preview.',503)
            original=next(p for p in self._read()['projects'] if p['id']==project_id);t=next((t for t in original['tracks'] if t['id']==track_id),None)
            if not t:raise CmsError('Track not found.',404)
            return self._asset(t.get('fileId',''))
