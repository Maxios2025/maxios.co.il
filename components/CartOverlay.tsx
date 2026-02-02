
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Check, Banknote, ChevronDown, Plus, Minus, Truck, CreditCard, Ticket, X } from 'lucide-react';
import { Language, CartItem, PromoCode } from '../App';
import emailjs from '@emailjs/browser';
import { saveOrder } from '../lib/firebase';

interface CartOverlayProps {
  lang: Language;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  promoCodes: PromoCode[];
  onCheckout: () => void;
  startAtCheckout?: boolean;
}

export const CartOverlay: React.FC<CartOverlayProps> = ({ lang, cart, setCart, promoCodes, onCheckout }) => {
  // Step management - which step is currently being edited
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerZip, setCustomerZip] = useState("");

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  // Promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });

  // Validation handlers
  const handleNameChange = (value: string) => {
    const cleanName = value.replace(/[0-9]/g, '');
    setCustomerName(cleanName);
    setFieldErrors(prev => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (value: string) => {
    const cleanEmail = value.replace(/\s/g, '');
    setCustomerEmail(cleanEmail);
    const hasError = cleanEmail.length > 0 && !cleanEmail.includes('@');
    setFieldErrors(prev => ({ ...prev, email: hasError ? (lang === 'en' ? 'Email must contain @' : lang === 'he' ? 'האימייל חייב להכיל @' : 'يجب أن يحتوي البريد على @') : '' }));
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setCustomerPhone(digitsOnly);
    const hasError = digitsOnly.length > 0 && digitsOnly.length !== 10;
    setFieldErrors(prev => ({ ...prev, phone: hasError ? (lang === 'en' ? 'Phone must be 10 digits' : lang === 'he' ? 'הטלפון חייב להיות 10 ספרות' : 'يجب أن يكون رقم الهاتف 10 أرقام') : '' }));
  };

  const removeItem = (id: string) => setCart(cart.filter(i => i.id !== id));
  const increaseQty = (id: string) => setCart(cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item));
  const decreaseQty = (id: string) => setCart(cart.map(item => item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item));

  const applyPromo = () => {
    const code = promoCodes.find(c => c.code === promoInput.toUpperCase());
    if (code) {
      setAppliedPromo(code);
      setPromoError(false);
    } else {
      setPromoError(true);
      setTimeout(() => setPromoError(false), 3000);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
  };

  const calculateSubtotal = () => cart.reduce((acc, item) => acc + (parseFloat(item.price.replace(/[$₪,]/g, '')) * item.qty), 0);
  const subtotal = calculateSubtotal();
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent / 100) : 0;
  const total = subtotal - discountAmount;

  const isStep1Complete = customerName.trim() !== "" && customerEmail.includes('@') && !customerEmail.includes(' ') && customerPhone.replace(/\D/g, '').length === 10;
  const isStep2Complete = customerCity.trim() !== "" && customerStreet.trim() !== "" && customerZip.trim() !== "";
  const canPlaceOrder = isStep1Complete && isStep2Complete;

  const orderNumber = `MX-${Date.now().toString(36).toUpperCase()}`;

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setIsProcessing(true);

    try {
      // Create order object
      const order = {
        orderNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          city: customerCity,
          street: customerStreet,
          zip: customerZip
        },
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        subtotal: subtotal.toFixed(2),
        discount: appliedPromo ? discountAmount.toFixed(2) : '0',
        promoCode: appliedPromo?.code || null,
        total: total.toFixed(2),
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save to Firebase and localStorage
      saveOrder(order as any).then(result => {
        if (result.error) {
          console.error('Firebase save error:', result.error);
        } else {
          console.log('Order saved to Firebase successfully!');
        }
      });

      // Send order confirmation email to customer
      const orderItemsHtml = cart.map(item =>
        `${item.name} x${item.qty} - ₪${(parseFloat(item.price.replace(/[$₪,]/g, '')) * item.qty).toFixed(0)}`
      ).join('<br>');

      emailjs.send(
        'service_9sh4kyv',
        'template_jsfubmy',
        {
          to_email: customerEmail,
          order_number: orderNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: `${customerStreet}, ${customerCity} ${customerZip}`,
          order_items: orderItemsHtml,
          order_total: total.toFixed(0)
        },
        '_jL_0gQsRkGzlKdZw'
      ).then(() => console.log('Order confirmation email sent!')).catch(err => console.log('EmailJS error:', err));

      setIsProcessing(false);
      setOrderComplete(true);
      setTimeout(() => {
        onCheckout();
        setCart([]);
      }, 4000);
    } catch (err) {
      console.error('Order error:', err);
      setIsProcessing(false);
    }
  };

  const t = {
    en: {
      title: "CHECKOUT",
      step1: "Contact Information",
      step2: "Shipping Address",
      step3: "Delivery",
      step4: "Payment",
      step5: "Place Order",
      cardInfo: "Card Information",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      city: "City",
      street: "Street Address",
      zip: "Postal Code",
      freeShipping: "Free Shipping (2-4 business days)",
      deliveryNote: "Please allow 1-3 additional business days for us to get your order ready.",
      cod: "Cash on Delivery",
      codNote: "Pay when your order arrives",
      card: "Credit / Debit Card",
      cardNote: "Pay securely with your card",
      cardNumber: "Card Number",
      cardExpiry: "Expiry Date",
      cardCVV: "CVV",
      cardHolder: "Cardholder Name",
      placeOrder: "PLACE ORDER",
      processing: "Processing...",
      edit: "Edit",
      continue: "CONTINUE",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      free: "Free",
      quantity: "Quantity",
      orderConfirmed: "ORDER CONFIRMED",
      thankYou: "Thank you! Your order has been placed.",
      orderNumber: "Order Number",
      promoCode: "Promo Code",
      promoPlaceholder: "Enter promo code",
      apply: "Apply",
      promoApplied: "Promo code applied!",
      invalidPromo: "Invalid promo code",
      remove: "Remove"
    },
    he: {
      title: "סיום ההזמנה",
      step1: "פרטי התקשרות",
      step2: "כתובת משלוח",
      step3: "משלוח",
      step4: "תשלום",
      step5: "אישור הזמנה",
      cardInfo: "פרטי כרטיס",
      name: "שם מלא",
      email: "כתובת אימייל",
      phone: "מספר טלפון",
      city: "עיר",
      street: "כתובת רחוב",
      zip: "מיקוד",
      freeShipping: "משלוח חינם (2-4 ימי עסקים)",
      deliveryNote: "אנא המתינו 1-3 ימי עסקים נוספים להכנת ההזמנה.",
      cod: "תשלום במסירה",
      codNote: "שלם כאשר ההזמנה מגיעה",
      card: "כרטיס אשראי / דביט",
      cardNote: "שלם בצורה מאובטחת עם הכרטיס שלך",
      cardNumber: "מספר כרטיס",
      cardExpiry: "תאריך תפוגה",
      cardCVV: "CVV",
      cardHolder: "שם בעל הכרטיס",
      placeOrder: "אשר הזמנה",
      processing: "מעבד...",
      edit: "ערוך",
      continue: "המשך",
      orderSummary: "סיכום הזמנה",
      subtotal: "סכום ביניים",
      shipping: "משלוח",
      total: "סה״כ",
      free: "חינם",
      quantity: "כמות",
      orderConfirmed: "ההזמנה אושרה",
      thankYou: "תודה! ההזמנה שלך התקבלה.",
      orderNumber: "מספר הזמנה",
      promoCode: "קוד קופון",
      promoPlaceholder: "הזן קוד קופון",
      apply: "החל",
      promoApplied: "הקופון הוחל!",
      invalidPromo: "קוד קופון לא תקין",
      remove: "הסר"
    },
    ar: {
      title: "إتمام الطلب",
      step1: "معلومات الاتصال",
      step2: "عنوان الشحن",
      step3: "التوصيل",
      step4: "الدفع",
      step5: "تأكيد الطلب",
      cardInfo: "معلومات البطاقة",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      city: "المدينة",
      street: "عنوان الشارع",
      zip: "الرمز البريدي",
      freeShipping: "شحن مجاني (2-4 أيام عمل)",
      deliveryNote: "يرجى السماح بـ 1-3 أيام عمل إضافية لتجهيز طلبك.",
      cod: "الدفع عند التسليم",
      codNote: "ادفع عند وصول طلبك",
      card: "بطاقة ائتمان / خصم",
      cardNote: "ادفع بشكل آمن ببطاقتك",
      cardNumber: "رقم البطاقة",
      cardExpiry: "تاريخ الانتهاء",
      cardCVV: "CVV",
      cardHolder: "اسم حامل البطاقة",
      placeOrder: "تأكيد الطلب",
      processing: "جاري المعالجة...",
      edit: "تعديل",
      continue: "متابعة",
      orderSummary: "ملخص الطلب",
      subtotal: "المجموع الفرعي",
      shipping: "الشحن",
      total: "المجموع",
      free: "مجاني",
      quantity: "الكمية",
      orderConfirmed: "تم تأكيد الطلب",
      thankYou: "شكراً! تم استلام طلبك.",
      orderNumber: "رقم الطلب",
      promoCode: "رمز ترويجي",
      promoPlaceholder: "أدخل الرمز الترويجي",
      apply: "تطبيق",
      promoApplied: "تم تطبيق الرمز!",
      invalidPromo: "رمز ترويجي غير صالح",
      remove: "إزالة"
    }
  }[lang];

  if (orderComplete) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check size={48} className="text-white" />
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-4">{t.orderConfirmed}</h2>
        <p className="text-white/60 text-lg mb-8">{t.thankYou}</p>
        <div className="inline-block p-6 border border-white/10 bg-white/5">
          <p className="text-white/40 text-sm mb-2">{t.orderNumber}</p>
          <p className="text-orange-500 text-2xl font-mono font-bold">{orderNumber}</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-6 text-white/20" />
        <h2 className="text-2xl font-bold text-white/40">{lang === 'en' ? 'Your cart is empty' : lang === 'he' ? 'הסל ריק' : 'السلة فارغة'}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-black text-white">{t.title}</h1>
        <span className="text-white/40 text-sm">
          {lang === 'en' ? `Step ${activeStep} of 5` : lang === 'he' ? `שלב ${activeStep} מתוך 5` : `الخطوة ${activeStep} من 5`}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Steps */}
        <div className="lg:col-span-3 space-y-4">

          {/* Step 1: Contact Information */}
          <div className="border border-white/10 bg-white/[0.02]">
            <div
              className="p-4 md:p-6 flex justify-between items-center cursor-pointer"
              onClick={() => setActiveStep(1)}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isStep1Complete ? 'bg-green-500 text-white' : activeStep === 1 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  {isStep1Complete ? <Check size={16} /> : '1'}
                </span>
                <span className="text-white font-semibold">{t.step1}</span>
              </div>
              {isStep1Complete && activeStep !== 1 && (
                <button className="text-orange-500 text-sm hover:underline">{t.edit}</button>
              )}
            </div>

            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-6 space-y-4">
                    {isStep1Complete && (
                      <p className="text-white/60 text-sm">{customerName} | {customerEmail} | {customerPhone}</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.name}</label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className={`w-full bg-white/5 border ${fieldErrors.name ? 'border-red-500' : 'border-white/10'} p-3 text-white outline-none focus:border-orange-500 transition-colors`}
                          placeholder={t.name}
                        />
                        {fieldErrors.name && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.name}</p>}
                      </div>
                      <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.phone}</label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={`w-full bg-white/5 border ${fieldErrors.phone ? 'border-red-500' : 'border-white/10'} p-3 text-white outline-none focus:border-orange-500 transition-colors`}
                          placeholder="0501234567"
                          dir="ltr"
                        />
                        {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.email}</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10'} p-3 text-white outline-none focus:border-orange-500 transition-colors`}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                      {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.email}</p>}
                    </div>
                    <button
                      onClick={() => isStep1Complete && setActiveStep(2)}
                      disabled={!isStep1Complete}
                      className={`w-full md:w-auto px-8 py-3 font-bold uppercase tracking-wider ${isStep1Complete ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/10 text-white/30 cursor-not-allowed'} transition-colors`}
                    >
                      {t.continue}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 2: Shipping Address */}
          <div className="border border-white/10 bg-white/[0.02]">
            <div
              className={`p-4 md:p-6 flex justify-between items-center ${isStep1Complete ? 'cursor-pointer' : 'opacity-50'}`}
              onClick={() => isStep1Complete && setActiveStep(2)}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isStep2Complete ? 'bg-green-500 text-white' : activeStep === 2 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  {isStep2Complete ? <Check size={16} /> : '2'}
                </span>
                <span className="text-white font-semibold">{t.step2}</span>
              </div>
              {isStep2Complete && activeStep !== 2 && (
                <button className="text-orange-500 text-sm hover:underline">{t.edit}</button>
              )}
            </div>

            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-6 space-y-4">
                    {isStep2Complete && (
                      <p className="text-white/60 text-sm">{customerStreet}, {customerCity} {customerZip}</p>
                    )}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.city}</label>
                          <input
                            type="text"
                            value={customerCity}
                            onChange={(e) => setCustomerCity(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-orange-500 transition-colors"
                            placeholder={t.city}
                          />
                        </div>
                        <div>
                          <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.zip}</label>
                          <input
                            type="text"
                            value={customerZip}
                            onChange={(e) => setCustomerZip(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-orange-500 transition-colors"
                            placeholder="1234567"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.street}</label>
                        <input
                          type="text"
                          value={customerStreet}
                          onChange={(e) => setCustomerStreet(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-orange-500 transition-colors"
                          placeholder={t.street}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => isStep2Complete && setActiveStep(3)}
                      disabled={!isStep2Complete}
                      className={`w-full md:w-auto px-8 py-3 font-bold uppercase tracking-wider ${isStep2Complete ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/10 text-white/30 cursor-not-allowed'} transition-colors`}
                    >
                      {t.continue}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 3: Delivery */}
          <div className="border border-white/10 bg-white/[0.02]">
            <div
              className={`p-4 md:p-6 flex justify-between items-center ${isStep2Complete ? 'cursor-pointer' : 'opacity-50'}`}
              onClick={() => isStep2Complete && setActiveStep(3)}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeStep > 3 ? 'bg-green-500 text-white' : activeStep === 3 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  {activeStep > 3 ? <Check size={16} /> : '3'}
                </span>
                <span className="text-white font-semibold">{t.step3}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-6 space-y-4">
                    <p className="text-white/50 text-sm bg-orange-500/10 border border-orange-500/20 p-3">
                      {t.deliveryNote}
                    </p>
                    <label className="flex items-center gap-4 p-4 border border-orange-500 bg-orange-500/10 cursor-pointer">
                      <input type="radio" checked readOnly className="w-5 h-5 accent-orange-500" />
                      <Truck size={20} className="text-orange-500" />
                      <div className="flex-1">
                        <span className="text-white font-medium">{t.freeShipping}</span>
                      </div>
                      <span className="text-green-400 font-bold">{t.free}</span>
                    </label>
                    <button
                      onClick={() => setActiveStep(4)}
                      className="w-full md:w-auto px-8 py-3 font-bold uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                    >
                      {t.continue}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 4: Payment */}
          <div className="border border-white/10 bg-white/[0.02]">
            <div
              className={`p-4 md:p-6 flex justify-between items-center ${activeStep >= 3 ? 'cursor-pointer' : 'opacity-50'}`}
              onClick={() => activeStep >= 3 && setActiveStep(4)}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeStep > 4 ? 'bg-green-500 text-white' : activeStep === 4 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  {activeStep > 4 ? <Check size={16} /> : '4'}
                </span>
                <span className="text-white font-semibold">{t.step4}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeStep === 4 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-6 space-y-4">
                    <label
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30'}`}
                      onClick={() => setPaymentMethod('cod')}
                    >
                      <input type="radio" checked={paymentMethod === 'cod'} readOnly className="w-5 h-5 accent-orange-500" />
                      <Banknote size={24} className={paymentMethod === 'cod' ? 'text-orange-500' : 'text-white/50'} />
                      <div>
                        <span className="text-white font-medium block">{t.cod}</span>
                        <span className="text-white/50 text-sm">{t.codNote}</span>
                      </div>
                    </label>
                    <label
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30'}`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <input type="radio" checked={paymentMethod === 'card'} readOnly className="w-5 h-5 accent-orange-500" />
                      <CreditCard size={24} className={paymentMethod === 'card' ? 'text-orange-500' : 'text-white/50'} />
                      <div>
                        <span className="text-white font-medium block">{t.card}</span>
                        <span className="text-white/50 text-sm">{t.cardNote}</span>
                      </div>
                    </label>

                    {/* Card payment note */}
                    {paymentMethod === 'card' && (
                      <p className="text-white/50 text-sm p-3 bg-blue-500/10 border border-blue-500/20">
                        {lang === 'en' ? 'You will enter your card details in the next step.' : lang === 'he' ? 'תזין את פרטי הכרטיס בשלב הבא.' : 'ستدخل تفاصيل بطاقتك في الخطوة التالية.'}
                      </p>
                    )}

                    {/* Promo Code Section */}
                    <div className="mt-6 p-4 border border-white/10 bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-3">
                        <Ticket size={16} className="text-orange-500" />
                        <span className="text-white/70 text-sm font-medium">{t.promoCode}</span>
                      </div>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30">
                          <div>
                            <span className="text-green-400 font-bold">{appliedPromo.code}</span>
                            <span className="text-green-400/70 text-sm ml-2">(-{appliedPromo.percent}%)</span>
                          </div>
                          <button onClick={removePromo} className="text-white/40 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder={t.promoPlaceholder}
                            className="flex-1 bg-white/5 border border-white/10 p-3 text-white outline-none focus:border-orange-500 transition-colors uppercase font-mono text-sm"
                          />
                          <button
                            onClick={applyPromo}
                            disabled={!promoInput.trim()}
                            className={`px-4 py-2 font-bold uppercase text-sm ${promoInput.trim() ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-white/10 text-white/30 cursor-not-allowed'} transition-colors`}
                          >
                            {t.apply}
                          </button>
                        </div>
                      )}
                      {promoError && (
                        <p className="text-red-400 text-sm mt-2">{t.invalidPromo}</p>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveStep(5)}
                      className="w-full md:w-auto px-8 py-3 font-bold uppercase tracking-wider bg-orange-500 text-white hover:bg-orange-600 transition-colors mt-4"
                    >
                      {t.continue}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 5: Place Order / Payment */}
          <div className="border border-white/10 bg-white/[0.02]">
            <div
              className={`p-4 md:p-6 flex justify-between items-center ${activeStep >= 4 ? 'cursor-pointer' : 'opacity-50'}`}
              onClick={() => activeStep >= 4 && setActiveStep(5)}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${activeStep === 5 ? 'bg-orange-500 text-black' : 'bg-white/10 text-white/40'}`}>
                  5
                </span>
                <span className="text-white font-semibold">{paymentMethod === 'card' ? t.cardInfo : t.step5}</span>
              </div>
            </div>

            <AnimatePresence>
              {activeStep === 5 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 md:px-6 pb-6">
                    {/* Place Order button for both Card and Cash (Stripe will be added later) */}
                    {paymentMethod === 'card' && (
                      <p className="text-white/50 text-sm p-3 bg-blue-500/10 border border-blue-500/20 mb-4">
                        {lang === 'en' ? 'Card payment will be available soon. For now, order will be placed as pending.' : lang === 'he' ? 'תשלום בכרטיס יהיה זמין בקרוב. כרגע, ההזמנה תישמר כממתינה.' : 'سيتوفر الدفع بالبطاقة قريباً. الآن، سيتم حفظ الطلب كمعلق.'}
                      </p>
                    )}
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!canPlaceOrder || isProcessing}
                      className={`w-full py-4 font-black uppercase tracking-wider text-lg flex items-center justify-center gap-3 ${
                        canPlaceOrder && !isProcessing
                          ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-orange-400 shadow-[0_0_30px_rgba(234,88,12,0.3)]'
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      } transition-all`}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                          {t.processing}
                        </>
                      ) : (
                        <>
                          {t.placeOrder} <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-2">
          <div className="border border-white/10 bg-white/[0.02] sticky top-24">
            <div className="p-4 md:p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">{t.orderSummary}</h2>
            </div>

            {/* Cart Items */}
            <div className="p-4 md:p-6 space-y-4 max-h-[300px] overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-zinc-800 overflow-hidden flex-shrink-0">
                    <img src={item.img} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{item.name}</p>
                    <p className="text-white/40 text-xs mt-1">{t.quantity}: {item.qty}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => decreaseQty(item.id)} className="w-6 h-6 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10">
                        <Minus size={12} />
                      </button>
                      <span className="text-white text-sm w-6 text-center">{item.qty}</span>
                      <button onClick={() => increaseQty(item.id)} className="w-6 h-6 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10">
                        <Plus size={12} />
                      </button>
                      <button onClick={() => removeItem(item.id)} className="ml-auto text-white/30 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">₪{(parseFloat(item.price.replace(/[$₪,]/g, '')) * item.qty).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="p-4 md:p-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{t.subtotal}</span>
                <span className="text-white">₪{subtotal.toFixed(0)}</span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-400">{lang === 'en' ? 'Discount' : lang === 'he' ? 'הנחה' : 'خصم'}</span>
                  <span className="text-green-400">-₪{discountAmount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-white/60">{t.shipping}</span>
                <span className="text-green-400 font-medium">{t.free}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/10">
                <span className="text-white font-bold">{t.total}</span>
                <span className="text-white font-black text-xl">₪{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
