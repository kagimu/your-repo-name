
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/contexts/CartContext';

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const events = [
    {
      id: 1,
      title: 'Annual Science Fair',
      date: '2024-06-15',
      time: '09:00 AM',
      location: 'Kampala Convention Centre',
      category: 'Science',
      attendees: 250,
      description: 'Join us for the biggest science exhibition featuring innovative projects from students across Uganda.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=300&fit=crop',
      price: 0,
      status: 'upcoming',
      type: 'event'
    },
    {
      id: 2,
      title: 'Educational Technology Workshop',
      date: '2024-06-20',
      time: '02:00 PM',
      location: 'Makerere University',
      category: 'Technology',
      attendees: 100,
      description: 'Learn about the latest educational technologies and how to integrate them into your curriculum.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&h=300&fit=crop',
      price: 50000,
      status: 'upcoming',
      type: 'event'
    },
    {
      id: 3,
      title: 'Student Leadership Conference',
      date: '2024-06-25',
      time: '10:00 AM',
      location: 'Sheraton Hotel Kampala',
      category: 'Leadership',
      attendees: 150,
      description: 'Empower student leaders with skills and knowledge to drive positive change in their institutions.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&h=300&fit=crop',
      price: 75000,
      status: 'upcoming',
      type: 'event'
    },
    // Additional services
    {
      id: 4,
      title: 'Professional Photography Service',
      date: 'On Request',
      time: 'Flexible',
      location: 'Your Location',
      category: 'Service',
      attendees: 1,
      description: 'Professional photography services for school events, graduations, and educational activities.',
      image: 'https://images.unsplash.com/photo-1554048612-b6ebf42c3071?w=500&h=300&fit=crop',
      price: 200000,
      status: 'available',
      type: 'service'
    },
    {
      id: 5,
      title: 'Event Planning & Management',
      date: 'On Request',
      time: 'Full Day',
      location: 'Your Venue',
      category: 'Service',
      attendees: 500,
      description: 'Complete event planning and management services for educational institutions.',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop',
      price: 500000,
      status: 'available',
      type: 'service'
    }
  ];

  const categories = ['all', 'Science', 'Technology', 'Leadership', 'Arts', 'Sports', 'Service'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleBooking = (event: any) => {
    addToCart({
      id: `event-${event.id}`,
      name: event.title,
      price: event.price,
      image: event.image,
      category: event.type === 'service' ? 'Services' : 'Events',
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
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
              Educational Events & Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Discover and participate in educational events, workshops, conferences, and professional services
            </motion.p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events and services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      event.type === 'service' 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-blue-600 bg-blue-50'
                    }`}>
                      {event.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2" />
                      {event.date} {event.time !== 'Flexible' && `at ${event.time}`}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin size={16} className="mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users size={16} className="mr-2" />
                      {event.type === 'service' ? 'Available for booking' : `${event.attendees} attendees expected`}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(event.price)}</span>
                    <EdumallButton 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleBooking(event)}
                    >
                      {event.type === 'service' ? 'Book Service' : 'Register'}
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

export default Events;
