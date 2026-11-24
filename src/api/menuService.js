// ==============================================================================
// MENU SERVICE
// High-level service facade abstracting Supabase vs. Mock storage
// ==============================================================================

import { activeMode } from './client';
import { SupabaseAdapter } from './supabaseAdapter';
import { MockAdapter } from './mockAdapter';

function getAdapter() {
  return activeMode === 'supabase' ? SupabaseAdapter : MockAdapter;
}

export const menuService = {
  getMenu: () => getAdapter().getMenu(),
  getMenuItemById: (id) => getAdapter().getMenuItemById(id),
  createMenuItem: (item) => getAdapter().createMenuItem(item),
  updateMenuItem: (id, updates) => getAdapter().updateMenuItem(id, updates),
  deleteMenuItem: (id) => getAdapter().deleteMenuItem(id),
  toggleItemAvailability: (id, isAvailable) => getAdapter().toggleItemAvailability(id, isAvailable),
  subscribeToMenu: (cb) => getAdapter().subscribeToMenu(cb),
};
