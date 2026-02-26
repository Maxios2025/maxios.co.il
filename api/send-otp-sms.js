// Serverless function to send OTP via BulkGate SMS + HMAC verification
const crypto = require('crypto');

function toE164(localPhone) {
  const digits = localPhone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  if (digits.startsWith('972')) return digits;
  return '972' + digits;
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000', 'http://localhost:3001'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const phoneNumber = toE164(phone);

  // Generate 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();

  // Expiry: 5 minutes from now
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Create HMAC hash of phone+code+expiry for stateless verification
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'OTP service not configured' });
  }
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${phoneNumber}:${code}:${expiresAt}`)
    .digest('hex');

  try {
    // Send SMS via BulkGate HTTP Simple API
    const bgRes = await fetch('https://portal.bulkgate.com/api/1.0/simple/transactional', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: process.env.BULKGATE_APP_ID,
        application_token: process.env.BULKGATE_APP_TOKEN,
        number: phoneNumber,
        text: `Your Maxios verification code is: ${code}. Valid for 5 minutes.`,
        unicode: true,
        sender_id: 'gSystem',
        sender_id_value: '',
      }),
    });

    const bgData = await bgRes.json();

    if (bgData.data && bgData.data.status === 'accepted') {
      return res.status(200).json({ success: true, hash, expiresAt });
    } else {
      console.error('BulkGate error:', bgData);
      return res.status(500).json({ error: 'Failed to send SMS', details: bgData });
    }
  } catch (error) {
    console.error('Send OTP SMS error:', error);
    return res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message,
    });
  }
};
