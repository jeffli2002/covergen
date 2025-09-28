# Open Graph Image Requirements

## Overview
The site needs a proper Open Graph (OG) image for optimal social media sharing. Currently using logo.png as a fallback, but a dedicated OG image is recommended.

## File Requirements
- **Filename**: `og-image.png`
- **Location**: `/public/og-image.png`
- **Format**: PNG (preferred) or JPG
- **Dimensions**: 1200 x 630 pixels (Facebook/LinkedIn recommended size)
- **File Size**: Under 8MB (ideally under 1MB for faster loading)

## Design Guidelines
1. **Brand Identity**
   - Include CoverGen Pro logo
   - Use brand colors (blue theme based on existing logo)
   - Professional, modern aesthetic

2. **Content to Include**
   - Main headline: "AI-Powered Cover & Thumbnail Generator"
   - Tagline: "Create stunning covers for YouTube, TikTok, Spotify & more"
   - Visual elements showing platform icons or example covers
   - Call-to-action: "Free • No Watermark • Instant Generation"

3. **Visual Best Practices**
   - High contrast for text readability
   - Clear focal point
   - Avoid text near edges (20px safe zone)
   - Test appearance at small sizes (social media thumbnails)

## Technical Notes
- The image will be served from `https://covergen.pro/og-image.png`
- Used by all social media platforms when sharing the homepage
- Currently configured in the metadata generation system
- Will automatically be used for Open Graph and Twitter Cards

## Testing
Once created, test the OG image using:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/