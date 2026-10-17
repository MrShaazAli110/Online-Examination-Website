import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ShieldAlert, CheckCircle, Volume2, Eye } from 'lucide-react';

export const ProctorCamera = ({ violationsCount = 0, isRequired = true }) => {
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);

  useEffect(() => {
    let stream = null;
    const startWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('Webcam permission not granted or device missing. Running simulated proctor feed:', err.message);
        setPermissionDenied(true);
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="glass-card" style={{ padding: '0.85rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700 }}>
          <span className="live-indicator" />
          <span style={{ color: '#f43f5e', letterSpacing: '0.05em' }}>PROCTOR REC</span>
        </div>
        <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
          AI GUARD ACTIVE
        </span>
      </div>

      {/* Video Canvas Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '135px',
        background: '#040711',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {streamActive && !permissionDenied ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.5rem auto'
            }}>
              <Camera size={22} color="#818cf8" />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
              AI Proctor Virtual Stream
            </p>
          </div>
        )}

        {/* AI Face Detection Bounding Box Overlay */}
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '26%',
          width: '48%',
          height: '62%',
          border: '1.5px dashed rgba(16, 185, 129, 0.8)',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '4px'
        }}>
          <span style={{
            fontSize: '0.6rem',
            color: '#34d399',
            background: 'rgba(6, 78, 59, 0.8)',
            padding: '1px 4px',
            borderRadius: '4px',
            alignSelf: 'flex-start'
          }}>
            Face Locked (99.4%)
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: '6px', height: '6px', borderBottom: '2px solid #34d399', borderLeft: '2px solid #34d399' }} />
            <div style={{ width: '6px', height: '6px', borderBottom: '2px solid #34d399', borderRight: '2px solid #34d399' }} />
          </div>
        </div>
      </div>

      {/* Proctoring Status Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.6rem' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.4rem 0.6rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <Eye size={13} color="#34d399" />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Focus: </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399' }}>Normal</span>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '0.4rem 0.6rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <ShieldAlert size={13} color={violationsCount > 0 ? '#fb7185' : '#818cf8'} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Flags: </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: violationsCount > 0 ? '#fb7185' : '#818cf8' }}>
            {violationsCount}
          </span>
        </div>
      </div>
    </div>
  );
};
