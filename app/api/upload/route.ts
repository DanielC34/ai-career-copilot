/**
 * Upload API Route
 * 
 * Handles secure file uploads for resume files.
 * 
 * Flow:
 * 1. Authenticates the user
 * 2. Validates the uploaded file (type, size)
 * 3. Uploads to Supabase Storage  
 * 4. Saves metadata to MongoDB
 * 5. Returns file ID and URL
 * 
 * Security:
 * - Requires authentication
 * - Server-side validation
 * - Uses Supabase service client (server-only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Resume from '@/models/Resume';
import { uploadResume, validateFile } from '@/lib/storage';
import type { UploadResponse } from '@/types/resume';

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Parse form data
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // 3. Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        // 4. Upload to Supabase Storage
        // @ts-expect-error - session.user.id is added in auth.ts
        const userId = session.user.id as string;
        const uploadResult = await uploadResume(file, userId);

        if (!uploadResult.success || !uploadResult.path) {
            return NextResponse.json(
                { success: false, error: uploadResult.error || 'Upload failed' },
                { status: 500 }
            );
        }

        // 5. Save metadata to MongoDB
        await connectToDatabase();

        const resume = await Resume.create({
            userId,
            fileName: file.name,
            storagePath: uploadResult.path,
            publicUrl: uploadResult.url || null,
            size: file.size,
            mimeType: file.type,
            uploadedAt: new Date(),
            extractedText: null,
            processed: false,
        });

        // 6. Return success response
        return NextResponse.json(
            {
                success: true,
                fileId: resume._id.toString(),
                url: uploadResult.url,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}

/**
 * GET endpoint to list user's uploaded resumes
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // @ts-expect-error - session.user.id is added in auth.ts
        const resumes = await Resume.find({ userId: session.user.id })
            .sort({ uploadedAt: -1 })
            .select('fileName size mimeType uploadedAt publicUrl processed');

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error('List resumes error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
