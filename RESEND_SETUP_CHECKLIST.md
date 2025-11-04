# Resend 邮件服务设置清单

## 当前状态

- ✅ 已在 Spaceship 更新 nameservers 指向 Vercel
- ✅ 已在 Resend 添加域名并获取 DNS 记录
- ⏳ DNS 正在传播到 Vercel（需要 1-48 小时）
- ⏸️ 待完成：添加 DNS 记录

---

## 📋 接下来的步骤

### **第 1 步：在 Spaceship 添加 DNS 记录（推荐）**

#### 为什么推荐在 Spaceship 添加？
- ✅ 立即生效（5-30 分钟）
- ✅ 可以马上测试邮件功能
- ✅ 不需要等待 DNS 传播到 Vercel
- ✅ DNS 传播完成后，记录会保留

#### 操作步骤：

1. **登录 Spaceship**
   - 访问：https://www.spaceship.com/
   - 使用购买域名的账户登录

2. **进入 DNS 管理**
   - 点击 "Domains"
   - 找到 `covergen.pro`
   - 点击 "DNS" 或 "DNS Settings" 或 "Manage DNS"

3. **添加 3 条 TXT 记录**

   从 Resend Dashboard 复制以下记录并添加：

   **SPF 记录：**
   ```
   类型: TXT
   名称: @ (或留空)
   值: v=spf1 include:_spf.resend.com ~all
   TTL: 3600
   ```

   **DKIM 记录：**
   ```
   类型: TXT
   名称: resend._domainkey
   值: p=MIGfMA0GCSq... (从 Resend 复制的长字符串)
   TTL: 3600
   ```

   **DMARC 记录：**
   ```
   类型: TXT
   名称: _dmarc
   值: v=DMARC1; p=none
   TTL: 3600
   ```

4. **保存更改**
   - 点击 "Save" 或 "Apply Changes"

---

### **第 2 步：验证 DNS 记录（5-30 分钟后）**

添加 DNS 记录后，等待 5-30 分钟，然后运行验证：

```bash
npm run verify:dns
```

当所有记录都显示 ✅ 时，继续下一步。

---

### **第 3 步：在 Resend 验证域名**

1. **访问 Resend Dashboard**
   - 登录：https://resend.com/domains
   - 找到 `covergen.pro`

2. **点击 "Verify" 按钮**
   - Resend 会检查 DNS 记录
   - 通常 5-30 分钟内完成验证

3. **确认验证成功**
   - 域名状态应显示为 "Verified" ✅

---

### **第 4 步：更新 .env.local 配置**

域名验证成功后，更新 `.env.local`：

```bash
# 改回使用自己的域名
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro

# Resend API Key 保持不变
RESEND_API_KEY=re_xxxxxxxxxx
```

**重要：修改后需要重启开发服务器！**

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

---

### **第 5 步：测试邮件发送**

现在可以发送邮件到任何收件人了！

#### 测试到 QQ 邮箱：
```bash
npm run test:email 994235892@qq.com
```

#### 测试到 Gmail：
```bash
npm run test:email jefflee2002@gmail.com
```

#### 或运行快速测试（发送到两个邮箱）：
```bash
npx tsx scripts/test-email-quick.ts
```

---

## 🔍 验证命令汇总

| 命令 | 用途 |
|------|------|
| `npm run check:dns` | 检查 DNS 是否传播到 Vercel |
| `npm run verify:dns` | 验证 DNS 记录是否生效 |
| `npm run test:email <email>` | 发送测试邮件 |
| `npx tsx scripts/check-env.ts` | 检查环境变量配置 |

---

## ⏰ 预计时间线

| 步骤 | 预计时间 | 状态 |
|------|----------|------|
| 在 Spaceship 添加 DNS 记录 | 5 分钟 | ⏸️ 待完成 |
| DNS 记录生效 | 5-30 分钟 | ⏸️ 等待中 |
| 在 Resend 验证域名 | 5-30 分钟 | ⏸️ 等待中 |
| 更新 .env.local | 1 分钟 | ⏸️ 待完成 |
| 测试邮件发送 | 2 分钟 | ⏸️ 待完成 |
| **总计** | **约 20-70 分钟** | |

---

## 📧 已成功的测试

- ✅ **jefflee2002@gmail.com** - 已成功接收测试邮件
  - Message ID: `7c284991-158c-4163-9bb8-c68121e19ae9`
  - 发件人：`onboarding@resend.dev`

---

## 🆘 遇到问题？

### DNS 记录验证失败
```bash
# 检查 DNS 记录
npm run verify:dns

# 检查特定记录
nslookup -type=txt covergen.pro
nslookup -type=txt resend._domainkey.covergen.pro
nslookup -type=txt _dmarc.covergen.pro
```

### 邮件发送失败
```bash
# 检查环境变量
npx tsx scripts/check-env.ts

# 检查邮件配置日志
npm run test:email your-email@example.com
```

### Resend 域名验证失败
- 等待更长时间（最多 2 小时）
- 确认 DNS 记录完全正确
- 检查 Resend Dashboard 的错误信息

---

## 📚 相关文档

- `EMAIL_SENDING_FIX.md` - 邮件发送问题修复指南
- `RESEND_DOMAIN_VERIFICATION.md` - Resend 域名验证详细指南
- `scripts/add-dns-records.md` - DNS 记录添加详细步骤

---

## 更新日期

2025-11-04

---

## ✨ 下一步

**请现在去 Spaceship 添加 DNS 记录！**

完成后，运行 `npm run verify:dns` 检查记录是否生效。

