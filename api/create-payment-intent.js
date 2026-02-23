// Vercel Serverless Function for Stripe Payment Intent

export default async function handler(req, res) {
  // CORS — restrict to known origins
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const { amount, currency = 'ils', metadata = {} } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid amount. Minimum is 50 cents.' });
    }

    // Use fetch directly to Stripe API
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount).toString(),
        currency: currency,
        'automatic_payment_methods[enabled]': 'true',
        'metadata[source]': 'maxios_store',
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Payment failed' });
    }

    res.status(200).json({
      clientSecret: data.client_secret,
      paymentIntentId: data.id
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing failed. Please try again.' });
  }
}
