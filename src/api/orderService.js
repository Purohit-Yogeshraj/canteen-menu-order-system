// ==============================================================================
// ORDER SERVICE
// High-level service facade abstracting Supabase vs. Mock storage
// ==============================================================================

import { activeMode } from './client';
import { SupabaseAdapter } from './supabaseAdapter';
import { MockAdapter } from './mockAdapter';

function getAdapter() {
  return activeMode === 'supabase' ? SupabaseAdapter : MockAdapter;
}

export const orderService = {
  placeOrder: (orderData) => getAdapter().placeOrder(orderData),
  getOrderById: (id) => getAdapter().getOrderById(id),
  getActiveOrders: () => getAdapter().getActiveOrders(),
  updateOrderStatus: (orderId, newStatus) => getAdapter().updateOrderStatus(orderId, newStatus),
  getDailyMetrics: () => getAdapter().getDailyMetrics(),
  subscribeToOrders: (cb) => getAdapter().subscribeToOrders(cb),
};
