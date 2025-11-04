# Vercel DNS 记录添加指南

## 使用 Vercel CLI 添加 DNS 记录

如果 Vercel Dashboard 中找不到 DNS Records 界面，可以使用 CLI：

### 安装 Vercel CLI

```bash
npm install -g vercel
```

### 登录

```bash
vercel login
```

### 添加 DNS 记录

#### 1. 添加 SPF 记录
```bash
vercel dns add covergen.pro @ TXT "v=spf1 include:_spf.resend.com ~all"
```

#### 2. 添加 DKIM 记录（替换为 Resend 提供的实际值）
```bash
vercel dns add covergen.pro resend._domainkey TXT "p=MIGfMA0GCSq..."
```

#### 3. 添加 DMARC 记录
```bash
vercel dns add covergen.pro _dmarc TXT "v=DMARC1; p=none"
```

### 查看所有 DNS 记录
```bash
vercel dns ls covergen.pro
```

### 删除记录（如果需要）
```bash
vercel dns rm <record-id>
```

## 验证 DNS 记录

### 检查 SPF
```bash
nslookup -type=txt covergen.pro
```

### 检查 DKIM
```bash
nslookup -type=txt resend._domainkey.covergen.pro
```

### 检查 DMARC
```bash
nslookup -type=txt _dmarc.covergen.pro
```

## 在 Resend 验证域名

1. 访问：https://resend.com/domains
2. 找到 covergen.pro
3. 点击 "Verify" 按钮
4. 等待验证完成（通常 5-30 分钟）

## 测试邮件发送

验证成功后，更新 `.env.local`：

```bash
# 改回使用自己的域名
EMAIL_FROM=noreply@covergen.pro
EMAIL_REPLY_TO=support@covergen.pro
```

然后测试：

```bash
npm run test:email 994235892@qq.com
npm run test:email jefflee2002@gmail.com
```

