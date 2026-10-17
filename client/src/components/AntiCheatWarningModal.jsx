import React from 'react';
import { AlertTriangle, ShieldX, Check } from 'lucide-react';

export const AntiCheatWarningModal = ({
  isOpen,
  violationType,
  violationsCount,
  limit = 3,
  isDisqualified = false,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center', padding: '2rem' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: isDisqualified ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
          border: `2px solid ${isDisqualified ? '#f43f5e' : '#f59e0b'}`
        }}>
          {isDisqualified ? (
            <ShieldX size={34} color="#f43f5e" />
          ) : (
            <AlertTriangle size={34} color="#f59e0b" />
          )}
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: isDisqualified ? '#fb7185' : '#f8fafc' }}>
          {isDisqualified ? 'Exam Disqualified!' : 'Proctoring Warning Detected'}
        </h3>

        <div className="badge badge-danger" style={{ marginBottom: '1rem', fontSize: '0.82rem', padding: '0.35rem 0.8rem' }}>
          Violation {violationsCount} of {limit} Strikes
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          {isDisqualified ? (
            'You have exceeded the maximum allowed proctoring violations (tab switches / window unfocus). Your exam session has been locked and flagged for review.'
          ) : (
            `You switched tabs or exited fullscreen mode. All background activity, focus changes, and keyboard shortcuts are strictly monitored and logged on the server.`
          )}
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          textAlign: 'left',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)'
        }}>
          <div><strong>Trigger:</strong> {violationType || 'Window blur / Tab switch'}</div>
          <div><strong>Remaining Chances:</strong> {Math.max(0, limit - violationsCount)}</div>
          <div><strong>Action:</strong> Event permanently saved in Supabase audit log</div>
        </div>

        <button
          onClick={onAcknowledge}
          className={`btn ${isDisqualified ? 'btn-danger' : 'btn-primary'} btn-lg`}
          style={{ width: '100%' }}
        >
          {isDisqualified ? 'View Assessment Summary' : 'I Understand & Return to Exam'}
        </button>
      </div>
    </div>
  );
};
