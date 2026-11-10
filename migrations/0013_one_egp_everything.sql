-- Set every current product amount, size price, comparison price and delivery
-- amount/threshold to EGP 1. Historical orders and coupon percentages are kept.
UPDATE products
SET data = json_set(
  data,
  '$.price', 1,
  '$.compareAt', 1,
  '$.sizes', json(
    (
      SELECT json_group_array(json_set(size.value, '$.price', 1))
      FROM json_each(products.data, '$.sizes') AS size
    )
  )
);

UPDATE shipping_rates
SET amount = 1,
    free_threshold = 1;
