import { AIProvider } from '../../types/aiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';

export class AIProviderManager {
  private static instance: AIProviderManager;
  private providers: AIProvider[] = [];

  constructor() {
    try {
      // Initialize providers with API keys from environment variables
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

      if (geminiKey) {
        this.providers.push(new GeminiProvider(geminiKey));
      }
      if (openaiKey) {
        this.providers.push(new OpenAIProvider(openaiKey));
      }
      if (huggingfaceKey) {
        this.providers.push(new HuggingFaceProvider(huggingfaceKey));
      }
    } catch (error) {
      console.warn('AI providers initialization failed:', error);
    }
  }

  public static getInstance(): AIProviderManager {
    if (!AIProviderManager.instance) {
      AIProviderManager.instance = new AIProviderManager();
    }
    return AIProviderManager.instance;
  }

  private getAvailableProviders(): AIProvider[] {
    return this.providers.filter(provider => provider.isAvailable());
  }

  private async tryTextGeneration(
    provider: AIProvider,
    prompt: string
  ): Promise<string | null> {
    try {
      return await provider.generateText(prompt);
    } catch (error) {
      console.error(`Text generation error with provider ${provider.name}:`, error);
      return null;
    }
  }

  private async tryStructuredResponse<T>(
    provider: AIProvider,
    prompt: string
  ): Promise<T | null> {
    try {
      return await provider.generateStructuredResponse<T>(prompt);
    } catch (error) {
      console.error(`Structured response error with provider ${provider.name}:`, error);
      return null;
    }
  }

  async generateText(prompt: string): Promise<string> {
    const availableProviders = this.getAvailableProviders();
    
    for (const provider of availableProviders) {
      const result = await this.tryTextGeneration(provider, prompt);
      if (result !== null) return result;
    }

    throw new Error('All AI providers failed to generate text');
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    const availableProviders = this.getAvailableProviders();
    
    for (const provider of availableProviders) {
      const result = await this.tryStructuredResponse<T>(provider, prompt);
      if (result !== null) return result;
    }

    throw new Error('All AI providers failed to generate structured response');
  }
}
