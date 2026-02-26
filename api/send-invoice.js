// Serverless function to send invoice emails using Resend
// This will be deployed as a Vercel serverless function

const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  // CORS — restrict to known origins
  const origin = req.headers.origin || '';
  const allowed = ['https://maxios.co.il', 'https://www.maxios.co.il', 'http://localhost:3000'];
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    customerEmail,
    customerName,
    customerPhone,
    shippingAddress,
    items,
    total,
    orderNumber,
    lang = 'en'
  } = req.body;

  if (!customerEmail || !customerName || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields: customerEmail, customerName, items, total' });
  }

  // Generate order number if not provided
  const invoiceNumber = orderNumber || `MX-${Date.now().toString(36).toUpperCase()}`;

  // Translations
  const t = {
    en: {
      subject: `MAXIOS - Order Confirmation #${invoiceNumber}`,
      title: 'ORDER CONFIRMED',
      subtitle: 'Your order has been received and is being processed',
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      shippingTo: 'Shipping To',
      items: 'Order Items',
      product: 'Product',
      qty: 'Qty',
      price: 'Price',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      freeShipping: 'FREE',
      total: 'Total',
      thanks: 'Thank you for your order!',
      questions: 'Questions? Contact us at service@maxios.co.il'
    },
    he: {
      subject: `MAXIOS - אישור הזמנה #${invoiceNumber}`,
      title: 'ההזמנה אושרה',
      subtitle: 'ההזמנה שלך התקבלה ונמצאת בטיפול',
      orderNumber: 'מספר הזמנה',
      orderDate: 'תאריך הזמנה',
      shippingTo: 'כתובת למשלוח',
      items: 'פריטים בהזמנה',
      product: 'מוצר',
      qty: 'כמות',
      price: 'מחיר',
      subtotal: 'סה"כ ביניים',
      shipping: 'משלוח',
      freeShipping: 'חינם',
      total: 'סה"כ לתשלום',
      thanks: 'תודה על הזמנתך!',
      questions: 'שאלות? צרו קשר: service@maxios.co.il'
    },
    ar: {
      subject: `MAXIOS - تأكيد الطلب #${invoiceNumber}`,
      title: 'تم تأكيد الطلب',
      subtitle: 'تم استلام طلبك وجاري معالجته',
      orderNumber: 'رقم الطلب',
      orderDate: 'تاريخ الطلب',
      shippingTo: 'عنوان الشحن',
      items: 'عناصر الطلب',
      product: 'المنتج',
      qty: 'الكمية',
      price: 'السعر',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      freeShipping: 'مجاني',
      total: 'الإجمالي',
      thanks: 'شكراً لطلبك!',
      questions: 'أسئلة؟ تواصل معنا على service@maxios.co.il'
    }
  };

  const text = t[lang] || t.en;
  const isRTL = lang === 'he' || lang === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const orderDate = new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : lang === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ffffff; font-weight: bold; text-align: ${isRTL ? 'right' : 'left'};">
        ${item.name}
      </td>
      <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); text-align: center;">
        ${item.qty}
      </td>
      <td style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); color: #ff6b00; font-weight: bold; text-align: ${isRTL ? 'left' : 'right'};">
        ${item.price}
      </td>
    </tr>
  `).join('');

  try {
    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MAXIOS Orders <onboarding@resend.dev>',
      to: customerEmail,
      subject: text.subject,
      html: `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #000000;
              color: #ffffff;
              margin: 0;
              padding: 0;
              direction: ${direction};
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .logo {
              font-size: 32px;
              font-weight: 900;
              font-style: italic;
              letter-spacing: -2px;
              color: #ffffff;
              text-transform: uppercase;
            }
            .content {
              background-color: #0a0a0a;
              border: 1px solid rgba(255, 255, 255, 0.05);
              padding: 40px;
            }
            .title {
              font-size: 28px;
              font-weight: 900;
              font-style: italic;
              text-transform: uppercase;
              letter-spacing: -1px;
              margin-bottom: 10px;
              color: #ffffff;
              text-align: center;
            }
            .subtitle {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.4);
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 30px;
              text-align: center;
            }
            .order-info {
              background-color: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.05);
              padding: 20px;
              margin-bottom: 30px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            .info-label {
              font-size: 10px;
              color: rgba(255, 255, 255, 0.4);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .info-value {
              font-size: 14px;
              color: #ffffff;
              font-weight: bold;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .items-header {
              background-color: rgba(255, 107, 0, 0.1);
              border: 1px solid rgba(255, 107, 0, 0.2);
            }
            .items-header th {
              padding: 12px 15px;
              font-size: 10px;
              color: #ff6b00;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 900;
            }
            .totals {
              background-color: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.05);
              padding: 20px;
              margin-top: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .total-row:last-child {
              border-bottom: none;
              padding-top: 15px;
              margin-top: 10px;
              border-top: 2px solid #ff6b00;
            }
            .total-label {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.6);
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .total-value {
              font-size: 14px;
              color: #ffffff;
              font-weight: bold;
            }
            .grand-total .total-label,
            .grand-total .total-value {
              font-size: 18px;
              color: #ff6b00;
              font-weight: 900;
            }
            .thanks {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background-color: rgba(255, 107, 0, 0.1);
              border: 1px solid rgba(255, 107, 0, 0.2);
            }
            .thanks-text {
              font-size: 16px;
              font-weight: 900;
              color: #ff6b00;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
            }
            .footer-text {
              font-size: 10px;
              color: rgba(255, 255, 255, 0.2);
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .contact {
              font-size: 11px;
              color: rgba(255, 255, 255, 0.4);
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MAXIOS</div>
            </div>

            <div class="content">
              <h1 class="title">${text.title}</h1>
              <p class="subtitle">${text.subtitle}</p>

              <div class="order-info">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 5px 0;">
                      <span class="info-label">${text.orderNumber}</span><br>
                      <span class="info-value" style="color: #ff6b00;">${invoiceNumber}</span>
                    </td>
                    <td style="padding: 5px 0; text-align: ${isRTL ? 'left' : 'right'};">
                      <span class="info-label">${text.orderDate}</span><br>
                      <span class="info-value">${orderDate}</span>
                    </td>
                  </tr>
                </table>
              </div>

              ${shippingAddress ? `
              <div class="order-info">
                <span class="info-label">${text.shippingTo}</span><br>
                <span class="info-value">${customerName}</span><br>
                <span style="color: rgba(255,255,255,0.6); font-size: 13px;">${shippingAddress}</span><br>
                <span style="color: rgba(255,255,255,0.6); font-size: 13px;">${customerPhone || ''}</span>
              </div>
              ` : ''}

              <div class="info-label" style="margin-bottom: 15px;">${text.items}</div>

              <table class="items-table">
                <thead>
                  <tr class="items-header">
                    <th style="text-align: ${isRTL ? 'right' : 'left'};">${text.product}</th>
                    <th style="text-align: center;">${text.qty}</th>
                    <th style="text-align: ${isRTL ? 'left' : 'right'};">${text.price}</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="totals">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td class="total-label">${text.subtotal}</td>
                    <td class="total-value" style="text-align: ${isRTL ? 'left' : 'right'};">${total}</td>
                  </tr>
                  <tr>
                    <td class="total-label">${text.shipping}</td>
                    <td class="total-value" style="text-align: ${isRTL ? 'left' : 'right'}; color: #22c55e;">${text.freeShipping}</td>
                  </tr>
                  <tr class="grand-total">
                    <td class="total-label" style="padding-top: 15px; border-top: 2px solid #ff6b00;">${text.total}</td>
                    <td class="total-value" style="text-align: ${isRTL ? 'left' : 'right'}; padding-top: 15px; border-top: 2px solid #ff6b00; color: #ff6b00; font-size: 20px;">${total}</td>
                  </tr>
                </table>
              </div>

              <div class="thanks">
                <span class="thanks-text">${text.thanks}</span>
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">
                MAXIOS INDUSTRIAL CLEANING SYSTEMS<br>
                NEO-CLEAN ECOSYSTEM
              </p>
              <p class="contact">${text.questions}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${text.title}
${text.subtitle}

${text.orderNumber}: ${invoiceNumber}
${text.orderDate}: ${orderDate}

${text.shippingTo}:
${customerName}
${shippingAddress || ''}
${customerPhone || ''}

${text.items}:
${items.map(item => `- ${item.name} x${item.qty} - ${item.price}`).join('\n')}

${text.total}: ${total}

${text.thanks}

---
MAXIOS INDUSTRIAL CLEANING SYSTEMS
${text.questions}
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send invoice email', details: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Invoice email sent successfully',
      emailId: data.id,
      invoiceNumber
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return res.status(500).json({ error: 'Failed to send invoice email', details: error.message });
  }
};
