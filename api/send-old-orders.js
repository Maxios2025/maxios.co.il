const crypto = require('crypto');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';

const BOT_TOKEN = '8622480836:AAGRIr_fWZqVWElrIUEoevrO7p3Us4_e4jA';
const CHAT_ID = '8130470411';

function parseFirestoreDoc(doc) {
  const fields = doc.fields || {};
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

function parseFirestoreValue(value) {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.mapValue) return parseFirestoreDoc(value.mapValue);
  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Admin auth check
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.authorization || '';

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin auth not configured' });
  }

  if (!authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = Buffer.from(authHeader.slice(6), 'base64').toString('utf-8');
    const [email, password] = decoded.split(':');
    const emailMatch = email && email.length === adminEmail.length &&
      crypto.timingSafeEqual(Buffer.from(email), Buffer.from(adminEmail));
    const passwordMatch = password && password.length === adminPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));
    if (!emailMatch || !passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch {
    return res.status(401).json({ error: 'Invalid authentication' });
  }

  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
    return res.status(500).json({ error: 'Firebase not configured' });
  }

  try {
    // Fetch all orders from Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders?key=${FIREBASE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const orders = (data.documents || []).map(doc => parseFirestoreDoc(doc));

    if (orders.length === 0) {
      return res.status(200).json({ success: true, message: 'No orders found', count: 0 });
    }

    // Sort by date
    orders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let sent = 0;
    let failed = 0;

    for (const order of orders) {
      const customerName = order.customer?.name || 'N/A';
      const customerEmail = order.customer?.email || 'N/A';
      const customerPhone = order.customer?.phone || 'N/A';
      const address = order.customer?.street || order.customer?.address || 'N/A';
      const city = order.customer?.city || 'N/A';
      const zip = order.customer?.zip || '';
      const orderNumber = order.orderNumber || 'N/A';
      const total = order.total || 'N/A';
      const subtotal = order.subtotal || '';
      const discount = order.discount || '0';
      const promoCode = order.promoCode || '';
      const paymentMethod = order.paymentMethod || 'N/A';
      const status = order.status || 'N/A';
      const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : 'N/A';

      let items = '';
      if (order.items && Array.isArray(order.items)) {
        items = order.items.map(item => `• ${item.name || 'Product'} x${item.qty || item.quantity || 1} - ₪${item.price || ''}`).join('\n');
      } else {
        items = 'N/A';
      }

      const tradeInLine = order.tradeIn ? `\n🔄 Trade-In: -₪${order.tradeInDiscount || '400'}` : '';
      const promoLine = promoCode ? `\n🏷️ Promo: ${promoCode} (-₪${discount})` : '';

      const message = `📋 ORDER RECORD\n\n` +
        `🔢 Order: ${orderNumber}\n` +
        `📅 Date: ${date}\n` +
        `📊 Status: ${status}\n\n` +
        `👤 Customer: ${customerName}\n` +
        `📧 Email: ${customerEmail}\n` +
        `📱 Phone: ${customerPhone}\n\n` +
        `📍 Address:\n${address}\n${city}${zip ? ', ' + zip : ''}\n\n` +
        `📦 Items:\n${items}${tradeInLine}${promoLine}\n\n` +
        `💰 Total: ₪${total}\n` +
        `💳 Payment: ${paymentMethod}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message })
        });
        const tgResult = await tgRes.json();
        if (tgResult.ok) {
          sent++;
        } else {
          console.error(`Telegram error for ${orderNumber}:`, tgResult);
          failed++;
        }
        // Delay to avoid Telegram rate limits (max ~30 msgs/sec)
        await new Promise(r => setTimeout(r, 200));
      } catch (err) {
        console.error(`Failed to send order ${orderNumber}:`, err);
        failed++;
      }
    }

    return res.status(200).json({ success: true, sent, failed, total: orders.length });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders', details: error.message });
  }
}
