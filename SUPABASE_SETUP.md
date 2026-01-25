# Supabase Integration Setup Guide

## Overview

Your Maxios application now includes Supabase integration for:
1. **User Authentication** (Email + Password and Google OAuth)
2. **Save for Later** functionality
3. **Contact Form** database storage

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in the details:
   - **Name**: maxios-cinematic-experience
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
5. Wait for the project to be created (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Copy both of these

## Step 3: Add Environment Variables

### Locally (.env.local file):
Update your `.env.local` file:
```
GEMINI_API_KEY=your_actual_gemini_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### On Vercel:
Add these environment variables to Vercel:

```bash
# Method 1: Via CLI
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key when prompted
```

**Method 2: Via Dashboard:**
1. Go to https://vercel.com/maxios-projects-b3abd41c/maxios-cinematic-experience/settings/environment-variables
2. Add both variables for Production, Preview, and Development

## Step 4: Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run these SQL commands:

### 1. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  city TEXT,
  zip TEXT,
  street TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view and update their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### 2. Saved Products Table
```sql
CREATE TABLE saved_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  product_img TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own saved products
CREATE POLICY "Users can view own saved products"
  ON saved_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved products"
  ON saved_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved products"
  ON saved_products FOR DELETE
  USING (auth.uid() = user_id);
```

### 3. Contact Messages Table
```sql
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert contact messages
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users can view messages (for admin)
CREATE POLICY "Authenticated users can view messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);
```

## Step 5: Configure Google OAuth (Optional)

If you want Google login to work:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click to configure
3. Enable Google provider
4. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
5. Save the configuration

## Step 6: Test Locally

1. Make sure your `.env.local` file has the correct values
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. Test the features:
   - Sign up with email
   - Login
   - Save a product (heart icon)
   - Submit contact form

## Step 7: Deploy to Vercel

Once everything works locally, deploy:

```bash
vercel --prod
```

## Features Implemented

### 1. **Authentication**
- Email/Password sign up and login
- Google OAuth login (if configured)
- Secure password validation
- User profile storage

### 2. **Save for Later**
- Heart icon on each product
- Click to save/unsave products
- Saved products persist in database
- Only available for logged-in users

### 3. **Contact Form**
- Name, email, phone (optional), and message
- Saves to Supabase database
- Admin can view all messages in Supabase dashboard

## Accessing Your Data

### View User Profiles:
Go to Supabase Dashboard → Table Editor → user_profiles

### View Saved Products:
Go to Supabase Dashboard → Table Editor → saved_products

### View Contact Messages:
Go to Supabase Dashboard → Table Editor → contact_messages

## Troubleshooting

### Issue: "Invalid API key"
- Double-check your environment variables
- Make sure you copied the **anon/public** key, not the service_role key
- Restart your dev server after changing .env.local

### Issue: "Row Level Security policy violation"
- Make sure you ran all the RLS policy SQL commands
- Check that users are logged in before trying to save products

### Issue: Google login doesn't work
- Make sure you configured Google OAuth in Supabase settings
- Check that redirect URIs match exactly

## Security Notes

- Never commit your `.env.local` file to git
- The anon key is safe to expose in frontend code
- Row Level Security (RLS) protects your data
- Users can only access their own saved products and profiles

## Next Steps

- Monitor usage in Supabase dashboard
- Set up email templates for password reset
- Add more authentication providers (Facebook, GitHub, etc.)
- Create an admin panel to view contact messages
- Add email notifications for contact form submissions

Your Supabase integration is ready! 🚀
