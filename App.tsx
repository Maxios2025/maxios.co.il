
import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { AuthOverlay } from './components/AuthOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WhatsAppButton } from './components/WhatsAppButton';
import { CartOverlay } from './components/CartOverlay';
import { fetchProducts, fetchPromoCodes } from './lib/firebase';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'));

export type Language = 'he' | 'en' | 'ar';
export type ViewState = 'home' | 'contact' | 'support' | 'account' | 'admin' | 'privacy' | 'about' | 'terms' | 'warranty';

export interface Product {
  id: string;
  title: { [key in Language]: string };
  series: { [key in Language]: string };
  desc: { [key in Language]: string };
  price: number;
  img: string;
  images?: string[];
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

// Loading component for Suspense fallback
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm tracking-widest">...טוען</p>
      </div>
    </div>
  );
}

// Main App Content with Router
function AppContent() {
  const [lang, setLang] = useState<Language>('he');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const savedScrollRef = useRef(0);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // Clean up old cart data from localStorage (cart removed — single product flow)
    localStorage.removeItem('maxios_cart');

    // Debounced resize handler to avoid layout thrashing
    let resizeTimer: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    window.addEventListener('resize', checkMobile, { passive: true });

    // Load Products - Show instantly, sync Firebase in background
    const loadProducts = async () => {
      const localProducts = localStorage.getItem('maxios_products');
      const localData: Product[] = localProducts ? JSON.parse(localProducts) : [];
      setProducts(localData);

      const dbProducts = await fetchProducts();
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
        localStorage.setItem('maxios_products', JSON.stringify(dbProducts));
      }
    };
    loadProducts();

    // Load Promo Codes from Firebase
    const loadPromoCodes = async () => {
      const localCodes = localStorage.getItem('maxios_promo_codes');
      if (localCodes) setPromoCodes(JSON.parse(localCodes));

      const dbCodes = await fetchPromoCodes();
      if (dbCodes && dbCodes.length > 0) {
        setPromoCodes(dbCodes);
        localStorage.setItem('maxios_promo_codes', JSON.stringify(dbCodes));
      }
    };
    loadPromoCodes();

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(resizeTimer);
    };
  }, []);

  const isRTL = lang === 'ar' || lang === 'he';

  // Cache dimension values to avoid reading from DOM on every render
  const dimensionsRef = useRef({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    dimensionsRef.current = { w: window.innerWidth, h: window.innerHeight };
  }, [isMobile]);

  const logoScaleValue = isMobile ? 0.25 : 0.15;
  const logoYTarget = isMobile
    ? -dimensionsRef.current.h / 2 + 40
    : -dimensionsRef.current.h / 2 + 50;
  const logoXTarget = -dimensionsRef.current.w / 2 + (isMobile ? 80 : 120);

  const logoScale = useTransform(scrollY, [0, 400], [1, logoScaleValue]);
  const logoY = useTransform(scrollY, [0, 400], [0, logoYTarget]);
  const logoX = useTransform(scrollY, [0, 400], [0, logoXTarget]);

  // Open checkout: save scroll position & lock body
  const openCheckout = useCallback(() => {
    savedScrollRef.current = window.scrollY;
    document.body.style.overflow = 'hidden';
    setIsCheckoutOpen(true);
  }, []);

  // Close checkout: navigate home past the logo intro
  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    document.body.style.overflow = '';
    navigate('/');
    requestAnimationFrame(() => {
      window.scrollTo(0, 400);
    });
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const updateProducts = useCallback((newProducts: Product[]) => {
    setProducts(newProducts);
  }, []);

  const getActiveView = () => {
    const path = location.pathname.replace('/', '') || 'home';
    return path as any;
  };

  const handleViewChange = useCallback((view: string) => {
    if (view === 'home') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
  }, [navigate]);

  return (
    <div
      className={`min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white ${isRTL ? 'font-arabic' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Skip to content — accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:font-bold">
        {lang === 'en' ? 'Skip to content' : lang === 'he' ? 'דלג לתוכן' : 'تخطي إلى المحتوى'}
      </a>

      <Sidebar
        activeView={getActiveView()}
        setActiveView={handleViewChange}
        lang={lang}
        setLang={setLang}
        isAdmin={user?.isAdmin}
        onOpenChange={setSidebarOpen}
      />

      <motion.div
          onClick={handleLogoClick}
          style={{
            scale: isHomePage ? logoScale : logoScaleValue,
            y: isHomePage ? logoY : logoYTarget,
            x: isHomePage ? logoX : logoXTarget,
            position: 'fixed', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 600, cursor: 'pointer'
          }}
        >
          <Logo className="text-6xl md:text-9xl lg:text-[14rem] drop-shadow-[0_0_80px_rgba(255,165,0,0.5)] hover:text-orange-500 transition-colors" isRTL={isRTL} />
        </motion.div>

      <main id="main-content">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={
            <HomePage
              lang={lang}
              isRTL={isRTL}
              onOpenCheckout={openCheckout}
              onAdminLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
            />
          } />
          <Route path="/contact" element={<ContactPage lang={lang} />} />
          <Route path="/support" element={<SupportPage lang={lang} />} />
          <Route path="/account" element={
            <AccountPage lang={lang} user={user} setUser={setUser} />
          } />
          <Route path="/admin" element={
            <AdminPage
              lang={lang}
              user={user}
              promoCodes={promoCodes}
              setPromoCodes={setPromoCodes}
              products={products}
              setProducts={updateProducts}
              setUser={setUser}
            />
          } />
          <Route path="/privacy" element={<PrivacyPage lang={lang} />} />
          <Route path="/about" element={<AboutPage lang={lang} />} />
          <Route path="/terms" element={<TermsPage lang={lang} />} />
          <Route path="/warranty" element={<WarrantyPage lang={lang} />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center px-6">
              <div className="text-center space-y-6">
                <h1 className="text-6xl md:text-8xl font-black text-orange-500">404</h1>
                <p className="text-white/50 text-lg">{lang === 'en' ? 'Page not found' : lang === 'he' ? 'הדף לא נמצא' : 'الصفحة غير موجودة'}</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-orange-600 text-white font-bold uppercase text-sm hover:bg-orange-500 transition-colors">
                  {lang === 'en' ? 'Go Home' : lang === 'he' ? 'חזרה לדף הבית' : 'العودة للرئيسية'}
                </button>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
      </main>

      <AuthOverlay
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        lang={lang}
        initialMode={authMode}
        onSuccess={(data) => {
          setUser(data);
          setIsAuthOpen(false);
          navigate(data.isAdmin ? '/admin' : '/account');
        }}
      />

      {/* Checkout Overlay — opens when user clicks "Order Now" */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[700] bg-black overflow-y-auto" style={{ background: 'linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)' }}>
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/5 rounded-full blur-[150px]" />
          </div>
          <button
            onClick={closeCheckout}
            className="fixed top-24 left-6 md:left-12 z-50 flex items-center gap-3 text-white/40 hover:text-orange-500 transition-colors group"
          >
            <span className="w-10 h-10 border border-white/10 group-hover:border-orange-500/50 flex items-center justify-center transition-colors">←</span>
            <span className="text-xs font-black tracking-widest uppercase hidden md:block">
              {lang === 'en' ? 'BACK' : lang === 'he' ? 'חזור' : 'رجوع'}
            </span>
          </button>
          <div className="relative pt-32 pb-20 min-h-screen">
            <CartOverlay
              lang={lang}
              promoCodes={promoCodes}
              onCheckout={closeCheckout}
            />
          </div>
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-black">MAXIOS SECURE CHECKOUT</p>
          </div>
        </div>
      )}

      <WhatsAppButton lang={lang} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
