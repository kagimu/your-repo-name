import React, { useEffect, useState, useCallback } from 'react'; 
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, ShoppingCart  } from 'lucide-react';
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
export const HeroProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating));

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white rounded-xl shadow-md p-3 w-40 flex-shrink-0 flex flex-col items-center"
    >
      {/* Product Image */}
      <img
        src={product.avatar_url || '/placeholder.webp'}
        alt={product.name}
        className="w-32 h-32 object-contain mb-2 rounded-lg"
        loading="lazy"
        decoding="async"
      />

      {/* Product Name */}
      <p className="text-sm font-medium text-gray-800 text-center line-clamp-2 mb-1">
        {product.name}
      </p>

      {/* Price */}
      <p className="text-cyan-600 font-semibold mb-1">USh {product.price.toLocaleString()}</p>

      {/* Rating */}
      <div className="flex items-center mb-2">
        {stars.map((filled, idx) => (
          <Star
            key={idx}
            className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>

      {/* Add to Cart Button */}
      <EdumallButton
        size="sm"
        className={`w-full bg-cyan-500 text-white hover:bg-cyan-600 flex items-center justify-center gap-1`}
        disabled={!product.in_stock}
      >
        <ShoppingCart className="w-4 h-4" />
        {product.in_stock ? 'Add' : 'Out of Stock'}
      </EdumallButton>
    </motion.div>
  );
};

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

  const featuredCategories = Object.keys(categoryMap).slice(0, 7);

  return (
   <section className="relative bg-gradient-to-r from-cyan-50 via-purple-50 to-cyan-50 py-12 px-4 md:px-16 overflow-hidden">
  {/* Background animation */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-200/10 to-transparent opacity-60"
    animate={{ opacity: [0.5, 0.8, 0.5] }}
    transition={{ duration: 5, repeat: Infinity }}
  />

  <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 sm:mt-10">
    {/* Text & Search */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-start gap-4"
    >
      <h1 className="text-3xl md:text-5xl font-bold leading-snug bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
        Your One-Stop Store for Educational Supplies
      </h1>
      <p className="text-gray-600 text-base md:text-lg max-w-full">
        Explore thousands of lab materials, textbooks, and school essentials at unbeatable prices.
      </p>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search products..."
        className="w-full md:w-80 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      <EdumallButton
        size="lg"
        className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 mt-2 md:mt-4"
        onClick={() => navigate('/categories')}
      >
        Explore Products <ArrowRight className="ml-2 w-5 h-5" />
      </EdumallButton>
    </motion.div>

    {/* Featured Products - horizontal scroll */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex space-x-4 overflow-x-auto scrollbar-none py-4"
    >
      {filteredProducts
        .filter((p) => [26, 27, 28, 29].includes(p.id))
        .map((product) => (
          <HeroProductCard
            key={product.id}
            product={product}
          />
        ))}
    </motion.div>

    {/* Featured Categories  */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex space-x-4 overflow-x-auto py-4 scrollbar-none"
        >
          {featuredCategories.map((cat) => (
            <motion.div
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/categories?filter=${cat}`)}
              className="relative flex-shrink-0 w-full h-46 rounded-xl shadow-md overflow-hidden cursor-pointer bg-white"
            >
              {/* Category Image */}
              <img
                src={categoryImages[cat]?.fallback || '/images/categories/school.jpg'}
                alt={cat}
                className="w-full h-52 object-cover"
                loading="lazy"
                decoding="async"
              />

              {/* Category Info */}
              <div className="p-2 flex flex-col justify-between h-12">
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                  {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </h3>
                <p className="text-xs text-gray-500">
                  {categoryMap[cat].length} subcategories
                </p>
              </div>
            </motion.div>
      ))}
    </motion.div>

  </div>
</section>

  );
};
