// CardCom GetLowProfileResult — called by the success/failure page to verify payment
// This allows the frontend to confirm payment status without trusting URL parameters alone.

const CARDCOM_TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER || '';
const CARDCOM_API_NAME = process.env.CARDCOM_API_NAME || '';
const CARDCOM_API_PASSWORD = process.env.CARDCOM_API_PASSWORD || '';

const CARDCOM_BASE_URL = process.env.CARDCOM_SANDBOX === 'true'
  ? 'https://sandbox.cardcom.solutions/api/v11'
  : 'https://secure.cardcom.solutions/api/v11';

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000', 'http://localhost:5173'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { lowProfileCode } = req.body || {};
  if (!lowProfileCode) {
    return res.status(400).json({ error: 'Missing lowProfileCode' });
  }

  if (!CARDCOM_TERMINAL || !CARDCOM_API_NAME || !CARDCOM_API_PASSWORD) {
    return res.status(500).json({ error: 'Payment gateway not configured' });
  }

  try {
    const cardcomRes = await fetch(`${CARDCOM_BASE_URL}/LowProfile/GetLowProfileResult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        TerminalNumber: parseInt(CARDCOM_TERMINAL),
        ApiName: CARDCOM_API_NAME,
        ApiPassword: CARDCOM_API_PASSWORD,
        LowProfileCode: lowProfileCode,
      }),
    });

    const data = await cardcomRes.json();

    // Normalize success check — ReturnCode 0 means approved
    const isSuccess = data.ReturnCode === 0 || data.ResponseCode === 0;

    return res.status(200).json({
      success: isSuccess,
      returnCode: data.ReturnCode ?? data.ResponseCode,
      description: data.Description || '',
      transactionId: data.TranId || null,
      last4Digits: data.Last4Digits || null,
      cardOwnerName: data.CardOwnerName || null,
      numberOfPayments: data.NumberOfPayments || 1,
      firstPaymentAmount: data.FirstPaymentAmount || null,
      invoiceNumber: data.InvoiceNumber || null,
      invoiceType: data.InvoiceType || null,
    });
  } catch (error) {
    console.error('get-cardcom-result error:', error);
    return res.status(500).json({ error: 'Failed to verify payment status' });
  }
}
