import { NextRequest, NextResponse } from 'next/server'
import { creemService } from '@/services/payment/creem'
import { createClient } from '@supabase/supabase-js'
import { Creem } from 'creem'

// Create service role Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Initialize Creem SDK
const creemClient = new Creem({
  serverIdx: process.env.NODE_ENV !== 'production' ? 1 : 0,
})

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    // Check if user has Pro+ subscription
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('tier', 'pro_plus')
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json(
        { error: 'Pro+ subscription required for API access' },
        { status: 403 }
      )
    }

    // Check if user already has an active license
    const { data: existingLicense } = await supabaseAdmin
      .from('api_licenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingLicense) {
      return NextResponse.json({
        success: true,
        licenseKey: existingLicense.license_key,
        message: 'Existing license key returned'
      })
    }

    // Activate a new license with Creem
    const result = await creemClient.activateLicense({
      xApiKey: process.env.CREEM_SECRET_KEY!,
      activateLicenseRequest: {
        customerId: subscription.stripe_customer_id,
        productId: process.env.CREEM_PROPLUS_PRODUCT_ID || 'prod_proplus',
        metadata: {
          userId: user.id,
          email: user.email,
          subscriptionId: subscription.stripe_subscription_id
        }
      }
    })

    // Store license in database
    const { error: insertError } = await supabaseAdmin
      .from('api_licenses')
      .insert({
        user_id: user.id,
        license_key: result.data.licenseKey,
        status: 'active',
        activated_at: new Date().toISOString(),
        metadata: {
          creemLicenseId: result.data.id,
          subscriptionId: subscription.stripe_subscription_id
        }
      })

    if (insertError) {
      console.error('Failed to store license:', insertError)
      // Try to deactivate the license
      await creemClient.deactivateLicense({
        licenseKey: result.data.licenseKey,
        xApiKey: process.env.CREEM_SECRET_KEY!,
      })
      throw new Error('Failed to store license key')
    }

    return NextResponse.json({
      success: true,
      licenseKey: result.data.licenseKey,
      message: 'License activated successfully'
    })
  } catch (error: any) {
    console.error('License activation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to activate license' },
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}