
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductDetailModal } from './ProductDetailModal';
import { useCart } from '../../hooks/useCart';
import { Helmet } from 'react-helmet-async';

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
    const token = localStorage.getItem('token');
  
    addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.avatar_url || product.images_url?.[0] || '/placeholder.svg',
        category: product.category,
        unit: product.unit,
      });
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
    },
    images: product.images_url || [product.avatar_url || '/placeholder.svg'],
    inStock: product.in_stock,
    description: product.desc || `High-quality ${product.name} perfect for educational use.`
  };  

  if (viewMode === 'list') {
    return (
      <>
      <Helmet>
        <title>{product.name} | Edumall Uganda</title>
        <meta name="description" content={product.desc} />
        <meta property="og:title" content={`${product.name} | Edumall Uganda`} />
        <meta property="og:description" content={product.desc} />
      </Helmet>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex gap-3 sm:gap-6">
            <div className="w-16 h-14 sm:w-20 sm:h-20 overflow-hidden flex-shrink-0">
              <img 
                src={product.avatar_url || product.images_url?.[0] || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">{product.category}</p>
              
                <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={`${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-600">({product.rating})</span>
              </div>              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                    {product.purchaseType === 'hire' && (
                      <span className="text-xs sm:text-sm text-gray-600">per day</span>
                    )}
                  </div>
                  <p className={`text-xs sm:text-sm ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <EdumallButton 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewDetails} 
                    className="h-8 sm:h-9 w-8 sm:w-9 p-0 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Eye size={16} />
                  </EdumallButton>
                  <EdumallButton 
                    variant="primary" 
                    size="sm"
                    disabled={!product.in_stock}
                    onClick={handleAddToCart}
                    className="h-8 sm:h-9 px-3 sm:px-4 text-white bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 flex items-center gap-1.5"
                  >
                    <ShoppingCart size={14} className="flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                      {product.purchaseType === 'hire' ? 'Book Now' : 'Add to Cart'}
                    </span>
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
        whileHover={{ y: -2, scale: 1.005 }}
        className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      >
        {/* Product Image */}
        <div className="w-full pt-[75%] relative">
          <img 
            src={product.avatar_url || product.images_url?.[0] || '/placeholder.svg'} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-contain p-6"
            loading="lazy"
          />
        </div>

        {/* Product Details */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1 space-y-3">
            {/* Category & Status */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-block text-xs font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg">
                {product.category}
              </span>
              <p className={`text-xs font-medium ${product.in_stock ? 'text-green-600' : 'text-red-500'}`}>
                {product.in_stock ? 'In Stock' : 'Out'}
              </p>
            </div>

            {/* Title */}
            <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-snug min-h-[40px]">
              {product.name}
            </h3>

            {/* Rating & Price Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.rating})</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                  {formatPrice(product.price)}
                </p>
                {product.unit && (
                  <p className="text-xs text-gray-500 leading-none">
                    per {product.unit}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <EdumallButton
                variant="secondary"
                size="sm"
                onClick={handleViewDetails}
                className="h-9 flex items-center justify-center gap-1 text-sm bg-gray-50 hover:bg-gray-100"
              >
                <Eye size={16} />
                <span>View</span>
              </EdumallButton>
              <EdumallButton
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="h-9 flex items-center justify-center gap-1 text-sm font-medium bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white"
              >
                <ShoppingCart size={16} />
                <span>{product.purchaseType === 'hire' ? 'Book' : 'Add'}</span>
              </EdumallButton>
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
};
