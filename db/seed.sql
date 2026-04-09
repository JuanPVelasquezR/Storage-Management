-- Datos de ejemplo (opcional)

INSERT INTO categories (name)
VALUES
  ('Bebidas'),
  ('Snacks'),
  ('Limpieza')
ON CONFLICT (name) DO NOTHING;

-- Productos demo (ajusta precios/stock a tu gusto)
INSERT INTO products (name, description, price, stock, image_url, active, category_id)
SELECT
  v.name,
  v.description,
  v.price,
  v.stock,
  v.image_url,
  TRUE,
  c.id
FROM (VALUES
  ('Agua 500ml', 'Botella de agua', 0.80, 50, NULL, 'Bebidas'),
  ('Gaseosa 1L', 'Bebida gaseosa', 1.50, 35, NULL, 'Bebidas'),
  ('Papas fritas', 'Bolsa 45g', 1.10, 40, NULL, 'Snacks'),
  ('Jabón líquido', '500ml', 2.75, 20, NULL, 'Limpieza')
) AS v(name, description, price, stock, image_url, category_name)
JOIN categories c ON c.name = v.category_name
ON CONFLICT DO NOTHING;

