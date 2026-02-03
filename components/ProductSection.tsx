
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Product } from '../App';
import { ShoppingCart, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  lang: Language;
  onAddToCart: (p: Product) => void;
  onGoToCart: () => void;
  products: Product[];
}

export const ProductSection: React.FC<ProductSectionProps> = ({ lang, onAddToCart, onGoToCart, products }) => {
  const [addedProduct, setAddedProduct] = useState<string | null>(null);
  const [imageIndices, setImageIndices] = useState<{ [key: string]: number }>({});

  const t = {
    en: { collection: "NEO-CLEAN ECOSYSTEM", master: "TOTAL PURIFICATION ARCHITECTURE.", add: "ADD TO CART", added: "PRODUCT ADDED", continue: "CONTINUE SHOPPING", viewCart: "VIEW CART" },
    ar: { collection: "نظام نيو-كلين", master: "بنية التنقية الكاملة.", add: "أضف إلى السلة", added: "تمت الإضافة", continue: "متابعة التسوق", viewCart: "عرض السلة" },
    he: { collection: "מערכת אקולוגית ניאו-קלין", master: "ארכיטקטורת טיהור כוללת.", add: "הוסף לסל", added: "המוצר נוסף", continue: "המשך בקניות", viewCart: "צפה בסל" }
  }[lang];

  const handleAdd = (p: Product) => {
    onAddToCart(p);
    setAddedProduct(p.id);
  };

  // Get all images for a product (main + additional)
  const getProductImages = (p: Product): string[] => {
    const images = [p.img];
    if (p.images && p.images.length > 0) {
      images.push(...p.images);
    }
    return images;
  };

  // Navigate to previous image
  const prevImage = (productId: string, totalImages: number) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Navigate to next image
  const nextImage = (productId: string, totalImages: number) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  // Go to specific image
  const goToImage = (productId: string, index: number) => {
    setImageIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  return (
    <section className="py-12 md:py-20 px-6 max-w-7xl mx-auto space-y-32 md:space-y-64">
      <div className="text-center space-y-4 md:space-y-8 mb-20 md:mb-40">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 0.2 }} className="text-[8px] md:text-xs tracking-[1em] md:tracking-[1.5em] uppercase">{t.collection}</motion.h2>
        <h3 className="text-3xl md:text-6xl lg:text-9xl font-black italic tracking-tighter uppercase leading-[0.9]">{t.master}</h3>
      </div>

      {products.map((p, idx) => {
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
                   <span className="text-orange-500 text-[10px] md:text-sm tracking-[0.4em] md:tracking-[0.6em] font-black uppercase">{p.series[lang]}</span>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black italic tracking-tighter leading-none">{p.title[lang]}</h2>
              </div>
              <p className="text-sm md:text-xl lg:text-2xl opacity-40 font-light leading-relaxed max-w-xl mx-auto md:ml-auto md:mr-0">{p.desc[lang]}</p>

              <div className="pt-4 md:pt-8 flex flex-col items-center md:items-end gap-4 md:gap-6">
                <div className="flex items-baseline gap-3 md:gap-4">
                  <span className="text-3xl md:text-5xl font-black italic">₪{p.price}</span>
                </div>
                <button
                  onClick={() => handleAdd(p)}
                  className="px-8 md:px-14 py-4 md:py-6 bg-orange-600 text-white font-black uppercase tracking-tighter hover:bg-black transition-all text-xs md:text-sm rounded-none shadow-2xl flex items-center justify-center gap-3 md:gap-4"
                >
                  <ShoppingCart size={18} className="md:w-5 md:h-5" /> {t.add}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full relative group perspective-1000">
              {(() => {
                const allImages = getProductImages(p);
                const currentIndex = imageIndices[p.id] || 0;
                const hasMultipleImages = allImages.length > 1;

                return (
                  <div className="relative">
                    <motion.div whileHover={{ rotateY: 5, rotateX: -5 }} className="relative aspect-[16/10] overflow-hidden border-2 border-orange-500/20 bg-zinc-950 shadow-[0_0_80px_rgba(0,0,0,0.6)] z-20 transition-transform duration-500">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentIndex}
                          src={allImages[currentIndex]}
                          alt={p.title[lang]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-125 group-hover:scale-105"
                        />
                      </AnimatePresence>
                    </motion.div>

                    {/* Navigation Arrows - RTL aware */}
                    {hasMultipleImages && (() => {
                      const isRTL = lang === 'he' || lang === 'ar';
                      // In RTL: left arrow = next, right arrow = prev (content flows right-to-left)
                      const handleLeftClick = () => isRTL ? nextImage(p.id, allImages.length) : prevImage(p.id, allImages.length);
                      const handleRightClick = () => isRTL ? prevImage(p.id, allImages.length) : nextImage(p.id, allImages.length);

                      return (
                        <div className="flex items-center justify-center gap-6 mt-4" dir="ltr">
                          <button
                            onClick={handleLeftClick}
                            className="p-3 border border-white/10 text-white/40 hover:text-orange-500 hover:border-orange-500 transition-all duration-300"
                            aria-label={isRTL ? "Next image" : "Previous image"}
                          >
                            <ChevronLeft size={20} />
                          </button>

                          {/* Dot Indicators */}
                          <div className="flex items-center gap-2">
                            {allImages.map((_, dotIndex) => (
                              <button
                                key={dotIndex}
                                onClick={() => goToImage(p.id, dotIndex)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  dotIndex === currentIndex
                                    ? 'bg-orange-500 w-4'
                                    : 'bg-white/20 hover:bg-white/40'
                                }`}
                                aria-label={`Go to image ${dotIndex + 1}`}
                              />
                            ))}
                          </div>

                          <button
                            onClick={handleRightClick}
                            className="p-3 border border-white/10 text-white/40 hover:text-orange-500 hover:border-orange-500 transition-all duration-300"
                            aria-label={isRTL ? "Previous image" : "Next image"}
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                );
              })()}
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
