export interface AIProvider {
  id: string;
  name: string;
  isAvailable: () => boolean;
  generateText: (prompt: string) => Promise<string>;
  generateStructuredResponse: <T>(prompt: string) => Promise<T>;
}

export interface AIModelCapabilities {
  textGeneration: boolean;
  codeGeneration: boolean;
  mathSolving: boolean;
  imageGeneration: boolean;
  chat: boolean;
  structuredOutput: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: AIModelCapabilities;
  contextWindow: number;
  costPer1kTokens: number;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    capabilities: {
      textGeneration: true,
      codeGeneration: true,
      mathSolving: true,
      imageGeneration: false,
      chat: true,
      structuredOutput: true
    },
    contextWindow: 8192,
    costPer1kTokens: 0.03
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    capabilities: {
      textGeneration: true,
      codeGeneration: true,
      mathSolving: true,
      imageGeneration: false,
      chat: true,
      structuredOutput: true
    },
    contextWindow: 32768,
    costPer1kTokens: 0.0001
  },
  {
    id: 'flan-t5-xxl',
    name: 'FLAN-T5 XXL',
    provider: 'huggingface',
    capabilities: {
      textGeneration: true,
      codeGeneration: false,
      mathSolving: false,
      imageGeneration: false,
      chat: false,
      structuredOutput: true
    },
    contextWindow: 512,
    costPer1kTokens: 0
  }
];
