import { useEffect, useCallback, useRef } from 'react';
import { matchCommand } from '@/lib/commandRegistry';
import { useVoiceStore } from '@/stores/voiceStore';
import audioProcessor from '@/services/audioProcessor';
import { VoiceCommandHandlers } from '@/types/speech';

// Constants
const HUGGING_FACE_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY;
const WHISPER_API_ENDPOINT = 'https://api-inference.huggingface.co/models/openai/whisper-large-v2';
const SILENCE_TIMEOUT = 10000;
const RESTART_DELAY = 500;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

export const useVoiceAssistant = (handlers: VoiceCommandHandlers) => {
  const {
    state,
    setState,
    preferences,
    confidenceThreshold,
    updateConfidenceThreshold,
    addCommand,
    recordError,
    resetErrors
  } = useVoiceStore();

  // Refs for managing audio and recognition
  const recognition = useRef<any>(null);
  const audioStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const restartTimer = useRef<NodeJS.Timeout>();
  const noSpeechTimer = useRef<NodeJS.Timeout>();
  const retryCount = useRef<number>(0);
  const lastActivityTime = useRef<number>(Date.now());

  // Process audio with Whisper API
  const processWhisperAudio = async (audioBlob: Blob) => {
    try {
      setState({ isProcessing: true });

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch(WHISPER_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Whisper API request failed');

      const result = await response.json();
      if (result.text) {
        handleCommand(result.text, 0.8); // Assume decent confidence for Whisper
      }

      setState({ isProcessing: false });
    } catch (error) {
      console.error('Whisper API error:', error);
      setState({
        error: 'Failed to process speech. Please try again.',
        isProcessing: false,
        isListening: false
      });
    }
  };

  // Initialize Whisper API recording
  const initializeWhisperRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      audioStream.current = stream;
      audioChunks.current = [];

      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processWhisperAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setState({ isListening: true, error: null });
    } catch (error) {
      console.error('Error initializing Whisper recording:', error);
      setState({ 
        error: 'Failed to initialize audio recording. Please check your microphone.',
        isListening: false
      });
    }
  };

  // Handle voice commands with enhanced natural language processing
  const handleCommand = useCallback((transcript: string, confidence: number = 0) => {
    setState({ status: 'processing', isThinking: true });
    
    if (confidence < confidenceThreshold) {
      setState({
        feedback: 'I didn\'t quite catch that. Could you speak a little louder?',
        status: 'error',
        isThinking: false
      });
      console.log('Command ignored due to low confidence:', confidence);
      return;
    }

    // Update activity timestamp
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

    // Match command using fuzzy matching
    const matchResult = matchCommand(transcript);
    if (!matchResult) {
      console.log('No matching command found');
      return;
    }

    // Add to command history
    addCommand(transcript);

    // Execute matched command
    switch (matchResult.intent) {
      case 'search':
        if (handlers.onSearch && matchResult.slots.query) {
          handlers.onSearch(matchResult.slots.query);
        }
        break;
      case 'addToCart':
        if (handlers.onAddToCart && matchResult.slots.item) {
          handlers.onAddToCart(matchResult.slots.item);
        }
        break;
      case 'checkout':
        if (handlers.onCheckout) {
          handlers.onCheckout();
        }
        break;
      case 'showCategories':
        if (handlers.onShowCategories) {
          handlers.onShowCategories();
        }
        break;
      case 'budgetHelp':
        if (handlers.onBudgetHelp && matchResult.slots.budget) {
          handlers.onBudgetHelp(matchResult.slots.budget);
        }
        break;
      case 'filter':
        if (handlers.onFilter) {
          const filters: { category?: string; minPrice?: number; maxPrice?: number } = {};
          if (matchResult.slots.category) filters.category = matchResult.slots.category;
          if (matchResult.slots.minPrice) filters.minPrice = matchResult.slots.minPrice;
          if (matchResult.slots.maxPrice) filters.maxPrice = matchResult.slots.maxPrice;
          handlers.onFilter(filters);
        }
        break;
    }

    // Adjust confidence threshold based on success
    updateConfidenceThreshold(
      Math.min(0.9, confidenceThreshold + (matchResult.confidence > 0.8 ? 0.05 : -0.05))
    );

    // Reset error count on successful command
    resetErrors();
  }, [handlers, confidenceThreshold, updateConfidenceThreshold, addCommand, resetErrors]);

  // Initialize Web Speech API with fallback
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

      // Handle recognition results
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

        setState({ 
          transcript: finalTranscript || interimTranscript,
          confidenceLevel: maxConfidence,
          isProcessing: false
        });
      };

      // Enhanced error handling
      recognition.current.onerror = async (event: any) => {
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

        setState({ 
          error: errorMessage,
          isListening: false,
          isProcessing: false
        });

        recordError(event.error);

        if (['network', 'audio-capture', 'not-allowed'].includes(event.error)) {
          if (preferences.whisperEnabled) {
            await initializeWhisperRecording();
          }
        }
      };

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

      return true;
    }
    return false;
  }, [state.isListening, state.error, setState, handleCommand, preferences.whisperEnabled, recordError]);

  // Check and request microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (result.state === 'denied') {
        setState({
          error: 'Microphone access is blocked. Please allow microphone access in your browser settings.',
          isListening: false,
          isProcessing: false,
          status: 'error'
        });
        return false;
      }
      return true;
    } catch (error) {
      console.log('Permissions API not supported, falling back to getUserMedia');
      return true; // Proceed with getUserMedia which will handle its own permissions
    }
  };

  // Start listening with exponential backoff
  const startListening = useCallback(async () => {
    setState({ 
      error: null, 
      isProcessing: true,
      status: 'listening',
      feedback: 'Initializing microphone...'
    });
    lastActivityTime.current = Date.now();

    try {
      // Check permissions first
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;

      // Clear existing timers
      if (restartTimer.current) clearTimeout(restartTimer.current);
      if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);

      // Request microphone access with retry
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (error: any) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setState({
            error: 'Please allow microphone access to use voice commands.',
            isListening: false,
            isProcessing: false,
            status: 'error',
            feedback: 'Microphone access needed'
          });
          return;
        }
        throw error;
      }
      
      audioStream.current = stream;

      // Start audio processing for voice activity detection
      await audioProcessor.start((level) => {
        if (state.isListening) {
          setState({ voiceLevel: level });
        }
      });

      if (!recognition.current) {
        const initialized = initializeWebSpeech();
        if (!initialized && preferences.whisperEnabled) {
          await initializeWhisperRecording();
          return;
        }
      }

      recognition.current.start();
      
      noSpeechTimer.current = setTimeout(() => {
        if (Date.now() - lastActivityTime.current > SILENCE_TIMEOUT) {
          setState({
            error: 'No speech detected. Please try speaking again.',
            isListening: false,
            isProcessing: false
          });
          stopListening();
        }
      }, SILENCE_TIMEOUT);

      setState({ 
        isListening: true,
        isProcessing: false,
        error: null
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      
      const retryDelay = RETRY_DELAY_BASE * Math.pow(2, retryCount.current);
      retryCount.current++;

      if (retryCount.current < MAX_RETRIES) {
        setTimeout(() => startListening(), retryDelay);
      } else {
        setState({
          error: 'Failed to start voice recognition. Please try again later.',
          isListening: false,
          isProcessing: false
        });
        
        if (preferences.whisperEnabled) {
          await initializeWhisperRecording();
        }
      }
    }
  }, [state.isListening, setState, initializeWebSpeech, preferences.whisperEnabled]);

  // Stop listening and clean up
  const stopListening = useCallback(() => {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    if (noSpeechTimer.current) clearTimeout(noSpeechTimer.current);

    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop();
    }

    audioProcessor.stop();

    if (audioStream.current) {
      audioStream.current.getTracks().forEach(track => track.stop());
      audioStream.current = null;
    }

    setState({
      isListening: false,
      isProcessing: false,
      transcript: ''
    });

    retryCount.current = 0;
  }, [setState]);

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
    toggleListening
  };
};

export default useVoiceAssistant;
