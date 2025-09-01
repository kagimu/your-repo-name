const ctx: Worker = self as any;

interface AudioData {
  channelData: Float32Array;
  sampleRate: number;
}

// Audio processing configurations
const NOISE_THRESHOLD = -50; // dB
const FRAME_SIZE = 2048;

// Process audio data for noise levels and voice activity detection
const processAudioData = (data: AudioData) => {
  const { channelData, sampleRate } = data;
  
  // Calculate RMS value
  let sum = 0;
  for (let i = 0; i < channelData.length; i++) {
    sum += channelData[i] * channelData[i];
  }
  const rms = Math.sqrt(sum / channelData.length);
  
  // Convert to dB
  const db = 20 * Math.log10(rms);
  
  // Simple voice activity detection
  const isVoiceDetected = db > NOISE_THRESHOLD;
  
  // Calculate dominant frequency using auto-correlation
  let dominantFreq = 0;
  if (isVoiceDetected) {
    // Simple auto-correlation for pitch detection
    let maxCorrelation = 0;
    let correlationLag = 0;
    
    for (let lag = 0; lag < FRAME_SIZE; lag++) {
      let correlation = 0;
      for (let i = 0; i < FRAME_SIZE - lag; i++) {
        correlation += channelData[i] * channelData[i + lag];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        correlationLag = lag;
      }
    }
    
    if (correlationLag !== 0) {
      dominantFreq = sampleRate / correlationLag;
    }
  }
  
  return {
    noiseLevel: db,
    isVoiceDetected,
    dominantFrequency: dominantFreq
  };
};

// Handle messages from main thread
ctx.addEventListener('message', (event: MessageEvent) => {
  const { audioData } = event.data;
  
  if (audioData) {
    const result = processAudioData(audioData);
    ctx.postMessage(result);
  }
});

export {};
