import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const QuantityInput = ({ itemId, quantity, updateQuantity, isLoading }) => {
  const [inputValue, setInputValue] = useState(quantity.toString());
  const debounceTimeout = useRef(null);

  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  const handleChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) {
          updateQuantity(itemId, parsed);
        }
      }, 500);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      updateQuantity(itemId, parsed);
    } else {
      setInputValue(quantity.toString());
    }
  };

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={isLoading}
      className="w-16 text-center rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
      inputMode="numeric"
      pattern="[0-9]*"
    />
  );
};

const Cart = () => {
  const { token, user, isAuthenticated } = useAuth();
  const { items, updateQuantity, removeFromCart, getCartTotal, pendingCheckoutDetails } = useCart();
  const [loadingItemId, setLoadingItemId] = useState(null);
  const navigate = useNavigate();
  const [showMobileControls, setShowMobileControls] = useState(false);

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string) => {
    console.log('Processing image path:', imagePath);
    
    if (!imagePath) return '/placeholder.svg';

    // Extract actual URL if it's embedded in a storage path
    if (imagePath.includes('/storage/https://')) {
      const actualUrl = imagePath.split('/storage/')[1];
      console.log('Extracted URL from storage path:', actualUrl);
      return actualUrl;
    }
    
    // If it's an imghippo URL or any full URL
    if (imagePath.includes('imghippo.com') || imagePath.startsWith('http')) {
      console.log('Using direct URL:', imagePath);
      return imagePath;
    }
    
    // Handle storage paths
    if (imagePath.startsWith('/storage/')) {
      return `https://edumall-main-khkttx.laravel.cloud${imagePath}`;
    }
    
    return `https://edumall-main-khkttx.laravel.cloud/storage/${imagePath}`;
  };

  // Debug logged in state and image paths
  useEffect(() => {
    if (items.length > 0) {
      console.log('Auth state:', { isAuthenticated, token: !!token });
      items.forEach(item => {
        console.log('Item image processing:', {
          original: item.image,
          processed: getImageUrl(item.image)
        });
      });
    }
  }, [items, isAuthenticated, token]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);

  const handleRemoveItem = async (productId) => {
    setLoadingItemId(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Remove failed:', err);
      alert('Could not remove item.');
    } finally {
      setLoadingItemId(null);
    }
  };

  const subtotal = getCartTotal();
  const total = subtotal; // delivery fee calculated in checkout

  // Check if user has a pending order
  const hasPendingOrder = pendingCheckoutDetails?.status === 'pending';

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <CustomCursor />
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl"
            >
              <ShoppingBag size={64} className="mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Browse our categories to find what you need.</p>
              <Link to="/categories">
                <EdumallButton variant="primary" size="lg">
                  Start Shopping
                </EdumallButton>
              </Link>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
            <p className="text-gray-600">Review your items and proceed to checkout.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4 mb-6 lg:mb-0">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl bg-gray-50"
                      loading="lazy"
                      onError={(e) => {
                        const fallbackUrl = '/placeholder.svg';
                        if (e.currentTarget.src !== fallbackUrl) {
                          e.currentTarget.src = fallbackUrl;
                        }
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.category}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loadingItemId === item.id}
                          className="text-red-500 hover:text-red-700 p-2 sm:hidden"
                        >
                          {loadingItemId === item.id ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={20} />
                          )}
                        </button>
                      </div>

                      <div className="mt-2">
                        <p className="text-lg font-bold text-teal-600">{formatPrice(item.price)}</p>
                        {item.unit && <p className="text-xs text-gray-500">per {item.unit}</p>}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={loadingItemId === item.id}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus size={16} />
                        </button>
                        <QuantityInput
                          itemId={item.id}
                          quantity={item.quantity}
                          updateQuantity={updateQuantity}
                          isLoading={loadingItemId === item.id}
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={loadingItemId === item.id}
                          className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      {/* Total Price and Remove Button */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={loadingItemId === item.id}
                          className="text-red-500 hover:text-red-700 hidden sm:block"
                        >
                          {loadingItemId === item.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary - Visible on all devices */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border shadow-lg lg:sticky lg:top-24 mb-24 lg:mb-0"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                {hasPendingOrder && (
                  <p className="text-red-600 text-sm mb-4">
                    You have a pending order. Please complete or cancel it before placing a new order.
                  </p>
                )}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery Fee</span>
                    <span className="text-gray-500 italic">To be confirmed</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-teal-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {!isAuthenticated ? (
                    <>
                      <EdumallButton
                        variant="primary"
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white"
                        onClick={() => navigate('/checkout', { state: { items, subtotal, mode: 'guest' } })}
                      >
                        Continue as Guest
                        <ArrowRight size={18} className="ml-2" />
                      </EdumallButton>
                      <EdumallButton
                        variant="secondary"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate('/login', { state: { from: '/cart' } })}
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        Login to Checkout
                      </EdumallButton>
                      <p className="text-sm text-gray-600 text-center">
                        Login to save your cart and access more features
                      </p>
                    </>
                  ) : (
                    <EdumallButton
                      variant="primary"
                      size="lg"
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white"
                      disabled={hasPendingOrder}
                      onClick={() => navigate('/checkout', { state: { items, subtotal } })}
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} className="ml-2" />
                    </EdumallButton>
                  )}
                </div>

                {hasPendingOrder && (
                  <p className="text-sm text-red-600 mt-2">
                    Please complete or cancel your pending order before placing a new one.
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
