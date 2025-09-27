import ClientBoundary from '@/components/client-boundary'

import ThumbnailTesterClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thumbnail Tester - Preview & Optimize Your Thumbnails | CoverGen Pro',
  description: 'Test how your thumbnails look on YouTube, TikTok, and other platforms. Preview different sizes, compare CTR potential, and optimize your thumbnail designs.',
  keywords: 'thumbnail tester, thumbnail preview, youtube thumbnail tester, thumbnail checker, thumbnail analyzer, ctr optimizer, thumbnail comparison tool, thumbnail preview tool, thumbnail sketch, youtube thumbnail preview, thumbnail performance tester',
  openGraph: {
    title: 'Thumbnail Tester - Preview & Optimize Your Thumbnails | CoverGen Pro',
    description: 'Test and optimize your thumbnails for maximum CTR. Preview how they look across different platforms.',
    type: 'website',
  },
}

export default async function ThumbnailTesterPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <ThumbnailTesterClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}