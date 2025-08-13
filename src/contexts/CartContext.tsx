import React, { useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { CartContext } from './cart-context';
import { CartItem, ApiCartItem } from './cart-types';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { token } = useAuth();

  const fetchCart = async () => {
    if (!token) {
      setItems([]);
      return;
    }

    try {
      const response = await axios.get<{ cart: ApiCartItem[] }>('https://edumall-main-khkttx.laravel.cloud/api/cart', {
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
        'https://edumall-main-khkttx.laravel.cloud/api/cart/add',
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
      await axios.delete(`https://edumall-main-khkttx.laravel.cloud/api/cart/remove/${productId}`, {
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
        `https://edumall-main-khkttx.laravel.cloud/api/cart/${productId}`,
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
