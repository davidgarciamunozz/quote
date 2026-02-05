-- Migration: Add operational_profit and exchange_rate to quotes
-- Run this if you have an existing database

ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS operational_profit NUMERIC DEFAULT 0 CHECK (operational_profit >= 0),
ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC DEFAULT 3500;
