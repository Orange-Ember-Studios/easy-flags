-- Migration: Add Token Version for Session Revocation
-- Description: Enables token invalidation by adding a version field to users table
-- Date: 2026-03-21
-- Purpose: Allow revoking all active tokens for a user by incrementing token_version

-- Add token_version column to users table
ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 0;

-- Create index for efficient lookups during token verification
CREATE INDEX IF NOT EXISTS idx_users_token_version ON users(id, token_version);
