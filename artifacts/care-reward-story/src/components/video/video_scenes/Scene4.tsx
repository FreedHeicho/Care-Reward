import { motion } from 'framer-motion';
import { SceneLayout, VideoText, SafeFrame } from '@/lib/video';
import { useEffect, useState } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1500); // Coins burst
    const t3 = setTimeout(() => setPhase(3), 2000); // Headline
    const t4 = setTimeout(() => setPhase(4), 2800); // Sub

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  // Generate coin particle data
  const coins = Array.from({ length: 15 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 15;
    const distance = 150 + Math.random() * 150;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      scale: 0.5 + Math.random() * 0.5,
      rotation: Math.random() * 360,
    };
  });

  return (
    <SceneLayout className="bg-[var(--color-primary-dark)] text-white overflow-hidden">
      {/* Background Pulse */}
      <motion.div
        className="absolute inset-0 bg-[var(--color-primary)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0 ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      />

      <SafeFrame>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Rewards Centerpiece */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-12">
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[var(--color-accent)] opacity-20"
              initial={{ scale: 0.5 }}
              animate={phase > 0 ? { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] } : { scale: 0.5 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Core Coin */}
            <motion.div
              className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[#D97706] shadow-[0_0_50px_rgba(245,158,11,0.5)] flex items-center justify-center z-20"
              initial={{ scale: 0, rotateY: 90 }}
              animate={phase > 0 ? { scale: 1, rotateY: 0 } : { scale: 0, rotateY: 90 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <VideoText size="4xl" weight="bold" className="text-white drop-shadow-md">
                +500
              </VideoText>
            </motion.div>

            {/* Particle Burst */}
            {coins.map((coin, i) => (
              <motion.div
                key={i}
                className="absolute w-8 h-8 rounded-full bg-[var(--color-accent)] z-10"
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={phase > 1 ? { 
                  x: coin.x, 
                  y: coin.y, 
                  scale: coin.scale,
                  opacity: [0, 1, 0],
                  rotate: coin.rotation
                } : { x: 0, y: 0, scale: 0, opacity: 0 }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeOut",
                  delay: Math.random() * 0.2
                }}
              />
            ))}
          </div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={phase > 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center z-10"
          >
            <VideoText
              size="5xl"
              weight="bold"
              className="mb-4 text-[var(--color-accent)]"
            >
              Get Rewarded.
            </VideoText>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={phase > 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center z-10"
          >
            <VideoText
              size="2xl"
              className="text-white opacity-90 max-w-2xl"
            >
              Earn points for closing care gaps. Redeem for gift cards, premium plans, or direct cost reductions.
            </VideoText>
          </motion.div>
          
        </div>
      </SafeFrame>
    </SceneLayout>
  );
}
