// Temporary test endpoint — DELETE after debugging
// Call: GET /api/test-cardcom

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const terminalNumber = process.env.CARDCOM_TERMINAL_NUMBER;
  const apiName = process.env.CARDCOM_API_NAME;
  const apiPassword = process.env.CARDCOM_API_PASSWORD;

  if (!terminalNumber || !apiName || !apiPassword) {
    return res.status(500).json({
      error: 'Missing env vars',
      has_terminal: !!terminalNumber,
      has_apiName: !!apiName,
      has_apiPassword: !!apiPassword,
    });
  }

  try {
    const params = new URLSearchParams();
    params.append('TerminalNumber', terminalNumber);
    params.append('ApiName', apiName);
    params.append('ApiPassword', apiPassword);
    params.append('SumToBill', '1');
    params.append('CoinID', '1');
    params.append('Operation', '1');
    params.append('Language', 'he');
    params.append('ProductName', 'Test Payment');
    params.append('SuccessRedirectUrl', 'https://maxios.co.il?payment=success');
    params.append('ErrorRedirectUrl', 'https://maxios.co.il?payment=error');
    params.append('IndicatorUrl', 'https://maxios.co.il/api/cardcom-webhook');
    params.append('IsIFrame', 'true');

    const response = await fetch('https://secure.cardcom.solutions/Interface/LowProfile.aspx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const text = await response.text();

    // Parse response
    const result = {};
    text.split('&').forEach(pair => {
      const [key, ...vals] = pair.split('=');
      result[decodeURIComponent(key)] = decodeURIComponent(vals.join('='));
    });

    return res.status(200).json({
      httpStatus: response.status,
      rawResponse: text.substring(0, 500),
      parsed: result,
      success: result.ResponseCode === '0',
      paymentUrl: result.url || null,
      errorDescription: result.Description || null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
