// Server-side admin authentication — credentials stay in env vars, never exposed to client
const crypto = require('crypto');

// Simple in-memory rate limiter for admin login attempts
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return true;
  if (now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.delete(ip);
    return true;
  }
  return record.count < MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now - record.firstAttempt > LOCKOUT_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  const { email, password } = req.body || {};

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin authentication not configured' });
  }

  // Timing-safe comparison to prevent timing attacks
  const emailMatch = email && typeof email === 'string' && email.length === adminEmail.length &&
    crypto.timingSafeEqual(Buffer.from(email), Buffer.from(adminEmail));
  const passwordMatch = password && typeof password === 'string' && password.length === adminPassword.length &&
    crypto.timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

  if (emailMatch && passwordMatch) {
    return res.status(200).json({
      isAdmin: true,
      name: 'ADMIN COMMANDER'
    });
  }

  recordAttempt(ip);
  return res.status(401).json({ error: 'Invalid credentials', isAdmin: false });
};
