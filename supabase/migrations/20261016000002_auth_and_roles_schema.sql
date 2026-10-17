-- Add password_hash column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ensure RLS is properly permissive for backend service and users without permission errors
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all profile operations" ON profiles;
CREATE POLICY "Allow all profile operations" ON profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all exam operations" ON exams;
CREATE POLICY "Allow all exam operations" ON exams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all question operations" ON questions;
CREATE POLICY "Allow all question operations" ON questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all attempt operations" ON exam_attempts;
CREATE POLICY "Allow all attempt operations" ON exam_attempts FOR ALL USING (true) WITH CHECK (true);
