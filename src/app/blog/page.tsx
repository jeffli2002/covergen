import { Metadata } from 'next'
import BlogContent from './BlogContent'

export const metadata: Metadata = {
  title: 'Blog - AI Cover Generation Tips & Content Creator Resources',
  description: 'Expert insights on AI cover generation, content creation tips, platform best practices, and the latest trends in AI-powered design tools.',
  keywords: [
    'AI design blog',
    'content creator tips',
    'cover generation guides',
    'YouTube thumbnail tips',
    'TikTok cover trends',
    'AI design trends',
    'content creation blog',
    'social media design tips'
  ],
  openGraph: {
    title: 'CoverGen AI Blog - Content Creation Tips & AI Design Insights',
    description: 'Stay updated with the latest AI cover generation trends, platform tips, and content creator resources.',
    images: ['/blog-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/blog',
  },
}

export default function BlogPage() {
  return <BlogContent />
}