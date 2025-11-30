import { requireAdmin } from '@/lib/admin/auth';
import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    await requireAdmin();

    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Check if credit_pack_purchase table exists
    const { data: tableCheck, error: tableError } = await client
      .rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'credit_pack_purchase';
        `
      });

    // Note: Supabase doesn't support direct SQL execution via RPC by default
    // This migration should be run via Supabase SQL Editor instead
    // For now, we'll just return a message

    return NextResponse.json({
      success: true,
      message: 'Migration check completed. Please run SQL migrations via Supabase SQL Editor.',
      note: 'This endpoint cannot execute DDL statements directly. Use Supabase Dashboard SQL Editor to run migrations.',
    });
  } catch (error: unknown) {
    console.error('Migration error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
