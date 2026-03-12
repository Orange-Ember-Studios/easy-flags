-- Migration: Add space owners as team members for backward compatibility
-- 
-- This migration ensures that all space owners are added as admin team members
-- if they don't already exist in the space_members table.
--
-- This is needed for backward compatibility with spaces created before this feature,
-- ensuring the owner always has proper team member entry with their username.

INSERT INTO space_members (space_id, user_id, role_id, created_at)
SELECT s.id, s.owner_id, 2, datetime('now')
FROM spaces s
WHERE NOT EXISTS (
  SELECT 1 FROM space_members sm
  WHERE sm.space_id = s.id AND sm.user_id = s.owner_id
);
