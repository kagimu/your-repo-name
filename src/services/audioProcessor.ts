interface VADOptions {
  smoothingTimeConstant?: number;
  minNoiseLevel?: number;
  maxNoiseLevel?: number;
  silenceDuration?: number;
  energyThreshold?: number;
  zcrThreshold?: number;
}

class AudioProcessor {
  private worker: Worker | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private scriptNode: ScriptProcessorNode | null = null;
  private onLevelUpdate: ((level: number) => void) | null = null;
  private onVoiceStart: (() => void) | null = null;
  private onVoiceEnd: (() => void) | null = null;
  private animationFrame: number | null = null;
  private isProcessing: boolean = false;
  private silenceStart: number = 0;
  private options: Required<VADOptions>;
  private audioData: Float32Array = new Float32Array(2048);

  constructor(options: VADOptions = {}) {
    this.options = {
      smoothingTimeConstant: options.smoothingTimeConstant || 0.3,
      minNoiseLevel: options.minNoiseLevel || -65,
      maxNoiseLevel: options.maxNoiseLevel || -20,
      silenceDuration: options.silenceDuration || 1500,
      energyThreshold: options.energyThreshold || 0.015,
      zcrThreshold: options.zcrThreshold || 0.05
    };
    this.initWorker();
  }

  private initWorker() {
    try {
      this.worker = new Worker(
        new URL('../workers/audioProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.onmessage = (event) => {
        const { noiseLevel, isVoiceDetected, energyLevel, zcrRate } = event.data;
        
        if (isVoiceDetected && !this.isProcessing) {
          this.isProcessing = true;
          this.silenceStart = 0;
          this.onVoiceStart?.();
        } else if (!isVoiceDetected && this.isProcessing) {
          if (!this.silenceStart) {
            this.silenceStart = Date.now();
          } else if (Date.now() - this.silenceStart > this.options.silenceDuration) {
            this.isProcessing = false;
            this.onVoiceEnd?.();
          }
        }

        this.onLevelUpdate?.(noiseLevel);
      };

      // Initialize VAD parameters
      this.worker.postMessage({
        type: 'init',
        options: this.options
      });
    } catch (error) {
      console.error('Failed to initialize audio worker:', error);
    }
  }

  public async start(onLevelUpdate: (level: number) => void) {
    this.onLevelUpdate = onLevelUpdate;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      const source = this.audioContext.createMediaStreamSource(this.stream);
      source.connect(this.analyser);
      
      this.analyser.fftSize = 2048;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser || !this.worker) return;

        this.analyser.getFloatTimeDomainData(dataArray);
        
        this.worker.postMessage({
          audioData: {
            channelData: dataArray,
            sampleRate: this.audioContext?.sampleRate || 44100
          }
        });

        this.animationFrame = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (error) {
      console.error('Failed to start audio processing:', error);
    }
  }

  public stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.onLevelUpdate = null;
  }

  public cleanup() {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export default new AudioProcessor();
