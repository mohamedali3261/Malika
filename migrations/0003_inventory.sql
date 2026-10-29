CREATE TABLE inventory (
  product_id TEXT NOT NULL REFERENCES products(id),
  size INTEGER NOT NULL CHECK(size > 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
  PRIMARY KEY (product_id, size)
);
INSERT OR IGNORE INTO inventory(product_id, size)
SELECT p.id, CAST(json_extract(j.value, '$.ml') AS INTEGER)
FROM products p, json_each(p.data, '$.sizes') j;
CREATE TRIGGER product_inventory_insert AFTER INSERT ON products BEGIN
  INSERT OR IGNORE INTO inventory(product_id, size)
  SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes');
END;
CREATE TRIGGER product_inventory_update AFTER UPDATE OF data ON products BEGIN
  INSERT OR IGNORE INTO inventory(product_id, size)
  SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes');
END;
ALTER TABLE orders ADD COLUMN stock_reserved INTEGER NOT NULL DEFAULT 0 CHECK(stock_reserved IN (0, 1));
CREATE TRIGGER validate_and_reserve_order_item BEFORE INSERT ON order_items
WHEN (SELECT stock_reserved FROM orders WHERE id=NEW.order_id) = 1
BEGIN
  SELECT CASE WHEN NEW.quantity < 1 OR NOT EXISTS (
    SELECT 1 FROM products p, json_each(p.data, '$.sizes') s
    WHERE p.id=NEW.product_id AND p.archived=0
      AND json_extract(s.value, '$.ml')=NEW.size
      AND json_extract(s.value, '$.price')=NEW.unit_price
  ) THEN RAISE(ABORT, 'product_changed') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM inventory WHERE product_id=NEW.product_id AND size=NEW.size AND quantity>=NEW.quantity
  ) THEN RAISE(ABORT, 'insufficient_stock') END;
  UPDATE inventory SET quantity=quantity-NEW.quantity WHERE product_id=NEW.product_id AND size=NEW.size;
END;
CREATE TRIGGER cancelled_orders_are_final BEFORE UPDATE OF status ON orders
WHEN OLD.status='cancelled' AND NEW.status != 'cancelled'
BEGIN SELECT RAISE(ABORT, 'cancelled_order_is_final'); END;
CREATE TRIGGER restore_cancelled_order_stock AFTER UPDATE OF status ON orders
WHEN OLD.status != 'cancelled' AND NEW.status='cancelled' AND OLD.stock_reserved=1
BEGIN
  UPDATE inventory SET quantity=quantity + COALESCE((
    SELECT SUM(quantity) FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size
  ),0)
  WHERE EXISTS (SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND size=inventory.size);
END;
