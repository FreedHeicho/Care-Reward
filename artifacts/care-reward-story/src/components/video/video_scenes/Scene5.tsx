import { motion } from 'framer-motion';
import { SceneLayout, VideoText, SafeFrame } from '@/lib/video';
import { useEffect, useState } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => setPhase(3), 2600);

    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <SceneLayout className="bg-[var(--color-bg-light)]">
      <SafeFrame>
        {/* Animated background shapes */}
        <motion.div
          className="absolute left-[-20vw] bottom-[-20vh] w-[80vw] h-[80vw] rounded-full bg-[var(--color-bg-muted)] opacity-50 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 4, ease: "easeOut" }}
        />
        
        <motion.div
          className="absolute right-[-10vw] top-[-10vh] w-[40vw] h-[40vw] rounded-full bg-[var(--color-secondary)] opacity-10 blur-3xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 4, ease: "easeOut", delay: 1 }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Main Message */}
          <div className="text-center mb-16 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={phase > 0 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VideoText
                size="4xl"
                weight="bold"
                className="text-[var(--color-text-primary)] mb-4"
              >
                Better health. Lower costs.
              </VideoText>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={phase > 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <VideoText
                size="2xl"
                weight="medium"
                className="text-[var(--color-text-secondary)]"
              >
                Everyone wins with CareReward.
              </VideoText>
            </motion.div>
          </div>

          {/* Logo Lockup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={phase > 2 ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <img 
              src={`${import.meta.env.BASE_URL}images/carealign-logo.png`} 
              alt="CareAlign" 
              className="h-20 object-contain mb-4"
            />
            <div className="h-px w-24 bg-[var(--color-text-muted)] opacity-30 mb-4"></div>
            <VideoText size="lg" weight="bold" className="text-[var(--color-primary)] uppercase tracking-[0.3em]">
              CareReward
            </VideoText>
          </motion.div>
          
        </div>
      </SafeFrame>
    </SceneLayout>
  );
}
