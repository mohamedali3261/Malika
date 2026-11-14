-- Reset current catalogue prices even if the earlier one-pound migration has
-- already been applied and prices have since been edited. Keep historical
-- orders and shipping settings unchanged.
UPDATE products
SET data = json_set(
  data,
  '$.price', 1,
  '$.compareAt', 1,
  '$.sizes', json((
    SELECT json_group_array(json_set(size.value, '$.price', 1))
    FROM json_each(products.data, '$.sizes') AS size
  ))
);
