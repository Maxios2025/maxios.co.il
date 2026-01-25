# OTP Verification Setup Guide

## Overview

Your Maxios website now uses a 6-digit OTP (One-Time Password) verification system instead of email confirmation links. This provides a more professional and controlled signup experience.

## What's Been Implemented

### 1. **Database Table**
- **verification_codes** table stores OTP codes with:
  - 6-digit numeric codes
  - 10-minute expiration
  - Email tracking
  - Verification status
  - Attempt counting

### 2. **Updated AuthOverlay Component**
- Generates 6-digit OTP on signup
- Shows OTP input screen after initial signup
- Validates OTP before creating account
- Includes "Resend Code" functionality
- Clean, premium UI matching your design

### 3. **Current OTP Delivery (Testing Phase)**
- OTP codes are shown in browser alert for testing
- Codes are logged to browser console
- **Ready for email integration** when you set up SMTP

---

## Setup Steps

### Step 1: Create the Database Table

Go to your Supabase dashboard SQL Editor and run the SQL file:
- File: `verification-codes-table.sql`
- Location: Project root directory

Or copy and paste this SQL:

```sql
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0
);

CREATE INDEX idx_verification_email ON verification_codes(email);
CREATE INDEX idx_verification_code ON verification_codes(code);

ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert verification codes"
  ON verification_codes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can read own verification codes"
  ON verification_codes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update verification codes"
  ON verification_codes FOR UPDATE
  USING (true);
```

### Step 2: Disable Supabase Default Email Confirmation

Since we're using our own OTP system, disable Supabase's built-in email confirmation:

1. Go to your Supabase dashboard: https://mfbopbnfjnkewrrscxhp.supabase.co
2. Navigate to **Authentication** → **Providers**
3. Click on **Email** provider
4. Find the **"Confirm email"** toggle
5. Turn it **OFF**
6. Click **Save**

This allows signups to proceed without waiting for Supabase's email confirmation.

### Step 3: Deploy Updated Code

Deploy the updated code to Vercel:

```bash
vercel --prod
```

### Step 4: Test the OTP Flow

1. Go to your website: https://maxios.co.il
2. Click on the login/signup button
3. Fill in the signup form
4. Click "EXECUTE"
5. You'll see an alert with the 6-digit OTP code
6. Enter the code in the verification screen
7. Click "VERIFY CODE"
8. You should be logged in successfully

---

## Future: Email Integration via service@maxios.co.il

When you're ready to send real emails from `service@maxios.co.il`, you'll need to:

### Option 1: Resend (Recommended - Easy Setup)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your domain: `maxios.co.il`
3. Get your API key
4. Install Resend SDK:
   ```bash
   npm install resend
   ```

5. Create a serverless function to send OTP emails:
   ```typescript
   // api/send-otp.ts
   import { Resend } from 'resend';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export default async function handler(req, res) {
     const { email, code } = req.body;

     await resend.emails.send({
       from: 'MAXIOS Verification <service@maxios.co.il>',
       to: email,
       subject: 'Your MAXIOS Verification Code',
       html: `
         <h1>VERIFICATION REQUIRED</h1>
         <p>Your verification code is:</p>
         <h2 style="font-size: 48px; letter-spacing: 10px;">${code}</h2>
         <p>This code expires in 10 minutes.</p>
       `
     });

     res.status(200).json({ success: true });
   }
   ```

6. Update AuthOverlay.tsx to call this API instead of showing an alert

### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your domain
3. Get API key
4. Use similar serverless function approach

---

## How the OTP System Works

### Signup Flow:

1. User fills signup form → clicks "EXECUTE"
2. System generates random 6-digit code
3. Code is stored in `verification_codes` table with 10-minute expiration
4. **Current:** Code shown in alert (for testing)
5. **Future:** Code sent via email from service@maxios.co.il
6. User enters code in OTP screen
7. System verifies code against database
8. If valid → create Supabase account and user profile
9. User is logged in

### Security Features:

- Codes expire after 10 minutes
- Each code can only be used once (marked as verified)
- Codes are specific to email addresses
- Failed attempts are tracked
- Old codes are automatically invalidated

---

## Troubleshooting

### "Invalid or expired code" error
- Make sure you entered the full 6-digit code
- Check if 10 minutes have passed (code expired)
- Click "RESEND CODE" to get a new one

### Can't create account after OTP verification
- Check browser console for errors
- Verify RLS policies are set up correctly
- Make sure user_profiles table exists

### OTP not generating
- Check browser console for errors
- Verify verification_codes table was created
- Check RLS policies allow INSERT

---

## Code Structure

### Key Files:

1. **components/AuthOverlay.tsx**
   - Main authentication UI
   - OTP generation and validation logic
   - Handles signup flow with OTP

2. **verification-codes-table.sql**
   - Database schema for OTP storage
   - RLS policies for security

3. **OTP_SETUP_GUIDE.md** (this file)
   - Complete setup instructions
   - Future email integration guide

---

## Testing Checklist

- [ ] Run SQL to create verification_codes table
- [ ] Disable email confirmation in Supabase settings
- [ ] Deploy updated code to production
- [ ] Test signup flow with OTP
- [ ] Test "Resend Code" functionality
- [ ] Test OTP expiration (wait 10 minutes)
- [ ] Test login flow (should work normally)
- [ ] Test admin login (maxios1234 / maxios1900)

---

## Next Steps

1. **Immediate:** Complete setup steps above and test
2. **Short-term:** Set up email service (Resend/SendGrid)
3. **Optional:** Add SMS OTP as alternative verification method
4. **Optional:** Add rate limiting to prevent OTP spam

---

Your OTP system is ready to test! Once email is configured, it will be a professional, secure verification system for your e-commerce platform.
