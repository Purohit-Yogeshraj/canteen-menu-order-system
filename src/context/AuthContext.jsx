// ==============================================================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL (STAFF & ADMIN)
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'canteen_auth_session_role_v1';

// Default demo passwords (can be configured via environment variables)
export const AUTH_CREDENTIALS = {
  STAFF_PASSWORD: import.meta.env.VITE_STAFF_PASSWORD || 'staff123',
  ADMIN_PASSWORD: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
};

export function AuthProvider({ children }) {
  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === 'admin' || saved === 'staff') {
        return saved;
      }
    } catch (e) {}
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [targetRolePrompt, setTargetRolePrompt] = useState('staff'); // 'staff' | 'admin'

  const login = (password, requestedRole = null) => {
    const trimmed = (password || '').trim();

    if (!trimmed) {
      return { success: false, error: 'Password cannot be empty.' };
    }

    // Check Admin Password first
    if (trimmed === AUTH_CREDENTIALS.ADMIN_PASSWORD) {
      setUserRole('admin');
      try {
        sessionStorage.setItem(STORAGE_KEY, 'admin');
      } catch (e) {}
      return { success: true, role: 'admin' };
    }

    // Check Staff Password
    if (trimmed === AUTH_CREDENTIALS.STAFF_PASSWORD) {
      if (requestedRole === 'admin') {
        return {
          success: false,
          error: 'Staff password cannot access Admin Menu Manager. Please enter the Admin password.',
        };
      }
      setUserRole('staff');
      try {
        sessionStorage.setItem(STORAGE_KEY, 'staff');
      } catch (e) {}
      return { success: true, role: 'staff' };
    }

    return {
      success: false,
      error: 'Invalid password. Check credentials and try again.',
    };
  };

  const logout = () => {
    setUserRole(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  const openLoginModal = (targetRole = 'staff') => {
    setTargetRolePrompt(targetRole);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const hasStaffAccess = userRole === 'staff' || userRole === 'admin';
  const hasAdminAccess = userRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        userRole,
        isLoggedIn: !!userRole,
        hasStaffAccess,
        hasAdminAccess,
        login,
        logout,
        isLoginModalOpen,
        targetRolePrompt,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
