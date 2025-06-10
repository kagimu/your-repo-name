
import React from 'react';
import { motion } from 'framer-motion';

interface PreLoaderProps {
  isLoading: boolean;
  message?: string;
  type?: 'default' | 'auth' | 'logout';
}

export const PreLoader: React.FC<PreLoaderProps> = ({ 
  isLoading, 
  message = "Loading...",
  type = 'default'
}) => {
  if (!isLoading) return null;

  const getColors = () => {
    switch (type) {
      case 'auth':
        return {
          background: 'from-blue-900 via-teal-900 to-blue-900',
          ring: 'border-t-blue-400 border-r-teal-400',
          circle: 'from-blue-400 to-teal-500',
          text: 'from-blue-400 to-teal-400',
          dots: 'from-blue-400 to-teal-400',
          progress: 'from-blue-400 via-teal-400 to-blue-400'
        };
      case 'logout':
        return {
          background: 'from-red-900 via-orange-900 to-red-900',
          ring: 'border-t-red-400 border-r-orange-400',
          circle: 'from-red-400 to-orange-500',
          text: 'from-red-400 to-orange-400',
          dots: 'from-red-400 to-orange-400',
          progress: 'from-red-400 via-orange-400 to-red-400'
        };
      default:
        return {
          background: 'from-slate-900 via-purple-900 to-slate-900',
          ring: 'border-t-teal-400 border-r-blue-400',
          circle: 'from-teal-400 to-blue-500',
          text: 'from-teal-400 to-blue-400',
          dots: 'from-teal-400 to-blue-400',
          progress: 'from-teal-400 via-blue-400 to-purple-400'
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br ${colors.background}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <div className="text-center">
        <div className="relative mb-8">
          {/* Outer spinning ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-32 h-32 mx-auto border-4 border-transparent ${colors.ring} rounded-full`}
          />
          
          {/* Inner pulsing circle */}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`absolute inset-6 bg-gradient-to-br ${colors.circle} rounded-full`}
          />
          
          {/* Center logo with better styling */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-10 bg-white rounded-full flex items-center justify-center shadow-2xl"
          >
            <img 
              src="/lovable-uploads/76509dcc-120a-4d6a-ac62-e95f73910665.png" 
              alt="Edumall" 
              className="w-12 h-12 object-contain"
            />
          </motion.div>
        </div>
        
        <motion.h3
          animate={{ 
            opacity: [0.7, 1, 0.7],
            y: [0, -2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`text-3xl font-bold bg-gradient-to-r ${colors.text} bg-clip-text text-transparent mb-6`}
        >
          {message}
        </motion.h3>
        
        {/* Animated dots */}
        <div className="flex space-x-2 justify-center mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className={`w-4 h-4 bg-gradient-to-r ${colors.dots} rounded-full`}
            />
          ))}
        </div>
        
        {/* Enhanced progress bar */}
        <div className="w-80 mx-auto">
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className={`h-full w-full bg-gradient-to-r ${colors.progress} rounded-full shadow-lg`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
