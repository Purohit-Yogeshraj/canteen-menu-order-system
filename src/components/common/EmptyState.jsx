// ==============================================================================
// EMPTY STATE & LOADING SPINNER COMPONENTS
// ==============================================================================

import React from 'react';
import { SearchX, Loader2 } from 'lucide-react';

export function EmptyState({ title = 'No items found', description = 'Try adjusting your search or category filters.', actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-stone-200/80 shadow-sm max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-canteen-500 text-white text-xs font-semibold rounded-lg hover:bg-canteen-600 transition-colors shadow-sm min-h-[44px]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-canteen-500 mb-3" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );
}
