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

export interface VoiceCommandHandlers {
  onSearch?: (query: string) => void;
  onAddToCart?: (item: string) => void;
  onCheckout?: () => void;
  onShowCategories?: () => void;
  onBudgetHelp?: (budget: string) => void;
  onFilter?: (filters: { 
    category?: string; 
    minPrice?: number; 
    maxPrice?: number 
  }) => void;
}
