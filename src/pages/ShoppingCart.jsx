// ==============================================================================
// SCREEN 2: SHOPPING CART (ROUTE: /cart)
// Review items, bounds 1-10, student credentials validation, atomic checkout
// ==============================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCanteenHours } from '../hooks/useCanteenHours';
import { useSimulation } from '../context/SimulationContext';
import { orderService } from '../api/orderService';
import { formatINR } from '../utils/formatters';
import { FallbackImage } from '../components/common/FallbackImage';
import { VegNonVegBadge } from '../components/common/Badge';
import { CANTEEN_RULES } from '../utils/constants';

export function ShoppingCart() {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    total,
    studentName,
    setStudentName,
    rollNumber,
    setRollNumber,
    isFormValid,
    evictedNotice,
    clearEvictedNotice,
  } = useCart();

  const { canAcceptOrders, isPastCutoff } = useCanteenHours();
  const { setScenario } = useSimulation();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!isFormValid || !canAcceptOrders || submitting) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const orderPayload = {
        studentName,
        rollNumber,
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        })),
        totalAmount: total,
      };

      const createdOrder = await orderService.placeOrder(orderPayload);
      clearCart();
      // Redirect to Order Status tracking screen
      navigate(`/order/${createdOrder.id}`);
    } catch (err) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-stone-200/80 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-canteen-50 text-canteen-500 mx-auto flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Your cart is empty</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Looks like you haven't added any tasty snacks or meals to your tray yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-canteen-500 text-white font-bold text-sm rounded-xl hover:bg-canteen-600 transition-all shadow-md shadow-canteen-500/25 min-h-[44px]"
          >
            Browse Canteen Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light py-6 sm:py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 p-1"
          >
            Clear Entire Tray
          </button>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
          Review Your Order
        </h1>

        {/* Real-Time Sold-Out Eviction Toast */}
        {evictedNotice && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
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

        {/* Cutoff Warning Banner if past 4:45 PM */}
        {!canAcceptOrders && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                Canteen is closed for today (Hours: 08:00 AM - 05:00 PM IST, Cutoff 4:45 PM).
              </span>
            </div>
            <button
              type="button"
              onClick={() => setScenario('normal')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-xs whitespace-nowrap min-h-[36px] active:scale-95 flex-shrink-0"
              title="Simulate 12:30 PM open hours to test order checkout"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Open Hours (12:30 PM)</span>
            </button>
          </div>
        )}

        {/* Cart Item Rows */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm divide-y divide-stone-100 overflow-hidden mb-6">
          {cartItems.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <FallbackImage
                  src={item.image_url}
                  alt={item.name}
                  category={item.category}
                  className="w-16 h-16 rounded-xl flex-shrink-0 object-cover"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5 mb-0.5">
                    <VegNonVegBadge isVeg={item.is_veg} size="sm" />
                    <h3 className="font-bold text-slate-900 text-sm truncate">{item.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatINR(item.price)} each
                  </p>
                </div>
              </div>

              {/* Quantity Stepper & Removal */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="flex items-center space-x-1 bg-stone-100 rounded-xl p-1 border border-stone-200">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 hover:bg-stone-200 flex items-center justify-center transition-colors active:scale-90"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={item.quantity >= CANTEEN_RULES.MAX_QUANTITY_PER_ITEM}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-90 ${
                      item.quantity >= CANTEEN_RULES.MAX_QUANTITY_PER_ITEM
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 hover:bg-stone-200'
                    }`}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Student Credentials Form & Checkout Summary */}
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-canteen-600">
              Student Details (Required for Token Pickup)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-canteen-500/30 focus:border-canteen-500 transition-all min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  College Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. IT-2026-042"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-canteen-500/30 focus:border-canteen-500 transition-all min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Bill Calculation Breakdown */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Item Subtotal</span>
              <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Packaging & Service Tax</span>
              <span className="font-semibold text-emerald-600">₹0 (Free)</span>
            </div>
            <div className="pt-3 border-t border-stone-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-xl font-extrabold text-slate-900">{formatINR(total)}</span>
            </div>
          </div>

          {/* Submission Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!isFormValid || !canAcceptOrders || submitting}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-base transition-all shadow-lg min-h-[50px] flex items-center justify-center space-x-2 ${
              !isFormValid || !canAcceptOrders || submitting
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-canteen-500 text-white hover:bg-canteen-600 active:scale-[0.99] shadow-canteen-500/30'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Token...</span>
              </>
            ) : !canAcceptOrders ? (
              <span>Orders Closed for Today</span>
            ) : !isFormValid ? (
              <span>Enter Name & Roll No to Order</span>
            ) : (
              <span>Place Order • {formatINR(total)}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
