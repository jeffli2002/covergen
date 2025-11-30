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
    const { data: purchases, error } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: true });

    if (error) throw error;

    const nov27 = (purchases || []).filter((p: any) => {
      const date = new Date(p.created_at);
      return date.getUTCDate() === 27 && date.getUTCMonth() === 10;
    });

    return NextResponse.json({
      total: purchases?.length || 0,
      nov27Total: nov27.length,
      uniqueOrders: new Set(
        (purchases || [])
          .map((p: any) => {
            const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {});
            return meta.orderId;
          })
          .filter(Boolean)
      ).size,
      allPurchases: (purchases || []).map((p: any) => {
        const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {});
        return {
          transactionId: p.id,
          orderId: meta.orderId,
          checkoutId: meta.checkoutId,
          credits: p.amount,
          createdAt: p.created_at,
          productName: meta.productName,
        };
      }),
      nov27Purchases: nov27.map((p: any) => {
        const meta = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {});
        return {
          transactionId: p.id,
          orderId: meta.orderId,
          checkoutId: meta.checkoutId,
          credits: p.amount,
          createdAt: p.created_at,
          productName: meta.productName,
        };
      }),
    });
  } catch (error: unknown) {
    console.error('Admin all transactions error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}
