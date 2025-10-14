import { HfInference } from '@huggingface/inference';
import {
  ISpeechRecognitionService,
  RecognitionState,
  RecognitionResult
} from './types/ISpeechRecognitionService';
import { WebSpeechRecognitionService } from './WebSpeechRecognitionService';
import { WhisperRecognitionService } from './WhisperRecognitionService';

export class VoiceAssistantManager {
  private primaryService: ISpeechRecognitionService;
  private fallbackService: ISpeechRecognitionService;
  private activeService: ISpeechRecognitionService;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;

  private transcriptCallback?: (result: RecognitionResult) => void;
  private errorCallback?: (error: Error) => void;
  private stateCallback?: (state: RecognitionState) => void;

  constructor(hfInference: HfInference) {
    // Try to initialize Web Speech API service
    try {
      this.primaryService = new WebSpeechRecognitionService();
      this.fallbackService = new WhisperRecognitionService(hfInference);
      this.activeService = this.primaryService;
    } catch (error) {
      // If Web Speech API is not supported, use Whisper as primary
      this.primaryService = new WhisperRecognitionService(hfInference);
      this.fallbackService = this.primaryService; // No fallback needed
      this.activeService = this.primaryService;
    }

    this.setupServiceHandlers(this.activeService);
  }

  private setupServiceHandlers(service: ISpeechRecognitionService) {
    service.onTranscriptUpdate((result) => {
      if (this.transcriptCallback) {
        this.transcriptCallback(result);
      }

      // If transcript is empty and it's final, try fallback
      if (result.isFinal && !result.transcript && this.retryCount < this.maxRetries) {
        this.handleEmptyTranscript();
      }
    });

    service.onError((error) => {
      if (this.errorCallback) {
        this.errorCallback(error);
      }
      this.handleServiceError(error);
    });

    service.onStateChange((state) => {
      if (this.stateCallback) {
        this.stateCallback(state);
      }
    });
  }

  private async handleEmptyTranscript() {
    this.retryCount++;
    if (this.retryCount >= this.maxRetries) {
      await this.switchToFallbackService();
    } else {
      await this.activeService.reset();
      await this.activeService.startListening();
    }
  }

  private async handleServiceError(error: Error) {
    console.error('Voice recognition error:', error);
    if (this.activeService === this.primaryService) {
      await this.switchToFallbackService();
    }
  }

  private async switchToFallbackService() {
    if (this.activeService === this.primaryService) {
      await this.activeService.stopListening();
      this.activeService = this.fallbackService;
      this.setupServiceHandlers(this.activeService);
      await this.activeService.startListening();
      console.log('Switched to fallback service');
    }
  }

  async startListening(): Promise<void> {
    this.retryCount = 0;
    await this.activeService.startListening();
  }

  async stopListening(): Promise<void> {
    await this.activeService.stopListening();
  }

  reset(): void {
    this.activeService.reset();
    this.retryCount = 0;
  }

  getTranscript(): string {
    return this.activeService.getTranscript();
  }

  isListening(): boolean {
    return this.activeService.isListening();
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
}
