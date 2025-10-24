export interface LearningPath {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  totalEstimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  prerequisites: string[];
  subtopics: SubTopic[];
}

export interface SubTopic {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
  level: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  level: string;
  createdAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  position: { x: number; y: number };
  level: number;
  color?: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string;
  duration: string;
  dailyGoals: string[];
  weeklyGoals: string[];
  milestones: Milestone[];
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  progress: number;
}

export interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  notes?: string;
}

export interface Progress {
  userId: string;
  subject: string;
  level: string;
  completedTopics: string[];
  currentStreak: number;
  totalStudyTime: number;
  averageScore: number;
  lastActivity: Date;
}