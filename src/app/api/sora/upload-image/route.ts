import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Convert to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Upload to imgbb (free image hosting)
    const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '3e3e77bd5f717c60d470c01d0dd2e402' // Free public API key
    
    try {
      const formData = new FormData()
      formData.append('image', base64)
      
      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      const imgbbData = await imgbbResponse.json()
      
      if (imgbbData.success && imgbbData.data?.url) {
        console.log('[Upload Image] Successfully uploaded to imgbb:', imgbbData.data.url)
        return NextResponse.json({ 
          imageUrl: imgbbData.data.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        })
      }
      
      console.error('[Upload Image] imgbb upload failed:', imgbbData)
    } catch (imgbbError) {
      console.error('[Upload Image] imgbb error:', imgbbError)
    }
    
    // Fallback: use temporary storage
    const dataUrl = `data:${file.type};base64,${base64}`
    const imageId = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    const storeResponse = await fetch(
      `${request.nextUrl.origin}/api/sora/temp-image/${imageId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: dataUrl,
          contentType: file.type
        })
      }
    )
    
    if (!storeResponse.ok) {
      console.error('[Upload Image] Failed to store image temporarily')
      return NextResponse.json({ 
        imageUrl: dataUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })
    }
    
    const publicUrl = `${request.nextUrl.origin}/api/sora/temp-image/${imageId}`
    
    return NextResponse.json({ 
      imageUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
