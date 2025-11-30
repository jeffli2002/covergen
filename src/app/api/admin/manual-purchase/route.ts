import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();
    const { userId, credits, orderId, checkoutId, amountCents } = body;

    if (!userId || !credits || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, credits, orderId' },
        { status: 400 }
      );
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if transaction already exists using reference_id
    const referenceId = `creem_credit_pack_${orderId}`;
    const { data: existingTransactions, error: checkError } = await client
      .from('bestauth_points_transactions')
      .select('id')
      .eq('reference_id', referenceId)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing transaction:', checkError);
      return NextResponse.json({ error: 'Failed to check existing transaction' }, { status: 500 });
    }

    if (existingTransactions && existingTransactions.length > 0) {
      return NextResponse.json(
        { error: 'Purchase with this orderId already exists' },
        { status: 400 }
      );
    }

    // Get user's current subscription to update points_balance
    const { data: subscription, error: subError } = await client
      .from('bestauth_subscriptions')
      .select('points_balance, points_lifetime_earned')
      .eq('user_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK if user doesn't have subscription yet
      console.error('Error fetching subscription:', subError);
      return NextResponse.json({ error: 'Failed to fetch user subscription' }, { status: 500 });
    }

    const currentBalance = subscription?.points_balance || 0;
    const newBalance = currentBalance + credits;
    const lifetimeEarned = (subscription?.points_lifetime_earned || 0) + credits;

    // Update or insert subscription with new balance
    if (subscription) {
      const { error: updateError } = await client
        .from('bestauth_subscriptions')
        .update({
          points_balance: newBalance,
          points_lifetime_earned: lifetimeEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return NextResponse.json({ error: 'Failed to update user balance' }, { status: 500 });
      }
    } else {
      // Create subscription record if it doesn't exist
      const { error: insertError } = await client
        .from('bestauth_subscriptions')
        .insert({
          id: randomUUID(),
          user_id: userId,
          tier: 'free',
          status: 'active',
          points_balance: newBalance,
          points_lifetime_earned: lifetimeEarned,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Error creating subscription:', insertError);
        return NextResponse.json({ error: 'Failed to create subscription record' }, { status: 500 });
      }
    }

    // Create transaction record
    const transactionId = randomUUID();
    const { error: transactionError } = await client
      .from('bestauth_points_transactions')
      .insert({
        id: transactionId,
        user_id: userId,
        points: credits,
        balance_after: newBalance,
        transaction_type: 'purchase',
        description: `Credit pack purchase: ${credits} credits (manual)`,
        reference_id: referenceId,
        metadata: {
          provider: 'creem',
          checkoutId,
          orderId,
          credits,
          amount: amountCents / 100,
          currency: 'USD',
          manual: true,
        },
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json({ error: 'Failed to create transaction record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase added successfully',
      newBalance,
    });
  } catch (error) {
    console.error('Manual purchase error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
