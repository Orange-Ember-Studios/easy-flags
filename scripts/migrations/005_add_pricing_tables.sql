-- Migration: Add Pricing & Billing Tables
-- Description: Creates tables for managing subscription plans and pricing tiers
-- Date: 2026-03-21

-- Pricing Plans Table: Main pricing tiers
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL CHECK(billing_period IN ('monthly', 'yearly', 'one-time')),
  is_active BOOLEAN DEFAULT 1,
  is_recommended BOOLEAN DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for sorting and filtering
CREATE INDEX IF NOT EXISTS idx_pricing_plans_sort_order ON pricing_plans(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active);

-- Pricing Plan Features Table: Features included in each plan
CREATE TABLE IF NOT EXISTS pricing_plan_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pricing_plan_id INTEGER NOT NULL,
  feature_name TEXT NOT NULL,
  feature_description TEXT,
  feature_value TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id) ON DELETE CASCADE
);

-- Create index for features sorting
CREATE INDEX IF NOT EXISTS idx_pricing_plan_features_plan ON pricing_plan_features(pricing_plan_id, sort_order);

-- Pricing Limits Table: Define limits for each plan (flag count, environments, API requests, etc.)
CREATE TABLE IF NOT EXISTS pricing_plan_limits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pricing_plan_id INTEGER NOT NULL,
  limit_name TEXT NOT NULL,
  limit_value INTEGER NOT NULL,
  limit_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id) ON DELETE CASCADE,
  UNIQUE(pricing_plan_id, limit_name)
);

-- Create index for limit lookups
CREATE INDEX IF NOT EXISTS idx_pricing_plan_limits_plan ON pricing_plan_limits(pricing_plan_id);

-- Space Subscriptions Table: Track which space is on which plan
CREATE TABLE IF NOT EXISTS space_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  space_id INTEGER NOT NULL UNIQUE,
  pricing_plan_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'canceled', 'past_due', 'trial')) DEFAULT 'active',
  stripe_subscription_id TEXT,
  trial_start_date DATETIME,
  trial_end_date DATETIME,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancellation_date DATETIME,
  canceled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (space_id) REFERENCES spaces(id) ON DELETE CASCADE,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id)
);

-- Create indexes for subscription lookups
CREATE INDEX IF NOT EXISTS idx_space_subscriptions_space_id ON space_subscriptions(space_id);
CREATE INDEX IF NOT EXISTS idx_space_subscriptions_plan_id ON space_subscriptions(pricing_plan_id);
CREATE INDEX IF NOT EXISTS idx_space_subscriptions_status ON space_subscriptions(status);
