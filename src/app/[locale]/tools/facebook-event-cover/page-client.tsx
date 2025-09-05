'use client'

import { Locale } from '@/lib/i18n/config'
import FacebookEventCoverTool from '@/components/tools/FacebookEventCoverTool'

interface FacebookEventCoverClientProps {
  locale: Locale
  translations: any
}

export default function FacebookEventCoverClient({ locale, translations: t }: FacebookEventCoverClientProps) {
  return <FacebookEventCoverTool />
}