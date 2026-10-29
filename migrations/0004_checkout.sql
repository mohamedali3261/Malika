CREATE TABLE shipping_rates (city TEXT PRIMARY KEY, amount INTEGER NOT NULL CHECK(amount >= 0), free_threshold INTEGER CHECK(free_threshold IS NULL OR free_threshold >= 0));
CREATE TABLE coupons (code TEXT PRIMARY KEY, percent INTEGER NOT NULL CHECK(percent BETWEEN 1 AND 100), max_uses INTEGER NOT NULL CHECK(max_uses > 0), uses INTEGER NOT NULL DEFAULT 0 CHECK(uses >= 0), expires_at TEXT, enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1)));
ALTER TABLE orders ADD COLUMN shipping INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code TEXT;
ALTER TABLE orders ADD COLUMN tracking_hash TEXT;
CREATE UNIQUE INDEX order_tracking_hash ON orders(tracking_hash) WHERE tracking_hash IS NOT NULL;
CREATE TRIGGER validate_checkout BEFORE INSERT ON orders WHEN NEW.tracking_hash IS NOT NULL BEGIN
  SELECT CASE WHEN NEW.subtotal < 0 OR NEW.discount < 0 OR NEW.shipping < 0 THEN RAISE(ABORT, 'invalid_checkout') END;
  SELECT CASE WHEN NEW.coupon_code IS NULL AND NEW.discount != 0 THEN RAISE(ABORT, 'coupon_changed') END;
  SELECT CASE WHEN NEW.coupon_code IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM coupons c WHERE c.code=NEW.coupon_code AND c.enabled=1 AND c.uses<c.max_uses
      AND (c.expires_at IS NULL OR datetime(c.expires_at)>datetime('now'))
      AND NEW.discount=CAST(NEW.subtotal*c.percent/100 AS INTEGER)
  ) THEN RAISE(ABORT, 'coupon_changed') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM shipping_rates r WHERE r.city=NEW.city AND NEW.shipping = CASE WHEN r.free_threshold IS NOT NULL AND NEW.subtotal-NEW.discount>=r.free_threshold THEN 0 ELSE r.amount END
  ) THEN RAISE(ABORT, 'shipping_changed') END;
END;
CREATE TRIGGER consume_coupon AFTER INSERT ON orders WHEN NEW.tracking_hash IS NOT NULL AND NEW.coupon_code IS NOT NULL BEGIN
  UPDATE coupons SET uses=uses+1 WHERE code=NEW.coupon_code;
END;
