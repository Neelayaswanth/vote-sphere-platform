-- ============================================
-- SUPABASE RLS POLICIES FOR ELECTIONS & CANDIDATES
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This allows admins to create and manage elections
-- ============================================

-- 1. Enable RLS on elections table
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert elections" ON elections;
DROP POLICY IF EXISTS "Admins can update elections" ON elections;
DROP POLICY IF EXISTS "Admins can delete elections" ON elections;
DROP POLICY IF EXISTS "Allow authenticated users to read elections" ON elections;
DROP POLICY IF EXISTS "Users can read elections" ON elections;

-- 3. Allow all authenticated users to READ elections (public read)
CREATE POLICY "Allow authenticated users to read elections"
ON elections
FOR SELECT
TO authenticated
USING (true);

-- 4. Allow only admins to INSERT elections
CREATE POLICY "Admins can insert elections"
ON elections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 5. Allow only admins to UPDATE elections
CREATE POLICY "Admins can update elections"
ON elections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 6. Allow only admins to DELETE elections
CREATE POLICY "Admins can delete elections"
ON elections
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- CANDIDATES TABLE POLICIES
-- ============================================

-- 7. Enable RLS on candidates table
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- 8. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can insert candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can update candidates" ON candidates;
DROP POLICY IF EXISTS "Admins can delete candidates" ON candidates;
DROP POLICY IF EXISTS "Allow authenticated users to read candidates" ON candidates;
DROP POLICY IF EXISTS "Users can read candidates" ON candidates;

-- 9. Allow all authenticated users to READ candidates (public read)
CREATE POLICY "Allow authenticated users to read candidates"
ON candidates
FOR SELECT
TO authenticated
USING (true);

-- 10. Allow only admins to INSERT candidates
CREATE POLICY "Admins can insert candidates"
ON candidates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 11. Allow only admins to UPDATE candidates
CREATE POLICY "Admins can update candidates"
ON candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 12. Allow only admins to DELETE candidates
CREATE POLICY "Admins can delete candidates"
ON candidates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- DONE!
-- ============================================
-- Now admins can create, update, and delete elections and candidates
-- All authenticated users can read elections and candidates
-- ============================================

