import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    // TODO: Create credit_pack_purchase table or use payment_history with metadata
    // For now, return empty data structure
    const purchasesInRange: any[] = [];
    const revenueInRange = 0;
    const totalRevenue = 0;

    // Try to get from payment_history if it exists
    const { data: paymentHistory, error: paymentError } = await client
      .from('bestauth_payment_history')
      .select('id, user_id, amount, currency, status, description, metadata, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!paymentError && paymentHistory) {
      // Filter for credit pack purchases (check metadata)
      const creditPackPayments = paymentHistory.filter((payment: any) => {
        const metadata = payment.metadata || {};
        return metadata.type === 'credit_pack' || metadata.productType === 'credit_pack';
      });

      const revenueInRangeCalc = creditPackPayments.reduce(
        (sum: number, payment: any) => sum + (payment.amount || 0) / 100,
        0
      );

      // Get user emails
      const userIds = [...new Set(creditPackPayments.map((p: any) => p.user_id))];
      const { data: users } = await client
        .from('bestauth_users')
        .select('id, email')
        .in('id', userIds);

      const userMap = new Map((users || []).map((u: any) => [u.id, u.email]));

      const recentPurchases = creditPackPayments.map((payment: any) => ({
        id: payment.id,
        userEmail: userMap.get(payment.user_id) || 'Unknown',
        credits: payment.metadata?.credits || 0,
        amount: (payment.amount || 0) / 100,
        currency: payment.currency || 'USD',
        provider: payment.metadata?.provider || 'unknown',
        createdAt: payment.created_at,
      }));

      const trendMap = new Map<string, { date: string; amount: number; count: number }>();

      creditPackPayments.forEach((payment: any) => {
        const dateKey = new Date(payment.created_at).toISOString().split('T')[0];
        const entry = trendMap.get(dateKey) ?? { date: dateKey, amount: 0, count: 0 };
        entry.amount += (payment.amount || 0) / 100;
        entry.count += 1;
        trendMap.set(dateKey, entry);
      });

      const trend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      const response = NextResponse.json({
        summary: {
          totalRevenue: 0, // TODO: Calculate total revenue
          revenueInRange: revenueInRangeCalc,
          transactionCount: creditPackPayments.length,
          averageTransaction:
            creditPackPayments.length > 0 ? revenueInRangeCalc / creditPackPayments.length : 0,
        },
        trend,
        purchases: recentPurchases,
      });

      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Return empty structure if no payment history
    const response = NextResponse.json({
      summary: {
        totalRevenue,
        revenueInRange,
        transactionCount: 0,
        averageTransaction: 0,
      },
      trend: [],
      purchases: [],
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Admin credit pack stats error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch credit pack stats' }, { status: 500 });
  }
}
