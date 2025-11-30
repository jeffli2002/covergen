import { SHOWCASE_CATEGORIES } from '@/config/showcase.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function PATCH(request: NextRequest, { params }: { params: { entryId: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, subtitle, category, ctaUrl, isVisible } = body ?? {};
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof title === 'string') {
      updates.title = title;
    }
    if (typeof subtitle === 'string') {
      updates.subtitle = subtitle;
    }
    if (typeof ctaUrl === 'string') {
      updates.cta_url = ctaUrl;
    }
    if (typeof isVisible === 'boolean') {
      updates.is_visible = isVisible;
    }
    if (category) {
      if (!SHOWCASE_CATEGORIES.some((item) => item.id === category)) {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
      updates.category = category;
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: updated, error } = await client
      .from('landing_showcase_entries')
      .update(updates)
      .eq('id', params.entryId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
      }
      console.error('Failed to update landing showcase entry:', error);
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: updated });
  } catch (error) {
    console.error('Failed to update landing showcase entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { entryId: string } }) {
  try {
    await requireAdmin();
    
    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { error } = await client
      .from('landing_showcase_entries')
      .delete()
      .eq('id', params.entryId);

    if (error) {
      console.error('Failed to delete landing showcase entry:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete landing showcase entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
