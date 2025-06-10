
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Filter, Search, Clock, Eye, ArrowRight, Star, Download, Bookmark } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';

const ELibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚' },
    { id: 'mathematics', name: 'Mathematics', icon: '🔢' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'english', name: 'English', icon: '📝' },
    { id: 'history', name: 'History', icon: '🏛️' },
    { id: 'geography', name: 'Geography', icon: '🌍' },
    { id: 'literature', name: 'Literature', icon: '📖' },
    { id: 'business', name: 'Business Studies', icon: '💼' },
  ];

  const educationLevels = [
    { id: 'all', name: 'All Levels', icon: '🎓' },
    { id: 'primary', name: 'Primary', icon: '👶' },
    { id: 'olevel', name: "O'Level", icon: '📚' },
    { id: 'alevel', name: "A'Level", icon: '🎯' },
    { id: 'university', name: 'University', icon: '🏛️' },
  ];

  const books = [
    {
      id: 1,
      title: 'Advanced Mathematics for A-Level',
      author: 'Dr. James K. Smith',
      category: 'mathematics',
      level: 'alevel',
      image: '/api/placeholder/200/280',
      description: 'Comprehensive guide to advanced mathematics concepts',
      pages: 450,
      readingTime: '12 hours',
      progress: 0,
      isNew: true,
      rating: 4.8,
      downloads: 1250,
      isFavorite: false
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      author: 'Prof. Sarah Johnson',
      category: 'science',
      level: 'olevel',
      image: '/api/placeholder/200/280',
      description: 'Essential physics concepts for O-Level students',
      pages: 320,
      readingTime: '8 hours',
      progress: 45,
      isNew: false,
      rating: 4.6,
      downloads: 2100,
      isFavorite: true
    },
    {
      id: 3,
      title: 'English Literature Classics',
      author: 'Mary Williams',
      category: 'literature',
      level: 'alevel',
      image: '/api/placeholder/200/280',
      description: 'Study guide for classic English literature',
      pages: 280,
      readingTime: '7 hours',
      progress: 100,
      isNew: false,
      rating: 4.9,
      downloads: 890,
      isFavorite: false
    },
    {
      id: 4,
      title: 'Primary Mathematics Made Easy',
      author: 'John Mukasa',
      category: 'mathematics',
      level: 'primary',
      image: '/api/placeholder/200/280',
      description: 'Fun and easy mathematics for primary students',
      pages: 180,
      readingTime: '4 hours',
      progress: 20,
      isNew: true,
      rating: 4.5,
      downloads: 1800,
      isFavorite: true
    },
    {
      id: 5,
      title: 'Business Studies for O-Level',
      author: 'Rose Namugga',
      category: 'business',
      level: 'olevel',
      image: '/api/placeholder/200/280',
      description: 'Comprehensive business studies curriculum',
      pages: 380,
      readingTime: '10 hours',
      progress: 0,
      isNew: false,
      rating: 4.7,
      downloads: 965,
      isFavorite: false
    },
    {
      id: 6,
      title: 'Geography of East Africa',
      author: 'David Kamau',
      category: 'geography',
      level: 'olevel',
      image: '/api/placeholder/200/280',
      description: 'Detailed study of East African geography',
      pages: 250,
      readingTime: '6 hours',
      progress: 75,
      isNew: false,
      rating: 4.4,
      downloads: 720,
      isFavorite: false
    },
  ];

  const filteredBooks = books.filter(book => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesLevel = selectedLevel === 'all' || book.level === selectedLevel;
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const getButtonText = (progress: number) => {
    if (progress === 0) return 'Read Now';
    if (progress === 100) return 'Read Again';
    return 'Continue Reading';
  };

  const getButtonVariant = (progress: number) => {
    if (progress === 0) return 'primary';
    if (progress === 100) return 'ghost';
    return 'secondary';
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 50) return 'bg-gradient-to-r from-red-400 to-orange-400';
    if (progress < 100) return 'bg-gradient-to-r from-yellow-400 to-green-400';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                📚 E-Library
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
                Explore thousands of educational resources at your fingertips
              </p>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200/50 shadow-xl mb-6 sm:mb-8">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm sm:text-base"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>

                {/* Level Filter */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm bg-white"
                >
                  {educationLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.icon} {level.name}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex rounded-xl border border-gray-300 overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 py-2.5 px-3 text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 py-2.5 px-3 text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-teal-500 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>

                {/* Clear Filters */}
                <EdumallButton
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setSearchQuery('');
                  }}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Clear Filters
                </EdumallButton>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white"
            >
              <BookOpen size={24} className="mb-2 sm:mb-3" />
              <h3 className="text-lg sm:text-2xl font-bold">1,247</h3>
              <p className="text-blue-100 text-xs sm:text-sm">Total Books</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white"
            >
              <Eye size={24} className="mb-2 sm:mb-3" />
              <h3 className="text-lg sm:text-2xl font-bold">3</h3>
              <p className="text-green-100 text-xs sm:text-sm">Currently Reading</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white"
            >
              <Clock size={24} className="mb-2 sm:mb-3" />
              <h3 className="text-lg sm:text-2xl font-bold">12</h3>
              <p className="text-purple-100 text-xs sm:text-sm">Completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 text-white"
            >
              <Filter size={24} className="mb-2 sm:mb-3" />
              <h3 className="text-lg sm:text-2xl font-bold">{filteredBooks.length}</h3>
              <p className="text-orange-100 text-xs sm:text-sm">Filtered Results</p>
            </motion.div>
          </div>

          {/* Books Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {/* Book Cover */}
                  <div className="relative mb-4">
                    <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                      <BookOpen size={32} className="text-gray-500" />
                    </div>
                    
                    {book.isNew && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}

                    <button 
                      className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${
                        book.isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-500'
                      }`}
                    >
                      <Bookmark size={14} fill={book.isFavorite ? 'currentColor' : 'none'} />
                    </button>

                    {book.progress > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-white/90 rounded-full p-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`${getProgressColor(book.progress)} h-2 rounded-full transition-all duration-300`}
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">
                            {book.progress}% Complete
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors text-sm sm:text-base">
                      {book.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">by {book.author}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-current" />
                        <span>{book.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download size={12} />
                        <span>{book.downloads}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {book.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>{book.pages} pages</span>
                      <span>{book.readingTime}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <EdumallButton
                    variant={getButtonVariant(book.progress) as any}
                    size="sm"
                    className="w-full text-xs sm:text-sm"
                  >
                    {getButtonText(book.progress)}
                    <ArrowRight size={14} className="ml-2" />
                  </EdumallButton>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Book Cover - Mobile */}
                    <div className="sm:hidden w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center relative">
                      <BookOpen size={24} className="text-gray-500" />
                      {book.isNew && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    {/* Book Cover - Desktop */}
                    <div className="hidden sm:block w-20 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex-shrink-0 flex items-center justify-center relative">
                      <BookOpen size={20} className="text-gray-500" />
                      {book.isNew && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                          NEW
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 hover:text-teal-600 transition-colors">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-1">
                              <Star size={12} className="text-yellow-400 fill-current" />
                              <span>{book.rating}</span>
                            </div>
                            <span>{book.pages} pages</span>
                            <span>{book.readingTime}</span>
                            <div className="flex items-center gap-1">
                              <Download size={12} />
                              <span>{book.downloads}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {book.description}
                          </p>
                          
                          {book.progress > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{book.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${getProgressColor(book.progress)} h-2 rounded-full transition-all duration-300`}
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-row sm:flex-col gap-2">
                          <button className={`p-2 rounded-lg transition-colors ${
                            book.isFavorite ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:text-red-500'
                          }`}>
                            <Bookmark size={16} fill={book.isFavorite ? 'currentColor' : 'none'} />
                          </button>
                          
                          <EdumallButton
                            variant={getButtonVariant(book.progress) as any}
                            size="sm"
                            className="flex-1 sm:flex-none"
                          >
                            {getButtonText(book.progress)}
                            <ArrowRight size={14} className="ml-2" />
                          </EdumallButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ELibrary;
