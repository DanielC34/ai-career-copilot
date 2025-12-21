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
import { supabaseServiceClient, STORAGE_BUCKET } from '@/lib/supabase';
import type { UploadResponse } from '@/types/resume';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // 1. Authenticate user
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id as string;

        // 2. Parse JSON body (Step 4)
        // We no longer accept raw files here.
        const body = await request.json();
        const { storagePath, fileName, size, mimeType } = body;

        console.log('[Upload API] Received reference handoff:', {
            storagePath,
            fileName,
            userId
        });

        if (!storagePath) {
            return NextResponse.json(
                { success: false, error: 'Storage path is required' },
                { status: 400 }
            );
        }

        // 3. Validate existence in Supabase (Scalability/Safety check)
        // We check if the file actually exists where the client says it does
        if (!supabaseServiceClient) {
            throw new Error('Supabase service client not configured');
        }

        const { data: fileExists, error: listError } = await supabaseServiceClient.storage
            .from(STORAGE_BUCKET)
            .list(storagePath.split('/').slice(0, -1).join('/'), {
                search: storagePath.split('/').pop()
            });

        if (listError || !fileExists || fileExists.length === 0) {
            console.error('[Upload API] File validation failed:', listError || 'File not found in storage');
            return NextResponse.json(
                { success: false, error: 'Invalid file reference. File not found in storage.' },
                { status: 400 }
            );
        }

        // 4. Save metadata to MongoDB (The "Logbook")
        await connectToDatabase();

        const resume = await Resume.create({
            userId,
            fileName: fileName || 'Untitled Resume',
            storagePath: storagePath,
            publicUrl: null, // We keep it private for now
            size: size || 0,
            mimeType: mimeType || 'application/pdf',
            uploadedAt: new Date(),
            processed: false,
            status: 'processing' // Immediate status response
        });

        console.log('[Upload API] Metadata saved. Resume ID:', resume._id);

        // 5. Immediate response (Step 4 Requirement)
        // We don't wait for AI or parsing here. 
        // We respond immediately so the user doesn't wait for a slow request.
        return NextResponse.json(
            {
                success: true,
                status: 'processing',
                fileId: resume._id.toString(),
                storagePath: resume.storagePath
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('[Upload API] Critical error:', error);
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
