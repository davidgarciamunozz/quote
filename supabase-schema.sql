-- Dental Quotes Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create price_items table
CREATE TABLE IF NOT EXISTS price_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  group_type TEXT NOT NULL CHECK (group_type IN ('clinic', 'laboratory', 'logistics', 'implantologist', 'periodontist', 'endodontist', 'extra')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  notes TEXT,
  total NUMERIC NOT NULL CHECK (total >= 0),
  operational_profit NUMERIC DEFAULT 0 CHECK (operational_profit >= 0),
  exchange_rate NUMERIC DEFAULT 3500,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  price_item_id UUID REFERENCES price_items(id) NOT NULL,
  price_snapshot NUMERIC NOT NULL CHECK (price_snapshot >= 0),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  subtotal NUMERIC NOT NULL CHECK (subtotal >= 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_price_items_group_type ON price_items(group_type);
CREATE INDEX IF NOT EXISTS idx_price_items_is_active ON price_items(is_active);
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_price_item_id ON quote_items(price_item_id);

-- Enable Row Level Security
ALTER TABLE price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for price_items (all authenticated users can manage)
CREATE POLICY "Allow authenticated users to read price items"
  ON price_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert price items"
  ON price_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update price items"
  ON price_items FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for quotes (users can only access their own quotes)
CREATE POLICY "Users can read their own quotes"
  ON quotes FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create their own quotes"
  ON quotes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quotes"
  ON quotes FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for quote_items (access through parent quote)
CREATE POLICY "Users can read quote items for their quotes"
  ON quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert quote items for their quotes"
  ON quote_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_items.quote_id
      AND quotes.created_by = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on price_items
CREATE TRIGGER update_price_items_updated_at
  BEFORE UPDATE ON price_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert price items - Catálogo en pesos colombianos (COP)
INSERT INTO price_items (name, price, group_type) VALUES
  -- Dentista (Clinic)
  ('Higiene', 160000, 'clinic'),
  ('Preparación Puente', 50000, 'clinic'),
  ('Caries', 100000, 'clinic'),
  ('Coronas Puesta', 80000, 'clinic'),
  ('Carillas Puesta', 110000, 'clinic'),
  ('Extracción diente', 50000, 'clinic'),
  ('Extracción cordales', 100000, 'clinic'),
  -- Laboratorio
  ('Corona', 260000, 'laboratory'),
  ('Carillas', 190000, 'laboratory'),
  ('Corona Metal Porcelana', 150000, 'laboratory'),
  ('Corona en Ceromero', 160000, 'laboratory'),
  ('Corona en Disilicato', 230000, 'laboratory'),
  ('Corona en Circonio', 250000, 'laboratory'),
  ('Incrustración Disilicato', 230000, 'laboratory'),
  ('Carilla en Disilicato', 230000, 'laboratory'),
  ('Carilla en Ceromero', 160000, 'laboratory'),
  ('Provisional autocurado', 30000, 'laboratory'),
  ('Provisional termocurado', 35000, 'laboratory'),
  ('Placa extracomfort', 160000, 'laboratory'),
  ('Protesis total o parcial', 150000, 'laboratory'),
  ('Protesis inmediata', 90000, 'laboratory'),
  ('Placa acetato', 30000, 'laboratory'),
  ('Retenedor essix', 30000, 'laboratory'),
  ('Encerado diagnostico', 20000, 'laboratory'),
  ('Escaner', 250000, 'laboratory'),
  -- Implantólogo
  ('Implantes', 1800000, 'implantologist'),
  ('Ingerto de Hueso', 300000, 'implantologist'),
  ('Rehabilitación de implante', 800000, 'implantologist'),
  -- Periodoncista
  ('Recorte de encia', 80000, 'periodontist'),
  ('Raspado periodontal', 400000, 'periodontist'),
  -- Endodoncista
  ('Endodoncia', 500000, 'endodontist'),
  -- Logística
  ('Transporte', 800000, 'logistics'),
  ('Hotel', 340000, 'logistics'),
  ('Alimentación', 100000, 'logistics'),
  ('Video y edición', 450000, 'logistics');
