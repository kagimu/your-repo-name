import axios from 'axios';

export interface AIProvider {
  id: string;
  name: string;
  isAvailable: () => boolean;
  generateText: (prompt: string) => Promise<string>;
  generateStructuredResponse: <T>(prompt: string) => Promise<T>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiProvider implements AIProvider {
  id = 'gemini';
  name = 'Google Gemini';
  private apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private model = 'gemini-pro';

  isAvailable = () => Boolean(this.apiKey);

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post<GeminiResponse>(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini Error:', error);
      throw new Error('Gemini service failed');
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    try {
      const structuredPrompt = `
        Please provide a JSON response following this format:
        ${JSON.stringify(prompt, null, 2)}
        
        Response must be valid JSON.
      `;
      
      const response = await this.generateText(structuredPrompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Gemini Structured Response Error:', error);
      throw new Error('Failed to generate structured response');
    }
  }
}
