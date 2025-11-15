-- ============================================
-- SUPABASE RLS POLICIES FOR USERS PAGE
-- ============================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- This will allow all authenticated users to view all profiles
-- ============================================

-- 1. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Remove any existing SELECT policies (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;

-- 3. Create new policy: Allow ALL authenticated users to READ ALL profiles
-- This is what makes the Users page work - everyone can see everyone's profile
CREATE POLICY "Allow authenticated users to read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- 4. Keep users from updating other users' profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Allow users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 6. Enable RLS on votes table and allow reading votes (for voting statistics)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated users to read votes" ON votes;
CREATE POLICY "Allow authenticated users to read votes"
ON votes
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- DONE! Now refresh your Users page and it should show all users
-- ============================================

