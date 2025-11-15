-- Row Level Security (RLS) Policies for Users Page
-- This allows all authenticated users to view all profiles (public read access)
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing SELECT policies on profiles table (if any)
-- This ensures we don't have conflicting policies
DROP POLICY IF EXISTS "Allow authenticated users to read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;

-- Step 3: Create a policy that allows all authenticated users to SELECT (read) all profiles
-- This policy allows any authenticated user to read any profile
CREATE POLICY "Allow authenticated users to read all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Step 4: Ensure users can still update their own profiles
-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON profiles;

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Step 5: Ensure users can insert their own profile
-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON profiles;

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Step 6: Also ensure RLS is enabled on votes table and allow authenticated users to read votes
-- This is needed for the voting history information
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read votes (needed for voting statistics)
DROP POLICY IF EXISTS "Allow authenticated users to read votes" ON votes;
CREATE POLICY "Allow authenticated users to read votes"
ON votes
FOR SELECT
TO authenticated
USING (true);

-- Verify policies are created
-- You can run this query to check:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

