-- 修复生产环境OAuth问题的SQL脚本
-- 在Supabase SQL Editor中运行

-- 1. 检查现有用户
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  raw_app_meta_data->>'provider' as provider
FROM auth.users 
WHERE email = 'jefflee2002@gmail.com';

-- 2. 检查profiles表是否有对应记录
SELECT * FROM public.profiles 
WHERE email = 'jefflee2002@gmail.com';

-- 3. 如果profiles表缺失记录，手动插入
INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'avatar_url',
  created_at,
  now()
FROM auth.users 
WHERE email = 'jefflee2002@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

-- 4. 检查RLS策略
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. 确保profiles表有正确的RLS策略
-- 删除旧策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 创建新策略
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. 检查会话
SELECT 
  id,
  user_id,
  created_at,
  updated_at
FROM auth.sessions
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'jefflee2002@gmail.com'
)
ORDER BY created_at DESC
LIMIT 5;