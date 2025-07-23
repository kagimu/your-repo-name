import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallInput } from '@/components/ui/EdumallInput';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductCard } from '@/components/products/ProductCard';
import { CustomCursor } from '@/components/CustomCursor';
import axios from 'axios';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState<string>('');
  const navigate = useNavigate();

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await axios.get('https://edumall-admin.up.railway.app/api/labs', {
      headers: {
        Accept: 'application/json',
      }
    }); 

      const labData = response.data?.data ?? response.data;

      if (!Array.isArray(labData)) {
        console.error('Invalid lab data format:', response.data);
        setProducts([]);
        return;
      }

      const labs = labData.map(item => ({
        ...item,
        price: parseFloat(item.price),
        rating: parseFloat(item.rating),
        in_stock: parseInt(item.in_stock) > 0,
        avatar: item.avatar_url || '', // fallback if avatar_url missing
        images: item.images_url || [], // fallback to empty array
      }));

      setProducts(labs);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // clear products on failure
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);




  // Filter products based on search query and filters
  const filteredProducts = useMemo(() => {
  return products.filter(product => {
    const name = product.name || '';
    const category = product.category || '';
    const price = product.price || 0;
    const inStock = product.inStock ?? product.in_stock ?? true;
    const purchaseType = product.purchaseType ?? product.purchase_type ?? '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    const matchesStock = !inStockOnly || inStock;
    const matchesPurchaseType = !purchaseTypeFilter || purchaseType === purchaseTypeFilter;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesPurchaseType;
  });
}, [searchQuery, selectedCategory, priceRange, inStockOnly, purchaseTypeFilter, products]);

  // Categories for quick filters
  const categories = ['Specimen', 'Apparatus', 'Chemical'];

  return (
    <div className="min-h-screen">
      <CustomCursor />
      <Navbar/>
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-purple-200">
              <li><a href="/" className="text-black">Home</a></li>
              <li>/</li>
              <li className="text-cyan-500 font-medium">All Categories</li>
            </ol>
          </nav>

          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Educational Supplies
            </h1>
           
          </motion.div>

          {/* Search and Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white backdrop-blur-xl rounded-2xl p-6 mb-8 border border-[#64b3f4] shadow-xl"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <EdumallInput
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={20} />}
                  className="bg-white/10 border-[#64b3f4] text-white placeholder-gray-300 focus:border-[#64b3f4]"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <EdumallButton
                  variant="secondary"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden bg-white border-[#64b3f4] text-white hover:text-white"
                >
                  <Filter size={20} />
                  Filters
                </EdumallButton>
                
                <div className="flex items-center border border-purple-300/30 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' : 'text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-purple-300/30'
                }`}
              >
                All Categories
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25' 
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-[#64b3f4]-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#64b3f4] backdrop-blur-xl rounded-2xl p-6 border border-purple-300/20 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
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

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Purchase Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="purchaseType"
                          value=""
                          checked={purchaseTypeFilter === ''}
                          onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-white">All</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="purchaseType"
                          value="purchase"
                          checked={purchaseTypeFilter === 'purchase'}
                          onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-white">Purchase</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="purchaseType"
                          value="hire"
                          checked={purchaseTypeFilter === 'hire'}
                          onChange={(e) => setPurchaseTypeFilter(e.target.value)}
                          className="text-cyan-500 focus:ring-cyan-500"
                        />
                        <span className="text-sm text-white">For Hire</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setInStockOnly(e.target.checked)}
                        className="rounded border-purple-300 text-cyan-500 focus:ring-cyan-500 bg-white/20"
                      />
                      <span className="text-sm text-white">In stock only</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-cyan-400 font-medium">
                Showing {filteredProducts.length} of {loading ? '...' : products.length} products
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}
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
