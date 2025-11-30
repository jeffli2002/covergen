/**
 * Script to list all registered users with their granted and spent credits
 * Usage: npx tsx scripts/list-all-users-credits.ts
 */

import { getBestAuthSupabaseClient } from '../src/lib/bestauth/db-client';

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

async function listAllUsersCredits() {
  console.log('Fetching all users with credit information...\n');

  const client = getBestAuthSupabaseClient();
  if (!client) {
    console.error('❌ Failed to connect to database. Check environment variables.');
    process.exit(1);
  }

  try {
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
      console.log('No users found.');
      return;
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

    // Display results
    console.log('='.repeat(120));
    console.log('ALL REGISTERED USERS - CREDITS SUMMARY');
    console.log('='.repeat(120));
    console.log(
      `${'Email'.padEnd(40)} | ${'Plan'.padEnd(8)} | ${'Balance'.padStart(10)} | ${'Earned'.padStart(10)} | ${'Spent'.padStart(10)} | ${'Has TX'.padEnd(6)} | ${'Has Sub'.padEnd(8)}`
    );
    console.log('-'.repeat(120));

    let totalUsers = 0;
    let totalBalance = 0;
    let totalEarned = 0;
    let totalSpent = 0;
    let usersWithTransactions = 0;
    let usersWithSubscription = 0;

    usersList.forEach((user) => {
      totalUsers++;
      totalBalance += user.availableBalance;
      totalEarned += user.totalEarned;
      totalSpent += user.totalSpent;
      if (user.hasTransactions) usersWithTransactions++;
      if (user.hasSubscription) usersWithSubscription++;

      const email = user.email.length > 40 ? user.email.substring(0, 37) + '...' : user.email;
      console.log(
        `${email.padEnd(40)} | ${user.plan.padEnd(8)} | ${user.availableBalance.toString().padStart(10)} | ${user.totalEarned.toString().padStart(10)} | ${user.totalSpent.toString().padStart(10)} | ${(user.hasTransactions ? 'Yes' : 'No').padEnd(6)} | ${(user.hasSubscription ? 'Yes' : 'No').padEnd(8)}`
      );
    });

    console.log('-'.repeat(120));
    console.log(
      `${'TOTAL'.padEnd(40)} | ${''.padEnd(8)} | ${totalBalance.toString().padStart(10)} | ${totalEarned.toString().padStart(10)} | ${totalSpent.toString().padStart(10)} | ${''.padEnd(6)} | ${''.padEnd(8)}`
    );
    console.log('='.repeat(120));
    console.log(`\nSummary:`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Users with Transactions: ${usersWithTransactions} (${((usersWithTransactions / totalUsers) * 100).toFixed(1)}%)`);
    console.log(`  Users with Subscription: ${usersWithSubscription} (${((usersWithSubscription / totalUsers) * 100).toFixed(1)}%)`);
    console.log(`  Total Balance: ${totalBalance.toLocaleString()} credits`);
    console.log(`  Total Earned: ${totalEarned.toLocaleString()} credits`);
    console.log(`  Total Spent: ${totalSpent.toLocaleString()} credits`);
    console.log(`\n`);

    // Show users with 0 earned credits (potential issues)
    const usersWithZeroEarned = usersList.filter((u) => u.totalEarned === 0 && u.totalSpent === 0);
    if (usersWithZeroEarned.length > 0) {
      console.log('⚠️  Users with 0 earned credits (may need signup bonus):');
      usersWithZeroEarned.forEach((user) => {
        const userAge = Date.now() - new Date(user.createdAt).getTime();
        const hoursSinceSignup = userAge / (1000 * 60 * 60);
        console.log(`  - ${user.email} (registered ${hoursSinceSignup.toFixed(1)}h ago, has subscription: ${user.hasSubscription}, has transactions: ${user.hasTransactions})`);
      });
      console.log(`\n`);
    }

    // Export to CSV format
    console.log('CSV Format (copy and paste into Excel/Google Sheets):\n');
    console.log('Email,Plan,Status,Available Balance,Total Earned,Total Spent,Has Transactions,Has Subscription,Created At');
    usersList.forEach((user) => {
      console.log(
        `"${user.email}","${user.plan}","${user.status}",${user.availableBalance},${user.totalEarned},${user.totalSpent},${user.hasTransactions},${user.hasSubscription},"${user.createdAt}"`
      );
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    process.exit(1);
  }
}

// Run the script
listAllUsersCredits()
  .then(() => {
    console.log('✅ Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

