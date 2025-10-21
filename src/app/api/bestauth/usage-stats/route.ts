import { NextRequest, NextResponse } from 'next/server'
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client'
import { getAuthenticatedUser } from '@/app/api/middleware/withAuth'
import { SUBSCRIPTION_CONFIG } from '@/config/subscription'

/**
 * GET /api/bestauth/usage-stats
 * Get usage statistics for current month
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = getBestAuthSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      )
    }

    // Get start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch transactions for this month
    const { data: transactions, error } = await supabase
      .from('bestauth_points_transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Usage Stats API] Error fetching transactions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch usage statistics' },
        { status: 500 }
      )
    }

    // Calculate statistics
    let creditsEarned = 0
    let creditsSpent = 0
    let imagesGenerated = 0
    let videosGenerated = 0
    let sora2Videos = 0
    let sora2ProVideos = 0
    let nanoBananaImages = 0

    for (const tx of transactions || []) {
      if (tx.amount > 0) {
        creditsEarned += tx.amount
      } else {
        creditsSpent += Math.abs(tx.amount)
      }

      // Count generations by type
      if (tx.transaction_type === 'generation_deduction') {
        switch (tx.generation_type) {
          case 'nanoBananaImage':
            imagesGenerated++
            nanoBananaImages++
            break
          case 'sora2Video':
            videosGenerated++
            sora2Videos++
            break
          case 'sora2ProVideo':
            videosGenerated++
            sora2ProVideos++
            break
        }
      }
    }

    // Get breakdown by credit cost
    const imageCreditCost = SUBSCRIPTION_CONFIG.generationCosts.nanoBananaImage
    const sora2Cost = SUBSCRIPTION_CONFIG.generationCosts.sora2Video
    const sora2ProCost = SUBSCRIPTION_CONFIG.generationCosts.sora2ProVideo

    return NextResponse.json({
      period: {
        start: startOfMonth.toISOString(),
        end: now.toISOString(),
        month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      },
      credits: {
        earned: creditsEarned,
        spent: creditsSpent,
        net: creditsEarned - creditsSpent
      },
      generations: {
        images: {
          total: imagesGenerated,
          nanoBanana: nanoBananaImages,
          creditsPerImage: imageCreditCost,
          totalCredits: nanoBananaImages * imageCreditCost
        },
        videos: {
          total: videosGenerated,
          sora2: sora2Videos,
          sora2Pro: sora2ProVideos,
          sora2Credits: sora2Videos * sora2Cost,
          sora2ProCredits: sora2ProVideos * sora2ProCost,
          totalCredits: (sora2Videos * sora2Cost) + (sora2ProVideos * sora2ProCost)
        }
      },
      transactionCount: transactions?.length || 0
    })
  } catch (error) {
    console.error('[Usage Stats API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
