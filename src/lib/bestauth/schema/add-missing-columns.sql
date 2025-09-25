-- Add missing columns to bestauth_users table

-- Add standard user columns
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS name TEXT;

ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add columns for Supabase mapping
ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS supabase_id UUID;

ALTER TABLE bestauth_users 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_users_email ON bestauth_users(email);
CREATE INDEX IF NOT EXISTS idx_bestauth_users_created_at ON bestauth_users(created_at);
CREATE INDEX IF NOT EXISTS idx_bestauth_users_supabase_id ON bestauth_users(supabase_id);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bestauth_users_updated_at') THEN
        CREATE TRIGGER update_bestauth_users_updated_at 
        BEFORE UPDATE ON bestauth_users 
        FOR EACH ROW 
        EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END;
$$;

-- Verify the columns were added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bestauth_users'
ORDER BY ordinal_position;