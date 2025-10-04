import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for temporary images (cleared on deployment)
// For production, use Redis or a proper temporary storage service
const tempImages = new Map<string, { data: string; contentType: string; timestamp: number }>()

// Clean up images older than 1 hour
function cleanupOldImages() {
  const oneHourAgo = Date.now() - 60 * 60 * 1000
  for (const [id, image] of tempImages.entries()) {
    if (image.timestamp < oneHourAgo) {
      tempImages.delete(id)
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    cleanupOldImages()
    
    const id = params.id
    const image = tempImages.get(id)
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found or expired' },
        { status: 404 }
      )
    }
    
    // Convert base64 to buffer
    const base64Data = image.data.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': image.contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('[Temp Image] Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}

// Store image temporarily
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, contentType } = await request.json()
    
    if (!data || !contentType) {
      return NextResponse.json(
        { error: 'Missing data or contentType' },
        { status: 400 }
      )
    }
    
    cleanupOldImages()
    
    const id = params.id
    tempImages.set(id, {
      data,
      contentType,
      timestamp: Date.now()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Temp Image] Error storing image:', error)
    return NextResponse.json(
      { error: 'Failed to store image' },
      { status: 500 }
    )
  }
}
