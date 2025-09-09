import React, { useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Mock services for testing
const mockCartService = {
  addItem: async (product: any, quantity: number) => {
    console.log('Adding to cart:', { product, quantity });
    return Promise.resolve();
  },
  removeItem: async (product: any) => {
    console.log('Removing from cart:', product);
    return Promise.resolve();
  }
};

const mockNavigationService = {
  navigateToCart: async () => {
    console.log('Navigating to cart');
    return Promise.resolve();
  },
  navigateToCheckout: async () => {
    console.log('Navigating to checkout');
    return Promise.resolve();
  },
  navigateToOrders: async () => {
    console.log('Navigating to orders');
    return Promise.resolve();
  },
  navigateToSearch: async (params: any) => {
    console.log('Navigating to search with params:', params);
    return Promise.resolve();
  }
};

const mockOrderService = {
  getOrders: async () => {
    console.log('Fetching orders');
    return Promise.resolve([]);
  }
};

export const VoiceAssistantTest: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';

    recognitionInstance.onresult = (event) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcriptText = result[0].transcript;
      setTranscript(transcriptText);
      console.log('Transcript:', transcriptText);

      // Process final results
      if (result.isFinal) {
        processCommand(transcriptText);
      }
    };

    recognitionInstance.onerror = (event) => {
      if (event.error === 'no-speech') {
        console.log('No speech detected');
        return;
      }
      setError(`Recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      if (error) return; // Don't restart if there was an error
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch (e) {
          console.log('Error stopping recognition:', e);
        }
      }
    };
  }, []);

  const processCommand = async (text: string) => {
    // Basic command processing
    const command = text.toLowerCase().trim();

    if (command.includes('help') || command.includes('what can you do')) {
      setTranscript('Available commands:\n' +
        '- "show products" or "show items"\n' +
        '- "search for [item]"\n' +
        '- "add [item] to cart"\n' +
        '- "show my cart"\n' +
        '- "checkout"');
      return;
    }

    if (command.includes('show') && (command.includes('products') || command.includes('items'))) {
      setTranscript('Showing all products...');
      // Here you would normally navigate to products page
      return;
    }

    if (command.includes('search for')) {
      const searchTerm = command.replace('search for', '').trim();
      setTranscript(`Searching for ${searchTerm}...`);
      // Here you would normally trigger a search
      return;
    }

    setTranscript('I\'m not sure what you mean. Try saying "help" to see what I can do.');
  };

  const startListening = async () => {
    try {
      if (!recognition) {
        throw new Error('Speech recognition not initialized');
      }

      if (isListening) {
        console.log('Already listening, stopping first...');
        recognition.stop();
        setIsListening(false);
        return;
      }

      await recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // Web Speech API cleanup would go here
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '20px' }}>Voice Assistant Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={isListening ? stopListening : startListening}
          style={{
            padding: '10px 20px',
            backgroundColor: isListening ? '#ff4444' : '#4444ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffeeee', 
          color: '#ff0000',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {transcript && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3>Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}

      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px'
      }}>
        <h3>Test Instructions:</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Click "Start Listening" to begin voice recognition</li>
          <li>Speak some commands (e.g., "Hello", "Test")</li>
          <li>Watch the transcript appear above</li>
          <li>Click "Stop Listening" when done</li>
        </ol>
      </div>
    </div>
  );

        <style>
        {`
          .test-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
          }

          .test-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            border-radius: 8px;
            background: #f5f5f5;
          }

          h1 {
            margin-bottom: 2rem;
            color: #333;
          }

          h2 {
            margin-bottom: 1rem;
            color: #444;
          }

          .command-list {
            margin-top: 1rem;
          }

          .command-list ul {
            list-style: none;
            padding: 0;
          }

          .command-list li {
            padding: 0.5rem 0;
            color: #666;
          }

          .logs {
            max-height: 300px;
            overflow-y: auto;
            background: #1e1e1e;
            border-radius: 4px;
            padding: 1rem;
          }

          .log-entry {
            margin: 0;
            padding: 0.5rem 0;
            color: #00ff00;
            font-family: monospace;
            border-bottom: 1px solid #333;
          }
        `}
      </style>
    </div>
  );
};
