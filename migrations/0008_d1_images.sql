-- Base64 is kept in D1 to avoid an R2 dependency. The decoded file is limited
-- to 1,000,000 bytes by the Worker; the CHECK also protects direct writes.
CREATE TABLE images (
  key TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK(content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  data_base64 TEXT NOT NULL CHECK(length(data_base64) BETWEEN 16 AND 1333336),
  size INTEGER NOT NULL CHECK(size BETWEEN 12 AND 1000000),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
