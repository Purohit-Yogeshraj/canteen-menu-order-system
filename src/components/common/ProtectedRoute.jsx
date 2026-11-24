// ==============================================================================
// PROTECTED ROUTE COMPONENT (ROLE-BASED GUARD)
// Restricts Kitchen Board and Admin Manager to authenticated staff/admin
// ==============================================================================

import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth, AUTH_CREDENTIALS } from '../../context/AuthContext';

export function ProtectedRoute({ children, role = 'staff' }) {
  const { userRole, hasStaffAccess, hasAdminAccess, login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  // Check access permissions
  const isAuthorized = role === 'admin' ? hasAdminAccess : hasStaffAccess;

  if (isAuthorized) {
    return <>{children}</>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = login(password, role);
    if (!result.success) {
      setError(result.error);
    }
  };

  const roleTitle = role === 'admin' ? 'Owner / Admin Portal' : 'Kitchen Staff Board';
  const roleSubtitle =
    role === 'admin'
      ? 'Password required to manage menu prices, categories, and stock availability.'
      : 'Password required to view new orders and update kitchen preparation status.';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200/90 shadow-xl shadow-stone-200/50">
        
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{roleTitle}</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{roleSubtitle}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter {role === 'admin' ? 'Admin' : 'Staff'} Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-canteen-500 pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-canteen-500 hover:bg-canteen-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-canteen-500/25 flex items-center justify-center space-x-2 active:scale-[0.99] min-h-[46px]"
          >
            <span>Unlock Access</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Lab Evaluation Credentials Helper */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-medium">
            <KeyRound className="w-3.5 h-3.5 text-stone-400" />
            <span>
              Lab Demo Passwords: <strong>staff123</strong> | <strong>admin123</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
