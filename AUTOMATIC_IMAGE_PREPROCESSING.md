# 自动图像预处理 + AI生成工作流程

## 🎯 **方案概述**

通过先自动调整输入图像的尺寸和布局，然后再传递给AI生成，可以避免布局不一致的问题。这个方案确保：

1. **主要对象突出**: 保持输入图像的主要对象在显眼位置
2. **尺寸一致性**: 自动调整到平台要求的尺寸
3. **布局优化**: 避免AI生成时的布局不一致问题
4. **更好的结果**: 预处理后的图像给AI提供更好的参考

## 🔧 **技术实现**

### **1. 新的工作流程**

```
用户上传图像 → 选择平台 → 自动预处理 → 传递给AI → 生成最终图像
```

### **2. 预处理函数**

新增了 `preprocessImageForPlatform` 函数：

```typescript
export async function preprocessImageForPlatform(
  imageUrl: string,
  targetWidth: number,
  targetHeight: number,
  platform: string
): Promise<string>
```

**功能特点：**
- **Contain模式**: 保持图像比例，不裁剪主要对象
- **智能背景**: 从图像边缘提取颜色，创建统一背景
- **主要对象居中**: 确保主要对象在画布中央
- **平台尺寸匹配**: 自动调整到平台要求的尺寸

### **3. 修改后的生成流程**

在 `image-generator.tsx` 中：

```typescript
// 如果选择了特定平台，先预处理图像
if (mode === 'image' && referenceImages.length > 0 && platform !== 'none') {
  const dimensions = platformSizes[platform]
  
  // 预处理图像以匹配平台尺寸，保持主要对象突出
  processedImages = await Promise.all(
    referenceImagesBase64.map(async (imageUrl) => {
      return await preprocessImageForPlatform(imageUrl, dimensions.width, dimensions.height, platform)
    })
  )
}

// 将预处理后的图像传递给AI
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: enhancedPrompt,
    referenceImages: mode === 'image' ? processedImages : undefined,
    // ... 其他参数
  }),
})
```

## 📱 **平台特定处理**

### **YouTube (1280 x 720)**
- 横向布局，主要对象居中
- 避免右下角元素遮挡
- 适合视频缩略图显示

### **TikTok (1080 x 1920)**
- 垂直布局，移动端优化
- 主要对象在中央区域
- 考虑顶部和底部UI元素

### **微信视频号 (1080 x 1260)**
- 垂直布局，中文社交媒体优化
- 主要对象突出显示
- 专业、商务风格

### **小红书 (1080 x 1440)**
- 垂直布局，生活方式内容
- 主要对象美观展示
- 简约、时尚风格

## 🚀 **优势对比**

| 方面 | 传统方案 | 新方案 |
|------|----------|--------|
| **布局一致性** | AI可能产生不一致布局 | 预处理确保布局一致 |
| **主要对象位置** | 可能被裁剪或偏移 | 始终保持在显眼位置 |
| **背景处理** | AI可能产生不协调背景 | 智能提取，自然延展 |
| **尺寸匹配** | 后期调整可能失真 | 预处理时精确匹配 |
| **用户体验** | 需要多次调整 | 一次上传，自动优化 |

## 🔍 **技术细节**

### **1. 智能背景提取**
```typescript
// 从边缘采样，避免中心区域干扰
const edgeSamples = [
  // 顶部边缘 - 全宽度
  ...Array.from({length: img.width}, (_, i) => i * 4),
  // 底部边缘 - 全宽度
  ...Array.from({length: img.width}, (_, i) => (img.height - 1) * img.width * 4 + i * 4),
  // 左侧边缘 - 全高度
  ...Array.from({length: img.height}, (_, i) => i * img.width * 4),
  // 右侧边缘 - 全高度
  ...Array.from({length: img.height}, (_, i) => i * img.width * 4 + (img.width - 1) * 4)
]
```

### **2. 统一背景渐变**
```typescript
// 极subtle的渐变变化，确保完全统一
gradient.addColorStop(0, `rgb(${Math.max(0, r-2)}, ${Math.max(0, g-2)}, ${Math.max(0, b-2)})`)
gradient.addColorStop(0.2, `rgb(${Math.max(0, r-1)}, ${Math.max(0, g-1)}, ${Math.max(0, b-1)})`)
gradient.addColorStop(0.4, `rgb(${r}, ${g}, ${b})`)
gradient.addColorStop(0.6, `rgb(${r}, ${g}, ${b})`)
gradient.addColorStop(0.8, `rgb(${Math.min(255, r+1)}, ${Math.min(255, g+1)}, ${Math.min(255, b+1)})`)
gradient.addColorStop(1, `rgb(${Math.min(255, r+2)}, ${Math.min(255, g+2)}, ${Math.min(255, b+2)})`)
```

### **3. 主要对象居中**
```typescript
// 计算偏移量，确保主要对象居中
if (imgAspectRatio > canvasAspectRatio) {
  // 图像更宽，按宽度适配，垂直居中
  drawWidth = targetWidth
  drawHeight = drawWidth / imgAspectRatio
  offsetY = (targetHeight - drawHeight) / 2
} else {
  // 图像更高，按高度适配，水平居中
  drawHeight = targetHeight
  drawWidth = drawHeight * imgAspectRatio
  offsetX = (targetWidth - drawWidth) / 2
}
```

## 📝 **使用方式**

### **自动触发**
当用户选择平台后，预处理会自动进行：

1. 上传图像
2. 选择平台（如微信视频号）
3. 系统自动预处理图像到 1080x1260
4. 预处理后的图像传递给AI
5. AI基于预处理图像生成最终结果

### **无需手动调整**
- 用户不需要手动调整图像尺寸
- 系统自动处理布局和背景
- 主要对象始终保持在显眼位置

## 🎉 **总结**

通过这个新的工作流程，我们实现了：

- **更好的布局一致性**: 预处理确保图像布局符合平台要求
- **主要对象突出**: 智能定位，保持主要内容显眼
- **智能背景处理**: 自然延展，无突兀感
- **自动化流程**: 用户无需手动调整，系统自动优化

这是一个更加智能和用户友好的解决方案！🎯
