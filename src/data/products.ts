export const products = [
  // Stationery
  {
    id: 1,
    name: 'Blue Ballpoint Pens Pack',
    price: 5000,
    image: '/placeholder.svg',
    category: 'Stationery',
    inStock: true,
    rating: 4.5,
    description: 'High-quality blue ballpoint pens, pack of 10',
    purchaseType: 'purchase' as const
  },
  {
    id: 2,
    name: 'Exercise Books A4',
    price: 2500,
    image: '/placeholder.svg',
    category: 'Stationery',
    inStock: true,
    rating: 4.3,
    description: '96 pages A4 exercise books, pack of 5',
    purchaseType: 'purchase' as const
  },
  {
    id: 3,
    name: 'Mathematical Set',
    price: 8000,
    image: '/placeholder.svg',
    category: 'Stationery',
    inStock: true,
    rating: 4.7,
    description: 'Complete mathematical set with compass, protractor, ruler',
    purchaseType: 'purchase' as const
  },
  {
    id: 4,
    name: 'World Atlas',
    price: 15000,
    image: '/placeholder.svg',
    category: 'Stationery',
    inStock: true,
    rating: 4.8,
    description: 'Comprehensive world atlas with detailed maps',
    purchaseType: 'purchase' as const
  },
  {
    id: 5,
    name: 'Colored Pencils Set',
    price: 7500,
    image: '/placeholder.svg',
    category: 'Stationery',
    inStock: true,
    rating: 4.4,
    description: '24 colored pencils in wooden case',
    purchaseType: 'purchase' as const
  },

  // Laboratory
  {
    id: 6,
    name: 'Laboratory Coat',
    price: 35000,
    image: '/placeholder.svg',
    category: 'Laboratory',
    inStock: true,
    rating: 4.6,
    description: 'White cotton laboratory coat, multiple sizes available',
    purchaseType: 'purchase' as const
  },
  {
    id: 7,
    name: 'Digital Microscope',
    price: 450000,
    image: '/placeholder.svg',
    category: 'Laboratory',
    inStock: true,
    rating: 4.9,
    description: 'High-resolution digital microscope with USB connectivity',
    purchaseType: 'hire' as const
  },
  {
    id: 8,
    name: 'Lab Glassware Set',
    price: 85000,
    image: '/placeholder.svg',
    category: 'Laboratory',
    inStock: true,
    rating: 4.5,
    description: 'Complete set of beakers, test tubes, and flasks',
    purchaseType: 'purchase' as const
  },
  {
    id: 9,
    name: 'Safety Goggles',
    price: 12000,
    image: '/placeholder.svg',
    category: 'Laboratory',
    inStock: true,
    rating: 4.3,
    description: 'Chemical resistant safety goggles',
    purchaseType: 'purchase' as const
  },
  {
    id: 10,
    name: 'Lab Burner',
    price: 25000,
    image: '/placeholder.svg',
    category: 'Laboratory',
    inStock: true,
    rating: 4.4,
    description: 'Bunsen burner with gas connection',
    purchaseType: 'hire' as const
  },

  // Sports
  {
    id: 11,
    name: 'Football',
    price: 45000,
    image: '/placeholder.svg',
    category: 'Sports',
    inStock: true,
    rating: 4.6,
    description: 'Official size 5 football, FIFA approved',
    purchaseType: 'purchase' as const
  },
  {
    id: 12,
    name: 'Basketball Jersey',
    price: 28000,
    image: '/placeholder.svg',
    category: 'Sports',
    inStock: true,
    rating: 4.4,
    description: 'Breathable basketball jersey, various sizes',
    purchaseType: 'purchase' as const
  },
  {
    id: 13,
    name: 'Running Shoes',
    price: 95000,
    image: '/placeholder.svg',
    category: 'Sports',
    inStock: true,
    rating: 4.7,
    description: 'Professional running shoes with cushioned sole',
    purchaseType: 'purchase' as const
  },
  {
    id: 14,
    name: 'Tennis Racket',
    price: 75000,
    image: '/placeholder.svg',
    category: 'Sports',
    inStock: true,
    rating: 4.5,
    description: 'Lightweight tennis racket with grip tape',
    purchaseType: 'hire' as const
  },
  {
    id: 15,
    name: 'Volleyball Net',
    price: 35000,
    image: '/placeholder.svg',
    category: 'Sports',
    inStock: true,
    rating: 4.3,
    description: 'Official size volleyball net with posts',
    purchaseType: 'hire' as const
  },

  // IT
  {
    id: 16,
    name: 'Desktop Computer',
    price: 1200000,
    image: '/placeholder.svg',
    category: 'IT',
    inStock: true,
    rating: 4.8,
    description: 'Complete desktop computer with monitor and keyboard',
    purchaseType: 'purchase' as const
  },
  {
    id: 17,
    name: 'Wireless Router',
    price: 85000,
    image: '/placeholder.svg',
    category: 'IT',
    inStock: true,
    rating: 4.6,
    description: 'High-speed wireless router with 4 ethernet ports',
    purchaseType: 'purchase' as const
  },
  {
    id: 18,
    name: 'USB Flash Drive 32GB',
    price: 15000,
    image: '/placeholder.svg',
    category: 'IT',
    inStock: true,
    rating: 4.4,
    description: 'High-speed 32GB USB 3.0 flash drive',
    purchaseType: 'purchase' as const
  },
  {
    id: 19,
    name: 'Wireless Mouse',
    price: 25000,
    image: '/placeholder.svg',
    category: 'IT',
    inStock: true,
    rating: 4.5,
    description: 'Ergonomic wireless mouse with optical sensor',
    purchaseType: 'purchase' as const
  },
  {
    id: 20,
    name: 'HDMI Cable',
    price: 8000,
    image: '/placeholder.svg',
    category: 'IT',
    inStock: true,
    rating: 4.3,
    description: '2 meter HDMI cable for high-definition video',
    purchaseType: 'purchase' as const
  },

  // Library - Academic Books
  {
    id: 21,
    name: 'Primary Mathematics Textbook',
    price: 18000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.7,
    description: 'Comprehensive primary level mathematics textbook',
    purchaseType: 'purchase' as const
  },
  {
    id: 22,
    name: 'O-Level Chemistry Guide',
    price: 25000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.8,
    description: 'Complete chemistry guide for O-Level students',
    purchaseType: 'purchase' as const
  },
  {
    id: 23,
    name: 'A-Level Physics Textbook',
    price: 35000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.9,
    description: 'Advanced physics textbook for A-Level students',
    purchaseType: 'purchase' as const
  },
  {
    id: 24,
    name: 'Business Studies Handbook',
    price: 22000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.5,
    description: 'Comprehensive business studies handbook',
    purchaseType: 'purchase' as const
  },
  {
    id: 25,
    name: 'Think and Grow Rich',
    price: 15000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.9,
    description: 'Napoleon Hill\'s classic self-help book',
    purchaseType: 'purchase' as const
  },
  {
    id: 26,
    name: 'Investment Basics Guide',
    price: 28000,
    image: '/placeholder.svg',
    category: 'Library',
    inStock: true,
    rating: 4.6,
    description: 'Beginner\'s guide to investment and financial planning',
    purchaseType: 'purchase' as const
  }
];

export const categories = [
  {
    id: 1,
    name: 'Stationery',
    description: 'Pens, books, mathematical sets, atlases, and writing materials',
    icon: '✏️',
    itemCount: products.filter(p => p.category === 'Stationery').length
  },
  {
    id: 2,
    name: 'Laboratory',
    description: 'Lab coats, microscopes, glassware, and scientific equipment',
    icon: '🔬',
    itemCount: products.filter(p => p.category === 'Laboratory').length
  },
  {
    id: 3,
    name: 'Sports',
    description: 'Balls, jerseys, shoes, and sports equipment',
    icon: '⚽',
    itemCount: products.filter(p => p.category === 'Sports').length
  },
  {
    id: 4,
    name: 'IT',
    description: 'Computers, routers, accessories, and technology equipment',
    icon: '💻',
    itemCount: products.filter(p => p.category === 'IT').length
  },
  {
    id: 5,
    name: 'Library',
    description: 'Academic books, business titles, investment guides, and self-help books',
    icon: '📚',
    itemCount: products.filter(p => p.category === 'Library').length
  }
];
