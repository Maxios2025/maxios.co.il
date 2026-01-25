// Serverless function to send OTP emails using Resend
// This will be deployed as a Vercel serverless function

const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  try {
    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MAXIOS Verification <onboarding@resend.dev>',
      to: email,
      subject: 'Your MAXIOS Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background-color: #000000;
              color: #ffffff;
              margin: 0;
              padding: 0;
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
              text-align: center;
            }
            .title {
              font-size: 28px;
              font-weight: 900;
              font-style: italic;
              text-transform: uppercase;
              letter-spacing: -1px;
              margin-bottom: 20px;
              color: #ffffff;
            }
            .description {
              font-size: 12px;
              color: rgba(255, 255, 255, 0.4);
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 30px;
            }
            .code-container {
              background-color: rgba(255, 255, 255, 0.05);
              border: 2px solid rgba(255, 255, 255, 0.1);
              padding: 30px;
              margin: 30px 0;
            }
            .code {
              font-size: 48px;
              font-weight: 900;
              letter-spacing: 10px;
              color: #ff6b00;
              font-family: 'Courier New', monospace;
            }
            .expiry {
              font-size: 11px;
              color: rgba(255, 255, 255, 0.3);
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 30px;
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
            .warning {
              background-color: rgba(255, 107, 0, 0.1);
              border: 1px solid rgba(255, 107, 0, 0.2);
              padding: 15px;
              margin-top: 30px;
              font-size: 11px;
              color: rgba(255, 255, 255, 0.6);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MAXIOS</div>
            </div>

            <div class="content">
              <h1 class="title">VERIFICATION REQUIRED</h1>
              <p class="description">Enter this code to complete your account setup</p>

              <div class="code-container">
                <div class="code">${code}</div>
              </div>

              <p class="expiry">⏱ This code expires in 10 minutes</p>

              <div class="warning">
                ⚠️ If you didn't request this code, please ignore this email.
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">
                MAXIOS INDUSTRIAL CLEANING SYSTEMS<br>
                NEO-CLEAN ECOSYSTEM
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
MAXIOS - VERIFICATION REQUIRED

Your verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this code, please ignore this email.

---
MAXIOS INDUSTRIAL CLEANING SYSTEMS
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email', details: error.message });
    }

    return res.status(200).json({ success: true, message: 'OTP email sent successfully', emailId: data.id });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};
