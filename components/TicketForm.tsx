import React, { useState } from 'react';
import { Language } from '../App';
import { Send, ArrowLeft, ArrowRight, CheckCircle, RefreshCcw, Wrench, Package, ShieldCheck, HelpCircle } from 'lucide-react';

interface TicketFormProps {
  lang: Language;
  category: string;
  onBack: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ lang, category, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    subject: '',
    description: '',
    productModel: '',
    purchaseDate: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const isRTL = lang === 'he' || lang === 'ar';

  const categoryIcons: { [key: string]: any } = {
    refund: RefreshCcw,
    tech: Wrench,
    items: Package,
    warranty: ShieldCheck,
    other: HelpCircle
  };

  const content = {
    en: {
      back: "Back to Support",
      title: "Open Support Ticket",
      categories: {
        refund: "Refund Request",
        tech: "Hardware Issue",
        items: "Parts Inquiry",
        warranty: "Warranty Claim",
        other: "General Support"
      },
      form: {
        name: "Full Name",
        namePlaceholder: "Enter your full name",
        email: "Email Address",
        emailPlaceholder: "your@email.com",
        phone: "Phone Number",
        phonePlaceholder: "+972 XX XXX XXXX",
        orderNumber: "Order Number (Optional)",
        orderPlaceholder: "e.g. MAX-2024-XXXXX",
        productModel: "Product Model",
        productPlaceholder: "e.g. MAXIOS T18 PRO",
        purchaseDate: "Purchase Date",
        subject: "Subject",
        subjectPlaceholder: "Brief description of your issue",
        description: "Description",
        descriptionPlaceholder: "Please provide detailed information about your issue. Include any error messages, symptoms, or relevant details that will help us assist you faster.",
        submit: "Submit Ticket",
        submitting: "Submitting...",
        required: "Required field",
        errPhone: "Phone must be 10 digits",
        errEmail: "Email must contain @",
        errName: "Name cannot contain numbers"
      },
      success: {
        title: "Ticket Submitted Successfully",
        message: "Thank you for contacting MAXIOS Support. Your ticket has been received and our team will respond within 24-48 business hours.",
        ticketId: "Your Ticket ID",
        email: "A confirmation email has been sent to",
        newTicket: "Submit Another Ticket",
        backToSupport: "Back to Support"
      }
    },
    he: {
      back: "חזרה לתמיכה",
      title: "פתיחת כרטיס תמיכה",
      categories: {
        refund: "בקשת החזר",
        tech: "בעיית חומרה",
        items: "שאילתת חלקים",
        warranty: "תביעת אחריות",
        other: "תמיכה כללית"
      },
      form: {
        name: "שם מלא",
        namePlaceholder: "הזן את שמך המלא",
        email: "כתובת אימייל",
        emailPlaceholder: "your@email.com",
        phone: "מספר טלפון",
        phonePlaceholder: "+972 XX XXX XXXX",
        orderNumber: "מספר הזמנה (אופציונלי)",
        orderPlaceholder: "לדוגמה MAX-2024-XXXXX",
        productModel: "דגם המוצר",
        productPlaceholder: "לדוגמה MAXIOS T18 PRO",
        purchaseDate: "תאריך רכישה",
        subject: "נושא",
        subjectPlaceholder: "תיאור קצר של הבעיה",
        description: "תיאור",
        descriptionPlaceholder: "אנא ספק מידע מפורט על הבעיה שלך. כלול הודעות שגיאה, תסמינים או פרטים רלוונטיים שיעזרו לנו לסייע לך מהר יותר.",
        submit: "שלח כרטיס",
        submitting: "שולח...",
        required: "שדה חובה",
        errPhone: "מספר טלפון חייב להיות 10 ספרות",
        errEmail: "אימייל חייב להכיל @",
        errName: "שם לא יכול להכיל מספרים"
      },
      success: {
        title: "הכרטיס נשלח בהצלחה",
        message: "תודה שפנית לתמיכת MAXIOS. הכרטיס שלך התקבל וצוות שלנו יגיב תוך 24-48 שעות עסקים.",
        ticketId: "מספר הכרטיס שלך",
        email: "אימייל אישור נשלח אל",
        newTicket: "שלח כרטיס נוסף",
        backToSupport: "חזרה לתמיכה"
      }
    },
    ar: {
      back: "العودة للدعم",
      title: "فتح تذكرة دعم",
      categories: {
        refund: "طلب استرداد",
        tech: "مشكلة في الجهاز",
        items: "استفسار عن القطع",
        warranty: "مطالبة بالضمان",
        other: "دعم عام"
      },
      form: {
        name: "الاسم الكامل",
        namePlaceholder: "أدخل اسمك الكامل",
        email: "البريد الإلكتروني",
        emailPlaceholder: "your@email.com",
        phone: "رقم الهاتف",
        phonePlaceholder: "+972 XX XXX XXXX",
        orderNumber: "رقم الطلب (اختياري)",
        orderPlaceholder: "مثال MAX-2024-XXXXX",
        productModel: "موديل المنتج",
        productPlaceholder: "مثال MAXIOS T18 PRO",
        purchaseDate: "تاريخ الشراء",
        subject: "الموضوع",
        subjectPlaceholder: "وصف موجز لمشكلتك",
        description: "الوصف",
        descriptionPlaceholder: "يرجى تقديم معلومات مفصلة حول مشكلتك. قم بتضمين أي رسائل خطأ أو أعراض أو تفاصيل ذات صلة ستساعدنا في مساعدتك بشكل أسرع.",
        submit: "إرسال التذكرة",
        submitting: "جاري الإرسال...",
        required: "حقل مطلوب",
        errPhone: "يجب أن يتكون رقم الهاتف من 10 أرقام",
        errEmail: "البريد الإلكتروني يجب أن يحتوي على @",
        errName: "الاسم لا يمكن أن يحتوي على أرقام"
      },
      success: {
        title: "تم إرسال التذكرة بنجاح",
        message: "شكرًا لتواصلك مع دعم MAXIOS. تم استلام تذكرتك وسيرد فريقنا خلال 24-48 ساعة عمل.",
        ticketId: "رقم تذكرتك",
        email: "تم إرسال بريد تأكيد إلى",
        newTicket: "إرسال تذكرة أخرى",
        backToSupport: "العودة للدعم"
      }
    }
  };

  const t = content[lang];
  const CategoryIcon = categoryIcons[category] || HelpCircle;

  // Handle name change - remove numbers
  const handleNameChange = (value: string) => {
    const cleanName = value.replace(/[0-9]/g, '');
    setFormData({...formData, name: cleanName});
    if (/\d/.test(value)) {
      setFormErrors(prev => ({...prev, name: t.form.errName}));
    } else {
      setFormErrors(prev => {
        const { name, ...rest } = prev;
        return rest;
      });
    }
  };

  // Handle phone change - only digits, max 10
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData({...formData, phone: digitsOnly});
    // Clear error while typing
    if (formErrors.phone) setFormErrors(prev => { const { phone, ...rest } = prev; return rest; });
  };

  // Handle email change - validate format
  const handleEmailChange = (value: string) => {
    const cleanEmail = value.replace(/\s/g, '');
    setFormData({...formData, email: cleanEmail});
    // Clear error while typing
    if (formErrors.email) setFormErrors(prev => { const { email, ...rest } = prev; return rest; });
  };

  // Validate on blur (when user leaves the field)
  const handlePhoneBlur = () => {
    if (formData.phone.length > 0 && formData.phone.length !== 10) {
      setFormErrors(prev => ({...prev, phone: t.form.errPhone}));
    }
  };

  const handleEmailBlur = () => {
    if (formData.email.length > 0 && !formData.email.includes('@')) {
      setFormErrors(prev => ({...prev, email: t.form.errEmail}));
    }
  };

  // Validate form before submit
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (/\d/.test(formData.name)) errors.name = t.form.errName;
    if (!formData.email.includes('@')) errors.email = t.form.errEmail;
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) errors.phone = t.form.errPhone;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    // Send Telegram notification
    try {
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ticket',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: `[${category.toUpperCase()}] ${formData.subject}`,
            message: `📦 Product: ${formData.productModel}\n📅 Purchase Date: ${formData.purchaseDate || 'N/A'}\n🔢 Order #: ${formData.orderNumber || 'N/A'}\n\n${formData.description}`
          }
        })
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const generateTicketId = () => {
    return `MAX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  };

  if (submitted) {
    const ticketId = generateTicketId();
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 min-h-screen">
        <div className="text-center space-y-8">
          <div className="w-24 h-24 mx-auto bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={48} />
          </div>

          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
            {t.success.title}
          </h1>

          <p className="text-white/60 text-lg max-w-md mx-auto">
            {t.success.message}
          </p>

          <div className="bg-orange-500/10 border border-orange-500/30 p-6 inline-block">
            <p className="text-white/50 text-sm mb-2">{t.success.ticketId}</p>
            <p className="text-orange-500 font-black text-2xl tracking-wider">{ticketId}</p>
          </div>

          <p className="text-white/40 text-sm">
            {t.success.email} <span className="text-orange-500">{formData.email}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  orderNumber: '',
                  subject: '',
                  description: '',
                  productModel: '',
                  purchaseDate: ''
                });
              }}
              className="px-8 py-4 border-2 border-orange-500 text-orange-500 font-black uppercase text-sm hover:bg-orange-500 hover:text-black transition-all"
            >
              {t.success.newTicket}
            </button>
            <button
              onClick={onBack}
              className="px-8 py-4 bg-orange-500 text-black font-black uppercase text-sm hover:bg-orange-600 transition-all"
            >
              {t.success.backToSupport}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-screen">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 text-white/50 hover:text-orange-500 transition-colors mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
        <span className="font-bold text-sm uppercase tracking-wider">{t.back}</span>
      </button>

      {/* Header */}
      <div className={`mb-12 ${isRTL ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="p-4 bg-orange-500/10 border border-orange-500/30">
            <CategoryIcon className="text-orange-500" size={32} />
          </div>
          <div>
            <p className="text-orange-500 font-black text-xs uppercase tracking-widest mb-1">
              {t.categories[category as keyof typeof t.categories] || t.categories.other}
            </p>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              {t.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.name} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={t.form.namePlaceholder}
              className={`w-full bg-black/50 border ${formErrors.name ? 'border-red-500' : 'border-white/10'} p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>

          {/* Email */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.email} <span className="text-orange-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder={t.form.emailPlaceholder}
              className={`w-full bg-black/50 border ${formErrors.email ? 'border-red-500' : 'border-white/10'} p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
          </div>
        </div>

        {/* Phone and Order Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.phone} <span className="text-orange-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              placeholder="0501234567"
              maxLength={10}
              className={`w-full bg-black/50 border ${formErrors.phone ? 'border-red-500' : 'border-white/10'} p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
            {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
          </div>

          {/* Order Number */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.orderNumber}
            </label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
              placeholder={t.form.orderPlaceholder}
              className={`w-full bg-black/50 border border-white/10 p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
          </div>
        </div>

        {/* Product Info Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Model */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.productModel} <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.productModel}
              onChange={(e) => setFormData({...formData, productModel: e.target.value})}
              placeholder={t.form.productPlaceholder}
              className={`w-full bg-black/50 border border-white/10 p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
          </div>

          {/* Purchase Date */}
          <div className={isRTL ? 'text-right' : ''}>
            <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
              {t.form.purchaseDate}
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
              className={`w-full bg-black/50 border border-white/10 p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
            />
          </div>
        </div>

        {/* Subject */}
        <div className={isRTL ? 'text-right' : ''}>
          <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
            {t.form.subject} <span className="text-orange-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            placeholder={t.form.subjectPlaceholder}
            className={`w-full bg-black/50 border border-white/10 p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors ${isRTL ? 'text-right' : ''}`}
          />
        </div>

        {/* Description */}
        <div className={isRTL ? 'text-right' : ''}>
          <label className="block text-white/70 text-sm font-bold uppercase tracking-wider mb-2">
            {t.form.description} <span className="text-orange-500">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            placeholder={t.form.descriptionPlaceholder}
            className={`w-full bg-black/50 border border-white/10 p-4 text-white placeholder:text-white/30 focus:border-orange-500 focus:outline-none transition-colors resize-none ${isRTL ? 'text-right' : ''}`}
          />
        </div>

        {/* Submit Button */}
        <div className={`pt-4 ${isRTL ? 'text-right' : ''}`}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-5 bg-orange-500 text-black font-black uppercase text-sm flex items-center gap-3 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'flex-row-reverse ml-auto' : ''}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                {t.form.submitting}
              </>
            ) : (
              <>
                <Send size={18} />
                {t.form.submit}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
