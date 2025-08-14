import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from './cart-context';
import { CartItem, ApiCartItem, PendingCheckoutDetails } from './cart-types';

const LOCAL_STORAGE_KEY = 'guest_cart';
const PENDING_CHECKOUT_KEY = 'pendingCheckoutDetails';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pendingCheckoutDetails, setPendingCheckoutDetails] = useState<PendingCheckoutDetails | null>(null);

  const { token, isAuthenticated } = useAuth();

  /** -----------------
   * Local Cart Helpers
   ------------------ */
  const loadGuestCart = (): CartItem[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (cart: CartItem[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    setItems(cart);
  };

  const loadPendingCheckout = (): PendingCheckoutDetails | null => {
    try {
      const stored = localStorage.getItem(PENDING_CHECKOUT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const savePendingCheckout = (details: PendingCheckoutDetails) => {
    localStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(details));
    setPendingCheckoutDetails(details);
  };

  const clearPendingCheckout = () => {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
    setPendingCheckoutDetails(null);
  };

  /** -----------------
   * Fetch Auth Cart
   ------------------ */
  const fetchAuthCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get<{ cart: ApiCartItem[] }>(
        'https://edumall-main-khkttx.laravel.cloud/api/cart',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cartData: CartItem[] = res.data.cart.map((item) => ({
        id: item.product_id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.avatar,
        category: item.category || '',
        unit: item.unit || '',
      }));

      setItems(cartData);
    } catch (err) {
      console.error('Error fetching authenticated cart:', err);
    }
  }, [token]);

  /** -----------------
   * Merge Guest → Auth Cart
   ------------------ */
  const mergeGuestCartToAuthCart = useCallback(async () => {
    const guestCart = loadGuestCart();
    if (!guestCart.length || !token) return;

    try {
      for (const product of guestCart) {
        await axios.post(
          'https://edumall-main-khkttx.laravel.cloud/api/cart/add',
          { product_id: product.id, quantity: product.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      await fetchAuthCart();
    } catch (err) {
      console.error('Error merging guest cart:', err);
    }
  }, [token, fetchAuthCart]);

  /** -----------------
   * Initial Load
   ------------------ */
  useEffect(() => {
    const pending = loadPendingCheckout();
    if (pending) setPendingCheckoutDetails(pending);

    if (isAuthenticated && token) {
      mergeGuestCartToAuthCart();
    } else {
      setItems(loadGuestCart());
    }
  }, [isAuthenticated, token, mergeGuestCartToAuthCart]);

  /** -----------------
   * Cart Actions
   ------------------ */
  const addToCart = async (product: CartItem, qty = 1) => {
    if (isAuthenticated && token) {
      try {
        await axios.post(
          'https://edumall-main-khkttx.laravel.cloud/api/cart/add',
          { product_id: product.id, quantity: qty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuthCart();
      } catch (err) {
        console.error('Error adding to authenticated cart:', err);
      }
    } else {
      const updatedCart = [...items];
      const existing = updatedCart.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        updatedCart.push({ ...product, quantity: qty });
      }
      saveGuestCart(updatedCart);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (isAuthenticated && token) {
      try {
        await axios.delete(
          `https://edumall-main-khkttx.laravel.cloud/api/cart/remove/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuthCart();
      } catch (err) {
        console.error('Error removing from authenticated cart:', err);
      }
    } else {
      const updatedCart = items.filter((i) => i.id !== productId);
      saveGuestCart(updatedCart);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) return removeFromCart(productId);

    if (isAuthenticated && token) {
      try {
        await axios.put(
          `https://edumall-main-khkttx.laravel.cloud/api/cart/${productId}`,
          { quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuthCart();
      } catch (err) {
        console.error('Error updating quantity:', err);
      }
    } else {
      const updatedCart = items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
      saveGuestCart(updatedCart);
    }
  };

  const clearCart = async () => {
    if (isAuthenticated && token) {
      try {
        await axios.post(
          'https://edumall-main-khkttx.laravel.cloud/api/cart/clear',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error('Error clearing authenticated cart:', err);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setItems([]);
    clearPendingCheckout();
  };

  /** -----------------
   * Summary Helpers
   ------------------ */
  const getCartCount = () => items.reduce((sum, i) => sum + i.quantity, 0);
  const getCartTotal = () => items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTotal,
        mergeGuestCart: mergeGuestCartToAuthCart,
        pendingCheckoutDetails,
        savePendingCheckout,
        clearPendingCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
