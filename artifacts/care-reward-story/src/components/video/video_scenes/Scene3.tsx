import { motion } from 'framer-motion';
import { SceneLayout, VideoText, SafeFrame } from '@/lib/video';
import { useEffect, useState } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => setPhase(4), 2200);
    const t5 = setTimeout(() => setPhase(5), 2800);

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout);
  }, []);

  return (
    <SceneLayout className="bg-[var(--color-bg-light)] overflow-hidden">
      {/* Dynamic Background Wipe */}
      <motion.div
        className="absolute inset-0 bg-[var(--color-bg-muted)]"
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ clipPath: 'circle(150% at 50% 50%)' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
      />
      
      {/* Top Banner Accent */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[30vh] bg-[var(--color-primary)]"
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />

      <SafeFrame>
        <div className="absolute inset-0 flex flex-col items-center pt-[15vh]">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase > 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center z-10"
          >
            <VideoText
              size="4xl"
              weight="bold"
              className="text-white mb-2"
            >
              Take Action. Close Gaps.
            </VideoText>
            <VideoText
              size="xl"
              className="text-[var(--color-secondary)] opacity-90"
            >
              From annual checkups to vital screenings.
            </VideoText>
          </motion.div>

          {/* Staggered Action Cards */}
          <div className="flex gap-8 mt-24 z-10 px-8 w-full justify-center">
            {/* Action 1 */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl w-[22vw] border-t-4 border-[var(--color-primary)]"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={phase > 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-6">
                <div className="text-[var(--color-primary)] text-2xl font-bold">1</div>
              </div>
              <VideoText size="xl" weight="bold" className="text-[var(--color-text-primary)] mb-3 block">
                Annual Wellness
              </VideoText>
              <div className="h-2 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-3/4 mb-6"></div>
              <div className="w-full h-10 bg-[var(--color-primary)] rounded-full opacity-10"></div>
            </motion.div>

            {/* Action 2 */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl w-[22vw] border-t-4 border-[var(--color-secondary)]"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={phase > 2 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-6">
                <div className="text-[var(--color-secondary)] text-2xl font-bold">2</div>
              </div>
              <VideoText size="xl" weight="bold" className="text-[var(--color-text-primary)] mb-3 block">
                Flu Vaccine
              </VideoText>
              <div className="h-2 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-2/3 mb-6"></div>
              <div className="w-full h-10 bg-[var(--color-secondary)] rounded-full opacity-10"></div>
            </motion.div>

            {/* Action 3 */}
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-xl w-[22vw] border-t-4 border-[var(--color-accent)] relative overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={phase > 3 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Highlight flash */}
              <motion.div
                className="absolute inset-0 bg-[var(--color-accent)] opacity-10"
                initial={{ x: '-100%' }}
                animate={phase > 4 ? { x: '100%' } : { x: '-100%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center mb-6">
                <div className="text-[var(--color-accent)] text-2xl font-bold">3</div>
              </div>
              <VideoText size="xl" weight="bold" className="text-[var(--color-text-primary)] mb-3 block">
                A1C Screening
              </VideoText>
              <div className="h-2 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-4/5 mb-6"></div>
              <div className="w-full h-10 bg-[var(--color-accent)] rounded-full opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </SafeFrame>
    </SceneLayout>
  );
}
