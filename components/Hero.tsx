
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
    <div className="relative w-full h-full">
      {/* Tagline - Bottom Center */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-20 md:bottom-24 left-0 right-0 text-center px-6"
        style={{ direction: 'ltr' }}
      >
        <p className="text-sm md:text-xl tracking-[0.3em] md:tracking-[0.5em] uppercase text-orange-500 font-black mb-3 md:mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
          {t.sub}
        </p>
        <p className="text-[9px] md:text-sm tracking-[0.15em] md:tracking-[0.3em] uppercase text-white/60 leading-relaxed max-w-xl mx-auto">
          {t.desc}
        </p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase text-white/30 font-bold">{t.scroll}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} className="text-orange-500/50 md:w-5 md:h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
};
