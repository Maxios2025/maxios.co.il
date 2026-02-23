// Server-side admin authentication — credentials stay in env vars, never exposed to client
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

  const { email, password } = req.body || {};

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ error: 'Admin authentication not configured' });
  }

  if (email === adminEmail && password === adminPassword) {
    return res.status(200).json({
      isAdmin: true,
      name: 'ADMIN COMMANDER',
      email: adminEmail
    });
  }

  return res.status(401).json({ error: 'Invalid credentials', isAdmin: false });
};