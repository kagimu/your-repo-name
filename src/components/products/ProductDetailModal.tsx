import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { useCart } from '../../hooks/useCart';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

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

export const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false); // 🔹 NEW STATE
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please log in to add products to your cart.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true); // 🔹 Start loading
      await axios.post(
        'https://backend-main.laravel.cloud/api/cart/add',
        {
          product_id: product.id,
          name: product.name,
          avatar_url: product.avatar_url || product.images_url?.[0],
          quantity,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      addToCart({ ...product, image: product.images_url?.[0], quantity });

      toast({
        title: 'Added to Cart 🛒',
        description: `${product.name} has been added to your cart.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error Adding to Cart',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      console.error('Add to cart failed:', error);
    } finally {
      setLoading(false); // 🔹 Stop loading
    }
  };

  const handleCategoryClick = () => {
    onClose();
    navigate(`/categories?filter=${encodeURIComponent(product.category)}`);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Edumall Uganda</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Toaster />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
                    <img
                      src={product.images_url?.[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {product.images_url?.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-teal-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-5">
                  {/* Rating + Category */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.rating})</span>

                    <button
                      onClick={handleCategoryClick}
                      className="ml-auto text-xs sm:text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full hover:bg-teal-100 transition"
                    >
                      {product.category}
                    </button>
                  </div>

                  {/* Price & Stock */}
                  <div>
                    <span className="text-3xl font-bold text-teal-600">
                      {formatPrice(product.price)}
                    </span>
                    <p className="text-gray-600 text-sm mt-1">
                      per {product.unit} —{' '}
                      <span
                        className={`font-semibold ${
                          product.inStock ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-800 text-sm leading-relaxed">{product.description}</p>

                  {/* Quantity & Add to Cart */}
                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>

                    <QuantityInput
                      itemId={product.id}
                      quantity={quantity}
                      updateQuantity={(id, qty) => setQuantity(qty)}
                      isLoading={loading}
                    />

                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>

                    {/* ✅ Add to Cart with Spinner */}
                    <EdumallButton
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={!product.inStock || loading}
                      className="ml-auto flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Add {quantity} to Cart
                        </>
                      )}
                    </EdumallButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
