
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Phone, Navigation, Check } from 'lucide-react';
import { EdumallInput } from '../ui/EdumallInput';
import { EdumallButton } from '../ui/EdumallButton';

interface GuestCheckoutProps {
  onDetailsSubmit: (details: { fullName: string; email: string; phone: string; address: string; city: string; district: string; postalCode: string; specialInstructions: string; useCurrentLocation: boolean; coordinates: { lat: number; lng: number } }) => void;
}

export const GuestCheckout: React.FC<GuestCheckoutProps> = ({ onDetailsSubmit }) => {
  const [deliveryDetails, setDeliveryDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Kampala',
    district: 'Central',
    postalCode: '',
    specialInstructions: '',
    useCurrentLocation: false,
    coordinates: { lat: 0.3476, lng: 32.5825 }
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock address suggestions
  const mockAddressSuggestions = [
    'Makerere University, Kampala, Uganda',
    'Nakawa Campus, Kampala, Uganda',
    'Garden City Mall, Kampala, Uganda',
    'Kampala International University, Kampala, Uganda',
    'Mulago Hospital, Kampala, Uganda'
  ];

  const handleInputChange = (field: string, value: string) => {
    setDeliveryDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (value: string) => {
    setDeliveryDetails(prev => ({ ...prev, address: value }));
    
    if (value.length > 2) {
      const filtered = mockAddressSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setAddressSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setDeliveryDetails(prev => ({ ...prev, address: suggestion }));
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setDeliveryDetails(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            useCurrentLocation: true,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }));
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDetailsSubmit(deliveryDetails);
  };

  const isFormValid = () => {
    return deliveryDetails.fullName && 
           deliveryDetails.email && 
           deliveryDetails.phone && 
           deliveryDetails.address && 
           deliveryDetails.city;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <MapPin className="mr-3 text-teal-600" size={28} />
        Delivery Information
      </h2>
      <p className="text-gray-600 mb-8">
        Please provide your delivery details to complete your order.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EdumallInput
            label="Full Name"
            value={deliveryDetails.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            icon={<User size={20} />}
            required
          />

          <EdumallInput
            label="Email Address"
            type="email"
            value={deliveryDetails.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <EdumallInput
          label="Phone Number"
          value={deliveryDetails.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="+256 700 000 000"
          icon={<Phone size={20} />}
          required
        />

        {/* Enhanced Address Input with Google Maps functionality */}
        <div className="relative">
          <EdumallInput
            label="Delivery Address"
            value={deliveryDetails.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Start typing your address..."
            icon={<MapPin size={20} />}
            required
          />
          
          {/* Address Suggestions */}
          {showSuggestions && addressSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-xl mt-2 shadow-lg"
            >
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-800 border-b border-gray-100 last:border-b-0"
                >
                  <MapPin size={16} className="inline mr-2 text-teal-600" />
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Current Location Button */}
        <div className="flex items-center space-x-4">
          <EdumallButton
            type="button"
            variant="secondary"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="bg-teal-50 border-teal-300 text-teal-700 hover:bg-teal-100"
          >
            <Navigation size={16} className="mr-2" />
            {isLoadingLocation ? 'Getting Location...' : 'Use Current Location'}
          </EdumallButton>
          
          {deliveryDetails.useCurrentLocation && (
            <div className="flex items-center text-green-600">
              <Check size={16} className="mr-1" />
              <span className="text-sm">Location captured</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            required
          />

          <EdumallInput
            label="Postal Code (Optional)"
            value={deliveryDetails.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="Postal code"
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
