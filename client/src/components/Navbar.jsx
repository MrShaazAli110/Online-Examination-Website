import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  BookOpen, 
  Award, 
  BarChart3, 
  PlusCircle, 
  LayoutDashboard, 
  Database, 
  LogIn, 
  LogOut, 
  UserPlus,
  ShieldAlert
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { currentUser, isExaminer, isSuperAdmin, backendStatus, logout, setAuthModalOpen } = useAuth();

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: '1rem',
      margin: '0.75rem 1.5rem',
      padding: '0.85rem 1.5rem',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 'var(--radius-lg)'
    }}>
      {/* Brand */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
        onClick={() => setActiveTab('dashboard')}
      >
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px var(--primary-glow)'
        }}>
          <ShieldCheck size={24} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Exam<span style={{ color: '#818cf8' }}>Sphere</span>
            </span>
            <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}>
              PRO
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
            Proctored Assessment Hub
          </p>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <BookOpen size={16} />
          Browse Exams
        </button>

        {currentUser && (
          <button
            onClick={() => setActiveTab('history')}
            className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Award size={16} />
            My Certifications
          </button>
        )}

        {/* Examiner Links (Strictly locked to users with examiner/admin role) */}
        {isExaminer && (
          <>
            <button
              onClick={() => setActiveTab('creator')}
              className={`btn ${activeTab === 'creator' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ background: activeTab === 'creator' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : undefined }}
            >
              <PlusCircle size={16} />
              Create Exam
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              <BarChart3 size={16} />
              Live Proctor & Analytics
            </button>
          </>
        )}

        {/* Super Admin Console Link */}
        {(isSuperAdmin || currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{
              background: activeTab === 'admin' 
                ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                : 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#f8fafc'
            }}
          >
            <ShieldAlert size={16} color="#c084fc" />
            Super Admin
          </button>
        )}
      </nav>

      {/* Right Controls: Database Pill + Auth / User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Database indicator */}
        <div 
          className="badge"
          title="Directly connected to live Supabase PostgreSQL"
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: '0.72rem',
            padding: '0.3rem 0.65rem'
          }}
        >
          <Database size={13} />
          <span>Supabase Live</span>
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* User Info with Unchangeable Role Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.email)}`}
                alt={currentUser.full_name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${isExaminer ? '#8b5cf6' : '#6366f1'}`,
                  objectFit: 'cover'
                }}
              />
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                  {currentUser.full_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span 
                    className={`badge ${currentUser.role === 'super_admin' ? 'badge-primary' : isExaminer ? 'badge-primary' : 'badge-cyan'}`} 
                    style={{ 
                      fontSize: '0.62rem', 
                      padding: '0.1rem 0.4rem',
                      background: currentUser.role === 'super_admin' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : undefined,
                      border: currentUser.role === 'super_admin' ? '1px solid rgba(236, 72, 153, 0.5)' : undefined
                    }}
                  >
                    {currentUser.role.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-md)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
