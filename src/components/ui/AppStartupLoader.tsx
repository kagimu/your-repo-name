
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AppStartupLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const steps = [
    'Initializing Edumall...',
    'Loading resources...',
    'Setting up workspace...',
    'Almost ready...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let stepInterval: NodeJS.Timeout;
    let stepIndex = 0;

    const startProgress = () => {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex]);
          stepIndex++;
        }
      }, 800);
    };

    startProgress();

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"
    >
      <div className="text-center max-w-md mx-auto px-8">
        {/* Enhanced logo animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          className="relative mb-12"
        >
          <div className="w-32 h-32 mx-auto relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-transparent border-t-teal-400 border-r-blue-400 border-b-purple-400 border-l-pink-400 rounded-full"
            />
            
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-2 bg-gradient-to-br from-teal-400 via-blue-500 to-purple-500 rounded-full shadow-2xl"
            />
            
            <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center shadow-2xl">
              <img 
                src="/img/logo.png" 
                alt="Edumall" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Welcome to Edumall
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-blue-200 mb-8"
        >
          Your Educational Marketplace
        </motion.p>

        {/* Current step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-blue-300 text-sm">{currentStep}</p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <p className="text-blue-300 text-sm">{progress}%</p>
      </div>
    </motion.div>
  );
};
