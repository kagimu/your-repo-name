import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AIProvider } from '../../types/aiProvider';

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
  }

  id = 'gemini';
  name = 'Google Gemini';

  isAvailable(): boolean {
    return !!import.meta.env.VITE_GEMINI_API_KEY;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw error;
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    try {
      const result = await this.model.generateContent({
        contents: [{
          role: 'user',
          parts: [{
            text: `Please provide a response in valid JSON format. ${prompt}`
          }]
        }]
      });
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      console.error('Gemini structured response error:', error);
      throw error;
    }
  }
}
