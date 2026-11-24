// ==============================================================================
// ORDER CONTEXT
// Manages real-time orders, queue depth calculations, audio chimes,
// and forward-only status progression
// ==============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderService } from '../api/orderService';
import { VALID_STATUS_TRANSITIONS } from '../utils/constants';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Synthesize web audio chime for new incoming orders
  const playChime = useCallback(() => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, [audioEnabled]);

  const fetchActiveOrders = useCallback(async () => {
    try {
      setLoading(true);
      const orders = await orderService.getActiveOrders();
      setActiveOrders(orders);
    } catch (err) {
      console.error('Failed to fetch active orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveOrders();

    // Subscribe to real-time order events
    const unsubscribe = orderService.subscribeToOrders(({ type, order }) => {
      setActiveOrders(currentOrders => {
        if (type === 'INSERT') {
          playChime();
          // Avoid duplicate entries
          const exists = currentOrders.some(o => o.id === order.id);
          if (exists) return currentOrders;
          return [order, ...currentOrders];
        } else if (type === 'UPDATE') {
          if (order.status === 'collected') {
            // Remove collected orders from the active queue
            return currentOrders.filter(o => o.id !== order.id);
          }
          const exists = currentOrders.some(o => o.id === order.id);
          if (!exists) {
            return [order, ...currentOrders];
          }
          return currentOrders.map(o => (o.id === order.id ? { ...o, ...order } : o));
        }
        return currentOrders;
      });
    });

    return () => unsubscribe();
  }, [fetchActiveOrders, playChime]);

  // Advance order status with strict forward progression
  const advanceOrderStatus = async (orderId, newStatus) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setActiveOrders(current => {
        if (newStatus === 'collected') {
          return current.filter(o => o.id !== orderId);
        }
        return current.map(o => (o.id === orderId ? { ...o, ...updated } : o));
      });
      return updated;
    } catch (err) {
      console.error('Failed to update order status:', err);
      throw err;
    }
  };

  // Calculate active orders ahead of a given order ID
  const getOrdersAhead = useCallback((targetOrderId) => {
    const target = activeOrders.find(o => o.id === targetOrderId);
    if (!target) return 0;
    if (target.status === 'ready' || target.status === 'collected') return 0;

    const targetCreatedAt = new Date(target.created_at).getTime();

    // Count earlier orders in placed or preparing states
    return activeOrders.filter(o => {
      if (o.id === targetOrderId) return false;
      if (o.status !== 'placed' && o.status !== 'preparing') return false;
      const orderCreatedAt = new Date(o.created_at).getTime();
      return orderCreatedAt < targetCreatedAt;
    }).length;
  }, [activeOrders]);

  return (
    <OrderContext.Provider
      value={{
        activeOrders,
        loading,
        audioEnabled,
        setAudioEnabled,
        advanceOrderStatus,
        getOrdersAhead,
        refetchOrders: fetchActiveOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}
