import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { getKieApiService } from '@/lib/kie-api';
import { NextResponse } from 'next/server';

/**
 * API endpoint to fix missing credit transactions for successful image generation tasks
 * This should be called when KIE.ai logs show successful generation but no transaction records exist
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();

    const { taskIds } = await request.json();

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds array is required' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { PRICING_CONFIG } = await import('@/config/pricing.config');
    const creditCost = PRICING_CONFIG.generationCosts.nanoBananaImage;
    const kieApi = getKieApiService();

    const results = [];

    for (const taskId of taskIds) {
      try {
        // Check if task exists and is successful
        const taskStatus = await kieApi.getTaskStatus(taskId);
        const taskData = (taskStatus.data as any)?.data || taskStatus.data;

        if (!taskData || taskData.state !== 'success') {
          results.push({
            taskId,
            status: 'skipped',
            reason: `Task not found or not successful. State: ${taskData?.state || 'unknown'}`,
          });
          continue;
        }

        // Check if transaction already exists
        const { data: existingTx } = await client
          .from('bestauth_points_transactions')
          .select('*')
          .or(`metadata->>taskId.eq.${taskId},metadata->>task_id.eq.${taskId}`)
          .limit(1);

        if (existingTx && existingTx.length > 0) {
          results.push({
            taskId,
            status: 'skipped',
            reason: 'Transaction already exists',
            transactionId: existingTx[0].id,
          });
          continue;
        }

        // Try to find user by checking recent transactions around task creation time
        const taskCreateTime = taskData.createTime
          ? new Date(taskData.createTime).toISOString()
          : null;

        let userId: string | null = null;
        let subscriptionId: string | null = null;

        if (taskCreateTime) {
          // Look for transactions within 30 minutes of task creation
          const startTime = new Date(new Date(taskCreateTime).getTime() - 30 * 60 * 1000).toISOString();
          const endTime = new Date(new Date(taskCreateTime).getTime() + 30 * 60 * 1000).toISOString();

          const { data: nearbyTx } = await client
            .from('bestauth_points_transactions')
            .select('user_id, subscription_id')
            .eq('transaction_type', 'generation_deduction')
            .eq('generation_type', 'nanoBananaImage')
            .gte('created_at', startTime)
            .lte('created_at', endTime)
            .order('created_at', { ascending: false })
            .limit(1);

          if (nearbyTx && nearbyTx.length > 0) {
            userId = nearbyTx[0].user_id;
            subscriptionId = nearbyTx[0].subscription_id;
          }
        }

        if (!userId) {
          results.push({
            taskId,
            status: 'failed',
            reason: 'Could not determine user ID. Task may have been generated before credit system was implemented, or user data is missing.',
          });
          continue;
        }

        // Get current subscription balance
        const { data: subscription } = await client
          .from('bestauth_subscriptions')
          .select('id, points_balance, points_lifetime_spent')
          .eq('user_id', userId)
          .single();

        if (!subscription) {
          results.push({
            taskId,
            status: 'failed',
            reason: 'User subscription not found',
            userId,
          });
          continue;
        }

        // Calculate new balance (assuming credits were already deducted but transaction wasn't recorded)
        // We'll create the transaction record but NOT deduct credits again
        const currentBalance = subscription.points_balance || 0;
        const currentSpent = subscription.points_lifetime_spent || 0;

        // Create transaction record for audit trail
        // Note: We're NOT deducting credits again, just creating the missing transaction record
        const { data: newTx, error: txError } = await client
          .from('bestauth_points_transactions')
          .insert({
            user_id: userId,
            amount: -creditCost,
            balance_after: currentBalance, // Use current balance (credits were already deducted)
            transaction_type: 'generation_deduction',
            generation_type: 'nanoBananaImage',
            subscription_id: subscription.id,
            description: `Image generation: Task ${taskId} (retroactive transaction record)`,
            metadata: {
              taskId,
              retroactive: true,
              fixedAt: new Date().toISOString(),
            },
          })
          .select()
          .single();

        if (txError) {
          results.push({
            taskId,
            status: 'failed',
            reason: `Failed to create transaction: ${txError.message}`,
            userId,
          });
          continue;
        }

        results.push({
          taskId,
          status: 'success',
          transactionId: newTx.id,
          userId,
          creditCost,
          note: 'Transaction record created. Credits were NOT deducted again (assuming they were already deducted).',
        });
      } catch (error: any) {
        results.push({
          taskId,
          status: 'error',
          reason: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      summary: {
        total: taskIds.length,
        success: results.filter((r) => r.status === 'success').length,
        failed: results.filter((r) => r.status === 'failed').length,
        skipped: results.filter((r) => r.status === 'skipped').length,
        errors: results.filter((r) => r.status === 'error').length,
      },
      results,
    });
  } catch (error: unknown) {
    console.error('Fix missing transactions error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fix missing transactions' },
      { status: 500 }
    );
  }
}

