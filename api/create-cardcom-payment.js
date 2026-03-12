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

    const siteUrl = 'https://maxios.co.il';

    // Map language code for Cardcom (he, en, ar)
    const cardcomLang = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'he';

    const params = new URLSearchParams();
    params.append('TerminalNumber', terminalNumber);
    params.append('ApiName', apiName);
    params.append('ApiPassword', apiPassword);
    params.append('SumToBill', amount.toString());
    params.append('CoinID', '1'); // 1 = ILS
    params.append('Operation', '1'); // 1 = Regular charge
    params.append('Language', cardcomLang);
    params.append('ProductName', `Maxios Order #${orderId || 'N/A'}`);
    params.append('ReturnValue', orderId || '');
    params.append('MaxNumOfPayments', '12');
    params.append('SuccessRedirectUrl', `${siteUrl}?payment=success&orderId=${orderId}`);
    params.append('ErrorRedirectUrl', `${siteUrl}?payment=error&orderId=${orderId}`);
    params.append('IndicatorUrl', `${siteUrl}/api/cardcom-webhook?orderId=${orderId}`);
    params.append('IsIFrame', 'true');

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
    params.append('InvoiceLines1.Description', `Maxios Order #${orderId || 'N/A'}`);
    params.append('InvoiceLines1.Price', amount.toString());
    params.append('InvoiceLines1.Quantity', '1');
    params.append('InvoiceLines1.IsVat', 'true');

    console.log('Cardcom request params:', Object.fromEntries(params.entries()));

    const response = await fetch('https://secure.cardcom.solutions/Interface/LowProfile.aspx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await response.text();
    console.log('Cardcom raw response:', text);

    // Parse the response (Cardcom returns URL-encoded key=value pairs)
    const result = {};
    text.split('&').forEach(pair => {
      const [key, ...vals] = pair.split('=');
      result[decodeURIComponent(key)] = decodeURIComponent(vals.join('='));
    });

    if (result.ResponseCode === '0') {
      return res.status(200).json({
        url: result.url,
        lowProfileId: result.lowprofilecode,
      });
    } else {
      console.error('Cardcom error:', result);
      return res.status(400).json({
        error: result.Description || 'Failed to create payment page',
        code: result.ResponseCode,
      });
    }
  } catch (error) {
    console.error('Cardcom payment error:', error);
    return res.status(500).json({ error: 'Payment service unavailable' });
  }
}
