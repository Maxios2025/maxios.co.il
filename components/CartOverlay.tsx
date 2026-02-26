
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Banknote, Truck, CreditCard, Ticket, X } from 'lucide-react';
import { Language, PromoCode } from '../App';
import emailjs from '@emailjs/browser';
import { saveOrder } from '../lib/firebase';
import { trackBeginCheckout, trackPurchase } from '../lib/analytics';

// Escape user input to prevent XSS in email HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface CartOverlayProps {
  lang: Language;
  promoCodes: PromoCode[];
  onCheckout: () => void;
}

// Fixed single product — no cart needed
const PRODUCT = {
  id: 'pro18',
  name: 'MAXIOS PRO-18',
  price: 1899,
  img: '/hero-poster.jpeg',
  qty: 1,
};

export const CartOverlay: React.FC<CartOverlayProps> = ({ lang, promoCodes, onCheckout }) => {
  // Step management - which step is currently being edited
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerStreet, setCustomerStreet] = useState("");
  const [customerZip, setCustomerZip] = useState("");

  // Payment method — COD only for now
  const [paymentMethod] = useState<'cod'>('cod');
  const [orderError, setOrderError] = useState('');

  // Promo
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', phone: '' });

  // Phone verification state
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpHash, setOtpHash] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);

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

    // Reset verification state if phone number changes
    if (phoneVerified || otpSent) {
      setPhoneVerified(false);
      setOtpSent(false);
      setOtpCode('');
      setOtpError('');
    }
  };

  const handleSendOTP = async () => {
    if (customerPhone.length !== 10 || otpLoading || resendCooldown > 0) return;

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/send-otp-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          setOtpError(t.otpTooMany);
        } else {
          setOtpError(data.error || t.otpSendFailed);
        }
        return;
      }

      setOtpHash(data.hash);
      setOtpExpiresAt(data.expiresAt);
      setOtpSent(true);

      // Start 60-second cooldown for resend
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      // API not available (local dev) — skip OTP, auto-verify phone
      if (import.meta.env.DEV) {
        console.warn('[DEV] OTP API unavailable — auto-verifying phone');
        setPhoneVerified(true);
        return;
      }
      console.error('OTP send error:', error);
      setOtpError(t.otpSendFailed);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await fetch('/api/verify-otp-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone, code: otpCode, hash: otpHash, expiresAt: otpExpiresAt }),
      });
      const data = await res.json();

      if (data.valid) {
        setPhoneVerified(true);
        setOtpError('');
      } else {
        setOtpError(data.error === 'Code expired' ? t.otpExpired : t.otpInvalidCode);
      }
    } catch (error: any) {
      console.error('OTP verify error:', error);
      setOtpError(t.otpVerifyFailed);
    } finally {
      setOtpLoading(false);
    }
  };

  // Single product — no cart management needed

  const applyPromo = () => {
    const code = promoCodes.find(c => c.code === promoInput.toUpperCase());
    if (code) {
      // Check if promo code has expired
      const createdTime = new Date(code.createdAt).getTime();
      const expiryMs = code.expiryHours * 60 * 60 * 1000;
      if (Date.now() > createdTime + expiryMs) {
        setPromoError(true);
        setTimeout(() => setPromoError(false), 3000);
        return;
      }
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

  const subtotal = PRODUCT.price * PRODUCT.qty;
  const discountAmount = appliedPromo ? (subtotal * appliedPromo.percent / 100) : 0;
  const total = subtotal - discountAmount;

  const isEmailValid = customerEmail.trim() === '' || (customerEmail.includes('@') && !customerEmail.includes(' '));
  const isStep1Complete = customerName.trim() !== "" && customerPhone.replace(/\D/g, '').length === 10 && phoneVerified && isEmailValid;
  const isStep2Complete = customerCity.trim() !== "" && customerStreet.trim() !== "" && customerZip.trim() !== "";
  const canPlaceOrder = isStep1Complete && isStep2Complete;

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setIsProcessing(true);
    trackBeginCheckout(total);

    // Generate order number at time of order placement
    const currentOrderNumber = `MX-${Date.now().toString(36).toUpperCase()}`;

    try {
      // Create order object
      const order = {
        orderNumber: currentOrderNumber,
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          city: customerCity,
          street: customerStreet,
          zip: customerZip
        },
        items: [{ id: PRODUCT.id, name: PRODUCT.name, qty: PRODUCT.qty, price: PRODUCT.price }],
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
        }
      });

      // Send Telegram notification to orders group
      const itemsList = `• ${PRODUCT.name} x${PRODUCT.qty} - ₪${PRODUCT.price}`;
      const telegramPayload = {
        type: 'order',
        data: {
          orderNumber: currentOrderNumber,
          customerName: customerName,
          customerEmail: customerEmail,
          customerPhone: customerPhone,
          address: customerStreet,
          city: customerCity,
          zip: customerZip,
          items: itemsList,
          total: total.toFixed(0),
          paymentMethod: paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Credit Card'
        }
      };
      fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramPayload)
      }).then(res => res.json()).catch(err => console.error('Telegram error:', err));

      // Send order confirmation email to customer
      const orderItemsHtml = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;border-bottom:1px solid #1e1e1e;"><tr><td width="70" valign="top" style="padding:12px 0 16px;"><img src="https://maxios.co.il${PRODUCT.img}" alt="${escapeHtml(PRODUCT.name)}" width="60" height="60" style="display:block;width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #2a2a2a;" /></td><td valign="top" style="padding:12px 16px 16px;"><p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(PRODUCT.name)}</p><p style="margin:0;font-size:12px;color:#888888;font-family:Arial,Helvetica,sans-serif;">כמות: ${PRODUCT.qty}</p></td><td valign="top" align="left" style="padding:12px 0 16px;"><p style="margin:0;font-size:16px;font-weight:900;color:#ea580c;font-family:Arial,Helvetica,sans-serif;">&#8362;${PRODUCT.price}</p></td></tr></table>`;

      const discountRow = appliedPromo ? `<tr><td style="padding:14px 0;font-size:14px;color:#22c55e;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">הנחה (${appliedPromo.code} - ${appliedPromo.percent}%)</td><td align="left" style="padding:14px 0;font-size:14px;color:#22c55e;font-weight:bold;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">-&#8362;${discountAmount.toFixed(0)}</td></tr>` : '';
      const paymentLabel = paymentMethod === 'cod' ? 'תשלום במסירה' : 'כרטיס אשראי';
      const safeCustomerName = escapeHtml(customerName);
      const shippingAddress = escapeHtml(`${customerStreet}, ${customerCity} ${customerZip}`);

      const fullEmailHtml = `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><!--[if mso]><style>table{border-collapse:collapse;}td{font-family:Arial,sans-serif;}</style><![endif]--></head><body style="margin:0;padding:0;background-color:#0a0a0a;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0a0a0a;"><tr><td align="center" style="padding:0;"><div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">תודה על ההזמנה שלך מ-Maxios! מספר הזמנה: ${currentOrderNumber}</div><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;"><tr><td style="font-size:0;line-height:0;background-color:#0a0a0a;" align="center"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#ea580c;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr></table><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#141414;">

<tr><td align="center" style="padding:48px 40px 16px;"><a href="https://maxios.co.il" target="_blank" style="text-decoration:none;"><img src="https://maxios.co.il/logo.png" alt="Maxios" width="180" style="display:block;width:180px;height:auto;border:0;" /></a></td></tr>

<tr><td align="center" style="padding:8px 40px 8px;"><h1 style="margin:0;font-size:36px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">תודה על ההזמנה!</h1></td></tr>

<tr><td align="center" style="padding:8px 50px 24px;"><p style="margin:0;font-size:15px;color:#888888;line-height:1.7;font-family:Arial,Helvetica,sans-serif;">ההזמנה שלך התקבלה בהצלחה. אנו מכינים את החבילה שלך ונשלח עדכון משלוח בקרוב.</p></td></tr>

<tr><td align="center" style="padding:0 40px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#ea580c;border-radius:8px;"><a href="https://maxios.co.il" target="_blank" style="display:inline-block;padding:16px 48px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;letter-spacing:1.5px;font-family:Arial,Helvetica,sans-serif;border-radius:8px;">עקוב אחרי ההזמנה</a></td></tr></table></td></tr>

<tr><td align="center" style="padding:4px 40px 40px;"><p style="margin:0;font-size:12px;color:#555555;font-family:Arial,Helvetica,sans-serif;">אנא המתינו עד 24 שעות למעקב אחר ההזמנה.</p></td></tr>

<tr><td style="padding:0 30px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1e1e;border-radius:12px;overflow:hidden;"><tr><td width="50%" valign="top" style="padding:28px 24px;border-left:1px solid #2a2a2a;"><p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#888888;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">סיכום</p><p style="margin:0 0 6px;font-size:13px;color:#ea580c;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">מוכן למשלוח</p><p style="margin:0 0 4px;font-size:13px;color:#666666;font-family:Arial,Helvetica,sans-serif;">${currentOrderNumber}</p><p style="margin:0;font-size:18px;color:#ffffff;font-weight:900;font-family:Arial,Helvetica,sans-serif;">&#8362;${total.toFixed(0)}</p></td><td width="50%" valign="top" style="padding:28px 24px;"><p style="margin:0 0 4px;font-size:11px;font-weight:bold;color:#888888;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">כתובת למשלוח</p><p style="margin:0 0 4px;font-size:14px;color:#ffffff;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">${safeCustomerName}</p><p style="margin:0;font-size:13px;color:#888888;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${shippingAddress}</p></td></tr></table></td></tr>

<tr><td style="padding:0 60px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #222222;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

<tr><td align="center" style="padding:40px 30px 6px;"><h2 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">הפריטים בהזמנה שלך</h2></td></tr>
<tr><td align="center" style="padding:4px 30px 28px;"><p style="margin:0;font-size:13px;color:#666666;font-family:Arial,Helvetica,sans-serif;">מספר הזמנה: #${currentOrderNumber}</p></td></tr>

<tr><td style="padding:0 30px 16px;">${orderItemsHtml}</td></tr>

<tr><td style="padding:0 30px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:14px 0;font-size:14px;color:#888888;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">סכום ביניים</td><td align="left" style="padding:14px 0;font-size:14px;color:#ffffff;font-weight:bold;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">&#8362;${subtotal.toFixed(0)}</td></tr>${discountRow}<tr><td style="padding:14px 0;font-size:14px;color:#888888;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">משלוח</td><td align="left" style="padding:14px 0;font-size:14px;color:#22c55e;font-weight:bold;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #1e1e1e;">חינם</td></tr><tr><td style="padding:20px 0 8px;font-size:16px;font-weight:900;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">סה״כ:</td><td align="left" style="padding:20px 0 8px;font-size:24px;font-weight:900;color:#ea580c;font-family:Arial,Helvetica,sans-serif;">&#8362;${total.toFixed(0)}</td></tr></table></td></tr>

<tr><td style="padding:8px 30px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1e1e;border-radius:8px;"><tr><td style="padding:14px 20px;font-size:13px;color:#888888;font-family:Arial,Helvetica,sans-serif;">תשלום: <span style="color:#ffffff;font-weight:bold;">${paymentLabel}</span></td></tr></table></td></tr>

<tr><td style="padding:0 60px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid #222222;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>

<tr><td align="center" style="padding:40px 30px 8px;"><h2 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">יש בעיה עם ההזמנה?</h2></td></tr>

<tr><td style="padding:20px 30px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td width="48%" valign="top" style="padding-left:6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1e1e;border-radius:12px;"><tr><td align="center" style="padding:24px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:44px;height:44px;background-color:#2a2a2a;border-radius:50%;text-align:center;vertical-align:middle;"><span style="font-size:20px;line-height:44px;">&#9993;</span></td></tr></table><p style="margin:12px 0 2px;font-size:14px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">שלחו מייל</p><p style="margin:0;font-size:12px;color:#ea580c;font-family:Arial,Helvetica,sans-serif;">support@maxios.co.il</p></td></tr></table></td><td width="4%">&nbsp;</td><td width="48%" valign="top" style="padding-right:6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1e1e;border-radius:12px;"><tr><td align="center" style="padding:24px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="width:44px;height:44px;background-color:#2a2a2a;border-radius:50%;text-align:center;vertical-align:middle;"><span style="font-size:20px;line-height:44px;">&#9742;</span></td></tr></table><p style="margin:12px 0 2px;font-size:14px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">התקשרו אלינו</p><p style="margin:0;font-size:12px;color:#ea580c;font-family:Arial,Helvetica,sans-serif;">052-9932765</p></td></tr></table></td></tr></table></td></tr>

<tr><td style="padding:0 30px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#ea580c 0%,#c2410c 100%);border-radius:16px;overflow:hidden;"><tr><td align="center" style="padding:36px 30px;"><h3 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">שתפו עם חברים</h3><p style="margin:0 0 20px;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;font-family:Arial,Helvetica,sans-serif;">אהבתם את ההזמנה? ספרו לחברים על Maxios<br>ועזרו להם לגלות מוצרי ניקיון איכותיים.</p><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:#ffffff;border-radius:8px;"><a href="https://maxios.co.il" target="_blank" style="display:inline-block;padding:14px 40px;color:#ea580c;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">בקרו ב-Maxios</a></td></tr></table></td></tr></table></td></tr>

<tr><td style="padding:0 30px 40px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1e1e1e;border-radius:12px;"><tr><td style="padding:24px 28px;" valign="middle"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle" style="padding-left:16px;"><p style="margin:0 0 2px;font-size:16px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">רוצים לדבר עסקים?</p><p style="margin:0;font-size:13px;color:#888888;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">פנו אלינו בכתובת <span style="color:#ea580c;font-weight:bold;">partner@maxios.co.il</span><br>אנחנו פתוחים לכל סוג של שיתוף פעולה עסקי</p></td></tr></table></td></tr></table></td></tr>

</table>

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#0f0f0f;border-top:1px solid #1e1e1e;"><tr><td align="center" style="padding:40px 30px 12px;"><a href="https://maxios.co.il" target="_blank" style="text-decoration:none;"><img src="https://maxios.co.il/logo.png" alt="Maxios" width="140" style="display:block;width:140px;height:auto;border:0;" /></a></td></tr><tr><td align="center" style="padding:0 30px 20px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 8px;"><a href="#" style="display:inline-block;width:36px;height:36px;background-color:#1e1e1e;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;"><span style="color:#888888;font-size:16px;">&#9679;</span></a></td><td style="padding:0 8px;"><a href="#" style="display:inline-block;width:36px;height:36px;background-color:#1e1e1e;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;"><span style="color:#888888;font-size:16px;">&#9679;</span></a></td><td style="padding:0 8px;"><a href="#" style="display:inline-block;width:36px;height:36px;background-color:#1e1e1e;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;"><span style="color:#888888;font-size:16px;">&#9679;</span></a></td><td style="padding:0 8px;"><a href="#" style="display:inline-block;width:36px;height:36px;background-color:#1e1e1e;border-radius:50%;text-align:center;line-height:36px;text-decoration:none;"><span style="color:#888888;font-size:16px;">&#9679;</span></a></td></tr></table></td></tr><tr><td align="center" style="padding:0 30px 12px;"><p style="margin:0;font-size:12px;color:#444444;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">Maxios, ישראל</p></td></tr><tr><td align="center" style="padding:0 30px 40px;"><p style="margin:0 0 8px;font-size:11px;color:#333333;font-family:Arial,Helvetica,sans-serif;">&copy; 2026 Maxios. כל הזכויות שמורות.</p><a href="#" style="font-size:12px;color:#ea580c;text-decoration:underline;font-family:Arial,Helvetica,sans-serif;">הסרה מרשימת תפוצה</a></td></tr></table>

</td></tr></table></body></html>`;

      // Only send confirmation email if the customer provided an email
      if (customerEmail.trim()) {
        emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
          {
            to_email: customerEmail,
            order_number: currentOrderNumber,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            shipping_address: `${customerStreet}, ${customerCity} ${customerZip}`,
            order_items: `${PRODUCT.name} x${PRODUCT.qty} - ₪${PRODUCT.price}`,
            order_total: total.toFixed(0),
            payment_method: paymentMethod === 'cod' ? 'תשלום במסירה' : 'כרטיס אשראי',
            message_html: fullEmailHtml
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
        ).catch(err => console.error('EmailJS error:', err));
      }

      trackPurchase(currentOrderNumber, total, [{ name: PRODUCT.name, price: PRODUCT.price, qty: PRODUCT.qty }]);
      setIsProcessing(false);
      setPlacedOrderNumber(currentOrderNumber);
      setOrderComplete(true);
    } catch (err) {
      console.error('Order error:', err);
      setIsProcessing(false);
      setOrderError(lang === 'en' ? 'An error occurred while placing your order. Please try again.' : lang === 'he' ? 'אירעה שגיאה בביצוע ההזמנה. אנא נסו שוב.' : 'حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
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
      remove: "Remove",
      maxQty: "Max 5 per product.",
      contactForMore: "Need more? Contact us",
      sendCode: "Send Code",
      sending: "Sending...",
      verified: "Verified",
      verify: "Verify",
      verifying: "Verifying...",
      otpSentTo: "Code sent to",
      resendCode: "Resend Code",
      resendIn: "Resend in",
      changePhone: "Change number",
      otpInvalidCode: "Invalid code. Please try again.",
      otpExpired: "Code expired. Please request a new one.",
      otpTooMany: "Too many attempts. Please try again later.",
      otpInvalidPhone: "Invalid phone number format.",
      otpCaptchaFailed: "Verification failed. Please try again.",
      otpSendFailed: "Failed to send code. Please try again.",
      otpVerifyFailed: "Verification failed. Please try again.",
      emailOptional: "(Optional)",
      emailHelper: "If you provide an email, we'll send you an order confirmation"
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
      remove: "הסר",
      maxQty: "מקסימום 5 ליחידה.",
      contactForMore: "צריך יותר? צור קשר",
      sendCode: "שלח קוד",
      sending: "שולח...",
      verified: "אומת",
      verify: "אמת",
      verifying: "מאמת...",
      otpSentTo: "הקוד נשלח ל",
      resendCode: "שלח שוב",
      resendIn: "שלח שוב בעוד",
      changePhone: "שנה מספר",
      otpInvalidCode: "קוד שגוי. נסה שוב.",
      otpExpired: "הקוד פג תוקף. בקש קוד חדש.",
      otpTooMany: "יותר מדי ניסיונות. נסה שוב מאוחר יותר.",
      otpInvalidPhone: "מספר טלפון לא תקין.",
      otpCaptchaFailed: "האימות נכשל. נסה שוב.",
      otpSendFailed: "שליחת הקוד נכשלה. נסה שוב.",
      otpVerifyFailed: "האימות נכשל. נסה שוב.",
      emailOptional: "(לא חובה)",
      emailHelper: "אם תמלא/י מייל, נשלח לך אישור הזמנה"
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
      remove: "إزالة",
      maxQty: "الحد الأقصى 5 لكل منتج.",
      contactForMore: "تحتاج المزيد؟ تواصل معنا",
      sendCode: "إرسال الرمز",
      sending: "جاري الإرسال...",
      verified: "تم التحقق",
      verify: "تحقق",
      verifying: "جاري التحقق...",
      otpSentTo: "تم إرسال الرمز إلى",
      resendCode: "إعادة إرسال",
      resendIn: "إعادة الإرسال خلال",
      changePhone: "تغيير الرقم",
      otpInvalidCode: "رمز غير صحيح. حاول مرة أخرى.",
      otpExpired: "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
      otpTooMany: "محاولات كثيرة. حاول مرة أخرى لاحقاً.",
      otpInvalidPhone: "صيغة رقم الهاتف غير صحيحة.",
      otpCaptchaFailed: "فشل التحقق. حاول مرة أخرى.",
      otpSendFailed: "فشل إرسال الرمز. حاول مرة أخرى.",
      otpVerifyFailed: "فشل التحقق. حاول مرة أخرى.",
      emailOptional: "(اختياري)",
      emailHelper: "إذا أدخلت بريدك الإلكتروني، سنرسل لك تأكيد الطلب"
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
          <p className="text-orange-500 text-2xl font-mono font-bold">{placedOrderNumber}</p>
        </div>
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
                      <p className="text-white/60 text-sm">{customerName} | {customerPhone}{customerEmail.trim() ? ` | ${customerEmail}` : ''}</p>
                    )}
                    {/* Phone — required, first/most prominent */}
                    <div>
                      <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">{t.phone}</label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          inputMode="tel"
                          value={customerPhone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={`flex-1 bg-white/5 border ${
                            fieldErrors.phone ? 'border-red-500' :
                            phoneVerified ? 'border-green-500' : 'border-white/10'
                          } p-3 text-white outline-none focus:border-orange-500 transition-colors`}
                          placeholder="05X-XXXXXXX"
                          dir="ltr"
                          disabled={phoneVerified}
                        />
                        {!phoneVerified && !otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={customerPhone.length !== 10 || otpLoading}
                            className={`px-3 py-3 font-bold text-xs uppercase tracking-wider whitespace-nowrap ${
                              customerPhone.length === 10 && !otpLoading
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            } transition-colors`}
                          >
                            {otpLoading ? t.sending : t.sendCode}
                          </button>
                        )}
                        {phoneVerified && (
                          <div className="flex items-center gap-2 px-3 bg-green-500/10 border border-green-500/30">
                            <Check size={14} className="text-green-400" />
                            <span className="text-green-400 text-xs font-bold">{t.verified}</span>
                          </div>
                        )}
                      </div>
                      {fieldErrors.phone && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.phone}</p>}
                      {otpError && !otpSent && <p className="text-red-400 text-sm mt-1">{otpError}</p>}
                    </div>

                    {/* OTP Input Section - full width below phone */}
                    {otpSent && !phoneVerified && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="p-4 border border-white/10 bg-white/[0.02] space-y-3"
                      >
                        <p className="text-white/50 text-xs text-center">{t.otpSentTo} <span className="text-orange-500 font-mono" dir="ltr">{customerPhone}</span></p>
                        <div className="flex gap-2 max-w-sm mx-auto">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="flex-1 bg-white/5 border border-white/10 p-3 text-white text-center text-xl tracking-[0.5em] font-mono outline-none focus:border-orange-500"
                            placeholder="000000"
                            maxLength={6}
                            dir="ltr"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otpCode.length !== 6 || otpLoading}
                            className={`px-4 py-3 font-bold text-xs uppercase ${
                              otpCode.length === 6 && !otpLoading
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            } transition-colors`}
                          >
                            {otpLoading ? t.verifying : t.verify}
                          </button>
                        </div>
                        {otpError && <p className="text-red-400 text-sm text-center">{otpError}</p>}
                        <div className="flex items-center justify-center gap-6">
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={resendCooldown > 0 || otpLoading}
                            className={`text-sm ${resendCooldown > 0 ? 'text-white/30' : 'text-orange-500 hover:text-orange-400'}`}
                          >
                            {resendCooldown > 0
                              ? `${t.resendIn} ${resendCooldown}s`
                              : t.resendCode}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode('');
                              setOtpError('');
                            }}
                            className="text-white/30 text-sm hover:text-white/60"
                          >
                            {t.changePhone}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Name — required */}
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

                    {/* Email — optional */}
                    <div>
                      <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">
                        {t.email} <span className="text-white/30 normal-case">{t.emailOptional}</span>
                      </label>
                      <input
                        type="email"
                        inputMode="email"
                        value={customerEmail}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-red-500' : 'border-white/10'} p-3 text-white outline-none focus:border-orange-500 transition-colors`}
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                      {fieldErrors.email && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.email}</p>}
                      <p className="text-white/30 text-xs mt-1.5">{t.emailHelper}</p>
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
                    {/* COD - only available payment method */}
                    <label className="flex items-center gap-4 p-4 border border-orange-500 bg-orange-500/10">
                      <input type="radio" checked readOnly className="w-5 h-5 accent-orange-500" />
                      <Banknote size={24} className="text-orange-500" />
                      <div>
                        <span className="text-white font-medium block">{t.cod}</span>
                        <span className="text-white/50 text-sm">{t.codNote}</span>
                      </div>
                    </label>

                    {/* Credit card coming soon */}
                    <div className="flex items-center gap-4 p-4 border border-white/10 opacity-50">
                      <CreditCard size={24} className="text-white/30" />
                      <div>
                        <span className="text-white/50 font-medium block">{t.card}</span>
                        <span className="text-white/30 text-sm">{lang === 'en' ? 'Coming soon' : lang === 'he' ? 'בקרוב' : 'قريباً'}</span>
                      </div>
                    </div>

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
                  <div className="px-4 md:px-6 pb-6 space-y-3">
                    {orderError && (
                      <p className="text-red-400 text-sm p-3 bg-red-500/10 border border-red-500/20">
                        {orderError}
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
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-zinc-800 overflow-hidden flex-shrink-0">
                  <img src={PRODUCT.img} className="w-full h-full object-cover" alt={PRODUCT.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{PRODUCT.name}</p>
                  <p className="text-white/40 text-xs mt-1">{t.quantity}: {PRODUCT.qty}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">₪{PRODUCT.price.toLocaleString()}</p>
                </div>
              </div>
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
