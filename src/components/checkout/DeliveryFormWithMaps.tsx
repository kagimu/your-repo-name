import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check, Ruler, CreditCard } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { EdumallInput } from '../ui/EdumallInput';
import { OpenCageAutocomplete } from './OpenStreetMapAutocomplete';

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
  distanceKm?: number;
  deliveryFee?: number;
}

interface DeliveryFormProps {
  user?: { firstName?: string; lastName?: string; name?: string; email?: string };
  defaultValues?: Partial<DeliveryFormData>;
  onDetailsSubmit: (details: DeliveryFormData) => void;
  openCageApiKey: string;
}

const MAPEERA_BUILDING = { lat: 0.3156, lng: 32.5822 }; // Kampala pickup point

export const DeliveryFormWithMaps: React.FC<DeliveryFormProps> = ({
  user,
  defaultValues,
  onDetailsSubmit,
  openCageApiKey,
}) => {

  const [formData, setFormData] = useState<DeliveryFormData>({
    fullName:
      defaultValues?.fullName ||
      (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '') ||
      user?.name ||
      '',
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

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // 🔢 Haversine formula for distance
  const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 💸 Uber-style delivery fee calculation
  const calculateDeliveryFee = (distanceKm: number): number => {
    const BASE_FARE = 3500; // starting
    const PER_KM_RATE = 1200; // per km
    const MIN_FARE = 6000; // minimum total
    const SERVICE_FEE_RATE = 0.05; // 5%

    let total = BASE_FARE + distanceKm * PER_KM_RATE;
    if (total < MIN_FARE) total = MIN_FARE;

    total = total + total * SERVICE_FEE_RATE; // add service fee
    return Math.round(total);
  };

  // 🧮 Auto-update distance + fee when coordinates change
  useEffect(() => {
    if (formData.coordinates?.lat && formData.coordinates?.lng) {
      const dist = calculateDistance(MAPEERA_BUILDING, formData.coordinates);
      const roundedDist = parseFloat(dist.toFixed(2));
      const fee = calculateDeliveryFee(roundedDist);

      setDistanceKm(roundedDist);
      setDeliveryFee(fee);

      setFormData((prev) => ({
        ...prev,
        distanceKm: roundedDist,
        deliveryFee: fee,
      }));
    }
  }, [formData.coordinates]);

  // 📍 Handle address select
  const handleAddressSelect = (locationData: { name: string; coordinates: Coordinates }) => {
    const parts = locationData.name.split(',').map((p) => p.trim());
    setFormData((prev) => ({
      ...prev,
      address: locationData.name,
      coordinates: locationData.coordinates,
      useCurrentLocation: false,
      city: parts[1] || 'Kampala',
      district: parts[2] || 'Central',
    }));
  };

  // 🌍 Get current location
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
            const formatted =
              result.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setFormData((prev) => ({
              ...prev,
              coordinates: { lat: latitude, lng: longitude },
              useCurrentLocation: true,
              address: formatted,
              city: components.city || components.town || 'Kampala',
              district:
                components.county ||
                components.state_district ||
                components.state ||
                'Central',
            }));
          }
        } catch (err) {
          console.error('Error fetching location:', err);
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            useCurrentLocation: true,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (err) => {
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
                onChange={(value) => setFormData((prev) => ({ ...prev, fullName: value }))}
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
              onChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
              required
            />
          </div>

          <EdumallInput
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
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

          {/* Distance & Delivery Fee Display */}
          {distanceKm && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mt-4 space-y-2">
              <div className="flex items-center text-teal-700 font-medium">
                <Ruler className="mr-2" size={18} />
                Distance from Pickup: {distanceKm} km
              </div>
              {deliveryFee && (
                <div className="flex items-center text-green-700 font-semibold">
                  <CreditCard className="mr-2" size={18} />
                  Estimated Delivery Fee: {deliveryFee.toLocaleString()} UGX
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Instructions (Optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData((prev) => ({ ...prev, instructions: e.target.value }))}
              placeholder="Any special delivery instructions..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:outline-none transition-all duration-300"
            />
          </div>

          <EdumallButton type="submit" variant="primary" size="lg" className="w-full">
            Continue to Payment
          </EdumallButton>
        </form>
      </div>
    </motion.div>
  );
};
