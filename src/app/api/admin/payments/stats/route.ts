import { requireAdmin } from '@/lib/admin/auth';
import { getPlanPriceByPriceId } from '@/lib/admin/revenue-utils';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get subscription payments from bestauth_points_transactions
    // Note: This project uses points_transactions for tracking purchases
    const { data: subscriptionPaymentsData, error: paymentsError } = await client
      .from('bestauth_points_transactions')
      .select(`
        id,
        user_id,
        transaction_type,
        points,
        created_at,
        bestauth_users!inner (
          email
        )
      `)
      .eq('transaction_type', 'purchase')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (paymentsError) throw paymentsError;

    // Map subscription payments (using price_id from metadata if available)
    const subscriptionPayments = (subscriptionPaymentsData || []).map((row: any) => {
      const user = Array.isArray(row.bestauth_users) ? row.bestauth_users[0] : row.bestauth_users;
      return {
        id: row.id,
        userEmail: user?.email || 'Unknown',
        priceId: row.metadata?.price_id || '',
        createdAt: row.created_at,
        provider: 'creem',
        status: 'completed',
      };
    });

    const subscriptionRevenueInRange = subscriptionPayments.reduce(
      (sum: number, row: any) => sum + (row.priceId ? getPlanPriceByPriceId(row.priceId) : 0),
      0
    );

    const subscriptionRows = subscriptionPayments.map((row: any) => ({
      id: row.id,
      userEmail: row.userEmail || 'Unknown',
      amount: row.priceId ? getPlanPriceByPriceId(row.priceId) : 0,
      currency: 'USD',
      status: row.status,
      createdAt: row.createdAt,
      provider: row.provider || 'creem',
      type: 'subscription' as const,
      credits: null,
    }));

    // Get credit pack purchases from points_transactions
    const { data: creditPackRows, error: creditPackError } = await client
      .from('bestauth_points_transactions')
      .select(`
        id,
        user_id,
        points,
        created_at,
        metadata,
        bestauth_users!inner (
          email
        )
      `)
      .eq('transaction_type', 'purchase')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (creditPackError) throw creditPackError;

    const creditPackPayments = (creditPackRows || []).map((row: any) => {
      const user = Array.isArray(row.bestauth_users) ? row.bestauth_users[0] : row.bestauth_users;
      const metadata = row.metadata || {};
      const amountCents = metadata.amount_cents || 0;
      return {
        id: row.id,
        userEmail: user?.email || 'Unknown',
        amount: amountCents / 100,
        currency: metadata.currency || 'USD',
        status: 'completed',
        createdAt: row.created_at,
        provider: metadata.provider || 'creem',
        type: 'credit_pack' as const,
        credits: row.points || 0,
      };
    });

    const recentPayments = [...creditPackPayments, ...subscriptionRows].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const trendMap = new Map<
      string,
      {
        date: string;
        amount: number;
        count: number;
      }
    >();

    recentPayments.forEach((entry) => {
      const dateKey = new Date(entry.createdAt).toISOString().split('T')[0];
      const current = trendMap.get(dateKey) ?? { date: dateKey, amount: 0, count: 0 };
      current.amount += entry.amount;
      current.count += 1;
      trendMap.set(dateKey, current);
    });

    const trend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Get total pack revenue
    const { data: totalPackRevenueData, error: totalPackError } = await client
      .from('bestauth_points_transactions')
      .select('metadata')
      .eq('transaction_type', 'purchase');

    if (totalPackError) throw totalPackError;

    const totalPackRevenue = (totalPackRevenueData || []).reduce(
      (sum: number, row: any) => {
        const amountCents = row.metadata?.amount_cents || 0;
        return sum + amountCents / 100;
      },
      0
    );

    // Get total subscription revenue
    const { data: totalSubscriptionData, error: totalSubError } = await client
      .from('bestauth_points_transactions')
      .select('metadata')
      .eq('transaction_type', 'purchase');

    if (totalSubError) throw totalSubError;

    const totalSubscriptionRevenue = (totalSubscriptionData || []).reduce(
      (sum: number, row: any) => {
        const priceId = row.metadata?.price_id;
        return sum + (priceId ? getPlanPriceByPriceId(priceId) : 0);
      },
      0
    );

    const totalRevenue = totalPackRevenue + totalSubscriptionRevenue;
    const revenueInRange =
      creditPackPayments.reduce((sum, p) => sum + p.amount, 0) + subscriptionRevenueInRange;
    const transactionCount = recentPayments.length;
    const averageTransaction = transactionCount > 0 ? revenueInRange / transactionCount : 0;

    const response = NextResponse.json({
      summary: {
        totalRevenue,
        revenueInRange,
        transactionCount,
        averageTransaction,
      },
      trend,
      recentPayments,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin payments stats error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch payments stats' }, { status: 500 });
  }
}
