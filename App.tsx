
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { Hero } from './components/Hero';
import { ProductSection } from './components/ProductSection';
import { SupportSection } from './components/SupportSection';
import { ContactSection } from './components/ContactSection';
import { SupportChat } from './components/SupportChat';
import { AuthOverlay } from './components/AuthOverlay';
import { CartOverlay } from './components/CartOverlay';
import { AccountSection } from './components/AccountSection';
import { AdminConsole } from './components/AdminConsole';
import { DiscountHeader } from './components/DiscountHeader';
import VaporizeTextCycle from './components/ui/VapourTextEffect';
import { AuroraBackground } from './components/ui/AuroraBackground';
import { ArrowRight, ShoppingCart, User, Cpu, Wind, Layers, Box, LifeBuoy, Mail } from 'lucide-react';
import { fetchProducts, saveProduct } from './lib/firebase';

export type Language = 'en' | 'ar' | 'he';
export type ViewState = 'home' | 'products' | 'support' | 'contact' | 'cart' | 'account' | 'admin';

export interface Product {
  id: string;
  title: { [key in Language]: string };
  series: { [key in Language]: string };
  desc: { [key in Language]: string };
  price: number;
  img: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  img: string;
  qty: number;
}

export interface Promotion {
  active: boolean;
  text: string;
  percent: number;
  duration: number;
  targets: 'all' | string[];
  createdAt: string;
}

export interface PromoCode {
  code: string;
  percent: number;
  expiryHours: number;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
  address: { city: string; zip: string; street: string; };
  paymentMethods?: { id: string; last4: string; brand: string }[];
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "t18",
    title: { en: "MAXIOS T18 PRO", ar: "ماكسيوس T18 برو", he: "מקסיוס T18 פרו" },
    series: { en: "PRO-18 SERIES", ar: "سلسلة برو-18", he: "סדרת פרו-18" },
    desc: {
      en: "Premium cordless stick vacuum with powerful suction and wall-mounted charging dock. Features HEPA filtration, LED display, and 60-minute runtime.",
      ar: "مكنسة عصا لاسلكية فاخرة مع شفط قوي وقاعدة شحن مثبتة على الحائط. تتميز بفلتر HEPA وشاشة LED و60 دقيقة تشغيل.",
      he: "שואב אבק אלחוטי פרימיום עם כוח שאיבה עוצמתי ותחנת טעינה לקיר. כולל סינון HEPA, תצוגת LED וזמן פעולה של 60 דקות."
    },
    price: 599,
    img: "https://images.unsplash.com/photo-1592403711314-78d9c8f356b0?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "vac",
    title: { en: "MAX-VAC PRO ULTRA", ar: "ماكس-فاك برو الترا", he: "מקס-ואק פרו אולטרה" },
    series: { en: "INDUSTRIAL 120 SERIES", ar: "سلسلة الصناعية 120", he: "סדרה תעשייתית 120" },
    desc: {
      en: "Engineered for zero-loss suction. The 120,000 RPM hyper-sonic motor drives air through a multi-stage centrifugal system.",
      ar: "صُممت لشفط خالٍ من الفقد. محرك فائق السرعة بسرعة 120,000 دورة في الدقيقة يدفع الهواء عبر نظام طرد مركزي.",
      he: "הונדס לשאיבה ללא איבוד כוח. מנוע היפר-סוני ב-120,000 סל\"ד מזרים אוויר דרך מערכת צנטריפוגלית."
    },
    price: 899,
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "vac-elite",
    title: { en: "AERO-STORM ELITE X", ar: "إيرو-ستورم إيليت إكس", he: "אירו-סטורם אליט X" },
    series: { en: "QUANTUM AIR SERIES", ar: "سلسلة الهواء الكمومية", he: "סדרת אוויר קוונטי" },
    desc: {
      en: "Revolutionary cyclonic technology with AI-powered particle recognition. Features self-cleaning HEPA filtration and autonomous navigation.",
      ar: "تقنية إعصارية ثورية مع التعرف على الجسيمات بالذكاء الاصطناعي. ميزات الترشيح HEPA ذاتي التنظيف والملاحة الذاتية.",
      he: "טכנולוגיה ציקלונית מהפכנית עם זיהוי חלקיקים מבוסס AI. כולל סינון HEPA בניקוי עצמי וניווט אוטונומי."
    },
    price: 1299,
    img: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "dock",
    title: { en: "VOLT-CORE DOCK II", ar: "فولت-كور دوك 2", he: "וולט-קור דוק II" },
    series: { en: "ENERGIZE SERIES", ar: "سلسلة التنشيط", he: "סדרת האנרגיה" },
    desc: {
      en: "More than a charger. This is a maintenance hub. Automatic debris extraction and rapid battery conditioning.",
      ar: "أكثر من مجرد شاحن. إنه مركز صيانة. استخراج تلقائي للحطام وتكييف سريع للبطارية.",
      he: "יותר מסתם מטען. זהו מוקד תחזוקה. פינוי פסולת אוטומטי והכנת סוללה מהירה."
    },
    price: 450,
    img: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "vac-mini",
    title: { en: "NANO-CLEAN PORTABLE", ar: "نانو-كلين محمول", he: "ננו-קלין נייד" },
    series: { en: "COMPACT SERIES", ar: "السلسلة المدمجة", he: "סדרה קומפקטית" },
    desc: {
      en: "Ultra-compact handheld vacuum with 45-minute runtime. Perfect for cars, furniture, and quick cleanups. Weighs only 1.2kg.",
      ar: "مكنسة يدوية فائقة الدمج مع 45 دقيقة تشغيل. مثالية للسيارات والأثاث والتنظيف السريع. وزنها 1.2 كجم فقط.",
      he: "שואב אבק ידני קומפקטי במיוחד עם 45 דקות פעולה. מושלם לרכבים, רהיטים וניקיון מהיר. משקל 1.2 ק\"ג בלבד."
    },
    price: 249,
    img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=1200"
  }
];

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showHero, setShowHero] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [activeView, setActiveView] = useState<ViewState>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activePromotion, setActivePromotion] = useState<Promotion | null>(null);
  const [showPromoSplash, setShowPromoSplash] = useState(false);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const { scrollY } = useScroll();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Load Products from Supabase
    const loadProducts = async () => {
      const dbProducts = await fetchProducts();
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      } else {
        // No products in DB, use defaults and save them
        setProducts(DEFAULT_PRODUCTS);
        // Save default products to Supabase
        for (const p of DEFAULT_PRODUCTS) {
          await saveProduct(p);
        }
      }
    };
    loadProducts();

    // Load Promotion
    const savedPromo = localStorage.getItem('maxios_promo');
    if (savedPromo) {
      const parsed = JSON.parse(savedPromo);
      setActivePromotion(parsed);
      const timeDiff = Date.now() - new Date(parsed.createdAt).getTime();
      if (parsed.active && timeDiff < 10000) setShowPromoSplash(true);
    }

    // Load Codes
    const savedCodes = localStorage.getItem('maxios_promo_codes');
    if (savedCodes) setPromoCodes(JSON.parse(savedCodes));

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleVaporized = () => {
    setLoading(false);
    setTimeout(() => setShowHero(true), 100);
  };

  const isRTL = lang === 'ar' || lang === 'he';
  
  // Mobile-aware logo transforms
  const logoScaleValue = isMobile ? 0.25 : 0.15;
  const logoYTarget = isMobile 
    ? -window.innerHeight / 2 + (activePromotion?.active && !showPromoSplash ? 100 : 40)
    : -window.innerHeight / 2 + (activePromotion?.active && !showPromoSplash ? 120 : 50);
  const logoXTarget = isRTL 
    ? (window.innerWidth / 2 - (isMobile ? 80 : 120)) 
    : (-window.innerWidth / 2 + (isMobile ? 80 : 120));

  const logoScale = useTransform(scrollY, [0, 400], [1, logoScaleValue]);
  const logoY = useTransform(scrollY, [0, 400], [0, logoYTarget]);
  const logoX = useTransform(scrollY, [0, 400], [0, logoXTarget]);
  const homeHeroOpacity = useTransform(scrollY, [100, 300], [1, 0]);

  const handleLogoClick = () => {
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product) => {
    let finalPriceValue = product.price;
    if (activePromotion?.active) {
      if (activePromotion.targets === 'all' || activePromotion.targets.includes(product.id)) {
        finalPriceValue = product.price * (1 - activePromotion.percent / 100);
      }
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { 
        id: product.id, name: product.title[lang], 
        price: `₪${finalPriceValue.toFixed(0)}`, img: product.img, qty: 1 
      }];
    });
  };

  const onUpdatePromo = (promo: Promotion) => {
    setActivePromotion(promo);
    if (promo.active) setShowPromoSplash(true);
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white ${isRTL ? 'font-arabic' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black"
          >
            <VaporizeTextCycle
              texts={["MAXIOS"]}
              font={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: isMobile ? "60px" : "120px", 
                fontWeight: 900, 
                fontStyle: "italic" 
              }}
              color="#ffffff" spread={15} animation={{ vaporizeDuration: 2.5, waitDuration: 1.2 }}
              onVaporized={handleVaporized}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showHero && (
        <>
          <DiscountHeader 
            promotion={activePromotion} splash={showPromoSplash} setSplash={setShowPromoSplash}
            onViewProducts={() => { setShowPromoSplash(false); setActiveView('products'); }}
          />
          <Sidebar
            activeView={activeView} setActiveView={setActiveView} lang={lang} setLang={setLang}
            cartCount={cart.reduce((acc, item) => acc + item.qty, 0)}
            isLoggedIn={!!user} isAdmin={user?.isAdmin} onAuthClick={() => setIsAuthOpen(true)}
            hasActiveDiscount={!!activePromotion?.active && !showPromoSplash}
          />
          
          <motion.div
            onClick={handleLogoClick}
            initial={false}
            animate={{
              scale: activeView === 'home' ? undefined : logoScaleValue,
              y: activeView === 'home' ? undefined : logoYTarget,
              x: activeView === 'home' ? undefined : logoXTarget,
              opacity: 1,
              color: '#ffffff'
            }}
            style={activeView === 'home' ? {
              scale: logoScale, y: logoY, x: logoX,
              position: 'fixed', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 600, cursor: 'pointer'
            } : {
              position: 'fixed', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 600, cursor: 'pointer'
            }}
          >
            <Logo className="text-6xl md:text-9xl lg:text-[14rem] drop-shadow-[0_0_80px_rgba(255,165,0,0.5)] hover:text-orange-500 transition-colors" />
          </motion.div>

          <AnimatePresence mode="wait">
            {activeView === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <div className="relative bg-black">
                  
                  <section className="relative h-screen sticky top-0 overflow-hidden">
                    <AuroraBackground>
                      <motion.div className="w-full h-full" style={{ opacity: homeHeroOpacity }}>
                        <Hero lang={lang} />
                      </motion.div>
                    </AuroraBackground>
                  </section>

                  <div className="relative z-10 bg-gradient-to-b from-black via-orange-950/20 to-black">
                    
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-orange-600/10 blur-[180px] rounded-full opacity-40" />
                    </div>

                    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10 py-32 md:py-64">
                      <motion.div 
                        initial={{ opacity: 0, y: 100 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 1.2, ease: "easeOut" }} 
                        viewport={{ margin: "-100px" }} 
                        className="max-w-5xl text-center space-y-8 md:space-y-16"
                      >
                        <div className="space-y-4">
                          <span className="text-orange-500 font-black tracking-[0.5em] md:tracking-[1em] text-[10px] md:text-xs uppercase">
                            {lang === 'en' ? "THE NEW STANDARD" : lang === 'ar' ? "المعيار الجديد" : "הסטנדרט החדש"}
                          </span>
                          <h2 className="text-[3.5rem] md:text-[7rem] lg:text-[10rem] font-black italic tracking-tighter leading-[0.9] md:leading-[0.85] uppercase text-white">
                            {lang === 'en' ? "ENGINEERED BEYOND DUST." : lang === 'ar' ? "هندسة تتجاوز الغبار." : "הנדסה מעבר לאבק."}
                          </h2>
                        </div>
                      </motion.div>
                    </div>

                    <div className="py-20 md:py-40 px-6 relative z-10">
                      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                          <div className="space-y-4">
                            <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-2"><Box size={14}/> {lang === 'en' ? 'PRODUCT PREVIEW' : 'لمحة عن المنتجات'}</span>
                            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">{lang === 'en' ? 'ENGINEERING MARVELS.' : 'عجائب هندسية.'}</h2>
                          </div>
                          <button onClick={() => setActiveView('products')} className="w-full md:w-auto px-10 py-5 bg-orange-600 text-white font-black uppercase tracking-tighter text-xs flex items-center justify-center gap-4 hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(234,88,12,0.3)]">
                            {lang === 'en' ? 'ALL UNITS' : 'جميع الوحدات'} <ArrowRight size={16}/>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                          {products.slice(0, 3).map(p => (
                            <div key={p.id} className="group relative aspect-[4/5] border border-orange-500/10 overflow-hidden cursor-pointer shadow-2xl transition-all duration-500 bg-zinc-900/40 hover:bg-zinc-900/60" onClick={() => setActiveView('products')}>
                              <img src={p.img} className="w-full h-full object-cover opacity-20 grayscale group-hover:opacity-80 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000 scale-125 group-hover:scale-105" />
                              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-black/40 to-transparent">
                                <p className="text-orange-500 font-black text-[10px] mb-2 tracking-widest">{p.series[lang]}</p>
                                <h4 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{p.title[lang]}</h4>
                                <div className="mt-4 h-1 w-0 group-hover:w-full bg-orange-500 transition-all duration-700" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="py-20 md:py-40 px-6 relative z-10">
                      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
                        <div className="space-y-6 md:space-y-8">
                          <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-2"><LifeBuoy size={14}/> {lang === 'en' ? 'ECOSYSTEM ACCESS' : 'الوصول إلى النظام'}</span>
                          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{lang === 'en' ? 'ZERO DOWNTIME SUPPORT.' : 'دعم بدون توقف.'}</h2>
                          <p className="text-sm md:text-lg opacity-40 uppercase tracking-widest leading-loose">{lang === 'en' ? 'Instant diagnostics and hardware intervention protocols available 24/7.' : 'بروتوكولات التشخيص والتدخل متاحة على مدار الساعة.'}</p>
                          <button onClick={() => setActiveView('support')} className="w-full md:w-auto px-10 py-5 border-2 border-orange-500 text-orange-500 font-black uppercase text-xs hover:bg-orange-500 hover:text-white transition-all">
                            {lang === 'en' ? 'OPEN TICKET' : 'فتح تذكرة'}
                          </button>
                        </div>
                        <div className="bg-orange-600 p-8 md:p-12 space-y-6 md:space-y-8 text-black shadow-[0_0_120px_rgba(234,88,12,0.3)] relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 opacity-10 -rotate-12 translate-x-8 -translate-y-8">
                             <Cpu size={128} />
                           </div>
                           <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter relative z-10">AI NEURAL NODE</h4>
                           <p className="font-bold opacity-80 uppercase text-xs md:text-sm tracking-widest relative z-10">Connect to the first-response AI node for instant suction recalibration and error code resolution.</p>
                           <button onClick={() => { (document.querySelector('#support-chat button') as any)?.click(); }} className="w-full py-5 bg-black text-white font-black uppercase text-[10px] hover:bg-zinc-800 transition-all relative z-10">ENGAGE PROTOCOL</button>
                        </div>
                      </div>
                    </div>

                    <div className="py-20 md:py-40 px-6 relative z-10">
                      <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
                        <div className="space-y-4">
                          <span className="text-orange-500 font-black tracking-widest text-[10px] uppercase flex items-center gap-2 justify-center"><Mail size={14}/> {lang === 'en' ? 'QUICK PROTOCOL' : 'بروتوكول سريع'}</span>
                          <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase">{lang === 'en' ? 'DROP A LINE.' : 'تواصل معنا.'}</h2>
                          <p className="text-[10px] md:text-sm opacity-40 tracking-[0.2em] md:tracking-[0.3em] uppercase text-white">Initialize direct connection to headquarters.</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 p-2 bg-orange-500/5 border border-orange-500/10">
                          <input placeholder="EMAIL ADDRESS" className="flex-1 bg-transparent p-5 text-[10px] font-black uppercase outline-none focus:bg-orange-500/10 transition-colors" />
                          <button onClick={() => setActiveView('contact')} className="w-full md:w-auto px-12 py-5 bg-orange-600 text-white font-black uppercase text-xs hover:bg-black transition-all shadow-xl">INITIALIZE</button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'products' && (
              <motion.div key="products" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32">
                <ProductSection lang={lang} onAddToCart={addToCart} onGoToCart={() => setActiveView('cart')} activePromo={activePromotion} products={products} />
              </motion.div>
            )}

            {activeView === 'cart' && (
              <motion.div key="cart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32">
                <CartOverlay lang={lang} cart={cart} setCart={setCart} promoCodes={promoCodes} onCheckout={() => alert("Order processed.")} />
              </motion.div>
            )}

            {activeView === 'account' && user && !user.isAdmin && (
              <motion.div key="account" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32">
                <AccountSection lang={lang} user={user} setUser={setUser} onLogout={handleLogout} />
              </motion.div>
            )}

            {activeView === 'admin' && user?.isAdmin && (
              <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32">
                <AdminConsole lang={lang} onLogout={handleLogout} onUpdatePromo={onUpdatePromo} promoCodes={promoCodes} setPromoCodes={setPromoCodes} products={products} setProducts={updateProducts} />
              </motion.div>
            )}

            {activeView === 'support' && <motion.div className="pt-32"><SupportSection lang={lang} /></motion.div>}
            {activeView === 'contact' && <motion.div className="pt-32"><ContactSection lang={lang} /></motion.div>}
          </AnimatePresence>
          
          <AuthOverlay 
            isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} lang={lang} 
            onSuccess={(data) => { setUser(data); setIsAuthOpen(false); setActiveView(data.isAdmin ? 'admin' : 'account'); }} 
          />

          <SupportChat lang={lang} setActiveView={setActiveView} isAdmin={user?.isAdmin} />
        </>
      )}
    </div>
  );
}
