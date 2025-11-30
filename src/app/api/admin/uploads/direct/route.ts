import { requireAdmin } from '@/lib/admin/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

// TODO: This route requires image-upload.config and r2 storage service
// These dependencies are not yet available in this project.
// To enable this feature:
// 1. Create src/config/image-upload.config.ts with upload configuration
// 2. Create src/lib/storage/r2.ts with R2 storage service implementation
// 3. Configure Cloudflare R2 credentials in environment variables

export async function POST(request: Request) {
  try {
    await requireAdmin();

    // Return 501 Not Implemented until dependencies are available
    return NextResponse.json(
      {
        error: 'Direct upload feature is not yet implemented. Missing image-upload.config and r2 storage service.',
        note: 'This feature requires additional configuration files and storage service setup.',
      },
      { status: 501 }
    );
  } catch (error) {
    console.error('Admin direct upload failed:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again later.' }, { status: 500 });
  }
}
