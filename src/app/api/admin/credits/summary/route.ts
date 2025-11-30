import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

function getTimezoneAwareStartDate(range: string, tzOffsetMinutes: number): Date {
  const offsetMs = tzOffsetMinutes * 60 * 1000;
  const now = Date.now();
  const localNow = new Date(now - offsetMs);
  localNow.setUTCHours(0, 0, 0, 0);

  if (range !== 'today') {
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    localNow.setUTCDate(localNow.getUTCDate() - daysAgo);
  }

  return new Date(localNow.getTime() + offsetMs);
}

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';
    const tzOffsetInput = Number.parseInt(searchParams.get('tzOffset') || '0', 10);
    const tzOffsetMinutes = Number.isFinite(tzOffsetInput) ? tzOffsetInput : 0;
    const startDate = getTimezoneAwareStartDate(range, tzOffsetMinutes);

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Credits summary derived from actual spend transactions
    // Get all spend transactions (negative amounts) from bestauth_points_transactions
    const { data: spendTransactions, error: spendError } = await client
      .from('bestauth_points_transactions')
      .select('amount, generation_type, metadata, description, created_at')
      .lt('amount', 0) // Negative amounts are spends
      .gte('created_at', startDate.toISOString());

    if (spendError) throw spendError;

    // Calculate summary stats
    let totalCredits = 0;
    let imageCredits = 0;
    let videoCredits = 0;

    (spendTransactions || []).forEach((tx: any) => {
      const amount = Math.abs(tx.amount);
      totalCredits += amount;
      
      // Use generation_type field (most reliable)
      const genType = tx.generation_type || '';
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      
      // Check generation_type first, then fallback to description/metadata
      if (genType === 'nanoBananaImage' || 
          meta.feature === 'image-generation' || 
          desc.includes('Image generation') || 
          desc.includes('nanoBanana')) {
        imageCredits += amount;
      } else if (genType === 'sora2Video' || 
                 genType === 'sora2ProVideo' ||
                 meta.feature === 'video-generation' || 
                 desc.includes('Video generation') || 
                 desc.includes('Sora')) {
        videoCredits += amount;
      }
    });

    // Get top 10 users by credit consumption
    const { data: allSpendTx, error: allSpendError } = await client
      .from('bestauth_points_transactions')
      .select(`
        user_id,
        amount,
        generation_type,
        metadata,
        description,
        bestauth_users!inner (
          id,
          email,
          name
        ),
        bestauth_subscriptions!left (
          points_balance
        )
      `)
      .lt('amount', 0)
      .gte('created_at', startDate.toISOString());

    if (allSpendError) throw allSpendError;

    // Group by user and calculate totals
    const userSpendMap = new Map<string, {
      user: any;
      total_consumed: number;
      image_credits: number;
      video_credits: number;
      remaining: number;
    }>();

    (allSpendTx || []).forEach((tx: any) => {
      const userId = tx.user_id;
      const amount = Math.abs(tx.amount);
      const user = Array.isArray(tx.bestauth_users) ? tx.bestauth_users[0] : tx.bestauth_users;
      const subscription = Array.isArray(tx.bestauth_subscriptions) 
        ? tx.bestauth_subscriptions[0] 
        : tx.bestauth_subscriptions;

      if (!userSpendMap.has(userId)) {
        userSpendMap.set(userId, {
          user,
          total_consumed: 0,
          image_credits: 0,
          video_credits: 0,
          remaining: subscription?.points_balance || 0,
        });
      }

      const stats = userSpendMap.get(userId)!;
      stats.total_consumed += amount;

      // Use generation_type field (most reliable)
      const genType = tx.generation_type || '';
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      
      // Check generation_type first, then fallback to description/metadata
      if (genType === 'nanoBananaImage' || 
          meta.feature === 'image-generation' || 
          desc.includes('Image generation') || 
          desc.includes('nanoBanana')) {
        stats.image_credits += amount;
      } else if (genType === 'sora2Video' || 
                 genType === 'sora2ProVideo' ||
                 meta.feature === 'video-generation' || 
                 desc.includes('Video generation') || 
                 desc.includes('Sora')) {
        stats.video_credits += amount;
      }
    });

    const top10Users = Array.from(userSpendMap.values())
      .filter(u => u.total_consumed > 0)
      .sort((a, b) => b.total_consumed - a.total_consumed)
      .slice(0, 10)
      .map(u => ({
        id: u.user.id,
        email: u.user.email,
        name: u.user.name,
        total_consumed: u.total_consumed,
        image_credits: u.image_credits,
        video_credits: u.video_credits,
        remaining: u.remaining,
      }));

    // For generation counts, we'll use transaction counts as proxy
    // (since we don't have a generatedAsset table)
    const imageGenerations = (spendTransactions || []).filter((tx: any) => {
      const genType = tx.generation_type || '';
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      return genType === 'nanoBananaImage' || 
             meta.feature === 'image-generation' || 
             desc.includes('Image generation') || 
             desc.includes('nanoBanana');
    }).length;

    const videoGenerations = (spendTransactions || []).filter((tx: any) => {
      const genType = tx.generation_type || '';
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      return genType === 'sora2Video' || 
             genType === 'sora2ProVideo' ||
             meta.feature === 'video-generation' || 
             desc.includes('Video generation') || 
             desc.includes('Sora');
    }).length;

    // Get daily generation trend based on transactions
    const dailyTrendMap = new Map<string, { imageCount: number; videoCount: number }>();
    
    (spendTransactions || []).forEach((tx: any) => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      const trend = dailyTrendMap.get(date) || { imageCount: 0, videoCount: 0 };
      
      const genType = tx.generation_type || '';
      const meta = tx.metadata || {};
      const desc = tx.description || '';
      
      // Check generation_type first, then fallback to description/metadata
      if (genType === 'nanoBananaImage' || 
          meta.feature === 'image-generation' || 
          desc.includes('Image generation') || 
          desc.includes('nanoBanana')) {
        trend.imageCount++;
      } else if (genType === 'sora2Video' || 
                 genType === 'sora2ProVideo' ||
                 meta.feature === 'video-generation' || 
                 desc.includes('Video generation') || 
                 desc.includes('Sora')) {
        trend.videoCount++;
      }
      
      dailyTrendMap.set(date, trend);
    });

    const generationTrend = Array.from(dailyTrendMap.entries())
      .map(([date, counts]) => ({
        date,
        imageCount: counts.imageCount,
        videoCount: counts.videoCount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const response = NextResponse.json({
      summary: {
        totalConsumed: totalCredits,
        imageCredits,
        videoCredits,
        imageGenerations,
        videoGenerations,
      },
      top10Users,
      trend: generationTrend,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin credits summary error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch credits summary' }, { status: 500 });
  }
}
