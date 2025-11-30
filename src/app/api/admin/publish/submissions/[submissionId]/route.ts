import { SHOWCASE_CATEGORIES } from '@/config/showcase.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const admin = await requireAdmin();
    const id = params.submissionId;
    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get existing submission
    const { data: submission, error: fetchError } = await client
      .from('publish_submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }
      console.error('Error fetching submission:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
    }

    const body = await request.json();
    const { status, publishToLanding, publishToShowcase, category, adminNotes, rejectionReason } =
      body ?? {};

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      status,
      updated_at: now,
      reviewed_at: now,
      reviewed_by: admin.email,
      admin_notes: typeof adminNotes === 'string' ? adminNotes : null,
    };

    if (status === 'approved') {
      if (category && !SHOWCASE_CATEGORIES.some((item) => item.id === category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      const landingFlag =
        typeof publishToLanding === 'boolean' ? publishToLanding : submission.publish_to_landing;
      const showcaseFlag =
        typeof publishToShowcase === 'boolean'
          ? publishToShowcase
          : submission.publish_to_showcase || landingFlag;

      updateData.publish_to_landing = landingFlag;
      updateData.publish_to_showcase = showcaseFlag;
      updateData.category = category || null;
      updateData.approved_at = now;
      updateData.rejected_at = null;
      updateData.rejection_reason = null;

      if (landingFlag) {
        const existingOrder = submission.landing_order;
        if (existingOrder && existingOrder > 0) {
          updateData.landing_order = existingOrder;
        } else {
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

          const nextOrder = (maxRows && maxRows.length > 0 ? (maxRows[0].landing_order || 0) : 0) + 1;
          updateData.landing_order = nextOrder;
        }
      } else {
        updateData.landing_order = null;
      }
    } else {
      updateData.publish_to_landing = false;
      updateData.publish_to_showcase = false;
      updateData.category = null;
      updateData.landing_order = null;
      updateData.rejection_reason =
        typeof rejectionReason === 'string' && rejectionReason.trim().length > 0
          ? rejectionReason
          : 'Rejected by admin review';
      updateData.rejected_at = now;
      updateData.approved_at = null;
    }

    const { data: updated, error: updateError } = await client
      .from('publish_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update submission:', updateError);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    return NextResponse.json({ success: true, submission: updated });
  } catch (error) {
    console.error('Failed to update submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
