import axios from 'axios';
import { 
  Question, 
  Flashcard, 
  StudyPlan, 
  WolframResponse, 
  OpenAIResponse, 
  HuggingFaceResponse 
} from '../types/ai';
import { GeminiProvider, AIProvider } from './geminiProvider';

// Make WolframProvider implement AIProvider
class WolframAIProvider extends WolframProvider implements AIProvider {
  id = 'wolfram';
  name = 'Wolfram Alpha';

  async generateText(prompt: string): Promise<string> {
    const result = await this.solveMathProblem(prompt);
    return result.solution;
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    const result = await this.solveMathProblem(prompt);
    return {
      solution: result.solution,
      steps: result.steps,
      visualization: result.visualization
    } as unknown as T;
  }
}

export interface AIProvider {
  id: string;
  name: string;
  isAvailable: () => boolean;
  generateText: (prompt: string) => Promise<string>;
  generateStructuredResponse: <T>(prompt: string) => Promise<T>;
}

class OpenAIProvider implements AIProvider {
  id = 'openai';
  name = 'OpenAI';
  private apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  private baseUrl = 'https://api.openai.com/v1';

  isAvailable = () => Boolean(this.apiKey);

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post<OpenAIResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Error:', error);
      throw new Error('OpenAI service failed');
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    const response = await this.generateText(prompt);
    return JSON.parse(response);
  }
}

class HuggingFaceProvider implements AIProvider {
  id = 'huggingface';
  name = 'Hugging Face';
  private apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  private baseUrl = 'https://api-inference.huggingface.co/models';
  private defaultModel = 'google/flan-t5-xxl'; // A good general-purpose model

  isAvailable = () => Boolean(this.apiKey);

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await axios.post<HuggingFaceResponse | HuggingFaceResponse[]>(
        `${this.baseUrl}/${this.defaultModel}`,
        { inputs: prompt },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return Array.isArray(response.data) 
        ? response.data[0].generated_text 
        : response.data.generated_text;
    } catch (error) {
      console.error('Hugging Face Error:', error);
      throw new Error('Hugging Face service failed');
    }
  }

  async generateStructuredResponse<T>(prompt: string): Promise<T> {
    const response = await this.generateText(prompt);
    return JSON.parse(response);
  }
}

class WolframProvider {
  private appId = import.meta.env.VITE_WOLFRAM_APPID;
  private baseUrl = 'https://api.wolframalpha.com/v2';

  isAvailable = () => Boolean(this.appId);

  async solveMathProblem(query: string): Promise<{
    solution: string;
    steps?: string[];
    visualization?: string;
  }> {
    try {
      // Using Wolfram Simple API for basic results
      const response = await axios.get<{ result: string }>(`${this.baseUrl}/result`, {
        params: {
          appid: this.appId,
          i: query,
          output: 'json',
        },
      });

      // For step-by-step solutions, use the full API
      const fullResponse = await axios.get<WolframResponse>(`${this.baseUrl}/query`, {
        params: {
          appid: this.appId,
          input: query,
          format: 'plaintext',
          podstate: 'Step-by-step solution',
          output: 'json',
        },
      });

      return {
        solution: response.data.result,
        steps: this.extractSteps(fullResponse.data),
        visualization: this.getVisualization(fullResponse.data),
      };
    } catch (error) {
      console.error('Wolfram Alpha Error:', error);
      throw new Error('Wolfram Alpha service failed');
    }
  }

  private extractSteps(data: WolframResponse): string[] {
    try {
      const solutionPod = data.pods.find(
        (pod) => pod.id === 'Solution' || pod.id === 'Step-by-step'
      );
      return solutionPod?.subpods.map(subpod => subpod.plaintext) || [];
    } catch (error) {
      return [];
    }
  }

  private getVisualization(data: WolframResponse): string | undefined {
    try {
      const plotPod = data.pods.find(
        (pod) => pod.id === 'Plot' || pod.id === 'Visualization'
      );
      return plotPod?.subpods[0]?.img?.src;
    } catch (error) {
      return undefined;
    }
  }
}

export class AIProviderManager {
  private providers: AIProvider[];
  private wolframProvider: WolframProvider;
  private geminiProvider: GeminiProvider;

  constructor() {
    this.providers = [
      new OpenAIProvider(),
      new GeminiProvider(),
      new HuggingFaceProvider(),
    ];
    this.wolframProvider = new WolframProvider();
    this.geminiProvider = new GeminiProvider();
  }

  private getBestProviderForTask(task: 'math' | 'text' | 'code' | 'structured'): AIProvider {
    // Use Wolfram Alpha for math-related tasks
    if (task === 'math' && this.wolframProvider.isAvailable()) {
      return this.wolframProvider;
    }

    // Use Gemini for code and structured tasks
    if ((task === 'code' || task === 'structured') && this.geminiProvider.isAvailable()) {
      return this.geminiProvider;
    }

    // Default to OpenAI for general text and fallback
    return this.providers[0];
  }

  private async tryProvider<T>(
    provider: AIProvider,
    prompt: string,
    structured: boolean = false
  ): Promise<T> {
    if (!provider.isAvailable()) {
      throw new Error(`${provider.name} is not available`);
    }

    try {
      if (structured) {
        return await provider.generateStructuredResponse<T>(prompt);
      } else {
        const textResponse = await provider.generateText(prompt);
        return JSON.parse(textResponse) as T;
      }
    } catch (error) {
      console.error(`${provider.name} failed:`, error);
      throw error;
    }
  }

  async generateWithFallback<T>(
    prompt: string,
    structured: boolean = false
  ): Promise<T> {
    let lastError: Error | null = null;
    for (const provider of this.providers) {
      try {
        return await this.tryProvider<T>(provider, prompt, structured);
      } catch (error) {
        console.error(`${provider.name} failed, trying next provider...`);
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
    throw lastError || new Error('All providers failed');
  }

  async generateQuestions(subject: string, topic: string, level: string): Promise<Question[]> {
    const prompt = `Generate 5 multiple-choice questions about ${topic} for ${subject} at ${level} level. 
    Format as JSON array with properties: question, options (array), correctAnswer, explanation, difficulty.`;
    
    return this.generateWithFallback<Question[]>(prompt, true);
  }

  async generateFlashcards(subject: string, topic: string): Promise<Flashcard[]> {
    const prompt = `Create 10 flashcards about ${topic} for ${subject}. 
    Format as JSON array with properties: front (question/term), back (answer/definition), topic, difficulty.`;
    
    return this.generateWithFallback<Flashcard[]>(prompt, true);
  }

  async solveMathProblem(problem: string): Promise<{
    solution: string;
    steps?: string[];
    visualization?: string;
  }> {
    if (this.wolframProvider.isAvailable()) {
      try {
        return await this.wolframProvider.solveMathProblem(problem);
      } catch (error) {
        console.error('Wolfram solver failed, falling back to AI explanation...');
      }
    }

    // Fallback to AI explanation
    const explanation = await this.generateWithFallback<string>(
      `Solve this math problem step by step: ${problem}`,
      false
    );

    return {
      solution: typeof explanation === 'string' ? explanation : 'No solution available',
      steps: typeof explanation === 'string' ? explanation.split('\n') : undefined,
    };
  }

  async generateStudyPlan(
    subject: string,
    level: string,
    topics: string[],
    duration: string
  ): Promise<StudyPlan> {
    const prompt = `Create a study plan for ${subject} at ${level} level, covering topics: ${topics.join(', ')}. 
    Duration: ${duration}. Format as JSON with properties: topics, estimatedDuration, milestones, resources, exercises.`;
    
    return this.generateWithFallback<StudyPlan>(prompt, true);
  }
}

export const aiProviderManager = new AIProviderManager();
