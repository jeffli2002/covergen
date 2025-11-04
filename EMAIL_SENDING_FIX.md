# 邮件发送问题修复

## 问题描述

测试邮件功能显示"成功"，但是测试账户（994235892@qq.com 和 jefflee2002@gmail.com）没有收到邮件。

## 根本原因

在 `src/lib/email/config.ts` 中，原来的逻辑是：
- 在开发环境下（`NODE_ENV=development`），即使配置了邮件服务提供商（SMTP/Resend/SendGrid），系统仍然会强制使用 `console` 模式
- `console` 模式只会将邮件内容打印到控制台，而不会真正发送邮件
- API 返回"成功"，但邮件实际上没有发送出去

```typescript
// 原来的问题代码
if (process.env.NODE_ENV === 'development' && !process.env.FORCE_EMAIL_PROVIDER) {
  provider = 'console'
}
```

这意味着在开发环境下，除非设置了 `FORCE_EMAIL_PROVIDER=true`，否则总是使用 console 模式。

## 解决方案

### 1. 修改邮件配置逻辑

修改 `src/lib/email/config.ts`，让系统在配置了邮件提供商时优先使用配置的提供商：

```typescript
// 新的修复代码
// 只有当明确设置 FORCE_EMAIL_PROVIDER=console 时才强制使用 console 模式
if (process.env.NODE_ENV === 'development' && 
    process.env.FORCE_EMAIL_PROVIDER === 'console' && 
    provider !== 'console') {
  console.warn('⚠️  Email provider configured but FORCE_EMAIL_PROVIDER=console is set. Using console mode.')
  provider = 'console'
}
```

### 2. 添加调试日志

在开发环境下自动记录邮件配置，方便调试：

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log(`📧 Email Configuration: provider=${provider}, from=${emailFrom}`)
}
```

## 配置邮件提供商

在 `.env.local` 中添加以下配置（选择其中一个）：

### 选项 1: Resend（推荐，本项目使用）

```bash
RESEND_API_KEY=re_xxxxxxxxxx
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro

# 可选：添加监控 BCC
EMAIL_BCC_SUBSCRIPTION=jefflee2002@gmail.com
EMAIL_BCC_PAYMENT_FAILURE=jefflee2002@gmail.com
EMAIL_BCC_CREDITS_EXHAUSTED=jefflee2002@gmail.com
EMAIL_BCC_BUGS=jefflee2002@gmail.com
```

**Resend 优势**：
- 3,000 封免费邮件/月
- 优秀的送达率和域名信誉
- 简单的 API
- 实时邮件日志查看：https://resend.com/emails

### 选项 2: SendGrid

```bash
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

### 选项 3: SMTP（自定义邮件服务器）

```bash
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@yourdomain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

## 测试步骤

### 1. 重启开发服务器

修改环境变量后，必须重启 Next.js 开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 2. 检查邮件配置

启动后，你应该在控制台看到邮件配置日志：

```
📧 Email Configuration: provider=resend, from=noreply@covergen.pro
```

如果配置了其他提供商，会显示相应的名称（`smtp` 或 `sendgrid`）。

### 3. 发送测试邮件

访问测试页面 `http://localhost:3001/debug/test-email`，输入邮箱地址并发送测试邮件。

或使用命令行：

```bash
npm run test:email 994235892@qq.com
```

### 4. 检查邮件

- 检查收件箱（可能需要等待1-2分钟）
- 检查垃圾邮件/垃圾箱文件夹
- 对于 QQ 邮箱，检查"广告邮件"文件夹

## 常见问题排查

### 1. 邮件仍然只打印到控制台

**原因**：可能是环境变量配置不正确

**解决**：
- 检查 `.env.local` 文件中的配置
- 确保重启了开发服务器
- 检查控制台的邮件配置日志

### 2. Resend API 错误

**原因**：API Key 无效或域名未验证

**解决**：
1. 检查 `.env.local` 中的 `RESEND_API_KEY` 是否正确
2. 登录 Resend Dashboard (https://resend.com)
3. 确认 API Key 是激活状态
4. 验证发件人域名（`covergen.pro`）
5. 查看 Resend 邮件日志了解详细错误信息

### 3. SMTP 认证失败（如果使用 SMTP）

**原因**：密码不正确或需要应用专用密码

**解决**：
1. 登录你的邮件服务提供商
2. 进入"安全设置"
3. 启用"两步验证"（如果需要）
4. 生成"应用专用密码"
5. 使用应用专用密码替代普通密码

### 4. QQ 邮箱收不到邮件 (994235892@qq.com)

**可能原因**：
- QQ 邮箱的反垃圾邮件策略较严格
- 发件人域名没有配置 SPF/DKIM 记录

**解决**：
1. 检查 QQ 邮箱的所有文件夹（包括垃圾邮件、广告邮件）
2. 将发件地址添加到白名单
3. 使用 Resend 等专业邮件服务（有更好的送达率）

### 5. Gmail 收不到邮件 (jefflee2002@gmail.com)

**可能原因**：
- Gmail 的垃圾邮件过滤
- 发件人域名没有配置 SPF/DKIM 记录

**解决**：
1. 检查 Gmail 的"垃圾邮件"文件夹
2. 检查"促销"和"社交"标签页
3. 将发件地址添加到联系人
4. 使用 Resend 等专业邮件服务

## 验证修复

修复后，系统应该：

1. ✅ 在开发环境下，如果配置了邮件提供商，会真正发送邮件
2. ✅ 控制台显示当前使用的邮件提供商
3. ✅ 测试邮件可以成功送达
4. ✅ 如果需要禁用邮件发送，可以设置 `FORCE_EMAIL_PROVIDER=console`

## 相关文件

- `src/lib/email/config.ts` - 邮件配置逻辑
- `src/lib/email/service.ts` - 邮件发送服务
- `src/app/api/debug/test-email/route.ts` - 测试邮件 API
- `src/app/debug/test-email/page.tsx` - 测试邮件页面
- `ENVIRONMENT_CONFIG_GUIDE.md` - 环境配置指南

## 更新日期

2025-11-04

