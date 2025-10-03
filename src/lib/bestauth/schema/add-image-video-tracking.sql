-- Migration: Add separate image and video tracking columns
-- This migration adds separate tracking for images and videos

-- Step 1: Add new columns to bestauth_usage_tracking
ALTER TABLE bestauth_usage_tracking 
ADD COLUMN IF NOT EXISTS image_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_count INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrate existing data (assuming all previous generations were images)
UPDATE bestauth_usage_tracking 
SET image_count = generation_count
WHERE image_count = 0 AND generation_count > 0;

-- Step 3: Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_bestauth_usage_tracking_counts 
ON bestauth_usage_tracking(user_id, date, image_count, video_count);

-- Step 4: Add comment explaining the columns
COMMENT ON COLUMN bestauth_usage_tracking.image_count IS 'Number of images generated on this date';
COMMENT ON COLUMN bestauth_usage_tracking.video_count IS 'Number of videos generated on this date';
COMMENT ON COLUMN bestauth_usage_tracking.generation_count IS 'DEPRECATED: Total generations (kept for backwards compatibility)';

-- Step 5: Create helper function to get usage summary
CREATE OR REPLACE FUNCTION get_user_usage_summary(p_user_id UUID, p_date DATE)
RETURNS TABLE(
  image_count INTEGER,
  video_count INTEGER,
  total_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ut.image_count, 0) as image_count,
    COALESCE(ut.video_count, 0) as video_count,
    COALESCE(ut.image_count, 0) + COALESCE(ut.video_count, 0) as total_count
  FROM bestauth_usage_tracking ut
  WHERE ut.user_id = p_user_id 
    AND ut.date = p_date;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to increment image count
CREATE OR REPLACE FUNCTION increment_image_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO bestauth_usage_tracking (user_id, date, image_count, video_count, generation_count)
  VALUES (p_user_id, CURRENT_DATE, 1, 0, 1)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    image_count = bestauth_usage_tracking.image_count + 1,
    generation_count = bestauth_usage_tracking.generation_count + 1,
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create function to increment video count
CREATE OR REPLACE FUNCTION increment_video_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO bestauth_usage_tracking (user_id, date, image_count, video_count, generation_count)
  VALUES (p_user_id, CURRENT_DATE, 0, 1, 1)
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    video_count = bestauth_usage_tracking.video_count + 1,
    generation_count = bestauth_usage_tracking.generation_count + 1,
    updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;
