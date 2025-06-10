
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Phone } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';

interface DeliveryMapProps {
  deliveries: any[];
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({ deliveries }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[0]);

  const handleTokenSubmit = () => {
    if (!mapboxToken) {
      alert('Please enter your Mapbox token');
      return;
    }
    // Initialize map with the token
    console.log('Initializing map with token:', mapboxToken);
  };

  const handleNavigate = (address: string) => {
    // Open navigation app
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Map Token Input */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-200/50 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Map Configuration</h3>
        <div className="flex space-x-4">
          <input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="Enter your Mapbox public token"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <EdumallButton
            variant="primary"
            onClick={handleTokenSubmit}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Load Map
          </EdumallButton>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Get your Mapbox token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Active Deliveries</h3>
          {deliveries.map((delivery) => (
            <motion.div
              key={delivery.id}
              onClick={() => setSelectedDelivery(delivery)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                selectedDelivery?.id === delivery.id
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">#{delivery.id}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  delivery.status === 'pickup' ? 'bg-orange-100 text-orange-800' :
                  delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {delivery.status === 'pickup' ? 'Pickup' : 
                   delivery.status === 'in_transit' ? 'In Transit' : 'Delivered'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{delivery.customerName}</p>
              <p className="text-xs text-gray-500">{delivery.distance} • {delivery.estimatedTime}</p>
            </motion.div>
          ))}
        </div>

        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-gray-200/50 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Navigation</h3>
                {selectedDelivery && (
                  <div className="flex space-x-2">
                    <EdumallButton
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Calling ${selectedDelivery.customerPhone}...`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Phone size={16} />
                    </EdumallButton>
                    <EdumallButton
                      variant="primary"
                      size="sm"
                      onClick={() => handleNavigate(
                        selectedDelivery.status === 'pickup' 
                          ? selectedDelivery.pickupAddress 
                          : selectedDelivery.deliveryAddress
                      )}
                      className="bg-gradient-to-r from-green-500 to-green-600"
                    >
                      <Navigation size={16} className="mr-1" />
                      Navigate
                    </EdumallButton>
                  </div>
                )}
              </div>
            </div>
            
            <div 
              ref={mapContainer} 
              className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
            >
              {mapboxToken ? (
                <div className="text-center">
                  <MapPin size={48} className="text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-700">Map will load here with your Mapbox token</p>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin size={48} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Enter Mapbox token to view map</p>
                </div>
              )}
            </div>

            {selectedDelivery && (
              <div className="p-4 bg-gray-50">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {selectedDelivery.status === 'pickup' ? 'Pickup Location' : 'Delivery Location'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedDelivery.status === 'pickup' 
                        ? selectedDelivery.pickupAddress 
                        : selectedDelivery.deliveryAddress}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Customer: {selectedDelivery.customerName} • {selectedDelivery.customerPhone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
