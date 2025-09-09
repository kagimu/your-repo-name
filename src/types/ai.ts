export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudyPlan {
  topics: string[];
  estimatedDuration: string;
  milestones: string[];
  resources: string[];
  exercises: string[];
}

export interface WolframPod {
  id: string;
  title: string;
  subpods: Array<{
    plaintext: string;
    img?: {
      src: string;
      alt: string;
    };
  }>;
}

export interface WolframResponse {
  queryresult: {
    success: boolean;
    error: boolean;
    numpods: number;
    pods: WolframPod[];
    results?: string[];
  };
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface HuggingFaceResponse {
  generated_text: string;
}
