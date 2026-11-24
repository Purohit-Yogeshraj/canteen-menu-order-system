// ==============================================================================
// LIVE SUPABASE POSTGRESQL + REALTIME CDC ADAPTER
// ==============================================================================

import { supabaseInstance } from './client';
import { VALID_STATUS_TRANSITIONS, CANTEEN_RULES } from '../utils/constants';

export const SupabaseAdapter = {
  async getMenu() {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { data, error } = await supabaseInstance
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getMenuItemById(id) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { data, error } = await supabaseInstance
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async createMenuItem(itemData) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { data, error } = await supabaseInstance
      .from('menu_items')
      .insert([{
        name: itemData.name,
        category: itemData.category,
        price: Number(itemData.price),
        is_veg: itemData.is_veg,
        description: itemData.description || '',
        image_url: itemData.image_url || '',
        is_available: itemData.is_available ?? true,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMenuItem(id, updates) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const payload = { ...updates, updated_at: new Date().toISOString() };
    if (payload.price !== undefined) payload.price = Number(payload.price);

    const { data, error } = await supabaseInstance
      .from('menu_items')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMenuItem(id) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { error } = await supabaseInstance
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async toggleItemAvailability(id, isAvailable) {
    return this.updateMenuItem(id, { is_available: isAvailable });
  },

  async placeOrder({ studentName, rollNumber, items, totalAmount }) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');

    if (!studentName || !rollNumber) {
      throw new Error('Student name and roll number are mandatory');
    }
    if (!items || items.length === 0) {
      throw new Error('Cannot place an empty order');
    }

    // Validate max 10 per item rule
    for (const item of items) {
      if (item.quantity > CANTEEN_RULES.MAX_QUANTITY_PER_ITEM) {
        throw new Error(`Maximum ${CANTEEN_RULES.MAX_QUANTITY_PER_ITEM} units allowed for ${item.item_name}`);
      }
    }

    // Call atomic PostgreSQL RPC function
    const formattedItems = items.map(i => ({
      menu_item_id: i.menu_item_id || i.id,
      item_name: i.item_name || i.name,
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price || i.price),
      subtotal: Number(i.subtotal || (i.price * i.quantity)),
    }));

    const { data, error } = await supabaseInstance.rpc('create_canteen_order', {
      p_student_name: studentName.trim(),
      p_roll_number: rollNumber.trim().toUpperCase(),
      p_total_amount: Number(totalAmount),
      p_items: formattedItems,
    });

    if (error) throw error;

    // Fetch the created full order record with line items
    return this.getOrderById(data.order_id);
  },

  async getOrderById(id) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { data, error } = await supabaseInstance
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  },

  async getActiveOrders() {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const { data, error } = await supabaseInstance
      .from('orders')
      .select('*, items:order_items(*)')
      .neq('status', 'collected')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async updateOrderStatus(orderId, newStatus) {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');

    // First fetch current order to check forward-only transition
    const currentOrder = await this.getOrderById(orderId);
    if (!currentOrder) throw new Error(`Order not found: ${orderId}`);

    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentOrder.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from "${currentOrder.status}" to "${newStatus}". Forward-only progression strictly enforced.`
      );
    }

    const { data, error } = await supabaseInstance
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*, items:order_items(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async getDailyMetrics() {
    if (!supabaseInstance) throw new Error('Supabase client not initialized');
    const todayStr = new Date().toISOString().slice(0, 10);

    const { data: orders, error } = await supabaseInstance
      .from('orders')
      .select('*, items:order_items(*)')
      .gte('created_at', `${todayStr}T00:00:00.000Z`)
      .lte('created_at', `${todayStr}T23:59:59.999Z`);

    if (error) throw error;

    const todayOrders = orders || [];
    const totalOrdersCount = todayOrders.length;
    const grossSales = todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    let itemsPrepared = 0;
    const itemCounts = {};

    todayOrders.forEach(order => {
      order.items?.forEach(item => {
        itemsPrepared += Number(item.quantity) || 0;
        const name = item.item_name;
        itemCounts[name] = (itemCounts[name] || 0) + Number(item.quantity);
      });
    });

    let topSeller = 'None yet';
    let maxCount = 0;
    for (const [name, count] of Object.entries(itemCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topSeller = `${name} (${count} sold)`;
      }
    }

    return {
      todayOrders: totalOrdersCount,
      grossSales,
      itemsPrepared,
      topSeller,
    };
  },

  subscribeToOrders(callback) {
    if (!supabaseInstance) return () => {};

    const channel = supabaseInstance
      .channel('public:orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async (payload) => {
          // Re-fetch full order with items if updated or inserted
          if (payload.new && payload.new.id) {
            const fullOrder = await this.getOrderById(payload.new.id);
            callback({ type: payload.eventType, order: fullOrder || payload.new });
          } else {
            callback({ type: payload.eventType, order: payload.old });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseInstance.removeChannel(channel);
    };
  },

  subscribeToMenu(callback) {
    if (!supabaseInstance) return () => {};

    const channel = supabaseInstance
      .channel('public:menu_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items' },
        (payload) => {
          callback({ type: payload.eventType, item: payload.new || payload.old });
        }
      )
      .subscribe();

    return () => {
      supabaseInstance.removeChannel(channel);
    };
  },
};
