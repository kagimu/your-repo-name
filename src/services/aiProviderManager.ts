import { AIProvider } from '../../types/aiProvider';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';

export class AIProviderManager {
  private providers: AIProvider[] = [];

  constructor() {
    // Initialize providers with API keys from environment variables
    if (process.env.OPENAI_API_KEY) {
      this.providers.push(new OpenAIProvider(process.env.OPENAI_API_KEY));
    }
    if (process.env.GEMINI_API_KEY) {
      this.providers.push(new GeminiProvider(process.env.GEMINI_API_KEY));
    }
    if (process.env.HUGGINGFACE_API_KEY) {
      this.providers.push(new HuggingFaceProvider(process.env.HUGGINGFACE_API_KEY));
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
