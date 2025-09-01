import create from 'zustand';
import { VoiceState, VoicePreferences } from '@/types/speech';

interface VoiceStore {
  state: VoiceState;
  setState: (state: Partial<VoiceState>) => void;
  preferences: VoicePreferences;
  updatePreferences: (prefs: Partial<VoicePreferences>) => void;
  commandHistory: string[];
  addCommand: (command: string) => void;
  confidenceThreshold: number;
  updateConfidenceThreshold: (threshold: number) => void;
  errorCount: number;
  lastErrorTime: number | null;
  recordError: (error: string) => void;
  resetErrors: () => void;
}

const useVoiceStore = create<VoiceStore>((set) => ({
  state: {
    isListening: false,
    isProcessing: false,
    error: null,
    transcript: '',
    confidenceLevel: 0,
    voiceLevel: 0,
    feedback: '',
    lastCommand: null,
    suggestions: [],
    isThinking: false,
    status: 'idle'
  },
  setState: (newState) =>
    set((prev) => ({ state: { ...prev.state, ...newState } })),
  preferences: {
    voice: '',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    whisperEnabled: false
  },
  updatePreferences: (prefs) =>
    set((prev) => ({ preferences: { ...prev.preferences, ...prefs } })),
  commandHistory: [],
  addCommand: (command) =>
    set((prev) => ({
      commandHistory: [...prev.commandHistory.slice(-9), command]
    })),
  confidenceThreshold: 0.7,
  updateConfidenceThreshold: (threshold) =>
    set({ confidenceThreshold: threshold }),
  errorCount: 0,
  lastErrorTime: null,
  recordError: (error) =>
    set((prev) => {
      const now = Date.now();
      const errorCount =
        prev.lastErrorTime && now - prev.lastErrorTime > 60000
          ? 1
          : prev.errorCount + 1;
      return {
        errorCount,
        lastErrorTime: now
      };
    }),
  resetErrors: () =>
    set({
      errorCount: 0,
      lastErrorTime: null
    })
}));

export { useVoiceStore };
