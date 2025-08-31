import { headers } from 'next/headers'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://covergen.ai'

export function getCanonicalUrl(path: string = ''): string {
  // Remove trailing slash from path
  const cleanPath = path.replace(/\/$/, '')
  
  // Ensure path starts with /
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  
  // Remove duplicate slashes
  const finalPath = normalizedPath.replace(/\/+/g, '/')
  
  return `${BASE_URL}${finalPath}`
}

export function getCurrentUrl(): string {
  const headersList = headers()
  const host = headersList.get('host') || 'covergen.ai'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const pathname = headersList.get('x-pathname') || '/'
  
  return `${protocol}://${host}${pathname}`
}

export function generateAlternateUrls(path: string, locales: string[]): Record<string, string> {
  const alternates: Record<string, string> = {}
  
  locales.forEach((locale) => {
    const localeCode = locale === 'zh' ? 'zh-CN' : locale === 'pt' ? 'pt-BR' : locale
    alternates[localeCode] = getCanonicalUrl(`/${locale}${path}`)
  })
  
  return alternates
}

// Utility to handle duplicate content issues
export function getCanonicalParams(searchParams: Record<string, string | string[] | undefined>): string {
  // Define parameters that should be included in canonical URLs
  const canonicalParams = ['page', 'category', 'platform']
  
  const params = new URLSearchParams()
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (canonicalParams.includes(key) && value) {
      params.append(key, Array.isArray(value) ? value[0] : value)
    }
  })
  
  const paramString = params.toString()
  return paramString ? `?${paramString}` : ''
}