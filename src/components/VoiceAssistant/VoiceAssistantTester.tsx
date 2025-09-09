import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { products } from '../../data/products';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface VoiceAssistantProps {
  // Add any props if needed in the future
}

export const VoiceAssistantTester: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);
  const navigate = useNavigate();
  const { addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  // Add navigation and cart context/hooks
  // If you use react-router-dom v6+
  // import { useNavigate } from 'react-router-dom';
  // import { useCart } from '../../hooks/useCart'; // adjust path as needed
  // const navigate = useNavigate();
  // const { addToCart } = useCart();

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
      console.log('Recognition ended');
      setIsListening(false);
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

  const handleNavigation = (path: string, message: string) => {
    console.log(`[VoiceAssistant] Attempting navigation to ${path}`);
    setTranscript(message);
    try {
      navigate(path);
      console.log(`[VoiceAssistant] Navigation to ${path} triggered successfully`);
    } catch (error) {
      console.error(`[VoiceAssistant] Navigation failed:`, error);
      setError(`Failed to navigate: ${error}`);
    }
  };

  const processCommand = async (text: string) => {
    const command = text.toLowerCase().trim();
    console.log('[VoiceAssistant] Processing command:', command);

    // Help command
    if (command.includes('help') || command.includes('what can you do')) {
      setTranscript('Available commands:\n' +
        '- "show products" or "show items"\n' +
        '- "show [product name]"\n' +
        '- "add [product name] to cart"\n' +
        '- "remove [product name] from cart"\n' +
        '- "update [product name] quantity to [number]"\n' +
        '- "clear cart"\n' +
        '- "show my cart"\n' +
        '- "checkout"');
      return;
    }

    // Show items/products (robust matching)
    const showItemsRegex = /(show\s*(me)?\s*)?(items?|products?)/i;
    console.log('[VoiceAssistant] Testing command against showItemsRegex:', showItemsRegex.test(command));
    if (showItemsRegex.test(command)) {
      console.log('[VoiceAssistant] Match found for show items/products');
      handleNavigation('/categories', 'Navigating to categories...');
      return;
    }

    // Navigate to cart
    const cartRegex = /(show|view|open|go to|navigate to)\s*(my\s*)?cart/i;
    console.log('[VoiceAssistant] Testing command against cartRegex:', cartRegex.test(command));
    if (cartRegex.test(command)) {
      handleNavigation('/cart', 'Navigating to your cart...');
      return;
    }

    // Navigate to checkout
    const checkoutRegex = /(checkout|proceed to checkout|go to checkout|navigate to checkout)/i;
    console.log('[VoiceAssistant] Testing command against checkoutRegex:', checkoutRegex.test(command));
    if (checkoutRegex.test(command)) {
      handleNavigation('/checkout', 'Navigating to checkout...');
      return;
    }

    // Check if navigation was not triggered for expected commands
    if (command.includes('show') || command.includes('items') || command.includes('products')) {
      console.log('[VoiceAssistant] Command includes navigation keywords but no regex matched');
    }

    // Show product detail
    const showProductMatch = command.match(/show (.+)/);
    if (showProductMatch && showProductMatch[1] && !['products','items','my cart'].includes(showProductMatch[1].trim())) {
      const productName = showProductMatch[1].trim();
      const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (product) {
        setTranscript(`Showing details for ${product.name}...`);
        navigate(`/products/${product.id}`);
      } else {
        setTranscript(`Product '${productName}' not found.`);
      }
      return;
    }

    // Add product to cart
    const addMatch = command.match(/add (.+) to cart/);
    if (addMatch && addMatch[1]) {
      const productName = addMatch[1].trim();
      const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (product) {
        // Map product to CartItem type
        const cartItem = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          image: product.avatar || product.avatar_url || '',
          category: product.category,
          unit: product.unit,
        };
        await addToCart(cartItem, 1);
        setTranscript(`Added ${product.name} to cart.`);
      } else {
        setTranscript(`Product '${productName}' not found.`);
      }
      return;
    }

    // Remove product from cart
    const removeMatch = command.match(/remove (.+) from cart/);
    if (removeMatch && removeMatch[1]) {
      const productName = removeMatch[1].trim();
      const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (product) {
        await removeFromCart(product.id);
        setTranscript(`Removed ${product.name} from cart.`);
      } else {
        setTranscript(`Product '${productName}' not found in cart.`);
      }
      return;
    }

    // Update product quantity in cart
    const updateMatch = command.match(/update (.+) quantity to (\d+)/);
    if (updateMatch && updateMatch[1] && updateMatch[2]) {
      const productName = updateMatch[1].trim();
      const quantity = parseInt(updateMatch[2], 10);
      const product = products.find(p => p.name.toLowerCase() === productName.toLowerCase());
      if (product) {
        await updateQuantity(product.id, quantity);
        setTranscript(`Updated ${product.name} quantity to ${quantity}.`);
      } else {
        setTranscript(`Product '${productName}' not found in cart.`);
      }
      return;
    }

    // Clear cart
    if (command.includes('clear cart')) {
      await clearCart();
      setTranscript('Cart cleared.');
      return;
    }

    // Show cart
    if (command.includes('show my cart') || command.includes('view cart')) {
      setTranscript('Navigating to your cart...');
      navigate('/cart');
      return;
    }

    // Checkout
    if (command.includes('checkout') || command.includes('proceed to checkout')) {
      setTranscript('Navigating to checkout...');
      navigate('/checkout');
      return;
    }

    setTranscript('I\'m not sure what you mean. Try saying "help" to see what I can do.');
  };

  const startListening = async () => {
    try {
      if (!recognition) {
        throw new Error('Speech recognition not initialized');
      }

      // Prevent double start
      if (isListening) {
        console.log('Recognition already started.');
        return;
      }

      console.log('Starting recognition...');
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
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Voice Assistant</h3>
        <p className="text-sm text-gray-600">{isListening ? 'Listening...' : 'Not listening'}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-100 p-2 rounded">
          <p className="text-sm font-medium">Transcript:</p>
          <p className="text-sm text-gray-700">{transcript || 'No transcript yet'}</p>
        </div>

        {error && (
          <div className="bg-red-100 p-2 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handleToggleListening}
            className={`px-4 py-2 rounded ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isListening ? 'Stop' : 'Start'} Listening
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-sm font-medium mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li>Click "Start Listening" to begin voice recognition</li>
            <li>Try these commands:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>"Help" or "What can you do?"</li>
                <li>"Show products"</li>
                <li>"Search for [item]"</li>
              </ul>
            </li>
            <li>Watch the transcript update in real-time</li>
            <li>Click "Stop Listening" when done</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
