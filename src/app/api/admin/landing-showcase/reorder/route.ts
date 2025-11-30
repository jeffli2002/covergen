import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    await Promise.all(
      ids.map((id, index) =>
        client
          .from('landing_showcase_entries')
          .update({ sort_order: index + 1, updated_at: new Date().toISOString() })
          .eq('id', id)
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder landing showcase entries:', error);
    return NextResponse.json({ error: 'Failed to reorder entries' }, { status: 500 });
  }
}
