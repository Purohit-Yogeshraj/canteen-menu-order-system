// ==============================================================================
// RESPONSIVE APPLICATION NAVBAR
// Brand header, operating status badge, and navigation across all screens
// ==============================================================================

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, UtensilsCrossed, Monitor, LayoutDashboard, Menu, X, Clock, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCanteenHours } from '../../hooks/useCanteenHours';
import { activeMode } from '../../api/client';

export function Navbar() {
  const location = useLocation();
  const { totalItemsCount } = useCart();
  const { isOpen, isPastCutoff, formattedTime } = useCanteenHours();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // TV display screen hides standard navbar to be completely fullscreen
  if (location.pathname === '/display') {
    return null;
  }

  const navLinks = [
    { name: 'Menu', path: '/' },
    { name: 'Kitchen Board', path: '/kitchen', badge: 'Staff' },
    { name: 'Now Serving TV', path: '/display', badge: '1080p' },
    { name: 'Menu Manager', path: '/admin', badge: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-canteen-600 to-canteen-400 flex items-center justify-center text-white shadow-md shadow-canteen-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Campus Canteen</span>
                {activeMode === 'mock' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    Mock Dev
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 leading-none">Order Queue System</p>
            </div>
          </Link>

          {/* Operational Hours Badge (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-600">{formattedTime}</span>
            <span className="text-stone-300">•</span>
            {isPastCutoff ? (
              <span className="font-semibold text-amber-700">Cutoff (4:45 PM)</span>
            ) : isOpen ? (
              <span className="font-semibold text-emerald-700">Open for Orders</span>
            ) : (
              <span className="font-semibold text-stone-500">Closed</span>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-canteen-50 text-canteen-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-50'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs: Cart Icon & Mobile Hamburger */}
          <div className="flex items-center space-x-2">
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-canteen-500 text-white hover:bg-canteen-600 active:scale-95 transition-all shadow-md shadow-canteen-500/25 flex items-center justify-center min-w-[44px] min-h-[44px]"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalItemsCount > 99 ? '99+' : totalItemsCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-stone-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in fade-in duration-150">
          <div className="flex items-center justify-between py-2 px-3 mb-2 rounded-lg bg-stone-50 text-xs text-stone-600">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Canteen Time: <strong>{formattedTime}</strong></span>
            </div>
            <span className={isPastCutoff ? 'text-amber-700 font-bold' : isOpen ? 'text-emerald-700 font-bold' : 'text-stone-500 font-bold'}>
              {isPastCutoff ? 'Cutoff' : isOpen ? 'Open' : 'Closed'}
            </span>
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium min-h-[44px] ${
                  isActive
                    ? 'bg-canteen-50 text-canteen-600 font-semibold'
                    : 'text-slate-700 hover:bg-stone-50'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
