import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export const MobileHeroBackground: React.FC = () => {
  const controls = useAnimation();

  useEffect(() => {
    // Animate the background pattern
    controls.start({
      backgroundPosition: ['0% 0%', '100% 100%'],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'linear'
      }
    });
  }, [controls]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden sm:hidden">
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        style={{
          background: 'linear-gradient(120deg, rgba(56, 189, 248, 0.1), rgba(13, 148, 136, 0.1), rgba(56, 189, 248, 0.1))',
          backgroundSize: '200% 200%'
        }}
        animate={{
          opacity: 1,
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          opacity: { duration: 1 },
          backgroundPosition: {
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }
        }}
      />

      {/* Animated morphing blobs */}
      <motion.div
        className="absolute top-0 -left-20 w-64 h-64 rounded-[60%] bg-gradient-to-br from-teal-200/20 to-blue-200/20 blur-3xl"
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
          borderRadius: ['60% 40% 30% 70%', '30% 60% 70% 40%', '60% 40% 30% 70%']
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-40 -right-20 w-72 h-72 rounded-[60%] bg-gradient-to-bl from-blue-200/20 to-teal-200/20 blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
          rotate: [360, 270, 180, 90, 0],
          borderRadius: ['50% 60% 70% 30%', '70% 30% 50% 60%', '50% 60% 70% 30%']
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
          ease: "easeInOut"
        }}
      />
      
      {/* Pulse effect */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, rgba(13, 148, 136, 0.1) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Animated flowing lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.3">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.3">
              <animate
                attributeName="offset"
                values="1;2;1"
                dur="5s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3">
              <animate
                attributeName="offset"
                values="0;1;0"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0.3">
              <animate
                attributeName="offset"
                values="1;2;1"
                dur="7s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0 200 C 150 150, 300 250, 450 200 C 600 150, 750 250, 900 200"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          className="opacity-20"
          initial={{ pathLength: 0, strokeDasharray: "5,5" }}
          animate={{ 
            pathLength: [0, 1],
            strokeDashoffset: ["0", "-20"]
          }}
          transition={{
            pathLength: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            },
            strokeDashoffset: {
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
        
        <motion.path
          d="M-100 400 C 100 350, 300 450, 500 400 C 700 350, 900 450, 1100 400"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          className="opacity-20"
          initial={{ pathLength: 0, strokeDasharray: "3,6" }}
          animate={{ 
            pathLength: [0, 1],
            strokeDashoffset: ["0", "20"]
          }}
          transition={{
            pathLength: {
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 1
            },
            strokeDashoffset: {
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }
          }}
        />
      </svg>

      {/* Interactive floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-blue-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0 }}
            animate={{
              y: [0, -15, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [0, 1, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Light rays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(13,148,136,0.1),rgba(37,99,235,0.05),transparent_70%)]" />
    </div>
  );
};
