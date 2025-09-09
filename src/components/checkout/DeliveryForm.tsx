
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, User } from 'lucide-react';
import { EdumallInput } from '../ui/EdumallInput';
import { EdumallButton } from '../ui/EdumallButton';

interface DeliveryFormProps {
  user: any;
  onDetailsSubmit: (details: any) => void;
}

export const DeliveryForm: React.FC<DeliveryFormProps> = ({ user, onDetailsSubmit }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    city: '',
    district: '',
    specialInstructions: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setDeliveryDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDetailsSubmit({
      ...deliveryDetails,
      fullName: user.name,
      email: user.email,
      userId: user.id
    });
  };

  const isFormValid = () => {
    return deliveryDetails.address && deliveryDetails.city;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>
      
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
        <div className="flex items-center text-teal-700">
          <User size={20} className="mr-2" />
          <span className="font-medium">Logged in as: {user.name}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <EdumallInput
          label="Delivery Address"
          value={deliveryDetails.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="Enter your delivery address"
          icon={<MapPin size={20} />}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EdumallInput
            label="City/Town"
            value={deliveryDetails.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter your city"
            required
          />

          <EdumallInput
            label="District"
            value={deliveryDetails.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="Enter your district"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Delivery Instructions (Optional)
          </label>
          <textarea
            value={deliveryDetails.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            placeholder="Any special instructions for delivery..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
          />
        </div>

        <EdumallButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!isFormValid()}
        >
          Continue to Payment
        </EdumallButton>
      </form>
    </motion.div>
  );
};
