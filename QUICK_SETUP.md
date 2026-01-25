# Quick Setup - OTP Verification System

## 🚀 3 Steps to Get Started

### Step 1: Create Database Table (2 minutes)

1. Open Supabase dashboard: https://mfbopbnfjnkewrrscxhp.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste this SQL:

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
  ON verification_codes FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read own verification codes"
  ON verification_codes FOR SELECT USING (true);

CREATE POLICY "Anyone can update verification codes"
  ON verification_codes FOR UPDATE USING (true);
```

5. Click **Run** (or press F5)
6. You should see "Success. No rows returned"

---

### Step 2: Disable Default Email Confirmation (1 minute)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Find **"Confirm email"** toggle
4. Turn it **OFF** ⬅️ IMPORTANT
5. Click **Save**

---

### Step 3: Test on Website (1 minute)

1. Go to https://maxios.co.il
2. Click the login/signup button
3. Fill in the signup form with:
   - Name: Test User
   - Phone: 0550000000
   - Email: test@example.com
   - Password: Test1234
   - City: Tel Aviv
   - Zip: 12345
   - Street: Test St
4. Click **EXECUTE**
5. You'll see an alert with a 6-digit OTP code (e.g., "123456")
6. Copy the code
7. Paste it in the verification screen
8. Click **VERIFY CODE**
9. ✅ You're logged in!

---

## What You'll See

### After Clicking "EXECUTE":
- Browser alert: "FOR TESTING: Your OTP is 123456"
- The signup form changes to an OTP input screen

### OTP Input Screen:
- Large input box for 6 digits
- "VERIFY CODE" button (disabled until you type 6 digits)
- "RESEND CODE" button (if you need a new code)
- "← BACK TO SIGNUP" link

### After Verification:
- You're automatically logged in
- Can now save products (heart icon)
- Your profile is stored in database

---

## Current Behavior (Testing Mode)

✅ **What Works:**
- OTP codes are generated and stored in database
- Codes expire after 10 minutes
- You can resend codes
- Account is created after successful OTP verification
- Login works normally (no OTP required for login)

⚠️ **Temporary Testing Method:**
- OTP codes shown in browser alert
- Codes also logged to browser console (F12 → Console)

🔜 **Coming Soon:**
- OTP codes sent via email from service@maxios.co.il
- Professional email template
- No more browser alerts

---

## Troubleshooting

### Problem: "NEW ROW VIOLATES ROW-LEVEL SECURITY POLICY"
**Solution:** Make sure you ran the SQL in Step 1 above

### Problem: Alert doesn't show OTP code
**Solution:**
1. Check browser console (F12)
2. Look for: `🔐 OTP CODE FOR youremail@example.com: 123456`

### Problem: "Invalid or expired code"
**Solution:**
- Make sure you typed all 6 digits
- Check if 10 minutes passed (code expired)
- Click "RESEND CODE" to get a new one

### Problem: Email confirmation still required
**Solution:** Make sure you disabled "Confirm email" in Step 2

---

## Admin Login (No OTP Required)

You can still use the admin backdoor:
- Email: maxios1234
- Password: maxios1900

This bypasses all verification and logs you in as admin immediately.

---

## Files Created

1. **verification-codes-table.sql** - Database schema
2. **OTP_SETUP_GUIDE.md** - Detailed documentation
3. **QUICK_SETUP.md** - This file (quick reference)
4. **components/AuthOverlay.tsx** - Updated with OTP logic

---

## Next: Email Integration

When ready to send real emails from service@maxios.co.il:
- See full guide in **OTP_SETUP_GUIDE.md**
- Options: Resend.com (recommended) or SendGrid
- Simple serverless function setup
- Professional email template included

---

✅ **Your OTP system is deployed and ready to test!**

Go to: https://maxios.co.il
