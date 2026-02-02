import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CartOverlay } from '../components/CartOverlay';
import { Language, CartItem, PromoCode } from '../App';

interface CartPageProps {
  lang: Language;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  promoCodes: PromoCode[];
}

export default function CartPage({ lang, cart, setCart, promoCodes }: CartPageProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-black overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
      }}
    >
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[150px]" />
      </div>

      {/* Back Button - Fixed Position */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/')}
        className="fixed top-24 left-6 md:left-12 z-50 flex items-center gap-3 text-white/40 hover:text-orange-500 transition-colors group"
      >
        <span className="w-10 h-10 border border-white/10 group-hover:border-orange-500/50 flex items-center justify-center transition-colors">
          ←
        </span>
        <span className="text-xs font-black tracking-widest uppercase hidden md:block">
          {lang === 'en' ? 'BACK' : lang === 'he' ? 'חזור' : 'رجوع'}
        </span>
      </motion.button>

      <div className="relative pt-32 pb-20 min-h-screen">
        <CartOverlay
          lang={lang}
          cart={cart}
          setCart={setCart}
          promoCodes={promoCodes}
          onCheckout={() => {
            setCart([]);
            navigate('/');
          }}
        />
      </div>

      {/* Footer Brand */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-black">MAXIOS SECURE CHECKOUT</p>
      </div>
    </motion.div>
  );
}
