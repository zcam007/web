'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HoverScale } from './AnimationWrappers';

export default function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState<{days:number,hours:number,minutes:number,seconds:number}>({days:0,hours:0,minutes:0,seconds:0});
  useEffect(() => {
    const t = setInterval(() => {
      const diff = Math.max(0, new Date(target).getTime() - Date.now());
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff / (1000*60*60)) % 24);
      const minutes = Math.floor((diff / (1000*60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setLeft({days,hours,minutes,seconds});
    }, 1000);
    return () => clearInterval(t);
  }, [target]);
  return (
    <div className="flex gap-4 text-center justify-center mt-4">
      {Object.entries(left).map(([k,v]) => (
       
        <HoverScale key={k} scale={1.1}>
          <motion.div 
            className="w-24 rounded-2xl shadow-lg p-6 transition-all duration-300 border border-white/20"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px) saturate(180%)',
              WebkitBackdropFilter: 'blur(4px) saturate(180%)',
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={v}
                className="text-3xl font-semibold"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {v}
              </motion.div>
            </AnimatePresence>
            <div className="opacity-90 uppercase text-xs font-medium">{k}</div>
          </motion.div>
        </HoverScale>
      ))}
    </div>
  );
}
