
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, AlertTriangle, Eye, User, Lock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';

const Supplier = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  const supplierStats = [
    { label: 'Total Orders', value: 156, change: '+12%', positive: true, icon: Package },
    { label: 'Revenue', value: 'UGX 15.2M', change: '+8.5%', positive: true, icon: DollarSign },
    { label: 'Growth', value: '23%', change: '+5%', positive: true, icon: TrendingUp },
    { label: 'Low Stock', value: 8, change: '+3', positive: false, icon: AlertTriangle },
  ];

  const recentOrders = [
    {
      id: 'EDU001',
      customer: 'Kampala International School',
      items: 'Mathematics Textbooks (50 units)',
      amount: 2500000,
      status: 'Confirmed',
      date: '2024-01-15'
    },
    {
      id: 'EDU002',
      customer: 'Makerere University',
      items: 'Laboratory Equipment Set',
      amount: 8500000,
      status: 'Processing',
      date: '2024-01-14'
    },
    {
      id: 'EDU003',
      customer: 'Buganda Road Primary',
      items: 'Sports Equipment Bundle',
      amount: 1200000,
      status: 'Shipped',
      date: '2024-01-13'
    }
  ];

  const lowStockItems = [
    { name: 'Scientific Calculator', current: 5, minimum: 20, category: 'Stationery' },
    { name: 'Microscope Slides', current: 12, minimum: 50, category: 'Laboratory' },
    { name: 'Football', current: 3, minimum: 15, category: 'Sports' },
    { name: 'Exercise Books', current: 25, minimum: 100, category: 'Stationery' }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        
        <main className="pt-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto mt-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Supplier Portal</h1>
                <p className="text-gray-600">Access your supplier dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <EdumallButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  Sign In to Portal
                </EdumallButton>
              </form>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  📦 Supplier Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage your products and track orders
                </p>
              </div>
              
              <EdumallButton
                variant="ghost"
                onClick={() => setIsLoggedIn(false)}
                className="text-red-600 hover:text-red-700"
              >
                Logout
              </EdumallButton>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {supplierStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-green-600" />
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <EdumallButton variant="ghost" size="sm">
                  <Eye size={16} className="mr-2" />
                  View All
                </EdumallButton>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">
                        UGX {order.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Low Stock Alerts</h2>
                <EdumallButton variant="ghost" size="sm" className="text-red-600">
                  <AlertTriangle size={16} className="mr-2" />
                  {lowStockItems.length} Items
                </EdumallButton>
              </div>
              
              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <EdumallButton variant="primary" size="sm">
                        Restock
                      </EdumallButton>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-red-600">
                        Current: {item.current} units
                      </p>
                      <p className="text-sm text-gray-500">
                        Min: {item.minimum} units
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Supplier;
