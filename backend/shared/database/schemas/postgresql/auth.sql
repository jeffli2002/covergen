-- Authentication module schema for PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Auth users table
CREATE TABLE auth.users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0 NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    CONSTRAINT email_lowercase CHECK (email = LOWER(email))
);

CREATE INDEX idx_auth_users_email ON auth.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_auth_users_created_at ON auth.users(created_at);

-- OAuth providers table
CREATE TABLE auth.oauth_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    provider_data JSONB,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure unique provider connection per user
    CONSTRAINT unique_provider_connection UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_oauth_connections_user_id ON auth.oauth_connections(user_id);
CREATE INDEX idx_oauth_connections_provider ON auth.oauth_connections(provider, provider_user_id);

-- User roles table
CREATE TABLE auth.roles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Permissions table
CREATE TABLE auth.permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT unique_permission UNIQUE (resource, action)
);

-- Role permissions junction table
CREATE TABLE auth.role_permissions (
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (role_id, permission_id)
);

-- User roles junction table
CREATE TABLE auth.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON auth.user_roles(user_id);

-- User permissions (direct permissions, not through roles)
CREATE TABLE auth.user_permissions (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    granted_by UUID REFERENCES auth.users(id),
    
    PRIMARY KEY (user_id, permission_id)
);

CREATE INDEX idx_user_permissions_user_id ON auth.user_permissions(user_id);

-- MFA settings table
CREATE TABLE auth.mfa_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE NOT NULL,
    type VARCHAR(20), -- 'totp', 'sms', 'email'
    secret VARCHAR(255), -- Encrypted
    backup_codes TEXT[], -- Array of encrypted backup codes
    phone_number VARCHAR(20), -- For SMS MFA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Sessions table
CREATE TABLE auth.sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id VARCHAR(100),
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user_id ON auth.sessions(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_expires_at ON auth.sessions(expires_at) WHERE revoked_at IS NULL;

-- Refresh tokens table
CREATE TABLE auth.refresh_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL, -- Store hash of token
    session_id VARCHAR(100) REFERENCES auth.sessions(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash) WHERE revoked_at IS NULL;

-- API keys table
CREATE TABLE auth.api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL, -- Store hash of key
    prefix VARCHAR(10) NOT NULL, -- Key prefix for identification
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_api_keys_user_id ON auth.api_keys(user_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_api_keys_key_hash ON auth.api_keys(key_hash) WHERE revoked_at IS NULL;

-- Password reset tokens
CREATE TABLE auth.password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_password_reset_tokens_token_hash ON auth.password_reset_tokens(token_hash) WHERE used_at IS NULL;

-- Email verification tokens
CREATE TABLE auth.email_verification_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_email_verification_tokens_token_hash ON auth.email_verification_tokens(token_hash) WHERE used_at IS NULL;

-- Audit log table
CREATE TABLE auth.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_log_user_id ON auth.audit_log(user_id);
CREATE INDEX idx_audit_log_event_type ON auth.audit_log(event_type);
CREATE INDEX idx_audit_log_created_at ON auth.audit_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at BEFORE UPDATE ON auth.oauth_connections
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON auth.roles
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_mfa_settings_updated_at BEFORE UPDATE ON auth.mfa_settings
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

-- Default roles
INSERT INTO auth.roles (name, description) VALUES
    ('super_admin', 'Full system access'),
    ('admin', 'Administrative access'),
    ('user', 'Regular user access')
ON CONFLICT (name) DO NOTHING;

-- Default permissions
INSERT INTO auth.permissions (resource, action, description) VALUES
    ('auth', 'manage', 'Manage authentication settings'),
    ('users', 'read', 'View user information'),
    ('users', 'write', 'Create and update users'),
    ('users', 'delete', 'Delete users'),
    ('billing', 'read', 'View billing information'),
    ('billing', 'manage', 'Manage billing settings')
ON CONFLICT (resource, action) DO NOTHING;