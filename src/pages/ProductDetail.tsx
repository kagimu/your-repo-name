
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { CustomCursor } from '@/components/CustomCursor';

const ProductDetail = () => {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  // Mock product data
  const product = {
    id: 1,
    name: 'Professional Digital Microscope',
    price: 250000,
    originalPrice: 300000,
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    category: 'Laboratory Equipment',
    brand: 'EduTech Pro',
    rating: 4.5,
    reviewCount: 24,
    inStock: true,
    stockCount: 15,
    description: 'A high-quality digital microscope perfect for educational institutions and research facilities.',
    features: [
      '1000x magnification capability',
      'Digital imaging with USB connectivity',
      'LED illumination system',
      'Adjustable focus and zoom',
      'Compatible with Windows and Mac'
    ],
    specifications: {
      'Magnification': '40x - 1000x',
      'Resolution': '1920 x 1080',
      'Connectivity': 'USB 2.0',
      'Weight': '2.5 kg',
      'Warranty': '2 years'
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product.stockCount));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><a href="/" className="hover:text-teal-600 transition-colors">Home</a></li>
              <li>/</li>
              <li><a href="/categories" className="hover:text-teal-600 transition-colors">Categories</a></li>
              <li>/</li>
              <li className="text-teal-600 font-medium">{product.name}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-md cursor-pointer">
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="mb-2">
                  <span className="text-sm text-teal-600 font-medium bg-teal-50 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-lg text-gray-700">({product.reviewCount} reviews)</span>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-teal-600">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>

                <div className="mb-6">
                  <p className={`text-lg font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                    {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-900 font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stockCount}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <EdumallButton 
                    variant="primary" 
                    size="lg" 
                    className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </EdumallButton>
                  
                  <div className="flex gap-2">
                    <EdumallButton variant="ghost" size="lg" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                      <Heart size={20} />
                    </EdumallButton>
                    <EdumallButton variant="ghost" size="lg" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                      <Share2 size={20} />
                    </EdumallButton>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                {['details', 'specifications', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="min-h-[300px]">
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-800">
                        <span className="w-2 h-2 bg-teal-500 rounded-full mr-3"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">{key}:</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">Customer Reviews</h3>
                  <div className="text-center py-12 text-gray-600">
                    <p>No reviews yet. Be the first to review this product!</p>
                    <EdumallButton variant="secondary" size="md" className="mt-4 text-gray-700 hover:text-gray-900">
                      Write a Review
                    </EdumallButton>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
