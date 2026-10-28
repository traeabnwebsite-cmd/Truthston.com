"""Apply the reviewed newsroom edition to the isolated local CMS, retaining research drafts/history."""
import copy,json,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from server.cms_store import CmsStore,now_iso
root=Path(__file__).resolve().parents[1]
edition=json.loads((root/'assets/content/newsroom-edition.json').read_text())
store=CmsStore(root)
with store.lock():
    state=store._read();published=held=0
    if any(entry.get('action')=='newsroom:reviewed-edition' and entry.get('detail',{}).get('edition')==edition['edition'] for entry in state.get('audit',[])):
        print('This reviewed edition has already been applied; subsequent CMS edits are preserved.');sys.exit(0)
    for index,current in enumerate(state['articles']):
        if current['id'] in edition['articles']:
            record={**copy.deepcopy(current),**edition['articles'][current['id']],'status':'published'};published+=1
        elif current['id'] in edition['researchOnlyIds']:
            record={**copy.deepcopy(current),'status':'draft','featured':False};held+=1
            note='Newsroom copy audit: retained research reference; needs a complete, sourced article before publication.'
            if note not in record.get('researchNotes',''):record['researchNotes']=(record.get('researchNotes','')+'\n'+note).strip()
        else:continue
        record=store._validate('articles',record,state)
        record.update(version=current.get('version',1)+1,updatedAt=now_iso());state['articles'][index]=record
    store._write(state,'newsroom:reviewed-edition',{'edition':edition['edition'],'publishedReports':published,'retainedResearchDrafts':held})
print(f'Published {published} readable reports; retained {held} research drafts. Previous CMS state saved in local history.')
