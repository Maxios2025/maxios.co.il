// CardCom Low Profile Payment Creation
// Creates a hosted payment page and returns the URL to redirect the user to.
// CardCom docs: https://kb.cardcom.solutions/

const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER || '';
const CARDCOM_API_NAME = process.env.CARDCOM_API_NAME || '';
const CARDCOM_API_PASSWORD = process.env.CARDCOM_API_PASSWORD || '';
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || '';

// Sandbox vs production
const CARDCOM_BASE_URL = process.env.CARDCOM_SANDBOX === 'true'
  ? 'https://sandbox.cardcom.solutions/api/v11'
  : 'https://secure.cardcom.solutions/api/v11';

const SITE_URL = process.env.SITE_URL || 'https://maxios.co.il';

// Convert a flat/nested JS object to Firestore REST fields format
function buildFirestoreFields(obj) {
  const fields = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (Number.isInteger(value)) {
      fields[key] = { integerValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item =>
            typeof item === 'object' && item !== null
              ? { mapValue: { fields: buildFirestoreFields(item) } }
              : { stringValue: String(item) }
          )
        }
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: buildFirestoreFields(value) } };
    }
  }
  return fields;
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!CARDCOM_TERMINAL || !CARDCOM_API_NAME || !CARDCOM_API_PASSWORD) {
    console.error('CardCom credentials not configured');
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  const {
    orderNumber,
    amount,
    installments = 1,
    customer = {},
    address = {},
    items = [],
    subtotal,
    discount,
    promoCode,
    total
  } = req.body || {};

  // Basic validation
  if (!orderNumber || !amount || !customer.name || !customer.phone) {
    return res.status(400).json({ error: 'Missing required fields: orderNumber, amount, customer.name, customer.phone' });
  }

  const maxPayments = Math.min(Math.max(parseInt(installments) || 1, 1), 12);

  // Build product description
  const productName = items.length > 0
    ? items.map(i => `${i.name} x${i.qty}`).join(', ')
    : 'MAXIOS PRO-18';

  // CardCom CreateLowProfile payload
  const cardcomPayload = {
    TerminalNumber: parseInt(CARDCOM_TERMINAL),
    ApiName: CARDCOM_API_NAME,
    ApiPassword: CARDCOM_API_PASSWORD,
    ReturnUrl: `${SITE_URL}/payment-success?order=${encodeURIComponent(orderNumber)}`,
    SuccessRedirectUrl: `${SITE_URL}/payment-success?order=${encodeURIComponent(orderNumber)}`,
    ErrorRedirectUrl: `${SITE_URL}/payment-failed?order=${encodeURIComponent(orderNumber)}`,
    WebHookUrl: `${SITE_URL}/api/cardcom-webhook?order=${encodeURIComponent(orderNumber)}`,
    Amount: parseFloat(amount),
    CoinID: 1, // 1 = ILS
    MaxPayments: maxPayments,
    ProductName: productName,
    Customer: {
      Name: customer.name,
      Email: customer.email || '',
      Phone: customer.phone,
    },
    Lines: items.map(item => ({
      Description: item.name,
      Quantity: parseInt(item.qty) || 1,
      Price: parseFloat(item.price) / (parseInt(item.qty) || 1),
      IsTaxFree: false,
    })),
  };

  // Add invoice (document) generation if customer has email
  if (customer.email) {
    cardcomPayload.Document = {
      To: customer.name,
      Email: customer.email,
      Send: true,
      DocumentType: 320, // 320 = Tax Invoice (חשבונית מס)
    };
  }

  try {
    // Call CardCom API to create payment page
    const cardcomRes = await fetch(`${CARDCOM_BASE_URL}/LowProfile/Create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cardcomPayload),
    });

    let cardcomData;
    try {
      cardcomData = await cardcomRes.json();
    } catch {
      return res.status(502).json({ error: 'Invalid response from payment gateway' });
    }

    // CardCom returns ResponseCode 0 (or ReturnCode 0) for success
    const responseCode = cardcomData.ResponseCode ?? cardcomData.ReturnCode ?? cardcomData.returnCode ?? -1;
    console.log('CardCom full response:', JSON.stringify(cardcomData));

    if (responseCode !== 0) {
      console.error('CardCom API error:', cardcomData);
      return res.status(502).json({
        error: 'Payment gateway rejected the request',
        details: cardcomData.Description || cardcomData.Message || cardcomData.ErrorMessage || 'Unknown error',
        code: responseCode,
        raw: cardcomData, // full response for debugging
      });
    }

    const LowProfileCode = cardcomData.LowProfileCode || cardcomData.LowProfileId || cardcomData.Code;
    const paymentUrl = cardcomData.URL || cardcomData.Url || cardcomData.PaymentUrl;

    if (!paymentUrl) {
      return res.status(502).json({ error: 'Payment gateway did not return a payment URL', raw: cardcomData });
    }

    // Optionally pre-save order to Firestore (server-side, best-effort)
    // The client also saves it via the Firebase SDK — this is a backup
    if (FIREBASE_PROJECT_ID && FIREBASE_API_KEY) {
      const orderRecord = {
        orderNumber,
        customer: {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          city: address.city || '',
          street: address.street || '',
          zip: address.zip || '',
        },
        items,
        subtotal: String(subtotal || amount),
        discount: String(discount || 0),
        promoCode: promoCode || '',
        total: String(total || amount),
        paymentMethod: `credit_card`,
        installments: maxPayments,
        status: 'pending_payment',
        lowProfileCode: LowProfileCode,
        createdAt: new Date().toISOString(),
      };

      // Best-effort — don't block the response if this fails
      fetch(
        `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders?documentId=${encodeURIComponent(orderNumber)}&key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: buildFirestoreFields(orderRecord) }),
        }
      ).catch(err => console.error('Firestore pre-save failed (non-critical):', err.message));
    }

    return res.status(200).json({
      url: paymentUrl,
      lowProfileCode: LowProfileCode,
      orderNumber,
    });
  } catch (error) {
    console.error('create-cardcom-payment error:', error);
    return res.status(500).json({ error: 'Failed to create payment session. Please try again.' });
  }
}
