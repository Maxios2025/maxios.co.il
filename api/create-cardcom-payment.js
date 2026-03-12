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

    const successUrl = `${siteUrl}?payment=success&orderId=${orderId}`;
    const errorUrl = `${siteUrl}?payment=error&orderId=${orderId}`;
    const indicatorUrl = `${siteUrl}/api/cardcom-webhook?orderId=${orderId}`;

    const bodyObj = {
      TerminalNumber: parseInt(terminalNumber),
      ApiName: apiName,
      ApiPassword: apiPassword,
      Amount: amount,
      Currency: 1, // 1 = ILS
      Operation: 1, // 1 = Regular charge
      Language: cardcomLang,
      ProductName: `Maxios Order #${orderId}`,
      ReturnValue: orderId,
      MaxNumOfPayments: 12,
      SuccessRedirectUrl: successUrl,
      ErrorRedirectUrl: errorUrl,
      IndicatorUrl: indicatorUrl,
      IsIFrame: true,
    };

    // Customer details for invoice
    const invoiceHead = {};
    if (customerName) invoiceHead.CustName = customerName;
    if (customerEmail) invoiceHead.CustEmail = customerEmail;
    if (customerPhone) invoiceHead.CustMobilePH = customerPhone;
    if (customerCity) invoiceHead.CustCity = customerCity;
    if (customerStreet) invoiceHead.CustAddress = customerStreet;
    if (customerZip) invoiceHead.CustZipCode = customerZip;
    if (customerEmail) invoiceHead.SendByEmail = true;
    bodyObj.InvoiceHead = invoiceHead;

    // Create tax invoice (101)
    bodyObj.DocTypeToCreate = 101;

    // Invoice line item
    bodyObj.InvoiceLines = [{
      Description: `Maxios Order #${orderId}`,
      Price: amount,
      Quantity: 1,
      IsVat: true,
    }];

    const response = await fetch('https://secure.cardcom.solutions/api/v11/LowProfile/Create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj),
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
