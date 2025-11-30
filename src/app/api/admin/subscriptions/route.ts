import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get plan stats
    const { data: subscriptions, error: subsError } = await client
      .from('bestauth_subscriptions')
      .select('tier, status, created_at');

    if (subsError) throw subsError;

    const planStatsMap = new Map<string, { count: number; active_count: number }>();
    (subscriptions || []).forEach((sub: any) => {
      const plan = sub.tier || 'free';
      const stats = planStatsMap.get(plan) || { count: 0, active_count: 0 };
      stats.count++;
      if (sub.status === 'active') {
        stats.active_count++;
      }
      planStatsMap.set(plan, stats);
    });

    const planStats = Array.from(planStatsMap.entries()).map(([plan, stats]) => ({
      plan,
      count: stats.count,
      active_count: stats.active_count,
    }));

    // Get recent subscriptions with user info
    const { data: recentSubs, error: recentError } = await client
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
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (recentError) throw recentError;

    const recentSubscriptions = (recentSubs || []).map((sub: any) => {
      const user = Array.isArray(sub.bestauth_users) ? sub.bestauth_users[0] : sub.bestauth_users;
      return {
        id: sub.id,
        userId: sub.user_id,
        userEmail: user?.email,
        userName: user?.name,
        plan: sub.tier,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        createdAt: sub.created_at,
      };
    });

    // Get subscription trend (grouped by date and plan)
    const { data: trendData, error: trendError } = await client
      .from('bestauth_subscriptions')
      .select('created_at, tier')
      .gte('created_at', startDate.toISOString());

    if (trendError) throw trendError;

    const trendMap = new Map<string, Map<string, number>>();
    (trendData || []).forEach((sub: any) => {
      const date = new Date(sub.created_at).toISOString().split('T')[0];
      const plan = sub.tier || 'free';
      const dateMap = trendMap.get(date) || new Map();
      dateMap.set(plan, (dateMap.get(plan) || 0) + 1);
      trendMap.set(date, dateMap);
    });

    const trend = Array.from(trendMap.entries())
      .map(([date, planMap]) => {
        return Array.from(planMap.entries()).map(([plan, count]) => ({
          date,
          count,
          plan,
        }));
      })
      .flat()
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      planStats,
      recentSubscriptions,
      trend,
    });
  } catch (error: unknown) {
    console.error('Admin subscriptions error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
}
