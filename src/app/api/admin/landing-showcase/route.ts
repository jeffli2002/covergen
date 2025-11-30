import { randomUUID } from 'node:crypto';
import { SHOWCASE_CATEGORIES } from '@/config/showcase.config';
import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    await requireAdmin();
    
    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: entries, error } = await client
      .from('landing_showcase_entries')
      .select('*')
      .order('sort_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load landing showcase entries:', error);
      return NextResponse.json({ success: false, error: 'Failed to load entries' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entries: entries || [] });
  } catch (error) {
    console.error('Failed to load landing showcase entries:', error);
    return NextResponse.json({ success: false, error: 'Failed to load entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { imageUrl, title, subtitle, category, ctaUrl, isVisible = true } = body ?? {};

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (category && !SHOWCASE_CATEGORIES.some((item) => item.id === category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Get max sort_order
    const { data: maxRows, error: maxError } = await client
      .from('landing_showcase_entries')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1);

    if (maxError && maxError.code !== 'PGRST116') {
      console.error('Error getting max sort_order:', maxError);
      return NextResponse.json({ error: 'Failed to get next order' }, { status: 500 });
    }

    const nextOrder = (maxRows && maxRows.length > 0 ? (maxRows[0].sort_order || 0) : 0) + 1;

    const { data: created, error: insertError } = await client
      .from('landing_showcase_entries')
      .insert({
        id: randomUUID(),
        image_url: imageUrl,
        title,
        subtitle: subtitle || null,
        category: category || null,
        cta_url: ctaUrl || null,
        is_visible: Boolean(isVisible),
        sort_order: nextOrder,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create landing showcase entry:', insertError);
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true, entry: created });
  } catch (error) {
    console.error('Failed to create landing showcase entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
