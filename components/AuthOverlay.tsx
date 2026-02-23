
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Eye, EyeOff, PartyPopper, Sparkles } from 'lucide-react';
import { Language } from '../App';
import { firebaseSignIn, firebaseSignUp, saveUserProfile, getUserProfile } from '../lib/firebase';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (user: any) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ isOpen, onClose, lang, onSuccess, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Sync mode with initialMode when dialog opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    zip: '',
    street: '',
    password: ''
  });

  const t = {
    en: {
      login: "LOGIN PROTOCOL", signup: "INITIALIZE ACCOUNT",
      switchSignup: "NEED ACCESS? REQUEST ACCOUNT", switchLogin: "ALREADY RECOGNIZED? IDENTIFY",
      submit: "EXECUTE", name: "FULL NAME", email: "USER NAME", phone: "PHONE (05XXXXXXXX)",
      password: "PASSWORD", city: "CITY", zip: "ZIP CODE", street: "STREET",
      processing: "PROCESSING...",
      errPass: "Password must be 8+ chars, with uppercase, lowercase, and numbers (English only).",
      errPhone: "Invalid Israel Phone. Must start with 05 and be 10 digits.",
      errEmail: "Invalid Email format (@ required).",
      errZip: "Invalid Israel Zip Code (5 or 7 digits).",
      welcomeTitle: "WELCOME TO MAXIOS",
      welcomeSubtitle: "ACCOUNT ACTIVATED",
      welcomeMessage: "Congratulations! You are now part of the MAXIOS elite. Your account has been successfully created and your data is securely stored.",
      welcomeButton: "ENTER YOUR ACCOUNT"
    },
    ar: {
      login: "تسجيل الدخول", signup: "إنشاء حساب", switchSignup: "حساب جديد", switchLogin: "لديك حساب؟",
      submit: "تنفيذ", name: "الاسم الكامل", email: "اسم المستخدم", phone: "الهاتف (05XXXXXXXX)",
      password: "كلمة المرور", city: "المدينة", zip: "الرمز البريدي", street: "الشارع",
      processing: "...جاري المعالجة",
      errPass: "كلمة المرور: 8+ أحرف مع أحرف كبيرة وصغيرة وأرقام.", errPhone: "رقم هاتف غير صالح.",
      errEmail: "بريد إلكتروني غير صالح.", errZip: "رمز بريدي غير صالح.",
      welcomeTitle: "مرحباً بك في MAXIOS", welcomeSubtitle: "تم تفعيل الحساب",
      welcomeMessage: "تهانينا! أنت الآن جزء من نخبة MAXIOS. تم إنشاء حسابك بنجاح وتخزين بياناتك بشكل آمن.",
      welcomeButton: "ادخل إلى حسابك"
    },
    he: {
      login: "פרוטוקול התחברות", signup: "אתחול חשבון", switchSignup: "בקש גישה", switchLogin: "הזדהה",
      submit: "בצע", name: "שם מלא", email: "שם משתמש", phone: "טלפון (05XXXXXXXX)",
      password: "סיסמה", city: "עיר", zip: "מיקוד", street: "רחוב",
      processing: "...מעבד",
      errPass: "סיסמה: 8+ תווים, אותיות גדולות וקטנות ומספרים.", errPhone: "מספר טלפון לא תקין.",
      errEmail: "אימייל לא תקין.", errZip: "מיקוד לא תקין.",
      welcomeTitle: "ברוכים הבאים ל-MAXIOS", welcomeSubtitle: "החשבון הופעל",
      welcomeMessage: "מזל טוב! אתה עכשיו חלק מהאליטה של MAXIOS. החשבון שלך נוצר בהצלחה והנתונים שלך נשמרו בצורה מאובטחת.",
      welcomeButton: "כנס לחשבון שלך"
    }
  }[lang] || {
    login: "LOGIN PROTOCOL", signup: "INITIALIZE ACCOUNT", switchSignup: "NEED ACCESS? REQUEST ACCOUNT",
    switchLogin: "ALREADY RECOGNIZED? IDENTIFY", submit: "EXECUTE", name: "FULL NAME", email: "USER NAME",
    phone: "PHONE (05XXXXXXXX)", password: "PASSWORD", city: "CITY", zip: "ZIP CODE", street: "STREET",
    processing: "PROCESSING...",
    errPass: "Password must be 8+ chars", errPhone: "Invalid Phone", errEmail: "Invalid Email", errZip: "Invalid Zip",
    welcomeTitle: "WELCOME TO MAXIOS", welcomeSubtitle: "ACCOUNT ACTIVATED",
    welcomeMessage: "Congratulations! Your account has been successfully created.", welcomeButton: "ENTER YOUR ACCOUNT"
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'signup') {
      // Password complexity only enforced on signup — login lets Firebase handle validation
      const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passRegex.test(formData.password)) {
        newErrors.password = (t as any).errPass || "Invalid Password Complexity";
      }

      // Israel Phone: 05, 10 digits
      const phoneRegex = /^05\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = (t as any).errPhone || "Invalid Phone Number";
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = (t as any).errEmail || "Invalid Email";
      }

      // Zip
      const zipRegex = /^\d{5}$|^\d{7}$/;
      if (!zipRegex.test(formData.zip)) {
        newErrors.zip = (t as any).errZip || "Invalid Zip";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Check admin login via server-side API (credentials stay on server)
    try {
      const adminRes = await fetch('/api/check-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        if (adminData.isAdmin) {
          onSuccess({
            name: adminData.name, email: adminData.email, phone: '000', isAdmin: true,
            address: { city: 'HQ', zip: '00000', street: 'Kfar Kanna' }
          });
          return;
        }
      }
    } catch {
      // API not available (local dev) — dev-only fallback, stripped from production builds
      if (import.meta.env.DEV) {
        if (formData.email === 'service@maxios.co.il' && formData.password === 'maxios1900') {
          onSuccess({
            name: 'ADMIN COMMANDER', email: 'service@maxios.co.il', phone: '000', isAdmin: true,
            address: { city: 'HQ', zip: '00000', street: 'Kfar Kanna' }
          });
          return;
        }
      }
    }

    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Create account directly with Firebase
        const { user, error: signupError } = await firebaseSignUp(formData.email, formData.password);

        if (signupError) throw signupError;

        if (user) {
          // Save user profile
          try {
            await saveUserProfile(user.uid, {
              email: formData.email,
              name: formData.name,
              phone: formData.phone,
              city: formData.city,
              zip: formData.zip,
              street: formData.street,
            });
          } catch (profileError) {
            console.error('Profile save error (continuing anyway):', profileError);
          }

          // Store user data and show welcome screen
          setNewUserData({
            id: user.uid,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            isAdmin: false,
            address: { city: formData.city, zip: formData.zip, street: formData.street }
          });
          setShowWelcome(true);
          setLoading(false);
        }
      } else {
        // Login with Firebase
        const { user, error: authError } = await firebaseSignIn(formData.email, formData.password);

        if (authError) throw authError;

        // Fetch user profile
        if (user) {
          const { data: profile, error: profileError } = await getUserProfile(user.uid);

          if (profileError) throw profileError;

          onSuccess({
            id: user.uid,
            name: profile?.name || '',
            email: profile?.email || formData.email,
            phone: profile?.phone || '',
            isAdmin: false,
            address: { city: profile?.city || '', zip: profile?.zip || '', street: profile?.street || '' }
          });
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeContinue = () => {
    if (newUserData) {
      onSuccess(newUserData);
    }
  };

  const isRTL = lang === 'he' || lang === 'ar';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-zinc-950 border border-white/5 w-full max-w-2xl p-10 md:p-16 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <button onClick={onClose} className={`absolute top-8 ${isRTL ? 'left-8' : 'right-8'} text-white/20 hover:text-white`}><X size={32} /></button>

            {/* Welcome Screen - After Successful Signup */}
            {showWelcome ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 text-center py-8"
              >
                {/* Celebration Icon */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center"
                  >
                    <PartyPopper size={64} className="text-white" />
                  </motion.div>
                </div>

                {/* Welcome Text */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-orange-500 text-xs font-black tracking-[0.3em] uppercase mb-2">
                      <Sparkles className="inline-block mr-2" size={14} />
                      {(t as any).welcomeSubtitle}
                      <Sparkles className="inline-block ml-2" size={14} />
                    </p>
                    <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">
                      {(t as any).welcomeTitle}
                    </h3>
                  </motion.div>
                </div>

                {/* User Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/5 border border-orange-500/20 p-8 space-y-4"
                >
                  <p className="text-white/60 text-sm leading-relaxed">
                    {(t as any).welcomeMessage}
                  </p>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    <p className="text-white font-black text-lg uppercase">{newUserData?.name}</p>
                    <p className="text-orange-500 text-sm font-bold">{newUserData?.email}</p>
                  </div>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={handleWelcomeContinue}
                  className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 transition-all"
                >
                  {(t as any).welcomeButton} <ArrowRight size={20} />
                </motion.button>
              </motion.div>
            ) : (
              // Original Login/Signup Form
              <div className="space-y-12">
                <div className="space-y-6">
                  <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">{mode === 'login' ? t.login : t.signup}</h3>
                </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                {mode === 'signup' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{t.name}</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs outline-none focus:border-orange-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{(t as any).phone}</label>
                      <input required type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} dir="ltr" className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} p-4 ${isRTL ? 'text-right' : ''} text-white text-xs outline-none focus:border-orange-500`} />
                      {errors.phone && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.phone}</p>}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{t.email}</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} dir="ltr" className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} p-4 ${isRTL ? 'text-right' : ''} text-white text-xs outline-none focus:border-orange-500`} />
                    {errors.email && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{t.password}</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} dir="ltr" className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} p-4 ${isRTL ? 'pr-12 text-right' : 'pr-12'} text-white text-xs outline-none focus:border-orange-500`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500`}>
                        {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.password}</p>}
                  </div>
                </div>
                {authError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20">
                    <p className="text-red-500 text-xs font-bold uppercase">{authError}</p>
                  </div>
                )}
                {mode === 'signup' && (
                  <div className="space-y-8 p-6 bg-white/5 border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <input required placeholder={(t as any).city} type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs" />
                      <input required placeholder={(t as any).zip} type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} dir="ltr" className={`w-full bg-white/5 border ${errors.zip ? 'border-red-500' : 'border-white/10'} p-4 ${isRTL ? 'text-right' : ''} text-white text-xs`} />
                    </div>
                    <input required placeholder={(t as any).street} type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs" />
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (t as any).processing : t.submit} <ArrowRight size={20} />
                </button>
              </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
