# Vercel 环境变量部署清单

## 🎯 快速导航

当前状态：
- ✅ 已配置：13/17 个必需变量
- ❌ 缺失：4 个必需变量
- ⚠️ 需要修改：5 个变量（改为生产环境值）

---

## 📝 必须添加到 Vercel 的环境变量

### 方式 1：在 Vercel Dashboard 批量导入（推荐）

1. 访问 https://vercel.com/jeff-lees-projects-92a56a05/covergen/settings/environment-variables
2. 点击右上角的 **Import** 按钮
3. 粘贴以下内容：

```bash
# ============================================
# 🔴 站点配置（必须修改）
# ============================================
NEXT_PUBLIC_SITE_URL=https://covergen.pro
NODE_ENV=production

# ============================================
# 🔴 功能开关（必须设为 false）
# ============================================
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
NEXT_PUBLIC_CREEM_TEST_MODE=false

# ============================================
# ✅ Supabase（直接复制，无需修改）
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=从你的 .env.local 复制
SUPABASE_SERVICE_ROLE_KEY=从你的 .env.local 复制

# ============================================
# ✅ BestAuth（直接复制）
# ============================================
BESTAUTH_JWT_SECRET=从你的 .env.local 复制

# ============================================
# ✅ 邮件服务 - Resend（直接复制）
# ============================================
RESEND_API_KEY=从你的 .env.local 复制
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro

# ============================================
# ✅ 邮件监控 BCC（直接复制）
# ============================================
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com

# ============================================
# 🔴 支付服务 - Creem（需要添加生产密钥）
# ============================================
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxxxxxxx
CREEM_SECRET_KEY=从你的 .env.local 复制或使用生产密钥
CREEM_WEBHOOK_SECRET=从你的 .env.local 复制

# ============================================
# 🔴 AI 服务（需要添加）
# ============================================
OPENAI_API_KEY=sk-xxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxx
FAL_KEY=xxxxxxxxxx

# ============================================
# 🟢 可选：其他 AI 服务
# ============================================
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
# STABILITY_API_KEY=sk-xxxxxxxxxx
```

4. 选择环境：**Production** ✅
5. 点击 **Import**

---

## ❌ 当前缺失的变量（必须添加）

### 1. NEXT_PUBLIC_CREEM_PUBLIC_KEY
```bash
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxxxxxxx
```
**如何获取**：
- 登录 Creem Dashboard
- 切换到 **Live Mode**（不是 Test Mode）
- 复制 Public Key（以 `pk_live_` 开头）

### 2. OPENAI_API_KEY
```bash
OPENAI_API_KEY=sk-xxxxxxxxxx
```
**如何获取**：
- 登录 https://platform.openai.com/api-keys
- 创建新的 API Key
- 复制并保存

### 3. REPLICATE_API_TOKEN
```bash
REPLICATE_API_TOKEN=r8_xxxxxxxxxx
```
**如何获取**：
- 登录 https://replicate.com/account/api-tokens
- 创建新的 API Token
- 复制并保存

### 4. FAL_KEY
```bash
FAL_KEY=xxxxxxxxxx
```
**如何获取**：
- 登录 https://fal.ai/dashboard
- 进入 API Keys 页面
- 创建新的 API Key
- 复制并保存

---

## ⚠️ 必须修改的变量（从开发改为生产）

### 当前是开发环境配置，需要修改为：

```bash
# 1. 站点 URL
NEXT_PUBLIC_SITE_URL=https://covergen.pro  # ← 从 localhost 改为生产域名

# 2. 功能开关
NEXT_PUBLIC_DEV_MODE=false  # ← 从 true 改为 false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false  # ← 从 true 改为 false
NEXT_PUBLIC_CREEM_TEST_MODE=false  # ← 从 true 改为 false

# 3. 支付密钥
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxx  # ← 从 pk_test_ 改为 pk_live_
CREEM_SECRET_KEY=sk_live_xxx  # ← 从 sk_test_ 改为 sk_live_（如果当前是测试密钥）
```

---

## 📋 完整的 Vercel 环境变量清单

### 复制到 Vercel 的完整配置

```bash
# 站点
NEXT_PUBLIC_SITE_URL=https://covergen.pro
NODE_ENV=production

# 功能开关
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
NEXT_PUBLIC_CREEM_TEST_MODE=false

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://exungkcoaihcemcmhqdr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[从 .env.local 复制]
SUPABASE_SERVICE_ROLE_KEY=[从 .env.local 复制]

# BestAuth
BESTAUTH_JWT_SECRET=[从 .env.local 复制]

# 邮件服务
RESEND_API_KEY=[从 .env.local 复制]
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com

# 支付服务（生产密钥）
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxxxxxxx
CREEM_SECRET_KEY=sk_live_xxxxxxxxxx
CREEM_WEBHOOK_SECRET=[从 .env.local 复制或使用生产密钥]

# AI 服务
OPENAI_API_KEY=sk-xxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxx
FAL_KEY=xxxxxxxxxx
```

---

## 🔐 获取生产密钥的步骤

### Creem 生产密钥

1. 登录 Creem Dashboard
2. 确保切换到 **Live Mode**（右上角）
3. 进入 **API Keys**
4. 复制：
   - Public Key: `pk_live_xxxxxxxxxx`
   - Secret Key: `sk_live_xxxxxxxxxx`
5. 进入 **Webhooks**
   - 添加 webhook URL: `https://covergen.pro/api/webhooks/creem`
   - 复制 Webhook Secret: `whsec_xxxxxxxxxx`

### OpenAI API Key

1. 访问 https://platform.openai.com/api-keys
2. 点击 **Create new secret key**
3. 命名：`CoverGen Production`
4. 复制密钥（只显示一次！）

### Replicate API Token

1. 访问 https://replicate.com/account/api-tokens
2. 点击 **Create token**
3. 命名：`CoverGen Production`
4. 复制 token

### Fal.ai API Key

1. 访问 https://fal.ai/dashboard
2. 进入 **API Keys**
3. 点击 **Create new key**
4. 复制密钥

---

## 🚀 部署步骤

### Step 1: 在 Vercel 添加环境变量

1. 访问 https://vercel.com/jeff-lees-projects-92a56a05/covergen/settings/environment-variables
2. 使用上面的批量导入方法添加所有变量
3. 确保选择 **Production** 环境
4. 点击 **Save**

### Step 2: 验证变量

运行本地检查（模拟生产环境）：

```bash
npm run check:production:env
```

应该看到所有变量都是 ✅

### Step 3: 触发部署

```bash
# 推送代码触发自动部署
git push origin main

# 或在 Vercel Dashboard 手动部署
# Deployments → Redeploy
```

### Step 4: 部署后验证

部署完成后（约 2-5 分钟），测试以下功能：

```bash
# 使用生产环境测试邮件
curl -X POST https://covergen.pro/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"jefflee2002@gmail.com"}'
```

访问网站测试：
- [ ] https://covergen.pro 可以访问
- [ ] 用户注册功能正常
- [ ] 验证邮件正常发送
- [ ] 用户可以登录
- [ ] AI 图像生成功能正常
- [ ] 支付流程正常

---

## ⚡ 快速复制清单

### 需要从 .env.local 复制的值：

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=从你的 .env.local 复制
SUPABASE_SERVICE_ROLE_KEY=从你的 .env.local 复制
BESTAUTH_JWT_SECRET=从你的 .env.local 复制
RESEND_API_KEY=从你的 .env.local 复制
CREEM_SECRET_KEY=从你的 .env.local 复制（如果是测试密钥，需要换成生产密钥）
CREEM_WEBHOOK_SECRET=从你的 .env.local 复制
```

### 需要新获取的值：

```bash
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxx  # ← Creem Live Mode
OPENAI_API_KEY=sk-xxx  # ← OpenAI Dashboard
REPLICATE_API_TOKEN=r8_xxx  # ← Replicate Dashboard
FAL_KEY=xxx  # ← Fal.ai Dashboard
```

### 需要修改的值：

```bash
NEXT_PUBLIC_SITE_URL=https://covergen.pro  # ← 改为生产域名
NEXT_PUBLIC_DEV_MODE=false  # ← 改为 false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false  # ← 改为 false
NEXT_PUBLIC_CREEM_TEST_MODE=false  # ← 改为 false
```

---

## 🎯 E2E 测试已通过

✅ **邮件系统 E2E 测试结果：7/7 通过 (100%)**

已验证的功能：
- ✅ 用户注册触发邮件
- ✅ Token 生成和存储
- ✅ 邮件服务配置
- ✅ 验证链接可用性
- ✅ 数据库状态更新
- ✅ Token 安全性
- ✅ 清理机制

---

## 📚 相关文档

- `VERCEL_DEPLOYMENT_GUIDE.md` - 完整的部署指南
- `EMAIL_VERIFICATION_TEST_RESULTS.md` - E2E 测试结果
- `ENVIRONMENT_CONFIG_GUIDE.md` - 环境配置说明

---

## 🆘 需要帮助？

运行检查命令查看当前状态：
```bash
npm run check:production:env
```

---

**准备好后，在 Vercel 添加环境变量，然后推送代码即可自动部署！** 🚀


