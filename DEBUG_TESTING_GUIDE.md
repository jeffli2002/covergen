# 🐛 调试测试指南：选择平台后的图像预处理

## 🎯 **问题描述**

选择平台后，参考图像尺寸没有自动调整。

## 🔍 **调试步骤**

### **步骤 1: 打开浏览器控制台**
1. 按 **F12** 打开开发者工具
2. 切换到 **Console** 标签
3. 确保控制台没有错误信息

### **步骤 2: 测试预处理功能**
1. 访问 `http://localhost:3001`
2. 选择 **"Image to Image"** 模式
3. 上传一张参考图像
4. 在 **Step 2** 中选择一个平台（如YouTube）

### **步骤 3: 观察控制台输出**

#### **✅ 正常输出应该看到：**
```
ModeSelector useEffect triggered: {mode: "image", referenceImagesLength: 1, platform: "youtube", isPreprocessing: false}
Starting auto-preprocessing for platform: youtube
Starting preprocessing for platform: youtube with 1 images
Platform dimensions: {width: 1280, height: 720}
preprocessImageForPlatform function is available
Processing image 1/1
Image 1 converted to data URL, length: 12345
Calling preprocessImageForPlatform for image 1
preprocessImageForPlatform called with: {imageUrl: "data:image/jpeg;base64,/9j/4AAQ...", targetWidth: 1280, targetHeight: 720, platform: "youtube"}
Browser environment check passed
Image loaded successfully: {originalWidth: 1920, originalHeight: 1080, targetWidth: 1280, targetHeight: 720}
Canvas context created successfully
Canvas dimensions set: {width: 1280, height: 720}
Crop parameters calculated: {cropX: 320, cropY: 0, cropWidth: 1280, cropHeight: 1080}
Image drawn to canvas successfully
Canvas converted to data URL, length: 67890
Image 1 processed successfully, length: 67890
All images processed successfully: 1
Setting preprocessedImages state: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAB..."]
Preprocessing completed
```

#### **❌ 异常输出可能包括：**
- **函数不可用**: `preprocessImageForPlatform function is not available`
- **浏览器环境问题**: `Window is not available - running in server environment`
- **Canvas错误**: `Failed to get canvas context`
- **图像加载失败**: `Image failed to load`

## 🚨 **常见问题排查**

### **问题 1: 无任何控制台输出**
**可能原因**: `useEffect` 没有触发
**解决方案**: 检查 `platform` 参数是否正确传递

### **问题 2: 预处理函数不可用**
**可能原因**: 导入或导出问题
**解决方案**: 检查 `import { preprocessImageForPlatform } from '@/lib/image-resizer'`

### **问题 3: 浏览器环境检查失败**
**可能原因**: 服务器端渲染问题
**解决方案**: 确保在客户端环境中运行

### **问题 4: Canvas上下文获取失败**
**可能原因**: 浏览器不支持Canvas API
**解决方案**: 检查浏览器兼容性

### **问题 5: 图像加载失败**
**可能原因**: 跨域问题或图像格式不支持
**解决方案**: 检查图像源和格式

## 🔧 **手动测试预处理函数**

### **在控制台中直接测试：**
```javascript
// 检查函数是否可用
console.log('preprocessImageForPlatform:', typeof preprocessImageForPlatform)

// 检查平台配置
console.log('platformSizes:', platformSizes)

// 检查当前平台
console.log('Current platform:', platform)
```

### **测试图像转换：**
```javascript
// 测试文件转data URL
const file = referenceImages[0]
const reader = new FileReader()
reader.onloadend = () => {
  console.log('File converted to data URL:', reader.result.substring(0, 100))
}
reader.readAsDataURL(file)
```

## 📱 **测试场景**

### **场景 1: YouTube (1280×720)**
- **原图**: 1920×1080 横向图像
- **预期**: 图像被智能剪裁为 1280×720
- **检查点**: 人物头部是否完整保留

### **场景 2: 微信视频号 (1080×1260)**
- **原图**: 1080×1920 竖向图像
- **预期**: 图像被智能剪裁为 1080×1260
- **检查点**: 人物头部是否从顶部开始

### **场景 3: 小红书 (1080×1440)**
- **原图**: 1080×1920 竖向图像
- **预期**: 图像被智能剪裁为 1080×1440
- **检查点**: 人物头部是否完整

## 🎯 **成功标准**

### **功能完整性**
- ✅ 选择平台后立即开始预处理
- ✅ 显示 "Processing..." 状态指示器
- ✅ 参考图像自动调整为平台尺寸
- ✅ 图像左上角显示绿色 "✓" 完成标记
- ✅ 底部显示 "Platform Preview Active" 提示

### **技术指标**
- ✅ 控制台输出完整的调试信息
- ✅ 预处理函数正常执行
- ✅ 图像尺寸正确调整
- ✅ 无错误或异常

## 🚨 **问题报告**

如果测试失败，请提供以下信息：

1. **控制台输出**: 完整的控制台日志
2. **错误信息**: 任何错误或警告
3. **测试步骤**: 详细的操作步骤
4. **浏览器信息**: 浏览器类型和版本
5. **图像信息**: 原图尺寸和格式
6. **平台选择**: 选择的平台名称

## 🔄 **重新测试**

修复问题后，请按以下步骤重新测试：

1. **刷新页面**: 确保加载最新代码
2. **重新上传图像**: 使用新的测试图像
3. **选择不同平台**: 测试多个平台
4. **验证结果**: 确认所有功能正常

---

**现在请按照上述步骤进行调试测试，并告诉我控制台的输出结果！** 🐛
