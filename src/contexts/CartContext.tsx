import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  unit?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const token = localStorage.getItem('token'); // adjust auth logic as needed

  // Fetch cart items from API on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get<{ cart: CartItem[] }>('http://127.0.0.1:8000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(response.data.cart || []);
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };
    fetchCart();
  }, [token]);

  const addToCart = async (product: CartItem) => {
    try {
      // Example API call - adjust endpoint and payload as per your backend
      await axios.post('http://127.0.0.1:8000/api/cart', { product_id: product.id, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state by refetching or optimistic update:
      setItems(prev => {
        const existing = prev.find(i => i.id === product.id);
        if (existing) {
          return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:8000/api/cart/${id}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = () => {
    setItems([]);
    // Optionally also clear on backend if you have that API endpoint
  };

  const getCartCount = () => items.reduce((sum, item) => sum + item.quantity, 0);

  const getCartTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartCount,
      getCartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
