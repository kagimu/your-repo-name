export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface StudyPlan {
  topic: string;
  level: string;
  duration: string;
  milestones: {
    week: number;
    objectives: string[];
    resources: string[];
    activities: string[];
  }[];
}

export interface LearningProgress {
  userId: string;
  topic: string;
  level: string;
  completedItems: number;
  totalItems: number;
  quizScores: number[];
  timeSpent: number;
  lastActivity: Date;
}

export interface LearningAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string[];
  estimatedMastery: number;
}

export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
