import {
  ISpeechRecognitionService,
  RecognitionOptions,
  RecognitionState,
  RecognitionResult
} from './types/ISpeechRecognitionService';

export class WebSpeechRecognitionService implements ISpeechRecognitionService {
  private recognition: SpeechRecognition;
  private transcript: string = '';
  private confidence: number = 0;
  private state: RecognitionState = RecognitionState.IDLE;
  private isFinal: boolean = false;
  
  private transcriptCallback?: (result: RecognitionResult) => void;
  private errorCallback?: (error: Error) => void;
  private stateCallback?: (state: RecognitionState) => void;

  constructor() {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Web Speech API not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      this.transcript = result[0].transcript;
      this.confidence = result[0].confidence;
      this.isFinal = result.isFinal;

      if (this.transcriptCallback) {
        this.transcriptCallback({
          transcript: this.transcript,
          isFinal: this.isFinal,
          confidence: this.confidence
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.setState(RecognitionState.ERROR);
      if (this.errorCallback) {
        this.errorCallback(new Error(event.error));
      }
    };

    this.recognition.onend = () => {
      if (this.state !== RecognitionState.ERROR) {
        this.setState(RecognitionState.IDLE);
      }
    };
  }

  private setState(newState: RecognitionState) {
    this.state = newState;
    if (this.stateCallback) {
      this.stateCallback(newState);
    }
  }

  async startListening(): Promise<void> {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recognition.start();
      this.setState(RecognitionState.LISTENING);
    } catch (error) {
      this.setState(RecognitionState.ERROR);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }

  async stopListening(): Promise<void> {
    this.recognition.stop();
    this.setState(RecognitionState.PROCESSING);
  }

  async transcribe(audioData?: Blob): Promise<string> {
    // Web Speech API doesn't need this method, but we implement it
    // for interface compatibility
    return this.transcript;
  }

  getTranscript(): string {
    return this.transcript;
  }

  reset(): void {
    this.transcript = '';
    this.confidence = 0;
    this.isFinal = false;
    this.setState(RecognitionState.IDLE);
  }

  isListening(): boolean {
    return this.state === RecognitionState.LISTENING;
  }

  isFinalResult(): boolean {
    return this.isFinal;
  }

  getConfidence(): number {
    return this.confidence;
  }

  onTranscriptUpdate(callback: (result: RecognitionResult) => void): void {
    this.transcriptCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }

  onStateChange(callback: (state: RecognitionState) => void): void {
    this.stateCallback = callback;
  }

  configure(options: RecognitionOptions): void {
    this.recognition.continuous = options.continuous;
    this.recognition.interimResults = options.interimResults;
    this.recognition.maxAlternatives = options.maxAlternatives;
    this.recognition.lang = options.language;
  }
}
