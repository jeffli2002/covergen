import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://covergen.ai'
  
  // Define all important images on the site
  const images = [
    {
      loc: `${baseUrl}/`,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          title: 'CoverGen AI - AI-Powered Cover Generator',
          caption: 'Create stunning covers with AI and nano banana technology',
        },
        {
          url: `${baseUrl}/hero-image.jpg`,
          title: 'AI Cover Generation Demo',
          caption: 'See how CoverGen AI creates professional covers in seconds',
        },
      ],
    },
    {
      loc: `${baseUrl}/platforms/youtube`,
      images: [
        {
          url: `${baseUrl}/youtube-thumbnail-maker-og.jpg`,
          title: 'YouTube Thumbnail Maker',
          caption: 'Create eye-catching YouTube thumbnails with AI',
        },
        {
          url: `${baseUrl}/youtube-examples.jpg`,
          title: 'YouTube Thumbnail Examples',
          caption: 'Professional YouTube thumbnails created with CoverGen AI',
        },
      ],
    },
    {
      loc: `${baseUrl}/platforms/tiktok`,
      images: [
        {
          url: `${baseUrl}/tiktok-cover-creator-og.jpg`,
          title: 'TikTok Cover Creator',
          caption: 'Design viral TikTok covers with nano banana AI',
        },
      ],
    },
    {
      loc: `${baseUrl}/platforms/spotify`,
      images: [
        {
          url: `${baseUrl}/spotify-cover-art-og.jpg`,
          title: 'Spotify Cover Art Generator',
          caption: 'Professional album covers for Spotify',
        },
      ],
    },
    {
      loc: `${baseUrl}/showcase`,
      images: [
        {
          url: `${baseUrl}/showcase-gallery.jpg`,
          title: 'CoverGen AI Showcase Gallery',
          caption: 'Browse covers created by our community',
        },
      ],
    },
    {
      loc: `${baseUrl}/pricing`,
      images: [
        {
          url: `${baseUrl}/pricing-plans.jpg`,
          title: 'CoverGen AI Pricing Plans',
          caption: 'Choose the perfect plan for your needs',
        },
      ],
    },
  ]

  // Generate XML sitemap
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images
  .map(
    (page) => `
  <url>
    <loc>${page.loc}</loc>
    ${page.images
      .map(
        (img) => `
    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${img.title}</image:title>
      <image:caption>${img.caption}</image:caption>
    </image:image>`
      )
      .join('')}
  </url>`
  )
  .join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  })
}