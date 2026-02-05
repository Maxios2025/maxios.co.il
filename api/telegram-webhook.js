// Firebase REST API - no admin SDK needed
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'maxios-add9e';

const BOT_TOKEN = '8543792815:AAFGUJX2jred2jChv3sIbV5E5MdLpa-I4No';
const ORDERS_CHAT_ID = '-5107622756';

// Generate CSV content from orders
function generateCSV(orders) {
  const headers = [
    'Order Number',
    'Date',
    'Customer Name',
    'Email',
    'Phone',
    'City',
    'Street',
    'Zip',
    'Items',
    'Subtotal',
    'Discount',
    'Promo Code',
    'Total',
    'Payment Method',
    'Status'
  ];

  const rows = orders.map(order => [
    order.orderNumber || '',
    order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL') : '',
    order.customer?.name || '',
    order.customer?.email || '',
    order.customer?.phone || '',
    order.customer?.city || '',
    order.customer?.street || '',
    order.customer?.zip || '',
    (order.items || []).map(item => `${item.name} x${item.qty}`).join('; '),
    order.subtotal || '',
    order.discount || '0',
    order.promoCode || '',
    order.total || '',
    order.paymentMethod || '',
    order.status || ''
  ]);

  const escapeCSV = (value) => {
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  return '\uFEFF' + csvContent;
}

// Parse Firestore document to regular object
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

// Send text message
async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// Send document using multipart form data
async function sendDocument(chatId, csvContent, filename) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;

  // Create multipart form data manually
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="chat_id"\r\n\r\n`,
    `${chatId}\r\n`,
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n`,
    `Content-Type: text/csv\r\n\r\n`,
    csvContent,
    `\r\n--${boundary}\r\n`,
    `Content-Disposition: form-data; name="caption"\r\n\r\n`,
    `📊 Orders Export - ${new Date().toLocaleDateString('he-IL')}\r\n`,
    `--${boundary}--\r\n`
  ];

  const body = bodyParts.join('');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: body
  });

  return response.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';

      // Handle /orders command
      if (text === '/orders' || text.startsWith('/orders@')) {
        // Only allow from orders group
        if (String(chatId) !== ORDERS_CHAT_ID) {
          await sendMessage(chatId, '❌ This command is only available in the orders group.');
          return res.status(200).json({ ok: true });
        }

        await sendMessage(chatId, '⏳ Generating orders export...');

        // Fetch orders from Firestore REST API
        const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders`;
        const response = await fetch(url);
        const data = await response.json();

        const orders = (data.documents || []).map(doc => parseFirestoreDoc(doc));

        if (orders.length === 0) {
          await sendMessage(chatId, '📭 No orders found.');
          return res.status(200).json({ ok: true });
        }

        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Generate CSV
        const csv = generateCSV(orders);
        const filename = `maxios_orders_${new Date().toISOString().split('T')[0]}.csv`;

        // Send the file
        const result = await sendDocument(chatId, csv, filename);

        if (!result.ok) {
          console.error('Failed to send document:', result);
          await sendMessage(chatId, `✅ Export ready! ${orders.length} orders found.\n\n📥 Download: https://maxios.co.il/api/export-orders`);
        }

        return res.status(200).json({ ok: true });
      }

      // Handle /help command
      if (text === '/help' || text.startsWith('/help@')) {
        await sendMessage(chatId,
          '📋 Available Commands:\n\n' +
          '/orders - Export all orders to CSV file\n' +
          '/help - Show this help message'
        );
        return res.status(200).json({ ok: true });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true, error: error.message });
  }
}
