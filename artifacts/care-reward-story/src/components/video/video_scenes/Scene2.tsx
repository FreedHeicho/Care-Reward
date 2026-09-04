import { motion } from 'framer-motion';
import { SceneLayout, VideoText, SafeFrame } from '@/lib/video';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => setPhase(4), 2600);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  return (
    <SceneLayout className="bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)]">
      {/* Background Transition from Scene 1 */}
      <motion.div
        className="absolute inset-0 bg-[var(--color-primary)]"
        initial={{ scaleY: 0, originY: 1 }}
        animate={{ scaleY: 1 }}
        exit={{ scaleY: 0, originY: 0 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />
      
      {/* Decorative gradient */}
      <motion.div 
        className="absolute top-0 right-0 w-full h-[80%] bg-gradient-to-b from-[var(--color-secondary)] to-transparent opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0 ? 0.2 : 0 }}
        transition={{ duration: 1 }}
      />

      <SafeFrame>
        <div className="absolute inset-0 flex flex-row items-center justify-between px-[10vw]">
          
          {/* Left: Copy */}
          <div className="flex-1 pr-12 z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={phase > 0 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VideoText
                size="xl"
                weight="medium"
                className="text-[var(--color-secondary)] uppercase tracking-widest mb-4 block"
              >
                Introducing
              </VideoText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={phase > 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VideoText
                size="5xl"
                weight="bold"
                className="leading-tight mb-6"
              >
                CareReward
              </VideoText>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase > 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VideoText
                size="2xl"
                className="text-[var(--color-bg-muted)] opacity-90 leading-relaxed max-w-lg"
              >
                Your personal guide to discovering the actions that matter most for your health.
              </VideoText>
            </motion.div>
          </div>

          {/* Right: Mock UI Cards */}
          <div className="flex-1 relative h-full flex items-center justify-center">
            {/* Card 1 */}
            <motion.div
              className="absolute bg-white rounded-3xl p-8 shadow-2xl w-[28vw] z-20"
              initial={{ opacity: 0, y: 100, rotate: -5 }}
              animate={phase > 1 ? { opacity: 1, y: -40, rotate: -2 } : { opacity: 0, y: 100, rotate: -5 }}
              exit={{ opacity: 0, y: -100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            >
              <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-4">
                <div className="w-6 h-6 bg-[var(--color-primary)] rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-6"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-[var(--color-secondary)] opacity-20 rounded-full w-24"></div>
                <div className="h-8 w-8 rounded-full bg-gray-100"></div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              className="absolute bg-white rounded-3xl p-8 shadow-xl w-[28vw] z-10"
              initial={{ opacity: 0, y: 120, rotate: 5 }}
              animate={phase > 2 ? { opacity: 0.9, y: 80, x: 40, rotate: 6 } : { opacity: 0, y: 120, rotate: 5 }}
              exit={{ opacity: 0, y: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <div className="flex justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--color-bg-light)]"></div>
                <div className="w-16 h-8 rounded-full bg-[var(--color-accent)] opacity-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3"></div>
            </motion.div>

            {/* Card 3 (Bottom blurred) */}
            <motion.div
              className="absolute bg-white rounded-3xl p-6 shadow-lg w-[26vw] z-0 blur-sm"
              initial={{ opacity: 0, y: 150 }}
              animate={phase > 3 ? { opacity: 0.5, y: 180, x: -30, rotate: -8 } : { opacity: 0, y: 150 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              <div className="h-16 bg-gray-100 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </motion.div>
          </div>

        </div>
      </SafeFrame>
    </SceneLayout>
  );
}
