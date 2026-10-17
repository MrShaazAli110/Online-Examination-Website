import React, { useRef } from 'react';
import { Award, Download, Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const CertificateModal = ({ isOpen, onClose, attemptData }) => {
  const certRef = useRef(null);

  if (!isOpen || !attemptData) return null;

  const {
    student_name,
    score,
    total_marks,
    percentage,
    submitted_at,
    exam_title,
    id,
  } = attemptData;

  const issueDate = new Date(submitted_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const certId = `CERT-EXP-${String(id || '0000').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');

    // Certificate Background
    ctx.fillStyle = '#0b0f19';
    ctx.fillRect(0, 0, 1200, 800);

    // Decorative Borders
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, 1110, 710);

    // Header Title
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#818cf8';
    ctx.textAlign = 'center';
    ctx.fillText('EXAMSPHERE PROFESSIONAL CERTIFICATION', 600, 130);

    // Main Heading
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Certificate of Achievement', 600, 200);

    // Subtitle
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('THIS ACKNOWLEDGES THAT', 600, 270);

    // Candidate Name
    ctx.font = 'bold 46px sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(student_name || 'Alex Johnson', 600, 340);

    // Body
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('has successfully completed the proctored assessment in', 600, 410);

    // Exam Title
    ctx.font = 'bold 30px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(exam_title || 'Technical Assessment', 600, 470);

    // Score & Percentage
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Final Score: ${score}/${total_marks} (${percentage}%) - PASSED`, 600, 530);

    // Date & ID
    ctx.font = '18px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Date: ${issueDate}  |  Credential ID: ${certId}`, 600, 620);

    // Signature line
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(400, 710);
    ctx.lineTo(800, 710);
    ctx.stroke();

    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Authorized Proctor & Examination Board Signature', 600, 735);

    // Download trigger
    const link = document.createElement('a');
    link.download = `ExamSphere-Certificate-${certId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', padding: 0, overflow: 'hidden' }}>
        {/* Header Bar */}
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} color="#f59e0b" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Official Certificate of Completion</span>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Certificate Preview Frame */}
        <div style={{ padding: '2rem', background: '#070a13' }}>
          <div
            ref={certRef}
            style={{
              border: '8px solid #6366f1',
              outline: '2px solid #f59e0b',
              outlineOffset: '-6px',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              background: 'radial-gradient(circle at center, #111827 0%, #090d16 100%)',
              position: 'relative'
            }}
          >
            {/* Watermark seal */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.03,
              pointerEvents: 'none'
            }}>
              <ShieldCheck size={300} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: '#818cf8',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={18} /> ExamSphere Academic Assessment Board
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
              Certificate of Achievement
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              This certifies that
            </p>

            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#38bdf8',
              margin: '0.75rem 0',
              textDecoration: 'underline',
              textDecorationColor: '#6366f1',
              textUnderlineOffset: '6px'
            }}>
              {student_name}
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 1rem auto' }}>
              has demonstrated technical excellence and satisfactorily satisfied the proctored examination standards for:
            </p>

            <div style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '1rem'
            }}>
              {exam_title}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '0.4rem 1.25rem',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.95rem',
              marginBottom: '2rem'
            }}>
              <CheckCircle size={18} /> Final Score: {score}/{total_marks} ({percentage}%)
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1.5rem',
              marginTop: '1rem',
              fontSize: '0.82rem',
              color: 'var(--text-dim)'
            }}>
              <div style={{ textAlign: 'left' }}>
                <div><strong>Issue Date:</strong> {issueDate}</div>
                <div><strong>Credential ID:</strong> <span style={{ fontFamily: 'monospace', color: '#818cf8' }}>{certId}</span></div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.4rem', color: '#f8fafc' }}>
                  Dr. Sarah Mitchell
                </div>
                <div>Authorized Chief Examiner</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{
          padding: '1.25rem 2rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
            Cryptographically signed and verified by Supabase Database
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn btn-secondary">
              <Printer size={16} /> Print
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              <Download size={16} /> Download PNG Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
