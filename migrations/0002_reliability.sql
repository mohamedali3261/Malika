ALTER TABLE sessions ADD COLUMN last_seen INTEGER NOT NULL DEFAULT 0;
UPDATE sessions SET last_seen = CAST(strftime('%s','now') AS INTEGER)*1000;
ALTER TABLE orders ADD COLUMN idempotency_key TEXT;
ALTER TABLE orders ADD COLUMN request_hash TEXT;
CREATE UNIQUE INDEX orders_idempotency ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE TABLE audit_log (id TEXT PRIMARY KEY, admin_id TEXT NOT NULL, action TEXT NOT NULL, target_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX audit_log_created ON audit_log(created_at DESC);
