// ==============================================================================
// MENU CONTEXT
// Manages food catalog state, filtering, and real-time stock synchronization
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuService } from '../api/menuService';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'nonveg'

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenu();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load menu items:', err);
      setError('Unable to load menu. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();

    // Subscribe to real-time menu changes (stock toggling, price edits, additions)
    const unsubscribe = menuService.subscribeToMenu(({ type, item }) => {
      setMenuItems(currentItems => {
        if (type === 'INSERT') {
          return [item, ...currentItems.filter(i => i.id !== item.id)];
        } else if (type === 'UPDATE') {
          return currentItems.map(i => (i.id === item.id ? { ...i, ...item } : i));
        } else if (type === 'DELETE') {
          return currentItems.filter(i => i.id !== item.id);
        }
        return currentItems;
      });
    });

    return () => unsubscribe();
  }, []);

  // Filtered items computation
  const filteredItems = menuItems.filter(item => {
    // 1. Category Filter
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    // 2. Veg/Non-Veg Filter
    if (vegFilter === 'veg' && !item.is_veg) return false;
    if (vegFilter === 'nonveg' && item.is_veg) return false;

    // 3. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      return matchName || matchDesc || matchCategory;
    }

    return true;
  });

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        filteredItems,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        vegFilter,
        setVegFilter,
        refetchMenu: fetchMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error('useMenu must be used within a MenuProvider');
  return context;
}
