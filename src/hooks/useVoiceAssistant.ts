import { useEffect, useCallback, useRef, useState } from 'react';
import { matchCommand, executeIntent } from '@/lib/voice/registry';
import { useVoiceStore } from '@/stores/voiceStore';
import { VoiceCommandHandlers } from '@/types/speech';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { CartItem } from '@/contexts/cart-types';
import { NavigateFunction } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAI } from '@/hooks/useAI';
import audioProcessor from '@/lib/audio/audioProcessor';
import {
  SILENCE_TIMEOUT,
  RESTART_DELAY,
  RETRY_DELAY_BASE
} from '@/lib/voice/constants';

// Interface definitions
interface MatchResult {
  intent: string;
  slots: Record<string, any>;
  confidence?: number;
}

// Constants
const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const WHISPER_API_ENDPOINT = 'https://api-inference.huggingface.co/models/openai/whisper-large-v2';
const SILENCE_THRESHOLD = -45; // dB
const SILENCE_DURATION = 1.5; // seconds
const CONVERSATION_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

interface VoiceStateUpdate extends Partial<VoiceAssistantState> {
  isThinking?: boolean;
  voiceLevel?: number;
  confidenceLevel?: number;
}

interface UseVoiceAssistantProps {
  handlers: VoiceCommandHandlers;
  navigate: NavigateFunction;
  onStateChange?: (state: VoiceAssistantState) => void;
}

interface VoicePreferences {
  whisperEnabled: boolean;
}

interface UseVoiceAssistantReturn {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isProcessing: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  status: 'idle' | 'listening' | 'processing' | 'error';
}

interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  feedback: string;
  status: 'idle' | 'listening' | 'processing' | 'error';
}

const defaultState: VoiceAssistantState = {
  isListening: false,
  isProcessing: false,
  transcript: '',
  error: null,
  feedback: '',
  status: 'idle'
};

const updateState = (prevState: VoiceAssistantState, updates: VoiceStateUpdate): VoiceAssistantState => {
  const { isThinking, ...validUpdates } = updates;
  return {
    ...prevState,
    ...validUpdates,
    status: updates.status || prevState.status
  };
};

export const useVoiceAssistant = ({ handlers, navigate, onStateChange }: UseVoiceAssistantProps): UseVoiceAssistantReturn => {
  // State management
  const [state, setInternalState] = useState<VoiceAssistantState>(defaultState);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [preferences] = useState<VoicePreferences>({ whisperEnabled: false });

  const setState = useCallback((updates: VoiceStateUpdate) => {
    setInternalState(prev => {
      const newState = updateState(prev, updates);
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // Refs for managing audio and recognition
  const recognition = useRef<any>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const restartTimer = useRef<NodeJS.Timeout>();
  const noSpeechTimer = useRef<NodeJS.Timeout>();
  const retryCount = useRef<number>(0);
  const lastActivityTime = useRef<number>(Date.now());

  const handleCommand = useCallback((transcript: string, confidence: number = 0) => {
    setState({ status: 'processing', isThinking: true });
    console.log('Processing command:', transcript);
    
    // Always process commands in development, ignore confidence
    if (import.meta.env.DEV) {
      confidence = 1;
    }
    
    if (confidence < confidenceThreshold) {
      setState({
        feedback: 'I didn\'t quite catch that. Could you speak a little louder?',
        status: 'error',
        isThinking: false
      });
      console.log('Command ignored due to low confidence:', confidence);
      return;
    }
    
    // Try to match the command
    const match = matchCommand(transcript);
    console.log('Command match result:', match);
    
    if (!match) {
      setState({
        feedback: "I'm not sure what you mean. Try saying 'help' to see what I can do.",
        status: 'error',
        isThinking: false
      });
      return;
    }
    
    // Execute the matched intent
    try {
      executeIntent(match.intent, match.slots, {
        currentPage: '',
        navigate,
        searchProducts: async (query) => {
          console.log('Searching products with query:', query);
          if (handlers.onSearch) {
            return handlers.onSearch(query.query || '');
          }
          return [];
        },
        addToCart: async (productId, quantity = 1) => {
          console.log('Adding to cart:', productId, quantity);
          if (handlers.onAddToCart) {
            await handlers.onAddToCart({ 
              id: productId, 
              quantity,
              name: 'Product ' + productId // Temporary name, should be retrieved from product data
            });
          }
        }
      }).then(() => {
        setState({
          status: 'idle',
          isThinking: false
        });
      }).catch((error) => {
        console.error('Error executing command:', error);
        setState({
          feedback: "Sorry, I couldn't do that right now.",
          status: 'error',
          isThinking: false
        });
      });
    } catch (error) {
      console.error('Error in command execution:', error);
      setState({
        feedback: "Sorry, something went wrong.",
        status: 'error',
        isThinking: false
      });
    }
  }, [setState, handlers, navigate, confidenceThreshold]);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setState({
          error: 'Speech recognition is not supported in this browser.',
          status: 'error'
        });
        return;
      }

      if (!recognition.current) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-US';

        recognition.current.onstart = () => {
          console.log('Speech recognition started');
          setState({ 
            isListening: true,
            status: 'listening',
            error: null
          });
        };

        recognition.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const result = event.results[last];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          // Update transcript for all results
          setState({ transcript });
          console.log('Speech recognized:', transcript, 'Confidence:', confidence);
          
          // Only process final results
          if (result.isFinal) {
            handleCommand(transcript, confidence);
          }
        };

        recognition.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setState({
            error: `Microphone error: ${event.error}`,
            status: 'error',
            isListening: false
          });

          // Attempt to restart after error if still supposed to be listening
          if (state.isListening) {
            setTimeout(() => {
              try {
                recognition.current?.start();
              } catch (e) {
                console.error('Failed to restart after error:', e);
              }
            }, 1000);
          }
        };

        recognition.current.onend = () => {
          console.log('Speech recognition ended');
          
          // If we're supposed to be listening but recognition ended, restart it
          if (state.isListening && !state.error) {
            try {
              recognition.current.start();
              console.log('Restarted speech recognition');
            } catch (error) {
              console.error('Failed to restart recognition:', error);
              setState({
                error: 'Failed to restart speech recognition',
                status: 'error',
                isListening: false
              });
            }
          }
        };
      }
    };

    initializeSpeechRecognition();

    // Cleanup function
    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [setState, handleCommand, state.isListening, state.error]);

  const startListening = useCallback(async (): Promise<void> => {
    try {
      // Reset state before starting
      setState({ 
        isListening: true, 
        error: null,
        status: 'listening',
        transcript: '',
        isProcessing: false
      });
      
      if (!recognition.current) {
        setState({
          error: 'Speech recognition not initialized. Please refresh the page.',
          status: 'error',
          isListening: false
        });
        return;
      }

      // Ensure we have permission to use the microphone
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Release the stream immediately
      } catch (error) {
        console.error('Microphone permission error:', error);
        setState({
          error: 'Please allow microphone access to use voice commands.',
          status: 'error',
          isListening: false
        });
        return;
      }

      // Start recognition
      try {
        await recognition.current.start();
        console.log('Speech recognition started successfully');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'InvalidStateError') {
          // Recognition is already running, this is fine
          console.log('Recognition was already running');
        } else {
          throw error; // Re-throw other errors
        }
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setState({
        error: 'Could not start voice recognition. Please try again.',
        status: 'error',
        isListening: false
      });
    }
  }, [setState]);

  const stopListening = useCallback(() => {
    console.log('Stopping voice recognition');
    
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
    }

    if (audioStream.current) {
      audioStream.current.getTracks().forEach(track => track.stop());
      audioStream.current = null;
    }

    if (restartTimer.current) {
      clearTimeout(restartTimer.current);
      restartTimer.current = undefined;
    }

    setState({ 
      isListening: false,
      status: 'idle'
    });
  }, [setState]);

  const toggleListening = useCallback(async () => {
    if (state.isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening: state.isListening,
    transcript: state.transcript,
    error: state.error,
    isProcessing: state.isProcessing,
    startListening,
    stopListening,
    toggleListening,
    status: state.status
  };
};
