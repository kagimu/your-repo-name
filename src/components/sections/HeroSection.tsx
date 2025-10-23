import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EdumallButton } from '@/components/ui/EdumallButton';
import debounce from 'lodash.debounce';

interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  avatar_url: string;
  price: number;
  rating: number;
  in_stock: boolean;
}

// Memoized product card
const HeroProductCard: React.FC<{ product: Product }> = React.memo(({ product }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-2xl p-4 shadow-xl w-40 text-center border border-gray-100"
  >
    <img
      src={product.avatar_url || '/placeholder.png'}
      alt={product.name}
      className="w-30 h-28 object-contain mx-auto rounded-xl mb-3"
      loading="lazy"
    />
    <p className="text-sm font-medium text-gray-800">{product.name}</p>
    <p className="text-cyan-500 text-sm font-semibold mt-1">
      USh {product.price.toLocaleString()}
    </p>
  </motion.div>
));

export const HeroSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const categoryMap: Record<string, string[]> = {
    laboratory: ['apparatus', 'specimen', 'chemical'],
    textbooks: ['textbook', 'revision guide', 'novel'],
    stationery: ['scholastic', 'paper'],
    school_accessories: ['accessories', 'schoolwear'],
    boardingSchool: ['dormitory', 'toiletries'],
    sports: ['equipment', 'wear'],
    food: ['snacks', 'beverages'],
  };

  const categoryImages: Record<string, string> = {
    laboratory: 'https://i.imghippo.com/files/jEtB4760plw.jpg',
    textbooks: 'https://i.imghippo.com/files/uSx6707TIU.jpg',
    stationery: 'https://i.imghippo.com/files/RxwP4716QuM.jpg',
    school_accessories: 'https://i.imghippo.com/files/WMS3666Nv.jpg',
    boardingSchool: 'https://i.imghippo.com/files/Dzst5740Rnc.jpg',
    sports: 'https://i.imghippo.com/files/RHVb4642o.jpg',
    food: 'https://i.imghippo.com/files/dheR7269PDY.jpg',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://backend-main.laravel.cloud/api/labs', {
          headers: { Accept: 'application/json' },
        });

        const apiData = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
        const formatted: Product[] = apiData.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          subcategory: item.subcategory,
          avatar_url: item.avatar_url || item.avatar || '',
          price: parseFloat(item.price) || 0,
          rating: parseFloat(item.rating) || 0,
          in_stock: parseInt(item.in_stock) > 0,
        }));

        setProducts(formatted);
        setFilteredProducts(formatted); // initial full list
      } catch (error) {
        console.error('Error fetching hero products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Debounced search
  const handleSearch = useCallback(
    debounce((query: string) => {
      const lowerQuery = query.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery) ||
            p.subcategory?.toLowerCase().includes(lowerQuery)
        )
      );
    }, 300),
    [products]
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const featuredCategories = Object.keys(categoryMap).slice(0, 6);

  return (
    <section className="relative bg-gradient-to-r from-cyan-500/10 via-purple-100 to-cyan-50 py-20 px-6 md:px-16 overflow-hidden">
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-200/10 to-transparent opacity-60"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1"
        >
          <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            Your One-Stop Store for Educational Supplies
          </h1>
          <p className="text-gray-600 mt-4 text-lg max-w-xl">
            Explore thousands of lab materials, textbooks, and school essentials at unbeatable prices.
          </p>

          {/* Search Input */}
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search products..."
              className="w-full md:w-80 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="mt-6 flex gap-4">
            <EdumallButton
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25"
              onClick={() => navigate('/categories')}
            >
              Explore Products <ArrowRight className="ml-2 w-5 h-5" />
            </EdumallButton>
          </div>
        </motion.div>

        {/* Featured Product Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 flex flex-wrap justify-center gap-4"
        >
          {filteredProducts
            .filter((p) => [26, 27, 28, 29].includes(p.id))
            .map((product) => (
              <HeroProductCard key={product.id} product={product} />
            ))}
        </motion.div>
      </div>

      {/* Featured Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto"
      >
        {featuredCategories.map((cat) => (
          <motion.div
            key={cat}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => navigate(`/categories?filter=${cat}`)}
            className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition cursor-pointer justify-items-center"
          >
            <img
              src={categoryImages[cat] || '/images/default-bg.jpg'}
              alt={cat}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/60 transition-all" />

            <div className="relative z-10 p-6 text-center text-white">
              <ShoppingBag className="mx-auto mb-3 w-8 h-8 text-cyan-300 drop-shadow-md" />
              <h3 className="text-lg font-semibold mb-1">
                {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </h3>
              <p className="text-sm text-gray-200">{categoryMap[cat].length} subcategories</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
