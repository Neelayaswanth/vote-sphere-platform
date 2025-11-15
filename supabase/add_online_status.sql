-- ============================================
-- ADD ONLINE/OFFLINE STATUS TRACKING
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This will add fields to track if users are currently active/online
-- ============================================

-- Step 1: Add last_active column to track recent activity (updated every few minutes when user is active)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create index for faster queries on last_active
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active);

-- Step 3: Create a function to check if user is online (active in last 10 minutes)
CREATE OR REPLACE FUNCTION is_user_online(last_active_timestamp TIMESTAMPTZ)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- User is considered online if last_active is within the last 10 minutes
  RETURN last_active_timestamp > (NOW() - INTERVAL '10 minutes');
END;
$$;

-- Step 4: Update the profiles_with_login view to include online status
DROP VIEW IF EXISTS profiles_with_login;
CREATE OR REPLACE VIEW profiles_with_login AS
SELECT 
  p.*,
  COALESCE(
    (SELECT last_sign_in_at FROM auth.users WHERE id = p.id),
    p.last_login,
    p.updated_at
  ) AS actual_last_login,
  is_user_online(COALESCE(p.last_active, p.last_login, p.updated_at, p.created_at)) AS is_online,
  COALESCE(p.last_active, p.last_login, p.updated_at, p.created_at) AS last_activity
FROM profiles p;

-- Step 5: Grant access to the view
GRANT SELECT ON profiles_with_login TO authenticated;

-- ============================================
-- DONE!
-- ============================================
-- Users are considered "online" if last_active is within the last 10 minutes
-- Your app should update last_active periodically (every 5 minutes or so) 
-- when users are actively using the website
-- ============================================

