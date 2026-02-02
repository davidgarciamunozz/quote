-- Dental Quotes Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create price_items table
CREATE TABLE IF NOT EXISTS price_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  group_type TEXT NOT NULL CHECK (group_type IN ('clinic', 'laboratory', 'logistics', 'extra')),
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

-- Insert sample price items (optional - for testing)
INSERT INTO price_items (name, price, group_type) VALUES
  ('Dental Cleaning', 80.00, 'clinic'),
  ('Dental Exam', 50.00, 'clinic'),
  ('X-Ray (Single)', 25.00, 'clinic'),
  ('X-Ray (Full Mouth)', 150.00, 'clinic'),
  ('Filling (Composite)', 120.00, 'clinic'),
  ('Root Canal', 800.00, 'clinic'),
  ('Crown (Porcelain)', 1200.00, 'laboratory'),
  ('Bridge (3-unit)', 2500.00, 'laboratory'),
  ('Dentures (Full Set)', 1800.00, 'laboratory'),
  ('Teeth Whitening', 350.00, 'extra'),
  ('Emergency Visit', 100.00, 'extra'),
  ('Consultation', 75.00, 'clinic')
ON CONFLICT DO NOTHING;
