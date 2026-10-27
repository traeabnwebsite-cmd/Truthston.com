#!/bin/zsh
cd -- "${0:A:h}"
python3 - <<'PYTHON'
import socket,webbrowser
from pathlib import Path
from server.preview import create_server
root=Path.cwd()
for port in range(8766,8786):
 try:
  with socket.create_connection(('127.0.0.1',port),timeout=.2):continue
 except OSError:pass
 try:server=create_server(root,port);break
 except OSError:continue
else:raise SystemExit('No available preview port.')
url=f'http://localhost:{server.server_port}/'
print(f'ABN website: {url}\nTeam console: {url}cms.html\nKeep this window open. Press Control-C to stop.',flush=True)
webbrowser.open(url)
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
PYTHON
