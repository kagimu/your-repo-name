import React from 'react';
import { useVoiceAssistant } from '../../contexts/VoiceAssistantContext';
import { RecognitionState } from '../../services/voice/types/ISpeechRecognitionService';

export const VoiceAssistantButton: React.FC = () => {
  const { state, startListening, stopListening } = useVoiceAssistant();
  const isProcessing = state.state === RecognitionState.PROCESSING;

  const handleVoiceCommand = async () => {
    if (state.isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <div className="voice-assistant">
      <button
        onClick={handleVoiceCommand}
        className={`voice-button ${state.isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
        disabled={isProcessing}
      >
        {state.isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Command'}
      </button>

      {state.transcript && (
        <div className="transcript">
          <p>You said: {state.transcript}</p>
        </div>
      )}

      {state.currentIntent && (
        <div className="intent">
          <p>Detected intent: {state.currentIntent.intent.name}</p>
          <p>Confidence: {(state.currentIntent.confidence * 100).toFixed(1)}%</p>
        </div>
      )}

      {state.feedback.visual && (
        <div className="feedback">
          <p>{state.feedback.visual}</p>
        </div>
      )}

      {state.error && (
        <div className="error">
          <p>Error: {state.error.message}</p>
        </div>
      )}

      <style jsx>{`
        .voice-assistant {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
        }

        .voice-button {
          padding: 1rem 2rem;
          border-radius: 50px;
          border: none;
          background: #4a90e2;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .voice-button:hover {
          background: #357abd;
        }

        .voice-button.listening {
          background: #e24a4a;
          animation: pulse 1.5s infinite;
        }

        .voice-button.processing {
          background: #4ae24a;
          opacity: 0.7;
          cursor: wait;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(226, 74, 74, 0.4);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(226, 74, 74, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(226, 74, 74, 0);
          }
        }

        .transcript, .intent, .feedback, .error {
          width: 100%;
          max-width: 400px;
          padding: 1rem;
          border-radius: 8px;
          background: #f5f5f5;
        }

        .error {
          background: #ffe6e6;
          color: #e24a4a;
        }
      `}</style>
    </div>
  );
};
