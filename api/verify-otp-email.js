// Serverless function to verify email OTP using HMAC (stateless)
const crypto = require('crypto');

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

  const { email, code, hash, expiresAt } = req.body;
  if (!email || !code || !hash || !expiresAt) {
    return res.status(400).json({ error: 'Email, code, hash, and expiresAt are required' });
  }

  // Check if code has expired
  if (Date.now() > expiresAt) {
    return res.status(400).json({ error: 'Code expired', valid: false });
  }

  // Recompute HMAC and compare
  const secret = process.env.OTP_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'OTP service not configured', valid: false });
  }
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(`${email}:${code}:${expiresAt}`)
    .digest('hex');

  if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
    return res.status(200).json({ success: true, valid: true });
  } else {
    return res.status(400).json({ error: 'Invalid code', valid: false });
  }
};
