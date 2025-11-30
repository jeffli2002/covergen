import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';

    // Calculate date range
    let startDate: Date | null = null;
    if (range === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    } else if (range !== 'all') {
      startDate = new Date();
      const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      startDate.setDate(startDate.getDate() - daysAgo);
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get total users count
    const { count: totalUsersCount, error: usersError } = await client
      .from('bestauth_users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get subscriptions grouped by tier
    const { data: subscriptions, error: subsError } = await client
      .from('bestauth_subscriptions')
      .select('tier, status');

    if (subsError) throw subsError;

    // Calculate plan counts
    const planCountsMap: Record<'free' | 'pro' | 'proplus', number> = {
      free: 0,
      pro: 0,
      proplus: 0,
    };

    const paidUserSet = new Set<string>();
    (subscriptions || []).forEach((sub: any) => {
      if (sub.tier === 'pro' || sub.tier === 'pro_plus') {
        paidUserSet.add(sub.tier);
        const planName = sub.tier === 'pro_plus' ? 'proplus' : 'pro';
        planCountsMap[planName] = (planCountsMap[planName] || 0) + 1;
      }
    });

    // Free users = total users - users with paid subscriptions
    const totalPaidUsers = Object.values(planCountsMap).reduce((sum, count) => sum + count, 0);
    planCountsMap.free = (totalUsersCount || 0) - totalPaidUsers;

    // Get status counts
    const statusCountsMap: Record<'active' | 'canceled' | 'expired' | 'trial', number> = {
      active: 0,
      canceled: 0,
      expired: 0,
      trial: 0,
    };

    (subscriptions || []).forEach((sub: any) => {
      const status = sub.status;
      if (status === 'active') statusCountsMap.active++;
      else if (status === 'cancelled' || status === 'canceled') statusCountsMap.canceled++;
      else if (status === 'expired') statusCountsMap.expired++;
      else if (status === 'trialing') statusCountsMap.trial++;
    });

    // Get recent subscriptions with user info
    let recentSubsQuery = client
      .from('bestauth_subscriptions')
      .select(`
        id,
        user_id,
        tier,
        status,
        current_period_start,
        current_period_end,
        created_at,
        bestauth_users!inner (
          email,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (startDate) {
      recentSubsQuery = recentSubsQuery.gte('created_at', startDate.toISOString());
    }

    const { data: recentSubsData, error: recentError } = await recentSubsQuery;

    if (recentError) throw recentError;

    const recentSubscriptions = (recentSubsData || []).map((sub: any) => {
      const user = Array.isArray(sub.bestauth_users) ? sub.bestauth_users[0] : sub.bestauth_users;
      return {
        id: sub.id,
        userId: sub.user_id,
        userEmail: user?.email || 'Unknown',
        plan: sub.tier,
        status: sub.status,
        startDate: sub.current_period_start,
        endDate: sub.current_period_end,
        amount: 0, // TODO: Calculate based on plan
      };
    });

    const response = NextResponse.json({
      planCounts: planCountsMap,
      statusCounts: statusCountsMap,
      recentSubscriptions: recentSubscriptions || [],
      creditPackPurchases: [], // TODO: Implement credit pack purchases query
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin subscriptions stats error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch subscriptions stats' }, { status: 500 });
  }
}
