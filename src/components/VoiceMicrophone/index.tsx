import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceMicrophoneProps {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  isEnabled?: boolean;
}

export const useVoiceMicrophone = ({ onTranscript, onError, isEnabled = true }: VoiceMicrophoneProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognition = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognition.current && SpeechRecognition) {
      const instance = new SpeechRecognition();
      
      // Configure for continuous recognition
      instance.continuous = true;
      instance.interimResults = true;
      instance.maxAlternatives = 1;
      instance.lang = 'en-US';

      recognition.current = instance;
    }

    return () => {
      if (recognition.current) {
        try {
          recognition.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Set up recognition handlers
  useEffect(() => {
    if (!recognition.current) return;

    recognition.current.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      isStartingRef.current = false;
    };

    recognition.current.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const transcript = result[0].transcript;
      
      console.log('Speech recognized:', transcript, 'Final:', result.isFinal);
      onTranscript(transcript, result.isFinal);
    };

    recognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        onError?.('Microphone access denied');
        setIsListening(false);
      }
    };

    recognition.current.onend = () => {
      console.log('Speech recognition ended, should be listening:', isListening);
      
      // Immediately restart if we should be listening
      if (isListening && !isStartingRef.current && isEnabled) {
        console.log('Restarting speech recognition');
        isStartingRef.current = true;
        
        // Small delay to ensure clean restart
        setTimeout(() => {
          try {
            if (isListening && isEnabled) { // Double-check state
              recognition.current?.start();
              console.log('Successfully restarted speech recognition');
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('already running')) {
              console.log('Recognition was already running');
            } else {
              console.error('Failed to restart recognition:', error);
              setIsListening(false);
              onError?.('Failed to restart speech recognition');
            }
          } finally {
            isStartingRef.current = false;
          }
        }, 50);
      }
    };
  }, [isListening, onTranscript, onError, isEnabled]);

  const startListening = useCallback(async () => {
    if (!recognition.current || !isEnabled) return;

    try {
      // Request microphone access first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start recognition
      await recognition.current.start();
      console.log('Speech recognition started');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      setIsListening(false);
      if (error instanceof Error && error.name === 'NotAllowedError') {
        onError?.('Please allow microphone access');
      } else {
        onError?.('Could not start voice recognition');
      }
    }
  }, [isEnabled, onError]);

  const stopListening = useCallback(() => {
    if (!recognition.current) return;

    try {
      recognition.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    startListening,
    stopListening,
    toggleListening
  };
};
