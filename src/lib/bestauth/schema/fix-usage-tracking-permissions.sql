-- Fix RLS policies for BestAuth usage tracking table
-- Since we're using BestAuth (not Supabase auth), we need service role access

-- Temporarily disable RLS to allow service role access
ALTER TABLE bestauth_usage_tracking DISABLE ROW LEVEL SECURITY;

-- Alternative: Create policies that work with service role
-- If you want to keep RLS enabled, uncomment the following:

-- DROP POLICY IF EXISTS "Allow service role full access" ON bestauth_usage_tracking;
-- CREATE POLICY "Allow service role full access" 
-- ON bestauth_usage_tracking 
-- FOR ALL 
-- TO service_role
-- USING (true) 
-- WITH CHECK (true);

-- DROP POLICY IF EXISTS "Allow authenticated users full access" ON bestauth_usage_tracking;
-- CREATE POLICY "Allow authenticated users full access" 
-- ON bestauth_usage_tracking 
-- FOR ALL 
-- TO authenticated
-- USING (true) 
-- WITH CHECK (true);

-- For now, disable RLS entirely since we're handling auth at the application level
-- You can re-enable it later with proper policies for BestAuth