import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Mic, MicOff, HelpCircle, Volume2, VolumeX, ToggleLeft, ToggleRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoiceMicrophone } from '../VoiceMicrophone';
import TutorialModal from './TutorialModal';
import { matchCommand } from '@/lib/voice/registry';
import type { VoiceIntent } from '@/lib/voice/registry';
import { SpeechFeedback } from './SpeechFeedback';

type VoiceAction = 'search' | 'addToCart' | 'filter' | 'help' | 'checkout' | 'showCategories' | 'budgetHelp' | 'clearContext';
import type { VoiceCommandHandlers } from '@/types/speech';
import { CartItem } from '@/contexts/cart-types';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface VoiceAssistantProps {
  onSearch?: (query: string) => Promise<any[]>;
  onAddToCart?: (item: CartItem) => Promise<void>;
  onFilter?: (filters: { category?: string; minPrice?: number; maxPrice?: number }) => Promise<void>;
  onCheckout?: () => Promise<void>;
  onShowCategories?: () => Promise<void>;
  onBudgetHelp?: (budget: number) => Promise<void>;
  onClearContext?: () => Promise<void>;
}

export default function VoiceAssistant({
  onSearch,
  onAddToCart,
  onFilter,
  onCheckout,
  onShowCategories,
  onBudgetHelp,
  onClearContext
}: VoiceAssistantProps) {
  const navigate = useNavigate();

  // Local state
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenVoiceTutorial');
    return !hasSeenTutorial;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);

  // Track refs
  const lastUpdateRef = useRef<number>(0);
  const feedbackTimeoutRef = useRef<number>();

  // Initialize speech synthesis
  const { speak: syntheticSpeak, stop: stopSpeaking } = useSpeechSynthesis({
    pitch: 1.0,
    rate: 1.0,
    volume: isMuted ? 0 : 1.0
  });

  // Handle speech feedback with debouncing
  const handleSpeak = useCallback((text: string) => {
    if (!text || text === feedback) return;
    
    const now = Date.now();
    if (now - lastUpdateRef.current < 150) return;
    
    lastUpdateRef.current = now;
    
    if (feedbackTimeoutRef.current) {
      window.cancelAnimationFrame(feedbackTimeoutRef.current);
    }
    
    feedbackTimeoutRef.current = window.requestAnimationFrame(() => {
      setFeedback(text);
      setShowFeedback(true);
      
      if (!isMuted) {
        stopSpeaking();
        window.requestAnimationFrame(async () => {
          try {
            await syntheticSpeak(text);
          } catch (error) {
            if (!error?.message?.includes('interrupted')) {
              console.error('Speech synthesis error:', error);
            }
          }
        });
      }
    });
  }, [isMuted, syntheticSpeak, stopSpeaking, feedback]);

  // Handle command processing
  const handleCommand = useCallback(async (text: string) => {
    console.log('Processing command:', text);
    
    const match = matchCommand(text);
    if (!match) {
      handleSpeak("I'm not sure what you mean. Try saying 'help' to see what I can do.");
      setIsProcessing(false);
      return;
    }

    try {
      switch ((match.intent as VoiceIntent).name as VoiceAction) {
        case 'search':
          if (onSearch && match.slots.query) {
            handleSpeak(`Searching for ${match.slots.query}...`);
            await onSearch(match.slots.query);
          }
          break;

        case 'addToCart':
          if (onAddToCart && match.slots.productId) {
            const item: CartItem = {
              id: match.slots.productId,
              quantity: match.slots.quantity || 1,
              name: match.slots.productName || `Product ${match.slots.productId}`,
              price: match.slots.price || 0,
              image: match.slots.image || '/placeholder.png'
            };
            handleSpeak(`Adding ${item.name} to cart...`);
            await onAddToCart(item);
          }
          break;

        case 'filter':
          if (onFilter) {
            handleSpeak(`Applying filters...`);
            await onFilter(match.slots);
          }
          break;

        case 'help':
          setShowHelp(true);
          handleSpeak("Here are some things I can help you with.");
          break;

        case 'checkout':
          if (onCheckout) {
            handleSpeak('Taking you to checkout...');
            await onCheckout();
          }
          break;

        case 'showCategories':
          if (onShowCategories) {
            handleSpeak('Showing all categories...');
            await onShowCategories();
          }
          break;

        case 'budgetHelp':
          if (onBudgetHelp && match.slots.budget) {
            handleSpeak(`Looking for items within your ${match.slots.budget} dollar budget...`);
            await onBudgetHelp(match.slots.budget);
          }
          break;

        case 'clearContext':
          if (onClearContext) {
            handleSpeak('Clearing current context...');
            await onClearContext();
          }
          break;

        default:
          handleSpeak("I'm not sure how to handle that command.");
          break;
      }

      setIsProcessing(false);
      setTranscript('');
      
      if (isContinuousMode) {
        handleSpeak('Anything else I can help you with?');
      }
    } catch (error) {
      console.error('Error executing command:', error);
      handleSpeak("Sorry, I couldn't do that right now.");
      setIsProcessing(false);
    }
  }, [
    handleSpeak,
    isContinuousMode,
    onSearch,
    onAddToCart,
    onFilter,
    onCheckout,
    onShowCategories,
    onBudgetHelp,
    onClearContext
  ]);

  // Initialize voice microphone
  const { isListening, toggleListening } = useVoiceMicrophone({
    onTranscript: useCallback((text: string, isFinal: boolean) => {
      // Update transcript immediately for feedback
      setTranscript(text);
      
      // Process final results
      if (isFinal && !isProcessing) {
        setIsProcessing(true);
        handleCommand(text);
      }
    }, [setTranscript, isProcessing, handleCommand]),
    onError: useCallback((errorMessage: string) => {
      setError(errorMessage);
      handleSpeak(errorMessage);
    }, [setError, handleSpeak]),
    isEnabled: !isProcessing && !error
  });

  // Handle microphone click
  const handleMicrophoneClick = useCallback(async () => {
    try {
      await toggleListening();
      if (!isListening) {
        setTranscript('');
        setFeedback('');
        setShowFeedback(false);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      handleSpeak('Sorry, there was an error with the microphone. Please check your audio settings and try again.');
    }
  }, [toggleListening, isListening, handleSpeak]);

  // UI Handlers
  const handleToggleMute = () => {
    setIsMuted(prev => {
      if (!prev) stopSpeaking();
      return !prev;
    });
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    stopSpeaking();
  };

  const handleToggleContinuousMode = () => {
    setIsContinuousMode(prev => {
      handleSpeak(prev ? 'Continuous mode disabled' : 'Continuous mode enabled');
      return !prev;
    });
  };

  // Cleanup effects
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (feedbackTimeoutRef.current) {
        window.cancelAnimationFrame(feedbackTimeoutRef.current);
      }
    };
  }, [stopSpeaking]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopSpeaking();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [stopSpeaking]);

  // Save tutorial state
  useEffect(() => {
    if (!isTutorialOpen) {
      localStorage.setItem('hasSeenVoiceTutorial', 'true');
    }
  }, [isTutorialOpen]);

  // Hide feedback after delay
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  // Render
  return (
    <div className="relative z-50">
      <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-2">
        {/* Feedback overlay */}
        {showFeedback && feedback && (
          <SpeechFeedback 
            text={feedback} 
            isVisible={true} 
            onClose={handleCloseFeedback} 
            autoHideDelay={5000} 
          />
        )}

        {/* Control buttons */}
        <div className="flex items-center space-x-2">
          {/* Help button */}
          <button 
            className="p-2 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle size={24} />
          </button>

          {/* Mute toggle */}
          <button
            className="p-2 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={handleToggleMute}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          {/* Continuous mode toggle */}
          <button
            className="p-2 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={handleToggleContinuousMode}
          >
            {isContinuousMode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>

          {/* Microphone toggle */}
          <button
            className="p-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            onClick={handleMicrophoneClick}
            disabled={!!error}
          >
            {isListening ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
        </div>
      </div>

      {/* Help modal */}
      {showHelp && (
        <TutorialModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          onSkip={() => setShowHelp(false)}
        />
      )}

      {/* First-time tutorial */}
      {isTutorialOpen && (
        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => {
            setIsTutorialOpen(false);
            localStorage.setItem('hasSeenVoiceTutorial', 'true');
            handleSpeak("Tutorial completed. Try saying 'Help' anytime to see what I can do!");
          }}
          onSkip={() => {
            setIsTutorialOpen(false);
            localStorage.setItem('hasSeenVoiceTutorial', 'true');
            handleSpeak("Tutorial skipped. Say 'Help' anytime to see what I can do!");
          }}
        />
      )}
    </div>
  );
}
