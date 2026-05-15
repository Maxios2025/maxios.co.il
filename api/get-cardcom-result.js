// CardCom GetLowProfileResult — called by the success/failure page to verify payment
// This allows the frontend to confirm payment status without trusting URL parameters alone.

const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER || '';
const CARDCOM_API_NAME = process.env.CARDCOM_API_NAME || '';
const CARDCOM_API_PASSWORD = process.env.CARDCOM_API_PASSWORD || '';
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || '';

const CARDCOM_BASE_URL = process.env.CARDCOM_SANDBOX === 'true'
  ? 'https://sandbox.cardcom.solutions/api/v11'
  : 'https://secure.cardcom.solutions/api/v11';

const CARD_TYPE_NAMES = {
  1: 'Visa', 2: 'Mastercard', 3: 'Amex', 4: 'Diners',
  5: 'Discover', 6: 'JCB', 7: 'Maestro', 8: 'Unionpay',
};

async function getFirestoreOrder(orderNumber) {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY || !orderNumber) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(orderNumber)}?key=${FIREBASE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const doc = await res.json();
    const f = doc.fields || {};
    const customer = f.customer?.mapValue?.fields || {};
    return {
      lowProfileCode: f.lowProfileCode?.stringValue || null,
      name: customer.name?.stringValue || null,
      phone: customer.phone?.stringValue || null,
      city: customer.city?.stringValue || null,
      street: customer.street?.stringValue || null,
      zip: customer.zip?.stringValue || null,
    };
  } catch {
    return null;
  }
}

async function sendTelegramNotification(orderNumber, data) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;
  if (!BOT_TOKEN || !ORDERS_CHAT_ID) return;

  const cardBrand = CARD_TYPE_NAMES[data.CardType] || data.CardBrand || data.CardTypeName || 'Card';
  const message =
    `✅ PAYMENT RECEIVED!\n\n` +
    `🔢 Order: ${orderNumber}\n` +
    `💳 ${cardBrand} *${data.Last4Digits || '****'}\n` +
    `👤 Cardholder: ${data.CardOwnerName || 'N/A'}\n` +
    `💰 Amount: ₪${data.FirstPaymentAmount || 'N/A'}\n` +
    `📄 Installments: ${data.NumberOfPayments || 1}\n` +
    `🧾 Invoice: ${data.InvoiceNumber || 'N/A'}\n` +
    `🔑 Transaction: ${data.TranId || 'N/A'}`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ORDERS_CHAT_ID, text: message }),
  }).catch(err => console.error('Telegram notify error (get-cardcom-result):', err));
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let { lowProfileCode, orderNumber } = req.body || {};

  // Fetch order from Firestore once — used for lowProfileCode lookup AND customer info
  let firestoreOrder = null;
  if (orderNumber) {
    firestoreOrder = await getFirestoreOrder(orderNumber);
  }

  // If no lowProfileCode from URL, use the one saved when the payment was created
  if (!lowProfileCode) {
    lowProfileCode = firestoreOrder?.lowProfileCode || null;
  }

  if (!lowProfileCode) {
    return res.status(400).json({ error: 'Missing lowProfileCode' });
  }

  if (!CARDCOM_TERMINAL || !CARDCOM_API_NAME || !CARDCOM_API_PASSWORD) {
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  try {
    const cardcomRes = await fetch(`${CARDCOM_BASE_URL}/LowProfile/GetLowProfileResult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TerminalNumber: parseInt(CARDCOM_TERMINAL),
        ApiName: CARDCOM_API_NAME,
        ApiPassword: CARDCOM_API_PASSWORD,
        LowProfileCode: lowProfileCode,
      }),
    });

    const data = await cardcomRes.json();

    // Normalize success check — use Number() to handle string "0" from CardCom
    const isSuccess = Number(data.ReturnCode) === 0 || Number(data.ResponseCode) === 0;

    // Send Telegram notification as backup (webhook may not always fire)
    if (isSuccess && orderNumber) {
      await sendTelegramNotification(orderNumber, data);
    }

    const customer = firestoreOrder;

    return res.status(200).json({
      success: isSuccess,
      returnCode: data.ReturnCode ?? data.ResponseCode,
      description: data.Description || '',
      transactionId: data.TranId || null,
      last4Digits: data.Last4Digits || null,
      cardOwnerName: data.CardOwnerName || null,
      numberOfPayments: data.NumberOfPayments || 1,
      firstPaymentAmount: data.FirstPaymentAmount || null,
      invoiceNumber: data.InvoiceNumber || null,
      invoiceType: data.InvoiceType || null,
      customerName: customer?.name || null,
      customerPhone: customer?.phone || null,
      customerCity: customer?.city || null,
      customerStreet: customer?.street || null,
      customerZip: customer?.zip || null,
    });
  } catch (error) {
    console.error('get-cardcom-result error:', error);
    return res.status(500).json({ error: 'Failed to verify payment status' });
  }
}
