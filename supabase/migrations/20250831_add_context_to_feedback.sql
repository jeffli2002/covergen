-- Add context column to feedback table to track feedback source
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS context TEXT CHECK (context IN ('general', 'generation', 'result')) DEFAULT 'general';

-- Create index on context for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_context ON public.feedback(context);

-- Add comment to describe the column
COMMENT ON COLUMN public.feedback.context IS 'Source context of feedback: general (homepage/feedback page), generation (during AI generation), result (after viewing results)';