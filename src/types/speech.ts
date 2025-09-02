import { CartItem } from '@/contexts/cart-types';

export interface BrowserFeatureSupport {
  webSpeechAPI: boolean;
  speechSynthesis: boolean;
  microphoneAccess: boolean;
  audioContext: boolean;
  webWorker: boolean;
}

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  transcript: string;
  confidenceLevel: number;
  voiceLevel?: number;
  feedback: string;
  lastCommand: string | null;
  lastResponse: string | null;
  lastResult?: any;
  suggestions: string[];
  isThinking: boolean;
  status: 'idle' | 'listening' | 'processing' | 'responding' | 'error';
}

export interface VoicePreferences {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  whisperEnabled: boolean;
  language: string;
}

export interface CommandIntent {
  name: string;
  patterns: string[];
  examples: string[];
  slots?: {
    [key: string]: {
      type: string;
      values?: string[];
    };
  };
}

export type VoiceIntent = 
  | 'search'
  | 'addToCart'
  | 'filter'
  | 'help'
  | 'checkout'
  | 'showCategories'
  | 'budgetHelp'
  | 'clearContext';

export interface VoiceCommandResult {
  intent: VoiceIntent;
  slots: Record<string, any>;
  confidence?: number;
}

export type VoiceCommandHandlers = {
  onSearch?: (query: string) => Promise<any[]>;
  onAddToCart?: (item: CartItem) => Promise<void>;
  onCheckout: () => Promise<void>;
  onShowCategories: () => Promise<void>;
  onBudgetHelp: (budget: number) => Promise<void>;
  onFilter: (filters: { [key: string]: any }) => Promise<void>;
  onCustomCommand?: (command: string, args: any) => Promise<void>;
};

export interface VoiceCommand {
  command: string;
  response: string;
  timestamp: string;
  intent: string;
  slots?: { [key: string]: any };
  error?: string;
}

export interface VoiceIntentMatch {
  intent: {
    name: string;
    patterns: string[];
  };
  slots: {
    [key: string]: any;
  };
}
