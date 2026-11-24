// ==============================================================================
// CATEGORY & SEARCH FILTER COMPONENT
// Touch-scrollable category pills, Veg/Non-Veg toggle, and instant search
// ==============================================================================

import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';
import { CANTEEN_RULES } from '../../utils/constants';
import { VegNonVegBadge } from '../common/Badge';

export function CategoryFilter() {
  const {
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    vegFilter,
    setVegFilter,
  } = useMenu();

  return (
    <div className="space-y-3 mb-6">
      {/* Search Bar & Veg Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search samosa, biryani, coffee, dosa..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-stone-200 text-sm text-slate-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-canteen-500/30 focus:border-canteen-500 transition-all shadow-sm min-h-[44px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Veg / Non-Veg Quick Filter Toggle */}
        <div className="flex items-center space-x-1 bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            onClick={() => setVegFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
              vegFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors min-h-[36px] ${
              vegFilter === 'veg'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-sm'
                : 'text-stone-600 hover:text-emerald-700'
            }`}
          >
            <VegNonVegBadge isVeg={true} size="sm" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setVegFilter('nonveg')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors min-h-[36px] ${
              vegFilter === 'nonveg'
                ? 'bg-red-50 text-red-800 border border-red-300 font-semibold shadow-sm'
                : 'text-stone-600 hover:text-red-700'
            }`}
          >
            <VegNonVegBadge isVeg={false} size="sm" />
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Horizontal Touch Scrollable Category Pills */}
      <div className="overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center space-x-2 min-w-max">
          {CANTEEN_RULES.CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all min-h-[44px] flex items-center justify-center ${
                  isSelected
                    ? 'bg-canteen-500 text-white shadow-md shadow-canteen-500/25 font-bold scale-[1.02]'
                    : 'bg-white text-slate-700 border border-stone-200/90 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
