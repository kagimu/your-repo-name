import { BrowserFeatureSupport } from '@/types/speech';

export const checkSpeechSupport = (): BrowserFeatureSupport => {
  const support = {
    webSpeechAPI: false,
    speechSynthesis: false,
    microphoneAccess: false,
    audioContext: false,
    webWorker: false
  };

  // Check Web Speech API support
  support.webSpeechAPI = !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );

  // Check Speech Synthesis support
  support.speechSynthesis = 'speechSynthesis' in window;

  // Check Web Audio API support
  support.audioContext = !!(
    (window as any).AudioContext || (window as any).webkitAudioContext
  );

  // Check Web Worker support
  support.webWorker = 'Worker' in window;

  return support;
};

export const checkMicrophoneAccess = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch {
    return false;
  }
};
