-- BestAuth Database Schema for Supabase PostgreSQL

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS bestauth;

-- Users table
CREATE TABLE IF NOT EXISTS bestauth.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bestauth_users_email ON bestauth.users(email);
CREATE INDEX idx_bestauth_users_created_at ON bestauth.users(created_at);

-- Password credentials table
CREATE TABLE IF NOT EXISTS bestauth.credentials (
  user_id UUID PRIMARY KEY REFERENCES bestauth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OAuth accounts table
CREATE TABLE IF NOT EXISTS bestauth.oauth_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_bestauth_oauth_user_id ON bestauth.oauth_accounts(user_id);
CREATE INDEX idx_bestauth_oauth_provider ON bestauth.oauth_accounts(provider, provider_account_id);

-- Sessions table (for database sessions)
CREATE TABLE IF NOT EXISTS bestauth.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth.users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bestauth_sessions_user_id ON bestauth.sessions(user_id);
CREATE INDEX idx_bestauth_sessions_token_hash ON bestauth.sessions(token_hash);
CREATE INDEX idx_bestauth_sessions_expires_at ON bestauth.sessions(expires_at);

-- Magic link tokens
CREATE TABLE IF NOT EXISTS bestauth.magic_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bestauth_magic_links_token ON bestauth.magic_links(token_hash);
CREATE INDEX idx_bestauth_magic_links_email ON bestauth.magic_links(email);
CREATE INDEX idx_bestauth_magic_links_expires_at ON bestauth.magic_links(expires_at);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS bestauth.password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth.users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bestauth_password_resets_token ON bestauth.password_resets(token_hash);
CREATE INDEX idx_bestauth_password_resets_user_id ON bestauth.password_resets(user_id);
CREATE INDEX idx_bestauth_password_resets_expires_at ON bestauth.password_resets(expires_at);

-- Activity logs
CREATE TABLE IF NOT EXISTS bestauth.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES bestauth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bestauth_activity_user_id ON bestauth.activity_logs(user_id);
CREATE INDEX idx_bestauth_activity_action ON bestauth.activity_logs(action);
CREATE INDEX idx_bestauth_activity_created_at ON bestauth.activity_logs(created_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION bestauth.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON bestauth.users
  FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON bestauth.credentials
  FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at();

CREATE TRIGGER update_oauth_accounts_updated_at BEFORE UPDATE ON bestauth.oauth_accounts
  FOR EACH ROW EXECUTE FUNCTION bestauth.update_updated_at();

-- Clean up expired sessions and tokens (run periodically)
CREATE OR REPLACE FUNCTION bestauth.cleanup_expired_records()
RETURNS void AS $$
BEGIN
  DELETE FROM bestauth.sessions WHERE expires_at < NOW();
  DELETE FROM bestauth.magic_links WHERE expires_at < NOW() OR used = true;
  DELETE FROM bestauth.password_resets WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if using Supabase)
ALTER TABLE bestauth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.oauth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bestauth.activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
CREATE POLICY "Users can read own data" ON bestauth.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role full access" ON bestauth.users
  FOR ALL USING (auth.role() = 'service_role');