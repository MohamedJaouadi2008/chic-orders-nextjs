-- Insert jean pants category
INSERT INTO categories (name, slug, is_active)
VALUES ('Jean Pants', 'jean-pants', true);

-- Insert the product with the category
INSERT INTO products (
  name,
  slug,
  description,
  price,
  stock,
  category_id,
  size_options,
  images,
  is_active
)
VALUES (
  'Mid Rise UltraSoft Baggy Jeans',
  'mid-rise-ultrasoft-baggy-jeans',
  'Jean baggy ultra-doux à taille mi-haute. Parfait pour toutes les saisons : le printemps, l''été, l''automne et l''hiver. Confort et style toute l''année.',
  450,
  25,
  (SELECT id FROM categories WHERE slug = 'jean-pants'),
  '["XS", "S", "M", "L", "XL"]',
  ARRAY[
    '/products/mid-rise-ultrasoft-baggy-jeans-1.avif',
    '/products/mid-rise-ultrasoft-baggy-jeans-2.avif',
    '/products/mid-rise-ultrasoft-baggy-jeans-3.avif',
    '/products/mid-rise-ultrasoft-baggy-jeans-4.avif',
    '/products/mid-rise-ultrasoft-baggy-jeans-5.avif'
  ],
  true
);