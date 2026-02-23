// Serverless function to send OTP via EmailJS REST API + HMAC verification
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

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate 6-digit OTP
  const code = crypto.randomInt(100000, 999999).toString();

  // Expiry: 5 minutes from now
  const expiresAt = Date.now() + 5 * 60 * 1000;

  // Create HMAC hash of email+code+expiry for stateless verification
  const secret = process.env.OTP_SECRET || 'maxios-otp-secret-2026';
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${email}:${code}:${expiresAt}`)
    .digest('hex');

  try {
    // Send OTP email via EmailJS REST API
    const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID || 'service_9sh4kyv',
        template_id: process.env.EMAILJS_OTP_TEMPLATE_ID || 'template_otp',
        user_id: process.env.EMAILJS_PUBLIC_KEY || '_jL_0gQsRkGzlKdZw',
        template_params: {
          to_email: email,
          otp_code: code,
          from_name: 'Maxios',
        },
      }),
    });

    if (!emailjsRes.ok) {
      const errText = await emailjsRes.text();
      console.error('EmailJS error:', errText);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, hash, expiresAt });
  } catch (error) {
    console.error('Send OTP email error:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};
