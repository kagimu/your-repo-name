import React, { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, HelpCircle, Volume2, VolumeX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useCart } from '@/hooks/useCart';
import TutorialModal from './TutorialModal';

interface VoiceAssistantProps {
  onSearch?: (query: string) => void;
  onAddToCart?: (productId: number) => void;
  onFilter?: (filters: { category?: string; minPrice?: number; maxPrice?: number }) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSearch, onAddToCart, onFilter }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const synthesis = window.speechSynthesis;

  // Voice assistant hook with all command handlers
  const {
    isListening,
    transcript,
    error: voiceError,
    isProcessing,
    startListening,
    stopListening,
    toggleListening
  } = useVoiceAssistant({
    onSearch: (query) => {
      speak(`Searching for ${query}...`);
      onSearch?.(query);
    },
    onAddToCart: (item) => {
      speak(`Adding ${item} to cart...`);
      addToCart?.(parseInt(item));
    },
    onFilter: (filters) => {
      if (filters.category) {
        speak(`Showing items in ${filters.category} category...`);
      } else if (filters.maxPrice) {
        speak(`Showing items under ${filters.maxPrice} dollars...`);
      }
      onFilter?.(filters);
    },
    onCheckout: () => {
      speak('Taking you to checkout...');
      navigate('/checkout');
    },
    onShowCategories: () => {
      speak('Showing all categories...');
      navigate('/categories');
    },
    onBudgetHelp: (budget) => {
      speak(`Looking for items within your ${budget} dollar budget...`);
      onFilter?.({ maxPrice: budget });
    }
  });

  // Text-to-speech feedback
  const speak = useCallback((text: string) => {
    if (isMuted || !text) return;

    try {
      // Cancel any ongoing speech
      synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set speech properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to use a natural-sounding English voice
      const voices = synthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Female')
      ) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      setFeedback(text);
      synthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak function:', error);
      setFeedback('Sorry, there was an error with text-to-speech.');
    }
  }, [isMuted, synthesis]);

  // Check tutorial status on mount
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceAssistantTutorial');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }
  }, []);

  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('hasSeenVoiceAssistantTutorial', 'true');
    setIsTutorialOpen(false);
  };

  const handleMicrophoneClick = async () => {
    try {
      if (!isListening) {
        speak("Hello! I'm your voice assistant. How can I help you today?");
      } else {
        setFeedback(''); // Clear feedback when stopping
      }
      await toggleListening();
    } catch (error) {
      console.error('Error toggling microphone:', error);
      speak('Sorry, there was an error with the microphone. Please try again.');
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      synthesis.cancel(); // Stop any ongoing speech
    }
  };

  return (
    <>
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={handleTutorialClose}
        onSkip={handleTutorialSkip}
      />

      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-50">
        {/* Transcript feedback */}
        <AnimatePresence>
          {(isListening || transcript || feedback) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-sm relative"
            >
              <button
                onClick={() => {
                  stopListening();
                  setFeedback('');
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Stop listening"
              >
                <X size={16} />
              </button>
              <p className="text-sm text-gray-600 pr-6">
                {isProcessing ? 'Processing...' : feedback || transcript || 'Listening...'}
              </p>
              {voiceError && (
                <p className="text-sm text-red-500 mt-2">{voiceError}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={handleMute}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label={isMuted ? "Unmute assistant" : "Mute assistant"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={handleMicrophoneClick}
            className={`p-4 rounded-full transition-colors ${
              isListening
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 shadow-lg'
            }`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowHelp(false)}
            >
              <div 
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowHelp(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                  aria-label="Close help"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-semibold mb-4">Voice Commands</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• "Search for [item]" - Search for products</li>
                  <li>• "Show my cart" - View your shopping cart</li>
                  <li>• "What can I buy with [amount]" - Get budget suggestions</li>
                  <li>• "Filter by category [name]" - Filter products</li>
                  <li>• "Add to cart" - Add current item to cart</li>
                  <li>• "Go to checkout" - Proceed to checkout</li>
                  <li>• "Show tutorial" - View the tutorial again</li>
                </ul>
                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VoiceAssistant;
