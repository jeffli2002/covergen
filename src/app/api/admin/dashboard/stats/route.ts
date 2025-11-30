import { paymentConfig } from '@/config/payment.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getPlanPriceByPriceId } from '@/lib/admin/revenue-utils';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

const _parsePurchaseMetadata = (metadata: string | null) => {
  if (!metadata) {
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0 };
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
    };
  } catch (error) {
    console.error('Failed to parse purchase metadata:', error);
    return { amount: 0, currency: 'USD', provider: 'unknown', credits: 0 };
  }
};

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'today';

    let startDate: Date;
    let endDate: Date;

    if (range === 'custom') {
      const startParam = searchParams.get('start');
      const endParam = searchParams.get('end');
      if (!startParam || !endParam) {
        return NextResponse.json(
          { error: 'Custom range requires start and end dates' },
          { status: 400 }
        );
      }
      startDate = new Date(startParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
    } else if (range === 'today') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else {
      const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get user registrations
    const { count: registrationsCount, error: regError } = await client
      .from('bestauth_users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (regError) throw regError;

    // Get subscription users (users with active subscriptions)
    const { data: subscriptionUsers, error: subUsersError } = await client
      .from('bestauth_subscriptions')
      .select('user_id')
      .eq('status', 'active')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (subUsersError) throw subUsersError;
    const subscriptionUsersCount = new Set(subscriptionUsers?.map((s: any) => s.user_id) || []).size;

    // Get pack purchase users (placeholder - may need to create credit_pack_purchase table)
    // For now, we'll use payment_history if it exists
    const packPurchaseUsersCount = 0; // TODO: Implement when credit pack purchase table is available

    // Get subscription revenue from payment history
    const { data: subscriptionPayments, error: paymentsError } = await client
      .from('bestauth_payment_history')
      .select('amount, metadata')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .eq('status', 'succeeded');

    if (paymentsError) {
      console.warn('Payment history table may not exist:', paymentsError);
    }

    const subscriptionRevenue = (subscriptionPayments || []).reduce(
      (sum: number, row: any) => {
        const amount = typeof row.amount === 'number' ? row.amount / 100 : 0; // Convert cents to dollars
        return sum + amount;
      },
      0
    );

    // Pack revenue (placeholder)
    const packRevenue = 0; // TODO: Implement when credit pack purchase table is available
    const totalRevenue = subscriptionRevenue + packRevenue;

    // Get credits spent from subscriptions (points_lifetime_spent)
    const { data: subscriptions, error: subsError } = await client
      .from('bestauth_subscriptions')
      .select('points_lifetime_spent')
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString());

    if (subsError) throw subsError;

    // Calculate credits (simplified - using lifetime spent)
    const totalCredits = (subscriptions || []).reduce(
      (sum: number, sub: any) => sum + (sub.points_lifetime_spent || 0),
      0
    );
    const imageCredits = Math.floor(totalCredits * 0.7); // Estimate 70% for images
    const videoCredits = Math.floor(totalCredits * 0.3); // Estimate 30% for videos

    // Registration trend
    const { data: registrationTrendData, error: trendError } = await client
      .from('bestauth_users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (trendError) throw trendError;

    const registrationTrendMap = new Map<string, number>();
    (registrationTrendData || []).forEach((user: any) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      registrationTrendMap.set(date, (registrationTrendMap.get(date) || 0) + 1);
    });

    const registrationTrend = Array.from(registrationTrendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Credits trend (simplified)
    const creditsTrend = registrationTrend.map((item) => ({
      date: item.date,
      imageCredits: Math.floor((item.count * totalCredits) / (registrationTrend.length || 1) * 0.7),
      videoCredits: Math.floor((item.count * totalCredits) / (registrationTrend.length || 1) * 0.3),
    }));

    const response = NextResponse.json({
      kpis: {
        registrations: registrationsCount || 0,
        subscriptionUsers: subscriptionUsersCount,
        packPurchaseUsers: packPurchaseUsersCount,
        totalRevenue,
        subscriptionRevenue,
        packRevenue,
        totalCredits,
        imageCredits,
        videoCredits,
      },
      revenueSummary: {
        subscriptionRevenueInRange: subscriptionRevenue,
        packRevenueInRange: packRevenue,
        totalRevenueInRange: totalRevenue,
      },
      trends: {
        registrations: registrationTrend,
        credits: creditsTrend,
      },
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin stats error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
