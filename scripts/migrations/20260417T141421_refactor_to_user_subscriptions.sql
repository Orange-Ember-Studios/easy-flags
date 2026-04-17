-- Migration: refactor_to_user_subscriptions
-- Description: Changes the subscription and payment models from space-centric to user-centric.
-- Created: 2026-04-17T14:14:21.000Z

-- 1. Drop old tables (Assuming we can reset dev data)
DROP TABLE IF EXISTS space_subscriptions;
DROP TABLE IF EXISTS payments;

-- 2. Create User Subscriptions Table: Track which user is on which plan
-- One subscription per user account. All spaces owned by the user inherit this plan.
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  pricing_plan_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('active', 'canceled', 'past_due', 'trial')) DEFAULT 'active',
  trial_start_date DATETIME,
  trial_end_date DATETIME,
  current_period_start DATETIME,
  current_period_end DATETIME,
  cancellation_date DATETIME,
  canceled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id)
);

-- Create indexes for user subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- 3. Re-create Payments Table: Track payments linked to user accounts
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  pricing_plan_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  external_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id)
);

-- Create index for faster lookups by user and reference
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
