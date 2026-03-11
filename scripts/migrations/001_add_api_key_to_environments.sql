-- Migration: Add API Key field to environments table
-- Description: Adds api_key column to store unique API keys for each environment

ALTER TABLE environments ADD COLUMN api_key TEXT UNIQUE NOT NULL DEFAULT (lower(hex(randomblob(16))));
