import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  Award, 
  ShieldAlert, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Eye,
  RefreshCw
} from 'lucide-react';

export const Analytics = ({ onViewResult }) => {
  const { currentUser, isExaminer, setAuthModalOpen } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeViolationsLogModal, setActiveViolationsLogModal] = useState(null);

  if (!currentUser || !isExaminer) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem 2rem' }}>
          <BarChart3 size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            Examiner Analytics Access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Live proctor telemetry and question analytics are restricted to authorized examiners and administrators.
          </p>
          <button onClick={() => setAuthModalOpen(true)} className="btn btn-primary btn-lg">
            Sign In as Examiner
          </button>
        </div>
      </div>
    );
  }

  // Load Exams
  useEffect(() => {
    const loadExams = async () => {
      try {
        const res = await api.getExams();
        if (res.success && res.data.length > 0) {
          setExams(res.data);
          setSelectedExamId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load exams for analytics:', err);
      }
    };
    loadExams();
  }, []);

  // Load Analytics for selected exam
  const fetchAnalytics = async (examId) => {
    if (!examId) return;
    setLoading(true);
    try {
      const res = await api.getExamAnalytics(examId);
      if (res.success) {
        setAnalyticsData(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExamId) {
      fetchAnalytics(selectedExamId);
    }
  }, [selectedExamId]);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            Live Proctor & Assessment Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Real-time exam cohort analytics, anti-cheating audit trail, and question performance.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="select"
            style={{ minWidth: '280px', fontWeight: 600 }}
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchAnalytics(selectedExamId)}
            className="btn btn-secondary btn-sm"
            title="Refresh Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-dim)' }}>
          Computing cohort statistics and integrity logs...
        </div>
      ) : !analyticsData ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No submission data available yet for this assessment.</h3>
        </div>
      ) : (
        <>
          {/* Cohort Summary Metrics */}
          <div className="grid-4">
            <div className="glass-card">
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>CANDIDATE SUBMISSIONS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                {analyticsData.summary.total_attempts}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                {analyticsData.summary.completed_count} completed sessions
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>OVERALL PASS RATE</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                {analyticsData.summary.pass_rate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {analyticsData.summary.passed_count} of {analyticsData.summary.completed_count} passed
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>AVERAGE SCORE</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                {analyticsData.summary.average_score} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {analyticsData.exam.total_marks}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                High: {analyticsData.summary.highest_score} | Low: {analyticsData.summary.lowest_score}
              </div>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>DISQUALIFICATIONS</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: analyticsData.summary.disqualified_count > 0 ? '#fb7185' : '#34d399', marginTop: '0.2rem' }}>
                {analyticsData.summary.disqualified_count}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Exceeded tab-switch threshold
              </div>
            </div>
          </div>

          {/* Question Accuracy Heatmap */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Question Difficulty & Accuracy Heatmap
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Identifies curriculum learning gaps based on candidate success rate for each assessment question.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analyticsData.question_stats.map((qs, i) => (
                <div key={qs.id || i} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge badge-primary">Q{i + 1}</span>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem', color: '#ffffff' }}>
                        {qs.question_text.length > 90 ? qs.question_text.slice(0, 90) + '...' : qs.question_text}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${qs.difficulty === 'easy' ? 'badge-success' : qs.difficulty === 'hard' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                        {qs.difficulty}
                      </span>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        color: qs.accuracy_rate >= 70 ? '#34d399' : qs.accuracy_rate >= 40 ? '#fbbf24' : '#fb7185'
                      }}>
                        {qs.accuracy_rate}% Accuracy
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${qs.accuracy_rate}%`,
                      height: '100%',
                      background: qs.accuracy_rate >= 70 ? '#10b981' : qs.accuracy_rate >= 40 ? '#f59e0b' : '#f43f5e',
                      borderRadius: '4px',
                      transition: 'width 0.6s ease'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate Submissions Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Candidate Proctoring Log & Submissions
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Complete audit trail of all attempts with anti-cheating violation records.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem' }}>Candidate</th>
                    <th style={{ padding: '0.85rem' }}>Score</th>
                    <th style={{ padding: '0.85rem' }}>Percentage</th>
                    <th style={{ padding: '0.85rem' }}>Time Taken</th>
                    <th style={{ padding: '0.85rem' }}>Proctor Flags</th>
                    <th style={{ padding: '0.85rem' }}>Status</th>
                    <th style={{ padding: '0.85rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.submissions.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{sub.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.student_email}</div>
                      </td>

                      <td style={{ padding: '0.85rem', fontWeight: 700 }}>
                        {sub.score} / {sub.total_marks || analyticsData.exam.total_marks}
                      </td>

                      <td style={{ padding: '0.85rem', fontWeight: 800, color: sub.passed ? '#34d399' : '#fb7185' }}>
                        {sub.percentage}%
                      </td>

                      <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                        {Math.round((sub.time_spent_seconds || 0) / 60)} mins
                      </td>

                      <td style={{ padding: '0.85rem' }}>
                        {sub.violations_count > 0 ? (
                          <button
                            onClick={() => setActiveViolationsLogModal(sub)}
                            className="badge badge-warning"
                            style={{ cursor: 'pointer', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                          >
                            <ShieldAlert size={12} /> {sub.violations_count} Flags (View Log)
                          </button>
                        ) : (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            Clean
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem' }}>
                        <span className={`badge ${sub.status === 'disqualified' ? 'badge-danger' : sub.passed ? 'badge-success' : 'badge-warning'}`}>
                          {sub.status === 'disqualified' ? 'DISQUALIFIED' : sub.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                        <button
                          onClick={() => onViewResult(sub.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Violation Audit Modal */}
      {activeViolationsLogModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '2rem', maxWidth: '540px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Anti-Cheating Proctoring Audit Log
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Candidate: <strong>{activeViolationsLogModal.student_name}</strong> ({activeViolationsLogModal.student_email})
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              maxHeight: '280px',
              overflowY: 'auto',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {(activeViolationsLogModal.violations_log || []).length === 0 ? (
                <div style={{ color: 'var(--text-dim)', textAlign: 'center' }}>No detailed log entries found.</div>
              ) : (
                activeViolationsLogModal.violations_log.map((v, idx) => (
                  <div key={idx} style={{
                    padding: '0.75rem',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb7185', fontWeight: 700, marginBottom: '0.2rem' }}>
                      <span>Strike #{v.violation_number || idx + 1}: {v.type}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: '#f8fafc' }}>{v.message}</div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveViolationsLogModal(null)} className="btn btn-secondary">
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
