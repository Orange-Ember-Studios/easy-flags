-- Migration: add_multi_currency_prices
-- Description: Adds price_usd and price_cop columns to support multi-currency pricing.
-- Created: 2026-04-17T15:36:21.000Z

-- 1. Add new columns
ALTER TABLE pricing_plans ADD COLUMN price_usd REAL NOT NULL DEFAULT 0;
ALTER TABLE pricing_plans ADD COLUMN price_cop REAL NOT NULL DEFAULT 0;

-- 2. Update existing data
-- Basic (id: 2)
UPDATE pricing_plans SET price_usd = 9.99, price_cop = 40000 WHERE id = 2;
-- Pro (id: 3)
UPDATE pricing_plans SET price_usd = 29.99, price_cop = 120000 WHERE id = 3;
-- Lab/Free (id: 1)
UPDATE pricing_plans SET price_usd = 0, price_cop = 0 WHERE id = 1;

-- 3. We keep the old 'price' column for now to avoid table recreation complexity in SQLite
-- It will be ignored by the application after the repository update.
