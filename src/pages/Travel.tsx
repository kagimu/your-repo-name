
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Star, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/hooks/useCart';

const Travel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const { addToCart } = useCart();

  const travelOptions = [
    {
      id: 1,
      title: 'Educational Safari to Queen Elizabeth National Park',
      location: 'Queen Elizabeth National Park',
      duration: '3 Days, 2 Nights',
      type: 'Safari',
      participants: '20-40 students',
      price: 350000,
      rating: 4.8,
      description: 'An educational safari experience combining wildlife observation with environmental science learning.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=500&h=300&fit=crop',
      features: ['Wildlife viewing', 'Environmental education', 'Cultural experiences', 'Research activities']
    },
    {
      id: 2,
      title: 'Historical Sites Tour - Kasubi Tombs & Museums',
      location: 'Kampala & Entebbe',
      duration: '1 Day',
      type: 'Cultural',
      participants: '15-50 students',
      price: 75000,
      rating: 4.6,
      description: 'Explore Uganda\'s rich history and cultural heritage through guided tours of historical sites.',
      image: 'https://images.unsplash.com/photo-1571919743851-c8c0b9a3b6f3?w=500&h=300&fit=crop',
      features: ['Historical education', 'Cultural immersion', 'Guided tours', 'Interactive learning']
    },
    {
      id: 3,
      title: 'Science Field Trip to Mabira Forest',
      location: 'Mabira Forest Reserve',
      duration: '2 Days, 1 Night',
      type: 'Science',
      participants: '10-30 students',
      price: 180000,
      rating: 4.7,
      description: 'Hands-on environmental science experience in one of Uganda\'s largest surviving natural forests.',
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop',
      features: ['Forest ecology study', 'Biodiversity research', 'Conservation education', 'Nature photography']
    },
    // Additional travel services
    {
      id: 4,
      title: 'Transport Services for Schools',
      location: 'Nationwide Coverage',
      duration: 'As Needed',
      type: 'Transport',
      participants: '5-60 passengers',
      price: 150000,
      rating: 4.5,
      description: 'Safe and reliable transport services for educational trips and school activities.',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=300&fit=crop',
      features: ['Professional drivers', 'Safety equipment', 'Insurance coverage', 'Flexible scheduling']
    },
    {
      id: 5,
      title: 'Educational Tour Guide Services',
      location: 'Various Locations',
      duration: 'Half/Full Day',
      type: 'Guide',
      participants: '10-100 students',
      price: 80000,
      rating: 4.9,
      description: 'Expert educational tour guides for museums, historical sites, and cultural centers.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      features: ['Expert knowledge', 'Interactive presentations', 'Multilingual support', 'Educational materials']
    }
  ];

  const travelTypes = ['all', 'Safari', 'Cultural', 'Science', 'Adventure', 'Historical', 'Transport', 'Guide'];

  const filteredTravel = travelOptions.filter(option => {
    const matchesSearch = option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || option.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleBooking = (option: any) => {
    addToCart({
      id: `travel-${option.id}`,
      name: option.title,
      price: option.price,
      image: option.image,
      category: 'Travel',
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              Educational Travel & Tours
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover learning opportunities through educational trips, field studies, and travel services
            </motion.p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search travel options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {travelTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedType === type
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Travel Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredTravel.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden">
                  <img 
                    src={option.image} 
                    alt={option.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                      {option.type}
                    </span>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-gray-600">{option.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{option.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {option.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      {option.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2" />
                      {option.participants}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {option.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">{formatPrice(option.price)}</span>
                    <EdumallButton 
                      variant="primary" 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleBooking(option)}
                    >
                      Book Now
                    </EdumallButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Travel;
