
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Tag, Clock } from 'lucide-react';
import { Promotion } from '../App';

interface DiscountHeaderProps {
  promotion: Promotion | null;
  splash: boolean;
  setSplash: (s: boolean) => void;
  onViewProducts: () => void;
}

export const DiscountHeader: React.FC<DiscountHeaderProps> = ({ promotion, splash, setSplash, onViewProducts }) => {
  useEffect(() => {
    if (splash) {
      const timer = setTimeout(() => {
        setSplash(false);
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [splash]);

  if (!promotion || !promotion.active) return null;

  return (
    <>
      <AnimatePresence>
        {splash && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.1, y: -window.innerHeight/2 + 50, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="bg-zinc-950 border-4 border-orange-600 p-12 md:p-20 text-center space-y-10 shadow-[0_0_100px_rgba(234,88,12,0.4)] relative overflow-hidden max-w-2xl w-full"
            >
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-orange-600/10 blur-[100px]" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-600/10 blur-[100px]" />
              <div className="space-y-4">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="mx-auto w-20 h-20 bg-orange-600 text-black flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.6)]">
                  <Tag size={40} strokeWidth={3} />
                </motion.div>
                <h2 className="text-white text-xs tracking-[1em] uppercase font-black">COMMAND TRANSMISSION</h2>
              </div>
              <div className="space-y-4">
                <h3 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">-{promotion.percent}%</h3>
                <p className="text-2xl font-black italic text-orange-500 uppercase tracking-tighter">{promotion.text}</p>
              </div>
              <div className="pt-8 flex flex-col items-center gap-4">
                <button onClick={onViewProducts} className="px-12 py-5 bg-white text-black font-black uppercase tracking-tighter hover:bg-orange-600 hover:text-white transition-all text-sm flex items-center gap-4 shadow-2xl">
                  VIEW DISCOUNTED UNITS <ArrowRight size={18} />
                </button>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-black">EXPIRES IN {promotion.duration} HOURS</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!splash && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -50 }} animate={{ height: 'auto', opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-[1000] bg-orange-600 text-black overflow-hidden shadow-[0_0_50px_rgba(234,88,12,0.5)]"
          >
            <div className="relative py-3 flex items-center overflow-hidden whitespace-nowrap">
              <motion.div 
                animate={{ x: [0, -window.innerWidth] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="flex items-center gap-12"
              >
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center gap-8 px-4">
                    <Sparkles size={18} />
                    <span className="text-sm md:text-lg font-black italic tracking-tighter uppercase">
                      {promotion.text} - {promotion.percent}% OFF - <span className="text-black/60"><Clock size={16} className="inline mb-1 mr-1" />ENDS IN {promotion.duration}H</span>
                    </span>
                    <Sparkles size={18} />
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
