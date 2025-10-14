import { useState, useCallback } from 'react';
import { AIProviderManager } from '../services/aiProviderManager';

const aiManager = new AIProviderManager();

interface UseAIResult {
  generateResponse: (message: string, context: string[]) => Promise<string>;
  generateText: (prompt: string) => Promise<string>;
  generateStructuredResponse: <T>(prompt: string) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
}

export const useAI = (): UseAIResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateText = useCallback(async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiManager.generateText(prompt);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateStructuredResponse = useCallback(async <T>(prompt: string): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await aiManager.generateStructuredResponse<T>(prompt);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateResponse = useCallback(async (message: string, context: string[]): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `
Previous conversation:
${context.join('\n')}

User: ${message}

Respond in a helpful and natural way, keeping in mind this is an educational and lab equipment store. Reference the context of previous messages when appropriate.`;

      const response = await aiManager.generateText(prompt);
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateText,
    generateStructuredResponse,
    generateResponse,
    isLoading,
    error
  };
    generateStructuredResponse,
    isLoading,
    error,
  };
};
