// Firebase REST API - credentials from environment variables only (no hardcoded fallbacks)
const crypto = require('crypto');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';

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

  // Escape CSV values
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

  // Add BOM for Excel Hebrew support
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

export default async function handler(req, res) {
  // CORS — restrict to known origins
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authentication: require admin credentials via Basic auth
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authHeader = req.headers.authorization || '';

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin authentication not configured' });
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
    // Fetch orders from Firestore REST API with API key
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders?key=${FIREBASE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    const orders = (data.documents || []).map(doc => parseFirestoreDoc(doc));

    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Generate CSV
    const csv = generateCSV(orders);

    // Set headers for file download
    const filename = `maxios_orders_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting orders:', error);
    return res.status(500).json({ error: 'Failed to export orders' });
  }
}
