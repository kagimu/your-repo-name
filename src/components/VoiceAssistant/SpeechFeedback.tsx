import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface SpeechFeedbackProps {
  text: string | null;
  isVisible: boolean;
  onClose: () => void;
  autoHideDelay?: number;
}

export const SpeechFeedback: React.FC<SpeechFeedbackProps> = ({
  text,
  isVisible,
  onClose,
  autoHideDelay = 5000 // Default 5 seconds
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (text && isVisible) {
      setShouldShow(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for auto-hiding
      timeoutRef.current = setTimeout(() => {
        setShouldShow(false);
        onClose();
      }, autoHideDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, isVisible, autoHideDelay, onClose]);

  return (
    <AnimatePresence>
      {shouldShow && text && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg max-w-md flex items-start gap-3">
            <p className="text-sm flex-1">{text}</p>
            <button
              onClick={() => {
                setShouldShow(false);
                onClose();
              }}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close feedback"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
