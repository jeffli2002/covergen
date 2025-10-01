import { Metadata } from 'next'
import ShowcaseContent from './ShowcaseContent'

export const metadata: Metadata = {
  title: 'Showcase Gallery - AI-Generated Covers & Thumbnails',
  description: 'Explore stunning AI-generated covers and thumbnails created by our community. Get inspired by professional designs for YouTube, TikTok, and more.',
  keywords: [
    'ai cover showcase',
    'thumbnail gallery',
    'cover design examples',
    'ai generated covers',
    'creator gallery',
    'design inspiration',
    'cover templates',
    'thumbnail examples',
    'sora 2 showcase',
    'sora 2 gallery',
    'sora 2 examples',
    'sora 2 video covers',
    'sora 2 creations',
    'sora 2 designs'
  ],
  openGraph: {
    title: 'CoverGen AI Gallery - Stunning AI Cover Designs',
    description: 'Browse inspiring AI-generated covers and thumbnails from our creative community.',
    images: ['/showcase-og.jpg'],
  },
}

export default function ShowcasePage() {
  return <ShowcaseContent />
}