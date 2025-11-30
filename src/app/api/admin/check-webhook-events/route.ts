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

    const nov27Start = new Date('2025-11-27T00:00:00Z');

    // Note: paymentEvent table may not exist in this project
    // Using bestauth_points_transactions as alternative
    const { data: events, error } = await client
      .from('bestauth_points_transactions')
      .select('*')
      .gte('created_at', nov27Start.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      total: events?.length || 0,
      events: (events || []).map((e: any) => ({
        id: e.id,
        eventType: e.transaction_type || 'unknown',
        status: 'completed',
        createdAt: e.created_at,
        metadata: e.metadata || {},
      })),
      note: 'Using bestauth_points_transactions instead of paymentEvent table',
    });
  } catch (error) {
    console.error('Check webhook events error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
