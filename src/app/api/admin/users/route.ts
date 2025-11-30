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
      
      // Get subscription values as fallback
      const subscriptionEarned = subscription?.points_lifetime_earned ?? 0;
      const subscriptionSpent = subscription?.points_lifetime_spent ?? 0;
      const subscriptionBalance = subscription?.points_balance ?? 0;
      
      // Determine final values with improved fallback logic:
      // 1. If we have transactions, use calculated values (most accurate)
      // 2. If no transactions but subscription has lifetime_earned, use that
      // 3. If subscription has balance > 0 but lifetime_earned is 0, use balance as minimum earned
      //    (this handles cases where signup bonus was granted but lifetime_earned wasn't updated)
      let finalEarned = 0;
      let finalSpent = 0;
      
      if (transactions && transactions.length > 0) {
        // Use calculated values from transactions (most accurate)
        finalEarned = totalEarned;
        finalSpent = totalSpent;
      } else {
        // No transactions - use subscription values
        finalEarned = subscriptionEarned;
        finalSpent = subscriptionSpent;
        
        // Special case: If subscription has balance but lifetime_earned is 0,
        // it means credits were granted but lifetime_earned wasn't updated.
        // Use balance as minimum earned (user has credits, so they must have earned at least that much)
        if (subscriptionBalance > 0 && subscriptionEarned === 0) {
          finalEarned = subscriptionBalance;
          console.log(`[Admin Users API] User ${user.email} (${user.id}): balance=${subscriptionBalance}, lifetime_earned=0, using balance as earned`);
        }
        
        // Debug log for new users with 0 credits
        if (finalEarned === 0 && finalSpent === 0 && subscriptionBalance === 0) {
          const userAge = Date.now() - new Date(user.created_at).getTime();
          const hoursSinceSignup = userAge / (1000 * 60 * 60);
          if (hoursSinceSignup < 24) {
            console.log(`[Admin Users API] New user ${user.email} (${user.id}) registered ${hoursSinceSignup.toFixed(1)}h ago: no credits, no transactions, subscription=${subscription ? 'exists' : 'missing'}`);
          }
        }
      }
      
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
