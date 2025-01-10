'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function BackgroundCheck() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Pre-calculate random positions for better performance
  const particles = Array.from({ length: 8 }).map(() => ({
    initialX: Math.random() * dimensions.width,
    initialY: Math.random() * dimensions.height,
    scale: Math.random() * 0.3 + 0.2,
    duration: Math.random() * 5 + 15
  }));

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Optimized background particles */}
      <div className="absolute inset-0 overflow-hidden opacity-60">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-[100px] h-[100px] rounded-full bg-white/5"
            initial={{ x: particle.initialX, y: particle.initialY, scale: particle.scale }}
            animate={{
              x: [particle.initialX, particle.initialX + 100, particle.initialX],
              y: [particle.initialY, particle.initialY + 100, particle.initialY],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.5, 1]
            }}
            style={{
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Glass panel */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold text-white text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-pink-200"
            >
              Background Check
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto"
            >
              Discover the truth about companies before making your next career move. 
              Our advanced background check reveals workplace culture, employee experiences, 
              and potential red flags.
            </motion.p>

            {/* Search box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Enter company name..."
                  className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-lg
                           text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400/50
                           transition-all duration-300 shadow-lg"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl
                                 bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white font-medium
                                 hover:from-blue-500 hover:to-purple-500 transition-all duration-300
                                 backdrop-blur-lg shadow-lg hover:shadow-xl hover:scale-105">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid md:grid-cols-3 gap-6 text-center"
            >
              {[
                {
                  title: "Company Culture",
                  description: "Insights into workplace environment and values"
                },
                {
                  title: "Employee Reviews",
                  description: "Real experiences from current and former employees"
                },
                {
                  title: "Red Flags",
                  description: "Potential warning signs and controversies"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10
                           hover:bg-white/10 transition-all duration-300 group hover:scale-105"
                >
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-200 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 