const ctx: Worker = self as any;

interface VADOptions {
  smoothingTimeConstant: number;
  minNoiseLevel: number;
  maxNoiseLevel: number;
  silenceDuration: number;
  energyThreshold: number;
  zcrThreshold: number;
}

interface AudioData {
  frequencyArray: Uint8Array;
  timeArray: Float32Array;
  energyLevel: number;
  zcrRate: number;
  sampleRate: number;
}

let options: VADOptions;

// Short-term memory for smoothing
const memorySize = 10;
const energyHistory: number[] = [];
const zcrHistory: number[] = [];

function smoothArray(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b) / arr.length;
}

function updateHistory(history: number[], value: number) {
  history.push(value);
  if (history.length > memorySize) {
    history.shift();
  }
}

function detectVoiceActivity(energyLevel: number, zcrRate: number): boolean {
  updateHistory(energyHistory, energyLevel);
  updateHistory(zcrHistory, zcrRate);

  const avgEnergy = smoothArray(energyHistory);
  const avgZcr = smoothArray(zcrHistory);

  return avgEnergy > options.energyThreshold && avgZcr > options.zcrThreshold;
}

function normalizeLevel(level: number): number {
  return Math.max(0, Math.min(100, (
    (level - options.minNoiseLevel) / 
    (options.maxNoiseLevel - options.minNoiseLevel)
  ) * 100));
}

function calculateSpectralCentroid(frequencyArray: Uint8Array): number {
  let weightedSum = 0;
  let sum = 0;
  
  for (let i = 0; i < frequencyArray.length; i++) {
    weightedSum += i * frequencyArray[i];
    sum += frequencyArray[i];
  }
  
  return sum === 0 ? 0 : weightedSum / sum;
}

// Handle messages from main thread
ctx.addEventListener('message', (event: MessageEvent) => {
  const { type, options: newOptions, ...audioData } = event.data;

  if (type === 'init') {
    options = newOptions;
    return;
  }

  if (!options || !audioData.frequencyArray) return;

  const isVoiceDetected = detectVoiceActivity(
    audioData.energyLevel,
    audioData.zcrRate
  );
  
  // Calculate overall noise level from frequency data
  const sum = audioData.frequencyArray.reduce((a, b) => a + b, 0);
  const average = sum / audioData.frequencyArray.length;
  const noiseLevel = normalizeLevel(average);

  // Calculate spectral centroid for additional voice characteristics
  const spectralCentroid = calculateSpectralCentroid(audioData.frequencyArray);

  ctx.postMessage({
    noiseLevel,
    isVoiceDetected,
    energyLevel: audioData.energyLevel,
    zcrRate: audioData.zcrRate,
    spectralCentroid
  });
});

export {};
