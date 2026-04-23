// CardCom Server-to-Server Webhook Handler
// CardCom calls this URL when a payment is completed (success or failure).
// We verify the result independently via GetLowProfileResult before trusting it.

const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER || '';
const CARDCOM_API_NAME = process.env.CARDCOM_API_NAME || '';
const CARDCOM_API_PASSWORD = process.env.CARDCOM_API_PASSWORD || '';
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || '';

const CARDCOM_BASE_URL = process.env.CARDCOM_SANDBOX === 'true'
  ? 'https://sandbox.cardcom.solutions/api/v11'
  : 'https://secure.cardcom.solutions/api/v11';

// Build Firestore PATCH body for updating specific fields
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
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: buildFirestoreFields(value) } };
    }
  }
  return fields;
}

// Update Firestore document fields via REST API
async function updateFirestoreOrder(orderNumber, updates) {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY || !orderNumber) return;

  const fieldPaths = Object.keys(updates).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(orderNumber)}?key=${FIREBASE_API_KEY}&${fieldPaths}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: buildFirestoreFields(updates) }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Firestore PATCH failed: ${err}`);
  }
}

// Verify payment result directly with CardCom (don't just trust webhook body)
async function getCardComResult(lowProfileCode) {
  const res = await fetch(`${CARDCOM_BASE_URL}/LowProfile/GetLowProfileResult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      TerminalNumber: parseInt(CARDCOM_TERMINAL),
      ApiName: CARDCOM_API_NAME,
      ApiPassword: CARDCOM_API_PASSWORD,
      LowProfileCode: lowProfileCode,
    }),
  });
  return res.json();
}

// Send Telegram notification for completed payment
async function sendTelegramNotification(orderNumber, result, status) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;
  if (!BOT_TOKEN || !ORDERS_CHAT_ID) return;

  const emoji = status === 'paid' ? '✅' : '❌';
  const message = status === 'paid'
    ? `${emoji} PAYMENT RECEIVED!\n\n` +
      `🔢 Order: ${orderNumber}\n` +
      `💳 Card: *${result.Last4Digits || '****'}\n` +
      `👤 Cardholder: ${result.CardOwnerName || 'N/A'}\n` +
      `💰 Amount: ₪${result.FirstPaymentAmount || 'N/A'}\n` +
      `📄 Installments: ${result.NumberOfPayments || 1}\n` +
      `🧾 Invoice: ${result.InvoiceNumber || 'N/A'}\n` +
      `🔑 Transaction: ${result.TranId || 'N/A'}`
    : `${emoji} PAYMENT FAILED\n\n` +
      `🔢 Order: ${orderNumber}\n` +
      `❗ Reason: ${result.Description || 'Unknown'}`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: ORDERS_CHAT_ID, text: message }),
  }).catch(err => console.error('Telegram webhook notify error:', err));
}

export default async function handler(req, res) {
  // Webhook from CardCom — no CORS needed (server-to-server)
  // CardCom sends GET or POST — accept both
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).end();
  }

  // Order number passed as query param when we set up the WebHookUrl
  const orderNumber = req.query?.order || req.body?.OrderId || '';

  // CardCom sends LowProfileCode in webhook body
  const webhookBody = req.body || {};
  const lowProfileCode = webhookBody.LowProfileCode || webhookBody.lowProfileCode || req.query?.LowProfileCode || '';

  if (!lowProfileCode) {
    console.error('Webhook missing LowProfileCode', { query: req.query, body: webhookBody });
    // Return 200 to prevent CardCom from retrying — we can't process without a code
    return res.status(200).json({ received: true, error: 'Missing LowProfileCode' });
  }

  if (!CARDCOM_TERMINAL || !CARDCOM_API_NAME || !CARDCOM_API_PASSWORD) {
    console.error('CardCom credentials not configured — cannot verify webhook');
    return res.status(200).json({ received: true, error: 'Gateway not configured' });
  }

  try {
    // ALWAYS verify independently — never trust the webhook body alone
    const result = await getCardComResult(lowProfileCode);
    const isSuccess = result.ReturnCode === 0 || result.ResponseCode === 0;

    const status = isSuccess ? 'paid' : 'payment_failed';
    const firestoreUpdates = {
      status,
      paymentVerifiedAt: new Date().toISOString(),
      transactionId: String(result.TranId || ''),
      last4Digits: String(result.Last4Digits || ''),
      cardOwnerName: result.CardOwnerName || '',
      invoiceNumber: String(result.InvoiceNumber || ''),
      invoiceType: String(result.InvoiceType || ''),
      cardComReturnCode: result.ReturnCode ?? result.ResponseCode ?? -1,
    };

    // Update Firestore order status
    if (orderNumber) {
      await updateFirestoreOrder(orderNumber, firestoreUpdates).catch(err => {
        console.error('Firestore update failed (non-critical):', err.message);
      });
    }

    // Notify team via Telegram
    await sendTelegramNotification(orderNumber, result, status);

    // CardCom expects 200 OK to stop retrying
    return res.status(200).json({ received: true, status });
  } catch (error) {
    console.error('cardcom-webhook error:', error);
    // Return 200 so CardCom doesn't keep retrying — log the failure
    return res.status(200).json({ received: true, error: 'Processing error — check logs' });
  }
}
