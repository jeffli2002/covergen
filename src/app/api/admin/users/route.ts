import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const range = searchParams.get('range') || 'all';
    const limit = Number.parseInt(searchParams.get('limit') || '100');
    const offset = Number.parseInt(searchParams.get('offset') || '0');

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

    // Build base query
    let usersQuery = client
      .from('bestauth_users')
      .select(`
        id,
        email,
        name,
        created_at,
        bestauth_subscriptions!left (
          tier,
          status,
          points_balance,
          points_lifetime_earned,
          points_lifetime_spent
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add filters
    if (startDate) {
      usersQuery = usersQuery.gte('created_at', startDate.toISOString());
    }
    if (search) {
      usersQuery = usersQuery.ilike('email', `%${search}%`);
    }

    const { data: usersData, error: usersError } = await usersQuery;

    if (usersError) {
      throw usersError;
    }

    // Transform data to match expected format
    // Calculate credits from transactions if subscription data is missing or incorrect
    const usersList = await Promise.all((usersData || []).map(async (user: any) => {
      const subscription = Array.isArray(user.bestauth_subscriptions) 
        ? user.bestauth_subscriptions[0] 
        : user.bestauth_subscriptions;
      
      // Get transactions to calculate accurate credit data
      const { data: transactions } = await client
        .from('bestauth_points_transactions')
        .select('amount, transaction_type, balance_after, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      let totalEarned = 0;
      let totalSpent = 0;
      
      // Calculate from transactions (most accurate source)
      if (transactions && transactions.length > 0) {
        transactions.forEach((tx: any) => {
          const amount = tx.amount || 0;
          if (amount > 0) {
            // Positive amounts are earned (signup_bonus, purchase, subscription_grant)
            totalEarned += amount;
          } else {
            // Negative amounts are spent (generation_cost)
            totalSpent += Math.abs(amount);
          }
        });
      }
      
      // Get current balance from latest transaction or subscription
      const latestTx = transactions && transactions.length > 0 ? transactions[0] : null;
      const availableBalance = latestTx?.balance_after ?? subscription?.points_balance ?? 0;
      
      // Use subscription data if available and seems correct, otherwise use calculated values
      const subscriptionEarned = subscription?.points_lifetime_earned ?? 0;
      const subscriptionSpent = subscription?.points_lifetime_spent ?? 0;
      
      // Prefer calculated values if subscription values are 0 but we have transactions
      const finalEarned = (subscriptionEarned > 0 || transactions?.length === 0) 
        ? subscriptionEarned 
        : totalEarned;
      const finalSpent = (subscriptionSpent > 0 || transactions?.length === 0) 
        ? subscriptionSpent 
        : totalSpent;
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
        plan: subscription?.tier || 'free',
        subscriptionStatus: subscription?.status || 'inactive',
        availableBalance,
        totalEarned: finalEarned,
        totalSpent: finalSpent,
      };
    }));

    // Get total count
    let countQuery = client.from('bestauth_users').select('id', { count: 'exact', head: true });

    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate.toISOString());
    }
    if (search) {
      countQuery = countQuery.ilike('email', `%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    const totalCount = count || 0;

    const response = NextResponse.json({
      users: usersList,
      total: totalCount,
      limit,
      offset,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin users list error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
