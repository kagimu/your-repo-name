export interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error: string | null;
  feedback?: string;
  status: 'idle' | 'listening' | 'processing' | 'error';
  confidenceLevel?: number;
  lastCommand?: string;
  lastResponse?: string;
  suggestions?: string[];
  isThinking?: boolean;
}
