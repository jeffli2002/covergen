// OAuth登录后不显示登录状态的问题分析和修复方案

/**
 * 问题分析：
 * 
 * 1. profiles表不是问题的根本原因
 *    - authService.onSignIn()中的profiles表更新即使失败，也不影响登录状态
 *    - Header组件主要依赖auth.users表的数据，不直接读取profiles表
 * 
 * 2. 真正的问题在于客户端会话同步
 *    - OAuth回调在服务端成功创建了会话（/auth/callback/route.ts）
 *    - 但客户端authService初始化时可能无法正确获取这个会话
 *    - 原因：3秒超时限制可能导致getSession()调用失败
 * 
 * 3. 具体流程：
 *    a) 用户点击Google登录 → 跳转到Google
 *    b) Google回调到 /auth/callback → 服务端创建会话
 *    c) 服务端重定向到主页 → 客户端authService初始化
 *    d) authService.getSession()可能超时 → 用户显示为未登录
 */

// 修复方案1：增加getSession超时时间
const FIX_1 = `
// 在 authService.ts 的 _doInitialize 方法中
const sessionPromise = supabase.auth.getSession()
const timeoutPromise = new Promise((_, reject) => 
  // 将超时从3秒增加到10秒
  setTimeout(() => reject(new Error('Session check timeout')), 10000)
)
`

// 修复方案2：添加重试机制
const FIX_2 = `
private async _doInitialize() {
  try {
    console.log('[Auth] Starting initialization...')
    
    const supabase = this.getSupabase()
    if (!supabase) {
      console.warn('[Auth] Supabase not configured')
      this.initialized = true
      return false
    }

    // 添加重试机制
    let session = null
    let retries = 0
    const maxRetries = 3
    
    while (!session && retries < maxRetries) {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (!error && currentSession) {
          session = currentSession
          break
        }
        
        if (error) {
          console.warn(\`[Auth] Session check attempt \${retries + 1} failed:\`, error)
        }
        
        retries++
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error(\`[Auth] Session check error on attempt \${retries + 1}:\`, error)
        retries++
      }
    }
    
    if (session) {
      console.log('[Auth] Setting session from Supabase')
      this.session = session
      this.user = session.user
      this.storeSession(session)
      
      if (this.onAuthChange) {
        this.onAuthChange(this.user)
      }
    } else {
      console.log('[Auth] No session found after retries')
    }
    
    this.initialized = true
    
    // ... 继续其他初始化逻辑
  } catch (error) {
    console.error('Error initializing auth:', error)
    return false
  }
}
`

// 修复方案3：确保profiles表有正确的RLS策略
const FIX_3_SQL = `
-- 确保profiles表存在并有正确的权限
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    quota_limit INTEGER DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 创建新策略
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 授予权限
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
`

// 修复方案4：在OAuth回调后强制刷新会话
const FIX_4 = `
// 在主页面组件中添加OAuth回调检测
useEffect(() => {
  const checkOAuthCallback = async () => {
    // 检查URL是否包含OAuth成功的标记
    const urlParams = new URLSearchParams(window.location.search)
    const justAuthenticated = urlParams.get('authenticated') === 'true'
    
    if (justAuthenticated) {
      console.log('[App] Detected OAuth callback, refreshing auth state')
      
      // 等待一下让服务端会话完全建立
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 强制刷新认证状态
      await authService.initialize()
      await refreshUser()
      
      // 清除URL参数
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
  
  checkOAuthCallback()
}, [])
`

export const RECOMMENDED_FIX = `
推荐的修复步骤：

1. 首先执行SQL脚本修复profiles表权限（FIX_3_SQL）

2. 修改 authService.ts 增加重试机制（FIX_2）

3. 在OAuth回调路由中添加成功标记：
   // 在 /auth/callback/route.ts 中
   return NextResponse.redirect(\`\${origin}\${next}?authenticated=true\`)

4. 在主应用组件中检测OAuth回调并刷新会话（FIX_4）

5. 监控日志确认问题解决：
   - [Auth] Session check result 应该显示 hasSession: true
   - [Header] Auth state 应该显示正确的用户邮箱
`