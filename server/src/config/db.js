import { supabase, isSupabaseConfigured } from './supabase.js';

if (!isSupabaseConfigured) {
  throw new Error('FATAL: Supabase is not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in server/.env');
}

export const dbService = {
  isLiveSupabase: () => true,

  // --- EXAMS ---
  async getExams(filters = {}) {
    let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.category && filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase getExams error:', error.message);
      throw error;
    }
    return data || [];
  },

  async getExamById(id) {
    const { data, error } = await supabase.from('exams').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // row not found
      throw error;
    }
    return data;
  },

  async createExam(examData) {
    const newExam = {
      title: examData.title,
      description: examData.description || '',
      category: examData.category || 'General',
      duration_minutes: Number(examData.duration_minutes) || 30,
      total_marks: Number(examData.total_marks) || 100,
      passing_percentage: Number(examData.passing_percentage) || 50,
      negative_marking: Boolean(examData.negative_marking),
      negative_marks_per_question: Number(examData.negative_marks_per_question) || 0,
      shuffle_questions: examData.shuffle_questions !== false,
      shuffle_options: examData.shuffle_options !== false,
      tab_switch_limit: Number(examData.tab_switch_limit) || 3,
      fullscreen_required: examData.fullscreen_required !== false,
      webcam_required: Boolean(examData.webcam_required),
      allow_calculator: Boolean(examData.allow_calculator),
      access_code: examData.access_code || null,
      status: examData.status || 'published',
      created_by: examData.created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('exams').insert([newExam]).select().single();
    if (error) {
      console.error('Supabase createExam error:', error.message);
      throw error;
    }
    return data;
  },

  async updateExam(id, updateData) {
    const { data, error } = await supabase
      .from('exams')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteExam(id) {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- QUESTIONS ---
  async getQuestionsByExamId(examId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', examId)
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async createQuestion(questionData) {
    const newQuestion = {
      exam_id: questionData.exam_id,
      question_text: questionData.question_text,
      question_type: questionData.question_type || 'single_choice',
      options: questionData.options || [],
      correct_answers: questionData.correct_answers || [],
      explanation: questionData.explanation || '',
      marks: Number(questionData.marks) || 1,
      negative_marks: Number(questionData.negative_marks) || 0,
      difficulty: questionData.difficulty || 'medium',
      code_snippet: questionData.code_snippet || null,
      order_index: Number(questionData.order_index) || 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('questions').insert([newQuestion]).select().single();
    if (error) {
      console.error('Supabase createQuestion error:', error.message);
      throw error;
    }
    return data;
  },

  async deleteQuestion(id) {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // --- ATTEMPTS & EVALUATION ---
  async createAttempt(attemptData) {
    const newAttempt = {
      exam_id: attemptData.exam_id,
      student_id: attemptData.student_id || null,
      student_name: attemptData.student_name || 'Anonymous Student',
      student_email: attemptData.student_email || 'student@domain.com',
      started_at: new Date().toISOString(),
      submitted_at: null,
      time_spent_seconds: 0,
      score: 0,
      total_marks: Number(attemptData.total_marks) || 0,
      percentage: 0,
      passed: false,
      answers: {},
      violations_count: 0,
      violations_log: [],
      status: 'in_progress',
      feedback: '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('exam_attempts').insert([newAttempt]).select().single();
    if (error) {
      console.error('Supabase createAttempt error:', error.message);
      throw error;
    }
    return data;
  },

  async getAttemptById(id) {
    const { data, error } = await supabase.from('exam_attempts').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async updateAttempt(id, updateData) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAttemptsByStudent(studentEmail) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*, exams(title, category, duration_minutes)')
      .eq('student_email', studentEmail)
      .order('started_at', { ascending: false });
    if (error) throw error;

    return (data || []).map(att => ({
      ...att,
      exam_title: att.exams ? att.exams.title : 'Assessment',
      exam_category: att.exams ? att.exams.category : 'General',
    }));
  },

  async getAttemptsByExam(examId) {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', examId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllAttempts() {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .order('started_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // --- STATS & OVERVIEW ---
  async getDashboardStats() {
    const { data: exams, error: examsErr } = await supabase.from('exams').select('id, status');
    if (examsErr) throw examsErr;

    const { data: attempts, error: attErr } = await supabase.from('exam_attempts').select('student_email, status, passed, violations_count');
    if (attErr) throw attErr;

    const examList = exams || [];
    const attemptList = attempts || [];

    const totalStudents = new Set(attemptList.map(a => a.student_email)).size;
    const completedAttempts = attemptList.filter(a => a.status === 'completed');
    const totalPassed = completedAttempts.filter(a => a.passed).length;
    const passRate = completedAttempts.length > 0 ? Math.round((totalPassed / completedAttempts.length) * 100) : 0;
    const totalViolations = attemptList.reduce((acc, curr) => acc + (curr.violations_count || 0), 0);

    return {
      totalExams: examList.length,
      publishedExams: examList.filter(e => e.status === 'published').length,
      totalAttempts: attemptList.length,
      completedAttempts: completedAttempts.length,
      totalStudents: totalStudents || 0,
      overallPassRate: passRate,
      totalViolations,
      isSupabaseConnected: true,
    };
  },

  // --- USER PROFILES ---
  async upsertProfile(user) {
    const profile = {
      email: user.email.toLowerCase(),
      full_name: user.full_name,
      role: user.role || 'student',
      avatar_url: user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.warn('Profile upsert warning (RLS or column):', error.message);
      return profile;
    }
    return data;
  },

  async getProfileByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) return null;
    return data;
  },
};
