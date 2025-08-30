-- User management module schema for PostgreSQL

-- Create user management schema
CREATE SCHEMA IF NOT EXISTS users;

-- User profiles table
CREATE TABLE users.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(255),
    avatar_url VARCHAR(500),
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),
    phone_verified BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en' NOT NULL,
    timezone VARCHAR(100) DEFAULT 'UTC' NOT NULL,
    country VARCHAR(2), -- ISO country code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_profiles_display_name ON users.profiles(display_name) WHERE display_name IS NOT NULL;
CREATE INDEX idx_user_profiles_country ON users.profiles(country) WHERE country IS NOT NULL;

-- User addresses table
CREATE TABLE users.addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'home', -- 'home', 'work', 'billing', 'shipping'
    is_default BOOLEAN DEFAULT FALSE,
    street_line1 VARCHAR(255),
    street_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(2) NOT NULL, -- ISO country code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_addresses_user_id ON users.addresses(user_id);

-- User status table
CREATE TABLE users.status (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state VARCHAR(20) DEFAULT 'active' NOT NULL, -- 'active', 'suspended', 'banned', 'deleted', 'pending'
    reason TEXT,
    suspended_until TIMESTAMP WITH TIME ZONE,
    suspended_at TIMESTAMP WITH TIME ZONE,
    suspended_by UUID REFERENCES auth.users(id),
    banned_at TIMESTAMP WITH TIME ZONE,
    banned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User preferences table (JSON for flexibility)
CREATE TABLE users.preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications JSONB DEFAULT '{"email": true, "push": true, "sms": false, "inApp": true, "digest": "weekly", "types": {"marketing": true, "updates": true, "security": true, "billing": true}}'::jsonb NOT NULL,
    privacy JSONB DEFAULT '{"profileVisibility": "public", "showEmail": false, "showPhone": false, "allowDataCollection": true, "allowThirdPartySharing": false}'::jsonb NOT NULL,
    appearance JSONB DEFAULT '{"theme": "light", "dateFormat": "MM/DD/YYYY", "timeFormat": "12h"}'::jsonb NOT NULL,
    communication JSONB DEFAULT '{"allowMessages": true, "allowInvites": true, "blockedUsers": []}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User metadata table (flexible key-value storage)
CREATE TABLE users.metadata (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- User activity log
CREATE TABLE users.activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'auth', 'profile', 'settings', 'content', 'billing', 'api', 'admin'
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_activity_log_user_id ON users.activity_log(user_id);
CREATE INDEX idx_activity_log_type ON users.activity_log(type);
CREATE INDEX idx_activity_log_timestamp ON users.activity_log(timestamp);
CREATE INDEX idx_activity_log_resource ON users.activity_log(resource_type, resource_id) WHERE resource_type IS NOT NULL;

-- User files/media
CREATE TABLE users.files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'avatar', 'document', 'attachment'
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    storage_key VARCHAR(500) NOT NULL, -- Storage service key/path
    url VARCHAR(1000),
    thumbnail_url VARCHAR(1000),
    metadata JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_files_user_id ON users.files(user_id);
CREATE INDEX idx_user_files_type ON users.files(type);

-- User relationships (for blocking, following, etc.)
CREATE TABLE users.relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'blocked', 'following', 'friend'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CONSTRAINT unique_relationship UNIQUE (user_id, target_user_id, type),
    CONSTRAINT no_self_relationship CHECK (user_id != target_user_id)
);

CREATE INDEX idx_relationships_user_id ON users.relationships(user_id, type);
CREATE INDEX idx_relationships_target_user_id ON users.relationships(target_user_id, type);

-- User search table (for full-text search)
CREATE TABLE users.search_index (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    search_vector tsvector,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_user_search_vector ON users.search_index USING gin(search_vector);

-- Function to update search index
CREATE OR REPLACE FUNCTION users.update_user_search_index()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users.search_index (user_id, search_vector)
    VALUES (
        NEW.user_id,
        setweight(to_tsvector('english', COALESCE(NEW.display_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C')
    )
    ON CONFLICT (user_id) DO UPDATE
    SET search_vector = EXCLUDED.search_vector,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search index when profile changes
CREATE TRIGGER update_user_search_index_trigger
AFTER INSERT OR UPDATE ON users.profiles
FOR EACH ROW
EXECUTE FUNCTION users.update_user_search_index();

-- GDPR compliance tables
CREATE TABLE users.data_export_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    export_url VARCHAR(1000),
    expires_at TIMESTAMP WITH TIME ZONE,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_export_requests_user_id ON users.data_export_requests(user_id);
CREATE INDEX idx_export_requests_status ON users.data_export_requests(status) WHERE status IN ('pending', 'processing');

CREATE TABLE users.deletion_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'scheduled', 'completed', 'cancelled'
    reason TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE, -- Grace period before deletion
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_deletion_requests_user_id ON users.deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_scheduled ON users.deletion_requests(scheduled_for) WHERE status = 'scheduled';

-- Create updated_at trigger for user tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON users.profiles
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON users.addresses
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_user_status_updated_at BEFORE UPDATE ON users.status
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON users.preferences
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

CREATE TRIGGER update_user_metadata_updated_at BEFORE UPDATE ON users.metadata
    FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

-- View for complete user information
CREATE OR REPLACE VIEW users.user_details AS
SELECT 
    u.id,
    u.email,
    u.email_verified,
    u.created_at,
    u.updated_at,
    u.last_login_at,
    u.login_count,
    p.first_name,
    p.last_name,
    p.display_name,
    p.avatar_url,
    p.bio,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.phone_verified,
    p.language,
    p.timezone,
    p.country,
    s.state as status,
    s.reason as status_reason,
    s.suspended_until,
    pref.notifications,
    pref.privacy,
    pref.appearance,
    pref.communication,
    m.data as metadata
FROM auth.users u
LEFT JOIN users.profiles p ON u.id = p.user_id
LEFT JOIN users.status s ON u.id = s.user_id
LEFT JOIN users.preferences pref ON u.id = pref.user_id
LEFT JOIN users.metadata m ON u.id = m.user_id
WHERE u.deleted_at IS NULL;