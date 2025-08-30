# 🧪 测试说明：选择平台后的实时图像预处理

## 🎯 **测试目标**

验证选择平台后，参考图像能够**实时自动调整尺寸**，显示预处理后的效果。

## 📋 **测试步骤**

### **步骤 1: 启动应用**
```bash
# 确保前端服务正在运行
http://localhost:3001
```

### **步骤 2: 上传参考图像**
1. 选择 **"Image to Image"** 模式
2. 点击 **"Add"** 按钮上传一张包含人物的图像
3. 确认图像已成功上传并显示

### **步骤 3: 选择平台**
1. 在 **Step 2: Prompt Configuration** 中
2. 选择任意平台（如 **YouTube** 或 **微信视频号**）
3. 观察 **Step 1: Input Mode** 中的变化

## 🔍 **预期结果**

### **✅ 成功表现**
1. **实时预处理**: 选择平台后，参考图像立即开始处理
2. **处理指示器**: 显示 "Processing..." 和旋转的刷新图标
3. **图像变化**: 参考图像从原图变为预处理后的图像
4. **尺寸调整**: 图像尺寸自动调整为平台要求（如YouTube: 1280×720）
5. **完成标记**: 图像左上角显示绿色 "✓" 标记
6. **平台信息**: 底部显示 "Platform Preview Active" 提示

### **❌ 失败表现**
1. **无变化**: 选择平台后图像没有任何变化
2. **无处理指示**: 没有显示 "Processing..." 状态
3. **尺寸不变**: 图像尺寸仍然是原始尺寸
4. **无完成标记**: 图像上没有绿色 "✓" 标记

## 🐛 **调试信息**

### **浏览器控制台检查**
1. 按 **F12** 打开开发者工具
2. 切换到 **Console** 标签
3. 选择平台后，应该看到以下日志：
   ```
   ModeSelector useEffect triggered: {mode: "image", referenceImagesLength: 1, platform: "youtube", isPreprocessing: false}
   Starting auto-preprocessing for platform: youtube
   Starting preprocessing for platform: youtube with 1 images
   Platform dimensions: {width: 1280, height: 720}
   Processing image 1/1
   Image 1 converted to data URL, length: 12345
   Image 1 processed successfully, length: 67890
   All images processed successfully: 1
   Preprocessing completed
   ```

### **常见问题排查**
1. **无日志输出**: 检查 `useEffect` 是否正确触发
2. **预处理失败**: 检查 `preprocessImageForPlatform` 函数是否正常
3. **图像不显示**: 检查 `getDisplayImage` 函数逻辑
4. **状态不更新**: 检查 `setPreprocessedImages` 是否正确调用

## 🔧 **技术验证**

### **函数调用链**
```
选择平台 → useEffect触发 → preprocessImages() → preprocessImageForPlatform() → setPreprocessedImages() → 重新渲染 → getDisplayImage() → 显示预处理后的图像
```

### **关键函数检查**
1. **`useEffect`**: 依赖项 `[mode, referenceImages, platform]`
2. **`preprocessImages`**: 异步处理所有图像
3. **`getDisplayImage`**: 条件显示原图或预处理后的图像
4. **`preprocessImageForPlatform`**: 执行实际的图像处理

## 📱 **测试场景**

### **场景 1: YouTube (1280×720)**
- **原图**: 1920×1080 横向图像
- **预期**: 图像被智能剪裁为 1280×720，人物头部完整保留

### **场景 2: 微信视频号 (1080×1260)**
- **原图**: 1080×1920 竖向图像
- **预期**: 图像被智能剪裁为 1080×1260，人物头部完整保留

### **场景 3: 小红书 (1080×1440)**
- **原图**: 1080×1920 竖向图像
- **预期**: 图像被智能剪裁为 1080×1440，人物头部完整保留

## 🎉 **成功标准**

### **功能完整性**
- ✅ 选择平台后立即开始预处理
- ✅ 显示处理状态指示器
- ✅ 图像尺寸正确调整
- ✅ 人物头部完整保留
- ✅ 显示完成标记
- ✅ 平台信息正确显示

### **用户体验**
- ✅ 实时反馈处理状态
- ✅ 预处理过程流畅
- ✅ 结果与预期一致
- ✅ 无卡顿或延迟

## 🚨 **问题报告**

如果测试失败，请提供以下信息：

1. **测试步骤**: 详细描述执行的操作
2. **预期结果**: 期望看到什么
3. **实际结果**: 实际看到什么
4. **错误信息**: 控制台中的任何错误
5. **浏览器信息**: 浏览器类型和版本
6. **截图**: 问题现象的截图

## 🔄 **重新测试**

修复问题后，请按以下步骤重新测试：

1. **刷新页面**: 确保加载最新代码
2. **重新上传图像**: 使用新的测试图像
3. **选择不同平台**: 测试多个平台
4. **验证结果**: 确认所有功能正常

---

**现在请按照上述步骤测试选择平台后的实时图像预处理功能！** 🎯
