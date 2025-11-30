import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

interface UserCreditInfo {
  email: string;
  userId: string;
  name: string | null;
  createdAt: string;
  plan: string;
  status: string;
  availableBalance: number;
  totalEarned: number;
  totalSpent: number;
  hasTransactions: boolean;
  hasSubscription: boolean;
}

export async function GET(request: Request) {
  try {
    // Verify admin
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Fetch all users with subscription data
    const { data: usersData, error: usersError } = await client
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
      .order('created_at', { ascending: false });

    if (usersError) {
      throw usersError;
    }

    if (!usersData || usersData.length === 0) {
      return NextResponse.json({ users: [], summary: {} });
    }

    // Process each user to calculate accurate credit data
    const usersList: UserCreditInfo[] = await Promise.all(
      (usersData || []).map(async (user: any) => {
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

        // Determine final values with improved fallback logic
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
          // use balance as minimum earned
          if (subscriptionBalance > 0 && subscriptionEarned === 0) {
            finalEarned = subscriptionBalance;
          }
        }

        return {
          email: user.email,
          userId: user.id,
          name: user.name,
          createdAt: user.created_at,
          plan: subscription?.tier || 'free',
          status: subscription?.status || 'inactive',
          availableBalance,
          totalEarned: finalEarned,
          totalSpent: finalSpent,
          hasTransactions: (transactions && transactions.length > 0) || false,
          hasSubscription: !!subscription,
        };
      })
    );

    // Sort by total earned (descending) then by email
    usersList.sort((a, b) => {
      if (b.totalEarned !== a.totalEarned) {
        return b.totalEarned - a.totalEarned;
      }
      return a.email.localeCompare(b.email);
    });

    // Calculate summary statistics
    const totalUsers = usersList.length;
    const totalBalance = usersList.reduce((sum, u) => sum + u.availableBalance, 0);
    const totalEarned = usersList.reduce((sum, u) => sum + u.totalEarned, 0);
    const totalSpent = usersList.reduce((sum, u) => sum + u.totalSpent, 0);
    const usersWithTransactions = usersList.filter((u) => u.hasTransactions).length;
    const usersWithSubscription = usersList.filter((u) => u.hasSubscription).length;
    const usersWithZeroEarned = usersList.filter((u) => u.totalEarned === 0 && u.totalSpent === 0);

    const summary = {
      totalUsers,
      totalBalance,
      totalEarned,
      totalSpent,
      usersWithTransactions,
      usersWithSubscription,
      usersWithZeroEarned: usersWithZeroEarned.length,
      percentageWithTransactions: ((usersWithTransactions / totalUsers) * 100).toFixed(1),
      percentageWithSubscription: ((usersWithSubscription / totalUsers) * 100).toFixed(1),
    };

    const response = NextResponse.json({
      users: usersList,
      summary,
    });

    // Prevent caching of admin data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error: unknown) {
    console.error('Admin users credits export error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export users credits' },
      { status: 500 }
    );
  }
}

