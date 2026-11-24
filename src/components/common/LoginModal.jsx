// ==============================================================================
// STAFF & ADMIN LOGIN MODAL
// Triggered from Navbar to authenticate staff/admin sessions
// ==============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, KeyRound, ShieldAlert, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LoginModal() {
  const navigate = useNavigate();
  const { isLoginModalOpen, closeLoginModal, targetRolePrompt, login } = useAuth();
  const [selectedRole, setSelectedRole] = useState(targetRolePrompt || 'staff');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = login(password, selectedRole);

    if (result.success) {
      setPassword('');
      closeLoginModal();
      // Navigate to relevant dashboard
      if (result.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/kitchen');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200">
        
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Staff & Admin Access</h3>
          <p className="text-xs text-slate-500 mt-1">
            Authenticate to unlock kitchen and menu management portals
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('staff');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              selectedRole === 'staff'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-stone-500 hover:text-slate-800'
            }`}
          >
            Kitchen Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              selectedRole === 'admin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-stone-500 hover:text-slate-800'
            }`}
          >
            Menu Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {selectedRole === 'admin' ? 'Admin Password' : 'Staff Password'}
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
            className="w-full py-3.5 bg-canteen-500 hover:bg-canteen-600 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-canteen-500/25 flex items-center justify-center space-x-2 active:scale-[0.99] min-h-[44px]"
          >
            <span>Log In as {selectedRole === 'admin' ? 'Admin' : 'Staff'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Lab Credentials Helper */}
        <div className="mt-5 pt-4 border-t border-stone-100 text-center">
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
