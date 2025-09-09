import { useState, useCallback, useEffect } from 'react';

interface SpeechOptions {
  voice?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  textQueue: string[];
  currentText: string | null;
}

export const useSpeechSynthesis = (defaultOptions: SpeechOptions = {}) => {
  const [state, setState] = useState<SpeechState>({
    isSpeaking: false,
    isPaused: false,
    textQueue: [],
    currentText: null
  });

  const synthesis = window.speechSynthesis;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    if (typeof synthesis !== 'undefined' && synthesis.onvoiceschanged !== undefined) {
      synthesis.onvoiceschanged = loadVoices;
    }
  }, [synthesis]);

  // Get the best voice for our assistant
  const getBestVoice = useCallback(() => {
    if (!voices.length) return null;

    // Prefer a female English voice
    return (
      voices.find(voice => 
        voice.lang.startsWith('en') && 
        voice.name.toLowerCase().includes('female')
      ) ||
      voices.find(voice => voice.lang.startsWith('en')) ||
      voices[0]
    );
  }, [voices]);

  const speak = useCallback((
    text: string, 
    options: SpeechOptions = {}
  ): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      if (!synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech and clear the queue
      stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options with defaults
      const voice = getBestVoice();
      if (voice) utterance.voice = voice;
      utterance.pitch = options.pitch ?? defaultOptions.pitch ?? 1;
      utterance.rate = options.rate ?? defaultOptions.rate ?? 1;
      utterance.volume = options.volume ?? defaultOptions.volume ?? 1;

      // Update state when speaking starts
      setState(prev => ({
        ...prev,
        isSpeaking: true,
        currentText: text,
      }));

      // Handle speech events
      utterance.onend = () => {
        setState(prev => {
          const newQueue = [...prev.textQueue];
          if (newQueue.length > 0) {
            const nextText = newQueue.shift();
            if (nextText) {
              speak(nextText, options); // Speak next in queue
            }
          }
          return {
            ...prev,
            isSpeaking: newQueue.length > 0,
            textQueue: newQueue,
            currentText: null,
          };
        });
        resolve();
      };

      utterance.onerror = (event) => {
        setState(prev => ({
          ...prev,
          isSpeaking: false,
          currentText: null,
        }));
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Speak the text
      synthesis.speak(utterance);
    });
  }, [synthesis, getBestVoice, defaultOptions]);

  const stop = useCallback(() => {
    if (synthesis) {
      synthesis.cancel();
      setState(prev => ({
        ...prev,
        isSpeaking: false,
        isPaused: false,
        textQueue: [],
        currentText: null,
      }));
    }
  }, [synthesis]);

  const pause = useCallback(() => {
    if (synthesis) {
      synthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [synthesis]);

  const resume = useCallback(() => {
    if (synthesis) {
      synthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [synthesis]);

  const queueSpeak = useCallback((text: string, options: SpeechOptions = {}) => {
    setState(prev => {
      const newQueue = [...prev.textQueue, text];
      if (!prev.isSpeaking) {
        speak(text, options); // Start speaking if not already speaking
        return {
          ...prev,
          textQueue: newQueue.slice(1), // Remove the first item since we're speaking it
        };
      }
      return {
        ...prev,
        textQueue: newQueue,
      };
    });
  }, [speak]);

  return {
    speak,
    stop,
    pause,
    resume,
    queueSpeak,
    state,
    voices,
  };
};
