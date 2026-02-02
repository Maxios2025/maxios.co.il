import React from 'react';
import { Instagram, Linkedin, ArrowUp, Lock } from 'lucide-react';
import { Language } from '../App';
import { Logo } from './Logo';

interface FooterProps {
  lang: Language;
  onNavigate: (view: 'home' | 'products' | 'support' | 'contact' | 'privacy' | 'about' | 'terms' | 'warranty') => void;
  onAdminLogin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onNavigate, onAdminLogin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = {
    en: {
      description: "MAXIOS delivers cutting-edge vacuum technology engineered for perfection. Premium performance, zero compromise.",
      navigation: "Navigation",
      company: "Company",
      home: "Home",
      products: "Products",
      support: "Support",
      contact: "Contact",
      about: "About Us",
      warranty: "Warranty",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      rights: "All rights reserved.",
      backToTop: "Back to Top"
    },
    he: {
      description: "MAXIOS מספקת טכנולוגיית שאיבה מתקדמת המהונדסת לשלמות. ביצועים פרימיום, ללא פשרות.",
      navigation: "ניווט",
      company: "החברה",
      home: "בית",
      products: "מוצרים",
      support: "תמיכה",
      contact: "צור קשר",
      about: "אודותינו",
      warranty: "אחריות",
      privacy: "מדיניות פרטיות",
      terms: "תנאי שימוש",
      rights: "כל הזכויות שמורות.",
      backToTop: "חזרה למעלה"
    },
    ar: {
      description: "MAXIOS تقدم تقنية شفط متطورة مصممة للكمال. أداء متميز، بدون تنازلات.",
      navigation: "التنقل",
      company: "الشركة",
      home: "الرئيسية",
      products: "المنتجات",
      support: "الدعم",
      contact: "اتصل بنا",
      about: "من نحن",
      warranty: "الضمان",
      privacy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      rights: "جميع الحقوق محفوظة.",
      backToTop: "العودة للأعلى"
    }
  };

  const t = content[lang];

  return (
    <footer className="bg-black border-t border-white/10 relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-6">
            <Logo className="text-3xl" />
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              {t.description}
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/maxios.co.il" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://www.linkedin.com/in/obaida-laptop-4a71353a9" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t.navigation}</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => { onNavigate('home'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.home}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('products'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.products}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('support'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.support}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('contact'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-6">
            <h3 className="text-white font-bold text-sm uppercase tracking-widest">{t.company}</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => { onNavigate('about'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.about}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('warranty'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.warranty}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('privacy'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.privacy}
                </button>
              </li>
              <li>
                <button onClick={() => { onNavigate('terms'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
                  {t.terms}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-white/30 text-xs uppercase tracking-widest">
              © {new Date().getFullYear()} Maxios. {t.rights}
            </p>
            {onAdminLogin && (
              <button
                onClick={onAdminLogin}
                className="text-white/10 hover:text-orange-500 transition-colors p-1"
                title="Admin"
              >
                <Lock size={12} />
              </button>
            )}
          </div>
          <button
            onClick={scrollToTop}
            className="text-white/30 hover:text-orange-500 text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
          >
            {t.backToTop} <ArrowUp size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
};
