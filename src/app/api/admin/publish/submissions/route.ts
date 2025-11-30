import { SHOWCASE_CATEGORIES } from '@/config/showcase.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    void admin;

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status') || 'pending';
    const limitParam = Number.parseInt(searchParams.get('limit') || '50', 10);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50;

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const allowedStatuses = ['pending', 'approved', 'rejected'] as const;
    const status = statusParam === 'all' || !allowedStatuses.includes(statusParam as (typeof allowedStatuses)[number])
      ? undefined
      : statusParam as (typeof allowedStatuses)[number];

    let query = client
      .from('publish_submissions')
      .select(`
        *,
        bestauth_users!inner (
          id,
          email,
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error('Failed to fetch publish submissions:', error);
      return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      submissions: (rows || []).map((row: any) => {
        const user = Array.isArray(row.bestauth_users) ? row.bestauth_users[0] : row.bestauth_users;
        return {
          ...row,
          user: user || null,
          categoryLabel:
            SHOWCASE_CATEGORIES.find((category) => category.id === row.category)?.label ??
            'Showcase',
        };
      }),
    });
  } catch (error) {
    console.error('Failed to fetch publish submissions:', error);
    return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
  }
}
