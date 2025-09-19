# Chrome OAuth SameSite Cookie 修复指南

## 问题描述
Chrome浏览器在跨站点OAuth流程中会静默丢弃没有正确设置`SameSite=None; Secure`的认证cookie，导致OAuth在Chrome中失败，但在Edge浏览器中正常工作。

## 根本原因
Chrome浏览器对跨站点cookie有更严格的安全要求：
1. 跨站点OAuth流程需要`SameSite=None`
2. `SameSite=None`的cookie必须同时设置`Secure`标志
3. 必须在HTTPS环境下才能使用`Secure`标志

## 修复方案

### 1. 更新Supabase客户端配置

已修复以下文件中的cookie配置：

#### `src/lib/supabase.ts`
```typescript
// 为OAuth流程设置SameSite=None; Secure以兼容Chrome
const isOAuthFlow = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
const sameSiteValue = isOAuthFlow ? 'None' : (options?.sameSite || 'Lax')
cookieParts.push(`SameSite=${sameSiteValue}`)

// SameSite=None的cookie必须设置Secure标志
if (sameSiteValue === 'None' || window.location.protocol === 'https:' || options?.secure) {
  cookieParts.push('Secure')
}
```

#### `src/utils/supabase/client.ts`
```typescript
// 为OAuth流程设置SameSite=None; Secure以兼容Chrome
const isOAuthFlow = name.startsWith('sb-') && (name.includes('auth') || name.includes('session'))
const sameSiteValue = isOAuthFlow ? 'None' : (options?.sameSite || 'lax')
cookieString += `; samesite=${sameSiteValue}`

// SameSite=None的cookie必须设置Secure标志
if (sameSiteValue === 'None' || options?.secure) {
  cookieString += `; secure`
}
```

#### `src/lib/supabase-oauth-config.ts`
```typescript
// OAuth流程需要SameSite=None; Secure以兼容Chrome
const cookieOptions = {
  domain: isProduction && typeof window !== 'undefined' 
    ? `.${window.location.hostname.replace('www.', '')}` 
    : undefined,
  sameSite: 'none' as const, // Chrome跨站点OAuth流程必需
  secure: true, // SameSite=None时必需
  maxAge: 60 * 60 * 24 * 30, // 30天
}
```

### 2. 环境要求

#### 生产环境
- ✅ 必须使用HTTPS
- ✅ 域名配置正确
- ✅ Supabase项目URL配置正确

#### 开发环境
- ⚠️ localhost不支持HTTPS，SameSite=None可能不工作
- 🔧 建议使用ngrok等工具创建HTTPS隧道进行测试

### 3. 验证修复

#### Chrome浏览器测试步骤：
1. 清除所有相关cookie
2. 访问应用并尝试Google OAuth登录
3. 检查浏览器开发者工具 → Application → Cookies
4. 确认Supabase相关cookie设置了`SameSite=None; Secure`

#### Edge浏览器兼容性：
- Edge浏览器对SameSite=None的支持更宽松
- 修复后Edge浏览器应该继续正常工作

### 4. 调试技巧

#### 检查Cookie设置：
```javascript
// 在浏览器控制台中检查cookie
document.cookie.split(';').forEach(cookie => {
  if (cookie.includes('sb-')) {
    console.log(cookie.trim())
  }
})
```

#### 网络请求检查：
1. 打开Chrome开发者工具 → Network
2. 尝试OAuth登录
3. 查看OAuth重定向请求中的cookie头
4. 确认cookie包含`SameSite=None; Secure`

## 注意事项

1. **HTTPS要求**：`SameSite=None; Secure`只能在HTTPS环境下工作
2. **浏览器兼容性**：Chrome 80+对SameSite有更严格的要求
3. **测试环境**：本地开发可能需要特殊配置或使用HTTPS隧道

## 相关文档

- [Chrome SameSite Cookie 更新](https://web.dev/samesite-cookies-explained/)
- [Supabase Auth 配置](https://supabase.com/docs/guides/auth)
- [OAuth 2.0 安全最佳实践](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
