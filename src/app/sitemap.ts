import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://covergen.ai'
  const currentDate = new Date().toISOString()
  
  // Define all static routes with multi-language support
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
      alternates: {
        languages: generateLanguageAlternates(''),
      },
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: generateLanguageAlternates('/pricing'),
      },
    },
    {
      url: `${baseUrl}/tutorials`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/tutorials'),
      },
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
      alternates: {
        languages: generateLanguageAlternates('/blog'),
      },
    },
    {
      url: `${baseUrl}/showcase`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: generateLanguageAlternates('/showcase'),
      },
    },
    {
      url: `${baseUrl}/help`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: generateLanguageAlternates('/help'),
      },
    },
    {
      url: `${baseUrl}/support`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/support'),
      },
    },
    {
      url: `${baseUrl}/feedback`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/feedback'),
      },
    },
    {
      url: `${baseUrl}/status`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.5,
      alternates: {
        languages: generateLanguageAlternates('/status'),
      },
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/terms'),
      },
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/privacy'),
      },
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/cookies'),
      },
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: {
        languages: generateLanguageAlternates('/accessibility'),
      },
    },
  ]
  
  // Platform-specific pages with proper priorities and keywords focus
  const platforms = [
    { name: 'youtube', priority: 0.95 }, // Higher priority for popular platforms
    { name: 'twitch', priority: 0.9 },
    { name: 'spotify', priority: 0.9 },
    { name: 'tiktok', priority: 0.95 }, // High demand platform
    { name: 'linkedin', priority: 0.85 },
    { name: 'instagram', priority: 0.9 },
    { name: 'xiaohongshu', priority: 0.85 },
    { name: 'wechat', priority: 0.85 },
  ]
  
  const platformRoutes = platforms.flatMap((platform) => [
    {
      url: `${baseUrl}/platforms/${platform.name}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: platform.priority,
      alternates: {
        languages: generateLanguageAlternates(`/platforms/${platform.name}`),
      },
    },
  ])
  
  // Combine all routes
  return [...staticRoutes, ...platformRoutes]
}

// Helper function to generate language alternates
function generateLanguageAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {}
  
  // Since we only support English now, we just return the English URL
  i18n.locales.forEach((locale) => {
    alternates[locale.code] = `https://covergen.ai/${locale.code}${path}`
  })
  
  return alternates
}