import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CertificateModal } from '../components/CertificateModal';
import confetti from 'canvas-confetti';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  ArrowLeft, 
  RotateCcw, 
  Check, 
  X, 
  HelpCircle,
  FileCheck2,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const ExamResult = ({ attemptId, onRetake, onBackToCatalog }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const res = await api.getAttemptResult(attemptId);
        if (res.success && res.data) {
          setResult(res.data);
          // If passed, fire confetti celebration
          if (res.data.passed) {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch exam result:', err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-dim)' }}>
        <h2>Analyzing assessment responses & computing grade...</h2>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Result record not found.</h2>
        <button onClick={onBackToCatalog} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Return to Catalog
        </button>
      </div>
    );
  }

  const {
    student_name,
    score,
    total_marks,
    percentage,
    passed,
    time_spent_seconds,
    violations_count,
    violations_log = [],
    feedback,
    exam,
    breakdown = [],
  } = result;

  const examTitle = exam ? exam.title : 'Technical Assessment';
  const passingPercentage = exam ? exam.passing_percentage : 50;

  const correctAnswersCount = breakdown.filter(b => b.is_correct).length;
  const incorrectAnswersCount = breakdown.filter(b => b.student_answer && !b.is_correct).length;
  const unattemptedCount = breakdown.filter(b => !b.student_answer).length;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Back button */}
      <div>
        <button onClick={onBackToCatalog} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Catalog
        </button>
      </div>

      {/* Main Scorecard Hero Panel */}
      <div 
        className="glass-panel" 
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: passed
            ? 'linear-gradient(135deg, rgba(6, 78, 59, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(136, 19, 55, 0.4) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: `1.5px solid ${passed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
        }}
      >
        {/* Pass / Fail Icon Badge */}
        <div style={{
          width: '74px',
          height: '74px',
          borderRadius: '50%',
          background: passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
          border: `2px solid ${passed ? '#10b981' : '#f43f5e'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          color: passed ? '#34d399' : '#fb7185'
        }}>
          {passed ? <Award size={40} /> : <XCircle size={40} />}
        </div>

        <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem', marginBottom: '0.75rem' }}>
          {passed ? 'ASSESSMENT PASSED' : 'NEEDS IMPROVEMENT'}
        </span>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          {score} <span style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}>/ {total_marks} Marks</span>
        </h1>

        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: passed ? '#34d399' : '#fb7185', marginBottom: '1rem' }}>
          Final Score: {percentage}% (Pass threshold: {passingPercentage}%)
        </div>

        <p style={{ maxWidth: '600px', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {feedback}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {passed && (
            <button
              onClick={() => setShowCertificate(true)}
              className="btn btn-primary btn-lg"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
            >
              <Award size={20} /> View & Download Certificate
            </button>
          )}

          <button
            onClick={() => onRetake(result.exam_id)}
            className="btn btn-secondary btn-lg"
          >
            <RotateCcw size={18} /> Retake Assessment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <div className="glass-card">
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>CORRECT ANSWERS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            {correctAnswersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Out of {breakdown.length} questions</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>INCORRECT ANSWERS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fb7185', marginTop: '0.2rem' }}>
            {incorrectAnswersCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Negative marks deducted</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>TIME SPENT</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
            {Math.round(time_spent_seconds / 60)}m {time_spent_seconds % 60}s
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total active test duration</div>
        </div>

        <div className="glass-card">
          <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600 }}>PROCTOR INTEGRITY FLAGS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: violations_count > 0 ? '#fbbf24' : '#34d399', marginTop: '0.2rem' }}>
            {violations_count} Flags
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {violations_count === 0 ? 'Flawless integrity log' : `${violations_count} tab switches recorded`}
          </div>
        </div>
      </div>

      {/* Detailed Question Review & Solutions */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            Detailed Solutions & Answer Explanations
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Compare your chosen responses against the verified answers with comprehensive technical rationales.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {breakdown.map((item, index) => {
            const isAnswered = item.student_answer !== null && item.student_answer !== undefined;
            const isCorrect = item.is_correct;

            return (
              <div 
                key={item.question_id || index}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderLeft: `4px solid ${!isAnswered ? '#f59e0b' : isCorrect ? '#10b981' : '#f43f5e'}`,
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">
                    Question {index + 1}
                  </span>
                  <div>
                    {!isAnswered ? (
                      <span className="badge badge-warning">Unattempted (0 marks)</span>
                    ) : isCorrect ? (
                      <span className="badge badge-success">Correct (+{item.marks} marks)</span>
                    ) : (
                      <span className="badge badge-danger">Incorrect</span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {item.question_text}
                </h3>

                {/* Answer Comparison */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {/* Your Answer */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Your Answer:
                    </div>
                    <div style={{ fontWeight: 600, color: isCorrect ? '#34d399' : '#fb7185' }}>
                      {Array.isArray(item.student_answer) 
                        ? item.student_answer.join(', ') 
                        : (item.student_answer || 'Not Attempted')}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                      Verified Correct Answer:
                    </div>
                    <div style={{ fontWeight: 700, color: '#34d399' }}>
                      {Array.isArray(item.correct_answers) 
                        ? item.correct_answers.join(', ') 
                        : item.correct_answers}
                    </div>
                  </div>
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div style={{
                    padding: '0.85rem 1.1rem',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    lineHeight: 1.55,
                    color: '#cbd5e1'
                  }}>
                    <strong style={{ color: '#818cf8', display: 'block', marginBottom: '0.25rem' }}>
                      Examiner Explanation:
                    </strong>
                    {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        attemptData={{
          id: result.id,
          student_name,
          score,
          total_marks,
          percentage,
          submitted_at: result.submitted_at,
          exam_title: examTitle,
        }}
      />
    </div>
  );
};
