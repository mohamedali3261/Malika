DROP TRIGGER product_inventory_insert;
DROP TRIGGER product_inventory_update;
CREATE TRIGGER product_inventory_insert AFTER INSERT ON products BEGIN
  INSERT INTO inventory(product_id, size)
  SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes') WHERE 1
  ON CONFLICT(product_id, size) DO NOTHING;
END;
CREATE TRIGGER product_inventory_update AFTER UPDATE OF data ON products BEGIN
  INSERT INTO inventory(product_id, size)
  SELECT NEW.id, CAST(json_extract(value, '$.ml') AS INTEGER) FROM json_each(NEW.data, '$.sizes') WHERE 1
  ON CONFLICT(product_id, size) DO NOTHING;
END;
