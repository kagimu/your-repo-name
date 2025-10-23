import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EdumallButton } from '@/components/ui/EdumallButton';
import debounce from 'lodash.debounce';
import { useQuery } from '@tanstack/react-query';

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
const HeroProductCard: React.FC<{ product: Product; onClick?: () => void }> = React.memo(({ product, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-2xl p-4 shadow-xl w-40 text-center border border-gray-100 cursor-pointer"
    onClick={onClick}
  >
    <img
      src={product.avatar_url || '/placeholder.webp'}
      alt={product.name}
      className="w-30 h-28 object-contain mx-auto rounded-xl mb-3"
      loading="lazy"
      decoding="async"
    />
    <p className="text-sm font-medium text-gray-800">{product.name}</p>
    <p className="text-cyan-500 text-sm font-semibold mt-1">
      USh {product.price.toLocaleString()}
    </p>
  </motion.div>
));

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Use React Query for hero products
  const { data: products = [] } = useQuery({
    queryKey: ['hero-products'],
    queryFn: async () => {
      const response = await axios.get('https://backend-main.laravel.cloud/api/labs', {
        headers: { Accept: 'application/json' },
      });

      const apiData = response.data?.data ?? (Array.isArray(response.data) ? response.data : []);
      return apiData.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory,
        avatar_url: item.avatar_url || item.avatar || '',
        price: parseFloat(item.price) || 0,
        rating: parseFloat(item.rating) || 0,
        in_stock: parseInt(item.in_stock) > 0,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const categoryMap: Record<string, string[]> = {
    laboratory: ['apparatus', 'specimen', 'chemical'],
    textbooks: ['textbook', 'revision guide', 'novel'],
    stationery: ['scholastic', 'paper'],
    school_accessories: ['accessories', 'schoolwear'],
    boardingSchool: ['dormitory', 'toiletries'],
    sports: ['equipment', 'wear'],
    food: ['snacks', 'beverages'],
  };

  const categoryImages: Record<string, { webp: string; fallback: string }> = {
    laboratory: {
      webp: '/images/categories/lab.webp',
      fallback: 'https://i.imghippo.com/files/jEtB4760plw.jpg',
    },
    textbooks: {
      webp: '/images/categories/books.webp',
      fallback: 'https://i.imghippo.com/files/uSx6707TIU.jpg',
    },
    stationery: {
      webp: '/images/categories/stationary.webp',
      fallback: 'https://i.imghippo.com/files/RxwP4716QuM.jpg',
    },
    school_accessories: {
      webp: '/images/categories/school.webp',
      fallback: 'https://i.imghippo.com/files/WMS3666Nv.jpg',
    },
    boardingSchool: {
      webp: '/images/categories/boarding.webp',
      fallback: 'https://i.imghippo.com/files/Dzst5740Rnc.jpg',
    },
    sports: {
      webp: '/images/categories/sports.webp',
      fallback: 'https://i.imghippo.com/files/RHVb4642o.jpg',
    },
    food: {
      webp: '/images/categories/food.webp',
      fallback: 'https://i.imghippo.com/files/dheR7269PDY.jpg',
    },
  };

  // Update filtered products when products change
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

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
              <HeroProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/categories?filter=${product.category}`)}
              />
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
            <picture className="absolute inset-0 w-full h-full">
              <source srcSet={categoryImages[cat]?.webp} type="image/webp" />
              <img
                src={categoryImages[cat]?.fallback || '/images/categories/school.jpg'}
                alt={cat}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </picture>

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
