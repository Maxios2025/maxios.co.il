// Google Sheets Web App URL for storing orders
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwsiVY5vJ67lcVhEnYSY31-_h-3ASASvM9WBbQjBmJZQ7Lo0JYc7O-SlAiYXGgv6ZO4/exec';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', received_method: req.method });
  }

  const { type, data } = req.body || {};

  // Log what we received
  console.log('Telegram API received:', { type, hasData: !!data });

  // Check if we have the required data
  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data', received: { type, data } });
  }

  const BOT_TOKEN = '8543792815:AAFGUJX2jred2jChv3sIbV5E5MdLpa-I4No';

  // Different chat IDs for different notification types
  const ORDERS_CHAT_ID = '-5107622756';    // Maxios orders group
  const SUPPORT_CHAT_ID = '-5192023854';   // maxios support group

  let message = '';

  if (type === 'order') {
    // Order notification - plain text (no markdown)
    const orderNumber = data.orderNumber || 'N/A';
    const customerName = data.customerName || '';
    const customerEmail = data.customerEmail || '';
    const customerPhone = data.customerPhone || '';
    const address = data.address || '';
    const city = data.city || '';
    const zip = data.zip || '';
    const items = data.items || '';
    const total = data.total || '';
    const paymentMethod = data.paymentMethod || 'Not specified';
    const date = new Date().toLocaleDateString('he-IL');

    message = `🛒 NEW ORDER!\n\n` +
      `🔢 Order Number: ${orderNumber}\n\n` +
      `👤 Customer: ${customerName}\n` +
      `📧 Email: ${customerEmail}\n` +
      `📱 Phone: ${customerPhone}\n\n` +
      `📍 Shipping Address:\n${address}\n${city}, ${zip}\n\n` +
      `📦 Items:\n${items}\n\n` +
      `💰 Total: ₪${total}\n\n` +
      `💳 Payment: ${paymentMethod}`;

    // Create CSV for this order
    const csvHeaders = 'Order Number,Date,Customer Name,Email,Phone,City,Street,Zip,Items,Total,Payment Method';
    const escapeCSV = (val) => {
      const str = String(val || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const csvRow = [
      orderNumber,
      date,
      customerName,
      customerEmail,
      customerPhone,
      city,
      address,
      zip,
      items.replace(/\n/g, '; '),
      total,
      paymentMethod.replace(/[💵💳]/g, '').trim()
    ].map(escapeCSV).join(',');

    const csvContent = '\uFEFF' + csvHeaders + '\n' + csvRow;

    // Send message first
    const chatId = ORDERS_CHAT_ID;
    try {
      // Send text message
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message })
      });

      // Send CSV file
      const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
      const filename = `order_${orderNumber}.csv`;

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
        `📊 Order ${orderNumber} - ${date}\r\n`,
        `--${boundary}--\r\n`
      ];

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
        body: bodyParts.join('')
      });

      // Save order to Google Sheets
      try {
        await fetch(GOOGLE_SHEETS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            city,
            address,
            zip,
            items: items.replace(/\n/g, '; '),
            total,
            paymentMethod: paymentMethod.replace(/[💵💳]/g, '').trim()
          })
        });
        console.log('Order saved to Google Sheets');
      } catch (sheetError) {
        console.error('Failed to save to Google Sheets:', sheetError);
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error sending order:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (type === 'contact') {
    // Contact message notification - plain text
    const name = data.name || '';
    const email = data.email || '';
    const phone = data.phone || 'Not provided';
    const userMessage = data.message || '';
    message = `💬 NEW MESSAGE!\n\n` +
      `👤 From: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📱 Phone: ${phone}\n\n` +
      `📝 Message:\n${userMessage}`;
  } else if (type === 'ticket') {
    // Support ticket notification - plain text
    const name = data.name || '';
    const email = data.email || '';
    const subject = data.subject || '';
    const ticketMessage = data.message || '';
    message = `🎫 NEW SUPPORT TICKET!\n\n` +
      `👤 From: ${name}\n` +
      `📧 Email: ${email}\n` +
      `📋 Subject: ${subject}\n\n` +
      `📝 Message:\n${ticketMessage}`;
  } else {
    // Generic message
    message = data.message || 'New notification from Maxios';
  }

  // Choose chat ID based on notification type
  const chatId = (type === 'order') ? ORDERS_CHAT_ID : SUPPORT_CHAT_ID;

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Telegram error:', result);
      return res.status(500).json({
        error: 'Failed to send Telegram message',
        telegram_error: result,
        debug: { type, chatId }
      });
    }
  } catch (error) {
    console.error('Error sending Telegram:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}