
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../App';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ lang }) => {
  const content = {
    en: {
      sub: "Ultimate Suction. Silent Power.",
      desc: "Revolutionizing home hygiene with aerospace-grade motor technology and advanced filtration.",
      scroll: "Scroll to Reveal"
    },
    ar: {
      sub: "قوة شفط قصوى. صمت مطلق.",
      desc: "نحدث ثورة في نظافة المنازل بتقنيات محركات الطيران ونظام تصفية متقدم.",
      scroll: "مرر للأسفل للاكتشاف"
    },
    he: {
      sub: "שאיבה מקסימלית. כוח שקט.",
      desc: "מהפכה בהיגיינת הבית עם טכנולוגיית מנוע בדרגת תעופה וסינון מתקדם.",
      scroll: "גלול לגילוי"
    }
  };

  const t = content[lang];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end pb-24 md:pb-32 px-6">
      <div className="text-center space-y-4 md:space-y-6 max-w-2xl">
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
          className="text-xs md:text-lg tracking-[0.4em] md:tracking-[0.8em] uppercase text-orange-500 font-black mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] leading-tight"
        >
          {t.sub}
        </motion.p>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.4, duration: 1.5 }}
          className="text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.4em] uppercase text-white leading-loose font-medium px-4"
        >
          {t.desc}
        </motion.p>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase text-white/30 font-bold">{t.scroll}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-orange-500/50 md:w-5 md:h-5" />
        </motion.div>
      </motion.div>
      
      {/* Background Tech Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="absolute top-1/4 left-4 md:left-10 text-[40px] md:text-[80px] font-black italic text-white/10 select-none">120K RPM</div>
        <div className="absolute bottom-1/4 right-4 md:right-10 text-[40px] md:text-[80px] font-black italic text-white/10 select-none">HEPA-14</div>
      </div>
    </div>
  );
};
