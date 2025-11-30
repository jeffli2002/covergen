# Vercel 生产环境部署指南

## 📋 需要在 Vercel 添加的环境变量

### 🔴 必需的环境变量（Required）

#### 1. 站点配置
```bash
NEXT_PUBLIC_SITE_URL=https://covergen.pro
```
**说明**: 生产环境域名，用于生成邮件验证链接等

#### 2. Supabase 数据库
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**说明**: Supabase 项目的连接信息

#### 3. BestAuth JWT 密钥
```bash
BESTAUTH_JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```
**说明**: 用于 JWT token 签名，必须是强随机字符串（至少32字符）

#### 4. 邮件服务 - Resend（推荐）
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```
**说明**: 用于发送验证邮件、通知邮件等

#### 5. 支付服务 - Creem
```bash
# 生产环境使用 LIVE keys
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxxxxxxx
CREEM_SECRET_KEY=sk_live_xxxxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxx
```
**说明**: Creem 支付集成的生产密钥

#### 6. AI 服务 API Keys
```bash
OPENAI_API_KEY=sk-xxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxx
FAL_KEY=xxxxxxxxxx
```
**说明**: AI 图像生成服务的 API 密钥

---

### 🟡 重要配置变量（Important）

#### 7. 生产环境标识
```bash
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
NEXT_PUBLIC_CREEM_TEST_MODE=false
NODE_ENV=production
```
**说明**: 
- `NEXT_PUBLIC_DEV_MODE=false` - 禁用开发模式功能
- `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false` - 强制执行使用限制
- `NEXT_PUBLIC_CREEM_TEST_MODE=false` - 使用真实支付

#### 8. 邮件监控 BCC（可选但推荐）
```bash
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com
```
**说明**: 将重要邮件副本发送到管理员邮箱

---

### 🟢 可选的环境变量（Optional）

#### 9. 其他 AI 服务（如果使用）
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
STABILITY_API_KEY=sk-xxxxxxxxxx
```

#### 10. 分析和监控
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxxxxxxxxx
SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxxxxxxx
```

---

## 📝 在 Vercel 中添加环境变量的步骤

### 方法 1: 通过 Vercel Dashboard（推荐）

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 选择你的项目 `covergen`

2. **进入设置页面**
   - 点击 **Settings** 标签
   - 在左侧菜单选择 **Environment Variables**

3. **添加变量**
   - 点击 **Add New**
   - 输入 **Name**（变量名）
   - 输入 **Value**（变量值）
   - 选择环境：
     - ✅ **Production** （生产环境 - 必选）
     - ⬜ Preview （预览环境 - 可选）
     - ⬜ Development （开发环境 - 不推荐）

4. **批量导入**（快速方法）
   - 点击 **Environment Variables** 页面
   - 点击右上角的 **Import** 按钮
   - 粘贴所有环境变量（格式：`KEY=value`）
   - 点击 **Import**

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add NEXT_PUBLIC_SITE_URL production
# 输入值: https://covergen.pro

# 或从文件批量导入
vercel env pull .env.production.local
```

---

## 🚀 完整的环境变量清单（复制粘贴用）

### 生产环境 `.env` 文件内容

```bash
# ============================================
# 站点配置
# ============================================
NEXT_PUBLIC_SITE_URL=https://covergen.pro
NODE_ENV=production

# ============================================
# 功能开关（生产环境必须关闭）
# ============================================
NEXT_PUBLIC_DEV_MODE=false
NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false
NEXT_PUBLIC_CREEM_TEST_MODE=false

# ============================================
# Supabase 数据库
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# BestAuth 认证
# ============================================
BESTAUTH_JWT_SECRET=your-super-secret-jwt-key-min-32-chars-CHANGE-THIS

# ============================================
# 邮件服务 - Resend
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro

# 邮件监控 BCC
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com

# ============================================
# 支付服务 - Creem（生产环境）
# ============================================
NEXT_PUBLIC_CREEM_PUBLIC_KEY=pk_live_xxxxxxxxxx
CREEM_SECRET_KEY=sk_live_xxxxxxxxxx
CREEM_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# ============================================
# AI 服务
# ============================================
OPENAI_API_KEY=sk-xxxxxxxxxx
REPLICATE_API_TOKEN=r8_xxxxxxxxxx
FAL_KEY=xxxxxxxxxx

# ============================================
# 可选：其他 AI 服务
# ============================================
# ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx
# STABILITY_API_KEY=sk-xxxxxxxxxx

# ============================================
# 可选：分析和监控
# ============================================
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-xxxxxxxxxx
# SENTRY_DSN=https://xxxxxxxxxx@sentry.io/xxxxxxxxxx
```

---

## ⚠️ 重要安全提示

### 🔐 敏感信息保护

1. **永远不要提交到 Git**
   - ✅ `.env.local` 和 `.env.production` 已在 `.gitignore`
   - ❌ 不要提交包含真实密钥的文件

2. **定期轮换密钥**
   - 每 3-6 个月更换一次 API 密钥
   - 发现泄露立即更换

3. **使用不同的密钥**
   - 开发环境：测试密钥
   - 生产环境：生产密钥
   - 永远不要混用

4. **限制权限**
   - 只给必要的人员访问生产密钥
   - 使用 Vercel 团队权限管理

---

## ✅ 部署前检查清单

### 必须完成的任务

- [ ] **环境变量**
  - [ ] 所有必需变量已添加到 Vercel
  - [ ] 使用生产环境的密钥（不是测试密钥）
  - [ ] `NEXT_PUBLIC_DEV_MODE=false`
  - [ ] `NEXT_PUBLIC_BYPASS_USAGE_LIMIT=false`
  - [ ] `NEXT_PUBLIC_SITE_URL=https://covergen.pro`

- [ ] **数据库**
  - [ ] Supabase 表已创建
  - [ ] `bestauth_verification_tokens` 表存在
  - [ ] 数据库迁移已运行
  - [ ] 权限配置正确

- [ ] **邮件服务**
  - [ ] Resend API key 已配置
  - [ ] `covergen.pro` 域名已在 Resend 验证
  - [ ] DNS 记录（SPF, DKIM, DMARC）已添加
  - [ ] 测试邮件发送成功

- [ ] **支付服务**
  - [ ] Creem 生产密钥已配置
  - [ ] Webhook 端点已设置
  - [ ] Webhook 密钥已配置
  - [ ] 测试支付流程正常

- [ ] **域名配置**
  - [ ] 域名已添加到 Vercel
  - [ ] DNS 指向 Vercel
  - [ ] SSL 证书已激活
  - [ ] `www` 重定向已配置

- [ ] **功能测试**
  - [ ] 用户注册和验证
  - [ ] 邮件发送和接收
  - [ ] 支付流程
  - [ ] AI 图像生成
  - [ ] 积分系统

---

## 🚀 部署流程

### 1. 准备生产环境

```bash
# 确保在 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 检查构建是否成功
npm run build
```

### 2. 在 Vercel 添加环境变量

按照上面的清单，在 Vercel Dashboard 添加所有必需的环境变量。

### 3. 触发部署

**选项 A: 自动部署（推荐）**
- Push 到 `main` 分支会自动触发部署
- Vercel 会自动构建和部署

**选项 B: 手动部署**
```bash
vercel --prod
```

### 4. 验证部署

部署完成后，访问 https://covergen.pro 并测试：

- [ ] 页面正常加载
- [ ] 用户可以注册
- [ ] 验证邮件正常发送
- [ ] 用户可以登录
- [ ] 支付流程正常
- [ ] AI 生成功能正常

---

## 🔧 常见问题

### Q1: 部署后环境变量不生效？

**A**: 需要重新部署
```bash
# 在 Vercel Dashboard 点击 "Redeploy"
# 或者推送一个空 commit
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Q2: 邮件无法发送？

**A**: 检查以下项：
1. `RESEND_API_KEY` 是否正确
2. `EMAIL_FROM` 域名是否已验证
3. DNS 记录是否已添加
4. 查看 Vercel Logs 的错误信息

### Q3: 支付不工作？

**A**: 确认：
1. 使用 `pk_live_*` 和 `sk_live_*` 密钥
2. `NEXT_PUBLIC_CREEM_TEST_MODE=false`
3. Webhook URL 已在 Creem Dashboard 配置
4. Webhook 密钥正确

### Q4: 数据库连接失败？

**A**: 检查：
1. Supabase URL 和密钥是否正确
2. 网络是否可访问 Supabase
3. Supabase 项目是否处于活跃状态

---

## 📊 部署后监控

### 1. 查看 Vercel Logs

- 访问 Vercel Dashboard
- 选择项目
- 点击 **Deployments**
- 选择最新部署
- 查看 **Function Logs** 和 **Build Logs**

### 2. 监控邮件发送

- 访问 https://resend.com/emails
- 查看邮件发送日志
- 检查打开率和点击率

### 3. 监控支付

- 访问 Creem Dashboard
- 查看交易记录
- 检查 Webhook 事件

---

## 🎯 生产环境优化建议

### 性能优化

1. **启用缓存**
   - Vercel 自动缓存静态资源
   - 配置 API 路由的缓存策略

2. **图片优化**
   - 使用 Next.js Image 组件
   - 配置图片 CDN

3. **数据库优化**
   - 使用 Supabase 连接池
   - 优化查询性能

### 安全加固

1. **设置速率限制**
   - API 路由添加速率限制
   - 防止 DDoS 攻击

2. **启用 CORS**
   - 只允许 covergen.pro 域名

3. **定期备份**
   - Supabase 数据库自动备份
   - 定期导出重要数据

---

## 📞 需要帮助？

- 📧 Email: jefflee2002@gmail.com
- 📚 文档: 查看项目根目录的 `*.md` 文件
- 🔍 日志: Vercel Dashboard → Logs

---

## 更新日期

2025-11-04

---

**部署成功后，记得运行生产环境的 E2E 测试！** 🚀





