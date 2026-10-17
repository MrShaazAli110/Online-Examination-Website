-- Clean up all demo/fake seed data from remote database
DELETE FROM questions WHERE exam_id IN (
    'e1000000-0000-0000-0000-000000000001'::uuid,
    'e2000000-0000-0000-0000-000000000002'::uuid,
    'e3000000-0000-0000-0000-000000000003'::uuid
);

DELETE FROM exam_attempts WHERE exam_id IN (
    'e1000000-0000-0000-0000-000000000001'::uuid,
    'e2000000-0000-0000-0000-000000000002'::uuid,
    'e3000000-0000-0000-0000-000000000003'::uuid
);

DELETE FROM exams WHERE id IN (
    'e1000000-0000-0000-0000-000000000001'::uuid,
    'e2000000-0000-0000-0000-000000000002'::uuid,
    'e3000000-0000-0000-0000-000000000003'::uuid
);

DELETE FROM profiles WHERE email IN (
    'proctor@examsphere.io',
    'student@examsphere.io',
    'examiner@examsphere.io'
);
