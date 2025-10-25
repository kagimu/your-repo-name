import React, { useState, useMemo, useEffect, useRef } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { ProductCard } from '@/components/products/ProductCard';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import Draggable from 'react-draggable';

// --- Types ---
interface ApiProduct {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  price: string;
  rating: string;
  in_stock: string;
  condition: string;
  unit: string;
  desc: string;
  purchaseType: string;
  created_at: string;
  updated_at: string;
  avatar: string;
  avatar_url: string;
  images_url?: string[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  rating: number;
  in_stock: boolean;
  inStock: boolean;
  condition: string;
  unit: string;
  desc: string;
  purchaseType: 'purchase' | 'hire';
  purchase_type: string;
  created_at: string;
  updated_at: string;
  avatar: string;
  avatar_url: string;
  images: string[];
  images_url: string[];
}

interface ApiResponse { data?: ApiProduct[] }

// --- Reusable Components ---
const CategoryButtons = ({ selectedCategory, setSelectedCategory, categoryMap }) => (
  <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
    <button
      onClick={() => setSelectedCategory('')}
      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        !selectedCategory
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
      }`}
    >
      All Categories
    </button>
    {Object.keys(categoryMap).map((cat) => (
      <button
        key={cat}
        onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
          selectedCategory === cat
            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
            : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
        }`}
      >
        {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </button>
    ))}
  </div>
);

const SubcategoryButtons = ({ selectedCategory, selectedSubcategory, setSelectedSubcategory, categoryMap }) => (
  selectedCategory ? (
    <div className="bg-gray-50/80 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-600 mb-2">
        {selectedCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Subcategories
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
  ) : null
);

const FiltersPanel = ({ priceRange, setPriceRange, inStockOnly, setInStockOnly, purchaseTypeFilter, setPurchaseTypeFilter }) => (
  <div className="space-y-4">
    {/* Price */}
    <div>
      <label className="block text-xs font-medium text-white">Price Range (UGX)</label>
      <input
        type="range"
        min={0}
        max={2000000}
        step={50000}
        value={priceRange[1]}
        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
        className="w-full accent-cyan-400"
      />
      <div className="flex justify-between text-xs text-white">
        <span>0</span>
        <span>{priceRange[1].toLocaleString()}</span>
      </div>
    </div>

    {/* Stock Filter */}
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={inStockOnly}
        onChange={e => setInStockOnly(e.target.checked)}
        className="rounded border-purple-300 text-cyan-500 focus:ring-cyan-500 bg-white/20"
      />
      <span className="ml-2 text-xs text-white">In stock only</span>
    </label>

    {/* Purchase Type */}
    <div>
      <label className="block text-xs font-medium text-white">Purchase Type</label>
      {[{ value: '', label: 'All' }, { value: 'purchase', label: 'Purchase' }, { value: 'hire', label: 'For Hire' }].map(option => (
        <label key={option.value} className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="purchaseType"
            value={option.value}
            checked={purchaseTypeFilter === option.value}
            onChange={e => setPurchaseTypeFilter(e.target.value)}
            className="text-cyan-500 focus:ring-cyan-500"
          />
          <span className="ml-2 text-xs text-white">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const MobileFilterButton = ({ onClick }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable bounds="parent" nodeRef={nodeRef} cancel="button">
        <div ref={nodeRef} className="fixed bottom-5 right-5 md:hidden z-50">
          <button
            onClick={onClick}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <Filter size={18} /> Filters
          </button>
        </div>
      </Draggable>

  );
};

// --- Main Component ---
const Categories = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || '';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam !== null) setSearchQuery(searchParam);
  }, [searchParams]);

  const categoryMap: Record<string, string[]> = {
    laboratory: ['apparatus', 'specimen', 'chemical'],
    textbooks: ['textbook', 'revision guide', 'novel'],
    stationery: ['scholastic', 'paper'],
    school_accessories: ['accessories', 'schoolwear'],
    boardingSchool: ['dormitory', 'toiletries'],
    sports: ['equipment', 'wear'],
    food: ['snacks', 'beverages']
  };

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await axios.get<ApiResponse>('https://backend-main.laravel.cloud/api/labs', {
        headers: { Accept: 'application/json' }
      });
      const labData = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      return labData.map((item: ApiProduct): Product => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        price: parseFloat(item.price) || 0,
        rating: parseFloat(item.rating) || 0,
        in_stock: parseInt(item.in_stock) > 0,
        inStock: parseInt(item.in_stock) > 0,
        condition: item.condition,
        unit: item.unit,
        desc: item.desc,
        purchaseType: item.purchaseType as 'purchase' | 'hire',
        purchase_type: item.purchaseType,
        created_at: item.created_at,
        updated_at: item.updated_at,
        avatar: item.avatar_url || item.avatar || '',
        avatar_url: item.avatar_url || item.avatar || '',
        images: item.images_url || [],
        images_url: item.images_url || [],
      }));
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const name = product.name || '';
      const category = product.category || '';
      const subcategory = product.subcategory || '';
      const price = product.price || 0;
      const inStock = product.inStock ?? product.in_stock ?? true;
      const purchaseType = product.purchaseType ?? product.purchase_type ?? '';

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.condition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchaseType.toLowerCase().includes(searchQuery.toLowerCase());

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
      <main className="pt-10 md:pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto md:mt-10">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-1 md:pt-2 mt-10 md:mt-0">
            <h1 className="text-2xl md:mt-5 md:text-xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Educational Supplies
            </h1>
          </motion.div>

          {/* Categories & Subcategories */}
          <CategoryButtons selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} categoryMap={categoryMap} />
          <SubcategoryButtons selectedCategory={selectedCategory} selectedSubcategory={selectedSubcategory} setSelectedSubcategory={setSelectedSubcategory} categoryMap={categoryMap} />

          {/* Main Content: Products + Sidebar */}
          <div className="flex flex-col md:flex-row gap-6">

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-4 text-sm text-cyan-400 font-medium">
                Showing {filteredProducts.length} of {loading ? '...' : products.length} products
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}
                role="list" aria-label="Product grid">
                {filteredProducts.map((product, index) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredProducts.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="bg-cyan-300 backdrop-blur-xl rounded-2xl p-8 border border-purple-300/20 shadow-xl">
                    <MapPin size={48} className="mx-auto text-cyan-600 mb-4" />
                    <p className="text-black text-lg mb-4">No products found matching your criteria.</p>
                    <EdumallButton variant="secondary" size="md"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/25"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                        setSelectedSubcategory('');
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

            {/* Sidebar Filters Desktop */}
            <div className="hidden md:block w-54 flex-shrink-0">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-[#64b3f4] backdrop-blur-xl rounded-2xl p-3 border border-purple-300/20 shadow-xl md:sticky md:top-20">
                <h3 className="text-lg font-semibold text-white mb-2">Filters</h3>
                <FiltersPanel priceRange={priceRange} setPriceRange={setPriceRange} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
                  purchaseTypeFilter={purchaseTypeFilter} setPurchaseTypeFilter={setPurchaseTypeFilter} />
              </motion.div>
            </div>

            {/* Mobile Filter Button */}
            <MobileFilterButton onClick={() => setShowFilterPanel(true)} />

            {/* Mobile Filter Panel */}
            <AnimatePresence>
              {showFilterPanel && (
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end md:hidden">
                  <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                    className="bg-[#64b3f4] w-4/5 max-w-xs h-full p-4 rounded-l-2xl shadow-xl overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Filters</h3>
                      <button onClick={() => setShowFilterPanel(false)} className="text-white">
                        <X size={22} />
                      </button>
                    </div>
                    <FiltersPanel priceRange={priceRange} setPriceRange={setPriceRange} inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
                      purchaseTypeFilter={purchaseTypeFilter} setPurchaseTypeFilter={setPurchaseTypeFilter} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Categories;
