import { Metadata } from 'next'
import FacebookEventCoverTool from '@/components/tools/FacebookEventCoverTool'

export const metadata: Metadata = {
  title: 'Facebook Event Cover Maker - Create Event Banners | CoverGen Pro',
  description: 'Design perfect Facebook event covers with AI. Optimized 1200x628 dimensions for maximum engagement. Create covers that boost event attendance.',
  keywords: 'facebook event cover, facebook event banner, social media event cover, event cover photo, facebook event image',
  openGraph: {
    title: 'Facebook Event Cover Maker - AI-Powered Design | CoverGen Pro',
    description: 'Create engaging Facebook event covers that drive attendance. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default function FacebookEventCoverPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Tool Component - This includes the entire layout with Output Gallery */}
      <FacebookEventCoverTool />
    </div>
  )
}