import React from 'react';
import { Instagram, Linkedin, ArrowUp, Lock, Facebook } from 'lucide-react';
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
              <a href="https://www.instagram.com/maxios.co.il" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/maxios.co.il" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://wa.me/972529932765" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-green-500 hover:border-green-500 transition-all" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@maxios.co.il" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16v-3.45a4.85 4.85 0 01-2.83-.97z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/obaida-laptop-4a71353a9" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-orange-500 hover:border-orange-500 transition-all" aria-label="LinkedIn">
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
                <button onClick={() => { onNavigate('home'); scrollToTop(); }} className="text-white/50 hover:text-orange-500 transition-colors text-sm">
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
        {/* Business Info — Israeli law requires displaying business details */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center">
          <p className="text-white/20 text-[10px] leading-relaxed">
            {lang === 'en' ? 'Maxios — All prices include VAT. Free shipping on all orders. 14-day return policy.' : lang === 'he' ? 'Maxios — כל המחירים כוללים מע״מ. משלוח חינם בכל הזמנה. מדיניות החזרה תוך 14 יום.' : 'Maxios — جميع الأسعار شاملة ضريبة القيمة المضافة. شحن مجاني لجميع الطلبات. سياسة إرجاع 14 يومًا.'}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
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
