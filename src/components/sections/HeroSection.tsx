import React, { useEffect, useState, Suspense } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
const HeroScene = React.lazy(() => import('../3d/HeroScene'));
import { EdumallButton } from '../ui/EdumallButton';
import { useMobile } from '@/hooks/use-mobile';
import { MobileHeroBackground } from './MobileHeroBackground';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const controls = useAnimation();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    controls.start({ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 });
  }, [isVisible, controls]);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* 3D Background - Visible on all screen sizes */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-teal-50">
            <MobileHeroBackground />
          </div>
        }>
          <HeroScene />
        </Suspense>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="glass-strong rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 mt-24 sm:mt-0 relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1.2,
              delay: 0.7,
              type: "spring",
              stiffness: 100
            }}
            className="text-4xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-3 sm:mb-6"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="inline-block text-transparent bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text"
            >
              Educational
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="block text-transparent bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text"
            >
              Excellence
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 1,
              delay: 1.6,
              type: "spring",
              damping: 12
            }}
            className="relative text-base sm:text-md md:text-lg text-gray-600 mb-10 sm:mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {isMobile ? (
              <>
                {["Premium educational supplies", "delivered across Uganda.", "Lab equipment, IT solutions", "& quality furniture for institutions."].map((text, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 1.8 + index * 0.2,
                      ease: "easeOut"
                    }}
                    className="inline-block mr-1"
                  >
                    {text}{" "}
                  </motion.span>
                ))}
              </>
            ) : (
              "Your trusted partner for premium educational supplies. From cutting-edge laboratory equipment to modern IT solutions and quality furniture - we deliver excellence to institutions across Uganda."
            )}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <motion.div
              className="relative inline-block"
              animate={{
                y: [0, -6, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              {/* Pulsing highlight effect */}
              <motion.div
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400/20 to-teal-400/20 blur-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
              
              {/* Main button */}
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  y: -2
                }}
                whileTap={{ 
                  scale: 0.95,
                  y: 2
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15
                }}
              >
                <EdumallButton 
                  variant="primary" 
                  size={isMobile ? "md" : "lg"}
                  onClick={() => navigate('/categories')}
                  className="relative text-sm sm:text-lg px-6 sm:px-10 py-2.5 sm:py-4 rounded-xl sm:rounded-2xl
                    bg-gradient-to-r from-blue-500 via-blue-400 to-teal-500
                    shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                  
                  {/* Text with subtle bounce */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      y: [0, -2, 0]
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      y: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }
                    }}
                    className="relative z-10 font-bold tracking-wide"
                  >
                    Shop Now
                  </motion.span>
                </EdumallButton>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Enhanced Mobile Stats Slider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="mt-12 sm:hidden"
          >
            <div className="overflow-hidden relative py-1.5 px-4">
              <motion.div
                className="flex gap-2 absolute"
                initial={{ x: 0 }}
                animate={{ 
                  x: [0, -282]  // 3 cards * (90px width + 4px gap)
                }}
                transition={{
                  x: {
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }
                }}
              >
                {[
                  { 
                    number: '500+', 
                    label: 'Products', 
                    icon: '📦',
                    gradient: 'from-blue-500/20 to-teal-500/20'
                  },
                  { 
                    number: '100+', 
                    label: 'Schools', 
                    icon: '🏫',
                    gradient: 'from-teal-500/20 to-emerald-500/20'
                  },
                  { 
                    number: '24/7', 
                    label: 'Support', 
                    icon: '💬',
                    gradient: 'from-emerald-500/20 to-blue-500/20'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className={`flex-none w-[90px] p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-bold text-gray-800">{stat.number}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
              {/* Clone for seamless loop */}
              <motion.div
                className="flex gap-2 absolute left-[282px]"
                initial={{ x: 0 }}
                animate={{ 
                  x: [-282, 0]  // Move to original position
                }}
                transition={{
                  x: {
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop"
                  }
                }}
              >
                {[
                  { 
                    number: '500+', 
                    label: 'Products', 
                    icon: '📦',
                    gradient: 'from-blue-500/20 to-teal-500/20'
                  },
                  { 
                    number: '100+', 
                    label: 'Schools', 
                    icon: '🏫',
                    gradient: 'from-teal-500/20 to-emerald-500/20'
                  },
                  { 
                    number: '24/7', 
                    label: 'Support', 
                    icon: '💬',
                    gradient: 'from-emerald-500/20 to-blue-500/20'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={`clone-${index}`}
                    className={`flex-none w-[90px] p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} backdrop-blur-sm`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="font-bold text-gray-800">{stat.number}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* Slider Indicators */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center gap-1">
                {[0, 1, 2].map((_, index) => (
                  <motion.div
                    key={index}
                    className="w-1 h-1 rounded-full bg-gray-300"
                    initial={{ opacity: 0.3 }}
                    animate={{ 
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      delay: index * 0.3,
                      repeat: Infinity
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Hidden on Mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>

    </section>
  );
};
