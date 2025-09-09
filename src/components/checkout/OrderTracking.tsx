
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, MessageCircle, MapPin, Clock, Phone } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';

interface OrderTrackingProps {
  orderId: string;
  deliveryDetails: any;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, deliveryDetails }) => {
  const [currentStatus, setCurrentStatus] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'courier', text: 'Hello! I am your delivery courier. Your order is being prepared.', time: '10:30 AM' },
    { id: 2, sender: 'user', text: 'Great! What time should I expect delivery?', time: '10:35 AM' },
    { id: 3, sender: 'courier', text: 'I should be at your location around 2:00 PM. I will call when I arrive.', time: '10:36 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const trackingSteps = [
    {
      id: 0,
      title: 'Order Confirmed',
      description: 'Your order has been received and is being processed',
      icon: CheckCircle,
      time: '10:00 AM',
      completed: true
    },
    {
      id: 1,
      title: 'Preparing Order',
      description: 'Your items are being prepared for shipment',
      icon: Package,
      time: '11:30 AM',
      completed: true
    },
    {
      id: 2,
      title: 'Out for Delivery',
      description: 'Your order is on the way to your location',
      icon: Truck,
      time: '1:45 PM',
      completed: false
    },
    {
      id: 3,
      title: 'Delivered',
      description: 'Your order has been successfully delivered',
      icon: CheckCircle,
      time: 'Pending',
      completed: false
    }
  ];

  useEffect(() => {
    // Simulate real-time tracking updates
    const interval = setInterval(() => {
      setCurrentStatus(prev => prev < 3 ? prev + 1 : prev);
    }, 30000); // Update every 30 seconds for demo

    return () => clearInterval(interval);
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: messages.length + 1,
      sender: 'user',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Auto-reply from courier
    setTimeout(() => {
      const reply = {
        id: messages.length + 2,
        sender: 'courier',
        text: 'Thank you for your message. I will update you shortly.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleCallCourier = () => {
    // Simulate calling functionality
    alert('Calling courier at +256 701 234 567...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-8 border border-blue-500/50 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Track Your Order</h2>
        <div className="text-right">
          <p className="text-sm text-blue-200">Order ID</p>
          <p className="font-mono text-blue-100">#{orderId}</p>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <MapPin size={20} className="text-blue-200 mt-0.5" />
          <div>
            <p className="text-white font-medium">Delivery Address</p>
            <p className="text-blue-200 text-sm">{deliveryDetails.address}</p>
            <p className="text-blue-200 text-sm">{deliveryDetails.city}, {deliveryDetails.district}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-white/20">
          <Clock size={20} className="text-blue-200" />
          <div>
            <p className="text-white font-medium">Estimated Delivery</p>
            <p className="text-blue-200 text-sm">Today, 2:00 PM - 4:00 PM</p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="space-y-4 mb-6">
        {trackingSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index <= currentStatus;
          const isCurrent = index === currentStatus;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 ${
                isCurrent ? 'bg-white/20 border border-white/30' : 
                isActive ? 'bg-green-500/20 border border-green-400/30' : 
                'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`p-2 rounded-full ${
                isActive ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-400'
              }`}>
                <Icon size={20} className="text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className={`font-medium ${isActive ? 'text-white' : 'text-blue-300'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm ${isActive ? 'text-blue-200' : 'text-blue-400'}`}>
                  {step.description}
                </p>
                {isActive && (
                  <p className="text-xs text-green-300 mt-1">{step.time}</p>
                )}
              </div>
              
              {isCurrent && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-blue-200 rounded-full"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Courier Contact */}
      <div className="border border-white/20 rounded-xl p-4 mb-4 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Your Courier</p>
              <p className="text-blue-200 text-sm">David M. - ID: DR001</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <EdumallButton
              variant="ghost"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <MessageCircle size={16} />
            </EdumallButton>
            <EdumallButton
              variant="ghost"
              size="sm"
              onClick={handleCallCourier}
              className="text-blue-200 hover:text-white hover:bg-white/10"
            >
              <Phone size={16} />
            </EdumallButton>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border border-white/20 rounded-xl p-4 bg-white/10 backdrop-blur-sm"
        >
          <h3 className="text-white font-medium mb-3">Chat with Courier</h3>
          
          <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900'
                }`}>
                  <p>{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">{message.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 text-sm"
            />
            <EdumallButton
              variant="primary"
              size="sm"
              onClick={sendMessage}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600"
            >
              Send
            </EdumallButton>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
