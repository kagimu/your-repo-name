import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceAssistantState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  supported: boolean;
  isProcessing: boolean;
  confidenceLevel: number;
}

interface VoiceCommandHandlers {
  onSearch?: (query: string) => void;
  onAddToCart?: (item: string) => void;
  onFilter?: (filters: { category?: string; minPrice?: number; maxPrice?: number }) => void;
  onCheckout?: () => void;
  onShowCategories?: () => void;
  onBudgetHelp?: (budget: number) => void;
}

const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const WHISPER_API_ENDPOINT = 'https://api-inference.huggingface.co/models/openai/whisper-large-v2';

// Minimum confidence level to accept a command
const MIN_CONFIDENCE = 0.7;
// Time without speech before auto-stopping
const SILENCE_TIMEOUT = 10000;
// Time between recognition restarts
const RESTART_DELAY = 500;

export const useVoiceAssistant = (handlers: VoiceCommandHandlers) => {
  const [state, setState] = useState<VoiceAssistantState>({
    isListening: false,
    transcript: '',
    error: null,
    supported: false,
    isProcessing: false,
    confidenceLevel: 0
  });

  const recognition = useRef<any>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const restartTimer = useRef<NodeJS.Timeout>();
  const noSpeechTimer = useRef<NodeJS.Timeout>();
  const lastActivityTime = useRef<number>(Date.now());
  const audioStream = useRef<MediaStream | null>(null);

  // Handle voice commands with confidence check
  const handleCommand = useCallback((transcript: string, confidence: number = 0) => {
    if (confidence < MIN_CONFIDENCE) {
      console.log('Command ignored due to low confidence:', confidence);
      return;
    }

    // Update last activity time
    lastActivityTime.current = Date.now();

    // Reset no-speech timer
    if (noSpeechTimer.current) {
      clearTimeout(noSpeechTimer.current);
      noSpeechTimer.current = setTimeout(() => {
        if (Date.now() - lastActivityTime.current > SILENCE_TIMEOUT) {
          stopListening();
        }
      }, SILENCE_TIMEOUT);
    }

    // Process commands
    const command = transcript.toLowerCase().trim();

    if (command.includes('search for') && handlers.onSearch) {
      const query = command.replace('search for', '').trim();
      handlers.onSearch(query);
    }
    else if (command.includes('add to cart') && handlers.onAddToCart) {
      const item = command.replace('add to cart', '').trim();
      handlers.onAddToCart(item);
    }
    else if (command.includes('checkout') && handlers.onCheckout) {
      handlers.onCheckout();
    }
    else if (command.includes('show categories') && handlers.onShowCategories) {
      handlers.onShowCategories();
    }
    else if (command.includes('help me shop with') && handlers.onBudgetHelp) {
      const match = command.match(/\d+/);
      if (match) {
        handlers.onBudgetHelp(parseInt(match[0]));
      }
    }
    else if (command.includes('filter') && handlers.onFilter) {
      let filters: { category?: string; minPrice?: number; maxPrice?: number } = {};
      
      if (command.includes('category')) {
        const category = command.split('category')[1].trim();
        filters.category = category;
      }
      if (command.includes('under')) {
        const match = command.match(/under\s+(\d+)/);
        if (match) {
          filters.maxPrice = parseInt(match[1]);
        }
      }
      if (command.includes('over')) {
        const match = command.match(/over\s+(\d+)/);
        if (match) {
          filters.minPrice = parseInt(match[1]);
        }
      }
      
      handlers.onFilter(filters);
    }
  }, [handlers]);

  // Initialize Web Speech API with enhanced features
  const initializeWebSpeech = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || 
                            (window as any).webkitSpeechRecognition ||
                            (window as any).mozSpeechRecognition ||
                            (window as any).msSpeechRecognition;

    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 3;
      recognition.current.lang = 'en-US';

      // Handle interim and final results
      recognition.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let maxConfidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            maxConfidence = Math.max(maxConfidence, confidence);
            handleCommand(transcript, confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({ 
          ...prev, 
          transcript: finalTranscript || interimTranscript,
          confidenceLevel: maxConfidence,
          isProcessing: false
        }));
      };

      // Enhanced error handling
      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event);
        let errorMessage = 'Speech recognition error.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone detected. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Falling back to offline recognition.';
            break;
          case 'aborted':
            errorMessage = 'Recognition was aborted. Please try again.';
            break;
          default:
            errorMessage = 'Speech recognition error. Falling back to Whisper API.';
        }

        setState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isListening: false,
          isProcessing: false
        }));

        if (['network', 'audio-capture', 'service-not-allowed'].includes(event.error)) {
          initializeWhisperRecording();
        }
      };

      // Handle end of recognition with auto-restart
      recognition.current.onend = () => {
        if (state.isListening && !state.error) {
          restartTimer.current = setTimeout(() => {
            try {
              recognition.current.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
            }
          }, RESTART_DELAY);
        }
      };

      setState(prev => ({ ...prev, supported: true }));
      return true;
    }
    return false;
  }, [state.isListening, handleCommand]);

  // Start listening with enhanced features
  const startListening = useCallback(async () => {
    setState(prev => ({ 
      ...prev, 
      error: null,
      isProcessing: true 
    }));

    lastActivityTime.current = Date.now();

    try {
      // Request microphone with noise reduction
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      audioStream.current = stream;

      if (!recognition.current) {
        const initialized = initializeWebSpeech();
        if (!initialized) {
          throw new Error('Speech recognition not supported');
        }
      }

      // Clear existing timers
      if (restartTimer.current) clearTimeout(restartTimer.current);
      if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);

      // Start recognition
      recognition.current.start();
      
      // Set no-speech detection timer
      noSpeechTimer.current = setTimeout(() => {
        if (Date.now() - lastActivityTime.current > SILENCE_TIMEOUT) {
          setState(prev => ({
            ...prev,
            error: 'No speech detected. Please try speaking again.',
            isListening: false,
            isProcessing: false
          }));
          stopListening();
        }
      }, SILENCE_TIMEOUT);

      setState(prev => ({ 
        ...prev, 
        isListening: true,
        isProcessing: false,
        error: null
      }));
    } catch (error) {
      console.error('Error starting recognition:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start voice recognition. Please try again.',
        isListening: false,
        isProcessing: false
      }));
      initializeWhisperRecording();
    }
  }, [initializeWebSpeech]);

  // Stop listening with cleanup
  const stopListening = useCallback(() => {
    // Clear timers
    if (restartTimer.current) clearTimeout(restartTimer.current);
    if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);

    // Stop Web Speech API
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    // Stop media recorder
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }

    // Stop and cleanup audio stream
    if (audioStream.current) {
      audioStream.current.getTracks().forEach(track => track.stop());
      audioStream.current = null;
    }

    setState(prev => ({
      ...prev,
      isListening: false,
      isProcessing: false,
      transcript: ''
    }));
  }, []);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    isProcessing: state.isProcessing
  };
};
