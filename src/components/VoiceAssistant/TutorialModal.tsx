import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, onSkip }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  
  const steps = [
    {
      title: 'Welcome to Voice Shopping!',
      description: 'Your personal voice assistant is here to help you shop hands-free. Watch for the voice indicator to know when it\'s listening.',
      example: 'Click the microphone icon in the bottom-right corner or press Alt+M to start.'
    },
    {
      title: 'Search & Filter',
      description: 'Use natural voice commands to search products and apply filters. The assistant will confirm your request.',
      example: 'Try: "Find lab equipment under $500" or "Search for microscopes in stock"'
    },
    {
      title: 'Shopping Made Easy',
      description: 'Browse categories, add items to cart, and update quantities with voice commands. If something\'s unclear, just say "What can I say?"',
      example: 'Say: "Add two of these to cart" or "Show me the education category"'
    },
    {
      title: 'Smart Budget Assistant',
      description: 'Get personalized recommendations and stay within budget. The assistant will show options in your price range.',
      example: 'Ask: "What lab equipment can I get for $1000?" or "Find chemistry sets within my budget"'
    },
    {
      title: 'Voice Feedback',
      description: 'Watch the visual indicators to see when the assistant is listening, thinking, or ready for your next command.',
      example: 'The microphone icon will pulse when listening and show a spinner when processing'
    },
    {
      title: 'Help & Shortcuts',
      description: 'Access help anytime with voice or keyboard. If a command isn\'t recognized, try rephrasing or use the suggested commands.',
      example: 'Say "Show command list" or press "?" for help, Alt+M to toggle mic, Esc to cancel'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-0"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute right-2 md:right-4 top-2 md:top-4 p-1 hover:bg-gray-100 rounded-full"
              aria-label="Close tutorial"
            >
              <X size={20} />
            </button>

            <div className="space-y-4 md:space-y-6">
              {/* Progress indicator */}
              <div className="flex justify-center space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full w-4 md:w-6 transition-colors ${
                      index === currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Current step content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>

                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <p className="text-gray-600">{steps[currentStep].description}</p>
                  <p className="text-sm text-blue-600 italic">
                    {steps[currentStep].example}
                  </p>
                </div>
              </motion.div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  {currentStep === 0 ? (
                    <button
                      onClick={onSkip}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Skip tutorial
                    </button>
                  ) : (
                    <button
                      onClick={prevStep}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border rounded"
                    >
                      Back
                    </button>
                  )}
                </div>
                
                <button
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialModal;
