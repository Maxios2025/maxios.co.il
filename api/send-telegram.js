export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, data } = req.body;

  const BOT_TOKEN = '8543792815:AAFGUJX2jred2jChv3sIbV5E5MdLpa-I4No';
  const CHAT_ID = '1922953941';

  let message = '';

  if (type === 'order') {
    // Order notification
    const { customerName, customerEmail, customerPhone, address, city, zip, items, total } = data;
    message = `🛒 *NEW ORDER!*\n\n` +
      `👤 *Customer:* ${customerName}\n` +
      `📧 *Email:* ${customerEmail}\n` +
      `📱 *Phone:* ${customerPhone}\n\n` +
      `📍 *Shipping Address:*\n${address}\n${city}, ${zip}\n\n` +
      `📦 *Items:*\n${items}\n\n` +
      `💰 *Total:* ₪${total}`;
  } else if (type === 'contact') {
    // Contact message notification
    const { name, email, phone, message: userMessage } = data;
    message = `💬 *NEW MESSAGE!*\n\n` +
      `👤 *From:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📱 *Phone:* ${phone || 'Not provided'}\n\n` +
      `📝 *Message:*\n${userMessage}`;
  } else if (type === 'ticket') {
    // Support ticket notification
    const { name, email, subject, message: ticketMessage } = data;
    message = `🎫 *NEW SUPPORT TICKET!*\n\n` +
      `👤 *From:* ${name}\n` +
      `📧 *Email:* ${email}\n` +
      `📋 *Subject:* ${subject}\n\n` +
      `📝 *Message:*\n${ticketMessage}`;
  } else {
    // Generic message
    message = data.message || 'New notification from Maxios';
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();

    if (result.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Telegram error:', result);
      return res.status(500).json({ error: 'Failed to send Telegram message' });
    }
  } catch (error) {
    console.error('Error sending Telegram:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}