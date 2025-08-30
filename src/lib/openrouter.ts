import OpenAI from 'openai'

// Initialize OpenAI client with OpenRouter configuration
export const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
    'X-Title': 'CoverGen AI - AI Cover Generator',
  },
})

// Model configuration for Gemini 2.5 Flash Image Preview (nano banana)
export const GEMINI_MODEL = 'google/gemini-2.5-flash-image-preview:free' // Free version of Gemini 2.5 Flash Image

// NOTE: Gemini Flash via OpenRouter may not respect dimension parameters since it's a chat model
// that generates images, not a dedicated image generation API. Consider implementing server-side
// image resizing as a fallback to ensure platform-specific dimensions are applied.

export interface ImageGenerationParams {
  prompt: string
  referenceImages?: string[] // Base64 encoded images
  mode: 'image' | 'text'
  style?: string
  platform?: string
  dimensions?: { width: number; height: number }
}

export async function generateImage(params: ImageGenerationParams) {
  const { prompt, referenceImages, mode, dimensions } = params

  try {
    // Prepare messages based on mode
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []

    if (mode === 'image' && referenceImages?.length) {
      // Image-to-image mode - edit existing images
      const content: OpenAI.Chat.ChatCompletionContentPart[] = [
        {
          type: 'text',
          text: `Edit this image according to these instructions: ${prompt}`,
        },
      ]

      // Add reference images
      referenceImages.forEach((imageBase64) => {
        content.push({
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
          },
        })
      })

      messages.push({
        role: 'user',
        content,
      })
    } else {
      // Text-to-image mode - generate new images
      let finalPrompt = `Generate a high-quality image: ${prompt}`
      
      // Add dimensions if provided (skip for "none" platform to allow natural AI generation)
      if (dimensions && dimensions.width && dimensions.height) {
        finalPrompt += `. IMPORTANT: The image must be exactly ${dimensions.width}x${dimensions.height} pixels in size. Generate the image in ${dimensions.width} by ${dimensions.height} resolution.`
        
        // Add aspect ratio context
        const aspectRatio = (dimensions.width / dimensions.height).toFixed(2)
        if (aspectRatio === '1.78') {
          finalPrompt += ` This is a 16:9 widescreen format.`
        } else if (aspectRatio === '0.56') {
          finalPrompt += ` This is a 9:16 vertical mobile format.`
        } else if (aspectRatio === '1.00') {
          finalPrompt += ` This is a 1:1 square format.`
        } else {
          finalPrompt += ` This is a ${dimensions.width}:${dimensions.height} aspect ratio.`
        }
      }
      
      console.log('Final AI prompt:', finalPrompt)
      
      messages.push({
        role: 'user',
        content: finalPrompt,
      })
    }

    // Call OpenRouter API
    // Try to pass dimensions as additional parameters (may not be supported by chat models)
    const requestParams: any = {
      model: GEMINI_MODEL,
      messages,
    }
    
    // Add dimension parameters if available (experimental - may not work with chat models)
    if (dimensions && dimensions.width && dimensions.height) {
      requestParams.size = `${dimensions.width}x${dimensions.height}`
      requestParams.width = dimensions.width
      requestParams.height = dimensions.height
    }
    
    const response = await openai.chat.completions.create(requestParams)

    return response
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}