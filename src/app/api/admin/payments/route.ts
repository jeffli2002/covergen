import { paymentConfig } from '@/config/payment.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

const _parsePurchaseMetadata = (metadata: string | null) => {
  if (!metadata) {
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0, productName: '' };
  }
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    const productId = typeof parsed.productId === 'string' ? parsed.productId : undefined;
    const creditsValue =
      typeof parsed.credits === 'number' ? parsed.credits : Number(parsed.credits) || undefined;
    const pack =
      paymentConfig.creditPacks.find((pack) => pack.creemProductKey === productId) ||
      (typeof creditsValue === 'number'
        ? paymentConfig.creditPacks.find((pack) => pack.credits === creditsValue)
        : undefined);
    const rawAmount = Number(parsed.amount);
    const amount = Number.isFinite(rawAmount) && rawAmount > 0 ? rawAmount : (pack?.price ?? 0);
    return {
      amount,
      currency: typeof parsed.currency === 'string' ? parsed.currency : 'USD',
      provider: typeof parsed.provider === 'string' ? parsed.provider : 'unknown',
      credits: creditsValue ?? pack?.credits ?? 0,
      productName: typeof parsed.productName === 'string' ? parsed.productName : pack?.name || '',
    };
  } catch (error) {
    console.error('Failed to parse purchase metadata:', error);
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0, productName: '' };
  }
};

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get payment history (subscription payments)
    const { data: paymentHistory, error: paymentError } = await client
      .from('bestauth_payment_history')
      .select('id, user_id, amount, currency, status, description, metadata, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (paymentError) {
      console.warn('Payment history table may not exist:', paymentError);
    }

    // Get user emails
    const userIds = [...new Set((paymentHistory || []).map((p: any) => p.user_id))];
    const { data: users } = userIds.length > 0 ? await client
      .from('bestauth_users')
      .select('id, email, name')
      .in('id', userIds) : { data: [] };

    const userMap = new Map((users || []).map((u: any) => [u.id, { email: u.email, name: u.name }]));

    // Separate subscription and credit pack payments
    const subscriptionPayments = (paymentHistory || []).filter((p: any) => {
      const metadata = p.metadata || {};
      return metadata.type !== 'credit_pack' && metadata.productType !== 'credit_pack';
    });

    const creditPackPayments = (paymentHistory || []).filter((p: any) => {
      const metadata = p.metadata || {};
      return metadata.type === 'credit_pack' || metadata.productType === 'credit_pack';
    }).map((payment: any) => {
      const user = userMap.get(payment.user_id);
      const metadata = payment.metadata || {};
      const pack = paymentConfig.creditPacks.find((p) => p.creemProductKey === metadata.productId) ||
        paymentConfig.creditPacks.find((p) => p.credits === metadata.credits);
      return {
        id: payment.id,
        userEmail: user?.email || 'Unknown',
        amount: (payment.amount || 0) / 100,
        currency: payment.currency || 'USD',
        status: payment.status || 'completed',
        createdAt: payment.created_at,
        provider: metadata.provider || 'unknown',
        type: 'credit_pack' as const,
        credits: metadata.credits || pack?.credits || 0,
        description: pack?.name || `${metadata.credits || 0} credits`,
      };
    });

    // Calculate revenue
    const totalRevenue = (paymentHistory || []).reduce(
      (sum: number, p: any) => sum + (p.amount || 0) / 100,
      0
    );

    const revenueInRange = creditPackPayments.reduce((sum: number, item: any) => sum + item.amount, 0);

    const recentSubscriptionPayments = subscriptionPayments.map((p: any) => {
      const user = userMap.get(p.user_id);
      return {
        id: p.id,
        userId: p.user_id,
        userEmail: user?.email || 'Unknown',
        userName: user?.name,
        amount: (p.amount || 0) / 100,
        currency: p.currency || 'USD',
        status: p.status,
        provider: p.metadata?.provider || 'unknown',
        type: 'subscription' as const,
        credits: null,
        description: p.description || 'Subscription',
        createdAt: p.created_at,
      };
    });

    const combinedRecentPayments = [...creditPackPayments, ...recentSubscriptionPayments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const transactionsCount = creditPackPayments.length;
    const averageTransaction = transactionsCount > 0 ? revenueInRange / transactionsCount : 0;

    const trendMap = new Map<
      string,
      {
        date: string;
        amount: number;
        count: number;
      }
    >();

    creditPackPayments.forEach((payment) => {
      const dateKey = new Date(payment.createdAt).toISOString().split('T')[0];
      const entry = trendMap.get(dateKey) ?? { date: dateKey, amount: 0, count: 0 };
      entry.amount += payment.amount;
      entry.count += 1;
      trendMap.set(dateKey, entry);
    });

    const trend = Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    const response = NextResponse.json({
      summary: {
        totalRevenue,
        revenueInRange,
        transactionCount: transactionsCount,
        averageTransaction,
      },
      trend,
      recentPayments: combinedRecentPayments,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin payments error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
