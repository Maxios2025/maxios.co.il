import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { Mail } from 'lucide-react';
import { Language, CartItem } from '../App';

interface HomePageProps {
  lang: Language;
  isRTL: boolean;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onAdminLogin: () => void;
}

export default function HomePage({ lang, isRTL, setCart, onAdminLogin }: HomePageProps) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const homeHeroOpacity = useTransform(scrollY, [100, 300], [1, 0]);

  // Detect mobile for reduced motion
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Force video playback on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // Autoplay blocked — try playing on first user interaction
      const playOnInteraction = () => {
        video.play().catch(() => {});
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction);
      document.addEventListener('scroll', playOnInteraction);
    });
  }, []);

  // Image carousel states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDirection, setImageDirection] = useState(0);

  const productImages = [
    "/hero-poster.jpeg",
    "/product-angle-1.jpeg",
    "/product-angle-2.jpeg",
    "/mms.jpeg",
    "/lods.jpeg"
  ];

  // Simpler animations on mobile for better performance
  const slideVariants = {
    enter: (dir: number) => ({
      x: isMobile ? 0 : (dir > 0 ? 300 : -300),
      opacity: 0,
      scale: isMobile ? 1 : 0.9
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (dir: number) => ({
      x: isMobile ? 0 : (dir < 0 ? 300 : -300),
      opacity: 0,
      scale: isMobile ? 1 : 0.9
    })
  };

  const goNext = () => {
    setImageDirection(1);
    setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  };

  const goPrev = () => {
    setImageDirection(-1);
    setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  };

  return (
    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
      {/* Single seamless cinematic gradient background */}
      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #1A0F08 35%, #1A0F08 65%, #000000 100%)'
        }}
      >

        <section className="relative h-screen sticky top-0 overflow-hidden">
          {/* Video Background */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            <source src="/background-video.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />
          {/* Hero content centered over video */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 2, opacity: homeHeroOpacity, willChange: 'opacity' }}
          >
            <Hero lang={lang} />
          </motion.div>
        </section>

        <div className="relative z-10">

          <div className="flex flex-col items-center justify-center px-6 relative z-10 pt-32 md:pt-48 pb-6 md:pb-8">
            {/* Hero Statement - The Text IS the Design */}
            <motion.h2
              initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              whileInView={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: isMobile ? 0.5 : 1.5, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true, margin: "-100px" }}
              className={`text-white text-center leading-[1.1] hero-glow mb-6 md:mb-8 ${
                lang === 'he'
                  ? 'font-hero-hebrew text-[50px] md:text-[80px] lg:text-[100px]'
                  : lang === 'ar'
                    ? 'font-hero-arabic text-[50px] md:text-[80px] lg:text-[100px]'
                    : 'font-hero text-[60px] md:text-[90px] lg:text-[110px]'
              }`}
            >
              {lang === 'en' ? "The engineering speaks for itself." : lang === 'ar' ? "الهندسة تتحدث عن نفسها." : "ההנדסה מדברת בעד עצמה."}
            </motion.h2>
          </div>

          {/* MAXIOS PRO-18 Product Showcase */}
          <div className="py-20 md:py-32 px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
                {/* Product Image + Gift Bundle */}
                <div className="space-y-6">
                  {/* Main Vacuum Image Carousel */}
                  <div className="relative">
                    <div className="relative group">
                      {/* Blur glow - hidden on mobile for performance */}
                      <div className="hidden md:block absolute inset-0 bg-orange-500/20 blur-[100px] group-hover:bg-orange-500/30 transition-all duration-700" />
                      <div className="relative border-2 border-orange-500/20 p-8 md:p-12 bg-black/40 md:backdrop-blur-xl overflow-hidden">
                        <AnimatePresence mode="wait" custom={imageDirection}>
                          <motion.img
                            key={currentImageIndex}
                            src={productImages[currentImageIndex]}
                            alt="MAXIOS PRO-18"
                            custom={imageDirection}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-auto object-contain max-h-[400px] mx-auto md:filter md:drop-shadow-[0_0_60px_rgba(249,115,22,0.3)]"
                          />
                        </AnimatePresence>
                        <div className="absolute top-4 left-4 px-4 py-2 bg-orange-600 text-black font-black text-[10px] uppercase tracking-widest">
                          {lang === 'en' ? 'FLAGSHIP MODEL' : lang === 'he' ? 'דגם הדגל' : 'الطراز الرئيسي'}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center justify-center gap-6 mt-4">
                      <button
                        onClick={goPrev}
                        className="w-12 h-12 border-2 border-orange-500/30 bg-black/60 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 flex items-center justify-center font-black text-xl"
                      >
                        {isRTL ? '→' : '←'}
                      </button>

                      {/* Dots Indicator */}
                      <div className="flex gap-2">
                        {productImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setImageDirection(idx > currentImageIndex ? 1 : -1); setCurrentImageIndex(idx); }}
                            className={`w-3 h-3 transition-all duration-300 ${currentImageIndex === idx ? 'bg-orange-500 scale-125' : 'bg-white/30 hover:bg-white/50'}`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={goNext}
                        className="w-12 h-12 border-2 border-orange-500/30 bg-black/60 text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300 flex items-center justify-center font-black text-xl"
                      >
                        {isRTL ? '←' : '→'}
                      </button>
                    </div>
                  </div>

                  {/* Plus Sign */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                    <span className="text-4xl md:text-5xl font-black text-purple-500">+</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                  </div>

                  {/* Free Gift Section */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Photos Stacked Vertically */}
                    <div className="relative group border border-purple-500/30 p-4 bg-black/40 md:backdrop-blur-xl overflow-hidden">
                      {/* Blur glow - hidden on mobile for performance */}
                      <div className="hidden md:block absolute inset-0 bg-purple-500/10 blur-[60px] group-hover:bg-purple-500/20 transition-all duration-700" />
                      <div className="relative flex flex-col gap-3">
                        <img
                          src="/product-side.jpeg"
                          alt="Free Mop Attachment"
                          className="w-full h-auto object-contain max-h-[120px] group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <img
                          src="/product-side-copy.jpeg"
                          alt="Free Mop Attachment"
                          className="w-full h-auto object-contain max-h-[120px] group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="absolute top-2 left-2 px-3 py-1.5 bg-purple-600 text-white font-black text-xs uppercase tracking-wider">
                        🎁 {lang === 'en' ? 'FREE' : lang === 'he' ? 'חינם' : 'مجاني'}
                      </div>
                    </div>
                    {/* Description */}
                    <div className={`relative border border-purple-500/30 p-6 bg-black/40 md:backdrop-blur-xl flex flex-col justify-center ${lang === 'he' || lang === 'ar' ? 'text-right' : ''}`}>
                      {/* Blur glow - hidden on mobile for performance */}
                      <div className="hidden md:block absolute inset-0 bg-purple-500/5 blur-[60px]" />
                      <div className="relative">
                        <h5 className={`text-lg md:text-xl font-black text-purple-400 uppercase mb-3 ${lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic' : ''}`}>
                          {lang === 'en' ? 'MOP ATTACHMENT' : lang === 'he' ? 'ראש מגב' : 'ملحق ممسحة'}
                        </h5>
                        <p className={`text-white/70 text-sm leading-relaxed ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>
                          {lang === 'en'
                            ? 'Professional dual-disc rotating mop head. Deep cleans hard floors with spinning microfiber pads. Perfect for tiles, wood & laminate.'
                            : lang === 'he'
                            ? 'ראש מגב מסתובב דו-דיסקי מקצועי. ניקוי עמוק לרצפות קשות עם פדים מסתובבים ממיקרופייבר. מושלם לאריחים, עץ ולמינציה.'
                            : 'رأس ممسحة دوار مزدوج القرص احترافي. تنظيف عميق للأرضيات الصلبة مع وسادات ميكروفايبر دوارة. مثالي للبلاط والخشب.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className={`space-y-6 md:space-y-8 ${lang === 'he' || lang === 'ar' ? 'text-right' : ''}`}>
                  <div className="space-y-2">
                    <span className="text-orange-500 font-black tracking-[0.3em] text-[10px] uppercase">
                      {lang === 'en' ? 'PROFESSIONAL SERIES' : lang === 'he' ? 'סדרה מקצועית' : 'السلسلة الاحترافية'}
                    </span>
                    <h3 className={`text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-none ${
                      lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic' : 'italic'
                    }`}>
                      MAXIOS<br/><span className="text-orange-500">PRO-18</span>
                    </h3>
                  </div>

                  <p className={`text-white/60 text-sm md:text-base leading-relaxed max-w-md ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>
                    {lang === 'en'
                      ? 'A smart cordless vacuum that redefines clean. Powered by an ultra-high-speed digital motor and advanced HEPA filtration, it captures 99.97% of dust and allergens — even the tiniest particles. The integrated wet-mop system cleans floors in a single pass, while silent engineering preserves your home\'s peace. No noise. No mess. Just pure clean.'
                      : lang === 'he'
                      ? 'שואב אבק אלחוטי חכם שמגדיר מחדש את הניקיון. מונע על ידי מנוע דיגיטלי במהירות גבוהה במיוחד וסינון HEPA מתקדם, הוא לוכד 99.97% מהאבק והאלרגנים — אפילו החלקיקים הזעירים ביותר. מערכת המגב הרטוב המשולבת מנקה רצפות במעבר אחד, בעוד ההנדסה השקטה שומרת על השלווה בביתך. ללא רעש. ללא לכלוך. רק ניקיון טהור.'
                      : 'مكنسة كهربائية لاسلكية ذكية تعيد تعريف النظافة. مدعومة بمحرك رقمي فائق السرعة وفلترة HEPA متقدمة، تلتقط 99.97% من الغبار والمسببات للحساسية — حتى أصغر الجزيئات. نظام الممسحة الرطبة المدمج ينظف الأرضيات بمرور واحد، بينما الهندسة الصامتة تحافظ على هدوء منزلك. بدون ضوضاء. بدون فوضى. فقط نظافة نقية.'}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 border border-white/10 bg-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">RPM</span>
                      <span className="text-xl font-black text-orange-500">120K</span>
                    </div>
                    <div className="px-4 py-2 border border-white/10 bg-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'en' ? 'FILTER' : lang === 'he' ? 'מסנן' : 'فلتر'}</span>
                      <span className="text-xl font-black text-orange-500">PRO-18</span>
                    </div>
                    <div className="px-4 py-2 border border-white/10 bg-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'en' ? 'RUNTIME' : lang === 'he' ? 'זמן פעולה' : 'وقت التشغيل'}</span>
                      <span className="text-xl font-black text-white">60min</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl md:text-5xl font-black text-white">₪1,899</span>
                      <span className="text-white/40 text-sm line-through">₪2,499</span>
                      <span className="px-3 py-1.5 bg-orange-600 text-black text-[15px] font-black uppercase">25%- discount</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-5 py-2.5 bg-green-600 text-white text-[18px] font-black uppercase tracking-wider flex items-center gap-2">
                        ✓ {lang === 'en' ? 'FREE SHIPPING' : lang === 'he' ? 'משלוח חינם' : 'شحن مجاني'}
                      </span>
                      <span className="px-5 py-2.5 bg-purple-600 text-white text-[18px] font-black uppercase tracking-wider flex items-center gap-2">
                        🎁 {lang === 'en' ? 'FREE GIFT INCLUDED' : lang === 'he' ? 'מתנה חינם' : 'هدية مجانية'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        // Add PRO-18 to cart (max 5 per product)
                        setCart(prev => {
                          const existing = prev.find(item => item.id === 'pro18');
                          if (existing) {
                            if (existing.qty >= 5) return prev;
                            return prev.map(item => item.id === 'pro18' ? { ...item, qty: item.qty + 1 } : item);
                          }
                          return [...prev, {
                            id: 'pro18',
                            name: lang === 'en' ? 'MAXIOS PRO-18' : lang === 'he' ? 'מקסיוס PRO-18' : 'ماكسيوس PRO-18',
                            price: 1899,
                            img: '/hero-poster.jpeg',
                            qty: 1
                          }];
                        });
                        navigate('/cart');
                      }}
                      className="w-full md:w-auto px-12 py-5 bg-orange-600 text-white font-black uppercase text-sm tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_40px_rgba(234,88,12,0.3)] flex items-center justify-center gap-3"
                    >
                      {lang === 'en' ? 'ORDER NOW' : lang === 'he' ? 'לקנות עכשיו' : 'اطلب الآن'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="py-20 md:py-40 px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
              <div className="space-y-4">
                <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-2 justify-center"><Mail size={14}/> {lang === 'en' ? 'QUICK PROTOCOL' : lang === 'he' ? 'פרוטוקול מהיר' : 'تواصل سريع'}</span>
                <h2 className={`text-4xl md:text-7xl font-black tracking-tighter uppercase ${
                  lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic italic' : 'italic'
                }`}>{lang === 'en' ? 'DROP A LINE.' : lang === 'he' ? 'צור קשר.' : 'تواصل معنا.'}</h2>
                <p className="text-[10px] md:text-sm opacity-40 tracking-[0.2em] md:tracking-[0.3em] uppercase text-white">{lang === 'en' ? 'Initialize direct connection to headquarters.' : lang === 'he' ? 'יצירת חיבור ישיר למטה.' : 'بدء الاتصال المباشر بالمقر.'}</p>
              </div>
              <button onClick={() => navigate('/contact')} className="px-16 py-6 bg-orange-600 text-white font-black uppercase text-sm hover:bg-black transition-all shadow-xl">
                {lang === 'en' ? 'CONTACT US' : lang === 'he' ? 'צור קשר' : 'تواصل معنا'}
              </button>
            </div>
          </div>

        </div>

        <Footer lang={lang} onNavigate={(view) => navigate(`/${view === 'home' ? '' : view}`)} onAdminLogin={onAdminLogin} />
      </div>
    </motion.div>
  );
}
