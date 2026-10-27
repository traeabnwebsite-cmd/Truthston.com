import sqlite3, json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
c=sqlite3.connect(':memory:')
for path in sorted((root/'migrations').glob('*.sql')): c.executescript(path.read_text())
c.execute("INSERT INTO members(id,auth_subject,display_name,created_at) VALUES('test','auth:test','Test',0)")
c.execute("INSERT INTO members(id,auth_subject,display_name,created_at) VALUES('staff','auth:staff','Staff',0)")
c.execute("INSERT INTO credit_ledger VALUES('earn','test',100,'listen:unique','Listening',0)")
c.commit()
def rejects(sql,args=()):
    try: c.execute(sql,args)
    except sqlite3.DatabaseError: pass
    else: raise AssertionError('Expected constraint rejection: '+sql)
for sql in ["INSERT INTO credit_ledger VALUES('over','test',-101,'over','Invalid',0)","INSERT INTO credit_ledger VALUES('dup','test',100,'listen:unique','Duplicate',0)","UPDATE credit_ledger SET delta=1000 WHERE id='earn'","DELETE FROM credit_ledger WHERE id='earn'"]: rejects(sql)
assert c.execute("SELECT balance FROM member_credit_balance WHERE member_id='test'").fetchone()[0]==100
c.execute("INSERT INTO member_stamps(member_id,stamp_id,event_key) VALUES('test','crate-digger','test:crate')")
assert c.execute("SELECT balance FROM member_credit_balance WHERE member_id='test'").fetchone()[0]==150
rejects("INSERT INTO member_stamps(member_id,stamp_id,event_key) VALUES('test','crate-digger','test:crate:replay')")
assert c.execute("SELECT COUNT(*) FROM credit_ledger WHERE member_id='test'").fetchone()[0]==2
rejects("DELETE FROM member_stamps WHERE member_id='test'")
rejects("INSERT INTO member_stamps(member_id,stamp_id,event_key) VALUES('test','abn-approved','fake:approval')")
rejects("INSERT INTO official_approvals(id,member_id,stamp_id,actor_id,reason) VALUES('app','test','abn-approved','staff','Requested')")
c.execute("INSERT INTO member_roles(member_id,role,granted_by) VALUES('staff','maab_approver','staff')")
rejects("INSERT INTO official_approvals(id,member_id,stamp_id,actor_id,reason) VALUES('app','test','abn-approved','staff','Wrong scope')")
c.execute("INSERT INTO member_roles(member_id,role,granted_by) VALUES('staff','abn_approver','staff')")
c.execute("INSERT INTO official_approvals(id,member_id,stamp_id,actor_id,reason) VALUES('app','test','abn-approved','staff','Verified award')")
c.execute("INSERT INTO member_stamps(member_id,stamp_id,event_key) VALUES('test','abn-approved','test:approval')")
assert c.execute("SELECT balance FROM member_credit_balance WHERE member_id='test'").fetchone()[0]==150
c.execute("INSERT INTO rewards VALUES('tee','ABN Tee',75,1,1)");c.commit()
def reserve(identifier):
    # D1 batch executes these writes transactionally; this SQLite transaction checks the same invariant.
    with c:
        c.execute("INSERT INTO credit_ledger(id,member_id,delta,event_key,reason) VALUES(?, 'test',-75,?,'Reward')",('debit:'+identifier,'redemption:'+identifier))
        c.execute("INSERT INTO redemptions(id,member_id,reward_id,ledger_entry_id,idempotency_key,credit_cost,status) VALUES(?, 'test','tee',?,?,75,'reserved')",(identifier,'debit:'+identifier,'test:'+identifier))
reserve('r1')
assert c.execute("SELECT stock FROM rewards WHERE id='tee'").fetchone()[0]==0
try: reserve('r2')
except sqlite3.DatabaseError: pass
else: raise AssertionError('Out-of-stock reward accepted')
assert c.execute("SELECT COUNT(*) FROM credit_ledger WHERE id='debit:r2'").fetchone()[0]==0
assert c.execute("SELECT balance FROM member_credit_balance WHERE member_id='test'").fetchone()[0]==75
c.execute("UPDATE redemptions SET status='cancelled' WHERE id='r1'")
assert c.execute("SELECT balance FROM member_credit_balance WHERE member_id='test'").fetchone()[0]==150
assert c.execute("SELECT stock FROM rewards WHERE id='tee'").fetchone()[0]==1
rejects("UPDATE redemptions SET status='cancelled' WHERE id='r1'")
assert c.execute("SELECT COUNT(*) FROM credit_ledger WHERE id='refund:r1'").fetchone()[0]==1
c.execute("INSERT INTO audit_log(id,action,resource_key) VALUES('audit','award','test')")
rejects("DELETE FROM audit_log")
assert not c.execute('PRAGMA foreign_key_check').fetchall()
print('Both migrations pass: atomic award credits, scoped official approvals, ledger immutability, stock reservation/rollback, single refund and audit history.')

policy=json.loads((root/'assets/config/membership-policy.json').read_text())
for definition in policy['stamps']:
    if definition.get('repeat')=='per-project': continue
    row=c.execute('SELECT credit_reward,approval_required FROM stamp_definitions WHERE id=?',(definition['key'],)).fetchone()
    assert row==(definition['credits'],int(definition.get('official',False))), 'Policy/schema drift: '+definition['key']
print('Versioned policy and seeded SQL award amounts/official scopes match.')
