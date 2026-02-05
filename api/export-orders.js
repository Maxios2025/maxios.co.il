// Firebase REST API - no admin SDK needed
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'maxios-add9e';

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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch orders from Firestore REST API
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders`;
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
    return res.status(500).json({ error: 'Failed to export orders', details: error.message });
  }
}
