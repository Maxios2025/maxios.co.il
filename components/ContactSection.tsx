
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../App';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { saveContactMessage } from '../lib/firebase';

interface ContactSectionProps {
  lang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  
  const t = {
    en: { title: "Direct Engineering Link", subtitle: "Contact headquarters for specialized inquiries.", name: "Full Name", email: "Email Address", message: "Your Inquiry", submit: "Initialize Transmission", success: "Data Pack Received." },
    ar: { title: "رابط هندسي مباشر", subtitle: "اتصل بالمقر الرئيسي للاستفسارات.", name: "الاسم", email: "البريد", message: "الاستفسار", submit: "إرسال", success: "تم الاستلام" },
    he: { title: "קישור הנדסי ישיר", subtitle: "צור קשר עם המטה לבירורים.", name: "שם", email: "אימייל", message: "הפנייה", submit: "שידור", success: "התקבל" }
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Save to Firebase
      const { error: insertError } = await saveContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message,
      });

      if (insertError) throw insertError;

      // Also save to localStorage as backup
      const contacts = JSON.parse(localStorage.getItem('maxios_contacts') || '[]');
      contacts.push({ ...formData, timestamp: new Date().toISOString() });
      localStorage.setItem('maxios_contacts', JSON.stringify(contacts));

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
            <div className="flex items-center gap-6 group">
              <div className="p-4 border border-white/5 bg-white/5 group-hover:border-orange-500 transition-colors"><Mail className="text-orange-500" size={24} /></div>
              <div><p className="text-[10px] font-black tracking-widest text-white/20 uppercase">HQ EMAIL</p><p className="text-lg font-medium text-white/80">service@maxios.co.il</p></div>
            </div>
            <div className="flex items-center gap-6 group">
              <div className="p-4 border border-white/5 bg-white/5 group-hover:border-orange-500 transition-colors"><Phone className="text-orange-500" size={24} /></div>
              <div><p className="text-[10px] font-black tracking-widest text-white/20 uppercase">DIRECT LINE</p><p className="text-lg font-medium text-white/80">+972 55 949 2403</p></div>
            </div>
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
                  <input required placeholder={t.name} type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs outline-none focus:border-orange-500" />
                  <input required placeholder={t.email} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs outline-none focus:border-orange-500" />
                </div>
                <input placeholder="Phone (Optional)" type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs outline-none focus:border-orange-500" />
                <textarea required placeholder={t.message} rows={4} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 text-white text-xs resize-none outline-none focus:border-orange-500" />
                <button type="submit" disabled={loading} className="w-full py-6 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed">
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
