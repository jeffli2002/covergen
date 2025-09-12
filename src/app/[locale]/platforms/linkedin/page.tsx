import { Locale } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/get-dictionary'
import LinkedInGraphicsMakerClient from './page-client'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkedIn Banner & Post Image Maker - Professional Graphics',
  description: 'Create professional LinkedIn banners, post images, and article covers with AI. Boost your professional presence and engagement on LinkedIn.',
  keywords: [
    'LinkedIn banner maker',
    'LinkedIn post image generator',
    'LinkedIn article cover',
    'professional banner creator',
    'LinkedIn graphics generator',
    'LinkedIn profile banner',
    'business graphics maker',
    'LinkedIn carousel creator',
    'professional branding',
    'LinkedIn marketing tools'
  ],
  openGraph: {
    title: 'LinkedIn Graphics Maker - CoverGen AI',
    description: 'Create professional LinkedIn graphics that boost engagement. AI-powered banners, post images, and article covers.',
    images: ['/linkedin-graphics-maker-og.jpg'],
  },
  alternates: {
    canonical: 'https://covergen.pro/platforms/linkedin',
  },
}

export default async function LinkedInGraphicsMaker({
  params: { locale },
}: {
  params: { locale: Locale }
}) {
  const dict = await getDictionary(locale)

  return (
    <ClientBoundary>
      <LinkedInGraphicsMakerClient locale={locale} translations={dict} />
    </ClientBoundary>
  )
}