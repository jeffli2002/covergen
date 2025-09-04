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

// Model configuration for image generation
// Using the Gemini 2.5 Flash Image Preview model (without :free suffix)
export const GEMINI_MODEL = 'google/gemini-2.5-flash-image-preview' // Gemini image generation model

// Note: OpenRouter has removed the free tier (:free) for this model
// Make sure your API key has credits to use this model

// Alternative image generation models available on OpenRouter:
// - 'stabilityai/stable-diffusion-xl-base-1.0' - Stable Diffusion XL
// - 'prompthero/openjourney' - Free Midjourney-style model
// - 'kakaobrain/karlo-v1-alpha' - Free image generation model
// - 'lambdalabs/sd-image-variations-diffusers' - Image variations model

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
    // For Gemini 2.5 Flash Image Preview, we need to format the request correctly
    // This model expects image generation prompts in a specific format
    console.log('Generating with model:', GEMINI_MODEL)
    
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
      // For Gemini image model, be more direct with the prompt
      let finalPrompt = `${prompt}`
      
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

    // Call OpenRouter API for image generation
    const requestParams: any = {
      model: GEMINI_MODEL,
      messages,
      // Remove unsupported parameters that might cause issues
      // The Gemini model handles image generation internally
    }
    
    // Add dimension parameters if available
    if (dimensions && dimensions.width && dimensions.height) {
      requestParams.size = `${dimensions.width}x${dimensions.height}`
      requestParams.width = dimensions.width
      requestParams.height = dimensions.height
      // Also try OpenAI-style size parameter
      if (dimensions.width === 1024 && dimensions.height === 1024) {
        requestParams.size = "1024x1024"
      } else if (dimensions.width === 1792 && dimensions.height === 1024) {
        requestParams.size = "1792x1024"
      } else if (dimensions.width === 1024 && dimensions.height === 1792) {
        requestParams.size = "1024x1792"
      }
    }
    
    console.log('Sending request to OpenRouter with params:', {
      model: requestParams.model,
      hasMessages: !!requestParams.messages,
      size: requestParams.size,
      n: requestParams.n
    })
    
    const response = await openai.chat.completions.create(requestParams)

    return response
  } catch (error) {
    console.error('Error generating image:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        cause: (error as any).cause,
        response: (error as any).response?.data,
        status: (error as any).response?.status,
        headers: (error as any).response?.headers,
      })
      
      // Check if it's an OpenAI API error
      if ((error as any).response?.status === 404) {
        throw new Error(`Model '${GEMINI_MODEL}' not found. This might be an incorrect model ID. Please check OpenRouter documentation for available models.`)
      } else if ((error as any).response?.status === 422) {
        throw new Error('Invalid request format. The Gemini image model might require different parameters.')
      } else if ((error as any).response?.status === 429) {
        throw new Error('Rate limit exceeded. The free tier has usage limits. Please try again later.')
      } else if ((error as any).response?.status === 401) {
        throw new Error('API authentication failed. Please check your OpenRouter API key.')
      } else if ((error as any).response?.status === 400) {
        throw new Error('Invalid request. The model might not support image generation with this format.')
      }
    }
    
    throw error
  }
}