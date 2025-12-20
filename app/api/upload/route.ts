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

        console.log('[Upload API] Request received');

        // Log Headers (safely)
        const headers = Object.fromEntries(req.headers.entries());
        console.log('[Upload API] Request Headers:', {
            'content-type': headers['content-type'],
            'content-length': headers['content-length'],
            'user-agent': headers['user-agent']
        });

        // 2. Parse form data
        const formData = await req.formData();

        // Log FormData keys
        console.log('[Upload API] FormData keys:', Array.from(formData.keys()));

        const file = formData.get('file') as File | null;

        if (!file) {
            console.error('[Upload API] No file found in FormData');
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        console.log('[Upload API] File object received:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

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

        console.log('[Upload API] Calling uploadResume with userId:', userId);
        const uploadResult = await uploadResume(file, userId);
        console.log('[Upload API] Upload result:', uploadResult);

        if (!uploadResult.success || !uploadResult.path) {
            console.error('[Upload API] Upload failed:', uploadResult.error);
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
            // New ATS fields
            structuredData: null,
            atsScore: null,
            lastEditedAt: null,
            selectedTemplate: 'modern-clean', // Default template
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

        const resumes = await Resume.find({ userId: session.user.id as string })
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
