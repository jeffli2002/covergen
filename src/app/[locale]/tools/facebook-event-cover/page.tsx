import FacebookEventCoverClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

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

export default async function FacebookEventCoverPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return <FacebookEventCoverClient locale={params.locale} translations={dict} />
}