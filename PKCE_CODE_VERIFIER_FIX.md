# PKCE Code Verifier 修复

## 问题描述
修复SameSite cookie后出现新的OAuth错误：
```
invalid request: both auth code and code verifier should be non-empty
```

## 根本原因
PKCE (Proof Key for Code Exchange) 流程需要特定的cookie设置来存储code verifier：
1. **Code Verifier**: PKCE流程中用于验证授权码的随机字符串
2. **Cookie存储**: Code verifier必须存储在浏览器cookie中
3. **跨站点要求**: OAuth重定向需要`SameSite=None; Secure`cookie

## 修复方案

### 1. 更新OAuth回调处理 (`src/app/auth/callback/route.ts`)
```typescript
// 为PKCE流程确保正确的cookie设置
const cookieOptions: CookieOptions = {
  ...options,
  // PKCE需要SameSite=None; Secure用于跨站点OAuth
  sameSite: 'none',
  secure: true,
  httpOnly: true,
  path: '/'
}

// 明确设置PKCE流程类型
auth: {
  flowType: 'pkce',
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true
}
```

### 2. 更新客户端Cookie配置
**`src/lib/supabase.ts`**:
```typescript
// 包含verifier cookie的OAuth流程检测
const isOAuthFlow = name.startsWith('sb-') && 
  (name.includes('auth') || name.includes('session') || name.includes('verifier'))
```

**`src/utils/supabase/client.ts`**:
```typescript
// 同样的verifier检测逻辑
const isOAuthFlow = name.startsWith('sb-') && 
  (name.includes('auth') || name.includes('session') || name.includes('verifier'))
```

## PKCE流程说明

### 正常流程：
1. **客户端**: 生成code verifier和code challenge
2. **存储**: Code verifier存储在cookie中（需要SameSite=None; Secure）
3. **OAuth**: 重定向到Google，携带code challenge
4. **回调**: Google返回授权码
5. **验证**: 使用存储的code verifier验证授权码
6. **交换**: 获取访问令牌

### 失败原因：
- Code verifier cookie没有正确设置`SameSite=None; Secure`
- Chrome浏览器丢弃了不兼容的cookie
- PKCE验证失败，导致"code verifier should be non-empty"错误

## 修复验证

修复后应该：
1. ✅ Chrome浏览器能正确存储PKCE code verifier
2. ✅ Edge浏览器继续正常工作
3. ✅ OAuth流程完整完成
4. ✅ 不再出现code verifier错误

## 测试步骤

1. 清除所有浏览器数据
2. 在Chrome中测试Google OAuth登录
3. 检查浏览器开发者工具 → Application → Cookies
4. 确认Supabase相关cookie设置了`SameSite=None; Secure`
5. 验证OAuth流程完整完成

## 重要注意事项

- **HTTPS必需**: `SameSite=None; Secure`只能在HTTPS环境下工作
- **PKCE安全**: Code verifier必须安全存储和传输
- **浏览器兼容**: 确保所有目标浏览器都支持SameSite=None
