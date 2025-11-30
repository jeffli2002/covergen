import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get purchase transactions (transaction_type = 'purchase')
    // Note: creditPackPurchase table may not exist, using points_transactions instead
    const { data: purchaseTransactions, error } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      creditPackPurchases: [], // Table may not exist yet
      purchaseTransactions: purchaseTransactions || [],
    });
  } catch (error: unknown) {
    console.error('Check purchases error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
