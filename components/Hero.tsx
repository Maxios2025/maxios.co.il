
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../App';
import { ChevronDown } from 'lucide-react';

interface HeroProps {
  lang: Language;
}

export const Hero: React.FC<HeroProps> = ({ lang }) => {
  const introPlayed = typeof window !== 'undefined' && sessionStorage.getItem('maxios_intro_shown') === 'true';

  React.useEffect(() => {
    if (!introPlayed) {
      sessionStorage.setItem('maxios_intro_shown', 'true');
    }
  }, []);

  const content = {
    en: {
      sub: "Ultimate Suction. Silent Power.",
      desc: "Revolutionizing home hygiene with aerospace-grade motor technology and advanced filtration.",
      scroll: "Scroll to Reveal",
      scrollMobile: "Scroll Down"
    },
    ar: {
      sub: "قوة شفط قصوى. صمت مطلق.",
      desc: "نحدث ثورة في نظافة المنازل بتقنيات محركات الطيران ونظام تصفية متقدم.",
      scroll: "مرر للأسفل للاكتشاف",
      scrollMobile: "مرر للأسفل"
    },
    he: {
      sub: "שאיבה מקסימלית. כוח שקט.",
      desc: "מהפכה בהיגיינת הבית עם טכנולוגיית מנוע בדרגת תעופה וסינון מתקדם.",
      scroll: "גלול לגילוי",
      scrollMobile: "גלול למטה"
    }
  };

  const t = content[lang];

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full h-full">
      {/* Tagline - Bottom Center */}
      <motion.div
        initial={introPlayed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={introPlayed ? { duration: 0 } : { delay: 0.8, duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-28 md:bottom-24 left-0 right-0 text-center px-6"
      >
        {/* Reduced drop-shadow on mobile via responsive class */}
        <p className="text-sm md:text-xl tracking-[0.3em] md:tracking-[0.5em] uppercase text-orange-500 font-black mb-3 md:mb-4 md:drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
          {t.sub}
        </p>
        <p className="text-[13px] md:text-sm tracking-[0.15em] md:tracking-[0.3em] uppercase text-white/60 leading-relaxed max-w-xl mx-auto">
          {t.desc}
        </p>
      </motion.div>

      {/* Scroll Indicator — large & animated on both mobile and desktop */}
      <motion.button
        initial={introPlayed ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={introPlayed ? { duration: 0 } : { delay: 2, duration: 1 }}
        onClick={handleScrollDown}
        className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 md:gap-2 cursor-pointer bg-transparent border-none outline-none pb-[env(safe-area-inset-bottom)] hover:scale-110 transition-transform"
        aria-label="Scroll down"
      >
        {/* Desktop: visible text label */}
        <span className="hidden md:block text-xs tracking-[0.4em] uppercase text-white/60 font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{t.scroll}</span>
        {/* Mobile: prominent Hebrew text label */}
        <span className="block md:hidden text-[14px] font-bold text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{t.scrollMobile}</span>
        {/* Desktop: bigger white arrow with bounce */}
        <ChevronDown className="hidden md:block w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-hero-bounce" />
        {/* Mobile: large white arrow with bounce */}
        <ChevronDown className="block md:hidden w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-hero-bounce" />
      </motion.button>
    </div>
  );
};
