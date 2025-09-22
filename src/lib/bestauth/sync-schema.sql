-- BestAuth Sync and Migration Schema
-- This schema handles synchronization between Supabase auth and BestAuth

-- User ID mapping table
CREATE TABLE IF NOT EXISTS user_id_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supabase_user_id UUID UNIQUE NOT NULL,
  bestauth_user_id UUID UNIQUE NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sync_status TEXT DEFAULT 'active' CHECK (sync_status IN ('active', 'pending', 'error')),
  last_synced_at TIMESTAMPTZ,
  sync_metadata JSONB
);

CREATE INDEX idx_user_mapping_supabase ON user_id_mapping(supabase_user_id);
CREATE INDEX idx_user_mapping_bestauth ON user_id_mapping(bestauth_user_id);
CREATE INDEX idx_user_mapping_status ON user_id_mapping(sync_status);

-- Unified session tracking
CREATE TABLE IF NOT EXISTS unified_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bestauth_session_id UUID REFERENCES bestauth_sessions(id) ON DELETE CASCADE,
  supabase_session_id TEXT,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_unified_sessions_bestauth ON unified_sessions(bestauth_session_id);
CREATE INDEX idx_unified_sessions_user ON unified_sessions(user_id);
CREATE INDEX idx_unified_sessions_expires ON unified_sessions(expires_at);

-- Sync operation log
CREATE TABLE IF NOT EXISTS sync_operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL CHECK (operation_type IN (
    'user_create', 'user_update', 'user_delete',
    'session_create', 'session_sync', 'session_delete',
    'profile_sync', 'subscription_sync'
  )),
  source_system TEXT NOT NULL CHECK (source_system IN ('supabase', 'bestauth')),
  target_system TEXT NOT NULL CHECK (target_system IN ('supabase', 'bestauth')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('user', 'session', 'profile', 'subscription')),
  entity_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_ops_type ON sync_operations(operation_type);
CREATE INDEX idx_sync_ops_status ON sync_operations(status);
CREATE INDEX idx_sync_ops_entity ON sync_operations(entity_type, entity_id);
CREATE INDEX idx_sync_ops_created ON sync_operations(created_at);

-- Migration tracking
CREATE TABLE IF NOT EXISTS migration_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL,
  migration_type TEXT NOT NULL CHECK (migration_type IN ('full', 'incremental', 'repair')),
  total_users INTEGER NOT NULL,
  migrated_users INTEGER DEFAULT 0,
  failed_users INTEGER DEFAULT 0,
  skipped_users INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_log JSONB,
  configuration JSONB
);

CREATE INDEX idx_migration_batch ON migration_status(batch_id);
CREATE INDEX idx_migration_status ON migration_status(status);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_sync_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_user_mapping_updated_at BEFORE UPDATE ON user_id_mapping
  FOR EACH ROW EXECUTE FUNCTION update_sync_updated_at();

-- Function to get or create user mapping
CREATE OR REPLACE FUNCTION get_or_create_user_mapping(
  p_supabase_user_id UUID,
  p_bestauth_user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_mapping_id UUID;
BEGIN
  -- Try to get existing mapping
  SELECT id INTO v_mapping_id
  FROM user_id_mapping
  WHERE supabase_user_id = p_supabase_user_id
    OR bestauth_user_id = p_bestauth_user_id;
  
  -- If no mapping exists, create one
  IF v_mapping_id IS NULL THEN
    INSERT INTO user_id_mapping (supabase_user_id, bestauth_user_id)
    VALUES (p_supabase_user_id, p_bestauth_user_id)
    RETURNING id INTO v_mapping_id;
  END IF;
  
  RETURN v_mapping_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log sync operation
CREATE OR REPLACE FUNCTION log_sync_operation(
  p_operation_type TEXT,
  p_source_system TEXT,
  p_target_system TEXT,
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_operation_id UUID;
BEGIN
  INSERT INTO sync_operations (
    operation_type,
    source_system,
    target_system,
    entity_type,
    entity_id,
    status,
    error_message,
    metadata
  ) VALUES (
    p_operation_type,
    p_source_system,
    p_target_system,
    p_entity_type,
    p_entity_id,
    p_status,
    p_error_message,
    p_metadata
  ) RETURNING id INTO v_operation_id;
  
  RETURN v_operation_id;
END;
$$ LANGUAGE plpgsql;

-- View for active user mappings with user details
CREATE OR REPLACE VIEW v_active_user_mappings AS
SELECT 
  um.id AS mapping_id,
  um.supabase_user_id,
  um.bestauth_user_id,
  bu.email,
  bu.name,
  bu.email_verified,
  um.sync_status,
  um.last_synced_at,
  um.created_at,
  um.updated_at
FROM user_id_mapping um
JOIN bestauth_users bu ON bu.id = um.bestauth_user_id
WHERE um.sync_status = 'active';

-- View for sync operation statistics
CREATE OR REPLACE VIEW v_sync_operation_stats AS
SELECT 
  operation_type,
  source_system,
  target_system,
  status,
  COUNT(*) as operation_count,
  MAX(created_at) as last_operation
FROM sync_operations
GROUP BY operation_type, source_system, target_system, status;

-- RLS policies
ALTER TABLE user_id_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE unified_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access" ON user_id_mapping
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access" ON unified_sessions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access" ON sync_operations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access" ON migration_status
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');