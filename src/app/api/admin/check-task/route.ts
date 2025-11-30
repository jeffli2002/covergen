import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { getKieApiService } from '@/lib/kie-api';
import { querySoraTask } from '@/lib/sora-api';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const result: any = {
      taskId,
      found: false,
      type: null,
      status: null,
      data: null,
      transactions: [],
      user: null,
    };

    // Check if it's a video task (Sora)
    const { data: videoTask, error: videoError } = await client
      .from('sora_video_tasks')
      .select('*')
      .eq('task_id', taskId)
      .maybeSingle();

    if (!videoError && videoTask) {
      result.found = true;
      result.type = 'video';
      result.status = videoTask.status;
      result.data = videoTask;

      // Get user info
      const { data: user } = await client
        .from('bestauth_users')
        .select('id, email, name')
        .eq('id', videoTask.user_id)
        .single();

      if (user) {
        result.user = user;
      }

      // Check credit transactions for this user
      const { data: transactions } = await client
        .from('bestauth_points_transactions')
        .select('*')
        .eq('user_id', videoTask.user_id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (transactions) {
        result.transactions = transactions.filter((tx: any) => {
          const meta = tx.metadata || {};
          return meta.taskId === taskId || meta.task_id === taskId;
        });
      }

      // Try to get current task status from Sora API
      try {
        const soraStatus = await querySoraTask(taskId);
        result.soraStatus = soraStatus;
      } catch (error: any) {
        result.soraApiError = error.message;
      }

      return NextResponse.json(result);
    }

    // Check if it's an image generation task (KIE API)
    try {
      const kieApi = getKieApiService();
      const taskStatus = await kieApi.getTaskStatus(taskId);

      result.found = true;
      result.type = 'image';
      result.status = taskStatus.data?.state || taskStatus.data?.status || 'unknown';
      result.data = taskStatus;

      // Check credit transactions that might reference this task
      // Search in multiple ways: metadata.taskId, metadata.task_id, description, or by time proximity
      const { data: allTransactions } = await client
        .from('bestauth_points_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (allTransactions) {
        result.transactions = allTransactions.filter((tx: any) => {
          const meta = tx.metadata || {};
          const desc = tx.description || '';
          // Check multiple possible taskId fields in metadata
          return (
            meta.taskId === taskId ||
            meta.task_id === taskId ||
            meta.taskID === taskId ||
            desc.includes(taskId) ||
            (meta.taskId && String(meta.taskId) === taskId) ||
            (meta.task_id && String(meta.task_id) === taskId)
          );
        });

        // If no direct match, try to find transactions by generation type and time proximity
        // Image generation tasks typically deduct credits right after creation
        if (result.transactions.length === 0 && taskStatus.data) {
          // Try multiple time fields from KIE API response (nested structure)
          // KIE API returns: { data: { data: { createTime: ... } } }
          const taskDataAny = taskStatus.data as any;
          const taskData = taskDataAny?.data || taskDataAny;
          const taskCreatedAt = 
            taskData?.createTime || 
            taskData?.created_at || 
            taskData?.createdAt ||
            taskDataAny?.createTime ||
            taskDataAny?.created_at ||
            taskDataAny?.createdAt;
          
          if (taskCreatedAt) {
            // Handle both timestamp (milliseconds) and ISO string formats
            let taskTime: number;
            if (typeof taskCreatedAt === 'number') {
              taskTime = taskCreatedAt; // Already in milliseconds
            } else {
              taskTime = new Date(taskCreatedAt).getTime();
            }
            
            // Look for generation_deduction transactions within 10 minutes of task creation
            const nearbyTransactions = allTransactions.filter((tx: any) => {
              if (tx.transaction_type !== 'generation_deduction' || tx.generation_type !== 'nanoBananaImage') {
                return false;
              }
              const txTime = new Date(tx.created_at).getTime();
              const timeDiff = Math.abs(txTime - taskTime);
              return timeDiff < 10 * 60 * 1000; // 10 minutes window
            });
            
            if (nearbyTransactions.length > 0) {
              // Sort by time proximity (closest first)
              nearbyTransactions.sort((a: any, b: any) => {
                const timeA = Math.abs(new Date(a.created_at).getTime() - taskTime);
                const timeB = Math.abs(new Date(b.created_at).getTime() - taskTime);
                return timeA - timeB;
              });
              
              result.transactions = nearbyTransactions;
              result.note = `Found ${nearbyTransactions.length} transaction(s) by time proximity (no direct taskId match in metadata). Task created at ${new Date(taskTime).toISOString()}`;
            } else {
              // Still no match - check all transactions more broadly
              // First, get user info from the transaction if we can find any clues
              const allImageTx = allTransactions.filter((tx: any) => 
                tx.transaction_type === 'generation_deduction' && 
                tx.generation_type === 'nanoBananaImage'
              );
              
              // Show recent transactions for debugging
              const recentImageTx = allImageTx.slice(0, 10); // Last 10 image generation transactions
              
              if (recentImageTx.length > 0) {
                // Get user info for these transactions
                const userIds = [...new Set(recentImageTx.map((tx: any) => tx.user_id))];
                const { data: users } = await client
                  .from('bestauth_users')
                  .select('id, email, name')
                  .in('id', userIds);
                
                const userMap = new Map((users || []).map((u: any) => [u.id, u]));
                
                result.recentImageTransactions = recentImageTx.map((tx: any) => {
                  const user = userMap.get(tx.user_id);
                  return {
                    id: tx.id,
                    userId: tx.user_id,
                    userEmail: user?.email || 'Unknown',
                    userName: user?.name || null,
                    amount: tx.amount,
                    createdAt: tx.created_at,
                    timeDiffFromTask: Math.abs(new Date(tx.created_at).getTime() - taskTime),
                    timeDiffDays: (Math.abs(new Date(tx.created_at).getTime() - taskTime) / (1000 * 60 * 60 * 24)).toFixed(1),
                    metadata: tx.metadata,
                    description: tx.description,
                  };
                });
                
                result.note = `No transactions found within 10 minutes of task creation. Task created at ${new Date(taskTime).toISOString()}. Showing recent image generation transactions for reference.`;
                result.warning = 'This task may not have deducted credits, or the transaction was created at a different time than expected.';
              }
              
              // Also check if there are any transactions with empty or missing metadata that could be this task
              const transactionsWithoutTaskId = allImageTx.filter((tx: any) => {
                const meta = tx.metadata || {};
                return !meta.taskId && !meta.task_id && !meta.taskID;
              });
              
              if (transactionsWithoutTaskId.length > 0) {
                result.transactionsWithoutTaskId = transactionsWithoutTaskId.slice(0, 5).map((tx: any) => ({
                  id: tx.id,
                  userId: tx.user_id,
                  amount: tx.amount,
                  createdAt: tx.created_at,
                  description: tx.description,
                  metadata: tx.metadata,
                }));
                result.note += ` Found ${transactionsWithoutTaskId.length} image generation transaction(s) without taskId in metadata.`;
              }
            }
          }
        }

        // Get user from first transaction if found
        if (result.transactions.length > 0) {
          const firstTx = result.transactions[0];
          const { data: user } = await client
            .from('bestauth_users')
            .select('id, email, name')
            .eq('id', firstTx.user_id)
            .single();

          if (user) {
            result.user = user;
          }

          // Check if credit cost is correct
          const { PRICING_CONFIG } = await import('@/config/pricing.config');
          const expectedCost = PRICING_CONFIG.generationCosts.nanoBananaImage;
          const actualCost = Math.abs(firstTx.amount || 0);
          
          result.creditCheck = {
            expectedCost,
            actualCost,
            isCorrect: actualCost === expectedCost,
            transactionAmount: firstTx.amount,
            generationType: firstTx.generation_type,
          };
        }
      }

      return NextResponse.json(result);
    } catch (error: any) {
      result.kieApiError = error.message;

      // Still check transactions
      const { data: allTx } = await client
        .from('bestauth_points_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (allTx) {
        result.transactions = allTx.filter((tx: any) => {
          const meta = tx.metadata || {};
          const desc = tx.description || '';
          return (
            meta.taskId === taskId ||
            meta.task_id === taskId ||
            desc.includes(taskId) ||
            (meta.taskId && String(meta.taskId) === taskId)
          );
        });

        // Get user from first transaction if found
        if (result.transactions.length > 0) {
          const firstTx = result.transactions[0];
          const { data: user } = await client
            .from('bestauth_users')
            .select('id, email, name')
            .eq('id', firstTx.user_id)
            .single();

          if (user) {
            result.user = user;
          }
        }
      }

      return NextResponse.json(result);
    }
  } catch (error: unknown) {
    console.error('Admin check task error:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check task status' },
      { status: 500 }
    );
  }
}

