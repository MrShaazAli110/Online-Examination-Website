import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

export const Dashboard = ({ setActiveTab, onSelectExam, onViewResult }) => {
  const { currentUser, isExaminer } = useAuth();
  const [stats, setStats] = useState(null);
  const [featuredExams, setFeaturedExams] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const studentHistoryPromise = currentUser?.email
          ? api.getStudentHistory(currentUser.email)
          : Promise.resolve({ success: true, data: [] });

        const [dashRes, examsRes, attemptsRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getExams(),
          studentHistoryPromise,
        ]);

        if (dashRes.success) setStats(dashRes.data);
        if (examsRes.success) setFeaturedExams(examsRes.data.slice(0, 3));
        if (attemptsRes.success) setRecentAttempts(attemptsRes.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser?.email]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div 
        className="glass-panel" 
        style={{
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-5%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }} className="badge badge-primary">
            <Sparkles size={13} />
            <span>Next-Generation Proctored Testing</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            Welcome back, <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {currentUser?.full_name || 'Candidate'}
            </span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            {isExaminer 
              ? 'Manage assessments, create multi-format question banks, and audit real-time proctoring telemetry backed by Supabase PostgreSQL.'
              : 'Prepare for your industry technical certifications with real-time AI anti-cheating enforcement and instant automated feedback.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              onClick={() => setActiveTab('catalog')}
              className="btn btn-primary btn-lg"
            >
              <BookOpen size={18} />
              Take An Assessment
              <ArrowRight size={16} />
            </button>

            {isExaminer ? (
              <button
                onClick={() => setActiveTab('creator')}
                className="btn btn-secondary btn-lg"
              >
                Create New Exam
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('history')}
                className="btn btn-secondary btn-lg"
              >
                <Award size={18} />
                View My Credentials
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Published Exams
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                {stats?.publishedExams ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <BookOpen size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
            Live from Supabase database
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Submissions
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                {stats?.totalAttempts ?? 0}
              </div>
            </div>
            <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#34d399' }}>
            100% automated instantaneous grading
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Average Pass Rate
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                {stats?.overallPassRate ?? 0}%
              </div>
            </div>
            <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#fbbf24' }}>
            Based on completed verified sessions
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
                AI Proctor Guard
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#34d399' }}>
                Active
              </div>
            </div>
            <div style={{ padding: '0.65rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Fullscreen & Tab monitoring enforced
          </div>
        </div>
      </div>

      {/* Featured Exams Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>Featured Certification Assessments</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Curated industry-grade benchmark tests with automated certification</p>
          </div>
          <button onClick={() => setActiveTab('catalog')} className="btn btn-secondary btn-sm">
            View All ({featuredExams.length}) <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid-3">
          {featuredExams.map((exam) => (
            <div key={exam.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">{exam.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    <Clock size={14} />
                    {exam.duration_minutes} mins
                  </div>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#ffffff' }}>
                  {exam.title}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {exam.description ? exam.description.slice(0, 110) + '...' : 'Proctored assessment.'}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-dim)',
                  marginBottom: '1rem'
                }}>
                  <span>Questions: <strong>{exam.question_count || 5}</strong></span>
                  <span>Pass mark: <strong>{exam.passing_percentage}%</strong></span>
                  <span>Negative: <strong>{exam.negative_marking ? 'Yes (-0.5)' : 'No'}</strong></span>
                </div>

                <button
                  onClick={() => onSelectExam(exam)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  Start Assessment
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions / Completed Exams */}
      {recentAttempts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Recent Completed Assessments</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review answers, explanations, and download your certificates</p>
            </div>
            <button onClick={() => setActiveTab('history')} className="btn btn-secondary btn-sm">
              All Attempts
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAttempts.map((att) => (
              <div 
                key={att.id} 
                className="glass-card" 
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: att.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: att.passed ? '#34d399' : '#fb7185'
                  }}>
                    {att.passed ? <Award size={22} /> : <AlertCircle size={22} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>
                      {att.exam_title || 'Assessment'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Completed on {new Date(att.submitted_at || att.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: att.passed ? '#34d399' : '#fb7185' }}>
                      {att.score} / {att.total_marks} ({att.percentage}%)
                    </div>
                    <span className={`badge ${att.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {att.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <button
                    onClick={() => onViewResult(att.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    View Scorecard & Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
