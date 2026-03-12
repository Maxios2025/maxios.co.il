import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, User, MapPin, Phone, Mail } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  theme: 'dark' | 'light';
  lang: 'en' | 'ar' | 'he';
  customerInfo: CustomerInfo;
  cartItems: { id: string; name: string; qty: number; price: string }[];
  totalAmount: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSuccess,
  onError,
  theme,
  lang,
  customerInfo,
  cartItems,
  totalAmount
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const t = {
    en: { payNow: "PAY NOW", processing: "PROCESSING...", securePayment: "SECURE PAYMENT" },
    ar: { payNow: "ادفع الآن", processing: "جاري المعالجة...", securePayment: "دفع آمن" },
    he: { payNow: "שלם עכשיו", processing: "מעבד...", securePayment: "תשלום מאובטח" }
  }[lang];

  // Send Telegram notification for new order
  const sendOrderNotification = async () => {
    try {
      const orderNumber = `MX-${Date.now().toString(36).toUpperCase()}`;
      const itemsList = cartItems.map(item => `• ${item.name} x${item.qty} - ${item.price}`).join('\n');
      await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          data: {
            orderNumber: orderNumber,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            zip: customerInfo.zip,
            items: itemsList,
            total: totalAmount,
            paymentMethod: '💳 Credit Card'
          }
        })
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '?payment=success',
        receipt_email: customerInfo.email,
        shipping: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            postal_code: customerInfo.zip,
            country: 'IL',
          },
        },
      },
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      // Send Telegram notification on successful payment
      await sendOrderNotification();
      onSuccess();
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest mb-4">
        <Lock size={14} /> {t.securePayment}
      </div>

      <div className={`p-4 rounded ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-6 font-black uppercase tracking-tighter flex items-center justify-center gap-4 text-lg transition-all ${
          !stripe || isProcessing
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-500 text-black'
        }`}
      >
        {isProcessing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
            />
            {t.processing}
          </>
        ) : (
          <>
            {t.payNow} <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
};

interface StripeCheckoutProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  theme?: 'dark' | 'light';
  lang?: 'en' | 'ar' | 'he';
  cartItems?: { id: string; name: string; qty: number; price: string }[];
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  amount,
  onSuccess,
  onError,
  theme = 'dark',
  lang = 'en',
  cartItems = []
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const t = {
    en: {
      customerInfo: "CUSTOMER INFORMATION",
      shippingAddress: "SHIPPING ADDRESS",
      name: "FULL NAME",
      email: "EMAIL",
      phone: "PHONE",
      address: "STREET ADDRESS",
      city: "CITY",
      zip: "ZIP CODE",
      continue: "CONTINUE TO PAYMENT",
      back: "BACK",
      required: "Required",
      errPhone: "Phone must be 10 digits",
      errEmail: "Email must contain @",
      errName: "Name cannot contain numbers",
      errZip: "Zip code must be 5 or 7 digits"
    },
    ar: {
      customerInfo: "معلومات العميل",
      shippingAddress: "عنوان الشحن",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      address: "العنوان",
      city: "المدينة",
      zip: "الرمز البريدي",
      continue: "المتابعة للدفع",
      back: "رجوع",
      required: "مطلوب",
      errPhone: "يجب أن يتكون رقم الهاتف من 10 أرقام",
      errEmail: "البريد الإلكتروني يجب أن يحتوي على @",
      errName: "الاسم لا يمكن أن يحتوي على أرقام",
      errZip: "الرمز البريدي يجب أن يكون 5 أو 7 أرقام"
    },
    he: {
      customerInfo: "פרטי לקוח",
      shippingAddress: "כתובת למשלוח",
      name: "שם מלא",
      email: "אימייל",
      phone: "טלפון",
      address: "כתובת",
      city: "עיר",
      zip: "מיקוד",
      continue: "המשך לתשלום",
      back: "חזור",
      required: "שדה חובה",
      errPhone: "מספר טלפון חייב להיות 10 ספרות",
      errEmail: "אימייל חייב להכיל @",
      errName: "שם לא יכול להכיל מספרים",
      errZip: "מיקוד חייב להיות 5 או 7 ספרות"
    }
  }[lang];

  const textColor = theme === 'dark' ? 'text-white' : 'text-black';
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-black/10';
  const bgInput = theme === 'dark' ? 'bg-white/5' : 'bg-black/5';
  const labelColor = theme === 'dark' ? 'text-white/40' : 'text-black/50';

  // Handle name change - remove numbers
  const handleNameChange = (value: string) => {
    const cleanName = value.replace(/[0-9]/g, '');
    setCustomerInfo({...customerInfo, name: cleanName});
    if (/\d/.test(value)) {
      setFormErrors(prev => ({...prev, name: t.errName}));
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
    setCustomerInfo({...customerInfo, phone: digitsOnly});
    // Clear error while typing
    if (formErrors.phone) setFormErrors(prev => { const { phone, ...rest } = prev; return rest; });
  };

  // Handle email change - validate format
  const handleEmailChange = (value: string) => {
    const cleanEmail = value.replace(/\s/g, '');
    setCustomerInfo({...customerInfo, email: cleanEmail});
    // Clear error while typing
    if (formErrors.email) setFormErrors(prev => { const { email, ...rest } = prev; return rest; });
  };

  // Handle zip change - only digits
  const handleZipChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 7);
    setCustomerInfo({...customerInfo, zip: digitsOnly});
    // Clear error while typing
    if (formErrors.zip) setFormErrors(prev => { const { zip, ...rest } = prev; return rest; });
  };

  // Validate on blur (when user leaves the field)
  const handlePhoneBlur = () => {
    if (customerInfo.phone.length > 0 && customerInfo.phone.length !== 10) {
      setFormErrors(prev => ({...prev, phone: t.errPhone}));
    }
  };

  const handleEmailBlur = () => {
    if (customerInfo.email.length > 0 && !customerInfo.email.includes('@')) {
      setFormErrors(prev => ({...prev, email: t.errEmail}));
    }
  };

  const handleZipBlur = () => {
    const len = customerInfo.zip.length;
    if (len > 0 && len !== 5 && len !== 7) {
      setFormErrors(prev => ({...prev, zip: t.errZip}));
    }
  };

  // Validate customer info
  const validateInfo = () => {
    const errors: {[key: string]: string} = {};
    if (!customerInfo.name.trim()) errors.name = t.required;
    if (/\d/.test(customerInfo.name)) errors.name = t.errName;
    if (!customerInfo.email.trim() || !customerInfo.email.includes('@')) errors.email = t.errEmail;
    const phoneDigits = customerInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) errors.phone = t.errPhone;
    if (!customerInfo.address.trim()) errors.address = t.required;
    if (!customerInfo.city.trim()) errors.city = t.required;
    const zipDigits = customerInfo.zip.replace(/\D/g, '');
    if (zipDigits.length !== 5 && zipDigits.length !== 7) errors.zip = t.errZip;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create payment intent when moving to payment step
  const handleContinueToPayment = async () => {
    if (!validateInfo()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'usd',
          metadata: {
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            items: JSON.stringify(cartItems.map(item => ({
              id: item.id,
              name: item.name,
              qty: item.qty
            })))
          }
        }),
      });

      const data = await response.json();

      if (data.error) {
        setInitError(data.error);
        onError(data.error);
      } else {
        setClientSecret(data.clientSecret);
        setStep('payment');
      }
    } catch (err) {
      const errorMsg = 'Failed to initialize payment. Please try again.';
      setInitError(errorMsg);
      onError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const appearance = {
    theme: theme === 'dark' ? 'night' as const : 'stripe' as const,
    variables: {
      colorPrimary: '#ea580c',
      colorBackground: theme === 'dark' ? '#18181b' : '#ffffff',
      colorText: theme === 'dark' ? '#ffffff' : '#000000',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '0px',
    },
  };

  // Step 1: Customer Information Form
  if (step === 'info') {
    return (
      <div className="space-y-8">
        {/* Customer Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest">
            <User size={14} /> {t.customerInfo}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.name}</label>
              <input
                value={customerInfo.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="John Doe"
                className={`w-full ${bgInput} border ${formErrors.name ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500 uppercase font-bold`}
              />
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.email}</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={e => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="john@example.com"
                className={`w-full ${bgInput} border ${formErrors.email ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500`}
              />
              {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
            </div>
            <div>
              <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.phone}</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onBlur={handlePhoneBlur}
                placeholder="0501234567"
                maxLength={10}
                className={`w-full ${bgInput} border ${formErrors.phone ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500`}
              />
              {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-orange-500 text-xs font-black uppercase tracking-widest">
            <MapPin size={14} /> {t.shippingAddress}
          </div>
          <div className="space-y-4">
            <div>
              <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.address}</label>
              <input
                value={customerInfo.address}
                onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                placeholder="123 Main Street"
                className={`w-full ${bgInput} border ${formErrors.address ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500`}
              />
              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.city}</label>
                <input
                  value={customerInfo.city}
                  onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})}
                  placeholder="Tel Aviv"
                  className={`w-full ${bgInput} border ${formErrors.city ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500`}
                />
                {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
              </div>
              <div>
                <label className={`text-[10px] font-black tracking-widest ${labelColor} uppercase block mb-2`}>{t.zip}</label>
                <input
                  value={customerInfo.zip}
                  onChange={e => handleZipChange(e.target.value)}
                  onBlur={handleZipBlur}
                  placeholder="1234567"
                  maxLength={7}
                  className={`w-full ${bgInput} border ${formErrors.zip ? 'border-red-500' : borderColor} p-4 ${textColor} text-sm outline-none focus:border-orange-500`}
                />
                {formErrors.zip && <p className="text-red-500 text-xs mt-1">{formErrors.zip}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinueToPayment}
          disabled={isLoading}
          className="w-full py-6 bg-orange-600 hover:bg-orange-500 text-black font-black uppercase tracking-tighter flex items-center justify-center gap-4 text-lg transition-all"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
              />
              Loading...
            </>
          ) : (
            <>
              {t.continue} <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    );
  }

  // Error state
  if (initError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-500 text-center">{initError}</p>
        <button
          onClick={() => { setInitError(null); setStep('info'); }}
          className="px-8 py-3 bg-orange-600 text-black font-black uppercase text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Loading state
  if (isLoading || !clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Step 2: Payment Form
  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => setStep('info')}
        className={`text-xs font-black uppercase tracking-widest ${labelColor} hover:text-orange-500 transition-colors`}
      >
        ← {t.back}
      </button>

      {/* Customer summary */}
      <div className={`p-4 ${bgInput} border ${borderColor} space-y-1`}>
        <p className={`${textColor} font-bold`}>{customerInfo.name}</p>
        <p className={`${labelColor} text-sm`}>{customerInfo.email} • {customerInfo.phone}</p>
        <p className={`${labelColor} text-sm`}>{customerInfo.address}, {customerInfo.city} {customerInfo.zip}</p>
      </div>

      {/* Stripe Elements */}
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance
        }}
      >
        <CheckoutForm
          onSuccess={onSuccess}
          onError={onError}
          theme={theme}
          lang={lang}
          customerInfo={customerInfo}
        />
      </Elements>
    </div>
  );
};
