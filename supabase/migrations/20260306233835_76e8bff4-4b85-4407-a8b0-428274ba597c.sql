
-- Assign Pantalon Palazzo Noir to Pantalon category
UPDATE products SET category_id = 'bcdcfd96-7ec7-4377-9b39-8ca89b6e875d' WHERE id = '42b35ea5-28ff-4768-a0d1-acda7c594d2d';

-- Assign Robe Midi Fleurie to Robe category
UPDATE products SET category_id = '5b79b21d-924e-4c13-b631-a06a841774e9' WHERE id = '2b485581-b4f4-48de-9f63-ac6e14986bbd';

-- Assign Pull Col Roulé to Pull category (move from Top)
UPDATE products SET category_id = '57e42df0-5e6c-4f01-b593-df536a6de20c' WHERE id = '86d15092-f66b-485d-9628-2b765cb7dc9c';

-- Assign "shirt" to Top category
UPDATE products SET category_id = '97161295-e558-4827-a7a8-c385eb3f2a66' WHERE id = '169db8bc-08b1-43c0-af72-22abaec35821';
