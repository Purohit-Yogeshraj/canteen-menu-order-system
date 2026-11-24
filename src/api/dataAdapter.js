// ==============================================================================
// DATA ADAPTER STRICT INTERFACE CONTRACT
// Both SupabaseAdapter and MockAdapter implement this exact contract.
// ==============================================================================

/**
 * @typedef {Object} MenuItem
 * @property {string} id
 * @property {string} name
 * @property {string} category ('Snacks'|'Meals'|'Beverages'|'Desserts')
 * @property {number} price
 * @property {boolean} is_veg
 * @property {string} [description]
 * @property {string} [image_url]
 * @property {boolean} is_available
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} [menu_item_id]
 * @property {string} item_name
 * @property {number} quantity
 * @property {number} unit_price
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {number} token_number
 * @property {string} token_display (e.g. #042)
 * @property {string} student_name
 * @property {string} roll_number
 * @property {'placed'|'preparing'|'ready'|'collected'} status
 * @property {number} total_amount
 * @property {OrderItem[]} items
 * @property {string} created_at
 * @property {string} updated_at
 */

export const DataAdapterInterface = {
  getMenu: '() => Promise<MenuItem[]>',
  getMenuItemById: '(id: string) => Promise<MenuItem|null>',
  createMenuItem: '(item: Omit<MenuItem, "id">) => Promise<MenuItem>',
  updateMenuItem: '(id: string, updates: Partial<MenuItem>) => Promise<MenuItem>',
  deleteMenuItem: '(id: string) => Promise<boolean>',
  toggleItemAvailability: '(id: string, isAvailable: boolean) => Promise<MenuItem>',
  
  placeOrder: '(orderData: { studentName: string, rollNumber: string, items: OrderItem[], totalAmount: number }) => Promise<Order>',
  getOrderById: '(id: string) => Promise<Order|null>',
  getActiveOrders: '() => Promise<Order[]>',
  updateOrderStatus: '(orderId: string, newStatus: string) => Promise<Order>',
  getDailyMetrics: '() => Promise<{ todayOrders: number, grossSales: number, itemsPrepared: number, topSeller: string }>',
  
  subscribeToOrders: '(callback: (event: { type: string, order: Order }) => void) => () => void',
  subscribeToMenu: '(callback: (event: { type: string, item: MenuItem }) => void) => () => void',
};
