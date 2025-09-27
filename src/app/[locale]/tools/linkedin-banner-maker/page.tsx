import ClientBoundary from '@/components/client-boundary'

import LinkedInBannerMakerClient from './page-client'
import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkedIn Banner Maker - Create Professional Profile Headers | CoverGen Pro',
  description: 'Design professional LinkedIn banners with AI. Perfect 1584x396px dimensions to enhance your professional image and attract more opportunities.',
  keywords: 'linkedin banner maker, linkedin header maker, linkedin cover image generator, linkedin profile banner, professional banner maker, business header creator, linkedin background image, career banner design',
  openGraph: {
    title: 'LinkedIn Banner Maker - AI-Powered Professional Design | CoverGen Pro',
    description: 'Create stunning LinkedIn profile banners that showcase your professional brand. Perfect dimensions and designs.',
    type: 'website',
  },
}

export default async function LinkedInBannerMakerPage({
  params,
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(params.locale)

  return (
    <ClientBoundary>
      <LinkedInBannerMakerClient locale={params.locale} translations={dict} />
    </ClientBoundary>
  )
}