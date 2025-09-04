-- Create API licenses table for Pro+ tier users
CREATE TABLE IF NOT EXISTS public.api_licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  license_key TEXT NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_licenses_user_id ON public.api_licenses(user_id);
CREATE INDEX idx_api_licenses_license_key ON public.api_licenses(license_key);
CREATE INDEX idx_api_licenses_status ON public.api_licenses(status);

-- RLS policies
ALTER TABLE public.api_licenses ENABLE ROW LEVEL SECURITY;

-- Users can only view their own licenses
CREATE POLICY "Users can view own licenses" ON public.api_licenses
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can manage licenses
CREATE POLICY "Service role can manage licenses" ON public.api_licenses
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add helpful comment
COMMENT ON TABLE public.api_licenses IS 'Stores API license keys for Pro+ tier users';