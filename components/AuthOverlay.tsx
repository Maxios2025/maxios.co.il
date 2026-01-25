
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, AlertTriangle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Language } from '../App';
import { firebaseSignIn, firebaseSignUp, saveUserProfile, getUserProfile, storeVerificationCode, verifyCode } from '../lib/firebase';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSuccess: (user: any) => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ isOpen, onClose, lang, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [pendingUserData, setPendingUserData] = useState<any>(null);

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
      submit: "EXECUTE", name: "FULL NAME", email: "EMAIL ADDRESS", phone: "PHONE (05XXXXXXXX)",
      password: "PASSWORD",
      errPass: "Password must be 8+ chars, with uppercase, lowercase, and numbers (English only).",
      errPhone: "Invalid Israel Phone. Must start with 05 and be 10 digits.",
      errEmail: "Invalid Email format (@ required).",
      errZip: "Invalid Israel Zip Code (5 or 7 digits).",
      otpTitle: "VERIFICATION REQUIRED",
      otpDesc: "Enter the 6-digit code sent to your email",
      otpPlaceholder: "000000",
      otpSubmit: "VERIFY CODE",
      otpResend: "RESEND CODE",
      otpInvalid: "Invalid or expired code. Please try again."
    }
  }[lang] || {
    ar: { login: "بروتوكول الدخول", signup: "بدء حساب", switchSignup: "طلب حساب", switchLogin: "تعرف على الهوية", submit: "تنفيذ", password: "كلمة المرور", otpTitle: "التحقق مطلوب", otpDesc: "أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك الإلكتروني", otpPlaceholder: "000000", otpSubmit: "تحقق من الرمز", otpResend: "إعادة إرسال الرمز", otpInvalid: "رمز غير صالح أو منتهي الصلاحية" },
    he: { login: "פרוטוקול התחברות", signup: "אתחול חשבון", switchSignup: "בקש גישה", switchLogin: "הזדהה", submit: "בצע", password: "סיסמה", otpTitle: "נדרש אימות", otpDesc: "הזן את קוד בן 6 ספרות שנשלח לאימייל שלך", otpPlaceholder: "000000", otpSubmit: "אמת קוד", otpResend: "שלח קוד מחדש", otpInvalid: "קוד לא חוקי או פג תוקף" }
  }[lang];

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Store OTP in Firebase
  const storeOTP = async (email: string, code: string) => {
    const { error } = await storeVerificationCode(email, code);
    if (error) {
      console.error('Error storing OTP:', error);
      throw error;
    }
  };

  // Verify OTP
  const verifyOTP = async (email: string, code: string) => {
    const { valid } = await verifyCode(email, code);
    return valid;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    // Password: 8 chars, uppercase, lowercase, number, English only
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passRegex.test(formData.password)) {
      newErrors.password = (t as any).errPass || "Invalid Password Complexity";
    }

    if (mode === 'signup') {
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

    // ADMIN OVERRIDE
    if (formData.email === 'maxios1234' && formData.password === 'maxios1900') {
      onSuccess({
        name: 'ADMIN COMMANDER', email: 'admin@maxios.co.il', phone: '000', isAdmin: true,
        address: { city: 'HQ', zip: '00000', street: 'Kfar Kanna' }
      });
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        // Generate and store OTP
        const otpCode = generateOTP();
        await storeOTP(formData.email, otpCode);

        // Send OTP via email API
        try {
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              code: otpCode
            })
          });

          if (!response.ok) {
            console.error('Failed to send OTP email');
            // Fallback to alert for testing
            alert(`Email service unavailable. Your OTP is: ${otpCode}`);
          }
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Fallback to alert for testing
          alert(`Email service unavailable. Your OTP is: ${otpCode}`);
        }

        // Store pending user data
        setPendingUserData({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
          zip: formData.zip,
          street: formData.street,
        });

        // Show OTP input screen
        setShowOtpInput(true);
        setLoading(false);
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

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);

    try {
      // Verify OTP
      const isValid = await verifyOTP(pendingUserData.email, otp);

      if (!isValid) {
        setOtpError((t as any).otpInvalid || 'Invalid or expired code');
        setLoading(false);
        return;
      }

      // OTP verified - now create the actual account with Firebase
      const { user, error: authError } = await firebaseSignUp(pendingUserData.email, pendingUserData.password);

      if (authError) throw authError;

      // Store additional user data
      if (user) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const { error: profileError } = await saveUserProfile(user.uid, {
          email: pendingUserData.email,
          name: pendingUserData.name,
          phone: pendingUserData.phone,
          city: pendingUserData.city,
          zip: pendingUserData.zip,
          street: pendingUserData.street,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }

        onSuccess({
          id: user.uid,
          name: pendingUserData.name,
          email: pendingUserData.email,
          phone: pendingUserData.phone,
          isAdmin: false,
          address: { city: pendingUserData.city, zip: pendingUserData.zip, street: pendingUserData.street }
        });
      }
    } catch (error: any) {
      setOtpError(error.message || 'Verification failed');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const otpCode = generateOTP();
      await storeOTP(pendingUserData.email, otpCode);

      // Send OTP via email API
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: pendingUserData.email,
            code: otpCode
          })
        });

        if (!response.ok) {
          console.error('Failed to send OTP email');
          alert(`Email service unavailable. Your OTP is: ${otpCode}`);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        alert(`Email service unavailable. Your OTP is: ${otpCode}`);
      }

      setOtpError('');
      setOtp('');
    } catch (error: any) {
      setOtpError(error.message || 'Failed to resend code');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-zinc-950 border border-white/5 w-full max-w-2xl p-10 md:p-16 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={32} /></button>

            {/* OTP Verification Screen */}
            {showOtpInput ? (
              <div className="space-y-12">
                <div className="space-y-4 text-center">
                  <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">{(t as any).otpTitle}</h3>
                  <p className="text-white/40 text-sm uppercase tracking-widest">{(t as any).otpDesc}</p>
                  <p className="text-orange-500 text-xs font-black">{pendingUserData?.email}</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder={(t as any).otpPlaceholder}
                      maxLength={6}
                      className="w-full bg-white/5 border border-white/10 p-6 text-white text-3xl text-center font-black tracking-[0.5em] outline-none focus:border-orange-500"
                      autoFocus
                    />
                    {otpError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20">
                        <p className="text-red-500 text-xs font-bold uppercase text-center">{otpError}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6}
                      className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'VERIFYING...' : (t as any).otpSubmit} <ArrowRight size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="w-full py-4 border border-white/10 text-white/60 hover:text-white hover:border-orange-500 font-black uppercase tracking-tighter text-sm transition-all"
                    >
                      {(t as any).otpResend}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowOtpInput(false); setOtp(''); setOtpError(''); }}
                      className="w-full py-2 text-white/40 hover:text-white text-xs uppercase tracking-widest"
                    >
                      ← BACK TO SIGNUP
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Original Login/Signup Form
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">{mode === 'login' ? t.login : t.signup}</h3>
                  <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }} className="text-orange-500 font-black tracking-widest text-[10px] uppercase">{mode === 'login' ? t.switchSignup : t.switchLogin}</button>
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
                      <input required type="tel" maxLength={10} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={`w-full bg-white/5 border ${errors.phone ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} />
                      {errors.phone && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.phone}</p>}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{t.email}</label>
                    <input required type="text" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} />
                    {errors.email && <p className="text-red-500 text-[9px] font-bold uppercase">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black tracking-widest text-white/20 uppercase">{t.password}</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-orange-500">
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
                      <input required placeholder="CITY" type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs" />
                      <input required placeholder="ZIP" type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className={`w-full bg-white/5 border ${errors.zip ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs`} />
                    </div>
                    <input required placeholder="STREET" type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs" />
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? 'PROCESSING...' : t.submit} <ArrowRight size={20} />
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
