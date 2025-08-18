import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { EdumallInput } from '../ui/EdumallInput';
import { EdumallCombobox } from '../ui/EdumallCombobox';
import { OpenCageAutocomplete } from './OpenStreetMapAutocomplete';
import { ugandaDistricts, ugandaCities } from '@/data/ugandaLocations';

interface Coordinates {
  lat: number;
  lng: number;
}

interface DeliveryFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  instructions: string;
  useCurrentLocation: boolean;
  coordinates: Coordinates;
}

interface DeliveryFormProps {
  user?: any;
  defaultValues?: Partial<DeliveryFormData>;
  onDetailsSubmit: (details: DeliveryFormData) => void;
  openCageApiKey: string; // API key passed as prop
}

export const DeliveryFormWithMaps: React.FC<DeliveryFormProps> = ({
  user,
  defaultValues,
  onDetailsSubmit,
  openCageApiKey,
}) => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    fullName: defaultValues?.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') || user?.name || '',
    email: defaultValues?.email || user?.email || '',
    phone: defaultValues?.phone || '',
    address: defaultValues?.address || '',
    city: defaultValues?.city || 'Kampala',
    district: defaultValues?.district || 'Central',
    postalCode: defaultValues?.postalCode || '',
    instructions: defaultValues?.instructions || '',
    useCurrentLocation: defaultValues?.useCurrentLocation || false,
    coordinates: defaultValues?.coordinates || { lat: 0.3476, lng: 32.5825 },
  });

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Handle selection from autocomplete
  const handleAddressSelect = (locationData: { name: string; coordinates: Coordinates }) => {
    const parts = locationData.name.split(',').map(p => p.trim());
    setFormData(prev => ({
      ...prev,
      address: locationData.name,
      coordinates: locationData.coordinates,
      useCurrentLocation: false,
      city: parts[1] || 'Kampala',
      district: parts[2] || 'Central',
    }));
  };

  // Get current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        try {
          const res = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${openCageApiKey}&limit=1&no_annotations=1`
          );

          if (!res.ok) throw new Error('Failed to reverse geocode location');

          const data = await res.json();
          const result = data.results?.[0];

          if (result) {
            const components = result.components || {};
            const formatted = result.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setFormData(prev => ({
              ...prev,
              coordinates: { lat: latitude, lng: longitude },
              useCurrentLocation: true,
              address: formatted,
              city: components.city || components.town || 'Kampala',
              district: components.county || components.state_district || components.state || 'Central',
            }));
          }
        } catch (err) {
          console.error('Error fetching location:', err);
          setFormData(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            useCurrentLocation: true,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        } finally {
          setIsLoadingLocation(false);
        }
      },
      err => {
        console.error('Geolocation error:', err);
        alert('Could not get your location. Please enable location services.');
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDetailsSubmit(formData);
  };

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 border border-gray-200/50 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <MapPin className="mr-3 text-teal-600" size={28} />
          Delivery Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <EdumallInput
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
              {user?.firstName && user?.lastName && (
                <p className="text-xs text-teal-600 flex items-center gap-1 mt-1">
                  <Check size={12} className="inline" />
                  Auto-filled from your profile
                </p>
              )}
            </div>
            <EdumallInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <EdumallInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />

          

          

          <div className="relative">
            <label className="text-sm font-medium text-gray-900 mb-2 block">Delivery Address</label>
            <OpenCageAutocomplete
              onAddressSelect={handleAddressSelect}
              defaultValue={formData.address}
              className="w-full"
              apiKey={openCageApiKey}
            />
          </div>

          <div className="flex items-center space-x-4">
            <EdumallButton
              type="button"
              variant="secondary"
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
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

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
           
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
          </div>

          <EdumallButton type="submit" variant="primary" size="lg" className="w-full">
            Continue to Payment
          </EdumallButton>
        </form>
      </div>
    </motion.div>
  );
};
