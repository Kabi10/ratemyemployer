'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { AssessmentList } from '@/components/AssessmentList';

export default function BackgroundCheck() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Debounced resize handler with touch device detection
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Reduce particle count on mobile
  const particleCount = dimensions.width < 768 ? 4 : 8;
  const particles = Array.from({ length: particleCount }).map(() => ({
    initialX: Math.random() * dimensions.width,
    initialY: Math.random() * dimensions.height,
    scale: Math.random() * 0.3 + 0.2,
    duration: Math.random() * 5 + 15,
  }));

  useEffect(() => {
    // Client-side only code
    const handleResize = () => {
      window.document.title = 'Resized';
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Optimized background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-[50px] md:w-[100px] h-[50px] md:h-[100px] rounded-full bg-white/5"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
              scale: particle.scale,
            }}
            animate={{
              x: [particle.initialX, particle.initialX + 50, particle.initialX],
              y: [particle.initialY, particle.initialY + 50, particle.initialY],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.5, 1],
            }}
            style={{ willChange: 'transform' }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Glass panel */}
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl border border-white/20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200"
            >
              Background Check
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-gray-300 text-center mb-8 md:mb-12 max-w-2xl mx-auto px-2"
            >
              Discover the truth about companies before making your next career
              move. Our comprehensive assessment framework helps you evaluate
              potential employers across multiple critical factors.
            </motion.p>

            {/* Search box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter company name..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 
                           backdrop-blur-lg text-white placeholder-gray-400 outline-none focus:ring-2 
                           focus:ring-blue-400/50 transition-all duration-300 shadow-lg text-base sm:text-lg"
                />
                <button
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 px-4 sm:px-6 py-1.5 sm:py-2 
                           rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/80 to-purple-500/80 
                           text-white font-medium text-sm sm:text-base hover:from-blue-500 hover:to-purple-500 
                           transition-all duration-300 backdrop-blur-lg shadow-lg hover:shadow-xl 
                           hover:scale-105 active:scale-95 touch-manipulation"
                >
                  Search
                </button>
              </div>
            </motion.div>

            {/* Assessment List */}
            <AssessmentList />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
