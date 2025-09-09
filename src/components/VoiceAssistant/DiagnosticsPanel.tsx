import React, { useEffect, useState } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { checkSpeechSupport, checkMicrophoneAccess } from '@/lib/speechSupport';
import type { BrowserFeatureSupport } from '@/types/speech';

interface DiagnosticsPanelProps {
  onForceWhisper: () => void;
  isWhisperEnabled: boolean;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  onForceWhisper,
  isWhisperEnabled
}) => {
  const [support, setSupport] = useState<BrowserFeatureSupport | null>(null);
  const [hasMicAccess, setHasMicAccess] = useState<boolean>(false);

  useEffect(() => {
    const checkSupport = async () => {
      const featureSupport = checkSpeechSupport();
      const micAccess = await checkMicrophoneAccess();
      setSupport(featureSupport);
      setHasMicAccess(micAccess);
    };
    checkSupport();
  }, []);

  if (!support) return null;

  const StatusIcon = ({ isSupported }: { isSupported: boolean }) => (
    isSupported ? <Check className="text-green-500" /> : <X className="text-red-500" />
  );

  return (
    <div 
      className="bg-white rounded-lg shadow-lg p-4 mb-4 text-sm"
      role="region"
      aria-label="Voice Assistant Diagnostics"
    >
      <div className="flex items-center mb-3">
        <AlertTriangle className="text-yellow-500 mr-2" />
        <h3 className="font-semibold">System Diagnostics</h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span>Web Speech API:</span>
          <StatusIcon isSupported={support.webSpeechAPI} />
        </div>
        <div className="flex justify-between items-center">
          <span>Speech Synthesis:</span>
          <StatusIcon isSupported={support.speechSynthesis} />
        </div>
        <div className="flex justify-between items-center">
          <span>Microphone Access:</span>
          <StatusIcon isSupported={hasMicAccess} />
        </div>
        <div className="flex justify-between items-center">
          <span>Audio Processing:</span>
          <StatusIcon isSupported={support.audioContext} />
        </div>
      </div>

      {(!support.webSpeechAPI || !hasMicAccess) && (
        <div className="mt-4">
          <p className="text-yellow-600 mb-2">
            Some features are not available in your browser.
          </p>
          <button
            onClick={onForceWhisper}
            className={`px-3 py-1 rounded text-sm ${
              isWhisperEnabled
                ? 'bg-blue-100 text-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            aria-pressed={isWhisperEnabled}
          >
            {isWhisperEnabled ? 'Using Whisper API' : 'Enable Whisper Fallback'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DiagnosticsPanel;
