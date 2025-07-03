
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductDetailModal } from './ProductDetailModal';
import { useCart } from '../../contexts/CartContext';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  avatar_url?: string;
  images_url?: string[];
  category: string;
  in_stock: boolean;
  rating: number;
  desc?: string;
  unit?: string;
  specifications?: Record<string, string>;
  purchaseType: 'purchase' | 'hire';
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

 const handleAddToCart = async () => {
  const cartItem = {
    product_id: product.id,
    quantity: 1, // You can make this dynamic
  };

  try {
     const token = localStorage.getItem('token');

    await axios.post('http://127.0.0.1:8000/api/cart', cartItem, {
      headers: {
       Authorization: `Bearer ${token}`,
      },
    });

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.avatar_url || product.images_url?.[0] || '/placeholder.svg',
      category: product.category,
      unit: product.unit,
    });
  } catch (error) {
    console.error('Failed to add to cart via API:', error);
  }
};


  const handleViewDetails = () => {
    setShowDetailModal(true);
  };

  const detailedProduct = {
    ...product,
    images_url: product.images_url || [product.avatar_url || '/placeholder.svg'],
    desc: product.desc || `High-quality ${product.name} perfect for educational use.`,
    unit: product.unit || 'piece',
    specifications: product.specifications || {
      'Category': product.category,
      'Availability': product.in_stock ? 'In Stock' : 'Out of Stock',
      'Rating': product.rating.toString()
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={product.avatar_url || product.images_url?.[0] || '/placeholder.svg'} 
                alt={product.name}
                className="w-[50%] h-[50%] object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.category}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.rating})</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  {product.purchaseType === 'hire' && (
                    <span className="text-sm text-gray-600 ml-2">per day</span>
                  )}
                  <p className={`text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <EdumallButton variant="ghost" size="sm" onClick={handleViewDetails} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Eye size={16} />
                  </EdumallButton>
                  <EdumallButton 
                    variant="primary" 
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={handleAddToCart}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                  >
                    <ShoppingCart size={16} />
                    {product.purchaseType === 'hire' ? 'Book' : 'Add to Cart'}
                  </EdumallButton>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <ProductDetailModal
          product={detailedProduct}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300"
      >
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <img 
            src={product.avatar_url || product.images_url?.[0] || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        <div className="p-6">
          <div className="mb-2">
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
              {product.category}
            </span>
            {product.purchaseType === 'hire' && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200 ml-2">
                For Hire
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.rating})</span>
          </div>

          <div className="mb-4">
            <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.purchaseType === 'hire' && (
              <span className="text-sm text-gray-600 ml-1">per day</span>
            )}
            <p className={`text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>



          <div className="flex items-center gap-2">
            <EdumallButton 
              variant="primary" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              disabled={!product.in_stock}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={16} />
              {product.purchaseType === 'hire' ? 'Book' : 'Add to Cart'}
            </EdumallButton>
            <EdumallButton variant="ghost" size="sm" onClick={handleViewDetails} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Eye size={16} />
            </EdumallButton>
          </div>
        </div>
      </motion.div>

      <ProductDetailModal
        product={detailedProduct}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  );
};
