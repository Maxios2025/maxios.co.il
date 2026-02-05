// Google Sheets Web App URL for fetching orders
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyxHAEcIPe-5tHvKIEBr6j6Bl18aM9XfItJ5HhBHnhpPsSQek5H_R_ERq2wE3iXzP0X/exec';

const BOT_TOKEN = '8543792815:AAFGUJX2jred2jChv3sIbV5E5MdLpa-I4No';
const ORDERS_CHAT_ID = '-5107622756';

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

  // Add BOM for Excel Hebrew support
  const csvWithBOM = '\uFEFF' + csvContent;

  const bodyParts = [
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="chat_id"\r\n\r\n`,
    `${chatId}\r\n`,
    `--${boundary}\r\n`,
    `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n`,
    `Content-Type: text/csv\r\n\r\n`,
    csvWithBOM,
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

        await sendMessage(chatId, '⏳ Fetching orders from Google Sheets...');

        // Fetch CSV directly from Google Sheets
        const response = await fetch(GOOGLE_SHEETS_URL);
        const csvContent = await response.text();

        // Check if we got data
        const lines = csvContent.trim().split('\n');
        if (lines.length <= 1) {
          await sendMessage(chatId, '📭 No orders found in Google Sheets yet.');
          return res.status(200).json({ ok: true });
        }

        const orderCount = lines.length - 1; // Subtract header row
        const filename = `maxios_orders_${new Date().toISOString().split('T')[0]}.csv`;

        // Send the file
        const result = await sendDocument(chatId, csvContent, filename);

        if (!result.ok) {
          console.error('Failed to send document:', result);
          await sendMessage(chatId, `❌ Failed to send file. Error: ${JSON.stringify(result)}`);
        } else {
          await sendMessage(chatId, `✅ Export complete! ${orderCount} orders exported.`);
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