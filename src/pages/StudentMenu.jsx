// ==============================================================================
// SCREEN 1: STUDENT MENU (ROUTE: /)
// Mobile-first (390px+) Indian canteen food catalog with real-time stock sync
// ==============================================================================

import React from 'react';
import { AlertCircle, Clock, Sparkles } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useCanteenHours } from '../hooks/useCanteenHours';
import { FoodCard } from '../components/menu/FoodCard';
import { CategoryFilter } from '../components/menu/CategoryFilter';
import { StickyCartBar } from '../components/menu/StickyCartBar';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

export function StudentMenu() {
  const { filteredItems, loading, error, setSelectedCategory, setSearchQuery, setVegFilter } = useMenu();
  const { evictedNotice, clearEvictedNotice } = useCart();
  const { isPastCutoff, isOpen, notice } = useCanteenHours();

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setVegFilter('all');
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Notice & Alert Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* Real-time Sold-out Eviction Alert */}
        {evictedNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{evictedNotice}</span>
            </div>
            <button
              onClick={clearEvictedNotice}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Operating Hours / Cutoff Alert Banner */}
        {(!isOpen || isPastCutoff) && notice && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-300/80 shadow-sm flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Notice from Canteen Kitchen</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notice}</p>
            </div>
          </div>
        )}

        {/* Hero Welcome Headline */}
        <div className="mb-5">
          <div className="flex items-center space-x-2 text-canteen-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Freshly Cooked Daily</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Canteen Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Skip the physical counter rush. Order your favorites and pick up when your token is called.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <CategoryFilter />

        {/* Catalog Grid */}
        {loading ? (
          <LoadingSpinner text="Loading freshly updated menu items..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No dishes found"
            description="We couldn't find any menu items matching your active category or search query."
            actionText="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Cart Summary */}
      <StickyCartBar />
    </div>
  );
}
