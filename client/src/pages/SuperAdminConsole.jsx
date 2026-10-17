import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, 
  UserCheck, 
  UserPlus, 
  Users, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ArrowRight,
  Database,
  Search,
  Sparkles
} from 'lucide-react';

export const SuperAdminConsole = () => {
  const { currentUser, claimSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Terminal Login state for non-superadmin
  const [loginEmail, setLoginEmail] = useState(currentUser?.email || 'superadmin@examsphere.io');
  const [loginPassword, setLoginPassword] = useState('SuperAdminSecure2026!');
  const [loginKey, setLoginKey] = useState('SUPER_ADMIN_2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // New Examiner Form State
  const [newExaminer, setNewExaminer] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [creatingExaminer, setCreatingExaminer] = useState(false);
  const [formFeedback, setFormFeedback] = useState({ type: '', message: '' });

  // Master Key Promotion State
  const [claimKey, setClaimKey] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimFeedback, setClaimFeedback] = useState({ type: '', message: '' });

  // Action status message
  const [actionStatus, setActionStatus] = useState(null);

  const handleConsoleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await claimSuperAdmin({
        email: loginEmail,
        password: loginPassword,
        full_name: 'Super Administrator',
        super_admin_key: loginKey,
      });
      if (res.success) {
        await loadUsers();
      } else {
        setLoginError(res.message || 'Super Admin authorization failed');
      }
    } catch (err) {
      setLoginError(err.message || 'Authorization error');
    } finally {
      setLoginLoading(false);
    }
  };

  // Load all users from Supabase profiles
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle Create New Examiner
  const handleCreateExaminer = async (e) => {
    e.preventDefault();
    setFormFeedback({ type: '', message: '' });

    if (!newExaminer.full_name || !newExaminer.email || !newExaminer.password) {
      setFormFeedback({ type: 'error', message: 'Please fill in all fields (Name, Email, Password).' });
      return;
    }

    try {
      setCreatingExaminer(true);
      const res = await api.createExaminer(newExaminer);

      if (res.success) {
        setFormFeedback({
          type: 'success',
          message: `Success! Examiner "${newExaminer.full_name}" created & synchronized in Supabase profiles schema!`,
        });
        setNewExaminer({ full_name: '', email: '', password: '' });
        // Automatically refresh schema table
        await loadUsers();
      } else {
        setFormFeedback({ type: 'error', message: res.message || 'Failed to create examiner.' });
      }
    } catch (err) {
      setFormFeedback({ type: 'error', message: err.message || 'Network error occurred.' });
    } finally {
      setCreatingExaminer(false);
    }
  };

  // Handle Role Change
  const handleUpdateRole = async (userId, targetRole, userName) => {
    try {
      setActionStatus({ type: 'info', message: `Updating role for ${userName} to ${targetRole}...` });
      const res = await api.updateUserRole(userId, targetRole);
      if (res.success) {
        setActionStatus({ type: 'success', message: `Updated ${userName} to ${targetRole.toUpperCase()} in Supabase!` });
        await loadUsers();
      } else {
        setActionStatus({ type: 'error', message: res.message || 'Role update failed.' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Error updating user role.' });
    }
    setTimeout(() => setActionStatus(null), 4000);
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" from Supabase?`)) {
      return;
    }

    try {
      setActionStatus({ type: 'info', message: `Removing ${userName} from Supabase...` });
      const res = await api.deleteUser(userId);
      if (res.success) {
        setActionStatus({ type: 'success', message: `User ${userName} deleted from Supabase schema.` });
        await loadUsers();
      } else {
        setActionStatus({ type: 'error', message: res.message || 'Failed to delete user.' });
      }
    } catch (err) {
      setActionStatus({ type: 'error', message: err.message || 'Error deleting user.' });
    }
    setTimeout(() => setActionStatus(null), 4000);
  };

  // Handle Claiming Super Admin with Key
  const handleClaimSuperAdmin = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setClaimFeedback({ type: 'error', message: 'You must be logged in to claim Super Admin role.' });
      return;
    }

    try {
      setClaiming(true);
      setClaimFeedback({ type: '', message: '' });
      const res = await api.claimSuperAdmin({
        email: currentUser.email,
        password: 'default_password',
        full_name: currentUser.full_name,
        super_admin_key: claimKey,
      });

      if (res.success) {
        setClaimFeedback({
          type: 'success',
          message: 'Super Admin privileges granted! Please refresh to reload role permissions.',
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setClaimFeedback({ type: 'error', message: res.message || 'Invalid Master Key.' });
      }
    } catch (err) {
      setClaimFeedback({ type: 'error', message: err.message || 'Authorization error' });
    } finally {
      setClaiming(false);
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const examinerCount = users.filter(u => u.role === 'examiner').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const superAdminCount = users.filter(u => u.role === 'super_admin' || u.role === 'admin').length;

  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div className="glass-panel" style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          background: 'radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, var(--bg-card) 70%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}>
              <ShieldAlert size={26} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Super Admin Terminal
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Direct Supabase PostgreSQL Schema Authority
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Enter your Super Admin credentials and security master key to unlock automated examiner provisioning and schema role management.
          </p>

          {loginError && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} flexShrink={0} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleConsoleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Admin Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Account Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <div style={{
              background: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem'
            }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#c084fc', marginBottom: '0.35rem' }}>
                Super Admin Security Master Key *
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} color="#c084fc" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="SUPER_ADMIN_2026"
                  value={loginKey}
                  onChange={(e) => setLoginKey(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
                  required
                />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                Default key defined in server configuration: <code>SUPER_ADMIN_2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)'
              }}
            >
              {loginLoading ? 'Authenticating with Supabase...' : 'Unlock Super Admin Console'}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{
        padding: '2rem',
        borderRadius: 'var(--radius-xl)',
        marginBottom: '2rem',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        background: 'radial-gradient(ellipse at top right, rgba(139, 92, 246, 0.15), transparent 70%), var(--bg-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
              }}>
                <ShieldAlert size={24} color="#ffffff" />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Super Admin Console
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
                  Automated Examiner Provisioning & Supabase Schema Synchronization
                </p>
              </div>
            </div>
            <p style={{ maxWidth: '650px', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.5rem' }}>
              Add and manage examiners directly into the live Supabase <code>profiles</code> schema without any manual SQL operations.
              All new examiners get instant permissions to author exams, schedule tests, and access live proctoring.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div className="badge" style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              padding: '0.45rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Database size={14} />
              <span>Supabase Auto-Sync Active</span>
            </div>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              {loading ? 'Syncing...' : 'Sync Schema Data'}
            </button>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionStatus && (
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: actionStatus.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${actionStatus.type === 'error' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
            color: actionStatus.type === 'error' ? '#fb7185' : '#34d399',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {actionStatus.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{actionStatus.message}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div className="card" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Schema Users
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
              {users.length}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>
              Authorized Examiners
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '0.25rem' }}>
              {examinerCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#22d3ee', textTransform: 'uppercase', fontWeight: 700 }}>
              Active Candidates
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#22d3ee', marginTop: '0.25rem' }}>
              {studentCount}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', background: 'rgba(236, 72, 153, 0.08)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: 700 }}>
              Super Admins
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f472b6', marginTop: '0.25rem' }}>
              {superAdminCount}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Add Examiner Form (Left) & User Management Table (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Add New Examiner Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{
            padding: '1.75rem',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            background: 'var(--bg-card)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus size={18} color="#ffffff" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  Add New Examiner
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
                  Automatic Supabase schema insert
                </p>
              </div>
            </div>

            {formFeedback.message && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: formFeedback.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${formFeedback.type === 'error' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                color: formFeedback.type === 'error' ? '#fb7185' : '#34d399',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {formFeedback.type === 'error' ? <AlertCircle size={16} flexShrink={0} /> : <CheckCircle2 size={16} flexShrink={0} />}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateExaminer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alan Turing"
                  className="input"
                  value={newExaminer.full_name}
                  onChange={(e) => setNewExaminer({ ...newExaminer, full_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="examiner@university.edu"
                  className="input"
                  value={newExaminer.email}
                  onChange={(e) => setNewExaminer({ ...newExaminer, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Account Password *
                </label>
                <input
                  type="password"
                  placeholder="Create secure password"
                  className="input"
                  value={newExaminer.password}
                  onChange={(e) => setNewExaminer({ ...newExaminer, password: e.target.value })}
                  required
                />
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-subtle)',
                fontSize: '0.75rem',
                color: 'var(--text-dim)'
              }}>
                ⚡ <strong>Schema Guarantee:</strong> Automatically updates remote Supabase <code>profiles</code> with role <code>examiner</code> and SHA256 hashed password. The new examiner can immediately log in.
              </div>

              <button
                type="submit"
                disabled={creatingExaminer}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  padding: '0.75rem'
                }}
              >
                {creatingExaminer ? (
                  <>
                    <RefreshCw size={16} className="spin" />
                    Synchronizing with Supabase...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Provision Examiner in Schema
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Super Admin Key Card */}
          <div className="card" style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <KeyRound size={16} color="#c084fc" />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Super Admin Master Key
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
              Active key configured in <code>server/.env</code>: <code>SUPER_ADMIN_2026</code>.
            </p>
            {claimFeedback.message && (
              <div style={{
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                background: claimFeedback.type === 'error' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: claimFeedback.type === 'error' ? '#fb7185' : '#34d399',
                fontSize: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                {claimFeedback.message}
              </div>
            )}
            <form onSubmit={handleClaimSuperAdmin} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="password"
                placeholder="SUPER_ADMIN_2026"
                className="input input-sm"
                value={claimKey}
                onChange={(e) => setClaimKey(e.target.value)}
                style={{ flex: 1, fontSize: '0.78rem' }}
              />
              <button
                type="submit"
                disabled={claiming || !claimKey}
                className="btn btn-secondary btn-sm"
              >
                {claiming ? 'Verifying...' : 'Claim Role'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Supabase Schema User Directory */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Users size={20} color="var(--primary)" />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Live Schema Directory ({filteredUsers.length})
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search user or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-sm"
                  style={{ paddingLeft: '2rem', width: '180px', fontSize: '0.8rem' }}
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input input-sm"
                style={{ width: '120px', fontSize: '0.8rem' }}
              >
                <option value="all">All Roles</option>
                <option value="examiner">Examiners</option>
                <option value="student">Candidates</option>
                <option value="super_admin">Super Admins</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
              <RefreshCw size={24} className="spin" style={{ margin: '0 auto 0.75rem auto' }} />
              <p>Fetching real-time profiles from Supabase...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)' }}>
              <Users size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <p>No profiles match your criteria.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>User Profile</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Current Role</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Registered</th>
                    <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Role Authority Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isSelf = currentUser && currentUser.email === user.email;
                    const isExaminer = user.role === 'examiner';
                    const isSuper = user.role === 'super_admin';

                    return (
                      <tr 
                        key={user.id} 
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                          transition: 'background 0.2s',
                        }}
                      >
                        {/* Profile Info */}
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <img
                              src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`}
                              alt={user.full_name}
                              style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                                {user.full_name} {isSelf && <span style={{ fontSize: '0.7rem', color: '#818cf8' }}>(You)</span>}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <span
                            className={`badge ${
                              user.role === 'super_admin' ? 'badge-primary' :
                              user.role === 'examiner' ? 'badge-purple' : 'badge-cyan'
                            }`}
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.2rem 0.55rem',
                              background: user.role === 'examiner' ? 'rgba(139, 92, 246, 0.2)' : undefined,
                              border: user.role === 'examiner' ? '1px solid rgba(139, 92, 246, 0.4)' : undefined,
                              color: user.role === 'examiner' ? '#c084fc' : undefined,
                            }}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </td>

                        {/* Registered Date */}
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            {!isExaminer && (
                              <button
                                onClick={() => handleUpdateRole(user.id, 'examiner', user.full_name)}
                                title="Promote to Examiner (Allows creating exams & viewing proctoring)"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  borderColor: 'rgba(139, 92, 246, 0.4)',
                                  color: '#c084fc'
                                }}
                              >
                                <UserCheck size={13} />
                                Make Examiner
                              </button>
                            )}

                            {isExaminer && (
                              <button
                                onClick={() => handleUpdateRole(user.id, 'student', user.full_name)}
                                title="Demote to Student/Candidate"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)'
                                }}
                              >
                                Demote to Student
                              </button>
                            )}

                            {!isSuper && (
                              <button
                                onClick={() => handleUpdateRole(user.id, 'super_admin', user.full_name)}
                                title="Grant Super Admin privileges"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '0.3rem 0.6rem',
                                  fontSize: '0.75rem',
                                  color: '#f472b6'
                                }}
                              >
                                Promote to Super Admin
                              </button>
                            )}

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(user.id, user.full_name)}
                                title="Delete user profile from Supabase"
                                className="btn btn-secondary btn-sm"
                                style={{
                                  padding: '0.3rem 0.5rem',
                                  color: '#fb7185',
                                  borderColor: 'rgba(244, 63, 94, 0.3)'
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
