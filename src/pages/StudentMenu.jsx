// ==============================================================================
// SCREEN 1: STUDENT MENU (ROUTE: /)
// Mobile-first (390px+) Indian canteen food catalog with real-time stock sync
// ==============================================================================

import React from 'react';
import { AlertCircle, Clock, Sparkles } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import { useCanteenHours } from '../hooks/useCanteenHours';
import { useSimulation } from '../context/SimulationContext';
import { FoodCard } from '../components/menu/FoodCard';
import { CategoryFilter } from '../components/menu/CategoryFilter';
import { StickyCartBar } from '../components/menu/StickyCartBar';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

export function StudentMenu() {
  const { filteredItems, loading, error, setSelectedCategory, setSearchQuery, setVegFilter } = useMenu();
  const { evictedNotice, clearEvictedNotice } = useCart();
  const { isPastCutoff, isOpen, notice, formattedTime } = useCanteenHours();
  const { simulationActive, simulatedScenario, setScenario } = useSimulation();

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setVegFilter('all');
  };

  return (
    <div className="min-h-screen pb-28 relative">
      {/* Lovable-Style Ambient Glow Backdrop */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-canteen-500/10 via-amber-500/5 to-transparent blur-3xl -z-10" />

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
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-300/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Notice from Canteen Kitchen</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notice}</p>
              </div>
            </div>
            <button
              onClick={() => setScenario('normal')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap min-h-[40px] active:scale-95 flex-shrink-0"
              title="Temporarily simulate 12:30 PM peak lunch hours to evaluate ordering features"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Open Hours (12:30 PM)</span>
            </button>
          </div>
        )}

        {/* Active Simulation Notice Banner */}
        {simulationActive && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>Evaluation Mode Active:</strong> Simulating {formattedTime} ({simulatedScenario === 'normal' ? 'Open for Orders' : simulatedScenario === 'cutoff' ? 'Past 4:45 PM Cutoff' : 'Closed'}).
              </span>
            </div>
            <button
              onClick={() => setScenario('real')}
              className="text-emerald-800 hover:text-emerald-950 font-bold underline text-xs ml-auto whitespace-nowrap"
            >
              Reset to Real System Clock
            </button>
          </div>
        )}

        {/* Hero Welcome Headline */}
        <div className="mb-5 animate-fade-in-up">
          <div className="inline-flex items-center space-x-1.5 text-canteen-600 bg-canteen-50 border border-canteen-200/80 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-canteen-500" />
            <span>Freshly Cooked Daily</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Canteen Menu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Skip the physical counter rush. Order your favorites and pick up when your token is called.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CategoryFilter />
        </div>

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
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="stagger-card"
                style={{ animationDelay: `${Math.min(index * 45, 550)}ms` }}
              >
                <FoodCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Cart Summary */}
      <StickyCartBar />
    </div>
  );
}
