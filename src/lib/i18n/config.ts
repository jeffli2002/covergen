export const i18n = {
  defaultLocale: 'en',
  locales: [
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ],
} as const

export type Locale = (typeof i18n.locales)[number]['code']

export function getLocaleInfo(locale: string) {
  return i18n.locales.find(l => l.code === locale) || i18n.locales[0]
}