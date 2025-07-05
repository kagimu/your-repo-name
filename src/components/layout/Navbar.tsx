import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, User, Menu, X, BookOpen, Bell, LayoutDashboard } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { PreLoader } from '@/components/ui/PreLoader';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isAuthenticated, user, logout } = useAuth();
  const { getCartCount, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // Pending payment alert state, only relevant if user is authenticated
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate checking if user has pending payment when auth or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchPendingPayment = async () => {
        // TODO: Replace with real API call to check pending payment status
        const pending = await new Promise<boolean>((resolve) => {
          setTimeout(() => {
            // Example: pending true if userType is 'customer' (adjust to your logic)
            resolve(user.userType === 'customer');
          }, 500);
        });
        setHasPendingPayment(pending);
      };
      fetchPendingPayment();
    } else {
      setHasPendingPayment(false);
    }
  }, [isAuthenticated, user]);

  const cartItemCount = getCartCount();

  const navItems = [
    { path: '/categories', label: 'Our Products', icon: BookOpen, mobileLabel: 'Products' },
    { path: '/e-library', label: 'E-Library', icon: LayoutDashboard, mobileLabel: 'Library' },
    { path: '/research', label: 'Research', icon: Search, mobileLabel: 'Research' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setHasPendingPayment(false); // Clear pending payment alert on logout
    setTimeout(() => {
      clearCart();
      logout();
      setIsLoggingOut(false);
      navigate('/');
    }, 2000);
  };

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    navigate(`/categories?search=${encodeURIComponent(suggestion)}`);
  };

  const getSearchSuggestions = () => {
    const userType = user?.userType || 'student';

    if (userType === 'parent') {
      return [
        'School supplies for my child',
        'Primary school books',
        'School uniforms',
        'Educational games',
        'Stationery sets',
        'Science lab equipment',
      ];
    } else if (userType === 'student') {
      return [
        'Textbooks for my level',
        'Study guides',
        'Mathematical instruments',
        'Art supplies',
        'Sports equipment',
        'Computer accessories',
      ];
    } else if (userType === 'teacher') {
      return [
        'Teaching materials',
        'Classroom supplies',
        'Educational charts',
        'Laboratory equipment',
        'Office supplies',
        'Assessment tools',
      ];
    }

    return [
      'Popular products',
      'New arrivals',
      'Best sellers',
      'Educational materials',
      'Office supplies',
    ];
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <motion.img
                src="/img/logo.png"
                alt="Edumall"
                className="h-20 w-20 object-contain transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                whileHover={{ rotate: 5, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                const isProducts = item.path === '/categories' && location.pathname === '/categories';

                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md'
                          : isProducts
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Tablet Navigation - Icons with labels */}
            <div className="hidden md:flex lg:hidden items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                const isProducts = item.path === '/categories' && location.pathname === '/categories';

                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-md'
                          : isProducts
                          ? 'text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={16} />
                      <span className="text-xs font-medium mt-1">{item.mobileLabel}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search with Suggestions */}
              <div className="hidden sm:block relative">
                <motion.div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Search products..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 w-64"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </motion.div>

                {showSearchSuggestions && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-64 overflow-y-auto z-50"
                  >
                    <div className="p-2">
                      <p className="text-xs text-gray-500 mb-2 px-2">Suggested for you:</p>
                      {getSearchSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Notifications */}
              {isAuthenticated && (
                <Link to="/notifications">
                  <motion.div
                    className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg"
                        style={{ fontSize: '10px', padding: '2px' }}
                      >
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart">
                <motion.div
                  className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg"
                      style={{ fontSize: '10px', padding: '2px' }}
                    >
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 font-medium hidden lg:block">
                    Hi, {user?.firstName ?? 'Guest'}
                  </span>
                  <Link to="/dashboard">
                    <EdumallButton
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-teal-600 flex items-center gap-1"
                    >
                      <LayoutDashboard size={16} />
                      <span className="hidden sm:inline">Dashboard</span>
                    </EdumallButton>
                  </Link>
                  <EdumallButton
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 hidden sm:inline-flex"
                  >
                    Logout
                  </EdumallButton>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <EdumallButton variant="ghost" size="sm" className="text-gray-700 hover:text-teal-600">
                      <span className="hidden sm:inline">Login</span>
                      <User size={16} className="sm:hidden" />
                    </EdumallButton>
                  </Link>
                  <Link to="/register">
                    <EdumallButton
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700"
                    >
                      <span className="hidden sm:inline">Sign Up</span>
                      <span className="sm:hidden">Join</span>
                    </EdumallButton>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <motion.div initial={false} animate={{ height: isMenuOpen ? 'auto' : 0 }} className="md:hidden overflow-hidden">
            <div className="py-4 space-y-2 border-t border-gray-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                const isProducts = item.path === '/categories' && location.pathname === '/categories';

                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <div
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white' : isProducts ? 'text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Mobile-only actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="px-4">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl w-full"
                  >
                    <User size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fixed Pre-loader to cover entire screen */}
        {isLoggingOut && <PreLoader isLoading={isLoggingOut} message="Signing out..." type="logout" />}
      </motion.nav>

      {/* Pending Payment Alert below Navbar - show only if authenticated and pending */}
      {isAuthenticated && hasPendingPayment && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[64px] left-0 right-0 bg-yellow-400 text-yellow-900 font-semibold py-3 px-6 text-center shadow-md z-50"
        >
          ⚠️ Your payment is pending. Please confirm your payment or contact support.
        </motion.div>
      )}
    </>
  );
};
