import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test Jeff's subscription directly
    const jeffEmail = 'jefflee2002@gmail.com'
    
    // Get Jeff's user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', jeffEmail)
      .single()
    
    if (userError) {
      // Try auth.users table
      const { data: authUsers } = await supabase.auth.admin.listUsers()
      const jeff = authUsers?.users?.find(u => u.email === jeffEmail)
      
      if (!jeff) {
        return NextResponse.json({ error: 'Jeff not found' })
      }
      
      const userId = jeff.id
      
      // Check subscription
      const { data: sub } = await supabase
        .from('subscriptions_consolidated')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      // Check generation limit
      const { data: limitCheck } = await supabase
        .rpc('check_generation_limit', { p_user_id: userId })
      
      return NextResponse.json({
        user: { id: userId, email: jeffEmail },
        subscription: sub,
        limitCheck: limitCheck,
        message: 'Jeff should be Pro trial'
      })
    }
    
    return NextResponse.json({ userData })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}