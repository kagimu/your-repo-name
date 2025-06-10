
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Package, Truck, CheckCircle, Clock, MapPin, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/CustomCursor';
import { EdumallButton } from '@/components/ui/EdumallButton';

const Notifications = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Prepared',
      message: 'Your order #EDU1703847234 has been prepared and is ready for pickup',
      timestamp: '2 minutes ago',
      read: false,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      actionText: 'Track Order',
      actionLink: '/checkout'
    },
    {
      id: 2,
      type: 'delivery',
      title: 'Courier In Transit',
      message: 'Your courier David M. is on the way to deliver your order',
      timestamp: '15 minutes ago',
      read: false,
      icon: Truck,
      color: 'from-orange-500 to-orange-600',
      actionText: 'View Location',
      actionLink: '/checkout'
    },
    {
      id: 3,
      type: 'delivery',
      title: 'Courier Has Arrived',
      message: 'Your delivery courier has arrived at your location. Please be ready to receive your order.',
      timestamp: '1 hour ago',
      read: true,
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      actionText: 'Confirm Receipt',
      actionLink: '/checkout'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Completed',
      message: 'Your order #EDU1703847233 has been delivered successfully',
      timestamp: '3 hours ago',
      read: true,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      actionText: 'Rate Experience',
      actionLink: '/dashboard'
    },
    {
      id: 5,
      type: 'system',
      title: 'Welcome to Edumall!',
      message: 'Thank you for joining our platform. Explore our wide range of educational products.',
      timestamp: '1 day ago',
      read: true,
      icon: Bell,
      color: 'from-purple-500 to-purple-600',
      actionText: 'Browse Products',
      actionLink: '/categories'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <CustomCursor />
      <Navbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  🔔 Notifications
                </h1>
                <p className="text-gray-600">
                  Stay updated with your orders and deliveries
                </p>
              </div>
              
              <div className="flex space-x-2">
                <EdumallButton
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Mark all as read
                </EdumallButton>
                <EdumallButton
                  variant="ghost"
                  onClick={clearAllNotifications}
                  className="text-red-600 hover:text-red-700 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear All
                </EdumallButton>
              </div>
            </motion.div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-gray-200/50 mb-6">
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'order', label: 'Orders' },
              { id: 'delivery', label: 'Deliveries' },
              { id: 'system', label: 'System' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 font-medium ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const Icon = notification.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    !notification.read ? 'ring-2 ring-blue-200' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 bg-gradient-to-r ${notification.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'} mb-1`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full inline-block ml-2" />
                            )}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock size={12} className="mr-1" />
                              {notification.timestamp}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <EdumallButton
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            {notification.actionText}
                          </EdumallButton>
                          <EdumallButton
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </EdumallButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <div className="text-center py-16">
              <Bell size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notifications;
