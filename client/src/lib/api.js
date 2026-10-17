// Central API layer for ExamSphere Pro

const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register({ full_name, email, password, requested_role, admin_secret_key }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, password, requested_role, admin_secret_key }),
    });
    return res.json();
  },

  async makeExaminer(email, admin_secret_key) {
    const res = await fetch(`${API_BASE}/auth/admin/make-examiner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, admin_secret_key }),
    });
    return res.json();
  },

  // Exams
  async getExams(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/exams?${params.toString()}`);
    return res.json();
  },

  async getExamById(id, role = 'student') {
    const res = await fetch(`${API_BASE}/exams/${id}?role=${role}`);
    return res.json();
  },

  async createExam(examData) {
    const res = await fetch(`${API_BASE}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    });
    return res.json();
  },

  async updateExam(id, updateData) {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return res.json();
  },

  async deleteExam(id) {
    const res = await fetch(`${API_BASE}/exams/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async addQuestion(examId, questionData) {
    const res = await fetch(`${API_BASE}/exams/${examId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    return res.json();
  },

  async deleteQuestion(id) {
    const res = await fetch(`${API_BASE}/exams/questions/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Attempts & Proctoring
  async startAttempt(examId, student) {
    const res = await fetch(`${API_BASE}/attempts/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exam_id: examId,
        student_id: student.id,
        student_name: student.full_name,
        student_email: student.email,
      }),
    });
    return res.json();
  },

  async logViolation(attemptId, violationType, message) {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violation_type: violationType,
        message,
      }),
    });
    return res.json();
  },

  async submitAttempt(attemptId, answers, timeSpentSeconds) {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        time_spent_seconds: timeSpentSeconds,
      }),
    });
    return res.json();
  },

  async getAttemptResult(id) {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    return res.json();
  },

  async getStudentHistory(email) {
    const res = await fetch(`${API_BASE}/attempts/student/${encodeURIComponent(email)}`);
    return res.json();
  },

  // Analytics
  async getDashboardAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    return res.json();
  },

  async getExamAnalytics(examId) {
    const res = await fetch(`${API_BASE}/analytics/exam/${examId}`);
    return res.json();
  },

  // Super Admin Management
  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  async createExaminer(examinerData) {
    const res = await fetch(`${API_BASE}/admin/create-examiner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examinerData),
    });
    return res.json();
  },

  async updateUserRole(userId, newRole) {
    const res = await fetch(`${API_BASE}/admin/update-role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, new_role: newRole }),
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async claimSuperAdmin(data) {
    const res = await fetch(`${API_BASE}/admin/claim-super-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

