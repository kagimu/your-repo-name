import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  id: number;                 // This represents product_id from API
  name: string;
  price: number;
  quantity: number;
  image: string;              // This is the "avatar" field from API
  category?: string;
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
  const { token } = useAuth();

  const fetchCart = async () => {
    if (!token) {
      setItems([]);
      return;
    }

    try {
      const response = await axios.get<{ cart: any[] }>('https://edumall-admin.up.railway.app/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cartData: CartItem[] = response.data.cart.map((item) => ({
        id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.avatar,
        category: item.category || '',
        unit: item.unit || '',
      }));

      setItems(cartData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (product: CartItem) => {
    if (!token) {
      console.warn('User not authenticated');
      return;
    }

    try {
      await axios.post(
        'https://edumall-admin.up.railway.app/api/cart/add',
        { product_id: product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!token) return;

    try {
      await axios.delete(`https://edumall-admin.up.railway.app/api/cart/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!token) return;

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await axios.put(
        `https://edumall-admin.up.railway.app/api/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartCount = () => items.length;

  const getCartTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
