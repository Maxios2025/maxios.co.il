
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Logo } from './components/Logo';
import { Sidebar } from './components/Sidebar';
import { AuthOverlay } from './components/AuthOverlay';
import { fetchProducts } from './lib/firebase';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const WarrantyPage = lazy(() => import('./pages/WarrantyPage'));

export type Language = 'he' | 'en' | 'ar';

export interface Product {
  id: string;
  title: { [key in Language]: string };
  series: { [key in Language]: string };
  desc: { [key in Language]: string };
  price: number;
  img: string;
  images?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: string;
  img: string;
  qty: number;
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
        <p className="text-white/40 text-sm tracking-widest uppercase">Loading...</p>
      </div>
    </div>
  );
}

// Main App Content with Router
function AppContent() {
  const [lang, setLang] = useState<Language>('he');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();

  // Determine if we're on home page for logo animation
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // Update HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' || lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

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

    // Load Codes
    const savedCodes = localStorage.getItem('maxios_promo_codes');
    if (savedCodes) setPromoCodes(JSON.parse(savedCodes));

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isRTL = lang === 'ar' || lang === 'he';

  // Mobile-aware logo transforms
  const logoScaleValue = isMobile ? 0.25 : 0.15;
  const logoYTarget = isMobile
    ? -window.innerHeight / 2 + 40
    : -window.innerHeight / 2 + 50;
  const logoXTarget = -window.innerWidth / 2 + (isMobile ? 80 : 120);

  const logoScale = useTransform(scrollY, [0, 400], [1, logoScaleValue]);
  const logoY = useTransform(scrollY, [0, 400], [0, logoYTarget]);
  const logoX = useTransform(scrollY, [0, 400], [0, logoXTarget]);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
  };

  // Convert route to view for sidebar
  const getActiveView = () => {
    const path = location.pathname.replace('/', '') || 'home';
    return path as any;
  };

  // Handle navigation from sidebar
  const handleViewChange = (view: string) => {
    if (view === 'home') {
      navigate('/');
    } else {
      navigate(`/${view}`);
    }
  };

  return (
    <div
      className={`min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white ${isRTL ? 'font-arabic' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar
        activeView={getActiveView()}
        setActiveView={handleViewChange}
        lang={lang}
        setLang={setLang}
        cartCount={cart.reduce((acc, item) => acc + item.qty, 0)}
        isAdmin={user?.isAdmin}
        onOpenChange={setSidebarOpen}
      />

      <motion.div
        onClick={handleLogoClick}
        initial={false}
        animate={{
          scale: isHomePage ? undefined : logoScaleValue,
          y: isHomePage ? undefined : logoYTarget,
          x: isHomePage ? undefined : logoXTarget,
          opacity: 1,
          color: '#ffffff'
        }}
        style={isHomePage ? {
          scale: logoScale, y: logoY, x: logoX,
          position: 'fixed', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 600, cursor: 'pointer'
        } : {
          position: 'fixed', top: '50%', left: '50%', translateX: '-50%', translateY: '-50%', zIndex: 600, cursor: 'pointer'
        }}
      >
        <Logo className="text-6xl md:text-9xl lg:text-[14rem] drop-shadow-[0_0_80px_rgba(255,165,0,0.5)] hover:text-orange-500 transition-colors" isRTL={isRTL} />
      </motion.div>

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={
            <HomePage
              lang={lang}
              isRTL={isRTL}
              setCart={setCart}
              onAdminLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
            />
          } />
          <Route path="/cart" element={
            <CartPage
              lang={lang}
              cart={cart}
              setCart={setCart}
              promoCodes={promoCodes}
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
        </Routes>
      </Suspense>

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
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
