
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { EdumallInput } from '../ui/EdumallInput';

interface DeliveryFormProps {
  user?: any;
  onDetailsSubmit: (details: any) => void;
}

export const DeliveryFormWithMaps: React.FC<DeliveryFormProps> = ({ user, onDetailsSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Kampala',
    district: 'Central',
    postalCode: '',
    instructions: '',
    useCurrentLocation: false,
    coordinates: { lat: 0.3476, lng: 32.5825 } // Default to Kampala
  });

  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Mock address suggestions (in real app, this would call Google Places API)
  const mockAddressSuggestions = [
    'Makerere University, Kampala, Uganda',
    'Nakawa Campus, Kampala, Uganda',
    'Garden City Mall, Kampala, Uganda',
    'Kampala International University, Kampala, Uganda',
    'Mulago Hospital, Kampala, Uganda'
  ];

  const handleAddressChange = (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.length > 2) {
      // Filter suggestions based on input
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
    setFormData(prev => ({ ...prev, address: suggestion }));
    setShowSuggestions(false);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            useCurrentLocation: true
          }));
          
          // Mock reverse geocoding (in real app, use Google Geocoding API)
          setFormData(prev => ({
            ...prev,
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
    onDetailsSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MapPin className="mr-3 text-teal-600" size={28} />
          Delivery Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EdumallInput
              label="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
            
            <EdumallInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <EdumallInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
            className="bg-white border-gray-300 text-gray-900"
          />

          {/* Address with Google Maps integration */}
          <div className="relative">
            <EdumallInput
              label="Delivery Address"
              value={formData.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="Start typing your address..."
              required
              className="bg-white border-gray-300 text-gray-900"
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
            
            {formData.useCurrentLocation && (
              <div className="flex items-center text-green-600">
                <Check size={16} className="mr-1" />
                <span className="text-sm">Location captured</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EdumallInput
              label="City"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
            
            <EdumallInput
              label="District"
              value={formData.district}
              onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
              required
              className="bg-white border-gray-300 text-gray-900"
            />
            
            <EdumallInput
              label="Postal Code (Optional)"
              value={formData.postalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="Any special delivery instructions..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-all duration-300"
            />
          </div>

          <EdumallButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white"
          >
            Continue to Payment
          </EdumallButton>
        </form>
      </div>
    </motion.div>
  );
};
