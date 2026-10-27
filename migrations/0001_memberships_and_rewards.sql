PRAGMA foreign_keys = ON;
CREATE TABLE members (
  id TEXT PRIMARY KEY,
  auth_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE stamp_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  earn_rule TEXT NOT NULL,
  approval_required INTEGER NOT NULL DEFAULT 0 CHECK (approval_required IN (0,1))
);
CREATE TABLE member_stamps (
  member_id TEXT NOT NULL REFERENCES members(id),
  stamp_id TEXT NOT NULL REFERENCES stamp_definitions(id),
  event_key TEXT NOT NULL UNIQUE,
  earned_at INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (member_id, stamp_id)
);
CREATE TABLE credit_ledger (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  delta INTEGER NOT NULL CHECK (delta <> 0),
  event_key TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX credit_ledger_member ON credit_ledger(member_id, created_at);
CREATE VIEW member_credit_balance AS
SELECT members.id AS member_id, COALESCE(SUM(credit_ledger.delta), 0) AS balance
FROM members LEFT JOIN credit_ledger ON credit_ledger.member_id = members.id GROUP BY members.id;
CREATE TRIGGER credit_no_overdraft BEFORE INSERT ON credit_ledger
WHEN NEW.delta < 0 AND COALESCE((SELECT SUM(delta) FROM credit_ledger WHERE member_id=NEW.member_id),0)+NEW.delta < 0
BEGIN SELECT RAISE(ABORT, 'insufficient_credits'); END;
CREATE TRIGGER credit_append_only_update BEFORE UPDATE ON credit_ledger
BEGIN SELECT RAISE(ABORT, 'ledger_is_append_only'); END;
CREATE TRIGGER credit_append_only_delete BEFORE DELETE ON credit_ledger
BEGIN SELECT RAISE(ABORT, 'ledger_is_append_only'); END;
CREATE TABLE rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
  stock INTEGER CHECK (stock IS NULL OR stock >= 0),
  active INTEGER NOT NULL DEFAULT 0 CHECK (active IN (0,1))
);
CREATE TABLE redemptions (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL REFERENCES members(id),
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  ledger_entry_id TEXT NOT NULL UNIQUE REFERENCES credit_ledger(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  credit_cost INTEGER NOT NULL CHECK (credit_cost > 0),
  status TEXT NOT NULL CHECK (status IN ('reserved','fulfilled','cancelled')),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX redemptions_member ON redemptions(member_id, created_at);
CREATE TABLE entitlements (
  member_id TEXT NOT NULL REFERENCES members(id),
  product_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','expired','revoked')),
  expires_at INTEGER,
  PRIMARY KEY (member_id, product_key)
);
CREATE TABLE payment_events (
  provider_event_id TEXT PRIMARY KEY,
  processed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE media_assets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL CHECK (media_type IN ('audio','video','download')),
  access_level TEXT NOT NULL CHECK (access_level IN ('public','member','purchase'))
);
INSERT INTO stamp_definitions VALUES
('abn-approved','ABN Approved','Verified approval from ABN staff',1),
('the-truth','The Truth','Eligible listening milestone',0),
('guerilla-maab','Guerilla Maab','Verified affiliate award',1),
('street-certified','Street Certified','Explore the Houston archive',0),
('crate-digger','Crate Digger','Complete a daily crate hunt',0),
('chopped-in','Chopped In','Complete a DJ booth activity',0);
