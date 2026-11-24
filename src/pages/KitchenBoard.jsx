// ==============================================================================
// SCREEN 4: KITCHEN OPERATIONS KANBAN BOARD (ROUTE: /kitchen)
// 3-Column Kanban, 15m overdue warning badge, forward-only status progression
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useSimulation } from '../context/SimulationContext';
import { getElapsedTime, formatINR } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/EmptyState';

export function KitchenBoard() {
  const { activeOrders, loading, audioEnabled, setAudioEnabled, advanceOrderStatus } = useOrders();
  const { getEffectiveTime } = useSimulation();
  const [updatingId, setUpdatingId] = useState(null);

  // Force tick every 10 seconds to update running elapsed timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdvanceStatus = async (orderId, nextStatus) => {
    try {
      setUpdatingId(orderId);
      await advanceOrderStatus(orderId, nextStatus);
    } catch (err) {
      alert(`Status transition error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Group active orders into 3 Kanban columns
  const placedOrders = activeOrders.filter(o => o.status === 'placed');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');
  const readyOrders = activeOrders.filter(o => o.status === 'ready');

  const now = getEffectiveTime();

  return (
    <div className="min-h-screen bg-stone-100/70 p-4 sm:p-6 lg:p-8">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-canteen-500 text-white flex items-center justify-center shadow-md shadow-canteen-500/20">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Kitchen Operations Board</h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-canteen-100 text-canteen-800 border border-canteen-300">
                {activeOrders.length} Active Tickets
              </span>
            </div>
            <p className="text-xs text-slate-500">Live order queue for prep cooks and counter staff</p>
          </div>
        </div>

        {/* Audio Alert Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              audioEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}
            aria-label="Toggle audio chime"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Connecting to live kitchen feed..." />
      ) : (
        /* 3-COLUMN KANBAN BOARD */
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* COLUMN 1: NEW / PLACED */}
          <div className="bg-stone-50/80 rounded-3xl border border-orange-200/80 p-4 flex flex-col min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-200/60">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                  New Orders ({placedOrders.length})
                </h2>
              </div>
              <span className="text-[11px] text-orange-700 font-semibold">Incoming</span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {placedOrders.length === 0 ? (
                <div className="py-20 text-center text-xs text-stone-400">
                  No new orders in queue
                </div>
              ) : (
                placedOrders.map(order => (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    now={now}
                    isUpdating={updatingId === order.id}
                    nextActionLabel="Start Preparing →"
                    nextStatus="preparing"
                    onAction={() => handleAdvanceStatus(order.id, 'preparing')}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING */}
          <div className="bg-stone-50/80 rounded-3xl border border-amber-200/80 p-4 flex flex-col min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                  Preparing ({preparingOrders.length})
                </h2>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold">On Stove</span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {preparingOrders.length === 0 ? (
                <div className="py-20 text-center text-xs text-stone-400">
                  No dishes currently cooking
                </div>
              ) : (
                preparingOrders.map(order => (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    now={now}
                    isUpdating={updatingId === order.id}
                    nextActionLabel="Mark Ready for Pickup →"
                    nextStatus="ready"
                    onAction={() => handleAdvanceStatus(order.id, 'ready')}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: READY FOR PICKUP */}
          <div className="bg-stone-50/80 rounded-3xl border border-emerald-200/80 p-4 flex flex-col min-h-[600px] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/60">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">
                  Ready ({readyOrders.length})
                </h2>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">At Counter</span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {readyOrders.length === 0 ? (
                <div className="py-20 text-center text-xs text-stone-400">
                  No orders waiting for pickup
                </div>
              ) : (
                readyOrders.map(order => (
                  <KitchenCard
                    key={order.id}
                    order={order}
                    now={now}
                    isUpdating={updatingId === order.id}
                    nextActionLabel="Mark Collected ✓"
                    nextStatus="collected"
                    onAction={() => handleAdvanceStatus(order.id, 'collected')}
                  />
                ))
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

/**
 * INDIVIDUAL KITCHEN TICKET CARD
 */
function KitchenCard({ order, now, isUpdating, nextActionLabel, nextStatus, onAction }) {
  const { text: elapsedText, isOverdue } = getElapsedTime(order.created_at, now);

  return (
    <div
      className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
        isOverdue
          ? 'border-red-400 ring-2 ring-red-400/30'
          : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      {/* Ticket Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-stone-100">
        <div>
          <span className="text-xl font-black text-slate-900 tracking-tight block">
            {order.token_display}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {order.student_name} ({order.roll_number})
          </span>
        </div>

        {/* Elapsed Timer & Overdue Warning Badge */}
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{elapsedText}</span>
          </div>
          {isOverdue && (
            <span className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-bold animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>&gt;15m Overdue</span>
            </span>
          )}
        </div>
      </div>

      {/* Item Checklist */}
      <div className="space-y-1.5 py-2 text-xs">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-slate-800">
            <span className="font-semibold flex items-center space-x-1.5">
              <span className="inline-block px-1.5 py-0.5 rounded bg-canteen-100 text-canteen-800 font-bold text-[11px]">
                {item.quantity}x
              </span>
              <span>{item.item_name}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Action Advance Button */}
      <div className="pt-3 border-t border-stone-100 mt-2">
        <button
          onClick={onAction}
          disabled={isUpdating}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-sm min-h-[44px] ${
            nextStatus === 'collected'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              : 'bg-canteen-500 hover:bg-canteen-600 text-white shadow-canteen-500/20'
          }`}
        >
          <span>{isUpdating ? 'Updating...' : nextActionLabel}</span>
        </button>
      </div>
    </div>
  );
}
