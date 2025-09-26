import { headers } from 'next/headers'
import { i18n, type Locale } from '@/lib/i18n/config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://covergen.pro'

/**
 * Generate a canonical URL for a given path and locale
 * @param path - The path without locale prefix (e.g., '/platforms/youtube')
 * @param locale - The locale code (e.g., 'en', 'es', 'zh')
 * @param includeParams - Optional query parameters to include
 */
export function getCanonicalUrl(
  path: string = '', 
  locale: Locale = 'en',
  includeParams?: string | Record<string, string | string[] | undefined>
): string {
  // Remove any existing locale prefix from path
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, '/')
  
  // Clean the path
  const cleanPath = pathWithoutLocale
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\/+/g, '/') // Remove duplicate slashes
  
  // Ensure path starts with /
  const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`
  
  // Build the full URL with locale (except for default 'en')
  const localePrefix = locale === 'en' ? '' : `/${locale}`
  const fullPath = `${localePrefix}${normalizedPath}`
  
  // Handle query parameters if provided
  let queryString = ''
  if (includeParams) {
    if (typeof includeParams === 'string') {
      queryString = includeParams.startsWith('?') ? includeParams : `?${includeParams}`
    } else {
      queryString = getCanonicalParams(includeParams)
    }
  }
  
  return `${BASE_URL}${fullPath}${queryString}`
}

/**
 * Get the current request URL from headers
 */
export function getCurrentUrl(): string {
  const headersList = headers()
  const host = headersList.get('host') || 'covergen.pro'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const pathname = headersList.get('x-pathname') || '/'
  
  return `${protocol}://${host}${pathname}`
}

/**
 * Generate alternate URLs for all supported locales
 * @param path - The path without locale prefix
 * @param currentLocale - The current locale to set as canonical
 * @param includeParams - Optional query parameters to include
 */
export function generateAlternateUrls(
  path: string,
  currentLocale: Locale = 'en',
  includeParams?: string | Record<string, string | string[] | undefined>
): {
  canonical: string
  languages: Record<string, string>
} {
  const languages: Record<string, string> = {}
  
  // Remove any existing locale prefix from path
  const pathWithoutLocale = path.replace(/^\/[a-z]{2}(-[A-Z]{2})?\//, '/')
  
  // Generate URLs for all locales
  i18n.locales.forEach((locale) => {
    const localeCode = locale.code
    const url = getCanonicalUrl(pathWithoutLocale, localeCode as Locale, includeParams)
    
    // Use full locale codes for alternates (e.g., 'zh-CN' instead of 'zh')
    const alternateKey = localeCode === 'zh' ? 'zh-CN' : 
                        localeCode === 'pt' ? 'pt-BR' : 
                        localeCode === 'ar' ? 'ar-SA' :
                        localeCode
    
    languages[alternateKey] = url.replace(BASE_URL, '') // Return relative URLs for alternates
  })
  
  // Set x-default to English version
  languages['x-default'] = getCanonicalUrl(pathWithoutLocale, 'en', includeParams).replace(BASE_URL, '')
  
  return {
    canonical: getCanonicalUrl(pathWithoutLocale, currentLocale, includeParams),
    languages
  }
}

/**
 * Filter and build canonical query parameters
 * Only includes parameters that should be part of the canonical URL
 */
export function getCanonicalParams(
  searchParams: Record<string, string | string[] | undefined>
): string {
  // Define parameters that should be included in canonical URLs
  // These are parameters that represent different content
  const canonicalParams = ['page', 'category', 'platform', 'sort', 'filter']
  
  // Parameters to always exclude from canonical URLs
  const excludeParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid', 'gclid']
  
  const params = new URLSearchParams()
  
  Object.entries(searchParams).forEach(([key, value]) => {
    // Skip if excluded or not in canonical params
    if (excludeParams.includes(key) || !canonicalParams.includes(key)) {
      return
    }
    
    if (value) {
      const stringValue = Array.isArray(value) ? value[0] : value
      if (stringValue) {
        params.append(key, stringValue)
      }
    }
  })
  
  // Sort parameters for consistency
  params.sort()
  
  const paramString = params.toString()
  return paramString ? `?${paramString}` : ''
}

/**
 * Helper to check if a path should be noindex
 * @param path - The path to check
 */
export function shouldNoIndex(path: string): boolean {
  const noIndexPatterns = [
    /^\/auth\//,
    /^\/api\//,
    /^\/test/,
    /^\/debug/,
    /^\/oauth/,
    /\/success$/,
    /\/cancel$/,
    /\/callback/,
    /\/error$/
  ]
  
  return noIndexPatterns.some(pattern => pattern.test(path))
}