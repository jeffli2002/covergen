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
      const { data: allTransactions } = await client
        .from('bestauth_points_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (allTransactions) {
        result.transactions = allTransactions.filter((tx: any) => {
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

