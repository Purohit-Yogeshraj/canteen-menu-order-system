// ==============================================================================
// STICKY BOTTOM CART SUMMARY BAR
// Slides up when totalItemsCount > 0 with item count, subtotal, and CTA
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/formatters';

export function StickyCartBar() {
  const { totalItemsCount, subtotal } = useCart();

  if (totalItemsCount === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 p-4 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 flex items-center justify-between transform transition-all duration-300 animate-in slide-in-from-bottom-6">
          
          {/* Cart Counter & Total */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-xl bg-canteen-500 text-white flex items-center justify-center shadow-md shadow-canteen-500/30">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-slate-900">
                {totalItemsCount}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium leading-tight">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart
              </p>
              <p className="text-base font-extrabold text-white leading-tight tracking-tight">
                {formatINR(subtotal)}
              </p>
            </div>
          </div>

          {/* View Cart Action CTA */}
          <Link
            to="/cart"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-canteen-500 text-white text-sm font-bold hover:bg-canteen-600 active:scale-95 transition-all shadow-md shadow-canteen-500/25 min-h-[44px]"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
