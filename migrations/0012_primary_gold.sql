-- Promote the former built-in bronze accent to the requested primary gold,
-- while preserving all product-specific accent colours.
UPDATE products
SET data = json_set(data, '$.accent', '#D4A035')
WHERE lower(json_extract(data, '$.accent')) = '#b89a62';
