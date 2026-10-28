-- Local-only verification sink. Never apply this table to a public service.
CREATE TABLE proof_mailbox (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, verification_url TEXT NOT NULL);
