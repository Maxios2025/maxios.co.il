
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Ticket, Check, CreditCard, Banknote, ChevronLeft } from 'lucide-react';
import { Language, CartItem, PromoCode } from '../App';
import { StripeCheckout } from './StripeCheckout';

type PaymentMethod = 'card' | 'cod' | null;
type CheckoutStep = 'cart' | 'payment' | 'confirmation';

interface CartOverlayProps {
  lang: Language;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  promoCodes: PromoCode[];
  onCheckout: () => void;
}

export const CartOverlay: React.FC<CartOverlayProps> = ({ lang, cart, setCart, promoCodes, onCheckout }) => {
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>('cart');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const removeItem = (id: string) => setCart(cart.filter(i => i.id !== id));

  const applyPromo = () => {
    const code = promoCodes.find(c => c.code === promoInput.toUpperCase());
    if (code) {
      setAppliedPromo(code);
      setPromoError(false);
    } else {
      setPromoError(true);
      setAppliedPromo(null);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => acc + (parseFloat(item.price.replace(/[$₪]/g, '')) * item.qty), 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent / 100) : 0;
  const total = subtotal - discountAmount;

  // Handle successful Stripe payment
  const handleStripeSuccess = () => {
    setCheckoutStep('confirmation');
    // Clear cart after showing confirmation
    setTimeout(() => {
      onCheckout();
      setCart([]);
      setCheckoutStep('cart');
      setSelectedPayment(null);
    }, 5000);
  };

  // Handle Stripe payment error
  const handleStripeError = (error: string) => {
    setPaymentError(error);
  };

  // Handle Cash on Delivery checkout
  const handleCodCheckout = async () => {
    setIsProcessing(true);
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setCheckoutStep('confirmation');

    // Clear cart after showing confirmation
    setTimeout(() => {
      onCheckout();
      setCart([]);
      setCheckoutStep('cart');
      setSelectedPayment(null);
    }, 5000);
  };

  const t = {
    en: {
      title: "LOGISTICS MANIFEST",
      empty: "NO UNITS DEPLOYED",
      total: "MANIFEST TOTAL",
      checkout: "EXECUTE ORDER",
      promo: "PROMO CODE",
      apply: "APPLY",
      selectPayment: "SELECT PAYMENT PROTOCOL",
      creditCard: "CREDIT / DEBIT CARD",
      creditCardDesc: "Secure payment via Stripe",
      cashOnDelivery: "CASH ON DELIVERY",
      cashOnDeliveryDesc: "Pay when units arrive at your hub",
      back: "BACK",
      payNow: "PLACE ORDER",
      processing: "PROCESSING...",
      orderConfirmed: "ORDER CONFIRMED",
      orderNumber: "ORDER NUMBER",
      thankYou: "Thank you for your order. Units deploying soon.",
      codNote: "Payment will be collected upon delivery",
      paymentError: "Payment failed. Please try again."
    },
    ar: {
      title: "بيان الخدمات اللوجستية",
      empty: "لا توجد وحدات",
      total: "إجمالي البيان",
      checkout: "تنفيذ الطلب",
      promo: "رمز الترويجي",
      apply: "تطبيق",
      selectPayment: "اختر طريقة الدفع",
      creditCard: "بطاقة ائتمان / خصم",
      creditCardDesc: "دفع آمن عبر Stripe",
      cashOnDelivery: "الدفع عند الاستلام",
      cashOnDeliveryDesc: "ادفع عند وصول الوحدات",
      back: "رجوع",
      payNow: "تأكيد الطلب",
      processing: "جاري المعالجة...",
      orderConfirmed: "تم تأكيد الطلب",
      orderNumber: "رقم الطلب",
      thankYou: "شكراً لطلبك. سيتم نشر الوحدات قريباً.",
      codNote: "سيتم تحصيل الدفع عند التسليم",
      paymentError: "فشل الدفع. حاول مرة أخرى."
    },
    he: {
      title: "מניפסט לוגיסטי",
      empty: "אין יחידות פרוסות",
      total: "סה\"כ מניפסט",
      checkout: "בצע הזמנה",
      promo: "קוד קופון",
      apply: "החל",
      selectPayment: "בחר אמצעי תשלום",
      creditCard: "כרטיס אשראי / חיוב",
      creditCardDesc: "תשלום מאובטח דרך Stripe",
      cashOnDelivery: "תשלום במזומן בעת המסירה",
      cashOnDeliveryDesc: "שלם כאשר היחידות מגיעות",
      back: "חזור",
      payNow: "אשר הזמנה",
      processing: "מעבד...",
      orderConfirmed: "ההזמנה אושרה",
      orderNumber: "מספר הזמנה",
      thankYou: "תודה על ההזמנה. היחידות בדרך אליך.",
      codNote: "התשלום ייגבה בעת המסירה",
      paymentError: "התשלום נכשל. נסה שוב."
    }
  }[lang];

  const textColor = 'text-white';
  const borderColor = 'border-white/5';
  const bgMuted = 'bg-white/5';

  // Generate random order number
  const orderNumber = `MX-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 min-h-[60vh] flex flex-col">
      <AnimatePresence mode="wait">
        {/* STEP 1: CART VIEW */}
        {checkoutStep === 'cart' && (
          <motion.div key="cart-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }}>
            <h3 className={`text-4xl md:text-7xl font-black italic tracking-tighter ${textColor} uppercase mb-16`}>{t.title}</h3>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 opacity-20 min-h-[40vh]"><ShoppingBag size={80} /><p className="text-xl font-black tracking-widest">{t.empty}</p></div>
            ) : (
              <div className="space-y-12 flex-1">
                {cart.map((item) => (
                  <motion.div layout key={item.id} className={`flex items-center gap-8 border-b ${borderColor} pb-12 group`}>
                    <div className="w-24 h-24 bg-zinc-900 overflow-hidden"><img src={item.img} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" /></div>
                    <div className="flex-1"><h4 className={`text-2xl font-black italic ${textColor} uppercase`}>{item.name}</h4><p className="text-orange-500 font-black tracking-widest text-xs">UNIT COUNT: {item.qty}</p></div>
                    <div className="text-right"><p className={`text-2xl font-black italic ${textColor} mb-2`}>{item.price}</p><button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={20} /></button></div>
                  </motion.div>
                ))}
                <div className="pt-12 space-y-12">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                      <input value={promoInput} onChange={e => {setPromoInput(e.target.value); setPromoError(false);}} placeholder={t.promo} className={`w-full ${bgMuted} border ${promoError ? 'border-red-500' : borderColor} p-4 pl-12 ${textColor} text-xs outline-none focus:border-orange-500 uppercase font-black`} />
                      {appliedPromo && <Check className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18}/>}
                    </div>
                    <button onClick={applyPromo} className="px-12 py-4 bg-white text-black font-black uppercase text-xs hover:bg-orange-600 transition-all">{t.apply}</button>
                  </div>
                  {appliedPromo && <div className="flex justify-between text-green-500 text-xs font-black uppercase"><span>PROMO APPLIED: {appliedPromo.code}</span><span>-₪{discountAmount.toFixed(0)}</span></div>}
                  <div className={`flex justify-between items-end border-t ${borderColor} pt-12`}>
                    <span className="text-xs font-black tracking-[0.5em] text-white/20 uppercase">{t.total}</span>
                    <span className={`text-4xl md:text-6xl font-black italic ${textColor}`}>₪{total.toFixed(0)}</span>
                  </div>
                  <button onClick={() => setCheckoutStep('payment')} className="w-full py-8 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 text-xl">
                    {t.checkout} <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: PAYMENT SELECTION */}
        {checkoutStep === 'payment' && (
          <motion.div key="payment-step" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-12">
            <div className="flex items-center gap-4">
              <button onClick={() => { setCheckoutStep('cart'); setPaymentError(null); }} className="text-orange-500 hover:text-white transition-colors"><ChevronLeft size={28} /></button>
              <h3 className={`text-3xl md:text-5xl font-black italic tracking-tighter ${textColor} uppercase`}>{t.selectPayment}</h3>
            </div>

            {/* Payment Error */}
            {paymentError && (
              <div className="p-4 bg-red-500/20 border border-red-500 text-red-500 text-sm font-bold">
                {paymentError}
              </div>
            )}

            {/* Payment Method Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Credit Card Option */}
              <button
                onClick={() => { setSelectedPayment('card'); setPaymentError(null); }}
                className={`p-8 border-2 transition-all text-left ${selectedPayment === 'card' ? 'border-orange-500 bg-orange-500/10' : `${borderColor} hover:border-orange-500/50`}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <CreditCard className={selectedPayment === 'card' ? 'text-orange-500' : textColor} size={32} />
                  <span className={`text-lg font-black uppercase tracking-tight ${textColor}`}>{t.creditCard}</span>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest">{t.creditCardDesc}</p>
                {selectedPayment === 'card' && <Check className="text-orange-500 mt-4" size={20} />}
              </button>

              {/* Cash on Delivery Option */}
              <button
                onClick={() => { setSelectedPayment('cod'); setPaymentError(null); }}
                className={`p-8 border-2 transition-all text-left ${selectedPayment === 'cod' ? 'border-orange-500 bg-orange-500/10' : `${borderColor} hover:border-orange-500/50`}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Banknote className={selectedPayment === 'cod' ? 'text-orange-500' : textColor} size={32} />
                  <span className={`text-lg font-black uppercase tracking-tight ${textColor}`}>{t.cashOnDelivery}</span>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest">{t.cashOnDeliveryDesc}</p>
                {selectedPayment === 'cod' && <Check className="text-orange-500 mt-4" size={20} />}
              </button>
            </div>

            {/* Stripe Card Form - Only shown when card is selected */}
            <AnimatePresence>
              {selectedPayment === 'card' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <StripeCheckout
                    amount={total}
                    onSuccess={handleStripeSuccess}
                    onError={handleStripeError}
                    lang={lang}
                    cartItems={cart}
                  />
                </motion.div>
              )}

              {selectedPayment === 'cod' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-6">
                  <div className={`p-8 ${bgMuted} border ${borderColor} flex items-center gap-4`}>
                    <Banknote className="text-orange-500" size={24} />
                    <p className="text-sm text-white/60 uppercase tracking-widest">{t.codNote}</p>
                  </div>

                  {/* Order Summary for COD */}
                  <div className={`flex justify-between items-end border-t ${borderColor} pt-8`}>
                    <span className="text-xs font-black tracking-[0.5em] text-white/20 uppercase">{t.total}</span>
                    <span className={`text-4xl md:text-5xl font-black italic ${textColor}`}>₪{total.toFixed(0)}</span>
                  </div>

                  {/* COD Order Button */}
                  <button
                    onClick={handleCodCheckout}
                    disabled={isProcessing}
                    className="w-full py-8 bg-orange-600 hover:bg-white text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 text-xl transition-all"
                  >
                    {isProcessing ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-6 h-6 border-2 border-black border-t-transparent rounded-full" /> {t.processing}</>
                    ) : (
                      <>{t.payNow} <ArrowRight size={24} /></>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {checkoutStep === 'confirmation' && (
          <motion.div key="confirmation-step" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
              <Check size={48} className="text-white" />
            </motion.div>
            <h3 className={`text-4xl md:text-6xl font-black italic tracking-tighter ${textColor} uppercase`}>{t.orderConfirmed}</h3>
            <div className="space-y-2">
              <p className="text-xs font-black tracking-[0.3em] text-white/40 uppercase">{t.orderNumber}</p>
              <p className="text-2xl font-mono text-orange-500 font-bold">{orderNumber}</p>
            </div>
            <p className="text-sm text-white/60 max-w-md">{t.thankYou}</p>
            {selectedPayment === 'cod' && (
              <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest">
                <Banknote size={16} /> {t.codNote}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
