-- Create usage tracking table for BestAuth
CREATE TABLE IF NOT EXISTS bestauth_usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  generation_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one record per user per day
  UNIQUE(user_id, date)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_user_date 
ON bestauth_usage_tracking(user_id, date);

-- Create index for date range queries
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_date 
ON bestauth_usage_tracking(date);

-- Enable RLS (Row Level Security)
ALTER TABLE bestauth_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can view their own usage" 
ON bestauth_usage_tracking FOR SELECT 
USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can insert their own usage" 
ON bestauth_usage_tracking FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own usage" ON bestauth_usage_tracking;
CREATE POLICY "Users can update their own usage" 
ON bestauth_usage_tracking FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bestauth_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_bestauth_usage_tracking_updated_at ON bestauth_usage_tracking;
CREATE TRIGGER trigger_update_bestauth_usage_tracking_updated_at
  BEFORE UPDATE ON bestauth_usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_bestauth_usage_tracking_updated_at();