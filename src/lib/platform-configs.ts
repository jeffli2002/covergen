import { Youtube, Twitter, Music, Image, Video, Layout, Instagram, Facebook, Linkedin } from 'lucide-react'
import { TikTokIcon, SpotifyIcon, TwitterXIcon } from '@/components/icons/brand-icons'

export const platformIcons = {
  none: Layout,
  youtube: Youtube,
  twitter: TwitterXIcon,
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  tiktok: TikTokIcon,
  spotify: SpotifyIcon,
  rednote: Image,
  wechat: Video,
  bilibili: Video,
  twitch: Video
} as const

export const platformGuidelines = {
  none: [
    "Flexible dimensions for custom use",
    "No platform-specific constraints",
    "Full creative freedom"
  ],
  youtube: [
    "Text should be readable at small thumbnail size",
    "Avoid placing important elements in bottom-right (duration overlay)",
    "High contrast works best for visibility",
    "Consider mobile viewing where thumbnails are very small"
  ],
  twitter: [
    "Image will appear in timeline with rounded corners",
    "Keep text centered for best visibility",
    "Consider both light and dark mode Twitter themes",
    "Avoid text near edges due to cropping"
  ],
  instagram: [
    "Square format works best for feed posts",
    "Consider carousel posts for multiple images",
    "Bold, aesthetic visuals for Instagram aesthetic",
    "Ensure text is readable on mobile devices"
  ],
  facebook: [
    "Optimized for news feed display",
    "Text should be minimal and impactful",
    "Consider mobile and desktop viewing",
    "High contrast for better engagement"
  ],
  linkedin: [
    "Professional appearance is key",
    "Clean, business-appropriate design",
    "Text should be clear and professional",
    "Consider corporate branding guidelines"
  ],
  tiktok: [
    "Account for UI elements at top and bottom",
    "Vertical format optimized for mobile viewing",
    "Bold, eye-catching visuals perform best",
    "Leave space for username and video controls"
  ],
  spotify: [
    "Square format for album/playlist covers",
    "Will be displayed at various sizes",
    "Ensure good visibility at 64x64px",
    "Simple, iconic designs work best"
  ],
  rednote: [
    "First image is most important for discovery",
    "Text overlay should be clear and aesthetic",
    "Trending styles favor minimalist design",
    "Consider mobile-first viewing experience"
  ],
  wechat: [
    "Optimized for WeChat Channels (视频号)",
    "Account for platform UI overlays",
    "Clear focal point in center",
    "Works well with Chinese typography"
  ],
  bilibili: [
    "Similar to YouTube but for Chinese audience",
    "Anime/gaming aesthetics often perform well",
    "Consider bilibili's unique culture",
    "Text can be more detailed than YouTube"
  ],
  twitch: [
    "Wide format for stream previews",
    "Gaming/streaming culture aesthetic",
    "High energy visuals recommended",
    "Consider dark theme compatibility"
  ]
} as const

export const platformPrompts = {
  none: {
    base: "",
    modifiers: [],
    sizeInstructions: "",
    layoutInstructions: "",
    backgroundInstructions: "",
    designInstructions: ""
  },
  youtube: {
    base: "YouTube thumbnail style, eye-catching, high contrast, clickable",
    modifiers: [
      "thumbnail optimized",
      "text with maximum contrast and readability",
      "bold text shadows or outlines",
      "bright colors pop in feed"
    ],
    sizeInstructions: "Width: 1280px, Height: 720px",
    layoutInstructions: "Avoid placing important elements in bottom-right (duration overlay). High contrast works best for visibility. Consider mobile viewing where thumbnails are very small.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  twitter: {
    base: "Twitter post image, social media optimized, engaging visual",
    modifiers: [
      "works in both light and dark mode",
      "high contrast text overlay",
      "meme-friendly style",
      "readable on mobile feeds"
    ],
    sizeInstructions: "Width: 1600px, Height: 900px",
    layoutInstructions: "Image will appear in timeline with rounded corners. Keep text centered for best visibility. Consider both light and dark mode Twitter themes. Avoid text near edges due to cropping.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  instagram: {
    base: "Instagram post, aesthetic social media content, visually appealing",
    modifiers: [
      "Instagram-worthy aesthetic",
      "bold and vibrant colors",
      "lifestyle photography style",
      "mobile-optimized readability"
    ],
    sizeInstructions: "Width: 1080px, Height: 1080px",
    layoutInstructions: "Square format works best for feed posts. Consider carousel posts for multiple images. Bold, aesthetic visuals for Instagram aesthetic. Ensure text is readable on mobile devices.",
    backgroundInstructions: "Use trending colors or aesthetic backgrounds. Consider Instagram's visual culture and current design trends.",
    designInstructions: "Focus on visual storytelling. Use filters and effects that align with Instagram aesthetics. Keep it visually striking."
  },
  facebook: {
    base: "Facebook post image, social engagement optimized, shareable content",
    modifiers: [
      "Facebook-friendly design",
      "emotionally engaging visuals",
      "clear call-to-action",
      "shareable content style"
    ],
    sizeInstructions: "Width: 1200px, Height: 630px",
    layoutInstructions: "Optimized for news feed display. Text should be minimal and impactful. Consider mobile and desktop viewing. High contrast for better engagement.",
    backgroundInstructions: "Use colors that stand out in the Facebook feed. Consider emotional appeal and shareability.",
    designInstructions: "Create content that encourages engagement. Use visuals that tell a story or evoke emotion."
  },
  linkedin: {
    base: "LinkedIn post, professional business content, corporate style",
    modifiers: [
      "professional appearance",
      "business-appropriate design",
      "corporate branding style",
      "thought leadership aesthetic"
    ],
    sizeInstructions: "Width: 1200px, Height: 627px",
    layoutInstructions: "Professional appearance is key. Clean, business-appropriate design. Text should be clear and professional. Consider corporate branding guidelines.",
    backgroundInstructions: "Use professional colors like blues, grays, or corporate brand colors. Keep it clean and sophisticated.",
    designInstructions: "Maintain a professional tone. Use clean typography and structured layouts. Focus on credibility and expertise."
  },
  tiktok: {
    base: "Vertical format, mobile-first design, Gen-Z aesthetic, TikTok style",
    modifiers: [
      "trending visual style",
      "bold colors and high contrast text",
      "dynamic composition",
      "text clearly visible on mobile"
    ],
    sizeInstructions: "Width: 1080px, Height: 1920px",
    layoutInstructions: "Account for UI elements at top and bottom. Vertical format optimized for mobile viewing. Bold, eye-catching visuals perform best. Leave space for username and video controls.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  spotify: {
    base: "Square album artwork, professional music cover, Spotify playlist style",
    modifiers: [
      "genre-appropriate styling",
      "artist name with high contrast",
      "playlist-worthy aesthetic",
      "readable at small sizes"
    ],
    sizeInstructions: "Width: 3000px, Height: 3000px",
    layoutInstructions: "Square format for album/playlist covers. Will be displayed at various sizes. Ensure good visibility at 64x64px. Simple, iconic designs work best.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  rednote: {
    base: "Rednote (小红书) style, aesthetic lifestyle content, trendy Chinese social media",
    modifiers: [
      "minimalist and clean",
      "lifestyle photography style",
      "high contrast text overlay",
      "Instagram-like aesthetic"
    ],
    sizeInstructions: "Width: 1080px, Height: 1440px",
    layoutInstructions: "First image is most important for discovery. Text overlay should be clear and aesthetic. Trending styles favor minimalist design. Consider mobile-first viewing experience.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  wechat: {
    base: "微信视频号 (WeChat Channels) cover, Chinese social media optimized",
    modifiers: [
      "professional appearance",
      "WeChat-friendly design",
      "clear text contrast",
      "readable Chinese text"
    ],
    sizeInstructions: "Width: 1080px, Height: 1260px",
    layoutInstructions: "Optimized for WeChat Channels (视频号). Account for platform UI overlays. Clear focal point in center. Works well with Chinese typography.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  bilibili: {
    base: "Bilibili video cover, Chinese video platform style, anime/ACG culture friendly",
    modifiers: [
      "anime aesthetic compatible",
      "detailed illustration style",
      "vibrant colors with contrast text",
      "otaku culture aware"
    ],
    sizeInstructions: "Width: 1280px, Height: 720px",
    layoutInstructions: "Similar to YouTube but for Chinese audience. Anime/gaming aesthetics often perform well. Consider bilibili's unique culture. Text can be more detailed than YouTube.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  },
  twitch: {
    base: "Twitch stream thumbnail, gaming culture, streamer aesthetic",
    modifiers: [
      "gaming-focused design",
      "high energy visuals",
      "streamer name with high contrast",
      "readable in dark theme"
    ],
    sizeInstructions: "Width: 1280px, Height: 720px",
    layoutInstructions: "Wide format for stream previews. Gaming/streaming culture aesthetic. High energy visuals recommended. Consider dark theme compatibility.",
    backgroundInstructions: "Use a neutral background or a subtle pattern. Avoid busy backgrounds that might distract from the text.",
    designInstructions: "Consider a clean, minimalist design with a strong focal point. Bold, eye-catching visuals perform best."
  }
} as const

export const platformEnhancements = {
  none: [],
  youtube: [
    "Thumbnail optimization",
    "CTR-focused design",
    "Mobile visibility"
  ],
  twitter: [
    "Timeline optimization", 
    "Dark mode support",
    "Engagement boost"
  ],
  instagram: [
    "Aesthetic appeal",
    "Story-ready format",
    "Influencer style"
  ],
  facebook: [
    "Shareability",
    "Engagement focus",
    "Mobile optimization"
  ],
  linkedin: [
    "Professional tone",
    "B2B messaging",
    "Thought leadership"
  ],
  tiktok: [
    "Vertical format", 
    "Gen-Z styling",
    "Trend awareness"
  ],
  spotify: [
    "Album art style",
    "Genre matching",
    "Icon clarity"
  ],
  rednote: [
    "Aesthetic focus",
    "Lifestyle branding",
    "Trend alignment"
  ],
  wechat: [
    "Chinese optimization",
    "Professional look",
    "Clear hierarchy"
  ],
  bilibili: [
    "ACG culture",
    "Detailed artwork",
    "Youth appeal"
  ],
  twitch: [
    "Gaming aesthetic",
    "Stream branding",
    "Energy boost"
  ]
} as const

export function generatePlatformPrompt(platform: string, style: string, userTitle: string, userPrompt: string = ''): string {
  const platformConfig = platformPrompts[platform as keyof typeof platformPrompts]
  
  // Build structured prompt exactly as requested
  let finalPrompt = `Title: ${userTitle}\n`
  finalPrompt += `Input Image: ${userPrompt || '[Insert Image Description Here]'}\n`
  finalPrompt += `Social Media Platform: ${platform}\n\n`
  
  if (platform === 'none') {
    return finalPrompt
  }
  
  finalPrompt += `Instructions for AI:\n\n`
  
  // First, emphasize creating image based on the prompt
  finalPrompt += `Generate an image based on the description: "${userPrompt}"\n\n`
  
  // Include the title text
  finalPrompt += `Include the title text "${userTitle}" prominently on the image.\n\n`
  
  // Resize instructions
  finalPrompt += `Resize the image to match the cover image size requirement of the selected platform.\n\n`
  if (platform === 'youtube') {
    finalPrompt += `YouTube: 1280 x 720\n`
  } else if (platform === 'tiktok') {
    finalPrompt += `TikTok: 1080 x 1920\n`
  } else if (platform === 'twitter') {
    finalPrompt += `Twitter: 1600 x 900\n`
  } else if (platform === 'instagram') {
    finalPrompt += `Instagram: 1080 x 1080\n`
  } else if (platform === 'facebook') {
    finalPrompt += `Facebook: 1200 x 630\n`
  } else if (platform === 'linkedin') {
    finalPrompt += `LinkedIn: 1200 x 627\n`
  } else if (platform === 'spotify') {
    finalPrompt += `Spotify: 3000 x 3000\n`
  } else if (platform === 'rednote') {
    finalPrompt += `Rednote: 1080 x 1440\n`
  } else if (platform === 'wechat') {
    finalPrompt += `WeChat: 1080 x 1260\n`
  } else if (platform === 'bilibili') {
    finalPrompt += `Bilibili: 1280 x 720\n`
  } else if (platform === 'twitch') {
    finalPrompt += `Twitch: 1280 x 720\n`
  }
  finalPrompt += `(Adjust dimensions based on platform requirements)\n\n`
  
  // Layout
  finalPrompt += `Layout:\n\n`
  finalPrompt += `Ensure the title "${userTitle}" is prominently displayed but does not obscure the main subject of the image (e.g., people's faces, key focal points).\n\n`
  finalPrompt += `Place the title in an area where it doesn't interfere with the central theme or visuals, typically along the top or bottom of the image.\n\n`
  
  // Background
  finalPrompt += `Background:\n\n`
  finalPrompt += `Ensure the background color or picture blends well with the image, making it visually appealing yet not overpowering the main subject.\n\n`
  finalPrompt += `The background should be consistent with the selected social media platform's design standards.\n\n`
  
  // No additional text/icons
  finalPrompt += `No additional text/icons:\n\n`
  finalPrompt += `The image should only contain the title "${userTitle}" and any necessary design elements based on the social media platform's visual style. Do not add any extra text, logos, or icons unless explicitly specified in the prompt.\n\n`
  
  // Design Consistency
  finalPrompt += `Design Consistency:\n\n`
  finalPrompt += `Maintain a design that is visually consistent with the platform's general aesthetic (e.g., YouTube's clean, professional look, TikTok's vibrant and bold style, etc.).\n`
  
  // Style instruction if specified
  if (style && style !== 'none') {
    finalPrompt += `\nApply ${style} style to the overall design.\n`
  }
  
  return finalPrompt
}

export const styleTemplates = {
  none: [],
  youtube: [
    "Gaming",
    "Educational",
    "Entertainment",
    "Tech Review",
    "Vlog"
  ],
  twitter: [
    "Meme",
    "Infographic",
    "Quote",
    "News",
    "Personal"
  ],
  instagram: [
    "Lifestyle",
    "Fashion",
    "Food",
    "Travel",
    "Fitness"
  ],
  facebook: [
    "Event",
    "Promotion",
    "Community",
    "Inspirational",
    "Product"
  ],
  linkedin: [
    "Industry News",
    "Career Tips",
    "Company Update",
    "Thought Leadership",
    "Case Study"
  ],
  tiktok: [
    "Dance",
    "Comedy",
    "Beauty",
    "Food",
    "Trending"
  ],
  spotify: [
    "Pop",
    "Rock",
    "Hip Hop",
    "Electronic",
    "Classical"
  ],
  rednote: [
    "Lifestyle",
    "Fashion",
    "Beauty",
    "Travel",
    "Food"
  ],
  wechat: [
    "Business",
    "Lifestyle",
    "Education",
    "Entertainment",
    "News"
  ],
  bilibili: [
    "Anime",
    "Gaming",
    "Technology",
    "Music",
    "Education"
  ],
  twitch: [
    "Gaming",
    "Just Chatting",
    "Creative",
    "Music",
    "IRL"
  ]
} as const