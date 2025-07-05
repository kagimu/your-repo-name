
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  TrendingUp, 
  Award, 
  Bell,
  Settings,
  User,
  CreditCard,
  LogOut
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Total Orders',
      value: 24,
      change: '+12%',
      positive: true,
      icon: ShoppingBag
    },
    {
      label: 'Pending Deliveries',
      value: 3,
      change: '-2',
      positive: true,
      icon: TrendingUp
    },
    {
      label: 'Badges Earned',
      value: 5,
      change: '+1',
      positive: true,
      icon: Award
    },
    {
      label: 'Notifications',
      value: 8,
      change: '+3',
      positive: false,
      icon: Bell
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Delivered',
      total: 450000,
      items: 5
    },
    {
      id: 'ORD-002',
      date: '2024-01-12',
      status: 'In Transit',
      total: 280000,
      items: 3
    },
    {
      id: 'ORD-003',
      date: '2024-01-10',
      status: 'Processing',
      total: 125000,
      items: 2
    }
  ];

  const badges = [
    { name: 'First Order', description: 'Completed your first order', earned: true },
    { name: 'Bulk Buyer', description: 'Ordered 10+ items at once', earned: true },
    { name: 'Loyal Customer', description: 'Made 10+ orders', earned: true },
    { name: 'Early Bird', description: 'Joined in the first month', earned: true },
    { name: 'Review Master', description: 'Left 20+ reviews', earned: false },
    { name: 'Big Spender', description: 'Spent over 1M UGX', earned: false }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-medium rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-8 h-8 text-teal-600" />
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.positive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <EdumallButton variant="ghost" size="sm">
            View All
          </EdumallButton>
        </div>
        
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 glass-medium rounded-xl">
              <div>
                <p className="font-medium text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-600">{order.date} • {order.items} items</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                  order.status === 'In Transit' ? 'bg-blue-100 text-blue-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Achievements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border-2 transition-all ${
              badge.earned 
                ? 'glass-medium border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50'
                : 'glass-light border-gray-200 opacity-60'
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                badge.earned ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                <Award size={32} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{badge.name}</h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
              {badge.earned && (
                <span className="inline-block mt-3 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                  Earned
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h3>
            <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            <span className="inline-block mt-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {user?.type || 'institution'}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue={user?.name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              defaultValue={user?.email || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <select 
            defaultValue={user?.type || 'institution'}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="institution">Institution</option>
            <option value="individual">Individual</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        
        <div className="flex justify-end">
          <EdumallButton variant="primary" size="md">
            Update Profile
          </EdumallButton>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
            <input 
              type="text" 
              defaultValue="Kampala International School"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centre Number</label>
            <input 
              type="text" 
              defaultValue="U0001"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
          <input 
            type="email" 
            defaultValue="admin@kampalaschool.ac.ug"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        
        <div className="flex justify-end">
          <EdumallButton variant="primary" size="md">
            Save Changes
          </EdumallButton>
        </div>
      </div>
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-lg text-gray-600">
              Manage your orders, track deliveries, and discover new products
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-strong rounded-2xl p-6 sticky top-24">
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal-500 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <item.icon size={20} />
                      {item.label}
                    </button>
                  ))}
                  
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors mt-6"
                  >
                    <LogOut size={20} />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'badges' && renderBadges()}
              {activeTab === 'profile' && renderProfile()}
              {activeTab === 'settings' && renderSettings()}
              {['orders', 'billing'].includes(activeTab) && (
                <div className="glass-strong rounded-2xl p-6 text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </h2>
                  <p className="text-gray-600">This section is coming soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
