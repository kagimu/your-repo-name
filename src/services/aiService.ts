import axios from 'axios';
import { CurriculumTopic, LearningPath } from '../data/curriculumData';
import {
  Question,
  Flashcard,
  MindMapNode,
  StudyPlan,
  LearningProgress,
  LearningAnalysis,
  OpenAIResponse
} from '../types/aiTypes';

const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface AIResponse {
  content: string;
  error?: string;
}

export const aiService = {
  async generateResponse(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const response = await axios.post<OpenAIResponse>(
        API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: context || 'You are a helpful AI educational assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: '',
        error: 'Failed to generate response'
      };
    }
  },

  async generateQuestions(topic: string, level: string, count: number = 5): Promise<Question[]> {
    const prompt = `Generate ${count} multiple-choice questions about ${topic} appropriate for ${level} level students. Format the response as a JSON array with each question object containing: question, options (array), correctAnswer, explanation, and difficulty.`;
    
    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response.content) as Question[];
    } catch (error) {
      console.error('Question Generation Error:', error);
      return [];
    }
  },

  async generateStudyNotes(topic: string, level: string): Promise<string> {
    const prompt = `Create comprehensive study notes about ${topic} for ${level} level students. Include key concepts, examples, and explanations.`;
    const response = await this.generateResponse(prompt);
    return response.content;
  },

  async generateFlashcards(topic: string, level: string, count: number = 10): Promise<Flashcard[]> {
    const prompt = `Create ${count} flashcards about ${topic} for ${level} level students. Format as JSON array with front and back properties.`;
    
    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response.content) as Flashcard[];
    } catch (error) {
      console.error('Flashcard Generation Error:', error);
      return [];
    }
  },

  async generateMindMap(topic: string, level: string): Promise<MindMapNode> {
    const prompt = `Create a mind map structure for ${topic} appropriate for ${level} level students. Format as JSON with nodes and connections.`;
    
    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response.content) as MindMapNode;
    } catch (error) {
      console.error('Mind Map Generation Error:', error);
      return { id: '', label: '' };
    }
  },

  async analyzeLearningProgress(data: LearningProgress): Promise<LearningAnalysis> {
    const prompt = `Analyze this learning progress data and provide recommendations: ${JSON.stringify(data)}`;
    const response = await this.generateResponse(prompt);
    return JSON.parse(response.content) as LearningAnalysis;
  },

  async generateStudyPlan(topic: string, level: string, duration: string): Promise<StudyPlan> {
    const prompt = `Create a ${duration} study plan for ${topic} at ${level} level. Include milestones and recommended resources.`;
    
    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response.content) as StudyPlan;
    } catch (error) {
      console.error('Study Plan Generation Error:', error);
      return {
        topic,
        level,
        duration,
        milestones: []
      };
    }
  }
};
