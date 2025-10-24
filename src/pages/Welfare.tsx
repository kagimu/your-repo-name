
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Shield, Phone, Search, Filter } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useCart } from '@/hooks/useCart';

const Welfare = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const welfareServices = [
    {
      id: 1,
      title: 'Student Counseling Services',
      category: 'Mental Health',
      description: 'Professional counseling services for students dealing with academic stress, personal issues, and mental health challenges.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&h=300&fit=crop',
      price: 100000,
      duration: '1 Hour Session',
      availability: 'Monday - Friday',
      features: ['Individual counseling', 'Group therapy', 'Crisis intervention', 'Academic support']
    },
    {
      id: 2,
      title: 'Health Insurance for Students',
      category: 'Health',
      description: 'Comprehensive health insurance coverage for students including medical emergencies, routine checkups, and prescription medications.',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=500&h=300&fit=crop',
      price: 250000,
      duration: 'Annual Coverage',
      availability: 'Year Round',
      features: ['Emergency coverage', 'Routine medical care', 'Prescription drugs', '24/7 helpline']
    },
    {
      id: 3,
      title: 'Emergency Financial Aid',
      category: 'Financial',
      description: 'Emergency financial assistance for students facing unexpected financial hardships that may affect their education.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&h=300&fit=crop',
      price: 0,
      duration: 'As Needed',
      availability: 'Application Based',
      features: ['Emergency grants', 'Interest-free loans', 'Payment plans', 'Financial counseling']
    },
    {
      id: 4,
      title: 'Nutritional Support Program',
      category: 'Nutrition',
      description: 'Meal programs and nutritional support for students in need, ensuring proper nutrition for academic success.',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&h=300&fit=crop',
      price: 150000,
      duration: 'Monthly Package',
      availability: 'Daily',
      features: ['Balanced meals', 'Dietary consultations', 'Special dietary needs', 'Food vouchers']
    },
    {
      id: 5,
      title: 'Legal Aid Services',
      category: 'Legal',
      description: 'Legal consultation and support services for students and educational institutions dealing with legal matters.',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=500&h=300&fit=crop',
      price: 200000,
      duration: 'Per Consultation',
      availability: 'By Appointment',
      features: ['Legal consultation', 'Document preparation', 'Court representation', 'Contract review']
    },
    {
      id: 6,
      title: 'Career Guidance & Placement',
      category: 'Career',
      description: 'Professional career guidance, resume building, interview preparation, and job placement assistance for students.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      price: 120000,
      duration: 'Complete Package',
      availability: 'Flexible Schedule',
      features: ['Career assessment', 'Resume writing', 'Interview coaching', 'Job placement']
    }
  ];

  const categories = ['all', 'Mental Health', 'Health', 'Financial', 'Nutrition', 'Legal', 'Career'];

  const filteredServices = welfareServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
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

  const handleBooking = (service: { id: number; title: string; price: number; image: string }) => {
    addToCart({
      id: service.id,
      name: service.title,
      price: service.price,
      image: service.image,
      category: 'Welfare',
      quantity: 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
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
              Student Welfare Services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Comprehensive support services for student wellbeing, health, and academic success
            </motion.p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search welfare services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Heart size={16} className="mr-2 text-purple-500" />
                      {service.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield size={16} className="mr-2 text-purple-500" />
                      {service.availability}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">{formatPrice(service.price)}</span>
                    <EdumallButton 
                      variant="primary" 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => handleBooking(service)}
                    >
                      Get Support
                    </EdumallButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Emergency Contact Section */}
          <div className="mt-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-8 text-white text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Phone size={48} className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Emergency Support</h2>
              <p className="text-lg mb-6">
                If you're experiencing a crisis or emergency, don't hesitate to reach out immediately.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <h3 className="font-semibold mb-2">Crisis Hotline</h3>
                  <p className="text-xl font-bold">0800-HELP-NOW</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Medical Emergency</h3>
                  <p className="text-xl font-bold">911 / 999</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Campus Security</h3>
                  <p className="text-xl font-bold">0700-123-456</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Welfare;
