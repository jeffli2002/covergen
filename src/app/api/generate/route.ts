import { NextRequest, NextResponse } from 'next/server'
import { generateImage, GEMINI_MODEL } from '@/lib/openrouter'

// Image generation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, referenceImages, mode, style, platform, dimensions } = body

    // Log the received parameters for debugging
    console.log('API Generate called with:', {
      prompt: prompt?.substring(0, 50) + '...',
      mode,
      style,
      platform,
      dimensions
    })

    // Validate required fields
    if (!prompt || !mode) {
      return NextResponse.json(
        { error: 'Prompt and mode are required' },
        { status: 400 }
      )
    }

    if (mode === 'image' && (!referenceImages || referenceImages.length === 0)) {
      return NextResponse.json(
        { error: 'Reference images are required for image-to-image mode' },
        { status: 400 }
      )
    }

    // Generate image using OpenRouter with Gemini 2.5 Flash
    const result = await generateImage({
      prompt,
      referenceImages,
      mode,
      style,
      platform,
      dimensions,
    })

    // Extract image data from Gemini's response
    const message = result.choices[0]?.message as any
    console.log('Full Gemini response:', JSON.stringify(result, null, 2))
    
    // Parse the response to extract generated images
    let generatedImages: string[] = []
    
    // Check if images are in the message.images array (Gemini's format)
    if (message?.images && Array.isArray(message.images)) {
      generatedImages = message.images.map((img: any) => {
        if (img.type === 'image_url' && img.image_url?.url) {
          return img.image_url.url
        } else if (img.type === 'base64' && img.base64) {
          return `data:image/png;base64,${img.base64}`
        }
        return null
      }).filter(Boolean)
      
      console.log('Extracted images from message.images:', generatedImages)
    }
    
    // Fallback: check content field
    if (generatedImages.length === 0 && message?.content) {
      const responseContent = message.content
      console.log('Response content:', responseContent)
      
      // Try to parse if it's JSON with image data
      try {
        const parsed = JSON.parse(responseContent)
        if (parsed.images) {
          generatedImages = parsed.images
        } else if (parsed.image) {
          generatedImages = [parsed.image]
        }
      } catch {
        // If not JSON, check if it's a direct base64 string or URL
        if (typeof responseContent === 'string' && (responseContent.startsWith('data:image') || responseContent.startsWith('http'))) {
          generatedImages = [responseContent]
        }
      }
    }
    
    
    // If no images were extracted, generate placeholder data URLs for testing
    if (generatedImages.length === 0) {
      // Use platform dimensions or default to 1920x1080 for placeholders
      // For "none" platform, use a reasonable default placeholder size
      const width = dimensions?.width || 1920
      const height = dimensions?.height || 1080
      
      console.log(`Generating placeholder images with dimensions: ${width}x${height} for platform: ${platform}`)
      
      // Generate simple colored placeholder images as data URLs with correct dimensions
      // NO TEXT - just clean background gradients
      const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#2C3E50'  // Dark
      ]
      
      generatedImages = colors.map((color) => {
        const canvas = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="50%" style="stop-color:${color};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${color};stop-opacity:0.6" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)"/>
        </svg>`
        const base64 = Buffer.from(canvas).toString('base64')
        return `data:image/svg+xml;base64,${base64}`
      })
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      metadata: {
        model: GEMINI_MODEL,
        prompt,
        mode,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Generation error:', error)
    
    // Provide more detailed error information
    let errorMessage = 'Failed to generate images'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      // Check for rate limit errors
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.'
      } else if (error.message.includes('API key') || error.message.includes('401')) {
        errorMessage = 'API authentication failed. Please check your API key.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Image generation timed out. Please try again.'
      }
      
      // Log full error details
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        cause: (error as any).cause,
        response: (error as any).response,
      })
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    )
  }
}