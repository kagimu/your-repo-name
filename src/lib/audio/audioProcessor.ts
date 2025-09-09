export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array | null = null;
  private animationFrame: number | null = null;
  private onLevelCallback: ((level: number) => void) | null = null;

  async start(onLevel: (level: number) => void) {
    try {
      this.onLevelCallback = onLevel;
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Float32Array(this.analyser.frequencyBinCount);

      this.updateLevel();
    } catch (error) {
      console.error('Error initializing audio processor:', error);
      throw error;
    }
  }

  connectStream(stream: MediaStream) {
    if (!this.audioContext || !this.analyser) return;

    try {
      // Disconnect any existing source
      if (this.mediaStreamSource) {
        this.mediaStreamSource.disconnect();
      }

      // Create and connect new source
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.mediaStreamSource.connect(this.analyser);
    } catch (error) {
      console.error('Error connecting audio stream:', error);
      throw error;
    }
  }

  private updateLevel = () => {
    if (!this.analyser || !this.dataArray || !this.onLevelCallback) return;

    this.analyser.getFloatFrequencyData(this.dataArray);

    // Calculate RMS value
    let rms = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      rms += this.dataArray[i] * this.dataArray[i];
    }
    rms = Math.sqrt(rms / this.dataArray.length);

    // Convert to dB
    const db = 20 * Math.log10(Math.abs(rms));
    
    // Normalize to 0-1 range
    const normalizedLevel = Math.max(0, Math.min(1, (db + 100) / 50));

    this.onLevelCallback(normalizedLevel);
    this.animationFrame = requestAnimationFrame(this.updateLevel);
  };

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.onLevelCallback = null;
  }

  isActive(): boolean {
    return this.audioContext !== null && this.analyser !== null;
  }
}

// Create singleton instance
const audioProcessor = new AudioProcessor();
export default audioProcessor;
