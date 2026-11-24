// ==============================================================================
// FOOD CARD COMPONENT
// Mobile 390px responsive card with quantity steppers and sold-out styling
// ==============================================================================

import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { FallbackImage } from '../common/FallbackImage';
import { VegNonVegBadge } from '../common/Badge';
import { formatINR } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useCanteenHours } from '../../hooks/useCanteenHours';
import { CANTEEN_RULES } from '../../utils/constants';

export function FoodCard({ item }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const { canAcceptOrders, isPastCutoff } = useCanteenHours();
  const quantity = getItemQuantity(item.id);
  const isAvailable = item.is_available;

  const handleIncrement = () => {
    if (!isAvailable || !canAcceptOrders) return;
    if (quantity === 0) {
      addToCart(item);
    } else {
      updateQuantity(item.id, 1);
    }
  };

  const handleDecrement = () => {
    if (!isAvailable) return;
    updateQuantity(item.id, -1);
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all overflow-hidden flex flex-col ${
        !isAvailable
          ? 'border-stone-200/60 opacity-75'
          : 'border-stone-200/80 hover:border-canteen-300 hover:shadow-lg hover:shadow-stone-200/50'
      }`}
    >
      {/* Food Photo Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <FallbackImage
          src={item.image_url}
          alt={item.name}
          category={item.category}
          className={`w-full h-full transition-transform duration-500 ${
            !isAvailable ? 'grayscale-[60%]' : 'group-hover:scale-105'
          }`}
        />

        {/* Veg / Non-Veg Indicator Pin */}
        <div className="absolute top-2.5 left-2.5 z-10 shadow-sm">
          <VegNonVegBadge isVeg={item.is_veg} size="sm" />
        </div>

        {/* Category Pill Tag */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
            {item.category}
          </span>
        </div>

        {/* Sold Out Banner Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-md transform -rotate-3">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Action Bar */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-canteen-600 transition-colors">
              {item.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {item.description || 'Freshly prepared in the campus canteen kitchen.'}
          </p>
        </div>

        {/* Pricing & Add to Cart Stepper */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-auto">
          <div>
            <span className="text-xs text-stone-500 block leading-none">Price</span>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              {formatINR(item.price)}
            </span>
          </div>

          <div>
            {!isAvailable ? (
              <span className="text-xs text-stone-400 font-semibold px-2 py-1 bg-stone-100 rounded-md">
                Unavailable
              </span>
            ) : !canAcceptOrders ? (
              <span
                title={isPastCutoff ? 'Cutoff 4:45 PM' : 'Closed'}
                className="text-[11px] text-amber-700 font-semibold px-2 py-1 bg-amber-50 border border-amber-200 rounded-md"
              >
                Orders Closed
              </span>
            ) : quantity === 0 ? (
              <button
                onClick={handleIncrement}
                className="flex items-center space-x-1 px-4 py-2 bg-canteen-50 text-canteen-600 hover:bg-canteen-500 hover:text-white border border-canteen-300 font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 min-h-[44px] min-w-[44px]"
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 bg-canteen-500 text-white rounded-xl p-1 shadow-md shadow-canteen-500/20">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 rounded-lg bg-canteen-600 hover:bg-canteen-700 flex items-center justify-center transition-colors active:scale-90"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-xs font-bold select-none">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  disabled={quantity >= CANTEEN_RULES.MAX_QUANTITY_PER_ITEM}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-90 ${
                    quantity >= CANTEEN_RULES.MAX_QUANTITY_PER_ITEM
                      ? 'bg-canteen-400 opacity-50 cursor-not-allowed'
                      : 'bg-canteen-600 hover:bg-canteen-700'
                  }`}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
