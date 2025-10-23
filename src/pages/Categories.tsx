
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallInput } from '@/components/ui/EdumallInput';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductCard } from '@/components/products/ProductCard';
import axios from 'axios';

// Type definitions for the API response and product structure
interface ApiProduct {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  avatar: string;
  images: string;
  color: string;
  rating: string;
  in_stock: string;
  condition: string;
  price: string;
  unit: string;
  desc: string; 
  purchaseType: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  images_url?: string[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  avatar: string;
  images: string[];
  color: string;
  rating: number;
  in_stock: boolean;
  condition: string;
  price: number;
  unit: string;
  desc: string;
  purchaseType: string;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  images_url: string[];
  inStock?: boolean;
  purchase_type?: string;
}

interface ApiResponse {
  data?: ApiProduct[];
}

const Categories = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Update search query when URL params change
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState<string>('');
  const navigate = useNavigate();

  const categoryMap: Record<string, string[]> = {
    laboratory: ['apparatus', 'specimen', 'chemical'],
    textbooks: ['textbook', 'revision guide', 'novel'],
    stationery: ['scholastic', 'paper'],
    school_accessories: ['accessories', 'schoolwear'],
    boardingSchool: ['dormitory', 'toiletries'],
    sports: ['equipment', 'wear'],
    food: ['snacks', 'beverages']
  };

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get<ApiResponse>('https://backend-main.laravel.cloud/api/labs', {
        headers: {
          Accept: 'application/json',
        }
      });

      // Type-safe access to response data
      const apiData = response.data;
      const labData = apiData?.data ?? (Array.isArray(apiData) ? apiData : []);

      if (!Array.isArray(labData)) {
        console.error('Invalid lab data format:', response.data);
        setProducts([]);
        return;
      }

      const labs: Product[] = labData.map((item: ApiProduct) => ({
        ...item,
        price: parseFloat(item.price) || 0,
        rating: parseFloat(item.rating) || 0,
        in_stock: parseInt(item.in_stock) > 0,
        inStock: parseInt(item.in_stock) > 0, // Add both variants for compatibility
        avatar: item.avatar_url || item.avatar || '',
        avatar_url: item.avatar_url || item.avatar || '',
        images: item.images_url || [],
        images_url: item.images_url || [],
        purchase_type: item.purchaseType, // Add snake_case variant for compatibility
      }));

      setProducts(labs);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);




 // Filter products based on all criteria
  // Function to format price with specimen unit
const formatSpecimenPrice = (product: Product) => {
  if (product.category?.toLowerCase() === 'laboratory' && 
      (product.subcategory?.toLowerCase() === 'specimen' || 
       product.subcategory?.toLowerCase() === 'animals')) {
    return `USh ${product.price.toLocaleString()} per specimen`;
  }
  return `USh ${product.price.toLocaleString()}`;
};

const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      const name = product.name || '';
      const category = product.category || '';
      const subcategory = product.subcategory || '';
      const price = product.price || 0;
      const inStock = product.inStock ?? product.in_stock ?? true;
      const purchaseType = product.purchaseType ?? product.purchase_type ?? '';

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.condition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchaseType?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSubcategory = !selectedSubcategory || subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const matchesStock = !inStockOnly || inStock;
      const matchesPurchaseType = !purchaseTypeFilter || purchaseType === purchaseTypeFilter;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice && matchesStock && matchesPurchaseType;
    });
  }, [searchQuery, selectedCategory, selectedSubcategory, priceRange, inStockOnly, purchaseTypeFilter, products]);


  return (
    <div className="min-h-screen">
      <Navbar/>
      
      <main className="pt-10 md:pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex sm:mb-2" aria-label="Breadcrumb">
           
             {/* Header */}
            <motion.div   
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-1 md:pt-2"
            >
              <h1 className="text-2xl md:mt-2 md:text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Educational Supplies
              </h1>
            
            </motion.div>

          </nav>    
          {/* Search and Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.1 }}
            className="bg-white backdrop-blur-xl rounded-xl sm:rounded-2xl sm:p-6 mb-4 sm:mb-8 border border-[#64b3f4] shadow-xl"
          >
            {/* Category & Subcategory Filters */}
            <div className="mt-1 sm:mt-6 -mx-2 sm:-mx-0 px-1 sm:px-0">
              {/* Mobile Categories Section */}
              <div className="sm:hidden">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }}
                    className={`px-1 py-1 rounded-xl text-sm xl:font-medium flex items-center justify-center ${
                      !selectedCategory 
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    All Categories
                  </button>
                  {Object.keys(categoryMap).map(cat => (
                    <button
                      key={cat}
                      onClick={() => { 
                        setSelectedCategory(cat === selectedCategory ? '' : cat);
                        setSelectedSubcategory('');
                      }}
                      className={`px-1 py-1 rounded-xl text-sm font-medium flex items-center justify-center ${
                        selectedCategory === cat 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {cat.replace(/_/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </button>
                  ))}
              </div>

              </div>
              
              {/* Mobile Subcategories Section */}
              {selectedCategory && (
                <div className="sm:hidden mt-6 bg-gray-50/80 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">
                    {selectedCategory.replace(/_/g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')} Subcategories
                  </h3>
                  <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                    <div className="flex gap-2 mb-1">
                      {categoryMap[selectedCategory].map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`px-1 py-1 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                            selectedSubcategory === sub 
                              ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-pink-400/25' 
                              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {sub.charAt(0).toUpperCase() + sub.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-4">
                   {/* Desktop View */}
                    <div className="hidden sm:block">
                      
                      {/* Categories Section */}
                      <div className="flex gap-10 mb-6">
                        <div className="flex overflow-x-auto overflow-y-auto scrollbar-hide gap-2 ">
                          <button
                            onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                              !selectedCategory 
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            All Categories
                          </button>

                          {Object.keys(categoryMap).map(cat => (
                            <button
                              key={cat}
                              onClick={() => { 
                                setSelectedCategory(cat === selectedCategory ? '' : cat);
                                setSelectedSubcategory('');
                              }}
                              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                selectedCategory === cat 
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {cat.replace(/_/g, ' ').split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Subcategories Section */}
                      {selectedCategory && (
                        <div className="bg-gray-50/80 rounded-xl p-4 mb-1">
                          <h3 className="text-sm font-medium text-gray-600 mb-1">
                            {selectedCategory.replace(/_/g, ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')} Subcategories
                          </h3>
                          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                            {categoryMap[selectedCategory].map(sub => (
                              <button
                                key={sub}
                                onClick={() => setSelectedSubcategory(sub)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                                  selectedSubcategory === sub 
                                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg shadow-pink-400/25' 
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                {sub.charAt(0).toUpperCase() + sub.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                      {/* Sidebar Filters - Desktop */}
                    <div className="hidden md:block w-64 flex-shrink-0">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#64b3f4] backdrop-blur-xl rounded-2xl p-3 border border-purple-300/20 shadow-xl"
                      >
                        <h3 className="text-lg font-semibold text-white mb-2">Filters</h3>
                        
                        <div className="space-y-6">
                          <div className="pb-4 border-b border-gray-100">
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              Price Range (UGX)
                            </label>
                            <div className="space-y-2">
                              <input
                                type="range"
                                min="0"
                                max="2000000"
                                step="50000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                              />
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>UGX 0</span>
                                <span>UGX {priceRange[1].toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    </div>
             
            </div>
          </motion.div>

          {/* Mobile Filter Panel */}
          <div 
            className={`fixed inset-0 bg-black/40 z-50 transition-all duration-300 md:hidden ${
              showFilters ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`} 
            onClick={() => setShowFilters(false)}
            aria-hidden={!showFilters}
          >
            <div 
              className={`fixed bottom-0 left-0 right-0 bg-[#64b3f4] rounded-t-2xl p-3 transition-transform duration-300 ${
                showFilters ? 'translate-y-0' : 'translate-y-full'
              }`}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-heading"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 flex items-center justify-center text-white"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Price Range Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Price Range (UGX)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full accent-cyan-400"
                    />
                    <div className="flex justify-between text-sm text-white">
                      <span>0</span>
                      <span>{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Type Filter */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Purchase Type
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { value: '', label: 'All' },
                      { value: 'purchase', label: 'Purchase' },
                      { value: 'hire', label: 'For Hire' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="purchaseType"
                          value={option.value}
                          checked={purchaseTypeFilter === option.value}
                          onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="ml-2 text-sm text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-purple-300 text-cyan-500 focus:ring-cyan-500 bg-white/20"
                    />
                    <span className="ml-2 text-sm text-white">In stock only</span>
                  </label>
                </div>
              </div>
              
              {/* Filter Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/20">
                <button
                  onClick={() => {
                    setPriceRange([0, 2000000]);
                    setPurchaseTypeFilter('');
                    setInStockOnly(false);
                    setShowFilters(false);
                  }}
                  className="flex-1 h-10 px-4 text-sm font-medium text-[#64b3f4] bg-white rounded-xl"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 h-10 px-4 text-sm font-medium text-[#64b3f4] bg-white rounded-xl"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            

            {/* Product Grid */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-cyan-400 font-medium">
                Showing {filteredProducts.length} of {loading ? '...' : products.length} products
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                    : 'grid-cols-1'
                }`}
                role="list"
                aria-label="Product grid"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredProducts.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="bg-cyan-300 backdrop-blur-xl rounded-2xl p-8 border border-purple-300/20 shadow-xl">
                    <MapPin size={48} className="mx-auto text-cyan-600 mb-4" />
                    <p className="text-black text-lg mb-4">No products found matching your criteria.</p>
                    <EdumallButton 
                      variant="secondary" 
                      size="md" 
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/25"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        setPriceRange([0, 2000000]);
                        setInStockOnly(false);
                        setPurchaseTypeFilter('');
                      }}
                    >
                      Clear Filters
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

export default Categories;
