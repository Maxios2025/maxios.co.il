import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight, MessageCircle } from 'lucide-react';
import { Language } from '../App';

interface PaymentFailedPageProps {
  lang: Language;
  onGoHome: () => void;
  onRetry: () => void;
}

const t = {
  en: {
    title: 'Payment Failed',
    subtitle: 'Your payment could not be processed. No charge was made to your card.',
    reasons: 'Common reasons:',
    reason1: 'Insufficient funds',
    reason2: 'Card expired or incorrect details',
    reason3: '3D Secure verification failed',
    reason4: 'Bank declined the transaction',
    tryAgain: 'TRY AGAIN',
    contactSupport: 'Contact Support',
    backHome: 'Back to Store',
    orderNote: 'Your order has not been placed.',
  },
  he: {
    title: 'התשלום נכשל',
    subtitle: 'לא ניתן היה לעבד את התשלום. לא בוצע חיוב בכרטיסך.',
    reasons: 'סיבות נפוצות:',
    reason1: 'אין מספיק יתרה',
    reason2: 'הכרטיס פג תוקף או פרטים שגויים',
    reason3: 'אימות 3D Secure נכשל',
    reason4: 'הבנק דחה את העסקה',
    tryAgain: 'נסה שוב',
    contactSupport: 'פנה לתמיכה',
    backHome: 'חזרה לחנות',
    orderNote: 'ההזמנה שלך לא בוצעה.',
  },
  ar: {
    title: 'فشلت عملية الدفع',
    subtitle: 'تعذر معالجة دفعتك. لم يتم تحصيل أي مبلغ من بطاقتك.',
    reasons: 'أسباب شائعة:',
    reason1: 'رصيد غير كافٍ',
    reason2: 'البطاقة منتهية أو بيانات غير صحيحة',
    reason3: 'فشل التحقق 3D Secure',
    reason4: 'رفض البنك للمعاملة',
    tryAgain: 'حاول مرة أخرى',
    contactSupport: 'تواصل مع الدعم',
    backHome: 'العودة إلى المتجر',
    orderNote: 'لم يتم تقديم طلبك.',
  },
};

export default function PaymentFailedPage({ lang, onGoHome, onRetry }: PaymentFailedPageProps) {
  const labels = t[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center px-6 py-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        {/* Failure icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center"
        >
          <X size={48} className="text-red-400" />
        </motion.div>

        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{labels.title}</h1>
          <p className="text-white/50 text-lg">{labels.subtitle}</p>
          <p className="text-orange-500/70 text-sm mt-2">{labels.orderNote}</p>
        </div>

        {/* Common reasons */}
        <div className="border border-white/10 bg-white/[0.02] p-5 text-left space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">{labels.reasons}</p>
          {[labels.reason1, labels.reason2, labels.reason3, labels.reason4].map((reason, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400/60 flex-shrink-0" />
              <span className="text-white/60 text-sm">{reason}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black uppercase tracking-wider text-lg flex items-center justify-center gap-3 hover:from-orange-500 hover:to-orange-400 transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)]"
          >
            {labels.tryAgain} <ArrowRight size={20} />
          </button>

          <a
            href="https://wa.me/9720529932765"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 font-medium flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <MessageCircle size={18} />
            {labels.contactSupport}
          </a>

          <button
            onClick={onGoHome}
            className="w-full text-white/30 hover:text-white/60 text-sm transition-colors py-2"
          >
            {labels.backHome}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
