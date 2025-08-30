# 优化后的Prompt模式示例

## 🎯 **新的Prompt结构**

根据您的要求，我们重新设计了prompt模式，使其更加结构化和清晰：

### **基础格式**
```
Title: [Insert Video Title Here]
Social Media Platform: [e.g., YouTube, TikTok, Twitter]

Instructions for AI:

[尺寸要求]

Layout:
[布局要求]

Background:
[背景要求]

Design Consistency:
[设计一致性要求]

No additional text/icons:
[无额外文字/图标要求]

Base Style: [基础风格描述]
```

## 📱 **平台特定示例**

### **YouTube (1280 x 720)**

**生成的Prompt:**
```
Title: 我的游戏视频标题
Social Media Platform: youtube

Instructions for AI:

Width: 1280px, Height: 720px

Layout:
Avoid placing important elements in bottom-right (duration overlay). High contrast works best for visibility. Consider mobile viewing where thumbnails are very small.

Background:
Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.

Design Consistency:
Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best.

No additional text/icons:
The image should only contain the title and any necessary design elements based on the social media platform's visual style. Do not add any extra text, logos, or icons unless explicitly specified in the prompt.

Base Style: YouTube thumbnail style, eye-catching, high contrast, clickable, modern style, thumbnail optimized, bright colors pop in feed
```

### **微信视频号 (1080 x 1260)**

**生成的Prompt:**
```
Title: 我的商业内容标题
Social Media Platform: wechat

Instructions for AI:

Width: 1080px, Height: 1260px

Layout:
Optimized for WeChat Channels (视频号). Account for platform UI overlays. Clear focal point in center. Works well with Chinese typography.

Background:
Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.

Design Consistency:
Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best.

No additional text/icons:
The image should only contain the title and any necessary design elements based on the social media platform's visual style. Do not add any extra text, logos, or icons unless explicitly specified in the prompt.

Base Style: 微信视频号 (WeChat Channels) cover, Chinese social media optimized, modern style, professional appearance, WeChat-friendly design
```

### **TikTok (1080 x 1920)**

**生成的Prompt:**
```
Title: 我的短视频标题
Social Media Platform: tiktok

Instructions for AI:

Width: 1080px, Height: 1920px

Layout:
Account for UI elements at top and bottom. Vertical format optimized for mobile viewing. Bold, eye-catching visuals perform best. Leave space for username and video controls.

Background:
Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.

Design Consistency:
Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best.

No additional text/icons:
The image should only contain the title and any necessary design elements based on the social media platform's visual style. Do not add any extra text, logos, or icons unless explicitly specified in the prompt.

Base Style: Vertical format, mobile-first design, Gen-Z aesthetic, TikTok style, modern style, trending visual style, bold colors and high contrast text
```

## 🔧 **技术实现特点**

### **1. 结构化指令**
- **尺寸要求**: 明确的像素尺寸
- **布局要求**: 具体的布局指导
- **背景要求**: 背景设计规范
- **设计一致性**: 平台风格要求

### **2. 清晰的格式**
- 使用换行符分隔不同部分
- 每个部分都有明确的标题
- 指令语言简洁明了

### **3. 平台特定优化**
- 每个平台都有独特的配置
- 考虑平台UI元素和限制
- 符合平台的设计标准

## 🚀 **优势**

1. **更清晰的指令**: AI更容易理解具体要求
2. **更好的结果**: 结构化的prompt产生更一致的结果
3. **更容易维护**: 通过配置而非代码修改
4. **更好的扩展性**: 新增平台只需配置prompt模板

## 📝 **使用方式**

在代码中，prompt会自动生成：

```typescript
const enhancedPrompt = generatePlatformPrompt(platform, 'modern', userTitle)
```

生成的prompt会直接传递给AI，确保：
- 图像尺寸符合平台要求
- Title正确显示且不遮挡主要内容
- 背景和设计符合平台标准
- 无额外文字或图标

这个新的prompt模式更加专业和有效！🎯
