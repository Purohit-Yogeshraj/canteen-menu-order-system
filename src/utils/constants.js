// ==============================================================================
// CANTEEN CONSTANTS & BUSINESS RULES
// ==============================================================================

export const CANTEEN_RULES = {
  // Operational Hours
  OPEN_HOUR: 8,       // 08:00 AM
  OPEN_MINUTE: 0,
  CUTOFF_HOUR: 16,    // 04:45 PM
  CUTOFF_MINUTE: 45,
  CLOSE_HOUR: 17,     // 05:00 PM
  CLOSE_MINUTE: 0,

  // Ordering constraints
  MAX_QUANTITY_PER_ITEM: 10,
  MIN_QUANTITY_PER_ITEM: 1,
  WAIT_TIME_PER_ORDER_MINUTES: 5,

  // Real-time synchronization target
  REALTIME_CHANNEL_NAME: 'canteen_realtime_bus',

  // Order status progression (strictly forward)
  STATUS: {
    PLACED: 'placed',
    PREPARING: 'preparing',
    READY: 'ready',
    COLLECTED: 'collected',
  },

  STATUS_LABELS: {
    placed: 'Order Placed',
    preparing: 'In Preparation',
    ready: 'Ready for Pickup',
    collected: 'Collected',
  },

  CATEGORIES: ['All', 'Snacks', 'Meals', 'Beverages', 'Desserts'],
};

// Valid next states to enforce strict forward-only progression
export const VALID_STATUS_TRANSITIONS = {
  placed: ['preparing'],
  preparing: ['ready'],
  ready: ['collected'],
  collected: [], // Terminal state
};
