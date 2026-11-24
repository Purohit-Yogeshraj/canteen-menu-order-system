// ==============================================================================
// CART CONTEXT
// Manages shopping cart, quantity clamping (1-10), roll number validation,
// and real-time sold-out item eviction
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CANTEEN_RULES } from '../utils/constants';
import { menuService } from '../api/menuService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('canteen_active_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('canteen_student_name') || '';
  });

  const [rollNumber, setRollNumber] = useState(() => {
    return localStorage.getItem('canteen_student_roll') || '';
  });

  const [evictedNotice, setEvictedNotice] = useState(null);

  // Persist cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('canteen_active_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('canteen_student_name', studentName);
      localStorage.setItem('canteen_student_roll', rollNumber);
    } catch (e) {}
  }, [studentName, rollNumber]);

  // Real-time stock reconciler:
  // If an item in cart is updated to is_available === false, evict it immediately!
  useEffect(() => {
    const unsubscribe = menuService.subscribeToMenu(({ type, item }) => {
      if (type === 'UPDATE' && item.is_available === false) {
        setCartItems(currentCart => {
          const itemInCart = currentCart.find(c => c.id === item.id);
          if (itemInCart) {
            setEvictedNotice(
              `"${item.name}" was just marked sold out by the kitchen and was removed from your cart.`
            );
            return currentCart.filter(c => c.id !== item.id);
          }
          return currentCart;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const addToCart = (product) => {
    if (!product.is_available) return;

    setCartItems(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= CANTEEN_RULES.MAX_QUANTITY_PER_ITEM) {
          return current; // Max 10 reached
        }
        return current.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCartItems(current => {
      return current
        .map(item => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null; // Remove
            if (nextQty > CANTEEN_RULES.MAX_QUANTITY_PER_ITEM) {
              return { ...item, quantity: CANTEEN_RULES.MAX_QUANTITY_PER_ITEM };
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(current => current.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  // Computations
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; // 0 extra packaging fee for transparent college pricing

  const isFormValid = studentName.trim().length >= 2 && rollNumber.trim().length >= 3 && cartItems.length > 0;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItemsCount,
        subtotal,
        total,
        studentName,
        setStudentName,
        rollNumber,
        setRollNumber,
        isFormValid,
        evictedNotice,
        clearEvictedNotice: () => setEvictedNotice(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
