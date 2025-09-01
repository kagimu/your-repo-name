import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, HelpCircle, Volume2, VolumeX, X, Settings, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { useCart } from '@/hooks/useCart';
import TutorialModal from './TutorialModal';
import DiagnosticsPanel from './DiagnosticsPanel';
import { VoiceState } from '@/types/speech';

interface VoiceAssistantProps {
  onSearch?: (query: string) => void;
  onAddToCart?: (productId: number) => void;
  onFilter?: (filters: { category?: string; minPrice?: number; maxPrice?: number }) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSearch, onAddToCart, onFilter }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    // Show tutorial by default if user hasn't seen it before
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceTutorial');
    return !hasSeenTutorial;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [isWhisperEnabled, setIsWhisperEnabled] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const synthesis = window.speechSynthesis;

  // Handle tutorial completion
  const handleTutorialClose = useCallback(() => {
    setIsTutorialOpen(false);
    localStorage.setItem('hasSeenVoiceTutorial', 'true');
  }, []);

  const handleTutorialSkip = useCallback(() => {
    setIsTutorialOpen(false);
    localStorage.setItem('hasSeenVoiceTutorial', 'true');
  }, []);

  // Show tutorial manually when help is clicked
  const showTutorial = useCallback(() => {
    setIsTutorialOpen(true);
    setShowHelp(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handleMicrophoneClick();
          break;
        case 'm':
          handleMute();
          break;
        case 'r':
          if (lastCommand) {
            handleCommand(lastCommand);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lastCommand]);

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
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceTutorial');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }
  }, []);

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

      <div 
        className="fixed bottom-4 right-4 flex flex-col items-end space-y-2 z-50"
        role="region"
        aria-label="Voice Assistant Controls"
      >
        {showDiagnostics && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-white rounded-lg shadow-lg max-w-sm w-[calc(100vw-2rem)] sm:w-auto relative overflow-hidden"
          >
            <DiagnosticsPanel
              onForceWhisper={() => setIsWhisperEnabled(prev => !prev)}
              isWhisperEnabled={isWhisperEnabled}
            />
          </motion.div>
        )}
        
        {/* Transcript feedback */}
        <AnimatePresence>
          {(isListening || transcript || feedback) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-sm w-[calc(100vw-2rem)] sm:w-auto relative"
              role="status"
              aria-live="polite"
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

        {/* Controls - Mobile View */}
        <div className="md:hidden relative">
          {/* Main microphone button with toggle */}
          <div className="relative">
            <button
              onClick={handleMicrophoneClick}
              className={`p-4 rounded-full transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-lg ${
                isListening ? 'bg-blue-500 text-white' : 'bg-white'
              }`}
              aria-label={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -top-2 -right-2 w-3 h-3">
                  <span className="absolute w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></span>
                  <span className="absolute w-full h-full bg-red-500 rounded-full"></span>
                </motion.div>
              )}
            </button>
            
            {/* Controls Toggle Button */}
            <button
              onClick={() => setIsControlsOpen(prev => !prev)}
              className={`absolute -top-2 -left-2 p-2 rounded-full bg-white shadow-md border border-gray-100 transition-transform ${
                isControlsOpen ? 'rotate-180' : ''
              }`}
              aria-label={isControlsOpen ? "Close controls" : "Open controls"}
            >
              <ChevronUp size={14} className="text-gray-600" />
            </button>
          </div>

          {/* Collapsible Controls Panel */}
          <AnimatePresence>
            {isControlsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-100 p-2 min-w-[200px]"
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setShowHelp(true);
                      setIsControlsOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md w-full text-left"
                    aria-label="Help"
                  >
                    <HelpCircle size={18} />
                    <span className="text-sm font-medium text-gray-700">Help</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDiagnostics(prev => !prev);
                      setIsControlsOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md w-full text-left"
                    aria-label="Settings"
                  >
                    <Settings size={18} />
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                  </button>
                  <button
                    onClick={handleMute}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md w-full text-left"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    <span className="text-sm font-medium text-gray-700">
                      {isMuted ? "Unmute" : "Mute"} Voice
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls - Desktop */}
        <div 
          className="hidden md:flex items-center space-x-2"
          role="toolbar"
          aria-label="Voice assistant controls"
        >
          <button
            onClick={() => setShowHelp(true)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label="Help and keyboard shortcuts"
            tabIndex={0}
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={() => setShowDiagnostics(prev => !prev)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label="Show diagnostics panel"
            aria-pressed={showDiagnostics}
            tabIndex={0}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={handleMute}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none"
            aria-label={isMuted ? "Unmute assistant" : "Mute assistant"}
            aria-pressed={isMuted}
            tabIndex={0}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={handleMicrophoneClick}
            className={`p-4 rounded-full transition-colors focus:ring-2 focus:ring-blue-400 focus:outline-none ${
              isListening
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-white hover:bg-gray-100 shadow-lg'
            }`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            aria-pressed={isListening}
            tabIndex={0}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>

        {/* Help Modal */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
              onClick={() => setShowHelp(false)}
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Voice Commands & Shortcuts</h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                    aria-label="Close help"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-900">Voice Commands:</h4>
                    <ul className="grid gap-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>"Search for [item]" - Search for products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>"Show my cart" - View your shopping cart</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>"What can I buy with [amount]" - Get budget suggestions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>"Filter by category [name]" - Filter products</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-500">•</span>
                        <span>"Add to cart" - Add current item to cart</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-900">Shortcuts:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <kbd className="px-2 py-1 bg-white rounded shadow text-gray-600">Space</kbd>
                        <span className="text-gray-600">Listen</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <kbd className="px-2 py-1 bg-white rounded shadow text-gray-600">M</kbd>
                        <span className="text-gray-600">Mute</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <kbd className="px-2 py-1 bg-white rounded shadow text-gray-600">R</kbd>
                        <span className="text-gray-600">Repeat</span>
                      </div>
                      <div className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <kbd className="px-2 py-1 bg-white rounded shadow text-gray-600">?</kbd>
                        <span className="text-gray-600">Help</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VoiceAssistant;
