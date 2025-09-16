// OAuth流程调试分析

/**
 * OAuth登录流程：
 * 1. 用户点击"Sign in with Google" → 调用 signInWithGoogleAction
 * 2. 服务端生成OAuth URL并重定向到Google
 * 3. Google验证后回调到 /auth/callback?code=xxx
 * 4. /auth/callback/route.ts 用code换取session
 * 5. 如果成功，创建auth.users记录和session cookies
 * 6. 重定向回应用页面
 * 7. 客户端authService初始化时读取session
 */

// 问题诊断步骤：

// 1. 验证OAuth回调是否真的成功
export const CHECK_OAUTH_CALLBACK = `
// 在 /auth/callback/route.ts 添加更详细的日志
const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

if (!exchangeError) {
  // 检查是否真的创建了用户
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[OAuth Debug] User after exchange:', {
    id: user?.id,
    email: user?.email,
    created_at: user?.created_at,
    last_sign_in_at: user?.last_sign_in_at
  })
  
  // 检查session是否存在
  const { data: { session } } = await supabase.auth.getSession()
  console.log('[OAuth Debug] Session after exchange:', {
    access_token: session?.access_token ? 'present' : 'missing',
    refresh_token: session?.refresh_token ? 'present' : 'missing',
    expires_at: session?.expires_at,
    user_id: session?.user?.id
  })
}
`

// 2. 检查cookies是否正确设置
export const CHECK_COOKIES = `
// 在设置cookie后立即验证
set(name: string, value: string, options: CookieOptions) {
  response.cookies.set({ name, value, ...options })
  
  // 添加验证
  const setCookie = response.cookies.get(name)
  console.log('[OAuth Debug] Cookie set verification:', {
    name,
    valueLength: value?.length,
    wasSet: !!setCookie,
    options
  })
}
`

// 3. 验证客户端是否能读取到cookies
export const CHECK_CLIENT_COOKIES = `
// 在authService初始化时
console.log('[Auth Debug] All cookies:', document.cookie)
console.log('[Auth Debug] Supabase cookies:', 
  document.cookie.split(';')
    .filter(c => c.trim().startsWith('sb-'))
    .map(c => {
      const [name] = c.trim().split('=')
      return name
    })
)
`

// 4. 可能的问题原因：

export const POSSIBLE_ISSUES = `
1. OAuth回调成功但没有创建auth.users记录
   - 检查Supabase Dashboard中的Auth Settings
   - 确认Google OAuth provider已启用
   - 检查Redirect URLs配置

2. auth.users创建了但session没有持久化
   - Cookie设置问题（SameSite, Secure等）
   - Cookie domain不匹配
   - Cookie被浏览器拒绝

3. Session存在但客户端读取失败
   - Cookie名称不匹配
   - Cookie path问题
   - 服务端和客户端的Supabase实例不一致

4. Supabase配置问题
   - JWT secret不匹配
   - Site URL配置错误
   - Cookie domain配置问题
`

// 5. 建议的修复方案
export const FIX_OAUTH_ISSUE = `
// 方案1：确保OAuth回调正确处理
// /auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log('[OAuth Debug] Getting cookie:', name, '→', !!cookie)
            return cookie?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            console.log('[OAuth Debug] Setting cookie:', name, 'with options:', options)
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            console.log('[OAuth Debug] Removing cookie:', name)
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )
    
    // 交换code获取session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 验证用户确实登录了
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('[OAuth Success] User:', user?.email, 'Session:', !!session)
      
      // 添加成功标记到URL
      return NextResponse.redirect(\`\${origin}\${next}?oauth_success=true\`)
    }
    
    console.error('[OAuth Failed] Error:', error)
    return NextResponse.redirect(\`\${origin}/auth/error\`)
  }
}

// 方案2：客户端强制刷新session
// 在主页面或_app.tsx中
useEffect(() => {
  const checkOAuthSuccess = async () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('oauth_success') === 'true') {
      console.log('[App] OAuth success detected, forcing session refresh')
      
      // 等待cookies完全写入
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 强制重新初始化auth
      const { supabase } = await import('@/lib/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        console.log('[App] Session found after OAuth:', session.user.email)
        // 刷新页面或更新状态
        window.location.href = window.location.pathname
      } else {
        console.error('[App] No session found after OAuth success')
      }
    }
  }
  
  checkOAuthSuccess()
}, [])
`