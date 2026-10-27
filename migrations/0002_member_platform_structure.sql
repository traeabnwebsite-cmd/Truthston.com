-- Additive application schema. Generate Better Auth's own tables from its pinned version separately.
-- No account, entitlement, reward stock or premium media is activated by this migration.
PRAGMA foreign_keys = ON;
ALTER TABLE members ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended','deleted'));
ALTER TABLE members ADD COLUMN public_book INTEGER NOT NULL DEFAULT 0 CHECK(public_book IN (0,1));
ALTER TABLE members ADD COLUMN marketing_opt_in INTEGER NOT NULL DEFAULT 0 CHECK(marketing_opt_in IN (0,1));
ALTER TABLE stamp_definitions ADD COLUMN rule_version INTEGER NOT NULL DEFAULT 1 CHECK(rule_version > 0);
ALTER TABLE stamp_definitions ADD COLUMN credit_reward INTEGER NOT NULL DEFAULT 0 CHECK(credit_reward >= 0);
ALTER TABLE stamp_definitions ADD COLUMN active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1));
UPDATE stamp_definitions SET earn_rule='60 qualifying playback seconds',credit_reward=40 WHERE id='the-truth';
UPDATE stamp_definitions SET earn_rule='Five distinct releases; eight qualifying seconds each',credit_reward=50 WHERE id='crate-digger';
UPDATE stamp_definitions SET earn_rule='Four distinct landmark viewpoints; five qualifying seconds each',credit_reward=30 WHERE id='street-certified';
UPDATE stamp_definitions SET earn_rule='Four manual cuts during authorized DJ playback',credit_reward=25 WHERE id='chopped-in';
CREATE TABLE member_roles (
 member_id TEXT NOT NULL REFERENCES members(id),
 role TEXT NOT NULL CHECK(role IN ('admin','editor','support','abn_approver','maab_approver')),
 granted_by TEXT NOT NULL REFERENCES members(id),
 created_at INTEGER NOT NULL DEFAULT(unixepoch()),
 PRIMARY KEY(member_id,role)
);
CREATE TABLE official_approvals (
 id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id),
 stamp_id TEXT NOT NULL REFERENCES stamp_definitions(id), actor_id TEXT NOT NULL REFERENCES members(id),
 reason TEXT NOT NULL CHECK(length(reason)>0), created_at INTEGER NOT NULL DEFAULT(unixepoch()),
 UNIQUE(member_id,stamp_id)
);
CREATE TRIGGER scoped_official_approval BEFORE INSERT ON official_approvals
WHEN NOT EXISTS(SELECT 1 FROM member_roles r JOIN members m ON m.id=r.member_id
 WHERE r.member_id=NEW.actor_id AND m.status='active' AND
 ((NEW.stamp_id='abn-approved' AND r.role='abn_approver') OR
 (NEW.stamp_id='guerilla-maab' AND r.role='maab_approver')))
BEGIN SELECT RAISE(ABORT,'scoped_approver_required'); END;
CREATE TABLE activity_receipts (
 id TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id),
 kind TEXT NOT NULL CHECK(kind IN ('listen','dig','city','cut','project_download','campaign')),
 subject_key TEXT NOT NULL, session_key TEXT, dedupe_key TEXT NOT NULL UNIQUE,
 qualifying_seconds INTEGER NOT NULL DEFAULT 0 CHECK(qualifying_seconds>=0 AND qualifying_seconds<=15),
 verified_at INTEGER NOT NULL DEFAULT(unixepoch()), expires_at INTEGER,
 evidence_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(evidence_json))
);
CREATE INDEX activity_member_kind ON activity_receipts(member_id,kind,verified_at);
CREATE TRIGGER award_requires_active_member BEFORE INSERT ON member_stamps
WHEN NOT EXISTS(SELECT 1 FROM members WHERE id=NEW.member_id AND status='active')
 OR NOT EXISTS(SELECT 1 FROM stamp_definitions WHERE id=NEW.stamp_id AND active=1)
BEGIN SELECT RAISE(ABORT,'award_not_eligible'); END;
CREATE TRIGGER award_requires_approval BEFORE INSERT ON member_stamps
WHEN (SELECT approval_required FROM stamp_definitions WHERE id=NEW.stamp_id)=1
 AND NOT EXISTS(SELECT 1 FROM official_approvals WHERE member_id=NEW.member_id AND stamp_id=NEW.stamp_id)
BEGIN SELECT RAISE(ABORT,'official_approval_required'); END;
-- The award and its fixed credit are one atomic insert, not two fallible application writes.
CREATE TRIGGER award_credit AFTER INSERT ON member_stamps
WHEN (SELECT credit_reward FROM stamp_definitions WHERE id=NEW.stamp_id)>0
BEGIN INSERT INTO credit_ledger(id,member_id,delta,event_key,reason)
 SELECT 'award:'||NEW.event_key,NEW.member_id,credit_reward,'award:'||NEW.event_key,name
 FROM stamp_definitions WHERE id=NEW.stamp_id; END;
CREATE TRIGGER stamp_history_no_delete BEFORE DELETE ON member_stamps
BEGIN SELECT RAISE(ABORT,'stamp_history_is_permanent'); END;
CREATE TABLE stamp_revocations (
 member_id TEXT NOT NULL,stamp_id TEXT NOT NULL,actor_id TEXT NOT NULL REFERENCES members(id),
 reason TEXT NOT NULL,created_at INTEGER NOT NULL DEFAULT(unixepoch()),
 PRIMARY KEY(member_id,stamp_id),FOREIGN KEY(member_id,stamp_id) REFERENCES member_stamps(member_id,stamp_id)
);
CREATE TRIGGER redemption_guard BEFORE INSERT ON redemptions
WHEN NEW.status!='reserved' OR NOT EXISTS(SELECT 1 FROM members WHERE id=NEW.member_id AND status='active')
 OR NOT EXISTS(SELECT 1 FROM rewards WHERE id=NEW.reward_id AND active=1 AND credit_cost=NEW.credit_cost AND (stock IS NULL OR stock>0))
 OR NOT EXISTS(SELECT 1 FROM credit_ledger WHERE id=NEW.ledger_entry_id AND member_id=NEW.member_id AND delta=-NEW.credit_cost)
BEGIN SELECT RAISE(ABORT,'reward_not_available'); END;
CREATE TRIGGER reserve_reward AFTER INSERT ON redemptions
BEGIN UPDATE rewards SET stock=stock-1 WHERE id=NEW.reward_id AND stock IS NOT NULL; END;
CREATE TRIGGER redemption_transition BEFORE UPDATE ON redemptions
WHEN OLD.status!='reserved' OR NEW.status NOT IN ('fulfilled','cancelled') OR NEW.id!=OLD.id
 OR NEW.member_id!=OLD.member_id OR NEW.reward_id!=OLD.reward_id OR NEW.credit_cost!=OLD.credit_cost
 OR NEW.ledger_entry_id!=OLD.ledger_entry_id OR NEW.idempotency_key!=OLD.idempotency_key
BEGIN SELECT RAISE(ABORT,'invalid_redemption_transition'); END;
CREATE TRIGGER cancel_reward AFTER UPDATE OF status ON redemptions
WHEN OLD.status='reserved' AND NEW.status='cancelled'
BEGIN
 INSERT INTO credit_ledger(id,member_id,delta,event_key,reason) VALUES('refund:'||NEW.id,NEW.member_id,NEW.credit_cost,'refund:'||NEW.id,'Cancelled reward');
 UPDATE rewards SET stock=stock+1 WHERE id=NEW.reward_id AND stock IS NOT NULL;
END;
CREATE TABLE membership_plans (
 id TEXT PRIMARY KEY,name TEXT NOT NULL,price_id TEXT UNIQUE,active INTEGER NOT NULL DEFAULT 0 CHECK(active IN (0,1))
);
INSERT INTO membership_plans(id,name,active) VALUES('free','The Family',1),('vault','The ABN Vault',0);
CREATE TABLE subscriptions (
 provider_subscription_id TEXT PRIMARY KEY,member_id TEXT NOT NULL REFERENCES members(id),
 provider_customer_id TEXT NOT NULL,plan_id TEXT NOT NULL REFERENCES membership_plans(id),
 status TEXT NOT NULL, current_period_end INTEGER,cancel_at_period_end INTEGER NOT NULL DEFAULT 0 CHECK(cancel_at_period_end IN (0,1)),
 provider_updated_at INTEGER NOT NULL,last_checked_at INTEGER NOT NULL DEFAULT(unixepoch())
);
CREATE INDEX subscriptions_member ON subscriptions(member_id,status);
CREATE TABLE playback_sessions (
 id TEXT PRIMARY KEY,member_id TEXT NOT NULL REFERENCES members(id),device_key_hash TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('audio','dj','video')),started_at INTEGER NOT NULL DEFAULT(unixepoch()),
 expires_at INTEGER NOT NULL,revoked_at INTEGER
);
CREATE INDEX playback_member_expiry ON playback_sessions(member_id,expires_at);
CREATE TABLE download_grants (
 id TEXT PRIMARY KEY,member_id TEXT NOT NULL REFERENCES members(id),asset_id TEXT NOT NULL REFERENCES media_assets(id),
 project_id TEXT NOT NULL,expires_at INTEGER NOT NULL,first_delivery_at INTEGER
);
CREATE TABLE ingest_jobs (
 id TEXT PRIMARY KEY,actor_id TEXT NOT NULL REFERENCES members(id),manifest_sha256 TEXT NOT NULL UNIQUE,
 state TEXT NOT NULL CHECK(state IN ('draft','uploading','validating','processing','review','ready','published','failed')),
 created_at INTEGER NOT NULL DEFAULT(unixepoch()),updated_at INTEGER NOT NULL DEFAULT(unixepoch())
);
CREATE TABLE media_rights (
 asset_id TEXT PRIMARY KEY REFERENCES media_assets(id),master_owner TEXT NOT NULL,
 composition_status TEXT NOT NULL CHECK(composition_status IN ('unreviewed','cleared','restricted')),
 master_status TEXT NOT NULL CHECK(master_status IN ('unreviewed','cleared','restricted')),
 allowed_uses_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(allowed_uses_json)),
 territories_json TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(territories_json)),
 starts_at INTEGER,ends_at INTEGER,agreement_reference TEXT NOT NULL,
 approved_by TEXT REFERENCES members(id),approved_at INTEGER
);
CREATE TABLE member_library (
 member_id TEXT NOT NULL REFERENCES members(id),asset_id TEXT NOT NULL REFERENCES media_assets(id),
 acquired_via TEXT NOT NULL CHECK(acquired_via IN ('purchase','membership','gift')),created_at INTEGER NOT NULL DEFAULT(unixepoch()),
 PRIMARY KEY(member_id,asset_id)
);
CREATE TABLE audit_log (
 id TEXT PRIMARY KEY,actor_id TEXT REFERENCES members(id),action TEXT NOT NULL,resource_key TEXT NOT NULL,
 detail_json TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(detail_json)),created_at INTEGER NOT NULL DEFAULT(unixepoch())
);
CREATE INDEX audit_resource ON audit_log(resource_key,created_at);
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_log BEGIN SELECT RAISE(ABORT,'audit_is_append_only'); END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_log BEGIN SELECT RAISE(ABORT,'audit_is_append_only'); END;
