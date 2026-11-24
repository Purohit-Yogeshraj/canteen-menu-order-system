// ==============================================================================
// SCREEN 3: ORDER STATUS (ROUTE: /order/:id)
// Live token badge, 3-stage progress stepper, dynamic wait calculation, confetti
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  Utensils,
  PartyPopper,
  ArrowLeft,
  AlertCircle,
  BellRing
} from 'lucide-react';
import { orderService } from '../api/orderService';
import { useOrders } from '../context/OrderContext';
import { formatINR, calculateWaitTime, formatTokenDisplay } from '../utils/formatters';
import { LoadingSpinner, EmptyState } from '../components/common/EmptyState';

export function OrderStatus() {
  const { id } = useParams();
  const { getOrdersAhead } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confettiFired, setConfettiFired] = useState(false);

  // Fetch initial order
  useEffect(() => {
    let isMounted = true;
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await orderService.getOrderById(id);
        if (isMounted) setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrder();

    // Subscribe to live order status changes
    const unsubscribe = orderService.subscribeToOrders(({ type, order: updatedOrder }) => {
      if (updatedOrder && updatedOrder.id === id) {
        setOrder(updatedOrder);

        // Fire celebration confetti when order status shifts to Ready
        if (updatedOrder.status === 'ready' && !confettiFired) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            setConfettiFired(true);
          } catch (e) {}
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [id, confettiFired]);

  if (loading) {
    return <LoadingSpinner text="Retrieving live order status..." />;
  }

  if (!order) {
    return (
      <EmptyState
        title="Order Not Found"
        description="We couldn't locate this order token. It may have expired or been entered incorrectly."
        actionText="Back to Canteen Menu"
        onAction={() => window.location.href = '/'}
      />
    );
  }

  const ordersAhead = getOrdersAhead(order.id);
  const estimatedWait = calculateWaitTime(ordersAhead, order.status);

  // Stepper Stage Progress Definitions
  const steps = [
    { key: 'placed', label: 'Order Placed', desc: 'Received by kitchen' },
    { key: 'preparing', label: 'Preparing', desc: 'Cooking on stove' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'At Counter 1' },
  ];

  const getStepIndex = (st) => {
    if (st === 'placed') return 0;
    if (st === 'preparing') return 1;
    if (st === 'ready' || st === 'collected') return 2;
    return 0;
  };

  const currentStepIdx = getStepIndex(order.status);
  const isReady = order.status === 'ready';
  const isCollected = order.status === 'collected';

  return (
    <div className="min-h-screen bg-surface-light py-6 sm:py-10">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Navigation link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors p-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Order Another Item</span>
          </Link>
        </div>

        {/* READY CELEBRATION HERO BANNER */}
        {isReady && (
          <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25 animate-in zoom-in-95 duration-300">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Your Order is Ready!</h2>
            </div>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              Please proceed to <strong>Counter 1</strong> now and show your token number <strong>{order.token_display}</strong> to collect your tray.
            </p>
          </div>
        )}

        {/* COLLECTED BANNER */}
        {isCollected && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-800 text-slate-200 text-xs flex items-center space-x-2.5 shadow-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>This order was collected and completed. Thank you for dining at Campus Canteen!</span>
          </div>
        )}

        {/* MAIN TOKEN CARD */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 text-center shadow-lg shadow-stone-200/50 mb-6">
          <span className="text-xs font-bold text-canteen-600 uppercase tracking-widest block mb-1">
            Your Daily Token Number
          </span>
          <div className="inline-block px-8 py-3 rounded-2xl bg-canteen-50 border-2 border-canteen-400 text-canteen-600 text-4xl sm:text-5xl font-black tracking-tight my-2 shadow-inner">
            {order.token_display || formatTokenDisplay(order.token_number)}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Student: <strong>{order.student_name}</strong> • Roll No: <strong>{order.roll_number}</strong>
          </p>

          {/* DYNAMIC WAIT TIME ESTIMATION */}
          {!isReady && !isCollected && (
            <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <span className="text-[11px] text-stone-500 font-medium block">Orders Ahead</span>
                <span className="text-xl font-extrabold text-slate-800">{ordersAhead}</span>
              </div>
              <div className="p-3.5 bg-canteen-50/70 rounded-2xl border border-canteen-200/60">
                <span className="text-[11px] text-canteen-700 font-medium block">Estimated Wait</span>
                <span className="text-xl font-extrabold text-canteen-600">~{estimatedWait} mins</span>
              </div>
            </div>
          )}
        </div>

        {/* 3-STAGE PROGRESS TIMELINE */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 text-center">
            Kitchen Preparation Progress
          </h3>

          <div className="relative flex justify-between items-start">
            {/* Background connecting bar */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-stone-100 -z-0">
              <div
                className="h-full bg-canteen-500 transition-all duration-500"
                style={{ width: `${(currentStepIdx / 2) * 100}%` }}
              />
            </div>

            {steps.map((step, idx) => {
              const isPassed = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10 w-1/3 text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                      isPassed
                        ? 'bg-canteen-500 text-white'
                        : isCurrent
                        ? 'bg-canteen-500 text-white ring-4 ring-canteen-100 animate-pulse'
                        : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-canteen-600' : 'text-slate-800'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ORDER ITEMS SUMMARY */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Order Details</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-canteen-600 w-5">{item.quantity}x</span>
                  <span className="text-slate-800 font-medium">{item.item_name}</span>
                </div>
                <span className="font-semibold text-slate-900">{formatINR(item.subtotal)}</span>
              </div>
            ))}
            <div className="pt-3 flex justify-between items-baseline font-bold text-sm">
              <span className="text-slate-900">Total Paid/Due</span>
              <span className="text-base text-slate-900">{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Real-time Indicator Note */}
        <p className="text-center text-[11px] text-slate-400">
          This screen updates live via WebSocket. You do not need to refresh the page.
        </p>
      </div>
    </div>
  );
}
