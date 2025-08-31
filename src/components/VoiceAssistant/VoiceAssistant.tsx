import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('voiceAssistantUserName') || '');
  const [showHelp, setShowHelp] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Timer ref for auto-deactivation
  const deactivationTimer = useRef<NodeJS.Timeout>();
  const inactivityTimeout = 10000; // 10 seconds
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const recognition = useRef<any>(null);
  const synthesis = window.speechSynthesis;

  // Check tutorial status
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceAssistantTutorial');
    if (!hasSeenTutorial) {
      setIsTutorialOpen(true);
    }
  }, []);

  // Handle tutorial completion
  const handleTutorialClose = () => {
    setIsTutorialOpen(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('hasSeenVoiceAssistantTutorial', 'true');
    setIsTutorialOpen(false);
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      speak('I need microphone permission to help you. Please enable it in your browser settings.');
      return false;
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      try {
        if (!('webkitSpeechRecognition' in window)) {
          console.error('Speech recognition not supported');
          speak('Speech recognition is not supported in your browser. Please use Chrome.');
          return;
        }

        recognition.current = new (window as any).webkitSpeechRecognition();
        recognition.current.continuous = false; // Changed to false to better handle commands
        recognition.current.interimResults = false; // Changed to false for more accurate results
        recognition.current.lang = 'en-US'; // Set language explicitly
        
        recognition.current.onstart = () => {
          console.log('Speech recognition started');
          setTranscript('Listening...');
        };

        recognition.current.onresult = (event: any) => {
          console.log('Speech recognition result received');
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript.toLowerCase();
          console.log('Transcript:', transcript);
          setTranscript(transcript);
          handleCommand(transcript);
        };

        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            speak("I didn't hear anything. Please try speaking again.");
          } else {
            speak('Sorry, I had trouble hearing you. Please try again.');
          }
        };

        recognition.current.onend = () => {
          console.log('Speech recognition ended');
          if (isListening) {
            console.log('Restarting speech recognition');
            recognition.current.start();
          } else {
            setTranscript('');
          }
        };
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        speak('There was an error initializing speech recognition. Please refresh the page.');
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, [isListening]);

  // Initialize speech synthesis
  useEffect(() => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      setFeedback('Speech synthesis is not supported in your browser. Please use Chrome.');
      return;
    }

    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log('Voices loaded:', voices.length);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Text-to-speech feedback
  const speak = useCallback((text: string) => {
    if (isMuted) return;
    if (!text) return;

    try {
      console.log('Speaking:', text);
      setFeedback(text);
      
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

      utterance.onstart = () => {
        console.log('Speech started');
      };

      utterance.onend = () => {
        console.log('Speech ended');
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
      };

      synthesis.speak(utterance);
    } catch (error) {
      console.error('Error in speak function:', error);
      setFeedback('Sorry, there was an error with text-to-speech.');
    }
  }, [isMuted]);

  // Handle voice commands
  const handleCommand = useCallback((command: string) => {
    if (!command) return;

    // Activation command
    if (command.includes('hey assistant')) {
      speak('Hello! How can I help you today?');
      return;
    }

    // Search commands
    if (command.includes('search for')) {
      const query = command.replace('search for', '').trim();
      if (onSearch) {
        onSearch(query);
        speak(`Searching for ${query}`);
      }
    }
    
    // Navigation commands
    else if (command.includes('go to') || command.includes('show') || command.includes('take me to')) {
      const destination = command.replace(/(go to|show|take me to)/g, '').trim();
      
      if (destination.includes('cart') || destination.includes('basket')) {
        navigate('/cart');
        speak('Opening your shopping cart');
      }
      else if (destination.includes('checkout')) {
        navigate('/checkout');
        speak('Taking you to checkout');
      }
      else if (destination.includes('home')) {
        navigate('/');
        speak('Going to home page');
      }
      else if (destination.includes('categories')) {
        navigate('/categories');
        speak('Showing all categories');
      }
    }
    
    // Cart commands
    else if (command.includes('add to cart') || command.includes('buy this')) {
      if (onAddToCart) {
        speak('Added to your cart. Would you like to view your cart or continue shopping?');
      }
    }
    else if (command.includes('remove from cart')) {
      speak('Which item would you like to remove from your cart?');
    }
    
    // Filter commands
    else if (command.includes('filter by') || command.includes('show me')) {
      if (command.includes('category')) {
        const category = command.split('category')[1].trim();
        onFilter?.({ category });
        speak(`Showing items in the ${category} category`);
      }
      else if (command.includes('under') || command.includes('less than')) {
        const price = command.match(/\d+/);
        if (price) {
          onFilter?.({ maxPrice: parseInt(price[0]) });
          speak(`Showing items under ${price[0]} dollars`);
        }
      }
    }
    
    // Budget-based suggestions
    else if (command.includes('what can i buy with')) {
      const budget = command.match(/\d+/);
      if (budget) {
        onFilter?.({ maxPrice: parseInt(budget[0]) });
        speak(`Let me find items within your ${budget[0]} dollar budget`);
      }
    }
    
    // Help commands
    else if (command.includes('help') || command.includes('what can you do')) {
      setShowHelp(true);
      speak('Here are the commands I understand: search for items, show cart, filter by category, add to cart, and more. You can also ask about what you can buy within your budget.');
    }
    
    // Tutorial command
    else if (command.includes('show tutorial') || command.includes('start tutorial')) {
      setIsTutorialOpen(true);
      speak('Opening the voice assistant tutorial');
    }
    
    // Personalization
    else if (command.includes('call me')) {
      const name = command.replace('call me', '').trim();
      setUserName(name);
      localStorage.setItem('voiceAssistantUserName', name);
      speak(`Hello ${name}, how can I help you shop today?`);
    }
    
    // Accessibility commands
    else if (command.includes('read description') || command.includes('tell me about this')) {
      speak('Reading the current item description...');
    }
  }, [navigate, onSearch, onAddToCart, onFilter, speak]);

  const startDeactivationTimer = useCallback(() => {
    // Clear any existing timer
    if (deactivationTimer.current) {
      clearTimeout(deactivationTimer.current);
    }

    // Set new timer
    deactivationTimer.current = setTimeout(() => {
      setIsActive(false);
      setIsListening(false);
      setFeedback('');
      setTranscript('');
      if (recognition.current) {
        recognition.current.stop();
      }
    }, inactivityTimeout);
  }, []);

  // Reset timer on any user interaction
  const resetDeactivationTimer = useCallback(() => {
    if (isActive) {
      startDeactivationTimer();
    }
  }, [isActive, startDeactivationTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (deactivationTimer.current) {
        clearTimeout(deactivationTimer.current);
      }
    };
  }, []);

  const toggleMicrophone = async () => {
    try {
      // Check browser support first
      if (!('webkitSpeechRecognition' in window)) {
        speak('Speech recognition is not supported in your browser. Please use Chrome.');
        return;
      }

      // Request permission if not granted
      if (!permissionGranted) {
        const granted = await requestMicrophonePermission();
        if (!granted) {
          speak('I need microphone permission to help you. Please enable it in your browser settings.');
          return;
        }
      }

      // If not active, activate first
      if (!isActive) {
        setIsActive(true);
        speak("Hello! I'm your voice assistant. How can I help you today?");
        startDeactivationTimer();
        return;
      }

      console.log('Toggling microphone, current state:', isListening);

      // Toggle listening state
      if (isListening) {
        console.log('Stopping recognition');
        if (recognition.current) {
          recognition.current.stop();
        }
        setIsListening(false);
      } else {
        console.log('Starting recognition');
        if (recognition.current) {
          try {
            await recognition.current.start();
            setIsListening(true);
            speak('Listening...');
          } catch (error) {
            console.error('Error starting recognition:', error);
            // Try to reinitialize recognition if it fails
            recognition.current = new (window as any).webkitSpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.interimResults = false;
            recognition.current.lang = 'en-US';
            await recognition.current.start();
            setIsListening(true);
          }
        }
      }
      resetDeactivationTimer();
    } catch (error) {
      console.error('Error in toggleMicrophone:', error);
      speak('Sorry, there was an error with the microphone. Please try again.');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      synthesis.cancel(); // Stop any ongoing speech
    }
    resetDeactivationTimer();
  };

  const deactivate = () => {
    setIsActive(false);
    setIsListening(false);
    setFeedback('');
    setTranscript('');
    if (recognition.current) {
      recognition.current.stop();
    }
    if (deactivationTimer.current) {
      clearTimeout(deactivationTimer.current);
    }
  };

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Voice Assistant Error</h2>
          <p className="mb-4 text-sm text-gray-600">
            {error.message || 'An error occurred with the voice assistant.'}
          </p>
          <button
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          {isActive && (isListening || feedback) && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-4 max-w-sm relative"
              onClick={resetDeactivationTimer}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deactivate();
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              <p className="text-sm text-gray-600 pr-6">
                {isListening ? transcript || 'Listening...' : feedback}
              </p>
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
            onClick={toggleMute}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label={isMuted ? "Unmute assistant" : "Mute assistant"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <button
            onClick={toggleMicrophone}
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
            >
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
