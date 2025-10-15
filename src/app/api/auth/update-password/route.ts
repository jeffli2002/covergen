import { NextRequest, NextResponse } from 'next/server'
import { PaymentAuthWrapper } from '@/services/payment/auth-wrapper'
import bcrypt from 'bcryptjs'
import { bestAuthSubscriptionService } from '@/services/bestauth/BestAuthSubscriptionService'

export async function POST(request: NextRequest) {
  try {
    const authContext = await PaymentAuthWrapper.getAuthContext()
    
    if (!authContext.isAuthenticated || !authContext.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: 'newPassword is required' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    
    // Update password
    await bestAuthSubscriptionService.updatePassword(authContext.userId, passwordHash)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    })
  } catch (error) {
    console.error('[UpdatePassword] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update password' },
      { status: 500 }
    )
  }
}

