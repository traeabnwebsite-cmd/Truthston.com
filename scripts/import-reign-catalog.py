"""Build Reign's public metadata database from research and Apple lookup snapshots.

Usage: python3 scripts/import-reign-catalog.py RESEARCH_CATALOG_JSON APPLE_SNAPSHOT_DIRECTORY
No media, credentials, private paths, or audio URLs are published.
"""
import sys, json, re
from pathlib import Path
from datetime import date

research, snapshots = Path(sys.argv[1]), Path(sys.argv[2])
records = {}
def names(value):
    result = [value or 'Trae tha Truth']
    if re.search(r'\ba\.?b\.?n\b|assholes? by nature', value or '', re.I): result.append('ABN')
    return list(dict.fromkeys(result))

for release in json.loads(research.read_text()):
    if release.get('apple_id') == 1538176335: continue  # Known unrelated Trae Williamson record.
    key = str(release.get('apple_id') or release.get('title', '') + '|' + str(release.get('date', '')))
    artist = release.get('artist') or 'Trae tha Truth'
    artists = names(artist)
    if re.search('guerilla maab|g-maab', release['title'], re.I): artists.append('Guerilla Maab')
    if re.search(r'\ba\.?b\.?n\b|assholes? by nature|it is what it is', release['title'], re.I): artists.append('ABN')
    records[key] = {'id':key,'title':release['title'],'artist':artist,'artists':list(dict.fromkeys(artists)), 'date':release.get('date') or release.get('best_date') or '', 'type':release.get('category','Release'), 'label':release.get('label',''), 'tracks':[t if isinstance(t,str) else t.get('title','') for t in release.get('tracklist',[])], 'sourceUrl':release.get('apple_url') or release.get('deezer_url') or release.get('wiki_url') or '', 'source':'Existing project catalog research'}

for snapshot in snapshots.glob('*-lookup-tracks.json'):
    rows = json.loads(snapshot.read_text()).get('results', [])
    canonical = {'6-Tre-G':'6 Tre G','Dougie-D':'Dougie D','Guerilla-Maab':'Guerilla Maab'}[snapshot.name.split('-lookup')[0]]
    albums = [r for r in rows if r.get('wrapperType') == 'collection']
    for album in albums:
        released = album.get('releaseDate','')[:10]
        if released > date(2026,10,28).isoformat(): continue
        key = str(album['collectionId'])
        tracks = sorted([r for r in rows if r.get('wrapperType') == 'track' and str(r.get('collectionId')) == key], key=lambda r:(r.get('discNumber',1),r.get('trackNumber',0)))
        records[key] = {'id':key,'title':album['collectionName'],'artist':album.get('artistName',canonical), 'artists':list(dict.fromkeys([album.get('artistName',canonical),canonical])), 'date':released, 'type':'Single' if album['collectionName'].endswith(' - Single') else 'EP' if album['collectionName'].endswith(' - EP') else 'Album', 'label':album.get('copyright',''), 'tracks':[t['trackName'] for t in tracks], 'sourceUrl':album.get('collectionViewUrl',''), 'source':'Apple iTunes artist-ID lookup'}

output = Path(__file__).resolve().parent.parent/'assets/content/reign-catalog.json'
data={'schemaVersion':1,'updatedAt':'2026-10-28','coverage':'Seed catalog; reconcile artist identities, editions, original dates and missing releases with the owner vault. Not a complete discography claim.', 'excludedAppleIds':[1538176335], 'artists':['Trae tha Truth','6 Tre G','Guerilla Maab','Dougie D','ABN'], 'records':sorted(records.values(),key=lambda r:(r['date'],r['title']))}
output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f"Published {len(data['records'])} sourced release records to {output.name}")
for artist in data['artists']:print(artist, sum(artist in r['artists'] for r in data['records']))
