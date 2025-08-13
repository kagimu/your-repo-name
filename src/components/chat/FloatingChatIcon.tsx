import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Star, CheckCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { EdumallButton } from '../ui/EdumallButton';
import { useCart } from '../../hooks/useCart';
import type { Delivery } from '../courier/DeliveryList';

// Add courier deliveries mock for demo (replace with real data from props/context in integration)
const mockDeliveries: Delivery[] = [
  {
    id: 'EDU1703847234',
    customerName: 'John Doe',
    customerPhone: '+256 701 123 456',
    status: 'in_transit',
    pickupAddress: 'Kampala Mall, Kampala',
    deliveryAddress: 'Makerere University, Kampala',
    items: ['Educational Books', 'Stationery'],
    estimatedTime: '30 mins',
    distance: '5.2 km',
  },
  {
    id: 'EDU1703847235',
    customerName: 'Sarah Johnson',
    customerPhone: '+256 701 234 567',
    status: 'pickup',
    pickupAddress: 'Tech Store, Kampala',
    deliveryAddress: 'Ntinda Complex, Kampala',
    items: ['Laptop', 'Mouse'],
    estimatedTime: '15 mins',
    distance: '2.8 km',
  },
];

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Rate Your Experience</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">How was your delivery experience?</p>

        {/* Star Rating */}
        <div className="flex space-x-2 mb-6 justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-colors"
            >
              <Star
                size={32}
                className={star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>

        {/* Review Text */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Tell us about your experience (optional)"
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none mb-6"
        />

        <div className="flex space-x-3">
          <EdumallButton
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            Skip
          </EdumallButton>
          <EdumallButton
            variant="primary"
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1"
          >
            Submit Rating
          </EdumallButton>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Refactored FloatingChatIcon for multi-customer chat support for couriers
export const FloatingChatIcon: React.FC<{ deliveries?: Delivery[] }> = ({ deliveries = mockDeliveries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openChats, setOpenChats] = useState<string[]>([]); // order IDs of open chats
  const [showChatList, setShowChatList] = useState(false);
  const [showRating, setShowRating] = useState(false);

  // Only show for couriers with active deliveries
  const hasActiveDeliveries = deliveries && deliveries.length > 0;

  const handleChatIconClick = () => {
    setShowChatList((prev) => !prev);
  };

  const handleOpenChat = (orderId: string) => {
    setOpenChats((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
    setShowChatList(false);
  };

  const handleCloseChat = (orderId: string) => {
    setOpenChats((prev) => prev.filter((id) => id !== orderId));
  };

  const handleRatingSubmit = (rating: number, review: string) => {
    console.log('Rating submitted:', rating, review);
    // TODO: Handle rating submission (e.g., send to server)
  };

  if (!hasActiveDeliveries) return null;

  return (
    <>
      {/* Floating Chat Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleChatIconClick}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow relative"
          aria-label="Open chat list"
        >
          <MessageCircle size={28} />
          {/* Notification badge (show if any unread in real app) */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
          />
        </motion.button>
      </motion.div>

      {/* Chat Card List Modal */}
      <AnimatePresence>
        {showChatList && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Active Chats</h3>
              <button onClick={() => setShowChatList(false)} aria-label="Close chat list">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between bg-blue-50 rounded-xl p-3 mb-2 shadow border border-blue-100"
                >
                  <div>
                    <div className="font-semibold text-gray-900">{delivery.customerName}</div>
                    <div className="text-xs text-gray-500">Order #{delivery.id}</div>
                  </div>
                  <EdumallButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenChat(delivery.id)}
                    className="bg-gradient-to-r from-blue-500 to-teal-500 px-3"
                    aria-label={`Chat with ${delivery.customerName}`}
                  >
                    Chat
                  </EdumallButton>
                </div>
              ))}
              {deliveries.length === 0 && (
                <div className="text-gray-500 text-center py-6">No active deliveries</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render Chat Windows for each open chat */}
      <AnimatePresence>
        {openChats.map((orderId, idx) => {
          const delivery = deliveries.find((d) => d.id === orderId);
          if (!delivery) return null;
          return (
            <ChatWindow
              key={orderId}
              orderId={delivery.id}
              customerName={delivery.customerName}
              customerPhone={delivery.customerPhone}
              onClose={() => handleCloseChat(orderId)}
              style={{ right: 24 + idx * 340, bottom: 120 }} // stack windows horizontally
            />
          );
        })}
      </AnimatePresence>

      {/* Rating Modal (optional, can be triggered after delivery) */}
      <AnimatePresence>
        {showRating && (
          <RatingModal
            isOpen={showRating}
            onClose={() => setShowRating(false)}
            onSubmit={handleRatingSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
};
