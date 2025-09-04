import React, { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Check } from 'lucide-react';
import { EdumallButton } from '../ui/EdumallButton';
import { EdumallInput } from '../ui/EdumallInput';
import { OpenCageAutocomplete } from './OpenStreetMapAutocomplete';
import axios from 'axios';

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
  distance: number;
}

interface DeliveryFormProps {
  onDetailsSubmit: (details: any) => void;
  user: any;
  items: any[]; // cart items
  subtotal: number;
  deliveryFee: number;
  setDeliveryFee: Dispatch<SetStateAction<number>>;
  setDeliveryDistance: Dispatch<SetStateAction<number>>;
  defaultValues?: any;
  openCageApiKey: string;
}

export const DeliveryFormWithMaps: React.FC<DeliveryFormProps> = ({
  onDetailsSubmit,
  user,
  items,
  subtotal,
  deliveryFee,
  setDeliveryFee,
  setDeliveryDistance,
  defaultValues,
  openCageApiKey
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
    distance: defaultValues?.distance || 0,
  });

  const [SHOP_COORDS, setShopCoords] = useState<Coordinates>({ lat: 0.3136, lng: 32.5811 }); // Default Energy Centre
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  const SAFE_CAR_BASE_FARE = 5000;
  const RATE_STANDARD = 2800;
  const RATE_LONG_DISTANCE = 2500;

  // Determine shop location based on items
  const getShopLocation = (items: any[]) => {
    const hasAlbinoRat = items.some(
      (item) =>
        item.name.toLowerCase().includes('albino rat') &&
        item.category.toLowerCase() === 'laboratory' &&
        item.subcategory.toLowerCase() === 'specimen'
    );

    return hasAlbinoRat
      ? { lat: 0.3326, lng: 32.5823 } // Devine Rabbits & Quail Breeders
      : { lat: 0.3136, lng: 32.5811 }; // Energy Centre
  };

  // Update shop location whenever cart items change
  useEffect(() => {
    setShopCoords(getShopLocation(items));
  }, [items]);

  const calculateDeliveryFee = async (clientCoords: Coordinates) => {
    try {
      setIsCalculatingFee(true);

      const apiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg0NjJkNzM5N2MyNTQ1NTc5NjM3NWZlZWVhMDFlNDI0IiwiaCI6Im11cm11cjY0In0=';
      const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

      const response = await axios.post(
        url,
        {
          coordinates: [
            [SHOP_COORDS.lng, SHOP_COORDS.lat],
            [clientCoords.lng, clientCoords.lat]
          ]
        },
        {
          headers: {
            Authorization: apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      const distanceMeters = response.data.routes[0].segments[0].distance;
      const distanceKm = distanceMeters / 1000;

      let fee = 0;
      if (distanceKm <= 2) {
        fee = SAFE_CAR_BASE_FARE;
      } else if (distanceKm <= 10) {
        const extraKm = distanceKm - 2;
        fee = SAFE_CAR_BASE_FARE + (extraKm * RATE_STANDARD);
      } else {
        const extraStandardKm = 8;
        const extraLongKm = distanceKm - 10;
        fee = SAFE_CAR_BASE_FARE + (extraStandardKm * RATE_STANDARD) + (extraLongKm * RATE_LONG_DISTANCE);
      }

      setDeliveryFee(Math.round(fee));
      setDeliveryDistance(parseFloat(distanceKm.toFixed(2)));
      setFormData(prev => ({ ...prev, distance: parseFloat(distanceKm.toFixed(2)) }));

      return { distanceKm: parseFloat(distanceKm.toFixed(2)), deliveryFee: Math.round(fee) };
    } catch (err) {
      console.error('Error calculating delivery fee:', err);
      setDeliveryFee(0);
      return { distanceKm: 0, deliveryFee: 0 };
    } finally {
      setIsCalculatingFee(false);
    }
  };

  const handleAddressSelect = (locationData: { name: string; coordinates: Coordinates }) => {
    const parts = locationData.name.split(',').map(p => p.trim());
    const coords = locationData.coordinates;

    setFormData(prev => ({
      ...prev,
      address: locationData.name,
      coordinates: coords,
      useCurrentLocation: false,
      city: parts[1] || 'Kampala',
      district: parts[2] || 'Central',
    }));

    calculateDeliveryFee(coords);
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const clientCoords = { lat: coords.latitude, lng: coords.longitude };
        setFormData(prev => ({ ...prev, coordinates: clientCoords, useCurrentLocation: true }));
        await calculateDeliveryFee(clientCoords);
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error(err);
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

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">Order Costs</h3>
            <p>Subtotal: <span className="font-semibold">{subtotal.toLocaleString()} UGX</span></p>
            <p>Delivery Fee: <span className="font-semibold">
              {isCalculatingFee ? 'Calculating...' : `${deliveryFee.toLocaleString()} UGX`}
            </span></p>
            <p>Total: <span className="font-bold">
              {isCalculatingFee ? 'Calculating...' : `${(subtotal + deliveryFee).toLocaleString()} UGX`}
            </span></p>
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

          <EdumallButton type="submit" variant="primary" size="lg" className="w-full" disabled={isCalculatingFee || deliveryFee === 0}>
            Continue to Payment
          </EdumallButton>
        </form>
      </div>
    </motion.div>
  );
};
