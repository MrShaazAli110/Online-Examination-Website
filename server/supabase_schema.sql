-- ==========================================================
-- Online Examination System - Supabase PostgreSQL Schema
-- Compatible with Supabase SQL Editor and PostgreSQL 14+
-- ==========================================================

-- Enable pgcrypto extension if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('student', 'examiner', 'admin', 'super_admin')) DEFAULT 'student',
    password_hash TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Computer Science',
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    total_marks INTEGER NOT NULL DEFAULT 100,
    passing_percentage NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
    negative_marking BOOLEAN DEFAULT false,
    negative_marks_per_question NUMERIC(4, 2) DEFAULT 0.25,
    shuffle_questions BOOLEAN DEFAULT true,
    shuffle_options BOOLEAN DEFAULT true,
    tab_switch_limit INTEGER DEFAULT 3,
    fullscreen_required BOOLEAN DEFAULT true,
    webcam_required BOOLEAN DEFAULT false,
    allow_calculator BOOLEAN DEFAULT false,
    access_code TEXT,
    status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'published',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('single_choice', 'multi_choice', 'true_false', 'short_answer')) DEFAULT 'single_choice',
    options JSONB DEFAULT '[]'::jsonb, -- Array of string options or objects
    correct_answers JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of correct string or index values
    explanation TEXT,
    marks NUMERIC(5, 2) NOT NULL DEFAULT 1.0,
    negative_marks NUMERIC(4, 2) DEFAULT 0.0,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    code_snippet TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER DEFAULT 0,
    score NUMERIC(6, 2) DEFAULT 0.0,
    total_marks NUMERIC(6, 2) DEFAULT 0.0,
    percentage NUMERIC(5, 2) DEFAULT 0.0,
    passed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '{}'::jsonb, -- Key: question_id, Value: user response
    violations_count INTEGER DEFAULT 0,
    violations_log JSONB DEFAULT '[]'::jsonb, -- List of proctoring events: tab switch, blur, etc.
    status TEXT CHECK (status IN ('in_progress', 'completed', 'disqualified', 'timed_out')) DEFAULT 'in_progress',
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam_id ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student_email ON exam_attempts(student_email);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON exam_attempts(status);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demonstration or authenticated role
CREATE POLICY "Public read for exams" ON exams FOR SELECT USING (true);
CREATE POLICY "Examiners can insert exams" ON exams FOR INSERT WITH CHECK (true);
CREATE POLICY "Examiners can update their exams" ON exams FOR UPDATE USING (true);

CREATE POLICY "Public read for questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Examiners can manage questions" ON questions FOR ALL USING (true);

CREATE POLICY "Allow student attempt creation" ON exam_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow attempt updating" ON exam_attempts FOR UPDATE USING (true);
-- Allow users to view attempts
CREATE POLICY "Allow users to view attempts" ON exam_attempts FOR SELECT USING (true);

