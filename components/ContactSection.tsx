
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../App';
import { Mail, Phone, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { saveContactMessage } from '../lib/firebase';
import emailjs from '@emailjs/browser';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });

  const isRTL = lang === 'he' || lang === 'ar';

  const t = {
    en: {
      title: "Contact Us", subtitle: "Contact headquarters for specialized inquiries.",
      name: "Full Name", email: "Email Address", phone: "Phone Number", message: "Your Inquiry",
      submit: "Send", success: "Message Received.",
      nameError: "Name cannot contain numbers",
      emailError: "Enter a valid email with @",
      phoneError: "Phone must be 10 digits only"
    },
    ar: {
      title: "تواصل معنا", subtitle: "اتصل بالمقر الرئيسي للاستفسارات.",
      name: "الاسم", email: "البريد", phone: "رقم الهاتف", message: "الاستفسار",
      submit: "إرسال", success: "تم الاستلام",
      nameError: "الاسم لا يمكن أن يحتوي على أرقام",
      emailError: "أدخل بريد إلكتروني صالح مع @",
      phoneError: "رقم الهاتف يجب أن يكون 10 أرقام فقط"
    },
    he: {
      title: "צור קשר", subtitle: "צור קשר עם המטה לבירורים.",
      name: "שם", email: "אימייל", phone: "טלפון", message: "הפנייה",
      submit: "שלח", success: "התקבל",
      nameError: "השם לא יכול להכיל מספרים",
      emailError: "הזן אימייל תקין עם @",
      phoneError: "הטלפון חייב להיות 10 ספרות בלבד"
    }
  }[lang];

  // Validation functions
  const validateName = (name: string) => {
    if (/\d/.test(name)) return t.nameError;
    return '';
  };

  const validateEmail = (email: string) => {
    if (email.includes(' ') || !email.includes('@')) return t.emailError;
    return '';
  };

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return t.phoneError;
    return '';
  };

  // Input handlers with validation
  const handleNameChange = (value: string) => {
    // Remove any numbers from name
    const cleanName = value.replace(/[0-9]/g, '');
    setFormData({ ...formData, name: cleanName });
    setFieldErrors({ ...fieldErrors, name: '' });
  };

  const handleEmailChange = (value: string) => {
    // Remove spaces from email
    const cleanEmail = value.replace(/\s/g, '');
    setFormData({ ...formData, email: cleanEmail });
    setFieldErrors({ ...fieldErrors, email: validateEmail(cleanEmail) });
  };

  const handlePhoneChange = (value: string) => {
    // Only allow digits, max 10
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
    setFieldErrors({ ...fieldErrors, phone: digitsOnly.length > 0 && digitsOnly.length !== 10 ? t.phoneError : '' });
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' &&
           formData.email.includes('@') &&
           !formData.email.includes(' ') &&
           formData.phone.replace(/\D/g, '').length === 10 &&
           formData.message.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation
    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);

    if (nameErr || emailErr || phoneErr) {
      setFieldErrors({ name: nameErr, email: emailErr, phone: phoneErr });
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Save to localStorage first (always works)
      const contacts = JSON.parse(localStorage.getItem('maxios_contacts') || '[]');
      contacts.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('maxios_contacts', JSON.stringify(contacts));

      // Save to Firebase (with better logging)
      saveContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        message: formData.message,
      }).then(result => {
        if (result.error) {
          console.error('Firebase save error:', result.error);
        } else {
          console.log('Message saved to Firebase successfully!');
        }
      }).catch(err => console.error('Firebase error:', err));

      // Send thank you email to customer via EmailJS
      emailjs.send(
        'service_9sh4kyv',
        'template_t4lbow8',
        {
          to_email: formData.email,
          from_name: 'MAXIOS',
          to_name: formData.name,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          reply_to: 'service@maxios.co.il'
        },
        '_jL_0gQsRkGzlKdZw'
      ).then(() => console.log('Email sent successfully!')).catch(err => console.log('EmailJS error:', err.text || err));

      // Send Telegram notification to support group
      fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            message: formData.message
          }
        })
      }).then(() => console.log('Telegram notification sent!')).catch(err => console.log('Telegram error:', err));

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
        <div className="space-y-16">
          <div className="space-y-6">
            <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-6xl md:text-8xl font-black italic tracking-tighter text-white">{t.title}</motion.h2>
            <p className="text-xl text-white/40 font-light max-w-md">{t.subtitle}</p>
          </div>
          <div className="space-y-10">
            <div className={`flex items-center gap-6 group ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-4 border border-white/5 bg-white/5 group-hover:border-orange-500 transition-colors"><Mail className="text-orange-500" size={24} /></div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">HQ EMAIL</p>
                <p className="text-lg font-medium text-white/80" style={{ direction: 'ltr', display: 'block', textAlign: isRTL ? 'right' : 'left' }}>service@maxios.co.il</p>
              </div>
            </div>
            <div className={`flex items-center gap-6 group ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-4 border border-white/5 bg-white/5 group-hover:border-orange-500 transition-colors"><Phone className="text-orange-500" size={24} /></div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">DIRECT LINE</p>
                <p className="text-lg font-medium text-white/80" style={{ direction: 'ltr', display: 'block', textAlign: isRTL ? 'right' : 'left' }}>+972 55 949 2403</p>
              </div>
            </div>
            <a href="https://wa.me/972559492403" target="_blank" rel="noopener noreferrer" className={`flex items-center gap-6 group ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-4 border border-white/5 bg-white/5 group-hover:border-orange-500 transition-colors"><MessageCircle className="text-orange-500" size={24} /></div>
              <div className={isRTL ? 'text-right' : ''}>
                <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">WHATSAPP</p>
                <p className="text-lg font-medium text-white/80" style={{ direction: 'ltr', display: 'block', textAlign: isRTL ? 'right' : 'left' }}>+972 55 949 2403</p>
              </div>
            </a>
          </div>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form key="form" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onSubmit={handleSubmit} className="bg-zinc-950 border border-white/5 p-8 md:p-12 space-y-8 shadow-2xl">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20">
                    <p className="text-red-500 text-xs font-bold uppercase">{error}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <input required placeholder={t.name} type="text" value={formData.name} onChange={e => handleNameChange(e.target.value)} className={`w-full bg-white/5 border ${fieldErrors.name ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} />
                    {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <input required placeholder={t.email} type="email" value={formData.email} onChange={e => handleEmailChange(e.target.value)} className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} />
                    {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.email}</p>}
                  </div>
                </div>
                <div>
                  <input required placeholder={t.phone} type="tel" value={formData.phone} onChange={e => handlePhoneChange(e.target.value)} className={`w-full bg-white/5 border ${fieldErrors.phone ? 'border-red-500' : 'border-white/10'} p-4 text-white text-xs outline-none focus:border-orange-500`} dir="ltr" />
                  {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.phone}</p>}
                </div>
                <textarea required placeholder={t.message} rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs resize-none outline-none focus:border-orange-500" />
                <button type="submit" disabled={loading || !isFormValid()} className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Send size={20} />{loading ? 'SENDING...' : t.submit}
                </button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-950 border border-orange-500 p-12 text-center space-y-6">
                <CheckCircle className="mx-auto text-orange-500" size={80} />
                <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">{t.success}</h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};