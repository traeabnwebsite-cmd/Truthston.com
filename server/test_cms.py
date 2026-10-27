import base64,json,tempfile,threading,unittest,urllib.request,urllib.error,http.cookiejar
from pathlib import Path
from .cms_store import CmsStore,CmsError,public_snapshot
from .preview import PreviewServer

PNG=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==')
class StoreTest(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name);self.store=CmsStore(self.root)
 def tearDown(self):self.tmp.cleanup()
 def upload(self,data,kind='photo'):
  info=self.store.begin_upload('asset.mp3' if kind=='audio' else 'photo.png',len(data),kind);self.store.upload_chunk(info['id'],0,data);return self.store.finish_upload(info['id'])['id']
 def product(self,**extra):return {'title':'ABN tee','status':'draft','sizes':['M','L'],'priceCents':3500,'stock':4,'availability':'coming-soon','currency':'USD',**extra}
 def test_merch_publish_and_optimistic_lock(self):
  r=self.store.save('products',self.product());self.assertEqual(self.store.public()['products'],[])
  r.update(status='published',availability='available',checkoutUrl='https://example.com/checkout')
  p=self.store.save('products',r,r['version']);self.assertEqual(self.store.public()['products'][0]['priceCents'],3500)
  with self.assertRaises(CmsError) as ex:self.store.save('products',r,r['version'])
  self.assertEqual(ex.exception.status,409);self.assertEqual(CmsStore(self.root).state()['products'][0]['id'],p['id'])
 def test_merch_checkout_price_stock(self):
  for extra in [{'status':'published','availability':'available'},{'priceCents':-1},{'stock':1.5},{'checkoutUrl':'javascript:alert(1)'}]:
   with self.assertRaises(CmsError):self.store.save('products',self.product(**extra))
 def test_draft_media_not_public_and_published_image(self):
  file_id=self.upload(PNG);r=self.store.save('photos',{'title':'ABN photo','status':'draft','fileId':file_id,'alt':'Photo description','precision':'unknown'})
  self.assertFalse((self.root/'assets/uploads').exists());self.assertNotIn(file_id,json.dumps(self.store.public()))
  r['status']='published';r['alt']=''
  with self.assertRaises(CmsError):self.store.save('photos',r,r['version'])
  r['alt']='ABN photo';published=self.store.save('photos',r,r['version']);self.assertTrue((self.root/published['src']).exists());self.assertNotIn('fileId',self.store.public()['photos'][0])
 def test_upload_integrity_and_offsets(self):
  info=self.store.begin_upload('photo.png',len(PNG),'photo')
  with self.assertRaises(CmsError):self.store.upload_chunk(info['id'],10,PNG)
  with self.assertRaises(CmsError):self.store.finish_upload(info['id'])
  with self.assertRaises(CmsError):self.upload(b'<svg onload="alert(1)"></svg>')
 def test_audio_public_vs_member_and_track_order(self):
  fid=self.upload(b'ID3'+b'\x00'*40,'audio');p={'title':'Test project','date':'2026','status':'published','cover':'assets/cover.png','access':'member','tracks':[{'id':'b','title':'Second','fileId':fid},{'id':'a','title':'First','fileId':fid}]}
  r=self.store.save('projects',p);self.assertIsNone(self.store.public()['projects'][0]['tracks'][0]['audioUrl'])
  with self.assertRaises(CmsError) as ex:self.store.public_audio(r['id'],'b')
  self.assertEqual(ex.exception.status,503);r['access']='public';r=self.store.save('projects',r,r['version']);self.assertEqual([t['id'] for t in self.store.public()['projects'][0]['tracks']],['b','a']);self.assertTrue(self.store.public_audio(r['id'],'a')[1].exists())
 def test_scheduled_and_private_fields(self):
  state={'articles':[{'id':'a','status':'scheduled','publishAt':'2026-12-01T00:00:00+00:00','researchNotes':'private','originalPath':'/private/path'}]}
  self.assertEqual(public_snapshot(state,'2026-11-01T00:00:00+00:00')['articles'],[]);view=public_snapshot(state,'2026-12-02T00:00:00+00:00')['articles'];self.assertEqual(view[0]['id'],'a');self.assertNotIn('researchNotes',view[0])
 def test_site_revision(self):
  self.store.save_site({'newsroomName':'The paper'},1);self.assertEqual(self.store.public()['site']['newsroomName'],'The paper')
  with self.assertRaises(CmsError):self.store.save_site({},1)

class HttpTest(StoreTest):
 def setUp(self):
  super().setUp();self.server=PreviewServer(('127.0.0.1',0),self.root,self.store);self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start();self.base='http://127.0.0.1:'+str(self.server.server_port);self.responses=[];self.client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 def tearDown(self):[r.close() for r in self.responses];self.server.shutdown();self.server.server_close();super().tearDown()
 def request(self,path,data=None,headers=None):
  req=urllib.request.Request(self.base+path,data=json.dumps(data).encode() if data is not None else None,headers=headers or {})
  try:result=self.client.open(req)
  except urllib.error.HTTPError as e:result=e
  self.responses.append(result);return result
 def session(self):return json.load(self.request('/api/cms/session'))['csrf']
 def test_http_write_auth_csrf_and_origin(self):
  self.assertEqual(self.request('/api/cms/content').code,401);token=self.session();payload={'collection':'products','record':self.product(),'expectedVersion':0}
  self.assertEqual(self.request('/api/cms/record',payload,{'Origin':self.base,'Content-Type':'application/json'}).code,403)
  headers={'Origin':'https://elsewhere.example','Content-Type':'application/json','X-CMS-CSRF':token};self.assertEqual(self.request('/api/cms/record',payload,headers).code,403)
  headers['Origin']=self.base;self.assertEqual(self.request('/api/cms/record',payload,headers).code,200)
 def test_private_paths_and_host(self):
  for path in ['/content/editorial.json','/.local-media/cms.lock','/assets/../content/editorial.json','/assets/%2e%2e/content/editorial.json']:
   self.assertEqual(self.request(path).code,404,path)
  self.assertEqual(self.request('/api/content',headers={'Host':'evil.example'}).code,403)
 def test_audio_ranges_and_locked_assets(self):
  fid=self.upload(b'ID3'+b'\x00'*40,'audio');self.assertEqual(self.request('/api/cms/assets/'+fid).code,401)
  r=self.store.save('projects',{'title':'Public test','date':'2026','status':'published','cover':'assets/cover.png','access':'public','tracks':[{'id':'track1','title':'Track','fileId':fid}]})
  path='/api/projects/'+r['id']+'/tracks/track1/audio';response=self.request(path,headers={'Range':'bytes=0-2'});self.assertEqual(response.code,206);self.assertEqual(response.read(),b'ID3');self.assertEqual(self.request(path,headers={'Range':'bytes=999-1000'}).code,416)
if __name__=='__main__':unittest.main()
