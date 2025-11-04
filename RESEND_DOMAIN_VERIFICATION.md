# Resend 域名验证指南

## 问题描述

邮件发送失败，错误信息：
```
The covergen.pro domain is not verified. Please, add and verify your domain on https://resend.com/domains
```

## 快速解决方案（用于测试）

### 使用 Resend 的测试发件地址

修改 `.env.local`：

```bash
# 临时使用 Resend 的测试邮箱
EMAIL_FROM=onboarding@resend.dev
EMAIL_REPLY_TO=support@covergen.pro
```

然后运行测试：
```bash
npm run test:email 994235892@qq.com
npm run test:email jefflee2002@gmail.com
```

## 正式解决方案（用于生产）

### 1. 登录 Resend Dashboard

访问：https://resend.com/domains

### 2. 添加域名

1. 点击 "Add Domain"
2. 输入 `covergen.pro`
3. 点击 "Add"

### 3. 配置 DNS 记录

Resend 会提供三条 DNS 记录，您需要在域名 DNS 管理面板中添加：

#### SPF 记录
```
类型: TXT
主机: @
值: v=spf1 include:_spf.resend.com ~all
```

#### DKIM 记录 (示例)
```
类型: TXT  
主机: resend._domainkey
值: [Resend 提供的长字符串]
```

#### DMARC 记录
```
类型: TXT
主机: _dmarc
值: v=DMARC1; p=none; rua=mailto:dmarc@covergen.pro
```

### 4. 等待验证

- DNS 记录传播通常需要 5-30 分钟
- 在 Resend Dashboard 中点击 "Verify"
- 验证成功后，状态会显示为 "Verified" ✅

### 5. 更新 .env.local

验证成功后，改回使用您的域名：

```bash
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

## 域名验证的好处

- ✅ 更高的邮件送达率
- ✅ 避免被标记为垃圾邮件
- ✅ 专业的发件人身份
- ✅ 符合邮件发送的最佳实践

## 验证状态检查

访问 Resend Dashboard 查看：
- https://resend.com/domains

或运行测试脚本查看详细错误信息：
```bash
npm run test:email your-email@example.com
```

## 常见问题

### Q: DNS 记录多久生效？
A: 通常 5-30 分钟，最多可能需要 24-48 小时

### Q: 可以使用子域名吗？
A: 可以，例如 `mail.covergen.pro`

### Q: 验证失败怎么办？
A: 
1. 检查 DNS 记录是否正确添加
2. 使用 DNS 查询工具验证记录：`nslookup -type=txt covergen.pro`
3. 等待更长时间让 DNS 传播
4. 联系域名服务商确认 DNS 设置

## 测试邮箱地址

验证成功后，测试发送到：
- ✅ 994235892@qq.com
- ✅ jefflee2002@gmail.com

## 更新日期

2025-11-04


