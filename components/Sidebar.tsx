
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, ShoppingBag, LifeBuoy, Mail, Globe, ShoppingCart, User, ShieldAlert } from 'lucide-react';
import { Language, ViewState } from '../App';

interface SidebarProps {
  activeView: ViewState;
  setActiveView: (v: ViewState) => void;
  lang: Language;
  setLang: (l: Language) => void;
  cartCount: number;
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onAuthClick: () => void;
  hasActiveDiscount?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, lang, setLang, cartCount, isLoggedIn, isAdmin, onAuthClick, hasActiveDiscount }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: { id: ViewState; icon: any; label: { en: string; ar: string; he: string }; adminOnly?: boolean }[] = [
    { id: 'home', icon: Home, label: { en: 'Home', ar: 'الرئيسية', he: 'בית' } },
    { id: 'products', icon: ShoppingBag, label: { en: 'Products', ar: 'المنتجات', he: 'מוצרים' } },
    { id: 'support', icon: LifeBuoy, label: { en: 'Support', ar: 'الدعم', he: 'תמיכה' } },
    { id: 'contact', icon: Mail, label: { en: 'Contact', ar: 'اتصل بنا', he: 'צור קשר' } },
    { id: 'admin', icon: ShieldAlert, label: { en: 'Admin Console', ar: 'لوحة المسؤول', he: 'לוח מנהל' }, adminOnly: true },
  ];

  const isRTL = lang === 'ar' || lang === 'he';

  return (
    <>
      <motion.div
        animate={{ top: hasActiveDiscount ? (window.innerWidth < 768 ? 64 : 96) : (window.innerWidth < 768 ? 16 : 32) }}
        className={`fixed ${isRTL ? 'left-4 md:left-8' : 'right-4 md:right-8'} z-[500] flex gap-2 md:gap-4 transition-all duration-500`}
      >
        {!isAdmin && (
          <button onClick={() => setActiveView('cart')} className="p-2 md:p-4 backdrop-blur-xl border transition-all relative bg-white/5 border-white/10 text-white hover:bg-orange-500 hover:text-white">
            <ShoppingCart size={20} className="md:w-6 md:h-6" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-orange-600 text-white text-[8px] md:text-[10px] font-black flex items-center justify-center">{cartCount}</span>}
          </button>
        )}
        <button onClick={isLoggedIn ? () => setActiveView(isAdmin ? 'admin' : 'account') : onAuthClick} className={`p-2 md:p-4 backdrop-blur-xl border ${isAdmin ? 'border-orange-500 text-orange-500' : 'border-white/10 text-white'} hover:bg-orange-500 hover:text-white transition-all`}>
          {isAdmin ? <ShieldAlert size={20} className="md:w-6 md:h-6" /> : <User size={20} className="md:w-6 md:h-6" />}
        </button>
        <button onClick={() => setIsOpen(true)} className="p-2 md:p-4 backdrop-blur-xl border transition-all group bg-white/5 border-white/10 text-white hover:bg-orange-500 hover:text-white">
          <Menu className="group-hover:scale-110 transition-transform md:w-6 md:h-6" size={20} />
        </button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[600]" />
            <motion.div
              initial={{ x: isRTL ? -400 : 400 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? -400 : 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-full md:w-96 bg-zinc-950 border-l border-white/5 z-[700] p-8 md:p-12 flex flex-col`}
            >
              <div className="flex justify-between items-center mb-12 md:mb-20">
                <Globe size={20} className="text-white/20" />
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={32} />
                </button>
              </div>
              <nav className="flex-1 space-y-4 md:space-y-8 overflow-y-auto">
                {menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveView(item.id); setIsOpen(false); }}
                      className={`flex items-center gap-4 md:gap-6 w-full group ${active ? 'text-orange-500' : 'text-white/40 hover:text-white'}`}
                    >
                      <div className={`p-2 md:p-3 border transition-all ${active ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 group-hover:border-white/20'}`}><Icon size={18} className="md:w-5 md:h-5" /></div>
                      <span className="text-lg md:text-xl font-black italic tracking-tighter uppercase transition-transform group-hover:translate-x-2">{item.label[lang]}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="pt-8 md:pt-12 border-t border-white/5 flex gap-2 md:gap-4">
                {['en', 'ar', 'he'].map((l) => (
                  <button key={l} onClick={() => setLang(l as Language)} className={`flex-1 py-3 text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] border transition-all ${lang === l ? 'border-orange-500 text-orange-500 bg-orange-500/5' : 'border-white/5 text-white/20 hover:text-white'}`}>{l.toUpperCase()}</button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
