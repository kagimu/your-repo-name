
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Lock, User } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';

interface CourierLoginProps {
  onLogin: (data: any) => void;
}

export const CourierLogin: React.FC<CourierLoginProps> = ({ onLogin }) => {
  const [courierId, setCourierId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      const courierData = {
        id: courierId,
        name: `Courier ${courierId}`,
        phone: '+256 701 234 567',
        vehicle: 'Motorcycle',
        rating: 4.8,
        completedDeliveries: 142
      };
      onLogin(courierData);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Courier Login</h1>
          <p className="text-gray-600">Access your delivery dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courier ID
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={courierId}
                onChange={(e) => setCourierId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your courier ID"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <EdumallButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </EdumallButton>
        </form>
      </motion.div>
    </div>
  );
};
