# 图像生成故障排除指南

## 🚨 **当前问题**
"Failed to generate images. Please try again."

## 🔍 **可能的原因**

### **1. 导入问题**
- `preprocessImageForPlatform` 函数导入失败
- 函数存在但导入路径不正确

### **2. API调用问题**
- `/api/generate` 端点返回错误
- 请求参数格式不正确
- 服务器端错误

### **3. 图像处理问题**
- Canvas API 在服务器端不可用
- 图像格式不支持
- 内存不足

## 🛠️ **解决方案**

### **方案1: 简化代码（已实施）**
暂时移除预处理功能，使用基本的图像生成：

```typescript
// 直接调用API，不使用预处理
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: enhancedPrompt,
    referenceImages: mode === 'image' ? referenceImagesBase64 : undefined,
    mode,
    style: 'modern',
    platform,
    dimensions: platformSizes[platform],
  }),
})
```

### **方案2: 检查API端点**
确保 `/api/generate` 端点正常工作：

1. 检查浏览器开发者工具的网络面板
2. 查看API响应的具体错误信息
3. 检查服务器日志

### **方案3: 逐步测试**
1. 先测试纯文本模式（不上传图像）
2. 再测试图像模式（不选择平台）
3. 最后测试完整流程

## 📝 **测试步骤**

### **步骤1: 基本功能测试**
1. 选择 "Text to Image" 模式
2. 输入简单的prompt（如："a red apple"）
3. 不选择特定平台
4. 点击生成按钮

### **步骤2: 图像模式测试**
1. 选择 "Image to Image" 模式
2. 上传一张简单的图像
3. 输入简单的prompt
4. 不选择特定平台
5. 点击生成按钮

### **步骤3: 平台特定测试**
1. 选择 "Image to Image" 模式
2. 上传图像
3. 选择特定平台（如微信视频号）
4. 输入prompt
5. 点击生成按钮

## 🔧 **调试信息**

### **控制台日志**
检查浏览器控制台是否有错误信息：

```javascript
console.log('Generate button clicked!')
console.log('Mode:', mode, 'Prompt:', prompt, 'Reference images:', referenceImages.length)
console.log('Starting generation...')
```

### **网络请求**
检查网络面板中的请求：
- 请求URL: `/api/generate`
- 请求方法: POST
- 请求状态: 200/400/500
- 响应内容

### **错误详情**
如果API返回错误，查看具体错误信息：
- 错误代码
- 错误消息
- 错误堆栈

## 🚀 **下一步计划**

### **短期修复**
1. ✅ 简化代码，移除预处理功能
2. 🔄 测试基本图像生成功能
3. 🔄 诊断具体错误原因

### **长期优化**
1. 🔄 修复预处理功能
2. 🔄 添加更好的错误处理
3. 🔄 实现完整的自动图像预处理

## 📞 **需要更多信息**

如果问题仍然存在，请提供：

1. **浏览器控制台错误信息**
2. **网络请求的响应状态**
3. **具体的错误消息**
4. **使用的浏览器和版本**
5. **测试的具体步骤**

这样我们可以更准确地诊断和解决问题！🔧
