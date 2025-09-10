export enum RecognitionState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}

export interface RecognitionOptions {
  language: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  timeout?: number;
}

export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface ISpeechRecognitionService {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  transcribe(audioData?: Blob): Promise<string>;
  getTranscript(): string;
  reset(): void;
  
  isListening(): boolean;
  isFinalResult(): boolean;
  getConfidence(): number;
  
  onTranscriptUpdate(callback: (result: RecognitionResult) => void): void;
  onError(callback: (error: Error) => void): void;
  onStateChange(callback: (state: RecognitionState) => void): void;
  
  configure(options: RecognitionOptions): void;
}
