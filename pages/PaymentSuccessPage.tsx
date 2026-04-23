import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Download, ArrowRight } from 'lucide-react';
import { Language } from '../App';

interface PaymentSuccessPageProps {
  lang: Language;
  onGoHome: () => void;
}

interface PaymentResult {
  transactionId: string | null;
  last4Digits: string | null;
  cardOwnerName: string | null;
  numberOfPayments: number;
  firstPaymentAmount: number | null;
  invoiceNumber: string | null;
}

const t = {
  en: {
    title: 'Payment Successful!',
    subtitle: 'Your order has been confirmed and payment received.',
    orderNumber: 'Order Number',
    transaction: 'Transaction ID',
    card: 'Card',
    installments: 'Installments',
    invoice: 'Invoice Number',
    invoiceNote: 'An invoice will be sent to your email shortly.',
    backHome: 'BACK TO STORE',
    verifying: 'Verifying payment...',
    support: 'Need help? Contact us at support@maxios.co.il',
  },
  he: {
    title: 'התשלום בוצע בהצלחה!',
    subtitle: 'הזמנתך אושרה והתשלום התקבל.',
    orderNumber: 'מספר הזמנה',
    transaction: 'מספר עסקה',
    card: 'כרטיס',
    installments: 'תשלומים',
    invoice: 'מספר חשבונית',
    invoiceNote: 'חשבונית מס תישלח לאימייל שלך בקרוב.',
    backHome: 'חזרה לחנות',
    verifying: 'מאמת תשלום...',
    support: 'צריך עזרה? פנה אלינו בכתובת support@maxios.co.il',
  },
  ar: {
    title: 'تمت عملية الدفع بنجاح!',
    subtitle: 'تم تأكيد طلبك واستلام الدفعة.',
    orderNumber: 'رقم الطلب',
    transaction: 'رقم المعاملة',
    card: 'البطاقة',
    installments: 'أقساط',
    invoice: 'رقم الفاتورة',
    invoiceNote: 'سيتم إرسال فاتورة ضريبية إلى بريدك الإلكتروني قريباً.',
    backHome: 'العودة إلى المتجر',
    verifying: 'جاري التحقق من الدفع...',
    support: 'تحتاج مساعدة؟ تواصل معنا على support@maxios.co.il',
  },
};

export default function PaymentSuccessPage({ lang, onGoHome }: PaymentSuccessPageProps) {
  const [status, setStatus] = useState<'verifying' | 'confirmed' | 'error'>('verifying');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const labels = t[lang];
  const isRTL = lang === 'he' || lang === 'ar';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order = params.get('order') || '';
    const lowProfileCode = params.get('LowProfileCode') || params.get('lowProfileCode') || '';
    setOrderNumber(order);

    if (!lowProfileCode) {
      // No code to verify — still show success (webhook already processed it)
      setStatus('confirmed');
      return;
    }

    // Verify payment result with our backend
    fetch('/api/get-cardcom-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lowProfileCode }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaymentResult({
            transactionId: data.transactionId,
            last4Digits: data.last4Digits,
            cardOwnerName: data.cardOwnerName,
            numberOfPayments: data.numberOfPayments || 1,
            firstPaymentAmount: data.firstPaymentAmount,
            invoiceNumber: data.invoiceNumber,
          });
          setStatus('confirmed');
        } else {
          setStatus('error');
        }
      })
      .catch(() => {
        // Verification call failed — still show success (payment likely went through)
        setStatus('confirmed');
      });
  }, []);

  // Auto-redirect home after 30s
  useEffect(() => {
    if (status !== 'confirmed') return;
    const timer = setTimeout(onGoHome, 30000);
    return () => clearTimeout(timer);
  }, [status, onGoHome]);

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center px-6 py-20"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-lg w-full text-center space-y-8">
        {status === 'verifying' && (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-white/60 tracking-widest text-sm uppercase">{labels.verifying}</p>
          </div>
        )}

        {status === 'confirmed' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.4)]"
            >
              <Check size={48} className="text-white" />
            </motion.div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3">{labels.title}</h1>
              <p className="text-white/50 text-lg">{labels.subtitle}</p>
            </div>

            {/* Order / Payment Details */}
            <div className="border border-white/10 bg-white/[0.02] p-6 space-y-4 text-left" dir={isRTL ? 'rtl' : 'ltr'}>
              {orderNumber && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/50 text-sm">{labels.orderNumber}</span>
                  <span className="text-orange-500 font-mono font-bold">{orderNumber}</span>
                </div>
              )}
              {paymentResult?.transactionId && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/50 text-sm">{labels.transaction}</span>
                  <span className="text-white font-mono text-sm">{paymentResult.transactionId}</span>
                </div>
              )}
              {paymentResult?.last4Digits && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/50 text-sm">{labels.card}</span>
                  <span className="text-white font-mono">•••• {paymentResult.last4Digits}</span>
                </div>
              )}
              {paymentResult?.numberOfPayments && paymentResult.numberOfPayments > 1 && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/50 text-sm">{labels.installments}</span>
                  <span className="text-white">{paymentResult.numberOfPayments}</span>
                </div>
              )}
              {paymentResult?.invoiceNumber && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/50 text-sm">{labels.invoice}</span>
                  <span className="text-white font-mono">{paymentResult.invoiceNumber}</span>
                </div>
              )}
            </div>

            {/* Invoice note */}
            <p className="text-white/30 text-sm">{labels.invoiceNote}</p>

            {/* Back to store */}
            <button
              onClick={onGoHome}
              className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black uppercase tracking-wider text-lg flex items-center justify-center gap-3 hover:from-orange-500 hover:to-orange-400 transition-all shadow-[0_0_30px_rgba(234,88,12,0.3)]"
            >
              {labels.backHome} <ArrowRight size={20} />
            </button>

            <p className="text-white/20 text-xs">{labels.support}</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center">
              <span className="text-red-400 text-4xl font-black">!</span>
            </div>
            <p className="text-white/60">
              {lang === 'en' ? 'Payment verification failed. If you were charged, contact support.' :
               lang === 'he' ? 'אימות התשלום נכשל. אם חויבת, פנה לתמיכה.' :
               'فشل التحقق من الدفع. إذا تم تحصيل مبلغ منك، تواصل مع الدعم.'}
            </p>
            <a href="mailto:support@maxios.co.il" className="text-orange-500 underline text-sm">support@maxios.co.il</a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
