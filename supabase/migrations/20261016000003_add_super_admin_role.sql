-- Add 'super_admin' to profiles role check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'examiner', 'admin', 'super_admin'));

-- Ensure RLS allows super admin and system operations cleanly
DROP POLICY IF EXISTS "Allow all profile operations" ON profiles;
CREATE POLICY "Allow all profile operations" ON profiles FOR ALL USING (true) WITH CHECK (true);
