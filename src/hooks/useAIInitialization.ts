import { useEffect, useState } from 'react';

interface UseAIInitializationResult {
  isInitialized: boolean;
  error: Error | null;
}

export function useAIInitialization(): UseAIInitializationResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        // Check if we have any API keys
        const env = import.meta.env;
        const hasKeys = !!(
          env.VITE_GEMINI_API_KEY ||
          env.VITE_OPENAI_API_KEY ||
          env.VITE_HUGGINGFACE_API_KEY
        );

        if (!hasKeys) {
          // Instead of throwing an error, just mark as initialized without AI features
          setIsInitialized(true);
          return;
        }

        // Initialize your AI providers here
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize AI'));
        // Still mark as initialized so the app can continue without AI features
        setIsInitialized(true);
      }
    };

    initializeAI();
  }, []);

  return { isInitialized, error };
}
