# Canonical Tag Implementation Guide

## Overview
This document outlines the canonical tag implementation for the CoverGen Pro Next.js application, ensuring proper SEO handling across all pages.

## Implementation Details

### 1. Centralized Canonical URL Generation (`/src/lib/seo/canonical.ts`)

The core canonical URL generation system provides:

- **Locale-aware URL generation**: Automatically handles locale prefixes (except for default 'en')
- **Query parameter filtering**: Only includes SEO-relevant parameters (page, category, platform, sort, filter)
- **Alternate URL generation**: Creates hreflang alternates for all supported locales
- **NoIndex detection**: Automatically identifies pages that shouldn't be indexed

Key functions:
```typescript
// Generate canonical URL with locale support
getCanonicalUrl(path: string, locale: Locale, includeParams?: ...)

// Generate alternates for all locales
generateAlternateUrls(path: string, currentLocale: Locale, includeParams?: ...)

// Check if page should be noindex
shouldNoIndex(path: string): boolean
```

### 2. Enhanced Metadata System (`/src/lib/seo/metadata.ts`)

The metadata system provides:

- **Centralized metadata generation**: `generateMetadata()` for all pages
- **Platform-specific metadata**: `generatePlatformMetadata()` for platform pages
- **Tool-specific metadata**: `generateToolMetadata()` for tool pages
- **Blog metadata**: `generateBlogMetadata()` for blog posts

Features:
- Automatic canonical URL generation
- Proper hreflang alternate links
- NoIndex handling based on URL patterns
- Consistent OpenGraph and Twitter meta tags

### 3. Page Implementation Pattern

All pages should use the async `generateMetadata` function:

```typescript
export async function generateMetadata({
  params: { locale },
  searchParams,
}: {
  params: { locale: Locale }
  searchParams: Record<string, string | string[] | undefined>
}): Promise<Metadata> {
  // For platform pages
  return generatePlatformMetadata('youtube', locale, searchParams)
  
  // For tool pages
  return generateToolMetadata('spotify-playlist-cover', locale, searchParams)
  
  // For custom pages
  return generateMetadata({
    title: 'Page Title',
    description: 'Page description',
    keywords: ['keyword1', 'keyword2'],
    path: '/page-path',
    locale,
    searchParams,
  })
}
```

## Canonical URL Structure

### URL Format
- English (default): `https://covergen.pro/path`
- Other locales: `https://covergen.pro/{locale}/path`

### Examples
- Homepage: 
  - EN: `https://covergen.pro`
  - ES: `https://covergen.pro/es`
- Platform page:
  - EN: `https://covergen.pro/platforms/youtube`
  - ZH: `https://covergen.pro/zh/platforms/youtube`
- Tool page:
  - EN: `https://covergen.pro/tools/spotify-playlist-cover`
  - PT: `https://covergen.pro/pt/tools/spotify-playlist-cover`

## Hreflang Implementation

All pages automatically generate hreflang alternates:

```html
<link rel="alternate" hreflang="en" href="https://covergen.pro/platforms/youtube" />
<link rel="alternate" hreflang="es" href="https://covergen.pro/es/platforms/youtube" />
<link rel="alternate" hreflang="zh-CN" href="https://covergen.pro/zh/platforms/youtube" />
<link rel="alternate" hreflang="pt-BR" href="https://covergen.pro/pt/platforms/youtube" />
<link rel="alternate" hreflang="ar-SA" href="https://covergen.pro/ar/platforms/youtube" />
<link rel="alternate" hreflang="x-default" href="https://covergen.pro/platforms/youtube" />
```

## Query Parameter Handling

### Canonical Parameters (included)
- `page` - Pagination
- `category` - Content filtering
- `platform` - Platform filtering
- `sort` - Sort order
- `filter` - General filters

### Excluded Parameters (tracking/sessions)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `ref`, `fbclid`, `gclid`
- Any other tracking parameters

## NoIndex Patterns

Pages automatically set as noindex:
- `/auth/*` - Authentication pages
- `/api/*` - API routes
- `/test*` - Test pages
- `/debug*` - Debug pages
- `/oauth*` - OAuth pages
- `*/success` - Success pages
- `*/cancel` - Cancel pages
- `*/callback` - Callback pages
- `*/error` - Error pages

## Migration Checklist

✅ **Completed:**
1. Created centralized canonical URL utility
2. Enhanced metadata generation system
3. Updated platform pages (YouTube, TikTok, Instagram, Spotify, etc.)
4. Updated tool pages (Spotify Playlist Cover, etc.)
5. Updated key pages (Pricing)

⏳ **Remaining:**
- Update remaining tool pages
- Update support pages (Terms, Privacy, etc.)
- Add structured data for rich snippets
- Implement dynamic sitemap with canonical URLs

## Best Practices

1. **Always use the centralized system**: Don't hardcode canonical URLs
2. **Include searchParams**: Pass searchParams to generateMetadata for proper parameter handling
3. **Use appropriate generator**: Use platform/tool-specific generators when available
4. **Test locale handling**: Verify canonical URLs work for all supported locales
5. **Monitor Search Console**: Check for duplicate content issues

## Testing

To verify canonical implementation:

1. Check page source for canonical tag: `<link rel="canonical" href="...">`
2. Verify hreflang tags are present
3. Test with different locales
4. Check query parameter handling
5. Use Google's URL Inspection tool

## Common Issues and Solutions

### Issue: Duplicate content warnings
**Solution**: Ensure all variations of a page have the same canonical URL

### Issue: Wrong locale in canonical
**Solution**: Use the centralized system which handles locale automatically

### Issue: Query parameters causing duplicates
**Solution**: Only include SEO-relevant parameters in canonical URLs

### Issue: Missing hreflang tags
**Solution**: Use generateAlternateUrls() which creates all necessary alternates