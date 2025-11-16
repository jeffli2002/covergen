# Vercel 快速设置指南

## 🚀 3 步部署到生产环境

---

## Step 1: 准备密钥（5分钟）

### 需要获取的新密钥：

| 服务 | 获取地址 | 变量名 |
|------|---------|--------|
| Creem Live Key | https://creem.io/dashboard → Live Mode → API Keys | `NEXT_PUBLIC_CREEM_PUBLIC_KEY` |
| OpenAI | https://platform.openai.com/api-keys | `OPENAI_API_KEY` |
| Replicate | https://replicate.com/account/api-tokens | `REPLICATE_API_TOKEN` |
| Fal.ai | https://fal.ai/dashboard | `FAL_KEY` |

---

## Step 2: 在 Vercel 添加环境变量（5分钟）

### 访问环境变量设置页面：

https://vercel.com/jeff-lees-projects-92a56a05/covergen/settings/environment-variables

### 点击 "Import" 并粘贴以下内容：

```bash
NEXT_PUBLIC_SITE_URL=https://covergen.pro
NODE_ENV=production
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
NEXT_PUBLIC_CREEM_TEST_MODE=false
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dW5na2NvYWloY2VtY21ocWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5NTQyOTgsImV4cCI6MjA0MDUzMDI5OH0.Q_0_h-a6vwJTg2Fzk1H0TvRqrL7YlXE8wJY1OR9MwS4_Y
SUPABASE_SERVICE_ROLE_KEY=[从 .env.local 复制]
BESTAUTH_JWT_SECRET=[从 .env.local 复制]
RESEND_API_KEY=[从 .env.local 复制]
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com
NEXT_PUBLIC_CREEM_PUBLIC_KEY=[Step 1 获取的 pk_live_xxx]
CREEM_SECRET_KEY=[从 .env.local 复制或使用 sk_live_xxx]
CREEM_WEBHOOK_SECRET=[从 .env.local 复制]
OPENAI_API_KEY=[Step 1 获取]
REPLICATE_API_TOKEN=[Step 1 获取]
FAL_KEY=[Step 1 获取]
```

**注意**: 
- 标记 `[从 .env.local 复制]` 的需要从本地文件复制
- 标记 `[Step 1 获取]` 的需要从对应平台获取

---

## Step 3: 部署（自动）

```bash
git push origin main
```

Vercel 会自动：
- ✅ 检测到新的 push
- ✅ 读取环境变量
- ✅ 构建项目
- ✅ 部署到生产环境
- ✅ 约 2-5 分钟完成

---

## ✅ 部署后验证

### 1. 检查部署状态

访问 https://vercel.com/jeff-lees-projects-92a56a05/covergen/deployments

应该看到：
- ✅ 状态：Ready
- ✅ 域名：covergen.pro
- ✅ 构建时间：~2-5 分钟

### 2. 测试邮件功能

```bash
# 访问生产环境测试邮件
curl -X POST https://covergen.pro/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"jefflee2002@gmail.com"}'
```

应该收到测试邮件 ✅

### 3. 测试用户注册

1. 访问 https://covergen.pro/auth/signup
2. 注册新账户
3. 检查是否收到验证邮件
4. 点击验证链接
5. 确认可以登录

### 4. 测试 AI 生成

1. 登录后访问生成页面
2. 创建一个封面
3. 确认 AI 生成正常工作

---

## 🔍 快速检查命令

### 本地环境检查

```bash
# 检查生产环境变量配置
npm run check:production:env

# 测试邮件系统
npm run test:email:e2e
```

---

## ⚠️ 关键注意事项

### 🔴 必须是 false 的变量

```bash
NEXT_PUBLIC_DEV_MODE=false  # ← 不能是 true
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false  # ← 不能是 true
NEXT_PUBLIC_CREEM_TEST_MODE=false  # ← 不能是 true
```

### 🔴 必须是 live 的密钥

```bash
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxx  # ← 不能是 pk_test_
CREEM_SECRET_KEY=sk_live_xxx  # ← 不能是 sk_test_
```

### 🔴 必须是生产域名

```bash
NEXT_PUBLIC_SITE_URL=https://covergen.pro  # ← 不能是 localhost 或 ngrok
```

---

## 📊 当前状态

| 类别 | 状态 |
|------|------|
| 已配置 | 13/17 ✅ |
| 缺失 | 4/17 ❌ |
| 需修改 | 5 个变量 ⚠️ |

---

## 🎯 总结

完成这 3 个步骤即可部署：

1. ✅ 获取缺失的 4 个 API 密钥
2. ✅ 在 Vercel 添加/更新环境变量
3. ✅ Push 代码，自动部署

**预计总时间：10-15 分钟** ⏱️

---

**准备好了吗？开始部署吧！** 🚀



