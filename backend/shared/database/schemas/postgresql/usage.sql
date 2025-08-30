-- Usage tracking table
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX idx_user_usage_user_date ON user_usage(user_id, date);

-- RLS policies
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_user_usage(p_user_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, date, generation_count)
  VALUES (p_user_id, p_date, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    generation_count = user_usage.generation_count + 1,
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_usage TO authenticated;