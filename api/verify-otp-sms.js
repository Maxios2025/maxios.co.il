// Serverless function to verify OTP using HMAC (stateless, no database needed)
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

  const { phone, code, hash, expiresAt } = req.body;
  if (!phone || !code || !hash || !expiresAt) {
    return res.status(400).json({ error: 'Phone, code, hash, and expiresAt are required' });
  }

  // Check if code has expired
  if (Date.now() > expiresAt) {
    return res.status(400).json({ error: 'Code expired', valid: false });
  }

  const phoneNumber = toE164(phone);

  // Recompute HMAC and compare
  const secret = process.env.OTP_SECRET || 'maxios-otp-secret-2026';
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${phoneNumber}:${code}:${expiresAt}`)
    .digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
    return res.status(200).json({ success: true, valid: true });
  } else {
    return res.status(400).json({ error: 'Invalid code', valid: false });
  }
};
