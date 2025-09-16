# 生产环境OAuth失败分析

## 问题原因

根据开发模式日志，OAuth在本地能正常工作，但在生产环境失败。主要差异可能在于：

### 1. **Cookie域名问题**
开发环境：`localhost:3001`
生产环境：实际域名（如 `coverimage.app`）

**问题**：
- Supabase设置的cookie domain可能不匹配
- SameSite策略在跨域时更严格

### 2. **HTTPS vs HTTP**
开发环境：`http://localhost:3001`
生产环境：`https://coverimage.app`

**问题**：
- Secure cookie在HTTP环境下不会被设置
- 生产环境的cookie可能需要 `Secure: true`

### 3. **Supabase配置不一致**

检查项：
```bash
# 开发环境 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# 生产环境 (.env.production)
NEXT_PUBLIC_SITE_URL=https://coverimage.app  # 必须与实际域名匹配！
```

### 4. **Supabase Dashboard设置**

需要检查：
1. **Site URL**（Authentication > URL Configuration）
   - 必须设置为生产环境的URL
   - 例如：`https://coverimage.app`

2. **Redirect URLs**（Authentication > URL Configuration）
   - 必须包含：
     - `https://coverimage.app/auth/callback`
     - `https://coverimage.app/*` （通配符）

3. **Cookie设置**（可能的问题）
   - Cookie domain设置
   - SameSite策略

## 诊断步骤

### 1. 添加生产环境调试日志

```typescript
// 在 /src/app/auth/callback/route.ts 临时添加
console.log('[OAuth Debug Production] Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  origin: request.headers.get('origin'),
  host: request.headers.get('host'),
  protocol: request.headers.get('x-forwarded-proto') || 'http'
})
```

### 2. 检查Cookie设置

```typescript
// 在生产环境的浏览器控制台运行
console.log('All cookies:', document.cookie)
console.log('Supabase cookies:', 
  document.cookie.split(';')
    .filter(c => c.trim().startsWith('sb-'))
    .map(c => c.trim())
)
```

### 3. 验证OAuth URL

在生产环境尝试OAuth登录时，检查：
1. Google OAuth重定向的URL是否正确
2. 回调URL是否包含正确的域名
3. 是否有任何重定向错误

## 修复方案

### 方案1：确保环境变量正确

```bash
# .env.production
NEXT_PUBLIC_SITE_URL=https://你的实际域名
```

### 方案2：更新Supabase客户端配置

```typescript
// /src/lib/supabase.ts
browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: true, // 临时开启调试
    // 添加cookie配置
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') return null
        return window.localStorage.getItem(key)
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return
        window.localStorage.setItem(key, value)
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return
        window.localStorage.removeItem(key)
      }
    }
  },
  // 确保cookie配置正确
  cookies: {
    domain: process.env.NODE_ENV === 'production' 
      ? '.你的域名.com'  // 注意前面的点
      : undefined,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
})
```

### 方案3：检查中间件

```typescript
// /src/middleware.ts
// 确保生产环境的cookie能被正确读取
const supabase = createMiddlewareClient({ req, res })
```

### 方案4：使用服务端Session刷新

在OAuth回调成功后，强制刷新session：

```typescript
// 在主页面添加
useEffect(() => {
  // 检测OAuth成功参数
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('oauth_success') === 'true') {
    // 等待cookie写入
    setTimeout(async () => {
      // 强制重新初始化Supabase客户端
      window.location.reload()
    }, 1000)
  }
}, [])
```

## 最可能的原因

基于开发环境能工作的事实，最可能的原因是：

1. **NEXT_PUBLIC_SITE_URL** 在生产环境设置不正确
2. **Supabase Dashboard** 的 Site URL 和 Redirect URLs 没有配置生产域名
3. **Cookie domain** 不匹配导致session无法持久化

建议先检查这三项配置。