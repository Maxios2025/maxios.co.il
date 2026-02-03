# Email Setup Instructions - Gmail SMTP

## What We've Built

Your OTP system now sends professional emails from **service@maxios.co.il** instead of showing alerts. The emails have a beautiful design matching your brand.

## Setup Steps

### Step 1: Get Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the setup wizard
4. **Create App Password**:
   - Go back to Security
   - Click "2-Step Verification"
   - Scroll down to "App passwords"
   - Click "App passwords"
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Type: "Maxios Website"
   - Click **Generate**
5. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
   - Remove the spaces: `abcdefghijklmnop`

### Step 2: Update Local Environment Variables

Open `.env.local` and replace `your_gmail_app_password_here` with your actual app password:

```
GMAIL_USER=service@maxios.co.il
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### Step 3: Add to Vercel Environment Variables

Add the environment variables to Vercel:

```bash
vercel env add GMAIL_USER
# When prompted, enter: service@maxios.co.il
# Select: Production, Preview, Development (all three)

vercel env add GMAIL_APP_PASSWORD
# When prompted, enter: your_app_password_here
# Select: Production, Preview, Development (all three)
```

### Step 4: Deploy to Production

```bash
vercel --prod
```

---

## How It Works

1. User signs up on website
2. Frontend generates 6-digit OTP code
3. Code is stored in database
4. API endpoint `/api/send-otp` is called
5. **Email is sent from service@maxios.co.il via Gmail SMTP**
6. User receives beautifully designed email
7. User enters code to verify
8. Account is created

---

## Email Design Preview

The email includes:
- **MAXIOS branding** with your logo style
- **Large, bold 6-digit code** (easy to read)
- **10-minute expiration notice**
- **Professional warning** about security
- **Dark theme** matching your website aesthetic
- **Responsive design** (works on mobile and desktop)

---

## Testing

### Local Testing:

1. Start dev server: `npm run dev`
2. Go to http://localhost:5173
3. Try signing up with your email
4. Check your inbox for the OTP email

### Production Testing:

1. Deploy: `vercel --prod`
2. Go to https://maxios.co.il
3. Try signing up
4. Check your inbox

---

## Troubleshooting

### Problem: "Email service unavailable" alert shows

**Solution:**
- Check that GMAIL_USER and GMAIL_APP_PASSWORD are set in `.env.local`
- Make sure you used the **App Password**, not your regular Gmail password
- Restart your dev server after adding env vars

### Problem: Email not received

**Solution:**
- Check spam folder
- Verify `service@maxios.co.il` is a valid Gmail account
- Make sure 2-Step Verification is enabled
- Generate a new App Password

### Problem: "Invalid credentials" error

**Solution:**
- The App Password must be 16 characters, no spaces
- Make sure you're using service@maxios.co.il credentials
- Try generating a new App Password

### Problem: Emails work locally but not on Vercel

**Solution:**
- Make sure you added environment variables to Vercel
- Check Vercel logs: `vercel logs`
- Redeploy: `vercel --prod`

---

## Email Security

✅ **Safe practices:**
- App passwords are Google's recommended way for apps to access Gmail
- Never commit `.env.local` to git (already in .gitignore)
- Environment variables are encrypted in Vercel

❌ **Never do:**
- Don't use your main Gmail password
- Don't share your App Password
- Don't commit .env.local to git

---

## Alternative: Using SendGrid or Resend

If you prefer a dedicated email service instead of Gmail:

### Resend (Recommended)
1. Sign up at resend.com
2. Verify domain: maxios.co.il
3. Get API key
4. Update `/api/send-otp.js` to use Resend SDK

### SendGrid
1. Sign up at sendgrid.com
2. Verify domain
3. Get API key
4. Update `/api/send-otp.js` to use SendGrid SDK

---

## Cost

- **Gmail SMTP**: FREE (no cost for normal usage)
- **Resend**: FREE tier includes 3,000 emails/month
- **SendGrid**: FREE tier includes 100 emails/day

Gmail SMTP is perfect for your needs!

---

## Next Steps

1. ✅ Get Gmail App Password
2. ✅ Update `.env.local`
3. ✅ Add to Vercel environment variables
4. ✅ Deploy to production
5. ✅ Test signup with your email
6. ✅ Enjoy professional OTP emails!

Your email system is ready to go! 🚀
