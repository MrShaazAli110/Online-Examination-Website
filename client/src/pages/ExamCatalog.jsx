import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { 
  Search, 
  Filter, 
  Clock, 
  HelpCircle, 
  ShieldCheck, 
  Camera, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

export const ExamCatalog = ({ onSelectExam, setActiveTab }) => {
  const { isExaminer, currentUser, setAuthModalOpen } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [entryModalExam, setEntryModalExam] = useState(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessError, setAccessError] = useState('');

  const categories = ['All', 'Software Engineering', 'Computer Science', 'Cloud & DevOps', 'Artificial Intelligence'];

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await api.getExams({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res.success) {
        setExams(res.data);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExams();
  };

  const handleDeleteExam = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this exam? All corresponding submissions and questions will be removed.')) {
      try {
        await api.deleteExam(id);
        setExams(exams.filter(ex => ex.id !== id));
      } catch (err) {
        alert('Failed to delete exam: ' + err.message);
      }
    }
  };

  const handleStartExamFlow = (exam) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setEntryModalExam(exam);
    setAccessCodeInput('');
    setAccessError('');
  };

  const handleConfirmStart = () => {
    if (entryModalExam.access_code && entryModalExam.access_code.trim()) {
      if (accessCodeInput.trim().toUpperCase() !== entryModalExam.access_code.trim().toUpperCase()) {
        setAccessError(`Invalid access code! Expected code: ${entryModalExam.access_code}`);
        return;
      }
    }
    const chosen = entryModalExam;
    setEntryModalExam(null);
    onSelectExam(chosen);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Assessments & Certification Catalog
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select an assessment to start your AI-proctored examination session.
          </p>
        </div>

        {isExaminer && (
          <button onClick={() => setActiveTab('creator')} className="btn btn-primary">
            <Plus size={18} />
            Create Assessment
          </button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', minWidth: '280px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search exams by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Exam Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
          Loading assessments from database...
        </div>
      ) : exams.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HelpCircle size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No assessments found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Try adjusting your search criteria or create a new assessment.
          </p>
          {isExaminer && (
            <button onClick={() => setActiveTab('creator')} className="btn btn-primary">
              <Plus size={16} /> Create New Exam
            </button>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                  <span className="badge badge-primary">{exam.category}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      <Clock size={14} />
                      {exam.duration_minutes} Minutes
                    </span>
                    {isExaminer && (
                      <button
                        onClick={(e) => handleDeleteExam(exam.id, e)}
                        title="Delete Exam"
                        className="btn btn-outline-danger btn-sm"
                        style={{ padding: '0.3rem 0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#ffffff' }}>
                  {exam.title}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {exam.description}
                </p>

                {/* Features & Safeguards Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                    Pass Rate: {exam.passing_percentage}%
                  </span>
                  {exam.negative_marking && (
                    <span className="badge badge-warning">
                      Neg. Marking (-{exam.negative_marks_per_question || 0.5})
                    </span>
                  )}
                  {exam.webcam_required && (
                    <span className="badge badge-cyan">
                      <Camera size={11} /> Webcam Proctored
                    </span>
                  )}
                  <span className="badge badge-primary">
                    <ShieldCheck size={11} /> Max {exam.tab_switch_limit || 3} Tab Switches
                  </span>
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    {exam.question_count || 5} Questions | {exam.total_marks} Marks
                  </div>

                  <button
                    onClick={() => handleStartExamFlow(exam)}
                    className="btn btn-primary"
                  >
                    Enter Exam Room
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Confirmation Modal */}
      {entryModalExam && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8'
              }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  Proctored Assessment Entry
                </h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', margin: 0 }}>
                  Please review guidelines before entering
                </p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                {entryModalExam.title}
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Duration: <strong>{entryModalExam.duration_minutes} Minutes</strong> (Automated submission on expiry).</li>
                <li>Fullscreen will be requested upon room entry.</li>
                <li>Tab switching is restricted. A maximum of <strong>{entryModalExam.tab_switch_limit || 3} strikes</strong> are permitted before disqualification.</li>
                <li>Right click, copy-paste, and developer shortcuts are intercepted.</li>
                <li>Results & solution explanations will be computed instantaneously.</li>
              </ul>
            </div>

            {/* Access Code Input if protected */}
            {entryModalExam.access_code && (
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Exam Access Code (Sample: {entryModalExam.access_code})
                </label>
                <input
                  type="text"
                  placeholder="Enter access code..."
                  value={accessCodeInput}
                  onChange={(e) => setAccessCodeInput(e.target.value)}
                  className="input"
                />
                {accessError && (
                  <p style={{ color: '#fb7185', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                    {accessError}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setEntryModalExam(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleConfirmStart} className="btn btn-primary">
                Acknowledge & Launch Exam
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
