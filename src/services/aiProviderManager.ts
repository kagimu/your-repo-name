import { AIProvider } from '../../types/aiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';
import { getApiKey, hasEnvVar } from '../utils/env';
  VITE_GEMINI_API_KEY?: string;
  VITE_OPENAI_API_KEY?: string;
  VITE_HUGGINGFACE_API_KEY?: string;
  [key: string]: string | undefined;
}

class DummyProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    return "AI features are currently disabled. Please try again later.";
  }
  isAvailable(): boolean {
    return false;
  }
}

export class AIProviderManager {
  private static instance: AIProviderManager | null = null;
  private providers: AIProvider[] = [new DummyProvider()]; // Default to dummy provider
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AIProviderManager {
    if (!this.instance) {
      this.instance = new AIProviderManager();
    }
    return this.instance;
  }

  private async initializeProvider<T extends AIProvider>(
    envKey: string,
    Provider: new (key: string) => T,
    name: string
  ): Promise<boolean> {
    if (!hasEnvVar(envKey)) {
      console.info(`${name} provider not configured`);
      return false;
    }

    try {
      const apiKey = getApiKey(envKey);
      if (!apiKey) return false;
      
      this.providers.push(new Provider(apiKey));
      return true;
    } catch {
      console.info(`${name} provider initialization failed`);
      return false;
    }
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.providers.some(p => !(p instanceof DummyProvider));
    }

    try {
      // Reset to just the dummy provider
      this.providers = [new DummyProvider()];
      let hasInitializedProvider = false;

      // Initialize each provider without logging sensitive data
      if (await this.initializeProvider('VITE_GEMINI_API_KEY', GeminiProvider, 'Gemini')) {
        hasInitializedProvider = true;
      }

      if (await this.initializeProvider('VITE_OPENAI_API_KEY', OpenAIProvider, 'OpenAI')) {
        hasInitializedProvider = true;
      }

      if (await this.initializeProvider('VITE_HUGGINGFACE_API_KEY', HuggingFaceProvider, 'HuggingFace')) {
        hasInitializedProvider = true;
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
