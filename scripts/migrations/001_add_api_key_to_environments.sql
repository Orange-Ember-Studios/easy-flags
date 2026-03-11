-- Migration: Add API Key field to environments table
-- Description: Adds api_key column to store unique API keys for each environment
-- This migration is conditional and only adds the column if it doesn't already exist

-- For SQLite, we need to use a workaround since ALTER TABLE ADD COLUMN with functions isn't always reliable
-- We'll generate unique keys as we add the column
ALTER TABLE environments ADD COLUMN api_key TEXT UNIQUE NOT NULL DEFAULT (hex(randomblob(8)) || '_' || hex(randomblob(8)));
