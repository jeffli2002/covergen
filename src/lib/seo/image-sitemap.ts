export interface ImageSitemapEntry {
  loc: string
  caption?: string
  title?: string
  geoLocation?: string
  license?: string
}

export interface PageWithImages {
  loc: string
  lastmod?: string
  images: ImageSitemapEntry[]
}

export function generateImageSitemapXML(pages: PageWithImages[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${page.loc}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
${page.images.map(image => `    <image:image>
      <image:loc>${image.loc}</image:loc>
      ${image.caption ? `<image:caption>${escapeXml(image.caption)}</image:caption>` : ''}
      ${image.title ? `<image:title>${escapeXml(image.title)}</image:title>` : ''}
      ${image.geoLocation ? `<image:geo_location>${image.geoLocation}</image:geo_location>` : ''}
      ${image.license ? `<image:license>${image.license}</image:license>` : ''}
    </image:image>`).join('\n')}
  </url>`).join('\n')}
</urlset>`

  return xml
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Generate image sitemap entries for platform pages
export function getPlatformImageSitemapEntries(): PageWithImages[] {
  const baseUrl = 'https://covergen.pro'
  const platforms = ['youtube', 'tiktok', 'instagram', 'spotify', 'twitch', 'linkedin']
  const locales = ['en', 'es', 'pt', 'zh', 'ar']
  
  const entries: PageWithImages[] = []
  
  for (const locale of locales) {
    for (const platform of platforms) {
      const platformCapitalized = platform.charAt(0).toUpperCase() + platform.slice(1)
      
      entries.push({
        loc: `${baseUrl}/${locale}/platforms/${platform}`,
        lastmod: new Date().toISOString().split('T')[0],
        images: [
          {
            loc: `${baseUrl}/platform-examples/${platform}/original-1.webp`,
            caption: `${platformCapitalized} cover maker example showing AI transformation`,
            title: `AI-generated ${platformCapitalized} cover example 1`,
          },
          {
            loc: `${baseUrl}/platform-examples/${platform}/original-2.webp`,
            caption: `${platformCapitalized} cover creation with CoverGen Pro AI`,
            title: `AI-generated ${platformCapitalized} cover example 2`,
          },
          ...(platform === 'youtube' ? [{
            loc: `${baseUrl}/platform-examples/${platform}/original-3.webp`,
            caption: `YouTube thumbnail maker showing viral content optimization`,
            title: `AI-generated YouTube thumbnail example 3`,
          }] : [])
        ]
      })
    }
  }
  
  // Add homepage with key feature images
  entries.push({
    loc: `${baseUrl}/en`,
    lastmod: new Date().toISOString().split('T')[0],
    images: [
      {
        loc: `${baseUrl}/features/ai-powered-generation.webp`,
        caption: 'AI-powered cover generation for all social media platforms',
        title: 'CoverGen Pro AI Cover Generation',
      },
      {
        loc: `${baseUrl}/features/multi-platform-support.webp`,
        caption: 'Support for YouTube, TikTok, Instagram, Spotify and more',
        title: 'Multi-platform Cover Creation',
      }
    ]
  })
  
  return entries
}

// Helper to add image sitemap to robots.txt
export function getImageSitemapRobotsEntry(): string {
  return 'Sitemap: https://covergen.pro/image-sitemap.xml'
}