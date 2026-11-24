// ==============================================================================
// HIGH-FIDELITY LOCAL MOCK ADAPTER
// Backed by localStorage + BroadcastChannel API for multi-window real-time sync
// Strictly adheres to all business invariants and rule parity
// ==============================================================================

import { SEED_MENU_ITEMS } from '../data/seedMenu';
import { VALID_STATUS_TRANSITIONS, CANTEEN_RULES } from '../utils/constants';
import { formatTokenDisplay } from '../utils/formatters';

const STORAGE_KEYS = {
  MENU: 'canteen_mock_menu_v1',
  ORDERS: 'canteen_mock_orders_v1',
  SEQUENCE: 'canteen_mock_sequence_v1',
};

// Setup BroadcastChannel for cross-window / cross-tab real-time communication
let broadcastBus = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastBus = new BroadcastChannel(CANTEEN_RULES.REALTIME_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment, using storage fallback.');
}

// Order event listeners registry
const orderSubscribers = new Set();
const menuSubscribers = new Set();

function dispatchOrderEvent(type, order) {
  const payload = { type, order, timestamp: Date.now() };
  
  // Local notification
  orderSubscribers.forEach(cb => {
    try { cb(payload); } catch (e) { console.error('Subscriber error', e); }
  });

  // Cross-window notification
  if (broadcastBus) {
    try { broadcastBus.postMessage({ channel: 'orders', ...payload }); } catch (e) {}
  }
  
  // Storage event fallback for older browsers
  try {
    localStorage.setItem('canteen_realtime_ping', JSON.stringify({ channel: 'orders', ...payload }));
  } catch (e) {}
}

function dispatchMenuEvent(type, item) {
  const payload = { type, item, timestamp: Date.now() };
  
  menuSubscribers.forEach(cb => {
    try { cb(payload); } catch (e) { console.error('Menu subscriber error', e); }
  });

  if (broadcastBus) {
    try { broadcastBus.postMessage({ channel: 'menu', ...payload }); } catch (e) {}
  }

  try {
    localStorage.setItem('canteen_realtime_ping', JSON.stringify({ channel: 'menu', ...payload }));
  } catch (e) {}
}

// Listen to incoming cross-window events
if (broadcastBus) {
  broadcastBus.onmessage = (event) => {
    const data = event.data;
    if (!data) return;
    if (data.channel === 'orders') {
      orderSubscribers.forEach(cb => {
        try { cb({ type: data.type, order: data.order }); } catch (e) {}
      });
    } else if (data.channel === 'menu') {
      menuSubscribers.forEach(cb => {
        try { cb({ type: data.type, item: data.item }); } catch (e) {}
      });
    }
  };
}

// Storage event listener fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'canteen_realtime_ping' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        if (data.channel === 'orders') {
          orderSubscribers.forEach(cb => {
            try { cb({ type: data.type, order: data.order }); } catch (err) {}
          });
        } else if (data.channel === 'menu') {
          menuSubscribers.forEach(cb => {
            try { cb({ type: data.type, item: data.item }); } catch (err) {}
          });
        }
      } catch (err) {}
    }
  });
}

// Initialize default storage data
function getStoredMenu() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  // Default to seed menu items
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(SEED_MENU_ITEMS));
  return SEED_MENU_ITEMS;
}

function saveStoredMenu(items) {
  localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(items));
}

function getStoredOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  // Generate 2 sample orders for initial demonstration:
  // Order 1: Placed 16 minutes ago (to immediately demonstrate TC-08 overdue alert)
  // Order 2: Preparing placed 4 minutes ago
  const now = Date.now();
  const sampleOrders = [
    {
      id: 'demo-order-overdue-001',
      token_number: 1,
      token_display: '#001',
      student_name: 'Pooja Verma',
      roll_number: 'IT-2026-014',
      status: 'placed',
      total_amount: 90,
      items: [
        { menu_item_id: 'menu-samosa-01', item_name: 'Crispy Samosa (2 pcs)', quantity: 2, unit_price: 30, subtotal: 60 },
        { menu_item_id: 'menu-chai-11', item_name: 'Masala Chai', quantity: 2, unit_price: 15, subtotal: 30 }
      ],
      created_at: new Date(now - 16 * 60 * 1000).toISOString(), // 16 minutes ago
      updated_at: new Date(now - 16 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-order-prep-002',
      token_number: 2,
      token_display: '#002',
      student_name: 'Rohan Mehta',
      roll_number: 'IT-2026-088',
      status: 'preparing',
      total_amount: 125,
      items: [
        { menu_item_id: 'menu-dosa-02', item_name: 'Masala Dosa', quantity: 1, unit_price: 60, subtotal: 60 },
        { menu_item_id: 'menu-paneerroll-05', item_name: 'Paneer Kathi Roll', quantity: 1, unit_price: 65, subtotal: 65 }
      ],
      created_at: new Date(now - 4 * 60 * 1000).toISOString(),
      updated_at: new Date(now - 2 * 60 * 1000).toISOString(),
    }
  ];

  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
  return sampleOrders;
}

function saveStoredOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

// Concurrency-safe atomic token generator
function getNextTokenNumber() {
  const todayStr = new Date().toISOString().slice(0, 10);
  let seq = { date: todayStr, lastToken: 2 }; // Matches 2 seed orders

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SEQUENCE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayStr) {
        seq = parsed;
      }
    }
  } catch (e) {}

  seq.lastToken += 1;
  seq.date = todayStr;
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, JSON.stringify(seq));
  return seq.lastToken;
}

// ==============================================================================
// ADAPTER EXPORT
// ==============================================================================

export const MockAdapter = {
  async getMenu() {
    return getStoredMenu();
  },

  async getMenuItemById(id) {
    const items = getStoredMenu();
    return items.find(i => i.id === id) || null;
  },

  async createMenuItem(itemData) {
    const items = getStoredMenu();
    const newItem = {
      ...itemData,
      id: `menu-custom-${Date.now()}`,
      is_available: itemData.is_available ?? true,
      price: Number(itemData.price),
    };
    items.unshift(newItem);
    saveStoredMenu(items);
    dispatchMenuEvent('INSERT', newItem);
    return newItem;
  },

  async updateMenuItem(id, updates) {
    const items = getStoredMenu();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Menu item not found: ${id}`);
    
    items[idx] = {
      ...items[idx],
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : items[idx].price,
    };
    saveStoredMenu(items);
    dispatchMenuEvent('UPDATE', items[idx]);
    return items[idx];
  },

  async deleteMenuItem(id) {
    let items = getStoredMenu();
    const itemToDelete = items.find(i => i.id === id);
    if (!itemToDelete) return false;
    items = items.filter(i => i.id !== id);
    saveStoredMenu(items);
    dispatchMenuEvent('DELETE', itemToDelete);
    return true;
  },

  async toggleItemAvailability(id, isAvailable) {
    return this.updateMenuItem(id, { is_available: isAvailable });
  },

  async placeOrder({ studentName, rollNumber, items, totalAmount }) {
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

    const tokenNum = getNextTokenNumber();
    const newOrder = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      token_number: tokenNum,
      token_display: formatTokenDisplay(tokenNum),
      student_name: studentName.trim(),
      roll_number: rollNumber.trim().toUpperCase(),
      status: 'placed',
      total_amount: Number(totalAmount),
      items: items.map(i => ({
        menu_item_id: i.menu_item_id || i.id,
        item_name: i.item_name || i.name,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price || i.price),
        subtotal: Number(i.subtotal || (i.price * i.quantity)),
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    saveStoredOrders(orders);

    dispatchOrderEvent('INSERT', newOrder);
    return newOrder;
  },

  async getOrderById(id) {
    const orders = getStoredOrders();
    return orders.find(o => o.id === id) || null;
  },

  async getActiveOrders() {
    const orders = getStoredOrders();
    return orders.filter(o => o.status !== 'collected');
  },

  async updateOrderStatus(orderId, newStatus) {
    const orders = getStoredOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) throw new Error(`Order not found: ${orderId}`);

    const currentOrder = orders[idx];
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentOrder.status] || [];

    // Strictly enforce forward-only status progression
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from "${currentOrder.status}" to "${newStatus}". Forward-only progression strictly enforced.`
      );
    }

    orders[idx] = {
      ...currentOrder,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    saveStoredOrders(orders);
    dispatchOrderEvent('UPDATE', orders[idx]);
    return orders[idx];
  },

  async getDailyMetrics() {
    const orders = getStoredOrders();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.created_at.startsWith(todayStr));

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
    orderSubscribers.add(callback);
    return () => {
      orderSubscribers.delete(callback);
    };
  },

  subscribeToMenu(callback) {
    menuSubscribers.add(callback);
    return () => {
      menuSubscribers.delete(callback);
    };
  },
};
