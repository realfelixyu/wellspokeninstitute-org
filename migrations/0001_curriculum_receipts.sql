CREATE TABLE IF NOT EXISTS curriculum_receipts (
  digest TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS curriculum_receipts_expiry ON curriculum_receipts(expires_at);
