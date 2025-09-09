import { HfInference } from '@huggingface/inference';
import {
  ISpeechRecognitionService,
  RecognitionOptions,
  RecognitionState,
  RecognitionResult
} from './types/ISpeechRecognitionService';

export class WhisperRecognitionService implements ISpeechRecognitionService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private transcript: string = '';
  private confidence: number = 0;
  private state: RecognitionState = RecognitionState.IDLE;
  private isFinal: boolean = false;

  private transcriptCallback?: (result: RecognitionResult) => void;
  private errorCallback?: (error: Error) => void;
  private stateCallback?: (state: RecognitionState) => void;

  constructor(private hfInference: HfInference) {}

  private setState(newState: RecognitionState) {
    this.state = newState;
    if (this.stateCallback) {
      this.stateCallback(newState);
    }
  }

  private setupMediaRecorder(stream: MediaStream) {
    const mimeType = this.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(this.audioChunks, { type: this.mediaRecorder!.mimeType });
      await this.processAudio(audioBlob);
    };
  }

  private getSupportedMimeType(): string {
    const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/wav'];
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    throw new Error('No supported audio MIME type found');
  }

  private async processAudio(audioBlob: Blob) {
    try {
      this.setState(RecognitionState.PROCESSING);
      const transcript = await this.transcribe(audioBlob);
      
      // Whisper doesn't provide confidence scores, so we use a default
      this.confidence = 0.8;
      this.transcript = transcript;
      this.isFinal = true;

      if (this.transcriptCallback) {
        this.transcriptCallback({
          transcript,
          isFinal: true,
          confidence: this.confidence
        });
      }

      this.setState(RecognitionState.IDLE);
    } catch (error) {
      this.setState(RecognitionState.ERROR);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }

  async startListening(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.setupMediaRecorder(this.stream);
      this.audioChunks = [];
      this.mediaRecorder?.start();
      this.setState(RecognitionState.LISTENING);
    } catch (error) {
      this.setState(RecognitionState.ERROR);
      if (this.errorCallback) {
        this.errorCallback(error as Error);
      }
    }
  }

  async stopListening(): Promise<void> {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.stream?.getTracks().forEach(track => track.stop());
  }

  async transcribe(audioData: Blob): Promise<string> {
    try {
      const response = await this.hfInference.automaticSpeechRecognition({
        model: 'openai/whisper-large-v3',
        data: audioData
      });
      return response.text;
    } catch (error) {
      throw new Error(`Whisper transcription failed: ${error}`);
    }
  }

  getTranscript(): string {
    return this.transcript;
  }

  reset(): void {
    this.transcript = '';
    this.confidence = 0;
    this.isFinal = false;
    this.audioChunks = [];
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
    // Most options don't apply to Whisper, but we can store them
    // for potential future use
  }
}
