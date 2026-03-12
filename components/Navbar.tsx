
import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { Language } from '../App';

interface NavbarProps {
  opacity: MotionValue<number>;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ opacity, lang, setLang }) => {
  const translations = {
    en: { home: 'HOME', product: 'PRODUCTS', support: 'SUPPORT', contact: 'CONTACT' },
    ar: { home: 'الرئيسية', product: 'المنتجات', support: 'الدعم', contact: 'اتصل بنا' },
    he: { home: 'בית', product: 'מוצרים', support: 'תמיכה', contact: 'צור קשר' }
  };

  const t = translations[lang];

  return (
    <motion.nav 
      style={{ opacity }}
      className="fixed top-0 left-0 right-0 z-50 h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-2xl"
    >
      {/* Spacer for Logo Transition */}
      <div className="w-48 hidden md:block" />

      {/* Nav Items */}
      <ul className="flex items-center gap-4 md:gap-10 absolute left-1/2 -translate-x-1/2">
        <li><a href="#" className="text-white/60 hover:text-orange-500 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 uppercase">{t.home}</a></li>
        <span className="text-white/10 select-none hidden md:inline">|</span>
        <li><a href="#product" className="text-white/60 hover:text-orange-500 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 uppercase">{t.product}</a></li>
        <span className="text-white/10 select-none hidden md:inline">|</span>
        <li><a href="#support" className="text-white/60 hover:text-orange-500 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 uppercase">{t.support}</a></li>
        <span className="text-white/10 select-none hidden md:inline">|</span>
        <li><a href="#contact" className="text-white/60 hover:text-orange-500 text-xs md:text-sm font-medium tracking-widest transition-all duration-300 uppercase">{t.contact}</a></li>
      </ul>

      {/* Language Selector */}
      <div className="flex gap-4 items-center">
        {['en', 'ar', 'he'].map((l) => (
          <button 
            key={l}
            onClick={() => setLang(l as Language)}
            className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 border ${lang === l ? 'border-orange-500 text-orange-500' : 'border-white/10 text-white/40 hover:text-white'}`}
          >
            {l}
          </button>
        ))}
      </div>
    </motion.nav>
  );
};
