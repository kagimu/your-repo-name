import { AIProvider } from '../../types/aiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';

export class AIProviderManager {
  private static instance: AIProviderManager | null = null;
  private providers: AIProvider[] = [];
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AIProviderManager {
    if (!this.instance) {
      this.instance = new AIProviderManager();
    }
    return this.instance;
  }

  public initialize(): boolean {
    if (this.isInitialized) return this.providers.length > 0;

    try {
      const env = import.meta.env;
      const keys = {
        gemini: env.VITE_GEMINI_API_KEY,
        openai: env.VITE_OPENAI_API_KEY,
        huggingface: env.VITE_HUGGINGFACE_API_KEY
      };

      let hasInitializedProvider = false;

      if (typeof keys.gemini === 'string' && keys.gemini.length > 0) {
        try {
          this.providers.push(new GeminiProvider(keys.gemini));
          hasInitializedProvider = true;
        } catch (e) {
          console.warn('Failed to initialize Gemini provider:', e);
        }
      }

      if (typeof keys.openai === 'string' && keys.openai.length > 0) {
        try {
          this.providers.push(new OpenAIProvider(keys.openai));
          hasInitializedProvider = true;
        } catch (e) {
          console.warn('Failed to initialize OpenAI provider:', e);
        }
      }

      if (typeof keys.huggingface === 'string' && keys.huggingface.length > 0) {
        try {
          this.providers.push(new HuggingFaceProvider(keys.huggingface));
          hasInitializedProvider = true;
        } catch (e) {
          console.warn('Failed to initialize HuggingFace provider:', e);
        }
      }

      if (!hasInitializedProvider) {
        console.warn('No AI providers could be initialized. AI features will be disabled.');
      }

      this.isInitialized = true;
      return hasInitializedProvider;
    } catch (error) {
      console.warn('AI providers initialization failed:', error);
      this.isInitialized = true;
      return false;
    }
  }

  public static getInstance(): AIProviderManager {
    if (!this.instance) {
      this.instance = new AIProviderManager();
    }
    return this.instance;
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
