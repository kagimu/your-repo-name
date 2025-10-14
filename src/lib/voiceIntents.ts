import { NavigateFunction } from 'react-router-dom';

// Core type definitions
export interface VoiceSlot {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'currency' | 'date' | 'category' | 'product';
  values?: string[];
  required?: boolean;
  fallback?: any;
  validation?: (value: any) => boolean;
  transform?: (value: string, context?: VoiceContext) => any;
  synonyms?: string[];
  contextual?: boolean;
  dependencies?: string[];
  prompts?: {
    missing?: string;
    invalid?: string;
  };
}

export interface VoiceIntent {
  name: string;
  patterns: RegExp[];
  slots?: Record<string, VoiceSlot>;
  priority?: number;
  contextual?: boolean;
  examples: string[];
  action: (slots: Record<string, any>, context: VoiceContext) => Promise<boolean>;
}

export interface VoiceContext {
  currentPage: string;
  lastCommand?: string;
  lastResult?: any;
  currentProduct?: {
    id: number;
    name: string;
    price: number;
    category: string;
  };
  currentCategory?: {
    id: number;
    name: string;
  };
  searchResults?: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  navigate: NavigateFunction;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  searchProducts: (query: Record<string, any>) => Promise<any[]>;
  filterProducts: (filters: Record<string, any>) => void;
  getProductSpecifications?: (query: Record<string, any>) => Promise<any>;
  getLabRecommendations?: (query: Record<string, any>) => Promise<any[]>;
  user?: {
    isAuthenticated: boolean;
    name?: string;
    id?: string;
    email?: string;
  };
  lastInteraction: {
    timestamp: number;
    type: 'search' | 'filter' | 'navigation' | 'cart' | 'auth';
    data?: any;
  };
  confidence: number;
}

export interface VoiceResponse {
  text: string;
  ssml?: string;
  visualHints?: {
    highlight?: string[];
    focus?: string;
    show?: string[];
    hide?: string[];
  };
  actions?: Array<{
    type: string;
    payload: any;
  }>;
}

// RegEx utilities
const regexUtils = {
  optional: (pattern: string) => `(?:${pattern})?`,
  oneOf: (...patterns: string[]) => `(?:${patterns.join('|')})`,
  capture: (name: string, pattern: string) => `(?<${name}>${pattern})`,
  repeated: (pattern: string, min = 0, max?: number) =>
    `(?:${pattern}){${min},${max || ''}}`,
  followedBy: (...patterns: string[]) => patterns.join('\\s+'),
  prefixedBy: (prefix: string, pattern: string) =>
    `${prefix}\\s+${pattern}`,
  product: '[\\w\\s-\'",]+?'
};

// Extract utilities for pattern building
const { oneOf, capture, product: productPattern } = regexUtils;

// Core pattern collections
export const patterns = {
  number: '\\d+(?:\\.\\d+)?',
  currency: `\\$?\\d+(?:\\.\\d+)?`,
  quantity: '(?:\\d+(?:\\.\\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten)',
  date: '(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|today|tomorrow|next week)',
  time: '\\d{1,2}(?::\\d{2})?(?:am|pm)?',
  category: '[\\w\\s&-]+',
  navigation: ['go', 'take me', 'navigate', 'show', 'open', 'view', 'display'],
  search: ['search', 'find', 'look for', 'show me'],
  cart: ['add', 'put', 'place', 'remove', 'delete'],
  filter: ['filter', 'sort', 'show only', 'display only'],
  articles: ['the', 'a', 'an', 'some', 'this', 'that'],
  prepositions: ['to', 'from', 'in', 'on', 'at', 'by'],
  education: {
    verbs: ['study', 'learn', 'practice', 'review', 'teach'],
    resources: ['textbook', 'note', 'tutorial', 'guide', 'paper', 'exam'],
    subjects: [
      'mathematics', 'math', 'physics', 'chemistry', 'biology', 'english',
      'geography', 'history', 'literature', 'computer science', 'ict',
      'art', 'music', 'physical education', 'pe', 'religious education', 're'
    ],
    levels: ['primary', 'secondary', 'university', 'college']
  },
  lab: {
    verbs: ['experiment', 'measure', 'analyze', 'test', 'observe'],
    equipment: [
      'microscope', 'beaker', 'flask', 'pipette', 'burner', 'balance',
      'spectrometer', 'centrifuge', 'incubator', 'oven', 'refrigerator'
    ],
    categories: ['biology', 'chemistry', 'physics', 'general']
  }
};
