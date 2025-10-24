// Utility functions for voice processing
export const calculateLevenshteinDistance = (a: string, b: string): number => {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

export const normalizeSpeech = (text: string): string => {
  return text
    .toLowerCase()
    // Remove common filler words
    .replace(/\b(um|uh|like|you know|well|so|just|actually|basically)\b/g, '')
    // Remove common punctuation
    .replace(/[.,/#$%^&*;:{}=\-_`~()]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    .trim();
};

export const extractNumbers = (text: string): number[] => {
  const matches = text.match(/\d+(\.\d+)?/g);
  return matches ? matches.map(Number) : [];
};

export const findBestMatch = (input: string, patterns: string[]): { pattern: string; score: number } => {
  let bestMatch = { pattern: '', score: 0 };
  const normalizedInput = normalizeSpeech(input);

  for (const pattern of patterns) {
    const normalizedPattern = normalizeSpeech(pattern);
    const distance = calculateLevenshteinDistance(normalizedInput, normalizedPattern);
    const maxLength = Math.max(normalizedInput.length, normalizedPattern.length);
    const score = 1 - (distance / maxLength);

    if (score > bestMatch.score) {
      bestMatch = { pattern, score };
    }
  }

  return bestMatch;
};

// Voice activity detection settings
export const voiceSettings = {
  silenceThreshold: 0.015,  // Adjusted for better sensitivity
  minSpeechDuration: 250,   // Minimum duration to consider as speech (ms)
  maxSilenceDuration: 1000, // Maximum silence duration before stopping (ms)
  smoothingFactor: 0.8,     // Smooth out volume changes
  amplificationFactor: 1.5   // Boost quiet sounds
};

// Process audio data for better voice detection
export const processAudioData = (data: Float32Array): number => {
  // Calculate RMS (Root Mean Square) of the audio data
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    // Apply amplification to boost quiet sounds
    const amplified = data[i] * voiceSettings.amplificationFactor;
    sum += amplified * amplified;
  }
  const rms = Math.sqrt(sum / data.length);

  // Apply noise gate
  return rms > voiceSettings.silenceThreshold ? rms : 0;
};

// Generate natural language responses
export const generateResponse = (command: string, success: boolean): string => {
  const responses = {
    greeting: [
      "Hi! How can I help you today?",
      "Hello! I'm here to assist you.",
      "Hey there! What can I do for you?"
    ],
    confirmation: [
      "I'll help you with that.",
      "I understand what you're looking for.",
      "Let me take care of that for you."
    ],
    clarification: [
      "Could you please rephrase that?",
      "I didn't quite catch that. Could you say it again?",
      "I'm not sure I understood. Can you try saying it differently?"
    ],
    error: [
      "I'm having trouble understanding. Could you try again?",
      "Sorry, I didn't catch that. Could you repeat it?",
      "I missed that. One more time, please?"
    ]
  };

  const category = success ? 
    (command.startsWith('help') ? 'greeting' : 'confirmation') : 
    (command ? 'clarification' : 'error');

  const options = responses[category];
  return options[Math.floor(Math.random() * options.length)];
};
