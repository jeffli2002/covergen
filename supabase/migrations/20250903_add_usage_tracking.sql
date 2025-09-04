-- Add usage tracking tables for rate limiting

-- Table to track anonymous usage
CREATE TABLE IF NOT EXISTS anonymous_usage (
    id BIGSERIAL PRIMARY KEY,
    anonymous_id VARCHAR(64) NOT NULL,
    month_key VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    usage_count INTEGER NOT NULL DEFAULT 0,
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint to ensure one record per anonymous_id per month
    UNIQUE(anonymous_id, month_key)
);

-- Index for faster lookups
CREATE INDEX idx_anonymous_usage_id_month ON anonymous_usage(anonymous_id, month_key);

-- Table to track authenticated user usage
CREATE TABLE IF NOT EXISTS user_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_key VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    usage_count INTEGER NOT NULL DEFAULT 0,
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'free',
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint to ensure one record per user per month
    UNIQUE(user_id, month_key)
);

-- Index for faster lookups
CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month_key);

-- Table to log all generation attempts for analytics
CREATE TABLE IF NOT EXISTS generation_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    anonymous_id VARCHAR(64),
    platform VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'success', 'rate_limited', 'platform_restricted', 'error'
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure either user_id or anonymous_id is present
    CHECK (user_id IS NOT NULL OR anonymous_id IS NOT NULL)
);

-- Indexes for analytics queries
CREATE INDEX idx_generation_logs_user ON generation_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_generation_logs_anonymous ON generation_logs(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX idx_generation_logs_created ON generation_logs(created_at);
CREATE INDEX idx_generation_logs_platform ON generation_logs(platform);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_anonymous_usage_updated_at BEFORE UPDATE ON anonymous_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment anonymous usage
CREATE OR REPLACE FUNCTION increment_anonymous_usage(
    p_anonymous_id VARCHAR(64),
    p_month_key VARCHAR(7)
) RETURNS INTEGER AS $$
DECLARE
    v_usage_count INTEGER;
BEGIN
    INSERT INTO anonymous_usage (anonymous_id, month_key, usage_count, last_used_at)
    VALUES (p_anonymous_id, p_month_key, 1, NOW())
    ON CONFLICT (anonymous_id, month_key)
    DO UPDATE SET 
        usage_count = anonymous_usage.usage_count + 1,
        last_used_at = NOW()
    RETURNING usage_count INTO v_usage_count;
    
    RETURN v_usage_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(
    p_user_id UUID,
    p_month_key VARCHAR(7),
    p_subscription_tier VARCHAR(50)
) RETURNS INTEGER AS $$
DECLARE
    v_usage_count INTEGER;
BEGIN
    INSERT INTO user_usage (user_id, month_key, usage_count, subscription_tier, last_used_at)
    VALUES (p_user_id, p_month_key, 1, p_subscription_tier, NOW())
    ON CONFLICT (user_id, month_key)
    DO UPDATE SET 
        usage_count = user_usage.usage_count + 1,
        subscription_tier = p_subscription_tier,
        last_used_at = NOW()
    RETURNING usage_count INTO v_usage_count;
    
    RETURN v_usage_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get anonymous usage count
CREATE OR REPLACE FUNCTION get_anonymous_usage(
    p_anonymous_id VARCHAR(64),
    p_month_key VARCHAR(7)
) RETURNS INTEGER AS $$
DECLARE
    v_usage_count INTEGER;
BEGIN
    SELECT usage_count INTO v_usage_count
    FROM anonymous_usage
    WHERE anonymous_id = p_anonymous_id AND month_key = p_month_key;
    
    RETURN COALESCE(v_usage_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get user usage count
CREATE OR REPLACE FUNCTION get_user_usage(
    p_user_id UUID,
    p_month_key VARCHAR(7)
) RETURNS INTEGER AS $$
DECLARE
    v_usage_count INTEGER;
BEGIN
    SELECT usage_count INTO v_usage_count
    FROM user_usage
    WHERE user_id = p_user_id AND month_key = p_month_key;
    
    RETURN COALESCE(v_usage_count, 0);
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE anonymous_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous usage: No direct access from client
CREATE POLICY "Anonymous usage is managed by backend only" ON anonymous_usage
    FOR ALL TO authenticated, anon
    USING (false);

-- User usage: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON user_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Generation logs: No direct access from client
CREATE POLICY "Generation logs are managed by backend only" ON generation_logs
    FOR ALL TO authenticated, anon
    USING (false);

-- Grant necessary permissions to service role
GRANT ALL ON anonymous_usage TO service_role;
GRANT ALL ON user_usage TO service_role;
GRANT ALL ON generation_logs TO service_role;
GRANT ALL ON SEQUENCE anonymous_usage_id_seq TO service_role;
GRANT ALL ON SEQUENCE user_usage_id_seq TO service_role;
GRANT ALL ON SEQUENCE generation_logs_id_seq TO service_role;