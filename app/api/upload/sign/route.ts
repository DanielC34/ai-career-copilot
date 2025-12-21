import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createSignedUploadUrl } from '@/lib/storage';

/**
 * POST /api/upload/sign
 * 
 * Generates a signed upload URL for a specific file.
 * This allows the frontend to upload directly to Supabase
 * without needing RLS write policies.
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id as string;

        // 2. Get file details from request
        const { fileName, fileType } = await req.json();

        if (!fileName) {
            return NextResponse.json({ error: 'File name is required' }, { status: 400 });
        }

        // 3. Generate the unique storage path
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `user_${userId}/${timestamp}_${sanitizedFileName}`;

        console.log('[Sign Upload] Generating URL for path:', storagePath);

        // 4. Create the signed upload URL using service key (Admin)
        const result = await createSignedUploadUrl(storagePath);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // 5. Return the token and path to the frontend
        return NextResponse.json({
            token: result.token,
            path: result.path,
            url: result.url,
            storagePath: storagePath
        });

    } catch (error) {
        console.error('[Sign Upload] Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal server error'
        }, { status: 500 });
    }
}
