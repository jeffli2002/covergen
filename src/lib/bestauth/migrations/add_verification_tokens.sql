-- Create verification tokens table for email verification
CREATE TABLE IF NOT EXISTS bestauth_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_token ON bestauth_verification_tokens(token) WHERE used = false;
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_user_id ON bestauth_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_expires ON bestauth_verification_tokens(expires_at) WHERE used = false;

-- Grant permissions
GRANT ALL ON bestauth_verification_tokens TO authenticated;
GRANT SELECT ON bestauth_verification_tokens TO anon;