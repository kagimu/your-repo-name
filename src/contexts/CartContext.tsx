import React, { useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from './cart-context';
import { CartItem, ApiCartItem, PendingCheckoutDetails, CartContextType } from './cart-types';

const LOCAL_STORAGE_KEY = 'guest_cart';
const PENDING_CHECKOUT_KEY = 'pendingCheckoutDetails';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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
    setIsLoading(true);
    setError(null);
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
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  /** -----------------
   * Initialize Cart
   ------------------ */
  useEffect(() => {
    const initializeCart = async () => {
      console.log('[CartContext] Initializing cart', { isAuthenticated, hasToken: !!token });
      setIsLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated && token) {
          console.log('[CartContext] User is authenticated, fetching auth cart');
          await fetchAuthCart();
          
          // Check if we have guest cart items that need to be merged
          const guestCart = loadGuestCart();
          if (guestCart.length > 0) {
            console.log('[CartContext] Found guest cart items during init, triggering merge');
            await mergeGuestCart();
          }
        } else {
          console.log('[CartContext] Loading guest cart');
          const guestItems = loadGuestCart();
          console.log('[CartContext] Guest cart items:', guestItems);
          setItems(guestItems);
        }
      } catch (err) {
        console.error('[CartContext] Error initializing cart:', err);
        setError('Failed to load cart');
        if (isAuthenticated) {
          const guestItems = loadGuestCart();
          console.log('[CartContext] Falling back to guest cart:', guestItems);
          setItems(guestItems);
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    // Load initial cart data
    initializeCart();
  }, [isAuthenticated, token, fetchAuthCart]);

  /** -----------------
   * Cart Operations
   ------------------ */
  const addToCart = async (product: CartItem, qty = 1) => {
    setError(null);
    if (isAuthenticated && token) {
      try {
        await axios.post(
          'https://edumall-main-khkttx.laravel.cloud/api/cart/add',
          { 
            product_id: product.id, 
            quantity: qty 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuthCart();
      } catch (err) {
        console.error('Error adding to authenticated cart:', err);
        setError('Failed to add item to cart');
      }
    } else {
      const existingItem = items.find((i) => i.id === product.id);
      if (existingItem) {
        const updatedCart = items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
        saveGuestCart(updatedCart);
      } else {
        saveGuestCart([...items, { ...product, quantity: qty }]);
      }
    }
  };

  const removeFromCart = async (productId: number) => {
    setError(null);
    if (isAuthenticated && token) {
      try {
        await axios.delete(
          `https://edumall-main-khkttx.laravel.cloud/api/cart/remove/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await fetchAuthCart();
      } catch (err) {
        console.error('Error removing from authenticated cart:', err);
        setError('Failed to remove item from cart');
      }
    } else {
      const updatedCart = items.filter((i) => i.id !== productId);
      saveGuestCart(updatedCart);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    setError(null);
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
        setError('Failed to update quantity');
      }
    } else {
      const updatedCart = items.map((i) =>
        i.id === productId ? { ...i, quantity } : i
      );
      saveGuestCart(updatedCart);
    }
  };

  const clearCart = async () => {
    console.log('[CartContext] Clearing cart', { isAuthenticated, hasToken: !!token });
    setError(null);
    
    if (isAuthenticated && token) {
      try {
        console.log('[CartContext] Clearing authenticated cart');
        // Remove each item individually since clear endpoint doesn't work
        const currentItems = [...items];
        const deletePromises = currentItems.map(item =>
          axios.delete(
            `https://edumall-main-khkttx.laravel.cloud/api/cart/remove/${item.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );
        await Promise.all(deletePromises);
        
        // Verify cart is empty
        await fetchAuthCart();
        
        // If any items remain, try one more time
        if (items.length > 0) {
          console.log('[CartContext] Items remain after first clear attempt, retrying');
          const remainingItems = [...items];
          const retryPromises = remainingItems.map(item =>
            axios.delete(
              `https://edumall-main-khkttx.laravel.cloud/api/cart/remove/${item.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
          await Promise.all(retryPromises);
          await fetchAuthCart();
        }

        // Only clear local storage if authenticated cart clear was successful
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (err) {
        console.error('[CartContext] Error clearing authenticated cart:', err);
        setError('Failed to clear cart');
        return; // Don't proceed with clearing local state on error
      }
    } else {
      // Only clear local storage for guest cart
      console.log('[CartContext] Clearing guest cart');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
    setItems([]);
    setPendingCheckoutDetails(null);
  };

  const getCartCount = () => items.length; // Count unique items instead of total quantity
  const getCartTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  /** -----------------
   * Merge Guest → Auth Cart
   ------------------ */
  const mergeGuestCart = useCallback(async () => {
    console.log('[CartContext] Starting cart merge process');
    setError(null);
    const guestCart = loadGuestCart();
    console.log('[CartContext] Guest cart items:', guestCart);
    
    if (!guestCart.length) {
      console.log('[CartContext] No guest cart items to merge');
      return;
    }
    
    if (!token) {
      console.log('[CartContext] No auth token available for merge');
      return;
    }

    try {
      console.log('[CartContext] Starting to add guest items to auth cart');
      for (const product of guestCart) {
        console.log('[CartContext] Adding product to auth cart:', { id: product.id, quantity: product.quantity });
        await axios.post(
          'https://edumall-main-khkttx.laravel.cloud/api/cart/add',
          { 
            product_id: product.id, 
            quantity: product.quantity
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      console.log('[CartContext] All guest items added, removing local storage');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      
      console.log('[CartContext] Fetching updated auth cart');
      await fetchAuthCart();
      console.log('[CartContext] Cart merge completed successfully');
    } catch (err) {
      console.error('[CartContext] Error merging guest cart:', err);
      setError('Failed to merge guest cart');
      // Don't remove local storage on error
      return false;
    }
  }, [token, fetchAuthCart]);

  // Initialize pending checkout details
  useEffect(() => {
    const pending = loadPendingCheckout();
    if (pending) {
      setPendingCheckoutDetails(pending);
    }
  }, []);

  const value: CartContextType = {
    items,
    isLoading,
    error,
    isInitialized,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    mergeGuestCart,
    pendingCheckoutDetails,
    savePendingCheckout,
    clearPendingCheckout,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
