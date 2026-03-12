// Vercel Serverless Function — Create Cardcom Low Profile payment page

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const terminalNumber = process.env.CARDCOM_TERMINAL_NUMBER;
  const apiName = process.env.CARDCOM_API_NAME;
  const apiPassword = process.env.CARDCOM_API_PASSWORD;

  if (!terminalNumber || !apiName || !apiPassword) {
    return res.status(500).json({ error: 'Cardcom not configured' });
  }

  try {
    const { amount, orderId, customerName, customerEmail, customerPhone, customerCity, customerStreet, customerZip, language } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const siteUrl = process.env.SITE_URL || 'https://maxios.co.il';

    // Map language code for Cardcom (he, en, ar)
    const cardcomLang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'he';

    const params = new URLSearchParams();
    params.append('TerminalNumber', terminalNumber);
    params.append('ApiName', apiName);
    params.append('ApiPassword', apiPassword);
    params.append('Amount', amount.toString());
    params.append('Currency', '1'); // 1 = ILS
    params.append('Operation', '1'); // 1 = Regular charge
    params.append('Language', cardcomLang);
    params.append('ProductName', `Maxios Order #${orderId}`);
    params.append('ReturnValue', orderId);
    params.append('MaxNumOfPayments', '12'); // Allow up to 12 installments
    params.append('SuccessRedirectUrl', `${siteUrl}?payment=success&orderId=${orderId}`);
    params.append('ErrorRedirectUrl', `${siteUrl}?payment=error&orderId=${orderId}`);
    params.append('IndicatorUrl', `${siteUrl}/api/cardcom-webhook?orderId=${orderId}`);
    params.append('IsIFrame', 'true'); // Optimized for iframe display

    // Customer details for invoice
    if (customerName) params.append('InvoiceHead.CustName', customerName);
    if (customerEmail) params.append('InvoiceHead.CustEmail', customerEmail);
    if (customerPhone) params.append('InvoiceHead.CustMobilePH', customerPhone);
    if (customerCity) params.append('InvoiceHead.CustCity', customerCity);
    if (customerStreet) params.append('InvoiceHead.CustAddress', customerStreet);
    if (customerZip) params.append('InvoiceHead.CustZipCode', customerZip);
    if (customerEmail) params.append('InvoiceHead.SendByEmail', 'true');

    // Create tax invoice (101)
    params.append('DocTypeToCreate', '101');

    // Invoice line item
    params.append('InvoiceLines1.Description', `Maxios Order #${orderId}`);
    params.append('InvoiceLines1.Price', amount.toString());
    params.append('InvoiceLines1.Quantity', '1');
    params.append('InvoiceLines1.IsVat', 'true');

    const response = await fetch('https://secure.cardcom.solutions/api/v11/LowProfile/Create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await response.json();

    if (String(data.ResponseCode) === '0') {
      return res.status(200).json({
        url: data.LowProfileUrl,
        lowProfileId: data.LowProfileId,
      });
    } else {
      console.error('Cardcom error:', data);
      return res.status(400).json({
        error: data.Description || 'Failed to create payment page',
        code: data.ResponseCode,
      });
    }
  } catch (error) {
    console.error('Cardcom payment error:', error);
    return res.status(500).json({ error: 'Payment service unavailable' });
  }
}
