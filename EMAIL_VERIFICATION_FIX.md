# Email Verification Fix

## 问题描述

邮件验证功能不工作。

## 根本原因

发现了三个关键问题：

### 1. 数据库表不存在 ❌
`bestauth_verification_tokens` 表在数据库中不存在，导致无法存储验证 token。

### 2. Token 哈希不匹配 ❌
在 `src/lib/bestauth/core.ts` 中，token 被哈希后存储到数据库，但验证时使用原始 token 查找，导致验证失败。

### 3. 缺少 user_id 字段 ❌
数据库表结构要求 `user_id` 字段（NOT NULL），但代码创建 token 时没有提供。

---

## 已完成的修复

### ✅ 修复 1：更新 db.verificationTokens.create 方法

**文件**：`src/lib/bestauth/db.ts`

**修改**：
- 添加 `user_id` 参数
- 自动查找 user_id（如果未提供）
- 插入时包含 user_id 字段

```typescript
async create(data: { email: string, token: string, expires_at: Date, user_id?: string }): Promise<boolean> {
  // Find user_id if not provided
  let userId = data.user_id
  if (!userId) {
    const user = await db.users.findByEmail(data.email)
    if (!user) return false
    userId = user.id
  }
  
  // Insert with user_id
  const { error } = await getDb()
    .from('bestauth_verification_tokens')
    .insert({
      user_id: userId,
      token: data.token,
      expires_at: data.expires_at.toISOString(),
      created_at: new Date().toISOString()
    })
  
  return !error
}
```

### ✅ 修复 2：移除 token 哈希

**文件**：`src/lib/bestauth/core.ts`

**修改**：
- 使用 `crypto.randomBytes(32).toString('hex')` 生成 token
- 直接存储原始 token（不再哈希）
- 添加 `user_id` 参数

```typescript
// Generate verification token
const crypto = await import('crypto')
const verificationToken = crypto.randomBytes(32).toString('hex')

// Store verification token (store original token, not hash)
await db.verificationTokens.create({
  email: user.email,
  token: verificationToken,  // 存储原始 token
  expires_at: expiresAt,
  user_id: user.id  // 提供 user_id
})
```

---

## 需要手动执行的步骤

### ⚠️ 创建数据库表

**必须在 Supabase SQL Editor 中运行以下 SQL：**

1. 访问：https://supabase.com/dashboard
2. 选择您的项目
3. 点击左侧菜单的 "SQL Editor"
4. 创建新查询
5. 复制并粘贴以下 SQL：

```sql
-- Create verification tokens table for email verification
CREATE TABLE IF NOT EXISTS bestauth_verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES bestauth_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_token 
  ON bestauth_verification_tokens(token) WHERE used = false;

CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_user_id 
  ON bestauth_verification_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_bestauth_verification_tokens_expires 
  ON bestauth_verification_tokens(expires_at) WHERE used = false;

-- Grant permissions
GRANT ALL ON bestauth_verification_tokens TO authenticated;
GRANT SELECT ON bestauth_verification_tokens TO anon;
```

6. 点击 "Run" 按钮
7. 验证表已创建成功

---

## 测试验证

### 1. 测试完整的邮件验证流程

```bash
npm run test:email:verification jefflee2002@gmail.com
```

**预期输出**：
```
✅ User found: jefflee2002@gmail.com
✅ Token generated
✅ Token stored successfully
✅ Token found in database
✅ URL generated
✅ Email sent successfully!
```

### 2. 测试注册新用户

访问：`http://localhost:3001/auth/signup`

1. 输入邮箱和密码
2. 点击注册
3. 检查邮箱收到验证邮件
4. 点击验证链接
5. 验证应该成功

### 3. 手动测试验证 API

```bash
# 发送验证邮件
curl -X POST http://localhost:3001/api/debug/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# 验证 token（使用邮件中的 token）
curl "http://localhost:3001/api/bestauth/verify-email?token=YOUR_TOKEN_HERE"
```

---

## 验证流程说明

### 完整流程

1. **用户注册**
   - 用户在注册表单输入邮箱和密码
   - 调用 `signUp()` 函数

2. **生成 Token**
   - 使用 `crypto.randomBytes(32).toString('hex')` 生成随机 token
   - Token 长度：64 个十六进制字符

3. **存储 Token**
   - 将 token、user_id、expires_at 存入 `bestauth_verification_tokens` 表
   - Token 有效期：24 小时

4. **发送邮件**
   - 生成验证 URL：`https://covergen.pro/auth/verify-email?token=...`
   - 使用 Resend 发送邮件

5. **用户点击链接**
   - 浏览器打开 `/auth/verify-email?token=...`
   - 页面调用 `/api/bestauth/verify-email?token=...`

6. **验证 Token**
   - 在数据库中查找 token
   - 检查是否过期
   - 检查是否已使用

7. **更新用户状态**
   - 设置 `emailVerified = true`
   - 标记 token 为已使用
   - 记录活动日志

---

## 相关文件

### 代码文件
- `src/lib/bestauth/db.ts` - 数据库操作（已修复）
- `src/lib/bestauth/core.ts` - 注册逻辑（已修复）
- `src/app/api/bestauth/verify-email/route.ts` - 验证 API
- `src/app/auth/verify-email/page.tsx` - 验证页面

### 测试脚本
- `scripts/test-email-verification.ts` - 完整测试脚本
- `scripts/create-verification-tokens-table.ts` - 创建表脚本

### 迁移文件
- `src/lib/bestauth/migrations/add_verification_tokens.sql` - SQL 迁移

---

## 常见问题

### Q: 验证链接打开后显示 "Invalid or expired token"

**原因**：
- Token 已过期（24小时后）
- Token 已被使用
- Token 不存在

**解决**：
- 重新发送验证邮件
- 检查数据库中的 token

### Q: 邮件发送成功但数据库中没有 token

**原因**：
- 数据库表不存在
- user_id 缺失

**解决**：
- 确认已运行 SQL 创建表
- 检查代码是否提供了 user_id

### Q: Token 验证失败

**原因**：
- Token 被哈希但验证时使用原始 token
- Token 格式不匹配

**解决**：
- 确认使用最新的代码（不哈希 token）
- 检查 token 是否正确传递

---

## 检查清单

运行完整测试前，请确认：

- [ ] Supabase SQL Editor 中运行了创建表的 SQL
- [ ] 表 `bestauth_verification_tokens` 已存在
- [ ] 已更新代码（`db.ts` 和 `core.ts`）
- [ ] 重启了开发服务器（`npm run dev`）
- [ ] Resend 邮件服务正常工作
- [ ] 环境变量 `NEXT_PUBLIC_SITE_URL` 已配置

---

## 成功标志

当一切正常时，您应该看到：

✅ 用户注册后收到验证邮件  
✅ 邮件包含可点击的验证链接  
✅ 点击链接后显示验证成功  
✅ 用户的 `emailVerified` 字段变为 `true`  
✅ Token 被标记为已使用  
✅ 活动日志记录了验证事件  

---

## 更新日期

2025-11-04

---

## 下一步

修复完成后，请运行测试：

```bash
# 测试验证流程
npm run test:email:verification your-email@example.com

# 测试注册流程（在浏览器中）
# 访问 http://localhost:3001/auth/signup
```

