# Feedback Feature Setup Guide

## Overview
The feedback feature has been implemented using Supabase to store user feedback. The system supports both authenticated and anonymous feedback submissions.

## Setup Instructions

### 1. Database Setup
Run the following SQL in your Supabase SQL editor to create the feedback table:

```sql
-- Create feedback table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
CREATE INDEX idx_feedback_type ON public.feedback(type);

-- Enable Row Level Security
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own feedback" ON public.feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own feedback" ON public.feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit feedback" ON public.feedback
    FOR INSERT WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Environment Variables
Add the following to your `.env.local` file:

```env
# Get the service role key from Supabase dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important**: Never commit the service role key to version control. It has full access to your database.

### 3. Implementation Details

#### API Endpoint
- **Location**: `/api/feedback`
- **Method**: POST
- **Features**:
  - Validates rating (1-5)
  - Associates feedback with authenticated users if logged in
  - Captures page URL and user agent
  - Maps feedback context to appropriate types

#### Frontend Integration
The existing `feedback-modal.tsx` component automatically sends feedback to the API endpoint. It supports three contexts:
- `generation`: Feedback about the generation experience
- `result`: Feedback about generated covers
- `general`: General feedback

### 4. Testing the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the application and trigger the feedback modal

3. Submit feedback with different ratings and messages

4. Check your Supabase dashboard to verify the feedback is being stored

### 5. Monitoring Feedback

You can view submitted feedback in your Supabase dashboard:
1. Go to Table Editor
2. Select the `feedback` table
3. View all submitted feedback entries

### 6. Security Considerations

- The service role key is only used server-side in the API route
- Row Level Security (RLS) ensures users can only view their own feedback
- Anonymous feedback is allowed for better user experience
- All inputs are validated before storage

## Troubleshooting

### Common Issues

1. **"Supabase credentials not configured" error**
   - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables
   - Restart your development server after adding the variable

2. **Feedback not saving**
   - Check the browser console for errors
   - Verify the feedback table exists in your Supabase database
   - Ensure RLS policies are correctly set up

3. **Authentication issues**
   - The system works for both authenticated and anonymous users
   - If authenticated, the feedback will be associated with the user ID

## Future Enhancements

Consider adding:
- Admin dashboard to view all feedback
- Email notifications for critical feedback
- Feedback analytics and reporting
- Automatic sentiment analysis
- Response tracking for user follow-ups