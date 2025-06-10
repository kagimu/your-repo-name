
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, MapPin, Phone, Clock, CheckCircle, Navigation } from 'lucide-react';
import { EdumallButton } from '@/components/ui/EdumallButton';

interface Delivery {
  id: string;
  status: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: string[];
  estimatedTime: string;
  distance: string;
}

interface DeliveryListProps {
  deliveries: Delivery[];
  onUpdateStatus: (deliveryId: string, newStatus: string) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({ deliveries, onUpdateStatus }) => {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pickup': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pickup': return 'Ready for Pickup';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const handleStatusUpdate = (deliveryId: string, currentStatus: string) => {
    let newStatus = '';
    switch (currentStatus) {
      case 'pickup':
        newStatus = 'in_transit';
        break;
      case 'in_transit':
        newStatus = 'delivered';
        // Simulate notification to customer
        alert(`Delivery ${deliveryId} marked as delivered. Customer notification sent!`);
        break;
    }
    if (newStatus) {
      onUpdateStatus(deliveryId, newStatus);
    }
  };

  const handleCallCustomer = (phone: string) => {
    alert(`Calling customer at ${phone}...`);
  };

  const handleNavigate = (address: string) => {
    alert(`Opening navigation to: ${address}`);
  };

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <motion.div
          key={delivery.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-200/50 shadow-xl"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Order #{delivery.id}</h3>
                <p className="text-gray-600">{delivery.customerName}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
                  {getStatusLabel(delivery.status)}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <EdumallButton
                variant="ghost"
                size="sm"
                onClick={() => handleCallCustomer(delivery.customerPhone)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Phone size={16} />
              </EdumallButton>
              <EdumallButton
                variant="ghost"
                size="sm"
                onClick={() => handleNavigate(delivery.status === 'pickup' ? delivery.pickupAddress : delivery.deliveryAddress)}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Navigation size={16} />
              </EdumallButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {delivery.status === 'pickup' ? 'Pickup Address' : 'Current Location'}
              </p>
              <p className="text-gray-600 flex items-center">
                <MapPin size={16} className="mr-2 text-blue-500" />
                {delivery.pickupAddress}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
              <p className="text-gray-600 flex items-center">
                <MapPin size={16} className="mr-2 text-green-500" />
                {delivery.deliveryAddress}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Items</p>
            <p className="text-gray-600">{delivery.items.join(', ')}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock size={16} className="mr-1" />
                {delivery.estimatedTime}
              </span>
              <span>{delivery.distance}</span>
            </div>
            
            {delivery.status !== 'delivered' && (
              <EdumallButton
                variant="primary"
                onClick={() => handleStatusUpdate(delivery.id, delivery.status)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {delivery.status === 'pickup' ? (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirm Pickup
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirm Delivery
                  </>
                )}
              </EdumallButton>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
