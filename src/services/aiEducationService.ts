import { Question, Flashcard, MindMapNode, StudyPlan } from '@/types/aiTypes';
import { OpenAIProvider } from './providers/openaiProvider';
import { GeminiProvider } from './providers/geminiProvider';
import { HuggingFaceProvider } from './providers/huggingfaceProvider';

class AIEducationService {
  private static instance: AIEducationService;
  private openaiProvider?: OpenAIProvider;
  private geminiProvider?: GeminiProvider;
  private huggingfaceProvider?: HuggingFaceProvider;

  private constructor() {
    // Initialize providers if keys are available
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.openaiProvider = new OpenAIProvider(import.meta.env.VITE_OPENAI_API_KEY);
    }
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.geminiProvider = new GeminiProvider(import.meta.env.VITE_GEMINI_API_KEY);
    }
    if (import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      this.huggingfaceProvider = new HuggingFaceProvider(import.meta.env.VITE_HUGGINGFACE_API_KEY);
    }
    // Do not throw error if no providers; allow UI to handle unavailable state
  }

  public isAnyProviderAvailable(): boolean {
    return Boolean(this.openaiProvider || this.geminiProvider || this.huggingfaceProvider);
  }

  public static getInstance(): AIEducationService {
    if (!AIEducationService.instance) {
      AIEducationService.instance = new AIEducationService();
    }
    return AIEducationService.instance;
  }

  private async tryGenerateStructuredResponse<T>(prompt: string): Promise<T> {
    // Try OpenAI first
    try {
      if (this.openaiProvider) {
        return await this.openaiProvider.generateStructuredResponse<T>(prompt);
      }
    } catch (error) {
      console.warn('OpenAI request failed, falling back to Gemini:', error);
    }

    // Try Gemini second
    try {
      if (this.geminiProvider) {
        return await this.geminiProvider.generateStructuredResponse<T>(prompt);
      }
    } catch (error) {
      console.warn('Gemini request failed, falling back to HuggingFace:', error);
    }

    // Try HuggingFace last
    if (this.huggingfaceProvider) {
      return await this.huggingfaceProvider.generateStructuredResponse<T>(prompt);
    }

    throw new Error('No available AI provider');
  }

  private async tryGenerateText(prompt: string): Promise<string> {
    // Try OpenAI first
    try {
      if (this.openaiProvider) {
        return await this.openaiProvider.generateText(prompt);
      }
    } catch (error) {
      console.warn('OpenAI request failed, falling back to Gemini:', error);
    }

    // Try Gemini second
    try {
      if (this.geminiProvider) {
        return await this.geminiProvider.generateText(prompt);
      }
    } catch (error) {
      console.warn('Gemini request failed, falling back to HuggingFace:', error);
    }

    // Try HuggingFace last
    if (this.huggingfaceProvider) {
      return await this.huggingfaceProvider.generateText(prompt);
    }

    throw new Error('No available AI provider');
  }

  async generateFlashcards(subject: string, level: string): Promise<Flashcard[]> {
    const prompt = `Generate 10 flashcards for ${subject} at ${level} level. 
    Include important concepts, definitions, and key points.`;

    return await this.tryGenerateStructuredResponse<Flashcard[]>(prompt);
  }

  async generateQuestions(subject: string, level: string, topic?: string): Promise<Question[]> {
    const prompt = `Create 5 practice questions for ${subject} ${topic ? `on ${topic}` : ''} at ${level} level. 
    Include a mix of multiple choice and open-ended questions. Each question should have an explanation.`;

    return await this.tryGenerateStructuredResponse<Question[]>(prompt);
  }

  async generateMindMap(subject: string, topic: string): Promise<MindMapNode> {
    const prompt = `Create a mind map for ${subject} focusing on ${topic}. 
    Include main concepts, sub-concepts, and their relationships.`;

    return await this.tryGenerateStructuredResponse<MindMapNode>(prompt);
  }

  async generateStudyNotes(subject: string, topic: string, level: string): Promise<string> {
    const prompt = `Generate comprehensive study notes for ${subject} on ${topic} at ${level} level. 
    Include key concepts, examples, and explanations.`;

    return await this.tryGenerateText(prompt);
  }

  async generateStudyPlan(subject: string, level: string, duration: string): Promise<StudyPlan> {
    const prompt = `Create a ${duration} study plan for ${subject} at ${level} level. 
    Include topics, time allocation, and learning objectives.`;

    return await this.tryGenerateStructuredResponse<StudyPlan>(prompt);
  }

  async generatePracticeProblems(subject: string, topic: string, level: string): Promise<Question[]> {
    const prompt = `Generate 5 practice problems for ${subject} focusing on ${topic} at ${level} level. 
    Include step-by-step solutions and explanations.`;

    return await this.tryGenerateStructuredResponse<Question[]>(prompt);
  }

  async generateQuiz(subject: string, topic: string, level: string): Promise<Question[]> {
    const prompt = `Create a quiz for ${subject} on ${topic} at ${level} level with 10 questions. 
    Mix multiple choice, true/false, and short answer questions. Include correct answers and explanations.`;

    return await this.tryGenerateStructuredResponse<Question[]>(prompt);
  }

  async assessSkillLevel(subject: string, responses: Array<{ question: string; answer: string }>): Promise<{
    level: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    const prompt = `Assess the skill level based on these responses for ${subject}: ${JSON.stringify(responses)}. 
    Provide level, strengths, weaknesses, and recommendations.`;

    return await this.tryGenerateStructuredResponse<{
      level: string;
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    }>(prompt);
  }

  async generatePersonalizedPath(
    level: string,
    subject: string,
    strengths: string[],
    areasToImprove: string[]
  ): Promise<{
    topics: Array<{
      name: string;
      duration: string;
      resources: string[];
      activities: string[];
    }>;
    milestones: string[];
    assessments: string[];
  }> {
    const prompt = `Create a personalized learning path for ${subject} at ${level} level.
    Strengths: ${strengths.join(', ')}
    Areas to improve: ${areasToImprove.join(', ')}
    Include topics, durations, resources, activities, milestones, and assessments.`;

    const response = await this.provider.generateStructuredResponse<{
      topics: Array<{
        name: string;
        duration: string;
        resources: string[];
        activities: string[];
      }>;
      milestones: string[];
      assessments: string[];
    }>(prompt);
    return response;
  }
}

// Export a singleton instance
export const aiEducationService = AIEducationService.getInstance();
