
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Promotion, Product } from '../App';
import { ShoppingCart, CheckCircle, ArrowRight, Tag, Heart } from 'lucide-react';
import { auth, getSavedProducts, addSavedProduct, removeSavedProduct, onAuthChange } from '../lib/firebase';

interface ProductSectionProps {
  lang: Language;
  onAddToCart: (p: Product) => void;
  onGoToCart: () => void;
  activePromo: Promotion | null;
  products: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({ lang, onAddToCart, onGoToCart, activePromo, products }) => {
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      loadSavedProducts(currentUser.uid);
    }

    // Listen for auth changes
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setUserId(user.uid);
        loadSavedProducts(user.uid);
      } else {
        setUserId(null);
        setSavedProducts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadSavedProducts = async (uid: string) => {
    const products = await getSavedProducts(uid);
    setSavedProducts(products);
  };

  const toggleSaveProduct = async (p: Product) => {
    if (!userId) {
      alert('Please login to save products');
      return;
    }

    const isSaved = savedProducts.includes(p.id);

    if (isSaved) {
      // Remove from saved
      const { error } = await removeSavedProduct(userId, p.id);

      if (!error) {
        setSavedProducts(prev => prev.filter(id => id !== p.id));
      }
    } else {
      // Add to saved
      const { error } = await addSavedProduct(userId, {
        id: p.id,
        title: p.title.en,
        price: p.price,
        img: p.img
      });

      if (!error) {
        setSavedProducts(prev => [...prev, p.id]);
      }
    }
  };

  const t = {
    en: { collection: "NEO-CLEAN ECOSYSTEM", master: "TOTAL PURIFICATION ARCHITECTURE.", add: "ADD TO CART", added: "PRODUCT ADDED", continue: "CONTINUE SHOPPING", viewCart: "VIEW CART" },
    ar: { collection: "نظام نيو-كلين", master: "بنية التنقية الكاملة.", add: "أضف إلى السلة", added: "تمت الإضافة", continue: "متابعة التسوق", viewCart: "عرض السلة" },
    he: { collection: "מערכת אקולוגית ניאו-קלין", master: "ארכיטקטורת טיהור כוללת.", add: "הוסף לסל", added: "המוצר נוסף", continue: "המשך בקניות", viewCart: "צפה בסל" }
  }[lang];

  const handleAdd = (p: Product) => {
    onAddToCart(p);
    setAddedProduct(p.id);
  };

  return (
    <section className="py-12 md:py-20 px-6 max-w-7xl mx-auto space-y-32 md:space-y-64">
      <div className="text-center space-y-4 md:space-y-8 mb-20 md:mb-40">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} className="text-[8px] md:text-xs tracking-[1em] md:tracking-[1.5em] uppercase">{t.collection}</motion.h2>
        <h3 className="text-3xl md:text-6xl lg:text-9xl font-black italic tracking-tighter uppercase leading-[0.9]">{t.master}</h3>
      </div>

      {products.map((p, idx) => {
        const hasDiscount = activePromo?.active && (activePromo.targets === 'all' || activePromo.targets.includes(p.id));
        const finalPrice = hasDiscount ? p.price * (1 - activePromo!.percent / 100) : p.price;

        return (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-32 items-center`}
          >
            <div className="flex-1 space-y-6 md:space-y-12 z-10 text-center md:text-right">
              <div className="space-y-2 md:space-y-4">
                <div className="flex items-center gap-4 justify-center md:justify-end">
                   {hasDiscount && (
                     <span className="px-2 md:px-3 py-1 bg-white text-black text-[8px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 md:gap-2">
                       <Tag size={10} /> {activePromo!.percent}% OFF
                     </span>
                   )}
                   <span className="text-orange-500 text-[10px] md:text-sm tracking-[0.4em] md:tracking-[0.6em] font-black uppercase">{p.series[lang]}</span>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter leading-none">{p.title[lang]}</h2>
              </div>
              <p className="text-sm md:text-xl lg:text-2xl opacity-40 font-light leading-relaxed max-w-xl mx-auto md:ml-auto md:mr-0">{p.desc[lang]}</p>
              
              <div className="pt-4 md:pt-8 flex flex-col items-center md:items-end gap-4 md:gap-6">
                <div className="flex items-baseline gap-3 md:gap-4">
                  {hasDiscount && <span className="text-lg md:text-2xl font-black opacity-20 line-through">₪{p.price}</span>}
                  <span className="text-3xl md:text-5xl font-black italic">₪{finalPrice.toFixed(0)}</span>
                </div>
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
                  <button
                    onClick={() => handleAdd(p)}
                    className="flex-1 md:flex-none px-8 md:px-14 py-4 md:py-6 bg-orange-600 text-white font-black uppercase tracking-tighter hover:bg-black transition-all text-xs md:text-sm rounded-none shadow-2xl flex items-center justify-center gap-3 md:gap-4"
                  >
                    <ShoppingCart size={18} className="md:w-5 md:h-5" /> {t.add}
                  </button>
                  <button
                    onClick={() => toggleSaveProduct(p)}
                    className={`px-4 md:px-6 py-4 md:py-6 border-2 font-black uppercase tracking-tighter transition-all text-xs md:text-sm rounded-none shadow-2xl flex items-center justify-center gap-2 ${
                      savedProducts.includes(p.id)
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    <Heart size={18} className={`md:w-5 md:h-5 ${savedProducts.includes(p.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full relative group perspective-1000">
              <motion.div whileHover={{ rotateY: 5, rotateX: -5 }} className="relative aspect-[16/10] overflow-hidden border-2 border-orange-500/20 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.6)] z-20 transition-transform duration-500">
                <img src={p.img} alt={p.title[lang]} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-125 group-hover:scale-105" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}

      <AnimatePresence>
        {addedProduct && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-zinc-950 border border-orange-500/30 p-8 md:p-12 max-w-lg w-full text-center space-y-6 md:space-y-8 shadow-2xl"
            >
              <CheckCircle className="mx-auto text-orange-500" size={48} md={64} />
              <div className="space-y-2">
                <h4 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase">{t.added}</h4>
                <p className="text-white/40 uppercase tracking-widest text-[8px] md:text-xs">Unit has been added to your logistics manifest.</p>
              </div>
              <div className="flex flex-col gap-3 md:gap-4">
                <button onClick={() => setAddedProduct(null)} className="w-full py-4 md:py-5 bg-white text-black font-black uppercase tracking-tighter hover:bg-orange-500 transition-all text-[10px] md:text-xs">{t.continue}</button>
                <button onClick={() => { setAddedProduct(null); onGoToCart(); }} className="w-full py-4 md:py-5 border border-white/10 text-white font-black uppercase tracking-tighter hover:bg-white hover:text-black transition-all text-[10px] md:text-xs flex items-center justify-center gap-3 md:gap-4">{t.viewCart} <ArrowRight size={14} className="md:w-4 md:h-4" /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
