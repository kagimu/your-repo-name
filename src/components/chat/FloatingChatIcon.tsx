
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Star, CheckCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { EdumallButton } from '../ui/EdumallButton';
import { useCart } from '../../contexts/CartContext';

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

export const FloatingChatIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const { items } = useCart();
  
  // Check if there's an active order
  const hasActiveOrder = localStorage.getItem('orderCompleted') === 'true' && !hasRated;
  
  const handleConfirmDelivery = () => {
    setDeliveryConfirmed(true);
    setShowRating(true);
    localStorage.removeItem('orderCompleted');
  };

  const handleRatingSubmit = (rating: number, review: string) => {
    console.log('Rating submitted:', { rating, review });
    setHasRated(true);
    localStorage.setItem('hasRated', 'true');
    // In real app, send rating to backend
  };

  const handleChatToggle = () => {
    setIsOpen(!isOpen);
  };

  if (!hasActiveOrder) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleChatToggle}
          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow relative"
        >
          <MessageCircle size={28} />
          {/* Notification badge */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
          />
        </motion.button>
        
        {/* Pulse animation */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-blue-400 rounded-full opacity-30"
        />

        {/* Delivery confirmation button */}
        {!deliveryConfirmed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 right-0 bg-white rounded-xl p-3 shadow-lg border border-gray-200 min-w-48"
          >
            <p className="text-sm text-gray-700 mb-2">Delivery completed?</p>
            <EdumallButton
              variant="primary"
              size="sm"
              onClick={handleConfirmDelivery}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Confirm Delivery
            </EdumallButton>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <ChatWindow onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>

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
