// ==============================================================================
// VEG / NON-VEG & STATUS BADGES
// ==============================================================================

import React from 'react';

/**
 * Standard Indian Food Safety Veg / Non-Veg Indicator
 */
export function VegNonVegBadge({ isVeg, size = 'sm' }) {
  const dimensions = size === 'lg' ? 'w-5 h-5 p-0.5' : 'w-4 h-4 p-0.5';
  const dotSize = size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  if (isVeg) {
    return (
      <span
        title="Pure Vegetarian"
        className={`inline-flex items-center justify-center border-2 border-emerald-600 bg-white rounded-sm ${dimensions}`}
      >
        <span className={`rounded-full bg-emerald-600 ${dotSize}`} />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className={`inline-flex items-center justify-center border-2 border-red-600 bg-white rounded-sm ${dimensions}`}
    >
      <span className={`w-0 h-0 border-x-[4px] border-x-transparent border-b-[8px] border-b-red-600`} />
    </span>
  );
}

/**
 * Status Tag for Orders
 */
export function StatusBadge({ status }) {
  const configs = {
    placed: { label: 'Placed', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    preparing: { label: 'Preparing', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    ready: { label: 'Ready for Pickup', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    collected: { label: 'Collected', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  };

  const config = configs[status] || configs.placed;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}
