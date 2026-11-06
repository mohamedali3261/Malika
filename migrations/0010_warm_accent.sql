-- Replace the former global lime accent in stored product JSON while preserving
-- all other product data and any custom product accent colors.
UPDATE products
SET data = json_set(data, '$.accent', '#B89A62')
WHERE lower(json_extract(data, '$.accent')) = '#ddf25c';
