// ==============================================================================
// CONFIGURATION ERROR BANNER (PRODUCTION FAIL-FAST)
// Renders when Supabase keys are missing in production. Halts silent mock fallback.
// ==============================================================================

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function ConfigErrorBanner({ message }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white">
      <div className="max-w-lg w-full bg-slate-800 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3 text-red-400 mb-4">
          <AlertTriangle className="w-8 h-8 flex-shrink-0 animate-bounce" />
          <h1 className="text-xl font-bold tracking-tight">Production Configuration Error</h1>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed mb-4">
          {message}
        </p>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-700 font-mono text-xs text-amber-300 overflow-x-auto mb-4">
          <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
          <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
        </div>
        <p className="text-xs text-slate-400">
          In compliance with project safety invariant 4.2, this application halts execution rather than silently falling back to mock data in production.
        </p>
      </div>
    </div>
  );
}
