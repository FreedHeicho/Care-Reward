import { motion } from 'framer-motion';
import { SceneLayout, VideoText, SafeFrame } from '@/lib/video';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <SceneLayout className="bg-[var(--color-bg-light)]">
      <SafeFrame>
        {/* Animated background shape */}
        <motion.div
          className="absolute right-[-10vw] top-[-10vh] w-[60vw] h-[60vw] rounded-full bg-[var(--color-bg-muted)] opacity-50 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 4, ease: "easeOut" }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.92, opacity: 1, y: 0 }}
            animate={{ 
              scale: phase > 0 ? 1 : 0.92, 
              opacity: 1, 
              y: phase > 1 ? -150 : 0 // move up when text appears
            }}
            exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center mb-8"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/carealign-logo.png`} 
              alt="CareAlign" 
              className="h-24 object-contain"
            />
          </motion.div>

          {/* Problem Statement */}
          <div className="text-center absolute top-1/2 left-0 right-0 -translate-y-1/2 mt-12 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={phase > 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
            >
              <VideoText
                size="4xl"
                weight="bold"
                className="text-[var(--color-text-primary)] mb-4"
              >
                Healthcare can be complex.
              </VideoText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase > 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
            >
              <VideoText
                size="2xl"
                weight="medium"
                className="text-[var(--color-text-muted)]"
              >
                Are you missing your next best action?
              </VideoText>
            </motion.div>
          </div>
        </div>
      </SafeFrame>
    </SceneLayout>
  );
}
