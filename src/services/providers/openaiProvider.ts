import OpenAI from 'openai';
import { AIProvider } from '../../types/aiProvider';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Enable browser usage
    });
  }

  id = 'openai';
  name = 'OpenAI';

  isAvailable(): boolean {
    return !!import.meta.env.VITE_OPENAI_API_KEY;
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      throw error;
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    try {
      const completion = await this.client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides structured responses in JSON format.'
          },
          { role: 'user', content: prompt }
        ],
        model: 'gpt-3.5-turbo',
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error('OpenAI structured response error:', error);
      throw error;
    }
  }
}
