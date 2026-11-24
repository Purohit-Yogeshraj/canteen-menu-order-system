// ==============================================================================
// LOVABLE-STYLE ENTRANCE WELCOME SPLASH ANIMATION
// Fires on first load or refresh, smoothly unveiling the application
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Sparkles } from 'lucide-react';

export function WelcomeSplash() {
  const [mounted, setMounted] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    // Start smooth fade-out and scale-up exit after 1000ms
    const closeTimer = setTimeout(() => {
      setClosing(true);
    }, 1100);

    // Unmount completely from DOM after animation completes (1700ms)
    const unmountTimer = setTimeout(() => {
      setMounted(false);
    }, 1700);

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const handleSkip = () => {
    setClosing(true);
    setTimeout(() => setMounted(false), 300);
  };

  if (!mounted) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 select-none cursor-pointer transition-all duration-700 ease-out ${
        closing
          ? 'opacity-0 scale-105 blur-sm pointer-events-none'
          : 'opacity-100 scale-100 bg-slate-950/95 backdrop-blur-2xl'
      }`}
      aria-label="Welcome Splash Screen (Click to skip)"
      title="Click to enter"
    >
      {/* Ambient Glowing Gradient Orbs */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-500/20 blur-[100px] pointer-events-none animate-glow" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/15 blur-[100px] pointer-events-none animate-glow delay-1000" />

      {/* Center Welcome Card */}
      <div className="relative max-w-sm w-full text-center flex flex-col items-center">
        
        {/* Pulsing Brand Icon with Halo Rings */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-3xl bg-canteen-500/30 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-canteen-600 via-canteen-500 to-amber-400 p-0.5 shadow-2xl shadow-canteen-500/40">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center text-white">
              <UtensilsCrossed className="w-10 h-10 text-canteen-400 animate-float" />
            </div>
          </div>
        </div>

        {/* Brand Headline with Shimmer Text */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-bold text-amber-300 mb-3 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-canteen-400" />
          <span>Vibe-Ready Canteen Experience</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          Campus <span className="shimmer-text">Canteen</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mb-6">
          Freshly cooked meals • Skip the physical queue rush
        </p>

        {/* Sleek Animated Loading Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-canteen-600 via-amber-400 to-canteen-500 rounded-full animate-[fade-in-up_1s_ease-in-out_forwards]" />
        </div>

        <p className="text-[10px] text-slate-500 mt-4 tracking-wider uppercase font-semibold">
          Tap anywhere to skip
        </p>

      </div>
    </div>
  );
}
