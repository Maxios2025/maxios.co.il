// Vercel Serverless Function — Cardcom payment webhook (IndicatorUrl callback)
// Cardcom calls this URL server-to-server after payment completes

export default async function handler(req, res) {
  // Cardcom may send GET or POST
  const params = req.method === 'GET' ? req.query : { ...req.query, ...req.body };

  const {
    lowprofileid,
    ResponseCode,
    ReturnValue,
    orderId,
  } = params;

  const orderRef = ReturnValue || orderId || 'unknown';

  // Only process successful payments
  if (String(ResponseCode) !== '0') {
    console.log(`Cardcom webhook: payment failed for order ${orderRef}, code: ${ResponseCode}`);
    return res.status(200).send('OK');
  }

  const terminalNumber = process.env.CARDCOM_TERMINAL_NUMBER;
  const apiName = process.env.CARDCOM_API_NAME;
  const apiPassword = process.env.CARDCOM_API_PASSWORD;

  if (!terminalNumber || !apiName || !apiPassword) {
    console.error('Cardcom webhook: missing credentials');
    return res.status(200).send('OK');
  }

  try {
    // Verify the payment by calling Cardcom's GetLowProfileIndicator
    const verifyParams = new URLSearchParams();
    verifyParams.append('TerminalNumber', terminalNumber);
    verifyParams.append('ApiName', apiName);
    verifyParams.append('ApiPassword', apiPassword);
    verifyParams.append('LowProfileId', lowprofileid || '');

    const verifyResponse = await fetch(
      'https://secure.cardcom.solutions/api/v11/LowProfile/GetLowProfileIndicator',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyParams.toString(),
      }
    );

    const verifyData = await verifyResponse.json();

    if (String(verifyData.ResponseCode) === '0') {
      console.log(`Cardcom webhook: payment VERIFIED for order ${orderRef}`, {
        dealNumber: verifyData.InternalDealNumber,
        last4: verifyData.Last4Digits,
        amount: verifyData.Amount,
      });

      // Send Telegram notification about successful card payment
      const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      const ORDERS_CHAT_ID = process.env.TELEGRAM_ORDERS_CHAT_ID;

      if (BOT_TOKEN && ORDERS_CHAT_ID) {
        const message = `💳 CARD PAYMENT CONFIRMED!\n\n` +
          `🔢 Order: ${orderRef}\n` +
          `💰 Amount: ₪${verifyData.Amount || 'N/A'}\n` +
          `🔒 Card: **** ${verifyData.Last4Digits || 'N/A'}\n` +
          `📋 Deal #: ${verifyData.InternalDealNumber || 'N/A'}\n\n` +
          `✅ Payment verified by Cardcom`;

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ORDERS_CHAT_ID, text: message }),
        }).catch(err => console.error('Telegram notify error:', err));
      }
    } else {
      console.error(`Cardcom webhook: verification FAILED for order ${orderRef}`, verifyData);
    }
  } catch (error) {
    console.error('Cardcom webhook error:', error);
  }

  // Cardcom expects a 200 response
  return res.status(200).send('OK');
}
