-- ============================================
-- FIX LAST LOGIN TRACKING
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This will add a last_login column and create functions to track actual login times
-- ============================================

-- Step 1: Add last_login column to profiles table (if it doesn't exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- Step 2: Create a function to get user last sign-in from auth.users
-- This function will be used to get accurate last login times
CREATE OR REPLACE FUNCTION get_user_last_login(user_id UUID)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_sign_in TIMESTAMPTZ;
BEGIN
  -- Get last_sign_in_at from auth.users
  SELECT last_sign_in_at INTO last_sign_in
  FROM auth.users
  WHERE id = user_id;
  
  RETURN last_sign_in;
END;
$$;

-- Step 3: Create a function to update last_login when user signs in
-- This will be called automatically via a database trigger or manually on login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles.last_login with the last_sign_in_at from auth.users
  UPDATE profiles
  SET last_login = (
    SELECT last_sign_in_at 
    FROM auth.users 
    WHERE id = NEW.id
  )
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Step 4: Create a view that joins profiles with auth.users last_sign_in_at
-- This gives us accurate last login times
CREATE OR REPLACE VIEW profiles_with_login AS
SELECT 
  p.*,
  COALESCE(
    (SELECT last_sign_in_at FROM auth.users WHERE id = p.id),
    p.last_login,
    p.updated_at
  ) AS actual_last_login
FROM profiles p;

-- Step 5: Grant access to the view
GRANT SELECT ON profiles_with_login TO authenticated;

-- ============================================
-- DONE!
-- ============================================
-- Now update your Users page to:
-- 1. Use the profiles_with_login view instead of profiles table
-- 2. Or call get_user_last_login(user_id) function for each user
-- 3. Or update last_login column on login in your app code
-- ============================================

