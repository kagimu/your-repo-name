
import React from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, MapPin } from 'lucide-react';

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryDetails?: any;
}


export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  items = [], 
  subtotal,
  deliveryFee,
  total, 
  deliveryDetails 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Helper function to get correct image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.svg';

    // Extract actual URL if it's embedded in a storage path
    if (imagePath.includes('/storage/https://')) {
      const actualUrl = imagePath.split('/storage/')[1];
      return actualUrl;
    }
    
    // If it's an imghippo URL or any full URL
    if (imagePath.includes('imghippo.com') || imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Handle storage paths
    if (imagePath.startsWith('/storage/')) {
      return `https://edumall-main-khkttx.laravel.cloud${imagePath}`;
    }
    
    return `https://edumall-main-khkttx.laravel.cloud/storage/${imagePath}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-strong rounded-3xl p-6 sticky top-24"
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h3>
      
      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={getImageUrl(item.image)}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fallbackUrl = '/placeholder.svg';
                  if (e.currentTarget.src !== fallbackUrl) {
                    e.currentTarget.src = fallbackUrl;
                  }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h4>
              <p className="text-sm text-gray-600">
                Qty: {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="text-gray-900">{formatPrice(deliveryFee)}</span>
        </div>

        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-3">
          <span className="text-gray-900">Total</span>
          <span className="text-teal-600">{formatPrice(total)}</span>
        </div>
      </div>


      {/* Delivery Info */}
      {deliveryDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-gray-400" />
              <div>
                <p>{deliveryDetails.address}</p>
                <p>{deliveryDetails.city}, {deliveryDetails.district}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-teal-600">
              <Clock size={16} />
              <span className="font-medium">Est. delivery: 1-2 days</span>
            </div>
          </div>
        </div>
      )}

      {/* Items Count */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package size={16} />
          <span>{items.length} item{items.length !== 1 ? 's' : ''} in your order</span>
        </div>
      </div>
    </motion.div>
  );
};

