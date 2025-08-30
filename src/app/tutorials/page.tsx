import { Metadata } from 'next'
import TutorialsContent from './TutorialsContent'

export const metadata: Metadata = {
  title: 'Tutorials - Learn AI Cover Generation Best Practices',
  description: 'Master AI-powered cover generation with expert tutorials on prompt engineering, platform optimization, and design tips for YouTube, TikTok, and more.',
  keywords: [
    'AI cover generation tutorial',
    'prompt engineering guide',
    'YouTube thumbnail tutorial',
    'TikTok cover tips',
    'social media design guide',
    'AI design tutorials',
    'cover maker guide',
    'content creator tutorials'
  ],
  openGraph: {
    title: 'CoverGen AI Tutorials - Master AI Cover Generation',
    description: 'Learn how to create stunning covers with AI. Expert tips on prompts, platform optimization, and design best practices.',
    images: ['/tutorials-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.ai/tutorials',
  },
}

export default function TutorialsPage() {
  return <TutorialsContent />
}