-- FEAT-16: Warenkorb-System Migration
-- Manuell ausführen in Neon SQL Editor

-- 1. purchase_items Tabelle erstellen
CREATE TABLE IF NOT EXISTS purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE NOT NULL,
  product_id INTEGER REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. total_price Spalte hinzufügen (price bleibt bestehen für FEAT-7)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- 3. product_id nullable machen (für Warenkorb-Bestellungen)
ALTER TABLE purchases ALTER COLUMN product_id DROP NOT NULL;

-- 4. Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_product_id ON purchase_items(product_id);
