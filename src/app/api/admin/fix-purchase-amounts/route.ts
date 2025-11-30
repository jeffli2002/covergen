import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get purchase transactions from bestauth_points_transactions
    const { data: purchaseTransactions, error } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: true });

    if (error) throw error;

    let backfilled = 0;
    let skippedTest = 0;
    let skippedDuplicate = 0;
    const details: Array<{
      orderId: string;
      credits: number;
      amount: number;
      date: string;
    }> = [];
    const processedOrderIds = new Set<string>();

    for (const transaction of purchaseTransactions || []) {
      const metadata = typeof transaction.metadata === 'string'
        ? JSON.parse(transaction.metadata)
        : (transaction.metadata || {});

      const orderId = metadata.orderId || null;
      const checkoutId = metadata.checkoutId || null;

      if (!orderId) {
        console.log('Skipping transaction without orderId:', transaction.id);
        continue;
      }

      if (processedOrderIds.has(orderId)) {
        console.log('Skipping duplicate orderId:', orderId);
        skippedDuplicate++;
        continue;
      }
      processedOrderIds.add(orderId);

      const testOrderIds = ['ord_670xalRBUI9iMZXla19Xqy', 'ord_2lpCdbTAyqb1Utf2CUU8Yg'];

      const isTestMode =
        orderId.startsWith('ord_test_') ||
        checkoutId?.startsWith('ch_test_') ||
        testOrderIds.includes(orderId);

      if (isTestMode) {
        console.log('Marking as test mode purchase:', orderId);
        skippedTest++;
      }

      const credits = transaction.points || 0;
      const currency = metadata.currency || 'USD';

      const amountCents =
        credits === 10000
          ? 27000
          : credits === 5000
            ? 13500
            : credits === 2000
              ? 6000
              : credits === 1000
                ? 3000
                : credits === 300
                  ? 449
                  : credits === 100
                    ? 330
                    : 0;

      // Update metadata with amount_cents if needed
      const updatedMetadata = {
        ...metadata,
        amount_cents: amountCents,
        test_mode: isTestMode,
      };

      // Update the transaction metadata
      await client
        .from('bestauth_points_transactions')
        .update({ metadata: updatedMetadata })
        .eq('id', transaction.id);

      details.push({
        orderId,
        credits,
        amount: amountCents / 100,
        date: transaction.created_at,
      });

      backfilled++;
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${backfilled} purchase amounts (skipped ${skippedTest} test mode, ${skippedDuplicate} duplicates)`,
      backfilled,
      skippedTest,
      skippedDuplicate,
      details,
    });
  } catch (error) {
    console.error('Fix amounts error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
