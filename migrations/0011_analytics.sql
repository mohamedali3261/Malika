-- Store daily privacy-preserving aggregates instead of raw visit events.
-- A visitor is represented by a server-hashed random browser identifier; one row
-- per day/page/visitor supports both repeat views and distinct visitor counts.
CREATE TABLE IF NOT EXISTS analytics_daily (
  day TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_click')),
  page_path TEXT NOT NULL,
  target_id TEXT NOT NULL DEFAULT '',
  visitor_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 1 CHECK (event_count >= 1),
  PRIMARY KEY (day, event_type, page_path, target_id, visitor_hash),
  CHECK (
    (event_type = 'page_view' AND target_id = '') OR
    (event_type = 'product_click' AND target_id <> '')
  )
);

CREATE INDEX IF NOT EXISTS analytics_daily_pages
  ON analytics_daily (event_type, day, page_path);
CREATE INDEX IF NOT EXISTS analytics_daily_products
  ON analytics_daily (event_type, day, target_id);
