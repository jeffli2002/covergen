-- Create feedback table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    name TEXT,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('bug', 'feature', 'improvement', 'other')) DEFAULT 'other',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    page_url TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own feedback
CREATE POLICY "Users can insert their own feedback" ON public.feedback
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow service role to manage all feedback
CREATE POLICY "Service role can manage all feedback" ON public.feedback
    FOR ALL 
    USING (auth.role() = 'service_role');

-- Create policy to allow anonymous feedback submissions
CREATE POLICY "Allow anonymous feedback" ON public.feedback
    FOR INSERT 
    WITH CHECK (user_id IS NULL);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT ON public.feedback TO authenticated;