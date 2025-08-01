import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  avatar_url?: string;
  images_url?: string[];
  category: string;
  inStock: boolean;
  rating: number;
  description: string;
  unit: string;
  specifications: Record<string, string>;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("User is not authenticated");
      return;
    }

    try {
      await axios.post(
        'https://admin.edumallug.com/api/cart/add',
        {
          product_id: product.id,
          name: product.name,
          avatar_url: product.avatar_url || product.images_url?.[0],
          quantity: quantity
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      addToCart({
        ...product,
        image: product.images_url?.[0],
        quantity
      });

      onClose();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
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
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={product.images_url?.[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.images_url?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
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

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.rating})</span>
                  </div>
                  <span className="text-sm text-teal-600 font-medium bg-teal-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-teal-600">{formatPrice(product.price)}</span>
                    <span className="text-gray-900">per {product.unit}</span>
                  </div>
                  <p className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>

                <p className="text-gray-900">{product.description}</p>

                {/* Specifications */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-900">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <EdumallButton
                  variant="primary"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full"
                >
                  <ShoppingCart size={20} />
                  Add {quantity} to Cart
                </EdumallButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 