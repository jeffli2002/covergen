-- BestAuth Database Schema for Supabase PostgreSQL
-- This creates tables in the public schema with bestauth_ prefix

-- Users table
CREATE TABLE IF NOT EXISTS bestauth_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestauth_users_email ON bestauth_users(email);
CREATE INDEX IF NOT EXISTS idx_bestauth_users_created_at ON bestauth_users(created_at);

-- Password credentials table
CREATE TABLE IF NOT EXISTS bestauth_credentials (
  user_id UUID PRIMARY KEY REFERENCES bestauth_users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth accounts table
CREATE TABLE IF NOT EXISTS bestauth_oauth_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX IF NOT EXISTS idx_bestauth_oauth_user_id ON bestauth_oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_oauth_provider ON bestauth_oauth_accounts(provider, provider_account_id);

-- Sessions table (for database sessions)
CREATE TABLE IF NOT EXISTS bestauth_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestauth_sessions_user_id ON bestauth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_sessions_token_hash ON bestauth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_bestauth_sessions_expires_at ON bestauth_sessions(expires_at);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS bestauth_magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestauth_magic_links_token ON bestauth_magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_bestauth_magic_links_email ON bestauth_magic_links(email);
CREATE INDEX IF NOT EXISTS idx_bestauth_magic_links_expires_at ON bestauth_magic_links(expires_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS bestauth_password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestauth_password_resets_token ON bestauth_password_resets(token_hash);
CREATE INDEX IF NOT EXISTS idx_bestauth_password_resets_user_id ON bestauth_password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_password_resets_expires_at ON bestauth_password_resets(expires_at);

-- Activity logs
CREATE TABLE IF NOT EXISTS bestauth_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES bestauth_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bestauth_activity_user_id ON bestauth_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_bestauth_activity_action ON bestauth_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_bestauth_activity_created_at ON bestauth_activity_logs(created_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bestauth_users_updated_at') THEN
    CREATE TRIGGER update_bestauth_users_updated_at BEFORE UPDATE ON bestauth_users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bestauth_credentials_updated_at') THEN
    CREATE TRIGGER update_bestauth_credentials_updated_at BEFORE UPDATE ON bestauth_credentials
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bestauth_oauth_accounts_updated_at') THEN
    CREATE TRIGGER update_bestauth_oauth_accounts_updated_at BEFORE UPDATE ON bestauth_oauth_accounts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Disable RLS on all BestAuth tables (run this after creation)
ALTER TABLE bestauth_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_credentials DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_oauth_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_magic_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_password_resets DISABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth_activity_logs DISABLE ROW LEVEL SECURITY;

-- Clean up expired sessions and tokens function (run periodically)
CREATE OR REPLACE FUNCTION bestauth_cleanup_expired_records()
RETURNS void AS $$
BEGIN
  DELETE FROM bestauth_sessions WHERE expires_at < NOW();
  DELETE FROM bestauth_magic_links WHERE expires_at < NOW() OR used = true;
  DELETE FROM bestauth_password_resets WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'BestAuth tables created successfully in public schema with bestauth_ prefix';
END $$;