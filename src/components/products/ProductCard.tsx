
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Eye } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductDetailModal } from './ProductDetailModal';
import { useCart } from '../../contexts/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
  inStock: boolean;
  rating: number;
  description?: string;
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

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: product.image || product.images?.[0] || '/placeholder.svg'
    });
  };

  const handleViewDetails = () => {
    setShowDetailModal(true);
  };

  const detailedProduct = {
    ...product,
    images: product.images || [product.image || '/placeholder.svg'],
    description: product.description || `High-quality ${product.name} perfect for educational use.`,
    unit: product.unit || 'piece',
    specifications: product.specifications || {
      'Category': product.category,
      'Availability': product.inStock ? 'In Stock' : 'Out of Stock',
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
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={product.image || product.images?.[0] || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-cover"
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
                  <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <EdumallButton variant="ghost" size="sm" onClick={handleViewDetails} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                    <Eye size={16} />
                  </EdumallButton>
                  <EdumallButton 
                    variant="primary" 
                    size="sm"
                    disabled={!product.inStock}
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
            src={product.image || product.images?.[0] || '/placeholder.svg'} 
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
            <p className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <EdumallButton 
              variant="primary" 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
              disabled={!product.inStock}
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
