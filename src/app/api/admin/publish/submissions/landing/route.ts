import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const submissionId: string | undefined = body?.submissionId;
    const publishToLanding: boolean = Boolean(body?.publishToLanding);

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const updateData: Record<string, unknown> = {
      publish_to_landing: publishToLanding,
      updated_at: new Date().toISOString(),
    };

    if (publishToLanding) {
      // Get max landing_order
      const { data: maxRows, error: maxError } = await client
        .from('publish_submissions')
        .select('landing_order')
        .order('landing_order', { ascending: false })
        .limit(1);

      if (maxError && maxError.code !== 'PGRST116') {
        console.error('Error getting max landing_order:', maxError);
        return NextResponse.json({ error: 'Failed to get next order' }, { status: 500 });
      }

      updateData.landing_order = (maxRows && maxRows.length > 0 ? (maxRows[0].landing_order || 0) : 0) + 1;
    } else {
      updateData.landing_order = null;
    }

    const { data: updated, error: updateError } = await client
      .from('publish_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
      console.error('Failed to toggle landing submission:', updateError);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error('Failed to toggle landing submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
