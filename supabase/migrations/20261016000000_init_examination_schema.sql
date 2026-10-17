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
    role TEXT CHECK (role IN ('student', 'examiner', 'admin')) DEFAULT 'student',
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
CREATE POLICY "Allow users to view attempts" ON exam_attempts FOR SELECT USING (true);

-- SEED DATA FOR DEMO EXAMS & QUESTIONS
DO $$
DECLARE
    v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001'::uuid;
    v_exam1_id UUID := 'e1000000-0000-0000-0000-000000000001'::uuid;
    v_exam2_id UUID := 'e2000000-0000-0000-0000-000000000002'::uuid;
    v_exam3_id UUID := 'e3000000-0000-0000-0000-000000000003'::uuid;
BEGIN
    -- Seed admin profile
    INSERT INTO profiles (id, email, full_name, role)
    VALUES (v_admin_id, 'proctor@examsphere.io', 'Dr. Sarah Mitchell', 'examiner')
    ON CONFLICT (id) DO NOTHING;

    -- Seed Exam 1: Full-Stack Web Architecture
    INSERT INTO exams (id, title, description, category, duration_minutes, total_marks, passing_percentage, negative_marking, negative_marks_per_question, tab_switch_limit, fullscreen_required, webcam_required, created_by)
    VALUES (
        v_exam1_id,
        'Full-Stack Web Architecture & Performance 2026',
        'Comprehensive assessment covering modern Node.js, React concurrency, REST/GraphQL design, state management, and edge rendering.',
        'Software Engineering',
        30,
        50,
        60.00,
        true,
        0.5,
        3,
        true,
        true,
        v_admin_id
    ) ON CONFLICT (id) DO NOTHING;

    -- Questions for Exam 1
    INSERT INTO questions (exam_id, question_text, question_type, options, correct_answers, explanation, marks, negative_marks, difficulty, code_snippet, order_index)
    VALUES 
    (
        v_exam1_id,
        'Which React hook is specifically designed to defer updating a part of the UI until higher-priority updates have finished?',
        'single_choice',
        '["useDeferredValue", "useTransition", "useMemo", "useId"]'::jsonb,
        '["useDeferredValue"]'::jsonb,
        'useDeferredValue is a React Hook that lets you defer updating a part of the UI, allowing high priority user interactions to stay responsive.',
        5.0,
        1.0,
        'medium',
        'const deferredQuery = useDeferredValue(query);',
        1
    ),
    (
        v_exam1_id,
        'Which HTTP status code is most appropriate when a client request violates a rate limit policy?',
        'single_choice',
        '["403 Forbidden", "429 Too Many Requests", "503 Service Unavailable", "400 Bad Request"]'::jsonb,
        '["429 Too Many Requests"]'::jsonb,
        'RFC 6585 specifies HTTP 429 Too Many Requests when the user has sent too many requests in a given amount of time.',
        5.0,
        1.0,
        'easy',
        NULL,
        2
    ),
    (
        v_exam1_id,
        'Which of the following headers are critical for preventing Cross-Site Scripting (XSS) and clickjacking attacks? (Select all that apply)',
        'multi_choice',
        '["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Access-Control-Allow-Origin"]'::jsonb,
        '["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options"]'::jsonb,
        'CSP prevents malicious script execution, X-Frame-Options mitigates clickjacking, and X-Content-Type-Options prevents MIME sniffing.',
        10.0,
        2.0,
        'hard',
        NULL,
        3
    ),
    (
        v_exam1_id,
        'True or False: In Node.js event loop, setImmediate() callbacks run in the Check phase, whereas setTimeout(fn, 0) runs in the Timers phase.',
        'true_false',
        '["True", "False"]'::jsonb,
        '["True"]'::jsonb,
        'True. The Node.js event loop runs Timers (setTimeout/setInterval), I/O callbacks, Idle/prepare, Poll, Check (setImmediate), and Close callbacks.',
        5.0,
        1.0,
        'medium',
        NULL,
        4
    ),
    (
        v_exam1_id,
        'What data structure does PostgreSQL typically use for default B-tree indexes to enable O(log N) lookup and range scans?',
        'single_choice',
        '["Balanced B+ Tree", "Hash Map", "Skip List", "Red-Black Tree"]'::jsonb,
        '["Balanced B+ Tree"]'::jsonb,
        'Postgres B-tree indexes are self-balancing search trees (specifically Lehman-Yao high-concurrency B+ trees) where leaves are linked for range scans.',
        5.0,
        1.0,
        'medium',
        NULL,
        5
    );

    -- Seed Exam 2: Data Structures & Algorithms Mastery
    INSERT INTO exams (id, title, description, category, duration_minutes, total_marks, passing_percentage, negative_marking, negative_marks_per_question, tab_switch_limit, fullscreen_required, webcam_required, created_by)
    VALUES (
        v_exam2_id,
        'Data Structures & Algorithms Certification',
        'Standard algorithmic proficiency test featuring asymptotic analysis, trees, dynamic programming, and graph traversals.',
        'Computer Science',
        40,
        40,
        70.00,
        false,
        0.0,
        2,
        true,
        false,
        v_admin_id
    ) ON CONFLICT (id) DO NOTHING;

    -- Questions for Exam 2
    INSERT INTO questions (exam_id, question_text, question_type, options, correct_answers, explanation, marks, negative_marks, difficulty, order_index)
    VALUES
    (
        v_exam2_id,
        'What is the tightest worst-case time complexity of finding the shortest path in a graph with non-negative weights using Dijkstra algorithm with a min-heap?',
        'single_choice',
        '["O(V^2)", "O((V + E) log V)", "O(V * E)", "O(E log E)"]'::jsonb,
        '["O((V + E) log V)"]'::jsonb,
        'Using a binary min-heap priority queue, Dijkstra operates in O((V + E) log V) time.',
        10.0,
        0.0,
        'medium',
        1
    ),
    (
        v_exam2_id,
        'Which tree data structure guarantees that the height difference between left and right subtrees of any node is at most 1?',
        'single_choice',
        '["AVL Tree", "Binary Search Tree", "Trie", "B-Tree"]'::jsonb,
        '["AVL Tree"]'::jsonb,
        'An AVL tree is a strictly height-balanced binary search tree with balance factors constrained strictly to -1, 0, or 1.',
        10.0,
        0.0,
        'easy',
        2
    ),
    (
        v_exam2_id,
        'True or False: Every Dynamic Programming problem can be solved with a top-down memoized recursion approach or a bottom-up iterative table.',
        'true_false',
        '["True", "False"]'::jsonb,
        '["True"]'::jsonb,
        'Any problem exhibiting optimal substructure and overlapping subproblems can be formulated either top-down with memoization or bottom-up with tabulation.',
        10.0,
        0.0,
        'easy',
        3
    ),
    (
        v_exam2_id,
        'Which sorting algorithms maintain the relative order of elements with equal keys (stable sorting)? (Select all that apply)',
        'multi_choice',
        '["Merge Sort", "Insertion Sort", "Standard Quick Sort", "Heap Sort"]'::jsonb,
        '["Merge Sort", "Insertion Sort"]'::jsonb,
        'Merge Sort and Insertion Sort are naturally stable. Quick Sort and Heap Sort in their standard forms are unstable.',
        10.0,
        0.0,
        'hard',
        4
    );

END $$;
