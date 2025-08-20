import { HfInference } from '@huggingface/inference';
import { AIProvider } from '../../types/aiProvider';

export class HuggingFaceProvider implements AIProvider {
  private client: HfInference;
  
  constructor(apiKey: string) {
    this.client = new HfInference(apiKey);
  }

  id = 'huggingface';
  name = 'HuggingFace';

  isAvailable(): boolean {
    return !!import.meta.env.VITE_HUGGINGFACE_API_KEY;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.textGeneration({
        model: 'google/flan-t5-xxl',
        inputs: prompt,
        parameters: {
          max_length: 512,
          temperature: 0.7,
        },
      });

      return response.generated_text;
    } catch (error) {
      console.error('HuggingFace text generation error:', error);
      throw error;
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    try {
      const response = await this.client.textGeneration({
        model: 'google/flan-t5-xxl',
        inputs: `Generate a JSON response for: ${prompt}`,
        parameters: {
          max_length: 512,
          temperature: 0.3,
        },
      });

      return JSON.parse(response.generated_text);
    } catch (error) {
      console.error('HuggingFace structured response error:', error);
      throw error;
    }
  }
}
