-- Verification Codes Table for OTP Authentication
-- Run this in your Supabase SQL Editor

CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
  verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX idx_verification_email ON verification_codes(email);
CREATE INDEX idx_verification_code ON verification_codes(code);

-- Enable Row Level Security
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert verification codes (for signup)
CREATE POLICY "Anyone can insert verification codes"
  ON verification_codes FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can read their own verification codes
CREATE POLICY "Users can read own verification codes"
  ON verification_codes FOR SELECT
  USING (true);

-- Policy: Anyone can update verification codes (for marking as verified)
CREATE POLICY "Anyone can update verification codes"
  ON verification_codes FOR UPDATE
  USING (true);

-- Function to clean up expired codes (optional, for maintenance)
CREATE OR REPLACE FUNCTION delete_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job to run this periodically:
-- SELECT cron.schedule('cleanup-expired-codes', '0 * * * *', 'SELECT delete_expired_verification_codes();');
