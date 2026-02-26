import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';
import { Phone, Shield, Truck, Award, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Language } from '../App';
import { trackAddToCart } from '../lib/analytics';

const productImages = [
  "/hero-poster.jpeg",
  "/product-angle-1.jpeg",
  "/product-angle-2.jpeg",
  "/mms.jpeg",
  "/lods.jpeg"
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="w-full p-4 md:p-5 flex justify-between items-center text-left gap-4">
        <span className="text-white font-semibold text-sm md:text-base">{question}</span>
        {open ? <ChevronUp size={20} className="text-orange-500 shrink-0" /> : <ChevronDown size={20} className="text-white/40 shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <p className="px-4 md:px-5 pb-4 md:pb-5 text-white/60 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HomePageProps {
  lang: Language;
  isRTL: boolean;
  onOpenCheckout: () => void;
  onAdminLogin: () => void;
}

export default function HomePage({ lang, isRTL, onOpenCheckout, onAdminLogin }: HomePageProps) {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const homeHeroOpacity = useTransform(scrollY, [100, 300], [1, 0]);

  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Ensure video plays on all devices — handles autoplay policy
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay blocked by browser — play on first user interaction
      const playOnInteraction = () => {
        video.play().catch(() => {});
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      };
      document.addEventListener('click', playOnInteraction, { passive: true });
      document.addEventListener('scroll', playOnInteraction, { passive: true });
      document.addEventListener('touchstart', playOnInteraction, { passive: true });
    });
  }, []);

  // Image carousel states
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageDirection, setImageDirection] = useState(0);

  // On mobile: simple fade only (no x/scale transforms)
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

  const goNext = useCallback(() => {
    setImageDirection(1);
    setCurrentImageIndex(prev => prev === productImages.length - 1 ? 0 : prev + 1);
  }, [productImages.length]);

  const goPrev = useCallback(() => {
    setImageDirection(-1);
    setCurrentImageIndex(prev => prev === 0 ? productImages.length - 1 : prev - 1);
  }, [productImages.length]);

  return (
    <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
      <div
        className="relative"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #1A0F08 35%, #1A0F08 65%, #000000 100%)'
        }}
      >

        <section className="relative h-screen sticky top-0 overflow-hidden">
          {/* Background Video — plays on ALL devices (desktop + mobile).
              Uses <source> with media queries so mobile loads the small 480p version
              and desktop loads the 720p version. Poster shows instantly while video loads. */}
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/hero-poster.jpeg"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
          >
            {/* Mobile loads small 480p version (~2-3MB), desktop loads 720p (~5-8MB) */}
            <source src="/background-video-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            <source src="/background-video.mp4" type="video/mp4" />
          </video>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />
          {/* Hero content */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 2, opacity: homeHeroOpacity }}
          >
            <Hero lang={lang} />
          </motion.div>
        </section>

        <div className="relative z-10">

          <div className="flex flex-col items-center justify-center px-6 relative z-10 pt-32 md:pt-48 pb-6 md:pb-8">
            <motion.h2
              initial={isMobile ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              whileInView={isMobile ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              transition={{ duration: isMobile ? 0.3 : 1.5, ease: [0.22, 1, 0.36, 1] }}
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
                      {/* Blur glow — desktop only */}
                      <div className="hidden md:block absolute inset-0 bg-orange-500/20 blur-[100px] group-hover:bg-orange-500/30 transition-all duration-700" />
                      <div className="relative border-2 border-orange-500/20 p-8 md:p-12 bg-black/40 md:backdrop-blur-xl overflow-hidden">
                        <AnimatePresence mode="wait" custom={imageDirection}>
                          <motion.img
                            key={currentImageIndex}
                            src={productImages[currentImageIndex]}
                            alt="MAXIOS PRO-18"
                            width={400}
                            height={400}
                            custom={imageDirection}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full h-auto object-contain max-h-[400px] mx-auto md:filter md:drop-shadow-[0_0_60px_rgba(249,115,22,0.3)]"
                            loading="lazy"
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

                      <div className="flex gap-2">
                        {productImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => { setImageDirection(idx > currentImageIndex ? 1 : -1); setCurrentImageIndex(idx); }}
                            aria-label={`${lang === 'he' ? 'תמונה' : 'Image'} ${idx + 1}`}
                            className={`w-5 h-5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'bg-orange-500 scale-125' : 'bg-white/30 hover:bg-white/50'}`}
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
                    <div className="relative group border border-purple-500/30 p-4 bg-black/40 md:backdrop-blur-xl overflow-hidden">
                      <div className="hidden md:block absolute inset-0 bg-purple-500/10 blur-[60px] group-hover:bg-purple-500/20 transition-all duration-700" />
                      <div className="relative flex flex-col gap-3">
                        <img
                          src="/product-side.jpeg"
                          alt="Free Mop Attachment"
                          className="w-full h-auto object-contain max-h-[120px] group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <img
                          src="/product-side-copy.jpeg"
                          alt="Free Mop Attachment"
                          className="w-full h-auto object-contain max-h-[120px] group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="absolute top-2 left-2 px-3 py-1.5 bg-purple-600 text-white font-black text-xs uppercase tracking-wider">
                        🎁 {lang === 'en' ? 'FREE' : lang === 'he' ? 'חינם' : 'مجاني'}
                      </div>
                    </div>
                    <div className={`relative border border-purple-500/30 p-6 bg-black/40 md:backdrop-blur-xl flex flex-col justify-center ${lang === 'he' || lang === 'ar' ? 'text-right' : ''}`}>
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
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">{lang === 'en' ? 'RUNTIME' : lang === 'he' ? 'זמן פعולה' : 'وقت التشغيل'}</span>
                      <span className="text-xl font-black text-white">60min</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-4xl md:text-5xl font-black text-white">₪1,899</span>
                      <span className="text-white/40 text-sm line-through">₪2,499</span>
                      <span className="px-3 py-1.5 bg-orange-600 text-black text-[15px] font-black">{lang === 'en' ? '25% OFF' : lang === 'he' ? '25% הנחה' : '25% خصم'}</span>
                    </div>
                    <p className="text-white/40 text-xs">{lang === 'en' ? 'Price includes VAT' : lang === 'he' ? 'המחיר כולל מע״מ' : 'السعر شامل ضريبة القيمة المضافة'}</p>
                    <span className="px-5 py-2.5 bg-cyan-600 text-white text-[18px] font-black uppercase tracking-wider inline-flex items-center gap-2">
                      {lang === 'en' ? '2ND UNIT FOR ONLY ₪1,599' : lang === 'he' ? 'יח׳ שני ב-₪1,599 בלבד' : 'الوحدة الثانية بـ ₪1,599 فقط'}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      <span className="px-4 py-2 bg-green-600 text-white text-[14px] font-black uppercase tracking-wider flex items-center gap-2">
                        ✓ {lang === 'en' ? 'FREE SHIPPING' : lang === 'he' ? 'משלוח חינם' : 'شحن مجاني'}
                      </span>
                      <span className="px-4 py-2 bg-purple-600 text-white text-[14px] font-black uppercase tracking-wider flex items-center gap-2">
                        🎁 {lang === 'en' ? 'FREE GIFT' : lang === 'he' ? 'מתנה חינם' : 'هدية مجانية'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        trackAddToCart('MAXIOS PRO-18', 1899, 1);
                        onOpenCheckout();
                      }}
                      className="w-full md:w-auto px-12 py-5 bg-orange-600 text-white font-black uppercase text-sm tracking-wider hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_40px_rgba(234,88,12,0.3)] flex items-center justify-center gap-3"
                    >
                      {lang === 'en' ? 'ORDER NOW' : lang === 'he' ? 'הזמינו עכשיו' : 'اطلب الآن'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Trust Badges */}
          <div className="py-12 md:py-20 px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { icon: <Truck size={28} className="text-orange-500" />, he: 'משלוח חינם', en: 'Free Shipping', ar: 'شحن مجاني' },
                  { icon: <Shield size={28} className="text-orange-500" />, he: 'אחריות שנה', en: '1 Year Warranty', ar: 'ضمان سنة' },
                  { icon: <Award size={28} className="text-orange-500" />, he: 'מוצר מקורי', en: 'Authentic Product', ar: 'منتج أصلي' },
                  { icon: <Phone size={28} className="text-orange-500" />, he: 'שירות לקוחות', en: 'Customer Service', ar: 'خدمة العملاء' },
                ].map((badge, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 p-4 md:p-6 border border-white/10 bg-white/[0.02] text-center">
                    {badge.icon}
                    <span className={`text-white/80 text-sm font-bold ${lang === 'he' ? 'font-hebrew' : lang === 'ar' ? 'font-arabic' : ''}`}>
                      {lang === 'en' ? badge.en : lang === 'he' ? badge.he : badge.ar}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="py-16 md:py-24 px-6 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10 md:mb-14">
                <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase">{lang === 'en' ? 'REVIEWS' : lang === 'he' ? 'ביקורות לקוחות' : 'مراجعات العملاء'}</span>
                <h2 className={`text-3xl md:text-5xl font-black mt-2 ${lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic' : ''}`}>
                  {lang === 'en' ? 'What Our Customers Say' : lang === 'he' ? 'מה הלקוחות שלנו אומרים' : 'ماذا يقول عملاؤنا'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { name: 'דנה כ.', city: 'תל אביב', text: 'שואב מדהים! שקט ברמות, עוצמת שאיבה חזקה מאוד. ממליצה בחום!', stars: 5 },
                  { name: 'מיכל ל.', city: 'חיפה', text: 'קניתי לפני חודש ואני מרוצה מאוד. המגב הרטוב זה באמת בונוס שווה.', stars: 5 },
                  { name: 'יעל ש.', city: 'ראשון לציון', text: 'סוף סוף שואב שעובד כמו שצריך. הילדים עושים בלאגן ותוך דקות הכל נקי.', stars: 5 },
                  { name: 'רונית א.', city: 'באר שבע', text: 'המחיר שווה כל שקל. השואב קל, חזק, והסוללה מחזיקה הרבה זמן.', stars: 5 },
                  { name: 'נועה ד.', city: 'נתניה', text: 'עברתי משואב אחר וההבדל ענק. MAXIOS פשוט ברמה אחרת.', stars: 5 },
                  { name: 'שירה מ.', city: 'ירושלים', text: 'קיבלתי את ראש המגב במתנה — שווה זהב! מנקה רצפות בצורה מושלמת.', stars: 4 },
                ].map((review, i) => (
                  <div key={i} className="p-5 md:p-6 border border-white/10 bg-white/[0.02] space-y-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.stars }).map((_, s) => (
                        <Star key={s} size={16} className="text-orange-500 fill-orange-500" />
                      ))}
                      {Array.from({ length: 5 - review.stars }).map((_, s) => (
                        <Star key={s} size={16} className="text-white/20" />
                      ))}
                    </div>
                    <p className={`text-white/70 text-sm leading-relaxed ${lang === 'he' ? 'font-hebrew' : ''}`}>"{review.text}"</p>
                    <p className="text-white/40 text-xs font-bold">{review.name} — {review.city}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="py-16 md:py-24 px-6 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10 md:mb-14">
                <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase">{lang === 'en' ? 'FAQ' : lang === 'he' ? 'שאלות נפוצות' : 'الأسئلة الشائعة'}</span>
                <h2 className={`text-3xl md:text-5xl font-black mt-2 ${lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic' : ''}`}>
                  {lang === 'en' ? 'Frequently Asked Questions' : lang === 'he' ? 'שאלות ותשובות' : 'أسئلة وأجوبة'}
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { q: { en: 'How long does shipping take?', he: 'כמה זמן לוקח המשלוח?', ar: 'كم يستغرق الشحن؟' }, a: { en: 'Free shipping takes 2-4 business days across Israel.', he: 'משלוח חינם לכל הארץ תוך 2-4 ימי עסקים.', ar: 'الشحن المجاني يستغرق 2-4 أيام عمل في جميع أنحاء إسرائيل.' } },
                  { q: { en: 'What is the warranty?', he: 'מה האחריות על המוצר?', ar: 'ما هو الضمان؟' }, a: { en: '1 year full warranty on all parts and motor.', he: 'שנה אחריות מלאה על כל החלקים והמנוע.', ar: 'ضمان سنة كاملة على جميع القطع والمحرك.' } },
                  { q: { en: 'Can I return the product?', he: 'האם אפשר להחזיר את המוצר?', ar: 'هل يمكنني إرجاع المنتج؟' }, a: { en: 'Yes, 14-day return policy per Israeli consumer law.', he: 'כן, ניתן להחזיר את המוצר תוך 14 יום בהתאם לחוק הגנת הצרכן.', ar: 'نعم، سياسة إرجاع 14 يومًا وفقًا لقانون حماية المستهلك الإسرائيلي.' } },
                  { q: { en: 'How long does the battery last?', he: 'כמה זמן מחזיקה הסוללה?', ar: 'كم تدوم البطارية؟' }, a: { en: 'Up to 60 minutes of continuous use on a full charge.', he: 'עד 60 דקות של שימוש רצוף בטעינה מלאה.', ar: 'حتى 60 دقيقة من الاستخدام المتواصل بشحنة كاملة.' } },
                  { q: { en: 'Is the mop attachment included?', he: 'האם ראש המגב כלול?', ar: 'هل ملحق الممسحة مضمن؟' }, a: { en: 'Yes! The mop attachment is included free as a bonus gift.', he: 'כן! ראש המגב כלול חינם כמתנת בונוס.', ar: 'نعم! ملحق الممسحة مضمن مجانًا كهدية إضافية.' } },
                  { q: { en: 'What payment methods are accepted?', he: 'אילו אמצעי תשלום מקבלים?', ar: 'ما هي طرق الدفع المقبولة؟' }, a: { en: 'Cash on delivery across Israel.', he: 'תשלום במזומן בעת המסירה בכל הארץ.', ar: 'الدفع نقدًا عند التسليم في جميع أنحاء إسرائيل.' } },
                ].map((faq, i) => (
                  <FAQItem key={i} question={faq.q[lang]} answer={faq.a[lang]} />
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="py-20 md:py-40 px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
              <div className="space-y-4">
                <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-2 justify-center"><Phone size={14}/> {lang === 'en' ? 'TALK TO US' : lang === 'he' ? 'דברו איתנו' : 'تحدث إلينا'}</span>
                <h2 className={`text-4xl md:text-7xl font-black tracking-tighter uppercase ${
                  lang === 'he' ? 'font-hero-hebrew' : lang === 'ar' ? 'font-hero-arabic italic' : 'italic'
                }`}>{lang === 'en' ? 'GET IN TOUCH.' : lang === 'he' ? 'צרו קשר.' : 'تواصل معنا.'}</h2>
                <p className="text-sm md:text-base text-white/60">{lang === 'en' ? 'Have questions? Our team is here to help.' : lang === 'he' ? 'יש שאלות? הצוות שלנו כאן כדי לעזור.' : 'هل لديك أسئلة؟ فريقنا هنا للمساعدة.'}</p>
              </div>
              <button onClick={() => navigate('/contact')} className="px-16 py-6 bg-orange-600 text-white font-black uppercase text-sm hover:bg-black transition-all shadow-xl">
                {lang === 'en' ? 'CONTACT US' : lang === 'he' ? 'צרו קשר' : 'تواصل معنا'}
              </button>
            </div>
          </div>

        </div>

        <Footer lang={lang} onNavigate={(view) => navigate(`/${view === 'home' ? '' : view}`)} onAdminLogin={onAdminLogin} />
      </div>

      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[800] md:hidden bg-black/95 border-t border-orange-500/30 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <span className="text-white font-black text-lg">₪1,899</span>
          <span className="text-white/40 text-xs line-through mr-2">₪2,499</span>
        </div>
        <button
          onClick={() => {
            trackAddToCart('MAXIOS PRO-18', 1899, 1);
            onOpenCheckout();
          }}
          className="flex-1 py-3 bg-orange-600 text-white font-black uppercase text-sm tracking-wider text-center"
        >
          {lang === 'en' ? 'ORDER NOW' : lang === 'he' ? 'הזמינו עכשיו' : 'اطلب الآن'}
        </button>
      </div>
    </motion.div>
  );
}
