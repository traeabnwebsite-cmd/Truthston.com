#!/usr/bin/env python3
"""Loopback-only local preview + persistent team CMS. No production authentication is implied."""
import argparse,json,mimetypes,re,secrets,sys,time
from http import cookies
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from .cms_store import CmsStore,CmsError

class PreviewServer(ThreadingHTTPServer):
    daemon_threads=True
    def __init__(self,address,root,store):
        self.root=Path(root).resolve();self.store=store;self.sessions={};super().__init__(address,Handler)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(args[2].root),**kwargs)
    def log_message(self,fmt,*args):pass
    def end_headers(self):
        self.send_header('X-Content-Type-Options','nosniff');self.send_header('Referrer-Policy','strict-origin-when-cross-origin');self.send_header('X-Frame-Options','DENY');self.send_header('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'");super().end_headers()
    def _json(self,obj,status=200,headers=None):
        data=json.dumps(obj,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)))
        for key,value in (headers or {}).items():self.send_header(key,value)
        self.end_headers()
        if self.command!='HEAD':self.wfile.write(data)
    def _local(self):
        allowed={f'localhost:{self.server.server_port}',f'127.0.0.1:{self.server.server_port}'}
        if self.headers.get('Host') not in allowed:raise CmsError('Local preview host is not allowed.',403)
    def _origin(self):
        origin=self.headers.get('Origin')
        if origin and origin!=f'http://{self.headers.get("Host")}':raise CmsError('Cross-origin CMS requests are not allowed.',403)
        if self.command not in ['GET','HEAD'] and not origin:raise CmsError('CMS writes require a same-origin request.',403)
    def _session(self,write=False):
        self._origin();jar=cookies.SimpleCookie()
        try:jar.load(self.headers.get('Cookie',''))
        except cookies.CookieError:raise CmsError('Local CMS session required.',401)
        name='cms_session_'+str(self.server.server_port);sid=jar[name].value if name in jar else '';session=self.server.sessions.get(sid)
        if not session or session['expires']<time.time():raise CmsError('Open the local team console to start a session.',401)
        if write and not secrets.compare_digest(self.headers.get('X-CMS-CSRF',''),session['csrf']):raise CmsError('Reload the console before saving.',403)
        return session
    def _body(self,limit=2*1024*1024):
        try:n=int(self.headers.get('Content-Length','0'))
        except ValueError:raise CmsError('Invalid content length.')
        if n<1 or n>limit:raise CmsError('Request body is empty or too large.',413)
        b=self.rfile.read(n)
        if len(b)!=n:raise CmsError('Request body was interrupted.')
        return b
    def _input(self):
        if self.headers.get('Content-Type','').split(';')[0]!='application/json':raise CmsError('Use JSON for this request.',415)
        try:return json.loads(self._body())
        except (ValueError,UnicodeDecodeError):raise CmsError('Invalid JSON.')
    def _file(self,path,mime):
        size=path.stat().st_size;start,end=0,size-1;code=200;range_header=self.headers.get('Range')
        if range_header:
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',range_header)
            if not match or not any(match.groups()):self._json({'error':'Invalid byte range'},416,{'Content-Range':f'bytes */{size}'});return
            first,last=match.groups()
            if first:start=int(first);end=min(int(last) if last else size-1,size-1)
            else:start=max(0,size-int(last));end=size-1
            if start>=size or end<start:self._json({'error':'Range is outside the file'},416,{'Content-Range':f'bytes */{size}'});return
            code=206
        self.send_response(code);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(end-start+1));self.send_header('Accept-Ranges','bytes');self.send_header('Cache-Control','private, no-store')
        if code==206:self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
        self.end_headers()
        if self.command=='HEAD':return
        try:
            with open(path,'rb') as f:
                f.seek(start);left=end-start+1
                while left:
                    block=f.read(min(left,1024*256))
                    if not block:break
                    self.wfile.write(block);left-=len(block)
        except (BrokenPipeError,ConnectionResetError):pass
    def do_HEAD(self):self.do_GET()
    def do_GET(self):
        try:
            self._local();path=urlparse(self.path).path
            if path=='/api/content':self._json(self.server.store.public());return
            if path=='/api/cms/session':
                self._origin();sid=secrets.token_urlsafe(32);csrf=secrets.token_urlsafe(32);self.server.sessions={k:v for k,v in self.server.sessions.items() if v['expires']>time.time()};self.server.sessions[sid]={'csrf':csrf,'expires':time.time()+3600}
                self._json({'mode':'local-admin','csrf':csrf,'message':'Local team editing. Saved to this computer. Production sign-in is not connected.'},headers={'Set-Cookie':f'cms_session_{self.server.server_port}={sid}; HttpOnly; SameSite=Strict; Path=/api/cms; Max-Age=3600'});return
            if path=='/api/cms/content':self._session();self._json(self.server.store.state());return
            match=re.fullmatch(r'/api/cms/assets/([a-f0-9]{32})',path)
            if match:
                self._session();info,file=self.server.store.asset(match[1]);self._file(file,info['mime']);return
            match=re.fullmatch(r'/api/projects/([A-Za-z0-9_.-]+)/tracks/([A-Za-z0-9_.-]+)/audio',path)
            if match:info,file=self.server.store.public_audio(*match.groups());self._file(file,info['mime']);return
            if path.startswith('/api/'):
                if re.match(r'/api/(member|auth|checkout|webhooks|media|rewards|downloads)(/|$)',path):self._json({'error':'Production membership service is not configured.'},503)
                else:self._json({'error':'Not found'},404)
                return
            if path=='/':self.path='/index.html';path='/index.html'
            if path not in ['/index.html','/cms.html','/release-data.js','/favicon.ico'] and not path.startswith('/assets/'):raise CmsError('Not found.',404)
            resolved=Path(self.translate_path(path)).resolve()
            if not resolved.is_relative_to(self.server.root) or (path.startswith('/assets/') and not resolved.is_relative_to(self.server.root/'assets')) or not resolved.is_file():raise CmsError('Not found.',404)
            super().do_GET() if self.command!='HEAD' else super().do_HEAD()
        except CmsError as e:self._json({'error':str(e)},e.status)
        except (BrokenPipeError,ConnectionResetError):pass
    def do_POST(self):
        try:
            self._local();self._session(write=True);path=urlparse(self.path).path
            if path=='/api/cms/record':
                data=self._input()
                if not isinstance(data,dict):raise CmsError('JSON object required.')
                saved=self.server.store.save(data.get('collection'),data.get('record'),data.get('expectedVersion',0));self._json({'record':saved,'revision':self.server.store.state()['revision']});return
            if path=='/api/cms/site':
                data=self._input();self._json({'site':self.server.store.save_site(data.get('site',{}),data.get('expectedRevision'))});return
            if path=='/api/cms/uploads':
                data=self._input();self._json(self.server.store.begin_upload(data.get('name',''),data.get('size'),data.get('kind')),201);return
            match=re.fullmatch(r'/api/cms/uploads/([a-f0-9]{32})/chunk',path)
            if match:
                try:offset=int(self.headers.get('Upload-Offset','-1'))
                except ValueError:raise CmsError('Invalid upload offset.')
                self._json(self.server.store.upload_chunk(match[1],offset,self._body(4*1024*1024)));return
            match=re.fullmatch(r'/api/cms/uploads/([a-f0-9]{32})/complete',path)
            if match:self._json(self.server.store.finish_upload(match[1]));return
            self._json({'error':'Not found'},404)
        except CmsError as e:self._json({'error':str(e)},e.status)
        except (BrokenPipeError,ConnectionResetError):pass
        except (ValueError,TypeError,KeyError,AttributeError):self._json({'error':'Invalid content or request fields.'},400)

def create_server(root,port):
    root=Path(root).resolve();config_path=root/'.cms-local.json';config=json.loads(config_path.read_text()) if config_path.exists() else {}
    canonical=Path(config.get('contentRoot',root));store=CmsStore(canonical,config.get('mirrors',[]));return PreviewServer(('127.0.0.1',port),root,store)
def main():
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);parser.add_argument('--root',default=str(Path(__file__).resolve().parent.parent));args=parser.parse_args();server=create_server(args.root,args.port)
    print(f'ABN preview: http://localhost:{server.server_port}/\nTeam console: http://localhost:{server.server_port}/cms.html\nLocal editing only; no production sign-in.',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
if __name__=='__main__':main()
