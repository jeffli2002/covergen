import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const { licenseKey } = await req.json()

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'Missing license key' },
        { status: 400 }
      )
    }

    // Validate license via Creem
    const result = await creemService.validateLicense(licenseKey)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid license' },
        { status: 401 }
      )
    }

    if (!result.valid) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'License is not valid' 
        },
        { status: 401 }
      )
    }

    // Return license details
    return NextResponse.json({
      valid: true,
      license: {
        id: result.license.id,
        status: result.license.status,
        customerId: result.license.customerId,
        productId: result.license.productId,
        metadata: result.license.metadata,
        expiresAt: result.license.expiresAt
      }
    })
  } catch (error: any) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate license' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-License-Key',
    },
  })
}