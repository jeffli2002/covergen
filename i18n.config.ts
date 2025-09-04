export const locales = ['en', 'es', 'pt', 'zh', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español', 
  pt: 'Português',
  zh: '中文',
  ar: 'العربية'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇵🇹', 
  zh: '🇨🇳',
  ar: '🇸🇦'
}