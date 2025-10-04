-- Migration: Add sora_video_tasks table for tracking successful video generations
-- Purpose: Prevent double-charging users when polling task status multiple times
-- Date: 2025-10-04

-- Create sora_video_tasks table
CREATE TABLE IF NOT EXISTS public.sora_video_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by task_id
CREATE INDEX IF NOT EXISTS idx_sora_video_tasks_task_id ON public.sora_video_tasks(task_id);

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_sora_video_tasks_user_id ON public.sora_video_tasks(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.sora_video_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own tasks
CREATE POLICY sora_video_tasks_select_own ON public.sora_video_tasks
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert tasks (API usage tracking)
CREATE POLICY sora_video_tasks_service_insert ON public.sora_video_tasks
  FOR INSERT
  WITH CHECK (true);

-- Add comment explaining the table purpose
COMMENT ON TABLE public.sora_video_tasks IS 'Tracks successful Sora video generation tasks to prevent double-charging users when they poll task status multiple times';
COMMENT ON COLUMN public.sora_video_tasks.task_id IS 'Unique task ID from Sora API';
COMMENT ON COLUMN public.sora_video_tasks.user_id IS 'User who created the video generation task';
COMMENT ON COLUMN public.sora_video_tasks.status IS 'Status of the task (success, failed, etc)';
COMMENT ON COLUMN public.sora_video_tasks.created_at IS 'When the task was first marked as successful';
