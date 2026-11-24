// ==============================================================================
// SCREEN 5: NOW SERVING TV DISPLAY (ROUTE: /display)
// Fullscreen 1920x1080 dark display, Preparing vs. Ready, 5s blinking animation
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BellRing, Flame, Sparkles, Monitor, ArrowLeft } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useSimulation } from '../context/SimulationContext';
import { orderService } from '../api/orderService';

export function NowServing() {
  const { activeOrders } = useOrders();
  const { getEffectiveTime } = useSimulation();

  // Track tokens that transitioned to ready in the last 5 seconds
  const [newlyReadyTokens, setNewlyReadyTokens] = useState(new Set());
  const previousReadyIdsRef = useRef(new Set());

  // Digital clock
  const [clockTime, setClockTime] = useState(() => getEffectiveTime());
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTime(getEffectiveTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [getEffectiveTime]);

  const readyOrders = activeOrders.filter(o => o.status === 'ready');
  const preparingOrders = activeOrders.filter(o => o.status === 'preparing');

  // Detect newly ready tokens to trigger the 5-second pulse/blink animation
  useEffect(() => {
    const currentReadyIds = new Set(readyOrders.map(o => o.id));
    const previousReadyIds = previousReadyIdsRef.current;

    const brandNewTokens = [];
    readyOrders.forEach(o => {
      if (!previousReadyIds.has(o.id)) {
        brandNewTokens.push(o.token_display);
      }
    });

    if (brandNewTokens.length > 0) {
      setNewlyReadyTokens(prev => {
        const next = new Set(prev);
        brandNewTokens.forEach(t => next.add(t));
        return next;
      });

      // Clear the blinking state after exactly 5 seconds
      const timeout = setTimeout(() => {
        setNewlyReadyTokens(prev => {
          const next = new Set(prev);
          brandNewTokens.forEach(t => next.delete(t));
          return next;
        });
      }, 5000);

      return () => clearTimeout(timeout);
    }

    previousReadyIdsRef.current = currentReadyIds;
  }, [readyOrders]);

  return (
    <div className="min-h-screen bg-surface-tv text-white font-sans flex flex-col justify-between overflow-hidden select-none p-6 sm:p-10">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-canteen-600 to-canteen-400 flex items-center justify-center text-white shadow-lg shadow-canteen-500/20">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
              <span>CAMPUS CANTEEN QUEUE</span>
              <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-full bg-slate-800 text-canteen-400 border border-slate-700">
                Live Status
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">Order pickup board — Please watch for your token number</p>
          </div>
        </div>

        {/* Live Digital Clock & Exit Link */}
        <div className="flex items-center space-x-3">
          <Link
            to="/kitchen"
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 transition-colors"
            title="Return to Kitchen Board"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kitchen</span>
          </Link>
          <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 px-5 py-2.5 rounded-2xl shadow-inner">
            <Clock className="w-5 h-5 text-canteen-400" />
            <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-widest">
              {clockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. DUAL-ZONE SPLIT DISPLAY (PREPARING vs. READY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 flex-1">
        
        {/* LEFT ZONE: PREPARING (Cooking in Kitchen) */}
        <div className="bg-slate-900/80 rounded-3xl border border-amber-500/30 p-6 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-amber-400">
              <Flame className="w-6 h-6 animate-pulse text-amber-500" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-amber-400">
                PREPARING IN KITCHEN
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {preparingOrders.length} Cooking
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium">
                No orders currently in preparation
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {preparingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-6 rounded-2xl bg-slate-800/90 border border-amber-500/20 text-center shadow-lg"
                  >
                    <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight block">
                      {order.token_display}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium mt-1 truncate block">
                      {order.student_name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT ZONE: READY TO COLLECT (Pickup at Counter 1) */}
        <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/40 p-6 flex flex-col shadow-2xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-2.5 text-emerald-400">
              <BellRing className="w-6 h-6 text-emerald-400 animate-bounce" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-emerald-400">
                READY FOR PICKUP (COUNTER 1)
              </h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {readyOrders.length} Ready
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm font-medium">
                Tokens will appear here when ready for collection
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {readyOrders.map((order) => {
                  const isBlinking = newlyReadyTokens.has(order.token_display);
                  return (
                    <div
                      key={order.id}
                      className={`p-4 sm:p-6 rounded-2xl text-center transition-all ${
                        isBlinking
                          ? 'animate-ready-blink bg-emerald-500/30 border-2 border-emerald-400 text-white'
                          : 'bg-emerald-950/60 border border-emerald-500/50 shadow-lg'
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl font-black text-emerald-300 tracking-tight block">
                        {order.token_display}
                      </span>
                      <span className="text-xs text-emerald-200 font-semibold mt-1 truncate block">
                        {order.student_name}
                      </span>
                      {isBlinking && (
                        <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                          Just Called!
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. RUNNING FOOTER TICKER */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-canteen-400" />
          <span>Please have your daily token number ready when approaching Counter 1.</span>
        </div>
        <div className="font-semibold text-slate-400">
          Canteen Hours: 8:00 AM – 5:00 PM (Orders till 4:45 PM)
        </div>
      </div>
    </div>
  );
}
