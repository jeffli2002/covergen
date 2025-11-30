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

    const { data: purchases, error } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      purchases: (purchases || []).map((p: any) => ({
        id: p.id,
        credits: p.points || 0,
        createdAt: p.created_at,
        metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || null),
      })),
    });
  } catch (error) {
    console.error('Debug purchases error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
