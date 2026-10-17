import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('examsphere_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null; // Not logged in by default
  });

  const [backendStatus, setBackendStatus] = useState({
    online: false,
    supabaseConnected: true,
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('examsphere_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('examsphere_user');
      localStorage.removeItem('examsphere_token');
    }
  }, [currentUser]);

  // Check health periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await api.getHealth();
        setBackendStatus({
          online: data.status === 'online',
          supabaseConnected: data.supabaseConnected,
        });
      } catch (err) {
        setBackendStatus({ online: false, supabaseConnected: false });
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.data.user) {
      setCurrentUser(res.data.user);
      localStorage.setItem('examsphere_token', res.data.token);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.data.user) {
      setCurrentUser(res.data.user);
      localStorage.setItem('examsphere_token', res.data.token);
    }
    return res;
  };

  const claimSuperAdmin = async (data) => {
    const res = await api.claimSuperAdmin(data);
    if (res.success && res.data?.user) {
      setCurrentUser(res.data.user);
      localStorage.setItem('examsphere_token', res.data.token);
    }
    return res;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('examsphere_user');
    localStorage.removeItem('examsphere_token');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        register,
        claimSuperAdmin,
        logout,
        isAuthenticated: Boolean(currentUser && currentUser.id),
        isExaminer: Boolean(currentUser && (currentUser.role === 'examiner' || currentUser.role === 'admin' || currentUser.role === 'super_admin')),
        isSuperAdmin: Boolean(currentUser && currentUser.role === 'super_admin'),
        backendStatus,
        authModalOpen,
        setAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
